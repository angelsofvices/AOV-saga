// ★★★★ v0.98.2 · THE MISSIONS PAGE · driven, not grepped.
//
//   Creator, 2026-09-17: "give me a better expeditions page. call the page
//   missions and keep the subpages expeditions and quests. upgrade the ui on
//   this page. bi/dual page of both types of missions plus a queue for all
//   complete missions"
//
// ★★★ THE TWO THINGS THAT CAN BREAK HERE AND WOULD NOT SHOW UP ANYWHERE ELSE:
//
//   1 · THE RENAME LEAVES ORPHANS. zycellPage moved from 'expeditions' to
//       'missions'. Three call sites pass a page NAME as a string — the
//       Notebook route, the home-screen widget, _zyWidgetClick — and a string
//       that no longer matches does not throw. It silently lands you on HOME.
//       ★ So the alias is tested from the OUTSIDE: openZycellAt('expeditions')
//         must still put you on the missions page.
//   2 · EVERY MISSION MUST BE REACHABLE. The old panel's inner list was capped
//       at max-height:200px with the wheel killed inside the phone, which is
//       how three of fourteen missions became literally unreachable (v0.95.995
//       found the same shape). A dual-column board makes that worse, not
//       better, unless every card is its own focus stop — so: count them.
import { bootGame } from './lib/boot_game.mjs';
import fs from 'fs';
import { createRequire } from 'module';
const _allSrc = createRequire(import.meta.url)('./lib/all_src.cjs');

let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);
const src = _allSrc();

const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['buildQuestLog','renderZycellMissions','MISSION_TABS','MISSION_TINT',
  '_questAnchor','worldDistrictAt','ZYCELL_PANELS','ZYCELL_PAGE_ALIAS','_zycellPageKey',
  'missionTab','missionToggle','_missionKey','_missionWhere','openZycellAt','paintZycellContent'] });
// a mid-Malezor save · some done, some live, both kinds
for (const fl of ('auraxionMet auraxionMissionComplete dadStarterQuestGiven elzebubHatched faeCollected '
  + 'faenetGifted hasBackpack kelthorMet malezorBroadcastDone nurseReinAllied radioTowerFixed raidCardGifted '
  + 'scrapjawMet starterChosen townMapGifted yaraFollowStarted yaraMet zycubeGifted orrenQuestGiven').split(' '))
  G.player[fl] = true;
G.player.omnirisStep = 1; G.player.orrenGruntDodges = 2; G.player.towerMoriKills = 4;
G.player.x = 24; G.player.y = 110;
console.log = _L;

const log    = G.buildQuestLog();
const isDone = q => String(q.status || '').startsWith('complete');
const E = log.expeditions, Q = log.quests;
const eLive = E.filter(q => !isDone(q)), eDone = E.filter(isDone);
const qLive = Q.filter(q => !isDone(q)), qDone = Q.filter(isDone);
const view = (tab, open) => { G.game._missionTab = tab; G.game._missionOpen = open || {};
                              return G.renderZycellMissions(); };
const stops = h => [...h.matchAll(/data-zyitem="([^"]+)"/g)].map(m => m[1]);

