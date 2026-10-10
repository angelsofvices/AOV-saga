# The Master Codex in Aethryx Adventures: 1936

Creator request (2026-10-10): "merge the full codex into the game now". Rulings: Codex entries **unlock as discovered**; Codex **Aethren spawn** and **humanoids are placed** in the worlds.

## Build

```
python3 tools/explorer/build_codex.py    # reads data/codex/The_AOV_Saga_Master_Codex_v16.3.xlsx + game_roster/aa1936_roster.json
python3 tools/explorer/build_fauna.py    # adds the Codex Aethren to the species table
```

| Output | What it holds |
|---|---|
| `explorer/codex_beings.js` | All 583 beings (the 1936 roster plus the Codex; Ovauron is AEP-28 and is left out). Name, kind, class, tier, types, archetype, stats, home and placement. Also `placements`: where every other Codex entry stands in the worlds. Always loaded. |
| `explorer/codex_reference.js` | Full lore, every page of WORLDS, COSMIC THEORIES, BOOKS, GAMES and the TIMELINE (56 era cards from `timeline.html`), and the 1,017-entry INDEX. Loaded only when the Codex is opened. |
| `explorer/world_canon.js` | Each world's peoples, figures, sites and region notes, plus Origon's compass (from `game_roster/world_canon.json`). Always loaded. |
| `game_roster/codex_homes.json` | Each being's home world or Zyraxis district, how it appears in game, and why. |

**Homes** are read from each being's Codex lore: the world or Zyraxis district it names most often. Older Zyrex keep their roster district. Codex Aethren with no home named live on Zyraxis, in a district set by their tier. Lore is shown without the Codex's editing notes (★ correction and reframe paragraphs, version tags).

## In the worlds

- **Aethren: everything spawns** (Creator 2026-10-10: *"include everything from codex"*). All 302 Aethren, the official 1936 roster plus 106 from the Codex, are in the wild on their home world or district, with the Codex's tier, types and stats. That includes the tier IX–X beings (mostly in Thardin and Korathen), the Elzebub → Elzimir → Elzoran → Omegoran line, and Mealux. Species from older rosters keep their ids, so cards already held still match. Wardens and vault guardians only field Aethren up to tier VIII, so the bosses stay fair.
- **People (281): everyone is alive.** Creator ruling 2026-10-10: *"non canon. no one is dead here. full saga living."* Every humanoid in the Codex is alive in 1936 and lives on their home world, including gods, Immortals, demigods and the characters the 1936 handoff had reserved. Once you've learned that world's words, talking to them unlocks their Codex entry (+3 DATA). There are no record stones any more.
- **Home worlds:** the one the lore names most often. Humanoids whose lore names no world are on **Viridia** (Creator ruling).
- **Everything else in the Codex is in the worlds too** (Creator 2026-10-10: *"make sure all entries are placed in world… from anciuxor down to scrap. all games all books all timeline all worlds"*). Every INDEX entry that isn't a being or a world (431 of them) and every page (257) has a place on its home world. That home is the world or district its text names most often.
  - **Landmarks (54):** named places such as Ashen Fields, the Temple of Anciuxor and the Tree of Elyssia. Reaching one unlocks its entry (+1 RELIC, +4 DATA) without needing the language.
  - **Relics (15):** gems, prisms, crowns and keys (the Phoenaris Crown, the Key of Anciuxor, the Astralite Prisms). They glint on the ground, and picking one up unlocks it (+1 RELIC).
  - **Record stones (143):** concepts, rules, events, book and game pages, and timeline eras, five to a stone. Once you know that world's words, reading one unlocks every entry and page on it (+2 DATA each).
  - **Fallbacks when the text names no world:** book pages go on Viridia, game pages on Zyraxis, and everything else on **Lumeria**, the Recorder-World. Lumeria holds 95 placements, so it grows to 142 × 108.
  - On Zyraxis, entries with no district (or ones naming Malezor, the hand-built opening) are spread across the other nine districts.
