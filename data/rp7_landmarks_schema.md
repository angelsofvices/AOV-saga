# RP7 · Geographic Landmark Schema

**Status: spec. Maps onto the EXISTING RP7 architecture — this is not a parallel system.**

---

## 1 · What the engine already provides

Inspected in `rp7b.html` before designing. Three of the five primitives the Geographic Landmark System needs already exist:

| Primitive | Existing implementation | Status |
|:--|:--|:--|
| Collision from a shape | `WORLD_PROPS[].footprint: [[dx,dy]…]` → `_propBlocked` Set of `"x,y"` | ✅ works as-is |
| Entrance to an interior | `WORLD_PROPS[].door: [dx,dy]` → `_propDoors` Map → `enterInterior(sceneKey, cfg, toast)` | ✅ works as-is |
| Encounter zone | `_wildZones` Set of `"x,y"` | ⚠️ exists but is **one flat set** — needs per-zone tables |
| Elevation | — | ❌ needs per-tile `elev` |
| Traversal gating / discovery | — | ❌ needs `traversalRequirement` + `discovered` |

**Therefore: a Landmark IS a `WORLD_PROPS` entry with extra fields.** No new placement system, no new collision system, no new interior system.

---

## 2 · The Landmark extension

```js
{
  // ── existing WORLD_PROPS fields · unchanged ──
  id:        'malezor_sunken_hollow',
  img:       Image, src: 'assets/…/pond-set.png',
  bbox:      [x, y, w, h],
  tileX: 128, tileY: 96,
  footprint: [[0,0], [1,0], …],        // drives collision as it always has
  door:      null,                      // or [dx,dy] for a cave mouth
  onInteract: fn,

  // ── NEW · geographic layer ──
  landmark: {
    type:      'pond',                  // archetype key
    family:    'water',                 // elevation|rock|water|crossing|canyon|
                                        // cave|forest|coast|astral|civil
    scale:     'local',                 // micro | local | regional | mega
    name:      'Sunken Hollow',         // omit for micro — not everything is named
    district:  'malezor',
    region:    'malezor_wild',

    elev:      0,                       // base elevation of this landmark
    collision: 'blocked',               // blocked | walkable | ledgeDown | shallow

    traversal: null,                    // null | 'double_jump' | 'light' | 'night'
                                        // | 'hoverboard' | 'quest:<id>' | 'gemlord'
    encounterZone: 'malezor_pond',      // key into ENCOUNTER_TABLES
    interior:      null,                // sceneKey for enterInterior()

    discovered: false,                  // set true on first entry · drives the map pin
    secret:     false,
    variant:    'malezor',              // district skin · one mechanic, many looks
    lore:       null,                   // lore entry id for environmental storytelling
    rewards:    [],                     // chest/astralite/item ids seeded here
  }
}
```

**Every new field is optional.** A prop without `landmark` behaves exactly as it does today, so all 3,859 existing props keep working untouched.

---

## 3 · Elevation

A per-tile `elev` integer, default 0.

```js
elevAt(x, y)            // → int, 0 when unset
canStep(fromX,fromY, toX,toY)
  // true when elevAt is equal,
  // OR the destination is a stair tile connecting the two levels,
  // OR the move is a ledgeDown drop (one-way, downhill only)
```

- **Cliff face** draws on the rows below a raised tile, height = `elev × RISE` (RISE = 24px suggested).
- Existing `footY` depth sorting already renders cliff faces correctly against actors.
- Stairs already trigger on walk-on in `tryMove` — extend, don't replace.
- **Ledges are one-way down**, which turns the return leg of any loop into a shortcut.

---

## 4 · Encounter tables

Upgrade `_wildZones` from a flat Set to a keyed map, preserving the existing behaviour as the `general` fallback.

```js
ENCOUNTER_TABLES = {
  malezor: {
    general:  [...],        // ← today's _wildZones behaviour lives here
    forest:   [...],
    mountain: [...],
    cave:     [...],
    river:    [...],
    lake:     [...],
    rare:     [...],
    event:    [...],
  },
}
```

A tile resolves its table by asking which landmark's `encounterZone` covers it, falling back to `general`. This is what makes Zyrex read as *animals in ecosystems* rather than encounters assigned to coordinates.

---

## 5 · Families and their archetypes

| Family | Archetypes |
|:--|:--|
| `elevation` | hill · rolling hills · plateau · mesa · cliff wall · ledge · foothill · mountain · range · peak · ridge · valley · pass · terrace · overlook |
| `rock` | boulder · boulder cluster · rock wall · pillar · arch · spire · rubble · scree · cracked ground · mineral formation · outcrop · narrow corridor · collapse |
| `water` | spring · tiny pond · pond · lake · regional lake · creek · stream · river · wide river · rapids · waterfall · marsh · lagoon · inlet · shallow · deep |
| `crossing` | wooden · stone · rope · landmark · broken · ancient · stepping stones · fallen tree · ford · mechanical · temporary |
| `canyon` | canyon · gorge · ravine · chasm · trench · junction · dead end · overlook · canyon bridge · hidden path · canyon cave · network |
| `cave` | hillside · mountain · cliff · mine · tunnel · hidden · crystal · collapsed · Zyrex den · ancient · Gemlord · sea cave · waterfall-hidden · secret |
| `forest` | cluster · dense wall · corridor · grove · clearing · ancient tree · dead forest · overgrown path · giant vegetation · trail · maze · hidden passage |
| `coast` | beach · rocky shore · sea cliff · peninsula · island · offshore island · cove · sea cave · rock formation · dock · coastal ruin · shore path |
| `astral` | crystal field · astralite deposit · astralite crater · energy fissure · floating stones · astral vent · Mothergem terrain · Zyrex bones · ancient nest · fossil field · mineral forest · gem formation · luminous pond · astral scar · battle damage · Thamonian remnant · Gemlord formation |
| `civil` | road · trail · stone path · stairs · retaining wall · tunnel · gate · checkpoint · dock · canal · dam · excavation · mine · mountain road · road ruin · abandoned path |

---

## 6 · Route patterns

Geography exists to bend movement. Avoid `A → straight road → B`.

`s-bend` · `loop` · `fork` · `mountain pass` · `river crossing` · `canyon corridor` · `forest corridor` · `cliff path` · `shoreline path` · `tunnel shortcut` · `cave bypass` · `overlook` · `dead end with reward` · `hidden secondary route` · `rejoining route`

---

## 7 · Placement rules

1. **Silhouette must be organic.** No rectangles. Bends, protrusions, recesses, variable widths.
2. **All four scales present per district.** Micro detail without regional structure reads as clutter; regional structure without micro detail reads as empty.
3. **Every regional+ landmark should be visible before it is reachable** where possible — that is the "how do I get over there?" hook.
4. **Crossings are chokepoints** — place encounters, duels and story beats on them.
5. **Civilization bends to terrain**, never the reverse.
6. **Do not move existing canonical content.** If a landmark composition wants an existing building moved, flag it first.

---

## 8 · Migration safety

- `landmark` is additive and optional → 3,859 existing props unaffected.
- `elev` defaults to 0 → the whole current map stays walkable exactly as it is.
- `ENCOUNTER_TABLES.<district>.general` preserves today's `_wildZones` behaviour.
- `discovered` is per-save state and slots into the existing save backfill automatically (v0.95.634 deny-list means any new `player.*` field persists with no save-code edit).
