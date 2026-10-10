# Claude Handoff — AA:1936 Core Gameplay and Aethren Loop

Date: 2026-10-09  
Repository: `AOV-saga-new`  
Primary build: `explorer/` (AETHRYX ADVENTURES: 1936)

## Current playable contract

The Aethren system is a required gameplay loop:

1. Scan an Aethren in the overworld with the AstraNav.
2. Bring the profile back to NASARUS.
3. Clone it at the Research Station using the profile and required resources.
4. Deploy cloned Aethren as overworld followers.
5. Assemble a party of up to nine deployed Aethren.
6. Send the party into battles, then continue scanning, leveling, and cataloging.

There is no separate card-battle product flow. The existing collection/profile data is the persistence layer for scans, clone state, levels, experience, health, and battle records. Player-facing battle language is “party,” “deploy,” and “Aethren battle.”

## Implemented in this pass

### Core progression

- `explorer/core_systems.js` now declares the Aethren loop as enabled and canonical:
  - `clone: true`
  - `follow: true`
  - `battle: true`
  - `partySize: 9`
- The five-machine NASARUS departure chain remains the required early-game progression:
  Workstation → Material Processor → Fuel Generator → Rocketship Repair Station → AstraNav Terminal.
- Oil is produced from Fibre through the Fuel Generator and consumed by navigation.
- The rocketship repair station is required before drive repair in the core-enabled flow.

### Aethren systems

- Scanned Aethren profiles can be cloned at NASARUS.
- Cloned Aethren are automatically eligible for deployment and party assembly.
- Party capacity is nine.
- Deployed party members render as native Aethren sprites following Carl in the overworld.
- Encounters can send the deployed party into battle.
- Warden encounters use the same deployed-party battle path.
- Existing saved profiles and clone data are preserved.

### AstraNav and story alignment

- The Companions section now presents the deployed Aethren party.
- Research explains the scan → clone → deploy → battle progression.
- Objectives use Aethren party language instead of “card battle.”
- The crash introduction and navigation boot reflect the machine-chain departure gate.
- NASARUS Navigation Center copy identifies the AstraNav as the base-link machine while the five-machine chain controls departure.

## Files changed

- `explorer/core_systems.js` — core machine chain, oil model, and enabled Aethren companion configuration.
- `explorer/explorer.js` — progression gates, clone/follow/battle logic, nine-member party, overworld follower rendering, encounter UI, and story/objective copy.
- `explorer/nasarus.js` — Navigation Center copy aligned with the new machine-chain flow.
- `docs/CODEX_HANDOFF_CLAUDE_AA1936_2026-10-09.md` — this handoff.

The script load order in `explorer/index.html` already loads `core_systems.js` after the content modules and before `explorer.js`.

## Verification completed

- JavaScript syntax check passed for `explorer/explorer.js`.
- JavaScript syntax check passed for `explorer/core_systems.js`.
- `git diff --check` passed.
- No unresolved merge-conflict markers remain under `explorer/`.

## Claude’s next verification pass

Please play from a fresh save and verify this exact path:

1. Start on NASARUS and complete the camp/tutorial.
2. Scan a wild Aethren.
3. Return home and redeem the profile.
4. Build or access the Research Station and clone the profile.
5. Open COMPANIONS and confirm the cloned Aethren is deployable.
6. Add enough clones to confirm the party caps at nine.
7. Walk in the overworld and confirm party sprites follow Carl without blocking movement.
8. Trigger a wild encounter and confirm BATTLE deploys the party.
9. Trigger a warden encounter and confirm it uses the same party path.
10. Confirm no player-facing flow describes the battle as a standalone card game.

If a later design pass changes the party size, scan requirements, or clone resource costs, update `CORE.companions`, `teamMax()`, the Research Station copy, and this handoff together.

## Git state

The implementation is currently left as working-tree changes for review. Create the commit and merge/push only after the fresh-save playtest passes.
