// ★★★ v0.99.1 · THE TWO PROFESSORS · driven, including the gift that fires once.
//
//   Creator, 2026-09-18: "make sure the giraffe professor lady gifts u 8
//   zysphere once you get your first zyrex from dad. she will continue to give
//   you quests based on catch zyrex. it is canon that the farmer cheetah is her
//   student. the elephant professor outside will give you side quests to
//   increase your bond level by 20 each time."
//
// ★★★ WHAT THIS GUARDS: a one-time gift that fires twice, a ladder whose
//   progress disagrees with the world, and a reward whose number drifts from
//   the instruction. All three are silent — the player just ends up with
//   sixteen spheres, or a quest that says 0/3 while three Zyrex walk behind
//   them, and nothing throws.
import { bootGame } from './lib/boot_game.mjs';
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; return !!c; };
const H  = t => console.log('\n' + t);

const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['buildQuestLog','VIRETA_TASKS','ELARION_TASKS','viretaTask','viretaStage',
  'elarionTask','elarionStage','elarionTaskDone','zyrexOwnedCount','BOND_EVENTS','VIRETA_SPHERE_GIFT',
  'NPCS','createZyrex','SPECIES','bumpRizerBond','rizerBondTotal','bondLedger','notebookState'] });
console.log = _L;
const P = G.player;
const npc = id => (G.NPCS || []).find(n => n && n.id === id);

H('★★★★ THE GIFT · eight spheres, once, and only after Dad');
{
  const V = npc('sub_prof_vireta');
  ok(!!V && typeof V.onInteract === 'function', 'Prof. Vireta is in the Academy with a handler');
  ok(G.VIRETA_SPHERE_GIFT === 8, `the gift is ${G.VIRETA_SPHERE_GIFT} Zyspheres · the Creator's number`);
  // before Dad hands over the starter, nothing is given
  P.items = {}; P.starterChosen = false; P.viretaSpheresGifted = false; P.viretaStage = 0;
  V.onInteract(V);
  ok(!(P.items.zysphere > 0), '★★ no spheres before starterChosen · the module cannot start without a Zyrex');
  // and after
  P.starterChosen = true;
  V.onInteract(V);
  ok(P.items.zysphere === 8, `★★★ 8 Zyspheres on the first visit after Dad (got ${P.items.zysphere})`);
  ok(P.viretaSpheresGifted === true, 'and the one-time flag is set');
  // ★ the test that matters for any gift: press again
  V.onInteract(V); V.onInteract(V);
  ok(P.items.zysphere === 8, `★★★★ still 8 after two more visits · a gift that repeats is a gift that breaks the economy`);
}

H('★★★ THE LADDER READS THE WORLD, NOT A FLAG');
{
  ok(G.VIRETA_TASKS.length >= 3, `${G.VIRETA_TASKS.length} field-module stages · ${G.VIRETA_TASKS.map(t=>t.need).join('/')} Zyrex`);
  ok(G.VIRETA_TASKS.every((t,i,a) => i === 0 || t.need > a[i-1].need), '★ each stage asks for more than the last');
  const V = npc('sub_prof_vireta');
  P.party = []; P.pcZyrex = [];
  const before = G.viretaStage();
  V.onInteract(V);
  ok(G.viretaStage() === before, '★★ talking with no Zyrex does not advance the module');
  // bond three, WITHOUT touching any quest flag
  for (const sid of Object.keys(G.SPECIES).slice(0, 3)) { const z = G.createZyrex(sid, 5); if (z) P.party.push(z); }
  ok(G.zyrexOwnedCount() === 3, `★★★ owned count comes from the party and the PC · ${G.zyrexOwnedCount()}`);
  const sph = P.items.zysphere;
  V.onInteract(V);
  ok(G.viretaStage() === before + 1, '★★★ …so three Zyrex advanced the module with no flag written by the quest');
  ok(P.items.zysphere > sph, `★ and she paid out (${sph} → ${P.items.zysphere})`);
}

