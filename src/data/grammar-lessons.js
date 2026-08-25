export const GRAMMAR_LESSONS = [
  {
    id: "imperatif",
    category: "orders",
    badge: "أوامر وتعليمات 👷",
    title: "1. أفعال الأمر والتعليمات الميدانية / L'Impératif & Ordres de Chantier",
    ar_desc: "صيغ الأمر والنهي الأكثر استخداماً من قِبل رئيس الورشة (Conducteur / Chef de chantier) لتوجيه العمال والفرق التقنية.",
    content: `
      <div class="grammar-rule-box">
        <strong>💡 القاعدة النحوية الأساسية:</strong>
        <p>يُصاغ الأمر من الفعل المضارع بحذف الضمير (Tu / Vous / Nous). في أفعال المجموعة الأولى (-er)، تُحذف حرف «s» مع الضمير Tu (مثال: <em>Coule !</em> وليس <em>Coules !</em>). في الورش، تُستعمل صيغة <strong>Vous</strong> للاحترام أو لمخاطبة الفريق بالكامل.</p>
      </div>

      <table class="gt">
        <thead>
          <tr>
            <th>صيغة المفرد (Tu)</th>
            <th>صيغة الجمع / الاحترام (Vous)</th>
            <th>المعنى والتطبيق بالورشة</th>
            <th>النطق الصوتي</th>
            <th>استماع</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><bdi dir="ltr">Vérifie l'enrobage !</bdi></td>
            <td><bdi dir="ltr">Vérifiez l'enrobage !</bdi></td>
            <td>افحص غطاء حماية الحديد (الكال)!</td>
            <td>[ فيريفي لونروباج ]</td>
            <td><button type="button" class="gt-audio-btn" onclick="speakFrenchText('Vérifiez l\'enrobage de l\'acier avant le coulage', this)">🔊</button></td>
          </tr>
          <tr>
            <td><bdi dir="ltr">Coffre le poteau P3 !</bdi></td>
            <td><bdi dir="ltr">Coffrez le poteau P3 !</bdi></td>
            <td>ثبّت قالب خرسانة العمود P3!</td>
            <td>[ كوفري لو بوتو ]</td>
            <td><button type="button" class="gt-audio-btn" onclick="speakFrenchText('Coffrez le poteau et vérifiez l\'aplomb', this)">🔊</button></td>
          </tr>
          <tr>
            <td><bdi dir="ltr">Nivelle la plateforme !</bdi></td>
            <td><bdi dir="ltr">Nivellez la plateforme !</bdi></td>
            <td>سوِّ منسوب الأرضية بدقة!</td>
            <td>[ نيفيلي لا بلاتفورم ]</td>
            <td><button type="button" class="gt-audio-btn" onclick="speakFrenchText('Nivellez la plateforme selon la cote NGF', this)">🔊</button></td>
          </tr>
          <tr>
            <td><bdi dir="ltr">Vibre bien le béton !</bdi></td>
            <td><bdi dir="ltr">Vibrez bien le béton !</bdi></td>
            <td>شغّل الهزاز جيداً لتفادي التعشيش!</td>
            <td>[ فيبري بيان لو بيتون ]</td>
            <td><button type="button" class="gt-audio-btn" onclick="speakFrenchText('Vibrez bien le béton pour éviter la ségrégation', this)">🔊</button></td>
          </tr>
          <tr>
            <td><bdi dir="ltr">Arrose la dalle !</bdi></td>
            <td><bdi dir="ltr">Arrosez la dalle !</bdi></td>
            <td>رشّ البلاطة بالماء لحمايتها من التشقق!</td>
            <td>[ أروزي لا دال ]</td>
            <td><button type="button" class="gt-audio-btn" onclick="speakFrenchText('Arrosez la dalle pendant trois jours consécutifs', this)">🔊</button></td>
          </tr>
        </tbody>
      </table>

      <div class="grammar-warn-box">
        <strong>⚠️ صيغة النهي والتحذير (L'Impératif Négatif):</strong>
        <p>تُبنى بوضع <code>Ne ... pas</code> حول الفعل بالأمر:</p>
        <ul style="margin: 6px 18px 0; padding: 0;">
          <li><bdi dir="ltr"><strong>Ne coulez pas</strong> sans bon de coulage signé !</bdi> (لا تصبوا الخرسانة دون إذن صب موقّع!)</li>
          <li><bdi dir="ltr"><strong>Ne décoffrez pas</strong> les poutres avant 28 jours !</bdi> (لا تفكوا شدات الكمرات قبل مرور 28 يوماً!)</li>
        </ul>
      </div>

      <div class="ex-row">
        <div class="ex-text">
          <span class="ex-badge">مثال تطبيقي واقعي:</span>
          <div class="ex-fr" dir="ltr">« Arrêtez immédiatement le coulage et prélevez trois éprouvettes pour le test d'écrasement à 28 jours ! »</div>
          <div class="ex-ar">« أوقفوا الصب فوراً وخذوا ثلاث عينات أسطوانية لاختبار التكسير عند 28 يوماً! »</div>
        </div>
        <div class="ex-actions">
          <button type="button" class="btn-secondary" onclick="speakFrenchText('Arrêtez immédiatement le coulage et prélevez trois éprouvettes', this)">🔊 استمع</button>
          <button type="button" class="btn-secondary" onclick="copyChequeTextDirect('Arrêtez immédiatement le coulage et prélevez trois éprouvettes pour le test d\'écrasement à 28 jours !')">📋 نسخ</button>
        </div>
      </div>
    `
  },
  {
    id: "passe_compose",
    category: "reports",
    badge: "تقارير ومذكرات 📋",
    title: "2. الماضي المركب وصياغة تقارير الورشة / Le Passé Composé & Rapports",
    ar_desc: "صياغة ما تم إنجازه يومياً في دفتر الورشة (Journal de chantier) ومذكرات تقدم الأشغال مع المساعدين Avoir و Être.",
    content: `
      <div class="grammar-rule-box">
        <strong>💡 القاعدة النحوية الأساسية:</strong>
        <p>يتكون الماضي المركب من الفعل المساعد (Avoir أو Être) في الحاضر + اسم المفعول (Participe passé). أغلب أفعال الأشغال تأخذ <strong>Avoir</strong> (مثل: <em>Nous avons coulé, Le BET a validé</em>)، بينما أفعال الحركة والوصول تأخذ <strong>Être</strong> مع مطابقة الفاعل في التذكير والتأنيث والجمع (مثل: <em>L'équipe est arrivée, Les toupies sont venues</em>).</p>
      </div>

      <table class="gt">
        <thead>
          <tr>
            <th>الجملة في الماضي المركب</th>
            <th>الفعل الأصلي</th>
            <th>الترجمة الفنية</th>
            <th>الاستخدام الميداني</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><bdi dir="ltr">Nous avons coulé 45 m³ de béton B25.</bdi></td>
            <td><bdi dir="ltr">Couler (Avoir)</bdi></td>
            <td>قمنا بصب 45 متراً مكعباً من خرسانة B25.</td>
            <td>تسجيل الكميات في Journal de chantier</td>
          </tr>
          <tr>
            <td><bdi dir="ltr">Le bureau de contrôle a validé le ferraillage.</bdi></td>
            <td><bdi dir="ltr">Valider (Avoir)</bdi></td>
            <td>صادق مكتب المراقبة على تسليح الحديد.</td>
            <td>محضر الاستلام قبل الصب (PV)</td>
          </tr>
          <tr>
            <td><bdi dir="ltr">Les maçons ont achevé les murs du RDC.</bdi></td>
            <td><bdi dir="ltr">Achever (Avoir)</bdi></td>
            <td>أنهى البناؤون جدران الطابق الأرضي.</td>
            <td>تقرير تقدم الأشغال الأسبوعي</td>
          </tr>
          <tr>
            <td><bdi dir="ltr">Le camion de ciment est arrivé à 08h30.</bdi></td>
            <td><bdi dir="ltr">Arriver (Être)</bdi></td>
            <td>وصلت شاحنة الإسمنت على الساعة 08:30.</td>
            <td>سجل تتبع التوريدات (Suivi livraisons)</td>
          </tr>
          <tr>
            <td><bdi dir="ltr">La grue est tombée en panne pendant 3 heures.</bdi></td>
            <td><bdi dir="ltr">Tomber (Être)</bdi></td>
            <td>تعطلت الرافعة البرجية لمدة 3 ساعات.</td>
            <td>تبرير التوقفات وتفادي الغرامات</td>
          </tr>
        </tbody>
      </table>

      <div class="ex-row">
        <div class="ex-text">
          <span class="ex-badge">فقرة نموذجية لدفتر الورشة (Extrait Journal de Chantier):</span>
          <div class="ex-fr" dir="ltr">« Aujourd'hui, l'équipe a terminé le ferraillage de la dalle haute du 1er étage. L'ingénieur du BET a inspecté les chapeaux et a accordé l'autorisation de coulage. »</div>
          <div class="ex-ar">« اليوم، أنهى الفريق تسليح البلاطة العلوية للطابق الأول. عاين مهندس مكتب الدراسات قبعات التسليح ومنح إذن الصب. »</div>
        </div>
        <div class="ex-actions">
          <button type="button" class="btn-secondary" onclick="speakFrenchText('Aujourd\'hui, l\'équipe a terminé le ferraillage de la dalle haute du premier étage.', this)">🔊 استمع</button>
          <button type="button" class="btn-secondary" onclick="copyChequeTextDirect('Aujourd\'hui, l\'équipe a terminé le ferraillage de la dalle haute du 1er étage. L\'ingénieur du BET a inspecté les chapeaux et a accordé l\'autorisation de coulage.')">📋 نسخ</button>
        </div>
      </div>
    `
  },
  {
    id: "futur_planning",
    category: "planning",
    badge: "تخطيط وبرمجة 📅",
    title: "3. المستقبل البسيط وبرمجة المهام / Le Futur Simple & Planning",
    ar_desc: "التعبير عن الجداول الزمنية، برمجة الطلبيات والتوريدات، وتحديد مواعيد التسليم بدقة.",
    content: `
      <div class="grammar-rule-box">
        <strong>💡 القاعدة النحوية الأساسية:</strong>
        <p>يُبنى المستقبل البسيط بترك المصدر (Infinitif) وإضافة النهايات: <code>-ai, -as, -a, -ons, -ez, -ont</code>. يُستخدم في محاضر الاجتماعات (PV de réunion) والجداول الزمنية (Planning Gantt) للإعلان عن التزامات الأسبوع القادم.</p>
      </div>

      <table class="gt">
        <thead>
          <tr>
            <th>الصياغة بالمستقبل</th>
            <th>الزمن والموعد المستهدف</th>
            <th>المعنى الإداري والفني</th>
            <th>العبارة الصوتية</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><bdi dir="ltr">La centrale livrera le béton à 14h00.</bdi></td>
            <td><bdi dir="ltr">Demain à 14h00</bdi></td>
            <td>ستورّد محطة الخرسانة الإسمنت على الساعة 14:00.</td>
            <td><button type="button" class="gt-audio-btn" onclick="speakFrenchText('La centrale livrera le béton à quatorze heures.', this)">🔊</button></td>
          </tr>
          <tr>
            <td><bdi dir="ltr">Nous terminerons le coulage vendredi soir.</bdi></td>
            <td><bdi dir="ltr">Vendredi</bdi></td>
            <td>سننهي عملية الصب مساء يوم الجمعة.</td>
            <td><button type="button" class="gt-audio-btn" onclick="speakFrenchText('Nous terminerons le coulage vendredi soir.', this)">🔊</button></td>
          </tr>
          <tr>
            <td><bdi dir="ltr">Le géomètre effectuera le récolement sous 48h.</bdi></td>
            <td><bdi dir="ltr">Sous 48 heures</bdi></td>
            <td>سيقوم الطبوغرافي بمسح المطابقة خلال 48 ساعة.</td>
            <td><button type="button" class="gt-audio-btn" onclick="speakFrenchText('Le géomètre effectuera le récolement sous quarante-huit heures.', this)">🔊</button></td>
          </tr>
          <tr>
            <td><bdi dir="ltr">L'électricien débutera les réservations lundi.</bdi></td>
            <td><bdi dir="ltr">Lundi prochain</bdi></td>
            <td>سيبدأ الكهربائي تمرير الخراطيم والممرات يوم الإثنين.</td>
            <td><button type="button" class="gt-audio-btn" onclick="speakFrenchText('L\'électricien débutera les réservations lundi.', this)">🔊</button></td>
          </tr>
        </tbody>
      </table>

      <div class="grammar-rule-box">
        <strong>⏱️ عبارات التوقيت والآجال الأكثر استعمالاً في الصفقات:</strong>
        <ul style="margin: 6px 18px 0; padding: 0; line-height: 1.8;">
          <li><bdi dir="ltr"><strong>D'ici la fin de semaine :</strong></bdi> من هنا حتى نهاية الأسبوع.</li>
          <li><bdi dir="ltr"><strong>Sous huitaine (sous 8 jours) :</strong></bdi> في غضون ثمانية أيام.</li>
          <li><bdi dir="ltr"><strong>Au plus tard le 15 du mois courant :</strong></bdi> في أقصى أجل يوم 15 من الشهر الجاري.</li>
        </ul>
      </div>

      <div class="ex-row">
        <div class="ex-text">
          <span class="ex-badge">بند تخطيط في محضر اجتماع (Extrait PV de Chantier):</span>
          <div class="ex-fr" dir="ltr">« L'entreprise procédera au décoffrage des planchers après validation des résultats d'écrasement à 28 jours et transmettra le décompte N°3 au maître d'œuvre. »</div>
          <div class="ex-ar">« ستباشر المقاولة فك شدات الأسقف بعد تأكيد نتائج تكسير الخرسانة لـ 28 يوماً وستحيل الكشف رقم 3 إلى مكتب الإشراف. »</div>
        </div>
        <div class="ex-actions">
          <button type="button" class="btn-secondary" onclick="speakFrenchText('L\'entreprise procédera au décoffrage des planchers après validation.', this)">🔊 استمع</button>
          <button type="button" class="btn-secondary" onclick="copyChequeTextDirect('L\'entreprise procédera au décoffrage des planchers après validation des résultats d\'écrasement à 28 jours et transmettra le décompte N°3 au maître d\'œuvre.')">📋 نسخ</button>
        </div>
      </div>
    `
  },
  {
    id: "conditionnel_politesse",
    category: "planning",
    badge: "مراسلات وتأدب ✍️",
    title: "4. صيغة التأدب والشرط في المراسلات / Le Conditionnel de Politesse",
    ar_desc: "الفرق بين أمر الورشة المباشر والخطاب المهني اللبق الموجه للمهندس المعماري ومكاتب الدراسات والزبائن.",
    content: `
      <div class="grammar-rule-box">
        <strong>💡 المفهوم والتطبيق المهني:</strong>
        <p>في الورشة الميدانية مع العمال نستخدم الأمر المباشر (<em>Faites ceci !</em>)، لكن في المراسلات الرسمية مع المهندس المعماري (Architecte) ومكتب الدراسات (BET) وصاحب المشروع (Maître d'Ouvrage) يجب استخدام <strong>Conditionnel Présent</strong> لتلطيف الطلب وإضفاء طابع الدبلوماسية الاحترافية.</p>
      </div>

      <table class="gt">
        <thead>
          <tr>
            <th>صيغة غير محبذة (مباشرة / جافة)</th>
            <th>الصيغة المهنية المعتمدة (Conditionnel)</th>
            <th>الترجمة الدبلوماسية</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><bdi dir="ltr">Envoyez les plans BPE !</bdi></td>
            <td><bdi dir="ltr"><strong>Pourriez-vous</strong> nous transmettre les plans BPE ?</bdi></td>
            <td>هل بإمكانكم التكرم بموافاتنا بمخططات الصالحة للتنفيذ؟</td>
          </tr>
          <tr>
            <td><bdi dir="ltr">Nous voulons valider le ferraillage.</bdi></td>
            <td><bdi dir="ltr">Nous <strong>souhaiterions</strong> obtenir la validation du ferraillage.</bdi></td>
            <td>نود الحصول على مصادقتكم على تسليح الحديد.</td>
          </tr>
          <tr>
            <td><bdi dir="ltr">Il faut changer le diamètre d'acier.</bdi></td>
            <td><bdi dir="ltr">Il <strong>conviendrait</strong> d'adapter le diamètre des armatures.</bdi></td>
            <td>من الأنسب والمستحسن تكييف قطر قضبان التسليح.</td>
          </tr>
          <tr>
            <td><bdi dir="ltr">Payez le décompte N°2.</bdi></td>
            <td><bdi dir="ltr">Nous vous <strong>serions reconnaissants</strong> de régler le décompte N°2.</bdi></td>
            <td>سنكون ممتنين لكم بتسوية الكشف الحسابي رقم 2.</td>
          </tr>
        </tbody>
      </table>

      <div class="ex-row">
        <div class="ex-text">
          <span class="ex-badge">إيميل رسمي لطلب توضيح من المهندس المعماري:</span>
          <div class="ex-fr" dir="ltr">« Monsieur l'Architecte, nous souhaiterions solliciter votre arbitrage concernant la cote du linteau au niveau R+1. Serait-il possible d'organiser une visite sur site demain ? »</div>
          <div class="ex-ar">« السيد المهندس المعماري، نود التماس توجيهكم بخصوص منسوب العتب الخرساني بالطابق الأول. هل سيكون من الممكن برمجة زيارة ميدانية غداً؟ »</div>
        </div>
        <div class="ex-actions">
          <button type="button" class="btn-secondary" onclick="speakFrenchText('Monsieur l\'Architecte, nous souhaiterions solliciter votre arbitrage concernant la cote du linteau.', this)">🔊 استمع</button>
          <button type="button" class="btn-secondary" onclick="copyChequeTextDirect('Monsieur l\'Architecte, nous souhaiterions solliciter votre arbitrage concernant la cote du linteau au niveau R+1. Serait-il possible d\'organiser une visite sur site demain ?')">📋 نسخ</button>
        </div>
      </div>
    `
  },
  {
    id: "voix_passive",
    category: "reports",
    badge: "محاضر واستلام 📜",
    title: "5. المبني للمجهول في محاضر الاستلام / La Voix Passive & PV",
    ar_desc: "الأسلوب الرسمي والحيادي المعتمد في صياغة تقارير المراقبة ومحاضر التسليم والاستلام (PV de Réception).",
    content: `
      <div class="grammar-rule-box">
        <strong>💡 القاعدة النحوية الأساسية:</strong>
        <p>تُبنى صيغة المبني للمجهول بـ: <code>Être (في زمن الجملة) + Participe Passé (مع المطابقة التامة مع نائب الفاعل)</code>. يُفضّل هذا الأسلوب في التقارير الهندسية لأنه يركز على <strong>المنشأ والعمل المنجز</strong> بدلاً من الشخص الذي قام به.</p>
      </div>

      <table class="gt">
        <thead>
          <tr>
            <th>صيغة المبني للمجهول (Voix Passive)</th>
            <th>المنشأ / العنصر الخاضع للفحص</th>
            <th>المعنى الفني في محضر الورشة</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><bdi dir="ltr">Les semelles <strong>ont été réceptionnées</strong> par le BET.</bdi></td>
            <td><bdi dir="ltr">Semelles (Féminin Pluriel)</bdi></td>
            <td>تم استلام وفحص القواعد الخرسانية من قبل مكتب الدراسات.</td>
          </tr>
          <tr>
            <td><bdi dir="ltr">Le béton <strong>a été coulé</strong> sous réserve d'écrasement.</bdi></td>
            <td><bdi dir="ltr">Béton (Masculin Singulier)</bdi></td>
            <td>تم صب الخرسانة مع التحفظ المرتبط بنتائج اختبار التكسير.</td>
          </tr>
          <tr>
            <td><bdi dir="ltr">Les réserves <strong>ont été levées</strong> avec succès.</bdi></td>
            <td><bdi dir="ltr">Réserves (Féminin Pluriel)</bdi></td>
            <td>تم رفع وتصحيح جميع التحفظات والملاحظات بنجاح.</td>
          </tr>
          <tr>
            <td><bdi dir="ltr">L'étanchéité <strong>sera testée</strong> par mise en eau.</bdi></td>
            <td><bdi dir="ltr">Étanchéité (Futur Passif)</bdi></td>
            <td>سيتم اختبار كتامة السطح عبر تجربة الغمر بالماء 48 ساعة.</td>
          </tr>
        </tbody>
      </table>

      <div class="ex-row">
        <div class="ex-text">
          <span class="ex-badge">بند استلام في محضر رسمي (PV de Réception Provisoire):</span>
          <div class="ex-fr" dir="ltr">« Les travaux de gros œuvre ont été déclarés conformes aux plans BPE. La réception provisoire est prononcée avec effet à compter de ce jour. »</div>
          <div class="ex-ar">« تم الإقرار بمطابقة أشغال الهيكل الأساسي للتصاميم الصالحة للتنفيذ. وتم الإعلان عن الاستلام المؤقت بآثاره ابتداء من هذا اليوم. »</div>
        </div>
        <div class="ex-actions">
          <button type="button" class="btn-secondary" onclick="speakFrenchText('Les travaux de gros œuvre ont été déclarés conformes aux plans BPE.', this)">🔊 استمع</button>
          <button type="button" class="btn-secondary" onclick="copyChequeTextDirect('Les travaux de gros œuvre ont été déclarés conformes aux plans BPE. La réception provisoire est prononcée avec effet à compter de ce jour.')">📋 نسخ</button>
        </div>
      </div>
    `
  },
  {
    id: "obligation_securite",
    category: "safety_quality",
    badge: "سلامة وجودة 🛡️",
    title: "6. الإلزام والضرورة وقواعد السلامة / Obligation & Sécurité (EPI)",
    ar_desc: "صيغ الإلزام الصارم والمنع القانوني لحماية الأرواح وتطبيق معايير السلامة المهنية في أوراش البناء.",
    content: `
      <div class="grammar-rule-box">
        <strong>💡 الصيغ والتراكيب المستعملة في لافتات وتعليمات السلامة:</strong>
        <p>1. <code>Il est obligatoire de + Infinitif</code> (يجب إلزامياً...)<br>
        2. <code>Le port de [EPI] est strictement obligatoire</code> (ارتداء معدات الوقاية إجباري صارم)<br>
        3. <code>Il est formellement interdit de + Infinitif</code> (يُمنع منعاً كلياً...)</p>
      </div>

      <table class="gt">
        <thead>
          <tr>
            <th>العبارة القانونية للسلامة</th>
            <th>مستوى الإلزام</th>
            <th>التفسير والتطبيق بالورشة</th>
            <th>النطق</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><bdi dir="ltr">Port du casque et des chaussures de sécurité obligatoire.</bdi></td>
            <td><span class="ref-cat-pill cat-wages">إجباري 100%</span></td>
            <td>ارتداء الخوذة والحذاء الفولاذي إجباري على كل من يدخل الورش.</td>
            <td><button type="button" class="gt-audio-btn" onclick="speakFrenchText('Port du casque et des chaussures de sécurité obligatoire sur tout le chantier.', this)">🔊</button></td>
          </tr>
          <tr>
            <td><bdi dir="ltr">Harnais anti-chute obligatoire au-delà de 3 mètres de hauteur.</bdi></td>
            <td><span class="ref-cat-pill cat-complex">خطر السقوط</span></td>
            <td>حزام الأمان إلزامي عند العمل على ارتفاع يفوق 3 أمتار.</td>
            <td><button type="button" class="gt-audio-btn" onclick="speakFrenchText('Harnais anti-chute obligatoire au-delà de trois mètres de hauteur.', this)">🔊</button></td>
          </tr>
          <tr>
            <td><bdi dir="ltr">Interdiction formelle de stationner sous une charge suspendue.</bdi></td>
            <td><span class="ref-cat-pill cat-complex">منع صارم ⛔</span></td>
            <td>ممنوع كلياً الوقوف أو المرور تحت حمولة الرافعة المعلقة.</td>
            <td><button type="button" class="gt-audio-btn" onclick="speakFrenchText('Interdiction formelle de stationner sous une charge suspendue.', this)">🔊</button></td>
          </tr>
          <tr>
            <td><bdi dir="ltr">Blindage obligatoire pour toute fouille supérieure à 1,30 m.</bdi></td>
            <td><span class="ref-cat-pill cat-materials">حماية الحفر</span></td>
            <td>تدعيم جوانب الحفر إجباري لتفادي الانهيارات الترابية.</td>
            <td><button type="button" class="gt-audio-btn" onclick="speakFrenchText('Blindage obligatoire pour toute fouille supérieure à un mètre trente.', this)">🔊</button></td>
          </tr>
        </tbody>
      </table>

      <div class="ex-row">
        <div class="ex-text">
          <span class="ex-badge">تعليمات السلامة في الاجتماع الصباحي (Quart d'heure sécurité):</span>
          <div class="ex-fr" dir="ltr">« Avant d'accéder à l'échafaudage, chaque ouvrier doit vérifier la présence des garde-corps, des plinthes et accrocher son harnais à la ligne de vie. »</div>
          <div class="ex-ar">« قبل الصعود إلى السقالة، يجب على كل عامل التحقق من وجود حواجز الحماية والحواف السفلية وربط حزام الأمان بحبل النجاة. »</div>
        </div>
        <div class="ex-actions">
          <button type="button" class="btn-secondary" onclick="speakFrenchText('Avant d\'accéder à l\'échafaudage, chaque ouvrier doit vérifier la présence des garde-corps.', this)">🔊 استمع</button>
          <button type="button" class="btn-secondary" onclick="copyChequeTextDirect('Avant d\'accéder à l\'échafaudage, chaque ouvrier doit vérifier la présence des garde-corps, des plinthes et accrocher son harnais à la ligne de vie.')">📋 نسخ</button>
        </div>
      </div>
    `
  },
  {
    id: "prepositions_cotes",
    category: "safety_quality",
    badge: "مواقع ومناسيب 📐",
    title: "7. حروف الجر المكانية والمناسيب / Prépositions & Cotes NGF",
    ar_desc: "تحديد المواقع بدقة على المخططات والميدان، قراءة المناسيب، ومحاذاة المحاور الإنشائية.",
    content: `
      <div class="grammar-rule-box">
        <strong>💡 حروف الجر المكانية الأكثر دقة في لغة المهندسين:</strong>
        <p>تستخدم لغة البناء مصطلحات مكانية خاصة لا تحتمل اللبس لتحديد مواقع الكمرات والأعمدة والفواصل بدقة المليمتر.</p>
      </div>

      <table class="gt">
        <thead>
          <tr>
            <th>المصطلح المكاني الفرنسي</th>
            <th>الترجمة الهندسية الدقيقة</th>
            <th>المثال التطبيقي على المخطط</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><bdi dir="ltr"><strong>Au droit de</strong> (la poutre P1)</bdi></td>
            <td>بمحاذاة عمودية / في خط ومسقط</td>
            <td>Prévoir un renfort d'acier <em>au droit de</em> l'ouverture.</td>
          </tr>
          <tr>
            <td><bdi dir="ltr"><strong>À l'axe de</strong> (la file 3)</bdi></td>
            <td>في محور / منتصف الخط</td>
            <td>Implanter le poteau exactement <em>à l'axe</em> de la file B.</td>
          </tr>
          <tr>
            <td><bdi dir="ltr"><strong>En rive de</strong> (la dalle)</bdi></td>
            <td>على حافة / طرف البلاطة</td>
            <td>Poser les garde-corps métalliques <em>en rive</em> du plancher.</td>
          </tr>
          <tr>
            <td><bdi dir="ltr"><strong>Arase supérieure</strong></bdi></td>
            <td>المنسوب العلوي النهائي للصب</td>
            <td>Couler le béton jusqu'à l'<em>arase supérieure</em> (+3.20 m).</td>
          </tr>
          <tr>
            <td><bdi dir="ltr"><strong>Nu extérieur</strong> (du voile)</bdi></td>
            <td>الوجه الخارجي الأملس للحائط</td>
            <td>Mesurer l'épaisseur à partir du <em>nu extérieur</em>.</td>
          </tr>
        </tbody>
      </table>

      <div class="ex-row">
        <div class="ex-text">
          <span class="ex-badge">توجيه طبوغرافي لمهندس الموقع:</span>
          <div class="ex-fr" dir="ltr">« Le niveau fini du dallage doit correspondre rigoureusement à la cote NGF +45.80 m, avec une tolérance d'exécution maximale de 5 millimètres. »</div>
          <div class="ex-ar">« يجب أن يتطابق المنسوب النهائي للأرضية الخرسانية تماماً مع المنسوب الوطني +45.80 م، مع فارق تفاوت أقصى لا يتجاوز 5 مليمترات. »</div>
        </div>
        <div class="ex-actions">
          <button type="button" class="btn-secondary" onclick="speakFrenchText('Le niveau fini du dallage doit correspondre rigoureusement à la cote NGF.', this)">🔊 استمع</button>
          <button type="button" class="btn-secondary" onclick="copyChequeTextDirect('Le niveau fini du dallage doit correspondre rigoureusement à la cote NGF +45.80 m, avec une tolérance d\'exécution maximale de 5 millimètres.')">📋 نسخ</button>
        </div>
      </div>
    `
  },
  {
    id: "cause_consequence_retards",
    category: "reports",
    badge: "أسباب وتأخيرات ⏳",
    title: "8. السبب والنتيجة وتبرير التأخير / Cause, Conséquence & Intempéries",
    ar_desc: "صياغة المذكرات التبريرية عند توقف الورش لتمديد الآجال التعاقدية والحماية القانونية من غرامات التأخير.",
    content: `
      <div class="grammar-rule-box">
        <strong>💡 أدوات الربط السببية والنتائج في النزاعات التعاقدية:</strong>
        <ul style="margin: 6px 18px 0; padding: 0; line-height: 1.8;">
          <li><code>En raison de / Du fait de + Nom</code> (نظراً لـ / بسبب...)</li>
          <li><code>Suite à + Nom</code> (عقب / على إثر...)</li>
          <li><code>Par conséquent / De ce fait</code> (وبناءً عليه / بالتالي...)</li>
          <li><code>Cas de force majeure</code> (حالة القوة القاهرة المعفية من المسؤولية)</li>
        </ul>
      </div>

      <table class="gt">
        <thead>
          <tr>
            <th>صياغة السبب والنتيجة</th>
            <th>الظرف الطارئ (Événement)</th>
            <th>الأثر القانوني والمالي</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><bdi dir="ltr"><strong>En raison des intempéries</strong> (pluies torrentielles), les travaux de terrassement ont été suspendus.</bdi></td>
            <td>أحوال جوية قاسية (Intempéries)</td>
            <td>الحق في تمديد مدة الإنجاز بعدد أيام التوقف المسجلة في دفتر الورشة.</td>
          </tr>
          <tr>
            <td><bdi dir="ltr"><strong>Suite au retard de validation</strong> des plans par le BET, le coulage est reporté.</bdi></td>
            <td>تأخر مكتب الدراسات</td>
            <td>إخلاء مسؤولية المقاول عن تأخر صب السقف.</td>
          </tr>
          <tr>
            <td><bdi dir="ltr"><strong>Par conséquent</strong>, nous sollicitons une prolongation de délai de 10 jours ouvrés.</bdi></td>
            <td>طلب تمديد تعاقدي</td>
            <td>تجنب تطبيق غرامات التأخير (Pénalités de retard).</td>
          </tr>
        </tbody>
      </table>

      <div class="ex-row">
        <div class="ex-text">
          <span class="ex-badge">مذكرة تبرير تأخير موجهة إلى صاحب المشروع:</span>
          <div class="ex-fr" dir="ltr">« En raison des fortes intempéries survenues du 10 au 14 novembre et dûment constatées sur le journal de chantier, les accès ont été inondés. Par conséquent, nous sollicitons le report de la date de livraison. »</div>
          <div class="ex-ar">« نظراً للأحوال الجوية القاسية التي شهدها الموقع من 10 إلى 14 نونبر والمعاينة قانوناً بدفتر الورشة، غمرت المياه المداخل. وبناءً عليه، نلتمس تمديد تاريخ التسليم. »</div>
        </div>
        <div class="ex-actions">
          <button type="button" class="btn-secondary" onclick="speakFrenchText('En raison des fortes intempéries survenues du 10 au 14 novembre, les accès ont été inondés.', this)">🔊 استمع</button>
          <button type="button" class="btn-secondary" onclick="copyChequeTextDirect('En raison des fortes intempéries survenues du 10 au 14 novembre et dûment constatées sur le journal de chantier, les accès ont été inondés. Par conséquent, nous sollicitons le report de la date de livraison.')">📋 نسخ</button>
        </div>
      </div>
    `
  },
  {
    id: "noms_composes",
    category: "safety_quality",
    badge: "مصطلحات وتركيب 🏗️",
    title: "9. الأسماء المركبة ومصطلحات الهيكل / Noms Composés du Gros Œuvre",
    ar_desc: "قواعد كتابة وجمع الأسماء المركبة والصفات الفنية المستعملة في تقارير ومخططات الهندسة المدنية بالمغرب.",
    content: `
      <div class="grammar-rule-box">
        <strong>💡 قواعد الشرطة والجمع في الأسماء الفنية المركبة:</strong>
        <p>تتكون أغلب المصطلحات الهندسية من اسمين أو اسم وصفة متصلين بشرطة (<em>trait d'union</em>) أو بحرف جر. في حالة الجمع، تُجمع الأسماء والصفات فقط، بينما الأفعال وحروف الجر تبقى ثابتة (Invariable).</p>
      </div>

      <table class="gt">
        <thead>
          <tr>
            <th>المصطلح بالمفرد</th>
            <th>المصطلح بالجمع (Pluriel)</th>
            <th>قاعدة الجمع والملاحظة الفنية</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><bdi dir="ltr">Un porte-à-faux</bdi></td>
            <td><bdi dir="ltr">Des <strong>porte-à-faux</strong></bdi></td>
            <td>بلاطة بروز (كورنيش/بالكون) — لا يتغير نهائياً لأن الأول فعل (porte).</td>
          </tr>
          <tr>
            <td><bdi dir="ltr">Un joint de dilatation</bdi></td>
            <td><bdi dir="ltr">Des <strong>joints</strong> de dilatation</bdi></td>
            <td>فاصل تمدد (2-3 سم) — نجمع فقط الكلمة الأولى (joints).</td>
          </tr>
          <tr>
            <td><bdi dir="ltr">Un procès-verbal (PV)</bdi></td>
            <td><bdi dir="ltr">Des <strong>procès-verbaux</strong></bdi></td>
            <td>محضر استلام — نجمع الاسمين معاً (procès + verbaux).</td>
          </tr>
          <tr>
            <td><bdi dir="ltr">Un béton prêt à l'emploi (BPE)</bdi></td>
            <td><bdi dir="ltr">Des bétons <strong>prêts</strong> à l'emploi</bdi></td>
            <td>خرسانة جاهزة — تطابق الصفة (prêts).</td>
          </tr>
          <tr>
            <td><bdi dir="ltr">Un garde-corps</bdi></td>
            <td><bdi dir="ltr">Des <strong>garde-corps</strong></bdi></td>
            <td>حاجز حماية وسقوط — لا يتغير (garde فعل).</td>
          </tr>
        </tbody>
      </table>

      <div class="ex-row">
        <div class="ex-text">
          <span class="ex-badge">ملاحظة جودة في تقرير مكتب المراقبة:</span>
          <div class="ex-fr" dir="ltr">« Les fers en chapeaux des porte-à-faux doivent être surélevés à l'aide de cales d'enrobage pour éviter tout risque de fissuration en partie supérieure. »</div>
          <div class="ex-ar">« يجب رفع قبعات تسليح بلاطات البروز باستعمال بسكوتات التباعد لمنع أي خطر تشقق في الطبقة العلوية. »</div>
        </div>
        <div class="ex-actions">
          <button type="button" class="btn-secondary" onclick="speakFrenchText('Les fers en chapeaux des porte-à-faux doivent être surélevés à l\'aide de cales d\'enrobage.', this)">🔊 استمع</button>
          <button type="button" class="btn-secondary" onclick="copyChequeTextDirect('Les fers en chapeaux des porte-à-faux doivent être surélevés à l\'aide de cales d\'enrobage pour éviter tout risque de fissuration en partie supérieure.')">📋 نسخ</button>
        </div>
      </div>
    `
  },
  {
    id: "formules_emails",
    category: "planning",
    badge: "صيغ المراسلات ✉️",
    title: "10. العبارات النموذجية للإيميلات ورسائل الورشة / Formules Types d'E-mails",
    ar_desc: "قوالب وعبارات نموذجية جاهزة للبدء والختام والتأكيد في المراسلات اليومية مع الشركاء والموردين والمكاتب.",
    content: `
      <div class="grammar-rule-box">
        <strong>💡 هيكل الإيميل المهني النموذجي في قطاع BTP:</strong>
        <p>1. <strong>الموضوع (Objet):</strong> واضح ودقيق يحدد اسم المشروع ورقم الصفقة وطبيعة الطلب.<br>
        2. <strong>الافتتاحية (Formule d'attaque):</strong> <em>Monsieur l'Architecte / Madame, Monsieur / Cher Partenaire</em>.<br>
        3. <strong>جسم الرسالة (Corps du message):</strong> مباشر ومرفق بأرقام وتواريخ ومراجع المخططات.<br>
        4. <strong>الخاتمة (Formule de politesse):</strong> مهنية وموجزة.</p>
      </div>

      <table class="gt">
        <thead>
          <tr>
            <th>نوع العبارة في الإيميل</th>
            <th>الصيغة الفرنسية المعتمدة</th>
            <th>الترجمة والاستخدام الميداني</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="ref-cat-pill cat-materials">موضوع الإيميل</span></td>
            <td><bdi dir="ltr">Objet : Chantier [Nom] - Demande de validation ferraillage Voiles</bdi></td>
            <td>تحديد اسم المشروع والموضوع بدقة</td>
          </tr>
          <tr>
            <td><span class="ref-cat-pill cat-studies">افتتاح وتذكير</span></td>
            <td><bdi dir="ltr">Faisant suite à notre visite de chantier de ce matin...</bdi></td>
            <td>عطفاً على زيارتنا الميدانية صباح هذا اليوم...</td>
          </tr>
          <tr>
            <td><span class="ref-cat-pill cat-contracts">إرفاق وثائق</span></td>
            <td><bdi dir="ltr">Nous vous prions de bien vouloir trouver ci-joint le décompte N°4.</bdi></td>
            <td>نرجو منكم التفضل بالاطلاع على الكشف الحسابي رقم 4 المرفق طيه.</td>
          </tr>
          <tr>
            <td><span class="ref-cat-pill cat-guarantees">تأكيد التزام</span></td>
            <td><bdi dir="ltr">Nous vous confirmons la livraison des toupies de béton pour demain 08h00.</bdi></td>
            <td>نؤكد لكم برمجة توريد شاحنات الخرسانة ليوم غد على الساعة 08:00.</td>
          </tr>
          <tr>
            <td><span class="ref-cat-pill cat-wages">خاتمة مهنية</span></td>
            <td><bdi dir="ltr">Restant à votre entière disposition pour tout renseignement complémentaire.</bdi></td>
            <td>نبقى رهن إشارتكم لأي توضيحات أو معلومات إضافية.</td>
          </tr>
        </tbody>
      </table>

      <div class="ex-row">
        <div class="ex-text">
          <span class="ex-badge">إيميل كامل لطلب استلام حديد قبل الصب (Convocations Réception):</span>
          <div class="ex-fr" dir="ltr">« Monsieur l'Ingénieur, nous vous informons que le ferraillage des longrines du bloc A est achevé. Nous vous convions à la réception sur site demain à 10h00 afin de délivrer le bon de coulage. Cordialement. »</div>
          <div class="ex-ar">« السيد المهندس، نخبركم بانتهاء تسليح شدادات الأساس للبلوك A. ندعوكم لزيارة الاستلام غداً على الساعة 10:00 لمنحنا إذن الصب. مع أزكى التحيات. »</div>
        </div>
        <div class="ex-actions">
          <button type="button" class="btn-secondary" onclick="speakFrenchText('Monsieur l\'Ingénieur, nous vous informons que le ferraillage des longrines du bloc A est achevé.', this)">🔊 استمع</button>
          <button type="button" class="btn-secondary" onclick="copyChequeTextDirect('Monsieur l\'Ingénieur, nous vous informons que le ferraillage des longrines du bloc A est achevé. Nous vous convions à la réception sur site demain à 10h00 afin de délivrer le bon de coulage. Cordialement.')">📋 نسخ</button>
        </div>
      </div>
    `
  }
];
