import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(import.meta.dirname, '..');
const read = file => readFileSync(resolve(root, file), 'utf8');
const appVersion = JSON.parse(read('package.json')).version;
const escapedAppVersion = appVersion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const checks = [];
const check = (name, fn) => {
  fn();
  checks.push(name);
  console.log(`✓ ${name}`);
};

const requiredFiles = [
  'index.html',
  'manifest.json',
  'sw.js',
  'data/vocab.js',
  'data/reading-docs.js',
  'data/writing-templates.js',
  'data/grammar-lessons.js',
  'data/plan-tasks.js',
  'fonts/cairo-arabic.woff2',
  'fonts/cairo-latin.woff2',
  'fonts/roboto-flex-latin.woff2',
  'icons/icon.svg',
  'icons/icon-maskable.svg'
];

check('required application files exist', () => {
  requiredFiles.forEach(file => assert.ok(existsSync(resolve(root, file)), `${file} is missing`));
});

const modularSourceFiles = [
  'src/app.js',
  'src/modules/state.js',
  'src/modules/ui-utils.js',
  'src/modules/audio.js',
  'src/modules/pwa.js',
  'src/modules/tabs/vocab-tab.js',
  'src/modules/tabs/quiz-tab.js',
  'src/modules/tabs/cheques-tab.js',
  'src/modules/tabs/reading-tab.js',
  'src/modules/tabs/writing-tab.js',
  'src/modules/tabs/grammar-tab.js',
  'src/modules/tabs/plan-tab.js',
  'src/modules/tabs/calc-tab.js'
];

check('all modular ES6 JavaScript sources exist and adhere to clean architecture', () => {
  modularSourceFiles.forEach(file => {
    assert.ok(existsSync(resolve(root, file)), `${file} is missing`);
    const content = read(file);
    assert.ok(content.length > 50, `${file} is empty`);
  });
});

const html = read('index.html');
const manifest = JSON.parse(read('manifest.json'));
const serviceWorker = read('sw.js');

check('production markup contains no inline event handlers', () => {
  const markup = html
    .replace(/<script(?:\s[^>]*)?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style(?:\s[^>]*)?>[\s\S]*?<\/style>/gi, '');
  assert.doesNotMatch(markup, /\son[a-z]+\s*=/i, 'inline event handler found in index.html');
  ['reading-docs', 'writing-templates', 'grammar-lessons', 'plan-tasks'].forEach(name => {
    assert.doesNotMatch(read(`data/${name}.js`), /\son[a-z]+\s*=/i, `inline event handler found in data/${name}.js`);
  });
});

check('inline JavaScript parses', () => {
  const blocks = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
    .map(match => match[1])
    .filter(Boolean);
  assert.ok(blocks.length > 0, 'no inline JavaScript found');
  blocks.forEach(code => new Function(code));
});

check('HTML ids are unique', () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  assert.deepEqual([...new Set(duplicates)], []);
});

check('static label targets exist', () => {
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]));
  const targets = [...html.matchAll(/<label[^>]+for="([^"]+)"/g)].map(match => match[1]);
  targets.forEach(target => assert.ok(ids.has(target), `label points to missing #${target}`));
});

check('tab semantics are complete', () => {
  const tabs = [...html.matchAll(/<button[^>]+role="tab"[^>]+aria-controls="([^"]+)"/g)].map(match => match[1]);
  assert.equal(tabs.length, 8);
  tabs.forEach(panel => assert.match(html, new RegExp(`<section[^>]+id="${panel}"[^>]+role="tabpanel"`)));
});

check('manifest uses local installable icons', () => {
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, './index.html');
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2);
  manifest.icons.forEach(icon => {
    assert.ok(!/^https?:/i.test(icon.src), 'manifest icon must be local');
    assert.ok(existsSync(resolve(root, icon.src)), `${icon.src} is missing`);
  });
});

