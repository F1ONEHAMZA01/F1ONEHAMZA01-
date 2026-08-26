/**
 * Declarative event delegation layer.
 * Template elements declare `data-call="fnName"` + optional `data-args='[...]'`
 * (JSON array; the sentinel "__el__" resolves to the clicked element).
 * This removes every inline `onclick=` handler from the markup, which lets the
 * production CSP drop `script-src 'unsafe-inline'` entirely.
 */

import { switchTab, scrollToTopSmooth, showToast } from './ui-utils.js';
import { speakCurrentWord, speakFrenchText, markCurrentLearned } from './audio.js';
import { installPWAApp } from './pwa.js';
import { exportProgressData, importProgressFile } from './state.js';
import { startSrsSession, revealSrsAnswer, gradeSrsCard } from './srs.js';
import {
  clearSearchInput, setLevelFilter, loadMoreWords, handleSearchInput
} from './tabs/vocab-tab.js';
import {
  switchQuizSubTab, startQuizPreset, startQuizSession, showQuizHint,
  quitQuizSession, nextQuizQuestion, restartQuizConfig, retryWrongOnly,
  retrySameQuiz
} from './tabs/quiz-tab.js';
import {
  switchChequesSubTab, setChequeAmountAndSpeak, randomChequeAmountAndSpeak,
  resetChequeEditor, speakChequeText, copyChequeText, speakDecomposedNumber,
  setRefTableCategory, setNumbersFilter, startNumGamePreset, startNumGame,
  stopNumGame, checkNumInput, newNumQuestion,
  updateChequeConverter, updateChequeBank, toggleChequeBarre, toggleChequeCertifie,
  updateChequeDetails, runNumberDecomposer, handleNumGameInputKey,
  filterNumbersChartLive, filterReferenceTableLive
} from './tabs/cheques-tab.js';
import {
  switchReadingSubTab, filterReadingDocsByCategory,
  switchDocInnerTab, initReadingQuiz, checkReadingQuizOption, nextReadingQuizQuestion,
  renderReadingDocsSelector
} from './tabs/reading-tab.js';
import {
  switchWritingSubTab, filterWritingTemplates, filterPhrasesByCategory,
  selectEmailScenario, renderWritingTemplatesSelector, renderWritingPhrases
} from './tabs/writing-tab.js';
import {
  switchGrammarSubTab, filterGrammarByCategory,
  initGrammarQuiz, checkGrammarQuizOption, nextGrammarQuizQuestion,
  selectVerbConjugation, handleGrammarSearch
} from './tabs/grammar-tab.js';
import {
  switchCalcSubTab, setBetonPreset, copyCalcResult,
  calculateBtpBeton, calculateBtpAcier, calculateBtpBriques,
  calculateBtpCarrelage, calculateBtpFinances, calculateBtpToupie, calculateBtpPlatre
} from './tabs/calc-tab.js';
import {
  setPlanMonthFilter, toggleAllPlanMonths, togglePlanUncompletedOnly, resetPlanProgress,
  togglePlanDay, goToPlanTab, handlePlanSearch
} from './tabs/plan-tab.js';

/** Speaks raw text carried in data-speak (avoids inline string escaping). */
function speakFromDataset(el) {
  const text = el.dataset.speak;
  if (text) speakFrenchText(text, el);
}

/** Copies raw text from data-copy with the standard toast. */
function copyFromDataset(el) {
  const text = el.dataset.copy || '';
  if (!text) return;
  navigator.clipboard.writeText(text)
    .then(() => showToast('تم النسخ إلى الحافظة 📋', 'success'))
    .catch(() => showToast('تعذر النسخ', 'error'));
}

/** Speaks the current generated email preview. */
function speakEmailPreview(el) {
  const view = document.getElementById('email-text-view');
  if (view) speakFrenchText(view.innerText, el);
}

