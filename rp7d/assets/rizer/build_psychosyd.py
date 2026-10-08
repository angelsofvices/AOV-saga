# Rizer · Psychosyd costume: green mohawk (shaved sides, tall centre ridge), skull-and-crossbones
# shirt, green astral gems. Built from rizer_lowpoly.blend so the rig and clips are identical.
import bpy, bmesh, math
from mathutils import Vector, Matrix
bpy.ops.wm.open_mainfile(filepath='/mnt/user-data/uploads/Projects/the AOV™  saga/rp7d/assets/rizer/rizer_lowpoly.blend')
ob = bpy.data.objects['RizerBody']; me = ob.data; rig = bpy.data.objects['RizerRig']
def hexc(h): h = h.lstrip('#'); return [((int(h[i:i+2], 16) / 255) ** 2.2) for i in (0, 2, 4)] + [1]
def setcol(name, col, emit=None, strength=None):
    m = bpy.data.materials[name]; bs = m.node_tree.nodes['Principled BSDF']
    bs.inputs['Base Color'].default_value = hexc(col); m.diffuse_color = hexc(col)
    if emit: bs.inputs['Emission Color'].default_value = hexc(emit)
    if strength is not None: bs.inputs['Emission Strength'].default_value = strength
setcol('R_hair', '#2bd64f')                       # Psychosyd green
setcol('R_gem', '#1fd46a', '#3dff7e', 4.0)        # green astral gems
bone_m = bpy.data.materials.new('R_bone'); bone_m.use_nodes = True
bbs = bone_m.node_tree.nodes['Principled BSDF']; bbs.inputs['Base Color'].default_value = hexc('#ece6d6'); bbs.inputs['Roughness'].default_value = 0.6; bone_m.diffuse_color = hexc('#ece6d6')
me.materials.append(bone_m)
MI = {m.name: i for i, m in enumerate(me.materials)}

# ── strip: hair cap + spikes (keep the brows), vest panels, V straps, chest pendant ──
bm = bmesh.new(); bm.from_mesh(me); bm.faces.ensure_lookup_table()
dl = bm.verts.layers.deform.verify()
seen, kill = set(), []
for f in bm.faces:
    if f.index in seen: continue
    stack, comp = [f], []; seen.add(f.index)
    while stack:
        g = stack.pop(); comp.append(g)
        for e in g.edges:
            for h in e.link_faces:
                if h.index not in seen: seen.add(h.index); stack.append(h)
    vs = list({v for g in comp for v in g.verts}); c = sum((v.co for v in vs), Vector()) / len(vs)
    mat = me.materials[comp[0].material_index].name
    front = c.y < -0.40 and 1.2 < c.z < 1.5 and abs(c.x) < 0.16
    if (mat == 'R_hair' and len(vs) != 8) or (mat == 'R_navy' and len(vs) == 8) or (mat == 'R_gold' and len(vs) == 8 and front) or (mat == 'R_gem' and front):
        kill.extend(comp)
bmesh.ops.delete(bm, geom=list(set(kill)), context='FACES')
print('removed faces', len(set(kill)))

groups = {g.name: g.index for g in ob.vertex_groups}
def add(verts, faces, mat, bone):
    vv = [bm.verts.new(p) for p in verts]
    for v in vv: v[dl][groups[bone]] = 1.0
    for f in faces:
        try: nf = bm.faces.new([vv[i] for i in f]); nf.material_index = MI[mat]
        except ValueError: pass
    return vv

# ── mohawk: one serrated fin along the skull's midline, forehead → nape, tallest at the crown ──
P = Vector((0, -0.34, 1.585)); Hc = P + (Vector((0, -0.352, 1.69)) - P) * 1.12; R = Vector((0.1, 0.118, 0.13)) * 1.12
N = 15; base, tip = [], []
for i in range(N):
    t = i / (N - 1); th = math.radians(38 + t * 165)        # 38° = just above the brow, 203° = nape
    d = Vector((0, -math.cos(th), math.sin(th)))
    b = Hc + Vector((0, d.y * R.y, d.z * R.z)) * 0.93
    nrm = Vector((0, d.y / R.y, d.z / R.z)).normalized()
    h = (0.05 + 0.13 * math.sin(math.pi * min(1, t * 1.25)) ** 0.8) * (1.0 if i % 2 == 0 else 0.72)
    sweep = Vector((0, 0.35, 0.1)) * h                        # tips swept back
    base.append(b); tip.append(b + nrm * h + sweep)
