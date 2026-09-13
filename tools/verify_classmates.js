// ★★★ v0.96.89 · SIXTEEN CLASSMATES, SCATTERED ACROSS A PLANET.
//
// Creator: "lets place them in different parts of the planet. all 16 of them
// spread out so rizer can have familiar faces along the journey … no sparring
// for now, just an encounter and dialogue of each classmate."
//
// ★★ THE TWO THINGS THAT CAN GO WRONG HERE ARE BOTH INVISIBLE.
//   1. A classmate placed on water, on a border buffer, or inside a building
//      does not throw. They just never appear, and nobody finds out until a
//      player walks to that district looking for a face they were promised.
//   2. A dialogue table with a typo'd key hands `undefined` to showDialog,
//      which renders an empty box. Also silent.
//   So this suite checks the ACTUAL TERRAIN with the game's own predicate, and
//   drives the real onInteract through both of its states.
const fs = require('fs'), vm = require('vm');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);

// ── terrain: rebuild the district predicate, resolving its own dependencies ──
function grabFn(n){ const i = src.indexOf('function ' + n + '('); if (i < 0) return null;
  let j = src.indexOf('{', i), d = 0; do { if (src[j] === '{') d++; else if (src[j] === '}') d--; j++; } while (d);
  return src.slice(i, j); }
function grabConst(n){
  let m = new RegExp('const ' + n + '\\s*=\\s*\\[').exec(src);
  if (m){ const j = src.indexOf('\n];', m.index); if (j > 0) return src.slice(m.index, j + 3); }
  m = new RegExp('(?:const|let|var)\\s+[^;\\n]*\\b' + n + '\\s*=[^;\\n]*;').exec(src);
  return m ? m[0] : null;
}
let code = [], have = new Set();
const add = n => { if (have.has(n)) return false; const c = grabFn(n) || grabConst(n);
                   if (!c) return false; have.add(n); code.push(c); return true; };
['ZYRAXIS_DISTRICTS', '_worldDistrictAtUncached'].forEach(add);
let T = null;
for (let p = 0; p < 40; p++){
  const fresh = vm.createContext({ console, Math, Uint8Array, Map, Set, Array, JSON, Number, Object });
  try {
    vm.runInContext(code.join('\n'), fresh);
    vm.runInContext('for(let y=-40;y<800;y+=13)for(let x=-90;x<1020;x+=13)_worldDistrictAtUncached(x,y);', fresh);
    T = fresh; break;
  } catch(e){
    const m = /(\w+) is not defined/.exec(e.message);
    if (!m || !add(m[1])) { console.log('terrain setup stuck:', e.message); process.exit(1); }
  }
}
const districtAt = (x, y) => vm.runInContext(`_worldDistrictAtUncached(${x},${y})`, T);

// ── the classmate table, lifted out of the build ────────────────────────────
const tbl = src.slice(src.indexOf('const STUDENTS = ['), src.indexOf('\n    ];', src.indexOf('const STUDENTS = [')) + 7);
const C = vm.createContext({});
vm.runInContext(tbl + '\nvar S = STUDENTS;', C);
const S = vm.runInContext('S', C);

H('★ THE CLASS IS SIXTEEN, AND ALL SIXTEEN LEFT');
ok(S.length === 16, `${S.length} classmates in the table`);
ok(new Set(S.map(s => s.name)).size === 16, 'sixteen distinct names');
ok(new Set(S.map(s => s.portrait)).size === 16,
   'sixteen distinct portrait cells — nobody wears another classmate\'s face');
ok(S.every(s => s.species), 'each keeps their partner Zyrex, for when sparring lands');

H('★★★ SPREAD ACROSS THE PLANET · not clustered, not in one town');
{
  const byD = {};
  for (const s of S) (byD[s.district] = byD[s.district] || []).push(s.name);
  const districts = Object.keys(byD);
  console.log('      ' + districts.map(d => `${d}:${byD[d].length}`).join('  '));
  const ALL = vm.runInContext('ZYRAXIS_DISTRICTS.map(d=>d.id)', T);
  ok(districts.length === 10, `${districts.length} districts hold a classmate`);
  const missing = ALL.filter(d => !byD[d]);
  ok(missing.length === 0, missing.length ? `★ no classmate in: ${missing.join(', ')}`
                                          : 'every one of the ten has at least one familiar face');
  ok(Math.max(...Object.values(byD).map(a => a.length)) <= 2,
     'and no district holds more than two — "spread out", not relocated');
}

