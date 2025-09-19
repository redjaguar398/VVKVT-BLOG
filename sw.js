const CACHE_NAME = 'my-blog-dynamic-cache-v1';
const urlsToCache = [
  // These are your static assets that are always needed
  '/', // Your homepage
  '/index.html', // Fallback, good practice
  'https://fonts.googleapis.com/css?family=PT+Sans:400,400italic,700,700italic|Oswald:400,700|Roboto+Condensed:400,400italic,700,700italic&subset=latin,latin-ext',
  'https://fonts.googleapis.com/css?family=Roboto+Slab:400,700&subset=latin,latin-ext',
  '//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // Check if this is a navigation request
  if (event.request.mode === 'navigate') {
    // If so, check for a cached version
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // If a cached response exists, return it
          if (response) {
            return response;
          }
          // If not, fetch from the network and cache it
          return fetch(event.request)
            .then(networkResponse => {
              // Open a new cache and add the network response to it
              return caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, networkResponse.clone());
                  return networkResponse;
                });
            });
        })
    );
  } else {
    // For other assets (images, CSS, JS), use a cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request);
        })
    );
  }
});
