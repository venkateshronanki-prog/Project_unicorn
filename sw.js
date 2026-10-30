// Project Butterfly service worker — makes the game fully playable offline.
// Strategy: precache the app shell; cache-first for same-origin files with background refresh
// (stale-while-revalidate); runtime-cache Firebase SDK files so cloud features also load offline.
const VERSION = 'bf-v2.13.0';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png', 'unicorn.glb', 'wings.json', 'mermaid.glb', 'land.glb', 'reef.glb', 'foal.glb', 'ground_c.webp', 'sky_dawn.webp', 'sky_day.webp', 'sky_sunset.webp', 'sky_night.webp', 'sea_clown_d.jpg', 'sea_clown_lod.glb', 'sea_clown_n.jpg', 'sea_clown_r.jpg', 'sea_dolphin.fbx', 'sea_fish1.fbx', 'sea_fish3.fbx', 'sea_mandarin.glb', 'sea_manta.fbx', 'sea_parrot.glb', 'sea_shark.fbx', 'sea_tang.fbx', 'sea_whale.fbx', 'ob_arch.glb', 'ob_barrel.glb', 'ob_cart.glb', 'ob_column.glb', 'ob_coral.glb', 'ob_crate.glb', 'ob_crystal.glb', 'ob_fence.glb', 'ob_heart.glb', 'ob_hull.glb', 'ob_log.glb', 'ob_logpile.glb', 'ob_mast.glb', 'ob_ribs.glb', 'ob_sponge.glb', 'ob_urchin.glb', 'ob_warch.glb', 'ob_wcolumn.glb', 'sp_ast1.glb', 'sp_ast2.glb', 'sp_ast3.glb', 'sp_ast4.glb', 'sp_ast5.glb', 'sp_cloud.webp', 'sp_comet.glb', 'sp_gate.glb', 'sp_halo.glb', 'sp_hoop.glb', 'sp_isl1.glb', 'sp_isl2.glb', 'sp_isl3.glb', 'sp_isl4.glb', 'sp_palace.glb', 'sp_rbarch.glb', 'sp_rings.glb', 'sp_temple.glb', 'pl_earth.webp', 'pl_jupiter.webp', 'pl_mars.webp', 'pl_mercury.webp', 'pl_moon.webp', 'pl_neptune.webp', 'pl_saturn.webp', 'pl_sun.webp', 'pl_uranus.webp', 'pl_venus.webp', 'ha_angel.glb', 'ha_cloud.glb', 'ha_halogate.glb', 'ha_harp.glb'];

self.addEventListener('install', (e) => {
  // add files one by one so a single missing/slow file can never abort the whole offline install
  e.waitUntil(caches.open(VERSION).then(async (c) => {
    await Promise.all(CORE.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => null)));
    if (!(await c.match('index.html'))) throw new Error('index.html not cached');
  }).then(() => self.skipWaiting()));
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
    const cached = await cache.match(req, { ignoreSearch: req.mode === 'navigate' });
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
