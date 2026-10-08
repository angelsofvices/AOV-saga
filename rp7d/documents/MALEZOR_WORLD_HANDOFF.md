# RP7D · Malezor World Pass: handoff for ChatGPT

**From:** Claude · **For:** ChatGPT · **Date:** 2026-09-26
**Task:** rebuild RP7D's Malezor on RP7B's Malezor. Put the canon buildings in their canon places, add the three district landmarks, and lay out the full expanded land. This pass is the **skeleton**; Astra fills out the world afterwards.

---

## 0 · Ground rules

1. **One folder is the source of truth:** `/Users/mctherockstar/Documents/Claude/Projects/the AOV™  saga/rp7d/`.
   - Read the current files before you change anything. Claude also edits this folder, and the Creator gives only one of us the files at a time.
2. **RP7B is the skeleton; RP7D is its 3D version.** When RP7B and RP7D disagree about a place, RP7B wins.
   - Anything RP7D has that RP7B doesn't is listed in §8. Keep those items and ask the Creator.
3. **Keep every existing system working:**
   - movement, combat
   - hitboxes (`hitbox.js`)
   - Seers and Mori (`seers.js`)
   - the chest and Basic Sword (`loot.js`)
   - Astralvision, Astralift, Anciuxor
   - Zyphone, the coordinates panel, the Anim Lab
   - the DualSense mapping
4. **Items only come from chests, NPC hand-offs or designed world finds.** No building or trigger grants anything. Nothing ever just appears on Rizer.
5. **When you're done:**
   - Rebuild `dist/RP7D_Malezor_Playtest.html` with `node tools/build_single_html.mjs`.
   - Update `README.md` and `CHATGPT_HANDOFF.md`.
   - Tick the checklist in §9.

## 1 · Sources

| What | Where |
|---|---|
| RP7B (the skeleton) | `/Users/mctherockstar/Documents/GitHub/AOV-saga-new/rp7b.html` (3.9 MB, Sep 25) |
| Building sprites (look reference) | `/Users/mctherockstar/Documents/GitHub/AOV-saga-new/assets/2D sprites/buildings/` |
| The 30 district landmarks, by district | `…/AOV-saga-new/assets/2D sprites/tiles/landmarks/<district>/` (Malezor: `the-fanghall.png`, `the-bloodscent-lodge.png`, `the-first-den.png`) |
| Decor sprites (gate, radio tower, statue, UFO, Malezor tree) | `…/AOV-saga-new/assets/2D sprites/decor/` |
| Contact sheet of every Malezor building | `rp7d/Claude outputs/_malezor_buildings_sheet.png` |

These are the places to read in `rp7b.html` (line numbers are as of Sep 25):

- `ZYRAXIS_DISTRICTS` (~2257): Malezor `{cx:58, cy:103, rx:145, ry:135, seed:.8}`. Just after it, `irregularDistrictContains()` builds the coast from that ellipse plus three sine terms.
- `DISTRICT_WHEEL` + `wheelQuarterAt()` (~6281)
- `TOWER_NETWORK` (~6050) and `SEER_HQ_NETWORK` (~6771)
- `WORLD_PROPS` (~7028 onward): every building with `tileX/tileY/tileW/tileH`. The block comment for **"THE THIRTY DISTRICT BUILDINGS"** (~7528) is the landmark rule.
- `RR_POSITIONS` / `HOUSE_POSITIONS` (~8805 / ~8856): Malezor's ten homes
- `HOME_TILE` + `_malezorDensityFor()` (~17716): radial enemy density from home
- `MALEZOR_WILD_ZONES` (~61265): the four measured wild regions

## 2 · Coordinates: RP7B tiles → RP7D units

RP7B uses tiles, with +x east and +y south. RP7D uses units, with +x east and +z south, so the axes already agree. Use one transform everywhere and keep it in `world-data.js` so it can be retuned:

