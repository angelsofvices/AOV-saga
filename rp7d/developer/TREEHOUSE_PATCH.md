# Player-planted treehouses — draft

- Zyphone → Items → Rizer’s Treehouse begins placement. N outdoors also begins placement; near a planted tree or inside a base it opens management.
- Circle / E confirms placement. Triangle / Escape cancels.
- Rizer aligns and plays Plant_Tree (the supplied planting seeds FBX), then the tree grows for eight seconds.
- Approach the mature tree, Circle / E opens construction. Cost: Fresh Wood ×10, Scrap Metal ×10, Everstone ×10 from the carried Zycube. Missing materials leave the tree untouched.
- Cabin assembles over four seconds. Management → Climb ladder uses the supplied Climbing FBX, with geometry driving height. Circle / E at the platform opens the standard animated door.
- Empty interior uses 50% of the home room floor area, with full-size Rizer. Circle / E or N opens management; add native home furniture, rotate it there, or use R lock and Square / J to move it. A center aisle and doorway stay clear.
- Space / Cross at the inside door or Management → Exit returns through the door and reverses the climbing clip down the ladder. Triangle / K on the platform descends without entering.
- Save from inside records progression through the existing game save and base state through inventory persistence. Each base has its own ID, growth, cabin integrity, furniture and defender records.
- Management assigns companions from the existing bonded roster to a base, preventing the same companion from also following Rizer or guarding another base. Guards use the existing partner movement and combat. Already-hostile humanoids can redirect to nearby bases and guards while away from Rizer. Defeated guards remain recorded; no roster deletion or recovery economy is introduced.
- Dismantle outside only: explicit confirmation returns half the paid materials (5 each), checks bag capacity atomically, disables cabin collision, and leaves the tree and furnishings intact for rebuilding. Enemy destruction disables the cabin without guaranteed refunds or deleting game progress.
- Placement excludes wet/steep ground, assets, roads, inter-district routes, boundaries, cave footprints and nearby characters/bases. No authored content is spawned in districts II–X; only the player's own confirmed plants.

Balance configuration lives in TREEHOUSE in treehouses.js: structural HP 240, two guard slots, radius 12, growth eight seconds. Construction recipe uses existing item IDs. These are draft defaults, not new canon economy rules.

Build compiles. This draft has not been gameplay tested. Repair, defender recovery and furnishing loss rules remain unimplemented pending design decisions; furnishings are retained rather than erased. Descent reuses the supplied climbing animation in reverse because a dedicated descent clip was not supplied.
