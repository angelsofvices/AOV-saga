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
  starter: [
    { id:'workstation', name:'WORKSTATION', classId:'machines', does:'Manual crafting and assembly.', cost:{scrap:4,fibre:2}, recipe:'recipe-workstation' },
    { id:'material_processor', name:'MATERIAL PROCESSOR', classId:'machines', does:'Refines eligible raw materials.', cost:{scrap:6,crystal:2}, recipe:'recipe-material-processor' },
    { id:'fuel_generator', name:'FUEL GENERATOR', classId:'machines', does:'Converts Fibre into Oil.', cost:{scrap:8,crystal:3,fibre:2}, recipe:'recipe-fuel-generator' },
    { id:'rocketship_repair', name:'ROCKETSHIP REPAIR STATION', classId:'machines', does:'Restores the damaged spacecraft.', cost:{scrap:10,crystal:4,relic:1}, recipe:'recipe-rocketship-repair' },
    { id:'astranav_terminal', name:'ASTRONAV TERMINAL', classId:'machines', does:'Establishes reliable planetary connections.', cost:{scrap:8,crystal:5,data:4}, recipe:'recipe-astranav-terminal' }
  ],
  recipes: [
    { id:'recipe-workstation', name:'WORKSTATION PAPER', source:'NASARUS crash-site papers', machine:'workstation' },
    { id:'recipe-material-processor', name:'MATERIAL PROCESSOR PAPER', source:'NASARUS ruin papers', machine:'material_processor' },
    { id:'recipe-fuel-generator', name:'FUEL GENERATOR PAPER', source:'NASARUS service papers', machine:'fuel_generator' },
    { id:'recipe-rocketship-repair', name:'ROCKETSHIP REPAIR PAPER', source:'NASARUS flight papers', machine:'rocketship_repair' },
    { id:'recipe-astranav-terminal', name:'ASTRONAV TERMINAL PAPER', source:'NASARUS navigation papers', machine:'astranav_terminal' }
  ],
  oil: { id:'oil', name:'OIL', source:'FIBRE → FUEL GENERATOR → OIL', normalPerDistance:1, outOfRangeMultiplier:2.5 },
  navigation: { baseRadius:2, upgradeStep:2, outOfRange: { label:'INTERFERENCE', risk:'Navigation static and accelerated Oil consumption.' } },
  // Aethren discovery remains playable; companion conversion and card combat are
  // intentionally reserved for a later rules pass. Existing save data is kept.
  // Canonical loop: scan → clone → deploy → nine-member party → battle.
  companions: { enabled:true, clone:true, follow:true, battle:true, partySize:9, note:'Aethren must be scanned and cloned before deployment.' },
  astraliteMatrix: { families:9, tiers:7, total:63, status:'effects deferred to the Macro Book' }
};
