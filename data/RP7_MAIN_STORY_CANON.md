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

~~★★★ **[ASK] does every district have BOTH?**~~ ★★★★ **RULED 2026-09-01: EITHER, NOT
BOTH.**

> **Creator:** *"every district has either an elder or a master. kinda wanna name them
> later so they are logical and not just cookie cutted in."*

★★★★ **Ten districts, ten officers, ten expeditions — and the commission drops from
eighteen figures to EIGHT**, since Kelthor and Omniris are already seated.

★ **Names deliberately deferred.** What follows is **the assignment and the rules**, not
a cast list — so that naming later is *constrained* rather than free-form, which is
exactly the way to avoid cookie-cutter.

#### ★★★★ THE ASSIGNMENT RULE · a Master where humanoids hold the ground; an Elder where they do not

**It is nearly forced by the type-classes themselves.** A Master is **HAEMEN
(humanoid)**; an Elder is **AETHREN**, a being of the district's own type. So:

> ★★★★ **The districts with MASTERS are the ones people RUN.
> The districts with ELDERS are the ones people are GUESTS in.**

| # | district · land | officer | why |
|:-:|---|---|---|
| I | **Malezor** · Beastlands | ★ **MASTER** | ✔ **Kelthor**, given. Home, settled, the tutorial ground |
| II | **Zarvane** · Auralands | ★ **ELDER** | ✔ **Omniris**, given — and he is **Aura**, the land's own type |
| III | **Andrannor** · Creaturelands | **MASTER** | inner city, Club 50, the Chimera Exchange — **the most human district on the map**, and its sins are human |
| IV | **Veridan** · Naturelands | **ELDER** | the Root Parliament, and *"the trees grew that gap on their own"* — **the land already governs here** |
| V | **Netharion** · Unknownlands | **ELDER** | the Impossible Archive. **Nobody runs Netharion** |
| VI | **Vorashil** · Alienlands | **ELDER** | not ours |
| VII | **Xilnar** · Spiritlands | **ELDER** | souls vanishing; Obsidius walks here. **The dead have seniority** |
| VIII | **Baelgor** · Humanoidlands | ★★★ **MASTER · FORCED** | **Humanoid *is* the Haemen type.** An Aethren Elder of the Humanoidlands is a contradiction in terms |
| IX | **Thardin** · Mechlands | **MASTER** | the Precision Ministry, THARDUN, the utility prisms. **A district that manufactures is a district people run** |
| X | **Korathen** · Ultralands | ★★★ **ELDER** | see below |

**Masters 4 · Elders 6.**

#### ★★★★ Korathen takes an ELDER, and it is the best part

★★★★ **Because Korathen's humanoid chair is the EMPTY THRONE — and it is empty.**

> **The one district whose authority is missing gets a non-human officer by default.**
> The land still speaks. **The people's seat is vacant, and the whole endgame is about
> that vacancy.**

★ The structure states the plot before a line of dialogue does.

#### ★★★ The 4/6 split is lumpy on purpose — and the lump IS the campaign

Read the sequence: **Master · Elder · Master · Elder · Elder · Elder · Elder · Master · Master · Elder.**

★★★★ **Four Elders in a row across IV–VII** — Naturelands, Unknownlands, Alienlands,
Spiritlands. **Four consecutive districts where humanoids are guests.** That is the
middle of the campaign going strange, and it happens *structurally* rather than by
description.

★★★★ **And then Baelgor (VIII) is a MASTER — the homecoming.** His parents' hometown,
the Pledge, the University. **The return to humanity is announced by the return of a
human authority**, one district before Thardin and the end.

★ A tidy alternation would have destroyed that. **The unevenness is the shape.**

#### ★★ RULES FOR THE NAMING PASS, WHENEVER YOU DO IT

- **MASTERS** — title = **the district's land-type**. Kelthor is the **Beast**master of
  the **Beast**lands, so Andrannor takes a **Creature**master, Baelgor a
  **Humanoid**master, Thardin a **Tech**master *(or Mech—, your call)*. ★ The **title**
  is derivable; **the person is not.**
- **ELDERS** — ★★★ **named as BEINGS, not offices**, which is exactly what *Omniris*
  is. Each must be **of its district's own type**: Veridan **Nature/Verdant** ·
  Netharion **Unknown** · Vorashil **Extraterrestrial** · Xilnar **Spirit** · Korathen
  ★ **[ASK]** — *Ultimate is the never-obtainable 21st, so Korathen's Elder is probably
  **Astral** or **Divine**. Worth deciding before it is designed.*
