#!/usr/bin/env node
/* verify_loopsafety.js · v0.96.29
 *
 * ★★★ THE ERROR THAT COST TWELVE ROUNDS, MADE INTO A TEST.
 *
 *   When I "ruled out infinite loops" I listed all 27 while-loops in the file,
 *   saw `while (_pendingPhoneToasts.length)` among them, and declared the whole
 *   set bounded WITHOUT CHECKING THAT ONE. Its body called showToast, and
 *   showToast pushes straight back onto _pendingPhoneToasts whenever a card is
 *   already showing — so the condition refilled itself and the tab died.
 *
 * ★ A loop is not bounded because its condition looks like it shrinks. It is
 *   bounded when nothing reachable from its body can grow the thing it tests.
 *   This suite finds every loop that tests a NAMED COLLECTION, calls out of its
 *   own scope, and whose collection is pushed to somewhere in the file — and
 *   requires each one to be either explicitly counter-guarded or listed here
 *   with the reason it is safe.
 */
const fs=require('fs'), path=require('path');
const H=fs.readFileSync(path.join(__dirname,'..','rp7b.html'),'utf8');
let pass=0,fail=0;
const ok=m=>{pass++;console.log('  ok   · '+m);};
const no=m=>{fail++;console.log('  FAIL · '+m);};
const t=(c,m)=>c?ok(m):no(m);
console.log('\n=== LOOP SAFETY · nothing may refill its own condition ===\n');

// ★ loops whose safety has been REASONED ABOUT, with the reason recorded.
//   Adding a name here is a claim; the claim is the point.
const CLEARED = {
  'player.lifeSeedSpoilAt':
    'shifts UNCONDITIONALLY at the top of the body, and showToast cannot push '
    + 'onto a spoil-timer array · the queue strictly shrinks',
  'q':
    'flood fills and timer drains over LOCAL queues · every push is gated by a '
    + '`seen` set or shifts first, so no tile is ever enqueued twice',
  'placed':
    'placement loops · the condition carries its own attempts/guard counter, '
    + 'which is the pattern this file already uses for bounded search',
  '_dreamDecor':
    'decor scatter · guarded by a `tries` counter in the condition',
};

const lines = H.split('\n');
const offenders = [];
for (let i=0; i<lines.length; i++){
  const m = /while\s*\((.+?)\)\s*\{?\s*$/.exec(lines[i]);
  if (!m) continue;
  const cond = m[1].trim();
  const coll = /^([\w.$]+)\.(?:length|size)\b/.exec(cond);
  if (!coll) continue;                       // numeric conditions are a different animal
  const name = coll[1];
  const body = lines.slice(i+1, i+16).join('\n');
  // does control leave the loop body?
  const calls = (body.match(/\b([a-zA-Z_$][\w$]*)\s*\(/g)||[])
    .map(c=>c.slice(0,-1).trim())
    .filter(c=>!['if','for','while','switch','catch','return','Math','Number','String',
                 'parseInt','parseFloat','shift','pop','push','splice','has','add','get',
                 'set','delete','removeChild','appendChild','max','min','round','floor'].includes(c));
  if (!calls.length) continue;               // a body that calls nothing cannot be surprised
  // can anything anywhere grow it?
  const pushes = (H.match(new RegExp(name.replace(/[.$]/g,'\\$&')+'\\.(push|unshift)\\s*\\(','g'))||[]).length;
  if (!pushes) continue;
  // an explicit counter in the condition is the accepted guard in this file
  if (/\b(guard|attempts|tries|n)\s*<|\bi\s*<|&&\s*\w+\s*<\s*\d/.test(cond)) continue;
  offenders.push({ line: i+1, cond, name, call: calls[0], pushes });
}

console.log(`  scanned ${(H.match(/while\s*\(/g)||[]).length} while-loops · `
  + `${offenders.length} test a named collection, call out, and can be pushed to\n`);
for (const o of offenders){
  const why = CLEARED[o.name];
  t(!!why, why
      ? `line ${o.line} · \`while (${o.cond.slice(0,40)})\` → ${o.name} · CLEARED: ${why}`
      : `★★★ line ${o.line} · \`while (${o.cond.slice(0,44)})\` calls ${o.call}() and `
        + `${o.name} has ${o.pushes} push site(s) · UNREVIEWED. Either add a counter to the `
        + `condition, change it to \`if\`, or record here why it cannot refill itself. This `
        + `is the exact shape that killed the tab for twelve rounds.`);
}

/* ── and the specific one, nailed shut ─────────────────────────────── */
const code = H.replace(/^\s*\/\/.*$/gm,'');
t(!/while \(_pendingPhoneToasts\.length\)/.test(code),
  '★★★ the phone-toast flush is not a `while` · showToast re-queues its own '
  + 'argument whenever a card is showing, and TOAST_STACK_MAX is 1, so one '
  + 'always is');
t(/if \(_pendingPhoneToasts\.length\)\{/.test(code),
  '★★ it takes ONE card per flush · the card-removal handler drains the next');
// ★ searched in H, not `code` — `code` has comments stripped, and I anchored on
//   a COMMENT. Reading prose out of a file you just removed the prose from.
t(/the card is gone · let the next one in[\s\S]{0,300}_flushPendingPhoneToasts\(\)/.test(H),
  '★★ and that drain callback still exists · without it, `if` would silently '
  + 'strand notifications, which is a quieter bug than the hang it replaces');

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
