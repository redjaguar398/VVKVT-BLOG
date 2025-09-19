const CACHE_NAME = 'my-blog-dynamic-cache-v2';
const PRECACHE_URLS = [
  '/', // Your homepage
  'https://fonts.googleapis.com/css?family=PT+Sans:400,400italic,700,700italic|Oswald:400,700|Roboto+Condensed:400,400italic,700,700italic&subset=latin,latin-ext',
  'https://fonts.googleapis.com/css?family=Roboto+Slab:400,700&subset=latin,latin-ext',
  '//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css',
];

self.addEventListener('install', event => {
  console.log('Service Worker Install Event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Pre-cache only the most essential files
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker Activate Event');
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return the cached response if it exists
        if (response) {
          return response;
        }

        // Otherwise, fetch from the network and add to cache
        return fetch(event.request).then(
          networkResponse => {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          }
        );
      })
      .catch(() => {
        // Fallback for failed requests, e.g., show an offline page
        return new Response('You are offline. Please try again when you have a connection.');
      })
  );
});
