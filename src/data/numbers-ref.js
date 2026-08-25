export const NUMBERS_DATA = [
  // 0 - 20: Units and Teens
  { n: "0", fr: "zéro", pron: "زيرو", ar: "صفر", g: "units" },
  { n: "1", fr: "un", pron: "آن", ar: "واحد", g: "units" },
  { n: "2", fr: "deux", pron: "دو", ar: "اثنان", g: "units" },
  { n: "3", fr: "trois", pron: "تروا", ar: "ثلاثة", g: "units" },
  { n: "4", fr: "quatre", pron: "كاتر", ar: "أربعة", g: "units" },
  { n: "5", fr: "cinq", pron: "سانك", ar: "خمسة", g: "units" },
  { n: "6", fr: "six", pron: "سيس", ar: "ستة", g: "units" },
  { n: "7", fr: "sept", pron: "سيت", ar: "سبعة", g: "units" },
  { n: "8", fr: "huit", pron: "ويت", ar: "ثمانية", g: "units" },
  { n: "9", fr: "neuf", pron: "نوف", ar: "تسعة", g: "units" },
  { n: "10", fr: "dix", pron: "ديس", ar: "عشرة", g: "units" },
  { n: "11", fr: "onze", pron: "أونز", ar: "أحد عشر", g: "units" },
  { n: "12", fr: "douze", pron: "دوز", ar: "اثنا عشر", g: "units" },
  { n: "13", fr: "treize", pron: "تريز", ar: "ثلاثة عشر", g: "units" },
  { n: "14", fr: "quatorze", pron: "كاتورز", ar: "أربعة عشر", g: "units" },
  { n: "15", fr: "quinze", pron: "كانز", ar: "خمسة عشر", g: "units" },
  { n: "16", fr: "seize", pron: "سيز", ar: "ستة عشر", g: "units" },
  { n: "17", fr: "dix-sept", pron: "ديس-سيت", ar: "سبعة عشر", g: "units" },
  { n: "18", fr: "dix-huit", pron: "ديز-ويت", ar: "ثمانية عشر", g: "units" },
  { n: "19", fr: "dix-neuf", pron: "ديز-نوف", ar: "تسعة عشر", g: "units" },
  { n: "20", fr: "vingt", pron: "فان", ar: "عشرون", g: "units" },

  // 21 - 69: Tens & Intermediates
  { n: "21", fr: "vingt et un", pron: "فان-تي-آن", ar: "واحد وعشرون", g: "tens" },
  { n: "22", fr: "vingt-deux", pron: "فان-دو", ar: "اثنان وعشرون", g: "tens" },
  { n: "25", fr: "vingt-cinq", pron: "فان-سانك", ar: "خمسة وعشرون", g: "tens" },
  { n: "30", fr: "trente", pron: "ترونت", ar: "ثلاثون", g: "tens" },
  { n: "31", fr: "trente et un", pron: "ترون-تي-آن", ar: "واحد وثلاثون", g: "tens" },
  { n: "35", fr: "trente-cinq", pron: "ترونت-سانك", ar: "خمسة وثلاثون", g: "tens" },
  { n: "40", fr: "quarante", pron: "كارونت", ar: "أربعون", g: "tens" },
  { n: "41", fr: "quarante et un", pron: "كارون-تي-آن", ar: "واحد وأربعون", g: "tens" },
  { n: "45", fr: "quarante-cinq", pron: "كارونت-سانك", ar: "خمسة وأربعون", g: "tens" },
  { n: "50", fr: "cinquante", pron: "سانكونت", ar: "خمسون", g: "tens" },
  { n: "51", fr: "cinquante et un", pron: "سانكون-تي-آن", ar: "واحد وخمسون", g: "tens" },
  { n: "60", fr: "soixante", pron: "سواسونت", ar: "ستون", g: "tens" },
  { n: "61", fr: "soixante et un", pron: "سواسون-تي-آن", ar: "واحد وستون", g: "tens" },

  // 70 - 79: The 70s Special Sequence (soixante-dix)
  { n: "70", fr: "soixante-dix", pron: "سواسونت-ديس", ar: "سبعون", g: "complex" },
  { n: "71", fr: "soixante et onze", pron: "سواسونت-تي-أونز", ar: "واحد وسبعون", g: "complex" },
  { n: "72", fr: "soixante-douze", pron: "سواسونت-دوز", ar: "اثنان وسبعون", g: "complex" },
  { n: "73", fr: "soixante-treize", pron: "سواسونت-تريز", ar: "ثلاثة وسبعون", g: "complex" },
  { n: "74", fr: "soixante-quatorze", pron: "سواسونت-كاتورز", ar: "أربعة وسبعون", g: "complex" },
  { n: "75", fr: "soixante-quinze", pron: "سواسونت-كانز", ar: "خمسة وسبعون", g: "complex" },
  { n: "76", fr: "soixante-seize", pron: "سواسونت-سيز", ar: "ستة وسبعون", g: "complex" },
  { n: "77", fr: "soixante-dix-sept", pron: "سواسونت-ديس-سيت", ar: "سبعة وسبعون", g: "complex" },
  { n: "78", fr: "soixante-dix-huit", pron: "سواسونت-ديز-ويت", ar: "ثمانية وسبعون", g: "complex" },
  { n: "79", fr: "soixante-dix-neuf", pron: "سواسونت-ديز-نوف", ar: "تسعة وسبعون", g: "complex" },

  // 80 - 89: The 80s Special Sequence (quatre-vingts)
  { n: "80", fr: "quatre-vingts", pron: "كاتر-فان", ar: "ثمانون (تأخذ s)", g: "complex" },
  { n: "81", fr: "quatre-vingt-un", pron: "كاتر-فان-آن", ar: "واحد وثمانون (تسقط s وبدون et)", g: "complex" },
  { n: "82", fr: "quatre-vingt-deux", pron: "كاتر-فان-دو", ar: "اثنان وثمانون", g: "complex" },
  { n: "83", fr: "quatre-vingt-trois", pron: "كاتر-فان-تروا", ar: "ثلاثة وثمانون", g: "complex" },
  { n: "84", fr: "quatre-vingt-quatre", pron: "كاتر-فان-كاتر", ar: "أربعة وثمانون", g: "complex" },
  { n: "85", fr: "quatre-vingt-cinq", pron: "كاتر-فان-سانك", ar: "خمسة وثمانون", g: "complex" },
  { n: "88", fr: "quatre-vingt-huit", pron: "كاتر-فان-ويت", ar: "ثمانية وثمانون", g: "complex" },

  // 90 - 99: The 90s Special Sequence (quatre-vingt-dix)
  { n: "90", fr: "quatre-vingt-dix", pron: "كاتر-فان-ديس", ar: "تسعون", g: "complex" },
  { n: "91", fr: "quatre-vingt-onze", pron: "كاتر-فان-أونز", ar: "واحد وتسعون", g: "complex" },
  { n: "92", fr: "quatre-vingt-douze", pron: "كاتر-فان-دوز", ar: "اثنان وتسعون", g: "complex" },
  { n: "93", fr: "quatre-vingt-treize", pron: "كاتر-فان-تريز", ar: "ثلاثة وتسعون", g: "complex" },
  { n: "94", fr: "quatre-vingt-quatorze", pron: "كاتر-فان-كاتورز", ar: "أربعة وتسعون", g: "complex" },
  { n: "95", fr: "quatre-vingt-quinze", pron: "كاتر-فان-كانز", ar: "خمسة وتسعون", g: "complex" },
  { n: "96", fr: "quatre-vingt-seize", pron: "كاتر-فان-سيز", ar: "ستة وتسعون", g: "complex" },
  { n: "97", fr: "quatre-vingt-dix-sept", pron: "كاتر-فان-ديس-سيت", ar: "سبعة وتسعون", g: "complex" },
  { n: "98", fr: "quatre-vingt-dix-huit", pron: "كاتر-فان-ديز-ويت", ar: "ثمانية وتسعون", g: "complex" },
  { n: "99", fr: "quatre-vingt-dix-neuf", pron: "كاتر-فان-ديز-نوف", ar: "تسعة وتسعون", g: "complex" },

  // Hundreds & Thousands (Big Numbers)
  { n: "100", fr: "cent", pron: "سون", ar: "مائة", g: "big" },
  { n: "150", fr: "cent cinquante", pron: "سون سانكونت", ar: "مائة وخمسون", g: "big" },
  { n: "200", fr: "deux cents", pron: "دو سون", ar: "مائتان (تأخذ s الجمع)", g: "big" },
  { n: "205", fr: "deux cent cinq", pron: "دو سون سانك", ar: "مائتان وخمسة (تسقط s)", g: "big" },
  { n: "300", fr: "trois cents", pron: "تروا سون", ar: "ثلاثمائة", g: "big" },
  { n: "400", fr: "quatre cents", pron: "كاتر سون", ar: "أربعمائة", g: "big" },
  { n: "500", fr: "cinq cents", pron: "سانك سون", ar: "خمسمائة", g: "big" },
  { n: "600", fr: "six cents", pron: "سيس سون", ar: "ستمائة", g: "big" },
  { n: "700", fr: "sept cents", pron: "سيت سون", ar: "سبعمائة", g: "big" },
  { n: "800", fr: "huit cents", pron: "ويت سون", ar: "ثمانمائة", g: "big" },
  { n: "900", fr: "neuf cents", pron: "نوف سون", ar: "تسعمائة", g: "big" },
  { n: "1 000", fr: "mille", pron: "ميل", ar: "ألف (لا تأخذ s أبداً)", g: "big" },
  { n: "1 500", fr: "mille cinq cents", pron: "ميل سانك سون", ar: "ألف وخمسمائة", g: "big" },
  { n: "2 000", fr: "deux mille", pron: "دو ميل", ar: "ألفان", g: "big" },
  { n: "5 000", fr: "cinq mille", pron: "سانك ميل", ar: "خمسة آلاف", g: "big" },
  { n: "10 000", fr: "dix mille", pron: "ديس ميل", ar: "عشرة آلاف", g: "big" },
  { n: "25 000", fr: "vingt-cinq mille", pron: "فان-سانك ميل", ar: "خمسة وعشرون ألفاً", g: "big" },
  { n: "50 000", fr: "cinquante mille", pron: "سانكونت ميل", ar: "خمسون ألفاً", g: "big" },
  { n: "100 000", fr: "cent mille", pron: "سون ميل", ar: "مائة ألف", g: "big" },
  { n: "250 000", fr: "deux cent cinquante mille", pron: "دو سون سانكونت ميل", ar: "مائتان وخمسون ألفاً", g: "big" },
  { n: "500 000", fr: "cinq cent mille", pron: "سانك سون ميل", ar: "خمسمائة ألف", g: "big" },
  { n: "1 000 000", fr: "un million", pron: "آن ميليون", ar: "مليون درهم", g: "big" },
  { n: "2 000 000", fr: "deux millions", pron: "دو ميليون", ar: "مليونان (تأخذ s الجمع)", g: "big" },
  { n: "10 000 000", fr: "dix millions", pron: "ديس ميليون", ar: "عشرة ملايين درهم", g: "big" },

  // Ordinal Numbers for BTP (الأعداد الترتيبية: الطوابق والمراحل)
  { n: "1er / 1ère", fr: "premier / première", pron: "برومييه / برومييار", ar: "الأول / الأولى (RDC / 1ère tranche)", g: "ordinals" },
  { n: "2ème", fr: "deuxième", pron: "دوزييم", ar: "الثاني / الطابق الثاني (2ème étage)", g: "ordinals" },
  { n: "3ème", fr: "troisième", pron: "تروازييم", ar: "الثالث / الطابق الثالث (3ème étage)", g: "ordinals" },
  { n: "4ème", fr: "quatrième", pron: "كاترييم", ar: "الرابع (4ème étage)", g: "ordinals" },
  { n: "5ème", fr: "cinquième", pron: "سانكييم", ar: "الخامس (5ème étage)", g: "ordinals" },
  { n: "Dernier", fr: "dernier étage", pron: "ديرنييه إيتاج", ar: "الطابق الأخير / الختام", g: "ordinals" },

  // BTP Math: Fractions, Percentages & Retentions
  { n: "1/2", fr: "un demi", pron: "آن دومي", ar: "نصف (نصف يومية / نصف متر مكعب)", g: "btp_math" },
  { n: "1/3", fr: "un tiers", pron: "آن تييار", ar: "ثلث", g: "btp_math" },
  { n: "1/4", fr: "un quart", pron: "آن كار", ar: "ربع", g: "btp_math" },
  { n: "3/4", fr: "trois quarts", pron: "تروا كار", ar: "ثلاثة أرباع (3/4 de pouce)", g: "btp_math" },
  { n: "20% TVA", fr: "vingt pour cent (TVA)", pron: "فان بور سون", ar: "20% ضريبة القيمة المضافة", g: "btp_math" },
  { n: "10% RG", fr: "dix pour cent (Retenue de garantie)", pron: "ديس بور سون", ar: "10% اقتطاع الضمان النهائي", g: "btp_math" },
  { n: "5% CP", fr: "cinq pour cent (Caution provisoire)", pron: "سانك بور سون", ar: "5% الضمانة المؤقتة للصفقة", g: "btp_math" },
  { n: "7% Hon.", fr: "sept pour cent (Honoraires)", pron: "سيت بور سون", ar: "7% أتعاب المهندس المعماري", g: "btp_math" }
];

if (typeof window !== 'undefined') {
  window.NUMBERS_DATA = NUMBERS_DATA;
}


// Arabic phonetic transcription tokens for French number words (pronunciation guide)
export const FR_PRON_TOKENS = {
  "zéro": "زيرو", "un": "آن", "deux": "دو", "trois": "تروا", "quatre": "كاتر",
  "cinq": "سانك", "six": "سيس", "sept": "سيت", "huit": "ويت", "neuf": "نوف",
  "dix": "ديس", "onze": "أونز", "douze": "دوز", "treize": "تريز",
  "quatorze": "كاتورز", "quinze": "كانز", "seize": "سيز",
  "vingt": "فان", "vingts": "فان", "trente": "ترونت", "quarante": "كارونت",
  "cinquante": "سانكونت", "soixante": "سواسونت",
  "cent": "سون", "cents": "سون", "mille": "ميل",
  "million": "ميليون", "millions": "ميليون", "et": "إي", "moins": "موان",
  "dirham": "ديرهام", "dirhams": "ديرهام", "centime": "سونتيم", "centimes": "سونتيم",
  "dix-sept": "ديس-سيت", "dix-huit": "ديز-ويت", "dix-neuf": "ديز-نوف"
};
