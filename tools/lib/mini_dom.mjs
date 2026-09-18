// ★★★ A DOM THE SIZE OF THE QUESTION · v0.98.3
//
// The phone's reachability rules are three real functions — _zycellAutoEnrol,
// _zycellContentItems, _zySectionClick — and they are written against a DOM.
// Re-implementing their LOGIC in a suite would prove my copy works, which is
// the mistake this codebase keeps writing notes about. So the suite runs the
// real source; this file is the DOM it runs against.
//
// ★★ SCOPE, STATED HONESTLY. This is not a browser. It implements exactly the
//   surface those three functions touch, and the selector engine understands
//   exactly the four selectors they use:
//       [data-zyitem]
//       button, [onclick], [role="button"], .zy-click
//       button,[data-zyclick],[data-call],[data-zycat],[data-item]
//       [data-zyrow]
//   A comma list of simple selectors: tag · .class · [attr] · [attr="value"].
//   Anything fancier throws rather than silently matching nothing — a selector
//   engine that quietly returns [] turns a real orphan into a green tick.
//
// ★ offsetParent is approximated as "no ancestor has display:none". That is
//   what _zycellContentItems actually uses it for (hidden detail lines, closed
//   sub-pages). It does NOT model clipping by a scroll container; the suite
//   checks for those separately, by looking for the max-height that causes them.
const VOID = new Set(['area','base','br','col','embed','hr','img','input','link',
                      'meta','param','source','track','wbr']);
const RAW  = new Set(['script','style']);

class El {
  constructor(tag, attrs){ this.tagName = tag.toUpperCase(); this.attrs = attrs || {};
                           this.children = []; this.parentElement = null; this.text = ''; }
  hasAttribute(n){ return Object.prototype.hasOwnProperty.call(this.attrs, n); }
  getAttribute(n){ return this.hasAttribute(n) ? this.attrs[n] : null; }
  setAttribute(n, v){ this.attrs[n] = String(v); }
  removeAttribute(n){ delete this.attrs[n]; }
  get disabled(){ return this.hasAttribute('disabled'); }
  get classList(){ const c = (this.attrs.class || '').split(/\s+/).filter(Boolean);
                   return { contains: x => c.includes(x) }; }
  get style(){ return _styleOf(this); }
  get offsetParent(){
    for (let p = this; p; p = p.parentElement)
      if (/display\s*:\s*none/i.test(p.attrs.style || '')) return null;
    return this.parentElement;                 // good enough: non-null = laid out
  }
  *walk(){ for (const c of this.children){ yield c; yield* c.walk(); } }
  querySelectorAll(sel){ const m = _compile(sel); return [...this.walk()].filter(e => m(e)); }
  querySelector(sel){ const m = _compile(sel); for (const e of this.walk()) if (m(e)) return e; return null; }
  closest(sel){ const m = _compile(sel); for (let p = this; p; p = p.parentElement) if (m(p)) return p; return null; }
  get textContent(){ let s = this.text; for (const c of this.children) s += c.textContent; return s; }
  get innerHTML(){ return this._html || ''; }
  set innerHTML(h){ const root = parse(h); this.children = root.children;
                    for (const c of this.children) c.parentElement = this; this._html = h; }
}
function _styleOf(el){
  // a write-through shim · the focus painter sets el.style.outline and friends
  el._st = el._st || {};
  return new Proxy(el._st, { set(t, k, v){ t[k] = v; return true; }, get(t, k){ return t[k] || ''; } });
}
const _cache = new Map();
function _compile(sel){
  if (_cache.has(sel)) return _cache.get(sel);
  const parts = sel.split(',').map(s => s.trim()).filter(Boolean).map(one => {
    let m;
    if ((m = /^\[([\w-]+)="([^"]*)"\]$/.exec(one))) return e => e.getAttribute(m[1]) === m[2];
    if ((m = /^\[([\w-]+)\]$/.exec(one)))           return e => e.hasAttribute(m[1]);
    if ((m = /^\.([\w-]+)$/.exec(one)))             return e => e.classList.contains(m[1]);
    if ((m = /^([a-zA-Z][\w-]*)$/.exec(one)))       return e => e.tagName === m[1].toUpperCase();
    throw new Error(`mini_dom: unsupported selector "${one}" — extend the engine rather than letting it match nothing`);
  });
  const fn = e => parts.some(p => p(e));
  _cache.set(sel, fn); return fn;
}
export function parse(html){
  const root = new El('root', {});
  const stack = [root];
  let i = 0;
  const top = () => stack[stack.length - 1];
  while (i < html.length){
    const lt = html.indexOf('<', i);
    if (lt < 0){ top().text += html.slice(i); break; }
    if (lt > i) top().text += html.slice(i, lt);
    if (html.startsWith('<!--', lt)){ const e = html.indexOf('-->', lt); i = e < 0 ? html.length : e + 3; continue; }
    const gt = _endOfTag(html, lt);
    if (gt < 0){ top().text += html.slice(lt); break; }
    const raw = html.slice(lt + 1, gt).trim();
    i = gt + 1;
    if (raw[0] === '/'){
      const name = raw.slice(1).trim().toLowerCase();
      for (let k = stack.length - 1; k > 0; k--)
        if (stack[k].tagName === name.toUpperCase()){ stack.length = k; break; }
      continue;
    }
    const sp = raw.search(/[\s/]/);
    const tag = (sp < 0 ? raw : raw.slice(0, sp)).toLowerCase();
    const el = new El(tag, _attrs(sp < 0 ? '' : raw.slice(sp)));
    el.parentElement = top(); top().children.push(el);
    if (VOID.has(tag) || raw.endsWith('/')) continue;
    if (RAW.has(tag)){                                  // skip <style>/<script> bodies whole
      const close = html.toLowerCase().indexOf(`</${tag}`, i);
      el.text = close < 0 ? html.slice(i) : html.slice(i, close);
      i = close < 0 ? html.length : _endOfTag(html, close) + 1;
      continue;
    }
    stack.push(el);
  }
  return root;
}
// ★ a '>' inside an attribute value is not the end of the tag. Every inline
//   style in this codebase is quoted, and several onclick handlers contain
//   `=>`; a naive indexOf('>') truncates those elements and silently drops
//   every attribute after the arrow — including data-zyitem.
function _endOfTag(s, lt){
  let q = null;
  for (let k = lt + 1; k < s.length; k++){
    const c = s[k];
    if (q){ if (c === q) q = null; continue; }
    if (c === '"' || c === "'") q = c;
    else if (c === '>') return k;
  }
  return -1;
}
function _attrs(s){
  const out = {};
  for (const m of s.matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)){
    if (!m[1] || m[1] === '/') continue;
    out[m[1]] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return out;
}
// Build a document whose getElementById answers for the ids the phone uses.
export function makeDocument(nodes){
  const index = new Map(Object.entries(nodes));
  return {
    getElementById: id => index.get(id) || null,
    querySelectorAll: sel => { const m = _compile(sel); const out = [];
      for (const n of index.values()) { if (m(n)) out.push(n); out.push(...n.querySelectorAll(sel)); }
      return out; },
  };
}
export { El };
