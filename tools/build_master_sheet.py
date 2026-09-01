"""★★★ MASTER-SHEET BUILDER · consolidate working frames from broken sheets

Creator, 2026-08-31: *"I like the variation in the kicks that chatgpt gave me
between these two sheets but they are framed incorrectly. can u construct it
between the two that it reads correctly on one master sheet? ... maybe we can
use this formula in the future to fix impassable animation sheets by
consolidating working frames into one master sheet."*

THE FORMULA
-----------
Generated sheets fail per FRAME, not per sheet. Two attempts at the same
animation will each have some cells framed correctly and some sheared, and the
good ones are rarely the same ones. So rather than re-rolling until one sheet
is perfect, take the best cell from each and assemble a master.

Each candidate cell is scored on three things, in order:

 1. SHEAR · a contiguous run of >= MIN_SHEAR opaque pixels on a cell wall.
    That is art the grid cut off, and no amount of repositioning brings it
    back, so a sheared cell loses to an unsheared one every time.
 2. WALL CONTACT · the longest run on any wall, as a tiebreak. Less contact
    means more margin for the engine's own anchoring to work with.
 3. FLOOR AGREEMENT · how far the cell's lowest pixel sits from the row's
    median. The engine plants a character by the bbox bottom, so a frame whose
    floor disagrees with its siblings is a frame that bounces.

THEN IT ALIGNS THE FLOORS
-------------------------
Picking alone is not enough: the winners can still disagree on where the ground
is. Every chosen cell is shifted vertically so the whole row lands on one floor
line -- but ONLY as far as its own margin allows, because shifting a frame into
its own wall would trade a bounce for a shear. Frames that cannot be fully
aligned are reported rather than forced.

WHAT IT WILL NOT DO
-------------------
Invent pixels. If every candidate for a cell is sheared, it says so and takes
the least-bad one. A sheet assembled from four bad frames is still a bad sheet,
and the report is what tells you to re-roll that one cell instead of the sheet.

    python3 tools/build_master_sheet.py out.png sheetA.png sheetB.png [...]
"""
import sys, os
import numpy as np
from PIL import Image

CELL      = 313
ROWS      = COLS = 4
ALPHA     = 20
MIN_SHEAR = 8      # contiguous px on a wall = cut, not a graze
SAFE_MARGIN = 2    # a row is never aligned closer than this to the cell floor
DIRS      = ['DOWN', 'LEFT', 'RIGHT', 'UP']


def longest_run(mask):
    best = run = 0
    for v in mask:
        run = run + 1 if v else 0
        if run > best:
            best = run
    return best


def cell_stats(op, r, c):
    sub = op[r * CELL:(r + 1) * CELL, c * CELL:(c + 1) * CELL]
    if not sub.any():
        return None
    ys, xs = np.where(sub)
    walls = {'top': longest_run(sub[0, :]), 'bottom': longest_run(sub[-1, :]),
             'left': longest_run(sub[:, 0]), 'right': longest_run(sub[:, -1])}
    return {'y0': int(ys.min()), 'y1': int(ys.max()),
            'x0': int(xs.min()), 'x1': int(xs.max()),
            'walls': walls, 'worst': max(walls.values()),
            'sheared': max(walls.values()) >= MIN_SHEAR}


