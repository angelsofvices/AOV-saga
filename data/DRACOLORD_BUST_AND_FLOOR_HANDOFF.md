# HANDOFF · SIX DRACOLORD BUSTS + SIX DOMAIN FLOOR TILES

**For:** ChatGPT Codex / image generation
**Target:** The AOV Saga · Rize of Power (RP7) · `rp7b.html`
**Deliverable:** **12 files** — 6 busts, 6 tileable floors
**Status of the feature:** the six domains are BUILT and walkable today. The
Dracolords are currently drawn as procedural silhouettes. These 12 files
replace the placeholders; nothing else in the game changes.

---

## 0 · READ THIS FIRST — THE SIX RULES THAT FAIL A DELIVERY

Every one of these has cost a re-do on a previous batch.

1. **Flat neon-green chroma background** (`#14B51B`-ish), on every file
   including the floors. Not transparent, not black, not a gradient. The
   engine keys it with a soft matte, so a *clean, uniform* green is what makes
   that possible.

2. **★ TIGHT-CROP THE BUSTS TO THEIR OWN INK.** The telescope arrived on a
   canvas with ~130px of empty margin. The engine scales art by its declared
   height, so that margin was scaled as if it were part of the object and the
   telescope rendered ~10% short and off-centre. Trim to the bounding box of
   the actual artwork. Aura and glow count as artwork; empty green does not.

3. **★★ THE FLOORS MUST TILE SEAMLESSLY.** They are painted as a repeating
   pattern. Any edge that does not wrap will show as a hard grid line across
   the whole domain, twelve tiles apart, forever.

4. **NEVER STRETCH.** Deliver at whatever aspect the subject wants. The engine
   pins one dimension and derives the other from your source aspect. Do not
   letterbox, pad or squash to hit a target shape.

5. **NO TEXT, NO LOGOS, NO SIGNATURES, NO BORDERS** anywhere in frame.

6. **These are 2D game assets seen from a fixed camera**, not concept art
   plates. Flat-ish lighting, readable silhouette, no lens effects, no depth
   of field, no film grain.

---

## 1 · WHO THE SIX ARE — the frame to carry into all twelve files

The six Dracolords are **not six powerful dragons**. They are the surviving
founding family of dragonkind and the architecture that keeps the Aethryx
Expanse stable.

~15 billion years ago the **Aenor Eruption** created the cosmic substrate, the
first Astralite material, and more than a thousand primordial Dracolords.
Nearly all died in the billion-year **Great Dying** — becoming stars, Aetheons,
planetary cores, or simply ending. The surviving six chose balance over
domination and formed the **Eternal Accord** ~13 billion years ago, becoming
the **Six Cosmic Guardians**.

They are a family:

```
Anciuxor + Alphaea
        │
      Azyrath
        │
 ┌──────┼───────────┬───────────┐
Abyssion Aetherion Abominalys Aethravax
```

Alphaea is the original mother. Azyrath is her only child with Anciuxor (a
True God, not a Dracolord) and is the survivor-matriarch who bore the four
quadrant guardians. Alphaea and Azyrath hold the **twin cosmic centre** — Sun
and Moon, two aspects of one thing seen from different sides.

**All six carry the same total stat pool, 2,997.** Parity of rank, difference
of role. None of them is "the strongest," and none of them should be drawn as
a final boss. **They judge. They do not fight.**

**Tone for all six:** ancient, enormous, unhurried, and *not hostile*. Rizer is
a mortal who has walked a long way to be looked at. None of them is snarling.
The feeling is being *noticed by something that has been noticing things for
fifteen billion years*.

---

## 2 · THE BUSTS — shared construction

**What a bust is here:** the **living Dracolord, head and shoulders**, filling
the far end of a corridor. The rest of the body is too large to see and
recedes into the domain. Not a statue. Not a monument. It breathes, and it is
about to speak.

- **Framing:** head and upper shoulders/chest only. Crop the body off — the
  point is that it does not fit.
- **Facing:** **head-on toward the viewer.** Rizer approaches from directly
  in front and stops to speak. A slight downward tilt is right — you are being
  looked *down at* — but do not turn the head to a profile.
- **Eyes are the focal point.** Lit, and clearly aimed at the viewer. They are
  the one part that must read instantly at small size.
- **Scale cue:** build in something that says *enormous* — the jaw wider than
  a doorway, scale plates the size of shields, a horn leaving frame.
- **The lower edge should dissolve**, not cut cleanly: the body continues into
  cloud/void/spectrum below the crop.
