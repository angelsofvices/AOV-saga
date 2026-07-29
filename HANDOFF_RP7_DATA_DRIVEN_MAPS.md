# RP7 · DATA-DRIVEN MAP SYSTEM — Porymap's model, none of Nintendo's code

**Decision context:** RP7 is IP you intend to own and publish. So we mine the *formats and
workflow* that make ROM-hack tooling productive and implement them in RP7's own engine.
Nothing here is derived from a decompilation, a disassembly, or any Nintendo binary. Every
byte in this pipeline was generated from `rp7.html`, which is yours.

---

## PART A — What was actually holding RP7 back

Your maps are ASCII string arrays where **one character carries every meaning at once**:

```js
'=Fe.......wU.=',   // = wall · F fridge · e stove · w stairs down · U stairs up
```

That's a legitimate design and it got you 20 maps. But it has four hard ceilings:

1. **The character namespace is nearly full.** 60 distinct tile chars are already in use, and
   `walkable()` carries a 34-character blocker string that has to be hand-edited every time you
   add furniture. There are maybe 30 usable printable characters left, project-wide, forever.
2. **One layer.** A character is either floor or a couch, never floor *with* a couch on it. No
   draw-above layer means no walking behind a tree canopy or a roof edge — the thing that makes
   Emerald's towns feel three-dimensional.
3. **Events are welded to geometry.** An NPC *is* the letter `m`. You can't have two Moms, can't
   attach a script to one, can't move her without editing a string literal.
4. **No editor.** Every map edit is a hand-count inside a 1.37 MB HTML file.

Porymap solves all four with data, not engine magic. That's what we've replicated.

---

## PART B — What shipped in this drop

```
tools/rp7-map-extract.js          re-runnable converter · reads rp7.html, writes everything below
data/tilesets/rp7.json            60-tile table · char, class, walkable, gid
data/tilesets/rp7-overworld.png   480×128 tile atlas, rendered by the game's OWN drawTile()
data/maps/<id>.json               20 maps · RP7-native format
data/maps/<id>.tmj                20 maps · open directly in Tiled
```

**Verified:** all 20 maps round-trip **byte-identical** to the arrays the running game holds in
memory. The converter was checked against a live booted instance, not against the source text.

The tile atlas is the part worth pausing on. Rather than redrawing 60 tiles by hand, the
converter boots RP7 headless and calls your own `drawTile()` once per character into an offscreen
grid, then exports it. **Your procedural tile art is now a real tileset image** — which means
Tiled can show you your actual game tiles while you paint maps. Re-run the tool after any art
change and the atlas regenerates.

---

## PART C — The map format

```jsonc
{
  "id": "home_interior",
  "label": "Home · Main Floor",
  "width": 14, "height": 9, "tilewidth": 32, "tileheight": 32,
  "tileset": "../tilesets/rp7.json",

  "layers": {
    "ground":    [12, 3, 3, ...],   // gid per cell, row-major
    "collision": [1, 0, 0, ...]     // 0 walkable · 1 blocked
  },

  "events": [
    { "type": "warp", "x": 7, "y": 7, "char": "x", "id": "home_interior_warp_7_7", "script": null }
  ],
  "warps": [],
  "encounters": null,

  "legacyAscii": ["======~~======", ...]   // safety net · delete once cutover is done
}
```

`legacyAscii` is deliberate. Until the loader is wired in, every JSON file can regenerate the
exact string array the current engine expects — so this drop is **purely additive and cannot
break the running game**.

### The three layers to add next

| Layer | Purpose | Why Emerald needs it |
|---|---|---|
| `ground` | the floor · always drawn | ✔ shipped |
| `overlay` | props drawn *above* the player | walk behind tree canopies, roof edges, counters |
| `collision` | 0 / 1 per cell, independent of art | a rug isn't a wall; a painted-on wall is |

Splitting collision from art is the single highest-value change. It retires the 34-character
blocker string in `walkable()` entirely — collision becomes a lookup, not a `String.includes`.

---

## PART D — Events as data (this is the big one)

Today an NPC is a map character. Under the new model a map character is only *art*, and every
interactive thing is a row in `events`:

```jsonc
{
  "type": "object",          // object · warp · sign · trigger
  "id": "mom",
  "x": 6, "y": 5,
  "gfx": "humanoid_04",      // /assets/humanoids/ — decoupled from the tile
  "movement": "look_around", // static · look_around · wander(2) · path([...])
  "facing": "down",
  "flag": "mom_moved_out",   // hidden while this flag is set
  "script": "mom_intro"
}
```

```jsonc
{ "type": "warp", "x": 7, "y": 7, "dest": "malezor", "destX": 12, "destY": 4, "dir": "down" }
```

Warps as data kills the hardcoded door-character checks in `tryMove`. One generic handler reads
the event table — and adding a door stops being a code change.

### Script commands

A script is a list. Twelve commands cover essentially every beat you've written so far:

```jsonc
"mom_intro": [
  ["lock"],
  ["face", "player"],
  ["msgbox", "MOM: Don't leave without your shard, sweetheart."],
  ["if_flag", "got_shard", "mom_already_gave"],
  ["giveitem", "starter_shard", 1],
  ["setflag", "got_shard"],
  ["msgbox", "MOM: There. Now go make the districts remember you."],
  ["release"]
]
```

`lock · release · face · msgbox · choice · giveitem · setflag · clearflag · if_flag · warp ·
battle · applymovement`. Your dialogue is currently inline in the render/interact code; this
moves it to data you can edit, translate, and diff.

---

## PART E — Migration path (each step ships independently)

1. **Land the files.** Done — additive, nothing consumes them yet.
2. **Write the loader.** `enterMap()` reads `data/maps/<id>.json` and rebuilds `MAP` from
   `legacyAscii`. Behavior identical, but maps now live outside the HTML. ~40 lines.
3. **Switch to gid rendering.** `drawTile()` takes a gid rather than a char. The character
   namespace ceiling disappears the moment this lands.
4. **Move collision to the layer.** `walkable()` reads `layers.collision`. The 34-char blocker
   string is deleted.
5. **Extract events.** Trainer/warp/chest characters become `events` rows; the grid keeps only
   art. Two Moms become possible.
6. **Add the overlay layer.** Walk-behind depth. This is where it starts *looking* like Emerald.
7. **Retire the procedural generators.** Run `generateDistrictMap()` etc. once, serialize the
   output to JSON, then edit those maps in Tiled forever after. Ten districts stop being code.

Step 7 is worth stating plainly: the district generators aren't a feature, they're a workaround
for not having an editor. Once Tiled is in the loop, freeze their output and hand-author it.

---

## PART F — Using Tiled

Open `data/maps/home_interior.tmj`. You'll see the ground layer painted with your own tiles, a
hidden collision layer, and an `events` object group. Paint, save, re-run the game. Tiled is
MIT-licensed, actively developed, exports the JSON you're already reading, and has a tile
collision editor and object templates built in.

Set the grid to **32 × 32** to match the Emerald scale work — one Tiled cell is one RP7 tile is
one Emerald tile at 2×. A character is 1 cell wide and 2 cells tall.

---

## PART G — The legal line, stated once so it's on the record

| Safe to mine | Not safe |
|---|---|
| File formats and schemas | Decompiled engine source (`pokeemerald` and relatives) |
| Editor UX and workflow patterns | Battle formulas transcribed from the binary |
| The *idea* of metatiles, events, script commands | Any built ROM or patch |
| Open tools: Tiled, LDtk, Aseprite | Ripped sprites, tilesets, music, or map data |

Interfaces and data formats are the safest category to reimplement; compiled or decompiled game
code is the least safe. Everything in this drop was generated from your own file. Keep it that
way and RP7 stays sellable.

---

## PART H — Re-running the converter

```bash
node tools/rp7-map-extract.js rp7.html data
```

Idempotent. Run it after any map or tile-art edit — it re-extracts all maps, rebuilds the tile
table, and (with the headless step) regenerates the atlas. Current run:

```
ascii map literals found : 21
registry entries         : 20
maps written             : 20
distinct tile chars      : 60
parity                   : 20/20 byte-identical to the running game
```
