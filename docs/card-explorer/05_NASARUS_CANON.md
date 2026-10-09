# NASARUS · Planet Headquarters & World Restoration

*Creator handoff, recorded verbatim on 2026-10-09. Canon V1.0 · Status: approved canonical addition · Implementation: additive.*

---

Here is the complete NASARUS game-development handoff for Aethryx Adventures: 1936 (AA:1936), consolidating the approved lore, gameplay integration, headquarters functionality, customization, and future expansion opportunities.

AETHRYX ADVENTURES: 1936
NASARUS — Planet Headquarters & World Restoration
Official Game Development Handoff | Canon V1.0
Project: Aethryx Adventures: 1936 (AA:1936)
Universe: The AOV™ Saga
Canonical Protagonist: Carl Nasaro
Canonical Headquarters Planet: NASARUS
Primary Gameplay: Explore → Extract → Return → Develop
Status: Approved canonical addition
Implementation: Additive; preserve existing game systems and established story continuity.

## 1. EXECUTIVE OVERVIEW

NASARUS is the player's permanent headquarters planet in Aethryx Adventures: 1936.

In 1936, Carl Nasaro's experimental American spacecraft accidentally enters hyperspace and crash-lands on NASARUS, an ancient drifting planet originating from the Aethryx Expanse.

The planet initially appears desolate, but it contains the ruins of a civilization that existed before the First Eternal War.

Carl establishes his first survival camp on NASARUS and gradually transforms it into a research headquarters, expedition base, and potentially a restored inhabited world.

NASARUS must serve three purposes:

1. The narrative starting point of AA:1936.
2. The persistent headquarters for exploration, collection, and progression.
3. A foundation for long-term world restoration and a possible future spinoff.

The player travels outward to explore the Aethryx Expanse, extracts discoveries and resources, and returns to NASARUS to organize findings and develop the headquarters.

The game remains an exploration, collection, mapping, and card-based adventure. NASARUS expands those mechanics rather than replacing them.

## 2. CANONICAL PLANET HISTORY

**The Ancient Era — Before the First Eternal War**

NASARUS is an ancient planet that once supported populations of Haemen and Aethren.

Its civilization possessed established settlements, constructed buildings, and recognizable landmarks.

Evidence of this period survives in the form of abandoned structures, ruined settlements, monuments, and other remnants scattered across the planet.

The precise age of NASARUS, its former political structure, and the identities of its original civilizations have not yet been established.

**The Lost Era**

At some point, NASARUS became an apparently desolate drifting planet.

Its former civilization disappeared, leaving behind extensive ruins.

Important lore restriction: The cause of NASARUS's abandonment is currently unknown.

Do not establish that the First Eternal War destroyed NASARUS, exterminated its inhabitants, or caused its planetary drift without further approval.

The only confirmed historical relationship is that Haemen and Aethren inhabited NASARUS before the First Eternal War.

**1936 — Carl Nasaro's Arrival**

Carl Nasaro enters hyperspace during his classified experimental American space mission.

His spacecraft malfunctions, and he crash-lands on NASARUS.

Unaware of the planet's original identity, Carl names it after himself.

He begins with limited supplies, damaged equipment, incomplete navigational knowledge, and no understanding of the wider Aethryx Expanse.

He establishes his first camp.

As Carl explores NASARUS, he discovers that the planet was once inhabited.

The ruins become his first evidence that he has reached a region containing civilizations unknown to Earth.

NASARUS becomes the starting point for his wider expedition.

## 3. CANONICAL NAMING & PLAYER CUSTOMIZATION

The official AOV™ Saga identities are:

* Astronaut: Carl Nasaro
* Headquarters planet: NASARUS

Players may rename their astronaut and headquarters planet.

These are personalization features and do not rewrite established canon.

Implementation requirements:

* Provide a player-name field.
* Provide a headquarters-planet-name field.
* Default to Carl Nasaro and NASARUS.
* Store customized names in the player's save profile.
* Use customized names in appropriate player-facing interface elements.
* Preserve canonical identities in official lore records and developer documentation.
* Do not allow player renaming to modify the shared Master Codex or established historical events.

Internally, use a stable planet identifier independent of the player-facing name.

Suggested identifier: `nasarus`.

## 4. CORE GAMEPLAY LOOP

The headquarters system revolves around four primary actions.

**EXPLORE**

Depart NASARUS to investigate other locations within the Aethryx Expanse.

Visit planets, regions, settlements, ruins, and other accessible destinations.

Encounter Haemen, Aethren, and other established AOV entities.

Discover locations and uncover historical information.

**EXTRACT**

