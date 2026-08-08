/**
 * check.mjs — the ENTIRE post-deploy gate in one command and ONE browser session: the structural
 * matrix (verify --pages) plus the interaction tests (clicktest), sharing a single Chromium launch.
 * Field timing: verify + clicktest as separate calls cost 3 browser launches and 2 model
 * round-trips (~90s + turn overhead) in the tail of every build; this is one call.
 */
import { resolvePlaywright } from './env.mjs';

export async function run(env, { pages, widths, tests }) {
  const pwPath = resolvePlaywright();
  if (!pwPath) throw new Error('playwright not found — npm i playwright or set EXJSX_IT_PLAYWRIGHT');
  const { chromium } = await import('file://' + pwPath.replace(/^file:\/\//, ''));
  const browser = await chromium.launch();
  try {
    const { run: verify } = await import('./quickverify.mjs');
    const { run: clicktest } = await import('./clicktest.mjs');
    const structural = await verify(env, { pages, widths }, browser);
    const interactions = tests?.length ? await clicktest(env, { tests }, browser) : { pass: true, results: [] };
    return { pass: structural.pass && interactions.pass, structural, interactions };
  } finally { await browser.close(); }
}
