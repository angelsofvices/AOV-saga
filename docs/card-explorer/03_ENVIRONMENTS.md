# 03 · Environments of the Aethryx Expanse

*Design v1 · 2026-10-07 · generated from the same source as `explorer/environments.js`. Builds on [00](00_CREATOR_HANDOFF.md), [01](01_EXPLORATION_DESIGN.md) and the locked [Carl Nasaro canon](02_CARL_NASARO_LIVING_MASTER_CODEX_CANON.md).*

## How these were designed

- **Canon first.** Every environment is built from the codex: `aethryx.html` (archetype, trait, lore, Astralite signature, first race), `timeline.html` (first race, founding events) and the world pages (`origon.html`, `viridia.html`, the Arborynth prototype). Zyraxis districts use the macro book taglines and the RP7 landmark art (`assets/2D sprites/tiles/landmarks/`).
- **Landmarks are canon names only.** Where canon names no landmark, none is invented. Terrain, palettes, hazards and mechanics are design, flagged as such, and built to express the canon trait as gameplay.
- **Every world gets one signature mechanic** that turns its canon trait into something the player does (Uralyx: observing builds the ground; Rhyzor: noise becomes solid; Quorauna: everything slides inward). That is where the depth of the sandbox comes from: 37 places, 37 different rules.
- **Native art.** Each environment recolours the shared native tiles and props in `art.js` (e.g. `grass@yvoris-ground`), plus the new environment tiles (`grid`, `ripple`, `cracks`, `rail`, `cloud`) and props (`spire`, `pillar`, `vent`, `pylon`, `deadtree`). All of it is editable in the Art Studio; the **World Atlas** (`/explorer/atlas.html`) previews every environment.
- **1936 eyes.** Each world has the line Carl's telescope records before he knows anything, shown on the chart for unidentified bodies.

## Naming notes

- District IX is **Thardun** in the game and on the Zyraxis page, **Thardin** in the macro book and the RP7 art folders. This document uses Thardun; the Creator should confirm one spelling.
- World 26 is **Ferros** (handoff set list); the timeline also calls it **Ferralis**.
- World 28 is listed as **AEP-28** (handoff set list) and left undesigned on purpose.

## The worlds

### Set 01 · ORIGON — The Origin World
**Canon:** Direct Highest One presence · Father Gem core at the planetary heart. **First race:** Tier VI+ Cosmic Beings only; no humanoids.

> No climate, no biology; the silence of the Highest One pressed against pre-creation. The First Volcano, the First River, the Source of Gems. Never broken, never warred over, never colonised: the Origin State. Every dragon bloodline began here (the Draconian Migration).

- **Environment:** A primordial world of black glass and gold-veined stone under a white-gold sky. Nothing grows. Every feature is a "first": the first volcano, the first river cutting the first valley. The silence is total; even footsteps sound wrong.
- **Terrain:** obsidian plain · gold-veined bedrock · the First River (still, perfectly clear) · primordial ash
- **Hazard: The Presence.** Substrate density near the Father Gem core drains SUIT steadily. Only the outer valleys are survivable for an unaugmented human.
- **Signature mechanic: Firsts.** Each "first" landmark is a one-of-a-kind Location card. Origon holds few cards, all rare to reach.
- **Canon landmarks:** The First Volcano · The First River · The Source of Gems
- **Telescope, 1936:** *DARK BODY. NO ATMOSPHERE VISIBLE. A FAINT GOLDEN POINT AT THE CENTRE OF THE DISC.*
- **Sound:** Absolute stillness; a single sustained tone.

### Set 02 · LUMERIA — The Light World
**Canon:** Pure light · awareness; the Astrums. **First race:** ASTRUMS, the original light-beings.

> An ocean of luminous mind. From the Astrums later descended the Wizards, Witches and Dracolords (the Anciaric Curse split them). Lumeria still sings every time a star is named.

- **Environment:** A world made of light thick enough to stand on. Plains of white-gold radiance with prismatic edges, pools of liquid brilliance, and a constant faint chord in the air.
- **Terrain:** light-glass plain · prismatic shallows · radiant pools · halo rings
- **Hazard: Glare.** Photographs overexpose. The exposure needle must be held in the narrow green band, and the lamp filter is needed to see detail.
- **Signature mechanic: Naming song.** Naming a newly documented subject makes the world sound a chord, briefly revealing nearby hidden finds.
- **Telescope, 1936:** *BODY TOO BRILLIANT TO RESOLVE. THE PLATE FOGS ON EVERY EXPOSURE.*
- **Sound:** A choir with no singers.

### Set 03 · DRAEVOS — The Dragon World
**Canon:** Sky-dominant. Primordial Dragons and Mandrakes. **First race:** DRACOLORDS / DRAGONLORDS + MANDRAKES.