Collect resources, artifacts, materials, technologies, specimens, cards, and research information through supported exploration mechanics.

Extraction does not imply every discovery must be physically removed. Some discoveries may be documented through observation, scanning, photography, or research.

Preserve established card classifications, rarity tiers, and world-based collections.

**RETURN**

Travel back to NASARUS.

Deposit collected materials, organize discoveries, update the Codex, and prepare for further expeditions.

NASARUS serves as the central point connecting individual expeditions.

**DEVELOP**

Use eligible materials and completed research to improve the headquarters.

Restore existing structures, build new facilities, unlock capabilities, and expand the player's operational area.

Progression should make NASARUS feel increasingly functional and inhabited.

Primary loop:

EXPLORE → EXTRACT → RETURN TO NASARUS → CATALOG → DEVELOP → EXPLORE AGAIN

## 5. NASARUS HEADQUARTERS

NASARUS begins as a small survival camp near Carl's crash site.

The world must remain persistent between expeditions.

Changes to buildings, unlocked areas, stored resources, and restoration progress must be retained through the save system.

**Initial Headquarters**

The opening version should include:

* Carl's crash-landed spacecraft.
* A basic camp or shelter.
* An initial storage area.
* A research journal or Codex access point.
* A navigation interface.
* Nearby explorable terrain.
* Visible ancient ruins that establish the planet's history.

**Proposed Expandable Facilities**

The following are implementation proposals, not additional historical canon.

* Research Station: Analyze collected discoveries and unlock research progression.
* Card Archive: Review owned cards, organize collections, and prepare decks.
* Navigation Center: Access the Aethryx map, review discovered worlds, and select available expeditions.
* Resource Depot: Store extracted materials and manage construction requirements.
* Workshop: Repair equipment, craft supported upgrades, and improve expedition tools.
* Restoration Terminal: Manage reconstruction of NASARUS structures and landmarks.
* Habitation Zone: Support future settlers or inhabitants if population development is approved.
* Historical Archive: Display recovered records of NASARUS's prewar civilization.

These facilities should be implemented modularly so the development team can introduce them progressively.

## 6. ANCIENT RUINS & LANDMARKS

NASARUS is not simply an empty planet awaiting construction.

Its ancient history must be visible throughout the environment.

The world should contain the remains of former Haemen and Aethren habitation.

**Environmental Categories**

Ruined Settlements

* Abandoned residences
* Collapsed civic buildings
* Ancient streets and gathering areas
* Remnants of former habitation

Historical Landmarks

* Monuments
* Unidentified structures
* Architectural landmarks
* Cultural or ceremonial sites, where later established by canon

Archaeological Areas

* Buried structures
* Damaged inscriptions
* Recoverable artifacts
* Areas containing evidence of ancient inhabitants

Natural Terrain

* Desolate open ground
* Rocky formations
* Drifting-planet environmental features
* Terrain separating major ruin clusters

The exact architectural styles, biomes, and ancient settlement names remain subject to official design approval.

**Exploration Requirements**

Ruins should not function only as background decoration.

Where appropriate, they should support:

* Exploration
* Collectible discoveries
* Environmental storytelling
* Archaeological research
* Historical Codex entries
* Unlockable restoration projects

Players should gradually understand that NASARUS had a history long before Carl arrived.

## 7. WORLD RESTORATION SYSTEM

A central long-term opportunity is allowing the player to rebuild NASARUS.

Restoration should begin modestly.

Carl's first priority is survival and continued exploration, not immediately constructing an entire civilization.

Over time, headquarters development may expand into larger planetary restoration.

**Proposed Progression Stages**

* Stage 1 — Crash Site: Carl survives, establishes shelter, and begins surveying the planet.
* Stage 2 — Expedition Camp: Storage, research, navigation, and basic equipment systems become available.
* Stage 3 — Established Headquarters: Additional facilities and restored structures support more complex expeditions.
* Stage 4 — Reclaimed Settlement: Players can restore larger sections of ancient ruins and develop new infrastructure.
* Stage 5 — Emerging World: A future expansion could introduce inhabitants, settlement management, specialized districts, and a larger functioning society.

Stages 4 and 5 represent long-term development possibilities, not mandatory launch features.

**Restoration Principles**

* Preserve the identity of ancient ruins where appropriate.
* Distinguish restored historical buildings from newly constructed facilities.
* Require progression through exploration and discoveries.
* Avoid making large-scale construction mandatory for every player.
* Keep the planet's appearance responsive to player actions.
* Ensure restoration progress persists across sessions.

NASARUS should visibly evolve from a lonely crash site into a world shaped by the player's journey.

## 8. CONNECTION TO THE LIVING MASTER CODEX

