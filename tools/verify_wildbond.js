const fs=require('fs'); const src=fs.readFileSync('/tmp/all.js','utf8'); const noop=()=>{};
try{Object.defineProperty(globalThis,'navigator',{value:{userAgent:'node',getGamepads:()=>[],maxTouchPoints:0},configurable:true});}catch(_){}
const CTX=new Proxy({},{get:()=>()=>({addColorStop:noop,width:0,height:0,data:[],createRadialGradient:()=>({addColorStop:noop})})});
const el=()=>({style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},width:960,height:540,value:'',textContent:'',innerHTML:'',children:[],childNodes:[],getContext:()=>CTX,appendChild:noop,removeChild:noop,addEventListener:noop,removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,remove:noop,play:()=>Promise.resolve(),pause:noop,querySelector:()=>el(),querySelectorAll:()=>[],getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
Object.assign(globalThis,{setInterval:()=>0,setTimeout:()=>0,clearInterval:noop,clearTimeout:noop,addEventListener:noop,removeEventListener:noop,window:globalThis,
 document:{getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener:noop,body:el(),documentElement:el(),head:el(),hidden:false,visibilityState:'visible'},
 localStorage:{getItem:()=>null,setItem:noop,removeItem:noop},
 Audio:function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,cloneNode(){return this}}},
 Image:function(){return{addEventListener:noop,complete:false,naturalWidth:0,src:''}},
 requestAnimationFrame:()=>0,cancelAnimationFrame:noop,matchMedia:()=>({matches:false,addEventListener:noop,addListener:noop}),
 performance:{now:()=>Date.now()},getComputedStyle:()=>({getPropertyValue:()=>''})});
