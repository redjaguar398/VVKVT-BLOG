/* ===== Blogger + GitHub PWA Service Worker ===== */
const CACHE_NAME = 'blog-auto-update-v1';

// Install: skip waiting for immediate activation
self.addEventListener('install', event => self.skipWaiting());

// Activate: clear any previous caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Fetch: prefer live network, fallback to cache if offline
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Save fresh copy for offline use
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
