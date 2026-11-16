const CACHE_NAME = 'guia-turistico-v2';

const SHELL = [
  './',
  './index.html',
  './locais.html',
  './cadastro.html',
  './detalhes.html',
  './offline.html',
  './style.css',
  './app.js',
  './db.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  console.log('📦 Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Arquivos em cache');
        return cache.addAll(SHELL);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('🚀 Service Worker ativado');
  event.waitUntil(
    caches.keys().then(nomes => {
      return Promise.all(
        nomes
          .filter(nome => nome !== CACHE_NAME)
          .map(nome => caches.delete(nome))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(respostaCache => {
        if (respostaCache) {
          return respostaCache;
        }
        return fetch(event.request)
          .catch(() => {
            if (event.request.mode === 'navigate') {
              return caches.match('./offline.html');
            }
          });
      })
  );
});
