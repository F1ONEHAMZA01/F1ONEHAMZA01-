import { state, getVocabDataset, getVocabSearchIndex, saveStateToLocalStorage } from './state.js';

/**
 * Spaced Repetition System (SM-2 algorithm) for long-term vocabulary retention.
 * Each word gets: ef (easiness factor >=1.3), interval (days), reps, due (ISO date).
 */

const SRS_SESSION_SIZE = 20;
let srsQueue = [];
let srsCurrentIndex = -1;
let srsRevealed = false;
let srsSessionGrades = { again: 0, hard: 0, good: 0, easy: 0 };
let srsActiveCard = null;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(baseDate, days) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** @returns {{ef:number, interval:number, reps:number, due:string}} */
function defaultSrsEntry(today) {
  return { ef: 2.5, interval: 0, reps: 0, due: today };
}

/**
 * Core SM-2 scheduling transition.
 * @param {{ef:number, interval:number, reps:number, due:string}} entry Current card state
 * @param {number} quality Recall quality (0=again, 3=hard, 4=good, 5=easy)
 * @param {string} [today] ISO date override for deterministic tests
 */
export function scheduleSrsEntry(entry, quality, today = todayISO()) {
  let { ef, interval, reps } = { ...entry };

  if (quality < 3) {
    reps = 0;
    interval = 1;
  } else {
    ef = Math.max(1.3, ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    if (reps === 0) {
      interval = 1;
    } else if (reps === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ef);
    }
    reps += 1;
  }

  return { ef: Math.round(ef * 100) / 100, interval, reps, due: addDaysISO(today, interval) };
}

export function getSrsEntry(wordId) {
  if (!state.srs[wordId]) {
    state.srs[wordId] = defaultSrsEntry(todayISO());
  }
  return state.srs[wordId];
}

export function countDueWords(today = todayISO()) {
  return Object.values(state.srs).filter(entry => entry.due <= today).length;
}

export function collectDueWordIds(limit = SRS_SESSION_SIZE, today = todayISO()) {
  const dataset = getVocabDataset();
  const knownIds = new Set(getVocabSearchIndex().map(item => item.id));
  return Object.entries(state.srs)
    .filter(([id, entry]) => entry.due <= today && knownIds.has(id))
    .sort((a, b) => (a[1].due < b[1].due ? -1 : 1))
    .slice(0, limit)
    .map(([id]) => dataset.find(w => getWordIdSafe(w) === id))
    .filter(Boolean)
    .map(w => ({ word: w, id: getWordIdSafe(w) }));
}

function getWordIdSafe(word) {
  // Delegates to shared stable identity helper exposed by state.js
  if (typeof window !== 'undefined' && window.getWordId) return window.getWordId(word);
  return '';
}

// ════════════════════════════════════════════════════════════════════════════
// VIEW RENDERING (Quiz Tab > Flashcards sub-view)
// ════════════════════════════════════════════════════════════════════════════

export function renderSrsView() {
  const container = document.getElementById('srs-content-box');
  if (!container) return;

  const dueCount = countDueWords();
  const scheduledCount = Object.keys(state.srs).length;

  container.innerHTML = `
    <div class="quiz-stats-overview">
      <div class="plan-stats-grid" style="margin:0 0 18px;">
        <div class="plan-stat-card ${dueCount > 0 ? 'highlight' : ''}">
          <div class="plan-stat-value" style="color:${dueCount > 0 ? '#fb7185' : '#4ade80'};">${dueCount}</div>
          <div class="plan-stat-label">بطاقات مستحقة اليوم</div>
        </div>
        <div class="plan-stat-card">
          <div class="plan-stat-value" style="color:#60a5fa;">${scheduledCount}</div>
          <div class="plan-stat-label">مصطلحات في نظام المراجعة</div>
        </div>
        <div class="plan-stat-card">
          <div class="plan-stat-value" style="color:var(--gold-light);">${SRS_SESSION_SIZE}</div>
          <div class="plan-stat-label">الحد الأقصى للجلسة</div>
        </div>
      </div>
      <p class="quiz-config-intro">
        🧠 بطاقات التكرار المتباعد (SM-2): قيّم مدى تذكّرك للمصطلح بعد كشف الإجابة، وسيحدد النظام تلقائياً موعد المراجعة القادم — من يوم واحد إلى أسابيع حسب إتقانك.
      </p>
      <div style="display:flex; justify-content:center; margin-top:14px;">
        <button type="button" class="btn-primary" id="srs-start-btn" data-call="startSrsSession" ${dueCount === 0 && scheduledCount === 0 ? '' : ''}>
          🃏 ابدأ جلسة مراجعة (${Math.min(dueCount, SRS_SESSION_SIZE)} بطاقة)
        </button>
      </div>
    </div>
    <div id="srs-session-box"></div>
  `;
}

export function startSrsSession() {
  srsQueue = collectDueWordIds();

  if (!srsQueue.length) {
    const box = document.getElementById('srs-session-box');
    if (box) box.innerHTML = '<div class="review-perfect">🎉 لا توجد بطاقات مستحقة الآن — عد غداً أو بعد اختبار جديد!</div>';
    return;
  }

  srsCurrentIndex = -1;
  srsSessionGrades = { again: 0, hard: 0, good: 0, easy: 0 };
  nextSrsCard();
}

