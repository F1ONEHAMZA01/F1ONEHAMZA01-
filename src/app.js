import { loadStateFromLocalStorage, initStats } from './modules/state.js';
import {
  initializeTabs, initializeMobileMoreNav, initializeDynamicHeader,
  initializeBidiContent, registerTabInitializer
} from './modules/ui-utils.js';
import { renderVocabCategoryFilter, renderVocabList } from './modules/tabs/vocab-tab.js';
import { initQuizConfigSelects } from './modules/tabs/quiz-tab.js';
import {
  updateChequeDetails, updateChequeConverter, renderNumbersChart,
  renderReferenceNumbersTable, runNumberDecomposer
} from './modules/tabs/cheques-tab.js';
import { renderReadingDocsSelector, renderReadingDoc } from './modules/tabs/reading-tab.js';
import { renderWritingTemplatesSelector, loadWritingTemplate } from './modules/tabs/writing-tab.js';
import { renderGrammarAccordions } from './modules/tabs/grammar-tab.js';
import { renderStudyPlan } from './modules/tabs/plan-tab.js';
import { initPWA } from './modules/pwa.js';
import { initMotion } from './modules/motion.js';
import { initDelegatedActions } from './modules/events.js';

export function bootstrapApp() {
  loadStateFromLocalStorage();

  registerTabInitializer('quiz', () => {
    initQuizConfigSelects();
  });
  registerTabInitializer('cheques', () => {
    updateChequeDetails();
    renderNumbersChart('all');
    renderReferenceNumbersTable();
    const decompInp = document.getElementById('num-decomposer-input');
    if (decompInp) decompInp.value = '81';
    runNumberDecomposer();
    updateChequeConverter();
  });
  registerTabInitializer('reading', () => {
    renderReadingDocsSelector();
    renderReadingDoc('bl');
  });
  registerTabInitializer('writing', () => {
    renderWritingTemplatesSelector();
    loadWritingTemplate('bc');
  });
  registerTabInitializer('grammar', () => {
    renderGrammarAccordions();
  });
  registerTabInitializer('plan', () => {
    renderStudyPlan();
  });

  initializeTabs();
  initializeMobileMoreNav();
  initializeDynamicHeader();
  initializeBidiContent();
  initMotion();
  initDelegatedActions();
  initStats();
  
  renderVocabCategoryFilter();
  renderVocabList(true);
  
  const d = new Date();
  const formattedDate = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth()+1).padStart(2, '0') + '/' + d.getFullYear();
  const chequeDateInput = document.getElementById('cheque-date-input');
  if (chequeDateInput) {
    chequeDateInput.value = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  const chequeDateDisplay = document.getElementById('cheque-date');
  if (chequeDateDisplay) chequeDateDisplay.innerText = formattedDate;
  initPWA();
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', bootstrapApp);
}
