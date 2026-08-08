/**
 * quickverify.mjs — the no-reference verification matrix as ONE call. For sites without a design
 * reference (no anchors/pixel bar), the checks that matter are structural: does every page lay out
 * cleanly at every width, with exactly one h1 and no horizontal overflow? A field agent hand-drove
 * playwright for 12 page×width probes (~10 min of tool calls); this does the whole matrix in one.
 *
 *   eu-studio verify --pages /,/about/,/pricing/ --widths 1200,1512,390
 *
 * Per combo: scrollWidth === viewport (overflow offenders named), h1 count, console errors,
 * body height. JSON out; exit 1 on any failure.
 */
import { resolvePlaywright } from './env.mjs';

export async function run(env, { pages, widths = [1200, 1512, 390] }) {
  const pwPath = resolvePlaywright();
  if (!pwPath) throw new Error('playwright not found — npm i playwright or set EXJSX_IT_PLAYWRIGHT');
  const { chromium } = await import('file://' + pwPath.replace(/^file:\/\//, ''));
  const browser = await chromium.launch();
  const results = [];
  try {
    for (const pagePath of pages) {
      const url = pagePath.startsWith('http') ? pagePath : env.url + pagePath;
      for (const width of widths) {
        const pg = await browser.newPage({ viewport: { width, height: 900 } });
        const consoleErrors = [];
        pg.on('pageerror', (e) => consoleErrors.push(String(e).slice(0, 120)));
        try {
          await pg.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
          const probe = await pg.evaluate(async (w) => {
            const st = document.createElement('style'); st.textContent = 'html,body{scroll-behavior:auto!important}'; document.head.appendChild(st);
            for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
            window.scrollTo(0, 0);
            document.getAnimations().forEach((a) => { try { a.finish(); } catch {} });
            await new Promise((r) => setTimeout(r, 250));
            const sw = document.documentElement.scrollWidth;
            const offenders = [];
            if (sw > w) {
              for (const el of document.querySelectorAll('*')) {
                const r = el.getBoundingClientRect();
                if (r.right > w + 1 && r.width > 4) { offenders.push(`${el.tagName.toLowerCase()}.${(el.className + '').split(' ')[0]}@${Math.round(r.right)}`); if (offenders.length >= 4) break; }
              }
            }
            return { sw, offenders, h1: document.querySelectorAll('h1').length, height: document.body.scrollHeight };
          }, width);
          const ok = probe.sw === width && probe.h1 === 1 && consoleErrors.length === 0;
          results.push({ page: pagePath, width, ok, scrollWidth: probe.sw, h1: probe.h1, height: probe.height, offenders: probe.offenders, consoleErrors });
        } catch (e) {
          results.push({ page: pagePath, width, ok: false, error: String(e).slice(0, 150) });
        } finally { await pg.close(); }
      }
    }
  } finally { await browser.close(); }
  return { pass: results.every((r) => r.ok), results };
}
