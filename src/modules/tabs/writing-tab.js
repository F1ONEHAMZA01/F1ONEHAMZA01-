import { state } from '../state.js';
import { WRITING_TEMPLATES } from '../../data/writing-templates.js';
import { appendTextElement, showToast, normalizeSearchText, escapeHtml } from '../ui-utils.js';
import { speakFrenchText } from '../audio.js';

let activeWritingCategory = 'all';
let activePhrasesCategory = 'all';

// ════════════════════════════════════════════════════════════════════════════
// 1. SUB-TABS NAVIGATION (TOP LEVEL TAB 5)
// ════════════════════════════════════════════════════════════════════════════
export function switchWritingSubTab(viewId, btnEl) {
  const allBtns = document.querySelectorAll('.writing-subtab-btn');
  const allViews = document.querySelectorAll('.writing-subview');

  allBtns.forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  allViews.forEach(v => {
    v.classList.add('hidden');
    v.classList.remove('active');
  });

  const targetView = document.getElementById(`writing-view-${viewId}`);
  const targetBtn = btnEl || document.getElementById(`subtab-btn-writing-${viewId}`);

  if (targetBtn) {
    targetBtn.classList.add('active');
    targetBtn.setAttribute('aria-selected', 'true');
  }
  if (targetView) {
    targetView.classList.remove('hidden');
    targetView.classList.add('active');
  }

  if (viewId === 'phrases') {
    renderWritingPhrases(activePhrasesCategory);
  } else if (viewId === 'emails') {
    renderEmailAssistant();
  }
}

// ════════════════════════════════════════════════════════════════════════════
// 2. TEMPLATE BUILDER (SUB-VIEW 1)
// ════════════════════════════════════════════════════════════════════════════
export function filterWritingTemplates(cat, btnEl) {
  activeWritingCategory = cat;
  const buttons = document.querySelectorAll('#writing-cat-filter-bar .lvl-btn');
  buttons.forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderWritingTemplatesSelector();
}