H('★★★ EVERY ANCHOR IS REAL LAND, IN THE RIGHT DISTRICT');
{
  let bad = 0, coastal = 0;
  for (const s of S){
    const d = districtAt(s.tx, s.ty);
    if (d !== s.district){ bad++; console.log(`       ✖ ${s.name} (${s.tx},${s.ty}) is in ${d} — declared ${s.district}`); }
    // ★ and not perched on a coastline: the border buffer is impassable, so a
    //   tile with sea within 8 is a tile the settle may not escape.
    let clear = true;
    for (let k = 1; k <= 8 && clear; k++)
      for (const [ax, ay] of [[k,0],[-k,0],[0,k],[0,-k],[k,k],[-k,-k],[k,-k],[-k,k]])
        if (districtAt(s.tx + ax, s.ty + ay) == null){ clear = false; break; }
    if (!clear){ coastal++; console.log(`       ✖ ${s.name} (${s.tx},${s.ty}) sits within 8 tiles of open water`); }
  }
  ok(bad === 0, 'all 16 anchors resolve to the district they claim');
  ok(coastal === 0, '★ and all 16 are at least 8 tiles clear of the Void Sea / border buffer');
}

H('★★ THE SETTLE · the anchor picks the neighbourhood, walkable() picks the tile');
{
  const blk = src.slice(src.indexOf('window.settleClassmates = function'),
                        src.indexOf('// ★ how many of the sixteen'));
  ok(/if \(_classmatesSettled\) return 0;/.test(blk), 'runs once, not every frame');
  ok(/game\.scene !== 'overworld'/.test(blk), "and only once the overworld is the live scene (walkable reads game.scene)");
  ok(/taken\.has\(key\(x, y\)\)/.test(blk), 'two classmates never settle onto the same tile');
  ok(/console\.warn\('\[rp7b\] classmate has nowhere to stand:'/.test(blk),
     '★ and a classmate with nowhere to stand SAYS SO rather than standing in a wall');
  ok(/_step\('settleClassmates', \(\) => settleClassmates\(\)\)/.test(src),
     'and it is actually wired into the frame loop');

  // drive it: stub walkable so a whole 3-tile block around one anchor is solid
  const ctx = vm.createContext({
    console, Math, Set,
    game: { scene: 'overworld' },
    player: { stats: {} },
    NPCS: S.map((s, i) => ({ id:`school_student_${i}`, name:s.name, _isSchoolStudent:true,
                             tileX:s.tx, tileY:s.ty, homeX:s.tx, homeY:s.ty })),
    walkable: (x, y) => !(Math.abs(x - S[0].tx) <= 3 && Math.abs(y - S[0].ty) <= 3),
    ensureNpcOccupancy(){},
    window: {},
  });
  vm.runInContext('let _classmatesSettled = false;\n' + blk + '\nvar settle = window.settleClassmates;', ctx);
  const moved = vm.runInContext('settle()', ctx);
  const n0 = vm.runInContext('NPCS[0]', ctx);
  ok(moved >= 1, `${moved} classmate(s) stepped off blocked ground`);
  ok(Math.abs(n0.tileX - S[0].tx) > 3 || Math.abs(n0.tileY - S[0].ty) > 3,
     '★ the one standing in a building walked out of it');
  ok(vm.runInContext('settle()', ctx) === 0, 'and a second call does nothing');
  const seen = new Set(vm.runInContext('NPCS.map(n=>n.tileX+","+n.tileY)', ctx));
  ok(seen.size === 16, 'all sixteen ended on distinct tiles');
}

H('★★★ ENCOUNTER + DIALOGUE · no sparring, by directive');
{
  ok(!/startTrainerBattle\(s\.species/.test(src),
     'no classmate starts a battle any more');
  ok(/schoolStudentId: opts\.schoolStudentId \|\| null/.test(src),
     '★ but the spar plumbing is LEFT INTACT — hand-to-hand and faction-v-faction are coming');
  // every classmate must have both states, and no blanks
  const thin = S.filter(s => !Array.isArray(s.met) || s.met.length < 3
                          || !Array.isArray(s.back) || s.back.length < 2
                          || [...s.met, ...s.back].some(l => !l || !l.trim()));
  ok(thin.length === 0, thin.length ? `★ thin or empty dialogue: ${thin.map(s=>s.name).join(', ')}`
                                    : 'all 16 have a first-meet scene (3+ lines) and a return line (2+)');
  // ★ and they must not be the SAME sixteen lines with a name swapped
  const firsts = new Set(S.map(s => s.met[0]));
  ok(firsts.size === 16, 'sixteen distinct opening lines — nobody is a reskin');
  ok(S.every(s => s.met.join(' ') !== s.back.join(' ')), 'and the return line differs from the first meet');

  // drive the real handler through both states
  const toasts = [];
  const ctx = vm.createContext({
    console, Object, Math,
    player: { stats: {} },
    showDialog: o => { ctx.__last = o; if (o.onDone) o.onDone(); },
    showToast: t => toasts.push(t),
    playSFX(){}, awardRizerXP(){},
    classmatesFound: () => Object.keys(ctx.player.stats.schoolMet || {}).length,
    __last: null,
  });
  const body = src.slice(src.indexOf('      onInteract: (n) => {\n        player.stats = player.stats || {};\n        player.stats.schoolMet'),
                         src.indexOf('    }));', src.indexOf('player.stats.schoolMet')));
  const handler = 'var s = ' + JSON.stringify(S[0]) + ';\nvar onInteract = ' +
                  body.replace(/^\s*onInteract:\s*/, '').replace(/,\s*$/, '') + ';';
  vm.runInContext(handler, ctx);
  const npc = { id: 'school_student_0', name: S[0].name };
  vm.runInContext(`onInteract(${JSON.stringify(npc)})`, ctx);
  ok(ctx.__last && ctx.__last.lines[0] === S[0].met[0], 'first interact plays the FIRST-MEET scene');
  ok(ctx.player.stats.schoolMet['school_student_0'] === true, 'and records the meeting');
  ok(toasts.some(t => /CLASSMATE FOUND/.test(t) && /1\/16/.test(t)), `and counts it: ${toasts[0]}`);
  vm.runInContext(`onInteract(${JSON.stringify(npc)})`, ctx);
  ok(ctx.__last.lines[0] === S[0].back[0], '★ second interact plays the RETURN line, not the first meet again');
  ok(toasts.length === 1, 'and does not re-toast a classmate you already found');
}

H('★★ THE RETIRED REWARD DOES NOT REACH BACK AND TAKE ONE');
{
  ok(!/player\.items\.zysphere = \(player\.items\.zysphere \|\| 0\) \+ 16/.test(src),
     'Elarion no longer hands out the 16 graduation Zyspheres');
  ok(/if \(player\.academyZyspheresGifted\)\{[\s\S]{0,200}Wear your R\.A\.I\.D\. proudly/.test(src),
     '★ but a save that already collected them still reads as a graduate — the flag is untouched');
  ok(!/Gauntlet abandoned/.test(src),
     '★★ and the gauntlet-reset is DELETED, not dormant — it could only ever have wiped an old save\'s flags on the way out the door');
}

H('★ NOBODY IS LEFT TELLING YOU TO GO BEAT AN EMPTY ROOM');
for (const [who, gone] of [['Zoryn', /Beat the sixteen and see Prof Elarion/],
                           ['Vireta', /cleared \$\{cleared\}\/16 practice matches/],
                           ['Elarion', /step inside · challenge every classmate/]])
  ok(!gone.test(src), `${who} no longer sends you into the classroom`);

H(f ? `❌ ${f} failed` : '✅ sixteen familiar faces, on real ground, across all ten districts');
process.exit(f ? 1 : 0);
