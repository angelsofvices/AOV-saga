# Elzebub · RP7D production asset

Elzebub is the first Blender-authored 3D Zyrex asset for RP7D, built from the canonical sheet at `rp7d/references/All Ported/ELZEBUB REF.png`.

## Files

- `elzebub_rp7d_v1.blend` — editable Blender source scene
- `elzebub_rp7d_v1.glb` — binary glTF 2.0 export for the game
- `elzebub_rp7d_v1.manifest.json` — identity, rig, clip, and NPC metadata
- `../../tools/blender/build_elzebub_rp7d.py` — reproducible model and export script

## Playtest

1. Open `rp7d/dist/RP7D_Malezor_Playtest.html` in a browser.
2. Start the game and drag `elzebub_rp7d_v1.glb` onto the play window.
3. RP7D checks the GLB 2.0 header, skinned geometry, skeleton, and animation clips before spawning the NPC on clear terrain.
4. Use the Elzebub panel to select clips. It wanders with idle and walk by default; the buttons can play every exported clip.

The HTML is self-contained for the game code and its packaged assets. The GLB is dropped separately so the same import path can be used for future Zyrex files.

## Rig and clips

The 17-bone creature rig has a stable `root`, torso and head chain, jaw, four legs, articulated wings, and a four-link tail. The joined 3,428-vertex low-poly mesh has one UV map, 12 PBR materials, and full vertex weights. Movement clips are in place and leave world translation to RP7D.

| Clip | Loop |
| --- | --- |
| `idle` | yes |
| `walk` | yes |
| `run` | yes |
| `turn_left` | yes |
| `turn_right` | yes |
| `attack_01` | no |
| `attack_02` | no |
| `hit_reaction` | no |
| `defeat` | no |
| `rest` | yes |