```js
// world-data.js
export const RP7B = { K: 2.0, cx: 61, cy: 94 };                  // units per tile · Malezor's measured centre
export const fromRP7B = (tx, ty) => ({ x: (tx - RP7B.cx) * RP7B.K, z: (ty - RP7B.cy) * RP7B.K });
```

- **Why the numbers:** `(61, 94)` is Malezor's measured centre in RP7B. Its full span is x −89…210, y −32…219 (tiles). At `K = 2.0` the district is **x −300…298, z −252…250**. That is almost exactly the ±253 bound you already expanded to in z; x needs about ±300.
  - One RP7B tile becomes 2 units. A person is about 2.3 units tall, so buildings keep their proportions: the town hall is 11×9 tiles, or 22×18 units.
  - If the Creator wants a larger scale, change `K` alone and nothing else.
- **Coast:** port `irregularDistrictContains(d, x, y)` and run it in tile space through the inverse transform. The playable land is that irregular ellipse (centre about (−6, 18), radii about 290 × 270 units), not a square.
  - Past the coast is RP7B's **void edge**. The Malezor coast "is not a coast. It is an edge, and it is a hard one." Make it a sheer drop or darkness with an invisible wall, not a beach.
  - The only exit is the south road through the Zarvane gate.
- Replace `extent`, `bound` and `featureExtent` with bounds derived from this mask. Retire the square central zone (±98) and the four equal compass wedges. RP7B's measured regions in §5 replace them.

## 3 · The district wheel is now confirmed

`DISTRICT_WHEEL` says Malezor is `{ land:'Beastlands', outbound:'S', dominant:'open', flank:'FW' }`. Running that through `wheelQuarterAt()` gives:

- **South is OPEN.** This is the dominant quarter, about twice the size of the others. It holds the road to Zarvane, the Seer HQ and the pasture.
- **North is HIGHLAND.** Rakoron's Ruby Cave, the radio tower and the treehouse are here.
- **West is FOREST.**
- **East is WETLAND.**

RP7D's current `wheel` already matches. Set `verified: true` and remove the "⚠ Canon to confirm #1" note from the README.

## 4 · What goes where

Place everything with `fromRP7B(tileX, tileY)`. "Door" means the RP7B door tile; buildings face the side their sprite's door is on.

### Civic spine

In RP7B, Malezor's heart is a **north–south column at tile x ≈ 22**. It runs from the cave down to the hospital, with homes wrapping it. In RP7D this column sits at x ≈ −78, west of the district centre.

| Place (sprite) | RP7B id | Tile (x, y) | Size (tiles) | RP7D (x, z) |
|---|---|---|---|---|
| Rakoron's Ruby Cave (`rakoron-cave-full.png`) | `rakoron_cave` | (22, 10) | 13×11 | (−78, −168) |
| Dad's Research Facility (`research-facility.png`) | `malezor_research_facility` | (22, 38) | 13×9 | (−78, −112) |
| Gear Shop (`malezor-gear-shop.png`) · **new** | `malezor_gear_shop` | (16, 56) | 7×7 | (−90, −76) |
| Malezor Town Hall (`malezor-townhall.png`) | `malezor_town_hall` | (22, 78) | 11×9 | (−78, −32) |
| Rizer's Home (`player-home.png`) · **player start** | `player_home` | (22, 105) | 5×5 | (−78, 22) |
| School / Rizer Academy (`school.png`) | `malezor_school` | (25, 126) | 11×9 | (−72, 64) |
| Zysphere Shop (`zysphere-shop.png`) | `malezor_zysphere_shop` | (−20, 120) | 7×6 | (−162, 52) |
| Potion Shop (`potion-shop.png`) | `malezor_potion_shop` | (10, 138) | 7×7 | (−102, 88) |
| Zyrex Farm · Kaizari (`zyrex-farm.png`) | `malezor_zyrex_farm` | (35, 138) | 11×9 | (−52, 88) |
| Hospital · Nurse Rein (`hospital.png`) · **new** | `malezor_hospital` | (22, 156) | 11×9 | (−78, 124) |

