# S3 RIZER · LUMINARY FORM — COMPLETE ANIMATION SHEET PROMPT PACK

**For:** ChatGPT Codex / image generation
**Target:** The AOV Saga · Rize of Power (RP7) · `rp7b.html`
**Status:** `idle-luminary.png` is **already shipped and in-game** (v0.96.40).
Everything else in this pack is missing and currently falls back to S2 art.

---

## 0 · READ THIS FIRST — THE FIVE RULES THAT FAIL A SHEET

Every one of these has broken a delivery before. A sheet that violates any of
them is rejected at import, not fixed at import.

1. **1254 × 1254 px. 4 columns × 4 rows. 313 px cell. No exceptions.**
   Row = direction, **always** `0 DOWN · 1 LEFT · 2 RIGHT · 3 UP`.
   Column = frame `0 → 1 → 2 → 3`, played in that order.

2. **Flat neon-green chroma background** (`#14B51B`-ish, the same green used on
   `idle3-v4.png`). Not transparent. Not black. Not a gradient. The engine keys
   it with a soft matte, so a *clean, uniform* green is what makes that possible.

3. **THE FEET DEFINE THE FLOOR.** Within one row, every frame's foot baseline
   must sit at the **same Y**. Aura ribbons, sparks, wings and weapon arcs are
   *never* the lowest ink. If a frame leaves the ground (jump, dodge), the whole
   row still shares one implied floor — the character rises off it, the floor
   does not move.

4. **The body may overflow its cell. The body may NOT touch a neighbour.**
   Wings and hair legitimately reach above the 313 px cell — the engine owns
   that overflow via connected-component extraction. But two characters must
   never touch, or the extractor merges them into one blob and both frames are
   destroyed. **Keep ≥ 8 px of clear green between any two frames' ink.**

5. **CONSISTENT BODY SCALE ACROSS ALL SHEETS.** The character's head-to-feet
   height — *excluding* the elevated hair-wings and excluding aura — must match
   `idle-luminary.png`, which measures **207 / 189 / 185 / 194 px**
   (DOWN / LEFT / RIGHT / UP). The engine scales every sheet so that number
   renders at a fixed 92.9 px. If a walk sheet draws him 15% taller than the
   idle sheet, he visibly grows the moment he takes a step.

---

## 1 · WHO S3 IS — the character description to carry into every sheet

**S3 RIZER · LUMINARY FORM.** Unlocked at Rizer Level 100 — Tier 8, the maximum
a mortal reaches. He looks nearly divine and is not one.

- **Palette:** white, pearl and warm gold. Silver-white plate armour with gold
  filigree. A blue-violet gem at the chest. Warm skin.
- **Eyes:** brilliant white-gold light, emitting.
- **Hair:** soft, layered, wind-swept, pale platinum, gently flowing.
- **★ THE HAIR-WINGS — the single most important construction rule.**
  Two angel-wing silhouettes made **of his own hair**. They originate from the
  **central rear spinal hair, behind the neck and upper back.** They do **not**
  grow from the temples, the ears, the crown or the shoulders. Seen from behind
  (row 3), the central spinal hair divides into a readable **Y-shaped root**
  and two symmetrical elevated wings.
- **Aura:** a pale cyan-white ribbon orbiting the body in a 4-frame loop,
  passing correctly **behind** the body on two frames and **in front** on two.
  Sparse travelling star-sparks ride with it. The aura **lags slightly behind**
  the body's motion.
- **★ He must NOT regain S2's floor-length mane or cloak-like silhouette.**
  S3 is *lighter* than S2, not heavier. Compact armoured body, big wings.
- **Tone:** serene, buoyant, effortless. Even his violence is unhurried.

**Continuity:** S3 is the same person as S1 and S2 — same proportions, same
chibi head-to-body ratio, same armour weight. Only the palette, the hair and the
wings change. Put S1's `idle.png` and S2's `idle-power-upgrade.png` beside your
output and confirm he reads as the *same character*.

---

## 2 · THE SHEET LIST — 22 files

Naming convention is fixed: take S2's filename and replace the
`-power-upgrade` suffix with `-luminary`.

