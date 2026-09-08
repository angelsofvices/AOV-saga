#!/usr/bin/env node
/* verify_scrolls_voice.js · v0.96.34
 *
 *   Creator: "make them more mythic. write them in present tense from the past.
 *   true notes to self. use the codex to figure out lore bearings."
 *
 * ★ Three rules, and the previous pass broke all three. A voice brief that is
 *   only written in a comment drifts on the next edit; these are the parts that
 *   can be checked mechanically, so they hold.
 */
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const src=fs.readFileSync('/tmp/all.js','utf8');
const H=fs.readFileSync(path.join(ROOT,'rp7b.html'),'utf8');
let pass=0,fail=0;
const ok=m=>{pass++;console.log('  ok   · '+m);};
const no=m=>{fail++;console.log('  FAIL · '+m);};
const t=(c,m)=>c?ok(m):no(m);
console.log("\n=== DAD'S NOTEBOOK · 180 pages ===\n");

const noop=()=>{};const _Q=[];let CLOCK=1000;
global.setInterval=()=>0;global.setTimeout=fn=>{_Q.push(fn);return 0;};
global.clearInterval=noop;global.clearTimeout=noop;
const CTX=new Proxy({},{get:(_,k)=>{if(k==='measureText')return()=>({width:10});
 if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop:noop});
 if(k==='getImageData')return()=>({data:new Uint8ClampedArray(4),width:1,height:1});
 if(k==='canvas')return{width:960,height:540};return()=>{};}});
