# AOV™ Controller Mapping Standard

**Status:** Canonical input reference  
**Primary controller:** PlayStation 5 DualSense  
**Browser interface:** Gamepad API using the standard gamepad layout  
**Keyboard and mouse:** Must remain available in every browser game mode

## Canonical Game Identity

| Product number | Canonical game / world |
|---|---|
| RP7 | Zyraxis |
| RP8 | The Tree of Power — Arborynth (The Living World · Planet 4) |

## 1. RP7 Face-Button Translation

RP7 may describe actions with the abstract game buttons **A, B, X, and Y**. On a PlayStation 5 DualSense controller, always translate them as follows:

| RP7 game input | DualSense input | Gamepad API standard index |
|---|---|---:|
| A | Cross (×) | 0 |
| B | Circle (○) | 1 |
| X | Square (□) | 2 |
| Y | Triangle (△) | 3 |
| Select | Create | 8 |
| Start | Options | 9 |
| Menu | Touchpad press | 17* |

\* Touchpad-button exposure can differ by browser and operating system. The game must provide a keyboard fallback and may use another available menu input when button 17 is unavailable.

## 2. Shared DualSense Layout

| Player intent | DualSense input | Keyboard/mouse fallback |
|---|---|---|
| Move | Left stick or D-pad | WASD or arrow keys |
| Aim / camera | Right stick | Mouse |
| Confirm / primary action | Cross (×) | Enter, Space, or primary click |
| Cancel / back | Circle (○) | Escape |
| Secondary action | Square (□) | Context-specific key |
| Mode-specific action | Triangle (△) | Context-specific key |
| Left action / aim | L2 | Context-specific key or secondary click |
| Right action / fire | R2 | Context-specific key or primary click |
| Pause | Options | Escape or P |
| Select / utility | Create | Tab |
| Menu | Touchpad press | M |

## 3. The Long Return

### Journey Mode

| Action | DualSense | Keyboard / mouse / touch |
|---|---|---|
| Launch Journey from mode screen | Cross (×) | Enter, Space, or select **The Journey** |
| Move ship | Left stick or D-pad | WASD, arrows, mouse drag, or touch drag |
| Restart after win or defeat | Cross (×) or Options | Enter, Space, or restart button |

### Endless Void Mode

| Action | DualSense | Keyboard / mouse / touch |
|---|---|---|
| Launch Endless Void from mode screen | Triangle (△) | Select **Endless Void** |
| Move ship | Left stick or D-pad | WASD, arrows, mouse drag, or touch drag |
| Fire purple ray blaster | R2 | B |
| Restart after defeat | Cross (×) or Options | Enter, Space, or restart button |

Purple asteroids are breakable with the blaster. Gray asteroids are hazards and cannot be destroyed.

## 4. The Training Yard

| Action | DualSense | Keyboard / mouse / touch |
|---|---|---|
| Enter the Yard | Cross (×) or Options | Enter, Space, or button |
| Select attack | Left stick or D-pad left/right | A/D or arrow keys |
| Confirm attack | Cross (×) | Enter, Space, or click |
| Directly choose A1 / A2 / A3 | — | Number keys 1 / 2 / 3 |
| Restart spar | Cross (×) or Options | Enter, Space, or restart button |

## 5. Implementation Rules

1. Every game mode must retain keyboard and mouse controls.
2. The browser must detect controller connection, disconnection, and reconnection.
3. Analog sticks must use a dead zone to prevent drift.
4. On-screen prompts should reflect the player's most recent input method.
5. A held input must not cause repeated menu selections unless deliberate repeat behavior is implemented.
6. RP7 documentation and interfaces must use the translation in Section 1 consistently.
7. Advanced DualSense features such as adaptive triggers and haptics are optional enhancements, not required inputs.

## 6. RP8 — Arborynth

| Action | DualSense input | RP8 game button |
|---|---|---|
| Move | Left stick or D-pad | Directional controls |
| Interact | Cross (×) | A |
| Basic attack | Circle (○) | B |
| Cycle equipped weapon | Square (□) | X |
| Hold block | Triangle (△) | Y |
| Vibe profile | Create | Select |
| Menu | Touchpad press | Menu |
| Staff profile / revive | Options | Start |