- ★★ **One hard test for the set:** if an Elder could be redrawn as a human in costume
  without losing anything, **it is a Master wearing the wrong word.**

---

### ★★★★★ 6.5c · THE SEER COUP · they overthrew the native Elders

> **Creator, 2026-09-01:** *"the seers overthrew the native elders in their respective districts once they formed their coupe. this is how they hold the middle districts and spread corruption up and down."*

#### ★★★★★ 1 · THREE districts — and the mission chains already named who holds each

> **Creator, correcting:** *"the seers only hold 5 6 and 7."*

**NETHARION · VORASHIL · XILNAR.** Not four — **three**, and dead centre of the ten.

★★★★★ **Three occupied districts. Three named Seers. And the assignment was already
written, months ago, into the district arcs:**

| # | district | the arc says | ★ therefore |
|:-:|---|---|---|
| **V** | **Netharion** | *"**first Ophira defeat**"* | ★★ **OPHIRA holds Netharion** |
| **VI** | **Vorashil** | *"**first Orryx defeat**"* | ★★ **ORRYX holds Vorashil** |
| **VII** | **Xilnar** | *"souls vanishing · **Xenoxil's Six**"* | ★★ **XENOXIL holds Xilnar** |

★★★★★ **The coup ruling and the mission chains were written independently and they line
up exactly. Nothing had to be bent.**

★★★★ **And it answers where the castles go.** *"The three seers still need their castles
designed"* — **each Seer's castle stands in the district they took: V, VI, VII.** The
three castles and the three occupied districts are one commission.

★★ **I had the shape and the wrong reason AND the wrong width.** The assignment stands;
**Veridan comes back out of the occupation.**

#### ★★★★★ 2 · Overthrowing an ELDER is the Seer thesis at civic scale

★★★★ **An Elder is AETHREN — the being that speaks for the land.** The Seers are the
religion of **taking power without bonding** — the anti-bond.

> **They did not negotiate with the land. They deposed it and sat in its chair.**

★★★ **That is the same act as their magic, performed on a government.** Siphoning,
sacrifice, corruption, the harvest — and now this. **Every Seer method is the refusal
to ask.**

★ **And it sharpens why they left the Masters alone** *(flagged, not assumed)*: a Master
is a **person**, and people can be pressured, infiltrated, collaborated with — which is
exactly what Baelgor's arc already is, *"the Pledge rewritten by collaborators."*
**An Elder cannot be collaborated with, because it is not of your kind. It can only be
removed.**

#### ★★★★★ 3 · IT SOLVES THE EXPEDITION-GIVER PROBLEM — and improves it

★ **The obvious circularity:** if the Elder gives the district's expedition and the
Elder has been overthrown, **who talks?**

> ★★★★★ **The Elder does — from hiding.**
>
> **In a Master district the officer sits in a hall.
> In an occupied Elder district, the officer is a FUGITIVE, and you have to find them
> before they can send you anywhere.**

★★★★ **So the player reads the map's politics off where the quest-giver is standing.**
Formal, seated, civic — or underground, displaced, and speaking carefully. **No
exposition required.**

★★ It also gives four districts their expedition spine for free: **reach the Elder ·
learn what was taken · put them back.**

#### ★★★★★ 4 · OMNIRIS IS THE CONTROL CASE — and that is why he is district II

**Zarvane's Elder is not deposed.** Omniris is seated at his oasis, running his eight
trials, teaching THE SIGHT.

> ★★★★★ **The player meets a FREE Elder first — so that they know what an Elder is
> supposed to be — and then walks into four districts where the Elder is gone.**
>
> **Omniris exists so the player can recognise what has been taken.**

★ The gradient is now: **II free · IV–VII occupied · X the Empty Throne.** Three states
of authority, in order.

#### ★★★★ 5 · THE COMMANDERS ARE WEARING THEIR PREDECESSORS

`SEER_COMMANDERS.md` already carries the design rule, written before this ruling:

> *"the district is CORRUPTION, not costume — **the Seer parts are WORN, the district parts are ATTACHED.**"*

