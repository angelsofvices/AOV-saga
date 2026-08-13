# ◈ Rizing Powers V7 · Master Control Sheet
*Cross-referenced against `rp7b.html` v0.95.272 — every input path, every device, every conflict.*

---

## 1 · Canonical Actions

Every physical input in the game — keyboard, gamepad, or mobile touch — resolves to one of these canonical "keys." The game code reads only these. Rebinds and remaps translate physical → canonical.

| Canonical | Action | Notes |
|---|---|---|
| `x` | Interact / pickup / open door / talk NPC / chest / confirm | Primary "do it" |
| `a` | Cross alias · confirm / menu-select | Gamepad Cross fires this |
| `z` | Confirm (menu alt) | Alternate confirm |
| `enter` | Confirm (menu alt) | Alternate confirm |
| `b` | Cancel / dodge / back / hold-sprint | Multi-purpose |
| `escape` | Cancel / back | Menu escape |
| `shift` | Sprint (hold) · **double-tap = sprint lock** | 400 ms window |
| `j` | **A1 · Punch** (light melee · 25 dmg) | Free |
| `k` | **A2 · Kick** (heavy melee · 50 dmg) | Free |
| `l` | L1 alias · weapon-wheel scroll · **also A3/A4 astral modifier** | ⚠ conflict |
| `r` | R1 alias · cycle mount / wheel | |
| `q` | L2 alias · quests menu · **also chord modifier** | Held for A3/A4 |
| `i` | R2 alias · Auraxion phase-flight when soul-switched | Reassigned on mobile |
| `1` | Main menu / SELECT / weapon-wheel assign | |
| `2` | Pause / Touchpad · RHUD-FHUD-MAP overlay | |
| `3` | Options → **Zycellite Z-Phone** | Was "settings" · phone hosts it |
| `4` | Bag / inventory | |
| `` ` `` (backtick) | **PANIC RESET** — force-close every modal, unfreeze player | Emergency escape hatch |
| `arrowup/down/left/right` | Movement | |
| `w a s d` | Movement alt | ⚠ `a` also fires Cross |
| `backspace` | Reset selected keybind (in Controller Bindings panel) | |
| `tab` | Weapon wheel scroll alt | |
| `f8` | (Legacy F8 escape) | Reserved |

**Chord combos**
- `q + j` → **A3 · Astralstrike** · 75 dmg · 10 ◆
- `q + k` → **A4 · Astralkick** · 100 dmg · 20 ◆ · 5×5 AOE

---

## 2 · PS5 DualSense (via `navigator.getGamepads`)

Auto-detected in Chrome/macOS. Buttons re-dispatch synthetic `KeyboardEvent`s, so the game code never has to care whether input came from keyboard or pad.

| Physical | Dispatches | Game Action |
|---|---|---|
| **Cross (×)** | `a` | Interact / confirm |
| **Circle (○)** | `b` | Cancel / dodge / hold-sprint |
| **Square (□)** | `j` | A1 Punch |
| **Triangle (△)** | `k` | A2 Kick |
| **L1** | `l` | Party menu / weapon-wheel scroll |
| **R1** | `r` | Cycle mount / weapon-wheel scroll |
| **L2** | `q` | Quests / **chord modifier for A3+A4** |
| **R2** | `i` | Auraxion phase-flight (soul-switched only) |
| **Create (SELECT)** | `1` | Weapon-wheel assign / main menu |
| **Options** | `3` | Open Zycellite Z-Phone (was settings) |
| **Touchpad click** | `2` | RHUD-FHUD-WORLD MAP overlay |
| **L3 click** | *(direct handler)* | **Sprint toggle** (edge-triggered) |
| **R3 click** | *(direct handler)* | **Toggle S1 ↔ S2 form** |
| **D-pad ▲▼◀▶** | Arrow keys | Movement |
| **Left stick** | Arrow keys past 0.35 deadzone | Movement |

**Chords** — hold L2 + tap Square = A3 · hold L2 + tap Triangle = A4.

**Haptics** — DualSense rumbles on hit / kill / boulder crumble via `GamepadHapticActuator` (`dual-rumble` mode).

---

## 3 · PC Keyboard (rebindable via Options → Controller Bindings)

All 15 rebindable actions are listed in the Controller Bindings panel. The capture-phase remapper translates physical → canonical before any game handler sees the event.

| Action | Default | Notes |
|---|---|---|
| Interact | `x` | Primary "do it" |
| Confirm (menu) | `z` | Alt of Enter |
| Cancel / Dodge | `b` | Also `escape` works globally |
| A1 · Punch | `j` | Light melee |
| A2 · Kick | `k` | Heavy melee |
| A3/A4 Modifier (L2) | `l` | Hold + `j` = A3 · Hold + `k` = A4 · ⚠ collides with L1 canonical `l` |
| Sprint (hold / double-tap toggle) | `shift` | 400 ms double-tap window |
| Main Menu | `1` | |
| Pause | `2` | |
| Z-Phone | `3` | Was "Options settings" · phone now hosts it |
| Bag / Inventory | `4` | |
| Move Up | `w` | Arrows always work as fallback |
| Move Down | `s` | |
| Move Left | `a` | ⚠ `a` also fires as Cross alias |
| Move Right | `d` | |

**Fixed keys (NOT rebindable · would break the game if changed)**
- `` ` `` — PANIC RESET
- Arrow keys — always movement
- `enter` — always confirm
- `escape` — always cancel
- `backspace` — reset selected keybind in the panel

---