H('★★★★ ELARION · every favour is worth exactly 20 bond');
{
  const E = G.BOND_EVENTS.rizerAcademyTask;
  ok(!!E, 'rizerAcademyTask exists');
  ok(E.pts === 20, `★★★ pts is ${E.pts} · the Creator said "increase your bond level by 20 each time"`);
  ok(E.path === 'rizer', '★ on the RIZER path · this is his bond, not a Zyrex\'s');
  // ★ 20 is not arbitrary: it is where this table already puts a one-off
  ok(G.BOND_EVENTS.rizerAlly.pts === 20 && G.BOND_EVENTS.rizerRaidcard.pts === 20,
     '★★ and it matches rizerAlly and rizerRaidcard · a favour is worth what bonding an ally is worth');
  // driven: the bond actually moves by 20
  const L = G.bondLedger(); const b0 = L.rizer || 0;
  G.bumpRizerBond('rizerAcademyTask');
  ok(Math.abs((G.bondLedger().rizer - b0) - 20) < 1e-9,
     `★★★ and the ledger really moves 20 (${b0} → ${G.bondLedger().rizer})`);
}

H('★★★ ELARION\'S FAVOURS ARE COUNTERS THE GAME ALREADY KEEPS');
{
  ok(G.ELARION_TASKS.length >= 3, `${G.ELARION_TASKS.length} favours`);
  for (const t of G.ELARION_TASKS){
    let n = null, threw = false;
    try { n = t.have(); } catch(_){ threw = true; }
    ok(!threw && typeof n === 'number',
       `  ${t.id.padEnd(9)} reads ${n} / ${t.need} · ${t.label.slice(0, 46)}`);
  }
  // ★ and completion is decided by that counter, not by a quest flag
  const E = npc('professor_elarian');
  ok(!!E && typeof E.onInteract === 'function', 'Professor Elarion is outside with a handler');
  P.raidCardGifted = true; P.elarionStage = 0;
  P.scrapjawTowersRestored = {}; P.radioTowerFixed = false;
  E.onInteract(E);
  ok(G.elarionStage() === 0, '★★ the first favour does not complete itself');
  P.radioTowerFixed = true;                       // the world changes, nothing else
  ok(G.elarionTaskDone(G.ELARION_TASKS[0]), '★★★ restoring a tower satisfies it, measured live');
  const b0 = G.bondLedger().rizer;
  E.onInteract(E);
  ok(G.elarionStage() === 1, '★ and talking to him banks it');
  ok(Math.abs((G.bondLedger().rizer - b0) - 20) < 1e-9, `★★ paying exactly 20 (${b0} → ${G.bondLedger().rizer})`);
}

H('★★ BOTH LADDERS APPEAR IN THE MISSIONS LOG');
{
  const q = G.buildQuestLog().quests;
  const fm = q.find(x => /Field Module/.test(x.title));
  const af = q.find(x => /Academy Favours/.test(x.title));
  ok(!!fm, `Vireta's module is in the log · "${fm && fm.title}"`);
  ok(!!af, `Elarion's favours are in the log · "${af && af.title}"`);
  ok(fm.giver.includes('Vireta') && af.giver.includes('Elarion'), 'each names its giver');
  ok(fm.steps.some(s => s.done) && af.steps.some(s => s.done),
     '★★ and the steps already completed read as done · progress the player can see without asking twice');
  ok(!!fm.reward && !!af.reward, 'both declare a reward · every other entry in the log does');
  ok(af.reward.includes('20'), `★ and his says the number: "${af.reward}"`);
}

H('★ THE CANON · the farmer cheetah is her student');
{
  const src = (G.NPCS || []).map(n => JSON.stringify(n && n.onInteract ? String(n.onInteract) : '')).join('');
  ok(/Kaizari sat where you are standing/.test(src), "Vireta claims her · from inside the Academy");
  ok(/tell Vireta her module still shows/.test(src),
     '★★ and Kaizari confirms it · canon only one of two people mentions reads as one person\'s claim');
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ eight spheres once · both ladders read the world · every favour worth 20');
process.exit(f ? 1 : 0);
