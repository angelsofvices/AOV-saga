# ZYRAXIS · OVERWORLD ASSET PROMPT PACK v1

Generation prompts for overworld environment art. Paste a **STYLE HEADER** + one **ASSET BLOCK** per generation.

**Why this is a vocabulary and not a catalogue:** Zyraxis is 1020×800 tiles. District land totals ~426,000 tiles; the built town core is ~2,700. Every district is roughly **16× its built area**. Fifty composable tileable pieces will fill that. Five hundred unique props will not.

---

## 0 · STYLE HEADER — prepend to EVERY prompt

```
2D-HD pixel art game tileset, top-down 3/4 perspective RPG overworld,
48x48 pixel tile grid, crisp pixel edges with no anti-aliasing on outlines,
rich saturated colour with clear light source from the upper-left,
readable silhouette first and detail second, cohesive fantasy world art,
NO text, NO watermark, NO grid lines drawn on the art, NO drop shadows
outside the sprite, flat solid MAGENTA (#FF00FF) background.
```

**Pipeline notes**

- Background **must** be flat magenta `#FF00FF` or neon green `#00FF00` — the 4-corner flood-fill keyer expects it and will not touch interior pixels.
- Everything sits on a **48px grid**. Sheet dimensions are always multiples of 48.
- Tileable sets must be **seamless on all repeating edges** — say so in the prompt.
- Deliver as a **sheet**, not separate files. The extractor slices on the stated grid.

---

## 1 · ELEVATION · the highest-value set

> One cliff strip repeated turns flat nothing into a landform. Build this first.

### 1.1 Cliff / plateau master set — **9 tiles, 432×432 (3×3 grid… ship as 5×3, 720×144)**

```
[STYLE HEADER]
A seamless cliff-edge tileset for a raised plateau, arranged as a 5x3 grid of
48x48 tiles. Row 1: outer corner top-left, top edge, outer corner top-right,
inner corner left, inner corner right. Row 2: left edge, flat plateau grass
surface, right edge, cliff face upper, cliff face lower. Row 3: bottom-left
corner, exposed rocky cliff FACE showing stratified stone layers, bottom-right
corner, scree rubble at the cliff base, grass overhang lip.
Grey-brown stratified granite with moss on the top lip. Edges must tile
seamlessly when repeated horizontally.
```

Ship this **once per district palette**: Malezor granite/moss · Zarvane sandstone · Andrannor dusk basalt · Veridan river-cut limestone · Netharion violet crystal-veined · Vorashil blue steel-shot rock · Xilnar pale grey slate · Baelgor ember-streaked basalt · Thardin teal machine-cut stone · Korathen gold-veined marble.

### 1.2 Stairs — 288×144 (6×3)

```
[STYLE HEADER]
A 6x3 grid of 48x48 stair tiles for a top-down RPG. Three stair styles, one
per column pair: rough-cut stone steps, carved dressed-stone steps with a
railing, and wooden plank steps. Each style shown ascending NORTH (away from
camera) in the left column and descending SOUTH in the right column, with a
matching landing tile below. Steps must align to the 48px grid and read
clearly as climbable from directly above.
```

### 1.3 One-way ledges — 288×48 (6×1)

```
[STYLE HEADER]
A horizontal row of six 48x48 tiles: a low drop-off ledge seen from above,
where a character can hop DOWN but not climb up. Show a grass lip with a
short 24px rocky face beneath. Variants left to right: straight ledge,
straight ledge with a worn dirt path, ledge with a small shrub at the edge,
left end cap, right end cap, and a ledge corner turning south.
```

### 1.4 Mountain silhouette mass — 576×384

```
[STYLE HEADER]
A large impassable mountain massif for the far background of a top-down RPG
overworld, drawn as a horizontally tileable band 576x384 pixels. Layered
ridges receding into haze, snow on the highest peaks, exposed rock faces,
a few clinging pines. The base must blend into ground level so it can sit
behind walkable terrain. Left and right edges tile seamlessly.
```