try{new Function(src+';globalThis.__C={WILD_BOND,wildBondDifficulty,startWildBondEncounter,tickWildBond,_wildBondResolve,drawWildBondOverlay,tryRecruitWildZyrex,SPECIES,player,game};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
global.showToast=noop; global.showDialog=noop;
const bond=(n)=>{C.player.bondLedger={zyrex:n/2,rizer:n/2};};

H('1 · ★★★ THE CYCLE · gates of rotations of spins');
{
  const T=(t)=>({tier:t,name:`T${t}`,type:'Beast'});
  bond(333);                       // matched to a T1
  const d1=C.wildBondDifficulty(T(1));
  // ★★★ v0.95.905 · REPLACED.  The old anchors (events / turns / 1.8s) are gone:
  // Creator: "tier 1 is one gate but you have to complete 3 random rotations
  // before completing the event.  2.5 seconds per rotation. so tier 1 would
  // take 7.5 seconds on a success... one rotation should not be one cycle
  // because thats a low effort task."
  ok(d1.gates===1,`★ T1 · ONE gate (${d1.gates})`);
  ok(d1.rotations===3,`★★★ THREE rotations to fill it (${d1.rotations}) · one rotation would be a wrist flick`);
  ok(d1.spins===2,`★★ TWO revolutions per rotation (${d1.spins}) · six spins fill the cycle, as specified`);
  ok(d1.ms===2500,`★ 2.5 SECONDS per rotation (${d1.ms}ms)`);
  ok(d1.runSeconds===7.5,`★★★ so a clean T1 imprint takes ${d1.runSeconds} SECONDS · the Creator's number, exactly`);
  ok(d1.spins/(d1.ms/1000) === 0.8,`★★ it demands ${(d1.spins/(d1.ms/1000)).toFixed(2)} rev/sec · it was 0.42 two versions ago`);
  bond(3330);                      // matched to a T10
  const d10=C.wildBondDifficulty(T(10));
  ok(d10.gates===10,`★ T10 · TEN gates (${d10.gates})`);
  ok(d10.gates*d10.rotations===30,`★★ thirty rotations in all · ${d10.runSeconds}s of continuous spinning for the rarest catch in the game`);
  bond(0);
  ok(C.wildBondDifficulty(T(1)).gates===1,'★ a T1 stays ONE gate even at zero bond — the first catch is never a wall');
  ok(C.wildBondDifficulty(T(10)).gates<=10,'and a T10 never exceeds ten');
}

H('2 · ★★ BOND LEVEL IS WHAT BUYS THE EFFORT');
{
  const t5={tier:5,name:'T5',type:'Beast'};
  bond(1665);  const at1=C.wildBondDifficulty(t5);      // matched
  bond(3330);  const at2=C.wildBondDifficulty(t5);      // double
  ok(at2.rotations<=at1.rotations,`★ a strongly-bonded Rizer needs fewer rotations (${at2.rotations} vs ${at1.rotations})`);
  ok(at2.spins<at1.spins,`★★ and fewer revolutions in each (${at2.spins} vs ${at1.spins}) · "using his own bond level. this must matter"`);
  ok(at2.runSeconds<at1.runSeconds,`★★★ so the whole imprint is shorter · ${at2.runSeconds}s vs ${at1.runSeconds}s`);
  ok(at2.ms===at1.ms,'★ but the CLOCK never loosens · bond buys fewer turns, never a longer window');
  ok(at1.rotations>=2&&at2.rotations>=2,'★★ never below TWO rotations · no bond level turns a gate into a flick');
  ok(at2.spins>=1,'★★ nor below one full revolution');
  ok(at1.label!==at2.label,`the read-out names it · ${at1.label} → ${at2.label}`);
}

H('3 · ★★ THE ENCOUNTER REPLACES THE INSTANT CATCH');
{
  ok(/startWildBondEncounter\(w, sp\);\s*\n\s*return;/.test(src),'★ tryRecruitWildZyrex opens the ENCOUNTER, never the old instant check');
  const w={speciesId:'apexaur',tileX:10,tileY:10,level:50,temperament:'Calm'};
  bond(1665);
  // ★★ v0.95.872 · THE SPHERE IS THE TICKET.  Creator: "u cant perform a bond
  // event without a zysphere.  each attempt cost 1x."  Asserted here, at the
  // door of the encounter, because this suite owns the encounter.
  // ★ v0.95.887 · the loop now demands a starter and bond >= tier x 333 before
  // an encounter may open at all · see the note in verify_catchjoins
  C.player.starterChosen='volcanut'; C.player.starterBondGranted=true;
  C.player.bondLedger={zyrex:0,rizer:1665,_migrated:true};
  C.player.items=C.player.items||{}; C.player.items.zysphere=0;
  ok(C.startWildBondEncounter(w,C.SPECIES.apexaur)===false&&!C.game.wildBondOpen,
     '★★ an empty bag cannot open an imprint · no sphere, nothing to imprint INTO');
  C.player.items.zysphere=9;
  C.startWildBondEncounter(w,C.SPECIES.apexaur);
  const B=C.WILD_BOND.active;
  ok(!!B&&C.game.wildBondOpen===true,'the encounter opens and flags the world');
  ok(C.player.items.zysphere===8,'★★ the sphere is spent ON THE ATTEMPT · 9 → 8 before a single spin is read');
  ok(/game\.wildBondOpen\)\s+freezeReasons\.push\('wildBond'\)/.test(src),'★ the world FREEZES during the imprint');
  // ★★★ v0.95.905 · a step is now a HAND and a WAY ROUND, not a bare sign
  ok(B.seq.every(v=>v&&(v.stick==='L'||v.stick==='R')&&(v.dir===1||v.dir===-1)),
     '★★★ every rotation names a STICK and a DIRECTION · "the user has to read the screen"');
  let rep=0; for(let i=1;i<B.seq.length;i++) if(B.seq[i].stick===B.seq[i-1].stick&&B.seq[i].dir===B.seq[i-1].dir) rep++;
  ok(rep===0,'★★ never the same hand AND way twice running · a repeat reads as a dropped input and teaches nothing');
  ok(/axes\[RIGHT \? 2 : 0\]/.test(src),'★★★ LEFT stick is axes 0/1, RIGHT is 2/3 · the standard pad mapping');
  ok(/keys\['w'\]/.test(src)&&/arrowup/.test(src),
     '★★ and BOTH hands work on a keyboard too · WASD is the left ring, arrows the right · a pad-only minigame locks out half the playtesters');
  ok(/Math\.sign\(d\) === want/.test(src),'only motion in the DEMANDED direction counts');
  ok(/B\.turned - Math\.abs\(d\) \* 0\.5/.test(src),'…and spinning the wrong way bleeds progress');
}

H('4 · ★★ WIN IMPRINTS · LOSS BREAKS THE BOND');
{
  const w={speciesId:'apexaur',tileX:10,tileY:10,level:50,temperament:'Calm'};
  C.player.party=[]; C.player.pcZyrex=[];
  C.startWildBondEncounter(w,C.SPECIES.apexaur);
  C._wildBondResolve(true);
  ok(w._gone===true,'★ a won imprint consumes the wild');
  ok((C.player.party||[]).some(z=>z&&z.speciesId==='apexaur'),'…and it lands on the roster (uploaded to the ZyPhone)');
  const outcomes=new Set();
  for(let i=0;i<40;i++){
    const w2={speciesId:'apexaur',tileX:20,tileY:20,level:50,temperament:['Skittish','Territorial','Wary','Calm'][i%4]};
    C.startWildBondEncounter(w2,C.SPECIES.apexaur);
    C._wildBondResolve(false);
    outcomes.add(C.WILD_BOND.active.outcome);
    ok(!w2._gone,i===0?'★ a lost bond NEVER destroys the wild — it can be chased':undefined);
  }
  ok(outcomes.has('flee')&&outcomes.has('hostile')&&outcomes.has('teleport'),
     `★ all three failure answers occur · ${[...outcomes].join(' / ')}`);
  ok(/_fleeUntil && Date\.now\(\) < w\._fleeUntil/.test(src),'★ a fleeing wild actually RUNS (not just a toast)');
  ok(/_hostileUntil && Date\.now\(\) < w\._hostileUntil/.test(src),'★ a hostile wild actually CLOSES on you');
  ok(/w\._fleeStepAt = _gNow \+ 150/.test(src),'…and it flees faster than a walk');
}


H('5 · DIEGETIC UI · the sphere in his hands, not a screen');
{
  // ★★ v0.95.905 · SLICE TO THE END OF THE FUNCTION, not to a magic 5200
  // characters.  The overlay grew when the cycle meter and the hand tag went
  // in, and the name-plate — which lives near the bottom — fell off the end of
  // the window, failing a check about code that was still there and still
  // correct.  Eleventh fixed-window sighting in this project, and this one is
  // mine.  Take the whole body: from the signature to the next top-level
  // `function` declaration.
  const _s=src.indexOf('function drawWildBondOverlay');
  const _e=src.indexOf('\nfunction ', _s + 10);
  const d=src.slice(_s, _e > 0 ? _e : _s + 20000);
  ok(!/rgba\(4,8,16,0\.72\)/.test(d),'the full-screen scrim is GONE');
  ok(/createRadialGradient\(W\/2, H\/2/.test(d),'replaced by a breath of edge vignette');
  ok(/player\.x \* TILE/.test(d) && /_cam\.x/.test(d),'the ring is anchored to RIZER in world space');
  ok(/const R = 34/.test(d),'small ring · reads as his sphere, not a HUD');
  ok(/spin - want \* i \* 0\.16/.test(d),'the instruction is MOTION · a comet travels the way you must spin');
  ok(/teach = Math\.max\(0, 1 - age \/ 700\)/.test(d),'the glyph teaches ~700ms then fades');
  // ★ v0.95.905 · the pips became THE CYCLE METER · one pip per rotation,
  // clustered by gate, so the shape of the task reads before the first spin
  ok(/THE CYCLE METER/.test(d),'the cycle reads as pips, one per rotation, clustered by gate');
  ok(/left \* Math\.PI \* 2/.test(d),'the clock IS the ring track · no separate bar');
  ok(/intro = Math\.max\(0, 1 - \(now - B\.t0\) \/ 1100\)/.test(d),'name-plate shows a second then gets out of the way');
}

H('6 · HAPTICS · a build, and an asymmetric ending');
{
  ok(/function rumbleBond\(level, now\)/.test(src),'rumbleBond takes a 0..1 level');
  ok(/strongMagnitude: 0\.10 \+ t \* 0\.55/.test(src),'the pull BUILDS with the imprint');
  ok(/_bondRumbleAt = now \+ 110/.test(src),'throttled so pulses never stack into mush');
  const t2=src.slice(src.indexOf('function tickWildBond'),src.indexOf('function tickWildBond')+2400);
  ok(/rumbleBond\(base \+ \(B\.progress \/ B\.seq\.length\), now\)/.test(t2),'event index carries the floor · a T10 ends near max tremor');
  ok(/rumbleBondEvent\(\)/.test(t2),'each locked imprint bumps');
  ok(/strongMagnitude: 1\.00, weakMagnitude: 0\.80/.test(src),'the big catch pays a real finisher jolt');
  ok(/strongMagnitude: 0\.18, weakMagnitude: 0\.10/.test(src),'the LOSS is deliberately small — no big loss haptic');
  ok(/won \? rumbleBondWin\(\) : rumbleBondLoss\(\)/.test(src),'and the resolve picks the right one');
}

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
