# RP7D · Malezor Playtest: handoff for another AI / collaborator

RP7D is a third-person 3D slice of **Malezor (District I · Beastlands)** from *The AOV™ Saga · Rizing Power 7*, built with plain ES modules and Three.js 0.185.1. The full feature list, controls and tuning notes are in `README.md`; this file covers how the code fits together.

## Run it
- **No server:** open `dist/RP7D_Malezor_Playtest.html` in Chrome. It is one self-contained file with the code, CSS and every model and animation inside.
- **From source:** serve the project root (`python3 -m http.server 8000`) and open `/rp7d/`. Three.js loads from jsDelivr through the import map in `index.html`.
- **Rebuild the single file after any change:** `npm i esbuild three@0.185.1`, then `node tools/build_single_html.mjs`.

## Code map
| File | Owns |
|---|---|
| `game.js` | Bootstrap, input (keyboard, mouse and DualSense via the Gamepad API), main loop, weapon wheel, Zyphone Options/Dev, `window.__rp7d` debug hook |
| `rizer.js` | Player controller and all move logic (`COMBAT` and `TUNE` tables at the top) |
| `actor.js` | Animated character: named clip slots, locomotion blending, one-shots, lab preview |
| `anim-lib.js` | Clip library, FBX/GLB loading, **retargeting** (world-space deltas against matched rest poses), contact / take-off / touchdown detection, per-actor slot assignments |
| `anim-assignments.js` | Which clip fills which slot for each actor (`rizer`, `elzoran`, `seer`) |
| `assets/anims/library.js` | The list of animation files |
| `anim-lab.js` | The in-game Anim Lab (L) |
| `seers.js` / `zyrex.js` / `anciuxor.js` | Seer combat AI, wild Zyrex behaviour, and Anciuxor's classic sprite + flee/relocate loop |
| `astral.js` | Astral Blast bolts and R3 lock-on |
| `loot.js` | The chest, the Basic Sword, the inventory, and the sword on the rig |
| `zyphone.js` / `hud.js` | Zyphone menu (map, time, notes, Rizer, weapons, controls, options, dev) and on-screen HUD |
| `world-data.js` → `world.js` / `terrain.js` / `props.js` / `nature.js` / `sky.js` | District data and how it's built |

## Rules to keep
1. **The PS5 DualSense is the primary test controller.** Every feature ships with controller support, and the mapping is in `readPad()` in `game.js`. Current mapping:
   - Face buttons: ✕ jump / double jump / hold to fly · □ punch or sword · △ kick · ○ interact or Astral Blast
   - Shoulders: L1/R1 weapon wheel · L2 dodge roll · R2 run
   - Sticks: L3 crouch / auto-land · R3 lock-on · right-stick flick swaps lock target
   - Touchpad: Zyphone
2. **Animations are Mixamo FBX made on `assets/rizer/mixamo/Rizer_TPose_Rigged.fbx`.**
   - Add a file to `assets/anims/`, list it in `library.js`, and assign it in `anim-assignments.js`.
   - Clip ids look like `lib:rizer/File.fbx`.
   - Per-slot options: `inPlace`, `more` (random variants) and `yaw` (turn a clip that was authored facing the wrong way).
3. **Canon lives with the Creator.** Placeholders are marked in `README.md` under "Canon to confirm". Zyrex bonding is not designed yet: pressing ○ on a locked Zyrex only shows a message.
4. **Saved state** lives in the browser's localStorage under `rp7d.inventory.v1`, `rp7d.settings.v1` and `rp7d.animAssignments.*`.
5. **Anciuxor V0** uses the classic RP7B `anciuxor.png` / `anciuxor-fly.png` sprite sheets in a seeded-random encounter. Within 12 units he takes off, flies to another safe spot, and lands. This is the temporary RP7D visual; a 3D version and authored animation can be revisited later. RP7B's story gate says he stops fleeing only after all ten Gemlords are caught or have granted respect.
6. **Rizer 180° turn:** `assets/anims/rizer/TURN.FBX` is registered as a non-looping library clip and assigned only to Rizer's `turn` one-shot slot. A strong grounded stick reversal triggers it; the controller holds travel through the 0.83 s pivot, then faces the new direction. Anim Lab exposes the slot for preview/tuning.
7. **Astralift:** `assets/anims/rizer/Astralift.fbx` is assigned to Rizer. R3 can target Seers, Mori, Zyrex, or the closed chest; D-pad ↑ while locked plays Astralift, dealing 2 damage and immediately starting Blastback in place, then the `Standing Up.fbx` recovery. Enemies resume pursuit only after getting up; chests open. Coordinates copy only when clicking the position panel.
8. **Astralift hit / combat stance:** `blastback.fbx` is assigned to Seers and Mori for the Astralift hit reaction, with a modest knockback; `fightform.fbx` loops as Rizer's full-body stance only while locked onto an enemy, including during traversal. Normal idle and walk/run return whenever there is no enemy lock.

