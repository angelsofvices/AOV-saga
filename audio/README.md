# Rizing Powers · Soundtrack

Drop three MP3s in this folder — the game will loop each one based on
context. Missing files are handled silently (no crash, just no music
for that context).

| File          | Plays when                                       |
|---------------|--------------------------------------------------|
| `town.mp3`    | You're walking around Malezor / any outdoor map  |
| `battle.mp3`  | Any battle is active (wild / trainer / gemlord)  |
| `home.mp3`    | You're inside the family home interior           |

## Wiring / behavior

- Autoplay is gated on the first keypress or click (browser policy).
  After that, tracks crossfade (~260 ms) whenever the context changes.
- Volume + mute persist in `localStorage` under `aov-rizers-audio`.
- Controls: pause menu (press **X** in overworld) has:
  - `MUSIC · ON / OFF` — mute toggle
  - `− VOLUME · nn% ＋` — 10 %-step volume up/down

## Adding more tracks

To add a fourth track (say, a specific district), add to `MUSIC_TRACKS`
in `rizers.html` and extend `musicContextForState()`:

```js
const MUSIC_TRACKS = {
  overworld: 'audio/overworld.mp3',
  battle:    'audio/battle.mp3',
  home:      'audio/home.mp3',
  zarvane:   'audio/zarvane.mp3',   // example
};
function musicContextForState() {
  if (game.mode === 'battle') return 'battle';
  if (game.player.mapId === 'home_interior') return 'home';
  if (game.player.mapId === 'zarvane')       return 'zarvane';
  return 'overworld';
}
```

## Formats

- MP3 works everywhere. OGG works everywhere except older Safari; if
  you want OGG, either add fallback logic or keep MP3.
- Keep files small — ideally under 3–5 MB each. Longer loops sound
  better than short repetitive ones. 60–90 s is a sweet spot.

## UI SFX (Tier 1 — 2026-07-13)

Eight short mp3 clips power the menu / interact micro-feedback layer.
These are ONE-SHOT sounds (do not loop) — the game plays a fresh
instance every time the trigger fires.

| File                    | Trigger                                           |
|-------------------------|---------------------------------------------------|
| `ui-confirm.mp3`        | A / Enter / Space — confirm any menu button       |
| `ui-cancel.mp3`         | B / Esc / Shift — back / close any overlay        |
| `ui-menu-open.mp3`      | Any overlay opens (party, items, quests, etc.)    |
| `ui-menu-close.mp3`     | Any overlay closes                                |
| `ui-cursor.mp3`         | Arrow-key navigate through menu buttons           |
| `ui-dialog-advance.mp3` | Advance a dialog line                             |
| `ui-disabled.mp3`       | Press on a disabled button (invalid action)       |
| `ui-toast.mp3`          | HUD toast fly-in                                  |

Wiring will live in `rizers.html` under a `SFX_ONESHOTS` registry.
UI SFX inherit the same volume slider as music but at a 0.6 multiplier
so they never overpower the music bed.