- **Symmetry:** roughly frontal and symmetric. Aethravax is the deliberate
  exception (see his block).

**Technical:**

| | |
|---|---|
| canvas | **1254 × 1254 px** (or wider if the subject needs it — aspect is free) |
| background | flat neon green |
| crop | tight to the ink, per rule 2 |
| renders at | **~9 tiles tall ≈ 432 px**, width follows your aspect |
| sits in | a **15-tile-wide corridor (720 px)** — leave the bust under ~13 tiles wide or it will crowd the walls |
| animation | **none — deliver a single still.** The engine adds a slow breathe and eye-glow. Do not bake motion in. |

---

## 3 · THE FLOORS — shared construction

Each domain gets **one floor tile**. It is the surface Rizer walks the whole
32-tile approach on, so it is on screen longer than anything else in the game.

**Technical:**

| | |
|---|---|
| canvas | **1254 × 1254 px**, square, **seamlessly tileable on all four edges** |
| background | flat neon green *only where the art is meant to be absent* — the floor should mostly be opaque art |
| renders at | downscaled to a **576 × 576 px repeat** = 12 game tiles at 48 px each |
| therefore | **every detail must survive a 2.18× downscale.** Fine hatching and 1px linework will vanish. Work at the scale of shapes, not strokes. |
| repeat | the pattern repeats every 12 tiles and **the player will see the seam-to-seam cycle** — avoid one dominant landmark that will read as wallpaper. Distribute interest evenly. |
| value | **mid-range.** The engine lays a coloured domain wash over the whole scene and Rizer must stay readable standing on it. No pure black, no pure white, no maximum saturation. |
| lighting | flat and even. No baked cast shadows, no single light source — the tile is used at every position on the map. |

---

## 4 · THE SIX · one block each

> **★ NAMING NOTE:** four of the six domain names below are **new**, proposed
> to fit the codex. See §5 — they need the Creator's sign-off before these are
> considered final. The visual direction does not depend on the name.

---

### 1 · ALPHAEA — *The First Radiance*
**Domain: THE HIGHEST EYE** *(was THE SOUL-SHALLOWS)*
Guardian of Divine Order · queen of the guardians · original mother
Ultramax/Aura · Tier IX Demigod · HP 666 / ATK 445 / DEF 666 / SPD 520 / SP 700
Status: **Brainlock** · Seat: **Aenor**, the Highest Eye and Sun of the Expanse

She determines the lawful *form* within which matter, energy and life may
exist. Without her, existence loses its shape. Her low attack is deliberate —
she does not defeat chaos, she **limits what chaos is permitted to do**.

**BUST.** White-gold body. **Halos of pure radiance** — concentric rings behind
and around the head, geometric and precise rather than soft glow. **Wings
bearing countless all-seeing eyes**: bring the wing shoulders into frame so the
eyes are visible, open, and looking in different directions at once. A **living
world-tree grows from her back** — root and branch structure cresting over the
shoulders behind the head, gold-green and clearly *alive*. Her own eyes are
serene and enormous. She is not a sovereign looking down on creation; she is
creation's faculty of oversight. Read: *queen, order, being seen from every
angle simultaneously*.

**FLOOR.** Lawful structure made visible. A **white-gold geometric lattice** —
interlocking sacred geometry, concentric rings and radial spokes, everything
measured and repeating on purpose. Faint eye-motifs worked into the pattern.
Warm ivory and pale gold over a soft luminous base. The one floor of the six
that looks **designed**.

---

### 2 · AZYRATH — *The Hollow Empress*
**Domain: THE LOWEST EYE** *(was THE UNWRITTEN)*
Guardian of the Void · daughter of Alphaea · mother of the four
Ultramax/Unknown-Void · Tier IX · HP 500 / ATK 555 / DEF 666 / SPD 536 / SP 740
Status: **Gridlock** · Seat: **Zoryth**, the Great Moon and Lowest Eye

The Void here is **not evil or death**. It is the empty space that stops
existence suffocating under its own accumulation. Alphaea gives reality shape;
Azyrath gives that shape **room**. She is "hollow" because she makes a
protected interior in which something endangered can survive — she sheltered
the whole bloodline through the Great Dying.

