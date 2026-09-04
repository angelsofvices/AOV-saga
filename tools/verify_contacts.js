// ★ v0.95.948 · phone contacts · one call per call
// Reproduces the shipped bug in a DOM: click a contact row and count how many
// distinct contacts got dialled.  Before the fix it was two -- the one you
// clicked, plus whoever sorts first.
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(ROOT,'rp7b.html'),'utf8');
let fail=0; const ok=m=>console.log('  ok   '+m); const bad=m=>{console.log('  FAIL '+m);fail++;};

// 1 · the old inline forward must be gone
if (/querySelector\('button,\[data-zyclick\]'\);if\(b\)b\.click\(\)/.test(html))
  bad('the old unconditional section click-forward is still inline');
else ok('unconditional section click-forward removed');
if (!/function _zySectionClick\(el, ev\)/.test(html)) bad('_zySectionClick missing');
else ok('_zySectionClick present');
if (!/onclick="_zySectionClick\(this, event\)"/.test(html)) bad('section wrapper not routed through it');
else ok('section wrapper routed through _zySectionClick');

// 2 · behavioural test with a real DOM-ish shim
const src = html.match(/function _zySectionClick\(el, ev\)\{[\s\S]*?\n\}/)[0];
const _zySectionClick = new Function('el','ev', src.replace(/^function _zySectionClick\(el, ev\)\{/,'').replace(/\}$/,''));

function mkEl(tag, attrs){
  const e = { tag, attrs: attrs||{}, children: [], clicked: 0, parent: null };
  e.matches = sel => sel.split(',').some(s=>{
    s=s.trim();
    if (s === e.tag) return true;
    const m = s.match(/^\[([^\]]+)\]$/);
    return m ? Object.prototype.hasOwnProperty.call(e.attrs, m[1]) : false;
  });
  e.closest = sel => { let n=e; while(n){ if(n.matches && n.matches(sel)) return n; n=n.parent; } return null; };
  e.click = () => { e.clicked++; };
  e.querySelectorAll = sel => { const out=[]; (function w(n){ for(const c of n.children){ if(c.matches(sel)) out.push(c); w(c);} })(e); return out; };
  return e;
}
function section(nControls){
  const sec = mkEl('div', {'data-zyitem':'sec_contacts'});
  const rows = [];
  for (let i=0;i<nControls;i++){
    const row = mkEl('div', {'data-call':'c'+i, 'data-zyitem':'contact_c'+i});
    const btn = mkEl('button', {'data-call':'c'+i});
    btn.parent=row; row.children.push(btn); row.parent=sec; sec.children.push(row); rows.push({row,btn});
  }
  return {sec, rows};
}
// ★ THE REGRESSION: eleven contacts, click the fifth
{
  const {sec, rows} = section(11);
  _zySectionClick(sec, { target: rows[4].row });
  const extra = rows.filter((r,i)=> i!==4 && (r.btn.clicked||r.row.clicked)).length;
  if (extra) bad(`clicking contact #5 also fired ${extra} other contact(s)`);
  else ok('clicking one contact fires no others (11-row book)');
  if (rows[0].btn.clicked) bad('the FIRST contact still fires — the original bug');
  else ok('the first contact is not auto-dialled');
}
// ★ the single-control convenience must still work.
// NOTE the fixture: a real one-control section is a bare button, not a contact
// row -- a contact row carries data-call AND contains a button, so even a
// one-entry address book is two controls and correctly refuses to guess.
function soloSection(){
  const sec = mkEl('div', {'data-zyitem':'sec_settings'});
  const btn = mkEl('button', {});
  btn.parent = sec; sec.children.push(btn);
  return {sec, btn};
}
{
  const {sec, btn} = soloSection();
  _zySectionClick(sec, { target: sec });        // click the chrome itself
  if (btn.clicked !== 1) bad('single-control section no longer forwards');
  else ok('single-control section still forwards from its chrome');
}
// ★ a click that already had an owner must not double-fire it
{
  const {sec, btn} = soloSection();
  _zySectionClick(sec, { target: btn });
  if (btn.clicked) bad('forward fired on top of a button that handles itself');
  else ok('a click with its own owner is left alone');
}
// ★ and a one-entry contact book still refuses (row + button = ambiguous)
{
  const {sec, rows} = section(1);
  _zySectionClick(sec, { target: sec });
  if (rows[0].btn.clicked) bad('one-entry contact book auto-dialled from the chrome');
  else ok('one-entry contact book does not auto-dial');
}
console.log(fail?`\n${fail} FAILURE(S)`:'\nall contact checks passed');
process.exit(fail?1:0);
