/**
 * quickverify.mjs — the no-reference verification matrix as ONE call. For sites without a design
 * reference (no anchors/pixel bar), the checks that matter are structural: does every page lay out
 * cleanly at every width, with exactly one h1 and no horizontal overflow? A field agent hand-drove
 * playwright for 12 page×width probes (~10 min of tool calls); this does the whole matrix in one.
 *
 *   eu-studio verify --pages /,/about/,/pricing/ --widths 1200,1920,390
 *
 * Per combo: scrollWidth === viewport (overflow offenders named), h1 count, console errors,
 * body height. JSON out; exit 1 on any failure.
 *
 * Forensic probes — added after a 10-site audit where every defective site passed this gate
 * (the defects were all invisible to scrollWidth/h1/pageerror):
 *   empty-flex-slot  FAIL — a space-between/around/evenly row "balances" against an invisible
 *                    child (the zero-width burger-wrapper signature): geometry is legal, the
 *                    page looks broken to a human
 *   css-coverage     FAIL — a page can serve 200 with N stylesheets while classes it uses are
 *                    defined in NONE of them (stale carrier / lost post css); doctor caught
 *                    this, the deploy gate didn't
 *   image-no-pixels  FAIL — an <img> whose bytes never decoded (404 src, media that never
 *                    sideloaded, an attachment id absent on this site): naturalWidth 0
 *   image-zero-box   FAIL — an <img> with real pixels rendered at a zero-size box, i.e. invisible.
 *                    Both run AFTER the scroll pass + a per-image load/error settle, so lazy
 *                    loading can never be mistaken for a broken image
 *   min-content-collapse      WARN — a squeezed column rendering one word per line never overflows
 *   text-escapes-rotated-card WARN — text bleeding out of a transformed card never trips scrollWidth
 * Warnings never flip pass:false — some designs run legitimately narrow or rotated.
 */
import { resolvePlaywright } from './env.mjs';

