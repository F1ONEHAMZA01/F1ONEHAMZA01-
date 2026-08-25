import { state, saveStateToLocalStorage } from '../state.js';
import { READING_DOCS } from '../../data/reading-docs.js';
import { appendTextElement, showToast, normalizeSearchText } from '../ui-utils.js';
import { speakFrenchText } from '../audio.js';

let activeReadingCategory = 'all';
let activeDocInnerTab = 'content';

// ════════════════════════════════════════════════════════════════════════════
// 1. SUB-TABS NAVIGATION (TOP LEVEL TAB 4)
// ════════════════════════════════════════════════════════════════════════════
export function switchReadingSubTab(viewId, btnEl) {
  const allBtns = document.querySelectorAll('.reading-subtab-btn');
  const allViews = document.querySelectorAll('.reading-subview');
  
  allBtns.forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  allViews.forEach(v => {
    v.classList.add('hidden');
    v.classList.remove('active');
  });

  const targetView = document.getElementById(`reading-view-${viewId}`);
  const targetBtn = btnEl || document.getElementById(`subtab-btn-reading-${viewId}`);

  if (targetBtn) {
    targetBtn.classList.add('active');
    targetBtn.setAttribute('aria-selected', 'true');
  }
  if (targetView) {
    targetView.classList.remove('hidden');
    targetView.classList.add('active');
  }

  if (viewId === 'quiz') {
    initReadingQuiz();
  } else if (viewId === 'guide') {
    renderBtpDocsGuide();
  }
}

// ════════════════════════════════════════════════════════════════════════════
// 2. IN-DOCUMENT SUB-TABS (INSIDE ACTIVE DOCUMENT)
// ════════════════════════════════════════════════════════════════════════════
export function switchDocInnerTab(tabId, btnEl) {
  activeDocInnerTab = tabId;
  const allBtns = document.querySelectorAll('.doc-inner-tab-btn');
  const allPanes = document.querySelectorAll('.doc-inner-pane');

  allBtns.forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  allPanes.forEach(p => {
    p.classList.add('hidden');
    p.classList.remove('active');
  });

  const targetPane = document.getElementById(`doc-pane-${tabId}`);
  const targetBtn = btnEl || document.getElementById(`doc-tab-btn-${tabId}`);

  if (targetBtn) {
    targetBtn.classList.add('active');
    targetBtn.setAttribute('aria-selected', 'true');
  }
  if (targetPane) {
    targetPane.classList.remove('hidden');
    targetPane.classList.add('active');
  }
}

// ════════════════════════════════════════════════════════════════════════════
// 3. PROGRESS & ASSESSMENTS
// ════════════════════════════════════════════════════════════════════════════
function getReadingProgress(docId) {
  const stored = state.readingProgress?.[docId] || {};
  return {
    good: Array.isArray(stored.good) ? stored.good.filter(Number.isInteger) : [],
    review: Array.isArray(stored.review) ? stored.review.filter(Number.isInteger) : [],
    completedAt: stored.completedAt || null
  };
}

function getReadingAssessment(docId, index) {
  const progress = getReadingProgress(docId);
  if (progress.good.includes(index)) return 'good';
  if (progress.review.includes(index)) return 'review';
  return null;
}

function updateReadingOverallProgress() {
  const output = document.getElementById('reading-overall-progress');
  if (!output) return;
  const totalQuestions = READING_DOCS.reduce((sum, doc) => sum + doc.questions.length, 0);
  const assessed = READING_DOCS.reduce((sum, doc) => {
    const progress = getReadingProgress(doc.id);
    return sum + new Set([...progress.good, ...progress.review]).size;
  }, 0);
  const completedDocs = READING_DOCS.filter(doc => {
    const progress = getReadingProgress(doc.id);
    return new Set([...progress.good, ...progress.review]).size >= doc.questions.length;
  }).length;
  output.innerText = `التقدم: ${assessed}/${totalQuestions} سؤالاً · ${completedDocs}/${READING_DOCS.length} مستندات مكتملة`;
}

// ════════════════════════════════════════════════════════════════════════════
// 4. DOCUMENT SELECTOR & FILTERING
// ════════════════════════════════════════════════════════════════════════════
export function filterReadingDocsByCategory(cat, btnEl) {
  activeReadingCategory = cat;
  const buttons = document.querySelectorAll('#reading-cat-filter-bar .lvl-btn');
  buttons.forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderReadingDocsSelector();
}

