// ★★★★ v0.99.13 · "HA KABOOM!" · the line is gated on DAMAGE, not on the bang.
//
//   Creator, 2026-09-20: "play this rvox when rizer explodes a trick chest
//   barrel and damage is done to an enemy 'ha kaboom!'"
//
// ★★★★ THE GATE IS THE WHOLE FEATURE. A thrown chest landing on nothing is the
//   COMMON case — the AOE is 3x3 and the throw carries 4-8 tiles — so wiring
//   this to the detonation would have Rizer crowing at an empty crater most
//   times he threw one. detonateBoomChest already walks every enemy in range;
//   counting that loop is the only honest test of "damage was done to an
//   enemy". This suite DRIVES a real detonation both ways rather than grepping
//   for the call, because whether the sound fires is a question about the
//   running game, not about the source.
import { bootGame } from './lib/boot_game.mjs';
import fs from 'fs';
import path from 'path';

let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; return !!c; };
const H  = t => console.log('\n' + t);
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');

const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['AUDIO','RVOX_PRIORITY','detonateBoomChest','BOOM','NPCS','player','game',
  'playerOutgoingDamage','startMoriDeath','creditRizerKill','spawnHitFx','showToast'] });
console.log = _L;

H('★★ THE CLIP IS ON DISK AND REGISTERED');
{
  const p = path.join(ROOT, 'audio/sfx-ha-kaboom.mp3');
  ok(fs.existsSync(p), `audio/sfx-ha-kaboom.mp3 exists (${fs.existsSync(p) ? fs.statSync(p).size : 0} bytes)`);
  ok(!!(G.AUDIO && G.AUDIO.sfx && G.AUDIO.sfx.kaboom), 'AUDIO.sfx.kaboom is registered · an unregistered name plays silence, not an error');
  const html = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
  ok(/kaboom:\s*new Audio\('audio\/sfx-ha-kaboom\.mp3'\)/.test(html), '★ and it points at the file that exists');
}

H('★★★ IT SITS AT 79 · above the weapon kill vox, below a real astral KO');
{
  const P = G.RVOX_PRIORITY;
  ok(P.kaboom === 79, `RVOX_PRIORITY.kaboom = ${P.kaboom}`);
  ok(P.kaboom > P.swordKillVox,
     `★★★ ${P.kaboom} > swordKillVox ${P.swordKillVox} · a boom kill routes through `
   + "creditRizerKill(n,'boom'), which plays the EQUIPPED weapon's kill vox — and no weapon "
   + 'was involved in a chest you threw. Below 78 the sword talks over the explosion');
  ok(P.kaboom < P.astralkickKo && P.kaboom < P.astralstrikeKo,
     `★★ ${P.kaboom} < the astral KOs (${P.astralkickKo}) · a genuine KO callout is the bigger beat and still wins`);
  ok(P.kaboom < P.ughGyat && P.kaboom < P.halfHp,
     '★ and the crisis tier still overrides it · dying outranks gloating');
}

// ── instrument the clip so a play() is observable and 'ended' can be flushed ──
// ★★ The boot shim's addEventListener is a no-op, so the game's own 'ended'
//   handler never runs and _rvoxLive stays latched after the first play — every
//   later case would then read 0 plays and "pass" by silence for the WRONG
//   reason. This stand-in stores handlers instead of dropping them, so
//   finishLine() below can end the previous line between cases.
let plays = 0;
const handlers = {};
const stub = {
  volume: 1, currentTime: 0,
  addEventListener(k, fn){ (handlers[k] = handlers[k] || []).push(fn); },
  removeEventListener(){}, pause(){},
  cloneNode(){ return stub; },
  play(){ plays++; return Promise.resolve(); },
};
// ★★★ 'ended' CANNOT be dispatched from inside play(). The game does
//   `node.play(); node.addEventListener('ended', …)` in that order, so at the
//   moment play() runs the handler does not exist yet — firing it there clears
//   nothing, _rvoxLive stays latched, and every later case reads 0 plays and
//   "passes" for exactly the wrong reason. Flushing BETWEEN cases models what
//   really happens: the previous line finishes before the next chest lands.
const finishLine = () => (handlers.ended || []).splice(0).forEach(fn => { try { fn(); } catch(_){} });
G.AUDIO.sfx.kaboom = stub;

