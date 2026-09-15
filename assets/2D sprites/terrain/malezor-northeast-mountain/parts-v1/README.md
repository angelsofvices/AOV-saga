# Malezor mountain — separate layering parts

Seven individual RGBA PNGs generated with built-in imagegen, with real alpha transparency verified. The complete generation prompts are in `generation-prompts.json`.

Open `assembly-preview.html` to inspect the assembly, toggle individual parts, move them, adjust width, and save a placement JSON. Each card links to its standalone PNG. The preview works as a local file or through a local server.

Back-to-front example order: foothill base → western ridge → upper mountain → summit cap → side ledge → dead tree → chest. Positions are independent and can be reused in other arrangements.

`parts-manifest.json` contains source image sizes, content bounds `[x,y,width,height]`, display dimensions, and local placement coordinates. `parts-manifest.js` provides the identical data to the preview without requiring a fetch. Content bounds exclude near-invisible background noise using alpha ≥16 and two pixels of padding; source PNGs remain unmodified. Draw only the source bounds into each destination rectangle, preserving the supplied aspect ratio. The 32 px tile size informs placement, while these are multi-tile overlay chunks rather than seamless 32×32 autotiles.

The example occupies approximately 12×10 tiles, with its highest landmark northeast. This is local assembly geometry, not an absolute map placement. Current repository maps differ from the earlier brief's 15×45 estimate; choose world coordinates against the active overworld when integrating.

No live map or collision code is changed by this asset pack. Author collision and ledge walkability separately from sprite alpha. Keep the ground-level front sealed. Future access comes from the Western Woods underground route and interior exits to elevated ledges. The chest is a separate decorative asset until wired to gameplay.

Validation: all seven PNGs have RGBA alpha ranging from 0 to 255 and transparent corners; the assembled preview was visually checked over Malezor grass; layer visibility and position controls were exercised.
