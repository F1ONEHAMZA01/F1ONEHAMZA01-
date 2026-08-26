/**
 * @typedef {Object} VocabWord
 * @property {string} fr - French technical term.
 * @property {string} ar - Arabic translation.
 * @property {string} [pron] - Phonetic pronunciation guide.
 * @property {string} category - BTP category domain.
 * @property {string} level - CEFR proficiency level (A1, A2, B1, B2).
 * @property {string} [example_fr] - Practical site context sentence in French.
 * @property {string} [example_ar] - Arabic translation of example sentence.
 * @property {string[]} [tags] - Search tags and keywords.
 * @property {string} [source] - Origin domain or reference document.
 */

/**
 * @typedef {Object} QuizConfig
 * @property {string} category - Filter category for quiz generation.
 * @property {string} level - Difficulty level filter.
 * @property {string} mode - Quiz question mode ('mixed', 'fr_to_ar', 'ar_to_fr', 'pron_fr', 'cloze').
 * @property {string} scope - Word subset ('all', 'unlearned', 'wrong_bank').
 * @property {string} order - Question sequencing ('adaptive', 'random', 'sequential').
 */

/**
 * Central Reactive Application State Store
 */
export const state = {
  /** @type {Set<string>} Set of acquired/learned word IDs */
  learned: new Set(),
  /** @type {Set<number>} Set of completed day numbers in 6-month plan */
  checkedDays: new Set(),
  /** @type {string} Currently active category filter in Vocab Tab */
  activeCategory: 'all',
  /** @type {string} Currently active level filter (A1-B2) */
  activeLevel: 'all',
  /** @type {string} Normalized search query */
  searchQuery: '',
  /** @type {number} Count of rendered word cards for virtualized pagination */
  renderedWordsCount: 0,
  /** @type {number} Batch size for vocab list pagination */
  wordsPerPage: 40,
  /** @type {string} Construction context region ('maroc') */
  context: 'maroc',
  
  /** @type {number} Highest recorded percentage in quiz mode */
  quizBestScore: 0,
  /** @type {boolean} Whether a quiz session is currently running */
  quizActive: false,
  /** @type {VocabWord[]} Active words selected for current quiz */
  quizWords: [],
  /** @type {number} Target length of current quiz */
  quizLength: 10,
  /** @type {number} Current question index in active quiz */
  quizCurrentIndex: 0,
  /** @type {number} Number of correct answers in active session */
  quizScore: 0,
  /** @type {number} Current consecutive correct answers streak */
  quizStreak: 0,
  /** @type {number} Maximum streak achieved in current session */
  quizMaxStreak: 0,
  /** @type {number} Timestamp when quiz started */
  quizStartedAt: 0,
  /** @type {string[]} Sequence of quiz modes for each question */
  quizModeQueue: [],
  /** @type {string} Quiz run preset kind ('standard', 'speedrun', 'wrong_bank', 'expert') */
  quizRunKind: 'standard',
  /** @type {Array<Object>} History log of answered questions */
  quizAnswers: [],
  /** @type {Record<string, number>} Error frequency tracker by word ID */
  wrongBank: {},
  /** @type {Record<string, {ef:number, interval:number, reps:number, due:string}>} SM-2 spaced repetition schedule */
  srs: {},
  /** @type {Object|null} Active question metadata */
  currentQuestion: null,
  /** @type {QuizConfig} Current quiz generator settings */
  quizConfig: {
    category: 'all',
    level: 'all',
    mode: 'mixed',
    scope: 'all',
    order: 'adaptive'
  },
  
  /** @type {string} Selected template ID in Writing Tab */
  activeTemplateId: 'bc',
  /** @type {Record<string, string>} Form field values for template builder */
  templateFieldValues: {},

  /** @type {string} Active document ID in Reading Tab */
  activeReadingDocId: 'bl',
  /** @type {Record<string, Object>} Per-document reading progress */
  readingProgress: {},
  /** @type {number} Current font zoom scale */
  readingFontScale: 1,

  /** @type {Set<number>} Set of expanded month indices in 6-month plan */
  planOpenMonths: new Set([1])
};

