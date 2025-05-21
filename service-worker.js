const CACHE_NAME = "blackout-cache-v1";
const OFFLINE_URL = "offline.html";

const ASSETS_TO_CACHE = [
  ".",
  "index.html",
  "style.css",
  "app.js",
  "manifest.json",
  "icon.png",
  "products.csv",
  "images/placeholder.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then((response) => {
        return response || caches.match(OFFLINE_URL);
      })
    )
  );
});
