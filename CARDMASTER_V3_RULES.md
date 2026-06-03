# Rizing Powers of Zyrex — Official Rules v6.7

**The AOV™ Saga · Angels of Vices™ LLC · architected by Carly Hendrix / Mctherockstar**

This is the locked source-of-truth ruleset for the v3 Cardmaster engine (`cardmaster.html`). Card base stats reference the **RPZ Master Codex v6.7**. Card values are immutable from the codex; engine logic lives here.

> Origin note: the original rules-update document was filed as **v5.7**, but the codex it references is **v6.7**. This file uses v6.7 throughout to match the codex.

---

## 0. Key Change Summary (vs prior v2)

- New linear **DEF curve** (DEF ÷ 10)
- New **SPC boost** rule (SPC ÷ 10 flat, one-time, permanent)
- New **BACKFIRE** system (control-theory instability for low-SPC cards)
- **5 ASTRALITE STATUS** effects finalized (Overcook, Undershock, Brainlock, Gridfreeze, Souldrift)
- New **FIELD FORMAT**: 3v3 active, 6 in deck
- New **TURN STRUCTURE**: possession by highest-SPD card (once per round), every active card moves
- New **SHIFT** mechanic: cards may shift in/out using a turn — stacked gems travel with the card
- New **GEM GAMBLE**: per-card stacked gems; A1 free; STACK is a turn action; A2=2, A3=3, REVIVE=4 from the card's own stack; fallen cards forfeit their gems to the enemy's SPOILS pool (see §12)

---

## 1. Field Format & Team Structure

Each player has a **9-card faction**: **3 ACTIVE** on the field + **6 in the DECK** (reserves).

- Standard battle = 3v3 on the field at all times (while cards remain).
- 6 cards held in deck as reserves, shifted in as needed.
- **Win condition:** eliminate all 9 of the opponent's cards (all FALLEN), or opponent surrenders.

---

## 2. Turn Structure — Possession System

This is the core new mechanic. Turn order is decided by **POSSESSION.**

### 2.1 Possession

At the start of each round, compare the **HIGHEST-SPD active card** on each team. The team whose highest card has greater SPD **wins possession** and acts first.

> The highest-SPD card "takes possession for the entire team" — it determines WHEN the team acts.

### 2.2 Every Card Moves

During a team's possession, **each** of their active cards takes its own individual move (A1, A2, A3, SPC, or Shift). With a full field, that is up to 3 individual moves during one possession.

Once the possessing team's cards have all acted, possession passes to the opposing team.

### 2.3 Turn Phases

| # | Phase | Description |
|---|---|---|
| 1 | **Possession Check** | Compare highest-SPD active card per team. Higher wins possession. |
| 2 | **Card Moves** | Each active card on the possessing team takes one move. |
| 3 | **Resolve** | Apply damage, status procs, backfires, and any KO/shift results. |
| 4 | **Pass Possession** | Opposing team takes possession and repeats. |

---

## 3. Shift Mechanic

Cards may voluntarily **SHIFT** in and out of the field, not only on KO.

- A card may use its move for the turn to shift OUT (return to deck) and bring a reserve card IN.
- Shifting consumes that card's move for the turn — the shifted-in card does **NOT** attack the same turn it enters.
- On KO, a reserve also shifts in to maintain the field (does not attack on entry).
- Shifting is strategic: rotate a damaged card out, bring in a type-advantaged or fresh card.

---

## 4. Card Stats

Five stats. Stats map to the cosmology Tier-Color progression.

| Stat | Tier-Color | Function |
|---|---|---|
| **SPD** | Yellow (I) | Speed. Highest active SPD wins team possession (turn order). |
| **HP** | Green (II) | Health. Card is FALLEN at 0 HP. |
| **DEF** | Blue (III) | Defense. Reduces incoming damage by DEF ÷ 10 percent. |
| **ATK** | Red (IV) | Attack. Drives all damage (A1/A2/A3 multipliers). |
| **SPC** | Purple (VII) | Special. Powers the one-time stat boost, status proc strength, and backfire stability. |

---

## 5. Move System

| Move | Gems | Damage | Notes |
|---|---|---|---|
| **A1** | **FREE** | ATK × 0.33 | Uses Type 1 only. No status, no backfire. The safe strike. Always available — A1 is the baseline gem every card carries. |
| **A2** | 2 | ATK × 0.66 | Uses Type 2 only. Can INFLICT a status (proc roll). Can backfire. |
| **A3** | 3 | ATK × 0.99 | Uses BOTH types (best multiplier). Continues/applies status at higher proc. Can backfire. Damage always lands. |
| **STACK** | — | — | Free turn action: bank +1 gem onto **this card's** stack. The only way to fund A2 / A3 / Revive. |
| **SPC** | FREE | — | One-time permanent stat boost. See §7. |
| **REVIVE** | 4 | — | The casting card spends 4 of its stacked gems to revive any fallen ally to reserve at 50% HP with the Risen mark. |