**BUST.** Void-dark body with cold silver-grey edge light, like a moon lit from
behind. At her throat/upper chest, the **Hollow Core**: a **black-red
singularity**, small and absolute, with light bending visibly around it. Dust,
debris and fragments of matter hang **suspended and motionless** in orbit near
her — nothing falls, nothing moves. Her expression is stillness and silence,
and it should read as **protective, not cruel** — a mother who survived
something. Her scale plates are smooth and closed.

**FLOOR.** Gravity made a surface. Dark void-grey and deep charcoal, with
**matter drawn inward** — faint concentric pull-lines, suspended motes frozen
mid-fall, a subtle black-red bruise of light bleeding up from beneath. Almost
nothing on it is bright. Emptiness that feels **occupied** rather than blank.

---

### 3 · AETHERION — *The Prism Tyrant*
**Domain: THE PRISM ASCENT** *(was THE UNSHADOWED)*
Guardian of Evolution · Quadrant I, **Alpha** `(+,+)` · planets 1,5,9,13,17,21,25
Ultramax/Aura · Tier IX · HP 633 / ATK 540 / DEF 474 / SPD 600 / SP 750
Status: **Undershock**

Existence must change or die. He is advancement *and* uncontrolled mutation —
he will force a life-form past its limits without caring whether it survives
the transition. His body **never settles into one permanent form**.

**BUST.** **Prism-cut armour** — hard faceted plate, gem-cut rather than
organic, catching and splitting every frequency at once so the surface throws
spectrum in all directions. The anatomy must read as **unstable**: a second
jawline ghosting through the first, a horn mid-way through budding into
another horn, plate edges that do not quite agree about where they are. Colour
shifts continuously across the body — no single hue owns him. Eyes bright and
clinical. Read: *change happening while you look at it*, not a finished thing.

**FLOOR.** Spectrum refraction. **Prismatic facets** across the surface, each
plane throwing a different part of the spectrum, so the colour changes as the
eye travels. Crystalline growth patterns that look mid-formation — some
facets complete, others still emerging. Bright and iridescent but keep the
value mid-range so Rizer reads against it.

---

### 4 · AETHRAVAX — *The Twin Dominion*
**Domain: THE OPEN STORM** *(unchanged — it already fits)*
Guardian of Cosmic Polarity · **the Guardian Who Judges the Guardians**
Quadrant II, **Dichotomy** `(-,+)` · planets 4,8,12,16,20,24
Ultramax/Aura · Tier IX · HP 600 / ATK 600 / DEF 599 / SPD 599 / SP 599
Status: **Souldrift**

Not peaceful harmony — **equilibrium held by opposed forces that stay active at
the same time**. He exists between Alphaea's order and Abyssion's collapse so
neither becomes absolute. His near-perfectly symmetric stat line is the
mechanical expression of his domain.

**BUST.** ★ **The one deliberately asymmetric bust — split exactly down the
centre line.** A **crowned dragon-skull** face, bone-structured and regal,
with **red eyes**. The viewer's LEFT half is **radiant astralite** — bright,
luminous, gold-white, the wing behind it made of light. The RIGHT half is
**abyssal Void** — dark, absorbing, the wing behind it a hole. The split must
be clean and central, not a gradient. At the throat sits an **emerald
world-core**, the single point where both halves meet and agree. Read:
*judgment observing from inside judgment's own body*.

**FLOOR.** The split continues underfoot. **Half radiant, half void**, meeting
along a hard line — but the line should **wander** across the tile rather than
run dead straight, so the repeat does not read as a stripe. Storm-light and
weather falling on the bright side; the dark side swallowing it. Emerald
threading through the seam where they meet.

---

### 5 · ABYSSION — *The Dimensional Maw*
**Domain: THE UNMADE** *(was THE DEEP WAR)*
Guardian of Collapse · Quadrant III, **Trinity** `(-,-)` · planets 3,7,11,…,27 (incl. Viridia)
Ultramax/Unknown-Void · Tier IX · HP 600 / ATK 666 / DEF 555 / SPD 456 / SP 720
Status: **Souldrift**

He consumes unstable dimensions, failed timelines, dimensional infections and
broken realities whose damage would otherwise spread. **He is not malicious.**
Without a controlled principle of collapse, damaged realities accumulate until
existence itself becomes unsustainable. Where Alphaea maintains reality's
form, Abyssion governs the point at which that form must be dismantled.

**BUST.** A cosmic dragon **composed of fractured reality** — the head and
shoulders built from broken plates that do not quite align, with **gaps between
them showing collapsing realities inside**: glimpses of other skies, other
geometry, falling architecture. Scaled in **black, red and blue**. The **jaw is
disproportionately large** — he is the Maw, and the mouth should read as a
place things go rather than a mouth. Eyes deep-set and steady. Read:
*architecture of collapse made flesh*, and tired of the job.

