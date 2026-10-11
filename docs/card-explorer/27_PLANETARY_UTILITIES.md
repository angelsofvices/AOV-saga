# 27 · Planetary utilities

*Survey 10.23 · 2026-10-11 · Source: "Planetary Utilities · the 27 signature utilities and their ability wiring contracts"*

## One system, one controller

Each planet holds one signature utility. Every utility shares one inventory, one controller and one dispatcher:

- **△ cycles** the utilities Carl owns and has equipped.
- **□ uses** the active one: a press, a hold, or a release, depending on the utility.
- Cooldowns belong to each utility, so switching never resets them.
- A held □ is released when a menu, a scene change or a dialog interrupts it.

The registry is `explorer/utilities.js` (`window.AOV_UTILS`). The abilities are in `explorer/explorer.js` (`UTIL_FX`).

## The 27 utilities

| Planet | Utility | Ability | Status |
|---|---|---|---|
| Origon | Origin Compass | Reveals hidden routes and concealed map locations | **Built** (procedural) |
| Lumeria | Lumelys Lantern | Illuminates supernatural darkness, exposes invisible objects | **Built** (procedural) |
| Draevos | Dragonflare Horn | Summons a temporary dragon-fire strike | **Built** (procedural) |
| Arborynth | **Life Seed** | Healing AoE | **Built** |
| Thallassar | Tidewalker Shell | Underwater breathing and deep-water traversal | **Built** (procedural) |
| Pyrauna | Magma Forge | Melts metal barriers and seals | **Built** (procedural) |
| Quorauna | Phase Dial | Phases Carl through designated barriers | **Built** (procedural) |
| Cytherion | **AstraBlaster MK1** | Rechargeable ranged combat | **Built** |
| Zyraxis | Gemlink Prism | Amplifies an Aethren's next ability | **Built** (procedural) |
| Myraclese | Echo Decoy | A false Carl distracts enemies | **Built** (procedural) |
| Bellatora | Warshield | Directional defensive barrier | **Built** (procedural) |
| Yvoris | Frost Anchor | Freezes platforms, machinery or hazards | **Built** (procedural) |
| Kyrathos | Truth Lens | Reveals ancient inscriptions | **Built** (procedural) |
| Nexyros | Return Beacon | Marks a spot and teleports Carl back | **Built** (procedural) |
| Jynaera | Chrono Dial | Slows hazards and enemies | **Built** (procedural) |
| Sylvanir | Rootcaller | Grows vines and bridges across gaps | **Built** (procedural) |
| Velkryn | Titan Gauntlet | Lifts and carries heavy objects | **Built** (procedural) |
| Ignara | **Jetpack** | Flight | **Built** |
| Uralyx | Mirage Veil | Disguises Carl from hostile detection | **Built** (procedural) |
| Halcyra | Balance Gyro | Resists knockback and unstable terrain | **Built** (procedural) |
| Wyvera | Skyhook | Grapples to elevated anchors | **Built** (procedural) |
| Rhyzor | **Boomfists** | Vibrational melee and rock breaking | **Built** |
| Elythera | **Star Satellite** | Olden Transponder orbital AoE | **Built** |
| Xylos | Crystal Harvester | Extracts rare resources from mineral formations | **Built** (procedural) |
| Gravaron | Gravity Inverter | Reverses local gravity | **Built** (procedural) |
| Ferros | Magnetron | Pulls or pushes metallic objects | **Built** (procedural) |
| Viridia | Bio Scanner | Detects living creatures and traces | **Built** (procedural) |

**Built** means the ability runs. Every utility is built as of the procedural pass. Visual art, sprites and effects are deferred to the art pass; the abilities below use simple, readable effects.

## The abilities

