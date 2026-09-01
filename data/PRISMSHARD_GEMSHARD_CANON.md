# PRISMSHARD & GEMSHARD SYSTEM — CANON + GAMEDEV MERGE
**Creator handoff, 2026-08-29. Merged to code at v0.95.876.**
Architecture is canon. Individual relic identities are **deferred to the Creator**.

---

## 0 · THE MERGE · what this handoff reconciles

The Creator's note says *"it already follows canon but this adds game context."* It does — and it also **closes a naming split** that has been open since Codex v13.10.

| | before this handoff | after |
|---|---|---|
| the sixteen supreme relics | **ASTRALITE PRISMS** (renamed at v13.10, when "Prismshard" was given to the crafted bonding vessels) | **PRISMSHARDS I–XVI** |
| the crafted bonding vessels | "Prismshards" | **retired 2026-08-26** — the Creator dropped the bonding-vessel meaning entirely |
| the sixteenth | The Key of Anciuxor | The Key of Anciuxor |

Both lists are sixteen. Both end in the Key of Anciuxor. The vessel meaning that forced the rename is gone. **So the sixteen Prismshards of this handoff are the sixteen Astralite Prisms already named and placed at V3.17.50 / V3.17.51.**

> ★ **THE ONE INFERENCE ON THIS PAGE — flag for the Creator.** Nothing in the handoff says "these are the same sixteen." It is the only reading that leaves one set of sixteen supreme relics instead of two, and it is what the code below assumes. If the Creator intends two distinct sixteens, `PRISMSHARD_REGISTRY` needs to be split, not renamed.

Everything else below is the Creator's document, preserved.

---

## 0b · ★★★ THE TWO ARROWS — Creator ruling, 2026-09-01

> **Creator:** *"lets lock in that astralites make up gems, gems make up gem shards, gemshards make up prismshards, prismshards come from source"*

**LOCKED.** And it reads at first as a direct contradiction of Rules 3, 5 and 13
below — which say Prismshards are progenitors and everything *descends from*
them. It is not a contradiction. **It is the second of two arrows, and the first
one is already drawn in §1 of this document.**

### The ladder, locked

```
            SOURCE
              ↓  ── makes ──
         PRISMSHARD          16 · equilibrium of several
              ↑  ── made of ──
          GEMSHARD           81 · one Astralite, purified
              ↑  ── made of ──
             GEM             concentrated Astralite, leaning to one colour
              ↑  ── made of ──
         ASTRALITE           63 · the fundamental energies
```

### ★★ Why this does not break the descent rules

Two different relationships were being described by the same word, and naming
them apart resolves it:

| | | direction | stated in |
|---|---|---|---|
| **ORIGIN** | where a thing historically came from | Prismshard **→** downward | §3 · Rules 3, 5, 13 |
| **COMPOSITION** | what a thing is physically made of | Astralite **→** upward | **§1, already** |

§1 of this document has said the upward ladder from the beginning:

> *Multiple Astralite Sources → Highly Concentrated Astralite Gems → Complex
> Binding → Energetic Equilibrium → Scaled Power → **PRISMSHARD***

**That is the Creator's ruling, minus one step.** The ruling inserts GEMSHARD
between the gems and the binding — which §1 needed anyway, because §1's "highly
concentrated Astralite energies" and Rule 10's *"a Gemshard expresses one
extremely potent Astralite"* are describing the same object under two names.

★★★ **And §3 already reserved the space, in one word.** It says the relationship
between a Prismshard and a lesser relic may be *"physical, energetic,
technological, alchemical, historical, or **REPLICATIVE** — ancient civilizations
may have learned to reproduce properties a Prismshard first demonstrated."*

> **The Prismshards came first and everything descends from them. Later, someone
> worked out how to climb back up.** The crafting ladder is the REPLICATION of a
> descent that originally ran the other way — which is exactly the case §3 wrote
> a word for and never used.

Both arrows are true. Neither is metaphor. Hydrogen came from the beginning of
things *and* a star is made of hydrogen.

### ★★ The 81 is now a recipe as well as a census

```
descent      each Prismshard PRODUCES 5 Gemshards      15 × 5 + 6 = 81
composition  each Prismshard IS MADE OF its 5          5 (or 6) bind into 1
```

**The same arithmetic, read in both directions, and it closes both times.** A
number that only worked one way would have been the tell that one arrow was
wrong. This one does not have that problem.