### TIER 1 — LOCOMOTION (build these first; they are visible constantly)

| # | filename | frames mean |
|---|---|---|
| 1 | `walk-luminary.png` | 4-frame walk cycle. contact → passing → contact → passing. Wings settle and lift gently with the stride; they do not flap hard. |
| 2 | `run-luminary.png` | 4-frame run. He leaves the ground — vertical bounce **within** the row is correct and wanted. Wings sweep back with speed. Aura ribbon streams behind. |
| 3 | `idle-jump-luminary.png` | 4 frames: crouch → launch → apex → land. From standing. |
| 4 | `run-jump-luminary.png` | 4 frames: same beats, but carrying forward momentum — body pitched forward, wings spread wider for lift. |
| 5 | `double-jump-luminary.png` | 4 frames: the mid-air second beat. **The wings genuinely open here** — this is the one traversal move where they read as functional. A burst of pale-gold light at the apex. |
| 6 | `dodge-luminary.png` | 4 frames: a fast lateral slip. Body low, aura ribbon whipping across the vacated space. Ends upright. |
| 7 | `skate-luminary.png` | 4 frames: riding a hoverboard/skateboard. Knees bent, arms loose, wings trailing flat behind like a banner. |

### TIER 2 — MELEE

| # | filename | frames mean |
|---|---|---|
| 8 | `punch-luminary.png` | ★ **NOT a 4-frame animation.** Each COLUMN is a DIFFERENT strike in a combo chain: `col0 jab · col1 cross · col2 elbow · col3 backfist`. The engine holds one column per combo step. They must read apart in silhouette at two tiles: the **elbow is the narrow, tall one** (it folds vertically), the **backfist is the widest**. |
| 9 | `kick-luminary.png` | 4-frame heavy kick: wind → extend → impact → recover. |
| 10 | `block-luminary.png` | 4 frames: guard raised. Wings fold FORWARD into a shield of light across the chest — this is S3's signature defensive read. Frame 3 is the sparkle/impact-absorb frame. |
| 11 | `hurt-luminary.png` | 4 frames of taking a hit: recoil → stagger → recover → settle. Wings droop and lose their lift. |
| 12 | `death-luminary.png` | 4 frames: struck → knees → collapse → still. **The light goes out** — eyes dim, aura dissipates, wings fall and lose their shape. Ends flat on the ground. |

### TIER 3 — ASTRAL / SPECIAL (A3 + A4)

| # | filename | frames mean |
|---|---|---|
| 13 | `astralstrike-luminary.png` | 4 frames: A3 hand-blast cast. Gather → charge → release → recoil. Pure white-gold light gathering at the palms. |
| 14 | `astralkick-luminary.png` | 4 frames: A4 ultimate — a powerful anime kick, huge arc, trailing gold light. |
| 15 | `astralthrow-luminary.png` | 4 frames: lifting and hurling an object with light. Grip → raise → throw → follow-through. |
| 16 | `astralslam-luminary-mori.png` | 4 frames: slamming a held **Mori** (humanoid enemy) into the ground. |
| 17 | `astralslam-luminary-daemon.png` | 4 frames: same, holding a **Daemon** (larger enemy). |

### TIER 4 — VFX (these are effects, not the character — no body in frame)

| # | filename | notes |
|---|---|---|
| 18 | `astralstrike-projectile-luminary.png` | The travelling bolt. 4×4, one row per travel direction. White-gold core, cyan-white edge. |
| 19 | `astralstrike-boom-luminary.png` | 4-frame impact burst, expanding then dissipating. |
| 20 | `astralkick-boom-luminary.png` | 4-frame heavier impact burst for the A4. |

### TIER 5 — INTERACTION

| # | filename | frames mean |
|---|---|---|
| 21 | `interact-luminary.png` | 4 frames: reaching out / pressing / picking up. Small, calm gesture. |
| 22 | `fae-catch-luminary.png` | 4 frames: catching faedust in a net — arms sweep, wings lift for balance. |
| 23 | `guitar-play-luminary.png` | 4 frames: playing a guitar. Yes, really. Wings relaxed and low. |

### TIER 6 — CAPTURE (8 separate one-direction files, NOT 4×4 grids)

