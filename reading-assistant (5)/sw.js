
const CACHE_NAME = 'tim-teacher-v10';

self.addEventListener('install', (event) => {
  console.log('Tim the Teacher: Installing Service Worker...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Tim the Teacher: Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Pass-through strategy for now to avoid caching broken versions
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
