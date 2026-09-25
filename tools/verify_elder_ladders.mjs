// ★★★★ v0.99.27 · NINE ELDER LADDERS · Creator, 2026-09-23: "make the ladder
//   for all the elder trials. just make skeletons. we will increase difficulty
//   of the ladders as we beta test."
//
// ★★★★ ONE TEMPLATE, NINE DATA ROWS. Writing nine more hand-authored ladders
//   like Kelthor's would be ~1,100 lines of prose in which every beta
//   difficulty tweak is an edit in nine places. Tuning is a NUMBER here.
import { bootGame } from './lib/boot_game.mjs';
import fs from 'fs';
import path from 'path';
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['ELDER_LADDERS','ELDER_TRIAL_DATA','ELDER_LADDER_GROUPS','elderNextRung',
  'elderLadderComplete','elderRungDone','_elderKillCount','_elderChestCount','player','game',
  'ELDER_BY_DIST','DISTRICT_ORDER','elderTrialComplete','chestUnlockState','KELTHOR_LADDER','hasDistrictKey',
  'towerRestored','DISTRICT_ENEMY_ROSTER','TOWN_HALL_VAULTS'] });
console.log = _L;
const P = G.player;
const reset = () => { P.elderTrials={}; P.elderStep={}; P.eldersMet={}; P.lootedChests=[];
  P.stats={}; P.vilerokKills=0; P.vorugathKills=0; P.scrapjawTowersRestored={};
  P.seerHqChests={}; P.visitedDistricts={}; G.game.devMaxBond=false; };

H('★★★ ALL NINE EXIST · Kelthor keeps his own');
{
  const L = G.ELDER_LADDERS;
  ok(Object.keys(L).length === 9, `${Object.keys(L).length} generated ladders`);
  ok(!L.malezor,
     '★★★ malezor is NOT generated · Kelthor\'s twelve rungs are authored prose and the Creator named them as the format, '
   + 'so replacing them with a template would trade writing for a loop and gain nothing');
  const missing = G.DISTRICT_ORDER.filter(d => d !== 'malezor' && !L[d]);
  ok(!missing.length, `★★★★ every non-Malezor district has one${missing.length ? ' · MISSING: ' + missing.join(', ') : ''}`);
  ok(Object.values(L).every(l => l.length === 6), 'six rungs each · skeleton depth');
  ok(G.ELDER_LADDER_GROUPS.length === 3, '★ three ladder groups, mirroring Kelthor\'s FIELD / DISTRICT / BRIDGE arc');
}

H('★★★★ EVERY RUNG READS STATE THAT ALREADY EXISTS');
{
  // ★★★★ A skeleton wired to imaginary flags cannot be tested, which is the
  //   opposite of what beta needs. Nothing here invented a flag: these are all
  //   live and already persisted.
  reset();
  const d = 'veridan', L = G.ELDER_LADDERS[d];
  const seen = [];
  const at = () => (G.elderNextRung(d) || { title:'(complete)' }).title;
  seen.push(at());
  P.eldersMet[G.ELDER_BY_DIST[d].id] = true;   seen.push(at());
  P.vilerokKills = 10;                          seen.push(at());
  P.lootedChests = ['chest_gold_veridan_0','w_veridan_1','x_veridan_2','veridan_3']; seen.push(at());
  P.scrapjawTowersRestored = { veridan:true };  seen.push(at());
  P.seerHqChests = { veridan:true };            seen.push(at());
  P.visitedDistricts = { netharion:true };      seen.push(at());
  ok(new Set(seen).size === 7,
     `★★★★ all six rungs advance on real state, in order · ${seen.join(' → ')}`);
  ok(G.elderNextRung(d) === null, '★★★ and the ladder finishes');
  // ★★★ ORDER MATTERS AND MY FIRST CUT HAD IT BACKWARDS. The flag is promoted
  //   LAZILY — elderLadderComplete writes it, and nothing calls that until
  //   something ASKS whether the trial is done. That is Kelthor's exact
  //   behaviour, not a gap. Checking player.elderTrials before anything asked
  //   read an empty object and blamed the code for the test's ordering.
  ok(P.elderTrials[d] === undefined,
     '★★ the flag is not written until something asks · promotion is lazy, exactly as Kelthor\'s is');
  // ★★★★ v0.99.40 · WHO ASKS CHANGED, AND THAT IS THE DESIGN. The vault used to
  //   test elderTrialComplete(), so merely walking up to it promoted the flag.
  //   It tests the VAULT KEY now, and the key is handed over by
  //   completeElderTrial() — which means the ELDER is what promotes it, when
  //   you report back. Finishing the last rung in the field no longer posts
  //   you the reward; you go and receive it, which is what "gifted by its
  //   district elder" says.
  ok(G.chestUnlockState('cosmic', d).open === false,
     '★★★ the vault is still shut on a finished ladder you have not reported · the key is not in your hand yet');
  ok(G.elderLadderComplete(d) === true,
     '★★★★ reporting to the Elder completes the ladder · this is the call their onInteract makes');
  ok(!!P.elderTrials[d] && !!P.items['key_' + d],
     '★★★★ …and THAT promotes the flag AND hands over the vault key · one ceremony, once');
  ok(G.chestUnlockState('cosmic', d).open === true,
     '★★★ with the key in hand the vault opens');
  ok(G.chestUnlockState('cosmic', 'xilnar').open === false, '★★ while every other vault stays sealed');
}

