# ★★★★ RETRACTED: "four districts had zero overworld enemies" was FALSE

**Claimed:** 2026-09-14, v0.97.1.
**Retracted:** same day, v0.97.2, after booting the real game.

> ### THE CORRECTION
> I reported that Xilnar, Baelgor, Thardin and Korathen had **zero** overworld
> enemies and that 169 of 177 bodies stood in the first three districts.
>
> **The real world, booted:**
>
> ```
> overworld enemies = 1,990
> malezor 190 · zarvane 200 · andrannor 200 · veridan 200 · netharion 200
> vorashil 200 · xilnar 200 · baelgor 200 · thardin 200 · korathen 200
> ```
>
> **It was already even, at exactly the 200/district you set in v0.95.979.**

## ★★★ HOW I GOT IT WRONG

My harness evaluated the **`NPCS` array literal** out of the source. The world's
roaming enemies are not in the literal — `scatterDistrictEnemies()` pushes them
at boot (called from line 16187, inside a `setTimeout(…, 0)` block). So I
measured 177 hand-written entries, found four districts unrepresented among
them, and reported that as the state of the world.

> ### ★★★★ I MEASURED THE SOURCE AND CALLED IT THE WORLD.
> The number was real. The thing it was a number *of* was not what I said.

★★ **And the right technique was already in the repo.** `tools/build_wild_placement.mjs`
shims enough DOM to run the build's own boot path in node and then reads the
live globals. I did not look for it before writing my own, so I reinvented a
worse version of a tool that was sitting two directories away — and the worse
version is the one that couldn't see 1,813 enemies.

★ The specific blind spot is worth naming: that generator stubs `setTimeout` to
`() => 0`, which is fine for its purposes but means the boot tasks never fire.
`tools/lib/boot_game.mjs` now **collects** the deferred callbacks and runs them,
so the world is populated before anything is counted.

## WHAT WAS ACTUALLY TRUE IN THE CLAIM

Two things survive, and only two:

1. **The new-enemy layer is sited well** — 64 bodies, walkable, in-district, out
   of town, spaced ≥9, biased to coasts and chests. That was tested by driving
   the siter, and those tests still pass.
2. **The species mix was keyed to district id, not terrain** — which is the real
   substance of what you asked for next, and it was never about emptiness.

## WHAT WAS ALREADY BUILT AND I SAID WAS MISSING

| I said | Truth |
|---|---|
| "four districts have no enemies" | all ten hold 200 |
| "there is no town concept in the build" | `_townAnchors()` exists — hub + civic + every home — and `scatterDistrictEnemies` already keeps roamers `ROAM_MIN_FROM_TOWN = 26` tiles clear of it |
| "no density gradient" | `level: T.moriLv` (5 → 80) and `hpMax × (1 + moriLv/40)` already scale per district |

★ My inverted-settlement-law town test is not *wrong*, but it was a **second**
town rule where one existed — the exact drift I claimed inverting would prevent.
v0.97.2 folds it onto `_townAnchors`.

## THE WORK THAT IS GENUINELY NEW

From your 2026-09-14 direction, four of five asks stand:

1. **Habitat keying** — species tie to terrain, not district id. Borrowed from
   the 8 habitats in `tools/build_wild_placement.mjs`: `hub_fringe`, `meadow`,
   `forest`, `waterside`, `highland`, `cave_mouth`, `wild_fringe`, `landmark`.
2. **A weighted long tail** — "almost all enemies in any district, weighted to
   the district scale 1-10." The shipped `DISTRICT_ENEMY_MIX` has hard zeros:
   no Vilerok can appear in Malezor at all. Weights replace zeros.
3. **Harder, not more** — count stays at 200/district (your ruling stands); the
   *draw* shifts toward heavier species as the scale climbs.
4. **Respawn** — ~10 minutes, re-sited to a new habitat-legal tile, so cleared
   ground refills differently and it reads as the Seers reproducing enemies
   while you explore.
