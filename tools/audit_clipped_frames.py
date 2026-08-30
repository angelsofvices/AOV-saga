"""★★★ CLIPPED-FRAME AUDIT · RP7

Finds sprite frames whose ART IS SHEARED BY THE CELL GRID -- pixels the artist
drew that fell outside the 313px cell and no longer exist in the file.

WHY THIS TOOL EXISTS
--------------------
Creator, 2026-08-30: *"fix the top of s1 rizer hair cropping when he jumps
facing up direction. we have to always remember that actions may cause the bb
to shift but never get bigger or smaller."*

`idle-jump.png` and `run-jump.png` have shipped since 2026-08-16 with Rizer's
hair sheared flat on the two AIRBORNE up-facing frames.  Nothing caught it,
because a bbox measured on the surviving pixels is a perfectly valid bbox --
the measurement was right, the ART was short.  You can only see it by asking a
different question: *does the content run into the wall of its own cell?*

WHAT COUNTS AS CLIPPED
----------------------
A boundary scanline of the cell carrying a CONTIGUOUS RUN of opaque pixels.
A drawn silhouette meets an edge at a point or a thin tip; a shear leaves a
flat band.  MIN_RUN is the line between the two.

WHY IT HAPPENS, AND THE PERMANENT FIX
-------------------------------------
The artist lifts the body inside the cell for an airborne pose, and the lift
pushes the crown out through the top.  The ENGINE already lifts the sprite
during a jump (`_jumpAmp`, +/-0.55 tile), so the art does not need to: a
re-render with the body at a CONSTANT height inside the cell removes the whole
failure mode.  That is the Creator's law stated as a drawing rule -- an action
may move the character inside the box, it may never resize the box.

    python3 tools/audit_clipped_frames.py [--all]
"""
import os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MIN_RUN   = 8    # contiguous opaque pixels on a cell wall = a flat shear, not a tip
MIN_CLEAR = 3    # a sibling frame must clear the wall by this much for the row
                 # to count as 'drawn to fit' -- below it, the row hugs the wall
ALPHA   = 20

EDGES = ('top', 'bottom', 'left', 'right')


def longest_run(mask):
    best = run = 0
    for v in mask:
        run = run + 1 if v else 0
        if run > best: best = run
    return best


def audit(path, rows=4, cols=4):
    im = Image.open(path).convert('RGBA')
    a = np.array(im)
    H, W = a.shape[:2]
    ch, cw = H // rows, W // cols
    op = a[..., 3] > ALPHA
    # ★ Not every PNG under assets/ is a keyed sprite sheet -- delivery renders
    # and _orig backups still carry their background, which is opaque to every
    # cell wall and would report as 16 frames sheared on all four sides.  A
    # sheet that is almost entirely opaque has not been keyed, so it has no
    # silhouette to test.
    if (~op).mean() < 0.10:
        return None, (cw, ch), im.size
    hits = []
    for r in range(rows):
        # ★★★ THE TEST IS THE CREATOR'S LAW, APPLIED WITHIN ONE ROW.
        #
        # "an action may shift the bb but never make it bigger or smaller."
        # A row IS one action in four frames, so every frame of it should keep
        # the same clearance from its cell walls.  Asking only "does this frame
        # touch a wall?" is useless -- plenty of sheets are authored to fill the
        # cell, and that flagged 449 healthy frames.  Asking "does THIS frame
        # touch a wall its SIBLINGS clear?" is the actual defect: the row was
        # drawn to fit, and one pose grew out through the side.
        clear = {}
        for c in range(cols):
            y0, x0 = r * ch, c * cw
            cell = op[y0:y0 + ch, x0:x0 + cw]
            if not cell.any():
                continue
            ys, xs = np.where(cell)
            clear[c] = {
                'top': int(ys.min()), 'bottom': int(ch - 1 - ys.max()),
                'left': int(xs.min()), 'right': int(cw - 1 - xs.max()),
                'runs': {'top':    longest_run(cell[0, :]),
                         'bottom': longest_run(cell[-1, :]),
                         'left':   longest_run(cell[:, 0]),
                         'right':  longest_run(cell[:, -1])},
            }
        if len(clear) < 2:
            continue
        for edge in EDGES:
            room = max(v[edge] for v in clear.values())
            if room < MIN_CLEAR:
                continue            # the whole row sits on this wall by design
            for c, v in clear.items():
                if v[edge] == 0 and v['runs'][edge] >= MIN_RUN:
                    hits.append((r, c, edge, v['runs'][edge], room))
    return hits, (cw, ch), im.size