/**
 * Strips leading French articles from legacy word keys for migration
 * @param {string} word - Raw word key
 * @returns {string} Clean base word
 */
export function legacyWordKey(word) {
  let w = String(word || '').toLowerCase().trim();
  const articles = ["le ", "la ", "l'", "les ", "un ", "une ", "d'", "l’", "l' "];
  for (const art of articles) {
    if (w.startsWith(art)) {
      w = w.substring(art.length);
      break;
    }
  }
  return w.trim().replace("œ", "oe");
}

/**
 * Normalizes text by removing diacritics, accents, and normalizing ligatures
 * @param {string} value - Raw string
 * @returns {string} Normalized searchable string
 */
export function normalizeSearchText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/œ/g, 'oe')
    .trim();
}

/**
 * Computes a fast 32-bit FNV-1a hash of a string
 * @param {string} value - String to hash
 * @returns {string} Base-36 hash representation
 */
export function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

/**
 * Generates a stable unique identity string for a vocabulary word item
 * @param {VocabWord} word - Vocabulary word item
 * @returns {string} Deterministic word identity key
 */
export function getWordId(word) {
  if (!word) return '';
  const identity = [word.fr, word.ar, word.source, word.category].map(value => String(value || '').trim()).join('|');
  return `word:${hashString(identity)}`;
}

/**
 * Migrates legacy localStorage word references to stable hash-based identities
 * @param {Array<string>} values - Raw stored values
 * @returns {Set<string>} Set of migrated word ID keys
 */
function migrateStoredWordKeys(values) {
  const dataset = getVocabDataset();
  const migrated = new Set();
  (Array.isArray(values) ? values : []).forEach(value => {
    if (typeof value !== 'string') return;
    if (value.startsWith('word:')) {
      if (dataset.some(word => getWordId(word) === value)) migrated.add(value);
      return;
    }
    const match = dataset.find(word => legacyWordKey(word.fr) === value);
    if (match) migrated.add(getWordId(match));
  });
  return migrated;
}

let searchIndexCache = null;
let saveStateDebounceTimer = null;

export function getVocabSearchIndex() {
  if (searchIndexCache) return searchIndexCache;
  const dataset = getVocabDataset();
  searchIndexCache = dataset.map(word => ({
    word,
    id: getWordId(word),
    normFr: normalizeSearchText(word.fr),
    normAr: normalizeSearchText(word.ar),
    normPron: word.pron ? normalizeSearchText(word.pron) : '',
    normTags: Array.isArray(word.tags) ? word.tags.map(t => normalizeSearchText(t)).join(' ') : ''
  }));
  return searchIndexCache;
}

