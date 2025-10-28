// VVKVT Blog — Improved PWA with Offline Support
const CACHE_VERSION = 'v1.0.2';
const CACHE_NAME = `vvkvt-cache-${CACHE_VERSION}`;
const OFFLINE_URL = 'https://raw.githubusercontent.com/redjaguar398/VVKVT-BLOG/main/offline.html';

const PRECACHE_URLS = [
  '/', // homepage
  'https://fonts.googleapis.com/css?family=Roboto+Condensed:400,700&display=swap',
  OFFLINE_URL
];

// --- Install Event ---
self.addEventListener('install', event => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// --- Activate Event ---
self.addEventListener('activate', event => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// --- Fetch Event (Network first, then cache, then offline page) ---
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        return cached || caches.match(OFFLINE_URL);
      })
  );
});
