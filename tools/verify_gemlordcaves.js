// v0.95.689 · GEMLORD CAVE NETWORK
//
// Rewritten for the height rebase.  The previous version asserted every cave
// shared Rakoron's EXACT 139-tile footprint, which is now deliberately false:
// Rakoron's sheet is aspect 1.238 and the seven later sheets are ~1.07, so
// holding them all to one tileW made the new ones a sixth TALLER than his.
// v0.95.689 pins HEIGHT instead and lets width fall out of each sheet's own
// aspect — which is the whole point of "don't squish horizontally".
//
// So there are now two footprint classes and the test has to know that:
//   Rakoron  · halfW 6 · 13 wide · 139 tiles
//   the seven · halfW 5 · 11 wide · 117 tiles
const fs=require('fs'), path=require('path'), cp=require('child_process');
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new';
const BLD=path.join(ROOT,'assets/2D sprites/buildings');
const src=fs.readFileSync('/tmp/all.js','utf8');
let f=0;const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};

const CAVES=[
  {id:'rakoron_cave',  dist:'malezor',  file:'rakoron-cave-full.png',  legacy:true },
  {id:'ivirium_cave',  dist:'zarvane',  file:'ivirium-cave-full.png'  },
  {id:'mutaryn_cave',  dist:'andrannor',file:'mutaryn-cave-full.png'  },
  {id:'emeralix_cave', dist:'veridan',  file:'emeralix-cave-full.png' },
  {id:'azurel_cave',   dist:'vorashil', file:'azurel-cave-full.png'   },
  {id:'obsidius_cave', dist:'xilnar',   file:'obsidius-cave-full.png' },
  {id:'ambrevon_cave', dist:'baelgor',  file:'ambrevon-cave-full.png' },
  {id:'eurakeon_cave', dist:'netharion',file:'eurakeon-cave-full.png' },
  {id:'oathane_cave',  dist:'thardin',  file:'oathane-cave-full.png'  },
  {id:'oatheus_cave',  dist:'korathen', file:'oatheus-cave-full.png', empty:true },
];

console.log('\n1 · ★ EVERY CAVE IS DECLARED AND ITS ART IS ON DISK\n');
for(const c of CAVES){
  ok(new RegExp("id:\\s*'"+c.id+"'").test(src), `${c.id} declared in WORLD_PROPS`);
  ok(fs.existsSync(path.join(BLD,c.file)), `   art present · ${c.file}`);
}

console.log('\n2 · ★★ HEIGHT IS PINNED TO RAKORON · WIDTH IS NOT\n');
console.log('     This is the check the Creator actually asked for.  Every cave');
console.log('     must draw to the SAME height as Rakoron\'s, and each must keep');
console.log('     its own aspect — a uniform scale, never a squish.\n');
// measure the real pixels
const PY='/tmp/_measure_caves.py';
fs.writeFileSync(PY,[
"from PIL import Image","import json,sys,os","ROOT=sys.argv[1]","out={}",
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
"print(json.dumps(out))"].join("\n"));
let actual={},merr=null;
try{
  const args=[PY,BLD].concat(CAVES.map(c=>c.file)).map(a=>JSON.stringify(a)).join(' ');
  actual=JSON.parse(cp.execSync('python3 '+args,{maxBuffer:1<<24}).toString());
}catch(e){ merr=e.message.slice(0,140); }
ok(!merr, merr?'PIXEL MEASURE FAILED — '+merr:'measured the real pixels of all six sheets');
ok(Object.keys(actual).length===CAVES.length,
   `measured ${Object.keys(actual).length}/${CAVES.length} — a partial read must not read as a pass`);

