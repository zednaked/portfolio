// Fails the build when the JavaScript grows past its budget, gzip sizes.
// The entry chunk is what a phone must parse before the page responds; the
// page's own chunks are everything a visit loads. The 3D chunk (three.js, for
// the CODE act's opening) has a budget of its own: it loads only when that
// act comes near, and only on a real GPU.
import { readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const BUDGET = { entry: 125 * 1024, page: 150 * 1024, scene: 140 * 1024 };
const dir = new URL('../dist/assets/', import.meta.url);
const sizes = readdirSync(dir)
  .filter((f) => f.endsWith('.js'))
  .map((f) => ({ f, gz: gzipSync(readFileSync(new URL(f, dir))).length }));
const entry = sizes.find((s) => s.f.startsWith('index-'));
const scene = sizes.find((s) => s.f.startsWith('flood-scene-'));
const page = sizes.filter((s) => s !== scene).reduce((n, s) => n + s.gz, 0);
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

console.log(
  `entry ${kb(entry?.gz ?? 0)} of ${kb(BUDGET.entry)}, page JS ${kb(page)} of ${kb(BUDGET.page)}, ` +
    `3D chunk ${kb(scene?.gz ?? 0)} of ${kb(BUDGET.scene)}`,
);
if (!entry || !scene || entry.gz > BUDGET.entry || page > BUDGET.page || scene.gz > BUDGET.scene) {
  console.error('JavaScript over budget');
  process.exit(1);
}
