# 01 · Exploration — minute-to-minute gameplay

*Design v1 · 2026-10-07 · builds on [00_CREATOR_HANDOFF.md](00_CREATOR_HANDOFF.md). Every number marked **(tune)** is a starting value to be adjusted in playtests.*

This document answers the handoff's **NEXT MAJOR DESIGN AREA**, one section per item it lists. Card battles are deliberately left as a hook (§8): exploration hands off to them, and they get their own document next.

---

## 0 · The shape of a session

```
 SHIP (home base)                   PLANET SURFACE (a Survey Zone)
 ┌──────────────────────┐  LAND    ┌─────────────────────────────────────┐
 │ Navigation  Darkroom │ ───────▶ │ walk · look · photograph · sample   │
 │ Laboratory  Radio    │          │ talk · climb · enter caves · fight  │
 │ Workshop  Card Locker│ ◀─────── │ gauges drain · film runs out        │
 └──────────────────────┘  RETURN  └─────────────────────────────────────┘
      │                                     ▲
      ▼ develop film, classify specimens    │ next sortie
  CARD MANIFESTATION → INVENTORY ───────────┘
```

- **Short session (5–10 min):** one sortie. Land, fill a roll of film, come back, develop it, watch the cards reveal.
- **Long session (30+ min):** several sorties, a Haemen settlement, a story mission, a cave, a battle.
- The player is **never forced** to finish a zone. Leaving is always one action away.

The core idea that ties exploration to cards: **out on the surface you gather *evidence*; on the ship you turn evidence into *cards*.** Film is developed in the Darkroom, and specimens are classified in the Laboratory. That makes the ship a place you *want* to return to, and the card reveal a 1936 ritual instead of a slot machine.

---

## 1 · Player movement

- **View:** top-down 2D in the pixel-art style RP7B already uses, so the Zyrex sprites, tilesets and gamepad code (`aov-gamepad-boot.js`) carry over. Portrait on phones, landscape on desktop.
- **Touch:**
  - **Tap a spot** to walk there by the shortest path.
  - **Hold and drag** anywhere for a floating thumbstick.
  - Tap an object or creature to walk to it and interact.
- **Keyboard / gamepad:** WASD or left stick to move, one button to interact, one to raise the camera, using the controller layout in `AOV_CONTROLLER_MAPPING.md`.
- **Pace:** walking is deliberate. A brisk **run** (double-tap or a toggle) is faster but **startles** skittish Aethren and drains the SUIT gauge faster on hostile worlds.
- **Crouch / stalk:** a toggle that slows you down and makes you quieter. It's the main tool for getting close to shy subjects.
- **Traversal gear** (§9) opens new paths: rope and pitons for cliffs, a diving helmet for shallow water, a lamp for caves. That gives zones light "come back later" secrets.

---

## 2 · Planet maps

Every world has three levels of map, each with a period look:

| Level | What it is | 1936 presentation |
|---|---|---|
| **Orbital Chart** | The whole planet from orbit, divided into **Survey Zones** | A paper chart on the navigation table, hand-inked as you learn it |
| **Survey Zone** | One explorable area you land in, roughly 2–4 screens across **(tune)** | Your own field sketch map, drawn in pencil only where you've walked |
| **Sub-site** | A cave, ruin, building interior or settlement, entered from a zone | Same sketch style, on a separate sheet |

- **Zones follow canon geography.** On Zyraxis each district is at least one zone (Malezor, Zarvane, Andrannor, Veridan, Netharion, Vorashil, Xilnar, Baelgor, Thardun, Korathen), so planet and district classification (handoff §Classification) comes straight from where you found something.
- **Fog of war:** the field sketch starts blank. Walking draws it in. A **Survey Instrument** reading (§9) from high ground sketches a wider area at once.
- **Map completion feeds the Archive.** Every landmark, sub-site and zone you chart is an Archive entry, and some are Location or Structure cards.
- **Zones stay put.** Layout is hand-designed per zone, not random. Which creatures are out, the weather and some item spawns change between visits, so return trips matter.

---

