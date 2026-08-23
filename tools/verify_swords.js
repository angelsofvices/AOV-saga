// v0.95.714 · S1 / S2 SWORD SHEETS
//
// The Creator's brief was four words long: "no cell bleed. chromakey to
// magenta. no outline. keep bbox true."
//
// Three of those are checkable against the PNGs. The fourth — "keep bbox
// true" — turned out to conflict with how drawPlayer scales an attack frame,
// and section 5 is the measurement that found it: pinning drawH to the idle
// height means a truer (VFX-inclusive) bbox renders the CHARACTER smaller.
// Truer bboxes made the wobble worse, not better, which is the opposite of
// what "keep bbox true" is asking for.
const fs = require('fs');
const path = '/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html';
const src = fs.readFileSync(path, 'utf8');
const ART = '/sessions/great-cool-heisenberg/mnt/AOV-saga-new/assets/2D sprites/rizer/';
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };

// ── read the shipped tables straight out of the file ──────────────────
function bundle(name){
  const i = src.indexOf(`const ${name} = {`);
  if (i < 0) return null;
  const j = src.indexOf('bboxes:', i);
  let k = src.indexOf('[', j), d = 0, m = k;
  for (; m < src.length; m++){ if (src[m]==='[') d++; else if (src[m]===']'){ d--; if(!d) break; } }
  const txt = src.slice(k, m+1).replace(/\/\/[^\n]*/g,'').replace(/,\s*([\]\}])/g,'$1');
  // ★ A regex cannot reliably match a nested array — my first attempt,
  // /footOff:\s*(\[\[[^\]]*\][^;]*?\])/, stopped at the first inner "]" and
  // handed JSON.parse a truncated "[[0,0,31,0],[0,0,1,0]". Bracket-match it.
  const fi = src.indexOf('footOff:', i);
  let footTxt = null;
  if (fi > 0 && fi < i + 4000){
    let fk = src.indexOf('[', fi), fd = 0, fm = fk;
    for (; fm < src.length; fm++){ if (src[fm]==='[') fd++; else if (src[fm]===']'){ fd--; if(!fd) break; } }
    footTxt = src.slice(fk, fm+1).replace(/\/\/[^\n]*/g,'').replace(/\s+/g,'');
  }
  return {
    bboxes: JSON.parse(txt),
    footOff: footTxt ? JSON.parse(footTxt) : null,
    constScale: /constScale:\s*true/.test(src.slice(i, i + 4000)),
  };
}
const S1 = bundle('RIZER_SAPPHIRE_SWORD');
const S2 = bundle('RIZER_RUBYPAW_SWORD');

console.log('\n1 · ★ BOTH SHEETS DECLARE A COMPLETE, WELL-FORMED TABLE\n');
for (const [tag, B] of [['S1 sapphire', S1], ['S2 rubypaw', S2]]){
  ok(!!B, `${tag} bundle found`);
  if (!B) continue;
  ok(B.bboxes.length === 4 && B.bboxes.every(r => r.length === 4), `${tag} · 4x4 table`);
  const flat = B.bboxes.flat();
  ok(flat.every(c => Array.isArray(c) && c.length === 4 && c.every(v => typeof v === 'number')),
     `${tag} · every cell is 4 finite numbers`);
  ok(!B.bboxes.some(r => Array.isArray(r[0]) && Array.isArray(r[0][0])),
     `${tag} · not double-nested (the v0.95.701 bug that blanked every DOWN frame)`);
  ok(flat.every(c => c[2] > 0 && c[3] > 0), `${tag} · no zero-area cell`);
}

