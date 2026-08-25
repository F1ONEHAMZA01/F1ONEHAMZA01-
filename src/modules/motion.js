/**
 * Motion Physics Engine — real spring dynamics, touch-origin ripples,
 * RTL-aware swipe navigation, bottom-sheet drag physics and pointer tilt.
 *
 * Every feature degrades gracefully:
 *  - prefers-reduced-motion: reduce → everything disabled
 *  - coarse pointers → laptop-only effects (tilt/magnet/parallax) skipped
 */

const REDUCED = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)');
export const prefersReducedMotion = () => !!(REDUCED && REDUCED.matches);
export const hasFinePointer = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(hover: hover) and (pointer: fine)').matches;

// ════════════════════════════════════════════════════════════════════════════
// 1. SPRING SOLVER — one shared rAF loop for all dynamic motion
// ════════════════════════════════════════════════════════════════════════════

const activeSprings = new Set();
let rafId = null;

function tick() {
  const now = performance.now();
  activeSprings.forEach(spring => {
    const dt = Math.min((now - spring.last) / 1000, 1 / 30);
    spring.last = now;
    const displacement = spring.value - spring.target;
    const acceleration = -spring.stiffness * displacement - spring.damping * spring.velocity;
    spring.velocity += acceleration * dt;
    spring.value += spring.velocity * dt;

    if (Math.abs(spring.value - spring.target) < 0.001 && Math.abs(spring.velocity) < 0.001) {
      spring.value = spring.target;
      spring.velocity = 0;
      activeSprings.delete(spring);
      if (spring.onDone) spring.onDone();
      else spring.apply(spring.value);
    } else {
      spring.apply(spring.value);
    }
  });

  rafId = activeSprings.size ? requestAnimationFrame(tick) : null;
}

/**
 * Creates (or reuses) a spring driving `apply(value)`.
 * @param {{value?:number, target:number, stiffness?:number, damping?:number,
 *          apply:(v:number)=>void, onDone?:()=>void}} cfg
 */
export function spring({ value = 0, target, stiffness = 170, damping = 22, apply, onDone }) {
  const existing = [...activeSprings].find(s => s.owner === apply);
  if (existing) {
    existing.target = target;
    return existing;
  }
  const spring = { owner: apply, value, target, stiffness, damping, velocity: 0, last: performance.now(), apply, onDone };
  activeSprings.add(spring);
  if (!rafId) rafId = requestAnimationFrame(tick);
  return spring;
}

