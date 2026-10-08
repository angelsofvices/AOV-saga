# Rizer — low-poly placeholder built from the Rizer character sheet.
# Run: python3 build_rizer.py   (needs `pip install bpy`, Blender 4.2 API)
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lowpoly_kit import *
for _m in [mat('skin', '#8a5a3c', 0.7), mat('hair', '#1f45d8', 0.55), mat('cloth', '#16171b', 0.85), mat('navy', '#15245a', 0.7),
        mat('gold', '#c8923c', 0.35, 0.85), mat('leather', '#5c3322', 0.65), mat('boot', '#0d0e11', 0.28, 0.15),
        mat('gem', '#2e6cff', 0.15, 0.1, '#3f82ff', 4.0), mat('eye', '#2a1709', 0.3), mat('lip', '#5e2f22', 0.6)]: pass

# ── head ──
Hc = Vector((0, -0.352, 1.69))
ico(Hc, (0.1, 0.118, 0.13), 'skin', B('Head'))
ico(Hc + Vector((0, -0.04, -0.075)), (0.075, 0.07, 0.05), 'skin', B('Head'))              # jaw
for sx in (-1, 1):
    box(Hc + Vector((sx * 0.041, -0.112, 0.004)), (0.03, 0.01, 0.013), 'eye', B('Head'))       # eyes
    box(Hc + Vector((sx * 0.043, -0.113, 0.027)), (0.042, 0.012, 0.009), 'hair', B('Head'), ry=sx * -0.18)  # brows
    box(Hc + Vector((sx * 0.1, 0.0, 0.0)), (0.018, 0.04, 0.05), 'skin', B('Head'))            # ears
box(Hc + Vector((0, -0.125, -0.018)), (0.018, 0.02, 0.035), 'skin', B('Head'), rx=0.3)        # nose
box(Hc + Vector((0, -0.112, -0.058)), (0.036, 0.008, 0.007), 'lip', B('Head'))               # mouth
# hair: a cap plus spikes swept up/back, bangs forward over the brow
Cc = Hc + Vector((0, 0.022, 0.045)); Cs = Vector((0.113, 0.123, 0.118))
ico(Cc, Cs, 'hair', B('Head'))
def dirv(az, el): az, el = math.radians(az), math.radians(el); return Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el)))
def spike(az, el, push, L, r, seg=4):
    n = dirv(az, el); base = Cc + Vector((n.x * Cs.x, n.y * Cs.y, n.z * Cs.z)) * 0.8
    cone(base, (n + Vector(push)).normalized(), r, L, 'hair', B('Head'), seg)
for az in range(0, 360, 45): spike(az + 20, 58, (0, 0.35, 0.5), 0.15, 0.05)                 # crown
for az in range(60, 301, 30): spike(az, 18, (0, 0.5, 0.15), 0.14, 0.048)                     # sides + back
for az in range(90, 271, 45): spike(az, -15, (0, 0.6, -0.2), 0.12, 0.045)                   # nape
spike(0, 88, (0, 0.2, 1), 0.14, 0.05); spike(180, 70, (0, 0.8, 0.5), 0.14, 0.05)
for az, sx in ((-38, -0.5), (-18, -0.25), (0, 0.05), (18, 0.25), (38, 0.5)):                 # bangs
    spike(az, 38, (sx, -0.9, -0.55), 0.11, 0.035)
for sx in (-1, 1): spike(sx * 78, 8, (sx * 0.4, -0.3, -0.7), 0.12, 0.035)                    # side locks

# ── neck, collar, torso ──
prism((0, -0.33, 1.47), (0, -0.345, 1.6), (0.048, 0.048), (0.045, 0.045), 6, 'skin', B('Neck'))
def collar():  # high flared collar, open at the throat
    bm = bmesh.new(); n = 9; lo, hi = [], []
    for i in range(n):
        a = math.radians(40 + i * 280 / (n - 1)); s, c = math.sin(a), -math.cos(a)
        lo.append(bm.verts.new((s * 0.085, -0.33 + c * 0.075, 1.455))); hi.append(bm.verts.new((s * 0.105, -0.33 + c * 0.095, 1.585)))
    for i in range(n - 1): bm.faces.new((lo[i], lo[i + 1], hi[i + 1], hi[i]))
    bm.verts.index_update(); add_bm(bm, Matrix(), 'cloth', B('Spine2'))
    for i in range(n - 1):
        a0, a1 = math.radians(40 + i * 280 / (n - 1)), math.radians(40 + (i + 1) * 280 / (n - 1))
        p0 = Vector((math.sin(a0) * 0.106, -0.33 - math.cos(a0) * 0.096, 1.587)); p1 = Vector((math.sin(a1) * 0.106, -0.33 - math.cos(a1) * 0.096, 1.587))
        prism(p0, p1, (0.008, 0.008), (0.008, 0.008), 4, 'gold', B('Spine2'))