H('★★★ THE TWO DIFFICULTY DIALS ARE NUMBERS, AND THEY CLIMB');
{
  const D = G.ELDER_TRIAL_DATA;
  const kills = D.map(x => x.kills), chests = D.map(x => x.chests);
  ok(kills.every((k, i) => i === 0 || k >= kills[i-1]),
     `★★★ kill counts never go DOWN across the district order · ${kills.join(' ')}`);
  ok(chests.every((c, i) => i === 0 || c >= chests[i-1]),
     `★★ chest counts likewise · ${chests.join(' ')}`);
  ok(kills[kills.length-1] > kills[0] * 3,
     `★ and the last district asks ${kills[kills.length-1]} against the first's ${kills[0]} · there is a curve to tune, not a flat line`);
}

H('★★★★ THE ENEMY NAMED IN EACH RUNG ACTUALLY LIVES THERE');
{
  // ★★★★ A cull rung naming a species that does not spawn in that district is
  //   an uncompletable trial, and it would look exactly like a working one.
  const R = G.DISTRICT_ENEMY_ROSTER || {};
  for (const x of G.ELDER_TRIAL_DATA){
    const roster = R[x.dist] || [];
    const names = (Array.isArray(roster) ? roster : Object.keys(roster))
      .map(e => typeof e === 'string' ? e : (e.id || e.species || ''));
    ok(names.includes(x.enemy),
       `  ${x.dist.padEnd(10)} culls ${x.enemyLabel.padEnd(11)} · in roster: ${names.includes(x.enemy)}`);
  }
}

H('★★★ KILL COUNTERS ARE GLOBAL · the fallback is deliberate, not an oversight');
{
  // ★★★ Only three species have a counter in this build. A rung naming one of
  //   the others would never complete, so those fall back to the Mori count —
  //   every district is thick with them — and keep the species in the LABEL so
  //   the intent survives until per-species counters exist.
  reset();
  ok(G._elderKillCount('vilerok') === 0 && G._elderKillCount('satyrbeast') === 0, 'both start at 0');
  P.stats.moriKills = 7;
  ok(G._elderKillCount('satyrbeast') === 7,
     '★★★ a species with NO counter falls back to Mori kills · the rung is completable');
  ok(G._elderKillCount('vilerok') === 0,
     '★★★★ …while a species WITH its own counter still reads it · the fallback does not override real data');
  P.vilerokKills = 3;
  ok(G._elderKillCount('vilerok') === 3, '★★ and tracks it');
}

H('★★★ CHESTS ARE COUNTED PER DISTRICT');
{
  reset();
  P.lootedChests = ['chest_gold_xilnar_0','chest_gold_xilnar_1','chest_gold_veridan_0'];
  ok(G._elderChestCount('xilnar') === 2 && G._elderChestCount('veridan') === 1,
     `★★★ xilnar sees ${G._elderChestCount('xilnar')}, veridan sees ${G._elderChestCount('veridan')} · `
   + 'a district ladder counting the whole world would complete itself somewhere else');
}

H('★★ THE RUNNER MIRRORS KELTHOR\'S, SO THEY CANNOT DRIFT');
{
  const src = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
  ok(/player\.elderStep = player\.elderStep \|\| \{\}/.test(src),
     '★★ same persisted per-rung escape hatch as player.kelthorStep');
  ok(/elderStep: player\.elderStep \|\| \{\}/.test(src), '★★ and it is SAVED · a forced rung must survive a reload');
  ok(/if \(typeof elderLadderComplete === 'function' && elderLadderComplete\(dist\)\) return true;/.test(src),
     '★★★ elderTrialComplete reads the generated ladder for the other nine');
  ok(/elderNextRung === 'function'/.test(src),
     '★★★★ and the Elder SPEAKS their next rung · without this the ladders tick silently and the Elder '
   + 'reads two flavour lines forever, which is a vault that looks broken');
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ nine skeleton ladders on live state · difficulty is two numbers per district · vaults unseal on completion');
process.exit(f ? 1 : 0);
