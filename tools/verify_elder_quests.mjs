// ★★★★ v0.99.7 · §6.5c · ELDERS ARE HAEMEN, THEY OUTRANK MASTERS, AND EVERY
//                          EXPEDITION IS ONE OF THEIRS.
//
//   Creator, 2026-09-18: "all elders will be in front of their town hall like
//   kelthor is. you will get district missions from them. make omniris give you
//   quests. all expeditions will be from elders. elders are haemen. they
//   superceed masters. kethor is an elder. dad is a master. rizer is a rizer."
//
// ★★★★ THIS RULING REVERSES §6.5b ON EVERY POINT IT MADE — elders were AETHREN
//   and non-humanoid, they were PEERS of masters, Kelthor was a MASTER and Dad
//   was a Beastmaster under him. §6.5b was itself marked "superseded same day",
//   so this office has been ruled on three times. That is exactly why it needs
//   a suite: a rule this contested does not stay true by being written down.
import { bootGame } from './lib/boot_game.mjs';
import fs from 'fs';

let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; return !!c; };
const H  = t => console.log('\n' + t);

const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['DISTRICT_ELDERS','ELDER_BY_DIST','ELDER_IDS','isDistrictElder',
  'buildQuestLog','NPCS','WORLD_PROPS','walkable','buildDistrictElderNpcs',
  'grantFieldStationRecipe','craftRecipe','FIELD_STATION_RECIPE','FIELD_STATION_SCRAP'] });
console.log = _L;
const P = G.player;

H('★★★★ EVERY EXPEDITION IS AN ELDER\'S · the whole of the new rule, in one check');
{
  for (const fl of 'zycubeGifted raidCardGifted starterChosen kelthorMet hasBackpack yaraMet dadStarterQuestGiven elzebubHatched townMapGifted'.split(' '))
    P[fl] = true;
  // ★★★ A DISTRICT YOU HAVE NEVER WALKED HAS NO MISSION FOR YOU — so a suite
  //   about district expeditions has to say it has been there. Marking every
  //   district visited is the save state these assertions are ABOUT; leaving it
  //   off made my own gate fail my own suite, which is the right failure.
  P.visitedDistricts = {};
  for (const E of G.DISTRICT_ELDERS) P.visitedDistricts[E.dist] = true;
  const log = G.buildQuestLog();
  const elderNames = G.DISTRICT_ELDERS.filter(e => e.id).map(e => e.name);
  const orphans = log.expeditions.filter(e => !elderNames.some(n => e.giver.includes(n)));
  ok(log.expeditions.length >= 9, `${log.expeditions.length} expeditions`);
  ok(orphans.length === 0,
     orphans.length ? `★ NOT from an Elder: ${orphans.map(o => `"${o.title}" ← ${o.giver}`).join(' · ')}`
                    : '★★★★ every single one is given by a name in DISTRICT_ELDERS');
  // ★★★ and the prologue moved OUT, which is the half of the rule that costs something
  const q = log.quests.map(x => x.title);
  for (const t of ['Malezor · Ch 1 · The First Morning','Malezor · Ch 2 · Walk Yara to School',
                   'Malezor · Ch 3 · Your First Bond','Malezor · Ch 4 · An Egg by the Path'])
    ok(q.includes(t), `  ${t} is a QUEST · Mom, Yara, Dad and a world event are not Elders`);
  ok(!log.expeditions.some(e => /Ch [1-4]/.test(e.title)),
     '★★ and none of the four is still on the expedition spine');
}

