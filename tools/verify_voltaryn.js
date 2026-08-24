const fs = require('fs');
const _harnessSrc = fs.readFileSync('/tmp/all.js', 'utf8');
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
// verify_whud · v0.95.784 · the weapon wheel shows what is in hand
// verify_voltaryn · v0.95.818 · the calm one grazing the southern meadow
const FS=require('fs');
try{new Function(FS.readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={player,game,seedMalezorWild,WILD_ZYREX,MALEZOR_WILD_FIXED,tryRecruitWildZyrex,'+
  'requiredBondForTier,rizerBondTotal,SPECIES,worldDistrictAt,_propBlocked,WILD_ZYREX_ENABLED,spillPickups,collectPickupsAt,WORLD_PROPS};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{ console.log(`  ${c?'✅':'❌'} ${m}`); if(!c) fail++; };
const H=t=>console.log('\n'+t);
const src=FS.readFileSync('/tmp/all.js','utf8');

H('1 · ★★ HE STANDS IN THE MEADOW DESPITE THE MASTER GATE');
{
  ok(C.WILD_ZYREX_ENABLED===false,'the bulk wild roster is OFF, per the Creator\'s sprite-import order');
  const n=C.seedMalezorWild();
  const v=C.WILD_ZYREX.find(w=>w.speciesId==='voltaryn');
  ok(!!v,'★ and the Voltaryn spawns anyway — a named individual at a named tile outranks a blanket removal');
  ok(v.tileX===15&&v.tileY===214,'at (15,214) exactly');
  ok(!C._propBlocked.has('15,214'),'on a walkable tile');
  ok(v.temperament==='Calm','★ Calm natured');
  // ★ v0.95.818 · THE LEVEL LAW · wild level = tier x 10, no exceptions
  ok(v.level===50,'Lv 50 · T5 x 10, per the wild level law');
  const rosterWilds=C.WILD_ZYREX.filter(w=>w._malezorWild&&w._malezorWild!=='FIXED');
  ok(rosterWilds.length===0,'★ while the bulk scatter stays OFF — only the hand-placed stand');
}

H('2 · ★★ HE GRAZES · A MEADOW ANIMAL, NOT A SENTRY');
{
  const v=C.WILD_ZYREX.find(w=>w.speciesId==='voltaryn');
  ok(v._graze===true,'flagged grazing');
  ok(v._grazeHome[0]===15&&v._grazeHome[1]===214&&v._grazeR===5,'within 5 tiles of home');
  // drive the drift · park the player far away and run the graze beats
  C.game.scene='overworld'; C.player.x=100; C.player.y=100;
  // ★ v0.95.829 · the fence moved into _grazeStepOk when the drift became
  // walk-then-eat — every STEP consults it, and the target picker checks the
  // fence again before a leg even starts.  Window widened to cover both.
  const g=src.slice(src.indexOf('★ v0.95.818 · GRAZING'), src.indexOf('★ v0.95.818 · GRAZING')+4200);
  ok(/_grazeStepOk = \(w, nx, ny\)[\s\S]{0,200}Math\.abs\(nx - w\._grazeHome\[0\]\) \+ Math\.abs\(ny - w\._grazeHome\[1\]\) > w\._grazeR\) return false/.test(g),
     '★ every step is checked against the home radius — he can never wander off his meadow');
  ok(/Math\.abs\(tx - w\._grazeHome\[0\]\) \+ Math\.abs\(ty - w\._grazeHome\[1\]\) > w\._grazeR\) continue/.test(g),
     '…and the walk TARGET is fenced too, before a leg even starts');
  ok(/_propBlocked\.has/.test(g)&&/player\.x === nx/.test(g),'never onto collision or the player');
  ok(/nearRizer/.test(g)&&/<= 4/.test(g),'★ and he PAUSES when Rizer is within 4 tiles — he noticed you');
}

H('3 · ★★ THE BOND GATE DECIDES, AND CALM NEVER FLEES');
{
  const P=C.player;
  const v=C.WILD_ZYREX.find(w=>w.speciesId==='voltaryn');
  const need=C.requiredBondForTier(5);
  ok(need===1665,`T5 gate = ${need} bond (50%)`);
  // under the gate
  P.bonds={}; P.devBondFloor=0; P.party=[]; P.pcZyrex=[];
  C.tryRecruitWildZyrex(v);
  ok(!v._gone,'★ refused under the gate — and he DID NOT FLEE, unlike Skittish and Wary');
  ok(/returns to grazing/.test(src),'his refusal line keeps him grazing — the gentlest no in the game');
  // over the gate
  P.devBondFloor=3330;
  C.tryRecruitWildZyrex(v);
  ok(v._gone===true&&!!v._recruitedAt,'★ with the bond earned, he comes');
  const inRoster=[].concat(P.party||[],P.pcZyrex||[]).some(z=>z&&z.speciesId==='voltaryn');
  ok(inRoster,'and joins the faction (or the PC if full)');
  P.devBondFloor=0;
}


H('4 · ★★ COLLISION ON EVERYTHING BUT COINS');
// Creator: "add collision to all pick up items besides coins and gems.
// everything else u must walk to and interact with"
{
  const P=C.player, G=C.game; G.scene='overworld';
  P.items=P.items||{}; P.items.scrap_metal=0; P.items.portal_chip=0; P.items.coins=0;
  const before=C.WORLD_PROPS.length;
  C.spillPickups('scrap', 58, 103, [1], 'vtest');
  C.spillPickups('chip',  58, 105, [1], 'vtest');
  C.spillPickups('coins', 58, 107, [5], 'vtest');
  const scrap=C.WORLD_PROPS.find(p=>p&&p._pickup&&p._pickup.kind==='scrap'&&p._pickup.tag==='vtest');
  const chip =C.WORLD_PROPS.find(p=>p&&p._pickup&&p._pickup.kind==='chip'&&p._pickup.tag==='vtest');
  const coin =C.WORLD_PROPS.find(p=>p&&p._pickup&&p._pickup.kind==='coins'&&p._pickup.tag==='vtest');
  ok(scrap&&scrap.footprint.length===1,'★ scrap is SOLID');
  ok(chip&&chip.footprint.length===1,'★ chips are SOLID');
  ok(coin&&coin.footprint.length===0,'★ coins stay walk-over — the satisfying run-through survives');
  ok(C._propBlocked.has(`${scrap.tileX},${scrap.tileY}`),'the collision is really registered');
  ok(typeof scrap.onInteract==='function'&&scrap.door,'and X reaches it');
  // walk-over must NOT collect a solid pickup, even standing on its tile
  C.collectPickupsAt(scrap.tileX, scrap.tileY);
  ok((P.items.scrap_metal||0)===0&&C.WORLD_PROPS.includes(scrap),
     '★ stepping logic cannot vacuum a solid pickup — X is the only door');
  // X collects, releases collision, pays the bag
  scrap.onInteract();
  ok((P.items.scrap_metal||0)===1,'X hands it over');
  ok(!C._propBlocked.has(`${scrap.tileX},${scrap.tileY}`),'and the collision leaves with it');
  // coins still collect by stepping
  C.collectPickupsAt(coin.tileX, coin.tileY);
  ok((P.items.coins||0)===5,'while a coin pile still pays on walk-over');
  // gems untouched · they live in GEM_ENTITIES, not this system, and keep walk-over
  const src2=FS.readFileSync('/tmp/all.js','utf8');
  ok(/const _solid = kind !== 'coins'/.test(src2),'the rule is one line, stated once per path');
  ok((src2.match(/const _solid = kind !== 'coins'/g)||[]).length===2,
     '★ and the RESTORE path rebuilds the same grammar — a reloaded chip cannot change species');
  chip.onInteract();
  C.WORLD_PROPS.length=before>C.WORLD_PROPS.length?C.WORLD_PROPS.length:C.WORLD_PROPS.length;
}


H('5 · ★★ THE HERD · VOLTIGRAX, AND THE LEVEL LAW OVER ALL');
{
  const g=C.WILD_ZYREX.find(w=>w.speciesId==='voltigrax');
  ok(!!g,'★ the Voltigrax stands at the cactus flats');
  ok(g.tileX===212&&g.tileY===196,'at (212,196)');
  ok(g.temperament==='Calm'&&g._graze===true,'calm, grazing');
  ok(g.level===60,'★ Lv 60 · T6 x 10');
  // the law binds EVERYONE · anciuxor is T10 → Lv 100, no hand-set 12 left
  const a=C.WILD_ZYREX.find(w=>w.speciesId==='anciuxor');
  ok(a&&a.level===100,`★ even the pinned legendary obeys · Anciuxor T10 = Lv ${a&&a.level}`);
  const src2=FS.readFileSync('/tmp/all.js','utf8');
  const sw=src2.indexOf('function spawnWildZyrex');
  ok(!/o\.level \|\|/.test(src2.slice(sw,sw+800)),
     '★ and no caller can override it — a law with an escape hatch is a suggestion');
}

H('6 · ★★ ELZORAN AT THE STATUE · SILENCE IS THE GATE');
{
  const e=C.WILD_ZYREX.find(w=>w.speciesId==='elzoran');
  ok(!!e,'★ Elzoran stands at the statue again');
  ok(e.tileX===5&&e.tileY===28,'at (5,28), facing his fallen comrade');
  ok(e.level===50,'Lv 50 · T5 x 10');
  const P=C.player;
  // no Elzebub · he IGNORES you · nothing happens at all
  P.party=[]; P.pcZyrex=[]; P.bonds={}; P.devBondFloor=3330;   // even a maxed Rizer
  C.tryRecruitWildZyrex(e);
  ok(!e._gone&&!e._recruitedAt,'★ without a worthy Elzebub he IGNORES you — no join, no flee');
  const src2=FS.readFileSync('/tmp/all.js','utf8');
  const gi=src2.indexOf('if (gate.silent) return');
  ok(gi>0,'★ the silent gate returns before ANY dialog or sfx — no vox, as ordered');
  ok(gi<src2.indexOf('showDialog({ speaker: sp.name.toUpperCase()',src2.indexOf('function tryRecruitWildZyrex')),
     'checked before the speaking refusal path');
  // with the Elzebub raised, the ordinary bond logic takes over
  P.party=[{speciesId:'elzebub',level:50,name:'E'}];
  C.tryRecruitWildZyrex(e);
  ok(e._gone===true&&!!e._recruitedAt,'★ with a Lv-50 Elzebub at your side, the champion comes');
  P.devBondFloor=0; P.party=[];
}


console.log('\n★ v0.95.829 · WALK-THEN-EAT · distance between meals');
{
  ok(/WALK-THEN-EAT/.test(src),'the graze rhythm exists');
  const g=src.slice(src.indexOf('WALK-THEN-EAT'),src.indexOf('WALK-THEN-EAT')+3600);
  ok(/w\._grazeTarget/.test(g)&&/2 \+ Math\.random\(\) \* 2/.test(g),'★ each leg WALKS 2-4 tiles to the next bush');
  ok(/340 \+ Math\.random\(\) \* 140/.test(g),'walking cadence ~400ms/step · reads as walking, not teleport-hops');
  ok(/4000 \+ Math\.random\(\) \* 4000/.test(g),'★ then EATS 4-8s with its head down');
  ok(/< 2\) continue;/.test(g),'a leg under 2 tiles is rejected — a real walk, not a shuffle');
  ok(/nearRizer/.test(g),'both legs still freeze while Rizer is within 4 tiles');
  ok(/_grazeStepOk/.test(g),'every step keeps the full legality checks (collision/actors/patch fence)');
  ok(/graze: 7/.test(src),'★ Apexaur\'s patch widened 5 → 7 so the legs are not clipped by the fence');
}
console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
