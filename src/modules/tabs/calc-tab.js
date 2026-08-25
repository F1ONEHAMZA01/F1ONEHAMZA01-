import { showToast } from '../ui-utils.js';
import {
  computeConcreteMix,
  computeSteelWeight,
  computeBrickwork,
  computeTiling,
  computeFinancialDecompte,
  computeTruckLoads,
  computePlasterBags
} from '../btp-math.js';

// ════════════════════════════════════════════════════════════════════════════
// 1. SUB-TABS NAVIGATION (TOP LEVEL TAB 8)
// ════════════════════════════════════════════════════════════════════════════
export function switchCalcSubTab(viewId, btnEl) {
  const allBtns = document.querySelectorAll('.calc-subtab-btn');
  const allViews = document.querySelectorAll('.calc-subview');

  allBtns.forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  allViews.forEach(v => {
    v.classList.add('hidden');
    v.classList.remove('active');
  });

  const targetView = document.getElementById(`calc-view-${viewId}`);
  const targetBtn = btnEl || document.getElementById(`subtab-btn-calc-${viewId}`);

  if (targetBtn) {
    targetBtn.classList.add('active');
    targetBtn.setAttribute('aria-selected', 'true');
  }
  if (targetView) {
    targetView.classList.remove('hidden');
    targetView.classList.add('active');
  }
}

// ════════════════════════════════════════════════════════════════════════════
// 2. CONCRETE & STRUCTURE CALCULATIONS (SUB-VIEW 1)
// ════════════════════════════════════════════════════════════════════════════
export function calculateBtpBeton() {
  const l = parseFloat(document.getElementById('calc-beton-l')?.value) || 0;
  const w = parseFloat(document.getElementById('calc-beton-w')?.value) || 0;
  const h = parseFloat(document.getElementById('calc-beton-h')?.value) || 0;
  const dosage = parseFloat(document.getElementById('calc-beton-dosage')?.value) || 350;
  const mix = computeConcreteMix({ l, w, h, dosage });
  const resEl = document.getElementById('calc-beton-result');
  if (!resEl) return;

  if (!mix) {
    resEl.innerHTML = 'أدخل الأبعاد أعلاه لحساب التكعيب وعدد أكياس الإسمنت والرمل والحصى...';
    return;
  }

  const vol = mix.vol;
  const bags = mix.bags;
  const sand = mix.sand;
  const gravel = mix.gravel;
  const waterLiters = mix.waterLiters;

  resEl.innerHTML = `
    <div style="font-size:15px; font-weight:800; color:var(--gold); margin-bottom:6px;">📊 الحجم الإجمالي: ${vol.toFixed(2)} m³ (${mix.volWithWaste.toFixed(2)} m³ مع الضياع 3%)</div>
    <div class="calc-mix-bar" style="display:flex; height:8px; border-radius:4px; overflow:hidden; margin:8px 0 4px; background:#0f172a; border:1px solid rgba(255,255,255,0.1);">
      <div style="width:25%; background:#94a3b8;" title="Ciment: 350kg"></div>
      <div style="width:25%; background:#f59e0b;" title="Sable: 400L"></div>
      <div style="width:38%; background:#64748b;" title="Gravier: 800L"></div>
      <div style="width:12%; background:#38bdf8;" title="Eau: 175L"></div>
    </div>
    <div style="display:flex; justify-content:space-between; font-size:10.5px; color:#94a3b8; margin-bottom:8px;">
      <span>◽ إسمنت 25%</span>
      <span>◽ رمل 25%</span>
      <span>◽ حصى 38%</span>
      <span>◽ ماء 12%</span>
    </div>
    <div style="font-size:12.5px; color:#e2e8f0; line-height:1.6;">
      📦 <b>الإسمنت (${dosage} kg/m³ CPJ 45):</b> <strong>${bags} كيس</strong> (50kg) = ${(mix.totalCementKg / 1000).toFixed(2)} طن<br>
      🏖️ <b>الرمل (Sable 0/4):</b> ~${sand} m³ &nbsp;|&nbsp; 🪨 <b>الحصى (Gravier 8/16):</b> ~${gravel} m³<br>
      💧 <b>ماء الخلط (Eau E/C 0.50):</b> ~${waterLiters} لتر
    </div>
  `;
  resEl.style.animation = 'none';
  void resEl.offsetWidth;
  resEl.style.animation = 'calcResultEntrance 0.28s var(--ease-out-expo) both';
}