H('★★★ ONE EXPEDITION PER DISTRICT · and none invented');
{
  const log = G.buildQuestLog();
  const named = G.DISTRICT_ELDERS.filter(e => e.id);
  ok(named.length === 10, `${named.length} Elders · Korathen's seat filled by Alizarae at v0.99.26`);
  for (const E of named){
    const mine = log.expeditions.filter(e => e.giver.includes(E.name));
    ok(mine.length >= 1, `  ${E.dist.padEnd(10)} ${E.name.padEnd(22)} has an expedition`);
  }
  // ★★★ THE UNBUILT LADDERS MUST NOT PRETEND. DISTRICT_ELDERS says
  //   steps:8, built:false for eight of nine — emitting eight 8-step
  //   expeditions would put sixteen fictional objectives on the MISSIONS page
  //   and make the completion meter a lie.
  const unbuilt = named.filter(e => !e.built && e.id !== 'kelthor');
  for (const E of unbuilt.slice(0, 3)){
    const ex = log.expeditions.find(e => e.giver.includes(E.name));
    ok(ex.steps.length <= 2 && ex.steps.some(s => /still being cut/.test(s.label)),
       `  ${E.dist.padEnd(10)} shows ${ex.steps.length} real steps and says the ladder is unwritten`);
  }
}

H('★★★★ AND AN UNVISITED DISTRICT OFFERS NOTHING · no map spoiler on a new save');
{
  // ★ The first cut pushed all nine unconditionally: a brand-new save opened
  //   MISSIONS to nine expeditions for districts it had never seen. The board
  //   was never empty, the ledger never read 0/0, and the whole route was named
  //   before leaving the house. verify_missions caught it.
  const keep = P.visitedDistricts, kept = P.eldersMet;
  P.visitedDistricts = {}; P.eldersMet = {};
  const fresh = G.buildQuestLog();
  const strangers = fresh.expeditions.filter(e => !/Kelthor/.test(e.giver));
  ok(strangers.length === 0,
     strangers.length ? `★ ${strangers.length} expedition(s) for districts never visited: `
                        + strangers.map(e => e.title).join(', ')
                      : '★★★★ no district offers its expedition until you have walked there');
  P.visitedDistricts = { zarvane: true };
  const one = G.buildQuestLog().expeditions.filter(e => /Ivelith/.test(e.giver));
  ok(one.length === 1, '★★★ walk into Zarvane and exactly one new expedition appears · Ivelith\'s');
  P.visitedDistricts = keep; P.eldersMet = kept;
}

H('★★★ EVERY ELDER STANDS IN FRONT OF THEIR TOWN HALL, LIKE KELTHOR');
{
  const halls = {};
  for (const p of (G.WORLD_PROPS || []))
    if (p && /_town_hall$/.test(String(p.id))) halls[String(p.id).replace('_town_hall','')] = p;
  const K = G.ELDER_BY_DIST.malezor;
  const KH = halls.malezor;
  ok(!!KH, 'Malezor has a town hall to measure against');
  const dx0 = K.at[0] - KH.tileX, dy0 = K.at[1] - KH.tileY;
  ok(dx0 === 0 && dy0 === 4, `★★★ Kelthor sets the pattern: his hall's door column, ${dy0} south`);
  for (const E of G.DISTRICT_ELDERS){
    if (!E.id) continue;
    const h = halls[E.dist];
    if (!ok(!!h, `  ${E.dist} has a town hall`)) continue;
    const dx = E.at[0] - h.tileX, dy = E.at[1] - h.tileY;
    // ★ the COLUMN is the part you read — "in front of" is about being on the
    //   door's line. The row can shorten when something is built in the way.
    ok(dx === 0, `  ${E.dist.padEnd(10)} on the hall's door column (dx ${dx}), ${dy} south`);
    ok(dy >= 2 && dy <= 4, `     and in front of it, not inside or across the square`);
  }
}

H('★★ OMNIRIS GIVES QUESTS · and they are QUESTS, because he is a teacher');
{
  P.omnirisStep = { s1: true }; P.soulphishCaught = 3;
  const log = G.buildQuestLog();
  const om = log.quests.find(x => /Omniris/.test(x.title));
  ok(!!om, `he has an entry of his own · "${om && om.title}"`);
  ok(!log.expeditions.some(e => /Omniris/.test(e.giver)),
     '★★ on the QUEST side · §6.5c reserves expeditions for Elders and he is a TEACHER');
  ok(om.steps.length === 4, `${om.steps.length} trials listed`);
  ok(om.steps[0].done === true, '★ trial 1 reads as passed, because it is');
  // ★★★ the rows must read the SAME live values the trials gate on
  ok(/3\/8 Soulphish/.test(om.steps[1].label),
     `★★★ Still Water shows the live count · "${om.steps[1].label}"`);
  P.soulphishCaught = 6;
  const om2 = G.buildQuestLog().quests.find(x => /Omniris/.test(x.title));
  ok(/6\/8 Soulphish/.test(om2.steps[1].label),
     '★★★★ catch three more and the log moves · it reads player.soulphishCaught, the same field the trial gates on');
  ok(!G.ELDER_IDS.has('omniris'), '★ and he is not in the Elder chain · teaching and the civic office are separate');
}

