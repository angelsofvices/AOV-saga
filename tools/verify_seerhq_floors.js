// Headless smoke test for rp7b.html — evaluates the whole script against a
// stubbed browser surface, then calls the combat/roster functions directly.
const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');

const noop = () => {};
global.setInterval=()=>0; global.setTimeout=(f,t)=>0; global.clearInterval=noop; global.clearTimeout=noop;
function makeCtx() {
  const c = {};
  const methods = ['save','restore','beginPath','closePath','moveTo','lineTo','arc','arcTo','rect',
    'fill','stroke','fillRect','strokeRect','clearRect','fillText','strokeText','drawImage','translate',
    'rotate','scale','setTransform','resetTransform','clip','createLinearGradient','createRadialGradient',
    'createPattern','putImageData','getImageData','measureText','ellipse','quadraticCurveTo','bezierCurveTo',
    'setLineDash','transform'];
  for (const m of methods) c[m] = () => ({ addColorStop: noop, data: [], width: 0, height: 0 });
  c.measureText = () => ({ width: 10 });
  c.canvas = { width: 960, height: 540 };
  return c;
}
const CTX = makeCtx();
function makeEl() {
  const el = {
    style: {}, dataset: {}, classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    width: 960, height: 540, value: '', textContent: '', innerHTML: '', checked: false,
    children: [], childNodes: [], clientWidth: 960, clientHeight: 540,
    getContext: () => CTX, appendChild: noop, removeChild: noop, insertBefore: noop,
    addEventListener: noop, removeEventListener: noop, setAttribute: noop, getAttribute: () => null,
    removeAttribute: noop, focus: noop, blur: noop, click: noop, remove: noop, closest: () => null,
    querySelector: () => makeEl(), querySelectorAll: () => [],
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 540, right: 960, bottom: 540 }),
    scrollIntoView: noop, scrollTo: noop, scrollTop: 0,
  };
  return el;
}
global.addEventListener = noop; global.removeEventListener = noop;
global.document = {
  getElementById: () => makeEl(), querySelector: () => makeEl(), querySelectorAll: () => [],
  createElement: () => makeEl(), createTextNode: () => ({}), addEventListener: noop,
  removeEventListener: noop, body: makeEl(), documentElement: makeEl(), head: makeEl(),
  hidden: false, visibilityState: 'visible', activeElement: null, fullscreenElement: null,
};
global.window = global;
global.localStorage = { _d: {}, getItem(k){ return this._d[k] ?? null; }, setItem(k,v){ this._d[k]=String(v); },
  removeItem(k){ delete this._d[k]; }, clear(){ this._d = {}; } };
global.Audio = function(){ return { play: () => Promise.resolve(), pause: noop, load: noop,
  addEventListener: noop, removeEventListener: noop, cloneNode(){ return this; },
  volume: 1, currentTime: 0, duration: 0, paused: true }; };
global.Image = function(){ return { addEventListener: noop, removeEventListener: noop,
  complete: false, naturalWidth: 0, naturalHeight: 0, width: 0, height: 0, src: '' }; };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches: false, addEventListener: noop, removeEventListener: noop, addListener: noop });
global.navigator = { userAgent: 'node', getGamepads: () => [], maxTouchPoints: 0, vibrate: noop };
global.performance = { now: () => 0 };
global.alert = noop; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => ({ getPropertyValue: () => '' });

const EXPORT = ';globalThis.__C={NPCS,SEER_HQ_NETWORK,game,player,interiorConfig,INTERIOR_SEER_HQ_B,INTERIOR_SEER_HQ_1F,INTERIOR_SEER_HQ_2F,hasSeerKey,grantSeerKey,seerHqDistrict,seerHqChestOpened,tryOpenSeerHqChest,refreshSeerCommander,SEER_COMMANDER_ART,SEER_COMMANDER_NAME,SEER_GRUNT_ART,seerGruntSheet,findNpcById,SEER_HQ_CHEST_TILE,SEER_HQ_CHEST_SCENE,saveGame,seerCommanderBeaten};';
try {
  new Function(src + EXPORT)();
} catch(e){ console.log('boot error:', e.message.slice(0,200)); }
const fs2=require('fs'); const src2=fs2.readFileSync('/tmp/all.js','utf8');
let f=0; const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const C=globalThis.__C;
ok(!!C,'script evaluated and exported probes');
if(!C){ console.log('\n❌ cannot continue'); process.exit(0); }

console.log('\n1 · ★ THREE FLOORS, ONE BUILDING, TEN DOORS\n');
for(const k of ['interior_seer_hq_b','interior_seer_hq_1f','interior_seer_hq_2f'])
  ok(!!C.interiorConfig(k), `${k} is registered in interiorConfig()`);
