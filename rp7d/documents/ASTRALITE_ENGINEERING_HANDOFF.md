# RP7D — FINAL CODEX IMPLEMENTATION HANDOFF
## Astralite Engineering • CyberFall • Plasmabeam • Weapon Progression
**Status:** Creator-approved specification. **Target:** RP7D current repository. **Delivery:** Audited, staged, tested implementation.

## 0. MISSION / WORKING RULES
Build a complete playable vertical slice: collect a free Plasmabeam from Rizer's Room; harvest AX-3 and AX-6 outside the home; study them at the EXISTING Astralite Station in Rizer's Room; synthesize AX-36 at the Experiment Table; obtain a standard Portal Chip from existing tech-enemy drops; use CyberFall on Rizer's computer to decode and reprogram the chip; permanently install Frost of Destruction through Zyphone > Portal > Custom Chips; switch between green plasma and blue fire-ice with Circle; freeze and melee-combo enemies. Add foundational weapon levels 1–5, gem-based shop upgrades and permanent mod-slot capacity, and a believable fictional CyberFall feed with lore posts and progression triggers.

FIRST inspect current code and summarize what already exists, including entrypoints, save schema, weapon system, inventory, combat, enemy loot, room interior, world coordinates, shop/gems, UI, inputs and story triggers. Do not assume the example identifiers or file names exist. Extend rather than replace. Preserve RP7B/RP7D story and world canon. Never fabricate world coordinates or established Astralite properties. Do not remove unrelated features. If a requirement conflicts with existing systems, report it and propose the smallest safe adaptation before implementing. Work in small independently testable patches with a brief changed-file/test report for each phase. Do not claim tests passed without running them.

## 1. CREATOR-LOCKED WORLD SETUP
- Astralite Station ALREADY EXISTS in Rizer's Room. Locate and use it; DO NOT create a second station.
- Experiment Table is distinct from Astralite Station and from Rizer's computer.
- Spawn exactly ONE free, collectible Plasmabeam as a visible physical pickup on an unobstructed floor area in Rizer's Room. It is not auto-equipped. Its unique instance and pickup state persist; if inventory is full, leave it in the world.
- Preserve the previously planned GOLD chest containing a Plasmabeam near the Aetherstride UFO in Malezor; use verified coordinates and existing chest/loot systems. The bedroom and chest pickups must be separate instances and independently persistent. Do not duplicate the chest if already implemented.
- Spawn TWO separate harvestable stones directly in front of Rizer's Malezor home, one yielding AX-3 and the other AX-6. Use verified home/world layout and avoid obstructing movement. Harvest state persists; no unlimited respawn in this test.
- Standard Portal Chips ALREADY DROP from tech enemies. Use the existing drops; do not spawn a free chip on the desk or invent a new acquisition path. Preserve established Penumbra three-chip drop.
- Interior levels use the existing doorwalk transition system; pickups and stations must survive room transitions and save/load.

## 2. ASTRALITE RESEARCH AND SYNTHESIS
- Collect AX-3 and AX-6 as physical items, tracked by existing Zycube/inventory rules.
- Each must be STUDIED individually at the existing Astralite Station before synthesis. Studying does not consume physical samples. Research/discovery records remain permanently unlocked.
- Experiment Table recipe: 1 AX-3 + 1 AX-6 -> 1 AX-36 compound. Only available once both studies are complete. Successful synthesis CONSUMES both physical ingredients. Permanent knowledge persists.
- Make inventory changes atomic: validate prerequisites, capacity, and item instances first; on failure/cancel no partial material loss or duplicated output. Do not award automatic RXP for pickups.
- AX-36 is a PHYSICAL compound, separate from permanently learned Astralite Matrix data. Successful chip programming CONSUMES 1 AX-36.
- Do not invent the colors, physical effects or scientific properties of AX-3/AX-6 beyond their approved recipe; use established asset/registry data or neutral placeholders.

