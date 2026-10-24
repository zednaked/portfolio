// Serves dist/ under /portfolio/ with gzip, the way GitHub Pages does, so the
// Lighthouse gate measures what visitors get.  node scripts/serve.mjs [port]
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { extname, join } from 'node:path';

const dir = new URL('../dist/', import.meta.url).pathname;
const port = Number(process.argv[2] ?? 4180);
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.vtt': 'text/vtt',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.json': 'application/json',
};
createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname).replace(/^\/portfolio/, '');
  if (path.endsWith('/')) path += 'index.html';
  try {
    let body = await readFile(join(dir, path));
    const type = types[extname(path)] ?? 'application/octet-stream';
    const head = { 'content-type': type, 'cache-control': 'max-age=600' };
    if (/text|javascript|svg|json/.test(type) && /gzip/.test(req.headers['accept-encoding'] ?? '')) {
      body = gzipSync(body);
      head['content-encoding'] = 'gzip';
    }
    res.writeHead(200, head);
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
}).listen(port, '127.0.0.1', () => console.log(`serving dist on http://127.0.0.1:${port}/portfolio/`));
