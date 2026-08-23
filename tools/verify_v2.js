const fs=require('fs');
const html=fs.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/cardmaster.html','utf8');
let script=html.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/^\s*'use strict';\s*/,'');
function FakeEl(id){this.id=id||'';this._cls=new Set();this.style={};this.children=[];this.hidden=false;this._text='';this._html='';this.dataset={};this.onclick=null;}
Object.defineProperty(FakeEl.prototype,'textContent',{get(){return this._text;},set(v){this._text=String(v);}});
Object.defineProperty(FakeEl.prototype,'innerHTML',{get(){return this._html;},set(v){this._html=String(v);this.children=[];}});
FakeEl.prototype.appendChild=function(c){this.children.push(c);return c;};
FakeEl.prototype.remove=function(){};FakeEl.prototype.addEventListener=function(){};FakeEl.prototype.querySelectorAll=function(){return[];};
function clsObj(el){return{add:(...a)=>a.forEach(x=>el._cls.add(x)),remove:(...a)=>a.forEach(x=>el._cls.delete(x)),toggle:(x,on)=>{if(on)el._cls.add(x);else el._cls.delete(x);},contains:(x)=>el._cls.has(x)};}
function makeEl(id){const e=new FakeEl(id);e.classList=clsObj(e);return e;}
global.__els={};
function getEl(id){if(!global.__els[id])global.__els[id]=makeEl(id);return global.__els[id];}
global.document={getElementById:getEl,querySelector:()=>getEl('__app'),createElement:()=>makeEl()};
global.window={};global.__queue=[];global.setTimeout=(fn)=>{global.__queue.push(fn);return 0;};
const D=`
function drain(n){let i=0;while(__queue.length&&i<n){(__queue.shift())();i++;}return i;}
function pm(){const b=state.battle;if(!b||b.winner)return false;
 if(b.awaitingShift==='p1'){const p=b.p1;const idx=p.team.findIndex((_,i)=>i!==p.activeIdx&&!p.fallen.includes(i));if(idx<0)return false;doSwitch('p1',idx,true);return true;}
 if(b.turn!=='p1'||b.acting)return false;
 const c=activeOf('p1');const r=Math.random();
 if(!c.a3Used&&c.gems>=A3_COST&&r<0.30){resolveSwing('a3','p1','self','atk');return true;}
 if(c.gems>=A2_COST&&r<0.55){resolveSwing('a2','p1','opp','atk');return true;}
 if(c.gems<A3_COST&&r<0.78){doDraw();return true;}
 doA1();return true;}
initMatch();drain(60);
__els['open-dice-roll'].onclick();drain(60);
__els['open-dice-continue'].onclick();drain(160);
if(state._openingWinner==='p1')__els['open-choice-play'].onclick();
drain(200);__els['open-choice-continue'].onclick();
let g=0;
while(!state.battle.winner&&g<5000){g++;const b=state.battle;
 if(!b.pickedStarting.p1&&__els['modal-card-select']&&__els['modal-card-select'].classList.contains('show')){const grid=__els['card-select-grid'];if(grid.children.length){grid.children[0].onclick();continue;}}
 if(__queue.length){drain(1);continue;}
 if(!pm())break;}
const L=state.battle.log;
console.log('=== first 30 log lines ===');
L.slice(0,30).forEach(l=>console.log('['+l.type+'] '+l.msg));
console.log('...');
console.log('=== last 12 ===');
L.slice(-12).forEach(l=>console.log('['+l.type+'] '+l.msg));
console.log('winner='+state.battle.winner+' totalLog='+L.length);
const draws=L.filter(l=>l.msg.includes('draws a gem')).length;
const a2=L.filter(l=>l.msg.includes('uses A2')).length;
const a3=L.filter(l=>l.msg.includes('unleashes A3')).length;
const st=L.filter(l=>l.type==='status').length;
console.log('counts: draws='+draws+' A2='+a2+' A3='+a3+' statusLines='+st);
`;
eval(script+'\n;\n'+D);