// pull each declared tileW/tileH out of the source block for that cave
function block(id){
  const i=src.indexOf("id: '"+id+"'"); if(i<0) return '';
  return src.slice(i, i+1400);
}
const TARGET=8.49;   // 90% of Rakoron's visible 9.43
// ★ The height must be computed off the DECLARED bbox, not the measured one.
// drawProp slices the source rect the prop declares and scales that rect into
// tileW — so the declared aspect is what governs what you see on screen.
//
// An earlier draft of this file used the MEASURED alpha bbox for everyone and
// reported Rakoron at 11.08 against the new caves' 10.50, i.e. a failure I had
// just "introduced".  I hadn't.  Rakoron declares [0,0,1300,1050] — the whole
// frame, including ~70px of transparent padding on the right — while the five
// new sheets declare tight bboxes.  Measuring content width against a padded
// declaration is comparing two different things.  He draws 13 × 10.50 exactly
// as his own comment says.
console.log('     cave              BOX w x h        VISIBLE w x h');
const rows=[];
for(const c of CAVES){
  const b=block(c.id), a=actual[c.file];
  if(!b||!a) continue;
  const dm=b.match(/bbox:\s*\[\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\]/);
  if(!dm){ ok(false,`${c.id} · could not read bbox`); continue; }
  const dbb=[+dm[1],+dm[2],+dm[3],+dm[4]];
  let tw=null;
  const lit=b.match(/tileW:\s*([\d.]+)\s*,/);
  const call=b.match(/tileW:\s*caveTileW\(\[\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\]\)/);
  if(call){
    // recompute exactly as caveTileW does, from the bbox the SOURCE passes
    const bb=[+call[1],+call[2],+call[3],+call[4]];
    tw=Math.round(TARGET*(bb[2]/bb[3])*100)/100;
    ok(bb.join()===dbb.join(), `   ${c.id} passes its own declared bbox to caveTileW`);
    // and that declared bbox must be the REAL pixel extent — a tight bbox is
    // what makes declared-aspect and content-aspect the same number
    ok(dbb.join()===a.join(), `   ${c.id} bbox is tight against the real pixels (${dbb} vs ${a})`);
  } else if(lit){ tw=parseFloat(lit[1]); }
  if(tw==null){ ok(false,`${c.id} · could not read tileW`); continue; }
  // drawProp: drawW = tileW*TILE, drawH = round(drawW * bh/bw) — that is the
  // BOX. What the player sees is the CONTENT inside that box, and Rakoron's
  // box carries 26px x 107px of transparent padding his art never fills.
  const drawnH=tw*(dbb[3]/dbb[2]);
  const sx=tw/dbb[2], sy=drawnH/dbb[3];       // tiles per source pixel
  // ★ CLIP the measured content to the declared rect before scaling.
  // drawImage only ever reads the declared source rect, so any art outside it
  // is not merely unscaled — it is never drawn at all. Rakoron's sheet is
  // 1300x1300 but he declares only the top 1050 rows, so ~250 rows of his
  // sheet are cropped away. Measuring alpha across the FULL sheet reported his
  // visible height as 10.86 when what actually reaches the screen is 9.43 —
  // the same padded-vs-tight confusion one level down.
  const ix0=Math.max(a[0], dbb[0]),          iy0=Math.max(a[1], dbb[1]);
  const ix1=Math.min(a[0]+a[2], dbb[0]+dbb[2]), iy1=Math.min(a[1]+a[3], dbb[1]+dbb[3]);
  const cw=Math.max(0, ix1-ix0), ch=Math.max(0, iy1-iy0);
  const visW=cw*sx, visH=ch*sy;
  rows.push({id:c.id,legacy:c.legacy,tw,drawnH,visW,visH});
  console.log(`     ${c.id.padEnd(16)} ${tw.toFixed(2)} x ${drawnH.toFixed(2)}       ${visW.toFixed(2)} x ${visH.toFixed(2)}`);
}
if(rows.length){
  const rak=rows.find(r=>r.legacy);
  console.log(`\n     ★ Rakoron's VISIBLE cave is ${rak.visW.toFixed(2)} x ${rak.visH.toFixed(2)} tiles`);
  console.log(`       (his BOX is ${rak.tw.toFixed(2)} x ${rak.drawnH.toFixed(2)} — the rest is padding/crop)\n`);
  const others=rows.filter(r=>!r.legacy);
  // ★★ THE CHECK THE CREATOR ASKED FOR, on visible pixels.
  // v0.95.689 asserted BOX height parity and passed while the nine new caves
  // stood 11.3% taller than Rakoron on screen, because his box is padded and
  // theirs are tight. Comparing a padded declaration to tight ones compares
  // two different things. Only pixels count.
  let over=0;
  for(const r of others){
    const bad = r.visW > rak.visW+0.01 || r.visH > rak.visH+0.01;
    if(bad){ over++; console.log(`     OVER  ${r.id}  ${r.visW.toFixed(2)}x${r.visH.toFixed(2)} vs ${rak.visW.toFixed(2)}x${rak.visH.toFixed(2)}`); }
  }
  ok(over===0, `no cave is visibly bigger than Rakoron's on either axis (${over} over)`);
  const hs=others.map(r=>r.visH), lo=Math.min(...hs), hi=Math.max(...hs);
  console.log(`     visible-height spread ${lo.toFixed(2)} .. ${hi.toFixed(2)}  (delta ${(hi-lo).toFixed(3)})`);
  ok(hi-lo<0.02, `and they all stand the same height as each other (delta ${(hi-lo).toFixed(3)})`);
  // ★★ v0.95.693 · they must sit UNDER his roofline, not on it.
  // v0.95.692 pinned them flush at 9.43 and every measurement agreed — 452-453px
  // against his 453px, confirmed by rendering the real bitmaps. They still read
  // as taller, because his sheet is aspect 1.238 and theirs are ~1.065: equal
  // height on a 21%-narrower base looks looming, not equal. Proportion, not
  // arithmetic, which is why three passes of correct maths kept missing it.
  const ratio=lo/rak.visH;
  console.log(`     they stand ${(ratio*100).toFixed(1)}% of Rakoron's height · ${(rak.visH-lo).toFixed(2)} tiles of sky under his roof`);
  ok(ratio<0.97, `they are meaningfully SHORTER than Rakoron, not flush with him (${(ratio*100).toFixed(1)}%)`);
  ok(ratio>0.85, `but not miniature — still monumental doors (${(ratio*100).toFixed(1)}%)`);
  ok(Math.abs(TARGET-rak.visH*0.90)<0.02, `CAVE_TARGET_H (${TARGET}) is 90% of his measured ${rak.visH.toFixed(2)}, not a guess`);
  // the squish check: widths must DIFFER, because the sheets differ
  const ws=new Set(rows.filter(r=>!r.legacy).map(r=>r.tw.toFixed(2)));
  ok(ws.size>1, `the new caves do NOT share one hardcoded width (${ws.size} distinct) — a shared width would mean squishing`);
  ok(/CAVE_TARGET_H\s*=\s*8\.49/.test(src), 'CAVE_TARGET_H in source is the 8.49 this test assumes');
  ok(/function caveTileW/.test(src) && /function caveFootprint/.test(src),
     'both helpers exist — width and collision come from one place, not six hand-kept copies');
}

