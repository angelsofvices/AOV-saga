#!/usr/bin/env node
/* Every kick sheet receives the same restrained correction over its established
 * rendering path. This prevents the slight shrink without the 12–20% jump
 * caused by reusing idle's raw source-pixel scale. */
eval(require('fs').readFileSync(require('path').join(__dirname,'_shim_s3.js'),'utf8'));
const fs=require('fs');
const src=fs.readFileSync('/tmp/all.js','utf8');
const LOG=console.log; console.log=()=>{}; console.warn=()=>{}; console.error=()=>{};
new Function(src+`;globalThis.__D={RIZER,RIZER_POWER_IDLE,RIZER_POWER_KICK,
 RIZER_LUMINARY_IDLE,RIZER_LUMINARY_KICK,rizerRowScale};`)();
console.log=LOG;
const D=globalThis.__D;
let pass=0,fail=0;
const ok=(condition,message)=>{condition?(pass++,LOG('  ok   · '+message)):(fail++,LOG('  FAIL · '+message));};
const forms=[
  ['S1',D.RIZER.idle,D.RIZER.kick],
  ['S2',D.RIZER_POWER_IDLE,D.RIZER_POWER_KICK],
  ['S3',D.RIZER_LUMINARY_IDLE,D.RIZER_LUMINARY_KICK],
];

LOG('\n=== Rizer kick scale ===\n');
for(const [name,idle,kick] of forms){
  ok(kick.visualScale===1.05,`${name} kick uses the five-percent correction`);
  const rawScale=kick.visualScale; kick.visualScale=1;
  for(let row=0;row<4;row++){
    const before=D.rizerRowScale(kick,row);
    kick.visualScale=rawScale;
    const after=D.rizerRowScale(kick,row);
    kick.visualScale=1;
    ok(Math.abs(after/before-1.05)<1e-12,
      `${name} row ${row} scale rises exactly five percent`);
  }
  kick.visualScale=rawScale;
}
ok(D.RIZER.kick.constScale===true,'S1 retains its authored constant combo scale');
ok(!D.RIZER_POWER_KICK.constScale&&!D.RIZER_LUMINARY_KICK.constScale,
  'S2/S3 retain per-frame fitting instead of inheriting the oversized S1 rule');
ok(/idleBh \* idleScale \* \(bundle\.visualScale \|\| 1\)/.test(src),
  'the in-attack target applies the correction after idle-height fitting');
LOG(`\n${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
