# AOV™ Saga · Viridia Expedition — Session 3 Handoff

**Paste this into a new chat to continue without losing context.**

---

## What this is

The Creator is building **The AOV™ Saga**, a fantasy/sci-fi multimedia IP at `angelsofvices.com` (GitHub `angelsofvices/AOV-saga`, auto-deploys to Netlify on push). Workspace folder: `/Users/mctherockstar/Desktop/AOV™  LLC./The AOV™ Saga/***UPDATE WEBSITE/` — all final files live there.

`expedition.html` is the active prototype — a 2D top-down RPG of the world Viridia, now **live on the site** as **Prototype 04 · The Expedition** at `/expedition.html`. Three other games live in the same site: `return.html` (arcade dodger, Prototype 01), `training.html` (1v1 TCG, Prototype 02), `battlegrounds.html` (3v3 TCG, Prototype 03).

## Naming conventions (don't mix up)

- **The Expedition** — Prototype 04, the Viridia open-world exploration RPG (`expedition.html`).
- **Codex** — RESERVED for the future cards/stats page that will list every Rizer's full statline. Do **not** name the expedition prototype "Codex Awakening" — that name was retired this session.
- **Aetherstride** — the UFO terminal inside the expedition.
- **Aethryx Expanse** — the universe-level map opened from Aetherstride. Destinations: Viridia, Zyraxis, Origon.

## Current state of `expedition.html` (~3300 lines)

### Shipped this session (session 3)

- **Elzoran "smoke" fix.** It was never a smoke effect — the slicer's `chromaKeyExteriorWhite` only kills near-white pixels CONNECTED to a canvas edge, leaving ~90k enclosed near-white speckles between wings/around orbs that read as a swirling dust aura on grass. Added `killNearWhiteSpeckles(work, 230)` after the label-wipes in `sliceElzoranSheet`. Threshold 230 is safe — Elz palette has no pure white anywhere (blue body, orange wings, gold crest, green wing tips, red eyes, purple orbs, orange flame all sit well below that).
- **Player wing clipping on UP fly.** Adjacent UP-row frames overlap in source `animation_fly_player.png` — frame 2's crop window catches frame 3's left wing tip as a disconnected fragment after bake. Added `keepCenterConnected` helper: at source-res, seeds an 8-connected flood at the bottom-center column (player body) and zeros alpha on every opaque pixel not reachable. Applied to `sliceFlySheet` per frame BEFORE the NEAREST bake-down. Restructured the slicer to two stages (source-res chroma+flood, then bake) so connectivity is computed at full fidelity (45px dest would break thin pixel chains).
- **Elzoran sprite sharpness.** Was 84×56 baked with bilinear at ~4× downsample = blurry mess. Bumped to **112×72 with NEAREST**. Source aspect (~1.55) preserved. Updated `ELZ_DISPLAY_W/H` constants and switched `sliceElzoranSheet` from `imageSmoothingEnabled = true / quality = 'high'` to `imageSmoothingEnabled = false`.
- **Elzoran wing clipping (UP and RIGHT).** Same root cause as player — adjacent frames overlap. Wired `keepCenterConnected` into `sliceElzoranSheet` per frame: each frame is now copied to a per-frame source-res work canvas, flooded from center, then NEAREST-baked to 112×72. Wings on all four facings stay intact, neighbor-frame fragments dropped.
- **Snow tile wired.** `assets/tile_snow.png` (1254×1254) added to `ASSET_SPECS` as `snow:` with the same inner-crop convention as grass (x=100, y=100, w=1054, h=1054 — eliminates near-white edge AA gutter). North-region tile dispatch in `drawTiles` now uses `ASSETS.snow`. Procedural `makeIceTileCanvas` retained as a fallback that only runs if the asset fails to load.
- **Prototype 04 went live on `games.html`.** Card moved out of the "Forthcoming / In Development" section into "Available Now / Playable Prototypes". Wrapping element changed `<article>` → `<a href="/expedition.html">`. Status text "Forthcoming" → "Playable", class `forthcoming` → `live`. CTA reads "Begin the Expedition →". Card title is **"The Expedition"** (renamed from "Codex Awakening" — Codex name reserved). The empty Forthcoming section was deleted since Prototype 04 was its only card.
- **Backups folder.** Created `backups/` in workspace with `BACKUPS.md` documenting the convention. First snapshot lives at `backups/2026-05-12_1230_prototype-04-launch/` (folder + tarball). Convention: `YYYY-MM-DD_HHMM_<label>/` with both a directory and a `.tar.gz` sibling. **Take a snapshot before every push.**