collar()
prism((0, -0.33, 1.29), (0, -0.32, 1.46), (0.15, 0.1), (0.185, 0.11), 8, 'cloth', B('Spine2'))    # chest
prism((0, -0.35, 1.19), (0, -0.335, 1.3), (0.138, 0.094), (0.15, 0.1), 8, 'cloth', B('Spine1'))   # ribs
prism((0, -0.37, 1.1), (0, -0.355, 1.2), (0.135, 0.092), (0.138, 0.094), 8, 'cloth', B('Spine'))  # waist
prism((0, -0.41, 0.95), (0, -0.4, 1.11), (0.15, 0.1), (0.14, 0.095), 8, 'cloth', B('Hips'))     # pelvis
# vest front: navy panels, gold X-straps, pendant gem
for sx in (-1, 1):
    box((sx * 0.07, -0.43, 1.37), (0.075, 0.012, 0.15), 'navy', B('Spine2'), ry=sx * 0.05)
    box((sx * 0.07, -0.438, 1.37), (0.018, 0.01, 0.2), 'gold', B('Spine2'), ry=sx * 0.55)       # V straps
    box((sx * 0.13, -0.425, 1.435), (0.03, 0.012, 0.026), 'gold', B('Spine2'))                  # shoulder buckles
    box((sx * 0.085, -0.405, 1.24), (0.07, 0.012, 0.09), 'navy', B('Spine1'))
    box((sx * 0.16, -0.33, 1.44), (0.075, 0.12, 0.028), 'cloth', B('Spine2'))                  # shoulder yoke
    box((sx * 0.162, -0.33, 1.456), (0.072, 0.02, 0.008), 'gold', B('Spine2'))
box((0, -0.435, 1.3), (0.2, 0.01, 0.014), 'gold', B('Spine2'))
octa((0, -0.452, 1.35), (0.028, 0.012, 0.042), 'gem', B('Spine2'))
box((0, -0.442, 1.35), (0.05, 0.008, 0.07), 'gold', B('Spine2'), ry=math.pi / 4)
for sx in (-1, 1): box((sx * 0.012, -0.44, 1.41), (0.006, 0.006, 0.12), 'gold', B('Spine2'), ry=sx * -0.35)  # pendant chain
# back X-straps
for sx in (-1, 1): box((0, -0.212, 1.36), (0.02, 0.01, 0.28), 'gold', B('Spine2'), ry=sx * 0.6)
# belt with the sun buckle
ring((0, -0.405, 1.06), (0, -0.405, 1.11), (0.156, 0.106), 'leather', B('Hips'))
prism((0, -0.515, 1.085), (0, -0.53, 1.085), (0.045, 0.045), (0.045, 0.045), 8, 'gold', B('Hips'))
prism((0, -0.522, 1.085), (0, -0.534, 1.085), (0.03, 0.03), (0.03, 0.03), 8, 'navy', B('Hips'))
octa((0, -0.538, 1.085), (0.016, 0.008, 0.02), 'gem', B('Hips'))
for sx in (-1, 1): box((sx * 0.1, -0.5, 1.085), (0.022, 0.012, 0.04), 'gold', B('Hips'))

