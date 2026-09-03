// ★ v0.95.944 · interior floor plans
// A plan is only correct if it is rectangular AND every authored position --
// spawn, stairs, grunt posts -- lands on floor.  A grunt inside a wall is
// invisible and unkillable, and nothing else in the build would catch it.
const fs=require('fs'), path=require('path');
const html=fs.readFileSync(path.join(path.resolve(__dirname,'..'),'rp7b.html'),'utf8');
let fail=0; const ok=m=>console.log('  ok   '+m); const bad=m=>{console.log('  FAIL '+m);fail++;};

const SCENES=['INTERIOR_SEER_HQ_1F','INTERIOR_SEER_HQ_R2'];
// ★ read the wall height from the build so this suite can never disagree with it
const WH = (html.match(/const WALL_TILES_H = (\d+);/)||[])[1]|0;
const m=html.match(/const INTERIOR_SEER_HQ_1F = \{[\s\S]*?plan: \[([\s\S]*?)\],/);
if(!m){ bad('1F plan not found'); process.exit(1); }
const plan=[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]);
const C=plan[0].length, R=plan.length;

if (plan.some(r=>r.length!==C)) bad('plan rows are ragged');
else ok(`plan is rectangular · ${C}x${R}`);
if (C!==35||R!==25) bad(`plan is ${C}x${R} · ruled 35x25`); else ok('35x25 as ruled');

// cols/rows must agree with the plan or collision and camera disagree
const cr=html.match(/plan: \[[\s\S]*?\],\n\s*cols: (\d+), rows: (\d+),/);
if(!cr) bad('cols/rows not found after plan');
else if(+cr[1]!==C||+cr[2]!==R) bad(`cols/rows ${cr[1]}x${cr[2]} != plan ${C}x${R}`);
else ok('cols/rows match the plan');

const at=(x,y)=>(x<0||y<0||x>=C||y>=R)?'#':plan[y][x];
const solid=c=>c==='#'||c==='D';
const check=(x,y,label)=>{ if(solid(at(x,y))){bad(`${label} (${x},${y}) is '${at(x,y)}' — inside a wall`);} else ok(`${label} (${x},${y}) on floor`); };

const sp=html.match(/const INTERIOR_SEER_HQ_1F[\s\S]*?spawn: \{ x: (\d+), y: (\d+)/);
check(+sp[1],+sp[2],'spawn');
for (const t of html.match(/const INTERIOR_SEER_HQ_1F[\s\S]*?stairsList: \[[\s\S]*?\n\s*\],\n\};/)[0].matchAll(/triggers: \[\[(\d+), (\d+)\], \[(\d+), (\d+)\]\]/g)){
  check(+t[1],+t[2],'stair trigger'); check(+t[3],+t[4],'stair trigger');
}
for (const g of html.match(/const HALL = \[[\s\S]*?\];/)[0].matchAll(/\{ x:\s*(\d+), y:\s*(\d+)/g)){
  check(+g[1],+g[2],'grunt post');
}
// the wall-height rule must actually produce faces
let faces=0;
for(let y=0;y<R;y++)for(let x=0;x<C;x++) if(solid(at(x,y))&&!solid(at(x,y+1))) faces++;
if(!faces) bad('no south-facing wall tiles — every wall would draw as a 1-tile cap');
else ok(`${faces} south-facing FACE tiles (drawn 3 tall)`);

// the parser + draw pass must be present
for (const [re,l] of [[/function floorPlan\(cfg\)/,'floorPlan parser'],
                      [/_P\.blocked\.has\(x \+ ',' \+ y\)/,'collision reads the plan'],
                      [/TILE \* WALL_TILES_H\)/,'faces draw the whole asset WALL_TILES_H tall'],
                      [/Math\.round\(SH \/ WALL_TILES_H\)/,'caps derive from WALL_TILES_H']])
  re.test(html)?ok(l):bad(l);


// ★ every plan scene: rectangular, has a door, and its wall faces never cover floor
for (const name of SCENES){
  const mm = html.match(new RegExp('const '+name+' = \\{[\\s\\S]*?plan: \\[([\\s\\S]*?)\\],'));
  if (!mm){ bad(name+' plan missing'); continue; }
  const pl=[...mm[1].matchAll(/'([^']*)'/g)].map(x=>x[1]);
  const c=pl[0].length, r=pl.length;
  if (pl.some(q=>q.length!==c)) { bad(name+' ragged'); continue; }
  const A=(x,y)=>(x<0||y<0||x>=c||y>=r)?' ':pl[y][x];
  const fl=ch=>'.SCG'.includes(ch);
  let over=0, faces=0, doors=0;
  for(let y=0;y<r;y++)for(let x=0;x<c;x++){
    const ch=A(x,y);
    if(ch==='D') doors++;
    if(fl(ch)||ch===' ') continue;
    if(fl(A(x,y+1))){ faces++; for(let d=1;d<WH;d++) if(fl(A(x,y-d))) over++; }
  }
  if(!doors) bad(name+' has no door');
  else if(over) bad(`${name}: ${over} wall-face tiles cover FLOOR (a ${WH}-tile face reaches ${WH-1} rows up)`);
  else ok(`${name} ${c}x${r} · ${faces} faces · ${doors} door(s) · no face covers floor`);
}
// ★ the room graph must close: every doorTarget resolves to a real scene
const dt=[...html.matchAll(/target: '(interior_seer_hq_[a-z0-9]+)'/g)].map(x=>x[1]);
const known=new Set(['interior_seer_hq_1f','interior_seer_hq_r2','interior_seer_hq_b','interior_seer_hq_2f']);
const orphan=dt.filter(t=>!known.has(t));
orphan.length ? bad('door/stair targets an unknown scene: '+orphan.join(', '))
              : ok(`room graph closes · ${dt.length} transitions, all resolve`);
[[/if \(scene === 'interior_seer_hq_r2'\)     return INTERIOR_SEER_HQ_R2/,'R2 registered in interiorConfig'],
 [/function planDoorAt/,'door-transition lookup'],
 [/const _door = planDoorAt\(cfg, fx, fy\)/,'X on a door transitions'],
 [/for \(const v of _plan\.voids\)/,'void tiles drawn black']]
 .forEach(([re,l])=>re.test(html)?ok(l):bad(l));

console.log(fail?`\n${fail} FAILURE(S)`:'\nall floor-plan checks passed');
process.exit(fail?1:0);
