// make a function to easily add prefixes to each list item
function addPrefixToList(list, prefix) {
  for (let i = 0; i < list.length; i++) {
    list[i] = prefix + list[i];
  }
}

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
  'allGames.png',
  'favorites.png',
  'create.png',
  'settings.png',
  'share.svg',
  'import.svg', 
  'create.svg',
  'edit.svg',
  'delete.svg',
  'arrow-left.svg',
  'arrow-replay.svg',
  'dropdown-menu.svg',
  'heart-fill.svg',
  'heart-outline.svg'
];
addPrefixToList(generalIcons, "icons/general/");

// cache the audio files
const audioFiles = [
  'audio/correct.mp3',
  'audio/pass.mp3',
  'audio/count.mp3'
];

// cache the icon files for individual games
const gameIcons = [
  'book.svg', 
  'car.svg', 
  'clapboard.svg', 
  'comic.svg', 
  'copyright.svg', 
  'currency.svg', 
  'dice.svg', 
  'drink.svg', 
  'earth.svg', 
  'flower.svg', 
  'food.svg', 
  'graduation_cap.svg', 
  'internet.svg', 
  'landmark.svg', 
  'magic_wand.svg', 
  'mask.svg', 
  'music_note.svg', 
  'paw_print.svg', 
  'profession.svg', 
  'robot.svg', 
  'rocket.svg', 
  'science.svg', 
  'skull.svg', 
  'soccer_ball.svg', 
  'star.svg', 
  'stethoscope.svg', 
  'theater_masks.svg', 
  'trophy.svg', 
  'tv.svg', 
  'videogame_controller.svg'
];
addPrefixToList(gameIcons, "icons/game-sets/");

// cache the json files for individual games
const gameJSONs = [
  'food.json',
  'famous_landmarks.json',
  'act_it_out.json',
  'animals.json',
  'us_states_and_capitals.json',
  'occupations.json',
  'brands_and_products.json',
  'video_game_characters.json',
  'car_manufacturers.json',
  'manga.json',
  'plants.json',
  'sports.json',
  'anatomy.json',
  'beverages.json',
  'school_subjects.json',
  'blockbuster_films.json',
  'periodic_table.json',
  'greatest_hits.json',
  'world_currencies.json',
  'fairy_tales.json',
  'hit_tv_shows.json',
  'tabletop_and_card_games.json',
  'christmas.json',
  'literary_classics.json',
  'halloween.json',
  'oscar_winners.json',
  'hashtags.json',
  'nasa.json',
  'superheroes.json',
  'common_phrases.json',
  'supervillains.json',
  'sound_effects.json',
  'constellations.json',
  'toys.json',
  'pokemon.json',
  'accents_and_impressions.json',
  'marvel.json',
  'sports_teams.json',
  'game_shows.json',
  'olympics.json',
  'dance_moves.json',
  'disney_characters.json',
  'world_countries_and_capitals.json',
  'youtubers.json',
  'broadway_musicals.json',
  'tech_through_the_ages.json',
  'instruments.json',
  'anime.json',
  'pixar.json',
  'social_media.json',
  'harry_potter.json',
  'bible_stories.json',
  'star_wars.json',
  'hollywood_stars.json',
  'theme_songs',
  'ryan_reynolds_movies',
  'pop_culture',
  'nintendo',
  'twilight',
  'music_through_the_decades',
  'dwayne_johnson_movies',
  'cosplay',
  'horror_movie_characters',
  'tools',
  'k-pop_music',
  'scarlett_johansson_movies',
  'nickelodeon',
  'dnd',
  'scientific_terms',
  'michael_jackson_songs',
  'robin_williams_movies',
  'super_mario_bros',
  'star_trek',
  'nursery_rhymes',
  'easter',
  'jennifer_aniston_movies',
  'country_music',
  'politically_correct',
  'super_smash_bros',
  'pirates_of_the_caribbean',
  'childrens_movies',
  'rhymes_with',
  'restaurants',
  'nascar',
  'music_groups',
  'sci-fi_movies',
  'barnyard_animals',
  'college_degrees',
  'shopping_spree',
  'love_songs',
  'medical_procedures',
  'will_ferrel_movies',
  'facial_expressions',
  'starbucks_drinks',
  'royal_figures',
  'draw_it',
  'julia_roberts_movies'
];
addPrefixToList(gameJSONs, "game-sets/");



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
