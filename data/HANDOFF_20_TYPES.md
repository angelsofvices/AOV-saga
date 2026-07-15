# HANDOFF · 20-Type Roster Reclassification

**Purpose of this doc:** a fresh Cowork session opens this file and picks up
the work of expanding the Rizing Powers of Zyraxis type system from **10 → 20**,
then reclassifying every Zyrex in the codex under the new taxonomy.

Do not merge into the game engine yet. Deliverable is **one new sheet** in the
game codex with the updated typings + move types per Zyrex. Wiring the new
chart into `rizers.html` happens in a separate follow-up session after the
sheet is reviewed and approved by The Creator.

---

## Context you need before starting

- **Current chart:** 10 types with 3 strengths / 3 weaknesses each (locked in
  `rizers.html` `TYPE_STRONG_VS`, V2.26). Casts (Fire, Water, Ice, Light,
  Shadow, Force, Ground, Spirit, Air, Electric) are a separate move-flavor
  system and **stay unchanged** — 10 casts total.
- **Roster:** ~527 entries in `data/aov_game_codex_v11.1.xlsx` sheet
  `9 MASTER INDEX` (parseable via `data/build_codex.py`). ~115 are Zyrex, ~411
  are Zyraxians (humanoid classes).
- **Game vs Master codex split:** master v11.1 in Google Drive is IRL-verified
  and untouched. Game codex is our working canon. All 20-type work happens in
  the game codex.
- **Canon flavor to preserve:** every Zyrex already has a lore hook in its
  `worldsense` + `flavor` columns. Reclassification should HONOR that flavor,
  not overwrite it. If a codex row already calls something a "dragon of the
  cliffs," it gets Draconic. Read the flavor before assigning.

---

## The 10 additional types (proposed — refine as needed)

The additions were designed to subdivide overly-broad existing categories that
the 500+ roster stress-tests, and to add a few new axes that keep coming up in
canon.

| # | New type       | What it covers                                                                                       | Splits from / alongside | Example fits from current roster |
|---|----------------|------------------------------------------------------------------------------------------------------|-------------------------|----------------------------------|
| 11 | **Draconic**   | Dragons, wyrms, serpentine apex forms. Any species with a canonical "dragon" or "wyrm" descriptor.   | Alongside Beast         | Elzoran, Omegoran, Abyssalis, Abyssarach (any codex row with "dragon" in flavor) |
| 12 | **Crystal**    | Gem-embedded, mineral-body, or geode-shell species. Zyraxian creatures with crystalline biology.     | Alongside Nature/Tech   | Pebblequil (crystal-quilled hedgehog), gemstone-lord fauna                        |
| 13 | **Radiant**    | Luminous light-emitters, holy-glow beings — the *bright* aspect, distinct from Aura's subtle field. | Splits from Aura        | Sunhoop (sun-crested), Aetherwing, seraphic canonical entries                     |
| 14 | **Divine**     | Sanctified, angelic, priest-class, god-derived. Distinct from Ultramax (peak power) — Divine is *consecrated*. | Alongside Ultramax  | Cleric-class Zyraxians, celestial guardians                                       |
| 15 | **Corrupted**  | Shadow-consumed, cursed, warped-by-void. Was normal, became warped.                                  | Alongside Void          | Omegoran (canonical corrupted apex), any codex "shadow-touched" entry             |
| 16 | **Verdant**    | Plant-heavy — moss, root, vine, canopy. Distinct from Nature (elemental) — Verdant is *flora-being*. | Splits from Nature      | Verdanix (frog), forest-canopy fauna                                              |
| 17 | **Aquatic**    | Water-native, deep-sea, tidal. Distinct from Nature — Aquatic is *of-the-water*.                     | Splits from Nature      | Otterlin, Abyssiq (deep-trench), tidal predators                                  |
| 18 | **Chrono**     | Time-manipulators, ageless, before-time beings. Rare tier.                                           | Alongside Ultramax/Void | Ael'Tharion-adjacent entities, Pseudoimmortal chronomancers                       |
| 19 | **Astral**     | Cosmic star-touched, celestial-born. Distinct from Extraterrestrial — Astral is *of-the-cosmos*, ET is *xeno-biological*. | Alongside ET | Cosmic Guardians (Abominalys, Abyssion — Tier IX Demigod)                         |
| 20 | **Elemental**  | Pure elemental embodiments — beings that ARE fire, storm, earth. Distinct from the Element casts (moves). | Alongside Nature | Fire-elemental Zyrex, storm-body creatures                                        |

**Guardrails when designing the extended chart:**

- Keep the same **3-strengths / 3-weaknesses per type** structure. That means
  20 types × 3 = 60 directed edges, in-degree = out-degree = 3 for every type,
  no mutual counter pairs.
- 20 nodes × 3 = 60 out-edges, but 20 × 19 = 380 possible directed pairs. Only
  ~16% coverage — plenty of room to design flavorful matchups.
