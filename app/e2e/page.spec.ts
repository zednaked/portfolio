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

// The way a keyboard user meets the page: from the top, no scrolling first.
// Every stop must be on screen and actually visible, and the cases must be
// reachable (an autoAlpha entrance once hid them from Tab until scrolled to).
test('a keyboard walk from the top reaches every section, all of it visible', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard walk is a desktop concern');
  await page.goto('./');
  await page.waitForTimeout(1500);
  const stops: string[] = [];
  for (let i = 0; i < 80; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(450);
    const stop = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const r = el.getBoundingClientRect();
      let opacity = 1;
      for (let n: HTMLElement | null = el; n; n = n.parentElement) opacity *= Number(getComputedStyle(n).opacity);
      return {
        label: (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 40),
        inView: r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth,
        visible: getComputedStyle(el).visibility !== 'hidden' && opacity > 0.9,
      };
    });
    if (!stop) continue;
    if (stops.length && stop.label === stops[0]) break; // wrapped around
    stops.push(stop.label);
    expect(stop.inView, `"${stop.label}" is off screen`).toBe(true);
    expect(stop.visible, `"${stop.label}" is invisible`).toBe(true);
  }
  for (const reachable of ['Play it', 'Open it live', 'zednaked@gmail.com']) {
    expect(
      stops.some((s) => s.includes(reachable)),
      `${reachable} never takes focus`,
    ).toBe(true);
  }
});

test('the motion switch applies at once, keeping the language and the place', async ({ page }) => {
  await page.goto('./?lang=pt');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  const card = page.locator('article[aria-labelledby="case-cheia"]');
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  const before = await card.evaluate((e) => e.getBoundingClientRect().top);
  let navigated = false;
  page.on('framenavigated', () => (navigated = true));
  const motion = page.locator('.motion-btn');
  const wasFull = (await motion.getAttribute('aria-pressed')) === 'true';
  // Clicked where it is, without scrolling to it, so the place is the card's.
  await motion.evaluate((b: HTMLElement) => {
    b.click();
  });
  await expect(motion).toHaveAttribute('aria-pressed', String(!wasFull));
  await page.waitForTimeout(1500);
  expect(navigated).toBe(false);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  const after = await card.evaluate((e) => e.getBoundingClientRect().top);
  expect(Math.abs(after - before)).toBeLessThan(120);
});

test('the motion switch keeps keyboard focus on itself', async ({ page }) => {
  await page.goto('./');
  const motion = page.locator('.motion-btn');
  await motion.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  await expect(page.locator('.motion-btn')).toBeFocused();
});
