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
const FS=require('fs');
try{new Function(FS.readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={WEAPON_MAX_DUR,SWORD_MAX,RUBY_MAX,_armWeapon,_migrateWeaponDurability,renderZycellWeapons,WHUD_ART,currentWeaponKey,updateWeaponHUD,player,game};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)fail++;};
const H=t=>console.log('\n'+t);
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';

H('1 · ★★ THE ART EXISTS AND IS PIXEL-ALIGNED WITH THE OLD WHEEL');
// Both wheels are the same 1254 canvas with the same content bbox, so swapping
// the CSS background moves nothing on screen — only the centre slot changes.
// That is why this is a background swap and not a second element.
{
  const a=ROOT+'assets/2D sprites/ui/weapon-hud.png';
  const b=ROOT+'assets/2D sprites/ui/weapon-hud-sapphire.png';
  ok(FS.existsSync(a),'the base fist wheel is on disk');
  ok(FS.existsSync(b),'the sapphire wheel is on disk');
  ok(FS.statSync(b).size>20000,`${(FS.statSync(b).size/1024|0)}KB · not a stub`);
  ok(FS.statSync(a).size!==FS.statSync(b).size,'they are different images, not a copy');
}

H('2 · ★★ THE WHEEL FOLLOWS THE WEAPON');
{
  C.player.cosmeticSkin='normal';            // S1
  C.player.items={sapphire_sword:1};
  C.player.swordEquipped=false; C.player.swordBroken=false;
  ok(C.currentWeaponKey()==='fists','holstered in S1 · fists');
  C.player.swordEquipped=true;
  ok(C.currentWeaponKey()==='sapphire','★ equipped in S1 · the SAPPHIRE wheel');
  C.player.swordBroken=true;
  ok(C.currentWeaponKey()==='fists','a broken blade falls back to fists · you are not holding it');
  C.player.swordBroken=false;
}

H('3 · ★★ S1 AND S2 DO NOT CROSS');
// The equip gate already enforces this; the HUD must agree with it or the
// player sees a weapon they cannot swing.
{
  C.player.cosmeticSkin='power_upgrade';     // S2
  C.player.swordEquipped=true;               // S1 blade still flagged
  ok(C.currentWeaponKey()!=='sapphire',
     '★ in S2 the Sapphire never shows, even with swordEquipped still true');
  C.player.items.rubypaw_sword=1;
  C.player.rubypawEquipped=true; C.player.rubypawBroken=false;
  ok(C.currentWeaponKey()==='rubypaw','equipping the Rubypaw in S2 reads as rubypaw');
  C.player.cosmeticSkin='normal';
  ok(C.currentWeaponKey()==='sapphire','and dropping back to S1 returns the Sapphire');
}

H('4 · ★★ ALL THREE WHEELS ARE DISTINCT AND PIXEL-ALIGNED');
// ★ v0.95.785 · this section used to assert the Rubypaw FELL BACK to the base
// wheel, because its art did not exist. It does now, so the check asserts the
// opposite — and adds the alignment test that makes the swap safe, which the
// fallback never needed.
{
  const files={ fists:'weapon-hud.png', sapphire:'weapon-hud-sapphire.png', rubypaw:'weapon-hud-rubypaw.png' };
  const sizes={};
  for(const [k,f] of Object.entries(files)){
    const path=ROOT+'assets/2D sprites/ui/'+f;
    ok(FS.existsSync(path),`${k} wheel on disk · ${f}`);
    sizes[k]=FS.statSync(path).size;
    ok(sizes[k]>20000,`  ${(sizes[k]/1024|0)}KB · not a stub`);
    ok((C.WHUD_ART[k]||'').includes(f),`  and WHUD_ART.${k} points at it`);
  }
  ok(new Set(Object.values(sizes)).size===3,'all three are different images, none a copy of another');
  // ★ The section says PIXEL-ALIGNED, so prove it rather than assert it. Read
  // the PNG IHDR directly — if the canvases differ, background-size:contain
  // scales them differently and the wheel JUMPS on every weapon swap.
  const dims={};
  for(const [k,f] of Object.entries(files)){
    const buf=FS.readFileSync(ROOT+'assets/2D sprites/ui/'+f);
    ok(buf.slice(1,4).toString()==='PNG',`  ${k} is a real PNG`);
    dims[k]=[buf.readUInt32BE(16), buf.readUInt32BE(20)];
  }
  const key=k=>dims[k].join('x');
  ok(key('fists')===key('sapphire')&&key('fists')===key('rubypaw'),
     `★ all three canvases are ${key('fists')} — the swap cannot jump`);
  ok(C.WHUD_ART.rubypaw!==C.WHUD_ART.fists,
     '★ the Rubypaw no longer falls back to the base wheel');
  ok(C.WHUD_ART.rubypaw!==C.WHUD_ART.sapphire,
     '★ and it does not borrow the Sapphire\'s blue blade');
  const src=FS.readFileSync('/tmp/all.js','utf8');
  ok(!/no wheel art yet/.test(src),'the "no art yet" note is retired');
}

