// v0.95.701 · BBOX TABLE SHAPE · every bboxes:[] in the file, structurally
//
// The Creator reported "sword and grab/throw animations coming up as invisible
// missing frame in some directions... throwing stones too". Four tables had an
// EXTRA level of nesting — row 0 held all four ROWS instead of four bboxes, so
// bboxes[0][col] handed the renderer an array of arrays, the
// [bx,by,bw,bh] destructure produced NaN, and every DOWN-facing frame of that
// animation drew nothing.
//
// It is invisible to `node --check` (valid JS), invisible to a bbox-vs-pixels
// test (the numbers are all real, just one layer too deep), and invisible to
// review because the inner rows LOOK like a correct table. Only the SHAPE
// gives it away, so the shape is what this file checks.
const fs=require('fs');
const src=fs.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
let f=0;const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};

// ★★ v0.95.706 · SCAN BOTH DECLARATION FORMS.
//
// The first version of this file matched only `bboxes:` — the object-literal
// key — and reported ALL CLEAR while six makeRizerSheet tables carried the
// exact bug it was written to catch. makeRizerSheet passes the table
// POSITIONALLY, so the scanner was structurally blind to a whole family of
// declarations and said so with confidence.
//
// That is worse than a missing test: a test that names a category and then
// silently excludes half of it earns trust it has not got. Both forms now.
function tables(){
  const out=[];
  const re=/bboxes:\s*\[|makeRizerSheet\('[^']+',\s*\[/g; let m;
  while((m=re.exec(src))){
    let i=m.index+m[0].length-1, depth=0, j=i;
    const viaFn = m[0].startsWith('makeRizerSheet');
    while(j<src.length){
      if(src[j]==='[') depth++;
      else if(src[j]===']'){ depth--; if(!depth) break; }
      j++;
    }
    const blk=src.slice(i,j+1);
    let txt=blk.replace(/\/\/[^\n]*/g,'').replace(/,\s*([\]\}])/g,'$1').replace(/\s+/g,' ');
    let tab=null;
    try{ tab=JSON.parse(txt); }catch(_){ }
    const line=src.slice(0,i).split('\n').length;
    // best-effort name from the nearest declaration/id above
    const back=src.slice(Math.max(0,i-3000), i);
    let name='?';
    if(viaFn){
      const k=m[0].match(/makeRizerSheet\('([^']+)'/);
      name = k ? k[1] : '?';
    } else {
      const nm=[...back.matchAll(/const (\w+)\s*=|(\w+):\s*\{\s*img:|id:\s*['"]([\w-]+)['"]/g)].pop();
      name = nm ? (nm[1]||nm[2]||nm[3]) : '?';
    }
    out.push({line, name, tab, raw:txt});
  }
  return out;
}
const T=tables();

console.log('\n1 · ★ EVERY TABLE PARSES\n');
console.log('     A table this test cannot read is a table it cannot check. The');
console.log('     first version of this scan silently failed on ALL 92 of them —');
console.log('     trailing commas are legal JS and illegal JSON — and reported a');
console.log('     confident "0 problems found".\n');
const unparsed=T.filter(t=>!t.tab);
for(const u of unparsed.slice(0,6)) console.log(`     line ${u.line} ${u.name} unparseable`);
ok(T.length>50, `found ${T.length} bbox tables in the file`);
const viaFnCount=(src.match(/makeRizerSheet\('[^']+',\s*\[/g)||[]).length;
ok(viaFnCount>=12, `   including ${viaFnCount} declared through makeRizerSheet — the form the`);
console.log('     first version of this scanner could not see at all');
ok(unparsed.length===0, `all ${T.length} parse (${unparsed.length} unreadable)`);

console.log('\n2 · ★★ NO TABLE IS DOUBLE-NESTED\n');
console.log('     Valid shape: rows[] of cells[] of exactly 4 numbers.');
console.log('     The bug:     a row whose first element is itself a LIST OF ROWS.\n');
const deep=[];
for(const t of T){
  if(!Array.isArray(t.tab)) continue;
  for(let ri=0; ri<t.tab.length; ri++){
    const row=t.tab[ri];
    if(!Array.isArray(row)||!row.length) continue;
    const c0=row[0];
    if(Array.isArray(c0) && c0.length && Array.isArray(c0[0])){
      deep.push(`line ${t.line} · ${t.name} · row ${ri} holds ${row.length} ROWS`);
      break;
    }
  }
}
for(const d of deep) console.log('     '+d);
ok(deep.length===0, `no bbox table has an extra nesting level (${deep.length})`);
console.log('     v0.95.701 fixed four object-literal tables: RIZER.astralthrow,');
console.log('     RIZER_POWER_ASTRALTHROW, RIZER_SAPPHIRE_SWORD, RIZER_RUBYPAW_SWORD.');
console.log('     v0.95.706 fixed SIX MORE behind makeRizerSheet: both');
console.log('     astralthrow-boulder sheets and all four astralslam sheets —');
console.log('     which is why Rizer vanished when throwing a stone facing DOWN.\n');

console.log('3 · ★ EVERY CELL IS FOUR NUMBERS\n');
const malformed=[];
for(const t of T){
  if(!Array.isArray(t.tab)) continue;
  for(let ri=0; ri<t.tab.length; ri++){
    const row=t.tab[ri];
    if(!Array.isArray(row)) continue;
    for(let ci=0; ci<row.length; ci++){
      const c=row[ci];
      if(!Array.isArray(c) || c.length!==4 || !c.every(v=>typeof v==='number' && isFinite(v))){
        malformed.push(`line ${t.line} · ${t.name} · r${ri}c${ci} = ${JSON.stringify(c)}`);
      }
    }
  }
}
for(const m of malformed.slice(0,10)) console.log('     '+m);
ok(malformed.length===0, `every cell is [x,y,w,h] of finite numbers (${malformed.length} bad)`);

console.log('\n4 · ★ NO ZERO-AREA CELLS\n');
console.log('     A cell with w or h of 0 draws nothing — the same symptom as');
console.log('     the nesting bug, from a different cause.\n');
const zero=[];
for(const t of T){
  if(!Array.isArray(t.tab)) continue;
  for(let ri=0; ri<t.tab.length; ri++){
    const row=t.tab[ri]; if(!Array.isArray(row)) continue;
    for(let ci=0; ci<row.length; ci++){
      const c=row[ci];
      if(Array.isArray(c) && c.length===4 && (c[2]<=0 || c[3]<=0))
        zero.push(`line ${t.line} · ${t.name} · r${ri}c${ci} = ${JSON.stringify(c)}`);
    }
  }
}
for(const z of zero.slice(0,10)) console.log('     '+z);
ok(zero.length===0, `no cell has zero or negative width/height (${zero.length})`);

console.log('\n5 · ★ 4x4 SHEETS DECLARE 4 ROWS OF 4\n');
console.log('     Reported, not asserted — several sheets are legitimately 7 or 8');
console.log('     columns (astralslam, astralthrow-boulder), so an equality check');
console.log('     here would fail on correct data.\n');
const shape={};
for(const t of T){
  if(!Array.isArray(t.tab)) continue;
  const rows=t.tab.length;
  const cols=t.tab[0] && Array.isArray(t.tab[0]) ? t.tab[0].length : 0;
  const k=`${rows}x${cols}`;
  shape[k]=(shape[k]||0)+1;
}
for(const k of Object.keys(shape).sort()) console.log(`     ${k.padEnd(8)} ${shape[k]} table(s)`);
const ragged=[];
for(const t of T){
  if(!Array.isArray(t.tab)||!t.tab.length) continue;
  const w=t.tab[0].length;
  if(t.tab.some(r=>Array.isArray(r) && r.length!==w))
    ragged.push(`line ${t.line} · ${t.name} · rows of unequal length`);
}
for(const r of ragged) console.log('     '+r);
ok(ragged.length===0, `no table has rows of differing length (${ragged.length}) — a ragged table means a row lost or gained a cell`);

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