export function renderReadingDocsSelector() {
  const container = document.getElementById('reading-docs-selector-list');
  if (!container) return;

  const query = normalizeSearchText(document.getElementById('reading-doc-search')?.value || '');
  const levelFilter = document.getElementById('reading-level-filter')?.value || 'all';

  const filteredDocs = READING_DOCS.filter(doc => {
    if (levelFilter !== 'all' && doc.level !== levelFilter) return false;
    if (activeReadingCategory !== 'all' && doc.category !== activeReadingCategory) return false;
    if (!query) return true;
    return normalizeSearchText(`${doc.title} ${doc.ar_desc} ${doc.doc_content}`).includes(query);
  });

  const fragment = document.createDocumentFragment();
  filteredDocs.forEach(doc => {
    const progress = getReadingProgress(doc.id);
    const assessed = new Set([...progress.good, ...progress.review]).size;
    const complete = assessed >= doc.questions.length;
    const [arTitle, frTitle = ''] = doc.title.split('/').map(part => part.trim());

    const button = document.createElement('button');
    button.type = 'button';
    button.className = `category-item${state.activeReadingDocId === doc.id ? ' active-cat' : ''}`;
    button.id = `reading-sel-${doc.id}`;
    button.setAttribute('aria-pressed', String(state.activeReadingDocId === doc.id));
    button.addEventListener('click', () => {
      renderReadingDoc(doc.id);
      const activeView = document.getElementById('reading-document-active-view');
      if (window.innerWidth < 900 && activeView) {
        activeView.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    const copy = document.createElement('span');
    copy.className = 'reading-selector-copy';
    appendTextElement(copy, 'span', 'reading-selector-title', `${doc.icon} ${arTitle}`);
    const sub = appendTextElement(copy, 'span', 'reading-selector-sub', frTitle);
    sub.lang = 'fr';
    sub.dir = 'ltr';
    button.appendChild(copy);

    const meta = document.createElement('span');
    meta.className = 'reading-selector-meta';
    if (complete) appendTextElement(meta, 'span', 'reading-complete-dot', '✓');
    const level = appendTextElement(meta, 'span', `lvl-badge lvl-${String(doc.level || '').toLowerCase()}`, doc.level);
    level.title = `${assessed}/${doc.questions.length} أسئلة مقيّمة`;
    button.appendChild(meta);
    fragment.appendChild(button);
  });

  if (!filteredDocs.length) {
    appendTextElement(fragment, 'div', 'reading-empty-state', 'لا توجد مستندات مطابقة للبحث أو التصنيف.');
  }
  container.replaceChildren(fragment);
  updateReadingOverallProgress();

  if (!state.activeReadingDocId && filteredDocs.length) {
    renderReadingDoc(filteredDocs[0].id);
  }
}

function makeReadingStat(value, label) {
  const item = document.createElement('div');
  item.className = 'reading-stat';
  appendTextElement(item, 'strong', '', value);
  item.append(document.createTextNode(label));
  return item;
}

// ════════════════════════════════════════════════════════════════════════════
// 5. ACTIVE DOCUMENT RENDERER (WITH IN-DOC TABS)
// ════════════════════════════════════════════════════════════════════════════
export function renderReadingDoc(docId) {
  const doc = READING_DOCS.find(item => item.id === docId);
  if (!doc) return;
  state.activeReadingDocId = docId;
  renderReadingDocsSelector();

  const activeView = document.getElementById('reading-document-active-view');
  if (!activeView) return;

  const card = document.createElement('article');
  card.className = 'card reading-document-card';
  card.setAttribute('aria-labelledby', `reading-title-${doc.id}`);

  // Header Title Row
  const titleRow = document.createElement('div');
  titleRow.className = 'document-title-row';
  const title = appendTextElement(titleRow, 'h3', '', doc.title);
  title.id = `reading-title-${doc.id}`;
  title.tabIndex = -1;
  
  const badgesWrap = document.createElement('div');
  badgesWrap.style.display = 'flex';
  badgesWrap.style.gap = '6px';
  badgesWrap.style.alignItems = 'center';
  appendTextElement(badgesWrap, 'span', `lvl-badge lvl-${doc.level.toLowerCase()}`, `مستوى ${doc.level}`);
  appendTextElement(titleRow, 'div', '', '').replaceWith(badgesWrap);
  card.appendChild(titleRow);

  appendTextElement(card, 'p', 'document-summary', doc.ar_desc);

  // Training note
  const note = document.createElement('div');
  note.className = 'reading-training-note';
  appendTextElement(note, 'span', '', 'ℹ️');
  appendTextElement(note, 'span', '', 'نموذج تطبيقي يحاكي وثائق الأوراش المغربية (Casablanca/Rabat). الأرقام والأسماء تعليمية وتدريبية.');
  card.appendChild(note);

  // Stats Row
  const wordCount = doc.doc_content.trim().split(/\s+/).length;
  const stats = document.createElement('div');
  stats.className = 'reading-stats-row';
  stats.append(
    makeReadingStat(doc.level, 'المستوى'),
    makeReadingStat(String(wordCount), 'كلمة تقريباً'),
    makeReadingStat(`${Math.max(1, Math.ceil(wordCount / 160))} min`, 'زمن القراءة'),
    makeReadingStat(String(doc.questions.length), 'أسئلة فهم')
  );
  card.appendChild(stats);

  // In-Document Segmented Tab Bar
  const innerNav = document.createElement('div');
  innerNav.className = 'doc-inner-nav';
  innerNav.innerHTML = `
    <button type="button" class="doc-inner-tab-btn ${activeDocInnerTab === 'content' ? 'active' : ''}" id="doc-tab-btn-content" onclick="switchDocInnerTab('content', this)">
      <span>📄 نص الوثيقة</span>
    </button>
    <button type="button" class="doc-inner-tab-btn ${activeDocInnerTab === 'vocab' ? 'active' : ''}" id="doc-tab-btn-vocab" onclick="switchDocInnerTab('vocab', this)">
      <span>💡 المفردات (${doc.vocab_hints.length})</span>
    </button>
    <button type="button" class="doc-inner-tab-btn ${activeDocInnerTab === 'questions' ? 'active' : ''}" id="doc-tab-btn-questions" onclick="switchDocInnerTab('questions', this)">
      <span>❓ أسئلة الفهم (${doc.questions.length})</span>
    </button>
    <button type="button" class="doc-inner-tab-btn ${activeDocInnerTab === 'guide' ? 'active' : ''}" id="doc-tab-btn-guide" onclick="switchDocInnerTab('guide', this)">
      <span>📐 دليل التحليل</span>
    </button>
  `;
  card.appendChild(innerNav);

  // PANE 1: Document Content
  const paneContent = document.createElement('div');
  paneContent.id = 'doc-pane-content';
  paneContent.className = `doc-inner-pane ${activeDocInnerTab === 'content' ? 'active' : 'hidden'}`;

  const toolbar = document.createElement('div');
  toolbar.className = 'reading-toolbar';
  appendTextElement(toolbar, 'strong', '', '📄 نص المستند الرسمي / Document Officiel');
  const toolbarActions = document.createElement('div');
  toolbarActions.className = 'reading-toolbar-actions';

  const listenBtn = appendTextElement(toolbarActions, 'button', 'btn-secondary', '🔊 استمع للنص');
  listenBtn.type = 'button';
  listenBtn.setAttribute('aria-label', 'الاستماع لنص المستند بالكامل');
  listenBtn.addEventListener('click', () => speakFrenchText(doc.doc_content, listenBtn));

  const smallerBtn = appendTextElement(toolbarActions, 'button', 'btn-secondary', 'A−');
  smallerBtn.type = 'button';
  smallerBtn.setAttribute('aria-label', 'تصغير خط المستند');
  smallerBtn.addEventListener('click', () => adjustReadingFont(-0.1));

  const largerBtn = appendTextElement(toolbarActions, 'button', 'btn-secondary', 'A+');
  largerBtn.type = 'button';
  largerBtn.setAttribute('aria-label', 'تكبير خط المستند');
  largerBtn.addEventListener('click', () => adjustReadingFont(0.1));

  const copyBtn = appendTextElement(toolbarActions, 'button', 'btn-secondary', '📋 نسخ');
  copyBtn.type = 'button';
  copyBtn.setAttribute('aria-label', 'نسخ نص المستند إلى الحافظة');
  copyBtn.addEventListener('click', () => copyReadingDocument(doc));

  toolbar.appendChild(toolbarActions);
  paneContent.appendChild(toolbar);

  const documentText = appendTextElement(card, 'pre', 'doc-viewer-card', doc.doc_content);
  paneContent.appendChild(documentText);
  documentText.id = 'reading-doc-text';
  documentText.lang = 'fr';
  documentText.dir = 'ltr';
  documentText.style.fontSize = `${13 * (state.readingFontScale || 1)}px`;
  card.appendChild(paneContent);

  // PANE 2: Vocab Hints
  const paneVocab = document.createElement('div');
  paneVocab.id = 'doc-pane-vocab';
  paneVocab.className = `doc-inner-pane ${activeDocInnerTab === 'vocab' ? 'active' : 'hidden'}`;
  appendTextElement(paneVocab, 'h4', 'content-section-title', '💡 مصطلحات وكلمات مفتاحية للورشة / Vocabulaire Clé');
  
  const hints = document.createElement('div');
  hints.className = 'hints-flex';
  doc.vocab_hints.forEach(hint => {
    const hintButton = document.createElement('button');
    hintButton.type = 'button';
    hintButton.className = 'hint-chip';
    hintButton.setAttribute('aria-label', `استمع إلى ${hint.fr}: ${hint.ar}`);
    const fr = appendTextElement(hintButton, 'b', '', hint.fr);
    fr.lang = 'fr';
    fr.dir = 'ltr';
    appendTextElement(hintButton, 'span', 'hint-ar', `${hint.ar} 🔊`);
    hintButton.addEventListener('click', () => speakFrenchText(hint.fr, hintButton));
    hints.appendChild(hintButton);
  });
  paneVocab.appendChild(hints);
  card.appendChild(paneVocab);

  // PANE 3: Questions & Comprehension
  const paneQuestions = document.createElement('div');
  paneQuestions.id = 'doc-pane-questions';
  paneQuestions.className = `doc-inner-pane ${activeDocInnerTab === 'questions' ? 'active' : 'hidden'}`;
  appendTextElement(paneQuestions, 'h4', 'content-section-title', '❓ أسئلة الفهم والتقييم الذاتي / Questions');

  const progressWrap = document.createElement('div');
  progressWrap.className = 'reading-progress-wrap';
  const progressLabel = document.createElement('div');
  progressLabel.className = 'reading-progress-label';
  progressLabel.innerHTML = `<span>تقدم تقييم هذا المستند:</span><span id="reading-doc-progress-text"></span>`;
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar-container';
  progressBar.id = 'reading-doc-progress';
  progressBar.setAttribute('role', 'progressbar');
  progressBar.setAttribute('aria-label', 'تقدم أسئلة فهم المستند');
  progressBar.setAttribute('aria-valuemin', '0');
  progressBar.setAttribute('aria-valuemax', '100');
  const progressFill = document.createElement('div');
  progressFill.className = 'progress-bar-fill';
  progressFill.id = 'reading-doc-progress-fill';
  progressBar.appendChild(progressFill);
  progressWrap.append(progressLabel, progressBar);
  paneQuestions.appendChild(progressWrap);

  const qaContainer = document.createElement('div');
  qaContainer.className = 'q-and-a-box';
  doc.questions.forEach((question, index) => qaContainer.appendChild(buildReadingQuestion(doc, question, index)));
  paneQuestions.appendChild(qaContainer);

  const resetBtn = appendTextElement(paneQuestions, 'button', 'btn-secondary', '🔄 إعادة تعيين تقييمات هذا المستند');
  resetBtn.type = 'button';
  resetBtn.style.marginTop = '16px';
  resetBtn.addEventListener('click', () => resetReadingDocumentProgress(doc.id));
  card.appendChild(paneQuestions);

  // PANE 4: 5-Step BTP Analysis Guide
  const paneGuide = document.createElement('div');
  paneGuide.id = 'doc-pane-guide';
  paneGuide.className = `doc-inner-pane ${activeDocInnerTab === 'guide' ? 'active' : 'hidden'}`;
  appendTextElement(paneGuide, 'h4', 'content-section-title', '📐 منهجية قراءة وتحليل وثيقة الورش في المغرب');

  const guide = document.createElement('div');
  guide.className = 'reading-analysis-guide';
  [
    ['1', 'نوع الوثيقة والغرض منها', 'تحديد طبيعة المستند: هل هو وصل تسليم (BL)، محضر (PV)، كشف حساب (Décompte)، أو أمر خدمة (OS).'],
    ['2', 'الأطراف والمسؤوليات', 'معرفة صاحب المشروع (MOA)، المهندس المعماري، المقاولة، مكتب الدراسات (BET)، ورئيس الورش.'],
    ['3', 'التواريخ والآجال والطقس', 'تاريخ التحرير، موعد التسليم، تاريخ بداية سريان الآجال، وتوثيق أيام توقف العمل بسبب الأمطار.'],
    ['4', 'الكميات والمبالغ والأسعار', 'مراجعة الكميات المنجزة أو المسلمة، الأثمان الأحادية (P.U. HT)، الضريبة (TVA 20%)، واقتطاع الضمان.'],
    ['5', 'القرارات والإجراءات الفورية', 'التحفظات المدونة، التعليمات العاجلة، موعد الاجتماع القادم، أو توجيه إنذار للمورد.']
  ].forEach(([number, titleStep, descStep]) => {
    const step = document.createElement('div');
    step.className = 'reading-analysis-step-card';
    step.innerHTML = `
      <div class="step-badge">${number}</div>
      <div class="step-content">
        <strong>${titleStep}</strong>
        <p>${descStep}</p>
      </div>
    `;
    guide.appendChild(step);
  });
  paneGuide.appendChild(guide);
  card.appendChild(paneGuide);

  activeView.replaceChildren(card);
  updateReadingDocumentProgress(doc.id);
}

function buildReadingQuestion(doc, question, index) {
  const assessment = getReadingAssessment(doc.id, index);
  const item = document.createElement('div');
  item.className = `qa-item${assessment === 'good' ? ' is-good' : assessment === 'review' ? ' needs-review' : ''}`;
  item.id = `qa-item-${doc.id}-${index}`;

  const questionRow = document.createElement('div');
  questionRow.className = 'qa-question';
  const questionText = appendTextElement(questionRow, 'span', '', `Q${index + 1}: ${question.q}`);
  questionText.lang = 'fr';
  questionText.dir = 'ltr';
  const status = appendTextElement(questionRow, 'span', 'reading-question-status', assessment === 'good' ? '✓ متقن' : assessment === 'review' ? '↻ للمراجعة' : 'غير مقيّم');
  status.id = `qa-status-${doc.id}-${index}`;
  item.appendChild(questionRow);

  const responseId = `reading-response-${doc.id}-${index}`;
  const label = appendTextElement(item, 'label', 'reading-response-label', 'اكتب إجابتك أولاً بالفرنسية، ثم قارنها بالنموذج:');
  label.htmlFor = responseId;
  const response = document.createElement('textarea');
  response.id = responseId;
  response.className = 'input-field reading-response';
  response.lang = 'fr';
  response.dir = 'ltr';
  response.placeholder = 'Votre réponse en français…';
  item.appendChild(response);

  const revealBtn = appendTextElement(item, 'button', 'btn-secondary', 'أظهر الجواب النموذجي / Voir la réponse');
  revealBtn.type = 'button';
  revealBtn.style.marginTop = '8px';
  revealBtn.setAttribute('aria-expanded', 'false');
  revealBtn.setAttribute('aria-controls', `qa-ans-${doc.id}-${index}`);
  revealBtn.addEventListener('click', () => toggleAnswerReveal(doc.id, index, revealBtn));
  item.appendChild(revealBtn);

  const answerBox = document.createElement('div');
  answerBox.className = 'qa-answer-box';
  answerBox.id = `qa-ans-${doc.id}-${index}`;
  answerBox.setAttribute('aria-hidden', 'true');
  const answerText = appendTextElement(answerBox, 'span', 'qa-answer-text', `Réponse modèle : ${question.a}`);
  answerText.lang = 'fr';
  answerText.dir = 'ltr';

  const selfAssess = document.createElement('div');
  selfAssess.className = 'reading-self-assess hidden';
  selfAssess.id = `qa-assess-${doc.id}-${index}`;
  const goodBtn = appendTextElement(selfAssess, 'button', 'btn-secondary', '✓ إجابتي صحيحة');
  goodBtn.type = 'button';
  goodBtn.setAttribute('aria-pressed', String(assessment === 'good'));
  goodBtn.addEventListener('click', () => assessReadingAnswer(doc.id, index, 'good'));
  const reviewBtn = appendTextElement(selfAssess, 'button', 'btn-secondary', '↻ أحتاج مراجعة');
  reviewBtn.type = 'button';
  reviewBtn.setAttribute('aria-pressed', String(assessment === 'review'));
  reviewBtn.addEventListener('click', () => assessReadingAnswer(doc.id, index, 'review'));
  answerBox.appendChild(selfAssess);
  item.appendChild(answerBox);
  return item;
}

export function toggleAnswerReveal(docId, idx, btnEl) {
  const ansBox = document.getElementById(`qa-ans-${docId}-${idx}`);
  const assessBox = document.getElementById(`qa-assess-${docId}-${idx}`);
  if (!ansBox) return;
  const willReveal = !ansBox.classList.contains('revealed');
  ansBox.classList.toggle('revealed', willReveal);
  ansBox.setAttribute('aria-hidden', String(!willReveal));
  btnEl.setAttribute('aria-expanded', String(willReveal));
  btnEl.innerText = willReveal ? 'أخفِ الجواب / Cacher' : 'أظهر الجواب النموذجي / Voir la réponse';
  assessBox?.classList.toggle('hidden', !willReveal);
}

export function assessReadingAnswer(docId, index, assessment) {
  const doc = READING_DOCS.find(item => item.id === docId);
  if (!doc || !['good', 'review'].includes(assessment)) return;
  const progress = getReadingProgress(docId);
  progress.good = progress.good.filter(item => item !== index);
  progress.review = progress.review.filter(item => item !== index);
  progress[assessment].push(index);
  const assessed = new Set([...progress.good, ...progress.review]).size;
  progress.completedAt = assessed >= doc.questions.length ? new Date().toISOString() : null;
  state.readingProgress[docId] = progress;
  saveStateToLocalStorage();
  updateReadingDocumentProgress(docId);
  renderReadingDocsSelector();
}

export function updateReadingDocumentProgress(docId) {
  const doc = READING_DOCS.find(item => item.id === docId);
  if (!doc) return;
  const progress = getReadingProgress(docId);
  const assessed = new Set([...progress.good, ...progress.review]).size;
  const pct = Math.round((assessed / doc.questions.length) * 100);
  const text = document.getElementById('reading-doc-progress-text');
  const bar = document.getElementById('reading-doc-progress');
  const fill = document.getElementById('reading-doc-progress-fill');
  if (text) text.innerText = `${assessed}/${doc.questions.length} · ${pct}%`;
  if (bar) bar.setAttribute('aria-valuenow', String(pct));
  if (fill) fill.style.width = `${pct}%`;

  doc.questions.forEach((question, index) => {
    const assessment = getReadingAssessment(docId, index);
    const item = document.getElementById(`qa-item-${docId}-${index}`);
    item?.classList.toggle('is-good', assessment === 'good');
    item?.classList.toggle('needs-review', assessment === 'review');
    const status = document.getElementById(`qa-status-${docId}-${index}`);
    if (status) status.innerText = assessment === 'good' ? '✓ متقن' : assessment === 'review' ? '↻ للمراجعة' : 'غير مقيّم';
    const buttons = document.querySelectorAll(`#qa-assess-${docId}-${index} button`);
    if (buttons[0]) buttons[0].setAttribute('aria-pressed', String(assessment === 'good'));
    if (buttons[1]) buttons[1].setAttribute('aria-pressed', String(assessment === 'review'));
  });
  updateReadingOverallProgress();
}

export function adjustReadingFont(delta) {
  state.readingFontScale = Math.min(1.4, Math.max(0.8, (state.readingFontScale || 1) + delta));
  const viewer = document.getElementById('reading-doc-text');
  if (viewer) viewer.style.fontSize = `${13 * state.readingFontScale}px`;
}

export function copyReadingDocument(doc) {
  navigator.clipboard.writeText(doc.doc_content)
    .then(() => showToast('تم نسخ نص المستند.'))
    .catch(() => showToast('تعذر نسخ المستند في هذا المتصفح.'));
}

export function resetReadingDocumentProgress(docId) {
  if (!confirm('هل تريد مسح تقييمات أسئلة هذا المستند؟')) return;
  delete state.readingProgress[docId];
  saveStateToLocalStorage();
  renderReadingDoc(docId);
  showToast('تمت إعادة تعيين تقدم المستند.');
}

// ════════════════════════════════════════════════════════════════════════════
// 6. SPEED DATA EXTRACTION QUIZ (SUB-VIEW 2)
// ════════════════════════════════════════════════════════════════════════════
const READING_QUIZ_QUESTIONS = [
  {
    docRef: "Bon de Livraison (BL-2026-0412)",
    q: "في وصل تسليم إسمنت وحديد التسليح، كم بلغ المبلغ الإجمالي شامل الضريبة (Total TTC)؟",
    options: ["16 660,00 DH", "19 992,00 DH", "3 332,00 DH", "24 500,00 DH"],
    answer: 1,
    hint: "Total HT (16 660,00) + TVA 20% (3 332,00) = 19 992,00 DH."
  },
  {
    docRef: "PV de Réunion N°12",
    q: "ما هو القرار المتخذ بخصوص الشقوق الشعرية في واجهة الجنوب (Façade Sud)؟",
    options: ["هدم الحائط بالكامل", "إعادة تطبيق الطلاء وإصلاحه تحت طائلة FNC خلال 7 أيام", "تجاهل الشقوق لأنها سطحية", "تأجيل الإصلاح حتى نهاية المشروع"],
    answer: 1,
    hint: "FNC N°08 émise — Reprise obligatoire par l'entreprise sous délai de 7 jours."
  },
  {
    docRef: "Rapport Journalier N°067",
    q: "كم كان عدد العمال الإجمالي الحاضرين في الورش (Effectif total) يوم 09/03/2026؟",
    options: ["15 عاملاً", "22 عاملاً", "30 عاملاً", "18 عاملاً"],
    answer: 1,
    hint: "3 ferrailleurs + 2 coffreurs + 5 maçons + 2 carreleurs + 1 plombier + 1 électricien + 8 manœuvres = 22."
  },
  {
    docRef: "Décompte Mensuel N°3",
    q: "كم تبلغ نسبة اقتطاع الضمان (Retenue de garantie) المطبقة في الصفقات بالمغرب؟",
    options: ["5%", "10%", "20%", "2.5%"],
    answer: 1,
    hint: "اقتطاع الضمان القياسي في دفاتر الشروط بالمغرب هو 10% حتى الاستلام النهائي (Réception définitive)."
  },
  {
    docRef: "Facture FA-2026-088",
    q: "ما هو الأجل المحدد لأداء الفاتورة عن طريق التحويل البنكي (Délai de paiement)؟",
    options: ["15 يوماً", "30 يوماً", "45 يوماً", "60 يوماً"],
    answer: 2,
    hint: "Conditions de paiement : 45 jours — par virement bancaire."
  },
  {
    docRef: "Consignes de Sécurité",
    q: "ابتداءً من أي علو يعتبر ارتداء حزام الأمان (Harnais) إلزامياً في الورش؟",
    options: ["> 1 متر", "> 2 أمتار", "> 3 أمتار", "> 5 أمتار"],
    answer: 2,
    hint: "Ne jamais travailler en hauteur sans harnais (> 3 m)."
  },
  {
    docRef: "Ordre de Service N°01",
    q: "ما هي نسبة الضمانة النهائية (Cautionnement définitif) الواجب تكوينها بعد استلام أمر الخدمة؟",
    options: ["1.5%", "3%", "5%", "10%"],
    answer: 1,
    hint: "Cautionnement définitif fixé à 3% du montant initial du marché."
  },
  {
    docRef: "Fiche Technique Ciment CPJ 45",
    q: "ما هي المقاومة الدنيا للضغط بعد 28 يوماً لإسمنت CPJ 45 حسب المواصفة المغربية NM 10.1.004؟",
    options: ["≥ 25 MPa", "≥ 35 MPa", "≥ 45 MPa", "≥ 55 MPa"],
    answer: 2,
    hint: "Résistance à la compression à 28 jours : ≥ 45 MPa."
  }
];

let readingQuizIndex = 0;
let readingQuizScore = 0;
let readingQuizStreak = 0;
let readingQuizAnswered = false;

export function initReadingQuiz() {
  readingQuizIndex = 0;
  readingQuizScore = 0;
  readingQuizStreak = 0;
  readingQuizAnswered = false;
  renderReadingQuizCard();
}

function renderReadingQuizCard() {
  const container = document.getElementById('reading-quiz-card-box');
  if (!container) return;

  if (readingQuizIndex >= READING_QUIZ_QUESTIONS.length) {
    container.innerHTML = `
      <div class="num-game-result" style="display:block;">
        <h4>🏆 أحسنت! أكملت تحدي استخراج بيانات الوثائق</h4>
        <p>النتيجة النهائية: <strong>${readingQuizScore} / ${READING_QUIZ_QUESTIONS.length}</strong> إجابة صحيحة</p>
        <div class="num-game-footer" style="margin-top:16px;">
          <button type="button" class="btn-primary" onclick="initReadingQuiz()">🔄 إعادة التحدي من جديد</button>
        </div>
      </div>
    `;
    return;
  }

  const q = READING_QUIZ_QUESTIONS[readingQuizIndex];
  readingQuizAnswered = false;

  container.innerHTML = `
    <div class="quiz-question-box" style="padding:20px; border-radius:var(--radius-lg);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span class="vocab-badge" style="font-size:12px;">📄 المستند: ${q.docRef}</span>
        <span style="font-size:13px; font-weight:800; color:var(--gold);">السؤال ${readingQuizIndex + 1} / ${READING_QUIZ_QUESTIONS.length}</span>
      </div>
      <div class="quiz-q-text" style="font-size:16px; margin-bottom:16px; text-align:right;">${q.q}</div>
      <div class="quiz-options" id="reading-quiz-options">
        ${q.options.map((opt, i) => `
          <button type="button" class="quiz-option-btn" onclick="checkReadingQuizOption(${i}, this)">
            <span class="opt-letter">${['A', 'B', 'C', 'D'][i]}</span>
            <span class="opt-text">${opt}</span>
          </button>
        `).join('')}
      </div>
      <div id="reading-quiz-feedback" class="quiz-feedback hidden" style="margin-top:14px;"></div>
      <div class="num-game-footer" style="margin-top:16px;">
        <button type="button" class="btn-secondary" onclick="initReadingQuiz()">⏹ إنهاء</button>
        <button type="button" class="btn-primary hidden" id="reading-quiz-next" onclick="nextReadingQuizQuestion()">التالي / Suivant</button>
      </div>
    </div>
  `;
}

export function checkReadingQuizOption(index, btnEl) {
  if (readingQuizAnswered) return;
  readingQuizAnswered = true;

  const q = READING_QUIZ_QUESTIONS[readingQuizIndex];
  const allBtns = document.querySelectorAll('#reading-quiz-options .quiz-option-btn');
  const feedback = document.getElementById('reading-quiz-feedback');
  const nextBtn = document.getElementById('reading-quiz-next');

  allBtns.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === q.answer) {
      btn.classList.add('correct');
    } else if (idx === index && index !== q.answer) {
      btn.classList.add('wrong');
    }
  });

  const isCorrect = (index === q.answer);
  if (isCorrect) {
    readingQuizScore++;
    readingQuizStreak++;
    feedback.className = 'quiz-feedback feedback-correct';
    feedback.innerHTML = `✅ <strong>إجابة صحيحة ومطابقة!</strong><br><small>${q.hint}</small>`;
  } else {
    readingQuizStreak = 0;
    feedback.className = 'quiz-feedback feedback-wrong';
    feedback.innerHTML = `❌ <strong>إجابة غير دقيقة.</strong> الإجابة الصحيحة هي: «${q.options[q.answer]}»<br><small>💡 ${q.hint}</small>`;
  }
  feedback.classList.remove('hidden');
  if (nextBtn) nextBtn.classList.remove('hidden');
}

