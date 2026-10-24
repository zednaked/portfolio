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
