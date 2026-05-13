# AOV™ Saga · Viridian Expedition — Master Handoff

**Single source of truth. Replaces all prior handoffs.**
**Last updated:** May 12, 2026 — end of merged session (asset polish + polish-pass combat-input + pre-combat bug sweep)
**Paste this into a new chat to continue.**

---

## 1. What this is

The Creator is building **The AOV™ Saga**, a fantasy/sci-fi multimedia IP at `angelsofvices.com` (GitHub `angelsofvices/AOV-saga`, auto-deploys to Netlify on push). Workspace folder on his Mac: `/Users/mctherockstar/Desktop/AOV™  LLC./The AOV™ Saga/***UPDATE WEBSITE/`. The site has four playable prototypes:

| # | Title | File | Status |
|---|---|---|---|
| 01 | The Long Return | `return.html` | Playable (arcade dodger) |
| 02 | The Training Yard | `training.html` | Playable (1v1 TCG) |
| 03 | The Battlegrounds | `battlegrounds.html` | Playable (3v3 TCG) |
| **04** | **The Expedition** | `expedition.html` | **Playable — active build target** |

**The Expedition** is the active prototype: a 2D top-down RPG of the world Viridia. ~3,656 lines of HTML/CSS/JS, all inline. Two regions live (Central with town + 4 NPCs, North with snow tiles + nothing else yet). GBA-style controller chassis (`controller_main.png`, `controller_frame.png`) wraps a 7×7 viewport.

## 2. Naming locks (do not rename)

- **The Expedition** — Prototype 04, the Viridia open-world RPG (`expedition.html`).
- **Codex** — RESERVED for the future cards/stats page (`codex.html`). Not a feature of the Expedition. Don't repurpose this name.
- **Aetherstride** — the UFO terminal inside the Expedition.
- **Aethryx Expanse** — universe-level map from Aetherstride. Destinations: Viridia / Zyraxis / Origon.
- **Rizers** / **RZ badge** — playable characters; the on-screen badge shows the active one. Tie-in to Rizing Powers TCG.
- **SPC** — Special / Stamina pool. In-game resource. Distinct from the TCG card mechanic of the same name.

## 3. State of `expedition.html`

**3,656 lines, 163 KB. node --check green.** Below is everything that's wired and working in the current build.

### Shipped & working

- **Map**: 40×40 tiles. Viewport 7×7 (224×224 logical px). Camera centers on player + clamps + Math.round() snap (no shimmer).
- **Two regions**: Central (grass + town + 4 NPCs + UFO) and North (snow tiles, empty otherwise). Region hot-swap via `transitionRegion()`. NPCs gated by `region` field.
- **Player walk + fly + idle**:
  - Walk sheet `animation_walk_player.png` (4×4).
  - Fly sheet `animation_fly_player.png` (4×4) baked at 56×45 NEAREST. Slicer applies `keepCenterConnected` per frame at source res to suppress neighbor-frame wing-tip bleed (fixes UP-row clipping).
  - Idle sheet `animation_idle_player.png` — 4 poses × 4 micro-frames. Each pose plays 15s, halts on the final sleeping pose, micro-anim keeps Z-bobbing. Resets on movement input.
