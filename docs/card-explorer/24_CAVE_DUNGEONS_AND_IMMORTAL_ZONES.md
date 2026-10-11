# 24 · Cave dungeons and Immortal Zones

*Survey 10.20 · 2026-10-11 · Source: "AA:1936 — Cave Dungeons & Immortal Zones · Planetary Dungeon System V1.0"*

## What is in the build

- **One cave mouth per planet** (worlds 1–27). It is a rock tile on the edge of open ground, reachable from the ship, one open side only, and never next to another landmark (`worldgen.js` · `placeDungeon`).
- **The cave is a 2D side-scroller** (`worldgen.js` · `buildCave`, `explorer.js` · `updateSide`):
  - 170–250 cells long, 16 tall, one level per planet;
  - floor with pits, single-tile ledges, spikes, loot, and enemies every 26–36 cells;
  - a door at the far end.
- **Controls:**

  | Action | Keyboard | Pad |
  |---|---|---|
  | Left / right | arrows | D-pad or stick |
  | Jump | Z, Enter or Space | ✕ |
  | Attack | X | ○ |
  | Interact (the far door, or climb out at the mouth) | C | □ |
  | Climb out at the mouth | ▲ while at the start | ▲ |

- **Pits** drop you to your last safe ground for 10 suit. **Spikes** cost 8 suit. **Enemies** hit for 3 to 12 suit, depending on kind and level. **Suit at zero** carries you back to the mouth with 40% suit.
- **The AstraNav is closed inside a cave.** Opening the cave parks the overworld, so climbing out restores it exactly as you left it, enemies and all.
- **The Immortal Zone** (`worldgen.js` · `buildImmortal`) is a secret top-down region of the planet:
  - a deity marker at the centre, in a clearing;
  - up to three rare Aethren from the planet's tier 3–8 species, calm enough to scan;
  - up to four **ancient caches** (relics, data, and a rare find, once each);
  - **THE WAY OUT**, which returns you to the cave mouth.
- **Persistence:** the first time through charts the zone (`S.iz[no]`) and shows CHARTED on that planet's star-map sheet. Afterwards the mouth offers GO TO THE IMMORTAL ZONE directly. The cave stays replayable for loot and combat.
- **Deity:** the marker reads "its name, its nature and how it meets the Expanse are not yet written in the canon", and it is recorded for the Creator. No deity is named or given behaviour.

## Not yet in the build

- **Party in caves:** the pilot goes alone. Companions stay on the overworld.
- **Use Item in caves:** not wired.
- **Recipe papers and Ancient Artifacts in caves:** the cave's loot is materials only. Only the Immortal Zone caches give the rare finds.
- **Planet-specific caves:** every cave uses the same generator and palette. The environment directions in the design doc (lava tunnels, root networks, frozen caves, and so on) are not applied yet.
- **Deity encounters:** nothing yet beyond the record. Friendly, neutral or hostile behaviour is waiting on canon.
- **NASARUS:** no dungeon. Its deity and Immortal Zone arrangements have not been set.
- **Immortal Zone terrain:** each zone is a generic region of its planet, not a designed map.

## Design choices

- **Enemies** come from the same five canon groups as the overworld, at the world's level.
- **Progression** follows the world's level, and so the far planets are harder. Actual travel order, not the planet number, sets the difficulty.
- The **permanent unlock** follows the design doc's recommendation.