## 3 · Landing

1. **Navigation table:** pick a charted world, then a Survey Zone on its Orbital Chart. Zones you haven't charted yet show as blank paper.
2. **Descent:** a short sequence, 5–10 seconds and skippable: switches thrown, needles swinging, the hull rattling through atmosphere. Each world gets one line of atmospheric readout from the instruments.
3. **Touchdown:** the ship lands at the zone's **Landing Site**, which becomes your safe point. Standing next to the ship always lets you board.
4. **Landing costs FUEL**, refilled on the ship (§13). Moving between zones on the same planet costs a little. Travelling to another world costs much more.
5. **Some zones need an upgrade to land in** (§14): high gravity, storms, no flat ground. The chart marks why ("SURFACE UNSUITABLE · INSUFFICIENT THRUST").

---

## 4 · Interaction

One **interact** button (or a tap) does the obvious thing for what you're facing:

| Subject | Interaction |
|---|---|
| Aethren (creature) | Observe; raise the camera; feed or offer (some species); back away |
| Haemen (person) | Talk (§7); trade; give; accept missions |
| Object / plant / mineral | Examine; take a **Specimen** (§6) |
| Landmark / structure / ruin | Examine; sketch to the Archive; photograph |
| Inscription / record | Copy into the Field Journal (decoded later, §5) |
| Hazard | Read the instrument; use the matching gear |

- **The camera is the second button,** always one tap away (§5).
- **Examining something prints a typewritten line in the Field Journal** in the astronaut's own 1936 voice, for example: *"Crystalline mass, violet, warm to the glove. Hums on the wireless band. Not quartz."*

---

## 5 · Photography and documentation

The camera is the heart of discovery, the astronaut's main instrument and the main source of cards.

**The Field Camera**
- Raising it switches to **viewfinder mode**: a framed view with a **focus ring** and an **exposure needle**.
- A good photograph needs:
  1. **Framing:** the subject is inside the frame guides.
  2. **Focus:** turn the ring until the image sharpens (drag on touch, triggers on a gamepad).
  3. **Steadiness:** you're crouched or still. Moving blurs the shot.
  4. **Light:** the exposure needle sits in the green band. Caves need the lamp, and some worlds glare.
- Each shot is **graded in the Darkroom later** (not on the spot): *Poor · Fair · Good · Excellent*. The grade decides what the photo turns into (§12).
- **Film is limited:** one **roll of 12 exposures** per sortie at the start **(tune)**. That's the core expedition tension: what is worth a frame?
- **Behaviour shots:** some subjects have special moments (a Gemlord-touched creature glowing, a Haemen ritual, a phenomenon at dusk). Photographing that moment counts as a separate Archive entry and can produce a variant card.

**The Field Journal (documentation without film)**
- **Observation:** stay near a subject for a few seconds without startling it. The journal fills in behaviour notes, for an Archive record only and no card.
- **Sketch:** landmarks and structures can be sketched (a short hold) for their Archive entry without spending film.
- **Copied inscriptions** are saved for decoding once you've learned enough terminology (below).

**Terminology evolves (the Lexicon)**
- Every Aethryx term in the game has a **Lexicon** state: *unknown* or *learned*.
- Until it's learned, the interface shows the astronaut's 1936 description instead: *UNKNOWN CRYSTALLINE SPECIMEN, FELINE QUADRUPED (UNCLASSIFIED), HUMANOID INHABITANT, RADIANT BODY (PRIMARY)*.
- Terms are learned from Haemen conversations, decoded inscriptions, Archive milestones and story missions.
- **When a term is learned, every record that uses it is reclassified on screen:** the typewriter strikes out the old line and types the new one: ~~UNKNOWN CRYSTALLINE SPECIMEN~~ → **ASTRALITE**. Cards already in the inventory update their name the same way.
- The same Lexicon is how the interface itself changes: the ship's controls get relabelled as Aethryx technology is fitted (§13).

---

## 6 · Discovery requirements

Every collectible subject has a **Documentation** requirement made of evidence types. Meeting it **classifies** the subject, creating its Archive entry, and makes its card possible.

