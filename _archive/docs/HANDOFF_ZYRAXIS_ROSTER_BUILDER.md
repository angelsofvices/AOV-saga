# HANDOFF · Zyraxis Roster Builder Chat

**Purpose:** spec the complete 180-slot Zyrex whitelist for *Rizing Powers of Zyraxis* — 150 Primary Dex (catchable district-native Zyrex, 10 districts × 15 slots) + 30 Shadow Dex (Aurabeasts, endgame Seer trio, cosmic entities, special 4th over-evolutions, expansion). The finished roster gets imported back into the game project (`rizers.html` + `data/codex.js`) in a single sweep, replacing the current 124-species hydrated codex with your curated Prime Nine selection.

**Deliverable format:** fill out the skeleton spreadsheet `aov_rizers_roster_v3.17_prime_nine.xlsx` (already generated, attached to this handoff). Every row that says `to design` in the Source column needs a NAME (column L) and ID handle (column M). Types can override the suggested ones. When done, save and hand back to the game chat; the game chat sweeps every filled row into the running game as V3.17.

---

## THE KICKOFF PROMPT

Paste this at the start of the fresh Cowork chat to orient it fast:

> I'm building the Zyrex roster for my Pokémon-like RPG *Rizing Powers of Zyraxis*, part of my original-IP cinematic universe The AOV Saga. Zyraxis is planet 9 in the Aethryx Expanse (Genesis System). I need to spec 180 Zyrex total: 150 catchable district-native Zyrex + 30 beyond-the-dex special forms. The roster follows a strict evolution-ladder system, an astralite-family district mapping, a 20-type combat system, and canonical anchor Zyrex I've already locked. I have a full handoff document with all canon references and a skeleton spreadsheet ready to fill. Ready to work?

Then attach:
1. This handoff document (`HANDOFF_ZYRAXIS_ROSTER_BUILDER.md`)
2. The skeleton spreadsheet (`aov_rizers_roster_v3.17_prime_nine.xlsx`)

---

## PART 1 · THE COSMOLOGY (What You Need to Know About the Universe)

### The Aethryx Expanse
- **27 planets total**, divided into three systems:
  - **Genesis System (1-9):** Origon · Lumeria · Draevos · Arborynth · Thallassar · Pyraxal · Quoraxal · **Cytherion** · **Zyraxis**
  - **Omen System (10-18):** Myraclese · Bellatora · Yvoris · Kyrathos · Nyxonil · Jynaera · Sylvanir · Velkryn · Ignara
  - **Definitive System (19-27):** Ultharis · Halcyra · Wyvera · Rhyzor · Elythera · Xylos · Gravaron · Ferros · **Viridia**
- **Genesis** = Natural alignment and purity. **Omen** = Extreme or corrupted. **Definitive** = Refined and balanced.
- Zyraxis is Genesis planet 9, currently the most populated planet in the Expanse.

### The Astralite Matrix — 9 Families
Aethryx (Ax) is the universal element, present in all families. The nine astralite families each anchor a role:

| # | Family | Core Element | Anchor Planet | Role |
|---|---|---|---|---|
| Ax-1 | Creation | Aethryx Prime | Origon | SPARK — initiates |
| Ax-2 | Past/Memory | Mnemosyne Aethra | Lumeria | RECORD — preserves |
| Ax-3 | Destruction | Pyroclast Aethra | Pyraxal | RELEASE — clears |
| Ax-4 | Mind/Thought | Cognara | Arborynth | THINK — understands |
| Ax-5 | Present/Balance | Viridion Prime | Viridia | BALANCE — sustains |
| Ax-6 | Preservation | Fortaris | Arborynth | ENDURE — protects |
| Ax-7 | Body/Form | Corporex | Quoraxal | FORM — contains |
| Ax-8 | Future/Systems | Synthara | **Cytherion** | BUILD — creates |
| Ax-9 | Spirit/Essence | Astryx Soul | **Zyraxis** | TRANSCEND — elevates |

**Element interaction formulas:**
- 1+2 = Potential · 3+6 = Transformation · 4+7 = Will · **5+9 = Ascension** · 8+5 = Innovation

### Cytherion Bug War (planet 8, ~9.2 Bya)
Cytherion is the **origin of ALL insectoid life** (Branch IV of the 9-branch mortal taxonomy), birthplace of **the Grid** (first artificial structure in the cosmos = origin of all tech/AI in the Expanse), and egg-site of **Mykarlyth** (first humanoid individual, who later migrated to Myraclese — so humanoid life ALSO originates on Cytherion).

**The Bug War (locked canon):** Spider caste attempted takeover of insectoid-kind. Mantis caste formed a defensive alliance, fought to protect (not conquer), won at heavy cost, earned peaceful legitimate reign. Spider caste subdued and reintegrated but kept to margins as dormant fault-line. Cytherion today = alive, peaceably-governed, Mantis-ruled.

**Cytherion→Zyraxis migration (locked canon):** During/after the Bug War, mixed refugee wave (Mantis civilian preservation ships + Spider dissenter/deserter ships) fled Cytherion. 200M-year transit (9.2 Bya → 9 Bya). Arrived at newly-forming Zyraxis. Blended over eons into a distinct Synthrax-Astryx hybrid clade. **Modern Alienlands district (Vorashil) is the oldest continuous inhabited land on Zyraxis** — bug refugees predate every other lineage on the planet.

### Zyraxis is the Ax-9 Astryx Soul Anchor
- Zyraxis is the Spirit/Essence anchor of the entire Genesis System — the terminal planet of the first cosmic arc.
- The word "astralite" derives from Astryx Soul.
- Zyspheres (the catch-tool) work uniquely well on Zyraxis because the planet's Ax-9 saturation enables essence-binding.
- The Fathergems (concentrated Astryx Soul) are what the 10 Gemlords hold.