- **Origin Compass:** field only. For 25 s, the concealed places within 14 tiles are ringed on the map. Refused underground.
- **Lumelys Lantern:** hold □ to light a radius around Carl. There are no invisible objects in the world yet, so it reveals nothing else.
- **Dragonflare Horn:** a fire strike three tiles ahead (three cells in the cave), after 0.4 s. 60 damage in the field, 50 in the cave, within 1.5. Cooldown 10 s.
- **Tidewalker Shell:** field only. For 30 s, Carl wades deep water and breathes under it (no air drain). Refused in caves.
- **Magma Forge:** field only. Hold □ on a tile tagged meltable_metal (wreckage, `w`) for 1.5 s, and it melts to open ground. Releasing resets the progress.
- **Phase Dial:** field only. For 3 s, Carl passes through marker stones (tagged phaseable). If the phase ends inside one, Carl steps to the nearest open ground.
- **Gemlink Prism:** synchronizes with the nearest party Aethren within 5 tiles. Its next strike deals 1.5 times damage, and the sync lasts 20 s. Refused in caves, which have no party.
- **Echo Decoy:** a false Carl three tiles ahead for 8 s. Foes may choose it as their target, and it takes their hits instead of Carl. Cooldown 15 s.
- **Warshield:** hold □ to keep a shield up in the direction you face. It stops hits from in front, in the field and in the cave.
- **Frost Anchor:** freezes foes in a point two tiles ahead (radius 2.5) for 4 s. Frozen foes do not move or attack. Cooldown 8 s.
- **Truth Lens:** reads the nearest inscription or record within 4 tiles. Refused underground.
- **Return Beacon:** the first press marks the spot. Press again to return to it. Hold □ for 1.2 s to move the mark to where you stand. Refused underground, and the mark is saved.
- **Chrono Dial:** foes within 6 tiles move at 40% speed for 6 s. Cooldown 10 s.
- **Rootcaller:** roots up to three tiles of water ahead as walkable vines for 15 s. Refused in caves.
- **Titan Gauntlet:** lifts the heavy object (tagged heavy_lift) in front. Ordinary carrying already covers boulders and props, so its extra role awaits heavier objects.
- **Mirage Veil:** for 12 s, foes do not target Carl.
- **Balance Gyro:** for 20 s, knockback does not move Carl.
- **Skyhook:** grapples to an anchor (tagged grapple_anchor, the route post `X`) up to six tiles away in line, and reels Carl in over the ground. Refused in caves.
- **Crystal Harvester:** takes two crystal from the seam in front (tagged crystal_resource, `A`). Cooldown 4 s.
- **Gravity Inverter:** foes within 3 tiles are thrown two tiles away from Carl. Cooldown 8 s.
- **Magnetron:** pulls the nearest wreckage (tagged magnetic) within five tiles in line to the tile in front of you. Cooldown 3 s.
- **Bio Scanner:** counts the living nearby and rings the biological traces for 6 s. Cooldown 3 s.
- **AstraBlaster MK1, Jetpack, Life Seed, Boomfists, Star Satellite:** as in docs 25, 26 and above.

## Tags: a utility only affects what carries its tag

Tags are read from the glyph an object is drawn with (`UTILS.TAGS` in `utilities.js`). A mountain (`#`) carries no tag, so Boomfists cannot break it.

| Glyph | Object | Tags |
|---|---|---|
| `B` | boulder | `breakable_rock`, `heavy_lift` |
| `w` | wreckage | `meltable_metal`, `magnetic` |
| `A` | crystal seam | `crystal_resource` |
| `b`, `T` | plant, tree | `biological_trace` |
| `P` | prop (pylon, pillar, spire, vent) | `heavy_lift` |
| `X` | route marker post | `grapple_anchor` |
| `M` | marker stone | `phaseable` |

Life Seed reads "plantable ground" from the tile under Carl (`.` or `,`). No tile carries `hidden_route`, `invisible_object`, `phaseable` or `freezable_mechanism` yet, so the utilities that need them have nothing to act on.

## Save model

`S.utilities` holds `discovered`, `extracted`, `repaired`, `equipped`, `selected`, `instances` and `data`. Each instance has `instanceId`, `utilityId`, `condition` (`functional` or `damaged`), `source` (`world`, `crafted` or `dev_replicator`) and `upgrades`.

- The AstraBlaster and the Jetpack keep their existing records (`S.weapon`, `S.jet`) and their existing repair path at the Workstation.
- The other utilities are owned when repaired, or when a developer copy exists.
- Developer copies (Dev Replicator, "UTILITY COPIES · FUNCTIONAL") do not add to `discovered` or `repaired`, so they never unlock progression.

## Decisions in this build

- **Names:** the spec's "Ultharis / Uralyx" entry uses **Uralyx** (Mirage Veil). "Ferros / Ferralis" uses **Ferros** (Magnetron).
- **Star Satellite does not fire in caves.** The spec left cave restrictions open; this is a placeholder.
- **Boomfists breaks a tile for the session only.** It is not yet saved, so a broken rock returns when the field reloads.

## Still open for the art pass and design

- **Art and effects.** Every ability uses simple shapes and bursts. Sprites, sounds and proper effects come with the art pass.
- **Tags on real content.** The tags are read from the existing glyphs. Hidden routes, invisible objects, inscriptions as first-class objects, and heavier objects need content that carries those tags.
- **Discovery, extraction and NASARUS repair** for the non-legacy utilities. Only developer copies can be owned now.
- **Persistence of world changes.** Broken rock, melted metal, cut vines and harvested seams are session-only; they reset when the field reloads.
- **Numbers.** Every cooldown, duration and damage figure is a placeholder to tune in play.