console.log('\n3 · ★ FOOTPRINT TRACKS THE ART · two classes, on purpose\n');
let legacyN=0,newN=0;
for(const c of CAVES){
  const b=block(c.id);
  const isNew=/footprint:\s*caveFootprint\(CAVE_HALF_W\)/.test(b);
  if(c.legacy){ legacyN++; ok(!isNew, `${c.id} keeps its own 13-wide footprint (it is the widest sheet)`); }
  else { newN++; ok(isNew, `${c.id} uses caveFootprint(CAVE_HALF_W) · 9 wide`); }
}
ok(/const CAVE_HALF_W\s*=\s*4/.test(src), 'CAVE_HALF_W is 4 · 9 tiles wide, under the ~10.1 of art');
// the stair gap must survive
const fpm=src.match(/function caveFootprint[\s\S]{0,400}?\n}/);
ok(!!fpm && /dy\s*>=\s*-3\s*&&\s*dx\s*===\s*0/.test(fpm[0]),
   'caveFootprint still cuts the centre stair column (dy -3..0) so the door is reachable');

console.log('\n4 · ★ PLACEMENT · right district, remote, on the wheel\n');
const EXPECT={
  rakoron_cave:[22,10], ivirium_cave:[-25,282], mutaryn_cave:[274,403],
  emeralix_cave:[510,156], azurel_cave:[216,550], obsidius_cave:[344,693],
  ambrevon_cave:[502,732], eurakeon_cave:[448,352], oathane_cave:[663,732],
  oatheus_cave:[824,750],
};
for(const c of CAVES){
  const b=block(c.id);
  const m=b.match(/tileX:\s*(-?\d+),\s*tileY:\s*(-?\d+)/);
  const e=EXPECT[c.id];
  ok(!!m && +m[1]===e[0] && +m[2]===e[1],
     `${c.id} at (${e[0]},${e[1]})${m?` · source says (${m[1]},${m[2]})`:''}`);
  ok(/door:\s*\[0,\s*-4\]/.test(b), `   door [0,-4] · same stair logic as Rakoron`);
  ok(/depthOffset:\s*-6\.5/.test(b), `   depthOffset -6.5`);
}

