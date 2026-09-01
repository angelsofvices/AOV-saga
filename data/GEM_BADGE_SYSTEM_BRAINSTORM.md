# RP7 GEM BADGE / PERK SYSTEM — DESIGN BRAINSTORM
**Creator directive, 2026-09-01:** *"lets brainstorm advanced gem utility crafting etc. I am thinking of using astralites to actually craft gems, and gems can be used to unlock perks/badges."* + the RP7 GEM BADGE / PERK SYSTEM handoff.

**Nothing here is implemented. No code, data, save, UI or art was touched.**

Labels used throughout:
**[BUILD]** exists in the shipping game · **[CANON]** locked · **[INFER]** my reading · **[NEW]** my proposal · **[ASK]** needs a Creator ruling

---

## 0 · THREE THINGS I MEASURED FIRST, AND THEY CHANGE THE PROPOSAL

### 0a · ★★★ Gem colour is already meaningless at the point of spending **[BUILD]**

```js
countGems()  → red 20 · blue 40 · green 60 · yellow 80 · white 100 · orange 120 · purple 140 · black 160
             → ONE weighted total
spendGems(n) → pays CHEAPEST FIRST until n is covered
```

Zurelea's Ruby Vial costs "300 gems" and a sword repair "100 gems" — meaning **300 and 100 points of an undifferentiated pool.** A gem's colour today is a **denomination, not an identity.**

> **This is the single largest obstacle in the handoff, and it is not mentioned in it.** The badge system's whole thesis is that colour means something. The moment badges spend colour-specific gems, `spendGems()` becomes a system that eats the material the badges need — a player who repairs a sword can silently lose the purple gem they were saving, because purple is worth 140 and the algorithm is looking for change.

Resolution is required before anything else. Options in §13.

### 0b · Astralites already buy permanent stats **[BUILD]**

`ASTRALITE_COMPOUND_EFFECTS` — five recipes, each granting **5–35 permanent attribute points** into the same five stats the AP pool uses:

| compound | families | grants |
|---|---|---|
| POTENTIAL | CREATION + PAST | SPECIAL |
| TRANSFORMATION | DESTRUCTION + PRESERVATION | ATK + DEF |
| WILL | MIND + BODY | ATK + SPECIAL |
| ASCENSION | PRESENT + SPIRIT | HP + SPECIAL |
| INNOVATION | PRESENT + FUTURE | SPEED + DEF |

**So "Astralite → permanent power" is a shipped, working loop.** Any badge that grants +X% to a stat is a fourth copy of a system the game already has three of (AP, compounds, gem-fuelled Scrapjaw upgrades).

> **[INFER] The badge system's only defensible territory is BEHAVIOUR.** Not "more damage" — *"damage now works differently."* The handoff says this in §8 ("changes behavior rather than merely increasing a percentage") and the build proves it is the only unoccupied ground.

### 0c · ★★ A mandatory Boundary slot is gated behind the two rarest drops **[BUILD]**

| gem | drop weight | chance | chests per gem |
|---|---:|---:|---:|
| red | 128/255 | 50.2% | 2.0 |
| blue | 64 | 25.1% | 4.0 |
| green | 32 | 12.6% | 8.0 |
| yellow | 16 | 6.3% | 15.9 |
| **white** | **8** | **3.1%** | **31.9** |
| orange | 4 | 1.6% | 63.8 |
| purple | 2 | 0.8% | 127.5 |
| **black** | **1** | **0.39%** | **255.0** |

The handoff's §7 makes **every** loadout require a White or Black badge. Black is a **1-in-255 chest drop.** A structure where the third slot is mandatory and its cheapest filler is the fifth-rarest item in the game will read as a wall, not a choice.

Note also the ladder is a *rarity* ladder that happens to run red→black, and the colour canon's own grouping (primary / secondary / achromatic) does **not** match that order. That mismatch is already flagged in `GEM_COLOR_PSYCHOLOGY_CANON.md` §9b as free to fix.

---

## 1 · MECHANICAL THESIS **[NEW]**

> **AP decides how much Rizer is. Badges decide what Rizer *does with a moment*.**

