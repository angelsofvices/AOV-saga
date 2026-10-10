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

- **Aethren: everything spawns** (Creator 2026-10-10: *"include everything from codex"*). All 302 Aethren, the official 1936 roster plus 106 from the Codex, are in the wild on their home world or district, with the Codex's tier, types and stats. That includes the tier IX–X beings (mostly in Thardin and Korathen), the Elzebub → Elzimir → Elzoran → Omegoran line, and Mealux. Species from older rosters keep their ids, so cards already held still match. Wardens and vault guardians only field Aethren up to tier VIII, so the bosses stay fair.
- **People (280): everyone is alive.** Creator ruling 2026-10-10: *"non canon. no one is dead here. full saga living."* Every humanoid in the Codex is alive in 1936 and lives on their home world, including gods, Immortals, demigods and the characters the 1936 handoff had reserved. Once you've learned that world's words, talking to them unlocks their Codex entry (+3 DATA). There are no record stones any more.
- **Home worlds:** the one the lore names most often. Humanoids whose lore names no world are on **Viridia** (Creator ruling). Viridia holds 241 people, so its map grows to 185 × 141 to fit them. Any world with more than 20 people grows the same way.

## In the AstraNav · RESEARCH · MASTER CANON

| Tab | Unlocks when |
|---|---|
| BEINGS (582) | an Aethren is scanned or battled; a person is met |
| WORLDS | the world named on the page is visited (unvisited worlds stay redacted) |
| COSMIC THEORIES · BOOKS · GAMES | a page is decoded at NASARUS's Research Station for 4 DATA |
| INDEX (1,017) | its subject is an unlocked being, a visited world, or a term Carl has learned |

**Always sealed:** Ovauron / AEP-28, wherever it appears (canon: AEP-28 is sealed and not described). Mealux is no longer sealed.

## For the Creator

1. **Some Codex lore is entirely editing notes**, so those beings show "still being written" (for example Amyra Silverstone-Veridae).