const B=C.INTERIOR_SEER_HQ_B, F1=C.INTERIOR_SEER_HQ_1F, F2=C.INTERIOR_SEER_HQ_2F;
console.log(`     vault ${B.cols}x${B.rows} · hall ${F1.cols}x${F1.rows} · command ${F2.cols}x${F2.rows}`);
ok(B.cols*B.rows < F1.cols*F1.rows, 'the vault is smaller than the hall — you go down for one thing');
ok(F2.cols*F2.rows < F1.cols*F1.rows, 'and the command floor is smaller still — one room, one person');
ok(B.exit===null && F2.exit===null, 'neither the vault nor the top floor opens onto the street');
ok(F1.autoExit===true, 'only the hall does · the building has ONE door');

console.log('\n2 · ★★ STAIRS · a floor may now have more than one\n');
console.log('     The old cfg.stairs could describe exactly one staircase. The');
console.log('     hall needs two — down to the vault, up to the Commander.\n');
ok(Array.isArray(F1.stairsList) && F1.stairsList.length===2, `the hall has 2 staircases (${(F1.stairsList||[]).length})`);
ok(/stairsList/.test(src2) && /_cfg\.stairs \? \[_cfg\.stairs\] : \[\]/.test(src2),
   'the tick reads stairsList AND still honours the old single `stairs` — no other interior changes');
const down=F1.stairsList.find(x=>x.target==='interior_seer_hq_b');
const up  =F1.stairsList.find(x=>x.target==='interior_seer_hq_2f');
ok(!!down && !!up, 'one goes down to the vault, one goes up to command');
// every staircase must land somewhere its own floor can hold
function inBounds(cfg,p){ return p.x>=0 && p.y>=0 && p.x<cfg.cols && p.y<cfg.rows; }
const LINKS=[[F1,down,B],[F1,up,F2],[B,B.stairsList[0],F1],[F2,F2.stairsList[0],F1]];
let badSpawn=0;
for(const [from,st,to] of LINKS){
  if(!inBounds(to,st.spawnAt)){ badSpawn++; console.log(`     ${st.target} spawn (${st.spawnAt.x},${st.spawnAt.y}) is outside ${to.cols}x${to.rows}`); }
  for(const [tx,ty] of st.triggers)
    if(!inBounds(from,{x:tx,y:ty})){ badSpawn++; console.log(`     trigger (${tx},${ty}) is outside its own floor`); }
}
ok(badSpawn===0, `every staircase lands INSIDE the floor it targets (${badSpawn} bad)`);
// and the round trip must not drop you back onto a trigger tile (infinite loop)
let pingpong=0;
for(const [from,st,to] of LINKS){
  const back=(to.stairsList||[]).find(x=>x.target)||null;
  if(!back) continue;
  for(const [tx,ty] of back.triggers)
    if(st.spawnAt.x===tx && st.spawnAt.y===ty){ pingpong++; console.log(`     ${st.target}: you land ON the return trigger`); }
}
ok(pingpong===0, `no staircase drops you onto the return trigger (${pingpong}) — that is an infinite loop`);

console.log('\n2b · ★★ EVERY STAIRCASE IS VISIBLE · v0.95.703\n');
console.log('     The decor pass read cfg.stairs — the OLD single-stair field —');
console.log('     so the Seer HQ, whose stairs live in stairsList, had four');
console.log('     working triggers and no art anywhere in the building.');
console.log('     Invisible stairs you fall through are worse than no stairs.\n');
ok(/Array\.isArray\(cfg\.stairsList\)\s*\n?\s*\?\s*cfg\.stairsList/.test(src2),
   'the decor pass iterates stairsList, not just cfg.stairs');
const ALL=[[B,'vault'],[F1,'hall'],[F2,'command']];
let noArt=[], badArt=[];
for(const [cfg,label] of ALL){
  for(const st of (cfg.stairsList||[])){
    if(st.visX==null){ noArt.push(`${label} -> ${st.target}`); continue; }
    // art must sit ON its own triggers: every trigger tile should fall inside
    // the drawn footprint, or the player walks through a staircase that is
    // painted somewhere else
    for(const [tx,ty] of st.triggers){
      const inX = tx>=st.visX && tx < st.visX+st.visW;
      const inY = ty>=st.visY && ty < st.visY+st.visH;
      if(!inX||!inY) badArt.push(`${label} ${st.target}: trigger (${tx},${ty}) outside art [${st.visX},${st.visY},${st.visW},${st.visH}]`);
    }
    // and the trigger row must be as wide as the art
    const w=new Set(st.triggers.map(t=>t[0])).size;
    if(w!==st.visW) badArt.push(`${label} ${st.target}: ${w} trigger column(s) under ${st.visW}-tile art`);
  }
}
for(const n of noArt)  console.log('     NO ART  '+n);
for(const b of badArt) console.log('     '+b);
ok(noArt.length===0, `all 4 Seer staircases declare art (${noArt.length} without)`);
ok(badArt.length===0, `every trigger sits under its own staircase, full width (${badArt.length} wrong)`);
// up/down art must match the direction of travel, which the old heuristic
// (target ends in _2f) cannot express inside a 3-floor building
const dirs=[];
for(const [cfg,label] of ALL)
  for(const st of (cfg.stairsList||[])) dirs.push(`${label}->${st.target.replace('interior_seer_hq_','')}:${st.art}`);
