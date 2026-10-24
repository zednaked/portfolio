// Lighthouse on the live site, phone profile, median of three runs, with the
// thresholds the README claims. Runs after each deploy (CI), or by hand:
//   node scripts/lighthouse.mjs [url]
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const url = process.argv[2] ?? 'https://zednaked.github.io/portfolio/';
const LIMITS = { performance: 0.8, accessibility: 1, lcp: 3500, tbt: 400, cls: 0.05 };
const dir = mkdtempSync(join(tmpdir(), 'lh-'));
const runs = [0, 1, 2].map((i) => {
  const out = join(dir, `run${i}.json`);
  execFileSync(
    'npx',
    [
      '--yes',
      'lighthouse@13.5.0',
      url,
      '--only-categories=performance,accessibility',
      '--chrome-flags=--headless=new --no-sandbox',
      '--output=json',
      `--output-path=${out}`,
      '--quiet',
    ],
    { stdio: 'inherit' },
  );
  const r = JSON.parse(readFileSync(out, 'utf8'));
  return {
    performance: r.categories.performance.score,
    accessibility: r.categories.accessibility.score,
    lcp: r.audits['largest-contentful-paint'].numericValue,
    tbt: r.audits['total-blocking-time'].numericValue,
    cls: r.audits['cumulative-layout-shift'].numericValue,
  };
});
const median = (k) => runs.map((r) => r[k]).sort((a, b) => a - b)[1];
const m = Object.fromEntries(Object.keys(LIMITS).map((k) => [k, median(k)]));
console.log(
  `performance ${Math.round(m.performance * 100)}, accessibility ${Math.round(m.accessibility * 100)}, ` +
    `LCP ${(m.lcp / 1000).toFixed(2)} s, TBT ${Math.round(m.tbt)} ms, CLS ${m.cls.toFixed(3)}`,
);
const fails = [
  m.performance < LIMITS.performance && 'performance',
  m.accessibility < LIMITS.accessibility && 'accessibility',
  m.lcp > LIMITS.lcp && 'LCP',
  m.tbt > LIMITS.tbt && 'TBT',
  m.cls > LIMITS.cls && 'CLS',
].filter(Boolean);
if (fails.length) {
  console.error(`over the limit: ${fails.join(', ')}`);
  process.exit(1);
}
