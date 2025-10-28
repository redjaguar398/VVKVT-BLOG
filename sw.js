const CACHE_NAME = 'my-blog-dynamic-cache-v3';
const PRECACHE_URLS = [
  '/', // homepage
  'https://fonts.googleapis.com/css?family=PT+Sans:400,400italic,700,700italic|Oswald:400,700|Roboto+Condensed:400,400italic,700,700italic&subset=latin,latin-ext',
  'https://fonts.googleapis.com/css?family=Roboto+Slab:400,700&subset=latin,latin-ext',
  '//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css',
];

// Install — pre-cache basic resources
self.addEventListener('install', event => {
  console.log('Service Worker: Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean old caches and take control
self.addEventListener('activate', event => {
  console.log('Service Worker: Activate');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch — network-first strategy with caching fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // If online, update cache with fresh version
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // If offline, return cached response (if available)
        return caches.match(event.request).then(response => {
          return response || new Response('You are offline. Please reconnect.');
        });
      })
  );
});

// ✅ Force refresh when a new service worker takes control
self.addEventListener('controllerchange', () => {
  console.log('New service worker activated — refreshing page.');
  self.clients.matchAll({ type: 'window' }).then(windowClients => {
    for (const client of windowClients) {
      // Avoid infinite loop by checking visibility
      client.navigate(client.url);
    }
  });
});
