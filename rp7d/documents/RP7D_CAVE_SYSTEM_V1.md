# RP7D — Zyraxis Cave & Terrain Integration Specification

**Version:** 1.1 implementation handoff  
**Status:** Cave system and district classifications LOCKED; map-image coordinates PROVISIONAL  
**Scope:** 10 districts, 20 caves, 63 floors, one continuous 3D interior per cave.

## 1. Mission and preservation rules

Extend the **existing** RP7D world and terrain generation logic; do not rebuild the overworld, move districts, change roads, remove buildings, replace landmarks, or reset save data. First inspect the live 3D source code, district masks, world-coordinate conversion, elevation generation, collision/navmesh, and scene transitions. Existing RP7B references (`worldDistrictAt(x,y)`, district terrain masks, and the Malezor Highland/Cave region) are design ancestry, **not proof of the current RP7D implementation**. Integrate with actual code after inspection.

## 2. Locked cave canon

- Exactly **two caves per district**: one Gemlord cave and one natural cave.
- Exactly **10 Gemlord caves × 4 floors = 40 floors**.
- Exactly **3 Ancient natural caves × 3 floors = 9 floors**, permanently in **Andrannor, Netharion, Xilnar**.
- Exactly **7 Common natural caves × 2 floors = 14 floors**.
- Total **20 caves / 63 floors**.
- **Level 1** is always the entrance reached from the overworld.
- Every cave is **one continuous, traversable 3D interior**. All floors connect physically with spiral staircases; **no loading between floors**.
- A cave is part of the same physical Zyraxis world/dimension, not a separate realm. For performance, the whole cave interior may load/stream at the entrance and unload on exit; exiting returns the player to the matching overworld entrance.
- **Mountain caves ascend** from Level 1 to higher-numbered floors. **Canyon caves descend** from Level 1 to higher-numbered floors.
- Cave entrances are embedded naturally in **mountains or canyon walls only**, never as freestanding openings on flat base-world terrain.
- Spiral staircases connect all floors and sit naturally within the **upper-left or lower-left** regions of the cave interior floor plan. These are layout-space positions, not arbitrary world compass directions. Each staircase must have safe landings, reachable approaches, and clearance.
- Stairways may be blocked by **Seers** or environmental obstacles such as stones. Cleared permanent obstacles stay cleared.
- **NPCs** appear on Floors 1 and 2. **Seers patrol Floor 3** in caves that have it (all Ancient and Gemlord caves); exact Gemlord-specific encounters and Floor 4 populations remain content-driven.
- Hybrid design: preserve cave identity, entrance position, rarity, story rooms, landmark chambers, permanent discoveries and quest-critical paths. Modular procedural construction is allowed for eligible secondary chambers and passages.

## 3. Approved district distribution

| # | District | Gemlord | Gemlord cave (4 floors) | Natural cave | Natural floors |
|---|---|---|---|---|---:|
| 1 | Malezor | Rakoron | Mountain ↑ | Common · Canyon ↓ | 2 |
| 2 | Zarvane | Ivirium | Canyon ↓ | Common · Canyon ↓ | 2 |
| 3 | Andrannor | Mutaryn | Mountain ↑ | Ancient · Canyon ↓ | 3 |
| 4 | Veridan | Emeralix | Mountain ↑ | Common · Mountain ↑ | 2 |
| 5 | Netharion | Eurakeon | Canyon ↓ | Ancient · Canyon ↓ | 3 |
| 6 | Vorashil | Azurel | Mountain ↑ | Common · Mountain ↑ | 2 |
| 7 | Xilnar | Obsidius | Mountain ↑ | Ancient · Mountain ↑ | 3 |
| 8 | Baelgor | Ambrevon | Mountain ↑ | Common · Canyon ↓ | 2 |
| 9 | Thardin | Oathane | Mountain ↑ | Common · Canyon ↓ | 2 |
| 10 | Korathen | Oatheus | Mountain ↑ | Common · Mountain ↑ | 2 |

**Terrain totals:** 12 mountain caves and 8 canyon caves.

## 4. Provisional map-image placement draft

These are **approximate candidate centers** based on the supplied 1429 × 1055 map image, measured in image pixels from the top-left. **They are not verified cave mouths or game-world coordinates.** The source image is a visual guide; the current 3D district masks, terrain, existing content, and border buffers have final authority. If a proposed pixel lies too near a border or populated area, move the entire cave footprint to a valid interior location. Do not force an invalid placement.

