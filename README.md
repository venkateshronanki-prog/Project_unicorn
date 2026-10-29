# 🦋 Project Butterfly

A magical, high-fidelity 3D runner that runs **directly in the browser** (no install) and as a
**fullscreen Safari Web App** on iPhone and iPad. Fly as a butterfly-winged unicorn, dive into lakes and
become a mermaid, collect colour orbs that repaint your magic, and befriend **Lumi**, a baby companion who
follows you for a while, says goodbye, and leaves you a gift.

Built with free tools only: Three.js (WebGL 2), plain JavaScript modules, GitHub Pages and (optionally) Firebase.

---

## What's inside

| Feature | Details |
|---|---|
| **Controls** | Drag to steer · hold still / hold ⚡ button / Space to boost · keyboard · Bluetooth gamepad · optional tilt (gyro) |
| **Two forms** | Unicorn (air) ⇄ Mermaid (water). Entering a lake morphs you with a spiral of stars, shock-ring and flash; leaving morphs you back |
| **Colour system** | 6 colour orbs. Each pickup repaints your wings, mane, tail and the glowing runway, plays a pentatonic chime and tints the whole screen. 3 of the same colour = **Chroma Chain** bonus |
| **Lumi the baby** | Grab her star-egg (or she arrives after ~7 s). Follows for 28 s, pulls orbs toward you, says goodbye, then drifts off in stars leaving a gift of orbs |
| **World** | Streamed terrain, glossy runway, river/lake zones with shader water (sky reflections, sun glitter, caustics, shoreline foam), blossom trees, crystals, floating islands, rainbow gates, 5 level palettes (dawn → starlit reef) |
| **Look** | HDR bloom, cinematic colour grading, chromatic aberration & radial speed-blur on boost, soft shadows, reflections, film grain |
| **Performance** | Auto-quality: dynamically scales resolution, bloom, shadows, MSAA & particles to hold your frame rate (Low / Med / High / Ultra, or Auto) |
| **Audio** | 100 % procedural WebAudio (music + SFX) — no audio files, works offline |
| **Saves** | Username profiles, saved locally always; with Firebase they sync across devices and you can **Continue run** anywhere |
| **Offline** | Service worker caches everything — plays with no connection |
| **iOS polish** | Safe-areas, fullscreen PWA, no zoom/bounce, screen wake-lock, haptics (best-effort), gyro permission flow, iPad/landscape/portrait layouts |

---

## Project structure

```
index.html            ← the page (menus + HUD)
manifest.webmanifest  ← makes it installable (fullscreen)
sw.js                 ← offline cache (bump VERSION when you update)
css/style.css         ← all UI styling
icons/                ← app icons (iPhone home-screen icon etc.)
vendor/three.bundle.js← Three.js + post-processing, pre-built (works offline, no CDN)
js/
  config.js           ← ★ every tunable: speeds, colours, level palettes, water zones, Firebase config
  main.js             ← game loop, state machine, camera, scoring, UI wiring
  world.js            ← sky, terrain, runway, water, scenery, level palettes
  track.js            ← orbs, obstacles, rainbow gates, hearts, eggs, pattern generator
  player.js           ← unicorn + mermaid models, morphing, ribbons, tint
  companion.js        ← Lumi
  gfx.js              ← renderer, bloom/grade pipeline, adaptive quality
  fx.js               ← particles & water ripples
  audio.js / haptics.js / input.js / save.js / cloud.js / ui.js / geo.js / util.js
firestore.rules       ← paste into Firebase (Step 4)
tools/                ← optional: rebuild the vendor bundle to upgrade Three.js
```

---

## Step 1 — Try it on your computer (2 minutes)

You need any static web server. With Python (already on macOS/Linux; install from python.org on Windows):

```bash
cd project-butterfly
python3 -m http.server 8000
```

Open **http://localhost:8000** in Chrome/Safari. (Opening `index.html` by double-click will **not** work —
browsers block JavaScript modules from `file://`.)

**Test on your iPhone/iPad before publishing:** on the same Wi-Fi open `http://<your-computer-IP>:8000` in Safari.
(Offline mode / install need HTTPS, which Step 2 gives you for free.)

---

## Step 2 — Put it on GitHub (free hosting with HTTPS)

### 2a. Create the repository
1. Go to **github.com** and sign in (create a free account if needed).
2. Click **+** (top right) → **New repository**.
3. Name it `project-butterfly`, keep it **Public**, do **not** tick "Add a README". Click **Create repository**.

### 2b. Upload the files
**Easiest (no tools):**
1. On the new empty repository page click **uploading an existing file**.
2. Drag **the contents** of the `project-butterfly` folder (the files *inside* it: `index.html`, `css`, `js`, `vendor`, `icons`, …) into the page. Make sure `index.html` ends up at the top level of the repo, not inside an extra folder.
3. Scroll down → **Commit changes**.

> GitHub's web uploader handles folders when you drag them from a desktop file browser. If any folder is missed, use the command-line method below.

**Command line (recommended if you plan to keep updating):**
```bash
cd project-butterfly
git init
git add .
git commit -m "Project Butterfly v1"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/project-butterfly.git
git push -u origin main
```

### 2c. Turn on GitHub Pages
1. In your repo click **Settings** → **Pages** (left sidebar).
2. Under **Build and deployment → Source** choose **Deploy from a branch**.
3. Branch: **main**, folder: **/ (root)** → **Save**.
4. Wait ~1 minute. The page shows your link: `https://YOUR-USERNAME.github.io/project-butterfly/`

