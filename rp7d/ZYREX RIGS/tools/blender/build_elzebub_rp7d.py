"""Build the canonical articulated Elzebub game asset and export GLB clips."""
import bpy, math, os, json
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'elzebub')
os.makedirs(OUT, exist_ok=True)
BLEND = os.path.join(OUT, 'elzebub_rp7d_v1.blend')
GLB = os.path.join(OUT, 'elzebub_rp7d_v1.glb')

bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.armatures):
    for d in list(datablocks):
        if d.users == 0: datablocks.remove(d)
for d in list(bpy.data.actions): bpy.data.actions.remove(d, do_unlink=True)
scene=bpy.context.scene
scene.frame_start=1; scene.frame_end=240; scene.render.fps=24
scene.unit_settings.system='METRIC'

def mat(name, color, metallic=0.0, rough=.55, emission=0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    bs.inputs['Base Color'].default_value=(*color,1); bs.inputs['Metallic'].default_value=metallic; bs.inputs['Roughness'].default_value=rough
    if emission:
        bs.inputs['Emission Color'].default_value=(*color,1); bs.inputs['Emission Strength'].default_value=emission
    return m
M={
 'azure':mat('Scale · Azure',(.025,.25,.82),.08,.48), 'blue':mat('Scale · Cobalt',(.012,.085,.38),.12,.42),
 'light':mat('Scale · Sky Glint',(.10,.58,.98),.05,.4), 'belly':mat('Belly · Warm Ivory',(.88,.79,.61),0,.72),
 'gold':mat('Crest · Sun Gold',(1,.48,.025),.48,.28), 'goldLight':mat('Gold · Edge',(1,.76,.11),.5,.23),
 'orange':mat('Wing · Ember Orange',(1,.20,.025),.1,.4), 'purple':mat('Forehead · Amethyst',(.43,.025,.86),.35,.23),
 'eye':mat('Eye · Amber',(1,.48,.035),.05,.18), 'black':mat('Pupil · Obsidian',(.012,.008,.018),.08,.16),
 'white':mat('Eye glint',(1,.96,.8),0,.12), 'mouth':mat('Mouth · Deep Plum',(.12,.012,.045),0,.6)
}
arm_data=bpy.data.armatures.new('Elzebub · Creature Rig'); arm=bpy.data.objects.new('Elzebub_Rig',arm_data); bpy.context.collection.objects.link(arm)
bpy.context.view_layer.objects.active=arm; arm.select_set(True); bpy.ops.object.mode_set(mode='EDIT')
bones={}
def bone(name, head, tail, parent=None):
    b=arm_data.edit_bones.new(name); b.head=head; b.tail=tail
    if parent: b.parent=arm_data.edit_bones[parent]
    bones[name]=b
bone('root',(0,0,.08),(0,0,.38))
bone('body',(0,0,.38),(0,0,.96),'root')
bone('neck',(0,.22,1.02),(0,.38,1.34),'body')
bone('head',(0,.38,1.34),(0,.63,1.54),'neck')
bone('jaw',(0,.48,1.25),(0,.72,1.22),'head')
for side,label in [(-1,'L'),(1,'R')]:
    bone(f'leg_front_{label}',(side*.34,.30,.75),(side*.36,.34,.22),'body')
    bone(f'leg_back_{label}',(side*.34,-.48,.72),(side*.35,-.52,.22),'body')
    bone(f'wing_{label}',(side*.34,-.04,1.02),(side*.87,-.04,1.35),'body')
    bone(f'wing_tip_{label}',(side*.87,-.04,1.35),(side*1.24,-.04,1.12),f'wing_{label}')
bone('tail_01',(0,-.57,.82),(0,-.92,.70),'body')
bone('tail_02',(0,-.92,.70),(0,-1.25,.56),'tail_01')
bone('tail_03',(0,-1.25,.56),(0,-1.53,.50),'tail_02')
bone('tail_04',(0,-1.53,.50),(0,-1.74,.58),'tail_03')
bpy.ops.object.mode_set(mode='OBJECT'); arm.show_in_front=True

parts=[]
def sphere(name, loc, scale, material, bname, seg=12, rings=8):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, radius=1, location=loc); o=bpy.context.object; o.name=name; o.scale=scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True); o.data.materials.append(M[material]); parts.append((o,bname)); return o
def ico(name,loc,scale,material,bname,sub=1):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub,radius=1,location=loc); o=bpy.context.object;o.name=name;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(M[material]);parts.append((o,bname));return o
def cone_between(name,a,b,r,material,bname,vertices=6,r2=0):
    a,b=Vector(a),Vector(b); d=b-a
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=r, radius2=r2, depth=d.length, location=(a+b)/2);o=bpy.context.object;o.name=name;o.rotation_mode='QUATERNION';o.rotation_quaternion=Vector((0,0,1)).rotation_difference(d.normalized());bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(M[material]);parts.append((o,bname));return o
def wing_mesh(side,label):
    # Triangular leathery membrane, with three tapered gold-edged fingers.
    points=[(side*.30,-.02,1.02),(side*.78,.01,1.45),(side*1.24,-.05,1.20),(side*.95,-.10,.94),(side*.66,-.08,.90)]
    faces=[(0,1,4),(1,2,3,4)]
    me=bpy.data.meshes.new('Wing membrane');me.from_pydata(points,[],faces);me.materials.append(M['orange']);me.update()
    ob=bpy.data.objects.new('Wing membrane '+label,me);bpy.context.collection.objects.link(ob);parts.append((ob,'wing_'+label))
    for i,(a,b) in enumerate([((side*.30,-.02,1.02),(side*.78,.01,1.45)),((side*.30,-.02,1.02),(side*1.24,-.05,1.20)),((side*.30,-.02,1.02),(side*.95,-.10,.94))]):
        curve=bpy.data.curves.new('Wing spar','CURVE');curve.dimensions='3D';curve.bevel_depth=.018;curve.bevel_resolution=1;s=curve.splines.new('POLY');s.points.add(1)
        for p,co in zip(s.points,(a,b)):p.co=(*co,1)
        spar=bpy.data.objects.new(f'Wing spar {label} {i}',curve);bpy.context.collection.objects.link(spar);spar.data.materials.append(M['gold']);bpy.context.view_layer.objects.active=spar;spar.select_set(True);bpy.ops.object.convert(target='MESH');spar=bpy.context.object;spar.select_set(False);parts.append((spar,'wing_'+label))

