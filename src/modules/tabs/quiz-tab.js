import { state, getVocabDataset, getWordId, saveStateToLocalStorage, initStats, normalizeSearchText } from '../state.js';
import { appendTextElement, showToast, escapeHtml, playHaptic } from '../ui-utils.js';
import { speakFrenchText, speakCurrentWord, markCurrentLearned, ttsAvailable } from '../audio.js';
import { SHORT_PHASE_NAMES } from './vocab-tab.js';
import { renderSrsView } from '../srs.js';

export const QUIZ_MODE_META = {
  fr_to_ar: { label: '🇫🇷 → 🇲🇦 اختر المعنى', answerField: 'ar' },
  ar_to_fr: { label: '🇲🇦 → 🇫🇷 اختر المصطلح', answerField: 'fr' },
  pron_fr: { label: '🔊 تعرّف على النطق', answerField: 'fr' },
  cloze: { label: '🧩 أكمل الجملة', answerField: 'fr' }
};

let autoAdvanceTimer = null;
let speedRunInterval = null;
let speedRunSecondsLeft = 60;

// ════════════════════════════════════════════════════════════════════════════
// 1. SUB-TABS NAVIGATION (TOP LEVEL TAB 2)
// ════════════════════════════════════════════════════════════════════════════
export function switchQuizSubTab(viewId, btnEl) {
  const allBtns = document.querySelectorAll('.quiz-subtab-btn');
  const allViews = document.querySelectorAll('.quiz-subview');

  allBtns.forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  allViews.forEach(v => {
    v.classList.add('hidden');
    v.classList.remove('active');
  });

  const targetView = document.getElementById(`quiz-view-${viewId}`);
  const targetBtn = btnEl || document.getElementById(`subtab-btn-quiz-${viewId}`);

  if (targetBtn) {
    targetBtn.classList.add('active');
    targetBtn.setAttribute('aria-selected', 'true');
  }
  if (targetView) {
    targetView.classList.remove('hidden');
    targetView.classList.add('active');
  }

  if (viewId === 'stats') {
    renderQuizStatsView();
  }
  if (viewId === 'srs') {
    renderSrsView();
  }
}

export function renderQuizStatsView() {
  const container = document.getElementById('quiz-stats-content-box');
  if (!container) return;

  const dataset = getVocabDataset();
  const totalWords = dataset.length;
  const learnedCount = state.learned ? state.learned.size : 0;
  const learnedPct = totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0;
  const wrongCount = Object.keys(state.wrongBank || {}).length;
  const quizzesTaken = state.quizzesTaken || 0;
  const bestStreak = state.quizMaxStreak || 0;

  container.innerHTML = `
    <div class="quiz-stats-overview">
      <div class="plan-stats-grid" style="margin:0 0 18px;">
        <div class="plan-stat-card">
          <div class="plan-stat-value" style="color:var(--gold-light);">${learnedCount} <small style="font-size:13px; color:#94a3b8;">/ ${totalWords}</small></div>
          <div class="plan-stat-label">المصطلحات المتقنة (${learnedPct}%)</div>
        </div>
        <div class="plan-stat-card ${wrongCount > 0 ? 'highlight' : ''}">
          <div class="plan-stat-value" style="color:${wrongCount > 0 ? '#fb7185' : '#4ade80'};">${wrongCount}</div>
          <div class="plan-stat-label">كلمات تحتاج مراجعة</div>
        </div>
        <div class="plan-stat-card">
          <div class="plan-stat-value" style="color:#60a5fa;">${bestStreak} 🔥</div>
          <div class="plan-stat-label">أعلى متتالية صحيحة</div>
        </div>
      </div>

      <div class="quiz-stats-actions" style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
        ${wrongCount > 0 ? `
          <button type="button" class="btn-primary" onclick="startQuizPreset('mistakes')">
            🧠 <span>ابدأ تدريب معالجة الأخطاء (${wrongCount} مصطلحاً)</span>
          </button>
        ` : `
          <div style="font-size:13.5px; color:#4ade80; font-weight:700; padding:8px 16px; background:rgba(34,197,94,0.1); border-radius:var(--radius-pill);">
            🎉 رائع جداً! لا توجد أخطاء عالقة في سجلّك حالياً.
          </div>
        `}
        <button type="button" class="btn-secondary" onclick="startQuizPreset('quick10')">
          ⚡ <span>جلسة 10 أسئلة جديدة</span>
        </button>
      </div>
    </div>
  `;
}