Three progression systems already answer "how strong":
- **AP** — 3330 points across HP/ATK/DEF/STAMINA/SPECIAL, no respec **[BUILD]**
- **Bond Ledger** — 3330 across 15 canon events, gates Zyrex tier **[BUILD]**
- **Compounds** — Astralites → permanent AP **[BUILD]**

A fourth "how strong" would be noise. So:

> **A badge never changes a number the player can see on a bar. It changes what an EVENT means.**
>
> Red does not add damage — it makes *varying* your attacks matter.
> Yellow does not add speed — it makes *the second time you see an attack* different from the first.
> Blue does not add SPECIAL — it makes *knowing something* a resource.

**Every badge is a rule about a moment that already happens in the build.** That is what keeps it out of the AP screen's territory, and it is also why it needs almost no new infrastructure (§9).

---

## 2 · RECOMMENDED LOADOUT STRUCTURE **[NEW]**

**Reject** the mandatory Foundation / Development / Boundary triad. **Recommend: three free slots with one constraint.**

```
  THREE SLOTS · any badge in any slot
  ★ ONE RULE: no two badges may share a primary component
```

Using the colour vectors that the canon already implies **[INFER]**:

| badge | R | Y | B |
|---|:-:|:-:|:-:|
| Red | 1 | 0 | 0 |
| Yellow | 0 | 1 | 0 |
| Blue | 0 | 0 | 1 |
| Orange | 1 | 1 | 0 |
| Green | 0 | 1 | 1 |
| Purple | 1 | 0 | 1 |
| **White** | 1 | 1 | 1 |
| **Black** | 0 | 0 | 0 |

"No two badges share a primary" means Red + Orange is **illegal** (both contain R), Red + Green is **legal** (R vs YB, disjoint). Legal triads are exactly the ways to cover R, Y and B without overlap.

### Why this is better than the handoff's version

| | handoff triad | vector rule |
|---|---|---|
| structure | forced one-per-family | emerges from the colour maths |
| White/Black | mandatory third slot | **optional, and special** |
| build count | 18 | 20+ (see below) and they *mean* something |
| teaches | a menu layout | **the colour language itself** |

★★ **And it gives White and Black their canon behaviour for free.**

- **WHITE is (1,1,1)** — it contains every primary, so under the rule it **cannot be equipped beside anything.** A White loadout is White *alone*. That is *"balance, no leaning"* expressed as a slot rule: the badge that refuses to lean also refuses to combine. Compensate by letting solo-White occupy all three slots' worth of power.
- **BLACK is (0,0,0)** — it contains no primary, so it **conflicts with nothing and stacks with everything.** That is *"absorption"*: it takes whatever is around it. Black is the universal third.

Neither needed a special case written. The rule produced them.

**[ASK]** Is solo-White acceptable as a build, or does it read as a punishment? Alternative: White counts as a wildcard that *suppresses* its partners' resonance rather than blocking them.

---

## 3 · UNLOCK AND UPGRADE PROGRESSION **[NEW]**

### Unlock: one badge per district, in the ladder's own order **[INFER]**

The drop weights already rank the colours by scarcity, and the ten districts already run a difficulty ladder (`TOWER_BY_DIST` bands, home prices 500→5000). Marry them:

| district | badge | why |
|---|---|---|
| Malezor | **Red** | Body. The tutorial district where every mechanic is earned from an NPC first **[CANON]** |
| Zarvane | **Yellow** | Adaptation — the desert, footprints, heat |
| Veridan | **Green** | Growth — the river, the Spirit Tree, the Verdant type |
| Andrannor | **Blue** | Mind |
| Netharion | **Purple** | Spirit — the Impossible Archive |
| Vorashil | **Orange** | Evolution — Unmouth Academy, Xenoxil's flesh-work |
| Xilnar / Baelgor / Thardin | *(deepening trials, no new badge)* | |
| Korathen | **White** | The Empty Throne district · the last lesson |
| — | **Black** | **not district-gated** — see below |

★ **Black should not be a reward for reaching a place.** Absorption is a thing that *happens to* you. **[NEW]** Propose: the Black badge is obtained by **losing something** — the first time Rizer is KO'd by a boss, or the first time a corrupted enemy takes something from him. It is the only badge you do not choose to receive, which is exactly its principle.

### Upgrade: three keys per stage, and gems are only one of them

