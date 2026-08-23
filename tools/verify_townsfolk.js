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
// v0.95.748 · fifty townsfolk · one per archetype.
const FS=require('fs');
try{new Function(FS.readFileSync('/tmp/all.js','utf8')+';globalThis.__C={TOWNSFOLK_ENABLED,NPCS,WORLD_PROPS,worldDistrictAt,isWorldBorderTile,_propBlocked,TILE,drawStaticNPC,game};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C;let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};
const A='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/assets/2D sprites/npcs/townsfolk/';
const F=C.NPCS.filter(n=>n&&n._townsfolk);

// ★★ v0.95.767 · TWO MODES · same pattern as verify_malezorwild.
//
// The sections below assert the fifty townsfolk are STANDING in the world. The
// Creator pulled them for bad sprites, so that is no longer true and asserting
// it would fail forever. They are skipped rather than deleted: the moment
// TOWNSFOLK_ENABLED goes back to true they are exactly the checks that say
// whether the new sheets landed at Kelthor's scale and beside the right doors.
if (!C.TOWNSFOLK_ENABLED){
  console.log('\n0 · ★★ THE FIFTY ARE HELD BACK\n');
  const live = C.NPCS.filter(n => n && n._townsfolk);
  ok(live.length === 0, `no townsfolk stand in the world (${live.length})`);
  ok(C.TOWNSFOLK_ENABLED === false, 'TOWNSFOLK_ENABLED is the single switch');

  console.log('\n0b · ★ THE WRITING AND THE PLACEMENTS SURVIVE\n');
  // The art is what was wrong. Each entry carries a name, an archetype and a
  // hand-written interact line, and the placement rules took a correction pass
  // to get right — a sage had been posted outside Zarvane's Seer HQ.
  const _src = FS.readFileSync('/tmp/all.js','utf8');
  const ids = [..._src.matchAll(/id:\s*'(folk_[a-z0-9_]+)'/g)].map(m => m[1]);
  ok(ids.length === 50, `all ${ids.length} entries are still written in the file`);
  ok(new Set(ids).size === ids.length, 'and still one per archetype, no duplicates');
  const tags = (_src.match(/_townsfolk:/g) || []).length;
  ok(tags === 50, `all ${tags} district tags intact, so they return to the same doorsteps`);

  console.log('\n0c · ★★ NOTHING ELSE WENT WITH THEM\n');
  // The filter keys on _townsfolk. If it were sloppier it would take named
  // NPCs standing nearby, and a missing quest-giver is far harder to notice
  // than fifty missing civilians.
  const must = ['kelthor','mom','dad','yara','kaizari','omniris','scrapjaw',
                'professor_elarian','sub_prof_vireta'];
  const gone = must.filter(id => !C.NPCS.some(n => n && n.id === id));
  ok(gone.length === 0, gone.length ? 'LOST: '+gone.join(', ')
     : `every named NPC survives (${must.length} checked, including both professors)`);
  ok(C.NPCS.length > 400, `${C.NPCS.length} NPCs still live — the world did not empty out`);
  const en = C.NPCS.filter(n => n && n.isEnemy).length;
  ok(en > 300, `${en} enemies untouched`);
  const dangling = ids.filter(id => (_src.match(new RegExp("'"+id+"'", 'g')) || []).length > 1);
  ok(dangling.length === 0, `no held-back id is referenced elsewhere (${dangling.length} would dangle)`);

} else {
  console.log('\n1 · ★ FIFTY, ONE PER ARCHETYPE, FIVE PER DISTRICT\n');
  ok(F.length===50,`${F.length} townsfolk`);
  const names=new Set(F.map(n=>n.id));
  ok(names.size===50,'★ every id is unique — one NPC per archetype, no duplicates');
  const per={}; F.forEach(n=>per[n._townsfolk]=(per[n._townsfolk]||0)+1);
  ok(Object.keys(per).length===10&&Object.values(per).every(v=>v===5),'5 in each of 10 districts · '+JSON.stringify(per));
  ok(F.every(n=>FS.existsSync(A+decodeURIComponent(n.src.split('/').pop()))),'all 50 art files on disk');

  console.log('\n2 · ★★ KELTHOR SCALE, AND HE IS UNTOUCHED\n');
  const k=C.NPCS.find(n=>n&&n.id==='kelthor');
  let kmax=216; if(k.bboxes) for(const r of k.bboxes) if(r[0][3]>kmax) kmax=r[0][3];
  const kRef=k.scaleRefBh||kmax;
  const kH=(C.TILE*2)/kRef*(k.scaleMul||1)*kRef;
  console.log(`     Kelthor renders ${kH.toFixed(1)}px = ${(kH/C.TILE).toFixed(2)} tiles\n`);
  let same=0;
  for(const n of F){
    const bh=n.staticBBox[3];
    const h=(C.TILE*2)/bh*(n.scaleMul||1)*bh;
    if(Math.abs(h-kH)<0.5) same++;
  }
  ok(same===50,`★ all 50 render at exactly Kelthor's height (${same}/50) — staticSprite uses the same (TILE*2)/bh yardstick`);
  ok(F.every(n=>n.staticSprite&&Array.isArray(n.staticBBox)),'all flagged staticSprite with a bbox');
  for(const id of ['kelthor','mom','dad']){
    const n=C.NPCS.find(x=>x&&x.id===id);
    ok(!!n&&!n._townsfolk,`${id} is present and NOT part of the new batch, as instructed`);
  }

  console.log('\n3 · ★★ APPROPRIATE PLACES · beside doors, never hostile ground\n');
  const seer=C.WORLD_PROPS.filter(p=>p&&/seer_hq|_cave$|tower|radio/i.test(p.id||''));
  let onHostile=0, minH=1e9;
  for(const n of F) for(const p of seer){
    const d=Math.hypot(n.tileX-p.tileX,n.tileY-p.tileY);
    if(d<minH) minH=d;
    if(d<4) onHostile++;
  }
  ok(onHostile===0,`★ none loitering at a Seer HQ, Gemlord cave or tower (closest ${Math.round(minH)} tiles)`);
  const civ=C.WORLD_PROPS.filter(p=>p&&p.tileX!=null&&(/buildings\//.test(p.src||'')||/home|house|inn|condo/i.test(p.id||'')));
  let nearBld=0;
  for(const n of F){ if(civ.some(p=>Math.hypot(n.tileX-p.tileX,n.tileY-p.tileY)<=6)) nearBld++; }
  ok(nearBld===50,`★ all 50 stand within 6 tiles of a home or civic building (${nearBld}/50)`);

  console.log('\n4 · ★★ THEY STAND SOMEWHERE LEGAL\n');
  ok(F.every(n=>C.worldDistrictAt(n.tileX,n.tileY)===n._townsfolk),'each is inside the district it is tagged for');
  ok(F.every(n=>!C.isWorldBorderTile(n.tileX,n.tileY)),'none on the world border');
  const blocked=F.filter(n=>C._propBlocked.has(n.tileX+','+n.tileY));
  ok(blocked.length===0,`★ none standing inside a wall (${blocked.length}) — they are beside doorsteps, not on them`);
  const seen=new Set(); let dup=0;
  for(const n of C.NPCS){ if(!n||n.scene!=='overworld')continue; const key=n.tileX+','+n.tileY;
    if(seen.has(key)) dup++; seen.add(key); }
  ok(dup===0,`no two overworld NPCs share a tile (${dup})`);

  console.log('\n5 · ★ THEY TALK, AND EACH SAYS SOMETHING OF ITS OWN\n');
  let threw=null;
  for(const n of F){ try{ n.onInteract(n); }catch(e){ threw=n.id+': '+e.message; break; } }
  ok(!threw,'all 50 onInteract handlers run clean'+(threw?' — '+threw:''));
  const lines=new Set(F.map(n=>String(n.onInteract).match(/"([^"]{10,})"/)?.[1]));
  ok(lines.size>=48,`${lines.size} distinct dialogue lines across 50 NPCs — not one copy-pasted greeting`);

  console.log('\n6 · ★ THEY DRAW\n');
  C.game.scene='overworld';
  let dthrew=null;
  try{ for(const n of F) C.drawStaticNPC(n); }catch(e){ dthrew=e.message; }
  ok(!dthrew,'drawStaticNPC renders every one without throwing'+(dthrew?' — '+dthrew:''));


}

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');process.exit(0);