> A planet whose sky outweighs its ground. The First Astrum War front. In a crash site on Draevos, Elzoran found the purple Father-Gem fragment that corrupted him into Omegoran.

- **Environment:** Crimson crags and knife-edged ridges under a sky that dominates the screen. Ledges, eyries and wind-scoured stairs climb toward the clouds; dragon shadows sweep across the map.
- **Terrain:** crimson crag · wind-scoured ledge · scree slope · eyrie stone
- **Hazard: Shadows overhead.** A shadow crossing the map warns of a diving predator. Stand still in cover (STALK) until it passes.
- **Signature mechanic: Look up.** Many Draevos discoveries are only visible by aiming the camera at the sky.
- **Canon landmarks:** The crash site where Elzoran found the purple gem
- **Telescope, 1936:** *RED BODY. HEAVY CLOUD BANDS. MOVING SPECKS ABOVE THE CLOUDS.*
- **Sound:** Wind, and wingbeats too large to be birds.

### Set 04 · ARBORYNTH — The Living World
**Canon:** A single living planetary organism: the Great Root. **First race:** THE GREAT ROOT, embodied as the planet.

> Everything that walks its surface walks on the breathing skin of a single ancient mind. Cognara Astralite (Mind/Thought) cores here. The Forest of the Godvine (Central) is named in the Arborynth prototype.

- **Environment:** The ground is bark and the walls are roots. Veins of sap pulse under translucent moss; clearings open and close like slow breaths.
- **Terrain:** bark floor · root walls · sap pools · moss skin
- **Hazard: The breathing ground.** Paths shift slightly between visits; the field sketch from the last landing is only partly right.
- **Signature mechanic: Cognara cores.** Astralite here is Cognara (Mind/Thought): sampling one briefly reveals the map around you.
- **Canon landmarks:** The Forest of the Godvine
- **Telescope, 1936:** *GREEN BODY. THE SURFACE APPEARS TO PULSE ON A SLOW RHYTHM.*
- **Sound:** A heartbeat under everything.

### Set 05 · THALLASSAR — The Ocean World
**Canon:** Oceanic harmony: the Great Fin. **First race:** THE GREAT FIN, oceanic axis-being.

> A water world with no shore. The Great Fin, shaped like a vast cathedral cetacean, circumnavigates in perfect tidal rhythm; its songs set the standard for harmonic devotion.

- **Environment:** Open ocean to every horizon. The only footing is reef shallows and drifting kelp mats; most of the map is explored underwater in the diving helmet.
- **Terrain:** open ocean · reef shallows · kelp mats · sea-floor sand
- **Hazard: No shore.** AIR is the limit everywhere. The tide rises whenever the Great Fin passes, swallowing the shallows.
- **Signature mechanic: The passage.** The Great Fin crosses on a schedule. Being in the right place at the right time is the whole expedition.
- **Canon landmarks:** The Great Fin's passage
- **Telescope, 1936:** *OCEANIC BODY. NO LAND DETECTED.*
- **Sound:** Whale-song at the edge of hearing.

### Set 06 · PYRAUNA — The Expansion World
**Canon:** Expansion megabeast (formerly Pyraxal): the Great Fang. **First race:** THE GREAT FANG, axis-being of expansion.

> Plates push, swell and erupt as the planet expands in slow exhale. Twin and mirror of Quorauna; the expand/collapse dyad.

- **Environment:** Swollen basalt plates split by glowing seams, uplift ridges and magma channels. The land is visibly bigger every visit.
- **Terrain:** swelling basalt · magma seams · uplift ridges · cinder
- **Hazard: Heat.** The WARMTH gauge runs the other way: it climbs. Eruptions on a cycle re-shape the map.
- **Signature mechanic: The exhale.** Each landing adds new ground at the map edges: Pyrauna is the one world that grows.
- **Telescope, 1936:** *ORANGE BODY. BRIGHT FISSURES ACROSS THE DISC.*
- **Sound:** Deep rumble; stone cracking like ice.

### Set 07 · QUORAUNA — The Compression World
**Canon:** Collapse megabeast (formerly Quoraxal): the Great Scale. **First race:** THE GREAT SCALE, axis-being of collapse.

> Fissures pull rather than push; matter falls toward an unseen centre of pressure. Pyrauna's exact opposite and necessary balance.

