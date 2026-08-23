// verify_zyphone · v0.95.765 · every phone button reachable on a DualSense
//
// jsdom is blocked by policy here, so this uses a small element model that
// implements exactly the DOM surface _zycellAutoEnrol touches: querySelectorAll
// over a selector list, get/has/setAttribute, parentElement.closest, disabled,
// offsetParent and click. It tests the enrolment LOGIC, which is the part that
// was written today.
const fs=require('fs');
let fail=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)fail++;};
const H=t=>console.log('\n'+t);

class El {
  constructor(tag, attrs={}, kids=[]){
    this.tagName=tag.toUpperCase(); this.attrs={...attrs}; this.children=kids;
    this.disabled=!!attrs.disabled; this.offsetParent={}; this.clicks=0;
    this.style={}; kids.forEach(k=>k.parentElement=this);
  }
  hasAttribute(n){ return this.attrs[n]!==undefined; }
  getAttribute(n){ return this.attrs[n]===undefined?null:this.attrs[n]; }
  setAttribute(n,v){ this.attrs[n]=v; }
  click(){ this.clicks++; if(this.attrs.onclick) this.attrs.onclick(); }
  get classList(){ return (this.attrs.class||'').split(/\s+/); }
  _matches(sel){
    sel=sel.trim();
    if(sel==='button') return this.tagName==='BUTTON';
    if(sel==='[onclick]') return this.hasAttribute('onclick');
    if(sel==='[role="button"]') return this.getAttribute('role')==='button';
    if(sel==='.zy-click') return this.classList.includes('zy-click');
    if(sel==='[data-zyitem]') return this.hasAttribute('data-zyitem');
    return false;
  }
  _all(out=[]){ for(const k of this.children){ out.push(k); k._all(out); } return out; }
  querySelectorAll(sel){
    const parts=sel.split(',').map(s=>s.trim());
    return this._all().filter(e=>parts.some(p=>e._matches(p)));
  }
  closest(sel){ let n=this; while(n){ if(n._matches(sel)) return n; n=n.parentElement; } return null; }
}

// ── the real function, lifted from the file so the test cannot drift from it ──
const src=fs.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
const i=src.indexOf('function _zycellAutoEnrol(');
const j=src.indexOf('function _zycellContentItems(');
ok(i>0&&j>i,'_zycellAutoEnrol was found in rp7b.html and is used by _zycellContentItems');
const _zycellAutoEnrol=new Function('return '+src.slice(i,j).trim())();

H('1 · ★★ THE ATTRIBUTE UPGRADE BUTTONS BECOME REACHABLE');
// This is the request: apply upgrades with the controller. Before today these
// carried an onclick and nothing else, so the cursor never stopped on them.
{
  const mk=(label,n)=>new El('button',{onclick(){this._spent=n;}, 'data-n':n},[]);
  const row=new El('div',{},[mk('+1',1),mk('+10',10),mk('+MAX',999)]);
  const content=new El('div',{id:'zycellContent'},[row]);
  const before=content.querySelectorAll('[data-zyitem]').length;
  _zycellAutoEnrol(content);
  const after=content.querySelectorAll('[data-zyitem]').length;
  ok(before===0,`before: ${before} reachable controls — the +1 / +10 / +MAX buttons were invisible to the pad`);
  ok(after===3,`after: ${after} reachable · every spend button is now a cursor stop`);
  ok(content.querySelectorAll('[data-zyitem]').every(e=>e.getAttribute('data-zyitem')==='auto'),
     'and they are marked "auto" so a hand-written data-zyitem is never overwritten');
}

H('2 · ★ A DISABLED BUTTON IS NOT A CURSOR STOP');
// The spend buttons go disabled the moment the point pool empties. Landing on
// a dead button reads as the phone being broken.
{
  const live=new El('button',{onclick(){}});
  const dead=new El('button',{onclick(){},disabled:true});
  const aria=new El('button',{onclick(){},'aria-disabled':'true'});
  const c=new El('div',{},[live,dead,aria]);
  _zycellAutoEnrol(c);
  ok(live.hasAttribute('data-zyitem'),'the usable button is enrolled');
  ok(!dead.hasAttribute('data-zyitem'),'a disabled button is skipped');
  ok(!aria.hasAttribute('data-zyitem'),'an aria-disabled button is skipped too');
}

H('3 · ★ NO DOUBLE STOP ON ONE ROW');
// A faction row already carries data-zyitem by hand and holds buttons inside.
// Enrolling both would stop the cursor twice on the same row.
{
  const inner=new El('button',{onclick(){}});
  const row=new El('div',{'data-zyitem':'faction-0'},[inner]);
  const c=new El('div',{},[row]);
  _zycellAutoEnrol(c);
  ok(row.getAttribute('data-zyitem')==='faction-0','the hand-written tag on the row is untouched');
  ok(!inner.hasAttribute('data-zyitem'),'its child button is NOT separately enrolled');
  ok(c.querySelectorAll('[data-zyitem]').length===1,'the row is one cursor stop, not two');
}

H('4 · EVERY KIND OF CLICKABLE IS COVERED');
{
  const b=new El('button',{}), o=new El('div',{onclick(){}}),
        r=new El('div',{role:'button'}), z=new El('div',{class:'zy-click'}),
        plain=new El('div',{});
  const c=new El('div',{},[b,o,r,z,plain]);
  _zycellAutoEnrol(c);
  ok(b.hasAttribute('data-zyitem'),'<button>');
  ok(o.hasAttribute('data-zyitem'),'[onclick]');
  ok(r.hasAttribute('data-zyitem'),'[role=button]');
  ok(z.hasAttribute('data-zyitem'),'.zy-click');
  ok(!plain.hasAttribute('data-zyitem'),'and a plain div is left alone — text is not a button');
}

H('5 · ★★ CROSS ON A DUALSENSE ACTUALLY PRESSES IT');
// BTN[0] = Cross -> 'x'; handleZycellKey's content branch clicks items[cursor].
// Both halves have to line up or the cursor moves and nothing happens.
{
  const btn=src.slice(src.indexOf('const BTN = {'), src.indexOf('const BTN = {')+400);
  ok(/0:\s*'x'/.test(btn),"Cross dispatches 'x'");
  const h=src.slice(src.indexOf('function handleZycellKey'), src.indexOf('function handleZycellKey')+4000);
  const line=h.match(/if \(k === 'arrowright'[^\n]*\n/);
  ok(!!line&&/'x'/.test(line[0]),"the content branch accepts 'x' as an activate key");
  ok(/const el = items\[game\._zycellItemIdx\];\s*\n\s*if \(el\) el\.click\(\);/.test(h),
     'and it clicks the focused item rather than doing something bespoke');
}

H('6 · ENROLMENT IS IDEMPOTENT');
{
  const b=new El('button',{onclick(){}});
  const c=new El('div',{},[b]);
  _zycellAutoEnrol(c); const one=c.querySelectorAll('[data-zyitem]').length;
  _zycellAutoEnrol(c); _zycellAutoEnrol(c);
  ok(c.querySelectorAll('[data-zyitem]').length===one,
     `re-running on every repaint does not duplicate stops (${one})`);
}

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
