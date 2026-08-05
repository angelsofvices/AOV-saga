#!/usr/bin/env python3
"""
Connected-component sprite bbox extractor for AOV 4x4 character sheets.

Emits a BBOX_FALLBACK dict for rp7b.html so drawPlayer can source each
character's ACTUAL pixel bounding box (which may overflow the cell edge
into neighboring cell space) rather than a cell-clipped rectangle.

Why: artists routinely draw hair spikes / capes / weapons that extend
past the cell boundary they were "assigned" to.  If we scope bbox
measurement strictly to the cell, we clip content and the character
looks squashed or truncated on screen.  Flood-fill labels every opaque
pixel of every connected shape, then we assign each shape to whichever
cell contains its BOTTOM-CENTER pixel (feet).  The reported bbox
captures the full shape.  Bonus: disconnected stray pixels (cape tails
with anti-aliased gaps) are separate components and get ignored.

Usage:
  python3 scripts/measure_sprite_bboxes.py assets/2D\\ sprites/rizer/idle.png \\
                                            assets/2D\\ sprites/rizer/walk.png \\
                                            assets/2D\\ sprites/rizer/run.png

Prints a paste-ready BBOX_FALLBACK JS block.  Assumes 4 cols x 4 rows.

See memory: aov-sprite-4x4-standard, aov-sprite-cc-extractor.
"""

from PIL import Image
from collections import defaultdict
import numpy as np
import json
import os
import sys

COLS = 4
ROWS = 4
MIN_COMPONENT_PIXELS = 200


def extract_by_components(path):
    im = np.array(Image.open(path))
    H, W = im.shape[:2]
    cw, ch = W // COLS, H // ROWS
    a = im[..., 3] > 0

    # Iterative BFS labeling · 8-connectivity
    labels = np.zeros((H, W), dtype=np.int32)
    next_label = 1
    for sy in range(H):
        for sx in range(W):
            if not a[sy, sx] or labels[sy, sx]:
                continue
            stack = [(sy, sx)]
            while stack:
                y, x = stack.pop()
                if y < 0 or x < 0 or y >= H or x >= W:
                    continue
                if not a[y, x] or labels[y, x]:
                    continue
                labels[y, x] = next_label
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        if dy == 0 and dx == 0:
                            continue
                        stack.append((y + dy, x + dx))
            next_label += 1

    # Bin components by feet-cell · keep largest per cell
    grid = defaultdict(list)
    for lbl in range(1, next_label):
        ys, xs = np.where(labels == lbl)
        size = len(ys)
        if size < MIN_COMPONENT_PIXELS:
            continue
        bx, by = int(xs.min()), int(ys.min())
        bw = int(xs.max()) - bx + 1
        bh = int(ys.max()) - by + 1
        feet_x = (bx + bx + bw - 1) // 2
        feet_y = by + bh - 1
        row, col = feet_y // ch, feet_x // cw
        if 0 <= row < ROWS and 0 <= col < COLS:
            grid[(row, col)].append((size, [bx, by, bw, bh]))

    # Convert sheet-space bboxes to cell-relative for BBOX_FALLBACK
    out = [[[0, 0, cw, ch] for _ in range(COLS)] for _ in range(ROWS)]
    for (r, c), comps in grid.items():
        comps.sort(key=lambda t: -t[0])
        bx, by, bw, bh = comps[0][1]
        out[r][c] = [bx - c * cw, by - r * ch, bw, bh]

    return out, cw, ch


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)

    lines = ['const BBOX_FALLBACK = {']
    for path in args:
        if not os.path.isfile(path):
            print(f'  SKIP (not found): {path}', file=sys.stderr)
            continue
        key = os.path.splitext(os.path.basename(path))[0]
        bboxes, cw, ch = extract_by_components(path)
        print(f'{path}  cell {cw}x{ch}', file=sys.stderr)
        for r, row in enumerate(bboxes):
            for c, bb in enumerate(row):
                overflow = ''
                if bb[1] < 0:
                    overflow += f' UP+{-bb[1]}'
                if bb[1] + bb[3] > ch:
                    overflow += f' DN+{bb[1] + bb[3] - ch}'
                print(f'  [{r},{c}] {bb}{overflow}', file=sys.stderr)
        lines.append(f'  {key}: [')
        for row in bboxes:
            lines.append(f'    {json.dumps(row)},')
        lines.append('  ],')
    lines.append('};')
    print('\n'.join(lines))


if __name__ == '__main__':
    main()