### Helpers added this session

- `killNearWhiteSpeckles(canvas, threshold)` — strict per-pixel near-white kill, runs after the flood-fill exterior chroma to catch enclosed islands.
- `keepCenterConnected(canvas, seedX)` — 8-connected flood from the bottom-center column. Returns nothing — mutates canvas, zeroing alpha on every opaque pixel not reachable from the seed. Use it AT SOURCE RES, before bake-down.

### Helpers from earlier sessions, still in place but UNUSED

- `makeElzoranIdleFrames(flyFrames)` / `cloneCanvas(srcCanvas)` / `alphaOutMagenta(canvas)` — built for the (incorrect) "remove smoke when idle" idea before we figured out the speckles were the real cause. Left in place because they're harmless and might inspire a future per-pixel filter, but **NOT WIRED**. Safe to delete if cleaning up dead code.

## Asset inventory (in `/assets/`)

```
animation_walk_player.png      walk sheet (4×4)
animation_run_player.png       run sheet (4×4)
animation_fly_player.png       fly sheet (4×4) — slicer now applies keepCenterConnected
animation_idle_player.png      idle sheet (4 poses × 4 micro-frames)
animation_walk_voltyran.png    Vol walk
animation_walk_eurakeon.png    Eur walk
animation_walk_aurexion.png    Aur walk (5 frames/row; we use 4)
animation_fly_elzoran.png      Elz fly — slicer now applies speckle-kill + keepCenterConnected, bakes at 112×72 NEAREST
character_player.png           player static (unused)
character_voltyran.png         Vol static (unused)
character_eurakeon.png         Eur static (unused)
character_aurexion.png         Aur static (unused)
character_elzoran.png          Elz static (unused but kept — used as the resolution reference for the sharpness bump)
controller_main.png            chassis art (screen-area alpha=0)
controller_frame.png           = main.png (CSS background)
obj_tree.png                   tree, 96×96 visual, 1-tile trunk collider
obj_ufo.png                    UFO landmark, content bbox (15,369,996,269), 224×60 display
obj_map.png                    Viridia regional map (1122×1402, 4:5 portrait)
obj_hill.png, obj_mountain.png, obj_volcano.png, obj_house.png   — NOT YET WIRED
obj_chest1.png .. obj_chest4.png   — NOT YET WIRED
entry_smlhouse.png             3-tile visual base, 1.5× → 144×144
entry_medhouse.png             4-tile, 1.5× → 192×192
entry_bighouse.png             5-tile, 1.5× → 240×240 (needs chroma — white BG)
entry_hugehouse.png            8×6 tile, 1.5× → 384×288 (has alpha)
tile_grass.png                 32×32 base grass (inner-crop 100..1154 of 1254×1254 source)
tile_snow.png                  32×32 base snow — North region (same inner-crop convention as grass)
tile_path.png                  NOT YET WIRED
icons/rizers.png               wired
icons/codex.png                wired (the icon; the page itself is forthcoming)
icons/astralpack.png           wired
icons/profile.png              wired
icons/save.png                 NOT YET in folder
icons/options.png              NOT YET in folder
```

## Architecture patterns (don't break)

**Asset loading.** `ASSET_SPECS` table → `loadAllAssets()` bakes each PNG to an offscreen canvas at target size. `raw:true` skips baking (sprite sheets get sliced after). `crop:{x,y,w,h}` samples only that source region. `chroma:true` applies `chromaKeyWhite` after bake (white-BG PNGs).

**Sprite sheet slicing.** Each character has a SHEET constant (`SHEET`, `VOLTYRAN_SHEET`, `EURAKEON_SHEET`, `RUN_SHEET`, `FLY_SHEET`, `IDLE_SHEET`, `AUREXION_SHEET`, `ELZORAN_FLY_SHEET`) with frameW/frameH/cols/rowBases. Slicers iterate, crop, `chromaKeyWhite()`, push into `{up,left,right,down}` arrays. Idle is different — its rows are POSES (not directions), so it uses `colsByRow` (per-row) + an array-of-arrays result.

