// Project Butterfly service worker — makes the game fully playable offline.
// Strategy: precache the app shell; cache-first for same-origin files with background refresh
// (stale-while-revalidate); runtime-cache Firebase SDK files so cloud features also load offline.
const VERSION = 'bf-v1.0.0';
const CORE = [
  './', 'index.html', 'manifest.webmanifest', 'css/style.css',
  'vendor/three.bundle.js',
  'js/main.js', 'js/config.js', 'js/util.js', 'js/audio.js', 'js/haptics.js', 'js/input.js', 'js/fx.js', 'js/gfx.js',
  'js/geo.js', 'js/world.js', 'js/track.js', 'js/player.js', 'js/companion.js', 'js/ui.js', 'js/save.js', 'js/cloud.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFirebaseSdk = url.hostname === 'www.gstatic.com' && url.pathname.includes('/firebasejs/');
  if (!sameOrigin && !isFirebaseSdk) return;  // Firestore/Auth network calls are handled by the SDK itself

  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const cached = await cache.match(req, { ignoreSearch: false });
    const network = fetch(req).then((res) => {
      if (res && res.ok && (res.type === 'basic' || res.type === 'cors')) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    if (cached) { e.waitUntil(network); return cached; }                // instant, refresh in background
    const res = await network;
    if (res) return res;
    if (req.mode === 'navigate') return (await cache.match('index.html')) || Response.error();
    return Response.error();
  })());
});
