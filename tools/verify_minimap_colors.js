// ★★★ v0.96.68 · THE MINIMAP COLOUR LAW.
// Creator: "SEER HQ RED. RIZER HOMES PURPLE STAR. LANDMARKS BLUE. VISITED
// LANDMARKS GREEN. EXPEDITIONS/QUESTS YELLOW (DISAPPEAR WHEN COMPLETE)."
//
// ★★ WHAT THIS SUITE EXISTS TO CATCH: a pin whose colour lies.  Every rule
//   here is a claim about what the player SEES, so each is driven through the
//   real function rather than grepped for — a regex that finds '#ff5b5b' in the
//   file proves the constant exists, not that a Seer HQ ever reaches it.
const fs = require('fs');
const src = require('./lib/all_src.cjs')();
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);

H('★ the five colours are declared');
const grab = k => (src.match(new RegExp(k + ":\\s*'(#[0-9a-fA-F]{6})'")) || [])[1];
const SEER = grab('seer'), HOME = grab('home'), QUEST = grab('quest'), LAND = grab('landmark');
ok(SEER === '#ff5b5b', `seer     RED     ${SEER}`);
ok(HOME === '#c77dff', `home     PURPLE  ${HOME}`);
ok(QUEST === '#ffd93d', `quest    YELLOW  ${QUEST}`);
ok(LAND === '#7ad4ff', `landmark BLUE    ${LAND}`);

H('★★ RED OUTRANKS FOUND · the rule that is easy to write backwards');
// The colour ternary must test kind==='seer' BEFORE it consults P.found,
// or a visited Seer HQ repaints itself green.
const tern = (src.match(/const c = P\.kind === 'seer'[\s\S]{0,240}?;/) || [''])[0];
ok(/P\.kind === 'seer'/.test(tern), 'the seer branch exists');
ok(tern.indexOf("P.kind === 'seer'") < tern.indexOf('P.found'),
   'and it is tested BEFORE P.found — a visited HQ stays red');

H('★ landmarks keep blue→green, which the seer rule must not have eaten');
ok(/P\.found \? '#4ee07a' : '#7ad4ff'/.test(tern), "found ? green : blue still governs everything else");

H('★★★ QUESTS DISAPPEAR WHEN COMPLETE');
const qp = (src.match(/function questPins\(\)[\s\S]*?\n}/) || [''])[0];
ok(qp.length > 0, 'questPins() exists');
ok(/startsWith\('complete'\)/.test(qp) && /continue/.test(qp),
   "entries whose status starts with 'complete' are skipped");
ok(/kind: 'quest'/.test(qp), 'and what it emits is kind:quest, so it draws yellow');

H('★ quest pins bypass the 3-6 slice · an objective must not be evicted');
ok(!/minimapPOIs\(\)[\s\S]{0,80}quest/.test(src), 'quests are NOT pushed through minimapPOIs()');
const draw = (src.match(/function drawMinimap\(\)[\s\S]*?\n}/) || [''])[0];
ok(/questPins\(\)/.test(draw), 'drawMinimap calls questPins() directly');
ok(draw.indexOf('questPins()') > draw.indexOf('minimapVisible('),
   'and draws them AFTER the POI dots, so an objective is never hidden under one');
ok(draw.indexOf('ownedHomePins()') > draw.indexOf('questPins()'),
   'home stars still draw last of all');

H('★★ every anchor a quest names must RESOLVE · an unresolvable pin is invisible');
// _questAnchor takes {npc}|{prop}|{tower}|[x,y]; check each named id exists.
// ★ scoped to buildQuestLog, and with a boundary before `at:` — the first
//   version scanned the whole file for /at:/ and dutifully reported `treat:`
//   and `format:` as broken quest anchors.  A test that reads a substring as a
//   key finds defects that were never there.
const qlog = (src.match(/function buildQuestLog\(\)[\s\S]*?\n\s*return \{[^}]*\};\n\}/) || [src])[0];
const anchors = [...qlog.matchAll(/(?<![A-Za-z_])at:\s*(\[[^\]]+\]|\{[^}]+\})/g)].map(m => m[1]);
ok(anchors.length >= 11, `${anchors.length} quest anchors declared`);
let bad = [];
for (const a of anchors){
  let m;
  if ((m = a.match(/npc:\s*'([^']+)'/)))
    { if (!new RegExp(`id:\\s*'${m[1]}'`).test(src)) bad.push(`npc ${m[1]}`); }
  else if ((m = a.match(/prop:\s*'([^']+)'/)))
    { if (!new RegExp(`id:\\s*'${m[1]}'`).test(src)) bad.push(`prop ${m[1]}`); }
  else if ((m = a.match(/tower:\s*'([^']+)'/)))
    { if (!new RegExp(`dist:\\s*'${m[1]}'`).test(src)) bad.push(`tower ${m[1]}`); }
  else if (!/^\[\s*-?\d+\s*,\s*-?\d+\s*\]$/.test(a)) bad.push(`unparseable ${a}`);
}
ok(bad.length === 0, bad.length ? `unresolvable: ${bad.join(', ')}` : 'every npc/prop/tower id exists in the world');
ok(/return null;\s*\/\/ ★ unresolvable/.test(src),
   'and an unresolvable anchor returns null rather than guessing (0,0)');

H(f ? `❌ ${f} failed` : '✅ the colour law holds');
process.exit(f ? 1 : 0);
