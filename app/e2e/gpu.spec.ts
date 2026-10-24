import { expect, test, type Page } from '@playwright/test';

// The WebGL splash refuses software renderers, so CI (no GPU) only ever sees
// the CSS fallback. This runs the GL path on a machine with a GPU:
// GPU=1 npm run test:e2e -- --project=gpu

// Share of the header's pixels that are paint (magenta), measured on a real
// screenshot, so a blank or cleared canvas fails.
async function paintCoverage(page: Page) {
  const png = await page.locator('header.top').screenshot();
  return page.evaluate(async (b64) => {
    const blob = await (await fetch(`data:image/png;base64,${b64}`)).blob();
    const bmp = await createImageBitmap(blob);
    const c = new OffscreenCanvas(bmp.width, bmp.height);
    const ctx = c.getContext('2d');
    if (!ctx) return 0;
    ctx.drawImage(bmp, 0, 0);
    const d = ctx.getImageData(0, 0, bmp.width, bmp.height).data;
    let paint = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] > 120 && d[i + 1] < 90 && d[i + 2] > 60) paint++;
    return paint / (d.length / 4);
  }, png.toString('base64'));
}

test('the splash is painted by WebGL and survives a resize after it goes idle', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('.splash.gl-on canvas.splash-gl')).toHaveCount(1);
  await page.waitForTimeout(3000);
  expect(await paintCoverage(page)).toBeGreaterThan(0.1);
  // Past the drips the canvas stops drawing; a resize must draw it again.
  await page.waitForTimeout(6000);
  await page.setViewportSize({ width: 1240, height: 800 });
  await page.waitForTimeout(400);
  expect(await paintCoverage(page)).toBeGreaterThan(0.1);
});

test('the CODE act opens on the terrain, and the scroll raises the water', async ({ page }) => {
  // Video decoding can reset some GPU drivers under automation; the piece is
  // what is under test here.
  await page.route(/\.(mp4|webm)$/, (r) => r.abort());
  await page.goto('./');
  const flood = page.locator('.flood');
  await expect(flood).toHaveClass(/is-live/);
  const top = await flood.evaluate((e) => e.getBoundingClientRect().top + window.scrollY);
  const span = await flood.evaluate((e) => e.offsetHeight - window.innerHeight);
  for (let y = 0; y < top; y += 600) await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.evaluate((v) => window.scrollTo(0, v), top);
  // Generous: the GPU is shared with the other workers when the suite runs in parallel.
  await expect(page.locator('.flood-canvas.on')).toHaveCount(1, { timeout: 20000 });
  const low = await page.locator('.flood-readout b').first().textContent();
  await page.evaluate((v) => window.scrollTo(0, v), top + span);
  await page.waitForTimeout(400);
  const high = await page.locator('.flood-readout b').first().textContent();
  expect(parseInt(high ?? '0')).toBeGreaterThan(parseInt(low ?? '0'));
});

test('if the GPU drops the terrain, the still takes its place', async ({ page }) => {
  await page.route(/\.(mp4|webm)$/, (r) => r.abort());
  await page.goto('./');
  const flood = page.locator('.flood');
  const top = await flood.evaluate((e) => e.getBoundingClientRect().top + window.scrollY);
  for (let y = 0; y < top; y += 600) await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.evaluate((v) => window.scrollTo(0, v), top);
  // Generous: the GPU is shared with the other workers when the suite runs in parallel.
  await expect(page.locator('.flood-canvas.on')).toHaveCount(1, { timeout: 20000 });
  await page.locator('.flood-canvas').evaluate((c: HTMLCanvasElement) => {
    c.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext();
  });
  await expect(page.locator('.flood-still')).toBeVisible();
  await expect(page.locator('.flood-canvas')).toHaveCount(0);
});

test('dragging the map sideways moves the water line, and it drains back', async ({ page }) => {
  await page.route(/\.(mp4|webm)$/, (r) => r.abort());
  await page.goto('./');
  const flood = page.locator('.flood');
  const top = await flood.evaluate((e) => e.getBoundingClientRect().top + window.scrollY);
  for (let y = 0; y < top; y += 600) await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.evaluate((v) => window.scrollTo(0, v + 200), top);
  await expect(page.locator('.flood-canvas.on')).toHaveCount(1, { timeout: 20000 });
  const before = parseInt((await page.locator('.flood-readout b').first().textContent()) ?? '0');
  const box = await page.locator('.flood-canvas').boundingBox();
  if (!box) throw new Error('no canvas');
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.3, { steps: 8 });
  const during = parseInt((await page.locator('.flood-readout b').first().textContent()) ?? '0');
  expect(during).toBeGreaterThan(before + 10);
  // Let go: the water drains back to where the scroll has it.
  await page.mouse.up();
  await expect
    .poll(async () => parseInt((await page.locator('.flood-readout b').first().textContent()) ?? '0'))
    .toBeLessThan(before + 3);
});
