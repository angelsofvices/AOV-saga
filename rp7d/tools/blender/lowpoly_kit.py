import bpy, bmesh, math
from mathutils import Vector, Matrix, Quaternion
import os
RIG_FBX = os.environ.get('RIG_FBX', '/mnt/user-data/uploads/elzoran/SK_Elzoran.fbx')
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=RIG_FBX)
rig = bpy.data.objects['ElzoranRig']
if not os.environ.get('KEEP_BODY'):
    bpy.data.objects.remove(bpy.data.objects['ElzoranBody'], do_unlink=True)
    for m in list(bpy.data.materials): bpy.data.materials.remove(m)
B = lambda n: 'mixamorig:' + n
def head(n): return rig.matrix_world @ rig.data.bones[B(n)].head_local
def tail(n): return rig.matrix_world @ rig.data.bones[B(n)].tail_local
def hexc(h): h = h.lstrip('#'); return [((int(h[i:i+2], 16) / 255) ** 2.2) for i in (0, 2, 4)] + [1]

# ── palette (from the Rizer sheet) ──
MATS = {}; mats = []
def mat(name, col, rough=0.8, metal=0.0, emit=None, strength=0):
    m = bpy.data.materials.new('R_' + name); m.use_nodes = True
    bs = m.node_tree.nodes['Principled BSDF']
    bs.inputs['Base Color'].default_value = hexc(col); bs.inputs['Roughness'].default_value = rough; bs.inputs['Metallic'].default_value = metal
    if emit: bs.inputs['Emission Color'].default_value = hexc(emit); bs.inputs['Emission Strength'].default_value = strength
    m.diffuse_color = hexc(col); m.metallic = metal; m.roughness = rough
    MATS[name] = len(MATS); mats.append(m); return m

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


# ── combat clips (authored on the shared Mixamo rig) ──
sc = bpy.context.scene
def _aim(pb, d):
    d = (rig.matrix_world.inverted().to_3x3() @ Vector(d)).normalized()
    cur = (pb.tail - pb.head).normalized(); q = cur.rotation_difference(d)
    h = pb.head.copy(); pb.matrix = Matrix.Translation(h) @ q.to_matrix().to_4x4() @ Matrix.Translation(-h) @ pb.matrix
    bpy.context.view_layer.update()
def _turn(pb, axis, ang):
    ax = (rig.matrix_world.inverted().to_3x3() @ Vector(axis)).normalized(); q = Quaternion(ax, ang)
    h = pb.head.copy(); pb.matrix = Matrix.Translation(h) @ q.to_matrix().to_4x4() @ Matrix.Translation(-h) @ pb.matrix
    bpy.context.view_layer.update()
def _base():
    rig.animation_data.action = bpy.data.actions[[a.name for a in bpy.data.actions if a.name.endswith('Idle')][0]]
    sc.frame_set(1); rig.animation_data.action = None
    snap = {pb.name: (pb.location.copy(), pb.rotation_quaternion.copy()) for pb in rig.pose.bones}
    for pb in rig.pose.bones: pb.rotation_mode = 'QUATERNION'
    return snap
def _restore(snap):
    for pb in rig.pose.bones: pb.location, pb.rotation_quaternion = snap[pb.name][0].copy(), snap[pb.name][1].copy()
    bpy.context.view_layer.update()
def P(n): return rig.pose.bones[B(n)]
def guard(side, sx):   # fists up in front of the face
    _aim(P(side + 'Arm'), (sx * 0.3, -0.45, -0.84)); _aim(P(side + 'ForeArm'), (-sx * 0.25, -0.55, 0.8)); _aim(P(side + 'Hand'), (-sx * 0.2, -0.4, 0.9))
def make_clip(name, keys):
    snap = _base(); act = bpy.data.actions.new(name); curves = {}
    for frame, pose in keys:
        _restore(snap); pose()
        for pb in rig.pose.bones:
            for prop, n in (('location', 3), ('rotation_quaternion', 4)):
                path = f'pose.bones["{pb.name}"].{prop}'
                for i in range(n):
                    fc = curves.get((path, i)) or curves.setdefault((path, i), act.fcurves.new(path, index=i, action_group=pb.name))
                    fc.keyframe_points.insert(frame, getattr(pb, prop)[i]).interpolation = 'BEZIER'
    _restore(snap); return act
def combat_clips():
    def stance(): guard('Left', 1); guard('Right', -1); _turn(P('Spine1'), (0, 0, 1), -0.12)
    def wind(): stance(); _turn(P('Spine1'), (0, 0, 1), -0.15)
    def jab():
        _turn(P('Spine1'), (0, 0, 1), 0.28); _turn(P('Spine2'), (0, 0, 1), 0.12); guard('Left', 1)
        _aim(P('RightArm'), (0.12, -1, 0.06)); _aim(P('RightForeArm'), (0.18, -1, 0.04)); _aim(P('RightHand'), (0.18, -1, 0.04))
    make_clip('Punch', [(0, lambda: None), (2, wind), (5, jab), (9, jab), (14, stance), (17, lambda: None)])
    def chamber():
        stance(); _turn(P('Spine'), (1, 0, 0), -0.12)
        _aim(P('RightUpLeg'), (0.05, -0.85, -0.5)); _aim(P('RightLeg'), (0, 0.15, -1)); _aim(P('RightFoot'), (0, -0.6, -0.8))
    def extend():
        stance(); _turn(P('Spine'), (1, 0, 0), -0.25)
        _aim(P('RightUpLeg'), (0.05, -0.95, 0.05)); _aim(P('RightLeg'), (0.05, -1, 0.12)); _aim(P('RightFoot'), (0, -0.4, 0.9))
    make_clip('Kick', [(0, lambda: None), (5, chamber), (9, extend), (13, extend), (18, chamber), (23, lambda: None)])

def finish(name, out_dir, center_y=0.4):
    """Skin the collected geometry to the rig, add all clips as NLA tracks, save .blend + .glb."""
    me = bpy.data.meshes.new(name + 'Body'); me.from_pydata([tuple(v) for v in V], [], F)
    for m in mats: me.materials.append(m)
    for p, i in zip(me.polygons, FM): p.material_index = i
    me.update()
    ob = bpy.data.objects.new(name + 'Body', me); bpy.context.scene.collection.objects.link(ob)
    for bn in sorted(set(VG)):
        g = ob.vertex_groups.new(name=bn); g.add([i for i, b in enumerate(VG) if b == bn], 1.0, 'REPLACE')
    ob.parent = rig; ob.matrix_parent_inverse = rig.matrix_world.inverted()
    ob.modifiers.new('Armature', 'ARMATURE').object = rig
    rig.name = name + 'Rig'
    combat_clips()
    for a in list(bpy.data.actions):
        short = a.name.split('|')[-1]; a.name = short
        tr = rig.animation_data.nla_tracks.new(); tr.name = short; tr.strips.new(short, int(a.frame_range[0]), a)
    rig.animation_data.action = None
    rig.location.y += center_y   # centre the character on the controller's collision circle
    print(name, 'verts', len(me.vertices), 'tris', sum(len(p.vertices) - 2 for p in me.polygons), 'clips', [a.name for a in bpy.data.actions])
    bpy.ops.wm.save_as_mainfile(filepath=f'{out_dir}/{name.lower()}_lowpoly.blend')
    bpy.ops.export_scene.gltf(filepath=f'{out_dir}/{name.lower()}.glb', export_format='GLB', export_animations=True,
                              export_animation_mode='NLA_TRACKS', export_skins=True, export_yup=True)
