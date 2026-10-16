# Astralite Engineering implementation audit

Date: 2026-10-15. Target: the GitHub clone's Malezor Playtest.
Specification: `RP7D_Codex_Final_Handoff.md`, supplied by the creator.

## Confirmed source and existing systems

| Area | Existing implementation and integration point |
| --- | --- |
| Entrypoint/build | `developer/index.html` → `developer/game.js`; `tools/build_single_html.mjs` bundles this source into `dist/RP7D_Malezor_Playtest.html`. The game's old “Sandbox” source comment is not a different build target. |
| Save | `game.js`: `rp7d.save.v1` stores world/home/treehouse location and time. `loot.js`: `rp7d.inventory.v1` stores inventory and world progress. Settings, room layout, and animation assignments use their own records. Autosave runs every five seconds and on visibility/unload. |
| Inventory | `item-registry.js`, `storage.js`, `loot.js`: carried Zycube, Home Storage, deployed equipment, capacity checks, transfer guards. Weapons currently deduplicate by type; equipment has UIDs. Standard Portal Chips are stack quantities, without persistent chip identities. |
| Existing room stations | `home-interior.js` creates the Astralite Station (`astralite`), Experiment Table (`experiment`), and Nebuladock computer (`homepc`) on bedroom level 2. Furniture layout can move stations. Reuse their registered interactions, not hard-coded UI coordinates. |
| Room transitions | `game.js` + `doorwalk.js`; `home-interior.js` supplies the interior world, collision, floor heights and pickup registration. Existing DVD floor pickups are a reusable interaction precedent. |
| Astralites | `loot.js` defines exactly nine families of seven entries. AX-3 is `astralite_3_1`, Ax-3 · Pyroclast Aethra. AX-6 is `astralite_6_1`, Ax-6 · Fortaris. AX-36 is absent; the approved recipe makes it a separate compound, not a 64th Matrix entry. |
| Research/crafting | `crafting.js` currently offers placeholder 3-of-one-Astralite → Gemshard recipes. It has no per-Astralite study record. Its existing craft path saves ingredient removals separately before output; the new recipe needs a single saved exchange to survive interruption. |
| Stones | `nature.js` has visible damage, break/debris, mesh contact and dropped Astralites. Ordinary drops use the existing RP7B family hash/tier cuts. Two fixed tutorial stones need an explicit override and persistent harvest/drop records; keep ordinary random stones unchanged. |
| Tech loot | `scanobots.js` drops one standard chip; `penumbra.js` uses `chips: 3` and the same physical drop pipeline. `game.js` handles collection. `gatelocks.js` consumes ten chips. No free desk chip is needed. |
| Weapons/combat | `loot.js` supplies weapon definitions, chests, held models and mounts. `rizer.js` and `actor.js` own animation and timed combat. `thardin-rifle.js` has traveling projectiles, world obstruction checks and body contact. `game.js` has weapon input/equip and a unified enemy adapter (`foes`). |
| Enemy status | Seers/Mori, Scanobots, Nova and Penumbra have separate AI and death paths. There is no shared Frost buildup/thaw/shatter status. A new status controller must suppress each AI without bypassing normal damage/death/loot. |
| Existing UI | `station-ui.js` owns computer/storage, station and shop screens. `zyphone.js` has a Portal page, currently a placeholder. `documents/style.css` supplies their shared appearance. |
| Input conflict | Circle is context interaction/pickup, then Astralstrike. A Plasmabeam mode toggle must consume Circle only in the equipped weapon context and must preserve proximity interaction priority and menu input. |
| Shop/gems | `store.js` and `store-interior.js` implement Malezor Town Store departments using `inventory.coins`. `inventory.gems` already exists, but no weapon upgrade price table or separate operational weapon-shop upgrade path exists. |
| Story/hooks | `game.js` has journal/tutorial progress, location discovery, combat and world event callbacks. CyberFall should read verified existing milestones and keep illustrative community chatter distinct from the Codex. |

## Verified world anchors

`world-data.js` converts RP7B tiles using `(tileX − 61) × 2`, `(tileY − 94) × 2`.

- Rizer's Home: `player-home`, tile (22,105), world x/z (−78,22).
- Exterior start/front-door reference: tile (22,108), world x/z (−78,28), facing 0.
- Aetherstride: `auraxion-ufo`, tile (17,176), world x/z (−88,164).
- These are anchors, not new placement coordinates. Exact pickup/node positions must be derived from existing geometry, terrain height and clearance checks.

## Genuine gaps and agreed adaptations

1. No Plasmabeam item definition, model/reference or Plasmabeam UFO chest was found during the initial audit. The creator subsequently supplied the approved multi-angle image in chat (`A8BF596B-80F3-414E-AE38-2B956A3A2936.PNG`). A native low-poly model and independent Gold chest were added from the visible reference and verified Aetherstride anchor. The listed Downloads image path was unavailable when archiving references; the runtime model does not depend on that image file.
2. The creator confirmed weapon upgrade prices are undecided. Introduce level/capacity information with level 1 supporting one slot; leave paid upgrades unavailable until canonical prices are provided. No guessed gem charges.
3. Add persistent weapon/chip identities while retaining legacy inventory projections for the current wheel and Gatelocks. The bedroom and chest Plasmabeams must be different UIDs. Standard, inserted, decoded, custom, installed and destroyed chips must be states of the same physical instances.
4. Keep the existing Gemshard recipes. Add individual study actions at the existing Astralite Station and the approved AX-36 recipe at the existing Experiment Table. AX-36 gets neutral presentation and no additional invented properties.
5. Add a durable single-record exchange for the new transactions. `saveInv()` currently hides write failures; the new path must detect failure and roll back in-memory mutations.
6. CyberFall Social/Code/Lab belongs on the existing computer. Community entries may use clearly labeled illustrative content; no invented canonical events or hidden revelations.

## Planned saved additions

- Permanent research and recipe knowledge, separate from physical material quantities.
- Unique source pickup/stone IDs and persistent harvest/drop/collection state.
- Chip instance state/location and recoverable Lab session, committed attempt state and failure count.
- Weapon UID, level (1–5), installed chip references and selected active mode.
- CyberFall unlocked/read/bookmarked content and queued/delivered notices.
- Freeze is encounter state; it must cleanly release on thaw/death/area teardown, not produce duplicated death rewards.

## Phase status

- Phase 0: source audit complete; this report is not a playtest or a claim that the vertical slice exists.
- Implementation, checks and migration notes are recorded in `ASTRALITE_ENGINEERING_DELIVERY.md`.
- Approved Plasmabeam reference received and used. Paid upgrades are intentionally deferred by the creator.

## Manual acceptance route once implementation is complete

Start an old save and a new save; collect the bedroom weapon; check independent UFO chest state; harvest both fixed stones; study each without consuming it; synthesize AX-36; obtain chips from tech enemies; decode then program on the computer; install on a specific carried weapon from Portal; toggle/fire both modes; verify blocked beams, 1/2/3 targets, buildup, thaw and melee shatter; reload after every resource transition. Check a full Zycube, interrupted/failed writes, closed Lab, three failed submissions, separate Plasmabeams and unchanged Gatelock consumption.
