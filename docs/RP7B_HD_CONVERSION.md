# RP7B → RP7B 2DHD · Conversion Handoff

> **RP7B-HD IS NOT A REBUILD OF RP7B.**
>
> The existing RP7B is the authoritative game. Preserve its story, gameplay systems, progression, maps, characters, Zyrex, quests, encounters, animations, logic, and content wherever technically possible.
>
> Convert its existing sprites into polished 2DHD assets and translate its existing environments into three-dimensional spaces suitable for an elevated third-person camera.
>
> **Do not replace working systems merely because the presentation has changed.**
>
> The objective is to make the existing RP7B look and feel dramatically more modern while remaining fundamentally the same game.
>
> **Take RP7B. Give it depth. Give it HD presentation. Preserve RP7B.**

**Direction locked:** 2026-10-07 (Creator handoff, *AOV™ Mainline Games — Development Handoff*).
**Development order:** RP7B → RP7B 2DHD comes first. Aethryx Adventures: 1936 and RP7D get no major new updates until this conversion validates.
**Source build (frozen):** `rp7b.html` @ `AOV_BUILD.patch '0.99.54'`, commit `fe88163` on `main`. Every comparison in Phase 4 is against that build.

---

## 1 · Where the conversion stands

| Phase | What | Status |
|---|---|---|
| 1 · Preserve | Freeze the source build, document what exists | **Done.** Frozen at `fe88163` / v0.99.54. Inventory in §5 |
| 2 · Hybrid rendering foundation | 2DHD sprites, 3D environment, elevated third-person camera, sprite orientation, lighting, shadows | **Done, behind a toggle.** `rp7b-hd.js`, shipped in v0.99.55 |
| 3 · Malezor vertical slice | Malezor fully converted: modelled buildings, elevation, effects in 3D | **Next.** Work list in §4 |
| 4 · Validate | Old vs. HD, side by side | After Phase 3 · checklist in §6 |
| 5 · District conversion | The proven pipeline, district by district | — |
| 6 · HD polish | VFX, post-processing, wind, water shaders, transitions | — |
| 7 · Full regression | Beginning to end, nothing broken | — |

---

## 2 · How to play it

- **In game:** press **F7** to switch between 2DHD and classic. The choice persists (`localStorage rp7b_hd_v1`).
- **By URL:** `rp7b.html?hd=1` forces it on, `rp7b.html?hd=0` forces it off.
- **Default:** classic 2D. That stays the default until Phase 4 signs off.
- The overworld renders in 2DHD. Interiors, the title screen and Dreamland still render classic 2D (Phase 3 and 5 work).
- If the device has no WebGL, HD reports itself unavailable and the game stays classic.

Tuning without editing code: `RP7B_HD.cfg` (camera `pitchDeg` / `distance` / `fov`, sprite `lean`, fog, view distance). Cost per frame: `RP7B_HD.stats` (`worldMs`, `renderMs`, chunk / sprite / prop counts).

---

## 3 · How the foundation works, and why it can't drift from the game

`rp7b-hd.js` **owns no game logic.** It never moves an actor, decides a collision, starts a battle, fires a trigger or touches a save. `rp7b.html` still does all of that, unchanged. The HD layer only changes **where the paint lands**: it wraps the game's own draw functions, and when HD is on their output goes into a Three.js scene instead of onto the flat canvas.