- **Town-hall plaza:** RP7B gives the hall a plaza. Put the fountain (Malezor Square) directly south of the hall door, around (−78, −14). Put the current square's lamps and benches there as well.
- **Roads:** make the column a real road. It runs from the cave door south through the research facility, the gear shop, the hall, home, the school and the hospital. It then bends south-east to the Seer HQ and the gate.
  - RP7B also marks a **north path to Rakoron's Cave** at (22, 55), which is (−78, −78) in RP7D.
  - Keep the lore line that "a road out of Malezor goes north and stops." Let a well-made old road run past the cave and end in a field.

### Homes

RP7B has ten homes, and none of them line up. That is the settlement doctrine at work, so keep them un-gridded.

| Home | RP7B tile | RP7D (x, z) |
|---|---|---|
| Villager home 0 · "far-north west" | (10, 50) | (−102, −88) |
| Villager home 1 · "north-2 east" | (35, 60) | (−52, −68) |
| Villager home 2 · "town-hall west" | (10, 80) | (−102, −28) |
| Villager home 3 · "middle west" | (10, 110) | (−102, 32) |
| Villager home 4 · "south east" | (35, 120) | (−52, 52) |
| Red-roof home 0 | (6, 90) | (−110, −8) |
| Red-roof home 1 | (36, 89) | (−50, −10) |
| Red-roof home 2 | (22, 94) | (−78, 0) |
| Red-roof home 3 | (12, 98) | (−98, 8) |
| Red-roof home 4 · **Crazy's House** (not purchasable) | (32, 98) | (−58, 8) |

- Villager homes use `villager-home.png` (green roof, stone and timber). Red-roof homes use `red-roof-home.png` (red roof, half-timber).
- Carry over RP7B's `_purchasableHome` flag as data only; there's no buying yet.
- These ten replace RP7D's procedural `neighbourHomes: 7`.

### Frontier, towers and set pieces

| Place (sprite) | RP7B id | Tile | RP7D (x, z) | What it does in RP7B |
|---|---|---|---|---|
| Seer HQ · Malezor (`seer-hq-malezor.png`) | `seer_hq` (door) | (75, 172) | (28, 156) | Sits at the route mouth; "the Seers control the roads". Grunt Lv 6, commander Lv 10. Hand-placed, and the rule for every other district was derived from it. |
| Malezor–Zarvane Gate (`decor/malezor-zarvane-gate.png`) · **new** | `malezor_zarvane_gate` | (84, 190) | (46, 192) | A macro landmark on the district seam. The cool-toned Malezor tower faces west over grass and the amber Zarvane tower faces east over sand. The three centre columns stay open to walk under. |
| Radio Tower (`decor/radio-tower-broken.png` → `-fixed.png`) · **new** | `malezor_radio_tower` | (38, 14) | (−46, −160) | Broken until its remote goes back to Scrapjaw. Vilerok boss squad (Mori Lv 5, boss Lv 8). The **Voltshard** cosmic chest sits in its plaza at (41, 16) → (−40, −156). |
| Rizer's Treehouse (`rizer-treehouse.png`) · **new** | `rizer_treehouse` | (20, −20) | (−82, −228) | Kid Pals hideout. The raygun chest is on the ground two tiles south, at (20, −18) → (−82, −224). |
| Novarius Statue (`decor/novarius-statue.png`) · **new** | `novarius_statue` | (8, 29) | (−106, −130) | A monument you can walk around, with no collision. |
| Auraxion's UFO (`decor/auraxion-ufo.png`) · **new** | `auraxion_ufo` | (17, 176) | (−88, 164) | Grounded in the southern wild arm. Locked until Auraxion's Astralcore fetch quest (that chest is at (5, 195) → (−112, 202)). |
| Orchard clearing · Rubypaw Longsword | — | (−54, 27) | (−230, −134) | The Creator placed this from inside the game. Leave an orchard clearing here; the item comes later. |

