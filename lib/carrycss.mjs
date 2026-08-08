/**
 * carrycss.mjs — make a page's styling independent of Elementor's CSS file store. On PHP-WASM/
 * Playground the generated `global-<id>-*.css` files can vanish repeatedly (cache clears delete
 * them; regeneration is unreliable and multi-page regens are mutually destructive). A field agent's
 * proven answer: harvest the page's generated CSS during a healthy window and bake it into the page
 * itself as an inline <style> carrier — the page then styles itself forever, file store or not.
 *
 *   eu-studio carry-css --page <id> [--page <id> …]
 *
 * Idempotent: the carrier is a marked html widget (EU-CSS-CARRIER); re-running replaces its content.
 * The carrier collapses its own wrapper (no layout impact — the 20px-strip lesson).
 */
import { api } from './env.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MARK = 'EU-CSS-CARRIER';

async function grabCss(env, id, context, bp) {
  try {
    const r = await fetch(`${env.url}/wp-content/uploads/elementor/css/global-${id}-${context}-${bp}.css`, { redirect: 'follow', signal: AbortSignal.timeout(10000) });
    const t = await r.text();
    if (r.ok && t.length > 50 && !t.includes('<html') && (t.includes('{') || t.trimStart().startsWith('.'))) return t;
  } catch { /* retry */ }
  return null;
}

export async function run(env, { pageIds }) {
  const out = [];
  for (const id of pageIds) {
    // 1) harvest desktop+mobile css, opening prime/visit regen windows until both land
    let desktop = null, mobile = null;
    for (let attempt = 0; attempt < 20 && (!desktop || !mobile); attempt++) {
      desktop = desktop || await grabCss(env, id, 'frontend', 'desktop');
      mobile = mobile || await grabCss(env, id, 'frontend', 'mobile');
      if (desktop && mobile) break;
      await api(env, `/elementor-ultra/v1/documents/${id}/prime-css`, { method: 'POST', body: '{}', timeoutMs: 60000 }).catch(() => {});
      await fetch(`${env.url}/?page_id=${id}`, { redirect: 'follow', signal: AbortSignal.timeout(20000) }).catch(() => {});
      await sleep(2000);
    }
    if (!desktop) { out.push({ id, ok: false, detail: 'could not harvest desktop css after 20 windows' }); continue; }

    // 2) build the carrier html (mobile css wrapped in its media query if the file didn't carry one)
    const mobileCss = mobile ? (mobile.includes('@media') ? mobile : `@media(max-width:767px){${mobile}}`) : '';
    const html = `<!-- ${MARK} --><style>${desktop}\n${mobileCss}</style>`;

    // 3) inject/replace as the FIRST element of the tree
    const doc = await api(env, `/elementor-ultra/v1/documents/${id}`);
    const els = doc.body?.data?.elements;
    if (!doc.ok || !Array.isArray(els)) { out.push({ id, ok: false, detail: 'document read failed' }); continue; }
    const isCarrier = (n) => n?.widgetType === 'html' && typeof n?.settings?.html === 'string' && n.settings.html.includes(MARK);
    const existing = els.find(isCarrier);
    const carrierId = existing?.id || 'eucss' + String(id).padStart(3, '0');
    const carrier = {
      id: carrierId, elType: 'widget', widgetType: 'html',
      settings: { html: html + `<style>.elementor-element-${carrierId}{margin:0!important;height:0;line-height:0;overflow:hidden}</style>` },
      styles: {}, elements: [],
    };
    const tree = existing ? els.map((n) => (isCarrier(n) ? carrier : n)) : [carrier, ...els];
    const save = await api(env, `/elementor-ultra/v1/documents/${id}/save`, { method: 'POST', body: JSON.stringify({ elements: tree }), timeoutMs: 120000 });
    if (!save.ok) { out.push({ id, ok: false, detail: `save failed (${save.status})` }); continue; }
    await api(env, `/elementor-ultra/v1/documents/${id}/prime-css`, { method: 'POST', body: '{}', timeoutMs: 60000 }).catch(() => {});
    out.push({ id, ok: true, detail: `carrier ${existing ? 'updated' : 'injected'} (${desktop.length}b desktop${mobile ? ` + ${mobile.length}b mobile` : ', no mobile css'})` });
  }
  return { pass: out.every((o) => o.ok), pages: out };
}