// State flags initialized if missing
if (typeof state.quizAutoAdvance === 'undefined') state.quizAutoAdvance = true;
if (typeof state.quizAutoPronounce === 'undefined') state.quizAutoPronounce = false;

export function toggleQuizAutoAdvance(checked) {
  state.quizAutoAdvance = checked;
  saveStateToLocalStorage();
}

export function toggleQuizAutoPronounce(checked) {
  state.quizAutoPronounce = checked;
  saveStateToLocalStorage();
}

export function shuffleArray(values) {
  const shuffled = values.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getQuizConfigFromControls() {
  return {
    category: document.getElementById('quiz-category-select')?.value || 'all',
    level: document.getElementById('quiz-level-select')?.value || 'all',
    mode: document.getElementById('quiz-mode-select')?.value || 'mixed',
    scope: document.getElementById('quiz-scope-select')?.value || 'all',
    order: document.getElementById('quiz-order-select')?.value || 'adaptive'
  };
}

export function getQuizPool(config = getQuizConfigFromControls()) {
  return getVocabDataset().filter(word => {
    if (config.category !== 'all' && word.category !== config.category) return false;
    if (config.level !== 'all' && word.level !== config.level) return false;

    const key = getWordId(word);
    if (config.scope === 'unlearned' && state.learned.has(key)) return false;
    if (config.scope === 'learned' && !state.learned.has(key)) return false;
    if (config.scope === 'mistakes' && !((state.wrongBank || {})[key])) return false;
    if (config.mode === 'cloze' && !buildClozePrompt(word)) return false;
    if (config.mode === 'pron_fr' && !word.pron) return false;
    return true;
  });
}

export function updateQuizAvailability() {
  const panel = document.getElementById('quiz-availability');
  const textEl = document.getElementById('quiz-availability-text');
  const startBtn = document.getElementById('quiz-start-btn');
  if (!panel || !textEl || !startBtn) return;

  const available = getQuizPool().length;
  const requestedValue = document.getElementById('quiz-count-select')?.value || '10';
  const requested = requestedValue === 'all' ? available : parseInt(requestedValue, 10);
  const actual = Math.min(available, requested);
  const enough = available >= 2;

  panel.classList.toggle('is-empty', !enough);
  startBtn.disabled = !enough;
  startBtn.innerText = enough
    ? `ابدأ جلسة مخصصة من ${actual} أسئلة / Démarrer`
    : 'غيّر الفلاتر لبدء الاختبار';
  textEl.innerText = enough
    ? `${available.toLocaleString('fr-FR')} كلمة متاحة · ستتضمن الجلسة ${actual} سؤالاً`
    : 'لا توجد كلمتان على الأقل بهذه الإعدادات.';
}

export function initQuizConfigSelects() {
  const catSelect = document.getElementById('quiz-category-select');
  if (!catSelect) return;

  const categoriesMap = new Map();
  getVocabDataset().forEach(word => {
    const cat = word.category;
    const phase = word.phase || 6;
    if (!categoriesMap.has(cat)) categoriesMap.set(cat, phase);
  });

  const sorted = Array.from(categoriesMap.entries()).sort((a, b) => {
    if (a[1] !== b[1]) return a[1] - b[1];
    return a[0].localeCompare(b[0], 'ar');
  });

  let currentPhase = null;
  sorted.forEach(([cat, phase]) => {
    if (phase !== currentPhase) {
      currentPhase = phase;
      const group = document.createElement('optgroup');
      group.label = SHORT_PHASE_NAMES[currentPhase] || `المرحلة ${currentPhase}`;
      catSelect.appendChild(group);
    }
    const opt = document.createElement('option');
    opt.value = cat;
    opt.innerText = cat;
    catSelect.lastChild.appendChild(opt);
  });

  ['quiz-category-select', 'quiz-level-select', 'quiz-mode-select', 'quiz-scope-select', 'quiz-order-select', 'quiz-count-select']
    .forEach(id => document.getElementById(id)?.addEventListener('change', updateQuizAvailability));
  document.addEventListener('keydown', handleQuizKeyboard);
  updateQuizScopeCounts();

  // Sync checkboxes
  const autoAdv = document.getElementById('quiz-auto-advance-chk');
  if (autoAdv) autoAdv.checked = Boolean(state.quizAutoAdvance);
  const autoPron = document.getElementById('quiz-auto-pronounce-chk');
  if (autoPron) autoPron.checked = Boolean(state.quizAutoPronounce);
}

export function updateQuizScopeCounts() {
  const scopeSel = document.getElementById('quiz-scope-select');
  if (!scopeSel) return;

  const dataset = getVocabDataset();
  const total = dataset.length;
  const learned = dataset.filter(word => state.learned.has(getWordId(word))).length;
  const unlearned = Math.max(0, total - learned);
  const validIds = new Set(dataset.map(getWordId));
  const mistakes = Object.keys(state.wrongBank || {}).filter(key => validIds.has(key)).length;

  scopeSel.options[0].text = `كل الكلمات (${total})`;
  scopeSel.options[1].text = `📖 غير المتقنة فقط (${unlearned})`;
  scopeSel.options[2].text = `✅ المتقنة فقط (${learned})`;
  scopeSel.options[3].text = `🧠 أخطائي السابقة (${mistakes})`;
  updateQuizAvailability();
}

export function orderQuizPool(pool, order) {
  const shuffled = shuffleArray(pool);
  if (order !== 'adaptive') return shuffled;
  return shuffled.sort((a, b) => {
    const aKey = getWordId(a);
    const bKey = getWordId(b);
    const aPriority = ((state.wrongBank || {})[aKey] || 0) * 100 + (state.learned.has(aKey) ? 0 : 10);
    const bPriority = ((state.wrongBank || {})[bKey] || 0) * 100 + (state.learned.has(bKey) ? 0 : 10);
    return bPriority - aPriority;
  });
}

export function buildQuizModeQueue(words, requestedMode) {
  if (requestedMode !== 'mixed') return words.map(() => requestedMode);
  const cycle = shuffleArray(['fr_to_ar', 'ar_to_fr', 'pron_fr', 'cloze']);
  let cursor = 0;
  return words.map(word => {
    for (let tries = 0; tries < cycle.length; tries++) {
      const candidate = cycle[(cursor + tries) % cycle.length];
      if (candidate === 'cloze' && !buildClozePrompt(word)) continue;
      if (candidate === 'pron_fr' && !word.pron) continue;
      cursor = (cursor + tries + 1) % cycle.length;
      return candidate;
    }
    return 'fr_to_ar';
  });
}

export function startQuizPreset(presetType) {
  if (speedRunInterval) clearInterval(speedRunInterval);
  if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);

  const dataset = getVocabDataset();
  if (!dataset || dataset.length < 2) {
    showToast('المفردات غير متوفرة حالياً.');
    return;
  }

  let words = [];
  let modeQueue = null;
  let runKind = 'preset';

  if (presetType === 'quick10') {
    // 10 unlearned/adaptive words
    const unlearned = dataset.filter(w => !state.learned.has(getWordId(w)));
    const pool = unlearned.length >= 10 ? unlearned : dataset;
    words = shuffleArray(pool).slice(0, 10);
    modeQueue = buildQuizModeQueue(words, 'mixed');
    state.quizRunKind = 'quick10';
  } else if (presetType === 'speed60') {
    // 60-second speed drill
    words = shuffleArray(dataset).slice(0, 40); // 40 max questions in 60s
    modeQueue = words.map(() => Math.random() > 0.5 ? 'fr_to_ar' : 'ar_to_fr');
    state.quizRunKind = 'speed60';
    startSpeedRunTimer();
  } else if (presetType === 'mistakes') {
    // Past mistakes
    const validIds = new Set(Object.keys(state.wrongBank || {}));
    const mistakesPool = dataset.filter(w => validIds.has(getWordId(w)));
    if (mistakesPool.length < 1) {
      showToast('ممتاز! ليس لديك أي أخطاء سابقة مسجلة 🎉');
      return;
    }
    words = shuffleArray(mistakesPool).slice(0, Math.min(20, mistakesPool.length));
    modeQueue = buildQuizModeQueue(words, 'mixed');
    state.quizRunKind = 'mistakes';
  } else if (presetType === 'audio') {
    // Audio challenge
    const pool = dataset.filter(w => w.pron);
    words = shuffleArray(pool).slice(0, 10);
    modeQueue = words.map(() => 'pron_fr');
    state.quizRunKind = 'audio';
  } else if (presetType === 'cloze') {
    // Cloze sentences
    const pool = dataset.filter(w => Boolean(buildClozePrompt(w)));
    words = shuffleArray(pool).slice(0, 10);
    modeQueue = words.map(() => 'cloze');
    state.quizRunKind = 'cloze';
  }

  beginQuizRun(words, modeQueue, state.quizRunKind);
}

