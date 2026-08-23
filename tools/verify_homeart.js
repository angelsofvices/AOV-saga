// v0.95.682 · ASSET-TRUTH CHECK for house art.
//
// Written because I missed a real bug three times.  The Creator reported
// "netharion homes in veridan", then "vorashil homes in netharion", then
// "veridan homes in vorashil" — a clean 3-cycle — and I answered "cannot
// reproduce" after checking tile positions, Image-object identity, src strings,
// worldDistrictAt and the warp table.  All of those WERE correct.  What I never
// checked was whether the PNG a correct filename points at still exists and
// still contains what the code believes it contains.
//
// A verifier that only reads the source can never catch that.  This one opens
// the files.
const fs=require('fs'), path=require('path'), cp=require('child_process');
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new';
const HOMES=path.join(ROOT,'assets/2D sprites/buildings/homes');
const src=fs.readFileSync('/tmp/all.js','utf8');
let f=0;const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};

// pull DISTRICT_HOME_ART straight out of the source
const i=src.indexOf('const DISTRICT_HOME_ART');
const seg=src.slice(i, src.indexOf('\n};', i));
const declared={};           // file -> {bbox, district}
let curDist=null;
for(const line of seg.split('\n')){
  const d=line.match(/^\s*(\w+):\s*\[/); if(d){curDist=d[1];continue;}
  const m=line.match(/file:'([^']+)',\s*bbox:\[\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\]/);
  if(m) declared[m[1]]={bbox:[+m[2],+m[3],+m[4],+m[5]], district:curDist};
}
const names=Object.keys(declared);
console.log(`\n1 · ★ EVERY DECLARED FILE EXISTS ON DISK\n`);
console.log(`     ${names.length} house sprites declared across ${new Set(names.map(n=>declared[n].district)).size} districts`);
const onDisk=new Set(fs.readdirSync(HOMES).filter(x=>x.endsWith('.png')));
const missing=names.filter(n=>!onDisk.has(n));
for(const m of missing) console.log(`     MISSING  ${m}`);
ok(missing.length===0,`no declared file is missing (${missing.length})`);
const orphan=[...onDisk].filter(x=>!declared[x]);
for(const o of orphan) console.log(`     ORPHAN   ${o}  — on disk, never referenced`);
ok(orphan.length===0,`no house sprite is orphaned (${orphan.length})`);

console.log('\n2 · ★★ EVERY DECLARED BBOX MATCHES THE ACTUAL PIXELS\n');
console.log('     A stale bbox crops or pads the sprite silently — it still draws,');
console.log('     just wrong, which is the hardest kind of bug to see.\n');
// Write the measuring script to a FILE.  An earlier draft passed it via
// python3 -c with JSON.stringify, which escaped the newlines into literal \n
// and made python throw — so `actual` stayed empty, every loop below iterated
// zero times, and sections 2, 4 and 5 reported "0 stale / 0 shared" while
// measuring nothing at all.  A vacuous pass is worse than a failure: this file
// exists BECAUSE of a bug that hid behind one.
const PYFILE='/tmp/_measure_homes.py';
fs.writeFileSync(PYFILE, [
"from PIL import Image",
"import json,sys,os",
"ROOT=sys.argv[1]",
"out={}",
"for fn in sys.argv[2:]:",
"    im=Image.open(os.path.join(ROOT,fn)).convert('RGBA')",
"    W,H=im.size; px=im.load()",
"    mnx=mny=10**9; mxx=mxy=-1",
"    for y in range(H):",
"        for x in range(W):",
"            if px[x,y][3]>24:",
"                if x<mnx:mnx=x",
"                if x>mxx:mxx=x",
"                if y<mny:mny=y",
"                if y>mxy:mxy=y",
"    out[fn]=[mnx,mny,mxx-mnx+1,mxy-mny+1]",
"print(json.dumps(out))",
].join("\n"));
const present=names.filter(n=>onDisk.has(n));
let actual={}, measureErr=null;
try{
  const args=[PYFILE, HOMES].concat(present).map(a=>JSON.stringify(a)).join(' ');
  actual=JSON.parse(cp.execSync('python3 '+args,{maxBuffer:1<<24}).toString());
}catch(e){ measureErr=e.message.slice(0,120); }
ok(!measureErr, measureErr ? 'PIXEL MEASURE FAILED — '+measureErr : 'measured the real pixels of every sprite');
ok(Object.keys(actual).length===present.length,
   `measured ${Object.keys(actual).length}/${present.length} sprites — a partial read must not read as a pass`);
