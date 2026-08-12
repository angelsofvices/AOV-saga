# ◈ Rizing Powers · BETA V7.4.15 · Playtest is LIVE ◈

*RP7 · Gamedex v4 · Codex v15 · The AOV Saga*

The beta is open. Boot it, break it, tell me what's wrong.

**Playtest → [YOUR URL HERE]**
Best on **Chrome (desktop / macOS)** with a **DualSense** paired over USB or Bluetooth. Keyboard works too.

---

## ⚔ Combat — the full 4-attack canon is live

- **A1 · Light** (Square / J) — free punch · 25 dmg · yellow hit ring
- **A2 · Heavy** (Triangle / K) — free kick · 50 dmg · orange hit ring
- **A3 · Astralstrike** (**L2 + Square**) — palm-blast handblast · **75 dmg** · costs 10 Blue Diamond ◆ · traveling projectile w/ wavy 3-tile spread perpendicular to travel · 5-tile trail damage + extra tiles of projectile flight · full blue starburst BOOM on impact · new dedicated kill splat
- **A4 · Astralkick** (**L2 + Triangle**) — bicycle-kick AOE · **100 dmg** · costs 20 Diamond · **5×5 omnidirectional damage zone** centered on Rizer · red starburst bloom lands under his flip · Powerful Anime Kick sting
- **Dodge** (Circle / B) — full 2-tile roll · 3-rapid-dodge combo triggers Barrel Roll bonus

**Enemy deaths animate now** — **Mori crumbles to stone**, **Daemon melts to fire** (dedicated 4-frame sheets). Alien-stomach splat plays on any astralstrike/astralkick kill.

**Every hit** confirms with a colored ring (yellow A1 / orange A2 / blue A3 / purple A4), plays SFX, and vibrates the DualSense via `GamepadHapticActuator` with escalating strong/weak magnitudes. Kill / hurt / boulder-crumble get their own dedicated haptic pulses.

**Enemy HP canon** — Mori 125 HP · Drainer 175 HP · Daemon 250 HP · pick multiples of 125 for future enemies.

---

## 🌍 World

- **Three districts** wired: **Malezor** (starter · lush) · **Zarvane** (desert midlands) · **Andrannor** (NW oasis) with proper terrain transitions and per-district Zyrex spawn pools
- **Rakoron's Cave** entrance + stairs merged into one composed prop with correct Z-stacking
- **Auraxion's UFO** sealed at (11, 175) — unlocks post-Part-1 for interstellar travel · UFO landing SFX on interact
- **Boulders** across Malezor Wild + Rakoron path — 9 HP each · A1 = 1 dmg, A2 = 2 dmg, A3 explodes them, crumble anim + SFX on final hit
- **Chests** — 1-100 coins + weighted gem drops · **punch or kick to open** · **PvP loot-trap system**: close an empty chest back with punch/kick, hide, ambush the next player who opens the "fresh" chest
- **Broadcast towers** in every district · Myara interview · +150 R.XP · 10/10 achievement
- **World Map** item · full-screen viewer
- **Player home** is walk-through (no X-press) · applies to all future purchased property

---

## 🌤 Dynamic sky

**DAYLIGHT** is a 3-layer parallax cloud stack with real cloud PNG sprites:
- HIGH clouds barely parallax (distant cirrus, faint blue-gray shadows)
- MID clouds are the main visible drift (world-locked cumulus)
- FG wisps pass in front of Rizer for true depth

**Per-district opacity** — Malezor 0.25 (starter calm) · Zarvane 0.50 · Andrannor 0.75 (thickest oasis cover). Dense-fill stacked layering with no visible sheet edges.

**NIGHT** = deep-blue ambient with player lantern punch-out + registered light sources at every town-hall doorway.

---

## 🎣 Fishing / harvesting / crafting

