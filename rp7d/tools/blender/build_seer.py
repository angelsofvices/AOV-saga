# Seer grunt — low-poly enemy built from the hooded Seer sprite sheet.
# Run: python3 build_seer.py   (needs `pip install bpy`, Blender 4.2 API)
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lowpoly_kit import *
mat('armor', '#17181e', 0.6, 0.2); mat('navy', '#28325f', 0.75); mat('navyDark', '#1b2246', 0.8)
mat('silver', '#aab2bc', 0.32, 0.85); mat('visor', '#ff9a30', 0.3, 0.0, '#ff8a1c', 5.0); mat('void', '#050508', 1.0)

# ── hood + masked face ──
Hc = Vector((0, -0.352, 1.69))
ico(Hc, (0.1, 0.115, 0.125), 'void', B('Head'))
ico(Hc + Vector((0, 0.03, 0.025)), (0.138, 0.15, 0.158), 'navy', B('Head'))                 # hood shell
cone(Hc + Vector((0, 0.07, 0.12)), (0, 0.55, 0.8), 0.075, 0.13, 'navy', B('Head'), 5)          # hood peak
ico(Hc + Vector((0, -0.118, -0.012)), (0.086, 0.03, 0.102), 'void', B('Head'))              # face opening in shadow
box(Hc + Vector((0, -0.146, 0.012)), (0.11, 0.012, 0.022), 'visor', B('Head'))              # visor band
box(Hc + Vector((0, -0.14, -0.045)), (0.07, 0.01, 0.05), 'armor', B('Head'))                # mask
prism((0, -0.34, 1.64), (0, -0.33, 1.44), (0.125, 0.13), (0.175, 0.15), 9, 'navy', B('Neck'))   # cowl
# ── torso ──
prism((0, -0.33, 1.29), (0, -0.32, 1.46), (0.155, 0.1), (0.185, 0.11), 8, 'armor', B('Spine2'))
prism((0, -0.35, 1.19), (0, -0.335, 1.3), (0.14, 0.095), (0.155, 0.1), 8, 'armor', B('Spine1'))
prism((0, -0.37, 1.1), (0, -0.355, 1.2), (0.137, 0.093), (0.14, 0.095), 8, 'armor', B('Spine'))
prism((0, -0.41, 0.95), (0, -0.4, 1.11), (0.15, 0.1), (0.14, 0.095), 8, 'armor', B('Hips'))
prism((0, -0.32, 1.47), (0, -0.325, 1.32), (0.2, 0.14), (0.25, 0.165), 10, 'navy', B('Spine2'))  # mantle
ring((0, -0.325, 1.33), (0, -0.325, 1.315), (0.252, 0.167), 'silver', B('Spine2'), 10)
# the Seer eye on the chest
octa((0, -0.5, 1.39), (0.055, 0.012, 0.026), 'silver', B('Spine2'))
ico((0, -0.508, 1.39), (0.014, 0.008, 0.014), 'void', B('Spine2'))
box((0, -0.497, 1.42), (0.075, 0.008, 0.008), 'silver', B('Spine2'))
for sx in (-1, 1):
    box((sx * 0.07, -0.44, 1.22), (0.016, 0.01, 0.2), 'silver', B('Spine1'), ry=sx * 0.5)       # crossed straps
    box((sx * 0.1, -0.425, 1.29), (0.05, 0.012, 0.06), 'navyDark', B('Spine2'))
ring((0, -0.405, 1.05), (0, -0.405, 1.1), (0.156, 0.106), 'armor', B('Hips'))
for i in range(8):
    a = i * math.pi / 4; box((math.sin(a) * 0.158, -0.405 - math.cos(a) * 0.108, 1.075), (0.018, 0.018, 0.02), 'silver', B('Hips'))
box((0, -0.518, 1.075), (0.05, 0.012, 0.04), 'silver', B('Hips'))
# coat: back panel on the hips, side panels ride the thighs
box((0, -0.29, 0.8), (0.28, 0.022, 0.5), 'navy', B('Hips'), rx=-0.12)
box((0, -0.26, 0.56), (0.28, 0.026, 0.02), 'silver', B('Hips'), rx=-0.12)
# ── limbs ──
for side, sx in (('Left', 1), ('Right', -1)):
    S = lambda n: side + n
    a0, a1, e1, h1 = head(S('Arm')), tail(S('Arm')), tail(S('ForeArm')), tail(S('Hand'))
    ico(a0 + Vector((sx * 0.01, 0, 0)), (0.075, 0.07, 0.07), 'armor', B(S('Arm')))              # pauldron
    ring(a0 + Vector((0, 0, -0.035)), a0 + Vector((0, 0, -0.05)), (0.074, 0.07), 'silver', B(S('Arm')))
    prism(a0, a1, (0.056, 0.052), (0.047, 0.045), 7, 'armor', B(S('Arm')))
    ico(a1, (0.046, 0.046, 0.046), 'armor', B(S('ForeArm')))
    prism(a1, e1, (0.05, 0.048), (0.046, 0.044), 7, 'armor', B(S('ForeArm')))
    for t in (0.35, 0.7): ring(lerp(a1, e1, t), lerp(a1, e1, t + 0.07), (0.053, 0.051), 'silver', B(S('ForeArm')))
    prism(e1, lerp(e1, h1, 1.0), (0.036, 0.048), (0.03, 0.045), 4, 'armor', B(S('Hand')), rot=math.pi / 4)
    k0, k1, an, toe = head(S('UpLeg')), tail(S('UpLeg')), tail(S('Leg')), tail(S('ToeBase'))
    prism(k0 + Vector((0, 0, 0.03)), k1, (0.088, 0.086), (0.066, 0.066), 8, 'armor', B(S('UpLeg')))
    mid = lerp(k0, k1, 0.5)
    box(mid + Vector((sx * 0.085, -0.03, -0.02)), (0.022, 0.15, 0.46), 'navy', B(S('UpLeg')))    # coat side panel
    box(mid + Vector((sx * 0.086, -0.03, -0.25)), (0.026, 0.155, 0.02), 'silver', B(S('UpLeg')))
    ico(k1 + Vector((0, -0.03, 0)), (0.068, 0.06, 0.07), 'armor', B(S('Leg')))                 # knee pad
    ring(k1 + Vector((0, -0.02, -0.04)), k1 + Vector((0, -0.02, -0.055)), (0.07, 0.07), 'silver', B(S('Leg')))
    prism(k1, lerp(k1, an, 0.35), (0.064, 0.064), (0.06, 0.06), 8, 'armor', B(S('Leg')))
    prism(lerp(k1, an, 0.3), an + Vector((0, 0, -0.07)), (0.066, 0.066), (0.062, 0.062), 8, 'armor', B(S('Leg')))
    for t in (0.35, 0.7): ring(lerp(k1, an, t), lerp(k1, an, t + 0.05), (0.069, 0.069), 'silver', B(S('Leg')))
    fx = an.x + sx * 0.01
    box((fx, an.y - 0.06, 0.065), (0.12, 0.2, 0.13), 'armor', B(S('Foot')))
    box((fx + sx * 0.01, toe.y + 0.03, 0.045), (0.115, 0.12, 0.09), 'armor', B(S('ToeBase')))
    box((fx, an.y - 0.05, 0.1), (0.125, 0.205, 0.016), 'silver', B(S('Foot')))

finish('Seer', os.path.dirname(os.path.abspath(__file__)))
