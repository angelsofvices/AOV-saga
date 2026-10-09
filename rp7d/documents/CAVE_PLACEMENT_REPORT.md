# RP7D · Cave placement report

Manifest: PASS · 20 caves · 63 floors · 12 mountain / 8 canyon
Rules: border buffer 18 u · pair separation ≥ 70 u · footprint radius mountain 26 u / canyon 24 u · grid 6 u
Map-image calibration: affine fit of the 10 district candidate midpoints to the district centres · mean residual 35 u (soft prior only)

| Cave | District | Class | Terrain | Floors | Entrance (x, z) | Facing° | Min border u | Asset clearance u | Pair sep. u | Status |
|---|---|---|---|---:|---|---:|---:|---:|---:|---|
| Rakoron's Ruby Cave (`cave_malezor_gemlord`) | Malezor | gemlord | mountain ↑ | 4 | -78.0, -164.0 | 0 | 56 | -34 (treehouse-trail) | 270 | PASS · pinned landmark |
| Malezor Gorge (`cave_malezor_natural`) | Malezor | common | canyon ↓ | 2 | 20.4, 57.6 | 214 | 151 | 16 (river) | 270 | PASS |
| Ivirium's Deep (`cave_zarvane_gemlord`) | Zarvane | gemlord | canyon ↓ | 4 | 18.7, 444.3 | 133 | 119 | 70 (moriPatrols:mori-western-ridge) | 168 | PASS |
| Zarvane Gorge (`cave_zarvane_natural`) | Zarvane | common | canyon ↓ | 2 | 163.9, 454.0 | 216 | 121 | 43 (zarvane-hub-road) | 168 | PASS |
| Mutaryn's Peak (`cave_andrannor_gemlord`) | Andrannor | gemlord | mountain ↑ | 4 | 482.0, 406.9 | 25 | 113 | 21 (moriPatrols:mori-northern-flats) | 159 | PASS |
| Andrannor Ancient Gorge (`cave_andrannor_natural`) | Andrannor | ancient | canyon ↓ | 3 | 542.4, 513.6 | 214 | 113 | 22 (andrannor-hub-road) | 159 | PASS |
| Emeralix's Peak (`cave_veridan_gemlord`) | Veridan | gemlord | mountain ↑ | 4 | 860.6, 275.7 | 51 | 112 | 36 (spawn) | 181 | PASS |
| Veridan Hollow (`cave_veridan_natural`) | Veridan | common | mountain ↑ | 2 | 979.7, 356.8 | 241 | 121 | 34 (spawn) | 181 | PASS |
| Eurakeon's Deep (`cave_netharion_gemlord`) | Netharion | gemlord | canyon ↓ | 4 | 841.5, 665.2 | 287 | 120 | 18 (seerPatrols:tower-watch) | 132 | PASS |
| Netharion Ancient Gorge (`cave_netharion_natural`) | Netharion | ancient | canyon ↓ | 3 | 772.5, 739.3 | 165 | 117 | 11 (netharion-hub-road) | 132 | PASS |
| Azurel's Peak (`cave_vorashil_gemlord`) | Vorashil | gemlord | mountain ↑ | 4 | 470.6, 858.5 | 8 | 112 | 17 (spawn) | 180 | PASS |
| Vorashil Hollow (`cave_vorashil_natural`) | Vorashil | common | mountain ↑ | 2 | 474.7, 1001.3 | 178 | 69 | 41 (vorashil-hub-road) | 180 | PASS |
| Obsidius's Peak (`cave_xilnar_gemlord`) | Xilnar | gemlord | mountain ↑ | 4 | 662.8, 1164.6 | 128 | 96 | 32 (spawn) | 161 | PASS |
| Xilnar Ancient Hollow (`cave_xilnar_natural`) | Xilnar | ancient | mountain ↑ | 3 | 750.9, 1077.1 | 324 | 86 | 14 (xilnar-hub-road) | 161 | PASS |
| Ambrevon's Peak (`cave_baelgor_gemlord`) | Baelgor | gemlord | mountain ↑ | 4 | 1044.1, 1073.8 | 342 | 114 | 14 (spawn) | 139 | PASS |
| Baelgor Gorge (`cave_baelgor_natural`) | Baelgor | common | canyon ↓ | 2 | 1059.6, 1178.9 | 209 | 119 | 22 (moriPatrols:mori-southern-flats) | 139 | PASS |
| Oathane's Peak (`cave_thardin_gemlord`) | Thardin | gemlord | mountain ↑ | 4 | 1311.0, 1072.4 | 29 | 119 | 19 (spawn) | 114 | PASS |
| Thardin Gorge (`cave_thardin_natural`) | Thardin | common | canyon ↓ | 2 | 1307.4, 1157.0 | 139 | 118 | 10 (spawn) | 114 | PASS |
| Oatheus's Peak (`cave_korathen_gemlord`) | Korathen | gemlord | mountain ↑ | 4 | 1615.9, 1074.6 | 48 | 121 | 33 (spawn) | 171 | PASS |
| Korathen Hollow (`cave_korathen_natural`) | Korathen | common | mountain ↑ | 2 | 1700.6, 1177.8 | 210 | 117 | 23 (korathen-hub-road) | 171 | PASS |

