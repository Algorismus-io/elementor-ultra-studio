/**
 * measure.mjs — the site-clone measurement toolkit as ONE command family.
 *
 * Field incident (2026-08 forensic audit of a pixel-faithful clone run): the agent hand-rolled
 * EIGHT one-off scripts (~15k chars of playwright + PIL, plus a zsh-heredoc mangling and a
 * BSD-sed incompatibility on the way) for captures, section scans, font paint probes and
 * side-by-side sheets — tasks EVERY clone run needs. These modes replace all of them:
 *
 *   shots     scroll-settled screenshots per width           (kills the hand-rolled cap.mjs family)
 *   sections  top-level layout rhythm: {sel, top, height}    (kills the ad-hoc section scanners)
 *   geom      boundingClientRect + key computed styles       (kills one-off rect probes)
 *   ink       Range-based text ink vs the element box        (nowrap escapes, letter-spacing drift)
 *   fonts     which families ACTUALLY painted                (kills the hand-rolled fonts.mjs probe)
 *   compare   side-by-side band sheets + per-band |Δ| table  (kills the PIL montage scripts)
 *   copytext  deduped, attributed copy from saved HTML       (kills raw-text dumps into context)
 *
 * All page modes launch ONE browser per invocation and run the pixeldiff scroll-settle before any
 * read — WP themes ship scroll-behavior:smooth, so an un-neutralized scrollTo animates and both
 * captures and rect reads land mid-glide; the sweep also fires lazy loaders and reveal animations
 * so geometry is final. Image math is python3+PIL via generated scripts (fast, no native npm deps).
 */
import { resolvePlaywright } from './env.mjs';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

async function launch() {
  const pwPath = resolvePlaywright();
  if (!pwPath) throw new Error('playwright not found — npm i playwright or set EXJSX_IT_PLAYWRIGHT');
  const { chromium } = await import('file://' + pwPath.replace(/^file:\/\//, ''));
  return chromium.launch();
}

const resolveUrl = (env, p) => (p.startsWith('http') ? p : env.url + p);

/** Copy of pixeldiff's settle: neutralize smooth scrolling, sweep the page, finish animations. */
async function settle(pg) {
  await pg.evaluate(async () => {
    const st = document.createElement('style'); st.textContent = 'html,body{scroll-behavior:auto!important}'; document.head.appendChild(st);
    for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); }
    window.scrollTo(0, 0);
    document.getAnimations().forEach((a) => { try { a.finish(); } catch {} });
    await new Promise((r) => setTimeout(r, 300));
  });
}

async function openSettled(browser, url, width, height = 900) {
  const pg = await browser.newPage({ viewport: { width, height } });
  await pg.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await settle(pg);
  return pg;
}

function refDims(pngPath) {
  return execFileSync('python3', ['-c', `
from PIL import Image; import sys
im = Image.open(sys.argv[1]); print(im.width, im.height)`, pngPath], { encoding: 'utf8' }).trim().split(' ').map(Number);
}

/**
 * shots — scroll-settled screenshots at each width. fullPage by default: unlike pixeldiff (which
 * must never DIFF against a fullPage capture — bottoms drop image paint), these are for eyes, and
 * the settle sweep has already forced lazy paint before capture. --crop takes a document-space
 * region instead.
 */
export async function shots(env, { pageUrl, widths, outDir = null, crop = null }) {
  const browser = await launch();
  const dir = outDir || mkdtempSync(join(tmpdir(), 'eu-shots-'));
  mkdirSync(dir, { recursive: true });
  const url = resolveUrl(env, pageUrl);
  const out = [];
  try {
    for (const width of widths) {
      const pg = await openSettled(browser, url, width);
      const pageHeight = await pg.evaluate(() => document.body.scrollHeight);
      const path = join(dir, `shot-${width}${crop ? `-${crop[0]}x${crop[1]}` : ''}.png`);
      if (crop) {
        // playwright clips in VIEWPORT coordinates — a document-space y past the fold captures
        // blank. Scroll the region's top into view first, then clip relative to the real scrollY.
        const [x, y, w, h] = crop;
        const actual = await pg.evaluate((t) => { window.scrollTo(0, t); return window.scrollY; }, y);
        await pg.waitForTimeout(250);
        await pg.screenshot({ path, clip: { x, y: y - actual, width: w, height: h } });
      } else {
        await pg.screenshot({ path, fullPage: true });
      }
      out.push({ width, path, pageHeight });
      await pg.close();
    }
  } finally { await browser.close(); }
  return { url, dir, shots: out };
}