| Layer | Source in rp7b.html | 2DHD treatment |
|---|---|---|
| **Ground** | `drawGrass`, `drawVeridanFreshwaterRiver`, `drawDistrictWorldBorders` | Baked into 16×8-tile chunks, laid on 3D ground meshes. Every coastline gets a rock skirt that drops to the Void Sea, so the land reads as a raised landmass |
| **Void Sea** | `VOID_OCEAN_FLOW` (the game's own 16-frame sheet) | Animated plane below the land |
| **Actors** (Rizer, NPCs, Zyrex, Skellors, boulders, the soul shell) | `drawPlayer`, `drawNPC`, `drawZyrexOrb`, `drawSkellorHurtFrame`, `drawBoulder`, `drawRizerSoulShell` | Each actor's **own draw call** is captured into a window and stood up as a camera-facing billboard at its foot tile. Every direction, walk/run/attack frame, hurt flash and jump arc is the game's own: nothing is re-implemented |
| **Props** (trees, houses, landmarks) | `WORLD_PROPS` (`img`, `bbox`, `tileW`, `subY`, `mirrorX`, `_animCells`) | Their own image as upright billboards with real depth and real shadows. The tower broken/fixed swap and the fountain's animation cells carry over |
| **World effects** (fae, gems, hit rings, projectiles, AOE, arrows) | Everything the game paints in world space after the world layer | Laid on the ground as a decal at the same tiles the game used |
| **UI** (menus, dialogue, battle overlays, HUD, minimap) | Unchanged | Stays on the 2D canvas, which now sits **transparent on top** of the 3D view |
| **Night** | `game.lightMode === 'night'` | 3D night lighting plus a lantern light on Rizer, in place of the 2D tint |
| **District air** | `districtAt()` | Sky and fog colour per district (Malezor blue, Zarvane sand, …) |

**Coordinates:** 1 tile = 1 world unit, the same contract as `docs/RP7D-HANDOFF-MALEZOR.md`. x is east, z is south (= tile row), y is up. A 3D thing that sits on a different tile from its 2D counterpart is a bug.

**Camera:** elevated third person, pitch 32°, distance 20, FOV 38, fixed yaw facing north. It is fixed on purpose, so that ↑ is still north and the tile-based movement, NPC facing and every directional sprite bank keep working untouched (handoff §8: the camera enhances the RPG, it doesn't turn it into RP7D).

**What the game still does inside the wrapped calls:** `drawWorldLayer` runs in full every HD frame. Wild-Zyrex grazing, fleeing and cull bookkeeping live inside it, so that behaviour is preserved by running the original rather than replacing it.

**Removed in HD because real depth makes them redundant:** the fake-Z tree-canopy pass, the painted prop shadows and the depth-camera blend. All three still run in classic.

---

## 4 · Phase 3 · the Malezor vertical slice, work list

The foundation proves the pipeline. The slice turns Malezor from "billboards in 3D" into "Malezor physically has depth." Every item is a **translation** of something that exists, not a redesign.

1. **Modelled buildings, Malezor first.** Replace the billboard for each Malezor building with geometry built from its existing sprite: same footprint tiles (from the ground-storey collision), same facade art as the front texture, a real roof volume. Order: the player's home → Malezor School → Town Hall → Hospital → Potion Shop → Zyrex Farm → The Fanghall → red-roof houses. Door tiles and entry triggers stay on the same tiles.
2. **Elevation.** The tile map has no height channel today. Add a per-tile height for Malezor only (highland/cave quarter, riverbanks), authored from the existing layout, and feed it into ground chunks, actor placement and the camera. Collision stays the tile grid.
3. **Effects in 3D.** Promote fae, gems and projectiles from the ground decal to billboards at their real height (fae float, gems pulse), and hit rings to ground rings under the target.
4. **Footprints** (Zarvane sand trail) as a ground decal layer. They are skipped in HD today.
5. **Interiors** in Malezor (home 1F/2F, school, lab) as 3D rooms built from the existing interior floor plans (`INTERIOR_SCALE` rungs). Interiors render classic until this lands.
6. **2DHD sprite pass, Malezor cast.** Higher-resolution redraws of Rizer, Mom, Dad, Zoryn, the Malezor NPCs and the Malezor wild pool. Same proportions, outfit, colours, silhouette and directional banks; the sheets drop into the same slots, so the capture pipeline picks them up with no code change.
7. **Transitions:** building entry/exit and district borders, with a short camera move in place of the 2D fade, landing on the same tiles.
8. **Save/load:** confirm a save made in HD loads in classic and vice versa. Nothing HD-specific is saved, so this should hold by construction. Verify it anyway.

---

## 5 · Phase 1 · the source build, inventoried

Facts read from the live v0.99.54 build. These are what Phase 4 compares against.

| System | Where it lives | Count / note |
|---|---|---|
| World grid | `MAP_COLS × MAP_ROWS` | 1020 × 800 tiles, `TILE` 48 px |
| Districts | `districtAt()`, `worldDistrictAt()` | Malezor, Zarvane, Andrannor, Veridan, Netharion, Vorashil, Xilnar, Baelgor, Thardin, Korathen |
| Props | `WORLD_PROPS` | ~17,200 at boot (incl. 2,619 trees, 4,404 bushes, 6,228 grass, 63 settlement homes) |
| NPCs | `NPCS` | ~1,350 at boot, plus the scattered district enemies |
| Wild Zyrex | `WILD_ZYREX` | ~180 overworld |
| Interiors | `interiorConfig()` / `INTERIOR_SCALE` | 21 interior scenes |
| Frame loop | `frame()` → `_frameBody()` | Guarded by `_step`, the deadman and the flight recorder |
| Draw order (overworld) | `_frameBody` | ocean → grass → river → borders → footprints → world layer → fae → effects → menus → dialogue → HUD |
| Collision | `walkable()` | terrain trio, then `_propBlocked`, boulders, NPC occupancy |
| Camera | `updateCamera()` / `_cam` | `locked` or `gba` (dead-zone + lerp + sway) |
| Story spine | `data/RP7_MAIN_STORY_CANON.md`, `data/RP7_STREAMLINED_STORY_PROGRESSION.md` | Authoritative, unchanged by this conversion |
| Roster | `data/RP7_MASTER_CODEX_POINTER.md` | Authoritative, unchanged by this conversion |

---

## 6 · Phase 4 · validation checklist (Malezor)

Play the same route in classic and in 2DHD and confirm each line:

- [ ] Same game: new game spawns in Rizer's Room, Mom → Zoryn → town map, in the same order
- [ ] Same progression: every Malezor progression lock opens at the same step
- [ ] Same content: every Malezor NPC, building, chest, fae and Zyrex present, on the same tiles
- [ ] Same encounters: wild Zyrex graze, flee, and start bonding and battles under the same conditions
- [ ] Same world: someone who knows RP7B says "this is Malezor," not "this is a Malezor"
- [ ] Better presentation: depth, lighting, shadows, distance, district atmosphere
- [ ] Saves cross over: HD save → classic load, and classic save → HD load
- [ ] Performance: 60 fps on the target machine with `RP7B_HD.stats.worldMs + renderMs` comfortably under budget

---

## 7 · Out of scope (handoff §15)

No story rewrite, combat rebuild, map redesign, sprite-to-model replacement, quest restructure, progression change, database rebuild or new gameplay systems. If the move to 3D forces a change, make the **smallest effective** one and record it here.