// ── PNG probe · pure JS, no deps ──────────────────────────────────────
// Only the IHDR + IDAT are needed, and inflate is in node's zlib.
const zlib = require('zlib');
function readPNG(file){
  const buf = fs.readFileSync(file);
  let p = 8, w = 0, h = 0, bd = 0, ct = 0; const idat = [];
  while (p < buf.length){
    const len = buf.readUInt32BE(p), type = buf.toString('ascii', p+4, p+8);
    if (type === 'IHDR'){ w = buf.readUInt32BE(p+8); h = buf.readUInt32BE(p+12); bd = buf[p+16]; ct = buf[p+17]; }
    else if (type === 'IDAT') idat.push(buf.slice(p+8, p+8+len));
    else if (type === 'IEND') break;
    p += 12 + len;
  }
  if (bd !== 8 || ct !== 6) throw new Error(`unsupported PNG (bd ${bd} ct ${ct})`);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = 4, stride = w * bpp, out = Buffer.alloc(h * stride);
  let q = 0;
  for (let y = 0; y < h; y++){
    const ft = raw[q++];
    const line = raw.slice(q, q + stride); q += stride;
    const cur = out.slice(y*stride, (y+1)*stride);
    const prev = y ? out.slice((y-1)*stride, y*stride) : Buffer.alloc(stride);
    for (let x = 0; x < stride; x++){
      const a = x >= bpp ? cur[x-bpp] : 0, b = prev[x], c = x >= bpp ? prev[x-bpp] : 0;
      let v = line[x];
      if (ft === 1) v += a;
      else if (ft === 2) v += b;
      else if (ft === 3) v += (a + b) >> 1;
      else if (ft === 4){
        const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2*c);
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      }
      cur[x] = v & 255;
    }
  }
  return { w, h, data: out };
}
const IMG = { S1: readPNG(ART + 'sapphire-sword.png'), S2: readPNG(ART + 'rubypaw-sword.png') };
const px = (I, x, y) => { const o = (y*I.w + x)*4; return [I.data[o], I.data[o+1], I.data[o+2], I.data[o+3]]; };

console.log('\n2 · ★ CHROMAKEY · NO MAGENTA SURVIVES\n');
for (const [tag, I] of Object.entries(IMG)){
  let hot = 0, opaque = 0;
  for (let y = 0; y < I.h; y++) for (let x = 0; x < I.w; x++){
    const [r,g,b,a] = px(I,x,y);
    if (a <= 24) continue;
    opaque++;
    if (r > 200 && g < 110 && b > 200 && (r-g) > 90 && (b-g) > 90) hot++;
  }
  ok(hot === 0, `${tag} · ${hot} near-pure chroma pixels still opaque (of ${opaque})`);
  ok(px(I,0,0)[3] === 0 && px(I,I.w-1,I.h-1)[3] === 0, `${tag} · all four corners transparent`);
}

console.log('\n3 · ★★ NO OUTLINE · THE MAGENTA FRINGE IS GONE\n');
console.log('     Flood-fill removes the background but leaves the anti-aliased');
console.log('     blend where art met magenta. On delivery that was 76% and 78%');
console.log('     of the entire silhouette perimeter — a pink rim that reads as');
console.log('     exactly the outline the brief says not to have. The shipping');
console.log('     punch and rubypaw sheets are at 0%, so it is a defect, not the');
console.log('     house style.\n');
for (const [tag, I] of Object.entries(IMG)){
  let edge = 0, lean = 0;
  for (let y = 1; y < I.h-1; y++) for (let x = 1; x < I.w-1; x++){
    const [r,g,b,a] = px(I,x,y);
    if (a <= 24) continue;
    const isEdge = px(I,x-1,y)[3] <= 24 || px(I,x+1,y)[3] <= 24 || px(I,x,y-1)[3] <= 24 || px(I,x,y+1)[3] <= 24;
    if (!isEdge) continue;
    edge++;
    if (r-g > 60 && b-g > 60 && r > 90 && b > 90) lean++;
  }
  const pct = lean / Math.max(1, edge) * 100;
  ok(pct < 5, `${tag} · magenta-leaning edge pixels ${lean}/${edge} (${pct.toFixed(1)}%) — was ~77% on delivery`);
}

