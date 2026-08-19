# RP7 · Habitat + Catching Spec v1 (DRAFT)

**STATUS: spec only — no code written. Revise freely.**

> Rarity is a function of ACCESS, not dice. The habitat is the named event.

## Rulings (Creator · 2026-08-19)

- **territorialFailure** — OVERWORLD ACTION COMBAT — the Zyrex lunges on the map like a Mori. No transition.
- **respawn** — Slow timer with a resident cap. Returning is worth it; camping is not.
- **catchableTiers** — T1-T5 only. T6+ quest/event/ritual. Gemlords by RESPECT, never capture.

## Catch loop

1. spot
2. approach (walk=quiet, sprint=loud)
3. offer food (calm +1, max 3)
4. open Zysphere (~1.5s astralite DNA sync)
5. resolve by temperament

```
clamp(BASE[tier] + (rizerBondTotal/3330)*30 + calm*8 + (quiet?10:0) - tempPenalty, 5, 95)
```

## Temperament

| Temperament | On approach | On failed bond | Penalty |
|:--|:--|:--|--:|
| **Skittish** | flees if you sprint or make noise | flees immediately | −0 |
| **Wary** | watches, backs away | flees after 2 failures | −5 |
| **Territorial** | holds ground | ATTACKS · overworld combat | −15 |
| **Dominant** | attacks on sight | must be subdued first | −30 |

## Archetypes

| Archetype | Hosts | Gate | Cap | Eligible species (T1–T5) |
|:--|:--|:--|:-:|:--|
| **Pond / Shallows** | Elemental·Creature·Nature | open | 3 | Aetherwing T1, Aurarat T1, Cinderant T1, Sandskitter T1, Sunhoop T1, Torchpuff T1, Vipercrow T1, Vulkarmor T1 _(+5)_ |
| **Deep Grove** | Verdant·Nature·Creature | open | 4 | Aetherwing T1, Aurarat T1, Cinderant T1, Sandskitter T1, Sunhoop T1, Torchpuff T1, Vipercrow T1, Vulkarmor T1 _(+5)_ |
| **Ashfield** | Elemental·Beast·Draconic | heat_gear | 4 | Dunestinger T1, Apexaur T3, Cindercur T3, Gravvik T3, Snok T4, Cindercrown T5, Skorrax T5 |
| **Scrapfield/Ruins** | Tech·Crystal·Unknown | open | 4 | Gearbyte T1, Vulcanax T3 |
| **Cliff Ledge** | Beast·Elemental·Draconic | double_jump | 3 | Dunestinger T1, Gravvik T3, Skybeam T4, Snok T4, Skorrax T5 |
| **Deep Cave** | Corrupted·Crystal·Spirit·Unknown | light | 5 | Gravik T1, Gravvik T3, Grimhog T3, Vulcanax T3, Skorrax T5 |
| **Barrow/Graveyard** | Spirit·Corrupted·Unknown | night | 4 | Gravik T1, Gravvik T3, Grimhog T3, Skorrax T5 |
| **Impact Crater** | Extraterrestrial·Astra·Unknown | quest | 3 | Gearbyte T1, Astronyl T3 |
| **Skyshelf** | Astra·Radiant·Chrono | ufo | 3 | Gearbyte T1, Astronyl T3 |
| **Sanctum** | Divine·Radiant·Aura | gemlord | 5 | _none yet_ |

## First slice · Malezor · Sunken Hollow

| Species | T | Types | Rarity | Temperament | Levels | Base % | Respawn |
|:--|:-:|:--|:--|:--|:--|--:|:--|
| **Aetherwing** | 1 | Creature | common | Skittish | 3–10 | 55% | 1d |
| **Aurarat** | 1 | Creature | common | Skittish | 3–10 | 55% | 1d |
| **Cinderant** | 1 | Creature | common | Skittish | 3–10 | 55% | 1d |
| **Sandskitter** | 1 | Creature | common | Skittish | 3–10 | 55% | 1d |
| **Sunhoop** | 1 | Creature | common | Skittish | 3–10 | 55% | 1d |
| **Torchpuff** | 1 | Creature | common | Skittish | 3–10 | 55% | 1d |
