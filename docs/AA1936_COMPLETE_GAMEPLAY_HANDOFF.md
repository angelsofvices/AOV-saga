# AA:1936 — Complete Gameplay Systems Handoff

**Project:** The AOV™ Saga  
**Game:** Aethryx Adventures: 1936  
**Version:** Gameplay Architecture V1.0  
**Status:** Creator-confirmed canon, with proposals and undecided details labeled

## 1. Overview

AA:1936 is a mobile-first, top-down 2D planetary exploration, crafting, building, research, and companion-combat sandbox. Carl Nasaro, an ordinary American astronaut, scientist, and pilot, crash-lands on NASARUS after a classified experimental hyperspace mission originating in Earth orbit in 1936. NASARUS is an ancient drifting planet with abandoned pre-First Eternal War Haemen and Aethren ruins. It is **not AEP-28**. Its abandonment and displacement remain unexplained.

Carl explores NASARUS, builds his first machines from items found on the planet, restores his rocketship, and ventures into the Aethryx Expanse. NASARUS remains his persistent homeworld and headquarters. The broader game is a living, expandable playable encyclopedia of The AOV™ Saga; player-built bases and individual experiences are not automatically canon.

## 2. NASARUS Sandbox Rules

- NASARUS is a fully open planetary homeworld sandbox; players can build anywhere placement is valid.
- Natural ground, mountains, cliffs, vegetation, and other natural features are fixed and immovable. Do not implement free terrain reshaping.
- Manmade constructions, including ancient manmade objects, can be rearranged. Detailed relocation constraints remain undecided.
- Dedicated **Build Mode** is the central setup and management interface for machines, workstations, facilities, structures, cloning, research, and production. Normal gameplay operates what Build Mode establishes.
- Persistent bases, rocketship storage, and progression must survive travel and supported updates.
- Foundational rule: game functions arise from physical machines, stations, crafted items, and manual/automatic setups—not arbitrary menu-only unlocks.

## 3. Ten Item Classes and Aethren

| # | Class | Creator-approved responsibility |
|---|---|---|
| 1 | Materials | Create Machines |
| 2 | Machines | Perform gameplay functions |
| 3 | Enhancements | Improve efficiency and performance |
| 4 | Remedies | Produce healing and recovery solutions |
| 5 | Proficiency | Automate Machines |
| 6 | Artifacts | Provide ancient knowledge and research discoveries |
| 7 | Technology | Produce Proficiency items |
| 8 | Utilities | Enable exploration and practical fieldwork |
| 9 | Structures | Establish facilities and infrastructure |
| 10 | Astralites | Enhance the player directly and unlock extraordinary abilities |

**Aethren** are the eleventh core gameplay mechanic, living creatures rather than an item class. The long-term item catalog targets 1,000+ distinct items; the existing detailed item registry must be preserved and reconciled later rather than replaced with invented entries.

### Confirmed dependencies

- **Materials → Machines**: materials are used to construct machines.
- **Machines → Functions**: machines physically perform crafting, processing, and other tasks.
- **Technology → Proficiency → Machine Automation**: Technology produces Proficiency items; Proficiency automates machines.
- **Enhancements → Performance**: improves equipment or machine efficiency; not the same as automation.
- **Astralites → Treated Serum → Intravenous Injection → Carl's New Ability**.

Other class-to-class manufacturing recipes are proposals until approved.

## 4. Resources, Inventory, and Recipes

- Starting foundational resources include **Scrap**, **Fibre**, and **Terraform**, abbreviated **Terra**.
- **Fibre → Fuel Generator → Oil**. Oil fuels the rocketship. Exact conversion ratios and timing are not established.
- Carl carries collected resources in a portable **Bag**; the rocketship supplies persistent storage and transport.
- Crafting recipes exist as physical papers scattered across exploration locations such as ruins and caves. Discovering a paper permanently registers its recipe in Carl's **Journal**.
- A recipe must be discovered before crafting, even if the required resources are already in the Bag.
- The Journal is distinct from AstroNav's Aethren species encyclopedia.
- Proposed industrial loop: collect → refine → craft machines → improve/automate → expand production.

## 5. The First Five Machines — NASARUS Departure Gate

**Creator-confirmed:** Carl must construct all five starter machines using items, components, and recipe papers discovered on NASARUS after crash-landing. Only then does the first interplanetary departure become available, provided the rocketship is operational and fueled. No other planet's resources may be necessary for this opening sequence.

| Order | Starter machine | Function |
|---|---|---|
| 1 | **Workstation** | Initial crafting and assembly |
| 2 | **Material Processor** | Refine eligible raw resources into manufacturing components |
| 3 | **Fuel Generator** | Convert Fibre into Oil |
| 4 | **Rocketship Repair Station** | Repair the damaged rocketship using salvage and components |
| 5 | **AstroNav Terminal** | Establish navigation connections and provide an upgradeable connection radius |

