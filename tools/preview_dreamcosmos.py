"""★★ DREAMLAND SKY PREVIEW · what the star field looks like under the clouds

Creator canon (aov-asset-preview-workflow): an asset is not delivered until it
has been shown IN THE GAME. There is no headless browser here, so this
reproduces drawDreamlandFloor's exact layer order in PIL:

    1 · the gradient fallback            (only visible if the cosmos fails)
    2 · the cosmos, tiled at 20 tiles/repeat, with the hold-then-blend fade
    3 · the DENSE cloud plate, 12 tiles/repeat
    4 · the BRIGHT cloud plate, revealed by the brightness ramp
    5 · both punched through by the density mask, bilinear-upscaled from one
        pixel per tile — which is what feathers the cloud edge

The density field is dumped straight out of the engine (/tmp/dl.json), so the
holes in this picture are the holes you can actually fall through.

    python3 tools/preview_dreamcosmos.py
"""
import json, os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = lambda p: os.path.join(ROOT, 'assets/2D sprites/tiles', p)

TILE = 48
VIEW_W, VIEW_H = 960, 528               # the engine canvas
COSMOS_REPEAT = 20 * TILE               # DREAM_COSMOS_TILES_PER_REPEAT
CLOUD_REPEAT  = 12 * TILE               # DREAMLAND_TILES_PER_REPEAT
HOLD = 0.65                             # DREAM_COSMOS_HOLD
PARALLAX = 0.12

D = json.load(open('/tmp/dl.json'))
SOLID, FEATHER, BRIGHT = D['solid'], D['feather'], D['bright']
dens = np.array(D['d'], dtype=float)


def tiled(path, repeat, size, crop=None, offset=(0, 0)):
    """One texture blown up to `repeat` px square, then tiled across `size`."""
    im = Image.open(A(path)).convert('RGB')
    if crop:
        im = im.crop(crop)
    im = im.resize((repeat, repeat), Image.LANCZOS)
    t = np.array(im)
    W, H = size
    ox, oy = offset
    ys = (np.arange(H) - oy) % repeat
    xs = (np.arange(W) - ox) % repeat
    return t[ys][:, xs]


def cosmos_frame(f):
    im = Image.open(A('dreamland-cosmos-2x2.png')).convert('RGB')
    c, r = f & 1, f >> 1                # row-major · TL TR BL BR
    cw, ch = im.width // 2, im.height // 2
    return (c * cw, r * ch, (c + 1) * cw, (r + 1) * ch)


def render(cam_x, cam_y, t_frac, out):
    # ── 2 · the sky · hold-then-blend between two frames ────────────────────
    i = int(t_frac) % 4
    j = (i + 1) % 4
    frac = t_frac - int(t_frac)
    blend = 0.0 if frac <= HOLD else (frac - HOLD) / (1 - HOLD)
    ox = int(-((cam_x * PARALLAX) % COSMOS_REPEAT))
    oy = int(-((cam_y * PARALLAX) % COSMOS_REPEAT))
    a = tiled('dreamland-cosmos-2x2.png', COSMOS_REPEAT, (VIEW_W, VIEW_H),
              cosmos_frame(i), (ox, oy)).astype(float)
    if blend > 0:
        b = tiled('dreamland-cosmos-2x2.png', COSMOS_REPEAT, (VIEW_W, VIEW_H),
                  cosmos_frame(j), (ox, oy)).astype(float)
        a = a * (1 - blend) + b * blend
    sky = a

    # ── 3/4 · the two cloud plates, world-anchored ──────────────────────────
    cox, coy = int(-(cam_x % CLOUD_REPEAT)), int(-(cam_y % CLOUD_REPEAT))
    dense  = tiled('dreamland-cloud-dense.png', CLOUD_REPEAT, (VIEW_W, VIEW_H),
                   None, (cox, coy)).astype(float)
    bright = tiled('dreamland-cloud.png', CLOUD_REPEAT, (VIEW_W, VIEW_H),
                   None, (cox, coy)).astype(float)

    # ── 5 · the masks · ONE PIXEL PER TILE, bilinear-upscaled ───────────────
    # ★ this is the trick that feathers the coastline.  A per-tile alpha would
    # give 48px squares; a tiny mask scaled up with smoothing gives the ramp.
    c0, r0 = cam_x // TILE, cam_y // TILE
    cols, rows = VIEW_W // TILE + 2, VIEW_H // TILE + 2
    sub = dens[r0:r0 + rows, c0:c0 + cols]
    m1 = np.clip((sub - (SOLID - FEATHER)) / FEATHER, 0, 1)
    m2 = np.clip((sub - SOLID) / max(1e-3, BRIGHT - SOLID), 0, 1)

    def up(m):
        im = Image.fromarray((m * 255).astype(np.uint8), 'L') \
                  .resize((VIEW_W + TILE, VIEW_H + TILE), Image.BILINEAR)
        # the half-tile offset puts each mask pixel's CENTRE on its tile centre
        return np.array(im)[TILE // 2:TILE // 2 + VIEW_H,
                            TILE // 2:TILE // 2 + VIEW_W].astype(float)[..., None] / 255.0

    M1, M2 = up(m1), up(m2)
    cloud = dense * (1 - M2) + bright * M2       # bright on the plateaus
    outimg = sky * (1 - M1) + cloud * M1         # punched through by density
    Image.fromarray(np.clip(outimg, 0, 255).astype(np.uint8), 'RGB').save(out)
    return float(M1.mean())


# a spot with a real coastline in it — plenty of cloud AND plenty of hole
best, bestx, besty = 9, 0, 0
for cy in range(0, 60, 4):
    for cx in range(0, 60, 4):
        s = dens[cy:cy + 11, cx:cx + 20]
        frac = float((s >= SOLID).mean())
        if abs(frac - 0.55) < best:
            best, bestx, besty = abs(frac - 0.55), cx, cy
print(f'  viewport at tile ({bestx}, {besty}) · '
      f'{(dens[besty:besty+11, bestx:bestx+20] >= SOLID).mean():.0%} solid')

OUT = '/sessions/great-cool-heisenberg/mnt/outputs'
cx, cy = bestx * TILE, besty * TILE
frames = []
for k, tf in enumerate([0.0, 1.0, 2.0, 3.0]):
    p = f'/tmp/dl_f{k}.png'
    render(cx, cy, tf, p)
    frames.append(Image.open(p))

# 1 · the in-game read
frames[0].save(f'{OUT}/dreamcosmos_ingame.png')

# 2 · a 2x2 contact sheet of the four frames as they appear IN SCENE, so the
#     twinkle can be compared frame to frame rather than described
sheet = Image.new('RGB', (VIEW_W * 2 + 12, VIEW_H * 2 + 12), (0, 0, 0))
for k, im in enumerate(frames):
    sheet.paste(im, ((k & 1) * (VIEW_W + 12), (k >> 1) * (VIEW_H + 12)))
sheet.save(f'{OUT}/dreamcosmos_frames.png')

# 3 · sky only, no cloud · what the layer actually is
sky_only = tiled('dreamland-cosmos-2x2.png', COSMOS_REPEAT, (VIEW_W * 2, VIEW_H),
                 cosmos_frame(0))
Image.fromarray(sky_only).save(f'{OUT}/dreamcosmos_sky.png')
print('  wrote dreamcosmos_ingame.png · dreamcosmos_frames.png · dreamcosmos_sky.png')