## Current world pass · 2026-09-26

`world-data.js` now treats RP7B as the Malezor placement skeleton. Canon placements use `RP7B.K = 2`; the irregular coast is queried in tile space and blocks movement at the void edge. Keep this file as the placement source of truth. The user confirmed retaining the Fallen Titan and Timber Crossing, and the north road ends at Rakoron's Cave foothill.

- Ten RP7B homes are static data; Crazy's House is flagged non-purchasable. The player begins at the south-facing door of his home.
- The wheel is north/highland, west/forest, east/wetland and south/open. Four measured zones name the outer areas; central is a 108-unit hub radius.
- The civic roads, four outer trails, river, ponds, paddocks and three district landmarks are placed from RP7B tile coordinates. South is the only outbound road.
- Seer and Mori routes are filtered against the 44-unit sanctuary and selected by RP7B radial density bands. Their initial paths are masked to land and dry ground.
- Fifteen roster entries are placed as current generic Wild Zyrex silhouettes, distributed among the four measured zones. Replace the shared placeholder model as species-specific art arrives.
- The Fanghall, Bloodscent Lodge and First Den register as gold Astralvision targets and display their canon line on interaction. The radio-tower, treehouse and Auraxion chest positions are sealed prop placeholders; they grant nothing.
- `props.js` includes procedural exteriors and rooftop/deck surfaces for flight landings. NPCs, quests, interiors, purchasable homes, rewards, and other districts are still out of scope.
- Rebuild the shareable playtest with `node tools/build_single_html.mjs` after source edits.

## UFO and real-time clock · 2026-09-26

The Aetherstride, Auraxion's faceted low-poly astral craft, is at the south wild site. E / ○ enters when prompted; left stick or WASD steers relative to camera yaw, and camera pitch climbs or dives like Rizer's flight. ✕ / Space rises, hold L2 / C to descend, R2 / Shift sustains faster flight (54 units/s), and □ / E exits. Circle fires a 4-damage laser at a locked Seer or Mori; without an enemy lock, it triggers a 1.35-second turbo at 112 units/s (2.4-second cooldown). The player model hides while piloting, normal combat inputs are unavailable, and Rizer is protected aboard. Free flight also suppresses punches, kicks, Astral Blast and Astralift.

The simulation clock advances by one in-game minute per real minute (`hour += realDt / 3600`); a complete day/night cycle takes 24 real hours. Time preset skips are shown and accepted only in Developer Mode. The presets remain for this development sandbox; a shipped live-event system should use the real-time clock.

## Soundtrack and interior camera · Claude, 2026-09-26

- `soundtrack.js` is now wired in `game.js`. It is created at boot and started by the Wake Up click. The Options menu has **Sound → Music (on/off)** and **Music volume** (steps of 5, 10, 16, 25, 40, 60, 80 and 100%), and **M** toggles music. The state is saved under `rp7d.soundtrack.v1`.
- The build copies the track to `dist/assets/audio/` beside the HTML; `--embed-audio` makes a self-contained file instead.
- `home-interior.js` fades interior meshes that block the camera's view of Rizer. It casts seven sight lines per frame (head, chest, hips, shoulders and hips on both sides) and swaps each blocking mesh to a cloned transparent material, then restores it once the mesh is clear. The Raycaster needs `.camera` set because the interior contains sprites. Mark a mesh `userData.noFade = true` to exempt it.

## Title screen, saves and HUD v2 · Claude, 2026-09-26

- **Title:** `#intro` is now the title screen, with the key art at `assets/ui/title.jpg`; the build inlines it as a data URI.
  - Buttons: `#enter` = NEW GAME and `#load-game` = LOAD GAME.
  - Navigation: keyboard handler plus a `titlePad` rAF gamepad poll (D-pad/stick + ✕) that runs only until `started`.
  - `refreshTitle()` runs at the end of `build()`. `beginPlay()` hides the title, locks the pointer and starts music.
  - A New Game reload uses `sessionStorage['rp7d.boot'] = 'new'` to skip the title.
