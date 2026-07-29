# RP7 · EMERALD SCALE BIBLE v2 — supersedes Prompt #1's PH table

**Decision locked:** *2× GBA* scale mode · *Emerald-flavored* art fidelity.

---

## PART A — The conversion, in one line

> **RP7's existing 32 px TILE is redefined as Emerald's 16 px tile rendered at 2×.**

Nothing about the tile size in code changes. What changes is what a tile *means*:

| | Pokémon Emerald (GBA native) | RP7 after conversion (2× GBA) | RP7 today |
|---|---|---|---|
| Tile | 16 × 16 px | **32 × 32 px** (unchanged in code) | 32 × 32 px |
| Screen | 240 × 160 px (15 × 10 tiles) | **480 × 320 px** (15 × 10 tiles) | 640 × 448 (20 × 14) |
| Aspect | 3 : 2 | **3 : 2** | 10 : 7 |
| Player sprite | 16 × 32 px (1 × 2 tiles) | **32 × 64 px (1 × 2 tiles)** | 32 × 32 (1 × 1 tile) |
| Player collision | 1 tile (feet) | **1 tile (feet)** | 1 tile |
| Battle sprite | 64 × 64 px | **128 × 128 px** | ~96 × 96 |

**The single biggest change: the player is now TWO tiles tall, not one.** Head occupies the tile
above the tile he stands on; the tile he stands on is the only one that collides. This is exactly
how Emerald works and it is why Emerald worlds feel inhabited instead of miniature.

**New master identity:**

> **1 PH (player height) = 2 tiles = 64 px @2× = 32 px GBA-native.**

Verified against the codebase: Gen 3 overworld character frames are 16 × 32 px — "1 tile is 8×8
pixel, so a default 16×32 would be 2 and 4" tiles wide/tall. Gen 3 battle sprites are **64 × 64**,
not 80 × 80 — 80 × 80 is Generation 4. Correct that number wherever it's been written down.

---

## PART B — Code changes in `rp7.html`

Five edits. That's the whole migration.

**1 · Viewport → GBA framing** (line 2295)

```js
let COLS = 20, ROWS = 14;          // OLD
let COLS = 15, ROWS = 10;          // NEW — 480 × 320 = exactly 2× the GBA screen
```

`CANVAS_W/H` derive from these (2296-2297) and the camera clamp at 12149-12158 already reads
`COLS`/`ROWS`, so the camera adapts with no further work. The `stage.style.aspectRatio` line
(2312) will start emitting `15 / 10` = 3:2 automatically.

⚠️ **Re-verify:** the dynamic-`ROWS` helper around 2306-2312 takes a `targetRows` argument. Check
whatever calls it isn't still passing 14, or it will silently un-do this edit at runtime.

**2 · Player sprite → 2 tiles tall, bottom-anchored** (`drawCharacter()`, ~14171)

```js
// OLD — height = 1 tile, centered on the tile
const drawH = TILE;
const drawW = drawH * (srcW / srcH);
const dx = cx - drawW / 2;
const dy = cy - drawH / 2;

// NEW — height = 2 tiles, FEET anchored to the bottom of the standing tile
const drawH = TILE * 2;
const drawW = drawH * (srcW / srcH);
const dx = cx - drawW / 2;
const dy = (cy + TILE / 2) - drawH;
```

The anchor change is not cosmetic. Center-anchoring a 2-tile sprite makes the character sink into
the floor by half a tile and breaks every depth/overlap decision. Feet-on-tile is the rule now.

**3 · NPC pass → same treatment** (~14676). Identical two lines, same reasoning. The comment there
currently reads "MASTER VISUAL RULE: 1 humanoid sprite = 1 TILE" — update it to
`1 humanoid sprite = 1 tile wide × 2 tiles tall, feet-anchored`, since that comment is what the
next person will trust.

**4 · Procedural fallback chibi** (~14196, `const w = 22, h = 22;`) → roughly `w = 26, h = 52`,
also feet-anchored. Otherwise every NPC whose PNG hasn't loaded yet pops from half-size to
full-size, which reads as a flicker.

**5 · Building footprints must grow.** Doubling the player without doubling structures is the one
way this migration goes wrong. Existing map gen uses 3×2 (Seer HQ, ~11311) and 3×3 (Town Hall,
~11345). With a 2-tile player those read as 1–1.5 player-heights — a house you could step over.
Emerald targets: small house **4×4**, large house **5×4**, gym/HQ **6×5**. Raise the footprints in
map gen and widen the door openings to 1 tile wide × 2 tall.

**Battle sprites** (separate, non-blocking): `Math.min(96 / img.width, ...)` at ~24907 and the
`drawImage(tmp, 0,0,96,96, 0,0,72,72)` / `…0,0,48,48` calls at ~25080 / ~25260 assume a 96-box.
Gen 3's box is 64, so at 2× the correct source box is **128 × 128**. Swap the 96s for 128s and the
72/48 display sizes scale accordingly.

---

## PART C — The Emerald footprint table (this replaces the PH table in Prompt #1)

