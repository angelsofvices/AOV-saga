# 21 · Ship levels, the pilot's level and Aethren upgrades

*Survey 10.17 · 2026-10-10 · Creator:*

> "ship can be built 5 levels. level 1 gets you to the first 7 planets closest to nasarus (25% max fuel). scale up to all planets by level 4 (100% max fuel). level 5 gets you back to hyperspace (125% max fuel). each level gate should take longer to reach. scale all functions of game to leveling up ship to level 5. ship and player will get their own level up meters in the astranav under a new UPGRADES tab. athren upgrades will exist in the companions tab. level 0 to level 1 happens before taking off from nasarus for the first time. easiest level up gate. basic mechs of game explored here on home planet."

## Ship levels (data: `explorer/core_systems.js` · `shipLevels`)

| Level | Name | Reach | Tank | Gate (the numbers are proposals) | Build cost |
|---|---|---|---|---|---|
| 0 | GROUNDED | — | 0 % | the crash | — |
| 1 | LIFT-OFF | 7 nearest worlds | 25 % | make camp · craft the Workstation · 4 papers · all 5 machines · Navigation Center · make oil | — |
| 2 | SHORT HOPS | 14 | 50 % | pilot 3 · 2 worlds · 2 parts · 6 scans · 1 clone · 3 ruins · HQ stage 2 | scrap 20 · crystal 10 · data 6 |
| 3 | LONG RANGE | 21 | 75 % | pilot 6 · 6 worlds · 7 parts · 4 battles · 4 peoples · 1 refugee group · 2 restored · stage 3 | scrap 45 · crystal 25 · relics 4 · data 15 |
| 4 | THE WHOLE EXPANSE | all 27 | 100 % | pilot 10 · 12 worlds · 14 parts · 10 battles · 8 peoples · 4 restored · 2 settled · stage 4 | scrap 90 · crystal 50 · relics 10 · data 30 · terra 20 |
| 5 | HYPERSPACE | all 27 | 125 % | pilot 14 · all 27 worlds · all 27 parts · 14 peoples · 7 restored · stage 5 | scrap 150 · crystal 90 · relics 20 · data 60 · terra 40 |

- **Gate size grows** each level: 13 → 19 → 33 → 64 → 94 total steps. Level 1 asks only for the home-planet basics.
- **Building a level:** the Rocketship Repair Station shows the next gate with a meter per requirement. Its button reads COMMISSION THE SHIP (level 1) or BUILD SHIP LEVEL n.
- **Reach:** worlds are ranked by distance from NASARUS, in rings of 7 / 7 / 7 / 6. Out-of-reach courses are refused, and the message names the level needed. The star map sheet shows REACH and FUEL for each world, and the AstraNav Terminal lists every world with the level it needs.
- **Fuel:** a course costs fuel in proportion to its distance. The 7th-nearest world costs 25 %, the 14th 50 %, the 21st 75 %, and the farthest 100 %. So everything a level reaches fits in its tank from NASARUS. The flight home is free. REFUEL (1 OIL = 20 %) stops at the level's tank size.
- **Level 5:** with a full 125 % tank, HYPERSPACE appears on the rocket and in the cockpit. The jump shows THE WAY HOME and records `S.flags.hyperspace`.
- **Older saves:** a pilot who has already flown starts at level 1, plus every later gate already met (up to 4).

## The pilot's level (UPGRADES tab)

- **XP is counted from the record itself:**

  | Source | XP |
  |---|---|
  | each scan | 10 |
  | each battle won | 15 |
  | each people met | 25 |
  | each companion | 20 |
  | each world visited | 40 |
  | each ship part | 50 |
  | each ruin surveyed | 15 |
  | each ruin restored | 30 |
  | each machine | 20 |
  | each research project | 15 |
  | each facility | 10 |
  | each Codex entry | 4 |
  | each new item | 2 |

- **Levels:** level n needs 40·(n−1)·n XP. That puts level 3 at 240, 6 at 1,200, 10 at 3,600 and 14 at 7,280.
- **Perks:** each level adds AIR +3 and suit damage −2 % (capped at 30 %).
- **Gates:** ship levels 2–5 ask for pilot levels 3, 6, 10 and 14.

## UPGRADES tab (AstraNav, tab 3)

The tab has three chapters:
- **SHIP LEVEL:** five level cards, the next gate with its meters, and its cost.
- **PILOT LEVEL:** an XP meter, perks, and how XP is earned.
- **AETHREN:** the cap and each companion's level.

## Aethren upgrades (COMPANIONS · UPGRADES)

- **The cap** follows the ship's level: 15 / 25 / 40 / 60 / 80 / 100 for ship levels 0–5. Battles and training both stop at it.
- **TRAIN +1 LV** costs DATA (2 + level) and CRYSTAL (level ÷ 5), paid from the stores. Each companion shows its XP meter.

## The Journal

- SHIP LEVEL 1 is an objective in log I, placed just before the first departure.
- Ship levels 2–4 are objectives in logs II and III.
- The main objective now reads **SHIP LEVEL x / 5**.

## Dev Replicator

The Dev Replicator gains three buttons: SHIP +1, PILOT XP +500 and TANK FULL.