That link is your game. Share it with anyone.

---

## Step 3 — Install on iPhone / iPad (Safari Web App)

1. Open your GitHub Pages link in **Safari** (it must be Safari, not Chrome-iOS).
2. Tap the **Share** button (square with arrow) → **Add to Home Screen** → **Add**.
3. Launch **Butterfly** from the Home Screen: it opens fullscreen with no browser bars and works offline.
4. Tilt steering (optional): Settings → *Tilt steering* → allow "Motion & Orientation" when asked.

First launch needs internet to download the game once; after that it runs offline.

---

## Step 4 — Cloud saves & leaderboard with Firebase (optional, free tier)

Without this, the game still saves your progress **on each device** under your username.
With Firebase you can sign in with the same username + passcode on iPhone **and** iPad, see **Continue run**
appear instantly, and show a global **leaderboard**.

### 4a. Create a Firebase project
1. Go to **console.firebase.google.com** → **Add project** → name it `project-butterfly` → (Google Analytics: off is fine) → **Create**.

### 4b. Register the web app and copy the config
1. On the project home click the **`</>` Web** icon → nickname `butterfly-web` → **Register app** (skip Firebase Hosting).
2. Firebase shows a `firebaseConfig = { apiKey: ..., authDomain: ..., projectId: ..., ... }` block. **Copy those values.**
3. In your code open **`js/config.js`** and replace the line `export const FIREBASE_CONFIG = null;` with:
   ```js
   export const FIREBASE_CONFIG = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcdef"
   };
   ```
   (These keys are *meant* to be public in web apps. Your data is protected by the rules in 4d.)

### 4c. Turn on username sign-in
1. Firebase console → **Build → Authentication → Get started**.
2. **Sign-in method** tab → **Email/Password** → **Enable** → **Save**.
   (The game turns *username + passcode* into a private account behind the scenes — players never see an email.)

### 4d. Create the database and rules
1. **Build → Firestore Database → Create database** → pick a location near you → **Start in production mode** → **Create**.
2. Open the **Rules** tab, delete everything, paste the entire contents of **`firestore.rules`** from this project, click **Publish**.

### 4e. Allow your website
1. **Authentication → Settings → Authorized domains → Add domain** → `YOUR-USERNAME.github.io`.

### 4f. Publish the change
1. Commit & push `js/config.js` (or upload it again on GitHub).
2. **Bump the cache version** so devices fetch the new code: in `sw.js` change `const VERSION = 'bf-v1.0.0';` to `'bf-v1.0.1'`.
3. On your iPhone/iPad, open the game, tap **Change** on the menu → enter a username + passcode → **Create account**.
   On your other device use **Sign in** with the same details. Your best score, unlocked level and in-progress run follow you.

> Firestore has offline persistence turned on: play offline and your progress syncs when you're back online.

---

## Updating the game later

1. Edit files (most tweaks live in `js/config.js`).
2. Commit & push to GitHub — Pages redeploys in about a minute.
3. Bump `VERSION` in `sw.js` (e.g. `bf-v1.0.2`) so installed copies refresh. Fully close and re-open the app once to load it.

### Handy tweaks in `js/config.js`
| Want… | Change |
|---|---|
| Faster / slower game | `BASE_SPEED`, `SPEED_PER_LEVEL`, `MAX_SPEED`, `BOOST_MULT` |
| More / fewer lakes | `WATER_FIRST_AT`, `WATER_PERIOD`, `WATER_LENGTH` |
| Longer Lumi visit | `COMPANION_LIFETIME` |
| New colours | `COLORS` (add an entry; pickups & UI adapt automatically) |
| New levels / skies | `LEVELS` (sky top/mid/low, fog, sun, grass colours) |
| Longer levels | `LEVEL_LENGTH` |
| Force a quality level | `QUALITY` table, or Settings → Graphics in-game |

Debug helpers: open the browser console and use `__bf` (e.g. `__bf.startRun(0, {s: 440, hearts: 3})` jumps into the first lake).

---

## Controls

| Action | Touch | Desktop | Gamepad |
|---|---|---|---|
| Steer | Drag left/right | ← → or A D / mouse drag | Left stick / D-pad |
| Boost | Hold still · hold ⚡ | Space / Shift / ↑ / hold mouse still | A / R1 / R2 |
| Pause | ❚❚ button | Esc / P | Start |

---

## Troubleshooting

* **Blank page on GitHub Pages** — check the URL ends with your repo name and that `index.html` is at the repo root.
* **"WebGL 2 required"** — update iOS/Safari (iOS 15+). Turn off *Low Power Mode* for best performance.
* **No sound on iPhone** — tap the screen once (iOS requires a touch to start audio) and check the silent switch isn't muting Web Audio.
* **Old version still showing** — bump `VERSION` in `sw.js`, then force-quit the Home-Screen app and reopen it twice.
* **Choppy on an older phone** — Settings → Graphics → Low (or leave Auto; it adapts by itself).
* **Haptics on iPhone** — Safari has no vibration API; the game uses a Safari 17.4+ trick that works best in direct response to touches, so some in-game ticks may be silent. Android vibrates fully.
* **Sign-in says "operation not allowed"** — enable Email/Password in Authentication (Step 4c).

Licence: game code is yours to use and modify. Three.js is MIT-licensed (see `vendor/THREE_LICENSE.txt`).
