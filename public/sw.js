// Bayou Charity Service Worker — v1
// Caches shell assets for fast load; all Supabase calls go to network.

var CACHE_NAME = 'bayou-charity-v1';
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
  // Never intercept Supabase or external requests
  if (e.request.url.includes('supabase.co') || e.request.url.includes('formspree.io')) return;
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request);
    })
  );
});