### THE GENESIS SYSTEM (Planets 1-9) — Zyraxis's Cosmic Neighborhood

**Zyraxis is planet 9 of the Genesis System.** Every district's astralite refraction traces back to one of the other 8 Genesis planets (except Xilnar which is pure Zyraxis-native, and Netharion which is Aethryx-primal source). Understanding what each Genesis planet IS lets you reason about what a district's Zyrex looks like — because every district-native lineage on Zyraxis descends from an ancient migration wave that arrived from that Genesis planet during the Aethryx-Expanse "Migration Era" (rough timeline: ~9.2 Bya → sky-lanes decayed sometime in deep past → modern era, no active interplanetary travel).

| # | Planet | Astralite Anchor | Family | Role | Flavor + Descendant Lineage on Zyraxis |
|---|---|---|---|---|---|
| 1 | **Origon** | Aethryx Prime (Ax-1) | Creation | SPARK | The first planet in the Expanse. Birth-nebulae, origin sanctums. Divine-radiant, apex-shaped Zyrex. **Descendant district on Zyraxis: KORATHEN (Ultralands) — Aura/Humanoid-Noid divine-crown lineage.** Migrations from Origon brought the seed of imperial authority and creation-force to Zyraxis. |
| 2 | **Lumeria** | Mnemosyne Aethra (Ax-2) | Past/Memory | RECORD | Light-memory planet. Archives that predate everything. Pearl-glow, echo-chime, memory-crystal. **Descendant district on Zyraxis: ZARVANE (Auralands) — Spirit/Aura pearl-sun lineage.** Ivirium the Pearlord's Sun Hymn is a memory-preservation rite. |
| 3 | **Draevos** | (none — no astralite anchor) | (canon TBD) | (canon TBD) | Genesis planet #3, but does NOT anchor any astralite family. Its role in the Expanse is unresolved in current canon — possibly a transit-world, proto-void, or liminal-space planet. **No direct descendant district on Zyraxis.** For now, treat Draevos-origin Zyrex as design-space that may be unlocked later. Do not assign Zyrex to Draevos-lineage in this roster pass. |
| 4 | **Arborynth** | Cognara (Ax-4) + Fortaris (Ax-6) | Mind + Preservation | THINK + ENDURE | **DUAL ANCHOR — the only Genesis planet holding two astralite families.** Forest-mind planet. Thought-preservation, curator-scholars, ancient groves. **Two descendant districts on Zyraxis: ANDRANNOR (Creaturelands · Ax-4 Cognara · Beast/Creature curator-mind lineage) AND VERIDAN (Naturelands · Ax-6 Fortaris · Creature/Nature emerald preservation lineage).** Arborynth's dual-family nature is echoed on Zyraxis as two neighboring districts sharing Arborynth ancestry. |
| 5 | **Thallassar** | (none — no astralite anchor) | (canon TBD) | (canon TBD) | Genesis planet #5. Naming convention suggests an ocean-world (Thalassa = Greek sea). No astralite anchor, so no direct district refraction on Zyraxis. Possibly the origin of Zyraxis's Aquatic-type baseline biosphere. Treat as design-space TBD. Do not assign Zyrex to Thallassar-lineage in this roster pass. |
| 6 | **Pyraxal** | Pyroclast Aethra (Ax-3) | Destruction | RELEASE | Volcanic/fire/ruby planet. Ash-storms, ruby-crystal veins, primal beast-forge biosphere. **Descendant district on Zyraxis: MALEZOR (Beastlands) — Creature/Beast ruby-fury lineage.** Rakoron the Rubylord's Ruby Fang and Malezor Rend are Pyraxal-descended destruction moves. |
| 7 | **Quoraxal** | Corporex (Ax-7) | Body/Form | FORM | The corporeal-anchor planet. Body-mass, form-crafting, physical-embodiment biosphere. **Descendant district on Zyraxis: BAELGOR (Humanoidlands) — Aura/Humanoid-Noid amber-forge lineage.** Ambrevon the Amberlord's forge-smith identity descends from Quoraxal body-craft tradition. |
| 8 | **Cytherion** | Synthara (Ax-8) | Future/Systems | BUILD | **THE ORIGIN OF INTERPLANETARY TRAVEL AND ALL TECHNOLOGY.** Homeworld of ALL insectoid life (Branch IV). Birthplace of the Grid (first artificial structure in the cosmos). Egg-site of Mykarlyth (first humanoid individual). Site of the Bug War (Mantis-earned peaceful reign, Spider marginalized). **TWO descendant districts on Zyraxis:** VORASHIL (Alienlands · Tech/Extraterrestrial · ANCIENT bug-refugee lineage arriving ~9 Bya during Bug War) AND THARDUN (Mechlands · Humanoid-Noid/Tech · MODERN humanoid Grid-tech engineering lineage). Cytherion is the only Genesis planet whose descendants populate two Zyraxis districts. |
| 9 | **Zyraxis** | Astryx Soul (Ax-9) | Spirit/Essence | TRANSCEND | **This game's home planet.** Terminal planet of the Genesis arc. Essence-anchor of the entire first cosmic cycle. Two districts express native Zyraxis lineages: XILNAR (Spiritlands · Unknown-Void/Spirit · pure Astryx-Soul Zyrex) AND NETHARION (Unknownlands · Beast/Unknown-Void · Aethryx-primal near-source anomaly Zyrex). Every other district's Zyrex share Ax-9 substrate as their planetary baseline. |

