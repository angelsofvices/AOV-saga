# RP7D · Deluxe 3D · Handoff #1 — Malezor Town

**For:** Astra / Codex (ChatGPT), working in a separate chat on the same repo
**From:** the RP7B line (Claude), which stays the 2D mainline
**Source of truth:** `rp7b.html` @ `AOV_BUILD { game:7, gamedex:5, codex:16, patch:'0.99.54' }`
**Scope of this handoff:** Malezor town **only** — the opening district. Nothing
east of it, no other district, no 3D combat rework.

---

## 0 · The one rule that matters most

**RP7B is the mainline and it does not move for RP7D.** Build into a new file,
`rp7d.html`. Do not edit `rp7b.html` — not to "share" a constant, not to fix a
typo. Two agents are in this repo; the 2D game is the one the Creator plays and
ships, and it is mid-flight on other work.

Canon precedence, verbatim from the Creator: **story > cards > game.** If the
3D build wants a fact that contradicts a card or the story bible, the card and
the story win and the game is what changes.

`data/staple_roster_v1.json` is **LOCKED**. Any roster change is a v2 delta
file, never an edit.

---

## 1 · What RP7B actually is

A single-file HTML5 canvas RPG. One `.html`, ~70,000 lines, no build step, no
framework, no bundler. It runs by opening the file. That constraint is
deliberate and has survived 900+ revisions.

For RP7D you are **not** bound to it — a 3D build reasonably wants modules and
a renderer. But keep the property that made it work: **one artifact the Creator
can open and play without a toolchain.** If you reach for a bundler, the build
output must still be a thing that opens.

### World geometry (carry these exactly)

| constant | value | note |
|---|---|---|
| `TILE` | 48 px | the 2D tile edge — in 3D, treat as **1 world unit** |
| world | 1020 × 800 tiles | whole of Zyraxis |
| world origin | `WORLD_MIN_COL -100`, `WORLD_MIN_ROW -45` | tile coords go negative |
| viewport | 20 × 11 tiles (960 × 528 px) | Rizer centred; see §6 |
| `PARTY_MAX` | 8 | Zyrex out with you; overflow goes to PC storage |

Malezor's district record: `{ id:'malezor', cx:58, cy:103, rx:145, ry:135 }` —
centre tile (58, 103), half-extents 145 × 135.

**Tile coordinates are the contract between the two builds.** If a 3D prop sits
at a different tile than its 2D counterpart, the two games have diverged and
every later handoff gets harder. Keep the grid; change the presentation.

---

## 2 · Malezor town — the actual contents

Driven out of the live build, not transcribed. 2,550 named props and 142
overworld NPCs sit inside Malezor's bounds; these are the ones that matter for a
first 3D pass.

### 2.1 Landmarks and buildings

| prop id | tile | footprint | art |
|---|---|---|---|
| `rizer_treehouse` | (20, −20) | 8×9 | `rizer-treehouse.png` |
| `rakoron_cave` | (22, 10) | 13×11 | `rakoron-cave-full.png` |
| `malezor_radio_tower` | (38, 14) | 5×11 | `radio-tower-broken.png` / `-fixed.png` |
| `novarius_statue` | (8, 29) | 2×4 | `novarius-statue.png` |
| `malezor_the_fanghall` | (−8, 35) | 11×10 | `the-fanghall.png` |
| `malezor_research_facility` | (22, 38) | 13×9 | `research-facility.png` |
| `malezor_town_hall` | (22, 78) | 11×9 | `town-hall.png` |
| `player_home` | (22, 105) | 5×5 | `player-home.png` |
| `malezor_zysphere_shop` | (−20, 120) | 7×6 | `zysphere-shop.png` |
| `malezor_school` | (25, 126) | 11×9 | `school.png` |
| `malezor_potion_shop` | (10, 138) | 7×7 | `potion-shop.png` |
| `malezor_zyrex_farm` | (35, 138) | 11×9 | `zyrex-farm.png` |
| `malezor_hospital` | (22, 156) | 11×9 | `hospital.png` |
| `malezor_the_first_den` | (−4, 172) | 10×9 | `the-first-den.png` |
| `seer_hq` | (75, 172) | 8×7 | `seer-hq-malezor.png` |
| `malezor_the_bloodscent_lodge` | (192, 105) | 10×10 | `the-bloodscent-lodge.png` |

Plus 5 × `red_roof_home_N` and 5 × `villager_home_N` (both 5×5) scattered
(6,90) → (35,120), and 14 `seer_chest_N` pickups.

**Footprint ≠ sprite size.** Each building declares a `footprint` array of
`[dx,dy]` offsets that are *solid*, and a `door: [0,0]` that stays walkable. The
sprite is drawn much taller than the block — only the **ground storey**
collides, so horns, roofs and banners overhang walkable tiles. Carry that
distinction into 3D or every building becomes an invisible wall two storeys
tall. (The Fanghall is 11×10 with a 43-tile footprint of `dy −3..0 × dx −5..5`,
doorstep excluded. That is the shape of all of them.)