**Two-stage slicing for fly sheets.** When a sheet has frame-edge bleed (player UP, Elz UP/RIGHT), the slicer must:
1. Copy the frame to a SOURCE-RES work canvas first.
2. Run chroma + `keepCenterConnected` at source resolution (bake-down would break thin pixel chains).
3. NEAREST-bake the cleaned source frame to display size.

**Flood-fill chroma.** `chromaKeyExteriorWhite(canvas, threshold)` does DFS flood from canvas edges marking near-white pixels as alpha=0. Used for Aur (near-white armor would be killed by strict chroma) and Elzoran (whose sheet has inter-row label text + interior near-white speckles). Helper `chromaKeyWhite(canvas)` is the strict per-pixel version. Helper `killNearWhiteSpeckles(canvas, threshold)` is the strict pass that runs AFTER `chromaKeyExteriorWhite` to kill enclosed near-white islands the flood can't reach (the cause of Elz's "smoke aura").

**Bilinear bake — DEPRECATED.** Aur still uses bilinear bake. Elz used to and looked blurry; switched to NEAREST at 112×72 this session. The lesson: at ~4× downsample bilinear is fuzzy garbage. Prefer NEAREST + slightly larger dest size when sharpness matters. If a future character looks blurry, check the smoothing flag first.

**Collision.** `rectIntersect(a,b)` is the primitive. Player `playerFootbox(x,y)` returns a small bottom-aligned rect. `blocked(x,y)` checks foot-box vs map bounds, COLLIDERS, and active NPC body-boxes. NPCs use `npcBodyBox(npc)` / `npcBodyBoxAt(npc,x,y)` / `npcBlocked(npc,x,y)`. Body-box scales with `npc.h / NPC_H` so the bigger NPCs still have a feet-only collision box.

**Camera.** `updateCamera()` centers viewport on player, clamps to world bounds, `Math.round()`-snapped to eliminate tile-edge shimmer.

**Y-sort rendering.** `drawWorld()` collects all sprites (trees, houses, UFO, NPCs, player) with `feetY` keys, sorts ascending, draws lowest-first.

**Modal system.** `modalState.current` tracks active modal name. `openModal/closeModal/toggleModal`. Game loop skips `update`/`updateNPCs`/`updateInteractions`/`updateUfoAdjacency`/`updateCamera` when modal open (render still runs so the world stays drawn behind pause).

**Region system.** `REGIONS = { central, north }`. `currentRegion` state. `MAP_DATA` and `COLLIDERS` are mutable refs swapped by `transitionRegion()`. NPCs check `(npc.region || 'central') !== currentRegion` to bail. Player x preserved across transitions; y re-anchors to opposite border.

**B state machine.** `bState` has both transient (`pressedAt`, `lastTapAt`, `anyDown`) and sustained (`runEnabled`, `flyEnabled`, `movedSinceToggle`) fields. Hold = live run. Tap = sustain run. Double-tap = sustain fly.

**Conventions.**
- Workspace folder is the deploy folder. Save all final outputs there.
- Always run `node --check` (via the Python wrapper) on inline JS after edits.
- Use `Edit` not `Write` for partial changes; preserve existing comments + structure. (When the workspace path has `***` in it, Edit/Read can be blocked by glob expansion — fall back to bash + Python `replace`.)
- When user uploads a new image, probe with PIL+numpy first to measure bbox/dimensions before writing slicer constants.
- **Take a backup snapshot before every push to GitHub.** See `backups/BACKUPS.md`.
- Don't over-explain in chat. The user is fast and wants iteration.

## Key constants (most-touched)

