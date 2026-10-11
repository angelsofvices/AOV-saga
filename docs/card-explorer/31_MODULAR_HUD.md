# 31 · Modular HUD and Health

*Survey 10.32 · 2026-10-11 · Source: "AA:1936 — Modular HUD System V1.0", with the layout update and "HUD V1.1 — Default Layout Locked"*

## Layout (default)

| Module | Position | What it shows |
|---|---|---|
| **Aethren** | Top-left | Companions with Carl, each with a portrait and HP bar. `AETHREN n/9`, or "No companions with you." |
| **Health** | Top-right | Carl's HP, 0 to 100 |
| **Air** | Top-right, beside Health | Breathable oxygen |
| **Suit** | Top-right, beside Air | Shield, which absorbs damage first |
| **Utility** | Bottom-left | The equipped utility, its charge or cooldown, and △ cycle · □ use. "No utility equipped" when none is |
| **Minimap** | Bottom-right | The surroundings in the field (known ground, landmarks, foes, Carl). In a cave, the cave row ahead and behind |

The NAV button stays at the top centre, so AstraNav works as before. The HUD and RESET buttons sit under it.

The old status bar is retired. Its information moved: Suit and Air gauges to their modules, the utility block to the Utility module, the location and stage to the minimap header, and the lead Aethren to the Aethren module.

## Health, Air and Suit

- **Health** is Carl's HP. At zero, Carl is recalled to the ship (HEALTH gauge at zero), or carried out of a cave.
- **Suit** is a shield. Incoming damage takes Suit first; only what gets through reaches Health.
- **Air** is unchanged: oxygen, drained by the environment.
- **Life Seed** heals Health (+25), not Suit or Air. Allied shields still raise Suit.
- A full restore (landing, a kit, the base) refills all three.

## HUD edit

- Press **HUD** (or the H key) to enter edit mode. Each module shows a dashed outline and a drag handle. Drag any module to move it.
- Positions are saved as fractions of the screen, so they adapt to other sizes. They are kept with the game save, so they survive reloads.
- They are clamped to the screen on every resize.
- **RESET HUD** restores the default layout.
- Outside edit mode, modules do not catch input, so the controls underneath work as before.

## Controls

Triangle and Square still control the selected utility. The utility module shows the cooldown while a utility recharges.

## Not built

- Live numeric Health in the Aethren panel for companions beyond their bars.
- A resize handle (the spec's optional item).
- Separate layouts saved per device; the layout is saved with the game.
