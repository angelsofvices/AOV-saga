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
// verify_livingloop · v0.95.804 · ecology rank + journal + rumors + anomalies
const FS=require('fs');
try{new Function(FS.readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={player,game,ecologyState,districtEcologyScore,districtEcologyRank,ECOLOGY_RANKS,'+
  'speciesJournalStage,journalCounts,JOURNAL_STAGES,spawnRumor,spawnAnomaly,ecologyTick,ANOMALY_KINDS,'+
  'RUMOR_MAX,ANOMALY_MAX,minimapPOIs,minimapDiscovered,MINIMAP,notebookState,notebookVisit,SPECIES,'+
  'ZYRAXIS_DISTRICTS,WORLD_PROPS,spawnPortals,notebookEntries,awardRizerXP,rizerLifetimeRXP,worldFrozen,'+
  'renderZycellHome,renderZycellLeaderboard,MINIMAP_KIND_COLOR};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{ console.log(`  ${c?'✅':'❌'} ${m}`); if(!c) fail++; };
const H=t=>console.log('\n'+t);
const src=FS.readFileSync('/tmp/all.js','utf8');
C.spawnPortals(); C.MINIMAP._cache=null;

H('1 · ★★ NO NEW CURRENCY · THE RANK IS A READING');
{
  const P=C.player; P.notebook=null; P.visitedDistricts={}; P.ecology=null;
  let sc=C.districtEcologyScore('malezor');
  ok(sc.score===0,'an untouched district reads 0');
  ok(C.districtEcologyRank('malezor').rank==='E','and ranks E');
  // touch things THE GAME ALREADY TRACKS and watch the rank move
  P.visitedDistricts.malezor=true;
  const s1=C.districtEcologyScore('malezor').score;
  ok(s1>0,`visiting alone moves it (${s1})`);
  // see the three lore buildings
  for (const p of C.WORLD_PROPS) if (p&&p._district30==='malezor') C.notebookVisit(`landmark:${p.id}`);
  const s2=C.districtEcologyScore('malezor').score;
  ok(s2>s1,`seeing the lore buildings moves it (${s2})`);
  // collect scrolls there
  const n=C.notebookState();
  for (let i=0;i<18;i++) n.scrolls[`scroll:theme${i}:malezor`]=1;   // ids are scroll:KEY:dist
  // ★ that used FAKE theme keys — the score must count only REAL ones
  const s3=C.districtEcologyScore('malezor').score;
  ok(s3===s2,'★ fake scroll ids do NOT count — the score reads SCROLL_THEMES, not the key pattern');
  ok(sc.max===25,'the ceiling is declared');
  ok(C.ECOLOGY_RANKS[0].rank==='S'&&C.ECOLOGY_RANKS[0].min<=sc.max,
     'S rank is reachable inside the ceiling');
  // and the letters are monotone
  const mins=C.ECOLOGY_RANKS.map(r=>r.min);
  ok(mins.every((m,i)=>i===0||m<mins[i-1]),'E→S thresholds strictly ordered');
  ok(!/player\.ecologyScore|player\.districtRank/.test(src),
     '★ and no stored score exists anywhere to drift from the derivation');
}

H('2 · ★★ THE FIELD JOURNAL IS DERIVED TOO');
{
  const P=C.player; P.notebook=null; P.party=[]; P.pcZyrex=[]; P.bonds={};
  const sp=Object.keys(C.SPECIES)[0];
  ok(C.speciesJournalStage(sp)===0,'never met · UNKNOWN');
  C.notebookVisit(`zyrex:${sp}`);
  ok(C.speciesJournalStage(sp)===1,'in the notebook · SIGHTED');
  P.party=[{speciesId:sp,name:'x'}];
  ok(C.speciesJournalStage(sp)===2,'in the party · BONDED');
  P.bonds[sp]=100;
  ok(C.speciesJournalStage(sp)===3,'★ bond full · MASTERED');
  const jc=C.journalCounts();
  ok(jc.total===Object.keys(C.SPECIES).length,`counts cover all ${jc.total} species`);
  ok(jc.mastered===1&&jc.unknown===jc.total-1,'and they add up');
  // ★ BATTLED is deliberately absent, not faked
  ok(C.JOURNAL_STAGES.length===4 && !C.JOURNAL_STAGES.some(s=>s.key==='battled'),
     '★ BATTLED is absent on purpose — no per-species battle counter exists to derive it from');
  const e=C.notebookEntries('zyrex').find(x=>x.id===`zyrex:${sp}`);
  ok(/MASTERED/.test(e.sub),'the notebook index shows the stage');
  P.party=[]; P.bonds={};
}

H('3 · ★★ A RUMOR POINTS AT CONTENT THAT ALREADY EXISTS');
{
  const P=C.player, G=C.game;
  P.notebook=null; P.ecology=null; P.x=58; P.y=103; G.scene='overworld';
  P.dadStarterQuestGiven=true;
  const r=C.spawnRumor();
  ok(!!r,'a rumor spawns');
  ok(!!r.targetId,'★ and it TARGETS a real POI id, not invented content');
  const target=C.minimapPOIs().find(p=>p.id===r.targetId);
  ok(!!target,'the target exists in the POI registry');
  ok(!C.minimapDiscovered(r.targetId),'and is genuinely undiscovered');
  const fuzz=Math.max(Math.abs(r.x-target.x),Math.abs(r.y-target.y));
  ok(fuzz<=7 && fuzz>=0,`★ the pin is FUZZED ${fuzz} tiles — a rumor is where to look, not where to stand`);
  const d=Math.abs(target.x-P.x)+Math.abs(target.y-P.y);
  ok(d>=40&&d<=350,`far enough to be a trip, near enough to take it (${d} tiles)`);
  // it shows on the scope
  C.MINIMAP._cache=null;
  ok(C.minimapPOIs().some(p=>p.kind==='rumor'),'and rides the minimap POI feed');
  // ── RESOLUTION · discover the target, tick, get paid ─────────────
  const rxp0=C.rizerLifetimeRXP();
  C.notebookVisit(r.targetId);
  // ★ park the spawn cadence · the tick resolves AND spawns, and a fresh state
  //   spawns immediately — the test is about resolution, not cadence
  C.ecologyState().nextRumorAt=performance.now()+1e9;
  C.ecologyState().nextAnomAt=performance.now()+1e9;
  C.ecologyTick();
  ok(C.ecologyState().rumors.length===0,'★ discovering the target resolves the rumor — however you got there');
  ok(C.rizerLifetimeRXP()>rxp0,'and pays RXP');
  const evDist=Object.values(C.ecologyState().events).reduce((a,b)=>a+b,0);
  ok(evDist===1,'and feeds the district ecology counter — the loop feeding itself');
  // capacity
  P.notebook=null; C.ecologyState().rumors.length=0;
  let made=0; for(let i=0;i<10;i++) if(C.spawnRumor()) made++;
  ok(C.ecologyState().rumors.length<=C.RUMOR_MAX,`never more than ${C.RUMOR_MAX} open leads`);
  const ids=C.ecologyState().rumors.map(r=>r.targetId);
  ok(new Set(ids).size===ids.length,'and no two rumors chase the same target');
  C.ecologyState().rumors.length=0;
}

H('4 · ★★ ANOMALIES · ANNOUNCED, VISIBLE, TRANSIENT, PAID');
{
  const P=C.player, G=C.game;
  P.ecology=null; P.x=58; P.y=103; G.scene='overworld'; P.items=P.items||{};
  const a=C.spawnAnomaly();
  ok(!!a,'one spawns in the district you are standing in');
  ok(a.dist==='malezor','tagged with its district');
  ok(Math.abs(a.x-P.x)+Math.abs(a.y-P.y)>=25,'never at your feet — you have to GO');
  ok(a.expires>performance.now(),'and it has a deadline');
  C.MINIMAP._cache=null;
  ok(C.minimapPOIs().some(p=>p.kind==='anomaly'),'pinned on the scope');
  ok(/drawAnomalies/.test(src)&&/globalCompositeOperation = 'lighter'/.test(src.slice(src.indexOf('function drawAnomalies'),src.indexOf('function drawAnomalies')+1600)),
     '★ and drawn IN THE WORLD as an additive shimmer — a place, not a UI dot');
  // walk in · resolve
  const rxp0=C.rizerLifetimeRXP();
  P.x=a.x; P.y=a.y;
  C.ecologyState().nextRumorAt=performance.now()+1e9;
  C.ecologyState().nextAnomAt=performance.now()+1e9;
  C.ecologyTick();
  ok(C.ecologyState().anomalies.length===0,'arriving resolves it');
  ok(C.rizerLifetimeRXP()>rxp0,'and pays');
  ok((C.ecologyState().events['malezor']||0)>=1,'and feeds the ecology counter');
  ok(C.ANOMALY_KINDS.length===3,'three kinds to start');
  ok(C.ANOMALY_KINDS.every(k=>typeof k.resolve==='function'),'each with its own payout');
  // expiry
  const b=C.spawnAnomaly();
  if (b){ b.expires=performance.now()-1; P.x=1;P.y=1;
    C.ecologyState().nextRumorAt=performance.now()+1e9;
    C.ecologyState().nextAnomAt=performance.now()+1e9;
    C.ecologyTick();
    ok(C.ecologyState().anomalies.length===0,'and one you ignore fades on its own'); }
}

H('5 · ★★ THE PHONE IS THE TRACKER');
{
  const P=C.player, G=C.game;
  P.ecology=null; P.x=58; P.y=103; G.scene='overworld'; P.visitedDistricts={malezor:true};
  C.spawnRumor(); C.spawnAnomaly();
  const html=C.renderZycellHome();
  ok(/LIVE WORLD/.test(html),'★ the home screen carries the LIVE WORLD card');
  ok(/ECOLOGY/.test(html),'with the district ecology rank');
  ok(/FIELD JOURNAL/.test(html),'the journal counts');
  ok(/📜/.test(html),'the open leads — printed as the overheard line itself, not a label');
  ok(/tiles [NESW]/.test(html),'★ each with a DIRECTION — the phone points, the player walks');
  const rec=C.renderZycellLeaderboard();
  ok(/NOVARIAN RECORD/.test(rec),'★ the leaderboard is THE NOVARIAN RECORD now — feature 15 as a rebrand, not a new panel');
  ok(/ECOLOGY ·/.test(rec),'and it carries all ten district ranks');
  const nav=FS.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
  ok(/NOVARIAN RECORD<\/button>/.test(nav),'the nav button says so too');
  ok(!/>🏆  LEADERBOARD</.test(nav),'and the arbitrary name is gone');
  C.ecologyState().rumors.length=0; C.ecologyState().anomalies.length=0;
}

H('6 · ★★ CANON UNTOUCHED · TRANSIENTS DIE WITH THE SESSION');
{
  ok(/ecology:\s*\{ events:/.test(src),'★ only the event COUNTERS persist');
  ok(/player\.ecology\.rumors = \[\]/.test(src),
     '★ a loaded save drops rumors and anomalies — their deadlines are performance.now() stamps from a dead clock');
  // gated on the story starting
  ok(/player\.dadStarterQuestGiven\) spawnRumor/.test(src),
     'the world starts talking only once the story does');
  ok(/worldFrozen/.test(src.slice(src.indexOf('function ecologyTick'),src.indexOf('function ecologyTick')+400)),
     'and the loop pauses when the phone or pause menu is up');
  // no combat, damage, XP-curve or species table was touched
  ok(!/ecolog/i.test(src.slice(src.indexOf('function calcDamage'),src.indexOf('function calcDamage')+3000)),
     'combat math untouched');
}

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
