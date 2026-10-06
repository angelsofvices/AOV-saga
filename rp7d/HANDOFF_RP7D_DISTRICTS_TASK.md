# RP7D · Task: install the 10 districts and switch on the Daemons

**For:** the RP7D build chat, the one with the `rp7d/` folder open.
**Do not touch `rp7b.html`.** RP7B is the placement skeleton and is only read for reference.

---

## What's already done

A finished `world-data.js` comes with this note, together with `verify_world_data.mjs`. It was built from the current
`rp7d/world-data.js`. Attach both files to this chat. If they're missing, ask the Creator for them before you start.

The new `world-data.js` has these changes:

- **Malezor is unchanged.** Its data and its `quarterAt` / `districtAt` / `sectionAt` results match the old file exactly.
- **New districts II–X** are exported as `ZARVANE, ANDRANNOR, VERIDAN, NETHARION, VORASHIL, XILNAR, BAELGOR, THARDIN, KORATHEN`.
  - `DISTRICTS` lists all 10 in order and `DISTRICT_BY_ID` looks them up by id.
  - `ROUTES` holds the 9 route names and widths.
  - Each district has the same fields as `MALEZOR`.
- **Positions** come from RP7B's own tables, in the same RP7B tile space RP7D already uses: `ZYRAXIS_DISTRICTS`,
  `DISTRICT_WHEEL`, `SEER_HQ_NETWORK`, `TOWER_NETWORK` and `ZYRAXIS_ROUTES`, with route names from RP8's `ROUTE_META`.
  The Z runs Malezor ↓ Zarvane → Andrannor → Veridan ↓ Netharion ↙ Vorashil ↘ Xilnar → Baelgor → Thardin → Korathen.
  - The old placeholder grid (centres 350/500 units apart) is dropped. Its districts overlapped, and it put Zarvane
    east of Malezor; canon has it south.
- **Each district carries** `land` (its canon Land), `gemlord: { id, name, epithet, gem }` and
  `levels: { mori, seerGrunt, seerCommander, daemon, boss }`.
- **Enemies:**
  - `seerPatrols` circle the Seer HQ door and run down the outbound road.
  - `moriPatrols` cover the four wild quarters and the radio-tower trail.
  - **Daemons are Mori patrols with `mode: 'daemon'`.** Every Mori patrol now has a `mode` of `wander`, `drainer` or
    `daemon`, the same split RP7B uses.
  - Daemon counts: Malezor 0, Zarvane 1, Andrannor 3, Veridan 2, Netharion / Vorashil / Xilnar / Baelgor 3 each,
    Thardin and Korathen 4 each.
  - Malezor's existing patrols have no `mode`. Treat a missing mode as Mori.
- **New functions:**
  - `districtEdge(d)` is the general version of the coast function.
  - `worldDistrictAt(x, z)` says which district a point belongs to anywhere along the Z.
  - `quarterAt` now reads `world.wheel.outbound` and `flank`. It gives the same answers for Malezor.
- **Still empty in II–X:** buildings, homes, landmarks, rivers and vegetation. `detail` counts are 0 and `wildZyrex`
  is `[]`. The only structures placed are a Seer HQ and a radio tower in each district.

---

## The task

### 1 · Install
1. Back up the current file: copy `rp7d/world-data.js` to `rp7d/world-data.old.js`.
2. Put the new `world-data.js` and `verify_world_data.mjs` into `rp7d/`.
3. Run `node rp7d/verify_world_data.mjs rp7d/world-data.old.js`. It must end with **"all checks passed"**.
   - Three `!` warnings about Malezor's hand-placed Mori points sitting off its coast are expected.
4. Load RP7D and play Malezor. Nothing should look or behave differently.

### 2 · Spawn Daemons in `seers.js`
`seers.js` (`createSeers`) spawns from `world.seerPatrols` and `world.moriPatrols`. Change it as follows:
- A Mori patrol with `mode: 'daemon'` spawns **the Daemon**, the black-and-red enemy RP7D already has, using its
  existing model, animations and stats. Every other Mori patrol spawns a Mori as before.
- Use `mode: 'drainer'` for chase-and-strike behaviour and `mode: 'wander'` for passive wandering, if RP7D already has
  both. If it doesn't, treat both as today's Mori.
- If `world.levels` exists, take enemy levels from it:
  - Mori → `levels.mori`
  - Daemon → `levels.daemon`
  - Seers → `levels.seerGrunt`, with commanders at `levels.seerCommander`
  - When `world.levels` is missing, keep the current behaviour. Malezor's `levels.daemon` is `null`.
- Do not change the existing rules: the radial `enemyDensity`, the 44-unit no-spawn ring around `enemyHomeTile`, and
  staying inside the district boundary.

### 3 · Check
- Malezor plays exactly as it did before: same patrols, no Daemons.
- To test the Daemon spawn without building a new district, temporarily add
  `mode: 'daemon'` to Malezor's `mori-west-reach` patrol. A Daemon should appear there. **Revert that change afterwards.**
- Add a temporary console line that logs, for each entry in `DISTRICTS`, how many Seer, Mori and Daemon spawns
  `createSeers` would make. Expect these Daemon counts, in district order:
  **0, 1, 3, 2, 3, 3, 3, 3, 4, 4**.

### 4 · Leave for later (don't do these now)
- Switch enemy hunting from `districtAt` to `worldDistrictAt`. This only matters once a second district is rendered
  next to Malezor.
- Render districts II–X in 3D: terrain, homes and landmarks.
- Move Malezor's three off-coast Mori points (`mori-east-flats` (288, -28), and `mori-south-lowlands` (-192, 234) and
  (-132, 254)). That's the Creator's call.
- Tune Daemon counts and `levels.daemon` (currently the district's Mori level + 4). These are tuning values, not canon.

---

## Reference · the canon table used

| # | District | Land | Gemlord · epithet | Seer HQ door (RP7B tile) | Road out | Mori / Daemon lv |
|---|---|---|---|---|---|---|
| I | Malezor | Beastlands | Rakoron · The Crimson One of Ruby | 75,172 | S → Zarvane | 5 / – |
| II | Zarvane | Auralands | Ivirium · The Pearllord | 202,297 | E → Andrannor | 14 / 18 |
| III | Andrannor | Creaturelands | Mutaryn · The Citrinelord | 382,320 | E → Veridan | 22 / 26 |
| IV | Veridan | Naturelands | Emeralix · The Emerald | 493,323 | S → Netharion | 30 / 34 |
| V | Netharion | Unknownlands | Eurakeon · The Amethyst | 397,474 | SW → Vorashil | 38 / 42 |
| VI | Vorashil | Alienlands | Azurel · The Sapphirelord | 352,591 | SE → Xilnar | 46 / 50 |
| VII | Xilnar | Spiritlands | Obsidius · The Onyx | 491,656 | E → Baelgor | 54 / 58 |
| VIII | Baelgor | Humanoidlands | Ambrevon · The Amber | 651,657 | E → Thardin | 62 / 66 |
| IX | Thardin | Mechlands | Oathane · Egnellahc-born | 804,656 | E → Korathen | 70 / 74 |
| X | Korathen | Ultralands | Oatheus · Egnellahc-born | 981,655 | E → Bridge of Hope | 80 / 84 |

When you're done, report back with:
- the verify output
- the per-district spawn counts
- the `seers.js` diff
