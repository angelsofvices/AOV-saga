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
// verify_notebook · v0.95.778 · Dad's Notebook · the POI index
try{new Function(require('fs').readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={NPCS,ENEMY_KINDS,enemyKindOf,notebookLogKill,notebookHint,notebookStanding,_migrateNotebook,renderZycellZycube,INVENTORY_META,NOTEBOOK_SECTIONS,NOTEBOOK_SCROLLS,notebookState,notebookHas,notebookVisit,notebookComplete,notebookFindScroll,notebookScrollsFor,notebookEntries,notebookProgress,notebookNotePropInteract,renderZycellNotebook,ZYCELL_PANELS,WORLD_PROPS,DISTRICT_WHEEL,TOWER_NETWORK,SPECIES,player,game,zycellPage,worldDistrictAt,snapBuildingsToLattice,buildAllTrails,scatterWoodChests,topUpDistrictCollectibles,evictFromBuildings};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)fail++;};
const H=t=>console.log('\n'+t);
C.snapBuildingsToLattice(); C.buildAllTrails(); C.scatterWoodChests();
C.topUpDistrictCollectibles(); C.evictFromBuildings();
C.player.notebook=null; C.player.items={dads_notebook:1}; C.player.dadNotebookGifted=true;

H('1 · ★★ IT IS ITS OWN PAGE IN THE PHONE');
{
  ok(C.ZYCELL_PANELS.includes('notebook'),'notebook is a registered panel');
  ok(C.ZYCELL_PANELS.indexOf('notebook')===1,
     `and sits at position ${C.ZYCELL_PANELS.indexOf('notebook')} — right after HOME, not buried`);
  const src=require('fs').readFileSync('/tmp/all.js','utf8');
  ok(/notebook:\s*renderZycellNotebook/.test(src),'the dispatcher routes to its renderer');
  // ★ The nav button is HTML MARKUP, not script — /tmp/all.js only holds the
  // extracted <script> bodies, so grepping it for the button found nothing and
  // reported a missing button that was there all along. Read the real file.
  const page=require('fs').readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
  ok(/data-zynav="notebook"/.test(page),'and there is a nav button for it in the panel markup');
  const navs=(page.match(/data-zynav="/g)||[]).length;
  ok(navs===C.ZYCELL_PANELS.length,
     `every panel has exactly one nav button (${navs} buttons, ${C.ZYCELL_PANELS.length} panels)`);
}

H('2 · ★★ EVERY ENTRY IS DERIVED FROM THE LIVE WORLD');
// A hand-written index would be wrong within a week. Each section must count
// what is actually in the world right now.
{
  const d=C.notebookEntries('districts'), t=C.notebookEntries('towers');
  const c=C.notebookEntries('caves'), l=C.notebookEntries('landmarks');
  const z=C.notebookEntries('zyrex');
  ok(d.length===C.DISTRICT_WHEEL.length,`districts: ${d.length} = DISTRICT_WHEEL`);
  ok(t.length===C.TOWER_NETWORK.length,`towers: ${t.length} = TOWER_NETWORK`);
  const realCaves=C.WORLD_PROPS.filter(p=>p&&/_cave$/.test(p.id||'')).length;
  ok(c.length===realCaves,`caves: ${c.length} = the cave props actually placed`);
  const real30=C.WORLD_PROPS.filter(p=>p&&p._district30).length;
  // ★ v0.95.813 · LANDMARKS = lore buildings + the ten folded-in Gemlord caves
  ok(l.length===real30+realCaves,
     `landmarks: ${l.length} = ${real30} lore buildings + ${realCaves} folded-in caves`);
  ok(z.length===Object.keys(C.SPECIES).length,`zyrex: ${z.length} = the SPECIES table`);
  ok(d.length+t.length+c.length+l.length+z.length>100,'a real index, not a stub');
}

H('3 · ★★ NOTHING IS PRE-REVEALED');
// A journal that starts full is a menu. Everything must begin unfound.
{
  C.player.notebook=null; C.player.visitedDistricts={}; C.player.party=[]; C.player.pcZyrex=[];
  let found=0,total=0;
  for(const S of C.NOTEBOOK_SECTIONS){
    if(S.key==='scrolls') continue;
    const p=C.notebookProgress(S.key); found+=p.found; total+=p.total;
  }
  ok(total>100,`${total} entries in total`);
  ok(found<=10,`only ${found} start found — the rest is earned`);
}

H('4 · ★★ WALKING INTO A DISTRICT FILES IT');
{
  C.player.notebook=null;
  const before=C.notebookProgress('districts').found;
  C.notebookVisit('district:veridan','VERIDAN');
  const after=C.notebookProgress('districts').found;
  ok(after===before+1,`districts found ${before} -> ${after}`);
  ok(C.notebookVisit('district:veridan','VERIDAN')===false,'visiting again does not double-count');
  // and an existing save's visitedDistricts lights up without re-walking
  C.player.notebook=null;
  C.player.visitedDistricts={malezor:true,zarvane:true};
  ok(C.notebookProgress('districts').found===2,
     '★ an old save with visitedDistricts shows 2 found immediately — no flag is tracked twice');
}

H('5 · ★★ ONE HOOK COVERS THIRTY LANDMARKS');
// The alternative was editing thirty onInteract bodies, which would drift apart
// the first time somebody added a building.
{
  C.player.notebook=null;
  const lm=C.WORLD_PROPS.find(p=>p&&p._district30);
  const cave=C.WORLD_PROPS.find(p=>p&&/_cave$/.test(p.id||''));
  C.notebookNotePropInteract(lm);
  C.notebookNotePropInteract(cave);
  // ★ v0.95.813 · a cave interact ALSO lands in landmarks now (the fold), so
  //   after touching one building and one cave the landmarks section reads 2
  ok(C.notebookProgress('landmarks').found===2,
     `interacting with ${lm.id} + ${cave.id} filed BOTH into landmarks — the fold is live in the counts`);
  ok(C.notebookProgress('caves').found===1,`interacting with ${cave.id} filed it`);
  const src=require('fs').readFileSync('/tmp/all.js','utf8');
  const hooks=(src.match(/notebookNotePropInteract\(/g)||[]).length;
  ok(hooks<=4,`only ${hooks} references to the hook — one chokepoint, not thirty edits`);
}

H('6 · ★★ A CAUGHT ZYREX MARKS THE DEX WITHOUT BEING TRACKED TWICE');
{
  C.player.notebook=null;
  const k=Object.keys(C.SPECIES)[0];
  C.player.party=[{speciesId:k,level:5}];
  const z=C.notebookEntries('zyrex').find(e=>e.id===`zyrex:${k}`);
  ok(z&&z.found&&z.done,`${k} reads as caught straight from the party roster`);
  C.player.party=[];
  const z2=C.notebookEntries('zyrex').find(e=>e.id===`zyrex:${k}`);
  ok(z2&&!z2.done,'and un-marks if it leaves the roster — the roster is the truth');
}

H('7 · ★★ TOWERS READ THEIR OWN RESTORED FLAG');
{
  C.player.notebook=null;
  C.player.scrapjawTowersRestored={malezor:true};
  const t=C.notebookEntries('towers').find(e=>e.id==='tower:malezor');
  ok(t&&t.done,'a restored tower shows complete without a second flag');
  const sub=C.notebookEntries('towers').find(e=>e.id==='tower:korathen');
  ok(sub&&!sub.done&&/guarded/.test(sub.sub),`an unrestored one still names its guard · "${sub.sub}"`);
}

H('8 · ★★ SCROLLS FILE THEMSELVES UNDER A PAGE');
{
  C.player.notebook=null;
  ok(C.NOTEBOOK_SCROLLS.length>0,`${C.NOTEBOOK_SCROLLS.length} scrolls defined`);
  ok(C.NOTEBOOK_SCROLLS.every(s=>s.id&&s.page&&s.text),'each has an id, a page and lore text');
  const sc=C.NOTEBOOK_SCROLLS[0];
  ok(C.notebookScrollsFor(sc.page).length===0,'undiscovered scrolls are not shown');
  ok(C.notebookFindScroll(sc.id)===true,'finding one records it');
  ok(C.notebookScrollsFor(sc.page).length===1,`and it now appears on page "${sc.page}"`);
  ok(C.notebookFindScroll(sc.id)===false,'finding it twice is a no-op');
  ok(C.notebookFindScroll('nope_not_real')===false,'an unknown scroll id is refused');
}

H('9 · ★★ THE PANEL RENDERS, AND GATES ON OWNING THE NOTEBOOK');
{
  C.player.dadNotebookGifted=false; C.player.items={};
  const locked=C.renderZycellNotebook();
  ok(/Talk to Dad/.test(locked),'without the notebook it tells you where to get it');
  ok(!/GEMLORD CAVES/.test(locked),'and shows no index');
  C.player.dadNotebookGifted=true;
  C.game._nbSection=null;
  const idx=C.renderZycellNotebook();
  ok(/DAD'S NOTEBOOK/.test(idx),'with it, the index renders');
  for(const S of C.NOTEBOOK_SECTIONS) ok(idx.includes(S.label),`  section listed · ${S.label}`);
  const nItems=(idx.match(/data-zyitem=/g)||[]).length;
  ok(nItems===C.NOTEBOOK_SECTIONS.length,
     `every section row is a [data-zyitem] (${nItems}) — the DualSense auto-enrolment picks them up free`);
  C.game._nbSection='towers';
  const page=C.renderZycellNotebook();
  ok(/BACK TO INDEX/.test(page),'a section page offers a way back');
  ok((page.match(/data-zyitem=/g)||[]).length>=C.TOWER_NETWORK.length,'and every row is navigable');
  C.game._nbSection=null;
}

H('10 · ★ IT SURVIVES A SAVE');
{
  const src=require('fs').readFileSync('/tmp/all.js','utf8');
  ok(/notebook:\s*player\.notebook/.test(src),'player.notebook is written into the save snapshot');
  C.player.notebook=null;
  C.notebookVisit('district:xilnar','XILNAR');
  C.notebookFindScroll(C.NOTEBOOK_SCROLLS[0].id);
  const st=C.notebookState();
  ok(st.seen['district:xilnar']&&st.scrolls[C.NOTEBOOK_SCROLLS[0].id],
     'and it holds both visits and scrolls in one object');
}


H('11 · ★★ IT IS AN INSTALLED APP, NOT A BAG ITEM');
// Creator: "remove dads notebook from the zycube since it has its own panel
// now. it will be installed when dad grants rizer the notebook."
{
  const src=require('fs').readFileSync('/tmp/all.js','utf8');
  const i=src.indexOf('function renderZycellZycube');
  ok(/k !== 'dads_notebook'/.test(src.slice(i,i+900)),
     'ZyCube filters dads_notebook out of the bag list');
  // Dad must not hand over an object any more
  const gi=src.indexOf('dadStarterQuestGiven = true');
  const gift=src.slice(gi,gi+1200);
  ok(!/inv\.dads_notebook\s*=/.test(gift),'Dad no longer puts an object in the bag');
  ok(/dadNotebookGifted\s*=\s*true/.test(gift),'he still sets the unlock flag');
  ok(/notebookVisit\('district:malezor'/.test(gift),
     '★ and his Malezor research is pre-loaded — page one is not blank');
}

H('12 · ★★ AN OLD SAVE CARRYING THE OBJECT STILL WORKS');
// Owning the object WAS the unlock. Strip the item, keep what it meant.
{
  C.player.items={dads_notebook:1, ale:3};
  C.player.dadNotebookGifted=false;
  C.notebookState();                       // migration runs here
  ok(!C.player.items.dads_notebook,'the bag item is stripped on load');
  ok(C.player.dadNotebookGifted===true,'and the notebook counts as installed');
  ok(C.player.items.ale===3,'nothing else in the bag is touched');
  ok(C.notebookHas()===true,'the panel opens for that save');
}

H('13 · ★★ DAD POINTS AT WHAT IS LEFT');
// The hint must be DERIVED from the index, so it can never name something that
// does not exist or is already done.
{
  C.player.notebook=null; C.player.visitedDistricts={}; C.player.party=[];
  C.player.scrapjawTowersRestored={};
  C.player.x=22; C.player.y=104;           // standing in Malezor
  const h1=C.notebookHint();
  ok(!!h1&&!!h1.text,`a hint is produced · "${h1.text.slice(0,58)}..."`);
  ok(/MALEZOR|district|tower/i.test(h1.text),'and it is about somewhere real');
  // finish the thing it named, and the hint must move on
  C.player.scrapjawTowersRestored={malezor:true};
  const h2=C.notebookHint();
  ok(h2.text!==h1.text,'completing the named task changes the hint');
  // with everything done it does not invent work
  const all={}; for(const w of C.DISTRICT_WHEEL) all[w.dist]=true;
  C.player.visitedDistricts=all; C.player.scrapjawTowersRestored=all;
  C.player.party=Object.keys(C.SPECIES).map(k=>({speciesId:k,level:1}));
  const seen=C.notebookState();
  for(const k of ['caves','landmarks']) for(const e of C.notebookEntries(k)){ seen.seen[e.id]=1; seen.done[e.id]=1; }
  const h3=C.notebookHint();
  ok(/Proud of you|walked all of it/i.test(h3.text),
     `with nothing left it says so rather than inventing a task · "${h3.text.slice(0,44)}..."`);
}

H('14 · ★ HE NOTICES HOW FAR YOU HAVE GOT');
{
  C.player.notebook=null; C.player.visitedDistricts={}; C.player.party=[];
  C.player.scrapjawTowersRestored={};
  const low=C.notebookStanding();
  ok(low.total>100&&low.found<=5,`fresh save · ${low.found}/${low.total} logged`);
  ok(/boots dirty|made a start/i.test(low.line),`and the line matches · "${low.line}"`);
  const all={}; for(const w of C.DISTRICT_WHEEL) all[w.dist]=true;
  C.player.visitedDistricts=all; C.player.scrapjawTowersRestored=all;
  C.player.party=Object.keys(C.SPECIES).map(k=>({speciesId:k,level:1}));
  const st=C.notebookState();
  for(const k of ['caves','landmarks']) for(const e of C.notebookEntries(k)){ st.seen[e.id]=1; st.done[e.id]=1; }
  const high=C.notebookStanding();
  ok(high.pct>low.pct,`progress moves the needle · ${Math.round(low.pct*100)}% -> ${Math.round(high.pct*100)}%`);
  ok(high.line!==low.line,`and the praise changes with it · "${high.line}"`);
}


H('15 · ★★ THE ENEMY FIELD LOG');
// Creator: "add an enemies page in the note book so u can track the types of
// enemies you fight."
{
  ok(C.NOTEBOOK_SECTIONS.some(S=>S.key==='enemies'),'ENEMY FIELD LOG is a notebook section');
  const e=C.notebookEntries('enemies');
  ok(e.length===C.ENEMY_KINDS.length,`${e.length} enemy TYPES tracked, not individuals`);
  // ★ types, not instances · there are hundreds of Mori and they are ONE entry
  const mori=C.NPCS.filter(n=>C.enemyKindOf(n)==='mori').length;
  ok(mori>100,`${mori} Mori stand in the world`);
  ok(e.filter(x=>x.name==='MORI').length===1,'and they collapse to a single MORI entry');
  // every live enemy must classify · an unclassified enemy is invisible to the log
  const unknown=C.NPCS.filter(n=>n&&n.isEnemy&&!n._dying&&!C.enemyKindOf(n)).length;
  ok(unknown===0,`every live enemy classifies to a kind (${unknown} unknown)`);
}

H('16 · ★★ KILLS LOG THEMSELVES FROM ONE HOOK');
{
  C.player.notebook=null;
  const before=C.notebookEntries('enemies').filter(x=>x.found).length;
  ok(before===0,'nothing encountered on a fresh save');
  const m=C.NPCS.find(n=>C.enemyKindOf(n)==='mori');
  C.notebookLogKill(m); C.notebookLogKill(m); C.notebookLogKill(m);
  const row=C.notebookEntries('enemies').find(x=>x.id==='enemy:mori');
  ok(row.found,'killing one files its type');
  ok(/3 defeated/.test(row.sub),`and counts them · "${row.sub.split(' · ')[0]}"`);
  ok(/abroad/.test(row.sub),'alongside how many are still out there');
  const other=C.notebookEntries('enemies').find(x=>x.id==='enemy:daemon');
  ok(!other.found,'a type you have not met stays unknown');
  // ★ ONE hook · every kill in the game routes through creditRizerKill
  const src=require('fs').readFileSync('/tmp/all.js','utf8');
  const i=src.indexOf('function creditRizerKill');
  ok(/notebookLogKill\(npc\)/.test(src.slice(i,i+400)),
     'the log hooks into creditRizerKill — one line, not eight kill sites');
}

H('17 · ★★ EACH PURCHASED HOME IS ITS OWN ROOM');
// Creator: "changing a purchased property room leaves your main rr the same
// decor. each purchased home is unique to itself."
{
  const src=require('fs').readFileSync('/tmp/all.js','utf8');
  const i=src.indexOf('function applyHomeLayout');
  const body=src.slice(i,i+1600);
  // the 2F must NOT read the global chair back out · that was the bleed
  ok(!/chair\.x = player\.chairX/.test(body),
     '★ the stock 2F no longer reads its chair from the global player.chairX');
  ok(/player\.chairX = RIZER_ROOM_ITEMS\.chair\.x/.test(body),
     'the global is written as a MIRROR of whichever room you are in');
  ok(/homeX/.test(body),'and the 2F falls back to the chair\'s own home tile like every other item');
}


H('18 · ★★ GEMLORD CAVES FOLDED INTO LANDMARKS');
// Creator: "remove gemlord caves panel, fold it into landmarks panel."
{
  ok(!C.NOTEBOOK_SECTIONS.some(S=>S.key==='caves'),'★ the CAVES section is gone from the nav');
  const lm=C.notebookEntries('landmarks');
  const caves=lm.filter(e=>/^cave:/.test(e.id));
  ok(caves.length===10,`★ all ten Gemlord caves now live in LANDMARKS (${caves.length})`);
  ok(caves.every(e=>/Gemlord sanctum/.test(e.sub)),'each labelled as a sanctum so they read as what they are');
  ok(lm.filter(e=>/^landmark:/.test(e.id)).length>=25,'alongside the lore buildings');
  // ★ the ids did NOT change — every existing seen/done record and scroll
  //   page-link survives the move
  const P=C.player; P.notebook=null;
  C.notebookVisit('cave:rakoron_cave');
  ok(C.notebookEntries('landmarks').find(e=>e.id==='cave:rakoron_cave').found,
     '★ an old cave: id still marks its entry found — no migration, no data loss');
  // the deriver survives for the systems that still read it (minimap · ecology)
  ok(C.notebookEntries('caves').length===10,'notebookEntries("caves") still answers for the minimap and ecology rank');
}

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