**Migration lineage summary — how every district's Zyrex got there:**
- KORATHEN ← Origon lineage
- ZARVANE ← Lumeria lineage
- ANDRANNOR ← Arborynth (Cognara) lineage
- VERIDAN ← Arborynth (Fortaris) lineage
- MALEZOR ← Pyraxal lineage
- BAELGOR ← Quoraxal lineage
- VORASHIL ← Cytherion (bug refugee) lineage
- THARDUN ← Cytherion (Grid-tech humanoid) lineage
- XILNAR ← Native Zyraxis Astryx-Soul evolution
- NETHARION ← Native Zyraxis Aethryx-primal anomaly

**When spec'ing Zyrex per district, treat their type combinations and morphology as culturally-descended from the migration origin.** Malezor Zyrex should look and feel like they came from Pyraxal's volcanic biosphere ~9 billion years ago and adapted to Zyraxis. Andrannor Zyrex should carry Arborynth's forest-mind heritage. Vorashil Zyrex should carry Cytherion's Synthrax bug-refugee genome plus Zyraxis's Astryx-Soul modulation. This gives every district's roster a distinct thematic identity rooted in cosmology, not just design preference.

**Draevos and Thallassar are canonically-open Genesis planets** with no current astralite anchor and no direct district descendants on Zyraxis. If you invent Zyrex in this roster pass, do NOT assign them to Draevos or Thallassar lineage. They are reserved for future canon development.

### GENESIS PLANET × TYPE POOL ASSIGNMENTS

Every one of the 20 combat types is assigned to one or more Genesis planets as either PRIMARY (dominant / anchor-associated / this planet is famous for this type) or SECONDARY (present but not the defining type). This creates a clear rule set: **a district-native Zyrex on Zyraxis can only have a Type1 that appears in its migration-origin planet's pool** (Malezor Zyrex must have Type1 from Pyraxal's pool, Andrannor Zyrex from Arborynth's pool, etc.). Type2 is either from the same planet's pool OR from Zyraxis's own native substrate pool.

**Type pool per Genesis planet:**

**1 · ORIGON** (Ax-1 Creation · SPARK)
- **Primary:** Aura, Divine, Humanoid-Noid, Ultramax (very rare)
- **Secondary:** Radiant, Spirit
- **Absent:** Draconic, Elemental, Corrupted, Verdant, Aquatic, Tech, Extraterrestrial
- **Flavor rule:** Origon-lineage Zyrex evoke divine authority, sun-blessed royalty, apex-forged creations. Korathen inherits this.

**2 · LUMERIA** (Ax-2 Past/Memory · RECORD)
- **Primary:** Chrono, Radiant, Spirit
- **Secondary:** Aura, Crystal (memory-crystal)
- **Absent:** Beast (rare), Draconic, Elemental, Corrupted, Verdant, Aquatic, Tech, Extraterrestrial, Humanoid-Noid
- **Flavor rule:** Lumeria-lineage Zyrex are pearl-glow, echo-chime, memory-orb creatures — carriers of what has been. Zarvane inherits this.

**3 · DRAEVOS** (no astralite anchor · liminal/transit/proto-void)
- **Primary:** Void (Unknown-Void), Corrupted, Astral
- **Secondary:** Chrono, Extraterrestrial
- **Absent:** most others — Draevos is defined by absence and drift
- **Flavor rule:** Draevos-lineage Zyrex are void-drift, liminal-space creatures. **No district on Zyraxis inherits Draevos directly** — reserve for future canon.

**4 · ARBORYNTH** (Ax-4 Cognara + Ax-6 Fortaris · THINK + ENDURE)
- **Primary:** Nature, Verdant, Creature, Beast
- **Secondary:** Astral (mind-spirit), Aura
- **Absent:** Draconic, Elemental, Corrupted, Aquatic, Tech, Extraterrestrial, Humanoid-Noid, Ultramax
- **Flavor rule:** Arborynth-lineage Zyrex are forest-scholar, curator-guardian, tree-wise creatures. Andrannor (Ax-4 Cognara → Beast/Creature Mind-side) and Veridan (Ax-6 Fortaris → Creature/Nature Preservation-side) both inherit this.

**5 · THALLASSAR** (no astralite anchor · ocean-world)
- **Primary:** Aquatic, Beast, Creature, Nature
- **Secondary:** Crystal (coral-crystal)
- **Absent:** most others — this is a mono-biome planet
- **Flavor rule:** Thallassar-lineage Zyrex are sea-drift, wave-born, coral-formed. **No district on Zyraxis inherits Thallassar directly** — but Zyraxis's baseline Aquatic biosphere (rivers, seas around districts) may descend from ancient Thallassar bleed. Reserve for future canon.

**6 · PYRAXAL** (Ax-3 Destruction · RELEASE)
- **Primary:** Beast, Draconic, Elemental, Corrupted
- **Secondary:** Crystal (ruby-crystal), Radiant
- **Absent:** Aura, Verdant, Aquatic, Chrono, Astral, Divine, Tech, Extraterrestrial, Humanoid-Noid, Ultramax
- **Flavor rule:** Pyraxal-lineage Zyrex are ash-storm, fire-fury, ruby-forge creatures. Malezor inherits this. Rakoron's Ruby Fang / Malezor Rend descend from Pyraxal destruction-craft.

**7 · QUORAXAL** (Ax-7 Body/Form · FORM)
- **Primary:** Humanoid-Noid, Beast, Elemental
- **Secondary:** Corrupted, Aura, Crystal
- **Absent:** Draconic (rare), Verdant, Aquatic, Chrono, Astral, Divine, Tech, Extraterrestrial, Ultramax
- **Flavor rule:** Quoraxal-lineage Zyrex are form-crafted, mass-born, physically-embodied creatures. Baelgor inherits this. Ambrevon's amber-forge-smith identity comes from Quoraxal body-craft tradition.