Per the handoff §9, and it is right — but make the three keys **structurally different** so grinding one cannot substitute for the others:

```
GEMS          the material     · colour-matched, spent
MASTERY       the proof        · a counter that only that badge's own behaviour advances
RECOGNITION   the permission   · an NPC, trial or milestone
```

**★ The Mastery counter should BE the badge's live combat meter, totalled.** Red's Momentum is already the thing you build in a fight; lifetime Momentum earned *is* the mastery number. One number, two readings — no second progress bar to watch. This is the shipped Voltstorm pattern (`VOLTSTORM_KILL_COST = 20`, `voltstormCharge()`) which already proves the shape **[BUILD]**.

### Four stages is one too many **[NEW]**

The handoff proposes I Awakened / II Faceted / III Resonant / IV Exemplary. **Recommend three:**

| stage | grants |
|---|---|
| **I · Awakened** | the base behaviour |
| **II · Faceted** | choose one of two expressions |
| **III · Exemplary** | the capstone |

**Resonance should not be a stage.** Make it automatic whenever two equipped badges qualify (§6). A stage whose only content is "now your other badges work" is a stage that feels like nothing on the turn you buy it, and it triples the upgrade matrix (8 badges × 4 stages × 3 keys = 96 gates; at three stages, 72).

---

## 4 · BADGE BEHAVIOURS · all eight **[NEW]**

Each names the **existing** event it rides. Nothing below needs a new combat system.

| badge | hooks that already exist **[BUILD]** | base behaviour |
|---|---|---|
| **RED · Body** | `_hitStreak`, punch/kick combo step, block | **COMMITTED FORCE** — alternating A1/A2/weapon builds Momentum; repeating one decays it. Momentum is spent automatically by the Facet. |
| **YELLOW · Adaptation** | `dodgeUntil`, `_dodgeStreak`, `hurtPlayer(src)` | **REFLEX MEMORY** — surviving a *named* damage source (`hurtPlayer` already passes `srcName`) logs it. Second encounter with the same source is different. |
| **BLUE · Mind** | Diamond ◆, `spendStamina`, enemy `hpMax`/`tier` | **MEASURED RESPONSE** — landing A3/A4 or a weakness hit banks Clarity; Clarity is spent on information or economy. |
| **ORANGE · Evolution** | `_hurtSpriteUntil`, HP thresholds, `creditRizerKill` | **PRESSURE THRESHOLD** — damage *taken* fills Breakthrough. It only fills when you are losing. |
| **GREEN · Growth** | bond ledger events, Life Seeds, the Sanctuary | **CULTIVATED ADVANTAGE** — an uninterrupted sequence plants a seed that matures on a timer, not on a hit. |
| **PURPLE · Spirit** | summon formation, Zyrex follower, bond | **SHARED PULSE** — Rizer and the out Zyrex acting within a window of each other builds Sync. |
| **WHITE · Reflection** | ❤ / ⚡ / ◆ meters | **EQUILIBRIUM** — reads the *spread* between the three meters, not any one. Acts when they diverge. |
| **BLACK · Absorption** | `hurtPlayer`, status effects, the five statuses | **RESERVOIR** — a portion of what hits you is kept instead of lost. |

★★ **White is the only badge that reads a relationship rather than an event**, which is why it cannot be equipped alongside others under the §2 rule — it is already looking at everything.

★★ **Orange fills only when you are losing** — that is the sharpest expression of *"change that happens TO you"* versus Green's *"change you choose"*, and it makes the Orange/Green distinction a *play* difference rather than a flavour-text difference.

---

## 5 · FACETS AND CAPSTONES · a shape, not a list **[NEW]**

Every badge's two Facets should answer the same question: **spend the resource, or hold it?**

| badge | Facet A — SPEND | Facet B — HOLD |
|---|---|---|
| Red | **Force** · Momentum converts to impact as it is earned | **Form** · Momentum is retained as guard and poise |
| Yellow | **Agility** · adaptation cuts dodge/move cost now | **Resilience** · adaptation accumulates as damage reduction |
| Blue | **Analysis** · Clarity is spent to expose | **Control** · Clarity is retained as Diamond efficiency |
| Orange | **Mutation** · Breakthrough fires immediately, changing a move | **Ascension** · Breakthrough is banked toward a larger, stable change |
| Green | **Restoration** · seeds mature into recovery | **Cultivation** · seeds mature into Bond/Zyrex value |
| Purple | **Concord** · Sync shares what Rizer has | **Command** · Sync directs what the Zyrex does |
| White | **Return** · reflect the excess outward | **Balance** · redistribute the excess inward |
| Black | **Release** · discharge the reservoir | **Containment** · the reservoir becomes durability |