### 2.2 The thirteen people of Malezor

| name | tile | role |
|---|---|---|
| Zoryn | (22, 14) | partner; the tutorial companion |
| Scrapjaw | (16, 58) | tinker; scrap → **Phone Battery**, and the tower-remote loop |
| Corvan | (29, 74) | — |
| Serel | (30, 74) | — |
| Kelthor | (22, 82) | first-quest giver (the cave) |
| Albert Orren | (11, 82) | — |
| Kaelith | (58, 103) | district centre |
| Yuma | (93, 103) | — |
| Professor Elarion | (27, 128) | the elephant professor · world/side quests |
| Zurelea | (11, 140) | — |
| Kaizari | (35, 140) | unlocks the Zyrex Training Farm |
| Nurse Rein | (22, 158) | hospital |
| Auraxion | (15, 180) | — |

All `mode:'stationary'`. Enemies in-district: `roam_malezor` ×105,
`verdant_creeper_malezor` ×10, `tower_mori` ×6, `seer_posted_malezor` ×4,
`seer_patrol_malezor` ×4.

### 2.3 Interiors reachable from Malezor

Interiors are **separate scenes**, not rooms in the world mesh — you leave the
overworld entirely. Each is an ASCII `plan` of `.` (floor) and ` ` (wall) plus a
`spawn`, an `exit` and a floor-tile image.

Sizes come off one ladder, `INTERIOR_SCALE` — **use these rungs, do not invent
sizes**:

```
nook  10×10 · home1 13×9 · home2 15×10 · home3 17×12 · shop 19×14
building 20×20 · cave 30×30 · hall 63×63 · landmark 186×146
```

Reachable from Malezor: player home (+ 2F Rizer Room), Rakoron's cave (3 floors,
`cave` rung), the research lab, the school, the town hall, the hospital, the
potion and zysphere shops, the treehouse, Crazy's house, the training farm, the
Seer HQ (3 floors), the Bloodscent Lodge (`hall`), the radio tower.

**Standing Creator rule, unchanged:** *"do not change any interior lighting. we
will import new assets recolored if needed."* In 3D that means: do not invent a
lighting model for interiors that repaints the existing art. Light them flat and
let the art carry the mood, the same as 2D, until the Creator says otherwise.

---

## 3 · The Malezor opening, in order

This is the sequence a 3D build has to support end to end. It is the whole
tutorial and it is all in this one town.

1. Wake in `player_home` → the Rizer Room on 2F is the base of operations.
2. **Kelthor** sends you to `rakoron_cave`. Entering sets `kelthorCaveEntered`;
   returning to him unlocks the world map.
3. **Rakoron** (Gemlord, floor 3 of the cave) gives the **Rubypaw Fang** — a
   tooth he sheds, not the Longsword forged from it. The caves shut behind you
   afterwards and reopen only with a bonded **Mealux**.
4. **Scrapjaw**: bring him scrap metal → he builds the **Phone Battery**, which
   unlocks overworld contact calls. Optional bonus: clear 6 Mori + the Vilerok
   boss at the tower for extra bond.
5. The **radio tower** at (38,14) is broken. Each district's tower has a silver
   Scrap Chest at its base holding that district's **Tower Transmission
   Remote**; Scrapjaw spends it to bring that district's signal back. Ten towers
   total, one per district, each remote tagged to its own tower.
6. **Kaizari** unlocks the Zyrex Training Farm (needs 10 fae + 1 party Zyrex;
   15-minute cooldown between visits).
7. The **Elder trial** ladder gates the district's **Vault Key** (ancient name:
   Elder Key), which opens gold chests, the gem cave, and the town-hall mythic
   vault.

---

## 4 · Systems a 3D build must not casually redesign

These are load-bearing and each was argued into its current shape.

**Rizer has two forms.** S1 (normal) and S2 (`cosmeticSkin:'power_upgrade'`).
Weapons are form-locked: the Sapphire Tearsword, Emerald Axe, Pearlbow and
Rubypaw Fang are S1's; the Rubypaw Longsword is S2's. Exactly one arm is held at
a time — `keepOneS1Weapon()` collapses the ring on every equip, from every
surface.

**Weapon durability**, and each blade has its own ceiling:
`sapphire_sword 100 · rubypaw_sword 200 · emerald_axe 60 · pearlbow 40 ·
rubypaw_fang 300`. The Pearlbow's "durability" is its **quiver** — an arrow is
spent on a miss, and its empty state is "QUIVER EMPTY", not "BROKEN". Repair is
100 gems.

**The party cap is real and has one door.** `joinParty()` is the only way into
`player.party`; over `PARTY_MAX` it routes to `player.pcZyrex`. Do not add a
second writer — the 2D build had two and ended up with 38 Zyrex in an 8-slot
party, all summonable and 30 of them invisible.

**Contacts are not Zyrex.** Humanoid allies are earned by Rizer-bonding through
quests and live on the CONTACTS page. They can never be Zysphere-bonded or enter
the Zyrex roster. They never share a grid with Zyrex — that is a standing
directive, not a layout preference.

