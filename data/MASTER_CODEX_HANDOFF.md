# MASTER CODEX HANDOFF — Sync from Game Cowork Session

*Source: game production session (rizers.html + data/aov_game_codex_v11.1.xlsx)*
*Target: master cowork session (Google Drive Codex v9.5+)*
*Written: 2026-07-12 · covers commits V2.42 → V2.66 (regenerated after V2.66)*

Paste this into the master cowork chat verbatim. Every section is either a **canon change that must be reflected in master**, a **new named canon to consider promoting**, or a **master codex bug the game fixed** that needs an eye on the drive source.

---

## 0. TL;DR (60-second version)

**Must sync to master codex (canon changes):**
1. Otterlin no longer evolves into Terralith — two separate species (V2.48)
2. Cinderant no longer evolves into Vampella — two separate species (V2.62)
3. Flarepaw no longer evolves into Vampella — two separate species (V2.63)
4. Elzoran line retyped: Elzebub / Elzimir / Elzoran are all **Draconic/Elemental**; Omegoran is **Draconic/Elemental/Corrupted** (tri-type at Tier VII) (V2.58)
5. Every Zyrex base stat pool now locked to **tier × 333** (I=333, II=666, ..., X=3330) — V2.59
6. **Canon exemption to T×333 for lore-locked species:** Ultharis (Tier X, God of the universe) stays at **999 across all stats = 4995**, not scaled to 3330. Mechanism extensible via `CANON_STAT_EXEMPT` set — V2.65

**Master codex data errors the game had to fix:**
7. **Mira** (row 274 · Tier VIII) had 0/0/0/0/0/0 stats in `9 MASTER INDEX` — filled to `666/400/466/400/732 = 2664` (Aura/Spirit Ascendant, SPC+HP weighted)
8. Ultharis (row 457) had already been 999×5=4995 on the drive — the game briefly trimmed it in V2.59 then reverted in V2.65 because it was canonically correct

**New named canon the game invented — decide whether to promote to master:**
9. 10 Seer Commanders (one per district, one per Gemshard color) — V2.41
10. 9 District Shrines with unique relic items (Sunlit Ember → Imperial Crest) — V2.44
11. ANCIENT GEMSIGHT meta-relic (unlocked at 9/9 shrines) — V2.44
12. 20 Villagers (2 per district, lore-givers) — V2.47

Sections 1-9 below have the full detail.

---

## 1. Canon Species Retypes (V2.58)

**Change:** The Elzoran line is no longer Aura-anchored. Whole line drops to Draconic/Elemental. Omegoran picks up Corrupted as a third type (Tier VI+ allows a 3rd type per V2.27 mechanic).

| Species | Tier | Was (pre-V2.58) | Now (V2.58 canon) |
|---|---:|---|---|
| Elzebub  | I   | Aura / Draconic  | **Draconic / Elemental** |
| Elzimir  | III | Aura / Draconic  | **Draconic / Elemental** |
| Elzoran  | V   | Aura / Draconic  | **Draconic / Elemental** |
| Omegoran | VII | Aura / Corrupted | **Draconic / Elemental / Corrupted** (tri-type) |

**Cascade:** every chain move + species signature originalMove was re-tagged from `Aura` to `Draconic` in the game. Omegoran's signature `The Final Armageddon` re-typed from `Unknown-Void` to `Corrupted`.

**Master codex action:** update the corresponding Master Index rows on the Drive to reflect these types. If any Aurabeasts group / Aura Zyrex list on the drive included the Elzoran line, remove them and re-file under Draconic.

---

## 2. Evolution Unlinks (V2.48, V2.62, V2.63)

Three starter-tier species had `evolveTo` links that were mis-imports. All three lines are now terminal Tier I, and their supposed "evolutions" remain their own independent species.

