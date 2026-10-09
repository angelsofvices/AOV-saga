# RP7D

[All titles](../README.md) · [Repository overview](../../README.md)

## Development project

- [Project folder](../../rp7d/)
- [Game source](../../rp7d/developer/) — current modules, including `game.js` and `index.html`.
- [Stylesheet](../../rp7d/documents/style.css)
- [Assets](../../rp7d/assets/), [animations](../../rp7d/animations/), [models](../../rp7d/models/), [skins](../../rp7d/skins/), and [references](../../rp7d/references/)
- [Tools](../../rp7d/tools/) and [reports](../../rp7d/reports/)

## Playable builds

| Build | Location | Usage |
| --- | --- | --- |
| Website version | [play-rp7d](../../play-rp7d/) | Serve the repository root and open `/play-rp7d/`; existing access gate applies |
| Local playtest | [RP7D_Malezor_Playtest.html](../../rp7d/dist/RP7D_Malezor_Playtest.html) | Open in Chrome; keep the companion `dist/assets/` folder beside it |

`rp7d/developer/` is the source; `rp7d/dist/` and `play-rp7d/` contain build outputs. Make future gameplay changes in the source and rebuild through the existing tool, rather than editing generated bundles.

The [build tool](../../rp7d/tools/build_single_html.mjs) supports the current split between `developer/` and `documents/`. From the repository root, its existing commands are:

```sh
node rp7d/tools/build_single_html.mjs
node rp7d/tools/build_single_html.mjs --web
```

These commands regenerate outputs; they were not run for this documentation-only organization. Dependencies and media tooling must be available as described in the build script.

## Documentation

- [Documents](../../rp7d/documents/)
- [Project README](../../rp7d/documents/README.md)
- [Developer handoff](../../rp7d/documents/CHATGPT_HANDOFF.md)
- [Malezor handoff](../../docs/RP7D-HANDOFF-MALEZOR.md)

Some older notes describe a flat project layout or opening `/rp7d/`. In the current checkout, source lives in `rp7d/developer/`; use the playable builds above. The current build script leaves music as a companion file by default, so do not assume the local HTML is entirely self-contained.

## Deployment boundary

The existing `.assetsignore` excludes `rp7d/` from the website upload. The deployed version is `play-rp7d/`. Preserve both locations and the shared assets they reference.
