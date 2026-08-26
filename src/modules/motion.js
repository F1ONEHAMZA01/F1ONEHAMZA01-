/**
 * Motion layer — RTL-aware swipe navigation between sibling subviews.
 * (Visual physics layer intentionally removed to preserve the classic
 *  v3.1.1 design language; only invisible gesture support remains.)
 */

const REDUCED = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)');
export const prefersReducedMotion = () => !!(REDUCED && REDUCED.matches);

// ════════════════════════════════════════════════════════════════════════════
// RTL-AWARE SWIPE between sibling subviews (velocity + threshold)
// ════════════════════════════════════════════════════════════════════════════

const SUBVIEW_GROUPS = [
  { navBtns: '.quiz-subtab-btn', view: '#tab-quiz' },
  { navBtns: '.cheques-subtab-btn', view: '#tab-cheques' },
  { navBtns: '.reading-subtab-btn', view: '#tab-reading' },
  { navBtns: '.writing-subtab-btn', view: '#tab-writing' },
  { navBtns: '.grammar-subtab-btn', view: '#tab-grammar' },
  { navBtns: '.calc-subtab-btn', view: '#tab-calc' }
];

const SWIPE_IGNORED = 'input, textarea, select, button, a, [contenteditable="true"], .doc-inner-nav, #category-filter-list';

function initSwipeNavigation() {
  if (prefersReducedMotion()) return;

  SUBVIEW_GROUPS.forEach(({ navBtns, view }) => {
    const container = document.querySelector(view);
    if (!container) return;

    let startX = 0, startY = 0, startT = 0, tracking = false;

    container.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse') return;
      if (e.target.closest(SWIPE_IGNORED)) return;
      startX = e.clientX; startY = e.clientY; startT = performance.now();
      tracking = true;
    }, { passive: true });

    container.addEventListener('pointerup', e => {
      if (!tracking) return;
      tracking = false;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const dt = performance.now() - startT;
      if (Math.abs(dx) < 64 || Math.abs(dx) < Math.abs(dy) * 1.4 || dt > 600) return;
      if (Math.abs(dx / dt) < 0.25) return;

      const buttons = [...container.querySelectorAll(navBtns)];
      const currentIndex = buttons.findIndex(b => b.classList.contains('active'));
      if (currentIndex === -1) return;

      // RTL reading: content ahead lives to the LEFT → finger swipes left = next
      const nextIndex = dx < 0 ? currentIndex + 1 : currentIndex - 1;
      const target = buttons[Math.max(0, Math.min(buttons.length - 1, nextIndex))];
      if (target && !target.classList.contains('active')) target.click();
    }, { passive: true });

    container.addEventListener('pointercancel', () => { tracking = false; }, { passive: true });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// BOOTSTRAP
// ════════════════════════════════════════════════════════════════════════════

export function initMotion() {
  initSwipeNavigation();
}

if (typeof window !== 'undefined') {
  window.initMotion = initMotion;
}
