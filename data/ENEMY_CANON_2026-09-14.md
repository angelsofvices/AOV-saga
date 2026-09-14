# THE ENEMY CANON · RP7 · locked 2026-09-14 (v0.97.4)

> ### ★★★★ EVERYTHING COMES FROM TWO STEMS, AND BOTH ARE SEER-MADE.
> Creator, 2026-09-14:
> *"everything comes from mori and daemon which come from corrupt humanoid and
> zyrex which comes from the hands of the seers who make the seers commanders
> spread plagues from seer HQs in each district. this is the enemy loop leading
> up to final war part 1 endgame war at the bridge of hope."*

## THE LOOP

```
            SEERS
              │  make
              ▼
       SEER COMMANDERS
              │  spread plagues from
              ▼
    SEER HQ · one per district
              │
      ┌───────┴───────┐
      ▼               ▼
corrupt HUMANOID   corrupt ZYREX
      │               │
      ▼               ▼
    MORI  T1       DAEMON  T2
      │               │
      └──── every enemy in the game ────┘
                      │
                      ▼
      PART ONE ENDGAME WAR · BRIDGE OF HOPE
         marvel-scale · ushers in Part Two
               and LUMINARY (S3)
```

★★★ **This is why the roster can be rebalanced freely.** Adding a species is
never a lore problem, only a placement one — the supply chain has one source,
and the source is a faction the player is already fighting. *"We can always
decrease number of mori to fit other species in"* is a statement about that.

★★ **And it makes the Seer HQs mechanical.** A plague spreading out of a HQ in
every district is the in-world reason the population exists, respawns, and
hardens eastward. The 10-minute respawn is not a game convention here — it is
the Seers still working while you explore.

## LINEAGE OF EVERY CURRENT SPECIES

| stem | descends |
|---|---|
| **Mori** (corrupt humanoid, T1) | Vilerok T5 · Vorugath T6 · Satyrbeast T3 |
| **Daemon** (corrupt zyrex, T2) | Morlisk T4 · Nymphysyl T7 · Morvexar T8 · Penumbra T6 · Scanobot T3 |

`ENEMY_STEM_OF` in `rp7b.html` holds this, and the suite fails if any roster
species has no stem.

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

## WHERE IT STANDS AT v0.97.4

```
district    spawns   mean tier (all enemies)
malezor      239       1.43
zarvane      240       1.42
andrannor    241       1.50
veridan      240       2.36
netharion    238       3.60
vorashil     238       3.75
xilnar       236       4.18
baelgor      240       3.61
thardin      242       3.80
korathen     245       4.23   ← hardest, by the extra six Morvexar
```

★ **Korathen leads because of the twelve Morvexar**, not the roster. Xilnar's
roster is heavier on paper — Nymphysyl is T7 and lives in the three dark
districts, while Korathen's roster ceiling is Vorugath at T6. Twelve T8 bodies
above the line is what settles it.

★ **Zarvane dips below Malezor**, by your numbers: Malezor carries 15 Vileroks
and 5 Vorugath and Zarvane carries neither. Left as authored.

★ **5 spawns of headroom** before the 250 ceiling. The next species fits.
