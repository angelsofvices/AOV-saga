# Plasmabeam / Astralite Engineering delivery

2026-10-15 · GitHub clone · Malezor Playtest

## Implemented

1. **World and items:** a single free bedroom Plasmabeam on clear floor space, plus a separate Gold chest beside Aetherstride. Separate persistent source IDs and weapon UIDs; collecting one does not remove the other. Collection checks capacity and save success. Neither source auto-equips the weapon. Two fixed home-front Astralite stones yield the canonical AX-3 and AX-6, retain the existing stone contact/break/collision behavior, and persist harvest/collection state.
2. **Research and synthesis:** the existing Astralite Station now opens on Study, with its original Gemshard synthesis retained in a separate view. Study AX-3 and AX-6 separately without consuming samples. The existing Experiment Table shows the gated recipe 1 AX-3 + 1 AX-6 → 1 AX-36. It consumes and produces in one saved exchange, checking capacity after inputs leave. Failed saves roll back. AX-36 is a physical compound; it is not an extra Matrix entry or a research flag.
3. **CyberFall:** the existing home computer launches offline Social, Code and Lab views. Keyboard C or controller L2 from the computer's storage screen also opens it. Three recurring fictional community identities, illustrative discussions/replies, repository notes that can be cached, read/bookmark/cache state, research/chip/synthesis/district unlocks and discreet notifications are included. All community content is labeled illustrative rather than a canonical news report. No remote code executes.
4. **Lab:** a specific physical chip is inserted, decoded by swapping fragments, then reprogrammed by tracing a circuit. Each puzzle and inserted chip survive closing/reloading. Every incorrect submitted solution destroys that chip and increments the saved session failure count. The third failure fries the session. A fresh standard chip and carried AX-36 are required to reset a fried session. AX-36 is consumed exactly once on successful programming; failures do not consume it. Safe ejection and closing do not charge an attempt. If the bag is unavailable/full, output/ejection refuses without losing the chip or compound.
5. **Portal and weapon:** Zyphone → World → Portal has Standard and Custom Chip views. Applying a custom chip lists owned items, dims incompatible ones with reasons, and confirms a permanent install into a specific carried Plasmabeam's free slot. The installed chip remains linked to that weapon UID. Armory lists separate Plasmabeam instances and selects which one the shared wheel model represents.
6. **Combat:** one Square / J press fires exactly three traveling green beams. Holding does not repeat fire. Intended targets distribute as [A,A,A], [A,A,B], [A,B,C], with deterministic nearby secondaries. No lock means forward fire without automatic target selection. Each beam raycasts actual enemy meshes and respects world cover; target selection alone never damages. Circle / F switches Plasma/Frost after installation, following contextual interaction priority.
7. **Frost:** actual hits build one status per enemy. One/two/three beam hits within a round establish 9/6/3-second buildup rates. Repeated rounds can improve to the strongest actual per-round hit count, but do not sum rates or restart timers. Progressive slowdown affects the existing AI clocks. Full freeze pauses each enemy controller for seven gameplay seconds; melee still uses normal damage/contact. A lethal frozen hit removes the ice and emits one shatter effect while retaining the original death/loot path. Survivors thaw. Area transitions clear encounter effects safely.
8. **Upgrade introduction:** level 1 supports one permanent mod slot. The framework and shop introduction describe levels 1–5 / one slot per level. Paid upgrades and prices are intentionally unavailable, as the creator requested. No gem prices or extra mod effects were invented.

## Confirmed generated placements

Positions come from existing geometry and clearance searches, not invented canon coordinates:

| Object | Verified placement |
| --- | --- |
| AX-3 stone | world x −81.50, ground y 14.36, z 32.00 |
| AX-6 stone | world x −67.00, ground y 13.73, z 42.00 |
| Bedroom weapon | bedroom local x 6.20, z −2.95; existing level-2 floor supplies height |
| UFO Gold chest | world x −88.00, z 176.00; existing terrain supplies height |

Saved placements remain stable across reloads. Existing rearranged bedroom furniture is checked before selecting the room pickup position.

## Changed files by patch