| Subject type | Evidence that counts | Classified when **(tune)** |
|---|---|---|
| Aethren | Photograph, Observation, Specimen (shed scale, feather, track cast) | 1 Good photo **or** Observation + Specimen |
| Haemen / Characters | Conversation, Photograph (with consent, see §7) | Conversation milestone + 1 photo |
| Astralites / minerals / plants | Specimen | 1 Specimen, analysed in the Laboratory |
| Artifacts / technology / weapons / armor | Recover the object, or Specimen of it | Recovered + analysed |
| Locations / structures | Sketch or Photograph, plus reaching it | Reached + sketched or photographed |
| Historical discoveries / events | Decoded inscription, Haemen testimony, story mission | Story or decode trigger |
| Cosmic phenomena | Photograph at the right place and time | 1 Good photo during the event |

- **Before classification** a subject appears in the Archive as a *Field Record*: partial, often wrongly described in 1936 terms, with no card yet.
- **Rarity stays canon** (handoff §Rarity). A subject's card always shows its canon tier as **RARITY n/10**. *How hard it is to find* is a separate number for each subject: how rarely it appears, where, when, and how shy it is. A Tier 3 subject can be harder to find than a Tier 6 one.
- **Discovery difficulty levers** (none of them touch tier): where it spawns, time of day, weather, needing gear to reach, shyness, and needing a learned Lexicon term or a Haemen guide.

---

## 7 · NPC / Haemen interaction

- **First contact is a language barrier.** Early on, Haemen speech shows as glyphs mixed with the few words you've learned. Their gestures, tone and the Lexicon make it readable over time.
- **The Radio Set helps.** Tuning the ship's radio to local transmissions teaches words passively between sorties, a period-correct way to learn a language.
- **Dialogue** uses typewriter text boxes with a portrait. Choices are short and in character for a 1936 government astronaut: polite, wary, scientific.
- **Haemen can:**
  - **Teach** Lexicon terms, the main way terminology unlocks.
  - **Guide:** point out where a hard-to-find subject lives.
  - **Trade:** swap spare Specimens or duplicate cards for supplies, film or rare items.
  - **Gift:** give cards directly, one of the handoff's acquisition methods.
  - **Give missions** (§10).
  - **Challenge** you to a card battle (§8). Some Haemen are duelists.
- **Consent to photograph.** Photographing a Haemen without asking can offend them and lower their **Regard** for you, closing off trades and missions. Asking first, once you can, gives a better portrait. This keeps people from being treated like wildlife.
- **Regard per settlement** goes up through gifts, help and respectful choices, and down through intrusion. It unlocks better trades and deeper missions.
- **Canon characters** (Auraxion and the rest) appear only where and when canon allows. The Creator approves each appearance and every line.

---

## 8 · Aethren encounters

Each species has a **temperament**:

| Temperament | Behaviour | How to document it |
|---|---|---|
| **Docile** | Ignores you | Walk up and shoot |
| **Skittish** | Flees if you run or get close | Crouch, approach from cover, use a long lens |
| **Curious** | Follows you, may steal an item | Offer something and wait for the moment |
| **Territorial** | Warns, then challenges | Back off, or accept the **encounter → card battle** |
| **Elusive** | Appears only under conditions (night, storm, after an event) | Learn the condition from Haemen or the Journal |

- **Warning signs come first:** a posture change, a sound and a needle on the wildlife meter. A fight is never sprung on the player without notice.
- **Battle hook:** a territorial Aethren, a hostile Haemen, a guardian or a duelist opens the **card battle** (rules in the next document).
  - **Winning:** an Archive entry, a high chance of a card, and the creature calms down so you can photograph it freely.
  - **Losing or retreating:** you're sent back to the Landing Site. You keep your Archive progress and exposed film, but drop one unsecured Specimen **(tune)**.
- **Capture is not killing.** In the spirit of RP7, where Gemlords are bound, not killed, battles end in the subject yielding, never being destroyed.

---

## 9 · Equipment and tools