```
TILE_SIZE = 32
MAP_WIDTH = MAP_HEIGHT = 40
VIEWPORT_TILES_W = VIEWPORT_TILES_H = 7
CHAR_W = 32, CHAR_H = 45                  (player walk box)
CHAR_W_FLY = 56, CHAR_H_FLY = 45          (player fly box)
NPC_W = 42, NPC_H = 40                    (Vol baseline)
EUR_DISPLAY_W = 84, EUR_DISPLAY_H = 80    (Eur 2×)
AUR_DISPLAY_W = 45, AUR_DISPLAY_H = 63    (1.4× player)
ELZ_DISPLAY_W = 112, ELZ_DISPLAY_H = 72   (4× original 60×40, NEAREST bake)
TREE_W = TREE_H = 96                      (1.5× from 64)
UFO_W = 224, UFO_H = 60
UFO_TILE_X = 25, UFO_TILE_Y = 5
HOUSE_TYPES['house-sml/med/big/huge']     (1.5× scaled)
TOWN_SEED = 0x5a6e
RUN_SCALE = 1.5, FLY_SCALE = 2.25
TAP_MAX_MS = 240, DOUBLE_TAP_WINDOW = 380
IDLE_POSE_DURATION = 15, IDLE_ANIM_FPS = 4
INTERACT_PAD = 3                          (NPC touch tolerance)
```

## Recent decisions (don't re-litigate)

- Map is **40×40 tiles**.
- Buildings + trees are at **1.5× scale**.
- Aurexion is **1.4× player**. Eur is **2× Vol**. Elzoran is **112×72** (4× original).
- Run/fly is hybrid hold+toggle. Hold=run, tap=sustain run, double-tap=sustain fly.
- A/Enter same key toggles its modal (Aetherstride). Y/X/M same.
- Map marker = player head crop, NOT a gold dot.
- Map cursor (blue crosshair) HIDDEN until first arrow keypress.
- UFO menu = **Aetherstride · UFO Terminal** → **The Aethryx Expanse** (the map name). Destinations: Viridia/Zyraxis/Origon (Aethryx is the expanse).
- Faction has 8 slots, 4 wired (Vol/Eur/Aur/Elz) + 4 locked. Toggle each between **In Viridia** and **Docked**.
- North region has snow tile (real asset wired) + zero objects/NPCs yet.
- **Prototype 04 is "The Expedition"**, not "Codex Awakening". Codex naming reserved for the future cards/stats page.

## Open questions / things the user is still working on

- **Locked hub icons**: save.png, options.png — user is designing.
- **Locked Faction slots**: 4 future NPCs.
- **Locked destinations**: Zyraxis, Origon (their own region builds).
- **North region content**: zero objects/NPCs. Just snow tiles. Future: ice-themed obj_* assets, ice NPCs. Add to `REGIONS.north.objects` and tag NPCs with `region:'north'`.
- **Aur 5th frame**: unused, currently cycle uses first 4.
- **Profile / Codex / Astralpack / Rizers icons**: wired into hub but tapping them doesn't open sub-modals yet.
- **Codex page itself**: forthcoming. Will be the "all cards & stats" page. Has nothing to do with the expedition prototype.

## Workflow tips

When the user sends a new image, **first analyze it with Python/PIL** to measure dimensions, transparency, bbox of content, distinct frame positions, etc., before making code changes.

When changing sprite-sheet calibration, **dump the sliced frames to `outputs/probe/` (or similar) and `Read` a few visually** to verify before claiming a fix.

Run `node --check` (via the Python wrapper) on every edit. Keep `expedition.html` green.

**Before any push to GitHub**: snapshot to `backups/YYYY-MM-DD_HHMM_<label>/` per `backups/BACKUPS.md`. The user has lost sessions before — backups are non-negotiable.

If `Read`/`Edit`/`Grep` get blocked because of `***` in the path, fall back to `mcp__workspace__bash` + Python text replace. The `***` is a glob wildcard for the file tools.

---

**Last shipped:** Elz smoke fix (speckle-kill) + player wing clipping fix (keepCenterConnected) + Elz sharpness (112×72 NEAREST) + Elz wing clipping fix (UP/RIGHT via keepCenterConnected) + snow tile wired + Prototype 04 "The Expedition" live on games.html + backups folder convention.

**Next up (in priority order):**
1. Build ice-region content (NPCs/objects) when assets land
2. Build out remaining 4 faction NPCs
3. Wire save/options hub icons when assets land
4. Wire chest objects (obj_chest1..4) as interactables
5. Add tile_path.png and hand-place paths in town
6. Build the actual `/codex.html` cards-and-stats page (separate from expedition)
