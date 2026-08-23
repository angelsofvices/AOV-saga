// v0.95.718 · WILD BOND → FACTION → DEPLOY → RETURN
//
// Creator: "make sure when I bond with a wild zyrex they are added to my
// faction tab in the phone for deployment and return"
//
// Four links in one chain, and the chain is only as good as its weakest:
//
//   1  tryRecruitWildZyrex  → addZyrexToRoster
//   2  addZyrexToRoster     → player.party  (+ the tab is openable)
//   3  FACTION panel         reads player.party
//   4  toggleFactionSummon   deploys it, and returns it
//
// Links 1-3 were already sound. Link 4 was broken for EVERY wild recruit, and
// section 4 is the measurement that shows why: eleven species have overworld
// sheets, twelve species can spawn wild, and the two sets do not intersect at
// all. Every bond in the field produced a faction member that could never be
// deployed.
const fs = require('fs');
const path = '/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html';
const src = fs.readFileSync(path, 'utf8');
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const noC = src.replace(/\/\/[^\n]*/g, '');

function grab(name){
  const i = src.indexOf(`function ${name}(`);
  if (i < 0) return null;
  let d = 0, j = src.indexOf('{', i);
  for (; j < src.length; j++){ if (src[j]==='{') d++; else if (src[j]==='}'){ d--; if(!d) break; } }
  return src.slice(i, j + 1);
}
function objectAfter(anchor){
  const i = src.indexOf(anchor);
  if (i < 0) return null;
  let d = 0, j = src.indexOf('{', i);
  for (; j < src.length; j++){ if (src[j]==='{') d++; else if (src[j]==='}'){ d--; if(!d) break; } }
  return src.slice(src.indexOf('{', i), j + 1);
}

console.log('\n1 · ★ THE CHAIN EXISTS END TO END\n');
const CHAIN = ['tryRecruitWildZyrex','addZyrexToRoster','renderZycellFaction','toggleFactionSummon','drawZyrexOrb'];
const B = {};
for (const n of CHAIN){ B[n] = grab(n); ok(!!B[n], `${n}() present`); }

console.log('\n2 · ★★ BONDING PUTS IT IN THE FACTION ROSTER\n');
ok(/const res = addZyrexToRoster\(z\);/.test(B.tryRecruitWildZyrex || ''),
   'tryRecruitWildZyrex routes the bonded Zyrex through addZyrexToRoster');
ok(/player\.party\.push\(z\)/.test(B.addZyrexToRoster || ''),
   'addZyrexToRoster pushes it into player.party');
ok(/const party = \(player\.party \|\| \[\]\)/.test(B.renderZycellFaction || ''),
   'the FACTION panel reads player.party — the same array');
ok(/player\.zyrexMenuUnlocked = true/.test(B.addZyrexToRoster || ''),
   'and owning one UNLOCKS the page that lists them');
console.log('     Without that unlock, bonding your first wild Zyrex put it');
console.log('     somewhere the player could not open: the roster existed, the');
console.log('     tab did not.\n');
ok(/data-zysummon="\$\{i\}"/.test(B.renderZycellFaction || ''),
   'every filled slot carries data-zysummon, so TRIANGLE can deploy it');
ok(/toggleFactionSummon\(\+summonIdx\)/.test(noC),
   'and the key handler wires data-zysummon to toggleFactionSummon');

console.log('\n3 · ★★ DEPLOY AND RETURN ARE THE SAME TOGGLE\n');
const T = B.toggleFactionSummon || '';
ok(/if \(follower && follower\._summoned\)/.test(T),
   'an already-deployed Zyrex is RETURNED by the same call — one control, two directions');
ok(/follower\._summoned = false;[\s\S]{0,80}follower\.scene = '__despawn__'/.test(T),
   '  return clears _summoned and despawns it from the scene');
ok(/follower\._summoned = true;[\s\S]{0,300}follower\.scene = game\.scene;/.test(T),
   '  deploy sets _summoned and places it in the current scene');
