# 23 · The field survives the AstraNav

*Survey 10.19 · 2026-10-10 · Creator:*

> "pressing into the astranav should not reset overworld or fights."

## What was wrong

Opening the AstraNav tore the field down, and returning rebuilt it from the save. Every live fight ended, enemies respawned, and the party's position and damage reset.

## What changed

- **Opening the AstraNav parks the field** (`openNav` → `parked`). The live world objects (the map, the pilot, enemies, party, the camp's Aethren, fights in progress, projectiles and effects) stay in memory. Nothing is rebuilt.
- **Returning resumes it** (`resumeField`). The same objects come back, and only the screen and HUD are redrawn. The Dev Replicator is also refreshed, since its switch may have changed in SETUP.
- **Structural changes still rebuild.** Changing the base (building or restoring a facility, a ship part, a settlement) clears the parked snapshot, so the camp is rebuilt from the new save. Resetting moved objects does the same.
- `surface()` now builds the screen through `fieldScreen()`, so the HUD can be redrawn alone.

## What stays the same

The first visit to a map still builds it from scratch. Walking through a warp, landing, and boarding the ship still rebuild the map as before.
