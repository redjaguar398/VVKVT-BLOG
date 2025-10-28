// ===== Blogger Service Worker - Auto Update on Load =====

// Increment version every time you update your blog or template
const CACHE_NAME = 'vvkvt-cache-v4';

// Precache basic assets
const PRECACHE_URLS = [
  '/', // homepage
  'https://fonts.googleapis.com/css?family=PT+Sans:400,700|Oswald:400,700|Roboto+Condensed:400,700&display=swap',
  'https://fonts.googleapis.com/css?family=Roboto+Slab:400,700&display=swap',
  'https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css'
];

// Install and cache core files
self.addEventListener('install', event => {
  console.log('[SW] Installing new service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate new service worker immediately
self.addEventListener('activate', event => {
  console.log('[SW] Activating new service worker...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[SW] Removing old cache:', key);
          return caches.delete(key);
        }
      }))
    ).then(() => self.clients.claim())
  );
});

// Fetch with network-first strategy
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
