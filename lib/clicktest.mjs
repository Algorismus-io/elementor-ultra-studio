/**
 * clicktest.mjs — the standard interaction tests as ONE call, so agents stop hand-writing playwright
 * scripts for them (field reality: every multi-page run wrote a custom clicktests.mjs + probes,
 * ~5 min of scripting each time — the exact waste `verify` already killed for measurement).
 *
 *   eu-studio clicktest [--form /contact/] [--accordion /pricing/] [--burger /] [--nav /=about]
 *
 * Presets:
 *   form      fill every visible text/email/textarea input, submit, assert a success signal
 *             (Pro atomic admin-ajax success:true, OR visible success text, OR form hidden)
 *   accordion first <details>: click summary → open + answer visibly laid out, click → closed
 *   burger    at 390px: find the menu toggle, click → a hidden nav container becomes visible,
 *             and it contains ≥2 links
 *   nav       click the nav link whose text matches the value after '=' → URL changes to match
 *
 * JSON out; exit 1 on any failure. Runs each preset on its own page context.
 */
import { resolvePlaywright } from './env.mjs';

export async function run(env, { tests }) {
  const pwPath = resolvePlaywright();
  if (!pwPath) throw new Error('playwright not found — npm i playwright or set EXJSX_IT_PLAYWRIGHT');
  const { chromium } = await import('file://' + pwPath.replace(/^file:\/\//, ''));
  const browser = await chromium.launch();
  const results = [];
  const url = (p) => (p.startsWith('http') ? p : env.url + p);

  try {
    for (const t of tests) {
      const pg = await browser.newPage({ viewport: { width: t.kind === 'burger' ? 390 : 1200, height: 900 } });
      try {
        await pg.goto(url(t.page), { waitUntil: 'networkidle', timeout: 60000 });

        if (t.kind === 'form') {
          let ajaxOk = null;
          pg.on('response', async (res) => {
            if (res.url().includes('admin-ajax.php')) {
              try { const j = await res.json(); if (j && typeof j.success === 'boolean') ajaxOk = j.success; } catch { /* non-json */ }
            }
          });
          const filled = await pg.evaluate(() => {
            const form = document.querySelector('form');
            if (!form) return { ok: false, why: 'no <form> on page' };
            let n = 0;
            for (const el of form.querySelectorAll('input, textarea')) {
              const type = (el.getAttribute('type') || 'text').toLowerCase();
              if (['hidden', 'submit', 'button', 'checkbox', 'radio'].includes(type)) continue;
              el.focus();
              el.value = type === 'email' ? 'clicktest@example.com' : 'Clicktest ' + (++n);
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
            }
            return { ok: n > 0 || form.querySelector('textarea') != null, why: n === 0 ? 'no fillable inputs' : '', n };
          });
          if (!filled.ok) { results.push({ test: 'form', page: t.page, ok: false, detail: filled.why }); continue; }
          await pg.evaluate(() => {
            const form = document.querySelector('form');
            const btn = form.querySelector('button[type=submit], input[type=submit], button');
            (btn || form).dispatchEvent ? btn?.click() : form.submit();
            if (!btn) form.requestSubmit ? form.requestSubmit() : form.submit();
          });
          await pg.waitForTimeout(3500);
          const after = await pg.evaluate(() => {
            const form = document.querySelector('form');
            const formHidden = !form || form.offsetParent === null || getComputedStyle(form).display === 'none';
            const successText = /sent|thank|received|logged|success/i.test(document.body.innerText) &&
              [...document.querySelectorAll('*')].some((el) => /sent|thank|received|logged|success/i.test(el.childNodes[0]?.textContent || '') && el.offsetParent !== null && el.getBoundingClientRect().height > 0 && el.closest('form') === null);
            return { formHidden, successText };
          });
          const ok = ajaxOk === true || after.successText || after.formHidden;
          results.push({ test: 'form', page: t.page, ok, detail: `filled ${filled.n} field(s); ajax=${ajaxOk === null ? 'n/a' : ajaxOk}; successText=${after.successText}; formHidden=${after.formHidden}` });
        }

        if (t.kind === 'accordion') {
          const r = await pg.evaluate(async () => {
            const d = document.querySelector('details');
            if (!d) return { ok: false, why: 'no <details> on page' };
            const s = d.querySelector('summary');
            if (!s) return { ok: false, why: '<details> without <summary>' };
            const before = d.open;
            s.click();
            await new Promise((res) => setTimeout(res, 400));
            const opened = d.open !== before;
            const body = [...d.children].find((c) => c.tagName !== 'SUMMARY');
            const visible = body ? body.getBoundingClientRect().height > 0 : d.open;
            s.click();
            await new Promise((res) => setTimeout(res, 200));
            const closesBack = d.open === before;
            return { ok: opened && visible && closesBack, why: `toggled=${opened} bodyVisible=${visible} closesBack=${closesBack}` };
          });
          results.push({ test: 'accordion', page: t.page, ok: r.ok, detail: r.why });
        }

        if (t.kind === 'burger') {
          const r = await pg.evaluate(async () => {
            const cands = [...document.querySelectorAll('button, [role=button], a')].filter((el) => {
              const sig = `${el.className} ${el.id} ${el.getAttribute('aria-label') || ''}`.toLowerCase();
              return /burger|hamburger|menu-toggle|nav-toggle|menu.?btn|\bmenu\b/.test(sig) && el.offsetParent !== null;
            });
            if (!cands.length) return { ok: false, why: 'no visible menu toggle found (class/id/aria containing burger|hamburger|menu)' };
            const btn = cands[0];
            const visLinks = () => [...document.querySelectorAll('a[href]')].filter((a) => a.offsetParent !== null && a.getBoundingClientRect().height > 0).length;
            const before = visLinks();
            btn.click();
            await new Promise((res) => setTimeout(res, 600));
            const after = visLinks();
            return { ok: after >= before + 2, why: `visible links ${before} → ${after} after toggle` };
          });
          results.push({ test: 'burger', page: t.page, ok: r.ok, detail: r.why });
        }

        if (t.kind === 'nav') {
          const target = t.arg || '';
          const beforeUrl = pg.url();
          const clicked = await pg.evaluate((txt) => {
            const link = [...document.querySelectorAll('a[href]')].find((a) => a.offsetParent !== null && a.textContent.trim().toLowerCase().includes(txt.toLowerCase()));
            if (!link) return false;
            link.click();
            return true;
          }, target);
          if (!clicked) { results.push({ test: 'nav', page: t.page, ok: false, detail: `no visible link matching "${target}"` }); continue; }
          await pg.waitForTimeout(2500);
          const ok = pg.url() !== beforeUrl;
          results.push({ test: 'nav', page: t.page, ok, detail: `${beforeUrl} → ${pg.url()}` });
        }
      } catch (e) {
        results.push({ test: t.kind, page: t.page, ok: false, detail: String(e).slice(0, 160) });
      } finally { await pg.close(); }
    }
  } finally { await browser.close(); }
  return { pass: results.every((r) => r.ok), results };
}
