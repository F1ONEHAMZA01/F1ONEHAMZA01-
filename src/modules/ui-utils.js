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
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active-tab');
    btn.setAttribute('aria-selected', 'false');
    btn.tabIndex = -1;
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

if (typeof window !== 'undefined') {
  window.appendTextElement = appendTextElement;
  window.escapeHtml = escapeHtml;
  window.initializeTabs = initializeTabs;
  window.switchTab = switchTab;
  window.showToast = showToast;
  window.scrollToTopSmooth = scrollToTopSmooth;
  window.playHaptic = playHaptic;
}
