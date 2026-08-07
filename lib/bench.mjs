/**
 * bench.mjs — repeatable benchmark scenarios + a run ledger, so pipeline changes are measured
 * instead of vibed. A scenario dir packages everything a run needs (scenario.json, brief template,
 * reference render, anchors incl. presence/size floors and paint bands, assets); every scored run
 * appends one JSON line to <scenario>/runs.jsonl with BOTH fidelity axes (geometric verify +
 * photometric pixel diff) plus whatever agent metrics the caller knows (wall/tool-calls/tokens).
 *
 * `compare` prints the ledger as a table — the regression/progress view for future recons.
 */
import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

export function loadScenario(dir) {
  const d = resolve(dir);
  const spec = JSON.parse(readFileSync(join(d, 'scenario.json'), 'utf8'));
  return { dir: d, spec, anchorsPath: join(d, spec.anchorsFile || 'anchors.json'), referencePath: join(d, spec.reference) };
}

export async function score(env, scenarioDir, { pageUrl, runId, notes = '', agent = null, startedAt = null }) {
  const sc = loadScenario(scenarioDir);
  const { run: verify } = await import('./verify.mjs');
  const { run: pixeldiff } = await import('./pixeldiff.mjs');
  const { run: doctor } = await import('./doctor.mjs');

  // Health gate BEFORE capturing: a deploy/save flushes Elementor's CSS, and scoring during the
  // regeneration window measures an unstyled page (real incident: three garbage ledger rows with
  // height 2489 vs 4081). Doctor heals CSS and reports store integrity; its result rides along.
  const health = await doctor(env, { heal: true });

  let v = await verify(env, { pageUrl, anchorsPath: sc.anchorsPath, mobile: true, tolerance: sc.spec.fidelityBar?.anchorMeanPx ?? 2 });

  // Settle-retry: a capture can race a JUST-flushed deploy even after a healthy doctor pass — the
  // CSS regenerates between the health check and the screenshot, and the run records a garbage row
  // (real incident: height 1074 vs 4081, every anchor off by ~2000px). A catastrophic geometric
  // miss on a healthy site is that race, not a build state worth recording: re-heal and re-measure
  // once before believing it.
  const catastrophic = (r) => r.height?.target && Math.abs(r.height.actual - r.height.target) > r.height.target * 0.2;
  if (health.ok && catastrophic(v)) {
    await new Promise((r) => setTimeout(r, 4000));
    await doctor(env, { heal: true });
    v = await verify(env, { pageUrl, anchorsPath: sc.anchorsPath, mobile: true, tolerance: sc.spec.fidelityBar?.anchorMeanPx ?? 2 });
  }
  const p = await pixeldiff(env, { pageUrl, referencePath: sc.referencePath });

  const deltas = v.anchors.filter((a) => a.delta != null).map((a) => Math.abs(a.delta));
  const record = {
    runId: runId || `run-${Date.now()}`,
    scenario: sc.spec.name,
    scoredAt: startedAt || new Date().toISOString(),
    site: env.url,
    pageUrl,
    notes,
    healthy: health.ok,
    agent, // { wallMin, toolCalls, tokens, rounds } — caller-supplied, null for manual scores
    geometric: {
      pass: v.pass,
      anchorMeanPx: deltas.length ? Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length * 100) / 100 : null,
      anchorWorstPx: deltas.length ? Math.max(...deltas) : null,
      anchorsFailed: v.anchors.filter((a) => !a.ok).map((a) => a.name),
      height: v.height,
      bands: v.bands,
      mobile: v.mobile ? { scrollWidth: v.mobile.scrollWidth, ok: v.mobile.ok } : null,
      generalization: v.generalization || null,
    },
    photometric: {
      meanAbsDiff: p.meanAbsDiff,
      worstBand: p.worstBand,
      perSlice: p.perSlice,
      pass: p.meanAbsDiff <= (sc.spec.fidelityBar?.pixelMeanMax ?? 10),
    },
  };
  record.pass = record.geometric.pass && record.photometric.pass;
  appendFileSync(join(sc.dir, 'runs.jsonl'), JSON.stringify(record) + '\n');
  return record;
}

export function backfill(scenarioDir, record) {
  const sc = loadScenario(scenarioDir);
  appendFileSync(join(sc.dir, 'runs.jsonl'), JSON.stringify(record) + '\n');
  return record;
}

export function compare(scenarioDir) {
  const sc = loadScenario(scenarioDir);
  const ledger = join(sc.dir, 'runs.jsonl');
  if (!existsSync(ledger)) return { scenario: sc.spec.name, runs: [] };
  const runs = readFileSync(ledger, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  return { scenario: sc.spec.name, bar: sc.spec.fidelityBar, runs };
}

export function formatCompare({ scenario, bar, runs }) {
  const rows = [['run', 'when', 'pass', 'anchors(mean/worst px)', 'pixel(mean/worst)', 'height', 'mobile', 'wall', 'calls', 'tokens', 'notes']];
  for (const r of runs) {
    rows.push([
      r.runId,
      (r.scoredAt || '').slice(0, 16).replace('T', ' '),
      r.pass ? 'PASS' : 'fail',
      r.geometric ? `${r.geometric.anchorMeanPx ?? '—'}/${r.geometric.anchorWorstPx ?? '—'}${r.geometric.anchorsFailed?.length ? ` (!${r.geometric.anchorsFailed.join(',')})` : ''}` : '—',
      r.photometric ? `${r.photometric.meanAbsDiff}/${r.photometric.worstBand?.mean ?? '—'}` : '—',
      r.geometric?.height ? `${r.geometric.height.actual}` : '—',
      r.geometric?.mobile ? String(r.geometric.mobile.scrollWidth) : '—',
      r.agent?.wallMin != null ? `${r.agent.wallMin}m` : '—',
      r.agent?.toolCalls ?? '—',
      r.agent?.tokens != null ? `${Math.round(r.agent.tokens / 1000)}k` : '—',
      (r.notes || '').slice(0, 44),
    ]);
  }
  const widths = rows[0].map((_, i) => Math.max(...rows.map((r) => String(r[i]).length)));
  const lines = rows.map((r) => r.map((c, i) => String(c).padEnd(widths[i])).join('  '));
  lines.splice(1, 0, widths.map((w) => '-'.repeat(w)).join('  '));
  return `scenario: ${scenario}  (bar: anchors ≤${bar?.anchorMeanPx}px, pixel ≤${bar?.pixelMeanMax})\n` + lines.join('\n');
}
