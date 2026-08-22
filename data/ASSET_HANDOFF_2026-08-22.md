# AOV · RP7 — BATCHED ASSET HANDOFF
**Generated 2026-08-22 · against rp7b.html v0.95.730**

Every gap in this document was **measured against the live build**, not recalled.
Nothing here is a guess about what's missing.

Paste **§0** once at the top of a ChatGPT session, then paste batches underneath it.
Every batch inherits §0 — the individual prompts stay short on purpose.

---

## WHAT WAS ALREADY DONE (do not regenerate)

| Thing | Status |
|:--|:--|
| `decor/telescope.png` | ✅ shipped, placed, flipped, live |
| All **10** Seer Commander sheets | ✅ all ten on disk |
| 9 of 10 Gemlord cards | ✅ (Mutaryn is the only hole — Batch 3) |
| `tiles/dreamland-cloud.png` | ✅ shipped |
| Sapphire + Rubypaw sword sheets | ✅ de-fringed, bleed-trimmed, live |

**Not an art job — mine:** `elzoran.png` and `voltaryn.png` are already **on disk at
1254×1254** but were never registered in `SUMMONABLE_SPRITES`, which is the only
reason they render as orbs. That's a code fix on my side. Don't generate them.

---

# §0 · GLOBAL SPEC — READ FIRST, APPLIES TO EVERY SHEET

## Canvas
- **1254 × 1254 px**, PNG, no compression tricks.
- **4 × 4 grid.** Nominal cell **313.5 px**, but the engine reads cells at a
  flat **313**. That 0.5 px/cell drift accumulates to **2 px by column 3.**
- **ROWS = facing:** row0 **DOWN** (toward camera) · row1 **LEFT** · row2 **RIGHT** ·
  row3 **UP** (away, back of head).
- **COLUMNS = animation frames 0→3**, a clean loop (frame 3 must read back into frame 0).

## ★ THE ONE RULE THAT BREAKS SHEETS
**Never let one frame's art overlap the pixels of another frame.**

> **CORRECTED 2026-08-22.** An earlier version of this section said art touching
> a cell boundary is "severed by the engine". **That is wrong**, and Batch 2 was
> written on it. The engine does not clip to the cell: it computes
> `sx = col*cellW + bx`, `sy = row*cellH + by` and reads a `bw × bh` source rect
> with no clamp. A frame whose box runs past its cell simply samples the
> neighbouring *band* — which is harmless when that band is empty there, and
> several shipped sheets have always done it. What actually breaks a sheet is
> when the overrun lands on **another frame's artwork**, which then renders as a
> foreign limb attached to your character.

So the practical rule is unchanged in spirit — **keep a comfortable margin,
aim for ≥ 10 px** — but the reason matters: it is about not colliding with the
neighbour, not about the boundary itself. Generous margins are simply the
easiest way to guarantee that.

That includes: antennae, horns, wing tips, hair spikes, tails, cape trails,
projectiles, and any glow/aura. **The glow counts as art.** If a wing needs more
room, draw the creature smaller.

**Do not paint any part of the character in magenta or near-magenta.** Frosane's
breath wisps arrived painted in the chroma colour itself (opaque, rgb 224,95,237)
and had to be recoloured by hand; Aetherwing's translucent wings were a near
miss for the same reason.

## Background / chroma
- Background = **pure magenta `#FF00FF`**, flat, edge to edge, on all 16 cells.
- **No enclosed magenta pockets** — no magenta visible *through* a gap between a
  leg and a tail, through a ring, under an arch, between antennae. The keyer
  floods from the four corners; a sealed pocket survives and renders as a
  hot-pink hole. Close the gap or shift the pose.
- **No anti-aliased magenta fringe** on the silhouette perimeter. Hard edge.
  Two sheets shipped this month at 76 % and 78 % fringe and had to be repaired
  pixel by pixel.
- **No outline.** No black key line, no white sticker border, no drop shadow.
- **No ground shadow ellipse** — the engine draws its own.

## Framing & consistency
- Character **centred horizontally** in its cell, **feet near the cell bottom**
  (feet baseline ~ 88 % of cell height), same baseline in all 16 cells.
- **The creature must not change size between frames.** Frame-to-frame scale
  drift is the single most common defect; it makes the sprite pulse when it walks.
- One consistent light source, top-front-left, across all 16 cells.

## House art style (match the existing roster)
Painterly semi-realistic creature illustration — think a hand-painted trading-card
render, not flat pixel art and not cel-shaded anime. Rich material detail:
fur reads as fur, chitin reads as chitin. Every Zyrex wears **ornate metal and
gem accents** (banding, collars, inlays) in a colour that matches its type.
Reference sheets already in-repo: `assets/2D sprites/zyrex/verdanix.png`,
`otterlin.png`, `voltigrax.png`.