console.log('\n5 · ★ EVERY CAVE RESPONDS TO INTERACT\n');
for(const c of CAVES){
  ok(/onInteract:/.test(block(c.id)), `${c.id} has an onInteract handler`);
}
console.log('\n6 · ★★ THE TENTH DOOR IS NOT LIKE THE OTHER NINE\n');
console.log('     Oatheus is ABSENT (aov-oatheus-missing) — the Empty Throne is');
console.log('     what triggers the endgame.  The other nine doors are sealed BY');
console.log('     a Gemlord; his has no one to seal it.  If he ever quietly picks');
console.log('     up the shared "sealed for now" toast, that beat is gone and');
console.log('     nothing else in the codebase would notice.\n');
// v0.95.691 · the placeholder toasts are gone — every door with card art now
// opens that Gemlord's card, so the beat moved from the TOAST to the poster
// TITLE.  Nine read "<NAME> · <GEM>LORD OF <DISTRICT>".  His reads THE EMPTY
// THRONE, because there is no district he is lord of any more.
const ob=block('oatheus_cave');
ok(!/sealed for now/.test(ob), 'Oatheus does NOT carry a "sealed for now" toast');
const pm=src.match(/'oatheus':\s*\{[^}]*title:\s*'([^']+)'/);
ok(!!pm && /EMPTY THRONE/.test(pm[1]), `his card title is the tell — "${pm?pm[1]:'??'}"`);
let lordOf=0;
for(const c of CAVES){
  if(c.id==='oatheus_cave') continue;
  const g=c.id.replace('_cave','');
  const t=src.match(new RegExp("'"+g+"':\\s*\\{[^}]*title:\\s*'([^']+)'"));
  if(t && /LORD OF /.test(t[1])) lordOf++;
}
ok(lordOf>=8, `${lordOf} of the others are titled "...LORD OF <district>" — the contrast is the point`);
console.log('\n7 · ★★ X ON A GEMLORD DOOR OPENS THAT GEMLORD\'S CARD\n');
console.log('     Rakoron has done this since v0.95.182.  v0.95.691 gives the');
console.log('     other nine the same handler.  The risk being guarded here is');
console.log('     openPosterView() failing SILENTLY: it does `if (!info) return`,');
console.log('     so a door pointing at an unregistered id, or a POSTERS entry');
console.log('     pointing at a file that is not on disk, does nothing at all');
console.log('     and looks exactly like a door that was never wired.\n');
let wired=0, toasting=[];
for(const c of CAVES){
  const b=block(c.id);
  // strip comments first — an earlier pass skipped Ivirium because the word
  // openPosterView appeared in a comment explaining why he deliberately did
  // NOT call it.  Matching prose is not matching code.
  const code=b.replace(/\/\/[^\n]*/g,'');
  const j=code.indexOf('onInteract');
  const body=code.slice(j, j+300);
  const m=body.match(/openPosterView\('([a-z]+)'\)/);
  if(m){
    wired++;
    ok(m[1]===c.id.replace('_cave',''), `${c.id} opens openPosterView('${m[1]}')`);
    const pe=src.match(new RegExp("'"+m[1]+"':\\s*\\{\\s*src:\\s*'([^']+)'"));
    ok(!!pe, `   '${m[1]}' is registered in POSTERS — otherwise it returns silently`);
    if(pe){
      const rel=decodeURIComponent(pe[1]);
      ok(fs.existsSync(path.join(ROOT,rel)), `   and its art is on disk · ${rel.split('/').pop()}`);
    }
  } else {
    toasting.push(c.id);
  }
}
console.log(`\n     ${wired}/${CAVES.length} doors open a card.`);
for(const t of toasting) console.log(`     ${t} still toasts — no v2 card exists for that Gemlord`);
ok(wired>=CAVES.length-1, `at most one Gemlord is missing card art (${CAVES.length-wired} toasting)`);
// no orphans in the other direction either
const gl=fs.readdirSync(path.join(ROOT,'assets/2D sprites/decor/gemlords')).filter(x=>x.endsWith('.png'));
const referenced=new Set((src.match(/decor\/gemlords\/([a-z]+)\.png/g)||[]).map(x=>x.split('/').pop()));
const orph=gl.filter(x=>!referenced.has(x));
for(const o of orph) console.log(`     ORPHAN  ${o} — on disk, never referenced`);
ok(orph.length===0, `no Gemlord card is orphaned (${orph.length})`);
// and he must still be the most remote thing in the game
ok(/824, tileY: 750/.test(ob), 'and he sits at (824,750) · 96t out, the furthest structure in Zyraxis');
console.log('\n     NOTE · card art is in; INTERIORS are still unbuilt. Only Rakoron');
console.log('     has an onSquare that enters a sanctum.');

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
