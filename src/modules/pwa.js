import { showToast } from './ui-utils.js';

/** @type {BeforeInstallPromptEvent|null} Cached PWA installation prompt event */
let deferredPrompt = null;

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
              showToast('يتوفر تحديث جديد وسيُفعّل عند فتح التطبيق مرة أخرى.');
            }
          });
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