## Conflicts: none
- cave_malezor_gemlord is pinned to the existing landmark `rakoron-cave` (never moved); its measured border 56 u and clearance -34 u are reported, not enforced.
## Interior validation (cave-interior.js · validate, run in game against all 20 plans)

All 20 caves pass: every floor's arrival reaches its staircase (and Floor 1 its mouth), every chamber is connected,
every staircase is continuous tread to tread (no step over 0.6 u) and ends on the next floor, every staircase stands in
the upper-left or lower-left of its plan, and every floor goes the right way (mountain ↑ · canyon ↓).

## Acceptance (§10) · status after Phase A–F V1

| Check | Status |
|---|---|
| 10 districts × (1 Gemlord + 1 natural) | PASS (manifest) |
| 10 four-floor Gemlord · 3 three-floor Ancient · 7 two-floor Common · 63 floors | PASS (manifest) |
| Ancient only in Andrannor, Netharion, Xilnar | PASS (manifest) |
| 12 mountain / 8 canyon, matching the table | PASS (manifest) |
| Footprints inside their own district with positive buffer (18 u), clear of every other coast | PASS (19 placed) · Rakoron's Ruby Cave is the existing landmark, pinned, measured 56 u |
| Placement on empty ground, preserving every protected asset and path | PASS (19) · the pinned Ruby Cave sits at the end of its own treehouse trail, as built |
| Mouths belong to a mountain or canyon wall, never flat ground | PASS (rock mass + arch on a mound / mouth in a cut back wall) |
| Mountain caves go up, canyon caves go down | PASS (validate) |
| One continuous interior per cave, real spiral staircases, no floor loading | PASS (walked in game, Floor 1 → 2 → 3 → 4) |
| Staircases upper-left / lower-left, collision-free access | PASS (validate) |
| NPCs on Floors 1–2 · Seer patrols on Floor 3 where applicable | PASS (Cave Keeper / Lantern Hermit · 3 Seers in Gemlord, 2 in Ancient caves) |
| Blockers work and a clear survives reload | PASS (boulders at the last staircase; inventory.caves.clearedObstacles) |
| Enter and exit to the correct overworld mouth | PASS (saved in inventory.caves.worldEntrance; a save made in a cave resumes at its mouth) |
| No soft-lock from generation | PASS (spanning-tree tunnels; the only gate is the smashable blockade) |
| Deterministic across restarts, compatible with old saves | PASS (stable seeds; locked placement in cave-lock.js; new save keys only) |
| Existing world, districts, landmarks, roads, combat, NPCs, saves | Regression playtested: no errors; nothing moved |

**Content still to come (Phase E, canon-driven):** each Gemlord's own Floor 4 encounter (the sanctum stands ready,
its Gemlord not yet present), wild Zyrex on Floor 2, Ancient caves' dark-Astralism Seer events beyond the raid cache,
and Seer blockades that physically hold a staircase.
