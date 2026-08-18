# RP7 BETA · SHARED SCALE MEMORY — Claude ⇄ ChatGPT

**Status:** live. This file is the single source of truth for every RP7 **BETA** asset.
RP7 **CLASSIC** is frozen — do not generate assets against it.
Update this file whenever a measurement changes; both sides read from here.

---

## 0 · The two modes (now live in `rp7.html`)

| | CLASSIC | BETA |
|---|---|---|
| Entry | `NEW GAME` | `NEW GAME · BETA` |
| Viewport | 20 × 14 tiles → 640 × 448 | **16 × 12 tiles → 512 × 384 (4:3)** |
| Tile | 32 px | **32 px (unchanged)** |
| Character sprite | 1 tile, centered on tile | **1 tile wide × 2 tiles tall, feet-anchored** |
| Save slot | `aov-rizers-v1` | `aov-rizers-v1-beta` |
| Purpose | shipping playtest — untouched | graphics track — all new art lands here |

The two share one codebase and one story. Classic takes an early return in `drawCharacter()`
and is byte-for-byte the original call. Beta is a runtime flag, not a fork, so mechanics can
never drift apart.

---

## 1 · Where these numbers come from

Measured, not assumed. 15 reference screenshots in `/assets/scale ref/` (`sr1`–`sr15.webp`),
all 1024 × 768. Method: edge-energy autocorrelation on each image, both axes.

```
mean autocorrelation @ 32px pitch : -0.144      (rejected)
mean autocorrelation @ 64px pitch :  0.483      (dominant, 15/15 images)
```

64 px pitch in a 1024 × 768 image → **16 × 12 tiles**, and the shots are 2× upscales of a
**512 × 384** screen. So the reference standard is **32 px tiles, 16 × 12 viewport, 4:3** —
Gen-5 / Pokémon-Essentials scale, *not* GBA Emerald's 16 px / 3:2.

**This is a correction to the earlier Emerald bible.** RP7's `TILE = 32` was already exactly
right — it needed no reinterpretation. Only the viewport and the sprite changed.

Character heights, measured by background-difference bounding box:

| Reference | Height | In tiles |
|---|---|---|
| sr2 white-hair | 120 px | 1.88 |
| sr2 blue-hood | 120 px | 1.88 |
| sr5 lone walker | 130 px | 2.03 |
| sr9 player | 128 px | 2.00 |
| sr12 player | 140 px | 2.19 |

→ **2 tiles tall** is confirmed by measurement, not by eye.

Battle sprites, same method (sr6, sr15): ~190 × 180 px at 2× → **96 × 96 native**.
RP7's existing `<canvas class="mon-canvas" width="96" height="96">` is *already correct*.
No battle-scale change is needed.

---

## 2 · BETA MASTER SCALE — the numbers ChatGPT must obey

> **1 tile = 32 px. The player is 1 tile wide × 2 tiles tall = 32 × 64 px.
> Everything else is derived from the player.**

| Asset class | Tiles (W × H) | Native px | Notes |
|---|---|---|---|
| **Player** | 1 × 2 | **32 × 64** | master reference · feet-anchored · collides on 1 tile |
| Adult NPC | 1 × 2 | 32 × 64 | same build, different costume |
| Child NPC | 1 × 1.5 | 32 × 48 | |
| Door / doorway | 1 × 2 | 32 × 64 | exactly the player's height |
| Sign / post | 1 × 1 | 32 × 32 | |
| Chair | 1 × 1 | 32 × 32 | seat at the player's knee |
| Table | 2 × 1 | 64 × 32 | surface at the player's waist |
| Bed | 1 × 2 | 32 × 64 | |
| Couch | 2 × 1 | 64 × 32 | |
| Dresser / stove / TV | 1 × 1 | 32 × 32 | |
| Bookshelf / fridge | 1 × 2 | 32 × 64 | top at the player's head |
| Chest | 1 × 1 | 32 × 32 | |
| Tree | 2 × 2 | 64 × 64 | canopy row goes on the OVERLAY layer |
| Street lamp | 1 × 3 | 32 × 96 | |
| Market stall | 3 × 2 | 96 × 64 | |
| Small creature | 1 × 1 | 32 × 32 | overworld form |
| Medium creature | 2 × 2 | 64 × 64 | |
| Large creature | 3 × 3 | 96 × 96 | |
| Boss creature | 4 × 4 | 128 × 128 | |
| Small house | 4 × 4 | 128 × 128 | 2× player height · 1 × 2 door |
| Large house | 5 × 4 | 160 × 128 | |
| Gym / Seer HQ | 6 × 5 | 192 × 160 | |
| Tower | 4 × 7 | 128 × 224 | |
| Terrain tile | 1 × 1 | 32 × 32 | seamless on all 4 edges |
| **Battle sprite** | 3 × 3 | **96 × 96** | front + back · matches existing canvases |
| Full screen | 16 × 12 | **512 × 384** | display at 2× (1024 × 768) to match the refs |