| District | Gemlord candidate (image px) | Natural candidate (image px) |
|---|---|---|
| Malezor | (160, 85) | (335, 235) |
| Zarvane | (195, 490) | (370, 520) |
| Andrannor | (545, 375) | (615, 535) |
| Veridan | (785, 285) | (905, 420) |
| Netharion | (740, 555) | (800, 680) |
| Vorashil | (465, 735) | (580, 825) |
| Xilnar | (620, 945) | (735, 860) |
| Baelgor | (835, 815) | (925, 955) |
| Thardin | (1040, 795) | (1110, 950) |
| Korathen | (1235, 790) | (1345, 940) |

**Coordinate conversion:** Only convert image pixels to world coordinates after calibrating the map against actual known district/landmark positions and orientation. Do not assume simple proportional scaling if the artwork is nonuniform, rotated, stylized, or not georeferenced. Otherwise use the pixel candidates only to guide district-relative placement.

## 5. District isolation and polar-distance placement

Place caves in the **most empty, undeveloped eligible regions** of their own district. Favor large interior areas with maximum distance from adjacent district boundaries. “Polar distance” means inward separation from the district perimeter and spatial separation between the two caves; it does **not** mean latitude or distance from the planet's poles.

### Hard constraints

1. The **entire** mountain/canyon footprint, cave entrance, approach and supporting geometry must remain within its district mask, with a configurable safety buffer. **No cave or its terrain may touch, straddle, or sit adjacent to the next district border.**
2. Never overwrite or relocate existing roads, settlements, shops, buildings, landmarks, quest objects, spawn points, water systems or district transitions.
3. The assigned mountain/canyon type is immutable.
4. Both cave entrances must be reachable by valid player traversal from their own district.
5. Reserve enough volume for the required continuous interior and vertical ascent/descent without intersections with protected world geometry or the other cave.
6. Both caves should be substantially separated, ideally in different empty interior regions; do not cluster them at the same boundary or road junction.
7. If no valid candidate exists, **report a placement conflict** with diagnostics; do not silently violate the rules.

### Candidate scoring (only after hard-constraint filtering)

For candidate site `p` with terrain footprint `F(p)`:

- `emptySpaceScore`: free space and low existing asset density throughout `F(p)` and its approach.
- `borderClearanceScore`: minimum signed distance from every point of `F(p)` to the district boundary.
- `pairSeparationScore`: distance from the other district cave's footprint.
- `terrainSuitabilityScore`: plausible rock formation, elevation, drainage, slopes, and geology for mountain/canyon.
- `accessScore`: route feasibility without cutting through protected assets.
- `mapPriorScore`: soft preference for the provisional map-image candidate, **never** overriding constraints.

Use deterministic tie-breaking. Suggested ranking order: preservation → border clearance → terrain suitability → empty space → cave separation → accessibility → image-map preference. Score the **whole formation**, not merely the entrance point.

## 6. Generation pipeline

1. **Inspect** current terrain/district code and world geometry; establish a reproducible build baseline.
2. **Read** authoritative 20-cave manifest (district, Gemlord, rarity, floor count, terrain direction, stable ID).
3. **Measure** current district masks, boundaries, existing assets, paths, navmesh, protected areas and available land.
4. **Generate candidate sites** in interior empty regions; use map pixels only as optional spatial priors.
5. **Validate full terrain footprints** against borders, assets, paths and the other cave; choose deterministic sites.
6. **Reserve** both cave terrain footprints and approach paths per district before adding vegetation, rocks or other props.
7. **Form mountain or canyon geometry**: mountain = rising rock mass and embedded entrance; canyon = recessed cut with rock walls and embedded entrance. Use district-appropriate materials and environmental dressing.
8. **Carve/integrate cave mouth** with actual terrain geometry and proper collision; never use a detached portal floating above flat ground.
9. **Build one continuous interior per cave** with all 2/3/4 floors connected by physically traversable spiral staircases in permitted upper-left/lower-left layout regions. Respect mountain-up/canyon-down.
10. **Populate** fixed landmark rooms and procedural eligible modules; NPCs Floors 1–2, Seer patrols Floor 3, items/Zyrex/quest events according to cave classification.
11. **Place optional blockers** with valid clearing conditions and persistent state; never make critical quest progression impossible.
12. **Connect entrance/exit** transitions to the exact overworld entrance; preserve player position, orientation, and state.
13. **Build navigation, lighting, collision, occlusion, streaming, audio and saves**; run validation suite.
14. **Emit a placement report** with final world coordinates, district, cave ID, terrain footprint, entrance orientation, minimum border distance, separation from paired cave, conflicts and pass/fail status.

## 7. Continuous interior geometry and staircases