// run deferred work inline so a fuse resolves within the call
const realST = globalThis.setTimeout;
globalThis.setTimeout = (fn) => { try { fn(); } catch(_){} return 0; };

function detonateWith(enemiesAt, { fresh = true } = {}){
  if (fresh) finishLine();   // previous VO has ended before this chest lands
  plays = 0;
  const scene = G.game.scene;
  const bx = G.player.x + 20, by = G.player.y + 20;
  const added = [];
  for (const [dx, dy] of enemiesAt){
    const n = { tileX: bx + dx, tileY: by + dy, scene, isEnemy: true, hp: 100000, hpMax: 100000,
                speciesId: 'mori', dir: 'down', _testDummy: true };
    G.NPCS.push(n); added.push(n);
  }
  const b = { tileX: bx, tileY: by, scene, _seerExplosive: true };
  try { G.detonateBoomChest(b, null); } catch(e){ console.log('    (detonate threw: ' + e.message + ')'); }
  for (const n of added) G.NPCS.splice(G.NPCS.indexOf(n), 1);
  return { plays, hurt: added.filter(n => n.hp < 100000).length };
}

H('★★★★ IT FIRES WHEN AN ENEMY IS CAUGHT');
{
  const r = detonateWith([[0, 0]]);
  ok(r.hurt === 1, `  the dummy in the centre tile actually took damage (${r.hurt} hurt)`);
  ok(r.plays === 1, `★★★★ "ha kaboom!" played ${r.plays}x on a blast that damaged an enemy`);
  const r2 = detonateWith([[1, 1], [-1, 0], [0, 1]]);
  ok(r2.hurt === 3 && r2.plays === 1,
     `★★★ three enemies caught · ${r2.hurt} damaged · still said ONCE (${r2.plays}) · it is a line, not a per-victim tick`);
  // ★★★ A five-chest chain must not stack five voices on top of each other.
  //   Nothing special was written for that: _rvoxLive drops any request at
  //   equal-or-lower priority while one is live, so the hierarchy that already
  //   governs every other Rizer line covers chains for free.
  const mid = detonateWith([[0, 0]], { fresh: false });
  ok(mid.hurt === 1 && mid.plays === 0,
     `★★★ a sympathetic chest detonating WHILE the line is still playing damaged ${mid.hurt} `
   + `and added ${mid.plays} voices · _rvoxLive drops it · a chain says "ha kaboom!" once`);
}

H('★★★★ AND STAYS QUIET WHEN THE CRATER IS EMPTY · the case that made this a gate');
{
  const r = detonateWith([]);
  ok(r.plays === 0, `★★★★ nothing in range · ${r.plays} plays · Rizer does not gloat at dirt`);
  const far = detonateWith([[G.BOOM.RADIUS + 3, 0]]);
  ok(far.hurt === 0 && far.plays === 0,
     `★★★ an enemy ${G.BOOM.RADIUS + 3} tiles out is OUTSIDE the ${G.BOOM.RADIUS}-tile blast · `
   + `${far.hurt} damaged · ${far.plays} plays · "in the explosion" is not "on the map"`);
}

H('★★ THE HAND-OPENED TRAP IS DELIBERATELY SILENT');
{
  // ★★ Opening a Seer chest in your hands damages the PLAYER and no one else.
  //   Its onInteract has no enemy loop at all, so there is nothing to crow
  //   about — and that path was left untouched on purpose.
  const html = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
  const i = html.indexOf('prop.onInteract = () => {');
  const body = html.slice(i, html.indexOf('return prop;', i));
  ok(i > 0 && !/playSFX\('kaboom'\)/.test(body),
     'the onInteract trap path never plays it · opening one on yourself is not a win');
  ok(/_enemiesHit\s*>\s*0/.test(html), '★★ and the throw path is gated on _enemiesHit, not on detonation');
}

globalThis.setTimeout = realST;
console.log(f ? `\n❌ ${f} failed` : '\n✅ fires on a blast that hurts someone · silent on an empty crater · once per bang');
process.exit(f ? 1 : 0);
