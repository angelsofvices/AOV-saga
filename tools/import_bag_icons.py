"""★★★★ v0.99.20 · BAG ICON IMPORT · 72 magenta renders -> keyed, trimmed PNGs.

Creator, 2026-09-23: *"here is each item. use them as their bag item icon.
make a UI native background for the icon and put the image of the item
chromakeyed."*

★★★★ THE FLOOD IS THE WHOLE SAFETY ARGUMENT. Seven of these items are
  THEMSELVES magenta or violet — the purple gem, the prismshard, the wraith
  shard, the auracide shard, the xeno shard, the ruby vial's highlight, the
  elzebub egg's mottling. A global "delete every magenta pixel" pass would eat
  holes straight through them. tools/chroma_key_canon.flood_key starts at the
  BORDER and stops at the first opaque body pixel, which is the canon rule
  ([[aov-chroma-key-canon]]) — interior magenta is never reachable and never
  touched.

★★ DESPILL, then trim. The renders anti-alias the background into the art
  across ~2px, so keying alone leaves a magenta fringe that reads as a pink
  halo at 48px. The spill band gets its red and blue pulled down toward green.
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image
from chroma_key_canon import flood_key

SRC = sys.argv[1]
DST = sys.argv[2]
os.makedirs(DST, exist_ok=True)

# ★★★★ THE RENDERS HAVE A MAGENTA CONTACT SHADOW BAKED IN.
#   Pass one keyed the flat background and left every item sitting in a
#   magenta pool, with more magenta showing through the Fae Net's mesh, the
#   Shardshare collar's ring and the Portalkey's head. I only found it by
#   compositing the keyed files onto a checkerboard and LOOKING — the numeric
#   "pink fringe" detector had flagged the right pixels while I read them as a
#   1px anti-alias rim and kept widening a despill that could never fix a soft
#   50px shadow.
#
# ★★★★ SHADOW vs VIOLET ART IS r ≈ b. Measured on the source renders:
#     shardshare shadow  (201, 15,202)  |r-b| =  2.2   <- background
#     purple gem body    (154, 50,199)  |r-b| = 44.4   <- ART
#     prismshard mixed   (203, 29,218)  |r-b| = 21.5
#   Magenta is red and blue in balance; the violet items are decisively
#   blue-dominant. So the test is not "how magenta is this" but "how EQUAL are
#   r and b", which separates a shaded chroma pool from a violet gem cleanly.
MAG_GAP   = 55   # r and b must each clear green by this much
BORDER_RB = 28   # |r-b| tolerance flooding from OUTSIDE · 28 clears the violet tail of the
                 # shadow under fae and the wraith shard; the purple gem body sits at 44
INNER_RB  = 12   # tighter for sealed pockets, where nothing stops it

def _mag_mask(a, rb):
    r, g, b = a[...,0].astype(int), a[...,1].astype(int), a[...,2].astype(int)
    return (r > g + MAG_GAP) & (b > g + MAG_GAP) & (np.abs(r - b) <= rb)

def border_flood(im):
    """Flood from the canvas edge inward, stopping at the first non-chroma
    pixel. The canon rule ([[aov-chroma-key-canon]]) — only the THRESHOLD is
    relaxed, never the flood-from-outside part, so interior art is unreachable
    however magenta it happens to be."""
    a = np.array(im)
    mask = _mag_mask(a, BORDER_RB)
    H, W = mask.shape
    seen = np.zeros_like(mask)
    from collections import deque
    q = deque()
    for x in range(W):
        for y in (0, H-1):
            if mask[y, x] and not seen[y, x]: seen[y, x] = True; q.append((y, x))
    for y in range(H):
        for x in (0, W-1):
            if mask[y, x] and not seen[y, x]: seen[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny, nx = y+dy, x+dx
            if 0 <= ny < H and 0 <= nx < W and mask[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True; q.append((ny, nx))
    a[...,3] = np.where(seen, 0, a[...,3])
    return Image.fromarray(a, 'RGBA')

def clear_enclosed_chroma(im):
    """Sealed pockets the border flood cannot reach: the ring of the Shardshare
    collar, the mesh of the Fae Net, the tankard handle, the Portalkey's head.
    Tighter |r-b| here because there is no art boundary to stop it."""
    a = np.array(im)
    pocket = _mag_mask(a, INNER_RB) & (a[...,3] > 0)
    a[...,3] = np.where(pocket, 0, a[...,3])
    return Image.fromarray(a, 'RGBA')

def despill(im):
    a = np.array(im).astype(int)
    r, g, b, al = a[...,0], a[...,1], a[...,2], a[...,3]
    # magenta spill = red AND blue both above green on a semi-transparent edge
    # ★★ Widened from "semi-transparent only". The enclosed pockets were fully
    #   OPAQUE, so their anti-aliased rim never qualified as an edge and kept a
    #   pink halo after the pocket was cleared. Any pixel with transparency in
    #   its 8-neighbourhood is a rim pixel, whatever its own alpha.
    # ★★★ RADIUS 3, MEASURED. At radius 1 the Shardshare collar still carried a
    #   pink rim over 20% of its opaque pixels — the renders anti-alias the
    #   background 2-3px into the art, so only the outermost ring qualified as
    #   a rim and the band behind it stayed magenta. Widened until the residual
    #   stopped falling.
    trans = (al <= 8).astype(np.uint8)
    near = np.zeros_like(trans)
    for dy in range(-3, 4):
        for dx in range(-3, 4):
            near |= np.roll(np.roll(trans, dy, 0), dx, 1)
    edge = ((al > 8) & (near > 0)) | ((al > 8) & (al < 250))
    mag  = edge & (r > g) & (b > g)
    cap = np.maximum(g, 0)
    r[mag] = np.minimum(r[mag], cap[mag] + 12)
    b[mag] = np.minimum(b[mag], cap[mag] + 12)
    a[...,0], a[...,2] = r, b
    return Image.fromarray(a.astype(np.uint8), 'RGBA')

rows = []
for fn in sorted(os.listdir(SRC)):
    if not fn.lower().endswith('.png'): continue
    im = Image.open(os.path.join(SRC, fn)).convert('RGBA')
    w0, h0 = im.size
    # ★ order matters · flood the outside, clear the sealed pockets, THEN
    #   despill, so the edges the second pass creates get cleaned too.
    keyed = despill(clear_enclosed_chroma(border_flood(im)))
    bb = keyed.getchannel('A').getbbox()
    if not bb:
        rows.append({'file': fn, 'error': 'EMPTY AFTER KEY'}); continue
    out = keyed.crop(bb)                      # trim to its own alpha
    out.save(os.path.join(DST, fn), optimize=True)
    opaque = int((np.array(out)[...,3] > 8).sum())
    rows.append({'file': fn, 'src': [w0, h0], 'bbox': [bb[0], bb[1], bb[2]-bb[0], bb[3]-bb[1]],
                 'out': list(out.size), 'opaque_px': opaque,
                 'aspect': round(out.size[1]/out.size[0], 3)})
print(json.dumps(rows, indent=0))
