# THE AOV SAGA · STORY MASTER RECALL
**Built 2026-09-01, at the Creator's direction:** *"lock everything and start to recall the entire story. we will begin to tighten up game lore and story dialogue flavor top to bottom."*

This is the **foundation document for the tightening pass** — the whole story assembled in one place, from the cosmic backdrop down to the individual lines that ship in `rp7b.html`. Nothing here is new fiction. Everything is sourced, and every gap is named as a gap.

Labels: **[CANON]** locked · **[BUILD]** ships today · **[DRAFT]** designed, unwired · **[GAP]** does not exist · **[CONFLICT]** two sources disagree

---

## ★★★ 0 · READ THIS FIRST — the three findings that shape the whole pass

### 0a · ★★★ The game already has a voice, and it is Dad's field notebook

`SCROLL_THEMES`, `rp7b.html:32122–32340` **[BUILD]** — **18 themed sets × 10 district pages = 180 finished prose entries.** One subject told at ten depths: Malezor's page is a rumour, Korathen's is the answer. First person, past tense, clipped declaratives, an admission of unease at the end, SMALL CAPS on the one load-bearing word.

> *"Twenty years looking for an exception. Stopped looking."*
> *"A Zyrex is not an animal that happens to glow. It is a signature that happens to have a body."*
> *"A prism does not store power. It stores a PERMISSION — and the holder is the one being permitted. Read that twice, son. I had to."*
> *"The Pledge requires ten signatories and has nine. Every law built on it is provisional. Everyone has agreed not to mention this."*
> *"The Gemlords have been holding that door shut with their bodies. All ten of them. Nine."*

**★ This is the tonal reference. Every other line in the game gets measured against lines 32122–32340.** The pass is not *inventing* a voice — it is **propagating one that already exists** into the places that lack it.

★★ **Process rule, non-negotiable:** that block is **generated**. Source of truth is `data/scroll_lore_source.py`, synced by `tools/sync_scrolls.py`. **Hand-edits to the HTML between the BEGIN/END markers are destroyed on next sync.**

### ★★★ 0a-bis · THE THREE RULINGS · 2026-09-01 — the pass is unblocked

> Asked and answered the same day this document was built. **These override every
> "unresolved" note below; the notes are kept so the reasoning stays readable.**

| # | ruling |
|---|---|
| **1** | ★ **ELDER = main-mission chain. WARDEN = mastery track.** Two named authorities per district |
| **2** | ★★ **THE INVASION OF MALEZOR.** The parents are taken **on-screen in Malezor** and **KELTHOR DIES** covering the evacuation |
| **3** | ★ **The protagonist is named "RIZER."** NPCs address him by name |

★★★ **Ruling 1 costs one more name than expected: NINE Elders, not eight.** Kelthor
holds Malezor's elder row today and is a **Warden** under the ruling, so he vacates
it. **Only Omniris is correctly seated.**

★★★ **Ruling 2 costs Kelthor the Bridge of Hope.** The farewell was **Mom · Dad ·
Kelthor · Myara**; he is dead by then. ★ *The empty fourth place is worth using
rather than filling — a farewell with a gap in it is the same shape as the Empty
Throne.* And **Vorashil's mission 7 needs a new turn**, since it carried the
off-screen kidnapping.

★★ **Ruling 3 needs no rewrite of what ships.** Dad and Kelthor already speak to a
person — *"Smart find, kid"*, *"You crossed a border for me."* **The shipped voice
already obeys the ruling; the rest of the game has to be brought up to it.**
★ *Style rule it sets: characters speak **to** Rizer, not **at** a cursor. A line
that could be addressed to anyone is a toast, not dialogue.*

*Written into `RP7_MAIN_STORY_CANON.md` §6.5, §6.7, §6.8.*

### 0b · ★★★ The blocker: eight of ten districts have nobody to talk to · ★ RULED, see 0a-bis