- Preserve the current 10-type relationships as much as possible so existing
  balance isn't nuked. Add cross-relationships to the new 10 types thoughtfully.

---

## Deliverable format

Add one new sheet to `data/aov_game_codex_v11.1.xlsx`, named:

> **`14R 20-TYPE ROSTER`**

(sits next to the existing `14 GAME ROSTER` sheet; the "R" is for "Reclass").

**Columns:**
| Col | Header               | What goes in it                                                              |
|-----|----------------------|------------------------------------------------------------------------------|
| A   | `#`                  | Row index                                                                    |
| B   | `ID`                 | slug (lowercase, matches sheet 9 name slug)                                  |
| C   | `Name`               | Display name (Voltimite, Elzoran, etc.)                                      |
| D   | `Tier`               | Roman tier from sheet 9                                                      |
| E   | `Old Type 1`         | Type from sheet 9 for reference                                              |
| F   | `Old Type 2`         | Type from sheet 9 for reference                                              |
| G   | `New Type 1`         | From the 20-type list (primary)                                              |
| H   | `New Type 2`         | From the 20-type list (secondary, blank if single-typed)                     |
| I   | `Move A1 Type`       | New type for the A1 (Basic) move — usually matches primary                   |
| J   | `Move A2 Type`       | New type for A2 (Signature)                                                  |
| K   | `Move A3 Type`       | New type for A3 (Ultimate)                                                   |
| L   | `Move R Type`        | New type for Rizer Special (if applicable)                                   |
| M   | `Flavor Preservation`| One-line justification tying the new typing to the codex `flavor` column     |
| N   | `Notes`              | Anything you noticed, uncertainties, canon questions to raise with The Creator |

**Header row + a legend section at the top** listing all 20 types with their
one-line descriptions (from the table above) so the reviewer can eyeball.

---

## Suggested working order for the fresh session

1. **Read the memory files** (via `mcp__cowork__read_widget_context` or just
   the memory index). Key ones: `game-codex-vs-master-codex`, `aov-terminology-locks`,
   `aov-zyraxis-ten-districts`, `rizing-powers-story`, `aov-canon-drive-sources`.
2. **Skim `HANDOFF_20_TYPES.md`** (this doc) to ground the scope.
3. **Look at the current 10-type chart** in `rizers.html` around
   `const TYPE_STRONG_VS` (V2.26 lock — 3 per side). Understand the shape you
   are extending.
4. **Draft the 20-type extended chart** as a separate deliverable. Verify
   every type has 3 strengths + 3 weaknesses, no mutuals, all 60 edges
   accounted for. Save as a section in this handoff doc.
5. **Build the reclass sheet:** open `aov_game_codex_v11.1.xlsx`, add sheet
   `14R 20-TYPE ROSTER`, populate rows for every Zyrex-role entry in sheet 9
   (roughly 115 rows). Skip Zyraxian (humanoid) rows for this pass unless the
   scope expands.
6. **Move types:** update A1/A2/A3/R move types on the same sheet. Rule of
   thumb: A1 (Basic) matches primary type; A2 (Signature) matches secondary or
   primary; A3 (Ultimate) is usually primary; R (Rizer Special) can be either.
7. **Commit** with a message like `V2.27 — Draft 20-type reclass sheet
   (game codex-only; not yet wired to game engine)`. Reference this handoff.
8. **Do NOT touch `rizers.html` TYPE_STRONG_VS.** That wiring happens after
   The Creator reviews the sheet and signs off.

---

## Uncertainties to flag when finishing

- Is Ultramax kept as a separate type, or does it fold into Divine + Astral?
- Should Corrupted always coexist with the original type (e.g. Omegoran =
  Aura/Corrupted rather than a full replacement)? Currently V2.24.3 game canon
  has Omegoran as Aura/Void — Corrupted-as-a-type would give a more precise
  home.
- Do Zyraxian (humanoid) rows need the 20-type treatment too, or do they stay
  under the old 10?
- Some codex rows have already been retyped in-game (Elzoran, Voltimite,
  Omegoran, Elzebub, Elzimir). Cross-check those before reclass so you don't
  regress the game-canon overrides.

---

## Success criteria

- [ ] Sheet `14R 20-TYPE ROSTER` exists in the game codex with all Zyrex
      rows populated
- [ ] 20-type extended chart drafted at the top of this handoff doc (or in
      the sheet's legend area)
- [ ] Chart verified: every type has exactly 3 strengths + 3 weaknesses,
      no mutuals
- [ ] Move types filled in for A1 / A2 / A3 / R
- [ ] Flavor Preservation column populated per row
- [ ] `rizers.html` is UNCHANGED — this session does not wire the new chart
- [ ] Commit message references `V2.26.HANDOFF` and this file path

Good luck. Ping The Creator early with any canon question — many of the
20-type edges will hinge on his sense of what feels right.
