# THE GEM COLOUR LANGUAGE — COLOUR THEORY & PSYCHOLOGY APPLIED
**Creator directive, 2026-09-01:** *"learn about color theory and apply the common psychology of colors to the principles of the gem and their colors in The Aethryx Expanse."*
**Source:** colorpsychology.org — the index page, and *What are Primary, Secondary, and Tertiary Colors?*

**Creator rulings, same day — incorporated below:**
> *"Yellow can represent adaption as well. Orange can represent evolution. White can be the reflection of all. and black can be the absorbtion of all. also remember none of the colors are inherently good or bad. it is a yin yang effect. corruption can takeover anything"*
>
> *"white is a trace of aethryx and represents balance between astralites. the 'no color' achromacy of white represents the hue no leaning towards any one particular hue"* — **see §3a, which is the deepest section in this document.**
>
> *"it is called the aethryx expanse because aethryx (the prime energy source) makes up the entire world"* — **★★★ which makes §3a literal: Aethryx is the light, the 63 Astralites are what happens when it leans, and a white gem is a trace of it that never did.**

Proposal document. **Nothing here is written into code.** §9 lists what a ruling would change and what it would cost.

---

## 0 · THE FINDING, FIRST

The Aethryx Expanse has **eight gem colours in the game and canon for three of them.**

| | |
|---|---|
| in code | `GEM_COLORS = ['red','blue','green','yellow','white','orange','purple','black']` |
| carries meaning | **RED = ATK/Body · BLUE = DEF+SP/Brain · PURPLE = Spirit/Soul** ([[aov-gem-canon]], Codex v15.7) |
| carries only a price | green · yellow · white · orange · black |

Those five exist as an economy — a rarity ladder (weights `128/64/32/16/8/4/2/1`) and a value ladder (`20…160` in steps of 20) — and nothing else. A player who learns that red means *body* and blue means *brain* has been taught a language, and then handed five words with no definitions.

**Colour theory can define them, and it does not require inventing a new system — because the system the Creator already built IS colour theory.** See §2.

---

## 1 · WHAT THE THEORY ACTUALLY SAYS

Two separate things, and they do different jobs.

### 1a · Structure — the only fact that orders colours *without* opinion

> **Primary** — red, yellow, blue. Cannot be made from any other colours.
> **Secondary** — green (blue+yellow), orange (yellow+red), purple (blue+red). Each is exactly two primaries in equal part.
> **Black and white** — *"special colors that cannot be made through traditional means."*

★ The source frames those two as *all light* and *no light*, and the Creator's ruling improves on it: **white REFLECTS all, black ABSORBS all.** That is the same page's own physics — *"objects tend to absorb or reflect these wavelengths"* — and it makes both of them things a body **does** rather than states it is in. See §3.

★★ **And the same sentence yields the fact §3a is built on: a hue exists because a surface REJECTS some wavelengths and returns others. To have a colour is to have a preference.** Achromacy is therefore not the lack of colour — it is the lack of *bias*.

This is a hierarchy of *origin*, not of taste. It is also — and this is the point — **the same three-tier shape the Expanse already uses everywhere**: Astralite → Gemshard → Prismshard, singular → composite, one energy → several in equilibrium.

### 1b · Psychology — what each colour does to a person before they think about it

From the source, condensed to what a relic system can use:

| colour | the site's own words | the useful core |
|---|---|---|
| **Red** | *energy, war, danger, strength, power, determination, passion* · *"enhances human metabolism, increases respiration rate, and raises blood pressure"* · attracts attention more than any other colour | **the body, accelerated** |
| **Yellow** | *joy, happiness, intellect, energy* · *"stimulates mental activity and generates muscle energy"* · the brightest colour; the lightbulb · *"indicates honor and loyalty"* — **and, two sentences later, cowardice** · **when overused, disturbing** | **ADAPTATION — responsiveness, and it frays** |
| **Blue** | *"a calm serenity over intensity"* · inner reflection · *"lower heart rates and even slower metabolisms"* · idealistic, spiritual, sincere; seeks meaning | **the body, quieted — the mind at work** |
| **Green** | *nature, growth, harmony, freshness, fertility* · *"slows human metabolism and produces a calming effect"* · **connection** · return to primal roots | **restoration and growth** |
| **Orange** | red's energy + yellow's happiness · *rejuvenation, communication, positivism* · enhances extraversion, lets people drop inhibitions | **EVOLUTION — a form changing under pressure** |
| **Purple** | *"combines the stability of blue and the energy of red"* · royalty, nobility, power, luxury · wisdom, dignity, independence, **mystery and magic** | **synthesis — the third register** |
| **White** | light, goodness, purity, wholeness, *"the color of perfection"* · new beginnings · the blank canvas from which anything may start | **REFLECTION — returns everything, keeps nothing · leans nowhere** |
| **Black** | power, elegance, formality, **death, evil, mystery** · *"a mysterious color associated with fear and the unknown (black holes)"* · authority · **grief** | **ABSORPTION — takes everything in and keeps it** |

