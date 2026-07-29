# RP7 · ChatGPT Image-Gen Prompt #1 — MASTER SCALE RULER

**Purpose:** establish the single scale canon every future RP7 asset inherits.
Generated before any "real" asset sheet. Everything after this references it.

---

## PART A — Facts locked from the actual codebase (do not guess these again)

Measured in `rp7.html` + `/assets/` on 2026-07-29:

| Fact | Value | Source |
|---|---|---|
| World grid unit (TILE) | **32 px** | `rp7.html:2294` — `const TILE = 32;` |
| Viewport | 20 × 14 tiles = 640 × 448 px | `rp7.html:2295-2297` |
| Canvas filtering | `imageSmoothingEnabled = false` | `rp7.html:2322` |
| **Master scale rule** | **1 humanoid sprite = exactly 1 TILE tall (32 px)**, width follows native aspect, never stretched | `drawCharacter()` ~14171, NPC pass ~14676 |
| Sprite anchor | **center of tile** — drawn at `(cx − w/2, cy − h/2)` | same |
| Terrain tile draw | blitted at exactly `TILE × TILE` | `rp7.html:12252` (`grass.png`) |
| Existing building footprints | 3×2 (Seer HQ) and 3×3 (Town Hall) tiles → 96×64 and 96×96 px on screen | map gen ~11311, ~11345 |
| Sheet convention | **1536 × 1024**, flat magenta background (`#EA3ADD`-ish, ±40/channel key tolerance) | `/assets/humanoids/README.md`, `/assets/buildings/README.md` |
| Sheet grids in use | humanoids 10 × 5 (50 cells) · buildings 7 × 5 (35 cells) | same |
| Extraction | chroma-key to alpha, then **tight crop to connected-component bbox** (not fixed grid) | same |
| Player sheet frame | 10×5 sheet, first cell blob at `(290, 45, 125, 219)` | `PLAYER_SHEET_FRAME`, `rp7.html:8395` |

**The derived master identity — memorize this:**

> **1 PH (player height) = 1 TILE = 32 rendered pixels.**

Every other asset's on-screen size is `32 × (its height ÷ player height)`.
That single equation is the whole scale system.

---

## PART B — The prompt to paste into ChatGPT

Copy everything between the lines.

---

**RIZING POWER 7 — MASTER SCALE RULER SHEET (asset production, not illustration)**

Produce ONE image, landscape **1536 × 1024**.

**PURPOSE OF THIS IMAGE:** it is a scale calibration chart for a 2D tile-based game.
Its job is to define the size relationship between the player character and every other
object class. Visual beauty is secondary to *correct relative size*. This sheet becomes
the permanent reference every future asset sheet is measured against.

**BACKGROUND / EXTRACTION**
- Flat, solid magenta `#EA3ADD` filling the entire canvas. Perfectly uniform — no gradient,
  no texture, no vignette, no lighting falloff.
- No ground plane, no horizon, no floor, no shadow cast onto the background.
- No text, letters, numbers, labels, arrows, callouts, rulers, measurement lines,
  grid lines, borders, frames, or watermarks anywhere in the image.
- Every object is an isolated cutout with a clear magenta gap of at least 25 px between it
  and its neighbours, and at least 40 px from every image edge. Nothing overlaps.
  Nothing touches or is cropped by the canvas edge.

**STYLE LOCK** (this style is now canon for the whole project)
- 2D chibi pixel art. Large head, compact body, short limbs, friendly proportions.
- Hard-edged pixel shading: flat color blocks, 2–3 tone steps per material, crisp
  1-pixel-feel outlines. NO airbrushing, NO soft gradients, NO blur, NO glow, NO bloom,
  NO photo texture, NO 3D render look, NO cel-anime lineart.
- Consistent light source: top-left, single direction, on every object.
- Limited, saturated palette. Strong readable silhouettes — each object must be
  identifiable from its outline alone.
- Straight-on **front elevation / orthographic** view for all objects. No isometric,
  no 3/4 camera, no perspective vanishing point, no tilt. Same camera for every object.
- Uniform pixel density: all objects rendered at the same apparent pixel size. A small
  object must NOT be drawn with finer detail than a large one.

**THE RULER RULE — THE MOST IMPORTANT INSTRUCTION**
One figure defines all scale: **THE PLAYER** — an adult chibi human, standing, facing
forward, arms at sides, neutral pose.

- The player is drawn **240 pixels tall** in this 1536×1024 image.
- That height equals **1 PH** (one player-height).
- Every other object in this image is sized as an exact multiple of 1 PH, per the list below.
- All objects stand on one shared invisible baseline near the bottom of the image; every
  object's feet/base sits on that same line. Nothing floats, nothing is raised, nothing is
  drawn "bigger because it looks better."
- Do NOT resize objects to fill space or balance the composition. Empty magenta is correct
  and expected.

**OBJECTS TO DRAW — left to right, on the shared baseline, in this order and at these exact heights:**

1. **Player, front view** — 1.00 PH (240 px). This is the reference. Adult chibi hero,
   fitted top, trousers, boots, short spiky hair, confident neutral stance.
2. **Player, side view (facing right)** — 1.00 PH. Identical character, identical height,
   identical costume and palette. Only the viewing angle changes.
3. **Adult NPC (townsfolk)** — 1.00 PH. Different outfit and hair, same body build,
   same height as the player.
4. **Child NPC** — 0.70 PH (168 px). Shorter, rounder, smaller head-to-body ratio change only.
5. **Doorway with door frame** — 1.25 PH tall (300 px), 0.75 PH wide. Must read as a door
   the player character could comfortably walk through.
