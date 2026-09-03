# INTERIOR ROOMS · walls, doors, and horizontal travel
**Proposal, 2026-09-03.** *Creator: "what is the best way to show rooms? like how should we build walls and show doors on the same floor of a building. we got stairs down pact already. I want buildings to have walls and doors so we have **horizontal travel interiors**."*

---

## ★★★★ 0 · WHAT EXISTS — one wall, and it is decorative

**[BUILD]** An interior is a rectangle with four fields that matter:

```js
cols: 20, rows: 15,
tileImg: SEER_HQ_FLOOR_IMG,     // one floor tile, everywhere
wallImg: 'seer',                // ★ draws a band at ROW 0 only
blocked: [],                    // ★ arbitrary blocked tiles — EMPTY in all three seer floors
```

★★★ **`wallImg` is not a wall system. It is a wallpaper strip along the top edge**, and
`walkable()` hard-codes `y === 0` as solid. Everything below row 0 is open floor.

★★★★★ **And `blocked` — the thing that would make interior walls — is already there, is
already O(1)-capable via `cfg.isBlocked(x,y)`, and DRAWS NOTHING.**

> ★★★★★ **So the gap is not collision. It is that a blocked tile is invisible.** Add
> walls today and the player walks into nothing, on floor, with no explanation.

**Two problems to solve, and only the second is real:** *(1)* how to author a floor plan,
*(2)* **how a wall gets drawn.**

---

## ★★★★★ 1 · AUTHOR FLOORS AS TEXT — it is already the house style

★★★★ **The overworld is stored as row strings** (`D['rows']`, one character per tile,
`'.'` = void) and the map exporter reads it that way. **Do the same for interiors.**

```js
plan: [
  "####################",
  "#........##........#",
  "#..C..G..##..G..C..#",
  "#........D#........#",     // ← D is a doorway between the two north rooms
  "#........##........#",
  "####D#######D#######",
  "#..................#",     // ← the spine corridor
  "#...G.........G....#",
  "#..................#",
  "#######L############",     // ← L is the LOCKED door
  "#........#.........#",
  "#...C....#....C....#",
  "#........#.........#",
  "#...S....D.........#",     // ← S is the stair down, already-solved system
  "####################",
]
```

| char | means |
|:--:|---|
| `#` | wall · blocked + drawn |
| `.` | floor |
| `D` | **doorway** · walkable, framed |
| `L` | **locked door** · needs this district's Seer Key |
| `C` | chest |
| `G` | grunt spawn |
| `S` | stair *(existing `stairsList`, unchanged)* |

★★★★★ **Why this and not a rect/room list:** *you can see the floor plan in the source
file.* A 15-line string block is authorable by hand, reviewable in a diff, and **makes 30+
floors tractable.** ★★ A `rooms: [{x,y,w,h}]` schema is more "correct" and nobody can read
it at a glance.

★ **It costs one derivation step at load:** walk the plan once, emit `blocked`, chest
positions, spawn points and door tiles. **Everything downstream keeps working unchanged**,
because it still ends up as the `blocked` array `walkable()` already reads.

---

## ★★★★★ 2 · HOW A WALL DRAWS · like a tiny prop, not like a tile

★★★★★ **This is the actual answer to "how should we show rooms."**

> **A wall is drawn BOTTOM-ANCHORED on its collision tile, about 1.6 tiles tall, and
> depth-sorted with everything else.**

★★★★ **That is `drawProp`'s existing behaviour** — bottom-centre anchor, art taller than
its footprint, `footY` sort in `drawWorldLayer`. **No new rendering concept.** A wall is
just the smallest possible building.

★★★ **What it buys, all three from one decision:**

1. ★★★ **The wall has a FACE.** A flat 1×1 tile reads as a floor patch; 1.6 tiles tall
   reads as something standing up. **That is the whole difference between "invisible
   collision" and "a room."**
