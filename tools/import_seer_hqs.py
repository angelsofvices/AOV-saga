"""★ Import the ten district-flavoured SEER HQ buildings.

Creator, 2026-09-03: "I have new assets for each seer hq to replace the current
generic version and have a district flavored one in each.  each has the district
name on the file.  replace them in the overworld. 1:1 scale"

They arrive as 1373x1145 MAGENTA-BACKED renders -- the same canvas as the
shipped seer-hq.png, which is why "1:1" is achievable at all.  Keying is the
canon border flood-fill (tools/chroma_key_canon.py): magenta only, from the
corners inward, so interior magenta in the art is never touched.

★ The build shares ONE bbox across all ten (SEER_HQ_BBOX) so every district's
HQ renders at an identical footprint.  This script reports each keyed image's
true content rect so we can see whether that shared bbox still holds, rather
than assuming it does.
"""
import os, sys, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
from chroma_key_canon import flood_key

SRC = '/sessions/great-cool-heisenberg/mnt/seer-district-hq-package'
DST = 'assets/2D sprites/buildings'
SHIPPED_BBOX = [88, 28, 1197, 1064]          # x, y, w, h · UNION of all ten (see header)
DISTS = ['malezor','zarvane','andrannor','veridan','netharion',
         'vorashil','xilnar','baelgor','thardin','korathen']

def main():
    write = '--write' in sys.argv
    rects = {}
    print(f"{'district':11} {'canvas':12} {'content rect (x,y,x2,y2)':30} {'x,y,w,h':26} delta vs shipped")
    for d in DISTS:
        p = os.path.join(SRC, f'seer-hq-{d}.png')
        im = flood_key(Image.open(p))
        b = im.split()[-1].getbbox()
        xywh = [b[0], b[1], b[2]-b[0], b[3]-b[1]]
        rects[d] = xywh
        delta = [xywh[i] - SHIPPED_BBOX[i] for i in range(4)]
        flag = '' if all(abs(v) <= 2 for v in delta) else '  <-- DIFFERS'
        print(f'{d:11} {str(im.size):12} {str(b):30} {str(xywh):26} {delta}{flag}')
        if write:
            im.save(os.path.join(DST, f'seer-hq-{d}.png'))
    if write:
        print(f'\nwrote {len(DISTS)} files to {DST}/')
    else:
        print('\n(dry run · pass --write to save)')
    return rects

if __name__ == '__main__':
    main()
