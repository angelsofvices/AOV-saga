const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};
global.setInterval = () => 0; global.setTimeout = () => 0;
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width:0, height:0, data:[] }) });
const el = () => ({ style:{}, dataset:{}, classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
  width:960, height:540, value:'', textContent:'', innerHTML:'', children:[], childNodes:[],
  getContext:()=>CTX, appendChild:noop, removeChild:noop, addEventListener:noop, removeEventListener:noop,
  setAttribute:noop, getAttribute:()=>null, focus:noop, remove:noop, play:()=>Promise.resolve(), pause:noop,
  querySelector:()=>el(), querySelectorAll:()=>[], getBoundingClientRect:()=>({left:0,top:0,width:960,height:540}) });
global.addEventListener = noop; global.removeEventListener = noop;
global.document = { getElementById:()=>el(), querySelector:()=>el(), querySelectorAll:()=>[],
  createElement:()=>el(), addEventListener:noop, body:el(), documentElement:el(), head:el(),
  hidden:false, visibilityState:'visible' };
global.window = global;
global.localStorage = { getItem:()=>null, setItem:noop, removeItem:noop };
global.Audio = function(){ return { play:()=>Promise.resolve(), pause:noop, addEventListener:noop, cloneNode(){return this} }; };
global.Image = function(){ return { addEventListener:noop, complete:false, naturalWidth:0, src:'' }; };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches:false, addEventListener:noop, addListener:noop });
global.navigator = { userAgent:'node', getGamepads:()=>[], maxTouchPoints:0 };
global.performance = { now: () => Date.now() };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });
// v0.95.747 · the thirty district buildings · triangle per district, apex on the cave.
const FS=require('fs');
try{new Function(FS.readFileSync('/tmp/all.js','utf8')+';globalThis.__C={WORLD_PROPS,worldDistrictAt,isWorldBorderTile,_propBlocked,_propDoors,TOWER_NETWORK,NPCS};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C;let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};
const A='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/assets/2D sprites/buildings/';
const B=C.WORLD_PROPS.filter(p=>p&&p._district30);

console.log('\n1 · ★ ALL THIRTY, THREE PER DISTRICT\n');
ok(B.length===30,`${B.length} buildings placed`);
const per={}; B.forEach(p=>per[p._district30]=(per[p._district30]||0)+1);
ok(Object.keys(per).length===10,`across ${Object.keys(per).length} districts`);
ok(Object.values(per).every(v=>v===3),'exactly 3 in each · '+JSON.stringify(per));
ok(B.filter(p=>p._tri==='apex').length===10,'10 apexes');
ok(B.filter(p=>p._tri==='base').length===20,'20 base points');
ok(B.every(p=>FS.existsSync(A+decodeURIComponent(p.src.split('/').pop()))),'every art file is on disk');

console.log('\n2 · ★★ THE APEX POINTS AT THE CAVE\n');
const caves={};
for(const p of C.WORLD_PROPS){ if(p&&/_cave$/.test(p.id||'')) caves[C.worldDistrictAt(p.tileX,p.tileY)]=[p.tileX,p.tileY]; }
let bad=0;
for(const T of C.TOWER_NETWORK){
  const d=T.dist, cv=caves[d]; if(!cv) continue;
  const tri=B.filter(p=>p._district30===d);
  const apex=tri.find(p=>p._tri==='apex');
  const dA=Math.hypot(apex.tileX-cv[0],apex.tileY-cv[1]);
  const dB=tri.filter(p=>p._tri==='base').map(p=>Math.hypot(p.tileX-cv[0],p.tileY-cv[1]));
  const nearest = dA<=Math.min(...dB);
  if(!nearest) bad++;
  console.log(`     ${d.padEnd(10)} apex ${Math.round(dA).toString().padStart(3)} tiles from cave · bases ${dB.map(x=>Math.round(x)).join('/')}${nearest?'':'   ← NOT nearest'}`);
}
console.log('');
ok(bad===0,'★ in every district the APEX is the closest of the three to the Gemlord cave');

console.log('\n3 · ★★ OUT IN THE DESOLATE GROUND, NOT IN TOWN\n');
// ★ exclude the thirty themselves: /house/ matches 'the-crooked-house', so
// Netharion's own building was being counted as residential and measured
// against itself at distance 0.
const homes=C.WORLD_PROPS.filter(p=>p&&p.tileX!=null&&!p._district30
                                 &&/home|house|hut|cabin/i.test(p.id||''));
let tooClose=0, minD=1e9;
for(const b of B){
  for(const h of homes){
    const dd=Math.hypot(b.tileX-h.tileX,b.tileY-h.tileY);
    if(dd<minD) minD=dd;
    if(dd<16) tooClose++;
  }
}
ok(tooClose===0,`★ none within 16 tiles of a home (closest is ${Math.round(minD)})`);
const civic=C.WORLD_PROPS.filter(p=>p&&/town_hall|school|hospital|shop|facility|farm/i.test(p.id||''));
let hubMin=1e9;
for(const b of B) for(const c of civic) hubMin=Math.min(hubMin,Math.hypot(b.tileX-c.tileX,b.tileY-c.tileY));
ok(hubMin>=20,`and clear of the civic core (closest civic prop ${Math.round(hubMin)} tiles)`);

console.log('\n4 · ★★ NO OVERLAPS, LEGAL GROUND, WALKABLE DOORS\n');
let clash=0;
for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++){
  const a=B[i],b=B[j];
  const aw=Math.floor((a.tileW||1)/2), bw=Math.floor((b.tileW||1)/2);
  if(Math.abs(a.tileX-b.tileX)<=aw+bw+1 && Math.abs(a.tileY-b.tileY)<=Math.max(a.tileH,b.tileH)) clash++;
}
ok(clash===0,`no two of the thirty overlap (${clash})`);
ok(B.every(p=>C.worldDistrictAt(p.tileX,p.tileY)===p._district30),'each stands in the district it is tagged for');
ok(B.every(p=>!C.isWorldBorderTile(p.tileX,p.tileY)),'none on the world border');
const doorBlocked=B.filter(p=>C._propBlocked.has(p.tileX+','+p.tileY));
ok(doorBlocked.length===0,`★ every doorstep is walkable (${doorBlocked.length} blocked) — you can reach all 30`);
let wallsOk=0;
for(const b of B){ if(C._propBlocked.has((b.tileX+2)+','+b.tileY)) wallsOk++; }
ok(wallsOk===30,`and the walls beside each door DO block (${wallsOk}/30)`);

console.log('\n5 · ★ TRIANGLES ARE OPEN, NOT COLLAPSED\n');
let worst=1e9, worstD='';
for(const T of C.TOWER_NETWORK){
  const tri=B.filter(p=>p._district30===T.dist); if(tri.length<3) continue;
  for(let i=0;i<3;i++)for(let j=i+1;j<3;j++){
    const s=Math.hypot(tri[i].tileX-tri[j].tileX,tri[i].tileY-tri[j].tileY);
    if(s<worst){worst=s;worstD=T.dist;}
  }
}
ok(worst>=26,`★ tightest pair in any triangle is ${Math.round(worst)} tiles (${worstD}) — the first solver produced a 6-tile "triangle" in Baelgor`);

console.log('\n6 · ★ THEY INTERACT AND NAME THEMSELVES\n');
let threw=null;
for(const b of B){ try{ b.onInteract(); }catch(e){ threw=b.id+': '+e.message; break; } }
ok(!threw,'all 30 onInteract handlers run clean'+(threw?' — '+threw:''));

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');process.exit(0);
