# 16 · Stations, the cockpit and the inventory

*Survey 10.9 · 2026-10-10 · Creator direction:*

> "we need a separate tab for inventory (all items). we also need to simplify the crafting. we should just be able to craft a workstation from materials and then access the workstation to craft machines etc. also, when we click on a structure or station, it SHOULD NOT take us to astranav. each station or structure needs its own UI for functionality. the only access point of the astranav is touchpad. even clicking the rocket should let us fly the rocket or check star map. no shortcut to AN besides touchpad"

## INVENTORY (AstraNav tab 2)

INVENTORY has six chapters:
- **ALL ITEMS:** bag and stores counted together.
- **BAG** and **STORES:** drag to arrange.
- **SHIP PARTS:** in the bag, home, or installed.
- **MACHINE PAPERS:** recovered, or where each one still lies.
- **CRAFT**

## Simplified crafting

1. **INVENTORY · CRAFT → WORKSTATION**
   - Costs scrap 4 and fibre 2, drawn from the bag first, then the stores.
   - Must be done on NASARUS. No paper is needed.
   - The Workstation then stands beside the camp.
2. **At the Workstation** (walk up, press A), build the other machines. Each needs:
   - its recovered paper;
   - materials from the stores.
3. Every built machine stands on NASARUS as a station of its own. Positions are in `core_systems.js` (`at`, `w`, `spr`):

| Machine | Its screen |
|---|---|
| Workstation | build machines; craft recall flares |
| Material Processor | refine: three of one material → one of another |
| Fuel Generator | fibre → oil (×1, ×5) |
| Rocketship Repair Station | install ship parts; building it restores the drive |
| AstraNav Terminal | the safe radius and the oil cost of every charted course |

## Every structure has its own screen

- Pressing A at a structure opens its screen over the field. ✕ LEAVE or ○ closes it.
- Facility screens:
  - **Camp Stores, Resource Depot:** materials, deposit, exchange.
  - **Research Station:** research projects, plus cloning profiles. Cloning happens only here.
  - **Workshop:** air tanks, flares, clearing the ridge, installing parts.
  - **Card Archive:** party and roster.
  - **Restoration Terminal:** restore and excavate.
  - **Historical Archive:** the archive and the records.
  - **Habitation Zone, Aethren Sanctuary:** the people.
  - **Navigation Center:** the star map console.
- The Camp Shelter still rests you.
- The AstraNav HEADQUARTERS page is now the **record**:
  - it shows everything;
  - every action happens at its station;
  - each row says which station.

## The rocket

- **Pressing A at the ship opens its screen:**
  - **FLY:** board and set course. Needs the drive and the Navigation Center.
  - **STAR MAP:** BOARD AND FLY works straight from the map.
  - Ship status: drive, navigation, oil, air, the way home, flares.
  - This works on every world.
- **Aboard, the COCKPIT is the screen**, not the AstraNav:
  - STAR MAP and SHIP tabs;
  - DISEMBARK when landed;
  - courses, orbits and landings all play out in the cockpit.

## The touchpad is the only way into the AstraNav

- The touchpad opens the AstraNav, on foot or aboard. Pressing it again closes it, back to the field or the cockpit.
- Keyboard Tab, J and M stand in for the touchpad.
- In-game shortcuts into it were removed:
  - structures, the ship and the Navigation Center's first boot;
  - the star map's HQ PAGE button (now only inside the AstraNav);
  - the AstraNav was the screen when boarding, after a recall, and on resuming aboard. The cockpit is now.

## New art

- `core_processor`: a copper hopper over a riveted drum.
- `core_repair`: a gantry crane holding an engine block.
