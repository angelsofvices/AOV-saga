# 28 · Movement feel (AA:1936 Engine Update V3, Stage 1)

*Survey 10.26 · 2026-10-11 · Source: "AA36 game engine update v3", items 1 and 2 (starred), and the answers to the scope and jump questions*

## What is built

- **Field stride.** A step starts at 55% pace and builds to full pace over about 0.3 s of holding a direction. It drops back over about 0.25 s after you stop, so the next walk starts slow again. Stopping distance is about one tile at walk pace, since the tile in progress finishes. Crouch, walk and run keep their own pace.
- **Cave acceleration and friction.** Running speed builds toward its target on the ground at 40 tiles a second squared, and stops with friction at 50 when you let go. In the air, control is weaker (25), so a jump keeps its arc.
- **Coyote time (cave).** For 0.12 s after leaving a ledge, a jump still starts. Jump buffering already existed: a press just before landing still registers.
- **Jetpack tap hop (field).** A quick tap of Square (released before 0.18 s) hops Carl about 0.8 tiles up. He settles back down on his own, and the hop clears low ground while it lasts.
- **Jetpack hold to fly.** Holding Square for 0.18 s or more starts flight. The lift still builds gradually, as before.
- **Faster Jetpack.** Field flight moves at 0.105 s a tile, up from 0.15 (about 40% faster). The cave's climb rate rises from 8 to 11 tiles a second.

## Decisions

- **Top-down jumping is the Jetpack's tap only.** There's no separate jump key in top-down exploration. In caves, Up still jumps.
- **Stopping distance.** Stopping is smooth but not instant. Stage 1 keeps the tile-based field, so a stop finishes the tile in progress.
- **Values are placeholders.** Accelerations, friction, the hold time and the hop height are tuning numbers, to be adjusted in play.

## Not built (Stages 2 and 3)

- Squash and stretch on jump and landing; dust, screen shake and freeze frames; animation-linked sound with pitch variation; collection sparks and bursts.
- Side-scrolling utility combat effects and transitions between top-down and platform play.