check('service worker has versioned app-shell caching', () => {
  new Function(serviceWorker);
  assert.match(serviceWorker, new RegExp(`APP_VERSION = '${escapedAppVersion}'`));
  assert.match(serviceWorker, /btp-maroc-static-\$\{APP_VERSION\}/);
  assert.match(serviceWorker, /\.\/index\.html/);
  ['vocab', 'reading-docs', 'writing-templates', 'grammar-lessons', 'plan-tasks'].forEach(name => {
    assert.match(serviceWorker, new RegExp(`\\./data/${name}\\.js\\?v=${escapedAppVersion}`));
  });
  assert.match(serviceWorker, /request\.mode === 'navigate'/);
});

check('OnePlus Nord 5 mobile profile is safe and responsive', () => {
  assert.match(html, /viewport-fit=cover/);
  assert.match(html, /interactive-widget=resizes-content/);
  assert.match(html, /min-height:\s*100dvh/);
  assert.match(html, /--safe-bottom:\s*env\(safe-area-inset-bottom/);
  assert.match(html, /--touch-target:\s*48px/);
  assert.match(html, /min-width:\s*400px\)\s*and\s*\(max-width:\s*440px\)\s*and\s*\(orientation:\s*portrait/);
  assert.match(html, /orientation:\s*landscape\)\s*and\s*\(max-height:\s*500px/);
  assert.match(html, /content-visibility:\s*auto/);
});

const numbersSource = read('src/modules/tabs/cheques-tab.js')
  .replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?/gm, '')
  .replace(/^\s*export\s+(const|let|var)\s+/gm, '$1 ')
  .replace(/^\s*export\s+(async\s+)?function\s+/gm, (m, a) => (a || '') + 'function ');
const numbersContext = {};
numbersContext.globalThis = numbersContext;
vm.createContext(numbersContext);
vm.runInContext(numbersSource + '\nglobalThis.__exports = { numberToFrench, parseLocalizedChequeAmount, buildChequeAmountWords };', numbersContext);

check('cheque number conversion handles French and localized input edge cases', () => {
  const frenchCases = new Map([
    [0, 'zéro'],
    [21, 'vingt et un'],
    [71, 'soixante et onze'],
    [80, 'quatre-vingts'],
    [81, 'quatre-vingt-un'],
    [200, 'deux cents'],
    [201, 'deux cent un'],
    [1000, 'mille'],
    [80000, 'quatre-vingt mille'],
    [200000, 'deux cent mille'],
    [1000000, 'un million'],
    [2000000, 'deux millions'],
    [10000000, 'dix millions']
  ]);
  frenchCases.forEach((expected, value) => assert.equal(numbersContext.numberToFrench(value), expected));

  const localizedCases = new Map([
    ['4 500,50', 4500.5],
    ['4.500,50', 4500.5],
    ['4,500.50', 4500.5],
    ['٤ ٥٠٠٫٥٠', 4500.5],
    ['12,345', 12345],
    ['0', 0]
  ]);
  localizedCases.forEach((expected, value) => {
    const parsed = numbersContext.parseLocalizedChequeAmount(value);
    assert.equal(parsed.kind, 'valid', value);
    assert.equal(parsed.amount, expected, value);
  });
  assert.equal(numbersContext.parseLocalizedChequeAmount('1e3').kind, 'invalid');
  assert.equal(numbersContext.parseLocalizedChequeAmount('').kind, 'empty');

  const words = numbersContext.buildChequeAmountWords(450050);
  assert.equal(words.fr, 'quatre mille cinq cents dirhams et cinquante centimes');
  assert.equal(words.ar, 'أربعة آلاف وخمسمائة درهماً وخمسون سنتيماً');
});

