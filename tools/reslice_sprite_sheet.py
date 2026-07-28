#!/usr/bin/env python3
"""
Re-slice a magenta-background sprite sheet by connected components.

Why: naive fixed-grid slicing splits sprites whose bbox straddles the
grid or clips wide/tall sprites (weapon tips, effect glows).  Instead,
chroma-key the magenta bg to alpha, then find every contiguous non-
transparent blob — each is a real sprite regardless of grid alignment.

Sprites are numbered top-to-bottom, left-to-right by their center point.
"""
from PIL import Image
import numpy as np
import cv2
import os, sys, glob, argparse

def chroma_key(pil_rgba, tol=40):
    """First-pass RGB-box chroma-key on the exact sampled bg colour.

    Shadow-band despill runs later (per-sprite) so we can restrict it to
    the BOTTOM of each sprite's bbox where shadows actually live — the
    witch's magenta hat at the top of her sprite is the SAME hue as the
    bg, so a global hue-kill would destroy it.
    """
    arr = np.array(pil_rgba)  # H, W, 4
    key = arr[2, 2, :3]
    kr, kg, kb = int(key[0]), int(key[1]), int(key[2])
    r, g, b = arr[..., 0].astype(int), arr[..., 1].astype(int), arr[..., 2].astype(int)
    bg = (np.abs(r - kr) < tol) & (np.abs(g - kg) < tol) & (np.abs(b - kb) < tol)
    arr[..., 3][bg] = 0
    return Image.fromarray(arr)


def despill_shadow_band(pil_rgba, bg_rgb,
                        band_frac=0.28,
                        hue_tol_deg=25,
                        min_sat=0.30):
    """Kill magenta-hue pixels only within the BOTTOM `band_frac` of the
    sprite's bbox — that's where under-sprite shadows live.  Legit magenta
    content elsewhere (hats, capes, gems) is preserved.
    """
    arr = np.array(pil_rgba)
    if arr.shape[2] < 4:
        return pil_rgba
    H_img, W_img = arr.shape[:2]
    # Get the OPAQUE bbox to define "sprite bottom"
    alpha = arr[..., 3]
    ys, xs = np.where(alpha > 32)
    if ys.size == 0:
        return pil_rgba
    top, bot = int(ys.min()), int(ys.max())
    band_h = int((bot - top + 1) * band_frac)
    band_top = max(0, bot - band_h + 1)

    # HSV of the whole image (fast enough vs subsetting)
    rgb = arr[..., :3]
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV_FULL)
    H, S = hsv[..., 0].astype(int), hsv[..., 1]
    bg_hsv = cv2.cvtColor(np.uint8([[list(bg_rgb)]]), cv2.COLOR_RGB2HSV_FULL)[0, 0]
    bg_h = int(bg_hsv[0])
    hue_tol_255 = int((hue_tol_deg / 360.0) * 255)
    dh = np.minimum(np.abs(H - bg_h), 255 - np.abs(H - bg_h))
    hue_match = (dh < hue_tol_255) & (S > int(min_sat * 255))
    # Restrict to bottom band ONLY
    band_mask = np.zeros_like(alpha, dtype=bool)
    band_mask[band_top:bot + 1, :] = True
    kill = hue_match & band_mask
    arr[..., 3][kill] = 0
    return Image.fromarray(arr)


