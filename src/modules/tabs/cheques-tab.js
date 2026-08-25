import { state } from '../state.js';
import { FR_PRON_TOKENS } from '../../data/numbers-ref.js';
import { NUMBERS_DATA } from '../../data/numbers-ref.js';
import { appendTextElement, showToast, escapeHtml, playHaptic } from '../ui-utils.js';
import { speakFrenchText, frWordsToPron } from '../audio.js';
import { shuffleArray } from './quiz-tab.js';
import { rollValue } from '../motion.js';

export function numberToFrench(n) {
  if (n === 0) return "zéro";
  if (n < 0) return "moins " + numberToFrench(-n);
  
  let result = "";
  
  if (n >= 1000000) {
    const mil = Math.floor(n / 1000000);
    result += numberToFrench(mil) + " million" + (mil > 1 ? "s" : "") + " ";
    n %= 1000000;
  }
  
  if (n >= 1000) {
    const th = Math.floor(n / 1000);
    if (th === 1) {
      result += "mille ";
    } else {
      let thStr = numberToFrench(th);
      if (thStr.endsWith("quatre-vingts")) {
        thStr = thStr.substring(0, thStr.length - 1);
      }
      if (thStr.endsWith("cents")) {
        thStr = thStr.substring(0, thStr.length - 1);
      }
      result += thStr + " mille ";
    }
    n %= 1000;
  }

  if (n >= 100) {
    const h = Math.floor(n / 100);
    if (h === 1) {
      result += "cent ";
    } else {
      let hStr = numberToFrench(h);
      if (hStr.endsWith("quatre-vingts")) {
        hStr = hStr.substring(0, hStr.length - 1);
      }
      result += hStr + " cent" + (n % 100 === 0 ? "s" : "") + " ";
    }
    n %= 100;
  }
  
  const ones = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
  const tens = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];
  
  if (n > 0) {
    if (n < 20) {
      result += ones[n];
    } else if (n >= 70 && n < 80) {
      if (n === 71) {
        result += "soixante et onze";
      } else {
        result += "soixante-" + ones[n - 60];
      }
    } else if (n === 80) {
      result += "quatre-vingts";
    } else if (n >= 81 && n < 100) {
      if (n === 81) {
        result += "quatre-vingt-un";
      } else if (n === 91) {
        result += "quatre-vingt-onze";
      } else {
        result += "quatre-vingt-" + ones[n - 80];
      }
    } else {
      const t = Math.floor(n / 10);
      const o = n % 10;
      if (o === 1) {
        result += tens[t] + " et un";
      } else if (o > 0) {
        result += tens[t] + "-" + ones[o];
      } else {
        result += tens[t];
      }
    }
  }
  
  return result.trim().replace(/\s+/g, " ");
}

export function numberToArabic(n) {
  n = Math.floor(n);
  if (n === 0) return "صفر";
  const ones = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة",
    "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
  const tens = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
  const hundreds = ["", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];

  function group(x) {
    const p = [];
    const h = Math.floor(x / 100), r = x % 100;
    if (h) p.push(hundreds[h]);
    if (r) {
      if (r < 20) p.push(ones[r]);
      else {
        const t = Math.floor(r / 10), o = r % 10;
        p.push(o ? ones[o] + " و" + tens[t] : tens[t]);
      }
    }
    return p.join(" و");
  }

  const parts = [];
  const mil = Math.floor(n / 1000000); n %= 1000000;
  const th = Math.floor(n / 1000); const rest = n % 1000;
  if (mil) {
    if (mil === 1) parts.push("مليون");
    else if (mil === 2) parts.push("مليونان");
    else if (mil <= 10) parts.push(group(mil) + " ملايين");
    else parts.push(group(mil) + " مليون");
  }
  if (th) {
    if (th === 1) parts.push("ألف");
    else if (th === 2) parts.push("ألفان");
    else if (th <= 10) parts.push(group(th) + " آلاف");
    else parts.push(group(th) + " ألف");
  }
  if (rest) parts.push(group(rest));
  return parts.join(" و");
}

export const CHEQUE_MAX_AMOUNT = 10000000;

export function toLatinDigits(value) {
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  return String(value == null ? '' : value)
    .replace(/[٠-٩]/g, digit => String(arabicDigits.indexOf(digit)))
    .replace(/[۰-۹]/g, digit => String(persianDigits.indexOf(digit)));
}

