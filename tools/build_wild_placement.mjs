// ★ v0.95.846 · WILD PLACEMENT MASTER generator · 10 districts × 8 habitats.
// Derives REAL tiles from the live world (district wheel quarters, tree
// density, coastlines, cave doors, towers, Seer HQs), assigns species by
// type-affinity + tier band + temperament, and emits:
//   data/wild_placement.json        (machine · the future seeder reads this)
//   data/WILD_PLACEMENT_MASTER.md   (Creator-readable · doubles as the codex
//                                    asset production list: idle+walk sheets)
// Deterministic (seeded). Existing Creator pins are folded in, never moved.
import fs from 'fs';
const noop=()=>{};
const CTX=new Proxy({},{get:()=>()=>({addColorStop:noop,width:0,height:0,data:[]})});
const el=()=>({style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},width:960,height:540,value:'',textContent:'',innerHTML:'',children:[],childNodes:[],getContext:()=>CTX,appendChild:noop,removeChild:noop,addEventListener:noop,removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,remove:noop,play:()=>Promise.resolve(),pause:noop,querySelector:()=>el(),querySelectorAll:()=>[],getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
try{Object.defineProperty(globalThis,'navigator',{value:{userAgent:'node',getGamepads:()=>[],maxTouchPoints:0},configurable:true});}catch(_){}
Object.assign(globalThis,{setInterval:()=>0,setTimeout:()=>0,clearInterval:noop,clearTimeout:noop,
 addEventListener:noop,removeEventListener:noop,window:globalThis,
 document:{getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener:noop,body:el(),documentElement:el(),head:el(),hidden:false,visibilityState:'visible'},
 localStorage:{getItem:()=>null,setItem:noop,removeItem:noop},
 Audio:function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,cloneNode(){return this}}},
 Image:function(){return{addEventListener:noop,complete:false,naturalWidth:0,src:''}},
 requestAnimationFrame:()=>0,cancelAnimationFrame:noop,
 matchMedia:()=>({matches:false,addEventListener:noop,addListener:noop}),

 performance:{now:()=>Date.now()},getComputedStyle:()=>({getPropertyValue:()=>''})});
const html=fs.readFileSync(new URL('../rp7b.html',import.meta.url),'utf8');
let all=''; const re=/<script[^>]*>([\s\S]*?)<\/script>/g; let m;
while((m=re.exec(html))) all+=m[1]+'\n';
new Function(all+';globalThis.__C={SPECIES,SUMMONABLE_SPRITES,TOWER_NETWORK,WORLD_PROPS,MALEZOR_WILD_FIXED,DISTRICT_WHEEL,wheelQuarterAt,worldDistrictAt,isWorldLandTile,isWorldBorderTile,_propBlocked,walkable,requiredBondForTier};')();
const C=globalThis.__C;

// deterministic rng
let _s=0xA0F5EED1; const rng=()=>{ _s^=_s<<13; _s^=_s>>>17; _s^=_s<<5; _s>>>=0; return _s/4294967296; };

const DISTS=C.DISTRICT_WHEEL.map(w=>w.dist);
const LAND_TYPE={malezor:'Beast',zarvane:'Aura',andrannor:'Creature',veridan:'Nature',netharion:'Unknown',
 vorashil:'Extraterrestrial',xilnar:'Spirit',baelgor:'Humanoid',thardin:'Tech',korathen:'Ultramax'};
// ★ v0.95.859 · NATURAL SCALING · Creator: "I want rizer to naturally scale
// with zyrex per district, with zyrex being a little stronger to push comp."
// District i spans Rizer levels ~(i-1)x10..(i)x10; the district's MAIN wild
// tier is T(i) — level i x 10, the level Rizer LEAVES with — so the local
// wilds sit a step ahead of him the whole time he is there.  Easy habitats
// run one tier under, hard habitats hold the full band.  Capped at T7.
// Rizer grows ~5-10 levels per district (Creator) → exit level ≈ 5 + 7.5·i.
// Wild tier tracks that curve one step AHEAD (level = tier×10):
//   d1 exit ~12 → T1 wilds (Lv10 while he's 5-12)   d6 exit ~50 → T5
//   d2 exit ~20 → T1-2                              d7 exit ~57 → T5-6
//   d3 exit ~27 → T2-3                              d8 exit ~65 → T6
//   d4 exit ~35 → T3-4                              d9 exit ~72 → T6-7
//   d5 exit ~42 → T4                                d10 exit ~80 → T7 (cap ·
//   T8+ never spawns wild — end-of-game specials)
const TIER_BAND={malezor:[1,1],zarvane:[1,2],andrannor:[2,3],veridan:[3,4],netharion:[4,4],
 vorashil:[4,5],xilnar:[5,5],baelgor:[5,6],thardin:[6,6],korathen:[6,7]};
