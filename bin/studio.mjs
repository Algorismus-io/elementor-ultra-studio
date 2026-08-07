#!/usr/bin/env node
/**
 * eu-studio — one-command, self-healing Elementor build environment for AI agents.
 *
 *   eu-studio up                       boot the hardened local WP (playground w/ supervisor) + doctor
 *   eu-studio status                   quick health line
 *   eu-studio doctor [--page <id>]     full health check + self-heal (CSS regen/prime, store integrity)
 *   eu-studio verify --page-url <u> --anchors <file> [--no-mobile] [--tolerance <px>]
 *                                      anchor-delta table + paint bands + mobile overflow, JSON out
 *   eu-studio brief [--figma <url>] [--title <t>] [--out <file>]
 *                                      generate a ready-to-run agent build brief for this environment
 *
 * Target resolution: --url/--user/--app-password flags → WP_URL/WP_USER/WP_APP_PASSWORD env →
 * the local playground snapshot's baked credentials.
 */
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { resolveEnv, api } from '../lib/env.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG = resolve(HERE, '..');
const argv = process.argv.slice(2);
const cmd = argv[0];
const has = (f) => argv.includes(f);
const val = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const c = { g: '\x1b[32m', r: '\x1b[31m', y: '\x1b[33m', d: '\x1b[2m', x: '\x1b[0m', b: '\x1b[36m' };
const flags = { url: val('--url'), user: val('--user'), appPassword: val('--app-password') };

const ok = (m) => console.log(`  ${c.g}✓${c.x} ${m}`);
const bad = (m) => console.log(`  ${c.r}✗${c.x} ${m}`);

function studioCliHint() { return process.env.npm_lifecycle_event ? 'eu-studio' : `node ${join(PKG, 'bin', 'studio.mjs')}`; }

function exjsxCliHint() {
  const req = createRequire(import.meta.url);
  try { return join(dirname(req.resolve('@algorismus/elementor-jsx/package.json')), 'src', 'cli.mjs'); } catch {}
  const local = resolve(PKG, '..', 'elementor-jsx', 'src', 'cli.mjs');
  if (existsSync(local)) return `node ${local}`;
  return 'npx -y @algorismus/elementor-jsx';
}

