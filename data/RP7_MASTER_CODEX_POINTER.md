# RP7 Master Codex · Pointer + Manifest (2026-07-30)

Single source of truth for the current RP7 roster.

## Files

| File | Role | Rows |
|------|------|------|
| **`data/rp7_roster_v7.json`** | Machine-readable master roster (all metadata) | 156 |
| **`data/rp7_roster_v7.md`**   | Human-readable master roster + chains + changelog | — |
| **`data/rp7_roster_v7.xlsx`** | Spreadsheet export (roster · tier_dist · line_dist sheets) | 156 |
| `data/rp7_roster_v1..v6.*`    | Historical intermediate drafts — reference only, do not edit | — |
| `data/aov_game_codex_v11.1.xlsx` | Legacy full codex from July · retained for the pre-roster canon (moves, stats, races, planets); use ONLY for fields the v7 roster doesn't carry | 523 |

## Snapshot

- **156 catchable Zyrex** (YES entries from `ROSTER DROP.pdf`, minus Emberskin Cobra, Solandra, and 5 non-catchable removals)
- **Tier distribution:** T1:21 · T2:37 · T3:46 · T4:10 · T5:18 · T6:8 · T7:5 · **T8:11** (pseudolinear · wide base · bottleneck at T8)
- **Evolution line distribution:** Alpha:83 · Beta:26 · Gamma:29 · Delta:6 · Epsilon:12 (per [[aov-evolution-ladders]] canon)
- **29 evolution chains formed** + 83 solo entries still needing family assignment
- **T8 cohort (11):** 10 Gemlords (Rakoron · Ivirium · Mutaryn · Emeralix · Eurakeon · Azurel · Obsidius · Ambrevon · Oathane · Oatheus) + **Omegoran** (Epsilon 4th-form Draevos easter-egg)

## Canon references

- **Zyraxian Power Theory** — 5 evolution lines (Alpha/Beta/Gamma/Delta/Epsilon), see [[aov-evolution-ladders]] memory.
- **T×333 stat pool** — every species base stat pool = tier × 333, see [[rizing-powers-t333-stat-pool]].
- **20-type chart** — see [[aov-20-type-system]] · types are locked, only species type assignments may change.
- **The 10 Gemlords** — Malezor→Korathen registry lives in `rp7.html` at `const GEMLORDS = [...]` (line ~2780).

## Diff-and-swap workflow (still pending user confirm)

1. Parse `data/rp7_roster_v7.json` and cross-check against current in-game `SPECIES` registry in `rp7.html`.
2. Emit a diff report: species missing / added / renamed / retype-swapped / tier-changed.
3. Wait for explicit sign-off on the diff.
4. Batch-replace `SPECIES` + wild pools + trainer chains atomically in one commit.

Not yet executed. See [[aov-zyrex-roster-swap-pending]] for the full protocol.

## Related memory

[[aov-evolution-ladders]] · [[aov-zyrex-roster-swap-pending]] · [[rizing-powers-t333-stat-pool]] · [[aov-20-type-system]] · [[aov-character-classes]] · [[game-codex-vs-master-codex]] · [[aov-terminology-locks]]
