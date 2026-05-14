# AOV™ Saga · Viridian Expedition — Master Handoff

**Single source of truth. Replaces all prior handoffs.**
**Last updated:** May 13, 2026 — end of session (combat systems + companion + HUD + asset polish)
**Paste this into a new chat to continue.**

---

## 1. Where we left off

**Currently uncommitted in working tree** (push as ONE commit):
- Hurt animation (5-frame red-flash reaction triggered on damage)
- Fire flame re-slice v3 (correct band y=422-601, vivid purple)
- Faction NPC follow toggle (one companion, natural pursuit AI)
- Reset Game option in Options modal
- Loading title centered on mobile (`text-align: center; width: 100%`)
- games.html full-row tap targets (whole `<li>` is clickable, not just title)
- HUD strip-down (player panel + objective panel + gem counter all `display: none`)
- Idle stance face-forward (uses `ASSETS.playerIdle` from new character_player.png)
- Potion shrunk to half size (POTION_W 14→7, POTION_H 20→10)
- Game renamed: "Viridia Expedition" → "Viridian Expedition" (planet "Viridia" preserved)
- character_player.png wired as idle pose 0 sprite (ASSET_SPECS.playerIdle, crop 259,109,503,760)
- Run sheet LEFT/RIGHT clipping fix (frameW 230→320, CHAR_W_RUN 56→80, RUN_OFFSET_X 12→24)

**Suggested commit title:** `feat+polish: hurt anim, fire fix, follow, reset, HUD strip, idle, potion, rename, run trail`

---

## 2. Active systems (all working as of this session)

### Combat
- Punch (Y, costs 1 energy), Kick (X, costs 2), Sword combo Y→X→Y (costs 4), Blaster combo X→Y→X (costs 4)
- Energy gate blocks actions silently when insufficient
- Hurt animation: 5 frames at 80ms each (`hurt_f0..f4.png`), restarts every hit, top render priority
- Invuln window: 1500ms after each hit (visual reaction is 400ms, i-frames continue silent for 1.1s more)

### Defense
- Astral Force Field (B-hold past 350ms threshold) — channels with sliced animation
- Block channeling regenerates +1 energy/sec, ignores spend-delay gate
- Idle nap pose (after 45s stillness, idlePose === 3) regens +1 energy/sec — full restore in 15s

### Movement
- Walk (default), Run (B-tap toggle, 1.5×, hoverboard sprite), Fly (B-double-tap toggle, 2.5×, drains 0.1 energy/sec)
- Run sprite re-baked Dec 2026 with frameW=320, CHAR_W_RUN=80 to fix LEFT/RIGHT trail clipping
- Fly auto-drops when energy hits 0
- Energy regen: +1 per 2s after 3s of no spending

### Survival HUD
- 10 hearts top-center (red/grey pips, beat-pulse animation when at full HP)
- 10 energy bolts directly below hearts (yellow/grey pips)
- Pip sizes: heart 16×14, bolt 11×16 (bumped Dec 2026 for mobile readability)
- HUD positions: `.hud-hearts top: 6.9%`, `.hud-energy top: 9.6%` (overlay on game canvas)
- Player name chip / objective panel / gem counter all hidden via `display: none !important`
- Reset Game button at bottom of Options modal (red-tinted, confirm guard)

### Loot
- 4 chests scattered in central region: c1 (8,10), c2 (26,11), c3 (12,28), c4 (30,26) — all tile coords
- Tier 1 = R/B common, Tier 2 = G/Y, Tier 3 = W/O, Tier 4 = P/Blk legendary
- Open chest spawns 1-5 random gems around it; auto-collect on player walk-over
- 8 gem colors with tier credits: R=10, B=20, G=40, Y=80, W=160, O=320, P=640, Blk=1080
- Astralpack modal shows per-color counts + total credits readout
- Potions: clickable in Astralpack to consume → +1 heart (clamped to hpMax)

### Companion (faction NPCs only — Voltyran/Eurakeon/Aurexion/Elzoran)
- Modal button at bottom of NPC info: `Make Companion` / `Stop Following` / `Make Companion (replaces current)`
- One follower at a time, auto-swap on selecting another
- Pursuit AI: keep-range 36px, catch-up speed 1.6× when >96px, teleport reset at >280px
- Region sync every frame so companion follows across transitions
- Combat aid + archetype passives (battle/gem-find/healing) NOT YET wired — framework only

### Regions
- Central (grass + town + 4 chests)
- North (snow)
- South-Central (6 fire hazards in tile coords: 7,9 / 18,12 / 11,20 / 22,24 / 5,25 / 16,6)
- South (lava + tombstones)
- HQ Courtyard (faction headquarters)

### Hazards
- Fire (south-central only): purple flame, 7-frame anim at 8fps, hitbox 14×18 anchored to flame base
- Player overlap → playerTakeHit(1)

---

## 3. Files

### Working folder
`/Users/mctherockstar/Documents/GitHub/AOV-saga-new/`

### Main game file
`expedition.html` — single-file game, ~250KB, all CSS/JS/HTML inline

### Assets baked this session
- `hud_heart_red.png`, `hud_heart_grey.png` (24×22)
- `hud_bolt_yellow.png`, `hud_bolt_grey.png` (14×22)
- `hud_gem_R/B/G/Y/W/O/P/Blk.png` (16×20)
- `world_gem_R/B/G/Y/W/O/P/Blk.png` (14×18)
- `hazard_fire_f0.png` … `hazard_fire_f6.png` (32×32, vivid purple after re-slice v3)
- `obj_chest1_sprite.png` … `obj_chest4_sprite.png` (32×32)
- `hurt_f0.png` … `hurt_f4.png` (32×45, white-bg chroma keyed)
- `character_player.png` — UPDATED by user, used as idle pose 0 portrait

---

## 4. Backlog / next session

**Wave A (small, fast):**
- Combat aid for follower (basic auto-attack on nearby enemies)
- Archetype passives (Voltyran=battle bonus, Eurakeon=gem-find, Aurexion=healing, Elzoran=??)
- Re-surface objective tracker inside pause/menu modal (currently hidden from HUD)
- Save/load actual implementation (currently just a Save hub item, no backing logic)

**Wave B (medium):**
- Game over screen + respawn-to-UFO instead of soft auto-revive on hp=0
- Region-specific enemy waves (currently mori_1, daemon_1, khronis_boss are placed but not actively combative)
- Fire hazard variants for other regions (lava splash for south, snow patches for north?)

**Wave C (larger):**
- Inventory expansion (more consumables beyond potions)
- Quest system / objective state machine
- Multi-player follower (party of 2-4 instead of just 1)

---

## 5. Conventions locked in this session

- **One-line commit titles only**, format `area: what changed`
- Use `polish:`, `feat:`, `fix:`, `chore:`, `rename:` prefixes
- Backups go in `backups/YYYY-MM-DD_HHMM_<label>/` if needed
- Atomic patches via Python `try/except` with assertion on `str.replace` count==1
- GitHub Desktop is the deploy tool — `rm .git/index.lock` if it complains
- Netlify auto-deploys on push to `main`

---

## 6. Open process notes

- Session limit hit ~90% as we wrapped — saved this handoff before timeout
- All changes syntax-validated with `node -e "new Function(...)"` per patch
- Computer use (screenshots from user's phone) is the primary feedback loop for UI fixes
- User uses both desktop Chrome and iPhone for testing — desktop renders different aspect ratios
