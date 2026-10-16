import { state, getVocabDataset, getVocabSearchIndex, getWordId, normalizeSearchText, saveStateToLocalStorage, initStats } from '../state.js';
import { appendTextElement, showToast } from '../ui-utils.js';
import { speakFrenchText, ttsAvailable } from '../audio.js';
import { renderStudyPlan } from './plan-tab.js';
import { renderReadingDocsSelector } from './reading-tab.js';

let searchDebounceTimer = null;
let vocabScrollObserver = null;

function isCompactViewport() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    && window.matchMedia('(max-width: 900px)').matches;
}

function syncExampleDisclosure() {
  const compact = isCompactViewport();
  document.querySelectorAll('.word-example-details').forEach(details => {
    details.open = !compact;
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('resize', syncExampleDisclosure, { passive: true });
}

const PHASE_NAMES = {
      1: "1. الأساسات والحفر · Terrassement & Fondations",
      2: "2. الهيكل والخرسانة · Gros Œuvre & Structure",
      3: "3. النجارة والكتامة · Charpente, Toiture & Étanchéité",
      4: "4. الأشغال الثانوية · Second Œuvre",
      5: "5. التشطيبات والديكور · Finitions & Aménagement",
      6: "6. التسيير والسلامة والأدوات · Transversal & Gestion"
    };

    export const SHORT_PHASE_NAMES = {
      1: "1. الأساسات والحفر",
      2: "2. الهيكل والخرسانة",
      3: "3. النجارة والكتامة",
      4: "4. الأشغال الثانوية",
      5: "5. التشطيبات والديكور",
      6: "6. التسيير والسلامة والأدوات"
    };

    function getCategoryLabelParts(label) {
      const parts = String(label || 'عام').split(/\s*\/\s*/);
      return { primary: parts[0].trim(), secondary: parts.slice(1).join(' / ').trim() };
    }

    function appendCategoryLabel(parent, label) {
      const labelWrap = appendTextElement(parent, 'span', 'category-label', '');
      const parts = getCategoryLabelParts(label);
      appendTextElement(labelWrap, 'span', 'cat-label-primary', parts.primary);
      if (parts.secondary) appendTextElement(labelWrap, 'span', 'cat-label-secondary', parts.secondary);
      return labelWrap;
    }

    function renderVocabCategoryFilter() {
      const container = document.getElementById('category-filter-list');
      if (!container) return;
      
      const dataset = getVocabDataset();
      const categoriesMap = new Map();
      dataset.forEach(word => {
        const cat = word.category;
        const phase = word.phase || 6;
        if (!categoriesMap.has(cat)) {
          categoriesMap.set(cat, { count: 0, learned: 0, phase });
        }
        const info = categoriesMap.get(cat);
        info.count++;
        if (state.learned.has(getWordId(word))) info.learned++;
      });
      
      const fragment = document.createDocumentFragment();

      const allButton = document.createElement('button');
      allButton.type = 'button';
      allButton.className = 'category-item active-cat';
      allButton.id = 'cat-btn-all';
      allButton.dataset.category = 'all';
      allButton.setAttribute('aria-pressed', String(state.activeCategory === 'all'));
      allButton.addEventListener('click', () => setCategoryFilter('all', allButton));
      appendCategoryLabel(allButton, 'كل المصطلحات / Tout');
      const allLearnedCount = dataset.reduce((count, word) => count + (state.learned.has(getWordId(word)) ? 1 : 0), 0);
      appendTextElement(allButton, 'span', 'cat-count', `${allLearnedCount} / ${dataset.length}`);
      fragment.appendChild(allButton);

      const sortedCategories = Array.from(categoriesMap.entries()).sort((a, b) => {
        if (a[1].phase !== b[1].phase) return a[1].phase - b[1].phase;
        return a[0].localeCompare(b[0], 'ar');
      });

      let currentPhase = null;
      sortedCategories.forEach(([catName, info]) => {
        if (info.phase !== currentPhase) {
          currentPhase = info.phase;
          const phaseHeader = document.createElement('div');
          phaseHeader.className = 'phase-header';
          phaseHeader.textContent = PHASE_NAMES[currentPhase] || `المرحلة ${currentPhase}`;
          fragment.appendChild(phaseHeader);
        }

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'category-item';
        button.id = `cat-btn-${encodeURIComponent(catName)}`;
        button.dataset.category = catName;
        button.setAttribute('aria-pressed', String(state.activeCategory === catName));
        button.addEventListener('click', () => setCategoryFilter(catName, button));
        appendCategoryLabel(button, catName);
        appendTextElement(button, 'span', 'cat-count', `${info.learned} / ${info.count}`);
        fragment.appendChild(button);
      });

      container.replaceChildren(fragment);
      updateVocabLearningSummary();
    }

    function setCategoryFilter(catName, btnEl) {
      document.querySelectorAll('#category-filter-list .category-item').forEach(btn => {
        btn.classList.remove('active-cat');
        btn.setAttribute('aria-pressed', 'false');
      });
      if (btnEl) {
        btnEl.classList.add('active-cat');
        btnEl.setAttribute('aria-pressed', 'true');
        try {
          requestAnimationFrame(() => btnEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }));
        } catch(e) {
          console.warn('Category chip scroll failed:', e);
        }
      }
      state.activeCategory = catName;
      renderVocabList(true);
    }

    export function setLevelFilter(lvl, btnEl) {
      document.querySelectorAll('#level-filter-bar .lvl-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      });
      if (btnEl) {
        btnEl.classList.add('active');
        btnEl.setAttribute('aria-pressed', 'true');
      }
      state.activeLevel = lvl;
      renderVocabList(true);
    }

    function handleSearchInput() {
      const inputEl = document.getElementById('search-input');
      const clearBtn = document.getElementById('clear-search-btn');
      if (clearBtn) {
        clearBtn.style.display = inputEl && inputEl.value.length > 0 ? 'block' : 'none';
      }
      if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        searchDebounceTimer = null;
        state.searchQuery = normalizeSearchText(inputEl ? inputEl.value : '');
        renderVocabList(true);
      }, 90);
    }

    export function clearSearchInput() {
      const inputEl = document.getElementById('search-input');
      if (inputEl) {
        inputEl.value = '';
        state.searchQuery = '';
        const clearBtn = document.getElementById('clear-search-btn');
        if (clearBtn) clearBtn.style.display = 'none';
        renderVocabList(true);
        inputEl.focus();
      }
    }

