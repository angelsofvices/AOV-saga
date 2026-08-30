"""★★★ MIRROR THE LEFT ROW ONTO THE RIGHT ROW · RP7 4x4 character sheets

Creator, 2026-08-30: *"left is good. mirror to right side."*

WHY IN THE ART AND NOT IN THE ENGINE
------------------------------------
The engine has a `mirrorRightAsLeft` flag, but only the NPC draw path honours
it.  The PLAYER draw is a plain drawImage with no flip branch anywhere, so a
flag would mean threading a mirror through drawW, the foot drop and the ground
shadow for every Rizer sheet in the game.  A per-cell flip solves it in the art,
once, for every consumer of the file.

★★ THE TRAP THIS TOOL EXISTS TO AVOID
-------------------------------------
Row 3 (UP) hair spikes OVERFLOW UPWARD into row 2's rectangle -- that is what a
negative `by` in BBOX_FALLBACK means.  A straight cell-for-cell overwrite of
row 2 therefore DELETES THEM.  On the walk sheet that was 4,298 pixels: the UP
bbox collapsed from by=-23 bh=172 to by=0 bh=149, the same signature as a
sheared frame.

So the mirror is done by COMPONENT OWNERSHIP -- the same law the bbox extractor
has used since v0.19.  Every connected component is assigned to the row holding
most of its pixels; anything inside row 2's rectangle that belongs to row 3 is
written back untouched after the flip.

It also REFUSES to flip when a LEFT frame touches a side wall, because then the
flip would sever whatever hangs outside the cell.

    python3 tools/mirror_left_to_right.py <sheet.png> [--rows 4] [--cols 4]
"""
import sys, os, shutil
import numpy as np
from PIL import Image
from collections import deque

LEFT_ROW, RIGHT_ROW = 1, 2
ALPHA = 20


def components_by_row(op, cell_h):
    """Label 8-connected components; return (labels, {label: owning_row})."""
    H, W = op.shape
    lab = np.zeros((H, W), np.int32)
    owner = {}
    n = 0
    for sy in range(H):
        for sx in np.where(op[sy] & (lab[sy] == 0))[0]:
            n += 1
            lab[sy, sx] = n
            dq = deque([(sy, sx)])
            rows = []
            while dq:
                y, x = dq.popleft()
                rows.append(y)
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        ny, nx = y + dy, x + dx
                        if 0 <= ny < H and 0 <= nx < W and op[ny, nx] and not lab[ny, nx]:
                            lab[ny, nx] = n
                            dq.append((ny, nx))
            rr = np.array(rows) // cell_h
            owner[n] = int(np.bincount(rr).argmax())
    return lab, owner


def mirror(path, rows=4, cols=4, backup=True):
    im = Image.open(path).convert('RGBA')
    a = np.array(im)
    H, W = a.shape[:2]
    ch, cw = H // rows, W // cols
    op = a[..., 3] > ALPHA

    # ── refuse if a LEFT frame touches a side wall ───────────────────────────
    for c in range(cols):
        cell = op[LEFT_ROW * ch:LEFT_ROW * ch + ch, c * cw:c * cw + cw]
        ys, xs = np.where(cell)
        if not len(xs):
            continue
        print(f'  LEFT col{c}: x {xs.min()}..{xs.max()}  y {ys.min()}..{ys.max()}  (cell 0..{cw-1})')
        if xs.min() == 0 or xs.max() == cw - 1:
            raise SystemExit(f'REFUSED · LEFT col{c} touches a side wall; an in-cell '
                             f'flip would sever what hangs outside it.')

    lab, owner = components_by_row(op, ch)
    band = slice(RIGHT_ROW * ch, (RIGHT_ROW + 1) * ch)

    # every pixel inside row 2's rectangle that belongs to ANOTHER row
    keep = np.zeros((ch, W), bool)
    for comp, row in owner.items():
        if row != RIGHT_ROW:
            keep |= (lab[band] == comp)
    print(f'  pixels inside row {RIGHT_ROW}\'s rectangle owned by another row: {int(keep.sum())}')

    if backup:
        d = os.path.join(os.path.dirname(path), '_orig')
        os.makedirs(d, exist_ok=True)
        dst = os.path.join(d, os.path.basename(path).replace('.png', '-delivered.png'))
        if not os.path.exists(dst):
            shutil.copy(path, dst)
            print(f'  delivered sheet kept at {os.path.relpath(dst)}')

    orig = a.copy()
    src_left = a[LEFT_ROW * ch:(LEFT_ROW + 1) * ch].copy()
    for c in range(cols):
        a[band, c * cw:(c + 1) * cw] = src_left[:, c * cw:(c + 1) * cw][:, ::-1]
    sub = a[band]
    sub[keep] = orig[band][keep]          # ★ hand the borrowed pixels back
    a[band] = sub

    Image.fromarray(a, 'RGBA').save(path)
    print('  mirrored LEFT -> RIGHT, foreign components preserved')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    mirror(sys.argv[1])
