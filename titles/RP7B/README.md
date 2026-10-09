# RP7B

[All titles](../README.md) · [Repository overview](../../README.md)

## Game and local play

- [Main game](../../rp7b.html)
- [HD renderer](../../rp7b-hd.js)
- [Mac local launcher](../../PLAY_RP7B_LOCAL.command) — double-click in Finder to start the local server and open HD mode.
- Served route: `/rp7b.html?hd=1`.

## Artwork, media, and supporting files

- [2D sprites](../../assets/2D%20sprites/)
- [Root artwork and references](../../assets/)
- [Audio](../../audio/) and [video](../../video/)
- [Game data and canon](../../data/)
- [Gamepad boot support](../../aov-gamepad-boot.js) and [controller navigation](../../card-game-controller-nav.js)
- [Development tools](../../tools/) and [asset scripts](../../scripts/) — these are repository-wide directories, not exclusively RP7B.

## Documentation

- [HD conversion notes](../../docs/RP7B_HD_CONVERSION.md)
- [Early game flow](../../EARLY_GAME_FLOW.md)
- [Controls master sheet](../../CONTROLS-master-sheet.md)
- [Rizing Powers UX handoff](../../RIZING_POWERS_UX_HANDOFF.md)

## Location notes

RP7B loads assets relative to the repository root, and existing tools refer to `rp7b.html` there. Keep the game, renderer, and launcher in their current locations. Root `rp7b.html.*.bak` files are historical snapshots, not the active game; they have been retained without changes.