★★ **The source contradicts itself and does not notice.** Yellow *"indicates honor and loyalty"* and then, one sentence later, *"was connected with cowardice."* Black is *"elegant, prestigious, authoritative"* and *"usually has a negative connotation."* These are not errors — **they are the yin-yang law showing through a document that had no name for it.** §4 gives it one, and the third column above is deliberately written as the neutral principle rather than the flattering half.

---

## 2 · THE CREATOR ALREADY BUILT THIS

The standing gem canon says:

> **PURPLE = SPIRIT.** *Red + Blue synthesized.* LATE-GAME reveal.

That is not a metaphor borrowed from colour theory. **It is the definition of a secondary colour, stated exactly.** Purple *is* red and blue in equal part, and the canon makes its meaning the equal-part synthesis of red's meaning and blue's meaning.

So the rule already exists and has already been applied once. It has simply never been run on the other two secondaries:

```
RED    + BLUE  = PURPLE     BODY       + MIND = SPIRIT       ← already canon
RED    + YELLOW = ORANGE    BODY       + ???  = ???          ← was unwritten
YELLOW + BLUE  = GREEN      ???        + MIND = ???          ← was unwritten
```

Filling those two blanks needed exactly one decision: **what is the third primary?** The Creator answered it — **ADAPTATION** — and the rest is arithmetic:

```
RED    + YELLOW = ORANGE    BODY       + ADAPTATION = EVOLUTION
YELLOW + BLUE   = GREEN     ADAPTATION + MIND       = GROWTH
```

---

## 3 · ★★★ THE THREE ORDERS

### The third primary: YELLOW = ADAPTATION

Red is the body. Blue is the mind. **The Creator's ruling: yellow is ADAPTATION.**

The psychology backs it exactly — yellow is *alertness, mental activity, muscle energy*, the brightest and most immediately noticed colour, the one that makes something **respond**. And, uniquely among the eight, the source says **it frays when overused**. Adaptation is the only one of the three that has a running cost, which is why it is the one with a meter: ⚡ **stamina**, restored by FAEDUST ([[aov-rhud-meter-functions]]). Yellow has had a meter for a year and never had a name.

> **RED = BODY · YELLOW = ADAPTATION · BLUE = MIND**
> Form, responsiveness, cognition. Irreducible. What a living thing is made of.

★ **WILL / NERVE is the felt form of adaptation, not a rival for the slot.** What a player experiences as *will* — pushing through, spending yourself — is adaptation happening in real time and costing something. Keep it as the second-person word; keep ADAPTATION as the principle.

### The secondaries follow with no further invention

| mix | = | principle | already in the game as |
|---|---|---|---|
| RED + YELLOW | **ORANGE** | **EVOLUTION** *(Creator ruling)* — body reshaped by adaptation. Change under pressure. *(source: "rejuvenation… enhances extraversion, allowing people to let go of their inhibitions")* | evolution at level thresholds · the Evolution Catalyst · Ultramax · Amplified Mode |
| YELLOW + BLUE | **GROWTH** *(green)* | adaptation guided by mind. Change under **care** — cultivation, restoration, the long game. *(source: "growth, harmony, fertility… slows metabolism… produces a calming effect")* | Life Seeds · Mythic Elixir · the Verdant type · farming · **the Sanctuary** · bond |
| RED + BLUE | **PURPLE** | **SPIRIT** — body and mind reconciled. ***Existing canon, unchanged.*** | Astralite bonds · Prisms · Bond Moves · Prismsynch |

