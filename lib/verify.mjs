/**
 * verify.mjs — one-shot pixel/layout verification for a built page. Turns the proven manual loop
 * (anchor deltas → luminance bands → mobile overflow) into a single command with JSON output, so a
 * build agent spends one tool call per convergence round instead of five.
 *
 * Anchors file (JSON):
 *   { "viewport": 1200,
 *     "anchors": [ { "name": "hero-h1", "selector": "h1", "y": 255 },
 *                  { "name": "signup-h2", "selector": "text=Get instant access", "y": 3660 } ],
 *     "bands":   [ { "name": "ticker", "y0": 930, "y1": 975, "minInkPx": 500 } ],
 *     "totalHeight": 4081 }
 *
 * `selector` is a CSS selector, or `text=…` for exact-text lookup among h1-h6/p/a/button/img[alt].
 * `y` targets are page-absolute design coordinates. Bands assert that a horizontal strip actually
 * PAINTS ink (catches dark-on-dark/invisible-asset bugs that DOM probes can't see — real incident:
 * black-at-50%-alpha logos composited to exactly 0 over a black section).
 */
import { resolvePlaywright } from './env.mjs';

export async function run(env, { pageUrl, anchorsPath, mobile = true, tolerance = 2 }) {
  const pwPath = resolvePlaywright();
  if (!pwPath) throw new Error('playwright not found — `npm i playwright` in your project, or set EXJSX_IT_PLAYWRIGHT to a playwright index.mjs');
  const { chromium } = await import('file://' + pwPath.replace(/^file:\/\//, ''));

  const { readFileSync } = await import('node:fs');
  const spec = JSON.parse(readFileSync(anchorsPath, 'utf8'));
  const viewport = spec.viewport || 1200;
  const url = pageUrl.startsWith('http') ? pageUrl : env.url + pageUrl;

  const browser = await chromium.launch();
  const result = { url, viewport, anchors: [], bands: [], height: null, mobile: null, pass: true };
  try {
    const page = await browser.newPage({ viewport: { width: viewport, height: 900 } });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

    // settle: pre-scroll (lazy content + scroll-triggered interactions), then force animation
    // end-states so entrance animations don't read as missing/mid-fade content
    await page.evaluate(async () => {
      // neutralize smooth scrolling for capture determinism — WP themes ship scroll-behavior:smooth,
      // which makes window.scrollTo animate and slice captures land mid-glide (inflated diffs)
      const st = document.createElement('style'); st.textContent = 'html,body{scroll-behavior:auto!important}'; document.head.appendChild(st);
      for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); }
      window.scrollTo(0, 0);
      document.getAnimations().forEach((a) => { try { a.finish(); } catch {} });
      await new Promise((r) => setTimeout(r, 300));
    });

    // anchors — one eval collects every rect
    const probes = await page.evaluate((anchors) => {
      const findByText = (t) => {
        const els = document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,a,button,span');
        for (const el of els) if (el.textContent.trim().startsWith(t)) return el;
        return null;
      };
      return anchors.map((a) => {
        const el = a.selector.startsWith('text=') ? findByText(a.selector.slice(5)) : document.querySelector(a.selector);
        if (!el) return { name: a.name, found: false };
        const r = el.getBoundingClientRect();
        return { name: a.name, found: true, y: Math.round((r.top + scrollY) * 10) / 10, x: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) };
      });
    }, spec.anchors || []);
    for (let i = 0; i < probes.length; i++) {
      const target = (spec.anchors || [])[i];
      const p = probes[i];
      const delta = p.found ? Math.round((p.y - target.y) * 10) / 10 : null;
      // minW/minH: presence-with-size assertions — a rendered element can sit at the right y with
      // ZERO width (real incident: hero decorations at 0×200px passed every position check while
      // being invisible). Size floors catch the collapse.
      const sizeOk = !p.found ? false
        : (target.minW == null || p.w >= target.minW) && (target.minH == null || p.h >= target.minH);
      const ok = p.found && Math.abs(delta) <= tolerance && sizeOk;
      const entry = { name: p.name, target: target.y, actual: p.found ? p.y : null, delta, ok };
      if (target.minW != null || target.minH != null) { entry.size = p.found ? `${p.w}x${p.h}` : null; entry.sizeOk = sizeOk; }
      result.anchors.push(entry);
      if (!ok) result.pass = false;
    }

    // total height + horizontal overflow at design width
    const dims = await page.evaluate(() => ({ h: document.body.scrollHeight, w: document.documentElement.scrollWidth }));
    result.height = { actual: dims.h, target: spec.totalHeight || null, ok: !spec.totalHeight || Math.abs(dims.h - spec.totalHeight) <= 40 };
    if (!result.height.ok) result.pass = false;

    // paint bands — viewport screenshots only (fullPage captures of tall pages deterministically
    // drop bottom-of-page image paint on some stacks; never trust them for presence checks)
    for (const band of spec.bands || []) {
      await page.evaluate((y) => window.scrollTo(0, Math.max(0, y - 200)), band.y0);
      await page.waitForTimeout(400);
      const scrollY = await page.evaluate(() => window.scrollY);
      const shot = await page.screenshot({ type: 'png' });
      const ink = await countInk(shot, band.y0 - scrollY, band.y1 - scrollY, viewport);
      const ok = ink >= (band.minInkPx ?? 1);
      result.bands.push({ name: band.name, inkPx: ink, minInkPx: band.minInkPx ?? 1, ok });
      if (!ok) result.pass = false;
    }

    // width-generalization probe: pages built against a fixed design width can pass every check at
    // that width while being hard-pinned to it (fixed left: offsets, left-aligned grid tracks) —
    // real incident: a page scored 7.85 photometric at 1200 and rendered visibly skewed at 1512.
    // Invariant: centered content's x-center shifts by exactly (W2-W1)/2 when the viewport widens.
    if (spec.generalizeWidth && spec.generalizeWidth !== viewport) {
      const w2 = spec.generalizeWidth;
      const g = await browser.newPage({ viewport: { width: w2, height: 900 } });
      await g.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await g.evaluate(async () => {
        const st = document.createElement('style'); st.textContent = 'html,body{scroll-behavior:auto!important}'; document.head.appendChild(st);
        for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
        window.scrollTo(0, 0);
        document.getAnimations().forEach((a) => { try { a.finish(); } catch {} });
      });
      const probes2 = await g.evaluate((anchors) => {
        const findByText = (t) => {
          const els = document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,a,button,span');
          for (const el of els) if (el.textContent.trim().startsWith(t)) return el;
          return null;
        };
        return anchors.map((a) => {
          const el = a.selector.startsWith('text=') ? findByText(a.selector.slice(5)) : document.querySelector(a.selector);
          if (!el) return { name: a.name, found: false };
          const r = el.getBoundingClientRect();
          return { name: a.name, found: true, cx: r.left + r.width / 2 };
        });
      }, spec.anchors || []);
      const expectedShift = (w2 - viewport) / 2;
      const failed = [];
      for (let i = 0; i < probes2.length; i++) {
        const base = probes[i]; const wide = probes2[i];
        if (!base?.found || !wide.found) continue;
        const baseCx = base.x + base.w / 2;
        const shift = wide.cx - baseCx;
        if (Math.abs(shift - expectedShift) > 8) failed.push(`${wide.name} (shifted ${Math.round(shift)}px, expected ${expectedShift})`);
      }
      result.generalization = { width: w2, expectedShift, failed, ok: failed.length === 0 };
      if (!result.generalization.ok) result.pass = false;
      await g.close();
    }

    // mobile overflow probe
    if (mobile) {
      const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await m.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      const probe = await m.evaluate(() => {
        const sw = document.documentElement.scrollWidth;
        const offenders = [];
        if (sw > 390) {
          for (const el of document.querySelectorAll('*')) {
            const r = el.getBoundingClientRect();
            if (r.right > 391 && r.width > 4) { offenders.push(`${el.tagName.toLowerCase()}.${(el.className + '').split(' ')[0]}@${Math.round(r.right)}`); if (offenders.length >= 5) break; }
          }
        }
        return { scrollWidth: sw, offenders };
      });
      result.mobile = { scrollWidth: probe.scrollWidth, ok: probe.scrollWidth <= 390, offenders: probe.offenders };
      if (!result.mobile.ok) result.pass = false;
      await m.close();
    }
  } finally { await browser.close(); }
  return result;
}