`DISTRICT_ELDERS` (`rp7b.html:4526–4554`) **[BUILD]** — **two of ten rows are filled.** Malezor → Warden Kelthor. Zarvane → Omniris. **Andrannor, Veridan, Netharion, Vorashil, Xilnar, Baelgor, Thardin and Korathen have `id:null, name:null, teaches:null`.**

And the office itself is unruled **[CONFLICT]**: `RP7_MAIN_STORY_CANON.md` §6.5 records the draft saying **Elders** give main missions, against standing canon saying **Warden-class = main, citizen allies = side, one Warden per district**. Kelthor is currently *both* — `'Warden Kelthor'` in the elder table, "Elder Beastmaster" in his own arc draft.

> ★★★ **A top-to-bottom dialogue pass cannot reach eight districts until this is ruled, because nobody knows who speaks.** This is the highest-leverage decision available and it is one sentence long.

### 0c · ★★ The cast is inverted — the villains have no scenes

**Xenoxil, Orryx and Ophira — the actual antagonists — have zero dialogue in the build.** They exist only as text *inside Dad's scrolls* (`:32236`) and as a combat constant `chief: 2.00 // Ophira / Orryx` (`:38187`). No sprite, no NPC, no line.

The ten **Seer Commanders** have a full art-direction doc, per-district corruption motifs, and partial wiring — but `talkToSeerCommander()` (`:17017`) fires **one shared line** with the district interpolated, and the comment says the fight is deliberately unbuilt rather than faked.

**Shipped speaking cast, by line count:** Kelthor 18 · Scrapjaw 11 · Dad 10 · Prof Elarion 6 · Elzoran / Auraxion / Albert Orren 4 · Zurelea / Zoryn / Stelden / Rakoron / Mom / Kaizari 3. Plus 54 ambient one-liners. **167 `showDialog` calls total.**

> **The shipped voice of RP7 is Malezor's domestic circle plus Dad's field notes.** Everything above district level is a name, a card, or a document. **The pass has roughly a dozen real trees to tighten; the rest is a writing commission, not an edit.**

---

## PART I · THE COSMIC BACKDROP

*Sources: `timeline.html`, `aethryx.html`, `viridia.html`, `codex.html` — the shipped canon site.*

### 1 · The Eruption

**~15 Bya · THE AENOR ERUPTION** — the saga's Big Bang. Aenor erupts; the cosmic substrate of the **Aethryx Expanse** is forged. The same event births **1,000+ original Dracolords** — *"born of stellar plasma, astralite matter, dimensional gravity, cosmic consciousness, and primordial celestial law. Larger than moons."*

★★★ **And, per `PRISMSHARD_GEMSHARD_CANON.md` §0d, the same event produces the 16 Prismshards.** The Prismshards and the Dracolords are **siblings of one eruption** — which is why neither can be made again.

**First 1 Byr · THE GREAT DYING** — of 1,000+, **six survive**. *"They are one family."*

**~14 Bya · THE SIX COSMIC GUARDIANS** — Alphaea (Aenor-born) mated **once** with **Anciuxor** (*"the Father, not a Dracolord"*); their one child was **Azyrath**, who mothered the other four.

| Guardian | Epithet | Domain |
|---|---|---|
| **Alphaea** | The First Radiance | Order · the original mother |
| **Azyrath** | The Hollow Empress | Void · the survivor-matriarch |
| Abyssion | The Dimensional Maw | Collapse |
| Aetherion | The Prism Tyrant | Evolution |
| Abominalys | The Endless Catastrophe | Existential Failure |
| Aethravax | The Twin Dominion | Cosmic Polarity |

**~13 Bya · THE ETERNAL ACCORD** — six chose balance over domination. They evolve from dragons into Guardians, each keeping a dragon form and a humanoid form. **All dragonkind descends from this family** — which is why dragons are universally sacred.

**THE COSMIC MIRROR CYCLE** — *"Anciuxor encircles · Aenor at centre · four quadrants between."*

