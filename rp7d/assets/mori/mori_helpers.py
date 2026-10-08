V, F, FM, VG = [], [], [], []
def add_bm(bm, M, m, bone):
    base = len(V)
    for v in bm.verts: V.append(M @ v.co); VG.append(bone)
    for f in bm.faces: F.append([base + v.index for v in f.verts]); FM.append(MATS[m])
    bm.free()
def basis(d):
    ref = Vector((1, 0, 0)) if abs(d.x) < 0.9 else Vector((0, 1, 0))
    u = (ref - d * d.dot(ref)).normalized(); w = d.cross(u); return u, w
def prism(a, b, ra, rb, n, m, bone, rot=None, cap=True):
    """Tapered n-gon tube a→b; ra/rb are (rx, ry) radii across the bone."""
    a, b = Vector(a), Vector(b); d = (b - a).normalized(); u, w = basis(d)
    rot = math.pi / n if rot is None else rot
    bm = bmesh.new(); rings = []
    for c, r in ((a, ra), (b, rb)):
        rings.append([bm.verts.new(c + u * math.cos(rot + i * 2 * math.pi / n) * r[0] + w * math.sin(rot + i * 2 * math.pi / n) * r[1]) for i in range(n)])
    for i in range(n): bm.faces.new((rings[0][i], rings[0][(i + 1) % n], rings[1][(i + 1) % n], rings[1][i]))
    if cap: bm.faces.new(rings[0][::-1]); bm.faces.new(rings[1])
    bm.verts.index_update(); add_bm(bm, Matrix(), m, bone)
def lerp(a, b, t): return Vector(a).lerp(Vector(b), t)
def box(c, s, m, bone, rz=0, rx=0, ry=0):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1); bm.verts.index_update()
    M = Matrix.Translation(Vector(c)) @ (Matrix.Rotation(rz, 4, 'Z') @ Matrix.Rotation(rx, 4, 'X') @ Matrix.Rotation(ry, 4, 'Y')) @ Matrix.Diagonal((*s, 1))
    add_bm(bm, M, m, bone)
def ico(c, s, m, bone, sub=1):
    bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=1); bm.verts.index_update()
    add_bm(bm, Matrix.Translation(Vector(c)) @ Matrix.Diagonal((*s, 1)), m, bone)
def octa(c, s, m, bone, rz=0):
    bm = bmesh.new(); vs = [bm.verts.new(p) for p in [(1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1)]]
    for f in [(0,2,4),(2,1,4),(1,3,4),(3,0,4),(2,0,5),(1,2,5),(3,1,5),(0,3,5)]: bm.faces.new([vs[i] for i in f])
    bm.verts.index_update(); add_bm(bm, Matrix.Translation(Vector(c)) @ Matrix.Rotation(rz, 4, 'Z') @ Matrix.Diagonal((*s, 1)), m, bone)
def cone(base, direction, r, L, m, bone, seg=4):
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=0, depth=L); bm.verts.index_update()
    d = Vector(direction).normalized(); q = Vector((0, 0, 1)).rotation_difference(d)
    add_bm(bm, Matrix.Translation(Vector(base)) @ q.to_matrix().to_4x4() @ Matrix.Translation((0, 0, L / 2)), m, bone)
def ring(a, b, r, m, bone, n=8):  # thin band a→b
    prism(a, b, r, r, n, m, bone, cap=False)

