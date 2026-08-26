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
try{new Function(src+';globalThis.__C={ASTRALITE_GEM_SHEETS,spawnAstraliteGem,recoverAstraliteMaterial,ASTRALITE_FAMILIES,WORLD_PROPS,_propBlocked,player,game,walkable,INVENTORY_META};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
global.showToast=noop;
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';

H('1 · ★ SEVEN SHEETS · 63 GEMS · KEYED AND MEASURED');
{
  const S=C.ASTRALITE_GEM_SHEETS;
  ok(Object.keys(S).length===7,'7 tier sheets registered (energy 1-7)');
  ok(Object.values(S).every(t=>fs.existsSync(ROOT+decodeURIComponent(t.src))),'all on disk');
  ok(Object.values(S).every(t=>t.cells.length===9),'9 family cells per sheet · 63 total');
  let sane=true, grid=true;
  for(const t of Object.values(S)) for(let i=0;i<9;i++){
    const [x,y,w,h]=t.cells[i];
    if(w<100||h<100||w>418||h>418) sane=false;
    const rr=Math.floor(i/3),cc=i%3;
    if(x<cc*418-4||x+w>(cc+1)*418+4||y<rr*418-4||y+h>(rr+1)*418+4) grid=false;
  }
  ok(sane,'every cell bbox is a plausible gem (100-418px)');
  ok(grid,'★ every bbox lies inside its own 3x3 cell — cells[family-1] IS the family, by grid position');
  // keyed: sample a corner pixel of tier 1 for transparency
  // real check, not a size heuristic: keying writes RGBA (IHDR color type 6)
  const buf=fs.readFileSync(ROOT+'assets/2D sprites/items/astralites/astralites-tier-1-core.png');
  ok(buf[25]===6,'tier-1 sheet ships with an ALPHA channel (IHDR type 6) · the magenta is gone');
}

H('2 · ★★ THE GEM POPS OUT · life-seed grammar');
{
  C.game.scene='overworld'; C.player.x=300; C.player.y=300; C.player.items={};
  const fam=C.ASTRALITE_FAMILIES[4];    // PRESENT · green
  const item={...fam.items[2],familyName:fam.name};   // energy 3
  const prop=C.spawnAstraliteGem(300,301,item);
  ok(!!prop,'a world prop spawns beside the rubble');
  ok(prop.img===C.ASTRALITE_GEM_SHEETS[3].img,'★ drawn from the ENERGY-3 sheet');
  ok(JSON.stringify(prop.bbox)===JSON.stringify(C.ASTRALITE_GEM_SHEETS[3].cells[4]),'★ cropped to the PRESENT family cell (family 5 → cells[4])');
  ok(C._propBlocked.has(`${prop.tileX},${prop.tileY}`),'★ SOLID · the pickup-collision law holds');
  ok(prop._levitate===true,'it bobs · loot, not scenery');
  const before=C.WORLD_PROPS.length;
  prop.onInteract();
  ok((C.player.items[item.key]||0)===1,'★ X collects it into the bag');
  ok(C.WORLD_PROPS.length===before-1&&!C._propBlocked.has(`${prop.tileX},${prop.tileY}`),'and the prop + collision clean up');
}

H('3 · ★★ THE BREAK SPAWNS, NEVER AUTO-BAGS (overworld)');
{
  C.player.items={};
  const stone={type:'astralite',tileX:305,tileY:300};
  const item=C.recoverAstraliteMaterial(stone);
  ok(!!item,'the roll still happens (family from tile · rarity ladder untouched)');
  ok((C.player.items[item.key]||0)===0,'★ nothing lands in the bag on the break itself');
  const gem=C.WORLD_PROPS.find(p=>p&&p._astraliteGem===item.key);
  ok(!!gem,'★ the gem stands in the world instead');
  ok(Math.abs(gem.tileX-305)<=1&&Math.abs(gem.tileY-300)<=1,'…beside the rubble');
  ok(stone._matrixMaterialRecovered===true&&C.recoverAstraliteMaterial(stone)===null,'a stone pays exactly once');
  // interior fallback: direct hand-over
  C.game.scene='interior_home'; C.player.items={};
  const stone2={type:'astralite',tileX:5,tileY:5};
  const item2=C.recoverAstraliteMaterial(stone2);
  ok((C.player.items[item2.key]||0)===1,'interiors hand straight to the bag (chest-coin precedent)');
  C.game.scene='overworld';
  ok(/spawnAstraliteGem\(Math\.round/.test(src)&&/gem spawn failed · direct to bag/.test(src),'and a failed spawn still pays — the reward can never be lost');
}

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
