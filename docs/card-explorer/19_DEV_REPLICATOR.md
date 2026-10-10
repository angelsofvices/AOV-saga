# 19 · DEV REPLICATOR (developer only)

*2026-10-10 · Creator:*

> "a machine that will give me x5 of any item. a dev mode machine only. players wont have access to it. turn it on and off in astranav. it will appear next to player where he spawns."

## Access

1. Open SETUP · DEVELOPER ROOM and enter the password. This sets `S.dev.access`.
2. SETUP then shows **DEV REPLICATOR · ON/OFF**. Players without developer access never see the switch, and the machine never appears for them.

The gate is client-side. It keeps players out of the way, not out of the code.

## In the field

- While the switch is ON, the Replicator stands on open floor beside the pilot on every map entered (NASARUS and every world).
- Switching it OFF removes it the next time a map is entered.
- Press A at it to open its screen:
  - **TO STORES / TO BAG:** where the items go. Stores is the default, since machines are built from the stores.
  - **MACHINE KIT:** every material the five departure machines need (scrap 36, fibre 4, crystal 14, relics 1, data 4).
  - **FULL BASE KIT:** materials for the machines, facilities, research, air tanks, suit modules, the drive and the ridge.
  - **ALL MACHINE PAPERS**, **OIL ×5**, **FLARES** (a full rack), **AIR** (full air and suit).
  - **MATERIALS ×5**, one at a time or all at once.
  - **ANY ITEM ×5:** the whole item catalog, with search. Ovauron's sealed items are never offered.

Code: `explorer.js` (`devOn`, `placeDevMachine`, `renderDevMachine`, `devKit`) and the `dev_replicator` sprite in `art.js`.