/**
 * sections — the page's vertical rhythm in one scan, for aligning section tops/heights to a
 * reference. Root = descend from body while exactly one child still spans ≥80% of the page
 * (WP wraps content in #page>main>.elementor chains); the fan-out level IS the section list.
 * Also sweeps `section, [class*=section], .e-con` at depth ≤2 for semantic sections living
 * outside that chain (header/footer siblings). Deduped by box, sorted by top, capped at 60.
 */
export async function sections(env, { pageUrl, width = 1512 }) {
  const browser = await launch();
  const url = resolveUrl(env, pageUrl);
  try {
    const pg = await openSettled(browser, url, width);
    const rep = await pg.evaluate(() => {
      const cls1 = (el) => {
        const cn = typeof el.className === 'string' ? el.className : (el.getAttribute('class') || '');
        return cn.trim() ? '.' + cn.trim().split(/\s+/)[0] : (el.id ? '#' + el.id : '');
      };
      const name = (el) => el.tagName.toLowerCase() + cls1(el);
      const pageH = document.body.scrollHeight;
      const vis = (el) => {
        const cs = getComputedStyle(el);
        return cs.display !== 'none' && cs.visibility !== 'hidden' && el.getBoundingClientRect().height > 1;
      };
      let root = document.body;
      for (let i = 0; i < 8; i++) {
        const spanning = [...root.children].filter((c) => vis(c) && c.getBoundingClientRect().height >= pageH * 0.8);
        if (spanning.length === 1 && spanning[0].children.length) root = spanning[0]; else break;
      }
      const vw = document.documentElement.clientWidth;
      const found = [];
      const add = (el, fromSweep) => {
        if (!vis(el)) return;
        const r = el.getBoundingClientRect();
        if (r.height < 8 || r.height >= pageH * 0.95) return; // pixel shims / the page wrapper aren't sections
        // sweep matches are supplementary (header/footer, semantic <section>s outside the root
        // chain) — hold them to full-bleed-band shape so nested content rows/dividers that happen
        // to carry .e-con or a *section* class don't flood the rhythm scan
        if (fromSweep && (r.height < 80 || r.width < vw * 0.9)) return;
        const cs = getComputedStyle(el);
        found.push({ sel: name(el), top: Math.round(r.top + window.scrollY), height: Math.round(r.height),
          fromSweep, pinned: cs.position === 'fixed' || cs.position === 'sticky' || cs.position === 'absolute' });
      };
      for (const c of root.children) add(c, false);
      for (const el of document.querySelectorAll('section, [class*=section], .e-con')) {
        let d = 0, cur = el;
        while (cur && cur !== root && cur !== document.body && d <= 2) { cur = cur.parentElement; d++; }
        if (cur && d <= 2) add(el, true);
      }
      found.sort((a, b) => a.top - b.top || b.height - a.height);
      // merge near-duplicate boxes: a section and its sole full-height child (or a wrapper 2px of
      // padding away) are ONE section — without this every Elementor band reports twice
      const merged = [];
      for (const s of found) {
        const dup = merged.find((m) => Math.abs(m.top - s.top) <= 8 && Math.abs(m.height - s.height) <= 24);
        if (dup) continue;
        // a sweep match fully inside a root-child section is that section's CONTENT, not a peer
        // section — except pinned/overlay bars (a fixed or absolute header legitimately sits ON
        // the hero; the rebuild must reproduce it as its own band)
        if (s.fromSweep && !s.pinned && found.some((o) => !o.fromSweep
          && s.top >= o.top - 2 && s.top + s.height <= o.top + o.height + 2 && o.height > s.height)) continue;
        merged.push(s);
      }
      return { root: name(root), pageHeight: pageH, sections: merged.slice(0, 60).map(({ sel, top, height }) => ({ sel, top, height })) };
    });
    return { url, width, ...rep };
  } finally { await browser.close(); }
}

