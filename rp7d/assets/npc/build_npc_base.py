# NPC base: the generic humanoid every Build Lab character starts from. Built on the Rizer rig (same skeleton,
# bone for bone, as rizer.glb and mori.glb, so every clip plays on it and every Rizer 1:1 asset fits it).
# Body: the simple Mori layout (bare torso, bare arms, plain trousers, bare feet) without the undead details —
# no ribs, sternum, scars, rags, torn hems or claws. Face: Rizer's head (jaw, ears, nose) with plain
# features — dot eyes, line brows, line mouth. No hair, no shirt, no shoes. One primitive per material
# (N_skin, N_pants, N_band, N_eye, N_brow, N_mouth) so each can be recoloured later.
# HEAD SHAPES are their own assets (npc_heads.glb, one node each, all on the Head bone, all the same detail):
# HeadRound and HeadPointed. The base also carries the round skull as N_skull so it reads whole on its own
# (and its head hitbox is measured from a full head); the Build Lab hides N_skull and wears a head shape.
#   python3 build_npc_base.py   (bpy 4.2)  →  npc_base.glb, npc_heads.glb, npc_base.blend beside this script
import bpy, bmesh, math, os
from mathutils import Vector, Matrix
HERE = os.path.dirname(os.path.abspath(__file__))
RIZER_BLEND = os.environ.get('RIZER_BLEND', os.path.join(HERE, '..', 'rizer', 'rizer_lowpoly.blend'))
bpy.ops.wm.open_mainfile(filepath=RIZER_BLEND)
rig = bpy.data.objects['RizerRig']; rig.name = 'NpcRig'
bpy.data.objects.remove(bpy.data.objects['RizerBody'], do_unlink=True)
for m in list(bpy.data.materials): bpy.data.materials.remove(m)
B = lambda n: 'mixamorig:' + n
def head(n): return rig.matrix_world @ rig.data.bones[B(n)].head_local
def tail(n): return rig.matrix_world @ rig.data.bones[B(n)].tail_local
def hexc(h): h = h.lstrip('#'); return [((int(h[i:i+2], 16) / 255) ** 2.2) for i in (0, 2, 4)] + [1]
MATS = {}
def mat(name, col, rough=0.8):
    m = bpy.data.materials.new('N_' + name); m.use_nodes = True
    bs = m.node_tree.nodes['Principled BSDF']
    bs.inputs['Base Color'].default_value = hexc(col); bs.inputs['Roughness'].default_value = rough; bs.inputs['Metallic'].default_value = 0
    m.diffuse_color = hexc(col); m.roughness = rough; MATS[name] = len(MATS); return m
mats = [mat('skin', '#a8795a', 0.75), mat('skull', '#a8795a', 0.75), mat('pants', '#6a6152', 0.95), mat('band', '#4e473c', 0.95),
        mat('eye', '#16110d', 0.4), mat('brow', '#2b2119', 0.8), mat('mouth', '#5a3426', 0.7)]

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
def ring(a, b, r, m, bone, n=8): prism(a, b, r, r, n, m, bone, cap=False)

# ── head: Rizer's (same skull, jaw, ears and nose, same place, same 1.12 head scale below) ──
Hc = Vector((0, -0.352, 1.69))
ico(Hc, (0.1, 0.118, 0.13), 'skull', B('Head'), sub=2)                                         # the round skull (see HEAD SHAPES)
ico(Hc + Vector((0, -0.04, -0.075)), (0.075, 0.07, 0.05), 'skin', B('Head'), sub=2)           # jaw
for sx in (-1, 1):
    box(Hc + Vector((sx * 0.041, -0.113, 0.004)), (0.015, 0.01, 0.015), 'eye', B('Head'))          # dot eyes
    box(Hc + Vector((sx * 0.043, -0.114, 0.028)), (0.04, 0.01, 0.007), 'brow', B('Head'))  # line brows, level
    box(Hc + Vector((sx * 0.1, 0.0, 0.0)), (0.018, 0.04, 0.05), 'skin', B('Head'))                # ears
