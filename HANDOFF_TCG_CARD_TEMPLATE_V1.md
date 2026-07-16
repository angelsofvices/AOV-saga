# RIZING POWERS OF ZYRAXIS — TCG CARD TEMPLATE HANDOFF v1

**Purpose.** Design a physical trading-card template + companion mobile "Battle Calculator" app that mirrors the Rizing Powers RPG combat system 1:1, so that IRL card matches play with the exact same math, stat curves, type chart, status mechanics, and inflict formulas as the digital game.

**Version anchor.** All mechanics below are current as of rizers.html **V3.17.40** (2026-07-16). If any digital patch bumps a value, this doc is the source of truth for the TCG until re-versioned.

---

## PART 1 — WHAT EVERY CARD REPRESENTS

**One card = one Zyrex at its MAX level for that Tier.**

Because every Zyrex's stat pool follows the T×333 rule (base stat pool = Tier × 333), a card printed at, say, Tier V represents that Zyrex at Level 50 with its full T5 stat block. A Tier VII card = Level 70 stats. No sub-level variants — one card per (species, tier) intersection.

Evolution chains produce multiple cards per species — one card per form, one form per tier the species reaches on its ladder.

### The 5 evolution ladders

Every Zyrex belongs to exactly one ladder, determined by rarity:

| Ladder | Form 1 | Form 2 | Form 3 | Form 4 | Rarity |
|--------|--------|--------|--------|--------|--------|
| Alpha   | T1 | T2 | T3 | — | Common |
| Beta    | T1 | T3 | T5 | — | Uncommon |
| Gamma   | T1 | T4 | T6 | — | Rare |
| Delta   | T1 | T5 | T7 | — | Very Rare |
| Epsilon | T1 | T5 | T7 | **T8** | Legendary — ONLY ladder that reaches T8 |

A T1 base always starts the chain. Cards in a chain reference the previous and next form for collectors.

### Tier ceilings above the ladder

- **T8 Ultramax** — reserved for the 10 born-at-T8 Gemlords (never evolved into). Ultramax types get combat overrides (see Type Chart section).
- **T9 Demigod** — reserved for cosmic-tier entities (Ultharis, Khronicore lore-locked).
- **T10 God** — reserved for Anciuxor. Divine Hit combat canon applies (see below).

---

## PART 2 — CARD FACE LAYOUT (required data)

Every printed card must display:

### Header
- **Species name** (large, centered)
- **Tier** in Roman numeral (I–X)
- **Ladder** icon (Alpha / Beta / Gamma / Delta / Epsilon)
- **Form position** in chain (1/3, 2/3, 3/3, 4/4 for Epsilon)
- **Level anchor** = Tier × 10 (small tag: "Lv 50" for a T5 card)

### Type badges (1–3)
- Every Zyrex has a primary type; some have a secondary; Tier VI+ can have a tertiary.
- Print type icons in order: primary → secondary → tertiary.
- Full type roster (20 total): Aura, Beast, Creature, Extraterrestrial, Humanoid-Noid, Nature, Tech, Spirit, Ultramax, Unknown-Void, Draconic, Crystal, Radiant, Divine, Corrupted, Verdant, Aquatic, Chrono, Astral, Elemental.

### The 5 stats (numeric block)
Print all 5 base stats as flat integers matching the card's tier:

| Stat | Symbol | Purpose |
|------|--------|---------|
| HP   | ❤ | Life pool — lethal at 0 |
| ATK  | ⚔ | Attack — drives damage output |
| DEF  | 🛡 | Defense — reduces incoming damage |
| SPD  | ⚡ | Speed — determines turn order |
| SPC  | ✦ | Special — drives status inflict chance + resistance |

**Constraint:** The sum of the 5 stats **MUST equal Tier × 333**.
- T1 = 333 · T2 = 666 · T3 = 999 · T4 = 1332 · T5 = 1665
- T6 = 1998 · T7 = 2331 · T8 = 2664 · T9 = 2997 · T10 = 3330

Distribution is at the designer's discretion but the pool total is a hard lock.

