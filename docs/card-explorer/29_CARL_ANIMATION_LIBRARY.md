# 29 · Carl's animation library

*Survey 10.30 · 2026-10-11 · Source: "AA:1936 — Native Asset Builder V3 · Character Sprite & Animation Expansion"*

## What is built

- **The library** (`explorer/animation.js`, `window.AOV_ANIM`). Every distinct action has its own entry: id, perspective, facing, frame count, frame timing, looping, collision profile, and events. The 256 entries cover the spec's groups: idle, walking, running, crouching, jumping, climbing, the jetpack, the AstraBlaster, the Boomfists, interaction, damage, and the special utilities.
- **The state machine.** Carl's state resolves in the spec's order (character, active utility, movement, facing, animation), and the priorities are the spec's: death, damage, utility actions, interaction, climbing, flight, jumping and falling, crouching, locomotion, and idle. A test checks the cases.
- **Playback and events.** The animator advances each frame and fires each event on its frame: a step, dust, a landing, an impact, a shutter, or a pickup. Those events drive the existing sound, dust, shake and freeze.
- **Two perspectives.** Top-down entries use four facings where the movement needs them, and side-view entries use left and right. Each perspective has its own ids.
- **The animation is separate from the physics.** Speed and movement come from the movement controller. The animation only shows the resulting state.

## What is not built

- **Drawn frames.** The poses are procedural: squash, stretch, lean and a small drop, applied to Carl's existing sprite. Every id, frame count and timing is final, but each frame is not yet drawn for its own pose. The spec asks for that, and it is the art pass.
- **Utility-specific art.** The 22 new utilities share the same `activate` action pose until the art pass gives each one its own frames. Life Seed plants, Bio Scanner scans, Echo Decoy summons, and the AstraBlaster and Boomfists have named actions.
- **Climbing** is in the library and the state machine, but the game has no climbing movement yet, so it does not play.
- **Transitions between animations** are immediate. The spec's blends (ignition into takeoff, and velocity-based jetpack blends) need the drawn frames.

## Using it

Add an action by adding a row to `DEF` in `animation.js` and, for a utility, an entry in `ACTION`. The state machine and the events follow.