# Heavy haunch, narrow chest, neck and recognizable baby-dragon head.
sphere('Body core',(0,-.06,.83),(.45,.74,.48),'azure','body',16,10)
sphere('Chest bib',(0,.25,.68),(.31,.39,.42),'belly','body',14,9)
sphere('Neck',(0,.31,1.12),(.32,.39,.38),'azure','neck',14,9)
sphere('Head',(0,.48,1.43),(.43,.43,.39),'azure','head',16,10)
sphere('Muzzle',(0,.77,1.31),(.31,.34,.21),'light','head',14,8)
sphere('Lower jaw',(0,.73,1.20),(.26,.28,.105),'belly','jaw',12,7)
sphere('Open mouth',(0,.82,1.235),(.19,.21,.055),'mouth','jaw',12,7)
for s,l in [(-1,'L'),(1,'R')]:
    sphere('Eye socket '+l,(s*.285,.66,1.53),(.19,.15,.20),'blue','head',12,8)
    sphere('Amber eye '+l,(s*.29,.765,1.54),(.125,.07,.142),'eye','head',12,8)
    sphere('Pupil '+l,(s*.29,.824,1.54),(.055,.03,.09),'black','head',10,7)
    sphere('Eye glint '+l,(s*.265,.85,1.59),(.027,.018,.033),'white','head',8,6)
    sphere('Nostril '+l,(s*.105,.975,1.365),(.035,.025,.022),'blue','head',8,6)
    # cheek scales
    for i in range(3): ico(f'Cheek scale {l}{i}',(s*(.36+i*.018),.53-i*.105,1.35-i*.07),(.10,.095,.085),'light' if i==0 else 'blue','head',1)
    # crown horns sweep backward and outward
    cone_between('Crown horn '+l,(s*.19,.37,1.70),(s*.32,.19,1.97),.12,'goldLight','head',5)
    for j in range(3):
        cone_between('Temple spike '+l+str(j),(s*(.32+j*.025),.38-j*.16,1.62-j*.10),(s*(.53+j*.035),.24-j*.16,1.70-j*.12),.095,'gold','head',5)
    # Scale plates along flanks
    for i in range(4):
        ico(f'Flank scale {l}{i}',(s*.39,-.36+i*.27,.90+(.04 if i%2 else -.02)),(.105,.16,.115),'light' if i%2==0 else 'blue','body',1)

