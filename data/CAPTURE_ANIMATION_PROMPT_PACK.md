# RIZER · CAPTURE ANIMATION SHEETS — PROMPT PACK
**For the ChatGPT image generator. 8 sheets total: 4 SUCCESS (one per facing) + 4 FAIL (one per facing).**
Wires into the Wild Bond Encounter shipped at v0.95.866 (the Zysphere imprint QTE).

---

## 0 · THE HARD SPEC (every sheet, no exceptions)

| | |
|---|---|
| **Canvas** | **1254 × 1254 px**, square |
| **Grid** | **4 × 4 = 16 frames**, each cell **313 × 313 px**, read **left→right, top→bottom** (frame 1 top-left, frame 16 bottom-right) |
| **Background** | **flat NEON GREEN `#00FF00`** (or flat magenta `#FF00FF`) — one solid colour, no gradient, no vignette, no shadow on the background |
| **Style** | 16-bit SNES-JRPG pixel art, crisp pixels, no anti-aliased blur against the key colour, no outline glow bleeding into the background |
| **Character size** | Rizer ≈ **2 tiles tall** — his body should occupy roughly **240-260 px of the 313 px cell height**, feet near the cell bottom |
| **Framing** | **identical camera and identical feet line in all 16 cells.** Do not zoom, pan, or re-crop between frames — only the character and the effects move |
| **One character per cell** | never draw two Rizers in one cell; effects may overflow the cell edges, the BODY may not |

> **Why the spec is rigid:** the engine slices these by connected-component ownership and plants the sprite on a measured foot baseline. A shifting camera or a floating body between frames reads in game as the character sliding or bouncing.

---

## 1 · THE CHARACTER (paste into every prompt)

> **RIZER** — a teenage boy, athletic build. **Spiky teal-and-navy hair** swept back. Wearing a **navy-blue tunic with gold trim and gold shoulder accents**, a dark belt, **dark navy trousers**, and **black-and-gold boots**. Determined, expressive face. He is a "Rizer" — a creature-bonding hero.

**The Zysphere:** a **palm-sized sphere of polished dark metal banded with gold, with a glowing cyan-white crystal core**. It **splits open along its equator** when thrown/held open, and light pours *inward* through the gap.

---

## 2 · THE FICTION THE ANIMATION MUST SELL

This is **not** a ball being thrown at a creature. From canon:

> The Zysphere opens when clicked, and the Zyrex is **absorbed into the sphere in Rizer's hands** — a **reverse energy blast**. The Zyrex is **digitally imprinted onto the inner matrix of the sphere**, then uploaded to the ZyPhone.

So: **Rizer holds the sphere up, it opens, and a stream of light flows FROM the creature INTO the sphere in his hands.** He is *straining to hold it* — the sphere is fighting him. The drama is in his arms and his face.

---

## 3 · SUCCESS SHEET — the 16-frame beat sheet

Same 16 beats in all four directional sheets; only the facing changes.

| frames | beat | Rizer's body | **Rizer's face** |
|---|---|---|---|
| **1-2** | **RAISE** — he lifts the closed Zysphere to chest height | weight settling, both hands coming to the sphere | **focused, jaw set** — brows down, eyes locked forward |
| **3-4** | **OPEN** — the sphere splits at its equator, cyan light spills out | arms extending, elbows bending outward | **eyes widening** as the light hits his face, mouth beginning to open |
| **5-8** | **THE PULL** — a thick ribbon of cyan-white light streams *inward* from off-frame into the open sphere; particles spiral in | leaning back, arms braced, feet planted wide, **hair and clothes blown by the inflow** | **teeth gritted, one eye squinting** against the glare — visible effort, a shout forming |
| **9-11** | **THE STRUGGLE** — the sphere shudders and bucks; the inflow pulses brighter twice | **both hands clamped on the sphere**, body twisted, one knee bending as he holds it down | **full strain — mouth open in a yell**, brow furrowed hard, sweat bead |
| **12-13** | **THE SNAP** — the sphere slams shut, a bright ring-flash bursts out from the seam | recoil: arms jolt back toward his chest | **eyes shut tight** in the flash, face braced |
| **14-16** | **THE LOCK** — the sphere settles in his palm, core glowing steady, three small sparks orbiting it | straightening up, sphere held out slightly, shoulders dropping | **relief into triumph** — eyes opening, a rising grin by frame 16 |

**Light direction:** every effect must read as flowing **INTO** the sphere (inward arrows, particles converging), never outward. This is the single most important visual rule of the success sheet.

---

## 4 · FAIL SHEET — the 16-frame beat sheet

The mirror image: light comes **BACK OUT**.

