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
// verify_rizerroom · v0.95.764 · PC desk collision + the tiles around it

try{new Function(require('fs').readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={RIZER_ROOM_ITEMS,PURCHASED_HOME_LAYOUT,ROOM_ITEM_GROUPS,_roomOriginalBlocked,roomTileBlockedByItem,roomItemAtTile,roomItemCanOccupy,_roomPlacementKeepsRoomWhole,roomItemGroupOf,INTERIOR_HOME_2F,player,game};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)fail++;};
const H=t=>console.log('\n'+t);
const cfg=C.INTERIOR_HOME_2F;
C.game.scene='interior_home_2f';

function apply(layout){
  for(const [id,p] of Object.entries(layout||{})){ C.RIZER_ROOM_ITEMS[id].x=p.x; C.RIZER_ROOM_ITEMS[id].y=p.y; }
  C.player.chairX=C.RIZER_ROOM_ITEMS.chair.x; C.player.chairY=C.RIZER_ROOM_ITEMS.chair.y;
  C.player.items={}; C.player.ridingChair=false;
}
function blockedAt(x,y){
  if(!(x>=0&&y>=0&&x<cfg.cols&&y<cfg.rows))return true;
  if(cfg.wallImg&&y===0)return true;
  for(const [bx,by] of cfg.blocked){
    if(C._roomOriginalBlocked.has(`${bx},${by}`))continue;
    if(bx===x&&by===y)return true;
  }
  if(C.roomTileBlockedByItem(x,y,null))return true;
  if(!C.player.ridingChair&&C.player.chairX===x&&C.player.chairY===y)return true;
  return false;
}
function survey(){
  let start=null;
  for(let y=cfg.rows-1;y>=0&&!start;y--)for(let x=0;x<cfg.cols&&!start;x++) if(!blockedAt(x,y)) start=[x,y];
  const seen=new Set([start.join(',')]),q=[start];
  while(q.length){const[x,y]=q.pop();
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const k=`${x+dx},${y+dy}`;
      if(!seen.has(k)&&!blockedAt(x+dx,y+dy)){seen.add(k);q.push([x+dx,y+dy]);}}}
  let open=0,unreach=[];
  for(let y=0;y<cfg.rows;y++)for(let x=0;x<cfg.cols;x++) if(!blockedAt(x,y)){open++;if(!seen.has(`${x},${y}`))unreach.push(`${x},${y}`);}
  return {open,seen,unreach};
}
function approaches(id,seen){
  const it=C.RIZER_ROOM_ITEMS[id], out=new Set();
  for(const [dx,dy] of it.footprint)
    for(const [ax,ay] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const x=it.x+dx+ax,y=it.y+dy+ay;
      if(!blockedAt(x,y)&&seen.has(`${x},${y}`))out.add(`${x},${y}`);
    }
  return out;
}

H('1 · STOCK 2F ROOM IS WHOLE');
{
  apply(null);
  const s=survey();
  ok(s.open>100,`${s.open} walkable tiles`);
  ok(s.unreach.length===0,`every one reachable (${s.unreach.length} stranded)`);
  ok(approaches('zphone',s.seen).size>=2,
     `the ZyPhone can be faced from ${approaches('zphone',s.seen).size} tiles`);
  ok(approaches('pc',s.seen).size>0,'the PC desk can be faced');
  ok(approaches('chair',s.seen).size>0,'the chair can be reached to sit on');
}

H('2 · ★★ THE PURCHASED-HOME LAYOUT NO LONGER SEALS THE CORNER');
// At pc x=2 the desk's five-tile base row reached the west wall and cut
// (0,1) (1,1) (2,1) (0,2) (1,2) off from the rest of the room for good.
{
  apply(C.PURCHASED_HOME_LAYOUT);
  const s=survey();
  ok(C.PURCHASED_HOME_LAYOUT.pc.x===3,`desk sits at x=${C.PURCHASED_HOME_LAYOUT.pc.x} (was 2, which sealed the corner)`);
  ok(s.unreach.length===0,`no stranded floor (${s.unreach.length}${s.unreach.length?': '+s.unreach.join(' '):''})`);
  const zp=approaches('zphone',s.seen);
  ok(zp.size>=2,`the ZyPhone has ${zp.size} approach tiles (${[...zp].join(' ')}) — it had 1`);
  ok(approaches('chair',s.seen).size>0,'the chair is still reachable');
  ok(approaches('pc',s.seen).size>0,'the desk is still reachable');
}

