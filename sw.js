// Derivasi base path dari URL file sw.js itu sendiri.
// Service Worker TIDAK memiliki akses ke `window` — harus pakai `self.location`.
// Contoh:
//   self.location.pathname = '/sw.js'      → APP_BASE_PATH = '/'
//   self.location.pathname = '/tkn/sw.js'  → APP_BASE_PATH = '/tkn/'
const APP_BASE_PATH = self.location.pathname.substring(0, self.location.pathname.lastIndexOf('/') + 1);

const CACHE_NAME = 'tkn-v3';
const ASSETS = [
  `${APP_BASE_PATH}`,
  `${APP_BASE_PATH}index.html`,
  `${APP_BASE_PATH}manifest.json`,
  // Aset lain akan masuk via dynamic cache
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Hanya cache request GET
  if (event.request.method !== 'GET') return;

  // Jangan cache request ke API
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return dari cache jika ada, jika tidak fetch dari network
      return response || fetch(event.request).then((fetchResponse) => {
        // Simpan hasil fetch ke cache untuk aset statis atau gambar
        if (fetchResponse.status === 200) {
          const cacheCopy = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cacheCopy);
          });
        }
        return fetchResponse;
      }).catch(() => {
        // Jika offline dan tidak ada di cache
        if (event.request.mode === 'navigate') {
          return caches.match(`${APP_BASE_PATH}index.html`);
        }
      });
    })
  );
});
