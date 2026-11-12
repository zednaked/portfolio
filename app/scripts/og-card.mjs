// Draws public/img/og-card.jpg (1200 x 628), the card a shared link shows:
// the signature card of the page, with the address it lives at.
// Run: node scripts/og-card.mjs
/* global document */
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const pub = new URL('../public/', import.meta.url).href;
const html = `<!doctype html><meta charset="utf-8"><style>
@font-face { font-family: Anton; src: url('${pub}fonts/anton.woff2'); }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 628px; position: relative; overflow: hidden; background: #f1ead8; color: #0b0b0b; font-family: Roboto, 'Helvetica Neue', Arial, sans-serif; }
.tex { position: absolute; inset: 0; mix-blend-mode: multiply; }
.paper { background: url('${pub}img/paper.webp') 0 0 / 640px 640px; opacity: .55; }
.xerox { background: url('${pub}img/xerox.webp') 0 0 / 640px 640px; opacity: .4; }
h1 { position: absolute; left: 84px; top: 86px; font: 400 126px/1 Anton; letter-spacing: .01em; }
p { position: absolute; left: 86px; top: 398px; font-size: 27px; font-weight: 700; letter-spacing: .14em; }
b { position: absolute; left: 84px; top: 456px; padding: 10px 18px 12px; background: #d7261e; color: #fff; font: 400 40px/1 Anton; letter-spacing: .06em; }
i { position: absolute; }
.c { left: 800px; top: 64px; width: 330px; height: 330px; border-radius: 50%; background: #d7261e; }
.s { left: 738px; top: 324px; width: 216px; height: 216px; background: #1d3f9e; }
.t { left: 978px; top: 350px; width: 190px; height: 190px; background: #f2b705; clip-path: polygon(50% 0, 100% 100%, 0 100%); }
</style><div class="tex paper"></div><div class="tex xerox"></div>
<i class="c"></i><i class="s"></i><i class="t"></i>
<h1>THIAGO<br>GONÇALVES</h1><p>PAINTER + CREATIVE DEVELOPER</p><b>ZED.ART.BR</b>`;

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--allow-file-access-from-files'],
});
const page = await browser.newPage({ viewport: { width: 1200, height: 628 } });
const dir = mkdtempSync(join(tmpdir(), 'og-'));
writeFileSync(join(dir, 'card.html'), html);
await page.goto(pathToFileURL(join(dir, 'card.html')).href);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
await page.screenshot({ path: new URL('../public/img/og-card.jpg', import.meta.url).pathname, quality: 86 });
await browser.close();
rmSync(dir, { recursive: true });
