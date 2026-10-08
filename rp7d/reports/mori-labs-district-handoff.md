# Mori Labs and District Data Patch

Build Lab now offers NPC base and Mori. Mori keeps its own face, claws, rags and animations. Height, weight and individual body sliders are saved in named templates and JSON exports. Save a variant to playable characters, then select it in Skin Lab to edit its nine Mori material groups. Each named variant stores its own colors; exports can be reloaded independently.

The supplied world-data.js is installed unchanged in rp7d/world-data.js and the active developer/world-data.js. The original active data is backed up as world-data.old.js in both locations. The supplied handoff and verifier are installed in rp7d. rp7b.html was not edited.

## Seers changes

- Mori routes with mode daemon use the existing Black Daemon model, crimson details, animations and stats. Missing mode, wander and drainer keep the current Mori behavior.
- The original family/id hash still controls radial density. Routes must remain on district land and outside the 44-unit ring around enemyHomeTile.
- Enemy instances use district levels for Mori, Daemons, Seer grunts and marked commanders. Missing/null levels keep the existing fallback.
- Worlds with district levels use their route-defined Daemon population; additional random Daemon scatter is disabled. Malezor has no ambient Daemons. Legacy worlds without levels keep the old scatter.
- The existing world map/empty-terrain renderer uses a compatibility adapter for the new data fields. No new district buildings, NPC worlds or hunting rules were added.

## Counts

These are patrol routes that pass coast, home ring and density checks. They exclude procedural wild packs and Crept/Skellor scatter. No detailed scenes were added for districts II-X; interactive gameplay was not tested. Live terrain/water filtering remains in createSeers.

| District | Seer | Mori | Daemon |
|---|---:|---:|---:|
| Malezor | 7 | 6 | 0 |
| Zarvane | 4 | 5 | 1 |
| Andrannor | 3 | 5 | 3 |
| Veridan | 4 | 3 | 2 |
| Netharion | 3 | 2 | 3 |
| Vorashil | 3 | 3 | 3 |
| Xilnar | 3 | 3 | 3 |
| Baelgor | 4 | 2 | 3 |
| Thardin | 4 | 3 | 4 |
| Korathen | 4 | 4 | 4 |

The supplied verifier lists configured routes before density filtering. Its larger Seer/Mori counts are expected.

## Supplied verification output

```text
(node:25576) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/mctherockstar/Documents/Claude/Projects/the%20AOV%E2%84%A2%20%20saga/rp7d/world-data.js is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/mctherockstar/Documents/Claude/Projects/the AOV™  saga/rp7d/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
· canon names, order, Gemlords
· patrols: on their own land, clear of the home tile, density live
  ! malezor mori mori-east-flats point (288.0, -28.0) is off Malezor's coast (hand-placed, left as is)
  ! malezor mori mori-south-lowlands point (-192.0, 234.0) is off Malezor's coast (hand-placed, left as is)
  ! malezor mori mori-south-lowlands point (-132.0, 254.0) is off Malezor's coast (hand-placed, left as is)
  I    Malezor     49 patrol points · 8 seer · 6 mori · 0 daemon
  II   Zarvane     35 patrol points · 4 seer · 5 mori · 1 daemon
  III  Andrannor   43 patrol points · 4 seer · 5 mori · 3 daemon
  IV   Veridan     39 patrol points · 4 seer · 5 mori · 2 daemon
  V    Netharion   43 patrol points · 4 seer · 5 mori · 3 daemon
  VI   Vorashil    43 patrol points · 4 seer · 5 mori · 3 daemon
  VII  Xilnar      43 patrol points · 4 seer · 5 mori · 3 daemon
  VIII Baelgor     43 patrol points · 4 seer · 5 mori · 3 daemon
  IX   Thardin     47 patrol points · 4 seer · 5 mori · 4 daemon
  X    Korathen    47 patrol points · 4 seer · 5 mori · 4 daemon
· Z traversal: every step centre → centre is on land
  malezor → zarvane  ✓  The Valley of the Benevolent Beast
  zarvane → andrannor  ✓  The Choir of the Pearlord
  andrannor → veridan  ✓  The Wilds of the Citrinehowl
  veridan → netharion  ✓  The Verge of the Emeraldbloom
  netharion → vorashil  ✓  The Rift of the Amethyst Voice
  vorashil → xilnar  ✓  The Skylanes of the Sapphirebroker
  xilnar → baelgor  ✓  The Threshold of the Onyxwhisper
  baelgor → thardin  ✓  The Roads of the Amberchain
  thardin → korathen  ✓  The Fracture of the Anomaly
· Malezor regression against rp7d/world-data.old.js
  ✓ Malezor identical (data, quarters, district, sections)

all checks passed
```

## Model and spawn checks

```text
DISTRICT PATROL SPAWNS (coast, home ring and density applied; excludes generated wild packs/scatter):
Malezor    7 Seer · 6 Mori · 0 Daemon
Zarvane    4 Seer · 5 Mori · 1 Daemon
Andrannor  3 Seer · 5 Mori · 3 Daemon
Veridan    4 Seer · 3 Mori · 2 Daemon
Netharion  3 Seer · 2 Mori · 3 Daemon
Vorashil   3 Seer · 3 Mori · 3 Daemon
Xilnar     3 Seer · 3 Mori · 3 Daemon
Baelgor    4 Seer · 2 Mori · 3 Daemon
Thardin    4 Seer · 3 Mori · 4 Daemon
Korathen   4 Seer · 4 Mori · 4 Daemon
[rp7d] wild packs: 0 Seer handlers · 0 Mori
[rp7d] scattered Crept: 0
[rp7d] scattered Skellor: 0
PASS · real createSeers builds a Daemon for the temporary mode override; canonical Malezor stays unchanged.
PASS · Mori base, native face, height/weight, animations/hitboxes, template round-trip, playable entry and isolated Skin Lab colors.
all patch checks passed
(node:25570) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/mctherockstar/Documents/Claude/Projects/the%20AOV%E2%84%A2%20%20saga/rp7d/assets/anims/library.js is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/mctherockstar/Documents/Claude/Projects/the AOV™  saga/rp7d/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
```

The temporary Malezor mode override was applied only to an in-memory copy. The installed Malezor patrols remain unchanged. All checks above ran against actual local GLBs and animation files. Interactive gameplay was not tested.

The rebuilt playtest is dist/RP7D_Malezor_Playtest.html. Its companion audio folder remains in dist/assets/audio.
