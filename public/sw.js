// Bayou Charity Service Worker — v2
// Caches shell assets for fast load; only intercepts same-origin GET requests.
// Cross-origin CDN resources (Supabase JS, Leaflet, Google Fonts) are never
// intercepted — the browser fetches them directly, respecting CSP.

var CACHE_NAME = 'bayou-charity-v2';
var SHELL_ASSETS = [
  '/',
  '/bayou-family-fishing.html',
  '/Photos/BFF+Logo.jpg',
  '/Photos/skyline.jpg'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(SHELL_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE_NAME; }).map(function(k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Only handle same-origin GET requests.
  // Cross-origin requests (CDN fonts, Leaflet, Supabase JS, etc.) must go
  // directly to the network — intercepting them via fetch() would violate
  // the page's connect-src CSP and block those resources from loading.
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request);
    })
  );
});