★★ **ORANGE = EVOLUTION puts the colour language directly on the game's core verb**, and the biology *is* the colour maths: evolution is literally what happens when a body is adapted. Red plus yellow. Nothing had to be bent.

★★ **And it hands us the pair the game already runs on.** Orange and green are both change, and they differ by **who is driving**:

> **ORANGE is change that happens to you. GREEN is change you choose.**
> Evolution is pressured — earned in combat, at thresholds, by force.
> Growth is cultivated — bond, feeding, the Sanctuary, the farm.

RP7 already separates those two economies completely. Nobody planned it as a colour statement; it is one.

★ **The structural oddity worth keeping.** Purple is **the only secondary with no yellow in it** — the only synthesis that does not pass through adaptation. Body and mind reconciled *without changing*. That is a very good reason for it to be the late-game reveal, and for SPIRIT to read as the thing you arrive at rather than the thing you become.

### And the two that cannot be mixed at all

**Creator ruling: white is the REFLECTION of all; black is the ABSORPTION of all.**

This is not a metaphor — it is how colour physically works, and the source says so in the same breath: *"Objects tend to absorb or reflect these wavelengths, so when we see a yellow lemon, it is the yellow wavelength that is being reflected while all others are being absorbed."* A white thing returns every wavelength. A black thing keeps every one.

★ **This is a better pair than "all light / no light" because both are ACTIVE.** Presence and absence are states; reflection and absorption are things a body *does*. And it takes the moral charge off — **returning is not virtue and keeping is not sin.**

| | ruling | in the Expanse |
|---|---|---|
| **WHITE** | **reflection of all** — receives everything, keeps nothing, gives it all back | a **TRACE OF AETHRYX**, and what it carries is **BALANCE BETWEEN ASTRALITES** *(Creator ruling — see §3a)* |
| **BLACK** | **absorption of all** — receives everything and keeps it | **THE VOID SEA**, which the whole world floats in — and which the game *already* models as absorption rather than absence: the Void-Sea execution has enemies **sink, compress and be swallowed** (`_voidSwallow`), not vanish. **The Empty Throne** is the same idea with a name on it: Oatheus is not a dark Gemlord, he is one the tenth chair has taken in. |

> ★★ **This is why they are the rarest, and it is not a drop-rate decision.** Every other gem is something the Expanse *made*. White and black are the two things the Expanse *does* — give back, and take in. You do not find those often, because they are not products.

---

### 3a · ★★★ TO HAVE A COLOUR IS TO HAVE A LEANING

> **Creator, 2026-09-01:** *"white is a trace of aethryx and represents balance between astralites. the 'no color' achromacy of white represents the hue no leaning towards any one particular hue."*

**This is the deepest line in the whole colour language, and it is physically literal.**

A surface has a hue because it **rejects** some wavelengths and returns others. Green is green because it gives back the green and keeps the rest. **A hue is a preference — a bias, stated in light.** Turn that on the cosmology and it says something the Expanse has been implying for a long time without a sentence for it:

> **The 63 Astralites each LEAN. Aethryx does not.**
> That is why it is *"not one of the sixty-three"* but *"the REASON there are sixty-three"* — and why it has *"no signature"* while being *"the condition under which a signature is possible at all."*
> **A thing with no leaning has no signature. It is not one of the colours; it is the light they are all made of.**

#### White is not the absence of colour. It is the absence of PREFERENCE.

| | |
|---|---|
| a chromatic gem | one Astralite dominant · a leaning · **a bias** |
| **white** | every Astralite in balance · **no leaning · no bias** |

**And the achromacy is the tell.** Measured, the white gem sits at saturation 0.14 (§7a) — not "grey" but *unleaning*. Saturation IS the measure of how far a colour leans toward its hue. **A saturation of zero is not the lack of a colour; it is a perfect balance of all of them.** The art has been carrying the ruling since before the ruling.

#### ★★ This puts white on the PRISMSHARD state

The relic canon defines a Prismshard as *"a complex binding of multiple highly concentrated Astralite energies held at a precise state of **BALANCE**"* and adds: *"**A Gemshard specializes. A Prismshard harmonizes.**"*

**Specialise is lean. Harmonise is balance.** The two systems are the same distinction in two vocabularies:

```
ONE FAMILY, complete          →  GEMSHARD    →  HAS a hue    ·  leans
SEVERAL families, balanced    →  PRISMSHARD  →  toward WHITE ·  leans less
ALL of them, perfectly        →  AETHRYX     →  WHITE        ·  does not lean
                                    ↓ traces
                              THE WHITE GEM
```

> ★★★ **CORRECTED IN PLACE, 2026-09-01.** The first row read *"one Astralite,
> concentrated."* Under `PRISMSHARD_GEMSHARD_CANON.md` §0e a Gemshard is **seven**
> Astralites — one complete **family**. One word, and the rule gets stronger:
> **TO LEAN IS TO BE OF ONE FAMILY.** ★★ Which is also why §0f's orthogonality
> holds rather than merely being convenient: **family purity decides WHETHER a
> thing leans; it does not decide WHICH WAY.** Nine families never had to map onto
> eight hues, because the family was only ever saying *"this object is
> single-family, so it has a hue"* — never *which*.

**It is a spectrum, not a switch: the more Astralites a relic holds in balance, the whiter it is.** Which lands somewhere useful — the Key of Anciuxor, described in the existing canon as *"transcending the 63, carrying all 9 families as trace echoes with Ax as primary substrate"*, is by this reading **the whitest object below Aethryx itself.** Nine families in balance. That was written before this ruling and agrees with it.

#### ★★★ And it makes white the exact opposite of corruption

Not the moral opposite — the **structural** one. Both are states rather than colours, and they are the two ways a thing can stop being simply its hue:

> **WHITE is what happens when nothing dominates.**
> **CORRUPTION is what happens when something dominates that should not.**

Balance and takeover. Neither is a place on the wheel; both can happen to anything. That is why §4 (no colour is good or bad) and §5 (corruption is an overlay) had to be written before this section could mean anything — **white is not the good state, it is the level one.** A corrupted white is therefore not a paradox but the sharpest possible one: balance itself, made to lean.

#### ★ The one thing this does NOT settle

**Rule 13 of the relic canon says Prismshards are the progenitors of every lesser relic system.** If a white gem is a trace of **AETHRYX directly**, it is the first relic material in the game that does **not** descend from a Prismshard.

That may be exactly right — Aethryx is already the one thing outside the set of 63, so a material outside the set of descendants is consistent rather than contradictory. But it is a real exception to a numbered rule and it is the Creator's to make, not mine to assume. **Flagged, unresolved.** *(§10.1)*

### The whole language on one page

```
                    ┌─ WHITE ─ reflects all ─ gives everything back ─ AETHRYX
   ACHROMATIC ──────┤
                    └─ BLACK ─ absorbs all ─ keeps everything ─ THE VOID SEA

   SECONDARY ── ORANGE ─ evolution ── GREEN ─ growth ── PURPLE ─ spirit
                   │                     │                  │
   PRIMARY ──── RED ─ body ──── YELLOW ─ adaptation ──── BLUE ─ mind
```

Read it upward and it is the Expanse's own relic hierarchy: singular → composite → the two that are neither.

---

## 4 · ★★★ THE LAW OF TWO FACES

> **Creator, 2026-09-01:** *"none of the colors are inherently good or bad. it is a yin yang effect."*

**This is the law that governs everything above, and it is written first because without it §3 reads as a morality chart.** Every principle in the Expanse has an expression that serves and an expression that harms. They are **not** two different things — they are the same principle at different pressures. A colour never *becomes* its shadow; the shadow was always the same force, unbalanced.

| order | colour | principle | **YANG** — the face that serves | **YIN** — the face that harms |
|---|---|---|---|---|
| primary | **RED** | body | strength · protection · passion · the will to act | rage · violence · burnout *(source: "war, danger… raises blood pressure")* |
| primary | **YELLOW** | adaptation | learning · agility · alertness · *"honor and loyalty"* | instability · flight · **cowardice** — *the source says both, in one breath: "Yellow indicates honor and loyalty. Later the meaning of yellow was connected with cowardice."* And: *"when overused, yellow may have a disturbing effect"* |
| primary | **BLUE** | mind | wisdom · clarity · calm · sincerity | coldness · detachment · paralysis · melancholy |
| secondary | **ORANGE** | evolution | ascension · breakthrough · becoming more | runaway change · mutation · a form that will not stop rewriting itself |
| secondary | **GREEN** | growth | healing · abundance · harmony | overgrowth · rot · smothering — **the Verdant Awakening and the Crepts are exactly this**: growth that did not know when to stop |
| secondary | **PURPLE** | spirit | transcendence · bond · nobility | domination · possession · *"mystery and magic"* turned to control · royalty as tyranny |
| achromatic | **WHITE** | reflection | revelation · purity · protection · giving everything back | **refusal** — a thing that reflects all keeps nothing and gives nothing *of its own*; perfect blankness, erasure, the answer that returns your question |
| achromatic | **BLACK** | absorption | depth · memory · gestation · potential · **the seed is kept in the dark** | consumption · oblivion · the hunger that never fills |

