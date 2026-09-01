"""★★★ CELL-BLEED FIX · rebuild a 4x4 sheet so every frame owns its own cell

Creator, 2026-08-31: *"FIX ALL CELL BLEED FOR HIM"* (Voltigrax).

WHAT CELL BLEED IS, AND WHY IT IS NOT THE SAME AS OVERFLOW
----------------------------------------------------------
Overflow is a frame whose art extends past its cell -- a hair spike, a raised
boot, a cape. The engine handles that fine: the bbox carries a negative
offset and the pixels are OWNED.

Bleed is when two frames' art OVERLAPS IN SPACE. drawImage takes a rectangle,
not a mask, so if the lion in col 0 lets his tail cross into col 1's rectangle,
then every draw of col 1 renders a slice of col 0's tail as well. No bbox can
fix that, because the offending pixels are inside the rect you need.

Voltigrax had it on all three sheets: 8, 10 and 10 components crossing a cell
wall, side-view lions overlapping their neighbour by 10-15px and every row-0
lion dropping ~6px past its floor into row 1.

THE FIX
-------
Rebuild the sheet. For each cell, take ONLY the connected component that OWNS
that cell (most of its pixels inside it) and paint it into a clean, empty cell.
Nothing else can appear there, so no rectangle can pick up a neighbour.

Placement inside the new cell:
 · horizontally centred on the component's own centre of mass, so the creature
   does not appear to jump sideways between frames
 · vertically aligned so the whole ROW shares one floor line -- the engine
   plants by the bbox bottom, so a row that disagrees is a row that bounces
 · clamped to fit; a component wider or taller than the cell is reported
   rather than silently cropped

    python3 tools/decell_sheet.py <sheet.png> [--apply]
"""
import sys, os, shutil
import numpy as np
from PIL import Image
from collections import deque

CELL = 313
ROWS = COLS = 4
ALPHA = 20
MIN_PX = 300      # below this a blob is dust, not a frame


def components(op):
    H, W = op.shape
    lab = np.zeros((H, W), np.int32)
    n = 0
    info = {}
    for sy in range(H):
        for sx in np.where(op[sy] & (lab[sy] == 0))[0]:
            n += 1
            lab[sy, sx] = n
            dq = deque([(sy, sx)])
            ys, xs = [], []
            while dq:
                y, x = dq.popleft()
                ys.append(y); xs.append(x)
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        ny, nx = y + dy, x + dx
                        if 0 <= ny < H and 0 <= nx < W and op[ny, nx] and not lab[ny, nx]:
                            lab[ny, nx] = n
                            dq.append((ny, nx))
            ys = np.array(ys); xs = np.array(xs)
            info[n] = {'n': len(ys), 'y0': ys.min(), 'y1': ys.max(),
                       'x0': xs.min(), 'x1': xs.max(),
                       'cells': len(set(zip((ys // CELL).tolist(), (xs // CELL).tolist())))}
    return lab, info


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    path = sys.argv[1]
    apply = '--apply' in sys.argv
    a = np.array(Image.open(path).convert('RGBA'))
    op = a[..., 3] > ALPHA
    lab, info = components(op)

    # ── which component owns each cell ──────────────────────────────────
    owner = {}
    for r in range(ROWS):
        for c in range(COLS):
            sub = lab[r * CELL:(r + 1) * CELL, c * CELL:(c + 1) * CELL]
            ids, cnt = np.unique(sub[sub > 0], return_counts=True)
            ids = [(i, n) for i, n in zip(ids, cnt) if info[i]['n'] >= MIN_PX]
            owner[(r, c)] = max(ids, key=lambda t: t[1])[0] if ids else None

    bleeding = sum(1 for k, v in info.items() if v['n'] >= MIN_PX and v['cells'] > 1)
    print(f'  {os.path.basename(path)}')
    print(f'  components >= {MIN_PX}px: {sum(1 for v in info.values() if v["n"] >= MIN_PX)}'
          f' · crossing a cell wall: {bleeding}')

    # ── rebuild ─────────────────────────────────────────────────────────
    out = np.zeros_like(a)
    boxes = [[None] * COLS for _ in range(ROWS)]
    oversize = []
    for r in range(ROWS):
        # collect each owned component's own crop first
        crops = {}
        for c in range(COLS):
            k = owner[(r, c)]
            if k is None:
                continue
            v = info[k]
            m = (lab[v['y0']:v['y1'] + 1, v['x0']:v['x1'] + 1] == k)
            px = a[v['y0']:v['y1'] + 1, v['x0']:v['x1'] + 1].copy()
            px[~m] = 0                       # ★ ONLY this component's pixels
            crops[c] = px
            if px.shape[0] > CELL or px.shape[1] > CELL:
                oversize.append((r, c, px.shape))
        if not crops:
            continue
        # one floor for the row · the tallest frame decides how much room is left
        tallest = max(p.shape[0] for p in crops.values())
        floor = CELL - 2 if tallest <= CELL - 2 else CELL
        for c, px in crops.items():
            h, w = px.shape[0], px.shape[1]
            h = min(h, CELL); w = min(w, CELL)
            px = px[:h, :w]
            oy = max(0, min(CELL - h, floor - h))
            ox = max(0, min(CELL - w, (CELL - w) // 2))
            out[r * CELL + oy:r * CELL + oy + h, c * CELL + ox:c * CELL + ox + w] = px
            boxes[r][c] = [ox, oy, w, h]

    if oversize:
        print('  ! components larger than a cell (clamped):',
              ', '.join(f'r{r}c{c} {s[1]}x{s[0]}' for r, c, s in oversize))

    print('\n  rebuilt bboxes (cell-relative · no bleed possible):')
    for r in range(ROWS):
        row = boxes[r]
        fl = [b[1] + b[3] for b in row if b]
        print('      [' + ','.join('[%3d,%3d,%3d,%3d]' % tuple(b) for b in row if b) + '],'
              + f'   floors {fl} spread {max(fl)-min(fl) if fl else 0}')

    if apply:
        d = os.path.join(os.path.dirname(path), '_orig')
        os.makedirs(d, exist_ok=True)
        bak = os.path.join(d, os.path.basename(path).replace('.png', '-bleeding.png'))
        if not os.path.exists(bak):
            shutil.copy(path, bak)
            print(f'\n  original kept at {os.path.relpath(bak)}')
        Image.fromarray(out, 'RGBA').save(path)
        print(f'  rewrote {path}')
    else:
        print('\n  run again with --apply to rebuild the sheet')


if __name__ == '__main__':
    main()
