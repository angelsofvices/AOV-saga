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
      blurb:'1936. You are Carl Nasaro, crash-landed on NASARUS with a ship too broken to reach home. Lead your Aethren through the worlds, beat the wardens, bring back every part, and make NASARUS home: scan its Aethren, clone them at NASARUS, lead them into battle as your party, meet its peoples. Collect the Expanse. Map the Expanse. Bring it home.' },
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
                { date:'2026-10-11', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10.24', title:'All 27 planetary utilities work',
      notes:[
        'Every planet’s utility now has an ability, in simple form. Art and sound come in a later pass',
        'Shields, decoys, freezes, grapples, vines, a return beacon and a bio scanner are all usable',
        'Cave-only and field-only limits are shown when a utility cannot act where you stand',
        'Breaking, melting and harvesting changes last until the field reloads'
      ] },
{ date:'2026-10-11', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10.23', title:'The planetary utilities',
      notes:[
        'Each planet holds a signature utility. Twenty-seven are registered and show in the UTILITY tab',
        'Life Seed, AstraBlaster MK1, Jetpack, Boomfists and Star Satellite are built. The other 22 can be equipped, but their abilities are not written yet',
        'Triangle cycles the equipped utilities. Square uses the active one, and each utility keeps its own cooldown',
        'Boomfists breaks rock, not mountains. Star Satellite needs open sky, so it does not fire in a cave'
      ] },
{ date:'2026-10-11', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10.22', title:'The jetpack and the new controls',
      notes:[
        'The JETPACK is a second utility. Assemble it at the Workstation, then equip it from the Inventory',
        'Triangle cycles your equipped utilities. Square uses the active one: it fires the ASTRABLASTER, or flies the JETPACK while held',
        'Hold Square to fly. Let go and Carl settles back down, and lands on open ground',
        'The JETPACK clears plants, stones and props. Walls, structures and people still stop you',
        'X interacts. Hold X to lift an object, and tap it to set it down. Circle cycles crouch, walk and run',
        'In caves, Up jumps and holding Square flies. Energy and flight duration are not yet decided'
      ] },
{ date:'2026-10-11', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10.21', title:'The AstraBlaster MK1',
      notes:[
        'The MK1 was left at the crash site. It starts broken: repair it at the Workstation from NASARUS materials',
        'Equip it from the Inventory’s WEAPON tab. Square fires it in the direction you face; bare-handed, Square still moves objects',
        'Unlimited rounds: each shot draws on a charge meter that recharges by itself',
        'In caves, Circle fires it left or right. There are no fists in AA:1936',
        'Upgrades and cloned short, medium and long range variants are not built yet'
      ] },
    { date:'2026-10-11', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10.20', title:'Caves and Immortal Zones',
      notes:[
        'Every planet from 1 to 27 has a cave mouth on the edge of its rock',
        'A cave is a side-scrolling level: left and right, jump, attack, and a far door',
        'The far door opens onto the planet’s IMMORTAL ZONE: a secret region with its deity, rare Aethren and rare caches',
        'Once found, a planet’s Immortal Zone stays open from its cave mouth. Caves stay replayable',
        'Deity encounters are recorded for the Creator; their canon is not yet written'
      ] },
    { date:'2026-10-10', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10.19', title:'The field survives the AstraNav',
      notes:[
        'Opening the AstraNav no longer resets the overworld or a fight: enemies, your party and their damage carry on when you return'
      ] },
    { date:'2026-10-10', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10.18', title:'The party fights',
      notes:[
        'Your party walks with you: it follows your trail, hurries to catch up, and idles around you when you stop',
        'You bring up to nine. Every other clone lives on NASARUS: working at the machines, keeping each other company, resting, and gathering materials while you are away',
        'No more card battles. Your Aethren fight on the field, on their own: strikes, bolts, hit flashes, damage numbers, HP bars',
        'Enemies from canon: Mori, Daemon, Seer Grunts, Nova Guardians and the Penumbra',
        'Wardens, vault guardians and charging Aethren are met live too, and calmed, not killed'
      ] },
    { date:'2026-10-10', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10.17', title:'Ship levels',
      notes:[
        'The ship has five levels. Level 1 is built on NASARUS before the first take-off; level 5 reaches hyperspace',
        'Each level widens the reach (7, 14, 21, then every world) and the tank (25%, 50%, 75%, 100%, 125%). Each gate asks more than the last',
        'Build ship levels at the Rocketship Repair Station; out-of-reach worlds name the level they need',
        'New AstraNav tab: UPGRADES. Meters for the ship and for your pilot level (more AIR, less suit damage as you level)',
        'COMPANIONS · UPGRADES: train your Aethren. The ship’s level sets how far they can grow'
      ] },
    { date:'2026-10-10', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10.16', title:'Refuel the rocket',
      notes:[
        'The rocket has a fuel tank. At the rocket (or in the cockpit), REFUEL: 1 OIL fills 20%, or FILL UP',
        'Every course burns tank fuel; the star map shows what a course costs against the tank',
        'The rocket tells you exactly what still blocks departure: the drive, the Navigation Center, or which of the five machines is missing'
      ] },
    { date:'2026-10-10', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10.15', title:'Developer tools',
      notes:[
        'For playtesting only: a developer machine, switched on in SETUP once the Developer Room is unlocked. Players never see it'
      ] },
    { date:'2026-10-10', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10.14', title:'Aethren where they belong',
      notes:[
        'Every body plan lives in the environments that suit it: fish in water, drakes in heat and sky, owls in the canopy and the ruins',
        'Every world from 1 to 27 has Aethren that fit its habitats; worlds 7, 13, 18 and 21 have their own now',
        '51 new habitats named from each world’s canon biomes: 89 habitats, 1,919 Aethren variants that live where they fit',
        'Zyraxis holds the most of all: 405 kinds across its districts',
        'AEP-28 stays sealed'
      ] },
    { date:'2026-10-10', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10.13', title:'42 body plans, 1,638 Aethren variants',
      notes:[
        '26 new native body plans: stag, hound, feline, bear, ape, hopper, frog, ray, eel, jellyfish, urchin, snail, wasp, dragonfly, owl, wading bird, drake, turtle, scorpion, spider, mantis, worm, wisp, drone, mushroom, hydra',
        '42 body plans across 39 habitats: 1,638 variants, every one drawn differently',
        'Body patterns inside the outline: spots, stripes, bands, speckle, mottle, belly',
        'A second feature on every variant, including new ones that follow the body: spikes, mane, tendrils, aura, tusks, plates, halo, whiskers',
        'Beetles, golems and avians now take their habitat’s colours too'
      ] },
    { date:'2026-10-10', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10.12', title:'624 Aethren variants, on the card',
      notes:[
        '16 native body plans across 39 habitats: 624 Aethren variants live on 24 worlds',
        'A variant’s card records its habitat, body plan, feature, tier, source body and colours'
      ] },
    { date:'2026-10-10', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10.11', title:'AstraNav, and the composite gems',
      notes:[
        'One spelling everywhere: the AstraNav',
        'Thardin’s Haemen carry the World Gem (red, blue, yellow, green); Korathen’s carry the Space Gem (white, orange, purple, black)',
        'Composite gem badges are drawn quartered in their four colours'
      ] },
    { date:'2026-10-10', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10.10', title:'Tightened up',
      notes:[
        'On touch screens the NAV button is the touchpad; the cockpit has one too',
        'INVENTORY is the one full item list; the System screen shows a glance, Research keeps its records',
        'Stations split cleanly: the Workstation builds machines and tools, the Workshop fits suit and air gear, the Repair Station works on the ship',
        'A names what it will do (OPEN, TALK, TAKE, BOARD…), with a prompt above the buttons; □ dims when nothing can be moved',
        'One message at a time',
        'The HEADQUARTERS page reads in tabs',
        'The next objective points the way: how many paces, and which direction. The live scanner marks the machine papers',
        'SETUP · RESET MOVED OBJECTS puts every moved object and station back'
      ] },
    { date:'2026-10-10', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10.9', title:'Stations, the cockpit and the inventory',
      notes:[
        'A new AstraNav tab: INVENTORY. All items, bag, stores, ship parts and machine papers, each with its icon',
        'Simpler crafting: craft the WORKSTATION from materials in INVENTORY · CRAFT, then build every other machine at the Workstation',
        'Machines stand on NASARUS as stations: Workstation, Material Processor, Fuel Generator, Rocketship Repair Station, AstraNav Terminal',
        'Every structure and machine has its own screen: walk up to it and press A',
        'The rocket has its own screen: FLY it, or read the STAR MAP. Aboard, the cockpit is your console',
        'The AstraNav opens only from the touchpad'
      ] },
    { date:'2026-10-10', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10.8', title:'Chapters, papers and the sandbox',
      notes:[
        'The Journal reads in chapters: MISSION, THE STORY, three logs of objectives, and EXPEDITIONS',
        'Long AstraNav panels are clickable tabs: Research, the Living Master Codex and Companions',
        'The five NASARUS machine papers are real sheets of paper lying on the ground, spread across the base. Walk over one to pick it up',
        'GRAB, DRAG, SET: face a prop, plant, stone or station and press □ to lift it, □ again to set it, ○ to put it back',
        'Everything you move stays where you put it'
      ] },
    { date:'2026-10-10', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10.7', title:'The suit',
      notes:[
        'A standard space-suit helmet for your pilot portrait: glass dome, collar ring and spec lights',
        'A fully customizable suit: any colour for suit, trim and boots, helmet, visor and specs',
        'Every world has an atmosphere (heat, cold, submersion, spores, thin air, dense, radiance, void, smoke) that works your AIR harder',
        'Fit suit modules at the Workshop to adapt: Heat Shielding, Thermal Lining, Pressure Seals and more',
        'The AstraNav shows the atmosphere you are standing in'
      ] },
    { date:'2026-10-10', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10.6', title:'ViceWorld',
      notes:[
        'The saga’s origin returns: everyone you meet has a ViceWorld portrait when they speak',
        'Haemen wear the colour of their district’s gem: ruby, pearl, citrine, emerald, amethyst, sapphire, onyx, amber, topaz and gold',
        'Humans keep human skin; the hybrid peoples wear bold colours of their own',
        'CUSTOMIZE PILOT: a new widget on the AstraNav home screen opens a full character builder for your astronaut',
        'Shades, tongues, bucket hats with gem badges, halos, horns, a 1936 aviator cap and more'
      ] },
    { date:'2026-10-10', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10.5', title:'The item catalog',
      notes:[
        'Every planet has its own resources: gather its plants and outcrops for materials found nowhere else',
        'The ITEM CATALOG in the AstraNav: 891 materials, machines and modifications, each with its own icon',
        'Your BAG and the STORES at NASARUS, side by side in the inventory',
        'Terra joins Scrap and Fibre, and every person you meet now has a look of their own',
        'Beyond the AstraNav’s safe radius the screen fills with static. Run out of Oil out there and you are stranded'
      ] },
    { date:'2026-10-10', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10.4', title:'The art pass',
      notes:[
        'Every world has its own ground, roads, cliffs, waters and plants: crystal plains, lava crust, coral reefs, frozen tableaux, iron plate and more',
        'Landmarks look like what they are: shrines, Gemlord caves, temples, prisms, monuments and standing stones',
        'A new INVENTORY in the AstraNav, with an icon for every item, ship part and Codex relic',
        'Drag and drop: arrange your inventory, reorder your Aethren party, and drag Aethren in and out of it',
        'The AstraNav fits every screen, from a phone held upright to a wide desktop'
      ] },
    { date:'2026-10-10', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10.3', title:'Every world, from the Codex',
      notes:[
        'Every world now has its peoples, named figures and the places of its history, all from the Master Codex',
        'Origon in its ten lands, each with its dominant race: Dragonlords, Crystalborn, Aetherelves and seven more',
        'Zyraxis: the Wild March, the Green Divide, ten routes with their Gemlord Caves, and the road to the Throne',
        'Something lies south of Baelgor and Xilnar. Its gate is shut for now',
        'Visit all nine district shrines for ANCIENT GEMSIGHT, and see what was hidden from you'
      ] },
    { date:'2026-10-10', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10.2', title:'Worlds of many lands',
      notes:[
        'Every world is now laid out in its named regions, and you will see where you are as you cross from one to the next',
        'Viridia in full: the Northern, Eastern, Central, Southern and Western regions, from frozen peaks to fire country, and fifty named districts',
        'The people of Viridia live in their own regions and districts, close to the places they belong to',
        'Zyraxis: a shrine in each of nine districts, and the old routes between them marked on the road',
        'Lumeria’s Halo Archive keeps the records no other world claims'
      ] },
    { date:'2026-10-10', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10.1', title:'The whole Codex, out in the worlds',
      notes:[
        'Every entry in the Master Codex now has a place in the worlds, from Anciuxor down to scrap',
        'Reach the Codex’s landmarks: Ashen Fields, the Temple of Anciuxor, the Tree of Elyssia and dozens more',
        'Pick up glinting relics: the Phoenaris Crown, the Key of Anciuxor, the Astralite Prisms',
        'Read record stones once you know a world’s words: concepts, events, book and game pages, and the saga’s timeline',
        'A new TIMELINE tab in the Master Canon, and the Index tells you which world a sealed entry is on',
        'Zurelea, the potion maker of Malezor, now keeps to the Malezor road'
      ] },
    { date:'2026-10-10', build:'AETHRYX ADVENTURES: 1936 · SURVEY 10', title:'The Master Codex',
      notes:[
        'The full Master Codex is in the game: 582 beings, the Worlds, Cosmic Theories, Books, Games and a 1,017-entry Index',
        'Every entry is sealed until you discover it: scan Aethren, meet people, read record stones, visit worlds',
        'Every Aethren in the Codex is in the wild, demigods and secrets included: over three hundred species on their home worlds',
        'Every character in the saga is alive in 1936: meet all 280 of them on their home worlds, most of them on a much larger Viridia',
        'Decode Cosmic Theories, Books and Games pages with DATA at the Research Station'
      ] },
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