## Delivery
Deliver as **loose PNGs, one file per sheet, named exactly as specified.**
No zip nesting, no contact sheets, no upscaling. If a sheet fails a rule above,
it is faster to redraw it than for me to repair it.

---

# BATCH 1 · TWELVE WILD ZYREX OVERWORLD SHEETS
### ★ HIGHEST VALUE — DO THIS ONE FIRST

These twelve species are **catchable in the live build right now** and every one
of them renders as a **featureless coloured orb**, because no sprite exists. They
are the only obtainable Zyrex in the game with no body.

**Output:** `assets/2D sprites/zyrex/<id>.png` — 12 files, lowercase id, exact.

**Per-sheet:** the 4×4 is a **walk cycle** (contact → pass → contact → pass) in
all four facings. One sheet each is the deliverable. *Optional stretch if you have
time: `<id>-idle.png` and `<id>-run.png` in the identical format.*

Type drives the colour of the gem/metal accents:
`Creature` = chitinous, low on the food chain · `Beast` = apex/predatory ·
`Elemental` = raw element · `Corrupted` = rot/blight · `Crystal` = mineral ·
`Astra` = cosmic · `Tech` = machined.

| # | file | tier | type | design brief |
|:-|:--|:-:|:--|:--|
| 1 | `aetherwing.png` | 1 | Creature | Small winged hive-insect. Fast and light (SPD 80). Iridescent chitin, four thin wings, prominent antennae. **Keep wings and antennae well inside the cell.** Evolves into a rhino-beetle, so hint at a nub where the horn will be. |
| 2 | `frosane.png` | 1 | Elemental | Small frost waterfowl — cygnet-like, hoarfrost feathers, pale blue-white, breath fog. Delicate, not armoured. Silver-blue accents. |
| 3 | `gearbyte.png` | 1 | Tech/Astra | Small machined drone-construct. Exposed servos, brushed metal panels, a single star-blue optic. Hovers slightly — the "walk" cycle is a hover bob with limb sway. Copper + starlight-blue accents. |
| 4 | `dunestinger.png` | 1 | Beast | Desert stinger-beast. Very high attack for its tier (ATK 98) — all offence, no bulk. Sand-scoured plating, barbed tail carried high. Bronze + dun accents. |
| 5 | `gravvik.png` | 3 | Corrupted/Beast | Rotting scavenger hound. Heavy build, high defence (219). Matted hide, exposed blighted bone, sickly green seep. Tarnished iron accents. Evolves into #12 Skorrax — draw them as the same animal, young. |
| 6 | `cindercur.png` | 3 | Creature/Elemental | Ember-shelled hound-insect hybrid — canine posture, segmented carapace back. Cracks in the shell glow like banked coals. Blackened orange accents. |
| 7 | `grimhog.png` | 3 | Creature/Corrupted | Boar-shaped, with insect antennae and fungal rot blooming along its spine. The tankiest of the group (HP 239). Bristled, heavy, low to the ground. Bruise-purple + bone accents. |
| 8 | `vulcanax.png` | 3 | Creature/Crystal | Volcanic crystal tank — the highest defence here (269). Slow, hunched, armoured in fractured igneous crystal shards that glow molten at the seams. Obsidian + red-crystal accents. |
| 9 | `buzzolt.png` | 3 | Creature/Elemental | Electric hornet. Blistering speed (SPD 259). Sleek, streamlined, arc-lightning crackling between wing pairs. **Contain the arcs inside the cell.** Gold + electric-blue accents. |
| 10 | `astronyl.png` | 3 | Creature/Astra | Cosmic arthropod. Carapace like a window onto deep space — starfield inside the shell. Fast (SPD 249), elegant, weightless gait. Violet + silver-white accents. |
| 11 | `skybeam.png` | 4 | Beast/Elemental | Storm predator. Enormous attack (332) and speed (280). Horned, four-legged, aerodynamic; storm light gathered along its back. Evolves into a dragon — give it draconic bearing without wings yet. Storm-grey + white-gold accents. |
| 12 | `skorrax.png` | 5 | Corrupted/Beast | Apex corrupted beast — the adult of #5 Gravvik. Massive (ATK 367), crowned, blight-wreathed, unmistakably a king. Largest silhouette in this batch. Blackened iron + rot-green accents. |

---

# ~~BATCH 2 · SEER GRUNT UP-ROW REDRAW~~ · ✅ DELIVERED, AND PARTLY UNNECESSARY

**Closed 2026-08-22 at v0.95.735.** All six re-delivered, re-measured, live.

**My ask was built on a wrong premise** — see the correction in §0. I reported
the UP row as "touching the cell top, severed by the engine". The engine does not
sever anything, and a re-run of my own diagnostic against the committed art shows
the up-row margin was already a consistent **9 px**, not 0. The original 0 came
from a measurement I did not check hard enough.

**The redraw still helped, and here is exactly how much:**

