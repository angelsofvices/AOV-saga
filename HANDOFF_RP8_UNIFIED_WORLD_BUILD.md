# RP8 — UNIFIED WORLD MAP BUILD HANDOFF

**Purpose.** Turn Rizing Powers of Zyraxis from a district-hop game (RP7 · rizers.html) into a seamless open-world experience (RP8 · rp8.html) while preserving every content/canon/mechanic decision. This document is the multi-session build plan.

**Version anchor.** RP8 forks from RP7 at rizers.html V3.17.63. All canon locked in RP7 memory files applies unchanged to RP8.

---

## Ground rules

1. **Zero regressions to RP7.** rizers.html is frozen. No more architecture changes there. Every RP7 patch is stable and shipped.
2. **Same content everywhere.** RP8 uses the same species roster, moves, statuses, allies, quests, dresser, HUD system, Kelthor / Myara / Anciuxor / Vengrizz / Xenoxil beats, Novarian canon, Astralite Matrix, etc. Only the map architecture diverges.
3. **Fork, don't merge.** RP7 → RP8 was a full file copy. RP7 stays as-is; RP8 evolves independently. When new content canon lands, decide per-patch whether to backport it to RP7 or lock it as RP8-only.

---

## Current state (Phases 1 – 7 complete · unified world is DEFAULT · ready for playtest)

### Phase 1 · file fork (DONE)
- `rp8.html` created as a full copy of `rizers.html` (19,935 lines)
- Runs identical to RP7 in every way

### Phase 2 · world layout foundation (DONE)
Added to rp8.html right after `DISTRICT_ORDER`:
- **`ZYRAXIS_WORLD` constant** — world grid (300×400) + 15 region rectangles (10 districts + Wild March + Green Divide + Bridge of Hope + 3 Part 2 zones)
- **`getRegionAt(x, y)`** — rectangular-contains region lookup; returns region record or `wilds` sentinel
- **`getRegionDistrictMeta(x, y)`** — convenience wrapper for district-region palette lookup

Both are ADDITIVE — no existing code paths use them yet. RP8 still runs identical to RP7.

### Phase 3 · unified world MAP generator (DONE)
- **`generateZyraxisWorld()`** — 350×370 char-grid; stamps each district's existing MAP data at its region offset (Malezor via hand-crafted `MALEZOR_MAP`; districts II–X via `generateDistrictMap`); sprinkles 8% gemgrass in Wild March + Green Divide interstitials for wild encounters.
- **`registerZyraxisWorld()`** — hoisted function; called at the tail of the route-registration loop (line ~8722) so MAPS is already initialized. Registers `MAPS['zyraxis_world'] = { data, cols: 350, rows: 370, label: 'Zyraxis · The Ninth World' }`.
- Districts + routes still register as before — the unified world is an ADDITIONAL entry in MAPS. Phases 5-6 will migrate the default entry point.

