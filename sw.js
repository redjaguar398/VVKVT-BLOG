// VVKVT Blog — Popular PWA Service Worker
const CACHE_VERSION = 'v1.0.0';  // 🔹 bump this to refresh cache
const CACHE_NAME = `vvkvt-cache-${CACHE_VERSION}`;
const PRECACHE_URLS = [
  '/', // homepage
  'https://fonts.googleapis.com/css?family=Roboto+Condensed:400,700&display=swap'
];

// --- Install Event: pre-cache essentials ---
self.addEventListener('install', event => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// --- Activate Event: clear old caches ---
self.addEventListener('activate', event => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    ).then(() => self.clients.claim())
  );
});

// --- Fetch Event: network-first, cache fallback ---
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