def despill_edge_fringe(pil_rgba, bg_rgb, hue_tol_deg=18, min_sat=0.30):
    """Kill any magenta-hue pixel that sits adjacent to an already-
    transparent region — those are the anti-aliased sheet-edge fringe
    pixels that leaked around every sprite's silhouette.  Runs GLOBALLY
    but only near transparent edges, so interior magenta (hats, capes)
    is untouched.
    """
    arr = np.array(pil_rgba)
    if arr.shape[2] < 4:
        return pil_rgba
    alpha = arr[..., 3]
    rgb = arr[..., :3]
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV_FULL)
    H, S = hsv[..., 0].astype(int), hsv[..., 1]
    bg_hsv = cv2.cvtColor(np.uint8([[list(bg_rgb)]]), cv2.COLOR_RGB2HSV_FULL)[0, 0]
    bg_h = int(bg_hsv[0])
    hue_tol_255 = int((hue_tol_deg / 360.0) * 255)
    dh = np.minimum(np.abs(H - bg_h), 255 - np.abs(H - bg_h))
    hue_match = (dh < hue_tol_255) & (S > int(min_sat * 255))
    # Only near existing transparent pixels (± 3 px)
    transparent = (alpha == 0).astype(np.uint8) * 255
    near_edge = cv2.dilate(transparent,
                           cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)),
                           iterations=1) > 0
    arr[..., 3][hue_match & near_edge] = 0
    return Image.fromarray(arr)

def add_black_outline(pil_rgba, thickness=1):
    """Grow the opaque region by `thickness` px and paint the new ring
    solid black.  Preserves the sprite's interior colours untouched.
    """
    arr = np.array(pil_rgba)
    if arr.shape[2] < 4:
        return pil_rgba
    alpha = arr[..., 3]
    binary = (alpha > 32).astype(np.uint8) * 255
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (thickness*2+1, thickness*2+1))
    dilated = cv2.dilate(binary, k, iterations=1)
    # New pixels = dilated ∖ original.  Paint them black opaque.
    new_ring = (dilated > 0) & (binary == 0)
    arr[new_ring, 0] = 0
    arr[new_ring, 1] = 0
    arr[new_ring, 2] = 0
    arr[new_ring, 3] = 255
    return Image.fromarray(arr)

