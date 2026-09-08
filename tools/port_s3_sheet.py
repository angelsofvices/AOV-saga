#!/usr/bin/env python3
"""Port an S3 LUMINARY sheet: chroma-key -> measure -> emit the bundle block.

    python3 tools/port_s3_sheet.py <src.png> <name>      # name: walk|punch|kick|...

★★★ WHY THIS TOOL EXISTS RATHER THAN scripts/bake_sprite_alpha.py.
  That baker dilates its kill mask by one pixel to eat the magenta fringe. On
  the S3 art, 40 of the ~170 detached aura sparks are <=3px — a 1px dilation
  deletes them outright. Measured separation instead (greenness = g-max(r,b)):
  ALL art sits <= +10 (cyan aura -15, white hair -5, gold -40, gem -110) while
  the background spikes at 140..160. A soft ramp over 10..90 keeps every art
  pixel, kills every background pixel, and turns the fringe into PARTIAL ALPHA
  rather than a hard chop.

★★★ ROWS ARE ASSIGNED BY CENTROID, NOT BY THE FEET.
  The obvious rule — "the cell containing the feet" — broke on the very first
  sheet after idle. walk row 0's feet land at y=321, EIGHT PIXELS past the 313
  boundary, so y//313 filed all four frames under row 1 and four cells collided.
  A component's centroid is inside its own cell whether it overflows up (idle
  row 3, hair) or down (walk row 0, feet). Overflow is owned either way.

★ bodyBh EXCLUDES THE HAIR-WINGS, measured on the central 40% of the box. The
  engine scales every bundle so bodyBh[row] renders at a fixed ~92.9px; counting
  the wings shrinks the BODY (measured -10% on idle-UP). Same rule as idle, so
  he cannot change size when he starts moving.
"""
import sys, os
import numpy as np
from PIL import Image

C = 313
LOW, HIGH = 10.0, 90.0

def key(src, dst):
    im = np.array(Image.open(src).convert('RGB')).astype(np.float32)
    r, g, b = im[...,0], im[...,1], im[...,2]
    grn = g - np.maximum(r, b)
    a = np.clip(1.0 - (grn - LOW) / (HIGH - LOW), 0.0, 1.0)
    spill = grn > 5
    g2 = np.where(spill, np.maximum(r, b).astype(np.float32), g)
    out = np.dstack([r, g2, b]).astype(np.uint8)
    alpha = (a * 255).astype(np.uint8)
    out[alpha == 0] = 0
    Image.fromarray(np.dstack([out, alpha]), 'RGBA').save(dst)
    return alpha

def label(mask):
    H, W = mask.shape
    lab = np.zeros((H, W), dtype=np.int32); sizes=[0]; cur=0
    ys, xs = np.nonzero(mask)
    for i in range(len(ys)):
        sy, sx = ys[i], xs[i]
        if lab[sy, sx]: continue
        cur += 1; n = 0; st=[(sy,sx)]; lab[sy,sx]=cur
        while st:
            y,x = st.pop(); n += 1
            for ny in range(max(0,y-1), min(H-1,y+1)+1):
                for nx in range(max(0,x-1), min(W-1,x+1)+1):
                    if mask[ny,nx] and not lab[ny,nx]:
                        lab[ny,nx]=cur; st.append((ny,nx))
        sizes.append(n)
    return lab, np.array(sizes)

def main():
    src, name = sys.argv[1], sys.argv[2]
    # ★ v0.96.47 · optional 3rd arg = exact output stem, for sheets whose name
    #   is not "<key>-luminary" (astralslam-luminary-mori, and the VFX sheets)
    stem = sys.argv[3] if len(sys.argv) > 3 else f'{name}-luminary'
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dst  = os.path.join(root, 'assets/2D sprites/rizer', f'{stem}.png')
    orig = os.path.join(root, 'assets/2D sprites/rizer/_orig', f'{stem}-src.png')
    os.makedirs(os.path.dirname(orig), exist_ok=True)
    Image.open(src).save(orig)
    alpha = key(src, dst)
    op = alpha > 20
    print(f"  keyed · opaque {op.sum():,} ({100*op.mean():.1f}%) "
          f"· partial {(((alpha>0)&(alpha<255)).sum()):,}")
    rgb = np.array(Image.open(dst).convert('RGBA'))[...,:3].astype(int)
    grn = rgb[...,1] - np.maximum(rgb[...,0], rgb[...,2])
    left = ((alpha>128)&(grn>25)).sum()
    print(f"  green-cast opaque px remaining: {left}  {'CLEAN' if left==0 else '!! REMAINS'}")

    lab, sizes = label(op)
    comps=[]
    for i in range(1, len(sizes)):
        ys, xs = np.nonzero(lab==i)
        comps.append(dict(n=int(sizes[i]), y0=ys.min(), y1=ys.max(), x0=xs.min(), x1=xs.max(),
                          cy=(ys.min()+ys.max())//2, cx=(xs.min()+xs.max())//2))
    big   = [c for c in comps if c['n'] > 5000]
    small = [c for c in comps if c['n'] <= 5000]
    print(f"  components {len(comps)} · frames(>5000px) {len(big)} · sparks {len(small)}")
    if len(big) != 16:
        print(f"  !! expected 16 frame components, got {len(big)} — ABORT"); sys.exit(1)
    grid={}
    for c in big:                                     # ★ CENTROID, not feet
        grid[(min(3, c['cy']//C), min(3, c['cx']//C))] = c
    if len(grid) != 16:
        print(f"  !! cell collision — {len(grid)}/16 filled. ABORT"); sys.exit(1)

    rows=[]
    for r in range(4):
        row=[]
        for col in range(4):
            c = grid[(r,col)]
            x0,x1,y0,y1 = c['x0'],c['x1'],c['y0'],c['y1']
            for s in small:                            # sparks belong to their frame
                if min(3,s['cy']//C)==r and min(3,s['cx']//C)==col:
                    x0=min(x0,s['x0']); x1=max(x1,s['x1'])
                    y0=min(y0,s['y0']); y1=max(y1,s['y1'])
            row.append([int(x0-col*C), int(y0-r*C), int(x1-x0+1), int(y1-y0+1)])
        rows.append(row)

    body=[]
    for r in range(4):
        bx,by,bw,bh = rows[r][0]
        X0,Y0 = bx, r*C+by
        win = op[max(0,Y0):Y0+bh, X0:X0+bw]
        c0,c1 = int(bw*0.30), int(bw*0.70)
        ys2,_ = np.nonzero(win[:, c0:c1])
        body.append(int(ys2.max()-ys2.min()+1))

    print(f"\n  bboxes: [")
    for r in rows:
        print("    [" + ",".join(f"[{v[0]:4d},{v[1]:4d},{v[2]:4d},{v[3]:4d}]" for v in r) + "],")
    print("  ],")
    print(f"  bodyBh: {body},")
    print(f"\n  wrote {dst}")

main()
