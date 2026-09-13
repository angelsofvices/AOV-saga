# RULING NEEDED · Rakoron's Cave bbox cuts 143px off the stairs

**Raised:** 2026-09-13 · v0.96.86
**Found by:** `tools/verify_prop_bbox_crop.py`, the sweep run after the Creator
reported *"the meteor is cropped on the overworld."*

## What was found

`rakoron-cave-full.png` is 1300×1300. Its art occupies **y 107 → 1192**.
The prop declares `bbox: [0, 0, 1300, 1050]`, which stops at **y 1049**.

**173,436 pixels — the bottom 143px of the stone stairs — are never drawn.**
Only 87.1% of the asset reaches the screen.

## Why I did NOT just fix it

The other two crops found in the same sweep (the meteor crater and Club 50)
were pure display bugs and were corrected. This one is not, for two reasons:

1. **The number is documented as deliberate.** The declaration's own comment
   reads *"1300×1050 · 13w × 10.5h tiles"* and *"stairs bottom at row 11"*, and
   points at `scripts/compose_rakoron_cave.py`. Somebody chose 1050.
2. **★ This prop's `footprint` is real collision** — a 13×11 solid mass with a
   single walkable stair line at `dx === 0, dy >= -3`. `drawProp` derives
   `drawH` from the bbox aspect ratio, so widening the box **moves the art
   relative to a collision shape that does not move with it**. Rizer climbs
   from (22,10) and stops at (22,7); if the stairs shift, he walks on air or
   into stone.

Changing art that is pinned to collision is not a bbox fix, it is a level edit,
and it is the Creator's call.

## The three options

| | change | consequence |
|---|---|---|
| **A · leave it** | nothing | the stairs keep a clean cut bottom edge, which reads as "the stairs end here." Possibly what was intended, since the cut is a straight horizontal line at a tile boundary. |
| **B · reveal it, hold the anchor** | `bbox: [13, 107, 1261, 1086]`, `tileW` unchanged | the whole cave draws, but drawH grows 504 → 537px and the art rises ~0.7 tile against the footprint. **Collision would need re-measuring.** |
| **C · reveal it, hold the scale** | `bbox: [13, 107, 1261, 1086]` and re-derive `tileW` so the cave keeps its current on-screen size | same approach used on the meteor crater. Still moves the stair line against the footprint. |

## What is needed

A yes/no on whether the stairs are supposed to end where they currently do.
If they are, this file can be deleted and the exemption in
`tools/verify_prop_bbox_crop.py` made permanent with that reason recorded.

Until then the suite exempts it **by name, with this document cited**, so it
stays visible instead of silently passing.
