const PRECACHE = 'precache';

// cache the main files needed for the webpage
const mainFiles = [
  'index.html',
  './', // Alias for index.html
  'styles.css',
  'script.js', 
  'manifest.json',
  'icons/full.png',
  'icons/masked.png'
];

// cache the icons for the menu bar and other stuff
const generalIcons = [
  'icons/general/allGames.png',
  'icons/general/favorites.png',
  'icons/general/create.png',
  'icons/general/settings.png',
  'icons/general/share.svg',
  'icons/general/import.svg', 
  'icons/general/create.svg',
  'icons/general/edit.svg',
  'icons/general/delete.svg',
  'icons/general/arrow-left.svg',
  'icons/general/arrow-replay.svg',
  'icons/general/dropdown-menu.svg',
  'icons/general/heart-fill.svg',
  'icons/general/heart-outline.svg'
];

// cache the audio files
const audioFiles = [
  'audio/correct.mp3',
  'audio/pass.mp3',
  'audio/count.mp3'
];

// cache the json files for individual games
const gameJSONs = [
  'game-sets/pokemon.json',
  'game-sets/test.json'
];

// cache the icon files for individual games
const gameIcons = [
  
];


// combine all of the cached pages into one list
const PRECACHE_URLS = [...mainFiles, ...generalIcons, ...audioFiles, ...gameJSONs, ...gameIcons];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});


// On fetch, use cache but update the entry with the latest contents from the server.
self.addEventListener('fetch', function(evt) {
  // You can use respondWith() to answer ASAP…
  evt.respondWith(fromCache(evt.request));
  // ...and waitUntil() to prevent the worker to be killed until the cache is updated.
  evt.waitUntil(
    update(evt.request)
  );
});

// Open the cache where the assets were stored and search for the requested resource. Notice that in case of no matching, the promise still resolves but it does with undefined as value.
function fromCache(request) {
  return caches.open(PRECACHE).then(function (cache) {
    return cache.match(request);
  });
}

// Update consists in opening the cache, performing a network request and storing the new response data.
function update(request) {
  return caches.open(PRECACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response.clone()).then(function () {
        return response;
      });
    });
  });
}