/** Count pixels brighter than a floor inside a horizontal strip of a PNG screenshot (pure Node). */
async function countInk(pngBuffer, y0, y1, width) {
  const { PNG } = await tryPngJs();
  if (PNG) {
    const img = PNG.sync.read(pngBuffer);
    let ink = 0;
    const top = Math.max(0, Math.floor(y0)); const bot = Math.min(img.height, Math.ceil(y1));
    for (let y = top; y < bot; y++)
      for (let x = 0; x < img.width; x++) {
        const i = (img.width * y + x) << 2;
        const lum = 0.299 * img.data[i] + 0.587 * img.data[i + 1] + 0.114 * img.data[i + 2];
        if (lum > 10) ink++;
      }
    return ink;
  }
  // pngjs unavailable → python3 + PIL fallback (dev machines usually have it)
  const { execFileSync } = await import('node:child_process');
  const { writeFileSync, mkdtempSync } = await import('node:fs');
  const { join } = await import('node:path');
  const { tmpdir } = await import('node:os');
  const dir = mkdtempSync(join(tmpdir(), 'eu-verify-'));
  const p = join(dir, 'shot.png');
  writeFileSync(p, pngBuffer);
  const out = execFileSync('python3', ['-c', `
from PIL import Image
import numpy as np, sys
a = np.array(Image.open(sys.argv[1]).convert('L'))
print(int((a[max(0, int(${Math.floor(y0)})):int(${Math.ceil(y1)}), :] > 10).sum()))`, p], { encoding: 'utf8' });
  return parseInt(out.trim(), 10);
}

async function tryPngJs() {
  try { const m = await import('pngjs'); return { PNG: m.PNG || m.default?.PNG }; } catch { return { PNG: null }; }
}
