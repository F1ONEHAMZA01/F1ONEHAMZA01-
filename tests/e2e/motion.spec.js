import { test, expect } from '@playwright/test';

async function openMainTab(page, tab) {
  const desktopTab = page.locator(`#tab-btn-${tab}`);
  if (await desktopTab.isVisible()) {
    await desktopTab.click();
    return;
  }
  await page.locator(`.mobile-bottom-nav [data-tab="${tab}"]`).click();
}

test.describe('Motion layer (classic design)', () => {
  test('swipe left navigates to the next quiz subview (RTL flow)', async ({ page }) => {
    await page.goto('/');
    await openMainTab(page, 'quiz');
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

  test('classic mobile layout keeps the inline category strip', async ({ browser }) => {
    const ctx = await browser.newContext({
      viewport: { width: 424, height: 915 },
      hasTouch: true,
      isMobile: true
    });
    const page = await ctx.newPage();
    await page.goto('/');

    // The original horizontal chips strip must be visible on Nord-class screens
    const strip = page.locator('#category-filter-list');
    await expect(strip).toBeVisible();
    await expect(strip.locator('.category-item').first()).toBeVisible();

    // No bottom sheet / filters button remnants
    await expect(page.locator('#mobile-filters-sheet')).toHaveCount(0);
    await expect(page.locator('#open-filters-btn')).toHaveCount(0);
    await ctx.close();
  });

  test('hold-to-confirm resets progress without dialog', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.toggleWordLearned(
      window.getWordId(window.getVocabDataset()[0]),
      document.querySelector('.word-card .learn-btn'),
      document.querySelector('.word-card'),
      window.getVocabDataset()[0]
    ));
    const dialogMessages = [];
    page.on('dialog', d => { dialogMessages.push(d.message()); d.dismiss(); });

    const btn = page.locator('#hold-reset-btn');
    const box = await btn.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(1100);
    await page.mouse.up();

    await expect(page.locator('#toast')).toContainText('إعادة تعيين');
    expect(dialogMessages.length).toBe(0);
  });

  test('early hold release cancels the reset', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('#hold-reset-btn');
    const box = await btn.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(200);
    await page.mouse.up();
    await page.waitForTimeout(300);
    await expect(page.locator('#toast')).not.toContainText('إعادة تعيين');
  });
});
