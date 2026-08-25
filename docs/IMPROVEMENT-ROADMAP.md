# App improvement roadmap

This roadmap separates the completed stabilization work from larger product and architecture upgrades. Priorities are ordered by user risk and maintenance value.

## Completed in 3.1.2 (Modular Architecture Refactor)

- Split the monolithic `index.html` into semantic layers under `src/`:
  - Styles: `src/styles/` (`tokens.css`, `base.css`, `components.css`, `md3-theme.css`, `mobile-nord5.css`, `index.css`).
  - Datasets: `src/data/` (`reading-docs.js`, `writing-templates.js`, `grammar-lessons.js`, `plan-tasks.js`, `numbers-ref.js`).
  - Core Modules: `src/modules/` (`state.js`, `audio.js`, `ui-utils.js`, `pwa.js`).
  - Dedicated Tab Controllers: `src/modules/tabs/` (`vocab-tab.js`, `quiz-tab.js`, `cheques-tab.js`, `calc-tab.js`, `reading-tab.js`, `writing-tab.js`, `grammar-tab.js`, `plan-tab.js`).
- Created a zero-dependency, ultra-fast Node.js build pipeline (`tools/build.mjs`) ensuring 100% offline self-containment.
- Updated `npm test` and `npm run deploy:check` to validate both modular sources and production artifacts.

## Completed in 3.1.1

- Fixed reversed thousands and millions in RTL number cards by isolating numeric labels as left-to-right content.
- Added a regression check for digit grouping such as `2 000` and `1 000 000`.

## Completed in 3.1.0

- Rebuilt the cheque amount field around locale-aware parsing for French, Arabic, pasted grouping separators, and centimes.
- Added explicit empty, invalid, out-of-range, and valid states plus improved Arabic currency wording.
- Separated beneficiary, place, and date editing from the cheque preview and marked the preview as an educational specimen.
- Added complete-copy, French-copy, speech, reset, and safer clipboard fallback actions.
- Turned number practice into bounded 5/10/20-question sessions with progress, accuracy, results, duplicate-answer protection, and repeat-question avoidance.
- Added direct regression tests for French number grammar, localized amount parsing, and accessible editor/game controls.

## Completed in 3.0.0

- Added a final responsive profile for the OnePlus Nord 5 display range, including portrait and short landscape layouts.
- Added Android safe-area support, dynamic viewport height, and keyboard-aware viewport behavior.
- Standardized primary mobile touch targets at 48 px and prevented input focus zoom.
- Reduced continuous and hover-only effects on coarse touch screens and enabled rendering containment for long learning lists.
- Added a repeatable 424 × 933 CSS-pixel preview harness and automated profile checks.

## Completed in 2.9.0

- Reframed the reading collection as simulated professional training material rather than claiming the examples are official documents.
- Preserved the documents’ original line, table, heading, and amount structure in the reader.
- Added document search, level filtering, reading-time estimates, analysis prompts, font controls, speech, and copying.
- Turned model-answer reveals into a write-first comprehension workflow.
- Added per-question self-assessment, persistent document progress, completion indicators, and reset controls.
- Added safer DOM-based rendering and semantic progress and disclosure states.

## Completed in 2.8.0

- Rebuilt the quiz setup as a responsive configuration grid with live availability counts.
- Added adaptive ordering that prioritizes previous mistakes and unlearned vocabulary.
- Balanced mixed-mode sessions across translation, pronunciation, and cloze questions.
- Improved distractors by preferring terms from the same category and level.
- Added unbiased Fisher–Yates shuffling and duplicate-answer protection.
- Added live score, best streak, semantic progress, question metadata, exit control, and keyboard shortcuts.
- Expanded results with accuracy metrics, session duration, chosen-versus-correct answers, and focused mistake review.

## Completed in 2.7.0

- Rebuilt the manifest and versioned service-worker cache with same-origin request handling.
- Added local regular and maskable application icons.
- Replaced ambiguous learned-word keys with stable identities and migrated existing saved progress.
- Made French search accent-insensitive.
- Repaired cloze questions so they are only offered when a visible blank can be created.
- Scoped quiz answer disabling to the current quiz controls.
- Removed duplicate calculator and service-worker code.
- Made TVA, retention percentage, and retention basis configurable and connected to the calculation.
- Added explicit professional, tax, contract, banking, and engineering-use disclaimers.
- Added keyboard-accessible ARIA tabs, field labels, live feedback regions, language hints, and reduced-motion support.
- Added a dependency-free validation command and updated project documentation.

## Next: content quality and trust

1. Assign a content owner and review every lesson, sample document, template, and vocabulary category with a bilingual construction professional.
2. Add `review_status`, `reviewed_by`, `reviewed_at`, and `source_url` fields to sourceable content.
3. Distinguish clearly between fictional examples, current official rules, standards, and company-specific practices.
4. Review all tax, banking, labor, safety, material-consumption, and structural statements against current Moroccan primary sources.
5. Add an in-app “About, sources, privacy, and limitations” screen.

Acceptance criteria: no unsupported superlatives or market-coverage claims; every high-risk claim has an owner, review date, and source; every fictional document is labelled as an example.

## Next: architecture and maintainability

1. Split the single HTML file into semantic modules: shell, vocabulary, quiz, numbers, documents, templates, grammar, study plan, calculators, and persistence.
2. Move styles into layered CSS files and remove repeated inline styling and inline event handlers.
3. Move embedded content arrays into validated JSON modules with a documented schema.
4. Introduce a small build step only after the source split is complete; keep the deployed output static and offline-capable.
5. Add format/lint checks and unit tests for number conversion, progress migration, cloze generation, calculator formulas, and storage failures.

Acceptance criteria: no duplicated function names, module boundaries are explicit, content can be updated without editing UI code, and all pure logic has tests.

## Next: learning effectiveness

1. Replace the binary “learned” flag with spaced repetition using due dates, difficulty, lapses, and review history.
2. Add session summaries and recommendations based on mistakes and overdue cards.
3. Let users export and import progress as a local JSON backup.
4. Add optional typed answers and listening exercises in addition to multiple choice.
5. Measure completion, retention, quiz accuracy, and content coverage locally before considering analytics.

Acceptance criteria: progress survives export/import, review scheduling is deterministic and tested, and users can understand why each item is due.

## Next: UX, accessibility, and performance

1. Test with Arabic and French screen readers, keyboard-only navigation, 200% zoom, and high-contrast modes.
2. Add an offline/update status indicator and a user-controlled “apply update” action.
3. Virtualize or paginate long category lists and profile startup on low-end Android hardware.
4. Package fonts locally or document that system fonts are used offline.
5. Add automated checks with Lighthouse and axe in a browser-test workflow.

Acceptance criteria: WCAG 2.2 AA issues are triaged, no horizontal overflow at supported widths, core tasks work offline, and startup budgets are documented.

## Release and operations

1. Initialize source control before the next feature release and adopt tagged releases with a changelog.
2. Add a clear license and contribution policy before public distribution.
3. Deploy preview builds over HTTPS and test install/update/offline behavior for every release.
4. Retire or clearly archive the older generated HTML and ZIP copies under `data/` so they cannot be deployed by mistake.

Acceptance criteria: every production release is reproducible, reversible, validated, and accompanied by content-review status.