★ **Yellow is the proof this law is not something I imposed.** The source hands us honour *and* cowardice for the same colour, in consecutive sentences, without noticing the contradiction. It isn't a contradiction. It is one principle — responsiveness — read from two sides.

★★ **And white's shadow is the one worth writing carefully.** The instinct is to give white no dark face. But under the reflection ruling it has the cleanest one in the set: **a surface that returns everything absorbs nothing, learns nothing, and cannot be changed.** Perfect reflection is perfect refusal. That is far more useful to the Expanse than "white = good."

---

## 5 · ★★★ CORRUPTION IS NOT A COLOUR

> **Creator, same ruling:** *"corruption can takeover anything"*

Corruption is **not** black, not the shadow column above, and not a place on the wheel. It is an **overlay** — something that seizes a thing that was already something else. **And the game has been modelling it exactly that way for a long time without the colour language noticing.**

| the evidence, from the build | what it proves |
|---|---|
| `mori` — *"corrupted mortal · the Seers' commonest work"* | a Mori **was a person**. Corruption is applied, not innate. |
| `daemon` — *"twice a Mori's durability · a deeper corruption"* | corruption has **degrees**, so it is a quantity over a subject, not an identity |
| **Draghoul** `Crystal/Draconic/Corrupted` · **Omegoran** `Draconic/Nature/Corrupted` | Corrupted arrives as a **third type beside the originals**. It does not replace what a thing was — it is added on top of it. |
| `Sanctified Ray` · Divine · `effect: 'vs Corrupted'` | the counter to corruption already exists and it is **light against a state**, not one colour against another |

> **A corrupted RED is not black. It is a corrupted red.**
> Corruption keeps the colour and takes the wheel.

★★ **The consequence, and it is the useful one:** corruption is *more* disturbing on the bright colours, not less. A corrupted white — a thing that reflects everything and has been made to reflect a lie — should be the worst thing in the Expanse, and nothing in the cosmology currently forbids it. Same for a corrupted green, which is arguably the Verdant Awakening already.

This also cleans up a conflation the first draft of this document made: it put **black ≈ the Void ≈ the Corrupted type** in one box. Three different things. Black is **absorption**, a neutral principle. The Void Sea is a **place** that absorbs. Corrupted is a **state** that can take any colour, including white.

---

## 6 · IT ALSO MATCHES THE RELIC SYSTEM ALREADY WRITTEN

`PRISMSHARD_GEMSHARD_CANON.md` §16, unprompted:

> *"A Gemshard is an extreme expression of **one thing**. A Prismshard is the successful coexistence of **several**."*

That is **primary and secondary**, in the Creator's own words, about a different system. The gem colours and the relic classes are the same idea told twice — which is exactly what a colour *language* is supposed to be, and the reason [[aov-gem-canon]] says *"no player has to learn multiple metaphors."*

| relic class | colour class | shared principle |
|---|---|---|
| Astralite (one energy) | **primary** | irreducible · cannot be composed |
| Gemshard (one Astralite, concentrated) | **primary, intensified** | purity / specialisation |
| Prismshard (several in equilibrium) | **secondary** | *"balanced relationship between multiple"* — equal parts, as a secondary colour is |
| AETHRYX / the Key | **white** | not one of the set; the reason the set exists |
| the Void · the Empty Throne | **black** | the absence the set is arranged around |

---

## 7 · THE MEASUREMENTS

Claims about colour should be measured, not eyeballed. Both of these were.

### 7a · The gem art already agrees ✓

Body colour of each sprite (`assets/2D sprites/decor/gem-*.png`), sampled across the mid-luminance band so rim highlight and outline do not skew it:

