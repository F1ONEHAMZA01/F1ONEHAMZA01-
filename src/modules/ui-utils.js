/**
 * DOM Utility: Creates and appends a child text element safely
 * @param {HTMLElement} parent - Target parent node
 * @param {string} tagName - HTML tag name (e.g. 'span', 'div')
 * @param {string} [className] - Optional CSS classes
 * @param {string|number} [text] - Text content to set safely
 * @returns {HTMLElement} Newly created child element
 */
export function appendTextElement(parent, tagName, className, text) {
  const el = document.createElement(tagName);
  if (className) el.className = className;
  el.textContent = text == null ? '' : String(text);
  parent.appendChild(el);
  return el;
}

/**
 * Escapes unsafe characters for safe innerHTML injection
 * @param {string|null|undefined} value - Raw string
 * @returns {string} HTML-escaped safe string
 */
export function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

const tabInitializers = new Map();
const initializedTabs = new Set();
const HEADER_SECTION_LABELS = Object.freeze({
  vocab: 'المفردات · تعلّم المصطلحات',
  quiz: 'الاختبار · اختبر معلوماتك',
  cheques: 'الشيكات والأرقام · قراءة وتدريب',
  reading: 'القراءة · وثائق الورش',
  writing: 'الكتابة · نماذج ومراسلات',
  grammar: 'القواعد · فرنسية الورش',
  plan: 'الخطة · تعلّم خطوة بخطوة',
  calc: 'الحاسبة · حسابات الورش'
});
let headerLastScrollY = 0;
let headerTravel = 0;
let headerDirection = 0;
let bidiContentObserver = null;

const BIDI_AUTO_SELECTOR = [
  '#main-content p:not([dir])',
  '#main-content td:not([dir])',
  '#main-content th:not([dir])',
  '#main-content li:not([dir])',
  '#main-content blockquote:not([dir])',
  '#main-content figcaption:not([dir])',
  '#main-content dd:not([dir])',
  '#main-content dt:not([dir])',
  '#main-content .bidi-auto:not([dir])'
].join(',');

function applyAutoTextDirection(root) {
  if (!root || (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE)) return;
  const candidates = [];
  if (root.nodeType === Node.ELEMENT_NODE && root.matches(BIDI_AUTO_SELECTOR)) candidates.push(root);
  root.querySelectorAll?.(BIDI_AUTO_SELECTOR).forEach(el => candidates.push(el));
  candidates.forEach(el => el.setAttribute('dir', 'auto'));
}

/** Keeps Arabic and French blocks correctly isolated, including lazy-rendered content. */
export function initializeBidiContent() {
  const main = document.getElementById('main-content');
  if (!main) return;
  applyAutoTextDirection(main);
  if (bidiContentObserver) bidiContentObserver.disconnect();
  bidiContentObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => applyAutoTextDirection(node));
    });
  });
  bidiContentObserver.observe(main, { childList: true, subtree: true });
}

/** Registers content that should be rendered only when a top-level tab opens. */
export function registerTabInitializer(tabId, initializer) {
  if (typeof tabId !== 'string' || typeof initializer !== 'function') return;
  tabInitializers.set(tabId, initializer);
}

/** Runs a tab initializer once and lets a later attempt retry if it fails. */
export function initializeTab(tabId) {
  if (initializedTabs.has(tabId)) return;
  const initializer = tabInitializers.get(tabId);
  if (!initializer) return;

  initializedTabs.add(tabId);
  try {
    initializer();
  } catch (error) {
    initializedTabs.delete(tabId);
    console.error(`Failed to initialize tab: ${tabId}`, error);
  }
}

export function isTabInitialized(tabId) {
  return initializedTabs.has(tabId);
}

/** Gives compact copy controls a short, accessible success confirmation. */
export function showIconActionSuccess(button, successLabel = 'تم النسخ') {
  if (!button) return;
  const previousTimer = Number(button.dataset.actionFeedbackTimer || 0);
  if (previousTimer) window.clearTimeout(previousTimer);
  if (!button.dataset.actionOriginalLabel) {
    button.dataset.actionOriginalLabel = button.getAttribute('aria-label') || button.title || successLabel;
  }

  button.classList.add('is-action-success');
  button.setAttribute('aria-label', successLabel);
  const timer = window.setTimeout(() => {
    button.classList.remove('is-action-success');
    button.setAttribute('aria-label', button.dataset.actionOriginalLabel || successLabel);
    delete button.dataset.actionFeedbackTimer;
    delete button.dataset.actionOriginalLabel;
  }, 1000);
  button.dataset.actionFeedbackTimer = String(timer);
}

