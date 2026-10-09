// ★ 2026-10-06 · THE UNLOCK MANIFEST — the one file to edit when the site grows.
//
// Every world, game, guidebook and book on the portal is listed here with a
// status. The pages read this file and build themselves from it: the star map,
// the locked-world grid, the counters ("27 LOCKED · 1 UNLOCKED"), the doors on
// The Games / The Books, and the patch log on the home page.
//
// HOW TO UNLOCK SOMETHING
//   1. Find its entry below and set   status: 'unlocked'
//   2. Give it an   href   (the page it opens) and a   since   date (YYYY-MM-DD)
//   3. Optionally add a   blurb   (one or two lines shown in the unlock cutscene)
//   4. Add a line to the newest entry in   patches   (or start a new patch)
//   5. Bump   build   if the game build changed. Commit + push.
//
// Every returning visitor gets a full-screen "WORLD UNLOCKED" cutscene the next
// time they load any page, and the item wears a NEW! badge until they open it.
//
// status:  'unlocked'  open, clickable, on the map in colour
//          'soon'      announced, visible, not clickable yet ("COMING SOON")
//          'locked'    sealed — shown with a padlock
//
// Preview tricks (only change your own browser):
//   ?replay  replays the unlock cutscene for everything that is unlocked
//   ?newgame wipes your save file and starts from the title screen
window.AOV_UNLOCKS = {
  build: 'BETA V7.5.16',
  updated: '2026-10-06',

  items: [
    // ── THE WORLDS · the Aethryx Expanse, 28 worlds around Aenor ──────────
    { id:'world-origon',     kind:'world', no:1,  name:'Origon',     title:'The Origin World',         quadrant:'I',   status:'locked' },
    { id:'world-lumeria',    kind:'world', no:2,  name:'Lumeria',    title:'The Light World',          quadrant:'IV',  status:'locked' },
    { id:'world-draevos',    kind:'world', no:3,  name:'Draevos',    title:'The Dragon World',         quadrant:'III', status:'locked' },
    { id:'world-arborynth',  kind:'world', no:4,  name:'Arborynth',  title:'The Living World',         quadrant:'II',  status:'locked' },
    { id:'world-thallassar', kind:'world', no:5,  name:'Thallassar', title:'The Ocean World',          quadrant:'I',   status:'locked' },
    { id:'world-pyrauna',    kind:'world', no:6,  name:'Pyrauna',    title:'The Expansion World',      quadrant:'IV',  status:'locked' },
    { id:'world-quorauna',   kind:'world', no:7,  name:'Quorauna',   title:'The Compression World',    quadrant:'III', status:'locked' },
    { id:'world-cytherion',  kind:'world', no:8,  name:'Cytherion',  title:'The Grid World',           quadrant:'II',  status:'locked' },
    { id:'world-zyraxis',    kind:'world', no:9,  name:'Zyraxis',    title:'The Mothergem World',      quadrant:'I',   status:'unlocked',
      since:'2026-10-06', href:'/zyraxis.html', color:'#B87CFF', cta:'ENTER ZYRAXIS',
      blurb:'Planet 9 of the Aethryx Expanse. Ten Gemlords, ten Factionlands and a dome that will not hold forever.' },
    { id:'world-myraclese',  kind:'world', no:10, name:'Myraclese',  title:'The Dominion World',       quadrant:'IV',  status:'locked' },
    { id:'world-bellatora',  kind:'world', no:11, name:'Bellatora',  title:'The War World',            quadrant:'III', status:'locked' },
    { id:'world-yvoris',     kind:'world', no:12, name:'Yvoris',     title:'The Frozen World',         quadrant:'II',  status:'locked' },
    { id:'world-kyrathos',   kind:'world', no:13, name:'Kyrathos',   title:'The Truth World',          quadrant:'I',   status:'locked' },
    { id:'world-nexyros',    kind:'world', no:14, name:'Nexyros',    title:'The Humanoid Prime World', quadrant:'IV',  status:'locked' },
    { id:'world-jynaera',    kind:'world', no:15, name:'Jynaera',    title:'The Time World',           quadrant:'III', status:'locked' },
    { id:'world-sylvanir',   kind:'world', no:16, name:'Sylvanir',   title:'The Conscious World',      quadrant:'II',  status:'locked' },
    { id:'world-velkryn',    kind:'world', no:17, name:'Velkryn',    title:'The Consumption World',    quadrant:'I',   status:'locked' },
    { id:'world-ignara',     kind:'world', no:18, name:'Ignara',     title:'The Instability World',    quadrant:'IV',  status:'locked' },
    { id:'world-uralyx',     kind:'world', no:19, name:'Uralyx',     title:'The Perception World',     quadrant:'III', status:'locked' },
    { id:'world-halcyra',    kind:'world', no:20, name:'Halcyra',    title:'The Harmony World',        quadrant:'II',  status:'locked' },
    { id:'world-wyvera',     kind:'world', no:21, name:'Wyvera',     title:'The Ascension World',      quadrant:'I',   status:'locked' },
    { id:'world-rhyzor',     kind:'world', no:22, name:'Rhyzor',     title:'The Resonance World',      quadrant:'IV',  status:'locked' },
    { id:'world-elythera',   kind:'world', no:23, name:'Elythera',   title:'The Floating World',       quadrant:'III', status:'locked' },
    { id:'world-xylos',      kind:'world', no:24, name:'Xylos',      title:'The Crystal World',        quadrant:'II',  status:'locked' },
    { id:'world-gravaron',   kind:'world', no:25, name:'Gravaron',   title:'The Gravity World',        quadrant:'I',   status:'locked' },
    { id:'world-ferros',     kind:'world', no:26, name:'Ferros',     title:'The Machine World',        quadrant:'IV',  status:'locked' },
    { id:'world-viridia',    kind:'world', no:27, name:'Viridia',    title:'The Balance World',        quadrant:'III', status:'locked' },
    { id:'world-ovauron',    kind:'world', no:28, name:'Ovauron',    title:'The Drift World',          quadrant:'II',  status:'locked' },

    // ── THE GAMES ─────────────────────────────────────────────────────────
    { id:'game-rp7b', kind:'game', name:'RP7B', title:'Rizing Power · Beta V7.5.16', status:'unlocked',
      since:'2026-10-06', href:'/rp7b.html', color:'#FFC83D', cta:'PLAY NOW',
      blurb:'The mainline open-world beta of Rizing Power. Playable in your browser today.' },
    { id:'game-project1936', kind:'game', name:'Aethryx Adventures: 1936', title:'Mainline · 1936 · The Expedition of Carl Nasaro', status:'unlocked',
      since:'2026-10-07', href:'/explorer/', color:'#E2C27D', cta:'BEGIN THE EXPEDITION',
      blurb:'1936. You are Carl Nasaro, crash-landed on NASARUS with a ship too broken to reach home. Lead your Aethren through the worlds, beat the wardens, bring back every part, and make NASARUS home: scan its creatures into the AstraNav, battle them with your cards, meet its peoples. Collect the Expanse. Map the Expanse. Bring it home.' },
    { id:'game-rp7d', kind:'game', name:'RP7D', title:'Rizing Power · Deluxe 3D', status:'unlocked',
      since:'2026-10-08', href:'/play-rp7d/', color:'#3FA0FF', cta:'DEV PLAYTEST · PASSWORD',
      blurb:'The Deluxe 3D build of Rizing Power. A live dev playtest of Malezor, behind the dev password.' },

    // ── THE GUIDEBOOK ─────────────────────────────────────────────────────
    { id:'guide-macrobook', kind:'guide', name:'The Macro Book', title:'Official Guidebook · Volume 1', status:'unlocked',
      since:'2026-10-06', href:'/macrobook.html', color:'#8AB8FF', cta:'READ THE GUIDEBOOK',
      blurb:'Ten districts, ten Gemlords, the 21 types and the full effectiveness chart.' },

    // ── THE BOOKS ─────────────────────────────────────────────────────────
    { id:'book-viridia', kind:'book', name:'The Book of Viridia', title:'Series · In Print', status:'soon',
      blurb:'The Book of Viridia series is on the way.' },
    { id:'book-more',    kind:'book', name:'More in Print', title:'And Much More', status:'soon',
      blurb:'Much more of the saga is headed to print.' }
  ],

  // ── PATCH NOTES · newest first. Shown on the home page and in the Journal.
  patches: [
    { date:'2026-10-09', build:'AETHRYX ADVENTURES: 1936 · SURVEY 9.2', title:'Cloning at NASARUS',
      notes:[
        'A scan is only a profile. To fight beside you, an Aethren must be cloned from its card at NASARUS',
        'Bring profiles home, then clone them at the Research Station (COMPANIONS · Profiles ready to clone)',
        'Profiles still in your pack are lost if you die out there. Companions you already had are kept',
        'The live map is now the LIVE SCANNER on the SYSTEM home panel. It shows whatever world you are on, in real time'
      ] },
    { date:'2026-10-09', build:'AETHRYX ADVENTURES: 1936 · SURVEY 9.1', title:'The AstraNav, Rebuilt',
      notes:[
        'Seven sections: System, Headquarters, Navigation, Companions, Research, Journal and Setup',
        'SYSTEM is a home panel: your status, the field sketch, and a widget for every section',
        'HEADQUARTERS opens on a live digital map of NASARUS: facilities, ruins, residents, settled Aethren and you',
        'COMPANIONS holds every Aethren you have cloned. RESEARCH holds everything else, and what you carry only counts once it is redeemed at NASARUS',
        'JOURNAL tracks your missions, with a checklist for every world you have reached'
      ] },
    { date:'2026-10-09', build:'AETHRYX ADVENTURES: 1936 · SURVEY 9', title:'The Way Home',
      notes:[
        'Your ship is too damaged to reach hyperspace. Every world holds a sealed vault with one of its 27 parts: rebuild it to perfection, and the way home opens',
        'Find each world\u2019s clue from its people or its records, beat the warden or guardian at the vault, and get the part home to NASARUS alive',
        'Haemen wardens hunt you as the alien. Their Aethren come in a chain of three, and your team is your only weapon',
        'Allied peoples patch your suit and rest your team. Your lead card gives a field perk: build the right team',
        'Rescue refugees from war regions and settle Aethren species at a new Sanctuary. NASARUS becomes home',
        'Die out there and the suit\u2019s AI flies you home to the base, but the pack stays where you fell'
      ] },
    { date:'2026-10-09', build:'AETHRYX ADVENTURES: 1936 · SURVEY 8.3', title:'Only NASARUS Holds Oxygen',
      notes:[
        'AIR now refills only at NASARUS: rest at camp, land at the base, or board the ship there. The ship carries no oxygen of its own',
        'Sprinting burns air more than twice as fast as walking',
        'Run out of air on an expedition and you do not come back: the pack is lost, and the record picks up again at NASARUS',
        'Fit bigger tanks at the Workshop: AIR TANK MK II (150) and MK III (220)'
      ] },
    { date:'2026-10-09', build:'AETHRYX ADVENTURES: 1936 · SURVEY 8.2', title:'Stalk, Steady, Sprint',
      notes:[
        'Circle (or B) now cycles three gaits: STALK, STEADY and SPRINT',
        'Each gait moves and animates differently: a low, careful crouch; an ordinary walk; a fast, leaning run that kicks up dust',
        'Sprinting is loud: skittish creatures hear you from twice as far away'
      ] },
    { date:'2026-10-09', build:'AETHRYX ADVENTURES: 1936 · SURVEY 8.1', title:'The Official Aethren Roster',
      notes:[
        'The wild Aethren of Zyraxis are now exactly the Creator\u2019s official roster, with official spellings',
        'Gravemourne and Sigilmore take their official spellings, and dozens of newly named Aethren join the wild',
        'People and named characters no longer appear as wild Aethren; cards you already hold stay in your collection'
      ] },
    { date:'2026-10-09', build:'AETHRYX ADVENTURES: 1936 · SURVEY 8', title:'NASARUS, the Headquarters World',
      notes:[
        'The game is now Aethryx Adventures: 1936, and the Living Master Codex is its record of everything you find',
        'Hyperspace ends in a crash landing on NASARUS, an ancient drifting world of ruins. Name it, make camp beside the wreck, repair the drive and get the AstraNav back online',
        'Explore, extract, return, catalog, develop: bring scrap, crystal, fibre, relics and data home from every world',
        'Build the headquarters one facility at a time, from a camp shelter to a research station, workshop, card archive and restoration terminal',
        'Survey and restore the ruins of NASARUS, clear the rockfall to the far basin, and raise the headquarters through its stages',
        'The AstraNav star chart now matches RP7D\u2019s telescope view'
      ] },
    { date:'2026-10-08', build:'RP7D · FIELD TEST 02', title:'RP7D Opens for Dev Playtest',
      notes:[
        'The Deluxe 3D build of Rizing Power is live on the site behind the dev password: Malezor, District I',
        'A new intro movie plays while Malezor loads; hold X or \u2715 to skip to the title'
      ] },
    { date:'2026-10-07', build:'LIVING MASTER CODEX · SURVEY 7', title:'The AstraNav and the Open Expanse',
      notes:[
        'A classic handheld opening: name yourself, choose a man or a woman, fit your kit, and play the role of Nasaro',
        'The AstraNav, 1936 American tech issued on the first mission, is now the whole interface: star map, cards, Codex, log and setup',
        'Wake after hyperspace with all 28 bodies in view through the telescope, a natural spiral, and choose your first landing',
        'Open worlds on every planet, Zyraxis as one seamless map of all ten districts, and travel from world to world',
        'Scan Aethren into the AstraNav, battle them with your cards on the canon type chart, and meet each world\u2019s people to learn its lore',
        'Full DualSense support with rumble, and built for landscape on phones'
      ] },
    { date:'2026-10-07', build:'LIVING MASTER CODEX · SURVEY 5', title:'The World Atlas',
      notes:[
        'Every one of the 28 worlds and the ten Zyraxis districts now has a designed environment, drawn from the Codex',
        'Each world has its own terrain, palette, hazard, signature mechanic and canon landmarks; preview them all in the new World Atlas',
        'Carl\u2019s 1936 telescope now records what he can see of every unidentified body on the map board'
      ] },
    { date:'2026-10-07', build:'LIVING MASTER CODEX · SURVEY 4', title:'Pocket Edition',
      notes:[
        'Every sprite in the Living Master Codex is now native pixel art, drawn crisp at true pocket resolution',
        'Carl Nasaro, the Malezor Haemen, the four Zyrex, the rocket and every tile can be redrawn in the new Art Studio'
      ] },
    { date:'2026-10-07', build:'LIVING MASTER CODEX · SURVEY 3', title:'Carl Nasaro',
      notes:[
        'Project 1936 is now THE LIVING MASTER CODEX: the playable, ever-expanding Master Codex of the saga',
        'You are Carl Nasaro, the first Earth astronaut to reach the Aethryx Expanse, in 1936',
        'Three objectives: Collect the Expanse. Map the Expanse. Bring it home.'
      ] },
    { date:'2026-10-07', build:'PROJECT 1936 · SURVEY 2', title:'The First Map',
      notes:[
        'Project 1936 opens on a map board of the whole system: every world unidentified until you reach it',
        'Classic top-down exploration of Malezor: examine plants and minerals, meet a local Haemen, enter The First Den',
        'Two goals: collect cards to bring home to Earth, and draw the first map of a newly discovered star system'
      ] },
    { date:'2026-10-07', build:'PROJECT 1936 · SURVEY 1', title:'A Rocket Off Course',
      notes:[
        'GAME UNLOCKED · Project 1936, the first playable survey of the new AOV card-explorer game',
        'Land on the Malezor district of Zyraxis, photograph its Aethren, and develop your film into cards',
        'Hamburger menu restyled in the dark-cosmic theme'
      ] },
    { date:'2026-10-06', build:'BETA V7.5.16', title:'The Portal Becomes a Game',
      notes:[
        'The site is now playable: earn XP, level up, discover zones and find the hidden Mothergem Shards',
        'New star map on The Worlds — every world unlocks here as the saga grows',
        'Journal, quests and achievements (press J)'
      ] },
    { date:'2026-10-06', build:'BETA V7.5.16', title:'Zyraxis Opens',
      notes:[
        'WORLD UNLOCKED · Zyraxis, the Mothergem World',
        'GAME UNLOCKED · RP7B, Rizing Power Beta V7.5.16',
        'GUIDEBOOK UNLOCKED · The Macro Book, Volume 1',
        'ANNOUNCED · RP7D Deluxe 3D and The Book of Viridia series'
      ] }
  ]
};
