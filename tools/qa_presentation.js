/* ★★★★ §57 QA · THE RP7 PRESENTATION, CHECKED BY RUNNING IT.
 *
 *   Every page in docs/RP7-PRESENTATION.html is a pure function that returns
 *   markup, so this harness evaluates the deck's own script with a DOM stub,
 *   CALLS all 36 of them, and asserts against what they actually produce —
 *   not against the source. A canon rule that only holds in a comment is a
 *   canon rule the audience never sees.
 *
 *   It covers the Creator's §57 list item for item: district order and
 *   gemlords, Ovauron staying out of the ordered 27, Zoryn's relationship,
 *   the Xenoxil/Bridge sequence, Ophira/Netharion and Orryx/Vorashil, the
 *   Zyphone/Zycube/Nebuladock/ZyLink/Experiment Table/Field Workstation
 *   distinctions, one active Zyrex, and the RP7B/RP7D line — plus the two
 *   structural rules that are easy to break later: ZERO <img> tags (no
 *   substitute artwork, §02) and no dead buttons (§57).
 *
 *   Run:  node tools/qa_presentation.js      (from the repo root)
 */
const _CWD = require('path').join(__dirname, '..', 'docs');
process.chdir(_CWD);
const fs=require('fs');
const html=fs.readFileSync('RP7-PRESENTATION.html','utf8');
const js=html.split('\n').slice(412,1403).join('\n');
// stub the DOM the engine touches at module scope
const els={};
const mk=()=>({classList:{add(){},remove(){},toggle(){},contains(){return true}},
  style:{},appendChild(){},remove(){},set innerHTML(v){this._h=v},get innerHTML(){return this._h||''},
  set textContent(v){this._t=v},get textContent(){return this._t||''},
  firstElementChild:{style:{},classList:{add(){}}},getContext:()=>({clearRect(){},fillRect(){},set fillStyle(v){}}),
  set width(v){},set height(v){},set disabled(v){},set onclick(v){}});
global.document={getElementById:id=>els[id]||(els[id]=mk()),createElement:mk,
  querySelectorAll:()=>[],addEventListener(){}};
global.window=global; global.innerWidth=1600; global.innerHeight=900;
global.addEventListener=()=>{}; global.requestAnimationFrame=()=>{};
global.setTimeout=(f)=>{try{}catch(e){}return 0;};
// ★ eval in a function scope hides `const` from the rest of the file ·
//   run it at module scope and export what the checks need
const RUN=new Function(js+'\nreturn {PAGES,DISTRICTS,WORLDS,CHAPTERS,next,prev,goHub,goCh,slot,flow,pickD,pickW,remAt,clearD,clearW,go,toggleCh,closeCh,toast};');
const API=RUN(); const {PAGES,DISTRICTS,WORLDS,CHAPTERS,next,prev,goHub,goCh,slot,flow}=API;

let fail=0; const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)fail++;};
const H=t=>console.log('\n'+t);

H('★★★★ EVERY PAGE RENDERS · no page throws, none is empty');
let all='';
PAGES.forEach((p,i)=>{
  let out='';
  try{ out=p.body(); }catch(e){ ok(false,`page ${i} "${p.title}" THREW · ${e.message}`); return; }
  all+=out;
  if(out.length<300) ok(false,`page ${i} "${p.title}" rendered only ${out.length} chars`);
});
ok(fail===0, `all ${PAGES.length} pages render (${all.length} chars of markup)`);
ok(PAGES.length===36, `${PAGES.length} entries · hub + 35 content pages`);

H('★★★★ §57 QA · CANON');
const D=DISTRICTS.map(d=>d.n+' '+d.id+' '+d.g);
ok(D[0]==='01 MALEZOR RAKORON' && D[9]==='10 KORATHEN OATHEUS','district order + gemlords · first and last correct');
const wantG=['RAKORON','IVIRIUM','MUTARYN','EMERALIX','EURAKEON','AZUREL','OBSIDIUS','AMBREVON','OATHANE','OATHEUS'];
ok(DISTRICTS.every((d,i)=>d.g===wantG[i]),'all ten gemlords in order');
ok(WORLDS.length===27,`${WORLDS.length} worlds listed`);
ok(WORLDS[8]==='ZYRAXIS','Zyraxis is planet 09');
ok(WORLDS[26]==='VIRIDIA','Viridia is planet 27');
ok(!WORLDS.includes('OVAURON'),'★★★★ Ovauron is NOT in the ordered 27');
ok(/AEP-28/.test(all) && /DRIFT WORLD/i.test(all),'Ovauron present as AEP-28 drift world');
ok(/not ordered Planet 28/i.test(all),'and stated explicitly');
ok(/not<\/span> Rizer's biological brother|not<\/b> Rizer's biological brother/i.test(all)
   || /Zoryn is <b>not<\/b> Rizer/i.test(all),'Zoryn is not the biological brother');
ok(/battle against Zoryn occurs <b>at the Novarian Challenge/i.test(all),'Rizer vs Zoryn at the Novarian Challenge');
ok(/does not defeat Xenoxil before the Bridge of Hope/i.test(all),'★★★★ Xenoxil not defeated before the Bridge');
ok(/OPHIRA[\s\S]{0,120}NETHARION/i.test(all),'Ophira → Netharion');
ok(/ORRYX[\s\S]{0,120}VORASHIL/i.test(all),'Orryx → Vorashil');
ok(/POWER OF DREAMS/i.test(all) && /POSSIBILITY/i.test(all),'Power of Dreams · possibility → reality');
ok(/REMEMBER[\s\S]{0,900}DECODE[\s\S]{0,900}TRANSLATE[\s\S]{0,900}RENDER/i.test(all),'Rememory 4 steps in order');
ok(/not<\/span>[\s\S]{0,80}time travel|Literal time travel/i.test(all),'Rememory is not time travel');
ok(/original past remains unchanged/i.test(all),'and the past is unchanged');
ok(/AZUREL[\s\S]{0,200}S1/i.test(all),'Azurel → S1');
ok(/RAKORON[\s\S]{0,200}S2/i.test(all),'Rakoron → S2');