function startSpeedRunTimer() {
  speedRunSecondsLeft = 60;
  const timerChip = document.getElementById('quiz-speed-timer');
  if (timerChip) {
    timerChip.classList.remove('hidden');
    timerChip.innerText = `⏱️ ${speedRunSecondsLeft}s`;
    timerChip.classList.remove('timer-danger');
  }

  speedRunInterval = setInterval(() => {
    speedRunSecondsLeft--;
    if (timerChip) {
      timerChip.innerText = `⏱️ ${speedRunSecondsLeft}s`;
      if (speedRunSecondsLeft <= 10) {
        timerChip.classList.add('timer-danger');
      }
    }
    if (speedRunSecondsLeft <= 0) {
      clearInterval(speedRunInterval);
      showToast('انتهى وقت تحدي الـ 60 ثانية! ⏱️');
      finishQuizSession();
    }
  }, 1000);
}

export function beginQuizRun(words, modeQueue = null, runKind = 'standard') {
  if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
  state.quizWords = words.slice();
  state.quizLength = state.quizWords.length;
  state.quizCurrentIndex = 0;
  state.quizScore = 0;
  state.quizActive = true;
  state.quizStreak = 0;
  state.quizMaxStreak = 0;
  state.quizStartedAt = Date.now();
  state.quizAnswers = [];
  state.currentQuestion = null;
  state.quizRunKind = runKind;
  state.quizConfig = state.quizConfig || getQuizConfigFromControls();
  state.quizModeQueue = modeQueue || buildQuizModeQueue(state.quizWords, state.quizConfig.mode);

  const timerChip = document.getElementById('quiz-speed-timer');
  if (timerChip && runKind !== 'speed60') timerChip.classList.add('hidden');

  document.getElementById('quiz-config-panel').classList.add('hidden');
  document.getElementById('quiz-results-panel').classList.add('hidden');
  document.getElementById('quiz-active-panel').classList.remove('hidden');
  document.getElementById('quiz-feedback').classList.add('hidden');
  renderQuizQuestion();
}

