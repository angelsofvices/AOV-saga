# 15 · Chapters, machine papers and the sandbox

*Survey 10.8 · 2026-10-10*

## Chapter tabs

Long AstraNav panels now show one chapter at a time, so the screen isn't packed.

- **`chapterize(host, key, want, dflt)`** (`explorer/explorer.js`):
  - turns each direct `<section>` (with an `<h3>`) of a panel into a tab;
  - the tab label is the h3 text and its `<b>` is the badge;
  - sections with the same `data-chap` share one tab;
  - the open tab is remembered per panel for the session;
  - `want` (a section id) or `dflt` picks the tab otherwise.
- **JOURNAL:**
  - MISSION: the three goals, the next objective and a progress card for each log; tap a card to open that log;
  - THE STORY: the expedition chapters;
  - three logs of objectives:
    - **I · THE CRASH SITE**
    - **II · FIRST STEPS**
    - **III · THE WAY HOME**
  - EXPEDITIONS.
- **RESEARCH:**
  - each section is a tab: Bag, Stores, Equipment, Cards, Item Catalog, Master Canon, Living Master Codex;
  - inside the Living Master Codex, each set is a tab of its own.
- **COMPANIONS:**
  - PROFILES · READY TO CLONE;
  - PARTY & ROSTER, kept together so drag and drop still works between the two.
- **HEADQUARTERS** keeps its existing fold-open sections.

## Machine papers

The five NASARUS recipe papers are physical sheets lying on the ground of NASARUS, spread across the base:

| Paper | Where it lies |
|---|---|
| Workstation | in the crash scar, south-west of the wreck |
| Material Processor | among the Ruined Residences, to the north |
| Fuel Generator | out on the southern flats, east of the old monument |
| Rocketship Repair | blown west on the crash, toward the Damaged Inscriptions |
| AstroNav Terminal | north-east, below the Collapsed Civic Building |

- Each recipe in `core_systems.js` carries `world`, `at` and `where`. The engine settles each paper on the nearest open floor tile.
- Each sheet is a small rectangle drawn flat on the floor, smaller than the pilot.
- Walk over it, or face it and press A, to pick it up.
- HEADQUARTERS · CORE SYSTEMS says where each unrecovered paper lies.

## Grab, drag, set

- **□** (keyboard **C**, the touch **MOVE** button) lifts the movable thing you face:
  - props, boulders, plants, trees, crystals and wreckage;
  - HEADQUARTERS stations.
- What you carry rides in front of you as you walk. A green box means it can be set there; red means no room.
- **□** again sets it. **○** while carrying puts it back where it was.
- Moves are saved per map (`S.moved`) and replayed whenever the map is built.
- What was already harvested from an object stays harvested when you move it.
- Not movable: the ship, carved records, landmarks, vaults and the rubble gate.
- This is the base for sandbox building and for later puzzles that need things moved.
