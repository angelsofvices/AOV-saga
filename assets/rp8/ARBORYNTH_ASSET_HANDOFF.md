# Arborynth Asset Creation Handoff

This document defines how visual assets are created, formatted, named, validated, and saved for the Arborynth game.

## Canonical asset directory

Save every finished game asset under:

`/Users/mctherockstar/Documents/GitHub/AOV-saga-new/assets/arboryth assets`

Use the established category folders:

- `animations/` — player animation sheets and equipped animation variants
- `character/` — single player-character images
- `verdant-creeper/` — all Verdant Creeper portraits and animation sheets
- `house/` — houses and building assets
- `crafting/` — placeable crafting stations
- `item/` — equipment, weapons, and ground-item images
- `tile/` — outdoor and indoor terrain tiles and tile previews
- `ref/` — world art, controller art, titles, and visual references

Create a new category folder only when no existing folder accurately fits the asset.

## Core visual language

Arborynth assets use polished, hand-painted pixel art with:

- Crisp, hard-edged pixel clusters
- Clear silhouettes readable at game scale
- Deep forest green, moss, olive, living bark brown, and muted gold
- Small cyan, violet, or toxic-lime magical accents
- Living wood, roots, vines, leaves, moss, mushrooms, and bioluminescent details
- A cozy enchanted-jungle feeling for friendly objects
- Corrupted forest growth for hostile creatures

Avoid blur, soft focus, smooth painted edges, antialias haze, bloom, fog, motion blur, photorealism, watermarks, and unrequested text.

## Background rule

All isolated characters, buildings, equipment, crafting stations, and animation sheets use:

`#FF00FF`

The background must be perfectly flat solid magenta from edge to edge:

- No gradient
- No vignette
- No texture or noise
- No cast shadow
- No floor plane
- No halo or glow spill
- No magenta inside the asset itself

Exception: full-coverage terrain tiles do not use magenta because the artwork must fill the complete tile.

## Animation-sheet standard

Directional row order is always:

1. Up / back view
2. Left profile
3. Right profile
4. Down / front view

### Four-frame sheets

- Grid: 4 columns × 4 rows
- Frames: 16
- Typical canvas: 1024 × 1024
- Cell size: 256 × 256

### Five-frame sheets

- Grid: 5 columns × 4 rows
- Frames: 20
- Canvas: 1280 × 1024
- Cell size: 256 × 256

Requirements:

- One complete sprite per cell
- Identical character scale across frames
- Equal spacing and consistent frame centers
- Stable anatomy, clothing, palette, and equipment
- Correct directional mirroring
- Nothing cropped
- No labels or grid lines in import-ready sheets
- Animation effects must remain inside their cells

For five-step actions, use a clear progression such as:

1. Ready/start
2. Wind-up/form
3. Main action/full state
4. Impact/follow-through
5. Recovery/hold

## Equipment compositing

When adding equipment to an existing sheet:

- Treat the character sheet as the strict geometry reference.
- Preserve the canvas, grid, poses, scale, clothing, hair, and spacing.
- Change only the equipped area.
- Adapt the equipment to the sheet’s pixel density.
- Attach equipment correctly to each hand/body location.
- Rotate and mirror it correctly in all directions.
- Never allow floating, duplicated, or detached equipment.

## Verdant Creeper design lock

The Verdant Creeper is a corrupted-forest grass zombie with:

- Cracked bark-like decayed skin
- Moss and short grass across the skull, shoulders, chest, and back
- Small leaves and thin vines around the limbs
- Muted violet mushrooms or spores
- Toxic green glowing eyes
- Occasional cyan or violet corruption nodes
- Torn charcoal trousers
- Root-wrapped limbs or exposed root details

Keep the same design, proportions, and palette across its portrait, walk, idle, attack, and future animation sheets.

## Tile standard

Import-ready ground tiles are:

- Exactly 32 × 32 pixels
- Square
- Orthographic top-down
- Flat and walkable unless otherwise specified
- Full coverage with no transparent or magenta background
- Seamless on all four edges
- Free of walls, characters, large objects, borders, or focal emblems

Also save a 512 × 512 enlarged preview beside each 32 × 32 tile when useful. The preview is for inspection only; the 32 × 32 file is the game asset.

## Creation workflow

1. Inspect the supplied reference at original resolution.
2. Record its exact dimensions, aspect ratio, grid, sprite scale, and frame order.
3. Generate or edit using the built-in image-generation workflow.
4. State strict invariants in the prompt: dimensions, layout, scale, pose, spacing, and protected visual details.
5. Apply Arborynth materials and palette without changing protected geometry.
6. Use solid `#FF00FF` for extraction assets.
7. Inspect the result for character consistency, frame count, readable action, clipping, blur, and background uniformity.
8. Resize the delivered image to the required exact dimensions when necessary.
9. Confirm final pixel width and height.
10. Save a working copy in the active workspace.
11. Copy the finished asset into its associated folder under the canonical asset directory.
12. Report the final clickable file path.

## Naming conventions

Use lowercase descriptive filenames with hyphens or follow an existing folder’s naming pattern.

Examples:

- `hands-of-thorne.png`
- `herbal-health-station.png`
- `verdant-creeper-attack-5step.png`
- `animation_arborynth_aura_block.png`
- `arborynth-home-wood-floor-32x32.png`

Use action and equipment names in animation filenames so code can distinguish variants.

Do not overwrite an unrelated existing asset. Use a new descriptive filename for variants.

## Final validation checklist

Before handing an asset to the coding task, confirm:

- Correct character or object identity
- Correct Arborynth theme
- Exact requested dimensions
- Correct number of frames
- Correct row and column order
- Consistent scale and alignment
- No cropped silhouettes or effects
- No blur or unwanted softness
- Uniform `#FF00FF` background where required
- No magenta contamination inside the asset
- No extra text, watermark, grid, or unintended objects
- Saved in the correct `arboryth assets` subfolder
- Final filename is clear and code-friendly

## Current examples

- `animations/animation_arborynth_aura_block.png` — 5×4 directional block sheet
- `animations/player-walk-hands-of-thorne.png` — equipped walk sheet
- `verdant-creeper/verdant-creeper-attack-5step.png` — 5×4 attack sheet
- `item/hands-of-thorne.png` — equippable melee item
- `crafting/herbal-health-station.png` — healing-item crafting station
- `tile/arborynth-jungle-ground-32x32.png` — outdoor ground tile
- `tile/arborynth-home-wood-floor-32x32.png` — interior floor tile

