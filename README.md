# AOV™ Saga

Entire website code for www.angelsofvices.com owned by Angels of Vices, LLC. and CEO McCarly Thompson III.

## Three main titles

Start with a title guide to find its game files, artwork, tools, and documentation.

| Title | Guide | Game files | Play route (served from this repository) |
| --- | --- | --- | --- |
| RP7B | [RP7B guide](titles/RP7B/README.md) | [rp7b.html](rp7b.html), [rp7b-hd.js](rp7b-hd.js) | `/rp7b.html?hd=1` |
| RP7D | [RP7D guide](titles/RP7D/README.md) | [Development source](rp7d/developer/), [web build](play-rp7d/) | `/play-rp7d/` |
| AA1936 — Aethryx Adventures: 1936 | [AA1936 guide](titles/AA1936/README.md) | [explorer](explorer/) | `/explorer/` |

The `titles/` folders are navigation guides. Game files remain at their original paths so existing URLs, asset references, and build tools keep working. This organization does not duplicate or move game code.

## Shared material and website

| Location | Contents |
| --- | --- |
| [assets](assets/), [audio](audio/), [video](video/) | Root-level artwork and media; consult each title guide before changing anything |
| [data](data/), [game_roster](game_roster/) | Game data, rosters, and canon references |
| [cards](cards/), [cards_v2](cards_v2/) | Card artwork and related material |
| [docs](docs/) | Design notes, handoffs, and supporting documents |
| [tools](tools/), [scripts](scripts/) | Asset and development utilities; many depend on current paths |
| [index.html](index.html), [games.html](games.html) | Website home and game selection pages |
| [_archive](_archive/) | Existing archived material |

Other root HTML pages, backup files, and older title files are retained. Their presence alone does not mean they are unused or safe to remove.

## Local play

For RP7B, double-click `PLAY_RP7B_LOCAL.command` in Finder. It serves the repository locally and opens RP7B with HD enabled. Keep its Terminal window open while playing.

For all three web versions, serve the **repository root**, not a title guide folder. For example, from a terminal in this repository:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Then open the desired route at `http://localhost:8765`. RP7D's existing web access gate still applies. See its guide for the disk-based playtest alternative.

## GitHub and deployment

This remains one repository. The title guides use relative links so they also work on GitHub. No separate repositories or copies of the games are needed.

The static-site configuration serves the repository root. RP7D's development folder is excluded from deployment by `.assetsignore`; its website build is in `play-rp7d/`. Folder moves would require a separate review of runtime references, build scripts, and deployment settings.