function getFilteredWords() {
      const index = getVocabSearchIndex();
      const hasCategory = state.activeCategory !== 'all';
      const hasLevel = state.activeLevel !== 'all';
      const q = state.searchQuery;

      if (!hasCategory && !hasLevel && !q) {
        return getVocabDataset();
      }

      return index.filter(entry => {
        const word = entry.word;
        if (hasCategory && word.category !== state.activeCategory) {
          return false;
        }
        if (hasLevel && word.level !== state.activeLevel) {
          return false;
        }
        if (q) {
          if (!entry.normFr.includes(q) &&
              !entry.normAr.includes(q) &&
              (!entry.normPron || !entry.normPron.includes(q)) &&
              (!entry.normTags || !entry.normTags.includes(q))) {
            return false;
          }
        }
        return true;
      }).map(entry => entry.word);
    }

    function updateVocabLearningSummary() {
      const label = document.getElementById('vocab-progress-label');
      const percent = document.getElementById('vocab-progress-percent');
      const bar = document.getElementById('vocab-progress-bar');
      const filterLabel = document.getElementById('vocab-active-filter-label');
      const continueBtn = document.getElementById('vocab-continue-btn');
      const status = document.getElementById('vocab-progress-status');
      const summary = document.getElementById('vocab-learning-summary');
      if (!label || !percent || !bar || !filterLabel || !continueBtn || !status || !summary) return;

      const filtered = getFilteredWords();
      const learnedCount = filtered.reduce((count, word) => count + (state.learned.has(getWordId(word)) ? 1 : 0), 0);
      const progress = filtered.length ? Math.round((learnedCount / filtered.length) * 100) : 0;
      const remainingCount = Math.max(0, filtered.length - learnedCount);
      const nextWord = filtered.find(word => !state.learned.has(getWordId(word)));
      const categoryLabel = state.activeCategory === 'all'
        ? 'كل الفئات'
        : getCategoryLabelParts(state.activeCategory).primary;
      const levelLabel = state.activeLevel === 'all' ? 'كل المستويات' : state.activeLevel;

      const categoryStats = new Map();
      getVocabDataset().forEach(word => {
        const category = word.category;
        const info = categoryStats.get(category) || { learned: 0, total: 0 };
        info.total++;
        if (state.learned.has(getWordId(word))) info.learned++;
        categoryStats.set(category, info);
      });
      document.querySelectorAll('#category-filter-list .category-item').forEach(button => {
        const category = button.dataset.category;
        const info = category === 'all'
          ? { learned: getVocabDataset().filter(word => state.learned.has(getWordId(word))).length, total: getVocabDataset().length }
          : categoryStats.get(category);
        const count = button.querySelector('.cat-count');
        if (count && info) count.textContent = `${info.learned} / ${info.total}`;
      });

      label.textContent = !filtered.length
        ? 'لا توجد مصطلحات بهذا الاختيار'
        : learnedCount === filtered.length
          ? `${learnedCount} من ${filtered.length} مصطلحاً متقناً · اكتمل المسار`
          : learnedCount === 0
            ? `${filtered.length} مصطلحاً جاهزاً · ابدأ بالمصطلح الأول`
            : `${learnedCount} من ${filtered.length} مصطلحاً متقناً · تبقّى ${remainingCount}`;
      percent.textContent = `${progress}%`;
      bar.setAttribute('aria-valuenow', String(progress));
      bar.querySelector('span')?.style.setProperty('width', `${progress}%`);
      filterLabel.textContent = state.searchQuery
        ? `بحث: ${state.searchQuery}`
        : `${categoryLabel} · ${levelLabel}`;
      continueBtn.disabled = filtered.length === 0 || learnedCount === filtered.length;
      continueBtn.setAttribute('aria-disabled', String(continueBtn.disabled));
      continueBtn.querySelector('span:first-child').textContent = learnedCount === filtered.length && filtered.length
        ? 'المسار مكتمل'
        : filtered.length ? 'تابع التعلّم' : 'لا توجد نتيجة';
      continueBtn.setAttribute('aria-label', nextWord
        ? `تابع التعلّم إلى المصطلح ${nextWord.fr}`
        : learnedCount === filtered.length && filtered.length
          ? 'اكتمل مسار التعلّم الحالي'
          : 'لا توجد مصطلحات بهذا الاختيار');
      continueBtn.title = nextWord ? `التالي في المسار: ${nextWord.fr}` : '';

      const stateName = !filtered.length ? 'empty' : learnedCount === filtered.length ? 'complete' : learnedCount ? 'in-progress' : 'start';
      summary.dataset.progressState = stateName;
      summary.classList.toggle('is-complete', stateName === 'complete');
      summary.classList.toggle('is-empty', stateName === 'empty');
      status.textContent = stateName === 'complete' ? 'مكتمل' : stateName === 'empty' ? 'لا نتائج' : stateName === 'start' ? 'ابدأ الآن' : 'مستمر';
      status.className = `vocab-summary-status status-${stateName}`;
    }