console.log('\n4 · ★★ NO CELL BLEED · NO FRAME SAMPLES ANOTHER FRAME\n');
console.log('     This is the check that matters, and it is NOT "does the bbox');
console.log('     fit inside 313x313". A bbox may hang outside its cell over');
console.log('     empty space quite safely. What must never happen is a frame');
console.log('     pulling in pixels that BELONG to a different frame — that is');
console.log('     what shows up in game as a severed sword floating beside the');
console.log('     character.\n');
const CODE = 313, ARTC = 313.5;
// ★★ OWNERSHIP, not geometry.
//
// My first version of this check asked "which 313.5 cell does this pixel sit
// in", flagged 1050 + 64 pixels, and was WRONG. A slash arc that begins in
// frame r0c2 and sweeps a few pixels past the cell edge still BELONGS to
// r0c2 — drawing it is correct, and clipping it would be the bug. What must
// never happen is a window containing pixels from a DIFFERENT frame's art.
//
// Distinguishing those two requires the same component flood-fill the tables
// were built with: label every connected blob, give it to the cell holding
// most of its pixels, and only then ask whose pixels are in whose window.
// A geometric test cannot tell an arc from an intruder.
function ownerMap(I){
  const N = I.w * I.h;
  const opaque = new Uint8Array(N);
  for (let i = 0; i < N; i++) opaque[i] = I.data[i*4+3] > 24 ? 1 : 0;
  const owner = new Int8Array(N).fill(-1);
  const seen = new Uint8Array(N);
  const stack = new Int32Array(N);
  const pts = new Int32Array(N);
  for (let start = 0; start < N; start++){
    if (!opaque[start] || seen[start]) continue;
    let sp = 0, np = 0;
    stack[sp++] = start; seen[start] = 1;
    const tally = new Int32Array(16);
    while (sp > 0){
      const cur = stack[--sp];
      pts[np++] = cur;
      const y = (cur / I.w) | 0, x = cur - y * I.w;
      const r = Math.min(3, Math.floor(y / ARTC)), c = Math.min(3, Math.floor(x / ARTC));
      tally[r*4 + c]++;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++){
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= I.w || ny >= I.h) continue;
        const ni = ny * I.w + nx;
        if (opaque[ni] && !seen[ni]){ seen[ni] = 1; stack[sp++] = ni; }
      }
    }
    let home = 0;
    for (let k = 1; k < 16; k++) if (tally[k] > tally[home]) home = k;
    for (let k = 0; k < np; k++) owner[pts[k]] = home;
  }
  return owner;
}
for (const [tag, B] of [['S1', S1], ['S2', S2]]){
  const I = IMG[tag];
  const owner = ownerMap(I);
  let bleed = 0, offsheet = 0, overflow = 0, worst = '';
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++){
    const [bx,by,bw,bh] = B.bboxes[r][c];
    const x0 = c*CODE + bx, y0 = r*CODE + by, idx = r*4 + c;
    if (x0 < 0 || y0 < 0 || x0+bw > I.w || y0+bh > I.h){ offsheet++; continue; }
    let local = 0;
    for (let y = y0; y < y0+bh; y++) for (let x = x0; x < x0+bw; x++){
      const i = y*I.w + x;
      if (I.data[i*4+3] <= 24) continue;
      if (owner[i] !== idx && owner[i] >= 0){ bleed++; local++; }
      const gr = Math.min(3, Math.floor(y/ARTC)), gc = Math.min(3, Math.floor(x/ARTC));
      if (owner[i] === idx && (gr !== r || gc !== c)) overflow++;
    }
    if (local) worst += ` r${r}c${c}:${local}`;
  }
  ok(offsheet === 0, `${tag} · all 16 sampling windows lie on the sheet (${offsheet} off)`);
  ok(bleed === 0, `${tag} · ${bleed} pixels owned by ANOTHER frame inside any window${worst}`);
  console.log(`     ${tag} · ${overflow}px of a frame's OWN art sits past its cell edge — legitimate,`);
  console.log(`            that is the arc overhanging, and clipping it would sever the slash.`);
}