// anchors
const anchors={};
for(const T of C.TOWER_NETWORK){ anchors[T.dist]={tower:T.tower.slice()}; }
for(const p of C.WORLD_PROPS){
  if(p&&/_cave$/.test(p.id||'')){ const d=(C.worldDistrictAt(p.tileX,p.tileY)||'').toString(); if(anchors[d]) anchors[d].cave=[p.tileX,p.tileY]; }
  if(p&&p._seerHqOf){ const d=p._seerHqOf; if(anchors[d]) anchors[d].hq=[p.tileX,p.tileY]; }
}
for(const d of DISTS){ const a=anchors[d]; const pts=[a.tower,a.cave,a.hq].filter(Boolean);
  a.c=[Math.round(pts.reduce((s,p)=>s+p[0],0)/pts.length), Math.round(pts.reduce((s,p)=>s+p[1],0)/pts.length)]; }

const trees=C.WORLD_PROPS.filter(p=>p&&p.src&&/(tree|cactus)/.test(p.src)&&p.tileX!=null);
const treeNear=(x,y,r)=>trees.reduce((n,t)=>n+(Math.abs(t.tileX-x)<=r&&Math.abs(t.tileY-y)<=r?1:0),0);
const coastNear=(x,y,r)=>{for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++){if(!C.isWorldLandTile(x+dx,y+dy))return true;}return false;};
const legal=(d,x,y)=>C.worldDistrictAt(x,y)===d&&C.isWorldLandTile(x,y)&&!C.isWorldBorderTile(x,y)&&!C._propBlocked.has(x+','+y)&&C.walkable(x,y);
const bearingOf=(cx,cy,x,y)=>{const a=Math.atan2(y-cy,x-cx)*180/Math.PI;const dirs=[['E',0],['SE',45],['S',90],['SW',135],['W',180],['NW',225],['N',270],['NE',315]];let best='E',bd=1e9;for(const[n,deg]of dirs){let dd=Math.abs(((a-deg)%360+360)%360);dd=Math.min(dd,360-dd);if(dd<bd){bd=dd;best=n;}}return best;};

const chosen=[];   // [x,y] of all placements incl. existing pins
const EXISTING=[['anciuxor',22,-19,'malezor'],['elzoran',5,28,'malezor'],['voltaryn',15,214,'zarvane'],
 ['voltigrax',212,196,'andrannor'],['apexaur',71,231,'zarvane']];
for(const[,x,y]of EXISTING) chosen.push([x,y]);
const farFromChosen=(x,y)=>chosen.every(([a,b])=>Math.max(Math.abs(a-x),Math.abs(b-y))>=10);