H('★★★★ THE CANON FILE RECORDS THE REVERSAL, BOTH RULINGS VISIBLE');
{
  const canon = fs.readFileSync('data/RP7_MAIN_STORY_CANON.md', 'utf8');
  ok(/6\.5c/.test(canon), '§6.5c exists');
  ok(/SUPERSEDES 6\.5b IN FULL/i.test(canon), '★★ and says plainly that it supersedes §6.5b in full');
  ok(/ELDERS ARE HAEMEN/i.test(canon) && /OUTRANK MASTERS/i.test(canon), '★★★ elders are Haemen and outrank Masters');
  ok(/MASTERS = HAEMEN · ELDERS = AETHREN/.test(canon),
     '★★★ and §6.5b is STILL THERE · a canon file that deletes the ruling it replaced teaches nobody anything');
  // ★ markdown-tolerant · my first pattern demanded `an **ELDER**` and the file
  //   reads `an **ELDER.**` — a full stop inside the bold, and a correct canon
  //   entry failed for punctuation. Strip the formatting, then match the claim.
  const plain = canon.replace(/[*_`]/g, '');
  ok(/Kelthor\b[^\n|]*\bELDER/i.test(plain), '★ Kelthor is an Elder');
  ok(/Dad\b[^\n|]*\bMASTER/i.test(plain), '★ Dad is a Master');
  ok(/Rizer\b[^\n|]*\bRizer\b/i.test(plain), '★ and Rizer is a Rizer · under neither office');
  const threading = fs.readFileSync('data/ASSET_NEEDS_FOR_THREADING.md', 'utf8');
  ok(/6\.5c/.test(threading) && !/Per §6\.5b: \*\*MASTERS are HAEMEN \(humanoid\)\. ELDERS are AETHREN/.test(threading),
     '★★ and the doc that QUOTED the old ruling was corrected too · a superseded rule '
   + 'left standing in a second file is the one somebody will read');
  // the build agrees
  ok(G.DISTRICT_ELDERS.filter(e => e.id).every(e => /^Humanoid/.test(e.being)),
     '★★★ and every Elder in the build is Humanoid · Haemen, as ruled');
}

H('★★ THE GEAR SHOP CRAFTS THE WORKSTATION');
{
  // Creator, same day: "craft field workstation by interacting with the gear
  // shop. UI opens. cost is 20 scrap metal for one workstation."
  const shop = (G.WORLD_PROPS || []).find(p => p && p.id === 'malezor_gear_shop');
  ok(!!shop, 'the Malezor Gear Shop exists');
  P.items = { scrap_metal: 20 }; P.knownRecipes = [];
  shop.onInteract();
  ok((P.knownRecipes || []).some(r => r.id === 'field_station'),
     '★★ interacting TEACHES the recipe · the counter cannot sell you a thing it never mentions');
  ok(G.FIELD_STATION_SCRAP === 20, `★ and it costs ${G.FIELD_STATION_SCRAP} scrap · the Creator's number`);
  ok(G.craftRecipe(G.FIELD_STATION_RECIPE, 0) === true, '★★★ 20 scrap buys one, driven');
  ok(P.items.scrap_metal === 0 && P.items.field_station === 1,
     `★★★ scrap ${P.items.scrap_metal}, workstations ${P.items.field_station}`);
  ok(!/Closed for now/.test(String(shop.onInteract)),
     '★ and the door no longer says "Closed for now" · it was true until it was not');
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ §6.5c holds · every expedition an Elder\'s · Omniris gives quests · the gear shop builds');
process.exit(f ? 1 : 0);