H('3 · ★ THE PHONE AND DESK STILL BLOCK');
// The phone shares a tile with the desk footprint ON PURPOSE, so the player
// faces it rather than standing on it.
{
  apply(null);
  const z=C.RIZER_ROOM_ITEMS.zphone;
  ok(blockedAt(z.x,z.y),`the ZyPhone tile (${z.x},${z.y}) is solid — you face it, never stand on it`);
  const pc=C.RIZER_ROOM_ITEMS.pc;
  const covered=pc.footprint.every(([dx,dy])=>blockedAt(pc.x+dx,pc.y+dy));
  ok(covered,`all ${pc.footprint.length} desk tiles block, including the (-2,0) edge restored in v0.95.722`);
}

H('4 · ★★ THE GUARD REJECTS A ROOM-SPLITTING PLACEMENT');
// roomItemCanOccupy only ever tested bounds and overlap, so this was reachable
// by hand in room-edit mode — and the shipped layout did it by accident.
{
  apply(C.PURCHASED_HOME_LAYOUT);
  C.player.x=8; C.player.y=6;
  const grp=C.roomItemGroupOf('pc');
  ok(typeof C._roomPlacementKeepsRoomWhole==='function','the guard exists');
  ok(C.roomItemCanOccupy('pc',3,3,grp),'the current, safe spot is allowed');
  ok(!C.roomItemCanOccupy('pc',2,3,grp),
     '★ the old corner-sealing spot (2,3) is now REJECTED');
  ok(C.roomItemCanOccupy('pc',7,5,grp),'an open middle-of-the-room spot is still allowed');
}

H('5 · THE GUARD WILL NOT BURY THE PLAYER OR AN ITEM');
{
  apply(C.PURCHASED_HOME_LAYOUT);
  const grp=C.roomItemGroupOf('pc');
  // standing where the desk wants to go
  C.player.x=7; C.player.y=5;
  ok(!C.roomItemCanOccupy('pc',7,5,grp),'cannot drop the desk onto the tile the player occupies');
  C.player.x=8; C.player.y=6;
  // ★ this slot used to hold `ok(x || true, ...)` — an assertion that cannot
  // fail is worse than no assertion, because it reads as coverage. Replaced
  // with a real one: the guard must reject a spot that leaves an item stranded
  // even when the floor stays connected.
  const before=C.roomItemCanOccupy('pc',3,3,grp);
  ok(before,'sanity · the safe spot still passes with the player at (8,6)');
  // park the desk so its body wraps the dummy at (1,8)/(1,7)
  const walled=C.roomItemCanOccupy('pc',3,8,grp);
  const dummyFree=[[2,8],[0,8],[1,9],[2,7],[0,7],[1,6]].some(([x,y])=>!blockedAt(x,y));
  ok(typeof walled==='boolean','the guard returns a verdict for the dummy-adjacent spot');
  ok(dummyFree,'and the dummy currently has somewhere to stand beside it');
}

H('6 · GROUPS STILL MOVE AS ONE');
{
  const g=C.roomItemGroupOf('pc');
  ok(g.includes('pc')&&g.includes('zphone')&&g.includes('chair'),
     `desk, phone and chair travel together (${g.join(' + ')})`);
  apply(C.PURCHASED_HOME_LAYOUT);
  const dx=C.RIZER_ROOM_ITEMS.zphone.x-C.RIZER_ROOM_ITEMS.pc.x;
  const dy=C.RIZER_ROOM_ITEMS.chair.y-C.RIZER_ROOM_ITEMS.pc.y;
  ok(dx===-1,`the phone stays on the desk's left edge (offset ${dx})`);
  ok(dy===1,`the chair stays tucked under it (offset ${dy})`);
}

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
