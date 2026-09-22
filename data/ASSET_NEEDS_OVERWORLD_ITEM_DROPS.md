# OVERWORLD ITEM DROP ART · CODEX HANDOFF · v1 · 2026-09-21

**72 items can be retrieved in the overworld and have no drop sprite.** This
table is the complete set, with the target filename and the generation prompt
for each.

## Root

```
assets/2D sprites/decor/
```

Every file lands flat in that folder. That is where the two existing drop
tables already point — `PICKUP_KINDS` (scrap-metal.png, coins-pile.png,
portal-chip.png) and `WEAPON_DROP_ART` (the four weapon icons + voltshard.png),
both in `rp7b.html`. Do **not** create a new folder; the wiring reads this one.

## Already covered — do NOT regenerate

`coins` · `scrap_metal` · `portal_chip` · `sapphire_sword` · `rubypaw_sword` ·
`emerald_axe` · `pearlbow` · `voltshard` · `astralcore` · `shardshare_broken`

## Shared generation spec — prepend to every prompt

```
Canvas 1254 x 1254 px, square. Background: pure neon green #00FF00, absolutely
flat, no gradient, no shadow touching the canvas edge.

A SINGLE OBJECT, centred, filling roughly 60-75% of the frame, with at least
80 px of clean green on all four sides so it can be trimmed to its own alpha
bounding box.

Viewed from a top-down RPG's three-quarter-high angle — the object as it would
LIE ON THE GROUND and be walked over, not a catalogue product shot and not a
flat overhead plan. Light from the upper left. A soft dark contact shadow
directly beneath, fading out, not touching the frame edge.

Style: crisp 16-bit pixel art, hard black-brown outline, limited palette,
chunky readable silhouette, dithering only where it earns it. The shape must
be identifiable at 48 px. No text, no lettering, no numerals, no watermark,
no logo, no border, no drop shadow box. No hands, no characters.
```

## Table

Columns: **item key** (the `player.items` key — do not rename) · **display
name** · **file** · **tileW** (suggested draw width in tiles, for wiring) ·
**AI asset description** (append to the shared spec above).

