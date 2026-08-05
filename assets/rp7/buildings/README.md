# Buildings Asset Library

35 isometric structure sprites for use across the AOV Saga (world-map settlements, district capitals, Seer HQs, faction strongholds, teleport pads, etc.).

## What's in here

| File | Purpose |
|---|---|
| `buildings-sheet.png` | Master 1536×1024 reference sheet · 7 cols × 5 rows · magenta background preserved |
| `buildings-sheet-transparent.png` | Same sheet · magenta chroma-keyed to alpha (drop-in single-file spritesheet) |
| `building_01.png` … `building_35.png` | 35 individual structures · transparent · tight-cropped to visible bbox |

## Numbering + rough categories

Read left→right, top→bottom starting at 1:

```
01 02 03 04 05 06 07   ← row 1 · GRAND / HOLY  · cathedrals, marble domes, treehouse temple, crystal spire, thatched house, windmill
08 09 10 11 12 13 14   ← row 2 · CIVIC / TRADE · obelisk fountain, gothic keep, coliseum, market tents, tower, workshop dome, industrial factory
15 16 17 18 19 20 21   ← row 3 · ARCANE / TECH · floating platform, palm pyramid, crystal spires, altar circle, blue temple, green lab, silver observatory
22 23 24 25 26 27 28   ← row 4 · DARK / SEER   · gothic castles, dark shrines, obelisk keeps, purple crystal cluster
29 30 31 32 33 34 35   ← row 5 · SPECIAL       · lava volcano, skull hut, crystal dungeon, gothic cathedral, spaceship, holo-portal, cave/mine
```

Individual PNGs are cropped to each sprite's actual pixel bbox via connected-component detection on the chroma-keyed alpha mask (row-aware strict target merging: 7 per row × 5 rows = 35). No grid clipping.

## Suggested usage

**District capital / world-map settlement:**

```js
{
  id: 'malezor',
  displayName: 'Malezor · Beastlands',
  capitalArt: '/assets/buildings/building_09.png'   // gothic keep
}
```

**Seer HQ per district (row 4 = dark/Seer aesthetic):**

```js
{ id: 'malezor_seer_hq', art: '/assets/buildings/building_22.png' }
```

**As a `<div>` background:**

```css
.district-capital {
  background: url('/assets/buildings/building_16.png') center / contain no-repeat;
}
```

Follow the standing rule: **never stretch** — use `background-size: contain` inside a proportional container. See `/spaces/…/memory/image-never-stretch-console-fullscreen.md`.

## Notes

- Isometric sprites (roughly 4:3 rectangular framing) with pixel-art shading. Sizes vary 151–221 px per side.
- Same magenta chroma-key treatment as `/assets/humanoids/`, `/assets/corrupted-humanoids/`, and `/assets/weapons/` (top-left pixel sampled, ±40 per-channel tolerance).
- Total folder size ~8.6 MB.
- No walk animations — these are static structures.
