# AETHRYX EXPLORER · Game Design v0 (square zero)

*Working title, open to change. Prepared 2026-10-07.*

A mobile game for exploring the AOV Saga. You chart the Aethryx Expanse on a star map, land on worlds, and run short expeditions that turn up lore, creatures and relics. As new saga content is published, more of the map unlocks, the same way the website does.

**Decisions locked at square zero**

| | |
|---|---|
| Core loop | Star-map explorer: travel → land → expedition → discoveries → chart the next world |
| Platform | Web app first: plays in the phone browser at angelsofvices.com, installable to the home screen, works offline |
| Scope v1 | All 28 worlds playable at launch, each one *light* (see §6). Zyraxis gets the deepest content |
| Sessions | Both: 2–5 minute expeditions by default, plus optional longer Chapters |

---

## 1 · Pillars

1. **The saga is the loot.** Every reward is a piece of canon: a lore fragment, a creature sighting, a place, a name. No generic coins-for-coins.
2. **One thumb, two minutes.** Every core action works one-handed in portrait. A full expedition fits in a coffee break.
3. **The universe opens over time.** The Expanse starts mostly sealed. Worlds open through two keys: the Creator publishes them, and the player charts a route to them.
4. **It feels like the AOV site.** Same dark-cosmic JRPG language: void and nebula, gold-framed windows, pixel type, ▶ cursors.

---

## 2 · Core loop

```
 STAR MAP ──▶ choose a charted world ──▶ LAND
     ▲                                   │
     │                                   ▼
 CHART a new route                 EXPEDITION (2–5 min)
 (spend Starcharts)                tap tiles through fog,
     ▲                             spend Steps, find things
     │                                   │
     └──── RETURN to ship ◀── haul: Lore · Sightings · Relics · Starcharts
```

**Expedition (the 2–5 minute run)**
- A region is a small fogged grid (about 7×9 tiles, portrait). You start at the landing site with a set number of **Steps**, for example 14.
- Tap an adjacent tile to move. The fog clears and the tile shows what's there.
- **Tile contents:**
  - **Lore Fragment:** a 1–3 sentence piece of canon about the world. These collect into that world's Codex page.
  - **Sighting:** a creature native to the world, logged to the Bestiary. On Zyraxis these are Zyrex from the 131 roster.
  - **Relic:** a collectible object, for example the Mothergem Shards.
  - **Starchart:** the currency for opening routes on the star map.
  - **Hazard:** costs extra Steps (instability on Ignara, heavy gravity on Gravaron and so on, each themed to its world).
  - **Event:** a short choice ("A Gemlord's frequency hums beneath the stone. Listen / Move on").
- When Steps run out, or you tap **RETURN**, you go back to the ship with everything you found. There is no fail state that loses the haul; hazards only cost Steps.
- Each world has a fixed layout of what can be found, rearranged on every visit. Sightings are partly random, so repeat visits stay worth it.

**Chapters (the optional 20+ minute mode)**
- Story episodes that follow canon characters through a world, with dialogue and choices. A chapter opens when the player has found enough of that world's lore.
- v1 ships **one** chapter on Zyraxis, built from `data/RP7_MAIN_STORY_CANON.md` and the Hunt (Auraxion and his crew vs. the High Seers). The Creator approves its text before release.

**Reasons to come back**
- **Aenor Signal:** one daily expedition with a fixed layout that's the same for everyone, plus a bonus Starchart.
- New worlds and Chapters unlocked by site updates, announced with the same "WORLD UNLOCKED" cutscene as the website.

---

## 3 · Structure of the Expanse

| Layer | What it is | v1 count |
|---|---|---|
| Star map | All 28 worlds around Aenor, in 4 quadrants and 7 rings (canon from `aethryx.html`) | 1 |
| World | Planet page: art, canon summary, Codex progress, its regions | 28 |
| Region | One expedition grid | Zyraxis: 10 (one per Factionland); other worlds: 1–2 |
| Tile | One discovery | about 20 per region |

**How a world opens: two keys**
1. **Creator key (published):** the world's entry in the manifest is set to `playable`. Until then it shows as a sealed silhouette, "Opens in a future update". This reuses the website's `site-unlocks.js` idea.
2. **Player key (charted):** spend Starcharts to chart a route from a world you already know. Routes follow the rings outward from Zyraxis, so players spread out from the Mothergem World.

Because v1 ships all 28 worlds as `playable`, the Creator key is fully open at launch. It's there so deeper layers (new regions, Chapters, a world's second region) can roll out later.

---

## 4 · Progression

