import { test, expect } from '@playwright/test';

test.describe('Motion physics layer', () => {
  test('ripple spawns from pointer interaction and self-removes', async ({ page }) => {
    await page.goto('/');
    await page.click('#tab-btn-vocab');
    const btn = page.locator('#level-filter-bar .lvl-btn').first();
    await btn.hover();
    await page.mouse.down();
    await page.mouse.up();
    await expect(page.locator('.motion-ripple').first()).toBeAttached();
    await page.waitForTimeout(700);
    await expect(page.locator('.motion-ripple')).toHaveCount(0);
  });

  test('reduced motion disables ripples', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    const btn = page.locator('#level-filter-bar .lvl-btn').first();
    await btn.click();
    await expect(page.locator('.motion-ripple')).toHaveCount(0);
    await ctx.close();
  });

  test('swipe left navigates to the next quiz subview (RTL flow)', async ({ page }) => {
    await page.goto('/');
    await page.click('#tab-btn-quiz');
    await expect(page.locator('#quiz-view-quick')).toBeVisible();

    await page.evaluate(() => {
      const container = document.querySelector('#tab-quiz');
      const fire = (type, x, y) => container.dispatchEvent(new PointerEvent(type, {
        bubbles: true, pointerId: 7, pointerType: 'pen', clientX: x, clientY: y
      }));
      fire('pointerdown', 300, 420);
      fire('pointerup', 150, 424);
    });

    await expect(page.locator('#quiz-view-custom')).toBeVisible();
    await expect(page.locator('#subtab-btn-quiz-custom')).toHaveClass(/active/);
  });

  test('mobile bottom sheet hosts relocated filters', async ({ browser }) => {
    const ctx = await browser.newContext({
      viewport: { width: 412, height: 915 },
      hasTouch: true,
      isMobile: true
    });
    const page = await ctx.newPage();
    await page.goto('/');

    await expect(page.locator('#open-filters-btn')).toBeVisible();
    await page.click('#open-filters-btn');

    const sheet = page.locator('#mobile-filters-sheet');
    await expect(sheet).not.toHaveClass(/hidden/);
    await expect(sheet).toHaveClass(/open/);

    const slotList = page.locator('#sheet-body-slot #category-filter-list');
    await expect(slotList).toBeAttached();
    await expect(slotList.locator('.category-item').first()).toBeVisible();

    await page.keyboard.press('Escape');
    await page.waitForTimeout(450);
    await expect(sheet).toHaveClass(/hidden/);
    await ctx.close();
  });
});
