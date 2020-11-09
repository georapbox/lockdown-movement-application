const version = '1.0.0';
const cacheName = `movement-application-${version}`;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll([
        `https://georapbox.github.io/lockdown-movement-application/index.html`,
        `https://georapbox.github.io/lockdown-movement-application/styles/main.css`,
        `https://georapbox.github.io/lockdown-movement-application/scripts/main.js`
      ])
        .then(() => self.skipWaiting())
        .catch(err => console.error(err));
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(cacheName)
      .then(cache => cache.match(event.request, { ignoreSearch: true }))
      .then(response => response || fetch(event.request))
      .catch(err => console.error(err))
  );
});