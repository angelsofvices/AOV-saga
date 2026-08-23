const fs = require('fs');
const _harnessSrc = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};
global.setInterval = () => 0; global.setTimeout = () => 0;
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width:0, height:0, data:[] }) });
const el = () => ({ style:{}, dataset:{}, classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
  width:960, height:540, value:'', textContent:'', innerHTML:'', children:[], childNodes:[],
  getContext:()=>CTX, appendChild:noop, removeChild:noop, addEventListener:noop, removeEventListener:noop,
  setAttribute:noop, getAttribute:()=>null, focus:noop, remove:noop, play:()=>Promise.resolve(), pause:noop,
  querySelector:()=>el(), querySelectorAll:()=>[], getBoundingClientRect:()=>({left:0,top:0,width:960,height:540}) });
global.addEventListener = noop; global.removeEventListener = noop;
global.document = { getElementById:()=>el(), querySelector:()=>el(), querySelectorAll:()=>[],
  createElement:()=>el(), addEventListener:noop, body:el(), documentElement:el(), head:el(),
  hidden:false, visibilityState:'visible' };
global.window = global;
global.localStorage = { getItem:()=>null, setItem:noop, removeItem:noop };
global.Audio = function(){ return { play:()=>Promise.resolve(), pause:noop, addEventListener:noop, cloneNode(){return this} }; };
global.Image = function(){ return { addEventListener:noop, complete:false, naturalWidth:0, src:'' }; };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches:false, addEventListener:noop, addListener:noop });
global.navigator = { userAgent:'node', getGamepads:()=>[], maxTouchPoints:0 };
global.performance = { now: () => Date.now() };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });
// verify_scrolls · v0.95.781 · 180 lore scrolls · the Aethryx Expanse index
try{new Function(require('fs').readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={scrollRxpFor,scrollRxpTotal,SCROLL_THEMES,SCROLL_DISTRICT_ORDER,SCROLLS_PER_DISTRICT,SCROLL_BBOXES,scatterScrolls,readScroll,scrollEntry,scrollId,scrollsFound,scrollsFoundInTheme,scrollDepthOf,notebookState,renderZycellNotebook,WORLD_PROPS,_propBlocked,_tileIsVisiblyClear,worldDistrictAt,isWorldLandTile,isWorldBorderTile,_districtPOIs,player,game,snapBuildingsToLattice,buildAllTrails,scatterWoodChests,topUpDistrictCollectibles,evictFromBuildings,clearFloraFromDoorways};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)fail++;};
const H=t=>console.log('\n'+t);
C.snapBuildingsToLattice(); C.buildAllTrails(); C.scatterWoodChests();
C.topUpDistrictCollectibles(); C.evictFromBuildings();
C.scatterScrolls(); C.clearFloraFromDoorways();
const props=C.WORLD_PROPS.filter(p=>p&&p._scroll);

H('1 · ★★ 18 THEMES x 10 DISTRICTS = 180');
{
  ok(C.SCROLL_THEMES.length===18,`${C.SCROLL_THEMES.length} scroll subjects`);
  ok(C.SCROLL_THEMES.every(t=>t.pages.length===10),'each has exactly 10 pages, one per district');
  ok(props.length===180,`${props.length} scroll props in the world`);
  ok(new Set(props.map(p=>p.id)).size===180,'all ids unique');
  const arts=new Set(C.SCROLL_THEMES.map(t=>t.art));
  ok(arts.size===18,`${arts.size} distinct scroll artworks, one per subject`);
}

H('2 · ★★ ONE OF EACH IN EVERY DISTRICT');
{
  let bad=[];
  for(const d of C.SCROLL_DISTRICT_ORDER){
    const here=props.filter(p=>p._scroll.dist===d);
    const themes=new Set(here.map(p=>p._scroll.theme));
    if(here.length!==18||themes.size!==18) bad.push(`${d}:${here.length}/${themes.size}`);
  }
  ok(bad.length===0,`every district has 18 scrolls, one per subject${bad.length?' — '+bad.join(' '):''}`);
  ok(props.every(p=>C.worldDistrictAt(p.tileX,p.tileY)===p._scroll.dist),
     'and every one stands in the district whose page it carries');
}