def main():
    if len(sys.argv) < 4:
        raise SystemExit(__doc__)
    out_path, srcs = sys.argv[1], sys.argv[2:]
    sheets = []
    for p in srcs:
        im = Image.open(p).convert('RGBA')
        a = np.array(im)
        sheets.append({'name': os.path.basename(p), 'im': im, 'a': a,
                       'op': a[..., 3] > ALPHA})

    # ── measure every candidate ─────────────────────────────────────────
    stats = [[[cell_stats(s['op'], r, c) for s in sheets]
              for c in range(COLS)] for r in range(ROWS)]

    # ── row floor target = median of the UNSHEARED candidates ───────────
    print(f'  {"cell":6s} ' + ' '.join(f'{s["name"][:14]:>16s}' for s in sheets) + '   pick')
    picks = {}
    for r in range(ROWS):
        floors = [st['y1'] for c in range(COLS) for st in stats[r][c]
                  if st and not st['sheared']]
        target = int(np.median(floors)) if floors else None
        for c in range(COLS):
            cands = stats[r][c]
            best, bi = None, None
            for i, st in enumerate(cands):
                if st is None:
                    continue
                key = (st['sheared'], st['worst'],
                       abs(st['y1'] - target) if target is not None else 0)
                if best is None or key < best:
                    best, bi = key, i
            picks[(r, c)] = bi
            cells = []
            for i, st in enumerate(cands):
                if st is None:
                    cells.append(f'{"--":>16s}'); continue
                tag = f'w{st["worst"]:<3d} f{st["y1"]:<3d}'
                cells.append(f'{("CUT " if st["sheared"] else "    ")+tag:>16s}')
            mark = sheets[bi]['name'][:10] if bi is not None else '??'
            allcut = all(st is None or st['sheared'] for st in cands)
            print(f'  r{r}c{c}  ' + ' '.join(cells) + f'   {mark}'
                  + ('   ← every candidate cut · re-roll this frame' if allcut else ''))
        print(f'         {DIRS[r]} floor target {target}')

    # ── assemble, aligning each row to its floor target ─────────────────
    out = np.zeros((CELL * ROWS, CELL * COLS, 4), np.uint8)
    shifted = aligned = forced = 0
    for r in range(ROWS):
        floors = [stats[r][c][picks[(r, c)]]['y1'] for c in range(COLS)
                  if picks[(r, c)] is not None]
        target = int(np.median(floors)) if floors else None
        # ★★★ THE TARGET MUST NOT BE THE WALL.  On a row where most frames
        # already run to the cell floor, the median IS the floor -- and aligning
        # to it drags the one well-framed frame down onto the wall, which is the
        # tool making a good cell worse.  Pull the whole row up by the smallest
        # amount that clears the bottom, but only as far as the row's tightest
        # top margin allows: lifting a row into its ceiling just moves the shear.
        if target is not None and target > CELL - 1 - SAFE_MARGIN:
            want_up = target - (CELL - 1 - SAFE_MARGIN)
            headroom = min(stats[r][c][picks[(r, c)]]['y0'] for c in range(COLS)
                           if picks[(r, c)] is not None)
            target -= min(want_up, headroom)
        for c in range(COLS):
            i = picks[(r, c)]
            if i is None:
                continue
            st = stats[r][c][i]
            src = sheets[i]['a'][r * CELL:(r + 1) * CELL, c * CELL:(c + 1) * CELL]
            dy = 0
            if target is not None and st['y1'] != target:
                want = target - st['y1']
                # ★ only move as far as the frame's OWN margin allows -- pushing
                # a frame into its wall trades a bounce for a shear
                room_down = CELL - 1 - st['y1']
                room_up = st['y0']
                dy = max(-room_up, min(room_down, want))
                if dy != want:
                    forced += 1
                if dy:
                    shifted += 1
            tile = np.zeros_like(src)
            if dy >= 0:
                tile[dy:CELL] = src[0:CELL - dy]
            else:
                tile[0:CELL + dy] = src[-dy:CELL]
            out[r * CELL:(r + 1) * CELL, c * CELL:(c + 1) * CELL] = tile
            if target is not None and st['y1'] + dy == target:
                aligned += 1
    Image.fromarray(out, 'RGBA').save(out_path)
    print(f'\n  wrote {out_path}')
    print(f'  {aligned}/16 frames land exactly on their row floor · {shifted} shifted'
          + (f' · {forced} could not move the full distance' if forced else ''))


if __name__ == '__main__':
    main()