export function setBetonPreset(type) {
  if (type === 'dalle') {
    document.getElementById('calc-beton-l').value = '10.0';
    document.getElementById('calc-beton-w').value = '8.0';
    document.getElementById('calc-beton-h').value = '0.20';
    document.getElementById('calc-beton-dosage').value = '350';
  } else if (type === 'poteau') {
    document.getElementById('calc-beton-l').value = '0.30';
    document.getElementById('calc-beton-w').value = '0.30';
    document.getElementById('calc-beton-h').value = '3.00';
    document.getElementById('calc-beton-dosage').value = '350';
  } else if (type === 'semelle') {
    document.getElementById('calc-beton-l').value = '1.50';
    document.getElementById('calc-beton-w').value = '1.50';
    document.getElementById('calc-beton-h').value = '0.40';
    document.getElementById('calc-beton-dosage').value = '350';
  }
  calculateBtpBeton();
}

export function calculateBtpAcier() {
  const d = parseFloat(document.getElementById('calc-acier-d')?.value) || 12;
  const len = parseFloat(document.getElementById('calc-acier-len')?.value) || 0;
  const resEl = document.getElementById('calc-acier-result');
  if (!resEl) return;

  const steel = computeSteelWeight(d, len);

  if (!steel) {
    resEl.innerHTML = 'أدخل الطول بالمتر لحساب الوزن الإجمالي وعدد القضبان (Barres 12m)...';
    return;
  }

  const kg = steel.kg;
  const tonnes = steel.tonnes;
  const unitW = steel.unitW;
  const barres12m = steel.barres12m;
  const barres6m = steel.barres6m;

  resEl.innerHTML = `
    <div style="font-size:15px; font-weight:800; color:var(--gold); margin-bottom:6px;">⚖️ الوزن الإجمالي: ${kg.toFixed(2)} kg (${tonnes.toFixed(3)} Tonnes)</div>
    <div style="font-size:12.5px; color:#e2e8f0; line-height:1.6;">
      📏 <b>عدد القضبان التجارية (Barres 12m):</b> <strong>${barres12m} قضيب</strong> (HA ${d} FeE500)<br>
      📐 <b>الوزن المترّي:</b> ${unitW} kg/ml &nbsp;|&nbsp; <b>قضبان 6m (نصف طول):</b> ${barres6m} قضيب
    </div>
  `;
  resEl.style.animation = 'none';
  void resEl.offsetWidth;
  resEl.style.animation = 'calcResultEntrance 0.28s var(--ease-out-expo) both';
}

// ════════════════════════════════════════════════════════════════════════════
// 3. MASONRY & FINISHING CALCULATIONS (SUB-VIEW 2)
// ════════════════════════════════════════════════════════════════════════════
export function calculateBtpBriques() {
  const area = parseFloat(document.getElementById('calc-brique-area')?.value) || 0;
  const rate = parseFloat(document.getElementById('calc-brique-type')?.value) || 12.5;
  const resEl = document.getElementById('calc-brique-result');
  if (!resEl) return;

  const bricks = computeBrickwork(area, rate);

  if (!bricks) {
    resEl.innerHTML = 'أدخل المساحة بالمتر المربع لحساب عدد الآجور وأكياس ملاط البناء...';
    return;
  }

  const count = bricks.count;
  const cimentBags = bricks.cimentBags;
  const sandVolume = bricks.sandVolume;

  resEl.innerHTML = `
    <div style="font-size:15px; font-weight:800; color:var(--gold); margin-bottom:6px;">🧱 العدد المطلوب للشراء: <strong>${count} قطعة</strong></div>
    <div style="font-size:12.5px; color:#e2e8f0; line-height:1.6;">
      💡 <i>شامل 5% نسبة الضياع الميدانية (Chute chantier)</i><br>
      📦 <b>الإسمنت لملاط البناء (Mortier):</b> حوالي <strong>${cimentBags} كيس</strong> (50kg)<br>
      🏖️ <b>رمل البناء (Sable mortier):</b> ~${sandVolume} m³
    </div>
  `;
  resEl.style.animation = 'none';
  void resEl.offsetWidth;
  resEl.style.animation = 'calcResultEntrance 0.28s var(--ease-out-expo) both';
}

