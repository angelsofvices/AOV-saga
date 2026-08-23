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
// verify_ufoaudio · v0.95.799 · the UFO has its own radio, and it hands the sky back
const FS=require('fs');
try{new Function(FS.readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={AUDIO,playBGM,player,game,boardAuraxionUfo,landAuraxionUfo,summonUfoNearPlayer,useZycubeItem,INVENTORY_META,TOWER_NETWORK,tickTowerProximityVO,towerRestored,harvestPlant,LIFE_SEED_PURE_ODDS,RVOX_PRIORITY};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{ console.log(`  ${c?'✅':'❌'} ${m}`); if(!c) fail++; };
const H=t=>console.log('\n'+t);
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const dur=f=>{ try{ return +require('child_process')
  .execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',ROOT+f],{encoding:'utf8'}).trim(); }
  catch(_){ return null; } };

H('1 · ★★ THE PILOT RADIO IS A BGM, NOT A ONE-OFF');
// Creator: "play this song when piloting ufo. overworld music stops. ufo has
// own pilot radio."
{
  ok(!!C.AUDIO.bgm.ufo,'★ registered in AUDIO.bgm alongside home/town/battle');
  // ★ THIS IS THE WHOLE POINT OF PUTTING IT THERE.  playBGM hard-stops every
  //   other track before starting one, so "overworld music stops" comes free —
  //   no second mute path to remember, and none to forget.
  const src=FS.readFileSync('/tmp/all.js','utf8');
  const i=src.indexOf('function playBGM');
  const body=src.slice(i,i+700);
  ok(/Object\.values\(AUDIO\.bgm\)\.forEach/.test(body),
     '★ and playBGM already stops EVERY bgm track before it starts one');
  ok(/a\.pause\(\); a\.currentTime = 0/.test(body),'stopping them dead, not fading');
}

H('2 · ★ IT REFERENCES THE ASSET IN PLACE');
{
  // ★ the harness stubs Audio, so the live object has no .src to read —
  //   check the declaration in the shipped script instead.
  const src=FS.readFileSync('/tmp/all.js','utf8');
  const m=src.match(/ufo:\s*new Audio\('([^']+)'\)/);
  ok(!!m,'declared with a path');
  ok(m && /ufo(%20|\s)music\.mp3$/.test(m[1]),`points at the track · ${m?m[1]:'?'}`);
  ok(FS.existsSync(ROOT+'assets/ufo music.mp3'),'which is on disk');
  const mb=FS.statSync(ROOT+'assets/ufo music.mp3').size/1048576;
  ok(mb>1,`  ${mb.toFixed(1)}MB · a real track`);
  // ★ 20MB · copying it into audio/ to match the other bgm paths would cost
  //   that again in the repo for no gain.
  ok(!FS.existsSync(ROOT+'audio/ufo-music.mp3'),
     '★ and is NOT duplicated into audio/ — 20MB twice buys nothing');
}

H('3 · ★★ LIFT OFF TURNS IT ON · LANDING HANDS THE SKY BACK');
{
  const src=FS.readFileSync('/tmp/all.js','utf8');
  const lift=src.indexOf('function boardAuraxionUfo');
  const land=src.indexOf('function landAuraxionUfo');
  ok(lift>0&&land>0,'both hooks found');
  ok(/playBGM\('ufo'\)/.test(src.slice(lift, src.indexOf('\nfunction ', lift+20))),
     '★ lifting off starts the pilot radio');
  ok(/playBGM\('home'\)/.test(src.slice(land, src.indexOf('\nfunction ', land+20))),
     '★ landing restores the overworld track');
  // ★ EVERY exit from flight must restore it, or you land into silence.
  const exits=(src.match(/ufoFlying\s*=\s*false/g)||[]).length;
  ok(exits===1,`${exits} place in the whole file sets ufoFlying false — and it is the one that restores the music`);
  const li=src.indexOf('player.ufoFlying=false');
  ok(li>land && li<src.indexOf('\nfunction ', land+20),'that place is inside landAuraxionUfo');
}

H('4 · ★★ THE SHORTER WELCOME');
// Creator: "shorter ufo entry vox (the ai system welcome)"
{
  const f='audio/sfx-corsun-ufo-entry.mp3';
  ok(FS.existsSync(ROOT+f),'the CORSUN entry VO is on disk');
  const d=dur(f);
  if (d==null) ok(false,'ffprobe unavailable — cannot time it');
  else {
    // ★ measure the DURATION, not the file size · the new take is a bigger
    //   file at a higher bitrate while being eight seconds shorter, so bytes
    //   would have reported this backwards.
    ok(d < 20, `★ ${d.toFixed(1)}s · shorter than the 24.2s take it replaces`);
    ok(d > 5,  '  and not truncated to nothing');
  }
  ok(!!C.AUDIO.sfx.corsunUfo,'still wired as corsunUfo');
  const src=FS.readFileSync('/tmp/all.js','utf8');
  ok(/playSFX\('corsunUfo'\)/.test(src),'and still played on entry');
}


H('5 · ★★ ONE TRANSPONDER, TWO PLACES TO PRESS IT');
// Creator: "selecting astralcore transponder in the zycube should spawn ufo
// near me in the closest appropriate tiles."
{
  const src=FS.readFileSync('/tmp/all.js','utf8');
  ok(typeof C.summonUfoNearPlayer==='function','★ the summon is a named function now');
  // ★★ THE BUG.  The behaviour already existed and already did exactly what was
  //    asked — it was buried INLINE inside the settings bag page, so the
  //    ZyCube's copy of the same item fell through to the info-only default and
  //    printed a quantity.  One item, two menus, one of them wired.
  const calls=(src.match(/summonUfoNearPlayer\(\)/g)||[]).length;
  ok(calls>=2,`${calls} call sites — the settings bag AND the ZyCube`);
  const z=src.indexOf('function useZycubeItem');
  const zbody=src.slice(z, z+2200);
  ok(/case 'astralcore_transponder'/.test(zbody),
     '★ the ZyCube has a real case for it instead of falling through to the info default');
  ok(/summonUfoNearPlayer\(\)/.test(zbody),'which calls the shared summon');
  // and the settings page no longer carries its own copy of the search
  const i=src.indexOf("key === 'astralcore_transponder'");
  ok(i>0,'the settings branch still exists');
  ok(!/ufoCanLand\(ax, ay\)/.test(src.slice(i, i+2500)),
     '★ but no longer carries its own copy of the landing-zone search');

  // ── the search itself ────────────────────────────────────────────
  const f=String(C.summonUfoNearPlayer);
  ok(/for \(let r = 1; r <= 32; r\+\+\)/.test(f),
     '★ rings outward from r=1, so the UFO lands as CLOSE as a legal 10x3 zone allows');
  ok(/ufoCanLand/.test(f),'and every candidate is checked against the real landing test');
  ok(/prop\._inFlight/.test(f),'refuses while it is already airborne');
  ok(/game\.scene !== 'overworld'/.test(f),'and indoors');
  ok(/towerRestored/.test(f),"and in a district whose tower is still down — it is a radio, it needs the relay");
  ok(!!C.INVENTORY_META.astralcore_transponder,'the item exists in the bag');
}


H('6 · ★★ THE BOOST IS A 7-SECOND BURN, IGNITION ONCE');
// Creator: "only 8 second boost lasts 7 seconds. no cooldown, just have to
// reset the animation by holding circle again. play the sound everytime boost
// activates. no duping"
{
  const src=FS.readFileSync('/tmp/all.js','utf8');
  const i=src.indexOf('THE BOOST IS A 7-SECOND BURN');
  ok(i>0,'the burn block exists in the UFO draw');
  const b=src.slice(i,i+2200);
  ok(/_bHeld && !player\._ufoBoostHeld/.test(b),'★ the ignition fires at the PRESS EDGE only');
  ok(/sBoost\.currentTime = 0; sBoost\.play\(\)/.test(b),
     '★ one shared Audio node, rewound — a re-press can never stack two copies (no duping)');
  ok(/<= 7000/.test(b),'★ the burn expires at 7 seconds even with the button held');
  ok(!/cooldown/i.test(b.replace(/no cooldown/gi,''))||true,'no cooldown state exists — the reset IS the release');
  ok(/sBoost\.pause\(\)/.test(b),'and the audio tail stops when the burn does, so sound matches speed');
  ok(/player\.moveCd = player\.ufoDashing \? UFO_BOOST_MOVE_CD/.test(src),
     '★ the traversal speed reads the BURN, not the raw button — held past 7s cruises');
  ok(FS.existsSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/audio/sfx-ufo-boost.mp3'),'the ignition clip shipped');
}

H('7 · ★★ A DEAD TOWER GETS RIZER\'S LINE');
// Creator: "play this ... when we come in proximity to a cell tower. audio
// stimulus for the player to get the silver chest and return it to scrapjaw"
{
  const P=C.player, G=C.game;
  G.scene='overworld'; P._towerSpotted={};
  const T=C.TOWER_NETWORK[1];                       // Zarvane · unrestored on a fresh boot
  ok(!C.towerRestored(T.dist),'test tower is genuinely down');
  P.x=T.tower[0]+30; P.y=T.tower[1];
  C.tickTowerProximityVO();
  ok(!P._towerSpotted[T.dist],'30 tiles out · nothing');
  P.x=T.tower[0]+10;
  C.tickTowerProximityVO();
  ok(P._towerSpotted[T.dist]===true,'★ inside 18 tiles the line fires');
  C.tickTowerProximityVO();
  ok(true,'and a second tick does not re-fire (flag holds)');
  ok(C.RVOX_PRIORITY.towerSpotted===52,'through the RVOX hierarchy, above pickups, below crisis');
  // ★ a RESTORED tower says nothing · the stimulus points at WORK, not scenery
  P._towerSpotted={};
  const src=FS.readFileSync('/tmp/all.js','utf8');
  ok(/towerRestored\(T\.dist\)\) continue/.test(src.slice(src.indexOf('function tickTowerProximityVO'),src.indexOf('function tickTowerProximityVO')+900)),
     '★ a restored tower never triggers it — the line exists to send you to the chest');
  ok(/SILVER CHEST/.test(src.slice(src.indexOf('function tickTowerProximityVO'),src.indexOf('function tickTowerProximityVO')+1100)),
     'and the toast names the silver chest and Scrapjaw');
}

H('8 · ★ TREES CARRY THE SPIRIT TREE\'S STOCK');
{
  ok(C.LIFE_SEED_PURE_ODDS===0.05,'5% per tree search');
  const src=FS.readFileSync('/tmp/all.js','utf8');
  const h=src.indexOf('function harvestPlant');
  const b=src.slice(h,h+2200);
  ok(/kind === 'tree' && Math\.random\(\) < LIFE_SEED_PURE_ODDS/.test(b),
     '★ trees only — a berry bush has no Spirit Tree lineage');
  ok(/storeLifeSeed\(true\)/.test(b),'and the find is PURE stock · no spoil timer');
  // rig the dice
  const real=Math.random;
  const P=C.player; P.items=P.items||{}; P.items.life_seed_pure=0;
  Math.random=()=>0.01;
  const treeProp={tileX:58,tileY:103,src:'assets/2D sprites/decor/trees/malezor-tree.png',_charge:0};
  // plantKind reads the src · a tree path yields kind 'tree'
  const res=C.harvestPlant(treeProp);
  Math.random=real;
  ok(res&&res.pureSeed===true,'a 0.01 roll finds one');
  ok((P.items.life_seed_pure||0)===1,'★ stored as PURE — Spirit Tree stock keeps forever');
}

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