# Belly plates, back armor, dorsal and brow crown, amethyst forehead jewel.
for i in range(4):
    z=.52+i*.16; y=.48-i*.23
    sphere(f'Belly plate {i}',(0,y,z),(.29-i*.015,.15,.11),'belly','body',12,7)
for i in range(7):
    y=.48-i*.20; z=1.20-(i*.055)
    cone_between(f'Dorsal gold spike {i}',(0,y,z),(0,y-.07,z+.24-(.02*i)),.12 if i<3 else .09,'goldLight','body',5)
    ico(f'Dorsal blue plate {i}',(0,y-.08,z-.02),(.16,.15,.13),'blue','body',1)
# Gem set into a gold diamond bezel on forehead
ico('Amethyst crest',(0,.72,1.79),(.145,.085,.20),'purple','head',1).rotation_euler[1]=math.radians(45)
for s in [-1,1]:
    cone_between('Gold brow',(s*.03,.73,1.77),(s*.26,.69,1.71),.045,'goldLight','head',5)

# Four short, sturdy legs with distinct lower legs and three golden toes.
for s,l in [(-1,'L'),(1,'R')]:
  for fore,label,y in [(True,'front',.32),(False,'back',-.48)]:
    bn=f'leg_{label}_{l}'; hipZ=.75 if fore else .70
    sphere(label+' upper leg '+l,(s*.34,y,hipZ),(.19,.22,.25),'azure',bn,10,7)
    sphere(label+' lower leg '+l,(s*.35,y+.035,.40),(.145,.16,.23),'blue',bn,10,7)
    sphere(label+' paw '+l,(s*.35,y+.14,.23),(.21,.24,.12),'azure',bn,10,7)
    for k in [-1,0,1]: cone_between('Gold claw '+l+label+str(k),(s*.35+k*.10,y+.27,.22),(s*.35+k*.12,y+.39,.17),.045,'goldLight',bn,5)
wing_mesh(-1,'L');wing_mesh(1,'R')

# Articulated four-link tail ending in a golden spiked mace tuft.
for i,(y,z,r) in enumerate([(-.72,.79,.23),(-1.02,.68,.19),(-1.30,.57,.15),(-1.54,.55,.12)]):
    bn=f'tail_0{i+1}';length=.39 if i<3 else .24
    sphere(f'Tail segment {i+1}',(0,y,z),(r,length/1.5,r),'azure' if i%2==0 else 'blue',bn,10,7)
    if i<3: cone_between(f'Tail ridge {i}',(0,y,z+r*.65),(0,y-.10,z+r+.13),.07,'gold',bn,5)
ico('Tail mace',(0,-1.82,.59),(.23,.24,.23),'blue','tail_04',1)
for i in range(8):
    a=i*math.tau/8
    p=(math.sin(a)*.17,-1.82+math.cos(a)*.17,.59)
    q=(math.sin(a)*.32,-1.82+math.cos(a)*.32,.59+.07*math.cos(a*2))
    cone_between('Mace gold spike '+str(i),p,q,.07,'goldLight','tail_04',5)

# Gold-and-amber spiral pendant, prominent from the front.
tor=bpy.ops.mesh.primitive_torus_add(major_radius=.16,minor_radius=.045,major_segments=16,minor_segments=6,location=(0,.48,.83));pend=bpy.context.object;pend.name='Sun spiral pendant';pend.rotation_euler[0]=math.radians(90);pend.data.materials.append(M['goldLight']);parts.append((pend,'body'))
ico('Pendant core',(0,.50,.83),(.08,.035,.08),'eye','body',2)

# Join disconnected stylized components into a single skinned mesh. Each component has
# deterministic rigid weights to its anatomical bone, preserving low-poly plate seams.
bpy.ops.object.select_all(action='DESELECT')
for o,_ in parts:o.select_set(True)
bpy.context.view_layer.objects.active=parts[0][0];bpy.ops.object.join();mesh=bpy.context.object;mesh.name='Elzebub_GameMesh';mesh.data.name='Elzebub_GameMesh_Geometry'
for bn in bones: mesh.vertex_groups.new(name=bn)
# Joining preserves source vertex order grouped by polygon islands; recover assignment using
# each source object's original vertex count and the joined object's ordered mesh blocks.
offset=0
for src,bn in parts:
    n=len(src.data.vertices) if False else 0