**One axis, eight applications.** A player who learns it once on Red reads all eight — which is the readability requirement in the handoff §1, satisfied structurally rather than by keeping the text short.

★ **On Purple's "Command":** the handoff flags the possession problem. Rename to **"Accord"** or **"Signal"** — Rizer *offers* an action, the Zyrex takes it. Domination is Purple's *harmful* face **[CANON]** and should be reserved for the corrupted variant, not shipped as a Facet name.

### Capstones change a rule, never a number

- **Red · Unbroken Advance** — a committed attack resists one interruption
- **Yellow · Never Twice** — the first repeat of an adapted attack is answered automatically
- **Blue · Complete Read** — a fully analysed enemy cannot conceal its next major action
- **Orange · Adaptive Arsenal** — the move that crossed the threshold stays evolved for the encounter
- **Green · Sanctuary Within** — a temporary Sanctuary field around Rizer and the out Zyrex
- **Purple · One Motion** — a correctly timed Rizer action calls the complementary Zyrex action
- **White · No Leaning** — reject one hostile effect outright, without absorbing it
- **Black · Event Horizon** — discharge the whole reservoir in one high-risk action

**Only one equipped badge may run its capstone** (handoff §12) — keep that. It is the decision that makes two Red players different.

---

## 6 · RESONANCE · one rule, not 28 perks **[NEW]**

The handoff asks (Q12) whether resonance can be systemic. **Yes — and the colour vectors already do it.**

> **Two equipped badges resonate on each PRIMARY that one CONTAINS and the other IS.**

Since §2 forbids sharing a primary, resonance can only run primary ↔ secondary:

| pair | shared | resonance |
|---|---|---|
| Red + Green | — | *(none — disjoint, and that is fine)* |
| Yellow + Purple | — | *(none)* |
| Blue + Orange | — | *(none)* |

★ **Which means the §2 rule and resonance are in tension, and that tension is the design.** A loadout either **covers** the primaries (disjoint, no resonance, maximum breadth) or you relax the rule to allow overlap and *gain* resonance at the cost of a narrower build.

**[NEW] Recommended resolution — make the rule a trade, not a ban:**

```
DISJOINT loadout   (R,Y,B each covered once)  →  no resonance · all three capstones eligible
OVERLAPPING        (a shared primary)         →  resonance fires · only ONE capstone eligible
```

Now the player chooses **breadth or depth**, and both are legal. Red + Orange (shared R) resonates — physical Momentum accelerates Breakthrough — and pays for it by narrowing.

**Black (0,0,0) never shares and never resonates.** It is always legal, always breadth. **[INFER]** That is absorption: it does not combine, it *keeps*. Black is the badge for players who want the third slot to just be reliable.

**White (1,1,1) shares with everything**, so any White pairing is maximum-overlap: full resonance, one capstone, narrowest build. Solo-White is the opposite extreme. **White is the only badge that can be played at either pole**, which is a good expression of *"reflects all."*

**Total authored content: one rule and six primary↔secondary resonance lines.** Not 28.

---

## 7 · OVEREXPRESSION · the same meter, past full **[NEW]**

The handoff worries (Q7) this becomes a second corruption system. It will, if it gets its own bar.

> **Overexpression is not a second meter. It is the badge's own meter above 100%.**

```
0 ─────────── 100% ─────────── 150%
   the badge working    the badge's harmful face
```

- Red past full: Momentum keeps building but starts **costing HP** — *rage, burnout* **[CANON]**
- Yellow past full: adaptations start **overwriting each other** — *fraying*
- Blue past full: Clarity **locks onto one target** and everything else is obscured — *fixation*
- Green past full: recovery **spreads to enemies too** — *overgrowth*
- Black past full: the reservoir **absorbs without consent** — *hunger*

