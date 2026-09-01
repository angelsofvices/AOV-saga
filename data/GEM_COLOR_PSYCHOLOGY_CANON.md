# THE GEM COLOUR LANGUAGE — COLOUR THEORY & PSYCHOLOGY APPLIED
**Creator directive, 2026-09-01:** *"learn about color theory and apply the common psychology of colors to the principles of the gem and their colors in The Aethryx Expanse."*
**Source:** colorpsychology.org — the index page, and *What are Primary, Secondary, and Tertiary Colors?*

Proposal document. **Nothing here is written into code.** §7 lists what a ruling would change and what it would cost.

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
> **Black and white** — *"special colors that cannot be made through traditional means."* Black is the **absence** of light; white is **all** of it.

This is a hierarchy of *origin*, not of taste. It is also — and this is the point — **the same three-tier shape the Expanse already uses everywhere**: Astralite → Gemshard → Prismshard, singular → composite, one energy → several in equilibrium.

### 1b · Psychology — what each colour does to a person before they think about it

From the source, condensed to what a relic system can use:

| colour | the site's own words | the useful core |
|---|---|---|
| **Red** | *energy, war, danger, strength, power, determination, passion* · *"enhances human metabolism, increases respiration rate, and raises blood pressure"* · attracts attention more than any other colour | **the body, accelerated** |
| **Yellow** | *joy, happiness, intellect, energy* · *"stimulates mental activity and generates muscle energy"* · the brightest colour; the lightbulb; linked to left-brain rational thinking · *"indicates honor and loyalty"* · **when overused, disturbing** | **alertness and will — and it frays** |
| **Blue** | *"a calm serenity over intensity"* · inner reflection · *"lower heart rates and even slower metabolisms"* · idealistic, spiritual, sincere; seeks meaning | **the body, quieted — the mind at work** |
| **Green** | *nature, growth, harmony, freshness, fertility* · *"slows human metabolism and produces a calming effect"* · **connection** · return to primal roots | **restoration and growth** |
| **Orange** | red's energy + yellow's happiness · *rejuvenation, communication, positivism* · enhances extraversion, lets people drop inhibitions | **endurance — energy that lasts** |
| **Purple** | *"combines the stability of blue and the energy of red"* · royalty, nobility, power, luxury · wisdom, dignity, independence, **mystery and magic** | **synthesis — the third register** |
| **White** | light, goodness, purity, wholeness, *"the color of perfection"* · new beginnings · the blank canvas from which anything may start | **origin — the condition, not a thing** |
| **Black** | power, elegance, formality, **death, evil, mystery** · *"a mysterious color associated with fear and the unknown (black holes)"* · usually negative · authority · **grief** | **absence — and what fills it** |

★ Note the two colours that carry a **warning** in the source and nowhere in this game: yellow *disturbs* when overused, and black is *"usually negative."* Both are used below.

---

## 2 · THE CREATOR ALREADY BUILT THIS

The standing gem canon says:

> **PURPLE = SPIRIT.** *Red + Blue synthesized.* LATE-GAME reveal.

That is not a metaphor borrowed from colour theory. **It is the definition of a secondary colour, stated exactly.** Purple *is* red and blue in equal part, and the canon makes its meaning the equal-part synthesis of red's meaning and blue's meaning.

So the rule already exists and has already been applied once. It has simply never been run on the other two secondaries:

```
RED   + BLUE   = PURPLE     BODY + MIND = SPIRIT        ← already canon
RED   + YELLOW = ORANGE     BODY + ???  = ???           ← unwritten
YELLOW + BLUE  = GREEN      ???  + MIND = ???           ← unwritten
```

Filling those two blanks needs exactly one new decision: **what is the third primary?** Everything else is arithmetic.

---

## 3 · ★★★ THE THREE ORDERS

### The third primary: YELLOW = WILL

Red is the body. Blue is the mind. The psychology of yellow is *alertness, mental activity, muscle energy, honour and loyalty* — and, uniquely, **it frays when overused**. That is not a stat. That is **nerve**: the thing that spends, that you run out of, that makes a body and a mind actually *act*.

