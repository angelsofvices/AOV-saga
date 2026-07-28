# Corrupted Humanoid Enemy Library

Combat-enemy sprite library — 50 undead / demonic / mutated forms that humanoids can turn into when corrupted. Paired counterpart to `/assets/humanoids/` (the clean base library).

## Lore hook

Every entry here represents an infection endpoint for one of the base humanoids in `/assets/humanoids/`. When a saga NPC gets corrupted, they can plausibly transform into any of these forms — zombies, skeletons, demonic overlords, bloated fleshbeasts, etc. Wire specific corruption paths per NPC as combat encounters are built out.

## What's in here

| File | Purpose |
|---|---|
| `corrupted-humanoids-sheet.png` | Master 1536×1024 reference sheet · 10 cols × 5 rows · magenta background preserved |
| `corrupted-humanoids-sheet-transparent.png` | Master sheet · magenta chroma-keyed to alpha (drop-in single-file spritesheet) |
| `corrupted_01.png` … `corrupted_43.png` | 43 individual enemies · transparent · tight-cropped to visible bbox |

**Actual count is 43 (not 50)** — the source sheet has a variable-density layout: rows 1–2 have 9 sprites each, rows 3–4 have 8 each, row 5 has 9. Detected via connected-component labeling on the chroma-keyed alpha mask (not a fixed grid) so each output is a complete sprite.

## Numbering

Read left→right, top→bottom starting at 1:

```
01 02 03 04 05 06 07 08 09      ← row 1 · shambler zombies (9)
10 11 12 13 14 15 16 17 18      ← row 2 · profession zombies (9 · nurse, worker, cop, businessman, secretary, firefighter…)
19 20 21 22 23 24 25 26         ← row 3 · undead specialists (8 · armored zombie, skeleton warrior, skeleton dog, crawler, bloated ones)
27 28 29 30 31 32 33 34         ← row 4 · demonic mutations (8 · spectre, mutants, tentacle horror, wraith)
35 36 37 38 39 40 41 42 43      ← row 5 · skeleton warriors + elite tier (9 · demon lord, hell hound, lich, vampire, winged demon)
```

Each cell in the master sheet is ~153×204 px. Individual PNGs are cropped to the sprite's actual pixel bbox.

## Using as combat enemies

Static portrait — for enemy card / preview / battle sprite:

```js
enemyPortrait: '/assets/corrupted-humanoids/corrupted_23.png'   // skeleton with shield + sword
```

As a battle-scene sprite (drop into any RP battle screen):

```html
<img src="/assets/corrupted-humanoids/corrupted_41.png" class="enemy-sprite">
```

## Tier suggestions (loose)

Not a canon lock — just a starting scale for balancing:

- **Rows 1–2** (01–20) — grunt tier · shamblers, profession-zombies · common encounters
- **Row 3** (21–30) — variant tier · armored, skeletal, bloated · uncommon mini-mobs
- **Row 4** (31–40) — mutant tier · fleshbeast, tentacle-horror, corrupted spawn · mini-boss material
- **Row 5** (41–50) — elite / boss tier · lich, demon lord, vampire, winged tyrant · full-boss encounters

## Notes

- Static portrait sprites — no walk cycles here. Combat animations (attack / hurt / death) would be a separate asset pass per enemy.
- Same magenta-chroma-key treatment as `/assets/humanoids/` (top-left pixel sampled, ±40 tolerance per channel).
- Total folder size ~6.2 MB.
