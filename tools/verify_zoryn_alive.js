// ★★★ v0.96.70 · ZORYN AS PLAYER TWO · driven, not grepped.
//
// Creator: "also make sure zoyrn runs when you run when following. fights when
// u fight. etc. he loots chests before u if u wait too long though. u cannot
// get it after him, its his. make zoryn feel alive like a real player 2 that
// grows with rizer."
//
// ★★ THE BUG THIS SUITE WAS BORN FROM.  His chest steal called
//   chest.onInteract() — the PLAYER's loot function.  Coins spilled to you,
//   gems spawned for you, awardRizerXP(12) went to you, a potion went in your
//   bag, the chest's own toast fired — and then his line printed on top of it
//   claiming he had taken the lot.  Every assertion below exists because
//   reading that code did not reveal it; running it did.
const fs = require('fs'), vm = require('vm');
const src = require('./lib/all_src.cjs')();
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);
const pull = (re, label) => { const m = src.match(re); if (!m) throw new Error('pull ' + label); return m[0]; };

// ── the real functions, verbatim ────────────────────────────────────────
const code = [
  pull(/const ZORYN_TAKEN_LINES = \[[\s\S]*?\n\];/, 'lines'),
  pull(/function zorynClaimedChest\(p\)[\s\S]*?\n\}/, 'claim'),
  pull(/const ZORYN_HP_BASE[\s\S]*?function zorynHitDmg\(\)\{[^}]*\}/, 'growth'),
  pull(/const ZORYN_FIGHT_RANGE = \d+;/, 'range'),
  pull(/const ZORYN_SWING_WINDOW_MS[\s\S]*?function zorynEnemyNearRizer\(now\)\{?[\s\S]*?\n\}/, 'targeting'),
].join('\n');

let LV = 1;
const sandbox = {
  player: { dir: 'right', x: 10, y: 10, zorynHp: null },
  game: { scene: 'overworld' },
  NPCS: [],
  _DIR_VEC: { right:{dx:1,dy:0}, left:{dx:-1,dy:0}, up:{dx:0,dy:-1}, down:{dx:0,dy:1} },
  performance: { now: () => 1000 },
  rizerLevelNow: () => LV,
  showToast(m){ sandbox._toasts.push(m); },
  playSFX(s){ sandbox._sfx.push(s); },
  _toasts: [], _sfx: [],
  Math,
};
const ctx = vm.createContext(sandbox);
vm.runInContext(code, ctx);
const val = e => vm.runInContext(e, ctx);   // ★ const is lexical · read through the context

H('★★★ THE CHEST IS HIS · "u cannot get it after him, its his"');
// 1 · the steal must NOT route through the player's loot function
// ★ COMMENTS STRIPPED FIRST.  The first version of this line searched the raw
//   span for /chest.onInteract/ and went red — on MY OWN COMMENT explaining
//   that the old code used to call it.  A test that reads prose as code finds
//   defects that were fixed in the same commit.
const strip = t => t.replace(/\/\/[^\n]*/g, '');
const steal = strip(pull(/chest\.opened = true;\n\s*chest\.looted = true;[\s\S]*?zorynChestsTaken = /, 'steal'));
const stealFull = pull(/const chest = _zorynChestNear\(n\);[\s\S]*?zorynChestsTaken = /, 'stealFull');
ok(!/chest\.onInteract/.test(strip(stealFull)), 'the steal no longer calls chest.onInteract() — no loot reaches you');
ok(/chest\._zorynTook = true/.test(steal), 'it marks the chest as HIS');
ok(/markChestLooted\(chest\.id\)/.test(steal), 'and it stays open across saves');
ok(/zorynTookChests/.test(steal), 'the claim is recorded by id, not just counted');
// 2 · the claim answers, in his voice, on BOTH player routes
sandbox._toasts.length = 0; sandbox._sfx.length = 0;
const claimed = val('zorynClaimedChest({ _zorynTook: true })');
ok(claimed === true, 'a claimed chest refuses the player');
ok(sandbox._toasts.length === 1 && /Zoryn|cleaned out|Nothing left/.test(sandbox._toasts[0]),
   `and says so: "${sandbox._toasts[0]}"`);
