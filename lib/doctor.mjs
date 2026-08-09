/**
 * doctor.mjs — health checks + self-heal for an Elementor Ultra site.
 *
 * Checks (in order):
 *   site        — frontend answers 200
 *   auth        — app-password REST auth works
 *   seam        — companion plugin capabilities endpoint
 *   store       — global-classes store integrity: every class a page references must exist in the
 *                 store (an Elementor-editor visit can WIPE the store — real incident; the fix is
 *                 redeploying the page bundle, which doctor can only detect, not invent)
 *   css         — every global-*.css / post-*.css the page enqueues actually serves; on failure,
 *                 heals via cache/regen + prime-css with retries, then re-checks
 *
 * Each check returns { name, ok, detail, heal? }. `run` returns { ok, checks }.
 */
import { api } from './env.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchStatus(url, { follow = true } = {}) {
  try {
    const res = await fetch(url, { redirect: follow ? 'follow' : 'manual', signal: AbortSignal.timeout(15000) });
    return { status: res.status, bytes: (await res.arrayBuffer()).byteLength, type: res.headers.get('content-type') || '', finalUrl: res.url };
  } catch (e) { return { status: 0, bytes: 0, type: '', error: e.message }; }
}

// a "healthy" stylesheet must actually BE css — Playground 301s missing files to the homepage, so a
// followed fetch can come back 200 text/html and look alive (real false-negative incident)
const cssOk = (r) => r.status === 200 && r.bytes > 0 && r.type.includes('css');

function collectClassRefs(node, out) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { node.forEach((n) => collectClassRefs(n, out)); return; }
  // classes.value mixes the element's own local-style ids with global-class refs; only g-* ids
  // live in the global store
  const cls = node.settings?.classes?.value;
  if (Array.isArray(cls)) cls.forEach((c) => typeof c === 'string' && c.startsWith('g-') && out.add(c));
  collectClassRefs(node.elements, out);
}