export function saveStateToLocalStorage(immediate = false) {
  const performSave = () => {
    try {
      localStorage.setItem('btp_learned', JSON.stringify(Array.from(state.learned)));
      localStorage.setItem('btp_checked_days', JSON.stringify(Array.from(state.checkedDays)));
      localStorage.setItem('btp_quiz_best', String(state.quizBestScore));
      localStorage.setItem('btp_quiz_wrong_bank', JSON.stringify(state.wrongBank || {}));
      localStorage.setItem('btp_srs', JSON.stringify(state.srs || {}));
      localStorage.setItem('btp_reading_progress', JSON.stringify(state.readingProgress || {}));
    } catch(e) {
      console.warn('Failed to persist app state to localStorage:', e);
    }
  };

  if (immediate) {
    if (saveStateDebounceTimer) clearTimeout(saveStateDebounceTimer);
    saveStateDebounceTimer = null;
    performSave();
    return;
  }

  if (saveStateDebounceTimer) clearTimeout(saveStateDebounceTimer);
  saveStateDebounceTimer = setTimeout(() => {
    saveStateDebounceTimer = null;
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(performSave, { timeout: 1000 });
    } else {
      performSave();
    }
  }, 250);
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => saveStateToLocalStorage(true));
  window.addEventListener('pagehide', () => saveStateToLocalStorage(true));
}

    function loadStateFromLocalStorage() {
      state.context = 'maroc';
      if (localStorage.getItem('btp_learned')) {
        try {
          const list = JSON.parse(localStorage.getItem('btp_learned'));
          state.learned = migrateStoredWordKeys(list);
        } catch(e) {
          console.warn('Failed to restore learned words, resetting set:', e);
        }
      }
      if (localStorage.getItem('btp_checked_days')) {
        try {
          const list = JSON.parse(localStorage.getItem('btp_checked_days'));
          state.checkedDays = new Set(list);
        } catch(e) {
          console.warn('Failed to restore checked days, resetting set:', e);
        }
      }
      if (localStorage.getItem('btp_quiz_best')) {
        state.quizBestScore = parseInt(localStorage.getItem('btp_quiz_best')) || 0;
      }
      state.wrongBank = {};
      if (localStorage.getItem('btp_quiz_wrong_bank')) {
        try {
          const storedBank = JSON.parse(localStorage.getItem('btp_quiz_wrong_bank')) || {};
          Object.entries(storedBank).forEach(([key, count]) => {
            const migratedKey = key.startsWith('word:')
              ? key
              : getWordId(getVocabDataset().find(word => legacyWordKey(word.fr) === key));
            if (migratedKey && getVocabDataset().some(word => getWordId(word) === migratedKey)) {
              state.wrongBank[migratedKey] = Math.max(1, Number(count) || 1);
            }
          });
        } catch(e) {
          console.warn('Failed to restore wrong-answer bank, resetting map:', e);
        }
      }
      state.srs = {};
      if (localStorage.getItem('btp_srs')) {
        try {
          const storedSrs = JSON.parse(localStorage.getItem('btp_srs'));
          if (storedSrs && typeof storedSrs === 'object' && !Array.isArray(storedSrs)) {
            Object.entries(storedSrs).forEach(([key, entry]) => {
              if (entry && typeof entry === 'object' && typeof entry.ef === 'number' && typeof entry.due === 'string') {
                state.srs[key] = {
                  ef: Math.max(1.3, entry.ef),
                  interval: Number(entry.interval) || 0,
                  reps: Number(entry.reps) || 0,
                  due: entry.due
                };
              }
            });
          }
        } catch(e) {
          console.warn('Failed to restore SRS schedule, resetting map:', e);
        }
      }
      if (localStorage.getItem('btp_reading_progress')) {
        try {
          const storedReading = JSON.parse(localStorage.getItem('btp_reading_progress'));
          if (storedReading && typeof storedReading === 'object' && !Array.isArray(storedReading)) {
            state.readingProgress = storedReading;
          }
        } catch(e) {
          console.warn('Failed to restore reading progress, resetting object:', e);
        }
      }
      saveStateToLocalStorage();
    }

    export function getVocabDataset() {
      if (typeof VOCAB_DATA !== 'undefined' && Array.isArray(VOCAB_DATA) && VOCAB_DATA.length > 0) {
        return VOCAB_DATA;
      }
      if (window.VOCAB_DATA && Array.isArray(window.VOCAB_DATA) && window.VOCAB_DATA.length > 0) {
        return window.VOCAB_DATA;
      }
      return [];
    }

    /**
     * Builds a portable snapshot of all user progress
     * @returns {Object} Progress payload safe to persist or share between devices
     */
    function buildProgressPayload() {
      return {
        app: 'francais-btp-maroc',
        schema: 1,
        exportedAt: new Date().toISOString(),
        learned: Array.from(state.learned),
        checkedDays: Array.from(state.checkedDays),
        quizBestScore: state.quizBestScore,
        wrongBank: state.wrongBank || {},
        srs: state.srs || {},
        readingProgress: state.readingProgress || {}
      };
    }

    /** Downloads all progress as a JSON backup file */
    function exportProgressData() {
      try {
        const payload = JSON.stringify(buildProgressPayload(), null, 2);
        const blob = new Blob([payload], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const stamp = new Date().toISOString().slice(0, 10);
        link.href = url;
        link.download = `btp-maroc-progress-${stamp}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        if (window.showToast) window.showToast('تم تصدير نسخة التقدم بنجاح! 📤', 'success');
      } catch (err) {
        console.error('Progress export failed:', err);
        if (window.showToast) window.showToast('تعذر التصدير — تحقق من إعدادات المتصفح', 'error');
      }
    }

    /** Restores progress from an exported JSON backup file */
    export function importProgressFile(fileInput) {
      const file = fileInput && fileInput.files && fileInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(String(reader.result));
          if (!data || data.app !== 'francais-btp-maroc') {
            throw new Error('not a Français BTP Maroc backup file');
          }

          state.learned = migrateStoredWordKeys(Array.isArray(data.learned) ? data.learned : []);
          state.checkedDays = new Set((Array.isArray(data.checkedDays) ? data.checkedDays : []).filter(n => Number.isInteger(n) && n >= 1 && n <= 999));
          state.quizBestScore = Math.min(100, Math.max(0, Number(data.quizBestScore) || 0));
          state.wrongBank = {};
          Object.entries(data.wrongBank && typeof data.wrongBank === 'object' ? data.wrongBank : {}).forEach(([key, count]) => {
            if (typeof key === 'string' && key.startsWith('word:')) state.wrongBank[key] = Math.max(1, Number(count) || 1);
          });
          state.srs = {};
          Object.entries(data.srs && typeof data.srs === 'object' ? data.srs : {}).forEach(([key, entry]) => {
            if (entry && typeof entry.ef === 'number' && typeof entry.due === 'string') {
              state.srs[key] = { ef: Math.max(1.3, entry.ef), interval: Number(entry.interval) || 0, reps: Number(entry.reps) || 0, due: entry.due };
            }
          });
          state.readingProgress = data.readingProgress && typeof data.readingProgress === 'object' && !Array.isArray(data.readingProgress)
            ? data.readingProgress : {};

          saveStateToLocalStorage(true);
          initStats();
          if (window.renderVocabList) window.renderVocabList(true);
          if (window.renderStudyPlan) window.renderStudyPlan();
          if (window.renderReadingDocsSelector) window.renderReadingDocsSelector();
          if (window.showToast) window.showToast(`تم استيراد التقدم بنجاح! ✅ (${state.learned.size} كلمة متقنة)`, 'success');
        } catch (err) {
          console.warn('Progress import rejected:', err);
          if (window.showToast) window.showToast('ملف غير صالح — استخدم ملف تصدير من نفس التطبيق', 'error');
        } finally {
          fileInput.value = '';
        }
      };
      reader.onerror = () => {
        if (window.showToast) window.showToast('تعذرت قراءة الملف', 'error');
        fileInput.value = '';
      };
      reader.readAsText(file);
    }

    export function initStats() {
      const dataset = getVocabDataset();
      const totalWords = dataset.length;
      const learnedCount = state.learned.size;
      const pct = totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0;
      
      document.getElementById('stats-words').innerHTML = `📚 <span>${learnedCount} / ${totalWords} الكلمات</span>`;
      document.getElementById('stats-pct').innerHTML = `✅ <span>${pct}% منجز</span>`;
      document.getElementById('stats-quiz').innerHTML = `🏆 <span>أفضل نتيجة: ${state.quizBestScore}%</span>`;
      
      const vocabBadge = document.getElementById('vocab-total-count-badge');
      if (vocabBadge && totalWords > 0) {
        vocabBadge.innerText = `${totalWords.toLocaleString('fr-FR')} مصطلح`;
      }
      
      const totalDays = (typeof PLAN_TASKS !== 'undefined' && PLAN_TASKS.length) ? PLAN_TASKS.length : 168;
      const daysFinished = state.checkedDays.size;
      document.getElementById('stats-plan').innerHTML = `📅 <span>خطة 6 أشهر: ${daysFinished}/${totalDays}</span>`;

      const planPct = Math.round((daysFinished / totalDays) * 100);
      const planPctText = document.getElementById('plan-progress-percent');
      if (planPctText) planPctText.innerText = `${planPct}% منجز`;
      const planFill = document.getElementById('plan-progress-bar-fill');
      if (planFill) planFill.style.width = `${planPct}%`;
    }

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
  window.getVocabSearchIndex = getVocabSearchIndex;
  window.initStats = initStats;
  window.exportProgressData = exportProgressData;
  window.importProgressFile = importProgressFile;
}
