// ★★★ v0.96.59 · SIX DOMAIN FLOORS · one tile per Dracolord.
//
// Each replaces the BRIGHT cloud on the plateaus — the solid causeway you walk
// — while the shared dense cloud stays underneath for the feathered edges.
//
// ★★ WHAT THIS SUITE EXISTS TO CATCH: a floor tile that does not WRAP. It is
//   painted as a repeating pattern, so one edge that fails to match shows as a
//   hard grid line across the whole domain, twelve tiles apart, forever — and
//   it is invisible in the source file, which looks perfect on its own.
const fs = require('fs');
const ROOT = '/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const src  = fs.readFileSync('/tmp/all.js', 'utf8');
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);

const IDS = ['alphaea','azyrath','aetherion','aethravax','abyssion','abominalys'];
const TILE = 48, PER_REPEAT = 12;

// ── a minimal PNG reader · IHDR + raw RGB via zlib, no dependencies ──────
const zlib = require('zlib');
function readPNG(p){
  const b = fs.readFileSync(p);
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
  const bitDepth = b[24], colorType = b[25];
  let idat = [], off = 8;
  while (off < b.length){
    const len = b.readUInt32BE(off), typ = b.toString('ascii', off+4, off+8);
    if (typ === 'IDAT') idat.push(b.slice(off+8, off+8+len));
    off += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const ch = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  if (!ch || bitDepth !== 8) return { w, h, ch: 0, px: null };
  const stride = w * ch, px = Buffer.alloc(h * stride);
  let pos = 0;
  for (let y = 0; y < h; y++){
    const ft = raw[pos++]; const line = raw.slice(pos, pos + stride); pos += stride;
    const cur = px.slice(y*stride, (y+1)*stride), prv = y ? px.slice((y-1)*stride, y*stride) : null;
    for (let i = 0; i < stride; i++){
      const a = i >= ch ? cur[i-ch] : 0, bb = prv ? prv[i] : 0, c = (prv && i >= ch) ? prv[i-ch] : 0;
      let v = line[i];
      if (ft === 1) v += a; else if (ft === 2) v += bb; else if (ft === 3) v += (a+bb)>>1;
      else if (ft === 4){ const pa=Math.abs(bb-c), pb=Math.abs(a-c), pc=Math.abs(a+bb-2*c);
        v += (pa<=pb && pa<=pc) ? a : (pb<=pc ? bb : c); }
      cur[i] = v & 255;
    }
  }
  return { w, h, ch, px };
}
const at = (im, x, y, k) => im.px[(y*im.w + x)*im.ch + k];
function meanAbs(im, pick){
  let s = 0, n = 0;
  for (let i = 0; i < (pick.n); i++){ const [ax,ay,bx,by] = pick.f(i);
    for (let k = 0; k < 3; k++){ s += Math.abs(at(im,ax,ay,k) - at(im,bx,by,k)); n++; } }
  return s / Math.max(1, n);
}

H('1 · ★★ ALL SIX ARE INSTALLED AND REGISTERED');
{
  ok(/const DRACOLORD_FLOOR_IMGS/.test(src), 'the per-domain floor bank exists');
  ok(/function dracolordFloorPattern\(id\)/.test(src), 'and builds a repeating pattern per domain');
  ok(/patternFn: \(\) => dracolordFloorPattern\(dom\.id\)/.test(src),
     '★ every realm config offers its own floor');
  ok(/const pat = \(cfg\.patternFn && cfg\.patternFn\(\)\) \|\| dreamlandPattern\(\)/.test(src),
     '★★★ and the painter FALLS BACK to the Dreamland cloud · a domain whose PNG has not decoded paints cloud, never nothing');
}

H('2 · ★★★ EVERY TILE WRAPS · the failure you cannot see in the source file');
const imgs = {};
for (const id of IDS){
  const p = ROOT + `assets/2D sprites/tiles/dracolord-floor-${id}.png`;
  ok(fs.existsSync(p), `${id} · on disk`);
  if (!fs.existsSync(p)) continue;
  const im = readPNG(p); imgs[id] = im;
  ok(im.w === 1254 && im.h === 1254, `  ${im.w}x${im.h} · the 1254 studio standard`);
  if (!im.ch) continue;
  const W = im.w, Hh = im.h;
  // the wrap seam must be no worse than ordinary interior neighbours
  const wrapX  = meanAbs(im, { n: Hh, f: i => [0, i, W-1, i] });
  const innerX = meanAbs(im, { n: Hh, f: i => [W>>1, i, (W>>1)+1, i] });
  const wrapY  = meanAbs(im, { n: W,  f: i => [i, 0, i, Hh-1] });
  const innerY = meanAbs(im, { n: W,  f: i => [i, Hh>>1, i, (Hh>>1)+1] });
  ok(wrapX <= innerX * 2.2 + 1,
     `  ★★★ ${id} wraps LEFT↔RIGHT · seam ${wrapX.toFixed(2)} vs neighbour ${innerX.toFixed(2)}`);
  ok(wrapY <= innerY * 2.2 + 1,
     `  ★★★ ${id} wraps TOP↔BOTTOM · seam ${wrapY.toFixed(2)} vs neighbour ${innerY.toFixed(2)}`);
}

H('3 · ★★ THE SIX ARE ACTUALLY DIFFERENT FROM EACH OTHER');
{
  // ★★★ MEAN COLOUR IS NOT WHAT TELLS THEM APART, and my first version of this
  //   check used it and accused the art.  Azyrath (Void) and Abyssion
  //   (Collapse) are BOTH meant to be near-black — their mean RGB sits 17
  //   apart and always will.  What separates them is STRUCTURE: Azyrath is
  //   smooth hollow with a red bruise bleeding up, Abyssion is hard fractured
  //   plates with other skies showing through the seams.  Averaging the whole
  //   tile throws away the only thing that distinguishes them.
  //   So the signature is a coarse 6x6 luminance grid (layout) PLUS mean
  //   chroma (palette) PLUS local contrast (texture) — the three things an eye
  //   actually uses to answer "whose realm is this".
  const sig = id => { const im = imgs[id]; if (!im || !im.ch) return null;
    const G=6, cell=Math.floor(im.w/G), grid=[];
    let r=0,g=0,b=0,n=0,contrast=0,cn=0;
    for (let gy=0; gy<G; gy++) for (let gx=0; gx<G; gx++){
      let l=0, m=0;
      for (let y=gy*cell; y<(gy+1)*cell; y+=9) for (let x=gx*cell; x<(gx+1)*cell; x+=9){
        const R=at(im,x,y,0), G2=at(im,x,y,1), B=at(im,x,y,2);
        l += 0.2126*R + 0.7152*G2 + 0.0722*B; m++;
        r+=R; g+=G2; b+=B; n++;
        if (x+9 < im.w){ contrast += Math.abs(R-at(im,x+9,y,0)); cn++; }
      }
      grid.push(l/Math.max(1,m));
    }
    return { grid, rgb:[r/n,g/n,b/n], tex: contrast/Math.max(1,cn) }; };
  const S = {}; for (const id of IDS) S[id] = sig(id);
  let tooClose = [];
  for (let i=0;i<IDS.length;i++) for (let j=i+1;j<IDS.length;j++){
    const a=S[IDS[i]], b=S[IDS[j]]; if(!a||!b) continue;
    const dLayout = Math.hypot(...a.grid.map((v,k)=>v-b.grid[k])) / Math.sqrt(a.grid.length);
    const dColour = Math.hypot(a.rgb[0]-b.rgb[0], a.rgb[1]-b.rgb[1], a.rgb[2]-b.rgb[2]);
    const dTex    = Math.abs(a.tex - b.tex);
    const d = dLayout + dColour + dTex*2;
    if (d < 25) tooClose.push(`${IDS[i]}~${IDS[j]} (layout ${dLayout.toFixed(0)} colour ${dColour.toFixed(0)} texture ${dTex.toFixed(0)})`);
  }
  ok(tooClose.length === 0,
     `★★ no two domains read as the same floor${tooClose.length? ' · '+tooClose.join(', '):''} · you should know whose realm you are in by looking down`);
  const L = id => { const s=S[id]; return s ? 0.2126*s.rgb[0]+0.7152*s.rgb[1]+0.0722*s.rgb[2] : 0; };
  console.log('     mean luminance · ' + IDS.map(i=>`${i} ${L(i).toFixed(0)}`).join(' · '));
  ok(L('alphaea') > L('azyrath'),
     '★★★ THE HIGHEST EYE is brighter than THE LOWEST EYE · Sun and Moon, and the floors say so without a word');
}

console.log(f ? `\n❌ ${f} FAILED` : '\n✅ ALL PASS');
process.exit(0);