The game has been calling it something else for a year. ⚡ **stamina**, restored by FAEDUST ([[aov-rhud-meter-functions]]). Yellow already has a meter; it has never had a name.

> **RED = BODY · BLUE = MIND · YELLOW = WILL**
> Three primaries. Irreducible. What a living thing is made of.

### The secondaries follow with no further invention

| mix | = | principle | already in the game as |
|---|---|---|---|
| RED + YELLOW | **ORANGE** | **ENDURANCE** — body driven by will. Momentum, persistence, the second wind. *(source: "rejuvenation… positivism… letting go of inhibitions")* | sprint, the stamina economy, streak/combo persistence |
| YELLOW + BLUE | **GREEN** | **GROWTH** — will guided by mind. Restoration, healing, cultivation, the long game. *(source: "growth, harmony, fertility… slows metabolism… produces a calming effect")* | Life Seeds · Mythic Elixir · the Verdant type · farming · **the Sanctuary** |
| RED + BLUE | **PURPLE** | **SPIRIT** — body and mind reconciled. ***Existing canon, unchanged.*** | Astralite bonds · Prisms · Bond Moves |

Green as healing is not a choice made to fit; it is the single best-attested association in the whole of colour psychology, and the game has independently been using it that way in the Verdant type, the elixirs and the Spirit Tree since long before this document.

### And the two that cannot be mixed at all

These are the ones the theory marks as **special**, and the Expanse already has cosmology waiting for both.

| | | principle |
|---|---|---|
| **WHITE** | *all light at once* · purity, wholeness, perfection, the blank canvas, a successful beginning | **AETHRYX.** The Impossible Archive is already blunt about it: *"AETHRYX is not one of the sixty-three. It is the REASON there are sixty-three."* Vorashil says it better — *"not a being with a signature… the condition under which a signature is possible at all."* **That is white: not a colour among colours, but the presence of all of them, which is why you cannot mix it.** |
| **BLACK** | *the absence of light* · power, mystery, authority, the unknown, black holes, grief · *usually a negative connotation* | **THE VOID.** The Void Sea the whole world floats in. The Corrupted type. The Blackspiral. **The Empty Throne** — Oatheus is not a dark Gemlord, he is an *absent* one, and the tenth chair is black because there is nothing in it. |

> ★★ **This is why they are the rarest, and it is not a drop-rate decision.** Every other gem is something the Expanse *made*. White and black are the two conditions the Expanse was made **inside** — everything, and nothing. You do not find those often, because they are not products.

### The whole language on one page

```
                    ┌─ WHITE ─ everything at once ─ AETHRYX ─ the condition
   ACHROMATIC ──────┤
                    └─ BLACK ─ nothing at all ────── THE VOID ─ the absence
                                                            
   SECONDARY ── ORANGE ─ endurance ── GREEN ─ growth ── PURPLE ─ spirit
                   │                     │                  │
   PRIMARY ──── RED ─ body ───── YELLOW ─ will ───── BLUE ─ mind
```

Read it upward and it is the Expanse's own relic hierarchy: singular → composite → the two things that are neither.

---

## 4 · IT ALSO MATCHES THE RELIC SYSTEM ALREADY WRITTEN

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

## 5 · THE MEASUREMENTS

Claims about colour should be measured, not eyeballed. Both of these were.

### 5a · The gem art already agrees ✓

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

### 5b · The nine Astralite family colours collide ✗

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

## 6 · WHERE THE LANGUAGE ALREADY SHOWS UP

Not a plan — things already in the build that this document only names:

| already in the game | order | principle |
|---|---|---|
| ❤ HP · A1/A2 physical attacks · ATK | RED | body |
| ◆ Diamond meter fuelling A3/A4 · DEF/SP | BLUE | mind |
| ⚡ stamina, spent by sprint, restored by FAEDUST | **YELLOW** | **will** |
| sprint economy · combo/streak persistence | ORANGE | endurance |
| Life Seeds · Mythic Elixir · Verdant type · farming · the Sanctuary | GREEN | growth |
| Astralite bonds · Prisms · Bond Moves · Prismsynch | PURPLE | spirit |
| AETHRYX · the 180 scrolls' unanswerable subject | WHITE | the condition |
| Void Sea · Corrupted type · Blackspiral · the Empty Throne | BLACK | the absence |