Aethryx Adventures: 1936 is the official game title.

The Living Master Codex is the underlying expandable lore, discovery, and content schema.

It is not the public-facing title of the game.

NASARUS provides a physical headquarters for accessing and organizing this information.

The Codex should distinguish between:

* Master Canon: The established historical and fictional truth of The AOV™ Saga.
* Player Discoveries: Information the individual player has personally uncovered.
* Card Inventory: Collectible cards currently owned by the player.
* Planetary Survey: The player's documented exploration and discovery progress.
* Restoration Records: NASARUS construction, archaeological findings, and development progress.

The headquarters should integrate with these systems without merging them into one indistinguishable inventory.

The existing world-based master card sets remain intact.

NASARUS should be represented in navigation, discovery, and world-state systems. Whether it receives a separate collectible master set is a future content decision and should not be automatically assumed.

## 9. NAVIGATION & WORLD STRUCTURE

NASARUS becomes the default headquarters location and the player's initial active world.

The opening game sequence must reflect the revised arrival order:

1. Carl's classified 1936 space mission.
2. Accidental hyperspace entry.
3. Crash landing on NASARUS.
4. Survival and first camp establishment.
5. Discovery of ancient ruins.
6. Development of navigation and expedition capabilities.
7. Exploration of Zyraxis and other Aethryx worlds.

This replaces only the earlier shorthand that Carl landed directly on Zyraxis.

The wider Zyraxis storyline, RP7 continuity, and all established events remain unchanged.

NASARUS must remain distinct from AEP-28, the separately established drifting world.

Do not merge their identities or histories.

## 10. SAVE DATA & PERSISTENCE

The NASARUS system requires persistent player-specific world state.

Suggested data structure:

```json
{
  "game_id": "aa1936",
  "player": {
    "canonical_identity": "Carl Nasaro",
    "display_name": "Carl Nasaro"
  },
  "headquarters": {
    "planet_id": "nasarus",
    "canonical_name": "NASARUS",
    "display_name": "NASARUS",
    "current_stage": 1,
    "camp_established": false,
    "unlocked_regions": [],
    "restored_landmarks": [],
    "constructed_facilities": [],
    "stored_resources": {},
    "research_progress": {},
    "discovered_ruins": []
  },
  "expedition": {
    "current_location": "nasarus",
    "discovered_destinations": [],
    "survey_progress": {}
  }
}
```

This is a suggested logical schema, not a requirement to replace the game's existing backend structure.

**Persistence Requirements**

* Save player and planet display names.
* Save headquarters construction.
* Save restored landmarks.
* Save archaeological discoveries.
* Save storage and resources.
* Save navigation unlocks.
* Save the player's active location.
* Maintain compatibility with existing account, inventory, and Codex systems.
* Avoid duplicate rewards when loading restored structures or previously completed discoveries.

Use the established shared AOV account/backend architecture where applicable.

## 11. USER INTERFACE REQUIREMENTS

NASARUS should function as the central hub of the player experience.

**Headquarters Screen.** Display: current NASARUS environment · player character · accessible structures · navigation or expedition access · inventory and storage · Codex access · restoration opportunities.

**Planet Map.** Show: crash site · discovered ruins · accessible regions · headquarters facilities · restored landmarks · undiscovered or locked areas where appropriate.

**Expedition Interface.** Allow the player to: view discovered destinations · select available expedition locations · review exploration objectives · prepare inventory and equipment · depart NASARUS · return with discoveries.

Avoid unnecessary menu complexity. The interface should remain suitable for mobile-first play.

## 12. VISUAL & ART DIRECTION

NASARUS must communicate two distinct historical layers.

**Ancient NASARUS.** Ruined architecture from a lost Haemen and Aethren civilization. Weathered buildings, damaged monuments, abandoned settlements, and evidence of a much older world. The exact ancient architectural identity is not yet approved.

**Carl's NASARUS.** A small human expedition camp built with equipment and materials reflecting Carl's 1936 origin. Visual influences include: 1930s experimental aerospace engineering · riveted metal construction · analog instrumentation · mechanical equipment · field research stations · handwritten maps and scientific records · improvised repairs and survival structures.

As Carl acquires Aethryx materials and technologies, his headquarters can develop into a hybrid of Earth engineering and extraterrestrial capabilities.

Maintain the game's approved classic top-down 2D exploration direction.

Do not replace it with an entirely different visual style simply because NASARUS supports construction.

## 13. STORY CONTINUITY — DO NOT CHANGE

NASARUS is an additive introduction to the existing story.

