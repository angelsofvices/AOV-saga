# Handoff · AA:1936 explorer · 2026-10-12

For the next assistant picking up this repo. **Priority 1: finish shipping the cave work. Priority 2: gems.**

## Repo and workflow

- Repo: `angelsofvices/AOV-saga`. Working branch: `claude/kind-wozniak-i6zx3j`. Last merge to `main` was the Modular HUD (`2965d54b`).
- The branch holds **unmerged** work: the cave teacher commit (`5812c2b3`) plus the cave-rooms commit made with this handoff. No PR is open yet.
- Standing workflow: one feature per request → commit → PR → merge → re-sync the branch to `main`.
- Standing rules from the Creator:
  - Changes are additive: don't delete content.
  - AEP-28 and Ovauron stay sealed.
  - No invented settlement names.
  - Don't state why NASARUS was abandoned.
  - No AI model identifiers in commits or PRs.
- The game is vanilla JS in `explorer/`. Main file: `explorer.js` (one IIFE). World generation: `worldgen.js`. New this round: `cave_art.js`.
- Tests are Playwright scripts in `tools/explorer_tests/` (copied in with this handoff).
  1. Start `python3 tools/explorer_tests/srv.py`, which serves the repo on `:8765`.
  2. Run `node tools/explorer_tests/<test>.js`. The scripts load `/explorer/?debug`, which exposes hooks on `window.__x`.
  - Chromium path: `/opt/pw-browsers/chromium` (edit it for your machine).
  - Node check without a browser: `node tools/explorer_tests/gen_check.js explorer 1` prints every cave's rooms and confirms they are all crossable.

## Recent updates (newest first)

1. **Caves rebuilt as rooms.** Doc: `docs/card-explorer/32_CAVE_ROOMS_AND_TILESETS.md`. Patch note: Survey 10.33 in `site-unlocks.js`.
   - **Structure:** overworld mouth → 3–5 rooms → the planet's PEAK or VALLEY (the existing Immortal Zone map `iz<no>`). The only way home is back through the cave. The mouth's "go to zone" shortcut was removed.
   - **Generation:** `worldgen.js` (`caveKind`, `caveRoomCount`, `caveRoom`, `caveCrossable`, `buildCave`). Peaks climb and valleys descend. Rooms are ledge chains with gaps, hops (floating `P`), spike pits, crystal veins (`C`), enemies on long ledges, and loot (`$`) over gaps.
   - **Crossability check:** `caveCrossable` simulates Carl's real physics (run 6.2, jump 12.5, gravity 32) and only keeps a room it can cross both ways. Result: 106 rooms across 27 caves, all crossable.
   - **Kept for reference:** the old single-strip cave, as `buildCaveStrip`.
   - **Game side** (`explorer.js`):
     - `enterCave(no, lm, { fromZone })`, `caveRoomEnter`, `caveRoomGo`, `caveArt`.
     - Room edges are handled in `updateSide`.
     - Enemies stand on any ledge.
     - The zone's "way back" landmark puts Carl into the last room.
     - Debug hooks: `caveState`, `caveRoom(k, side)`, `caveEnd(no)`, `zoneAt(no)`.
2. **Celeste-style cave art** (`cave_art.js`), following "Celeste Tilesets, Step-by-Step" (Aran P. Ink):
   - 8×8 auto-tiles, 2×2 per physics tile.
   - Rock, earth, ledge and crystal tilesets sharing one infill.
   - A 1px outline and neighbour-mask auto-tiling, with 4 random variants per straight edge.
   - A random infill ring.
   - Props: moss, pebbles, crystal shards, stalactites, drips and spikes.
   - A background tile layer with holes, plus timber supports, roots and carved glyphs on it.
   - A parallax backdrop, two particle layers, and a left-to-right gradient.
   - Palettes come from each planet's own palette in `environments.js`.
3. **World teacher moved to the peak or valley.**
   - **Who teaches:** one NPC (`teacher: true`, key `w<no>`) in `buildImmortal`, on every world with a people race (not Zyraxis). Talking to them, after two of the world's creatures are scanned, registers the planet (`S.lore['w'+no]`).
   - **Camps:** camp folk no longer teach; they point to the cave.
   - **Rare Zyrex:** the zone now favours rare Zyrex (`zyrex-*` variants, tier 3+), with up to 5 spawns.
   - **Minimap cue** (gold ring, or an edge pip when off-screen): the mouth on the overworld, then the way on in the cave, then the teacher. It clears once the world is learned. Code: `teachTarget`, `markTarget`, `drawMinimap`.
4. Already merged earlier: V3 movement feel, Carl animation library (`animation.js`), the NPC standard rig (`people_art.js`), and the Modular HUD with Health (docs 28–31).

## Finish the cave patch (do this first)

- [ ] Test status at handoff:
  - Passing: `t_caverooms` 13/13, `t_teacher` 7/7, `t_cave` 16/16, `t_jetpack` 17/17, `t_anim` 7/7, `t_feel` 5/5, `t_holes` 8/8, `t_blaster` 14/14, `t_stage3` 6/6, `t_utilities` 14/14.
  - `t_v3` is 7/8. Its failing step is "the hop settles back to the ground" (a top-down jetpack hop read 0.017 instead of 0). It passed on the previous run and isn't cave code, so it is probably a timing flake. Rerun it once; if it fails again, look at the hop's landing in `updateFlight`.
