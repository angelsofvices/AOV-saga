# THE ENEMY CANON · RP7 · locked 2026-09-14 (v0.97.4)

> ### ★★★★ EVERYTHING COMES FROM TWO STEMS, AND BOTH ARE SEER-MADE.
> Creator, 2026-09-14:
> *"everything comes from mori and daemon which come from corrupt humanoid and
> zyrex which comes from the hands of the seers who make the seers commanders
> spread plagues from seer HQs in each district. this is the enemy loop leading
> up to final war part 1 endgame war at the bridge of hope."*

## THE LOOP · THREE BRANCHES

```
                        SEERS
                          │  make
                          ▼
                  SEER COMMANDERS
                          │  spread plagues from
                          ▼
              SEER HQ · one per district
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
  corrupt HUMANOID  corrupt ZYREX      THARDIN, TAKEN
    = HAEMEN         = AETHREN        seized machinery
        │                 │                 │
   ┌────┴────┐        (no members       ┌───┴────┐
   ▼         ▼         assigned yet)    ▼        ▼
 MORI T1  DAEMON T2                SCANOBOT  PENUMBRA
   │         │                        T3        T6
   └─── every organic enemy ───┘
                          │
                          ▼
          PART ONE ENDGAME WAR · BRIDGE OF HOPE
             marvel-scale · ushers in Part Two
                   and LUMINARY (S3)
```

> ### ★★★★ THE CORRECTION THAT MATTERS: DAEMON MOVED.
> Creator, 2026-09-14: *"mori and daemon are both corrupt humanoid (haemen).
> corrupt zyrex are corrupt aethren."*
>
> I had Daemon down as corrupt Zyrex. It is not — **both organic stems are
> corrupt Haemen.** That is bigger than a label: every organic enemy in Part One
> traces back to humanity, and **Aethren is a door that has not been opened.**

★ **No current enemy is Aethren, and I have not assigned one.** The branch was
named without members, and the standing canon is that everything organic comes
from Mori and Daemon — both now Haemen. So Aethren is a category waiting to be
filled rather than a relabelling of the existing beasts.
**Ruling wanted:** if Vilerok / Vorugath / Satyrbeast are meant to be corrupt
*Zyrex* rather than corrupt humanoid, one line in `ENEMY_BRANCH_OF` moves them.

### ★★★ THE TECH BRANCH · stolen industry, not corrupted life

> *"they are created by thardin corrupt tech seer commander. when he and his
> grunts took thardin, he took their tech too."*

This is the cleanest piece of enemy lore in the game. The machines are not
corrupted creatures — Thardin **built** a survey net and a war machine, a Seer
commander took the district and the factory with it, and now both walk for him.

★ It also explains a mechanic that was already shipped: a Scanobot is *passive
until the net goes rogue* because it is still doing Thardin's job until its new
owner tells it otherwise.

## LINEAGE OF EVERY CURRENT SPECIES

| branch | stem | descends |
|---|---|---|
| **Haemen** (corrupt humanoid) | Mori T1 | Vilerok T5 · Vorugath T6 · Satyrbeast T3 |
| **Haemen** | Daemon T2 | Morlisk T4 · Nymphysyl T7 · Morvexar T8 |
| **Aethren** (corrupt zyrex) | — | *reserved · no members* |
| **Tech** (seized Thardinian) | — | Scanobot T3 · Penumbra T6 |

`ENEMY_BRANCH_OF` and `ENEMY_STEM_OF` hold this; the suite fails if any roster
species has no branch.

## ★★★★ THE TIER CEILING · LAW

> *"nothing will ever hit tier 10 though. only anciuxor (and rizer technically
> at level 100+)."*

- **T9 is the hard maximum for an enemy** — reserved for the fallen
  Dracolord / Astrum group, if that idea is taken up.
- **T10 belongs to exactly two beings in the setting**: **Anciuxor**, and
  **Rizer** past Lv100. Neither is ever a roster entry.
- **Lower Zyraxis** (everything under the Bridge of Hope) is the T7–T9 band.
  Part One's roster stops at T8 and only via Morvexar, on purpose.

`ENEMY_TIER_MAX = 9` · `TIER_TEN_BEINGS = ['anciuxor','rizer']` ·
`enemyTierLegal()` is driven by the suite, not read.

## THE STANDING PLACEMENT RULE

> *"when I add new enemies and tell you the scale, u will always weigh logic to
> place them accordingly to game progression. just keep the 200-250 range in
> tact."*

So for every new species from here:

1. **Terrain first** — add an `ENEMY_SPECIES_HABITAT` row. Which of the eight
   habitats does it belong in? That decides *where*, always.
2. **Progression second** — its tier and the district scale 1–10 decide *which
   districts* and in what numbers.
3. **Mori is the ballast** — its count drops to make room, per your instruction.
   Authored heavies are never trimmed to fit something new.
4. **The range is the invariant** — every district must land in **200–250**
   total spawns, minibosses and nets included. The suite fails otherwise.

## WHERE IT STANDS AT v0.97.6

**Halved.** Creator: *"should we cut each districts enemy count in half? ... I
just want the overworld to feel strategic. it feels too congested sometimes."*

```
district    spawns   mean tier   scanobot   penumbra (post-spread)
malezor      131       1.74         11          2
zarvane      131       1.79         12          2
andrannor    131       1.83         13          2
veridan      132       2.64         14          2
netharion    130       3.88         14          2
vorashil     130       4.04         15          2
xilnar       129       4.41         15          2
baelgor      132       3.95         16          3
thardin      128       3.97         23          6   ← the source
korathen     134       4.54         15          3   ← hardest
```

Range is now **110-160**, not 200-250. Structural bodies don't halve, so a
halved roster lands the district near 130 rather than 118.

### THE SPREAD, BEFORE AND AFTER

| | before | after |
|---|---|---|
| innermost fifth of a district | 0-7 bodies | 2-6 of a half-size roster |
| outermost band's share | up to 40% | 15-32% |
| bodies within 1 tile of another | **208** | **0** |
| bodies within 3 tiles | **851** | **0** |
| median gap between bodies | 4 tiles | **10 tiles** |
| largest town exclusion | 23% of Malezor | 11.5% of Zarvane |

★★★ **The outskirts bunching was my town rule.** I excluded 26 tiles around
every `_townAnchors` point — and that list includes **every home**, which the
settlement doctrine scatters district-wide. The masks merged into one blanket
over the entire middle of every district, so the only legal ground left was the
rim. ★ The v0.95.747 note records this exact error being made before, in the
building placer: *"Clear of residential is a LOCAL test, not a radius from the
hub."* I read that note while writing the habitat model and made the mistake
anyway.

Now it is two small local circles, as described: **12 tiles from a civic door,
6 from a house.** Step off the plaza and you are in combat.

★★★ **And stacking was never actually prevented.** `occupied` was a Set of exact
tiles — it stopped two enemies sharing one square, which is not what "on top of
one another" looks like. Siting is now **best-candidate (Mitchell)**: each body
samples 48 legal tiles and takes the one scoring best on habitat fit *and*
distance from everything already placed. That produces blue-noise — the
"someone placed these" look rather than "someone spammed sprites" — with a hard
6-tile floor underneath it.

★ Habitat affinity uses **multiplicative** noise. A flat weight meant a 10 beat
an 8 every single time, and the first pass came back 100% of Mori in meadow and
100% of Satyrbeasts in forest. A species found on exactly one terrain is a
monoculture, not a habitat.
