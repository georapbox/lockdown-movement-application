var VERSION = '1.0.6';
var APP_PREFIX = 'movement-application-';
var CACHE_NAME = APP_PREFIX + VERSION;
var REPOSITORY = 'lockdown-movement-application';

var isLocalEnv = ['127.0.0.1', 'localhost'].indexOf(self.location.hostname) > -1;
var path = isLocalEnv ? './' : '/' + REPOSITORY + '/';

var URLS = [
  path,
  path + 'index.html',
  path + 'manifest.webmanifest',
  path + 'icons/icon-36.png',
  path + 'icons/icon-48.png',
  path + 'icons/icon-72.png',
  path + 'icons/icon-96.png',
  path + 'icons/icon-144.png',
  path + 'icons/icon-192.png',
  path + 'styles/main.css',
  path + 'scripts/main.js',
  path + 'img/icons/send.svg',
  path + 'img/icons/moon.svg',
  path + 'img/icons/sun.svg'
];

// Respond with cached resources

// self.addEventListener('fetch', function (e) {
//   console.log('fetch request : ' + e.request.url);

//   e.respondWith(
//     caches.match(e.request).then(function (request) {
//       if (request) { // if cache is available, respond with cache
//         console.log('responding with cache : ' + e.request.url);
//         return request;
//       } else { // if there are no cache, try fetching request
//         console.log('file is not cached, fetching : ' + e.request.url);
//         return fetch(e.request);
//       }

//       // You can omit if/else for console.log & put one line below like this too.
//       // return request || fetch(e.request)
//     }).catch(function (err) {
//       console.error(err);
//     })
//   );
// });

self.addEventListener('fetch', function (event) {
  'use strict';

  isLocalEnv && console.log('%cWORKER: fetch event in progress.', 'color:orange;');

  if (event.request.method !== 'GET') {
    isLocalEnv && console.log('WORKER: fetch event ignored.', event.request.method, event.request.url);
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      var networked;

      function fetchedFromNetwork(response) {
        var cacheCopy = response.clone();

        isLocalEnv && console.log('%cWORKER: fetch response from network. ' + event.request.url, 'color:dodgerblue;');

        caches
          .open(CACHE_NAME)
          .then(function (cache) {
            cache.put(event.request, cacheCopy).catch(function (err) {
              console.error(err);
            });
          })
          .then(function () {
            isLocalEnv && console.log('%cWORKER: fetch response stored in cache. ' + event.request.url, 'color:green;');
          })
          .catch(function (err) {
            console.error(err);
          });

        return response;
      }

      function unableToResolve() {
        isLocalEnv && console.log('WORKER: fetch request failed in both cache and network.');

        // return new Response('<h1>Service Unavailable</h1>', {
        //   status: 503,
        //   statusText: 'Service Unavailable',
        //   headers: new Headers({
        //     'Content-Type': 'text/html'
        //   })
        // });
      }

      networked = fetch(event.request)
        .then(fetchedFromNetwork, unableToResolve)
        .catch(unableToResolve);

      isLocalEnv && console.log('WORKER: fetch event', cached ? '(cached)' : '(network)', event.request.url);
      return cached || networked;
    }).catch(function (err) {
      console.error(err);
    })
  );
});

// Cache resources
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      isLocalEnv && console.log('WORKER: installing cache : ' + CACHE_NAME);
      return cache.addAll(URLS);
    }).catch(function (err) {
      console.error(err);
    })
  );
});

// Delete outdated caches
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      // `keyList` contains all cache names under your username.github.io
      // filter out ones that has this app prefix to create white list
      var cacheWhitelist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      });
      // add current cache name to white list
      cacheWhitelist.push(CACHE_NAME);

      return Promise.all(keyList.map(function (key, i) {
        if (cacheWhitelist.indexOf(key) === -1) {
          isLocalEnv && console.log('%cWORKER: deleting cache : ' + keyList[i], 'color:red;');
          return caches.delete(keyList[i]);
        }
      }));
    }).catch(function (err) {
      console.error(err);
    })
  );
});