*All damage rounds **UP**. Minimum damage is always 1. See §12 for the full Gem Gamble.*

---

## 6. Defense — Linear Curve

**Damage Reduction % = DEF ÷ 10**

Drop the last digit of DEF to read the reduction %.

| DEF | Reduction | Damage Taken |
|---|---|---|
| 100 | 10% | 90% |
| 300 | 30% | 70% |
| 500 | 50% | 50% |
| 700 | 70% | 30% |
| 900 | 90% | 10% |
| 999 | 99.9% | **0.1% (God card)** |

*No cap. The Highest One (DEF 999) takes only 0.1% of any hit — intentionally near-immortal as the apex God card.*

---

## 7. Special (SPC) — One-Time Boost

**SPC Boost = SPC ÷ 10**, added as **FLAT** points to any one stat (HP / ATK / DEF / SPD).

- One-time use per match. Permanent for the rest of the match. Cannot be undone or reused.
- Free (no gem cost).
- The choice of WHICH stat and WHEN is the key strategic decision.

| Card | SPC | Flat Boost | Example use |
|---|---|---|---|
| Cerebrion | 399 | +40 | ATK 120→160 |
| Omniris | 339 | +34 | HP boost |
| Phrenetic | 400 | +40 | DEF +4% reduction |
| Grimhog | 45 | +4 | minor bump |
| Eurakeon | 460 | +46 | big spike |

---

## 8. Astralite Status Effects

A2 can INFLICT a status; A3 applies/continues at higher proc. Status strength scales by Tier.

### 8.1 The Five Status Effects

| Status | Severity | Effect | Duration |
|---|---|---|---|
| **Overcook** | Critical | Foe loses [Status %] of HP at the start of each of their turns (damage over time). | DoT / ongoing |
| **Undershock** | Moderate | Debuffs ONE chosen foe stat by [Status %]. | Until cured |
| **Brainlock** | Severe | Foe can use A1 ONLY (A2 & A3 locked out) for 2 turns. Fixed effect. | 2 turns |
| **Gridfreeze** | Severe | Foe skips their next turn entirely. Fixed effect. | 1 turn |
| **Souldrift** | Lethal | Foe's stats fade by [Status %] each turn. When depleted, the card is removed. | Until cured/removal |

### 8.2 Status Strength — Astralite Multiplier

**Status % = Tier × 11 ÷ 2** (i.e. Tier × 5.5)

| Tier | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Status % | 5.5 | 11 | 16.5 | 22 | 27.5 | 33 | 38.5 | 44 | 49.5 | 55 |

### 8.3 Status Proc Chance

Damage always lands. The STATUS is gated by a proc roll:

- **A2 proc % = Tier × 5.5**
- **A3 proc % = Tier × 11** (capped at 100%)

| Tier | 1 | 3 | 5 | 7 | 9 | 10 |
|---|---|---|---|---|---|---|
| A2 | 5.5% | 16.5% | 27.5% | 38.5% | 49.5% | 55% |
| A3 | 11% | 33% | 55% | 77% | 99% | 100% |

---

## 9. Backfire — Control Theory

A card with **LOW SPC relative to its Tier** is unstable — it can lose control of its own power.

**Backfire % = (Tier × 10) − (SPC ÷ 10)**, minimum **1%**.

- The "stability ceiling" for a card is SPC = 100 × Tier. Below it, backfire risk rises the further below you are.
- At or above the ceiling, backfire is floored at 1% — nothing is ever perfectly safe.
- On a backfire, the **STATUS** that would have hit the foe instead hits the **attacker**.
- The attack **DAMAGE** still lands normally on the target (damage = ATK; status = SPC — two separate systems).
- A1 carries no status, so A1 can **NEVER** backfire — the safe option for unstable cards.

### 9.1 Real Examples

| Card | Tier | SPC | Backfire % | Read |
|---|---|---|---|---|
| Grimhog | II | 45 | 15.5% | Brute, no control |
| Skybeam | III | 100 | 20% | Glass cannon |
| Drakaryze | IV | 195 | 20.5% | Evolved but volatile |
| Sharkfin | III | 200 | 10% | Balanced |
| Cerebrion | III | 399 | 1% (floor) | Master of effects |
| Phrenetic | IV | 400 | 1% (floor) | Pure control |
| Eurakeon | V | 460 | 1% (floor) | Stable apex |

*Tier dependency: higher tiers are held to a higher control standard. A Tier IV needs SPC 400 to be stable; a Tier II needs only SPC 200.*

---

## 10. Type Effectiveness

10 types in a cyclic chart. Each type is strong vs 2 and weak vs 2.

A1 uses Type 1. A2 uses Type 2. A3 uses both (apply the better multiplier).

