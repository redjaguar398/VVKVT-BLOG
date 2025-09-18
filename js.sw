// Name of the cache
const CACHE_NAME = "blogspot-pwa-v1";

// Files to cache (add your blog’s static files here)
const urlsToCache = [
  "/",                // Home
  "/index.html",      // Main page
  "/favicon.ico",     // Favicon
  "/manifest.json"    // Manifest file
  // You can add CSS, JS, or image links if they are fixed
];

// Install Service Worker and cache resources
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activate Service Worker (cleanup old caches if any)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

// Fetch cached resources
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});