### 2 · The matter of the universe

**AETHRYX** — *"the basic form of pure matter — matter that has not yet leaned"* **[CANON §0k]**, carrying **the charge of the Aenor Eruption** **[CANON §0l]**. The Expanse is named for it because Aethryx makes up all of it.

**THE 63 ASTRALITES** — 9 families × 7. *"An Astralite is what Aethryx becomes when it leans."* The nine: **CREATION · PAST · DESTRUCTION · MIND · PRESENT · PRESERVATION · BODY · FUTURE · SPIRIT** — three triads: **ACT · TIME · SELF**.

**THE FIVE GRADES [CANON §0j]:** CORE (Astralite) · COMPOUND (gem) · COMPLEX (Gemshard) · COMPOSITE (Ultrashard) · COSMOLOGIC (Prismshard). Complex and Composite are **peers** — depth and breadth — not steps.

★ **[CONFLICT]** `aethryx.html` ships **"45 Discovered · 200+ Theorized"** against 9 families. **No page states 63.** If 63 is the master number, the site is stale.

### 3 · World formation, and the road to Zyraxis

**Planets crystallised around Aenor Eruption hotzones; a planet's core is the hotzone it formed around** **[CANON §0l]**.

- **#1 ORIGON** (~12 Bya) — first planet to crystallise. Its core is the **FATHER GEM**, *"the source from which all 10 Mother Gems descend."* Charge density so extreme that nothing below Tier VI survives natively.
- **#3 DRAEVOS** — Dracolords and Mandrakes. **THE FIRST WAR** (Dracolords vs Astrums). **Elzoran** finds a purple Father-Gem fragment → becomes **OMEGORAN**.
- **#9 ZYRAXIS** (~9 Bya) — **gems first crystallise. The TEN GEMLORDS rise. The War of the Gemlords.**
- **#13 KYRATHOS** — *"awareness without form."* Home of Mealux, guardians of the Eternal Library.
- **#27 VIRIDIA** — the Astral Core, the Veil, the four-realm architecture, true humans, the Aur bloodline.

★★ **The chain that reaches the game:** a purple Origon fragment corrupts Elzoran on Draevos → Omegoran is purged → the escaping shadow flees to Origon and coalesces as **EURAKEON** → **Voltyran expels him** → Eurakeon drifts to **Zyraxis**, whose substrate density is *"close enough to the original Father-Gem register"* — **and he takes a seat as a Gemlord.** *The Amethystlord of Netharion is an exile from the first world.*

### ★ Contradictions in the cosmic layer — resolve before writing

| # | issue |
|---|---|
| 1 | **Quadrant assignments conflict inside `timeline.html`** — four planet cards contradict the site's own Cosmic Mirror table (Origon, Zyraxis, Kyrathos, Rhyzor) |
| 2 | ★★ **Father Gem vs Mothergem** — `timeline` says Father Gem → 10 Mother Gems; `aethryx` calls Zyraxis *"The Mothergem World"* where *"the Mothergem fell"*; the same file's data calls the ten *"10 Fathergem-born."* **Three attributions, one event. The 10 Mother Gems are named nowhere** |
| 3 | **Planet #28** — Ovauron in one table, *"AEP-28 · Primalutonia · The Worldender"* in another panel, with `Ax-?` placeholders |
| 4 | **Realm III** — `aethryx` says "Bastion. Altaris. Celestia."; `timeline` says "Universe · Immortalands · Anciara · Omnithris." **Anciara appears in neither list of the other** |
| 5 | **Aenor age** — eruption at ~15 Bya vs Aenor's stat card "~12 Eons," with the first world at 12 Bya. A 3-Byr gap unexplained |
| 6 | **Codex counts** — header says 358 names, then 543 entries, then 547 cards. File contains **358**. **Anciuxor and Ultharis share ID `VD-X001`** |
| 7 | **"The First War" is overloaded** — Draevos (Dracolords vs Astrums) and the Blood War (First War of Viridia) |