function findTile(d,hab){
  const A=anchors[d], [cx,cy]=A.c;
  const tryPt=(x,y,cond)=>legal(d,x,y)&&farFromChosen(x,y)&&cond(x,y)?[x,y]:null;
  for(let i=0;i<4000;i++){
    let x,y,cond;
    if(hab==='hub_fringe'){ const a=rng()*Math.PI*2,r=12+rng()*10; x=Math.round(cx+Math.cos(a)*r); y=Math.round(cy+Math.sin(a)*r); cond=(x,y)=>treeNear(x,y,5)<=3; }
    else if(hab==='meadow'){ const a=rng()*Math.PI*2,r=25+rng()*35; x=Math.round(cx+Math.cos(a)*r); y=Math.round(cy+Math.sin(a)*r);
      cond=(x,y)=>C.wheelQuarterAt(d,bearingOf(cx,cy,x,y))==='open'&&treeNear(x,y,6)<=2; }
    else if(hab==='forest'){ const a=rng()*Math.PI*2,r=15+rng()*85; x=Math.round(cx+Math.cos(a)*r); y=Math.round(cy+Math.sin(a)*r);
      cond=(x,y)=>treeNear(x,y,7)>=5; }
    else if(hab==='waterside'){ const a=rng()*Math.PI*2,r=10+rng()*95; x=Math.round(cx+Math.cos(a)*r); y=Math.round(cy+Math.sin(a)*r);
      cond=(x,y)=>coastNear(x,y,3); }
    else if(hab==='highland'){ const a=rng()*Math.PI*2,r=30+rng()*80; x=Math.round(cx+Math.cos(a)*r); y=Math.round(cy+Math.sin(a)*r);
      cond=(x,y)=>C.wheelQuarterAt(d,bearingOf(cx,cy,x,y))==='highland'; }
    else if(hab==='cave_mouth'){ if(!A.cave) return null; const a=rng()*Math.PI*2,r=8+rng()*6; x=Math.round(A.cave[0]+Math.cos(a)*r); y=Math.round(A.cave[1]+Math.sin(a)*r); cond=()=>true; }
    else if(hab==='wild_fringe'){ if(!A.hq) return null; const a=rng()*Math.PI*2,r=10+rng()*8; x=Math.round(A.hq[0]+Math.cos(a)*r); y=Math.round(A.hq[1]+Math.sin(a)*r); cond=()=>true; }
    else { const a=rng()*Math.PI*2,r=6+rng()*6; x=Math.round(A.tower[0]+Math.cos(a)*r); y=Math.round(A.tower[1]+Math.sin(a)*r); cond=()=>true; }   // landmark
    const p=tryPt(x,y,cond); if(p){ chosen.push(p); return p; }
  }
  return null;
}

// species pool
// ★ v0.95.859 · the pool is the LOCKED ROSTER V1 (Creator handoff · 210) —
// minus: starters + their lines (Dad's gifts), the Elzebub line (story),
// already-pinned wilds, and EVERYTHING T8+ ("save high level zyrex for end
// of game": T8 immortals are planet gods or evolution-only; T9-10 have no
// encounters until Part 2's end · Athrenology canon).
const ROSTER=JSON.parse(fs.readFileSync(new URL('../data/staple_roster_v1.json',import.meta.url))).species;
const EXCLUDE_NAMES=new Set(['Anciuxor','Elzoran','Omegoran','Otterlin','Verdanix','Volcanut',
 'Volcaxor','Voltaryn','Voltigrax','Apexaur','Orivora','Lumelys','Draghoul',
 'Abominalys','Abyssion','Aetherion','Aethravax','Alphaea','Azyrath']);