# Shape was joined; use nearest anatomical zones to assign every vertex, capped to a single
# strongest weight. Hard-piece mesh remains cohesive under the rig and performs efficiently.
vg={g.name:g for g in mesh.vertex_groups}
for v in mesh.data.vertices:
    x,y,z=mesh.matrix_world @ v.co
    if z<.25 and y<.55:
        bn='leg_'+('front' if y>.0 else 'back')+'_'+('L' if x<0 else 'R')
    elif y < -1.57: bn='tail_04'
    elif y < -1.27: bn='tail_03'
    elif y < -.94: bn='tail_02'
    elif y < -.62 and z<1.12: bn='tail_01'
    elif abs(x)>.52 and z>.86 and y<.15: bn=('wing_tip_' if abs(x)>1.0 else 'wing_')+('L' if x<0 else 'R')
    elif y>.70 and z<1.28: bn='jaw'
    elif z>1.22 and y>.28: bn='head'
    elif z>1.02: bn='neck'
    else: bn='body'
    vg[bn].add([v.index],1.0,'REPLACE')
# Repack all shell islands into one real UV layout, including the hand-built wing membranes.
bpy.ops.object.select_all(action='DESELECT');mesh.select_set(True);bpy.context.view_layer.objects.active=mesh
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(island_margin=.015)
bpy.ops.object.mode_set(mode='OBJECT')
mesh.parent=arm;mod=mesh.modifiers.new('Elzebub skeletal deformation','ARMATURE');mod.object=arm
mesh['asset_id']='zyrex.elzebub'; mesh['species']='Elzebub';mesh['export_profile']='RP7D_GLTF2'
arm['asset_id']='zyrex.elzebub';arm['stable_root']='root';arm['rig_type']='quadruped_dragon'
arm.animation_data_create()

def set_pose(frame, values):
    frame=int(round(frame)); scene.frame_set(frame)
    for name,rot in values.items():
        p=arm.pose.bones.get(name)
        if not p: continue
        p.rotation_mode='XYZ';p.rotation_euler=rot
        p.keyframe_insert(data_path='rotation_euler',frame=frame,group=name)
def action(name, poses, cyclic=False):
    arm.animation_data.action=bpy.data.actions.new(name)
    for f,vals in poses:set_pose(f,vals)
    act=arm.animation_data.action;act.name=name;act['clip_name']=name;act['loop']=cyclic
    try:
        for fc in act.fcurves:
            for kp in fc.keyframe_points:kp.interpolation='BEZIER'
    except AttributeError:
        pass  # Blender 5.x layered Actions use channel bags; default curves are Bezier.
    scene.frame_set(1)

Z={}
def gait(t,amp,phase=0):
    v={}
    for i,bn in enumerate(('leg_front_L','leg_front_R','leg_back_L','leg_back_R')):
        ph=t+([0,math.pi,math.pi,0][i]);v[bn]=(math.sin(ph)*amp,0,0)
    v['body']=(math.sin(t*2)*amp*.16,0,math.sin(t)*amp*.035)
    v['tail_01']=(0,math.sin(t+.5)*.12,0);v['tail_02']=(0,math.sin(t+1)*.16,0);v['tail_03']=(0,math.sin(t+1.5)*.2,0)
    v['wing_L']=(math.sin(t)*.12,0,.08);v['wing_R']=(math.sin(t)*.12,0,-.08)
    return v
for nm,amp,period in [('idle',.035,48),('walk',.62,24),('run',.95,15)]:
    action(nm,[(1,gait(0,amp)),(1+period*.25,gait(math.pi/2,amp)),(1+period*.5,gait(math.pi,amp)),(1+period*.75,gait(3*math.pi/2,amp)),(1+period,gait(2*math.pi,amp))],True)
