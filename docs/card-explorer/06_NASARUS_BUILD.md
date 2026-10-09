# Aethryx Adventures: 1936 · Survey build 8 · NASARUS

How the NASARUS handoff ([05_NASARUS_CANON.md](05_NASARUS_CANON.md), Canon V1.0) is built in `/explorer/`.
Canon facts come from the handoff. Everything about facilities, costs, research and stages is an **implementation proposal** (handoff §5 and §7), kept in one data file so the Creator can change it without touching the engine: `explorer/nasarus.js` (`window.AOV_HQ`).

## Canon kept

- **NASARUS** is the stable id `nasarus`. The player may rename the planet (default NASARUS) and the astronaut (default Carl Nasaro). The canon identities stay unchanged in the Codex.
- An ancient drifting planet. Haemen and Aethren lived there before the First Eternal War.
- **Why it was abandoned is never stated**, and the abandonment is not tied to the First Eternal War. The Historical Archive says only that it is not known.
- NASARUS is a different body from AEP-28, which stays sealed.
- No NASARUS card set is assumed. NASARUS has no Aethren, peoples or card rewards of its own.
- Ruins carry plain descriptive labels only (RUINED RESIDENCES, COLLAPSED CIVIC BUILDING, MONUMENT, UNIDENTIFIED …). There are no invented settlement names, and the ancient architecture is drawn in a neutral style.
- The 1945–1955 story is untouched.

## The opening (Phase 1)

PRESS START → the Director → gender, name, kit → dossier → launch → hyperspace → **crash**: gravity capture, drive failure, impact. You come to in the wreck. The AstraNav names the world (the naming grid, defaulting to NASARUS), and the first log entry is written.

The NASARUS chain is listed first among the LOG objectives and appears as a one-line hint under the HUD:

1. Make camp on the staked ground beside the wreck (free): CAMP SHELTER + CAMP STORES.
2. Salvage SCRAP and CRYSTAL from the wreckage, outcrops and ruins.
3. Repair the drive at the wreck (SCRAP 6 · CRYSTAL 2).
4. Build the NAVIGATION CENTER. The AstraNav boots, charts the Expanse, and expeditions can depart.

Travel to any world, then come home: NASARUS sits on the chart with a gold ring, and the HQ sheet offers *Return to NASARUS*.
Phase 1 stands on its own. Nothing past the Navigation Center is required to explore the Expanse.

## The loop

**EXPLORE → EXTRACT → RETURN → CATALOG → DEVELOP**

| Material | Where it comes from |
|---|---|
| SCRAP | Wreckage on NASARUS, props and hidden finds on other worlds |
| CRYSTAL | Outcrops, minerals, crystal props |
| FIBRE | Plants and scrub |
| RELICS | Ruins on NASARUS, landmarks on other worlds |
| DATA | Aethren scans (4 for a first scan), battle wins, Haemen teaching, records |

What you extract goes into the **pack**. At NASARUS you deposit it into the **stores**. Once a Resource Depot exists, landing deposits automatically and the depot can exchange materials three for one. All costs are paid from the stores.

## Facilities (proposals)

Camp Shelter (rest and save) · Camp Stores · Navigation Center · Research Station · Resource Depot · Workshop (flares, rockfall) · Card Archive (team of four) · Restoration Terminal · Historical Archive · Habitation Zone (*future expansion*, never buildable in this build).

You build each one at its staked plot on the HQ map, or from the AstraNav's NASARUS page while you are at NASARUS.

## Research (Research Station)

Scanner Gain · Drift Survey (reveals all of NASARUS) · Inscription Comparison · Air Recycler · Suit Plating · Card Conditioning · Expedition Pack.

## Ruins and restoration

Seven sites: two in the old streets, the civic hall, the monument, the inscriptions (these need Inscription Comparison), a buried structure (excavated rather than restored), and an unidentified structure in **the Far Basin**, past a rockfall the Workshop can clear.
Surveying a ruin yields relics and data once. With the Restoration Terminal built, the ruin is restored on the map. Each step writes a line in the **Restoration Records**.

## Stages

| Stage | Name | Needs |
|---|---|---|
| 1 | Crash Site | — |
| 2 | Expedition Camp | camp, stores, navigation, research, depot |
| 3 | Established Headquarters | workshop, card archive, restoration terminal, 2 ruins restored |
| 4 | Reclaimed Settlement *(long-term)* | historical archive, the Far Basin, all 7 ruins restored |
| 5 | Emerging World *(future expansion)* | not reachable in this build |

The map changes with the stage. Lamps appear at stage 2. Camp paths and the future plot appear at stage 3. At stage 4 the old streets are mended.

## The Codex

The Living Master Codex keeps five records apart: **Master Canon**, **Player Discoveries**, **Card Inventory**, **Planetary Survey** and **Restoration Records**. The player's names for themselves and for the planet never overwrite canon.

## Saves

Save key `aov.explorer.v1`, version 3. It adds `hq` (name, built, drive, ruins, regions, store, research, records, stage) and `pack`. A build-7 save migrates with the drive repaired and the Navigation Center built, so the expedition carries on and NASARUS appears as a new headquarters to visit.

## Files

`explorer/nasarus.js` (data) · `explorer/worldgen.js` (`buildNasarus`, which rebuilds the map from saved state) · `explorer/explorer.js` (the HQ block) · `tools/explorer/build_hq_art.py` (the 27 HQ and ruin sprites, written into `art.js`).