These follow a different layout: **one file per direction**, each a 4-frame
sequence of Rizer holding an open Zysphere during a wild-bond encounter.

| # | filenames |
|---|---|
| 24–27 | `capture-success-s3-down.png` · `-left.png` · `-right.png` · `-up.png` |
| 28–31 | `capture-fail-s3-down.png` · `-left.png` · `-right.png` · `-up.png` |

Still 1254×1254. **Success** = the sphere closes with a burst of gold light and
he stands tall. **Fail** = the sphere breaks open, light scatters, he flinches.
★ In these frames a wide bright capture beam is present — keep it clearly
*separate* from the body silhouette; the extractor picks the **tallest**
component as the body and a fat beam can be mistaken for him.

---

## 3 · THE RHUD — S3 HUD PORTRAIT (2 files)

**Files:** `rizer-hud-luminary.png` and
`rizer-hud-expression-luminary.png`
**Size:** 1254 × 1254, neon-green background, same as S1/S2.

**What it is:** a circular gold-rimmed portrait medallion on the LEFT, with
three horizontal segmented meter tracks running to the RIGHT of it:

- **HP** — red heart icon, then 5 red segments
- **ENERGY** — gold lightning-bolt icon, then 5 gold segments
- **SPECIAL** — blue crystal icon, then 5 blue segments

**Portrait content:** S3 Rizer's face and shoulders inside the medallion —
platinum hair, glowing white-gold eyes, silver-gold armour, the wing roots just
visible behind his shoulders. The `-expression-` variant is the same medallion
with a **grinning / fired-up** expression instead of the neutral one.

### ★★★ THE GEOMETRY IS NOT NEGOTIABLE — put the meters exactly here

S2's HUD art placed its bars a few pixels off S1's, and the game carries a
per-skin CSS override to compensate — a hand-tune that took three attempts and
a bug report ("losing pixels in the s2 rhud"). **If S3 lands its meters on S2's
coordinates, it reuses that override and needs no new hand-tuning at all.**

Measured in the 1254 × 1254 art's own pixels:

| meter | fillable track spans X | vertical centre Y |
|---|---|---|
| HP | **702 → 1197** | ≈ **395** |
| ENERGY | **702 → 1197** | ≈ **622** |
| SPECIAL | **702 → 1220** | ≈ **829** |

- Each track is **5 equal segments** with small gaps.
- The *fillable interior* is what must land on those numbers — not the outer
  gold frame, and not the outer glow.
- Portrait medallion occupies roughly the left third; overall composition
  matches S1/S2 so the three HUDs are interchangeable at a glance.

---

## 4 · DELIVERY CHECKLIST

Before sending a sheet back, confirm:

- [ ] 1254 × 1254, 4 × 4, 313 px cells (except the 8 capture files)
- [ ] Row order DOWN / LEFT / RIGHT / UP — check the head faces the right way
- [ ] Flat uniform neon green, no gradient, no transparency
- [ ] ≥ 8 px clear green between any two frames' ink
- [ ] Feet share one baseline per row
- [ ] Body height (excluding wings + aura) consistent with the idle sheet
- [ ] Hair-wings root at the **central rear spine**, not the temples
- [ ] No S2 mane, no cloak
- [ ] Aura passes both behind and in front across the 4 frames
- [ ] Nothing clipped at the sheet edge

**Priority order if delivering in batches:** walk → run → punch → kick → block →
hurt → death → the two RHUD files → the astral set → jumps/dodge → capture →
skate/guitar/interact/faeCatch.

---

## 5 · WHAT HAPPENS ON MY SIDE WHEN A SHEET LANDS

For each file I: chroma-key it with a soft matte (preserving aura sparks),
run connected-component extraction to measure the 4 × 4 bbox table and the
per-row body height, register the bundle in `rp7b.html`, add it to
`PLAYER_SKINS.luminary.overrides`, add the `loadAsset` line, and render an
in-game preview at final scale for approval. Until a sheet exists, that action
falls back to S2's art — deliberately, so he never reverts to blue S1 hair
mid-move.

**Currently shipped:** `idle-luminary.png` only.
**Currently falling back to S2:** every other action in this document.
