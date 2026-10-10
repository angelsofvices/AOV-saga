# The Master Codex in Aethryx Adventures: 1936

Creator request (2026-10-10): "merge the full codex into the game now". Rulings: Codex entries **unlock as discovered**; Codex **Aethren spawn** and **humanoids are placed** in the worlds.

## Build

```
python3 tools/explorer/build_codex.py    # reads data/codex/The_AOV_Saga_Master_Codex_v16.3.xlsx + game_roster/aa1936_roster.json
python3 tools/explorer/build_fauna.py    # adds the Codex Aethren to the species table
```

| Output | What it holds |
|---|---|
| `explorer/codex_beings.js` | All 582 beings (the 1936 roster plus the Codex; Ovauron is AEP-28 and is left out). Name, kind, class, tier, types, archetype, stats, home and placement. Always loaded. |
| `explorer/codex_reference.js` | Full lore, every page of WORLDS, COSMIC THEORIES, BOOKS and GAMES, and the 1,017-entry INDEX. Loaded only when the Codex is opened. |
| `game_roster/codex_homes.json` | Each being's home world or Zyraxis district, how it appears in game, and why. |

**Homes** are read from each being's Codex lore: the world or Zyraxis district it names most often. Older Zyrex keep their roster district. Codex Aethren with no home named live on Zyraxis, in a district set by their tier. Lore is shown without the Codex's editing notes (★ correction and reframe paragraphs, version tags).

## In the worlds

- **Aethren (102 from the Codex).** They spawn wild on their home world or district, with the Codex's tier, types and stats. Species from older rosters keep their ids, so cards already held still match. Tier IX and higher never spawn.
- **People (26).** Undated mortal humanoids live on their home world. Once you've learned that world's words, talking to them unlocks their Codex entry (+3 DATA).
- **Records (71 figures on 18 stones).** Dated historical figures (their lore gives CE/BCE/Bya years) are carved on record stones on their home world, four to a stone. Reading a stone unlocks them (+2 DATA each). They are not shown as living people in 1936.
- **Codex only (183).** Gods, Immortals and demigods; names the 1936 canon handoff reserves (02_CARL_NASARO…); and humanoids whose lore names no world. They stay sealed for now.

## In the AstraNav · RESEARCH · MASTER CANON

| Tab | Unlocks when |
|---|---|
| BEINGS (582) | an Aethren is scanned or battled; a person is met; a figure is read on a record |
| WORLDS | the world named on the page is visited (unvisited worlds stay redacted) |
| COSMIC THEORIES · BOOKS · GAMES | a page is decoded at NASARUS's Research Station for 4 DATA |
| INDEX (1,017) | its subject is an unlocked being, a visited world, or a term Carl has learned |

**Always sealed:** Ovauron / AEP-28 and Mealux, wherever they appear (canon: AEP-28 is not described; Mealux is a hidden trace).

## For the Creator

1. **159 humanoids have no home world in their lore.** Many are Viridian figures from regions such as Auroravale and Shiverreach. Give them worlds and they can be placed.
2. **Timeline:** the 26 living people were chosen because their lore has no date. Each still needs a check that they are alive in 1936. The list is in `game_roster/codex_homes.json` (`place: "npc"`).
3. **Some Codex lore is entirely editing notes**, so those beings show "still being written" (for example Amyra Silverstone-Veridae).
