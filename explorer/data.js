// ★ 2026-10-07 · PROJECT 1936 (working title) · CONTENT FILE
//
// Everything the astronaut can learn or collect in this build. Edit this file
// to change names, notes or canon without touching the game code.
//
// CANON SOURCES
//   Creatures: game_roster/roster.json (tier → rarity, types, district).
//   Worlds, Aenor = the sun, Zoryth = the moon: docs/card-explorer/00_CREATOR_HANDOFF.md
//   The First Den: assets/2D sprites/tiles/landmarks/malezor/the-first-den.png
//
// `journal` lines are the astronaut's own 1936 field notes: what a person from
// Earth would write before knowing anything. They are not canon claims.
// `canonNote` holds canon text taken from the roster, or stays empty.
window.EXP_DATA = {

  // ── LEXICON · every Aethryx term the astronaut can learn ─────────────────
  //   unknown: how the 1936 records describe it before it is learned
  //   canon:   the true name, typed in once learned
  lexicon: {
    zyraxis:    { unknown:'CRYSTALLINE BODY, VIOLET CAST',  canon:'ZYRAXIS' },
    malezor:    { unknown:'SURVEY ZONE ONE',                canon:'MALEZOR' },
    aethren:    { unknown:'UNCLASSIFIED FAUNA',             canon:'AETHREN' },
    astralite:  { unknown:'UNKNOWN CRYSTALLINE SPECIMEN',   canon:'ASTRALITE' },
    aenor:      { unknown:'PRIMARY RADIANT BODY',           canon:'AENOR' },
    zoryth:     { unknown:'SATELLITE BODY, UNIDENTIFIED',   canon:'ZORYTH' },
    firstden:   { unknown:'STONE CLEARING',                 canon:'THE FIRST DEN' },
    otterlin:   { unknown:'OTTER-LIKE QUADRUPED',           canon:'OTTERLIN' },
    verdanix:   { unknown:'AMPHIBIAN, CLOAKED',             canon:'VERDANIX' },
    aetherwing: { unknown:'WINGED INSECT, LUMINOUS',        canon:'AETHERWING' },
    volcanut:   { unknown:'SPINED QUADRUPED, HOT-BODIED',   canon:'VOLCANUT' },
    expanse:    { unknown:'UNCHARTED REGION',               canon:'THE AETHRYX EXPANSE' }
  },

  // ── CARD SETS used in this build (of the 30 master sets) ─────────────────
  sets: {
    9:  { term:'zyraxis' },
    29: { term:'aenor' },
    30: { term:'zoryth' }
  },

  // ── SUBJECTS · everything that can be documented ─────────────────────────
  //   tier: canon tier → card RARITY n/10. null = no canon tier yet (card shows UNRATED)
  subjects: {
    otterlin: {
      kind:'aethren', set:9, term:'otterlin', district:'malezor', tier:1, types:'Beast / Aquatic',
      sprite:'otterlin.png', temperament:'curious',
      canonNote:'Water pup. Common Eastern house pet.',
      journal:'Sleek, dark-furred, the size of a terrier. Swims well. Came close enough to sniff my boot. Not afraid of men, or has never seen one.'
    },
    verdanix: {
      kind:'aethren', set:9, term:'verdanix', district:'malezor', tier:1, types:'Beast / Verdant',
      sprite:'verdanix.png', temperament:'skittish',
      canonNote:'Common Eastern green frog.',
      journal:'Amphibian, upright, wearing what I can only call a cloak of leaves. Carries a stick. Flees at the first heavy footstep. Approach low and slow.'
    },
    aetherwing: {
      kind:'aethren', set:9, term:'aetherwing', district:'malezor', tier:1, types:'Beast / Radiant',
      sprite:'aetherwing.png', temperament:'flighty',
      canonNote:'Astral dragonfly.',
      journal:'An insect the length of my forearm. The wings give off their own light. Never holds still. A fast shutter and a steady hand.'
    },
    volcanut: {
      kind:'aethren', set:9, term:'volcanut', district:'malezor', tier:1, types:'Beast / Aura',
      sprite:'volcanut.png', temperament:'territorial',
      canonNote:'',
      journal:'Spined, heavy, glowing like a stove. The air shimmers above its back. It defends its ground. Do NOT close inside three yards.'
    },
    astralite: {
      kind:'astralite', set:9, term:'astralite', district:'malezor', tier:null, types:'Mineral',
      sprite:'astralite.png',
      canonNote:'',
      journal:'Crystalline mass, blue-violet, warm to the glove. The wireless crackles when I hold it near. Not quartz. Not any mineral I know.'
    },
    firstden: {
      kind:'location', set:9, term:'firstden', district:'malezor', tier:null, types:'Location',
      canonNote:'',
      journal:'A clearing of fitted stones, worn smooth, scattered with prints. Something has used this place for a very long time.'
    },
    aenor: {
      kind:'celestial', set:29, term:'aenor', tier:null, types:'Celestial Body · Star',
      canonNote:'The sun of the Aethryx Expanse.',
      journal:'A star, but not the Sun. Whiter. The spectroscope shows lines I cannot name.'
    },
    zoryth: {
      kind:'celestial', set:30, term:'zoryth', tier:null, types:'Celestial Body · Moon',
      canonNote:'The moon of the Aethryx Expanse.',
      journal:'A pale satellite. Its face is not our Moon’s face. No Mare Tranquillitatis. No Copernicus.'
    }
  }
};