H('3 · ★★ THE LORE DEEPENS OUTWARD');
// Creator: "as you go further out of malezor, the lore deepens." Page N of a
// theme belongs to district N — so a theme read across the map is one subject
// answered progressively, not ten unrelated notes.
{
  ok(C.scrollDepthOf('malezor')===0,'Malezor is depth 0');
  ok(C.scrollDepthOf('korathen')===9,'Korathen is depth 9');
  const t=C.SCROLL_THEMES.find(x=>x.key==='aethryx');
  const shallow=C.scrollEntry('aethryx','malezor').page;
  const deep=C.scrollEntry('aethryx','korathen').page;
  ok(shallow!==deep,'the same subject reads differently at each end');
  ok(shallow===t.pages[0]&&deep===t.pages[9],'and the page index follows district order');
  // deeper pages should carry more of the actual cosmology
  const NAMES=/AETHRYX|Astralite|Cytherion|Gemlord|Matrix|Expanse|Prism|Xenoxil|Mykarlyth/i;
  let shallowHits=0, deepHits=0;
  for(const th of C.SCROLL_THEMES){
    if(NAMES.test(th.pages[0])) shallowHits++;
    if(NAMES.test(th.pages[9])) deepHits++;
  }
  ok(deepHits>shallowHits,
     `★ deep pages name the cosmology far more often (${deepHits}/18 vs ${shallowHits}/18) — the lore really does deepen`);
}

H('4 · ★★ THEY ARE SOLID AND READ WITH X');
{
  ok(props.every(p=>(p.footprint||[]).length>0),'every scroll carries a footprint');
  ok(props.every(p=>C._propBlocked.has(`${p.tileX},${p.tileY}`)),'every scroll tile blocks');
  ok(props.every(p=>!!p.door),'every scroll has a door tile, so X reaches it');
  ok(props.every(p=>typeof p.onInteract==='function'),'and an interact handler');
}

