/**
 * newsite.mjs — one command to a fully provisioned bench/build site. Replaces the manual 4-step
 * ritual (boot playground → wait → copy+activate Pro → hand-patch plugin fixes) that every fresh
 * run repeated. Idempotent: re-running against a live port just re-verifies.
 *
 * Sources:
 *  - Pro plugin dir: EXJSX_PRO_DIR, or auto-discovered from a sibling site that has one.
 *  - Companion-plugin fixes: the local elementor-ultra-mcp checkout (until the playground snapshot
 *    tarball is rebuilt with the fixed plugin, freshly hydrated sites carry the OLD plugin).
 */
import { spawn } from 'node:child_process';
import { existsSync, cpSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findPlaygroundBin(pkgRoot) {
  const req = createRequire(import.meta.url);
  try { return join(dirname(req.resolve('@algorismus/elementor-ultra-playground/package.json')), 'bin', 'eu-playground.mjs'); } catch {}
  const sibling = resolve(pkgRoot, '..', 'elementor-ultra-playground', 'bin', 'eu-playground.mjs');
  return existsSync(sibling) ? sibling : null;
}

function findProDir(pkgRoot) {
  if (process.env.EXJSX_PRO_DIR && existsSync(process.env.EXJSX_PRO_DIR)) return process.env.EXJSX_PRO_DIR;
  // any provisioned local site that already has Pro
  const guesses = [
    join(process.env.HOME || '', '.cache', 'elementor-ultra-playground', 'v1', 'site', 'wp-content', 'plugins', 'elementor-pro'),
  ];
  for (const g of guesses) if (existsSync(g)) return g;
  return null;
}

function findPluginFixDir(pkgRoot) {
  const local = resolve(pkgRoot, '..', 'elementor-ultra-mcp', 'plugin', 'elementor-ultra-mcp');
  return existsSync(local) ? local : null;
}

export async function up({ port, dir, pkgRoot, log = console.error }) {
  const url = `http://127.0.0.1:${port}`;
  const site = resolve(dir);
  const auth = 'Basic ' + Buffer.from('admin:VorycCYtTT00nOS06BJ0BePq').toString('base64');
  const api = async (path, opts = {}) => {
    const res = await fetch(url + path, { ...opts, headers: { Authorization: auth, 'Content-Type': 'application/json', ...(opts.headers || {}) }, signal: AbortSignal.timeout(20000) });
    return { ok: res.ok, status: res.status, body: await res.json().catch(() => null) };
  };
  const alive = async () => { try { return (await fetch(url + '/', { signal: AbortSignal.timeout(2500) })).ok; } catch { return false; } };

  // 1) boot (skip if already serving)
  if (!(await alive())) {
    const bin = findPlaygroundBin(pkgRoot);
    if (!bin) throw new Error('playground bin not found — npm i @algorismus/elementor-ultra-playground');
    log(`[newsite] booting playground on :${port} (dir ${site}) …`);
    const child = spawn('node', [bin, '--port', String(port), '--dir', site, '--quiet'], { detached: true, stdio: 'ignore' });
    child.unref();
    let up = false;
    for (let i = 0; i < 40 && !up; i++) { await sleep(3000); up = await alive(); }
    if (!up) throw new Error(`site did not come up on :${port} within 120s`);
  } else log(`[newsite] :${port} already serving — reusing.`);

  // 2) companion-plugin fixes (snapshot ships the pre-fix plugin)
  const fix = findPluginFixDir(pkgRoot);
  const pluginDst = join(site, 'wp-content', 'plugins', 'elementor-ultra-mcp');
  if (fix && existsSync(pluginDst)) {
    cpSync(join(fix, 'elementor-ultra-mcp.php'), join(pluginDst, 'elementor-ultra-mcp.php'));
    cpSync(join(fix, 'includes', 'core', 'class-css-primer.php'), join(pluginDst, 'includes', 'core', 'class-css-primer.php'));
    cpSync(join(fix, 'includes', 'core', 'class-cache-service.php'), join(pluginDst, 'includes', 'core', 'class-cache-service.php'));
    log('[newsite] companion plugin patched from local checkout.');
  }

  // 3) Elementor Pro (optional — skipped when no local source)
  const proDst = join(site, 'wp-content', 'plugins', 'elementor-pro');
  if (!existsSync(proDst)) {
    const pro = findProDir(pkgRoot);
    if (pro) { cpSync(pro, proDst, { recursive: true }); log('[newsite] Pro plugin files copied.'); }
    else log('[newsite] no Pro source found (set EXJSX_PRO_DIR) — continuing free-only.');
  }
  if (existsSync(proDst)) {
    const act = await api('/wp-json/wp/v2/plugins/elementor-pro/elementor-pro', { method: 'PUT', body: JSON.stringify({ status: 'active' }) });
    log(`[newsite] Pro: ${act.body?.status || `activation HTTP ${act.status}`}`);
  }

  // 4) verify the seam + static guard
  const caps = await api('/wp-json/elementor-ultra/v1/site/capabilities');
  const guard = await fetch(`${url}/wp-content/uploads/elementor/css/__nope__.css`, { redirect: 'manual', signal: AbortSignal.timeout(8000) });
  const d = caps.body?.data || {};
  return {
    url,
    user: 'admin',
    appPassword: 'VorycCYtTT00nOS06BJ0BePq',
    elementor: d.elementor_version || null,
    pro: d.pro_active ? d.pro_version : null,
    seam: caps.ok,
    staticGuard404: guard.status === 404,
  };
}