## 4 · Mobile Controller (`#mobileCtrl2` · portrait touch only)

Portrait-viewport-gated (coarse pointer + no hover + portrait + ≤780 px). Each button dispatches a synthetic keydown for its canonical key — except R2 (special).

| On-screen | Dispatches | Game Action |
|---|---|---|
| **L2** | `q` | Chord modifier (hold with □/△) |
| **L1** | `l` | Weapon-wheel scroll |
| **R1** | `r` | Weapon-wheel scroll |
| **R2** | *(direct call)* | **Toggle S1 ↔ S2 form** (mobile has no R3) |
| **D-pad ▲▼◀▶** | Arrow keys | Movement · **drag-tracker** swaps direction without lift |
| **△ Triangle** | `k` | A2 Kick |
| **□ Square** | `j` | A1 Punch |
| **○ Circle** | `b` | Cancel / dodge |
| **× Cross** | `a` | Interact / confirm |
| **Touchpad** (center) | `2` | RHUD-FHUD-MAP overlay |
| **SELECT (left of home)** | `1` | Main menu |
| **START (right of home)** | `3` | Z-Phone |
| **RHUD tap** (top-right frame) | *(direct call)* | **Toggle S1 ↔ S2 form** (redundant with R2) |

**Mobile-only chords** — L2 + Square = A3 · L2 + Triangle = A4. Hitboxes recalibrated in v0.95.264 to sit on the drawn art, and widened +1–2 % for combo reliability.

**Not shown on mobile** — desktop-only `#hud` (TILE counter) and `#padStatus` (PRESS ANY BUTTON pill).

---

## 5 · ⚠ Known Conflicts / Interference

These are the things to fix or intentionally accept.

### ✅ Resolved in v0.95.273

1. **~~`a` — Cross alias vs. WASD moveLeft~~** → FIXED
   Cross now dispatches `x` (was `a`). WASD moveLeft continues to work on plain `a` because gamepad no longer sets `keys['a']`. Astralslam chord updated to accept both `keys['x']` and `keys['a']` for backward compat.

2. **~~`l` — L1 vs. A3/A4 astral modifier~~** → FIXED
   `KEY_DEFAULTS.astralMod` retargeted from `l` to `q` so the Controller Bindings panel actually maps the key the game reads. Bumped localStorage key `rp7b_keybinds_v1` → `v2` to invalidate stale saves.

3. **~~`q` — L2 alias vs. quests menu opener vs. astral chord~~** → NOT A CONFLICT
   Investigation showed plain `q` in the overworld does nothing (the `BTN[6]` comment was outdated). L2 = `q` = astral chord modifier only. No fix needed; comment corrected.

### 🟡 Soft conflicts (intentional or benign)

4. **R2 dual meaning**
   - Desktop DualSense R2 → `i` → Auraxion phase-flight when soul-switched
   - Mobile on-screen R2 → direct `togglePlayerSkin()` (mobile has no R3)
   Same button, different actions per platform. This is intentional (mobile has no R3) but users who play mobile + desktop will context-switch. Consider labeling on the mobile pad art.

5. **RHUD tap-to-swap-form (mobile) vs. RHUD click-to-open-detail-panel (desktop)**
   Same widget, two behaviors — intentional per platform. No conflict, but noted for consistency awareness.

6. **`3` — was settings, now Z-Phone**
   Legacy Options mapping. Settings now lives *inside* the Z-Phone as an app tile. If anyone remembers `3 = settings`, they'll be greeted by the phone. Not a bug, but a mental-model migration.

7. **`shift` — sprint hold vs. sprint lock toggle**
   Same key: hold = sprint · double-tap in 400 ms = toggle sprint lock. Users mashing shift accidentally toggle-lock — usually the desired UX but worth flagging.

8. **`b` — Circle / cancel / dodge / hold-sprint**
   Four meanings depending on context (menu open? overworld? holding for sprint?). Context-gated properly today but any new UI that reads `b` needs to respect current mode.

### 🟢 Fixed / rebind-blocked (safe)

9. **Backtick `` ` `` — PANIC RESET is deliberately not rebindable** and blocked from the Bindings panel to prevent lockout.
10. **Meta / Ctrl / Alt / ContextMenu** — blocked from rebinding for the same reason.

---

## 6 · Modifier Rules & Timings

| Rule | Value | Where |
|---|---|---|
| Sprint double-tap window | 400 ms | Shift double-tap OR L3 double-click |
| Chord grace | Same keydown frame | L2 + Square / L2 + Triangle |
| Gamepad axis deadzone | 0.35 | Left stick + R3 |
| Haptic hit-confirm | dual-rumble strong/weak per mode | Chrome desktop DualSense only |
| Panic reset scope | ALL modals + freezes | Backtick, any scene |
| Portrait mobile threshold | width ≤ 780 px, portrait, coarse pointer, no hover | Mobile controller show gate |
| Mobile Test Mode override | `?mobile=1` URL OR `window.__forceMobilePortrait = true` | Dev bypass for desktop testing |

---

## 7 · Suggested Cleanup (not yet done)

1. **Rebind moveLeft default off `a`** — pick `arrowleft` or a non-alias key
2. **Rebind astralMod default off `l`** — pick a dedicated modifier
3. **Delay quests-menu on `q` keyup** so the chord takes priority
4. **Add mobile R2 label overlay** on the pad art ("FORM")
5. **Print keybinds inside the pause menu** so players can see live mappings

---

*Sheet snapshot: RP7B v0.95.272 · 2026-08-12*