---

## PART II · THE STORY OF RP7 · RIZE OF POWER

*Sources: `data/RP7_MAIN_STORY_CANON.md` (authoritative, merged 2026-08-22), its DRAFT source, and the archived V3.5 story lock.*

### 4 · The premise

**Zyraxis**, ninth world, ten districts in a **Z-shape**, each held by a Tier-VIII immortal **Gemlord**. Creatures are **Zyrex**; trainers are **Rizers**; the capture vessel is the **Zysphere**, manufactured by **THARDUN** of Thardin.

**Dad** — leading beastologist of the Expanse, author of the notebook that becomes the in-game dex. **Mom** — head nurse. **Baelgor (VIII) is both parents' hometown**; they emigrated to Malezor so Dad could study wild Zyrex up close. Starter: **Elzebub**, Tier I of the Elzoran wyrm line — *the same line that produced Omegoran.*

The player begins in **Malezor, the Beastlands**, **without a Zyrex**, treated as an outsider who has not proven he can survive the Beastlands.

★ **[CONFLICT] Who is the protagonist?** The canon names him **Rizer** and models a separate **Player–Rizer bond** axis (`rizerBondTotal()` **[BUILD]**). The archived handoff says *"You — the protagonist. Custom name, chosen gender. Silent-protagonist RPG style."* **Both are live. Unresolved, and it decides how every line of dialogue addresses the player.**

### 5 · The act structure

★ **[GAP] No document states the five acts.** `RP7_MAIN_STORY_CANON.md` asserts a spine in one sentence and names only four beats. Reconstructed from the three arcs plus the mission chains:

| Act | Districts | The turn |
|---|---|---|
| **I · The Young Bonder** | Malezor–Zarvane | First Zyrex, first faction. **The Seer network is revealed as planetary, not local** |
| **II · The System Revealed** | Andrannor–Veridan | **Xenoxil named.** The planet is found to be deliberately *weakened* — prepared for a ritual |
| **III · The Awakened Rizer** | Netharion–Vorashil | First Ophira defeat · **S1 unlocked** · first Orryx defeat · **the parents are taken** |
| **IV · The Ruby Rage → The Test** | Malezor Interlude, Xilnar–Baelgor | S1 surges out of control → **S2** · the parents' purpose revealed · homecoming to a ruined Baelgor |
| **V · Defender of Zyraxis** | Thardin–Korathen | Control grid broken · Council of Gemlords · three-Seer battle · **the Throne left empty** |

★★ **THE POWER ORDER IS LOCKED.** **S1 · Azurel (Vorashil)** — perception, clarity, controlled Aura circulation, ***explicitly not fuelled by anger***. **S2 · Rakoron (Malezor)** — disciplined fury built *on top of* Azurel's channel. Corroborated by the weapons: **Sapphire Tearsword** = S1, **Rubypaw Longsword** = S2.

★ **[CONFLICT]** The build uses a *different* act numbering tied to Mori outbreaks — *"Act II begins in the Auralands · Malezor stays untouched during Act I"* and a **"Baelgor siege wave"** (`rp7b.html:~25164`). Not reconciled with the spine above.

### 6 · The mission spine

**Seven missions per district × ten districts = 70. Sixty-three are unbuilt.** They are written bespoke, but a shape recurs:

1. **Elder briefing** — the district's authority names an anomaly
2. **Method lesson** — the district's discipline is taught
3. **Seer apparatus found** — a device, courier, ritual or facility
4. **A lore building goes wrong** — the district's named structure is the set-piece
5. **Gemlord trial** — ★ *a test of philosophy, not strength*
6. **Escalation** — the Seer command layer
7. **Road out** — evidence unlocking the next district

★ **[CONFLICT]** Actual counts are **6 for Zarvane, Andrannor and Veridan; 9 for Korathen.** "Seven per district" is approximate.

### 7 · The ten districts