- **4 NPCs** (Central only): Voltyran (gold/forge, 42×40), Eurakeon (shadow/dragon, 84×80 = 2× Vol), Aurexion (cosmic, 45×63 = 1.4× player, bilinear bake + flood-fill chroma), Elzoran (sky/wind, 112×72 NEAREST, slicer applies `killNearWhiteSpeckles` + `keepCenterConnected`). Touch-cry interaction via `INTERACT_PAD=3`.
- **Procedural town** (Central): seeded RNG `TOWN_SEED=0x5a6e`, largest-first rejection sampling. 1 huge + 3 big + 6 med + 9 small houses (all 1.5× scaled). 28 trees (96×96, 3×3 tile collider footprint = 1 tile center).
- **UFO landmark** at tile (25,5) — `obj_ufo.png`, 224×60. Walk adjacent → "INTERACT · TAP ENTER/A" prompt → A opens **Aetherstride · UFO Terminal** modal.
- **Aetherstride modal**: Faction selector (8 slots — 4 wired Vol/Eur/Aur/Elz toggleable In Viridia / Docked, 4 locked placeholders) + Destinations stack (Viridia / Zyraxis / Origon).
- **Map modal** (Select): `obj_map.png` background. Player-head map marker generated at boot from walk-sheet DOWN row (face crop, gold-ring pulse). Cosmic-blue arrow-controlled cursor hidden until first arrow press.
- **Hub modal** (Menu): 2×3 grid with 6 icons — `icon-rizers`, `icon-codex`, `icon-astralpack`, `icon-profile`, `icon-save`, `icon-options`. All have art wired this session.
- **Pause modal** (Start): standard pause.
- **Modal nav**: arrow keys cycle focus on buttons (Hub/Pause/Aethryx) or move cursor (Map). Enter triggers focused button. Escape closes any. Same modal-trigger key toggles its modal closed.
- **Chassis fade on modal open**: when any modal opens, the controller chassis and the game canvas both fade to opacity 0 (0.18s) so the menu is on a clean surface. They restore on close.
- **Snow tile**: `assets/tile_snow.png` is wired in `ASSET_SPECS` as `snow:` with the same inner-crop (x=100, y=100, w=1054, h=1054) as grass. Procedural `makeIceTileCanvas` retained as a fallback that only runs if asset load fails.
- **Backup convention** (`backups/BACKUPS.md`): every push gets a snapshot folder + tarball in `backups/YYYY-MM-DD_HHMM_<label>/`. `backups/` is local-only, never pushed (add to `.gitignore`).

### Combat & input layer (Phase A — wired, code-correct, deployment playtest pending)

The whole input scheme was rewritten this session per `EXPEDITION_SPEC.md`. The old B-button tap/hold/double-tap classifier is gone; run mode is gone; movement is one speed.

Current bindings:

| Input | Action |
|---|---|
| D-pad / WASD / Arrows | Movement (one speed) |
| Drag finger across D-pad | Live turn (slide Up → Right → Down → Left without lifting) |
| **A** | Context: interact (UFO / region exit / close Aethryx) → else **Punch** |
| **B** | **Kick** |
| **L** alone (after 80ms grace) | Special 1 (TBD — currently `console.log` only) |
| **R** alone (after 80ms grace) | Special 2 (TBD — currently `console.log` only) |
| **L + R** tap (release < 300ms) | Fly toggle |
| **L + R** hold (> 300ms) | Ultimate (TBD — currently `console.log` only) |
| **Start** | Pause modal |
| **Select** | Map modal |
| **Menu** (center) | Hub modal |
| **X** / **Y** | Reserved (combat placeholders) |
| Tap RZ badge | Swap active character (NOT YET BUILT — no HUD layer) |
| **Menu** (double-tap) | Toggle HUD on/off (NOT YET BUILT) |

**Combo detection** (`pushCombatInput` → `combatChain`):
- **A→B** within 250ms → "AB combo" (effect TBD per spec)
- **A→B→A** within 250ms each gap → **Sword Swing**
- **B→A→B** within 250ms each gap → **Blaster Shot**

All combos currently console-log only. Animation rendering is Phase B.

**Input wiring details:**
- `applyHotzone(name, pressed)` is the single dispatch. Modal-open inputs are suppressed (world is paused).
- A is context-sensitive: closes Aethryx if open, else transitions region if at edge, else opens Aethryx if UFO adjacent, else `pushCombatInput('a')`.
- B always routes through `pushCombatInput('b')` on press.
- L / R route through `onLPress`/`onLRelease`/`onRPress`/`onRRelease` → 80ms grace state machine that disambiguates L-alone, R-alone, L+R-tap, L+R-hold.
- `pollLRHold()` polled from `update()` each frame to detect hold-past-threshold for Ult.
- Keyboard equivalents: `Shift` = B/Kick, `F` = fly toggle (single key, no L+R required on desktop).

### NOT yet built (Phase B+ from the spec)