/** geom — boundingClientRect (document-space y) + the computed styles that explain layout drift. */
export async function geom(env, { pageUrl, selector, width = 1512, all = false }) {
  const browser = await launch();
  const url = resolveUrl(env, pageUrl);
  try {
    const pg = await openSettled(browser, url, width);
    const elements = await pg.evaluate(({ sel, wantAll }) => {
      const cls1 = (el) => {
        const cn = typeof el.className === 'string' ? el.className : (el.getAttribute('class') || '');
        return cn.trim() ? '.' + cn.trim().split(/\s+/)[0] : (el.id ? '#' + el.id : '');
      };
      const els = wantAll ? [...document.querySelectorAll(sel)].slice(0, 40) : [document.querySelector(sel)].filter(Boolean);
      return els.map((el) => {
        const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
        return {
          sel: el.tagName.toLowerCase() + cls1(el),
          x: Math.round(r.x), y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height),
          display: cs.display, position: cs.position,
          fontFamily: cs.fontFamily.slice(0, 80), fontSize: cs.fontSize,
        };
      });
    }, { sel: selector, wantAll: all });
    return { url, width, selector, matches: elements.length, elements };
  } finally { await browser.close(); }
}

/**
 * ink — Range-based ink extents of an element's text vs its box. The element box CANNOT see a
 * nowrap line painting past it (the box stays "inside" while the glyphs escape — same blindness
 * quickverify works around for rotated cards); the range's client rects are the per-line ink,
 * so ink-minus-box exposes nowrap escapes and letter-spacing drift directly.
 */
export async function ink(env, { pageUrl, selector, width = 1512 }) {
  const browser = await launch();
  const url = resolveUrl(env, pageUrl);
  try {
    const pg = await openSettled(browser, url, width);
    const rep = await pg.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cls1 = (e) => {
        const cn = typeof e.className === 'string' ? e.className : (e.getAttribute('class') || '');
        return cn.trim() ? '.' + cn.trim().split(/\s+/)[0] : (e.id ? '#' + e.id : '');
      };
      const rd = (v) => Math.round(v * 10) / 10;
      const sy = window.scrollY;
      const r = el.getBoundingClientRect();
      const box = { x: rd(r.x), y: rd(r.y + sy), w: rd(r.width), h: rd(r.height) };
      const rng = document.createRange(); rng.selectNodeContents(el);
      const rects = [...rng.getClientRects()].filter((x) => x.width > 0.5 && x.height > 0.5);
      let L = Infinity, R = -Infinity, T = Infinity, B = -Infinity;
      for (const x of rects) { L = Math.min(L, x.left); R = Math.max(R, x.right); T = Math.min(T, x.top); B = Math.max(B, x.bottom); }
      const out = { sel: el.tagName.toLowerCase() + cls1(el), box, ink: null, escape: null, lines: [] };
      if (R !== -Infinity) {
        out.ink = { x: rd(L), y: rd(T + sy), w: rd(R - L), h: rd(B - T) };
        // >0 on any side = ink painted OUTSIDE the element box on that side
        out.escape = { left: rd(r.left - L), right: rd(R - r.right), top: rd(r.top - T), bottom: rd(B - r.bottom) };
        out.lines = rects.slice(0, 30).map((x) => ({ x: rd(x.left), y: rd(x.top + sy), w: rd(x.width), h: rd(x.height) }));
      }
      return out;
    }, selector);
    return { url, width, selector, ...(rep || { error: 'no match' }) };
  } finally { await browser.close(); }
}

/**
 * fonts — which font families ACTUALLY painted. @font-face presence and even document.fonts
 * 'loaded' status both lie when the file 404s or CSS misspells the family; the truth is metric:
 * a family that failed falls through to its appended generic, so a sample string renders at
 * EXACTLY that generic's width. Probe against BOTH serif and monospace — a custom face can be
 * metric-compatible with one generic by coincidence, never both.
 */
