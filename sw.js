self.addEventListener("install", function (event) {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(clients.claim());
});

// Simple cache
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.open("vvkvt-cache").then(function (cache) {
      return cache.match(event.request).then(function (response) {
        return (
          response ||
          fetch(event.request).then(function (fetchRes) {
            cache.put(event.request, fetchRes.clone());
            return fetchRes;
          })
        );
      });
    })
  );
});
