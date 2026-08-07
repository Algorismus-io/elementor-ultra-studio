/**
 * env.mjs — resolve the studio's target site + credentials.
 * Order: explicit flags → environment → the playground snapshot manifest (local dev default).
 */
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

export function resolveEnv(flags = {}) {
  const env = {
    url: flags.url || process.env.WP_URL || null,
    user: flags.user || process.env.WP_USER || null,
    appPassword: flags.appPassword || process.env.WP_APP_PASSWORD || null,
  };
  if (!env.url || !env.appPassword) {
    // fall back to the playground snapshot's baked local credentials
    const manifestCandidates = [];
    try {
      const req = createRequire(import.meta.url);
      manifestCandidates.push(join(dirname(req.resolve('@algorismus/elementor-ultra-playground/package.json')), 'snapshot', 'manifest.json'));
    } catch { /* not installed as a dep */ }
    // sibling checkout (monorepo-style dev layout)
    manifestCandidates.push(join(dirname(dirname(new URL(import.meta.url).pathname)), '..', 'elementor-ultra-playground', 'snapshot', 'manifest.json'));
    for (const m of manifestCandidates) {
      if (!existsSync(m)) continue;
      try {
        const manifest = JSON.parse(readFileSync(m, 'utf8'));
        env.url = env.url || `http://127.0.0.1:${manifest.default_port || 8899}`;
        env.user = env.user || manifest.credentials?.WP_USER || 'admin';
        env.appPassword = env.appPassword || manifest.credentials?.WP_APP_PASSWORD || null;
        break;
      } catch { /* keep looking */ }
    }
  }
  env.auth = env.user && env.appPassword
    ? 'Basic ' + Buffer.from(`${env.user}:${env.appPassword}`).toString('base64')
    : null;
  return env;
}

export async function api(env, path, opts = {}) {
  const res = await fetch(`${env.url}/wp-json${path}`, {
    ...opts,
    headers: { Authorization: env.auth, 'Content-Type': 'application/json', ...(opts.headers || {}) },
    signal: opts.signal || AbortSignal.timeout(opts.timeoutMs || 20000),
  });
  let body = null;
  try { body = await res.json(); } catch { /* non-JSON */ }
  return { ok: res.ok, status: res.status, body };
}

/** Resolve a usable playwright module path: env override → toolset install → plain resolve. */
export function resolvePlaywright() {
  if (process.env.EXJSX_IT_PLAYWRIGHT && existsSync(process.env.EXJSX_IT_PLAYWRIGHT)) return process.env.EXJSX_IT_PLAYWRIGHT;
  const req = createRequire(import.meta.url);
  for (const spec of ['playwright', 'playwright-core']) {
    try { return req.resolve(spec); } catch { /* keep looking */ }
  }
  const cwdGuess = join(process.cwd(), 'node_modules', 'playwright', 'index.mjs');
  if (existsSync(cwdGuess)) return cwdGuess;
  return null;
}
