# Rizing Powers of Zyraxis — Chapter I Flow (LOCKED)

> **Purpose:** the first level sets up the whole game. This doc is the canonical spine of the Chapter I experience. Any change to the early-game flow updates this file first, then the code, then the memory note (`rizing-powers-story.md` V2.9 block).
>
> **Baseline:** V2.10.3 · commits `7f32601` (story) · `edff117` (controls) · `e7e2555` (houses) · `7aa01b1` (audit)

---

## 0 · Chapter framing

- **Player role:** you are a **Rizer** — a trainer of **Zyrex** — on your birthday, in your family home in **Malezor · Beastlands**, the outdoor "first level" of Zyraxis (district I of X).
- **Antagonist canon:** the three **Seers** (Ael'Tharion, Orryx, Ophira) are hiding after striking once. Their **grunts** are scattered across Malezor hiding evidence of where the three leaders went.
- **Player objective this chapter:** **find all three clues** to where the Seer leaders are hiding. That is *it* for Chapter I. Gemlord fights, district hopping, the 9v9 endgame — all mid-to-end game content, deferred.
- **Locked constraints:**
  - **NO Gemlord battles.** Rakoron's cave is sealed by ruby glyphs. `startBossEncounter` is dead code until unsealed.
  - **NO district travel.** Only Malezor + interiors are on the map.
  - **NO stat/system rebuild.** Dual-type math, per-Zyrex baseline gem, tier=maxLv, 10 statuses, walk-through doors, speed order all locked from prior versions.

---

## 1 · Boot sequence (title → world)

| # | Beat | Handler | Exit condition |
|---|---|---|---|
| 1.1 | Title screen | `#title-screen` · Mothergem shard emblem + gradient logo | Click **Begin** or press `Z / A / Enter` |
| 1.2 | Character creator | `#creator-screen` · name input (max 12) + Boy / Girl / Seer | Both fields set → **Begin the Awakening** |
| 1.3 | Narrator prologue | 10 pages · gold Roman numeral + dot indicator | `Z / A / Enter / →` advances; `X / B / Esc` skips |
| 1.4 | Auto-enter House | `startHometownIntro()` → `enterMap('home_interior', 2, 2, 'down')` | Auto-fires after prologue |
| 1.5 | Wake dialog | 5 lines · "Talk to Mom and Dad. Then walk out." | Player has control on close |

**Locked:** every new game routes through 1.1 → 1.5. Continue-from-save routes straight to whichever map the save recorded (usually still 1.5 if the player hasn't left yet).

---

## 2 · Inside the House (`home_interior`, 14 × 9)

Map layout:

```
==============
=............=
=.b..........=  b = bed (rest + gem floor 20)
=............=
=..m.....d...=  m = Mom (2, 4)   d = Dad (8, 4)
=............=
=..t.........=  t = table (decor)
=......x.....=  x = door out to Malezor (6, 7)
==============
```

### 2.1 · Mom the Nurse (`m` at 2, 4)

- **First interact:** hands over the **supply pack** — `+2 Potions · +2 Gemspheres`. Toast fires. `metMomGave = true`.
- **Recurring interact:**
  - Any Zyrex hurt → **full-party heal** (HP + clear statuses).
  - Everyone fresh → **+1 Potion** as a road gift.
- **Locked role:** Mom is the nurse. She is the only free heal in the game.

### 2.2 · Dad the Historian / Expeditionist (`d` at 8, 4)

- **First interact:** paragraph of **Mothergem cosmology** ("before every age of Zyraxis, the Mothergem falls / ten shards become the ten Gemlords / every Zyrex is a shard of it too"), then opens the **starter picker**.
- **Starter picker options:** Cinderant (Beast/Spirit · Southern), Otterlin (Beast/Nature · Eastern), Volitimite (Beast/Aura · Western). All Lv 5, Tier I max stats.
- **After choice:** Dad's expanded briefing — admits he doesn't know where the Seer leaders are, points at Yara / Jax / Quinn as clue sources, tells the player the cave is sealed.
- **Recurring interact:** reports the current clue count (`0/3` → `3/3`), reminds the player the cave stays sealed.
- **Locked role:** Dad is the historian. He gives the starter. He never becomes the nurse.

### 2.3 · Bed (`b` at 2, 2)

- Rest → full HP heal + gem pouch topped up to floor of 20 (legacy safety net). Can be used any time, no cost.

### 2.4 · Door out (`x` at 6, 7)

- **Gate:** blocked with a "not yet — talk to Dad first" dialog until `game.player.party.length > 0`.
- **Once starter picked:** walking onto `x` fires "You step out onto the Malezor path" + Mom's farewell + `enterMap('malezor', 3, 5, 'down')` — just south of the family home.

**Locked house flow:** Wake → Mom (supplies) → Dad (lore + starter) → Door. The door refuses to open until Dad has been talked to. Order between Mom and Dad is flexible.

---

## 3 · Malezor Overworld (30 × 20)

Top-of-screen HUD strip: **location · gems ◈ · coins ¢ · clues ⚑ N/3 · party N/8** + `?` and hamburger.

### 3.1 · Landmarks by tile char

| Char | Landmark | Behavior |
|---|---|---|
| `H` | Family Home door (3, 4) | Walk in → `home_interior` (6, 7). `h` tiles above = roof. |
| `M` | Mothergem shrine (15–16, 2) | Interact → cryptic 6-line hint about the three leaders |
| `S` | Merchant (19, 4) | Interact → shop |
| `B` | Merchant stand booth (18, 5) | Interact → shop (same as `S`) |
| `C` | Cave to Rakoron (29, 7) | Interact → **SEALED** dialog. No battle wired. |
| `p` | Bronze Cottage door (18, 3) | Needs `bronze` key. Walk in → auto-loot on first entry. |
| `q` | Silver Lodge door (13, 13) | Needs `silver` key. Walk in → auto-loot on first entry. |
| `K` | Chest × 9 | Interact → one-shot loot (gems / coins / potions per table) |
| `N` | Myara — trainer (5, 6) | Challenge → 2-Zyrex fight → clue drop |
| `Y` | Yara — Seer scout (12, 4) | Beat → **OPHIRA clue** (parchment) |
| `J` | Jax — rival trainer (18, 7) | Beat → **AEL'THARION clue** + **Bronze Key** |
| `Q` | Quinn — wanderer (13, 14) | Beat → **ORRYX clue** + **Silver Key** |
| `G` | Tall gemgrass | 14% encounter chance per step (2-step cooldown) — wild Zyrex from pool |
| `T` | Tree / rock | Blocker · decorative |
| `W` | Water | Blocker |
| `,` `.` | Path / crystal-sand | Walkable |
| `#` | Gemcliff | Blocker (map border) |

### 3.2 · Wild encounter pool (Tier I Basics · v10.22 codex)

Frostwisp · Sandskitter · Verdanix · Flarepaw · Dunechitter · Barkchitter · Aurarat · Torchpuff · Pebblequil.

Each rolled at Lv 3–8 depending on the species. Every wild Zyrex is bindable via a Gemsphere (see shop).

### 3.3 · The three Seer clues (the whole point)

| Trainer | Reward | Clue text (paraphrase) |
|---|---|---|
| Yara (Seer scout) | Clue only | Torn parchment: *OPHIRA · Wild March · fifth ridge · listen for the choir* |
| Jax (rival Rizer) | Bronze Key + Clue | Cottage rumor: *AEL'THARION crossing the Northeast Hydroplane at dusk* |
| Quinn (desert wanderer) | Silver Key + Clue | The dunes' memory: *ORRYX went south — into the Pit of No Return* |
| Myara (soft prompt) | Softer clue | *"NORTHMARCH stones cast shadows they shouldn't"* — bonus flavor, not one of the 3 |

`game.player.seerClues[NAME] = true` gates each drop to one-time. **HUD badge `⚑ N/3` tracks progress**. NPC trainers wander their 5×5 patrol, sight-cone triggers `!` alert + auto-engagement.

### 3.4 · Merchant stock (`S` / `B`)

| Item | Price | Effect |
|---|---|---|
| Astralite Gem | 1¢ | Adds 1 to shared gem pool |
| Potion | 5¢ | Adds 1 to items.potion (heals 40 HP outside battle) |
| Gemsphere | 10¢ | +1 gemsphere (binds a wild Zyrex mid-battle) |

### 3.5 · Locked-house loot (first entry only)

- **Bronze Cottage** — `+8 ◈ · +2 Potions · +15 ¢`
- **Silver Lodge** — `+15 ◈ · +3 Potions · +40 ¢ · +1 Gemsphere`

---

## 4 · Battle rules (locked stack)

- **Turn order:** highest `stats.spd` acts first; ties → player. Only **one move per Zyrex per turn**. If the first hit KOs the target, the second doesn't fire.
- **Baseline gem:** every Zyrex gets **1 free gem per move** at cast time. A1 (cost ≤ 1) is always usable. Extras cascade: baseline → `r.gems` (equipped in Bag) → `player.gems` (shared pool).
- **Dual-type math:** `typeMult(atk, def1, def2)` stacks per Cardmaster — 4× / 2× / 1× / 0.5× / 0.25×.
- **Stat math:** every card = maxed at Lv (tier × 10). Linear scale 25% → 100%. Cannot level past cap.
- **10 statuses:** 5 debuffs (Overcook / Undershock / Brainlock / Gridfreeze / Souldrift) + 5 buffs (Reforge / Ignite / Slipstream / Bulwark / Astralwake). Ticks each turn.
- **Rewards per win:** XP (`max(5, defeatedLv * 6)`) + gems (`1 + floor(defeatedLv / 4)`) + coins (`2 + floor(defeatedLv / 3)`). NPC-trainer defeats add clue drops (§3.3) and key drops for Jax / Quinn.
- **Full-party KO:** respawn at family home tile (3, 5) south of `H`; party is mended and the "wake in the observatory" line fires.

---

## 5 · Chapter I close condition

- Chapter I officially closes once **`Object.keys(game.player.seerClues).length >= 3`**.
- Dad's recurring dialog switches to *"All three names on the trail. Pick one and go."*
- Player still free-roams. **No forced transition out of Malezor yet.** Chapter II will build one of the three district hooks (Wild March / Northeast Hydroplane / Pit of No Return).

---

## 6 · Controls (locked)

**Semantics:**
- `Z / Enter / Space / A` → **confirm · interact · accept**
- `X / Esc / Backspace / B` → **back · close · cancel · menu toggle**
- `WASD / ↑↓←→` → walk / navigate

Every screen respects this. Overlays own the controller — the player character does not move while any overlay is up.

**Full keymap** lives in the in-game Controls modal (open with `?` or `F1`) — see `/RIZING_POWERS_UX_HANDOFF.md` §6 for the source-of-truth spec.

---

## 7 · State model summary (persisted per save)

```js
game.player = {
  x, y, dir, step, moveCd,
  name, gender,
  party: [], box: [],           // Zyrex (up to 8 active)
  gems, gemspheres, coins,
  items: { potion },
  keys: { bronze, silver },
  housesLooted: {},
  seerClues: {},                // Chapter I mystery-hunt progress
  respects: [],                 // reserved for mid-late game (Gemlord ladder)
  chestsOpened: {},
  npcsDefeated: {},
  mapId,                        // 'home_interior' | 'malezor' | 'bronze_cottage' | 'silver_lodge'
  metMomGave,
  seenHometownIntro, seenEndgame,
}
```

**Do not read `respects.length` for early-game logic** — it will stay 0 forever this chapter. Use `Object.keys(seerClues).length` instead.

---

## 8 · Explicit non-goals for Chapter I

- No Gemlord battles (Rakoron sealed).
- No district travel (only Malezor + 3 interiors).
- No 9v9 endgame.
- No evolutions (evolveTo/evolveLv fields are data-only, not wired to trigger).
- No item shop expansion beyond gem / potion / gemsphere.
- No new NPC trainers beyond the four (Myara + Yara + Jax + Quinn).
- No mini-boss layer.
- No lore-fragment collectible.

These land in Chapter II or later. Keep Chapter I tight.

---

## 9 · Change management

**When updating Chapter I:**
1. Edit this file first.
2. Edit `/rizers.html` next.
3. Bump the memory note `rizing-powers-story.md` if the story shifts.
4. Run the beat-presence audit (`grep -E 'startHometownIntro|interactMom|interactDad|NPC_CLUES|hud-clues'` etc.) to confirm every beat still resolves.
5. Sanity-check every MAP row is still 30 chars.

**When touching mid-late-game content:** leave this doc alone. Chapter I is not the place for it.