6. **Bed, side view** — 0.45 PH tall at the headboard (108 px), 1.15 PH long (276 px).
   Must look long enough for the player to lie on.
7. **Couch, front view** — 0.55 PH tall (132 px), 1.10 PH wide (264 px). Seat height must
   sit at roughly one quarter of the player's height.
8. **Refrigerator** — 1.05 PH tall (252 px), 0.45 PH wide. Slightly taller than the player.
9. **Wooden table with one chair** — table 0.45 PH tall, chair 0.55 PH tall. The chair seat
   must align with the couch seat height.
10. **Medium creature (quadruped beast)** — 1.00 PH tall at the head (240 px), roughly
    1.3 PH long. Same chibi pixel style, fantasy beast, not a real animal.

**HARD CONSTRAINTS — violating any of these makes the sheet unusable**
- The player figure in slot 1 and slot 2 must be pixel-identical in height.
- The doorway must be visibly taller than the player, and the fridge only slightly so.
- The bed must be visibly longer than the player is tall.
- No object may be scaled for aesthetic balance. Ratios above are absolute.
- No perspective foreshortening — no object is "further away" than another.
- No shadows on the magenta. Contact shadows, ambient occlusion, and drop shadows are all
  forbidden; they break chroma-key extraction.
- No decorative props, plants, clouds, sparkles, or scenery not listed above.
- Do not add a title, a legend, or a border.

Output the single 1536 × 1024 image.

---

## PART C — What to do with the returned image (import pipeline)

1. **Chroma-key** `#EA3ADD` ±40 per channel → alpha. Same tolerance already used for
   `/assets/humanoids/`, `/assets/buildings/`, `/assets/weapons/`.
2. **Connected-component crop** each object to its true bbox (same method the existing
   READMEs describe). Never a fixed grid.
3. **Measure the player** cutout's pixel height → call it `H_ref`.
4. **Convert every asset** to its native game size:

```
render_height_px  = round(32 * cropped_height / H_ref)
render_width_px   = round(render_height_px * cropped_width / cropped_height)
tiles_occupied_x  = ceil(render_width_px  / 32)
tiles_occupied_y  = ceil(render_height_px / 32)
```

   Sanity check against the ratios: player → 32 px · door → 40 px · bed → 14 × 37 px ·
   fridge → 34 px · child → 22 px · 3-tile house → 96 px wide.

5. **CRITICAL — pre-downscale offline, do not downscale in canvas.** `rp7.html` sets
   `imageSmoothingEnabled = false`, so blitting a 240-px-tall PNG down to 32 px uses
   nearest-neighbour and shreds the art. Resample each cutout to its exact native size with
   a proper filter (Lanczos / area-average) at import time, save the small PNG, and keep
   smoothing off at draw time. This is why the current humanoids look noisy in-world —
   `humanoid_01.png` ships at 98 × 177 and gets nearest-neighbour crushed to 32 px live.
6. **Store the numbers**, don't re-derive them. Every asset gets a manifest row:
   `id · class · native_w · native_h · tiles_x · tiles_y · anchor · dirs · frames`.
   Anchor is **center-of-tile** for characters (matches `drawCharacter()`); use
   **bottom-center** for props and buildings and offset at draw time.

---

## PART D — Ratio table (paste into every FUTURE prompt)

Once the ruler sheet is approved, later sheets don't re-litigate scale — they cite it.
All values in PH, where **1 PH = 1 tile = 32 px**.

| Class | Height (PH) | Tiles | Notes |
|---|---|---|---|
| Player / adult NPC | 1.00 | 1×1 | master reference |
| Child | 0.70 | 1×1 | |
| Small creature | 0.50 | 1×1 | |
| Medium creature | 1.00 | 1×1 | |
| Large creature | 2.00 | 2×2 | |
| Boss | 3.00–4.00 | 3×3 / 4×4 | needs its own sheet |
| Door / doorway | 1.25 | 1×2 | must exceed player height |
| Chair | 0.55 | 1×1 | seat ≈ 0.25 PH |
| Table | 0.45 | 1×1 or 2×1 | |
| Couch | 0.55 h × 1.10 w | 2×1 | |
| Bed | 0.45 h × 1.15 l | 2×1 | |
| Dresser | 0.60 | 1×1 | |
| Stove | 0.60 | 1×1 | |
| Fridge | 1.05 | 1×2 | |
| TV + stand | 0.75 | 1×1 | |
| Potted plant | 0.50 | 1×1 | |
| Chest | 0.35 | 1×1 | matches existing drawn chest |
| Street lamp | 1.80 | 1×2 | |
| Market stall | 1.60 | 2×2 | |
| Cottage / house | 2.60 h × 3.00 w | 3×3 | matches Town Hall footprint |
| Seer HQ | 2.00 h × 3.00 w | 3×2 | matches existing map gen |
| Tower | 4.00 | 3×4 | |
| Terrain tile | — | exactly 1×1, seamless | authored square, tiles on all 4 edges |

**Terrain tiles are a separate prompt with different rules:** square canvas, must tile
seamlessly edge-to-edge, no object may protrude past the tile boundary, no baked lighting
direction that reveals repetition, and the exported PNG must be a power-of-two multiple of
32 (512 × 512 recommended → clean 16× downsample to 32 × 32).

---

## PART E — The non-negotiable

> **Art serves the game scale. The game scale never changes to accommodate inconsistent art.**

If a generated asset does not fit the ratio table, the asset is regenerated — the ratio
table is not edited.