★★★★★ **Now it means something specific and horrible: the district parts are attached
because they came off the Elder.** A Commander sitting in a deposed being's seat,
wearing pieces of it. **The rule did not need changing — it needed a reason, and it now
has one.**

★ **[FLAG] ten Commanders, four occupied districts.** So the Seers have a **presence**
everywhere and **control** only in the middle. ★★ That reads correctly — *infiltration
across the map, occupation at the centre* — and it is what makes Baelgor's collaborators
and Thardin's Precision Ministry different problems from Xilnar's.

#### ★★★★ 6 · AND IT MAKES THE INVASION OF MALEZOR STRUCTURAL, NOT AN ESCALATION

*"Spread corruption **up and down**"* — from the centre, outward, toward both ends.

> ★★★★ **Malezor is the far end of "down." The Invasion is the front line arriving.**

★★★ **Which retires the last arbitrary thing about the story's central turn.** The
parents are not taken because the plot needed a loss — **they are taken because the
player spent four districts pushing the Seers, and the Seers pushed back along the axis
they were always moving on.** ★ And it gives the player a map they can read the threat
off: *the middle is theirs, and it is getting wider.*

#### ★★★★★ 6b · THE MAP IS NOW A POLITICAL DIAGRAM

```
  I    MALEZOR     MASTER   ← INVADED, Act IV · the far end of "down"
  II   ZARVANE     ELDER    free · ★ the control case (Omniris seated)
  III  ANDRANNOR   MASTER   free
  IV   VERIDAN     ELDER    free · ★★★ THE FRONTIER — the last free Elder
 ─────────────────────── the border ───────────────────────
  V    NETHARION   ELDER    ★ OCCUPIED · OPHIRA
  VI   VORASHIL    ELDER    ★ OCCUPIED · ORRYX
  VII  XILNAR      ELDER    ★ OCCUPIED · XENOXIL
 ─────────────────────── the border ───────────────────────
  VIII BAELGOR     MASTER   free · ★★ collaborators
  IX   THARDIN     MASTER   free
  X    KORATHEN    ELDER    ★ the Empty Throne
```

★★★★ **VERIDAN IS THE FRONTIER, and its arc already reads that way.** *"Ecosystems
failing · a cure turns predatory · **proof the planet is being PREPARED**."*
**The land is sick because the border is next door.** ★★ **Veridan is the free district
that can see the occupied one** — which is why the evidence surfaces there and nowhere
earlier.

★★★★ **AND IT EXPLAINS BAELGOR'S COLLABORATORS.** Baelgor sits directly above the
occupation and is a **MASTER** district. ★★★ **Going DOWN the Seers meet Elders and
depose them. Going UP they meet Masters — people — and persuade them instead.**
*"The Pledge of Baelgor rewritten by collaborators"* is not a different kind of story;
**it is the same expansion using the only method that works on humans.**

★ Which finally makes *"spread corruption up and down"* two distinct campaigns rather
than one word: **conquest downward, conversion upward.**

---

### ★★★★★ 6.5d · THE SEERS HAVE AN ORIGIN, AND IT IS GRIEF

> **Creator, 2026-09-01:** *"all other districts are invaded as well. that is why there are seer hqs in all 10. **the seers are not new, they were once a respectable pact led by ophiras father who passed away. she then took over in grief and spread corruption in 5 and 6, once they got to 7, they linked up with xenoxil** and was able to invade all other districts, unleashing mori, daemon, and kidnapping/ancient cult vibes. **malezor is currently the most uninhabited seer district. this is the call to action for rizer to make his legacy. save the world. avenge the fallen.**"*

#### ★★★ 1 · CORE AND PERIPHERY · both statements are true

★ *"They hold 5, 6 and 7"* and *"all other districts are invaded"* reconcile into one
map, and it is a better one than my border diagram:

| | districts | what happened |
|---|---|---|
| ★★ **THE CORE** | **V · VI · VII** | ★ **Ophira's original conquest.** Deepest corruption · **the Elders were DEPOSED** · the three castles |
| **THE PERIPHERY** | I–IV, VIII–X | ★ **invaded later, with Xenoxil.** Seer **HQs in all ten** · occupied but **not decapitated** |

★★★ **[INFER] The difference the player feels: in the periphery the local authority is
still standing, under pressure — Omniris at his oasis, Kelthor in Malezor. In the core
the authority is GONE.** *Occupation is not the same as decapitation*, and that is why
Seer HQs exist in ten districts while only three have castles.