const _liveByName={};
for(const k of Object.keys(C.SPECIES)) _liveByName[(C.SPECIES[k].name||'').toLowerCase()]=k;
const pool=ROSTER.filter(r=>r.tier<=7&&!EXCLUDE_NAMES.has(r.name)).map(r=>({
  id:_liveByName[r.name.toLowerCase()]||('v1_'+r.name.toLowerCase().replace(/[^a-z0-9]+/g,'_')),
  name:r.name,tier:r.tier,
  type:r.types.split('/')[0]||null,type2:r.types.split('/')[1]||null,type3:r.types.split('/')[2]||null,
  live:!!_liveByName[r.name.toLowerCase()],
}));
const usage={};
const NEIGH={}; DISTS.forEach((d,i)=>{NEIGH[d]=[DISTS[i-1],DISTS[i+1]].filter(Boolean);});
function pickSpecies(d,lo,hi){
  // progressive relaxation: widen the tier window, then lift the reuse cap —
  // a slot with a slightly-off tier beats an empty habitat, and the doc marks
  // tier drift for the Creator to re-cast when new species land.
  for(const [dlo,dhi,cap] of [[lo,hi,2],[Math.max(1,lo-1),Math.min(8,hi+1),2],[Math.max(1,lo-1),Math.min(8,hi+1),4]]){
    const c=pool.filter(s=>s.tier>=dlo&&s.tier<=dhi&&(usage[s.id]||0)<cap);
    if(c.length) return _score(d,c,lo,hi);
  }
  return null;   // → the slot becomes an OPEN COMMISSION for a NEW species
}
function _score(d,cand,lo,hi){
  const scored=cand.map(s=>{
    let sc=rng()*0.5;
    const types=[s.type,s.type2,s.type3].filter(Boolean);
    if(types.includes(LAND_TYPE[d])) sc+=3;
    for(const n of NEIGH[d]) if(types.includes(LAND_TYPE[n])) sc+=1.2;
    if(s.tier>=lo&&s.tier<=hi) sc+=1.5;         // in-band preferred
    sc-=(usage[s.id]||0)*0.8;
    return [sc,s];
  }).sort((a,b)=>b[0]-a[0]);
  const s=scored[0][1]; usage[s.id]=(usage[s.id]||0)+1; return s;
}
const HABS=[
 ['hub_fringe','Skittish','lo','steps outside the hub lamplight · flees a clumsy approach'],
 ['meadow','Calm','lo','grazing the open road quarter · never flees, waits on your bond'],
 ['landmark','Dominant','mid','holds the tower plaza · unimpressed until you are worth it'],
 ['waterside','Calm','mid','works the water\'s edge'],
 ['forest','Wary','mid','deep canopy · backs away watching, LEAVES if refused'],
 ['wild_fringe','Wary','mid','prowls the Seer quarter fringe · dangerous ground'],
 ['highland','Territorial','hi','the high quarter · holds its ground, will not yield'],
 ['cave_mouth','Territorial','hi','at the Gemlord\'s doorstep · the hardest walk in the district'],
];
const out={generated:new Date().toISOString().slice(0,10),slots:[]};
for(const d of DISTS){
  const [lo,hi]=TIER_BAND[d];
  for(const [hab,temp,band,note] of HABS){
    const tlo=band==='lo'?lo:band==='mid'?lo:Math.min(hi,lo+1);
    const thi=band==='lo'?Math.min(hi,lo+1):band==='mid'?hi:Math.min(8,hi+1);
    const tile=findTile(d,hab);
    const sp=pickSpecies(d,tlo,thi)||pickSpecies(d,Math.max(1,tlo-1),Math.min(8,thi+1));
    if(!tile){ out.slots.push({dist:d,habitat:hab,status:'NO TILE',species:sp?sp.id:null}); continue; }
    if(!sp){
      out.slots.push({dist:d,habitat:hab,status:'OPEN',tile,temperament:temp,
        wantTier:`T${tlo}-T${thi}`,wantType:LAND_TYPE[d],note});
      continue;
    }
    const drift=sp&&(sp.tier<tlo||sp.tier>thi);
    out.slots.push({dist:d,habitat:hab,species:sp.id,name:sp.name,tier:sp.tier,
      types:[sp.type,sp.type2,sp.type3].filter(Boolean).join('/'),
      level:sp.tier*10,bondPct:Math.round(C.requiredBondForTier(sp.tier)/3330*100),
      temperament:temp,tile,note:note+(drift?' · ⚠ tier off-band (recast when new species land)':''),
      status:(sp.live&&C.SUMMONABLE_SPRITES[sp.id])?'LIVE':'NEEDS ART'});
  }
}
for(const [id,x,y,d] of EXISTING){
  const sp=C.SPECIES[id];
  out.slots.push({dist:d,habitat:'creator_pinned',species:id,name:sp.name,tier:sp.tier,
    types:[sp.type,sp.type2,sp.type3].filter(Boolean).join('/'),level:sp.tier*10,
    bondPct:Math.round(C.requiredBondForTier(sp.tier)/3330*100),temperament:'(as placed)',
    tile:[x,y],note:'CREATOR-PLACED · already live in MALEZOR_WILD_FIXED · never moved by this table',status:'PLACED'});
}
fs.writeFileSync(new URL('../data/wild_placement.json',import.meta.url),JSON.stringify(out,null,1));