export const ACTIONS = {
  switchTab,
  scrollToTopSmooth,
  speakCurrentWord,
  installPWAApp,
  exportProgressData,
  clearSearchInput,
  setLevelFilter,
  loadMoreWords,
  switchQuizSubTab,
  startQuizPreset,
  startQuizSession,
  showQuizHint,
  quitQuizSession,
  nextQuizQuestion,
  restartQuizConfig,
  retryWrongOnly,
  retrySameQuiz,
  switchChequesSubTab,
  setChequeAmountAndSpeak,
  randomChequeAmountAndSpeak,
  resetChequeEditor,
  speakChequeText,
  copyChequeText,
  speakDecomposedNumber,
  setRefTableCategory,
  setNumbersFilter,
  startNumGamePreset,
  startNumGame,
  stopNumGame,
  checkNumInput,
  newNumQuestion,
  switchReadingSubTab,
  filterReadingDocsByCategory,
  switchWritingSubTab,
  filterWritingTemplates,
  filterPhrasesByCategory,
  switchGrammarSubTab,
  filterGrammarByCategory,
  switchCalcSubTab,
  setBetonPreset,
  copyCalcResult,
  markCurrentLearned,
  startSrsSession,
  revealSrsAnswer,
  gradeSrsCard,
  selectEmailScenario,
  speakFromDataset,
  copyFromDataset,
  speakEmailPreview,
  switchDocInnerTab,
  initReadingQuiz,
  checkReadingQuizOption,
  nextReadingQuizQuestion,
  initGrammarQuiz,
  checkGrammarQuizOption,
  nextGrammarQuizQuestion,
  selectVerbConjugation,
  togglePlanDay,
  goToPlanTab,
  handleSearchInput,
  importProgressFile,
  updateChequeConverter,
  updateChequeBank,
  toggleChequeBarre,
  toggleChequeCertifie,
  updateChequeDetails,
  runNumberDecomposer,
  handleNumGameInputKey,
  filterNumbersChartLive,
  filterReferenceTableLive,
  renderReadingDocsSelector,
  renderWritingTemplatesSelector,
  renderWritingPhrases,
  handleGrammarSearch,
  handlePlanSearch,
  calculateBtpBeton,
  calculateBtpAcier,
  calculateBtpBriques,
  calculateBtpCarrelage,
  calculateBtpFinances,
  calculateBtpToupie,
  calculateBtpPlatre,
  setPlanMonthFilter,
  toggleAllPlanMonths,
  togglePlanUncompletedOnly,
  resetPlanProgress,
  triggerImportPicker
};

function resolveSentinels(a, el, event) {
  if (a === '__el__') return el;
  if (a === '__checked__') return el.checked;
  if (a === '__value__') return el.value;
  if (a === '__event__') return event;
  return a;
}

function parseArgs(el, raw, event) {
  if (!raw) return [];
  try {
    return JSON.parse(raw).map(a => resolveSentinels(a, el, event));
  } catch (err) {
    console.warn('Bad data-args JSON for', el.dataset.call || el.dataset.input, err);
    return null;
  }
}

function runAction(el, event, nameAttr = 'call') {
  const fn = ACTIONS[el.dataset[nameAttr]];
  if (typeof fn !== 'function') {
    console.warn(`Unknown delegated action: ${el.dataset[nameAttr]}`);
    return;
  }
  const args = parseArgs(el, el.dataset.args, event);
  if (args) fn(...args);
}

function dispatchDelegatedAction(event) {
  const el = event.target.closest?.('[data-call]');
  if (!el || el.disabled) return;
  runAction(el, event);
}

/** Handles data-input / data-change / data-keydown declarative wiring. */
function dispatchDelegatedInput(event) {
  const attr = event.type === 'input' ? 'input'
    : event.type === 'change' ? 'change'
    : event.type === 'keydown' ? 'keydown' : null;
  if (!attr || !event.target) return;
  const el = event.target.closest?.(`[data-${attr}]`);
  if (!el) return;
  runAction(el, event, attr);
}

/** Opens the hidden file picker for progress import. */
export function triggerImportPicker() {
  document.getElementById('import-progress-input')?.click();
}

export function initDelegatedActions() {
  document.addEventListener('click', dispatchDelegatedAction);
  document.addEventListener('input', dispatchDelegatedInput, { passive: true });
  document.addEventListener('change', dispatchDelegatedInput, { passive: true });
  document.addEventListener('keydown', dispatchDelegatedInput);
}