def find_sprites(pil_rgba,
                 min_area=400,           # px² — filter isolated stray blobs
                 close_kernel=5,         # bridge alpha-fringe gaps INSIDE a sprite
                 row_count=None,         # forces exactly N rows (row binning)
                 cols_per_row=None,      # if set, forces exactly N sprites per row (targeted merging)
                 col_merge_ratio=0.55):  # centers within this * sprite_width → same sprite
    """
    Return a list of (bbox, cropped_pil) tuples in reading order.
    bbox is (left, top, right, bottom) in the source image.

    Row-aware merging: bin all detected blobs into exactly `row_count`
    rows by their Y-centre.  Within each row, iteratively merge the
    two horizontally-closest blobs until we have exactly `cols_per_row`
    (or the closest pair is farther apart than `col_merge_ratio` × the
    cell width, whichever comes first).

    This handles two hard cases at once:
      · a weapon whose glow tail is a detached blob (short horizontal
        gap between the tail and the shaft → merge)
      · two adjacent chibis whose sleeves nearly touch (each blob is
        already a full sprite; centres are farther apart than half a
        cell → NOT merged)
    """
    arr = np.array(pil_rgba)
    H, W = arr.shape[:2]
    alpha = arr[..., 3]
    mask = (alpha > 32).astype(np.uint8) * 255
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (close_kernel, close_kernel))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, k, iterations=1)

    n, labels, stats, centroids = cv2.connectedComponentsWithStats(mask, connectivity=8)

    blobs = []
    for i in range(1, n):
        x, y, w, h, area = stats[i]
        if area < min_area:
            continue
        blobs.append({
            'bbox': (int(x), int(y), int(x + w), int(y + h)),
            'cx': float(centroids[i][0]),
            'cy': float(centroids[i][1]),
            'area': int(area),
        })

    def merge_pair(a, b):
        ax1, ay1, ax2, ay2 = a['bbox']
        bx1, by1, bx2, by2 = b['bbox']
        a['bbox'] = (min(ax1, bx1), min(ay1, by1),
                     max(ax2, bx2), max(ay2, by2))
        a['area'] += b['area']
        a['cx'] = (a['bbox'][0] + a['bbox'][2]) / 2
        a['cy'] = (a['bbox'][1] + a['bbox'][3]) / 2

    # ── Bin blobs by row using the known row_count ──────────────────────
    if not row_count:
        row_count = 1
    row_h = H / row_count
    rows = [[] for _ in range(row_count)]
    for b in blobs:
        r = int(min(row_count - 1, max(0, b['cy'] // row_h)))
        rows[r].append(b)

    cell_w = W / (cols_per_row or 1)

    # ── Row-aware merging: iteratively merge closest pairs in a row ─────
    final = []
    for r_idx, row_blobs in enumerate(rows):
        # Sort by X-centre for easy neighbour comparisons
        row_blobs.sort(key=lambda b: b['cx'])
        if cols_per_row:
            # Merge nearest neighbours until we hit the exact target.
            # The closest pair in a row that has TOO MANY sprites is by
            # definition the artefact (a detached glow / tip) plus its
            # parent — two legit adjacent sprites would be spaced ~cell_w
            # apart.  So strict target-count merging is safe here.
            while len(row_blobs) > cols_per_row and len(row_blobs) >= 2:
                gaps = [(row_blobs[i+1]['cx'] - row_blobs[i]['cx'], i)
                        for i in range(len(row_blobs) - 1)]
                gap, i = min(gaps, key=lambda p: p[0])
                # Sanity: if the closest gap is > 90% of cell_w, we're
                # about to merge two legit sprites; bail out.
                if gap > cell_w * 0.90:
                    break
                merge_pair(row_blobs[i], row_blobs[i + 1])
                del row_blobs[i + 1]
        final.extend(row_blobs)

    # ── Sort in reading order ───────────────────────────────────────────
    final.sort(key=lambda b: (int(b['cy'] // row_h), b['cx']))

    out = []
    for b in final:
        x1, y1, x2, y2 = b['bbox']
        crop = pil_rgba.crop((x1, y1, x2, y2))
        out.append((b['bbox'], crop))
    return out


def process_sheet(src_path, out_dir, prefix, row_count,
                  cols_per_row=None,
                  wipe_bottom_frac=0.0,
                  wipe_bottom_only_near_white=False,
                  near_white_threshold=200,
                  min_area=400, close_kernel=5,
                  outline_px=1):
    """
    src_path         : PNG with magenta background
    out_dir          : where to write <prefix>_NN.png files
    prefix           : e.g. "humanoid", "corrupted", "weapon"
    row_count        : known number of rows on the sheet
    wipe_bottom_frac : height fraction of each row to consider the "label band"
    wipe_bottom_only_near_white : if True, ONLY wipe near-white text pixels
        inside the band — leave dark / coloured weapon handles alone.  Solves
        the "handles clipped" bug where the blanket band wipe ate part of
        the sprite that extended down into the label area.
    """
    print(f"── {os.path.basename(src_path)}  →  {out_dir}/{prefix}_NN.png")
    im = Image.open(src_path).convert('RGBA')
    W, H = im.size
    row_h = H // row_count
    print(f"   source: {W}×{H} · rows {row_count} · row_h {row_h}")

    # Wipe the label band per row (weapons) BEFORE chroma-key so nothing
    # from the text becomes a spurious blob.
    if wipe_bottom_frac > 0:
        band_h = int(row_h * wipe_bottom_frac)
        raw = np.array(im)
        key_rgba = tuple(int(x) for x in raw[2, 2])
        wiped = 0
        for r in range(row_count):
            top = r * row_h + (row_h - band_h)
            bot = (r + 1) * row_h
            band = raw[top:bot, :]
            if wipe_bottom_only_near_white:
                # Text is near-white; mask ONLY those pixels.  Dark-metal
                # handles / pommels in the band stay untouched → no more
                # clipped sprite bottoms.
                nw = ((band[..., 0] >= near_white_threshold) &
                      (band[..., 1] >= near_white_threshold) &
                      (band[..., 2] >= near_white_threshold))
                # Slight dilation on the text mask so anti-aliased fringes
                # around each character also get wiped.
                nw_u8 = nw.astype(np.uint8) * 255
                dk = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
                nw_u8 = cv2.dilate(nw_u8, dk, iterations=1)
                nw = nw_u8 > 0
                band[nw] = key_rgba
                wiped += int(nw.sum())
            else:
                band[:] = key_rgba
        im = Image.fromarray(raw)
        if wipe_bottom_only_near_white:
            print(f"   wiped {wiped:,} near-white text pixels in bottom {int(wipe_bottom_frac*100)}% band")

    keyed = chroma_key(im)
    sprites = find_sprites(keyed,
                           min_area=min_area,
                           close_kernel=close_kernel,
                           row_count=row_count,
                           cols_per_row=cols_per_row)
    print(f"   detected {len(sprites)} sprites")

    # Clean previous <prefix>_*.png outputs so we don't leave stragglers
    for old in glob.glob(f"{out_dir}/{prefix}_*.png"):
        os.remove(old)

    # Sample the sheet bg colour once so per-sprite despill matches it
    _raw_master = np.array(im)
    bg_rgb_tuple = tuple(int(x) for x in _raw_master[2, 2, :3])

    for i, (bbox, crop) in enumerate(sprites, start=1):
        # 1) Kill under-sprite magenta shadows (bottom-band only)
        #    Edge-fringe despill deliberately SKIPPED — it killed the
        #    witch's magenta hat (top of sprite silhouette = "near edge").
        #    Any tiny bg-hue leftover on the sprite outline is covered by
        #    the black outline pass below anyway.
        crop = despill_shadow_band(crop, bg_rgb_tuple)
        # 2) Retrim to bbox so the outline pad math starts from a clean crop
        bb = crop.getbbox()
        if bb:
            crop = crop.crop(bb)
        # 4) Add 1-px black outline (with transparent pad so dilation
        #    doesn't clip the sprite when it touches the crop edge)
        if outline_px > 0:
            pad = outline_px + 1
            padded = Image.new('RGBA',
                               (crop.width + pad*2, crop.height + pad*2),
                               (0, 0, 0, 0))
            padded.paste(crop, (pad, pad))
            crop = add_black_outline(padded, thickness=outline_px)
            bb2 = crop.getbbox()
            if bb2:
                crop = crop.crop(bb2)
        crop.save(f"{out_dir}/{prefix}_{i:02d}.png", optimize=True)

    return len(sprites)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument('src')
    ap.add_argument('out_dir')
    ap.add_argument('prefix')
    ap.add_argument('--rows', type=int, required=True)
    ap.add_argument('--cols', type=int, default=None,
                    help='Expected sprites per row — enables targeted merging')
    ap.add_argument('--wipe-bottom', type=float, default=0.0)
    ap.add_argument('--wipe-bottom-white-only', action='store_true',
                    help='Wipe only near-white pixels in the bottom band '
                         '(preserves dark weapon handles that extend into '
                         'the label area)')
    ap.add_argument('--white-threshold', type=int, default=200,
                    help='Per-channel RGB minimum for "text" (default 200)')
    ap.add_argument('--min-area', type=int, default=400)
    ap.add_argument('--close', type=int, default=5)
    ap.add_argument('--outline', type=int, default=1,
                    help='Thickness in px of the black outline drawn '
                         'around each sprite silhouette (0 = none)')
    a = ap.parse_args()
    n = process_sheet(a.src, a.out_dir, a.prefix, a.rows,
                      cols_per_row=a.cols,
                      wipe_bottom_frac=a.wipe_bottom,
                      wipe_bottom_only_near_white=a.wipe_bottom_white_only,
                      near_white_threshold=a.white_threshold,
                      min_area=a.min_area,
                      close_kernel=a.close,
                      outline_px=a.outline)
    print(f"── done · {n} sprites written")