| gem | body | hue | sat | lum | |
|---|---|---:|---:|---:|---|
| red | `#a62d13` | 10.7° | 0.79 | 0.36 | |
| orange | `#c06e0d` | 32.3° | 0.86 | 0.40 | |
| yellow | `#c19515` | 44.5° | 0.80 | 0.42 | |
| green | `#4d8445` | 112.2° | 0.31 | 0.40 | |
| blue | `#2e77ce` | 212.7° | 0.63 | 0.50 | |
| purple | `#7f3cb0` | 274.5° | 0.49 | 0.47 | |
| white | `#a6b8bc` | — | **0.14** | 0.70 | achromatic · light |
| black | `#34402f` | — | **0.15** | 0.22 | achromatic · dark |

The six chromatic gems walk the wheel in order, and the two achromatics are the only ones under 0.2 saturation — **the art already separates them into exactly the three orders**, without anyone having written this down. One small note: black's residual hue reads 102° (a faint green cast) at that saturation. Below the threshold where anyone would call it green; worth knowing if the sprite is ever regenerated.

### 7b · The nine Astralite family colours collide ✗ · ★★★ RESOLVED 2026-09-01

> **Creator: *"colour is orthogonal to family."*** (`PRISMSHARD_GEMSHARD_CANON.md`
> §0f.) ★★ **The measurement below stands; its status changes completely.** A
> family colour carries **no meaning** — family says what a thing is *made of*,
> colour says which way it *leans*, and neither derives from the other. So these
> nine hexes are a **UI palette**, not a claim. The collisions are still real and
> still worth fixing, but the fix is now a **legibility** problem with an obvious
> answer (**nine hues at 40°**) rather than a canon problem needing nine correct
> answers. See §9c.

Nine families need nine legible colours. Measured from `ASTRALITE_FAMILIES`:

| F | family | hex | hue |
|---|---|---|---:|
| 1 | CREATION | `#ffd66b` | 43.4° |
| 6 | PRESERVATION | `#ffc85c` | 39.8° |
| 2 | PAST | `#bc83ff` | 267.6° |
| 9 | SPIRIT | `#d796ff` | 277.1° |
| 4 | MIND | `#65e3ff` | 190.9° |
| 8 | FUTURE | `#72bfff` | 207.2° |
| 3 | DESTRUCTION | `#ff6848` | 10.5° |
| 7 | BODY | `#ff79ae` | 336.3° |
| 5 | PRESENT | `#68ef91` | 138.2° |

**Nine hues evenly spread would sit 40° apart. The actual gaps run from 3.6° to 94.8°.**

```
CREATION  ↔ PRESERVATION    3.6°   ← indistinguishable
PAST      ↔ SPIRIT          9.6°   ← indistinguishable
MIND      ↔ FUTURE         16.3°   ← close
```

And there is no second channel to fall back on: **saturation is 1.00 on eight of the nine**, and the luminance spread across all nine is 0.15. **Hue is the only separator, and a third of it is wasted on a 94.8° empty gap between DESTRUCTION and PRESENT.**

