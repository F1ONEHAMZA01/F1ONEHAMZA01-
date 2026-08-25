import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const rawJs = readFileSync(resolve(root, 'src/modules/main-script-raw.js'), 'utf8');
const rawCss = readFileSync(resolve(root, 'src/styles/all.css'), 'utf8');

function write(relPath, content) {
  const fullPath = resolve(root, relPath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log(`✓ Modularized: ${relPath}`);
}

const sliceFn = (startName, endName) => {
  const s = rawJs.indexOf(startName);
  if (s === -1) throw new Error(`Could not find start: ${startName}`);
  if (!endName) return rawJs.slice(s).trim();
  const e = rawJs.indexOf(endName, s);
  if (e === -1) throw new Error(`Could not find end: ${endName}`);
  return rawJs.slice(s, e).trim();
};

// ==========================================================================
// A. DATASETS
// ==========================================================================

const numbersDataStart = rawJs.indexOf('const NUMBERS_DATA = [');
const numbersDataEnd = rawJs.indexOf('];', numbersDataStart) + 2;
const numbersDataStr = rawJs.slice(numbersDataStart, numbersDataEnd);

const pronTokensStart = rawJs.indexOf('const FR_PRON_TOKENS = {');
const pronTokensEnd = rawJs.indexOf('};', pronTokensStart) + 2;
const pronTokensStr = rawJs.slice(pronTokensStart, pronTokensEnd);

write('src/data/numbers-ref.js', `
export ${numbersDataStr}
export ${pronTokensStr}

if (typeof window !== 'undefined') {
  window.NUMBERS_DATA = NUMBERS_DATA;
  window.FR_PRON_TOKENS = FR_PRON_TOKENS;
}
`);

// ==========================================================================
// B. CORE JAVASCRIPT MODULES
// ==========================================================================

// 1. state.js
const stateStart = rawJs.indexOf('const state = {');
const stateEnd = rawJs.indexOf('};', stateStart) + 2;
const stateDef = rawJs.slice(stateStart, stateEnd);

write('src/modules/state.js', `
export ${stateDef}

${sliceFn('function legacyWordKey', 'window.addEventListener(\'DOMContentLoaded\'')}

${sliceFn('function saveStateToLocalStorage', 'function toggleContext')}

if (typeof window !== 'undefined') {
  window.state = state;
  window.legacyWordKey = legacyWordKey;
  window.normalizeSearchText = normalizeSearchText;
  window.hashString = hashString;
  window.getWordId = getWordId;
  window.migrateStoredWordKeys = migrateStoredWordKeys;
  window.saveStateToLocalStorage = saveStateToLocalStorage;
  window.loadStateFromLocalStorage = loadStateFromLocalStorage;
  window.getVocabDataset = getVocabDataset;
  window.initStats = initStats;
}
`);

// 2. audio.js
write('src/modules/audio.js', `
import { state, getWordId, saveStateToLocalStorage, initStats } from './state.js';
import { FR_PRON_TOKENS } from '../data/numbers-ref.js';

${sliceFn('function ttsAvailable', 'const QUIZ_MODE_META')}

${sliceFn('function frWordsToPron', 'function setChequeAmount')}

if (typeof window !== 'undefined') {
  window.ttsAvailable = ttsAvailable;
  window.speakFrenchText = speakFrenchText;
  window.speakCurrentWord = speakCurrentWord;
  window.markCurrentLearned = markCurrentLearned;
  window.frWordsToPron = frWordsToPron;
}
`);

// 3. ui-utils.js
write('src/modules/ui-utils.js', `
${sliceFn('function appendTextElement', 'window.addEventListener(\'DOMContentLoaded\'')}

${sliceFn('function initializeTabs', 'const PHASE_NAMES =')}

if (typeof window !== 'undefined') {
  window.appendTextElement = appendTextElement;
  window.escapeHtml = escapeHtml;
  window.initializeTabs = initializeTabs;
  window.switchTab = switchTab;
  window.showToast = showToast;
  window.scrollToTopSmooth = scrollToTopSmooth;
}
`);

// 4. tabs/vocab-tab.js
write('src/modules/tabs/vocab-tab.js', `
import { state, getVocabDataset, getWordId, normalizeSearchText, saveStateToLocalStorage, initStats } from '../state.js';
import { appendTextElement, showToast } from '../ui-utils.js';
import { speakFrenchText, ttsAvailable } from '../audio.js';

${sliceFn('const PHASE_NAMES =', 'let deferredPrompt = null;')}

${sliceFn('function getFilteredWords', 'function ttsAvailable')}

if (typeof window !== 'undefined') {
  window.PHASE_NAMES = PHASE_NAMES;
  window.SHORT_PHASE_NAMES = SHORT_PHASE_NAMES;
  window.renderVocabCategoryFilter = renderVocabCategoryFilter;
  window.setCategoryFilter = setCategoryFilter;
  window.setLevelFilter = setLevelFilter;
  window.handleSearchInput = handleSearchInput;
  window.clearSearchInput = clearSearchInput;
  window.getFilteredWords = getFilteredWords;
  window.renderVocabList = renderVocabList;
  window.loadMoreWords = loadMoreWords;
  window.toggleWordLearned = toggleWordLearned;
  window.resetLearnedState = resetLearnedState;
}
`);

// 5. tabs/quiz-tab.js
write('src/modules/tabs/quiz-tab.js', `
import { state, getVocabDataset, getWordId, saveStateToLocalStorage, initStats } from '../state.js';
import { appendTextElement } from '../ui-utils.js';
import { speakFrenchText, frWordsToPron } from '../audio.js';

${sliceFn('const QUIZ_MODE_META =', 'function numberToFrench')}

if (typeof window !== 'undefined') {
  window.QUIZ_MODE_META = QUIZ_MODE_META;
  window.shuffleArray = shuffleArray;
  window.getQuizConfigFromControls = getQuizConfigFromControls;
  window.calculateQuizAvailability = calculateQuizAvailability;
  window.initQuizConfigSelects = initQuizConfigSelects;
  window.buildQuizModeQueue = buildQuizModeQueue;
  window.buildClozePrompt = buildClozePrompt;
  window.buildQuizOptions = buildQuizOptions;
  window.generateQuizQuestions = generateQuizQuestions;
  window.startQuizSession = startQuizSession;
  window.renderQuizQuestion = renderQuizQuestion;
  window.selectQuizOption = selectQuizOption;
  window.evaluateQuizAnswer = evaluateQuizAnswer;
  window.nextQuizQuestion = nextQuizQuestion;
  window.handleQuizKeyboard = handleQuizKeyboard;
  window.quitQuizSession = quitQuizSession;
  window.showQuizResults = showQuizResults;
  window.restartQuizConfig = restartQuizConfig;
  window.retrySameQuiz = retrySameQuiz;
  window.retryWrongOnly = retryWrongOnly;
}
`);

// 6. tabs/cheques-tab.js
write('src/modules/tabs/cheques-tab.js', `
import { state } from '../state.js';
import { NUMBERS_DATA } from '../../data/numbers-ref.js';
import { showToast } from '../ui-utils.js';
import { speakFrenchText, frWordsToPron } from '../audio.js';
import { shuffleArray } from './quiz-tab.js';

${sliceFn('function numberToFrench', 'function calculateBtpBeton')}

if (typeof window !== 'undefined') {
  window.numberToFrench = numberToFrench;
  window.numberToArabic = numberToArabic;
  window.parseLocalizedChequeAmount = parseLocalizedChequeAmount;
  window.buildChequeAmountWords = buildChequeAmountWords;
  window.updateChequeConverter = updateChequeConverter;
  window.setChequeAmount = setChequeAmount;
  window.normalizeChequeAmountField = normalizeChequeAmountField;
  window.randomChequeAmount = randomChequeAmount;
  window.updateChequeDetails = updateChequeDetails;
  window.writeChequeClipboard = writeChequeClipboard;
  window.copyChequeText = copyChequeText;
  window.resetChequeEditor = resetChequeEditor;
  window.speakChequeText = speakChequeText;
  window.numGame = numGame;
  window.startNumGame = startNumGame;
  window.stopNumGame = stopNumGame;
  window.newNumQuestion = newNumQuestion;
  window.checkNumInput = checkNumInput;
  window.handleNumGameInputKey = handleNumGameInputKey;
  window.pickNumOption = pickNumOption;
  window.finishNumGame = finishNumGame;
  window.renderReferenceNumbersTable = renderReferenceNumbersTable;
  window.renderNumbersChart = renderNumbersChart;
  window.setNumbersFilter = setNumbersFilter;
}
`);

// 7. tabs/calc-tab.js
write('src/modules/tabs/calc-tab.js', `
import { showToast } from '../ui-utils.js';

${sliceFn('function calculateBtpBeton', 'function getReadingProgress')}

if (typeof window !== 'undefined') {
  window.calculateBtpBeton = calculateBtpBeton;
  window.calculateBtpAcier = calculateBtpAcier;
  window.calculateBtpBriques = calculateBtpBriques;
  window.calculateBtpCarrelage = calculateBtpCarrelage;
  window.calculateBtpFinances = calculateBtpFinances;
  window.copyCalcResult = copyCalcResult;
}
`);

// 8. tabs/reading-tab.js
write('src/modules/tabs/reading-tab.js', `
import { state, saveStateToLocalStorage } from '../state.js';
import { READING_DOCS } from '../../data/reading-docs.js';
import { appendTextElement, showToast } from '../ui-utils.js';
import { speakFrenchText } from '../audio.js';

${sliceFn('function getReadingProgress', 'function renderWritingTemplatesSelector')}

if (typeof window !== 'undefined') {
  window.getReadingProgress = getReadingProgress;
  window.getReadingAssessment = getReadingAssessment;
  window.updateReadingOverallProgress = updateReadingOverallProgress;
  window.renderReadingDocsSelector = renderReadingDocsSelector;
  window.renderReadingDoc = renderReadingDoc;
  window.toggleAnswerReveal = toggleAnswerReveal;
  window.assessReadingAnswer = assessReadingAnswer;
  window.updateReadingDocumentProgress = updateReadingDocumentProgress;
  window.adjustReadingFont = adjustReadingFont;
  window.copyReadingDocument = copyReadingDocument;
  window.resetReadingDocumentProgress = resetReadingDocumentProgress;
}
`);

// 9. tabs/writing-tab.js
write('src/modules/tabs/writing-tab.js', `
import { state } from '../state.js';
import { WRITING_TEMPLATES } from '../../data/writing-templates.js';
import { appendTextElement, showToast } from '../ui-utils.js';

${sliceFn('function renderWritingTemplatesSelector', 'function renderGrammarAccordions')}

if (typeof window !== 'undefined') {
  window.renderWritingTemplatesSelector = renderWritingTemplatesSelector;
  window.loadWritingTemplate = loadWritingTemplate;
  window.updateTemplateOutput = updateTemplateOutput;
  window.renderTemplateOutput = renderTemplateOutput;
  window.copyTemplateToClipboard = copyTemplateToClipboard;
}
`);

// 10. tabs/grammar-tab.js
write('src/modules/tabs/grammar-tab.js', `
import { GRAMMAR_LESSONS } from '../../data/grammar-lessons.js';

${sliceFn('function renderGrammarAccordions', 'function renderStudyPlan')}

if (typeof window !== 'undefined') {
  window.renderGrammarAccordions = renderGrammarAccordions;
  window.toggleAccordion = toggleAccordion;
}
`);

// 11. tabs/plan-tab.js
write('src/modules/tabs/plan-tab.js', `
import { state, saveStateToLocalStorage, initStats } from '../state.js';
import { PLAN_TASKS } from '../../data/plan-tasks.js';
import { switchTab } from '../ui-utils.js';

${sliceFn('function renderStudyPlan', null)}

if (typeof window !== 'undefined') {
  window.renderStudyPlan = renderStudyPlan;
  window.togglePlanDay = togglePlanDay;
  window.goToPlanTab = goToPlanTab;
}
`);

// 12. pwa.js
write('src/modules/pwa.js', `
import { showToast } from './ui-utils.js';

let deferredPrompt = null;

export function initPWA() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) installBtn.style.display = 'inline-flex';
  });

  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
      .then(reg => {
        console.log('Service Worker Registered Successfully:', reg.scope);
        reg.addEventListener('updatefound', () => {
          const worker = reg.installing;
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              showToast('يتوفر تحديث جديد وسيُفعّل عند فتح التطبيق مرة أخرى.');
            }
          });
        });
      })
      .catch(err => console.error('Service Worker Registration Failed:', err));
  }
}

export function installPWAApp() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      showToast('تمت إضافة التطبيق إلى الشاشة الرئيسية بنجاح!');
    }
    deferredPrompt = null;
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) installBtn.style.display = 'none';
  });
}

if (typeof window !== 'undefined') {
  window.installPWAApp = installPWAApp;
}
`);

// 13. app.js (Master entry point)
write('src/app.js', `
import { state, loadStateFromLocalStorage, initStats } from './modules/state.js';
import { initializeTabs } from './modules/ui-utils.js';
import { renderVocabCategoryFilter, renderVocabList } from './modules/tabs/vocab-tab.js';
import { initQuizConfigSelects } from './modules/tabs/quiz-tab.js';
import { updateChequeDetails, updateChequeConverter, renderNumbersChart } from './modules/tabs/cheques-tab.js';
import { renderReadingDocsSelector, renderReadingDoc } from './modules/tabs/reading-tab.js';
import { renderWritingTemplatesSelector, loadWritingTemplate } from './modules/tabs/writing-tab.js';
import { renderGrammarAccordions } from './modules/tabs/grammar-tab.js';
import { renderStudyPlan } from './modules/tabs/plan-tab.js';
import { initPWA } from './modules/pwa.js';

export function bootstrapApp() {
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
  updateChequeConverter();

  initPWA();
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', bootstrapApp);
}
`);

// ==========================================================================
// C. CSS MODULARIZATION
// ==========================================================================
const sliceCss = (startText, endText) => {
  const s = rawCss.indexOf(startText);
  if (s === -1) throw new Error(`CSS start not found: ${startText}`);
  if (!endText) return rawCss.slice(s).trim();
  const e = rawCss.indexOf(endText, s);
  if (e === -1) throw new Error(`CSS end not found: ${endText}`);
  return rawCss.slice(s, e).trim();
};

const nordMarker = 'ONEPLUS NORD 5 FINAL DEVICE PROFILE';

// 1. tokens.css
write('src/styles/tokens.css', sliceCss(':root {', '* {'));

// 2. base.css
write('src/styles/base.css', sliceCss('* {', '/* ==========================================================================\n       HEADER & NAVIGATION'));

// 3. components.css
write('src/styles/components.css', sliceCss('/* ==========================================================================\n       HEADER & NAVIGATION', '/* ========================================================================\n       MATERIAL DESIGN 3'));

// 4. md3-theme.css
write('src/styles/md3-theme.css', sliceCss('/* ========================================================================\n       MATERIAL DESIGN 3', nordMarker));

// 5. mobile-nord5.css
write('src/styles/mobile-nord5.css', sliceCss(nordMarker, null));

// 6. index.css (aggregates all styles with @import)
write('src/styles/index.css', `
@import './tokens.css';
@import './base.css';
@import './components.css';
@import './md3-theme.css';
@import './mobile-nord5.css';
`);

console.log('\nAll CSS & JS modules generated successfully!');
