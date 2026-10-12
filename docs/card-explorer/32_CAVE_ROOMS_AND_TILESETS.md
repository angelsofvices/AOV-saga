# 32 · Cave Rooms and Celeste-Style Tilesets

*Survey 10.33 · 2026-10-12 · Source: Creator direction (caves are the intermediate levels, "Celeste meets Pokémon with enemies in the way"; each cave has 3–5 rooms and ends at a peak or a valley holding the teacher, rare Zyrex and rare loot; the way home is back through the cave), and "Celeste Tilesets, Step-by-Step" by Aran P. Ink for the art method.*

## The shape of a planet's main mission

```
overworld ── cave mouth ── room 1 ── room 2 ── … ── room 3-5 ── PEAK or VALLEY (Immortal Zone)
   ▲                                                                    │
   └──────────────────── back through every room ◄──────────────────────┘
```

- Every planet 1–27 has one cave. Its cave is **3 to 5 rooms** (`caveRoomCount`, seeded per planet).
- A cave runs either **up to a peak** or **down into a valley** (`caveKind`, seeded per planet; 12 peaks, 15 valleys).
- The last room opens onto the planet's **Immortal Zone**, now presented as THE PEAK or THE VALLEY. It holds:
  - the **world's teacher** (worlds with a people race, not Zyraxis): talking to them registers the planet (its words, its Codex pages, its people card);
  - **rare Zyrex** (the habitat variants of `aethren_variants.js`, tier 3+, twice as likely as the planet's other rare Aethren), up to 5 spawns;
  - the deity clearing and the four ancient caches (unchanged).
- **The only way home is back through the cave.** The zone's exit drops Carl into the last room, at its far side. The mouth no longer offers a shortcut to the zone.
- Room 1's left opening is the cave mouth. Walking out of it (or pressing up at the mouth) returns Carl to the overworld beside the mouth.
- Rooms remember their loot and fallen foes while Carl is inside the cave. Leaving the cave resets them.

The teacher used to stand at the field camps, then briefly in the cave itself. Camp folk now point to the cave instead of teaching ("side missions" stay: once the words are learned, camps, refugees, Codex people and records all work as before).

## Rooms

Each room is a chain of **ledges** from a left opening to a right opening (`worldgen.js · caveRoom`).

| | Peak cave | Valley cave |
|---|---|---|
| Enters | bottom-left | top-left |
| Exits | top-right | bottom-right |
| Each step | rises 0–2 tiles | drops 0–2 tiles |

- Size: 44–57 tiles wide, 20–24 tall. The camera shows about 15×9 tiles, so rooms scroll both ways.
- Step types: **step** (a 1–2 tile wall, no gap), **gap** (a pit 1–3 wide), **hop** (a wide pit with a floating ledge, `P`, in the middle).
- Pits have pale spikes on their floor, or are bottomless (a fall sends Carl back to the last safe ground, with a little damage).
- Enemies stand on long ledges, in the way: up to 1 + the room index per room, and at least one in every room after the first.
- Loot (`$`) hangs over the gaps and sits at the ends of some ledges.
- Air above every ledge is 6–8 tiles, with a ragged ceiling.
- Tiles: `#` rock, `G` earth (ledge tops), `P` floating ledge, `C` crystal vein, `H` spikes, `$` loot. A separate background layer (`b`) has holes where the far cave shows through.

### Every room is proven crossable, both ways

The generator only keeps a room if a simulation of Carl's real cave physics (`caveCrossable`) can cross it **left to right and right to left**. Walking back matters because the way home is through the cave.

- Physics (from `updateSide`): run 6.2 tiles/s, jump 12.5, gravity 32, air control 25, box 0.6 × 0.9. That gives a jump about 2.4 tiles high and up to about 4.8 tiles long.
- The check finds every ledge Carl can stand on. From each tile of each ledge it tries jumps with full and partial holds in both directions, and steps off each end. It then searches for a path from the entrance ledge to the exit ledge and back.
- If a room fails, the generator tries again (up to 7 times), then switches to a safe layout of steps only.
- Current result: **106 rooms across 27 caves, all crossable both ways.** Building a whole cave takes about 15 ms.

## Art: the Celeste tileset method

`cave_art.js` paints each room once, when Carl first enters it, onto two canvases (back wall and solids). Each frame then draws them scaled, with the live layers on top. The steps follow the article in order.

1. **8×8 grid.** One physics tile is 2×2 auto-tiles of 8×8 art pixels, so the art has Celeste's density while Carl's physics stay unchanged.
2. **Several tilesets per room, one shared infill.** Rock, earth, ledge and crystal each have 3–5 colours. All of them share the same near-black infill, so they blend where they meet.
3. **A 1px edge outline.** Light on top edges (light from above), mid-light on sides, dark on bottoms.
4. **Auto-tiling.** Each auto-tile reads its 8 neighbours: edges, outer corners (rounded off) and inner corners.
5. **Edge details.** Every tileset has 1–2 lights, a mid-tone and 1–2 darks. Oblong rock chunks are light on top and dark underneath. The edge-to-infill boundary is jagged, never a straight line, and a few outer pixels are left transparent to break the contour.
6. **Random edge variants.** Straight edges pick from 4 variants, so long rows never repeat every 8 pixels. Corner tiles pick from 2.
7. **Random infill ring.** The second ring in from the edge uses about 12 abstract dark tiles (blobs, diamonds, slabs touching 1–2 edges, darker toward the bottom), about 15% of them empty. The colours stay close to the infill, so they read as depth, not noise.
8. **Foreground props that break the grid.** Moss and grass blades on earth tops, pebbles, crystal shards on crystal, stalactites and drips under ceilings, and spikes as props.
9. **A background tile layer with holes.** It is auto-tiled the same way, darker and desaturated.
10. **Background props.** Old timber supports, hanging roots, and carved marks in the world's script (a nod to the words you have come to learn).
11. **Parallax backdrop.** A gradient (lighter at the top for a peak, lighter at the bottom for a valley) and two silhouette layers at 0.15 and 0.35 parallax.
12. **Particles and a screen gradient.** Slow dark motes behind and quicker pale motes in front, plus a faint warm-left, cool-right wash. The last room glows with the light of the peak (pale sky) or the valley (green). The first room glows faintly with daylight from the mouth.

**Palettes** come from each planet's own palette in `environments.js` (ground and path colours), hue-shifted into cave light: lights warmer, darks cooler, with lightness clamped so edges always read against the infill and the backdrop. A peak cave's moss is pale and frosty; a valley's is lush green.

## Minimap

- **Overworld:** a gold ring on the cave mouth, or an edge pip pointing to it, until the planet's words are learned.
- **Cave:** a gold ring on the room's far opening (the way on), or an edge pip when it is out of view.
- **Peak or valley:** a gold ring on the teacher.

The cue only shows on worlds with a people race (the teacher's worlds), and clears once the words are learned.

## Open questions for the Creator

1. **Eight cave planets have no people race** (1, 4, 5, 6, 7, 13, 14, 19), so they have no teacher. They still unlock through their records (copy two). Should their peak or valley hold something else that registers the planet?
2. **Zyraxis (world 9)** keeps its own first-contact flow (the fur-clad inhabitant in Malezor, then the district peoples). Its cave leads to its peak or valley like the others, but has no teacher there.
3. **The shortcut from the mouth to an already-charted zone was removed**, so the cave is always the road both ways. Say so if you want it back for repeat visits.

## Files

- `explorer/worldgen.js`: `caveKind`, `caveRoomCount`, `caveRoom`, `caveCrossable`, `buildCave` (rooms). The old single-strip cave is kept as `buildCaveStrip`. `buildImmortal` adds the teacher, rare Zyrex and peak/valley terrain.
- `explorer/cave_art.js` (new): `AOV_CAVE_ART.palette`, `paint`, `drawBack`, `drawRoom`, `drawFront`.
- `explorer/explorer.js`: `enterCave(no, lm, { fromZone })`, `caveRoomEnter`, `caveRoomGo`, `caveArt`; the room edges in `updateSide`; enemies stand on any ledge; the zone exit returns through the cave; minimap cues; `teachTarget`; and the teacher in `talkPeople` (`n.teacher`).
