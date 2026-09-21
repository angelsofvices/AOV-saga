// ★★★ v0.96.68 · DRIVES buildQuestLog + questPins for real, in a vm sandbox.
// Grepping the source proves a rule was WRITTEN; only running it proves the pin
// appears and then goes away.  Stubs are minimal and carry the real world ids.
const fs=require('fs'), vm=require('vm'); const src=require('./lib/all_src.cjs')();
const take=(re,l)=>{const m=src.match(re); if(!m) throw new Error('extract '+l); return m[0];};
const code=[ take(/const KELTHOR_LADDERS = \[[\s\S]*?\n\];/,'ladders'),
             take(/const KELTHOR_LADDER = \[[\s\S]*?\n\];/,'ladder'),
             take(/function kelthorRungDone\(r\)[\s\S]*?\n\}/,'rungDone'),
             take(/function kelthorNextRung\(\)[\s\S]*?\n\}/,'nextRung'),
             take(/function buildQuestLog\(\)[\s\S]*?\n\s*return \{[^}]*\};\n\}/,'buildQuestLog'),
             take(/function _questAnchor\(a\)[\s\S]*?\n\}/,'_questAnchor'),
             take(/let _mmQuestPins[\s\S]*?function questPins\(\)[\s\S]*?\n\}/,'questPins') ].join('\n');
const NPCS=[{id:'kelthor',tileX:22,tileY:82},{id:'auraxion',tileX:15,tileY:180},
            {id:'albert_orren',tileX:11,tileY:82},{id:'kaizari',tileX:35,tileY:140}];
const WORLD_PROPS=[{id:'malezor_school',tileX:25,tileY:126},
                   {id:'malezor_research_facility',tileX:22,tileY:38},
                   {id:'malezor_hospital',tileX:22,tileY:156}];
const TOWER_BY_DIST={malezor:{tower:[38,14]}};
// ★ a FRESH context per scenario · `let` caches are lexical and cannot be
//   reached from the sandbox object, so reusing one context silently re-served
//   the first answer — which is exactly how this harness lied the first time.
const run=(player,label)=>{
  const sb=vm.createContext({NPCS,WORLD_PROPS,TOWER_BY_DIST,player,performance:{now:()=>Date.now()}});
  vm.runInContext(code,sb);
  const pins=sb.questPins();
  console.log(`\n${label}  →  ${pins.length} yellow pin(s)`);
  for(const q of pins) console.log(`   ◆ ${q.name.padEnd(26)} (${q.x},${q.y})`);
  return pins; };
const base={zycubeGifted:true,yaraMet:true,items:{},faeCollected:0};
const early=run(base,'FRESH SAVE · Ch2 open');
const later=run({...base,raidCardGifted:true},'AFTER Ch2 COMPLETES');
const rich =run({...base,raidCardGifted:true,dadStarterQuestGiven:true,kelthorMet:true,
                 towerFixed:false,nurseReinQuest:true},'MID-GAME');
const at=(l,x,y)=>l.some(p=>p.x===x&&p.y===y);
let f=0; const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
console.log('');
ok(at(early,25,126),               'Ch2 pins the SCHOOL while it is open');
ok(!at(later,25,126),              '★ and DISAPPEARS the moment raidCardGifted flips');
ok(at(rich,22,38),                 'Ch3 pins the RESEARCH FACILITY once Dad gives it');
ok([...early,...later,...rich].every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)),
                                   'every pin resolved to a real tile · none guessed');
ok([...early,...later,...rich].every(p=>p.kind==='quest'), 'every pin is kind:quest → yellow');
process.exit(f?1:0);
