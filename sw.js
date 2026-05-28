const CACHE_NAME = 'infocard-pub-v3';
const ASSETS = [
  '/infocard-pub/',
  '/infocard-pub/index.html',
  '/infocard-pub/_index.yaml',
  '/infocard-pub/manifest.json',
  '/infocard-pub/docs/icon.svg',
  '/infocard-pub/docs/version.json'
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

  if (url.pathname.endsWith('/docs/version.json')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});