- **Foraging** — punch bushes for berries, trees for fruit · **harvest bonus grants seeds too** · astralite-charged plants give bonus yield · district multipliers (Andrannor gives the most)
- **Fishing** at Zarvane Oasis — 5-second minigame · X icon flashes at a random moment · press X within 1 second = Soulphish caught (14% basic net rate) · Fae Net swing anim plays over the water
- **Verdant Elixir** — one recipe, three payment paths: **30 berries OR 15 fruits OR 250 seeds** · fully restores Rizer HP · yields 50 seeds on use
- **Celestryx** — 100 FAE + Science Table = 1 Celestryx summon (T6 max-tier · Level 60/100 · Gamma-line terminal form)
- **Fae collecting is FAENET-gated** — visit **Kaizari** to receive the Fae Net · without it fae stay on the ground

---

## 🧬 Companion & bond system

- **Bond gate** — any friendly NPC becomes a companion at bond ≥ 100
- Companion follows in flight sheet animation
- Zyrex party system + Give Elzoran dev preset (T5 dragon Zyrex, Novarian survivor)
- **Rizer Bond** grows via guitar sessions in Rizer Room · scrollable song list · 4-frame guitar loop while playing

---

## 🏠 Rizer Room (your home base)

Enter through the walk-through door · every prop is interactive:
- **Bed** — sleep to heal · triggers **Dream video** (Dreamland sleep-realm sequence · Blue-Gem vision plane · gates Ultimate Amp Form)
- **Rizer TV** — main-quest tracker + Movie Collection browsable UI
- **Science Table** — Experiment panel · Verdant Elixir + Celestryx recipes
- **Nebuladock 9000** — mass-inventory PC · tabbed browser (Bag / Devices / Store / Zyrex) · Z-Phone claimable in Devices tab
- **Nebulaport 3000** gaming console — plays through full sheet
- **Gaming chair** — sit down, spin, ride
- **Guitar + Amp** — song library · plays Beat It Solo + more · +Rizer Bond
- **Punching bag** — practice punch/kick with hit registration + achievement tracking
- **Cosmetic closet** *(stub)* — unlocks include Fury Fist (100 punches) + more coming

---

## 🎮 Controls (DualSense · Chrome-on-Mac target)

- **D-pad / stick** — move · **L3** — sprint toggle
- **Cross (X)** — interact · **Circle (B)** — dodge / cancel
- **Square** — punch · **Triangle** — kick
- **L2 + Square** — Astralstrike (A3)
- **L2 + Triangle** — Astralkick (A4)
- **L1 / R1** — weapon wheel scroll
- **Options** — settings / pause
- **Touchpad** — main menu
- **R3** — weapon wheel

Keyboard mirror + mobile skin 1 controller both supported.

---

## 🎬 Cinematic

- Full title intro video with hold-X skip and 33-second auto-menu-reveal
- Pregame splash art on "press any key"
- Splash music quiet-until-first-gesture
- BGM hard-stops on scene swap
- Dream video plays full 7.22s on bed sleep

---

## 🧪 What I need from you

This is a **live playtest beta** — I'm collecting:
1. Anything that crashes or black-screens
2. Combat feel — is the 5×5 A4 zone too big/small? Diamond costs right?
3. Cloud opacity per district (Malezor 0.25 / Zarvane 0.50 / Andrannor 0.75) — feel natural or off?
4. Chord ergonomics — L2+Square and L2+Triangle · comfortable or awkward?
5. Any sprite rectangle edges visible (clouds, projectiles, hit FX)
6. Anything that just feels off

Screenshot / clip and tag me.

---

## Canon anchors

- **BETA V{game}.{gamedex}.{codex}** = 7 (RP7 Rize of Power) · 4 (Gamedex v4) · 15 (Codex v15)
- **Sync invariant**: Codex − Gamedex = 11 · always
- **Gem canon** — 🔴 Red = ATK/Body · 🔵 Blue = DEF+SP/Brain · 🟣 Purple = Spirit/Soul (late-game reveal)
- **RHUD meters** — ◆ Diamond fuels A3+A4 magical · ⚡ Lightning = stamina fed by FAEDUST · ❤ HP = food-restored

---

**Ship it. Break it. Report back.**

— The Creator · AOV Saga
