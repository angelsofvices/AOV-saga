"""★★★ OVERWORLD BLUEPRINT · composite the whole world from the real assets

Creator, 2026-09-01: *"can you send me a full current tile map screenshot of the
game? full assets and everything wired. birds eye view 2d map full scale tile.
overworld blueprint 16:9 AR"*

WHY THIS IS NOT A SCREENSHOT
----------------------------
The world is 1020 x 800 tiles at TILE=48 -- 48,960 x 38,400 px, 1.9 gigapixels.
No canvas holds that, and there is no headless browser in this sandbox to stitch
one from (the npm registry is blocked, so playwright cannot be installed).

So `tools/export_worldmap.js` boots rp7b.html's real script against a stubbed
DOM and dumps what the overworld WOULD draw -- the land mask, the district per
tile, every prop's sheet + crop + tile position, every overworld NPC's sprite
bank -- and this composites it from the same PNG files the engine loads. Same
assets, same placement, arbitrary scale.

★ THE ARITHMETIC IS COPIED FROM THE ENGINE, NOT RE-INVENTED
Every position here reproduces a specific function in rp7b.html:
  · terrain variant  · drawDistrictTerrainTile's imul hash, so the tile variety
                       matches the game tile for tile rather than being random
  · props            · drawProp  (bottom-centre on the tile, aspect from bbox)
  · npcs             · drawNPC   (scaleRefBh -> _downScale, cellAnchor + foot
                       baselines, rowMap)
  · depth            · drawWorldLayer's footY sort, canopy second pass included
A second copy of the maths that DRIFTS is worse than no picture, so where the
engine does something surprising (the foot baseline, the canopy lift) this does
the surprising thing too.

    python3 tools/render_worldmap.py [--px 16] [--out FILE] [--data FILE]
"""
import json, math, os, sys, time
import numpy as np
from PIL import Image
from urllib.parse import unquote

Image.MAX_IMAGE_PIXELS = None          # this is a big picture on purpose

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENGINE_TILE = 48                       # rp7b.html TILE
VOID_SRC = 'assets/2D sprites/tiles/void-sea/void-ocean-flow-4x4.png'
RIVER_SRC = 'assets/2D sprites/tiles/ocean-flow-4x4.png'
TREE_CANOPY_LIFT = 2                   # drawWorldLayer
DIR_ROW_NPC = {'down': 0, 'left': 1, 'right': 2, 'up': 3}


def arg(flag, default):
    return sys.argv[sys.argv.index(flag) + 1] if flag in sys.argv else default


PX   = int(arg('--px', 16))            # output pixels per tile
DATA = arg('--data', '/tmp/worldmap.json')
OUT  = arg('--out', '/tmp/rp7-overworld.png')
SCALE = PX / ENGINE_TILE               # engine px -> output px

_t0 = time.time()
def log(msg):
    print(f'  [{time.time()-_t0:6.1f}s] {msg}', flush=True)


# ── asset loading ───────────────────────────────────────────────────────────
_cache = {}
def load(src):
    """Open an asset by the URL the engine used.  Paths are percent-encoded in
    the source (the folder is literally '2D sprites', with a space)."""
    if src in _cache:
        return _cache[src]
    p = os.path.join(ROOT, unquote(src))
    try:
        im = Image.open(p).convert('RGBA')
    except Exception as e:
        print(f'  ! missing asset {src} ({e})')
        im = None
    _cache[src] = im
    return im


_sprite_cache = {}
def sprite(src, bbox, w, h, mirror=False):
    """Crop + resize once per (asset, crop, size).  The world is 2,267 trees and
    3,816 bushes drawn from a handful of files at a handful of sizes, so the
    cache is the difference between a minute and an hour."""
    key = (src, tuple(bbox) if bbox else None, w, h, mirror)
    hit = _sprite_cache.get(key)
    if hit is not None:
        return hit
    im = load(src)
    if im is None or w < 1 or h < 1:
        _sprite_cache[key] = None
        return None
    if bbox:
        bx, by, bw, bh = [int(v) for v in bbox]
        # ★ negative offsets are legal — a bbox may start above/left of its cell
        # when the art overflows (see aov-sprite-cc-extractor).  PIL clamps, so
        # crop through a transparent pad rather than letting it shift the art.
        box = (bx, by, bx + bw, by + bh)
        if bx < 0 or by < 0 or bx + bw > im.width or by + bh > im.height:
            pad = Image.new('RGBA', (max(im.width, bx + bw) - min(0, bx),
                                     max(im.height, by + bh) - min(0, by)), (0, 0, 0, 0))
            pad.paste(im, (-min(0, bx), -min(0, by)))
            box = (bx - min(0, bx), by - min(0, by),
                   bx - min(0, bx) + bw, by - min(0, by) + bh)
            im = pad
        im = im.crop(box)
    im = im.resize((w, h), Image.LANCZOS)
    if mirror:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    _sprite_cache[key] = im
    return im