- **Environment:** Grey compressed stone that slopes inward everywhere, sinkholes and pressure-folded ridges all pointing at one centre.
- **Terrain:** compressed stone · sinkholes · pressure folds · dense dust
- **Hazard: The pull.** Fissure tiles drag you one tile toward the centre each step. Walk across them, never along them.
- **Signature mechanic: Everything falls inward.** Dropped items and loose finds slide toward the centre: the deepest point collects the rarest discoveries.
- **Telescope, 1936:** *GREY BODY. THE SURFACE DARKENS TOWARD A SINGLE POINT.*
- **Sound:** Pressure in the ears.

### Set 08 · CYTHERION — The Grid World
**Canon:** First artificial structure: the Grid. **First race:** SYNTHRAX: all Branch IV insectoids trace here.

> A self-replicating geometric Grid wrapped Cytherion before any creature could claim it. Synthara Astralite (Future/Systems) cores here. The Mandrake egg from Draevos was laid here, hatching Mykarlyth.

- **Environment:** Dark lattice plains crossed by glowing lines, hexagonal hive towers, conduits humming in regular intervals.
- **Terrain:** lattice plate · conduits · hive cells · grid walls
- **Hazard: Replication.** Grid walls grow while you are inside: the maze slowly closes behind you.
- **Signature mechanic: Systems.** Synthara Astralite lets Carl's ship tools 'read' the Grid: conduits reveal the route to the centre.
- **Canon landmarks:** The egg-site of Mykarlyth
- **Telescope, 1936:** *DARK BODY CROSSED BY PERFECTLY REGULAR LINES. ARTIFICIAL?*
- **Sound:** Clicks in strict time.

### Set 09 · ZYRAXIS — The Mothergem World
**Canon:** Gemlords. Gems first crystallise. **First race:** GEMLORDS · 10 Fathergem-born.

> The first world where matter chose form. Two planetary rings: one of light, one of stored memory. Ten districts, ten Gemlords.

- **Environment:** The Mothergem World is explored district by district; each district is its own environment (below).
- **Terrain:** see districts
- **Hazard: By district.** Each district has its own hazard.
- **Signature mechanic: Ten districts.** Malezor → Zarvane → Andrannor → Veridan → Netharion → Vorashil → Xilnar → Baelgor → Thardun → Korathen.
- **Telescope, 1936:** *CRYSTALLINE BODY, VIOLET CAST. TWO RINGS.*
- **Sound:** By district.

### Set 10 · MYRACLESE — The Dominion World
**Canon:** Enforced devotion. Mykarlyth · the Third Thamonian Lens. **First race:** HUMANOIDS: their first true home.

> Mykarlyth, an Immortal Titan, rules from a chapel-light that reaches every horizon. No privacy of mind. The Third Thamonian Legion enforces devotion. Egnellahc was born here.

- **Environment:** Gilded processional roads between marble chapels; the chapel-light hangs on every horizon so there is no true night. Crowds move in liturgical patterns.
- **Terrain:** gilded paving · marble courts · processional roads · chapel gardens
- **Hazard: No privacy of mind.** Legion patrols question strangers. STALK past them, or answer in the forms of devotion the Haemen teach you.
- **Signature mechanic: The liturgy.** Crowds follow fixed routes at fixed hours; learning the schedule opens doors.
- **Canon landmarks:** Mykarlyth's chapel-light · The forge of the Third Thamonian Lens
- **Telescope, 1936:** *GOLDEN BODY. A STEADY POINT OF LIGHT ON THE NIGHT SIDE THAT NEVER GOES OUT.*
- **Sound:** Bells, always bells.

### Set 11 · BELLATORA — The War World
**Canon:** Endless war: the Matriarch. **First race:** BEASTFOLK (Branch VI · animal-humanoid crosses).

> A world that has never known peace and was never designed to. The Matriarch weaponises every faction equally. A matriarchal warrior culture: combat is for the love of the Queen and the Princess. Cease-fires last as long as a held breath.

- **Environment:** Scarred battlefields, palisades and trenches, clan banners, war camps between the fronts. The front lines move between visits.
- **Terrain:** churned mud · scorched earth · trenches · palisades
- **Hazard: The fronts.** No-man's-land is crossed only in a cease-fire window. Misjudge it and the battle reaches you.
- **Signature mechanic: Allegiance.** Clans grant passage, and cards, to those who honour the Queen and the Princess.
- **Telescope, 1936:** *RED-BROWN BODY. SMOKE PLUMES ACROSS THE DAY SIDE.*
- **Sound:** War drums with no beginning.

### Set 12 · YVORIS — The Frozen World
**Canon:** Frozen stasis; enduring hardened forms. **First race:** Enduring hardened forms (Synthetic precursors) · time-preserved archive lifeforms.

> Time does not pass on Yvoris; it pools. Anything that arrives is preserved exactly as it arrived. A vault, or a regret made geological.

