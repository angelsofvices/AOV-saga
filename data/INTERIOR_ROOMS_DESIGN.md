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

## ★★★★★ 2-bis · THE EMERALD RULES · 2026-09-03

> **Creator:** *"look how pokemon emerald does doors and walls and depth interiors. also I think I wanna make all walls take up **3 tiles** so they look taller than rizer."*

### ★★★★★ (a) 3 tiles — and Rizer is 2, so the ratio is 1.5×

**Confirmed against the build:** `rizerTargetBodyPx()` draws Rizer at `TILE*2`. **A
3-tile wall stands half again his height** — which is the whole point, and it is what
makes an interior feel enclosed rather than fenced.

### ★★★★★ (b) ONLY SOUTH-FACING WALLS ARE TALL — this is the rule Emerald actually uses

★★★ Reading the reference sheet: **a wall is drawn tall only where you can see its
FACE.** The band across the top of every Emerald room is 2–3 tiles; the left and right
edges are a thin strip; **the bottom wall is barely there at all.** You are looking at
the room from the south, so only north walls show a face.

> ★★★★★ **The autotile rule, and it needs no author input:**
> **if the tile BELOW is floor → draw the 3-tile FACE. Otherwise → draw the 1-tile CAP.**

★★ That one line produces the whole Emerald look from a flat plan, and it means the
author never marks which walls are tall.

### ★★★★★ (c) ★ THE FINDING THAT MATTERS MOST · our wall is DARKER than our floor

**Measured, both shipped tiles:**

| | mean luminance |
|---|---:|
| `seer-hq-wall.png` | **21.7** |
| `seer-hq-floor.png` | **27.7** |
| **contrast** | ★ **5.9 — and the floor is the LIGHTER one** |
| *Emerald reference* | ★★ *wall ≈198 · floor ≈150 — the wall is **~48 LIGHTER*** |

> ★★★★★ **Emerald's interiors read because the WALL IS LIGHTER THAN THE FLOOR. Ours is
> darker, by a margin too small to see either way.**

★★★★ **This is why the 3-tile mock reads as holes in a void rather than rooms.** The
A/B *(`outputs/seer_wall_contrast_ab.png`, identical plan, only the wall's luminance
changed)* is the proof: **the geometry was already right and invisible.**

★★★ **So the blocker on interiors is an ASSET, not code.** The Seer wall texture needs
to sit **clearly above the floor in luminance** — Emerald's ~48 gap is a good target.
★ *Doing it in code with a brightness multiply is what the mock does, and it would work,
but a lit wall is the artist's call, not a shader's.*

### ★★ (d) DOORS ARE SET INTO THE WALL BAND

★ Emerald draws the door **within** the wall face — a dark recess with a frame — and the
**walkable tile is the one BELOW it.** ★★ So a door needs no special geometry: it is a
wall tile whose face art is the door, plus a floor tile under it. **The `D` in the plan
marks the threshold; the recess draws in the face above it.**

### ★★★ (e) THE ONE COST · 3-tile walls eat rows

★★★ **A wall you can see the face of must be authored 3 rows deep**, or the two tiles it
covers will look solid and walk as floor. On a **35×25** floor:

| | rows |
|---|---:|
| north wall | 3 |
| two interior dividers | 6 |
| south wall | 1 |
| ★ **left for actual floor** | **15** — about **5 rows per room band** |

★★ **That is playable but tight.** ★ **[ASK] worth deciding now: keep 35×25 and accept
three shallow bands, or go 35×30 and get 7 rows a band?** *The plans are text either
way — this is a one-line change today and a re-authoring later.*

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

## ★★★★★ 3-bis · DOORS · RULED 2026-09-03 · solid, coloured, interact-to-enter

> **Creator:** *"I want the tile floor to stay same color, I want **different color doors on the tile wall** and I want to have to **interact with door to unlock and enter it. no holes in the wall doors.**"*

★ **This supersedes §3 below, which had doors as walkable gaps.**

### ★★★★★ (a) A DOOR IS A WALL TILE, NOT AN ABSENCE

