# ROSTER V2 · DELTAS AGAINST THE LOCKED V1

`data/staple_roster_v1.json` is **LOCKED**. Per canon, *all* changes are v2 — so
nothing is edited in place there. Every divergence the game carries lives here,
with the source that outranks v1 and the reason.

★ This file is the answer to "why does the game disagree with the locked
roster?" Without it, the next person to diff them finds a contradiction and no
record of whether it was a decision or a mistake.

---

## Vengrizz · T2 → **T4** · 2026-09-07 · game v0.96.33

**Creator:** *"make vengrizz tier 4 level 40 at base"*

### The sources disagreed, and the higher one says four

| source | tier | kind |
|---|---|---|
| `CODEX_TRIAGE_ZYREX_VS_HUMANOID.md` | **IV** | story / codex |
| `STAPLE_ROSTER_BY_TIER_v3.md` | T2 — *explicitly noted `⬇ T4→T2`* | roster tier pass |
| `staple_roster_v1.json` (LOCKED) | 2 | roster |
| `rp7b.html` before this change | 2 | game |

Vengrizz was **IV in the codex** and a later tier pass pulled him to 2. Canon
precedence is **STORY > CARDS > GAME** ([[aov-canon-precedence]]), so the codex
value has the claim. **This is a restoration, not a promotion.**

### What moved

- `SPECIES.vengrizz.tier` · 2 → **4**
- base stat pool · 666 → **1332** (tier × 333, [[rizing-powers-t333-stat-pool]])
  - ★ **every stat exactly doubled, not redistributed.** The spread *is* the
    character — a spirit bear on ATK and SPD with soft defences. Re-authoring
    it while "fixing" the total would make him a different animal with the same
    name.
  - `240 / 300 / 190 / 280 / 172 / 150` (HP/ATK/DEF/SPD/SATK/SDEF)
- `ATHRENOLOGY_INDEX` entry · `t:2` → `t:4`
- quest grant level · 20 → **40**

### Level 40 is the file's own law, not a chosen number

Two existing rules land on the same value and neither was written for this:

- the wild level law is **tier × 10** (stated in the SIGILMORE note: *"the wild
  level law is tier x 10, so T4 spawns at Lv40"*)
- a card is a **MAX Zyrex at Lv tier × 10** ([[rizing-powers-stat-math]])

### Knock-ons, checked

- **Bond gate** — 10% per tier means T4 now needs 40% bond
  ([[aov-bond-tier-gate]]). The quest grant passes `bypassBondGate: true`, so
  the Lost Boy reward still lands. *A T4 gift that the gate then refused would
  have been a silent quest break.*
- **XP curve** is tier-derived ([[aov-zyrex-growth-curves]]) — follows
  automatically, nothing to change.
- **Wild pools** — unaffected. He is quest-only and in no pool
  ([[aov-catching-philosophy]]).

### Still to reconcile

`staple_roster_v1.json`, `codex_triage.json` and the `staple_roster_by_tier_v*`
files still read 2. They are **deliberately untouched** — v1 is locked. Fold
this delta in when v2 is cut.