---

## 2 · WATER · rivers, ponds, lakes, coast

### 2.1 Water surface, animated — 144×48 (3 frames)

```
[STYLE HEADER]
Three sequential animation frames of a 48x48 seamless water surface tile,
side by side. Clear freshwater with gentle rippling highlights that shift
between frames to loop smoothly. Tiles seamlessly in all four directions.
Deep blue-teal with pale specular glints.
```

### 2.2 Shoreline edge set — 432×144 (9×3)

```
[STYLE HEADER]
A 9x3 grid of 48x48 shoreline transition tiles between grass and water for a
top-down RPG. Row 1: outer corners and straight edges for the north shore.
Row 2: west edge, open water, east edge, plus inner corners. Row 3: south
shore edges and corners. Include wet sand, a few pebbles, and reeds on the
grass side. All edges tile seamlessly with both the grass and water tiles.
```

### 2.3 Waterfall — 144×288 (3 wide × 6 tall)

```
[STYLE HEADER]
A waterfall for a top-down 3/4 RPG, 144x288 pixels, three tiles wide.
Top row: the lip where the river pours over the cliff edge. Middle rows:
falling white water against a wet dark rock face, vertically tileable so the
fall can be any height. Bottom rows: churning splash pool with foam and mist.
```

### 2.4 Bridges — 432×192

```
[STYLE HEADER]
A 9x4 grid of 48x48 bridge tiles for a top-down RPG. Three bridge types:
wooden plank with rope rails, dressed stone arch, and rope-and-slat
suspension. For each, provide a horizontal span tile, a vertical span tile,
and both end caps that meet the shore. Bridges must read as walkable
surfaces from directly above.
```

---

## 3 · CAVES

### 3.1 Cave mouth set — 288×192 (6×4)

```
[STYLE HEADER]
A 6x4 grid of 48x48 tiles showing a cave entrance carved into a rocky cliff
face, seen from a top-down 3/4 angle. The opening is a dark arch with jagged
stone framing, deep shadow inside fading to black, loose boulders and scree
at the threshold, and a worn dirt path leading in. Include a wider three-tile
grand entrance variant and a narrow single-tile crawl variant.
```

### 3.2 Cave interior dressing — 384×192 (8×4)

```
[STYLE HEADER]
An 8x4 grid of 48x48 cave interior props for a top-down RPG: stalagmites in
three sizes, stalactites hanging from above, a glowing crystal cluster in
violet, a second cluster in teal, a still underground pool with reflections,
a mushroom patch with luminous caps, rubble piles, a broken mine cart, and
support timbers. Flat magenta background, props isolated with clear gaps.
```

---

## 4 · AGRICULTURE · "all forms"

> Agriculture is the tell that a place is inhabited. It lives in the NPC-homes ring.

### 4.1 Tilled soil + crop stages — 480×288 (10×6)

```
[STYLE HEADER]
A 10x6 grid of 48x48 farm tiles for a top-down RPG. Row 1: dry tilled soil
rows, watered dark soil rows, and furrow end caps. Rows 2-4: three crop types
(leafy greens, tall grain, and root vegetables) each shown at three growth
stages - sprout, half-grown, and ripe ready to harvest. Row 5: irrigation
channel straight, corner, and T-junction with flowing water. Row 6: trampled
soil, a compost heap, and bare fallow earth.
```

### 4.2 Orchard, vineyard, paddy — 480×192 (10×4)

```
[STYLE HEADER]
A 10x4 grid of 48x48 tiles for top-down RPG agriculture. Row 1: fruit-bearing
orchard trees in four varieties with visible fruit. Row 2: grape vines on
wooden trellises, straight runs and end posts. Row 3: flooded rice paddy
tiles with young green shoots and reflective standing water, plus raised
earthen dividers between paddies. Row 4: a hop or bean climbing frame, a
pumpkin patch, a berry bush row, and a herb garden bed.
```