export function parseLocalizedChequeAmount(rawValue) {
  let value = toLatinDigits(rawValue).trim();
  if (!value) return { kind: 'empty', amount: null };

  value = value
    .replace(/\u066B/g, '.')
    .replace(/\u066C/g, ',')
    .replace(/\s*(?:MAD|DH|درهم|دراهم)\s*$/iu, '')
    .replace(/[\s\u00A0\u202F']/g, '')
    .replace(/^\+/, '');

  if (!value || !/^[0-9.,]+$/.test(value)) return { kind: 'invalid', amount: null };

  const commaIndex = value.lastIndexOf(',');
  const dotIndex = value.lastIndexOf('.');
  const hasComma = commaIndex !== -1;
  const hasDot = dotIndex !== -1;
  let integerPart = value;
  let decimalPart = '';

  if (hasComma && hasDot) {
    const decimalIndex = Math.max(commaIndex, dotIndex);
    integerPart = value.slice(0, decimalIndex).replace(/[.,]/g, '');
    decimalPart = value.slice(decimalIndex + 1).replace(/[.,]/g, '');
  } else if (hasComma || hasDot) {
    const sepIndex = hasComma ? commaIndex : dotIndex;
    const after = value.slice(sepIndex + 1);
    const before = value.slice(0, sepIndex);
    const allMatches = value.match(/[.,]/g) || [];

    if (allMatches.length > 1) {
      integerPart = value.replace(/[.,]/g, '');
      decimalPart = '';
    } else if (after.length === 3 && before.length >= 1 && before.length <= 3) {
      integerPart = before + after;
      decimalPart = '';
    } else {
      integerPart = before;
      decimalPart = after;
    }
  }

  if (!/^\d+$/.test(integerPart) || (decimalPart && !/^\d+$/.test(decimalPart))) {
    return { kind: 'invalid', amount: null };
  }

  const centsDigits = (decimalPart + '00').slice(0, 2);
  const parsedCents = parseInt(centsDigits, 10) || 0;
  const parsedUnits = parseInt(integerPart, 10) || 0;
  const amount = parsedUnits + (parsedCents / 100);

  return {
    kind: Number.isFinite(amount) ? 'valid' : 'invalid',
    amount: Number.isFinite(amount) ? amount : null
  };
}

export function formatArabicCurrencyUnit(count, singular, dual, plural, accusative) {
  if (count === 0) return `صفر ${singular}`;
  if (count === 1) return singular;
  if (count === 2) return dual;
  const remainder = count % 100;
  if (remainder >= 3 && remainder <= 10) {
    return `${numberToArabic(count)} ${plural}`;
  }
  return `${numberToArabic(count)} ${accusative}`;
}

export function buildChequeAmountWords(totalCentimes) {
  const integerPart = Math.floor(totalCentimes / 100);
  const decimalPart = totalCentimes % 100;

  let fr = `${numberToFrench(integerPart)} ${integerPart > 1 ? 'dirhams' : 'dirham'}`;
  if (decimalPart > 0) {
    fr += ` et ${numberToFrench(decimalPart)} ${decimalPart > 1 ? 'centimes' : 'centime'}`;
  }
  let ar = formatArabicCurrencyUnit(integerPart, 'درهم', 'درهمان', 'دراهم', 'درهماً');
  if (decimalPart > 0) {
    ar += ` و${formatArabicCurrencyUnit(decimalPart, 'سنتيم', 'سنتيمان', 'سنتيمات', 'سنتيماً')}`;
  }
  return { fr, ar, integerPart, decimalPart };
}

export function updateChequeConverter() {
  const input = document.getElementById('cheque-amount-input');
  if (!input) return;
  const parsed = parseLocalizedChequeAmount(input.value);
  const wordLine = document.getElementById('cheque-value-words');
  const wordLineAr = document.getElementById('cheque-value-words-ar');
  const digitBox = document.getElementById('cheque-value-digits');
  const pronLine = document.getElementById('cheque-pron-line');
  const status = document.getElementById('cheque-amount-status');

  const showEmptyState = (message, isError = false) => {
    if (wordLine) wordLine.innerText = '—';
    if (wordLineAr) wordLineAr.innerText = '—';
    if (digitBox) digitBox.innerText = '# — DH #';
    if (pronLine) pronLine.innerText = '—';
    input.setAttribute('aria-invalid', isError ? 'true' : 'false');
    if (status) {
      status.className = `cheque-amount-status${isError ? ' is-error' : ''}`;
      status.innerText = message;
    }
  };

  if (parsed.kind === 'empty') {
    showEmptyState('أدخل مبلغاً بين 0 و10 000 000 درهم.');
    return;
  }

  if (parsed.kind === 'invalid' || parsed.amount < 0) {
    showEmptyState('صيغة غير صحيحة. استعمل مثلاً 14 850,50 أو 14850.50.', true);
    return;
  }

  const totalCentimes = Math.round(parsed.amount * 100);
  const normalizedAmount = totalCentimes / 100;

  if (normalizedAmount > CHEQUE_MAX_AMOUNT) {
    showEmptyState('المبلغ يتجاوز الحد الأقصى: 10 000 000 درهم.', true);
    return;
  }

  const words = buildChequeAmountWords(totalCentimes);

  if (digitBox) rollValue(digitBox, `# ${normalizedAmount.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} DH #`);
  if (wordLine) wordLine.innerText = words.fr;
  if (wordLineAr) wordLineAr.innerText = words.ar;
  if (pronLine) pronLine.innerText = frWordsToPron(words.fr);
  input.setAttribute('aria-invalid', 'false');
  if (status) {
    status.className = 'cheque-amount-status is-valid';
    status.innerText = `✓ ${normalizedAmount.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} MAD · ${words.integerPart} درهم و${String(words.decimalPart).padStart(2, '0')} سنتيم`;
  }
}


export function setChequeAmount(v) {
  const input = document.getElementById('cheque-amount-input');
  if (input) {
    input.value = Number(v).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    updateChequeConverter();
  }
}

export function setChequeAmountAndSpeak(amount, label) {
  setChequeAmount(amount);
  const wordsEl = document.getElementById('cheque-value-words');
  if (wordsEl && wordsEl.innerText && wordsEl.innerText !== '—') {
    speakFrenchText(wordsEl.innerText);
  }
  showToast(`تم إدخال: ${label || amount} 🔊`);
}

export function normalizeChequeAmountField() {
  const input = document.getElementById('cheque-amount-input');
  if (!input) return;
  const parsed = parseLocalizedChequeAmount(input.value);
  if (parsed.kind === 'valid' && parsed.amount >= 0 && parsed.amount <= CHEQUE_MAX_AMOUNT) {
    input.value = parsed.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    updateChequeConverter();
  }
}

export function randomChequeAmount() {
  const magnitudes = [
    () => Math.floor(Math.random() * 99) + 1,
    () => Math.floor(Math.random() * 900) + 100,
    () => Math.floor(Math.random() * 9000) + 1000,
    () => Math.floor(Math.random() * 90000) + 10000,
    () => Math.floor(Math.random() * 900000) + 100000
  ];
  const integerPart = magnitudes[Math.floor(Math.random() * magnitudes.length)]();
  const centimes = Math.random() > 0.5 ? Math.floor(Math.random() * 100) : 0;
  setChequeAmount((integerPart * 100 + centimes) / 100);
}

export function randomChequeAmountAndSpeak() {
  randomChequeAmount();
  const wordsEl = document.getElementById('cheque-value-words');
  if (wordsEl && wordsEl.innerText && wordsEl.innerText !== '—') {
    speakFrenchText(wordsEl.innerText);
  }
  showToast('مبلغ عشوائي جديد مع نطق فرنسي فوري 🎲🔊');
}

export const BANK_NAMES_MAP = {
  attijari: '🇲🇦 ATTIJARIWAFA BANK · CHÈQUE EN DIRHAMS',
  bp: '🇲🇦 BANQUE POPULAIRE · CHÈQUE EN DIRHAMS',
  boa: '🇲🇦 BANK OF AFRICA (BMCE) · CHÈQUE EN DIRHAMS',
  cih: '🇲🇦 CIH BANK · CHÈQUE EN DIRHAMS',
  cam: '🇲🇦 CRÉDIT AGRICOLE DU MAROC · CHÈQUE EN DIRHAMS',
  sg: '🇲🇦 SOCIÉTÉ GÉNÉRALE MAROC · CHÈQUE EN DIRHAMS'
};

export function updateChequeBank() {
  const sel = document.getElementById('cheque-bank-select');
  const title = document.getElementById('cheque-bank-name');
  if (sel && title) {
    title.innerText = BANK_NAMES_MAP[sel.value] || '🇲🇦 CHÈQUE EN DIRHAMS';
    showToast(`تم تغيير البنك إلى: ${sel.options[sel.selectedIndex].text}`);
  }
}

export function toggleChequeBarre(checked) {
  const lines = document.getElementById('cheque-barre-lines');
  if (lines) {
    lines.style.display = checked ? 'block' : 'none';
    showToast(checked ? 'تم تفعيل التسطير // (شيك غير قابل للصرف نقداً)' : 'تم إلغاء التسطير');
  }
}

export function toggleChequeCertifie(checked) {
  const stamp = document.getElementById('cheque-certifie-stamp');
  if (stamp) {
    if (checked) {
      stamp.classList.remove('hidden');
      void stamp.offsetWidth; // Reflow for animation
      playHaptic([40, 60, 80]); // Heavy slam haptic
    } else {
      stamp.classList.add('hidden');
      playHaptic(20);
    }
    showToast(checked ? 'تم إضافة خاتم التصديق البنكي (Chèque Certifié) 🏛️' : 'تم إلغاء التصديق');
  }
}

export function runNumberDecomposer() {
  const inp = document.getElementById('num-decomposer-input');
  const frEl = document.getElementById('decomp-fr');
  const arEl = document.getElementById('decomp-ar');
  const ruleEl = document.getElementById('decomp-rule');
  if (!inp || !frEl || !arEl || !ruleEl) return;

  const raw = parseInt(inp.value, 10);
  if (isNaN(raw) || raw < 0) {
    frEl.innerText = '—';
    arEl.innerText = '—';
    ruleEl.innerText = 'أدخل عدداً صحيحاً للتحليل.';
    return;
  }

  const fr = numberToFrench(raw);
  const ar = numberToArabic(raw);
  frEl.innerText = fr;
  arEl.innerText = ar;

  // Linguistic rule analysis
  let explanation = '';
  if (raw === 80) {
    explanation = '💡 قاعدة (80): كُتبت «quatre-vingts» مع s لأن (vingt) مضروبة في 4 ولا يليها أي عدد.';
  } else if (raw >= 81 && raw <= 99) {
    const is81 = raw === 81;
    const is91 = raw === 91;
    explanation = `💡 قاعدة (${raw}): سقطت «s» من (quatre-vingt) لأن بعدها عدداً (${is81 || is91 ? 'un/onze' : ''})، ولا نضع «et» في 81 و91!`;
  } else if (raw >= 70 && raw <= 79) {
    explanation = `💡 قاعدة (${raw}): في الفرنسية 70 هي (60 + 10) فنقول: soixante-dix، و71 هي: soixante et onze!`;
  } else if (raw >= 200 && raw % 100 === 0) {
    explanation = `💡 قاعدة (${raw}): كُتبت «cents» مع s لأن (cent) مضروبة في ${raw/100} ولا يليها أي عدد آخر.`;
  } else if (raw > 100 && raw % 100 !== 0 && Math.floor(raw / 100) > 1) {
    explanation = `💡 قاعدة (${raw}): سقطت «s» من (cent) لأن بعدها عدد آخر (${raw % 100}).`;
  } else if (raw >= 1000 && raw < 1000000) {
    explanation = `💡 قاعدة (mille): كلمة «mille» لا تتغير أبداً ولا تأخذ s الجمع إطلاقاً (adjectif numéral invariable).`;
  } else if (raw >= 1000000) {
    explanation = `💡 قاعدة (million): كلمة «million» اسم (nom) وليست صفة عددية، لذلك تأخذ s الجمع دائماً (millions).`;
  } else if ([21, 31, 41, 51, 61, 71].includes(raw)) {
    explanation = `💡 قاعدة (${raw}): نضيف حرف العطف «et» قبل un / onze (مثال: vingt et un · soixante et onze).`;
  } else {
    explanation = `💡 التحليل: عدد قياسي يُكتب بشرطة وصل (trait d'union) بين مكوّناته.`;
  }

  ruleEl.innerText = explanation;

  const resContainer = document.getElementById('decomp-result');
  if (resContainer) {
    resContainer.style.animation = 'none';
    void resContainer.offsetWidth;
    resContainer.style.animation = 'unfoldDecompBox 0.3s var(--ease-out-expo) both';
  }
}

export function speakDecomposedNumber() {
  const fr = document.getElementById('decomp-fr')?.innerText;
  if (fr && fr !== '—') {
    speakFrenchText(fr);
  } else {
    showToast('أدخل عدداً أولاً للاستماع إليه');
  }
}

export function updateChequeDetails() {
  const payeeInput = document.getElementById('cheque-payee-input');
  const placeInput = document.getElementById('cheque-place-input');
  const dateInput = document.getElementById('cheque-date-input');
  const payee = (payeeInput?.value || '').trim() || '—';
  const place = (placeInput?.value || '').trim() || '—';
  let formattedDate = '--/--/----';
  if (dateInput?.value) {
    const [year, month, day] = dateInput.value.split('-');
    if (year && month && day) formattedDate = `${day}/${month}/${year}`;
  }
  const pEl = document.getElementById('cheque-payee');
  const plEl = document.getElementById('cheque-place');
  const dEl = document.getElementById('cheque-date');
  if (pEl) pEl.innerText = payee;
  if (plEl) plEl.innerText = place;
  if (dEl) dEl.innerText = formattedDate;
}

export async function writeChequeClipboard(text) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('copy failed');
}

export function copyChequeText(mode = 'fr') {
  const fr = document.getElementById('cheque-value-words')?.innerText;
  const ar = document.getElementById('cheque-value-words-ar')?.innerText;
  const digits = document.getElementById('cheque-value-digits')?.innerText;
  if (!fr || fr === '—') { showToast('أدخل مبلغاً صحيحاً أولاً'); return; }
  const text = mode === 'all'
    ? `${digits}\nFR: ${fr}\nAR: ${ar}\nBénéficiaire: ${document.getElementById('cheque-payee')?.innerText}\nLieu et date: ${document.getElementById('cheque-place')?.innerText}, ${document.getElementById('cheque-date')?.innerText}`
    : fr;
  writeChequeClipboard(text)
    .then(() => showToast(mode === 'all' ? 'تم نسخ بيانات النموذج! 🧾' : 'تم نسخ المبلغ بالفرنسية! 📋'))
    .catch(() => showToast('تعذّر النسخ'));
}

export function resetChequeEditor() {
  const amt = document.getElementById('cheque-amount-input');
  if (amt) amt.value = '';
  const payee = document.getElementById('cheque-payee-input');
  if (payee) payee.value = 'STE TRAVAUX MAROC SARL';
  const place = document.getElementById('cheque-place-input');
  if (place) place.value = 'Casablanca';
  const d = new Date();
  const dateInp = document.getElementById('cheque-date-input');
  if (dateInp) dateInp.value = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  updateChequeDetails();
  updateChequeConverter();
  if (amt) amt.focus();
}

export function speakChequeText(btnEl) {
  const txt = document.getElementById('cheque-value-words')?.innerText;
  if (txt && txt !== '—') {
    speakFrenchText(txt, btnEl);
  } else {
    showToast('أدخل مبلغاً أولاً للاستماع إليه');
  }
}

export function speakNumberCard(n, fr, cardEl) {
  if (cardEl && cardEl.classList) {
    document.querySelectorAll('.num-card.is-speaking').forEach(c => c.classList.remove('is-speaking'));
    cardEl.classList.add('is-speaking');
    setTimeout(() => {
      cardEl.classList.remove('is-speaking');
    }, 1500);
  }
  speakFrenchText(fr, cardEl);
  showToast(`${n} = ${fr} 🔊`);
}

export function switchChequesSubTab(viewId, btnEl) {
  const allBtns = document.querySelectorAll('.cheques-subtab-btn');
  const allViews = document.querySelectorAll('.cheques-subview');
  
  allBtns.forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  allViews.forEach(v => {
    v.classList.add('hidden');
    v.classList.remove('active');
  });

  const targetView = document.getElementById(`cheques-view-${viewId}`);
  const targetBtn = btnEl || document.getElementById(`subtab-btn-cheque-${viewId}`);

  if (targetBtn) {
    targetBtn.classList.add('active');
    targetBtn.setAttribute('aria-selected', 'true');
  }
  if (targetView) {
    targetView.classList.remove('hidden');
    targetView.classList.add('active');
  }
}

export function testNumberInCheque(n) {
  switchChequesSubTab('editor');
  const cleanN = String(n).replace(/[\s\u00A0DH]/g, '').replace(/,/g, '.');
  const parsed = parseFloat(cleanN);
  if (!isNaN(parsed) && parsed > 0) {
    setChequeAmountAndSpeak(parsed, `${n} DH`);
  } else {
    showToast(`تم اختيار: ${n}`);
  }
  const editorEl = document.querySelector('.cheque-editor-panel');
  if (editorEl) {
    editorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    window.scrollTo({ top: document.getElementById('tab-cheques')?.offsetTop || 0, behavior: 'smooth' });
  }
}

function readNumberGameBest() {
  try { return parseInt(localStorage.getItem('btp_numgame_best') || '0', 10) || 0; }
  catch (error) { return 0; }
}

export const numGame = {
  mode: 'read', level: 'medium', count: 10, target: 0, lastTarget: null,
  right: 0, total: 0, streak: 0, best: readNumberGameBest(), answered: false,
  isSpeedRun: false, timer: 60, interval: null, autoAdvanceTimer: null
};

export function numGameRandom(level) {
  if (level === 'complex') {
    // 70s, 80s, 90s complex numbers
    const complexBases = [70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 85, 88, 90, 91, 92, 95, 98, 99];
    const base = complexBases[Math.floor(Math.random() * complexBases.length)];
    const scale = Math.random() > 0.5 ? 1 : (Math.random() > 0.5 ? 100 : 1000);
    return scale === 1 ? base : (Math.floor(Math.random() * 9) + 1) * scale + base;
  }
  if (level === 'easy') return Math.floor(Math.random() * 100);
  if (level === 'medium') return Math.floor(Math.random() * 9900) + 100;
  const pick = Math.random();
  if (pick < 0.5) return Math.floor(Math.random() * 90000) + 10000;
  if (pick < 0.85) return Math.floor(Math.random() * 900000) + 100000;
  return Math.floor(Math.random() * 1000000) + 1000000;
}

export function numGameHud() {
  const scoreEl = document.getElementById('num-game-score');
  const streakEl = document.getElementById('num-game-streak');
  const bestEl = document.getElementById('num-game-best');
  if (scoreEl) scoreEl.innerText = `✅ ${numGame.right} / ${numGame.total}`;
  if (streakEl) streakEl.innerText = `🔥 ${numGame.streak}`;
  if (bestEl) bestEl.innerText = `🏆 أفضل متتالية: ${numGame.best}`;
  const accuracy = numGame.total ? Math.round((numGame.right / numGame.total) * 100) : 0;
  const displayedQuestion = numGame.answered ? Math.max(1, numGame.total) : Math.min(numGame.total + 1, numGame.count);
  const counterEl = document.getElementById('num-game-counter');
  const accEl = document.getElementById('num-game-accuracy');
  if (counterEl) counterEl.innerText = `السؤال ${displayedQuestion} / ${numGame.count}`;
  if (accEl) accEl.innerText = `الدقة ${accuracy}%`;
  const progress = document.getElementById('num-game-progress');
  const progressFill = document.getElementById('num-game-progress-fill');
  if (progress) {
    progress.setAttribute('aria-valuemax', String(numGame.count));
    progress.setAttribute('aria-valuenow', String(numGame.total));
  }
  if (progressFill) progressFill.style.width = `${Math.min(100, (numGame.total / numGame.count) * 100)}%`;
}

export function startNumGamePreset(presetType) {
  if (numGame.interval) clearInterval(numGame.interval);
  if (numGame.autoAdvanceTimer) clearTimeout(numGame.autoAdvanceTimer);
  numGame.isSpeedRun = false;

  if (presetType === 'complex708090') {
    numGame.mode = 'read';
    numGame.level = 'complex';
    numGame.count = 10;
  } else if (presetType === 'speedrun60s' || presetType === 'speed60') {
    numGame.mode = 'read';
    numGame.level = 'medium';
    numGame.count = 50;
    numGame.isSpeedRun = true;
    numGame.timer = 60;
  } else if (presetType === 'dictation') {
    numGame.mode = 'audio';
    numGame.level = 'medium';
    numGame.count = 10;
  } else if (presetType === 'invoices') {
    numGame.mode = 'write';
    numGame.level = 'hard';
    numGame.count = 10;
  }

  numGame.right = 0; numGame.total = 0; numGame.streak = 0; numGame.lastTarget = null; numGame.answered = false;
  document.getElementById('num-game-config')?.classList.add('hidden');
  document.getElementById('num-game-result')?.classList.add('hidden');
  document.getElementById('num-game-play')?.classList.remove('hidden');

  const timerBadge = document.getElementById('num-game-timer-badge');
  if (timerBadge) {
    if (numGame.isSpeedRun) {
      timerBadge.classList.remove('hidden');
      timerBadge.innerText = `⏱️ ${numGame.timer}s`;
      numGame.interval = setInterval(() => {
        numGame.timer--;
        timerBadge.innerText = `⏱️ ${numGame.timer}s`;
        if (numGame.timer <= 10) timerBadge.classList.add('timer-danger');
        if (numGame.timer <= 0) {
          clearInterval(numGame.interval);
          finishNumGame();
        }
      }, 1000);
    } else {
      timerBadge.classList.add('hidden');
    }
  }

  numGameHud();
  newNumQuestion();
}

export function startNumGame() {
  if (numGame.interval) clearInterval(numGame.interval);
  if (numGame.autoAdvanceTimer) clearTimeout(numGame.autoAdvanceTimer);
  numGame.mode = document.getElementById('num-game-mode')?.value || 'read';
  numGame.level = document.getElementById('num-game-level')?.value || 'medium';
  numGame.count = parseInt(document.getElementById('num-game-count')?.value, 10) || 10;
  numGame.right = 0; numGame.total = 0; numGame.streak = 0; numGame.lastTarget = null; numGame.answered = false;
  numGame.isSpeedRun = false;

  const timerBadge = document.getElementById('num-game-timer-badge');
  if (timerBadge) timerBadge.classList.add('hidden');

  document.getElementById('num-game-config')?.classList.add('hidden');
  document.getElementById('num-game-result')?.classList.add('hidden');
  document.getElementById('num-game-play')?.classList.remove('hidden');
  numGameHud();
  newNumQuestion();
}

export function stopNumGame() {
  if (numGame.interval) clearInterval(numGame.interval);
  if (numGame.autoAdvanceTimer) clearTimeout(numGame.autoAdvanceTimer);
  document.getElementById('num-game-play')?.classList.add('hidden');
  document.getElementById('num-game-config')?.classList.remove('hidden');
  document.getElementById('num-game-result')?.classList.add('hidden');
}

export function newNumQuestion() {
  if (numGame.autoAdvanceTimer) clearTimeout(numGame.autoAdvanceTimer);
  if (numGame.total >= numGame.count) { finishNumGame(); return; }
  numGame.answered = false;
  let target = numGameRandom(numGame.level);
  while (target === numGame.lastTarget && target !== 0) {
    target = numGameRandom(numGame.level);
  }
  numGame.target = target;
  numGame.lastTarget = target;
  const fr = numberToFrench(target);

  const qType = document.getElementById('num-game-qtype');
  const targetEl = document.getElementById('num-game-target');
  const promptEl = document.getElementById('num-game-prompt');
  const inputEl = document.getElementById('num-game-input');
  const optsEl = document.getElementById('num-game-options');
  const checkBtn = document.getElementById('num-game-check');
  const fb = document.getElementById('num-game-feedback');
  const nextBtn = document.getElementById('num-game-next');

  if (fb) fb.classList.add('hidden');
  if (nextBtn) nextBtn.classList.add('hidden');
  if (inputEl) { inputEl.value = ''; inputEl.classList.add('hidden'); }
  if (optsEl) { optsEl.innerHTML = ''; optsEl.classList.add('hidden'); }
  if (checkBtn) checkBtn.classList.add('hidden');

  if (numGame.mode === 'read') {
    if (qType) qType.innerText = '🔢 اقرأ الرقم واختر كتابته الصحيحة بالفرنسية:';
    if (targetEl) targetEl.innerText = `${target.toLocaleString('fr-FR')} DH`;
    if (promptEl) promptEl.innerText = `${numberToArabic(target)} درهم`;
    if (optsEl) optsEl.classList.remove('hidden');

    const opts = new Set([fr]);
    const tweaks = [1, -1, 10, -10, 100, -100, 1000, -1000, 2, -2, 20, 200];
    let guardLoop = 0;
    while (opts.size < 4 && guardLoop < 60) {
      const t = numGame.target + tweaks[Math.floor(Math.random() * tweaks.length)];
      if (t >= 0) opts.add(numberToFrench(t));
      guardLoop++;
    }
    if (optsEl) {
      shuffleArray([...opts]).forEach(o => {
        const b = document.createElement('button');
        b.className = 'quiz-option-btn';
        b.style.direction = 'ltr';
        b.innerText = o;
        b.onclick = () => pickNumOption(o, b, fr);
        optsEl.appendChild(b);
      });
    }
  } else if (numGame.mode === 'audio') {
    if (qType) qType.innerText = '🔊 استمع للمبلغ الفرنسي واكتبه أو اختر رقمه:';
    if (targetEl) {
      const replayBtn = document.createElement('button');
      replayBtn.type = 'button';
      replayBtn.className = 'btn-primary';
      replayBtn.style.cssText = 'font-size:16px; padding:10px 24px; border-radius:12px;';
      replayBtn.textContent = '🔊 استمع للمبلغ مرة أخرى';
      replayBtn.addEventListener('click', () => speakFrenchText(fr));
      targetEl.replaceChildren(replayBtn);
    }
    if (promptEl) promptEl.innerText = 'انقر على الزر للاستماع';
    speakFrenchText(fr);
    if (optsEl) optsEl.classList.remove('hidden');

    const opts = new Set([target]);
    const tweaks = [1, -1, 10, -10, 100, -100, 1000, -1000, 20, 200];
    let guardLoop = 0;
    while (opts.size < 4 && guardLoop < 60) {
      const t = numGame.target + tweaks[Math.floor(Math.random() * tweaks.length)];
      if (t >= 0) opts.add(t);
      guardLoop++;
    }
    if (optsEl) {
      shuffleArray([...opts]).forEach(num => {
        const b = document.createElement('button');
        b.className = 'quiz-option-btn';
        b.style.direction = 'ltr';
        b.innerText = `${num.toLocaleString('fr-FR')} DH`;
        b.onclick = () => pickNumOption(numberToFrench(num), b, fr);
        optsEl.appendChild(b);
      });
    }
  } else if (numGame.mode === 'write') {
    if (qType) qType.innerText = '✍️ اكتب المبلغ بالأرقام أو الفرنسية في الحقل أدناه:';
    if (targetEl) targetEl.innerText = `${target.toLocaleString('fr-FR')} DH`;
    if (promptEl) promptEl.innerText = `المطلوب كتابة: "${fr}" بالفرنسية`;
    if (inputEl) {
      inputEl.classList.remove('hidden');
      inputEl.placeholder = 'اكتب المبلغ بالفرنسية هنا (مثال: cent dirhams)...';
      inputEl.focus();
    }
    if (checkBtn) checkBtn.classList.remove('hidden');
  }
}

export function numGameResolve(isCorrect, correctFr) {
  if (numGame.answered) return;
  numGame.answered = true;
  numGame.total++;
  if (isCorrect) { numGame.right++; numGame.streak++; }
  else numGame.streak = 0;
  if (numGame.streak > numGame.best) {
    numGame.best = numGame.streak;
    try { localStorage.setItem('btp_numgame_best', String(numGame.best)); }
    catch (error) { /* Progress remains available for the current session. */ }
  }
  numGameHud();
  const fb = document.getElementById('num-game-feedback');
  if (fb) {
    fb.className = 'quiz-feedback ' + (isCorrect ? 'fb-correct' : 'fb-wrong');
    fb.innerHTML =
      `<div class="fb-head">${isCorrect ? (numGame.streak > 2 ? `🔥 متتالية x${numGame.streak}! إجابة صحيحة` : '✅ إجابة صحيحة') : '❌ إجابة خاطئة — الصيغة الصحيحة:'}</div>` +
      `<div class="fb-word"><span class="fb-fr">${numGame.target.toLocaleString('fr-FR')} DH</span> = <span class="fb-fr">${correctFr}</span></div>` +
      `<div class="fb-pron">[ ${frWordsToPron(correctFr)} ]</div>` +
      `<div class="fb-ar">${numberToArabic(numGame.target)} درهم</div>` +
      `<div class="fb-actions" style="margin-top:8px;">` +
        `<button class="fb-action-btn" type="button" onclick="speakFrenchText('${correctFr.replace(/'/g, "\\'")}')">🔊 استمع</button>` +
      `</div>`;
    fb.classList.remove('hidden');
  }
  const nextButton = document.getElementById('num-game-next');
  if (nextButton) {
    nextButton.innerText = numGame.total >= numGame.count ? 'عرض النتيجة / Résultat' : 'التالي / Suivant ↗';
    nextButton.classList.remove('hidden');
  }

  // Instant Auto-advance on correct answers after 850ms
  if (isCorrect) {
    numGame.autoAdvanceTimer = setTimeout(() => {
      newNumQuestion();
    }, 850);
  }
}

export function checkNumInput() {
  if (numGame.answered) return;
  const inputEl = document.getElementById('num-game-input');
  if (!inputEl) return;
  const val = inputEl.value.trim().toLowerCase();
  const correctFr = numberToFrench(numGame.target).toLowerCase();
  const isCorrect = val === correctFr || val === String(numGame.target) || val === `${numGame.target} dh`;
  numGameResolve(isCorrect, correctFr);
}

export function handleNumGameInputKey(event) {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  if (numGame.answered) newNumQuestion();
  else checkNumInput();
}

export function pickNumOption(chosen, btnEl, correctFr) {
  if (numGame.answered) return;
  const isCorrect = chosen === correctFr;
  const allBtns = document.querySelectorAll('#num-game-options .quiz-option-btn');
  allBtns.forEach(b => {
    b.disabled = true;
    if (b.innerText === correctFr) b.classList.add('correct');
  });
  if (!isCorrect && btnEl) btnEl.classList.add('wrong');
  numGameResolve(isCorrect, correctFr);
}

export function finishNumGame() {
  if (numGame.interval) clearInterval(numGame.interval);
  if (numGame.autoAdvanceTimer) clearTimeout(numGame.autoAdvanceTimer);
  const accuracy = numGame.total ? Math.round((numGame.right / numGame.total) * 100) : 0;
  document.getElementById('num-game-play')?.classList.add('hidden');
  const result = document.getElementById('num-game-result');
  if (result) {
    result.classList.remove('hidden');
    const scoreEl = document.getElementById('num-game-result-score');
    const accEl = document.getElementById('num-game-result-accuracy');
    const bestEl = document.getElementById('num-game-result-best');
    const msgEl = document.getElementById('num-game-result-message');
    if (scoreEl) scoreEl.innerText = `${numGame.right}/${numGame.total}`;
    if (accEl) accEl.innerText = `${accuracy}%`;
    if (bestEl) bestEl.innerText = String(numGame.best);
    if (msgEl) {
      msgEl.innerText = accuracy >= 80
        ? 'ممتاز جداً! أداء رائع في سرعة ودقة كتابة وقراءة الأرقام 👏'
        : accuracy >= 50
          ? 'نتيجة جيدة. واصل التدريب على تراكيب 70 و80 و90.'
          : 'أعد الجلسة بعد مراجعة جدول الأرقام وقواعد الكتابة.';
    }
    result.focus();
  }
}

export const REFERENCE_AMOUNTS_DATA = [
  // أجور ويوميات (wages)
  { amt: 150, cat: 'wages', catLabel: 'أجور ويوميات 👷', desc: 'أجرة يومية لمساعد بناء (Manoeuvre)' },
  { amt: 250, cat: 'wages', catLabel: 'أجور ويوميات 👷', desc: 'يومية بناي أو حداد تسليح مؤهل (Maçon / Ferrailleur)' },
  { amt: 3500, cat: 'wages', catLabel: 'أجور ويوميات 👷', desc: 'راتب شهري لسائق آليات أو عامل مؤهل (Conducteur d\'engins)' },
  { amt: 6500, cat: 'wages', catLabel: 'أجور ويوميات 👷', desc: 'راتب شهري لمساعد رئيس الورش (Aide Conducteur)' },

  // مواد وعتاد (materials)
  { amt: 1000, cat: 'materials', catLabel: 'مواد وعتاد 🔩', desc: 'تسبيق شراء عتاد يدوي ومعدات حماية شخصية (EPI)' },
  { amt: 5400, cat: 'materials', catLabel: 'مواد وعتاد 🔩', desc: 'فاتورة خشب نجارة وقوالب خرسانة (Bois de coffrage)' },
  { amt: 14850.50, cat: 'materials', catLabel: 'مواد وعتاد 🔩', desc: 'فاتورة حديد تسليح عالي الالتصاق FeE500 (15 طن)' },
  { amt: 22400, cat: 'materials', catLabel: 'مواد وعتاد 🔩', desc: 'فاتورة كراء مضخة الخرسانة وكرين (Location Grue à tour)' },
  { amt: 38000, cat: 'materials', catLabel: 'مواد وعتاد 🔩', desc: 'خرسانة جاهزة B25 لمضخة السقف (Dalle en béton armé)' },
  { amt: 64200, cat: 'materials', catLabel: 'مواد وعتاد 🔩', desc: 'فاتورة قرميد وأنابيب الصرف الصحي PVC' },

  // دراسات وتجارب (studies)
  { amt: 500, cat: 'studies', catLabel: 'دراسات وتجارب 🏛️', desc: 'مسح طوبوغرافي لتثبيت المحاور والنقط (Implantation)' },
  { amt: 8000, cat: 'studies', catLabel: 'دراسات وتجارب 🏛️', desc: 'دفعة أتعاب مكتب الدراسات التقنية (Bureau d\'études - BET)' },
  { amt: 12500, cat: 'studies', catLabel: 'دراسات وتجارب 🏛️', desc: 'تجارب مختبر LPEE لمقاومة الخرسانة وتجارب التربة' },
  { amt: 18000, cat: 'studies', catLabel: 'دراسات وتجارب 🏛️', desc: 'أتعاب مكتب المراقبة التقنية (Bureau de contrôle)' },
  { amt: 45000, cat: 'studies', catLabel: 'دراسات وتجارب 🏛️', desc: 'أتعاب المهندس المعماري لمتابعة الأشغال' },

  // صفقات وكشوفات (contracts)
  { amt: 45000, cat: 'contracts', catLabel: 'صفقات وكشوفات 🏢', desc: 'دفعة مقاول الباطن لأشغال الكهرباء والترصيص' },
  { amt: 95400, cat: 'contracts', catLabel: 'صفقات وكشوفات 🏢', desc: 'كشف حسابي لأشغال التشطيبات والجليز والصباغة' },
  { amt: 175000, cat: 'contracts', catLabel: 'صفقات وكشوفات 🏢', desc: 'كشف حسابي شهري للأشغال الكبرى (Décompte mensuel n°3)' },
  { amt: 250000, cat: 'contracts', catLabel: 'صفقات وكشوفات 🏢', desc: 'دفعة إنجاز الهيكل الخرساني والأساسات (Gros œuvres)' },
  { amt: 1200000, cat: 'contracts', catLabel: 'صفقات وكشوفات 🏢', desc: 'صفقة بناء عمارة سكنية R+4 مع قبو' },
  { amt: 4500000, cat: 'contracts', catLabel: 'صفقات وكشوفات 🏢', desc: 'صفقة تهيئة وتعبيد مسلك طرقي (Terrassement & Chaussée)' },

  // كفالات وضمانات (guarantees)
  { amt: 15000, cat: 'guarantees', catLabel: 'كفالات وضمانات 🛡️', desc: 'الضمانة البنكية المؤقتة لطلب عروض (Caution provisoire)' },
  { amt: 35000, cat: 'guarantees', catLabel: 'كفالات وضمانات 🛡️', desc: 'الضمانة النهائية للصفقة 3% (Caution définitive)' },
  { amt: 70000, cat: 'guarantees', catLabel: 'كفالات وضمانات 🛡️', desc: 'اقتطاع الضمان النهائي 10% (Retenue de garantie)' }
];

let activeNumbersFilter = 'all';
let activeNumbersSearch = '';
let activeRefCategory = 'all';
let activeRefSearch = '';

export function renderReferenceNumbersTable(category, search) {
  category = category !== undefined ? category : activeRefCategory;
  search = search !== undefined ? search : activeRefSearch;
  activeRefCategory = category;
  activeRefSearch = search;

  const tbody = document.getElementById('cheques-ref-table-body');
  if (!tbody) return;

  const normalizedSearch = (search || '').trim().toLowerCase();

  const filtered = REFERENCE_AMOUNTS_DATA.filter(item => {
    const matchCat = category === 'all' || item.cat === category;
    if (!matchCat) return false;
    if (!normalizedSearch) return true;
    const fr = numberToFrench(item.amt).toLowerCase();
    const ar = numberToArabic(item.amt);
    const amtStr = String(item.amt);
    const desc = (item.desc || '').toLowerCase();
    return amtStr.includes(normalizedSearch) ||
      fr.includes(normalizedSearch) ||
      ar.includes(normalizedSearch) ||
      desc.includes(normalizedSearch);
  });

  const countBadge = document.getElementById('cheques-ref-count');
  if (countBadge) {
    countBadge.innerText = `${filtered.length} مبلغاً`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:36px 16px; color:var(--text-muted); background:rgba(15,23,42,0.4); border-radius:12px;">
      <div style="font-size:26px; margin-bottom:6px;">🔍</div>
      <div style="font-weight:700; color:#f8fafc; font-size:14px;">لا توجد مبالغ أو فواتير مطابقة لبحثك</div>
      <div style="font-size:11.5px; margin-top:4px; color:var(--text-muted);">جرّب كتابة مبلغ رقمي (مثال: 5400) أو كلمة فرنسية (مثال: caution, ferrailleur)</div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(item => {
    const totalCentimes = Math.round(item.amt * 100);
    const words = buildChequeAmountWords(totalCentimes);
    const formattedDigits = item.amt.toLocaleString('fr-FR', {
      minimumFractionDigits: item.amt % 1 !== 0 ? 2 : 0,
      maximumFractionDigits: 2
    });
    const pron = frWordsToPron(words.fr);

    return `<tr class="ref-row-item">
      <td class="cell-amount" data-label="المبلغ">
        <div class="ref-amount-badge">
          <span class="ref-amount-val">${escapeHtml(formattedDigits)}</span>
          <span class="ref-amount-cur">MAD</span>
        </div>
        <span class="ref-cat-pill cat-${item.cat} ref-cat-mobile-pill">${escapeHtml(item.catLabel)}</span>
      </td>
      <td class="cell-french" data-label="بالفرنسية">
        <div class="ref-french-title">${escapeHtml(words.fr)}</div>
        <div class="ref-pron-sub">[ ${escapeHtml(pron)} ]</div>
        <div class="ref-desc-sub">${escapeHtml(item.desc)}</div>
      </td>
      <td class="cell-arabic" data-label="بالعربية">
        <div class="ref-arabic-title">${escapeHtml(words.ar)}</div>
      </td>
      <td class="cell-category" data-label="التصنيف">
        <span class="ref-cat-pill cat-${item.cat}">${escapeHtml(item.catLabel)}</span>
      </td>
      <td class="cell-actions" data-label="الإجراءات">
        <div class="ref-actions-group">
          <button type="button" class="ref-icon-btn" data-ref-speak="${escapeHtml(words.fr)}" title="استمع للنطق">
            <span aria-hidden="true">🔊</span>
            <span class="btn-txt-mobile">استمع</span>
          </button>
          <button type="button" class="ref-icon-btn" data-ref-copy="${escapeHtml(words.fr)}" title="نسخ المبلغ">
            <span aria-hidden="true">📋</span>
            <span class="btn-txt-mobile">نسخ</span>
          </button>
          <button type="button" class="ref-icon-btn gold" data-ref-try="${Number(item.amt)}" title="تجربة في محاكي الشيك">
            <span aria-hidden="true">✏️</span>
            <span class="btn-txt-mobile">جرب بالشيك</span>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('[data-ref-speak]').forEach(b =>
    b.addEventListener('click', () => speakFrenchText(b.dataset.refSpeak)));
  tbody.querySelectorAll('[data-ref-copy]').forEach(b =>
    b.addEventListener('click', () => copyChequeTextDirect(b.dataset.refCopy)));
  tbody.querySelectorAll('[data-ref-try]').forEach(b =>
    b.addEventListener('click', () => testNumberInCheque(Number(b.dataset.refTry))));
}

export function setRefTableCategory(cat, btnEl) {
  document.querySelectorAll('#cheques-ref-filter-bar .lvl-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderReferenceNumbersTable(cat, activeRefSearch);
}

export function filterReferenceTableLive() {
  const inp = document.getElementById('cheques-ref-search');
  const q = inp ? inp.value : '';
  renderReferenceNumbersTable(activeRefCategory, q);
}

export function copyChequeTextDirect(text) {
  writeChequeClipboard(text)
    .then(() => showToast('تم نسخ المبلغ بالفرنسية! 📋'))
    .catch(() => showToast('تعذّر النسخ'));
}

export const NUMBER_GROUP_LABELS = {
  units: 'وحدات',
  tens: 'عشرات',
  complex: '70·80·90',
  big: 'مئات وآلاف',
  ordinals: 'طوابق 🏢',
  btp_math: 'نسب BTP 📐'
};

export function renderNumbersChart(filter, search) {
  filter = filter !== undefined ? filter : activeNumbersFilter;
  search = search !== undefined ? search : activeNumbersSearch;
  activeNumbersFilter = filter;
  activeNumbersSearch = search;

  const grid = document.getElementById('numbers-chart-grid');
  if (!grid) return;

  const normalizedSearch = (search || '').trim().toLowerCase();

  const filtered = NUMBERS_DATA.filter(item => {
    const matchGroup = filter === 'all' || item.g === filter;
    if (!matchGroup) return false;
    if (!normalizedSearch) return true;
    return String(item.n).toLowerCase().includes(normalizedSearch) ||
      item.fr.toLowerCase().includes(normalizedSearch) ||
      item.ar.includes(normalizedSearch) ||
      item.pron.includes(normalizedSearch);
  });

  const countBadge = document.getElementById('num-library-count');
  if (countBadge) {
    countBadge.innerText = `${filtered.length} رقماً`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:32px 16px; color:var(--text-muted); background:rgba(15,23,42,0.4); border-radius:12px; border:1px dashed rgba(255,255,255,0.1);">
      <div style="font-size:24px; margin-bottom:6px;">🔍</div>
      <div style="font-weight:600;">لا توجد أرقام مطابقة لبحثك</div>
      <div style="font-size:11px; margin-top:4px;">جرّب كتابة رقم بالأرقام (مثال: 80) أو بالحروف (مثال: cent)</div>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map(x => {
    const groupBadge = NUMBER_GROUP_LABELS[x.g] || x.g;
    return `
    <div class="num-card" data-num-n="${escapeHtml(String(x.n))}" data-num-fr="${escapeHtml(x.fr)}" role="button" tabindex="0">
      <div class="num-card-top">
        <bdi class="num-digit" dir="ltr">${escapeHtml(String(x.n))}</bdi>
        <span class="ref-cat-pill cat-${x.g}">${escapeHtml(groupBadge)}</span>
        <button type="button" class="num-speaker-pill-btn" data-num-speak title="استمع">🔊</button>
      </div>
      <div class="num-fr">${escapeHtml(x.fr)}</div>
      <div class="num-pron">[ ${escapeHtml(x.pron)} ]</div>
      <div class="num-ar">${escapeHtml(x.ar)}</div>
      <div class="num-card-actions">
        <button type="button" class="num-try-btn" data-num-try="${escapeHtml(String(x.n))}">جرب بالشيك ✏️</button>
        <button type="button" class="num-copy-btn" data-num-copy="${escapeHtml(x.fr)}" title="نسخ الكلمة">📋</button>
      </div>
    </div>`;
  }).join('');

  grid.querySelectorAll('.num-card').forEach(card => {
    const speakCard = () => speakNumberCard(card.dataset.numN, card.dataset.numFr, card);
    card.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      speakCard();
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        speakCard();
      }
    });
  });
  grid.querySelectorAll('[data-num-speak]').forEach(b =>
    b.addEventListener('click', () => {
      const card = b.closest('.num-card');
      speakNumberCard(card.dataset.numN, card.dataset.numFr, card);
    }));
  grid.querySelectorAll('[data-num-try]').forEach(b =>
    b.addEventListener('click', () => testNumberInCheque(b.dataset.numTry)));
  grid.querySelectorAll('[data-num-copy]').forEach(b =>
    b.addEventListener('click', () => copyChequeTextDirect(b.dataset.numCopy)));
}

export function setNumbersFilter(f, btnEl) {
  document.querySelectorAll('#num-filter-bar .lvl-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderNumbersChart(f, activeNumbersSearch);
}

export function filterNumbersChartLive() {
  const inp = document.getElementById('num-library-search');
  const q = inp ? inp.value : '';
  renderNumbersChart(activeNumbersFilter, q);
}

if (typeof window !== 'undefined') {
  window.numberToFrench = numberToFrench;
  window.numberToArabic = numberToArabic;
  window.parseLocalizedChequeAmount = parseLocalizedChequeAmount;
  window.buildChequeAmountWords = buildChequeAmountWords;
  window.updateChequeConverter = updateChequeConverter;
  window.setChequeAmount = setChequeAmount;
  window.setChequeAmountAndSpeak = setChequeAmountAndSpeak;
  window.normalizeChequeAmountField = normalizeChequeAmountField;
  window.randomChequeAmount = randomChequeAmount;
  window.randomChequeAmountAndSpeak = randomChequeAmountAndSpeak;
  window.updateChequeDetails = updateChequeDetails;
  window.updateChequeBank = updateChequeBank;
  window.toggleChequeBarre = toggleChequeBarre;
  window.toggleChequeCertifie = toggleChequeCertifie;
  window.runNumberDecomposer = runNumberDecomposer;
  window.speakDecomposedNumber = speakDecomposedNumber;
  window.writeChequeClipboard = writeChequeClipboard;
  window.copyChequeText = copyChequeText;
  window.copyChequeTextDirect = copyChequeTextDirect;
  window.resetChequeEditor = resetChequeEditor;
  window.speakChequeText = speakChequeText;
  window.speakNumberCard = speakNumberCard;
  window.testNumberInCheque = testNumberInCheque;
  window.numGame = numGame;
  window.startNumGamePreset = startNumGamePreset;
  window.startNumGame = startNumGame;
  window.stopNumGame = stopNumGame;
  window.newNumQuestion = newNumQuestion;
  window.checkNumInput = checkNumInput;
  window.handleNumGameInputKey = handleNumGameInputKey;
  window.pickNumOption = pickNumOption;
  window.finishNumGame = finishNumGame;
  window.renderReferenceNumbersTable = renderReferenceNumbersTable;
  window.setRefTableCategory = setRefTableCategory;
  window.filterReferenceTableLive = filterReferenceTableLive;
  window.renderNumbersChart = renderNumbersChart;
  window.setNumbersFilter = setNumbersFilter;
  window.filterNumbersChartLive = filterNumbersChartLive;
  window.switchChequesSubTab = switchChequesSubTab;
}

