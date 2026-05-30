const CACHE_NAME = 'infocard-pub-v5';
const ASSETS = [
  '/infocard-pub/',
  '/infocard-pub/index.html',
  '/infocard-pub/manifest.json',
  '/infocard-pub/docs/icon.svg',
  '/infocard-pub/assets/home/index.css',
  '/infocard-pub/assets/home/index.js',
  '/infocard-pub/assets/home/vendor/vue.global.prod.js',
  '/infocard-pub/assets/home/vendor/js-yaml.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // The index manifest and version must always be network-first/no-store.
  // Otherwise installed PWA clients can keep showing stale card counts (e.g. 24/25 while live is 26).
  if (url.pathname.endsWith('/_index.yaml') || url.pathname.endsWith('/docs/version.json')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  // HTML shell should prefer network so users pick up cache-busting fixes quickly.
  if (event.request.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/infocard-pub/')) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});