#### ★★★★★ 2 · THE TIMELINE · a good order, a grieving daughter, and an off-world thing

```
  ★ A RESPECTABLE PACT · led by OPHIRA'S FATHER
                 ↓ he dies
  ★★★ OPHIRA TAKES OVER IN GRIEF
                 ↓ corrupts
        V NETHARION  →  VI VORASHIL
                 ↓ reaches
             VII XILNAR
                 ↓ ★★★ LINKS UP WITH XENOXIL  ← off-world, not one of them
        ALL TEN DISTRICTS INVADED
        Mori · Daemon · kidnappings · ancient-cult apparatus
```

★★★★ **XENOXIL IS THE FORCE MULTIPLIER, NOT THE FOUNDER.** Before him: a grief-corrupted
order taking three districts. After him: **a planetary horror with monsters and a
sacrifice cult.** ★★ Which is exactly right for a being canon already calls **off-world**
— *he did not build this, he found it and armed it.*

★ **And it re-reads their plan.** *"Recover the ten Gemshards · ascend Orryx and Ophira
· defeat every Gemlord · seize each Fathergem"* is not a founding manifesto. **It is
what a bereaved heir was talked into.**

#### ★★★★★ 3 · OPHIRA IS THE THIRD ANSWER TO LOSS — the theme, stated three times

The story now poses **the same question to three people** and gets three answers:

| | loses | answers by |
|---|---|---|
| **RIZER** | Kelthor · his parents taken | ★ **accepting, declining, continuing** — he refuses the throne |
| **ZORYN** | the verdict · the bond he trained for | ★ **refusing the refusal** — takes power another way |
| ★★★★ **OPHIRA** | **her father** | ★★★★ **inheriting something good and corrupting it** |

> ★★★★★ **She is Rizer's mirror, precisely.** Both lose the person who taught them.
> **One of them keeps that person's work intact. The other keeps the work and loses
> what it was for.**

★★★ **And it makes her the most important Seer to write — which revises what I said an
hour ago.** I recommended **Orryx first** because Zoryn finishes his argument. ★★ Still
true, but **Ophira is the keystone**: she is the origin, the grief, and the mirror.
**Write her first.**

★ **[ASK] Her father needs a name**, and the pact needs its old name — **what it was
called when it was respectable.** ★★ *A player learning that the Seers used to be
something else works far better if the old name is one they have already seen on a
building.*

#### ★★★★★ 4 · THE PACT — [INFER], and it may be the biggest one in this document

★★★★ **The word is "PACT."** And the single most important constraint in the endgame is
**the GEMLORD PACT** — *the ancient non-intervention agreement that forbids the Gemlords
from destroying mortal Seers, which is why they empower a mortal-led faction instead.*

> ★★★★★ **What if that is the same pact?**
>
> **The Gemlords made an agreement with a respectable order, led by a good man. He
> died. His daughter inherited the order — and the agreement.**
>
> ★★★★★ **The Gemlords are not bound by an arbitrary rule. They are keeping their word
> to a man who deserved it, and his daughter is standing behind it.**

★★★★ **That converts the story's most convenient plot device into its cruellest piece
of characterisation.** The reason nine gods cannot save the planet stops being *"canon
says so"* and becomes **an honoured promise being worn as armour.**

★★★ **And it makes the ending earn itself.** The Gemlords empower a mortal because a
mortal is the only thing the pact does not cover — **so Rizer's whole campaign exists
inside the loophole of an oath sworn to his enemy's father.**

★ **Not asserted.** The Gemlord Pact has no stated counterparty in any file I have read.
**This would give it one.** ★★ If you take it, one line changes everywhere: *the Pact
was made **with** someone.*

#### ★★★★ 5 · MALEZOR · why the hero comes from there

*"Malezor is currently the most uninhabited Seer district."*

★★★★ **So Malezor is not the safe tutorial corner. It is the loosest link in a planetary
grip** — the one district thin enough that a Rizer can still be made in it.

★★★ **Which finally explains the family's move.** Dad relocated to Malezor *"to study
wild Zyrex up close"*, and the reason wild Zyrex are still there to study is **that the
Seers have not bothered to finish it.** ★ The research premise and the political
premise are the same fact.