| Line | Was | Now | Notes |
|---|---|---|---|
| **Otterlin** (I, Beast/Aquatic) | evolveTo: `terralith` @ Lv 11 | **terminal Tier I** | Terralith remains its own Tier II Creature/Nature species |
| **Cinderant** (I, Spirit/Beast) | evolveTo: `vampella` @ Lv 11 | **terminal Tier I** | Vampella remains its own separate species |
| **Flarepaw** (I, Spirit/Beast) | evolveTo: `vampella` @ Lv 11 | **terminal Tier I** | Same — Vampella is a separate species |

**Master codex action:** double-check the master codex evolution table (if any) doesn't preserve these links. The line-relationships pages should treat all three as terminal Basic-tier species.

---

## 3. T×333 Stat Pool Rule (V2.59 — LOCKED CANON)

**New hard rule:** every Zyrex species's base stat pool must equal `tier × 333`.

| Tier | Pool | Tier | Pool |
|---:|---:|---:|---:|
| I   | 333  | VI  | 1998 |
| II  | 666  | VII | 2331 |
| III | 999  | VIII| 2664 |
| IV  | 1332 | IX  | 2997 |
| V   | 1665 | X   | 3330 |

**Distribution across HP/ATK/DEF/SPD/SPC is species-driven** — a magic-heavy Zyrex leans SPC, a tank leans DEF/HP, etc. Only the SUM is fixed.

The rule is now:
- Auto-enforced in `data/build_codex.py` `scale_base_down()` when generating invented lower chain-stages
- Audited at end of every codex regeneration (`python3 data/build_codex.py` prints `OK — all 115 non-exempt Zyrex satisfy pool = tier * 333` or lists mismatches)
- Audited at game boot (`console.warn` if any hydrated SPECIES entry violates)
- Audited by `python3 tools/regen_game_roster.py`

**Master codex action:** if the drive master codex has a stats sheet that differs, that's the drift. Row 274 (Mira) was the one real mismatch — both handled (see §4). Any other tier that has an anomalous total probably means either the tier assignment is wrong or the stats need rebalancing.

### 3.1 Canon exemptions to T×333 (V2.65 — NEW)

Certain species are **explicitly exempt** from T×333 because their lore fixes their stats:

| Species | Tier | Stats (locked) | Pool | Reason |
|---|---:|---|---:|---|
| **Ultharis** | X | 999 / 999 / 999 / 999 / 999 | **4995** | God of the universe.  Stats do not scale to tier target — they max at 999 across the board as canon. |

Exemption is enforced in code via `CANON_STAT_EXEMPT = {'ultharis'}`:
- `data/build_codex.py` audit skips it and prints `EXEMPT ultharis T10 pool=4995 (canon exception — no T*333)`
- `rizers.html` boot audit skips it
- `tools/regen_game_roster.py` audit skips it

Anciuxor (Tier X, all-666 stats = 3330 pool) is **not** exempt — its 666-across-the-board distribution happens to satisfy T×333 naturally.

**Master codex action:** if adding new lore-locked species (Gods, Cosmics, etc.) whose stats shouldn't follow T×333, add them to the `CANON_STAT_EXEMPT` set in all three places, and to this table.

---

## 4. Master Codex Data Errors Fixed in Game (needs drive audit)

The following rows had errors in `data/aov_game_codex_v11.1.xlsx` sheet `9 MASTER INDEX`. Game xlsx is now corrected. **The drive master codex may still have the errors.**

| Row | Species | Tier | Was | Now | Reason |
|---:|---|---:|---|---|---|
| 274 | **Mira**     | VIII (Aura/Spirit, Immortal, ASCENDANT)   | `0 / 0 / 0 / 0 / 0` (empty placeholder) | `666 / 400 / 466 / 400 / 732 = 2664` | Filled per T×333 rule with Ascendant weighting (HP + SPC dominant) |
| 457 | **Ultharis** | X (Ultramax/Spirit, God, ASCENDANCE)      | `999 / 999 / 999 / 999 / 999 = 4995`     | `999 / 999 / 999 / 999 / 999 = 4995` (V2.65 canon lock — exempt from T×333) | God of the universe; stats stay 999x5. Row was correct on the drive all along. |