### The 4 move slots (fixed roles)
Every card lists exactly 4 moves in this fixed order:

| Slot | Role | Type | Power | Cost | Status? |
|------|------|------|-------|------|---------|
| 0 | **PRIMARY** — cheap reliable damage | Matches type1 | ~30 | 1 gem | No |
| 1 | **SECONDARY** — mid-tier coverage | Matches type2 (type1 if single-typed) | ~55 | 2 gems | No |
| 2 | **TERTIARY** — status inflict, flavored on primary type | Any of user's types | 0 (pure status) OR ~30–45 (light + status) | 2 gems | **Yes** |
| 3 | **ULTIMATE** — heavy signature damage + status | Signature / blended type | ~110+ | 3 gems | **Yes** |

**Power scales with tier.** The numbers above are Tier I anchors. Multiply move power by roughly `tier × 1.0` to keep damage vs. HP curves consistent across tiers. (A T5 card's Primary is ~150 power, not ~30.)

**Status field** for Tertiary and Ultimate: name one of the 5 canonical statuses (see Section 4).

**Base status chance** for Tertiary: default 30% (or the specific value chosen by the designer). Modified at battle time by the SPC ratio + tier boost formula (see Section 4).

### Reference footer (small print)
- **Region** — which of the 10 districts this Zyrex is native to
- **Class + Archetype** — flavor tags from the master codex (e.g., "Warrior / CHIMERIC")
- **Codex #** — dex slot (001–180)
- **Rarity** — Common / Uncommon / Rare / Very Rare / Legendary

---

## PART 3 — COMBAT FORMULA (must match RPG exactly)

### Damage math

```
base   = ((user.ATK / target.DEF) × move.power × (userLv / (userLv + targetLv))) / 2
damage = max(1, floor(base × typeMult × stab × crit × variance))
```

Where:
- **typeMult** — from the 20-type chart. Stacks multiplicatively across target's types (up to 2 for T1–T5, up to 3 for T6+).
- **stab** = 1.5 if the move's type matches ANY of the user's types (primary, secondary, or tertiary); else 1.0.
- **crit** = 1.5 on a 6.25% chance roll; else 1.0.
- **variance** = uniform random in [0.85, 1.15].

**Because cards are anchored at Lv = Tier × 10, the (userLv / (userLv + targetLv)) term reduces to a clean ratio** — a T5 attacker (Lv 50) hitting a T3 defender (Lv 30) gets multiplier `50 / (50 + 30) = 0.625`.

### Type chart (20-type, symmetric 3/3)

Every type has exactly 3 strong-against and 3 weak-against relationships. The multiplier on a single-hit type matchup is one of:

| Multiplier | Meaning |
|------------|---------|
| **4.0×** | Both target types are weak to move type (Tier VI+ tri-type: up to 8×) |
| **2.0×** | One target type is weak to move type |
| **1.0×** | Neutral |
| **0.5×** | One target type resists |
| **0.25×** | Both target types resist (Tier VI+ tri-type: down to 0.125×) |

The full 3/3 chart lives in the master codex. Card designers do not need to memorize it — the Battle Calculator app resolves it.

### Speed order + turn structure

- Each round both sides declare one move; higher SPD acts first; ties go to the player (or "first to declare" IRL).
- One move per Zyrex per turn — no double-tap.
- After both moves resolve, **status ticks fire for both sides** (see Section 4), then the round ends.

### Special combat rules

- **STAB** (Same-Type Attack Bonus): 1.5× damage when move type matches any of user's types.
- **Divine Hit** (Anciuxor only): user always deals 3× damage regardless of matchup; defender caps incoming multiplier at 1.0× (no super-effective against Anciuxor).
- **Ultramax type** (Gemlord signature): follows normal chart but has priority in tri-type stacks. Cannot receive Ultramax-type damage from an evolved T8 (only from born-T8 species).

---

## PART 4 — THE 5 STATUSES

One per opponent stat. Uniform mechanic: **percentage decay of that stat every turn**. No turn-skips, no lockouts.

| Status | Stat | Tick |
|--------|------|------|
| **Overcook** | ATK | −25% each turn |
| **Psychache** | DEF | −20% each turn |
| **Undershock** | SPD | −25% each turn |
| **Gridfreeze** | SPC | −25% each turn (cascades — see below) |
| **Souldrift** | HP | −20% each turn — the ONLY lethal debuff |

Each status inflicts a fixed number of turns (see Duration below), then clears.

### Status inflict chance formula

When a move with a `status` field lands, roll for inflict:

```
finalChance = clamp( base × spcRatio × tierBoost, [5%, 95%] )
  base       = move.baseStatusChance (default 30%)
  spcRatio   = clamp( user.SPC / target.SPC, [0.5, 2.0] )
  tierBoost  = 1 + 0.05 × (userTier − 1)
```

Meaning:
- A high-SPC Zyrex against a low-SPC target lands statuses up to 2× more reliably.
- Every user tier above I adds a flat +5% inflict multiplier.
- Even the best matchup is capped at 95% — nothing is ever guaranteed.

### Status duration formula

```
turns = (3 + rand(0..2)) + floor( (userTier − 1) / 2 )
```

That is: 3–5 base turns, +1 turn per 2 user tiers above I.

| Attacker Tier | Duration |
|---|---|
| I–II | 3–5 turns |
| III–IV | 4–6 turns |
| V–VI | 5–7 turns |
| VII–VIII | 6–8 turns |
| IX–X | 7–9 turns |

### The Gridfreeze cascade (design note)

Because inflict chance uses `user.SPC / target.SPC`, and Gridfreeze reduces target SPC by 25% each turn, **landing Gridfreeze first opens the door to compounding future statuses**. Turn 2 target has 75% SPC → next status attempt lands ~33% more reliably. Turn 3 target has 56% SPC → even more. This makes Gridfreeze the "gateway status" and gives high-SPC / Chrono / Astral / Void Zyrex a distinct win condition.

---

## PART 5 — GEM ECONOMY (move costs)

Every Zyrex has **1 baseline gem** always free per turn. Moves cost 1, 2, or 3 gems:
- **Cost 1** (Primary + occasional Tertiary): free from baseline
- **Cost 2** (Secondary, most Tertiary): requires 1 extra gem from your pool
- **Cost 3** (Ultimate): requires 2 extra gems

IRL implementation: each player starts a match with a small pool of physical gem tokens (suggestion: 5–8 gems per side). Gems refresh at the rate of +1 per round. Ultimates require banking.

Alternative: skip the gem economy IRL and let players use any move each turn — but that erases a strategic layer.

---

## PART 6 — REVIVE + HEAL ITEMS (optional TCG expansion)

If the TCG supports item cards, mirror the RPG hierarchy:

| Item | Effect | Can revive KO? |
|------|--------|----------------|
| Potion | +40 flat HP | ❌ |
| Grand Potion | +100 flat HP | ❌ |
| Master Potion | +50% max HP + clears status | ❌ |
| **Revival Stem** | **Full HP + clears status** | ✅ (the ONLY item that revives KO) |

**KO'd Zyrex cannot be healed by any potion.** Only Revival Stem revives (in the RPG, sleep in a bed also revives — no card equivalent needed).

---

## PART 7 — MOBILE COMPANION APP SPEC ("Battle Calculator")

### One-line pitch
A mobile app that runs the exact RPG battle math for two physical cards so IRL matches feel identical to the digital game — no napkin math, no argument.

### Required inputs (each round)
1. **Card A (attacker)** — selected via QR code on card / manual dex lookup / photo scan
2. **Card B (defender)** — same
3. **Current HP** of each fighter (persist across rounds; reset button per fight)
4. **Active status** on each fighter, if any (dropdown: none / Overcook / Psychache / Undershock / Gridfreeze / Souldrift + remaining turns)
5. **Chosen move** for each fighter (dropdown of the 4 slots on that card)

### Required outputs (each round)
Displayed as a stack of card-styled result panels:

**Speed banner** — who goes first ("Skorrax +58 SPD → moves first")

For each move resolution, in order:
- **Damage panel**
  - Base damage before modifiers
  - Type multiplier (with label: SUPER EFFECTIVE / neutral / not very effective)
  - STAB indicator
  - Crit roll (yes/no)
  - Variance roll (0.85–1.15)
  - Final damage
  - Target HP after hit
- **Status inflict panel** (if move has a status)
  - Base chance
  - SPC ratio modifier
  - Tier boost modifier
  - Final chance %
  - Roll result: LANDED / RESISTED
  - Duration if landed
- **Status tick panel** (end of round)
  - Each active status ticks its stat by the canonical %
  - Turn counter decrement
  - Status clear notification when it expires
- **Round-end banner** — either fighter KO? Battle over? Winner + XP breakdown.

### Persistence
- Track HP + status across rounds within a single fight
- "Fight log" scroll shows every roll for post-match dispute resolution
- Optional match history for tournament use

### Optional advanced features
- **Deck manager** — build and save decks of cards you own
- **Draft mode** — random card selection for casual play
- **Tournament mode** — bracket tracking + timer
- **Achievements** — parallel Rizer's Log tracking (dex completion, matches won, etc.)

### Technical anchors (must match RPG exactly)
- **Damage formula** — verbatim from Section 3
- **Type chart** — 20-type 3/3 symmetric matrix, tri-type stacking rules
- **Status chance formula** — verbatim from Section 4
- **Status duration formula** — verbatim from Section 4
- **STAB / crit / variance rolls** — same constants (1.5× / 6.25% / 0.85–1.15)
- **Ultramax + Divine Hit overrides** — verbatim canon
- **Special rounding** — always `floor()` for damage, `Math.max(1, ...)` clamp so minimum damage is 1

The app's combat engine should be portable JS/TS ported straight from rizers.html's `performMove()`, `computeStatusChance()`, `inflictStatus()`, and `tickStatuses()` functions. A card database + UI wraps the engine. No new mechanics — the app is a display layer over the RPG's math.

---

## PART 8 — REVISION PROMPTS FOR MASTER CODEX

When this handoff lands in the master codex, the following slots need designer/developer decisions:

1. **Card back art** — one universal back or district-varied?
2. **Foil / holographic treatment** — reserved for Legendary + Ultramax cards, or spread across rarities?
3. **Set naming** — first print run = "Malezor Awakening"? "The Gemlord Cycle"?
4. **Print run per rarity** — Common / Uncommon / Rare / Very Rare / Legendary ratios per booster pack
5. **Gem token design** — physical crystal counters vs. dice vs. cardboard chips
6. **HP tracking** — dice / dial / paper vs. mandatory app usage
7. **Errata policy** — if a card's math becomes broken vs. digital canon, do we reprint or issue an erratum?

---

## APPENDIX — SOURCE CANON REFERENCE

Every rule above is locked in these master-codex memory files (all in the Drive canon):
- `aov-20-type-system.md` — 20-type chart + Ultramax rules
- `aov-move-unlock-schedule.md` — 4 move slots + unlock ladder + tier scaling
- `aov-five-statuses.md` — the 5 statuses + inflict formula + duration formula
- `aov-evolution-ladders.md` — 5 ladders (Alpha–Epsilon) + T8 rules
- `rizing-powers-t333-stat-pool.md` — T×333 stat pool lock
- `rizing-powers-stat-math.md` — damage formula anchor
- `aov-zyraxis-ten-districts.md` — 10 districts + Gemlord roster
- `aov-astralite-matrix.md` — cosmology hooks for future TCG expansion sets

---

## END OF HANDOFF v1

Once the master-codex holder confirms this doc, use it as the spec for:
- The TCG art director (card face layout + all 5 stats + move slots)
- The physical print run (rarity distribution + gem token design)
- The mobile app engineering team (Battle Calculator port from rizers.html)
- The competitive rulebook (turn structure + status ticks + edge cases)

Next revisions (V2, V3...) should be dated and diffed against this document. When a digital patch bumps a value, this handoff becomes the delta target.
