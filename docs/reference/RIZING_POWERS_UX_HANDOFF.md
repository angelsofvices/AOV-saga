# Rizing Powers of Zyraxis — UX Handoff for UI Design

> **From:** Claude (UX / systems / engineering)
> **To:** Claude Design (visual UI)
> **Version:** V2.4 (as of shipped commit `6168db3`)
> **Live URL:** https://angelsofvices.com/rizers
> **Source:** `/rizers.html` (single-file HTML + inline CSS + inline JS)
> **Platform target:** Web (Chrome/Safari/Firefox desktop). Mobile app port planned; keep this in mind for touch parity but do not design mobile-first.

---

## 0 · What Design should return

For every screen listed in **Section 4**, please deliver:

- **Static PNG/SVG comps** at desktop native (game stage renders at 720 × 504, sitting inside a 1440×900 site frame)
- A **companion mobile comp** at 390 × 844 (iPhone base) for the same screen — same layout logic, adjusted density
- **Interaction annotations** on top of each comp (hover states, focus states, hit targets, animation intent)
- **A component sheet** — buttons, badges, HP bar, XP bar, status chip, dialog box, toast, sprite frame, chest, tile — extracted as a reusable atlas
- **Type/color tokens** — the exact CSS-variable names and values you want us to adopt (I will replace the current tokens 1:1)
- **Do NOT** hand over inline HTML; give me the visual truth and I will implement it in a single-file update pass

If any of these are outside your normal scope for the round, mark that section "Deferred to R2" and I'll build a shim in the meantime.

---

## 1 · Product concept in 60 seconds

**Rizing Powers of Zyraxis** is an open-world creature-collector set on **Zyraxis**, the ninth planet of the Aethryx Expanse and one of the anchor worlds of the AOV Saga.

- **You are a Rizer** — a trainer. It's your birthday. Your mom and dad give you your first **Zyrex** (creatures) as a birthday gift and you set out to earn the respect of all **10 Gemlords** who rule the Ten Districts of Zyraxis.
- **You do not kill Gemlords.** You bind their frequency and gain their respect. The final Gemlord is **Oatheus the Ultralord**; besting him makes you **The Conqueror of Gemlords**.
- **The 10 Districts** are hard canon (I → X): Malezor → Zarvane → Andrannor → Veridan → Netharion (center, unstable) → Vorashil → Xilnar → Baelgor → Thardun → Korathen.
- **Every card in the codex is the maxed-out state of that Zyrex at Lv (tier × 10).** Tier I Basics cap at Lv 10. Tier VIII Immortals cap at Lv 80. Tier X Gods cap at Lv 100.

**Tone:** cinematic saga (Cinzel display + Cormorant Garamond body) meeting retro-JRPG readability (VT323 pixel for HUD numbers). Look at the rest of the site (`/`, `/saga.html`, `/codex.html`, `/aethryx.html`) to feel the AOV world's visual grammar: dark void backgrounds, gold/mist accents, procedural starfield, glass panels, gemstone glows.

---

## 2 · Design constraints & platform

| Constraint | Value | Why |
|---|---|---|
| **Platform** | Web now, iOS/Android app later | Single-file HTML today; native shell later |
| **Framework** | Zero — vanilla HTML/CSS/JS single file | Site policy for game prototypes |
| **Stage size** | 720 × 504 px (aspect 20:14) at desktop; scales fluid via `min(96vw, 720px)` | Tile-grid math: 20 cols × 14 rows × 36 px tiles |
| **Tile size** | 32 px logical, canvas is pixel-perfect (image-rendering: pixelated) | Retro grid feel |
| **Sprite rendering** | 100% procedural canvas (no PNGs yet) | I can hand-swap procedural for illustrated later |
| **Fonts** | Cinzel (display), Cormorant Garamond (body), Inter (meta/HUD labels), VT323 (pixel numbers) | Locked; Design may propose an addition but not replace |
| **Color tokens (current)** | `--void #050310` `--gold #e8c878` `--gold-bright #f5dc9c` `--ivory #f3ecdc` `--mist #b8aec8` `--emerald #2fe6a8` `--violet #b87cff` `--crimson #ff5c5c` | Design may repalette; keep dark UI, saturated accent |
| **Save** | localStorage key `aov-rizers-v1` | Single save slot for now |
| **Menu** | Hamburger drawer top-right, same as all other saga pages | Site-wide consistency |

