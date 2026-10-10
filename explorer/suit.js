// ★ 2026-10-10 · AETHRYX ADVENTURES: 1936 · THE SUIT ADAPTS (implementation proposal, change freely)
// Creator direction: "air adapts to environment based on upgrades. fully customizable suit."
// Every world has an atmosphere that works the suit's air harder or softer. A suit module, fitted at NASARUS's
// Workshop, adapts the suit to one kind of atmosphere and takes away most of its extra strain.
// Numbers are proposals; the engine reads this file (explorer.js · hazardDrain).
window.AOV_SUIT = {
  // kinds of atmosphere: the extra air drain (× the base rate) and the module that adapts to it
  kinds: {
    breathable:{ name:'BREATHABLE', mult:1.0,  note:'Thin but kind. The suit barely works.' },
    heat:      { name:'HEAT',       mult:1.6,  note:'Heat makes the regulator work double.', module:'heatshield' },
    cold:      { name:'COLD',       mult:1.55, note:'Cold thickens the air lines and frosts the valves.', module:'thermal' },
    water:     { name:'SUBMERSION', mult:1.8,  note:'Under water and in the shallows, every breath comes from the tank.', module:'seals' },
    spores:    { name:'SPORES',     mult:1.4,  note:'Spores and pollen clog the intake filters.', module:'filters' },
    thin:      { name:'THIN AIR',   mult:1.5,  note:'High altitude: there is little to draw from outside.', module:'regulator' },
    dense:     { name:'DENSE',      mult:1.45, note:'Heavy air and heavier gravity: every step costs breath.', module:'frame' },
    glare:     { name:'RADIANCE',   mult:1.3,  note:'Light that heats the visor and the lungs.', module:'glare' },
    void:      { name:'VOID',       mult:1.35, note:'Dead air in the dark. The suit makes all of its own.', module:'lamps' },
    smoke:     { name:'SMOKE',      mult:1.35, note:'Furnace smoke and soot.', module:'scrubber' }
  },
  // each environment's atmosphere (worlds and Zyraxis districts)
  env: {
    origon:'dense', lumeria:'glare', draevos:'heat', arborynth:'spores', thallassar:'water', pyrauna:'heat', quorauna:'dense', cytherion:'spores',
    zyraxis:'breathable', myraclese:'breathable', bellatora:'smoke', yvoris:'cold', kyrathos:'void', nexyros:'void', jynaera:'thin', sylvanir:'spores',
    velkryn:'heat', ignara:'heat', uralyx:'glare', halcyra:'water', wyvera:'thin', rhyzor:'dense', elythera:'thin', xylos:'glare', gravaron:'dense',
    ferros:'smoke', viridia:'breathable',
    malezor:'breathable', zarvane:'glare', andrannor:'breathable', veridan:'spores', netharion:'void', vorashil:'thin', xilnar:'void', baelgor:'smoke',
    thardin:'smoke', korathen:'thin'
  },
  // what a fitted module leaves of an atmosphere's extra strain (0.25: three quarters of it is gone)
  adapted: 0.25,
  modules: [
    { id:'heatshield', name:'HEAT SHIELDING',      kind:'heat',   cost:{ scrap:6, crystal:2, terra:4 },  does:'Reflective plates and a coolant loop. Heat no longer works the regulator double.' },
    { id:'thermal',    name:'THERMAL LINING',      kind:'cold',   cost:{ fibre:6, scrap:3 },            does:'Quilted fibre inside the suit keeps the air lines from frosting.' },
    { id:'seals',      name:'PRESSURE SEALS',      kind:'water',  cost:{ scrap:6, crystal:3, fibre:2 }, does:'Gaskets at every joint. The suit holds its air under water.' },
    { id:'filters',    name:'SPORE FILTERS',       kind:'spores', cost:{ fibre:4, crystal:2, data:4 },  does:'Layered intake filters that keep spores and pollen out.' },
    { id:'regulator',  name:'ALTITUDE REGULATOR',  kind:'thin',   cost:{ scrap:4, crystal:4, data:4 },  does:'A second-stage regulator that makes thin air go further.' },
    { id:'frame',      name:'LOAD FRAME',          kind:'dense',  cost:{ scrap:8, terra:6 },            does:'A braced frame carries the weight, so the lungs do not.' },
    { id:'glare',      name:'GLARE VISOR',         kind:'glare',  cost:{ crystal:6, data:4 },           does:'A smoked crystal visor that keeps radiance off the face.' },
    { id:'lamps',      name:'LAMP ARRAY',          kind:'void',   cost:{ crystal:4, data:6 },           does:'Lamps and a sealed recycler for dead air in the dark.' },
    { id:'scrubber',   name:'SMOKE SCRUBBER',      kind:'smoke',  cost:{ fibre:4, scrap:4 },            does:'Charcoal scrubbers that clean furnace air before it reaches you.' }
  ],
  // FULLY CUSTOMIZABLE SUIT: every part takes any colour; these are the quick picks
  parts: [
    { id:'suit',   name:'SUIT' }, { id:'trim', name:'TRIM & BOOTS' }, { id:'helmet', name:'HELMET' }, { id:'visor', name:'VISOR' }, { id:'spec', name:'SPECS' }
  ],
  swatches: ['#b3a982','#6e7a4a','#3e4a6a','#7a7a74','#8a4e34','#e8e4d8','#c8402c','#e8b830','#3a74d8','#2fae64','#8c4ad8','#1e1e24','#ff6a8a','#3fd2c8','#c8843c','#9fd2e6']
};
