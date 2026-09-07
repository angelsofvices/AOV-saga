#!/usr/bin/env python3
"""conform_cell_grid.py SRC DST [--src-cell N] [--dst-cell N]

★ Bring an off-standard sheet onto the 1254 / 313.5 grid WITHOUT RESCALING.

A bank carries ONE cellW/cellH and uses it for both its idle and its traversal
sheet, so a 1024 (cell 256) run sheet cannot sit next to a 1254 (cell 313.5)
idle. The obvious fix — scale 1024 → 1254 — is a 1.2246x non-integer resample
that destroys pixel art: every hard edge picks up a soft fringe and the whole
point of the medium goes with it.

★★ So each cell is COPIED, unscaled, into the centre of its larger slot. Every
pixel survives exactly; only the empty margin around it grows. The body ends up
smaller relative to its cell, which the bbox measurement then reports honestly
and runRefBh compensates for at draw time. Padding is a lie the measurement can
see through; resampling is one it cannot.
"""
import sys
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
SC = int(sys.argv[sys.argv.index('--src-cell')+1]) if '--src-cell' in sys.argv else 256
DC = 313.5

im = Image.open(src).convert('RGBA')
out = Image.new('RGBA', (int(DC*4), int(DC*4)), (0, 0, 0, 0))
for r in range(4):
    for c in range(4):
        cell = im.crop((c*SC, r*SC, (c+1)*SC, (r+1)*SC))
        x = int(round(c*DC + (DC-SC)/2))
        y = int(round(r*DC + (DC-SC)/2))
        out.paste(cell, (x, y))
out.save(dst)
print(f'{dst}: {SC}px cells centred in {DC}px slots · {out.size} · nothing resampled')
