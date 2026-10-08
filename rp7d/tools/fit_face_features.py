# Press the face features (eyes, brows, nose, lips) of a character GLB onto the head they sit on.
#
# The low-poly heads are faceted and taper back toward the cheeks, but the features were modelled as flat
# boxes at one depth, so from the side they stood off the face. This finds every small separate piece on
# the front of the head (whatever its material), casts a ray straight back from each of its vertices to the
# head surface, and moves the vertex so the piece rides that surface: a thin feature ends up 2.5 mm proud of
# the face, a thick one (the nose) has its back sunk 3 mm into it. Only POSITION data changes.
#
#   python3 tools/fit_face_features.py assets/rizer/rizer.glb [--head R_skin[,N_skull]] [--write]
#
# Without --write it only reports. With --write it also refreshes the matching .glb.js fallback, if any.
# Run it once per fresh export (build_rizer.py / build_psychosyd.py / build_npc_base.py): a second pass sees the
# fitted pieces as sheared and nudges them again. The NPC base needs --head N_skin,N_skull (its round skull carries the eyes).
import json, struct, sys, base64, os
import numpy as np

FRONT_Z, Y_LO, Y_HI = 0.40, 1.55, 1.80          # where a face feature can be (model space: +Z forward, Y up)
MAX_W, MAX_H, MAX_D = 0.17, 0.06, 0.05           # a feature's largest bounding box
PROUD, NOSE_SINK, THIN = 0.0025, 0.003, 0.02     # metres

def load(path):
    d = open(path, 'rb').read()
    jlen = struct.unpack('<I', d[12:16])[0]
    j = json.loads(d[20:20 + jlen])
    boff = 20 + jlen + 8
    blen = struct.unpack('<I', d[20 + jlen:24 + jlen])[0]
    return d, j, bytearray(d[boff:boff + blen]), boff

def view(j, buf, i):
    a = j['accessors'][i]; v = j['bufferViews'][a['bufferView']]
    off = v.get('byteOffset', 0) + a.get('byteOffset', 0)
    ct = {5126: np.float32, 5125: np.uint32, 5123: np.uint16, 5121: np.uint8}[a['componentType']]
    nc = {'SCALAR': 1, 'VEC3': 3, 'VEC4': 4}[a['type']]
    assert not v.get('byteStride') or v['byteStride'] == np.dtype(ct).itemsize * nc
    return np.frombuffer(buf, dtype=ct, count=a['count'] * nc, offset=off).reshape(a['count'], nc), off

def components(pos, idx):
    parent = list(range(len(pos)))
    def find(a):
        while parent[a] != a: parent[a] = parent[parent[a]]; a = parent[a]
        return a
    def union(a, b): parent[find(a)] = find(b)
    for t in idx.reshape(-1, 3): union(t[0], t[1]); union(t[1], t[2])
    seen = {}
    for i, p in enumerate(np.round(pos, 4)):          # split normals: same corner, different vertex
        k = tuple(p)
        if k in seen: union(i, seen[k])
        else: seen[k] = i
    groups = {}
    for i in range(len(pos)): groups.setdefault(find(i), []).append(i)
    return list(groups.values())

def surface_z(tris, x, y):
    """Front-most z of the head surface straight behind (x, y), or None."""
    a, b, c = tris[:, 0], tris[:, 1], tris[:, 2]
    v0, v1 = b[:, :2] - a[:, :2], c[:, :2] - a[:, :2]; v2 = np.array([x, y]) - a[:, :2]
    den = v0[:, 0] * v1[:, 1] - v1[:, 0] * v0[:, 1]
    ok = np.abs(den) > 1e-12
    u = np.where(ok, (v2[:, 0] * v1[:, 1] - v1[:, 0] * v2[:, 1]) / np.where(ok, den, 1), -1)
    w = np.where(ok, (v0[:, 0] * v2[:, 1] - v2[:, 0] * v0[:, 1]) / np.where(ok, den, 1), -1)
    hit = ok & (u >= -1e-6) & (w >= -1e-6) & (u + w <= 1 + 1e-6)
    if not hit.any(): return None
    z = a[hit, 2] + u[hit] * (b[hit, 2] - a[hit, 2]) + w[hit] * (c[hit, 2] - a[hit, 2])
    return float(z.max())

