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
try{new Function(src+';globalThis.__C={zyrexUid,zyrexFollowerId,ZYREX_HOME_ANCHOR,zyrexHomeTile,sendZyrexWalkingHome,toggleFactionSummon,NPCS,player,game,_propBlocked,SUMMON_FORMATION,WORLD_PROPS};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
global.showToast=noop; global.showDialog=noop;

H('1 · ★ HOME IS THE TREEHOUSE YARD');
{
  ok(C.ZYREX_HOME_ANCHOR.x===20&&C.ZYREX_HOME_ANCHOR.y===-14,'anchor (20,-14) · six tiles south of the treehouse (20,-20)');
  const th=C.WORLD_PROPS.find(p=>p&&p.id==='rizer_treehouse');
  ok(!!th&&Math.abs(C.ZYREX_HOME_ANCHOR.x-th.tileX)<=2&&Math.abs(C.ZYREX_HOME_ANCHOR.y-th.tileY)<=8,'…verified against the live treehouse prop');
  const tiles=[0,1,2,3].map(i=>C.zyrexHomeTile(i));
  ok(tiles.every(([x,y])=>!C._propBlocked.has(x+','+y)),'first four home tiles are clear ground');
  let pair=true;
  for(let i=0;i<4;i++)for(let j=i+1;j<4;j++) if(Math.max(Math.abs(tiles[i][0]-tiles[j][0]),Math.abs(tiles[i][1]-tiles[j][1]))<2) pair=false;
  ok(pair,'★ the yard inherits the formation spacing law · no two homes closer than 2');
}

H('2 · ★★ L2+TOUCHPAD ON A COMPANION = THE LONG GOODBYE');
{
  // ★ v0.95.834 · Creator correction: the chord is L2+TOUCHPAD, not L2+Square
  const at=src.indexOf('L2+TOUCHPAD ON A FACED COMPANION = SEND HOME');
  ok(at>0,'the chord branch exists on the L2+touchpad chord');
  ok(src.slice(at,at+1100).includes('sendZyrexWalkingHome')&&src.slice(at,at+1100).includes('toggleDevPanel'),'★ faced companion outranks the dev panel · empty-handed the dev hotkey is untouched');
  const sq=src.indexOf("L2 square is astralblast");
  ok(sq>0&&!/sendZyrexWalkingHome/.test(src.slice(src.indexOf("if (k === 'j' && keys['shift'])"),src.indexOf("if (k === 'j' && keys['shift'])")+1400)),'★ L2+Square is purely Astralstrike again');
  // behavioral · summon, send home, watch the state
  C.player.party=[{speciesId:'snok',level:10,hp:9,name:'Snok'}];
  C.game.scene='overworld'; C.player.x=200; C.player.y=200;
  C.toggleFactionSummon(0);
  const fol=C.NPCS.find(n=>n&&n._summoned&&n._summonSpeciesId==='snok')   // ★ v0.95.863 · followers are keyed per-INDIVIDUAL now (uid), not per-species;
  ok(fol&&fol._summoned===true,'deployed to the field');
  ok(fol.homeX!==undefined&&Math.abs(fol.homeX-20)<=8&&Math.abs(fol.homeY-(-14))<=8,'★ his default home is the yard, set at creation');
  const sent=C.sendZyrexWalkingHome(fol);
  ok(sent===true,'send-home accepts him');
  ok(fol._summoned===false&&fol._formSlot===null,'he leaves the field formation');
  ok(fol.mode==='walkHome'&&fol._walkHomeTarget&&fol._walkHomeTarget.x===fol.homeX,'★ he WALKS — walkHome mode aimed at his yard tile');
  ok(fol._walkHomeBailMs===180000,'the journey gets 3 minutes before the bail-out snap (default 20s is for errands)');
  // ★ v0.95.837 · the goodbye RELEASES: party → PC storage
  ok(!(C.player.party||[]).some(z=>z&&z.speciesId==='snok'),'★ he is OUT OF THE PARTY the moment he walks');
  ok((C.player.pcZyrex||[]).some(z=>z&&z.speciesId==='snok'),'…and safe in PC storage — released, never deleted');
  // bringing him back = re-add to party, then the phone summons as usual
  C.player.party.push(C.player.pcZyrex.pop());
  C.toggleFactionSummon(0);
  ok(fol._summoned===true&&fol.mode==='follow'&&!fol._walkHomeTarget,'★ re-partied + phone Triangle re-summons him even mid-walk');
}

H('3 · ★ THE TWO VERBS STAY DISTINCT');
{
  ok(/the chord is\s*\n?\s*\/\/\s*the long goodbye/.test(src)||/the long goodbye/.test(src),'the doctrine is written at the chord');
  ok(/_walkHomeBailMs \|\| 20000/.test(src),'the bail-out override is per-NPC · Yara\'s errands keep their 20s');
}

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