console.log('     '+dirs.join('  '));
const want={'hall->b':'down','hall->2f':'up','vault->1f':'up','command->1f':'down'};
let wrongDir=0;
for(const [cfg,label] of ALL)
  for(const st of (cfg.stairsList||[])){
    const k=`${label==='hall'?'hall':label}->${st.target.replace('interior_seer_hq_','')}`;
    if(want[k] && st.art!==want[k]) wrongDir++;
  }
ok(wrongDir===0, `up/down art matches the direction of travel (${wrongDir} wrong)`);
ok(/s\.art \? \(s\.art === 'up'\)/.test(src2),
   'and the draw honours the explicit art flag — the old "target ends in _2f"');
console.log('     heuristic is unusable here: the vault stair goes DOWN to a scene');
console.log('     not ending in _2f, and the vault\'s own stair goes UP to one');
console.log('     ending in _1f.\n');

console.log('\n3 · ★★ THE KEY GATE · per district, never a master key\n');
C.player.seerKeys={}; C.player.seerHqChests={}; C.player.rubyVialChestOpened=false;
C.player.seerHqDistrict='zarvane';
ok(up.locked()===true, 'the stair up is LOCKED before the vault is cleared');
ok(typeof up.lockedMsg==='function' && /SEER KEY/.test(up.lockedMsg()), '   and says WHY · '+up.lockedMsg().slice(0,58)+'…');
ok(/playSFX\('doorLock'\)/.test(src2), '   a locked stair refuses audibly rather than eating the input');
C.game.scene=C.SEER_HQ_CHEST_SCENE;
ok(C.SEER_HQ_CHEST_SCENE==='interior_seer_hq_b', 'the silver chest lives in the VAULT now, not the hall');
const got=C.tryOpenSeerHqChest();
ok(got===true, 'opening the vault chest succeeds');
ok(C.hasSeerKey('zarvane')===true, 'and yields the ZARVANE key');
ok(up.locked()===false, 'which unlocks that district\'s stair');
let leaked=0;
for(const H of C.SEER_HQ_NETWORK) if(H.dist!=='zarvane' && C.hasSeerKey(H.dist)) leaked++;
ok(leaked===0, `and NO other district was unlocked by it (${leaked} leaked) — ten raids, ten keys`);
// malezor's legacy chest must ALSO grant a key or the first HQ is unopenable
C.player.seerHqDistrict='malezor'; C.game.scene=C.SEER_HQ_CHEST_SCENE;
C.tryOpenSeerHqChest();
ok(C.hasSeerKey('malezor')===true,
   'Malezor\'s legacy Ruby-Vial chest grants a key too — it is the FIRST HQ the player enters');

console.log('\n4 · ★★ SEER HQ STATE ACTUALLY SAVES · pre-existing bug\n');
console.log('     None of the chest state was in the save snapshot. Every HQ');
console.log('     strongbox refilled on reload and the Ruby Vial could be farmed');
console.log('     forever. Found while adding the key, which would have inherited it.\n');
for(const k of ['seerHqChests','rubyVialChestOpened','seerKeys','seerCommandersBeaten'])
  ok(new RegExp(k+':\\s').test(src2.slice(src2.indexOf('function saveGame'), src2.indexOf('function loadGame'))),
     `${k} is in the save snapshot`);
ok(/Object\.assign\(player, s\.player\)/.test(src2),
   'loadGame Object.assigns the snapshot back — being IN the snapshot is the whole fix');

console.log('\n5 · ★★ ONE GRUNT ART TABLE · the interior had a second one\n');
console.log('     The HQ garrison carried its own bbox block: four identical rows');
console.log('     of [71,43,178,279], predating every measurement pass in the file.');
console.log('     Wrong size, wrong sheet, no idle, no foot baselines, and nothing');
console.log('     anywhere pointed at the discrepancy.\n');
// Strip line comments first. The two remaining occurrences of [71,43,178,279]
// in the file are the COMMENTS explaining that the table was removed, and an
// assertion that matches its own documentation is the Ivirium bug again:
// matching prose is not matching code.
const _code = src2.replace(/\/\/[^\n]*/g, '');
ok(!/\[\s*71,\s*43,\s*178,\s*279\s*\]/.test(_code), 'the stale placeholder table is gone from the CODE');
ok(/\[71,43,178,279\]/.test(src2), '   (and is still described in a comment, so the history survives)');
ok(/const SEER_GRUNT_ART/.test(src2) && /function seerGruntSheet/.test(src2),
   'one table + one accessor at module scope');
