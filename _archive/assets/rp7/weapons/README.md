# Weapons Asset Library

84 weapon/gear icons for use across the AOV Saga (equipment drops, TCG card art, inventory slots, hall-rizer rewards, boss loot).

## What's in here

| File | Purpose |
|---|---|
| `weapons-sheet.png` | Master 1536×1024 reference sheet · 14 cols × 6 rows · magenta background + name labels preserved |
| `weapons-sheet-transparent.png` | Same sheet with magenta chroma-keyed to alpha AND name-label bands wiped (icons only) |
| `weapon_01.png` … `weapon_84.png` | 84 individual icons · transparent · tight-cropped to visible bbox · names stripped, handles preserved |

**Text-color-aware label wipe** — the slicer now wipes ONLY near-white pixels (the label text) inside each row's bottom band, instead of blanket-stripping the whole band.  Weapon handles / pommels / dark-metal parts that extend into the label area are kept intact.  Row-aware strict target merging (14 per row × 6 rows = 84) consolidates any detached glow/particle sub-blobs with their parent weapon.

## Numbering

Read left→right, top→bottom starting at 1. Rough category-per-row (based on the source sheet layout):

```
Row 1 · Blades          (01–14)   swords, sabres, cutlasses, scythes
Row 2 · Two-handed      (15–28)   spears, axes, hammers, poleaxes, warblades, scythes
Row 3 · Ranged          (29–42)   bows, crossbows, rifles, pulse guns, cannons, harpoons
Row 4 · Staves          (43–56)   scepters, wands, staves, rods, totems, tridents
Row 5 · Off-hand + defense (57–70) daggers, throwing knives, shurikens, shields, gauntlets
Row 6 · Misc + prisms   (71–84)   claws, whips, lances, gauntlets, crystals, utility prisms (Zysphere/Zycube/Zyramid)
```

Each source cell is 109×170 px; icons crop to the top 132 px (label text below is scrubbed before slicing). Individual PNGs are further trimmed to each icon's pixel bbox.

## Using an icon

```html
<img src="/assets/weapons/weapon_23.png" class="loot-icon">
```

Or in an NPC / battle config:

```js
{ id: 'hall_flag_reward_baelgor', icon: '/assets/weapons/weapon_45.png' }
```

## Notes

- **Names on the source sheet were intentionally NOT used** (per hand-off). Wire specific weapons to specific numbers as they get integrated into gameplay.
- Icons only — no attack animations, no equip poses. Add later per weapon as combat asset passes.
- Same magenta chroma-key treatment as `/assets/humanoids/` and `/assets/corrupted-humanoids/` (top-left pixel sampled, ±40 per-channel tolerance).
- Total folder size ~5.2 MB.
