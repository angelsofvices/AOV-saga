# Hair assets for the Build Lab and the Skin Lab: standalone GLBs on Rizer's exact skeleton and bind pose,
# 100% weighted to the Head bone, one primitive with material R_hair (so Skin Lab colours reach it).
#
#   python3 tools/hair_assets.py extract assets/rizer/rizer.glb assets/hair/hair_spiked.glb   (save a hair as-is)
#   python3 tools/hair_assets.py messy assets/hair/hair_messy.glb [--seed 7]                   (build the messy cut)
#
# The messy cut is Rizer's canonical hair from the character sheet: short and shaggy, full on top, choppy
# locks tumbling every way, bangs to the brow with one lock across his right eye, the tops of the ears
# covered and a ragged nape. It is built from a scalp cap over his skull plus ~100 tapered locks, faceted
# like the rest of the low-poly model, and carries his eyebrows (on rizer.glb they are part of R_hair). Model space: +Y up, +Z forward (his left is +X), metres.
import json, struct, sys
import numpy as np

def read(path):
    d = open(path, 'rb').read()
    n = struct.unpack('<I', d[12:16])[0]
    j = json.loads(d[20:20 + n]); b = d[20 + n + 8:]
    return j, b

def accessor(j, b, i):
    a = j['accessors'][i]; v = j['bufferViews'][a['bufferView']]; off = v.get('byteOffset', 0) + a.get('byteOffset', 0)
    ct = {5126: np.float32, 5125: np.uint32, 5123: np.uint16, 5121: np.uint8}[a['componentType']]
    nc = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}[a['type']]
    return np.frombuffer(b, dtype=ct, count=a['count'] * nc, offset=off).reshape(a['count'], nc).copy()

def write(template, arrays, material, out):
    """GLB = the template's skeleton (nodes, skin, scene) + one skinned primitive built from `arrays`."""
    j, b = template
    skin = j['skins'][0]
    ibm = accessor(j, b, skin['inverseBindMatrices'])
    blobs, accs, views = [], [], []
    def add(arr, comp, typ, target=None, minmax=False):
        raw = np.ascontiguousarray(arr).tobytes(); off = sum(len(x) for x in blobs)
        pad = b'\0' * (-len(raw) % 4); blobs.append(raw + pad)
        v = {'buffer': 0, 'byteOffset': off, 'byteLength': len(raw)}
        if target: v['target'] = target
        views.append(v)
        a = {'bufferView': len(views) - 1, 'componentType': comp, 'count': len(arr), 'type': typ}
        if minmax: a['min'] = [float(x) for x in arr.min(0)]; a['max'] = [float(x) for x in arr.max(0)]
        accs.append(a); return len(accs) - 1
    pos = add(arrays['POSITION'].astype(np.float32), 5126, 'VEC3', 34962, True)
    nrm = add(arrays['NORMAL'].astype(np.float32), 5126, 'VEC3', 34962)
    jnt = add(arrays['JOINTS_0'].astype(np.uint8), 5121, 'VEC4', 34962)
    wgt = add(arrays['WEIGHTS_0'].astype(np.float32), 5126, 'VEC4', 34962)
    idx = add(arrays['indices'].astype(np.uint32).reshape(-1, 1), 5125, 'SCALAR', 34963)
    inv = add(ibm.astype(np.float32), 5126, 'MAT4')
    meshNode = next(i for i, nd in enumerate(j['nodes']) if 'mesh' in nd)
    nodes = json.loads(json.dumps(j['nodes'])); nodes[meshNode]['name'] = 'Hair'
    out_j = {
        'asset': {'version': '2.0', 'generator': 'rp7d tools/hair_assets.py'},
        'scene': 0, 'scenes': j['scenes'], 'nodes': nodes,
        'skins': [{**{k: v for k, v in skin.items() if k != 'inverseBindMatrices'}, 'inverseBindMatrices': inv}],
        'materials': [material],
        'meshes': [{'name': 'Hair', 'primitives': [{'attributes': {'POSITION': pos, 'NORMAL': nrm, 'JOINTS_0': jnt, 'WEIGHTS_0': wgt}, 'indices': idx, 'material': 0}]}],
        'accessors': accs, 'bufferViews': views, 'buffers': [{'byteLength': sum(len(x) for x in blobs)}]
    }
    js = json.dumps(out_j, separators=(',', ':')).encode(); js += b' ' * (-len(js) % 4)
    bin_ = b''.join(blobs)
    glb = struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(bin_)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(bin_), 0x004E4942) + bin_
    open(out, 'wb').write(glb)
    print(f'wrote {out} · {len(arrays["indices"]) // 3} triangles · {len(glb) / 1024:.0f} KB')

