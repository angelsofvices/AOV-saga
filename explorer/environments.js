// ★ 2026-10-07 · THE LIVING MASTER CODEX · ENVIRONMENTS
// Generated from the environment design source. Design bible: docs/card-explorer/03_ENVIRONMENTS.md
// Every world and Zyraxis district: canon basis, terrain, palette (applied to the native
// tiles in art.js as recolours), props, hazard, signature mechanic, canon landmarks and what
// Carl's 1936 telescope sees. Landmark names are canon only; nothing here invents lore.
window.AOV_ENV = [
 {
  "id": "origon",
  "kind": "world",
  "no": 1,
  "name": "ORIGON",
  "title": "The Origin World",
  "canon": {
   "trait": "Direct Highest One presence · Father Gem core at the planetary heart.",
   "firstRace": "Tier VI+ Cosmic Beings only; no humanoids.",
   "notes": "No climate, no biology; the silence of the Highest One pressed against pre-creation. The First Volcano, the First River, the Source of Gems. Never broken, never warred over, never colonised: the Origin State. Every dragon bloodline began here (the Draconian Migration).",
   "notable": "Voltyran and Voltigrax (Origon-native, Tier VI)"
  },
  "concept": "A primordial world of black glass and gold-veined stone under a white-gold sky. Nothing grows. Every feature is a \"first\": the first volcano, the first river cutting the first valley. The silence is total; even footsteps sound wrong.",
  "terrain": [
   "obsidian plain",
   "gold-veined bedrock",
   "the First River (still, perfectly clear)",
   "primordial ash"
  ],
  "tiles": {
   "ground": "grass2",
   "path": "path",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "g": "#16141c",
    "G": "#2a2632",
    "h": "#0c0b10"
   },
   "path": {
    "p": "#3a3428",
    "P": "#5a4a2a",
    "B": "#e8c46a"
   },
   "liquid": {
    "a": "#cfe6f0",
    "A": "#ffffff",
    "z": "#9cc0d0"
   },
   "wall": {
    "L": "#1e1a24",
    "l": "#0a0810",
    "W": "#e8c46a",
    "n": "#3a3444",
    "N": "#141018"
   }
  },
  "props": [
   [
    "spire",
    "gold"
   ],
   [
    "boulder",
    "obsidian"
   ]
  ],
  "prop_palette": {
   "gold": {
    "c": "#e8c46a",
    "C": "#fff3c8",
    "N": "#16141c",
    "n": "#2a2632"
   },
   "obsidian": {
    "n": "#2a2632",
    "N": "#16141c",
    "W": "#4a4458"
   }
  },
  "hazard": {
   "name": "The Presence",
   "rule": "Substrate density near the Father Gem core drains SUIT steadily. Only the outer valleys are survivable for an unaugmented human."
  },
  "mechanic": {
   "name": "Firsts",
   "rule": "Each \"first\" landmark is a one-of-a-kind Location card. Origon holds few cards, all rare to reach."
  },
  "landmarks": [
   "The First Volcano",
   "The First River",
   "The Source of Gems"
  ],
  "telescope": "DARK BODY. NO ATMOSPHERE VISIBLE. A FAINT GOLDEN POINT AT THE CENTRE OF THE DISC.",
  "mood": "Absolute stillness; a single sustained tone.",
  "spoiler": false
 },
 {
  "id": "lumeria",
  "kind": "world",
  "no": 2,
  "name": "LUMERIA",
  "title": "The Light World",
  "canon": {
   "trait": "Pure light · awareness; the Astrums.",
   "firstRace": "ASTRUMS, the original light-beings.",
   "notes": "An ocean of luminous mind. From the Astrums later descended the Wizards, Witches and Dracolords (the Anciaric Curse split them). Lumeria still sings every time a star is named.",
   "notable": "Lumelys the First Luminary · the Eldersoul line"
  },
  "concept": "A world made of light thick enough to stand on. Plains of white-gold radiance with prismatic edges, pools of liquid brilliance, and a constant faint chord in the air.",
  "terrain": [
   "light-glass plain",
   "prismatic shallows",
   "radiant pools",
   "halo rings"
  ],
  "tiles": {
   "ground": "grass",
   "path": "path",
   "liquid": "water",
   "wall": "rock",
   "special": "ripple"
  },
  "palette": {
   "ground": {
    "g": "#f4ecc8",
    "G": "#ffffff",
    "h": "#e2d4a0"
   },
   "path": {
    "p": "#fff6dc",
    "P": "#e8d8a8",
    "B": "#b8e8ff"
   },
   "liquid": {
    "a": "#fffbe8",
    "A": "#ffffff",
    "z": "#f0d890"
   },
   "wall": {
    "L": "#e8dcb8",
    "l": "#c8b888",
    "W": "#ffffff",
    "n": "#f4ecd0",
    "N": "#b8a878"
   },
   "special": {
    "W": "#ffffff",
    "n": "#fff3c8",
    "N": "#f4ecc8"
   }
  },
  "props": [
   [
    "spire",
    "light"
   ]
  ],
  "prop_palette": {
   "light": {
    "c": "#fff6d0",
    "C": "#ffffff",
    "N": "#e2d4a0",
    "n": "#f4ecc8"
   }
  },
  "hazard": {
   "name": "Glare",
   "rule": "Photographs overexpose. The exposure needle must be held in the narrow green band, and the lamp filter is needed to see detail."
  },
  "mechanic": {
   "name": "Naming song",
   "rule": "Naming a newly documented subject makes the world sound a chord, briefly revealing nearby hidden finds."
  },
  "landmarks": [],
  "telescope": "BODY TOO BRILLIANT TO RESOLVE. THE PLATE FOGS ON EVERY EXPOSURE.",
  "mood": "A choir with no singers.",
  "spoiler": false
 },
 {
  "id": "draevos",
  "kind": "world",
  "no": 3,
  "name": "DRAEVOS",
  "title": "The Dragon World",
  "canon": {
   "trait": "Sky-dominant. Primordial Dragons and Mandrakes.",
   "firstRace": "DRACOLORDS / DRAGONLORDS + MANDRAKES.",
   "notes": "A planet whose sky outweighs its ground. The First Astrum War front. In a crash site on Draevos, Elzoran found the purple Father-Gem fragment that corrupted him into Omegoran.",
   "notable": "The founding Mandrake line · Elzoran / Omegoran"
  },
  "concept": "Crimson crags and knife-edged ridges under a sky that dominates the screen. Ledges, eyries and wind-scoured stairs climb toward the clouds; dragon shadows sweep across the map.",
  "terrain": [
   "crimson crag",
   "wind-scoured ledge",
   "scree slope",
   "eyrie stone"
  ],
  "tiles": {
   "ground": "grass2",
   "path": "path",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "g": "#7a2b3e",
    "G": "#9a4054",
    "h": "#4e1826"
   },
   "path": {
    "p": "#a8604a",
    "P": "#7a3e30",
    "B": "#e0a070"
   },
   "liquid": {
    "a": "#5a6a8a",
    "A": "#8aa0c0",
    "z": "#38445a"
   },
   "wall": {
    "L": "#5a2030",
    "l": "#2e0e18",
    "W": "#c87a6a",
    "n": "#7a3040",
    "N": "#3a1420"
   }
  },
  "props": [
   [
    "boulder",
    "crag"
   ],
   [
    "deadtree",
    "ash"
   ]
  ],
  "prop_palette": {
   "crag": {
    "n": "#9a4054",
    "N": "#5a2030",
    "W": "#c87a6a"
   },
   "ash": {
    "b": "#5a3a30",
    "u": "#2e1a14"
   }
  },
  "hazard": {
   "name": "Shadows overhead",
   "rule": "A shadow crossing the map warns of a diving predator. Stand still in cover (STALK) until it passes."
  },
  "mechanic": {
   "name": "Look up",
   "rule": "Many Draevos discoveries are only visible by aiming the camera at the sky."
  },
  "landmarks": [
   "The crash site where Elzoran found the purple gem"
  ],
  "telescope": "RED BODY. HEAVY CLOUD BANDS. MOVING SPECKS ABOVE THE CLOUDS.",
  "mood": "Wind, and wingbeats too large to be birds.",
  "spoiler": false
 },
 {
  "id": "arborynth",
  "kind": "world",
  "no": 4,
  "name": "ARBORYNTH",
  "title": "The Living World",
  "canon": {
   "trait": "A single living planetary organism: the Great Root.",
   "firstRace": "THE GREAT ROOT, embodied as the planet.",
   "notes": "Everything that walks its surface walks on the breathing skin of a single ancient mind. Cognara Astralite (Mind/Thought) cores here. The Forest of the Godvine (Central) is named in the Arborynth prototype.",
   "notable": "The Great Root (axis-being)"
  },
  "concept": "The ground is bark and the walls are roots. Veins of sap pulse under translucent moss; clearings open and close like slow breaths.",
  "terrain": [
   "bark floor",
   "root walls",
   "sap pools",
   "moss skin"
  ],
  "tiles": {
   "ground": "grass",
   "path": "den",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "g": "#2d6b3a",
    "G": "#4a9a50",
    "h": "#1a4224"
   },
   "path": {
    "B": "#6a4a2a",
    "u": "#3e2a16",
    "b": "#4e341e",
    "p": "#8a6a3a"
   },
   "liquid": {
    "a": "#c8a030",
    "A": "#f0d060",
    "z": "#8a6a10"
   },
   "wall": {
    "L": "#4a3020",
    "l": "#26180e",
    "W": "#7a5a3a",
    "n": "#5a3e26",
    "N": "#1a100a"
   }
  },
  "props": [
   [
    "tree",
    "godvine"
   ],
   [
    "shrub",
    "moss"
   ]
  ],
  "prop_palette": {
   "godvine": {
    "g": "#3a8a44",
    "G": "#6ac060",
    "h": "#1e5a28",
    "v": "#c8a030",
    "b": "#5a3e26"
   },
   "moss": {
    "c": "#c8a030",
    "C": "#f0d060"
   }
  },
  "hazard": {
   "name": "The breathing ground",
   "rule": "Paths shift slightly between visits; the field sketch from the last landing is only partly right."
  },
  "mechanic": {
   "name": "Cognara cores",
   "rule": "Astralite here is Cognara (Mind/Thought): sampling one briefly reveals the map around you."
  },
  "landmarks": [
   "The Forest of the Godvine"
  ],
  "telescope": "GREEN BODY. THE SURFACE APPEARS TO PULSE ON A SLOW RHYTHM.",
  "mood": "A heartbeat under everything.",
  "spoiler": false
 },
 {
  "id": "thallassar",
  "kind": "world",
  "no": 5,
  "name": "THALLASSAR",
  "title": "The Ocean World",
  "canon": {
   "trait": "Oceanic harmony: the Great Fin.",
   "firstRace": "THE GREAT FIN, oceanic axis-being.",
   "notes": "A water world with no shore. The Great Fin, shaped like a vast cathedral cetacean, circumnavigates in perfect tidal rhythm; its songs set the standard for harmonic devotion.",
   "notable": "The Great Fin"
  },
  "concept": "Open ocean to every horizon. The only footing is reef shallows and drifting kelp mats; most of the map is explored underwater in the diving helmet.",
  "terrain": [
   "open ocean",
   "reef shallows",
   "kelp mats",
   "sea-floor sand"
  ],
  "tiles": {
   "ground": "grass2",
   "path": "path",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "g": "#2a6a5a",
    "G": "#4a9a7a",
    "h": "#1a4a3e"
   },
   "path": {
    "p": "#c8b888",
    "P": "#a8946a",
    "B": "#e8dcb0"
   },
   "liquid": {
    "a": "#15355c",
    "A": "#3a6aa0",
    "z": "#0a1e38"
   },
   "wall": {
    "L": "#1e4a5a",
    "l": "#0e2a34",
    "W": "#6aa0a8",
    "n": "#2e5e6a",
    "N": "#0a1a20"
   }
  },
  "props": [
   [
    "shrub",
    "kelp"
   ],
   [
    "boulder",
    "reef"
   ]
  ],
  "prop_palette": {
   "kelp": {
    "g": "#2a7a4a",
    "G": "#4aa86a",
    "h": "#1a5a34",
    "c": "#e8b8a0",
    "C": "#ffd8c0"
   },
   "reef": {
    "n": "#d88a7a",
    "N": "#a85a50",
    "W": "#f0b0a0"
   }
  },
  "hazard": {
   "name": "No shore",
   "rule": "AIR is the limit everywhere. The tide rises whenever the Great Fin passes, swallowing the shallows."
  },
  "mechanic": {
   "name": "The passage",
   "rule": "The Great Fin crosses on a schedule. Being in the right place at the right time is the whole expedition."
  },
  "landmarks": [
   "The Great Fin's passage"
  ],
  "telescope": "OCEANIC BODY. NO LAND DETECTED.",
  "mood": "Whale-song at the edge of hearing.",
  "spoiler": false
 },
 {
  "id": "pyrauna",
  "kind": "world",
  "no": 6,
  "name": "PYRAUNA",
  "title": "The Expansion World",
  "canon": {
   "trait": "Expansion megabeast (formerly Pyraxal): the Great Fang.",
   "firstRace": "THE GREAT FANG, axis-being of expansion.",
   "notes": "Plates push, swell and erupt as the planet expands in slow exhale. Twin and mirror of Quorauna; the expand/collapse dyad.",
   "notable": "The Great Fang"
  },
  "concept": "Swollen basalt plates split by glowing seams, uplift ridges and magma channels. The land is visibly bigger every visit.",
  "terrain": [
   "swelling basalt",
   "magma seams",
   "uplift ridges",
   "cinder"
  ],
  "tiles": {
   "ground": "grass2",
   "path": "cracks",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "g": "#5a2e22",
    "G": "#7a4030",
    "h": "#3a1a12"
   },
   "path": {
    "p": "#3a2a24",
    "P": "#2a1a14",
    "B": "#ff8a3a"
   },
   "liquid": {
    "a": "#c83a1a",
    "A": "#ffb040",
    "z": "#7a1a0a"
   },
   "wall": {
    "L": "#3a2420",
    "l": "#1e100c",
    "W": "#c86040",
    "n": "#5a3428",
    "N": "#140806"
   }
  },
  "props": [
   [
    "vent",
    "fire"
   ],
   [
    "boulder",
    "basalt"
   ]
  ],
  "prop_palette": {
   "fire": {
    "W": "#ffd080",
    "R": "#ff8a3a",
    "r": "#c8402c"
   },
   "basalt": {
    "n": "#5a3e34",
    "N": "#3a2420",
    "W": "#7a5a4a"
   }
  },
  "hazard": {
   "name": "Heat",
   "rule": "The WARMTH gauge runs the other way: it climbs. Eruptions on a cycle re-shape the map."
  },
  "mechanic": {
   "name": "The exhale",
   "rule": "Each landing adds new ground at the map edges: Pyrauna is the one world that grows."
  },
  "landmarks": [],
  "telescope": "ORANGE BODY. BRIGHT FISSURES ACROSS THE DISC.",
  "mood": "Deep rumble; stone cracking like ice.",
  "spoiler": false
 },
 {
  "id": "quorauna",
  "kind": "world",
  "no": 7,
  "name": "QUORAUNA",
  "title": "The Compression World",
  "canon": {
   "trait": "Collapse megabeast (formerly Quoraxal): the Great Scale.",
   "firstRace": "THE GREAT SCALE, axis-being of collapse.",
   "notes": "Fissures pull rather than push; matter falls toward an unseen centre of pressure. Pyrauna's exact opposite and necessary balance.",
   "notable": "The Great Scale"
  },
  "concept": "Grey compressed stone that slopes inward everywhere, sinkholes and pressure-folded ridges all pointing at one centre.",
  "terrain": [
   "compressed stone",
   "sinkholes",
   "pressure folds",
   "dense dust"
  ],
  "tiles": {
   "ground": "grass2",
   "path": "path",
   "liquid": "water",
   "wall": "rock",
   "special": "ripple"
  },
  "palette": {
   "ground": {
    "g": "#5a5a5a",
    "G": "#7a7a7a",
    "h": "#3a3a3a"
   },
   "path": {
    "p": "#6a6a66",
    "P": "#4a4a46",
    "B": "#9a9a90"
   },
   "liquid": {
    "a": "#2a2a30",
    "A": "#4a4a54",
    "z": "#141418"
   },
   "wall": {
    "L": "#4a4a4a",
    "l": "#262626",
    "W": "#8a8a8a",
    "n": "#5a5a5a",
    "N": "#1a1a1a"
   },
   "special": {
    "W": "#8a8a8a",
    "n": "#5a5a5a",
    "N": "#3a3a3a"
   }
  },
  "props": [
   [
    "boulder",
    "grey"
   ],
   [
    "pillar",
    "grey"
   ]
  ],
  "prop_palette": {
   "grey": {
    "n": "#7a7a7a",
    "N": "#4a4a4a",
    "W": "#9a9a9a"
   }
  },
  "hazard": {
   "name": "The pull",
   "rule": "Fissure tiles drag you one tile toward the centre each step. Walk across them, never along them."
  },
  "mechanic": {
   "name": "Everything falls inward",
   "rule": "Dropped items and loose finds slide toward the centre: the deepest point collects the rarest discoveries."
  },
  "landmarks": [],
  "telescope": "GREY BODY. THE SURFACE DARKENS TOWARD A SINGLE POINT.",
  "mood": "Pressure in the ears.",
  "spoiler": false
 },
 {
  "id": "cytherion",
  "kind": "world",
  "no": 8,
  "name": "CYTHERION",
  "title": "The Grid World",
  "canon": {
   "trait": "First artificial structure: the Grid.",
   "firstRace": "SYNTHRAX: all Branch IV insectoids trace here.",
   "notes": "A self-replicating geometric Grid wrapped Cytherion before any creature could claim it. Synthara Astralite (Future/Systems) cores here. The Mandrake egg from Draevos was laid here, hatching Mykarlyth.",
   "notable": "Mykarlyth (hatched here)"
  },
  "concept": "Dark lattice plains crossed by glowing lines, hexagonal hive towers, conduits humming in regular intervals.",
  "terrain": [
   "lattice plate",
   "conduits",
   "hive cells",
   "grid walls"
  ],
  "tiles": {
   "ground": "grid",
   "path": "grid",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "g": "#0e1a2a",
    "G": "#1e3a5a",
    "h": "#060c16"
   },
   "path": {
    "p": "#0e1a2a",
    "P": "#060c16",
    "B": "#5fa8ff"
   },
   "liquid": {
    "a": "#1a3a6a",
    "A": "#5fa8ff",
    "z": "#0a1a3a"
   },
   "wall": {
    "L": "#16243a",
    "l": "#0a121e",
    "W": "#5fa8ff",
    "n": "#24364e",
    "N": "#060a12"
   },
   "grid": {
    "c": "#5fa8ff",
    "C": "#bfe0ff",
    "l": "#0e1a2a"
   }
  },
  "props": [
   [
    "pylon",
    "grid"
   ],
   [
    "spire",
    "hive"
   ]
  ],
  "prop_palette": {
   "grid": {
    "y": "#5fa8ff",
    "Y": "#bfe0ff",
    "M": "#24364e",
    "m": "#3a5070"
   },
   "hive": {
    "c": "#2a4a6a",
    "C": "#5fa8ff",
    "N": "#0e1a2a",
    "n": "#16243a"
   }
  },
  "hazard": {
   "name": "Replication",
   "rule": "Grid walls grow while you are inside: the maze slowly closes behind you."
  },
  "mechanic": {
   "name": "Systems",
   "rule": "Synthara Astralite lets Carl's ship tools 'read' the Grid: conduits reveal the route to the centre."
  },
  "landmarks": [
   "The egg-site of Mykarlyth"
  ],
  "telescope": "DARK BODY CROSSED BY PERFECTLY REGULAR LINES. ARTIFICIAL?",
  "mood": "Clicks in strict time.",
  "spoiler": false
 },
 {
  "id": "zyraxis",
  "kind": "world",
  "no": 9,
  "name": "ZYRAXIS",
  "title": "The Mothergem World",
  "canon": {
   "trait": "Gemlords. Gems first crystallise.",
   "firstRace": "GEMLORDS · 10 Fathergem-born.",
   "notes": "The first world where matter chose form. Two planetary rings: one of light, one of stored memory. Ten districts, ten Gemlords.",
   "notable": "The ten Gemlords"
  },
  "concept": "The Mothergem World is explored district by district; each district is its own environment (below).",
  "terrain": [
   "see districts"
  ],
  "tiles": {
   "ground": "grass",
   "path": "path",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {},
  "props": [
   [
    "tree",
    null
   ]
  ],
  "prop_palette": {},
  "hazard": {
   "name": "By district",
   "rule": "Each district has its own hazard."
  },
  "mechanic": {
   "name": "Ten districts",
   "rule": "Malezor → Zarvane → Andrannor → Veridan → Netharion → Vorashil → Xilnar → Baelgor → Thardun → Korathen."
  },
  "landmarks": [],
  "telescope": "CRYSTALLINE BODY, VIOLET CAST. TWO RINGS.",
  "mood": "By district.",
  "spoiler": false
 },
 {
  "id": "myraclese",
  "kind": "world",
  "no": 10,
  "name": "MYRACLESE",
  "title": "The Dominion World",
  "canon": {
   "trait": "Enforced devotion. Mykarlyth · the Third Thamonian Lens.",
   "firstRace": "HUMANOIDS: their first true home.",
   "notes": "Mykarlyth, an Immortal Titan, rules from a chapel-light that reaches every horizon. No privacy of mind. The Third Thamonian Legion enforces devotion. Egnellahc was born here.",
   "notable": "Mykarlyth · Kalenatel · Egnellahc"
  },
  "concept": "Gilded processional roads between marble chapels; the chapel-light hangs on every horizon so there is no true night. Crowds move in liturgical patterns.",
  "terrain": [
   "gilded paving",
   "marble courts",
   "processional roads",
   "chapel gardens"
  ],
  "tiles": {
   "ground": "grass2",
   "path": "den",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "g": "#b89344",
    "G": "#d8b868",
    "h": "#8a6a2a"
   },
   "path": {
    "B": "#e8dcc0",
    "u": "#b8a888",
    "b": "#d8ccb0",
    "p": "#f4ecd8"
   },
   "liquid": {
    "a": "#6a8ab8",
    "A": "#9ab8e0",
    "z": "#3a5a88"
   },
   "wall": {
    "L": "#d8ccb0",
    "l": "#a89878",
    "W": "#ffffff",
    "n": "#e8dcc0",
    "N": "#887858"
   }
  },
  "props": [
   [
    "pillar",
    "marble"
   ],
   [
    "shrub",
    "garden"
   ]
  ],
  "prop_palette": {
   "marble": {
    "W": "#ffffff",
    "n": "#e8dcc0",
    "N": "#b8a888"
   },
   "garden": {
    "c": "#e8c46a",
    "C": "#fff3c8"
   }
  },
  "hazard": {
   "name": "No privacy of mind",
   "rule": "Legion patrols question strangers. STALK past them, or answer in the forms of devotion the Haemen teach you."
  },
  "mechanic": {
   "name": "The liturgy",
   "rule": "Crowds follow fixed routes at fixed hours; learning the schedule opens doors."
  },
  "landmarks": [
   "Mykarlyth's chapel-light",
   "The forge of the Third Thamonian Lens"
  ],
  "telescope": "GOLDEN BODY. A STEADY POINT OF LIGHT ON THE NIGHT SIDE THAT NEVER GOES OUT.",
  "mood": "Bells, always bells.",
  "spoiler": false
 },
 {
  "id": "bellatora",
  "kind": "world",
  "no": 11,
  "name": "BELLATORA",
  "title": "The War World",
  "canon": {
   "trait": "Endless war: the Matriarch.",
   "firstRace": "BEASTFOLK (Branch VI · animal-humanoid crosses).",
   "notes": "A world that has never known peace and was never designed to. The Matriarch weaponises every faction equally. A matriarchal warrior culture: combat is for the love of the Queen and the Princess. Cease-fires last as long as a held breath.",
   "notable": "The Matriarch · the Bellatora line"
  },
  "concept": "Scarred battlefields, palisades and trenches, clan banners, war camps between the fronts. The front lines move between visits.",
  "terrain": [
   "churned mud",
   "scorched earth",
   "trenches",
   "palisades"
  ],
  "tiles": {
   "ground": "grass2",
   "path": "path",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "g": "#5a4a30",
    "G": "#7a6440",
    "h": "#3a2e1c"
   },
   "path": {
    "p": "#6a4a34",
    "P": "#4a3222",
    "B": "#8a2a20"
   },
   "liquid": {
    "a": "#4a3a2a",
    "A": "#6a5a40",
    "z": "#2a2018"
   },
   "wall": {
    "L": "#4a3a2a",
    "l": "#2a2016",
    "W": "#8a7a5a",
    "n": "#5a4a34",
    "N": "#1e160e"
   }
  },
  "props": [
   [
    "deadtree",
    "war"
   ],
   [
    "pillar",
    "palisade"
   ]
  ],
  "prop_palette": {
   "war": {
    "b": "#4a3a2a",
    "u": "#2a2016"
   },
   "palisade": {
    "W": "#8a6a44",
    "n": "#6a4a2a",
    "N": "#4a3018"
   }
  },
  "hazard": {
   "name": "The fronts",
   "rule": "No-man's-land is crossed only in a cease-fire window. Misjudge it and the battle reaches you."
  },
  "mechanic": {
   "name": "Allegiance",
   "rule": "Clans grant passage, and cards, to those who honour the Queen and the Princess."
  },
  "landmarks": [],
  "telescope": "RED-BROWN BODY. SMOKE PLUMES ACROSS THE DAY SIDE.",
  "mood": "War drums with no beginning.",
  "spoiler": false
 },
 {
  "id": "yvoris",
  "kind": "world",
  "no": 12,
  "name": "YVORIS",
  "title": "The Frozen World",
  "canon": {
   "trait": "Frozen stasis; enduring hardened forms.",
   "firstRace": "Enduring hardened forms (Synthetic precursors) · time-preserved archive lifeforms.",
   "notes": "Time does not pass on Yvoris; it pools. Anything that arrives is preserved exactly as it arrived. A vault, or a regret made geological.",
   "notable": "The Frozen Vault entities"
  },
  "concept": "Blue-white ice fields where creatures and travellers stand frozen mid-motion like statues; every one of them is a discovery.",
  "terrain": [
   "snow",
   "clear ice",
   "frozen tableaux",
   "ice cliffs"
  ],
  "tiles": {
   "ground": "grass",
   "path": "path",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "g": "#e2eef4",
    "G": "#ffffff",
    "h": "#b8ccd8"
   },
   "path": {
    "p": "#c8dce8",
    "P": "#a0bccc",
    "B": "#ffffff"
   },
   "liquid": {
    "a": "#a8c8d4",
    "A": "#e0f0f8",
    "z": "#7898a8"
   },
   "wall": {
    "L": "#b8d0dc",
    "l": "#7890a0",
    "W": "#ffffff",
    "n": "#d0e4ec",
    "N": "#587080"
   }
  },
  "props": [
   [
    "spire",
    "ice"
   ],
   [
    "deadtree",
    "frost"
   ]
  ],
  "prop_palette": {
   "ice": {
    "c": "#bfe6f4",
    "C": "#ffffff",
    "N": "#7890a0",
    "n": "#a8c8d4"
   },
   "frost": {
    "b": "#a8c0cc",
    "u": "#7890a0",
    "k": "#3a5060"
   }
  },
  "hazard": {
   "name": "Pooling time",
   "rule": "WARMTH drains, and standing still too long begins to freeze you in place. Keep moving."
  },
  "mechanic": {
   "name": "The vault",
   "rule": "Frozen subjects are documented like statues: perfect, motionless photographs every time."
  },
  "landmarks": [],
  "telescope": "WHITE BODY. VERY HIGH ALBEDO. NO CHANGE BETWEEN OBSERVATIONS.",
  "mood": "Silence that has been kept on purpose.",
  "spoiler": false
 },
 {
  "id": "kyrathos",
  "kind": "world",
  "no": 13,
  "name": "KYRATHOS",
  "title": "The Truth World",
  "canon": {
   "trait": "Hidden world of awareness.",
   "firstRace": "The Unblinking Awareness: minimal life.",
   "notes": "Almost invisible from orbit under a permanent low-light shroud. Those who reach the surface report a single unblinking awareness watching back. Kyrathos accepts no falsehood.",
   "notable": "Kyrathos itself, the watcher"
  },
  "concept": "A world in permanent dusk. Only what the carbide lamp touches is visible. Somewhere, always, the feeling of being looked at.",
  "terrain": [
   "shadow plain",
   "dim stone",
   "glass-black pools"
  ],
  "tiles": {
   "ground": "grass2",
   "path": "path",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "g": "#1c1024",
    "G": "#2a1a34",
    "h": "#100818"
   },
   "path": {
    "p": "#2a1e30",
    "P": "#1a1020",
    "B": "#6a4a8a"
   },
   "liquid": {
    "a": "#100818",
    "A": "#2a1a3a",
    "z": "#06030a"
   },
   "wall": {
    "L": "#24182c",
    "l": "#100818",
    "W": "#4a3a5a",
    "n": "#2e2238",
    "N": "#08040c"
   }
  },
  "props": [
   [
    "pillar",
    "shadow"
   ]
  ],
  "prop_palette": {
   "shadow": {
    "W": "#4a3a5a",
    "n": "#2e2238",
    "N": "#1c1024"
   }
  },
  "hazard": {
   "name": "Darkness",
   "rule": "Visibility is the lamp radius only; the field sketch fills in slowly."
  },
  "mechanic": {
   "name": "No falsehood",
   "rule": "Haemen and the world itself ask questions. A false answer ends the expedition with an immediate recall."
  },
  "landmarks": [],
  "telescope": "BODY NEARLY INVISIBLE. DETECTED ONLY WHEN IT PASSES IN FRONT OF A STAR.",
  "mood": "A held breath.",
  "spoiler": false
 },
 {
  "id": "nexyros",
  "kind": "world",
  "no": 14,
  "name": "NEXYROS",
  "title": "The Humanoid Prime World",
  "canon": {
   "trait": "Abandoned post-Transplacement. Egnellahc's ritual point.",
   "firstRace": "EGNELLAHC'S CONGREGATION (the Nexyrosillians), gone after the Transplacement.",
   "notes": "Once the cradle of the Humanoid Prime form, emptied in a single ritual: Egnellahc gathered his congregation and crossed elsewhere, leaving the spiral scar of his cosmic working. The four Nexyrosillian Kings were founded here. Doors that big do not always stay shut.",
   "notable": "Egnellahc · Saturnis · Baelgrin · Eirforn · Netherlin"
  },
  "concept": "Empty humanoid cities, intact and abandoned mid-life, arranged around a planet-sized spiral scar. The most human-feeling ruins Carl will find.",
  "terrain": [
   "cracked flagstone",
   "empty streets",
   "ritual circles",
   "the spiral scar"
  ],
  "tiles": {
   "ground": "grass2",
   "path": "den",
   "liquid": "water",
   "wall": "rock",
   "special": "ripple"
  },
  "palette": {
   "ground": {
    "g": "#6e6a5e",
    "G": "#8a8676",
    "h": "#4e4a40"
   },
   "path": {
    "B": "#8a8474",
    "u": "#4e4a40",
    "b": "#6e6a5e",
    "p": "#a8a290"
   },
   "liquid": {
    "a": "#4a5a6a",
    "A": "#6a7a8a",
    "z": "#2a3a4a"
   },
   "wall": {
    "L": "#5e5a4e",
    "l": "#3a3830",
    "W": "#a8a290",
    "n": "#6e6a5e",
    "N": "#24221c"
   },
   "special": {
    "W": "#b8a8d0",
    "n": "#6e6a5e",
    "N": "#4e4a40"
   }
  },
  "props": [
   [
    "pillar",
    "ruin"
   ],
   [
    "deadtree",
    "ash"
   ]
  ],
  "prop_palette": {
   "ruin": {
    "W": "#a8a290",
    "n": "#6e6a5e",
    "N": "#4e4a40"
   },
   "ash": {
    "b": "#5e5a4e",
    "u": "#3a3830"
   }
  },
  "hazard": {
   "name": "The scar",
   "rule": "Near the spiral scar, unstable openings appear. Step into one and you are recalled, rattled, to the ship."
  },
  "mechanic": {
   "name": "What they left",
   "rule": "Abandoned homes are full of Historical records: the richest archive of humanoid history in the Expanse."
  },
  "landmarks": [
   "The spiral scar of the Transplacement",
   "Egnellahc's ritual point"
  ],
  "telescope": "GREY BODY MARKED BY A VAST SPIRAL.",
  "mood": "Wind through empty doorways.",
  "spoiler": false
 },
 {
  "id": "jynaera",
  "kind": "world",
  "no": 15,
  "name": "JYNAERA",
  "title": "The Time World",
  "canon": {
   "trait": "Hyper-accelerated time.",
   "firstRace": "AVIANS (Branch III · likely) · time-accelerated cultures.",
   "notes": "One Jynaeran second equals several Aenoric years. Cultures rise and fall between heartbeats.",
   "notable": "Countless; each named for a heartbeat only"
  },
  "concept": "Layered strata of a thousand civilisations, ruins stacked on ruins, purple dusk light that flickers like a film between frames.",
  "terrain": [
   "layered strata",
   "stacked ruins",
   "flicker-fields"
  ],
  "tiles": {
   "ground": "grass2",
   "path": "den",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "g": "#5a2a6a",
    "G": "#7a4a8a",
    "h": "#3a1a48"
   },
   "path": {
    "B": "#7a5a8a",
    "u": "#3a2a48",
    "b": "#5a3a6a",
    "p": "#a888b8"
   },
   "liquid": {
    "a": "#6a3a8a",
    "A": "#9a6ab8",
    "z": "#3a1a5a"
   },
   "wall": {
    "L": "#4a2a5a",
    "l": "#2a1438",
    "W": "#9a6aaa",
    "n": "#5a3a6a",
    "N": "#1a0a24"
   }
  },
  "props": [
   [
    "pillar",
    "strata"
   ],
   [
    "spire",
    "time"
   ]
  ],
  "prop_palette": {
   "strata": {
    "W": "#b898c8",
    "n": "#7a5a8a",
    "N": "#4a2a5a"
   },
   "time": {
    "c": "#9a6ab8",
    "C": "#e8c8f8"
   }
  },
  "hazard": {
   "name": "Ageing",
   "rule": "Exposed film and specimens age fast. Develop and analyse quickly, or lose the record."
  },
  "mechanic": {
   "name": "Never the same twice",
   "rule": "The map is regenerated on every landing: a new civilisation, a new set of cards."
  },
  "landmarks": [],
  "telescope": "SURFACE FEATURES CHANGE BETWEEN OBSERVATIONS MINUTES APART.",
  "mood": "Ticking, too fast to count.",
  "spoiler": false
 },
 {
  "id": "sylvanir",
  "kind": "world",
  "no": 16,
  "name": "SYLVANIR",
  "title": "The Conscious World",
  "canon": {
   "trait": "Sentient forest consciousness.",
   "firstRace": "THE CANOPY MIND · Beastfolk / nature forest sapients.",
   "notes": "A forest that thinks across continents as a single mind. Canopy patterns rearrange into expressions. Visitors describe it as kind, and leaving as harder than expected.",
   "notable": "Sylvanir itself · the walking canopy"
  },
  "concept": "Deep, gentle forest with giant trunks and soft light. The canopy forms faces; paths quietly bend back toward the forest heart.",
  "terrain": [
   "forest floor",
   "giant trunks",
   "fern glades",
   "canopy light"
  ],
  "tiles": {
   "ground": "grass",
   "path": "path",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "g": "#1f4a2a",
    "G": "#3a7040",
    "h": "#12301a"
   },
   "path": {
    "p": "#5a4a30",
    "P": "#3a2e1c",
    "B": "#8a7a4a"
   },
   "liquid": {
    "a": "#2a5a4a",
    "A": "#4a8a6a",
    "z": "#1a3a2e"
   },
   "wall": {
    "L": "#2a3a24",
    "l": "#141e10",
    "W": "#5a7a4a",
    "n": "#344a2c",
    "N": "#0e160a"
   }
  },
  "props": [
   [
    "tree",
    "deep"
   ],
   [
    "shrub",
    "fern"
   ]
  ],
  "prop_palette": {
   "deep": {
    "g": "#2a5a30",
    "G": "#4a8a48",
    "h": "#163a1c",
    "v": "#c8e090"
   },
   "fern": {
    "c": "#c8e090",
    "C": "#f0ffc0"
   }
  },
  "hazard": {
   "name": "Kindness",
   "rule": "Paths lead back toward the forest heart. Leaving takes a flare or real navigation."
  },
  "mechanic": {
   "name": "Expressions",
   "rule": "The canopy reacts to what Carl does; kind actions open hidden glades."
  },
  "landmarks": [],
  "telescope": "DARK GREEN BODY. CANOPY PATTERNS SHIFT BETWEEN PLATES.",
  "mood": "Leaves that sound like breathing.",
  "spoiler": false
 },
 {
  "id": "velkryn",
  "kind": "world",
  "no": 17,
  "name": "VELKRYN",
  "title": "The Consumption World",
  "canon": {
   "trait": "Crimsonian Titans · pure consumption.",
   "firstRace": "GREATKIN CYCLOPES: the Crimsonian Titans, single-eye cosmic giants.",
   "notes": "Hunger metabolic and metaphysical at once. Velkryn does not produce; it intakes. Its mouth-like crater rings widen by visible degrees each century.",
   "notable": "Velkryn the Widening Mouth"
  },
  "concept": "Crimson crater-rings nested inside one another, bone-white rims, flesh-red stone, everything sloping toward a vast maw.",
  "terrain": [
   "crimson rock",
   "crater rims",
   "bone fields",
   "the maw"
  ],
  "tiles": {
   "ground": "grass2",
   "path": "path",
   "liquid": "water",
   "wall": "rock",
   "special": "ripple"
  },
  "palette": {
   "ground": {
    "g": "#4e1418",
    "G": "#6a2028",
    "h": "#2e0a0c"
   },
   "path": {
    "p": "#e8dcc8",
    "P": "#b8a890",
    "B": "#6a2028"
   },
   "liquid": {
    "a": "#2e0a0c",
    "A": "#5a1418",
    "z": "#14040a"
   },
   "wall": {
    "L": "#3e1014",
    "l": "#1e0608",
    "W": "#e8dcc8",
    "n": "#5a1a20",
    "N": "#0e0204"
   },
   "special": {
    "W": "#e8dcc8",
    "n": "#6a2028",
    "N": "#3e1014"
   }
  },
  "props": [
   [
    "deadtree",
    "bone"
   ],
   [
    "boulder",
    "crimson"
   ]
  ],
  "prop_palette": {
   "bone": {
    "b": "#e8dcc8",
    "u": "#b8a890",
    "k": "#4e1418"
   },
   "crimson": {
    "n": "#6a2028",
    "N": "#3e1014",
    "W": "#8a3040"
   }
  },
  "hazard": {
   "name": "The widening",
   "rule": "Crater rims crumble inward. Anything set down near a rim is gone on the next visit."
  },
  "mechanic": {
   "name": "Hunger",
   "rule": "Titans are territorial encounters on the largest scale; most documentation is done from far off."
  },
  "landmarks": [
   "Velkryn the Widening Mouth"
  ],
  "telescope": "DEEP RED BODY. CONCENTRIC CRATERS LIKE TARGET RINGS.",
  "mood": "A low, endless swallowing sound.",
  "spoiler": false
 },
 {
  "id": "ignara",
  "kind": "world",
  "no": 18,
  "name": "IGNARA",
  "title": "The Instability World",
  "canon": {
   "trait": "Failed balance; perpetual ignition.",
   "firstRace": "REPTILOIDS (Branch II · fire-kin · the lone Reptiloid world).",
   "notes": "Meant to balance fire and stone in equal measure. The calibration failed; the surface has burned for six billion years without consuming itself. A cautionary world.",
   "notable": "Ignara, the cautionary world"
  },
  "concept": "Fields of flame that never consume their fuel, ash plains, obsidian ridges; fire behaves like weather.",
  "terrain": [
   "burning fields",
   "ash plain",
   "obsidian ridges",
   "ember rivers"
  ],
  "tiles": {
   "ground": "grass2",
   "path": "cracks",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "g": "#3a1e14",
    "G": "#5a2e1c",
    "h": "#1e0e08"
   },
   "path": {
    "p": "#2a1810",
    "P": "#1a0e08",
    "B": "#ffae40"
   },
   "liquid": {
    "a": "#e05a1a",
    "A": "#ffd060",
    "z": "#a02a0a"
   },
   "wall": {
    "L": "#2a1810",
    "l": "#120804",
    "W": "#d05a1c",
    "n": "#3a2014",
    "N": "#0a0402"
   }
  },
  "props": [
   [
    "vent",
    "flame"
   ],
   [
    "spire",
    "obsidian"
   ]
  ],
  "prop_palette": {
   "flame": {
    "W": "#ffd060",
    "R": "#ff8a3a",
    "r": "#e05a1a"
   },
   "obsidian": {
    "c": "#3a2030",
    "C": "#8a5a70",
    "N": "#1e0e08",
    "n": "#2a1810"
   }
  },
  "hazard": {
   "name": "Flare-ups",
   "rule": "Ground ignites on a rhythm. Cross between flare-ups; SUIT burns if you misjudge."
  },
  "mechanic": {
   "name": "Unconsumed",
   "rule": "Fire here is a material: lantern-fire carried from Ignara never goes out (a ship upgrade)."
  },
  "landmarks": [],
  "telescope": "BURNING BODY. THE WHOLE DISC FLICKERS.",
  "mood": "Crackling, everywhere, forever.",
  "spoiler": false
 },
 {
  "id": "uralyx",
  "kind": "world",
  "no": 19,
  "name": "URALYX",
  "title": "The Perception World",
  "canon": {
   "trait": "Perception shapes reality.",
   "firstRace": "Perception-shaped forms (UNKNOWN / energy).",
   "notes": "What is observed becomes; what is not, fades. Mountains thin while no one looks at them. A wandering eye on Uralyx is geology.",
   "notable": "What is observed becomes"
  },
  "concept": "Pale lavender ground that is only solid where Carl has looked. Out of view, the map thins and redraws; the camera can make a bridge real.",
  "terrain": [
   "observed ground",
   "fading ground",
   "thinning peaks"
  ],
  "tiles": {
   "ground": "grass",
   "path": "path",
   "liquid": "water",
   "wall": "rock",
   "special": "ripple"
  },
  "palette": {
   "ground": {
    "g": "#7a6ba6",
    "G": "#9a8ac6",
    "h": "#5a4c86"
   },
   "path": {
    "p": "#a89ac8",
    "P": "#7a6ca0",
    "B": "#e0d8f8"
   },
   "liquid": {
    "a": "#4a3c7a",
    "A": "#7a6caa",
    "z": "#2a1e5a"
   },
   "wall": {
    "L": "#5a4c86",
    "l": "#3a2e66",
    "W": "#c8bce8",
    "n": "#6a5c96",
    "N": "#241a4a"
   },
   "special": {
    "W": "#e0d8f8",
    "n": "#9a8ac6",
    "N": "#7a6ba6"
   }
  },
  "props": [
   [
    "spire",
    "gaze"
   ]
  ],
  "prop_palette": {
   "gaze": {
    "c": "#9a8ac6",
    "C": "#ffffff",
    "N": "#5a4c86",
    "n": "#7a6ba6"
   }
  },
  "hazard": {
   "name": "Unwatched ground",
   "rule": "Tiles outside the field of view fade. Turn your back on a path and it may not be there."
  },
  "mechanic": {
   "name": "Observation is construction",
   "rule": "Photographing a gap fixes a bridge across it. The camera is the main tool on Uralyx."
  },
  "landmarks": [],
  "telescope": "SURFACE INDISTINCT. DETAIL RESOLVES ONLY UNDER LONG, STEADY OBSERVATION.",
  "mood": "A tone that changes when you stop listening.",
  "spoiler": false
 },
 {
  "id": "halcyra",
  "kind": "world",
  "no": 20,
  "name": "HALCYRA",
  "title": "The Harmony World",
  "canon": {
   "trait": "Oceanic harmony with devotion.",
   "firstRace": "AQUATICS (Branch V) · the devotional oceanic Order.",
   "notes": "Where Thallassar sings, Halcyra prays. Oceans organised into vast devotional patterns: currents that hold their shape across millennia. The calm is real, not a mask.",
   "notable": "The Halcyran Choirs"
  },
  "concept": "Calm teal seas with currents in geometric devotional figures, coral chapels, white sand bars. The gentlest world in the Expanse.",
  "terrain": [
   "patterned currents",
   "coral chapels",
   "sand bars",
   "still lagoons"
  ],
  "tiles": {
   "ground": "path",
   "path": "path",
   "liquid": "water",
   "wall": "rock",
   "special": "ripple"
  },
  "palette": {
   "ground": {
    "g": "#e8dcb8",
    "G": "#fff4d8",
    "h": "#c8b890"
   },
   "path": {
    "p": "#f0e4c4",
    "P": "#d0c098",
    "B": "#ffffff"
   },
   "liquid": {
    "a": "#2a8a96",
    "A": "#7ad0d8",
    "z": "#1a5a66"
   },
   "wall": {
    "L": "#d88a8a",
    "l": "#a85a5a",
    "W": "#ffd0c8",
    "n": "#e8a8a0",
    "N": "#784040"
   },
   "special": {
    "W": "#7ad0d8",
    "n": "#2a8a96",
    "N": "#1a5a66"
   }
  },
  "props": [
   [
    "spire",
    "coral"
   ],
   [
    "shrub",
    "sea"
   ]
  ],
  "prop_palette": {
   "coral": {
    "c": "#f0a0a0",
    "C": "#ffe0d8",
    "N": "#a85a5a",
    "n": "#d88a8a"
   },
   "sea": {
    "g": "#2a8a6a",
    "G": "#4ab08a",
    "h": "#1a6a4a",
    "c": "#ffffff",
    "C": "#ffffff"
   }
  },
  "hazard": {
   "name": "None",
   "rule": "Halcyra is safe. AIR still limits dives."
  },
  "mechanic": {
   "name": "Currents",
   "rule": "Current tiles carry you along their pattern; reading the devotional figures is the puzzle."
  },
  "landmarks": [
   "The Halcyran Choirs"
  ],
  "telescope": "OCEANIC BODY. CURRENTS FORM REGULAR GEOMETRIC FIGURES.",
  "mood": "A slow hymn carried by water.",
  "spoiler": false
 },
 {
  "id": "wyvera",
  "kind": "world",
  "no": 21,
  "name": "WYVERA",
  "title": "The Ascension World",
  "canon": {
   "trait": "Sky-dominant winged predators.",
   "firstRace": "AVIANS (Branch III · sky-predator bird-humanoid).",
   "notes": "Draevos's quieter, sharper descendant. Predators dominate by altitude, not mass: the higher you fly the truer you become. Many traditions of ascension trace their first hymns here.",
   "notable": "Wyveran Ascendants"
  },
  "concept": "Towering mesas and needle spires above a sea of blue air; rope bridges and updrafts link the heights. The map is a climb.",
  "terrain": [
   "mesa tops",
   "needle spires",
   "updraft shafts",
   "cliff ledges"
  ],
  "tiles": {
   "ground": "grass",
   "path": "path",
   "liquid": "cloud",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "g": "#6a9a6a",
    "G": "#8ac08a",
    "h": "#4a7a4a"
   },
   "path": {
    "p": "#c8b088",
    "P": "#a08a68",
    "B": "#e8d8b0"
   },
   "liquid": {
    "a": "#a8c8e8",
    "A": "#ffffff",
    "z": "#7aa0c8"
   },
   "wall": {
    "L": "#5a6a8a",
    "l": "#3a4a6a",
    "W": "#c8d8f0",
    "n": "#6a7a9a",
    "N": "#24304a"
   }
  },
  "props": [
   [
    "spire",
    "stone"
   ],
   [
    "deadtree",
    "wind"
   ]
  ],
  "prop_palette": {
   "stone": {
    "c": "#8a9ab8",
    "C": "#c8d8f0",
    "N": "#3a4a6a",
    "n": "#5a6a8a"
   },
   "wind": {
    "b": "#8a7a5a",
    "u": "#5a4a3a"
   }
  },
  "hazard": {
   "name": "Altitude",
   "rule": "Edges are falls (recall). Predators dive at anyone in the open on the high ground."
  },
  "mechanic": {
   "name": "Ascension",
   "rule": "The best discoveries are at the top. Each height reached is a Location card."
  },
  "landmarks": [
   "The Wyveran Ascendants"
  ],
  "telescope": "BLUE BODY. TOWERING COLUMNS OF CLOUD.",
  "mood": "Wind across a bottle neck, rising.",
  "spoiler": false
 },
 {
  "id": "rhyzor",
  "kind": "world",
  "no": 22,
  "name": "RHYZOR",
  "title": "The Resonance World",
  "canon": {
   "trait": "Sound is matter.",
   "firstRace": "Sound-carriers: Beastfolk + Synthetic · architects of pitch.",
   "notes": "A sustained note can be picked up and carried. A scream can become weather. Concentric sound-ripples mark the surface like growth rings. First of the \"physics belt\" worlds.",
   "notable": "The Rhyzoran Sound-Masons"
  },
  "concept": "Ripple-ringed stone plains and tuning pillars; solid notes lie where they were sung. Noise has weight here.",
  "terrain": [
   "ripple stone",
   "tuning pillars",
   "solid notes",
   "echo basins"
  ],
  "tiles": {
   "ground": "ripple",
   "path": "path",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "W": "#a8c0e0",
    "n": "#6a88a8",
    "N": "#4a6080"
   },
   "path": {
    "p": "#7a90b0",
    "P": "#5a7090",
    "B": "#c8d8f0"
   },
   "liquid": {
    "a": "#3a5070",
    "A": "#6a88a8",
    "z": "#1e2e44"
   },
   "wall": {
    "L": "#4a6080",
    "l": "#2a3a54",
    "W": "#a8c0e0",
    "n": "#5a7090",
    "N": "#1a2638"
   }
  },
  "props": [
   [
    "pillar",
    "tuning"
   ],
   [
    "spire",
    "note"
   ]
  ],
  "prop_palette": {
   "tuning": {
    "W": "#c8d8f0",
    "n": "#8aa0c0",
    "N": "#5d7a9c"
   },
   "note": {
    "c": "#8ab8e8",
    "C": "#ffffff",
    "N": "#3a5070",
    "n": "#5d7a9c"
   }
  },
  "hazard": {
   "name": "Noise",
   "rule": "Running is loud, and loud is solid: noise leaves obstacles behind you. STALK to move silently."
  },
  "mechanic": {
   "name": "Carrying a note",
   "rule": "Carl's wireless can 'hold' a note and set it down as a temporary bridge or wall."
  },
  "landmarks": [
   "The Rhyzoran Sound-Masons"
  ],
  "telescope": "BODY SHOWS CONCENTRIC RINGS. THE WIRELESS PICKS UP PURE TONES.",
  "mood": "Overtones layered like weather.",
  "spoiler": false
 },
 {
  "id": "elythera",
  "kind": "world",
  "no": 23,
  "name": "ELYTHERA",
  "title": "The Floating World",
  "canon": {
   "trait": "Floating continents.",
   "firstRace": "AVIANS (Branch III · floating civilisations) · aeronauts.",
   "notes": "Landmasses long ago let go of the planet beneath them and drift on currents of air and intention. Maps are kept as appointments, not records.",
   "notable": "Elyther Sky Priests"
  },
  "concept": "Green islands adrift over a cloud sea, bridged by vines and aeronaut lines. The landing site itself drifts.",
  "terrain": [
   "island meadow",
   "island edge",
   "cloud sea",
   "vine bridges"
  ],
  "tiles": {
   "ground": "grass",
   "path": "path",
   "liquid": "cloud",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "g": "#2f7065",
    "G": "#4a9a88",
    "h": "#1e4a42"
   },
   "path": {
    "p": "#c8b888",
    "P": "#a8946a",
    "B": "#e8dcb0"
   },
   "liquid": {
    "a": "#d8e8f4",
    "A": "#ffffff",
    "z": "#a8c0d8"
   },
   "wall": {
    "L": "#5a6a5a",
    "l": "#3a4a3a",
    "W": "#a8b8a8",
    "n": "#6a7a6a",
    "N": "#24302a"
   }
  },
  "props": [
   [
    "tree",
    "sky"
   ],
   [
    "shrub",
    "sky"
   ]
  ],
  "prop_palette": {
   "sky": {
    "g": "#3a8a78",
    "G": "#6ac0a8",
    "h": "#1e5a4a",
    "v": "#f0d8f8",
    "c": "#f0d8f8",
    "C": "#ffffff"
   }
  },
  "hazard": {
   "name": "Drift",
   "rule": "Islands move between visits. The edge is a fall; the ship must find the landing again each time."
  },
  "mechanic": {
   "name": "Appointments",
   "rule": "Some islands meet only at certain times; the Sky Priests keep the schedule."
  },
  "landmarks": [
   "The Elyther Sky Priests"
  ],
  "telescope": "LANDMASSES APPEAR DETACHED FROM THE SURFACE, CASTING SHADOWS ON CLOUD.",
  "mood": "Ropes creaking in high wind.",
  "spoiler": false
 },
 {
  "id": "xylos",
  "kind": "world",
  "no": 24,
  "name": "XYLOS",
  "title": "The Crystal World",
  "canon": {
   "trait": "Crystalline; frequency-locked.",
   "firstRace": "ENERGY-BASED (Branch VII · crystalline / frequency) · the Xylorans.",
   "notes": "A polyhedral world of pure crystal lattice. Every surface vibrates at a fixed frequency; any creature out of tune shatters on contact. Xylos welcomes only the perfectly aligned.",
   "notable": "The Xylorans (perfect-tuning caste)"
  },
  "concept": "Facetted crystal plains throwing prism light; spires that ring when the wind crosses them.",
  "terrain": [
   "crystal facets",
   "prism fields",
   "ringing spires"
  ],
  "tiles": {
   "ground": "grid",
   "path": "path",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "c": "#ffffff",
    "C": "#e8f6ff",
    "l": "#cfd9e0"
   },
   "path": {
    "p": "#e0e8ee",
    "P": "#b8c8d4",
    "B": "#ffffff"
   },
   "liquid": {
    "a": "#a8d8f0",
    "A": "#ffffff",
    "z": "#78a8c8"
   },
   "wall": {
    "L": "#b8c8d4",
    "l": "#8898a8",
    "W": "#ffffff",
    "n": "#d0dce4",
    "N": "#687888"
   }
  },
  "props": [
   [
    "spire",
    "prism"
   ]
  ],
  "prop_palette": {
   "prism": {
    "c": "#c8e8f8",
    "C": "#ffffff",
    "N": "#8898a8",
    "n": "#b8c8d4"
   }
  },
  "hazard": {
   "name": "Out of tune",
   "rule": "Unaligned facets damage SUIT on contact. Tune the wireless to the local frequency before crossing."
  },
  "mechanic": {
   "name": "Tuning",
   "rule": "Each crystal field has a frequency; the radio dial becomes a key."
  },
  "landmarks": [
   "The Xylorans"
  ],
  "telescope": "PALE FACETED BODY. SPECULAR FLASHES AS IT TURNS.",
  "mood": "Glass harmonica.",
  "spoiler": false
 },
 {
  "id": "gravaron",
  "kind": "world",
  "no": 25,
  "name": "GRAVARON",
  "title": "The Gravity World",
  "canon": {
   "trait": "Extreme gravity.",
   "firstRace": "Gravity-adapted low-form endurers (Beastfolk + Synthetic).",
   "notes": "Outer-spire and impossibly dense. Light bends visibly around its silhouette. The species that adapted are squat, slow and unkillable. Closes the physics belt.",
   "notable": "Gravarene Undertakers"
  },
  "concept": "Flattened dark terrain where nothing stands tall; light visibly bends near the horizon.",
  "terrain": [
   "flattened stone",
   "low domes",
   "pressure plains"
  ],
  "tiles": {
   "ground": "grass2",
   "path": "path",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "g": "#231832",
    "G": "#33244a",
    "h": "#140c1e"
   },
   "path": {
    "p": "#3a2e48",
    "P": "#241a30",
    "B": "#7a6a98"
   },
   "liquid": {
    "a": "#1a1028",
    "A": "#3a2a54",
    "z": "#0a0614"
   },
   "wall": {
    "L": "#2a1e38",
    "l": "#140c1e",
    "W": "#5a4a78",
    "n": "#342848",
    "N": "#0a0610"
   }
  },
  "props": [
   [
    "boulder",
    "dense"
   ]
  ],
  "prop_palette": {
   "dense": {
    "n": "#3a2e48",
    "N": "#231832",
    "W": "#5a4a78"
   }
  },
  "hazard": {
   "name": "Weight",
   "rule": "Movement at half speed; heavy gear slows you further. Every step costs SUIT."
  },
  "mechanic": {
   "name": "What endures",
   "rule": "Landing here requires a drive refit; the Gravarene Undertakers are the reward."
  },
  "landmarks": [
   "The Gravarene Undertakers"
  ],
  "telescope": "DARK BODY. STARLIGHT BENDS VISIBLY AT ITS LIMB.",
  "mood": "A sound pressed flat.",
  "spoiler": false
 },
 {
  "id": "ferros",
  "kind": "world",
  "no": 26,
  "name": "FERROS",
  "title": "The Machine World",
  "canon": {
   "trait": "Industrial dominance.",
   "firstRace": "MACHINE-WROUGHT industrialists (Synthetic mortals).",
   "notes": "Where Cytherion's grid was inherited, Ferros's machinery is built: forges, rails, mines, refineries across a continent-spanning works. It exports the tools the Expanse uses to remember the shape of progress. (The timeline also names it Ferralis.)",
   "notable": "Ferros Forgemasters (successor-line to Cytherion's Grid)"
  },
  "concept": "Rails, forges, smokestacks and slag fields. The one world a 1936 engineer half-understands, and the best place in the Expanse to refit Carl's ship.",
  "terrain": [
   "iron plate",
   "rail lines",
   "slag fields",
   "forge yards"
  ],
  "tiles": {
   "ground": "grass2",
   "path": "rail",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "g": "#4a3e34",
    "G": "#6a5a4a",
    "h": "#2e261e"
   },
   "path": {
    "p": "#4a3e34",
    "P": "#2e261e",
    "B": "#c8843c"
   },
   "liquid": {
    "a": "#e07a2a",
    "A": "#ffc060",
    "z": "#8a3a0a"
   },
   "wall": {
    "L": "#5a4a40",
    "l": "#2e241e",
    "W": "#a89078",
    "n": "#6a5a4e",
    "N": "#1a1410"
   }
  },
  "props": [
   [
    "pylon",
    "forge"
   ],
   [
    "vent",
    "smoke"
   ]
  ],
  "prop_palette": {
   "forge": {
    "y": "#c8843c",
    "Y": "#ffc060",
    "M": "#5a4a40",
    "m": "#8a7a6a"
   },
   "smoke": {
    "W": "#8a8478",
    "R": "#c8843c",
    "r": "#8a4a1a"
   }
  },
  "hazard": {
   "name": "The works",
   "rule": "Rail carts and furnaces run on schedules; stay off the rails when the bell rings."
  },
  "mechanic": {
   "name": "Refits",
   "rule": "Ferros is where Carl's 1936 rocket becomes Earth-Aethryx hybrid technology."
  },
  "landmarks": [
   "The Ferros Forgemasters"
  ],
  "telescope": "POINT LIGHTS IN STRAIGHT LINES ACROSS THE NIGHT SIDE. INDUSTRY?",
  "mood": "Hammers, engines, a whistle far off.",
  "spoiler": false
 },
 {
  "id": "viridia",
  "kind": "world",
  "no": 27,
  "name": "VIRIDIA",
  "title": "The Balance World",
  "canon": {
   "trait": "Final planet · balance · the Veil · the Astral Core. True humans.",
   "firstRace": "TRUE HUMANS · the Aur-bloodline · the Viridians.",
   "notes": "The saga's anchor world: fire, water, sky, earth and astral in deliberate balance. Wrapped in the Veil; powered at its heart by the Astral Core. Fifty districts. Sacred sites: the Tree of Elyssia, the Aurora Crown Bridge, Dragonsong Peaks, Glasscurrent Bay & Oceania, Cinderbay, Khronexus beneath the western territories, Heartplains Hall.",
   "notable": "The Veilkeepers · the Aur-Veridae line"
  },
  "concept": "The most Earth-like world Carl ever finds: green hills, rivers, towns, people who look human. For a homesick man in 1936, the hardest place to leave.",
  "terrain": [
   "green hills",
   "rivers",
   "towns",
   "sacred sites"
  ],
  "tiles": {
   "ground": "grass",
   "path": "path",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "g": "#4a9a5a",
    "G": "#6ac070",
    "h": "#2e7040"
   },
   "path": {
    "p": "#c8a46a",
    "P": "#a8834c",
    "B": "#e8c88a"
   },
   "liquid": {
    "a": "#3a7ad8",
    "A": "#8cc0f6",
    "z": "#24508f"
   },
   "wall": {
    "L": "#6a6a58",
    "l": "#3e3e32",
    "W": "#c8c0a0",
    "n": "#7a7a66",
    "N": "#2a2a20"
   }
  },
  "props": [
   [
    "tree",
    "viridia"
   ],
   [
    "shrub",
    "viridia"
   ]
  ],
  "prop_palette": {
   "viridia": {
    "v": "#e8c878",
    "c": "#e8c878",
    "C": "#fff3c8"
   }
  },
  "hazard": {
   "name": "Where the Veil thins",
   "rule": "Near veil fractures the world bleeds into other realms; the compass and the wireless both fail."
  },
  "mechanic": {
   "name": "Almost home",
   "rule": "Viridian Haemen are the first people Carl can almost talk to; relationships here go deepest."
  },
  "landmarks": [
   "The Tree of Elyssia",
   "The Aurora Crown Bridge",
   "Dragonsong Peaks",
   "Glasscurrent Bay & Oceania",
   "Cinderbay",
   "Khronexus",
   "Heartplains Hall"
  ],
  "telescope": "GREEN AND BLUE BODY WITH WHITE CLOUD. IT LOOKS LIKE HOME.",
  "mood": "Birdsong. It sounds like home.",
  "spoiler": false
 },
 {
  "id": "aep28",
  "kind": "world",
  "no": 28,
  "name": "AEP-28",
  "title": "The Drift World",
  "spoiler": true,
  "canon": {
   "trait": "The Drift Planet: the Fourth Question.",
   "firstRace": "UNKNOWN.",
   "notes": "Outside the ordered systems entirely; it wanders and crosses every ring. Three scholarly camps: Transition, Renewal, Forgotten. Canonically open. (In 1955 it comes to Earth: the Carl Nasaro canon.)",
   "notable": "Primalut (contested)"
  },
  "concept": "Deliberately undesigned. AEP-28 is not drawn on the chart and is not landable in the 1936–1945 expedition. Its environment is the Creator's to reveal.",
  "terrain": [
   "—"
  ],
  "tiles": {
   "ground": "grass",
   "path": "path",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {},
  "props": [],
  "prop_palette": {},
  "hazard": {
   "name": "—",
   "rule": "—"
  },
  "mechanic": {
   "name": "—",
   "rule": "—"
  },
  "landmarks": [],
  "telescope": "A FAINT BODY ON AN ORBIT THAT MATCHES NOTHING ELSE.",
  "mood": "—"
 },
 {
  "id": "malezor",
  "kind": "district",
  "no": 1,
  "world": 9,
  "name": "MALEZOR",
  "title": "the Beastlands",
  "lord": "Rakoron, the Rubylord",
  "gem": "Ruby",
  "land": "Beastlands",
  "concept": "Built (survey builds 1–4). Meadow, pond and pine-dark border; the First Den in the north-east.",
  "terrain": [
   "meadow",
   "pond",
   "stone path",
   "cave"
  ],
  "tiles": {
   "ground": "grass",
   "path": "path",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {},
  "props": [
   [
    "tree",
    null
   ],
   [
    "shrub",
    null
   ]
  ],
  "prop_palette": {},
  "hazard": {
   "name": "Territory",
   "rule": "Territorial Zyrex warn, then charge."
  },
  "mechanic": {
   "name": "First contact",
   "rule": "The first Haemen relationship and the first Lexicon reclassification."
  },
  "landmarks": [
   "The First Den",
   "The Fanghall",
   "The Bloodscent Lodge"
  ],
  "mood": "Predators at the edge of hearing.",
  "canon": {
   "trait": "the Beastlands",
   "firstRace": "",
   "notes": "",
   "notable": "Rakoron, the Rubylord"
  },
  "spoiler": false
 },
 {
  "id": "zarvane",
  "kind": "district",
  "no": 2,
  "world": 9,
  "name": "ZARVANE",
  "title": "the silver oasis",
  "lord": "Ivirium, the Pearlord",
  "gem": "Pearl",
  "land": "Auralands",
  "concept": "A silver desert around mirror-still pools, pearl-white sand and pale palms; the air hums between thoughts.",
  "terrain": [
   "pearl sand",
   "mirror pools",
   "silver dunes"
  ],
  "tiles": {
   "ground": "path",
   "path": "path",
   "liquid": "water",
   "wall": "rock",
   "special": "ripple"
  },
  "palette": {
   "ground": {
    "g": "#e8e0d4",
    "G": "#ffffff",
    "h": "#c8bcac"
   },
   "path": {
    "p": "#ece4d8",
    "P": "#cfc4b4",
    "B": "#ffffff"
   },
   "liquid": {
    "a": "#b8d8e8",
    "A": "#ffffff",
    "z": "#88a8c0"
   },
   "wall": {
    "L": "#d8d0c4",
    "l": "#a89c8c",
    "W": "#ffffff",
    "n": "#e8e0d4",
    "N": "#7a6e60"
   },
   "special": {
    "W": "#ffffff",
    "n": "#e8e0d4",
    "N": "#c8bcac"
   }
  },
  "props": [
   [
    "spire",
    "pearl"
   ],
   [
    "shrub",
    "palm"
   ]
  ],
  "prop_palette": {
   "pearl": {
    "c": "#f4ecf0",
    "C": "#ffffff",
    "N": "#a89c8c",
    "n": "#d8d0c4"
   },
   "palm": {
    "g": "#7aa07a",
    "G": "#a8c8a0",
    "h": "#4a7a5a",
    "c": "#e8e0d4",
    "C": "#ffffff"
   }
  },
  "hazard": {
   "name": "Mirage",
   "rule": "Reflections in the pools show places that are not there."
  },
  "mechanic": {
   "name": "Resonance",
   "rule": "Standing still near the Resonance Spire reveals hidden auras on the map."
  },
  "landmarks": [
   "The Quiet Between",
   "The Resonance Spire",
   "The Vibration Conservatory"
  ],
  "mood": "A single held tone over sand.",
  "canon": {
   "trait": "the silver oasis",
   "firstRace": "",
   "notes": "",
   "notable": "Ivirium, the Pearlord"
  },
  "spoiler": false
 },
 {
  "id": "andrannor",
  "kind": "district",
  "no": 3,
  "world": 9,
  "name": "ANDRANNOR",
  "title": "everything adapts",
  "lord": "Mutaryn, the Citrinelord",
  "gem": "Citrine",
  "land": "Creaturelands",
  "concept": "A restless golden savanna-jungle where species blur into one another; nothing in Andrannor keeps one shape for long.",
  "terrain": [
   "gold savanna",
   "hybrid thicket",
   "chimera tracks"
  ],
  "tiles": {
   "ground": "grass2",
   "path": "path",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "g": "#b8a040",
    "G": "#d8c060",
    "h": "#8a7428"
   },
   "path": {
    "p": "#c8a46a",
    "P": "#a8834c",
    "B": "#e8c88a"
   },
   "liquid": {
    "a": "#4a8a6a",
    "A": "#7ab89a",
    "z": "#2a5a44"
   },
   "wall": {
    "L": "#7a6a3a",
    "l": "#4a3e1e",
    "W": "#c8b878",
    "n": "#8a7a48",
    "N": "#2e2610"
   }
  },
  "props": [
   [
    "tree",
    "citrine"
   ],
   [
    "shrub",
    "citrine"
   ]
  ],
  "prop_palette": {
   "citrine": {
    "g": "#a8a040",
    "G": "#d8d060",
    "h": "#6a6a28",
    "v": "#f4c542",
    "c": "#f4c542",
    "C": "#fff3a8"
   }
  },
  "hazard": {
   "name": "Adaptation",
   "rule": "Zyrex here change form between encounters; a photograph from yesterday may not match."
  },
  "mechanic": {
   "name": "The Menagerie",
   "rule": "Hybrid sightings count as new subjects."
  },
  "landmarks": [
   "The Chimera Exchange",
   "The Morphic Menagerie",
   "Club VX"
  ],
  "mood": "Calls that keep changing species.",
  "canon": {
   "trait": "everything adapts",
   "firstRace": "",
   "notes": "",
   "notable": "Mutaryn, the Citrinelord"
  },
  "spoiler": false
 },
 {
  "id": "veridan",
  "kind": "district",
  "no": 4,
  "world": 9,
  "name": "VERIDAN",
  "title": "the living forest",
  "lord": "Emeralix, the Emeralord",
  "gem": "Emerald",
  "land": "Naturelands",
  "concept": "Old emerald forest, roots like walls and moss like carpet; the slowest, oldest dominance on Zyraxis.",
  "terrain": [
   "emerald forest",
   "root walls",
   "moss floor"
  ],
  "tiles": {
   "ground": "grass",
   "path": "den",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "g": "#2a8a5a",
    "G": "#4ab878",
    "h": "#1a5e3c"
   },
   "path": {
    "B": "#5a4a30",
    "u": "#2e2416",
    "b": "#44361f",
    "p": "#7a6a40"
   },
   "liquid": {
    "a": "#2a6a5a",
    "A": "#4a9a88",
    "z": "#1a4a3e"
   },
   "wall": {
    "L": "#2e4a34",
    "l": "#162a1c",
    "W": "#6a8a6a",
    "n": "#3a5a40",
    "N": "#0e1e12"
   }
  },
  "props": [
   [
    "tree",
    "emerald"
   ],
   [
    "shrub",
    "moss"
   ]
  ],
  "prop_palette": {
   "emerald": {
    "g": "#2a8a5a",
    "G": "#4ab878",
    "h": "#1a5e3c",
    "v": "#2fe6a8"
   },
   "moss": {
    "c": "#2fe6a8",
    "C": "#b8ffe8"
   }
  },
  "hazard": {
   "name": "The green wall",
   "rule": "Cut paths grow back between visits."
  },
  "mechanic": {
   "name": "Seedvault",
   "rule": "Seeds are a new specimen class; planting one opens a path."
  },
  "landmarks": [
   "The Root Parliament",
   "The Seedvault",
   "The Overgrowth Hospice"
  ],
  "mood": "Leaves and slow wood.",
  "canon": {
   "trait": "the living forest",
   "firstRace": "",
   "notes": "",
   "notable": "Emeralix, the Emeralord"
  },
  "spoiler": false
 },
 {
  "id": "netharion",
  "kind": "district",
  "no": 5,
  "world": 9,
  "name": "NETHARION",
  "title": "the world hub",
  "lord": "Eurakeon, the Amethystlord",
  "gem": "Amethyst",
  "land": "Unknownlands · centre",
  "concept": "The unstable centre of Zyraxis: violet ground, buildings at wrong angles, reality anomalies where the map does not agree with itself.",
  "terrain": [
   "violet stone",
   "anomaly fields",
   "crooked streets"
  ],
  "tiles": {
   "ground": "grid",
   "path": "den",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "c": "#b87cff",
    "C": "#e8d0ff",
    "l": "#2a1a44"
   },
   "path": {
    "B": "#5a3e7a",
    "u": "#2a1a44",
    "b": "#4a3468",
    "p": "#7a5aa0"
   },
   "liquid": {
    "a": "#4a2a7a",
    "A": "#8a5ab8",
    "z": "#2a1450"
   },
   "wall": {
    "L": "#3a2858",
    "l": "#1e1236",
    "W": "#b87cff",
    "n": "#4a3468",
    "N": "#100820"
   }
  },
  "props": [
   [
    "spire",
    "amethyst"
   ],
   [
    "pillar",
    "crooked"
   ]
  ],
  "prop_palette": {
   "amethyst": {
    "c": "#b87cff",
    "C": "#f0e0ff",
    "N": "#2a1a44",
    "n": "#4a3468"
   },
   "crooked": {
    "W": "#b8a8d0",
    "n": "#6a5a8a",
    "N": "#3a2858"
   }
  },
  "hazard": {
   "name": "Anomalies",
   "rule": "Instruments misread; the field sketch disagrees with what you see."
  },
  "mechanic": {
   "name": "The hub",
   "rule": "Routes to every other district meet here."
  },
  "landmarks": [
   "The Impossible Archive",
   "The Null Observatory",
   "The Crooked House"
  ],
  "mood": "A melody played slightly out of order.",
  "canon": {
   "trait": "the world hub",
   "firstRace": "",
   "notes": "",
   "notable": "Eurakeon, the Amethystlord"
  },
  "spoiler": false
 },
 {
  "id": "vorashil",
  "kind": "district",
  "no": 6,
  "world": 9,
  "name": "VORASHIL",
  "title": "the sky roads",
  "lord": "Azurel, the Sapphirelord",
  "gem": "Sapphire",
  "land": "Allelands",
  "concept": "Causeways and sky roads above blue haze; alien, non-humanoid architecture built for bodies that are not shaped like ours.",
  "terrain": [
   "sky roads",
   "sapphire causeways",
   "blue haze"
  ],
  "tiles": {
   "ground": "path",
   "path": "path",
   "liquid": "cloud",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "g": "#4a6ab8",
    "G": "#7a9ae0",
    "h": "#2a4a8a"
   },
   "path": {
    "p": "#5a7ac8",
    "P": "#3a5aa8",
    "B": "#c8d8ff"
   },
   "liquid": {
    "a": "#a8c8f0",
    "A": "#ffffff",
    "z": "#7aa0d8"
   },
   "wall": {
    "L": "#3a5a9a",
    "l": "#1e3a6a",
    "W": "#a8c0f0",
    "n": "#4a6aa8",
    "N": "#122448"
   }
  },
  "props": [
   [
    "pylon",
    "sapphire"
   ],
   [
    "spire",
    "sapphire"
   ]
  ],
  "prop_palette": {
   "sapphire": {
    "c": "#4a7dff",
    "C": "#c8d8ff",
    "N": "#1e3a6a",
    "n": "#3a5a9a",
    "y": "#4a7dff",
    "Y": "#c8d8ff",
    "M": "#3a5a9a",
    "m": "#5a7ac8"
   }
  },
  "hazard": {
   "name": "Edges",
   "rule": "The roads have no rails. Off the edge is a fall and a recall."
  },
  "mechanic": {
   "name": "Alien logic",
   "rule": "Haemen-like inhabitants communicate in shapes, not words; the Shape Embassy teaches the first ones."
  },
  "landmarks": [
   "The Shape Embassy",
   "The Manybody Habitat",
   "The Unmouth Academy"
  ],
  "mood": "Chords in a scale we do not use.",
  "canon": {
   "trait": "the sky roads",
   "firstRace": "",
   "notes": "",
   "notable": "Azurel, the Sapphirelord"
  },
  "spoiler": false
 },
 {
  "id": "xilnar",
  "kind": "district",
  "no": 7,
  "world": 9,
  "name": "XILNAR",
  "title": "the binding mountains",
  "lord": "Obsidius, the Onyxlord",
  "gem": "Onyx",
  "land": "Spiritlands",
  "concept": "Black mountains and lantern-lit passes; souls and death-energy move in the half-light. The home of the only Gemlord still walking.",
  "terrain": [
   "onyx slopes",
   "lantern passes",
   "spirit fog"
  ],
  "tiles": {
   "ground": "grass2",
   "path": "path",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "g": "#24202a",
    "G": "#3a3444",
    "h": "#141018"
   },
   "path": {
    "p": "#3a3444",
    "P": "#24202a",
    "B": "#e8c46a"
   },
   "liquid": {
    "a": "#1a1624",
    "A": "#3a3450",
    "z": "#0a0810"
   },
   "wall": {
    "L": "#2a2432",
    "l": "#100c16",
    "W": "#6e5a8a",
    "n": "#3a3444",
    "N": "#08060c"
   }
  },
  "props": [
   [
    "pillar",
    "onyx"
   ],
   [
    "deadtree",
    "spirit"
   ]
  ],
  "prop_palette": {
   "onyx": {
    "W": "#6e5a8a",
    "n": "#3a3444",
    "N": "#24202a"
   },
   "spirit": {
    "b": "#4a4458",
    "u": "#24202a",
    "k": "#0a0810"
   }
  },
  "hazard": {
   "name": "Spirit fog",
   "rule": "Visibility drops between lanterns; light the lanterns to hold the path."
  },
  "mechanic": {
   "name": "Binding",
   "rule": "Obsidius's bindings can be seen and photographed, but never crossed."
  },
  "landmarks": [
   "The Last Lantern",
   "The Blackwake Chapel",
   "The Walking Lords Station"
  ],
  "mood": "Bells far below the mountain.",
  "canon": {
   "trait": "the binding mountains",
   "firstRace": "",
   "notes": "",
   "notable": "Obsidius, the Onyxlord"
  },
  "spoiler": false
 },
 {
  "id": "baelgor",
  "kind": "district",
  "no": 8,
  "world": 9,
  "name": "BAELGOR",
  "title": "the ember reach",
  "lord": "Ambrevon, the Amberlord",
  "gem": "Amber",
  "land": "Humanoidlands",
  "concept": "Amber-lit towns, warm stone and ember skies: civilisation, structure, the humanoid ideal. The most populous district.",
  "terrain": [
   "amber streets",
   "warm stone",
   "ember fields"
  ],
  "tiles": {
   "ground": "grass2",
   "path": "den",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "g": "#a8743a",
    "G": "#c8944a",
    "h": "#7a4e22"
   },
   "path": {
    "B": "#c8a06a",
    "u": "#7a5a34",
    "b": "#a88454",
    "p": "#e8c890"
   },
   "liquid": {
    "a": "#3a6a9a",
    "A": "#6a9ac8",
    "z": "#24486a"
   },
   "wall": {
    "L": "#8a6a44",
    "l": "#5a4228",
    "W": "#e0b888",
    "n": "#9a7a54",
    "N": "#3a2a16"
   }
  },
  "props": [
   [
    "pillar",
    "amber"
   ],
   [
    "shrub",
    "ember"
   ]
  ],
  "prop_palette": {
   "amber": {
    "W": "#f0c890",
    "n": "#c8944a",
    "N": "#8a6a44"
   },
   "ember": {
    "g": "#8a6a3a",
    "G": "#b88a4a",
    "h": "#5a4422",
    "c": "#f08940",
    "C": "#ffd08a"
   }
  },
  "hazard": {
   "name": "Crowds",
   "rule": "None dangerous; Haemen everywhere. Relationships, trade and missions are the depth here."
  },
  "mechanic": {
   "name": "First Settlement",
   "rule": "The Hall of First Settlement holds the oldest Historical records on Zyraxis."
  },
  "landmarks": [
   "The Hall of First Settlement",
   "The Tenfold Forum",
   "Baelgor University"
  ],
  "mood": "Market noise and hearth-crackle.",
  "canon": {
   "trait": "the ember reach",
   "firstRace": "",
   "notes": "",
   "notable": "Ambrevon, the Amberlord"
  },
  "spoiler": false
 },
 {
  "id": "thardun",
  "kind": "district",
  "no": 9,
  "world": 9,
  "name": "THARDUN",
  "title": "the Mechlands",
  "lord": "Oathane, the Anomaly (missing)",
  "gem": "Ninth formation",
  "land": "Mechlands",
  "concept": "Precision machinery that has run without its god: foundries, gears, measured streets. It grew strange because it grew alone.",
  "terrain": [
   "steel plate",
   "gear works",
   "measured streets"
  ],
  "tiles": {
   "ground": "grid",
   "path": "rail",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "c": "#5fe6d8",
    "C": "#c8fff8",
    "l": "#2a3236"
   },
   "path": {
    "p": "#4a5458",
    "P": "#2a3236",
    "B": "#5fe6d8"
   },
   "liquid": {
    "a": "#2a4a50",
    "A": "#5fe6d8",
    "z": "#14282c"
   },
   "wall": {
    "L": "#3a4448",
    "l": "#1e2428",
    "W": "#9aa8ae",
    "n": "#4a5458",
    "N": "#101416"
   }
  },
  "props": [
   [
    "pylon",
    "mech"
   ],
   [
    "vent",
    "steam"
   ]
  ],
  "prop_palette": {
   "mech": {
    "y": "#5fe6d8",
    "Y": "#c8fff8",
    "M": "#3a4448",
    "m": "#6a7a80"
   },
   "steam": {
    "W": "#c8d0d4",
    "R": "#5fe6d8",
    "r": "#2a8a80"
   }
  },
  "hazard": {
   "name": "The machinery",
   "rule": "Mechanisms run on timers; crossing the works is a timing puzzle."
  },
  "mechanic": {
   "name": "The Orphan Foundry",
   "rule": "Machines without makers: technology cards for the ship."
  },
  "landmarks": [
   "The Precision Ministry",
   "The Orphan Foundry",
   "The Anomaly Engine"
  ],
  "mood": "Gears without a conductor.",
  "canon": {
   "trait": "the Mechlands",
   "firstRace": "",
   "notes": "",
   "notable": "Oathane, the Anomaly (missing)"
  },
  "spoiler": false
 },
 {
  "id": "korathen",
  "kind": "district",
  "no": 10,
  "world": 9,
  "name": "KORATHEN",
  "title": "the far seat",
  "lord": "Oatheus, the Ultralord (missing)",
  "gem": "Tenth formation",
  "land": "Ultralands",
  "concept": "High gold-white plateaus around a seat no one occupies; law and silence, absolute authority with no one to wield it.",
  "terrain": [
   "gold plateaus",
   "white stone courts",
   "law-stones"
  ],
  "tiles": {
   "ground": "grass2",
   "path": "den",
   "liquid": "water",
   "wall": "rock"
  },
  "palette": {
   "ground": {
    "g": "#d8c890",
    "G": "#f0e4b0",
    "h": "#b0a068"
   },
   "path": {
    "B": "#f0e8d0",
    "u": "#b0a478",
    "b": "#d8ccaa",
    "p": "#fff8e0"
   },
   "liquid": {
    "a": "#a8c0d8",
    "A": "#ffffff",
    "z": "#7890a8"
   },
   "wall": {
    "L": "#c8bc98",
    "l": "#988c68",
    "W": "#ffffff",
    "n": "#d8ccaa",
    "N": "#686040"
   }
  },
  "props": [
   [
    "pillar",
    "white"
   ],
   [
    "spire",
    "gold"
   ]
  ],
  "prop_palette": {
   "white": {
    "W": "#ffffff",
    "n": "#e8e0c8",
    "N": "#b0a478"
   },
   "gold": {
    "c": "#ffd770",
    "C": "#fff8d0",
    "N": "#988c68",
    "n": "#c8bc98"
   }
  },
  "hazard": {
   "name": "The far seat",
   "rule": "Korathen is reached last; the climb is the hazard."
  },
  "mechanic": {
   "name": "Spoiler-gated",
   "rule": "Its landmarks stay hidden until the story reaches them."
  },
  "landmarks": [
   "The Tribunal of Ten",
   "The Mothergem Sanctum",
   "The Empty Throne"
  ],
  "mood": "Wind over a stage after the audience has gone.",
  "canon": {
   "trait": "the far seat",
   "firstRace": "",
   "notes": "",
   "notable": "Oatheus, the Ultralord (missing)"
  },
  "spoiler": false
 }
];
(function(){
  var ART = window.AOV_ART; if (!ART) return;
  // register each environment's palettes as recolours: grass@yvoris, rock@yvoris, tree@yvoris-ice …
  window.AOV_ENV.forEach(function(e){
    var p = e.palette || {}, all = {};
    ['ground','path','liquid','wall','special'].forEach(function(k){ if (p[k]) for (var c in p[k]) all[c] = p[k][c]; });
    ['ground','path','liquid','wall','special'].forEach(function(k){ ART.recolour(e.id + '-' + k, Object.assign({}, all, p[k] || {})); });
    Object.keys(e.prop_palette || {}).forEach(function(k){ ART.recolour(e.id + '-' + k, e.prop_palette[k]); });
  });
})();