ok(val('zorynClaimedChest({ opened: true })') === false, 'an ordinary spent chest is untouched by the rule');
ok(val('zorynClaimedChest(null)') === false, 'and a missing prop does not throw');
ok(/zorynClaimedChest\(chestHit\)/.test(src), 'the punch/kick route is guarded too');
ok(/zorynClaimedChest\(doorProp\)/.test(src), 'and the X-interact route');
// 3 · it survives the reload
ok(/his = new Set\(player\.zorynTookChests/.test(src), 'restoreLootedChests re-marks his chests on load');
ok(/zorynTookChests:\s*player\.zorynTookChests/.test(src), 'and the save snapshot carries the list');

H('★★ HE GROWS WITH RIZER');
const rows = [];
for (const lv of [1, 25, 50, 100]){ LV = lv; rows.push([lv, val('zorynHpMax()'), val('zorynHitDmg()')]); }
for (const [lv, hp, dmg] of rows) console.log(`     Lv ${String(lv).padStart(3)}  HP ${hp}  hit ${dmg}`);
ok(rows[0][1] === 124 && rows[3][1] === 520, 'HP climbs 124 → 520');
ok(rows[3][2] > rows[0][2], `damage climbs ${rows[0][2]} → ${rows[3][2]}`);
ok(rows.every((r, i) => !i || r[1] > rows[i-1][1]), 'monotonic — no level makes him weaker');
LV = 999; ok(val('zorynHpMax()') === 520, 'and it is clamped at 100, so a dev-granted level cannot run away');
LV = 50;

H('★★ "FIGHTS WHEN U FIGHT"');
sandbox.NPCS = [
  { isEnemy:true, scene:'overworld', hp:100, tileX:17, tileY:10 },   // 7 east · the one you are hitting
  { isEnemy:true, scene:'overworld', hp:100, tileX:10, tileY:14 },   // 4 south · nearer, behind you
];
sandbox.player._zoSawSwingAt = -1e9;                       // you have not swung
let t = val('zorynEnemyNearRizer(1000)');
ok(t && t.tileY === 14, 'idle: he guards, and takes the nearest threat inside 5 tiles');
sandbox.player._zoSawSwingAt = 1000;                       // you just landed a blow
t = val('zorynEnemyNearRizer(1000)');
ok(t && t.tileX === 17, '★ after YOUR blow he joins the one you are facing at 7 tiles, not the nearer one');
sandbox.player._zoSawSwingAt = 1000 - 5000;                // …four seconds ago
t = val('zorynEnemyNearRizer(1000)');
ok(t && t.tileY === 14, 'and the window closes — he goes back to guarding');
ok(/player\._zoSawSwingAt = performance\.now\(\)/.test(src), 'the marker is set where a blow LANDS, not on the keypress');

H('★ "RUNS WHEN YOU RUN" · and rides when you ride');
const follow = pull(/const pace = \(\) =>[\s\S]*?npcNavigateAround/, 'pace');
ok(/player\.skating/.test(follow), 'the follow cadence reads player.skating — the board nearly halves your pace');
ok((follow.match(/pace\(\)/g) || []).length >= 2,
   'both the straight step AND the blocked-axis step use it (the old code hardcoded 170 on the detour)');
ok(/_zorynUseBank\(n, wantSkate \? 'skate' : 'idle'\)/.test(src),
   'and he visibly rides the board rather than sliding along in his idle pose');
ok(/wantSkate !== !!n\._zoSkating/.test(src), 'the bank swap is guarded on a CHANGE · it re-measures, so per-frame would be costly');

H('★ the dead constants went with their replacements');
ok(!/ZORYN_HIT_DMG\s*=/.test(src) && !/const ZORYN_HP_MAX\s*=/.test(src),
   'ZORYN_HIT_DMG and ZORYN_HP_MAX are gone, not left unread beside zorynHitDmg/zorynHpMax');

H(f ? `❌ ${f} failed` : '✅ Player Two keeps pace, joins your fight, grows with you — and the chest is his');
process.exit(f ? 1 : 0);