| # | District · Land | Gemlord | Band | The story there | Earns |
|:-:|---|---|---|---|---|
| I | **Malezor** · Beastlands | **Rakoron** | 1–15 | Outsider; first Zyrex; Fanghall survival trial; **Rakoron defers the bond** | Ruby |
| II | **Zarvane** · Auralands | **Ivirium** | 12–25 | Synchronised emotional disturbance; Seer siphons on the Resonance Spire | Aura perception · Pearl |
| III | **Andrannor** · Creaturelands | **Mutaryn** | 22–35 | Uncontrolled evolution; mutagenic Astralite; the Chimera Exchange | **Xenoxil first named** · Citrine |
| IV | **Veridan** · Naturelands | **Emeralix** | 32–45 | Ecosystems failing; Root Parliament; a cure turns predatory | **Proof the planet is being prepared** · Emerald |
| V | **Netharion** · Unknownlands | **Eurakeon** | 42–55 | The Impossible Archive holds *erased* Oathane/Oatheus records; **first Ophira defeat** | Amethyst |
| VI | **Vorashil** · Alienlands | **Azurel** | 52–65 | **S1 Sapphire Awakening** · first Orryx defeat · **THE PARENTS ARE TAKEN** | S1 · Sapphire |
| — | *Malezor Interlude* | Rakoron | — | ***The Ruby Rage*** — the S1 surge; Rakoron bonds directly | **S2** |
| VII | **Xilnar** · Spiritlands | **Obsidius** | 62–75 | Souls vanishing; *Xenoxil's Six*; **the parents' purpose revealed** | Onyx · **Obsidius joins — the only walking Gemlord** |
| VIII | **Baelgor** · Humanoidlands | **Ambrevon** | 72–85 | Homecoming to ruin; **the Pledge of Baelgor rewritten by collaborators** | Amber |
| IX | **Thardin** · Mechlands | **Oathane** | 82–92 | The Precision Ministry classifies the player **a defect**; the control grid breaks | Route to Korathen |
| X | **Korathen** · Ultralands | **Oatheus — missing** | 92–100 | Tribunal of Ten; Council at the Mothergem; rescue; three-Seer battle | The planet |

★ **[CONFLICT] Two level laws.** `rp7_district_assignments.md`: **level = tier × 12.5**, clamped to band. `WILD_PLACEMENT_MASTER.md`: **level = tier × 10**. Both shipped.
★ **[CONFLICT] Oathane** is *missing* in the draft but *present with card, cave and working door* in the build. Canon has only **one** absent Gemlord.

### 8 · The antagonists

**Not raiders — a ritual.** Under **XENOXIL, THE FLESH LORD** (Tier VII pseudoimmortal, off-world, *calm and compassionless*), the Seers destabilise all ten districts to seize Zyraxis **as one connected system**.

**The plan, in order:** *(1)* recover all ten Gemshards → *(2)* ascend **Orryx** and **Ophira** toward pseudo-immortality on harvested life-energy → *(3)* defeat every Gemlord → *(4)* seize each **Fathergem** → *(5)* rule permanently.

They kidnap Zyrex and civilians from every district, explained away as accidents, and sacrifice them to Xenoxil. **ORRYX** — Tier V, *"the Reluctant Believer,"* wants order, written with doubt beats. **OPHIRA** — Tier V, *"the Prophetess,"* wants willing followers; serene religious horror.

**Ten Commanders**, one per district HQ: Yara-Prime, Vorhil, Mirax, Thorne, Nullis, Zypher-9, Resha, Drakkur, Helix, Threefold. Design rule: *"the district is CORRUPTION, not costume — the Seer parts are worn, the district parts are attached."*

**The Scrapjaw tower network** — ten radio towers, one per district, each with a battery chest, a 6-Mori guard ring and a boss (Lv 8→90). Returning a battery restores that district's cell service; **6/10 makes Scrapjaw a companion** **[BUILD]**.

