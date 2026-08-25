import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

function read(relPath) {
  return readFileSync(resolve(root, relPath), 'utf8');
}

function write(relPath, content) {
  const fullPath = resolve(root, relPath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log(`✓ Built: ${relPath}`);
}

console.log('Building Français BTP Maroc from modular sources...');

// 1. Combine CSS in dependency order
const cssFiles = [
  'src/styles/fonts.css',
  'src/styles/tokens.css',
  'src/styles/base.css',
  'src/styles/md3-theme.css',
  'src/styles/components.css',
  'src/styles/motion.css',
  'src/styles/mobile-nord5.css'
];
const combinedCss = cssFiles.map(f => `/* === ${f} === */\n` + read(f)).join('\n\n');

// 2. Inline dataset (numbers-ref stays inline: needed at startup by cheques/audio)
const numbersRef = read('src/data/numbers-ref.js');

function cleanExports(js) {
  return js
    .replace(/^\s*export\s+(const|let|var)\s+/gm, '$1 ')
    .replace(/^\s*export\s+(async\s+)?function\s+/gm, (match, asyncPart) => (asyncPart || '') + 'function ')
    .replace(/^\s*export\s+default\s+/gm, '')
    .replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?/gm, '')
    .trim()
    .replace(/;+$/, '') + ';';
}

const combinedDatasets = cleanExports(numbersRef);

// 2b. Emit deferred external datasets as window-global classic scripts
const externalDatasets = [
  ['src/data/reading-docs.js', 'READING_DOCS'],
  ['src/data/writing-templates.js', 'WRITING_TEMPLATES'],
  ['src/data/grammar-lessons.js', 'GRAMMAR_LESSONS'],
  ['src/data/plan-tasks.js', 'PLAN_TASKS']
];

for (const [sourcePath, globalName] of externalDatasets) {
  const body = read(sourcePath)
    .replace(new RegExp(`^export const ${globalName} = `, 'm'), `window.${globalName} = `);
  write(`data/${sourcePath.split('/').pop()}`, `${body}\n`);
}

// 3. Combine JavaScript Modules
const moduleFiles = [
  'src/modules/state.js',
  'src/modules/ui-utils.js',
  'src/modules/audio.js',
  'src/modules/btp-math.js',
  'src/modules/tabs/vocab-tab.js',
  'src/modules/tabs/quiz-tab.js',
  'src/modules/srs.js',
  'src/modules/tabs/cheques-tab.js',
  'src/modules/tabs/calc-tab.js',
  'src/modules/tabs/reading-tab.js',
  'src/modules/tabs/writing-tab.js',
  'src/modules/tabs/grammar-tab.js',
  'src/modules/tabs/plan-tab.js',
  'src/modules/pwa.js'
];

const combinedModules = moduleFiles
  .map(f => `/* === ${f} === */\n` + cleanExports(read(f)))
  .join('\n\n');

const appInit = `
window.addEventListener('DOMContentLoaded', () => {
  loadStateFromLocalStorage();
  initializeTabs();
  initStats();
  
  renderVocabCategoryFilter();
  renderVocabList(true);
  initQuizConfigSelects();
  renderReadingDocsSelector();
  renderReadingDoc('bl');
  renderWritingTemplatesSelector();
  loadWritingTemplate('bc');
  renderGrammarAccordions();
  renderStudyPlan();
  
  const d = new Date();
  const formattedDate = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth()+1).padStart(2, '0') + '/' + d.getFullYear();
  const chequeDateInput = document.getElementById('cheque-date-input');
  if (chequeDateInput) {
    chequeDateInput.value = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  const chequeDateDisplay = document.getElementById('cheque-date');
  if (chequeDateDisplay) chequeDateDisplay.innerText = formattedDate;
  updateChequeDetails();

  renderNumbersChart('all');
  renderReferenceNumbersTable();
  const decompInp = document.getElementById('num-decomposer-input');
  if (decompInp) decompInp.value = '81';
  runNumberDecomposer();
  updateChequeConverter();

  initPWA();
});
`;

// 4. Assemble clean index.html template
const template = read('src/template.html');

const builtHtml = template
  .replace('<link rel="stylesheet" href="src/styles/all.css">', () => `<style>\n${combinedCss}\n  </style>`)
  .replace('<script type="module" src="src/app.js"></script>', () => `
  <script>
${combinedDatasets}
  </script>

  <script>
${combinedModules}

${appInit}
  </script>`);

write('index.html', builtHtml);

console.log('✓ index.html successfully compiled from modular src/');