★★ **And it corrects my §6.5c reading of the Invasion.** I called it *"the front line
arriving."* ★★★ **Malezor was already theirs — barely. The Invasion is the Seers finally
bothering**, because the boy from the thin district became worth the trouble. *Rizer
causes his own catastrophe by mattering.*

★★★★★ **THE CALL TO ACTION, in the Creator's words: *"make his legacy. save the world.
avenge the fallen."*** ★★ Note the tense — **"the fallen" already exist.** The premise
is not *a threat is coming*; it is **an occupation is already in its second generation,
and one corner of the map is still loose.**

---

### ★★★★★ 6.5e · OPHARION IS IN THE CODEX — and so is a contradiction

> **Creator:** *"check the codex. opharion should already be in there, thats her father. their memory should be in the codex"*

**He is there.** `data/codex.json` → `opharion`, art `assets/rp6/characters/v2_opharion.png`.

| | Opharion | Ophira | Orryx | Xenoxil |
|---|---|---|---|---|
| **tier** | ★ **V** | ★ **VI** | VI | VII |
| **class** | **Warrior** | Beastmaster | Ranger | Beastmaster |
| **types** | ★ **Beast / Aura** | ★ **Spirit / Void** | **Humanoid** / Spirit | ★ **Spirit / Aura** |
| **archetype** | WYRMKING | PHANTASM | MORTALARK | SPIRITHOLD |
| **state** | ★★ *"**OPEN CANON** · v2 skeleton — **flavor pending**"* · 333×5 = 1665 | written | written | written |

★★ **Opharion is a skeleton with a name, a tier, a face and no story** — which is the
best possible condition for him. **Nothing has to be un-written.**

#### ★★★★★ 1 · THE CONTRADICTION · the codex says XENOXIL founded the Seers

`codex.json` → `xenoxil`, shipped:

> *"★ Xenoxil · **FOUNDER OF THE SEERS** · Triumvir of the High Seers"*

**Today's ruling says the opposite** — the order existed as *"a respectable pact led by
Ophira's father,"* and Xenoxil was **linked up with** only once they reached district
VII.

★★★★★ **There is a resolution, and it answers the question I asked an hour ago:**

> ★★★★★ **Both are true, because the NAME CHANGED WHEN HE ARRIVED.**
>
> **Opharion led the PACT. Xenoxil founded THE SEERS — because "the Seers" is what the
> pact BECAME after him.**

★★★★ **So "the pact needs its old name" is already answered by the shape of the
problem: the old name is whatever it was before Xenoxil, and *"the Seers" is the name
of the corruption, not of the organisation.*** ★★★ A player who has spent forty hours
saying *"the Seers"* discovering it is the *后* name — a thing the founder never called
himself — is a reveal worth more than a retcon.

★ **[ASK] Confirm and the codex line stands untouched.** Decline and one shipped string
needs changing.

#### ★★★★★ 2 · THE TYPES ALREADY TELL THE STORY, AND NOBODY WROTE THEM TO

★★★★★ **Father and daughter share NOT ONE TYPE.**

> **OPHARION — Beast / Aura.**
> **OPHIRA — Spirit / VOID.**

★★★★★ **She is typed as the exact opposite of the man she inherited from — and her
second type is the type of ABSENCE.** *A daughter who lost her father and came back
typed for the hole he left.* **That is grief written into the type chart, and it was
sitting in the data before today's ruling existed.**

★★★★★ **And then look at Xenoxil: SPIRIT / AURA.**

> **SPIRIT is hers. AURA is his.**
> **Xenoxil carries one type from the father and one from the daughter. He is typed as
> the JOIN.**

★★★ **The thing that joined them is literally composed of them.** ★ Not designed —
**found.** Which is the strongest possible argument that today's ruling is the correct
reading of material that already existed.

★★ **It also confirms two of the three district assignments by type:**
**Ophira (Spirit/*Unknown-Void*) → NETHARION, the Unknownlands** ✔ ·
**Xenoxil (*Spirit*/Aura) → XILNAR, the Spiritlands** ✔.
★ **Orryx (Humanoid/Spirit) → Vorashil, the Alienlands** is the one that does not sing —
**flagged**, though the mission chain assigns it and *"the Reluctant Believer"* being the
only **Humanoid** of the three is its own kind of correct.

