// ------------------------------------------------------
// VVKVT KṬP - Service Worker
// Simple cache-first PWA service worker for Blogger
// ------------------------------------------------------

const CACHE_NAME = "vvkvt-cache-v1";
const OFFLINE_URL = "/offline.html";

// Install SW
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll([OFFLINE_URL]).catch(() => {});
    })
  );
});

// Activate SW
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  return self.clients.claim();
});

// Fetch Handler
self.addEventListener("fetch", (event) => {
  // Only GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          // Cache the response if valid
          if (
            response &&
            response.status === 200 &&
            response.type === "basic"
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL));
    })
  );
});