// markdown
const needArt=[...new Set(out.slots.filter(s=>s.status==='NEEDS ART').map(s=>s.species))].sort();
const opens=out.slots.filter(s=>s.status==='OPEN');
const live=[...new Set(out.slots.filter(s=>s.status==='LIVE').map(s=>s.species))].sort();
let md=`# WILD PLACEMENT MASTER · 10 districts × 8 habitats\n**Generated ${out.generated} · deterministic · tiles probed against the live world (walkable · in-district · off-collision · ≥10 tiles apart)**\n\nRarity = ACCESS, not dice: hub-fringe/meadow are the easy meets, highland/cave-mouth are the earned ones. Level = tier × 10 (the law). Bond % = the standard tier gate. Temperament drives behavior exactly as shipped (Calm grazes · Skittish/Wary flee · Territorial/Dominant hold).\n\n`;
for(const d of DISTS){
  md+=`## ${d.toUpperCase()} · ${C.DISTRICT_WHEEL.find(w=>w.dist===d).land} · band T${TIER_BAND[d][0]}-T${TIER_BAND[d][1]}\n\n`;
  md+=`| habitat | species | tier · types | Lv | bond | temperament | tile | status |\n|---|---|---|---|---|---|---|---|\n`;
  for(const s of out.slots.filter(s=>s.dist===d)){
    if(s.status==='NO TILE'){ md+=`| ${s.habitat} | ${s.species?'('+s.species+')':'—'} | — | — | — | — | — | ⚠ no legal tile found |\n`; continue; }
    if(s.status==='OPEN'){ md+=`| ${s.habitat} | 🆕 OPEN COMMISSION | want ${s.wantTier} · ${s.wantType}-leaning | — | — | ${s.temperament} | (${s.tile[0]},${s.tile[1]}) | design a NEW species |\n`; continue; }
    md+=`| ${s.habitat} | **${s.name}** | T${s.tier} · ${s.types} | ${s.level} | ${s.bondPct}% | ${s.temperament} | (${s.tile[0]},${s.tile[1]}) | ${s.status==='LIVE'?'✅ LIVE':s.status==='PLACED'?'★ PLACED':'🎨 NEEDS ART'} |\n`;
  }
  md+='\n';
}
md+=`## CODEX ASSET PRODUCTION LIST\n\nPer the Creator: **idle + walking sheets per species** so wilds can stand, graze, be bonded, and companionize.\n**Sheet spec (canon):** 1254×1254 · 4×4 grid · 313px cells · rows DOWN/LEFT/RIGHT/UP · neon-green or magenta key · one character per cell, overflow allowed (component-ownership slicing handles it).\n\n**NEEDS ART — idle + walk (${needArt.length} species):**\n${needArt.map(id=>{const p=pool.find(x=>x.id===id)||{name:id,tier:'?'};return `- ${p.name} (\`${id}\`) · T${p.tier} · ${[p.type,p.type2].filter(Boolean).join('/')}`;}).join('\n')}\n\n**ALREADY LIVE (${live.length} species):** ${live.join(', ')}

**🆕 OPEN COMMISSIONS — the pool has no species for these slots (${opens.length}):**
Design NEW Zyrex in codex for each (this is the wild-roster half of the 83-solos backlog):
${opens.map(o=>`- ${o.dist.toUpperCase()} · ${o.habitat} · wants **${o.wantTier}**, ${o.wantType}-leaning · ${o.temperament} · tile (${o.tile[0]},${o.tile[1]})`).join('\n')}\n\nDrop the sheets here as they finish — each one lights up its slots; nothing spawns until you approve the wave.\n`;
fs.writeFileSync(new URL('../data/WILD_PLACEMENT_MASTER.md',import.meta.url),md);
const ok=out.slots.filter(s=>s.status!=='UNPLACEABLE').length;
console.log(`slots: ${out.slots.length} · placed: ${ok} · need art: ${needArt.length} species · live: ${live.length}`);
console.log('unplaceable:',out.slots.filter(s=>s.status==='UNPLACEABLE').map(s=>s.dist+'/'+s.habitat).join(', ')||'none');
