import bpy
import math
import os
import re

geo = bpy.data.collections["GEO_Elzoran_Refined_v002"]
rigcol = bpy.data.collections.new("RIG_Elzoran_Refined_v003")
bpy.context.scene.collection.children.link(rigcol)
adata = bpy.data.armatures.new("RIG_Elzoran_Refined_RP9_Data")
arm = bpy.data.objects.new("RIG_Elzoran_Refined_RP9", adata)
rigcol.objects.link(arm)
bpy.context.view_layer.objects.active = arm
arm.select_set(True)
bpy.ops.object.mode_set(mode="EDIT")


def bone(name, head, tail, parent=None):
    item = adata.edit_bones.new(name)
    item.head = head
    item.tail = tail
    if parent:
        item.parent = adata.edit_bones.get(parent)


bone("root", (0, 0, 0), (0, 0, 0.45))
bone("pelvis", (0, 0, 3), (0, 0, 3.65), "root")
bone("spine", (0, 0, 3.55), (0, 0, 4.35), "pelvis")
bone("chest", (0, 0, 4.25), (0, 0, 5.3), "spine")
bone("neck", (0, 0, 5.25), (0, 0, 5.85), "chest")
bone("head", (0, 0, 5.75), (0, 0, 6.75), "neck")
for side, sx in (("L", -1), ("R", 1)):
    bone(f"thigh.{side}", (0.58 * sx, 0, 3), (0.68 * sx, 0, 1.9), "pelvis")
    bone(f"shin.{side}", (0.68 * sx, 0, 1.9), (0.72 * sx, 0.1, 0.62), f"thigh.{side}")
    bone(f"foot.{side}", (0.72 * sx, 0.1, 0.62), (0.72 * sx, -0.85, 0.2), f"shin.{side}")
    bone(f"upper_arm.{side}", (1.15 * sx, 0, 5.2), (2.5 * sx, 0, 5.07), "chest")
    bone(f"forearm.{side}", (2.5 * sx, 0, 5.07), (3.45 * sx, 0, 5), f"upper_arm.{side}")
    bone(f"hand.{side}", (3.45 * sx, 0, 5), (4.15 * sx, 0, 4.95), f"forearm.{side}")
    bone(f"wing.{side}", (0.7 * sx, 0.25, 5.6), (4.5 * sx, 0.2, 7.7), "chest")
bone("tail.0", (0, 0.35, 3.2), (0.45, 0.8, 2.4), "pelvis")
bone("tail.1", (0.45, 0.8, 2.4), (1.2, 1.05, 1.6), "tail.0")
bone("tail.2", (1.2, 1.05, 1.6), (2.25, 0.9, 1), "tail.1")
bone("tail.3", (2.25, 0.9, 1), (3.3, 0.05, 1.55), "tail.2")
bpy.ops.object.mode_set(mode="POSE")
for pose_bone in arm.pose.bones:
    pose_bone.rotation_mode = "XYZ"
bpy.ops.object.mode_set(mode="OBJECT")


def owner(name):
    if name.startswith(("Head", "Muzzle", "Eye_", "Horn_", "GoldCrest", "CentralHelm")):
        return "head"
    if name.startswith("Neck"):
        return "neck"
    if name.startswith(("UpperChest", "Torso", "ArmorPlate", "Pectoral", "ShoulderScale")):
        return "chest"
    if name.startswith(("Waist", "SpineScale")):
        return "spine"
    if name.startswith("Pelvis"):
        return "pelvis"
    for side in ("L", "R"):
        if name.endswith("_" + side) or f"_{side}_" in name:
            if name.startswith(("Hip", "Thigh", "ThighScale")):
                return f"thigh.{side}"
            if name.startswith(("Knee", "Shin")):
                return f"shin.{side}"
            if name.startswith(("Foot", "Toe")):
                return f"foot.{side}"
            if name.startswith(("Shoulder", "UpperArm")):
                return f"upper_arm.{side}"
            if name.startswith(("Elbow", "Forearm", "ForearmFin")):
                return f"forearm.{side}"
            if name.startswith(("Hand", "Finger")):
                return f"hand.{side}"
            if name.startswith(("WingMembrane", "WingBone")):
                return f"wing.{side}"
    if name.startswith(("TailSegment", "TailSpine")):
        found = re.search(r"_(\d+)$", name)
        index = int(found.group(1)) if found else 0
        return f"tail.{min(3, index // 2)}"
    if name.startswith("TailFire"):
        return "tail.3"
    return "spine"


for obj in list(geo.objects):
    world = obj.matrix_world.copy()
    obj.parent = arm
    obj.parent_type = "BONE"
    obj.parent_bone = owner(obj.name)
    obj.matrix_world = world

scene = bpy.context.scene
scene.frame_start = 1
scene.frame_end = 24
scene.render.fps = 24
arm.animation_data_create()
action = bpy.data.actions.new("Elzoran_Refined_Walk_RP9")
arm.animation_data.action = action
poses = {
    1: {"thigh.L": -18, "thigh.R": 18, "shin.L": 10, "shin.R": -7, "upper_arm.L": 13, "upper_arm.R": -13, "tail.1": 7},
    7: {"thigh.L": 0, "thigh.R": 0, "shin.L": -5, "shin.R": -5, "upper_arm.L": 0, "upper_arm.R": 0, "tail.1": 0},
    13: {"thigh.L": 18, "thigh.R": -18, "shin.L": -7, "shin.R": 10, "upper_arm.L": -13, "upper_arm.R": 13, "tail.1": -7},
    19: {"thigh.L": 0, "thigh.R": 0, "shin.L": -5, "shin.R": -5, "upper_arm.L": 0, "upper_arm.R": 0, "tail.1": 0},
    25: {"thigh.L": -18, "thigh.R": 18, "shin.L": 10, "shin.R": -7, "upper_arm.L": 13, "upper_arm.R": -13, "tail.1": 7},
}
for frame, values in poses.items():
    scene.frame_set(frame)
    for name, degrees in values.items():
        pose_bone = arm.pose.bones[name]
        pose_bone.rotation_euler = (
            (0, 0, math.radians(degrees))
            if name.startswith("tail")
            else (0, math.radians(degrees), 0)
        )
        pose_bone.keyframe_insert(data_path="rotation_euler", frame=frame, group=name)
scene.frame_set(1)

base = "/Users/mctherockstar/Documents/Claude/Projects/the AOV™  saga"
blend = os.path.join(base, "assets/origon/source/characters/elzoran/elzoran-refined-rigged-rp9-v003.blend")
glb = os.path.join(base, "RP9/public/assets/elzoran-rp9.glb")
bpy.ops.wm.save_as_mainfile(filepath=blend)
bpy.ops.object.select_all(action="DESELECT")
arm.select_set(True)
for obj in geo.objects:
    obj.select_set(True)
bpy.context.view_layer.objects.active = arm
bpy.ops.export_scene.gltf(
    filepath=glb,
    export_format="GLB",
    use_selection=True,
    export_animations=True,
    export_frame_range=True,
    export_apply=False,
)
bpy.ops.wm.save_as_mainfile(filepath=blend)
