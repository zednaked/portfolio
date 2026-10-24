// Fails the build when the JavaScript grows past its budget, gzip sizes.
// The entry chunk is what a phone must parse before the page responds.
import { readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const BUDGET = { entry: 125 * 1024, total: 150 * 1024 };
const dir = new URL('../dist/assets/', import.meta.url);
const sizes = readdirSync(dir)
  .filter((f) => f.endsWith('.js'))
  .map((f) => ({ f, gz: gzipSync(readFileSync(new URL(f, dir))).length }));
const entry = sizes.find((s) => s.f.startsWith('index-'));
const total = sizes.reduce((n, s) => n + s.gz, 0);
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

console.log(`entry ${kb(entry?.gz ?? 0)} of ${kb(BUDGET.entry)}, all JS ${kb(total)} of ${kb(BUDGET.total)}`);
if (!entry || entry.gz > BUDGET.entry || total > BUDGET.total) {
  console.error('JavaScript over budget');
  process.exit(1);
}
