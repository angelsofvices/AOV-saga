#!/usr/bin/env python3
# ★ v0.95.835 · regenerates the /tmp/w/ fixtures verify_grunts.js reads.
# The originals were one-off scratch files from the v0.95.696 delivery session
# and died with that VM.  These derive everything from what SHIPS:
#   grunt.json     · the LIVE SEER_GRUNT_ART tables (canon, Creator-approved)
#   neighbour.json · overlap count computed from those tables + the PNGs
#   tree.json      · dream-tree.png dimensions + alpha
import json, re, subprocess, os
from PIL import Image
import numpy as np
os.makedirs('/tmp/w', exist_ok=True)
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# 1 · dump the live tables via node
dump_js = r"""
const fs=require('fs');
const h=fs.readFileSync(process.argv[2]+'/rp7b.html','utf8');
const re=/<script[^>]*>([\s\S]*?)<\/script>/g; let m,all='';
while((m=re.exec(h))) all+=m[1]+'\n';
const noop=()=>{};
global.setInterval=()=>0;global.setTimeout=()=>0;global.clearInterval=noop;global.clearTimeout=noop;
global.addEventListener=noop;global.removeEventListener=noop;
const CTX=new Proxy({},{get:()=>()=>({addColorStop:noop,width:0,height:0,data:[]})});
const el=()=>({style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},width:960,height:540,value:'',textContent:'',innerHTML:'',children:[],childNodes:[],getContext:()=>CTX,appendChild:noop,removeChild:noop,addEventListener:noop,removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,remove:noop,play:()=>Promise.resolve(),pause:noop,querySelector:()=>el(),querySelectorAll:()=>[],getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
global.document={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener:noop,body:el(),documentElement:el(),head:el(),hidden:false,visibilityState:'visible'};
global.window=global;global.localStorage={getItem:()=>null,setItem:noop,removeItem:noop};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,cloneNode(){return this}}};
global.Image=function(){return{addEventListener:noop,complete:false,naturalWidth:0,src:''}};
global.requestAnimationFrame=()=>0;global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0};
global.performance={now:()=>Date.now()};global.getComputedStyle=()=>({getPropertyValue:()=>''});
new Function(all+';globalThis.__T=SEER_GRUNT_ART;')();
const T=globalThis.__T,out={};
for(const v of ['A','B'])for(const k of ['idle','walk','run','attack']){
  if(T[v]&&T[v][k]&&T[v][k].bboxes) out[v.toLowerCase()+'-'+k]={bboxes:T[v][k].bboxes};
}
require('fs').writeFileSync('/tmp/w/tables.json', JSON.stringify(out));
"""
open('/tmp/w/_dump.js','w').write(dump_js)
subprocess.run(['node','/tmp/w/_dump.js', root], check=True)
tables=json.load(open('/tmp/w/tables.json'))
json.dump(tables, open('/tmp/w/grunt.json','w'))
# 2 · neighbour overlap from the live tables
total=0
for name,entry in tables.items():
    v,k=name.split('-')
    path=os.path.join(root,'assets/2D sprites/enemies',f'seer-grunt-{name}.png')
    if not os.path.exists(path): continue
    B=entry['bboxes']
    a=np.array(Image.open(path).convert('RGBA')); alpha=a[...,3]>0; H,W=alpha.shape
    for rr in range(4):
        for cc in range(4):
            bx,by,bw,bh=B[rr][cc]
            y0=max(0,rr*313+by);y1=min(H,rr*313+by+bh);x0=max(0,cc*313+bx);x1=min(W,cc*313+bx+bw)
            ys,xs=np.where(alpha[y0:y1,x0:x1])
            hit=False
            for y,x in zip(ys[::23],xs[::23]):
                ay,ax=y0+y,x0+x
                orr,occ=min(3,int(ay/313.5)),min(3,int(ax/313.5))
                if (orr,occ)==(rr,cc): continue
                nbx,nby,nbw,nbh=B[orr][occ]
                if occ*313+nbx<=ax<occ*313+nbx+nbw and orr*313+nby<=ay<orr*313+nby+nbh:
                    hit=True;break
            if hit: total+=1
json.dump({'total':total}, open('/tmp/w/neighbour.json','w'))
# 3 · dream tree
tp=os.path.join(root,'assets/2D sprites/decor/dream-tree.png')
im=Image.open(tp).convert('RGBA')
json.dump({'w':im.size[0],'h':im.size[1],'hasAlpha':bool((np.array(im)[...,3]<255).any()),
           'factor':round(im.size[0]*im.size[1]/(44*84))}, open('/tmp/w/tree.json','w'))
print('fixtures regenerated · neighbour total:',total,'· tree',im.size)