# ── load the export ─────────────────────────────────────────────────────────
log(f'reading {DATA}')
D = json.load(open(DATA))
M = D['meta']
# ★ origin-relative grid · the world starts at (-100, -45), not (0, 0)
ORIGIN_X = M.get('originX', 0)
ORIGIN_Y = M.get('originY', 0)
COLS = M.get('cols', M['mapCols'] - ORIGIN_X)
ROWS = M.get('rows', M['mapRows'] - ORIGIN_Y)
DISTRICTS = M['districts']
log(f'world {COLS} x {ROWS} tiles from origin ({ORIGIN_X}, {ORIGIN_Y}) · '
    f'{len(DISTRICTS)} districts · {len(D["props"])} props · {len(D["npcs"])} npcs')

WORLD_W, WORLD_H = COLS * PX, ROWS * PX
# 16:9, pillarboxed.  The world is 1.275:1 — TALLER relative to its width than
# 16:9 — so the height governs and the padding goes on the sides.
# ★ never stretch to fill (aov canon: native aspect, letterbox, never cover).
CANVAS_H = WORLD_H
CANVAS_W = int(round(CANVAS_H * 16 / 9))
if CANVAS_W < WORLD_W:                 # would only happen at an odd aspect
    CANVAS_W = WORLD_W
    CANVAS_H = int(round(CANVAS_W * 9 / 16))
OFF_X = (CANVAS_W - WORLD_W) // 2
OFF_Y = (CANVAS_H - WORLD_H) // 2
log(f'world {WORLD_W} x {WORLD_H} → 16:9 canvas {CANVAS_W} x {CANVAS_H} '
    f'({CANVAS_W*CANVAS_H/1e6:.0f} MP) · pillarbox {OFF_X}px each side')


# ── 1 · terrain, in numpy ───────────────────────────────────────────────────
# 348k land tiles is too many for one PIL paste each.  Instead: build the world
# as a (ROWS, PX, COLS, PX, 3) array — which reshapes for free into the image —
# and assign whole (district, variant) sets at once with a boolean mask.
log('terrain · building district + variant grids')
rows = D['rows']
dist_idx = {d: i for i, d in enumerate(DISTRICTS)}
Dg = np.full((ROWS, COLS), -1, np.int16)
for y, line in enumerate(rows):
    a = np.frombuffer(line.encode('latin-1'), np.uint8)
    Dg[y] = np.where(a == ord('.'), -1, a.astype(np.int16) - 97)

# drawDistrictTerrainTile's variant hash · Math.imul(tx,73856093) ^ Math.imul(ty,19349663)
xs = np.arange(ORIGIN_X, ORIGIN_X + COLS, dtype=np.int64)
ys = np.arange(ORIGIN_Y, ORIGIN_Y + ROWS, dtype=np.int64)
def imul(a, k):                        # JS Math.imul · 32-bit signed multiply
    return ((a * k) & 0xFFFFFFFF).astype(np.int64)
V = ((imul(xs[None, :], 73856093) ^ imul(ys[:, None], 19349663)) & 15).astype(np.int8)

def tile_variants(src, inset_px):
    """Slice a 4x4 terrain sheet into 16 PX-square tiles the way the engine
    samples it — with the same inset, so the sheets' faint cell guides do not
    become dark seams."""
    im = load(src)
    if im is None:
        return None
    cw, ch = im.width / 4, im.height / 4
    out = []
    for v in range(16):
        c, r = v & 3, v >> 2
        box = (c * cw + inset_px, r * ch + inset_px,
               (c + 1) * cw - inset_px, (r + 1) * ch - inset_px)
        out.append(np.array(im.crop([int(round(b)) for b in box])
                              .resize((PX, PX), Image.LANCZOS).convert('RGB')))
    return out

def flat_tile(src):
    im = load(src)
    if im is None:
        return None
    return np.array(im.resize((PX, PX), Image.LANCZOS).convert('RGB'))

# void sea first · it is what every non-land tile shows
log('terrain · void sea')
void = tile_variants(VOID_SRC, 1.5)
world = np.empty((ROWS, PX, COLS, PX, 3), np.uint8)
Wv = world.transpose(0, 2, 1, 3, 4)               # (ROWS, COLS, PX, PX, 3) view
if void:
    # the ocean animates on a 16-frame loop; a still frame is frame 0 everywhere,
    # which is exactly what one moment of the game looks like.
    # ★ broadcast through the TRANSPOSED view: `world[:] = tile` would try to
    # match a (PX,PX,3) tile against (ROWS,PX,COLS,PX,3), which is the wrong
    # axis order.  Wv's last three axes ARE the tile.
    Wv[:] = void[0]
