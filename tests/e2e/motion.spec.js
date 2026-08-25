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

test.describe('Kinetics patterns', () => {
  test('glide pill tracks the active tab position', async ({ page }) => {
    await page.goto('/');
    const pill = page.locator('#tab-glide-pill');
    await expect(pill).toHaveClass(/visible/);
    const before = await pill.evaluate(el => el.style.transform);

    await page.click('#tab-btn-calc');
    await page.waitForTimeout(500);
    const after = await pill.evaluate(el => el.style.transform);
    expect(after).not.toBe(before);
  });

  test('hold-to-confirm resets progress without dialog', async ({ page }) => {
    await page.goto('/');
    // Seed learned state, verify it exists
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
