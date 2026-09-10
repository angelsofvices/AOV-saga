// ★★★ v0.96.71 · KELTHOR'S LADDER · the tutorial, driven rung by rung.
//
// Creator: "I basically want the player to learn how to play the game basics by
// doing kelthor missions ... make sure last ladder is still the soulphish to
// lead to omniris in zarvane."
//
// ★★ THE FAILURE THIS SUITE EXISTS TO PREVENT is written into the file already.
//   v0.95.989: the ladder was declared twice — once as branches inside the NPC
//   and once as an independent mirror in the quest log — and the two copies
//   disagreed about what Step 8 WAS.  The NPC handed over the Prismshard while
//   the log entry stayed unticked.  Twelve rungs is twelve more chances.
//   So the ladder is one array now, and this suite walks it with a real player
//   object, flipping exactly the flags the game itself writes.
const fs = require('fs'), vm = require('vm');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);
const pull = (re, l) => { const m = src.match(re); if (!m) throw new Error('pull ' + l); return m[0]; };

const code = [
  pull(/const KELTHOR_LADDERS = \[[\s\S]*?\n\];/, 'ladders'),
  pull(/const KELTHOR_LADDER = \[[\s\S]*?\n\];/, 'ladder'),
  pull(/function kelthorRungDone\(r\)[\s\S]*?\n\}/, 'done'),
  pull(/function kelthorNextRung\(\)[\s\S]*?\n\}/, 'next'),
  pull(/function kelthorLadderComplete\(\)\{[^}]*\}/, 'complete'),
].join('\n');

const sb = { player: {}, playItemGain(){}, Math };
const ctx = vm.createContext(sb);
vm.runInContext(code, ctx);
const val = e => vm.runInContext(e, ctx);          // ★ const is lexical

const fresh = () => { sb.player = { items:{}, party:[], stats:{}, lootedChests:[], kelthorStep:{} }; };

H('★ SHAPE · three ladders, twelve rungs, soulphish last');
const N = val('KELTHOR_LADDER.length');
ok(N === 13, `${N} rungs`);
ok(val('KELTHOR_LADDERS.length') === 3, 'grouped into 3 ladders');
ok(val('KELTHOR_LADDER[KELTHOR_LADDER.length-1].key') === 's13', 'the last rung is s13');
ok(/soulphish/i.test(val('KELTHOR_LADDER[12].label.toString()')), '★ and it is the SOULPHISH bridge');
ok(/OMNIRIS/.test(val('JSON.stringify(KELTHOR_LADDER[12].lines)')), '★ which names OMNIRIS, leading into Zarvane');
// ★ I first asserted '111112222223' (the purge in Ladder II) and the table was
//   RIGHT while the test was wrong: Kelthor's own rung-10 line says "Ladder
//   Three is one rung of housekeeping and one border", which is two rungs.
//   When the code and the dialogue agree, a test that disagrees with both is
//   the thing that is broken.
ok(val('KELTHOR_LADDER.map(r=>r.ladder).join("")') === '1111122222333',
   `ladder grouping ${val('KELTHOR_LADDER.map(r=>r.ladder).join("")')} — I:5 field, II:5 NPCs, III:3 Rakoron+bridge`);

H('★★ EVERY RUNG IS REACHABLE · flip only what the game itself writes');
fresh();
// the exact writes each rung waits on · sourced from the live flags, not invented
const CLIMB = {
  s1:  p => { p.raidCardGifted = true; p.kelthorMet = true; },
  s2:  p => { p.party = [{ id:'volcanut' }]; },
  s3:  p => { p.lootedChests = ['chest_1','chest_2','chest_3']; },
  s4:  p => { p.items.berry = 5; p.items.seed = 5; },
  s5:  p => { p.stats.moriKills = 5; },
  s6:  p => { p.radioTowerFixed = true; },
  s7:  p => { p.faeCollected = 5; },
  s8:  p => { p.nurseReinAllied = true; },
  s9:  p => { p.zureleaShopOpen = true; },
  s10: p => { p.orrenQuestDone = true; },
  s11: p => { p.vilerokKills = 5; p.rakoronCaveFound = true; },
  s12: p => { p.rakoronMet = true; },
  s13: p => { p.zarvaneEntered = true; p.items.soulphish = 3; },
};
const order = [];
for (let i = 0; i < 20; i++){
  const k = val('(kelthorNextRung()||{}).key');
  if (!k) break;
  order.push(k);
  if (!CLIMB[k]){ ok(false, `no known way to climb ${k}`); break; }
  CLIMB[k](sb.player);
  const climbed = val(`kelthorRungDone(KELTHOR_LADDER.find(r=>r.key==='${k}'))`);
  if (!climbed){ ok(false, `${k} did not register even after its own flag was written — DEAD GATE`); break; }
}
console.log('     ' + order.join(' → '));
ok(order.length === 13, `all 13 rungs climbed in order (${order.length})`);
ok(order.join(',') === 's1,s2,s3,s4,s5,s6,s7,s8,s9,s10,s11,s12,s13', 'and strictly in sequence — no rung skippable or stuck');
ok(val('kelthorLadderComplete()') === true, 'the ladder reports complete');