else:
    world[:] = np.array([9, 5, 34], np.uint8)     # drawOceanUnderlayer's fallback

log('terrain · districts')
for d, i in dist_idx.items():
    mask = (Dg == i)
    n = int(mask.sum())
    if not n:
        continue
    t = D['terrain'].get(d) or {}
    vs = tile_variants(t['sheet'], 2) if t.get('sheet') else None
    if vs:
        for v in range(16):
            m = mask & (V == v)
            if m.any():
                Wv[m] = vs[v]
    else:
        base = flat_tile(t['base']) if t.get('base') else None
        if base is not None:
            Wv[mask] = base
    log(f'   {d:10s} {n:7d} tiles · {"4x4 sheet" if vs else "flat tile"}')

# the Veridan freshwater river sits on top of the grass it cuts through
log('terrain · veridan river')
riv = tile_variants(RIVER_SRC, 1.5)
if riv and D['river']:
    rm = np.zeros((ROWS, COLS), bool)
    rx = np.array([p[0] - ORIGIN_X for p in D['river']])
    ry = np.array([p[1] - ORIGIN_Y for p in D['river']])
    ok = (rx >= 0) & (rx < COLS) & (ry >= 0) & (ry < ROWS)
    rm[ry[ok], rx[ok]] = True
    Wv[rm] = riv[0]