H('5 · ★★ IT IS ACTUALLY CALLED');
// v0.95.517 left this as a no-op stub. A re-enabled function nothing invokes is
// the same as a stub.
{
  const src=FS.readFileSync('/tmp/all.js','utf8');
  const calls=(src.match(/updateWeaponHUD\(\)/g)||[]).length;
  ok(calls>=4,`${calls} call sites`);
  const hud=src.indexOf('function updateRizerHUD');
  ok(/updateWeaponHUD\(\)/.test(src.slice(hud,hud+2500)),
     'the per-frame HUD tick refreshes it');
  ok(/player\.swordEquipped = !player\.swordEquipped;\s*\n\s*try \{ updateWeaponHUD/.test(src),
     'toggling the Sapphire repaints it immediately');
  ok(/player\.rubypawEquipped = !player\.rubypawEquipped;\s*\n\s*try \{ updateWeaponHUD/.test(src),
     'and so does toggling the Rubypaw');
  ok(!/intentionally empty/.test(src),'the old no-op stub is gone');
}

H('6 · ★ L1/R1 STILL CYCLE THE WHEEL');
{
  const src=FS.readFileSync('/tmp/all.js','utf8');
  ok(/4:\s*'l',/.test(src)&&/5:\s*'r',/.test(src),'L1 and R1 map to l/r on the pad');
  ok(/if \(\(k === 'l' \|\| k === 'r'\) && !game\.zphoneOpen\)/.test(src),
     'and the weapon-cycle handler listens for them outside the phone');
}

H('7 · ★ A DULL BLADE READS AS DULL');
{
  const src=FS.readFileSync('/tmp/all.js','utf8');
  const i=src.indexOf('function updateWeaponHUD');
  const body=src.slice(i,i+1400);
  ok(/swordDurability/.test(body)&&/rubypawDurability/.test(body),
     'the wheel reads each blade\'s OWN durability');
  ok(/saturate\(/.test(body),'and desaturates as it wears');
}


H('8 · ★★ EACH BLADE HAS ITS OWN CEILING · blue 100, red 200');
// Creator: "blue sword should be x/100. red sword is x/200."
{
  ok(C.SWORD_MAX===100,`Sapphire Tearsword maxes at ${C.SWORD_MAX}`);
  ok(C.RUBY_MAX===200,`Rubypaw Longsword maxes at ${C.RUBY_MAX}`);
  ok(C.WEAPON_MAX_DUR.sapphire_sword===100&&C.WEAPON_MAX_DUR.rubypaw_sword===200,
     'and both live in one table rather than twelve literals');
  C.player.items={sapphire_sword:1,rubypaw_sword:1};
  C._armWeapon('sapphire_sword'); C._armWeapon('rubypaw_sword');
  ok(C.player.swordDurability===100,`a fresh Tearsword arms at ${C.player.swordDurability}`);
  ok(C.player.rubypawDurability===200,`a fresh Rubypaw arms at ${C.player.rubypawDurability}`);
}

H('9 · ★★ THE PANEL PRINTS THE RIGHT CEILING');
// This is what the Creator actually sees. The constants can be right while the
// readout still says /200 — which is exactly how it shipped a minute ago.
{
  C.player.cosmeticSkin='normal'; C.player.swordEquipped=true;
  const html=C.renderZycellWeapons();
  const pairs=[...html.matchAll(/DURABILITY<\/span><span[^>]*>(\d+)\/(\d+)</g)].map(m=>m[1]+'/'+m[2]);
  ok(pairs.length===2,`both blades listed · ${pairs.join(' and ')}`);
  ok(pairs.some(p=>p.endsWith('/100')),'one reads out of 100');
  ok(pairs.some(p=>p.endsWith('/200')),'the other out of 200');
  ok(!/\/200<\/span>[\s\S]{0,400}SAPPHIRE/i.test(html),'the Sapphire is not the one showing /200');
}

H('10 · ★★ NO STRAY 200s LEFT ON THE BLUE BLADE');
// The number was hardcoded in twelve places. A single missed one shows the
// player a bar past the end of its own track.
{
  const src=FS.readFileSync('/tmp/all.js','utf8');
  const i=src.indexOf('function _armWeapon');
  const region=src.slice(Math.max(0,i-3000), i+3000);
  ok(/WEAPON_MAX_DUR/.test(src),'the table exists in the shipped script');
  // every durability read must go through a constant
  const bad=[...src.matchAll(/swordDurability[^;\n]{0,60}?\b200\b/g)].map(m=>m[0]);
  ok(bad.length===0,`no swordDurability expression still says 200${bad.length?': '+bad[0]:''}`);
}

H('11 · ★★ AN OLD SAVE DOES NOT DRAW PAST THE END OF THE BAR');
{
  C.player.swordDurability=200; C.player.rubypawDurability=200;
  C._migrateWeaponDurability();
  ok(C.player.swordDurability===100,`a legacy 200/100 Tearsword clamps to ${C.player.swordDurability}`);
  ok(C.player.rubypawDurability===200,'and the Rubypaw is left alone at 200');
  C.player.swordDurability=45;
  C._migrateWeaponDurability();
  ok(C.player.swordDurability===45,'a legal value is not touched');
}

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