The astronaut starts with a **1936 expedition kit**. Each item later gets an **Aethryx refit** using Astralites, which shows the ship's hybrid identity on your gear as well.

| Item | 1936 version (start) | Aethryx refit (later) |
|---|---|---|
| **Field Camera** | Bellows camera, 12-exposure roll | Astralite lens: 24 exposures, sees elusive subjects |
| **Field Journal** | Pencil and typewritten pages | Self-annotating pages (auto-decodes known glyphs) |
| **Specimen Case** | 6 sealed jars | Expanded case, stasis jars for living samples |
| **Survey Instrument** | Theodolite: sketches the map from high ground | Range-finder that pings landmarks through walls |
| **Lamp** | Carbide lamp for caves | Astralite lamp, reveals hidden markings |
| **Pressure Suit + gauges** | SUIT · AIR · WARMTH dials | Shielding tuned per world hazard |
| **Climbing kit** | Rope and pitons | Grapple line |
| **Diving helmet** | Copper helmet for shallow water | Deep-water pressure rig |
| **Wildlife meter** | Needle that twitches near large animals | Aetheric detector: shows species presence |
| **Flare pistol** | Recall flare, fast return to the ship | Flare that also marks a spot on the Orbital Chart |

The astronaut never carries modern weapons. Encounters resolve through cards (§8).

---

## 10 · Missions

All missions are filed in the **Expedition Log**, a typewritten dossier with stamped headers.

| Type | Source | Example |
|---|---|---|
| **Primary: FIND A WAY HOME** | Story spine | Repair the navigation; decode the hyperspace event; seek the beings who might know of Earth |
| **Survey Orders** | Your own mission protocol, one set per zone | "Chart Malezor's eastern ridge. Document 3 Aethren. Recover 1 mineral sample." |
| **Haemen requests** | Settlements | Deliver, find, escort, photograph something for them |
| **Radio Transmissions** | Signals picked up at the ship | A mysterious repeating signal that leads to a hidden site |
| **Planetary Objectives** | Each world, about 5 | Larger goals that complete the world's chapter |

- **The story spine never gates Archive play.** You can always wander and document, and the main story is a thread you pick up when you want.
- **Rewards are canon:** cards, Lexicon terms, Astralites for refits, Starchart fragments (§15), and supplies like film and fuel.

---

## 11 · Environmental hazards

Three analog gauges sit on the HUD, mounted on a riveted panel at the bottom of the screen:

- **SUIT:** physical integrity. Damaged by falls, hostile creatures, hazards.
- **AIR:** drains on worlds with poor atmosphere and underwater.
- **WARMTH:** drains in cold, as on Yvoris (the Frozen World).

Each world's hazard comes from its canon trait, for example:

| World (canon trait) | Hazard |
|---|---|
| Gravaron · extreme gravity | Movement slowed, jumps shortened; heavy gear drags |
| Yvoris · frozen stasis | WARMTH drains; ice sheets you slide on |
| Ignara · perpetual ignition | Flare-ups on the ground you must time crossings around |
| Jynaera · hyper-accelerated time | Film and specimens "age" faster; work quickly |
| Thallassar · ocean world | Most of the zone is underwater: AIR gauge and diving helmet |
| Zyraxis · Netharion, the unstable centre | Reality anomalies: the map shifts, instruments misread |

- **When a gauge hits empty:** the astronaut is **forced to recall to the ship**. You keep the Archive entries and the film exposed so far, but lose one unsecured Specimen **(tune)**. There's no death screen; the ship's emergency recall is part of the fiction.
- **Supplies refill on the ship.** Upgrades raise capacity and add shielding per hazard type.

---

## 12 · Card manifestation and the reveal sequence

Cards come out of the ship's two research rooms, which turn evidence into cards:

**The Darkroom (photographs → cards)**
1. Pick an exposed roll to develop. The room goes red-lit.
2. Each frame is dipped in the developing tray and **the image slowly appears**. This is the reveal moment, and each frame takes a second or two (with a skip option).
3. The print is graded: *Poor · Fair · Good · Excellent*.
4. A **Good or Excellent** print of a classified subject **manifests a card**. The print is laid into a card frame, the set number and classification are typed onto it with a typewriter clack, and the rarity is stamped.
5. Poor or Fair prints still count toward the Archive (as evidence) but don't produce a card.