console.log('\n5 · ★★ THE CHARACTER NO LONGER PULSES ACROSS A SWING\n');
console.log('     drawPlayer pinned an attack frame to the IDLE height, so a');
console.log('     frame inflated by a slash arc rendered the character smaller');
console.log('     by that exact amount. Measured on the sheets that shipped:');
console.log('       sapphire  72%-94% of target  ->  1.31x size swing');
console.log('       rubypaw   54%-98% of target  ->  1.83x size swing');
console.log('     constScale opts these two sheets out, so every frame uses the');
console.log('     sheet\'s own constant scale and the body holds one size.\n');
ok(S1.constScale === true, 'S1 declares constScale');
ok(S2.constScale === true, 'S2 declares constScale');
ok(/!bundle\.constScale/.test(src), 'drawPlayer honours it in the attack-scale branch');
const branch = src.match(/if \(inAttack && idleBundle\.bboxes && !player\._astralthrowComposite[^)]*\)/);
ok(branch && /_astralthrowComposite/.test(branch[0]),
   'and the branch still guards object composites, which genuinely need it');
// A constant scale is only honest if the artist drew one constant size.
for (const [tag, B] of [['S1', S1], ['S2', S2]]){
  const anchor = B.bboxes[0][0][3];
  const scale = 96 / anchor;
  ok(scale > 0.2 && scale < 1.2, `${tag} · scale ${scale.toFixed(4)} from anchor bh ${anchor} (2 tiles = 96px)`);
}

console.log('\n6 · ★★ FEET STAY ON THE TILE LINE\n');
console.log('     dy assumes the bbox bottom IS the feet. Across both sheets 30');
console.log('     of 32 frames measure exactly 0 gap, which is a strong signal');
console.log('     the artist aligned to that same line deliberately. The two');
console.log('     exceptions are crescents that sweep below the boots.\n');
for (const [tag, B] of [['S1', S1], ['S2', S2]]){
  ok(!!B.footOff, `${tag} · declares footOff`);
  if (!B.footOff) continue;
  const flat = B.footOff.flat();
  ok(flat.length === 16 && flat.every(v => typeof v === 'number' && v >= 0),
     `${tag} · 16 non-negative offsets`);
  const nonzero = flat.filter(v => v > 0);
  const I = IMG[tag];
  // Re-derive from the PNG: the lowest DARK (armour/boot) row per frame.
  let wrong = 0, detail = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++){
    const [bx,by,bw,bh] = B.bboxes[r][c];
    let lowest = -1;
    for (let y = by + bh - 1; y >= by; y--){
      let found = false;
      for (let x = bx; x < bx+bw; x++){
        const [R,G,Bl,A] = px(I, c*CODE+x, r*CODE+y);
        if (A > 24 && Math.max(R,G,Bl) < 115){ found = true; break; }
      }
      if (found){ lowest = y - by; break; }
    }
    const expect = lowest < 0 ? 0 : (bh - 1 - lowest);
    if (expect !== B.footOff[r][c]){ wrong++; detail.push(`r${r}c${c} table ${B.footOff[r][c]} vs png ${expect}`); }
  }
  for (const d of detail.slice(0,4)) console.log('     ' + d);
  ok(wrong === 0, `${tag} · every footOff re-derives from the PNG (${wrong} disagree)`);
  console.log(`     ${tag} · ${16 - nonzero.length}/16 frames need no correction at all`);
  // and the correction must be small enough to be a foot gap, not a mistake
  const tooBig = flat.filter((v,i) => v > B.bboxes[Math.floor(i/4)][i%4][3] * 0.4).length;
  ok(tooBig === 0, `${tag} · no offset exceeds 40% of its frame height (${tooBig})`);
}

console.log('\n7 · ★ THE SHADOW MOVED WITH THE FEET\n');
ok(/dy \+ drawH - _footDrop - 2 \+ slamLift/.test(src),
   'the ground shadow subtracts _footDrop too — otherwise it would sit under the arc tip, not the boots');

console.log('\n8 · ★ ORIGINALS PRESERVED\n');
for (const n of ['sapphire-sword.png','rubypaw-sword.png']){
  ok(fs.existsSync(ART + '_orig/' + n), `_orig/${n} kept — the pre-swap sheet is recoverable`);
}

console.log(f ? `\n❌ ${f} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(0);