Move RP7D's current **Seer checkpoint** (`seerGate`), `seerPatrols` and `moriPatrols` so they hang off these positions (§6).

## 5 · The three district landmarks (the "30 buildings")

- **The rule (RP7B ~7528):** every district gets three landmark buildings **outside residential**, in a **triangle around the hub**.
  - The **apex** is the one nearest the district's Gemlord cave.
  - The two **base** points flank it at about 137° either side.
  - Walk out to any one of them and the triangle points you to the cave.
  - The solver kept every anchor 30–150 tiles from the hub, at least 16 tiles from any home, with at least 26 tiles between the three.

| Landmark | Role | Tile | Size | RP7D (x, z) | Canon line (RP7B) | Look (sprite) |
|---|---|---|---|---|---|---|
| **The Fanghall** | apex (toward Rakoron) | (−34, 12) | 11×10 | (−190, −164) | "The Elder judges territorial disputes here." Sealed for now. | A dark timber tribal hall. Bone and tusk arches frame the door, horned skulls sit on the ridge, and red banners and a red carpet run up the steps, with spiked palisade posts. |
| **The Bloodscent Lodge** | base | (90, 174) | 10×10 | (58, 160) | The door **opens** (`enterBloodscentLodge`). Inside is an empty great hall with two trophy wings, in "a shape of its own". | A black timber longhouse with a steep red-trimmed roof and a chimney. Huge curved horns and a horned skull sit over the door, with red drapes, torches and crossed blades. |
| **The First Den** | base | (−42, 180) | 10×9 | (−206, 172) | "Sanctuary for young Zyrex deciding whether to bond." Sealed for now. | One giant pale bone arch like a ribcage or tusk, with tooth-spikes along its base and red ochre markings. Two carved skull-topped pillars hold a red cloth over a warm glowing entry, with stairs up. |

- Model each one as a new `props.js` recipe, the same way `townHall` and `seerHQ` are built: low-poly, flat-shaded, and readable at game distance. Keep their silhouettes distinct from each other.
- Register each landmark as:
  - a HUD/minimap place,
  - an Astralvision target (`kind: 'quest'`, gold),
  - an interactable that shows its canon toast.
- The Lodge's door is marked "enter (interior later)". Don't build interiors in this pass.

## 6 · Land geography

- **Regions:** replace RP7D's square central zone and compass wedges with RP7B's measured wild zones. Each one's centre sits 108–132 tiles out.

  | Zone | Name | RP7B tile | RP7D (x, z) |
  |---|---|---|---|
  | N | the northern ridge | (94, −9) | (66, −206) |
  | E | the eastern flats | (191, 71) | (260, −46) |
  | S | the southern lowlands | (−17, 200) | (−156, 212) |
  | W | the western reach | (−66, 104) | (−254, 20) |

  Keep "Malezor Central" as the name for the civic spine and its homes, and use these four as the outer region names in the HUD location banner.

- **Elevation, following the wheel:**
  - North (highland) climbs toward Rakoron's cave, the northern ridge and the radio tower, with cliffs and pines.
  - West (forest) is dense woods out to the western reach and the First Den. The orchard clearing sits at (−230, −134). Use `decor/malezor-tree.png` as the canopy reference.
  - East (wetland) holds the river, the ponds, willows and the Timber Crossing, out to the eastern flats.
  - South (open, the dominant quarter) is broad pasture and the paddocks. It drops to the southern lowlands, with the Seer HQ, the Bloodscent Lodge and the Zarvane gate along the road.

- **Water:**
  - Keep RP7D's river concept, springing in the north-east highland and running south through the wetland. Re-route it with `fromRP7B` so it stays east of the civic spine and clear of every building footprint above.
  - Re-seat the ponds and the Timber Crossing on the new river.

