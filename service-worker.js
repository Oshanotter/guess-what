const CACHE_NAME = 'my-cache-v1';

const urlsToCache = [
  'index.html',
  './', // Alias for index.html
  'astyles.css',
  'main.css',
  'demo.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Try to fetch a fresh copy from the network
        return fetch(event.request)
          .then(response => {
            // Update the cache with the new response
            return caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, response.clone());
                return response;
              });
          })
          .catch(() => {
            // If fetching from the network fails, return the cached response
            return response || caches.match('offline.html'); // Provide a fallback page if needed
          });
      })
  );
});

self.addEventListener('activate', event => {
  // Remove outdated caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
