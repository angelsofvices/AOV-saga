# 26 · Jetpack, utility cycling and the controls

*Survey 10.22 · 2026-10-11 · Source: "AA:1936 — Jetpack Utility Patch V1.0 · Controls, Utility Cycling & Flight Mechanics"*

## The controller

| Control | Pad | Keyboard | Does |
|---|---|---|---|
| Triangle △ | △ | Q | Cycles the utilities Carl owns and has equipped |
| Square □ | □ | C | Uses the active utility. ASTRABLASTER: fires once per press. JETPACK: hold to fly |
| Cross ✕ | ✕ | Z, Enter, Space | Interacts. Tap to examine, use, talk, harvest, or open. **Hold** to lift the object you face, or to set it down |
| Circle ○ | ○ | X, Escape, Backspace | Cycles **crouch → walk → run** in the field and in caves. Puts a carried object back |

Movement is the arrow keys or the stick, as before. In a cave, Up (or the D-pad up) jumps.

## Utility cycling

- Carl has two utility types: the ASTRABLASTER MK1 and the JETPACK.
- △ cycles only the utilities that are **owned and equipped**. With one equipped, △ says which one it is. With none, it says so.
- The active utility persists in `S.util.active` and survives ordinary movement.
- Cycling fires nothing and lifts nothing. A test checks this (`t_jetpack`).
- The HUD's utility panel shows `UTILITY n/m · NAME`, and the charge bar (blaster) or the lift bar (jetpack).

## The JETPACK

- **Assembled at the Workstation** (or from the Inventory's UTILITY card), then equipped from the Inventory.
- **Takeoff:** holding □ raises the lift velocity gradually toward its maximum. It does not snap to flight.
- **Flight:** Carl rises and moves under the player's control. In the field, he clears low obstacles (plants, boulders, stones, props, water, minerals) once his altitude passes the crossing height.
- **Restricted tiles** stop a flying Carl: walls, structures, the vault, landmarks, the ship, the marker stones and the wreck. He cannot land on an obstacle; he hovers above it until open ground is under him.
- **Release:** the lift fades. Gravity brings Carl down. He lands when a valid landing surface is reached.
- **Caves:** the same lift, in the side view. Holding □ climbs (capped at a steady rise). Releasing it glides into the fall.

The physics is the one in the patch: lift approaches a target by acceleration and deceleration, and gravity acts when thrust ends.

## Controls decisions in this build

- **Object carrying moved from □ to X (hold).** Square is now reserved for the active utility, as the patch proposed. A tap on X still examines and harvests, so plants and stones can be harvested as before. Holding X lifts them.
- **Jump moved to Up in caves.** The patch makes X interact, so jump cannot stay on ✕. It is not in the patch, so please confirm it.
- **Cave Circle is gait,** not attack. Crouch and run change the pace of the cave walk.

## Provisional, pending approval

These are placeholders so the mechanic can be played. They are not approved:

- **Assembly cost:** 4 scrap, 2 crystal, 3 data (`JET.cost`).
- **Lift and altitude:** maximum lift 1.6 tiles a second, acceleration 2.2, deceleration 2.6, sink 1.0, maximum altitude 2.0 tiles, crossing height 0.6 (`JET`). Cave: thrust 52, acceleration 90, rise cap 8, deceleration 60 (`JSIDE`).
- **Flight speed:** 0.15 seconds a tile in the field (`JET.flyStep`).

## Not built yet

- **Energy capacity, flight duration and recharge.** Flight is unlimited for now. The patch leaves these open.
- **Exact altitude rules.** The field has one crossing height. The patch's per-obstacle altitudes are not yet set.
- **Jetpack upgrades and production recipes** through NASARUS crafting.
- **Jetpack art.** The jetpack card reuses the relic icon.
- **Exhaust and flight effects** in the cave.
- **Companions and item use** while flying.
