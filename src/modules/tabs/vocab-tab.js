import { state, getVocabDataset, getVocabSearchIndex, getWordId, normalizeSearchText, saveStateToLocalStorage, initStats } from '../state.js';
import { appendTextElement, showToast } from '../ui-utils.js';
import { speakFrenchText, ttsAvailable } from '../audio.js';
import { attachBottomSheetDrag } from '../motion.js';
import { renderStudyPlan } from './plan-tab.js';
import { renderReadingDocsSelector } from './reading-tab.js';

let searchDebounceTimer = null;
let vocabScrollObserver = null;

// ════════════════════════════════════════════════════════════════════════════
// MOBILE FILTERS BOTTOM SHEET — relocates filter nodes on Nord-class screens
// ════════════════════════════════════════════════════════════════════════════

const SHEET_MEDIA = typeof matchMedia !== 'undefined' ? matchMedia('(max-width: 440px) and (orientation: portrait)') : null;
let sheetOpen = false;

function isSheetLayout() {
  return !!(SHEET_MEDIA && SHEET_MEDIA.matches);
}

function relocateFiltersForSheet() {
  const slot = document.getElementById('sheet-body-slot');
  const levelBar = document.getElementById('level-filter-bar');
  const categoryList = document.getElementById('category-filter-list');
  if (!slot || !levelBar || !categoryList) return;
  if (isSheetLayout()) {
    if (levelBar.parentElement !== slot) slot.appendChild(levelBar);
    if (categoryList.parentElement !== slot) slot.appendChild(categoryList);
  } else {
    const levelHome = document.querySelector('.vocab-toolbar');
    const catHome = document.querySelector('.vocab-sidebar-card');
    if (levelHome && levelBar.parentElement !== levelHome) levelHome.appendChild(levelBar);
    if (catHome && categoryList.parentElement !== catHome) catHome.appendChild(categoryList);
    closeFiltersSheet(true);
  }
  updateOpenFiltersLabel();
}

function updateOpenFiltersLabel() {
  const label = document.getElementById('open-filters-active-cat');
  if (!label) return;
  const cat = state.activeCategory === 'all' ? '' : `· ${state.activeCategory.split('/')[0].trim()}`;
  label.textContent = cat.length > 18 ? `${cat.slice(0, 17)}…` : cat;
}

export function openFiltersSheet() {
  const sheet = document.getElementById('mobile-filters-sheet');
  if (!sheet || sheetOpen) return;
  relocateFiltersForSheet();
  sheet.classList.remove('hidden');
  requestAnimationFrame(() => sheet.classList.add('open'));
  sheetOpen = true;
  const firstItem = sheet.querySelector('button');
  if (firstItem) firstItem.focus({ preventScroll: true });
}

export function closeFiltersSheet(instant = false) {
  const sheet = document.getElementById('mobile-filters-sheet');
  if (!sheet || !sheetOpen) return;
  sheetOpen = false;
  const panel = sheet.querySelector('.bottom-sheet-panel');
  const finish = () => {
    sheet.classList.add('hidden');
    panel.style.transform = '';
  };
  if (instant || prefersReducedMotionSafe()) finish();
  else {
    sheet.classList.remove('open');
    setTimeout(finish, 340);
  }
}

function prefersReducedMotionSafe() {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function initFiltersSheet() {
  const sheet = document.getElementById('mobile-filters-sheet');
  if (!sheet) return;

  relocateFiltersForSheet();
  if (SHEET_MEDIA) {
    if (SHEET_MEDIA.addEventListener) SHEET_MEDIA.addEventListener('change', relocateFiltersForSheet);
    else SHEET_MEDIA.addListener(relocateFiltersForSheet);
  }

  document.getElementById('open-filters-btn')?.addEventListener('click', openFiltersSheet);
  sheet.querySelectorAll('[data-sheet-close]').forEach(el => el.addEventListener('click', () => closeFiltersSheet()));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeFiltersSheet(); });

  const panel = sheet.querySelector('.bottom-sheet-panel');
  attachBottomSheetDrag(sheet, panel, () => closeFiltersSheet());
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

    function renderVocabCategoryFilter() {
      const container = document.getElementById('category-filter-list');
      if (!container) return;
      
      const dataset = getVocabDataset();
      const categoriesMap = new Map();
      dataset.forEach(word => {
        const cat = word.category;
        const phase = word.phase || 6;
        if (!categoriesMap.has(cat)) {
          categoriesMap.set(cat, { count: 0, phase });
        }
        categoriesMap.get(cat).count++;
      });
      
      const fragment = document.createDocumentFragment();

      const allButton = document.createElement('button');
      allButton.type = 'button';
      allButton.className = 'category-item active-cat';
      allButton.id = 'cat-btn-all';
      allButton.addEventListener('click', () => setCategoryFilter('all', allButton));
      appendTextElement(allButton, 'span', '', 'كل المصطلحات / Tout');
      appendTextElement(allButton, 'span', 'cat-count', dataset.length);
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
        button.addEventListener('click', () => setCategoryFilter(catName, button));
        appendTextElement(button, 'span', '', catName);
        appendTextElement(button, 'span', 'cat-count', info.count);
        fragment.appendChild(button);
      });

      container.replaceChildren(fragment);
    }

    function setCategoryFilter(catName, btnEl) {
      document.querySelectorAll('#category-filter-list .category-item').forEach(btn => {
        btn.classList.remove('active-cat');
      });
      if (btnEl) {
        btnEl.classList.add('active-cat');
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
      });
      btnEl.classList.add('active');
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
      const nextBatch = filtered.slice(state.renderedWordsCount, state.renderedWordsCount + state.wordsPerPage);
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
        card.appendChild(topMeta);

        // 2. Main French Word & Audio Action Row
        const frRow = document.createElement('div');
        frRow.className = 'word-fr-row';
        
        const frEl = appendTextElement(frRow, 'div', 'word-fr', word.fr);
        frEl.lang = 'fr';
        frEl.dir = 'ltr';
        
        const speakBtn = document.createElement('button');
        speakBtn.type = 'button';
        speakBtn.className = 'speak-btn';
        speakBtn.title = 'استمع للنطق الأصلي';
        speakBtn.setAttribute('aria-label', `استمع لنطق كلمة ${word.fr}`);
        speakBtn.textContent = '🔊';
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

        // 5. Practical Example Block
        if (word.example_fr) {
          const exContainer = document.createElement('div');
          exContainer.className = 'word-example';
          
          appendTextElement(exContainer, 'div', 'word-example-title', '💡 مثال تطبيقي من الورشة:');
          const exampleFr = appendTextElement(exContainer, 'div', 'word-example-fr', word.example_fr);
          exampleFr.lang = 'fr';
          exampleFr.dir = 'ltr';
          if (word.example_ar) {
            appendTextElement(exContainer, 'div', 'word-example-ar', word.example_ar);
          }
          card.appendChild(exContainer);
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
      
      saveStateToLocalStorage();
      initStats();
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
  window.renderVocabList = renderVocabList;
  window.loadMoreWords = loadMoreWords;
  window.setupVocabInfiniteScroll = setupVocabInfiniteScroll;
  window.toggleWordLearned = toggleWordLearned;
  window.resetLearnedState = resetLearnedState;
  window.openFiltersSheet = openFiltersSheet;
  window.closeFiltersSheet = closeFiltersSheet;
}

// Boot the sheet relocation once DOM is parsed (module loads before appInit)
if (typeof document !== 'undefined') {
  const bootVocabExtras = () => { initFiltersSheet(); initHoldReset(); };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootVocabExtras, { once: true });
  } else {
    bootVocabExtras();
  }
}