★ **A self-enforcing ceiling falls out of it:** a Prismshard cannot be assembled
without holding **five of the 81 Gemshards** — which is not a restriction anyone
has to write down or police. The hierarchy defends itself.

### Each step, checked against standing canon

| step | already supported by |
|---|---|
| Astralite → **Gem** | §15: *"Astralite Gem — concentrated crystalline manifestation of Astralite energy"* |
| Gem → **Gemshard** | §6: *"GEMSHARD = PURITY / SPECIALIZATION"* · Rule 10: one Astralite at extreme concentration. A Gemshard is a gem taken to purity |
| Gemshard → **Prismshard** | §1's binding · §2: *"A Gemshard specializes. A Prismshard harmonizes"* |
| Source → **Prismshard** | **new** — see below |

### ★★★ SOURCE · what needs a ruling

"Source" is a **new term** in this canon, and two things need settling before it
is written into anything.

**1 · Is Source a new name for something already named?** Candidates:

- **AETHRYX** — *"not one of the sixty-three. It is the REASON there are
  sixty-three"* · *"the condition under which a signature is possible at all."*
- **The Highest One / Anciuxor** — §12: *"Anciuxor is the manifestation of the
  Highest One."*
- **A fourth thing**, above or behind both.

**2 · ★ It sits beside an origin story this document already tells.** §16e says
the Prisms *"condensed out of residue — traces of Immortal crossings pooling over
eons until they became stable relics."*

> **[INFER, offered not asserted] The two are compatible if the residue story is
> HOW and Source is WHAT the residue is residue OF.** Immortals crossing leave
> traces; what they are traces *of* is Source. Then nothing is overwritten — the
> condensation mechanism stays exactly as written and gains an origin behind it.

★★ **If Source is Aethryx, it also settles an open question in the colour
canon.** `GEM_COLOR_PSYCHOLOGY_CANON.md` §10.1 flags that a white gem —
*"a trace of Aethryx"* — would be the first relic material descending from **no**
Prismshard, an exception to Rule 13. Under this ladder that stops being an
anomaly: **white gems and Prismshards would come from the same place, at
different scales.** Rule 13 keeps one honest exception with a reason behind it
rather than a hole.

---

## 1 · THE 16 PRISMSHARDS

Exactly sixteen. The highest known relic class in the Aethryx Expanse.

A Prismshard is **not** a powerful Astralite crystal. It is a complex binding of multiple highly concentrated Astralite energies held at a precise state of **BALANCE + CONCENTRATION + SCALED POWER**.

```
Multiple Astralite Sources
  → Highly Concentrated Astralite Gems
    → Complex Binding
      → Energetic Equilibrium
        → Scaled Power
          → PRISMSHARD
```

The defining property is **complex Astralite balance**.

- An Astralite gem **expresses** an Astralite.
- A Gemshard expresses one **extraordinarily concentrated** Astralite power.
- A Prismshard contains a **balanced relationship between multiple** Astralite powers.

## 2 · WHY THEY ARE DIFFERENT

Never "a stronger Gemshard." A different relic **state**.

> **A Gemshard specializes. A Prismshard harmonizes.**

Because of that equilibrium, a Prismshard can produce phenomena unreachable through one Astralite alone. Each should eventually carry its own composition, equilibrium, governing phenomenon, relic identity, visual identity, powers, mythology, historical significance, and derivative Gemshards.

Sixteen different successful **equations** of Astralite power — not sixteen differently coloured super-gems.

## 3 · PROGENITOR RELICS

Prismshards are progenitors. Gemshards, Life Stones, Astralite Stones and other minor relics ultimately descend from Prismshard phenomena.

> ★★ **This is the ORIGIN arrow. The COMPOSITION arrow runs upward — see §0b.**
> The word **replicative**, three lines below, is what lets both be true.

This does **not** mean every lesser relic is a visible broken chunk of one. The relationship may be physical, energetic, technological, alchemical, historical, or **replicative** — ancient civilizations may have learned to reproduce properties a Prismshard first demonstrated. Many modern relic technologies could trace back to Prismshard principles while the people using them no longer know it.

## 4 · THE 81 GEMSHARDS

All 81 originate from the 16 Prismshards. The number is **structural, not decorative**:

```
Prismshards I–XV   ×  5 Gemshards each  =  75
Prismshard XVI     ×  6 Gemshards       =   6   ← THE KEY OF ANCIUXOR
                                          ────
                                            81
```