- **Save:** `rp7d.save.v1 = { v, t, home, at:{x,y,z,facing}, hour, region }`. It's written every 5 s by `saveGame()`, and on `beforeunload` and on hide. `loadGame()` restores the hour and, if the save was outdoors, sets `homeReturn` and calls `leaveHomeInterior()`.
- **HUD v2:** `.hud-panel` is the shared frame; the panels are `.zhud` / `.rhud` / `.whud` / `.mhud`.
  - Meters are `.hud-meter` + `.hud-cells`: 10 cells, where the last cell's `--f` sets its partial fill.
  - `hud.js` exposes `setPartner()` and `setWallet(inventory)`.
  - The minimap canvas is rectangular now (`drawMini` uses width and height).
  - The coordinates button moved into the MHUD footer (`#coords`).
  - `ui-layout.js` uses the key `rp7d.uiLayout.v2` and the new selectors.

## Collision, wild packs, landing · Claude, 2026-09-27

- **Collision** (`massgrid.js`, used by `world.resolve`):
  - All visible static meshes under `structures` and `nature` block, not just the hand-placed colliders. Anything you add to those groups gets collision automatically.
  - Mark walk-through decor with `userData.noCollide = true`.
  - For a tall thing whose upper part should not block, set `userData.massHi = <metres above its origin>`.
  - Bushes are `userData.soft`: they block unless Rizer is crouched. Crouched inside a bush he is `rizer.hidden`, and `canSee` in seers.js respects it.
  - `resolve(p, rad, opts)` now takes `{ stealth }`.
- **Wild packs** (`WILD` in seers.js):
  - Seeded Seer handlers, each with a Mori pack (`g.pack`, `g.leader`, `g.squad`).
  - Totals are 5× / 20× the hand-placed patrols that spawn.
  - Placement skips `quarterAt(...) === 'core'` and the home sanctuary.
  - Distance LOD lives in `farStep()`.
- **Landing:** `landLock` now zeroes horizontal velocity. A flight touchdown without the big-landing clip plays `land` with a 0.4 s lock.
- **Title:** the HUD stays hidden until `#game.playing` (added in `beginPlay()`).

## SFX, chests, auto-walk, NPCs on hold · Claude, 2026-09-27
- **SFX:** `sfx.js` + `assets/audio/sfx/` (inlined by the build). Use `sfx.play(kind)` or `sfx.steps(mode)`; `SFX_FILES` lists the variants.
- **Chests:** `buildChest('common' | 'uncommon')`, all the same size. `createCommonChests()` places 44 wooden coin chests (1–100 coins).
  - Rizer's chest is the silver (uncommon) one.
  - The sealed quest chests are gone from world-data.js.
- **No slides:**
  - Use `rizer.walkTo(spot, face, then, { around })` for any interaction that needs Rizer at a spot.
  - `pickUp(target, onGrab, clip, { from, around })` auto-walks first.
  - The old lerp-slide in `pick` is removed.
- **NPCs on hold:** `npcs.js` is no longer imported, and `NPCS_ON_HOLD = true` in home-interior.js. Rebuild them on new canon meshes, not Rizer's.
- The build tool also inlines `assets/audio/sfx/*.mp3`.

## Mythic weapons, axe combo, swim stroke · Claude, 2026-09-27
- **Weapons:** `WEAPONS.sword` = Tearsword of Azurel and `WEAPONS.axe` = Jaded Axe of Emeralix, both mythic and tied to Gemlords.
  - `loot.all` holds the two silver weapon chests (`rizer-chest` and `emeralix-chest`). The axe chest's open flag is `inventory.chests['emeralix-chest']`.
  - `createHeldWeapons()` replaces `createHeldSword()`. It provides `place(actor, { sword, axe })`, `contact()` and `handGrip(actor, key)`.
- **Rizer:** `BLADES` in rizer.js lists the hand weapons. `rizer.handWeapon` is what's in hand.
  - `setWeapon` chains sheathe → draw when going blade to blade.
  - `COMBAT.axe` has `lead` / `tail` trims and `spin4` (the procedural 360 on stage 4, a stand-in because the axe 4 FBX duplicates axe 1).
- **Anim slots:** `axe`–`axe4` and `swimrun` were added in anim-lib.js and anim-assignments.js, and the FBX files are in assets/anims/rizer/.

## Performance, Armory, waist slot, walk loop · Claude, 2026-09-27
- **Performance:** never add a PointLight per prop. Use a pooled light (see `createChestLight` in loot.js). Enemies are culled against the camera frustum through `seerHooks.inView`.
- **Armory:** zyphone.js `renderArmory()` works from `inventory.wheel` (6 slots) and supports drag-and-drop plus pad/keys. game.js `syncWheel()` normalises the wheel and adds new finds.
- **Waist:** only one weapon is shown on the body — the drawn one, or `inventory.hip` when unarmed.
- **SFX beds:** `sfx.steps()` resumes each loop where it stopped, and the loop points skip silence at both ends.