export async function run(env, { pageId = null, heal = true } = {}) {
  const checks = [];
  const push = (name, ok, detail, healed = undefined) => { checks.push({ name, ok, detail, ...(healed !== undefined ? { healed } : {}) }); return ok; };

  // site
  const front = await fetchStatus(env.url + '/');
  push('site', front.status === 200, `GET / → ${front.status || front.error}`);

  // auth
  const me = await api(env, '/wp/v2/users/me').catch((e) => ({ ok: false, status: 0, body: { message: e.message } }));
  push('auth', me.ok, me.ok ? `authenticated as ${me.body?.name || env.user}` : `auth failed (${me.status}) — check WP_USER/WP_APP_PASSWORD; on non-SSL sites WP_ENVIRONMENT_TYPE must be 'local'`);

  // seam
  const caps = await api(env, '/elementor-ultra/v1/site/capabilities').catch(() => ({ ok: false, status: 0 }));
  const capsData = caps.body?.data || {};
  push('seam', caps.ok, caps.ok
    ? `Elementor ${capsData.elementor_version}${capsData.pro_active ? ` + Pro ${capsData.pro_version}` : ''}, atomic ${capsData.atomic_available ? 'on' : 'OFF'}`
    : `companion plugin not answering (${caps.status}) — install/activate elementor-ultra-mcp`);

  // pages to inspect
  let pages = [];
  if (pageId) pages = [{ id: Number(pageId) }];
  else {
    const list = await api(env, '/wp/v2/pages?per_page=20&status=publish').catch(() => ({ ok: false }));
    if (list.ok && Array.isArray(list.body)) pages = list.body.map((p) => ({ id: p.id, slug: p.slug }));
  }

  // store integrity (needs seam)
  if (caps.ok && pages.length) {
    // read via Elementor's own endpoint — it returns the FULL store in one response (the ultra
    // design/classes route is cursor-paginated: default limit 25 + next_cursor; this avoids paging)
    const store = await api(env, '/elementor/v1/global-classes').catch(() => ({ ok: false }));
    const raw = store.body?.data ?? store.body ?? {};
    const items = Array.isArray(raw) ? raw : Array.isArray(raw.items) ? raw.items : Object.values(raw.items || {});
    const storeIds = new Set(items.map((i) => i.id).filter(Boolean));
    const missing = new Map(); // pageId → [ids]
    const zeroRefPages = [];   // atomic pages whose g-refs were STRIPPED (deep-wipe mode)
    let deepWipeHandled = false;
    let sawElementorPage = false;
    for (const p of pages) {
      const doc = await api(env, `/elementor-ultra/v1/documents/${p.id}`).catch(() => ({ ok: false }));
      const els = doc.body?.data?.elements || null;
      if (!doc.ok || !els) continue;
      sawElementorPage = true;
      const refs = new Set();
      collectClassRefs(els, refs);
      const miss = [...refs].filter((r) => !storeIds.has(r));
      if (miss.length) missing.set(p.id, miss);
      // deep-wipe mode: Elementor's cleanup can strip class REFS from the document when the store
      // is emptied — the page then references nothing and looks "consistent" while being unstyled.
      if (refs.size === 0 && JSON.stringify(els).includes('"elType"')) zeroRefPages.push(p.id);
    }
    // zero-ref pages only count as a wipe when the store is ALSO empty (a legit new site has both)
    if (zeroRefPages.length && storeIds.size === 0 && heal) {
      const rs = await api(env, '/elementor-ultra/v1/design/classes/restore', { method: 'POST', body: '{}' }).catch(() => ({ ok: false }));
      if (rs.ok && rs.body?.data?.restored) {
        // the documents lost their refs too — roll each back to its latest pre-save backup
        const rolled = [];
        for (const id of zeroRefPages) {
          const bl = await api(env, `/elementor-ultra/v1/documents/${id}/backups`).catch(() => ({ ok: false }));
          const latest = bl.body?.data?.items?.[0]?.meta_key;
          if (!latest) continue;
          const rb = await api(env, `/elementor-ultra/v1/documents/${id}/rollback`, { method: 'POST', body: JSON.stringify({ meta_key: latest }) }).catch(() => ({ ok: false }));
          if (rb.ok) rolled.push(id);
        }
        push('store', rolled.length === zeroRefPages.length,
          `DEEP WIPE healed — restored ${rs.body.data.restored} class(es) from backup; rolled back document(s) ${rolled.join(',') || 'NONE'} to pre-wipe trees${rolled.length !== zeroRefPages.length ? ` (${zeroRefPages.length - rolled.length} page(s) had no backup — redeploy those bundles)` : ''}`, true);
        // fall through to css checks, which re-prime the restored pages
        missing.clear();
        deepWipeHandled = true;
      }
    }
    if (deepWipeHandled) { /* already reported by the deep-wipe heal */ }
    else if (!sawElementorPage) push('store', true, 'no Elementor documents to check');
    else if (missing.size === 0) push('store', true, `class store intact (${storeIds.size} classes, ${pages.length} page(s) checked)`);
    else if (heal) {
      // auto-heal: the companion plugin snapshots every non-empty store write; restore it
      const rs = await api(env, '/elementor-ultra/v1/design/classes/restore', { method: 'POST', body: '{}' }).catch(() => ({ ok: false }));
      if (rs.ok && rs.body?.data?.restored) {
        const store2 = await api(env, '/elementor/v1/global-classes').catch(() => ({ ok: false }));
        const raw2 = store2.body?.data ?? store2.body ?? {};
        const n2 = (Array.isArray(raw2) ? raw2 : Object.values(raw2.items || {})).length;
        push('store', true, `WIPE DETECTED and healed — restored ${rs.body.data.restored} class(es) from the plugin backup (store now ${n2})`, true);
      } else {
        const detail = [...missing].map(([id, m]) => `page ${id} missing ${m.length} class(es)`).join('; ');
        push('store', false, `${detail} — store wiped and no plugin backup available (${rs.status}). Heal: redeploy the page's exjsx bundle (\`exjsx deploy <bundle> --force\`).`, true);
      }
    } else {
      const detail = [...missing].map(([id, m]) => `page ${id} missing ${m.length} class(es)`).join('; ');
      push('store', false, `${detail} — the global-classes store was likely wiped (Elementor-editor visits can do this). Heal: \`eu-studio doctor\` (auto-restores from the plugin backup), or redeploy the bundle.`);
    }
  }

  // css health — MULTI-PAGE-SAFE heal. `cache/regen` (no post_id) is a GLOBAL flush: it deletes
  // EVERY page's css, while prime-css restores only one page. A per-page heal loop is therefore
  // self-defeating on multi-page sites: healing page B re-kills page A, and only the last page
  // survives (real incident: a 4-page build looped in exactly this whack-a-mole for ~15 min).
  // Correct shape: scan ALL pages first → at most ONE global regen → prime EVERY page that needs
  // it (plus every page the flush collaterally hit) → re-check all.
  const scan = async (p) => {
    const html = await (async () => { try { return await (await fetch(`${env.url}/?page_id=${p.id}`, { signal: AbortSignal.timeout(15000) })).text(); } catch { return ''; } })();
    const hrefs = [...html.matchAll(/href='([^']*uploads\/elementor\/css\/[^']*?\.css[^']*)'/g)].map((m) => m[1]);
    const bad = [];
    // pool = everything that could define a rule for this page: inline <style> blocks (html) plus
    // the text of every enqueued elementor stylesheet
    let pool = html;
    for (const href of hrefs) {
      const url = href.startsWith('http') ? href : env.url + href;
      const r = await fetchStatus(url);
      if (!cssOk(r)) { bad.push({ href, status: r.status }); continue; }
      try { pool += await (await fetch(url, { signal: AbortSignal.timeout(15000) })).text(); } catch {}
    }
    // COVERAGE: every atomic local class the page USES must be DEFINED somewhere in the pool.
    // Catches the failure "stylesheet counting" misses: the page's own post-<id>.css absent from
    // the HTML entirely, or a stale EU-CSS-CARRIER that no longer matches the rendered classes —
    // page serves 200 with N stylesheets yet renders fully collapsed (real incident: a 4-page site
    // z-stacked into 748px while doctor reported green).
    const used = [...new Set([...html.matchAll(/class="[^"]*?\b(c-[a-z0-9]{4,10})\b/g)].map((m) => m[1]))];
    const uncovered = used.filter((cl) => !pool.includes('.' + cl));
    if (used.length && uncovered.length) bad.push({ href: `post-${p.id}.css`, status: `${uncovered.length}/${used.length} local class(es) undefined in any served css` });
    return { page: p, hrefs, bad };
  };
  const scans = [];
  for (const p of pages) { const sc = await scan(p); if (sc.hrefs.length || sc.bad.length) scans.push(sc); }
  const sick = scans.filter((sc) => sc.bad.length);

  if (!sick.length) {
    for (const sc of scans) push(`css:page-${sc.page.id}`, true, `${sc.hrefs.length} stylesheet(s) serving`);
  } else if (!heal) {
    for (const sc of scans) push(`css:page-${sc.page.id}`, sc.bad.length === 0, `${sc.bad.length}/${sc.hrefs.length} stylesheet(s) failing (no --no-heal)`);
  } else {
    // targeted post-scoped regens for post-<id>.css (kit stylesheet) — safe, non-global
    const postIds = new Set();
    for (const sc of sick) for (const b of sc.bad) { const m = /post-(\d+)\.css/.exec(b.href); if (m) postIds.add(Number(m[1])); }
    for (const pid of postIds) await api(env, '/elementor-ultra/v1/cache/regen', { method: 'POST', body: JSON.stringify({ post_id: pid }) }).catch(() => {});
    // ONE global regen only if non-kit files are sick — then prime EVERY scanned page (the flush
    // hit them all), sick or not
    const needGlobal = sick.some((sc) => sc.bad.some((b) => !/post-\d+\.css/.test(b.href)));
    if (needGlobal) await api(env, '/elementor-ultra/v1/cache/regen', { method: 'POST' }).catch(() => {});
    const toPrime = needGlobal ? scans : sick;
    for (const sc of toPrime) {
      let primed = false;
      for (let i = 0; i < 3 && !primed; i++) {
        const pr = await api(env, `/elementor-ultra/v1/documents/${sc.page.id}/prime-css`, { method: 'POST', timeoutMs: 60000 }).catch(() => ({ ok: false }));
        primed = pr.ok && pr.body?.data?.css_primed;
        if (!primed) { await fetchStatus(`${env.url}/?page_id=${sc.page.id}`); await sleep(2000); }
      }
    }
    // re-check everything once, after all priming is done
    for (const sc of scans) {
      const re = await scan(sc.page);
      push(`css:page-${sc.page.id}`, re.bad.length === 0,
        re.bad.length === 0
          ? `${sc.bad.length ? 'healed — ' : ''}${re.hrefs.length} stylesheet(s) serving`
          : `${re.bad.length} stylesheet(s) STILL failing after the multi-page heal. If it's a coverage failure (classes undefined), the stored page data is stale — REDEPLOY the page from its fs-project source (\`exjsx deploy --fast\`). Otherwise make the page store-independent: \`eu-studio carry-css --page ${sc.page.id}\` (or restart the WP worker and re-run doctor).`,
        sc.bad.length > 0 ? true : undefined);
    }
  }

  return { ok: checks.every((ch) => ch.ok), checks };
}