- **Malezor's own people live in Malezor**, on open ground beside its road: **Zurelea**, the potion maker (Creator 2026-10-10: *"humanoid from zyraxis rp7"*, added to the 1936 roster from her Codex index entry), and Warden Kelthor. Other Zyraxis people with no district named are spread across the other nine districts.

## The worlds, region by region (survey build 10.2)

Creator direction 2026-10-10: *"think bigger. full pass of world"*.

- **Every world is laid out in its named regions**, the five per world in the biome manifest (`explorer/biomes.js`). They form a compass cross with the first region in the middle, where the ship lands. Origon's ten lands sit in a 4 × 3 grid. Regions differ in terrain (seas and shallows are wetter, cliffs and peaks rockier, plains open), and the roads run out from the centre to each region.
- **Region names** appear on the HUD, as a toast on entering, and on the field sketch. Until you've learned a world's words they read REGION I–V.
- **Viridia: the five canon regions.** Northern, Eastern, Central, Southern and Western (Norell Goddhart's five-region federation), each in its own country: frost in the north, fire in the south, coast in the east, dust and canyon in the west, and the green heart in the middle. Its **50 named Viridian districts** (Codex: *"(Northern Region · Viridian District)"*) stand as landmarks in their own region.
- **Everyone and everything is placed by region.** A person, place, relic or record goes to the region (and on Viridia, the district) its own text names most often. On Viridia, 142 people are placed by region, and the 60 whose lore names a district live near its landmark. The other 99, and anything else with no region named, are spread evenly across the world's regions.
- **Lumeria's Halo Archive** keeps what no other world claims (95 Codex entries), so Lumeria grows to fit it. Each world is sized by its busiest region: Viridia is 216 × 174 and Lumeria 192 × 156.
- **Zyraxis** (Codex): each district II–X has its **shrine** (Sunlit Pillar, Broken Obelisk, Great Tree, Void Rift, Alien Landing Pad, Spirit Tree, Forge Anvil, Machine Tower, Throne Dais). Visiting all nine gives **ANCIENT GEMSIGHT** (recorded; it has no mechanic yet). The **nine district routes** (Valley of the Benevolent Beast … Fracture of the Anomaly) are marked where each road crosses into the next district.
- **Integrity checks:** nothing placed may overwrite anything else (vaults, refugee camps, landmarks, stones, people), and everything must be reachable from the ship. This is checked for all 27 worlds.

## Every world, fleshed out from the Codex (survey build 10.3)

Creator direction 2026-10-10: *"district shrine canon. gemsight reveals hidden aethren. use stuff from the codex. make sure all worlds are fleshed out like viridia and zyraxis and origon are"*.

**Source:** `game_roster/world_canon.json`, mined from the Master Codex v16.3 (the WORLDS table and sheet, the index, the pages and the beings' lore) for every world except Zyraxis and Viridia, which have their own geography. Edit it freely: `build_codex.py` reads it and writes `explorer/world_canon.js`.

Every region of every world now has:

- **A region marker** with the Codex's note for that region.
- **The camps of its peoples**, from the Codex's first races and named peoples (248 people in all), such as Lumeria's Astrums, Wizards, Witches and Dwarves, Cytherion's Mantis and Spiders, and Nexyros's Nexyrosillians. Talking to them, once you know the world's words, records them (+2 DATA).
- **Its sites (315 in all)**: the Codex's events, places, prisms and institutions (the War of Mass and Light, the Anciariic Curse, Egnellahc's Transplacement, Xymetre's Ray of Perfection, the Formation of Zoryth, and so on). Reaching one gives +1 RELIC and +4 DATA.
- **Its named figures.**
  - Codex people are moved into their region: Mykarlyth into the Enforced Devotion Citadel, the four Nexyrosillian Kings into the Four Kings Ruins, Queen Furis into the Serpent Forges.
  - Codex Aethren keep to their region, calm: Voltyran, Volcarith and Elzoran (Origon's First Family), Celestryx, Omegoran, Orivora, Krallathor and Erisimil.
  - Axis-beings with no body to meet (the Great Wing, the Great Fin, Zoryth and others) stand as a presence at a site.

**Origon** is laid out as the Codex's compass of ten lands: Desertlands NW, Crystallands N, Volcanolands NE, Darklands W, Gardenlands central-west, Riverlands central-east, Flatlands SW, Dragonlands SE, Giantlands east of the Dragonlands, Elvenlands far south. Each has its dominant race (Dragonlords, Crystalborn, Volcanids, Duneborn, Umbrakin, Verdants, Riverkin, Terrakin, Giantkin, Aetherelves).

**Zyraxis** follows the Codex's geography expansion:
- **Routes:** all **ten routes**, the tenth being the Throne of the Ultralord from Korathen to the Throne. Each route has its **Gemlord Cave**, and its Gemlord keeps to it, calm (Rakoron … Oatheus).
- **Interstitial regions:** **The Wild March** and **The Green Divide**.
- **The Bridge of Hope**, south of Baelgor and Xilnar. Canon says it opens only after the endgame; in 1936 that is when every system of the ship is restored. It leads to the Part 2 southern zones: **The Old Conquest**, **The New Conquest** and **The Pit of No Return**.
- **District Shrines** are canon (Creator 2026-10-10).

**ANCIENT GEMSIGHT** (Codex: a lens unlocked by visiting all nine district shrines; it reveals a world's hidden geography). Creator ruling: it reveals hidden Aethren.
- **Veiled Aethren:** tier IX–X and the easter-egg line (Elzebub, Elzimir, Elzoran, Omegoran, Mealux; 14 species) still spawn, but are unseen and untouchable until you hold Gemsight.
- **The lens on the live scanner:** with Gemsight, the scanner rings the veiled Aethren in violet, marks every cache no one has found, and boxes every undefeated warden.

**Left out on purpose:** the Book IX Aetherstride route and the Genesis Expedition (both come after 1936); Ultharis on Uralyx (the Codex rules he has no tie to it); and the open *Elder Prime of Nexyros* card. Queen Bellatora Rosaris is taken to be the Codex being Lady Rosaris.

## In the AstraNav · RESEARCH · MASTER CANON

| Tab | Unlocks when |
|---|---|
| BEINGS (583) | an Aethren is scanned or battled; a person is met |
| WORLDS | the world named on the page is visited (unvisited worlds stay redacted) |
| COSMIC THEORIES · BOOKS · GAMES · TIMELINE | its record stone is read in the field, or the page is decoded at NASARUS's Research Station for 4 DATA |
| INDEX (1,017) | its landmark is reached, its relic picked up or its stone read; or its subject is an unlocked being, a visited world or a learned term. Sealed entries say which world they're on once you've been there. |

**Always sealed:** Ovauron / AEP-28 under all its names (Primalutonia, the Drift Planet, AE-28), wherever it appears. Entries that only *mention* it are placed and readable, with the clause that names it blacked out (canon: AEP-28 is sealed and not described). Mealux is no longer sealed.

## For the Creator

- **Region palettes on Viridia** borrow the art of Yvoris (north), Pyrauna (south), Halcyra (east) and Nexyros (west). Viridia's own hazard and rules still apply everywhere.
- **Peoples are drawn with the shared 1936 humanoid figure, recoloured per world** (as every world's people already are). Origon's races are cosmic lineages, not humanoids, so they need their own sprites.
- **Thin worlds:** the Codex names no individuals on Halcyra, Wyvera, Elythera, Pyrauna or Quorauna, so those have peoples and sites but no named figures.

*The Codex's own working notes stay in the game as record stones* (Creator 2026-10-10: keep them).


1. **Placement kind is read from the name** (place words → landmark, gem/relic words → relic, everything else → stone). A few may be in the wrong kind; name any to move.
2. **Some Codex lore is entirely editing notes**, so those beings show "still being written" (for example Amyra Silverstone-Veridae).
