# The Viridia Expedition — Combat & UI Spec

**Status:** DRAFT (May 2026, polish-pass session)
**Scope:** Prototype 04 (Viridia Expedition) only. Sibling prototypes
(Training Yard, Battlegrounds, Long Return) are out of scope and may
use different systems.
**Source material:** Hand-drawn schematic + labeled sprite sheet
(`animation_combat_player.png`) provided by The Creator.
**Brand:** Angels Of Vices™ LLC — *The AOV™ Saga: Rizing Powers TCG*

---

## How to read this document

Every subsystem below has three sections:

- **Decided** — locked. Implementation should follow these exactly.
- **Open questions** — design decisions still owed before code can be written.
- **Notes** — observations, tradeoffs, things to keep in mind.

When an open question is answered, move it to *Decided* and strike the
old text. This doc is the single source of truth.

---

## 0. System overview

The Viridia Expedition is an overworld-exploration prototype in a
GBA-style hardware chassis (a controller frame around a centered game
viewport). On top of the existing exploration loop (walk / run / fly,
modal menus, region transitions, UFO interaction) we are adding:

- **Combat layer** — A/B/ABA/BAB inputs, played live in the overworld
  (no separate battle screen)
- **HUD layer** — Health, Special cooldown, Item/Consumable scroll,
  Current Character badge, Weapon display
- **Inventory system** — Items, consumables (Start button opens)
- **Party-swap system** — Multiple characters carried; tap RZ badge
  (or some other input) to swap active
- **Specials** — L = Special 1, R = Special 2, L+R = Ult
- **Chests** — Wood / Silver / Gold tiers
- **HUD toggle** — Double-tap Menu hides the on-screen HUD

These layers are **additive** to existing exploration code. Nothing in
the spec below replaces or refactors existing systems; it extends them.

---

## 1. Controller mapping

### Decided

| Button | Function |
|---|---|
| **D-pad (Up/Down/Left/Right)** | Movement (unchanged) |
| **A** | Punch (basic melee, no SPC cost) |
| **B** | Kick (basic melee, no SPC cost) |
| **X** | (reserved — placeholder, no action) |
| **Y** | (reserved — placeholder, no action) |
| **L (shoulder)** | Special Attack 1 |
| **R (shoulder)** | Special Attack 2 |
| **L + R simultaneous** | Ultimate |
| **Start** | Inventory |
| **Menu** (center triangle) | Main menu (the existing "hub" modal) |
| **Select** | Map (the existing "map" modal) |
| **Menu (double-tap)** | Toggle HUD on/off |
| **Tap on RZ badge (in-game HUD)** | Swap active character |

### Combo inputs

| Sequence | Result |
|---|---|
| **A** alone | Punch |
| **B** alone | Kick |
| **A→B** (within 250ms each) | Generic combo (effect TBD — see open questions) |
| **A→B→A** (each within 250ms) | Sword Swing |
| **B→A→B** (each within 250ms) | Blaster Shot (Heavy Hand) |

### Open questions

- **What does A→B (two-input combo) do?** The schematic lists "A/B —
  combo" as a distinct entry, separate from ABA and BAB. Is it just
  "punch + kick in succession" with no special effect? Or does it have
  its own animation / damage modifier? Or is it just a shorthand label
  for "any A-B chain"?
- **Combo window timing:** schematic doesn't specify. Earlier locked
  at 250ms per gap. Confirmed?
- **Combo cancel rules:** if A→B→A starts, but the third tap doesn't
  arrive within window, does the player get a generic "A→B combo"
  effect, or does it commit to just the A and the B as separate moves?
