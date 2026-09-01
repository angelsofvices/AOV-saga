"""★★ GEM RESPRITE IMPORT · two chroma sheets → eight keyed gem sprites

Creator, 2026-09-01: *"I did a resprite of each gem. can u reimport them into
the game? make them a .5 the size of than prismshards/gemshards"*

TWO SHEETS, TWO DIFFERENT KEYS — and that is deliberate on his part:

    neon green  (1536x1024, 2x3)   red · yellow · white / purple · black · orange
    magenta     (1536x1024, 1x2)   green · blue

**No gem shares a background with its own hue.** Green and blue went on the
magenta sheet precisely so the green key could never eat them. Worth noticing,
because it is the thing that makes an automatic key safe here.

WHAT THIS DOES
 1 · border flood-key, RELAXED — the strict `is_chroma` test in
     tools/chroma_key_canon.py wants r<80 for neon green, and these renders
     anti-alias the background into the art across ~2px, so a strict test
     leaves a hard fringe. The flood still starts at the BORDER and stops at
     the first opaque body pixel, which is the canon rule
     ([[aov-chroma-key-canon]]) — only the *threshold* is loosened, never the
     "flood from outside" part.
 2 · DESPILL — pull the chroma channel down to max(other two) inside a thin
     band around the silhouette. Green spill on a red crystal reads as mud.
 3 · segment by connected component, not by a grid. The gems are hand-placed
     and not perfectly on thirds; measuring where they actually are beats
     assuming.
 4 · identify each component by POSITION (row, then column), because that is
     the order the Creator listed them in.
 5 · tight-crop each to its own alpha and write assets/2D sprites/decor/gem-*.png

    python3 tools/import_gem_resprites.py [--apply]
"""
import os, shutil, sys
import numpy as np
from PIL import Image
from collections import deque

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(ROOT, 'assets/2D sprites/decor')
UP = '/sessions/great-cool-heisenberg/mnt/uploads'

SHEETS = [
    dict(file='cc0b339a-334a-4ecf-b30e-13aeba79e77c-1788292728428_image.png',
         key='green', rows=2, cols=3,
         names=['red', 'yellow', 'white', 'purple', 'black', 'orange']),
    dict(file='13dc5f6f-be7c-4313-b8b6-85a8f8e50e81-1788292731668_image.png',
         key='magenta', rows=1, cols=2,
         names=['green', 'blue']),
]
APPLY = '--apply' in sys.argv
MIN_PX = 4000          # a gem; anything smaller is a stray keyed speck


def chroma_mask(a, key):
    """RELAXED background test. Loose enough to catch the anti-aliased skirt,
    tight enough that no gem body qualifies — checked per sheet below."""
    r, g, b = [a[..., i].astype(int) for i in range(3)]
    if key == 'green':
        # green dominates BOTH others by a wide margin. A white gem has r≈g≈b
        # and a black gem is dark and neutral, so neither can pass this.
        return (g > 120) & (g - r > 60) & (g - b > 60)
    # magenta · red AND blue both dominate green
    return (r > 120) & (b > 120) & (r - g > 60) & (b - g > 60)


