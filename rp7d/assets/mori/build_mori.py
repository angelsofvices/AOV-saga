# Mori: Malezor's tier-1 undead. Gaunt, bald, grey-green skin stretched over the ribs, sunken eyes,
# jaw hanging open, long clawed hands, a tattered grey waist-wrap over torn trousers, bare feet.
# Built on the same Mixamo rig as Rizer (from rizer_lowpoly.blend) so every clip plays on it.
import bpy, bmesh, math
from mathutils import Vector, Matrix
bpy.ops.wm.open_mainfile(filepath='/mnt/user-data/uploads/Projects/the AOV™  saga/rp7d/assets/rizer/rizer_lowpoly.blend')
rig = bpy.data.objects['RizerRig']; rig.name = 'MoriRig'
bpy.data.objects.remove(bpy.data.objects['RizerBody'], do_unlink=True)
for m in list(bpy.data.materials): bpy.data.materials.remove(m)
B = lambda n: 'mixamorig:' + n
def head(n): return rig.matrix_world @ rig.data.bones[B(n)].head_local
def tail(n): return rig.matrix_world @ rig.data.bones[B(n)].tail_local
def hexc(h): h = h.lstrip('#'); return [((int(h[i:i+2], 16) / 255) ** 2.2) for i in (0, 2, 4)] + [1]
MATS = {}
def mat(name, col, rough=0.85, metal=0.0, emit=None, strength=0):
    m = bpy.data.materials.new('M_' + name); m.use_nodes = True
    bs = m.node_tree.nodes['Principled BSDF']
    bs.inputs['Base Color'].default_value = hexc(col); bs.inputs['Roughness'].default_value = rough; bs.inputs['Metallic'].default_value = metal
    if emit: bs.inputs['Emission Color'].default_value = hexc(emit); bs.inputs['Emission Strength'].default_value = strength
    m.diffuse_color = hexc(col); MATS[name] = len(MATS); return m
mats = [mat('skin', '#a3a692', 0.8), mat('shade', '#6c7163', 0.85), mat('cloth', '#44474a', 0.95), mat('rag', '#2c2e30', 0.95),
        mat('socket', '#121110', 0.6), mat('eye', '#d9d6c2', 0.3, 0, '#c8d2b0', 0.6), mat('mouth', '#240d0b', 0.7), mat('wound', '#4b2a22', 0.7), mat('nail', '#595a4c', 0.5)]
exec(open('/home/claude/rz/mori_helpers.py').read())

# ── head: long, bald, hollow-cheeked, jaw hanging open ──
H0, H1 = head('Head'), tail('Head')
Hc = H0 + Vector((0, -0.018, 0.13))
ico(Hc, (0.088, 0.105, 0.125), 'skin', B('Head'), sub=2)                                 # skull
ico(Hc + Vector((0, -0.028, -0.1)), (0.058, 0.06, 0.05), 'skin', B('Head'))              # jaw, dropped
box(Hc + Vector((0, -0.085, -0.078)), (0.04, 0.02, 0.05), 'mouth', B('Head'))            # open mouth
for sx in (-1, 1):
    ico(Hc + Vector((sx * 0.036, -0.088, 0.012)), (0.024, 0.014, 0.02), 'socket', B('Head'))   # sunken sockets
    ico(Hc + Vector((sx * 0.036, -0.097, 0.012)), (0.009, 0.005, 0.009), 'eye', B('Head'))      # pale pupils
    box(Hc + Vector((sx * 0.065, -0.06, -0.035)), (0.018, 0.04, 0.05), 'shade', B('Head'), rz=sx * 0.35)  # hollow cheeks
    box(Hc + Vector((sx * 0.09, 0.0, -0.005)), (0.014, 0.03, 0.045), 'skin', B('Head'))        # ears
    box(Hc + Vector((sx * 0.038, -0.092, 0.036)), (0.03, 0.012, 0.008), 'shade', B('Head'), ry=sx * 0.25)  # heavy brow