## 5 · THE 81ST GEMSHARD

The normal law is 1 Prismshard → 5 Gemshards. **Only the Key of Anciuxor violates it**, producing six, and therefore producing **Gemshard 81**.

★ **Do NOT casually define why.** It is reserved as a major lore revelation. Possibilities — *not canon* — include Anciuxor, the Gate of Anciuxor, the boundaries between realms, the Higher/Highest structure of existence, something outside the Astralite system, or a hidden property of the Key.

**The canonical fact is only this:** the Key uniquely creates a sixth Gemshard, producing Gemshard 81.

## 6 · GEMSHARD COMPOSITION

Each Gemshard resolves around **ONE ASTRALITE SOURCE**, belonging to one family/Axis.

```
PRISMSHARD → separation / derivation / resolution → SINGULAR ASTRALITE EXPRESSION → GEMSHARD
```

> **PRISMSHARD = COMPLEXITY / EQUILIBRIUM · GEMSHARD = PURITY / SPECIALIZATION**

Never describe a standard Gemshard as a random mixture of Astralites.

## 7 · GEMSHARDS AND ASTRALITE FAMILIES

Every Gemshard is traceable to: its parent Prismshard → its singular Astralite → that Astralite's family/Axis → its energy expression → its applications.

Database fields (contents deferred): `Gemshard ID · Name · Parent Prismshard · Astralite · Family/Axis · Energy Expression · Ultramax Type · Ultramax Move(s) · Mythic Weapon Association · Known Users · Location/History · Status`.

## 8 · GEMSHARDS AND ULTRAMAX

Gemshards commonly determine **Ultramax typing** and **Ultramax moves**: bonding with one grants access to an extraordinarily specialized power state — elemental/Astralite identity, transformation properties, visual effects, special abilities, ultimate techniques, finishers, affinity.

An Ultramax move must thematically reflect its Gemshard's actual Astralite source. **The gameplay ability is an extension of the lore, not a generic "ultimate-move item."**

## 9 · GEMSHARDS AND ANCIENT MYTHIC WEAPONS

Many ancient mythic weapons derive their properties from Gemshards:

> **Gemshard = concentrated power source · Weapon = vessel / interface / amplifier / control mechanism**

A civilization discovers a Gemshard, studies its Astralite property, builds a weapon around it, develops a control method, and creates a legend. This is why certain ancient weapons hold powers modern technology cannot reproduce.

Not every Gemshard sits in a weapon. They may be independent, lost, sealed, carried, worshipped, or embedded in other artifacts.

## 10 · RELIC HIERARCHY

| tier | class | count | nature |
|---|---|---|---|
| 1 | **PRISMSHARDS** | 16 | composite · multiple concentrated Astralites in perfected equilibrium · produce derivative relic systems |
| 2 | **GEMSHARDS** | 81 | singular · one extremely potent Astralite from one family · Ultramax + mythic weapons |
| — | **derivative relics** | — | Life Stones, Astralite Stones, other specialized/minor relics · genealogies differ |
| — | **base Astralite material** | — | gems, crystals, compounds · **not** Gemshards |

A Gemshard is a relic-class concentration of Astralite power, **not simply a valuable Astralite crystal**.

## 11 · POWER-SCALE PHILOSOPHY

Not "Prismshard has a bigger damage number." The distinction is **qualitative**. Gemshards can still be devastating; some may produce attacks, transformations or weapons of extraordinary scale, and a Gemshard may occasionally suit a task better than a Prismshard. The Prismshard's advantage is complexity, equilibrium, versatility and cosmological significance.

> A Gemshard is an extreme expression of **one thing**. A Prismshard is the successful coexistence of **several**.

## 12 · PRISMSHARD XVI — THE KEY OF ANCIUXOR

Exceptional even among Prismshards. Anciuxor is the manifestation of the Highest One and is associated with the Gate between the cosmic realms; the Key carries significance beyond relic power. Its numerical anomaly reinforces this — six derivatives where every other yields five. **It is responsible for Gemshards 76–81** (sequential numbering by lineage), with 81 as its unique sixth.

Never reduce it to "Prismshard #16 but strongest." Its importance is **cosmological**.

## 13 · DATABASE RELATIONSHIP

