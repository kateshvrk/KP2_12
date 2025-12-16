// --- Повідомлення від сторінки (оновлення SW) ---
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// --- Конфіг ---
const CACHE_NAME = 'coffee-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/coffee.jpg',
  '/manifest.json'
];

// --- Install ---
self.addEventListener('install', event => {
  console.log('SW: install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Кешуємо файли');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// --- Activate ---
self.addEventListener('activate', event => {
  console.log('SW: activate');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// --- Fetch ---
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        console.log('З кешу:', event.request.url);
        return cached;
      }

      return fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          console.log('Офлайн, немає в кеші:', event.request.url);
          return new Response('Офлайн, ресурс не доступний', {
            headers: { 'Content-Type': 'text/plain' }
          });
        });
    })
  );
});

// --- Sync офлайн-замовлень ---
self.addEventListener('sync', event => {
  if (event.tag === 'send-order') {
    event.waitUntil(
      fetch('/api/send-order', {
        method: 'POST',
        body: JSON.stringify({ item: 'Лате' }) // Імітація, насправді використовуй реальний API
      })
      .then(() => 
        self.clients.matchAll().then(clients => 
          clients.forEach(client => client.postMessage('Замовлення відправлено!'))
        )
      )
      .catch(err => console.log('Помилка sync:', err))
    );
  }
});