async function main() {
  const env = resolveEnv(flags);

  if (cmd === 'up') {
    // delegate to the playground bin (which now supervises itself); prefer a local sibling checkout
    const req = createRequire(import.meta.url);
    let bin = null;
    try { bin = join(dirname(req.resolve('@algorismus/elementor-ultra-playground/package.json')), 'bin', 'eu-playground.mjs'); } catch {}
    if (!bin || !existsSync(bin)) {
      const sibling = resolve(PKG, '..', 'elementor-ultra-playground', 'bin', 'eu-playground.mjs');
      if (existsSync(sibling)) bin = sibling;
    }
    if (!bin) { bad('playground not found — npm i @algorismus/elementor-ultra-playground'); process.exit(1); }
    console.log(`${c.b}[studio]${c.x} booting hardened local WordPress …`);
    const child = spawn('node', [bin, ...argv.slice(1).filter((a) => a !== 'up')], { stdio: 'inherit' });
    child.on('close', (code) => process.exit(code ?? 0));
    // run a doctor pass once the site answers
    const t0 = Date.now();
    const poll = setInterval(async () => {
      try {
        const r = await fetch(`${env.url}/wp-json/`, { signal: AbortSignal.timeout(2000) });
        if (r.ok) {
          clearInterval(poll);
          const { run } = await import('../lib/doctor.mjs');
          const rep = await run(env, { heal: true });
          console.log(`${c.b}[studio]${c.x} doctor: ${rep.ok ? c.g + 'all checks green' + c.x : c.y + 'issues found — run `eu-studio doctor` for detail' + c.x}`);
          console.log(`${c.b}[studio]${c.x} agent brief: ${studioCliHint()} brief`);
        } else if (Date.now() - t0 > 180000) clearInterval(poll);
      } catch { if (Date.now() - t0 > 180000) clearInterval(poll); }
    }, 2000);
    return;
  }

  if (cmd === 'status') {
    if (!env.url) { bad('no target site (set WP_URL or install the playground)'); process.exit(1); }
    try {
      const r = await fetch(env.url + '/', { signal: AbortSignal.timeout(5000) });
      const caps = await api(env, '/elementor-ultra/v1/site/capabilities');
      const d = caps.body?.data || {};
      (r.ok && caps.ok ? ok : bad)(`${env.url} — site ${r.status}, Elementor ${d.elementor_version || '?'}${d.pro_active ? ` + Pro` : ''}, seam ${caps.ok ? 'up' : 'DOWN'}`);
      process.exit(r.ok && caps.ok ? 0 : 1);
    } catch (e) { bad(`${env.url} unreachable (${e.message})`); process.exit(1); }
  }

  if (cmd === 'doctor') {
    if (!env.auth) { bad('missing credentials (WP_USER/WP_APP_PASSWORD)'); process.exit(1); }
    const { run } = await import('../lib/doctor.mjs');
    const rep = await run(env, { pageId: val('--page', null), heal: !has('--no-heal') });
    for (const chk of rep.checks) (chk.ok ? ok : bad)(`${chk.name}: ${chk.detail}${chk.healed ? c.d + ' (heal attempted)' + c.x : ''}`);
    if (has('--json')) console.log(JSON.stringify(rep, null, 2));
    process.exit(rep.ok ? 0 : 1);
  }

  if (cmd === 'verify') {
    const anchorsPath = val('--anchors');
    const pageUrl = val('--page-url', '/');
    if (!anchorsPath) {
      console.log(`usage: eu-studio verify --page-url </home/ or full url> --anchors anchors.json [--no-mobile] [--tolerance 2]

anchors.json shape:
  { "viewport": 1200, "totalHeight": 4081,
    "anchors": [ { "name": "hero-h1", "selector": "h1", "y": 255 },
                 { "name": "signup",  "selector": "text=Get instant access", "y": 3660 } ],
    "bands":   [ { "name": "ticker", "y0": 930, "y1": 975, "minInkPx": 500 } ] }

selector = CSS selector or "text=<exact starting text>". y targets are design-absolute px.
bands assert a strip actually PAINTS (catches invisible dark-on-dark assets).`);
      process.exit(2);
    }
    const { run } = await import('../lib/verify.mjs');
    const rep = await run(env, { pageUrl, anchorsPath, mobile: !has('--no-mobile'), tolerance: Number(val('--tolerance', 2)) });
    // human summary + machine JSON
    for (const a of rep.anchors) (a.ok ? ok : bad)(`${a.name}: target ${a.target} actual ${a.actual ?? 'NOT FOUND'} (Δ ${a.delta ?? '—'})`);
    if (rep.height?.target) (rep.height.ok ? ok : bad)(`height: ${rep.height.actual} vs ${rep.height.target}`);
    for (const b of rep.bands) (b.ok ? ok : bad)(`band ${b.name}: ${b.inkPx} ink px (min ${b.minInkPx})`);
    if (rep.mobile) (rep.mobile.ok ? ok : bad)(`mobile 390: scrollWidth ${rep.mobile.scrollWidth}${rep.mobile.offenders.length ? ' — offenders: ' + rep.mobile.offenders.join(', ') : ''}`);
    console.log(JSON.stringify(rep));
    process.exit(rep.pass ? 0 : 1);
  }

  if (cmd === 'newsite') {
    const port = Number(val('--port'));
    const dir = val('--dir');
    if (!port || !dir) { console.log('usage: eu-studio newsite --port <n> --dir <site-dir>  (boots + patches plugin + activates Pro + verifies; idempotent)'); process.exit(2); }
    const { up } = await import('../lib/newsite.mjs');
    const info = await up({ port, dir, pkgRoot: PKG });
    (info.seam && info.staticGuard404 ? ok : bad)(`${info.url} — Elementor ${info.elementor}${info.pro ? ` + Pro ${info.pro}` : ''}, seam ${info.seam ? 'up' : 'DOWN'}, static-guard ${info.staticGuard404 ? '404 ✓' : 'MISSING'}`);
    console.log(JSON.stringify(info));
    process.exit(info.seam ? 0 : 1);
  }

  if (cmd === 'pixeldiff') {
    const referencePath = val('--reference');
    if (!referencePath) { console.log('usage: eu-studio pixeldiff --page-url </ or url> --reference <design.png> [--keep-shots <dir>]'); process.exit(2); }
    const { run } = await import('../lib/pixeldiff.mjs');
    const rep = await run(env, { pageUrl: val('--page-url', '/'), referencePath, keepShots: val('--keep-shots', null) });
    const g = rep.meanAbsDiff <= 8;
    (g ? ok : bad)(`photometric: mean |Δ| ${rep.meanAbsDiff}/255 (≤3 near-identical, 3-8 faithful, 8-20 visible deviations), worst 50px band ${rep.worstBand.mean} at y${rep.worstBand.band_y}`);
    console.log(JSON.stringify(rep));
    process.exit(0);
  }

  if (cmd === 'bench') {
    const sub = argv[1];
    const scenarioDir = val('--scenario');
    if (sub === 'brief') {
      const { readFileSync: rf, writeFileSync: wf } = await import('node:fs');
      const scenario = val('--scenario');
      const runId = val('--run-id');
      const projectDir = val('--project-dir');
      if (!scenario || !runId || !projectDir || !env.url) {
        console.log('usage: eu-studio bench brief --scenario <dir> --run-id <id> --project-dir <fs-project dir> [--url <wp url>] [--out <file>]');
        process.exit(2);
      }
      const scDir = resolve(scenario);
      const tpl = rf(join(scDir, 'brief-template.md'), 'utf8');
      const pw = process.env.EXJSX_IT_PLAYWRIGHT || 'playwright';
      const rendered = tpl
        .replaceAll('{{WP_URL}}', env.url)
        .replaceAll('{{RUN_ID}}', runId)
        .replaceAll('{{PROJECT_DIR}}', resolve(projectDir))
        .replaceAll('{{SCENARIO_DIR}}', scDir)
        .replaceAll('{{PLAYWRIGHT}}', pw)
        .replaceAll('{{EXJSX_CLI}}', exjsxCliHint())
        .replaceAll('{{STUDIO_CLI}}', studioCliHint());
      const leftover = rendered.match(/\{\{[A-Z_]+\}\}/g);
      if (leftover) { bad(`unrendered placeholders: ${[...new Set(leftover)].join(', ')}`); process.exit(1); }
      const out = val('--out', null);
      if (out) { wf(out, rendered); ok(`brief → ${out}`); } else console.log(rendered);
      return;
    }
    if (!scenarioDir || !['score', 'compare'].includes(sub)) {
      console.log(`usage: eu-studio bench score   --scenario <dir> --page-url </ or url> [--run-id <id>] [--notes <s>] [--agent-json '{"wallMin":28,"toolCalls":73,"tokens":183004,"rounds":3}']
       eu-studio bench compare --scenario <dir>

A scenario dir contains scenario.json (name, reference, anchorsFile, fidelityBar), the reference
render, anchors.json (with minW/minH presence floors + paint bands), a brief template and assets.
'score' runs geometric verify + photometric pixeldiff and appends one record to <dir>/runs.jsonl.`);
      process.exit(2);
    }
    const bench = await import('../lib/bench.mjs');
    if (sub === 'compare') { console.log(bench.formatCompare(bench.compare(scenarioDir))); return; }
    const agentJson = val('--agent-json', null);
    const rec = await bench.score(env, scenarioDir, {
      pageUrl: val('--page-url', '/'),
      runId: val('--run-id', null),
      notes: val('--notes', ''),
      agent: agentJson ? JSON.parse(agentJson) : null,
    });
    (rec.pass ? ok : bad)(`${rec.runId}: geometric ${rec.geometric.pass ? 'pass' : 'FAIL'} (mean ${rec.geometric.anchorMeanPx}px${rec.geometric.anchorsFailed.length ? ', failed: ' + rec.geometric.anchorsFailed.join(',') : ''}), photometric ${rec.photometric.pass ? 'pass' : 'FAIL'} (mean ${rec.photometric.meanAbsDiff}/255)`);
    console.log(JSON.stringify(rec));
    process.exit(rec.pass ? 0 : 1);
  }

  if (cmd === 'brief') {
    const caps = env.auth ? await api(env, '/elementor-ultra/v1/site/capabilities').catch(() => null) : null;
    const d = caps?.body?.data || {};
    const figma = val('--figma', null);
    const tpl = readFileSync(join(PKG, 'templates', 'brief.md'), 'utf8');
    const brief = tpl
      .replaceAll('{{TITLE}}', val('--title', figma ? 'Figma design' : 'the requested page'))
      .replaceAll('{{WP_URL}}', env.url || 'SET_WP_URL')
      .replaceAll('{{WP_USER}}', env.user || 'SET_WP_USER')
      .replaceAll('{{WP_APP_PASSWORD}}', env.appPassword || 'SET_WP_APP_PASSWORD')
      .replaceAll('{{SITE_LINE}}', caps ? `Elementor ${d.elementor_version}${d.pro_active ? ` + Pro ${d.pro_version} (active)` : ' (free)'}, atomic elements ${d.atomic_available ? 'available' : 'UNAVAILABLE'}, companion plugin live.` : 'Run `eu-studio doctor` before starting.')
      .replaceAll('{{EXJSX_CLI}}', exjsxCliHint())
      .replaceAll('{{STUDIO_CLI}}', studioCliHint())
      .replaceAll('{{DESIGN_BLOCK}}', figma
        ? `Figma: ${figma}\nExtract with the Figma MCP tools (get_metadata for structure/anchors → download_assets per section\nfor images/SVGs → full-res export as ground truth). Transcribe exact copy; sample colors from pixels;\nidentify assets by dimensions. Upload images to THIS site and reference absolute URLs.`
        : 'No design link was provided — ask for one, or build from the written spec you were given.');
    const out = val('--out', null);
    if (out) { writeFileSync(out, brief); console.log(`brief → ${out}`); }
    else console.log(brief);
    return;
  }

  console.log(`eu-studio — self-healing Elementor build environment for AI agents

  up        boot hardened local WordPress (crash-supervised) + health check
  status    one-line health
  doctor    full health check + self-heal   [--page <id>] [--no-heal] [--json]
  verify    anchor/paint/mobile verification [--page-url <u>] --anchors <file>
  brief     generate an agent build brief    [--figma <url>] [--title <t>] [--out <f>]

  target: --url/--user/--app-password → WP_URL/WP_USER/WP_APP_PASSWORD env → local playground default`);
  process.exit(cmd ? 2 : 0);
}

main().catch((e) => { console.error(`${c.r}[studio]${c.x} ${e.message}`); process.exit(1); });