- **Mid-attack movement:** earlier locked as "walk and attack
  simultaneously, attacks slide with movement." Confirmed for combos
  too? Or are ABA / BAB ground-locked (since they're bigger moves)?
- **Does Blast (the third special-attack animation row in the sheet)
  have an input mapping?** Schematic doesn't show one. Candidates:
  hold A long-press, A+B simultaneous, or unassigned for now.
- **L+R Ult:** what does it do mechanically? Just a bigger Special?
  Costs the full SPC pool? Has a cooldown distinct from Specials 1/2?
- **Inputs while in modals:** when a modal is open, A/B/L/R should
  probably be inert (no attack fires through a paused-world modal).
  Confirm.

### Notes

- The current code (post-Fix 1/2/Muddy patch) already wires A to
  region-transition / UFO interaction. Adding combat means that A's
  behavior becomes **context-sensitive**: if a region-exit or UFO is
  adjacent, A confirms the transition (existing behavior); otherwise
  A is Punch. The spec needs to declare priority order.
- B currently is the run/fly toggle (single-tap = run sustain,
  double-tap = fly sustain). Combat needs B as kick — these conflict.
  Either combat mode disables the run/fly toggle, or B's tap is
  reserved for kick and run/fly moves to a different binding.
  **This is a major decision.**

---

## 2. Combat layer

### Decided

- Combat happens **live in the overworld**. No separate battle screen.
- Attacks play their animation at the player's current position.
- Movement is permitted during attack (walk-and-attack).
- A/B basic melee = no SPC cost.
- A→B→A = Sword Swing (special).
- B→A→B = Blaster Shot / Heavy Hand (special).
- Combat sprite sheet is `animation_combat_player.png` (1536×1024 px,
  5 rows × 4 columns).

### Sprite sheet layout

- **Total dimensions:** 1536 × 1024 px
- **Format:** JPEG (despite .png filename) — no alpha channel; needs
  chroma-key cleanup on the gray background like the existing
  flood-fill slicers do for the other sheets
- **Grid:** 5 rows × 4 columns = 20 frames
- **Frame size (assumed grid):** 1536 / 4 = **384 px wide** × 1024 / 5
  = **204.8 px tall** — *but* the left ~300px of every row is a text
  label (PUNCH, KICK, etc.), not a frame. Real frame area is roughly
  columns 1–4 in the right ~1200px.
  - **Open question:** is the actual frame width different? Either:
    (a) the labels overlap a transparent slot 0 that the slicer skips,
    or (b) the grid is actually `(1536 - 320) / 4 ≈ 304 px` wide per
    frame starting at x = 320.
  - The slicer will need to be told the start-x offset to skip labels.
- **Row order:** Punch, Kick, Blast, Sword Swing, Blaster Shot
- **Direction:** right-facing only. Left/up/down will be mirrored from
  this sheet until additional sprites are drawn.

### State machine

Combat actions are a distinct state on `player` — orthogonal to the
existing walk/run/fly modes, which apply to *movement* animation.

```
player.combatAction: null | 'punch' | 'kick' | 'sword' | 'blaster' | 'blast'
player.combatPhase: 0..3  (which frame in the 4-frame animation)
player.combatStartedAt: timestamp
```

When `combatAction !== null`, the renderer draws from the combat sheet
instead of the walk/run/fly sheet. When the animation completes
(4 frames × frame duration), `combatAction` resets to `null` and the
character returns to walk/run/fly rendering.

### Open questions

- **Frame duration:** how long is each combat frame? Affects how
  responsive attacks feel. Suggested starting point: 60ms per frame
  → 240ms per full 4-frame attack. Confirm.
- **Animation cancel / interrupt rules:** earlier locked as "snappy"
  (Claude's choice). Specifically: if A is mid-animation and B is
  pressed, does B cancel A and start kick immediately, or does B
  queue and play after A finishes? Currently undecided.
- **Hitboxes:** when does a punch / kick "land"? Is it the impact
  frame (frame 3 of the 4)? What's the hitbox shape and reach?
- **Knockback / hitstun:** N/A for now since no enemies exist yet.
  But the spec should reserve this for later.
- **Combo chaining timing within an attack:** can A→B start while A's
  animation is still mid-frame? Or only after A finishes? "Whatever
  feels best" was the answer but it needs a concrete rule.

### Notes

- Combat without enemies is half a feature. First build will just
  play animations in empty space. Hit detection, damage, knockback,
  and enemy AI are explicitly deferred.
- The combat sheet has 5 animations × 4 frames = 20 frames total.
  Each animation row tells a clean story (windup → mid → strike →
  impact), so the renderer should play frames sequentially with no
  looping during the action.

---

## 3. Specials (L / R / L+R)

### Decided

- **L** triggers Special Attack 1.
- **R** triggers Special Attack 2.
- **L + R** (simultaneous press) triggers Ultimate.
- Specials consume **SPC** (the stamina pool — see Section 5).
- Specials are presumably the Blast / Sword / Blaster Shot animations,
  but the mapping to L vs R is **not yet defined**.

### Open questions

- **What ARE Special 1 and Special 2?** Schematic labels them but
  doesn't specify which animation each plays. Suggested mapping:
  - L (Special 1) = Blast
  - R (Special 2) = Sword Swing OR Blaster Shot
  - L+R (Ult) = the remaining special, OR a sixth attack not on the sheet
  This is a major open question.
- **Do specials have cooldowns separate from SPC cost?** The "Special
  HUD (cooldown)" in the schematic suggests yes. If SPC is full but a
  special is on cooldown, can it fire?
- **L+R Ult triggering:** what counts as "simultaneous"? Both pressed
  within X ms of each other? Both held while a third input fires?
- **Can specials be combo'd with A/B?** Earlier locked as "Combat is
  its own layer — X/Y stay reserved." Does that mean specials only
  fire via L/R, or can ABA/BAB ALSO trigger sword/blaster (the same
  animations)? If both, do they cost SPC differently?
- **What happens if specials are pressed without enough SPC?** Fizzle
  silently? Show "out of SPC" feedback? Trigger a weaker version?

### Notes

- The schematic's "ABA = sword, BAB = blaster" assigns the special
  animations as combos. If L = sword and R = blaster, there are TWO
  ways to fire each special — combo input (free, via A/B chain) or
  shoulder press (SPC cost, instant). That's a design choice with
  meaningful gameplay implications.
- One possible resolution: combo specials are FREE but require timing
  skill; shoulder specials cost SPC but fire instantly. This rewards
  both casual and advanced play. **Flagging this as a design
  recommendation, not a decision.**

---

## 4. Health system

### Decided

- HUD shows a segmented horizontal bar at top-left of the game viewport.
- Schematic shows ~10 segments (the "10" label next to the bar).
- Heart icon precedes the bar.

### Open questions

- **Max health:** is it 10? Or 10 segments of some larger number
  (e.g., 100 HP with each segment = 10)?
- **Damage source:** without enemies, who damages the player? Falls?
  Hazards? Or is health irrelevant until enemies exist?
- **Healing:** how is health restored? Consumables (Section 6)?
  Time? Save points? Sleeping?
- **Death state:** what happens when health hits 0? Game over? Respawn
  at last region edge? Lose XP / items?

### Notes

- This system can be deferred entirely until enemies exist. The HUD
  can be drawn as a static "full health" indicator with no underlying
  state until damage logic is built.

---

## 5. SPC (Special / Stamina) pool

### Decided

- SPC is a stamina-style resource that gates special attacks (Section 3).
- Schematic shows a smaller HUD below health, labeled "Special HUD
  (cooldown) / melee" with a lightning icon and "3" indicator.
- **House Rule context (from Codex):** SPC is free in TCG battles (no
  gem cost). This Expedition system is *separate* — SPC here is a
  depleting/regenerating in-game resource, not the TCG card mechanic.

### Open questions

- **What does "3" mean on the HUD?** Possibilities:
  - 3 charges available (specials cost 1 charge each, max 3 stored)
  - 3-second cooldown until next special
  - 3 stamina ticks remaining
  - Something else entirely
- **Max SPC:** if it's a numeric pool, what's the max?
- **Regen rate:** how fast does SPC refill? Tied to walking? Idle time?
- **Cost per special:** Special 1, Special 2, and Ult — do they cost
  the same? Different? Does Ult deplete the entire pool?
- **HUD says "↑ melee"** — what does that mean? Does melee (A/B) also
  generate SPC on hit? Or use it? Or is "melee" the second mode of the
  SPC HUD (toggling between special charges and melee weapon ammo)?

### Notes

- The "↑ melee" annotation suggests SPC and melee share a HUD slot.
  Combined with the "Weapon HUD (applies to ammo/melee)" label
  elsewhere, this might mean: SPC = ranged specials, separate melee
  weapon has its own ammo/durability tracked nearby.

---

## 6. Inventory / Items / Consumables

### Decided

- **Start button** opens Inventory.
- HUD shows an "Item / Consum HUD (scroll)" in the bottom-left of the
  game viewport with a scrollable indicator.

### Open questions

- **What items exist?** Health potions? Quest items? Special-recharge
  items? TCG-flavored consumables (e.g., "gem of SPC")?
- **Slot count:** how many items can the inventory hold? Stack sizes?
- **Quick-use vs inventory:** the HUD shows ONE item slot visible at a
  time with a scroll indicator. Is this a quick-use slot? How does
  the player swap which item is in the slot? D-pad while inventory
  HUD is focused?
- **Activation:** which button uses the currently-selected item? Long-
  press? An unmapped button (X/Y are still reserved)?
- **Pickup:** how do items enter inventory? Chest opens? Enemy drops?
  Overworld pickups?

### Notes

- The "scroll" annotation on the schematic is important — it implies
  the HUD shows ONE item at a time, with left/right or up/down scroll
  to cycle. Needs an input mapping for the scroll action.

---

## 7. Party / Character swap

### Decided

- HUD shows a "RZ" badge at the bottom-center of the game viewport.
- Below the RZ badge: "3/9" — current character index out of party size.
- **Tapping the RZ badge swaps the active character.**

### Open questions

- **Party size:** "9" suggests 9 characters. Is this fixed? Roster-
  defined? Does it match the 42-card TCG roster (Codex), or is it a
  subset?
- **Swap behavior:** does tapping cycle to the next character? Open a
  party-select menu? Cycle through a defined order?
- **Per-character state:** each character has their own health? SPC?
  Inventory? Or is state shared?
- **Per-character specials:** does each character have unique Special
  1 / Special 2 / Ult? If so, this is a major architectural decision
  — combat moves are tied to the active character.
- **Per-character sprite sheet:** does each character have their own
  combat sheet? The current sheet (`animation_combat_player.png`)
  shows a specific blue-haired character. Other party members would
  need their own sheets.

### Notes

- "RZ" = Rizing? Reference to the TCG brand. The active character is
  presumably a Rizing Power.
- The Codex notes "42 cards in roster" but doesn't specify which 9
  would be playable as overworld characters. Open question.

---

## 8. Weapon HUD

### Decided

- HUD shows a weapon-icon area at the bottom-right of the game viewport.
- Annotation: "Weapon HUD (applies to ammo/melee)."

### Open questions

- **What does "applies to ammo/melee" mean?** Possibilities:
  - One HUD that shows EITHER the current ranged-weapon ammo OR the
    current melee weapon's durability, depending on what's equipped.
  - The HUD shows a count that's consumed by both ranged (ammo) and
    melee (durability) uses.
- **Weapon swapping:** which input changes weapons?
- **What weapons exist?** Schematic doesn't list a weapon roster. The
  sprite sheet shows fists, a sword, a small blaster, and a heavy
  gauntlet — are these the weapon roster, or just the move animations
  for one fixed loadout?
- **Ammo refill:** chests? Pickups? Time?

---

## 9. Chest system

### Decided

- Three chest tiers: **Wood**, **Silver**, **Gold**.

### Open questions

- **Where do chests spawn?** Static positions in regions? Random?
  After defeating enemies?
- **Loot tables:** what's in a Wood vs Silver vs Gold chest? Items?
  Currency? SPC refills? Cards?
- **Opening interaction:** A button when adjacent? Currently the
  schematic's A is overloaded (punch / region-transition / UFO /
  chest-open).
- **Visual representation in the world:** chest sprites? Are there
  assets for these already?

### Notes

- The existing code has `obj_chest1.png` through `obj_chest4.png` in
  the assets folder (visible from the GitHub screenshot earlier).
  Possibly 1=Wood, 2=Silver, 3=Gold, 4=??? Or completely unrelated.
  Worth verifying when chest work starts.

---

## 10. HUD toggle (double-tap Menu)

### Decided

- Double-tapping the Menu button hides the on-screen HUD overlay.
- Double-tapping again restores it.
- Question mark on the schematic ("Double tap menu = no HUD?")
  suggests this is a *proposed* feature, not locked.

### Open questions

- **Confirm this feature is wanted at all?**
- **What's the double-tap window?** Same 250ms as combo timing?
- **Conflicts with Menu's single-tap (open hub modal):** how do we
  distinguish? Single-tap commits AFTER the double-tap window, like
  the B-button debounce in the muddy-animation fix.

---

## 11. Existing systems (already in code)

These exist and work; they will need to coexist with the new layers
above. Listed here for completeness — not part of the build.

- **D-pad input** (Fix 1 — Nov 2026 alignment patch applied)
- **Drag-to-turn between D-pad arrows** (Fix 2)
- **Walk / Run / Fly mode state machine** (B-button single-tap / hold /
  double-tap; muddy-animation debounce applied)
- **A button: region transition / UFO interaction** (will need to
  coexist with Punch — see Section 1 priority decision)
- **Menu modals: Hub, Map, Pause, Aethryx** (X↔Select / Y↔Start swap
  applied: Select opens Map, Start opens Pause)
- **Region transitions** (north / south / central)
- **UFO / Aetherstride interaction** (A button at adjacent UFO)
- **Walk / Run / Fly sprite slicing** with chroma-key flood-fill
  (precedent for combat sheet slicer)

---

## 12. Build order (proposed)

Each phase is its own session. After each phase, playtest before
proceeding.

1. **Phase A — Combat input layer.** A → punch action, B → kick action,
   ABA → sword, BAB → blaster. Console-log only at first, no animation.
   Verify combo detection works in isolation.
2. **Phase B — Combat sheet slicer.** Load and slice
   `animation_combat_player.png`. Chroma-key the gray background. Skip
   the label region. Produce 5 frame sets × 4 frames each.
3. **Phase C — Combat animation rendering.** Wire combat actions to
   the renderer. Combat sprite plays from the combat sheet, locks
   facing direction, allows movement during animation.
4. **Phase D — HUD overlay (visual only).** Draw Health bar, SPC HUD,
   Item HUD, RZ badge, Weapon HUD at their positions. Static values,
   no state.
5. **Phase E — Specials (L / R / L+R).** Wire shoulders to special
   animations. Add SPC pool with regen.
6. **Phase F — Inventory modal.** Start opens a new modal with item
   slots. Stub data.
7. **Phase G — Party swap.** RZ badge tap-handler. Stub party roster.
8. **Phase H — HUD toggle.** Double-tap Menu hides HUD.
9. **Phase I — Chests.** Three tiers. Wires to A-button context.
10. **Phase J — Enemies + damage + health.** The big one. Far future.

---

## 13. Risks

- **B-button conflict.** B is currently run/fly toggle AND kick. Two
  systems compete for the same input. Must resolve before code.
- **A-button overload.** A is currently region-transition + UFO + (new)
  punch + (new) chest-open. Priority order must be defined.
- **Sprite-sheet directionality.** Combat sheet is right-facing only.
  Mirroring works for left-facing, but up/down will look stretched or
  wrong without proper sprites.
- **Performance.** Adding 5 new animation states × directional mirror
  variants × HUD redraw on every frame could degrade FPS, especially
  on mobile. Need to profile after Phase C.
- **Spec drift.** This document is the single source of truth. If
  design decisions are made mid-build that aren't reflected here, the
  doc becomes stale and Phase G might contradict Phase B. Discipline:
  update this doc *before* writing code that introduces a new decision.

---

## 14. Glossary

- **SPC** — Special / Stamina pool resource. In Expedition: depletes
  with special use, regens over time. In TCG (Codex): cost concept
  with house rule "free, no gems required."
- **RZ** — Rizing? Badge that indicates active character. Branding tie
  to *Rizing Powers TCG*.
- **Ult** — Ultimate. L+R simultaneous trigger.
- **HUD** — Heads-up display. The four on-screen overlays (Health,
  SPC, Item, Weapon, RZ badge).
- **Combo** — A→B, A→B→A, or B→A→B sequence with each tap ≤ 250ms
  from the previous.
- **Special Attack 1 / 2** — L / R shoulder triggers. Distinct from
  combo-input specials (Sword Swing / Blaster Shot).

---

## Change log

- **2026-05-12:** Initial draft from schematic + sprite sheet upload.
  All Section 1 controller bindings decided. All other sections have
  significant open questions.