- **Environment:** Blue-white ice fields where creatures and travellers stand frozen mid-motion like statues; every one of them is a discovery.
- **Terrain:** snow · clear ice · frozen tableaux · ice cliffs
- **Hazard: Pooling time.** WARMTH drains, and standing still too long begins to freeze you in place. Keep moving.
- **Signature mechanic: The vault.** Frozen subjects are documented like statues: perfect, motionless photographs every time.
- **Telescope, 1936:** *WHITE BODY. VERY HIGH ALBEDO. NO CHANGE BETWEEN OBSERVATIONS.*
- **Sound:** Silence that has been kept on purpose.

### Set 13 · KYRATHOS — The Truth World
**Canon:** Hidden world of awareness. **First race:** The Unblinking Awareness: minimal life.

> Almost invisible from orbit under a permanent low-light shroud. Those who reach the surface report a single unblinking awareness watching back. Kyrathos accepts no falsehood.

- **Environment:** A world in permanent dusk. Only what the carbide lamp touches is visible. Somewhere, always, the feeling of being looked at.
- **Terrain:** shadow plain · dim stone · glass-black pools
- **Hazard: Darkness.** Visibility is the lamp radius only; the field sketch fills in slowly.
- **Signature mechanic: No falsehood.** Haemen and the world itself ask questions. A false answer ends the expedition with an immediate recall.
- **Telescope, 1936:** *BODY NEARLY INVISIBLE. DETECTED ONLY WHEN IT PASSES IN FRONT OF A STAR.*
- **Sound:** A held breath.

### Set 14 · NEXYROS — The Humanoid Prime World
**Canon:** Abandoned post-Transplacement. Egnellahc's ritual point. **First race:** EGNELLAHC'S CONGREGATION (the Nexyrosillians), gone after the Transplacement.

> Once the cradle of the Humanoid Prime form, emptied in a single ritual: Egnellahc gathered his congregation and crossed elsewhere, leaving the spiral scar of his cosmic working. The four Nexyrosillian Kings were founded here. Doors that big do not always stay shut.

- **Environment:** Empty humanoid cities, intact and abandoned mid-life, arranged around a planet-sized spiral scar. The most human-feeling ruins Carl will find.
- **Terrain:** cracked flagstone · empty streets · ritual circles · the spiral scar
- **Hazard: The scar.** Near the spiral scar, unstable openings appear. Step into one and you are recalled, rattled, to the ship.
- **Signature mechanic: What they left.** Abandoned homes are full of Historical records: the richest archive of humanoid history in the Expanse.
- **Canon landmarks:** The spiral scar of the Transplacement · Egnellahc's ritual point
- **Telescope, 1936:** *GREY BODY MARKED BY A VAST SPIRAL.*
- **Sound:** Wind through empty doorways.

### Set 15 · JYNAERA — The Time World
**Canon:** Hyper-accelerated time. **First race:** AVIANS (Branch III · likely) · time-accelerated cultures.

> One Jynaeran second equals several Aenoric years. Cultures rise and fall between heartbeats.

- **Environment:** Layered strata of a thousand civilisations, ruins stacked on ruins, purple dusk light that flickers like a film between frames.
- **Terrain:** layered strata · stacked ruins · flicker-fields
- **Hazard: Ageing.** Exposed film and specimens age fast. Develop and analyse quickly, or lose the record.
- **Signature mechanic: Never the same twice.** The map is regenerated on every landing: a new civilisation, a new set of cards.
- **Telescope, 1936:** *SURFACE FEATURES CHANGE BETWEEN OBSERVATIONS MINUTES APART.*
- **Sound:** Ticking, too fast to count.

### Set 16 · SYLVANIR — The Conscious World
**Canon:** Sentient forest consciousness. **First race:** THE CANOPY MIND · Beastfolk / nature forest sapients.

> A forest that thinks across continents as a single mind. Canopy patterns rearrange into expressions. Visitors describe it as kind, and leaving as harder than expected.

- **Environment:** Deep, gentle forest with giant trunks and soft light. The canopy forms faces; paths quietly bend back toward the forest heart.
- **Terrain:** forest floor · giant trunks · fern glades · canopy light
- **Hazard: Kindness.** Paths lead back toward the forest heart. Leaving takes a flare or real navigation.
- **Signature mechanic: Expressions.** The canopy reacts to what Carl does; kind actions open hidden glades.
- **Telescope, 1936:** *DARK GREEN BODY. CANOPY PATTERNS SHIFT BETWEEN PLATES.*
- **Sound:** Leaves that sound like breathing.

### Set 17 · VELKRYN — The Consumption World
**Canon:** Crimsonian Titans · pure consumption. **First race:** GREATKIN CYCLOPES: the Crimsonian Titans, single-eye cosmic giants.

