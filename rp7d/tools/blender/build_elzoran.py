# Elzoran — converts SK_Elzoran.fbx to the game GLB and adds the shared Punch/Kick clips.
import sys, os; os.environ['KEEP_BODY'] = '1'; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lowpoly_kit import *
TEX = os.environ.get('ELZ_TEX', '/mnt/user-data/uploads/elzoran/textures/')
body = bpy.data.objects['ElzoranBody']
m = bpy.data.materials.new('M_Elzoran'); m.use_nodes = True; nt = m.node_tree; bs = nt.nodes['Principled BSDF']
def tex(name, cs):
    n = nt.nodes.new('ShaderNodeTexImage'); n.image = bpy.data.images.load(TEX + name); n.image.colorspace_settings.name = cs; return n
nt.links.new(tex('T_Elzoran_BaseColor.png', 'sRGB').outputs[0], bs.inputs['Base Color'])
sep = nt.nodes.new('ShaderNodeSeparateColor'); nt.links.new(tex('T_Elzoran_MetallicRoughness.png', 'Non-Color').outputs[0], sep.inputs[0])
nt.links.new(sep.outputs['Blue'], bs.inputs['Metallic']); nt.links.new(sep.outputs['Green'], bs.inputs['Roughness'])
nm = nt.nodes.new('ShaderNodeNormalMap'); nt.links.new(tex('T_Elzoran_Normal.png', 'Non-Color').outputs[0], nm.inputs['Color']); nt.links.new(nm.outputs[0], bs.inputs['Normal'])
body.data.materials.clear(); body.data.materials.append(m)
combat_clips()
for a in list(bpy.data.actions):
    short = a.name.split('|')[-1]; a.name = short
    tr = rig.animation_data.nla_tracks.new(); tr.name = short; tr.strips.new(short, int(a.frame_range[0]), a)
rig.animation_data.action = None
print('Elzoran clips', [a.name for a in bpy.data.actions])
bpy.ops.export_scene.gltf(filepath=os.path.dirname(os.path.abspath(__file__)) + '/elzoran.glb', export_format='GLB', export_animations=True,
                          export_animation_mode='NLA_TRACKS', export_image_format='WEBP', export_skins=True, export_yup=True)
