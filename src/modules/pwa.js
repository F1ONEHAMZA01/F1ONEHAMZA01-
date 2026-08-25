import { showToast } from './ui-utils.js';

/** @type {BeforeInstallPromptEvent|null} Cached PWA installation prompt event */
let deferredPrompt = null;
let updateBannerShown = false;

/**
 * Shows a persistent update banner offering an immediate reload
 */
function showUpdateBanner() {
  if (updateBannerShown) return;
  updateBannerShown = true;

  const banner = document.createElement('div');
  banner.id = 'pwa-update-banner';
  banner.setAttribute('role', 'status');
  banner.style.cssText =
    'position:fixed; bottom:calc(76px + var(--safe-bottom, 0px)); left:50%; transform:translateX(-50%);' +
    'z-index:6000; display:flex; align-items:center; gap:12px; padding:10px 16px; border-radius:999px;' +
    'background:#1d4d35; color:#98f6b0; font-family:inherit; font-size:13.5px; font-weight:700;' +
    'box-shadow:0 8px 24px rgba(0,0,0,.4), 0 0 0 1px rgba(34,197,94,.35); white-space:nowrap;';

  const label = document.createElement('span');
  label.textContent = '🔄 إصدار جديد من التطبيق جاهز';

  const reloadBtn = document.createElement('button');
  reloadBtn.type = 'button';
  reloadBtn.textContent = 'تحديث الآن';
  reloadBtn.style.cssText =
    'border:0; border-radius:999px; padding:7px 14px; background:#22c55e; color:#04220f;' +
    'font-family:inherit; font-size:12.5px; font-weight:800; cursor:pointer;';
  reloadBtn.addEventListener('click', () => window.location.reload());

  banner.append(label, reloadBtn);
  document.body.appendChild(banner);
}

/**
 * Initializes Progressive Web App service worker registration and install prompt listener
 */
export function initPWA() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) installBtn.style.display = 'inline-flex';
  });

  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
      .then(reg => {
        reg.addEventListener('updatefound', () => {
          const worker = reg.installing;
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              showToast('يتوفر تحديث جديد — سيُفعّل عند إعادة التشغيل.');
            }
          });
        });

        // The SW self-skips waiting; once the new controller takes over,
        // offer a one-tap reload so the new version goes live instantly.
        let navigated = true;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!navigated) return;
          navigated = false;
          setTimeout(showUpdateBanner, 400);
        });
      })
      .catch(err => console.error('Service Worker Registration Failed:', err));
  }
}

/**
 * Triggers the browser native PWA installation dialog
 */
export function installPWAApp() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      showToast('تمت إضافة التطبيق إلى الشاشة الرئيسية بنجاح!');
    }
    deferredPrompt = null;
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) installBtn.style.display = 'none';
  });
}

if (typeof window !== 'undefined') {
  window.installPWAApp = installPWAApp;
}