- **Combat sprite slicer / rendering**. `assets/animation_combat_player.png` (1536×1024, 5 rows × 4 cols) is on disk. Phase B builds the slicer + render path. See `EXPEDITION_SPEC.md` Section 2 for grid specs.
- **HUD overlay**: health bar, SPC pool, Item slot, RZ badge, Weapon HUD. Phase D.
- **Specials / Ult effects**. Currently console-log only.
- **Health system**. Phase J.
- **Party / character swap**. Phase G.
- **Inventory modal**. Phase F.
- **Chests** (obj_chest1..4 already on disk). Phase I.
- **HUD toggle** (double-tap Menu hides HUD). Phase H.
- **`tile_path.png`** is on disk but not in `ASSET_SPECS` yet.

## 4. Architecture rules (don't break)

**Asset loading.** `ASSET_SPECS` table → `loadAllAssets()` bakes each PNG to an offscreen canvas at target size. `raw:true` skips baking (sheets are sliced separately). `crop:{x,y,w,h}` samples just that source region. `chroma:true` applies `chromaKeyWhite` after bake.

**Sprite sheet slicing.** Each character has a SHEET constant with `frameW`/`frameH`/`cols`/`rowBases`. Idle is the exception: its rows are POSES (not directions), so it uses `colsByRow` + array-of-arrays result.

**Two-stage slicing for fly sheets.** When a sheet has frame-edge bleed (player UP row, Elz UP/RIGHT rows), the slicer must:
1. Copy each frame to a SOURCE-RES work canvas.
2. Run chroma + `keepCenterConnected` at source resolution (bake-down would break thin pixel chains).
3. NEAREST-bake the cleaned source frame to display size.

**Chroma helpers.**
- `chromaKeyExteriorWhite(canvas, threshold)` — flood-fill from edges, kills near-white connected to canvas edge. Used for Aur (near-white armor would die under strict chroma) and Elz (label text + interior near-white).
- `chromaKeyWhite(canvas)` — strict per-pixel near-white kill. Default for clean white-BG sheets.
- `killNearWhiteSpeckles(canvas, threshold)` — strict pass that runs AFTER `chromaKeyExteriorWhite` to kill enclosed near-white islands the flood can't reach. Fixes the "smoke aura" Elz had on grass.
- `keepCenterConnected(canvas, seedX)` — 8-connected flood from bottom-center column. Zeros alpha on every opaque pixel not reachable from the player body. Run AT SOURCE RES, before bake-down.

**Bilinear bake.** Currently only Aur. Lesson learned this session: at ~4× downsample bilinear smears the pixel art. Prefer NEAREST + slightly larger dest size when sharpness matters. Elz was switched from 84×56 bilinear → 112×72 NEAREST and looks dramatically better.

**Collision.** `rectIntersect(a,b)` is the primitive. `playerFootbox(x,y)` returns a small bottom-aligned rect. `blocked(x,y)` checks foot-box vs map bounds, COLLIDERS, and active NPC body-boxes. NPC body-box scales with `npc.h / NPC_H`.

**Camera.** `updateCamera()` centers on player, clamps to world bounds, `Math.round()`-snaps to kill tile-edge shimmer.

**Y-sort rendering.** `drawWorld()` collects all sprites with `feetY` keys, sorts ascending, draws lowest-first.

**Modal system.** `modalState.current` tracks active modal name. `openModal` / `closeModal` / `toggleModal`. Open: adds `body.modal-open` class → chassis + canvas fade out via CSS. Close: removes class → both fade back in. Game loop skips `update`/`updateNPCs`/`updateInteractions`/`updateUfoAdjacency`/`updateCamera` while modal open; `render()` still runs so the (frozen) world stays visible at fade-in / fade-out boundaries.

**Region system.** `REGIONS = { central, north }`. `currentRegion` state. `MAP_DATA` and `COLLIDERS` are mutable refs swapped by `transitionRegion()`. NPCs check `(npc.region || 'central') !== currentRegion` to bail out of update/collision/draw/interact. Player x preserved across transitions; y re-anchors to opposite border.

**Input state machine.** `bState = { flyEnabled }` (just one flag now — old B-button machine deleted). `currentRunMode()` returns `'fly'` or `'walk'` (run gone). `lrState` handles L/R disambiguation with 80ms grace and 300ms hold threshold.