export function startQuizSession() {
  const countVal = document.getElementById('quiz-count-select')?.value || '10';
  state.quizConfig = getQuizConfigFromControls();
  const pool = orderQuizPool(getQuizPool(state.quizConfig), state.quizConfig.order);

  if (pool.length < 2) {
    showToast('عدد الكلمات المتوفر غير كافٍ. غيّر الفئة أو المستوى أو النطاق.');
    updateQuizAvailability();
    return;
  }

  const targetCount = countVal === 'all' ? pool.length : Math.min(pool.length, parseInt(countVal, 10));
  beginQuizRun(pool.slice(0, targetCount));
}

export function buildClozePrompt(word) {
  if (!word || !word.example_fr || !word.fr) return null;
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
}

export function getQuizAnswer(word, mode) {
  return QUIZ_MODE_META[mode]?.answerField === 'ar' ? word.ar : word.fr;
}

export function buildQuizOptions(word, mode) {
  const correctAnswer = getQuizAnswer(word, mode);
  const answerKey = normalizeSearchText(correctAnswer);
  const tiers = [
    getVocabDataset().filter(item => item.category === word.category && item.level === word.level),
    getVocabDataset().filter(item => item.category === word.category),
    getVocabDataset().filter(item => item.level === word.level),
    getVocabDataset()
  ];
  const seen = new Set([answerKey]);
  const distractors = [];
  for (const tier of tiers) {
    for (const candidate of shuffleArray(tier)) {
      if (getWordId(candidate) === getWordId(word)) continue;
      const answer = getQuizAnswer(candidate, mode);
      const key = normalizeSearchText(answer);
      if (!answer || seen.has(key)) continue;
      seen.add(key);
      distractors.push(answer);
      if (distractors.length === 3) return shuffleArray([correctAnswer, ...distractors]);
    }
  }
  return shuffleArray([correctAnswer, ...distractors]);
}

