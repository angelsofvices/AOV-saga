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
// verify_devrizer · v0.95.803 · the RIZER dev tab
const FS=require('fs');
try{new Function(FS.readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={player,game,rizerAttrPool,rizerAttrSpent,rizerAttrUnspent,rizerBondTotal,'+
  'RIZER_LEVEL_CAP,RIZER_ATTR_MAX,RIZER_BOND_CAP,requiredBondForTier};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{ console.log(`  ${c?'✅':'❌'} ${m}`); if(!c) fail++; };
const H=t=>console.log('\n'+t);
const html=FS.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
const src=FS.readFileSync('/tmp/all.js','utf8');

H('1 · ★★ THE TAB BAR IS WHAT THE CREATOR ASKED FOR');
// Creator: "remove cosmetics dev mode panel. make a new one called rizer ...
// remove info tab. the new tab called rizer will replace current give tab."
{
  const tabs=[...html.matchAll(/<button data-devtab="([a-z]+)"/g)].map(m=>m[1]);
  ok(tabs.includes('rizer'),'★ RIZER exists');
  ok(!tabs.includes('give'),'★ GIVE is gone — Rizer replaced it');
  ok(!tabs.includes('cosmetics'),'★ COSMETICS is gone');
  ok(!tabs.includes('info'),'★ INFO is gone');
  ok(tabs[1]==='rizer',`and Rizer sits where Give was · ${tabs.join(' · ')}`);
  // ★ every tab BUTTON must have a matching PANEL, or a tab opens onto nothing
  const panels=[...html.matchAll(/<div class="devtab(?: active)?" data-devtab="([a-z]+)"/g)].map(m=>m[1]);
  for (const t of tabs) ok(panels.includes(t), `  ${t} has a panel`);
  for (const p of panels) ok(tabs.includes(p), `  ${p} panel has a tab`);
  ok(panels.length===tabs.length,`${tabs.length} tabs, ${panels.length} panels · exactly paired`);
}

H('2 · ★★ NOTHING WAS DROPPED ON THE FLOOR');
// The two retired tabs each held one row.  Every control in them has to still
// exist somewhere, or "remove the tab" silently became "remove the feature".
{
  const ids=['devHitStats','devFaeCounter','devHealBtn','devRideSkate',
             'devMaxBond','devFillBonds','devGiveAll','devGive50Seeds','devGive50Fae',
             'devGiveBackpack','devGiveZycube','devDadMissionComplete','devWildBattleTest'];
  for (const id of ids) ok(html.includes(`id="${id}"`), `  ${id} survived the move`);
  ok((html.match(/class="cosmetic-skin"/g)||[]).length===2,'both skin buttons survived');
  // and each appears exactly ONCE · a duplicated id means one handler binds and
  // the other button is dead
  const count = id => (html.split('id="'+id+'"').length - 1);
  for (const id of ids)
    if (count(id) !== 1) ok(false, `  ★ ${id} appears ${count(id)} times — a duplicate id leaves a dead button`);
  ok(ids.every(id => count(id) === 1),
     '★ no duplicated ids · every button is the one its handler binds to');
}

H('3 · ★★ GRANT MAX LEVEL · Lv 100, 3330 AP TO SPEND');
// Creator: "grant max level (level 100, 3330 attribute points to spend)"
{
  const P=C.player;
  ok(html.includes('id="devMaxLevel"'),'the button exists');
  P.rizerLvl=7; P.attrs={ hp:40, atk:12 };
  ok(C.rizerAttrSpent()===52,'starts with points already spent');
  // simulate the handler
  P.rizerLvl=C.RIZER_LEVEL_CAP; P.rizerXP=0; P.rxpUnlocked=true; P.attrs={};
  ok(P.rizerLvl===100,'★ level 100');
  ok(C.rizerAttrPool(P.rizerLvl)===C.RIZER_ATTR_MAX,`★ pool is ${C.RIZER_ATTR_MAX}`);
  ok(C.rizerAttrSpent()===0,'nothing spent');
  ok(C.rizerAttrUnspent()===3330,'★ 3330 attribute points TO SPEND, exactly as asked');
  // ★★ THE FIELD NAME.  An earlier draft cleared player.rizerAttrs, which
  //    nothing reads — the readout would have shown a full pool while the spend
  //    screen still showed the points gone.
  const h=src.indexOf("getElementById('devMaxLevel')");
  const body=src.slice(h, h+1200);
  ok(/player\.attrs = \{\}/.test(body),
     '★ it clears player.attrs — the field rizerAttrs() actually reads');
  // ★ match an ASSIGNMENT, not a mention · the comment above the line names the
  //   wrong field on purpose, to record the trap
  ok(!/player\.rizerAttrs\s*=/.test(body),'  and not a look-alike that nothing reads');
  ok(/player\.rizerXP\s*=\s*0/.test(body),'sits exactly ON the cap, not past it');
  // ★ the grant hands over the CURRENCY, not the spent result
  ok(!/attrs\.(hp|atk|def|spd|spc)\s*=/.test(body),
     '★ and does NOT auto-allocate — the point of granting a cap is to test the spend screen');
}

H('4 · ★★ GRANT MAX BOND · 3330, T10 UNLOCKED');
// Creator: "grant max bond (max AP, T10 bonds unlocked)"
{
  const P=C.player;
  ok(html.includes('id="devGrantMaxBond"'),'the button exists');
  P.bonds={}; P.devBondFloor=0; C.game.devMaxBond=false;
  const before=C.rizerBondTotal();
  P.devBondFloor=C.RIZER_BOND_CAP; C.game.devMaxBond=true;
  const after=C.rizerBondTotal();
  ok(after>before,`bond ${before} → ${after}`);
  ok(after===C.RIZER_BOND_CAP,`★ ${C.RIZER_BOND_CAP} · the cap`);
  const tier=Math.floor(after/333);
  ok(tier>=10,`★ T${Math.min(10,tier)} faction slots unlocked`);
  ok(after>=C.requiredBondForTier(10),'and it clears the T10 gate the roster actually checks');
  // ★ A FLOOR, NOT AN OVERRIDE.  Clearing the flag must restore the honest
  //   number rather than leaving a stale write behind.
  P.devBondFloor=0;
  ok(C.rizerBondTotal()===before,'★ clearing the dev flag restores the real total');
  const f=src.indexOf('function rizerBondTotal');
  ok(/Math\.max\(real, Math\.min\(RIZER_BOND_CAP, player\.devBondFloor/.test(src.slice(f,f+700)),
     '  because it is Math.max(real, floor), not an assignment');
  C.game.devMaxBond=false;
}

H('5 · ★ THE READOUT TELLS YOU WHAT HAPPENED');
{
  ok(html.includes('id="devRizerReadout"'),'the panel has a live readout');
  ok(/_devRizerReadout\(\)/.test(src),'which both grants refresh');
  const n=(src.match(/_devRizerReadout\(\)/g)||[]).length;
  ok(n>=3,`${n} call sites · both buttons plus the initial paint`);
}

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
