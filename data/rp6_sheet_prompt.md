# ChatGPT Prompt · RP6 Character Animation Sheet Generator

Paste the block below into ChatGPT (image-gen enabled).  Fill in the two variables at the top: **CHARACTER_NAME** and **CHARACTER_DESIGN**.

Do not remove any line — the sheet layout, cell geometry, and chroma-key spec are matched EXACTLY to the RP6 game engine (`realms.html · SOLION_FRAMES / KRAVOS_FRAMES / *_ANIM`).

---

```
Create a single sprite-animation sheet for a 2D fighting game character. Follow the layout, geometry, and rendering rules below EXACTLY — the sheet is parsed by a runtime engine that reads per-frame bounding boxes at fixed pixel coordinates.

═══════ CHARACTER ═══════
NAME:    {{CHARACTER_NAME}}
DESIGN:  {{CHARACTER_DESIGN — 1-2 sentences · body proportions, weapon/no-weapon, color palette, silhouette. e.g. "Tall solar knight in gold armor with a two-handed radiant sword, blue undercloak, glowing white eyes."}}
FACING:  Every frame faces to the RIGHT (positive-X direction). The engine mirrors horizontally at runtime for player-2.

═══════ SHEET SPEC ═══════
- Canvas size: 1700 wide × 1000 tall pixels.
- Background: pure magenta #FF00FF (chroma-key removed by the engine — DO NOT dither near the character silhouette; keep the outline crisp).
- Style: hand-painted 16-bit fighting-game aesthetic (Guilty Gear / Street Fighter III-inspired), inked outlines, saturated fills, cel-shaded lighting from top-right.
- Character height baseline: ~120 px tall in IDLE. Combat animations may extend ±20 px for weapon reach and jump arcs. No two frames' bounding boxes should overlap.

═══════ LAYOUT · 6 ROWS × 2 HALVES ═══════
LEFT half (x=297 → x=833) = movement + defense (7 anims across 6 rows)
RIGHT half (x=864 → x=1501) = combat (6 anims across 6 rows, mirrors the row Y-bands)

Row Y-bands (character feet-ground reference):
  Row 1 · Y ≈  53 → 177 · LEFT: IDLE (7 frames) · RIGHT: LIGHT_ATTACK (4 frames)
  Row 2 · Y ≈ 230 → 334 · LEFT: WALK_FORWARD (7 frames) · RIGHT: HEAVY_ATTACK (4 frames)
  Row 3 · Y ≈ 380 → 495 · LEFT: WALK_BACK (6 frames) · RIGHT: SPECIAL_SLASH (3 frames · wider frame ~212 px each)
  Row 4 · Y ≈ 523 → 665 · LEFT: JUMP (5 frames · arc pose) · RIGHT: SPECIAL_RISE (4 frames · uppercut/rising arc)
  Row 5 · Y ≈ 726 → 819 · LEFT: CROUCH (4 frames) · RIGHT: SPECIAL_SLAM (4 frames · downward area attack)
  Row 6 · Y ≈ 868 → 984 · LEFT: BLOCK (5 frames · guard-up loop) · RIGHT: DASH_RUN (4 frames · lean-forward sprint)

Uniform column widths per row (LEFT):
  IDLE / WALK_FWD ≈ 77 px wide per frame
  WALK_BACK ≈ 90 px per frame (character back-view)
  JUMP ≈ 107 px per frame (peak extension)
  CROUCH ≈ 134 px per frame (wide low-profile silhouette)
  BLOCK ≈ 107 px per frame

Uniform column widths per row (RIGHT):
  LIGHT / HEAVY_ATTACK ≈ 159 px per frame (weapon extended)
  SPECIAL_SLASH ≈ 212 px per frame (widest — big VFX/sword arc)
  SPECIAL_RISE ≈ 159 px per frame (tall vertical motion)
  SPECIAL_SLAM ≈ 159 px per frame (downward arc, ground impact on last frame)
  DASH_RUN ≈ 159 px per frame (motion blur streaks OK)

Left column (x = 0 → x = 293) is reserved for a portrait bust of the character (used on the versus screen). Draw a single high-detail bust of {{CHARACTER_NAME}} centered in that block, magenta background, no crop.

═══════ ANIMATION CONTENT · WHAT TO DRAW IN EACH ROW ═══════
IDLE (7f · 6 fps loop) — subtle breathing bob (±3 px vertical), weight shifts foot-to-foot, weapon or hands relaxed. Frames should read as a smooth cycle.

WALK_FORWARD (7f · 10 fps loop) — right-facing stride cycle, arms swing counter to legs, head level stays constant.

WALK_BACK (6f · 10 fps loop) — BACK-VIEW walking (character retreating from player POV). Same cadence as WALK_FWD but rear-facing.

JUMP (5f · 8 fps · non-loop) — crouch-load → launch → apex → falling → landing squish. Frame 3 (apex) is tallest.

CROUCH (4f · 10 fps · non-loop) — stand → lower → deep crouch → hold. Frame 4 is the "held" pose.

BLOCK (5f · 8 fps · non-loop) — enter guard → hit-react shudder → held guard. Weapon/shield forward-braced.

LIGHT_ATTACK (4f · 14 fps · non-loop) — quick jab or short slash. Frame 2 or 3 is the active hit frame (weapon fully extended, VFX line).

HEAVY_ATTACK (4f · 8 fps · non-loop) — slow wind-up → committed strike → follow-through → recovery. Frame 3 is the active hit frame.

SPECIAL_SLASH (3f · 10 fps · non-loop) — big horizontal sword-arc / claw-sweep / elemental slash. VFX crescent on frame 2. Widest frames (212 px) to fit the arc.

SPECIAL_RISE (4f · 12 fps · non-loop) — rising uppercut or vertical launcher. Feet leave the ground on frame 2. Frame 4 is peak height.

SPECIAL_SLAM (4f · 10 fps · non-loop) — jump → axial downward strike → ground impact with shockwave. Frame 4 shows the impact VFX at ground level.

DASH_RUN (4f · 14 fps loop) — extreme forward lean, ground-parallel body posture, motion streaks trailing. Loop-ready cycle.

═══════ CHARACTER CONSISTENCY RULES ═══════
- Every frame across the whole sheet shows the SAME character (same silhouette, palette, proportions, weapon).
- Feet always land on the same Y-line within a row (except JUMP which arcs).
- No frame extends beyond the row Y-band ±5 px.
- No text, labels, numbers, or grid lines on the sheet.
- Weapon (if any) is consistent shape/color across all frames.
- Do NOT draw a shadow oval under the character — the engine draws its own.
- Preserve a 4-px transparent gutter between frames so bounding-box detection is unambiguous.

═══════ DELIVERABLE ═══════
One PNG at 1700×1000 · magenta #FF00FF background · character sheet only · no HUD, no border, no watermark.

After generating, verify:
- Portrait bust in left column readable at 200 px.
- All 12 animations present in the row/half positions above.
- No white halo or JPEG-fringe around the character silhouette (chroma-key sensitive).
```

---

## Notes for the Creator

* Two characters currently in RP6 use this sheet contract: **Solion** (`v6realms/sheet_solion.png`) and **Kravos** (`v6realms/sheet_kravos.png`).  Every new fighter you add must ship a sheet in this identical layout so `SOLION_FRAMES` / `KRAVOS_FRAMES` bbox rules apply without engine changes.
* Frame counts + fps are **canon** — do not let ChatGPT re-negotiate them.  The engine's `SOLION_ANIM` / `KRAVOS_ANIM` timing tables assume these counts exactly.
* If ChatGPT can't hit 1700×1000 cleanly, generate at 3400×2000 and downscale in Photoshop — the engine handles the smaller size natively but downscaling from 2× preserves outline crispness.
* Once you have the PNG: drop it into `assets/rp6/` (or wherever your sheet directory lives), name it `sheet_<charactername>.png`, and I'll wire it into the RP6 fighter registry when you're ready.