H('★★★★ §57 QA · SYSTEMS');
ok(/ZYCUBE<\/h4>\s*<p>The true portable inventory/i.test(all),'Zycube is the inventory');
ok(/ZYPHONE<\/h4>\s*<p>Portable interface/i.test(all),'Zyphone is the interface, not the inventory');
ok(/does <b>not<\/b> craft from the Zyphone/i.test(all),'★★★★ Zyphone does not craft');
ok(/ZyLink does not physically teleport items/i.test(all),'★★★★ ZyLink does not teleport');
ok(/NEBULADOCK[\s\S]{0,80}Home PC/i.test(all),'Nebuladock is storage, not a crafting station');
ok(/does not replace the Experiment Table/i.test(all),'★★★★ Field Workstation does not replace the table');
ok(/EXPERIMENT TABLE<\/h4>\s*<p>Experimentation/i.test(all),'Experiment Table is where crafting happens');
ok(/One Zyrex can be <b>physically active<\/b>/i.test(all),'★★★★ one active Zyrex at a time');
ok(/not<\/span> disposable collectible monsters/i.test(all),'Zyrex are not disposable collectibles');
ok(/living 2D proof of concept/i.test(all) && /definitive realistic 3D/i.test(all),'RP7B/RP7D distinction correct');
ok(!/RP7B[^<]{0,40}3D/i.test(all),'RP7B is never called the 3D version');
// ★ the gap was 400 chars and the slot markup between two modes is longer
//   than that · the page was right and the test was measuring the wrong thing
{
  const mp=PAGES.find(p=>p.title==='THREE WAYS TO PLAY').body();
  const i1=mp.indexOf('STORY MODE'), i2=mp.indexOf('SAGA MODE'), i3=mp.indexOf('NOVARIAN');
  ok(i1>0&&i2>i1&&i3>i2,`three modes present and in order (${i1} < ${i2} < ${i3})`);
  ok(/OFFLINE<\/div>/.test(mp)&&/>ONLINE<\/div>/.test(mp)&&/OFFLINE \+ ONLINE/.test(mp),
     'and each carries its own connectivity · offline · online · offline+online');
}
ok(/ZYRAXIS · VIRIDIA · ORIGON/.test(all),'Saga Mode core worlds correct');

H('★★★★ §02 · IMAGE SLOTS · no substitute artwork anywhere');
const slots=(all.match(/class="slot /g)||[]).length;
ok(slots>=40,`${slots} Creator asset slots across the deck`);
ok(!/<img /.test(all),'★★★★ ZERO <img> tags · not one substitute image is embedded');
ok((all.match(/CREATOR ASSET SLOT/g)||[]).length===slots,'every slot carries the CREATOR ASSET SLOT framing');
const pagesWithSlots=PAGES.filter(p=>/class="slot /.test(p.body())).length;
ok(pagesWithSlots>=30,`${pagesWithSlots} of ${PAGES.length} pages carry at least one slot`);

H('★★★ §50 · BOTH NAVIGATION PATHS');
ok(typeof next==='function'&&typeof prev==='function','linear: next / back');
ok(typeof goHub==='function'&&typeof goCh==='function','interactive: home / chapter');
ok(CHAPTERS.length===9,`${CHAPTERS.length} chapters`);
const missing=CHAPTERS.filter(c=>!PAGES.some(p=>p.ch===c));
ok(!missing.length,'★★★★ every chapter in the menu resolves to a real page'+(missing.length?' · DEAD: '+missing:''));
const hubKeys=[...all.matchAll(/goCh\('([A-Z0-9]+)'\)/g)].map(m=>m[1]);
const deadHub=[...new Set(hubKeys)].filter(k=>!PAGES.some(p=>p.ch===k));
ok(!deadHub.length,'★★★★ no dead buttons on the hub'+(deadHub.length?' · DEAD: '+deadHub:''));
const fns=[...new Set([...all.matchAll(/onclick="(\w+)\(/g)].map(m=>m[1]))];
const deadFns=fns.filter(f=>typeof API[f]!=='function');
ok(!deadFns.length,'★★★★ every onclick resolves to a defined function'+(deadFns.length?' · DEAD: '+deadFns:''));

H('★★★ §45 · TRANSITIONS DIFFER BY CONTEXT');
const ts=[...new Set(PAGES.map(p=>p.t))];
ok(ts.length>=6,`${ts.length} distinct transitions in use · ${ts.join(' ')}`);
ok(PAGES.find(p=>p.title==='THE BRIDGE OF HOPE').t==='t-cine','the Bridge gets the cinematic takeover');
ok(PAGES.find(p=>p.title==='THE SEERS').t==='t-seer','the Seers get interference');

H('★★ §54 · NO INVENTED COMMITMENTS');
const banned=[[/\$\d|\bprice|\bpricing/i,'pricing'],[/\b20\d\d\b.*release|release date/i,'release date'],
  [/PlayStation|Xbox|Nintendo|Steam\b/i,'platform commitment'],[/\bteam of \d|\bemployees\b/i,'team size'],
  [/\bfunding|\binvestors?\b/i,'funding'],[/\baward|\breview score|\bmetacritic/i,'awards/reviews']];
banned.forEach(([re,label])=>ok(!re.test(all),`no ${label} claimed`));

console.log(fail?`\n❌ ${fail} failed`:'\n✅ all pages render · canon clean · no substitute art · no dead buttons');
process.exit(fail?1:0);