**1936.** Carl Nasaro accidentally enters hyperspace and crash-lands on NASARUS. He establishes his camp and begins exploring the Aethryx Expanse, including Zyraxis.

**During the Expedition.** Carl eventually meets Aurellyn. Aurellyn is the son of Aurexion, formerly Andre Hart of Viridia. Aurexion was Rizer's ally and gave Rizer the UFO. Rizer later trained Aurellyn. Carl tells Aurellyn about Earth.

**1945.** Earth's nuclear detonations create an Aetherstride ping. Carl and Aurellyn locate Earth and travel there together.

**1945–1955 — Conspiracy Era.** The U.S. government attempts to contain Carl and Aurellyn. Aurellyn escapes. Carl is confined and pressured to surrender his research. Aurellyn protects most of Carl's original discoveries and later rescues him. The two seek to expose hidden extraterrestrial activities. The period contributes to UFO conspiracy culture and secret aerospace research.

**1955.** Ovauron arrives above Earth pursuing Aurellyn. The crisis centers in California. Aurellyn publicly reveals himself through the Aurelleap. Ovauron is defeated. Its destruction produces the Skyfall. The Skyfall begins Mutagenesis, leading to the later emergence of superpowered heroes and villains.

None of these events are rewritten by the introduction of NASARUS.

## 14. FUTURE SPINOFF OPPORTUNITY

NASARUS can eventually support a separate game focused on planetary restoration.

The spinoff would expand the headquarters-building systems into a full world-development experience.

Possible mechanics include: rebuilding ancient cities · restoring historic landmarks · developing new settlements · managing resources · supporting inhabitants · studying prewar civilizations · exploring previously inaccessible ruins · establishing a new planetary society.

No official spinoff title, protagonist, or timeline has been established.

The current AA:1936 implementation should preserve the possibility without requiring the full spinoff to be built now.

## 15. DEVELOPMENT PRIORITIES

**Phase 1 — Required Foundation:** implement NASARUS as the canonical starting planet · add the hyperspace crash-landing introduction · establish Carl's initial camp · create a persistent headquarters map · support astronaut and planet naming · add basic departure and return navigation · integrate NASARUS with existing inventory and Codex systems · place initial ancient ruins in the environment.

**Phase 2 — Headquarters Progression:** introduce resource storage · add modular research and workshop facilities · implement headquarters upgrades · add archaeological discoveries · support restoration of selected ancient structures · connect exploration rewards to headquarters development.

**Phase 3 — Expanded Restoration:** expand explorable NASARUS regions · introduce larger restoration projects · develop additional environmental storytelling · add settlement-development systems if approved · prepare data structures for possible future spinoff expansion.

Development rule: Phase 1 must work independently. Do not block the core AA:1936 expedition experience behind unfinished advanced settlement mechanics.

## 16. ACCEPTANCE CRITERIA

The NASARUS update is successfully integrated when:

* A new game begins with Carl's 1936 crash landing on NASARUS.
* NASARUS is identified internally as the persistent headquarters planet.
* The player can customize their astronaut and planet names.
* The player can explore NASARUS and discover evidence of its ancient civilization.
* The player can travel to another unlocked destination and return.
* Discoveries and collected materials remain available after returning.
* Headquarters progress persists after saving and reloading.
* The Living Master Codex continues to function as the underlying discovery schema.
* All established card systems and canonical world identities remain intact.
* No existing 1945–1955+ story events are overwritten.

## 17. FINAL IMPLEMENTATION DIRECTIVE

Add NASARUS to Aethryx Adventures: 1936 as the canonical starting world and persistent player headquarters.

Preserve the existing game architecture, exploration mechanics, card systems, lore, and timeline.

NASARUS is an ancient drifting planet once inhabited by Haemen and Aethren before the First Eternal War. Its abandoned settlements and landmarks remain as ruins.

Carl Nasaro crash-lands there in 1936, establishes his first camp, and uses the planet as his headquarters while exploring the Aethryx Expanse.

Players may personalize the astronaut's and planet's names, but Carl Nasaro and NASARUS remain the official canonical identities.

The gameplay loop is:

EXPLORE → EXTRACT → RETURN TO NASARUS → CATALOG → DEVELOP → REPEAT

Implement headquarters functionality first, then modular restoration systems, while retaining the possibility of a future NASARUS-focused planetary rebuilding spinoff.

Do not rewrite existing canon or replace working game systems. This is an additive expansion.

END OF HANDOFF — NASARUS V1.0

Recommended implementation approach: Build the persistent crash-site headquarters and round-trip expedition loop first. Once those work, connect collected resources to facility upgrades and the restoration of ancient ruins. This establishes NASARUS as the game's home without delaying the main exploration experience.