export function showQuizHint() {
  if (!state.currentQuestion || state.currentQuestion.answered) return;
  const word = state.currentQuestion.word;
  const hintBanner = document.getElementById('quiz-hint-banner');
  if (!hintBanner || !word) return;

  let hintText = '';
  if (state.currentQuestion.mode === 'ar_to_fr' || state.currentQuestion.mode === 'pron_fr') {
    const clean = word.fr.replace(/^(?:le|la|les|un|une|des|l')\s*/i, '');
    const prefix = clean.slice(0, 2);
    hintText = `💡 تلميح: المصطلح يبدأ بـ « ${prefix}... » ${word.pron ? `| النطق: [ ${word.pron} ]` : ''}`;
  } else if (state.currentQuestion.mode === 'fr_to_ar') {
    hintText = `💡 تلميح: المجال المهني « ${word.category} » ${word.pron ? `| نطق الكلمة: [ ${word.pron} ]` : ''}`;
  } else {
    hintText = `💡 تلميح: معنى الجملة بالعربية « ${word.example_ar || word.ar} »`;
  }

  hintBanner.innerText = hintText;
  hintBanner.classList.remove('hidden');
}

export function renderQuizQuestion() {
  if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
  const word = state.quizWords[state.quizCurrentIndex];
  if (!word) return;

  document.getElementById('quiz-progress-text').innerText = `السؤال ${state.quizCurrentIndex + 1} / ${state.quizLength}`;
  document.getElementById('quiz-live-score').innerText = `✅ ${state.quizScore} صحيحة`;
  document.getElementById('quiz-streak-display').innerText = `🔥 متتالية: ${state.quizStreak}`;
  const pct = Math.round((state.quizCurrentIndex / state.quizLength) * 100);
  document.getElementById('quiz-progress-bar-fill').style.width = `${pct}%`;
  document.getElementById('quiz-progress-bar').setAttribute('aria-valuenow', String(pct));

  const nextBtn = document.getElementById('quiz-next-btn');
  nextBtn.classList.add('hidden');
  nextBtn.innerText = state.quizCurrentIndex === state.quizLength - 1 ? 'عرض النتيجة / Résultat' : 'السؤال التالي / Suivant ↗';
  document.getElementById('quiz-feedback').classList.add('hidden');
  
  const hintBanner = document.getElementById('quiz-hint-banner');
  if (hintBanner) {
    hintBanner.classList.add('hidden');
    hintBanner.innerText = '';
  }

  let mode = state.quizModeQueue[state.quizCurrentIndex] || 'fr_to_ar';

  let qText = '';
  let qSub = '';
  if (mode === 'fr_to_ar') {
    qText = word.fr;
    qSub = word.pron ? `[ ${word.pron} ] — ما هو المعنى بالعربية؟` : 'ما هو المعنى بالعربية؟';
  } else if (mode === 'ar_to_fr') {
    qText = word.ar;
    qSub = 'اختر الكلمة الفرنسية المناسبة:';
  } else if (mode === 'pron_fr') {
    qText = `[ ${word.pron} ]`;
    qSub = `المعنى: (${word.ar}) — ما هي الكلمة بالفرنسية؟`;
  } else if (mode === 'cloze') {
    qText = buildClozePrompt(word);
    if (!qText) {
      mode = 'ar_to_fr';
      state.quizModeQueue[state.quizCurrentIndex] = mode;
      qText = word.ar;
      qSub = 'اختر الكلمة الفرنسية المناسبة:';
    } else {
      qSub = word.example_ar ? `الترجمة: « ${word.example_ar} »` : 'املأ الفراغ بالكلمة المناسبة:';
    }
  }

  const correctAnswer = getQuizAnswer(word, mode);
  const shuffledOptions = buildQuizOptions(word, mode);

  state.currentQuestion = {
    word: word,
    answer: correctAnswer,
    mode: mode,
    answered: false
  };

  const questionText = document.getElementById('quiz-question-text');
  questionText.innerText = qText;
  questionText.lang = mode === 'fr_to_ar' || mode === 'cloze' ? 'fr' : 'ar';
  questionText.dir = mode === 'fr_to_ar' || mode === 'cloze' ? 'ltr' : 'rtl';
  document.getElementById('quiz-question-sub').innerText = qSub;
  document.getElementById('quiz-current-mode').innerText = QUIZ_MODE_META[mode]?.label || 'سؤال';

  const meta = document.getElementById('quiz-question-meta');
  meta.replaceChildren();
  [word.category || 'عام', `المستوى ${word.level || '—'}`].forEach(text => appendTextElement(meta, 'span', '', text));

  const optsContainer = document.getElementById('quiz-options-container');
  optsContainer.replaceChildren();
  
  shuffledOptions.forEach((optText, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quiz-option-btn';
    btn.setAttribute('aria-label', `${index + 1}. ${optText}`);
    appendTextElement(btn, 'span', 'quiz-option-index', String(index + 1));
    appendTextElement(btn, 'span', 'quiz-option-text', optText);
    if (mode === 'ar_to_fr' || mode === 'pron_fr' || mode === 'cloze') {
      btn.style.fontFamily = 'var(--font-fr)';
      btn.style.direction = 'ltr';
    } else {
      btn.style.fontFamily = 'var(--font-ar)';
    }
    btn.onclick = () => handleQuizAnswer(optText, btn);
    optsContainer.appendChild(btn);
  });

  // Auto-pronounce if enabled and in French question mode
  if (state.quizAutoPronounce && (mode === 'fr_to_ar' || mode === 'cloze')) {
    setTimeout(() => speakFrenchText(word.fr), 100);
  }

  const qBox = document.getElementById('quiz-question-box');
  if (qBox) {
    qBox.classList.remove('question-enter');
    void qBox.offsetWidth; // trigger reflow
    qBox.classList.add('question-enter');
    requestAnimationFrame(() => qBox.focus({ preventScroll: true }));
  }
}

export function handleQuizAnswer(selectedOpt, btnEl) {
  if (!state.currentQuestion || state.currentQuestion.answered) return;
  state.currentQuestion.answered = true;
  
  const answer = state.currentQuestion.answer;
  const isCorrect = selectedOpt === answer;
  
  document.querySelectorAll('#quiz-options-container .quiz-option-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.querySelector('.quiz-option-text')?.innerText === answer) {
      btn.classList.add('correct');
    }
  });
  
  if (isCorrect) {
    playHaptic([15, 30, 15]);
    state.quizScore++;
    state.quizStreak++;
    state.quizMaxStreak = Math.max(state.quizMaxStreak, state.quizStreak);
    btnEl.classList.add('correct');
  } else {
    playHaptic([40, 50, 40]);
    state.quizStreak = 0;
    btnEl.classList.add('wrong');
  }

  const w = state.currentQuestion.word;
  state.quizAnswers.push({ word: w, isCorrect, chosen: selectedOpt, correct: answer, mode: state.currentQuestion.mode });

  const bankKey = getWordId(w);
  state.wrongBank = state.wrongBank || {};
  if (isCorrect) {
    if (state.wrongBank[bankKey] > 1) state.wrongBank[bankKey]--;
    else if (state.wrongBank[bankKey]) delete state.wrongBank[bankKey];
  } else {
    state.wrongBank[bankKey] = (state.wrongBank[bankKey] || 0) + 1;
  }
  saveStateToLocalStorage();

  const isLearned = state.learned.has(bankKey);
  const fb = document.getElementById('quiz-feedback');
  fb.className = 'quiz-feedback ' + (isCorrect ? 'correct-fb' : 'wrong-fb');
  fb.innerHTML =
    `<div class="fb-head">${isCorrect ? (state.quizStreak > 2 ? `🔥 متتالية x${state.quizStreak}! إجابة صحيحة` : '✅ إجابة صحيحة') : '❌ إجابة خاطئة — الإجابة الصحيحة:'}</div>` +
    `<div class="fb-word"><span class="fb-fr">${escapeHtml(w.fr)}</span> ${w.pron ? `<span class="fb-pron">[ ${escapeHtml(w.pron)} ]</span>` : ''} <span class="fb-ar">${escapeHtml(w.ar)}</span></div>` +
    (!isCorrect ? `<div class="review-answer-line">اختيارك: <span class="review-chosen">${escapeHtml(selectedOpt)}</span></div>` : '') +
    (w.example_fr ? `<div class="fb-ex"><span class="fb-ex-fr">${escapeHtml(w.example_fr)}</span>${w.example_ar ? `<span class="fb-ex-ar">${escapeHtml(w.example_ar)}</span>` : ''}</div>` : '') +
    `<div class="fb-actions">` +
      (ttsAvailable() ? `<button class="fb-action-btn" type="button" onclick="speakCurrentWord()">🔊 استمع</button>` : '') +
      (!isLearned ? `<button class="fb-action-btn gold" type="button" onclick="markCurrentLearned(this)">✓ حفظ كمتقنة</button>` : `<span class="fb-action-btn" style="background:rgba(34,197,94,0.15); color:#86efac; border:none;">✓ متقنة مسبقاً</span>`) +
    `</div>`;
  fb.classList.remove('hidden');

  document.getElementById('quiz-live-score').innerText = `✅ ${state.quizScore} صحيحة`;
  const streakDisplay = document.getElementById('quiz-streak-display');
  streakDisplay.innerText = `🔥 متتالية: ${state.quizStreak}`;
  streakDisplay.classList.toggle('has-streak', state.quizStreak >= 2);
  const completedPct = Math.round(((state.quizCurrentIndex + 1) / state.quizLength) * 100);
  document.getElementById('quiz-progress-bar-fill').style.width = `${completedPct}%`;
  document.getElementById('quiz-progress-bar').setAttribute('aria-valuenow', String(completedPct));
  document.getElementById('quiz-next-btn').classList.remove('hidden');

  // Instant Auto-advance on correct answers if enabled
  if (isCorrect && state.quizAutoAdvance) {
    autoAdvanceTimer = setTimeout(() => {
      nextQuizQuestion();
    }, 850);
  }
}