| # | item key | display name | file | tileW | AI asset description |
|---|---|---|---|---|---|
| 1 | `field_station` | Field Workstation | `field-station-drop.png` | 1.5 | A folded portable crafting bench lying on the ground — scuffed gunmetal legs collapsed flat against a slab top, a small vice and three sockets on the surface, a coil of cable strapped to one side. Salvage-built from scrap, honest and heavy, not sci-fi sleek. Faint cyan glow from one indicator lamp. |
| 2 | `gem` | Gems | `gem-drop.png` | 0.9 | A small loose cluster of three cut crystals resting on the ground, facets catching light, mixed cool colours. Reads as generic currency-grade gemstone, not a relic. |
| 3 | `gem_red` | Red Gem | `gem-red.png` | 0.85 | A single cut gemstone, deep ruby red, brilliant-cut with a flat table and sharp facets, tiny internal spark of light. Sits on the ground with a soft contact shadow. |
| 4 | `gem_blue` | Blue Gem | `gem-blue.png` | 0.85 | A single cut gemstone, sapphire blue, same brilliant cut as the red, cool internal glow. |
| 5 | `gem_green` | Green Gem | `gem-green.png` | 0.85 | A single cut gemstone, emerald green, same cut, faint verdant shimmer. |
| 6 | `gem_yellow` | Yellow Gem | `gem-yellow.png` | 0.85 | A single cut gemstone, warm citrine yellow, same cut, sunlit sparkle. |
| 7 | `gem_purple` | Purple Gem | `gem-purple.png` | 0.85 | A single cut gemstone, amethyst purple, same cut, dusky violet core. |
| 8 | `gem_orange` | Orange Gem | `gem-orange.png` | 0.85 | A single cut gemstone, amber orange, same cut, ember-lit centre. |
| 9 | `gem_white` | White Gem | `gem-white.png` | 0.85 | A single cut gemstone, clear diamond white, same cut, prismatic edge flare. |
| 10 | `gem_black` | Black Gem | `gem-black.png` | 0.85 | A single cut gemstone, jet black, same cut, matte body with one hard specular highlight and a faint violet rim. |
| 11 | `moon_gem` | Moon Gems | `moon-gem.png` | 1.0 | Two pale moonstone spheres, milky translucent white-blue, gently glowing from within, one slightly cracked. Rounder and softer than the faceted gems so it reads as a different currency at a glance. |
| 12 | `berry` | Berries | `berry-drop.png` | 0.8 | A small pile of four plump wild berries, deep blue-purple, dewy highlights, two green leaves tucked under. Foraged, not packaged. |
| 13 | `fruit` | Fruits | `fruit-drop.png` | 0.9 | Two round tree fruits, warm red-orange skin with a yellow blush, one leaf and short stem on the upper fruit. |
| 14 | `seed` | Seeds | `seed-drop.png` | 0.75 | A small scatter of five teardrop seeds, tan and brown striped husks, one split showing a pale green sprout tip. |
| 15 | `fae` | Fae | `fae-drop.png` | 0.8 | A single drifting fae mote — a pinpoint core of warm gold light inside a soft translucent bloom, four tiny trailing sparks beneath it. Weightless, hovering just above the ground, no wings. |
| 16 | `fairy` | Fairy | `fairy-drop.png` | 0.9 | A tiny winged fairy at rest, seen small and stylised — luminous blue-white body, two pairs of translucent insect wings held upright, sitting cross-legged on a glowing pad of light. No facial detail beyond two soft light-dots. |
| 17 | `wild_treat` | Wild Treat | `wild-treat.png` | 0.85 | A rough hand-shaped foraged snack — a bar of pressed berries, seeds and nuts bound in a folded green leaf tied with a grass stem. Rustic and homemade. |
| 18 | `sweet_cache` | Sweet Cache | `sweet-cache.png` | 1.0 | A small opened pouch of amber honeycomb and candied fruit spilling onto the ground, sticky highlights, one bee-free comb chunk. Richer and more deliberate than the wild treat. |
| 19 | `potion` | Potions | `potion-drop.png` | 0.85 | A stoppered round-bellied glass vial of bright crimson liquid, cork sealed with twine, a paper tag on the neck. Classic RPG healing potion, readable at a glance. |
| 20 | `ale` | Ale | `ale-drop.png` | 0.9 | A stout wooden tankard of frothy amber ale, iron bands, foam spilling slightly over the rim. |
| 21 | `fresh_water` | Fresh Water | `fresh-water.png` | 0.85 | A clear glass flask of still, colourless water with a simple cork, a single condensation highlight down one side. Plain and clean — deliberately the least magical item on the list. |
| 22 | `berry_juice` | Berry Juice | `berry-juice.png` | 0.85 | A tall slim bottle of deep magenta berry juice, cork stopper, one whole berry floating near the top, pulpy sediment at the base. |
| 23 | `fruit_bar` | Fruit Bar | `fruit-bar.png` | 0.8 | A pressed fruit bar half-unwrapped from waxed paper, dense with visible dried fruit pieces, one bite missing from the corner. |
| 24 | `soulphish` | Soulphish | `soulphish.png` | 1.1 | A small spectral fish hovering in the air rather than lying flat — translucent pale-cyan body, luminous spine visible through it, long trailing ghost-fins that fade to nothing at the tips. Ethereal, not a food item. |
| 25 | `life_seed` | Life Seed (spoiling) | `life-seed.png` | 0.85 | A fist-sized seed pod with a dull, dimming green glow, its husk beginning to brown and split at one end, one wilting sprout. Must read as SPOILING — past its best. |
| 26 | `life_seed_pure` | Pure Life Seed | `life-seed-pure.png` | 0.9 | The same seed pod at its peak — vivid emerald husk, clean unbroken shell, a bright verdant core glowing through fine surface veins, two fresh leaves. Unmistakably the healthy twin of the spoiling one. |
| 27 | `verdant_elixir` | Mythic Elixir | `verdant-elixir.png` | 0.95 | An ornate faceted-glass decanter of luminous verdant-green elixir, gold filigree collar and stopper, the liquid lit from inside with slow curling light. Reads as the rarest consumable in the game. |
| 28 | `zycube` | Zycube | `zycube-drop.png` | 1.0 | A palm-sized floating cube of pale cyan crystal, edges rimmed in soft light, its six faces showing faint lattice etching. Hovers a little above the ground with a light contact glow. Storage prism, not a gem. |
| 29 | `zphone` | ZyPhone (ZYCELLITE) | `zphone-drop.png` | 0.9 | A slim handheld device face-up on the ground, dark charcoal chassis with a cyan-lit screen edge and a single hard-light bezel seam. Cyberpunk, minimal, no visible branding or lettering. |
| 30 | `backpack` | Backpack | `backpack-drop.png` | 1.2 | A worn traveller's backpack sitting upright, canvas and leather straps, buckles, a bedroll lashed across the top, one side pocket open. |
| 31 | `gearbag` | Gearbag | `gearbag-drop.png` | 1.2 | A squat reinforced duffel lying on its side, heavy zip half-open showing tool handles, two carry straps, riveted corner guards. Utilitarian sibling of the backpack. |
| 32 | `faenet` | Fae Net | `faenet-drop.png` | 1.2 | A short-handled catching net lying at an angle, wooden shaft, brass collar, fine gauze mesh with a faint residual glimmer caught in the weave. |
| 33 | `skateboard` | Skateboard | `skateboard-drop.png` | 1.4 | A skateboard resting deck-up at a slight angle, worn grip tape, scuffed nose and tail, coloured underside graphic hinted at the edge. No lettering or logos. |
| 34 | `worldmap` | World Map | `worldmap-drop.png` | 1.1 | A rolled parchment map partly unfurled on the ground, aged paper, faint coastline and route lines visible on the exposed portion, tied with a leather cord. No readable text. |
| 35 | `raidcard` | R.A.I.D. Card | `raidcard.png` | 0.8 | A rigid ID card lying face-up, dark polymer with a metallic edge strip, an embossed geometric sigil and a thin cyan data stripe. No legible lettering. |
| 36 | `dads_notebook` | Dad's Notebook (paper) | `dads-notebook.png` | 0.9 | A battered field notebook closed with an elastic band, softened corners, a pencil slipped into the spine, loose pages edging out. Personal and well-used. |
| 37 | `elzebub_egg` | Elzebub Egg | `elzebub-egg.png` | 1.0 | A dark speckled egg upright in a shallow nest of black twigs, shell deep charcoal with dull violet mottling and a faint inner pulse of red light through hairline cracks. Ominous. |
| 38 | `broken_raygun` | Broken Raygun | `broken-raygun.png` | 1.2 | A retro-futurist ray pistol lying broken — cracked emitter bell, bent barrel, exposed sparking wire at the grip, one dead indicator bulb. Clearly non-functional. |
| 39 | `ruby_vial` | Ruby Vial | `ruby-vial.png` | 0.8 | A slender faceted vial of dark arterial red fluid, sealed with a blackened metal cap and a wax band. Sinister rather than medicinal. |
| 40 | `shardshare` | Shardshare Collar | `shardshare.png` | 1.0 | An intact creature collar laid in a loose circle — supple dark band with a central socketed crystal glowing steady cyan, small metal shard-mounts spaced around it. Whole and powered. |
| 41 | `portalkey` | PORTALKEY | `portalkey.png` | 1.0 | A heavy angular key of dark alloy with a ring of floating, slowly-rotating glyph segments where the bit would be, held in place by light rather than metal. Powered and complete. |
| 42 | `portalkey_broken` | Broken Transmitter | `portalkey-broken.png` | 1.0 | The same key form, dead — glyph segments collapsed and scattered loose around the shaft, alloy dull and pitted, one snapped prong, no glow. |
| 43 | `astralcore_transponder` | Astralcore Transponder | `astralcore-transponder.png` | 1.1 | A squat signal device on three stubby legs, dark casing with a ribbed heat sink, a short stub antenna and a slow-pulsing amber ring lamp on the face. |
| 44 | `life_stone` | Life Stone | `life-stone.png` | 0.9 | A rounded river-worn stone with a vivid green vein running through it that glows softly from within, moss clinging to one side. |
| 45 | `tower_battery` | Tower Battery | `tower-battery.png` | 1.0 | A heavy industrial cell — ribbed metal casing, two exposed terminal posts, a charge-level window down one side lit in cyan, scorch marks near the base. |
| 46 | `prismshard` | Prismshard | `prismshard.png` | 1.3 | A composite relic — several small differently-coloured astralite fragments fused into one floating prismatic cluster, held in equilibrium with visible light-bridges arcing between them. Rich, layered, clearly made of MANY parts. |
| 47 | `evolution_catalyst` | Evolution Catalyst | `evolution-catalyst.png` | 1.1 | A teardrop of dense swirling energy suspended in a thin metal cradle, its interior shifting between two states — one half chrysalis-pale, the other blazing gold. Transformation made visible. |
| 48 | `rare_item` | Rare Item | `rare-item.png` | 1.0 | A sealed unmarked treasure casket small enough to carry, dark lacquered wood with gold corner fittings and a heavy clasp, faint golden light escaping the seam. Contents deliberately unreadable. |
| 49 | `zysphere` | Zysphere | `zysphere-drop.png` | 0.95 | A bonding sphere the size of a fist — polished two-tone shell split by a bright equatorial seam, upper half deep indigo, lower half pale bone-white, a single cyan lens at the centre of the seam. Sits on the ground with a soft reflected highlight. NOT a Poke Ball: the seam glows and the halves are offset, asymmetric. |
| 50 | `rubypaw_fang` | Rubypaw Fang | `rubypaw-fang-icon.png` | 1.2 | A single curved shed tooth the length of a forearm, used as a dagger — deep ruby translucent enamel darkening to near-black at the root, wrapped at the base with worn leather cord for a grip. Rakoron's own fang; the Rubypaw Longsword is forged from it later, so it must read as the same material. |
| 51 | `shard_ember` | Ember Shard | `shard-ember.png` | 1.0 | **ULTRASHARD — shared silhouette, see note below.** Colour and motif: hot orange-red, guttering flame core. |
| 52 | `shard_cryo` | Cryo Shard | `shard-cryo.png` | 1.0 | **ULTRASHARD — shared silhouette, see note below.** Colour and motif: pale ice-blue, frost crystals creeping on the facets. |
| 53 | `shard_volt` | Volt Shard | `shard-volt.png` | 1.0 | **ULTRASHARD — shared silhouette, see note below.** Colour and motif: electric yellow-white, hairline arcs crawling the surface. |
| 54 | `shard_terra` | Terra Shard | `shard-terra.png` | 1.0 | **ULTRASHARD — shared silhouette, see note below.** Colour and motif: earthen amber-brown, packed mineral grain. |
| 55 | `shard_tide` | Tide Shard | `shard-tide.png` | 1.0 | **ULTRASHARD — shared silhouette, see note below.** Colour and motif: deep sea-green, slow liquid motion inside. |
| 56 | `shard_squall` | Squall Shard | `shard-squall.png` | 1.0 | **ULTRASHARD — shared silhouette, see note below.** Colour and motif: storm grey-cyan, whipping wind streaks. |
| 57 | `shard_verdant` | Verdant Shard | `shard-verdant.png` | 1.0 | **ULTRASHARD — shared silhouette, see note below.** Colour and motif: living green, fine vines growing across the shard. |
| 58 | `shard_stellar` | Stellar Shard | `shard-stellar.png` | 1.0 | **ULTRASHARD — shared silhouette, see note below.** Colour and motif: midnight blue with a starfield suspended inside. |
| 59 | `shard_corona` | Corona Shard | `shard-corona.png` | 1.0 | **ULTRASHARD — shared silhouette, see note below.** Colour and motif: blinding solar gold with a flare halo. |
| 60 | `shard_halo` | Halo Shard | `shard-halo.png` | 1.0 | **ULTRASHARD — shared silhouette, see note below.** Colour and motif: pure white with a floating ring above it. |
| 61 | `shard_null` | Null Shard | `shard-null.png` | 1.0 | **ULTRASHARD — shared silhouette, see note below.** Colour and motif: matte void black that swallows light, edges barely visible. |
| 62 | `shard_prism` | Prism Shard | `shard-prism.png` | 1.0 | **ULTRASHARD — shared silhouette, see note below.** Colour and motif: clear, splitting light into a full spectrum. |
| 63 | `shard_chronal` | Chronal Shard | `shard-chronal.png` | 1.0 | **ULTRASHARD — shared silhouette, see note below.** Colour and motif: bronze-sepia, faint clock-glyph after-images trailing it. |
| 64 | `shard_wraith` | Wraith Shard | `shard-wraith.png` | 1.0 | **ULTRASHARD — shared silhouette, see note below.** Colour and motif: translucent spectral violet, smoke bleeding off the edges. |
| 65 | `shard_hive` | Hive Shard | `shard-hive.png` | 1.0 | **ULTRASHARD — shared silhouette, see note below.** Colour and motif: amber hexagonal cells packed inside a waxy shell. |
| 66 | `shard_predator` | Predator Shard | `shard-predator.png` | 1.0 | **ULTRASHARD — shared silhouette, see note below.** Colour and motif: blood-crimson with a slit-pupil glint at the core. |
| 67 | `shard_martial` | Martial Shard | `shard-martial.png` | 1.0 | **ULTRASHARD — shared silhouette, see note below.** Colour and motif: burnished steel-grey, edge honed like a blade. |
| 68 | `shard_reactor` | Reactor Shard | `shard-reactor.png` | 1.0 | **ULTRASHARD — shared silhouette, see note below.** Colour and motif: radioactive lime-green, warning glow, faint heat shimmer. |
| 69 | `shard_xeno` | Xeno Shard | `shard-xeno.png` | 1.0 | **ULTRASHARD — shared silhouette, see note below.** Colour and motif: iridescent oil-slick purple-green, unsettlingly organic. |
| 70 | `shard_wyrm` | Wyrm Shard | `shard-wyrm.png` | 1.0 | **ULTRASHARD — shared silhouette, see note below.** Colour and motif: dragon-scale emerald and gold, ridged like a scale. |
| 71 | `shard_auracide` | Auracide Shard | `shard-auracide.png` | 1.0 | **ULTRASHARD — shared silhouette, see note below.** Colour and motif: sickly bruise-purple, visibly draining light from around it. |
| 72 | `shard_blackspiral` | Blackspiral Shard | `shard-blackspiral.png` | 1.0 | **ULTRASHARD — shared silhouette, see note below.** Colour and motif: obsidian with a white spiral turning slowly in its depths. |

