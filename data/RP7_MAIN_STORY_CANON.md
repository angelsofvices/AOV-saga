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

### 6.2 "Thardun" vs "Thardin" · RESOLVED 2026-08-26 · ONE SPELLING
**Creator ruling 2026-08-26: THARDIN, one spelling for both** — the corporation wears
the district's own name (that shared name is now the intrigue, not a near-miss
spelling). "Thardun" is retired everywhere; all in-game references renamed v0.95.843.

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

### 6.5b ★★★★ SUPERSEDED SAME DAY · **MASTERS = HAEMEN · ELDERS = AETHREN**

> **Creator, 2026-09-01:** *"masters are haemen. elders are aethren. **kelthor is the main beastmaster of malezor.** both classes give you expedition missions (10 in total). npcs still give quests."*

★★★★ **This is a bigger ruling than it looks, because HAEMEN and AETHREN are already
locked type-classes** **[BUILD]** `rp7b.html:37478`:

> *"**HUMANOID is the sole HAEMEN type; the other standard types are AETHREN**; Aquatic sits in the MASS class."*

| office | class | means |
|---|---|---|
| **MASTER** | **HAEMEN** | ★ **HUMANOID.** A person |
| **ELDER** | **AETHREN** | ★★★ **one of the other nineteen types. NOT humanoid** |

> ★★★★ **A district's Elder is not a human being. It is a being OF THE DISTRICT'S OWN
> KIND.** The Auralands are counselled by something Aura. The Spiritlands by something
> Spirit. **The Master speaks for the people; the Elder speaks for the land.**

★★ **"Warden" is retired.** Kelthor is **the main Beastmaster of Malezor** — a
**MASTER** — and the build's *"Elder Beastmaster KELTHOR"* (`:32050`) was conflating
the two offices. ★ **Dad is a Beastmaster under him**, which finally gives Dad a rank.

★★★ **AND IT RESOLVES OMNIRIS.** `OMNIRIS_ZARVANE_ELDER_DRAFT.md` asked to confirm a
**Humanoid-primary flip**, which has already shipped — while his sprite still lives at
`assets/2D sprites/zyrex/omniris.png`. **Under this ruling an Elder is AETHREN, i.e.
NOT humanoid. The flip was the error and the file path was right.** ★ Flagged for
reversal, not changed here.

#### ★★★★ "EXPEDITION" = MAIN QUEST · the build already said so

`rp7b.html:32375` carries an older Creator quote verbatim:

> *"**main quests are expeditions tied to each village elder/master**… you need to
> complete each main mission in order for story to progress. **side missions can unlock
> at any time if u talk to the right npc.**"*

**So the taxonomy is now fully determined:**

| | given by | gates story? |
|---|---|---|
| ★ **EXPEDITION** = the **MAIN** quest | **Masters + Elders** · **10 total** | ★ **yes, in order** |
| **QUEST** = the **SIDE** mission | **NPCs** | no · anytime |

★★★★ **AND IT SIMPLIFIES THE MISSION SPINE.** §3 says *"seven missions per district ×
ten = 70."* **"Ten in total" says the container is the district, not the beat.**
★★ **Recommended reading: TEN EXPEDITIONS, one per district, each with several steps —
and the seven-beat shape (§3) is the shape of the STEPS INSIDE ONE.** That reconciles
both numbers and matches *"complete each main mission in order."*

#### ★ WHAT IT COSTS · the count went UP

★ Yesterday's §6.5 said *"nine Elders to name."* Under Haemen/Aethren there are **two
offices per district**:

| | seated today | needed |
|---|---|---|
| **MASTERS** (Haemen · humanoid) | **Kelthor** · Malezor | **9** |
| **ELDERS** (Aethren · non-humanoid) | **Omniris** · Zarvane | **9** |

★★★ **[ASK] — the one thing I need before naming anybody: does every district have
BOTH?** *(18 figures, 10 expeditions between them)* — or **one or the other per
district** *(10 figures, 10 expeditions)*? ★ The second is cheaper and cleaner; the
first is what *"both classes give you expedition missions"* most naturally implies.
**Not assumed.**

★★ **A naming rule falls out for free either way.** Kelthor is the **BEAST**master of
the **BEAST**lands. **The Master's title is the district's land-type**, so all ten are
derivable: Auramaster · Creaturemaster · Naturemaster · Spiritmaster · Techmaster and
so on. ★ **The Elders, being Aethren, are named as beings rather than offices** —
which is exactly what Omniris is.

---

### ~~6.5 · Elders vs Wardens · ELDER = MAIN · WARDEN = MASTERY~~ · ★ SUPERSEDED by 6.5b

