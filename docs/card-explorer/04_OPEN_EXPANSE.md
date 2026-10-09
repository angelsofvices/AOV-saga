# The Living Master Codex · The Open Expanse

*Survey build 7 · 2026-10-07 · design and implementation notes*

The Creator's direction for this build:

> Make it more open world, and keep all the customisable options. The main premise: collect cards, battle Aethren and meet Haemen to learn about the world. Go from planet to planet. Full DualSense support, native to landscape play.
>
> The player can name themselves and pick their gender at the beginning, and customise their sprite before the exposition. They play the role of Nasaro. It opens like a classic Pokémon GBA game.
>
> We no longer photograph Aethren. We scan them into the AstraNav. The AstraNav is the game UI: early American tech given to astronauts to help them in outer space. You get it on your first mission, are thrust into hyperspace, and land looking at the 28 planets. You choose your first landing from there. The planets should be spread out the way they are in RP7D's telescope view, not as a bird's-eye T-shaped galaxy: more natural and spiral-like. The AstraNav replaces all menu systems, for ease of play and quality of life.

## 1 · The opening (pocket style)

1. **PRESS START** on the title (any key, a tap, or ✕). On phones this also requests full screen and locks landscape where the browser allows.
2. **The Director** of the Experimental Rocket Program introduces the mission in a handheld-style text box, shows the rocket, then hands over **the AstraNav**. The Director is unnamed on purpose: no new canon names.
3. **Man or woman?** Two portraits; the choice sets the portrait, the field sprite (a woman's hair shows under the helmet) and the dossier's *Mr.* or *Miss*.
4. **Your name.** A handheld letter grid, also typed from a keyboard or a pad. The surname **NASARO** is fixed: the player plays the role of Nasaro. *CARL* is offered as the recorded name.
5. **Fit your kit.** Skin tone, hair style, hair colour, suit, helmet and visor. These are all recolours of the native sprites, so every combination works everywhere, and the kit can be refitted later in AstraNav · SETUP.
6. The portrait **shrinks into the little field figure**, the classic handoff, and the mission orders are typed out to the player by name.

## 2 · The AstraNav

The AstraNav Mk. I is a 1936 American navigation, survey and scanning unit: a cream enamel case, chrome trim, a red enamel badge, bakelite keys and a green phosphor screen. **It is the whole interface.** There is no other menu.

| Page | What it holds |
|---|---|
| **SYSTEM** | The 28 bodies through the telescope. Tap a body for its sheet: course, status, survey %, cards, *fauna signals* (the creature levels to expect), and the 1936 telescope reading for unvisited worlds. Set course, land, disembark, or scan Aenor and Zoryth. |
| **FIELD** | When landed: the field sketch of the ground you have walked, your gauges, your card team, and the recall flare. |
| **CARDS** | The collection, and the battle team of up to three (tap a card to add it, remove it or make it lead). |
| **CODEX** | The Living Master Codex: every set, what the peoples and records have taught (canon lore from `environments.js`), and decoding the carved markings when ready. |
| **LOG** | The three objectives, the chapters and the current goals. |
| **SETUP** | Sound, haptics, text speed, touch-control side and opacity, full screen, refit your kit, controller status, erase the expedition. |

States: **aboard** (in deep space, in orbit, or landed; boarding refills SUIT and AIR and rests the card team) and **on foot** (the AstraNav in hand; ◀ FIELD returns to the ground).

**Superseded in survey build 8** (Creator handoff, [05_NASARUS_CANON.md](05_NASARUS_CANON.md)): hyperspace now ends in a crash landing on **NASARUS**, the headquarters world. The AstraNav comes back online when the drive is repaired and the Navigation Center is built at camp; from then on any world can be set as a course, and every expedition returns to NASARUS. See [06_NASARUS_BUILD.md](06_NASARUS_BUILD.md).

## 3 · The spiral (the telescope view)

The four canon spires become **four arms of a spiral** winding out from Aenor. Each world keeps its canon place in the order: world *n* sits on arm *n mod 4* at ring *⌈n/4⌉*. The whole disc is seen at an angle, as through a telescope. Nearer bodies are drawn larger and in front, with dust lanes, faint orbits, the drift orbit, and AEP-28 off the plane as a sealed body.

All positions come from one table (`POS` in `explorer.js`), so the layout can be matched exactly to RP7D's telescope view. **Survey build 8 matches RP7D's telescope geometry** (`rp7d/developer/astragraphy.js`): zone *n* = (n−1) mod 4 at ALPHA 0°, OMEGA 90°, TRINITY 180°, DICHOTOMY 270°; ring radius 22 + 8·ring; the same per-ring fan offsets; the same camera pitch; and AEP-28 (Ovauron) on its own tilted drift orbit. NASARUS's place on the chart is provisional, outside the seventh ring and apart from AEP-28.

Drag to pan, and use the wheel or a pinch to zoom; on a pad, the right stick pans and L2/R2 zoom. Any world can be set as a course; the trip takes longer the farther it is.

## 4 · Scanning, not photographing

- **Aethren:** in an encounter, choose **SCAN**. Turn the tuning dial to the creature's range until the signal meter locks, then scan. A strong lock adds the card on the spot (a perfect lock is a First Edition); a weak lock keeps partial data in the archive. Flighty creatures must be scanned while they hover in the centre, and an offered ration makes a curious one hold still.
- **In battle:** SCAN a weakened Aethren (below half health is good, below a quarter is perfect) and it goes into the AstraNav and slips away unharmed. Win the battle and it calms down, which allows a guaranteed perfect scan.
- **Plants, minerals, landmarks, the First Den, Aenor and Zoryth** are scanned too.
- Film, the darkroom, the laboratory and the observation port are gone. Old saves convert undeveloped good or excellent frames into cards.

## 5 · The open worlds

- `worldgen.js` builds every world from its Codex environment: an 84×64 map with its own terrain, palette, props, landmarks (canon names only), minerals, plants, hidden air cylinders and flares, peoples or carved records, and wild Aethren. The same seed always builds the same world.
- **Zyraxis is one seamless map**: the ten districts in the canon Z (I → X), with the hand-built Malezor set into District I. Roads link the districts in order, and the HUD announces each district as you cross into it. Korathen's landmarks stay spoiler-gated.
- Hazards come from each environment: AIR drains outdoors, faster where the canon hazard concerns air, and SUIT drains where it concerns the suit.

## 6 · Aethren and card battles

- **Canon Aethren on Zyraxis:** 120 Zyrex from `game_roster/roster.json` with canon tier, types, base stats (tier × 333) and canon move names. Tier 9–10 beings, easter eggs and entries marked "invented" stay out of the wild.
- **Other worlds** carry **provisional** fauna. These have 1936 descriptions only and no canon name, drawn from the four native body plans in the world's colours and flagged on their cards as awaiting the Creator's species.
- **Battles** use your scanned cards against a wild Aethren, with the canon 20-type chart from RP7B. Moves A1 and A2 are free; A3 costs two gems, and one gem builds each turn. You can also switch cards, scan or run. Cards gain experience and levels and are rested when you board the ship.

## 7 · The peoples (and records)

Each world's canon *first race* decides who you meet: Astrums on Lumeria, Dracolords on Draevos, Viridians on Viridia, and so on (see `peoples` in `fauna.js`). Show a people at least two scanned creatures of their world and they teach its name, their own name, their creatures' names and their landmarks' names, then give their relationship card. Their Codex page fills in (trait, notes, first race, notable, landmarks and hazard: all canon). After that they point you toward landmarks and warn you about hazards.

On Zyraxis, the fur-clad man in Malezor teaches the first words. The Haemen of every other district speak the same tongue once you have learned it.

Worlds whose canon has **no people** (Origon, the axis-being worlds, Kyrathos, Nexyros and Uralyx) have three carved records instead. Copy two to learn the world.

## 8 · Controls

**Touch:** a D-pad and A/B in landscape, tap the ground to walk there, and **NAV** opens the AstraNav. The controls can sit on either side, at three opacities.

**DualSense** (or any standard gamepad):

| Button | In the field | In the AstraNav and menus |
|---|---|---|
| ✕ | Examine / talk / advance | Select |
| ○ | Stalk / back | Back, close a sheet |
| □ | Stalk | Scan in an encounter or battle |
| △ | Open the AstraNav | Return to the field |
| L1 / R1 | — | Previous / next AstraNav page, previous / next kit value |
| L2 / R2 | — | Tuning dial; telescope zoom |
| D-pad / left stick | Walk | Move focus |
| Right stick | — | Pan the telescope |
| OPTIONS | AstraNav | Back |
| Touchpad | AstraNav · SYSTEM | AstraNav · SYSTEM |

Rumble is used for hits, scans, launches and landings. When a controller connects, the touch controls hide and on-screen focus becomes visible.

## 9 · Landscape

The game is built for landscape. Phones held upright get a *turn your device* card (with *play upright anyway*). `manifest.webmanifest` asks for full screen and landscape when installed. Every screen has a short-landscape layout.

## 10 · Files

| File | Role |
|---|---|
| `explorer/explorer.js` | The engine: opening, AstraNav, surface, scanning, battles, input |
| `explorer/worldgen.js` | Open-world generator |
| `explorer/pad.js` | DualSense and gamepad layer, haptics |
| `explorer/fauna.js` | **Generated** by `tools/explorer/build_fauna.py` from the roster, the RP7B chart and the environments |
| `explorer/environments.js` | Every world's environment (design bible: `03_ENVIRONMENTS.md`) |
| `explorer/art.js` | Native pixel art, now with portraits, hair, the AstraNav, and the woman Nasaro sprite |
| `explorer/studio.html`, `explorer/atlas.html` | Art Studio and World Atlas (unchanged; all art stays editable) |

## 11 · Open questions for the Creator

1. **NASARUS's place on the chart:** provisional; please confirm where it drifts.
2. **Species for the other 26 worlds:** their Aethren are provisional placeholders.
3. **Peoples' race names:** taken from each world's canon first race; please confirm (for example *Endurers* for Gravaron and *Sound-carriers* for Rhyzor are short forms).
4. **The Director:** left unnamed. Name them if canon has a name.