### 9 · The endgame

Korathen's nine missions: the Seers mean to **occupy the authority abandoned when Oatheus vanished**. The player wins recognition at the **Tribunal of Ten**. The **Council at the Mothergem Sanctum** convenes — and here is the load-bearing constraint: ★★ **the ancient Gemlord Pact forbids the Gemlords from destroying mortal Seers, so they empower a mortal-led faction instead.** *That is why this is the player's fight and not theirs.*

The parents are rescued before their combined research completes a bonding-and-biological control system. Orryx and Ophira return enhanced. Xenoxil attempts to merge transformation, bonding, spirit energy, technology and district authority into **one takeover ritual**. The three-Seer battle uses **S1 for control and perception, S2 for disciplined fury.**

**★★★ THE ENDING · *The Throne Remains Empty*** — *"Rizer refuses to replace one absolute ruler with another and restores authority to the districts while the mystery of Oathane and Oatheus remains open."* Then: **Toward the Novarian Challenge.**

### 10 · The second path

- **PATH A · THE RIZER PATH / THE NOVARIAN CHALLENGE** — a **9-year planetary bracket**; the player fields a **Faction of 9** for their home district toward the **Korathen championship** and the mantle of **Novarius**, First Beast Master. ★★ Novarius tamed **Rakoron through trust, not force**; his Accord grants humanoids and Zyrex the right to battle honourably — **and the Seers seek to destroy that oath.** *Both paths defend the same thing.*
- **PATH B · THE ZYREX PATH** — the Seer crisis above.
- **THE BRIDGE OF HOPE** — south of Baelgor/Xilnar. Opens only when **both paths are complete**. A ceremonial corridor into the Part 2 southern lands (The Old Conquest · The New Conquest · **The Pit of No Return**), and the site of a **farewell: Mom · Dad · Kelthor · Myara.**

★ **[GAP]** Path A exists as premise with **no structure and no playable slice**, and is documented **only in the archive** — current canon mentions it in one closing line.

### ★★★ 11 · THE STORY'S CENTRAL CONTRADICTION — decide this first

**Two incompatible versions of the turn.**

| | version | source |
|---|---|---|
| **A** | The parents are taken **in Vorashil (VI)**, off-screen, as Seer retaliation | the mission draft · `RP7_MAIN_STORY_CANON.md` |
| **B** | The parents are taken **in Malezor**, on-screen, during ***THE INVASION OF MALEZOR*** (mission VIII) — **and Kelthor dies covering the evacuation** | `KELTHOR_ARC_DRAFT.md`, Creator directive 2026-08-28 **[DRAFT]** |

★★ **And they cannot both be true, because the Bridge of Hope farewell includes Kelthor.** If B is canon, Kelthor is dead before the bridge.

> **This is the single most consequential open question in the story.** Version B is dramatically stronger — the kidnapping happens *where the player lives*, to a district they were taught to protect, and it costs them their mentor. Version A keeps the Bridge farewell intact and preserves the Vorashil→Ruby Rage momentum. **Not choosable by me.**

---

## PART III · THE CAST

### 12 · The player's circle