**Workspace conventions.**
- Workspace folder = deploy folder. Save final outputs there.
- Run `node --check` (Python wrapper that extracts inline `<script>` blocks) after every edit. Keep expedition.html green.
- Use `Edit` not `Write` for partial changes; preserve comments and structure.
- File tools (`Read`/`Edit`/`Grep`) may be blocked by `***` glob expansion in path — fall back to `mcp__workspace__bash` + Python text replace if needed.
- Probe new images with PIL+numpy first (measure bbox, frame positions, transparency) before writing slicer constants.
- **Take a backup snapshot before every push** — see `backups/BACKUPS.md`.

## 5. Key constants

```
TILE_SIZE = 32
MAP_WIDTH = MAP_HEIGHT = 40
VIEWPORT_TILES_W = VIEWPORT_TILES_H = 7    // 224×224 logical px viewport

CHAR_W = 32, CHAR_H = 45                    // player walk box
CHAR_W_FLY = 56, CHAR_H_FLY = 45            // player fly box (wings extend horizontally)
CHAR_W_IDLE = 40, CHAR_H_IDLE = 40          // idle pose canvas

NPC_W = 42, NPC_H = 40                      // Vol baseline
EUR_DISPLAY_W = 84, EUR_DISPLAY_H = 80      // 2× Vol
AUR_DISPLAY_W = 45, AUR_DISPLAY_H = 63      // 1.4× player
ELZ_DISPLAY_W = 112, ELZ_DISPLAY_H = 72     // ~4× original 60×40, NEAREST bake

TREE_W = TREE_H = 96                        // 1.5× from 64
UFO_W = 224, UFO_H = 60
UFO_TILE_X = 25, UFO_TILE_Y = 5

TOWN_SEED = 0x5a6e
FLY_SCALE = 2.25
COMBO_WINDOW_MS = 250
LR_GRACE_MS = 80
LR_HOLD_THRESHOLD = 300
IDLE_POSE_DURATION = 15, IDLE_ANIM_FPS = 4
INTERACT_PAD = 3
```

## 6. Asset inventory (`/assets/`)

```
animation_walk_player.png        walk sheet (4×4)
animation_fly_player.png         fly sheet (4×4) — slicer applies keepCenterConnected
animation_idle_player.png        idle sheet (4 poses × 4 micro-frames)
animation_walk_voltyran.png      Vol walk
animation_walk_eurakeon.png      Eur walk
animation_walk_aurexion.png      Aur walk (5 cols; uses first 4)
animation_fly_elzoran.png        Elz fly — speckle-kill + keepCenterConnected, 112×72 NEAREST
animation_combat_player.png      Combat sheet (5 rows × 4 cols) — NOT YET WIRED, Phase B
character_*.png                  Static portraits (mostly unused, kept as reference)
controller_main.png / _frame.png Chassis art (screen pre-chroma'd)
obj_tree.png                     96×96 visual, 1-tile collider
obj_ufo.png                      Content bbox crop applied
obj_map.png                      Viridia regional map (1122×1402)
obj_hill / mountain / volcano / house .png   NOT YET WIRED
obj_chest1..4.png                NOT YET WIRED (Phase I)
entry_smlhouse / medhouse / bighouse / hugehouse .png   wired
tile_grass.png                   32×32 base (inner-crop 100..1154)
tile_snow.png                    32×32 base (same inner-crop convention)
tile_path.png                    NOT YET WIRED
icons/rizers.png                 wired
icons/codex.png                  wired
icons/astralpack.png             wired
icons/profile.png                wired
icons/save.png                   wired (this session)
icons/options.png                wired (this session)
```

## 7. Locked decisions (don't relitigate)

- Map is **40×40 tiles**.
- Buildings + trees are at **1.5×** scale.
- Aurexion is **1.4× player**. Eurakeon is **2× Vol**. Elzoran is **112×72** NEAREST.
- Movement is **one speed** (run removed in Phase A combat rewrite).
- Fly is toggled by **L+R tap** (release < 300ms). L+R hold = Ult. Keyboard: `F`.
- A is **context-sensitive**: interact → else Punch. B is always **Kick**.
- Combo detection emits SWORD on `A→B→A`, BLASTER on `B→A→B`, AB-combo on `A→B` or `B→A`.
- Modal open → chassis + canvas fade out. Close → fade back.
- Aetherstride (UFO terminal) → Aethryx Expanse (the map). Destinations: Viridia / Zyraxis / Origon.
- Faction has 8 slots: 4 wired + 4 locked placeholders.
- North region currently has snow tile only (no NPCs/objects yet).
- **Prototype 04** title is **"The Expedition"**. Codex name reserved for the cards/stats page.