export function nextReadingQuizQuestion() {
  readingQuizIndex++;
  renderReadingQuizCard();
}

// ════════════════════════════════════════════════════════════════════════════
// 7. BTP MOROCCAN DOCUMENTS GUIDE (SUB-VIEW 3)
// ════════════════════════════════════════════════════════════════════════════
export function renderBtpDocsGuide() {
  const container = document.getElementById('reading-guide-grid-box');
  if (!container) return;

  const guides = [
    {
      icon: "📦",
      title: "وصل التسليم (Bon de Livraison - BL)",
      law: "مدونة التجارة والمسؤولية التقصيرية",
      role: "إثبات انتقال حيازة السلع والمواد من المورد إلى الورش.",
      checklist: [
        "التحقق من سلامة الأكياس وأختام الجودة قبل مغادرة السائق.",
        "تدوين أي كسر أو نقص بالحرف في خانة (Observations / Réserves).",
        "توقيع وخاتم مسؤول الورش وتاريخ ووقت الاستلام بالساعة."
      ],
      danger: "التوقيع بدون تدوين التحفظات يعني قبول السلع بحالتها وتحمل المقاولة مسؤولية العيوب الظاهرة."
    },
    {
      icon: "📝",
      title: "محضر الورش (Procès-Verbal de Réunion - PV)",
      law: "دفتر الشروط الإدارية العامة (CCAG-T Maroc)",
      role: "توثيق رسمي أسبوعي لقرارات صاحب المشروع، المهندس، ومكتب الدراسات.",
      checklist: [
        "إثبات نسب تقدم الأشغال بالأمتار المكعبة والنسب المئوية.",
        "توثيق أيام التوقف بسبب سوء الأحوال الجوية لحماية المقاولة من غرامات التأخير.",
        "تحديد أجل واضح لكل تحفظ أو إصلاح وتعيين المسؤول عنه."
      ],
      danger: "عدم الاعتراض كتابة على ملاحظات الـ PV خلال 48 ساعة يعتبر موافقة ضمنية على ما ورد فيه."
    },
    {
      icon: "💰",
      title: "كشف الحساب الشهري (Décompte Mensuel)",
      law: "المحاسبة الميدانية للصفقات العمومية والخاصة",
      role: "صرف المستحقات المالية للمقاولة حسب القياس الفعلي المنجز على الأرض.",
      checklist: [
        "مطابقة القياسات مع جدول الأثمان الأحادية (Bordereau des Prix).",
        "تطبيق نسبة الضريبة على القيمة المضافة 20% (TVA).",
        "حساب اقتطاع الضمان 10% (Retenue de garantie) بدقة."
      ],
      danger: "تضخيم الكميات قبل التحقق قد يؤدي إلى رفض الكشف بالكامل وتأخر صرف السيولة لأشهر."
    },
    {
      icon: "🏛️",
      title: "أمر بداية الأشغال (Ordre de Service - OS)",
      law: "مرسوم الصفقات العمومية بالمغرب",
      role: "القرار القانوني الذي يحدد نقطة الصفر للأجل التعاقدي للمشروع.",
      checklist: [
        "التأكد من خلو الورش من العوائق المادية قبل توقيع استلام الـ OS.",
        "إيداع الكفالة والضمانة النهائية (Cautionnement 3%) داخل الأجل المحدد (20 يوماً).",
        "إرسال مخطط الجودة (PAQ) وبرنامج التنفيذ (Planning) في ظرف 15 يوماً."
      ],
      danger: "توقيع الـ OS والورش غير جاهز مادياً يجعل عداد غرامات التأخير ينطلق ضد المقاولة."
    }
  ];

  container.innerHTML = guides.map(g => `
    <div class="doc-guide-card">
      <div class="doc-guide-head">
        <span class="doc-guide-icon">${g.icon}</span>
        <div>
          <h4>${g.title}</h4>
          <span class="doc-guide-law">⚖️ المرجعية: ${g.law}</span>
        </div>
      </div>
      <p class="doc-guide-role">🎯 <strong>الهدف:</strong> ${g.role}</p>
      <div class="doc-guide-checklist">
        <strong>✅ قائمة التحقق الإلزامية لرئيس الأشغال:</strong>
        <ul>
          ${g.checklist.map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>
      <div class="doc-guide-danger">
        <strong>⚠️ تحذير مهني:</strong> ${g.danger}
      </div>
    </div>
  `).join('');
}

// ════════════════════════════════════════════════════════════════════════════
// 8. GLOBAL EXPORTS
// ════════════════════════════════════════════════════════════════════════════
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
  window.switchReadingSubTab = switchReadingSubTab;
  window.switchDocInnerTab = switchDocInnerTab;
  window.filterReadingDocsByCategory = filterReadingDocsByCategory;
  window.initReadingQuiz = initReadingQuiz;
  window.checkReadingQuizOption = checkReadingQuizOption;
  window.nextReadingQuizQuestion = nextReadingQuizQuestion;
  window.renderBtpDocsGuide = renderBtpDocsGuide;
}

