// Bayou Charity Service Worker — v3
// Network-first for HTML (always fresh content), cache-first for images.
// Cross-origin CDN resources (Supabase JS, Leaflet, Google Fonts) are never
// intercepted — the browser fetches them directly, respecting CSP.

var CACHE_NAME = 'bayou-charity-v4';
var SHELL_ASSETS = [
  '/',
  '/index.html',
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

  // HTML + JS requests: network-first (always get fresh content, fall back to cache)
  // app.js changes with every feature deploy and must not be served stale from cache.
  if (e.request.mode === 'navigate' || e.request.url.endsWith('.html') || e.request.url.endsWith('.js')) {
    e.respondWith(
      fetch(e.request).then(function(response) {
        // Update cache with fresh response
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, clone);
        });
        return response;
      }).catch(function() {
        return caches.match(e.request);
      })
    );
    return;
  }

  // All other assets: cache-first (fast loads for images, etc.)
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request);
    })
  );
});