## 8. Open questions (from the combat spec)

See `EXPEDITION_SPEC.md` for the full design doc — it has open questions for every subsystem. Highlights:

- What does the standalone **A→B / B→A** 2-input combo DO that ABA/BAB don't?
- Which animations are **Special 1 (L)** and **Special 2 (R)**? (Blast / Sword / Blaster are candidates.)
- **Health**: max value, damage source pre-enemies, death state?
- **SPC**: what does the "3" on the HUD mean? Charges? Seconds? Regen rate?
- **Party**: 9 characters out of which 9 of the 42-card roster? Per-character state shared or independent?
- **Weapon HUD**: meaning of "applies to ammo/melee"?
- **Chests**: Wood / Silver / Gold loot tables?

## 9. Bug list (cleared this session)

- ✅ Elz "smoke" aura — caused by enclosed near-white speckles surviving flood-fill chroma. Fixed via `killNearWhiteSpeckles(work, 230)` post-flood.
- ✅ Player wing clipping on UP fly — adjacent-frame wing-tip bleed in source sheet. Fixed via `keepCenterConnected` at source res.
- ✅ Elz wing clipping on UP/RIGHT — same root cause; same fix applied to Elz slicer.
- ✅ Elz blurry — was 84×56 bilinear at ~4× downsample. Now 112×72 NEAREST.
- ✅ Snow tile wired (was procedural placeholder, now real asset).
- ✅ Prototype 04 marked Playable on `games.html`, linked to `/expedition.html`.
- ✅ Save / options hub icons wired (new PNGs on disk).
- ✅ `hz-b` and `hz-analog` hotzones re-aligned onto their visible button art.
- ✅ Chassis + canvas hide when any modal opens.
- ✅ Run-mode dead code fully removed (RUN_SHEET, RUN_WALK_ORDER, RUN_SCALE, runFrames, sliceRunSheet, runSheet asset, renderer branches, keyInput.run, joyInput.run). Saved ~80 lines + boot-time slicing.

## 10. Next-up priority (post-push)

1. **Verify the input layer on the deployed site**. The polish-pass session reported "B does nothing" on the preview-pane only — Section 4.1 of the deprecated polish handoff documented the preview is sandboxed and can't load assets. Once deployed, console-log `[combat] PUNCH` / `[combat] KICK` / `[combat] SWORD SWING (combo: A→B→A)` / etc. should appear when buttons are pressed. If they don't, investigate `applyHotzone` dispatch.
2. **Phase B — combat sprite slicer**. Probe `animation_combat_player.png` with PIL+numpy (the file is JPEG-encoded despite .png extension, no alpha — needs chroma cleanup). Left ~300px of each row is a text label, skip via start-x offset. Bake 5 frame sets × 4 frames each. See `EXPEDITION_SPEC.md` §2 for grid specs.
3. **Phase C — combat rendering**. Wire `player.combatAction` state. Render from combat sheet when active, lock facing, allow movement during animation.
4. **Phase D — HUD overlay**. Static for now: Health bar (10 segments + heart icon), SPC pool (lightning + "3"), Item HUD, RZ badge ("3/9"), Weapon HUD.
5. **Phase E+** — Specials → Inventory → Party → HUD toggle → Chests → Enemies/Damage.

Defer until later (not bugs, not blockers):
- Atmospheric animation (Fix 6 from old handoff — grass sway + particles, ~80 lines CSS).
- `tile_path.png` integration + hand-placed paths in town.
- North region content (assets pending).
- 4 additional faction NPCs (locked slots).
- Stub no-ops `syncB` / `maybeClearToggles` cleanup.

---

## Change log

- **2026-05-12 (session 3 / merged final):** Unified handoff. Combined asset polish (Elz smoke/wing/sharpness, snow tile, Prototype 04 playable on games.html) with polish-pass input rewrite (D-pad alignment, drag-to-turn, function swap, run-mode removal, Phase A combat input). Bug-fix pass shipped: save/options icons, hz-b + hz-analog alignment, chassis fade on modal, run-mode dead code purge.