H('5 · ★★ EVERY ONE CAN BE REACHED AND SEEN');
{
  const free=(x,y)=>C.isWorldLandTile(x,y)&&!C.isWorldBorderTile(x,y)&&!C._propBlocked.has(`${x},${y}`);
  const stranded=props.filter(p=>![[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>free(p.tileX+dx,p.tileY+dy)));
  ok(stranded.length===0,`somewhere to stand beside every scroll (${stranded.length} stranded)`);
  // ★ pass the scroll as `ignore` — without it every scroll's own sprite covers
  // its own tile and all 180 report as buried. That is what caught the missing
  // parameter in the first place.
  const hidden=props.filter(p=>!C._tileIsVisiblyClear(p.tileX,p.tileY,p.tileW,p));
  ok(hidden.length===0,`none is buried under a canopy (${hidden.length})`);
  // and the check must still be capable of failing · plant a probe under a tree
  const tree=C.WORLD_PROPS.find(q=>q&&q.src&&/tree\.png/.test(q.src));
  ok(!C._tileIsVisiblyClear(tree.tileX,tree.tileY,1),
     'a tile under a tree trunk still reads as covered — the test is not vacuous');
}

H('6 · ★ OFF THE ROAD · a find, not a pickup');
{
  let onRoad=0;
  for(const p of props){
    const R=(C.game._trailRoad||{})[p._scroll.dist];
    if(R&&R.has(`${p.tileX},${p.tileY}`)) onRoad++;
  }
  ok(onRoad===0,`none sits on the carved roadbed (${onRoad})`);
}

H('7 · ★★ EVENLY RUNG AROUND EACH DISTRICT');
// Each theme takes an angular wedge, so a district's scrolls circle its hub
// rather than clumping wherever the RNG happened to like.
{
  let worst=0, worstD='';
  for(const d of C.SCROLL_DISTRICT_ORDER){
    const P=C._districtPOIs(d);
    const b=new Array(8).fill(0);
    props.filter(p=>p._scroll.dist===d).forEach(p=>{
      const a=Math.atan2(p.tileY-P.hub[1],p.tileX-P.hub[0]);
      b[Math.floor(((a+Math.PI)/(Math.PI*2))*8)%8]++;
    });
    const empty=b.filter(x=>x===0).length;
    if(empty>worst){worst=empty;worstD=d;}
  }
  ok(worst<=2,`worst district leaves only ${worst} of 8 octants empty (${worstD||'none'})`);
}

H('8 · ★★ COLLECTING ONE TAKES IT OFF THE GROUND');
// Creator: "you collect them, they disappear from overworld and go into dads
// notebook. you are filling up the pages." So a read is a COLLECTION.
{
  C.player.notebook=null;
  ok(C.scrollsFound()===0,'nothing recovered on a fresh save');
  const p=C.WORLD_PROPS.find(x=>x&&x._scroll&&x._scroll.theme==='matrix'&&x._scroll.dist==='malezor');
  ok(!!p,'the Malezor page of THE ASTRALITE MATRIX is lying in the world');
  const tile=`${p.tileX},${p.tileY}`;
  ok(C._propBlocked.has(tile),'  and it blocks · you have to stop for it');
  p.onInteract();
  ok(C.scrollsFound()===1,'picking it up files the page');
  ok(!C.WORLD_PROPS.some(x=>x&&x._scroll&&x._scroll.theme==='matrix'&&x._scroll.dist==='malezor'),
     '★ and the note is GONE from the overworld');
  ok(!C._propBlocked.has(tile),
     '★ its tile is walkable again · no invisible page left standing there');
  ok(C.scrollsFoundInTheme('matrix')===1,'it counts toward its own subject');
  ok(C.scrollsFoundInTheme('aethryx')===0,'not toward another');
  ok(C.readScroll('matrix','malezor')===false,'and it cannot be recovered twice');
}

H('8b · ★★ A RECOVERED PAGE DOES NOT COME BACK');
// Without this every reload would re-litter the world with pages the player has
// already carried home.
{
  const before=C.WORLD_PROPS.filter(x=>x&&x._scroll).length;
  // wipe the props and re-run the scatter, as a fresh world build would
  for(let i=C.WORLD_PROPS.length-1;i>=0;i--) if(C.WORLD_PROPS[i]&&C.WORLD_PROPS[i]._scroll) C.WORLD_PROPS.splice(i,1);
  C.game._scrollsScattered=false;
  C.scatterScrolls();
  const after=C.WORLD_PROPS.filter(x=>x&&x._scroll).length;
  ok(after===179,`the world rebuilds with ${after} notes, not 180 — the recovered one stays recovered`);
  ok(!C.WORLD_PROPS.some(x=>x&&x._scroll&&x._scroll.theme==='matrix'&&x._scroll.dist==='malezor'),
     'and specifically not the one already in the notebook');
}

H('8c · ★★ THEY ARE HIS NOTES, IN HIS VOICE');
// The reframe: 180 pages he lost across twenty years of field work, not
// anonymous world lore.
{
  const all=C.SCROLL_THEMES.flatMap(t=>t.pages);
  const firstPerson=all.filter(p=>/\b(I|my|me)\b/.test(p)).length;
  ok(firstPerson>=80,`${firstPerson}/180 pages are written in the first person`);
  const addressed=all.filter(p=>/\bson\b/.test(p)).length;
  ok(addressed>=4,`${addressed} of them speak to Rizer directly`);
  const src=require('fs').readFileSync('/tmp/all.js','utf8');
  ok(/DAD'S NOTE ·/.test(src),'the pickup announces itself as DAD\'S NOTE');
  ok(/page \$\{have\} of \$\{all\} recovered/.test(src),
     'and counts the pages he is getting back');
}

H('9 · ★★ RXP SCALES WITH HOW MANY PAGES YOU HAVE');
// ★ v0.95.788 · this asserted the award scaled with DISTANCE (40 + 20/depth).
// The Creator changed it to scale with COLLECTION — "fixed rxp number per
// number of scroll collected. low to high. not a one level full gainer" — so
// the check follows the new rule.
{
  ok(typeof C.scrollRxpFor==='function','the award is a function of the count held');
  const first=C.scrollRxpFor(0), last=C.scrollRxpFor(179);
  ok(last>first,`page 1 pays ${first}, page 180 pays ${last} — low to high`);
  let rising=true, prev=0;
  for(let i=0;i<180;i++){ const v=C.scrollRxpFor(i); if(v<prev) rising=false; prev=v; }
  ok(rising,'and never steps DOWN as the collection grows');
  ok(last<300,`no single page is a level in one go (biggest is ${last})`);
  const total=C.scrollRxpTotal();
  ok(total>3000&&total<12000,
     `a full 180-page sweep pays ${total} RXP against a ~10,000 main-quest line — meaningful, not eclipsing`);
  // the OLD rule must be gone
  const src=require('fs').readFileSync('/tmp/all.js','utf8');
  const i=src.indexOf('function readScroll');
  ok(!/scrollDepthOf\(dist\)\s*\*\s*\d+/.test(src.slice(i,i+900)),
     'the distance-based award is retired');
}

H('10 · ★★ THE NOTEBOOK SHOWS THEM BY SUBJECT');
// ★ These three assertions lagged the reframe: they matched the old "SCROLLS"
// header and looked up a page that section 8 no longer collects. Fixed to the
// current truth rather than the wording I happened to write first.
{
  C.player.dadNotebookGifted=true;
  // recover a known page so the "found page shows its text" check has one
  C.readScroll('aethryx','malezor');
  C.game._nbSection='scrolls';
  const html=C.renderZycellNotebook();
  ok(/DAD'S LOST PAGES · \d+ \/ 180 RECOVERED/.test(html),
     'the header reads as HIS pages and counts all 180');
  ok(/twenty years of field work/.test(html),'and frames them as notes he dropped, not world lore');
  for(const t of C.SCROLL_THEMES.slice(0,4)) ok(html.includes(t.title),`  subject listed · ${t.title}`);
  ok(/not recovered/.test(html),'unfound pages are shown as gaps, so you know how far is left');
  const page=C.scrollEntry('aethryx','malezor').page;
  ok(html.includes(page),'a recovered page shows its text in full');
  C.game._nbSection=null;
  const idx=C.renderZycellNotebook();
  ok(/\/ 180 pages recovered/.test(idx),'and the index row counts 180 pages, not the 4 seed notes');
  ok(/LOST PAGES/.test(idx),'the section is named for him on the index too');
}

H('11 · ★ THE ART IS REAL · 18 files on disk');
{
  const fs=require('fs');
  const dir='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/assets/2D sprites/decor/scrolls/';
  const files=fs.readdirSync(dir).filter(f=>f.endsWith('.png'));
  ok(files.length===18,`${files.length} scroll artworks installed`);
  ok(files.every(f=>fs.statSync(dir+f).size>3000),'none is a stub');
  ok(C.SCROLL_THEMES.every(t=>files.includes(t.art)),'every subject points at a file that exists');
  ok(C.SCROLL_THEMES.every(t=>C.SCROLL_BBOXES[t.art]),'and every one has a measured bbox');
}


H('12 · ★★ THE PYTHON FILE IS THE SOURCE OF TRUTH');
// The Creator asked: "If I edit the python will it edit the scroll". It did
// NOT — data/scroll_lore_source.py was a dead copy I saved for readability
// while the game read a block baked into rp7b.html. Now the block is generated
// FROM that file and this asserts the two cannot drift.
{
  const fs=require('fs'), cp=require('child_process');
  const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
  ok(fs.existsSync(ROOT+'data/scroll_lore_source.py'),'the prose source exists');
  ok(fs.existsSync(ROOT+'tools/sync_scrolls.py'),'and a sync script exists');
  const html=fs.readFileSync(ROOT+'rp7b.html','utf8');
  ok(/SCROLL_THEMES:BEGIN/.test(html)&&/SCROLL_THEMES:END/.test(html),
     'rp7b.html carries the generated-block markers');
  ok(/DO NOT HAND-EDIT/.test(html)&&/scroll_lore_source\.py/.test(html),
     'and says so, pointing at the source file');
  // ★ running the sync on an unchanged source must be a NO-OP · if it is not,
  // the generator and the checked-in block have already drifted.
  const out=cp.execSync('cd '+ROOT+' && python3 tools/sync_scrolls.py 2>&1').toString();
  ok(/no change/.test(out),
     `sync is a no-op against the committed file · "${out.trim()}"`);
  // and the running game must match the source text exactly
  const py=fs.readFileSync(ROOT+'data/scroll_lore_source.py','utf8');
  let matched=0;
  for(const t of C.SCROLL_THEMES){
    for(const page of t.pages){
      const probe=page.slice(0,40).replace(/\\'/g,"'");
      if(py.includes(probe)) matched++;
    }
  }
  ok(matched>=175,`${matched}/180 pages in the game are traceable to the python source`);
}

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