export function renderWritingTemplatesSelector() {
  const container = document.getElementById('writing-templates-selector-list');
  if (!container) return;

  const query = normalizeSearchText(document.getElementById('writing-tmpl-search')?.value || '');

  const filtered = WRITING_TEMPLATES.filter(tmpl => {
    if (activeWritingCategory !== 'all' && tmpl.category !== activeWritingCategory) return false;
    if (!query) return true;
    return normalizeSearchText(`${tmpl.title} ${tmpl.ar_desc} ${tmpl.template_str}`).includes(query);
  });

  const fragment = document.createDocumentFragment();
  filtered.forEach(tmpl => {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = `writing-sel-${tmpl.id}`;
    button.className = 'category-item' + (state.activeTemplateId === tmpl.id ? ' active-cat' : '');
    button.addEventListener('click', () => {
      loadWritingTemplate(tmpl.id);
      if (window.innerWidth < 900) {
        document.getElementById('template-builder-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    const copy = document.createElement('span');
    copy.className = 'reading-selector-copy';
    const [arTitle, frTitle = ''] = tmpl.title.split('/').map(part => part.trim());
    appendTextElement(copy, 'span', 'reading-selector-title', `${tmpl.icon} ${arTitle}`);
    if (frTitle) {
      const sub = appendTextElement(copy, 'span', 'reading-selector-sub', frTitle);
      sub.lang = 'fr';
      sub.dir = 'ltr';
    }
    button.appendChild(copy);

    const meta = document.createElement('span');
    meta.className = 'reading-selector-meta';
    appendTextElement(meta, 'span', 'lvl-badge lvl-a2', `${tmpl.fields.length} خانات`);
    button.appendChild(meta);

    fragment.appendChild(button);
  });

  if (!filtered.length) {
    appendTextElement(fragment, 'div', 'reading-empty-state', 'لا توجد نماذج مطابقة للبحث أو التصنيف.');
  }

  container.replaceChildren(fragment);

  if (!state.activeTemplateId && filtered.length) {
    loadWritingTemplate(filtered[0].id);
  }
}

export function loadWritingTemplate(tmplId) {
  state.activeTemplateId = tmplId;

  document.querySelectorAll('#writing-templates-selector-list .category-item').forEach(btn => {
    btn.classList.remove('active-cat');
  });
  const activeSel = document.getElementById(`writing-sel-${tmplId}`);
  if (activeSel) activeSel.classList.add('active-cat');

  const tmpl = WRITING_TEMPLATES.find(t => t.id === tmplId);
  if (!tmpl) return;

  state.templateFieldValues = {};
  tmpl.fields.forEach(f => {
    state.templateFieldValues[f.id] = f.placeholder;
  });

  const formTitle = document.getElementById('builder-form-title');
  if (formTitle) {
    formTitle.innerHTML = `✏️ ملء بيانات: <strong>${tmpl.title}</strong>`;
  }

  const inputsContainer = document.getElementById('builder-inputs-container');
  if (!inputsContainer) return;

  const inputsFragment = document.createDocumentFragment();
  tmpl.fields.forEach(f => {
    const group = document.createElement('div');
    group.className = 'form-group-bilingual';
    const inputId = `template-field-${tmpl.id}-${f.id}`;
    const label = appendTextElement(group, 'label', '', f.label);
    label.htmlFor = inputId;
    const input = document.createElement('input');
    input.id = inputId;
    input.type = 'text';
    input.className = 'input-field';
    input.dataset.fieldId = f.id;
    input.placeholder = f.placeholder;
    input.addEventListener('input', () => updateTemplateOutput(input));
    group.appendChild(input);
    inputsFragment.appendChild(group);
  });
  inputsContainer.replaceChildren(inputsFragment);

  renderTemplateOutput();
}

export function updateTemplateOutput(inputEl) {
  const fieldId = inputEl.getAttribute('data-field-id');
  const val = inputEl.value.trim();
  const tmpl = WRITING_TEMPLATES.find(t => t.id === state.activeTemplateId);
  if (!tmpl) return;

  state.templateFieldValues[fieldId] = val || tmpl.fields.find(f => f.id === fieldId)?.placeholder || '';
  renderTemplateOutput();
}

export function renderTemplateOutput() {
  const tmpl = WRITING_TEMPLATES.find(t => t.id === state.activeTemplateId);
  if (!tmpl) return;

  let outStr = tmpl.template_str;
  tmpl.fields.forEach(f => {
    const val = state.templateFieldValues[f.id] || f.placeholder;
    outStr = outStr.split(`[${f.id}]`).join(val);
  });

  if (state.activeTemplateId === 'bc') {
    const htVal = parseFloat(String(state.templateFieldValues['ht'] || '0').replace(/[^\d.]/g, '')) || 0;
    const rate = 0.20;
    const tva = htVal * rate;
    const cur = 'DH';
    outStr = outStr.replace('(Calculé automatiquement selon le pays)', `${tva.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ${cur}`);
  }

  const outBox = document.getElementById('builder-output-text');
  if (!outBox) return;

  const headerToolbar = document.createElement('div');
  headerToolbar.className = 'template-output-toolbar';

  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.className = 'btn-primary copy-btn';
  copyButton.innerHTML = '📋 <span>نسخ النص</span>';
  copyButton.addEventListener('click', copyTemplateToClipboard);

  const listenBtn = document.createElement('button');
  listenBtn.type = 'button';
  listenBtn.className = 'btn-secondary';
  listenBtn.innerHTML = '🔊 <span>استماع</span>';
  listenBtn.addEventListener('click', () => speakFrenchText(outStr, listenBtn));

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'btn-secondary';
  resetBtn.innerHTML = '🔄 <span>إعادة تعيين</span>';
  resetBtn.addEventListener('click', () => loadWritingTemplate(tmpl.id));

  headerToolbar.append(copyButton, listenBtn, resetBtn);

  const pre = document.createElement('pre');
  pre.className = 'doc-viewer-card template-code-view';
  pre.lang = 'fr';
  pre.dir = 'ltr';
  pre.textContent = outStr;

  outBox.replaceChildren(headerToolbar, pre);
  outBox.classList.remove('output-updated');
  void outBox.offsetWidth;
  outBox.classList.add('output-updated');
}

export function copyTemplateToClipboard() {
  const tmpl = WRITING_TEMPLATES.find(t => t.id === state.activeTemplateId);
  if (!tmpl) return;

  let outStr = tmpl.template_str;
  tmpl.fields.forEach(f => {
    const val = state.templateFieldValues[f.id] || f.placeholder;
    outStr = outStr.split(`[${f.id}]`).join(val);
  });

  if (state.activeTemplateId === 'bc') {
    const htVal = parseFloat(String(state.templateFieldValues['ht'] || '0').replace(/[^\d.]/g, '')) || 0;
    const rate = 0.20;
    const tva = htVal * rate;
    const cur = 'DH';
    outStr = outStr.replace('(Calculé automatiquement selon le pays)', `${tva.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ${cur}`);
  }

  navigator.clipboard.writeText(outStr).then(() => {
    showToast('تم نسخ نص المراسلة الجاهز إلى الحافظة!');
  }).catch(() => {
    showToast('تعذر نسخ النص في هذا المتصفح.');
  });
}

// ════════════════════════════════════════════════════════════════════════════
// 3. ESSENTIAL SITE PHRASES LIBRARY (SUB-VIEW 2)
// ════════════════════════════════════════════════════════════════════════════
const BTP_SITE_PHRASES = [
  {
    category: "orders",
    fr: "Merci de nous livrer le béton prêt à l'emploi (BPE) dosé à 350 kg/m³ demain à 07h00 précise.",
    ar: "المرجو تزويدنا بالخرسانة الجاهزة للاستعمال عيار 350 كلغ/م³ غداً عند الساعة السابعة تماماً.",
    context: "طلب توريد الخرسانة"
  },
  {
    category: "orders",
    fr: "Veuillez nous transmettre la fiche technique et le certificat de conformité NM pour les aciers HA.",
    ar: "المرجو تزويدنا بالبطاقة التقنية وشهادة المطابقة للمواصفات المغربية لحديد التسليح.",
    context: "طلب شهادات الجودة"
  },
  {
    category: "orders",
    fr: "Nous vous prions d'accélérer la livraison des briques de 15 cm pour éviter l'arrêt des maçons.",
    ar: "نرجو منكم تسريع تسليم الياجور 15 سم لتفادي توقف البنائين عن العمل.",
    context: "استعجال التوريد"
  },
  {
    category: "claims",
    fr: "Sous toutes réserves : 15 sacs de ciment livrés sont détrempés et inutilisables.",
    ar: "مع التحفظ التام: 15 كيس إسمنت مسلّمة مبللة بالماء وغير صالحة للاستعمال.",
    context: "تدوين تحفظ في وصل التسليم"
  },
  {
    category: "claims",
    fr: "Nous constatons un retard de 3 heures sur l'arrivée de la pompe à béton, ce qui bloque le coulage.",
    ar: "نسجل تأخراً لـ 3 ساعات في وصول مضخة الخرسانة، مما يعطل عملية الصب.",
    context: "شكوى تأخر المعدات"
  },
  {
    category: "claims",
    fr: "FNC N°08 : Reprise obligatoire de l'enduit fissuré conformément aux instructions du BET.",
    ar: "بطاقة عدم مطابقة رقم 08: إعادة تطبيق الطلاء المشقق إلزامية حسب تعليمات مكتب الدراسات.",
    context: "إصدار مخالفة جودة"
  },
  {
    category: "site",
    fr: "Arrêt total des travaux de terrassement et de coulage ce jour en raison des fortes pluies.",
    ar: "توقف كلي لأشغال الحفر وصب الخرسانة اليوم بسبب الأمطار الغزيرة (حالة طقس).",
    context: "توثيق توقف الأمطار"
  },
  {
    category: "site",
    fr: "Le ferraillage du voile V5 est conforme aux plans d'exécution et validé par le BET.",
    ar: "تسليح الحائط الخرساني V5 مطابق لمخططات التنفيذ وتمت المصادقة عليه من طرف الـ BET.",
    context: "محضر مطابقة التسليح"
  },
  {
    category: "site",
    fr: "Nous sollicitons la présence de l'architecte pour la réception des cloisons du 2ème étage.",
    ar: "نلتمس حضور المهندس المعماري لمعاينة واستلام حوائط وقواطع الطابق الثاني.",
    context: "طلب زيارة استلام"
  },
  {
    category: "finance",
    fr: "Veuillez trouver ci-joint le décompte provisoire N°4 pour vérification et mise en paiement.",
    ar: "تجدون رفقته كشف الحساب المؤقت رقم 4 للمراجعة والأداء.",
    context: "إرسال الوضعية المالية"
  },
  {
    category: "finance",
    fr: "Nous vous rappelons que la facture N°FA-2026-088 est échue depuis le 15 du mois courant.",
    ar: "نذكركم بأن الفاتورة رقم FA-2026-088 قد حان أجل سدادها منذ 15 من الشهر الحالي.",
    context: "تذكير بسداد فاتورة"
  },
  {
    category: "safety",
    fr: "Le port du casque et des chaussures de sécurité à embout acier est strictement obligatoire sur le chantier.",
    ar: "ارتداء الخوذة وأحذية السلامة ذات الرأس الفولاذي إلزامي وصارم في جميع أرجاء الورش.",
    context: "تعليمات السلامة الفردية"
  },
  {
    category: "safety",
    fr: "Interdiction formelle de travailler sur l'échafaudage sans harnais de sécurité attaché à la ligne de vie.",
    ar: "يُمنع منعاً باتاً العمل على السقالة دون ربط حزام الأمان بحبل النجاة.",
    context: "العمل في المرتفعات"
  },
  {
    category: "safety",
    fr: "Balisage et sécurisation immédiate de la fouille ouverte près de l'accès principal.",
    ar: "وضع حواجز وإشارات تحذيرية فورية للحفرة المفتوحة قرب المدخل الرئيسي.",
    context: "تأمين مناطق الخطر"
  }
];

export function filterPhrasesByCategory(cat, btnEl) {
  activePhrasesCategory = cat;
  const buttons = document.querySelectorAll('#phrases-cat-filter-bar .lvl-btn');
  buttons.forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderWritingPhrases(cat);
}

export function renderWritingPhrases(cat = 'all') {
  const container = document.getElementById('writing-phrases-grid');
  if (!container) return;

  const query = normalizeSearchText(document.getElementById('writing-phrase-search')?.value || '');

  const filtered = BTP_SITE_PHRASES.filter(p => {
    if (cat !== 'all' && p.category !== cat) return false;
    if (!query) return true;
    return normalizeSearchText(`${p.fr} ${p.ar} ${p.context}`).includes(query);
  });

  if (!filtered.length) {
    container.innerHTML = `<div class="reading-empty-state" style="grid-column:1/-1;">لا توجد صيغ أو عبارات مطابقة للبحث.</div>`;
    return;
  }

  container.innerHTML = filtered.map(p => `
    <div class="phrase-card">
      <div class="phrase-head">
        <span class="phrase-context">📌 ${p.context}</span>
        <div class="phrase-actions">
          <button type="button" class="gt-audio-btn" onclick="speakFrenchText('${p.fr.replace(/'/g, "\\'")}', this)" aria-label="استمع لنطق العبارة">🔊</button>
          <button type="button" class="gt-audio-btn" onclick="navigator.clipboard.writeText('${p.fr.replace(/'/g, "\\'")}').then(() => showToast('تم نسخ العبارة!'))" aria-label="نسخ العبارة">📋</button>
        </div>
      </div>
      <div class="phrase-fr" lang="fr" dir="ltr">${p.fr}</div>
      <div class="phrase-ar">${p.ar}</div>
    </div>
  `).join('');
}

// ════════════════════════════════════════════════════════════════════════════
// 4. INTERACTIVE EMAIL ASSISTANT (SUB-VIEW 3)
// ════════════════════════════════════════════════════════════════════════════
const EMAIL_SCENARIOS = {
  relance: {
    title: "تأخر توريد مواد / Relance Fournisseur",
    icon: "🚛",
    fields: [
      { id: "dest", label: "اسم المورد / Fournisseur", default: "LAFARGE MAROC" },
      { id: "proj", label: "اسم الورش / Projet", default: "Résidence Al Andalous" },
      { id: "mat", label: "المادة المتأخرة / Matériau", default: "Béton prêt à l'emploi BPE (15 m³)" },
      { id: "delay", label: "مدة التأخير / Durée retard", default: "2 heures" },
      { id: "impact", label: "التأثير على الورش / Conséquence", default: "Arrêt complet de l'équipe de coulage" }
    ],
    generate: (vals) => `Objet : Relance urgente — Retard de livraison — ${vals.proj}
De    : mohamed.alami@batimaroc.ma
À     : contact@${vals.dest.toLowerCase().replace(/\s+/g, '')}.ma

Monsieur le Responsable Commercial,

Je me permets de vous contacter en urgence concernant la commande de ${vals.mat} prévue ce matin pour le chantier ${vals.proj}.

Nous constatons actuellement un retard de ${vals.delay}. Ce contretemps engendre ${vals.impact} et perturbe gravement notre planning contractuel.

Nous vous demandons de bien vouloir nous confirmer par retour immédiat l'heure exacte d'arrivée de la livraison sur site.

Comptant sur votre diligence habituelle.

Cordialement,
M. ALAMI Mohamed — Conducteur de Travaux
BATIMAROC SARL — Tél : 06 61 23 45 67`
  },
  bet: {
    title: "طلب مصادقة على مخططات / Approbation BET",
    icon: "📐",
    fields: [
      { id: "bet", label: "اسم مكتب الدراسات / BET", default: "SETRABAT Ingénierie" },
      { id: "proj", label: "المشروع / Projet", default: "Résidence Al Andalous" },
      { id: "plans", label: "المخططات المعنية / Plans concernés", default: "Ferraillage voiles V5 et V6 (R+3)" },
      { id: "deadline", label: "أجل الصب / Date coulage", default: "Vendredi 11 Mars à 08h00" }
    ],
    generate: (vals) => `Objet : Demande de validation des plans d'exécution — ${vals.proj}
De    : mohamed.alami@batimaroc.ma
À     : technique@${vals.bet.toLowerCase().replace(/\s+/g, '')}.ma

Monsieur l'Ingénieur,

Nous vous prions de trouver en pièce jointe pour examen et visa les plans de détail concernant :
${vals.plans} pour le projet ${vals.proj}.

Le coulage de ces ouvrages étant programmé pour ${vals.deadline}, nous vous serions reconnaissants de bien vouloir nous retourner les plans visés « Bon pour Exécution » dans les meilleurs délais.

Restant à votre disposition pour toute précision technique.

Salutations distinguées,
M. ALAMI Mohamed — Conducteur de Travaux
BATIMAROC SARL`
  },
  reception: {
    title: "دعوة للاستلام المؤقت / Convocation Réception Provisoire",
    icon: "🏛️",
    fields: [
      { id: "moa", label: "صاحب المشروع / Maître d'Ouvrage", default: "Groupe ALLIANCES Darna" },
      { id: "proj", label: "المشروع / Projet", default: "Résidence Al Andalous R+4" },
      { id: "date", label: "الموعد المقترح / Date proposée", default: "Lundi 23 Mars 2026 à 10h00" },
      { id: "lot", label: "الحصة المكتملة / Lot achevé", default: "Lot Gros Œuvre et Étanchéité" }
    ],
    generate: (vals) => `Objet : Convocation pour la Réception Provisoire des travaux — ${vals.proj}
De    : direction.travaux@batimaroc.ma
À     : direction.projets@${vals.moa.toLowerCase().replace(/\s+/g, '')}.ma

Monsieur le Directeur de Projet,

Nous avons l'honneur de vous informer de l'achèvement complet des travaux relatifs au ${vals.lot} du projet ${vals.proj}.

Par conséquent, nous vous prions de bien vouloir convoquer la commission de réception afin de procéder à la Réception Provisoire desdits travaux le :
📅 ${vals.date} sur site.

Veuillez agréer, Monsieur le Directeur, l'expression de notre haute considération.

Pour l'Entreprise BATIMAROC SARL,
Le Directeur des Travaux`
  },
  weather: {
    title: "إشعار توقف بسبب الطقس / Constat Arrêt Intempéries",
    icon: "🌧️",
    fields: [
      { id: "moa", label: "صاحب المشروع / MOA & Architecte", default: "ALLIANCES Darna / Cabinet Benchekroun" },
      { id: "proj", label: "اسم الورش / Projet", default: "Résidence Al Andalous" },
      { id: "days", label: "أيام التوقف / Jours d'arrêt", default: "08 et 09 Mars 2026 (2 jours)" },
      { id: "reason", label: "طبيعة الطقس / Nature intempéries", default: "Pluies diluviennes et vent violent (> 60 km/h)" }
    ],
    generate: (vals) => `Objet : Notification d'arrêt des travaux pour cause d'intempéries — ${vals.proj}
De    : mohamed.alami@batimaroc.ma
À     : suivi.chantier@alliances.ma

Messieurs,

Conformément aux stipulations du CCAG-T en vigueur au Maroc, nous vous notifions par la présente l'arrêt temporaire des travaux sur le chantier ${vals.proj} pendant :
${vals.days}.

Cet arrêt est motivé par : ${vals.reason}, rendant impraticables les accès et dangereux le travail sur les échafaudages.

Nous vous demandons de bien vouloir acter ces journées d'intempéries afin qu'elles soient décomptées du délai contractuel global.

Veuillez agréer, Messieurs, nos salutations distinguées.

M. ALAMI Mohamed — Conducteur de Travaux`
  }
};

let currentEmailScenario = 'relance';

export function renderEmailAssistant() {
  const container = document.getElementById('writing-email-builder-box');
  if (!container) return;

  const scenario = EMAIL_SCENARIOS[currentEmailScenario];

  container.innerHTML = `
    <div class="email-assistant-wrap">
      <div class="email-scenario-selector">
        ${Object.entries(EMAIL_SCENARIOS).map(([key, s]) => `
          <button type="button" class="email-scenario-btn ${key === currentEmailScenario ? 'active' : ''}" onclick="selectEmailScenario('${key}')">
            <span>${s.icon}</span>
            <div>
              <strong>${s.title.split('/')[0].trim()}</strong>
              <small>${s.title.split('/')[1]?.trim() || ''}</small>
            </div>
          </button>
        `).join('')}
      </div>

      <div class="template-builder-grid" style="margin-top:16px;">
        <div class="card md3-form-panel">
          <h4 class="card-title">✏️ بيانات الرسالة: ${scenario.icon} ${scenario.title.split('/')[0]}</h4>
          <div class="form-inputs-container">
            ${scenario.fields.map(f => `
              <div class="form-group-bilingual">
                <label for="email-field-${f.id}">${f.label}</label>
                <input type="text" id="email-field-${f.id}" class="input-field" value="${f.default}" oninput="updateEmailAssistantPreview()">
              </div>
            `).join('')}
          </div>
        </div>

        <div class="card md3-document-panel">
          <h4 class="card-title">✉️ الإيميل المهني الجاهز للإرسال</h4>
          <div class="template-output-card" id="email-assistant-output"></div>
        </div>
      </div>
    </div>
  `;

  updateEmailAssistantPreview();
}

export function selectEmailScenario(key) {
  currentEmailScenario = key;
  renderEmailAssistant();
}

export function updateEmailAssistantPreview() {
  const scenario = EMAIL_SCENARIOS[currentEmailScenario];
  if (!scenario) return;

  const vals = {};
  scenario.fields.forEach(f => {
    const input = document.getElementById(`email-field-${f.id}`);
    vals[f.id] = input?.value.trim() || f.default;
  });

  const generatedEmail = scenario.generate(vals);
  const outBox = document.getElementById('email-assistant-output');
  if (!outBox) return;

  outBox.innerHTML = `
    <div class="template-output-toolbar">
      <button type="button" class="btn-primary copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('email-text-view').innerText).then(() => showToast('تم نسخ الإيميل!'))">
        📋 <span>نسخ الإيميل</span>
      </button>
      <button type="button" class="btn-secondary" onclick="speakFrenchText(document.getElementById('email-text-view').innerText, this)">
        🔊 <span>استماع</span>
      </button>
    </div>
    <pre class="doc-viewer-card template-code-view" id="email-text-view" lang="fr" dir="ltr">${escapeHtml(generatedEmail)}</pre>
  `;
  outBox.classList.remove('output-updated');
  void outBox.offsetWidth;
  outBox.classList.add('output-updated');
}

// ════════════════════════════════════════════════════════════════════════════
// 5. GLOBAL EXPORTS
// ════════════════════════════════════════════════════════════════════════════
if (typeof window !== 'undefined') {
  window.switchWritingSubTab = switchWritingSubTab;
  window.filterWritingTemplates = filterWritingTemplates;
  window.renderWritingTemplatesSelector = renderWritingTemplatesSelector;
  window.loadWritingTemplate = loadWritingTemplate;
  window.updateTemplateOutput = updateTemplateOutput;
  window.renderTemplateOutput = renderTemplateOutput;
  window.copyTemplateToClipboard = copyTemplateToClipboard;
  window.filterPhrasesByCategory = filterPhrasesByCategory;
  window.renderWritingPhrases = renderWritingPhrases;
  window.renderEmailAssistant = renderEmailAssistant;
  window.selectEmailScenario = selectEmailScenario;
  window.updateEmailAssistantPreview = updateEmailAssistantPreview;
}