---

## 3 · Authoring resolution (important)

ChatGPT can only emit 1024 × 1024 / 1536 × 1024 / 1024 × 1536. So **author large, downsample
offline** — never let the browser do it.

- Sheets: request **1536 × 1024**, magenta `#EA3ADD` flat background.
- On the sheet, draw one tile as **96 px** (a 3× working scale). Player = 96 × 192.
- After generation: chroma-key → tight-crop → resample to native size with **Lanczos/area**,
  then save the small PNG.
- `rp7.html` sets `imageSmoothingEnabled = false`, so a live 192 → 64 blit is nearest-neighbour
  and destroys the art. This is already why the shipped humanoids look noisy — `humanoid_01.png`
  is 98 × 177 and gets crushed live. Pre-downscale, always.

Conversion after cropping:

```
H_ref            = cropped height of the reference player on the sheet
tile_px_on_sheet = H_ref / 2
native_h         = round(32 * cropped_h / tile_px_on_sheet)
native_w         = round(native_h * cropped_w / cropped_h)
tiles_x/tiles_y  = round(cropped_w or h / tile_px_on_sheet)
```

---

## 4 · Style canon (from the reference folder)

- Top-down three-quarter overworld camera — you see the front face of objects plus a little
  of the top surface. Same camera for every asset. Never isometric, never true side view.
- Hard-edged pixel shading: flat blocks, 2–3 tone steps per material, crisp dark outlines.
  No airbrush, gradients, blur, glow, bloom, or 3D-render look.
- Single top-left light on everything.
- Rich saturated palette — the refs are Gen-5 era, not 16-colour GBA. Do **not** flatten to 16.
- Uniform pixel density: a 1-tile object gets no finer detail than a 4-tile object.
- Strong silhouettes — every asset must read at 32 px from its outline alone.

**Animation:** 4 directions (right = horizontal flip of left). 3 frames per direction —
stand · step-left · step-right, played stand → left → stand → right. Every frame keeps identical
height, bounding box, feet position and perspective. Motion happens *inside* the frame; the
character never grows, shrinks, or slides. One walk cycle covers exactly one tile.

**Sheets:** flat magenta `#EA3ADD`, no shadows on the background (they break chroma-key),
≥30 px of clear magenta around each cutout, nothing cropped by the canvas edge, no text/labels/
grid lines/borders.

---

## 5 · Standing preamble for ChatGPT

Paste at the top of every RP7 BETA asset prompt:

> These assets are for **Rizing Power 7 · BETA**, a 2D tile RPG. **One tile = 32 px. The player
> is 1 tile wide × 2 tiles tall (32 × 64 px) and every other size derives from the player.**
> The screen is 16 × 12 tiles (512 × 384, 4:3). Draw at a 3× working scale — one tile = 96 px,
> player = 96 × 192 — on a flat magenta `#EA3ADD` background, top-down three-quarter camera,
> hard-edged pixel shading, single top-left light, no shadows on the background, no text or
> grid lines. Sizes are absolute: never rescale an object for composition. A chair is at the
> player's knee, a table at his waist, a bookshelf at his head, a house twice his height.

---

## 6 · Working-memory rules

1. **Classic is frozen.** No asset, prompt, or code change targets classic. Ever.
2. **Beta is the only art track.** Everything new lands behind `isBeta()`.
3. **Measurements beat opinions.** Every number here traces to a measurement on
   `/assets/scale ref/`. If a number changes, re-measure, then edit this file — don't
   fork a second spec.
4. **This file is the handoff.** A fresh Claude or ChatGPT session should be able to produce
   correct RP7 beta assets from this file alone, with no other context.
5. **Art serves the game scale. The game scale never changes to accommodate art.**

---

## 7 · Changelog

- **2026-07-29** · Mode split shipped in `rp7.html` (7 edits, both modes verified headless,
  separate save slots). Beta scale canon measured from the 15-image reference folder.
  Corrected the earlier GBA-Emerald assumption: the target is **32 px tiles / 16 × 12 / 4:3**,
  and RP7's tile size was already right. Battle sprites confirmed at 96 × 96 — already correct.
