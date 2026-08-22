# RP7 · MAIN STORY CANON
**Merged 2026-08-22 from `rp7_main_story_progression_draft.md` into the live build (v0.95.741).**

The draft is now canon **except** where it collides with something already running in
`rp7b.html`. Every collision is listed in §6 — none were silently resolved, and **no game
code was changed by this merge.**

Headline: the draft and the build already agreed on far more than they disagreed on.
The district order I–X matches `TOWER_ORDER` exactly, 9 of 10 Land names match
`DISTRICT_WHEEL`, and the five-act spine (Netharion = Ophira · Vorashil = Orryx ·
Xilnar = the test · Korathen = finale) matches the story canon already in memory.

---

## 1 · THE SPINE — ADOPTED WHOLE

The Seers are not raiding. Under **Xenoxil, the Flesh Lord**, they are destabilising the
ten districts to seize Zyraxis as one connected system. **Orryx** and **Ophira** run the
visible campaign; Xenoxil directs the ritual beneath it. They siphon Astral energy,
corrupt mortals into Mori and Daemon, exploit the missing Gemlords, and move to replace
the authority that once held Zyraxis together.

Three arcs:

1. **The Young Bonder** — first Zyrex, first faction, the Elders' trust.
2. **The Awakened Rizer** — Azurel unlocks **S1**. Rizer and his faction beat Orryx and
   Ophira for the first time; the Seers answer by taking his parents. His rage
   destabilises what Azurel opened. Rakoron bonds with him directly and unlocks **S2**.
3. **The Defender of Zyraxis** — unite the districts, expose the occupation's purpose,
   reach Korathen, stop the takeover.

### ★ The S1 → S2 order is locked

- **S1 · Azurel (Vorashil).** Perception, clarity, controlled Aura circulation.
  **Not fuelled by anger.** Azurel opens and stabilises the channel.
- **S2 · Rakoron (Malezor).** Built *on top of* Azurel's channel. Disciplined fury,
  protective instinct, survival. Rakoron does not hand over power — he bonds directly
  and teaches Rizer to command the rage instead of being ruled by it.

This corroborates the weapon lore already in canon: the **Sapphire Tearsword** is S1
(Azurel's crystallised tear) and the **Rubypaw Longsword** is S2 (Rakoron's iron and
dragonlion mist). Two Gemlords, two tiers, same order. Nothing to reconcile.

---

## 2 · FOUR PROGRESSION AXES — ADOPTED

| Axis | Represents | Unlocks |
|:--|:--|:--|
| **RXP** | Player/Rizer combat mastery | Command capacity, techniques, higher-tier deployment |
| **Bond** | Trust — with Rizer, with allies, with a specific Zyrex | Recruitment, Zysphere effectiveness, advanced cooperation |
| **Expeditions** | Exploration of dangerous district regions | Encounter pools, hidden areas, rare Zyrex, materials |
| **Quests** | Service to residents, progress against district threats | Allies, habitat changes, special encounters, advantages |

**No axis may substitute for another.** Power-level RXP without relationships and you
do not get every ally. High bond with no expedition progress and the strongest wild
Zyrex never appear. Explore widely but skip district quests and you will find rare
creatures you lack the standing to bond with.

This is a **direct extension of what is already built**, not a replacement:
`tryRecruitWildZyrex` already gates on `requiredBondForTier(tier)` against
`rizerBondTotal()`, and the Zysphere 5 % → 95 % curve is unchanged.

### Recruitment states (adopted)

`Unknown → Discovered → Connected → Eligible → Faction Member → Trusted/Veteran`

The live build currently implements roughly **Unknown → Eligible → Faction Member**
(bond gate, then join). *Discovered*, *Connected* and *Trusted/Veteran* are new and
unbuilt — see §7.

---

## 3 · DISTRICT MAIN-MISSION CHAINS — ADOPTED

Seven missions per district, Elder-given, ending in that district's Gemlord trial and
the road to the next. Full chains are preserved verbatim from the draft:

| # | District | Land | Gemlord | Story function |
|:-:|:--|:--|:--|:--|
| I | **Malezor** | Beastlands | Rakoron, the Rubylord | First Zyrex, survival, bond philosophy. **Returns for S2.** |
| II | **Zarvane** | Auralands | Ivirium, the Pearlord | Aura perception, first Rizer combat |
| III | **Andrannor** | Creaturelands | Mutaryn, the Citrinelord | Evolution, hybrid threats, faction expansion |
| IV | **Veridan** | Naturelands | Emeralix, the Emeralord | Ecosystems, the planet made vulnerable |
| V | **Netharion** | Unknownlands | Eurakeon, the Amethystlord | **First Ophira defeat**, the ritual discovered |
| VI | **Vorashil** | Alienlands | Azurel, the Sapphirelord | **S1**, first Orryx defeat, parents taken |
| — | **Malezor Interlude** | — | Rakoron | **The Ruby Rage → S2** |
| VII | **Xilnar** | Spiritlands | Obsidius, the Onyxlord | Death-energy, the parents' purpose revealed |
| VIII | **Baelgor** | Humanoidlands | Ambrevon, the Amberlord | Homecoming to ruin, the Pledge rewritten |
| IX | **Thardin** | Mechlands | Oathane — *see §6.3* | Technology without oversight, the control grid |
| X | **Korathen** | Ultralands | Oatheus — missing | Council of Gemlords, rescue, three-Seer battle |

**Main-story scaling** (adopted): Malezor–Zarvane establish the system · Andrannor–Veridan
introduce roster decisions · Netharion–Vorashil demand purposeful composition and expand
Rizer's own combat role · the Interlude turns on who your existing bonds are ·
Xilnar–Baelgor need veterans and Spirit specialists · Thardin–Korathen make the
accumulated faction the *proof* that Zyraxis is united.

---

## 4 · THIRTY LORE BUILDINGS — ADOPTED AS THE APPROVED ROSTER

Three per district. These slot into `aov-district-content-formula` as the **named,
story-bearing** structures alongside the generic per-district set (homes, school, Battle
Hall, shop, landmark, Seer HQ, Gemlord cave, tower).

| District | Buildings |
|:--|:--|
| **Malezor** | The Fanghall · The Bloodscent Lodge · The First Den |
| **Zarvane** | The Resonance Spire · The Quiet Between · The Vibration Conservatory |
| **Andrannor** | CLUB VX *(§6.4)* · The Morphic Menagerie · The Chimera Exchange |
| **Veridan** | The Root Parliament · The Seedvault · The Overgrowth Hospice |
| **Netharion** | The Impossible Archive · The Null Observatory · The Crooked House |
| **Vorashil** | The Shape Embassy · The Unmouth Academy · The Manybody Habitat |
| **Xilnar** | The Last Lantern · The Blackwake Chapel · The Walking Lord's Station |
| **Baelgor** | Baelgor University · The Hall of First Settlement · The Tenfold Forum |
| **Thardin** | The Orphan Foundry · The Precision Ministry · The Anomaly Engine |
| **Korathen** | The Empty Throne · The Tribunal of Ten · The Mothergem Sanctum |

**None of the thirty exist in the build yet.** The Fanghall is the highest-value first
build: it is where Malezor's Elder gives mission 1, and Malezor is the only district with
a finished NPC spine.

---

## 5 · GEMLORD RECRUITMENT — ADOPTED, AND IT RESOLVES AN OPEN QUESTION

To add a Gemlord: defeat it in its cave through **Player Faction vs. Enemy** combat, earn
its respect, and hold Player–Rizer Bond above **80 %**. The ancient non-intervention pact
still limits when a Gemlord may be deployed.

★ This **resolves** what looked like a conflict. The build's `requiredBondForTier(10)` is
3330 = 100 %, and the draft says 80 % — but they gate *different things*:

- **80 % → you may attempt the Trial.** (Matches `aov-combat-recruitment-canon` already.)
- **tier × 333 → you may deploy what you won.**

Winning a Gemlord's respect and being able to field it are separate permissions. No code
change needed; both numbers stand.

---

## 6 · CONFLICTS — NOT SILENTLY RESOLVED

### 6.1 Vorashil's Land · **build wins**
Draft says *Allelands*; `DISTRICT_WHEEL` says **Alienlands**, and that string is live
across a 16,269-prop world. Treated as a typo in the draft. Say so if it was deliberate.

### 6.2 "Thardun" vs "Thardin" · **build wins**
The draft spells district IX *Thardun*. The build uses **`thardin`**, and existing canon
has **Thardun** as the *corporation* (`aov-thardun-zysphere-canon` — "Thardun corp of
Thardin"). Kept distinct: **Thardin** the district, **Thardun** the company.

### 6.3 ★★ Oathane is called MISSING · **NEEDS YOUR RULING**
The draft lists Thardin's Gemlord as *"Oathane, the Anomaly — missing"* and builds the
whole district arc around searching for him. **The build treats Oathane as present**: he
has a Gemlord card (`OATHANE · GEMLORD OF THARDIN`), a placed cave, and a working door.
Existing canon has only **one** absent Gemlord — Oatheus, the Empty Throne.

Two missing Gemlords is a much bigger story than one, and it changes what Thardin's cave
door should do. Nothing has been changed pending your call.

### 6.4 CLUB VX vs Club 50 · **NEEDS YOUR RULING**
The draft's Andrannor nightclub is **CLUB VX**. The build has a prop `club_50`, and
canon has **Club 50** run by ally **Vladimir Valenov**, dealing cheap faedust to the
inner city. Same venue renamed, or two clubs?

### 6.5 ★ Elders vs Wardens give the main missions · **NEEDS YOUR RULING**
The draft: *"District Elders give the main missions."*
Existing canon (`aov-quest-source-canon`): *"Warden-class = MAIN missions · citizen
allies = SIDE quests · one Warden per district."*

The build has **both**: Kelthor is Malezor's **Warden** (8-step Bond Mentor, teaches THE
BOND) and Omniris is Zarvane's **Elder** (8 oasis trials, teaches THE SIGHT).

**Proposed reconciliation** — they are different offices and the draft only needs one
word changed: the **Elder** is the district's civic authority and gives the *main-mission
chain*; the **Warden** is the bond mentor and gives the *mastery track* that runs
alongside it. That keeps Kelthor and Omniris both intact and gives every district two
named authorities instead of one overloaded one. Not applied yet.

### 6.6 Recruitment states are ahead of the build · **informational**
*Discovered*, *Connected* and *Trusted/Veteran* have no implementation. The build goes
straight from "wild Zyrex exists" to "bond gate passes → joins". Building the full
six-state model would touch the recruit path, the contact registry and the save schema —
flagged as scope, not started.

---

## 7 · WHAT THIS UNBLOCKS

Highest value first, given Malezor is the only district with a finished NPC spine and a
seeded wild-Zyrex habitat:

1. **The Fanghall** — Malezor's Elder needs somewhere to stand. One building unlocks
   main missions 1, 5 and the S2 Interlude's step 3.
2. **Malezor's 7-mission chain** — the district already has Kelthor, the Elder role, the
   Rubylord's cave, a Seer HQ and 13 wild species. It is the one district where the
   draft could be played end to end.
3. **The Ruby Rage Interlude** — self-contained, set entirely in a district that already
   exists, and it is the emotional centre of the whole game.
4. The other 27 buildings and 63 missions, district by district.

---

## 8 · DRAFT STATUS

Per the source document: building names and concepts are the **approved roster**;
individual missions may be kept, rejected, renamed, reordered or expanded district by
district. This file is the merged canon — the draft it came from is preserved at
`data/_source/rp7_main_story_progression_draft.md`.