**FLOOR.** Fractured reality plates. Broken tectonic shards of surface with
**dark seams between them showing through to somewhere else** — other stars,
other structures, wrong angles. Black, deep red and cold blue. Some plates
tilted slightly out of plane. The ground itself is **failing**, but slowly and
under control.

---

### 6 · ABOMINALYS — *The Endless Catastrophe*
**Domain: THE BREATHING GROUND** *(unchanged — it already fits)*
Guardian of Existential Failure · **the final failsafe**
Quadrant IV, **Omega** `(+,-)` · planets 2,6,10,14,18,22,26
Ultramax/Beast · Tier IX · HP 720 / ATK 780 / DEF 480 / SPD 417 / SP 600
Status: **Overcook**

It acts where every other cosmic solution has ended. When a danger cannot be
sealed, understood, erased, repaired or contained, Abominalys manifests and
**consumes it**. Not justice, not vengeance — emergency measure. **Even the
other Guardians treat it cautiously.** Highest attack of the six, and the
slowest.

**BUST.** Use the **Serrated Fauna Form** — it reads at conversational
distance where the galaxy form would not. A **gemmed skull**: bone-plated head
with crystalline gems set into the bone, **serrated jaws** with layered
blade-teeth, and blade-like structures at the shoulders. Behind and inside the
throat, keep the **Guardian Form** visible as a hint: an interior that looks
like a **galaxy collapsing inward**, matter spiralling down into it. Colours:
bone, sick-green, and a devouring dark interior. It should read as **predatory
but not evil** — this is the one they send when there is no other answer.

**FLOOR.** You are standing on something **alive**. Living hide or gullet — a
warm organic surface with **breathing texture**, faint ridges like muscle or
gill structure, wet sheen in places. Sick-green and bone over darker organic
tissue. Nothing geometric, nothing designed. The floor of the six that makes
you want to keep moving.

---

## 5 · ★ WHAT NEEDS THE CREATOR'S SIGN-OFF

Flagged rather than silently resolved. **None of it blocks the art** — the
visual direction above stands either way.

**a · Four domain names are proposed, not canon.**

| lord | in-game today | proposed | why |
|---|---|---|---|
| Alphaea | THE SOUL-SHALLOWS | **THE HIGHEST EYE** | her seat is Aenor, the Highest Eye. "Xilnar's dead pass through here" is a spirit realm and has nothing to do with Divine Order. |
| Azyrath | THE UNWRITTEN | **THE LOWEST EYE** | her seat is Zoryth, the Lowest Eye. Pairs her with her mother as the twin cosmic centre, which is the point of both of them. |
| Aetherion | THE UNSHADOWED | **THE PRISM ASCENT** | THE UNSHADOWED ("light with nothing behind it") describes Alphaea, not the Prism Tyrant of mutation. |
| Abyssion | THE DEEP WAR | **THE UNMADE** | see (b). |
| Aethravax | THE OPEN STORM | *unchanged* | "sky above and sky below" already reads as duality. |
| Abominalys | THE BREATHING GROUND | *unchanged* | a floor that breathes already reads as a devourer. |

**b · THE DEEP WAR cites the First Ancient War.** Its in-game line is "This is
where it happened. The First Ancient War did not leave ruins." The codex
account you supplied places the six at the **Aenor Eruption → Great Dying →
Eternal Accord**, with no First Ancient War. Either the war is a separate later
event they were not party to, or the in-game line is wrong. **Story outranks
game**, so I have assumed the codex and dropped the war from Abyssion's domain.

**c · The type prefix disagrees.** The game records them as `Divine/Aura`,
`Divine/Beast` etc. The codex records `Ultramax/Aura`, `Ultramax/Beast`,
`Ultramax/Unknown-Void`. Separately, canon has **ULTIMATE** as the exclusive
21st type. Three names for what may be one slot — needs one ruling.

**d · The domain tints contradict the codex.** These are the colour washes laid
over each realm:

| lord | tint today | conflict |
|---|---|---|
| Alphaea | `#d7b8ff` violet | codex says **white-gold** |
| Aetherion | `#ffe9a8` warm gold | he is a **prism** — no single hue |
| Aethravax | `#8fc9ff` sky blue | codex centres him on an **emerald** core |
| Azyrath | `#9aa4b8` grey | fine — moon-cold reads correctly |
| Abyssion | `#6b5a8f` violet | acceptable; black/red/blue would be closer |
| Abominalys | `#a8e07a` green | fine — reads as fauna |

