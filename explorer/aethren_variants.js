// ★ 2026-10-09 · AETHREN VARIANTS
// 30 habitat families × 4 native body plans = 120 visibly distinct creatures.
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
    { key:'cephalopod', sprite:'cephalopod', types:['Aquatic','Unknown'], source:'amph' }
  ];
  var habitats = [
    ['sky','Cloudstep Aerie',3,'crest','#5c8aff','#e8c8a8','#fff28a'],
    ['forest','Rootshadow Forest',4,'frill','#2fe6a8','#3aa66e','#d8f8a8'],
    ['water','Firstwater Shelf',5,'fins','#4a78c2','#7ad0d8','#a8e8ff'],
    ['dry','Glasswind Flats',14,'mask','#c8843c','#e8b830','#fff0b0'],
    ['volcanic','Fangfire Caldera',6,'horns','#e05a2a','#7a1a5c','#ffe08a'],
    ['marsh','Mirelight Marsh',27,'antennae','#3a7a58','#7ad0d8','#b87cff'],
    ['swamp','Blackroot Swamp',16,'webbing','#244a3a','#3aa66e','#c8e868'],
    ['city','Haemen Ruin Ward',9,'vents','#c95c5c','#7d4bb0','#e8c878'],
    ['cavern','Malezor Gem Caverns',9,'glow','#7d4bb0','#b0e0ff','#fff28a'],
    ['floodworks','Andrannor Floodworks',9,'fins','#22457c','#4a78c2','#a8e8ff'],
    ['terrace','Veridan Violet Terraces',9,'frill','#7d4bb0','#3aa66e','#e8c8a8'],
    ['gallery','Netharion Crystal Gallery',9,'antennae','#24304a','#b0e0ff','#c8b8ff'],
    ['basin','Vorashil Deep Basin',9,'webbing','#22457c','#7ad0d8','#b87cff'],
    ['scar','Xilnar Corruption Scar',9,'scar','#7a1a5c','#c8402c','#ff8a3a'],
    ['forge','Baelgor Golden Forge',9,'vents','#b0904a','#c8402c','#fff28a'],
    ['well','Thardin Gravity Well',9,'quills','#2e2540','#ff8c1a','#9878ff'],
    ['vault','Korathen Astralite Vault',9,'crown','#1c1626','#e8c46a','#ffffff'],
    ['farm','Viridian Farmbelt',27,'tail','#3f8f5f','#e8b830','#fff5db'],
    ['plains','Astrum Plain',2,'glow','#efe2b8','#9878ff','#fff28a'],
    ['mountains','Giantland Steps',17,'quills','#5e1c24','#8a8270','#e8c8a8'],
    ['canyons','Zarvane Canyon',9,'scar','#7d4bb0','#c8843c','#ff8a3a'],
    ['clouds','Elyther Liftfield',23,'crown','#2f7a6a','#d8e8f4','#fff5db'],
    ['storms','Worldender Stormline',28,'glow','#4a5c98','#8a52b0','#a8e8ff'],
    ['ruins','Firsts Ruinway',1,'mask','#1c1626','#e8c46a','#dff4fb'],
    ['temple','Anciuxor Temple Road',1,'crown','#2a2632','#e8c46a','#fff3c8'],
    ['reef','Pearlward Reef',5,'fins','#2a8a96','#b0e0ff','#fff5db'],
    ['ice','Yvoris Blue Hour',12,'crest','#b8d4e0','#4a78c2','#dff4fb'],
    ['crystal','Xylos Ray Shelf',24,'rings','#b0e0ff','#fff28a','#ffffff'],
    ['machine','Ferros Rail Foundry',26,'vents','#5cd0ff','#e07a2a','#e8e8e8'],
    ['gravity','Gravaron Forcewell',25,'quills','#2e2540','#ff8c1a','#9878ff'],
    ['time','Jynaera Pulse Valley',15,'rings','#9b3fa8','#c8b8ff','#fff28a'],
    ['resonance','Rhyzor Echo Basin',22,'antennae','#6c80a0','#5cd0ff','#b87cff'],
    ['harmony','Halcyra Sharedwater',20,'frill','#2a8a96','#e8c8a8','#fff5db'],
    ['perception','Uralyx Blindside',19,'scar','#7a6aa8','#1c1626','#d8cfa8'],
    ['dominion','Myraclese Causeway',10,'crown','#b0904a','#c95c5c','#fff5db'],
    ['war','Bellatora Warplain',11,'horns','#7a2424','#8a8270','#ff8a3a'],
    ['consumption','Velkryn Hunger Basin',17,'quills','#5e1c24','#c8402c','#e8b830'],
    ['grid','Cytherion Outer Grid',8,'vents','#24304a','#5cd0ff','#b0e0ff'],
    ['origin','Origon Blackglass',1,'glow','#16141c','#e8c46a','#ffffff']
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
    bodies.forEach(function(b, bi){
      var id='zyrex-'+slug(h[1])+'-'+b.key, source=sourceFor(h[2], b.source), tier=Math.min(10, 1 + ((hi + bi) % 8));
      ART.registerVariant(id, b.sprite, { feature:h[3], primary:h[4], secondary:h[5], accent:h[6], pal:{ i:h[4],j:h[4],I:h[5],x:h[4],q:h[4],Q:h[5],h:h[5],V:h[4],c:h[4],C:h[5],r:h[4],R:h[5],u:h[4],y:h[5] }, note:'Habitat phenotype · '+h[1] });
      var v={id:id,name:h[1]+' '+b.key.toUpperCase(),sprite:id,body:b.key,sourceSpecies:source,worldNo:h[2],habitat:h[0],habitatName:h[1],feature:h[3],colors:{primary:h[4],secondary:h[5],accent:h[6]},tier:tier,types:b.types.slice(),canonBasis:'Native '+b.key+' body plan adapted to Codex habitat '+h[1]+'.'};
      var district = h[2] === 9 ? (zdistrict[h[0]] || 'zarvane') : null;
      // battle stats and moves come from the canon body the variant is built on, scaled to its tier
      var src = (FAUNA.species || {})[source] || {}, sb = src.base || { hp:66, atk:66, def:66, spd:66, spc:66 }, tot = 0, base = {};
      Object.keys(sb).forEach(function(k){ tot += sb[k]; });
      Object.keys(sb).forEach(function(k){ base[k] = Math.max(10, Math.round(sb[k] / tot * tier * 333)); });
      var mv = (src.moves || [{ n:'Strike', p:40, s:'A1' }, { n:'Lunge', p:60, s:'A2' }, { n:'Surge', p:90, s:'A3' }]).map(function(m, i){ return { n:m.n, t:b.types[i === 1 ? 1 : 0], p:m.p, s:m.s }; });
      FAUNA.species[id] = { name:v.name, tier:tier, types:b.types.slice(), base:base, moves:mv, body:b.key, col:h[4], col2:h[5], world:h[2], district:district, temperament:src.temperament || 'curious', habitat:'adapted', canon:false, provisional:true, note:v.canonBasis, journal:'A distinct Aethren phenotype recorded in '+h[1]+'.', unknown:'UNCLASSIFIED AETHREN' };
      variants.push(v); (byWorld[h[2]]||(byWorld[h[2]]=[])).push(v);
      if (D && D.subjects && !D.subjects[id]) { D.subjects[id]={kind:'aethren',set:h[2],term:id,art:id,tier:tier,types:b.types.join(' / '),temperament:FAUNA.species[id].temperament,canonNote:v.canonBasis,journal:'A distinct Aethren phenotype recorded in '+h[1]+'.'}; }
      if (D && D.lexicon && !D.lexicon[id]) D.lexicon[id]={unknown:'UNCLASSIFIED AETHREN · '+h[1].toUpperCase(),canon:null};
    });
  });
  window.AOV_AETHREN_VARIANTS={count:variants.length,rows:variants,byWorld:function(no){return (byWorld[no]||[]).slice();},get:function(id){return variants.find(function(v){return v.id===id;})||null;},spawnPool:function(worldNo,habitat){return variants.filter(function(v){return v.worldNo===worldNo&&(!habitat||v.habitat===habitat);});}};
})();