box(Hc + Vector((0, -0.125, -0.018)), (0.018, 0.02, 0.035), 'skin', B('Head'), rx=0.3)             # nose
box(Hc + Vector((0, -0.112, -0.058)), (0.034, 0.008, 0.006), 'mouth', B('Head'))                  # line mouth
# ── neck and bare torso: smooth, no ribs ──
N0, N1 = head('Neck'), tail('Neck')
prism(N0 + Vector((0, 0, -0.02)), N1 + Vector((0, -0.01, 0.03)), (0.047, 0.046), (0.044, 0.043), 6, 'skin', B('Neck'))
S2, S1, S0, HP = head('Spine2'), head('Spine1'), head('Spine'), head('Hips')
prism(S2 + Vector((0, 0, -0.01)), tail('Spine2') + Vector((0, 0, 0.02)), (0.14, 0.092), (0.172, 0.1), 8, 'skin', B('Spine2'))   # chest
prism(S1, S2, (0.128, 0.086), (0.14, 0.092), 8, 'skin', B('Spine1'))
prism(S0 + Vector((0, 0, -0.02)), S1, (0.124, 0.084), (0.128, 0.086), 8, 'skin', B('Spine'))
# ── plain trousers: hips, a waistband, straight legs to the ankle ──
prism(HP + Vector((0, 0, -0.06)), S0 + Vector((0, 0, 0.02)), (0.138, 0.092), (0.128, 0.087), 8, 'pants', B('Hips'))
ring(HP + Vector((0, 0, 0.055)), HP + Vector((0, 0, 0.095)), (0.134, 0.09), 'band', B('Hips'), n=10)
# ── limbs ──
for side, sx in (('Left', 1), ('Right', -1)):
    S = lambda n: side + n
    a0, a1, e1, h1 = head(S('Arm')), tail(S('Arm')), tail(S('ForeArm')), tail(S('Hand'))
    ico(a0 + Vector((sx * 0.005, 0, -0.01)), (0.056, 0.053, 0.056), 'skin', B(S('Arm')))            # shoulder
    prism(a0, a1, (0.05, 0.047), (0.041, 0.039), 7, 'skin', B(S('Arm')))
    ico(a1, (0.04, 0.04, 0.04), 'skin', B(S('ForeArm')))                                             # elbow
    prism(a1, e1, (0.041, 0.039), (0.032, 0.03), 7, 'skin', B(S('ForeArm')))
    prism(e1, lerp(e1, h1, 0.55), (0.03, 0.042), (0.026, 0.047), 4, 'skin', B(S('Hand')), rot=math.pi / 4)        # palm
    prism(lerp(e1, h1, 0.5), lerp(e1, h1, 1.0), (0.022, 0.042), (0.017, 0.036), 4, 'skin', B(S('Hand')), rot=math.pi / 4)  # fingers
    k0, k1, an, toe = head(S('UpLeg')), tail(S('UpLeg')), tail(S('Leg')), tail(S('ToeBase'))
    prism(k0 + Vector((0, 0, 0.03)), k1, (0.085, 0.083), (0.062, 0.062), 8, 'pants', B(S('UpLeg')))
    ico(k1, (0.062, 0.062, 0.062), 'pants', B(S('Leg')))                                             # knee
    prism(k1, an + Vector((0, 0, 0.035)), (0.062, 0.062), (0.056, 0.056), 8, 'pants', B(S('Leg')))  # straight leg to the ankle
    prism(an + Vector((0, 0, 0.05)), an + Vector((0, 0, -0.08)), (0.034, 0.034), (0.036, 0.036), 6, 'skin', B(S('Leg')))  # ankle, down into the foot
    fx, tb = an.x + sx * 0.005, head(S('ToeBase'))
    y0, y1 = an.y + 0.045, tb.y - 0.01                                                               # heel → ball of the foot
    box((fx, (y0 + y1) / 2, 0.055), (0.085, y0 - y1, 0.11), 'skin', B(S('Foot')))                    # bare foot, up to the ankle
    box((fx + sx * 0.005, (tb.y + toe.y) / 2 - 0.005, 0.03), (0.085, tb.y - toe.y + 0.03, 0.06), 'skin', B(S('ToeBase')))  # toes

# ── assemble ── (Rizer's head scale, about the same point)
P = Vector((0, -0.34, 1.585))
def make(name):
    """Turn the pieces collected so far into one skinned object on the rig, then start a fresh list."""
    V[:] = [P + (v - P) * 1.12 if g == B('Head') else v for v, g in zip(V, VG)]
    me = bpy.data.meshes.new(name); me.from_pydata([tuple(v) for v in V], [], F)
    used = sorted(set(FM))
    for i in used: me.materials.append(mats[i])
    for p, i in zip(me.polygons, FM): p.material_index = used.index(i)
    me.update()
    ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob)
    for bn in sorted(set(VG)):
        g = ob.vertex_groups.new(name=bn); g.add([i for i, b in enumerate(VG) if b == bn], 1.0, 'REPLACE')
    ob.parent = rig; ob.matrix_parent_inverse = rig.matrix_world.inverted()
    mod = ob.modifiers.new('Armature', 'ARMATURE'); mod.object = rig
    print(name, 'verts', len(me.vertices), 'tris', sum(len(p.vertices) - 2 for p in me.polygons))
    V.clear(); F.clear(); FM.clear(); VG.clear(); return ob
body = make('NpcBody')
# ── head shapes: same skull volume and placement, same detail; only the form differs ──
ico(Hc, (0.1, 0.118, 0.13), 'skin', B('Head'), sub=2); round_ = make('HeadRound')       # smooth dome
ico(Hc, (0.1, 0.118, 0.13), 'skin', B('Head'), sub=1); pointed = make('HeadPointed')    # faceted, peaked crown (Rizer's own skull)

OUT = os.environ.get('NPC_OUT', HERE)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, 'npc_base.blend'))
def export(path, objs, anims):
    bpy.ops.object.select_all(action='DESELECT')
    for o in [rig, *objs]: o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, path), export_format='GLB', use_selection=True, export_animations=anims, export_animation_mode='NLA_TRACKS', export_skins=True, export_yup=True)
export('npc_base.glb', [body], True)
export('npc_heads.glb', [round_, pointed], False)