function nextSrsCard() {
  srsCurrentIndex += 1;
  const box = document.getElementById('srs-session-box');
  if (!box) return;

  if (srsCurrentIndex >= srsQueue.length) {
    finishSrsSession(box);
    return;
  }

  srsActiveCard = srsQueue[srsCurrentIndex];
  srsRevealed = false;
  const { word } = srsActiveCard;
  const pron = word.pron || '';

  box.innerHTML = `
    <div class="quiz-box" style="margin-top:14px;">
      <div class="quiz-header"><span>🃏 البطاقة ${srsCurrentIndex + 1} / ${srsQueue.length}</span><span>⏭️ Enter يكشف · 1-4 للتقييم</span></div>
      <div class="quiz-question-box">
        <div class="word-fr" style="font-size:26px;">${escapeHtmlSafe(word.fr)}</div>
        ${pron ? `<div class="pron-text">🗣️ ${escapeHtmlSafe(pron)}</div>` : ''}
        <div id="srs-answer-area" class="hidden">
          <div class="word-ar-text" style="font-size:20px; font-weight:800; color:#fff; margin-top:10px;">${escapeHtmlSafe(word.ar)}</div>
          ${word.example_fr ? `<div class="fb-ex"><div class="fb-ex-fr">${escapeHtmlSafe(word.example_fr)}</div><div class="fb-ex-ar">${escapeHtmlSafe(word.example_ar || '')}</div></div>` : ''}
        </div>
      </div>
      <div class="fb-actions" id="srs-actions">
        <button type="button" class="btn-secondary" data-call="speakFromDataset" data-speak="${escapeHtmlSafe(word.fr)}">🔊 استمع</button>
        <button type="button" class="btn-primary gold" data-call="revealSrsAnswer">👁️ اكشف الإجابة</button>
      </div>
      <div class="quiz-shortcuts">التقييم: 1 عاودت أنسى · 2 صعب · 3 جيد · 4 سهل</div>
    </div>
  `;
  window.__srsCurrentFr = word.fr;
}

function escapeHtmlSafe(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);
}

export function revealSrsAnswer() {
  if (!srsActiveCard || srsRevealed) return;
  srsRevealed = true;

  const answerArea = document.getElementById('srs-answer-area');
  if (answerArea) answerArea.classList.remove('hidden');

  const actions = document.getElementById('srs-actions');
  if (actions) {
    actions.innerHTML = `
      <button type="button" class="quiz-option-btn wrong" style="min-width:110px;" data-call="gradeSrsCard" data-args='[0]'>😵 عاودت أنسى</button>
      <button type="button" class="quiz-option-btn" style="min-width:90px;" data-call="gradeSrsCard" data-args='[3]'>😅 صعب</button>
      <button type="button" class="quiz-option-btn correct" style="min-width:90px;" data-call="gradeSrsCard" data-args='[4]'>👍 جيد</button>
      <button type="button" class="quiz-option-btn" style="min-width:90px; border-color:#22c55e;" data-call="gradeSrsCard" data-args='[5]'>⚡ سهل</button>
    `;
  }
}

export function gradeSrsCard(quality) {
  if (!srsActiveCard || !srsRevealed) return;

  const entry = getSrsEntry(srsActiveCard.id);
  state.srs[srsActiveCard.id] = scheduleSrsEntry(entry, quality);

  if (quality < 3) srsSessionGrades.again++;
  else if (quality === 3) srsSessionGrades.hard++;
  else if (quality === 4) srsSessionGrades.good++;
  else srsSessionGrades.easy++;

  saveStateToLocalStorage(true);
  nextSrsCard();
}

function finishSrsSession(box) {
  const total = srsQueue.length;
  const mastered = total - srsSessionGrades.again;
  box.innerHTML = `
    <div class="quiz-results-card" style="margin-top:14px;">
      <div style="font-size:40px;">${srsSessionGrades.again === 0 ? '🏆' : '📈'}</div>
      <h3 style="font-size:20px; font-weight:800; margin-bottom:8px;">اكتملت جلسة المراجعة!</h3>
      <div class="quiz-result-metrics">
        <div class="quiz-result-metric"><strong>${total}</strong>بطاقة مُراجعة</div>
        <div class="quiz-result-metric"><strong>${mastered}</strong>تقدمت للغد</div>
        <div class="quiz-result-metric"><strong>${srsSessionGrades.again}</strong>تحتاج إعادة</div>
      </div>
      <button type="button" class="btn-primary" data-call="switchQuizSubTab" data-args='["stats"]'>📊 عرض الإحصائيات ↗</button>
    </div>
  `;
  // Note: intentionally NOT calling renderSrsView() here — it would wipe this summary.
}

export function handleSrsKeyboard(event) {
  if (!srsActiveCard || event.altKey || event.ctrlKey || event.metaKey) return false;
  const sessionBox = document.getElementById('srs-session-box');
  if (!sessionBox || !sessionBox.offsetParent) return false;
  if (event.target?.matches?.('input, select, textarea')) return false;

  if (!srsRevealed && event.key === 'Enter') {
    event.preventDefault();
    revealSrsAnswer();
    return true;
  }
  if (srsRevealed && ['1', '2', '3', '4'].includes(event.key)) {
    event.preventDefault();
    gradeSrsCard([0, 3, 4, 5][+event.key - 1]);
    return true;
  }
  return false;
}

if (typeof window !== 'undefined') {
  document.addEventListener('keydown', handleSrsKeyboard);
}

if (typeof window !== 'undefined') {
  window.startSrsSession = startSrsSession;
  window.revealSrsAnswer = revealSrsAnswer;
  window.gradeSrsCard = gradeSrsCard;
}