> **Creator, 2026-09-01:** **Elder = main chain · Warden = mastery track.**
> The proposed reconciliation below is **adopted as written.**

**Every district gets two named authorities:**

| office | gives | teaches | example |
|---|---|---|---|
| **ELDER** | ★ the **main-mission chain** · civic authority | the district's discipline | **Omniris**, Zarvane · THE SIGHT |
| **WARDEN** | the **mastery track** alongside it · bond mentor | THE BOND | **Kelthor**, Malezor |

★★★ **CONSEQUENCE — it is NINE Elders to name, not eight.** `DISTRICT_ELDERS`
**[BUILD]** currently reads `malezor → 'Warden Kelthor'`. Under this ruling **Kelthor
is a Warden and vacates that row**, so Malezor needs an Elder too. Only **Omniris**
(Zarvane) is correctly seated today.

| district | ELDER | WARDEN |
|---|---|---|
| Malezor | ★ **needed** | ✔ Kelthor |
| Zarvane | ✔ **Omniris** | ★ needed |
| Andrannor … Korathen (8) | ★ **needed** | ★ needed |

★ **[BUILD] follow-up, not done here:** `DISTRICT_ELDERS` needs Kelthor moved to a
`DISTRICT_WARDENS` table (or an `office:` field), and eight `handoff:'TBD -> …'`
placeholder strings confirmed non-rendering. Its own version and suite.

---

### 6.5-original · the reasoning that produced the ruling
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

### 6.7 ★★★ THE TURN · **RULED 2026-09-01 · THE INVASION OF MALEZOR · KELTHOR DIES**

> **Creator, 2026-09-01.** Of the two incompatible versions of the story's central
> turn, **B is canon.**

| | |
|---|---|
| ~~**A**~~ | ~~parents taken in **Vorashil (VI)**, off-screen, as Seer retaliation~~ — **RETIRED** |
| ★ **B** | **THE INVASION OF MALEZOR.** The parents are taken **on-screen, in Malezor**, and **KELTHOR DIES covering the evacuation.** (`KELTHOR_ARC_DRAFT.md`, mission VIII) |

★★★ **Why this is the stronger story, stated so the rewrite keeps the reason:** the
kidnapping happens **where the player lives**, in the district they were taught to
survive, and it **costs them the man who taught them**. Malezor stops being the
tutorial and becomes the wound. It also gives *The Ruby Rage* its real fuel — the S1
surge is grief, and **Rakoron's answer to grief is the discipline that becomes S2.**

### ★★ CONSEQUENCES — three, and the third is a real loss

1. ★★★ **KELTHOR MUST LEAVE THE BRIDGE OF HOPE FAREWELL.** The archived farewell is
   **Mom · Dad · Kelthor · Myara**. He is dead by then. **New roster: Mom · Dad ·
   Myara + one.** ★ The empty fourth place is worth *using* rather than filling —
   a farewell with a gap in it is the same shape as the Empty Throne, and the game
   is already about a missing tenth.
2. ★★ **Vorashil's mission 7 needs a new turn.** It currently carries the off-screen
   kidnapping. Vorashil still owns **S1 + the first Orryx defeat**, which is enough
   for a district — but the beat that pushed the player out of it is gone.
   ★ **[INFER] Suggestion, not written:** Vorashil is where the player *learns* the
   invasion already happened. S1 is perception; the first thing clear sight shows
   him is what he missed.
3. ★ **Act ordering shifts.** The build's own act model — *"Act II begins in the
   Auralands · Malezor stays untouched during Act I"* and a **"Baelgor siege wave"**
   (`rp7b.html:~25164`) — is now closer to canon than the doc spine was, since it
   already expects Malezor to be hit later. **Worth reconciling rather than
   discarding.**

### 6.8 ★★★ THE PROTAGONIST · **RULED 2026-09-01 · NAMED "RIZER"**

> **Creator, 2026-09-01: named "Rizer."** §6-adjacent conflict closed — the archived
> *"custom name, chosen gender, silent-protagonist"* line is **retired**.

★★ **NPCs address him by name.** The **Player–Rizer bond axis** (`rizerBondTotal()`
**[BUILD]**) stays meaningful, because there is someone on the other end of it.
★ The existing Dad and Kelthor trees already write this way — *"Smart find, kid"*,
*"You crossed a border for me"* — so **the shipped voice does not need rewriting to
match the ruling; it needs the rest of the game brought up to it.**

★ **Style rule this sets for the pass:** characters speak **to** Rizer, not **at** a
cursor. Where a line could be addressed to anyone, it is a toast, not dialogue.

---

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
