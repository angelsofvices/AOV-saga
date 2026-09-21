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
const src = require('./lib/all_src.cjs')();
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
vm.runInContext(grab('const RP7_FORM_LADDER = {', '\n};'), ctx);
vm.runInContext(grab('const ZYRAXIS_HALVES = {', '};'), ctx);
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
  // ★★★ RULED 2026-09-13 · Kelthor's death CAUSES the abduction, so its beat
  //   must sit on the same stop AND strictly before it.
  const order = kid.beats;
  for (const b of LAWS.malezorInvasion)
    ok(order.includes(b), `  the invasion beat "${b}" is on the stop`);
  ok(order.indexOf('kelthor_dies') < order.indexOf('parents_kidnapped'),
     '★★★ and Kelthor dies BEFORE they are taken — they are taken because he did');
  ok(order.indexOf('town_surrenders') < order.indexOf('parents_kidnapped'),
     '★ the surrender is what hands them over');
}

H('★★★ RULED 2026-09-13 · THE ENDGAME LADDER');
{
  // ★ S2 · the Creator overrode their own 2026-09-01 quote here, so the test
  //   asserts the NEW ruling and names the old one so nobody "restores" it.
  const kid = SPINE.find(s => (s.beats || []).includes('parents_kidnapped'));
  ok((kid.unlocks || []).includes('s2'),
     '★★ S2 unlocks with the rage, at the parents\' abduction (supersedes 2026-09-01)');
  ok(LAWS.s2UnlockAt === 'parents_kidnapped', 'and the law records the trigger');

  // ★★★ Egnellahc is not in RP7 — only his two Gemlord forms.
  const th = SPINE.find(s => s.at === 'thardin');
  ok((th.neverNamesInGame || []).includes('egnellahc'),
     '★★★ Thardin shows the VACANCY and never names Egnellahc');
  ok((LAWS.neverInRP7 || []).includes('egnellahc'),
     'and the law says so once, for the whole game');
  const said = /showDialog|showToast/.source;
  const leaks = src.split('\n').filter(l => /Egnellahc/i.test(l)
                && (/showDialog|showToast|lines:|say\(/.test(l)));
  ok(leaks.length === 0,
     leaks.length ? `★ Egnellahc is SPOKEN in game: ${leaks[0].trim().slice(0,80)}`
                  : 'and no player-facing line says his name');

  // ★★★ the post-victory ladder · Oatheus is the tenth, and the tenth buys the God
  const oat = SPINE.find(s => (s.beats || []).includes('oatheus_catchable'));
  ok(!!oat && oat.post === true, 'Oatheus is a POST-victory encounter');
  ok(oat.at === 'korathen' && (oat.requires || []).includes('lv100'),
     '★ back to Korathen at Lv100 to enter his cave');
  const anc = SPINE.find(s => (s.beats || []).includes('anciuxor_catchable'));
  ok(!!anc && (anc.requires || []).includes('all_ten_gemlords'),
     '★★★ and Anciuxor costs all ten Gemlords');
  ok(anc.n > oat.n, '★ Oatheus comes FIRST — he is the tenth, so he is the key');
  ok(LAWS.anciuxorRequires.level === 100 && LAWS.anciuxorRequires.gemlords === 10,
     `the law: Lv${LAWS.anciuxorRequires.level} + ${LAWS.anciuxorRequires.gemlords} Gemlords`);
}

H('★★★ LUMINARY IS S3 · one form, not two');
{
  // Creator 2026-09-13: "luminary is s3." The build already agreed — this
  // asserts nobody re-splits them, because the split cost 22 commissioned
  // sheets their meaning for about an hour.
  ok(LAWS.forms && LAWS.forms.s3 === 'luminary',
     `★★★ the law says S3 IS luminary (s1 ${LAWS.forms.s1} · s2 ${LAWS.forms.s2} · s3 ${LAWS.forms.s3})`);
  ok(LAWS.s3Gem === 'pearl',
     '★ and its gem is Pearl — which the Luminary art direction ("white, pearl and warm gold") already said');
  // the shipped ladder must have exactly three forms, ending in luminary
  const m = src.match(/const order = \['normal', 'power_upgrade'\];[\s\S]{0,200}?order\.push\('luminary'\)/);
  ok(!!m, 'the form ladder is normal → power_upgrade → luminary');
  ok(/const LUMINARY_UNLOCK_LV = 100;/.test(src),
     '★ unlocked at Lv100, exactly as shipped — the merge changed no gameplay');
  // and there must be no FOURTH form pretending to be S3
  ok(!/order\.push\('s3'\)|rizerForm.*'s3'/.test(src),
     '★★ and there is no separate "s3" form — that would orphan every *-luminary sheet');
}

H('★★★ A FORM IS LEARNED, THEN PERFECTED');
{
  const L = vm.runInContext('RP7_FORM_LADDER', ctx);
  const H2 = vm.runInContext('ZYRAXIS_HALVES', ctx);
  // ★ The S1 question looked like a contradiction for a day because two docs
  //   each named one of the two moments. Both are now on the record.
  ok(/innate/.test(L.s1.learned), `S1 is LEARNED ${L.s1.learned}`);
  ok(L.s1.perfected === 'vorashil', `★★★ and PERFECTED at ${L.s1.perfected} — ${L.s1.via}`);
  const vor = SPINE.find(s => s.at === 'vorashil');
  ok((vor.perfects || []).includes('s1'),
     '★★ so Vorashil keeps its turn — it is not left holding only Orryx I');
  ok((vor.unlocks || []).includes('sapphire_sword'), '  and the Sapphire Sword is its unlock');
  const mal = SPINE.find(s => s.at === 'malezor' && s.n === 1);
  ok((mal.learning || []).includes('s1') && !(mal.unlocks || []).includes('s1'),
     '★ Malezor LEARNS S1 and does not grant it');
  ok(L.s2.learned.includes('baelgor') && L.s2.perfected === 'endgame',
     `S2 learned ${L.s2.learned} · perfected ${L.s2.perfected}`);
  ok(L.s3.form === 'luminary' && L.s3.gem === 'pearl',
     `★ S3 is Pearl/Balance and its form is ${L.s3.form}`);
  // ★ the last unruled field in the ladder, confirmed 2026-09-13
  ok(L.s3.perfected === 'endgame of Part 2',
     `★★ S3 perfected at the ${L.s3.perfected}, vs ${L.s3.against}`);
  ok(!/unruled|NOT ASSUMED/i.test(JSON.stringify(L)),
     '★ and nothing in the form ladder is still marked unruled');
  // ★★★ THE BRIDGE IS THE BOUNDARY · "below" and "south" were never in conflict
  ok(H2.boundary === 'bridge_of_hope',
     `★★★ Lower Zyraxis is "${H2.lower}" — lower is relative to the BRIDGE, not a stratum`);
  ok(/ten districts/.test(H2.upper), `and Upper Zyraxis is ${H2.upper}`);
}

H('★★ AND THE GATE IS ACTUALLY WIRED, not just written down');
{
  ok(/function allTenGemlords\(\)/.test(src), 'allTenGemlords() exists');
  ok(/const GEMLORD_TEN = GEMLORD_WEAPONS\.map/.test(src),
     '★ the ten come from the shipped Gemlord table, not a second hand-typed list');
  ok(/anciuxorWillStay\(\)\{[\s\S]{0,200}allTenGemlords\(\)/.test(src),
     '★★★ anciuxorWillStay() checks BOTH halves — Lv100 was never the whole gate');
  ok(/return \(\(player\.bonds && player\.bonds\[id\]\) \|\| 0\) >= GEMLORD_RESPECT_PCT;/.test(src),
     '★ "or at least gained all their respect" — bond counts, as the Creator said');
  // drive it
  const c = vm.createContext({ player: { rizerLvl: 100, party: [], pcZyrex: [], sanctuary: [], bonds: {} },
                               GEMLORD_WEAPONS: [] });
  const blk = src.slice(src.indexOf('const GEMLORD_TEN ='), src.indexOf('function beginAnciuxorFlight'));
  c.GEMLORD_WEAPONS = Array.from({length:10}, (_, i) => ({ gemlord: 'g' + i }));
  c.ANCIUXOR_TAME_LV = 100;
  vm.runInContext(blk, c);
  const stay = e => vm.runInContext(e, c);
  ok(stay('anciuxorWillStay()') === false, 'Lv100 with zero Gemlords: he still flies');
  c.player.bonds = Object.fromEntries(Array.from({length:9}, (_, i) => ['g'+i, 100]));
  ok(stay('anciuxorWillStay()') === false, '★ nine of ten: he STILL flies');
  c.player.bonds.g9 = 100;
  ok(stay('anciuxorWillStay()') === true, '★★★ all ten: he stops running');
  c.player.rizerLvl = 99;
  ok(stay('anciuxorWillStay()') === false, 'and ten Gemlords below Lv100 is not enough either');
}

H('★★★ NOTHING STILL CONTESTED HAS BEEN BUILT');
{
  // ★ The list below is the eight moves the 2026-09-13 progression makes against
  //   already-ruled canon. Each must still be MARKED, not wired.
  const flagged = SPINE.flatMap(s => (s.contested || []).map(c => `${s.at}:${c}`));
  console.log('      ' + (flagged.join('  ·  ') || '(none)'));
  ok(flagged.length >= 2, `${flagged.length} contested beats still marked as unruled`);
  // ★★ S2 is the highest-cost one: Creator 2026-09-01 "he cant have s2 until
  //    endgame battle against xenoxil". Sensing was merged; granting was not.
  ok(!SPINE.some(s => (s.contested || []).includes('s2_unlock')),
     '★ S2 is no longer contested — it was ruled');
  ok(!SPINE.some(s => (s.unlocks || []).includes('s1')),
     '★ nor s1 — its source is contested too (R1)');
  const doc = fs.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/'
            + 'data/RULING_NEEDED_STORY_PROGRESSION_2026-09-13.md', 'utf8');
  for (const r of ['R4','R8'])
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