### 4.3 Farm structures — 576×288

```
[STYLE HEADER]
A set of top-down 3/4 perspective farm buildings and structures for an RPG
overworld, arranged on a 576x288 sheet with clear gaps between each: a red
timber barn with open doors, a grain silo, a windmill with visible sails, a
water mill with a wheel beside a channel, a glass greenhouse, a livestock pen
with a gate, stacked hay bales, a scarecrow on a post, a stone well, a
handcart, and three beehive boxes. Each object isolated on flat magenta.
```

### 4.4 Fences and field edges — 480×96 (10×2)

```
[STYLE HEADER]
A 10x2 grid of 48x48 fence tiles for a top-down RPG. Row 1: split-rail wooden
fence - horizontal run, vertical run, four corners, a gate open, a gate
closed. Row 2: the same set in dry-stacked fieldstone. Fences must connect
seamlessly tile to tile.
```

### 4.5 District agriculture variants

Regenerate 4.1–4.3 per district identity, swapping only the palette and the crop:

| District | Swap to |
|:--|:--|
| Malezor | beast paddocks, hay, feed troughs, Zyrex pasture |
| Zarvane | date palms, dry stone terraces, oasis channels |
| Andrannor | vineyards, night-blooming orchards, wine casks |
| Veridan | rice paddies, river terraces, water mills |
| Netharion | crystal greenhouses, glasshouse rows |
| Vorashil | steel silos, industrial monocrop, tractors |
| Xilnar | mushroom cellars, lichen drying racks, grey terraces |
| Baelgor | ember-grain, ash-fertilised fields, homesteads |
| Thardin | hydroponic towers, drone plots, nutrient piping |
| Korathen | gold-terraced hillsides, ceremonial groves |

---

## 5 · WILD DRESSING · habitat cover

### 5.1 Forest floor + canopy — 480×192

```
[STYLE HEADER]
A 10x4 grid of 48x48 deep-forest tiles for a top-down RPG: dense undergrowth,
fallen mossy logs, exposed tree roots, fern clusters, a mushroom ring, a
shaded dirt trail, bramble thickets, a hollow stump, wildflower patches, and
dappled light on leaf litter.
```

### 5.2 Barrow / graveyard — 384×192 (8×4)

```
[STYLE HEADER]
An 8x4 grid of 48x48 graveyard tiles for a top-down RPG: weathered leaning
headstones in four shapes, a stone burial cairn, a rusted iron fence run with
a gate, a crypt entrance, dead grass, bare crooked trees, low ground mist,
and a scattering of loose grave soil. Muted desaturated palette, sombre.
```

### 5.3 Ashfield / volcanic — 384×192 (8×4)

```
[STYLE HEADER]
An 8x4 grid of 48x48 volcanic terrain tiles for a top-down RPG: cracked black
ash ground, glowing lava cracks, a small lava pool, cooled basalt columns,
steam vents, charred dead trees, obsidian shards, and drifting ash piles.
```

### 5.4 Scrapfield / ruins — 384×192 (8×4)

```
[STYLE HEADER]
An 8x4 grid of 48x48 ruined-technology terrain tiles for a top-down RPG:
broken concrete slabs, twisted rebar, a collapsed metal wall section, rusted
pipework, a derelict machine hull, scattered scrap metal, cracked asphalt
with weeds, and a leaking barrel.
```

### 5.5 Impact crater — 288×192 (6×4)

```
[STYLE HEADER]
A 6x4 grid of 48x48 meteor-impact terrain tiles for a top-down RPG: scorched
crater rim, glassed fused soil, an embedded meteor fragment glowing faintly
violet, radial blast scarring, upturned earth, and strange crystalline growth.
```

---

## 6 · PATHS & CONNECTIVE TISSUE

### 6.1 Road / path set — 432×144 (9×3)