| Character | Role | State |
|---|---|---|
| **Dad** | Beastologist; author of the notebook | ★★★ **Wired, and the best-written character in the game.** 9 dialogue blocks + the 180-page scroll corpus |
| **Kelthor** | Warden/Elder Beastmaster of Malezor | **Ladder wired** — 18 blocks, the largest tree in the build. **Missions II–VIII and his death: design only** |
| **Scrapjaw** | Hyena bandit; runs the ten-tower network | **Wired** — 11 blocks, companion at 6/10 towers. ★ *Shipped without any canon behind him* |
| **Mom** | Head nurse; taken with Dad | **Wired** — 3 blocks. Her own thread is an open question |
| **Zoryn** | ★★ **Player Two.** Best friend → Part 2 final boss | **Part 1 wired** (3 blocks, companion at Bond 50). ★ The turn, the fall, Abominalys, the Pit — **written only** |
| **Myara** | Broadcast-tower interviewer | ★ **[GAP] Named-only.** In an id set and a stub quest. **No NPC, no lines.** ★ Collision risk with **Yara**, the sister, who *is* wired |
| **The Quiet Child** | Silent recurring figure; forgiveness beat; gifts VENGRIZZ | ★★ **REGRESSED.** Full system in the `.bak` — sightings counter, forgiveness, blessing, dedicated renderer. **Zero references in current `rp7b.html`.** Survives only as a codex row |
| **The Wandering Merchant** | Recurring drunk vendor | ★ **REGRESSED.** Exists only in `.bak` |
| **The Journalist** | — | ★ **[GAP] No trace anywhere.** If this is Myara-as-interviewer, that identification is undocumented |

### 13 · The Gemlords

Ten names, ten cards, ten working cave doors — **and two characters.**

| Gemlord | Title | District | Weapon | Philosophy | Lines |
|---|---|---|---|---|:-:|
| **Rakoron** | Gemlord of Malezor | Malezor | **Rubypaw Longsword** (S2) | disciplined fury · protective instinct | ✅ 3 |
| **Azurel** | Sapphirelord | Vorashil | **Sapphire Tearsword** (S1) | clarity · controlled Aura · ***not anger*** | ❌ |
| Emeralix | Emeralord | Veridan | Emerald Axe *(inferred)* | stewardship vs domination *(one line)* | ❌ |
| Ivirium | Pearlord | Zarvane | Pearlbow *(inferred)* | — | ❌ |
| Mutaryn | Citrinelord | Andrannor | — | adaptation vs forced improvement *(one line)* | ❌ |
| Eurakeon | Amethystlord | Netharion | — | ★ *exile from Origon; shadow of Omegoran* | ❌ |
| Obsidius | Onyxlord | Xilnar | — | ★ *the only Gemlord who walks; joins the player* | ❌ |
| Ambrevon | Amberlord | Baelgor | — | leadership without obedience *(one line)* | ❌ |
| Oathane | Gemlord of Thardin | Thardin | — | — | ❌ |
| **Oatheus** | **The Empty Throne** | Korathen | *slot held* | ★★ **absent — and the endgame turns on it** | ❌ |

★ **Six weapons unnamed. Two of the four named are `inferred:true`** and were never Creator-confirmed.

### 14 · Writing-state audit — the pass's actual worklist

| | characters |
|---|---|
| ★ **Shipped and deep** | Dad · Kelthor (Act I) |
| **Shipped, no lore layer** | Scrapjaw · Prof Elarion · Kaizari · Zurelea · Nurse Rein · Yara · Prof Vireta · Albert Orren · Stelden |
| **Designed ≫ shipped** | Zoryn · Omniris · Kelthor (Acts II–VIII) |
| ★★ **Lore only, no scene** | **Xenoxil · Orryx · Ophira** |
| **Cards and doors, no character** | 9 of 10 Gemlords |
| ★★★ **Do not exist** | **The Elders of eight districts** · Myara · The Journalist |
| **Regressed out** | The Quiet Child · The Wandering Merchant |

---

## PART IV · THE TEXT THAT SHIPS

### 15 · Inventory of prose in `rp7b.html`