**The Laboratory (specimens → cards)**
- Analyse a Specimen to classify it, using instruments and needles with a short reading. Minerals, plants, Astralites and artifacts manifest their cards here.

**What every card shows** (handoff §Inventory)
```
CARD:      [Name — or 1936 description until the term is learned]
SET:       09 — Zyraxis
CLASS:     Aethren
WORLD:     Zyraxis
DISTRICT:  Malezor
SPECIES:   [Species]
RARITY:    6/10            ← canon tier, never changed for balance
QUANTITY:  1
```

**Archive vs Inventory**
- The **first** manifestation of a subject also completes its **Archive** entry. Archive % only counts *knowledge*.
- Each extra Good or Excellent print of the same subject adds **QUANTITY +1** in the inventory. These are usable copies for decks, trades and later RP7 redemption.
- An **Excellent** print can manifest a **first-edition finish** (a cosmetic foil). It has no gameplay power, so collecting stays fair.

---

## 13 · Returning to the spacecraft

- **Walk back** to the Landing Site, or **fire a recall flare** (limited supply) for an instant return.
- **The return summary** is a typed **Expedition Log entry** for the sortie: zones charted, subjects observed, frames exposed, specimens secured, new Lexicon terms.
- **On board:**

| Station | Does |
|---|---|
| **Navigation** | Orbital Charts, the star chart of the Expanse, travel, landing |
| **Darkroom** | Develop film → cards (§12) |
| **Laboratory** | Classify specimens → cards; decode inscriptions |
| **Workshop** | Refit gear and ship with Astralites (§9, §14) |
| **Radio Room** | Transmissions, language learning, mission leads |
| **Card Locker** | The card inventory and, later, deck building |
| **Archive Cabinet** | The Archive: worlds, districts, species, history, completion % |
| **Captain's Log** | Story recaps and the FIND A WAY HOME thread |

- **The ship changes visually as it's refitted,** with stations getting Aethryx parts bolted onto the original riveted panels, so the hybrid identity grows in front of the player.

---

## 14 · Planet progression

- **Archive %** per world (handoff example: *ZYRAXIS ARCHIVE — 63% COMPLETE*), broken down by district or zone.
- **Milestones** at 25 / 50 / 75 / 100% **(tune)** each give something: a Lexicon unlock, a Starchart fragment, a refit schematic, a cosmetic for the ship.
- **Moving on doesn't need 100%** (handoff). Each world has a **Departure Threshold**: complete its Primary mission step and enough Archive to earn the Starchart fragment for the next route. 100% is for completionists, who can come back any time.
- **Zones unlock inside a planet** through gear (rope, helmet, lamp), story, Haemen guidance or ship upgrades (landing in hostile zones).

---

## 15 · Unlocking subsequent worlds

The original ship cannot jump. Its hyperspace entry was an accident. Reaching more of the Expanse takes two things:

1. **Starcharts:** the astronaut's own paper star chart of the Expanse is redrawn as they learn it. Each new world needs a **route**, made from **Starchart fragments** earned through world milestones, Haemen knowledge and missions.
2. **Drive refits:** Astralite modifications to the ship's drive extend how far it can travel. The crippled 1936 drive only reaches the bodies nearest the **arrival point** (§16). Each refit tier pushes the range further across the Expanse, so the canon rings in `aethryx.html` open up by distance from where the astronaut came out of hyperspace.

Locked worlds show on the star chart as **UNCHARTED BODY**, with their 1936 description until learned (for example *LARGE OCEANIC BODY, RING 2*). The canon name types in once a Haemen teaches it or the route is charted.

**Release gating (business side):** separately from what the player has earned, each world is only playable once the Creator publishes it, using the same unlock manifest idea as the website (`site-unlocks.js`). A world can be charted by the player but marked "In a future update" until it ships.