> **The wall run is CONTINUOUS. A door is a wall tile whose face carries door art, and
> it is SOLID — before opening and after.**

★★★★★ **You never walk through it.** Interact → it opens → **you are placed on the far
side.** The wall is never breached, which is *"no holes"* satisfied literally rather than
cosmetically.

### ★★★★★ (b) ★ AND THAT QUIETLY FIXES THE ROW BUDGET I FLAGGED

§2-bis(e) worried that 3-tile walls eat 10 of 25 rows, leaving ~5 per room band, because
rooms had to be joined by walkable corridors.

> ★★★★★ **If a door is a TRANSITION, rooms do not need corridors at all. They abut.**
> **The 3-row wall cost stops mattering — and 35×25 is comfortable again.**

★★ It also means a 3-tile-thick wall costs nothing to traverse. **You never cross the
thickness, so the wall can be as tall as it likes.** *The two rulings turn out to need
each other.*

### ★★★★ (c) COLOUR = LOCK CLASS · the player reads the floor from the doorway

★★★ **Colour should say what it takes to open it**, not what is behind it — a player
scanning a dark hall wants to know *"can I open that yet."*

| plan | colour | opens with |
|:--:|---|---|
| `d` | **steel** | interact · nothing needed |
| `k` | **amber** | ★ this district's **SEER KEY** |
| `c` | **red** | the Commander's floor |
| `e` | ★ **teal** | the **Elder's cell** — only in Netharion, Vorashil, Xilnar |

★★★★★ **And the mock proves an unexpected thing: the coloured doors ARE the
readability.** They are the brightest objects in the room, and you navigate by them the
way you navigate a Metroid map. ★★ **So §2-bis(c)'s contrast finding is DOWNGRADED from
a blocker to an improvement** — the wall being darker than the floor is still worth
fixing, but **the interiors are legible without it.** *I called it the blocker; the
doors were.*

★ **The floor tile is untouched, as ruled.**

---

## ★★★★ 3 · ~~DOORS · three kinds, one mechanism~~ · ★ SUPERSEDED by 3-bis

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

## ★★★★★ 5 · ~~THE ONE REAL QUESTION~~ · **RULED 2026-09-03 · 35×25, option (b)**

> **Creator:** *"**35x25 mapping** so we cant see full base on entry."*

★ **(b) it is, and I was wrong to recommend (a).** I argued the whole floor being visible
was fine because Team Rocket bases are visible too. ★★★ **This is better, and the reason
is the loot:** §2 of the HQ design makes the rooms full of the district's stolen property,
**and a room full of things you cannot see yet is worth walking into.** *Visible-plan
kills the one thing the design is built on.*

| | |
|---|---|
| **floor** | **35 × 25** = 1680 × 1200 px at `TILE=48` |
| **view** | ~960 × 720 |
| **visible at once** | ★ **~34% of the floor** |

★★★★★ **And it costs nothing, because interiors ALREADY SCROLL.** `drawInteriorFloor`
culls to `startCol/endCol` from `_cam.x/_cam.y` and draws at `tx*TILE - _cam.x`
**[BUILD]**. ★★ There is no camera pass to write — **I flagged it as a cost and it was
already paid.**

★★★★ **35×25 is also what makes the text format load-bearing.** 875 tiles cannot be
hand-placed; **25 lines of 35 characters can.** Thirty floors ≈ **750 lines**.

★ **Sequencing, stated because it would be the obvious mistake:** do not widen `cols/rows`
before the plans exist. **A 35×25 empty box is the current empty box with more walking.**

---

## ★ 6 · IMPLEMENTATION ORDER, IF YOU WANT IT

1. `parseFloorPlan(plan)` → `{ blocked, doors, chests, spawns }` · pure function, unit-testable
2. Wall draw pass · bottom-anchored, `footY`-sorted · **reuses `drawProp`**
3. Door tiles · walkable + framed · locked variant reads `hasSeerKey(dist)`
4. Convert the three shipped Seer floors to plans · **the look changes, nothing else does**
5. Then, and only then, author the district hold floors

★ **Step 4 is the proof.** If the existing three floors can be expressed as plans and play
identically, the format is right.
