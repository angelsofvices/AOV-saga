# Humanoid Chibi Library

Base sprite library for NPCs across the AOV Saga games (RP4 townsfolk, RP7 hall NPCs, RP8 neighbors, RP9 gardenland dwellers, etc.).

## What's in here

| File | Purpose |
|---|---|
| `humanoids-sheet.png` | Master reference sheet · 1536×1024 · 10 cols × 5 rows · magenta background preserved |
| `humanoids-sheet-transparent.png` | Same sheet · magenta chroma-keyed to alpha (single spritesheet drop-in) |
| `humanoid_01.png` … `humanoid_50.png` | 50 individual chibis · transparent · tight-cropped to the visible sprite bbox |

## Numbering

Read left→right, top→bottom starting at 1:

```
01 02 03 04 05 06 07 08 09 10   ← row 1
11 12 13 14 15 16 17 18 19 20   ← row 2
21 22 23 24 25 26 27 28 29 30   ← row 3
31 32 33 34 35 36 37 38 39 40   ← row 4
41 42 43 44 45 46 47 48 49 50   ← row 5
```

Individual PNGs are cropped to each sprite's ACTUAL pixel bbox via connected-component detection on the chroma-keyed alpha mask (not a fixed grid), so no sprite gets sliced in half or has its edges clipped. The master sheet is 1536×1024 with a nominal 10×5 layout.

## Using in a game

Reference by number in NPC config:

```js
{
  id: 'sister_solia',
  portraitAsset: '/assets/humanoids/humanoid_04.png',  // maid outfit, blonde
  // ...rest of NPC fields
}
```

Or via the master sheet (custom slicer for animation frames, once walk cycles land):

```js
const HUMANOIDS_SHEET = '/assets/humanoids/humanoids-sheet-transparent.png';
```

## Notes

- These are **static portrait sprites**, not walk cycles. For NPCs that need to walk, they'll fall back to a rigged walk sheet (e.g. `player2Frames`) until dedicated walk animations are added per-humanoid.
- Colours: bright chibi palette, works over any world background. If you place one on a dark scene and it looks too bright, add a `filter: drop-shadow(0 1px 0 rgba(0,0,0,.3))` in CSS or blend against the world tint.
- The magenta was `#ea3add`-ish (sampled from the top-left pixel with ±40 per-channel tolerance so anti-aliased fringe gets cleaned too).