**Aenor and Zoryth sets:** the sun and moon are not landed on. Their cards come from **Cosmic phenomena** observations (§6), photographed from orbit or from specific worlds at specific times, plus story events.

---

## 16 · The first 15 minutes (tutorial by fiction)

1. **Dossier:** a classified 1936 government briefing, typewritten and stamped. You're named and enlisted. It ends with launch.
2. **Malfunction:** a cockpit sequence of gauges failing, the radio dying and a violent hyperspace entry. Short, mostly hands-on: flip the switches it tells you to.
3. **Arrival, adrift in open space:** you exit hyperspace into empty space, with no world beneath you. The star charts don't match, and Navigation reads ERROR. The first part of the game happens entirely aboard the drifting ship:
   - **Damage control:** restore power, air and the radio by throwing switches and following the gauges. This teaches the ship stations.
   - **First observations:** through the observation port and the ship's telescope you see a star that is not the Sun and a moon that is not the Moon. Photographing them is your first use of the camera, and they're logged as *PRIMARY RADIANT BODY* and *SATELLITE BODY, UNIDENTIFIED*. These are the first entries toward the **Aenor** and **Zoryth** sets. Their names type in later, once a Haemen teaches them.
   - **First star chart:** you take instrument readings and plot the nearest bodies on a blank paper chart. The crippled drive can reach only a few of them, each shown in 1936 terms (*LARGE OCEANIC BODY*, *CRYSTALLINE BODY, VIOLET CAST*).
   - **First choice:** you pick which body to try for. The game never tells you which world it is; you find out by landing.
4. **First landing:** this teaches movement, the gauges and examining things.
5. **First Aethren:** a docile creature near the ship teaches the camera: frame, focus, steady, shoot.
6. **First specimen:** an *UNKNOWN CRYSTALLINE SPECIMEN* glinting in the rocks. You take a sample.
7. **Back to the ship:** you develop the roll in the Darkroom, and **the first card reveal** happens. You analyse the crystal in the Laboratory, and the second card manifests.
8. **First Haemen contact:** it shows the language barrier, and you learn your first word. The crystal record is struck out and retyped as **ASTRALITE**. That's the moment the game's premise lands.
9. **The Expedition Log** opens its first entry: *FIND A WAY HOME.*

---

## 17 · Decisions needed from the Creator

1. ~~**Planet 19's name.**~~ **Answered 2026-10-07: URALYX.** Ultharis is reserved for the Highest One.
2. **Planet 28's name.** The handoff uses **AEP-28**. The website uses **Ovauron**, and the canon file lists *"Ovauron / AEP-28"* as an open naming question. The same file mentions AEP-28 being destroyed above Earth in the Second Aurelleap, which may matter for a game about a 1936 Earth astronaut. Should the card set be called AEP-28, Ovauron, or both?
3. ~~**Arrival world.**~~ **Answered 2026-10-07: the astronaut arrives adrift in open space, not at a world** (see §16). Still open: **which worlds should be within reach of the crippled drive** at the start? Including Zyraxis among them would let the game lead with its deepest content (districts, the 131-Zyrex roster, RP7) without forcing it.
4. **Zyrex and Aethren.** Are Zyrex the Aethren of Zyraxis, with a Zyrex's canon tier (I–X) becoming its rarity (1–10/10)? That would make the RP7 roster the first ready-to-use card pool.
5. **Earth knowledge.** Does canon say anything about what the Expanse knows of Earth in 1936, which would shape what Haemen can tell the astronaut about getting home?
6. **The astronaut.** A fixed named character, or player-named and player-customised (within 1936 US government astronaut fiction)?

---

## 18 · What comes next