export function calculateBtpCarrelage() {
  const area = parseFloat(document.getElementById('calc-carrelage-area')?.value) || 0;
  const waste = parseFloat(document.getElementById('calc-carrelage-waste')?.value) || 10;
  const resEl = document.getElementById('calc-carrelage-result');
  if (!resEl) return;

  const tiles = computeTiling(area, waste);

  if (!tiles) {
    resEl.innerHTML = 'أدخل مساحة الأرضية لحساب المساحة الصافية لشراء السيراميك وأكياس الغراء...';
    return;
  }

  const totalArea = tiles.totalArea;
  const colleBags = tiles.colleBags;
  const jointBags = tiles.jointBags;

  resEl.innerHTML = `
    <div style="font-size:15px; font-weight:800; color:var(--gold); margin-bottom:6px;">🪟 المساحة الإجمالية للطلب: <strong>${totalArea.toFixed(2)} m²</strong></div>
    <div style="font-size:12.5px; color:#e2e8f0; line-height:1.6;">
      📦 <b>غراء البلاط (Ciment-colle 25kg):</b> <strong>${colleBags} أكياس</strong> (بمعدل 4 kg/m²)<br>
      🎨 <b>معجون المفاصل (Joint de carrelage 5kg):</b> <strong>${jointBags} أكياس</strong>
    </div>
  `;
  resEl.style.animation = 'none';
  void resEl.offsetWidth;
  resEl.style.animation = 'calcResultEntrance 0.28s var(--ease-out-expo) both';
}

// ════════════════════════════════════════════════════════════════════════════
// 4. FINANCIAL DECOMPTE & TVA CALCULATOR (SUB-VIEW 3)
// ════════════════════════════════════════════════════════════════════════════
export function calculateBtpFinances() {
  const ht = parseFloat(document.getElementById('calc-finance-ht')?.value) || 0;
  const tvaRate = Math.max(0, parseFloat(document.getElementById('calc-finance-tva')?.value) || 0);
  const retentionRate = Math.min(100, Math.max(0, parseFloat(document.getElementById('calc-finance-retention')?.value) || 0));
  const retentionBasis = document.getElementById('calc-finance-basis')?.value === 'ttc' ? 'ttc' : 'ht';
  const resEl = document.getElementById('calc-finance-result');
  if (!resEl) return;

  if (ht <= 0) {
    resEl.innerHTML = 'أدخل المبلغ دون ضريبة (HT) لحساب الضريبة واقتطاع الضمان والصافي للدفع...';
    return;
  }

  const { tva, ttc, retenue, net } = computeFinancialDecompte(ht, tvaRate, retentionRate, retentionBasis);

  resEl.innerHTML = `
    <div style="font-size:15px; font-weight:800; color:var(--gold); margin-bottom:6px;">💰 المجموع شامل الضريبة (TTC): <strong>${ttc.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH</strong></div>
    <div style="font-size:12.5px; color:#e2e8f0; line-height:1.6;">
      🔹 <b>الضريبة على القيمة المضافة (TVA ${tvaRate}%):</b> ${tva.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH<br>
      🔒 <b>اقتطاع الضمان (${retentionRate}% من ${retentionBasis.toUpperCase()}):</b> ${retenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH<br>
      💵 <b>الصافي المستحق للصرف (Net à Payer):</b> <span style="color:#22c55e; font-weight:800; font-size:14px;">${net.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH</span>
      <br><span style="color:var(--text-muted); font-size:11.5px;">⚖️ يتم استرداد اقتطاع الضمان (10%) بعد الاستلام النهائي (Réception Définitive) ومطابقة الإنجاز.</span>
    </div>
  `;
  resEl.style.animation = 'none';
  void resEl.offsetWidth;
  resEl.style.animation = 'calcResultEntrance 0.28s var(--ease-out-expo) both';
}

