# RP7D — The 5 Core Combat Stats (implementation V1)

| Stat | Kind | Rizer base | +per AP | What it does in RP7D |
|---|---|---:|---:|---|
| HP — Health Points | resource | 200 | +20 | Damage he survives. 0 = knocked out. |
| ATK — Attack | attribute | 80 | +4 | Physical damage (fists, kicks, weapons), against the target's DEF. |
| DEF — Defense | attribute | 60 | +6 | Reduces incoming physical damage. Doesn't add HP. |
| STA — Stamina | resource | 150 | +15 | Dodges, runs and physical techniques. Not speed. |
| SP — Special (Astral) | resource | 100 | +10 | Astral energy capacity. Every Astral technique costs SP. |

AP (Astral Points) are earned per Level and spent in Zyphone › Focus › Attributes (X-ray Rizer). Mods: Iron Core
+50 HP, Heavy Hands +12 ATK, Arc Fists ×1.3 finishers, Second Wind +4 HP/s.

## Damage

```
physical = power × ATK / 80 × (100 + 60) / (100 + DEF)
```

- 80 / 60 are Rizer's base ATK / DEF. A base Rizer against a standard foe (ATK 80, DEF 60) hits exactly as every
  move was tuned, so raising ATK or DEF moves the game away from a known baseline.
- Rizer → foe: `dealt(power, foe.def, finisher)`. Each Seer type has `atk` / `def` (seers.js), defaulting to 80 / 60.
- Foe → Rizer: `taken(power, foe.atk)` in `rizer.hurt`. It covers every attacker: Seers, Nova, Penumbra,
  Scanobots and the Thardin rifle. Blows were authored against the old 100-HP scale, so they are ×2 (`HP_SCALE`).
  With HP doubled, a base Rizer takes the same share of his bar per hit as before. Health fruit and prayer
  healing are scaled the same way.

## The SP decision: capacity only

SP only sets how much Astral energy Rizer has. It doesn't scale Astral damage, and neither do ATK or DEF.
Each technique's damage and SP cost are separate numbers (`ASTRAL` in astral.js, `STORM` in astral-storm.js), so
each one can be balanced on its own:

| Technique | SP cost | Damage |
|---|---:|---|
| Astralthunder | 30 | 6 (+3 splash) |
| Astralift | 18 | — |
| Astralburst | 40 | 5 (edge 3) |
| Rolling Thunder | 36 | 3 → 8 explosion |
| Astralclap | 35 | 2 strike + 4 impact (+2 per body) |
| Astralspin | 40 | 1 / tick + 2 at the end |

There are no separate Magic Attack or Magic Defense stats. If Astral damage ever needs to grow with the character,
add a per-technique level (learned through Lightbulbs) rather than tying it to SP.

Code: `developer/astral-stats.js` (BASE, STATS, statOf, dealt, taken).
