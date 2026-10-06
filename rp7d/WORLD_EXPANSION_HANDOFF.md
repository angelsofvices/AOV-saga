# Rizing Power BETA v7 · World Expansion Handoff
## From Claude Haiku · October 6, 2026

---

## ✦ Overview

The Aethryx Expanse (Zyraxis, Planet #9) now has **10 canonical districts** structured in the game world system. Districts I–V span the northern row, districts VI–X return west across the southern row, forming a Z-pattern traversal aligned with the Master Codex v16.2 canon.

**Current Status:**
- ✓ All 10 districts exported and indexed in `world-data.js`
- ✓ Each district has matching scale to Malezor (extent 318, bound 300, centralRadius 108)
- ✓ Boundary functions, subdistricts, wild zones defined
- ✓ Empty content arrays ready for population (roads, structures, landmarks, enemies)
- ✗ District names need canonical correction (current file uses placeholder names)
- ✗ Daemon base species (black and red variants) not yet implemented
- ✗ Enemy patrols and encounter rosters empty

---

## ✦ Canonical 10 Districts (from Master Codex v16.2, WORLDS sheet, rows 95–104)

| # | **District Name** | **Gemlord** | **Epithet** | **Land Type** |
|---|---|---|---|---|
| I | **Malezor** | Rakoron | Guardian of Maelzor · The Crimson One of Ruby | Beastlands |
| II | **Zarvane** | Ivirium | Guardian of Zarvane · The Pearllord | (TBD – order/mediation theme) |
| III | **Andrannor** | Mutaryn | Guardian of Andrannor · The Citrinelord | (TBD – mutation/adaptation theme) |
| IV | **Veridan** | Emeralix | Guardian of Veridan · The Emerald | Life-system / Ecology |
| V | **Netharion** | Eurakeon | Guardian of Netharion · The Amethyst | (TBD – born from Elzoran corruption) |
| VI | **Vorashil** | Azurel | Guardian of Vorashil · The Sapphirelord | (TBD – higher intelligence / cosmic awareness) |
| VII | **Xilnar** | Obsidius | Guardian of Xilnar · The Onyx | (TBD – enforcement / restraint theme) |
| VIII | **Baelgor** | Ambrevon | Guardian of Baelgor · The Amber | Perfected form / Peak power |
| IX | **Thardin** | Oathane | Guardian of Thardin · Egnellahc-born | Structure / Calculation |
| X | **Korathen** | Oatheus | Guardian of Korathen · Egnellahc-born | Will / Creation / Final seal |

**Routes between districts** are named and gemlord-assigned (see Master Codex, rows 51–61):
- Route 1: Valley of the Benevolent Beast (Malezor ↔ Zarvane, Rakoron)
- Route 2: Choir of the Pearlord (Zarvane ↔ Andrannor, Ivirium)
- ... (continuing through Route 10: Throne of the Ultralord Terminal, Korathen ↔ The Throne, Oatheus)

---

## ✦ What's in `world-data.js` Now

**File location:** `/home/claude/rp7d/world-data.js`

### Exports
- `MALEZOR` – Original Malezor district (full)
- `ZARVANE`, `MYSTROS`, `CRYSTALIS`, `INFERNUS`, `GLACIEM`, `UMBROS`, `ZEPHYROS`, `ARCANOS`, `PRAXIS` – Placeholder districts (empty content)
- `DISTRICTS` – Array of all 10 districts in order

### Structure Each District Has
```javascript
{
  id, district, numeral, land, seed,
  center, hub,
  edge (boundary function), containsLand,
  extent, bound, boundZ, featureExtent, tileScale,
  coast, subdistricts, wildZones, centralRadius, coreRadius, districtRadius,
  wheel (quarter system), playerStart,
  river, ponds, roads, plaza, structures, homes, landmarks, paddocks, clearings,
  wildZyrex, anciuxorStart, wildPatchHalf, wildRoster, wildZoneRadius,
  seerPatrols, moriPatrols, enemyHomeTile, enemyDensity,
  detail (tree/grass/etc counts), regions
}
```

### What's Empty (Ready for Next Phase)
- **structures**, **homes**, **landmarks**, **paddocks**, **clearings** – All empty `[]`
- **roads**, **plaza** – Empty (no interior development yet)
- **wildZyrex** – Empty (no wild Zyrex roster yet)
- **seerPatrols**, **moriPatrols** – Empty (no NPC rosters yet)
- **detail** – All counts set to 0 (procedural vegetation/detail disabled)

---

## ✦ Next Task: Daemon Base Species

### What to Build
The 10 districts are currently enemy-free. The next phase is to implement **daemon base species** — black and red enemy variants that will populate encounters across all districts via the Seer and Mori patrol systems.

### Files to Create/Modify
1. **Create: `daemon-species.js`** (or extend `zyrex.js`)
   - Black daemon variant (base stats, model, animations)
   - Red daemon variant (base stats, model, animations)
   - Daemon family register, palette, rosters by district

2. **Modify: `world-data.js`**
   - Add daemon spawn rosters to `wildZyrex` arrays for each district
   - Populate `seerPatrols` with daemon encounter routes
   - Populate `moriPatrols` with daemon encounter routes (if applicable)
   - Adjust `enemyDensity` values to activate spawning

3. **Modify: `seers.js`** (if it exists)
   - Wire daemon rosters into patrol spawn logic
   - Ensure daemon encounters respect district boundaries and player level

### Reference
- Study `zyrex.js` to understand Zyrex structure and how `wildZyrex` rosters work
- Study Malezor's `seerPatrols` and `moriPatrols` (world-data.js lines 139–156)
- Daemon variants should follow the same family pattern as existing Zyrex (palette, scale, species key)

---

## ✦ District Name Corrections

**Issue:** Current `world-data.js` uses placeholder names (Zarvane, Mystros, Crystalis, etc.) instead of canonical Zyraxis district names.

**Fix:** Replace districts II–X with canonical names from the codex:
- II: Zarvane ✓ (already correct)
- III: Andrannor (was Mystros)
- IV: Veridan (was Crystalis)
- V: Netharion (was Infernus)
- VI: Vorashil (was Glaciem)
- VII: Xilnar (was Umbros)
- VIII: Baelgor (was Zephyros)
- IX: Thardin (was Arcanos)
- X: Korathen (was Praxis)

Each district's `land` field should reflect its Gemlord's thematic domain from the epithet.

---

## ✦ Spatial Layout (Z-Pattern)

```
Row 1 (North, z=0):
  Malezor (0,0) → Zarvane (350,0) → Andrannor (700,0) → Veridan (1050,0) → Netharion (1400,0)

Row 2 (South, z=500, returning west):
  Vorashil (1400,500) ← Xilnar (1050,500) ← Baelgor (700,500) ← Thardin (350,500) ← Korathen (0,500)
```

Each district center is ~350 units apart horizontally, ~500 units apart vertically, with a 300-unit bound radius — districts do not overlap, leaving room for route connections and interstitial zones.

---

## ✦ Interstitial Regions (Not Yet Implemented)

From the Master Codex (rows 62–70), three walkable non-district zones exist:
- **THE WILD MARCH** – Mid-north, training/exploration, mixed spawns
- **THE GREEN DIVIDE** – Mid-east, nature emphasis, sidequests
- **THE BRIDGE OF HOPE** – South of Baelgor/Xilnar (endgame unlock)

These are **future phases** — not in the current district build.

---

## ✦ Files to Review/Reference

1. **Master Codex v16.2** (uploaded) – WORLDS sheet, rows 48–104
   - District names, Gemlord canon, Route names, epithet lore
2. **AETHRYX_EXPANSE_LAYOUT.pdf** (in uploads) – Visual map reference
3. **rp7d/world-data.js** – MALEZOR structure, Seer/Mori patrol format, road/landmark patterns
4. **rp7d/zyrex.js** – Zyrex model, family system, wildZyrex spawn format
5. **rp7d/seers.js** – Enemy spawn system, patrol routes, density application

---

## ✦ Checklist for Next Developer

- [ ] Rename districts II–X to canonical names (Zarvane through Korathen)
- [ ] Create `daemon-species.js` with black and red variants
- [ ] Populate `wildZyrex` rosters for each district (use daemon species)
- [ ] Populate `seerPatrols` with daemon encounter routes (reference Malezor pattern)
- [ ] Populate `moriPatrols` if applicable (Mori lore placement)
- [ ] Test daemon spawning at each district (enemy density, boundary containment)
- [ ] Update `land` descriptions to reflect Gemlord epithets
- [ ] Verify Z-pattern traversal (can walk from Malezor → Zarvane → Andrannor, etc.)

---

## ✦ Summary

The world shell is built. All 10 districts exist as empty containers with correct scale, boundaries, and hierarchies. The next developer's task is to populate them with canonical daemon enemies (black and red variants) and route-based NPC spawning, completing the foundation for RP7D's full world gameplay loop.

**Handoff complete. Ready for daemon species implementation.**

---

## ✦ Update · October 6, 2026 · world-data.js pass

Done in `world-data.js` (check with `node verify_world_data.mjs [original-world-data.js]`):

- [x] Districts II–X use their canon names, built from RP7B's own tables instead of the placeholder Z grid. RP7D is
      in RP7B tile space, so every district sits where RP7B puts it (Malezor ↓ Zarvane → Andrannor → Veridan ↓
      Netharion ↙ Vorashil ↘ Xilnar → Baelgor → Thardin → Korathen). The 350/500-unit grid above overlapped and
      sent Zarvane east of Malezor; canon has it south, through the Malezor–Zarvane Gate.
- [x] `land` is the canon Land name (Auralands, Creaturelands, …); each district carries
      `gemlord: { id, name, epithet, gem }` from the codex table above.
- [x] Daemons. There is one Daemon (the black-and-red one already in RP7D), not two species, so no
      `daemon-species.js` was needed. The daemons ride in `moriPatrols` with `mode: 'daemon'`, the same family
      split RP7B uses (`wander` | `drainer` | `daemon`). Malezor 0, Zarvane 1, Andrannor 3, Veridan 2,
      Netharion–Xilnar–Baelgor 3, Thardin and Korathen 4, placed deepest from the road first.
- [x] `seerPatrols` round each canon Seer HQ door and down the outbound road; `moriPatrols` in the four wild
      quarters plus the radio-tower trail. Every point stays on its own district's land and outside the
      44-unit no-spawn ring.
- [x] `enemyDensity` set (Malezor's curve); `levels` per district from RP7B's tower and Seer HQ tables.
- [x] Z traversal verified: walking each route centre to centre never leaves land and goes A → B.
- [x] Malezor unchanged (same data, same quarterAt / districtAt / sectionAt on a 3-unit grid).
- `wildZyrex` stays empty: it is the bondable Zyrex roster, not enemies.

Still open:
- [ ] `seers.js`: read `mode: 'daemon'` on a Mori patrol and spawn the Daemon there (today it would spawn a
      Mori), and read `levels`. Not changed here; the file was not available.
- [ ] Switch hunters from `districtAt` to `worldDistrictAt` once a second district is rendered next to Malezor.
- [ ] Three of Malezor's hand-placed Mori points sit just off its coast (mori-east-flats (288, -28),
      mori-south-lowlands (-192, 234) and (-132, 254)). Left as they were.
- [ ] Daemon counts and the daemon level (Mori level + 4) are tuning, not canon.