### Phase 4 · systems rewired to use `getRegionAt(x, y)` (DONE)
- **`drawTile`** — when `mapId === 'zyraxis_world'`, palette resolves per-tile via `DISTRICT_META[getRegionAt(mx, my).id]`. Interstitials + Bridge + Part 2 fall through to the ambient purple fallback until Phase 7 content polish paints them.
- **`districtAllowedTypes`** — when on world map, resolves player region; district → district's own+neighbors+fold-ins; interstitial → blended union of border-district types; else empty.
- **`districtWildPool`** — same routing. Interstitials get a hybrid pool (all border districts' species) with softened mid-band levels.
- **`hudLabelFor`** — world map returns `<DistrictName> · <Land>` for district regions, region name for interstitials/Bridge/Part 2.
- **`getPlayerDistrict`** — world map returns `region.id` if kind==='district', else 'malezor' fallback.
- **F8 dev toggle** — press F8 anywhere in the overworld to jump into `mapId='zyraxis_world'` at Malezor's world-coord center (or press again to return to the classic Malezor district). Phase 6 flipped `game.player.preferWorldMap` on toggle so subsequent boots reload into world mode.

### Phase 5 · portals removed + seam crossing (DONE)
- **World grid post-process** — `generateZyraxisWorld()` now strips every `<` / `>` portal tile from the stamped districts and PUNCHES a 3-tile-tall opening through the neighbor's `# T W M` wall segment. Seams are physically walkable.
- **`tryMove` portal handler** — skipped when `mapId === 'zyraxis_world'`; the player walks THROUGH the portal-position tile as ground.
- **Seam-crossing toast** — after any successful step, if `getRegionAt(prevX, prevY).id !== getRegionAt(nowX, nowY).id`, a `◈ NOW ENTERING · X` toast fires and `updateHUD()` refreshes the location badge.
- **`travelDistrict` guard** — belt-and-suspenders no-op if called on world map (e.g. from a legacy script path).
- **Group-unlock gates + Bridge of Hope** — DEFERRED. Currently every region is walkable on world map (open sandbox). Phase 5b will re-add invisible seam-walls at Ministry watchpost coordinates + a Bridge-of-Hope sentinel that blocks Part 2 until the endgame flag.

### Phase 6 · interior door exits + save-state migration (DONE)
- **`interiorFromContext(doorX, doorY, label)`** — new helper called at every `enteredInteriorFrom = { ... }` write site. On classic maps returns `{map: currentMap, districtId: currentMap, x, y, label}`. On world map returns `{map: 'zyraxis_world', districtId: <region.id>, x, y, worldX, worldY, label}` so interior lookups keyed by district id (TOWN_HALLS, SEER_COMMANDERS, DISTRICT_LODGES) still resolve correctly, AND the exit path restores the player to the exact world tile they came from.
- **Town Hall district resolver** — the hall lookup now uses `getRegionAt(doorX, doorY).id` when the player is on world map so the correct district's hall opens.
- **Save-load migration** — three cases handled:
  - (a) Save on `zyraxis_world` but world not registered → resolve current world region to district id + translate world coords → district-local coords → load into district.
  - (b) Save on `zyraxis_world` with out-of-bounds coords → snap back to Malezor world spawn.
  - (c) Save on a legacy district mapId with `preferWorldMap === true` → auto-translate district-local coords → world coords + switch to `zyraxis_world`.

---

### Phase 5b · group-unlock gates + Bridge of Hope sentinel (DONE)
- **Ministry watchpost gate** — every seam-crossing INTO a district in a locked DISTRICT_GROUPS group is intercepted BEFORE the move applies. Player sees the classic dialog naming which districts' Seer Commanders they still need to bring down. Dev mode bypasses per existing `groupUnlocked()` convention.
- **Bridge of Hope + Part 2 sentinel** — attempting to cross into `bridge_of_hope`, `old_conquest`, `new_conquest`, or `pit_of_no_return` regions before `game.player.xenoxilDefeated === true` triggers a sentinel dialog: "Walk both paths. Earn your passage." Dev mode bypasses.
- Both gates are implemented in `tryMove` alongside the seam-toast; the block-then-toast ordering ensures no false "NOW ENTERING X" fires when the player is bounced back.

### Unified world default (2026-07-17 SHIP)
- `exitHouseToMalezor` spawns onto `mapId='zyraxis_world'` at Malezor's world-coord offset. First-time players walk out of home directly into the world.
- Save-load auto-migration translates any legacy district mapId to `zyraxis_world` at the equivalent offset unless `game.player.classicMapMode === true`.
- `exitInteriorTo` translates classic-district exit targets to world coords when world is registered.
- **F8** is the CLASSIC ESCAPE HATCH — flips `classicMapMode` and persists across reloads. Press again to return to the world.

---

### Phase 7 · content polish (DONE · playtest-ready baseline)

- **Interstitial + Part 2 wild pools** — `districtWildPool` + `districtAllowedTypes` now cover `wild_march` / `green_divide` (blended adjacent-district pools, softened level bands) and `old_conquest` / `new_conquest` / `pit_of_no_return` (custom type-set pools at Lv 88-96 / 92-100 / 96-100). `bridge_of_hope` = no wild encounters.
- **Content-painter pass in `generateZyraxisWorld`** stamps deterministic chest / grunt / landmark / region-NPC tiles across all six non-district regions.
- **New `n` REGION NPC tile** — full pipeline: collision-blocker, sprite render (color-shifted per region kind), tryInteract dispatch. `REGION_NPCS` table keys 12 named NPCs by "x,y" world coords with unique dialogue + one-time coin/item rewards. Includes the 4-NPC Bridge of Hope farewell (Mom · Dad · Kelthor · Myara), Wandering Merchant in the Wild March, Journalist in the Green Divide, Lorekeeper in the Old Conquest, Emissary in the New Conquest, and the Voice in the Pit teasing the Ultimate Prismsynch communion.
- **Region-specific palette tints** in `drawTile` — Wild March (dusty), Green Divide (verdant), Bridge (ceremonial gold), Old Conquest (pre-Accord slate), New Conquest (Seer purple), Pit of No Return (molten red).
- **Denser Part 2 gemgrass** — Part 2 zones get a 16% sprinkle instead of 8% for encounter density appropriate to endgame level bands.

---

## What's playtest-ready NOW

1. New game → home_interior → step out via 'x' door → spawns onto `zyraxis_world` at Malezor.
2. Walk east through Malezor → cross into Zarvane (seam-toast fires, HUD updates, palette shifts).
3. Ministry watchpost dialogs block cross-group travel until group's Seer Commanders are down.
4. All 6 non-district regions have chests, grunts, landmarks, region NPCs.
5. Bridge of Hope + Part 2 zones sealed until `xenoxilDefeated` flag fires.
6. Interior doors work bidirectionally (world coords preserved on exit).
7. Save/load auto-migrates old district saves to world coords.
8. F8 escape hatch flips classic-district mode + persists across reload.

## Known playtest surface (expect user feedback patches)

- Grunt chain-size on world map defaults to `chainSize = 1` because the DIST array doesn't include `zyraxis_world`. Grunts in interstitials + Part 2 may feel undersized. Fix: when `poolDistrict === 'zyraxis_world'`, derive `num` from the current region's parent district or hardcode a chainSize by region kind.
- Interstitial + Part 2 palettes don't have full DISTRICT_META shape (only wall/edge/ground). Landmark colors may fall back to defaults for other palette keys (e.g. ROOF, TRIM). Add more keys per region as visual polish lands.
- No Bridge farewell TRIGGERING beat (currently the 4 NPCs are just there — no "on first crossing" cutscene).  Add a scripted first-crossing scene when the endgame flag fires.
- Group-unlock seam-walls block movement but there's no visible sentinel NPC to explain WHY.  Consider adding physical `n` NPCs at group boundaries as visual watchposts.
- No region-exclusive rare Zyrex spawns yet.  Each region uses generic blended/type-filtered pools.

---

## Phase 8 · Novarian Challenge playable slice (LATER)

Replace the ~35 separate MAP arrays with ONE unified 300×400 grid.

### Steps
1. Create `generateZyraxisWorld()` function that returns a single 300×400 char-string array
2. For each region in `ZYRAXIS_WORLD.regions`:
   - **Districts** — reuse the existing `generateDistrictMap(mapId)` procedural output but stamp into the world grid at that region's `(x1, y1)` offset
   - **Malezor** — stamp the hand-crafted `MALEZOR_MAP` at (5, 5)
   - **Interstitials** — new procedural: mostly wild ground + scattered gemgrass + a landmark or two + optional NPCs
   - **Bridge of Hope** — new procedural: narrow corridor of stone tiles connecting Baelgor's south seam to the Old Conquest's north seam; sentinel gate at both ends (gated by `endgame` flag)
   - **Part 2 zones** — new procedural: ruined-terrain aesthetic (Old Conquest ruins tile, New Conquest darker ruins, Pit of No Return molten tiles); all locked behind endgame flag
3. Fill inter-region borderlands with walkable path tiles + occasional impassable terrain (creates natural "route" feel without formal route maps)
4. Preserve seam connectivity: every district's east/south edge must have a walkable path continuous to its neighbor's west/north edge
5. Stamp ROUTE landmarks (Gemlord Caves, route decor) at their equivalent world positions instead of separate route maps
6. Register the world as `MAPS['zyraxis_world']` — the single active map for the base game

### Success criteria
- Player can walk from Malezor's east edge across into Zarvane without a portal
- Each district's shape and internal features (town hall, Seer HQ, landmark, chests) are preserved at their world coord positions
- Wild March and Green Divide are walkable but empty (content polish in later phase)
- Bridge of Hope + Part 2 zones exist but are gated (can't cross bridge until endgame flag)

---

## Phase 4 · Rewire systems to use `getRegionAt(x, y)` (~2-3h)

Every system currently keyed by `game.player.mapId === 'malezor'` etc. needs to switch to region-detection based on player world coords.

### Systems to rewire
1. **Palette lookup in `drawTile`** — currently `DISTRICT_META[game.player.mapId]`. Change to `getRegionDistrictMeta(mx, my)` per-tile so district colors render correctly across their world regions.
2. **Wild pool + type filter** (`districtWildPool` + `districtAllowedTypes`) — currently take `mapId`. Change to accept `(x, y)` or `regionId`. Wild encounters fire based on the player's current world region.
3. **HUD label** (`hudLabelFor` + `setHudLocation`) — currently returns per-map label. Change to look up region at player world coords.
4. **`getPlayerDistrict()`** — currently returns `game.player.mapId` if it's a district. Change to `getRegionAt(x, y).id` if kind === 'district'.
5. **Cave palette** (`CAVE_META[_mapId]`) — caves stay as separate interior maps (they aren't part of the world grid), so this stays as-is.
6. **Route palette** (`ROUTE_PALETTE[_mapId]`) — routes cease to be separate maps; palette lookup falls through to district-region palette in `drawTile`.

### Fallback chain in drawTile (Phase 4 final)
```js
const _mapId = game.player.mapId;
let _dm;
if (_mapId === 'zyraxis_world') {
  // World map: palette from current tile's region
  _dm = getRegionDistrictMeta(mx, my) || null;
} else {
  // Interior maps (home, halls, seer HQ, caves) keep the old lookup
  _dm = CAVE_META[_mapId] || DISTRICT_META[_mapId] || ROUTE_PALETTE[_mapId] || null;
}
```

---

## Phase 5 · Remove district portals + seam crossing (~2-3h)

Currently `>` and `<` tiles trigger `travelDistrict()` which loads a different MAP. In RP8 unified world, these tiles don't exist as portal triggers because everything is one MAP.

### Steps
1. **Remove `>` and `<` tiles from world-generator output** — replace with regular walkable path tiles at the seam positions
2. **Delete or gate the `travelDistrict()` function** — replace calls with a no-op when `mapId === 'zyraxis_world'`
3. **Add seam-crossing HUD feedback** — when player crosses from one region to another, show a small toast: `◈ NOW ENTERING ZARVANE`. Detected via `getRegionAt(prevX, prevY).id !== getRegionAt(nowX, nowY).id`.
4. **Reposition group-unlock gates** — the "Ministry watchpost" gates that block cross-group travel were tied to portals. In RP8, add invisible seam-line walls at group boundaries that lift when the group's Seer Commanders are all defeated. Alternative: physical Ministry NPC standing at the seam that blocks passage.
5. **Bridge of Hope gate** — the transition into Part 2 stays gated; player can't walk south past the Bridge until the endgame flag fires. Sentinel NPC at the bridge blocks passage otherwise.

---

## Phase 6 · Interior door exits + save-state migration (~1-2h)

### Interior doors
Every `DOOR_TARGETS` entry currently has hardcoded exit coords like `{ map: 'malezor', x: 2, y: 5, dir: 'down' }`. In RP8, "map: 'malezor'" becomes "map: 'zyraxis_world' + world coords for that door's exit."

Update `DOOR_TARGETS` + `INTERIOR_EXITS` to use world coord exits. Interior maps themselves (home_interior, town_hall, seer_hq_main, etc.) stay as separate maps — only the exit coords change.

### Save-state migration
Existing saves have `game.player.mapId: 'malezor', x: 5, y: 5`. Migration on load:
```js
// Migration: pre-RP8 saves have district mapId — translate to world coords
if (game.player.mapId && DISTRICT_META[game.player.mapId]) {
  const dm = DISTRICT_META[game.player.mapId];
  const region = ZYRAXIS_WORLD.regions.find(r => r.id === game.player.mapId);
  if (region) {
    // Translate district-relative coords to world coords
    game.player.x = region.x1 + game.player.x;
    game.player.y = region.y1 + game.player.y;
    game.player.mapId = 'zyraxis_world';
  }
}
```

Test with a variety of old save files (Malezor start, mid-game Netharion, endgame Korathen).

---

## Phase 7 · Content polish (~4-8h · optional per-region)

Once Phases 3-6 land, the world is playable end-to-end but the interstitials + Part 2 zones are empty. Fill them in per priority:

1. **Wild March content** — hidden chests, optional Rizer trainers, a landmark or two, unique-to-region rare Zyrex spawn (Astralite-family hint)
2. **Green Divide content** — same pattern; Nature-family emphasis
3. **Bridge of Hope beat** — farewell sequence with Mom / Dad / Kelthor / Myara at the bridge threshold; Anciuxor blessing if player has Him
4. **Old Conquest** — pre-Accord ruins content (ghost-Zyrex encounters, Novarius-era lore drops)
5. **New Conquest** — Seer-remnant cleanup (Seer patrol encounters, unfinished infrastructure)
6. **Pit of No Return** — endgame-endgame challenge (Ultimate Prismsynch quest? Realm-crossing hook?)

---

## Testing checklist (each phase)

- Player can walk seamlessly between all region seams
- Wild encounters fire with correct type pool for each region
- HUD label updates on seam crossing
- Palette renders correctly per region (Malezor greens, Netharion purples, Korathen golds, etc.)
- Interior doors take player to correct interior AND exit puts them at correct world coord
- Save/load preserves world coords
- Old RP7 saves migrate to world coords without breaking
- Group-unlock gates fire correctly (Ministry watchposts block until Seer Commanders down)
- Bridge of Hope blocks passage until endgame flag
- Part 2 zones inaccessible until Bridge is unlocked
- Every canon system from RP7 (moves, statuses, XP curves, Bond lessons, Broadcast towers, etc.) works identically

---

## Risk register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Region rectangles overlap or leave gaps → dead zones | Player can walk into unrenderable coords | Automated bounds validation on world generator; sentinel wall tiles in gaps |
| Save migration corrupts old saves | Loss of player progress | Migration function backs up old save state to a `savePreRp8Backup` slot before rewriting |
| Wild pool bugs at seams | Encounters fire with wrong type or empty pool | Fallback to district-neighbor pool; smoke-test each seam |
| Interior door exits land player in wall tiles | Player stuck on load | Validate every DOOR_TARGETS exit is a walkable tile in the world MAP after generation |
| Group-unlock gates don't fire | Player skips story-gated regions | Add explicit seam-wall check + gate visualization |
| Performance regression from larger MAP | Frame drops on low-end devices | Viewport is still 10×10 tiles rendered — MAP size doesn't affect per-frame render cost |

---

## Estimated remaining effort

| Phase | Effort |
|-------|--------|
| Phase 3 · Unified world MAP generator | 4-6h |
| Phase 4 · Rewire systems to use getRegionAt | 2-3h |
| Phase 5 · Remove portals + seam crossing | 2-3h |
| Phase 6 · Interior doors + save migration | 1-2h |
| Phase 7 · Content polish (optional per-region) | 4-8h |
| **Total remaining** | **13-22h** across 3-5 sessions |

---

## What's in code right now (as of this handoff)

- `rp8.html` — exists, runs identical to RP7 with `ZYRAXIS_WORLD` layout + `getRegionAt` added
- `rp7 · rizers.html` — untouched, stable, shipped

## What to work on next session

Phase 3 · build the unified world MAP generator. Everything downstream depends on this. See "Phase 3" section above for step-by-step.

---

*Handoff v1 · 2026-07-16 · covers RP8 build phases 1-7*
