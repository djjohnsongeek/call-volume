const CACHE_NAME = 'pwa-calendar-v1.1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : undefined)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((network) => {
        // Cache successful GET responses
        if (request.method === 'GET' && network && network.status === 200) {
          const clone = network.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return network;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
