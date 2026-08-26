const APP_VERSION = '3.1.1';
const STATIC_CACHE = `btp-maroc-static-${APP_VERSION}`;
const CONTENT_CACHE = `btp-maroc-content-${APP_VERSION}`;

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-maskable.svg',
  './fonts/cairo-arabic.woff2',
  './fonts/cairo-latin.woff2',
  './fonts/roboto-flex-latin.woff2'
];

const CONTENT_ASSETS = [
  './data/vocab.js?v=3.1.1',
  './data/reading-docs.js',
  './data/writing-templates.js',
  './data/grammar-lessons.js',
  './data/plan-tasks.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(APP_SHELL)),
      caches.open(CONTENT_CACHE).then(cache => cache.addAll(CONTENT_ASSETS))
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  const currentCaches = new Set([STATIC_CACHE, CONTENT_CACHE]);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => currentCaches.has(key) ? null : caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

(() => {
  async function networkFirstNavigation(request) {
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        const cache = await caches.open(STATIC_CACHE);
        await cache.put('./index.html', response.clone());
      }
      return response;
    } catch {
      return (await caches.match('./index.html')) || (await caches.match('./'));
    }
  }

  async function cacheFirstContent(request) {
    const cached = await caches.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CONTENT_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  }

  async function staleWhileRevalidate(request) {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request, { ignoreSearch: true });
    const network = fetch(request).then(response => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    }).catch(() => null);
    return cached || network;
  }

  self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    if (event.request.mode === 'navigate') {
      event.respondWith(networkFirstNavigation(event.request));
      return;
    }

    if (url.pathname.startsWith('/data/') || url.pathname.startsWith('/fonts/')) {
      event.respondWith(cacheFirstContent(event.request));
      return;
    }

    event.respondWith(staleWhileRevalidate(event.request));
  });
})();