export async function run(env, { pages, widths = [1200, 1920, 390] }, sharedBrowser = null) {
  const pwPath = resolvePlaywright();
  if (!pwPath) throw new Error('playwright not found — npm i playwright or set EXJSX_IT_PLAYWRIGHT');
  const { chromium } = await import('file://' + pwPath.replace(/^file:\/\//, ''));
  const browser = sharedBrowser || await chromium.launch();
  const results = [];
  try {
    for (const pagePath of pages) {
      const url = pagePath.startsWith('http') ? pagePath : env.url + pagePath;
      for (let wi = 0; wi < widths.length; wi++) {
        const width = widths[wi];
        const pg = await browser.newPage({ viewport: { width, height: 900 } });
        const consoleErrors = [];
        pg.on('pageerror', (e) => consoleErrors.push(String(e).slice(0, 120)));
        try {
          await pg.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
          // coverage is width-independent — run it once per page (first width) to keep the matrix cheap
          const probe = await pg.evaluate(async ({ w, coverage }) => {
            const st = document.createElement('style'); st.textContent = 'html,body{scroll-behavior:auto!important}'; document.head.appendChild(st);
            for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
            window.scrollTo(0, 0);
            document.getAnimations().forEach((a) => { try { a.finish(); } catch {} });
            await new Promise((r) => setTimeout(r, 250));
            /* IMAGE PRIMING — the scroll pass above already pulled every loading="lazy" <img> through
             * the viewport, but the fetch it triggered may still be in flight (networkidle happened
             * BEFORE the scroll). Settle each pending image on load OR error, capped, so the
             * broken-image probe below can never report a slow image as a missing one. */
            await Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((res) => {
              i.addEventListener('load', res, { once: true });
              i.addEventListener('error', res, { once: true });
              setTimeout(res, 4000);
            })));

            const offenders = [];
            const warnings = [];
            const cls1 = (el) => {
              const cn = typeof el.className === 'string' ? el.className : (el.getAttribute('class') || '');
              return cn.trim() ? '.' + cn.trim().split(/\s+/)[0] : (el.id ? '#' + el.id : '');
            };
            const sel = (el) => {
              const parts = []; let cur = el;
              for (let i = 0; cur && cur !== document.body && i < 3; i++) { parts.unshift(cur.tagName.toLowerCase() + cls1(cur)); cur = cur.parentElement; }
              return parts.join('>');
            };
            const visible = (el, cs) => {
              const r = el.getBoundingClientRect();
              return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0.5 && r.height > 0.5;
            };
            const paints = (cs) => cs.backgroundImage !== 'none'
              || (cs.backgroundColor !== 'transparent' && !/rgba\(\d+,\s*\d+,\s*\d+,\s*0\)/.test(cs.backgroundColor))
              || ['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'].some((p) => parseFloat(cs[p]) > 0);

            const sw = document.documentElement.scrollWidth;
            if (sw > w) {
              for (const el of document.querySelectorAll('*')) {
                const r = el.getBoundingClientRect();
                if (r.right > w + 1 && r.width > 4) { offenders.push({ sel: `${el.tagName.toLowerCase()}${cls1(el)}@${Math.round(r.right)}`, reason: 'overflow' }); if (offenders.length >= 4) break; }
              }
            }

            /* broken-image FAIL — a page can lay out perfectly, count one h1, throw no page errors
             * and still show NOT ONE PICTURE: a 404 src, media that never sideloaded, an attachment
             * id that doesn't exist on this site, or an <img> collapsed to a zero box by its
             * container. Every existing probe here is blind to it — only a human looking at a
             * screenshot caught it. Two independent signals, because either alone lies:
             *   naturalWidth === 0 after `complete` → the bytes never decoded (broken src);
             *   a zero-size rendered box            → the pixels exist but nothing is on screen.
             * Exemptions are the deliberately-invisible cases only: display:none / visibility:hidden
             * (responsive <picture> arms, off-state art), [hidden]/aria-hidden subtrees, and the 1×1
             * absolutely-positioned tracking beacon (real pixels, no layout box by design). */
            let imagesChecked = 0;
            for (const img of document.querySelectorAll('img')) {
              const ics = getComputedStyle(img);
              if (ics.display === 'none' || ics.visibility === 'hidden') continue;
              if (img.closest('[hidden], [aria-hidden="true"]')) continue;
              const ir = img.getBoundingClientRect();
              const beacon = ics.position === 'absolute' && img.naturalWidth <= 1 && img.naturalHeight <= 1;
              if (beacon) continue;
              imagesChecked++;
              const noPixels = img.complete && img.naturalWidth === 0;
              const zeroBox = ir.width < 1 || ir.height < 1;
              if (!noPixels && !zeroBox) continue;
              offenders.push({
                sel: sel(img),
                reason: noPixels ? 'image-no-pixels' : 'image-zero-box',
                src: (img.currentSrc || img.getAttribute('src') || '(no src)').slice(-90),
                box: `${Math.round(ir.width)}x${Math.round(ir.height)}`,
                naturalWidth: img.naturalWidth,
              });
              if (offenders.filter((o) => o.reason.startsWith('image-')).length >= 6) break;
            }

            // empty-flex-slot: justify-content distributes space to ALL in-flow children, including
            // ones that paint nothing — so a header ends up "balanced" against a ghost and every
            // geometric check still passes. Exemptions: flex-grow>0 (intentional spacer) and
            // aria-hidden children with real width (deliberate balance separators).
            const REPLACED = /^(img|svg|video|canvas|iframe|input|select|textarea|button|picture|object|embed)$/;
            const pseudoPaints = (e) => ['::before', '::after'].some((p) => { const cnt = getComputedStyle(e, p).content; return cnt && cnt !== 'none' && cnt !== 'normal'; });
            const contentful = (e, ecs) => ecs.visibility !== 'hidden' && (paints(ecs) || pseudoPaints(e) || REPLACED.test(e.tagName.toLowerCase()));
            const JUSTIFY = new Set(['space-between', 'space-around', 'space-evenly']);
            outer:
            for (const el of document.querySelectorAll('*')) {
              const cs = getComputedStyle(el);
              if (!/^(inline-)?flex$/.test(cs.display) || !JUSTIFY.has(cs.justifyContent)) continue;
              if (!visible(el, cs)) continue;
              for (const child of el.children) {
                const ccs = getComputedStyle(child);
                // display:none children create no flex slot; abs/fixed children are out of flow
                if (ccs.display === 'none' || ccs.position === 'absolute' || ccs.position === 'fixed') continue;
                if (parseFloat(ccs.flexGrow) > 0) continue;
                const r = child.getBoundingClientRect();
                if (child.getAttribute('aria-hidden') === 'true' && r.width > 2) continue;
                // innerText only reports RENDERED text, so display:none/visibility:hidden subtrees
                // (a burger button hidden at this width) don't count as visible content
                const hasText = ((child.innerText || '') + '').trim().length > 0;
                if (hasText || contentful(child, ccs)) continue;
                const anyVisibleDesc = [...child.querySelectorAll('*')].some((d) => { const dcs = getComputedStyle(d); return visible(d, dcs) && contentful(d, dcs); });
                if (anyVisibleDesc) continue;
                offenders.push({ sel: sel(child), reason: 'empty-flex-slot', parentJustify: cs.justifyContent });
                if (offenders.filter((o) => o.reason === 'empty-flex-slot').length >= 6) break outer;
              }
            }

            // css-coverage: every c- class the DOM uses must be defined by SOME served rule —
            // a page serves 200 with N stylesheets while its own post css / carrier went stale
            // (real incident: a 4-page site z-stacked into 748px while the gate reported green)
            if (coverage) {
              const used = new Set();
              for (const el of document.querySelectorAll('[class]')) {
                const cn = typeof el.className === 'string' ? el.className : (el.getAttribute('class') || '');
                // whole tokens only: wipe-mode pages render global-class IDS as literal g-c-* class
                // names — a \b regex would extract the bare c- tail out of them, truncating the
                // report and false-flagging any healthy site that styles .g-c-* rules
                for (const tok of cn.split(/\s+/)) if (/^(?:g-)?c-[a-z0-9]{4,10}$/.test(tok)) used.add(tok);
              }
              if (used.size) {
                let cssText = '';
                for (const s of document.querySelectorAll('style')) cssText += s.textContent || '';
                for (const sheet of document.styleSheets) {
                  try { for (const rule of sheet.cssRules) cssText += rule.cssText; }
                  catch { if (sheet.href) { try { cssText += await (await fetch(sheet.href)).text(); } catch { /* cross-origin sheet — can't define c- rules anyway */ } } }
                }
                // boundary-aware: '.c-abc1' must not be satisfied by '.c-abc12'
                const missing = [...used].filter((cl) => !new RegExp('\\.' + cl + '(?![a-z0-9-])').test(cssText));
                if (missing.length) offenders.push({ sel: `${missing.length}/${used.size} undefined: ${missing.slice(0, 5).join(' ')}`, reason: 'css-coverage' });
              }
            }

            // min-content collapse: a squeezed column rendering one word per line never overflows —
            // the layout gave way instead of the content. Vertical writing modes are narrow on purpose.
            for (const el of document.querySelectorAll('body *')) {
              if (el.childElementCount) continue;
              const text = ((el.innerText || '') + '').trim();
              if (text.length <= 20) continue;
              const cs = getComputedStyle(el);
              if (cs.writingMode !== 'horizontal-tb' || !visible(el, cs)) continue;
              const r = el.getBoundingClientRect();
              if (r.width >= 90) continue;
              const rng = document.createRange(); rng.selectNodeContents(el);
              const lines = [...rng.getClientRects()].filter((x) => x.width > 0 && x.height > 0).length;
              if (lines >= 3) {
                warnings.push({ sel: sel(el), reason: 'min-content-collapse', px: Math.round(r.width), chars: text.length, lines });
                if (warnings.length >= 8) break;
              }
            }

            // rotated cards: the page box stays clean while text visually bleeds past the card edge,
            // so scrollWidth never trips — compare descendant text rects against the card's box
            for (const el of document.querySelectorAll('body *')) {
              const cs = getComputedStyle(el);
              const m = /matrix\(([^)]+)\)/.exec(cs.transform || '');
              if (!m) continue;
              const [a, b] = m[1].split(',').map(parseFloat);
              const deg = Math.abs(Math.atan2(b, a) * 180 / Math.PI);
              if (deg < 2 || !visible(el, cs)) continue;
              const er = el.getBoundingClientRect();
              for (const d of [el, ...el.querySelectorAll('*')]) {
                const texts = [...d.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
                if (!texts.length) continue;
                const dcs = d === el ? cs : getComputedStyle(d);
                if (!visible(d, dcs)) continue;
                // the element box can't see the escape: a nowrap line paints past its block box
                // while the box itself stays "inside" — measure the text INK via ranges
                let L = Infinity, R = -Infinity, T = Infinity, B = -Infinity;
                const rng = document.createRange();
                for (const tn of texts) {
                  rng.selectNode(tn);
                  for (const x of rng.getClientRects()) if (x.width && x.height) { L = Math.min(L, x.left); R = Math.max(R, x.right); T = Math.min(T, x.top); B = Math.max(B, x.bottom); }
                }
                if (R === -Infinity) continue;
                if (L < er.left - 6 || R > er.right + 6 || T < er.top - 6 || B > er.bottom + 6) {
                  warnings.push({ sel: sel(d), reason: 'text-escapes-rotated-card', card: sel(el) });
                  break; // one warning per card is enough to look at it
                }
              }
              if (warnings.length >= 12) break;
            }

            return { sw, offenders, warnings, imagesChecked, h1: document.querySelectorAll('h1').length, height: document.body.scrollHeight };
          }, { w: width, coverage: wi === 0 });
          const ok = probe.sw === width && probe.h1 === 1 && consoleErrors.length === 0 && probe.offenders.length === 0;
          results.push({ page: pagePath, width, ok, scrollWidth: probe.sw, h1: probe.h1, height: probe.height, images: probe.imagesChecked, offenders: probe.offenders, consoleErrors, ...(probe.warnings.length ? { warnings: probe.warnings } : {}) });
        } catch (e) {
          results.push({ page: pagePath, width, ok: false, error: String(e).slice(0, 150) });
        } finally { await pg.close(); }
      }
    }
  } finally { if (!sharedBrowser) await browser.close(); }
  const warnings = results.flatMap((r) => (r.warnings || []).map((w) => ({ page: r.page, width: r.width, ...w })));
  return { pass: results.every((r) => r.ok), results, ...(warnings.length ? { warnings } : {}) };
}