| frames | beat | Rizer's body | **Rizer's face** |
|---|---|---|---|
| **1-3** | **HOLDING** — sphere open in his hands, inflow still streaming in, straining | same braced stance as success frames 5-8 | **gritted effort** |
| **4-6** | **THE SLIP** — the inflow stutters and **reverses**; light begins pouring back OUT through the seam | arms starting to be pushed back | **confusion into alarm** — eyes going wide, brows lifting |
| **7-10** | **THE BREAK** — a hard outward burst of cyan-white light blows out of the sphere, particles flying away from it | **knocked backward**, one foot skidding, free arm thrown up to shield his face | **flinching, eyes squeezed shut, mouth open in a grunt** |
| **11-13** | **THE SPILL** — the sphere snaps shut, dark and inert, the last of the light dissipating away from him | stumbling half-step back, shoulders hunched | **wincing, then falling open** — the moment he realises he lost it |
| **14-16** | **THE LOSS** — he lowers the dead sphere and looks up after the escaped creature | standing up straight, sphere down at his side, head lifting | **frustrated disappointment** — brows knitted, mouth a tight line, a small headshake by frame 16 |

---

## 5 · THE FOUR FACINGS

Generate each sheet separately, changing only the camera-facing of the character:

1. **`capture-success-down.png`** — Rizer facing the VIEWER (front view, face fully visible). ★ Generate this one first; it is the most-seen and the face reads best.
2. **`capture-success-left.png`** — facing left (profile)
3. **`capture-success-right.png`** — facing right (profile — mirror of left is acceptable if the pose reads identically)
4. **`capture-success-up.png`** — facing AWAY (back view; face not visible — sell the emotion with shoulders, arm tension, and the light spilling around his silhouette)
5-8. the same four for **`capture-fail-*.png`**

---

## 6 · COPY-PASTE PROMPT (swap the two bracketed lines per sheet)

```
16-bit SNES JRPG pixel-art sprite sheet. Canvas exactly 1254x1254 pixels, laid
out as a 4x4 grid of 16 equal cells (each cell exactly 313x313 pixels), read
left to right, top to bottom. Flat neon green #00FF00 background, one solid
colour, no gradients or shadows on the background.

ONE character in every cell: RIZER, a teenage boy with spiky teal-and-navy hair
swept back, wearing a navy-blue tunic with gold trim and gold shoulder accents,
a dark belt, dark navy trousers, and black-and-gold boots. Athletic build,
highly expressive face.

He is holding a ZYSPHERE: a palm-sized polished dark-metal sphere banded with
gold, with a glowing cyan-white crystal core, that splits open along its
equator.

[FACING: he is seen from the FRONT, facing the viewer, face fully visible]

The 16 frames are ONE continuous animation of [ACTION LINE — see below].

CRITICAL CONSISTENCY RULES:
- identical camera distance and identical ground/feet line in all 16 cells
- the character occupies about 250 of the 313 pixels of cell height, feet near
  the bottom of each cell
- only the character and the light effects change between frames; never zoom,
  pan or re-crop
- the body stays inside its own cell; only glow and particles may overflow
- crisp pixel art, no blur or soft anti-aliasing against the green background
```

**ACTION LINE — success sheets:**
```
a CREATURE-CAPTURE: he raises the closed sphere (frames 1-2), it splits open
and cyan light spills out (3-4), then a thick ribbon of cyan-white light and
particles streams INWARD from off-frame INTO the open sphere while his hair and
clothes are blown by the inflow and he braces hard (5-8), the sphere bucks and
he clamps both hands on it, yelling with effort (9-11), the sphere SNAPS SHUT
with a bright ring-flash and he recoils with eyes shut (12-13), and finally the
sphere settles glowing steady in his palm with small sparks orbiting it as his
face opens into relief and a triumphant grin (14-16). All light must flow INTO
the sphere, never outward.
```

**ACTION LINE — fail sheets:**
```
a FAILED capture: he strains holding the open sphere with light still streaming
in (1-3), the inflow stutters and REVERSES and light begins pouring back OUT of
the seam as his face turns from effort to alarm (4-6), a hard outward burst of
cyan-white light blows out of the sphere and knocks him backward, one foot
skidding, his free arm thrown up to shield his face, eyes squeezed shut (7-10),
the sphere snaps shut dark and inert as he stumbles back and realises he lost it
(11-13), and he lowers the dead sphere to his side and looks up after the
escaped creature with a frustrated, disappointed expression (14-16). All light
must flow OUT of the sphere, away from him.
```

---

## 7 · WHAT I DO WHEN THE SHEETS LAND

Drop them in `assets/2D sprites/rizer/`. I will:
1. chroma-key + de-halo each sheet (border-flood or full-mask as the art needs);
2. measure all 16 cells by **component ownership** and record per-frame bboxes + **body foot baselines** (so the flash and particles never lift or shove him);
3. register a `RIZER.capture` / `RIZER.captureFail` bank with `cellAnchor` — the same anchoring that cured the Seer Grunt's attack lurch;
4. drive the frames from the **live QTE**: frames 1-4 on the encounter opening, 5-11 held/looped across the spin events (pulsing brighter as each event clears), 12-16 on the resolve — so the animation *is* the fight, not a cutscene bolted on;
5. play the fail sheet on a broken bond before the flee/hostile/teleport branch fires;
6. ship a suite (`verify_capture`) asserting 16 in-cell frames per sheet, no neighbour sampling, and one shared scale across all four facings.

**Phase 2 (say the word):** the same 8 sheets for **S2 / power_upgrade** (the Rakoron form) — every other Rizer action sheet has an S2 twin, so capture eventually needs one too.
