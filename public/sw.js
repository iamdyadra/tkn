const CACHE_NAME = 'tkn-v1';
const ASSETS = [
  '/tkn/',
  '/tkn/index.html',
  '/tkn/manifest.json',
  // Aset lain akan masuk via dynamic cache
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Hanya cache request GET
  if (event.request.method !== 'GET') return;

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
          return caches.match('/tkn/index.html');
        }
      });
    })
  );
});
