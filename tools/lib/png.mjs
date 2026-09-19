// ★★ A DEPENDENCY-FREE RGBA8 PNG READER · v0.99.5
//
// Lifted out of verify_fieldstation.js, which needed to inspect PIXELS to
// enforce a Creator ruling about art orientation and could not install anything
// to do it. The sandbox has no image library for node, so this decodes the
// IDAT stream and undoes the five PNG filters by hand.
//
// ★ Scope, stated: 8-bit RGBA only (colour type 6, bit depth 8). Anything else
//   returns null rather than a wrong answer — a decoder that silently
//   mis-reads a 16-bit sheet would make every assertion built on it a lie.
import fs from 'fs';
import zlib from 'zlib';

export function readPng(p){
  const buf = fs.readFileSync(p);
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  if (buf[24] !== 8 || buf[25] !== 6) return null;        // RGBA8 only
  const idat = [];
  let off = 8;
  while (off < buf.length){
    const len = buf.readUInt32BE(off);
    if (buf.toString('ascii', off + 4, off + 8) === 'IDAT') idat.push(buf.slice(off + 8, off + 8 + len));
    off += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = 4, stride = w * bpp;
  const out = Buffer.alloc(h * stride);
  let pos = 0;
  for (let y = 0; y < h; y++){
    const ft = raw[pos++];
    const line = raw.slice(pos, pos + stride); pos += stride;
    const prev = y > 0 ? out.slice((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    const cur  = out.slice(y * stride, (y + 1) * stride);
    for (let x = 0; x < stride; x++){
      const a = x >= bpp ? cur[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      if (ft === 1) v += a; else if (ft === 2) v += b;
      else if (ft === 3) v += (a + b) >> 1;
      else if (ft === 4){
        const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      }
      cur[x] = v & 255;
    }
  }
  return { w, h, data: out };
}
