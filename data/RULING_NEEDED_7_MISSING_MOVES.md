# RULING NEEDED · 7 named moves have no MOVE_DEX row

**Found:** v0.96.55 sweep, by `tools/verify_speciesrules.js` — which was right.
**Status:** NOT fixed. The numbers are balance canon and yours to set.

Two species declare moves that do not exist in `MOVE_DEX` (367 entries).
They are the only two of ~210 species with this problem.

| species | tier | types | move | in MOVE_DEX |
|---|---|---|---|---|
| **smogrin** | 3 | Aura / Spirit | Aura Jab | ❌ |
| | | | Spirit Lash | ❌ |
| | | | Hex Pulse | ❌ |
| | | | Nether Wail | ❌ |
| **mealux** | 8 | Spirit / Divine / Elemental | Astral Pulse | ❌ |
| | | | Warding Light | ❌ |
| | | | Soulfract | ❌ |
| | | | Nova Collapse | ✅ (A4, Elemental, pw 150, acc 85, Recoil ¼) |

**Smogrin has no resolvable move at all.** Mealux has one, its A4.

## What it actually costs (measured, not assumed)

It degrades rather than crashes — there is a fallback — but it is not free:

1. **Damage falls back to `STRIKE_BASE_PW` (40).** `zyrexDefaultMovePower()`
   returns 40 when the move is null, so both fight at generic-jab power
   regardless of what their own moves are supposed to hit for.
2. **No type comes through.** `moveData()` returns null, so the move carries no
   type into the effectiveness chart — a Spirit/Aura attacker lands as untyped.
3. **★ The move list is PRUNED ON LOAD.** `rp7b.html:45673` runs
   `z.moves = z.moves.filter(m => m && moveData(m.name))`, so a saved Smogrin
   comes back with **zero** moves; `refreshZyrexMoves()` then re-adds them from
   the species list, and the next load prunes them again. They appear and
   disappear across saves.

## ★ The strongest clue

**`Max Nether Wail` exists in MOVE_DEX. `Nether Wail` does not.**

The Ultramax variant of one of these outlived its base move, which suggests
these seven were authored and lost rather than never written. If you have the
originals, they are what should go back in — nothing below.

## Nearest existing entries, if you want to repoint instead of author

Repointing changes which moves a species knows, which is a canon change, so I
have not done it.

| missing | closest existing, same type family |
|---|---|
| Aura Jab | Field Jab (Aura), Aura Pulse, Ectoplasm Jab (Spirit) |
| Spirit Lash | Aura Lash, Verdant Lash, Soul Rend (Spirit) |
| Hex Pulse | Aura Pulse, Withering Pulse |
| Nether Wail | Nether Judgment (Spirit) · and `Max Nether Wail` already exists |
| Astral Pulse | Aura Pulse, Astral Bloom |
| Warding Light | Pillar of Light, Lightlance |
| Soulfract | Soul Rend, Souldrift Reaping (nothing shares a word) |

## What I need from you

Either **(a)** the seven statlines — slot A1–A4, type, power, accuracy, effect —
or **(b)** a repoint to existing moves, or **(c)** the original entries if they
exist elsewhere in canon.

Slot/power conventions already in the file, for reference:
A1 ≈ pw 40 · A2 ≈ 60–80 · A3 ≈ 90–120 · A4 ≈ 150+ (recoil/drawback common).

`verify_speciesrules` stays **red** until this is ruled. It is reporting the
truth and should not be silenced.