> Hunger metabolic and metaphysical at once. Velkryn does not produce; it intakes. Its mouth-like crater rings widen by visible degrees each century.

- **Environment:** Crimson crater-rings nested inside one another, bone-white rims, flesh-red stone, everything sloping toward a vast maw.
- **Terrain:** crimson rock · crater rims · bone fields · the maw
- **Hazard: The widening.** Crater rims crumble inward. Anything set down near a rim is gone on the next visit.
- **Signature mechanic: Hunger.** Titans are territorial encounters on the largest scale; most documentation is done from far off.
- **Canon landmarks:** Velkryn the Widening Mouth
- **Telescope, 1936:** *DEEP RED BODY. CONCENTRIC CRATERS LIKE TARGET RINGS.*
- **Sound:** A low, endless swallowing sound.

### Set 18 · IGNARA — The Instability World
**Canon:** Failed balance; perpetual ignition. **First race:** REPTILOIDS (Branch II · fire-kin · the lone Reptiloid world).

> Meant to balance fire and stone in equal measure. The calibration failed; the surface has burned for six billion years without consuming itself. A cautionary world.

- **Environment:** Fields of flame that never consume their fuel, ash plains, obsidian ridges; fire behaves like weather.
- **Terrain:** burning fields · ash plain · obsidian ridges · ember rivers
- **Hazard: Flare-ups.** Ground ignites on a rhythm. Cross between flare-ups; SUIT burns if you misjudge.
- **Signature mechanic: Unconsumed.** Fire here is a material: lantern-fire carried from Ignara never goes out (a ship upgrade).
- **Telescope, 1936:** *BURNING BODY. THE WHOLE DISC FLICKERS.*
- **Sound:** Crackling, everywhere, forever.

### Set 19 · URALYX — The Perception World
**Canon:** Perception shapes reality. **First race:** Perception-shaped forms (UNKNOWN / energy).

> What is observed becomes; what is not, fades. Mountains thin while no one looks at them. A wandering eye on Uralyx is geology.

- **Environment:** Pale lavender ground that is only solid where Carl has looked. Out of view, the map thins and redraws; the camera can make a bridge real.
- **Terrain:** observed ground · fading ground · thinning peaks
- **Hazard: Unwatched ground.** Tiles outside the field of view fade. Turn your back on a path and it may not be there.
- **Signature mechanic: Observation is construction.** Photographing a gap fixes a bridge across it. The camera is the main tool on Uralyx.
- **Telescope, 1936:** *SURFACE INDISTINCT. DETAIL RESOLVES ONLY UNDER LONG, STEADY OBSERVATION.*
- **Sound:** A tone that changes when you stop listening.

### Set 20 · HALCYRA — The Harmony World
**Canon:** Oceanic harmony with devotion. **First race:** AQUATICS (Branch V) · the devotional oceanic Order.

> Where Thallassar sings, Halcyra prays. Oceans organised into vast devotional patterns: currents that hold their shape across millennia. The calm is real, not a mask.

- **Environment:** Calm teal seas with currents in geometric devotional figures, coral chapels, white sand bars. The gentlest world in the Expanse.
- **Terrain:** patterned currents · coral chapels · sand bars · still lagoons
- **Hazard: None.** Halcyra is safe. AIR still limits dives.
- **Signature mechanic: Currents.** Current tiles carry you along their pattern; reading the devotional figures is the puzzle.
- **Canon landmarks:** The Halcyran Choirs
- **Telescope, 1936:** *OCEANIC BODY. CURRENTS FORM REGULAR GEOMETRIC FIGURES.*
- **Sound:** A slow hymn carried by water.

### Set 21 · WYVERA — The Ascension World
**Canon:** Sky-dominant winged predators. **First race:** AVIANS (Branch III · sky-predator bird-humanoid).

> Draevos's quieter, sharper descendant. Predators dominate by altitude, not mass: the higher you fly the truer you become. Many traditions of ascension trace their first hymns here.

- **Environment:** Towering mesas and needle spires above a sea of blue air; rope bridges and updrafts link the heights. The map is a climb.
- **Terrain:** mesa tops · needle spires · updraft shafts · cliff ledges
- **Hazard: Altitude.** Edges are falls (recall). Predators dive at anyone in the open on the high ground.
- **Signature mechanic: Ascension.** The best discoveries are at the top. Each height reached is a Location card.
- **Canon landmarks:** The Wyveran Ascendants
- **Telescope, 1936:** *BLUE BODY. TOWERING COLUMNS OF CLOUD.*
- **Sound:** Wind across a bottle neck, rising.

### Set 22 · RHYZOR — The Resonance World
**Canon:** Sound is matter. **First race:** Sound-carriers: Beastfolk + Synthetic · architects of pitch.

