# 30 · NPCs on the standard humanoid rig

*Survey 10.31 · 2026-10-11 · Source: "remake npcs using the player silhouette with the current colors and unique features"*

## The standard rig

Every person is built on the same skeleton as Carl: a head, a torso, legs and boots, standing on the same ground row. Carl is the standard: 14 rows tall, a head of 5 rows, a torso of 6, legs of 3, and shoulders 5 half-widths out.

Each person is that rig scaled by their own proportions, within limits:

| Proportion | Range | What it does |
|---|---|---|
| Height (`hn`) | 12 to 14 rows | Shorter people stand lower in the canvas |
| Head (`headH`) | 4 or 5 rows | Taller people, with 14 rows, have a smaller head and longer legs |
| Torso and legs | Derived | Fill the rest of the height |
| Width (`halfW`) | 4 to 6 | Thin, normal, or fat; a `big` trait is always wide |
| Leg width | Derived | Follows the width |

The boots stand on the same row for everyone, so every figure sits on the ground.

## What is kept

- **Colours.** The palette is generated from each person's seed, as before.
- **Traits.** Horns, ears, elf ears, antennae, beaks, snouts, fins, visors, crystal, leaves, tails and glow all draw on the standard head, and they move down with each person's head.
- **Outfits.** Crown, helm, hat, hood, goggles and cap, plus robes and the cyclops eye.

## Animation

- Every person has a planted frame and a stride frame in each direction (down, up, side). The stride swaps the front and back legs by a column, the same cycle as Carl's walk.
- A walking person shows the stride frame. Nothing moves yet, since NPCs are fixed tiles, so the stride is wired and ready for when they walk.
- Robes have no legs, so their stride frame matches the planted frame.

## Not built

- NPC movement. The stride frames are present; the people do not walk yet.
- Drawn art. The rig is pixel layout, not drawn frames, so the art pass can redraw it.
- Idle breathing for NPCs.