box(Hc + Vector((0, -0.106, -0.02)), (0.014, 0.018, 0.03), 'skin', B('Head'), rx=0.3)    # nose
# ── neck: long and corded ──
N0, N1 = head('Neck'), tail('Neck')
prism(N0 + Vector((0, 0, -0.02)), N1 + Vector((0, -0.01, 0.03)), (0.04, 0.038), (0.036, 0.034), 6, 'skin', B('Neck'))
for sx in (-1, 1): prism(N0 + Vector((sx * 0.022, -0.03, -0.01)), N1 + Vector((sx * 0.008, -0.035, 0.0)), (0.009, 0.009), (0.007, 0.007), 4, 'shade', B('Neck'))
# ── torso: narrow, ribs showing, wounds ──
S2, S1, S0, HP = head('Spine2'), head('Spine1'), head('Spine'), head('Hips')
prism(S2 + Vector((0, 0, -0.01)), tail('Spine2') + Vector((0, 0, 0.02)), (0.125, 0.082), (0.16, 0.088), 8, 'skin', B('Spine2'))   # chest
prism(S1, S2, (0.105, 0.072), (0.125, 0.082), 8, 'skin', B('Spine1'))                  # ribs
prism(S0 + Vector((0, 0, -0.02)), S1, (0.095, 0.066), (0.105, 0.072), 8, 'skin', B('Spine'))  # sunken belly
for i in range(5):  # rib ridges across the front
    z = S1.z + 0.02 + i * 0.045; w = 0.09 + 0.012 * i; y = S1.y - 0.075 - i * 0.004
    for sx in (-1, 1): box((sx * w * 0.55, y, z), (w * 0.8, 0.008, 0.009), 'shade', B('Spine2') if z > S2.z else B('Spine1'), ry=sx * -0.35)
box((0, S1.y - 0.08, S1.z + 0.09), (0.012, 0.008, 0.2), 'shade', B('Spine1'))            # sternum
box((-0.06, S2.y - 0.09, S2.z + 0.07), (0.012, 0.006, 0.14), 'wound', B('Spine2'), ry=0.5)   # scar
box((0.09, S2.y - 0.07, S2.z + 0.11), (0.05, 0.02, 0.03), 'wound', B('Spine2'), rz=0.3)      # torn shoulder
prism(HP + Vector((0, 0, -0.06)), S0 + Vector((0, 0, 0.02)), (0.12, 0.08), (0.098, 0.068), 8, 'cloth', B('Hips'))   # pelvis
# tattered waist-wrap: a band plus hanging flaps
ring(HP + Vector((0, 0, 0.03)), HP + Vector((0, 0, 0.1)), (0.128, 0.088), 'rag', B('Hips'), n=10)
for k in range(9):
    a = math.radians(-100 + k * 25); d = Vector((math.sin(a), -math.cos(a), 0))
    top = HP + Vector((d.x * 0.13, d.y * 0.09, 0.04)); L = 0.14 + 0.1 * ((k * 37) % 5) / 4
    box(top + Vector((0, 0, -L / 2)) + d * 0.01, (0.055, 0.012, L), 'rag', B('Hips'), rz=-a + (0.15 if k % 2 else -0.1))