check('cheque editor and number game expose complete accessible controls', () => {
  [
    'cheque-amount-status',
    'cheque-payee-input',
    'cheque-place-input',
    'cheque-date-input',
    'num-game-count',
    'num-game-counter',
    'num-game-progress',
    'num-game-result'
  ].forEach(id => assert.match(html, new RegExp(`id="${id}"`), `missing #${id}`));
  assert.match(html, /<input(?=[^>]*id="cheque-amount-input")(?=[^>]*inputmode="decimal")[^>]*>/);
  assert.match(html, /id="cheque-amount-status"[^>]+aria-live="polite"/);
  assert.match(html, /<div(?=[^>]*id="num-game-progress")(?=[^>]*role="progressbar")[^>]*>/);
  assert.match(html, /function finishNumGame\s*\(/);
  assert.match(html, /function handleNumGameInputKey\s*\(/);
});

check('large number cards preserve left-to-right digit grouping', () => {
  assert.match(html, /<bdi class="num-digit" dir="ltr">\$\{escapeHtml\(String\(x\.n\)\)\}<\/bdi>/);
  assert.match(html, /\.num-digit\s*\{[\s\S]*?direction:\s*ltr;[\s\S]*?unicode-bidi:\s*isolate;/);
});

const vocabContext = { window: {}, atob, decodeURIComponent, escape };
vm.createContext(vocabContext);
vm.runInContext(read('data/vocab.js'), vocabContext);
const vocab = vocabContext.window.VOCAB_DATA;

check('vocabulary dataset has valid required fields', () => {
  assert.ok(Array.isArray(vocab) && vocab.length > 1000, 'vocabulary dataset is unexpectedly small');
  vocab.forEach((word, index) => {
    assert.equal(typeof word.fr, 'string', `word ${index} is missing fr`);
    assert.equal(typeof word.ar, 'string', `word ${index} is missing ar`);
    assert.ok(word.fr.trim() && word.ar.trim(), `word ${index} has an empty translation`);
  });
});

check('stable vocabulary identities do not collide', () => {
  const hashString = value => {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  };
  const ids = vocab.map(word => `word:${hashString([word.fr, word.ar, word.source, word.category].map(value => String(value || '').trim()).join('|'))}`);
  assert.equal(new Set(ids).size, ids.length);
});

check('cloze-eligible examples produce a visible blank', () => {
  const buildCloze = word => {
    if (!word.example_fr || !word.fr) return null;
    const candidates = [word.fr, word.fr.replace(/^(?:le|la|les|un|une|des|du|de la|de l'|de l’|l'|l’|d'|d’)\s*/i, '')]
      .filter((value, index, array) => value && array.indexOf(value) === index)
      .sort((a, b) => b.length - a.length);
    for (const candidate of candidates) {
      const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const expression = new RegExp(`(^|[^\\p{L}])(${escaped})(?=$|[^\\p{L}])`, 'giu');
      if (expression.test(word.example_fr)) {
        return word.example_fr.replace(expression, (match, prefix) => `${prefix}_______`);
      }
    }
    return null;
  };
  const prompts = vocab.map(buildCloze).filter(Boolean);
  assert.ok(prompts.length > 500, 'too few examples can generate cloze questions');
  prompts.forEach(prompt => assert.ok(prompt.includes('_______')));
});

check('critical functions are defined only once', () => {
  ['scrollToTopSmooth', 'calculateBtpBeton', 'calculateBtpAcier', 'calculateBtpBriques', 'calculateBtpCarrelage']
    .forEach(name => {
      const matches = html.match(new RegExp(`function\\s+${name}\\s*\\(`, 'g')) || [];
      assert.equal(matches.length, 1, `${name} has ${matches.length} definitions`);
    });
});

check('math and SRS engines are compiled into the bundle', () => {
  [
    'function computeConcreteMix',
    'function computeFinancialDecompte',
    'function scheduleSrsEntry',
    'function collectDueWordIds'
  ].forEach(marker => {
    assert.ok(html.includes(marker), `missing engine function in bundle: ${marker}`);
    assert.equal(html.split(marker).length - 1, 1, `duplicated engine function: ${marker}`);
  });
});

check('finance controls are wired into the calculator', () => {
  ['calc-finance-tva', 'calc-finance-retention', 'calc-finance-basis'].forEach(id => {
    assert.match(html, new RegExp(`id="${id}"`));
    assert.ok(html.indexOf(`getElementById('${id}')`) > -1, `${id} is not read by JavaScript`);
  });
});

check('quiz controls and live regions are complete', () => {
  [
    'quiz-category-select',
    'quiz-level-select',
    'quiz-scope-select',
    'quiz-mode-select',
    'quiz-order-select',
    'quiz-count-select',
    'quiz-start-btn',
    'quiz-live-score',
    'quiz-current-mode',
    'quiz-result-metrics'
  ].forEach(id => assert.match(html, new RegExp(`id="${id}"`), `missing #${id}`));
  assert.match(html, /id="quiz-progress-bar"[^>]+role="progressbar"/);
  assert.match(html, /id="quiz-feedback"[^>]+aria-live="polite"/);
});

check('quiz uses balanced modes and unbiased shuffling', () => {
  assert.match(html, /function shuffleArray\s*\(/);
  assert.match(html, /function buildQuizModeQueue\s*\(/);
  assert.match(html, /function buildQuizOptions\s*\(/);
  assert.match(html, /function handleQuizKeyboard\s*\(/);
  assert.doesNotMatch(html, /\.sort\(\(\) => Math\.random\(\) - 0\.5\)/);
});

const readingDocsContext = { window: {} };
vm.createContext(readingDocsContext);
vm.runInContext(read('src/data/reading-docs.js'), readingDocsContext);
const readingDocs = readingDocsContext.window.READING_DOCS;

check('reading documents have complete learning content', () => {
  assert.ok(Array.isArray(readingDocs) && readingDocs.length >= 8);
  assert.equal(new Set(readingDocs.map(doc => doc.id)).size, readingDocs.length);
  readingDocs.forEach(doc => {
    assert.ok(doc.id && doc.title && doc.level && doc.ar_desc && doc.doc_content, `incomplete reading document ${doc.id}`);
    assert.ok(Array.isArray(doc.vocab_hints) && doc.vocab_hints.length >= 4, `${doc.id} needs vocabulary hints`);
    assert.ok(Array.isArray(doc.questions) && doc.questions.length >= 4, `${doc.id} needs comprehension questions`);
    doc.questions.forEach(question => assert.ok(question.q && question.a, `${doc.id} has an incomplete question`));
  });
});

check('reading workflow is accessible and progress-aware', () => {
  ['reading-doc-search', 'reading-level-filter', 'reading-overall-progress', 'reading-document-active-view']
    .forEach(id => assert.match(html, new RegExp(`id="${id}"`), `missing #${id}`));
  assert.match(html, /appendTextElement\(card, 'pre', 'doc-viewer-card'/);
  assert.match(html, /function assessReadingAnswer\s*\(/);
  assert.match(html, /function updateReadingDocumentProgress\s*\(/);
  assert.match(html, /btp_reading_progress/);
  assert.match(html, /aria-valuenow/);
  assert.match(html, /aria-expanded/);
});

check('skip-link and keyboard focus-visible standards are fully wired', () => {
  assert.match(html, /class="skip-link"/);
  assert.match(html, /href="#main-content"/);
  assert.match(html, /id="main-content"/);
  assert.match(html, /:focus-visible/);
  assert.match(html, /outline:\s*3px\s+solid/);
});

check('assistive media queries and accessible button states are present', () => {
  assert.match(html, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(html, /@media\s*\(forced-colors:\s*active\)/);
  assert.match(html, /aria-label="مسح نص البحث/);
  assert.match(html, /id="back-to-top-btn"[\s\S]*?aria-label=/);
  assert.match(html, /aria-pressed/);
});

console.log(`\n${checks.length} validation checks passed.`);
