// One-off: bakes the flood piece's terrain from Cheia's own data
// (github.com/zednaked/cheia, public/data/terreno.bin.gz: SRTM relief of
// Curitiba and its metro area, 1536 × 1536 cells of about 34 m, with the river
// mask). Writes public/data/cheia-terrain.png, 256 × 256: height as 16 bits
// in red and green, rivers in blue.
//   node scripts/bake-cheia.mjs ../../cheia/public/data/terreno.bin.gz
import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync, deflateSync } from 'node:zlib';

const src = process.argv[2];
if (!src) throw new Error('usage: node scripts/bake-cheia.mjs <path to terreno.bin.gz>');
const buf = gunzipSync(readFileSync(src));
const [W, H, Q] = new Int32Array(buf.buffer, buf.byteOffset, 3);
const n = W * H;
const delta = new Int32Array(buf.buffer.slice(buf.byteOffset + 12, buf.byteOffset + 12 + 4 * n));
const river = buf.subarray(12 + 8 * n, 12 + 9 * n);
const height = new Float32Array(n);
let z = 0;
for (let k = 0; k < n; k++) {
  z = k % W ? z + delta[k] : delta[k];
  height[k] = z / Q;
}

const S = 256;
const f = W / S;
const out = new Float32Array(S * S);
const riv = new Uint8Array(S * S);
for (let y = 0; y < S; y++)
  for (let x = 0; x < S; x++) {
    let h = 0;
    let r = 0;
    for (let j = 0; j < f; j++)
      for (let i = 0; i < f; i++) {
        const k = (y * f + j) * W + x * f + i;
        h += height[k];
        r = Math.max(r, river[k]);
      }
    out[y * S + x] = h / (f * f);
    riv[y * S + x] = r ? 255 : 0;
  }
let lo = Infinity;
let hi = -Infinity;
for (const h of out) {
  lo = Math.min(lo, h);
  hi = Math.max(hi, h);
}

// PNG, RGBA 8-bit, written by hand (no image library in the portfolio).
const raw = Buffer.alloc(S * (S * 4 + 1));
for (let y = 0; y < S; y++) {
  raw[y * (S * 4 + 1)] = 0;
  for (let x = 0; x < S; x++) {
    const v = Math.round(((out[y * S + x] - lo) / (hi - lo)) * 65535);
    const o = y * (S * 4 + 1) + 1 + x * 4;
    raw[o] = v >> 8;
    raw[o + 1] = v & 255;
    raw[o + 2] = riv[y * S + x];
    raw[o + 3] = 255;
  }
}
const crcTable = Array.from({ length: 256 }, (_, k) => {
  let c = k;
  for (let i = 0; i < 8; i++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (b) => {
  let c = 0xffffffff;
  for (const x of b) c = crcTable[(c ^ x) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(S, 0);
ihdr.writeUInt32BE(S, 4);
ihdr[8] = 8;
ihdr[9] = 6;
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);
writeFileSync(new URL('../public/data/cheia-terrain.png', import.meta.url), png);
console.log(`${S}×${S}, ${lo.toFixed(0)}–${hi.toFixed(0)} m, ${(png.length / 1024).toFixed(0)} KB`);