★ **The player chooses to go there.** Overexpression should be reachable only by *not spending* — holding a full meter deliberately. That makes it a risk the player takes, not a punishment the game applies, and it means the harmful face is discovered through play rather than through a tutorial. **This is the Law of Two Faces as a control, not as lore text.**

★★ **And it is the honest reason to have a HUD element at all**: the badge pip needs to show "full" distinctly from "past full", because that is the only moment the player must *decide*. Anything else can stay in the menu.

---

## 8 · CORRUPTION · an overlay, and it must be losable **[NEW]**

**[CANON]** Corruption is orthogonal to colour; a corrupted Red is a corrupted red, not black. The build already models it this way — Draghoul is `Crystal/Draconic/Corrupted`, corruption arrives as a *third type beside* the originals.

**[NEW] Applied to badges:**

```
BADGE      = which principle
FACET      = which expression
CORRUPTION = an overlay that seizes the expression
```

Three properties I would insist on:

1. **The colour stays.** A corrupted Green badge is still green, still grows things. It grows them *for something else.*
2. **It is not a stronger perk with a drawback.** It should take the *player's control* of the behaviour, not their stats. Corrupted Black absorbs **when it wants to**, not when you hold the button. That is scarier and cheaper than a damage penalty.
3. **★ It must be removable, and removing it should cost the thing it took.** Purification via a White gem (balance restored) is the obvious fit and gives white gems a second, non-combat purpose.

**[ASK]** Should a player ever be able to *choose* corruption for power? The handoff §14 implies yes. If so it needs a hard rule about what it can never do — I would propose: **corruption can never touch the capstone**, so the build-defining choice always remains the player's.

---

## 9 · COMBAT AND EXPLORATION APPLICATION **[NEW]**

### Combat hooks that already exist — no new infrastructure

| badge | rides |
|---|---|
| Red | `_hitStreak` (+ the punch/kick combo step, already tracked) |
| Yellow | `hurtPlayer(amt, srcName)` — **already passes the source name** |
| Blue | Diamond spend, enemy tier/hpMax |
| Orange | HP loss, `_hurtSpriteUntil` |
| Green | uninterrupted-sequence timer, bond ledger |
| Purple | out-Zyrex actions, summon formation |
| White | the three meters |
| Black | `hurtPlayer`, the five statuses |

`hurtPlayer` already carrying `srcName` is what makes Yellow cheap — the game **already knows what hit you**, it just throws the name away after the toast.

### Exploration — one badge each, or the system is combat-only **[NEW]**

The handoff asks (Q15). This is where badges can justify being *equipped* outside a fight:

| badge | out of combat |
|---|---|
| Red | force open what is stuck — barricades, jammed doors |
| Yellow | terrain that punishes a second mistake stops punishing |
| Blue | the minimap marks *why* something is interesting, not just that it is |
| Orange | reach a place by being changed — a traversal state, not a key |
| Green | planted things mature while you are elsewhere |
| Purple | the out Zyrex can act on the world (fetch, reach, sense) |
| White | detect imbalance — corrupted tiles, tampered objects |
| Black | carry more of something, or keep one spoiling item stable (**Life Seed spoilage** already exists **[BUILD]**) |

★ Black stabilising a Life Seed is my favourite of these — it uses a mechanic already shipping, needs no art, and *is* absorption.

---

## 10 · RELATIONSHIP TO GEMS, GEMSHARDS, PRISMSHARDS **[CANON] + [NEW]**

> **Gems bias. Gemshards specialize. Prismshards harmonize. Aethryx does not lean.**

| tier | may do | must never do |
|---|---|---|
| **ordinary gem** | tilt existing energy · fuel a badge | grant a move · grant a type |
| **Gemshard** | grant Ultramax type + move **[CANON]** | be craftable |
| **Prismshard** | equilibrium phenomena, A5 **[CANON]** | be reachable by badge progression |

**The badge system's ceiling: a badge may change how an existing action behaves. It may never add an action.** New moves are Gemshard territory (Rule 11), and that line is what keeps the 81 meaningful.

### ★★★ Astralites → gems · the Creator's new idea

**[CANON]** already supports it: *"Astralite Gem — concentrated crystalline manifestation of Astralite energy."* Gems **are** crystallised Astralite. Crafting one is not a new class of object.