ok(/isInActiveCombat\(\)/.test(T), 'returning mid-combat is refused (no despawning out of a fight)');
ok(/\(z\.hp \|\| 0\) <= 0/.test(T), 'a KO\'d Zyrex cannot be deployed');

console.log('\n4 · ★★ THE BUG · NO WILD SPECIES HAD AN OVERWORLD SHEET\n');
const sumObj = objectAfter('const SUMMONABLE_SPRITES');
const summonable = [...(sumObj || '').matchAll(/^\s{2}([a-z_0-9]+)\s*:\s*\{/gm)].map(m => m[1]);
const wildPicks = (src.match(/const picks = \[([\s\S]*?)\]\.filter/) || [])[1] || '';
const wild = [...wildPicks.matchAll(/'([a-z_0-9]+)'/g)].map(m => m[1]);
console.log(`     species with an overworld sheet (${summonable.length}): ${summonable.join(' ')}`);
console.log(`     species that spawn wild      (${wild.length}): ${wild.join(' ')}`);
const overlap = wild.filter(w => summonable.includes(w));
console.log('');
ok(summonable.length > 0 && wild.length > 0, 'both lists parsed');
console.log(`  ·  overlap: ${overlap.length ? overlap.join(' ') : 'NONE'}`);
console.log('');
console.log('     That empty intersection is the whole bug. Every wild recruit');
console.log('     reached the sprite gate and was refused with "sprite pending');
console.log('     · can\'t summon yet". The roster worked; deployment never did.\n');

console.log('5 · ★★ A MISSING SHEET IS NO LONGER A DEAD END\n');
// ★ First written against `src` and it failed — on my own comment, which
// quotes the retired string verbatim to explain what was removed. Test the
// CODE. Same for the second bail in callFactionSummonAll, which is the one
// that actually mattered: it was a SECOND copy of the same dead end.
ok(!/sprite pending · can't summon yet/.test(noC), 'the refusal string is gone from the code');
// There were THREE copies of `if (!spriteDef) return;`, not two: deploy-one,
// summon-all, and the treehouse spawner — so a Zyrex you owned was also
// simply absent from your own treehouse. All three are gone.
ok(!/if \(!spriteDef\) return;/.test(noC),
   'and so is every `if (!spriteDef) return;` bail — all THREE copies');
ok(/function makeZyrexFollower\(/.test(noC),
   'both deploy paths now build the follower through ONE makeZyrexFollower()');
// ★ /makeZyrexFollower\(z/ counted 3 — the two calls AND the DECLARATION,
// `function makeZyrexFollower(z, opts)`. Exclude the definition.
const callSites = (noC.match(/(?<!function )makeZyrexFollower\(z/g) || []).length;
ok(callSites === 2,
   `  and the two DEPLOY paths share it: deploy-one and summon-all (${callSites} call sites)`);
ok(/_th_zyrex_/.test(noC) && /_orbFollower: true[\s\S]{0,400}mode: 'wander'/.test(noC),
   '  the treehouse keeps its own literal (different id prefix + wander mode) but gets the orb too');
ok(/_orbFollower = true/.test(noC) || /_orbFollower: true/.test(noC),
   'the fallback follower is tagged _orbFollower');
ok(/if \(n && n\._orbFollower\)\{?\s*\n?\s*drawZyrexOrb\(n\);/.test(noC),
   'and the world layer draws it with drawZyrexOrb');
// the orb must be able to read the follower without an adapter
// drawZyrexOrb must be able to read the follower with no adapter.
const orbBody = B.drawZyrexOrb || '';
const builder = grab('makeZyrexFollower') || '';
for (const key of ['speciesId','_phase']){
  ok(orbBody.includes(`w.${key}`) && builder.includes(`${key}`),
     `  drawZyrexOrb reads w.${key} and makeZyrexFollower sets it — no adapter needed`);
}
ok(/tileX/.test(orbBody) && /tileY/.test(orbBody),
   '  tileX/tileY come from the summon placement, same as any follower');
ok(/mode: o\.mode \|\| 'follow'/.test(builder),
   "the follower defaults to mode:'follow', so the existing companion AI moves it");
console.log('');
console.log('     drawZyrexOrb is fully procedural — type colour, tier size,');
console.log('     bob, aura, shadow. It invents no art and fakes no sprite: an');
console.log('     orb is exactly what the player met in the wild, so deploying');
console.log('     one reads as "its astral form has not settled yet" rather');
console.log('     than as a missing asset.\n');
ok(!/no overworld form yet and stayed in the ZyCube/.test(src),
   'quick-summon no longer says sprite-less Zyrex "stayed in the ZyCube" — they deploy now');

console.log('\n6 · ★★ LIVE ROUND TRIP · BOND → PARTY → DEPLOY → RETURN\n');
const NPCS = [];
const player = { x: 10, y: 10, dir: 'down', party: [], pcZyrex: [], bonds: {}, rizerLvl: 1 };
const game = { scene: 'overworld' };
const toasts = [];
const env = {
  NPCS, player, game,
  SUMMONABLE_SPRITES: {},                        // ← the wild-recruit case: NO sheet
  PARTY_MAX: 8,
  SPECIES: { aetherwing: { name: 'Aetherwing', tier: 2, type: 'Astral' } },
  showToast: t => toasts.push(t),
  playSFX: () => {},
  showDialog: () => {},
  isInActiveCombat: () => false,
  isHumanoidAlly: () => false,
  canonType: t => t,
  requiredBondForTier: t => t * 333,
  rizerBondTotal: () => 99999,                   // bond clears the gate
  awardRizerXP: () => {},
  Image: function(){ return { set src(v){}, get src(){ return ''; } }; },
};
const run = new Function(...Object.keys(env), `
  ${grab('makeZyrexFollower')}
  ${B.addZyrexToRoster}
  ${B.toggleFactionSummon}
  return { addZyrexToRoster, toggleFactionSummon };
`)(...Object.values(env));

const z = { speciesId: 'aetherwing', name: 'Aetherwing', tier: 2, hp: 40, level: 10 };
const res = run.addZyrexToRoster(z);
ok(res.location === 'party', `a bonded wild Zyrex lands in the ${res.location}`);
ok(player.party.length === 1 && player.party[0] === z, 'player.party holds exactly it');
ok(player.zyrexMenuUnlocked === true, 'and the FACTION tab is unlocked');

run.toggleFactionSummon(0);
const follower = NPCS.find(n => n.id === '_summon_aetherwing');
ok(!!follower, 'deploying created the follower NPC');
ok(follower && follower._orbFollower === true, '  as an ORB follower, since it has no sheet');
ok(follower && follower._summoned === true, '  marked deployed');
ok(follower && follower.scene === 'overworld', '  placed in the current scene');
ok(follower && follower.tileY === player.y + 1, `  beside Rizer (tile ${follower && follower.tileX},${follower && follower.tileY})`);
ok(!toasts.some(t => /can't summon|pending · can/.test(t)),
   `  and NOT refused · toast was "${toasts[toasts.length-1]}"`);

run.toggleFactionSummon(0);
ok(follower._summoned === false, 'toggling again RETURNED it');
ok(follower.scene === '__despawn__', '  and despawned it from the scene');
ok(/returned to your ZyCube/.test(toasts[toasts.length-1] || ''),
   `  with the return toast: "${toasts[toasts.length-1]}"`);

run.toggleFactionSummon(0);
ok(follower._summoned === true, 'and it can be deployed again — the toggle is stable across cycles');

console.log('\n7 · ★ THE ROSTER SURVIVES A SAVE\n');
ok(/party:\s*\(player\.party/.test(src) || /party:\s*player\.party/.test(src),
   'player.party is written to the savestate');
ok(/zyrexMenuUnlocked: !!player\.zyrexMenuUnlocked/.test(noC),
   'and so is zyrexMenuUnlocked — it was NEVER saved before, so bonding a wild');
console.log('     Zyrex then reloading shut the page that listed it again.');

console.log(f ? `\n❌ ${f} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(0);
