// ── PLANETARY UTILITIES · the 27 signature utilities, one per planet ──
// Registry only: the abilities run in explorer.js (UTIL_FX). status 'built' = its ability works in the
// field and/or the cave; 'defined' = registered and visible, its ability not yet written.
(function(){
  var DEFS = [
    { id:'origin-compass', name:'Origin Compass', planet:'Origon', ability:'Reveals hidden routes and concealed map locations', status:'defined' },
    { id:'lumelys-lantern', name:'Lumelys Lantern', planet:'Lumeria', ability:'Illuminates supernatural darkness and exposes invisible objects', status:'defined' },
    { id:'dragonflare-horn', name:'Dragonflare Horn', planet:'Draevos', ability:'Summons a temporary dragon-fire strike', status:'defined' },
    { id:'life-seed', name:'Life Seed', planet:'Arborynth', ability:'Healing AoE', status:'built' },
    { id:'tidewalker-shell', name:'Tidewalker Shell', planet:'Thallassar', ability:'Underwater breathing and deep-water traversal', status:'defined' },
    { id:'magma-forge', name:'Magma Forge', planet:'Pyrauna', ability:'Temporarily melts metal barriers and seals', status:'defined' },
    { id:'phase-dial', name:'Phase Dial', planet:'Quorauna', ability:'Briefly phases Carl through designated solid barriers', status:'defined' },
    { id:'astrablaster', name:'AstraBlaster MK1', planet:'Cytherion', ability:'Rechargeable ranged combat', status:'built' },
    { id:'gemlink-prism', name:'Gemlink Prism', planet:'Zyraxis', ability:'Synchronizes with an Aethren to amplify its next ability', status:'defined' },
    { id:'echo-decoy', name:'Echo Decoy', planet:'Myraclese', ability:'Projects a false Carl to distract enemies', status:'defined' },
    { id:'warshield', name:'Warshield', planet:'Bellatora', ability:'Deploys a directional defensive barrier', status:'defined' },
    { id:'frost-anchor', name:'Frost Anchor', planet:'Yvoris', ability:'Freezes moving platforms, machinery or environmental hazards', status:'defined' },
    { id:'truth-lens', name:'Truth Lens', planet:'Kyrathos', ability:'Reveals ancient inscriptions and hidden information', status:'defined' },
    { id:'return-beacon', name:'Return Beacon', planet:'Nexyros', ability:'Marks a location and teleports Carl back to it', status:'defined' },
    { id:'chrono-dial', name:'Chrono Dial', planet:'Jynaera', ability:'Slows moving hazards and enemies', status:'defined' },
    { id:'rootcaller', name:'Rootcaller', planet:'Sylvanir', ability:'Grows temporary vines and bridges across gaps', status:'defined' },
    { id:'titan-gauntlet', name:'Titan Gauntlet', planet:'Velkryn', ability:'Lifts and carries exceptionally heavy objects', status:'defined' },
    { id:'jetpack', name:'Jetpack', planet:'Ignara', ability:'Flight', status:'built' },
    { id:'mirage-veil', name:'Mirage Veil', planet:'Uralyx', ability:'Temporarily disguises Carl from hostile detection', status:'defined' },
    { id:'balance-gyro', name:'Balance Gyro', planet:'Halcyra', ability:'Stabilizes Carl against knockback and unstable terrain', status:'defined' },
    { id:'skyhook', name:'Skyhook', planet:'Wyvera', ability:'Grapples to elevated anchor points', status:'defined' },
    { id:'boomfists', name:'Boomfists', planet:'Rhyzor', ability:'Vibrational melee and rock breaking', status:'built' },
    { id:'star-satellite', name:'Star Satellite', planet:'Elythera', ability:'Olden Transponder orbital AoE', status:'built' },
    { id:'crystal-harvester', name:'Crystal Harvester', planet:'Xylos', ability:'Extracts rare resources from otherwise inaccessible mineral formations', status:'defined' },
    { id:'gravity-inverter', name:'Gravity Inverter', planet:'Gravaron', ability:'Reverses local gravity for Carl and nearby objects', status:'defined' },
    { id:'magnetron', name:'Magnetron', planet:'Ferros', ability:'Magnetically pulls or pushes metallic objects', status:'defined' },
    { id:'bio-scanner', name:'Bio Scanner', planet:'Viridia', ability:'Detects living creatures and biological traces nearby', status:'defined' }
  ];
  var BY = {}; DEFS.forEach(function(d){ BY[d.id] = d; });
  // world-object tags, by the glyph an object is drawn with. A utility only affects an object that carries its tag:
  // a mountain (#) carries none, so Boomfists cannot break it.
  var TAGS = {
    B:['breakable_rock', 'heavy_lift'],   // boulder
    w:['meltable_metal', 'magnetic'],     // wreckage
    A:['crystal_resource'],               // crystal seam
    b:['biological_trace'],               // plant
    T:['biological_trace'],               // tree
    P:['heavy_lift'],                     // prop: pylon, pillar, spire, vent
    X:['grapple_anchor']                  // route marker post
  };
  window.AOV_UTILS = {
    defs: DEFS, byId: BY, TAGS: TAGS,
    tagsOf: function(ch){ return TAGS[ch] || []; },
    hasTag: function(ch, tag){ return (TAGS[ch] || []).indexOf(tag) >= 0; }
  };
})();
