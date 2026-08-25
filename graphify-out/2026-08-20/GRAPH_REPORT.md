# Graph Report - BTP maroc v1 2026  (2026-08-20)

## Corpus Check
- 35 files · ~113,713 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 376 nodes · 740 edges · 23 communities (20 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- cheques-tab.js
- vocab-tab.js
- quiz-tab.js
- reading-tab.js
- app.js
- grammar-tab.js
- validate-app.mjs
- build.mjs
- manifest.json
- scripts
- modularize.mjs
- calc-tab.js
- validate-netlify.mjs
- sw.js
- build-netlify.mjs
- extract-source.mjs
- server.mjs
- 🏗️ الفرنسية المهنية للبناء والأوراش بالمغرب / Français BTP Maroc Pro
- App improvement roadmap
- نشر التطبيق على Netlify
- rules/graphify.md
- workflows/graphify.md

## God Nodes (most connected - your core abstractions)
1. `showToast()` - 34 edges
2. `speakFrenchText()` - 19 edges
3. `saveStateToLocalStorage()` - 18 edges
4. `bootstrapApp()` - 17 edges
5. `getWordId()` - 16 edges
6. `renderVocabList()` - 16 edges
7. `getVocabDataset()` - 15 edges
8. `appendTextElement()` - 15 edges
9. `initStats()` - 14 edges
10. `🏗️ الفرنسية المهنية للبناء والأوراش بالمغرب / Français BTP Maroc Pro` - 13 edges

## Surprising Connections (you probably didn't know these)
- `installPWAApp()` --calls--> `showToast()`  [EXTRACTED]
  src/modules/pwa.js → src/modules/ui-utils.js
- `updateQuizScopeCounts()` --indirect_call--> `getWordId()`  [INFERRED]
  src/modules/tabs/quiz-tab.js → src/modules/state.js
- `copyCalcResult()` --calls--> `showToast()`  [EXTRACTED]
  src/modules/tabs/calc-tab.js → src/modules/ui-utils.js
- `bootstrapApp()` --calls--> `initStats()`  [EXTRACTED]
  src/app.js → src/modules/state.js
- `bootstrapApp()` --calls--> `loadStateFromLocalStorage()`  [EXTRACTED]
  src/app.js → src/modules/state.js

## Import Cycles
- None detected.

## Communities (23 total, 3 thin omitted)

### Community 0 - "cheques-tab.js"
Cohesion: 0.08
Nodes (50): NUMBERS_DATA, frWordsToPron(), speakFrenchText(), BANK_NAMES_MAP, buildChequeAmountWords(), checkNumInput(), CHEQUE_MAX_AMOUNT, copyChequeText() (+42 more)

### Community 1 - "vocab-tab.js"
Cohesion: 0.11
Nodes (38): PLAN_TASKS, markCurrentLearned(), prewarmTtsVoices(), ttsAvailable(), getVocabDataset(), getVocabSearchIndex(), getWordId(), hashString() (+30 more)

### Community 2 - "quiz-tab.js"
Cohesion: 0.16
Nodes (30): speakCurrentWord(), beginQuizRun(), buildClozePrompt(), buildQuizModeQueue(), buildQuizOptions(), finishQuizSession(), getQuizAnswer(), getQuizConfigFromControls() (+22 more)

### Community 3 - "reading-tab.js"
Cohesion: 0.17
Nodes (22): READING_DOCS, adjustReadingFont(), assessReadingAnswer(), buildReadingQuestion(), copyReadingDocument(), filterReadingDocsByCategory(), getReadingAssessment(), getReadingProgress() (+14 more)

### Community 4 - "app.js"
Cohesion: 0.16
Nodes (20): bootstrapApp(), WRITING_TEMPLATES, initPWA(), installPWAApp(), updateChequeDetails(), BTP_SITE_PHRASES, copyTemplateToClipboard(), EMAIL_SCENARIOS (+12 more)

### Community 5 - "grammar-tab.js"
Cohesion: 0.14
Nodes (18): GRAMMAR_LESSONS, toggleChequeCertifie(), BTP_VERBS, filterGrammarByCategory(), GRAMMAR_QUIZ_QUESTIONS, handleGrammarSearch(), initGrammarQuiz(), nextGrammarQuizQuestion() (+10 more)

### Community 6 - "validate-app.mjs"
Cohesion: 0.11
Nodes (15): checks, html, manifest, modularSourceFiles, numbersContext, numbersEnd, numbersStart, readingDocs (+7 more)

### Community 7 - "build.mjs"
Cohesion: 0.14
Nodes (15): builtHtml, cleanExports(), combinedCss, combinedDatasets, combinedModules, cssFiles, grammarLessons, moduleFiles (+7 more)

### Community 8 - "manifest.json"
Cohesion: 0.14
Nodes (13): background_color, description, dir, display, icons, id, lang, name (+5 more)

### Community 9 - "scripts"
Cohesion: 0.14
Nodes (13): description, engines, node, name, private, scripts, build, build:netlify (+5 more)

### Community 10 - "modularize.mjs"
Cohesion: 0.15
Nodes (9): numbersDataStart, numbersDataStr, pronTokensStart, pronTokensStr, rawCss, rawJs, root, stateDef (+1 more)

### Community 11 - "calc-tab.js"
Cohesion: 0.20
Nodes (3): calculateBtpBeton(), copyCalcResult(), setBetonPreset()

### Community 12 - "validate-netlify.mjs"
Cohesion: 0.18
Nodes (9): deployedFiles, headers, html, manifest, metadata, required, root, sw (+1 more)

### Community 14 - "build-netlify.mjs"
Cohesion: 0.33
Nodes (5): files, metadata, output, packageJson, root

### Community 15 - "extract-source.mjs"
Cohesion: 0.50
Nodes (3): targetHomePath, targetProjectFile, targetProjectsDir

### Community 16 - "server.mjs"
Cohesion: 0.50
Nodes (3): MIME_TYPES, root, server

### Community 18 - "🏗️ الفرنسية المهنية للبناء والأوراش بالمغرب / Français BTP Maroc Pro"
Cohesion: 0.07
Nodes (29): 1. الاستكشاف الصوتي والسياقي (Auditory & Contextual Anchoring):, 1. التشغيل المحلي (Local Preview):, 2. الاستدعاء النشط (Active Recall):, 2. البناء والتحقق من الإنتاج:, 3. التكرار المتباعد ومعالجة الأخطاء (Spaced Repetition & Error Bank):, 3. النشر على Netlify:, 4. الإنتاج والتطبيق الميداني (Active Production):, ⚖️ إخلاء المسؤولية الهندسية والقانونية (+21 more)

### Community 19 - "App improvement roadmap"
Cohesion: 0.14
Nodes (13): App improvement roadmap, Completed in 2.7.0, Completed in 2.8.0, Completed in 2.9.0, Completed in 3.0.0, Completed in 3.1.0, Completed in 3.1.1, Completed in 3.1.2 (Modular Architecture Refactor) (+5 more)

### Community 20 - "نشر التطبيق على Netlify"
Cohesion: 0.29
Nodes (6): إعدادات ما بعد النشر, التحقق من النشر, الربط مع Git, الطريقة الأسهل: رفع ZIP, ملاحظات, نشر التطبيق على Netlify

## Knowledge Gaps
- **140 isolated node(s):** `id`, `name`, `short_name`, `description`, `lang` (+135 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `showToast()` connect `cheques-tab.js` to `vocab-tab.js`, `quiz-tab.js`, `reading-tab.js`, `app.js`, `grammar-tab.js`, `calc-tab.js`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `speakFrenchText()` connect `cheques-tab.js` to `vocab-tab.js`, `quiz-tab.js`, `reading-tab.js`, `app.js`, `grammar-tab.js`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `appendTextElement()` connect `reading-tab.js` to `cheques-tab.js`, `vocab-tab.js`, `quiz-tab.js`, `app.js`, `grammar-tab.js`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `id`, `name`, `short_name` to the rest of the system?**
  _140 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cheques-tab.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07946127946127945 - nodes in this community are weakly interconnected._
- **Should `vocab-tab.js` be split into smaller, more focused modules?**
  _Cohesion score 0.11205073995771671 - nodes in this community are weakly interconnected._
- **Should `grammar-tab.js` be split into smaller, more focused modules?**
  _Cohesion score 0.13852813852813853 - nodes in this community are weakly interconnected._