def main():
    args = sys.argv[1:]; path = args[0]
    heads = args[args.index('--head') + 1].split(',') if '--head' in args else None
    d, j, buf, boff = load(path)
    prims = [(j['materials'][p['material']]['name'], p) for m in j['meshes'] for p in m['primitives']]
    heads = heads or [next(n for n, _ in prims if n.endswith('_skin'))]
    data = {}
    for name, p in prims:
        pos, poff = view(j, buf, p['attributes']['POSITION']); idx, _ = view(j, buf, p['indices'])
        data[name] = dict(p=p, pos=pos.copy(), poff=poff, idx=idx.reshape(-1).astype(np.int64))
    feats = []
    for name, D in data.items():
        for comp in components(D['pos'], D['idx']):
            P = D['pos'][comp]; lo, hi = P.min(0), P.max(0); size = hi - lo; cy, cz = (lo[1] + hi[1]) / 2, hi[2]
            if size[0] <= MAX_W and size[1] <= MAX_H and size[2] <= MAX_D and Y_LO < cy < Y_HI and cz > FRONT_Z and len(comp) <= 96:
                feats.append((name, comp))
    featset = {(n, i) for n, c in feats for i in c}
    tris = []
    for head in heads:
        H = data[head]; tri = H['idx'].reshape(-1, 3)
        tris += [H['pos'][t] for t in tri if not any((head, int(i)) in featset for i in t) and H['pos'][t][:, 1].max() > 1.45]
    tris = np.array(tris)
    print(f'{path}: head = {"+".join(heads)}, {len(tris)} surface triangles, {len(feats)} features')
    for name, comp in feats:
        P = data[name]['pos']; Q = P[comp]; zmin, zmax = Q[:, 2].min(), Q[:, 2].max(); t = zmax - zmin
        zs = [surface_z(tris, x, y) for x, y, _ in Q]
        if all(z is None for z in zs): print(f'  {name:8s} skipped (not over the head)'); continue
        fill = [z for z in zs if z is not None]
        zs = np.array([z if z is not None else max(fill) for z in zs])
        sink = (t - PROUD) if t < THIN else NOSE_SINK
        new = zs + (Q[:, 2] - zmin) - sink
        # the front face spans between its corners; where the head bulges in between, lift it clear
        front = np.isclose(Q[:, 2], zmax, atol=1e-4); F = Q[front]; Fz = new[front]
        if len(F) >= 3:
            worst = -1.0
            for sx in np.linspace(0.1, 0.9, 5):
                for sy in np.linspace(0.1, 0.9, 5):
                    x = F[:, 0].min() + sx * np.ptp(F[:, 0]); y = F[:, 1].min() + sy * np.ptp(F[:, 1])
                    s = surface_z(tris, x, y)
                    if s is None: continue
                    wts = 1 / (np.hypot(F[:, 0] - x, F[:, 1] - y) + 1e-4)
                    worst = max(worst, s - (Fz * wts).sum() / wts.sum())
            if worst > -0.0015: new += worst + 0.0015
        print(f'  {name:8s} {len(comp):3d} verts  x {Q[:,0].min():+.3f}..{Q[:,0].max():+.3f}  y {Q[:,1].min():.3f}..{Q[:,1].max():.3f}'
              f'  back z {zmin:.3f} -> {new.min():.3f}  (surface {zs.min():.3f}..{zs.max():.3f})')
        P[comp, 2] = new
    if '--write' not in args: return
    for name, D in data.items():
        raw = D['pos'].astype(np.float32).tobytes(); buf[D['poff']:D['poff'] + len(raw)] = raw
        a = j['accessors'][D['p']['attributes']['POSITION']]
        a['min'] = [float(v) for v in D['pos'].min(0)]; a['max'] = [float(v) for v in D['pos'].max(0)]
    js = json.dumps(j, separators=(',', ':')).encode(); js += b' ' * (-len(js) % 4)
    out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(buf)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(buf), 0x004E4942) + bytes(buf)
    open(path, 'wb').write(out)
    if os.path.exists(path + '.js'):
        open(path + '.js', 'w').write('// GLB as base64, for hosts that cannot serve .glb files.\nexport default "' + base64.b64encode(out).decode() + '";\n')
    print('  written' + (' (+ .glb.js)' if os.path.exists(path + '.js') else ''))

main()