export function setHeaderSection(tabId) {
  const header = document.querySelector('.app-header');
  const subtitle = document.getElementById('header-sub');
  const label = HEADER_SECTION_LABELS[tabId];
  if (!header || !label) return;

  header.dataset.activeSection = tabId;
  if (subtitle) {
    subtitle.textContent = label;
    subtitle.setAttribute('aria-label', `القسم الحالي: ${label}`);
  }
}

function syncHeaderScrollState() {
  const header = document.querySelector('.app-header');
  if (!header) return;
  const currentScrollY = Math.max(0, window.scrollY);
  const scrollDelta = currentScrollY - headerLastScrollY;
  const direction = Math.sign(scrollDelta);
  const shouldElevate = currentScrollY > 20;

  if (header.classList.contains('is-scrolled') !== shouldElevate) {
    header.classList.toggle('is-scrolled', shouldElevate);
  }

  if (currentScrollY <= 24) {
    header.classList.remove('is-hidden');
    headerTravel = 0;
    headerDirection = 0;
  } else if (direction !== 0) {
    if (direction !== headerDirection) headerTravel = 0;
    headerDirection = direction;
    headerTravel += Math.abs(scrollDelta);

    if (direction > 0 && currentScrollY > 96 && headerTravel >= 16) {
      header.classList.add('is-hidden');
      headerTravel = 0;
    } else if (direction < 0 && headerTravel >= 10) {
      header.classList.remove('is-hidden');
      headerTravel = 0;
    }
  }

  headerLastScrollY = currentScrollY;
}

export function initializeDynamicHeader() {
  const header = document.querySelector('.app-header');
  if (!header || header.dataset.dynamicReady === 'true') return;

  header.dataset.dynamicReady = 'true';
  setHeaderSection(header.dataset.activeSection || 'vocab');
  headerLastScrollY = Math.max(0, window.scrollY);
  header.classList.toggle('is-scrolled', headerLastScrollY > 20);
  header.classList.remove('is-hidden');

  window.addEventListener('scroll', syncHeaderScrollState, { passive: true });
}


/**
 * Initializes Accessible WAI-ARIA tablist navigation with keyboard navigation (Home, End, Left/Right arrows)
 */
export function initializeTabs() {
  const tabs = Array.from(document.querySelectorAll('.tab-btn'));
  const tabList = document.querySelector('[role="tablist"]');
  tabs.forEach(tab => {
    const isActive = tab.classList.contains('active-tab');
    tab.setAttribute('aria-selected', String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
    const panel = document.getElementById(tab.getAttribute('aria-controls') || '');
    if (panel) panel.hidden = !isActive;
  });
  if (!tabList) return;
  tabList.addEventListener('keydown', event => {
    const currentIndex = tabs.indexOf(/** @type {HTMLButtonElement} */ (document.activeElement));
    if (currentIndex < 0) return;
    let nextIndex = currentIndex;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;
    event.preventDefault();
    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  });
}

/**
 * Keeps the mobile overflow navigation accessible and predictable.
 * The native details/summary control provides the toggle interaction; this
 * layer synchronizes ARIA state and closes the menu when focus moves away.
 */
export function initializeMobileMoreNav() {
  const menus = Array.from(document.querySelectorAll('.mobile-more-nav'));
  if (!menus.length) return;

  const syncMenuState = menu => {
    const summary = menu.querySelector(':scope > summary');
    if (!summary) return;
    const isOpen = menu.open;
    summary.setAttribute('aria-expanded', String(isOpen));
    summary.setAttribute('aria-label', isOpen ? 'إغلاق قائمة الأقسام' : 'فتح باقي الأقسام');
  };

  menus.forEach(menu => {
    const summary = menu.querySelector(':scope > summary');
    syncMenuState(menu);
    menu.addEventListener('toggle', () => syncMenuState(menu));
    summary?.addEventListener('click', () => {
      setTimeout(() => syncMenuState(menu), 0);
    });
    new MutationObserver(() => syncMenuState(menu)).observe(menu, {
      attributes: true,
      attributeFilter: ['open']
    });
    menu.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || !menu.open) return;
      event.preventDefault();
      menu.open = false;
      syncMenuState(menu);
      summary?.focus();
    });
  });

  document.addEventListener('click', event => {
    menus.forEach(menu => {
      if (menu.open && !menu.contains(event.target)) {
        menu.open = false;
        syncMenuState(menu);
      }
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    menus.forEach(menu => {
      if (!menu.open) return;
      menu.open = false;
      syncMenuState(menu);
      menu.querySelector(':scope > summary')?.focus();
    });
  });
}

/**
 * Triggers hardware-accelerated haptic vibration feedback pattern
 * @param {number|number[]} pattern - Vibration duration in ms or array pattern
 */
export function playHaptic(pattern) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch(e) {
      console.warn('Haptic vibration failed:', e);
    }
  }
}

