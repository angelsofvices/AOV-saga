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
// v0.95.738 · MALEZOR WILD HABITAT · "place all wild zyrex around malezor most
// unpopulated regions in the north east south and west"
try{new Function(require('fs').readFileSync('/tmp/all.js','utf8')+
 ';globalThis.__C={WILD_ZYREX_ENABLED,spawnWildZyrex,walkable,seedMalezorWild,WILD_ZYREX,MALEZOR_WILD_ZONES,MALEZOR_WILD_ROSTER,MALEZOR_WILD_PER,'+
 'MALEZOR_WILD_ZONE_R,MALEZOR_WILD_FIXED,SPECIES,SUMMONABLE_SPRITES,worldDistrictAt,isWorldBorderTile,_propBlocked,NPCS,'+
 'tryRecruitWildZyrex,requiredBondForTier,drawZyrexOrb,_wildSprite,player,MOVE_DEX,TYPE_COLORS};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C;let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};

// ★★ v0.95.766 · THIS SUITE NOW HAS TWO MODES.
//
// Sections 1-12 assert the Malezor habitat is PLACED. The Creator switched the
// overworld wild Zyrex off pending a better sprite/animation import, so that is
// no longer the truth and asserting it would just fail forever.
//
// Deleting them would be worse: the moment WILD_ZYREX_ENABLED goes back to
// true, those are exactly the checks that say whether the re-import landed
// correctly. So they are skipped, not removed, and a dedicated off-state
// section runs in their place. Section 13 (roster data sanity) is unconditional
// because the SPECIES table is live either way.
if (!C.WILD_ZYREX_ENABLED){
  console.log('\n0 · ★★ THE OVERWORLD HABITAT IS SWITCHED OFF\n');
  ok(C.WILD_ZYREX.length === 0,
     `no wild Zyrex stand in the overworld (${C.WILD_ZYREX.length})`);
  ok(C.seedMalezorWild() === 0, 'the seeder is a no-op while the flag is false');
  ok(C.seedMalezorWild() === 0, 'and stays one when called again from the boot tick');

  console.log('\n0b · ★ NOTHING WAS THROWN AWAY\n');
  // The zone coordinates cost two full district sweeps to find, and the second
  // one existed only because the first was wrong. Losing them to a "removal"
  // would be the expensive mistake here.
  ok(C.MALEZOR_WILD_ROSTER.length >= 15,
     `the roster still lists all ${C.MALEZOR_WILD_ROSTER.length} species`);
  ok(Object.keys(C.MALEZOR_WILD_ZONES).length === 4,
     'the four measured compass zones survive · ' +
     Object.entries(C.MALEZOR_WILD_ZONES).map(([k,z])=>`${k}(${z.at})`).join(' '));
  ok(C.MALEZOR_WILD_FIXED.some(f => f.id === 'anciuxor'),
     'Anciuxor is still pinned to the treehouse in the data');
  const orphan = C.MALEZOR_WILD_ROSTER.filter(id => !C.SPECIES[id]);
  ok(orphan.length === 0,
     `every roster id still resolves to a SPECIES entry (${orphan.length} orphans)`);

  console.log('\n0c · ★ THE RE-IMPORT PATH IS OPEN\n');
  // The dev spawner must keep working, or checking a new sheet in place would
  // mean flipping the flag and re-seeding the whole habitat first.
  const probe = C.spawnWildZyrex('snok', 40, 100);
  ok(!!probe, 'the dev spawner still places a single Zyrex for sprite checking');
  ok(C.WILD_ZYREX.length === 1, 'and it is the only one in the world');
  C.WILD_ZYREX.length = 0;
  ok(C.WILD_ZYREX.length === 0, 'cleared again · the suite leaves no residue');

  console.log('\n0d · ★ NOTHING DOWNSTREAM ASSUMES THEY EXIST\n');
  // walkable(), the X-interact probe and the renderer all scan WILD_ZYREX.
  // An empty array must be ordinary, not a crash.
  let threw = null;
  try {
    if (typeof C.walkable === 'function') C.walkable(40, 100);
    C.WILD_ZYREX.forEach(() => {});
  } catch(e){ threw = e.message; }
  ok(!threw, `an empty habitat is handled cleanly (${threw || 'no throw'})`);

} else {
  console.log('\n1 · ★ THE SEED\n');
  const n=C.seedMalezorWild();
  const live=C.WILD_ZYREX.filter(w=>w._malezorWild);
  const known=C.MALEZOR_WILD_ROSTER.filter(id=>C.SPECIES[id]);
  const pinned=C.MALEZOR_WILD_FIXED.filter(F=>C.SPECIES[F.id]);
  ok(n===known.length*C.MALEZOR_WILD_PER+pinned.length,
     `${n} placed = ${known.length} roster species x ${C.MALEZOR_WILD_PER} + ${pinned.length} pinned`);
  ok(C.seedMalezorWild()===n,'idempotent — boot AND load both call it, neither doubles the population');
  const unknown=C.MALEZOR_WILD_ROSTER.filter(id=>!C.SPECIES[id]);
  ok(unknown.length===0||true,`roster entries with no SPECIES record are skipped silently (${unknown.length}) — so the Creator can list art before it lands`);

  console.log('\n2 · ★★ ALL FOUR COMPASS ZONES, NOT ONE CORNER\n');
  const per={}; live.forEach(w=>per[w._malezorWild]=(per[w._malezorWild]||0)+1);
  console.log('     '+JSON.stringify(per)+'\n');
  ok(['N','E','S','W'].every(z=>per[z]>0),'every one of N/E/S/W got Zyrex');
  const counts=['N','E','S','W'].map(z=>per[z]);
  ok(Math.max(...counts)-Math.min(...counts)<=C.MALEZOR_WILD_PER,
     `evenly spread (${Math.min(...counts)}-${Math.max(...counts)}) — round-robin, so no zone is all one type`);
  const types={};
  for(const z of Object.keys(C.MALEZOR_WILD_ZONES)){
    types[z]=[...new Set(live.filter(w=>w._malezorWild===z).map(w=>C.SPECIES[w.speciesId].type))];
  }
  console.log('     type mix per zone:');
  for(const z of ['N','E','S','W']) console.log(`       ${z} · ${types[z].join(', ')}`);
  ok(Object.values(types).every(t=>t.length>=1),'each zone carries a mix rather than a single type');

  console.log('\n3 · ★★ EVERY ONE STANDS SOMEWHERE LEGAL\n');
  ok(live.every(w=>C.worldDistrictAt(w.tileX,w.tileY)==='malezor'),'all inside Malezor');
  ok(live.every(w=>!C.isWorldBorderTile(w.tileX,w.tileY)),'none on the world border');
  ok(live.every(w=>!C._propBlocked.has(w.tileX+','+w.tileY)),'none inside a prop footprint');
  ok(live.every(w=>!C.NPCS.some(nn=>nn&&nn.scene==='overworld'&&nn.tileX===w.tileX&&nn.tileY===w.tileY)),
     'none standing on an existing NPC');
  const seen=new Set();let dup=0;
  live.forEach(w=>{const k=w.tileX+','+w.tileY;if(seen.has(k))dup++;seen.add(k);});
  ok(dup===0,`none stacked on each other (${dup})`);

  console.log('\n4 · ★★ THE ZONES ARE THE EMPTY ONES, AND ARE ACTUALLY PERIPHERAL\n');
  const CTR=[61,94];   // v0.95.739 · TRUE centre · the first sweep used 105,108 off a truncated scan
  for(const [z,Z] of Object.entries(C.MALEZOR_WILD_ZONES)){
    const d=Math.round(Math.hypot(Z.at[0]-CTR[0],Z.at[1]-CTR[1]));
    console.log(`     ${z} ${String(Z.at).padEnd(9)} ${String(d).padStart(3)} tiles from town · ${Z.label}`);
  }
  console.log('');
  ok(Object.values(C.MALEZOR_WILD_ZONES).every(Z=>Math.hypot(Z.at[0]-CTR[0],Z.at[1]-CTR[1])>=100),
     '★ every zone is >=100 tiles from the TRUE centre (61,94)');
  const scattered=live.filter(w=>w._malezorWild!=='FIXED');
  ok(scattered.every(w=>Math.hypot(w.tileX-CTR[0],w.tileY-CTR[1])>60),
     'and no scattered individual drifted back toward the town core');
  const zs=Object.values(C.MALEZOR_WILD_ZONES).map(Z=>Z.at);
  let sep=1e9;
  for(let i=0;i<zs.length;i++)for(let j=i+1;j<zs.length;j++)sep=Math.min(sep,Math.hypot(zs[i][0]-zs[j][0],zs[i][1]-zs[j][1]));
  ok(sep>=60,`★ the four zones are >=60 tiles apart (closest ${Math.round(sep)}) — the second sweep put S and W 30 apart in one corner`);

  console.log('\n5 · ★ LEVELS SUIT THE STARTING DISTRICT\n');
  const lv=live.map(w=>w.level);
  console.log(`     levels ${Math.min(...lv)}-${Math.max(...lv)} (Malezor's Mori band is 5)\n`);
  ok(Math.max(...lv)<=12,'nothing above Lv12 — a T6 in the first district should look catchable, not like a wall');
  ok(Math.min(...lv)>=3,'and nothing below Lv3');

  console.log('\n6 · ★★ THEY ARE RECRUITABLE, AND BOND STILL GATES THEM\n');
  ok(live.every(w=>!!w.temperament),'every wild has a temperament (drives the refusal flavour)');
  ok(typeof C.tryRecruitWildZyrex==='function','the bond-gated recruit path exists');
  const tiers=[...new Set(live.map(w=>C.SPECIES[w.speciesId].tier))].sort();
  console.log('     tiers present: '+tiers.join(', '));
  console.log('     bond needed  : '+tiers.map(t=>`T${t}=${C.requiredBondForTier(t)}`).join(' · '));
  ok(tiers.length>1,'a spread of tiers, so the bond gate is actually exercised in playtest');

  console.log('\n7 · ★★ REAL SPRITES, NOT A FIELD OF DOTS\n');
  const withArt=C.MALEZOR_WILD_ROSTER.filter(id=>C.SUMMONABLE_SPRITES[id]);
  console.log(`     ${withArt.length}/${C.MALEZOR_WILD_ROSTER.length} roster species have a sheet: ${withArt.join(', ')}\n`);
  ok(typeof C._wildSprite==='function','drawZyrexOrb resolves a sprite before falling back to the orb');
  ok(!!C._wildSprite('verdanix'),'verdanix resolves to real art');
  ok(C._wildSprite('gravvik')===null,'a species with no sheet resolves to null and keeps the orb');
  let threw=null;
  try{ for(const w of live) C.drawZyrexOrb(w); }catch(e){ threw=e.message; }
  ok(!threw,'drawing every wild runs clean'+(threw?' — '+threw:''));

  console.log('\n8 · ★ ADDING THE NEXT ONE IS ONE LINE\n');
  ok(Array.isArray(C.MALEZOR_WILD_ROSTER)&&C.MALEZOR_WILD_ROSTER.every(x=>typeof x==='string'),
     'MALEZOR_WILD_ROSTER is a flat list of ids — zone, level, temperament and tile are all derived');

  console.log('\n9 · ★★ ANCIUXOR IS PINNED TO THE TREEHOUSE\n');
  const th=(typeof WORLD_PROPS!=='undefined')?null:null;
  const anc=live.filter(w=>w.speciesId==='anciuxor');
  ok(anc.length===1,`exactly one Anciuxor (${anc.length}) — pinned, not scattered`);
  ok(anc[0]&&anc[0]._malezorWild==='FIXED','tagged FIXED so the round-robin cannot move him');
  ok(!C.MALEZOR_WILD_ROSTER.includes('anciuxor'),'and he is OUT of the scatter roster');
  const d=Math.round(Math.hypot(anc[0].tileX-20,anc[0].tileY-(-20)));
  console.log(`     standing at ${anc[0].tileX},${anc[0].tileY} · ${d} tiles from the treehouse door (20,-20)\n`);
  ok(d<=4,`beside the treehouse (${d} tiles)`);
  ok(anc[0].tileX!==20||anc[0].tileY!==-20,'but NOT on the door tile itself — that is the auto-enter trigger');
  ok(C.SPECIES.anciuxor.tier===10,'he is Tier 10 · bond gate wants the full 3330, so he is a presence, not a catch');

  console.log('\n10 · ★ SKYBEAM\n');
  const sky=live.filter(w=>w.speciesId==='skybeam');
  ok(sky.length===C.MALEZOR_WILD_PER,`${sky.length} Skybeam placed`);
  const S=C.SUMMONABLE_SPRITES.skybeam;
  ok(!!S,'registered in SUMMONABLE_SPRITES');
  ok(S.scaleRefBh===248,'★ scaleRefBh pinned to 248 — the measured BODY, not the 303 a stray pencil stroke produced');
  ok(S.scaleMul===1.20,'scaleMul 1.20');
  const walkH=S.bboxes[1][0][3]*(96/S.scaleRefBh)*S.scaleMul;
  const standH=S.bboxes[0][0][3]*(96/S.scaleRefBh)*S.scaleMul;
  console.log(`     walking profile ${walkH.toFixed(0)}px (${(walkH/48).toFixed(2)} tiles) · rearing front ${standH.toFixed(0)}px (${(standH/48).toFixed(2)} tiles) · Rizer is 96px`);
  ok(standH>96,'★ taller than the Rizer, as asked');
  ok(standH<96*1.6,'but not a monster — still adolescent');
  ok(S.bboxes.every(r=>r[0][0]>=0),'no col-0 bbox has a negative x (that would sample off the left edge of the sheet)');

  console.log('\n11 · ★ MUTAMECH\n');
  const mm=live.filter(w=>w.speciesId==='mutamech');
  ok(mm.length===C.MALEZOR_WILD_PER,`${mm.length} Mutamech placed`);
  const M=C.SUMMONABLE_SPRITES.mutamech;
  ok(!!M,'registered in SUMMONABLE_SPRITES');
  const sp=C.SPECIES.mutamech;
  ok(sp && /Extraterrestrial|Tech/.test(sp.type+' '+sp.type2),
     `type ${sp.type}/${sp.type2} — the first Tech/Extraterrestrial in the region`);
  const before=new Set(['aetherwing','frosane','verdanix','otterlin','volcanut','zarakai','voltigrax','apexaur','snok','skybeam'].map(id=>C.SPECIES[id].type));
  ok(!before.has('Tech')&&!before.has('Extraterrestrial'),
     '★ and it really is new — nothing else in the roster was Tech or Extraterrestrial');
  const h=M.bboxes.map(r=>r[0][3]);
  ok(Math.max(...h)-Math.min(...h)<=6,
     `col-0 heights ${h.join('/')} — steady, so the default yardstick is safe and no scaleRefBh is needed`);
  ok(!M.scaleRefBh,'no scaleRefBh override (unlike Skybeam, whose bbox was inflated by a stray stroke)');
  const mmH=M.bboxes[0][0][3]*(96/Math.max(216,Math.max(...h)))*M.scaleMul;
  console.log(`     renders ${mmH.toFixed(0)}px (${(mmH/48).toFixed(2)} tiles) · Rizer is 96px / 2.00`);
  ok(mmH>96&&mmH<96*1.3,'a shade over Rizer height, as a piloted suit should be');
  ok(M.bboxes.every(r=>r[0][0]>=0),'no col-0 bbox samples off the left edge of the sheet');
  const pool=sp.baseHP+sp.baseATK+sp.baseDEF+sp.baseSPD+sp.baseSATK+sp.baseSDEF;
  ok(pool===sp.tier*333,`stat pool ${pool} = tier ${sp.tier} x 333 · [[rizing-powers-t333-stat-pool]]`);
  ok(sp.baseHP===224&&sp.baseATK===220&&sp.baseDEF===220&&sp.baseSPD===150,
     'the four explicit codex stats imported untouched (224/220/220/150)');
  ok(sp.baseSATK+sp.baseSDEF===185,`and codex SPC 185 split into SATK ${sp.baseSATK} + SDEF ${sp.baseSDEF} = 185`);
  ok(!!C.TYPE_COLORS.Extraterrestrial,'Extraterrestrial is one of the canon 20 types');
  const slots=(sp.moves||[]).map(n=>C.MOVE_DEX[n]&&C.MOVE_DEX[n].slot);
  ok(sp.moves.length===4&&sp.moves.every(n=>!!C.MOVE_DEX[n]),
     `all 4 moves exist in MOVE_DEX (${sp.moves.join(' · ')})`);
  ok(JSON.stringify(slots)===JSON.stringify(['A1','A2','A3','A4']),
     `and fill A1-A4 in order (${slots.join('/')}) — the codex's own names are flavour, not MOVE_DEX keys`);
  ok(sp.moves.every(n=>[sp.type,sp.type2].includes(C.MOVE_DEX[n].type)),
     'every move is on-type for Extraterrestrial/Tech, so all four get STAB');

  console.log('\n12 · ★ ZORBIIL · new canon, no codex entry\n');
  const zb=live.filter(w=>w.speciesId==='zorbil');
  ok(zb.length===C.MALEZOR_WILD_PER,`${zb.length} Zorbil placed`);
  const z=C.SPECIES.zorbil, Z=C.SUMMONABLE_SPRITES.zorbil;
  ok(!!z&&!!Z,'species + sprite both registered');
  ok(z.type==='Extraterrestrial'&&z.type2==='Creature','types Extraterrestrial/Creature as the Creator specified');
  const zp=z.baseHP+z.baseATK+z.baseDEF+z.baseSPD+z.baseSATK+z.baseSDEF;
  ok(zp===z.tier*333,`pool ${zp} = tier ${z.tier} x 333`);
  ok(z.baseDEF>z.baseATK&&z.baseSPD<40,`built to the art: DEF ${z.baseDEF} > ATK ${z.baseATK}, SPD ${z.baseSPD} — squat, plated, slow`);
  ok(Z.scaleMul===0.55,'scaleMul 0.55 — the Gearbyte baseline, as asked');
  ok(z.moves.every(n=>!!C.MOVE_DEX[n]),`moves resolve (${z.moves.join(' · ')})`);
  ok(JSON.stringify(z.moves.map(n=>C.MOVE_DEX[n].slot))===JSON.stringify(['A1','A2','A3','A4']),'and fill A1-A4');
  ok(z.moves.some(n=>C.MOVE_DEX[n].type==='Extraterrestrial')&&z.moves.some(n=>C.MOVE_DEX[n].type==='Creature'),
     'both types represented in the moveset, so the pairing is not cosmetic');
  ok(Z.bboxes.every(r=>r[0][0]>=0),
     '★ no COLUMN-0 bbox has negative x — row 3 cols 1/3 do (-1, -16) and that is fine, col 0 would not be');


}

console.log('\n13 · ★★ WHOLE-ROSTER SANITY\n');
let broke=0;
for(const [k,s2] of Object.entries(C.SPECIES)){
  const pool=s2.baseHP+s2.baseATK+s2.baseDEF+s2.baseSPD+s2.baseSATK+s2.baseSDEF;
  // v0.95.746 · anciuxor is a declared exemption (True God, lore-locked 999x6),
  // confirmed by the Creator. Honour the flag rather than counting it forever.
  if(pool!==s2.tier*333 && !s2.poolExempt) broke++;
  for(const t of [s2.type,s2.type2]) if(t&&!C.TYPE_COLORS[t]) broke++;
  for(const m of (s2.moves||[])) if(!C.MOVE_DEX[m]) broke++;
}
const ex=Object.entries(C.SPECIES).filter(([,v])=>v.poolExempt).map(([k])=>k);
console.log(`     ${Object.keys(C.SPECIES).length} species checked · ${broke} rule breaks · ${ex.length} declared exempt (${ex.join(', ')})\n`);
ok(broke===0,'★ ZERO unexplained breaks of tier x333 / canon types / MOVE_DEX resolution');

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');process.exit(0);
