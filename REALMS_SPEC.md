# Prototype 6 — Realms

A 2D action game shipping at `/realms.html`, single-file like the other prototypes. Two modes selectable from the title screen, both 2D HTML5-canvas based, both pulling from the AOV™ Saga roster.

> Status: Design locked v1. Skeleton lands in P6 (this task). Adventure ships in P6.1. Tournament ships in P6.2. Polish in P6.3+.

---

## 1. Modes

### Mode A — Adventure *(side-scroller, Mario-style)*

- **Hero:** Solion (player avatar). Reuses Solion sprite + walk animation + Everflame sword from Expedition Prototype 4 so the universe stays continuous.
- **View:** 2D side-scrolling, camera follows player.
- **Mechanics:** run, jump, sword attack, take damage, knock-back.
- **Collectibles:**
  - **Astralites** (gold, primary pickup, scores points)
  - **HP shards** (red, restore +1 HP)
  - **Gem crystals** (purple, count toward bonus)
- **Enemies:** patrol-AI minions pulled from low-tier v1 cards. Level 1 features:
  - Grimhog (charging brute)
  - Floravex (stationary spitter)
  - Drakaryx (flier)
- **Goal:** reach the **Astral Portal** at the end of the level.
- **Completion screen:** astralites collected / time / HP remaining → score.
- **Lives:** 3 lives, one mid-level checkpoint, game-over screen offers retry / quit.
- **Level 1 theme:** Viridia (green/lush, ref art exists).
- **Level data:** stored as a 2D tile array so additional levels (1-2, 1-3, World 2-1) plug in by swapping the array.

### Mode B — Tournament *(2D fighter, Mortal Kombat-style)*

- **Roster at launch:** 2 fighters — **Solion Highreach** (Tier V Apex · Aura / Humanoid-Noid) vs **Kravos Dragonsong** (Tier V Apex · Beast / Unknown-Void).
- **Art:** pixel-art placeholders (colored rectangles + name label) until proper fighter sprite sheets arrive.
- **Arena:** single side-view 2D map at launch.
- **HUD:** HP bars top of screen, character portraits, round counter (best of 3).
- **Moves:**
  - **A1 — Light** (free, fast, low damage, no status)
  - **A2 — Heavy** (slower, moderate damage, can proc status)
  - **A3 — Special** (slowest, big damage, status proc + screen-shake + glow VFX)
  - **Block, Jump, Dash** (basic fighter movement)
- **Damage formula:** mirrors the TCG — `ATK × move-multiplier × type-mult × (1 − DEF/1000)`, rounded up, min 1. Keeps the rule system consistent across prototypes.
- **Status effects:** A3 can proc Overcook/Brainlock/Gridfreeze/Souldrift/Undershock as visible debuff overlays.
- **Win condition:** drop opponent HP to 0 in **2 of 3 rounds**.
- **Sub-modes:**
  - Vs CPU (AI opponent, difficulty TBD)
  - Vs Player (hot-seat, same device, mirrored controls)

> **Balance flag:** Solion vs Kravos is type-asymmetric — Solion hard-counters Kravos in raw matchup math. AI difficulty will compensate for the placeholder build. Final balance pass should either pick a more neutral launch pair OR give Kravos a signature that ignores type modifiers.

---

## 2. Shared infrastructure

- **Engine:** HTML5 canvas, single file, requestAnimationFrame loop with fixed timestep (60 FPS render target).
- **Resolution:** 960×540 internal canvas (16:9) scaled to fit viewport.
- **Title screen:** two mode cards (Adventure / Tournament) matching the Cardmaster v3.5 Mode A / Mode B visual pattern.
- **Pause menu:** Esc / Start opens overlay with Resume / Restart / Quit to Title.
- **Settings:** volume, controls remap (later).
- **Persistence:** localStorage for high scores (Adventure) and tournament wins.
- **Controls (default):**
  - Adventure: ← → move, ↑ jump, Z attack, X interact, Esc pause
  - Tournament P1: A/D move, W jump, S block, J light, K heavy, L special
  - Tournament P2 (hot-seat): ←/→ move, ↑ jump, ↓ block, 1 light, 2 heavy, 3 special
  - Mobile: on-screen touch buttons (later)

---

## 3. File structure

```
realms.html                   # the single-file game
assets/
  character_player.png        # Solion (reused from P4)
  animation_walk_player.png   # walk cycle (reused from P4)
  animation_idle_solionsword_on.png   # sword-equipped idle (reused from P4)
  ref_viridia_*.png           # level reference art
  fighter_solion_placeholder  # TBD sprite sheet
  fighter_kravos_placeholder  # TBD sprite sheet
REALMS_SPEC.md                # this doc
```

---

## 4. Ship order

1. **P6 — Skeleton:** title screen + mode select + canvas + state machine. Each mode opens to a "Coming next" screen. Linked from games.html.
2. **P6.1 — Adventure Level 1:** Solion side-scroller fully playable end to end (collect, defeat, reach portal, completion screen).
3. **P6.2 — Tournament:** Solion vs Kravos placeholder build, full round flow (intro → fight → KO → round result → match result), Vs CPU + hot-seat.
4. **P6.3 — Polish pass:** SFX, music, particle effects, screen-shake tuning, better placeholder art if no sprite sheets yet, balance pass.

---

## 5. Open questions for the next pass

- Final name: `realms` works as a placeholder. Could also be `ascent.html`, `arena.html`, `chronicles.html`, etc.
- Adventure: what does Solion's attack look like at L1? Sword swing (Everflame from P4) or starter punch?
- Adventure: HP system — discrete hearts (3) or a regenerating bar?
- Tournament: should A3 cost gems like in Cardmaster, or always-available with a cooldown?
- Tournament: round timer cap (30s, 60s)? Sudden-death if both alive at timeout?
- Both modes: music — license-free chiptunes for now, or wait for original score?

These are all polish-stage decisions — the v6 skeleton can ship without them locked.
