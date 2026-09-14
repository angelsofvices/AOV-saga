# ★★★★ MEASURED: four districts had ZERO overworld enemies

**Found:** 2026-09-14 at v0.97.1, while wiring Morvexar / Nymphysyl / Penumbra.
**Source:** `tools/verify_enemy_siting.js`, run against the real map.

> ### You said *"no area should be super dense and others scarce."*
> You were describing a real defect and you were right about it without having
> the number. Here is the number.

## THE SHIPPED WORLD, BEFORE THIS PATCH

| district | overworld enemies |
|---|---|
| Malezor | **76** |
| Zarvane | **53** |
| Andrannor | **40** |
| Veridan | 1 |
| Netharion | 1 |
| Vorashil | 1 |
| Xilnar | **0** |
| Baelgor | **0** |
| Thardin | **0** |
| Korathen | **0** |

**169 of 177 bodies stand in the first three districts.** The endgame district
had no overworld enemies at all. Densest-to-sparsest ratio: **17.6x**.

★ This is not a balance opinion. It is a count of `NPCS` entries with
`isEnemy && scene === 'overworld'`, taken by evaluating the real array rather
than grepping near it.

## WHAT v0.97.1 DID ABOUT IT

Added **64 bodies** across all ten districts, climbing eastward:

```
malezor 2 · zarvane 4 · andrannor 2 · veridan 2 · netharion 9
vorashil 9 · xilnar 10 · baelgor 7 · thardin 9 · korathen 10
```

★ The four empty districts now hold **at least seven each**. Every district has
new enemies. But 64 bodies cannot correct a 76-to-0 baseline, and I did not
pretend otherwise — the suite records 17.6x as a **ratchet** it must not exceed,
rather than a threshold relaxed until it went green.

## WHAT THE REDISTRIBUTION PASS OWNS

You already flagged this: *"pretty soon we will do a redistribution and update
all enemies so that each district has individual species of enemies inhabiting
them."* The measurement says it is not cosmetic — **half the map is empty.**

Three things are now in place for it:

1. **`siteEnemyTile()`** — the siting rule. Hard-rejects unwalkable ground,
   wrong district, town, and plaza; soft-prefers coast, outskirts and tiles
   4–14 from a gold or cosmic chest. Any species can be run through it.
2. **`tools/lib/world_harness.js`** — loads the real terrain chain, the real
   `WORLD_PROPS` and the real `NPCS` into a vm, so placement can be *driven*
   instead of asserted. This is what found the zeros.
3. **`tools/verify_enemy_siting.js`** — the density table above regenerates on
   every run, so the redistribution's progress is visible as one number.

## ★★★ THE TOWN RULE, AND WHY IT IS NOT A NEW RULE

You said *"try to keep enemies out of the main town districts."* There is no
town table in RP7 — no `isTownTile`, no `TOWN_CENTERS`. My first draft measured
distance from any prop with a footprint, which would have been wrong in an
expensive way: **9,203 of the 16,270 props are trees and bushes**, so that test
says "forest", and a forest is exactly where you asked for enemies.

What exists instead is `SETTLEMENT_DOCTRINE` — the law that decides where a
*house* may stand, measured off Malezor because Malezor is the district you said
already works. Belt t 0.09–0.50 of the district radius, forest and highland
quarters only, never on the road, never in the marsh.

**So the enemy rule is that law read backwards: an enemy belongs wherever a
house may not.** Inverting a rule is better than authoring a parallel one,
because the two can never drift apart — retune the settlement belt and the
enemies move with it, for free.

## ★ ONE THING WORTH YOUR RULING BEFORE THE REDISTRIBUTION

The density target. *"a range of enemy populations, similar to zyrex
populations"* points at the `ZYREX_POPULATIONS` / `wild_placement.json` model
rather than a flat per-district count — which would mean enemies get a habitat
table the way Zyrex do, with species tied to terrain rather than to district id.
That is a bigger and better thing than "spawn N per district," and it is the
shape your sentence implies. **Confirm and I will build it that way.**
