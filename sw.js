const CACHE_NAME = 'avelloz-motos-v1';

// Básico do App Shell para cache inicial
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(['/','/index.html','/manifest.json']))
      .then(() => self.skipWaiting())
  );
});

// Ativação: limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.map((n) => {
      if (n !== CACHE_NAME) return caches.delete(n);
    }))).then(() => self.clients.claim())
  );
});

// Fetch: Cache first, then network (ignora admin e Firestore)
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  if (url.includes('firestore.googleapis.com') || url.includes('/admin')) {
    return event.respondWith(fetch(event.request));
  }
  event.respondWith(
    caches.match(event.request).then((resp) => {
      if (resp) return resp;
      return fetch(event.request).then((networkResp) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResp.clone());
          return networkResp;
        });
      });
    }).catch(() => undefined)
  );
});

