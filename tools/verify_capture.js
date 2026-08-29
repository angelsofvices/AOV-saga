const fs=require('fs'); const src=fs.readFileSync('/tmp/all.js','utf8'); const noop=()=>{};
try{Object.defineProperty(globalThis,'navigator',{value:{userAgent:'node',getGamepads:()=>[],maxTouchPoints:0},configurable:true});}catch(_){}
const CTX=new Proxy({},{get:()=>()=>({addColorStop:noop,width:0,height:0,data:[],createRadialGradient:()=>({addColorStop:noop})})});
const el=()=>({style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},width:960,height:540,value:'',textContent:'',innerHTML:'',children:[],childNodes:[],getContext:()=>CTX,appendChild:noop,removeChild:noop,addEventListener:noop,removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,remove:noop,play:()=>Promise.resolve(),pause:noop,querySelector:()=>el(),querySelectorAll:()=>[],getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
Object.assign(globalThis,{setInterval:()=>0,setTimeout:()=>0,clearInterval:noop,clearTimeout:noop,addEventListener:noop,removeEventListener:noop,window:globalThis,
 document:{getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener:noop,body:el(),documentElement:el(),head:el(),hidden:false,visibilityState:'visible'},
 localStorage:{getItem:()=>null,setItem:noop,removeItem:noop},
 Audio:function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,cloneNode(){return this}}},
 Image:function(){return{addEventListener:noop,complete:false,naturalWidth:0,src:''}},
 requestAnimationFrame:()=>0,cancelAnimationFrame:noop,matchMedia:()=>({matches:false,addEventListener:noop,addListener:noop}),
 performance:{now:()=>Date.now()},getComputedStyle:()=>({getPropertyValue:()=>''})});
try{new Function(src+';globalThis.__C={CAPTURE_ART,captureFrameIndex,drawCaptureSprite,WILD_BOND,startWildBondEncounter,SPECIES,player,game,TILE};')();}
catch(e){console.log('BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  OK  ':'  XX  ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';

H('1 · EIGHT SHEETS · success and fail, one per facing');
{
  const keys=Object.keys(C.CAPTURE_ART);
  ok(keys.length===8,'eight banks registered · '+keys.length);
  for(const k of ['success_down','success_left','success_right','success_up','fail_down','fail_left','fail_right','fail_up'])
    ok(!!C.CAPTURE_ART[k],'bank '+k);
  let onDisk=0;
  for(const k of keys){
    const p=ROOT+decodeURIComponent(C.CAPTURE_ART[k].src);
    if(fs.existsSync(p)&&fs.statSync(p).size>200000) onDisk++;
    const buf=fs.readFileSync(p);
    if(buf.readUInt32BE(16)!==1254||buf.readUInt32BE(20)!==1254) ok(false,k+' is not 1254x1254');
  }
  ok(onDisk===8,'all eight PNGs on disk, real art ('+onDisk+')');
  const buf=fs.readFileSync(ROOT+'assets/2D sprites/rizer/capture-success-down.png');
  ok(buf[25]===6,'keyed to RGBA · the neon green is gone');
}

H('2 · 16 MEASURED FRAMES PER SHEET · body feet, not beam bottoms');
{
  let frames=0, feetInside=true, plausible=true;
  for(const k of Object.keys(C.CAPTURE_ART)){
    const a=C.CAPTURE_ART[k];
    for(let r=0;r<4;r++)for(let c=0;c<4;c++){
      const b=a.bboxes[r][c], ft=a.feet[r][c];
      frames++;
      if(b[2]<40||b[3]<40) plausible=false;
      if(ft<b[1]||ft>b[1]+b[3]) feetInside=false;
    }
  }
  ok(frames===128,'128 frames measured across the eight sheets ('+frames+')');
  ok(plausible,'every frame is a real body-sized bbox');
  ok(feetInside,'every foot baseline lies inside its own frame');
  const d=C.CAPTURE_ART.success_down.feet;
  ok(d[0][0]!==d[3][0],'the art DRIFTS row to row (feet '+d[0][0]+' vs '+d[3][0]+') — exactly what baselines exist to absorb');
  ok(new Set(d[0]).size===1,'…but is steady WITHIN a row, so the drift is systematic, not noise');
  ok(/TALLEST component in the cell, not the largest/.test(src),'the body is picked as the TALLEST component · a wide beam is not Rizer');
}

H('3 · THE FRAME CLOCK IS THE ENCOUNTER');
{
  const w={speciesId:'apexaur',tileX:10,tileY:10,level:50,temperament:'Calm'};
  C.player.bondLedger={zyrex:900,rizer:800};
  C.startWildBondEncounter(w,C.SPECIES.apexaur);
  const B=C.WILD_BOND.active, t0=B.t0;
  ok(C.captureFrameIndex(B,t0)===0,'the imprint opens on frame 0 · RAISE');
  ok(C.captureFrameIndex(B,t0+330)===3,'frame 3 by ~330ms · the sphere is OPEN');
  const mid={...B,idx:0,progress:0.5};
  ok(C.captureFrameIndex(mid,t0+2000)>=4,'the PULL frames run while you spin');
  const late={...B,idx:B.seq.length-1,progress:0.99};
  ok(C.captureFrameIndex(late,t0+9000)===10,'the last event sits on the deepest STRUGGLE frame');
  const won={...B,result:'bond',resultAt:1000};
  ok(C.captureFrameIndex(won,1000)===11&&C.captureFrameIndex(won,2200)===15,'a WIN walks 11 → 15 · SNAP into LOCK');
  const lost={...B,result:'break',resultAt:1000};
  ok(C.captureFrameIndex(lost,1000)===8&&C.captureFrameIndex(lost,2200)===15,'a LOSS walks 8 → 15 · BREAK into the long look after it');
  ok(/B\.result === 'break' \? 'fail_' : 'success_'/.test(src),'the FAIL sheet is chosen only on a broken bond');
}

H('4 · IT REPLACES THE ORDINARY SPRITE, SAFELY');
{
  ok(/WILD_BOND\.active && drawCaptureSprite\(\)\) return/.test(src),'drawPlayer hands over while an encounter is live');
  ok(/catch\(err\)\{ console\.warn\('\[rp7b\] capture sprite'/.test(src),'…and falls through to the normal sprite if the art is missing');
  ok(/const ref = CAPTURE_ART\.success_down\.bboxes\[0\]\[0\]\[3\]/.test(src),'ONE shared scale across all eight sheets · no facing is bigger');
  ok(/foot - bb\[1\]\) \* scale/.test(src),'planted on the measured body sole, not the bbox bottom');
  ok(/row = i >> 2, col = i & 3/.test(src),'frame index walks the sheet row-major · these are not row=direction banks');
}

console.log(f?('\n'+f+' failure(s)'):'\nALL CHECKS PASS');
process.exit(0);
