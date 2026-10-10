// ★ 2026-10-09 · AETHRYX ADVENTURES: 1936 · NASARUS · the headquarters planet
// Canon: docs/card-explorer/05_NASARUS_CANON.md (Creator handoff, Canon V1.0).
//
// NASARUS is the ancient drifting planet where Carl Nasaro crash-lands in 1936. Haemen
// and Aethren lived here before the First Eternal War; their settlements survive as
// ruins. WHY it was abandoned is unknown and must not be stated anywhere. Ruin labels
// are plain descriptions (no invented names), and the ancient architectural style is
// kept neutral until the Creator approves one.
//
// Everything below the canon line is an IMPLEMENTATION PROPOSAL (handoff §5, §7): the
// facilities, costs, research and stages are game design, not historical canon.
// Stable id: 'nasarus'. The player may rename the planet; the canon name stays NASARUS.
window.AOV_HQ = {
  id: 'nasarus',
  canonicalName: 'NASARUS',
  canonicalHero: 'Carl Nasaro',
  // the five materials of the Explore → Extract → Return → Develop loop
  materials: [
    ['scrap',   'SCRAP',   'Salvaged metal: wreckage, machines, old fittings'],
    ['crystal', 'CRYSTAL', 'Mineral crystal from outcrops'],
    ['fibre',   'FIBRE',   'Plant fibre: cordage, canvas, padding'],
    ['relic',   'RELICS',  'Recovered artifacts from ruins and landmarks'],
    ['data',    'DATA',    'Survey data from scans, peoples and records']
  ],
  // Developer-room machines. These are canonical machine IDs before they are
  // assigned to ordinary worlds and crafting recipes.
  machines: [
    { id:'rocketship',   name:'ROCKETSHIP',    sprite:'machine_rocketship',   use:'rocketship',   does:'A flying vehicle test platform.' },
    { id:'astranav',    name:'ASTRANAV',      sprite:'machine_astranav',    use:'astranav',    does:'Opens navigation, survey and the living record.' },
    { id:'workstation', name:'WORKSTATION',   sprite:'machine_workstation', use:'workstation', does:'The general machine test bench for recipes and item logic.' },
    { id:'cloning_pod', name:'CLONING POD',   sprite:'machine_cloning_pod', use:'cloning_pod', does:'The machine test for making a scanned creature available as a companion.' },
    { id:'generator',   name:'GENERATOR',     sprite:'machine_generator',   use:'generator',   does:'Supplies developer power to machines in the test room.' },
    { id:'jetpack',     name:'JETPACK',       sprite:'machine_jetpack',     use:'jetpack',     does:'A movement modification test for the player.' }
  ],
  // the ground of NASARUS: desolate, grey-ochre, split by drift fissures (palettes recolour art.js tiles)
  env: {
    id: 'nasarus', kind: 'hq', name: 'NASARUS', title: 'The headquarters world',
    tiles: { ground: 'grass2', path: 'den', liquid: 'water', wall: 'rock', special: 'cracks' },
    palette: {
      ground:  { g: '#7a7266', G: '#958c7c', h: '#5e574d' },
      path:    { B: '#8a8272', b: '#6a6355', p: '#a39a86', u: '#4e4840' },
      liquid:  { a: '#3a4250', A: '#5a6474', z: '#262c36' },
      wall:    { L: '#4e4840', l: '#2e2a26', W: '#8a8272', n: '#5e574d', N: '#24211e' },
      special: { N: '#6a6358', n: '#857d6e', r: '#4fa89a', R: '#9fe8da' }
    },
    props: [['deadtree', 'ash'], ['boulder', 'stone'], ['pillar', 'stone']],
    prop_palette: { ash: { b: '#4a443c', u: '#2e2a26' }, stone: { n: '#7a7266', N: '#4e4840', W: '#a39a86' } },
    hazard: { name: 'Thin air', rule: 'The air is thin but the suit copes. AIR drains slowly; resting at camp refills it.' },
    canon: { trait: 'An ancient drifting planet. Haemen and Aethren lived here before the First Eternal War.', firstRace: '', notes: '', notable: '' }
  },
  // map layout · 64 × 48 tiles · positions are tile coordinates (x, bottom row y)
  size: [64, 48],
  ship: { x: 15, y: 26 },
  // FACILITIES (handoff §5, proposals). cost is paid from STORES. requires: built ids or research ids.
  facilities: [
    { id: 'camp', name: 'CAMP SHELTER', spr: 'hq_tent', at: [19, 24], w: 2, cost: {}, free: true,
      does: 'Rest: refills SUIT and AIR, rests your card team, saves the expedition.' },
    { id: 'stores', name: 'CAMP STORES', spr: 'hq_crate', at: [22, 26], w: 1, cost: {}, free: true, requires: ['camp'],
      does: 'The initial storage area. Deposit what you extracted.' },
    { id: 'nav', name: 'NAVIGATION CENTER', spr: 'hq_nav', at: [24, 22], w: 2, cost: { scrap: 4, crystal: 3 }, requires: ['camp', 'drive'],
      does: 'Charts the Aethryx Expanse. With the drive repaired, expeditions can depart.' },
    { id: 'research', name: 'RESEARCH STATION', spr: 'hq_lab', at: [27, 26], w: 2, cost: { scrap: 4, fibre: 2 }, requires: ['camp'],
      does: 'Turns survey DATA into research, and clones Aethren from their scanned profiles into companions.' },
    { id: 'depot', name: 'RESOURCE DEPOT', spr: 'hq_depot', at: [19, 30], w: 2, cost: { scrap: 6, fibre: 3 }, requires: ['stores'],
      does: 'Larger stores. Lands deposit automatically, and materials can be exchanged three for one.' },
    { id: 'workshop', name: 'WORKSHOP', spr: 'hq_workshop', at: [23, 30], w: 2, cost: { scrap: 8, crystal: 4 }, requires: ['research'],
      does: 'Repairs and crafting: flares, equipment research, and clearing the rockfall.' },
    { id: 'archive', name: 'CARD ARCHIVE', spr: 'hq_archive', at: [27, 30], w: 2, cost: { fibre: 4, crystal: 3, relic: 1 }, requires: ['research'],
      does: 'Organises the collection. Your battle team grows to four cards.' },
    { id: 'terminal', name: 'RESTORATION TERMINAL', spr: 'hq_terminal', at: [31, 26], w: 1, cost: { scrap: 6, relic: 2 }, requires: ['workshop'],
      does: 'Manages the restoration of the ancient ruins you have surveyed.' },
    { id: 'history', name: 'HISTORICAL ARCHIVE', spr: 'hq_history', at: [31, 30], w: 2, cost: { relic: 4, fibre: 3 }, requires: ['terminal', 'r-script'],
      does: 'Displays what has been recovered from the ruins of NASARUS.' },
    { id: 'habitation', name: 'HABITATION ZONE', spr: 'hq_tent', at: [34, 22], w: 2, cost: { scrap: 10, fibre: 8, crystal: 4 }, requires: ['workshop'],
      does: 'Shelter for the refugees you rescue from war regions on other worlds. NASARUS becomes their home too.' },
    { id: 'sanctuary', name: 'AETHREN SANCTUARY', spr: 'rest_plaza', at: [39, 28], w: 2, cost: { crystal: 8, fibre: 6, relic: 2 }, requires: ['archive'],
      does: 'Settle Aethren here from your collection (one spare copy each). New species come to live on NASARUS.' }
  ],
  // RUINS (handoff §6). Plain descriptive labels only. found: what surveying them yields once.
  ruins: [
    { id: 'r-houses',  label: 'RUINED RESIDENCES',        cat: 'Ruined settlement',   spr: 'house',     at: [17, 10], w: 2, found: { relic: 1, data: 3, scrap: 1 },
      restore: { scrap: 4, fibre: 2, relic: 1 },
      survey: 'Low stone dwellings, doorways still standing. Someone lived here, long before me.' },
    { id: 'r-hall',    label: 'COLLAPSED CIVIC BUILDING', cat: 'Ruined settlement',   spr: 'hall',      at: [40, 13], w: 3, found: { relic: 1, data: 4 },
      restore: { scrap: 8, crystal: 4, relic: 2 },
      survey: 'A long hall of columns, most of them fallen. Built for many people at once.' },
    { id: 'r-plaza',   label: 'GATHERING PLACE',          cat: 'Ancient streets',     spr: 'plaza',     at: [31, 8],  w: 2, found: { relic: 1, data: 3 },
      restore: { crystal: 3, relic: 1 },
      survey: 'A paved circle ringed with standing stones where old streets meet.' },
    { id: 'r-obelisk', label: 'MONUMENT, UNIDENTIFIED',   cat: 'Historical landmark', spr: 'obelisk',   at: [30, 41], w: 1, found: { relic: 1, data: 4 },
      restore: { crystal: 4, relic: 2 },
      survey: 'A tall marker of worked stone, banded with marks I cannot read.' },
    { id: 'r-wall',    label: 'DAMAGED INSCRIPTIONS',     cat: 'Archaeological area', spr: 'wall',      at: [7, 14],  w: 2, found: { relic: 1, data: 5 },
      restore: { crystal: 2, relic: 2 }, requires: ['r-script'],
      survey: 'A wall cut with rows of marks. An inscription, broken in places.' },
    { id: 'r-vault',   label: 'BURIED STRUCTURE',         cat: 'Archaeological area', spr: 'vault',     at: [6, 38],  w: 2, found: { data: 2, scrap: 1 },
      restore: { scrap: 3, fibre: 3 }, dig: true,
      survey: 'A mound too regular to be natural. Something is buried here.' },
    { id: 'r-spire',   label: 'UNIDENTIFIED STRUCTURE',   cat: 'Historical landmark', spr: 'spire_old', at: [56, 38], w: 2, found: { relic: 2, data: 6 }, region: 'basin',
      restore: { scrap: 6, crystal: 6, relic: 3 },
      survey: 'A tall structure ringed by a broken band. Its purpose is unknown.' }
  ],
  // the far basin, beyond the rockfall (Phase 3: expanded explorable regions)
  regions: [
    { id: 'basin', name: 'THE FAR BASIN', ridgeX: 48, gap: [29, 34], cost: { scrap: 5, fibre: 2 }, requires: ['workshop'],
      does: 'Clear the rockfall that blocks the way east.' }
  ],
  // RESEARCH (Research Station). Costs survey DATA plus materials. Effects are read by the engine.
  research: [
    { id: 'r-scan',    name: 'SCANNER GAIN',          cost: { data: 6 },              effect: 'Scans lock from further off the tuning mark.' },
    { id: 'r-survey',  name: 'DRIFT SURVEY',          cost: { data: 8 },              effect: 'Charts all of NASARUS on the field sketch and marks every ruin.' },
    { id: 'r-script',  name: 'INSCRIPTION COMPARISON', cost: { data: 10, relic: 1 },  effect: 'Compares the inscriptions with each other. Required to restore them, and for the Historical Archive.' },
    { id: 'r-air',     name: 'AIR RECYCLER',          cost: { data: 12, crystal: 3 }, requires: ['workshop'], effect: 'AIR drains a third more slowly.' },
    { id: 'r-suit',    name: 'SUIT PLATING',          cost: { data: 12, scrap: 5 },   requires: ['workshop'], effect: 'Charges and hazards do a third less SUIT damage.' },
    { id: 'r-cards',   name: 'CARD CONDITIONING',     cost: { data: 15, fibre: 3 },   requires: ['archive'],  effect: 'Your cards gain 30% more experience.' },
    { id: 'r-pack',    name: 'EXPEDITION PACK',       cost: { data: 10, fibre: 4 },   requires: ['workshop'], effect: 'Carry four recall flares instead of two.' }
  ],
  // AIR TANKS (Workshop). Only NASARUS holds an oxygen supply: the tank refills at the base and nowhere else.
  // cap is the tank's capacity in AIR units (the stock tank holds 100).
  airTanks: [
    { id: 'tank2', name: 'AIR TANK MK II',  cap: 150, cost: { scrap: 6, crystal: 4, data: 8 },            requires: ['workshop'],
      does: 'A second cylinder strapped beside the first. Half again as much air on every expedition.' },
    { id: 'tank3', name: 'AIR TANK MK III', cap: 220, cost: { scrap: 10, crystal: 8, relic: 2, data: 16 }, requires: ['tank2', 'r-air'],
      does: 'Pressurised cylinders, refitted with what the Air Recycler taught. More than twice the stock tank.' }
  ],
  // STAGES (handoff §7). 4 is long-term. 5 opened by the Creator 2026-10-09: NASARUS is populated with
  // settled Aethren and rescued Haemen refugees, like creating your own planet in the saga.
  stages: [
    { n: 1, name: 'CRASH SITE',             needs: [] },
    { n: 2, name: 'EXPEDITION CAMP',        needs: ['camp', 'stores', 'nav', 'research', 'depot'] },
    { n: 3, name: 'ESTABLISHED HEADQUARTERS', needs: ['workshop', 'archive', 'terminal', 'restored:2'] },
    { n: 4, name: 'RECLAIMED SETTLEMENT',   needs: ['history', 'basin', 'restored:7'], longTerm: true },
    { n: 5, name: 'EMERGING WORLD',         needs: ['habitation', 'sanctuary', 'residents:3', 'settled:6'] }
  ],
  // what the ruins yield when surveyed again after restoration (records stay neutral: no history is stated)
  recordNote: 'Recorded for the Historical Archive. What it meant to the people who built it is not yet known.'
};