DIR_ROW = ['DOWN', 'LEFT', 'RIGHT', 'UP']


def main():
    every = '--all' in sys.argv
    targets = []
    if every:
        for base, _dirs, files in os.walk(os.path.join(ROOT, 'assets', '2D sprites')):
            for f in sorted(files):
                if f.endswith('.png'):
                    targets.append(os.path.join(base, f))
    else:
        d = os.path.join(ROOT, 'assets', '2D sprites', 'rizer')
        targets = [os.path.join(d, f) for f in sorted(os.listdir(d)) if f.endswith('.png')]

    total = 0
    all_hits = []
    for p in targets:
        try:
            im = Image.open(p)
        except Exception:
            continue
        w, h = im.size
        # Square 4x4 character sheets only.  Note 1254 is NOT divisible by 4 --
        # the game's grid is 313px with two spare pixels at the far edge -- so
        # requiring divisibility here silently skipped every sheet in the game,
        # including the two this tool was written to find.
        if w != h or w < 4:
            continue
        try:
            hits, cell, size = audit(p)
        except Exception as e:
            print(f'  ! {os.path.relpath(p, ROOT)}: {e}')
            continue
        if hits is None or not hits:
            continue
        total += len(hits)
        for r, c, edge, run, room in hits:
            all_hits.append((run, room, os.path.relpath(p, ROOT), r, c, edge))

    all_hits.sort(reverse=True)

    # ★★ LOCOMOTION FIRST.  On an attack sheet a shear is usually the SLASH
    # running out of the cell, which the engine already handles (scaleRefBh /
    # cellAnchor) and which nobody notices.  On a locomotion sheet there is no
    # effect to blame: a flat edge is the CHARACTER, and the player sees it
    # every time he moves.  Those are the ones worth a re-render.
    BODY = ('idle', 'walk', 'run', 'jump', 'dodge', 'hurt', 'death')
    def is_body(rel):
        n = os.path.basename(rel)
        return any(n.startswith(b) for b in BODY)

    body = [h for h in all_hits if is_body(h[2])]
    print(f'★★★ BODY SHEETS · {len(body)} shear(s) · a flat edge here IS the character\n')
    for run, room, rel, r, c, edge in body[:20]:
        print(f'  {run:4d}px  {os.path.basename(rel):40s}  row {r} ({DIR_ROW[r]:5s}) col {c}'
              f'  {edge.upper():6s}  sibling clears {room}px')

    print(f'\n★ EFFECT SHEETS · {len(all_hits)-len(body)} shear(s) · mostly slash arcs'
          f' leaving the cell, which the engine expects\n')
    for run, room, rel, r, c, edge in [h for h in all_hits if not is_body(h[2])][:8]:
        print(f'  {run:4d}px  {os.path.basename(rel):40s}  row {r} ({DIR_ROW[r]:5s}) col {c}'
              f'  {edge.upper():6s}  sibling clears {room}px')

    print(f'\n{"="*78}')
    if total:
        print(f'{total} frame edge(s) run flat into a wall their own siblings clear.')
        print('Every one is art that does not exist in the file -- no bbox, anchor or')
        print('scale can bring it back.  They want a RE-RENDER with the body held at a')
        print('constant height inside its cell.')
    else:
        print('Clean.  Every frame keeps the same clearance as its siblings.')


if __name__ == '__main__':
    main()
