// ★ 2026-10-07 · PROJECT 1936 (working title) · CONTENT FILE
//
// Everything the astronaut can learn, visit or collect. Edit this file to change
// names, notes, maps or canon without touching the game code.
//
// CANON SOURCES
//   World order, the four spires, the 7 rings, AEP-28's drift orbit:
//     AETHRYX_EXPANSE_SCHEMATIC.png · aethryx.html
//   The 30 card sets, Aenor = the sun, Zoryth = the moon, Aethren / Haemen:
//     docs/card-explorer/00_CREATOR_HANDOFF.md
//   Zyraxis districts (canon order I → X): zyraxis.html / RIZING_POWERS_UX_HANDOFF.md
//   Creatures: game_roster/roster.json (tier → rarity, types, district)
//
// `journal` lines are the astronaut's own 1936 field notes: what a person from
// Earth would write before knowing anything. They are not canon claims.
// Anything marked  canon:null  is waiting on the Creator: its card keeps the
// astronaut's 1936 description until a canon name is supplied here.
window.EXP_DATA = {

  // ── THE STORY · locked canon: docs/card-explorer/02_CARL_NASARO_LIVING_MASTER_CODEX_CANON.md
  //   The player is Carl Nasaro. The game is the Living Master Codex.
  //   Primary narrative 1936–1945; the coda runs to 1955 and Mutagenesis.
  story: {
    title: 'THE LIVING MASTER CODEX',
    hero: 'CARL NASARO',
    year: 1936,
    goals: [
      ['COLLECT THE EXPANSE', 'Every discovery manifests as a card for the voyage home.'],
      ['MAP THE EXPANSE',     'Humanity\u2019s first map of the Aethryx Expanse.'],
      ['BRING IT HOME',       'Earth\u2019s position: unknown. None of my charts can place it.']
    ],
    // Chapter titles stay hidden in-game until reached, so the story is not spoiled.
    chapters: [
      { era:'1936', title:'Discovery', note:'Carl Nasaro crash-lands on NASARUS.', open:true },
      { era:'1936–1945', title:'The Expedition', note:'' },
      { era:'1945', title:'Contact', note:'' },
      { era:'1945–1955', title:'Coda', note:'' }
    ],
    rule: 'The AOV\u2122 Saga establishes canon. The Living Master Codex allows players to discover it.'
  },

  // ── THE EXPANSE · 28 worlds on four spires around Aenor ──────────────────
  //   spire: which arm of the schematic the world sits on (n mod 4)
  //   ring:  1 (nearest Aenor) … 7 (outermost)
  //   playable: has explorable districts in this build
  //   hidden: not drawn on the chart yet
  worlds: [
    { no:1,  name:'ORIGON',     title:'The Origin World',         color:'#3a3046' },
    { no:2,  name:'LUMERIA',    title:'The Light World',          color:'#efe2b8' },
    { no:3,  name:'DRAEVOS',    title:'The Dragon World',         color:'#8a2f4c' },
    { no:4,  name:'ARBORYNTH',  title:'The Living World',         color:'#3e7d42' },
    { no:5,  name:'THALLASSAR', title:'The Ocean World',          color:'#22457c' },
    { no:6,  name:'PYRAUNA',    title:'The Expansion World',      color:'#c45a3a' },
    { no:7,  name:'QUORAUNA',   title:'The Compression World',    color:'#707070' },
    { no:8,  name:'CYTHERION',  title:'The Grid World',           color:'#24304a' },
    { no:9,  name:'ZYRAXIS',    title:'The Mothergem World',      color:'#7d4bb0', ringed:true, playable:true },
    { no:10, name:'MYRACLESE',  title:'The Dominion World',       color:'#b0904a' },
    { no:11, name:'BELLATORA',  title:'The War World',            color:'#7a2424' },
    { no:12, name:'YVORIS',     title:'The Frozen World',         color:'#b8d4e0' },
    { no:13, name:'KYRATHOS',   title:'The Truth World',          color:'#32283c' },
    { no:14, name:'NEXYROS',    title:'The Humanoid Prime World', color:'#76705f' },
    { no:15, name:'JYNAERA',    title:'The Time World',           color:'#9b3fa8' },
    { no:16, name:'SYLVANIR',   title:'The Conscious World',      color:'#25613d' },
    { no:17, name:'VELKRYN',    title:'The Consumption World',    color:'#5e1c24' },
    { no:18, name:'IGNARA',     title:'The Instability World',    color:'#d8642a' },
    { no:19, name:'URALYX',     title:'The Perception World',     color:'#7a6aa8' },
    { no:20, name:'HALCYRA',    title:'The Harmony World',        color:'#2a8a96' },
    { no:21, name:'WYVERA',     title:'The Ascension World',      color:'#4a8fd0' },
    { no:22, name:'RHYZOR',     title:'The Resonance World',      color:'#6c80a0' },
    { no:23, name:'ELYTHERA',   title:'The Floating World',       color:'#2f7a6a' },
    { no:24, name:'XYLOS',      title:'The Crystal World',        color:'#dfe6ee' },
    { no:25, name:'GRAVARON',   title:'The Gravity World',        color:'#2e2540' },
    { no:26, name:'FERROS',     title:'The Machine World',        color:'#6b5040' },
    { no:27, name:'VIRIDIA',    title:'The Balance World',        color:'#3f8f5f', ringed:true },
    { no:28, name:'AEP-28',     title:'The Drift World',          color:'#8a52b0', hidden:true }
  ],

  // Where the astronaut came out of hyperspace, in chart units (Aenor = 500,500),
  // and how far the crippled drive reaches.
  arrival: { x:585, y:296, range:150 },

  // ── ZYRAXIS · the ten districts in canon order ───────────────────────────
  districts: {
    9: [
      { id:'malezor',   map:'malezor' },
      { id:'zarvane' }, { id:'andrannor' }, { id:'veridan' }, { id:'netharion' },
      { id:'vorashil' }, { id:'xilnar' }, { id:'baelgor' }, { id:'thardin' }, { id:'korathen' }
    ]
  },

  // ── LEXICON · every term the astronaut can learn ─────────────────────────
  //   unknown: how the 1936 records describe it before it is learned
  //   canon:   the true name (null = awaiting the Creator)
  //   World names are added automatically from `worlds` above.
  lexicon: {
    aenor:      { unknown:'PRIMARY RADIANT BODY',           canon:'AENOR' },
    zoryth:     { unknown:'SATELLITE BODY, UNIDENTIFIED',   canon:'ZORYTH' },
    expanse:    { unknown:'UNCHARTED REGION',               canon:'THE AETHRYX EXPANSE' },
    aethren:    { unknown:'UNCLASSIFIED FAUNA',             canon:'AETHREN' },
    haemen:     { unknown:'HUMANOID INHABITANT',            canon:'HAEMEN' },
    astralite:  { unknown:'UNKNOWN CRYSTALLINE SPECIMEN',   canon:'ASTRALITE' },
    malezor:    { unknown:'SURVEY ZONE ONE',                canon:'MALEZOR' },
    zarvane:    { unknown:'UNSURVEYED REGION',              canon:'ZARVANE' },
    andrannor:  { unknown:'UNSURVEYED REGION',              canon:'ANDRANNOR' },
    veridan:    { unknown:'UNSURVEYED REGION',              canon:'VERIDAN' },
    netharion:  { unknown:'UNSURVEYED REGION',              canon:'NETHARION' },
    vorashil:   { unknown:'UNSURVEYED REGION',              canon:'VORASHIL' },
    xilnar:     { unknown:'UNSURVEYED REGION',              canon:'XILNAR' },
    baelgor:    { unknown:'UNSURVEYED REGION',              canon:'BAELGOR' },
    thardin:    { unknown:'UNSURVEYED REGION',              canon:'THARDIN' },
    korathen:   { unknown:'UNSURVEYED REGION',              canon:'KORATHEN' },
    firstden:   { unknown:'STONE CAVE',                     canon:'THE FIRST DEN' },
    otterlin:   { unknown:'OTTER-LIKE QUADRUPED',           canon:'OTTERLIN' },
    verdanix:   { unknown:'AMPHIBIAN, CLOAKED',             canon:'VERDANIX' },
    aetherwing: { unknown:'WINGED INSECT, LUMINOUS',        canon:'AETHERWING' },
    volcanut:   { unknown:'SPINED QUADRUPED, HOT-BODIED',   canon:'VOLCANUT' },
    // awaiting canon: the cards keep these descriptions until a name is supplied
    shrub:      { unknown:'METALLIC-LEAFED SHRUB',          canon:null },
    fruittree:  { unknown:'VIOLET-FRUITED TREE',            canon:null },
    furtrader:  { unknown:'INHABITANT, FUR-CLAD',           canon:null }
  },

  // What Haemen contact teaches, and what the den's carved markings teach.
  teaches: {
    haemen:   ['zyraxis', 'malezor', 'haemen', 'aethren'],
    markings: ['expanse', 'aenor', 'zoryth', 'astralite', 'firstden', 'otterlin', 'verdanix', 'aetherwing', 'volcanut',
               'zarvane', 'andrannor', 'veridan', 'netharion', 'vorashil', 'xilnar', 'baelgor', 'thardin', 'korathen']
  },

  // ── SUBJECTS · everything that can become a card ────────────────────────
  //   tier: canon tier → RARITY n/10. null = no canon tier yet (card shows UNRATED)
  subjects: {
    otterlin: {
      kind:'aethren', art:'otterlin_down', set:9, term:'otterlin', district:'malezor', tier:1, types:'Beast / Aquatic', temperament:'curious',
      canonNote:'Water pup. Common Eastern house pet.',
      journal:'Sleek, dark-furred, the size of a terrier. Swims well. Came close enough to sniff my boot. Not afraid of men, or has never seen one.'
    },
    verdanix: {
      kind:'aethren', art:'verdanix_down', set:9, term:'verdanix', district:'malezor', tier:1, types:'Beast / Verdant', temperament:'skittish',
      canonNote:'Common Eastern green frog.',
      journal:'Amphibian, upright, wearing what I can only call a cloak of leaves. Carries a stick. Flees at the first heavy footstep. Approach low and slow.'
    },
    aetherwing: {
      kind:'aethren', art:'aetherwing', set:9, term:'aetherwing', district:'malezor', tier:1, types:'Beast / Radiant', temperament:'flighty',
      canonNote:'Astral dragonfly.',
      journal:'An insect the length of my forearm. The wings give off their own light. Never holds still. Wait for it to hover, then shoot.'
    },
    volcanut: {
      kind:'aethren', art:'volcanut_down', set:9, term:'volcanut', district:'malezor', tier:1, types:'Beast / Aura', temperament:'territorial',
      canonNote:'',
      journal:'Spined, heavy, glowing like a stove. The air shimmers above its back. It defends its ground. Scan quickly and back away.'
    },
    furtrader: {
      kind:'haemen', art:'haemen_down', set:9, term:'furtrader', district:'malezor', tier:null, types:'Haemen',
      species:null,
      canonNote:'',
      journal:'A man in furs and a heavy cap, bearded, broad. Carries a knife but never reached for it. Watched my AstraNav more than he watched me.'
    },
    astralite: {
      kind:'mineral', art:'astralite', set:9, term:'astralite', district:'malezor', tier:null, types:'Mineral',
      canonNote:'',
      journal:'Crystalline mass, blue-violet, warm to the glove. The wireless crackles when I hold it near. Not quartz. Not any mineral I know.'
    },
    shrub: {
      kind:'plant', art:'shrub', set:9, term:'shrub', district:'malezor', tier:null, types:'Botanical',
      canonNote:'',
      journal:'The leaves appear metallic, yet bend easily beneath pressure. Blue seed-pods like glass beads.'
    },
    fruittree: {
      kind:'plant', art:'tree', set:9, term:'fruittree', district:'malezor', tier:null, types:'Botanical',
      canonNote:'',
      journal:'Broad-leafed hardwood heavy with violet fruit. The Otter-like creatures gather beneath it. I have not tasted the fruit. Yet.'
    },
    firstden: {
      kind:'location', art:'markings', set:9, term:'firstden', district:'malezor', tier:null, types:'Location',
      canonNote:'',
      journal:'A cave of fitted stones, worn smooth, scattered with prints. Something has used this place for a very long time.'
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
  },

  // ── MAPS · classic top-down tile maps ───────────────────────────────────
  //   . grass   , flowers   ~ water   d stone path   T tree (examinable)   b shrub (examinable)
  //   B boulder   A astralite   S ship (3 wide, 2 tall, anchored here)   E cave mouth
  //   H Haemen   M carved markings   * hidden find   X route sign   # rock wall   x cave exit
  //   Creatures start on:  O otterlin  V verdanix  W aetherwing  C volcanut
  maps: {
    malezor: {
      district:'malezor', ground:'grass',
      rows: [
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
        'T....,.....T.......B....TTTTTT',
        'T..b....A..T..W.....,...TB#E#T',
        'T.......,..T.........b..T#ddd#',
        'T..TT.......,....T......T#ddd#',
        'T..TT...b.......TT...d..dddddT',
        'T........,......T....d..ddd.bT',
        'T.,....W.........dddddddd....T',
        'T........dddddddd.......,....T',
        'T...b....d....,.....C.....A..T',
        'TT.......d..........,...B....T',
        'T........d.....b.............X',
        'T....S...dd...........~~~~...d',
        'T.........d..,.......~~~~~~..d',
        'T.....H...d.........~~~~~~~~.T',
        'T..b......d....V....~~~O~~~~.T',
        'T.,.......d.........~~~~~~~~.T',
        'T...*.....d..........~~~~~~..T',
        'T....T....dddddddd....~~~~.V.T',
        'T...TTT.........,d...........T',
        'T....T...b.......d...O...b...T',
        'T..........A.....d......,....T',
        'T....,...........d...T.......T',
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
      ],
      warps: { E:{ to:'firstden', x:5, y:7, dir:'up' } },
      sign: 'ROUTE EAST · the ground falls away into ash and haze. Uncharted. A future expedition.',
      haemen: 'furtrader'
    },
    firstden: {
      district:'malezor', ground:'den', indoor:true, location:'firstden',
      rows: [
        '###########',
        '#ddddMdddd#',
        '#d#ddddd#d#',
        '#dddddddd*#',
        '#dd#ddd#dd#',
        '#ddddddddd#',
        '#dddddddd##',
        '####dxd####'
      ],
      warps: { x:{ to:'malezor', x:27, y:3, dir:'down' } }
    }
  }
};
