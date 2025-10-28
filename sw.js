const CACHE_NAME = 'my-blog-dynamic-cache-v4';
const PRECACHE_URLS = [
  '/', // homepage
  'https://fonts.googleapis.com/css?family=PT+Sans:400,400italic,700,700italic|Oswald:400,700|Roboto+Condensed:400,400italic,700,700italic&subset=latin,latin-ext',
  'https://fonts.googleapis.com/css?family=Roboto+Slab:400,700&subset=latin,latin-ext',
  '//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css'
];

// Install: cache basic files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clear old cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first with smooth update
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Update cache with latest version
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      })
      .catch(() =>
        caches.match(event.request).then(resp =>
          resp || new Response('You are offline. Please reconnect.')
        )
      )
  );
});

// 🔄 Notify all tabs when new service worker activates
self.addEventListener('controllerchange', () => {
  self.clients.matchAll({ type: 'window' }).then(clients => {
    for (const client of clients) {
      client.postMessage({ action: 'refresh-page' });
    }
  });
});