| sheet | up-row top | cells overrunning |
|:--|:--|:--|
| a-idle / a-walk | 0 → 9 px | 8 → 4 |
| a-run | 0 → 9 px | 4 → 4 |
| **b-idle / b-walk / b-run** | 0 → 9 px | **4 → 0** |

Grunt B is now entirely inside its cells. Grunt A's remainder is its DOWN row
feet reaching ~12 px into the band below, where there is no art — harmless, and
it shipped that way before. Scale held: A `standBh` 212 unchanged, B re-measured
256 → **255** (1 px). `scaleMul` untouched at 1.075 / 1.150.

The two `-attack` sheets were never regenerated and did not need to be.

---

# BATCH 3 · MUTARYN GEMLORD CARD (1 FILE)

Nine of ten Gemlord cards exist. Mutaryn is the hole, and **Andrannor's cave door
currently toasts instead of opening a card.** This one file closes a live gap.

**Output:** `assets/2D sprites/decor/gemlords/mutaryn.png`
**Format:** **portrait card, ~1060 × 1484 px** — match the existing nine exactly.
Look at `azurel.png`, `emeralix.png`, `obsidius.png` in that folder and match the
frame, the border treatment, the proportions, and the full-bleed art approach.

**Not a sprite sheet.** No magenta — this is a finished card with its own frame.
Full-art front, roughly 70 % open art per the TCG spec.

**Subject:** Mutaryn, Gemlord of Andrannor. Andrannor is the nightclub/inner-city
district (Club 50, faedust trade) — a Gemlord of change and shifting form fits the
district's character. Same regal scale and gravitas as the other nine: this is a
throne-holder, not a monster.

---

# BATCH 4 · DREAMLAND SET DRESSING (5 TILES/PROPS)

The Dreamland level is **built and walkable** — 100 × 100 cloud tiles, entered via
the treehouse telescope, timer scaled to Rizer level. It has **exactly one asset**
(the cloud tile) and nothing else in it. These give it a horizon.

All five: **magenta background, no outline**, single PNG each (not sheets),
painterly to match the house style. Palette is the Blue-Gem vision plane —
deep indigo, moonlit silver, pale gold. Everything should read as **slightly
unreal**: soft edges, no hard ground contact.

| file | spec |
|:--|:--|
| `assets/2D sprites/decor/dream-spire.png` | ~4×6 tiles. A tall floating rock spire with its base tapering into nothing. Landmark scale — visible across the map. |
| `assets/2D sprites/decor/dream-arch.png` | ~3×3 tiles. A freestanding stone archway standing on cloud, leading nowhere. **No enclosed magenta through the arch opening** — that's the pocket trap. |
| `assets/2D sprites/decor/dream-crystal.png` | ~1×2 tiles. A slow-drifting suspended crystal shard, faint inner light. Scatter prop. |
| `assets/2D sprites/decor/dream-tree.png` | ~2×3 tiles. A bare pale tree with no leaves and roots that trail off into vapour. |
| `assets/2D sprites/tiles/dreamland-cloud-dense.png` | Seamless tile, same dimensions as the existing `dreamland-cloud.png`. A **denser, darker** variant so the map can have terrain variation instead of one flat texture. Must tile seamlessly against itself **and** against the existing cloud tile. |

---

# BATCH 5 · SEER-BLACK INTERIOR SET (3 FILES)

The Seer HQ interiors currently use **warm wooden stairs against black masonry** —
the stairs read as borrowed from a different building. This is the smallest batch
and purely a polish pass; do it last.

Palette: matte black stone, cold steel, and the Seer accent — a single desaturated
violet. No warm tones anywhere.

| file | spec |
|:--|:--|
| `assets/2D sprites/interior/seer-stairs-up.png` | ~2×3 tiles. Black stone ascending staircase, steel edging, violet underlighting on the risers. Top-down-ish 3/4 to match existing interior props. |
| `assets/2D sprites/interior/seer-stairs-down.png` | Same, descending. Must read as unambiguously *down* at a glance. |
| `assets/2D sprites/interior/seer-door-locked.png` | ~1×2 tiles. Heavy sealed black door with a visible keyhole mechanism and a violet indicator. This is the 2F door the per-district Seer Key opens — it must **look locked**. |

---

# PRIORITY ORDER IF TIME IS SHORT

1. **Batch 1** — twelve catchable creatures currently rendering as orbs. Nothing
   else on this list affects the player as directly.
2. **Batch 2** — six sheets with a measured, visible clipping defect in shipped art.
3. **Batch 3** — one file, unblocks a dead interaction.
4. **Batch 4** — content for a level that exists and is empty.
5. **Batch 5** — polish.

## When files come back
Drop them anywhere in the workspace. I will, per sheet: verify the 4×4 geometry,
chroma-key and de-fringe, run the connected-component bbox extractor (which
captures overflow like antennae and tails by **component ownership**, not by
cell-clipping), check for cell bleed, register the sprite, and render an in-game
preview for approval before it's considered done.