All sizes in **tiles**. 1 tile = 32 px in code = 16 px GBA-native. **1 PH = 2 tiles.**

| Class | Tiles (W × H) | Px @2× | Notes |
|---|---|---|---|
| **Player / adult NPC** | 1 × 2 | 32 × 64 | master reference · feet-anchored · collides on 1 tile |
| Child NPC | 1 × 1.5 | 32 × 48 | |
| Door / doorway | 1 × 2 | 32 × 64 | exactly the player's height — he fills it |
| Sign / post | 1 × 1 | 32 × 32 | |
| Chair | 1 × 1 | 32 × 32 | seat at player's knee |
| Table | 2 × 1 | 64 × 32 | surface at player's waist |
| Bed | 1 × 2 | 32 × 64 | Emerald beds are 1 wide, 2 long |
| Couch | 2 × 1 | 64 × 32 | |
| Dresser / stove / TV | 1 × 1 | 32 × 32 | |
| Bookshelf / fridge | 1 × 2 | 32 × 64 | top at or just above player's head |
| Potted plant | 1 × 1 | 32 × 32 | |
| Chest | 1 × 1 | 32 × 32 | |
| Tree | 2 × 2 | 64 × 64 | canopy tile + trunk tile |
| Street lamp | 1 × 3 | 32 × 96 | |
| Market stall | 3 × 2 | 96 × 64 | |
| **Small creature** | 1 × 1 | 32 × 32 | half a player tall |
| Medium creature | 2 × 2 | 64 × 64 | player-height at the head |
| Large creature | 3 × 3 | 96 × 96 | |
| Boss creature | 4 × 4 | 128 × 128 | own sheet |
| **Small house** | 4 × 4 | 128 × 128 | 2 PH tall · 1×2 door |
| Large house | 5 × 4 | 160 × 128 | |
| Gym / Seer HQ | 6 × 5 | 192 × 160 | |
| Tower | 4 × 7 | 128 × 224 | |
| **Terrain tile** | 1 × 1 | 32 × 32 | seamless all 4 edges |
| **Battle sprite** | — | 128 × 128 | Gen 3 box (64) at 2× |

Sanity check: at 15 × 10 tiles the whole screen is 7.5 player-widths across and 5 player-heights
tall. A 4×4 house fills a quarter of the screen width. That is Emerald.

---

## PART D — The prompt to paste into ChatGPT

Copy everything between the lines. This is the new standing prompt — it replaces Prompt #1's
ruler sheet.

---

**RIZING POWER 7 — EMERALD-SCALE MASTER SHEET (game asset production, not illustration)**

Produce ONE image, landscape **1536 × 1024**.

**WHAT THIS IS:** a scale calibration sheet for a 2D tile-based RPG built to Pokémon Emerald's
proportions. Correct relative size is the entire point of this image. Beauty is secondary.
Every future asset sheet gets measured against this one.

**THE GRID — read this twice**
The game world is built on square tiles. In this image, **one tile = 96 × 96 pixels**.
Do not draw the grid. Do not draw grid lines, guides, or boxes. The grid is invisible — it only
governs how large each object is.

**THE MASTER REFERENCE**
The player character is **1 tile wide × 2 tiles tall** — that is **96 px wide × 192 px tall** in
this image. Call that height **1 PH**. Every other object's size is dictated by the tile counts
below, and 1 tile is always 96 px. Never resize an object because it looks better; the tile counts
are absolute.

Because the player is 2 tiles tall, a chair is at his knee, a table at his waist, a bookshelf at his
head, and a house is twice his height. This is the Pokémon Emerald relationship and it must be
visibly true in the image.

**BACKGROUND / EXTRACTION**
- Flat solid magenta `#EA3ADD` across the whole canvas. Perfectly uniform — no gradient, texture,
  vignette or lighting falloff.
- No ground plane, no horizon, no floor, no cast shadows, no contact shadows, no ambient occlusion.
  Shadows on the background break chroma-key extraction.
- No text, numbers, labels, arrows, callouts, rulers, measurement lines, grid lines, borders,
  frames or watermarks anywhere.
- Each object is an isolated cutout with at least 30 px of clear magenta around it and at least
  40 px from every canvas edge. Nothing overlaps. Nothing is cropped by the edge.

**STYLE — Emerald-flavored**
- Top-down 2D RPG overworld view, Pokémon Emerald camera: a slightly tilted-forward "three-quarter
  top-down" where you see the front face of objects and a little of their top surface. Same camera
  angle for every object in the image. No isometric. No true side view. No perspective vanishing point.
- Chibi pixel art: large head, compact body, short limbs, friendly readable proportions.
- Hard-edged pixel shading — flat color blocks, 2–3 tone steps per material, crisp dark outlines.
  No airbrushing, no soft gradients, no blur, no glow, no bloom, no 3D render look, no cel-anime lineart.
- Rich saturated palette (this project keeps more colors than a real GBA game — do NOT flatten to
  16 colors), but every object must still read clearly at small size from its silhouette alone.
