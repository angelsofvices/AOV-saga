#!/usr/bin/env python3
"""
compose_rakoron_cave.py · v0.95.209
Merges two separate prop images (Rakoron's cave entrance + stone stairs) into
ONE composite PNG asset so the game can render + scale them as a single prop.

Same-pattern template for future cave layers (side walls, upper terraces, etc.):
crop each source by its bbox, resize to its tile footprint at PPT, paste onto
a shared canvas at the correct world-row offset.

Rerun anytime the sources or alignment change:
    python3 scripts/compose_rakoron_cave.py

Outputs assets/2D sprites/buildings/rakoron-cave-full.png (1300 × 1050 · 13w × 10.5h tiles).
"""
from PIL import Image
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Source bboxes (from rp7b.html WORLD_PROPS entries pre-merge)
ENTR_BBOX  = [55, 201, 1425, 584]
STAIR_BBOX = [49, 202, 1430, 666]

# World layout (must match rp7b.html)
PPT     = 100      # pixels per tile in the composite (nice round number)
TILES_W = 13
ENTR_H  = 5        # entrance visible tile height
STAIR_H = 6        # stairs visible tile height
SUB_Y   = 0.5      # entrance subY nudge (rows down)

# Combined span: entrance top at world-row 0.5, stairs bottom at world-row 11
COMP_H_TILES = 11 - SUB_Y                   # 10.5

def crop_bbox(img, bbox):
    x, y, w, h = bbox
    return img.crop((x, y, x + w, y + h))

def main():
    entr  = Image.open(ROOT / 'assets/2D sprites/buildings/rakoron-cave-entrance.png').convert('RGBA')
    stair = Image.open(ROOT / 'assets/2D sprites/decor/rakoron-stairs.png').convert('RGBA')

    entr_scaled  = crop_bbox(entr,  ENTR_BBOX ).resize((TILES_W * PPT, ENTR_H  * PPT), Image.LANCZOS)
    stair_scaled = crop_bbox(stair, STAIR_BBOX).resize((TILES_W * PPT, STAIR_H * PPT), Image.LANCZOS)

    comp_w = TILES_W * PPT
    comp_h = int(round(COMP_H_TILES * PPT))
    comp = Image.new('RGBA', (comp_w, comp_h), (0, 0, 0, 0))

    # Entrance top = 0 in composite (composite origin = world row 0.5)
    comp.paste(entr_scaled, (0, 0), entr_scaled)
    # Stairs top = (5 - SUB_Y) tiles from composite origin · 4.5 * PPT = 450 px
    stair_y = int(round((5 - SUB_Y) * PPT))
    # Paste stairs LAST so any overlap draws stairs over entrance (matches in-game Z)
    comp.paste(stair_scaled, (0, stair_y), stair_scaled)

    out = ROOT / 'assets/2D sprites/buildings/rakoron-cave-full.png'
    comp.save(out, optimize=True)
    print(f'wrote {out} · size {comp.size} · aspect {comp_w / comp_h:.3f}')

if __name__ == '__main__':
    main()