# ── the 16:9 canvas ─────────────────────────────────────────────────────────
# ★ the world is pasted onto a 16:9 field of the SAME void sea rather than onto
# black bars.  The world is 1.275:1 — taller relative to its width than 16:9 —
# so the padding is on the sides, and filling it with ocean makes the frame read
# as more Void Sea instead of as a letterbox someone forgot to crop.
log('canvas · tiling the void across the 16:9 field')
vt = np.array(load(VOID_SRC).crop((1, 1, load(VOID_SRC).width // 4 - 1,
                                   load(VOID_SRC).height // 4 - 1))
                            .resize((PX, PX), Image.LANCZOS).convert('RGB')) \
     if load(VOID_SRC) else np.array([[[9, 5, 34]]], np.uint8)
# ★ one full-width STRIP tiled sideways, then broadcast down.  np.tile of the
# whole canvas plus the ascontiguousarray copy it needs would be two 874 MB
# allocations at 16 px/tile, on top of the 627 MB world array — this is one.
_strip = np.tile(vt, (1, CANVAS_W // PX + 1, 1))[:, :CANVAS_W]
canvas = np.empty((CANVAS_H, CANVAS_W, 3), np.uint8)
canvas.reshape(CANVAS_H // PX, PX, CANVAS_W, 3)[:] = _strip
img = Image.fromarray(canvas, 'RGB')
del canvas, _strip
img.paste(Image.fromarray(world.reshape(ROWS * PX, COLS * PX, 3), 'RGB'), (OFF_X, OFF_Y))
del world, Wv
log('terrain · done')


# ── 2 · depth-sorted overlay pass ───────────────────────────────────────────
# drawWorldLayer sorts everything by footY and draws in that order, so a prop in
# front covers one behind.  Trees get a SECOND pass lifted two rows so their
# canopy sits over the meadow while the trunk base stays swallowed by it.
log('building the render list')
render = []
for p in D['props']:
    render.append((p['y'] + p.get('depth', 0), 0, 'prop', p))
    if p.get('tree'):
        render.append((p['y'] + TREE_CANOPY_LIFT, 1, 'canopy', p))
for n in D['npcs']:
    render.append((n['y'], 0, 'npc', n))
render.sort(key=lambda r: (r[0], r[1]))
log(f'{len(render)} draws (props + canopies + npcs)')


# ★ ONE conversion from absolute tile space to canvas pixels, here, so no draw
# function has to remember the origin.  ORIGIN is in TILES, OFF is the 16:9
# pillarbox in PIXELS — mixing those two up is exactly the bug this centralises
# away from.
ORIGIN_PX_X = ORIGIN_X * PX
ORIGIN_PX_Y = ORIGIN_Y * PX
def paste(sp, x, y):
    if sp is None:
        return
    img.paste(sp, (int(x) - ORIGIN_PX_X + OFF_X, int(y) - ORIGIN_PX_Y + OFF_Y), sp)


def draw_prop(p, canopy=False):
    bx, by, bw, bh = p['bbox']
    if bw <= 0 or bh <= 0:
        return
    draw_w_engine = p['w'] * ENGINE_TILE
    draw_h_engine = round(draw_w_engine * (bh / bw))
    w = max(1, int(round(draw_w_engine * SCALE)))
    h = max(1, int(round(draw_h_engine * SCALE)))
    # drawProp · bottom-centre on the tile, plus the sub-tile Y nudge
    dx = math.floor((p['x'] + 0.5) * ENGINE_TILE - draw_w_engine / 2) * SCALE
    dy = math.floor((p['y'] + 1 + p.get('subY', 0)) * ENGINE_TILE - draw_h_engine) * SCALE
    src_bbox = [bx, by, bw, bh]
    if p.get('animCells', 0) > 1 and p.get('animCellW'):
        src_bbox[0] = bx                       # frame 0 · one still moment
    sp = sprite(p['src'], src_bbox, w, h, p.get('mirror'))
    if sp is None:
        return
    if canopy:
        # only the upper band is redrawn — the trunk stays in the first pass
        band = max(1, int(h * 0.55))
        sp = sp.crop((0, 0, w, band))
    paste(sp, round(dx), round(dy))


def draw_npc(n):
    """drawNPC, reduced to the still-frame case: idle bank, column 0."""
    bank = n.get('bboxes')
    if not bank:
        return
    row = DIR_ROW_NPC.get(n.get('dir') or 'down', 0)
    mirror = False
    if n.get('rowMap'):
        row = n['rowMap'].get(n.get('dir') or 'down', row)
    if n.get('mirrorRight') and n.get('dir') == 'right':
        row = DIR_ROW_NPC['left']
        mirror = True
    if row >= len(bank) or not bank[row]:
        return
    cell = bank[row][0]
    if not cell:
        return
    bx, by, bw, bh = cell
    if bw <= 0 or bh <= 0:
        return
    # _downScale · the tallest col-0 body across the four rows is the yardstick,
    # unless the sheet declares scaleRefBh (which is the whole point of that field)
    ref = n.get('scaleRefBh')
    if not ref:
        ref = 216
        for r in bank:
            if r and r[0] and r[0][3] > ref:
                ref = r[0][3]
    down = (ENGINE_TILE * 2) / ref * (n.get('scaleMul') or 1)
    if n.get('perRowScale'):
        rmax = max([c[3] for c in bank[row] if c] or [1])
        down = (ENGINE_TILE * 2) / rmax * (n.get('scaleMul') or 1)
    dw_e, dh_e = bw * down, bh * down
    w = max(1, int(round(dw_e * SCALE)))
    h = max(1, int(round(dh_e * SCALE)))
    if n.get('cellAnchor') and bank[row][0]:
        ref_box = bank[row][0]
        ref_w = round(ref_box[2] * down)
        base_x = math.floor(n['x'] * ENGINE_TILE + (ENGINE_TILE - ref_w) / 2)
        if mirror:
            dx = base_x + round(((ref_box[0] + ref_box[2]) - (bx + bw)) * down)
        else:
            dx = base_x + round((bx - ref_box[0]) * down)
        # ★ FEET, NOT THE BOX · footBaselines holds the body's lowest pixel in
        # cell space, so effects hanging below the character do not lift it
        fb = None
        f = n.get('foot')
        if f and row < len(f) and f[row]:
            fb = f[row][0]
        if fb is not None:
            dy = math.floor((n['y'] + 1) * ENGINE_TILE - (fb - by) * down)
        else:
            dy = math.floor((n['y'] + 1) * ENGINE_TILE - dh_e)
    else:
        dx = math.floor(n['x'] * ENGINE_TILE + (ENGINE_TILE - dw_e) / 2)
        dy = math.floor((n['y'] + 1) * ENGINE_TILE - dh_e)
    cw = n.get('cellW') or 313
    ch = n.get('cellH') or 313
    sp = sprite(n['src'], [0 * cw + bx, row * ch + by, bw, bh], w, h, mirror)
    paste(sp, round(dx * SCALE), round(dy * SCALE))


log('compositing')
done = 0
for _fy, _tier, kind, obj in render:
    if kind == 'prop':
        draw_prop(obj)
    elif kind == 'canopy':
        draw_prop(obj, canopy=True)
    else:
        draw_npc(obj)
    done += 1
    if done % 4000 == 0:
        log(f'   {done}/{len(render)} · {len(_sprite_cache)} distinct sprites cached')
log(f'compositing done · {len(_sprite_cache)} distinct sprites, {len(_cache)} assets')

log(f'saving {OUT}')
img.save(OUT, optimize=False, compress_level=6)
sz = os.path.getsize(OUT)
log(f'wrote {OUT} · {img.width} x {img.height} · {sz/1e6:.1f} MB')
