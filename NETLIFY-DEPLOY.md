# نشر التطبيق على Netlify

## الطريقة الأسهل: رفع ZIP

1. استعمل ملف ZIP الجاهز المرفق مع التسليم، أو أعد بناء مجلد الإنتاج من مجلد المشروع:

   ```powershell
   npm run deploy:check
   ```

2. إذا أعدت البناء محلياً، ارفع مجلد `dist` أو أنشئ منه ZIP:

   ```powershell
   Compress-Archive -Path dist\* -DestinationPath francais-btp-maroc-netlify-v3.1.1.zip -Force
   ```

3. سجّل الدخول إلى [Netlify Drop](https://app.netlify.com/drop).
4. اسحب ملف ZIP أو مجلد `dist` إلى منطقة الرفع وانتظر ظهور رابط ينتهي بـ `netlify.app`.
5. افتح الموقع، جرّب الاختبار والقراءة، ثم ثبّت التطبيق من المتصفح للتأكد من PWA.

لا ترفع ZIP القديم الموجود داخل مجلد `data`؛ فهو نسخة أرشيفية سابقة.

## الربط مع Git

إذا وضعت المشروع في GitHub أو GitLab وربطته بـ Netlify، سيقرأ Netlify ملف `netlify.toml` تلقائياً:

- Build command: `npm run build:netlify`
- Publish directory: `dist`
- Node.js: الإصدار 20

لا تحتاج إلى إضافة Environment Variables أو Functions أو قاعدة بيانات لهذا الإصدار.

## إعدادات ما بعد النشر

- غيّر اسم الموقع من **Site configuration → General → Site details**.
- أضف نطاقاً خاصاً من **Domain management** إذا توفر.
- اترك HTTPS مفعّلاً؛ فهو ضروري لتثبيت PWA وتشغيل Service Worker.
- عند نشر تحديث جديد، شغّل `npm run deploy:check` مجدداً وارفع ZIP الجديد من صفحة Deploys.

## التحقق من النشر

بعد الرفع تأكد من التالي:

- الصفحة الرئيسية تفتح دون 404.
- عدد المفردات يظهر `1,961`.
- الاختبار يبدأ ويعرض أربعة اختيارات.
- وحدة القراءة تعرض أسطر الوثائق كما هي.
- الواجهة لا تحتوي على تمرير أفقي عند معاينتها بعرض `424px`، وتبقى الأزرار الرئيسية سهلة اللمس.
- بعد إعادة تحميل الصفحة يبقى التقدم محفوظاً.
- من DevTools → Application يظهر Service Worker بحالة `activated`.
- بعد فتح الموقع مرة واحدة، جرّب وضع Offline وأعد تحميل الصفحة.

## ملاحظات

- مجلد `dist` وملف ZIP ناتجان قابلان لإعادة البناء، وليسا المصدر الرئيسي للتعديل.
- `_headers` يضيف سياسات أمان وتخزين مؤقت مناسبة للتطبيق وService Worker.
- التطبيق ثابت بالكامل ولا يرسل بيانات المستخدم إلى Netlify أو إلى API خارجية.
