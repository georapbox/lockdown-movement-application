const version = '1.0.2';
const cacheName = `movement-application-${version}`;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './styles/main.css',
        './scripts/main.js',
        './img/icons/share.svg',
        './img/icons/bank.svg',
        './img/icons/cake.svg',
        './img/icons/cart.svg',
        './img/icons/pharmacy.svg',
        './img/icons/run.svg',
        './img/icons/support.svg',
        './img/icons/send.svg',
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