- [ ] Run the rest of the suite for regressions (`t_party`, `t_place`, `t_region`, `t_world`, `t_canon`, `t_exp`, `t_exp2`). These set lore directly, so the camp-teaching change shouldn't affect them.
- [ ] Open the PR from `claude/kind-wozniak-i6zx3j`, merge it, and re-sync the branch.
- [ ] Have the Creator play a cave by eye at real size.
- [ ] Open questions for the Creator (also listed in doc 32):
  1. Eight cave planets have no people race (1, 4, 5, 6, 7, 13, 14, 19), so they have no teacher; they still unlock through records. What should register them?
  2. Zyraxis (world 9) keeps its fur-trader first contact; it has no teacher at its peak or valley.
  3. Should the shortcut from the mouth to an already-charted zone come back?

## Gems (next)

**Creator request:** replace the cave coin loot (`$`) with **gems**. Each gem is a count of 1. Randomize each gem's shading in game to match its colour, and spawn them by canon rarity. Gems become the game's **currency**.

**Canon to use:**

- **The 10 gems** (the website list, `macrobook-gems.js`; order and colours exact):

| # | id | Name | Colour |
|---|---|---|---|
| 1 | `ruby` | Ruby | `#C4133C` |
| 2 | `pearl` | Pearl | `#EFE6DA` |
| 3 | `citrine` | Citrine | `#E0A62A` |
| 4 | `emerald` | Emerald | `#1E8E52` |
| 5 | `amethyst` | Amethyst | `#7A4FCF` |
| 6 | `sapphire` | Sapphire | `#1F5FD0` |
| 7 | `onyx` | Onyx | `#2B2B33` |
| 8 | `amber` | Amber | `#D9812A` |
| 9 | `ninth` | Ninth Formation | composite: red, blue, green, gold |
| 10 | `tenth` | Tenth Formation | composite: ivory, amber, purple, black |

  The Creator calls 9 and 10 the World Gem and the Space Gem.
- **Spoiler lock:** `explorer/codex_reference.js` (public copy rules) says game public dialog **must not say** "the WORLD and SPACE GEMS". Use the website's public names, "Ninth Formation" and "Tenth Formation", in game text unless the Creator rules otherwise.
- **Rarity and value:** `data/GEM_COLOR_PSYCHOLOGY_CANON.md` gives the existing economy for the 8 colours.
  - Code order: `GEM_COLORS = ['red','blue','green','yellow','white','orange','purple','black']`.
  - Rarity weights: `128/64/32/16/8/4/2/1`.
  - Value ladder: `20…160` in steps of 20.
  - Mapped to the gems:

| Gem | Colour | Weight | Drop share | Value |
|---|---|---|---|---|
| Ruby | red | 128 | about 50% | 20 |
| Sapphire | blue | 64 | 25% | 40 |
| Emerald | green | 32 | 12.5% | 60 |
| Citrine | yellow | 16 | 6.3% | 80 |
| Pearl | white | 8 | 3.1% | 100 |
| Amber | orange | 4 | 1.6% | 120 |
| Amethyst | purple | 2 | 0.8% | 140 |
| Onyx | black | 1 | 0.4% | 160 |

  - The same doc (§138) also says white and black are canonically the rarest, which conflicts with Pearl's position on the ladder. Ask the Creator before re-ordering; §9b notes a re-order is free in the economy but needs a save migration.
  - The composites (9, 10) have no weight in canon. Recommendation: don't drop them as loot; reserve them for story or Gemlord events until the Creator rules.
- **Other canon uses of gems:** RP7D uses "gems" as currency (Gemlord weapon repair costs 100 gems; battles give gems). `data/PRISMSHARD_GEMSHARD_CANON.md` covers Gemshards, which are separate from currency gems. Don't merge the two.

**Where to change:**

- **Loot tile `$`:**
  - generated in `worldgen.js` `caveRoom`;
  - drawn live in `explorer.js` `drawSide` (the `c === '$'` branch: currently a gold cross);
  - picked up in `updateSide` (the "loot under you" loop, which currently grants random scrap, fibre, crystal, data or terra via `gain(...)`).
- **Gem identity:**
  - Roll the gem when the room is generated (seeded, so a room's gems are stable), e.g. store `room.gems = { 'x,y': 'ruby' }`.
  - Or roll at pickup with the weights above.
  - Draw a small faceted gem sprite in the gem's colour.
  - Randomize the shading per gem: the light facet, dark facet and sparkle come from the gem colour, with slight per-gem hue and lightness jitter.
- **Currency:** add `S.gems = { ruby:n, … }` (with a save default) and show the total in the HUD (a new module or the Aethren module) and in the AstraNav INVENTORY.
  - Pickup toast: "RUBY +1".
  - Value = gem count × value ladder, if a single "gem total" is wanted.
  - Decide with the Creator what gems buy (shops, repairs, NASARUS upgrades).
- **Cave art:** `cave_art.js` doesn't draw loot. Add a gem drawer there or in `explorer.js`, and keep loot live-drawn so pickups disappear.
- Then: a patch note (Survey 10.34), doc `33_GEMS_CURRENCY.md`, a test (a gem is picked up, the count goes +1, and the weights are respected over many rolls), and commit → PR → merge.