## 3. CYBERFALL — CANONICAL IDENTITY
CyberFall is NOT merely a local hacking utility. It is Zyraxis's underground, insider-known, open-source CODING SOCIAL MEDIA for youth AND adults: GitHub-like repositories/collaboration plus Reddit-like posts, threads, profiles, and communities. It operates outside Thardin and big-tech control; users share projects, tutorials, exploits, hacks and technology news. Not every member is a hacker or rebel. Rizer already knows about CyberFall through youth coding culture at the start. Advanced repositories/hacks may unlock with progression.

Provide three connected areas on Rizer's EXISTING computer:
1. CYBERFALL SOCIAL — feed, fictional users, discussions/comments, district/world events, lore, read/unread/bookmarks.
2. CYBERFALL CODE — discoverable repositories, downloadable tools and open-source project descriptions; use authored in-game data, not arbitrary executable remote code.
3. CYBERFALL LAB — physical Portal Chip insertion, decode/unscramble minigame, reprogramming minigame, AX-36 installation.

V1 is OFFLINE-FIRST and AUTHOR-DRIVEN. No real multiplayer, user-generated public posting, remote code execution, or mandatory server. Start with a SMALL set of believable recurring fictional community identities, posts and conversations. Trigger additional posts/repositories through story milestones, district entry and verified world events. Distinguish verified reports from community speculation and rumors. Do not prematurely spoil hidden canon. CyberFall represents what people discuss/believe; Rizer's Codex represents discoveries he has personally verified. Integrate discreet Zyphone notifications about relevant trending CyberFall discussions, with a route to read the full feed on the computer; notifications should not interrupt combat. Save seen/unseen, bookmarks, unlocked content and relevant notifications. Avoid inventing definitive lore or events: use explicitly illustrative placeholders until authored canon is provided.

## 4. CYBERFALL LAB: CHIP PIPELINE AND THARDIN FIREWALL
1. Open CyberFall on Rizer's computer; enter LAB.
2. Select Insert Portal Chip from available standard chips in physical Zycube inventory; transfer ONE specific chip instance into the session, not delete it.
3. Run distinct interactive DECODE/UNSCRAMBLE challenge, representing defeating a Thardin firewall and preparing a decoded chip.
4. On success expose REPROGRAM CHIP. Require researched/synthesized AX-36 compound and run a SECOND distinct interactive programming/Matrix-installation challenge.
5. On successful programming, consume 1 AX-36 and produce the SAME unique chip instance as a custom Frost of Destruction Portal Chip with encoded AX-36 program; persist its state.
6. Hacking is HIGH-RISK: only THREE attempts before Thardin firewall circuit-fries the current programming session. Every FAILED attempt permanently destroys/consumes its committed standard Portal Chip (creator-approved recommendation). After the third failure, the current session is fried; a fresh chip and AX-36 are required to start a new session. Failure counts must persist against reload/menu exploits. Clearly warn players before committing resources.
7. No accidental resource loss from ordinary UI close, game crash or save/load outside a submitted failed attempt. Persist a recoverable transaction state or safely return uncommitted inventory items. Never duplicate chips or AX-36 by restarting.
8. The approved rule 'three attempts' should be enforced as THREE failed hack submissions in a session, not an indefinite retry button. If the chip is destroyed on an earlier failure, subsequent attempts require inserting another chip. Ensure UX explains the cost. The exact challenge sequence and how AX-36 is reserved must be implemented consistently; do not charge AX-36 twice.
9. Portal Chips can be decoded/programmed prior to installation; ONCE an Astralite synthesis mod is applied to a weapon it is PERMANENT for now: no removal, replacement, respec or overwriting an occupied slot.

## 5. ZYPHONE > PORTAL > PORTAL CHIPS
- Extend the existing Portal section; provide STANDARD CHIPS and CUSTOM CHIPS views. Both refer to real item instances, not shadow inventories.
- Custom chip detail: encoded compound, mod name, owned/installed state and compatibility.
- Selecting Apply to Item opens the FULL owned item list, highlights compatible items, dims incompatible items with reasons.
- Plasmabeam is compatible with Frost of Destruction. Allow direct installation from Zyphone without revisiting a workstation. Treat it as applying configuration while tracking the physical chip in carried equipment; ZyLink is not magical item teleportation.
- Installation is atomic, permanent and tied to a specific weapon instance and free mod slot. Save/load and duplicate prevention required.