const gar=C.NPCS.filter(n=>n&&n._seerHqGarrison);
ok(gar.length>=8, `the hall garrison is ${gar.length} grunts`);
let wrong=0;
for(const n of gar){
  // v0.95.736 · was `n.scaleRefBh===256?'B'`. Grunt B's redelivered idle
  // sheet measures 255, so four garrison grunts fell through to null and
  // were counted 'wrong' by a suite that had a stale number baked in.
  // THIRD suite this bit. Read the yardstick from the table that owns it.
  const v = n.scaleRefBh===C.SEER_GRUNT_ART.A.standBh ? 'A'
          : n.scaleRefBh===C.SEER_GRUNT_ART.B.standBh ? 'B' : null;
  if(!v){ wrong++; continue; }
  for(const [k,sh] of [['idle',n.sheet],['walk',n.walkSheet],['run',n.runSheet],['attack',n.attackSheet]])
    if(!sh || !new RegExp('grunt-'+v.toLowerCase()+'-'+k).test(String(sh.src))) wrong++;
}
ok(wrong===0, `every garrison grunt has all four banks off the shared table (${wrong} wrong)`);
ok(gar.every(n=>n.cellAnchor===true && Array.isArray(n.footBaselines)),
   'and cellAnchor + foot baselines, exactly like the eighty outside');

console.log('\n6 · ★ THE COMMANDER\n');
const cm=C.findNpcById('seer_commander');
ok(!!cm, 'a Commander exists');
ok(cm && cm.scene==='interior_seer_hq_2f', 'on the top floor');
ok(cm && cm.mode==='stationary', 'stationary — he waits, he does not patrol');
ok(cm && cm.tileY < 6, `at the far wall (y=${cm&&cm.tileY}) so the room reads before he does`);
ok(Object.keys(C.SEER_COMMANDER_NAME).length===10, 'ten districts are named');
let renamed=0;
for(const H of C.SEER_HQ_NETWORK){
  C.player.seerHqDistrict=H.dist; C.refreshSeerCommander();
  if(cm.name===C.SEER_COMMANDER_NAME[H.dist]) renamed++;
}
ok(renamed===10, `he renames himself for all ten buildings (${renamed}/10) — one NPC, ten doors`);
const delivered=Object.keys(C.SEER_COMMANDER_ART).filter(k=>C.SEER_COMMANDER_ART[k]);
const pending=Object.keys(C.SEER_COMMANDER_ART).filter(k=>!C.SEER_COMMANDER_ART[k]);
console.log(`\n     sheets delivered ${delivered.length}/10 · pending: ${pending.join(', ')||'none'}\n`);
// ★ each delivered sheet must actually take when the district is entered, and
// must be that district's OWN file — a swap that silently keeps the previous
// district's sprite looks identical to one that worked.
let stuck=0, mism=0;
for(const d of delivered){
  C.player.seerHqDistrict=d; C.refreshSeerCommander();
  if(!new RegExp('seer-commander-'+d).test(String(cm.sheet && cm.sheet.src))) mism++;
  if(cm._downScale!==null && cm._downScale!==undefined) stuck++;
}
ok(mism===0, `all ${delivered.length} delivered sheets load their OWN district file (${mism} wrong)`);
ok(stuck===0, `_downScale is cleared on every swap (${stuck} stale) — otherwise the new sheet draws at the old sheet's scale`);
// heights must land where the rank language says
const TILE2=48;
let tall=[];
for(const d of delivered){
  const a=C.SEER_COMMANDER_ART[d];
  tall.push(a.standBh*((TILE2*2)/a.standBh*1.45)/TILE2);
}
const lo=Math.min(...tall), hi=Math.max(...tall);
console.log(`     commanders stand ${lo.toFixed(2)}-${hi.toFixed(2)} tiles · Grunt B 2.30 · Grunt A 2.15 · Mori 2.00`);
ok(lo>2.30, 'every Commander stands taller than a Grunt Elite — rank reads before flavour');
ok(hi-lo<0.02, `and they all stand the SAME height as each other (spread ${(hi-lo).toFixed(3)})`);
ok(hi<3.5, 'without overshooting into boss scale');
// per-sheet tables, not shared
const sig=new Set(delivered.map(d=>JSON.stringify(C.SEER_COMMANDER_ART[d].foot)));
ok(sig.size===delivered.length, `each Commander has his OWN foot table (${sig.size}/${delivered.length}) — they differ by up to 6px`);
ok(cm && cm.sheet, 'and a pending district still shows a Seer officer sprite — a missing');
console.log('     asset must degrade to the wrong costume, never to an invisible NPC');

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