The Workstation and Fuel Generator were established first; the other three were proposed and subsequently incorporated into the Creator's five-machine departure requirement. Exact machine recipes, ingredient counts, discovery coordinates, and interfaces are undecided.

### Opening chapter sequence

1. **1936 hyperspace accident:** experimental flight from Earth orbit ends in a crash on NASARUS.
2. **Explore:** Carl leaves the wreck and collects Scrap, Fibre, Terra, salvage, and other necessary items.
3. **Discover:** physical recipe papers reveal how to construct equipment and machines.
4. **Build:** Carl constructs the Workstation, Material Processor, Fuel Generator, Rocketship Repair Station, and AstroNav Terminal.
5. **Restore:** he repairs the rocketship and produces Oil.
6. **Depart:** with all five machines constructed and the ship operational and fueled, Carl begins interplanetary exploration under the AstroNav and Oil travel rules.

## 6. The 27 Planets and Unique Resources

**Creator-confirmed:** every planet has unique resources. Exploring reachable planets yields resources that expand crafting, machine construction, research, infrastructure, and upgrades back on NASARUS.

Working 27-planet list: Origon, Lumeria, Draevos, Arborynth, Thallassar, Pyrauna, Quorauna, Cytherion, Zyraxis, Myraclese, Bellatora, Yvoris, Kyrathos, Nexyros, Jynaera, Sylvanir, Velkryn, Ignara, Ultharis, Halcyra, Wyvera, Rhyzor, Elythera, Xylos, Gravaron, Ferros, Viridia.

**Canon reconciliation flag:** a later definitive handoff specifies **Uralyx** instead of Ultharis for planet 19 and leaves **Ferros/Ferralis** unresolved. Do not silently finalize these conflicts.

Planet-specific resource catalogs, actual distances from NASARUS, and visit order are undecided. Planet numbers are not automatically AstroNav distance order.

## 7. Rocketship Travel — Two Interdependent Systems

**Creator-confirmed:** both **Oil** and **AstroNav connection radius** govern space travel.

### Oil

- Oil is produced from Fibre using the Fuel Generator.
- Oil is consumed during travel.
- Oil availability affects whether Carl can safely complete a journey.

### AstroNav connection radius

- AstroNav is an upgradeable physical machine.
- Its connection radius is measured outward from NASARUS, the home base.
- Upgrading AstroNav expands reliable navigation connections and brings additional planets into normal range.
- **Important supersession:** an earlier design described out-of-radius travel as completely impossible. The Creator later established that Carl **can fly beyond the radius**, but loses reliable AstroNav connection and faces serious hazards. Implement the later rule.

### Travel states

| State | AstroNav interface | Oil drain | Result |
|---|---|---|---|
| Inside connection radius | Clear/stable | Normal | Reliable navigation |
| Outside connection radius | Static/interference | Faster than normal | Dangerous navigation and fuel risk |
| Out of Oil and stranded in space | Critical failure | No usable fuel | **GAME OVER** |

- As Carl goes out of range, the UI becomes **static-filled/glitchy**.
- Out-of-range travel consumes Oil **faster**.
- If fuel depletion causes the ship to drop and become stranded in space, **Game Over**.
- AstroNav upgrades increase the area where navigation is stable and Oil drains at its normal rate.
- Exact distance units, upgrade levels, consumption formulas, static intensity, return-trip handling, emergency mechanics, and save consequences are **undecided**. Do not invent a rescue mechanic or fuel multiplier as canon.

**Travel loop:** explore connected planets → obtain unique resources → return to NASARUS → craft/upgrade AstroNav → reach farther planets → repeat, while manufacturing enough Oil.

## 8. Astralite Matrix and Carl's Serum Progression

**Definitive Saga canon:** the Astralite Matrix comprises **63 Astralites: 9 families × 7 tiers**. This supersedes the older “45 discovered / 200+ theorized” framework. Each Astralite has its **own resonance**. Its resulting serum effect must be grounded in its actual Macro Book description; do not invent arbitrary powers.

| Axis | Family | Foundational name |
|---|---|---|
| Ax-1 | Creation / Origin | Aethryxeon / Prime Gas |
| Ax-2 | Past / Memory | Mnemos Core |
| Ax-3 | Destruction / Release | Pyroclast |
| Ax-4 | Mind / Thought | Cognara |
| Ax-5 | Present / Balance | Viridion |
| Ax-6 | Preservation / Endurance | Fortaris |
| Ax-7 | Body / Form | Corporex |
| Ax-8 | Future / Systems / Building | Synthara |
| Ax-9 | Spirit | Astryx Soul |

**Authoritative descriptions:** https://angelsofvices.com/macrobook (Part 07, 63 Astralites). The Creator will detail the individual entries later.

### Serum procedure — confirmed

