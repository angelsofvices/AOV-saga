# The Master Codex in Aethryx Adventures: 1936

Creator request (2026-10-10): "merge the full codex into the game now". Rulings: Codex entries **unlock as discovered**; Codex **Aethren spawn** and **humanoids are placed** in the worlds.

## Build

```
python3 tools/explorer/build_codex.py    # reads data/codex/The_AOV_Saga_Master_Codex_v16.3.xlsx + game_roster/aa1936_roster.json
python3 tools/explorer/build_fauna.py    # adds the Codex Aethren to the species table
```

| Output | What it holds |
|---|---|
| `explorer/codex_beings.js` | All 582 beings (the 1936 roster plus the Codex; Ovauron is AEP-28 and is left out). Name, kind, class, tier, types, archetype, stats, home and placement. Also `placements`: where every other Codex entry stands in the worlds. Always loaded. |
| `explorer/codex_reference.js` | Full lore, every page of WORLDS, COSMIC THEORIES, BOOKS, GAMES and the TIMELINE (56 era cards from `timeline.html`), and the 1,017-entry INDEX. Loaded only when the Codex is opened. |
| `game_roster/codex_homes.json` | Each being's home world or Zyraxis district, how it appears in game, and why. |

**Homes** are read from each being's Codex lore: the world or Zyraxis district it names most often. Older Zyrex keep their roster district. Codex Aethren with no home named live on Zyraxis, in a district set by their tier. Lore is shown without the Codex's editing notes (★ correction and reframe paragraphs, version tags).

## In the worlds

- **Aethren: everything spawns** (Creator 2026-10-10: *"include everything from codex"*). All 302 Aethren, the official 1936 roster plus 106 from the Codex, are in the wild on their home world or district, with the Codex's tier, types and stats. That includes the tier IX–X beings (mostly in Thardin and Korathen), the Elzebub → Elzimir → Elzoran → Omegoran line, and Mealux. Species from older rosters keep their ids, so cards already held still match. Wardens and vault guardians only field Aethren up to tier VIII, so the bosses stay fair.
- **People (280): everyone is alive.** Creator ruling 2026-10-10: *"non canon. no one is dead here. full saga living."* Every humanoid in the Codex is alive in 1936 and lives on their home world, including gods, Immortals, demigods and the characters the 1936 handoff had reserved. Once you've learned that world's words, talking to them unlocks their Codex entry (+3 DATA). There are no record stones any more.
- **Home worlds:** the one the lore names most often. Humanoids whose lore names no world are on **Viridia** (Creator ruling). Viridia holds 241 people, so its map grows to 185 × 141 to fit them. Any world with more than 20 people grows the same way.
- **Everything else in the Codex is in the worlds too** (Creator 2026-10-10: *"make sure all entries are placed in world… from anciuxor down to scrap. all games all books all timeline all worlds"*). Every INDEX entry that isn't a being or a world (432 of them) and every page (257) has a place on its home world. That home is the world or district its text names most often.
  - **Landmarks (54):** named places such as Ashen Fields, the Temple of Anciuxor and the Tree of Elyssia. Reaching one unlocks its entry (+1 RELIC, +4 DATA) without needing the language.
  - **Relics (16):** gems, prisms, crowns and keys (the Phoenaris Crown, the Key of Anciuxor, the Astralite Prisms). They glint on the ground, and picking one up unlocks it (+1 RELIC).
  - **Record stones (143):** concepts, rules, events, book and game pages, and timeline eras, five to a stone. Once you know that world's words, reading one unlocks every entry and page on it (+2 DATA each).
  - **Fallbacks when the text names no world:** book pages go on Viridia, game pages on Zyraxis, and everything else on **Lumeria**, the Recorder-World. Lumeria holds 95 placements, so it grows to 142 × 108.
  - On Zyraxis, entries with no district (or ones naming Malezor, the hand-built opening) are spread across the other nine districts.

## In the AstraNav · RESEARCH · MASTER CANON

| Tab | Unlocks when |
|---|---|
| BEINGS (582) | an Aethren is scanned or battled; a person is met |
| WORLDS | the world named on the page is visited (unvisited worlds stay redacted) |
| COSMIC THEORIES · BOOKS · GAMES · TIMELINE | its record stone is read in the field, or the page is decoded at NASARUS's Research Station for 4 DATA |
| INDEX (1,017) | its landmark is reached, its relic picked up or its stone read; or its subject is an unlocked being, a visited world or a learned term. Sealed entries say which world they're on once you've been there. |

**Always sealed:** Ovauron / AEP-28 under all its names (Primalutonia, the Drift Planet, AE-28), wherever it appears. Entries that only *mention* it are placed and readable, with the clause that names it blacked out (canon: AEP-28 is sealed and not described). Mealux is no longer sealed.

## For the Creator

1. **The Codex's own working notes are placed as record stones too** (for example *§5 Open Queue*, *District Content Formula*, *Rizer Academy Per District*), because the instruction was to include everything. Say if they should come out.
2. **Placement kind is read from the name** (place words → landmark, gem/relic words → relic, everything else → stone). A few may be in the wrong kind; name any to move.
3. **Some Codex lore is entirely editing notes**, so those beings show "still being written" (for example Amyra Silverstone-Veridae).