- One interior scene/space per cave; floors are subregions, not separate loadable dungeons.
- Spiral staircases are **real navigable geometry**, not teleports; the player can walk continuously from one floor to another.
- For mountain caves, each subsequent floor's vertical elevation is **higher** than the prior floor. For canyon caves, each subsequent floor is **lower**.
- Place stair anchors in the upper-left or lower-left portion of the generated cave layout; use procedural adjustment for collision, tunnel connectivity, structural support and landing clearance.
- Provide reachable routes from each floor's primary rooms to the staircase. Optional branches may contain secrets, hazards, rare Zyrex and collectibles.
- Every procedural layout must have a guaranteed valid route from entrance to deepest/final floor, subject only to intended progression gates.
- Fixed Gemlord chambers and quest-critical encounters cannot be displaced by procedural regeneration.

## 8. NPCs, Seers and gameplay

- Floor 1: overworld-facing entry area; NPCs and interaction opportunities.
- Floor 2: NPCs, exploration, rare items and wild Zyrex appropriate to the cave.
- Floor 3 (Ancient/Gemlord): Seer patrols with waypoints, awareness/detection, pursuit, combat and return-to-patrol behavior. Ancient caves include Seer dark-Astralism and raid-loot-site content.
- Floor 4 (Gemlord): fixed sacred/unique Gemlord domain; inhabitants and events depend on canonical content for that Gemlord.
- Seer blockades and stones may restrict staircase access; persist permanent unlocks. Patrol AI must not spawn inside blocking geometry or outside navigable areas.

## 9. Data and save architecture

Recommended cave record (schema to adapt to actual engine):

```json
{
  "id": "cave_malezor_gemlord",
  "districtId": "malezor",
  "gemlord": "Rakoron",
  "classification": "gemlord",
  "terrainType": "mountain",
  "verticalDirection": "up",
  "floorCount": 4,
  "entranceFloor": 1,
  "worldEntrance": null,
  "worldFootprint": null,
  "layoutSeed": "stable-deterministic-seed",
  "discovered": false,
  "clearedObstacles": [],
  "collectedUniqueItems": [],
  "unlockedFloors": [1],
  "completedEvents": []
}
```

Persist stable IDs, deterministic seeds, discovered state, permanent items, cleared blockers, quest flags and final world placement. Regenerating eligible procedural chambers must not delete required items or reset major discoveries. Support safe migration for existing saves.

## 10. Acceptance tests

- [ ] Exactly 10 districts, each with exactly 1 Gemlord and 1 natural cave.
- [ ] Exactly 10 four-floor Gemlord, 3 three-floor Ancient, 7 two-floor Common caves; **63 floors total**.
- [ ] Ancient caves are **Andrannor, Netharion, Xilnar only**.
- [ ] Exactly **12 mountain** and **8 canyon** caves, matching the approved table.
- [ ] Every cave terrain footprint stays inside its own district with positive safety-buffer clearance; no adjacency to neighboring district borders.
- [ ] Placement uses current empty terrain and preserves every protected world asset and path.
- [ ] No cave mouth sits on flat base-world terrain; all mouths belong to a mountain or canyon wall.
- [ ] Mountain caves go **up** and canyon caves go **down** from Floor 1.
- [ ] Each cave is a **single continuous interior** with physically connected staircases and **no floor loading**.
- [ ] Spiral staircases occupy suitable upper-left/lower-left layout regions with collision-free access.
- [ ] NPCs on Floors 1–2; Seer patrols on Floor 3 where applicable.
- [ ] Obstacles/blockades work and cleared permanent state survives reload.
- [ ] Player can enter and exit every cave to the correct overworld entrance.
- [ ] All essential quest paths are reachable and cannot be soft-locked by procedural generation.
- [ ] Cave placements and layouts are deterministic across restarts and compatible with existing saves.
- [ ] Existing world generation, district borders, landmarks, roads, combat, traversal, NPCs and saves still pass regression tests.
- [ ] A final coordinate and placement validation report is produced.

## 11. Implementation order

**Phase A — Survey:** Inspect current RP7D 3D project and map existing systems; no terrain changes yet.  
**Phase B — Placement:** Implement manifest, border distance fields, exclusion masks, candidate scoring, and report-only preview of 20 locations.  
**Phase C — Terrain:** Integrate mountain/canyon footprints, entrances, traversal and collision, one district at a time.  
**Phase D — Interiors:** Implement continuous multi-floor cave generation, spiral stairs and entrance/exit flow.  
**Phase E — Content:** Add fixed Gemlord spaces, NPCs, Zyrex, Seers, loot, blockers and persistent progression.  
**Phase F — QA:** Run full placement, navigation, save/reload and regression checks; lock validated world coordinates.

## 12. Final instruction to development AI

**Preserve first. Integrate second. Validate before committing.** Treat all approved cave counts, districts, rarity, terrain type, direction and interior rules as immutable. Treat the 20 image-pixel candidate points as a **draft only**, subject to verification against the live 3D world. Do not invent current source-code functions or claim implementation without inspecting the actual RP7D project. If placement conflicts occur, return a detailed report and request direction rather than damaging existing content or breaking district isolation.
