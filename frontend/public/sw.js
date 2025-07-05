const CACHE_NAME = 'etudia-v4-cache-v1';
const STATIC_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Installation
self.addEventListener('install', event => {
  console.log('🔧 ÉtudIA PWA: Installation Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_URLS))
      .then(() => {
        console.log('✅ ÉtudIA PWA: Cache créé avec succès');
        self.skipWaiting();
      })
  );
});

// Activation
self.addEventListener('activate', event => {
  console.log('🚀 ÉtudIA PWA: Activation...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ ÉtudIA PWA: Prêt pour installation !');
      self.clients.claim();
    })
  );
});

// Gestion des requêtes
self.addEventListener('fetch', event => {
  // Cache first pour les ressources statiques
  if (event.request.destination === 'image' || 
      event.request.url.includes('/icons/')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
  
  // Network first pour les API
  else if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => new Response('{"error":"Mode hors ligne"}', {
          headers: { 'Content-Type': 'application/json' }
        }))
    );
  }
});