> A sustained note can be picked up and carried. A scream can become weather. Concentric sound-ripples mark the surface like growth rings. First of the "physics belt" worlds.

- **Environment:** Ripple-ringed stone plains and tuning pillars; solid notes lie where they were sung. Noise has weight here.
- **Terrain:** ripple stone · tuning pillars · solid notes · echo basins
- **Hazard: Noise.** Running is loud, and loud is solid: noise leaves obstacles behind you. STALK to move silently.
- **Signature mechanic: Carrying a note.** Carl's wireless can 'hold' a note and set it down as a temporary bridge or wall.
- **Canon landmarks:** The Rhyzoran Sound-Masons
- **Telescope, 1936:** *BODY SHOWS CONCENTRIC RINGS. THE WIRELESS PICKS UP PURE TONES.*
- **Sound:** Overtones layered like weather.

### Set 23 · ELYTHERA — The Floating World
**Canon:** Floating continents. **First race:** AVIANS (Branch III · floating civilisations) · aeronauts.

> Landmasses long ago let go of the planet beneath them and drift on currents of air and intention. Maps are kept as appointments, not records.

- **Environment:** Green islands adrift over a cloud sea, bridged by vines and aeronaut lines. The landing site itself drifts.
- **Terrain:** island meadow · island edge · cloud sea · vine bridges
- **Hazard: Drift.** Islands move between visits. The edge is a fall; the ship must find the landing again each time.
- **Signature mechanic: Appointments.** Some islands meet only at certain times; the Sky Priests keep the schedule.
- **Canon landmarks:** The Elyther Sky Priests
- **Telescope, 1936:** *LANDMASSES APPEAR DETACHED FROM THE SURFACE, CASTING SHADOWS ON CLOUD.*
- **Sound:** Ropes creaking in high wind.

### Set 24 · XYLOS — The Crystal World
**Canon:** Crystalline; frequency-locked. **First race:** ENERGY-BASED (Branch VII · crystalline / frequency) · the Xylorans.

> A polyhedral world of pure crystal lattice. Every surface vibrates at a fixed frequency; any creature out of tune shatters on contact. Xylos welcomes only the perfectly aligned.

- **Environment:** Facetted crystal plains throwing prism light; spires that ring when the wind crosses them.
- **Terrain:** crystal facets · prism fields · ringing spires
- **Hazard: Out of tune.** Unaligned facets damage SUIT on contact. Tune the wireless to the local frequency before crossing.
- **Signature mechanic: Tuning.** Each crystal field has a frequency; the radio dial becomes a key.
- **Canon landmarks:** The Xylorans
- **Telescope, 1936:** *PALE FACETED BODY. SPECULAR FLASHES AS IT TURNS.*
- **Sound:** Glass harmonica.

### Set 25 · GRAVARON — The Gravity World
**Canon:** Extreme gravity. **First race:** Gravity-adapted low-form endurers (Beastfolk + Synthetic).

> Outer-spire and impossibly dense. Light bends visibly around its silhouette. The species that adapted are squat, slow and unkillable. Closes the physics belt.

- **Environment:** Flattened dark terrain where nothing stands tall; light visibly bends near the horizon.
- **Terrain:** flattened stone · low domes · pressure plains
- **Hazard: Weight.** Movement at half speed; heavy gear slows you further. Every step costs SUIT.
- **Signature mechanic: What endures.** Landing here requires a drive refit; the Gravarene Undertakers are the reward.
- **Canon landmarks:** The Gravarene Undertakers
- **Telescope, 1936:** *DARK BODY. STARLIGHT BENDS VISIBLY AT ITS LIMB.*
- **Sound:** A sound pressed flat.

### Set 26 · FERROS — The Machine World
**Canon:** Industrial dominance. **First race:** MACHINE-WROUGHT industrialists (Synthetic mortals).

> Where Cytherion's grid was inherited, Ferros's machinery is built: forges, rails, mines, refineries across a continent-spanning works. It exports the tools the Expanse uses to remember the shape of progress. (The timeline also names it Ferralis.)

- **Environment:** Rails, forges, smokestacks and slag fields. The one world a 1936 engineer half-understands, and the best place in the Expanse to refit Carl's ship.
- **Terrain:** iron plate · rail lines · slag fields · forge yards
- **Hazard: The works.** Rail carts and furnaces run on schedules; stay off the rails when the bell rings.
- **Signature mechanic: Refits.** Ferros is where Carl's 1936 rocket becomes Earth-Aethryx hybrid technology.
- **Canon landmarks:** The Ferros Forgemasters
- **Telescope, 1936:** *POINT LIGHTS IN STRAIGHT LINES ACROSS THE NIGHT SIDE. INDUSTRY?*
- **Sound:** Hammers, engines, a whistle far off.