```
[STYLE HEADER]
A 9x3 grid of 48x48 road tiles for a top-down RPG: a packed dirt road with
straight runs both directions, four corners, a T-junction, a crossroads, and
frayed edges where the road meets grass. Include cart ruts and scattered
gravel. Tiles must connect seamlessly in all directions.
```

### 6.2 Signposts and waymarkers — 288×96

```
[STYLE HEADER]
A set of top-down 3/4 RPG waymarkers isolated on flat magenta with clear gaps:
a wooden signpost with blank arrow boards, a stone distance marker, a district
boundary obelisk, a lantern post, a small roadside shrine, and a milestone
cairn. No text on any sign.
```

---

## 7 · GENERATION ORDER

Highest impact first — each row is usable on its own:

1. **Cliff/plateau set** (1.1) in Malezor palette — unlocks all elevation
2. **Stairs** (1.2) + **ledges** (1.3) — makes elevation traversable
3. **Water surface** (2.1) + **shoreline** (2.2) — unlocks ponds and lakes
4. **Road set** (6.1) — connects everything
5. **Tilled soil + crops** (4.1) + **fences** (4.4) — the homes ring reads as lived-in
6. **Cave mouth** (3.1) — habitat entrances
7. **Mountain silhouette** (1.4) — horizon
8. **Bridges** (2.4) + **waterfall** (2.3)
9. **Farm structures** (4.3), **forest floor** (5.1)
10. Remaining biomes (5.2–5.5), then per-district palette swaps

---

## 8 · CHECKLIST BEFORE ACCEPTING AN ASSET

- [ ] Background is flat `#FF00FF` or `#00FF00`, no gradient, no soft edge
- [ ] Dimensions are exact multiples of 48
- [ ] Repeating edges are genuinely seamless (test: tile it 3×3)
- [ ] Edge/corner set is complete — no missing inner corners
- [ ] Light source is consistently upper-left across the whole sheet
- [ ] No text, no signature, no drawn grid lines
- [ ] Silhouette reads at 100% zoom without squinting

---

## 9 · CANYON / CHASM

### 9.1 Canyon walls + floor — 432×192 (9×4)

```
[STYLE HEADER]
A 9x4 grid of 48x48 canyon tiles for a top-down RPG. Parallel cliff walls
running north-south with a darker sunken floor between them. Include: west
wall face, east wall face, canyon floor in shadow, a shaft of light hitting
the floor, wall top edges for both sides, an inner corner where the canyon
bends, a junction opening, and a dead-end wall. Depth is communicated purely
through darkened floor tones and tall shadowed wall faces.
```

### 9.2 Chasm / trench — 288×96 (6×2)

```
[STYLE HEADER]
A 6x2 grid of 48x48 chasm tiles for a top-down RPG: a jagged crack in the
ground opening into blackness, with crumbling edges. Include north edge,
south edge, both end caps, a narrow point where it could be jumped, and a
wide impassable section. The interior fades to pure black.
```

---

## 10 · COAST · the Void Sea edge

### 10.1 Coastline set — 432×192 (9×4)

```
[STYLE HEADER]
A 9x4 grid of 48x48 coastline tiles for a top-down RPG where land meets a
vast dark sea. Include: sandy beach with wet tideline, rocky shore with
scattered boulders, a tall sea-cliff face, cliff top edge, a cove inlet
curve, a peninsula tip, and shallow turquoise water fading to deep dark
water. Edges tile seamlessly with grass on one side and open water on the other.
```

### 10.2 Coastal features — 480×192

```
[STYLE HEADER]
Top-down 3/4 perspective coastal objects isolated on flat magenta with clear
gaps: a wooden fishing dock with pilings, a small moored boat, a sea cave
mouth in a cliff base, a lighthouse, a ruined coastal watchtower, stacked
crab pots, a beached driftwood log, and a small rocky offshore island with
one wind-bent tree.
```

