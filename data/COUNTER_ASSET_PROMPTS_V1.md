# CIVIC COUNTER ASSETS · v1 · five prompts

The five generic district buildings share **one counter band**, set in code as
`CIVIC_COUNTER = { w: 7, row: 2, artH: 3.5 }` (rp7b.html). Every counter is the
same shape so the pattern reads across all ten districts.

---

## SHARED SPEC — applies to all five

```
Canvas 1792 x 896 px. Chroma key background: pure neon green #00FF00,
absolutely flat, no gradient, no shadow touching the edges.

The art occupies a 7-tile-wide by 3.5-tile-tall slot (256 px per tile),
sitting in the UPPER THIRD of a top-down RPG interior. Straight-on
front elevation, viewed from the room's floor looking north at the back
wall — the same flat, slightly-above eye line as classic 16-bit GBA
interiors. NO perspective vanishing point, NO isometric skew.

Vertical composition, bottom to top:
  · bottom ~1 tile  = the COUNTER FACE the player walks up to (this is the
                      solid row; it must read clearly as a barrier)
  · middle ~1.5 tiles = the counter top surface and what sits on it
  · top ~1 tile     = back shelving / wall fixtures mounted above

The piece is CENTRED and SYMMETRICAL-ish, and must not run off the left or
right edge of the canvas — leave 24-40 px of clean green on both sides so
it can be trimmed to its own bounding box.

Style: crisp 16-bit pixel art, hard black-brown outline, limited palette,
chunky readable shapes, dithered shading only where it earns it. No text,
no lettering, no signage typography, no watermark, no logo. No characters,
no people, no hands. Furniture only.
```

---

## 1 · INFIRMARY COUNTER · `counter-nurse.png`

Room: grey cobblestone floor, house-and-heart rug in green and cream.

```
[SHARED SPEC]

A hospital reception counter. Pale scrubbed stone-and-white-enamel front
panel with a soft mint-green trim line running its full width. The counter
top is a clean white surface holding a folded stack of bandage rolls, a
shallow steel tray of small glass phials with teal liquid, and a squat brass
hand-bell. Above it, a wall-mounted white cabinet with two glass doors
showing rows of teal and cream medicine bottles, a small first-aid cross
plaque in muted red, and a hanging bundle of dried herbs on the left.
Palette: white, warm cream, pale mint, teal glass, muted red accents, grey
stone. Clean, calm, well-kept — a village clinic, not a hospital ward.
```

---

## 2 · ZYSPHERE SHOP COUNTER · `counter-zysphere-shop.png`

Room: dark horizontal wood-plank floor, coin-bag rug in red and gold.

```
[SHARED SPEC]

A trader's shop counter. Dark stained oak front with iron banding and a
brass-cornered edge, worn where hands rest. The counter top holds a small
open-lid strongbox with a few gold coins spilling, a set of brass balance
scales, and ONE display stand cradling a single smooth sphere the size of an
apple — polished pale-blue glass with a faint inner swirl of light. Above,
open dark-wood shelving in three rows holding more of those spheres in neat
padded cradles, a coil of leather cord, and a hanging brass lantern on the
right. Palette: deep brown oak, black iron, warm brass and gold, one cool
pale-blue accent from the spheres. Cosy, cluttered, prosperous.
```

---

## 3 · POTION SHOP COUNTER · `counter-potion-shop.png`

Room: white speckled tile floor, heart-and-phial rug in white and teal.

```
[SHARED SPEC]

An apothecary counter. Pale weathered wood front with a scalloped apron and
verdigris copper corner caps. The counter top holds a brass mortar and
pestle, a small copper still with a curled condenser pipe, and three corked
bottles of different heights — one amber, one deep violet, one glowing
turquoise. Above, a tall apothecary rack of many small square cubbies, each
holding a stoppered vial in a different colour, plus a hanging bunch of
drying roots and a set of hooked measuring spoons. Palette: bleached wood,
verdigris green-copper, amber, violet, turquoise glass, warm cream. Busy,
alchemical, faintly glowing.
```

---

## 4 · TOWN HALL COUNTER · `counter-town-hall.png`

Room: cream stone-block floor, civic-building rug in blue and gold. **Room is
19 tiles wide — the counter is still 7 tiles, centred.**

```
[SHARED SPEC]

A civic records desk. Heavy pale limestone front with a carved fluted
pilaster at each end and a deep gold inlay line across the top edge. The
counter top is dark polished wood holding a large open leather-bound ledger,
a brass inkstand with two quills, a wax-seal stamp on a small block, and a
neat squared stack of rolled deeds tied with blue ribbon. Above, a wall of
pigeonhole document slots in dark wood with rolled scrolls in some of them,
flanked by two hanging navy banners with a plain gold laurel motif — NO
letters or numbers on the banners. Palette: cream limestone, navy blue,
antique gold, dark walnut, aged parchment. Formal, orderly, municipal.
```

---

## 5 · LODGE COUNTER · `counter-cottage-lodge.png`

Room: dark vertical wood-plank floor, tree-and-moon rug in tan and green.

```
[SHARED SPEC]

An inn's front desk. Chunky rough-hewn timber front with visible axe-marks
and two iron strap hinges, the wood warm and honey-toned. The counter top
holds an open guest ledger, a stubby lit candle in a dish, a wooden bowl of
apples, and a small hand-bell. Above, a key board — a plain plank with eight
iron hooks, five of them holding simple iron room keys on leather fobs — with
a folded stack of grey wool blankets on a shelf to the left and a hanging
bundle of dried lavender to the right. Palette: honey timber, black iron,
warm candle-orange, sage green, undyed wool. Rustic, warm, welcoming — a
mountain lodge, not a tavern.
```

---

## Notes for the drop-in

- Save each to `assets/2D sprites/decor/counters/`.
- The keyer handles the green: `python3 tools/key_greensheet.py SRC DST`.
- Bboxes get measured from the keyed PNG, and height is derived from the art's
  own aspect — never assumed — per [[image-never-stretch-console-fullscreen]].
- The band is data (`CIVIC_COUNTER`), so if a counter needs to be wider later,
  change it in one place and all five rooms follow.
