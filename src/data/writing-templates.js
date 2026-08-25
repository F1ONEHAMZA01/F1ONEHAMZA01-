window.WRITING_TEMPLATES = [
  {
    "id": "bc",
    "title": "وصل طلب شراء مواد / Bon de Commande",
    "icon": "📝",
    "category": "orders",
    "ar_desc": "نموذج تعبئة طلب شراء سلع من المورد لتوثيق تفاصيل الكمية والسعر والموافقة.",
    "fields": [
      { "id": "num", "label": "رقم الطلب / N° BC", "placeholder": "2026-001" },
      { "id": "date", "label": "التاريخ / Date", "placeholder": "09/03/2026" },
      { "id": "supplier", "label": "المورد / Fournisseur", "placeholder": "SONASID SA" },
      { "id": "items", "label": "المواد والكميات / Désignation & Qté", "placeholder": "Fer à béton HA12 - 5 Tonnes" },
      { "id": "ht", "label": "المجموع دون ضريبة / Total HT", "placeholder": "62 500 DH" },
      { "id": "ttc", "label": "المجموع مع الضريبة / Total TTC", "placeholder": "75 000 DH" },
      { "id": "deadline", "label": "أجل التسليم / Délai livraison", "placeholder": "12/03/2026" }
    ],
    "template_str": "BON DE COMMANDE N° BC-[num]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDate     : [date]\nChantier : Résidence AL ANDALOUS – Hay Hassani\nDemandeur: Chef de chantier – M. RADI Khalid\n\nÀ        : [supplier]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDésignation des fournitures commandées :\n[items]\n\nConditions financières :\n  Total Hors Taxes (HT) : [ht]\n  TVA (20%)             : (Calculé automatiquement selon le pays)\n  Total Toutes Taxes    : [ttc]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDélai de livraison souhaité : [deadline]\nLieu de livraison           : Chantier Résidence Al Andalous\n\nVisa Conducteur de Travaux :                     Cachet Entreprise :"
  },
  {
    "id": "email",
    "title": "إيميل تحديث تقدم الأشغال / Email Professionnel",
    "icon": "📧",
    "category": "reports",
    "ar_desc": "رسالة بريد إلكتروني لإرسال كشف أسبوعي بتقدم الأشغال وتحديد المشاكل العالقة.",
    "fields": [
      { "id": "dest", "label": "المرسل إليه / À", "placeholder": "directeur.travaux@company.ma" },
      { "id": "sub", "label": "رقم الأسبوع / Semaine N°", "placeholder": "11" },
      { "id": "proj", "label": "اسم المشروع / Projet", "placeholder": "Résidence Al Andalous" },
      { "id": "progress", "label": "نسبة تقدم الأشغال / Avancement", "placeholder": "Gros œuvre R+3 terminé à 80%" },
      { "id": "issue", "label": "المشاكل العالقة / Problème", "placeholder": "Retard de 2 jours sur l'enduit façade (pluie)" },
      { "id": "action", "label": "المطلوب / Action attendue", "placeholder": "Validation de l'avenant N°1 par le BET" },
      { "id": "sender", "label": "المرسل / Expéditeur", "placeholder": "Mohamed ALAMI" }
    ],
    "template_str": "De    : mohamed.alami@batimaroc.ma\nÀ     : [dest]\nObjet : Point d'avancement hebdomadaire — Semaine [sub] — [proj]\n\nBonjour,\n\nJe vous transmets ci-dessous le rapport d'avancement des travaux pour la semaine [sub] concernant le projet [proj].\n\nÉTAT D'AVANCEMENT :\n  - Travaux réalisés : [progress]\n  - Planning général : [issue]\n\nPOINT DE BLOCAGE / ATTENTION :\n  - Problème constaté : [issue]\n\nACTION REQUISE :\n  - [action] afin d'éviter tout retard supplémentaire sur la suite du chantier.\n\nJe reste à votre entière disposition pour tout renseignement complémentaire.\n\nCordialement,\n[sender]\nConducteur de travaux — BATIMAROC\nTél : 06 61 55 44 33"
  },
  {
    "id": "rj",
    "title": "التقرير اليومي للورشة / Rapport Journalier",
    "icon": "📊",
    "category": "reports",
    "ar_desc": "تعبئة الكشف اليومي للأشغال واليد العاملة لتتبع العمل والآلات والمواد المستهلكة.",
    "fields": [
      { "id": "date", "label": "التاريخ / Date", "placeholder": "09/03/2026" },
      { "id": "weather", "label": "الطقس / Météo", "placeholder": "Beau temps (22°C)" },
      { "id": "workers", "label": "عدد العمال / Ouvriers", "placeholder": "18 ouvriers (4 Maçons, 2 Coffreurs, 12 Manœuvres)" },
      { "id": "work", "label": "أشغال اليوم / Travaux réalisés", "placeholder": "Coulage béton poteaux R+2, pose briques cloison R+1" },
      { "id": "materials", "label": "المواد المستعملة / Matériaux", "placeholder": "12 m³ de béton, 250 briques creuses" },
      { "id": "notes", "label": "ملاحظات وحوادث / Incidents", "placeholder": "Aucun incident. BET a signé le PV ferraillage." }
    ],
    "template_str": "RAPPORT JOURNALIER DE CHANTIER — N°_____\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nChantier : Résidence AL ANDALOUS R+4\nDate     : [date]\nMétéo    : [weather]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nEFFECTIFS DU JOUR :\n[workers]\n\nTRAVAUX PRÉVUS ET RÉALISÉS :\n[work]\n\nMATÉRIAUX ET FOURNITURES UTILISÉS :\n[materials]\n\nOBSERVATIONS ET ACTIONS COMPLÉMENTAIRES :\n[notes]\n\nSignature Chef de chantier : M. RADI Khalid"
  },
  {
    "id": "pv",
    "title": "محضر اجتماع موقع / Procès-Verbal",
    "icon": "📋",
    "category": "reports",
    "ar_desc": "نموذج كتابة محضر اجتماع أسبوعي يوزع على جميع المتدخلين لتسجيل تقدم المشروع والملاحظات.",
    "fields": [
      { "id": "num", "label": "رقم الاجتماع / Réunion N°", "placeholder": "15" },
      { "id": "date", "label": "التاريخ / Date", "placeholder": "09/03/2026" },
      { "id": "presents", "label": "الحاضرون / Présents", "placeholder": "M. Benali (MOA), M. Alami (Conducteur), M. Tahiri (BET)" },
      { "id": "points", "label": "القرارات المتخذة / Points abordés", "placeholder": "1. Validation du planning recalé. 2. Reprise enduit façade." },
      { "id": "next", "label": "الاجتماع القادم / Prochaine réunion", "placeholder": "Lundi 16/03/2026 à 10h00" }
    ],
    "template_str": "PROCÈS-VERBAL DE RÉUNION DE CHANTIER N°[num]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nProjet : Résidence AL ANDALOUS R+4\nDate   : [date] à 10h00\nLieu   : Bureau de Chantier — Hay Hassani\n\nLISTE DES PERSONNES PRÉSENTES :\n[presents]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nPOINTS ET DÉCISIONS RETENUS :\n\n[points]\n\nPROCHAINE RÉUNION PLANIFIÉE :\n  Le [next] au bureau de chantier.\n\nÉtabli et diffusé par le Conducteur de travaux de BATIMAROC."
  },
  {
    "id": "dp",
    "title": "طلب عروض أسعار مواد / Demande de Prix",
    "icon": "💸",
    "category": "orders",
    "ar_desc": "رسالة رسمية ترسل إلى الموردين لطلب عروض أسعار للمواد المطلوبة وأجوبة عن آجال التسليم.",
    "fields": [
      { "id": "date", "label": "التاريخ / Date", "placeholder": "09/03/2026" },
      { "id": "supplier", "label": "المورد المستهدف / Fournisseur", "placeholder": "SOPREMA Maroc" },
      { "id": "material", "label": "المواد المطلوبة / Désignation", "placeholder": "Membrane d'étanchéité bitumineuse 4mm" },
      { "id": "qte", "label": "الكمية المطلوبة / Quantité", "placeholder": "250 m²" },
      { "id": "time", "label": "المهلة القصوى للرد / Délai requis", "placeholder": "48 heures (avant le 11/03)" }
    ],
    "template_str": "DEMANDE DE PRIX N° DP-2026-____\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDate : [date]\nDe   : BATIMAROC SARL — Service Achat\nÀ    : [supplier]\n\nObjet : Demande d'offre de prix et délais pour matériel d'étanchéité\n\nBonjour,\n\nDans le cadre de l'exécution de notre chantier de construction Résidence Al Andalous, nous vous prions de bien vouloir nous transmettre votre meilleure offre tarifaire et délais de livraison pour la fourniture suivante :\n\nDESIGNATION DES ARTICLES :\n  - Produit  : [material]\n  - Quantité : [qte]\n  - Livraison: Franco Chantier — Hay Hassani, Casablanca\n\nMerci de nous faire parvenir votre devis estimatif sous [time].\n\nDans l'attente de votre proposition commerciale.\n\nCordialement,\nService Achat — BATIMAROC"
  },
  {
    "id": "claim",
    "title": "شكوى للمورد بسبب خلل / Réclamation Fournisseur",
    "icon": "⚠",
    "category": "quality",
    "ar_desc": "نموذج توجيه شكوى رسمية لمورد لتبليغه عن وجود عيب مصنعي في المواد المستلمة أو نقص في الكمية المطلوبة.",
    "fields": [
      { "id": "date", "label": "التاريخ / Date", "placeholder": "10/03/2026" },
      { "id": "supplier", "label": "المورد / Fournisseur", "placeholder": "CIMENTS DU MAROC (CIMAR)" },
      { "id": "bl", "label": "رقم وصل التسليم / BL N°", "placeholder": "BL-2026-0412" },
      { "id": "defect", "label": "العيب الملاحظ / Défaut constaté", "placeholder": "12 sacs de ciment déchirés et mouillés (inutilisables)" },
      { "id": "request", "label": "الطلب / Demande corrective", "placeholder": "Remplacement immédiat des 12 sacs défectueux d'ici demain" }
    ],
    "template_str": "RÉCLAMATION FOURNISSEUR N° REC-2026-____\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDate : [date]\nDe   : M. RADI Khalid — Chef de Chantier BATIMAROC\nÀ    : Service Réclamations de [supplier]\n\nObjet : Réclamation pour non-conformité — Livraison sous BL [bl]\n\nMonsieur le Responsable,\n\nPar la présente, je vous signale une anomalie importante concernant les matériaux livrés sur notre chantier ce jour sous le bon de livraison [bl].\n\nEn effet, lors du contrôle de conformité à la réception, nous avons constaté le problème suivant :\n  [defect]\n\nCe désagrément perturbe l'avancement des travaux de maçonnerie de nos équipes. En conséquence, je vous prie de bien vouloir procéder à :\n  [request]\n\nJe vous demande de bien vouloir confirmer votre accord de remplacement par retour d'email.\n\nCordialement,\nM. RADI Khalid\nChef de chantier — BATIMAROC"
  },
  {
    "id": "devis",
    "title": "عرض ثمن / Devis",
    "icon": "🧾",
    "category": "orders",
    "ar_desc": "نموذج عرض ثمن (Devis) يُرسل للزبون قبل بدء الأشغال، مع الكمّيات والأثمان وشروط الأداء.",
    "fields": [
      { "id": "num", "label": "رقم العرض / N° Devis", "placeholder": "2026-045" },
      { "id": "date", "label": "التاريخ / Date", "placeholder": "12/03/2026" },
      { "id": "client", "label": "الزبون / Client", "placeholder": "M. BENANI — Villa Aïn Diab" },
      { "id": "desi", "label": "الأشغال أو المواد / Désignation", "placeholder": "Fourniture et pose de carrelage 60×60" },
      { "id": "qte", "label": "الكمية / Quantité", "placeholder": "120 m²" },
      { "id": "pu", "label": "الثمن الأحادي دون ضريبة / P.U. HT", "placeholder": "150 DH/m²" },
      { "id": "delai", "label": "أجل الإنجاز / Délai", "placeholder": "15 jours" }
    ],
    "template_str": "DEVIS N° DV-[num]\n━━━━━━━━━━━━━━━━━━━━━━━━\nDate   : [date]\nDe     : BATIMAROC SARL — Service Commercial\nClient : [client]\n━━━━━━━━━━━━━━━━━━━━━━━━\nDésignation des travaux / fournitures :\n  [desi]\n  Quantité      : [qte]\n  Prix unitaire : [pu] (HT)\n\nConditions :\n  Délai d'exécution   : [delai]\n  Validité de l'offre : 30 jours\n  TVA                 : 20% en sus\n  Paiement            : 40% à la commande, solde à la réception\n━━━━━━━━━━━━━━━━━━━━━━━━\nDevis à dater et signer avec la mention « Bon pour accord ».\n\nLe Client (Bon pour accord) :            L'Entreprise :"
  },
  {
    "id": "facture",
    "title": "فاتورة / Facture",
    "icon": "💵",
    "category": "orders",
    "ar_desc": "نموذج فاتورة رسمية بالمعرّف الموحّد (ICE) والمبالغ دون وبمع الضريبة وشروط الأداء.",
    "fields": [
      { "id": "num", "label": "رقم الفاتورة / N° Facture", "placeholder": "FA-2026-088" },
      { "id": "date", "label": "التاريخ / Date", "placeholder": "12/03/2026" },
      { "id": "client", "label": "الزبون / Client", "placeholder": "STÉ ATLAS PROMOTION" },
      { "id": "ice", "label": "المعرّف الموحّد للزبون / ICE", "placeholder": "001234567000045" },
      { "id": "desi", "label": "البيان / Désignation", "placeholder": "Travaux gros œuvre R+2 — Décompte N°3" },
      { "id": "ht", "label": "المبلغ دون ضريبة / Montant HT", "placeholder": "141 585,00 DH" },
      { "id": "pay", "label": "أجل الأداء / Délai de paiement", "placeholder": "45 jours" }
    ],
    "template_str": "FACTURE N° [num]\n━━━━━━━━━━━━━━━━━━━━━━━━\nDate       : [date]\nÉmetteur   : BATIMAROC SARL — ICE 000123456000089\nClient     : [client]\nICE Client : [ice]\n━━━━━━━━━━━━━━━━━━━━━━━━\nDésignation :\n  [desi]\n\n  Montant Hors Taxes (HT)    : [ht]\n  TVA 20% (HT × 0,20)        : (calcul)\n  Montant Toutes Taxes (TTC) : (HT × 1,20)\n━━━━━━━━━━━━━━━━━━━━━━━━\nConditions de paiement : [pay]\nMode : Virement bancaire / Chèque certifié\n\nArrêtée la présente facture à la somme de :\n  ……………………………………………………… (en toutes lettres)\n\nCachet et signature :"
  },
  {
    "id": "recept",
    "title": "وصل استلام المواد / Bon de Réception",
    "icon": "📦",
    "category": "orders",
    "ar_desc": "نموذج وصل استلام لتوثيق قبول المواد المسلَّمة ومطابقتها للطلب ووصل التسليم.",
    "fields": [
      { "id": "num", "label": "رقم الوصل / N° BR", "placeholder": "BR-2026-031" },
      { "id": "date", "label": "التاريخ / Date", "placeholder": "12/03/2026" },
      { "id": "four", "label": "المورّد / Fournisseur", "placeholder": "CIMAR" },
      { "id": "bl", "label": "رقم وصل التسليم / BL N°", "placeholder": "BL-2026-0412" },
      { "id": "art", "label": "المواد المستلمة / Articles reçus", "placeholder": "Ciment CPJ 45 : 50 sacs ; Fer HA12 : 600 kg" },
      { "id": "etat", "label": "الحالة / État", "placeholder": "Conforme — sacs intacts" },
      { "id": "recu", "label": "المستلِم / Reçu par", "placeholder": "M. RADI Khalid (Chef de chantier)" }
    ],
    "template_str": "BON DE RÉCEPTION N° [num]\n━━━━━━━━━━━━━━━━━━━━━━━━\nDate       : [date]\nChantier   : Résidence AL ANDALOUS — Hay Hassani\nFournisseur: [four]\nRéf. BL    : [bl]\n━━━━━━━━━━━━━━━━━━━━━━━━\nArticles réceptionnés et contrôlés :\n  [art]\n\nContrôle qualité à la réception :\n  État : [etat]\n━━━━━━━━━━━━━━━━━━━━━━━━\nReçu par : [recu]\nSignature : ……………………     Cachet chantier : ……………………"
  },
  {
    "id": "fnc",
    "title": "بطاقة عدم مطابقة / Fiche de Non-Conformité",
    "icon": "⚠",
    "category": "quality",
    "ar_desc": "نموذج FNC لتسجيل خلل في الإنجاز أو المواد، مع سببه والإجراء التصحيحي والأجل.",
    "fields": [
      { "id": "num", "label": "رقم البطاقة / FNC N°", "placeholder": "08" },
      { "id": "date", "label": "التاريخ / Date", "placeholder": "12/03/2026" },
      { "id": "ouv", "label": "العنصر المعني / Ouvrage concerné", "placeholder": "Enduit façade Sud — R+2" },
      { "id": "def", "label": "عدم المطابقة الملاحَظة / Non-conformité", "placeholder": "Fissurations capillaires sur l'enduit" },
      { "id": "cause", "label": "السبب المحتمل / Cause probable", "placeholder": "Séchage trop rapide, absence de cure" },
      { "id": "act", "label": "الإجراء التصحيحي / Action corrective", "placeholder": "Reprise de l'enduit après piquage" },
      { "id": "delai", "label": "الأجل / Délai", "placeholder": "7 jours" }
    ],
    "template_str": "FICHE DE NON-CONFORMITÉ N° FNC-[num]\n━━━━━━━━━━━━━━━━━━━━━━━━\nDate     : [date]\nChantier : Résidence AL ANDALOUS R+4\nÉmise par: Bureau de Contrôle / Conducteur de travaux\n━━━━━━━━━━━━━━━━━━━━━━━━\n1. OUVRAGE CONCERNÉ :\n   [ouv]\n\n2. NON-CONFORMITÉ CONSTATÉE :\n   [def]\n\n3. CAUSE PROBABLE :\n   [cause]\n\n4. ACTION CORRECTIVE DEMANDÉE :\n   [act]\n\n5. DÉLAI DE LEVÉE :\n   [delai]\n━━━━━━━━━━━━━━━━━━━━━━━━\nÉmetteur : ……………………     Entreprise (pour accord) : ……………………"
  },
  {
    "id": "attest",
    "title": "شهادة عمل / Attestation de Travail",
    "icon": "📄",
    "category": "admin",
    "ar_desc": "نموذج شهادة عمل تُسلّمها المقاولة للعامل، مفيدة لملفّات القروض والضمان الاجتماعي (CNSS).",
    "fields": [
      { "id": "emp", "label": "اسم العامل / Nom de l'employé", "placeholder": "M. HAMZA LAHRACH" },
      { "id": "cin", "label": "رقم البطاقة الوطنية / CIN", "placeholder": "BK123456" },
      { "id": "poste", "label": "المنصب / Poste occupé", "placeholder": "Chef de chantier" },
      { "id": "debut", "label": "تاريخ التوظيف / Date d'embauche", "placeholder": "01/09/2023" },
      { "id": "ent", "label": "المقاولة / Entreprise", "placeholder": "BATIMAROC SARL" }
    ],
    "template_str": "ATTESTATION DE TRAVAIL\n━━━━━━━━━━━━━━━━━━━━━━━━\nJe soussigné, le représentant légal de la société [ent],\natteste que :\n\n  Monsieur/Madame : [emp]\n  Titulaire de la CIN : [cin]\n  est employé(e) au sein de notre entreprise\n  en qualité de : [poste]\n  depuis le : [debut]\n\nLa présente attestation lui est délivrée pour servir et valoir ce que de droit.\n\nFait à Casablanca, le ………………………\n\nDirecteur Général :\n  [Cachet et signature]"
  }
];