---

## 11 · ROCK & GEOLOGY

### 11.1 Rock formation set — 480×192 (10×4)

```
[STYLE HEADER]
A 10x4 grid of 48x48 rock tiles for a top-down RPG: single boulders in three
sizes, a boulder cluster, a low rock wall, a standing rock pillar, a natural
stone arch spanning two tiles, a tall stone spire, rubble scatter, scree
slope, cracked dry ground, and a mineral outcrop with visible ore seams.
```

---

## 12 · ZYRAXIS-SPECIFIC · the alien layer

> This is what stops Zyraxis reading as generic fantasy. Weight it heavily.

### 12.1 Astralite + crystal — 480×192 (10×4)

```
[STYLE HEADER]
A 10x4 grid of 48x48 alien mineral tiles for a top-down RPG on an alien
world: a field of upright violet crystal shards, a large astralite deposit
glowing from within, a small impact crater with a fused glassy floor, a
fissure venting pale energy, stones floating a few inches above the ground
casting shadows beneath, a luminous pond glowing from below, ground scarred
by an old astral discharge, and veins of gem material running through rock.
Otherworldly but grounded — this is geology, not magic effects.
```

### 12.2 Zyrex remains + ancient sites — 576×288

```
[STYLE HEADER]
Top-down 3/4 perspective landmark objects for an alien RPG world, isolated on
flat magenta with clear gaps between each: an enormous weathered Zyrex
skeleton half-buried in earth with a long ribcage and horned skull, a smaller
fossilised nest containing broken shell fragments, a field of scattered
fossil bones, an ancient stone shrine with unreadable carvings, a toppled
monument, and a ring of standing stones. Ancient, weathered, long abandoned.
```

### 12.3 Environmental storytelling props — 480×192

```
[STYLE HEADER]
Top-down 3/4 perspective storytelling props for an RPG overworld, isolated on
flat magenta with clear gaps: a collapsed bridge with its span fallen into a
gorge, a burnt-out abandoned camp with a cold fire ring, scorched battlefield
ground with broken weapons, an old boarded-up mine entrance, an abandoned
cottage with a caved roof, a rusted cart tipped on its side, and a cracked
road slab swallowed by weeds. Each should imply an event happened here
without any text.
```

---

## 13 · DISTRICT SKIN VARIANTS

> One mechanic, many looks. Regenerate the **bridge** and **cliff** sets per district by swapping only the material clause.

| District | Bridge material | Cliff material |
|:--|:--|:--|
| Malezor | rough natural timber, rope lashings | grey granite, heavy moss |
| Zarvane | sun-bleached planks, sand-scoured | warm sandstone, wind-carved |
| Andrannor | dark ironwood, lanterns | dusk basalt, violet shadow |
| Veridan | green-stained stone, water-worn | river-cut limestone, ferns |
| Netharion | crystal-inlaid stone | violet crystal-veined rock |
| Vorashil | riveted blue steel | blue-shot slate |
| Xilnar | pale bone-white stone | pale grey slate, stark |
| Baelgor | engineered iron and brick | ember-streaked black basalt |
| Thardin | teal machine-cut alloy, seams | precision-cut teal stone |
| Korathen | white marble with gold inlay | gold-veined marble |

Add to any prompt: `built from [MATERIAL], in the style of [DISTRICT] architecture`.

---

## 14 · WHAT THE HANDOFF CHANGED

The Geographic Landmark System added families this pack originally lacked. Priorities updated:

- **Canyons and coastlines** were entirely missing — added at §9 and §10
- **Zyraxis-specific alien geology** is now weighted heavily (§12). Without it the world reads as generic fantasy with a recolour
- **Environmental storytelling props** (§12.3) are new and cheap — a collapsed bridge or a giant skeleton carries history with zero dialogue
- **District skin variants** (§13) replace redrawing: one bridge mechanic, ten materials