**72 files total.**

## The 22 Ultrashards — one silhouette, 22 finishes

Generate the base shard ONCE and recolour, or the drawer will look like 22
unrelated objects. Base prompt:

```
A single floating shard of crystal, roughly a tall irregular quadrilateral
with one clean fractured face and one rough broken edge, tapering to a point
at the bottom. It hovers just above the ground, tilted about 15 degrees off
vertical, with a faint ring of light at the point where it would touch. Two
or three small chips orbit it slowly.
```

Then apply the per-row colour and motif from the table. **Silhouette,
proportion, tilt and orbiting chips stay identical across all 22** — only
palette, internal effect and surface treatment change. That is what makes them
read as one set at 48 px.

## Wiring notes for Codex

1. **Nothing here is wired yet.** Dropping the PNGs in is step one; step two is
   a table entry so the world can draw them. Follow `WEAPON_DROP_ART`'s shape —
   `{ src, bbox, tileW }`, `img` assigned in the loop underneath it.
2. **`bbox` is `[x, y, WIDTH, HEIGHT]`, not two corners.** The draw site
   destructures `const [bx, by, bw, bh] = p.bbox` and takes aspect as
   `bbox[3] / bbox[2]`. Measure each file's own alpha bounds — do not reuse a
   neighbour's crop, and do not assume the art is centred in the canvas.
3. **Measure after keying, not before.** The green has to come out first or the
   bbox will be the whole 1254 square.
4. `tileW` in the table is a starting suggestion, not canon. The existing set
   runs 0.8 (portal chip) to 1.6 (sapphire sword); a relic should read bigger
   than a gem.
5. The same art will be reused by the ZyCube grid, which currently shows native
   emoji glyphs as placeholders (`ZYCUBE_ICON` in `rp7b.html`). One key, one
   image — that table is the seam to swap when these land.

## What is deliberately NOT here

- **63 Astralites** — already covered by seven tier sheets under
  `assets/2D sprites/items/astralites/`, and the bag reuses each one's own
  `symbol` code.
- **~35 Compounds** — crafted at Dad's table, never found in the world.
- The ten items listed under *Already covered* above.
