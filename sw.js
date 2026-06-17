const CACHE_NAME = "frasi-motivazionali-v2";
const LOCAL_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json"
];
const CDN_ASSETS = [
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js",
  "https://cdn.tailwindcss.com"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(LOCAL_ASSETS).catch(()=>{})
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Local app files: serve from cache, but always revalidate in the background (stale-while-revalidate).
// Third-party CDN scripts: network-first, so a compromised/updated CDN file is never silently
// served from a stale cache once the device is back online; cache is only a fallback for true offline use.
self.addEventListener("fetch", event => {
  const url = event.request.url;
  const isCDN = CDN_ASSETS.some(a => url === a || url.startsWith(a));

  if (isCDN) {
    event.respondWith(
      fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(()=>{});
        return response;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(()=>{});
        return response;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});