| Type | Strong vs | Weak vs |
|---|---|---|
| **Aura** | Spirit, Unknown-Void | Creature, Extraterrestrial |
| **Beast** | Creature, Spirit | Humanoid-Noid, Ultramax |
| **Creature** | Nature, Aura | Beast, Unknown-Void |
| **Extraterrestrial** | Aura, Nature | Tech, Ultramax |
| **Humanoid-Noid** | Beast, Ultramax | Tech, Spirit |
| **Nature** | Tech, Unknown-Void | Creature, Extraterrestrial |
| **Tech** | Humanoid-Noid, Extraterrestrial | Nature, Spirit |
| **Spirit** | Humanoid-Noid, Tech | Beast, Aura |
| **Ultramax** | Extraterrestrial, Beast | Humanoid-Noid, Unknown-Void |
| **Unknown-Void** | Ultramax, Creature | Nature, Aura |

**Multipliers:** Both vulnerable = 4× · Vulnerable+neutral = 2× · Both neutral = 1× · Resistant+neutral = 0.5× · Both resistant = 0.25×

*Cancellation: one strong + one resistant cancels to 1× neutral. Pure same-type cards cannot cancel and take full 4× from doubly-effective attacks.*

---

## 11. Full Damage Resolution Sequence

Apply in this exact order each time a card attacks:

1. Choose move (A1/A2/A3) and spend gems.
2. Base damage = ATK × (0.33 / 0.66 / 0.99), round UP.
3. Apply TYPE multiplier (A1 Type1, A2 Type2, A3 best-of-both).
4. Apply DEF reduction: damage × (1 − DEF÷10%).
5. Final damage applied (minimum 1). Damage ALWAYS lands.
6. Backfire check (A2/A3 only): if triggered, status hits attacker; otherwise proc status check on target.

---

## 12. Gem Gamble — Per-card Stacks, Spoils on Fall

The gem economy is **per-card**, not team-wide. Every active card carries an implicit **baseline gem** — that's why **A1 is free**. Beyond A1, the card must spend turns banking gems onto itself.

### 12.1 The mechanic
- Each card has a personal **stacked-gem counter** (starts at 0).
- **STACK** is a turn action: card spends its move to add +1 gem to its own stack.
- **A2** costs 2 gems from the card's stack. **A3** costs 3. **REVIVE** costs 4.
- **Stack overflow → Spoils:** when a card on your team falls, all of its stacked gems are seized by the **opposing team's SPOILS pool**. Any of their active cards may spend from spoils as if they were personal gems.
- **Shifting preserves gems** — a card that shifts out keeps its stacked gems for when it shifts back in.

### 12.2 The gamble
A card stacking toward A3 (3 gems) or Revive (4 gems) becomes a juicy target: kill it before it fires and you not only stop the threat, you absorb its gems. The choice every turn is **stack now (build toward your payoff)** vs. **swing now (chip the enemy and protect your investment)**.

### 12.3 Quick reference

| Action | Gem cost | Source |
|---|---|---|
| A1 | FREE | (baseline gem) |
| Stack | — | spends turn, +1 to card |
| A2 | 2 | card's stack → team spoils |
| A3 | 3 | card's stack → team spoils |
| SPC boost | FREE | one-time, permanent |
| Revive | 4 | casting card's stack |
| Shift | FREE | preserves card's gems |

---

## 13. Locked Rules — Quick Reference

1. Field: 3v3 active + 6 deck (9 total).
2. Possession: highest-SPD active card wins team turn order.
3. Every active card takes its own move during possession.
4. Shift: a card may use its move to swap in/out; shifted-in cards don't attack that turn.
5. Damage: A1=33%, A2=66%, A3=99% of ATK. Round up. Min 1.
6. Defense: reduction % = DEF ÷ 10. No cap (999 = 99.9%).
7. Special: SPC ÷ 10 flat to one stat. One-time, permanent, free.
8. Status: 5 Astralite effects. Strength = Tier × 5.5%.
9. Status proc: A2 = Tier × 5.5%, A3 = Tier × 11%.
10. Backfire: (Tier × 10) − (SPC ÷ 10), min 1%. Status hits attacker; damage still lands.
11. A1 never backfires and carries no status.
12. Types: 10-type cyclic chart. A1=Type1, A2=Type2, A3=both.
13. Last Breath: **SKIPPED**. 0 HP = instant FALLEN.
14. Revive: 4 gems from the casting card's stack, returns target at 50% HP.
15. Gem Gamble: per-card stacks; A1 free; STACK to bank; falling forfeits stack to enemy SPOILS.
16. Card base stats are **PERMANENT & IMMUTABLE** — v6.7 codex is source of truth.
17. Match MVP = 3 cards from the WINNING team, ranked 1st/2nd/3rd.

---

*Rizing Powers of Zyrex · Rules Update v6.7 · Angels of Vices™ LLC*
*All mechanics locked in design session. Supersedes prior rule versions.*
