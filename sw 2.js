const CACHE_NAME = "frasi-motivazionali-v2";
const LOCAL_ASSETS = ["./","./index.html","./manifest.json"];
const CDN_ASSETS = [
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js",
  "https://cdn.tailwindcss.com"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(LOCAL_ASSETS).catch(()=>{})));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const url = e.request.url;
  const isCDN = CDN_ASSETS.some(a=>url===a||url.startsWith(a));
  if(isCDN){
    e.respondWith(fetch(e.request).then(r=>{ const c=r.clone(); caches.open(CACHE_NAME).then(ca=>ca.put(e.request,c)).catch(()=>{}); return r; }).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>{ const nf=fetch(e.request).then(r=>{ const c=r.clone(); caches.open(CACHE_NAME).then(ca=>ca.put(e.request,c)).catch(()=>{}); return r; }).catch(()=>cached); return cached||nf; }));
});