1. **02 · Card battle system:** deck size, battlefield, resources, turn structure and how PvE encounters from §8 play out, designed to feel native to AOV.
2. **03 · Data and accounts:** the card schema, the Lexicon, save files, and the path to the universal AOV account, physical-card redemption and RP7 integration.
3. **First playable prototype:** one Zyraxis zone (Malezor is the best fit, since RP7D's Malezor handoff already exists), with movement, camera, film, the Darkroom reveal and one Lexicon reclassification. That's enough to feel whether the loop is fun.

---

## 19 · Creator rulings · 2026-10-07

Recorded from the Creator's direction after the first playable build. These take precedence over earlier sections where they differ.

1. **The two goals of the game:** (I) collect cards to bring back to Earth; (II) construct the first map of the newly discovered star system. Both are shown as the headline goals on the home screen and in the Expedition Log.
2. **Mainline status:** this game is the culmination of RP1 through RP7, and of RP8 and RP9: the living game of all the others. Only this game, RP7B and RP7D survive as the mainline games.
3. **The home screen is the map of the Expanse.** The whole system is visible at once, in the style of the Creator's map-board reference: a glowing cosmic chart on a board in a dark stone room, framed by gold-edged parchment panels. Flow: *Expanse map → select world → land → classic 2D exploration → discover/collect cards → return to ship/map → next expedition.*
4. **Unknown bodies reveal nothing** until reached and named: *UNIDENTIFIED BODY No. 7 · DISTANCE (instrument reading) · SURVEY: NONE*. Once named, the map itself updates. Known bodies show *SET nn — NAME · STATUS · SURVEY % · CARDS n / ??? · LAST EXPEDITION · [EXPLORE]*.
5. **Hierarchy:** Aethryx map → planet → district/region → 2D exploration map → discoveries → cards. Zyraxis's districts become explorable maps in canon order (Malezor → Zarvane → Andrannor → …), shown from a different historical perspective than RP7.
6. **Exploration is classic, lightweight, top-down 2D**, in the readable spirit of classic Pokémon: grid movement, compact maps, buildings, caves, NPCs, interactable objects, hidden items, district transitions. A to examine. No heavy action combat. The appeal: *"I'm going somewhere new. What cards can I find here?"*
7. **Aethren encounters** lead to observation, interaction or battle, depending on the Aethren. **Haemen cards** come from a relationship or discovery requirement, not from simply meeting someone.
8. **Set 19 is URALYX** (Creator ruling, 2026-10-07). Ultharis is the Highest One only. The schematic SVG/PNG and the game data now read Uralyx. AEP-28 is not drawn on the map yet ("eventually").

### Implemented in survey build 2 (`/explorer/`)
- The map board home screen with canon positions, unknown/named/visited states, drive range, the two goals and a progress bar for the first map.
- World panel → Zyraxis's ten districts (Malezor playable) → landing.
- Grid exploration with D-pad, A/B, tap-to-walk, dialog boxes, a cave interior (The First Den) with a warp, hidden finds, a blocked route sign toward the next district.
- Plants and minerals: examine → SPECIMEN DOCUMENTED → card acquired on the spot.
- Encounter screens per temperament: observe, offer (curious), photograph with a focus ring (flighty ones must be caught mid-hover), and a CARD BATTLE slot for territorial Aethren, marked *soon* until the battle system is designed.
- A Haemen whose card is earned by first contact, then returning with developed photographs, which also teaches the first true names.

---

## 20 · Carl Nasaro canon · integrated 2026-10-07

Source (locked): [02_CARL_NASARO_LIVING_MASTER_CODEX_CANON.md](02_CARL_NASARO_LIVING_MASTER_CODEX_CANON.md). It supersedes this document wherever they differ.

**Answered by the canon**
- §17 Q6 *(the astronaut)*: the player is **Carl Nasaro**, an ordinary Earth human of exceptional intelligence. No powers, no hidden lineage.
- The game is **The Living Master Codex**, the playable, continuously expandable Master Codex of the saga. *The AOV™ Saga establishes canon. The Living Master Codex allows players to discover it.* The game never overwrites established history.
- Carl's objectives: **COLLECT THE EXPANSE · MAP THE EXPANSE · BRING IT HOME.**
- Carl reaches **Zyraxis** in 1936 (the in-game arrival adrift in open space, within range of Zyraxis only, fits this).
- Primary narrative **1936–1945**: arrival on Zyraxis → meeting **Aurellyn** → the **1945 nuclear ping through the Aetherstride** locates Earth → Carl and Aurellyn travel to Earth. The **coda** runs through the Conspiracy Era to 1955: containment, Carl's imprisonment, Aurellyn's rescue, the Ovauron crisis over California, the Aurelleap, the Skyfall and Mutagenesis.

**Implemented in survey build 3**
- Title, page title and site door: *The Living Master Codex · The Expedition of Carl Nasaro*.
- The dossier is addressed to Carl Nasaro and signed by him. There is no name entry, and older saves are renamed.
- The three objectives sit on the map board and in the log. *Bring it home* reads "Earth's position: UNKNOWN", and an Earth panel on the board says the same.
- The Archive is now **The Codex** (*The Living Master Codex*).
- The chapter list shows I · 1936 · DISCOVERY. Later chapters read "A FUTURE CHAPTER" so the story isn't spoiled.

**Not yet in the game (needs Creator-approved scenes)**
- Meeting Aurellyn; his and Auraxion's cards; the Rizer connection.
- The 1945 ping and the journey to Earth (the moment *Bring it home* becomes possible).
- The coda (1945–1955).

**Reconciliation notes for the Creator**
1. ~~**Aurexion / Auraxion.**~~ **Answered 2026-10-07: AURAXION.** The canon file, card data (`cards_v2` display names and text) and `training.html` now read Auraxion. Internal IDs and art filenames (`aurexion`, `card_aurexion.png`, the RP4 walk sheet) are unchanged so the games keep loading them.
2. **Ovauron and AEP-28.** The older canon file says *AEP-28* is destroyed above Earth in the second Aurelleap; this canon says *Ovauron* is defeated above Earth in 1955. That reads as one body, which would close the "Ovauron / AEP-28" naming question in the older file.
3. **Two Aurelleaps?** The older file lists a *first* Aurelleap through the Aetherstride and a *second* one that destroys AEP-28. This canon names the 1955 launch "THE AURELLEAP". Possibly the 1945 crossing is the first and 1955 the second.
4. **Timeline warning resolved.** The older file flagged Auraxion's expedition (after 2031) against Earth contact (1945). The fixed chain and dates in this canon settle that.
5. **Aurellyn's later life.** The older file says Aurellyn "spends decades as Earth's first hero" and later "dies heroically", with no natural children. This canon doesn't contradict it, and the coda stops at 1955.

---

## 21 · Native art · pocket edition · 2026-10-07

Creator direction: *build all the assets of the game using native elements so they can be fully customized; a mobile version of the saga, pocket style but extremely deep.*

- **`explorer/art.js`** holds every in-game picture as pixel data: one string per row, one letter per pixel, and a shared `PALETTE` (plus optional per-sprite colours). `sym:true` sprites store the left half and mirror it. `ANIM` lists each character's walk frames (`|flip` mirrors a frame).
- **Pocket rendering:** 16×16 tiles, whole-number scaling only, camera snapped to the pixel grid, two-frame water and Astralite glow, pixel shadows, pixel "!" alerts and corner-bracket focus markers.
- **Everything in play is native:** the tiles (grass, flowers, path, water, den floor, rock, cave mouth), the props (Malezor fruit tree, metallic-leafed shrub, boulder, Astralite, carved markings, sign), Carl Nasaro's rocket, Carl himself (4 directions, 2-step walk), the fur-clad Haemen, and the Zyrex Otterlin, Verdanix, Aetherwing and Volcanut. Cards and encounter screens draw from the same data.
- **`explorer/studio.html`** is the Art Studio:
  - **Tools:** pencil, eraser, fill, colour picker, mirror painting and undo.
  - **Palette:** change a colour for one sprite or everywhere.
  - **Preview:** each sprite on grass, with its walk animation.
  - **APPLY TO GAME** tests an edit in this browser; **EXPORT CODE** gives the entry to paste into `art.js` so it ships for everyone.
- The painted sprites in `assets/` and `explorer/assets/` remain in the repo, untouched, as reference art.
