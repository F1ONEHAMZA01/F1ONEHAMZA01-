/**
 * Declarative event delegation layer.
 * Template elements declare `data-call="fnName"` + optional `data-args='[...]'`
 * (JSON array; the sentinel "__el__" resolves to the clicked element).
 * This removes every inline `onclick=` handler from the markup, which lets the
 * production CSP drop `script-src 'unsafe-inline'` entirely.
 */

import { switchTab, scrollToTopSmooth } from './ui-utils.js';
import { speakCurrentWord } from './audio.js';
import { installPWAApp } from './pwa.js';
import { exportProgressData } from './state.js';
import {
  clearSearchInput, setLevelFilter, loadMoreWords
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
  stopNumGame, checkNumInput, newNumQuestion
} from './tabs/cheques-tab.js';
import {
  switchReadingSubTab, filterReadingDocsByCategory
} from './tabs/reading-tab.js';
import {
  switchWritingSubTab, filterWritingTemplates, filterPhrasesByCategory
} from './tabs/writing-tab.js';
import {
  switchGrammarSubTab, filterGrammarByCategory
} from './tabs/grammar-tab.js';
import {
  switchCalcSubTab, setBetonPreset, copyCalcResult
} from './tabs/calc-tab.js';
import {
  setPlanMonthFilter, toggleAllPlanMonths, togglePlanUncompletedOnly, resetPlanProgress
} from './tabs/plan-tab.js';

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
  setPlanMonthFilter,
  toggleAllPlanMonths,
  togglePlanUncompletedOnly,
  resetPlanProgress,
  triggerImportPicker
};

function dispatchDelegatedAction(event) {
  const el = event.target.closest?.('[data-call]');
  if (!el || el.disabled) return;
  const fn = ACTIONS[el.dataset.call];
  if (typeof fn !== 'function') {
    console.warn(`Unknown delegated action: ${el.dataset.call}`);
    return;
  }
  let args = [];
  const raw = el.dataset.args;
  if (raw) {
    try {
      args = JSON.parse(raw).map(a => (a === '__el__' ? el : a));
    } catch (err) {
      console.warn('Bad data-args JSON for', el.dataset.call, err);
      return;
    }
  }
  fn(...args);
}

/** Opens the hidden file picker for progress import. */
export function triggerImportPicker() {
  document.getElementById('import-progress-input')?.click();
}

export function initDelegatedActions() {
  document.addEventListener('click', dispatchDelegatedAction);
}
