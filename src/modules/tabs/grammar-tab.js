import { GRAMMAR_LESSONS } from '../../data/grammar-lessons.js';
import { normalizeSearchText } from '../state.js';
import { speakFrenchText } from '../audio.js';
import { showToast } from '../ui-utils.js';

let currentGrammarCategory = 'all';
let currentGrammarSearch = '';
let selectedVerbIndex = 0;

// ════════════════════════════════════════════════════════════════════════════
// 1. SUB-TABS NAVIGATION (TOP LEVEL TAB 6)
// ════════════════════════════════════════════════════════════════════════════
export function switchGrammarSubTab(viewId, btnEl) {
  const allBtns = document.querySelectorAll('.grammar-subtab-btn');
  const allViews = document.querySelectorAll('.grammar-subview');

  allBtns.forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  allViews.forEach(v => {
    v.classList.add('hidden');
    v.classList.remove('active');
  });

  const targetView = document.getElementById(`grammar-view-${viewId}`);
  const targetBtn = btnEl || document.getElementById(`subtab-btn-grammar-${viewId}`);

  if (targetBtn) {
    targetBtn.classList.add('active');
    targetBtn.setAttribute('aria-selected', 'true');
  }
  if (targetView) {
    targetView.classList.remove('hidden');
    targetView.classList.add('active');
  }

  if (viewId === 'quiz') {
    initGrammarQuiz();
  } else if (viewId === 'tables') {
    renderGrammarVerbsTable();
  }
}

