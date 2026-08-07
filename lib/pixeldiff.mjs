/**
 * pixeldiff.mjs — photometric fidelity: how closely does the RENDERED page match a reference
 * design image? Anchors measure geometry; this measures appearance (gradients, art, type ink).
 *
 * Method: capture the page as VIEWPORT SLICES at the reference's width (fullPage captures of tall
 * pages deterministically drop bottom-of-page image paint — never diff against one), scroll-settled
 * and animation-finished, then compare each slice against the corresponding crop of the reference.
 *
 * Score: per-slice mean |Δ| luminance (0-255) and worst 50px-band mean, aggregated page-wide.
 * Interpretation guide (empirical): ≤3 near-identical · 3-8 faithful (font/AA noise) ·
 * 8-20 visible deviations · >20 structurally different.
 *
 * Comparison uses python3+PIL/numpy via a generated script (fast, no native npm deps).
 */
import { resolvePlaywright } from './env.mjs';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

export async function run(env, { pageUrl, referencePath, viewportHeight = 900, keepShots = null }) {
  const pwPath = resolvePlaywright();
  if (!pwPath) throw new Error('playwright not found — npm i playwright or set EXJSX_IT_PLAYWRIGHT');
  const { chromium } = await import('file://' + pwPath.replace(/^file:\/\//, ''));

  // reference dimensions drive the capture
  const dims = execFileSync('python3', ['-c', `
from PIL import Image; import sys
im = Image.open(sys.argv[1]); print(im.width, im.height)`, referencePath], { encoding: 'utf8' }).trim().split(' ').map(Number);
  const [refW, refH] = dims;

  const url = pageUrl.startsWith('http') ? pageUrl : env.url + pageUrl;
  const dir = keepShots || mkdtempSync(join(tmpdir(), 'eu-pixeldiff-'));
  const browser = await chromium.launch();
  const slices = [];
  try {
    const page = await browser.newPage({ viewport: { width: refW, height: viewportHeight } });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.evaluate(async () => {
      // neutralize smooth scrolling for capture determinism — WP themes ship scroll-behavior:smooth,
      // which makes window.scrollTo animate and slice captures land mid-glide (inflated diffs)
      const st = document.createElement('style'); st.textContent = 'html,body{scroll-behavior:auto!important}'; document.head.appendChild(st);
      for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); }
      window.scrollTo(0, 0);
      document.getAnimations().forEach((a) => { try { a.finish(); } catch {} });
      await new Promise((r) => setTimeout(r, 300));
    });
    const pageH = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < Math.min(pageH, refH); y += viewportHeight) {
      const target = Math.min(y, Math.max(0, pageH - viewportHeight));
      await page.evaluate((t) => window.scrollTo(0, t), target);
      await page.waitForTimeout(250);
      const actual = await page.evaluate(() => window.scrollY);
      const p = join(dir, `slice-${y}.png`);
      await page.screenshot({ path: p, type: 'png' });
      slices.push({ path: p, scrollY: actual });
    }
    const result = { url, reference: referencePath, refSize: [refW, refH], pageHeight: pageH, slices: slices.length };

    const script = `
import json, sys
from PIL import Image
import numpy as np
ref = np.array(Image.open(${JSON.stringify(referencePath)}).convert('L')).astype(int)
slices = json.loads(sys.argv[1])
diffs = []
worst = {'band_y': None, 'mean': 0.0}
total = 0.0; rows = 0
for s in slices:
    im = np.array(Image.open(s['path']).convert('L')).astype(int)
    y0 = int(s['scrollY'])
    h = min(im.shape[0], ref.shape[0] - y0)
    if h <= 0: continue
    a = im[:h, :ref.shape[1]]
    b = ref[y0:y0+h, :im.shape[1]]
    w = min(a.shape[1], b.shape[1])
    d = np.abs(a[:, :w] - b[:, :w]).astype(float)
    diffs.append({'y0': y0, 'h': h, 'mean': round(float(d.mean()), 2)})
    total += float(d.sum()); rows += d.shape[0] * d.shape[1]
    for by in range(0, h - 49, 50):
        m = float(d[by:by+50].mean())
        if m > worst['mean']: worst = {'band_y': y0 + by, 'mean': round(m, 2)}
print(json.dumps({'meanAbsDiff': round(total / max(rows, 1), 2), 'worstBand': worst, 'perSlice': diffs}))`;
    const sp = join(dir, '_score.py');
    writeFileSync(sp, script);
    const out = execFileSync('python3', [sp, JSON.stringify(slices)], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    Object.assign(result, JSON.parse(out.trim().split('\n').pop()));
    result.shotsDir = dir;
    return result;
  } finally { await browser.close(); }
}
