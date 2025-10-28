// ====== Blogger Service Worker (Smooth Auto Refresh) ======

// Change this version each time you update your blog or design
const CACHE_NAME = 'vvkvt-cache-v3';

// Files to pre-cache (essential only)
const PRECACHE_URLS = [
  '/', // homepage
  'https://fonts.googleapis.com/css?family=PT+Sans:400,700|Oswald:400,700|Roboto+Condensed:400,700&display=swap',
  'https://fonts.googleapis.com/css?family=Roboto+Slab:400,700&display=swap',
  'https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css'
];

// Install: cache essential files
self.addEventListener('install', event => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clear old caches + claim clients
self.addEventListener('activate', event => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first, then cache fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then(resp => resp || new Response('You are offline. Please reconnect.'))
      )
  );
});

// Listen for messages from page (to trigger skipWaiting manually if needed)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