2. ★★★ **You walk BEHIND the top of it.** Depth sorting means the overhang occludes the
   player as they pass along the far side — the cue that sells solidity.
3. ★ **The existing row-0 band becomes redundant** and can stay or go; a plan whose top
   row is `#` produces the same look without a special case.

★ **The mock** *(`outputs/seer_hq_rooms_mock.png`, rendered from the plan above with the
shipped `seer-hq-wall.png` and `seer-hq-floor.png`)* is that rule and nothing else: same
two tiles the build already loads, 20×15, walls at 1.6× height. **Three rooms, a spine
corridor, four doorways and one locked door — and it reads without a legend.**

---

## ★★★★ 3 · DOORS · three kinds, one mechanism

★★ **A door is a floor tile that happens to be inside a wall run.** It needs no
transition, no load, no scene change — ***that is what makes it horizontal travel.***

| | behaviour | art |
|---|---|---|
| **DOORWAY** `D` | walkable, always | a frame in the wall gap |
| **CLOSED** | interact to open, then walkable | shut leaf → open leaf |
| ★ **LOCKED** `L` | needs the **district Seer Key** | barred · the existing `lockedMsg` copy works verbatim |

★★★★★ **And this improves the Seer Key.** Today it gates the **stair to the Commander** —
one door, at the end. ★★★ **With interior doors it can gate a ROOM**, so the key stops
being a floor unlock and becomes what a key actually is: *the thing that opens the room
you could see and could not enter.*

★★ **The locked-stair copy already shipped** (*"◈ SEALED · the stair to the top floor will
not open · VERIDAN SEER KEY needed"*) and needs one noun changed.

---

## ★★★★ 4 · WHAT THIS UNBLOCKS BEYOND THE SEER HQs

★★★ **Every interior in the game is currently one open box.** Homes, the school, the town
halls, the Academy, the hospital, Baelgor University, the thirty unbuilt lore buildings.

> ★★★★ **A floor-plan format is not a Seer HQ feature. It is the thing that lets any
> building have more than one room** — and `SEER_HQ_INTERIOR_DESIGN.md` needs 30–50 floors
> that cannot be hand-placed tile by tile.

★ It also gives the **Gemlord sanctums** their descent (§0m: they begin on the overworld
and go underground) somewhere to descend *into*.

---

## ★★★★★ 5 · THE ONE REAL QUESTION · does the floor fit on the screen?

**A 20×15 floor at TILE=48 is 960×720 — about one screen.** So the player sees the whole
plan the moment they walk in.

| | |
|---|---|
| ★ **(a) accept it** | **Recommended.** Team Rocket bases are fully visible too. The tension is *"which of these ten crates has something,"* not *"where is the wall."* **Costs nothing** |
| **(b) floors bigger than the screen, camera scrolls** | ★★ Feels far more like a *base* — and `isBlocked(x,y)` exists precisely because **Dreamland is 100×100**, so big interiors are already supported. Costs a camera pass |
| **(c) reveal rooms as entered** | atmospheric, and **the most work** for the least return here |

★★ **[ASK] and it is worth answering before floors get authored**, because (b) changes
every plan's dimensions. ★ *My read: ship (a) now, and if the late-district raids feel
small, (b) is a camera change and not a re-authoring — the plans stay valid either way.*

---

## ★ 6 · IMPLEMENTATION ORDER, IF YOU WANT IT

1. `parseFloorPlan(plan)` → `{ blocked, doors, chests, spawns }` · pure function, unit-testable
2. Wall draw pass · bottom-anchored, `footY`-sorted · **reuses `drawProp`**
3. Door tiles · walkable + framed · locked variant reads `hasSeerKey(dist)`
4. Convert the three shipped Seer floors to plans · **the look changes, nothing else does**
5. Then, and only then, author the district hold floors

★ **Step 4 is the proof.** If the existing three floors can be expressed as plans and play
identically, the format is right.
