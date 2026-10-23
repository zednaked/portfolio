import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Scroll the whole page so every scroll-driven state has played once.
async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(40);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
}

test('loads without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await scrollThrough(page);
  expect(errors).toEqual([]);
});

test('has no WCAG 2.2 AA violations, in English and in Portuguese', async ({ page }) => {
  for (const q of ['./', './?lang=pt']) {
    await page.goto(q);
    await scrollThrough(page);
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  }
});

test('switches language and keeps the document language in step', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'PT', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page).toHaveTitle(/pintura/);
});

test('every painting in the strip is on screen when it takes keyboard focus', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard walk is a desktop concern');
  await page.goto('./');
  await scrollThrough(page);
  const paintings = page.locator('.gallery .reveal');
  const count = await paintings.count();
  for (let i = 0; i < count; i++) {
    await paintings.nth(i).focus();
    await page.waitForTimeout(900);
    await expect(paintings.nth(i)).toBeInViewport();
  }
});

test('the finale links are visible when focused', async ({ page }) => {
  await page.goto('./');
  await scrollThrough(page);
  const github = page.locator('.f-links a').first();
  await github.focus();
  await page.waitForTimeout(500);
  expect(await github.evaluate((el) => Number(getComputedStyle(el.closest('.f-links') ?? el).opacity))).toBe(1);
  await expect(github).toBeInViewport();
});

test('starting the reel moves focus to the video', async ({ page }) => {
  await page.goto('./');
  await page.locator('.reel-play').click();
  await expect(page.locator('.reel video')).toBeFocused();
});