**The ZyPhone** is the whole UI: HOME · NOTEBOOK · ZYCUBE (bag, 12 drawers) ·
RIZER · FACTION · ARMORY · MAP · MISSIONS · CONTACTS · NOVARIAN RECORD ·
SETTINGS. Every panel must be fully operable on a controller — that is an
explicit Creator requirement, not a nice-to-have.

**Easter-egg locations are never revealed in game.** If you build a 3D map or
minimap, it shows what the 2D map shows and nothing more.

---

## 5 · Controls (carry the verbs, remap the bindings)

```
Walk           arrows / WASD          D-pad / left stick
Sprint         hold B                 hold Circle       (tap = 2-tile dodge)
A1 punch       J                      Square
A2 kick        K                      Triangle
A3 Astralstrike  Shift+J              L2 + Square
Phone          touchpad
```

Square is the weapon verb: whatever arm is equipped changes what Square *does*
(sweep, 3×3 sweep, arrow, quick jab). Keep that — it is why one button feels
like five.

---

## 6 · The 2D constraint that 3D removes, and the trap in it

The viewport is 20 × 11 tiles with Rizer centred: ten tiles of room to each
side, five ahead and five behind. Nearly every layout decision in RP7B is
downstream of that rectangle — the party formation, the building scales, the
interior rungs.

**The trap:** in 3D that constraint disappears, and the temptation is to spread
everything out because you can. Don't, in this pass. Malezor's tile positions
are canon and other systems (quest pings, the map, the district triangle that
places the 30 lore buildings) read them. Change the camera, not the coordinates.

A concrete example of what the constraint bought: Zyrex followers form up on a
lattice stepped by how wide and how tall each creature actually *draws*, ranked
by how much of the body the camera will show — because six Anciuxor-sized bodies
need ~30 tiles of width and the viewport has 20. In 3D that specific solution
dissolves. The *rule* it enforces does not: **you should be able to see every
member of your team.**

---

## 7 · Assets

All under `assets/2D sprites/`. For 3D these are reference, not final —
but they are the design authority for silhouette and palette.

- `buildings/` — one PNG per building, ~1254²
- `zyrex/` — creature sheets, **4×4 directional, `cellW/cellH 313`**, rows are
  Down · Left · Right · Up, four frames each
- `decor/gemlords/` — the ten Gemlord portraits (design reference)
- `tiles/gemlord-caves/` — ten per-district cave floors
- `items/bag/` — 83 bag icons
- `ui/` — the weapon HUD wheel and phone chrome

**Chroma convention:** deliveries arrive on solid magenta `#FF00FF`. The rule,
verbatim: *"if I import something in a neon green or magenta background it is
for chromakey to preserve the actual sprite. do not remove any other color than
the magenta."* Two hard-won notes:

- Use a **global** magenta key, not a corner flood-fill — these creatures have
  enclosed pockets between tendrils and limbs that a flood leaves as magenta
  blobs inside the silhouette.
- **Magenta and violet art are separable by `|r − b|`.** Magenta has r ≈ b;
  violet art has b ≫ r. Measured: bleed |r−b| ≈ 6–12, Eurakeon's violet scales
  40+. Every naive "is it pink" test has misdiagnosed this at least once —
  composite onto a dark checkerboard and *look* before you erode anything.

---

## 8 · How the two builds stay in sync

- **Tile coordinates and ids are the interface.** Same prop, same tile, same id.
- **RP7B may change under you.** It is actively developed. Re-read any constant
  you depend on rather than caching it into a doc.
- Put RP7D-only data in RP7D. Do not add fields to RP7B tables "for 3D".
- If you find a genuine bug in RP7B, **write it down and hand it back** rather
  than fixing it in place — the 2D build has a verification suite per system
  (`tools/verify_*.mjs`, driven against a booted game) and a fix that skips it
  will be reverted.

---

## 9 · Suggested first milestone

Not the whole town. This, and stop:

1. `rp7d.html` boots, renders the Malezor ground plane at 1 unit = 1 tile.
2. Rizer walks the grid with the §5 verbs, tile-accurate, camera behind.
3. The sixteen §2.1 buildings placed at their real tiles with ground-storey-only
   collision.
4. `player_home` enterable → interior scene → back out. One interior, proving
   the scene swap works.
5. The thirteen NPCs standing where they stand, with a talk prompt that opens
   *something*.

That is a walkable Malezor. Everything else is a later handoff.

---

## 10 · Open questions for the Creator (do not guess)

1. **Camera** — third-person behind, isometric-fixed, or free orbit?
2. **Art** — do the 2D sheets become billboards in 3D, or is there a model
   pipeline coming? (There is an `fbx for mixamo` folder in the workspace,
   which suggests the latter, but nothing has been confirmed.)
3. **Does RP7D share saves with RP7B?** If yes, the save schema is a contract
   and needs its own handoff; if no, say so early.
4. **Interior lighting** — the standing rule is "do not change it". Does that
   hold in 3D, where flat-lighting a room is a deliberate choice rather than
   the default?