Eight rows. Six of them were built before this document existed.

---

## 7 · WHAT A RULING WOULD CHANGE — and the price

### 7a · Free: the five undefined gems get meanings

No code, no economy, no art. Green/yellow/white/orange/black stop being prices and become words. Costs a dialogue pass and a codex entry.

### 7b · ★ Nearly free: re-order the value ladder to match the three orders

Current and proposed:

```
current   red 20 · blue 40 · green 60 · yellow 80 · white 100 · orange 120 · purple 140 · black 160
proposed  red 20 · blue 40 · yellow 60 · green 80 · orange 100 · purple 120 · white 140 · black 160
          └──── PRIMARY ────┘   └───── SECONDARY ─────┘   └─ ACHROMATIC ─┘
```

**The expected value of a weighted gem drop is 39.37 either way — identical.** It is a permutation of *labels* over a fixed set of numbers, so total gem income, Zurelea's 300, the 100-gem repairs and every Scrapjaw price are untouched.

★ **The one real cost:** a save in flight revalues. A player holding ten green gems sees them go 60 → 80 each; white goes 100 → 140. Three gems (red, blue, black) keep their exact value; five move. Cheap, but not zero — needs a migration decision, not just a constant edit.

### 7c · Not free: the nine family colours

Fixing 3.6° and 9.6° means re-picking hues and touching every surface that paints an Astralite. Worth doing, but it is an art pass with a real footprint, and the choice of *which* nine hues is the Creator's.

---

## 8 · OPEN CALLS FOR THE CREATOR

1. **★★ Is YELLOW = WILL?** Everything in §3 hangs off this one word. Red=body and blue=mind are locked; the third primary is the only genuinely new claim in this document. *(Alternatives that also fit the psychology: NERVE · VITALITY · FOCUS.)*
2. **★ Does WHITE = AETHRYX?** The fit is uncomfortably good — *"not one of the sixty-three, it is the REASON there are sixty-three"* is a description of white light. But AETHRYX is the largest thing in the cosmology and attaching it to a lootable gem may be exactly wrong. **A white gem may need to be understood as a trace of the condition, not the condition** — the same move the Mealux ruling already made for the Key.
3. **Does BLACK belong to the Void, or to Oatheus?** Both readings are in canon and they are not the same story. The Void is a place; the Empty Throne is an absence with a name.
4. **Re-order the ladder (§7b)?** Free in economy, costs a save migration.
5. **Re-space the nine family colours (§7c)?** Three pairs are currently not tellable apart.
6. **Does this language extend to the Gemshards?** §16 of the relic canon already reads as primary-vs-secondary in the Creator's own words. If Gemshard = primary and Prismshard = secondary, the 81 and the 16 inherit a colour language for free — and the **Key of Anciuxor lands on white** by the same logic that put AETHRYX there.

---

## 9 · WHAT THIS DOCUMENT DOES NOT DO

- Does not touch `GEM_VALUES`, `GEM_WEIGHTS`, `GEM_COLORS`, `ASTRALITE_FAMILIES` or any sprite. Nothing above is in the build.
- Does not redefine RED, BLUE or PURPLE. Those are locked at Codex v15.7 and this only supplies the reason they were right.
- Does not assign Gemshard or Prismshard colours. §8.6 is a question.
- Does not claim colour psychology is settled science. The source says so itself: *"since every human being has different emotions attached to different colors, the universal significance of colors may or may not work."* What makes it usable here is not that it is true of every person — it is that it is **shared enough to be read without a tutorial**, which is the whole job of a colour language in a game.

**Source:** [Color Psychology — Effects & Meaning](https://www.colorpsychology.org/) · [Primary, Secondary, and Tertiary Colors](https://www.colorpsychology.org/primary-secondary-tertiary-colors/)
**Related canon:** [[aov-gem-canon]] · [[aov-prismshards]] · [[aov-gemshards]] · [[aov-astralite-matrix]] · [[aov-rhud-meter-functions]] · `data/PRISMSHARD_GEMSHARD_CANON.md`