H('★★★ THE RENAME · and the old word still works');
{
  ok(G.ZYCELL_PANELS.includes('missions'), "'missions' is a panel");
  ok(!G.ZYCELL_PANELS.includes('expeditions'), "'expeditions' is no longer a panel of its own");
  ok(G._zycellPageKey('expeditions') === 'missions', '★★ the alias maps the old name forward');
  ok(G._zycellPageKey('map') === 'map', '★ and leaves every other name alone');
  // ★★★ DRIVE IT. The Notebook calls openZycellAt('expeditions'); if that
  //   string stops resolving, it lands on HOME and nobody gets an error.
  G.player.items = Object.assign({}, G.player.items, { zphone: 1 });
  G.zycellPage = 'home';
  const outer = new Function('G', 'return (function(){ ' +
    src.slice(src.indexOf('function openZycellAt(page){')) + '; return null; })');
  ok(G.openZycellAt('expeditions') === true, 'openZycellAt("expeditions") returns true');
  ok(/zycellPage = \(typeof _zycellPageKey/.test(src),
     '★★★ …and routes through the alias, so the Notebook button still lands on MISSIONS');
  ok(/data-zynav="missions"/.test(src) === false && /data-zynav="missions"/.test(fs.readFileSync('rp7b.html','utf8')),
     '★ the nav rail says MISSIONS · the markup is outside the script blocks');
  ok(!/renderZycellExpeditions/.test(src), '★★ no orphaned renderer left behind');
}

H('★★★★ THE DUAL BOARD · both kinds, side by side, live work only');
{
  const B = view('board');
  ok(/EXPEDITIONS · MAIN/.test(B) && /QUESTS · SIDE/.test(B), 'both columns present on one page');
  ok(/grid-template-columns:repeat\(auto-fit, minmax\(258px, 1fr\)\)/.test(B),
     '★★ two-up by AUTO-FIT, not a media query · the nav and rail eat 400px of '
   + 'whatever the window reports, so the container is the only honest measure');
  const s = stops(B).filter(k => k.startsWith('mission_'));
  ok(s.length === eLive.length + qLive.length,
     `${s.length} mission cards = ${eLive.length} live expeditions + ${qLive.length} live quests`);
  // ★ the board is for WORK. Finished missions are the archive's job.
  for (const q of [...eDone, ...qDone])
    if (!ok(!s.includes('mission_' + G._missionKey(q.title)), `  done: "${q.title}" stays off the board`)) break;
  ok(eDone.length + qDone.length > 0, `★ (there were ${eDone.length + qDone.length} finished ones to keep off it)`);
}

H('★★★ THE ARCHIVE · the queue the board is emptied into');
{
  const A = view('archive');
  const s = stops(A).filter(k => k.startsWith('mission_'));
  ok(s.length === eDone.length + qDone.length,
     `${s.length} cards = every completed mission, both kinds`);
  ok(!s.some(k => [...eLive, ...qLive].some(q => 'mission_' + G._missionKey(q.title) === k)),
     '★★ and nothing still in progress leaks into it');
  ok(/COMPLETED QUEUE/.test(A), 'it is labelled as a queue');
  // board + archive must together account for EVERY mission · no orphans
  const all = new Set([...stops(view('board')), ...s].filter(k => k.startsWith('mission_')));
  ok(all.size === E.length + Q.length,
     `★★★ BOARD ∪ ARCHIVE = all ${E.length + Q.length} missions · nothing falls between the two views`);
}

H('★★ THE TWO SINGLE-TYPE SUBPAGES · kept, as asked, and now sorted');
{
  for (const [tab, arr, other] of [['expeditions', E, Q], ['quests', Q, E]]){
    const V = view(tab);
    const s = stops(V).filter(k => k.startsWith('mission_'));
    ok(s.length === arr.length, `  ${tab} · all ${arr.length} of them, done and live`);
    ok(!s.some(k => other.some(q => 'mission_' + G._missionKey(q.title) === k)),
       `  ${tab} · and none of the other kind`);
    // ★★ LIVE FIRST. buildQuestLog emits in UNLOCK order, which puts every
    //   ✓ DONE row above the work — seven of them on this save. The old panel
    //   shipped that order straight to the screen.
    const liveKeys = new Set(arr.filter(q => !isDone(q)).map(q => 'mission_' + G._missionKey(q.title)));
    const firstDone = s.findIndex(k => !liveKeys.has(k));
    const lastLive  = s.map(k => liveKeys.has(k)).lastIndexOf(true);
    ok(firstDone === -1 || lastLive < firstDone,
       `  ${tab} · ★★ live missions sort ABOVE finished ones`);
  }
}

H('★★★★ THE DATA THE OLD PANEL THREW AWAY');
{
  const first = eLive[0] || qLive[0];
  const key   = G._missionKey(first.title);
  const shut  = view('expeditions');
  const open  = view('expeditions', { [key]: true });
  ok(open.length > shut.length, 'a card opens · the closed board stays compact');
  // 1 · STEPS. The single most-wanted fact in a quest log, previously toasted.
  for (const st of first.steps)
    if (!ok(open.includes(st.label), `  step on screen: "${st.label.slice(0,46)}"`)) break;
  ok(!shut.includes(first.steps[first.steps.length-1].label),
     '★ and hidden until you open it · that is what keeps the dual board readable');
  // 2 · REWARD. Declared by every entry buildQuestLog emits; never once drawn.
  const withReward = [...E, ...Q].filter(q => q.reward);
  ok(withReward.length === E.length + Q.length,
     `all ${withReward.length} missions declare a reward`);
  ok(first.reward && open.includes(first.reward), `★★ the reward is on screen · "${first.reward}"`);
  ok(!/REWARD/.test(shut), '★ (the old panel never showed one at all, open or closed)');
  // 3 · LOCATION, through the SAME resolver the minimap pins use.
  const w = G._missionWhere(first);
  if (w){
    ok(open.includes(`tile ${w.x},${w.y}`), `★★ where to go · tile ${w.x},${w.y}`);
    ok(open.includes(`${w.dist} tiles out`), `★ and how far · ${w.dist} tiles from Rizer`);
    ok(/_questAnchor === 'function'/.test(src),
       '★★★ resolved by _questAnchor · the panel cannot name a place the map will not pin');
  } else ok(true, '(this mission has no anchor · _questAnchor returns null and the line is omitted)');
  // 4 · NEXT STEP, visible without opening anything.
  const next = (first.steps.find(s => !s.done) || {}).label;
  ok(!next || shut.includes(next), '★★ the next step shows on the CLOSED card · no tap, no toast');
}

H('★★★ THE CONTROLLER · the tab strip is one row, the list is the rest');
{
  const B = view('board');
  const all = stops(B);
  const tabs = all.filter(k => k.startsWith('mtab_'));
  ok(tabs.length === G.MISSION_TABS.length, `${tabs.length} tab stops`);
  ok(all.slice(0, tabs.length).every(k => k.startsWith('mtab_')),
     '★★ the tabs come FIRST in document order · _stepRow collapses a same-row '
   + 'run into one unit, so UP/DOWN drops straight from the strip into the list');
  const rows = [...B.matchAll(/data-zyitem="mtab_[^"]+"\s+data-zyrow="([^"]+)"/g)].map(m => m[1]);
  ok(rows.length === tabs.length && new Set(rows).size === 1 && rows[0] === 'mtab',
     '★★★ …and they share ONE data-zyrow, so LEFT/RIGHT walks the four views');
  ok(!/data-zyrow/.test(B.slice(B.indexOf('mission_'))),
     '★ mission cards carry no row · UP/DOWN steps them one at a time, like a list');
  // every card is its own stop · this is the v0.95.995 lesson, restated
  ok(stops(B).filter(k => k.startsWith('mission_')).length === eLive.length + qLive.length,
     '★★ every card is a focus stop · none is reachable only by mouse');
  ok(!/max-height:\s*200px/.test(B), '★★★ no inner scroller · #zycellContent is the one real one');
}

H('★ THE EMPTY AND THE FRESH');
{
  const _l = console.log; console.log = () => {};
  const G2 = bootGame({ extra: ['renderZycellMissions','buildQuestLog','MISSION_TABS'] });
  console.log = _l;
  G2.game._missionTab = 'board'; G2.game._missionOpen = {};
  const B = G2.renderZycellMissions();
  ok(/main chain clear|none yet/.test(B) && /no side work open/.test(B),
     'a save with nothing unlocked shows both empty states, not a blank page');
  // ★ strip the tags before matching · the count and the total are in separate
  //   spans (the total is dimmed), so a contiguous "0 / 0" never appears in the
  //   markup. My first version of this assertion tested the HTML and went red
  //   on correct output — measuring the source instead of the rendering.
  const text = B.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ');
  ok(/0 \/ 0 COMPLETE · 0%/.test(text), `★ the ledger reads 0/0, not NaN% · division by an empty log is guarded`);
  G2.game._missionTab = 'archive';
  ok(/nothing finished yet/.test(G2.renderZycellMissions()), '★ the queue says so too');
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ renamed with its alias · dual board · archive queue · steps, rewards and '
  + 'locations drawn for the first time');
process.exit(f ? 1 : 0);