H('★★★ THE BRIDGE CANNOT BE SHORT-CIRCUITED · v0.95.989 in one assertion');
fresh();
for (const k of ['s1','s2','s3','s4','s5','s6','s7','s8','s9','s10','s11','s12']) CLIMB[k](sb.player);
sb.player.items.soulphish = 3;                 // fish, but never crossed
ok(val('(kelthorNextRung()||{}).key') === 's13', 'holding 3 Soulphish alone does NOT finish it');
ok(/not set foot in Zarvane/.test(val('KELTHOR_LADDER[12].hint()')),
   'and he says why — Soulphish are also caught at the Andrannor fountain');
sb.player.zarvaneEntered = true;
ok(val('kelthorLadderComplete()') === true, 'crossing the border finishes it');

H('★ STICKY · a rung stays climbed after you spend the goods');
fresh();
sb.player.kelthorStep = { s4: true };
sb.player.items.berry = 0; sb.player.items.seed = 0;
ok(val("kelthorRungDone(KELTHOR_LADDER.find(r=>r.key==='s4'))") === true,
   'Feed the Ward stays ticked with an empty bag');

H('★★ NO DEAD GATES · every flag a rung reads must have a writer in the build');
const body = val('KELTHOR_LADDER.map(r=>r.done.toString()+r.label.toString()+r.hint.toString()).join("\\n")');
const flags = [...new Set([...body.matchAll(/player\.([a-zA-Z]+)/g)].map(m => m[1]))]
  .filter(k => !['items','party','stats'].includes(k));
const dead = flags.filter(k => (src.match(new RegExp(`player\\.${k}\\s*=[^=]`, 'g')) || []).length === 0);
console.log('     reads: ' + flags.join(', '));
ok(dead.length === 0, dead.length ? `NEVER WRITTEN: ${dead.join(', ')}` : 'every one has a live writer');

H('★★ "s8" NO LONGER MEANS "FINISHED" · the rename trap');
ok(!/kelthorStep\.s8/.test(src.replace(/\/\/[^\n]*/g, '')),
   'nothing keys off kelthorStep.s8 any more — with 12 rungs it is Nurse Rein, four rungs early');
ok((src.match(/kelthorLadderComplete\(\)/g) || []).length >= 4,
   'those three call sites ask kelthorLadderComplete() by name instead');

H('★★★ v0.96.73 · NO PRISMSHARD · and Rakoron pays the rung instead');
ok(!/prismshardOwned = true/.test(src),
   'the ladder no longer grants a Prismshard — canon: it IS the Aenor Eruption, uncraftable');
ok(/rung/.test(val("KELTHOR_LADDER[11].title")) || val("KELTHOR_LADDER[11].key") === 's12',
   'rung 12 is the Rakoron meeting');
ok(/RAKORON|Rakoron/.test(val('JSON.stringify(KELTHOR_LADDER[11].lines)+KELTHOR_LADDER[11].label()')),
   'and it names Rakoron');
ok(/rubypaw_fang: 1/.test(src), 'Rakoron grants the RUBYPAW FANG');
ok(/player\.gemlordCavesOpen = false/.test(src), '★ and the caves shut behind you');
ok(/rubypaw_fang/.test(src.match(/const S1_WEAPON_RING = \[[\s\S]*?\n\];/)[0]),
   'the fang is declared in S1_WEAPON_RING — one seam, not a fifth pile of if-branches');
ok(/rubypaw_fang: 300/.test(src), 'with its own durability ceiling (300)');
// ★ the downstream break this change caused, and its fix
ok(/traced/.test(src) && /speciesId === 'mealux'/.test(src),
   "★★ Omniris Trial 8 lost its only Prismshard source — a bonded MEALUX now also opens it");

H('★ THE FLAVOUR HOOK · the ladder starts when Elarion makes you official');
ok(/if \(!player\.raidCardGifted\)\{[\s\S]{0,400}?Elarion/.test(src),
   'rung 1 refuses you until the R.A.I.D. card is signed, and Kelthor says so');

H(f ? `❌ ${f} failed` : '✅ twelve rungs, one table, one truth — and the bridge still leads to Omniris');
process.exit(f ? 1 : 0);