### Set 27 · VIRIDIA — The Balance World
**Canon:** Final planet · balance · the Veil · the Astral Core. True humans. **First race:** TRUE HUMANS · the Aur-bloodline · the Viridians.

> The saga's anchor world: fire, water, sky, earth and astral in deliberate balance. Wrapped in the Veil; powered at its heart by the Astral Core. Fifty districts. Sacred sites: the Tree of Elyssia, the Aurora Crown Bridge, Dragonsong Peaks, Glasscurrent Bay & Oceania, Cinderbay, Khronexus beneath the western territories, Heartplains Hall.

- **Environment:** The most Earth-like world Carl ever finds: green hills, rivers, towns, people who look human. For a homesick man in 1936, the hardest place to leave.
- **Terrain:** green hills · rivers · towns · sacred sites
- **Hazard: Where the Veil thins.** Near veil fractures the world bleeds into other realms; the compass and the wireless both fail.
- **Signature mechanic: Almost home.** Viridian Haemen are the first people Carl can almost talk to; relationships here go deepest.
- **Canon landmarks:** The Tree of Elyssia · The Aurora Crown Bridge · Dragonsong Peaks · Glasscurrent Bay & Oceania · Cinderbay · Khronexus · Heartplains Hall
- **Telescope, 1936:** *GREEN AND BLUE BODY WITH WHITE CLOUD. IT LOOKS LIKE HOME.*
- **Sound:** Birdsong. It sounds like home.

### Set 28 · AEP-28 — The Drift World
**Canon:** The Drift Planet: the Fourth Question. **First race:** UNKNOWN.

> Outside the ordered systems entirely; it wanders and crosses every ring. Three scholarly camps: Transition, Renewal, Forgotten. Canonically open. (In 1955 it comes to Earth: the Carl Nasaro canon.)

- **Environment:** Deliberately undesigned. AEP-28 is not drawn on the chart and is not landable in the 1936–1945 expedition. Its environment is the Creator's to reveal.
- **Telescope, 1936:** *A FAINT BODY ON AN ORBIT THAT MATCHES NOTHING ELSE.*

## Zyraxis · the ten districts

Malezor is built. The other nine follow the canon order. Landmark names come from the RP7 landmark art; Korathen's and Netharion's stay spoiler-gated in play.

### District I · MALEZOR — the Beastlands
*Gemlord: Rakoron, the Rubylord · Gem: Ruby · Beastlands*

- **Environment:** Built (survey builds 1–4). Meadow, pond and pine-dark border; the First Den in the north-east.
- **Terrain:** meadow · pond · stone path · cave
- **Hazard: Territory.** Territorial Zyrex warn, then charge.
- **Signature mechanic: First contact.** The first Haemen relationship and the first Lexicon reclassification.
- **Canon landmarks:** The First Den · The Fanghall · The Bloodscent Lodge
- **Sound:** Predators at the edge of hearing.

### District II · ZARVANE — the silver oasis
*Gemlord: Ivirium, the Pearlord · Gem: Pearl · Auralands*

- **Environment:** A silver desert around mirror-still pools, pearl-white sand and pale palms; the air hums between thoughts.
- **Terrain:** pearl sand · mirror pools · silver dunes
- **Hazard: Mirage.** Reflections in the pools show places that are not there.
- **Signature mechanic: Resonance.** Standing still near the Resonance Spire reveals hidden auras on the map.
- **Canon landmarks:** The Quiet Between · The Resonance Spire · The Vibration Conservatory
- **Sound:** A single held tone over sand.

### District III · ANDRANNOR — everything adapts
*Gemlord: Mutaryn, the Citrinelord · Gem: Citrine · Creaturelands*

- **Environment:** A restless golden savanna-jungle where species blur into one another; nothing in Andrannor keeps one shape for long.
- **Terrain:** gold savanna · hybrid thicket · chimera tracks
- **Hazard: Adaptation.** Zyrex here change form between encounters; a photograph from yesterday may not match.
- **Signature mechanic: The Menagerie.** Hybrid sightings count as new subjects.
- **Canon landmarks:** The Chimera Exchange · The Morphic Menagerie · Club VX
- **Sound:** Calls that keep changing species.

### District IV · VERIDAN — the living forest
*Gemlord: Emeralix, the Emeralord · Gem: Emerald · Naturelands*

- **Environment:** Old emerald forest, roots like walls and moss like carpet; the slowest, oldest dominance on Zyraxis.
- **Terrain:** emerald forest · root walls · moss floor
- **Hazard: The green wall.** Cut paths grow back between visits.
- **Signature mechanic: Seedvault.** Seeds are a new specimen class; planting one opens a path.
- **Canon landmarks:** The Root Parliament · The Seedvault · The Overgrowth Hospice
- **Sound:** Leaves and slow wood.

