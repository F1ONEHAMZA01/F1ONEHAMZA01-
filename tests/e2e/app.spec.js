import { test, expect } from '@playwright/test';

async function openMainTab(page, tab) {
  const desktopTab = page.locator(`#tab-btn-${tab}`);
  if (await desktopTab.isVisible()) {
    await desktopTab.click();
    return;
  }

  const mobileTab = page.locator(`.mobile-bottom-nav [data-tab="${tab}"]`);
  if (!(await mobileTab.isVisible())) {
    await page.locator('.mobile-more-nav > summary').click();
  }
  await mobileTab.click();
}

test.describe('App shell & navigation', () => {
  test('loads with correct title and RTL layout', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Français BTP/);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  });

  test('main tabs switch visible panels', async ({ page }) => {
    await page.goto('/');
    const tabs = [
      ['tab-btn-vocab', 'tab-vocab'],
      ['tab-btn-quiz', 'tab-quiz'],
      ['tab-btn-cheques', 'tab-cheques'],
      ['tab-btn-reading', 'tab-reading'],
      ['tab-btn-writing', 'tab-writing'],
      ['tab-btn-calc', 'tab-calc']
    ];
    for (const [btnId, panelId] of tabs) {
      await openMainTab(page, btnId.replace('tab-btn-', ''));
      await expect(page.locator(`#${panelId}`)).toBeVisible();
      for (const [, other] of tabs.filter(([, o]) => o !== panelId)) {
        await expect(page.locator(`#${other}`)).toBeHidden();
      }
    }
  });

  test('external datasets load and populate UI', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#vocab-total-count-badge')).toContainText(/مصطلح/);
    await openMainTab(page, 'plan');
    await expect(page.locator('.plan-month').first()).toBeVisible();
  });
});

test.describe('Vocabulary workflow', () => {
  test('search filters word cards and clear resets', async ({ page }) => {
    await page.goto('/');
    const search = page.locator('#search-input');
    await search.fill('béton');
    await page.waitForTimeout(450);
    const firstCard = page.locator('.word-card').first();
    await expect(firstCard).toBeVisible();
    const frText = await firstCard.locator('.word-fr').first().innerText();
    expect(frText.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()).toContain('beton');

    await page.click('#clear-search-btn');
    await expect(search).toHaveValue('');
  });

  test('marking a word learned persists after reload', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('.word-card .learn-btn').first();
    await btn.click();
    await expect(btn).toHaveClass(/is-learned|learned/);

    await page.reload();
    const persisted = page.locator('.word-card .learn-btn').first();
    await expect(persisted).toHaveClass(/is-learned|learned/);
  });
});

test.describe('Quiz engine', () => {
  test('quick 10 quiz starts and scores an answer', async ({ page }) => {
    await page.goto('/');
    await openMainTab(page, 'quiz');
    await page.click('.quiz-preset-btn.preset-gold');
    await expect(page.locator('#quiz-question-box')).toBeVisible();

    const options = page.locator('.quiz-option-btn');
    await expect(options.first()).toBeVisible();
    await options.first().click();
    await expect(page.locator('#quiz-feedback')).toBeVisible();
  });
});

test.describe('Grammar actions', () => {
  test('lesson audio and copy controls work under the production CSP', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const cspErrors = [];
    page.on('console', message => {
      if (message.type() === 'error' && /content security policy|refused to execute/i.test(message.text())) {
        cspErrors.push(message.text());
      }
    });

    await page.goto('/');
    await openMainTab(page, 'grammar');
    await page.locator('#accordion-idx-0 .accordion-header').click();

    const audio = page.locator('#accordion-content-0 .gt-audio-btn[data-call="speakFromDataset"]').first();
    await expect(audio).toHaveAttribute('data-speak', /enrobage/);
    await audio.click();

    const copy = page.locator('#accordion-content-0 [data-call="copyFromDataset"]').first();
    await copy.click();
    await expect(page.locator('#toast')).toContainText('تم النسخ');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Arrêtez immédiatement');
    expect(cspErrors).toEqual([]);
  });
});

test.describe('Calculators (pure math via UI)', () => {
  test('concrete calculator outputs cement bags for known volume', async ({ page }) => {
    await page.goto('/');
    await openMainTab(page, 'calc');
    await page.fill('#calc-beton-l', '10');
    await page.fill('#calc-beton-w', '8');
    await page.fill('#calc-beton-h', '0.2');
    await page.dispatchEvent('#calc-beton-l', 'input');
    await page.waitForTimeout(100);
    await expect(page.locator('#calc-beton-result')).toContainText('112');
  });

  test('finance decompte shows TVA and net to pay', async ({ page }) => {
    await page.goto('/');
    await openMainTab(page, 'calc');
    await page.click('button[id^="subtab-btn-calc-"]:has-text("مالية")');
    await page.fill('#calc-finance-ht', '100000');
    await page.dispatchEvent('#calc-finance-ht', 'input');
    await page.waitForTimeout(100);
    await expect(page.locator('#calc-finance-result')).toContainText('120');
    await expect(page.locator('#calc-finance-result')).toContainText('110');
  });
});

test.describe('Phase 5 features', () => {
  test('SRS flashcards subtab renders and grades a card', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      // Seed one due card using a stable word id from the dataset
      const w = window.getVocabDataset()[0];
      window.state.srs[window.getWordId(w)] = { ef: 2.5, interval: 0, reps: 0, due: '2020-01-01' };
    });
    await openMainTab(page, 'quiz');
    await page.click('#subtab-btn-quiz-srs');
    await expect(page.locator('#quiz-view-srs')).toBeVisible();
    await expect(page.locator('#srs-content-box')).toContainText('مستحقة');

    await page.click('#srs-start-btn');
    const card = page.locator('#srs-session-box .quiz-question-box').first();
    await expect(card).toBeVisible();

    await page.click('button:has-text("اكشف الإجابة")');
    await expect(page.locator('#srs-answer-area')).toBeVisible();
    await page.click('.fb-actions .quiz-option-btn.correct');
    await expect(page.locator('#srs-session-box')).toBeVisible();
  });

  test('progress export/import buttons exist and import rejects bad files', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.exportProgressData());
    await expect(page.locator('button[data-call="exportProgressData"]')).toBeVisible();

    await page.setInputFiles('#import-progress-input', {
      name: 'bad.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{"app":"other-app"}')
    });
    await expect(page.locator('#toast')).toContainText(/غير صالح/);
  });
});