export async function fonts(env, { pageUrl, width = 1512 }) {
  const browser = await launch();
  const url = resolveUrl(env, pageUrl);
  try {
    const pg = await openSettled(browser, url, width);
    const families = await pg.evaluate(() => {
      const cls1 = (el) => {
        const cn = typeof el.className === 'string' ? el.className : (el.getAttribute('class') || '');
        return cn.trim() ? '.' + cn.trim().split(/\s+/)[0] : (el.id ? '#' + el.id : '');
      };
      const GENERIC = new Set(['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui',
        'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded', '-apple-system', 'blinkmacsystemfont']);
      const first = (ff) => ff.split(',')[0].trim().replace(/^["']|["']$/g, '');
      const fams = new Map();
      for (const el of document.querySelectorAll('body *')) {
        if (fams.size >= 15) break;
        // only elements with a DIRECT rendered text node — a wrapper's computed family that no
        // glyph ever uses is noise, not a painted family
        if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const f = first(cs.fontFamily);
        if (f && !fams.has(f.toLowerCase())) fams.set(f.toLowerCase(), { family: f, sample_el: el.tagName.toLowerCase() + cls1(el) });
      }
      const probe = document.createElement('span');
      probe.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;font-size:48px;white-space:nowrap;letter-spacing:0';
      probe.textContent = 'mmmWWWiiil 0123 fjord';
      document.body.appendChild(probe);
      const w = (ff) => { probe.style.fontFamily = ff; return probe.getBoundingClientRect().width; };
      const serifW = w('serif'), monoW = w('monospace');
      const out = [];
      for (const { family, sample_el } of fams.values()) {
        const generic = GENERIC.has(family.toLowerCase());
        const painted = generic
          || Math.abs(w(`"${family}", serif`) - serifW) > 0.5
          || Math.abs(w(`"${family}", monospace`) - monoW) > 0.5;
        const faces = [...document.fonts].filter((f) => f.family.replace(/^["']|["']$/g, '').toLowerCase() === family.toLowerCase());
        out.push({ family, painted, ...(generic ? { generic: true } : {}), sample_el,
          faces: { total: faces.length, loaded: faces.filter((f) => f.status === 'loaded').length } });
      }
      probe.remove();
      return out;
    });
    return { url, width, families };
  } finally { await browser.close(); }
}

/**
 * compare — ref vs ours, band by band: (a) side-by-side sheets (ref left, ours right, ~1/3 scale
 * — small enough to view inline) and (b) a per-band mean |Δ| table. If --ours is a page path/URL
 * it is captured first at the REF's width using pixeldiff's slice method (fullPage captures of
 * tall pages deterministically drop bottom-of-page image paint — never diff against one) and
 * stitched. Same |Δ| scale as pixeldiff: ≤3 near-identical · 3-8 faithful · 8-20 visible · >20 different.
 */
export async function compare(env, { ours, refPath, outDir = null, bandH = 900 }) {
  const dir = outDir || mkdtempSync(join(tmpdir(), 'eu-compare-'));
  mkdirSync(dir, { recursive: true });
  const [refW, refH] = refDims(refPath);
  const isPng = existsSync(ours) && /\.png$/i.test(ours);
  const slices = [];
  let pageH = 0;
  if (!isPng) {
    const browser = await launch();
    try {
      const pg = await openSettled(browser, resolveUrl(env, ours), refW);
      pageH = await pg.evaluate(() => document.body.scrollHeight);
      for (let y = 0; y < pageH; y += 900) {
        const target = Math.min(y, Math.max(0, pageH - 900));
        await pg.evaluate((t) => window.scrollTo(0, t), target);
        await pg.waitForTimeout(250);
        const actual = await pg.evaluate(() => window.scrollY);
        const p = join(dir, `ours-slice-${y}.png`);
        await pg.screenshot({ path: p, type: 'png' });
        slices.push({ path: p, scrollY: actual });
      }
    } finally { await browser.close(); }
  }
  const oursOut = isPng ? ours : join(dir, 'ours-stitched.png');
  const script = `
import json, sys
from PIL import Image
import numpy as np
cfg = json.load(open(sys.argv[1]))
ref = Image.open(cfg['ref']).convert('RGB')
if cfg['slices']:
    ours = Image.new('RGB', (cfg['width'], cfg['pageH']), 'white')
    for s in cfg['slices']:
        ours.paste(Image.open(s['path']).convert('RGB'), (0, int(s['scrollY'])))
    ours.save(cfg['oursOut'])
else:
    ours = Image.open(cfg['ours']).convert('RGB')
refG = np.array(ref.convert('L')).astype(int)
oursG = np.array(ours.convert('L')).astype(int)
W = min(ref.width, ours.width)
H = max(ref.height, ours.height)  # bands run over BOTH heights so a missing/extra tail is visible
band = cfg['band']
rows = []
total = 0.0; n = 0
for y0 in range(0, H, band):
    y1 = min(y0 + band, H)
    a = refG[y0:min(y1, ref.height), :W]
    b = oursG[y0:min(y1, ours.height), :W]
    h = min(a.shape[0], b.shape[0])
    mean = None
    if h > 0:
        d = np.abs(a[:h] - b[:h]).astype(float)
        mean = round(float(d.mean()), 2)
        total += float(d.sum()); n += d.size
    def crop(im):
        c = Image.new('RGB', (W, y1 - y0), 'white')
        if y0 < im.height:
            c.paste(im.crop((0, y0, W, min(y1, im.height))), (0, 0))
        return c
    sw, sh = max(1, W // 3), max(1, (y1 - y0) // 3)
    ra = crop(ref).resize((sw, sh)); oa = crop(ours).resize((sw, sh))
    sheet = Image.new('RGB', (sw * 2 + 8, sh), (255, 0, 0))
    sheet.paste(ra, (0, 0)); sheet.paste(oa, (sw + 8, 0))
    sp = cfg['dir'] + '/sheet-' + str(y0) + '.png'
    sheet.save(sp)
    rows.append({'y0': y0, 'mean': mean, 'sheet': sp})
print(json.dumps({'overall': round(total / max(n, 1), 2), 'refSize': [ref.width, ref.height],
                  'oursSize': [ours.width, ours.height], 'bands': rows}))`;
  const sp = join(dir, '_compare.py');
  writeFileSync(sp, script);
  const cfgPath = join(dir, '_compare.json');
  writeFileSync(cfgPath, JSON.stringify({ ref: refPath, ours: oursOut, oursOut, slices, width: refW, pageH, band: bandH, dir }));
  const out = execFileSync('python3', [sp, cfgPath], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  return { ref: refPath, ours: oursOut, dir, refSize: [refW, refH], ...JSON.parse(out.trim().split('\n').pop()) };
}

/**
 * copytext — deduped, attributed copy inventory from a SAVED HTML file. Field problem: agents
 * dump a page's raw innerText (~24k chars including lorem filler, cookie banners repeated per
 * breakpoint, and JSON-LD) straight into context; this strips script/style/head/svg/noscript/
 * template + hidden nodes, collapses whitespace, drops repeats and lorem-looking filler, and
 * prefixes every line with its source tag+class-head so copy can be traced back to its element.
 * Pure python3 html.parser — no bs4 dependency to install on a clean machine.
 */
export function copytext({ htmlPath, minLen = 3 }) {
  const script = `
import json, re, sys
from html.parser import HTMLParser

SKIP = {'script', 'style', 'head', 'noscript', 'template', 'svg', 'title', 'iframe'}
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
LOREM = re.compile(r'lorem\\s+ipsum|dolor\\s+sit\\s+amet|consectetur|adipiscing|eiusmod|incididunt', re.I)
MIN = int(sys.argv[2])

class Extract(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip = 0; self.hidden = 0; self.stack = []; self.out = []
        self.seen = set(); self.dupes = 0; self.lorem = 0
    def handle_starttag(self, tag, attrs):
        if tag in VOID: return  # void tags never close — pushing them would poison attribution
        a = dict(attrs)
        skipped = tag in SKIP
        hid = 'hidden' in a or bool(re.search(r'display\\s*:\\s*none|visibility\\s*:\\s*hidden', a.get('style') or ''))
        cls = ((a.get('class') or '').split() or [''])[0]
        self.stack.append((tag, cls, hid, skipped))
        if hid: self.hidden += 1
        if skipped: self.skip += 1
    def handle_endtag(self, tag):
        if tag in VOID: return
        # forgiving pop: real-world HTML leaves <p>/<li> unclosed — pop back to the match
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                for t, c, h, s in self.stack[i:]:
                    if h: self.hidden -= 1
                    if s: self.skip -= 1
                del self.stack[i:]
                return
    def handle_data(self, data):
        if self.skip or self.hidden: return
        text = re.sub(r'\\s+', ' ', data).strip()
        if len(text) < MIN: return
        if LOREM.search(text): self.lorem += 1; return
        key = text.lower()
        if key in self.seen: self.dupes += 1; return  # nav/footer/banner repeats collapse to one
        self.seen.add(key)
        tag, cls = (self.stack[-1][0], self.stack[-1][1]) if self.stack else ('body', '')
        self.out.append(tag + ('.' + cls if cls else '') + ' | ' + text)

src = open(sys.argv[1], encoding='utf-8', errors='replace').read()
p = Extract(); p.feed(src)
body = '\\n'.join(p.out)
print(json.dumps({'lines': p.out, 'chars': len(body), 'dropped': {'duplicates': p.dupes, 'lorem': p.lorem}}))`;
  const dir = mkdtempSync(join(tmpdir(), 'eu-copytext-'));
  const sp = join(dir, '_copytext.py');
  writeFileSync(sp, script);
  const out = execFileSync('python3', [sp, htmlPath, String(minLen)], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  return { html: htmlPath, rawChars: readFileSync(htmlPath, 'utf8').length, ...JSON.parse(out.trim().split('\n').pop()) };
}
