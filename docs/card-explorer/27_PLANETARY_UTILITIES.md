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
| Origon | Origin Compass | Reveals hidden routes and concealed map locations | Defined |
| Lumeria | Lumelys Lantern | Illuminates supernatural darkness, exposes invisible objects | Defined |
| Draevos | Dragonflare Horn | Summons a temporary dragon-fire strike | Defined |
| Arborynth | **Life Seed** | Healing AoE | **Built** |
| Thallassar | Tidewalker Shell | Underwater breathing and deep-water traversal | Defined |
| Pyrauna | Magma Forge | Melts metal barriers and seals | Defined |
| Quorauna | Phase Dial | Phases Carl through designated barriers | Defined |
| Cytherion | **AstraBlaster MK1** | Rechargeable ranged combat | **Built** |
| Zyraxis | Gemlink Prism | Amplifies an Aethren's next ability | Defined |
| Myraclese | Echo Decoy | A false Carl distracts enemies | Defined |
| Bellatora | Warshield | Directional defensive barrier | Defined |
| Yvoris | Frost Anchor | Freezes platforms, machinery or hazards | Defined |
| Kyrathos | Truth Lens | Reveals ancient inscriptions | Defined |
| Nexyros | Return Beacon | Marks a spot and teleports Carl back | Defined |
| Jynaera | Chrono Dial | Slows hazards and enemies | Defined |
| Sylvanir | Rootcaller | Grows vines and bridges across gaps | Defined |
| Velkryn | Titan Gauntlet | Lifts and carries heavy objects | Defined |
| Ignara | **Jetpack** | Flight | **Built** |
| Uralyx | Mirage Veil | Disguises Carl from hostile detection | Defined |
| Halcyra | Balance Gyro | Resists knockback and unstable terrain | Defined |
| Wyvera | Skyhook | Grapples to elevated anchors | Defined |
| Rhyzor | **Boomfists** | Vibrational melee and rock breaking | **Built** |
| Elythera | **Star Satellite** | Olden Transponder orbital AoE | **Built** |
| Xylos | Crystal Harvester | Extracts rare resources from mineral formations | Defined |
| Gravaron | Gravity Inverter | Reverses local gravity | Defined |
| Ferros | Magnetron | Pulls or pushes metallic objects | Defined |
| Viridia | Bio Scanner | Detects living creatures and traces | Defined |

**Built** means the ability runs. **Defined** means the utility is registered, shows in the UTILITY tab and can be equipped, but its ability is not yet written. Pressing □ with one equipped says it is not built yet and does nothing.

## The five built abilities

- **Life Seed:** plant under Carl on open ground. Heals Carl 25 suit, and in the field heals each party Aethren within 3 tiles by 30%. Cooldown 12 s.
- **AstraBlaster MK1:** as in doc 25.
- **Jetpack:** as in doc 26.
- **Boomfists:** a strike in front. Hits foes within reach (60 in the field, 40 in the cave) and breaks a tile tagged `breakable_rock`. Cooldown 0.6 s. Refuses when nothing is in reach.
- **Star Satellite:** a strike on the spot four tiles ahead of Carl, after 1.2 s, for 60 damage to foes within 2 tiles. Cooldown 15 s. Refused in a cave: "No sky above a cave."

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

## Not built yet

- **22 utilities** (listed "Defined" above). Each needs its own ability, and most need world tags that no tile carries yet.
- **Planetary discovery, extraction and NASARUS repair** for the 25 non-legacy utilities. Only developer copies can be owned now.
- **Persistence** of world changes such as broken rocks, and of Return Beacon's destination.
- **Cave versions** of Life Seed (party healing), and Star Satellite's cave rule.
- **Ability art and effects** beyond the simple bursts and hit sparks.