| category | where | state |
|---|---|---|
| ★ **Scrolls** — 18 sets × 10 pages | `32122–32340` | **Finished. The reference.** Edit `data/scroll_lore_source.py`, never the HTML |
| ★ **Dad / Kelthor trees** | `9283–9433` · `12016–12205` | Near-reference quality |
| **Ambient one-liners** — 54 NPCs | `10114–10700` | Good, but **archetype-labelled and medieval-generic — nothing tells you which district you are in.** ★ *The cheapest high-value pass available* |
| **Notebook scrolls** — 4 entries | `31359–31368` | ★ **A stub system living beside a finished one**, same fiction, overlapping name. **Consolidate** |
| **Main quests** — 4 chapters, 15 steps | `22052–22080` | Pure imperative checklist. No voice |
| **Objective hints** — 18 strings | `31018–31047` | Instructional. ★ `:31035` **ships raw tile coordinates to the player** |
| ★★ **Item / creature flavour** | `INVENTORY_META 2964+` | ★★★ **Does not exist. Labels only, ~60 entries, zero descriptions.** *For a bonding game with a codex, this is the biggest hole — and the scroll set "WHAT A ZYREX IS" already establishes the exact voice those entries want* |
| **Toasts** — 598 calls | throughout | Strong convention (glyph + interpunct), inconsistently applied |
| **Summoned-Zyrex lines** | `42313–42316` | ★ **Two template strings for every creature in the game** |

### 16 · Defects to fix before the pass, not during it

1. ★ **Register breaks** — Kelthor's tree drops into UI-speak *inside a dialogue box*: `"Not yet · need 5 berries (${b}/5)…"` (`:12067`), `"Home rank test · still need: ${missing.join(', ')}"` (`:12106`), a 40-word directions dump (`:12158`). **Toasts wearing a character's face.**
2. ★ **Debug text ships** — `:31035` tile coordinates · `:6624` / `:6662` raw error strings · `:2954` `"◈ DEV · No Defeat"`.
3. ★ **Eleven near-identical "Closed for now" toasts** (`5893 … 6942`). ★★ The Korathen one throws away the best line available: *"the Empty Throne · closed for now."*
4. **`TBD ->` placeholder strings ×8** in the district ladder (`4532–4551`) — confirm they never render.

---

## ★★★ 17 · THE RECOMMENDED ORDER OF WORK

**Rulings first — three sentences unblock most of the pass:**

1. ★★★ **Elder or Warden?** Until this is answered, **eight districts have no speaker** and cannot be written.
2. ★★★ **Where are the parents taken — Vorashil, or the Invasion of Malezor?** And **does Kelthor die?** This decides Acts III–V *and* whether the Bridge of Hope farewell stands.
3. ★★ **Named protagonist "Rizer," or silent custom-name player?** This decides how **every line** addresses the player.

**Then, in cost order:**

4. **Fix the four defects** in §16 — small, mechanical, and they contaminate any pass done around them.
5. **Consolidate the two notebook systems** into one.
6. ★ **54 ambient one-liners → district-specific.** One pass, 54 lines, and it is the first time the world will *sound* like ten different places.
7. ★★ **Write `INVENTORY_META` descriptions.** The single largest missing body of text, with its voice already established.
8. **Name the eight missing Elders** — and then the district mission chains become writable.
9. **Give Xenoxil, Orryx and Ophira a scene each.** The antagonists currently exist only in the victim's field notes — ★ *which is a genuinely good idea if it is a choice, and a hole if it is not.*
10. **Six unnamed Gemlord weapons; eight Gemlords without a philosophy.**

---

*Assembled from: `timeline.html` · `aethryx.html` · `viridia.html` · `codex.html` · `data/RP7_MAIN_STORY_CANON.md` · `data/PRISMSHARD_GEMSHARD_CANON.md` §0b–§0m · `data/GEM_COLOR_PSYCHOLOGY_CANON.md` · `data/ZORYN_ARC_CANON.md` · `data/KELTHOR_ARC_DRAFT.md` · `data/OMNIRIS_ZARVANE_ELDER_DRAFT.md` · `data/SEER_COMMANDERS.md` · `data/rp7_district_assignments.md` · `data/WILD_PLACEMENT_MASTER.md` · `data/RPG_MASTERY_BLUEPRINT.md` · `_archive/docs/HANDOFF_CHATGPT_STORY_BRAINSTORM.md` · `_archive/docs/HANDOFF_MASTER_CODEX_SYNC_2026-07-17.md` · `rp7b.html`*