- **Roads:**
  - The civic spine (§4).
  - The spine → Seer HQ → Zarvane gate, which is the only road out.
  - The north path to the cave.
  - Trails to each landmark: the apex up the forest-highland edge, and the two bases across the south.
  - An east lane over the Timber Crossing into the wetland.
  - Delete the three dead-end "exit" roads (north, east, west). Malezor's only exit is south.

- **Enemy density:** port RP7B's radial rule from home.

  | Distance from home | Density |
  |---|---|
  | under 22 tiles (44 units) | no spawns |
  | 22–40 tiles | 20% |
  | 40–64 tiles | 60% |
  | 64+ tiles | 100% |

  - Rebuild `seerPatrols` and `moriPatrols` on it: Seers along the south road and around the HQ, Mori in the wild zones.
  - The RP7B roster is Mori-heavy, and the Vilerok belongs to the radio-tower squad.

- **Wild Zyrex and Anciuxor:** move their patches into the four wild zones, as RP7B's `MALEZOR_WILD_ROSTER` spreads them.

## 7 · What in RP7D has to move

Search for every hard-coded position and re-seat it:

- **`world-data.js`:**
  - `playerStart` goes to the home door, facing the spine road.
  - `structures`, `landmarks`, `roads`, `river`, `ponds`, `paddocks`, `wildZyrex`, `seerPatrols`, `moriPatrols`, `plaza`, `subdistricts`, `extent/bound/featureExtent`, `coreRadius/districtRadius`.
- **`world.js`:** the hard-coded `seer-gate` position and the lamp placement.
- **`loot.js`:** the chest's clearance search should start near home, not at the old square.
- **`hud.js`:**
  - `places`
  - the region lookup (`regionName`) and the map labels, which are drawn at fixed coordinates
  - the minimap bounds
- **`game.js`:**
  - the Options teleport list
  - anything else that assumes the old square is at (0, 9)
- **`nature.js` / `terrain.js`:** scatter bounds, the highland and wetland masks, and the coast mask.
- **Anciuxor's seeded encounter spots**, and the coordinates-panel region name.

## 8 · Canon to confirm with the Creator (don't decide these alone)

1. **The Fallen Titan** is RP7D-only; it's not in `rp7b.html`. Keep it (and where), or retire it?
2. **Timber Crossing** and the exact river line are RP7D inventions. Keep them?
3. **Scale:** is `K = 2.0` units per tile right, or should Malezor be bigger (for example 2.4, a humanoid per tile)?
4. **The "road north that stops":** how far past the cave should it run?

## 9 · Done when

- [x] Rizer starts at his home on the civic spine. The hall, shops, school, farm and hospital are placed from RP7B coordinates and have interactable entries.
- [x] All ten homes are placed from RP7B data, and Crazy's House is flagged non-purchasable.
- [x] The Fanghall, the Bloodscent Lodge and the First Den stand in their triangle. Each is on the minimap, registers as a gold Astralvision target, and shows its canon line.
- [x] The Seer HQ, the Malezor–Zarvane gate, the radio tower and sealed Voltshard chest spot, treehouse and sealed Raygun chest spot, Novarius statue, and Auraxion's UFO and quest-locked chest spot are in place.
- [x] The land follows the irregular coast with a hard void edge. The highland is north, forest west, wetland east and open south. Roads connect the map; the south gate is the only outbound road.
- [x] Seer and Mori route selection uses the radial density bands and excludes initial spawns within 44 units of home.
- [ ] Gameplay regression check still needed: combat, hitboxes, sword pickup, Astralvision, Astralift, Zyphone, DualSense and coordinates panel were preserved in source but not manually playtested in this pass.
- [x] `README.md` and `CHATGPT_HANDOFF.md` are updated, and `dist/RP7D_Malezor_Playtest.html` has been rebuilt.

## 10 · Out of scope for this pass

Leave these out: interiors (including the Bloodscent Lodge's), NPCs and dialogue (Kelthor, Nurse Rein, Kaizari, the folk), quests (the radio-tower remote, Auraxion's Astralcore), purchasable homes, and other districts. Once the skeleton stands, Astra fills out the world.