### District V · NETHARION — the world hub
*Gemlord: Eurakeon, the Amethystlord · Gem: Amethyst · Unknownlands · centre*

- **Environment:** The unstable centre of Zyraxis: violet ground, buildings at wrong angles, reality anomalies where the map does not agree with itself.
- **Terrain:** violet stone · anomaly fields · crooked streets
- **Hazard: Anomalies.** Instruments misread; the field sketch disagrees with what you see.
- **Signature mechanic: The hub.** Routes to every other district meet here.
- **Canon landmarks:** The Impossible Archive · The Null Observatory · The Crooked House
- **Sound:** A melody played slightly out of order.

### District VI · VORASHIL — the sky roads
*Gemlord: Azurel, the Sapphirelord · Gem: Sapphire · Allelands*

- **Environment:** Causeways and sky roads above blue haze; alien, non-humanoid architecture built for bodies that are not shaped like ours.
- **Terrain:** sky roads · sapphire causeways · blue haze
- **Hazard: Edges.** The roads have no rails. Off the edge is a fall and a recall.
- **Signature mechanic: Alien logic.** Haemen-like inhabitants communicate in shapes, not words; the Shape Embassy teaches the first ones.
- **Canon landmarks:** The Shape Embassy · The Manybody Habitat · The Unmouth Academy
- **Sound:** Chords in a scale we do not use.

### District VII · XILNAR — the binding mountains
*Gemlord: Obsidius, the Onyxlord · Gem: Onyx · Spiritlands*

- **Environment:** Black mountains and lantern-lit passes; souls and death-energy move in the half-light. The home of the only Gemlord still walking.
- **Terrain:** onyx slopes · lantern passes · spirit fog
- **Hazard: Spirit fog.** Visibility drops between lanterns; light the lanterns to hold the path.
- **Signature mechanic: Binding.** Obsidius's bindings can be seen and photographed, but never crossed.
- **Canon landmarks:** The Last Lantern · The Blackwake Chapel · The Walking Lords Station
- **Sound:** Bells far below the mountain.

### District VIII · BAELGOR — the ember reach
*Gemlord: Ambrevon, the Amberlord · Gem: Amber · Humanoidlands*

- **Environment:** Amber-lit towns, warm stone and ember skies: civilisation, structure, the humanoid ideal. The most populous district.
- **Terrain:** amber streets · warm stone · ember fields
- **Hazard: Crowds.** None dangerous; Haemen everywhere. Relationships, trade and missions are the depth here.
- **Signature mechanic: First Settlement.** The Hall of First Settlement holds the oldest Historical records on Zyraxis.
- **Canon landmarks:** The Hall of First Settlement · The Tenfold Forum · Baelgor University
- **Sound:** Market noise and hearth-crackle.

### District IX · THARDUN — the Mechlands
*Gemlord: Oathane, the Anomaly (missing) · Gem: Ninth formation · Mechlands*

- **Environment:** Precision machinery that has run without its god: foundries, gears, measured streets. It grew strange because it grew alone.
- **Terrain:** steel plate · gear works · measured streets
- **Hazard: The machinery.** Mechanisms run on timers; crossing the works is a timing puzzle.
- **Signature mechanic: The Orphan Foundry.** Machines without makers: technology cards for the ship.
- **Canon landmarks:** The Precision Ministry · The Orphan Foundry · The Anomaly Engine
- **Sound:** Gears without a conductor.

### District X · KORATHEN — the far seat
*Gemlord: Oatheus, the Ultralord (missing) · Gem: Tenth formation · Ultralands*

- **Environment:** High gold-white plateaus around a seat no one occupies; law and silence, absolute authority with no one to wield it.
- **Terrain:** gold plateaus · white stone courts · law-stones
- **Hazard: The far seat.** Korathen is reached last; the climb is the hazard.
- **Signature mechanic: Spoiler-gated.** Its landmarks stay hidden until the story reaches them.
- **Canon landmarks:** The Tribunal of Ten · The Mothergem Sanctum · The Empty Throne
- **Sound:** Wind over a stage after the audience has gone.

## What comes next

1. **Creator review** of each environment: the concepts, hazards and mechanics are design and can change; landmarks and traits are canon.
2. **Build order suggestion:** Zarvane (next district on foot), then Viridia (the emotional heart of the 1936–1945 story), then Ferros (ship refits), then the physics belt (Rhyzor, Xylos, Gravaron).
3. **Per-world content:** each world still needs its Aethren, Haemen and plants from canon before it becomes playable.
