// ★ 2026-10-09 · AETHREN VARIANTS
// 39 habitat families × 42 native body plans (4 canon bodies + 38 native silhouettes) = 1,638 habitat variants.
// Each variant also wears a body pattern and a second feature, picked from its habitat and body together.
// Only bodies that suit a habitat's environments live there; Zyraxis's district habitats are the broadest of all.
// Each variant is a sprite phenotype, not a new claim about the canon roster:
// the source body remains a canon Aethren body and the habitat supplies its
// coloration, feature, and encounter ecology.
(function () {
  var ART = window.AOV_ART, FAUNA = window.AOV_FAUNA || {}, D = window.EXP_DATA;
  if (!ART || !ART.registerVariant) return;
  function shape(rows){ return rows.map(function(r){ return (r + '................').slice(0,16); }); }
  var newPlans = {
    crawler: ['................','....kkkk........','...krrrrk.......','..krrRRrrk......','.krrrrrrrrk.....','..krrYYrrk......','...kk..kk.......','..k..kk..k......','.k...kk...k.....','k....kk....k....','.....kk.........','................','................','................','................','................'],
    serpent: ['................','......kk........','....krrrrk......','...krrRRrrk.....','..krrrrrrrrk....','...krrYYrrk.....','....krrrrk......','......kk........','....kk..........','..krrk..........','.krrRRrk........','..krrk..........','....kk..........','................','................','................'],
    beetle: ['......kk........','....kBBBBk......','...kBBBBBBk.....','..kBBPPPPBBk....','..kBBPPPPBBk....','.kBBBBBBBBBBk...','kBBkkBBBBkkBBk..','kBB..kBBk..BBk..','kBB..kBBk..BBk..','.kk..kBBk..kk...','....kBBk........','....kkkk........','................','................','................','................'],
    avian: ['.......kk.......','.....kVVVvk.....','...kVVVVVVVvk...','..kVVVcccVVVvk..','.kVVcccCCCCcVVk.','..kVVVVVVVVVvk..','....kVVVVVvk....','.....kk.kk.....','....k..k..k.....','...k...k...k....','................','................','................','................','................','................'],
    bat: ['k..............k','kk............kk','kVkk........kkVk','.kVVkk....kkVVk.','..kVVVVVVVVVVk..','...kVVVVVVVVk...','....kVVVVVVk....','.....kk..kk.....','.....kk..kk.....','....k..kk..k....','................','................','................','................','................','................'],
    fish: ['................','.....kk.........','...kcccck.......','..kccCCCcck.....','.kccCCCCCcck....','kccCCCCCCCcck...','.kccCCCCCcck....','..kccCCCcck.....','...kcccck.......','.....kk.........','..kk......kk....','k..k......k..k..','................','................','................','................'],
    moth: ['....kk..kk......','..kVVVVVVVVk....','.kVVVCCCCVVVk...','kVVVCCCCCCVVVk..','.kVVVCCCCVVVk...','..kVVVVVVVVk....','....krrrrk......','.....krrk.......','....k....k......','...k......k.....','................','................','................','................','................','................'],
    crab: ['................','....kk..kk......','...krrrrrrk.....','..krrRRRRrrk....','.krrrrrrrrrrk...','..krrrrrrrrk....','...kk....kk.....','k..k....k..k....','kk.k....k.kk....','k...kkkk...k....','................','................','................','................','................','................'],
    blob: ['................','......kk........','...krrrrrrk.....','..krrRRRRrrk....','.krrRRRRRRrrk...','krrRRRRRRRRrrk..','krrRRRRRRRRrrk..','.krrRRRRRRrrk...','..krrrrrrrrk....','....krrrrk......','......kk........','................','................','................','................','................'],
    golem: ['....kkkkkk......','...kMMMMMMk.....','..kMMNNNNMMk....','..kMMMMMMMMk....','..kMMYYMMMk.....','...kMMMMMMk.....','..kkMMMMMMkk....','..k..kkkk..k....','.kk..k..k..kk...','k...k....k...k..','....k....k.....','....kkkkkk.....','................','................','................','................'],
    flora: ['.......kk.......','.....kqqqqk.....','...kqqQQQQqqk...','..kqqQQQQQQqqk..','...kqqQQQQqqk...','.....kqqqqk.....','.......kk.......','......kkkk......','.....kBBBBk.....','....kBBBBBBk....','...kBBBBBBBBk...','......kkkk......','......kkkk......','................','................','................'],
    cephalopod: ['......kk........','....krrrrk......','...krrRRrrk.....','..krrrrrrrrk....','..krrYYrrrk.....','...krrrrrrk.....','..k..kk..k......','.k...kk...k.....','k....kk....k....','k...k..k...k....','...k....k.......','..k......k......','................','................','................','................']
  };
  Object.keys(newPlans).forEach(function(id){ ART.registerBodyPlan(id, { rows:shape(newPlans[id]), pal:{'!':'#fff28a'}, note:'Native silhouette · '+id }); });

  // ★ 2026-10-10 · MORE BODIES (Creator: "add more differentiations across body types… more not less"):
  // 26 further native silhouettes, so the Expanse holds 42 body plans in all.
  var morePlans = {
    stag: ['..k...k.........','..kk.kk.........','...kkk..........','...krrk.........','..krYrk.........','..krrrkkkkkkk...','...krrRRRRRrrk..','....krRRRRRRrk..','....krrrrrrrrk..','....kk.kk.kk.kk.','....kk.kk.kk.kk.','....k..k..k..k..'],
    hound: ['................','..kk............','.krrk...........','krYrrk..........','kkrrrkkkkkkkk...','..krrRRRRRRrrk..','..krRRRRRRRRrkk.','..krrrrrrrrrrk.k','...kk.kk..kk.k..','...kk.kk..kk.k..','...k..k...k..k..'],
    feline: ['..k.k...........','.krkrk..........','.krYrk..........','.krrrkkkkkkk....','..krRRRRRRrrk...','..krRRRRRRRrk..k','..krrrrrrrrrk.kk','...kk.kk.kk.kkk.','...kk.kk.kk.....'],
    bear: ['..kk....kk......','.krrkkkkrrk.....','.krrrrrrrrk.....','.krYrrrrYrk.....','..krrkkrrk......','.krrRRRRrrk.....','krrRRRRRRrrk....','krRRRRRRRRrk....','krrRRRRRRrrk....','.krrrrrrrrk.....','.kkk.kk.kkk.....'],
    ape: ['....kkkk........','...krrrrk.......','...kYrrYk.......','...krkkrk.......','..kkrrrrkk......','.krkRRRRkrk.....','krk.kRRk.krk....','kk..kRRk..kk....','...krrrrk.......','...kk..kk.......','...kk..kk.......','..kkk..kkk......'],
    hopper: ['...k.k..........','...kkk..........','..kkrk..........','..krYk..........','..krrk..........','..krRRk.........','..krRRRk........','..krRRRrk.......','...krrrrkk......','....kkrrk.kk....','...kkk.kk..kk...','..kkk...........'],
    frog: ['................','..kk......kk....','.kYYk....kYYk...','.krrkkkkkkrrk...','krrrrrrrrrrrrk..','krRRRRRRRRRRrk..','.krRRRRRRRRrk...','kkrrkkrrkkrrkk..','k..kk....kk..k..'],
    ray: ['................','k.............k.','kk...kkkk....kk.','.krrkrrrrkrrrk..','..krrRRRRRrrk...','...krrYrYrrk....','....krrrrrk.....','.....kkrkk......','.......k........','.......k........','........k.......'],
    eel: ['................','kkk.............','krYk.......kk...','krrrk....krrrk..','.krrrk..krrRrrk.','..krRrkkrRk.krk.','...krRRRRk...kk.','....kkkkk.......'],
    jelly: ['....kkkkkk......','..kcCCCCCCck....','.kcCCCCCCCCck...','.kcCYccccYCck...','.kcccccccccck...','..kkkkkkkkkk....','..k.k.k.k.k.....','...k.k.k.k.k....','..k.k.k.k.k.....','...k...k...k....'],
    urchin: ['..k..k..k.......','...k.k.k........','k..krrrk..k.....','.kkrRRRrkk......','..krRYRRrk......','kkkrRRRRrkkk....','..krRRYRrk......','.kkrRRRrkk......','k..krrrk..k.....','...k.k.k........','..k..k..k.......'],
    snail: ['................','......kkkk......','.....kRRRRk.....','....kRrrrRRk....','k..kRrkkkrRk....','Yk.kRrkRkrRk....','krkkRrrrRrRk....','krrkRRRRRRk.....','krrrkkkkkkrk....','.krrrrrrrrrrk...','..kkkkkkkkkk....'],
    wasp: ['..k.....k.......','...k...k........','.kk.kkk.kk......','kVVkrYrkVVk.....','kVVkrrrkVVk.....','.kk.kRk.kk......','....krk.........','....kRk.........','....krk.........','....kkk.........','.....k..........'],
    dragonfly: ['.......kk.......','......kYYk......','kkkkk.krrk.kkkkk','kCCCCkkrrkkCCCCk','.kkkkkkrrkkkkkk.','kCCCCkkrrkkCCCCk','kkkkk.krrk.kkkkk','.......rr.......','.......rr.......','.......rr.......','.......kk.......'],
    owl: ['..k.......k.....','..kk.....kk.....','..krkkkkkrk.....','.krYYrrrYYrk....','.krYkrrrkYrk....','.krrrrkrrrrk....','.kVrrRRRrrVk....','.kVrRRRRRrVk....','.kVrrRRRrrVk....','..krrrrrrrk.....','...kk...kk......'],
    wader: ['.....kk.........','....krYk........','kkkkkrrk........','.....krk........','.....krk........','....krrrkkk.....','...krRRRRrrk....','...krRRRRRrkk...','....krrrrrk..k..','.....k...k......','.....k...k......','.....k...k......','....kk..kk......'],
    drake: ['k...........k...','kk..kk.....kk...','kVk.krk...kVk...','kVVkrYrk.kVVk...','.kVkrrrrkkVk....','..kkrRRRrkk.....','...krRRRRrk.....','...krRRRRrk...k.','....krrrrrkk.kk.','....kk.kk.krrk..','....k..k...kk...'],
    turtle: ['................','.....kkkkkk.....','....kRRRRRRk....','...kRrRRrRRRk...','..kRRRRRRrRRRk..','kkkRRrRRRRRRRk..','kYrkkkkkkkkkkk..','krrk.krk..krk...','.kk..kk...kk....'],
    scorpion: ['..........kk....','.........krrk...','..........kRk...','...........krk..','...........krk..','kk.kkkkkkkkrk...','krkrrRRRRRrrk...','.krrYRRRRRrk....','kk.krrrrrrk.....','...k.k.k.k......','..k.k.k.k.......'],
    spider: ['k.k........k.k..','.k.k......k.k...','..k.k.kk.k.k....','...kkrrrrkk.....','k.kkrYrrYrkk.k..','.kkrrRRRRrrkk...','..krRRRRRRrk....','.kkrrRRRRrrkk...','k.kkrrrrrrkk.k..','..k.kkkkkk.k....','.k..k....k..k...'],
    mantis: ['....kk..........','...kYrk.........','...krrk.........','..kk.kk.........','.krk.krk........','krk..krrk.......','.k...krRk.......','.....krRRk......','.....krRRrk.....','......krrrrk....','.....k.k..k.k...','....k..k..k..k..'],
    worm: ['................','................','......kkkk......','.....krrrrk.....','....krkkkkrk....','...krk....krk...','..kYrk.....krk..','..krk.......krk.','...k.........kk.'],
    wisp: ['......kk........','.....kCCk.......','....kCwwCk......','...kCwYYwCk.....','...kCwwwwCk.....','....kCCCCk......','.....kCCk.......','......kCk.......','.....kCk........','......k.........'],
    drone: ['kk...kkkk...kk..','krk.krrrrk.krk..','.kkkrRRRRrkkk...','...krkYYkrk.....','...krrrrrrk.....','....kkrrkk......','.....krrk.......','....k.kk.k......'],
    mushroom: ['....kkkkkk......','..kRRRRRRRRk....','.kRRwRRRRwRRk...','kRRRRRRwRRRRRk..','kkkkkkkkkkkkkk..','.....krrk.......','.....kYYk.......','.....krrk.......','....krrrrk......','....kkkkkk......'],
    hydra: ['.kk...kk...kk...','kYrk.kYrk.kYrk..','.krk..krk..krk..','..krk.krk.krk...','...krkrrkkrk....','....krRRRRk.....','...krRRRRRrk....','...krRRRRRrk....','....krrrrrk.....','....kk...kk.....']
  };
  Object.keys(morePlans).forEach(function(id){ ART.registerBodyPlan(id, { rows:shape(morePlans[id]), pal:{'!':'#fff28a'}, note:'Native silhouette · '+id }); });
  var bodies = [
    { key:'quad', sprite:'otterlin_down', types:['Beast','Creature'], source:'quad' },
    { key:'amph', sprite:'verdanix_down', types:['Aquatic','Nature'], source:'amph' },
    { key:'wing', sprite:'aetherwing', types:['Aura','Astral'], source:'wing' },
    { key:'spine', sprite:'volcanut_down', types:['Elemental','Beast'], source:'spine' },
    { key:'crawler', sprite:'crawler', types:['Beast','Nature'], source:'quad' },
    { key:'serpent', sprite:'serpent', types:['Draconic','Elemental'], source:'spine' },
    { key:'beetle', sprite:'beetle', types:['Beast','Tech'], source:'spine' },
    { key:'avian', sprite:'avian', types:['Beast','Aura'], source:'wing' },
    { key:'bat', sprite:'bat', types:['Beast','Spirit'], source:'wing' },
    { key:'fish', sprite:'fish', types:['Aquatic','Creature'], source:'amph' },
    { key:'moth', sprite:'moth', types:['Aura','Nature'], source:'wing' },
    { key:'crab', sprite:'crab', types:['Aquatic','Beast'], source:'amph' },
    { key:'blob', sprite:'blob', types:['Unknown','Creature'], source:'amph' },
    { key:'golem', sprite:'golem', types:['Tech','Elemental'], source:'spine' },
    { key:'flora', sprite:'flora', types:['Verdant','Nature'], source:'amph' },
    { key:'cephalopod', sprite:'cephalopod', types:['Aquatic','Unknown'], source:'amph' },
    // the 26 further bodies (2026-10-10)
    { key:'stag', sprite:'stag', types:['Beast','Nature'], source:'quad' },
    { key:'hound', sprite:'hound', types:['Beast','Creature'], source:'quad' },
    { key:'feline', sprite:'feline', types:['Beast','Spirit'], source:'quad' },
    { key:'bear', sprite:'bear', types:['Beast','Ultramax'], source:'quad' },
    { key:'ape', sprite:'ape', types:['Humanoid','Beast'], source:'quad' },
    { key:'hopper', sprite:'hopper', types:['Creature','Aura'], source:'quad' },
    { key:'frog', sprite:'frog', types:['Aquatic','Verdant'], source:'amph' },
    { key:'ray', sprite:'ray', types:['Aquatic','Astral'], source:'amph' },
    { key:'eel', sprite:'eel', types:['Aquatic','Elemental'], source:'spine' },
    { key:'jelly', sprite:'jelly', types:['Aquatic','Radiant'], source:'amph' },
    { key:'urchin', sprite:'urchin', types:['Aquatic','Crystal'], source:'spine' },
    { key:'snail', sprite:'snail', types:['Nature','Chrono'], source:'amph' },
    { key:'wasp', sprite:'wasp', types:['Beast','Corrupted'], source:'wing' },
    { key:'dragonfly', sprite:'dragonfly', types:['Aura','Verdant'], source:'wing' },
    { key:'owl', sprite:'owl', types:['Spirit','Aura'], source:'wing' },
    { key:'wader', sprite:'wader', types:['Aquatic','Aura'], source:'wing' },
    { key:'drake', sprite:'drake', types:['Draconic','Astral'], source:'spine' },
    { key:'turtle', sprite:'turtle', types:['Aquatic','Chrono'], source:'amph' },
    { key:'scorpion', sprite:'scorpion', types:['Beast','Corrupted'], source:'spine' },
    { key:'spider', sprite:'spider', types:['Unknown','Beast'], source:'spine' },
    { key:'mantis', sprite:'mantis', types:['Verdant','Beast'], source:'spine' },
    { key:'worm', sprite:'worm', types:['Creature','Nature'], source:'amph' },
    { key:'wisp', sprite:'wisp', types:['Spirit','Radiant'], source:'wing' },
    { key:'drone', sprite:'drone', types:['Tech','Extraterrestrial'], source:'spine' },
    { key:'mushroom', sprite:'mushroom', types:['Verdant','Unknown'], source:'amph' },
    { key:'hydra', sprite:'hydra', types:['Draconic','Aquatic'], source:'spine' }
  ];
  // ★ HABITAT COMPATIBILITY (Creator 2026-10-10: "zyraxis has the most diversity of aethren but all worlds have aethren
  // that match habitat compatibility"). Each body lives in some environments; a variant spawns only where its body
  // shares an environment with its habitat. The other pairings stay registered (old saves keep their cards) but never spawn.
  var BODY_ENV = {
    quad:['land','wild','ruin','arid','cold'], amph:['water','wild','land'], wing:['sky','land','wild'], spine:['land','heat','arid','under'],
    crawler:['land','under','wild','arid'], serpent:['land','water','wild','heat'], beetle:['land','wild','arid','ruin'], avian:['sky','land','wild','cold'],
    bat:['under','sky','ruin'], fish:['water'], moth:['sky','wild','arcane'], crab:['water','arid'], blob:['water','under','wild','arcane'],
    golem:['under','ruin','arcane','heat','arid'], flora:['wild','land'], cephalopod:['water','under'],
    stag:['land','wild','cold'], hound:['land','ruin','arid','cold'], feline:['land','wild','arid'], bear:['land','wild','cold','under'], ape:['wild','land','ruin'],
    hopper:['land','arid','wild'], frog:['water','wild'], ray:['water','sky'], eel:['water','under'], jelly:['water','sky','arcane'], urchin:['water','arcane'],
    snail:['wild','water','ruin'], wasp:['wild','sky','arid'], dragonfly:['water','wild','sky'], owl:['sky','wild','ruin','cold'], wader:['water','wild'],
    drake:['sky','heat','land'], turtle:['water','land','arid'], scorpion:['arid','heat','under'], spider:['under','wild','ruin'], mantis:['wild','ruin'],
    worm:['under','wild','arid'], wisp:['arcane','sky','cold'], drone:['ruin','arcane'], mushroom:['under','wild'], hydra:['water','heat','under']
  };
  function compatible(bodyKey, habTags){ var e = BODY_ENV[bodyKey] || ['land']; return (habTags || ['land']).some(function(t){ return e.indexOf(t) >= 0; }); }
  // per-variant differentiation: a body pattern and a second feature, chosen from the habitat and the body together
  var PATTERNS = ['spots', 'stripes', 'bands', 'speckle', 'mottle', 'belly', 'none'];
  var FEATURES2 = ['spikes', 'mane', 'tendrils', 'aura', 'tusks', 'plates', 'halo', 'whiskers', 'horns', 'crest', 'fins', 'antennae', 'quills', 'tail', 'rings', 'glow'];
  function darken(hex, k){ var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; return '#' + [r, g, b].map(function(c){ return Math.round(c * (1 - k)).toString(16).padStart(2, '0'); }).join(''); }
  var habitats = [
    ['sky','Cloudstep Aerie',3,'crest','#5c8aff','#e8c8a8','#fff28a',['heat', 'sky']],
    ['forest','Rootshadow Forest',4,'frill','#2fe6a8','#3aa66e','#d8f8a8',['wild']],
    ['water','Firstwater Shelf',5,'fins','#4a78c2','#7ad0d8','#a8e8ff',['water']],
    ['dry','Glasswind Flats',14,'mask','#c8843c','#e8b830','#fff0b0',['arid', 'ruin']],
    ['volcanic','Fangfire Caldera',6,'horns','#e05a2a','#7a1a5c','#ffe08a',['arid', 'heat']],
    ['marsh','Mirelight Marsh',27,'antennae','#3a7a58','#7ad0d8','#b87cff',['land', 'water', 'wild']],
    ['swamp','Blackroot Swamp',16,'webbing','#244a3a','#3aa66e','#c8e868',['under', 'water', 'wild']],
    ['city','Haemen Ruin Ward',9,'vents','#c95c5c','#7d4bb0','#e8c878',['arcane', 'land', 'ruin', 'under']],
    ['cavern','Malezor Gem Caverns',9,'glow','#7d4bb0','#b0e0ff','#fff28a',['arcane', 'land', 'ruin', 'under']],
    ['floodworks','Andrannor Floodworks',9,'fins','#22457c','#4a78c2','#a8e8ff',['arcane', 'land', 'ruin', 'under', 'water']],
    ['terrace','Veridan Violet Terraces',9,'frill','#7d4bb0','#3aa66e','#e8c8a8',['arcane', 'land', 'ruin', 'under', 'wild']],
    ['gallery','Netharion Crystal Gallery',9,'antennae','#24304a','#b0e0ff','#c8b8ff',['arcane', 'land', 'ruin', 'under']],
    ['basin','Vorashil Deep Basin',9,'webbing','#22457c','#7ad0d8','#b87cff',['arcane', 'land', 'ruin', 'under', 'water']],
    ['scar','Xilnar Corruption Scar',9,'scar','#7a1a5c','#c8402c','#ff8a3a',['arcane', 'arid', 'heat', 'land', 'ruin', 'under']],
    ['forge','Baelgor Golden Forge',9,'vents','#b0904a','#c8402c','#fff28a',['arcane', 'heat', 'land', 'ruin', 'under']],
    ['well','Thardin Gravity Well',9,'quills','#2e2540','#ff8c1a','#9878ff',['arcane', 'land', 'ruin', 'under']],
    ['vault','Korathen Astralite Vault',9,'crown','#1c1626','#e8c46a','#ffffff',['arcane', 'land', 'ruin', 'under']],
    ['farm','Viridian Farmbelt',27,'tail','#3f8f5f','#e8b830','#fff5db',['land', 'water', 'wild']],
    ['plains','Astrum Plain',2,'glow','#efe2b8','#9878ff','#fff28a',['arcane', 'arid', 'land']],
    ['mountains','Giantland Steps',17,'quills','#5e1c24','#8a8270','#e8c8a8',['arid', 'cold', 'under']],
    ['canyons','Zarvane Canyon',9,'scar','#7d4bb0','#c8843c','#ff8a3a',['arcane', 'arid', 'land', 'ruin', 'under']],
    ['clouds','Elyther Liftfield',23,'crown','#2f7a6a','#d8e8f4','#fff5db',['sky']],
    ['storms','Worldender Stormline',28,'glow','#4a5c98','#8a52b0','#a8e8ff',['arcane', 'sky']],
    ['ruins','Firsts Ruinway',1,'mask','#1c1626','#e8c46a','#dff4fb',['arcane', 'arid', 'ruin']],
    ['temple','Anciuxor Temple Road',1,'crown','#2a2632','#e8c46a','#fff3c8',['arcane', 'arid', 'ruin']],
    ['reef','Pearlward Reef',5,'fins','#2a8a96','#b0e0ff','#fff5db',['water']],
    ['ice','Yvoris Blue Hour',12,'crest','#b8d4e0','#4a78c2','#dff4fb',['cold']],
    ['crystal','Xylos Ray Shelf',24,'rings','#b0e0ff','#fff28a','#ffffff',['arcane', 'under']],
    ['machine','Ferros Rail Foundry',26,'vents','#5cd0ff','#e07a2a','#e8e8e8',['ruin']],
    ['gravity','Gravaron Forcewell',25,'quills','#2e2540','#ff8c1a','#9878ff',['arcane']],
    ['time','Jynaera Pulse Valley',15,'rings','#9b3fa8','#c8b8ff','#fff28a',['arcane']],
    ['resonance','Rhyzor Echo Basin',22,'antennae','#6c80a0','#5cd0ff','#b87cff',['arcane', 'ruin']],
    ['harmony','Halcyra Sharedwater',20,'frill','#2a8a96','#e8c8a8','#fff5db',['water']],
    ['perception','Uralyx Blindside',19,'scar','#7a6aa8','#1c1626','#d8cfa8',['arcane']],
    ['dominion','Myraclese Causeway',10,'crown','#b0904a','#c95c5c','#fff5db',['ruin']],
    ['war','Bellatora Warplain',11,'horns','#7a2424','#8a8270','#ff8a3a',['arid', 'ruin']],
    ['consumption','Velkryn Hunger Basin',17,'quills','#5e1c24','#c8402c','#e8b830',['arid', 'under']],
    ['grid','Cytherion Outer Grid',8,'vents','#24304a','#5cd0ff','#b0e0ff',['ruin']],
    ['origin','Origon Blackglass',1,'glow','#16141c','#e8c46a','#ffffff',['arcane', 'arid']],
    // ★ 2026-10-10 · every world 1–27 holds at least three habitats, named from its canon biome manifest (biomes.js)
    ['lightglassplai','Lightglass Plains',2,'glow','#6930a6','#c653b4','#c1ec93',['arcane', 'arid']],
    ['prismaticshall','Prismatic Shallows',2,'vents','#a64030','#c6af53','#93e0ec',['arcane', 'ruin', 'water']],
    ['dragonlands','Dragonlands',3,'tail','#69a630','#53c668','#c193ec',['heat', 'sky']],
    ['skyforgecliffs','Sky-Forge Cliffs',3,'crest','#306da6','#6453c6','#ecbe93',['heat', 'sky']],
    ['rootsea','Rootsea',4,'fins','#30a650','#53c6be','#ec93d4',['water', 'wild']],
    ['canopylibrarie','Canopy Libraries',4,'frill','#30a63e','#53c6ad','#ec93e1',['wild']],
    ['surfacecathedr','Surface Cathedral',5,'fins','#a6303a','#c69653','#93ece4',['ruin', 'water']],
    ['greathide','Great Hide',6,'frill','#30a654','#53c6c2','#ec93d1',['arid', 'heat', 'wild']],
    ['emberexpansion','Ember Expansion Fields',6,'horns','#a65730','#c6c653','#93ceec',['arid', 'heat']],
    ['greatscaleslop','Great Scale Slopes',7,'mask','#30a654','#53c6c2','#ec93d1',['arid', 'under', 'wild']],
    ['fleshstoneravi','Fleshstone Ravines',7,'antennae','#7730a6','#c653a7','#b6ec93',['arid', 'under']],
    ['collapsebasin','Collapse Basin',7,'antennae','#4e30a6','#bc53c6','#d6ec93',['arid', 'under']],
    ['outergrid','Outer Grid',8,'vents','#a63a30','#c6a953','#93e4ec',['ruin']],
    ['mantiscommons','Mantis Commons',8,'frill','#30a659','#53c4c6','#ec93cd',['ruin', 'wild']],
    ['dominioncausew','Dominion Causeway',10,'vents','#a6303e','#c69253','#93ece1',['ruin']],
    ['enforceddevoti','Enforced Devotion Citadel',10,'glow','#a6303a','#c69653','#93ece4',['arcane', 'ruin']],
    ['queenswarplain','Queen’s Warplain',11,'mask','#a68130','#9dc653','#93afec',['arid', 'ruin']],
    ['clanarenabelt','Clan Arena Belt',11,'vents','#a69030','#8ec653','#93a3ec',['arid', 'ruin']],
    ['frozencity','Frozen City',12,'quills','#a63032','#c69d53','#93ecea',['cold', 'ruin']],
    ['stillwatershel','Stillwater Shelf',12,'fins','#3083a6','#5357c6','#ecad93',['arid', 'cold', 'water']],
    ['carbidedusk','Carbide Dusk',13,'mask','#7730a6','#c653a7','#b6ec93',['arcane', 'arid']],
    ['observerhalls','Observer Halls',13,'vents','#9830a6','#c65387','#9dec93',['arcane', 'ruin']],
    ['hiddenawarenes','Hidden Awareness Corridors',13,'antennae','#6930a6','#c653b4','#c1ec93',['arcane', 'under']],
    ['dispersalplain','Dispersal Plain',14,'vents','#a66130','#bcc653','#93c7ec',['arid', 'ruin']],
    ['fourkingsruins','Four Kings Ruins',14,'vents','#a6303e','#c69253','#93ece1',['arid', 'ruin']],
    ['flickersettlem','Flicker Settlements',15,'vents','#a63038','#c69853','#93ece6',['arcane', 'ruin']],
    ['acceleratedgra','Accelerated Grasslands',15,'frill','#6530a6','#c653b8','#c4ec93',['arcane', 'wild']],
    ['consciousfores','Conscious Forest',16,'frill','#30a63e','#53c6ad','#ec93e1',['wild']],
    ['rootmindcanopy','Rootmind Canopy',16,'glow','#30a63a','#53c6a9','#ec93e4',['arcane', 'wild']],
    ['crimsoniantita','Crimsonian Titanlands',17,'mask','#a67730','#a7c653','#93b6ec',['arid', 'under']],
    ['perpetualignit','Perpetual Ignition',18,'horns','#a65030','#c6be53','#93d4ec',['heat']],
    ['serpentforges','Serpent Forges',18,'horns','#a66730','#b6c653','#93c2ec',['heat']],
    ['warflareplains','Warflare Plains',18,'horns','#a64c30','#c6ba53','#93d7ec',['arid', 'heat']],
    ['softcathedral','Soft Cathedral',19,'glow','#8330a6','#c6539c','#adec93',['arcane', 'ruin']],
    ['attentionplain','Attention Plains',19,'glow','#6730a6','#c653b6','#c2ec93',['arcane', 'arid']],
    ['devotionalsea','Devotional Sea',20,'fins','#306da6','#6453c6','#ecbe93',['water']],
    ['concordharbors','Concord Harbors',20,'vents','#a63052','#c67f53','#93ecd3',['ruin', 'water']],
    ['predatoraeries','Predator Aeries',21,'crest','#3089a6','#535cc6','#eca993',['sky']],
    ['rebirthcliffs','Rebirth Cliffs',21,'glow','#9030a6','#c6538e','#a3ec93',['arcane', 'sky']],
    ['phoenixshell','Phoenix Shell',21,'crest','#3079a6','#5953c6','#ecb593',['sky']],
    ['soundbridges','Sound Bridges',22,'glow','#6530a6','#c653b8','#c4ec93',['arcane', 'ruin']],
    ['vibrationmines','Vibration Mines',22,'antennae','#6f30a6','#c653af','#bcec93',['arcane', 'ruin', 'under']],
    ['floatingcontin','Floating Continents',23,'crest','#3083a6','#5357c6','#ecad93',['sky']],
    ['skypriestroads','Sky Priest Roads',23,'crest','#3094a6','#5368c6','#eca093',['ruin', 'sky']],
    ['frequencyplain','Frequency Plains',24,'glow','#a65b30','#c2c653','#93cbec',['arcane', 'arid', 'under']],
    ['whitecrystalca','White Crystal Caves',24,'antennae','#5430a6','#c253c6','#d1ec93',['arcane', 'under']],
    ['gravityarenas','Gravity Arenas',25,'glow','#a64030','#c6af53','#93e0ec',['arcane', 'ruin']],
    ['stabilizationb','Stabilization Belt',25,'glow','#9630a6','#c65388','#9fec93',['arcane', 'arid']],
    ['irondynasties','Iron Dynasties',26,'vents','#a63054','#c67d53','#93ecd1',['ruin']],
    ['railfoundries','Rail Foundries',26,'vents','#a6304e','#c68353','#93ecd6',['ruin']],
    ['northernregion','Northern Region',27,'tail','#54a630','#53c67d','#d193ec',['water', 'wild']]
  ];
  var variants = [], byWorld = {};
  var zdistrict = { city:'malezor',cavern:'malezor',floodworks:'andrannor',terrace:'veridan',gallery:'netharion',basin:'vorashil',scar:'xilnar',forge:'baelgor',well:'thardin',vault:'korathen' };
  function slug(s){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
  function sourceFor(worldNo, body){
    var sp = FAUNA.species || {}, found = null;
    Object.keys(sp).some(function(id){ var s=sp[id]; if (s.world===worldNo && s.body===body) { found=id; return true; } return false; });
    if (found) return found;
    var fallback = {quad:'otterlin',amph:'verdanix',wing:'aetherwing',spine:'volcanut'};
    return fallback[body];
  }
  habitats.forEach(function(h, hi){
    if (h[2] === 28) return;   // AEP-28 is sealed: nothing of the drift world is landable or described
    bodies.forEach(function(b, bi){
      var fits = compatible(b.key, h[7]);
      var id='zyrex-'+slug(h[1])+'-'+b.key, source=sourceFor(h[2], b.source), tier=Math.min(10, 1 + ((hi + bi) % 8));
      var pattern = PATTERNS[(hi * 5 + bi * 3) % PATTERNS.length], feature2 = FEATURES2[(hi * 7 + bi * 11) % FEATURES2.length];
      ART.registerVariant(id, b.sprite, { feature:h[3], feature2:feature2, pattern:pattern, primary:h[4], secondary:h[5], accent:h[6], accent2:darken(h[6], .25), patternColor:darken(h[4], .38),
        pal:{ i:h[4],j:h[4],I:h[5],x:h[4],q:h[4],Q:h[5],h:h[5],V:h[4],c:h[4],C:h[5],r:h[4],R:h[5],u:h[4],y:h[5], B:h[4],P:h[6],M:h[5],N:darken(h[5], .3),v:h[5] }, note:'Habitat phenotype · '+h[1] });
      var v={id:id,name:h[1]+' '+b.key.toUpperCase(),sprite:id,body:b.key,sourceSpecies:source,worldNo:h[2],habitat:h[0],habitatName:h[1],feature:h[3],feature2:feature2,pattern:pattern,compatible:fits,environments:(h[7] || []).slice(),colors:{primary:h[4],secondary:h[5],accent:h[6]},tier:tier,types:b.types.slice(),canonBasis:'Native '+b.key+' body plan adapted to Codex habitat '+h[1]+'.'};
      var district = h[2] === 9 ? (zdistrict[h[0]] || 'zarvane') : null;
      // battle stats and moves come from the canon body the variant is built on, scaled to its tier
      var src = (FAUNA.species || {})[source] || {}, sb = src.base || { hp:66, atk:66, def:66, spd:66, spc:66 }, tot = 0, base = {};
      Object.keys(sb).forEach(function(k){ tot += sb[k]; });
      Object.keys(sb).forEach(function(k){ base[k] = Math.max(10, Math.round(sb[k] / tot * tier * 333)); });
      var mv = (src.moves || [{ n:'Strike', p:40, s:'A1' }, { n:'Lunge', p:60, s:'A2' }, { n:'Surge', p:90, s:'A3' }]).map(function(m, i){ return { n:m.n, t:b.types[i === 1 ? 1 : 0], p:m.p, s:m.s }; });
      FAUNA.species[id] = { name:v.name, tier:tier, types:b.types.slice(), base:base, moves:mv, body:b.key, col:h[4], col2:h[5], world:h[2], district:district, temperament:src.temperament || 'curious', habitat:'adapted', canon:false, provisional:true, note:v.canonBasis, journal:'A distinct Aethren phenotype recorded in '+h[1]+'.', unknown:'UNCLASSIFIED AETHREN', hidden:!fits, incompatible:!fits || undefined };
      variants.push(v); if (fits) (byWorld[h[2]]||(byWorld[h[2]]=[])).push(v);
      if (D && D.subjects && !D.subjects[id]) { D.subjects[id]={kind:'aethren',set:h[2],term:id,art:id,tier:tier,types:b.types.join(' / '),temperament:FAUNA.species[id].temperament,canonNote:v.canonBasis,journal:'A distinct Aethren phenotype recorded in '+h[1]+'.',hidden:!fits || undefined}; }
      if (D && D.lexicon && !D.lexicon[id]) D.lexicon[id]={unknown:'UNCLASSIFIED AETHREN · '+h[1].toUpperCase(),canon:null};
    });
  });
  window.AOV_AETHREN_VARIANTS={count:variants.filter(function(v){return v.compatible;}).length,total:variants.length,bodyEnv:BODY_ENV,compatible:compatible,rows:variants,byWorld:function(no){return (byWorld[no]||[]).slice();},get:function(id){return variants.find(function(v){return v.id===id;})||null;},spawnPool:function(worldNo,habitat){return variants.filter(function(v){return v.compatible&&v.worldNo===worldNo&&(!habitat||v.habitat===habitat);});}};
})();