`PRISMSHARDS 1 → many GEMSHARDS` · IDs 1–15 `gemshard_count = 5` · ID 16 `gemshard_count = 6` · validation `15 × 5 + 6 = 81`.

Every Gemshard references exactly one parent Prismshard and (eventually) exactly one primary Astralite source, enabling: all Gemshards of Prismshard IX · the parent of a given Ultramax move · all Gemshards of a family · mythic weapons powered by Gemshards · all Ultramax techniques of one Astralite · the six descended from the Key.

## 14 · THE FOURTEEN RULES

1. Exactly **16** Prismshards.
2. Prismshards are the **highest known relic class**.
3. Prismshards = multiple highly concentrated Astralite energies bound into **equilibrium**. *(★ and by the 2026-09-01 ruling those energies are its **Gemshards** — see §0b)*
4. **81** known Gemshards.
5. All 81 **originate from** the 16 Prismshards. *(★ ORIGIN, not composition. The composition arrow runs the other way — §0b)*
6. Prismshards **I–XV** each generate exactly **five**.
7. Prismshard **XVI** generates **six**.
8. Prismshard XVI **is the Key of Anciuxor**.
9. The Key's sixth derivative creates **Gemshard 81**.
10. A Gemshard expresses **one** extremely potent Astralite of one family.
11. Gemshards commonly determine **Ultramax typing and moves**.
12. Gemshards are associated with and can power **Ancient Mythic Weapons**.
13. Prismshards are **progenitors** of lesser relic systems (Gemshards, Life Stones, Astralite Stones, others). *(★ ORIGIN. See §0b for why this coexists with the upward crafting ladder, and §0b's Source note for its one possible exception)*
14. Ordinary Astralite gems, Gemshards and Prismshards are **never synonymous**.

## 15 · TERMINOLOGY

- **Astralite** — fundamental elemental/existential energy within the Astralite Matrix.
- **Astralite Gem** — concentrated crystalline manifestation of Astralite energy.
- **Gemshard** — supreme singular-energy relic descended from a Prismshard, centred on one highly potent Astralite.
- **Prismshard** — supreme composite relic of multiple concentrated Astralites in balance.
- **Parent Prismshard** — the Prismshard a Gemshard originates from.
- **Ultramax** — power/transformation system whose typing and moves can be determined by Gemshards.
- **Ancient Mythic Weapon** — legendary weapon whose abilities may be powered by a Gemshard.
- **Key of Anciuxor** — Prismshard XVI, the only one producing six Gemshards.

## 16 · CORE DESIGN PHILOSOPHY

- A **Gemshard** answers: *what happens when one Astralite reaches extraordinary relic-level concentration?*
- A **Prismshard** answers: *what happens when several extraordinary Astralite forces are bound into a stable, scaled equilibrium?*

The difference must be visible in lore, gameplay, visual design, abilities and historical importance. The relic system should feel like **an extension of the Astralite Matrix**, not a disconnected collectible-gem mechanic.

---

## 16b · ★ THE 22 ULTRASHARDS ARE 22 OF THE 81 — Creator ruling, 2026-08-29

> *"merge the 22 ultrashards into the 81 gemshards. they all descend from prismshards."*

The Ultrashards are **not** a parallel reproduced technology. They are Gemshards
— 22 of the 81 — and like every Gemshard they descend from a Prismshard. This is
why they can hand a Zyrex an Ultramax type and move at all: **Rule 11 was
describing them the whole time.**

**Census: 81 total · 22 recorded · 59 unrecorded.**

| | Ultrashard | Ultramax type | Ultramax move |
|---|---|---|---|
| 1 | Predator Shard | Beast | Max Predator Roar |
| 2 | Martial Shard | Humanoid | Max Martial Ascension |
| 3 | Hive Shard | Creature | Max Hivestorm |
| 4 | Terra Shard | Nature | Max Terraquake |
| 5 | Verdant Shard | Verdant | Max Worldroot |
| 6 | Ember Shard | Elemental | Max Novabloom |
| 7 | Tide Shard | Elemental | Max Hydrocore |
| 8 | Volt Shard | Elemental | Max Voltvortex |
| 9 | Cryo Shard | Elemental | Max Cryoveil |
| 10 | Squall Shard | Elemental | Max Squallcrown |
| 11 | Prism Shard | Crystal | Max Prismshatter |
| 12 | Wraith Shard | Spirit | Max Nether Wail |
| 13 | Halo Shard | Divine | Max Halocore |
| 14 | Corona Shard | Radiant | Max Coronacore |
| 15 | Wyrm Shard | Draconic | Max Wyrmking Descent |
| 16 | Blackspiral Shard | Corrupted | Max Blackspiral |
| 17 | Stellar Shard | Astral | Max Stellar Convergence |
| 18 | Chronal Shard | Chrono | Max Chronal Rupture |
| 19 | Auracide Shard | Aura | Max Auracide |
| 20 | Reactor Shard | Tech | Max Meltdown Reactor |
| 21 | Xeno Shard | Extraterrestrial | Max Xenocataclysm |
| 22 | Null Shard | Unknown | Max Reality Tear |

### ★★ Three facts, and only two are canon

| | fact | status |
|---|---|---|
| 1 | **STRUCTURE** — 81 exist, 15×5 + 6 | canon |
| 2 | **IDENTITY** — 22 of them are these Ultrashards | **canon as of this ruling** |
| 3 | **LINEAGE** — *which* Prismshard each descends from | **open** |

Identities therefore carry `parent: null, slot: null`. Writing an identity into a
numbered slot would make the slot's *position* assert a parent — putting the
Predator Shard at #7 declares it a child of Prismshard II, which has never been
said. They are inside the 81 and they descend from a Prismshard; which branch is
a question, not a guess.

### ★ A note the placement work will need

**Five Ultrashards share the Elemental type** (Ember · Tide · Volt · Cryo ·
Squall). By Rule 10 each Gemshard is one Astralite, so those are **five different
Astralites presenting through one type** — which means **Ultramax type is not the
same axis as Astralite family**, and lineage cannot be derived from type alone.
That is consistent with §6, and it is the reason the code refuses to infer
parents from the type column.

When the Creator does assign lineage, the natural method is
Astralite → family/Axis → the Prismshard anchored to that family
(the Founder's Prism is F1 Creation, the Blood Prism F7 Body, and so on) — but
that requires the type → Astralite map, which is still listed OPEN in the type
canon (§42).

## 16c · ★★★ THE FAMILY QUOTA — Creator ruling, 2026-08-29

> *"the gemlord weapons are gemshards that come from the prismshard families. each astralite family (9) gets 2 prismshards besides ax1 and a9, they get 1 each so 1 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 1. does that check out?"*

**It checks out on both axes — and the second one is what makes it a structure rather than a coincidence.**

```
AXIS 1 · PRISMSHARDS      1 + (2 × 7) + 1              = 16   ✓
AXIS 2 · GEMSHARDS        16 × 5 = 80, + the Key's 6th = 81   ✓
```

The family quota and the 81 are **the same arithmetic seen from two directions**. A distribution that summed to 16 but not to 81 would have been a happy accident; this one closes both books.

### ★★ And it fits the existing lock without re-authoring anything

Twelve Prismshards already carry a family anchor from V3.17.50. Their tally against the quota leaves **exactly four open slots** — and there are **exactly four Prismshards with no family**:

| F | family | quota | assigned | gap | who holds it |
|---|---|---:|---:|---:|---|
| 1 | CREATION | 1 | 1 | — | I Founder's *(Ax-1)* |
| 2 | **PAST** | 2 | 1 | **1** | III Silent *(Ax-2)* |
| 3 | DESTRUCTION | 2 | 2 | — | V Devourer's *(Ax-3)* · X Reaver's *(Ob)* |
| 4 | MIND | 2 | 2 | — | VI Oracle's *(Ax-4)* · XI Emissary's *(Ao)* |
| 5 | PRESENT | 2 | 2 | — | IV Wanderer's *(Ax-5)* · XII Refuge *(Pv)* |
| 6 | **PRESERVATION** | 2 | 1 | **1** | IX Sentinel's *(In)* |
| 7 | **BODY** | 2 | 1 | **1** | II Blood *(Ax-7)* |
| 8 | **FUTURE** | 2 | 1 | **1** | VIII Voyager's *(Syx)* |
| 9 | SPIRIT | 1 | 1 | — | VII Deep *(Ax-9)* |

**Four gaps: F2 PAST · F6 PRESERVATION · F7 BODY · F8 FUTURE.**
**Four candidates: XIII Immortalands · XIV Anciara · XV Omnithris · XVI the Key.**

Assigning those four closes the lineage problem the merge left open.

### ★ One thing the quota implies — flagged, not assumed

For the count to reach 16, **the Key of Anciuxor must belong to a family.** Prior design intuition had it *"transcending the 63, carrying all 9 families as trace echoes with Ax as primary substrate"* — compatible if that **primary substrate is its family**, but the Creator has not said it outright. All four remain `family: null` in code until he places them. Whichever family takes the Key ends up owed **eleven** Gemshards instead of ten.

### Gemshards owed per family (derived, moves when the last four are placed)

`F1 → 5 · F9 → 5 · the other seven → 10 each · +1 wherever the Key lands = 81`

---

## 16d · ★★★ THE GEMLORD WEAPONS ARE GEMSHARDS

This settles the §9 tension the merge flagged. Canon said the Gemlord blades were *"relic-forged · cut from PRISMSHARDS"*, while §9 says a mythic weapon is built **around** a Gemshard. Both were true at different depths: **the weapon IS a Gemshard, and the Gemshard came from a Prismshard** — so "cut from Prismshards" was right about the lineage and loose about the class.

**Ten Gemlords · ten weapons · ten of the 81.**

| Gemlord | title | district | weapon | in game |
|---|---|---|---|---|
| Azurel | Sapphirelord | Vorashil | **Sapphire Tearsword** | ✔ |
| Rakoron | Gemlord | Malezor | **Rubypaw Longsword** | ✔ |
| Emeralix | Emeralord | Veridan | **Emerald Axe** ★inferred | ✔ |
| Ivirium | Pearlord | Zarvane | **Pearlbow** ★inferred | ✔ |
| Eurakeon | Amethystlord | Netharion | — | |
| Obsidius | Onyxlord | Xilnar | — | |
| Ambrevon | Amberlord | Baelgor | — | |
| Mutaryn | Citrinelord | Andrannor | — | |
| Oathane | Gemlord | Thardin | — | |
| Oatheus | **The Empty Throne** | Korathen | — | |

★ **The two inferences.** The Emerald Axe came from a **Veridan** cosmic chest and Emeralix is the Emeralord **of Veridan**; the Pearlbow came from a **Zarvane** chest and Ivirium is the Pearlord **of Zarvane**. Gem name, chest district and Gemlord title agree three ways — but three matching signals is not the Creator saying so, and both are marked `inferred: true`.

★ **Oatheus keeps his slot.** He is absent, so whether his weapon is lost *with* him, waiting *for* him, or the reason he left is a story question, not a data one.

**Census after this ruling: 81 total · 32 recorded (22 Ultrashards + 10 Gemlord weapons) · 49 unrecorded · 0 placed.**

## 16e · ★★★ MEALUX · THE LIVING TRACE OF THE KEY

> **Creator, 2026-08-29:** *"the key of anciuxor prism is an entire zyrex species called mealux. one of the rarest zyrex. tier 8. native on kyrathos as guardians of the eternal library."*
> **Refined, same day:** *"rewrite mealux new canon. they come from remnant traces of the key of anciuxor."*

**Descent, not identity.** The first reading here had the species *be* the relic. It does not. **The Key of Anciuxor is still one relic**, still Prismshard XVI, still on Anciuxor's tail, still the only object that bridges the Four Realms — and the **Mealux are what its remnant traces became**.

| | |
|---|---|
| **Species** | Mealux |
| **Tier** | **8** |
| **Rarity** | one of the rarest Zyrex |
| **Homeworld** | **Kyrathos** |
| **Role** | guardians of the **Eternal Library** |
| **Origin** | **remnant traces of the Key of Anciuxor** |
| **Relic class** | DERIVATIVE — the *living* branch of §3 descent |

### ★★ The mechanism was already in the cosmology

The Astralite Prisms themselves **condensed out of residue** — traces of Immortal crossings pooling over eons until they became stable relics. The Mealux are that same law running one level down: **residue of the Key, condensing until it became stable life.**

The Expanse has always made things out of what it leaves behind. This is the first time what it left behind started breathing.

### ★ And it is §3 with a heartbeat

Prismshards are progenitors — they *"split, fracture, shed, or otherwise produce derivative relic material,"* physically, energetically, historically or replicatively. **Gemshards, Life Stones and Astralite Stones are the mineral branch of that descent. The Mealux are the living branch, and the only one known.** §3 always allowed this; nothing had to bend to fit it.

### ★ What this ruling RESOLVES (three of the six questions from the first reading)

- **"One Key, or many?"** — **Closed.** One Key. Many Mealux. "16 Prismshards" still counts relics.
- **"Does bonding a Mealux open the Ultimate Prismsynch?"** — **Withdrawn.** A remnant-trace being is not the Prism; the third lock still wants the Key itself, which still means Anciuxor. That flag was a consequence of the identity reading and dies with it.
- **"Is Prismshard XVI alive?"** — **No.** It is a relic that once *made* something alive.

### ★ CONFLICT · the codex already has a Mealux, and it says T3

`rp7_roster_v7.json` idx 275 records **Mealux · class Champion · type Aura · Tier III · SOLO chain**, and `CODEX_TRIAGE_ZYREX_VS_HUMANOID.md` line 432 flagged it as a possible **humanoid** ("class Mage").

1. **The Creator's word wins** — a **retype T3 → T8**, the largest tier jump in the project.
2. **The triage row is closed.** Mealux is confirmed **Zyrex**.
3. **Absent from the locked ROSTER V1**, so no lock breaks — but adding it is a **v2 ingest**.

### ★★★ 16f · THE KEY LINE · one Key of Anciuxor, a few Keys of Mealux

> **Creator, 2026-08-29:** *"one key of anciuxor. few keys of mealux (rare immortal from kyrathos) found in hidden parts of game."*

```
THE KEY OF ANCIUXOR   ·  one  ·  Prismshard XVI  ·  on Anciuxor's tail  ·  never obtainable
      ↓  remnant traces became…
MEALUX                ·  a rare IMMORTAL species  ·  Kyrathos  ·  Eternal Library
      ↓  which left…
KEYS OF MEALUX        ·  a FEW  ·  hidden in the world  ·  findable
```

**★★ This is what makes the Key reachable without making it obtainable.** Standing canon says the Key cannot be won on the Rizer Path — it is the one Prism a player can never hold. A lesser key, descended from the species descended from the Key, **keeps that wall exactly where it is** and still lets a player find something *of* it in a cave nobody told them about. Two removes from the Highest One is close enough to matter and far enough to be legal.

**★ "Rare immortal from Kyrathos"** also settles half of the T8 question: **IMMORTAL is the T8 class name in canon**, so this affirms the class — without claiming the Mealux *made* Kyrathos. "A T8 Immortal that arrived to guard rather than to create" is now the reading canon actually supports. Recorded as `immortalClass: true`; the creator-of-its-world question stays open.

**★ Count and places are deliberately empty.** "Few" is a quantity you have not fixed, and this project's hidden things are placed by hand at tiles you name — the game never reveals *where*. So the class exists and the item is registered, but `count: null` and `found: []`. Inventing three coordinates would be inventing canon.

### ★★ What is still open



1. **T8 = the IMMORTAL class, and every T8 being creates its home planet.** Mealux is T8 and native to Kyrathos — **did they make it, or did they only arrive to guard what was already there?** The new origin makes the second reading available for the first time: a being condensed from relic-residue need not be a creator. Still the Creator's call, and still the second T8 tension after Omegoran.
2. **Kyrathos appears nowhere else in the data** — not among the Matrix's 27. A 28th world, and possibly **AE28**, the body that left the Expanse? *Speculation.*
3. **★ It still points at a family.** Guardians of an *Eternal Library* read as **F2 PAST** (Ax-2 *Mnemosyne* Aethra; the Silent Prism is already kept by "Memorykeepers") or **F6 PRESERVATION** — both open slots. Offered, not written: `PRISMSHARD_FAMILY[16]` stays null.
4. **Does Gemshard 81 relate?** The Key alone sheds a sixth Gemshard, and the Key alone shed a species. **Two irregularities from the same relic.** Whether they are the same irregularity is exactly the revelation §5 reserves. Untouched.
5. **How many Mealux, and are the traces spent?** A finite residue implies a finite species — which would be one reason they are "one of the rarest."



1. **T8 = the IMMORTAL class, and every T8 being creates its home planet.** Mealux is T8 and native to Kyrathos — **did they make it, or did they only arrive to guard what was already there?** The new origin makes the second reading available for the first time: a being condensed from relic-residue need not be a creator. Still the Creator's call, and still the second T8 tension after Omegoran.
2. **Kyrathos appears nowhere else in the data** — not among the Matrix's 27. A 28th world, and possibly **AE28**, the body that left the Expanse? *Speculation.*
3. **★ It still points at a family.** Guardians of an *Eternal Library* read as **F2 PAST** (Ax-2 *Mnemosyne* Aethra; the Silent Prism is already kept by "Memorykeepers") or **F6 PRESERVATION** — both open slots. Offered, not written: `PRISMSHARD_FAMILY[16]` stays null.
4. **Does Gemshard 81 relate?** The Key alone sheds a sixth Gemshard, and the Key alone shed a species. **Two irregularities from the same relic.** Whether they are the same irregularity is exactly the revelation §5 reserves. Untouched.
5. **How many Mealux, and are the traces spent?** A finite residue implies a finite species — which would be one reason they are "one of the rarest."

## 17 · WHAT SHIPPED IN CODE (v0.95.876 · extended v0.95.877)

`PRISMSHARD_REGISTRY` — sixteen entries carrying numeral, name, ascension tier, realm affinity, home planet and `gemshardCount`. Names/tiers/placements come from the **existing** V3.17.50 / V3.17.51 lock; nothing was invented.

`GEMSHARD_SLOTS` — 81 slots **derived by code**, never typed as a list. Each carries `id`, `parent`, and `name / astralite / family / ultramaxType / ultramaxMove / weapon = null`, because those are the Creator's to fill.

`relicClass(itemKey)` — the one place the game answers "is this a Prismshard, a Gemshard, a derivative relic, or ordinary Astralite material" (Rule 14, enforced rather than described).

`GEMSHARD_REGISTRY_()` — the 22 recorded Gemshards, built **lazily**. The first
draft was an eager IIFE reading `SHARD_META` 30k lines before that const exists;
the TDZ error was swallowed by its own guard and the registry shipped **silently
empty** — census read 0 of 81 and every check would have passed on an empty
array. Caught by *running* it rather than reading it.

`gemshardCensus()` → `{ total: 81, recorded: 22, unrecorded: 59, placed: 0 }`.
`placed` is the honest count of how many have a known parent Prismshard: zero.

Queries: `gemshardIdsOf(n)` · `parentPrismshardOf(gid)` · `gemshardsOfFamily(f)` · `keyOfAnciuxorGemshards()` · `GEMSHARD_81`.

Boot-time validation asserts 15×5+6 = 81 = `GEMSHARD_SLOTS.length`. **The total is computed, never typed** — a future edit to one Prismshard's count breaks the assertion instead of silently drifting.

## 18 · OPEN QUESTIONS FOR THE CREATOR

1. **★ The identification in §0** — are the 16 Prismshards the 16 Astralite Prisms? The code assumes yes.
2. **The VOLTSHARD.** Shipped at v0.95.822 as a *Prismshard* powering the Sapphire Voltstorm A5, on the Creator's own instruction (*"these will be prismshard moves… the first prismshard we will find is the voltshard in malezor"*). But by §6 a single-energy relic named for one force is a **Gemshard**, and the standing Gemshard ruling already lists it as one. Two canon statements, one item. **Not retyped without a ruling** — the code marks it `CLASS_DISPUTED` and names both readings.
3. ~~The 22 Ultrashards — 22 of the 81, or a reproduced technology?~~ **ANSWERED 2026-08-29 · see §16b.** They are 22 of the 81. What remains open is their **lineage**: which Prismshard each of the 22 descends from.
4. **Gemshard numbering** — sequential by lineage (I → 1-5, II → 6-10 … XVI → 76-81) is assumed from §12's "76–81". Confirm.
5. ~~The Gemlord blades — cut from Prismshards, or built around Gemshards?~~ **ANSWERED 2026-08-29 · see §16d.** They *are* Gemshards, descended from the Prismshard families.

**New, from the same ruling:**

6. **Which family takes each of the last four Prismshards?** F2 PAST · F6 PRESERVATION · F7 BODY · F8 FUTURE are open; XIII, XIV, XV and XVI are homeless. Any assignment closes the quota.
7. **Does the Key of Anciuxor have a family?** The arithmetic requires it (§16c). Its family ends up owed eleven Gemshards.
8. **The Emerald Axe and Pearlbow attributions** — inferred from three agreeing signals, not stated. Confirm or correct.
9. **Which family does each Gemlord weapon belong to?** Ten weapons, nine families — so at least one family holds two Gemlord weapons, or one weapon belongs to a family with none.