V, F = [], []
w0, w1 = 0.028, 0.006
for i in range(N):
    V += [base[i] + Vector((-w0, 0, 0)), base[i] + Vector((w0, 0, 0)), tip[i] + Vector((-w1, 0, 0)), tip[i] + Vector((w1, 0, 0))]
for i in range(N - 1):
    a, b = i * 4, (i + 1) * 4
    F += [(a, b, b + 2, a + 2), (a + 1, a + 3, b + 3, b + 1), (a + 2, b + 2, b + 3, a + 3), (a, a + 1, b + 1, b)]
F += [(0, 2, 3, 1), ((N - 1) * 4, (N - 1) * 4 + 1, (N - 1) * 4 + 3, (N - 1) * 4 + 2)]
add(V, F, 'R_hair', 'mixamorig:Head')
# a short shaved-stubble strip under the ridge so it grows out of the scalp
V, F = [], []
for i in range(N):
    V += [base[i] + Vector((-0.045, 0, 0)) * 1.0 - (base[i] - Hc).normalized() * 0.004, base[i] + Vector((0.045, 0, 0)) - (base[i] - Hc).normalized() * 0.004]
for i in range(N - 1): F.append((i * 2, i * 2 + 2, i * 2 + 3, i * 2 + 1))
add(V, F, 'R_hair', 'mixamorig:Head')

# ── skull-and-crossbones print on the shirt front ──
C = Vector((0, -0.446, 1.37))   # just proud of the chest
def disc(c, rx, rz, n=12, y=0.0):
    vs = [c + Vector((0, y, 0))] + [c + Vector((math.cos(a) * rx, y, math.sin(a) * rz)) for a in [i * 2 * math.pi / n for i in range(n)]]
    fs = [(0, 1 + (i + 1) % n, 1 + i) for i in range(n)]
    return vs, fs
def slab(c, sx, sz, rot, y=0.0, th=0.006):  # flat bar in the chest plane
    q = Matrix.Rotation(rot, 3, 'Y'); vs = []
    for dy in (0, th):
        for px, pz in ((-sx, -sz), (sx, -sz), (sx, sz), (-sx, sz)): vs.append(c + q @ Vector((px, 0, pz)) + Vector((0, y + dy, 0)))
    fs = [(0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)]
    return vs, fs
for rot in (0.78, -0.78):                                              # crossbones behind the skull
    add(*slab(C + Vector((0, 0.002, -0.012)), 0.082, 0.009, rot), 'R_bone', 'mixamorig:Spine2')
    for s in (-1, 1):
        q = Matrix.Rotation(rot, 3, 'Y'); end = C + Vector((0, 0.002, -0.012)) + q @ Vector((s * 0.082, 0, 0))
        for k in (-1, 1): add(*disc(end + q @ Vector((0, 0, k * 0.011)), 0.012, 0.012, 8, y=-0.0005), 'R_bone', 'mixamorig:Spine2')
add(*disc(C + Vector((0, -0.003, 0.012)), 0.046, 0.042, 14), 'R_bone', 'mixamorig:Spine2')          # cranium
add(*slab(C + Vector((0, -0.003, -0.03)), 0.027, 0.014, 0, y=-0.001), 'R_bone', 'mixamorig:Spine2')   # jaw
for s in (-1, 1): add(*disc(C + Vector((s * 0.018, -0.006, 0.008)), 0.012, 0.013, 8), 'R_eye', 'mixamorig:Spine2')  # eye sockets
add(*disc(C + Vector((0, -0.006, -0.012)), 0.006, 0.008, 6), 'R_eye', 'mixamorig:Spine2')          # nose
for k in (-1, 0, 1): add(*slab(C + Vector((k * 0.011, -0.006, -0.032)), 0.0015, 0.011, 0, th=0.001), 'R_eye', 'mixamorig:Spine2')  # teeth lines

bm.to_mesh(me); me.update(); bm.free()
print('verts', len(me.vertices))
bpy.ops.wm.save_as_mainfile(filepath='/home/claude/rz/psy/rizer_psychosyd.blend')
bpy.ops.export_scene.gltf(filepath='/home/claude/rz/psy/rizer_psychosyd.glb', export_format='GLB', export_animations=True, export_animation_mode='NLA_TRACKS', export_skins=True, export_yup=True)