1. Discover an Astralite.
2. Treat/process that Astralite with appropriate in-world equipment.
3. Produce a serum preserving its distinct resonance.
4. Carl **injects the serum into his veins**.
5. The serum unlocks an ability consistent with the Astralite's resonance and Astrafication lore.

Carl begins as an ordinary Earth human and becomes the **first superhuman tied to Earth** through this process. This predates Earth's later public Mutagenesis Era. Proposed equipment includes an Astralite Treatment Station and Serum Laboratory, but their final form, recipe, biological effects, risks, compatibility, and 63 individual powers remain undecided.

## 9. Aethren Companion Loop

- Explore and scan **different individual wild Aethren**. Repeated scans of the same individual do not count again.
- After enough unique scans, unlock a **digital species card** in AstroNav. Higher tiers may need more scans; exact thresholds are undecided.
- The card is an encyclopedia unlock, **not** a companion grant.
- At NASARUS, use a physical **Cloning Machine** and an unlocked species card to create a living owned Aethren.
- Up to **nine active cloned Aethren** accompany Carl visibly and automatically defend/fight in real-time combat.
- The Cloning Machine is not required among the first five starter machines.
- Aethren may support exploration beyond combat in future proposals, but no specific field ability is approved yet.

## 10. Interconnected Economy and Playstyles

Proposed cyclical gameplay networks (implementation details require approval):

- **Industrial:** Materials → Machines → Technology → Proficiency → automated production → additional Materials.
- **Exploration:** Utilities → exploration → Artifacts/recipe papers → discoveries → better Utilities.
- **Homeworld:** Materials → Machines/Structures → facilities → expanded manufacturing → further building.
- **Aethren:** exploration → individual scans → species card → clone → companions → more exploration.
- **Research:** Artifacts → analysis → discoveries → new equipment and further fieldwork.
- **Survival:** Materials → Remedies/Enhancements → expedition readiness → additional resources.
- **Astralite:** discovery → treatment → serum → injection → resonance-based abilities → new exploration opportunities.
- **Interplanetary:** reachable planets → unique resources → NASARUS production → AstroNav upgrades → expanded safe travel radius.

Flexible playstyle emphases: Industrialist, Explorer, Architect, Researcher, Aethren Collector, Adventurer. These are not rigid classes.

Automation begins with manual machine operation and advances through Technology-produced Proficiency items. Multi-machine logistics and fully connected production networks are proposals, not locked canon. Automation does not create free resources or bypass recipe discovery.

## 11. Critical Implementation Constraints

1. The five-machine opening must be solvable entirely with NASARUS discoveries.
2. The first departure is gated by building the five machines, restoring the ship, and obtaining fuel.
3. Recipes require physical paper discovery before crafting.
4. Machines are actual in-world equipment; Build Mode sets them up.
5. Natural terrain is fixed; manmade objects can be rearranged.
6. Every planet has unique resources, but the individual inventories are TBD.
7. AstroNav range is **safe connection range**, not a hard invisible wall.
8. Beyond range, AstroNav becomes static-filled and Oil drains faster.
9. Running out of Oil and becoming stranded in space is **Game Over**.
10. AstroNav connection radius expands through AstroNav upgrades.
11. Technology makes Proficiency; Proficiency automates Machines; Enhancements improve performance.
12. Astralites directly enhance Carl only after treatment, serum creation, and intravenous injection.
13. Each serum's ability follows its unique established Astralite resonance.
14. Carl is an ordinary Earth human at the beginning; his transformation makes him Earth's first superhuman tied to Earth.
15. Do not confuse NASARUS with AEP-28 or player-created structures with canonical ancient history.

## 12. Pending Design Decisions

- NASARUS crash site, first exploration map, salvage locations, and five recipe-paper placements.
- Exact recipes, machine costs, and production rates.
- Oil storage, consumption, and fuel-to-distance formulas.
- AstroNav connection radius tiers, upgrade recipes, planet distances, and UI signal-loss behavior.
- Game Over persistence/save rules and any permissible emergency responses.
- Unique resource catalogs for each of the 27 planets.
- Detailed automation and Enhancements mechanics.
- Astralite treatment machinery, serum constraints, and individual 63 resonance-to-ability mapping (explicitly deferred).
- Aethren scanning thresholds and Cloning Machine recipe.
- Planet naming conflicts flagged above.

## 13. Design North Star

**Explore → Discover → Collect → Research → Craft → Build → Produce → Upgrade → Travel Further → Repeat.**

NASARUS teaches Carl to build; the Aethryx Expanse supplies unique resources that let him keep building. AstroNav establishes reliable range, Oil sustains flight, and dangerous out-of-range journeys carry the possibility of a deep-space Game Over. Scientific treatment of the 63 canonical Astralites eventually allows Carl to become the first superhuman tied to Earth.

---
**End of AA:1936 Complete Gameplay Systems Handoff V1.0**