export function cancelSpring(apply) {
  const existing = [...activeSprings].find(s => s.owner === apply);
  if (existing) {
    activeSprings.delete(existing);
    if (!activeSprings.size && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }
}

/** Convenience: animate a numeric CSS custom property on an element. */
export function springCssVar(el, prop, target, opts = {}) {
  const current = parseFloat(getComputedStyle(el).getPropertyValue(prop)) || 0;
  if (prefersReducedMotion()) {
    el.style.setProperty(prop, String(target));
    return;
  }
  cancelSpring(v => el.style.setProperty(prop, String(v)));
  spring({
    value: current,
    target,
    stiffness: opts.stiffness ?? 170,
    damping: opts.damping ?? 22,
    apply: v => el.style.setProperty(prop, String(Math.round(v * 100) / 100))
  });
}

// ════════════════════════════════════════════════════════════════════════════
// 2. TOUCH-ORIGIN RIPPLE — material feedback synced with haptics
// ════════════════════════════════════════════════════════════════════════════

const RIPPLE_SELECTOR = [
  '.tab-btn', '.quiz-subtab-btn', '.cheques-subtab-btn', '.reading-subtab-btn',
  '.writing-subtab-btn', '.grammar-subtab-btn', '.calc-subtab-btn', '.subtab-btn',
  '.quiz-option-btn', '.learn-btn', '.quick-amt-btn', '.lvl-btn',
  '.category-item', '.btn-primary', '.btn-secondary'
].join(', ');

function spawnRipple(event) {
  if (prefersReducedMotion()) return;
  const host = event.target.closest?.(RIPPLE_SELECTOR);
  if (!host || host.disabled || host.matches('select, input, textarea')) return;

  const rect = host.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = (event.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
  const y = (event.clientY || rect.top + rect.height / 2) - rect.top - size / 2;

  const ripple = document.createElement('span');
  ripple.className = 'motion-ripple';
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
  host.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
}

// ════════════════════════════════════════════════════════════════════════════
// 3. RTL-AWARE SWIPE between sibling subviews (velocity + threshold)
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
      // Horizontal intent: dominant axis, fast enough, long enough
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
// 4. BOTTOM SHEET DRAG PHYSICS (rubber-band + velocity close)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Attaches drag-to-dismiss physics to a bottom sheet panel.
 * @param {HTMLElement} sheet root (.bottom-sheet)
 * @param {HTMLElement} panel the sliding panel
 * @param {() => void} onClose invoked after a committed close gesture
 */
export function attachBottomSheetDrag(sheet, panel, onClose) {
  let startY = 0, currentY = 0, dragging = false, lastY = 0, lastT = 0, velocity = 0;

  const handle = panel.querySelector('.bottom-sheet-handle');
  const grabZone = handle ? [handle] : [];

  grabZone.forEach(zone => zone.addEventListener('pointerdown', begin));

  function begin(e) {
    if (prefersReducedMotion()) { onClose(); return; }
    dragging = true;
    startY = lastY = e.clientY;
    lastT = performance.now();
    velocity = 0;
    panel.style.transition = 'none';
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function move(e) {
    if (!dragging) return;
    currentY = e.clientY - startY;
    const now = performance.now();
    velocity = (e.clientY - lastY) / Math.max(now - lastT, 1);
    lastY = e.clientY; lastT = now;

    // Rubber-band resistance beyond natural height
    if (currentY < 0) currentY = currentY / 3;
    panel.style.transform = `translateY(${Math.max(currentY, 0)}px)`;
  }

  function end() {
    if (!dragging) return;
    dragging = false;
    panel.style.transition = '';
    const shouldClose = currentY > 96 || velocity > 0.6;
    if (shouldClose) {
      spring({
        value: currentY,
        target: panel.offsetHeight + 40,
        stiffness: 380, damping: 34,
        apply: v => { panel.style.transform = `translateY(${v}px)`; },
        onDone: onClose
      });
    } else {
      spring({
        value: currentY, target: 0, stiffness: 300, damping: 26,
        apply: v => { panel.style.transform = `translateY(${v}px)`; },
        onDone: () => { panel.style.transform = ''; }
      });
    }
    currentY = 0;
  }

  document.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerup', end, { passive: true });
  document.addEventListener('pointercancel', end, { passive: true });

  return () => {
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerup', end);
    document.removeEventListener('pointercancel', end);
  };
}

// ════════════════════════════════════════════════════════════════════════════
// 5. ODOMETER — spring-damped numeric rollups for amounts & scores
// ════════════════════════════════════════════════════════════════════════════

const NUMBER_RE = /^([^0-9]*)([\d\s\u00a0.,]+)([^0-9]*)$/u;

/**
 * Rolls an element's text toward `finalText` when both sides share a numeric
 * core; falls back to an instant set otherwise. Keeps prefix/suffix (%, DH…).
 */
export function rollValue(el, finalText, durationMs = 480) {
  if (!el) return;
  const from = el.textContent || '';
  if (prefersReducedMotion() || from === finalText) { el.textContent = finalText; return; }

  const a = NUMBER_RE.exec(from.trim());
  const b = NUMBER_RE.exec(String(finalText).trim());
  if (!a || !b || a[1] !== b[1] || a[3] !== b[3]) { el.textContent = finalText; return; }

  const parseNum = s => parseFloat(s.replace(/[\s\u00a0]/g, '').replace(/,/g, '.').replace(/\.(?=.*\.)/g, '')) || 0;
  const startVal = parseNum(a[2]);
  const endVal = parseNum(b[2]);
  if (!isFinite(startVal) || !isFinite(endVal)) { el.textContent = finalText; return; }

  const decimals = (b[2].split(/[.,]/)[1] || '').length;
  const t0 = performance.now();

  cancelSpring(v => renderRoll(v));
  spring({
    value: startVal,
    target: endVal,
    stiffness: 120, damping: 24,
    apply: renderRoll,
    onDone: () => { el.textContent = finalText; }
  });

  function renderRoll(v) {
    const progress = Math.min((performance.now() - t0) / durationMs, 1);
    const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart shaping on top of spring
    const val = startVal + (endVal - startVal) * eased;
    el.textContent = `${b[1]}${val.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${b[3]}`;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// 6. LAPTOP POINTER PHYSICS — card tilt + cursor glow + magnetic buttons
// ════════════════════════════════════════════════════════════════════════════

const TILT_CONTAINERS = ['#vocab-words-container', '.num-grid'];
let tiltCard = null;

function initPointerTilt() {
  if (!hasFinePointer() || prefersReducedMotion()) return;

  TILT_CONTAINERS.forEach(sel => {
    const container = document.querySelector(sel);
    if (!container) return;

    container.addEventListener('pointermove', e => {
      const card = e.target.closest?.('.word-card, .num-card');
      if (!card) { resetTilt(); return; }
      if (card !== tiltCard) { resetTilt(); tiltCard = card; card.classList.add('motion-tilt'); }

      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const ry = (px - 0.5) * 12;   // ±6°
      const rx = (0.5 - py) * 10;   // ±5°

      if (!card._tiltScheduled) {
        card._tiltScheduled = true;
        requestAnimationFrame(() => {
          card._tiltScheduled = false;
          if (card !== tiltCard) return;
          card.style.transform = `perspective(800px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-2px)`;
          card.style.setProperty('--glow-x', `${(px * 100).toFixed(1)}%`);
          card.style.setProperty('--glow-y', `${(py * 100).toFixed(1)}%`);
        });
      }
    }, { passive: true });

    container.addEventListener('pointerleave', resetTilt, { passive: true });
  });

  function resetTilt() {
    if (!tiltCard) return;
    const card = tiltCard;
    tiltCard = null;
    card.style.transform = '';
    card.classList.remove('motion-tilt');
  }
}

function initMagneticButtons() {
  if (!hasFinePointer() || prefersReducedMotion()) return;

  document.addEventListener('pointerover', e => {
    const btn = e.target.closest?.('.btn-primary');
    if (!btn || btn._magnetBound) return;
    btn._magnetBound = true;

    btn.addEventListener('pointermove', ev => {
      const rect = btn.getBoundingClientRect();
      const dx = (ev.clientX - rect.left - rect.width / 2) / rect.width;
      const dy = (ev.clientY - rect.top - rect.height / 2) / rect.height;
      btn.style.transform = `translate(${(dx * 4).toFixed(1)}px, ${(dy * 3).toFixed(1)}px)`;
    }, { passive: true });

    btn.addEventListener('pointerleave', () => {
      btn.style.transform = '';
      setTimeout(() => { btn._magnetBound = false; }, 400);
    });
  }, { passive: true });
}

function initHeroParallax() {
  if (!hasFinePointer() || prefersReducedMotion()) return;
  const hero = document.querySelector('#tab-vocab .section-hero');
  if (!hero) return;

  let scheduled = false;
  window.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      const shift = Math.min(window.scrollY * 0.06, 24);
      hero.style.transform = `translateY(${-shift.toFixed(1)}px)`;
      hero.style.opacity = String(1 - shift / 90);
    });
  }, { passive: true });
}

// ════════════════════════════════════════════════════════════════════════════
// 6b. KINETICS PATTERNS — tab pill glide + digit bump
// ════════════════════════════════════════════════════════════════════════════

let glidePill = null;

/** Measures the active tab and glides the indicator pill under it. */
export function updateTabGlide(btnEl) {
  if (prefersReducedMotion()) return;
  const bar = document.querySelector('.tab-bar-container');
  glidePill = glidePill || document.getElementById('tab-glide-pill');
  if (!bar || !glidePill) return;

  const btn = btnEl || bar.querySelector('.tab-btn.active-tab');
  if (!btn) { glidePill.classList.remove('visible'); return; }

  const barRect = bar.getBoundingClientRect();
  const btnRect = btn.getBoundingClientRect();
  glidePill.style.width = `${Math.round(btnRect.width * 0.6)}px`;
  glidePill.style.transform = `translateX(${Math.round(btnRect.left - barRect.left + btnRect.width * 0.2)}px)`;
  glidePill.classList.add('visible');
}

function initTabGlide() {
  if (prefersReducedMotion()) return;
  updateTabGlide();
  window.addEventListener('resize', () => updateTabGlide(), { passive: true });
}

/** Brief springy pop on a value change (Kinetics digit-bump). */
export function bumpEl(el) {
  if (!el || prefersReducedMotion()) return;
  el.classList.remove('digit-bump');
  void el.offsetWidth;
  el.classList.add('digit-bump');
  el.addEventListener('animationend', () => el.classList.remove('digit-bump'), { once: true });
}

// ════════════════════════════════════════════════════════════════════════════
// 7. BOOTSTRAP
// ════════════════════════════════════════════════════════════════════════════

export function initMotion() {
  document.addEventListener('pointerdown', spawnRipple, { passive: true });
  initSwipeNavigation();
  initPointerTilt();
  initMagneticButtons();
  initHeroParallax();
  initTabGlide();
}

if (typeof window !== 'undefined') {
  window.initMotion = initMotion;
  window.rollValue = rollValue;
  window.springCssVar = springCssVar;
  window.updateTabGlide = updateTabGlide;
}
