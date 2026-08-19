# Reference tilesets · NOT wired into the game

Art kept for reference and style direction only. Nothing in this folder is
loaded by `rp7b.html`.

## waterfall-set-32px-REFERENCE.png

A top-down waterfall tileset: source lip, vertical fall, splash base, plunge
pool with river connections, cliff/rock variants, decorative details, plus
several pre-composed example assemblies.

**Why it is reference and not production:**

- **Native tile is 32×32. RP7 runs a 48px grid.** 48 ÷ 32 = **1.5**, a
  non-integer scale. Scaling pixel art by 1.5 doubles some pixel rows and not
  others, and on a *repeating* tile grid that unevenness shows on every seam.

**If it is ever used**, do NOT slice it as a tileset. Assemble the composition
at native 32px into a single image and place it as one `WORLD_PROPS` entry with
a `tileW`/`tileH` footprint — the way every existing building works (the Potion
Shop is a 1053px source drawn into a 7×7 tile box). Props are not grid-locked,
so it becomes one clean resample of a large image instead of 1.5× scaling
across hundreds of tile edges. The sheet's own "example assemblies" are already
exactly this shape.

**Site note**, if a Malezor waterfall is ever built: the north-east is already
occupied by the Scrapjaw radio tower at (38,14) and its scrap chest at (38,16).
Open ground sits just south-east — cols 32-40, rows 28-40 is 117 land tiles
with only 4 blocked by scattered trees.