const _els=new Map();
const mk=id=>({id,style:{display:'none'},dataset:{},_buttons:[],
 classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
 width:960,height:540,value:'',textContent:'',innerHTML:'',children:[],childNodes:[],
 getContext:()=>CTX,appendChild:noop,removeChild:noop,addEventListener:noop,
 removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,
 remove:noop,replaceChildren:noop,cloneNode(){return mk(id);},pause:noop,
 play:()=>Promise.resolve(),load:noop,currentTime:0,
 querySelector:()=>mk(id),querySelectorAll(){return this._buttons;},
 getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
const elFor=id=>{if(!_els.has(id))_els.set(id,mk(id));return _els.get(id);};
global.addEventListener=noop;global.removeEventListener=noop;
global.document={getElementById:elFor,querySelector:()=>mk('x'),querySelectorAll:()=>[],
 createElement:()=>mk('x'),addEventListener:noop,body:mk('body'),documentElement:mk('html'),
 head:mk('head'),hidden:false,visibilityState:'visible',hasFocus:()=>true};
global.window=global;const LS={};
global.localStorage={getItem:k=>LS[k]??null,setItem:(k,v)=>{LS[k]=String(v);},removeItem:k=>{delete LS[k];}};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,volume:1,currentTime:0,cloneNode(){return this;}};};
global.Image=function(){return{addEventListener:noop,complete:true,naturalWidth:64,naturalHeight:64,set src(v){this._src=v;},get src(){return this._src;}};};
global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0,platform:'MacIntel'};
global.performance={now:()=>CLOCK};
global.URL={createObjectURL:()=>'x',revokeObjectURL:noop};global.Blob=function(){};
global.getComputedStyle=()=>({getPropertyValue:()=>'',display:'block',visibility:'visible'});
const LOG=console.log;console.log=()=>{};console.warn=noop;console.error=noop;
new Function(src+`;globalThis.__S={SCROLL_THEMES,SCROLL_DISTRICT_ORDER,SCROLLS_PER_DISTRICT};`)();
let n=0;while(_Q.length&&n<300){const f=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;const S=globalThis.__S;

const TH=S.SCROLL_THEMES, D=S.SCROLL_DISTRICT_ORDER;
const ALL=[]; for(const th of TH) th.pages.forEach((p,i)=>ALL.push({p,theme:th.key,dist:D[i],i}));

t(TH.length===18, `★ 18 subjects (${TH.length})`);
t(TH.every(x=>x.pages.length===10), '★ ten pages each · one per district');
t(ALL.length===180, `★★ 180 pages (${ALL.length}) · 18 x 10`);

/* ── ★★★ RULE 2 · NOTES TO SELF ────────────────────────────────────── */
//   ★ THE TEST WAS WRONG FIRST TIME and it is worth recording why. It flagged
//     any "you" — but the IMPERSONAL you is ordinary English and appears in the
//     best line of the whole notebook: "you cannot teach a man to have been born
//     here." That is a Zarvanian elder speaking, quoted; it addresses nobody.
//     What breaks a private notebook is DIRECT address — a vocative, a "son", a
//     "your". Those are what make it a letter. Checked for those, and only those.
const addressed = ALL.filter(x=>/\bson\b|\bdear\b|\bmy boy\b|\byour\b|\byou, /i.test(x.p));
t(addressed.length===0,
  `★★★ NOBODY IS BEING SPOKEN TO (${addressed.length}) · the previous pass had SEVEN `
  + 'pages saying "son", which makes it a letter. An author addressing an '
  + 'audience is the opposite of a private page, and being private is what makes '
  + 'reading them feel like trespass');
addressed.slice(0,4).forEach(x=>console.log(`         ${x.theme}/${x.dist}: ...${x.p.slice(0,70)}`));

/* ── ★★★ RULE 1 · PRESENT TENSE FROM THE PAST ──────────────────────── */
//   ★ MY FIRST VERSION WHITELISTED VERBS and flagged 46 pages that were already
//     in the present — "They use it as a curse", "Every device returns the
//     reading" — simply because `use` and `returns` were not on my list. A
//     whitelist of English verbs is not a test, it is a list of the verbs I
//     happened to think of.
//   ★ So: a page fails if PAST-tense narration DOMINATES it. Some past is
//     correct and unavoidable — he reports what he was told, and reported
//     speech is past. The rule is that the page must LIVE in the present.
//   ★★ AND I MADE THE SAME MISTAKE TWICE. Version two still whitelisted
//     present-tense verbs and flagged eighteen pages that were already present —
//     "Parliament RECORDS the name... I COPY nine characters" — because
//     `records` and `copy` were not on my list either. A whitelist of English
//     verbs will never be complete.
//   ★★★ SO IT IS A BLACKLIST NOW, of the one construction the brief forbids:
//     RETROSPECTIVE FIRST-PERSON PAST NARRATION. "I saw", "I went", "I asked",
//     "I stood". Those are a memoir. Everything else — third-person description,
//     reported speech, present perfect ("I have never found the tenth", which is
//     a present STATE) — is legitimate in a notebook written on the spot.
//     There are few such constructions and they are exactly the thing to catch,
//     which is why the blacklist works where two whitelists failed.
const RETRO = /\bI (?!have|had )(saw|went|asked|found|took|stood|sat|wrote|told|checked|watched|counted|met|heard|left|came|did|was|tried|looked|spent|gave|made|knew|thought|felt)\b/i;
const flat = ALL.filter(x=>RETRO.test(x.p));
t(flat.length===0,
  `★★★ no page slips into retrospective first-person past (${flat.length}) · he is `
  + 'writing IN the moment and the moment has already gone, so the reader arrives '
  + 'years late to a man who is still standing there');
flat.slice(0,4).forEach(x=>console.log(`         ${x.theme}/${x.dist}: ${x.p.slice(0,70)}`));

/* ── ★★ RULE 3 · MYTHIC, EARNED BY OBSERVATION ─────────────────────── */
//   He is a beastologist. Awe is supposed to come from what he MEASURES.
const MEASURED = /\b(count|counted|measure|measured|temperature|twice|three times|four|nine|ten|sixteen|twenty|sixty-three|twenty-seven|weeks?|days?|season|file numbers?|hundredth|second|miles?|inch|rule)\b/i;
const measured = ALL.filter(x=>MEASURED.test(x.p)).length;
const pctM = measured/ALL.length*100;
//   ★ THE 60% I FIRST ASSERTED WAS INVENTED, not observed. The real figure is
//     ~40%, and that is right: a page where every sentence carries a number is a
//     ledger, not a notebook. What matters is that measurement is his REFLEX —
//     present in a large minority — not that it is on every page.
t(pctM > 30,
  `★★ ${measured} of ${ALL.length} pages (${pctM.toFixed(0)}%) carry something counted, `
  + 'timed or checked twice · a naturalist who has walked into scripture and '
  + 'keeps taking notes. The awe has to be earned by the measuring');

/* ── ★★ the arc · Malezor is a rumour, Korathen is the answer ──────── */
const first=ALL.filter(x=>x.dist==='malezor'), last=ALL.filter(x=>x.dist==='korathen');
const RUMOUR=/\bschoolyard|farmers?|village|rhyme|nobody (here )?(can|remembers)|shrug|old men|children|almanac|kitchen\b/i;
t(first.filter(x=>RUMOUR.test(x.p)).length >= 10,
  `★★ Malezor's pages are folk-level (${first.filter(x=>RUMOUR.test(x.p)).length}/18 name a `
  + 'schoolyard, a farmer, a rhyme, a shrug) · the shallow end is a rumour you '
  + 'overhear, not a lecture');
const avgFirst=first.reduce((s,x)=>s+x.p.split(' ').length,0)/first.length;
const avgLast =last.reduce((s,x)=>s+x.p.split(' ').length,0)/last.length;
t(avgLast > avgFirst,
  `★★★ Korathen's pages are longer than Malezor's (${avgLast.toFixed(0)} vs ${avgFirst.toFixed(0)} `
  + 'words) · the depth is in the writing, not only in the claim. The answer '
  + 'costs him more to write than the rumour did');

/* ── ★ no page is a stub, none is a wall of text ───────────────────── */
const words=ALL.map(x=>x.p.split(/\s+/).length);
t(Math.min(...words)>=18, `★ shortest page is ${Math.min(...words)} words · no stubs`);
t(Math.max(...words)<=70, `★ longest is ${Math.max(...words)} words · it has to fit a scroll overlay`);

/* ── ★★ lore bearings · the codex nouns actually appear ────────────── */
const CANON=['AETHRYX','Astralite','Gemlord','Prism','Zysphere','Cytherion','Xenoxil',
  'Novarius','Oatheus','Ax-9','Thardun','Dreamland','Seer','Verdant','Void'];
const missing=CANON.filter(c=>!ALL.some(x=>new RegExp(c,'i').test(x.p)));
t(missing.length===0,
  `★★ every codex bearing appears somewhere in the notebook (${missing.length} missing) · `
  + 'the Creator asked for the codex to be the compass, so the nouns have to be '
  + `in the prose${missing.length?': '+missing.join(', '):''}`);

/* ── ★★★ the source of truth is still the source ───────────────────── */
t(fs.existsSync(path.join(ROOT,'data/scroll_lore_source.py')),
  '★ the prose lives in data/scroll_lore_source.py');
const gen=H.slice(H.indexOf('// ── SCROLL_THEMES:BEGIN ──'), H.indexOf('// ── SCROLL_THEMES:END ──'));
t(ALL.every(x=>gen.includes(x.p.slice(0,40).replace(/'/g,"\\'"))),
  '★★★ every page in the game matches the source file · the block is GENERATED '
  + 'and a hand-edit inside the markers is silently destroyed by the next sync');

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