**Explicit non-goals for this round:**
- No dark-mode/light-mode toggle. Only dark.
- No login. Save is anonymous local.
- No multiplayer UI. Single-player only.
- No in-app purchase surface. Free game.

---

## 3 · Existing visual language (reference)

Design should adopt/extend, not replace:

- **Backdrop** — layered radial-gradient starfield, twin drifting star layers, faint grain. See `/rizers.html:.stars` and `.cosmos` on `/aethryx.html`.
- **Glass panels** — `background: rgba(20,12,38,0.75)` + `1px solid rgba(232,200,120,0.28)` + subtle shadow. Used for HUD badges, dialog box, party slots.
- **Typography scale** — display: 1.6–4.2rem Cinzel; body 0.95–1.18rem Cormorant; meta 0.6–0.75rem Inter letter-spaced 0.32em; HUD numbers 17–22px VT323.
- **Accent glows** — every clickable card gets a hover glow of its type/element color (existing pattern lives on `/index.html`'s Archive Navigator cards and `/aethryx.html` planet cards).

Please open the following canonical pages before drawing anything: `index.html`, `saga.html`, `aethryx.html`, `codex.html`, `zyraxis.html`, `games.html`. These define the AOV visual truth.

---

## 4 · Screen inventory (design these)

### 4.1 · Title screen
- **Purpose:** entry point.
- **Content:** logo lockup `RIZING POWERS`, subtitle `Of Zyraxis`, tagline (existing copy: *"Nine Gemlords sleep sealed in the deep gemcliffs. One still walks. Tonight, the Mothergem hums again — and a shard is looking for you."*), two CTAs: **Begin** (primary gold) and **Continue** (secondary, greyed if no save), keyboard hint strip at bottom.
- **UX notes:** initial focus is Begin. Keyboard: `Enter`/`Space` = Begin, `C` = Continue, `Esc` opens hamburger menu.
- **Currently:** procedural stars behind, gradient-clipped gold text logo. Please redesign the logo lockup with a real emblem.

### 4.2 · Character creator
- **Purpose:** set trainer name + gender.
- **Content:** eyebrow `Chapter I · The Awakening`, prompt `Who Are You?`, italic quote from Astromancer Lyra, name input (max 12 chars, auto-uppercase), three gender option cards (Boy / Girl / Seer) each with a tiny procedural avatar preview showing that gender's accent color, Begin CTA (disabled until name + gender chosen).
- **UX notes:** Focus lands in name input. `Tab` moves to gender group; arrow keys walk between Boy/Girl/Seer. `Enter` submits. Selected gender card gets a golden glow.
- **Currently:** avatar previews are canvas-drawn 40×40 chibi figures. Design can propose richer avatars but must be renderable in 40–96 px on the fly (each gender has body primary + accent).

### 4.3 · Narrator prologue
- **Purpose:** deliver the 10-page world backstory.
- **Content:** Roman numeral (I–X), single-sentence body in italic Cormorant, dot progress indicator (10 dots), Next / Skip buttons.
- **UX notes:** `Space`/`Enter`/`→` = next. `Esc` = skip. `←` = previous (currently not implemented — please spec if you want it). Body fades in on each page (200ms).
- **Currently:** working but very plain. Design: consider a subtle animated background pulse per page (calm on page I, escalating tension on VII when Corefall is described, calm again by X).

### 4.4 · Hometown auto-scene → Starter picker
- **Purpose:** Mom/Dad birthday scene → pick starter Zyrex.
- **Content:** dialog box drives the narrative; when Dad says "Choose", the starter grid overlays. Three cards side-by-side (Cinderant / Otterlin / Volitimite): sprite (72×72 procedural), name in Cinzel, type badge, one-line flavor.
- **UX notes:** Hovering a card raises it 4px and glows its type color. `1`/`2`/`3` selects each starter; `Enter` on hover confirms. `←`/`→` walk between cards.
- **Currently:** functional. Design: give the starter picker a "choose your bond" moment — maybe the card the player is hovering hums (pulse + glow tick).

### 4.5 · Overworld
- **Purpose:** main exploration surface (grid map).
- **Content:**
  - **Top HUD strip** (3 badges): location `Malezor · Beastlands`, gems `◈ 10`, respects `◉ 0/10`, party `Party 1/6`.
  - **Tile canvas** below — 20 × 14 grid with these tile kinds: gemcliff (`#`), path (`,`), tall gemgrass (`G`), tree/rock (`T`), water (`W`), home dome (`H`), cave mouth (`C`), NPC trainer (`N`), Mothergem shrine (`M`), chest (`K`).
  - **Player character** on top layer (~24 × 24 chibi, gender palette).
- **UX notes:** movement is grid-snapped (one tile per input). Hamburger menu top-right for site nav. Dialog box slides up from bottom when triggered.
- **Currently:** all tiles are procedural. Design: propose an illustrated tile atlas OR keep procedural but tighten the palette per district. Netharion (V) should look glitchy/anomalous; Xilnar (VII) should look ghostly; Korathen (X) should feel divine.
- **CRITICAL:** the overworld is where players spend the most time. Prioritize this screen.

### 4.6 · Dialog box (overlay on overworld)
- **Purpose:** all in-world speech (Mom, Dad, Myara, Rakoron, narrator lines at shrine).
- **Content:** glass panel bottom-margin 12px, VT323 22px text, blinking `▾` in corner to advance.
- **UX notes:** `Space`/`Enter`/`Z` advances. Click also advances. Multi-line messages queue and step one line per input. Some dialogs end with a callback (open starter picker, start battle, heal party).
- **Currently:** works but very utilitarian. Design: consider speaker portraits — Mom / Dad / Lyra / Myara / each Gemlord.

### 4.7 · Battle scene
- **Purpose:** turn-based 1v1 combat.
- **Content (4 quadrants):**
  - **Top-left: enemy status card** — name, `Lv 13·II`, HP bar, status chip if any.
  - **Top-right: enemy sprite** — 96×96 procedural, facing player.
  - **Bottom-left: player sprite** — 96×96 procedural, facing away.
  - **Bottom-right: player status card** — name, `Lv 5·I`, HP bar, `HP 38 / 92   ◈ 10`, XP bar + `XP 12 / 52`, status chip.
- **Bottom action strip** — battle log (single line VT323) + 2×2 button grid.
  - Root menu: FIGHT / ZYREX (switch) / BAG / RUN.
  - FIGHT submenu: 4 moves (name, `◈cost`, `type · power` line). Each move button hoverable, disabled if not affordable.
- **UX notes:** all actions clickable OR keyboard: `1–4` picks action row, `F/Z/B/R` = Fight/Zyrex/Bag/Run, arrow keys walk buttons, `Esc` = back.
- **Effects wanted:** flash + shake on hit target, damage number popup, super-effective/devastating text pop, faint gold aura when a boost is applied, red aura on a debuff.
- **Currently:** functional and readable. Design: tighten hierarchy — the enemy should feel dominant top-right; the player smaller bottom-left. Add real move-cast animations (a shape sweeping across the field, tinted by move type).

### 4.8 · Party screen (opened via X)
- **Purpose:** party management + Rizer inspect.
- **Content:** header `Your Zyrex` + close button. 2×3 grid of party slots. Each slot: 48×48 sprite, name, `Lv N · Card Tier N · Type · HP N/N`, HP bar, "Tap to inspect →" hint.
- **UX notes:** clicking a slot opens **Rizer inspect overlay**.

### 4.9 · Rizer inspect overlay
- **Purpose:** deep-dive on a single Zyrex.
- **Content:** name header, close button. Body sections:
  1. Row list: Level (`5 · Tier I`), Card Tier (`I · maxes at Lv 10`), Type (`Spirit/Beast`), HP, ATK, DEF, SPD, SPC.
  2. Progress: XP bar + `12 / 52 XP → Lv 6` OR `MAX LEVEL for Tier I`.
  3. Status (if any): chip + description.
  4. Moves — 4 boxes, each: name + type + power + gem cost + status-inflict chance.
- **UX notes:** `Esc` closes. Scroll if content overflows.
- **Currently:** functional plain-text lists. Design: turn this into a proper "codex card" view — the Zyrex sits large on the left, stats on the right, moves at bottom. Think trading-card layout.

### 4.10 · Menus + toasts
- **Hamburger drawer** — same pattern as all saga pages. Home / The Saga / Timeline / Aethryx Expanse / The Codex / Games links, plus socials.
- **Small toast** (top-center, e.g. `MUTARYN · RESPECT EARNED 1/10`) — glass panel with gold border.
- **XP toast** (large center overlay after victory) — `VICTORY / <Zyrex name> / + 30 XP · + 3 ◈`. Fades in, holds ~2s, fades out.

---

## 5 · State machine

```
title ─┬─► creator ─► prologue ─► overworld (hometown auto-scene ► starter picker) ─► overworld
       └─► continue (load save) ────────────────────────────────────────────────────► overworld

overworld ─┬─► dialog (blocks input; ends returns to overworld OR triggers battle)
           ├─► battle (turn loop; ends returns to overworld)
           ├─► party (X key; opens overlay; ESC closes)
           │      └─► inspect (click slot; ESC closes)
           └─► hamburger menu (top-right; site nav)
```

Every state transition should be visually motivated. Design: propose the transition treatments (dialog slide, battle wipe, party fade, inspect zoom).

---

## 6 · Controls — full PC input map (design MUST surface these somewhere)

### 6.1 · Keyboard

**Global (any state):**
| Key | Action |
|---|---|
| `Esc` | Back / close current overlay / open hamburger from title |
| `M` | Toggle music (future; wire the key now, sound later) |

**Title / Character creator / Prologue:**
| Key | Action |
|---|---|
| `Enter` / `Space` | Confirm primary |
| `Tab` | Cycle inputs / buttons |
| `1` `2` `3` | Pick gender (creator) or starter (picker) |
| `←` `→` | Walk options in a row |

**Overworld:**
| Key | Action |
|---|---|
| `W` / `↑` | Walk north |
| `A` / `←` | Walk west |
| `S` / `↓` | Walk south |
| `D` / `→` | Walk east |
| `Z` / `Space` | Interact with facing tile (chest, NPC, cave, shrine, home) |
| `X` | Open party |
| `Esc` | Open hamburger (site nav) |

**Battle:**
| Key | Action |
|---|---|
| `1` / `F` | FIGHT |
| `2` / `Z` | ZYREX (switch) |
| `3` / `B` | BAG (Gemsphere) |
| `4` / `R` | RUN (wild only) |
| `1`–`4` inside FIGHT | pick move slot |
| `Esc` / `Backspace` | back to root menu |
| `Enter` / `Space` | advance dialog / confirm |

**Party / Inspect:**
| Key | Action |
|---|---|
| `↑` `↓` `←` `→` | walk party slots (2×3 grid) |
| `Enter` / `Space` | open inspect for selected |
| `Esc` | close overlay |

**Dialog:**
| Key | Action |
|---|---|
| `Enter` / `Space` / `Z` / click | advance line |

### 6.2 · Trackpad / mouse

- **Left-click** any UI element → activate it (menus, buttons, party slots, dialog advance, chest / NPC / cave interact).
- **Left-click on overworld canvas edges** → walk in that direction (implemented: 3×3 zones — outer 8 zones walk, center zone interacts).
- **Left-click on overworld center** → interact with facing tile.
- **Hover** any interactive element → highlight glow. Design: define hover elevation (currently `translateY(-4px)` + type glow).
- **Right-click** → currently reserved. Design may propose using it for a quick-info tooltip on tiles/party slots.
- **Scroll wheel** → currently unused. On the inspect overlay, please spec scroll as expected. In the overworld it should do nothing (grid movement is not scrollable).

### 6.3 · Show the controls somewhere

The title screen already has a bottom-strip: *"Move · Arrow Keys / WASD · Interact · Z / Space · Menu · X / Esc"*. Please redesign this strip and also add:
- A `?` icon in the top-HUD that opens a controls modal
- The controls modal contains the full table above (grouped by state)

---

## 7 · Type system + status taxonomy (visual)

**The 10 types** (canonical, Cardmaster + codex):
Aura · Beast · Creature · Extraterrestrial · Humanoid-Noid · Nature · Tech · Spirit · Ultramax · Unknown-Void

Each needs:
- A **type badge color** (currently: Aura #f5dc9c, Beast #c98a4a, Creature #8bc466, Extraterrestrial #5fa8ff, Humanoid-Noid #e8c878, Nature #2fe6a8, Tech #a0b8d8, Spirit #b87cff, Ultramax #ff5c5c, Unknown-Void #6b5a8a). Design may repalette these — please deliver a swatch sheet.
- A **type glyph** (small 12×12 icon) — Design deliverable
- A **type long-form icon** for battle-cast animation (128×128 hero shape) — Design deliverable

**Dual-type badges** — many Zyrex are `Beast/Spirit` etc. Design: show as a two-color split badge, not two separate badges.

**The 10 statuses** (symmetric 5 debuffs + 5 buffs):

| Debuff | Color (current) | Buff | Color (current) |
|---|---|---|---|
| Overcook (HP DoT) | `#ff8a6a` | Reforge (HP regen) | `#2fe6a8` |
| Undershock (ATK−) | `#b08bff` | Ignite (ATK+) | `#ff9c66` |
| Gridfreeze (skip 1) | `#6fa3e8` | Slipstream (SPD+) | `#5fa8ff` |
| Souldrift (all decay + drain) | `#ff5a5a` | Astralwake (SPC+) | `#f5dc9c` |
| Brainlock (A1 only 2 turns) | `#c98ee8` | Bulwark (DEF+) | `#8bc466` |

Each needs a small icon (16×16) and a color chip. Design deliverable.

**Tiers** — the 10 codex tiers use Roman numerals I–X. Design: propose a "tier crest" — a small vertical badge showing `Tier VIII / Immortal` with a distinct visual per class (Basic, Core, Champion, Legend, Apex, Pseudoimmortal, Immortal, Demigod, God).

---

## 8 · Component atlas expected

Please deliver each of these as a design component with spec:

1. **Buttons** — primary, secondary, ghost, danger, disabled. Sizes: L (CTA), M (menu), S (action-btn in battle).
2. **HP bar** — three states: green (>50%), gold (>25%), red (≤25%). Includes gradient direction and animation for damage tick.
3. **XP bar** — blue→violet gradient during progress, gold when MAX.
4. **Status chip** — colored border + colored text, buff variant vs debuff variant.
5. **Type badge** — single-type and dual-type variants.
6. **Dialog box** — bottom-anchored, blinking advance indicator, optional speaker portrait slot.
7. **Toast** — small (top-center) and large (mid-screen victory).
8. **Sprite frame** — the glass frame around a Zyrex portrait for party slots + inspect.
9. **Party slot** — full component (empty state, healthy, KO'd, selected).
10. **Chest tile** — closed sparkle + open state.
11. **Rizer character** — 4-directional walk cycle spec (currently static; you may commission animation frames as PNGs and I'll wire them, OR keep procedural but with a bob/wobble animation).
12. **Hamburger drawer** — extend the existing pattern with any new items.

---

## 9 · Data available to UI (for hover cards, tooltips, etc.)

Every Zyrex object at runtime carries:
```js
{
  species: 'cinderant',
  name: 'CINDERANT',
  type: 'Spirit', type2: 'Beast',   // dual-type
  lv: 5, xp: 12,
  hp: 38, maxHp: 38,
  stats: { hp: 38, atk: 38, def: 38, spd: 38, spc: 40 },
  moves: [ { name, type, power, cost, status?, statusChance? }, ... ],
  status: { key: 'overcook', turns: 3 } | null,
  atkStage: 0, defStage: 0,  // -4 to +4
}
```

Every species carries: `name, type, type2, region, tier, base (max stats), catchRate, shape, sprite (palette), moves, evolveTo?, evolveLv?`.

Every Gemlord in the roster carries: `id, name, epithet, type, type2, district, land, status ('available'|'locked'|'missing'), note?`.

Ask for any additional fields you need for a tooltip — I'll add them.

---

## 10 · Mobile / app transition (design constraints for later)

We WILL port this to iOS and Android inside 12 months. Please design with these in mind so we don't paint into a corner:

- **All hit targets ≥ 44 × 44 px** even in the current desktop comps.
- **Bottom-third of screen must remain thumb-reachable** on mobile. Design should propose an alternate battle layout (all action buttons collapse into a bottom sheet on mobile).
- **No hover-only affordances.** Every hover state must have an equivalent tap/focus state.
- **Portrait-first** on mobile (aspect 9:19.5). Overworld will letterbox top+bottom; battle stacks vertically (enemy top, player bottom, actions bottom sheet).
- **Text scales** — target readability at 320 dp width.
- **Consider a "TCG-card mode" flip** for the inspect overlay — long-press or double-tap flips the card to show back-side lore. This is a nice-to-have for later.

---

## 11 · What is NOT locked

Design has full freedom on:
- Emblem/logo for RIZING POWERS
- Any icon design (types, statuses, tiers, HUD)
- Speaker portraits for named NPCs
- Move-cast animation styles
- Whether we render sprites procedurally or swap to illustrated PNGs (please propose)
- Whether type badges are chips, tags, gems, glyphs, or all four
- Whether the game gets a custom cursor
- Whether we adopt a subtle rotation/parallax on the overworld background

**Design does NOT touch (locked by writer/eng):**
- Fonts (Cinzel / Cormorant / Inter / VT323 are canon)
- Canonical names, epithets, tier system, type list
- The 10-district structure of Zyraxis
- The stat math rule (card = max at Lv (tier × 10))
- The controls-key mapping (may add, may not remove)

---

## 12 · Delivery checklist

- [ ] Title screen — desktop + mobile comps
- [ ] Character creator — desktop + mobile
- [ ] Prologue page (with example pages I, VII, X)
- [ ] Hometown scene + Starter picker
- [ ] Overworld — full stage with all 10 tile kinds shown
- [ ] Dialog box (with + without speaker portrait)
- [ ] Battle scene (idle, cast animation, victory)
- [ ] Party screen (all 6 slots states)
- [ ] Rizer inspect (Tier I Basic + Tier VIII Immortal examples)
- [ ] Hamburger drawer refresh
- [ ] Toasts (small + large XP)
- [ ] Component atlas
- [ ] Type palette + glyph set (10 types)
- [ ] Status icon set (10 statuses)
- [ ] Controls modal design
- [ ] Color/type-token spec I can drop into `:root`

---

## 13 · Reference: what's currently on angelsofvices.com

- `/rizers` — the running game (V2.4). Load it. Play through a full loop: begin → creator → prologue → hometown → starter → walk to gemgrass → wild fight → open party → inspect → visit shrine → visit Myara → cave → Rakoron.
- `/` — home page (Archive Navigator style)
- `/saga.html` — the macro arc page
- `/aethryx.html` — the 28-planet greater cosmos
- `/codex.html` — the master archive (this is where our Zyrex + Gemlord canon lives)
- `/zyraxis.html` — the planet page with the 10-district roster

Everything lists the same visual grammar. Please stay inside it.

---

## 14 · Questions expected back from Design

Please respond with:
1. What extra data fields do you need on the runtime objects?
2. Do you want to move to illustrated PNG sprites, or keep procedural?
3. Any font addition proposals (esp. for retro pixel numerics)?
4. Do we split the hamburger menu into an in-game pause menu + a site-nav menu (currently combined)?
5. Preferred asset delivery format (PNG @2x/@3x, SVG, Figma link)?

Once I get comps back I'll estimate implementation time per screen and start pushing UI patches into `/rizers.html`.

— Handoff generated 2026-07-10 · V2.4 baseline · commit `6168db3`