export function handleQuizKeyboard(event) {
  if (!state.quizActive || event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
  const target = event.target;
  if (target?.matches?.('input, select, textarea, [contenteditable="true"]')) return;

  if (/^[1-4]$/.test(event.key) && !state.currentQuestion?.answered) {
    const option = document.querySelectorAll('#quiz-options-container .quiz-option-btn')[Number(event.key) - 1];
    if (option && !option.disabled) {
      event.preventDefault();
      option.click();
    }
  } else if ((event.key === 'Enter' || event.key === ' ') && state.currentQuestion?.answered) {
    const nextBtn = document.getElementById('quiz-next-btn');
    if (nextBtn && !nextBtn.classList.contains('hidden')) {
      event.preventDefault();
      nextQuizQuestion();
    }
  } else if (event.key === 'a' || event.key === 'A' || event.key === 'r' || event.key === 'R') {
    event.preventDefault();
    speakCurrentWord();
  } else if (event.key === 'h' || event.key === 'H') {
    event.preventDefault();
    showQuizHint();
  }
}

export function nextQuizQuestion() {
  if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
  state.quizCurrentIndex++;
  if (state.quizCurrentIndex < state.quizLength) {
    renderQuizQuestion();
  } else {
    finishQuizSession();
  }
}

export function finishQuizSession() {
  if (speedRunInterval) clearInterval(speedRunInterval);
  if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
  state.quizActive = false;
  const total = Math.max(1, state.quizAnswers.length || state.quizLength || 1);
  const finalScorePct = Math.round((state.quizScore / total) * 100);
  const wrong = state.quizAnswers.filter(answer => !answer.isCorrect);
  const durationSeconds = Math.max(1, Math.round((Date.now() - state.quizStartedAt) / 1000));
  
  if (finalScorePct > (state.quizBestScore || 0)) {
    state.quizBestScore = finalScorePct;
    saveStateToLocalStorage();
    initStats();
  }
  
  document.getElementById('quiz-active-panel').classList.add('hidden');
  document.getElementById('quiz-results-panel').classList.remove('hidden');
  
  document.getElementById('quiz-result-score-circle').innerText = `${finalScorePct}%`;
  
  let title = '';
  if (state.quizRunKind === 'speed60') {
    title = `⚡ تحدي السرعة: ${state.quizScore} إجابات صحيحة في 60 ثانية!`;
  } else if (finalScorePct === 100) {
    title = 'ممتاز! درجة كاملة وأداء استثنائي 🏆';
  } else if (finalScorePct >= 80) {
    title = 'عمل رائع جداً ومستوى متقدم! 👏';
  } else if (finalScorePct >= 50) {
    title = 'نتيجة حسنة، واصل التدريب والتكرار! 👍';
  } else {
    title = 'تحتاج لمزيد من التكرار والمراجعة! 📚';
  }
  
  document.getElementById('quiz-result-title').innerText = title;
  document.getElementById('quiz-result-detail').innerText = state.quizRunKind === 'mistakes'
    ? `أنهيت مراجعة الأخطاء: ${state.quizScore} إجابات صحيحة من ${total}.`
    : `أجبت بشكل صحيح على ${state.quizScore} من أصل ${total} أسئلة في ${durationSeconds} ثانية.`;

  const metrics = document.getElementById('quiz-result-metrics');
  metrics.innerHTML = [
    `<div class="quiz-result-metric"><strong>${state.quizScore}/${total}</strong>إجابات صحيحة</div>`,
    `<div class="quiz-result-metric"><strong>${wrong.length}</strong>تحتاج تثبيتاً</div>`,
    `<div class="quiz-result-metric"><strong>${state.quizMaxStreak}</strong>أفضل متتالية 🔥</div>`,
    `<div class="quiz-result-metric"><strong>${durationSeconds}s</strong>مدة الجلسة ⏱️</div>`
  ].join('');

  const reviewEl = document.getElementById('quiz-review');
  const retryWrongBtn = document.getElementById('quiz-retry-wrong-btn');
  if (wrong.length) {
    reviewEl.innerHTML = `<div class="review-title">📌 راجِع الكلمات التي أخطأت فيها (${wrong.length}) :</div>` +
      `<div class="review-list">` + wrong.map(a =>
        `<div class="review-item">` +
          `<div class="review-item-head"><span class="fb-fr">${escapeHtml(a.word.fr)}</span><span class="fb-ar">${escapeHtml(a.word.ar)}</span></div>` +
          `<div class="review-answer-line">اختيارك: <span class="review-chosen">${escapeHtml(a.chosen)}</span></div>` +
          `<div class="review-answer-line">الصحيح: <span class="review-correct">${escapeHtml(a.correct)}</span></div>` +
        `</div>`
      ).join('') + `</div>`;
    retryWrongBtn.classList.remove('hidden');
  } else {
    reviewEl.innerHTML = `<div class="review-perfect">🎉 بدون أخطاء — إتقان وسرعة متميزة!</div>`;
    retryWrongBtn.classList.add('hidden');
  }
  updateQuizScopeCounts();
  requestAnimationFrame(() => document.getElementById('quiz-result-title')?.focus?.());
}

export function restartQuizConfig() {
  if (speedRunInterval) clearInterval(speedRunInterval);
  if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
  state.quizActive = false;
  state.currentQuestion = null;
  document.getElementById('quiz-active-panel').classList.add('hidden');
  document.getElementById('quiz-results-panel').classList.add('hidden');
  document.getElementById('quiz-config-panel').classList.remove('hidden');
  updateQuizScopeCounts();
}

export function quitQuizSession() {
  if (speedRunInterval) clearInterval(speedRunInterval);
  if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
  const answered = state.quizAnswers.length;
  if (answered > 0 && !confirm(`أجبت عن ${answered} أسئلة. هل تريد إنهاء الجلسة دون حفظ نتيجة نهائية؟`)) return;
  state.quizActive = false;
  state.currentQuestion = null;
  document.getElementById('quiz-active-panel').classList.add('hidden');
  document.getElementById('quiz-config-panel').classList.remove('hidden');
  updateQuizScopeCounts();
}

export function retrySameQuiz() {
  const words = shuffleArray(state.quizWords);
  beginQuizRun(words, buildQuizModeQueue(words, state.quizConfig.mode), state.quizRunKind || 'standard');
}

export function retryWrongOnly() {
  const wrongAnswers = state.quizAnswers.filter(answer => !answer.isCorrect);
  const wrongWords = wrongAnswers.map(answer => answer.word);
  if (wrongWords.length < 1) return;
  beginQuizRun(wrongWords, wrongAnswers.map(answer => answer.mode), 'mistakes');
}

if (typeof window !== 'undefined') {
  window.QUIZ_MODE_META = QUIZ_MODE_META;
  window.shuffleArray = shuffleArray;
  window.getQuizConfigFromControls = getQuizConfigFromControls;
  window.getQuizPool = getQuizPool;
  window.updateQuizAvailability = updateQuizAvailability;
  window.initQuizConfigSelects = initQuizConfigSelects;
  window.updateQuizScopeCounts = updateQuizScopeCounts;
  window.orderQuizPool = orderQuizPool;
  window.buildQuizModeQueue = buildQuizModeQueue;
  window.startQuizPreset = startQuizPreset;
  window.beginQuizRun = beginQuizRun;
  window.startQuizSession = startQuizSession;
  window.buildClozePrompt = buildClozePrompt;
  window.getQuizAnswer = getQuizAnswer;
  window.buildQuizOptions = buildQuizOptions;
  window.showQuizHint = showQuizHint;
  window.renderQuizQuestion = renderQuizQuestion;
  window.handleQuizAnswer = handleQuizAnswer;
  window.handleQuizKeyboard = handleQuizKeyboard;
  window.nextQuizQuestion = nextQuizQuestion;
  window.finishQuizSession = finishQuizSession;
  window.restartQuizConfig = restartQuizConfig;
  window.quitQuizSession = quitQuizSession;
  window.retrySameQuiz = retrySameQuiz;
  window.retryWrongOnly = retryWrongOnly;
  window.toggleQuizAutoAdvance = toggleQuizAutoAdvance;
  window.toggleQuizAutoPronounce = toggleQuizAutoPronounce;
  window.switchQuizSubTab = switchQuizSubTab;
  window.renderQuizStatsView = renderQuizStatsView;
}
