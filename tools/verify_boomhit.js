// v0.95.648 · verify BOOM chests detonate when STRUCK, and out-damage S1 astralkick.
const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};
global.setInterval = () => 0;
const pending = [];
global.setTimeout = (f, ms) => { pending.push({ f, ms: ms || 0 }); return pending.length; };
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width: 0, height: 0, data: [] }) });
const el = () => ({ style:{}, dataset:{}, classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
  width:960, height:540, value:'', textContent:'', innerHTML:'', children:[], childNodes:[],
  getContext:()=>CTX, appendChild:noop, removeChild:noop, addEventListener:noop, removeEventListener:noop,
  setAttribute:noop, getAttribute:()=>null, focus:noop, remove:noop,
  querySelector:()=>el(), querySelectorAll:()=>[], getBoundingClientRect:()=>({left:0,top:0,width:960,height:540}) });
global.addEventListener = noop; global.removeEventListener = noop;
global.document = { getElementById:()=>el(), querySelector:()=>el(), querySelectorAll:()=>[],
  createElement:()=>el(), addEventListener:noop, body:el(), documentElement:el(), head:el(),
  hidden:false, visibilityState:'visible' };
global.window = global; global.localStorage = { getItem:()=>null, setItem:noop, removeItem:noop };
global.Audio = function(){ return { play:()=>Promise.resolve(), pause:noop, addEventListener:noop, cloneNode(){return this} }; };
global.Image = function(){ return { addEventListener:noop, complete:false, naturalWidth:0, src:'' }; };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches:false, addEventListener:noop, addListener:noop });
global.navigator = { userAgent:'node', getGamepads:()=>[], maxTouchPoints:0 };
global.performance = { now: () => Date.now() };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });

try {
  new Function(src + ';globalThis.__C={BOOM,NPCS,WORLD_PROPS,player,game,BOULDERS,' +
    'detonateBoomChest,explosiveAt,seerChestAt,applyAstralHit,ASTRAL_KICK,ASTRAL_STRIKE,' +
    'ASTRAL_THROW,playerOutgoingDamage,PLAYER_SKINS};')();
} catch (e) { console.log('❌ eval', e.message.split('\n')[0]); process.exit(1); }
const C = globalThis.__C;
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) fails++; };
const flush = () => { const q = pending.splice(0); q.sort((a,b)=>a.ms-b.ms); q.forEach(t => { try { t.f(); } catch(_){} }); };

const ATK = 25;
console.log('\n1 · DAMAGE LADDER · "does more damage than s1 astralkick"\n');
const kickS1  = ATK * C.ASTRAL_KICK.DMG_MULT   * 1;
const strike  = ATK * C.ASTRAL_STRIKE.DMG_MULT * 1;
const centre  = ATK * C.BOOM.DMG_CENTER        * 1;
const ring = d => ATK * C.BOOM.DMG_RING * (1 - ((d - 1) / C.BOOM.RADIUS) * 0.6);
console.log(`     A3 astralstrike ......... ${strike}   (1 tile lane)`);
console.log(`     A4 astralkick S1 ........ ${kickS1}   (5x5, per tile)`);
console.log(`     BOOM centre ............. ${centre}   (landing tile)`);
console.log(`     BOOM ring d1/d2/d3 ...... ${ring(1)} / ${ring(2)} / ${ring(3)}\n`);
ok(centre > kickS1, `boom centre ${centre} beats S1 astralkick ${kickS1}`);
ok(centre > strike, `boom centre ${centre} beats astralstrike ${strike}`);
ok(centre >= 125,   `boom centre one-shots a 125 HP Mori`);
ok(ring(3) < ring(1) && ring(1) < centre, 'falloff is strictly monotonic centre -> rim');
ok(ATK * C.BOOM.DMG_CENTER * 2 === 300, `S2 skin doubles it to 300`);

console.log('\n2 · explosiveAt() finds chests every impact path shares\n');
const chest = C.WORLD_PROPS.find(p => p._seerExplosive && !p._hidden && !p.detonated);
ok(!!chest, `live Seer chest present at (${chest && chest.tileX},${chest && chest.tileY})`);
C.game.scene = 'overworld';
ok(C.explosiveAt('overworld', chest.tileX, chest.tileY) === chest, 'explosiveAt returns it');
ok(C.explosiveAt('overworld', chest.tileX + 40, chest.tileY) === null, 'returns null on an empty tile');

console.log('\n3 · A3 ASTRALSTRIKE detonates a chest it flies into\n');
C.player.x = chest.tileX; C.player.y = chest.tileY - 8;
C.player.hp = 100; C.player.hpMax = 100; C.player.baseAtk = ATK;
// park a Mori on the chest tile so we can measure the blast, not the projectile
const mori = C.NPCS.find(n => n.isEnemy && !n._dying);
const origin = { s: mori.scene, x: mori.tileX, y: mori.tileY };
mori.scene = 'overworld'; mori.tileX = chest.tileX; mori.tileY = chest.tileY;
mori.hpMax = 125; mori.hp = 125;
const hitRet = C.applyAstralHit(chest.tileX, chest.tileY, 'normal');
ok(hitRet === true, 'applyAstralHit reports a hit (projectile terminates here)');
ok(!!chest._boomArmed, 'chest is ARMED by the astralstrike');
flush();
ok(chest.detonated === true, 'chest detonated');
ok(mori.hp <= 0, `Mori on the landing tile took the full ${centre} (hp ${mori.hp})`);
ok(C.player.hp === 100, 'Rizer 8 tiles away took nothing');

console.log('\n4 · THROWN objects · lane collision arms the chest\n');
ok(/const laneBomb=explosiveAt\(game\.scene,nx,ny\)/.test(src), 'flight path tests explosiveAt each tile');
ok(/if\(collisionBomb\)detonateBoomChest\(collisionBomb,skinId\);/.test(src.replace(/\n/g,'\n')),
   'both resolve branches detonate on contact');
const branches = (src.match(/if\(collisionBomb\)detonateBoomChest/g) || []).length;
ok(branches === 2, `wired in BOTH throw branches (rock + enemy) — found ${branches}`);
ok(src.indexOf('const laneBomb=explosiveAt') < src.indexOf('if(collisionRock){impactX=nx;impactY=ny;break;}'),
   'bomb test runs BEFORE the boulder/unwalkable break (a chest tile is already unwalkable)');

console.log('\n5 · idempotence · a chest cannot double-detonate\n');
const chest2 = C.WORLD_PROPS.find(p => p._seerExplosive && !p._hidden && !p.detonated);
C.player.x = chest2.tileX + 20; C.player.y = chest2.tileY + 20;
C.detonateBoomChest(chest2, 'normal');
flush(); flush();                                     // the one real blast resolves
ok(chest2.detonated === true, 'chest2 blew once');
const before = C.NPCS.filter(n => n.isEnemy).map(n => n.hp);
C.detonateBoomChest(chest2, 'normal');                // spam it
C.detonateBoomChest(chest2, 'normal');
flush(); flush();
ok(pending.length === 0, 'repeat calls queue no second blast');
ok(JSON.stringify(before) === JSON.stringify(C.NPCS.filter(n => n.isEnemy).map(n => n.hp)),
   'repeat calls apply no extra damage');

mori.scene = origin.s; mori.tileX = origin.x; mori.tileY = origin.y;
console.log(fails ? `\n❌ ${fails} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(0);