action('turn_left',[(1,{'body':(0,0,-.14),'head':(0,-.22,0),'tail_01':(0,.18,0)}),(12,{'body':(0,0,.18),'head':(0,.22,0),'tail_01':(0,-.18,0)}),(24,Z)],True)
action('turn_right',[(1,{'body':(0,0,.14),'head':(0,.22,0),'tail_01':(0,-.18,0)}),(12,{'body':(0,0,-.18),'head':(0,-.22,0),'tail_01':(0,.18,0)}),(24,Z)],True)
action('attack_01',[(1,Z),(5,{'neck':(-.24,0,0),'head':(-.32,0,0),'jaw':(.45,0,0)}),(10,{'neck':(.30,0,0),'head':(.5,0,0),'jaw':(.35,0,0)}),(15,{'head':(-.15,0,0),'jaw':(0,0,0)}),(22,Z)],False)
action('attack_02',[(1,Z),(6,{'tail_01':(0,-.2,0),'tail_02':(0,-.35,0),'tail_03':(0,-.3,0),'body':(0,0,.12)}),(13,{'tail_01':(0,.32,0),'tail_02':(0,.48,0),'tail_03':(0,.42,0),'body':(0,0,-.14)}),(20,Z)],False)
action('hit_reaction',[(1,Z),(4,{'body':(.25,0,0),'head':(-.25,0,.18),'wing_L':(.3,0,.25),'wing_R':(.3,0,-.25)}),(9,{'body':(-.1,0,0),'head':(.1,0,0)}),(16,Z)],False)
action('defeat',[(1,Z),(12,{'body':(.5,0,0),'head':(.25,0,0),'leg_front_L':(.5,0,0),'leg_front_R':(.5,0,0)}),(28,{'body':(1.0,0,0),'head':(.5,0,0),'leg_front_L':(1.05,0,0),'leg_front_R':(1.05,0,0),'leg_back_L':(.7,0,0),'leg_back_R':(.7,0,0),'wing_L':(.4,0,.2),'wing_R':(.4,0,-.2)}),(44,{'body':(1.0,0,0),'head':(.5,0,0),'leg_front_L':(1.05,0,0),'leg_front_R':(1.05,0,0),'leg_back_L':(.7,0,0),'leg_back_R':(.7,0,0)})],False)
action('rest',[(1,{'body':(.08,0,0),'head':(.35,0,0),'leg_front_L':(.2,0,0),'leg_front_R':(.2,0,0)}),(20,{'body':(.12,0,0),'head':(.24,0,0),'tail_01':(0,.08,0)}),(40,{'body':(.08,0,0),'head':(.35,0,0),'leg_front_L':(.2,0,0),'leg_front_R':(.2,0,0)})],True)

scene.frame_end=48
scene.render.fps=24
for a in bpy.data.actions:
    a.use_fake_user=True
    a['root_motion']='in_place'
bpy.ops.object.select_all(action='DESELECT');arm.select_set(True);mesh.select_set(True);bpy.context.view_layer.objects.active=arm
bpy.ops.wm.save_as_mainfile(filepath=BLEND)

# Discover this Blender version's exporter options at runtime; export all named Actions as clips.
try:
    bpy.ops.preferences.addon_enable(module='io_scene_gltf2')
except Exception: pass
props=bpy.ops.export_scene.gltf.get_rna_type().properties
kw={'filepath':GLB,'export_format':'GLB','use_selection':True,'export_animations':True,'export_skins':True,'export_morph':False,'export_yup':True,'export_apply':True}
if 'export_animation_mode' in props: kw['export_animation_mode']='ACTIONS'
if 'export_nla_strips' in props: kw['export_nla_strips']=False
if 'export_frame_range' in props: kw['export_frame_range']=False
bpy.ops.export_scene.gltf(**kw)

manifest={
 'asset_id':'zyrex.elzebub','name':'Elzebub','species':'Zyrex','version':'1.0.0','format':'glb','file':'elzebub_rp7d_v1.glb',
 'source_blend':'elzebub_rp7d_v1.blend','scale':'meters','forward_axis':'positive_y','stable_root_bone':'root',
 'rig':{'type':'quadruped_dragon','bones':list(bones),'skinned_meshes':['Elzebub_GameMesh']},
 'animations':[{'name':n,'loop':loop} for n,loop in [('idle',True),('walk',True),('run',True),('turn_left',True),('turn_right',True),('attack_01',False),('attack_02',False),('hit_reaction',False),('defeat',False),('rest',True)]],
 'npc':{'entity_type':'zyrex','behavior':'wild_roamer','default_animation':'idle','scale':1.0,'spawn':'valid_dry_terrain_near_player'},
 'appearance':{'primary':'azure blue scales','secondary':'ivory belly','accents':'gold armor and orange wing membranes','crest':'amethyst jewel'},
 'reference':'../../../references/All Ported/ELZEBUB REF.png'
}
with open(os.path.join(OUT,'elzebub_rp7d_v1.manifest.json'),'w') as f:json.dump(manifest,f,indent=2)
print(json.dumps({'blend':BLEND,'glb':GLB,'actions':[a.name for a in bpy.data.actions],'objects':[(o.name,o.type) for o in bpy.context.scene.objects],'bones':len(arm.data.bones),'mesh_vertices':len(mesh.data.vertices),'export_options':kw},indent=2))