## 6. PLASMABEAM BASE FIRE AND FROST OF DESTRUCTION
- Plasmabeam is Thardin technology customized by Rizer: orange armored pistol, green energy chamber, gold/brass/gunmetal, established Rizer emblem. Reuse approved asset and existing armory/equip, targeting, projectile, collision, hitbox, animation and save systems.
- SEMI-AUTOMATIC: one trigger press launches one round of THREE independently tracked green plasma beams; unlimited rounds/no reload for playtesting; holding trigger does not auto-repeat. Cooldown configurable. Do not auto-hit through cover.
- Lock-on target A always receives first beam. Distribution: 1 valid enemy [A,A,A]; 2 [A,A,B]; 3+ [A,B,C], deterministic nearest valid secondary enemies. Respect collision/cover. No-lock behavior: preserve existing safe implementation; do not invent automatic targets.
- With weapon equipped, CIRCLE toggles between GREEN PLASMA (normal HP damage) and BLUE FIRE-ICE / FROST OF DESTRUCTION (progressive freeze, zero direct HP damage). Frost mode only available after mod installation. Respect existing input bindings and menu contexts; do not break other actions. Persist selected mode if supported.
- Freeze buildup scales by NUMBER OF BEAMS HITTING A PARTICULAR ENEMY in the same round: 1 beam -> 9 seconds, 2 beams -> 6 seconds, 3 beams -> 3 seconds. For 1 target A gets 3s; for 2 targets A gets 6s and B 9s; for 3+ targets each hit enemy gets 9s. Beams must ACTUALLY HIT; blocked/missed shots do not count. Implement one coherent per-enemy buildup state, not independent overlapping timers. Define how repeated rounds affect progress without timer exploits.
- On reaching full freeze, immobilize for 7 seconds FROM FULL FREEZE. Keep visual ice overlay on enemy model/skeleton. Rizer's melee combos deal normal melee damage. If enemy HP reaches zero while frozen, trigger synchronized one-time ice-shatter death; otherwise thaw after 7 seconds and restore normal AI/movement. Prevent indefinite freeze refresh, duplicate loot/death and broken animation/AI. Base green plasma still functions.

## 7. WEAPON SHOP LEVELS AND PERMANENT MOD CAPACITY
- Weapon levels are 1,2,3,4,5. Upgrade at EXISTING weapon shop with GEMS (verify actual currency/registry and costs; do not invent costs or new gem types). Level L supports L permanent Astralite synthesis mod slots, maximum 5.
- Leveling preserves existing mods and weapon identity. Mods stack by occupying different available slots; no removal or replacement once installed. Prevent duplicate chip instance use or applying the same one-time chip twice.
- ACTIVE modifications (such as alternate firing modes) are selectable; compatible PASSIVE modifications may operate simultaneously. Circle cycles available active firing modes for equipped Plasmabeam. In first vertical slice, only Base Plasma and Frost of Destruction need to function. Do not invent additional mod effects or stacking formulas.
- If existing shop cannot yet support gem upgrades, wire a minimal compatible implementation behind its existing interface, report any missing gem-cost specification, and avoid guessing economic values. Ensure level 1 permits the first Frost mod.

## 8. DATA, SAVE, AND CONTENT STRUCTURE
Use existing project architecture; suggested logical records (not forced filenames):
- Astralite definitions and discovery/research progress
- Synthesis recipes and material transactions
- Persistent room weapon pickup and two resource stone nodes
- Chip instances with location/state (standard, inserted, decoded, custom, installed, destroyed)
- CyberFall Lab session, failed attempts, firewall status, and completed recipes
- Weapon instance, level, mod slots, installed chip references and selected active mode
- CyberFall authored users/posts/comments/repos, trigger predicates, unlocks, read/bookmarked states
- Freeze state, buildup progress, seven-second timer, one-time shatter/death coordination
Ensure old saves load with safe defaults; no item duplication, broken references, or inaccessible stations. Do not mix permanent research knowledge with physical item quantities.

