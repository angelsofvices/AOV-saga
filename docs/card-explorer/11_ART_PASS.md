# Aethryx Adventures: 1936 · Survey build 10.4 · The art pass

Creator direction (2026-10-10): *"update the items, icons, and landscape in the game. make them unique new sprites, not just recolor. use native builds. make the game look visually appealing. I like the current style. make sure inventory shows item art icons. full ui adaptability. drag and drop system too. reorder items and aethren."*

## Native world art

`tools/explorer/build_world_art.py` draws every picture as pixel data (no PNGs) into `explorer/world_art.js`, in the game's existing style: 16-pixel tiles, a dark outline, light from the upper left, and five-step colour ramps. Colours come from each environment's palette, so every world keeps its identity.

Every environment (the 26 other worlds, plus nine of Zyraxis's districts; Malezor's hand-built meadow keeps the original art) has its own recipe, taken from its Codex terrain:

| Kind | What each world gets |
|---|---|
| Ground | Two textures of its own: crystal facets, sand ripples, ash and cinders, basalt plates, lava crust, ice, roots, hardlight grid, marble paving, churned mud, snow, shadow, cracked flagstone, strata, leaf litter, flesh veins, soft "observed" ground, reef sand, sound rings, iron plate, cloud, gravel … |
| Special ground | A third texture for its special terrain. |
| Paths | Dirt, planks, flagstone, cobble, glowing road, sand, ice or metal walkway. Their lightness is kept apart from the ground so roads always read. |
| Cliffs | Rock ledges, basalt columns, crystal, cut blocks, roots, flesh, coral or hive walls. |
| Liquids | Two animation frames: water, glowing pools, lava, cloud sea or void. |
| Props | Each prop the world names gets its own shape, not a recolour. Trees can be round, pine, giant, palm or willow. Plants can be bushes, ferns, kelp, coral, crystals, thorns or reeds. Spires can be crystal, needle, shard, ice, a watching eye, an hourglass or a solid note. There are also columns, obelisks, statues, war banners, palisades, strata stacks, tuning pillars, basalt, arches, bone trees, wind-bent and frost trees, vents, smoke stacks, pylons, nodes, hives, domes, crags, reefs, gears and eggs. |
| Extras | One more prop of its own, a mineral outcrop, a record-stone style, a boulder and a bush. |

**Landmarks by kind** (they were all one gold spire): region stones, Codex sites (ruined monuments), district shrines, Gemlord caves, prisms, temples, Codex monuments, the presences of axis-beings, and the Throne.

**Item icons:**
- The five materials, oil, flares and air.
- The seven ship parts: hull alloy, air filter cell, power cell, drive crystal, star lens, shield plate, coil winding.
- Codex relics by kind: gem, prism, crown, key, orb, scroll, vial, blade, shard, core, seed.
- A profile card.

Re-run `python3 tools/explorer/build_world_art.py --preview` to rebuild the art and write a contact sheet. Change a world's recipe in the `R` table.

## Inventory

AstraNav · SYSTEM now has an **INVENTORY** panel. Every item shows its icon and count:
- materials and ship parts in the pack, and unredeemed profiles;
- flares, AIR, equipped air tanks and oil;
- the Codex relics you have found (the Phoenaris Crown, the Key of Anciuxor …).

Tap an item to read it. The Research pack list and the HQ materials table show the icons too.

## Drag and drop

One engine (`sortable` in `explorer.js`) works with mouse, touch and pen. On touch, you hold a moment before dragging, so a quick swipe still scrolls and a tap is still a tap. The panel auto-scrolls when you drag near its edge.

- **Inventory:** drag to arrange. The order is saved (`S.invOrder`).
- **Party:** drag to reorder; the first Aethren leads and sets the field perk. Drag an Aethren in from the roster to deploy it (up to nine), or drag one out to bench it. A benched Aethren stays out (`S.benched`), and new clones still join on their own.
- **Roster:** drag to arrange (`S.cardOrder`).

## Layout

The AstraNav fits phone portrait (390 × 844), phone landscape (844 × 390), tablet portrait, laptop and 1080p desktop with no sideways scrolling. The tab keys move across the top on narrow screens, and the inventory grid sizes its slots to the screen.