#### ★★★★★ 3 · THE DAUGHTER EXCEEDED THE FATHER — and that is the tragedy

**Opharion is Tier V. Ophira is Tier VI.**

★★★★★ **She went further than he did.** I had assumed she inherited his ceiling; the
data says she broke it.

> **She surpassed her father — and the thing she did to surpass him was corrupt what he
> built.**
>
> ★★★ **Her power is the measure of the damage.** Every tier above him is a thing she
> gave up to get there.

★★ **And Orryx is VI too, while Xenoxil is VII** — so the man they met is a full tier
above both of them. *He did not join a partnership. He acquired one.*

#### ★★★★ 4 · OPHARION READS AS HUMANOID — which makes him a MASTER

`CODEX_TRIAGE_ZYREX_VS_HUMANOID.md:452` — *"Opharion | Warrior | V | Beast/Aura |
class **Warrior**; **lore reads humanoid (19 tells)**; Beast-primary coined name."*

★★★★ **Nineteen tells.** Under §6.5b, **HUMANOID = HAEMEN = the MASTER class.**

> ★★★★ **Opharion was very likely a MASTER — a humanoid officer of the same kind as
> Kelthor**, leading a lawful order.

★★★ **Which sharpens everything.** A Master leads a respectable pact. He dies. **His
daughter — who is not Haemen, who is Spirit/Void — inherits an office she is not of the
class for**, and the order becomes something that deposes Elders. ★★ *The corruption
starts with a succession that should not have happened.*

★ **[ASK] His Beast/Aura typing is called "coined" by the triage** — i.e. invented to
fit a Beast-primary slot. **If he is Haemen, that typing is due a correction, and
Beast/Aura may belong to his ORDER rather than to him.** ★★ *Beast and Aura are the
types of districts **I and II** — Malezor and Zarvane, the two districts still holding.*

#### ★★★ 5 · "PRECIPITATED FROM OBSIDIUS × OATHANE'S STANDSTILL"

Xenoxil's codex entry: *"Precipitated from **Obsidius × Oathane's** standstill · **not
born · not made**."*

★★★★ **Obsidius is the Gemlord of XILNAR — the district Xenoxil holds. And OATHANE is
half of Egnellahc** (`EGNELLAHC_SPLIT_PROPOSAL.md`). **Xenoxil came out of a deadlock
between the Onyxlord and the ninth Gemlord, in the district he now occupies.**

★★ **[CONFLICT]** The story canon calls Xenoxil an **off-world Fleshlord**; the codex
has him **precipitating on Zyraxis** from two of its own Gemlords. **Both cannot stand.**
★ *"Not born, not made"* is compatible with either, but the location is not.

★★★ **[INFER] worth your ruling:** if the codex is right, **Xenoxil is a by-product of
the Egnellahc split's aftermath** — which would make the Seer crisis and the Empty
Throne the same wound, and would explain why *"Obsidius says nothing"* about Oatheus.
**He was there when the thing came out.**

#### ★ 6 · DATA DEFECTS FOUND WHILE READING · **[BUILD]**, none fixed

1. ★ **Opharion's own entry disagrees with itself** — `archetype: WYRMKING`, flavour
   text says **"Brainlock."**
2. ★★ **Ophira and Orryx are Tier VI with 1332-point pools** — that is **4 × 333**, the
   Tier IV pool. Tier VI is **1998**. Against `T×333`, both are two tiers light.
3. ★ **`realms.html` has Opharion at `tier:'?'`, all stats 0, `unlocked:false`** while
   `codex.json` has him at Tier V with a full pool.

#### ★ 7 · OPEN

1. ★★ **When was the coup?** It is now a datable founding event with consequences on
   the map. Unwritten.
2. ★★★ **Are the three deposed Elders alive?** *"Overthrown"* allows hiding,
   imprisonment or death — ★★★★ **and with exactly three districts, the set can be
   one of each: a district where you FREE them, one where you are TOO LATE, and one
   where what you find is NOT WHAT WAS DEPOSED.** Three Seers, three districts, three
   fates. **Recommended.**
3. ★ **Does Korathen's Elder predate the coup?** Its humanoid seat was already empty
   (§6.5b), so Korathen may be the one district the Seers could not take **because
   there was nothing to depose** — or the one they most want, for the same reason.

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