**[NEW] And the colour-theory canon says exactly how it should work:**

> *"To have a colour is to have a leaning."* — `GEM_COLOR_PSYCHOLOGY_CANON.md` §3a

So: **the gem takes the colour of whatever the input leans toward.**

```
feed Astralites into the Experiment Table
  → the mix LEANS toward one principle   → that coloured gem
  → the mix is BALANCED                  → a WHITE gem
```

★★ **This gives white gems a crafting identity that is their lore, exactly.** You do not make a white gem by finding white things; you make one by putting in a balance so even that nothing dominates. It is the hardest recipe *and* the most thematically correct, and it solves the 3.1% drop-rate problem for the White badge without touching drop weights.

★ **Black should probably NOT be craftable.** Absorption is not something you assemble. **[ASK]** — options: (a) black gems only ever drop/are taken, (b) black is what you get when a craft **fails**, which is absorption's whole character: the attempt is kept, not returned.

**[ASK]** Which Astralite families lean to which colour? The nine families already carry hues, but three pairs are within 17° of each other (`GEM_COLOR_PSYCHOLOGY_CANON.md` §7b) — CREATION/PRESERVATION 3.6° apart. **A crafting recipe that reads family colour would inherit that collision.** Either re-space the family hues first, or map by family *meaning* rather than by hue.

---

## 11 · UI / UX **[NEW]**

### In the world — three pips, and they must earn their pixels

The HUD is already nine registered overlays and full **[BUILD]**. So:

- **Three small badge pips**, registered in `HUD_MOVABLE` so F9 drag-and-remember covers them for free.
- **A pip shows only two states worth interrupting for: FULL, and PAST FULL.** Filling is ambient and belongs in the menu. This follows the rule the punch-combo overlay was removed for at v0.95.926 — *show what the player must decide.*
- Resonance draws a line between two pips **only while it is firing**.

### In the menu — the Attunement Wheel

The handoff's §15 wheel is good and should live as a **ZyPhone panel** (the DOM surface, where the ZyCube and RIZER panels already are), not a new canvas overlay. It gets category navigation, controller enrolment and mouse support for free from the work at v0.95.936.

Eight positions around an unfilled centre; equipped badges lit; resonance as lines; mastery as facets in the art rather than a rank number.

★ **The centre must stay empty.** It is Aethryx, and Aethryx does not lean. An empty centre that never fills is a better statement than any reward that could go there.

---

## 12 · ACCESSIBILITY **[NEW]**

The handoff asks that mastery not depend on frame-perfect execution. The Facet axis (§5) delivers this **structurally**:

> **Every SPEND facet is execution-timed. Every HOLD facet is not.**

- Yellow **Agility** wants good dodges; Yellow **Resilience** wants only survival.
- Red **Force** wants combo variety in the moment; Red **Form** rewards blocking.
- Black **Release** wants timing; Black **Containment** is passive durability.

A player who cannot hit tight windows takes the HOLD side of every badge and gets a complete, viable, slower build. **That is one design decision covering the whole accessibility requirement**, rather than eight separate assist options.

---

## 13 · ECONOMY **[BUILD] + [ASK]**

No rebalancing proposed. But §0a must be resolved first:

**[ASK] Three ways out, in my order of preference:**

1. **★ Split the pool.** `countGems()`/`spendGems()` keep serving *shops* (they are a wallet). Badges spend from a **separate, colour-explicit path** that never routes through `spendGems`. Cheapest, no economy change, and it makes "gems are money" and "gems are material" two honest states of the same object.
2. **Reserve.** A gem marked as badge material is excluded from `spendGems`. More UI, more player bookkeeping.
3. **Re-price by colour meaning** rather than rarity (`GEM_COLOR_PSYCHOLOGY_CANON.md` §9b showed a re-order is *free* — expected drop value stays 39.37 either way). Cleanest long-term, needs a save migration.

★ **Crafting (§10) changes the arithmetic anyway.** Once Astralites can become gems, the drop weights stop being the only supply and white/purple/black stop being lottery items. **Any costing done before the crafting ruling would be costing the wrong economy.**

---

## 14 · MINIMUM VIABLE VERSION **[NEW]**

> **One badge. One meter. One decision. Zero new art.**