## 9. IMPLEMENTATION PHASES / GATES
**Phase 0 — Audit:** map real source modules, entrypoints, asset locations, world positions, save schema, UI hooks, loot, shop and input conflicts. Report gaps.
**Phase 1 — World + Items:** bedroom Plasmabeam pickup, two home-front stones, preserve UFO Gold Chest, verify tech-enemy Portal Chip drops. Test collect, equip, capacity, save/load.
**Phase 2 — Research + Synthesis:** use existing bedroom Astralite Station, Experiment Table AX-36 recipe, permanent research and atomic consumption. Test failed/successful transactions.
**Phase 3 — CyberFall Platform:** add insider-known offline Social/Code/Lab shell, small authored community feed, progression triggers, unread/bookmarks, Zyphone notification hook. No invented canonical reveals.
**Phase 4 — CyberFall Lab:** physical chip insertion, two playable minigames, three-attempt Thardin firewall, resource destruction on failed hack, AX-36 consumption on success, custom chip persistence. Test exploit paths.
**Phase 5 — Zyphone + Weapon:** Portal chip tabs, compatibility item list, permanent mod install, Circle mode toggle, base triple-beam and Frost freeze behavior. Test collisions, enemy counts, melee, death, thaw, save/load.
**Phase 6 — Upgrade Progression:** gem-based weapon shop levels 1–5 and one permanent mod slot per level; preserve existing mods. Use existing economic data; flag unknown prices.
**Phase 7 — Regression:** old saves, room transitions, chest states, drop rates, inventory full, chip loss/recovery, interrupted hacks, shop affordability, multiple Plasmabeams, UI controller collisions, enemy status/death and Codex integrity.

## 10. ACCEPTANCE TESTS
1. Free Plasmabeam appears on Rizer's Room floor exactly once; pickup/equip/save/reload works.
2. UFO Gold Chest remains independently collectible without duplicating room pickup.
3. Two home-front stones yield exactly AX-3 and AX-6 and persist after harvest.
4. Astralite Station in ROOM studies both separately without consumption.
5. Experiment Table refuses recipe before research; successful AX-36 synthesis consumes one of each physical input, preserves permanent research.
6. Standard Portal Chip drops from existing tech enemies; no free desk chip.
7. CyberFall has Social, Code and Lab; believable youth/adult fictional community, event-triggered posts, distinct verified/rumor content, persistent read/bookmark state and discreet Zyphone notices.
8. CyberFall Lab decodes and reprograms through TWO distinct interactive minigames.
9. Failed hacks consume committed chips, track max three failures and circuit-fry session; cannot reset by reload. Successful reprogram consumes exactly one AX-36.
10. Zyphone Portal displays standard/custom chip instances, highlights Plasmabeam, permanently installs Frost in a free slot; no duplicate chips.
11. Circle switches green plasma and blue fire-ice while equipped, with no input conflict.
12. Three-beam distribution [A,A,A], [A,A,B], [A,B,C] remains accurate and independently collision-checked.
13. Actual frost hits give 3s/6s/9s freeze buildup per 3/2/1 beams on an enemy; full freeze lasts 7s; no direct freeze-beam HP damage.
14. Melee hurts frozen enemies; lethal hit shatters ice once and completes normal death/loot; survivors thaw.
15. Weapon level 1–5 maps to 1–5 permanent mod slots; gem shop upgrades preserve installed mods.
16. Full pipeline survives saves, reloads and interior transitions without duplication or unintended loss.

## 11. IMPLEMENTATION DELIVERABLES
- Short repository audit with confirmed existing files/components and any genuine blockers.
- Patch-by-patch changes, minimal migration notes, new/updated data schema, tests executed and outcomes.
- One runnable end-to-end vertical slice. Explicitly distinguish implemented vs stubbed content.
- Final manual QA checklist and concise known-issues list.
- STOP rather than inventing canonical world coordinates, Astralite properties, additional weapon mods, gem prices, or story events.

**Priority:** Working, persistent, lore-consistent vertical slice first. Expand CyberFall's social depth and weapon mod catalog later without rebuilding the foundation.
