// Project Butterfly service worker, makes the game fully playable offline.
// Strategy: precache the app shell; cache-first for same-origin files with background refresh
// (stale-while-revalidate); runtime-cache Firebase SDK files so cloud features also load offline.
const VERSION = 'bf-v2.28.0';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png', 'unicorn.glb', 'wings.json', 'merb.glb', 'land.glb', 'reef.glb', 'foal.glb', 'ground_c.webp', 'sky_dawn.webp', 'sky_day.webp', 'sky_sunset.webp', 'sky_night.webp', 'sky_dome.webp', 'ember.glb', 'sea_clown_d.jpg', 'sea_clown_lod.glb', 'sea_clown_n.jpg', 'sea_clown_r.jpg', 'sea_dolphin.fbx', 'sea_fish1.fbx', 'sea_fish3.fbx', 'sea_mandarin.glb', 'sea_manta.fbx', 'sea_parrot.glb', 'sea_shark.fbx', 'sea_tang.fbx', 'sea_whale.fbx', 'ob_arch.glb', 'ob_barrel.glb', 'ob_cart.glb', 'ob_column.glb', 'ob_coral.glb', 'ob_crate.glb', 'ob_crystal.glb', 'ob_fence.glb', 'ob_heart.glb', 'ob_hull.glb', 'ob_log.glb', 'ob_logpile.glb', 'ob_mast.glb', 'ob_ribs.glb', 'ob_sponge.glb', 'ob_urchin.glb', 'ob_warch.glb', 'ob_wcolumn.glb', 'sp_ast1.glb', 'sp_ast2.glb', 'sp_ast3.glb', 'sp_ast4.glb', 'sp_ast5.glb', 'sp_cloud.webp', 'sp_comet.glb', 'sp_gate.glb', 'sp_halo.glb', 'sp_hoop.glb', 'sp_isl1.glb', 'sp_isl2.glb', 'sp_isl3.glb', 'sp_isl4.glb', 'sp_palace.glb', 'sp_rbarch.glb', 'sp_rings.glb', 'sp_temple.glb', 'pl_earth.webp', 'pl_jupiter.webp', 'pl_mars.webp', 'pl_mercury.webp', 'pl_moon.webp', 'pl_neptune.webp', 'pl_saturn.webp', 'pl_sun.webp', 'pl_uranus.webp', 'pl_venus.webp', 'ha_angel.glb', 'ha_cloud.glb', 'ha_halogate.glb', 'ha_harp.glb', 'vo_00.mp3', 'vo_01.mp3', 'vo_02.mp3', 'vo_03.mp3', 'vo_04.mp3', 'vo_05.mp3', 'vo_06.mp3', 'vo_07.mp3', 'vo_08.mp3', 'vo_09.mp3', 'vo_10.mp3', 'vo_11.mp3', 'vo_12.mp3', 'vo_13.mp3', 'vo_14.mp3', 'vo_15.mp3', 'vo_16.mp3', 'vo_17.mp3', 'vo_18.mp3', 'vo_19.mp3', 'vo_20.mp3', 'vo_21.mp3', 'vo_22.mp3', 'vo_23.mp3', 'vo_24.mp3', 'vo_25.mp3', 'vo_26.mp3', 'vo_27.mp3', 'vo_28.mp3', 'vo_29.mp3', 'vo_30.mp3', 'vo_31.mp3', 'vo_32.mp3', 'vo_33.mp3', 'vo_34.mp3', 'vo_35.mp3', 'vo_36.mp3', 'vo_37.mp3', 'vo_38.mp3', 'vo_39.mp3', 'vo_40.mp3', 'vo_41.mp3', 'vo_42.mp3', 'vo_43.mp3', 'vo_44.mp3', 'vo_45.mp3', 'vo_46.mp3', 'vo_47.mp3', 'vo_48.mp3', 'vo_49.mp3', 'vo_50.mp3', 'vo_manifest.json', 'pt_autumn_c.webp', 'pt_autumn_n.webp', 'pt_spring_c.webp', 'pt_spring_n.webp', 'pt_winter_c.webp', 'pt_winter_n.webp', 'rp_fence.glb', 'rp_flowerbed.glb', 'rp_icerail.glb', 'rp_iciclelamp.glb', 'rp_pumpkins.glb', 'rp_sign.glb', 'rp_snowbank.glb', 'rp_stonelantern.glb', 'st_candy_bridge.glb', 'st_candy_castle.glb', 'st_candy_cupcake.glb', 'st_candy_donut.glb', 'st_candy_gate.glb', 'st_candy_gum.glb', 'st_candy_icecream.glb', 'st_candy_pop.glb', 'st_cl_candy.webp', 'st_cl_dream.webp', 'st_cl_rain.webp', 'st_cl_snow.webp', 'st_dream_bridge.glb', 'st_dream_cflower.glb', 'st_dream_chain.glb', 'st_dream_cottage.glb', 'st_dream_gate.glb', 'st_dream_island.glb', 'st_dream_lantern.glb', 'st_dream_moon.glb', 'st_dream_sflower.glb', 'st_rain_falls.glb', 'st_rain_flower.glb', 'st_rain_gate.glb', 'st_rain_island.glb', 'st_rain_jewel.glb', 'st_rain_leaves.glb', 'st_rain_monkey.glb', 'st_rain_mushroom.glb', 'st_rain_toucan.glb', 'st_rain_vine.glb', 'st_snow_crystal.glb', 'st_snow_gate.glb', 'st_snow_island.glb', 'st_snow_palace.glb', 'st_snow_penguin.glb', 'st_snow_pine.glb', 'st_snow_snowman.glb', 'st_snow_towers.glb'];

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