# ── limbs ──
for side, sx in (('Left', 1), ('Right', -1)):
    S = lambda n: side + n
    a0, a1, e1, h1 = head(S('Arm')), tail(S('Arm')), tail(S('ForeArm')), tail(S('Hand'))
    ico(a0 + Vector((sx * 0.005, 0, -0.01)), (0.062, 0.058, 0.062), 'skin', B(S('Arm')))           # deltoid
    prism(a0, a1, (0.056, 0.052), (0.045, 0.043), 7, 'skin', B(S('Arm')))
    ico(a1, (0.043, 0.043, 0.043), 'skin', B(S('ForeArm')))
    prism(a1, e1, (0.045, 0.043), (0.036, 0.034), 7, 'skin', B(S('ForeArm')))
    prism(lerp(a1, e1, 0.45), lerp(e1, h1, 0.1), (0.05, 0.048), (0.045, 0.043), 8, 'cloth', B(S('ForeArm')))   # bracer
    for t in (0.5, 0.9): ring(lerp(a1, e1, t), lerp(a1, e1, t + 0.06), (0.052, 0.05), 'gold', B(S('ForeArm')))
    octa(lerp(a1, e1, 0.72) + Vector((0, -0.05, 0)), (0.015, 0.008, 0.02), 'gem', B(S('ForeArm')))
    prism(e1, lerp(e1, h1, 0.55), (0.034, 0.045), (0.028, 0.05), 4, 'cloth', B(S('Hand')), rot=math.pi / 4)  # glove
    prism(lerp(e1, h1, 0.5), lerp(e1, h1, 1.0), (0.024, 0.044), (0.018, 0.038), 4, 'skin', B(S('Hand')), rot=math.pi / 4)  # fingers
    # legs
    k0, k1, an, toe = head(S('UpLeg')), tail(S('UpLeg')), tail(S('Leg')), tail(S('ToeBase'))
    prism(k0 + Vector((0, 0, 0.03)), k1, (0.09, 0.088), (0.064, 0.064), 8, 'cloth', B(S('UpLeg')))
    ring(lerp(k0, k1, 0.3), lerp(k0, k1, 0.34), (0.086, 0.084), 'gold', B(S('UpLeg')))
    pk = lerp(k0, k1, 0.55) + Vector((sx * 0.078, -0.01, 0))
    box(pk, (0.03, 0.085, 0.1), 'cloth', B(S('UpLeg')))                                         # cargo pocket
    box(pk + Vector((sx * 0.017, 0, 0.035)), (0.006, 0.07, 0.03), 'gold', B(S('UpLeg')))
    octa(pk + Vector((sx * 0.022, 0, 0.0)), (0.006, 0.014, 0.018), 'gem', B(S('UpLeg')))
    ico(k1, (0.064, 0.064, 0.064), 'cloth', B(S('Leg')))
    prism(k1, lerp(k1, an, 0.3), (0.064, 0.064), (0.06, 0.06), 8, 'cloth', B(S('Leg')))
    prism(lerp(k1, an, 0.22), an + Vector((0, 0, -0.07)), (0.068, 0.068), (0.062, 0.062), 8, 'boot', B(S('Leg')))  # boot shaft
    for t in (0.26, 0.55, 0.82): ring(lerp(k1, an, t), lerp(k1, an, t + 0.04), (0.07, 0.07), 'gold', B(S('Leg')))
    kg = lerp(k1, an, 0.3) + Vector((0, -0.07, 0))
    octa(kg, (0.045, 0.02, 0.07), 'gold', B(S('Leg'))); octa(kg + Vector((0, -0.016, 0)), (0.016, 0.01, 0.026), 'gem', B(S('Leg')))
    # boot foot: heel block on Foot, toe block on ToeBase, gold sole
    fx = an.x + sx * 0.01
    box((fx, an.y - 0.06, 0.065), (0.12, 0.2, 0.13), 'boot', B(S('Foot')))
    box((fx + sx * 0.01, toe.y + 0.03, 0.045), (0.115, 0.12, 0.09), 'boot', B(S('ToeBase')))
    box((fx, an.y - 0.05, 0.012), (0.13, 0.23, 0.024), 'gold', B(S('Foot')))
    box((fx + sx * 0.01, toe.y + 0.03, 0.012), (0.125, 0.13, 0.024), 'gold', B(S('ToeBase')))


# head reads better a touch oversized at game distance
HP_ = Vector((0, -0.34, 1.585))
V[:] = [HP_ + (v - HP_) * 1.12 if g == B('Head') else v for v, g in zip(V, VG)]
finish('Rizer', os.path.dirname(os.path.abspath(__file__)))