def border_flood(mask):
    """Canon rule: the background is what the BORDER connects to. An enclosed
    pocket of chroma inside a crystal would survive this, which is correct —
    it gets handled explicitly, not by a blanket colour kill."""
    H, W = mask.shape
    seen = np.zeros((H, W), bool)
    dq = deque()
    for x in range(W):
        for y in (0, H - 1):
            if mask[y, x] and not seen[y, x]:
                seen[y, x] = True; dq.append((y, x))
    for y in range(H):
        for x in (0, W - 1):
            if mask[y, x] and not seen[y, x]:
                seen[y, x] = True; dq.append((y, x))
    while dq:
        y, x = dq.popleft()
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < H and 0 <= nx < W and mask[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True; dq.append((ny, nx))
    return seen


def despill(a, key, band):
    """Pull the chroma channel to max(other two) where the background bled in.
    ★ Only inside `band` — a ring around the silhouette. Applying it to the
    whole sprite would desaturate the GREEN gem on the magenta sheet's own
    terms, i.e. cure a fringe by damaging the art."""
    out = a.copy()
    rgb = out[..., :3].astype(int)
    if key == 'green':
        other = np.maximum(rgb[..., 0], rgb[..., 2])
        over = band & (rgb[..., 1] > other)
        rgb[..., 1] = np.where(over, other, rgb[..., 1])
    else:
        over = band & (rgb[..., 0] > rgb[..., 1]) & (rgb[..., 2] > rgb[..., 1])
        # magenta spill lifts R and B together; pull both to the green channel
        # only as far as the excess actually is
        for c in (0, 2):
            rgb[..., c] = np.where(over, np.minimum(rgb[..., c],
                                   np.maximum(rgb[..., 1], rgb[..., c] - 40)), rgb[..., c])
    out[..., :3] = rgb.astype(np.uint8)
    return out


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
            info[n] = dict(n=len(ys), y0=int(ys.min()), y1=int(ys.max()),
                           x0=int(xs.min()), x1=int(xs.max()),
                           cy=float(ys.mean()), cx=float(xs.mean()))
    return lab, info


def main():
    written = []
    for S in SHEETS:
        path = os.path.join(UP, S['file'])
        im = Image.open(path).convert('RGBA')
        a = np.array(im)
        print(f"\n  {S['key']:8s} sheet {im.width}x{im.height} · expecting "
              f"{S['rows']}x{S['cols']} = {len(S['names'])}")

        # ── 1 · key ─────────────────────────────────────────────────────────
        m = chroma_mask(a, S['key'])
        bg = border_flood(m)
        a[..., 3] = np.where(bg, 0, 255)
        print(f"    background {bg.mean()*100:5.1f}% of the sheet")

        # ── 2 · despill in a ring just inside the silhouette ─────────────────
        op = a[..., 3] > 0
        ring = np.zeros_like(op)
        for dy in range(-3, 4):
            for dx in range(-3, 4):
                ring |= np.roll(np.roll(bg, dy, 0), dx, 1)
        a = despill(a, S['key'], ring & op)

        # ── 3 · segment ─────────────────────────────────────────────────────
        lab, info = components(op)
        big = {k: v for k, v in info.items() if v['n'] >= MIN_PX}
        print(f"    components >= {MIN_PX}px: {len(big)}")
        if len(big) != len(S['names']):
            print(f"    ! expected {len(S['names'])} — refusing to guess which is which")
            for k, v in sorted(big.items(), key=lambda t: -t[1]['n'])[:12]:
                print(f"        {v['n']:8d}px  at ({v['cx']:.0f},{v['cy']:.0f})")
            continue

        # ── 4 · order by ROW then COLUMN · the order he listed them in ───────
        items = sorted(big.items(), key=lambda t: t[1]['cy'])
        ordered = []
        per = len(S['names']) // S['rows']
        for r in range(S['rows']):
            band = items[r * per:(r + 1) * per]
            ordered += sorted(band, key=lambda t: t[1]['cx'])

        for (cid, v), name in zip(ordered, S['names']):
            sub = a[v['y0']:v['y1'] + 1, v['x0']:v['x1'] + 1].copy()
            keep = (lab[v['y0']:v['y1'] + 1, v['x0']:v['x1'] + 1] == cid)
            sub[..., 3] = np.where(keep, sub[..., 3], 0)   # ★ this gem only
            out = Image.fromarray(sub, 'RGBA')
            dest = os.path.join(DEST, f'gem-{name}.png')
            # measure what we are about to ship
            px = sub[..., :3][keep].astype(float) / 255
            mx, mn = px.max(1), px.min(1)
            sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-9), 0)
            print(f"    gem-{name:7s} {out.width:4d}x{out.height:<4d} "
                  f"{v['n']:7d}px  meanSat {sat.mean():.2f}  lum {px.mean():.2f}")
            if APPLY:
                if os.path.exists(dest):
                    bak = os.path.join(DEST, '_orig')
                    os.makedirs(bak, exist_ok=True)
                    b = os.path.join(bak, f'gem-{name}-preresprite.png')
                    if not os.path.exists(b):
                        shutil.copy(dest, b)
                out.save(dest)
            written.append(name)

    print()
    if APPLY:
        print(f"  wrote {len(written)} gems · originals kept in decor/_orig/")
    else:
        print(f"  {len(written)} gems ready · run again with --apply to write them")


if __name__ == '__main__':
    main()
