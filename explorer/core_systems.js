// ★ 2026-10-09 · AA:1936 CORE GAMEPLAY SYSTEMS
// Approved responsibilities from the Gameplay Architecture V1.0 handoff.
// Deferred Astralite effects remain data-only until the Macro Book descriptions
// are incorporated; this file does not invent serum abilities.
window.AOV_CORE = {
  classes: [
    { id:'materials', name:'MATERIALS', does:'Create machines.' },
    { id:'machines', name:'MACHINES', does:'Perform physical gameplay functions.' },
    { id:'enhancements', name:'ENHANCEMENTS', does:'Improve equipment and machine performance.' },
    { id:'remedies', name:'REMEDIES', does:'Produce healing and recovery solutions.' },
    { id:'proficiency', name:'PROFICIENCY', does:'Automate eligible machines.' },
    { id:'artifacts', name:'ARTIFACTS', does:'Provide ancient knowledge and research discoveries.' },
    { id:'technology', name:'TECHNOLOGY', does:'Produces Proficiency items.' },
    { id:'utilities', name:'UTILITIES', does:'Enable exploration and practical fieldwork.' },
    { id:'structures', name:'STRUCTURES', does:'Establish facilities and infrastructure.' },
    { id:'astralites', name:'ASTRALITES', does:'Enhance Carl directly through treated serums.' },
    { id:'aethren', name:'AETHREN', does:'Living creatures discovered, scanned, cloned, and settled.' }
  ],
  // SIMPLIFIED CRAFTING (Creator, 2026-10-10): the WORKSTATION is crafted straight from materials (INVENTORY · CRAFT,
  // on NASARUS, no paper needed). Every other machine is built AT the Workstation, from its recovered paper and
  // materials. Each machine then stands on NASARUS as a physical station (at, w, spr) with its own screen.
  starter: [
    { id:'workstation', name:'WORKSTATION', classId:'machines', does:'Manual crafting and assembly.', cost:{scrap:4,fibre:2}, recipe:'recipe-workstation', craft:'inventory', at:[15, 21], w:2, spr:'machine_workstation' },
    { id:'material_processor', name:'MATERIAL PROCESSOR', classId:'machines', does:'Refines eligible raw materials.', cost:{scrap:6,crystal:2}, recipe:'recipe-material-processor', at:[12, 21], w:1, spr:'core_processor' },
    { id:'fuel_generator', name:'FUEL GENERATOR', classId:'machines', does:'Converts Fibre into Oil.', cost:{scrap:8,crystal:3,fibre:2}, recipe:'recipe-fuel-generator', at:[9, 28], w:2, spr:'machine_generator' },
    { id:'rocketship_repair', name:'ROCKETSHIP REPAIR STATION', classId:'machines', does:'Restores the damaged spacecraft.', cost:{scrap:10,crystal:4,relic:1}, recipe:'recipe-rocketship-repair', at:[12, 25], w:1, spr:'core_repair' },
    { id:'astranav_terminal', name:'ASTRANAV TERMINAL', classId:'machines', does:'Establishes reliable planetary connections.', cost:{scrap:8,crystal:5,data:4}, recipe:'recipe-astranav-terminal', at:[21, 20], w:1, spr:'machine_astranav' }
  ],
  // The papers are physical: sheets lying on the ground of their world (at: the spot they are dropped near; the
  // engine settles each on the nearest open floor tile). Walk over one, or face it and press A, to pick it up.
  recipes: [
    { id:'recipe-workstation', name:'WORKSTATION PAPER', source:'NASARUS crash-site papers', machine:'workstation', world:'nasarus', at:[10, 30], where:'in the crash scar, south-west of the wreck' },
    { id:'recipe-material-processor', name:'MATERIAL PROCESSOR PAPER', source:'NASARUS ruin papers', machine:'material_processor', world:'nasarus', at:[20, 13], where:'among the Ruined Residences, to the north' },
    { id:'recipe-fuel-generator', name:'FUEL GENERATOR PAPER', source:'NASARUS service papers', machine:'fuel_generator', world:'nasarus', at:[36, 39], where:'out on the southern flats, east of the old monument' },
    { id:'recipe-rocketship-repair', name:'ROCKETSHIP REPAIR PAPER', source:'NASARUS flight papers', machine:'rocketship_repair', world:'nasarus', at:[5, 22], where:'blown west on the crash, toward the Damaged Inscriptions' },
    { id:'recipe-astranav-terminal', name:'ASTRANAV TERMINAL PAPER', source:'NASARUS navigation papers', machine:'astranav_terminal', world:'nasarus', at:[43, 18], where:'north-east, below the Collapsed Civic Building' }
  ],
  oil: { id:'oil', name:'OIL', source:'FIBRE → FUEL GENERATOR → OIL', normalPerDistance:1, outOfRangeMultiplier:2.5 },
  navigation: { baseRadius:2, upgradeStep:2, outOfRange: { label:'INTERFERENCE', risk:'Navigation static and accelerated Oil consumption.' } },
  // Aethren discovery remains playable; companion conversion and card combat are
  // intentionally reserved for a later rules pass. Existing save data is kept.
  // Canonical loop: scan → clone → deploy → nine-member party → battle.
  companions: { enabled:true, clone:true, follow:true, battle:true, partySize:9, note:'Aethren must be scanned and cloned before deployment.' },
  astraliteMatrix: { families:9, tiers:7, total:63, status:'effects deferred to the Macro Book' }
};