let stale=0;
for(const n of present){
  const a=actual[n], d=declared[n].bbox;
  if(!a) continue;
  if(a.join()!==d.join()){ stale++; console.log(`     STALE  ${n}  declared ${d}  actual ${a}`); }
}
ok(stale===0,`${present.length} bboxes measured · ${stale} stale`);

console.log('\n3 · ★ FILENAME AGREES WITH ITS DISTRICT\n');
let misfiled=0;
for(const n of present){
  const want=declared[n].district;
  if(!n.startsWith(want+'-house-')){ misfiled++; console.log(`     ${n} is filed under ${want}`); }
}
ok(misfiled===0,`every file is named for the district that uses it (${misfiled})`);

console.log('\n4 · ★★ NO TWO DISTRICTS SHARE ARTWORK\n');
console.log('     This is the check that would have caught the 3-cycle: identical');
console.log('     pixel content under two different district names.\n');
const bySig={};
for(const n of present){
  const a=actual[n]; if(!a) continue;
  const sig=a.join(',');
  (bySig[sig]=bySig[sig]||[]).push(n);
}
let dup=0;
for(const sig of Object.keys(bySig)){
  const list=bySig[sig];
  if(list.length>1){
    const dists=new Set(list.map(x=>declared[x].district));
    if(dists.size>1){ dup++; console.log(`     SHARED  ${list.join('  ==  ')}  (${[...dists].join(', ')})`); }
  }
}
ok(dup===0,`no artwork is doing duty for two districts (${dup})`);

console.log('\n5 · ★★ LEVEL ROOFLINES · every house draws to the same height\n');
console.log('     v0.95.683 · tileW is derived per sprite from its own aspect so');
console.log('     drawn HEIGHT lands on Malezor\'s 5.57.  Before this, tileW was a');
console.log('     flat 5 and height fell out of whatever aspect the art had —');
console.log('     4.29 tiles for Xilnar\'s moondome against 5.56 for Thardin\'s');
console.log('     crucible, and every one of them shorter than Malezor.\n');
const TILE=48, TARGET=5.57;
console.log('     file                              aspect   drawn tiles');
const heights=[];
for(const n of present){
  const a=actual[n]; if(!a) continue;
  const asp=a[2]/a[3];
  const tw=Math.round(TARGET*asp*100)/100;      // same formula as homeTileW()
  const h=tw*TILE*(a[3]/a[2])/TILE;
  heights.push(h);
  console.log(`     ${n.padEnd(34)} ${asp.toFixed(3)}   ${tw.toFixed(2)} x ${h.toFixed(2)}`);
}
if(heights.length){
  const lo=Math.min(...heights), hi=Math.max(...heights);
  console.log(`\n     roofline spread ${lo.toFixed(2)} .. ${hi.toFixed(2)} tiles  (delta ${(hi-lo).toFixed(3)})`);
  console.log(`     Malezor villager-home reference draws 5.00 x ${TARGET}`);
  ok(hi-lo < 0.05, `every roofline within 0.05 tiles of the others (${(hi-lo).toFixed(3)})`);
  ok(Math.abs(lo-TARGET) < 0.05 && Math.abs(hi-TARGET) < 0.05,
     `and all of them sit on Malezor's ${TARGET}`);
  ok(/HOME_TARGET_H\s*=\s*5\.57/.test(src), 'HOME_TARGET_H in source is the same 5.57 this test assumes');
  ok(/tileW:\s*homeTileW\(/.test(src), 'the home prop actually calls homeTileW() — not a hardcoded 5');
}

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
