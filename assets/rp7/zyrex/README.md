# Zyrex Sprite Pipeline — asset drop location

Drop a PNG per Zyrex here to give the game real sprite art. If a PNG isn't
here, the game auto-falls-back to the existing procedural drawing (V2.15)
so nothing breaks while the roster is being populated.

## Naming

**Filename must equal the species id used in `rizers.html` SPECIES / `codex.json`.**

Example: for **ELZORAN** (id `elzoran`), drop:

    /assets/zyrex/elzoran.png

Slugs are always **lowercase, no punctuation**. Check `data/codex.json`
`entries.<id>` if unsure — the key is the exact filename slug.

## Preferred sprite spec

Optimized for the 96×96 battle canvas. Any square-ish PNG works — the
loader letterboxes to preserve aspect.

- **Size:** 96×96 (or up to 128×128 for high-DPI). Anything larger works
  but will get downscaled with nearest-neighbor pixel-art scaling.
- **Format:** PNG with transparency. RGBA.
- **Background:** transparent. Do NOT bake in a background — the game
  provides the battle scene / glow behind the sprite.
- **Style:** pixel art, chunky forms readable at 32×32 party-slot size,
  centered in the frame.
- **Orientation:** the sprite should face RIGHT (toward the enemy in the
  battle canvas). Player-side is auto-mirrored by the loader so no need
  to make left-facing variants.

## Fallback location

The pipeline also tries `assets/character_<id>.png` as a secondary path.
That folder already has some AOV assets (`character_elzoran.png`,
`character_eurakeon.png`, etc). Those load automatically without needing
to be renamed — no work required to use them.

## Priority list for the first 100+ Zyrex

Group references you send in batches of 20 keyed by species id. Match
this order and every canonical grouping lands in the game as fast as
you can upload them:

**Priority tier 1 — starters + Elzoran line (7)**

    cinderant · otterlin · voltimite ·
    elzebub · elzimir · elzoran · omegoran

**Priority tier 2 — Malezor wild pool (12)**

    frostwisp · sandskitter · verdanix · flarepaw · dunechitter ·
    barkchitter · aurarat · torchpuff · pebblequil ·
    sunhoop · aetherwing · rakoron

**Priority tier 3 — 10 Gemlords (10)**

    rakoron · ivirium · mutaryn · emeralix · eurakeon ·
    azurel · obsidius · ambrevon · oathane · oatheus

**Priority tier 4 — 3 Seer endgame bosses (3)**

    xenoxil · orryx · ophira

**Priority tier 5 — high-tier codex favorites (~20)**

Pick from these based on which you have art for:

    aetherion · aethravax · abominalys · abyssion · azyrath · ultharis ·
    khronicore · anciuxor · mira · vitriarch · imperion · aldoris ·
    despera · seraphaela · luminari · nightstang · verdantus · tervalor ·
    vydexeus · sylvans

## Loader behavior recap

- Boot-time preload: `preloadAllSprites()` fires 100 ms after page load
  and tries `assets/zyrex/<id>.png` for every species in SPECIES.
- Cache: results are cached per-id in `SPRITE_CACHE`. A failed lookup is
  never retried; a successful one is drawn on every subsequent frame.
- Fallback: `drawBattleMon` procedural drawing kicks in whenever the
  cache reports no image loaded for a species.
- Party grid and Inspect card use the same `drawBattleMon` path, so any
  sprite you drop here appears in party views + battle immediately after
  a reload.