**RED, Stage I + II only.**

- Rides `_hitStreak`, which already exists and already has a HUD element
- Momentum = alternating attack types (the punch/kick combo step is already tracked)
- Two Facets: Force / Form
- Overexpression at 100%+: Momentum costs HP
- Unlock: one Malezor NPC, per the Malezor foundation rule **[CANON]**
- UI: **reuse the combo counter element** — it is already positioned, already registered movable

**What it proves:** that a behaviour-only perk is felt in play, that the spend/hold axis reads, and that overexpression is a choice players make. If Red does not change how a fight feels, the other seven will not either — and that is worth learning for the cost of one badge rather than eight.

**Do not build:** the wheel, resonance, corruption, crafting, or badges 2–8 until Red has been played.

---

## 15 · RISKS, REDUNDANCIES, CANON CONFLICTS

| # | risk | severity |
|---|---|---|
| 1 | **`spendGems` eats badge material** (§0a) | ★★★ blocking |
| 2 | **Badges duplicating AP/compounds** if any grants a stat | ★★★ fatal to the thesis |
| 3 | Mandatory Boundary slot gated behind a 0.39% drop (§0c) | ★★ |
| 4 | A fourth progress bar the player must watch | ★★ — mitigated by §3 (mastery = the combat meter) |
| 5 | Overexpression becoming a second corruption system | ★★ — mitigated by §7 (same meter, past full) |
| 6 | 28 authored resonances | ★★ — mitigated by §6 (one rule, six lines) |
| 7 | Badges granting moves → collides with Gemshard Rule 11 **[CANON]** | ★★★ hard line |
| 8 | Purple "Command" reading as possession **[CANON]** | ★ — rename |
| 9 | Family-hue collisions inherited by crafting recipes | ★★ |
| 10 | Save size / migration — eight badges × stage × facet × mastery counters | ★ — small, but `TRANSIENT_PLAYER_KEYS` must be reviewed; the save system is **opt-out**, so anything not listed persists **[BUILD]** |

**Explicitly reject:**
- Badges that grant new moves *(Gemshard territory)*
- Badges that grant flat stats *(AP/compound territory)*
- A badge XP bar separate from its combat meter
- Black as "dark damage" or an evil alignment **[CANON]**
- White as a healing/holy badge **[CANON]**
- Red+Blue gems crafting a Purple gem **[CANON]** — the colour equation explains the principle, it is not a recipe

---

## 16 · OPEN QUESTIONS FOR THE CREATOR

1. **★★★ How do badges spend gems without `spendGems()` eating them?** (§13) — blocking, and nothing should be costed before it is answered.
2. **★★★ Is the badge ceiling "changes an action, never adds one"?** This is the line that protects the 81 Gemshards.
3. **★★ Does the vector rule (§2) replace the Foundation/Development/Boundary triad?** And is solo-White acceptable, or should White be a wildcard instead?
4. **★★ Is Black un-craftable?** And is it obtained by *losing* something rather than reaching somewhere (§3)?
5. **★★ Which Astralite families lean to which gem colour** — and does the family-hue collision get fixed first, or does the recipe map by meaning instead?
6. **★ Three stages or four?** I recommend three, with resonance automatic rather than purchased.
7. **★ Can corruption be chosen for power** — and is "corruption can never touch the capstone" the right hard limit?
8. Does badge mastery feed the **Bond Ledger**, or stay separate? It has 15 canon events already and a 3330 cap.
9. Should Amplified Mode / Ultramax / Prismsynch **read** the equipped badges, or ignore them? (Orange's *Ultramax Conduit* capstone in the handoff would cross into Gemshard territory as written.)
10. Do badges belong to **Rizer only**, or can a Zyrex carry one? Purple implies shared; the roster does not.

---

**Sources:** `rp7b.html` (measured this pass) · `data/GEM_COLOR_PSYCHOLOGY_CANON.md` · `data/PRISMSHARD_GEMSHARD_CANON.md` · the GEM BADGE / PERK handoff.
**Related:** [[aov-gem-canon]] · [[aov-gem-colour-theory]] · [[aov-rizer-attribute-system]] · [[aov-bond-ledger]] · [[aov-rhud-meter-functions]] · [[aov-gemshards]] · [[aov-prismshards]]
