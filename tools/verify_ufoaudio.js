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
  ';globalThis.__C={AUDIO,playBGM,player,game,boardAuraxionUfo,landAuraxionUfo};')();}
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

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
