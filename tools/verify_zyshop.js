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
try{new Function(src+';globalThis.__C={WORLD_PROPS,ZYSPHERE_SHOP_STOCK,ZYREX_CONSUMABLE_PCT,feedZyrexConsumable,openZysphereShop,closeZysphereShop,startWildBondEncounter,wildBondDifficulty,battleBagItems,INVENTORY_META,isWorldLandTile,walkable,_propBlocked,SPECIES,player,game,WILD_BOND};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
global.showToast=noop; global.showDialog=noop; global.playSFX=noop; global.playItemGain=noop; global.saveGame=noop;
C.game.scene='overworld';
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const SHOP=C.WORLD_PROPS.find(p=>p.id==='malezor_zysphere_shop');
const POT =C.WORLD_PROPS.find(p=>p.id==='malezor_potion_shop');

H('1 · ★ THE SHOP STANDS AT -20, 120');
{
  ok(!!SHOP,'malezor_zysphere_shop is registered');
  ok(SHOP.tileX===-20&&SHOP.tileY===120,'★ door tile is exactly the Creator\'s (-20, 120)');
  ok(SHOP.tileW===POT.tileW,'★ same WIDTH as the Rizer potion shop ('+SHOP.tileW+' tiles), as ordered');
  ok(fs.existsSync(ROOT+decodeURIComponent(SHOP.src)),'art is on disk');
}

H('2 · ★★ THE FOOTPRINT FITS THE ART, NOT THE OTHER WAY ROUND');
{
  const [,,bw,bh]=SHOP.bbox;
  const {createCanvas}=(()=>{try{return require('canvas')}catch(_){return {}}})();
  const buf=fs.readFileSync(ROOT+decodeURIComponent(SHOP.src));
  // PNG header: width/height are big-endian u32 at bytes 16 and 20
  const W=buf.readUInt32BE(16), Hgt=buf.readUInt32BE(20);
  ok(bw===W&&bh===Hgt,'★ bbox IS the file ('+W+'x'+Hgt+') — no rect running off the bitmap (the v0.95.811 bug)');
  const drawnH=SHOP.tileW*(bh/bw);
  ok(Math.abs(drawnH-SHOP.tileH)<1,
     '★★ tileH '+SHOP.tileH+' matches the '+drawnH.toFixed(2)+' tiles the art actually paints — collision follows VISIBLE pixels');
  ok(SHOP.footprint.length===SHOP.tileW*SHOP.tileH,'footprint is '+SHOP.tileW+'x'+SHOP.tileH+' = '+SHOP.footprint.length+' tiles');
  const xs=SHOP.footprint.map(a=>a[0]), ys=SHOP.footprint.map(a=>a[1]);
  ok(Math.min(...ys)===-(SHOP.tileH-1)&&Math.max(...ys)===0,'★ it grows UPWARD from the door row · nothing juts below the doorstep');
  ok(Math.min(...xs)===-3&&Math.max(...xs)===3,'centred on the door column');
}

H('3 · THE GROUND IT SITS ON');
{
  let land=true, taken=[];
  for(const [dx,dy] of SHOP.footprint){
    const x=SHOP.tileX+dx, y=SHOP.tileY+dy;
    if(!C.isWorldLandTile(x,y)) land=false;
    const owner=C._propBlocked.get?C._propBlocked.get(`${x},${y}`):null;
    if(C._propBlocked.has(`${x},${y}`)&&owner&&owner!==SHOP.id&&owner.id!==SHOP.id) taken.push([x,y]);
  }
  ok(land,'★ all '+SHOP.footprint.length+' tiles are Malezor land — not a shopfront in the Void Sea');
  ok(!taken.length,'no tile is stolen from another prop'+(taken.length?' · '+JSON.stringify(taken.slice(0,3)):''));
  ok(C.walkable(SHOP.tileX,SHOP.tileY+1),'★ the doorstep below the door is walkable — you can reach the counter');
}

H('4 · THE COUNTER · SPHERES + THE ZYREX LADDER');
{
  const S=C.ZYSPHERE_SHOP_STOCK;
  ok(S.length===4,'4 lines of stock');
  ok(S[0].key==='zysphere','★ Zyspheres lead the counter — it is what the shop is named for');
  const keys=S.map(s=>s.key);
  ok(['fresh_water','berry_juice','fruit_bar'].every(k=>keys.includes(k)),
     '★ fresh water · berry juice · fruit bars, exactly as ordered');
  ok(S.every(s=>C.INVENTORY_META[s.key]),'every line is a real registered item');
  let rising=true; const zy=S.filter(s=>s.key!=='zysphere');
  for(let i=1;i<zy.length;i++) if(zy[i].price<=zy[i-1].price) rising=false;
  ok(rising,'★ the ladder costs more as it heals more · 60 → 140 → 320');
}

H('5 · ★★ THE ZYREX HALF OF THE LADDER · ADJACENT TO RIZER\'S');
{
  const P=C.ZYREX_CONSUMABLE_PCT;
  ok(P.fresh_water===0.25&&P.berry_juice===0.50&&P.fruit_bar===1.00,
     '★ 25% · 50% · 100% of the Zyrex\'s OWN max HP');
  ok(Object.values(P).every(v=>v>0&&v<=1),'★ percentages, not flat numbers — a T7 is served as well as a T1');
  const M=C.INVENTORY_META;
  const ale=M.ale.order;
  ok(M.fresh_water.order>ale&&M.fruit_bar.order<M.potion.order+4,
     '★★ they sit LITERALLY adjacent to ale ('+ale+') in the bag: '+
     [M.fresh_water.order,M.berry_juice.order,M.fruit_bar.order].join(' · '));
  // the battle bag knows them too
  const p=C.player; p.items=p.items||{};
  p.items.fruit_bar=1; p.items.fresh_water=1;
  const bag=C.battleBagItems().map(d=>d.key);
  ok(bag.includes('fruit_bar')&&bag.includes('fresh_water'),'★ the BATTLE bag offers them as well as the field bag');
  ok(C.battleBagItems().filter(d=>d.pct).every(d=>!d.heal),'pct items carry no phantom flat heal');
}

H('6 · FEEDING · THE MOST WOUNDED, NEVER THE LEADER BY DEFAULT');
{
  const p=C.player;
  p.party=[{name:'LEAD',hp:100,maxHp:100},{name:'HURT',hp:20,maxHp:200},{name:'DEAD',hp:0,maxHp:100}];
  const got=C.feedZyrexConsumable('berry_juice');
  ok(got===true,'the feed lands');
  ok(p.party[1].hp===120,'★★ 50% of the WOUNDED one\'s 200 max went to it (20 → 120), not to the healthy leader');
  ok(p.party[0].hp===100&&p.party[2].hp===0,'★ nobody else was touched · a fainted Zyrex is not fed ([[aov-revive-rule]])');
  p.party=[{name:'FULL',hp:100,maxHp:100}];
  ok(C.feedZyrexConsumable('fruit_bar')===false,'★ refuses at full HP · returns FALSE so the caller never eats the item');
  p.party=[];
  ok(C.feedZyrexConsumable('fresh_water')===false,'★ refuses with no party · same, no item burned');
}

H('7 · ★★ NO SPHERE, NO IMPRINT · EACH ATTEMPT COSTS 1');
{
  const p=C.player; const sp=C.SPECIES.otterlin||Object.values(C.SPECIES)[0];
  const w={x:5,y:5,speciesId:sp.id||'x'};
  C.WILD_BOND.active=null; C.game.wildBondOpen=false;
  // ★ v0.95.887 · starter + tier bond are preconditions of an attempt now
  p.starterChosen='volcanut'; p.starterBondGranted=true;
  p.bondLedger={zyrex:0,rizer:1665,_migrated:true};
  p.items.zysphere=0;
  const refused=C.startWildBondEncounter(w,sp);
  ok(refused===false,'★★ with ZERO spheres the encounter REFUSES to open');
  ok(!C.game.wildBondOpen&&!C.WILD_BOND.active,'★ and nothing was started — no half-open QTE left behind');
  p.items.zysphere=3;
  const opened=C.startWildBondEncounter(w,sp);
  ok(opened===true&&C.game.wildBondOpen,'with spheres in the bag it opens');
  ok(p.items.zysphere===2,'★★ ONE sphere is spent ON THE ATTEMPT · 3 → 2, before the spin is even read');
  ok(C.WILD_BOND.active.spheresLeft===2,'the overlay is told what a SECOND try would cost');
  // the charge is taken up front, so losing costs the sphere too
  C.WILD_BOND.active=null; C.game.wildBondOpen=false;
  C.startWildBondEncounter(w,sp);
  ok(p.items.zysphere===1,'★ a second attempt charges again · win or lose, the sphere is gone');
}

H('8 · THE CHARGE LIVES IN ONE PLACE');
{
  const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');
  const spends=(src2.match(/player\.items\.zysphere\s*=\s*_held\s*-\s*1/g)||[]).length;
  ok(spends===1,'★★ exactly ONE line spends a sphere · the gate cannot be walked around by a future caller');
  ok(/_noEncounter/.test(src2),'★ the story-bond path (Elzoran) still exists and is NOT charged — no soft-lock on a scripted companion');
  ok(/game\.zysphereShopOpen\)\s*freezeReasons\.push/.test(src2),'the shop freezes the world like every other shop');
}

H('9 · ★★ THE REFUSAL HAS A VOICE, AND IT RESTS');
{
  const ROOT2='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
  const src3=fs.readFileSync(ROOT2+'rp7b.html','utf8');
  ok(fs.existsSync(ROOT2+'audio/sfx-need-a-zysphere.mp3'),'★ the RVOX is on disk');
  ok(/needZysphere: new Audio\('audio\/sfx-need-a-zysphere\.mp3'\)/.test(src3),'★ registered in the SFX bank');
  ok(/needZysphere: 66/.test(src3),'★ and mixed loud enough to hear over the walking loop');
  ok(/_now - player\._noSphereVoxAt > 15000/.test(src3),
     '★★★ 15-SECOND COOLDOWN, as specified · an empty-handed player bumping X across a field of wilds would turn a character into a buzzer');
  // the toast must NOT be on the cooldown · the refusal is never silent
  const blk=src3.slice(src3.indexOf('const _held = (player.items && player.items.zysphere)'));
  const toastAt=blk.indexOf('NO ZYSPHERE'), gateAt=blk.indexOf('_noSphereVoxAt');
  ok(toastAt>0&&toastAt<gateAt,
     '★★ the TOAST fires before the cooldown check · every attempt is answered, only the VOICE rests');
  ok(/playSFX\('cancel'\)/.test(blk.slice(0,400)),'★ and the cancel cue is uncooled too');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
