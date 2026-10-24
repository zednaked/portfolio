// Puts the first screen into dist/index.html, so a phone paints the header
// and the reel poster (the largest paint) before any JavaScript has run.
//
// The page is rendered by the production build itself, in Chromium, under
// reduced motion (no hidden starting states), and the header and the reel are
// copied out as plain markup. The type and the paint in the header stay hidden
// in this shell: the opening still plays them in when the app mounts and
// replaces the shell, so nothing is shown and then taken away.
/* global document, getComputedStyle */
import { readFileSync, writeFileSync } from 'node:fs';
import { preview } from 'vite';
import { chromium } from '@playwright/test';

const PORT = 4174;
const server = await preview({ preview: { port: PORT, strictPort: true, host: '127.0.0.1' }, logLevel: 'warn' });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  await page.goto(`http://127.0.0.1:${PORT}/portfolio/?lang=en`);
  await page.waitForSelector('main .reel');
  // Fonts in and the gentle fades finished, so the copy is the settled page.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.reel')).opacity === '1');
  const shell = await page.evaluate(() => {
    const strip = (el) => {
      const copy = el.cloneNode(true);
      for (const n of [copy, ...copy.querySelectorAll('*')]) n.removeAttribute('style');
      copy.querySelectorAll('canvas').forEach((c) => c.remove());
      return copy;
    };
    const header = strip(document.querySelector('header.top'));
    header.classList.add('shell');
    const reel = strip(document.querySelector('main .reel'));
    return `<div class="page">${header.outerHTML}<main>${reel.outerHTML}</main></div>`;
  });

  const file = new URL('../dist/index.html', import.meta.url);
  const html = readFileSync(file, 'utf8');
  if (!html.includes('<div id="root"></div>')) throw new Error('dist/index.html has no empty #root');
  writeFileSync(file, html.replace('<div id="root"></div>', `<div id="root">${shell}</div>`));
  console.log(`prerendered the first screen: ${(shell.length / 1024).toFixed(1)} KB of markup`);
} finally {
  await browser.close();
  await new Promise((done) => server.httpServer.close(done));
}
