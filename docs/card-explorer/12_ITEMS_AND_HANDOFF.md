# Aethryx Adventures: 1936 · Survey build 10.5 · The item catalog and the Complete Gameplay Handoff

Creator direction (2026-10-10): *"learn this handoff and merge to new updates. also learn the official item catalog so far. … keep creating more unique assets based on new visual references for our saga items, locations, beings, worlds, and more."*

Sources kept in the repository:
- `docs/AA1936_COMPLETE_GAMEPLAY_HANDOFF.md` (Gameplay Architecture V1.0)
- `data/catalog/items_catalog_1963.xlsx` (the official item catalog so far)

## The item catalog in the game

`tools/explorer/build_items.py` reads the catalog and writes:
- `game_roster/items_catalog.json`: every item, with every column;
- `explorer/items.js`: the game table, an icon for every item, and a field node for every material.

`items.js` loads in the background after the game starts.

| | Count | In the game |
|---|---|---|
| Core catalog | 81 (27 materials · 27 machines · 27 modifications) | Readable in the ITEM CATALOG from the start |
| Planetary items | 840 (28 planets × 10 materials · 10 machines · 10 modifications) | Each planet's ten materials are **its unique resources** (handoff §6: *every planet has unique resources*). Its machines and modifications are readable plans once you reach that world. |
| Ovauron (AEP-28) | 30 of the 840 | **Sealed**: never shown, never placed (AEP-28 is not landable or described) |

**Gathering**
- **Plants** on a world yield its growing materials (fibres, reeds, roots, seeds, resins); **outcrops** yield its minerals (ores, salts, glass, crystals, alloys).
- Each outcrop is drawn as the node of the material it holds.
- Common and Uncommon materials come from the field.
- The first visit to a landmark or Codex site gives one of the world's **Rare** materials; opening its vault gives a **Very rare** one.
- Mythic items have no source yet.

**Storage:** materials go into the **Bag**, and at NASARUS they move into the **Stores**. The INVENTORY panel has **BAG** and **STORES** views, both drag-to-arrange. Dying loses the bag, as before.

**AstraNav · RESEARCH · ITEM CATALOG**
- Every item has its icon, with tabs (MATERIALS · MACHINES · MODIFICATIONS) and a world filter (ALL · CORE · the worlds you have visited).
- Unknown items show as silhouettes.
- A known item opens a card with its catalog ID, world, register, canon anchor, function, role, where to find it and the design note.
- Machines and modifications are marked as set up in **Build Mode**, which is still to come. They are not craftable yet.

**Icons** follow the block-game sprite references the Creator sent (no PNGs):
- **Materials:** ores, ingots, crystals, salt piles, dust heaps, bottles, fibre bundles, glass, pearls, bones, scales, feathers, leaves, cores, gears and stone blocks.
- **Machines:** isometric machine blocks whose faces show what they do (gates, lifts, scanners, relays, beacons, archives, presses, furnaces, looms, shrines, vats, engines, benches, vaults, shields, dishes, bells, nurseries, cores).
- **Modifications:** potions, wards, capsules, markers, boots, keys, lenses, seed packets, traps, links, anchors and runes.
- **Colour and detail:** each icon is tinted by its planet and register, and a per-item seed varies the details, so no two of the 891 are alike.

## The Complete Gameplay Handoff, merged

Already in the game from earlier passes: the ten item classes and the Aethren (`explorer/core_systems.js`); the five starter machines built from physical recipe papers (Workstation, Material Processor, Fuel Generator, Rocketship Repair Station, AstroNav Terminal); Fibre → Fuel Generator → Oil; the scan → clone → nine companions loop; and the Oil-and-radius travel model.

New in this pass:
- **Terra** (Terraform) joins Scrap and Fibre as a starting foundational resource. Boulders give it, and it has its own icon (a block of ground).
- **The Bag:** the portable inventory is called the Bag throughout, as in the handoff.
- **Static beyond the safe radius:** when you are on a world beyond the AstroNav's connection radius, the AstraNav fills with static and reads INTERFERENCE.
- **Stranded is GAME OVER.**
  - Inside the radius, the AstroNav knows a course's Oil cost and will not launch short.
  - Beyond it the reading is static: you can launch, and if the faster out-of-range drain empties the tanks, the ship is stranded and the game is over.
  - The save is not written on that launch, so the last record is from before it. The handoff leaves Game Over saves undecided, so this is provisional and there is no rescue.
- **AstroNav vs AstraNav:** the handoff spells the device AstroNav; the game has said AstraNav since build 7. The starter machine is already the ASTRONAV TERMINAL. Say which spelling to use everywhere.

## Beings: everyone has a face

`explorer/people_art.js` composes every person from native pixel parts, in three facings, at runtime:
- **Outfit from their Codex class:** a crown and cape for rulers, a helm and pauldrons for warriors and knights, a pointed hat and robe for mages, a hood for priests and sages, goggles for scholars and pilots, a cap for traders and scouts.
- **Traits from their people and lore:** beak and crest (Avians), snout (Reptiloids), ears and tail (Beastfolk), fins (Aquatics), antennae (insect peoples), visor (machine-wrought), one great eye (Greatkin Cyclopes), crystal growths, horns, long ears (elves), leaf crowns (forest peoples), a glow (beings of light), and a larger frame for giants.
- **Colours:** a people shares a colour family, and each person varies within it.

All 281 Codex people, 248 folk, the camps, wardens and refugees now look like themselves (Malezor's fur trader keeps his hand-drawn sprite).

## Still undecided (from the handoff, not invented here)

- Build Mode.
- Machine recipes and costs beyond the five starters.
- The fuel-to-distance formula: the out-of-range multiplier in `core_systems.js` is a proposal.
- AstroNav radius tiers.
- Game Over saves.
- The 63 Astralite serum abilities.
- Scan thresholds and the Cloning Machine recipe.
- Planet 19's name (Uralyx vs Ultharis) and Ferros/Ferralis: the game uses Uralyx and Ferros, as the item catalog does.