/**
 * Switches the active main top-level tab section with haptic and visual feedback
 * @param {string} tabId - Identifier of the tab (e.g. 'vocab', 'quiz', 'cheques')
 * @param {HTMLElement} [btnEl] - The clicked button element
 */
export function switchTab(tabId, btnEl) {
  playHaptic(15);
  setHeaderSection(tabId);
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active-tab');
    btn.setAttribute('aria-selected', 'false');
    btn.tabIndex = -1;
  });
  document.querySelectorAll('.mobile-nav-btn[data-tab]').forEach(btn => {
    const isActive = btn.dataset.tab === tabId;
    btn.classList.toggle('active', isActive);
    if (isActive) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  });
  document.querySelectorAll('.mobile-more-nav').forEach(menu => {
    if (menu.open) {
      menu.open = false;
      menu.querySelector(':scope > summary')?.setAttribute('aria-expanded', 'false');
    }
  });
  if (btnEl) {
    btnEl.classList.add('active-tab');
    btnEl.setAttribute('aria-selected', 'true');
    btnEl.tabIndex = 0;
    requestAnimationFrame(() => btnEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }));
  }
  
  document.querySelectorAll('main > section').forEach(sec => {
    sec.classList.add('hidden');
    sec.hidden = true;
  });
  
  const activeSection = document.getElementById(`tab-${tabId}`);
  if (activeSection) {
    activeSection.classList.remove('hidden');
    activeSection.hidden = false;
    initializeTab(tabId);
  }


  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Displays a non-intrusive toast alert with context-aware haptic patterns
 * @param {string} msg - Message to display
 * @param {'normal'|'success'|'error'} [type='normal'] - Toast alert severity
 */
export function showToast(msg, type = 'normal') {
  if (type === 'success') {
    playHaptic([20, 50, 20]);
  } else if (type === 'error') {
    playHaptic([40, 50, 40]);
  } else {
    playHaptic(20);
  }
  
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  if (toastMsg) toastMsg.innerText = msg;
  if (toast) {
    toast.classList.remove('show');
    void toast.offsetWidth; // Force CSS reflow to re-trigger transition
    
    toast.classList.add('show');
    
    if (toast.dataset.timeoutId) {
      clearTimeout(Number(toast.dataset.timeoutId));
    }
    
    const timeoutId = setTimeout(() => {
      toast.classList.remove('show');
      toast.dataset.timeoutId = '';
    }, 3000);
    
    toast.dataset.timeoutId = timeoutId.toString();
  }
}

/**
 * Smoothly scrolls the window back to the top of the viewport
 */
export function scrollToTopSmooth() {
  playHaptic(15);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

if (typeof window !== 'undefined') {
  window.addEventListener('scroll', () => {
    const btn = document.getElementById('back-to-top-btn');
    if (!btn) return;
    if (window.scrollY > 280) {
      btn.style.display = 'flex';
      btn.setAttribute('aria-hidden', 'false');
    } else {
      btn.style.display = 'none';
      btn.setAttribute('aria-hidden', 'true');
    }
  }, { passive: true });
}

if (typeof window !== 'undefined') {
  window.appendTextElement = appendTextElement;
  window.escapeHtml = escapeHtml;
  window.initializeTab = initializeTab;
  window.isTabInitialized = isTabInitialized;
  window.showIconActionSuccess = showIconActionSuccess;
  window.setHeaderSection = setHeaderSection;
  window.initializeDynamicHeader = initializeDynamicHeader;
  window.initializeTabs = initializeTabs;
  window.switchTab = switchTab;
  window.showToast = showToast;
  window.scrollToTopSmooth = scrollToTopSmooth;
  window.playHaptic = playHaptic;
}
