const CACHE_NAME = "gamenxt-cache-v1";
const URLS_TO_CACHE = [
  "game.html",
  "game.js",
  "char.png",
  "bg.png",
  "obs.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});