- **Identity, materials and transactions:** new `developer/engineering-ledger.js`, `engineering-research.js`, `engineering.js`; updated `loot.js`, `item-registry.js`, `storage.js`, `crafting.js`, `gatelocks.js`.
- **World sources and pickups:** `nature.js`, `home-interior.js`, `loot.js`, `game.js`.
- **Computer, Portal and Armory:** new `cyberfall.js`, `portal-chips-ui.js`; updated `station-ui.js`, `zyphone.js`, `documents/style.css`.
- **Weapon and Frost:** new `plasmabeam.js`, `frost-state.js`; updated `rizer.js`, `game.js`, `seers.js`, `nova.js`, `penumbra.js`, `scanobots.js`. The pistol is excluded from melee blade trails/contact.
- **Checks and delivery:** new `tools/verify_engineering.mjs`, this report, audit, saved test logs and approved handoff copy; rebuilt `dist/RP7D_Malezor_Playtest.html`. The visible reference image was used, but its listed Downloads file was unavailable to archive.
- Existing in-progress repository changes were retained. RP7B was not edited.

## Save and migration notes

All new persistent data stays in `rp7d.inventory.v1`:

- `astraliteEngineering.studied`: permanent individual study flags.
- `recipes`: includes `synth_ax36` after a successful synthesis; `items.compound_ax36` is the separate physical quantity.
- `engineering`: version, monotonic UID sequence, chip records, Plasmabeam instance records, source pickup flags, fixed stone records/placements, Lab session and social progress.
- Chip records: UID, physical state/location, optional AX-36/mod/weapon reference. Standard, decoded and custom stack fields are projections of these same physical records, not additional inventories. Standard chips consumed by Gatelocks are marked spent. Lost/recovered Zycubes move the same UIDs.
- Plasmabeam records: UID, type, source, location, level, installed chip references and active mode. Legacy `owned`, `home.weapons` and wheel entries remain type projections for compatibility. Home Storage transfers preserve the specific UID and installed mods.
- Old saves with stack-only standard chips migrate those quantities to individual records without changing their quantity. No free Portal Chip is added. Existing Penumbra `chips: 3` remains unchanged.
- `saveInv()` now reports write success. New material exchanges and Engineering transactions roll back on failed writes.

## Checks executed

- `tools/verify_engineering.mjs`: **30 checks passed**, including source geometry construction, source uniqueness, research gates, exact/atomic consumption, failed saves, full bag handling, physical chip identity, two minigames, three failures across serialization, permanent installation, weapon transfer identity, lost/recovered bags, target distribution, actual projectile/mesh impacts, cover blocking, zero-damage Frost, buildup/freeze timing, one-time cleanup and world reconstruction after harvest.
- `verify_world_data.mjs`: **all checks passed** (includes existing warnings for hand-placed Malezor patrols).
- JavaScript syntax: **22 changed/new source files passed**.
- `git diff --check`: **passed**.
- Standard standalone playtest build: **passed**; source/assets bundled into the GitHub `dist` playtest.

The isolated checks stub canvas/texture drawing and use no player browser save. They are not a rendering, controller or full gameplay playtest.

## Manual QA / remaining limits

The browser tool rejected this local file URL under its URL policy; live visual/controller QA could not be executed here. No alternate browser route was used.

1. Refresh Malezor Playtest; collect the small orange/green pistol from the bedroom floor and assign/select it in Armory. If the wheel is full, replace a wheel slot through the existing Armory UI.
2. Leave home, lock and break both marked stones, and manually collect their samples. Return to the existing Astralite Station and study each; synthesize AX-36 at the Experiment Table.
3. Obtain standard chips from tech enemies. Sit at the existing computer, open CyberFall, insert a chip, solve Decode, then solve Reprogram. Validate closing/reopening during each phase.
4. Open Zyphone → World → Portal → Custom Chips, select the chip, choose a compatible carried Plasmabeam and confirm the permanent install.
5. Equip it. Tap Square/J for a burst; Circle/F changes mode when no nearby contextual interaction takes priority. Check green damage, blue buildup, three target counts, cover, seven-second freeze, melee shatter and thaw.
6. Verify the UFO chest remains separately collectible, changes survive save/load and room transitions, and the existing Gatelocks still spend ten standard chips.
7. Visually check pistol hand pose, small floor pickup visibility, ice shells on each enemy species, station layout/controller navigation and UI scaling. These remain unverified until an actual playtest.

Deferred content: paid weapon upgrades and their gem costs; additional mods; final authored CyberFall lore. Code repositories currently cache authored notes, not executable tools.