def extract(src, out, material='R_hair'):
    j, b = read(src)
    p = next(p for m in j['meshes'] for p in m['primitives'] if j['materials'][p['material']]['name'] == material)
    arrays = {k: accessor(j, b, p['attributes'][k]) for k in ('POSITION', 'NORMAL', 'JOINTS_0', 'WEIGHTS_0')}
    arrays['indices'] = accessor(j, b, p['indices']).reshape(-1)
    write((j, b), arrays, j['materials'][p['material']], out)

# ── the messy cut ──────────────────────────────────────────────────────────────────────────────
C = np.array([0.0, 1.712, 0.352])          # skull centre (from Rizer's head mesh)
R = np.array([0.140, 0.152, 0.138])        # scalp cap radii: just outside the skull

def hairline(d):
    """Lowest direction-y the cap reaches, by how far round the head d points (front high, back low)."""
    return float(np.interp(d[2], [-1, -0.35, 0.25, 0.62, 1], [-0.72, -0.5, -0.12, 0.30, 0.42]))

def messy(out, seed=7):
    rng = np.random.default_rng(seed)
    tris = []                                   # list of (a, b, c) model-space points, CCW from outside
    on = lambda d: C + R * d                    # point on the cap for unit direction d
    # 1 · scalp cap: a lat-long shell, kept where hair grows
    nu, nv = 22, 12
    for i in range(nu):
        for k in range(nv):
            def dirn(u, v):
                th, ph = 2 * np.pi * u / nu, np.pi * (v / nv) - np.pi / 2
                return np.array([np.cos(ph) * np.sin(th), np.sin(ph), np.cos(ph) * np.cos(th)])
            ds = [dirn(i, k), dirn(i + 1, k), dirn(i + 1, k + 1), dirn(i, k + 1)]
            mid = sum(ds) / 4; mid /= np.linalg.norm(mid)
            if mid[1] < hairline(mid): continue
            p = [on(d) for d in ds]
            tris += [(p[0], p[1], p[2]), (p[0], p[2], p[3])]
    # 2 · locks: tapered four-sided spikes rooted in the cap
    def lock(d, tip_dir, length, width):
        d = d / np.linalg.norm(d); root = on(d) - d * 0.012
        t = tip_dir / np.linalg.norm(tip_dir); tip = root + t * length
        a = np.cross(t, [0, 1, 0] if abs(t[1]) < 0.9 else [1, 0, 0]); a /= np.linalg.norm(a); bb = np.cross(t, a)
        tw = rng.uniform(0, np.pi)                       # twist, so neighbours don't line up
        corners = [root + width * (np.cos(tw + q) * a + np.sin(tw + q) * bb) * (0.62 if q % np.pi else 1.0) for q in (0, np.pi / 2, np.pi, 3 * np.pi / 2)]
        for q in range(4): tris.append((corners[q], corners[(q + 1) % 4], tip))
    golden = np.pi * (3 - np.sqrt(5)); n = 420
    for s in range(n):
        y = 1 - 2 * (s + 0.5) / n; r = np.sqrt(1 - y * y); th = golden * s
        d = np.array([r * np.sin(th), y, r * np.cos(th)])
        if d[1] < hairline(d) + 0.04 or rng.random() > 0.24: continue
        jit = rng.normal(0, 0.28, 3)
        if d[2] > 0.45 and d[1] < 0.75:                  # bangs: fall forward and down to the brow
            tip_dir = np.array([d[0] * 0.6, -1.0, 0.45]) + jit * 0.5
            length = rng.uniform(0.055, 0.075)
        elif d[1] > 0.55:                                # crown: up, back and out, the volume of the cut
            tip_dir = d + np.array([0, 0.25, -0.35]) + jit
            length = rng.uniform(0.075, 0.11)
        elif d[2] < -0.25:                               # back: down and out to a ragged nape
            tip_dir = d + np.array([0, -0.95, -0.15]) + jit * 0.6
            length = rng.uniform(0.08, 0.115)
        else:                                            # sides: out and down over the tops of the ears
            tip_dir = d + np.array([0, -0.75, 0]) + jit * 0.6
            length = rng.uniform(0.07, 0.1)
        lock(d, tip_dir, length, rng.uniform(0.026, 0.04))
    # the fringe: a full row of bangs across the hairline, swept a little toward his right, to the brow
    for k, x in enumerate(np.linspace(-0.62, 0.62, 9)):
        root = np.array([x, 0.5 + 0.08 * abs(x), 0.82]); sweep = -0.18 + rng.normal(0, 0.12)
        lock(root, np.array([x * 0.5 + sweep, -1.0, 0.36 + rng.normal(0, 0.05)]), rng.uniform(0.06, 0.078), rng.uniform(0.028, 0.036))
    # the long lock across his right eye (-X), down past the brow
    lock(np.array([-0.25, 0.55, 0.8]), np.array([-0.25, -1.0, 0.42]), 0.105, 0.03)
    lock(np.array([0.32, 0.5, 0.8]), np.array([0.35, -1.0, 0.4]), 0.07, 0.028)
    # his eyebrows ride in R_hair on rizer.glb (already fitted to the face by fit_face_features.py): keep them
    rj, rb = read('assets/rizer/rizer.glb')
    hp = next(p for m in rj['meshes'] for p in m['primitives'] if rj['materials'][p['material']]['name'] == 'R_hair')
    HP = accessor(rj, rb, hp['attributes']['POSITION']); HI = accessor(rj, rb, hp['indices']).reshape(-1, 3)
    brows = [t for t in HI if HP[t][:, 1].max() < 1.76 and HP[t][:, 1].min() > 1.70 and HP[t][:, 2].min() > 0.38 and np.abs(HP[t][:, 0]).max() < 0.08]
    assert len(brows) == 24, f'expected two brow boxes (24 triangles), found {len(brows)}'
    tris += [tuple(HP[t].astype(float)) for t in brows]
    # flat-shaded: three vertices per triangle, the face normal on each
    P = np.array([v for t in tris for v in t], dtype=np.float32)
    N = np.repeat(np.array([np.cross(t[1] - t[0], t[2] - t[0]) for t in tris]), 3, axis=0)
    N /= np.linalg.norm(N, axis=1, keepdims=True) + 1e-12
    # outward: flip any triangle whose normal points into the head
    for f in range(len(tris)):
        c = P[3 * f:3 * f + 3].mean(0)
        if np.dot(N[3 * f], c - C) < 0: P[3 * f + 1], P[3 * f + 2] = P[3 * f + 2].copy(), P[3 * f + 1].copy(); N[3 * f:3 * f + 3] *= -1
    template = read('assets/rizer/rizer.glb'); j = template[0]
    head = next(i for i, jn in enumerate(j['skins'][0]['joints']) if j['nodes'][jn]['name'].endswith('Head'))
    material = next(m for m in j['materials'] if m['name'] == 'R_hair')
    J = np.zeros((len(P), 4), np.uint8); J[:, 0] = head
    W = np.zeros((len(P), 4), np.float32); W[:, 0] = 1
    write(template, {'POSITION': P, 'NORMAL': N, 'JOINTS_0': J, 'WEIGHTS_0': W, 'indices': np.arange(len(P))}, material, out)
    print(f'  bounds x {P[:,0].min():+.3f}..{P[:,0].max():+.3f} · y {P[:,1].min():.3f}..{P[:,1].max():.3f} · z {P[:,2].min():.3f}..{P[:,2].max():.3f}')

if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'extract': extract(sys.argv[2], sys.argv[3], *(sys.argv[4:5]))
    elif cmd == 'messy': messy(sys.argv[2], int(sys.argv[sys.argv.index('--seed') + 1]) if '--seed' in sys.argv else 7)
