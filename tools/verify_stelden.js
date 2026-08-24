const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};
global.setInterval=()=>0; global.setTimeout=()=>0; global.clearInterval=noop; global.clearTimeout=noop;
const CTX=new Proxy({},{get:()=>()=>({addColorStop:noop,width:0,height:0,data:[]})});
const el=()=>({style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},width:960,height:540,value:'',textContent:'',innerHTML:'',children:[],childNodes:[],getContext:()=>CTX,appendChild:noop,removeChild:noop,addEventListener:noop,removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,remove:noop,play:()=>Promise.resolve(),pause:noop,querySelector:()=>el(),querySelectorAll:()=>[],getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
global.addEventListener=noop; global.removeEventListener=noop;
global.document={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener:noop,body:el(),documentElement:el(),head:el(),hidden:false,visibilityState:'visible'};
global.window=global; global.localStorage={getItem:()=>null,setItem:noop,removeItem:noop};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,cloneNode(){return this}}};
global.Image=function(){return{addEventListener:noop,complete:false,naturalWidth:0,src:''}};
global.requestAnimationFrame=()=>0; global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0};
global.performance={now:()=>Date.now()};
global.getComputedStyle=()=>({getPropertyValue:()=>''});
try{new Function(src+';globalThis.__C={NPCS,player,contactEligible,registerContact,renderZycellRizer,walkable,districtAt:typeof districtAt!=="undefined"?districtAt:null,worldDistrictAt:typeof worldDistrictAt!=="undefined"?worldDistrictAt:null,_propBlocked,WORLD_PROPS,bumpNpcBond};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';

H('1 · ★ THE IRON WARDEN STANDS HIS POST');
{
  const n=C.NPCS.find(x=>x&&x.id==='stelden');
  ok(!!n,'Stelden lives in NPCS');
  ok(n.tileX===114&&n.tileY===291,'posted at (114,291) · the town-hall forecourt (post-recentre)');
  const d=(C.worldDistrictAt&&C.worldDistrictAt(114,291))||(C.districtAt&&C.districtAt(114,291));
  ok(String(d&&d.id||d)==='zarvane','…which is Zarvane');
  const hall=C.WORLD_PROPS.find(p=>p&&p.id==='zarvane_town_hall');
  // measured against where the hall LIVES (hub recentring moves it at boot),
  // not where its literal says — the first draft guarded empty desert
  ok(!!hall&&Math.abs(n.tileX-hall.tileX)<=6&&Math.abs(n.tileY-hall.tileY)<=6,`★ within the landmark's courtyard (hall LIVE at ${hall&&hall.tileX},${hall&&hall.tileY})`);
  // ★ SELF-OCCLUSION (fifth sighting): walkable() counts NPCs, and the sentry
  // now STANDING on his post would condemn his own tile.  Terrain + props only.
  ok(!C._propBlocked.has('114,291'),'his post tile is clear ground (props/terrain · he himself is not a wall)');
  ok(n.mode==='wander'&&n.wanderRadius===4,'★ he PATROLS · wander r4 · the courtyard and nothing beyond');
  ok(!n.isEnemy,'an ally, not a target');
  ok(fs.existsSync(ROOT+'assets/2D sprites/npcs/stelden.png'),'sheet on disk');
  const buf=fs.readFileSync(ROOT+'assets/2D sprites/npcs/stelden.png');
  ok(buf.readUInt32BE(16)===1254&&buf.readUInt32BE(20)===1254,'1254x1254 · 313 grid');
  ok(!n.rowMap,'sheet is in canon DOWN/LEFT/RIGHT/UP order · no rowMap needed');
  ok(n.uniformScale===true&&n.bboxes.length===4&&n.bboxes.every(r=>r.length===4),'4x4 measured table · uniform 2-tile scale (Mom/Dad baseline)');
  ok(n.bboxes[3][0][1]===-7,'UP row overflows its cell top by 7px — owned, not clipped');
}

H('2 · ★★ CONTACT IS EARNED, NOT MET');
{
  const n=C.NPCS.find(x=>x&&x.id==='stelden');
  C.player.kelthorStep={};
  ok(C.contactEligible(n)===false,'★ before Kelthor\'s ladder · NOT phone-book eligible');
  ok(C.registerContact(n)===false,'…and registerContact bounces');
  C.player.kelthorStep={s8:true};
  ok(C.contactEligible(n)===true,'★ ladder done · eligible');
  C.player.metNpcs={}; C.player.bonds={};
  ok(C.registerContact(n)===true,'…and registers');
  ok(!!C.player.metNpcs.stelden,'Stelden is in CONTACTS');
  // the bond beat · first talk after the ladder
  C.player.steldenBonded=false; C.player.bonds.stelden=0;
  n.onInteract(n);
  ok(C.player.steldenBonded===true,'★ first talk after the ladder BONDS');
  ok((C.player.bonds.stelden||0)===50,'bond lands at 50/100 · BONDED tier');
  const b=C.player.bonds.stelden;
  n.onInteract(n);
  ok(C.player.bonds.stelden===b,'second talk does not re-pay the bond');
  ok(/steldenBonded: !!player\.steldenBonded/.test(src),'★ the oath survives save/load');
  ok(/THROUGH Zarvane/.test(src)&&/Malezor sleeps because Zarvane watches/.test(src),'the lore is written: he protects MALEZOR, posted in Zarvane');
  // the gate is generic · one chokepoint
  ok(/_contactLocked === 'function' \? n\._contactLocked\(\)/.test(src),'★ _contactLocked lives in contactEligible — no registration path can leak him');
}

H('3 · ★ RIZER PANEL = PURE UPGRADE UI');
{
  C.player.kelthorStep={s8:true};
  let html='';
  try { html=C.renderZycellRizer(); } catch(e){ ok(false,'renderZycellRizer throws: '+e.message); }
  ok(!/EQUIPPED OUTFIT/.test(html),'★ the outfit card is gone from the render');
  ok(/ATTRIBUTES/.test(html),'…and the attribute allocator is all that remains');
  ok(!/Gear from Scrapjaw/.test(html),'the gear placeholder went with it');
  const fn=src.slice(src.indexOf('function renderZycellRizer'),src.indexOf('function renderZycellRizer')+1600);
  // code symbols only — the function's own comment legitimately NAMES the card it removed
  ok(!/skinName|RIZER_SKIN_ROSTER|ensureRizerSkinState/.test(fn),'no dead outfit code left in the function');
}

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