**Master codex action:** if the drive `9 MASTER INDEX` for Mira / Ultharis differs, sync to these values. Ultharis in particular should NOT be trimmed by any future audit tool.

---

## 5. Newly-Named Canon (candidates for promotion to master)

The game invented or expanded these characters/artifacts during this session. Master codex should decide whether they promote to the drive as full canon.

### 5a. Ten Seer Commanders (V2.41)

One per district II–X (plus Malezor's YARA-PRIME reserved for Chapter I finale). Each holds their district's Gemshard until defeated. Each has an epithet + one taunt line.

| District | Commander | Epithet | Gemshard |
|---|---|---|---|
| I Malezor      | YARA-PRIME | Rubytaker    | Ruby (reserved) |
| II Zarvane     | VORHIL     | Pearlbinder  | Pearl |
| III Andrannor  | MIRAX      | Citrinehand  | Citrine |
| IV Veridan     | THORNE     | Emeraldreaper| Emerald |
| V Netharion    | NULLIS     | Voidsage     | Amethyst |
| VI Vorashil    | ZYPHER-9   | Alienbroker  | Sapphire |
| VII Xilnar     | RESHA      | Onyxwidow    | Onyx |
| VIII Baelgor   | DRAKKUR    | Amberchain   | Amber |
| IX Thardin     | HELIX      | Anomalyweaver| Anomaly |
| X Korathen     | THREEFOLD  | Ultrakeeper  | Ultra |

**Note:** MIRAX (Andrannor commander) shares a name with Mira (Tier VIII Ascendant in the codex). If the master codex wants to differentiate, rename one. Currently the game treats them as unrelated.

### 5b. Nine District Shrines + Relics (V2.44)

Each district II–X has a landmark shrine. First-visit interaction grants a unique named relic + XP. Visiting all 9 unlocks ANCIENT GEMSIGHT.

| District | Shrine | Relic Item |
|---|---|---|
| II Zarvane     | Sunlit Pillar     | **Sunlit Ember** |
| III Andrannor  | Broken Obelisk    | **Ancient Rune** |
| IV Veridan     | Great Tree        | **Verdant Seed** |
| V Netharion    | Void Rift         | **Void Fragment** |
| VI Vorashil    | Alien Landing Pad | **Alien Chip** |
| VII Xilnar     | Spirit Tree       | **Wisp Breath** |
| VIII Baelgor   | Forge Anvil       | **Forge Ember** |
| IX Thardin     | Machine Tower     | **Gear Cog** |
| X Korathen     | Throne Dais       | **Imperial Crest** |

**Meta reward:** `ANCIENT GEMSIGHT` — a lens that reveals hidden geography of Zyraxis (chest counts, undefeated commanders, shrine visits) on the world map view.

### 5c. Twenty District Villagers (V2.47)

Two stationary lore-giving NPCs per district (all 10 districts), each with 2-3 canon-flavored lines. Includes:
- Malezor: Cliff Fisher, Village Elder
- Zarvane: Sun Pilgrim, Gold-Robed Scribe
- Andrannor: Stonecarver, Ruinwalker
- Veridan: Forest Warden, Herbalist
- Netharion: Void Watcher, Purple-Cloak
- Vorashil: Salvager, Skyport Trader
- Xilnar: Wisp-Speaker, Old Medium
- Baelgor: Forge-Hand, Fire-Watcher
- Thardin: Cog-Turner, Pipe-Reader
- Korathen: Throne Priest, Gold-Guard

**Full lines in** `rizers.html` `VILLAGERS` const. These are the first tangible Zyraxian humanoid NPCs the game has named beyond family + Rizers.

**Master codex decision:** are these promotable as canonical NPCs in the drive, or game-only flavor?

---

## 6. Game-Only Rules (informational — NOT for master codex)

Purely mechanical, no drive canon impact.

### 6a. Battle math
- **STAB** (Same-Type Attack Bonus): +50% damage when move type matches attacker's type/type2/type3. Symmetric enemy AI aware. (V2.49)
- **Critical hits**: 6.25% base chance, ×1.5 damage. (V2.49)
- **Formula**: `dmg = base × typeMult × stab × critMult × variance(0.85..1.15)`.
- **Effectiveness callouts** in-battle: SUPER EFFECTIVE / not very effective / STAB! prefixes; floating damage numbers with quality-based color (crit=gold, super-effective=red, resisted=grey).

### 6b. Battle flow (V2.66)
- **Wild encounter `!` indicator**: gemgrass roll no longer starts battle instantly. A `!` speech bubble appears above the player; movement freezes; press A/Enter/Z to engage. The rolled species+level is cached on `game.pendingEncounter` so the pre-armed enemy is the one you fight.
- **FIGHT auto-focus after every action**: after any move / potion / gemsphere / equip / trainer-chain-advance, the action menu rebuilds and the FIGHT button gets a `.primed` class with a slow gold pulse so mobile users see the ready action at a glance.

### 6c. Mobile UX layer
- Controller always visible (V2.55 → V2.57 hard-locked)
- Hold-A on selected party card = inspect (V2.61); tap once = select, tap again or hold A = open Inspect
- Long-press on party card = direct Inspect (V2.54 shortcut)
- Hold-B (Shift) = run 2x speed (V2.46)
- B goes back in every menu (V2.52); on the overworld it's the pause menu
- Battle nameplate click = mid-battle stats inspector (V2.60)

### 6d. Meta features
- ANCIENT GEMSIGHT reveal: world map annotates each district with unopened-chest count / commander-defeated / shrine-visited badges when the relic is held.
- District-signature landmarks: 9 per-district `L` tiles (see §5b).
- District decor tinting: `T` tree / `W` water / `f` flavor decor all pick from per-district palettes so each district reads distinct.

---

## 7. Files Changed This Session (for reference)

| File | Purpose |
|---|---|
| `rizers.html` | Game engine + hand-written SPECIES block. Every commit touched this. |
| `data/aov_game_codex_v11.1.xlsx` | Sheet `9 MASTER INDEX` rows 274 (Mira) + 457 (Ultharis — restored to 999x5) rebalanced; sheet `14 GAME ROSTER` rows 20/21/26/59-62 updated for evolution unlinks + Elzoran retype. |
| `data/build_codex.py` | `scale_base_down()` now enforces T×333; end-of-run audit added with `CANON_STAT_EXEMPT` set (V2.65). |
| `data/codex.json` + `data/codex.js` | Regenerated. 116 Zyrex, 115 pass T×333 audit + 1 exempt (Ultharis). |
| `data/RPG_MASTERY_BLUEPRINT.md` | Six-layer arc redesign roadmap (V2.49 → V3.9). |
| `data/MASTER_CODEX_HANDOFF.md` | This document. |
| `GAME_ROSTER.md` | Repo-root markdown roster (131 species tiered). |
| `game_roster/index.html` + `roster.json` + `README.md` | Color-coded browsable pokedex. |
| `tools/regen_game_roster.py` | Reproducible roster regen with T×333 audit + exempt handling. |

**Regen workflow after any master → game sync:**
```
python3 data/build_codex.py            # codex.js + codex.json + T*333 audit
python3 tools/regen_game_roster.py     # GAME_ROSTER.md + roster.json + audit
```

---

## 8. Suggested Master Codex Update Order

If the master cowork session is going to sync, recommended order:

1. **First** — verify Mira (row 274) stats on the drive; if drive still has 0s, update to the corrected 666/400/466/400/732 = 2664 values from §4.
2. **Second** — apply the four Elzoran-line type changes (§1).
3. **Third** — audit the drive evolution table; remove the Otterlin→Terralith, Cinderant→Vampella, Flarepaw→Vampella links (§2).
4. **Fourth** — decide on which species are `CANON_STAT_EXEMPT` on the drive side (§3.1). Ultharis is the first; add others as they emerge.
5. **Fifth** — if master codex has stat blocks for other species, run its own T×333 audit. Any row that doesn't sum to tier × 333 needs rebalancing (or an exemption).
6. **Sixth** — decide on promotion of the 10 Seer Commanders (§5a), 9 shrine relics (§5b), and 20 villagers (§5c) to full master canon or leave as game-only invented content.
7. **Seventh** — after any drive edits, bump master codex version (Page 1 header protocol) and re-export sheet 9 (MASTER INDEX) so game can re-import via `python3 data/build_codex.py`.

---

## 9. Open Questions for Master Cowork

Things this session couldn't decide unilaterally — flag them in the master session:

- **Mira vs MIRAX name collision.** Codex Mira (Tier VIII Aura/Spirit Ascendant) shares a name with the invented Andrannor Seer Commander MIRAX. Rename one?
- **Vampella / Terralith status.** These are the "supposed evolution" species that got unlinked. Are they Tier II standalones (as codex currently has them), or should they be re-linked to a different line?
- **Ancient Gemsight lore.** The game names it a "lens behind your eyes" but doesn't tie it to canon. Is this promotable to master (e.g., linked to the Mothergem lore) or purely game invention?
- **Villager promotion.** Master codex has Zyraxian classes (protagonist / antagonist per the character-classes memory). Do the 20 villagers get their own class in the drive (e.g., "Citizen" or "Zyraxian Local")?
- **God-tier exemption list.** Ultharis is currently the only `CANON_STAT_EXEMPT` entry. Should any of the other Tier X / Tier IX ASCENDANCE species also be exempt from T×333? (Anciuxor's all-666 satisfies naturally, so no exemption needed there — but Abominalys/Abyssion/Aegiri all currently sum to Tier×333 correctly, so no drift.)

---

## 10. Commit Log Reference

Every commit since the previous handoff is on `main`. Quick reference:

- `V2.48` (`02ce807`) — Otterlin ≠ Terralith
- `V2.49` (`0a6dfa3`) — Battle: STAB + crits + damage feedback
- `V2.50` (`f6ec348`) — Title NEW GAME/LOAD GAME + Seer removed from creator
- `V2.51` (`2c5fce8`) — Villagers use standard chibi + shirt colors
- `V2.52` (`b6d7df8`) — B goes back in menus; center title/creator on mobile
- `V2.53` (`84bed89`) — Starter picker: opaque bg + scroll + drop tiny type badge
- `V2.54` (`6ac8b3a`) — Long-press inspect on party cards
- `V2.55` (`59d7611`) — Controller always visible except while typing
- `V2.56` (`dce06ea`) — Indoor maps play the main-floor music
- `V2.57` (`7636481`) — Controller hard-locked visible (rip updateHidden)
- `V2.58` (`f849aaf`) — Elzoran-line retype
- `V2.59` (`db38bb9`) — T×333 stat pool rule
- `V2.60` (`c66bc6b`) — Battle nameplate inspect
- `V2.61` (`98495d7`) — Party card selection
- `V2.62` (`5f3a53b`) — Cinderant ≠ Vampella
- `V2.63` (`8894bed`) — Flarepaw ≠ Vampella
- `V2.64` (`_ · game roster commit`) — GAME_ROSTER.md + visual pokedex
- `V2.65` (`93305aa`) — Canon stat exemptions (Ultharis 999x5 exempt)
- `V2.66` (`37e4e19`) — Battle flow: `!` encounter indicator + primed FIGHT button

---

*End of handoff. Master cowork session — reply here when synced, or flag any conflicts.*