- **Explorer Rank:** XP from every discovery. It uses the same ranks as the website (Wanderer → Gemlord-Touched) and continues beyond them.
- **Shared save with the website:** the game lives on angelsofvices.com, so it can read the site's save file. XP, Mothergem Shards and trophies earned on the site carry into the game, and back.
- **Codex:** a per-world completion %. Lore Fragments make up the world's story, and a completed world unlocks its Chapter (when one exists) and a cosmetic ship trim.
- **Bestiary:** sightings by world. On Zyraxis it ties into the Zyrex roster (tier, types, district).
- **Ship:** the player's hub. Upgrades are mostly convenience (+Steps, a fog-scanner ping, a bigger haul), earned with Relics. No paid upgrades in v1.

---

## 5 · Screens (portrait, 390 × 844 base)

1. **Title / Continue:** shares the website's title screen style.
2. **Star map:** pinch and drag across the Expanse. Tapping a world opens a bottom sheet: name, title, ring, age, charted/sealed state, and **LAND** or **CHART ROUTE (n ◆)**.
3. **World page:** hero art, canon one-liner, Codex %, region list, Chapter button.
4. **Expedition:** the fog grid, Steps counter, haul tray and RETURN button.
5. **Haul summary:** what you found, XP gained, new Codex entries.
6. **Codex:** worlds → lore fragments, in order, so it reads as a story.
7. **Bestiary:** creature cards by world.
8. **Ship:** upgrades and cosmetics.
9. **Chapter reader:** dialogue windows with portraits and choice buttons.
10. **Journal / Options:** quests, trophies, sound, CRT effect, erase save. Same as the website.

The bottom navigation bar is the website's status bar grown into tabs: **MAP · CODEX · BESTIARY · SHIP**.

---

## 6 · What "light" means per world

Every world ships with at least:

| Item | Count | Source |
|---|---|---|
| Canon card (name, title, quadrant, ring, age, defining trait) | 1 | already in `aethryx.html` |
| Region | 1 | layout made from the world's trait |
| Lore Fragments | 6 | **Creator supplies or approves** (seed lines exist in `aethryx.html` per world) |
| Sightings | 3 | Creator supplies or approves; Zyraxis uses the Zyrex roster |
| Landmark | 1 | a named place for the region's centre tile |
| Hazard theme | 1 | made from the world's trait |

Zyraxis ships deeper: 10 regions (one per Factionland), Zyrex sightings by district, the 7 Mothergem Shards as relics, and Chapter 1.

**Canon rule:** the game never makes up lore. Every Lore Fragment, creature and landmark comes from existing canon files or is approved by the Creator before release. Content lives in one data file per world (`explore/worlds/<name>.json`), so canon can be written and reviewed without touching code.

---

## 7 · Tech plan

- **Where:** `/explore/` on the existing site. Plain HTML/CSS/JS with no build step, so the GitHub Desktop → Netlify flow stays the same.
- **Install and offline:** a web-app manifest and a service worker, so it can be added to the home screen and plays without a connection after the first visit.
- **Rendering:** DOM and SVG for the map and grid (sharp on every screen, easy to restyle), with sprite sheets for creatures. No game engine needed for v1.
- **Data:** `explore/manifest.js` (which worlds and Chapters are playable) plus one JSON per world. All of it is editable by hand.
- **Save:** browser storage, shared with the website's save key. No accounts or servers in v1.
- **Store apps later:** the same code can be wrapped for the App Store and Google Play without a rewrite.

---

## 8 · Milestones

| | Deliverable | Playable result |
|---|---|---|
| **M0** | This design doc | Agreement on the game |
| **M1** | Star map + world pages + shared save | Browse all 28 worlds on a phone, read canon cards |
| **M2** | Expedition engine on one Zyraxis region | The 2–5 minute loop is fun or it isn't. Tune here |
| **M3** | All 10 Zyraxis regions + Starcharts + charting | Zyraxis complete, routes outward |
| **M4** | Light content for the other 27 worlds | The whole Expanse explorable |
| **M5** | Aenor Signal daily + Ship + Bestiary | Reasons to return |
| **M6** | Chapter 1 + install/offline + polish | Launch |

Each milestone ships to the live site under `/explore/` as soon as it's tested, so you can play it on your phone between steps.

---

## 9 · Open questions for the Creator

1. **Name.** Keep "Aethryx Explorer", or something else?
2. **Who is the player?** An unnamed explorer with their own ship, a Rizer, or a canon character such as Auraxion?
3. **Lore for the 27 other worlds.** You write the 6 fragments per world, or I draft from existing canon files for you to approve?
4. **Creatures beyond Zyraxis.** Is there canon for other worlds' creatures (Draevos dragons, Velkryn's Crimsonian Titans...), or should those slots wait?
5. **Link to Rizing Power.** Should Zyrex sighted here show up in RP7B, or should the two games stay separate?