I have written the floor briefs to the **codex** palette, not the current
tints. If the tints stay as they are, Alphaea's gold floor will sit under a
violet wash. Say the word and I will re-tint to match.

**e · The six have full combat stat lines in the codex**, but the shipped game
ruling is **"they judge, they do not fight"** and they have no stats. Not a
contradiction yet — nothing fights them — but if they are ever meant to be
fought, that ruling needs revisiting.

---

## 6 · DELIVERY CHECKLIST

**Per bust (6):**
- [ ] Flat uniform neon green, no gradient, no transparency
- [ ] Tight-cropped to the artwork — no empty margin
- [ ] Head and shoulders only; the body leaves frame
- [ ] Facing the viewer, slight downward tilt, eyes lit and aimed at camera
- [ ] Lower edge dissolves into the domain rather than cutting flat
- [ ] Under ~13 tiles wide relative to a 9-tile height (it stands in a 15-tile corridor)
- [ ] A single still — no motion baked in
- [ ] Not snarling, not a boss pose

**Per floor (6):**
- [ ] 1254 × 1254, square
- [ ] **Tiles seamlessly on all four edges** — verify by laying 2×2 and looking for the seam
- [ ] Survives downscale to 576 × 576 (12 tiles at 48 px)
- [ ] No single dominant landmark that will read as wallpaper on repeat
- [ ] Mid-range value; a character must stay readable standing on it
- [ ] Flat even lighting, no baked cast shadows

**Filenames:**
```
dracolord-bust-alphaea.png      dracolord-floor-alphaea.png
dracolord-bust-azyrath.png      dracolord-floor-azyrath.png
dracolord-bust-aetherion.png    dracolord-floor-aetherion.png
dracolord-bust-aethravax.png    dracolord-floor-aethravax.png
dracolord-bust-abyssion.png     dracolord-floor-abyssion.png
dracolord-bust-abominalys.png   dracolord-floor-abominalys.png
```

**Priority if delivering in batches:** Alphaea → Azyrath → Aethravax →
Abyssion → Aetherion → Abominalys. (The twin centre first, then the judge,
then the rest — Alphaea and Azyrath are the two a player is most likely to
reach first, and the two whose look anchors the other four.)

---

## 7 · WHAT HAPPENS ON MY SIDE WHEN A FILE LANDS

**Bust:** chroma-key with a soft matte, measure the true bounding box, replace
the body of `drawDracolordPresence()` with a `drawImage`, pin the drawn height
to ~9 tiles with width following the source aspect, keep the existing slow
breathe and the domain-tint halo behind it, and render an in-game preview at
final scale for approval.

**Floor:** chroma-key, verify the tile actually wraps by laying it 2×2 and
diffing the seam, register it as the domain's pattern in place of the shared
Dreamland cloud, and confirm the density/feather masking still reads at the
causeway edges.

**Until a file exists**, that domain keeps the procedural placeholder —
deliberately, so a missing asset is a missing *portrait*, never a missing
Dracolord.

---

## 8 · CONTEXT YOU MAY WANT — how the six work as one system

| Dracolord | Cosmic necessity | Without them |
|---|---|---|
| Alphaea | Order and form | Reality loses coherent structure |
| Azyrath | Space, stillness, preservation | Matter accumulates without limit |
| Aetherion | Adaptation and growth | Existence goes static and cannot survive change |
| Aethravax | Balance through opposition | One principle gains absolute dominance |
| Abyssion | Collapse of corrupted realities | Failed dimensions infect the rest |
| Abominalys | Last-resort elimination | Uncontainable dangers destroy far more than themselves |

**Pairings worth reading before you draw:**
- **Alphaea & Azyrath** — Sun and Moon, Order and Void, awakening and
  preservation. Two halves of one centre. *Their busts should feel like a
  matched pair seen from opposite sides.*
- **Aetherion & Abyssion** — evolution and collapse, viable continuation and
  necessary ending.
- **Aethravax & Abominalys** — judgment and enforcement: deciding whether
  balance is still possible, and acting when it is not.

They are **not** the "Six Great Ones" — that is a separate, later class of
planetary axis-beings tied to planets 3–8. These six are first-generation
Dracolords from the Aenor-Eruption era, and **all subsequent dragonkind
descends from this family line**.
