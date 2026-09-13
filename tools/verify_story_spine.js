// ★★★ v0.96.93 · THE STORY SPINE, ASSERTED.
//
// Creator, 2026-09-13: "make every district answer one story question and create
// the reason for the next expedition. No duplicate revelations, no unnecessary
// detours, and no boss encounter before its canonical point."
//
// ★★ "NO BOSS ENCOUNTER BEFORE ITS CANONICAL POINT" IS A RULE THAT CAN ONLY BE
//   BROKEN QUIETLY. Wire Xenoxil into Xilnar and nothing throws — you get a
//   story that has stopped working, and no way to say when it stopped. The
//   whole reason the spine is a table is so this file can read it.
//
// ★★★ AND THE CONTESTED FLAGS ARE THE POINT. The 2026-09-13 progression moves
//   eight beats that were already ruled, two of them against the Creator's own
//   verbatim quotes. The instruction was "no retcons", so those beats are
//   recorded and NOT built. This suite fails if one is wired into gameplay
//   before it is ruled — which is the only way "recorded but not built" can
//   mean anything a month from now.
const fs = require('fs'), vm = require('vm');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);

function grab(decl, end){
  const i = src.indexOf(decl); const j = src.indexOf(end, i);
  return src.slice(i, j + end.length);
}
const ctx = vm.createContext({ console });
vm.runInContext(grab('const RP7_STORY_SPINE = [', '\n];'), ctx);
vm.runInContext(grab('const RP7_STORY_LAWS = {', '\n};'), ctx);
vm.runInContext(grab('const ZYRAXIS_DISTRICTS = [', '\n];'), ctx);
const SPINE = vm.runInContext('RP7_STORY_SPINE', ctx);
const LAWS  = vm.runInContext('RP7_STORY_LAWS', ctx);
const DIST  = vm.runInContext('ZYRAXIS_DISTRICTS.map(d => d.id)', ctx);

H('★★★ ONE STORY QUESTION PER DISTRICT, AND TEN OF THEM');
{
  const forward = SPINE.filter(s => Number.isInteger(s.n) && s.n <= 10);
  ok(forward.length === 10, `${forward.length} forward district stops`);
  ok(forward.every(s => s.q && s.q.length), 'every stop answers a named question');
  const qs = forward.map(s => s.q);
  ok(new Set(qs).size === qs.length,
     'and no two districts answer the SAME question — "no duplicate revelations"');
  // the order must be the canon district order, I-X
  const order = forward.map(s => s.at);
  ok(JSON.stringify(order) === JSON.stringify(DIST),
     `the spine walks the canon district order\n       ${order.join(' → ')}`);
}

H('★★★ NO BOSS ENCOUNTER BEFORE ITS CANONICAL POINT');
{
  // ★ Xenoxil. The whole shape of Act III is that he is SEEN and not FOUGHT.
  const xilnar = SPINE.find(s => s.at === 'xilnar');
  ok(xilnar.boss === 'six_grunts', 'Xilnar fights the six grunts');
  ok((xilnar.noFight || []).includes('xenoxil'),
     '★ and explicitly does NOT fight Xenoxil — the escape is the point');
  ok(xilnar.beats.includes('xenoxil_escapes'), 'he escapes there');
  const kor = SPINE.find(s => s.at === 'korathen');
  ok(!String(kor.boss).includes('xenoxil'),
     '★ nor at Korathen — every escape buys him his powered state');
  const fights = SPINE.filter(s => String(s.boss || '').includes('xenoxil')
                                || (s.beats || []).includes('xenoxil_fight'));
  ok(fights.length === 0,
     `★★ Xenoxil is fought NOWHERE in the built spine yet — his fight is contested (R4)`);
  ok(LAWS.xenoxilFirstFightAt === 'bridge_of_hope',
     `the law records where it is meant to land: ${LAWS.xenoxilFirstFightAt}`);
}

H('★★ BOTH CHIEFS ARE BEATEN ONCE, THEN AGAIN');
for (const [chief, where] of Object.entries(LAWS.chiefRematch)){
  const first = SPINE.find(s => String(s.boss || '').includes(chief + '_1'));
  const again = SPINE.find(s => String(s.boss || '').includes(chief + '_2'));
  ok(first && first.at === where[0], `${chief}: first defeat at ${where[0]}`);
  ok(again && again.at === where[1], `${chief}: rematch at ${where[1]}`);
  ok(first.n < again.n, `${chief}: and the rematch comes second`);
}

H('★★★ THE KIDNAPPING WINDOW · handoff §21.4, narrowed');
{
  const kid = SPINE.find(s => (s.beats || []).includes('parents_kidnapped'));
  ok(!!kid, 'the kidnapping is on the spine');
  ok(kid.at === 'malezor' && kid.ret === true,
     '★ and it is the EMERGENCY RETURN to Malezor, not a forward stop');
  // every prerequisite must sit strictly earlier on the spine
  const posOf = key => {
    const s = SPINE.find(x => String(x.boss || '').includes(key)
                           || x.at === key || (x.beats || []).includes(key));
    return s ? s.n : Infinity;
  };
  for (const need of LAWS.kidnapAfter)
    ok(posOf(need) < kid.n, `  after ${need} (stop ${posOf(need)} < ${kid.n})`);
  ok(kid.beats.includes('rakoron_senses_resonance'),
     '★★ Rakoron SENSES the resonance there — §21.5 non-intervention, intact');
}

H('★★★ NOTHING CONTESTED HAS BEEN BUILT');
{
  // ★ The list below is the eight moves the 2026-09-13 progression makes against
  //   already-ruled canon. Each must still be MARKED, not wired.
  const flagged = SPINE.flatMap(s => (s.contested || []).map(c => `${s.at}:${c}`));
  console.log('      ' + (flagged.join('  ·  ') || '(none)'));
  ok(flagged.length >= 4, `${flagged.length} contested beats still marked as unruled`);
  // ★★ S2 is the highest-cost one: Creator 2026-09-01 "he cant have s2 until
  //    endgame battle against xenoxil". Sensing was merged; granting was not.
  const s2 = SPINE.find(s => (s.contested || []).includes('s2_unlock'));
  ok(!!s2, '★★★ the S2 unlock is flagged, not wired');
  ok(!SPINE.some(s => (s.unlocks || []).includes('s2')),
     '★★★ and no spine stop actually UNLOCKS s2 — the 2026-09-01 ruling stands');
  ok(!SPINE.some(s => (s.unlocks || []).includes('s1')),
     '★ nor s1 — its source is contested too (R1)');
  const doc = fs.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/'
            + 'data/RULING_NEEDED_STORY_PROGRESSION_2026-09-13.md', 'utf8');
  for (const r of ['R1','R2','R3','R4','R5','R6','R7','R8'])
    ok(doc.includes(r + ' ·'), `  ${r} has an entry with both sides quoted`);
}

H('★ EVERY STOP LEADS SOMEWHERE · "create the reason for the next expedition"');
{
  const dead = SPINE.filter((s, i) => i < SPINE.length - 1
                && !(s.beats || []).length && !(s.unlocks || []).length && !s.boss);
  ok(dead.length === 0,
     dead.length ? `stops with nothing in them: ${dead.map(s=>s.at).join(', ')}`
                 : 'no stop is a detour — each carries a beat, an unlock or a boss');
}

H(f ? `❌ ${f} failed` : '✅ the spine holds · and nothing unruled has been built');
process.exit(f ? 1 : 0);
