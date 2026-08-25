import { state, getWordId, saveStateToLocalStorage, initStats } from './state.js';
import { FR_PRON_TOKENS } from '../data/numbers-ref.js';

/**
 * Checks if the Web Speech Synthesis API is supported by the client browser
 * @returns {boolean} True if TTS is available
 */
export function ttsAvailable() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Pre-warms the browser's speech synthesis engine in idle time
 */
export function prewarmTtsVoices() {
  if (!ttsAvailable()) return;
  try {
    window.speechSynthesis.getVoices();
    if ('onvoiceschanged' in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        try { window.speechSynthesis.getVoices(); } catch(e) {}
      };
    }
  } catch(e) {}
}

if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(prewarmTtsVoices);
  } else {
    setTimeout(prewarmTtsVoices, 500);
  }
}

/**
 * Pronounces French text with accurate construction site cadence and visual pulse
 * @param {string} text - French text to pronounce
 * @param {HTMLElement} [btnEl] - Optional triggering button for visual soundwave pulse
 */
export function speakFrenchText(text, btnEl) {
  if (!text || !ttsAvailable()) return;

  try {
    window.speechSynthesis.cancel();
  } catch(e) {}

  if (btnEl) {
    btnEl.classList.add('btn-speaking');
  }

  const utt = new SpeechSynthesisUtterance(text.trim());
  utt.lang = 'fr-FR';
  utt.rate = 0.92;

  const cleanup = () => {
    if (btnEl) {
      btnEl.classList.remove('btn-speaking');
      btnEl.style.transform = '';
      btnEl.style.borderColor = '';
    }
  };

  utt.onend = cleanup;
  utt.onerror = cleanup;

  try {
    window.speechSynthesis.speak(utt);
  } catch(e) {
    cleanup();
  }
}

/**
 * Pronounces the currently active quiz word in French
 */
export function speakCurrentWord() {
  if (state.currentQuestion && state.currentQuestion.word) {
    speakFrenchText(state.currentQuestion.word.fr);
  }
}

/**
 * Marks the currently active quiz word as learned/mastered
 * @param {HTMLButtonElement} [btnEl] - The button element to update
 */
export function markCurrentLearned(btnEl) {
  if (!state.currentQuestion || !state.currentQuestion.word) return;
  const key = getWordId(state.currentQuestion.word);
  state.learned.add(key);
  saveStateToLocalStorage();
  initStats();
  if (btnEl) {
    btnEl.innerText = '✓ تمت الإضافة للمتقنة';
    btnEl.disabled = true;
  }
}

/**
 * Converts French number words into Arabic phonetic transcription
 * @param {string} str - French words string
 * @returns {string} Arabic phonetic pronunciation
 */
export function frWordsToPron(str) {
  return str.trim().split(/\s+/).map(word => {
    if (FR_PRON_TOKENS[word]) return FR_PRON_TOKENS[word];
    return word.split('-').map(part => FR_PRON_TOKENS[part] || part).join('-');
  }).join(' ');
}

if (typeof window !== 'undefined') {
  window.ttsAvailable = ttsAvailable;
  window.speakFrenchText = speakFrenchText;
  window.speakCurrentWord = speakCurrentWord;
  window.markCurrentLearned = markCurrentLearned;
  window.frWordsToPron = frWordsToPron;
}