# ── limbs: thin, long, claws ──
for side, sx in (('Left', 1), ('Right', -1)):
    S = lambda n: side + n
    a0, a1, e1, h1 = head(S('Arm')), tail(S('Arm')), tail(S('ForeArm')), tail(S('Hand'))
    ico(a0 + Vector((sx * 0.005, 0, -0.01)), (0.048, 0.044, 0.048), 'skin', B(S('Arm')))        # bony shoulder
    prism(a0, a1, (0.04, 0.038), (0.03, 0.029), 6, 'skin', B(S('Arm')))
    ico(a1, (0.031, 0.031, 0.031), 'skin', B(S('ForeArm')))                                      # knobbly elbow
    prism(a1, e1, (0.032, 0.03), (0.024, 0.022), 6, 'skin', B(S('ForeArm')))
    box(lerp(a1, e1, 0.5) + Vector((0, -0.028, 0)), (0.012, 0.004, 0.1), 'wound', B(S('ForeArm')), rz=0.2)
    prism(e1, lerp(e1, h1, 0.42), (0.022, 0.04), (0.018, 0.045), 4, 'skin', B(S('Hand')), rot=math.pi / 4)   # bony hand
    base = lerp(e1, h1, 0.4)
    for f in range(4):  # long clawed fingers, curled
        off = Vector((sx * (-0.02 + f * 0.014), -0.012, 0))
        cone(base + off, (Vector(h1 - e1).normalized() + Vector((0, -0.35, 0))).normalized(), 0.008, 0.15, 'skin', B(S('Hand')), 4)
        cone(base + off + (Vector(h1 - e1).normalized() + Vector((0, -0.35, 0))).normalized() * 0.14, (Vector(h1 - e1).normalized() + Vector((0, -0.9, 0))).normalized(), 0.005, 0.035, 'nail', B(S('Hand')), 3)
    cone(lerp(e1, h1, 0.3) + Vector((sx * 0.025, -0.03, 0)), Vector((sx * 0.3, -0.6, -1)).normalized(), 0.008, 0.1, 'skin', B(S('Hand')), 4)  # thumb
    # legs: torn trousers to mid-shin, bare feet
    k0, k1, an, toe = head(S('UpLeg')), tail(S('UpLeg')), tail(S('Leg')), tail(S('ToeBase'))
    prism(k0 + Vector((0, 0, 0.03)), k1, (0.075, 0.074), (0.056, 0.056), 8, 'cloth', B(S('UpLeg')))
    ico(k1, (0.056, 0.056, 0.056), 'cloth', B(S('Leg')))
    prism(k1, lerp(k1, an, 0.55), (0.056, 0.056), (0.058, 0.06), 8, 'cloth', B(S('Leg')))          # ragged cuff
    for j in range(5):  # torn hem strips
        a = j * 2 * math.pi / 5; hp = lerp(k1, an, 0.55) + Vector((math.cos(a) * 0.05, math.sin(a) * 0.05, -0.035 - 0.02 * (j % 2)))
        box(hp, (0.03, 0.03, 0.06), 'rag', B(S('Leg')), rz=a)
    box(lerp(k0, k1, 0.45) + Vector((sx * 0.06, -0.05, 0)), (0.02, 0.03, 0.09), 'skin', B(S('UpLeg')))  # rip showing skin
    prism(lerp(k1, an, 0.5), an, (0.034, 0.034), (0.03, 0.03), 6, 'skin', B(S('Leg')))              # bare shin
    fx = an.x + sx * 0.005
    box((fx, an.y - 0.06, 0.045), (0.08, 0.17, 0.08), 'skin', B(S('Foot')))                          # bare foot
    box((fx + sx * 0.005, toe.y + 0.02, 0.03), (0.08, 0.1, 0.05), 'skin', B(S('ToeBase')))
    for t in range(4): box((fx + sx * 0.005 + (t - 1.5) * 0.018, toe.y - 0.03, 0.02), (0.012, 0.03, 0.02), 'shade', B(S('ToeBase')))

me = bpy.data.meshes.new('MoriBody'); me.from_pydata([tuple(v) for v in V], [], F)
for m in mats: me.materials.append(m)
for p, i in zip(me.polygons, FM): p.material_index = i
me.update()
ob = bpy.data.objects.new('MoriBody', me); bpy.context.scene.collection.objects.link(ob)
for bn in sorted(set(VG)):
    g = ob.vertex_groups.new(name=bn); g.add([i for i, b in enumerate(VG) if b == bn], 1.0, 'REPLACE')
ob.parent = rig; ob.matrix_parent_inverse = rig.matrix_world.inverted()
mod = ob.modifiers.new('Armature', 'ARMATURE'); mod.object = rig
print('verts', len(me.vertices), 'tris', sum(len(p.vertices) - 2 for p in me.polygons))
bpy.ops.wm.save_as_mainfile(filepath='/home/claude/rz/mori/mori_lowpoly.blend')
bpy.ops.export_scene.gltf(filepath='/home/claude/rz/mori/mori.glb', export_format='GLB', export_animations=True, export_animation_mode='NLA_TRACKS', export_skins=True, export_yup=True)
