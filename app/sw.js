/* AOV Saga app — offline cache for /app/ only.
 * Bump VERSION whenever app files change so phones pick up the new build.
 */
var VERSION = 'aov-app-v1';
var SHELL = [
  '/app/',
  '/app/app.css',
  '/app/app.js',
  '/app/data/codex.json',
  '/icons/apple-touch-icon.png',
  '/icons/icon-192.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k.indexOf('aov-app-') === 0 && k !== VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Network first, cache as fallback: fresh content when online, still opens offline.
self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  var ours = url.origin === self.location.origin && (url.pathname.indexOf('/app/') === 0 || url.pathname.indexOf('/icons/') === 0);
  var fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!ours && !fonts) return;

  event.respondWith(
    fetch(req).then(function (res) {
      if (res.ok || res.type === 'opaque') {
        var copy = res.clone();
        caches.open(VERSION).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (hit) {
        return hit || (req.mode === 'navigate' ? caches.match('/app/') : Response.error());
      });
    })
  );
});
