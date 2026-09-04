# REFERENCE IMAGE → RP7 PIXEL SPRITE SHEET · reusable prompt

Paste the block below into ChatGPT **together with the reference image**. Fill the
three `<<< >>>` slots and delete the variant blocks you don't need.

Every rule in it exists because the pipeline has caught that exact defect on a
delivered sheet — the audit script `tools/audit_sheet_frames.py` checks six of
them automatically, so a sheet that ignores this comes straight back.

---

## THE PROMPT

```
Convert the attached reference image into a pixel-art sprite sheet.

SUBJECT: <<< name · what it is · one line of silhouette description >>>
STYLE:   16-bit JRPG overworld sprite, GBA/SNES era. Chunky visible pixels,
         hard-edged shading, flat cel colour with 3–4 tone steps per material.
         NO smooth gradients, NO airbrush, NO anti-aliased soft edges.
         Read the reference for COLOUR, SILHOUETTE and CHARACTER only —
         do not copy its rendering style or its lighting.

CANVAS — these numbers are not negotiable:
  · 1254 × 1254 pixels, one single image
  · a 4 × 4 grid of 313 × 313 pixel cells
  · ROW 1 = facing DOWN (toward camera)
    ROW 2 = facing LEFT
    ROW 3 = facing RIGHT
    ROW 4 = facing UP (away, back of the head/body)
  · COLUMNS 1–4 = the four animation frames of that direction
  · <<< ANIMATION: idle breathing loop | walk cycle | grazing amble >>>

BACKGROUND:
  · Fill every pixel that is not the subject with FLAT PURE NEON GREEN
    #00FF00 — one exact colour, no gradient, no texture, no vignette.
  · This includes ENCLOSED GAPS: the space between an arm and the torso,
    inside a curled tail, between a raised weapon and the head. Those pockets
    must be the same #00FF00, not a darker green and not a shadow.
  · NO drop shadow, NO ground shadow, NO glow or rim-light bleeding onto the
    background. The engine draws its own shadow; a baked one doubles up.
  · No borders, no grid lines, no labels, no frame numbers, no watermark.

FRAME RULES — a sheet is rejected on any of these:
  1. GROUND LINE. Within a row, the character's FEET must sit on the exact
     same horizontal line in all four frames. Not approximately — the engine
     plants each frame on its own bottom edge, so a 4px difference makes the
     creature bob while standing still.
     (If the subject HOVERS or FLIES, keep this rule anyway and put the motion
     in the limbs, wings, flames or exhaust. The engine adds a smooth hover
     sine of its own; a bob baked into the frames fights it.)
  2. CONSTANT SIZE. The character is the same height and bulk in all sixteen
     frames. Do not make frame 1 a bigger "hero pose" — one oversized frame
     pops every single cycle.
  3. EVERY FRAME DIFFERS. No two consecutive frames may be near-identical.
     A four-frame cycle with two duplicates is a two-frame cycle that stalls.
  4. STAY IN THE CELL. All art for a frame lives inside its own 313×313 cell,
     with a few pixels of margin. Nothing may cross into a neighbouring cell.
  5. RIGHT MIRRORS LEFT. Row 3 must be the horizontal mirror of row 2, in the
     same frame order — not a redrawn near-copy, and not the same row twice.
  6. ONE PALETTE. Identical colours in every cell. No frame is lighter,
     warmer, or more saturated than its neighbours.
  7. CENTRED. The subject is horizontally centred in its cell and vertically
     seated so the feet are near the lower third — the same placement in
     every cell of a row.

Output the finished 1254 × 1254 sheet as a single PNG.
```

---

## VARIANT · ATTACK / COMBO SHEETS

Swap the animation line for this when the four columns are four *different*
strikes rather than four frames of one motion:

```
  · COLUMNS 1–4 = FOUR SEPARATE STRIKES, not four frames of one swing:
      1 <<< strike name · e.g. low slash >>>
      2 <<< e.g. lunging thrust — the longest reach >>>
      3 <<< e.g. rising cut — the tall one >>>
      4 <<< e.g. spinning finisher — carries the VFX arc >>>

  EVERY FRAME IS A FULLY EXTENDED HIT. No wind-ups, no recovery poses, no
  in-between frames. The engine HOLDS one column for the whole press, so a
  wind-up frame is never seen easing into anything — it is just a hesitation,
  frozen. Each of the four must read as contact on its own.

  The four must be distinguishable BY SILHOUETTE ALONE at 2 tiles tall —
  vary the width and the height between them, not just the arm angle.
```

---

## VARIANT · WEAPON IN HAND

Add this when the subject holds a sword, axe, staff or bow:

```
  WEAPON GEOMETRY. Keep the weapon's extent INSIDE the character's own
  silhouette box wherever the pose allows. If a blade must point below the
  boots or above the head, that is fine — but the FEET must still land on the
  row's ground line, and the boots must remain the widest solid mass at the
  bottom of the frame. Do not let a blade tip become the lowest thing in the
  cell in more than one frame per row.
```

---

## VARIANT · MAGENTA KEY

Use when the subject is green (a plant creature, a green-scaled beast):

```
  Replace #00FF00 with FLAT PURE MAGENTA #FF00FF everywhere the prompt says
  neon green. Same rules — flat, exact, including enclosed pockets.
```

---

## WHAT HAPPENS ON DELIVERY

Drop the PNG in and the pipeline runs:

| step | tool | what it catches |
|---|---|---|
| chroma key | `tools/key_sapphire_combo.py` | border flood-fill + sealed pockets + edge fringe |
| measure | `tools/measure_sheet_cells.py` | true cell-relative bboxes by component ownership |
| frame audit | `tools/audit_sheet_frames.py` | bleed · empty cells · dead frames · ground jitter · size outliers · facing |
| convention | `tools/audit_bbox_convention.js` | any table written in absolute coordinates |

★ **The keyer handles a soft anti-aliased edge and sealed background pockets**,
so a slightly imperfect key is recoverable. **Ground-line jitter, duplicate
frames and size outliers are not** — those are drawing decisions, and the only
fix is a redraw. Those three are worth restating to ChatGPT if a sheet comes
back wrong.

★ **A hovering subject still needs a flat ground line.** Learned on Mutamech
(v0.95.958): the old sheet encoded its hover by drawing one frame 14px higher
than the rest, which the engine reads as a pop rather than a float. The
corrected sheet has a flat ground line and *therefore idles almost perfectly
still* — its side rows change under 2% of their pixels between frames. That is
not a defect in the art, it is the hover having moved to `levitate: true` in the
bundle, where a sine is smooth, continuous, costs no frames, and cannot drift
out of sync with a ground line. **So for anything that floats: draw it flat and
animate the exhaust, the wings and the limbs, and let the engine do the rise.**

★ **Rows in the wrong order is the cheapest thing to get wrong and the most
annoying to find**, because a sprite facing the wrong way still looks like a
sprite. If in doubt, ask for the row order to be labelled in the chat reply
(never on the image itself).
