// ★ 2026-10-09 · THE LIVING MASTER CODEX · BIOME MANIFEST
// Authored biome levels sit beneath each existing planetary overworld. The
// manifest is content only: current seeded maps remain unchanged until a
// level selector explicitly consumes these records.
(function () {
  var fauna = window.AOV_FAUNA || {}, peoples = fauna.peoples || {}, rows = [];
  var W = {
    1:['origon','ORIGON',null,'origin',['Dragonlands','Crystallands','Volcanolands','Desertlands','Darklands','Gardenlands','Riverlands','Flatlands','Giantlands','Elvenlands',['Dragonlands Sky Ruins','Dragonlands'],['Crystalline Deep','Crystallands'],['Volcanic Rift','Volcanolands'],['Rootwater Basin','Riverlands'],['Anciuxor Temple Approach','Dragonlands / Giantlands']]],
    2:['lumeria','LUMERIA','ASTRUMS','light',['Lightglass Plains','Prismatic Shallows','Halo Archive','Eldersoul Chord','Astrum Divide']],
    3:['draevos','DRAEVOS','DRACOLORDS','dragon',['Dragonlands','Sky-Forge Cliffs','Crashsite Scar','Magma Wingway','Omegoran Hollow']],
    4:['arborynth','ARBORYNTH','Great Root record','root',['Rootsea','Canopy Libraries','Cognara Boughs','Fortaris Underroot','Great Root Heart']],
    5:['thallassar','THALLASSAR','Great Fin record','ocean',['Surface Cathedral','Reef Chapels','Trench of the Great Fin','Current Roads','Pearlward Shoals']],
    6:['pyrauna','PYRAUNA','Great Fang record','expansion',['Great Hide','Ember Expansion Fields','Cooled Lava Roads','Fangfall Crater','Renewal March']],
    7:['quorauna','QUORAUNA','Great Scale record','compression',['Great Scale Slopes','Fleshstone Ravines','Collapse Basin','Sinkroot Depths','Bonefall Shelf']],
    8:['cytherion','CYTHERION','SYNTHRAX','grid',['Outer Grid','Mantis Commons','Spider Margin','Synthara Core','Casteway Bridges']],
    9:['zyraxis','ZYRAXIS','HAEMEN','mothergem',[['malezor','gem caverns'],['zarvane','amber ravines'],['andrannor','flooded gemworks'],['veridan','violet terraces'],['netharion','black crystal galleries'],['vorashil','deep blue basin'],['xilnar','corrupted gem scar'],['baelgor','golden forge district'],['thardin','gravity gem wells'],['korathen','sealed astralite vaults']]],
    10:['myraclese','MYRACLESE','HUMANOIDS','dominion',['Dominion Causeway','Enforced Devotion Citadel','Congregation Fields','Third Thamonian Gate','Exodus Road']],
    11:['bellatora','BELLATORA','BEASTFOLK','war',["Queen’s Warplain",'Clan Arena Belt','Ironblood March','Ceasefire Basin','Princess Road']],
    12:['yvoris','YVORIS','ARCHIVE LIFEFORMS','frozen',['Frozen City','Stillwater Shelf','Memory-Trap Vaults','Stasis Causeway','Blue Hour']],
    13:['kyrathos','KYRATHOS',null,'truth',['Carbide Dusk','Observer Halls','Hidden Awareness Corridors','Truthwell','Quiet Perimeter']],
    14:['nexyros','NEXYROS',null,'prime',['Dispersal Plain','Four Kings Ruins','Transplacement Scar','Saturnis Road','Abandoned Prime']],
    15:['jynaera','JYNAERA','AVIANS','time',['Flicker Settlements','Accelerated Grasslands','Pulse Valleys','Hourglass Ruins','Last Second']],
    16:['sylvanir','SYLVANIR','BEASTFOLK OF THE CANOPY','conscious forest',['Conscious Forest','Rootmind Canopy','Toxin Groves','Overgrowth Sea','Green Silence']],
    17:['velkryn','VELKRYN','GREATKIN CYCLOPES','consumption',['Crimsonian Titanlands','Fleshworks','Hunger Basin','Cyclopean Road','Consumption Pit']],
    18:['ignara','IGNARA','REPTILOIDS','fire',['Perpetual Ignition','Serpent Forges','Warflare Plains','Ashwind Belt','Unspent Fire']],
    19:['uralyx','URALYX',null,'perception',['Soft Cathedral','Attention Plains','Vanishing Roads','Observed Mountains','Blindside Basin']],
    20:['halcyra','HALCYRA','AQUATICS','harmony',['Devotional Sea','Concord Harbors','Harmony Reefs','White Sand Bars','Sharedwater Deep']],
    21:['wyvera','WYVERA','AVIANS','ascension',['Predator Aeries','Rebirth Cliffs','Phoenix Shell','Cloud Hunt','Ascension Shelf']],
    22:['rhyzor','RHYZOR','SOUND-CARRIERS','resonance',['Sound Bridges','Vibration Mines','Engineer Cities','Echo Basin','Physics Belt']],
    23:['elythera','ELYTHERA','THE ELYTHER SKY PRIESTS','floating',['Floating Continents','Sky Priest Roads','Lift Fields','Cloudroot Islands','Will Cathedral']],
    24:['xylos','XYLOS','XYLORANS','crystal',['Frequency Plains','White Crystal Caves','Matrix Hollows','Perfect Ray Shelf','Shatterline']],
    25:['gravaron','GRAVARON','ENDURERS','gravity',['Gravity Arenas','Stabilization Belt','Force Wells','Duelist Shelf','Zoryth Resonance']],
    26:['ferros','FERROS','MACHINE-WROUGHT','machine',['Iron Dynasties','Rail Foundries','Slag Fields','Machine Districts','Lightrail Core']],
    27:['viridia','VIRIDIA','VIRIDIANS','balance',['Northern Region','Eastern Region','Central Region','Southern Region','Western Region']],
    28:['aep28','AEP-28',null,'drift',['Drift Crust','Living Ruins','Worldender Weather','Fleshlord Interior','Aethravax Approach']]
  };
  var profiles = {
    origin:['black glass and gold-veined stone','The silence presses against every step','presence fractures','Anciuxor record',['crystal','relic','data'],['Crystal','Astral']],
    light:['lightglass and prismatic shallows','The horizon shines through itself','radiant flare','Astrum archive',['crystal','data','fibre'],['Radiant','Astral']],
    dragon:['basalt, wing cliffs, and hot stone','Something large passed overhead','thermal updraft','dragonlord aerie',['crystal','scrap','relic'],['Draconic','Elemental']],
    root:['living wood, root tunnels, and green water','The ground is listening','root surge','Great Root record',['fibre','relic','crystal'],['Nature','Verdant']],
    ocean:['reef shelves and pressure-dark water','The current carries a distant call','pressure tide','Great Fin record',['fibre','crystal','data'],['Aquatic','Nature']],
    expansion:['fresh lava, open flats, and ember fields','The land is still becoming','expansion fault','Great Fang record',['scrap','crystal','fibre'],['Elemental','Beast']],
    compression:['folded ravines and fleshstone','Distances close without warning','compression crush','Great Scale record',['scrap','relic','crystal'],['Unknown','Elemental']],
    grid:['hardlight lanes, nests, and machine bridges','Every route has a watcher','grid cascade','Synthrax node',['data','scrap','crystal'],['Tech','Insectoid']],
    mothergem:['gem caverns and Haemen works','The Mothergem pulses below','gemquake','district archive',['crystal','relic','data'],['Crystal','Humanoid']],
    dominion:['processional stone and abandoned citadels','Order survives its owners','devotional lock','Thamonian gate',['data','fibre','relic'],['Humanoid','Aura']],
    war:['red plains, arenas, and iron roads','Old victories still claim the ground','clan challenge','Beastfolk arena',['scrap','fibre','relic'],['Beast','Humanoid']],
    frozen:['blue ice, frozen cities, and stasis vaults','A memory is trapped under the frost','stasis pulse','archive chamber',['crystal','data','fibre'],['Spirit','Crystal']],
    truth:['carbide stone and witness halls','The landscape records your attention','observation shift','truthwell',['data','relic','crystal'],['Unknown','Astral']],
    prime:['dust plains and displaced ruins','The road is never where it was','transplacement','Four Kings mark',['relic','data','scrap'],['Humanoid','Unknown']],
    time:['flicker grasslands and broken clocks','A second can become a season','time slip','hourglass ruin',['data','fibre','crystal'],['Chrono','Astral']],
    'conscious forest':['rootmind canopy and toxin groves','The forest chooses what to show','spore thought','rootmind heart',['fibre','relic','data'],['Nature','Verdant']],
    consumption:['crimson stone and cyclopean works','Hunger moves beneath the floor','maw collapse','Greatkin road',['scrap','fibre','relic'],['Ultramax','Beast']],
    fire:['serpent forges and ashwind plains','Heat never leaves the metal','warflare','reptiloid forge',['scrap','crystal','fibre'],['Elemental','Draconic']],
    perception:['soft stone, vanishing roads, and blindside basins','Looking changes the route','attention break','observer hall',['data','relic','fibre'],['Unknown','Spirit']],
    harmony:['devotional sea and concord reefs','The water moves in one rhythm','concord break','sharedwater shrine',['fibre','crystal','data'],['Aquatic','Aura']],
    ascension:['cloud cliffs and predator aeries','The wind rewards the brave','falling thermals','phoenix shell',['fibre','crystal','relic'],['Astral','Beast']],
    resonance:['sound bridges, mines, and echo basins','A footstep can move a wall','frequency rupture','engineer city',['data','crystal','scrap'],['Tech','Spirit']],
    floating:['sky islands and lift fields','The ground is a choice','lift failure','Sky Priest road',['fibre','data','crystal'],['Astral','Aura']],
    crystal:['white crystal caves and ray shelves','Light cuts like a tool','frequency shatter','Xyloran matrix',['crystal','data','relic'],['Crystal','Radiant']],
    gravity:['arenas, force wells, and Zoryth resonance','The body is never at rest','gravity inversion','Endurer arena',['scrap','crystal','relic'],['Ultramax','Unknown']],
    machine:['iron dynasties, rails, and slag fields','The machines remember their orders','rail surge','Machine-Wrought foundry',['scrap','data','crystal'],['Tech','Crystal']],
    balance:['green valleys, blue water, and human ruins','Life is returning unevenly','ecosystem swing','Viridian settlement',['fibre','crystal','relic'],['Nature','Humanoid']],
    drift:['living ruins and worldender weather','The planet moves under the map','drift storm','Aethravax approach',['relic','data','scrap'],['Unknown','Ultramax']]
  };
  function slug(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
  function make(w, spec, i){
    var name=Array.isArray(spec)?spec[0]:spec, p=profiles[w[3]], derived=w[0]==='origon'&&i>10;
    var person=peoples[w[0]=== 'aep-28' ? 28 : Object.keys(W).find(function(k){return W[k]===w;})];
    var people=w[2] || (person && (person.race || person.record)) || null;
    return {id:w[0]+'-'+slug(name),district:w[0]==='zyraxis'?slug(name):null,world:w[0],worldNo:+Object.keys(W).find(function(k){return W[k]===w;}),index:i,name:name,
      canonBasis:derived?'Derived from '+(Array.isArray(spec)?spec[1]:name)+' and existing Codex landmarks':'Codex terrain and named region: '+name,
      terrain:Array.isArray(spec)&&spec[1]?spec[1]:p[0],mood:p[1],hazard:p[2],gate:i===1?'rocketship':i===2?'astranav':i===3?'generator':'workstation',landmark:Array.isArray(spec)&&spec[1]&&derived?spec[1]:name+' landmark',materialTags:p[4].slice(),aethrenTags:p[5].slice(),people:people,levelRange:[i,i+2],restoration:i===1?'Survey and establish a safe route.':i===2?'Recover a working system for the planetary network.':'Stabilize the site for life and the route home.'};
  }
  Object.keys(W).forEach(function(k){var w=W[k];w[4].forEach(function(s,i){rows.push(make(w,s,i+1));});});
  var byWorld={};rows.forEach(function(b){(byWorld[b.world]||(byWorld[b.world]=[])).push(b);});
  window.AOV_BIOMES={rows:rows,worlds:W,byWorld:function(id){return (byWorld[String(id).toLowerCase()]||[]).slice();},forLevel:function(world,id){return this.byWorld(world).find(function(b){return b.id===id;})||null;}};
  (window.AOV_ENV||[]).forEach(function(e){
    var id=String(e.id||'').toLowerCase(), list=byWorld[id];
    if(!list && String(e.world||'')==='9') list=(byWorld.zyraxis||[]).filter(function(b){return b.district===id;});
    if(list && list.length)e.biomes=list.slice();
  });
})();
