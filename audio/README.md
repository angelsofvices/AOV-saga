# Rizing Powers · Soundtrack

Drop three MP3s in this folder — the game will loop each one based on
context. Missing files are handled silently (no crash, just no music
for that context).

| File            | Plays when                              |
|-----------------|-----------------------------------------|
| `overworld.mp3` | You're walking around Malezor / any outdoor map |
| `battle.mp3`    | Any battle is active (wild / trainer / gemlord) |
| `home.mp3`      | You're inside the family home interior          |

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
