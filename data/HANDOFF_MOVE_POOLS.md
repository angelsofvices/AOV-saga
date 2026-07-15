# HANDOFF · Move-Pool Content Mine from Codex v11.1

**Purpose of this doc:** a fresh Cowork session opens this file and picks up
the work of expanding `MOVE_POOL_BY_TYPE` + `BUFF_POOL` in `rizers.html` from
V2.28's minimum-viable seed pools into full canonical pools mined from the
527 codex entries.

## Context you need

- **Learn cadence + 4-slot architecture already exists** in `rizers.html`
  (search `V2.28`). Every Zyrex has 4 slots:
  1. Primary-type attack
  2. Secondary-type attack
  3. Buff / boost
  4. ★ Original (species-locked, per-instance random unlock level 20-80)
- **Learn moments:** every 3 levels up to Lv 50, every 5 levels 50→75,
  every 7 levels 75→100. Total 24 moments.
- **Auto-upgrade:** on each learn moment, `autoLearnMoves(r)` redraws all
  4 slots. Each slot picks the highest-power move now eligible for its
  type from `MOVE_POOL_BY_TYPE`. Slot 4 shows the species's `originalMove`
  once `r.lv >= r.originalMoveUnlockLv`.
- **Pool structure today (seed):** 5 attack moves per type × 10 types = 50
  attacks; 4 buffs total. Each move has `{ name, power, cost, minLv }`
  (attacks) or `{ name, effect, cost, minLv }` (buffs).

## Source data

- **File:** `data/aov_game_codex_v11.1.xlsx`, sheet `9 MASTER INDEX`.
- **Move columns per row** (post-V2.27 Type 3 insert):
  - Col O = A1 (Basic) — light attack
  - Col P = A1 Cast — light attack's element cast
  - Col Q = A2 (Signature) — medium attack, often status-inflicting
  - Col R = A2 Cast
  - Col S = A3 (Ultimate) — heavy attack, often status-inflicting
  - Col T = A3 Cast
  - Col U = R (Rizer Special) — signature buff or ultimate
  - Col V = R Cast
- **Types columns** (per row) — Col F Type 1, Col G Type 2, Col H Type 3.
- **Also useful:** `data/codex.json` — same data pre-parsed, easier to
  iterate. `entries[id].moves.{a1, a2, a3, r}` each have `{ name, raw }`.

## Deliverable

Replace the seed `MOVE_POOL_BY_TYPE` + `BUFF_POOL` blocks in
`rizers.html` (search comment `V2.28 — MOVE LEARNING CADENCE`) with
canon-mined pools. Keep the exact JavaScript structure — this is a
data replacement, not an API change.

Also: populate `SPECIES[<id>].originalMove` for every SPECIES entry
that doesn't have one yet (currently 18 of 19 do). If new SPECIES are
added later, ensure they get an original.

## Suggested working order

1. **Extract all A1/A2/A3/R names from codex.json** grouped by the
   entry's Type 1 (for A1/A3) and Type 2 (for A2). Buffs (R with
   effect-y names — "Roar", "Ward", "Focus", etc.) go into `BUFF_POOL`.
2. **De-duplicate** — many entries share generic move names. Keep the
   canonical unique names; discard duplicates.
3. **Assign minLv per move.** Rough rule of thumb: tier × 6 for A1,
   tier × 9 for A2, tier × 12 for A3. So a Tier V Apex's A3 has
   `minLv ≈ 60`. Clamp to [1, 90].
4. **Assign power per move.** A1 ≈ 30-40, A2 ≈ 55-70, A3 ≈ 80-110,
   R (as attack) ≈ 100-140. Scale up slightly for Tier VII+.
5. **originalMove per species:** use that species's canonical A3
   (Ultimate) as the slot-4 signature. Power around 95-135 based on
   tier. Type matches the primary attack type of the codex entry.
6. **Sort each type pool** by `power ASC` and set `minLv` monotonically
   so `bestFromPool` picks the right move at each learn moment.
7. **Ship pools as one commit** — call it `V2.29 — Move pool full
   canon mine from Codex v11.1`. Reference this handoff.

## Guardrails

- **Do NOT change `autoLearnMoves`, `shouldLearnMoveAt`, `bestFromPool`,
  or the 4-slot architecture.** Those are locked V2.28 mechanics; only
  the content data changes.
- **Preserve move-name flavor.** Codex canon > invented names. Only
  invent if a type has fewer than 4 moves after de-dup.
- **Keep `rakoron` and any other `movePolicy: 'canon'` species
  untouched** — their hand-crafted moves are boss content.
- **Don't touch `data/codex.json` directly** — it's regenerated from
  the xlsx via `python3 data/build_codex.py`.
- **Verify with `node --check` on the script block** before commit.

## Success criteria

- [ ] Each of the 10 types has at least 6 attack moves in
      `MOVE_POOL_BY_TYPE`, spread across the Lv 1 → Lv 90 range
- [ ] `BUFF_POOL` has at least 6 buffs
- [ ] Every SPECIES has an `originalMove` field
- [ ] Move-name flavor traces back to codex A1/A2/A3/R entries
- [ ] `node --check` passes
- [ ] Commit references `V2.28.HANDOFF` and `data/HANDOFF_MOVE_POOLS.md`

Once shipped, the game's move learning gets its full canonical
personality without further mechanic changes.