The psychology mostly holds up individually — DESTRUCTION red (*war, danger*), MIND cyan (*reflection, intellect*), PRESENT green (*harmony, the now*), SPIRIT violet (*transcendent*), CREATION gold (*the lightbulb, new initiatives*), PRESERVATION amber (*"dependability, reliability, resilience"* — the source's brown/amber register, exactly right) — but **two colours can each be individually correct and still be the wrong pair**, and that is what happened three times.

★ **BODY at 336.3° is a rose-red, not pink-as-a-separate-colour** — so it agrees with `RED = BODY` rather than contradicting it. I expected a conflict here and the measurement said there wasn't one.

---

## 7c · ★★★ THE SPECTRUM SPLITS 4/4 — Creator ruling, 2026-09-01

> *"the world gem can have red blue yellow and green and the space gem has white orange purple and black"*

**The two composite gems cut the eight along this document's own seams, not across them.**

| | red | yellow | blue | green | orange | purple | white | black |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| order | prim | prim | prim | sec | sec | sec | achro | achro |
| **WORLD** | ● | ● | ● | ● | | | | |
| **SPACE** | | | | | ● | ● | ● | ● |

> **WORLD = all three PRIMARIES + GREEN** — *body · adaptation · mind · growth.*
> **SPACE = the other two SECONDARIES + BOTH ACHROMATICS** — *evolution · spirit · reflects all · absorbs all.*
>
> **WORLD is what it is to be alive in a place. SPACE is what it is to transcend one.**

★★★ **Green versus orange is the load-bearing pair, and §3 already decided it.** Green is *change under **care*** — cultivation, the long game, the Sanctuary. Orange is *change under **pressure***, the cosmic verb. **Growth is terrestrial; evolution is not.** Green had to land on WORLD and orange on SPACE, and nothing was bent.

★★ **Structurally the same answer:** WORLD holds the **foundations** — the three colours nothing is mixed from, plus the one synthesis that stays alive. SPACE holds the **syntheses and the totals** — the two secondaries that leave the body behind, plus the two that are not places on the wheel at all.

★ `4 + 4 = 8`, none shared, none left out. And they are districts **9 and 10** — so the colour language is not just taught across the campaign, it is **completed** by finishing it. `PRISMSHARD_GEMSHARD_CANON.md` §0h.

---

## 8 · WHERE THE LANGUAGE ALREADY SHOWS UP

Not a plan — things already in the build that this document only names:

| already in the game | order | principle |
|---|---|---|
| ❤ HP · A1/A2 physical attacks · ATK | RED | body |
| ◆ Diamond meter fuelling A3/A4 · DEF/SP | BLUE | mind |
| ⚡ stamina, spent by sprint, restored by FAEDUST — the meter that **frays** | **YELLOW** | **adaptation** |
| evolution at level thresholds · Evolution Catalyst · Ultramax · Amplified Mode | **ORANGE** | **evolution** |
| Life Seeds · Mythic Elixir · Verdant type · farming · the Sanctuary · bond | GREEN | growth |
| Astralite bonds · Prisms · Bond Moves · Prismsynch | PURPLE | spirit |
| AETHRYX · the 180 scrolls' unanswerable subject · **Prismshard equilibrium** | WHITE | reflection · **balance · no leaning** |
| the Void Sea · `_voidSwallow` (enemies are **swallowed**, not deleted) · the Empty Throne | BLACK | absorption |

Eight rows. Six of them were built before this document existed.

★★ **The Corrupted type is deliberately NOT in this table.** It was in the first draft, filed under black. §5 is why: corruption is an overlay on any colour, so it has no row of its own — it is a column that could be drawn beside every row.

---

## 9 · WHAT A RULING WOULD CHANGE — and the price

### 9a · Free: the five undefined gems get meanings

No code, no economy, no art. Green/yellow/white/orange/black stop being prices and become words. Costs a dialogue pass and a codex entry.

### 9b · ★ Nearly free: re-order the value ladder to match the three orders

Current and proposed:

```
current   red 20 · blue 40 · green 60 · yellow 80 · white 100 · orange 120 · purple 140 · black 160
proposed  red 20 · blue 40 · yellow 60 · green 80 · orange 100 · purple 120 · white 140 · black 160
          └──── PRIMARY ────┘   └───── SECONDARY ─────┘   └─ ACHROMATIC ─┘
```

**The expected value of a weighted gem drop is 39.37 either way — identical.** It is a permutation of *labels* over a fixed set of numbers, so total gem income, Zurelea's 300, the 100-gem repairs and every Scrapjaw price are untouched.

★ **The one real cost:** a save in flight revalues. A player holding ten green gems sees them go 60 → 80 each; white goes 100 → 140. Three gems (red, blue, black) keep their exact value; five move. Cheap, but not zero — needs a migration decision, not just a constant edit.

### 9c · ~~Not free: the nine family colours~~ · ★★★ CHEAP NOW — 2026-09-01

Fixing 3.6° and 9.6° means re-picking hues and touching every surface that paints an Astralite. Worth doing, but it is an art pass with a real footprint, and ~~the choice of *which* nine hues is the Creator's~~.

> ★★★ **The expensive half was never the art — it was the CHOOSING**, because
> each of the nine had to be *right* for its family. **Creator, 2026-09-01:
> *"colour is orthogonal to family"*** removes that requirement outright. A family
> swatch means nothing, so the criterion is legibility alone: **nine hues at 40°
> spacing**, mechanically derivable, no ruling needed. The footprint is unchanged;
> the decision is gone. `PRISMSHARD_GEMSHARD_CANON.md` §0f§5.

---

## 10 · OPEN CALLS FOR THE CREATOR

**Closed by the 2026-09-01 rulings:** the third primary is ADAPTATION · orange is EVOLUTION · white REFLECTS and black ABSORBS · no colour is inherently good or bad · corruption is an overlay · **a white gem is a TRACE of Aethryx carrying BALANCE BETWEEN ASTRALITES, and achromacy means no leaning toward any one hue.** The document above is built on the answers.

**Still open:**

1. ~~**Does the white gem descend from a PRISMSHARD, or straight from AETHRYX?**~~
   **★★★ DISSOLVED 2026-09-01 — it was the wrong question.** The Creator ruled:
   *"it is called the aethryx expanse because aethryx (the prime energy source)
   makes up the entire world."* **Aethryx is the MATERIAL everything is made of**,
   so a white gem does not *descend* from anything — **it is a remnant of the
   SUBSTRATE**, caught before it leaned. Rule 13's descent is untouched because
   white was never in the descent. See `PRISMSHARD_GEMSHARD_CANON.md` §0b ★2.

   ★★ And it makes §3a literal rather than figurative: **Aethryx is the light,
   the 63 Astralites are what happens when it leans, and white is a trace of it
   that never did.** The scrolls' *"AETHRYX is not one of the sixty-three, it is
   the REASON there are sixty-three"* is now a statement about composition — the
   sixty-three are all made of it.

2. **★★ Does GEMSHARD = hue and PRISMSHARD = white follow?** *"A Gemshard specializes. A Prismshard harmonizes"* is **lean** and **balance** in the relic canon's own words, written before this ruling. If it holds, the 81 and the 16 inherit the colour language for free, the whiteness of a relic becomes a *measure* (how many Astralites it holds in balance), and **the Key of Anciuxor — nine families carried as trace echoes — is the whitest object below Aethryx.** Strongly suggested by two documents that were not written together; still yours to confirm.
3. **★ Does BLACK belong to the Void Sea, or to Oatheus?** Both are in canon and they are different stories — one is a place that absorbs, the other is a chair that took someone. Under the absorption ruling **they may be the same story**, which would be a large piece of lore falling into place. Not assumed.
4. **★★ Can corruption take WHITE?** §3a sharpens this: if white is *balance*, a corrupted white is **balance itself made to lean** — the state that has no preference, given one. §5 says nothing in the cosmology forbids it. That is either a major late-game reveal or a line you do not want crossed; either way it is yours, not mine.
5. **Where does the yin face live in the mechanics?** The law is written; the game currently expresses only the yang half of most colours. Do corrupted/shadow expressions become status effects, an alternate type set, a district condition — or purely a lore and dialogue register?
6. **Re-order the ladder (§9b)?** Free in economy, costs a save migration.
7. **Re-space the nine family colours (§9c)?** Three pairs are currently not tellable apart.

*(A previous item asking whether the language extends to the Gemshards has been folded into #2 — the balance ruling answers the weaker half of it, and what is left is exactly the lean/balance confirmation.)*

---

## 11 · WHAT THIS DOCUMENT DOES NOT DO

- Does not touch `GEM_VALUES`, `GEM_WEIGHTS`, `GEM_COLORS`, `ASTRALITE_FAMILIES` or any sprite. Nothing above is in the build.
- Does not redefine RED, BLUE or PURPLE. Those are locked at Codex v15.7 and this only supplies the reason they were right.
- Does not assign Gemshard or Prismshard colours. §10.2 is a question, not a ruling.
- Does not claim colour psychology is settled science. The source says so itself: *"since every human being has different emotions attached to different colors, the universal significance of colors may or may not work."* What makes it usable here is not that it is true of every person — it is that it is **shared enough to be read without a tutorial**, which is the whole job of a colour language in a game.

**Source:** [Color Psychology — Effects & Meaning](https://www.colorpsychology.org/) · [Primary, Secondary, and Tertiary Colors](https://www.colorpsychology.org/primary-secondary-tertiary-colors/)
**Related canon:** [[aov-gem-canon]] · [[aov-prismshards]] · [[aov-gemshards]] · [[aov-astralite-matrix]] · [[aov-rhud-meter-functions]] · `data/PRISMSHARD_GEMSHARD_CANON.md`