**8 · CYTHERION** (Ax-8 Future/Systems · BUILD)
- **Primary:** Tech, Extraterrestrial, Beast (insectoid-shape), Creature
- **Secondary:** Astral (Cognara mind-echo from insectoid hive-cognition), Corrupted (Bug War taint), Elemental (Grid-tech energy weapons), Radiant
- **Absent:** Verdant, Aquatic, Divine, Humanoid-Noid (Mykarlyth-egg exception aside)
- **Flavor rule:** Cytherion-lineage Zyrex are hive-craft, chitin-armored, Grid-tech-touched, AI-adjacent creatures. **Two Zyraxis districts inherit Cytherion:** Vorashil (ancient bug-refugee, trends more Beast/Extraterrestrial/Astral) and Thardun (modern humanoid Grid-tech, trends more Humanoid-Noid/Tech/Elemental).

**9 · ZYRAXIS** (Ax-9 Spirit/Essence · TRANSCEND · the current planet)
- **Primary NATIVE types (Zyraxis-original, not migrant-descended):** Spirit, Aura, Void (Unknown-Void via Netharion), Divine (rare)
- **Cross-substrate types (available as Type2 for any district-native Zyrex due to Zyraxis's Ax-9 saturation):** Spirit, Aura, Radiant, Astral
- **Migrant-accumulated types** (present on Zyraxis because ancient migrants brought them): every other type from the 20-type roster
- **Flavor rule:** Every district-native Zyrex on Zyraxis carries a Zyraxis-substrate Type2 (or, for pure-native Xilnar/Netharion Zyrex, both types come from Zyraxis's native pool). Xilnar trends Unknown-Void/Spirit; Netharion trends Beast/Unknown-Void plus anomalous cross-family combos.

### QUICK LOOKUP MATRIX — Which Genesis Planets Host Which Type

Read this as: "which planet's migration wave would explain a Zyrex having this type?" Use it to sanity-check that a Zyrex you spec for a district has a type that traces back to that district's migration-origin planet.

| Type | Primary (●●) | Secondary (●) |
|------|--------------|---------------|
| Beast | Pyraxal, Arborynth, Thallassar, Quoraxal, Cytherion, **Zyraxis (Netharion)** | — |
| Aura | Origon, **Zyraxis** | Lumeria, Arborynth, Quoraxal |
| Draconic | Pyraxal | Quoraxal |
| Elemental | Quoraxal, Pyraxal | Thallassar, Cytherion, Zyraxis |
| Radiant | Lumeria | Origon, Pyraxal, Cytherion, Zyraxis |
| Crystal | Thallassar, Pyraxal | Lumeria, Quoraxal, Zyraxis |
| Spirit | **Zyraxis (Xilnar)** | Lumeria, Origon |
| Void (Unknown-Void) | Draevos, **Zyraxis (Netharion)** | — |
| Corrupted | Pyraxal, Quoraxal, Draevos | Cytherion (Bug War), Zyraxis |
| Verdant | Arborynth | Zyraxis |
| Aquatic | Thallassar | Zyraxis |
| Chrono | Lumeria | Draevos, Zyraxis |
| Astral | Arborynth, Cytherion, Draevos | Zyraxis |
| Divine | Origon | Zyraxis |
| Creature | Arborynth, Thallassar, Cytherion | Zyraxis |
| Nature | Arborynth | Thallassar, Zyraxis |
| Tech | Cytherion | — |
| Extraterrestrial | Cytherion | Draevos |
| Humanoid-Noid | Origon, Quoraxal | — (rare, Cytherion via Mykarlyth exception) |
| Ultramax | Origon (rare), Zyraxis (rare) | — (Tier IX+ only) |

### USING THE TYPE POOLS PER DISTRICT

When spec'ing a district-native Zyrex, follow this rule:
1. **Type1 must come from the district's migration-origin planet's Primary or Secondary pool.**
2. **Type2 should be either** (a) another type from the same origin planet, OR (b) from Zyraxis's cross-substrate pool (Spirit, Aura, Radiant, Astral).
3. **Absent types are forbidden** — do not give a Malezor Zyrex a Tech type, because Pyraxal-lineage descendants do not carry Cytherion Tech genetics.

**Per-district type recipe:**

- **MALEZOR (Pyraxal-lineage):** Type1 ∈ {Beast, Draconic, Elemental, Corrupted, Crystal, Radiant}. Type2 ∈ {same pool} OR {Spirit, Aura, Astral} for Zyraxis-substrate dual-type.
- **ZARVANE (Lumeria-lineage):** Type1 ∈ {Chrono, Radiant, Spirit, Aura, Crystal}. Type2 ∈ {same pool} OR {Spirit, Aura, Astral}.
- **ANDRANNOR (Arborynth Cognara-lineage):** Type1 ∈ {Beast, Creature, Nature, Astral, Aura}. Type2 ∈ {same pool} OR {Spirit, Aura, Astral}. Emphasize Mind/Cognition types (Astral, Aura, Creature).
- **VERIDAN (Arborynth Fortaris-lineage):** Type1 ∈ {Nature, Verdant, Creature, Beast}. Type2 ∈ {same pool} OR {Spirit, Aura, Astral}. Emphasize Preservation/Endurance (Nature, Verdant, Creature).
- **NETHARION (Aethryx-primal / Zyraxis-native anomaly):** Type1 ∈ {Void (Unknown-Void), Beast} preferred, but ALL types allowed due to reality-anomaly rule. Type2 can be anything — this is the only district where forbidden cross-planet type combos are canonically justified.
- **VORASHIL (Cytherion bug-refugee lineage):** Type1 ∈ {Beast (insectoid), Extraterrestrial, Tech, Creature}. Type2 ∈ {Astral, Radiant, Corrupted (Bug War taint)} OR {Spirit, Aura} for Zyraxis-substrate.
- **XILNAR (Zyraxis-native pure Spirit):** Type1 ∈ {Spirit, Unknown-Void, Divine, Aura}. Type2 ∈ {same pool} OR {Astral, Radiant}. No migrant types — Xilnar Zyrex are pure Zyraxis-native.
- **BAELGOR (Quoraxal-lineage):** Type1 ∈ {Humanoid-Noid, Beast, Elemental, Corrupted, Crystal}. Type2 ∈ {same pool} OR {Spirit, Aura, Astral}.
- **THARDUN (Cytherion humanoid Grid-tech lineage):** Type1 ∈ {Humanoid-Noid, Tech, Elemental}. Type2 ∈ {Corrupted, Astral} OR {Spirit, Aura} for Zyraxis-substrate.
- **KORATHEN (Origon-lineage):** Type1 ∈ {Aura, Humanoid-Noid, Divine, Radiant}. Type2 ∈ {same pool} OR {Spirit, Astral}. Highest-tier Zyrex may carry Ultramax as Type2 at Tier IX+.

**This ruleset means every one of the 150 Primary Dex Zyrex has a canonical migration history baked into its type combo. A player who studies the roster carefully can reverse-engineer which Genesis planet each Zyrex's ancestors came from — which is a stealth cosmology lesson embedded in the pokedex.**

### The Ax-5 Absence (Critical Plot Logic)
**Zyraxis has ZERO native Ax-5 Present/Balance saturation.** Every other astralite family finds a district home on Zyraxis. Ax-5 is anchored on Viridia (planet 27, Definitive system) — 18 planets away, in a totally different era.

This is **why the Seer Ascension plot requires Xenoxil**: they cannot fire the 5+9 Ascension formula from Zyraxis-local materials. Xenoxil is the off-world vessel carrying the Ax-5 payload the planet lacks. When Xenoxil arrives on Zyraxis with an Ax-5 charge and encounters concentrated Ax-9 (from captured Zyrex sacrificed to him), the Ascension formula fires.

**Design consequence:** no district-native Zyrex should ever be typed with Present-family energy. Present is a purely off-world influence when it appears. Every Zyrex in the 150 Primary Dex carries Ax-9 Spirit substrate (from being Zyraxis-native) plus their district's specific family — never Ax-5.

---

## PART 2 · THE TEN DISTRICTS × ASTRALITE MAPPING

Every Zyrex in the Primary Dex has a home district. Every district refracts one astralite family layered over the shared Ax-9 Spirit substrate. Ax-8 Synthara (Cytherion) is DOUBLED across two districts (parallels how Arborynth anchors two families at the cosmological level).

| # | District  | Land          | Gemlord   | Astralite       | Ax  | Anchor Planet | Type1/Type2 |
|---|-----------|---------------|-----------|-----------------|-----|---------------|-------------|
| I    | MALEZOR   | Beastlands    | Rakoron   | Pyroclast Aethra | Ax-3 | Pyraxal      | Creature/Beast |
| II   | ZARVANE   | Auralands     | Ivirium   | Mnemosyne Aethra | Ax-2 | Lumeria      | Spirit/Aura |
| III  | ANDRANNOR | Creaturelands | Mutaryn   | Cognara         | Ax-4 | Arborynth    | Beast/Creature |
| IV   | VERIDAN   | Naturelands   | Emeralix  | Fortaris        | Ax-6 | Arborynth    | Creature/Nature |
| V    | NETHARION | Unknownlands  | Eurakeon  | **Aethryx primal (pre-refraction)** | Ax-0 (source) | Aethryx-direct | Beast/Unknown-Void |
| VI   | VORASHIL  | Alienlands    | Azurel    | Synthara (bug lineage) | Ax-8 | Cytherion | Tech/Extraterrestrial |
| VII  | XILNAR    | Spiritlands   | Obsidius  | Astryx Soul     | Ax-9 | Zyraxis      | Unknown-Void/Spirit |
| VIII | BAELGOR   | Humanoidlands | Ambrevon  | Corporex        | Ax-7 | Quoraxal     | Aura/Humanoid-Noid |
| IX   | THARDUN   | Mechlands     | Oathane   | Synthara (humanoid lineage) | Ax-8 | Cytherion | Humanoid-Noid/Tech |
| X    | KORATHEN  | Ultralands    | Oatheus   | Aethryx Prime   | Ax-1 | Origon       | Aura/Humanoid-Noid |

**District type biases** (what types a district's Zyrex should trend toward):

- **Malezor** (Ax-3 Destruction) — Beast, Draconic, Radiant, Elemental (fire/ruby destruction)
- **Zarvane** (Ax-2 Past/Memory) — Spirit, Aura, Chrono, Radiant (light-memory, pearl-echo)
- **Andrannor** (Ax-4 Mind) — Beast, Creature, Aura, Astral (curator-mind, citrine amber)
- **Veridan** (Ax-6 Preservation) — Creature, Nature, Verdant, Aquatic (emerald grove endurance)
- **Netharion** (Ax-0 Aethryx primal) — Unknown-Void, Corrupted, Chrono, Astral (reality anomaly, mixed everything)
- **Vorashil** (Ax-8 bug lineage) — Tech, Extraterrestrial, Beast, Radiant (Synthrax-Astryx alien)
- **Xilnar** (Ax-9 pure Spirit) — Spirit, Aura, Divine, Radiant (essence-ascendant, chapel)
- **Baelgor** (Ax-7 Body) — Aura, Humanoid-Noid, Elemental, Corrupted (forge/body/form)
- **Thardun** (Ax-8 humanoid lineage) — Humanoid-Noid, Tech, Elemental, Corrupted (Grid-tech engineering)
- **Korathen** (Ax-1 Creation) — Aura, Humanoid-Noid, Divine, Ultramax (apex creation authority)

**Netharion is the anomaly district.** Since it sits near raw Aethryx source, its Zyrex can carry cross-family astralite influence that no other district's Zyrex should — think unstable type combinations, glitchy stat patterns, forbidden dual-types.

---

## PART 3 · THE 20-TYPE SYSTEM

Every Zyrex has a Type1 and (usually) a Type2. Some Netharion/Korathen apex Zyrex may have Type3. Types are drawn from this locked 20-type roster:

**Genesis-family aligned types:**
- Beast · Aura · Draconic · Elemental · Radiant · Crystal · Spirit · Void (Unknown-Void) · Corrupted · Verdant · Aquatic · Chrono · Astral · Divine

**Cross-genesis / hybrid types:**
- Creature · Nature · Tech · Extraterrestrial · Humanoid-Noid · Ultramax

**Notes:**
- **Ultramax** is reserved for Tier IX (Demigod) + Tier X (God) beings only. No standard Zyrex under Tier IX carries Ultramax.
- **Divine** is very rare — reserved for cosmic-tier or divine-adjacent Zyrex.
- **Humanoid-Noid** = the game's "Humanoid" type (codex canonical name is "Humanoid-Noid"). Use full name in-game.
- **Unknown-Void** = the game's "Void" type. Use full name in-game.
- **Extraterrestrial** = the game's "Alien" type. Use full name in-game.
- **Present-family types are FORBIDDEN on district-native Zyrex.** Only Xenoxil (Shadow Dex) can carry Ax-5 influence.

---

## PART 4 · THE 4 EVOLUTION LADDERS + SPECIAL 4TH

**Baseline rules:**
- Every Zyrex starts at Tier I base.
- Evolution happens in exactly 3 stages when it happens at all: Base → Mid → Terminal.
- Rarity determines which ladder a species inherits.
- Not all Zyrex evolve. Terminal-at-T1 species exist (basic wild pool commons that never grow).
- Some Zyrex evolve partially (Base → Mid, no Terminal).

**The Four Ladders:**

| Ladder | Base | Mid | Terminal | Rarity | Chain Count in Roster |
|--------|------|-----|----------|--------|----------------------|
| **A · Common**    | T1 | T2 | T3 | Most common | ~18 chains |
| **B · Uncommon**  | T1 | T3 | T5 | Mid-signature | ~7 chains |
| **C · Rare**      | T1 | T4 | T6 | High-power | 3 chains (Malezor, Vorashil, Korathen) |
| **D · Legendary** | T1 | T5 | T7 | Pseudo-legendary | 2 chains (Netharion, Xilnar) |

**Special 4th Evolution (Tier VIII+):**
- Some Zyrex have a hidden 4th evolution beyond their ladder's Terminal that pushes them to Tier VIII or higher.
- Example: Elzebub (T1) → Elzimir (T3) → Elzoran (T5) → **Omegoran (T7+ or T8, hidden 4th)**.
- Not automatic — requires specific unlock conditions (late-game item + location + quest completion — mechanic TBD).
- Special 4ths live in the **Shadow Dex** (#160-#180), not the Primary Dex. This keeps Primary at exactly 150.

---

## PART 5 · THE T×333 STAT POOL RULE (LOCKED)

**Every species' total base stat pool = Tier × 333.**
- Tier I = 333 total base stats
- Tier II = 666
- Tier III = 999
- Tier IV = 1332
- Tier V = 1665
- Tier VI = 1998
- Tier VII = 2331
- Tier VIII = 2664
- Tier IX = 2997
- Tier X = 3330

The 333 gets distributed across 5 stats (HP · ATK · DEF · SPD · SPC). Distribution varies by species archetype. A balanced Tier V would be 333 each. A speed-focused Tier V might be 200/300/250/500/415. But the SUM must always equal Tier × 333.

**When spec'ing, use these approximate base-stat distributions per tier:**

| Tier | Total | Balanced | Bulky | Fast | Special-focused |
|------|-------|----------|-------|------|-----------------|
| T1 | 333 | 66-66-66-66-69 | 100-60-100-40-33 | 40-60-50-100-83 | 50-40-50-40-153 |
| T3 | 999 | 200-200-200-200-199 | 300-180-300-100-119 | 120-180-150-300-249 | 150-120-150-120-459 |
| T5 | 1665 | 333-333-333-333-333 | 500-300-500-150-215 | 200-300-250-500-415 | 250-200-250-200-765 |
| T7 | 2331 | 466-466-466-466-467 | 700-420-700-210-301 | 280-420-350-700-581 | 350-280-350-280-1071 |
| T8 | 2664 | 533-533-533-533-532 | (Gemlord territory — canon-locked per existing 10 Gemlords) | | |

---

## PART 6 · THE 180-SLOT DEX STRUCTURE

### Primary Dex (#001-#150) — 10 districts × 15 slots each

Per-district 15-slot template:

| Slots | Type | Notes |
|-------|------|-------|
| 1-3 | Starter chain (Ladder A) | The district's canonical "start here" line, T1→T2→T3 |
| 4-6 | Wild chain (Ladder A or B) | Common route encounters |
| 7-9 | Signature chain (Ladder A/B/C/D depending on district) | The district's power lineage — Malezor gets Ladder C, Netharion gets Ladder D, etc. |
| 10-12 | Three solo Zyrex (T1-T5 terminals, no evolution) | Wild pool commons and mid-tier one-offs |
| 13 | Apex solo (T5-T6, no evolution) | District staple, rare wild find |
| 14 | LEGENDARY (T6-T7, sidequest-gated) | District's essence-manifestation, one per district |
| 15 | GEMLORD (T8 Immortal) | Post-endgame duel, pre-locked |

**Dex numbers land as:**
- Malezor: #001-#015 (Gemlord Rakoron = #015)
- Zarvane: #016-#030 (Gemlord Ivirium = #030)
- Andrannor: #031-#045 (Gemlord Mutaryn = #045)
- Veridan: #046-#060 (Gemlord Emeralix = #060)
- Netharion: #061-#075 (Gemlord Eurakeon = #075)
- Vorashil: #076-#090 (Gemlord Azurel = #090)
- Xilnar: #091-#105 (Gemlord Obsidius = #105)
- Baelgor: #106-#120 (Gemlord Ambrevon = #120)
- Thardun: #121-#135 (Gemlord Oathane = #135)
- Korathen: #136-#150 (Gemlord Oatheus = #150)

### Shadow Dex (#151-#180) — 30 beyond-the-dex specials

Already pre-assigned:
- #151-#153: Aurabeasts (Diviniara, Pyrothrax, Voltaryx) — Dad's-workbench easter egg gifts
- #154-#156: Seer trio (Ophira, Orryx, Xenoxil) — endgame bosses
- #157: Vengrizz — Quiet Child forgiveness gift
- #158-#159: Cosmic entities (Ultharis, Khronicore) — log entries only
- #160: Omegoran — type-specimen Special 4th
- #161-#180: Reserved for additional Special 4ths + expansion headroom (~20 slots for design)

---

## PART 7 · PRE-LOCKED CANON (Do Not Change)

### The 10 Gemlords (Tier VIII, Slot #15 of each district)

| Gemlord   | District  | Type1 | Type2 | Signature moves |
|-----------|-----------|-------|-------|-----------------|
| Rakoron   | Malezor   | Creature | Beast | Ruby Fang, Predator Roar, Corefall Echo, Malezor Rend |
| Ivirium   | Zarvane   | Spirit | Aura | Pearlchoir, Sun Hymn, Hushfall, Pearl Sovereign |
| Mutaryn   | Andrannor | Beast | Creature | Citrinefang (canonical) |
| Emeralix  | Veridan   | Creature | Nature | (Emerald grove sovereign) |
| Eurakeon  | Netharion | Beast | Unknown-Void | (Amethyst void anchor) |
| Azurel    | Vorashil  | Tech | Extraterrestrial | (Sapphire alien broker) |
| Obsidius  | Xilnar    | Unknown-Void | Spirit | (Onyx spirit mountain) |
| Ambrevon  | Baelgor   | Aura | Humanoid-Noid | (Amber forge smith) |
| Oathane   | Thardun   | Humanoid-Noid | Tech | (Anomaly mech balance) |
| Oatheus   | Korathen  | Aura | Humanoid-Noid | (Ultra divine crown) |

Each Gemlord has Tier VIII stats (2664 pool), catchRate 0, easterEgg true. Stat distributions are already locked; do not redistribute.

### Hand-Written Zyrex Already in Game

These 20 hand-written species already live in `rizers.html` and MUST be preserved somewhere in the Primary Dex. Their placement is flexible (they can slot into any district that fits their type + ladder profile):

| ID | Display | Type1 | Type2 | Suggested Ladder/District |
|----|---------|-------|-------|---------------------------|
| barkchitter | Barkchitter | Beast | Nature | Malezor starter base (T1) |
| cinderant | Cinderant | Beast | Spirit | Malezor wild base or starter (T1) |
| dunechitter | Dunechitter | Beast | Aura | Andrannor or Vorashil wild (T1) |
| etherfly | Etherfly | Beast | Radiant | Vorashil signature base (T1 · Ladder B) → mid (invent) → Rhinoxis (T5) |
| flarepaw | Flarepaw | Beast | Spirit | Malezor wild base (T1) |
| frostwisp | Frostwisp | Beast | Nature | Veridan or Xilnar (T1) |
| otterlin | Otterlin | Beast | Nature | Veridan wild (T1) |
| pebblequil | Pebblequil | Creature | Nature | Veridan wild (T1) |
| sandskitter | Sandskitter | Beast | Nature | Andrannor solo (T1) |
| sunhoop | Sunhoop | Beast | Radiant | Zarvane signature base (T1) |
| torchpuff | Torchpuff | Beast | Spirit | Malezor wild base (T1) |
| verdanix | Verdanix | Beast | Nature | Veridan starter base (T1) |
| voltimite | Voltimite | Aura | Creature | Thardun or Malezor (T1) |
| elzebub | Elzebub | Aura | Draconic | Netharion signature base (T1 · Ladder D) |
| elzimir | Elzimir | Aura | Draconic | Netharion signature mid (T3) |
| elzoran | Elzoran | Aura | Draconic | Netharion signature terminal (T5) |
| omegoran | Omegoran | Aura | Corrupted | Shadow Dex #160 (Special 4th of Elzoran, T7 or T8) |
| petragryff | Petragryff | Crystal | Spirit | Veridan or Xilnar solo apex (T4) |
| rhinoxis | Rhinoxis | Beast | Creature | Vorashil signature terminal (T5, evolves from Etherfly) |
| aurarat | Aurarat | Beast | Unknown-Void | Netharion or Zarvane solo (T1) |

**Also pre-locked (currently exists in game as Shadow Dex entries):**
- vengrizz, ophira, xenoxil, diviniara, pyrothrax, voltaryx, ultharis, khronicore

---

## PART 8 · NAMING CONVENTIONS

**Zyrex names should be:**
- **Single word.** No first name-last name patterns. No numerals. No ampersands.
- **Evocative and morphology-driven** — describe the creature's shape, element, or role.
- **Suffix-friendly** — common Zyrex naming suffixes: `-rax`, `-yx`, `-oth`, `-ion`, `-us`, `-al`, `-ar`, `-en`, `-in`, `-ith`, `-en`, `-us`, `-eus`, `-um`, `-yr`, `-el`, `-il`.
- **Astralite-hinted** for family-signature Zyrex (Malezor Ax-3 → names ending in `-rax`, `-fyre`, `-ash`; Zarvane Ax-2 → names ending in `-lume`, `-echo`, `-pearl`; Xilnar Ax-9 → names ending in `-soul`, `-shroud`, `-astral`).
- **Evolution stages should share a root or morphological hint** — Etherfly → (new T3 mid) → Rhinoxis works because they share aerial-to-heavy transformation. Elzebub → Elzimir → Elzoran → Omegoran works because the `Elz-` prefix carries.

**AVOID:**
- Multi-word names with spaces ("Crownfeather Gryphon" — Viridia-flavor, rejected)
- Real English words as-is ("Snok" — too plain)
- Names containing planet names other than Zyraxis
- Any name that reads as a person ("Elrik Draconical")

---

## PART 9 · DESIGN CONSTRAINTS SUMMARY

1. **150 Primary Dex slots** distributed as 10 districts × 15 slots each.
2. **30 Shadow Dex slots** for specials — mostly pre-locked, 20 open for Special 4ths + expansion.
3. **Ladder distribution across 30 chains** (sparse top-end): ~18 A · ~7 B · ~3 C (Malezor, Vorashil, Korathen) · ~2 D (Netharion, Xilnar).
4. **Every Zyrex** starts at Tier I in the wild. Terminal-at-T1 is fine. Partial-evo is fine.
5. **T×333 stat pool** for every species (Tier × 333 = total base stat sum).
6. **20-type system** — no inventing new types.
7. **No Present-family types** on district-native Zyrex (Ax-5 absence canon).
8. **Types trend by district** — see district type biases in Part 2.
9. **Ax-8 Synthara appears in TWO districts** (Vorashil bug-lineage + Thardun humanoid-lineage). They express Cytherion-descent differently: Vorashil trends Beast/Extraterrestrial/Radiant (ancient bug refugee); Thardun trends Humanoid-Noid/Tech/Elemental (modern Grid-tech).
10. **Netharion is the anomaly district** — reality-anomaly Zyrex, unstable type combos, forbidden hybrids allowed.
11. **Korathen is the apex district** — highest-tier catchable Zyrex, closest to Ultramax, divine-adjacent, dex-terminal.
12. **Gemlords are locked** — do not change their stats, types, or moves.
13. **Naming: single-word Zyrex names only.** No first-last patterns.

---

## PART 10 · WHAT TO DELIVER BACK

**Deliverable:** filled-out version of `aov_rizers_roster_v3.17_prime_nine.xlsx`.

**Required columns to fill:**
- **PRIMARY DEX tab:**
  - Column L (`NAME (fill)`) — the display name for each Zyrex, e.g., `Rhinoxis`
  - Column M (`ID / handle (fill)`) — the lowercase kebab handle for the game code, e.g., `rhinoxis`
  - Column I (`Suggested Type1`) — override if the suggested type doesn't fit your design
  - Column J (`Suggested Type2`) — override if needed
  - (Optional) Add a **Base Stats** column if you want to lock stat distributions per Zyrex. Otherwise the game chat will auto-generate stats using the T×333 rule with default archetype distributions.
  - (Optional) Add a **Signature Move** column for Zyrex you want to give a species-locked move to.
  - (Optional) Add a **Flavor / Description** column with 1-2 sentence lore hooks.
- **SHADOW DEX tab:**
  - Fill in the reserved Special 4th slots (#161-#166) with names + which Ladder D/C endpoint they over-evolve from.
  - Fill any expansion slots (#167-#180) you want to use for additional canon Zyrex.

**Formats accepted for handoff back to the game chat:**
- Filled xlsx (preferred — matches the skeleton the game chat already knows)
- Markdown table with the same columns
- Plain text list with format `#001 NAME (id) · Type1/Type2 · Tier · District · Notes` per row

---

## PART 11 · KEY CANON REFERENCES

If the fresh chat asks for more depth on any of these, you can copy-paste from these anchor documents:

- **Astralite Matrix chart** (attached image if available in project)
- **Cytherion Bug War canon** (v9.6 Patch 41 · Master Codex on Drive)
- **Zyraxis Ten Districts** (Master Codex v10.22 sheet 9 · MASTER INDEX)
- **Existing rizers.html game roster** (`data/codex.js` has 101 hydrated entries after V3.17 Viridia purge Lane 1)
- **Game project location:** `/Users/mctherockstar/Documents/GitHub/AOV-saga-new/` (mounted in Cowork)

---

## APPENDIX · QUICK CHECKLIST

Before returning the filled roster:

- [ ] All 139 open Primary Dex slots have a NAME and ID
- [ ] All Zyrex names are single words (no spaces, no ampersands, no numerals)
- [ ] No district-native Zyrex has a Present-family type
- [ ] Type distributions match district biases (Malezor trends Beast/Draconic/Radiant, etc.)
- [ ] All 30 chains have coherent evolutionary flow (mid-form is morphologically believable between base and terminal)
- [ ] Ladder distribution stays close to 18 A / 7 B / 3 C / 2 D
- [ ] 10 Gemlords are untouched (Rakoron through Oatheus)
- [ ] Aurabeasts, Seer trio, Vengrizz, cosmic entities, Omegoran are untouched in Shadow Dex
- [ ] Etherfly → new T3 mid → Rhinoxis chain is complete in Vorashil
- [ ] Elzoran → Omegoran Special 4th is preserved in Shadow Dex #160

---

*End of handoff. Return the filled xlsx to the game project chat when ready. Game chat will sweep every filled row into `rizers.html` + `data/codex.js` as V3.17.*
