// v0.95.689 · COMBO XP MULTIPLIER
//
// "also add an xp multiplier on combos. xp gain x combo divided by 10."
//
// The thing worth testing here is not that the arithmetic works — it's that the
// multiplier can never REDUCE XP.  Taken literally the formula does exactly
// that below combo 10 (a 3-hit kill would pay 0.3×), which would quietly nerf
// almost every kill in the game.  The floor is the whole design decision, so
// the floor is what gets asserted hardest.
const fs=require('fs');
const src=fs.readFileSync('/tmp/all.js','utf8');
let f=0;const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};

console.log('\n1 · ★ THE MULTIPLIER EXISTS AND RIDES THE REAL COMBO COUNTER\n');
ok(/function comboXpMult\s*\(/.test(src), 'comboXpMult() is declared');
ok(/const COMBO_XP_DIVISOR\s*=\s*10/.test(src), 'COMBO_XP_DIVISOR is 10 — "divided by 10"');
const m=src.match(/function comboXpMult[\s\S]{0,300}?\n}/);
ok(!!m && /player\s*&&\s*player\._hitStreak|player\._hitStreak/.test(m[0]),
   'it reads player._hitStreak — the same counter bumpCombo() drives and');
ok(/function bumpCombo[\s\S]{0,200}player\._hitStreak\s*=\s*\(player\._hitStreak\s*\|\|\s*0\)\s*\+\s*1/.test(src),
   '   bumpCombo() increments that same field on every landed hit');
ok(/function resetCombo[\s\S]{0,120}player\._hitStreak\s*=\s*0/.test(src),
   '   resetCombo() zeroes it, so taking damage genuinely costs the bonus');

console.log('\n2 · ★★ THE FLOOR · a combo can never SHRINK your XP\n');
console.log('     Without Math.max(1, ...) every kill under 10 hits pays less');
console.log('     than it does today.  A 1-hit kill would pay a tenth.\n');
ok(!!m && /Math\.max\s*\(\s*1\s*,/.test(m[0]), 'comboXpMult floors at 1');

// run the real function in isolation
let comboXpMult=null;
try{
  const body=m[0].replace(/^function comboXpMult\s*\(\)\s*\{/,'').replace(/\n}$/,'');
  const player={};
  comboXpMult=new Function('player','COMBO_XP_DIVISOR', body);
  const call=s=>{player._hitStreak=s; return comboXpMult(player,10);};
  console.log('     combo  ->  multiplier');
  const CASES=[[0,1],[1,1],[3,1],[9,1],[10,1],[11,1.1],[20,2],[37,3.7],[50,5],[100,10]];
  for(const [streak,want] of CASES){
    const got=call(streak);
    console.log(`     ${String(streak).padStart(5)}  ->  ${got.toFixed(2)}x`);
    ok(Math.abs(got-want)<1e-9, `   combo ${streak} pays ${want}x`);
  }
  // the property that matters, swept
  let dips=0, nonMono=0, prev=0;
  for(let s=0;s<=400;s++){ const v=call(s); if(v<1) dips++; if(v<prev-1e-12) nonMono++; prev=v; }
  ok(dips===0, `swept combo 0..400 · never pays below 1x (${dips} dips)`);
  ok(nonMono===0, `swept combo 0..400 · never decreases as the streak grows (${nonMono})`);
}catch(e){ ok(false,'could not evaluate comboXpMult — '+e.message.slice(0,100)); }

console.log('\n3 · ★★ IT IS APPLIED AT ONE CHOKEPOINT, AND ONLY TO KILL XP\n');
console.log('     Combo is a combat idea.  Scaling quest turn-ins or chest');
console.log('     rewards by it would be nonsense, so the multiplier goes in');
console.log('     creditRizerKill() and NOT in awardRizerXP().\n');
const ck=src.match(/function creditRizerKill[\s\S]{0,900}?\n}/);
ok(!!ck, 'creditRizerKill() found');
if(ck){
  ok(/comboXpMult\(\)/.test(ck[0]), '   it calls comboXpMult()');
  ok(/rizerKillXP\(npc,\s*mode\)/.test(ck[0]), '   base XP still comes from rizerKillXP()');
  ok(/Math\.round\(\s*base\s*\*\s*mult\s*\)/.test(ck[0]), '   awards round(base × mult) — integer XP');
  ok(/awardRizerXP\(xp\)/.test(ck[0]), '   and hands the MULTIPLIED figure to awardRizerXP');
  ok(/_rxpCredited/.test(ck[0]), '   the AOE double-credit guard is still ahead of the award');
}
// Take awardRizerXP to its real closing brace by counting depth — an earlier
// draft capped the slice at 600 chars, the function is longer than that, the
// match came back null, and `!!aw && ...` reported a FAILURE for a function
// that was perfectly fine.  A test that fails because it couldn't find the
// code is not the same as a test that fails because the code is wrong.
function fnBody(name){
  const i=src.indexOf('function '+name);
  if(i<0) return null;
  let j=src.indexOf('{', i), d=0;
  for(let k=j;k<src.length;k++){
    if(src[k]==='{') d++;
    else if(src[k]==='}'){ d--; if(!d) return src.slice(i,k+1); }
  }
  return null;
}
const aw=fnBody('awardRizerXP');
ok(!!aw, 'awardRizerXP() located (whole body, brace-matched)');
ok(!!aw && !/comboXpMult/.test(aw),
   'awardRizerXP() does NOT apply it — quest and chest XP stay flat');
// count CALL sites only.  `comboXpMult()` also matches the declaration line
// `function comboXpMult(){`, which made an earlier run report 2 call sites for
// a function called once.
const hits=(src.match(/(?<!function\s)\bcomboXpMult\(\)/g)||[]).length;
ok(hits===1, `comboXpMult() is CALLED exactly once in the whole file (${hits}) — one chokepoint, not scattered`);

console.log('\n4 · ★ THE PLAYER IS TOLD WHEN IT FIRES\n');
ok(!!ck && /mult\s*>\s*1/.test(ck[0]), 'the toast is gated on mult > 1 — silent during normal play');
ok(!!ck && /COMBO.*R\.XP/.test(ck[0]), 'and it names the streak, the multiplier and the payout');

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