// ════════════════════════════════════════════════════════════════════════════
// 5. BTP UNIT CONVERTER (SUB-VIEW 4)
// ════════════════════════════════════════════════════════════════════════════
export function calculateBtpToupie() {
  const vol = parseFloat(document.getElementById('conv-toupie-vol')?.value) || 0;
  const cap = parseFloat(document.getElementById('conv-toupie-cap')?.value) || 8;
  const res = document.getElementById('conv-toupie-res');
  if (!res) return;
  const toupies = computeTruckLoads(vol, cap);
  if (toupies === null) {
    res.innerText = 'أدخل حجم الخرسانة بالمتر المكعب...';
    return;
  }
  res.innerHTML = `🚚 تحتاج حوالي <strong>${toupies} شاحنة خلط (Toupie ${cap}m³)</strong> لتوصيل ${vol} m³ من الخرسانة.`;
}

export function calculateBtpPlatre() {
  const area = parseFloat(document.getElementById('conv-platre-area')?.value) || 0;
  const res = document.getElementById('conv-platre-res');
  if (!res) return;
  const sacsPlatre = computePlasterBags(area);
  if (sacsPlatre === null) {
    res.innerText = 'أدخل مساحة الجدران والأسقف بالمتر المربع...';
    return;
  }
  res.innerHTML = `🧱 تحتاج حوالي <strong>${sacsPlatre} كيس جبس (Plâtre 40kg)</strong> لتغطية ${area} m² (بمعدل 10 kg/m² لسمك 1 سم).`;
}

// ════════════════════════════════════════════════════════════════════════════
// 6. COPY RESULT HELPER
// ════════════════════════════════════════════════════════════════════════════
export function copyCalcResult(type) {
  let txt = '';
  if (type === 'beton') {
    txt = document.getElementById('calc-beton-result')?.innerText || '';
  } else if (type === 'acier') {
    txt = document.getElementById('calc-acier-result')?.innerText || '';
  } else if (type === 'brique') {
    txt = document.getElementById('calc-brique-result')?.innerText || '';
  } else if (type === 'carrelage') {
    txt = document.getElementById('calc-carrelage-result')?.innerText || '';
  } else if (type === 'finance') {
    txt = document.getElementById('calc-finance-result')?.innerText || '';
  }
  if (txt && !txt.includes('أدخل')) {
    navigator.clipboard.writeText(txt.replace(/\n+/g, ' | ')).then(() => {
      showToast('تم نسخ نتيجة الحساب بنجاح! 📋');
    }).catch(() => showToast('تعذر النسخ'));
  } else {
    showToast('أدخل البيانات أولاً للحساب والنسخ');
  }
}

// ════════════════════════════════════════════════════════════════════════════
// 7. GLOBAL EXPORTS
// ════════════════════════════════════════════════════════════════════════════
if (typeof window !== 'undefined') {
  window.switchCalcSubTab = switchCalcSubTab;
  window.calculateBtpBeton = calculateBtpBeton;
  window.setBetonPreset = setBetonPreset;
  window.calculateBtpAcier = calculateBtpAcier;
  window.calculateBtpBriques = calculateBtpBriques;
  window.calculateBtpCarrelage = calculateBtpCarrelage;
  window.calculateBtpFinances = calculateBtpFinances;
  window.calculateBtpToupie = calculateBtpToupie;
  window.calculateBtpPlatre = calculateBtpPlatre;
  window.copyCalcResult = copyCalcResult;
}