export function focusNextVocabWord() {
  const filtered = getFilteredWords();
      const nextIndex = filtered.findIndex(word => !state.learned.has(getWordId(word)));
      const nextWord = nextIndex >= 0 ? filtered[nextIndex] : null;
      if (!nextWord) {
        showToast(filtered.length ? 'أتممت هذا المسار — أحسنت!' : 'لا توجد مصطلحات بهذا الاختيار.');
        return;
      }

      const key = getWordId(nextWord);
      const cardId = `word-card-${key.replace(':', '-')}`;
      let card = document.getElementById(cardId);
      while (!card && state.renderedWordsCount < nextIndex + 1) {
        renderVocabList(false);
        card = document.getElementById(cardId);
      }

      if (!card) {
        showToast('تعذر الوصول إلى المصطلح التالي. جرّب تحميل المزيد.');
        return;
      }

      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('vocab-next-card');
      card.setAttribute('tabindex', '-1');
      card.focus({ preventScroll: true });
      window.setTimeout(() => card.classList.remove('vocab-next-card'), 1400);
    }

    function setupVocabInfiniteScroll() {
      const loadMoreBtn = document.getElementById('load-more-btn');
      if (!loadMoreBtn || typeof IntersectionObserver === 'undefined') return;
      if (vocabScrollObserver) vocabScrollObserver.disconnect();

      vocabScrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && loadMoreBtn.style.display !== 'none') {
            renderVocabList(false);
          }
        });
      }, { rootMargin: '300px 0px' });

      vocabScrollObserver.observe(loadMoreBtn);
    }

    function renderVocabList(reset = false) {
      const grid = document.getElementById('vocab-words-grid');
      const loadMoreBtn = document.getElementById('load-more-btn');
      
      if (reset) {
        grid.replaceChildren();
        state.renderedWordsCount = 0;
      }

      const filtered = getFilteredWords();
      const wordsPerPage = isCompactViewport() ? 12 : 24;
      const nextBatch = filtered.slice(state.renderedWordsCount, state.renderedWordsCount + wordsPerPage);
      const fragment = document.createDocumentFragment();

      nextBatch.forEach(word => {
        const key = getWordId(word);
        const isLearned = state.learned.has(key);

        const card = document.createElement('div');
        card.className = `word-card ${isLearned ? 'learned-card' : ''}`;
        card.id = `word-card-${key.replace(':', '-')}`;

        // 1. Top Meta Strip (Category Tag + Level Badge)
        const topMeta = document.createElement('div');
        topMeta.className = 'word-card-top-meta';
        
        appendTextElement(topMeta, 'span', 'word-card-cat-tag', word.category || 'عام');
        appendTextElement(topMeta, 'span', `lvl-badge lvl-${String(word.level || '').toLowerCase()}`, word.level);
        appendTextElement(topMeta, 'span', 'word-learning-state', isLearned ? '✓ متقنة' : 'جديدة');
        card.appendChild(topMeta);

        // 2. Main French Word & Audio Action Row
        const frRow = document.createElement('div');
        frRow.className = 'word-fr-row';
        
        const frEl = appendTextElement(frRow, 'div', 'word-fr', word.fr);
        frEl.lang = 'fr';
        frEl.dir = 'ltr';
        
        const speakBtn = document.createElement('button');
        speakBtn.type = 'button';
        speakBtn.className = 'speak-btn app-icon-action app-icon-action--audio';
        speakBtn.title = 'استمع للنطق الأصلي';
        speakBtn.setAttribute('aria-label', `استمع لنطق كلمة ${word.fr}`);
        speakBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          speakFrenchText(word.fr, speakBtn);
        });
        if (!ttsAvailable()) speakBtn.style.opacity = '0.3';
        frRow.appendChild(speakBtn);
        card.appendChild(frRow);

        // 3. Phonetic Pronunciation Badge (if available)
        if (word.pron) {
          appendTextElement(card, 'div', 'word-pron', `🗣️ [ ${word.pron} ]`);
        }

        // 4. Arabic Meaning Block with Label
        const arBox = document.createElement('div');
        arBox.className = 'word-ar';
        appendTextElement(arBox, 'span', 'word-ar-tag', 'المعنى');
        appendTextElement(arBox, 'span', 'word-ar-text', word.ar);
        card.appendChild(arBox);

        // 5. Practical Example Block: collapsed on phones to keep the learning action visible.
        if (word.example_fr) {
          const exampleDetails = document.createElement('details');
          exampleDetails.className = 'word-example-details';
          if (!isCompactViewport()) exampleDetails.open = true;

          const exampleSummary = document.createElement('summary');
          exampleSummary.textContent = '💡 مثال تطبيقي من الورشة';
          exampleDetails.appendChild(exampleSummary);

          const exContainer = document.createElement('div');
          exContainer.className = 'word-example';

          const exampleFr = appendTextElement(exContainer, 'div', 'word-example-fr', word.example_fr);
          exampleFr.lang = 'fr';
          exampleFr.dir = 'ltr';
          if (word.example_ar) {
            appendTextElement(exContainer, 'div', 'word-example-ar', word.example_ar);
          }
          exampleDetails.appendChild(exContainer);
          card.appendChild(exampleDetails);
        }

        // 6. Footer (Morocco context badge + Learn action button)
        const footer = document.createElement('div');
        footer.className = 'word-footer';

        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'word-badges';
        if (word.context === 'maroc') {
          appendTextElement(tagsContainer, 'span', 'word-badge badge-ca', '🇲🇦 المغرب');
        }
        footer.appendChild(tagsContainer);

        const learnBtn = document.createElement('button');
        learnBtn.type = 'button';
        learnBtn.className = `learn-btn ${isLearned ? 'is-learned' : ''}`;
        learnBtn.setAttribute('aria-pressed', String(isLearned));
        learnBtn.setAttribute('aria-label', isLearned ? `تم إتقان كلمة ${word.fr}` : `تحديد كلمة ${word.fr} كمتقنة`);
        learnBtn.textContent = isLearned ? '✓ متقنة' : '+ تعلّمتها';
        learnBtn.addEventListener('click', () => toggleWordLearned(key, learnBtn, card, word));
        footer.appendChild(learnBtn);

        card.appendChild(footer);
        fragment.appendChild(card);
      });

      grid.appendChild(fragment);
      state.renderedWordsCount += nextBatch.length;

      if (state.renderedWordsCount < filtered.length) {
        loadMoreBtn.style.display = 'block';
        loadMoreBtn.innerText = `تحميل المزيد (${filtered.length - state.renderedWordsCount} متبقية)`;
        setupVocabInfiniteScroll();
      } else {
        loadMoreBtn.style.display = 'none';
      }

      updateVocabLearningSummary();

      if (filtered.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.style.gridColumn = '1 / -1';
        emptyState.style.textAlign = 'center';
        emptyState.style.padding = '40px';
        emptyState.style.color = 'var(--text-muted)';
        emptyState.textContent = 'لم يتم العثور على أي مصطلح يطابق البحث أو الفلاتر المختارة.';
        grid.replaceChildren(emptyState);
      }
    }

    export function loadMoreWords() {
      renderVocabList(false);
    }

    function toggleWordLearned(key, btnEl, cardEl, word) {
      const wordLabel = word?.fr || 'المصطلح';
      if (state.learned.has(key)) {
        state.learned.delete(key);
        btnEl.classList.remove('is-learned');
        btnEl.innerText = '+ تعلّمتها';
        btnEl.setAttribute('aria-pressed', 'false');
        btnEl.setAttribute('aria-label', `تحديد ${wordLabel} كمتقنة`);
        cardEl.classList.remove('learned-card');
      } else {
        state.learned.add(key);
        btnEl.classList.add('is-learned');
        btnEl.innerText = '✓ متقنة';
        btnEl.setAttribute('aria-pressed', 'true');
        btnEl.setAttribute('aria-label', `تم إتقان ${wordLabel}`);
        cardEl.classList.add('learned-card');
      }

      const learningState = cardEl.querySelector('.word-learning-state');
      if (learningState) learningState.textContent = state.learned.has(key) ? '✓ متقنة' : 'جديدة';
      
      saveStateToLocalStorage();
      initStats();
      updateVocabLearningSummary();
    }

    function resetLearnedState() {
      if (confirm('سيتم مسح الكلمات المتقنة وخطة الدراسة ونتائج الاختبار وتقدم تمارين القراءة. هل تريد المتابعة؟')) {
        performProgressReset();
      }
    }

    const HOLD_DURATION_MS = 900;

    /** Kinetics hold-to-confirm: ring fills over 900ms, early release cancels. */
    function initHoldReset() {
      const btn = document.getElementById('hold-reset-btn');
      if (!btn) return;
      const fill = btn.querySelector('.hold-progress-fill');
      let rafId = null, startTime = 0, holding = false, done = false;

      const setP = v => { if (fill) fill.style.setProperty('--hold-p', String(v)); };

      const cancel = () => {
        if (!holding || done) return;
        holding = false;
        btn.classList.remove('holding');
        cancelAnimationFrame(rafId);
        // Spring the fill back to zero
        fill.style.transition = 'transform .35s cubic-bezier(0.34, 1.56, 0.64, 1)';
        setP(0);
        setTimeout(() => { fill.style.transition = 'none'; }, 380);
      };

      const start = e => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        done = false;
        holding = true;
        startTime = performance.now();
        btn.classList.add('holding');
        fill.style.transition = 'none';
        const step = now => {
          if (!holding || done) return;
          const p = Math.min((now - startTime) / HOLD_DURATION_MS, 1);
          setP(p);
          if (p >= 1) {
            done = true;
            holding = false;
            btn.classList.remove('holding');
            setP(0);
            performProgressReset();
            return;
          }
          rafId = requestAnimationFrame(step);
        };
        rafId = requestAnimationFrame(step);
      };

      btn.addEventListener('pointerdown', start);
      btn.addEventListener('pointerup', cancel);
      btn.addEventListener('pointerleave', cancel);
      btn.addEventListener('pointercancel', cancel);
      // Keyboard users keep the explicit confirm dialog
      btn.addEventListener('click', e => {
        if (done) return;
        if (btn.matches(':focus-visible')) resetLearnedState();
      });
    }

    function performProgressReset() {
      state.learned.clear();
      state.checkedDays.clear();
      state.quizBestScore = 0;
      state.wrongBank = {};
      state.readingProgress = {};
      saveStateToLocalStorage();
      initStats();
      renderVocabList(true);
      renderStudyPlan();
      renderReadingDocsSelector();
      showToast('تمت إعادة تعيين التقدم بنجاح!');
    }

if (typeof window !== 'undefined') {
  window.PHASE_NAMES = PHASE_NAMES;
  window.SHORT_PHASE_NAMES = SHORT_PHASE_NAMES;
  window.renderVocabCategoryFilter = renderVocabCategoryFilter;
  window.setCategoryFilter = setCategoryFilter;
  window.setLevelFilter = setLevelFilter;
  window.handleSearchInput = handleSearchInput;
  window.clearSearchInput = clearSearchInput;
  window.getFilteredWords = getFilteredWords;
  window.updateVocabLearningSummary = updateVocabLearningSummary;
  window.focusNextVocabWord = focusNextVocabWord;
  window.renderVocabList = renderVocabList;
  window.loadMoreWords = loadMoreWords;
  window.setupVocabInfiniteScroll = setupVocabInfiniteScroll;
  window.toggleWordLearned = toggleWordLearned;
  window.resetLearnedState = resetLearnedState;
}

// Boot the sheet relocation once DOM is parsed (module loads before appInit)
if (typeof document !== 'undefined') {
  const bootVocabExtras = () => { initHoldReset(); };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootVocabExtras, { once: true });
  } else {
    bootVocabExtras();
  }
}