- Single light source, top-left, consistent across every object.
- Uniform pixel density: a 1-tile object gets no finer detail than a 4-tile object.

**OBJECTS TO DRAW — arrange in rows, all sitting on shared invisible baselines**

*Row 1 — the reference:*
1. Player, facing **down** (toward viewer) — 1 × 2 tiles (96 × 192 px). Adult chibi hero, fitted top,
   trousers, boots, short spiky hair, neutral standing pose. THIS IS THE REFERENCE.
2. Player, facing **up** (back of head) — 1 × 2 tiles. Same character, same height.
3. Player, facing **right** (side profile) — 1 × 2 tiles. Same character, same height.
4. Adult NPC — 1 × 2 tiles. Different outfit and hair, same build and height.
5. Child NPC — 1 × 1.5 tiles (96 × 144 px).

*Row 2 — furniture, sized against the player:*
6. Doorway with frame — 1 × 2 tiles. Exactly the player's height; he fills the opening.
7. Bed — 1 tile wide × 2 tiles long (96 × 192 px).
8. Table — 2 × 1 tiles (192 × 96 px). Surface at the player's waist.
9. Chair — 1 × 1 tile. Seat at the player's knee.
10. Bookshelf — 1 × 2 tiles. Top at the player's head.

*Row 3 — world objects:*
11. Tree — 2 × 2 tiles (192 × 192 px).
12. Small creature (fantasy beast, quadruped) — 1 × 1 tile. Half the player's height.
13. Medium creature — 2 × 2 tiles. Head reaches the player's head.
14. Small house — 4 × 4 tiles (384 × 384 px), with a door opening exactly 1 × 2 tiles. The door must
    visibly match the doorway in Row 2, and the house must be twice the player's height.

**HARD CONSTRAINTS — breaking any of these makes the sheet unusable**
- All four player figures in Row 1 must be identical in height, build, costume and palette. Only the
  facing direction changes.
- The player must be visibly TWICE as tall as he is wide.
- The doorway, the bed's length, and the house's door must all be exactly the player's height.
- The house must be exactly twice the player's height.
- No object may be resized for composition or visual balance. Empty magenta is correct.
- No perspective foreshortening — nothing is "further away" than anything else.
- No shadows of any kind on the magenta.
- No scenery, sky, ground, grass, clouds, sparkles, or props not listed above.
- No title, legend, border, or caption.

Output the single 1536 × 1024 image.

---

## PART E — Import math (updated for 2 tiles)

After chroma-keying `#EA3ADD` (±40/channel) and tight-cropping each object to its bbox:

```
H_ref             = cropped pixel height of the Row-1 player
tile_px_in_sheet  = H_ref / 2                       // player is 2 tiles tall
render_height_px  = round(32 * cropped_height / tile_px_in_sheet)
render_width_px   = round(render_height_px * cropped_width / cropped_height)
tiles_x           = round(cropped_width  / tile_px_in_sheet)
tiles_y           = round(cropped_height / tile_px_in_sheet)
```

Check the output against Part C before accepting a sheet. Player → 32 × 64. Chair → 32 × 32.
House → 128 × 128. If the numbers don't land, the sheet is regenerated — the table is not edited.

**Still mandatory:** pre-downscale offline with Lanczos/area resampling and save the small PNG.
`rp7.html` sets `imageSmoothingEnabled = false` (line 2322), so a live 192→64 blit is
nearest-neighbour and destroys the art. This is already the cause of the noisy look on
`humanoid_01.png` (ships 98 × 177, crushed live).

**Manifest row per asset:**
`id · class · native_w · native_h · tiles_x · tiles_y · anchor · dirs · frames`
Anchor is **bottom-center** for everything now — characters included.

---

## PART F — Animation standard (Gen 3)

- 4 facing directions: down, up, left, right. Right is the horizontal flip of left — author one side.
- 3 frames per direction: **stand · step-left · step-right**, played stand → left → stand → right.
- Every frame: identical sprite height, identical bounding box, identical feet position, identical
  perspective. Motion happens *inside* the frame. The character never grows, shrinks, slides, or
  changes proportion between frames.
- Movement covers one full tile per walk cycle — the animation and the grid step must agree or the
  character will appear to skate.
- Loose elements (hair, cape, coat, tail) move subtly; the body silhouette stays stable.

---

## PART G — The non-negotiable, restated

> **Art serves the game scale. The game scale never changes to accommodate inconsistent art.**

And its new corollary:

> **The player is 2 tiles tall. Every other size in this project is derived from that fact.**

---

**Sources for the Gen 3 figures:**
[Gen 3 battle sprite dimensions — PokéBase](https://pokemondb.net/pokebase/418580/what-are-the-dimensions-all-the-sizes-the-gen-battle-sprites) ·
[pokeemerald overworld sprite dimensions & 4bpp palette — PokéCommunity](https://www.pokecommunity.com/threads/tutorial-replacing-overworlds-and-adding-unique-palettes.425969/) ·
[GBA object/sprite hardware sizes — Tonc](https://www.coranac.com/tonc/text/objbg.htm)