// ════════════════════════════════════════════════════════════════════════════
// 2. LESSONS ACCORDION VIEWER (SUB-VIEW 1)
// ════════════════════════════════════════════════════════════════════════════
export function renderGrammarAccordions() {
  const container = document.getElementById('grammar-lessons-accordion');
  if (!container) return;

  const searchNorm = normalizeSearchText(currentGrammarSearch.trim());
  const filtered = GRAMMAR_LESSONS.filter(lesson => {
    const matchCat = currentGrammarCategory === 'all' || lesson.category === currentGrammarCategory;
    if (!matchCat) return false;
    if (!searchNorm) return true;
    
    const titleNorm = normalizeSearchText(lesson.title || '');
    const descNorm = normalizeSearchText(lesson.ar_desc || '');
    const contentNorm = normalizeSearchText(lesson.content || '');
    return titleNorm.includes(searchNorm) || descNorm.includes(searchNorm) || contentNorm.includes(searchNorm);
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align:center; padding:32px 20px; color:var(--text-muted);">
        <p style="font-size:16px; font-weight:700; margin-bottom:6px;">لم يتم العثور على دروس مطابقة للبحث</p>
        <p style="font-size:13px;">جرب البحث بكلمة أخرى أو اختر «جميع الدروس» أعلاه.</p>
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach((lesson) => {
    const realIdx = GRAMMAR_LESSONS.indexOf(lesson);
    html += `
      <div class="accordion-item" id="accordion-idx-${realIdx}">
        <button type="button" class="accordion-header" aria-expanded="false" aria-controls="accordion-content-${realIdx}" onclick="toggleAccordion(${realIdx})">
          <div class="accordion-header-title">
            <span class="grammar-badge-pill">${lesson.badge || 'درس مهني 📚'}</span>
            <span class="grammar-title-text">${lesson.title}</span>
          </div>
          <span class="accordion-arrow" aria-hidden="true">▼</span>
        </button>
        <div class="accordion-content" id="accordion-content-${realIdx}">
          <p class="grammar-desc-text">${lesson.ar_desc}</p>
          ${lesson.content}
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

export function toggleAccordion(idx) {
  const item = document.getElementById(`accordion-idx-${idx}`);
  const content = document.getElementById(`accordion-content-${idx}`);
  if (!item || !content) return;
  
  if (item.classList.contains('active-item')) {
    item.classList.remove('active-item');
    content.style.maxHeight = '0px';
    const btn = item.querySelector('.accordion-header');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  } else {
    document.querySelectorAll('.accordion-item').forEach(el => el.classList.remove('active-item'));
    document.querySelectorAll('.accordion-content').forEach(el => el.style.maxHeight = '0px');
    document.querySelectorAll('.accordion-header').forEach(el => el.setAttribute('aria-expanded', 'false'));
    
    item.classList.add('active-item');
    const btn = item.querySelector('.accordion-header');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    // Using scrollHeight instead of 5000px ensures a perfectly paced CSS transition
    content.style.maxHeight = content.scrollHeight + 'px';
    if (typeof playHaptic !== 'undefined') playHaptic(10);
  }
}

export function filterGrammarByCategory(category, btnEl) {
  currentGrammarCategory = category;
  if (btnEl) {
    const bar = btnEl.closest('.lvl-filters');
    if (bar) {
      bar.querySelectorAll('.lvl-btn').forEach(btn => btn.classList.remove('active'));
      btnEl.classList.add('active');
    }
  }
  renderGrammarAccordions();
}

export function handleGrammarSearch() {
  const input = document.getElementById('grammar-search-input');
  if (!input) return;
  currentGrammarSearch = input.value || '';
  renderGrammarAccordions();
}

// ════════════════════════════════════════════════════════════════════════════
// 3. GRAMMAR PRACTICE QUIZ (SUB-VIEW 2)
// ════════════════════════════════════════════════════════════════════════════
const GRAMMAR_QUIZ_QUESTIONS = [
  {
    topic: "صيغة الأمر المباشر (L'Impératif)",
    q: "كيف تأمر فريق العمال بصب خرسانة الأعمدة الآن بصيغة الجمع المهذبة (Vous)؟",
    options: [
      "Coulons les poteaux !",
      "Coulez le béton des poteaux immédiatement !",
      "Vous coulez les poteaux.",
      "Il faut couler les poteaux."
    ],
    answer: 1,
    rule: "مع الضمير (Vous) نصرف الفعل في الأمر بحذف الضمير واستعمال النهاية -ez: Coulez !"
  },
  {
    topic: "الماضي الميداني (Passé Composé)",
    q: "في التقرير اليومي، ما هي الصياغة الصحيحة لكتابة: «أنهينا تسليح الحائط الخرساني»؟",
    options: [
      "Nous finissons le ferraillage du voile.",
      "Nous avons terminé le ferraillage du voile.",
      "Nous sommes terminé le ferraillage du voile.",
      "Nous terminerons le ferraillage du voile."
    ],
    answer: 1,
    rule: "فعل terminer يُصرف مع المساعد Avoir: Nous avons terminé."
  },
  {
    topic: "اللباقة في المراسلات (Le Conditionnel)",
    q: "كيف تطلب من المهندس مصادقة المخططات بلباقة واحترام في بريد إلكتروني رسمي؟",
    options: [
      "Validez les plans tout de suite.",
      "Nous vous saurions gré de bien vouloir valider les plans d'exécution.",
      "Tu dois valider les plans.",
      "Nous voulons la validation des plans."
    ],
    answer: 1,
    rule: "صيغة «Nous vous saurions gré de bien vouloir...» هي أرقى وأنسب صياغة شرطية للتعامل مع المكاتب والزبائن."
  },
  {
    topic: "التخطيط والآجال (Le Futur Simple)",
    q: "كيف تخبر صاحب المشروع بأن المقاولة ستسلم الأشغال في 30 أبريل؟",
    options: [
      "L'entreprise a livré les travaux le 30 avril.",
      "L'entreprise livrera les travaux le 30 avril prochain.",
      "L'entreprise livre les travaux le 30 avril.",
      "L'entreprise livrait les travaux le 30 avril."
    ],
    answer: 1,
    rule: "المستقبل البسيط للغائب المفرد (Il/Elle/L'entreprise) ينتهي بـ -a: livrera."
  },
  {
    topic: "أفعال الإلزام والسلامة (Devoir & Falloir)",
    q: "ما هي الصياغة القانونية لإلزامية ارتداء خوذة الورش لجميع العمال؟",
    options: [
      "Tout le monde peut porter le casque.",
      "Le port du casque est obligatoire / Chaque ouvrier doit porter son casque.",
      "Si vous voulez, portez le casque.",
      "Le casque sera porté parfois."
    ],
    answer: 1,
    rule: "نستعمل «doit + infinitif» أو «Il faut + infinitif» للتعبير عن الإلزام القانوني الصارم في السلامة."
  },
  {
    topic: "حروف الجر الميدانية (Prépositions BTP)",
    q: "ما هو حرف الجر المناسب: «Béton dosé _____ 350 kg/m³»؟",
    options: ["en", "à", "de", "pour"],
    answer: 1,
    rule: "في مصطلحات البناء نقول دائماً: «dosé à 350 kg/m³» بحرف الجر (à)."
  },
  {
    topic: "التعبير عن السبب والتبرير (Justification)",
    q: "لتبرير التأخير في المحضر بسبب الأمطار الغزيرة، نكتب:",
    options: [
      "Arrêt des travaux en raison des fortes pluies.",
      "Arrêt des travaux pour que les pluies.",
      "Arrêt des travaux bien que les pluies.",
      "Arrêt des travaux malgré les pluies."
    ],
    answer: 0,
    rule: "نستعمل «en raison de + nom» لتبرير الأسباب القاهرة والمناخية في محاضر الصفقات."
  },
  {
    topic: "صيغة المبني للمجهول (La Voix Passive)",
    q: "كيف تحول: «Le BET a validé le ferraillage» إلى صيغة المبني للمجهول في المحضر؟",
    options: [
      "Le ferraillage est validé par le BET.",
      "Le ferraillage a été validé par le BET.",
      "Le ferraillage sera validé par le BET.",
      "Le ferraillage avait validé le BET."
    ],
    answer: 1,
    rule: "الماضي المركب في المبني للمجهول: a été + participe passé (a été validé)."
  }
];

let grammarQuizIndex = 0;
let grammarQuizScore = 0;
let grammarQuizAnswered = false;

export function initGrammarQuiz() {
  grammarQuizIndex = 0;
  grammarQuizScore = 0;
  grammarQuizAnswered = false;
  renderGrammarQuizCard();
}

function renderGrammarQuizCard() {
  const container = document.getElementById('grammar-quiz-card-box');
  if (!container) return;

  if (grammarQuizIndex >= GRAMMAR_QUIZ_QUESTIONS.length) {
    container.innerHTML = `
      <div class="num-game-result" style="display:block;">
        <h4>🏆 أحسنت! أكملت تمرين القواعد الميدانية</h4>
        <p>النتيجة: <strong>${grammarQuizScore} / ${GRAMMAR_QUIZ_QUESTIONS.length}</strong> إجابة صحيحة</p>
        <div class="num-game-footer" style="margin-top:16px;">
          <button type="button" class="btn-primary" onclick="initGrammarQuiz()">🔄 إعادة التمرين</button>
        </div>
      </div>
    `;
    return;
  }

  const q = GRAMMAR_QUIZ_QUESTIONS[grammarQuizIndex];
  grammarQuizAnswered = false;

  container.innerHTML = `
    <div class="quiz-question-box" style="padding:20px; border-radius:var(--radius-lg);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span class="vocab-badge" style="font-size:12px;">📖 ${q.topic}</span>
        <span style="font-size:13px; font-weight:800; color:var(--gold);">السؤال ${grammarQuizIndex + 1} / ${GRAMMAR_QUIZ_QUESTIONS.length}</span>
      </div>
      <div class="quiz-q-text" style="font-size:16px; margin-bottom:16px; text-align:right;">${q.q}</div>
      <div class="quiz-options" id="grammar-quiz-options">
        ${q.options.map((opt, i) => `
          <button type="button" class="quiz-option-btn" onclick="checkGrammarQuizOption(${i}, this)">
            <span class="opt-letter">${['A', 'B', 'C', 'D'][i]}</span>
            <span class="opt-text" lang="fr" dir="ltr">${opt}</span>
          </button>
        `).join('')}
      </div>
      <div id="grammar-quiz-feedback" class="quiz-feedback hidden" style="margin-top:14px;"></div>
      <div class="num-game-footer" style="margin-top:16px;">
        <button type="button" class="btn-secondary" onclick="initGrammarQuiz()">⏹ إنهاء</button>
        <button type="button" class="btn-primary hidden" id="grammar-quiz-next" onclick="nextGrammarQuizQuestion()">التالي / Suivant</button>
      </div>
    </div>
  `;
}

export function checkGrammarQuizOption(index, btnEl) {
  if (grammarQuizAnswered) return;
  grammarQuizAnswered = true;

  const q = GRAMMAR_QUIZ_QUESTIONS[grammarQuizIndex];
  const allBtns = document.querySelectorAll('#grammar-quiz-options .quiz-option-btn');
  const feedback = document.getElementById('grammar-quiz-feedback');
  const nextBtn = document.getElementById('grammar-quiz-next');

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
    grammarQuizScore++;
    feedback.className = 'quiz-feedback feedback-correct';
    feedback.innerHTML = `✅ <strong>إجابة صحيحة وقاعدة مضبوطة!</strong><br><small>💡 ${q.rule}</small>`;
  } else {
    feedback.className = 'quiz-feedback feedback-wrong';
    feedback.innerHTML = `❌ <strong>إجابة غير صحيحة.</strong> الصياغة السليمة هي: «${q.options[q.answer]}»<br><small>💡 ${q.rule}</small>`;
  }
  feedback.classList.remove('hidden');
  if (nextBtn) nextBtn.classList.remove('hidden');
}

export function nextGrammarQuizQuestion() {
  grammarQuizIndex++;
  renderGrammarQuizCard();
}

// ════════════════════════════════════════════════════════════════════════════
// 4. BTP VERBS CONJUGATION TABLES (SUB-VIEW 3)
// ════════════════════════════════════════════════════════════════════════════
const BTP_VERBS = [
  {
    verb: "Couler",
    ar: "يصبّ (الخرسانة)",
    group: "1er groupe (-er)",
    tenses: {
      present: "je coule, tu coules, il coule, nous coulons, vous coulez, ils coulent",
      passe: "j'ai coulé, tu as coulé, il a coulé, nous avons coulé, vous avez coulé, ils ont coulé",
      futur: "je coulerai, tu couleras, il coulera, nous coulerons, vous coulerez, ils couleront",
      imperatif: "Coule ! (tu) · Coulons ! (nous) · Coulez ! (vous)",
      conditionnel: "je coulerais, il coulerait, nous coulerions, vous couleriez"
    },
    example_fr: "Nous coulons la dalle du R+3 demain matin à la première heure.",
    example_ar: "سنصبّ دالّة الطابق الثالث صباح الغد في أول ساعة."
  },
  {
    verb: "Coffrer",
    ar: "يضع القوالب الخشبية/المعدنية",
    group: "1er groupe (-er)",
    tenses: {
      present: "je coffre, tu coffres, il coffre, nous coffrons, vous coffrez, ils coffrent",
      passe: "j'ai coffré, tu as coffré, il a coffré, nous avons coffré, vous avez coffré, ils ont coffré",
      futur: "je coffrerai, tu coffreras, il coffrera, nous coffrerons, vous coffrerez, ils coffreront",
      imperatif: "Coffre ! · Coffrons ! · Coffrez !",
      conditionnel: "je coffrerais, il coffrerait, nous coffrerions, vous coffreriez"
    },
    example_fr: "Les coffreurs ont coffré les poteaux du 2ème étage avec précision.",
    example_ar: "قام النجارون بوضع قوالب أعمدة الطابق الثاني بدقة."
  },
  {
    verb: "Ferrailler",
    ar: "يضع حديد التسليح",
    group: "1er groupe (-er)",
    tenses: {
      present: "je ferraille, tu ferrailles, il ferraille, nous ferraillons, vous ferraillez, ils ferraillent",
      passe: "j'ai ferraillé, tu as ferraillé, il a ferraillé, nous avons ferraillé, vous avez ferraillé",
      futur: "je ferraillerai, tu ferrailleras, il ferraillera, nous ferraillerons, vous ferraillerez",
      imperatif: "Ferraille ! · Ferraillons ! · Ferraillez !",
      conditionnel: "je ferraillerais, il ferraillerait, nous ferraillerions, vous ferrailleriez"
    },
    example_fr: "Vérifiez les cales d'enrobage avant de ferrailler la poutre principale.",
    example_ar: "تحقق من كتل التغطية (الكال) قبل تسليح الجائزة الرئيسية."
  },
  {
    verb: "Réceptionner",
    ar: "يستلم رسمياً (المواد أو الأشغال)",
    group: "1er groupe (-er)",
    tenses: {
      present: "je réceptionne, tu réceptionnes, il réceptionne, nous réceptionnons, vous réceptionnez",
      passe: "j'ai réceptionné, tu as réceptionné, il a réceptionné, nous avons réceptionné",
      futur: "je réceptionnerai, tu réceptionneras, il réceptionnera, nous réceptionnerons",
      imperatif: "Réceptionne ! · Réceptionnons ! · Réceptionnez !",
      conditionnel: "je réceptionnerais, il réceptionnerait, nous réceptionnerions"
    },
    example_fr: "Le chef de chantier réceptionne la livraison de ciment sous réserves.",
    example_ar: "يستلم رئيس الورش شحنة الإسمنت مع تدوين التحفظات."
  },
  {
    verb: "Vérifier",
    ar: "يفحص ويراقب الجودة والمطابقة",
    group: "1er groupe (-er)",
    tenses: {
      present: "je vérifie, tu vérifies, il vérifie, nous vérifions, vous vérifiez, ils vérifient",
      passe: "j'ai vérifié, tu as vérifié, il a vérifié, nous avons vérifié, vous avez vérifié",
      futur: "je vérifierai, tu vérifieras, il vérifiera, nous vérifierons, vous vérifierez",
      imperatif: "Vérifie ! · Vérifions ! · Vérifiez !",
      conditionnel: "je vérifierais, il vérifierait, nous vérifierions, vous vérifieriez"
    },
    example_fr: "Le topographe vérifie les niveaux d'implantation des fondations.",
    example_ar: "يقوم الطوبوغرافي بالتحقق من مناسيب ومستويات حفر الأساسات."
  },
  {
    verb: "Commander",
    ar: "يطلب شراء أو يأمر بتنفيذ",
    group: "1er groupe (-er)",
    tenses: {
      present: "je commande, tu commandes, il commande, nous commandons, vous commandez",
      passe: "j'ai commandé, tu as commandé, il a commandé, nous avons commandé",
      futur: "je commanderai, tu commanderas, il commandera, nous commanderons",
      imperatif: "Commande ! · Commandons ! · Commandez !",
      conditionnel: "je commanderais, il commanderait, nous commanderions"
    },
    example_fr: "Nous avons commandé 600 kg de fer à béton HA12 pour jeudi.",
    example_ar: "قمنا بطلب شراء 600 كلغ من حديد التسليح عيار 12 ليوم الخميس."
  }
];

export function selectVerbConjugation(index) {
  selectedVerbIndex = index;
  renderGrammarVerbsTable();
}

export function renderGrammarVerbsTable() {
  const container = document.getElementById('grammar-verbs-table-box');
  if (!container) return;

  const v = BTP_VERBS[selectedVerbIndex] || BTP_VERBS[0];

  container.innerHTML = `
    <div class="verb-selector-bar">
      ${BTP_VERBS.map((verbItem, idx) => `
        <button type="button" class="verb-pill-btn ${idx === selectedVerbIndex ? 'active' : ''}" onclick="selectVerbConjugation(${idx})">
          <strong>${verbItem.verb}</strong>
          <small>${verbItem.ar}</small>
        </button>
      `).join('')}
    </div>

    <div class="verb-card-detail" style="margin-top:18px;">
      <div class="verb-card-header">
        <div>
          <h3 style="margin:0; font-size:20px; color:var(--gold-light); font-family:var(--font-fr);">${v.verb} <span style="font-size:14px; font-weight:normal; color:#cbd5e1;">(${v.ar})</span></h3>
          <span style="font-size:12px; color:#94a3b8;">المجموعة: ${v.group}</span>
        </div>
        <button type="button" class="btn-primary" onclick="speakFrenchText('${v.verb}', this)">
          🔊 <span>نطق الفعل</span>
        </button>
      </div>

      <div class="verb-tenses-grid">
        <div class="tense-box">
          <span class="tense-name">Présent (الحاضر والعمل الميداني)</span>
          <p class="tense-conj" lang="fr" dir="ltr">${v.tenses.present}</p>
        </div>
        <div class="tense-box">
          <span class="tense-name">Passé Composé (الماضي لكتابة التقارير)</span>
          <p class="tense-conj" lang="fr" dir="ltr">${v.tenses.passe}</p>
        </div>
        <div class="tense-box">
          <span class="tense-name">Futur Simple (المستقبل والتخطيط)</span>
          <p class="tense-conj" lang="fr" dir="ltr">${v.tenses.futur}</p>
        </div>
        <div class="tense-box">
          <span class="tense-name">Impératif (صيغة الأمر للأطقم والعمال)</span>
          <p class="tense-conj" lang="fr" dir="ltr">${v.tenses.imperatif}</p>
        </div>
        <div class="tense-box" style="grid-column:1/-1;">
          <span class="tense-name">Conditionnel Présent (اللباقة والطلبات الرسمية)</span>
          <p class="tense-conj" lang="fr" dir="ltr">${v.tenses.conditionnel}</p>
        </div>
      </div>

      <div class="ex-row" style="margin-top:16px;">
        <div>
          <span class="ex-badge">📌 مثال تطبيقي في الورشة</span>
          <div class="ex-fr" lang="fr" dir="ltr">${v.example_fr}</div>
          <div class="ex-ar">${v.example_ar}</div>
        </div>
        <div class="ex-actions">
          <button type="button" class="gt-audio-btn" onclick="speakFrenchText('${v.example_fr.replace(/'/g, "\\'")}', this)" aria-label="استمع للجملة">🔊</button>
          <button type="button" class="gt-audio-btn" onclick="navigator.clipboard.writeText('${v.example_fr.replace(/'/g, "\\'")}').then(() => showToast('تم نسخ المثال!'))" aria-label="نسخ الجملة">📋</button>
        </div>
      </div>
    </div>
  `;
}

// ════════════════════════════════════════════════════════════════════════════
// 5. GLOBAL EXPORTS
// ════════════════════════════════════════════════════════════════════════════
if (typeof window !== 'undefined') {
  window.switchGrammarSubTab = switchGrammarSubTab;
  window.renderGrammarAccordions = renderGrammarAccordions;
  window.toggleAccordion = toggleAccordion;
  window.filterGrammarByCategory = filterGrammarByCategory;
  window.handleGrammarSearch = handleGrammarSearch;
  window.initGrammarQuiz = initGrammarQuiz;
  window.checkGrammarQuizOption = checkGrammarQuizOption;
  window.nextGrammarQuizQuestion = nextGrammarQuizQuestion;
  window.selectVerbConjugation = selectVerbConjugation;
  window.renderGrammarVerbsTable = renderGrammarVerbsTable;
}
