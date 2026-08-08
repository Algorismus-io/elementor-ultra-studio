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
  // RETRYING api: right after a boot or bounce the WASM worker answers alive() yet still warms for
  // tens of seconds — a single 20s fetch abort here killed entire cold provisions (recurring field
  // failure: 'The operation was aborted due to timeout' right after '[newsite] worker bounced').
  // Three attempts with growing timeouts ride out the warm-up; the flow is idempotent anyway.
  const api = async (path, opts = {}) => {
    let lastErr;
    for (const timeoutMs of [20000, 45000, 90000]) {
      try {
        const res = await fetch(url + path, { ...opts, headers: { Authorization: auth, 'Content-Type': 'application/json', ...(opts.headers || {}) }, signal: AbortSignal.timeout(timeoutMs) });
        return { ok: res.ok, status: res.status, body: await res.json().catch(() => null) };
      } catch (e) { lastErr = e; await sleep(3000); }
    }
    throw lastErr;
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
    for (let i = 0; i < 120 && !up; i++) { await sleep(3000); up = await alive(); } // cold hydration downloads ~50MB — allow 6min
    if (!up) throw new Error(`site did not come up on :${port} within 360s`);
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

  // 3b) BOUNCE the worker so the patched plugin actually LOADS. PHP-WASM caches plugin code in the
  // running worker: files patched after boot are invisible until a restart — a site can pass every
  // check here and still EXECUTE the old plugin (real incident: a 4-page build ran on pre-fix
  // priming code because the worker predated the patch; pages ate each other's CSS a day later).
  // The supervisor respawns the killed worker with the patched files.
  try {
    const { execSync } = await import('node:child_process');
    const pid = execSync(`lsof -nP -t -iTCP:${port} -sTCP:LISTEN`, { encoding: 'utf8' }).trim().split('\n')[0];
    if (pid) {
      process.kill(Number(pid), 'SIGKILL');
      log('[newsite] worker bounced to load patched plugin …');
      let back = false;
      for (let i = 0; i < 60 && !back; i++) { await sleep(3000); back = await alive(); }
      if (!back) throw new Error(`worker did not respawn on :${port} after bounce`);
      await sleep(5000); // respawned-but-warming settle before the next API call
    }
  } catch (e) { if (/did not respawn/.test(String(e))) throw e; /* lsof miss → nothing to bounce */ }

  if (existsSync(proDst)) {
    const act = await api('/wp-json/wp/v2/plugins/elementor-pro/elementor-pro', { method: 'PUT', body: JSON.stringify({ status: 'active' }) });
    log(`[newsite] Pro: ${act.body?.status || `activation HTTP ${act.status}`}`);
  }

  // 4) verify the seam + static guard + that the RUNNING worker executes the patched plugin
  // (capabilities reports the loaded EMCP_VERSION — if it lags the on-disk header, the bounce
  // failed and the site is executing stale code)
  const caps = await api('/wp-json/elementor-ultra/v1/site/capabilities');
  let guard = { status: 0 };
  for (const tm of [8000, 20000, 45000]) {
    try { guard = await fetch(`${url}/wp-content/uploads/elementor/css/__nope__.css`, { redirect: 'manual', signal: AbortSignal.timeout(tm) }); break; }
    catch { await sleep(2000); }
  }
  const d = caps.body?.data || {};
  let expectedPlugin = null;
  const fixSrc = findPluginFixDir(pkgRoot);
  if (fixSrc) {
    const { readFileSync } = await import('node:fs');
    expectedPlugin = /define\(\s*'EMCP_VERSION',\s*'([^']+)'/.exec(readFileSync(join(fixSrc, 'elementor-ultra-mcp.php'), 'utf8'))?.[1] || null;
  }
  const runningPlugin = d.plugin_version || null;
  const pluginCurrent = !expectedPlugin || runningPlugin === expectedPlugin;
  if (!pluginCurrent) log(`[newsite] WARNING: running plugin ${runningPlugin} != patched ${expectedPlugin} — worker is executing STALE code; bounce it (kill the port listener; the supervisor respawns).`);
  return {
    url,
    user: 'admin',
    appPassword: 'VorycCYtTT00nOS06BJ0BePq',
    elementor: d.elementor_version || null,
    pro: d.pro_active ? d.pro_version : null,
    seam: caps.ok,
    staticGuard404: guard.status === 404,
    plugin: runningPlugin,
    pluginCurrent,
  };
}
