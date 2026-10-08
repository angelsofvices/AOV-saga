// Astragraphy bodies: turns a world's visual recipe (aethryx-data.js) into a 3D model.
// A recipe is data: a surface description plus any of lattice, rings, spires, crystals, canopy, tree, islands,
// debris, halo, lens, atmosphere, clouds, flames, sonic, moons, trail. Worlds are not forced into
// sphere + texture + clouds; each feature is its own builder and a world uses only the ones its reference shows.
// detail 0 = Expanse view (silhouette, palette, rings, big structures) · detail 1 = inspection (everything).
import * as THREE from 'three';

export const R0 = 3.3; // base world radius in Expanse units
const UP = new THREE.Vector3(0, 1, 0);
const rng = seed => () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const seedOf = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
const rgb = hex => { const c = new THREE.Color(hex); return [c.r * 255, c.g * 255, c.b * 255]; };
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mix3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const rampAt = (R, t) => { t = Math.min(0.9999, Math.max(0, t)) * (R.length - 1); const i = Math.floor(t); return mix3(R[i], R[i + 1], t - i); };
const line = (v, w) => { const f = v - Math.floor(v), d = Math.min(f, 1 - f); return d < w ? 1 - d / w : 0; };

// ── seamless noise on the sphere ──
function hash(x, y, z, s) { let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177) ^ Math.imul(s, 974711); h = Math.imul(h ^ (h >>> 13), 1103515245); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
function vnoise(x, y, z, s) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), fx = x - xi, fy = y - yi, fz = z - zi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
  const l = (a, b, t) => a + (b - a) * t;
  return l(l(l(hash(xi, yi, zi, s), hash(xi + 1, yi, zi, s), u), l(hash(xi, yi + 1, zi, s), hash(xi + 1, yi + 1, zi, s), u), v),
    l(l(hash(xi, yi, zi + 1, s), hash(xi + 1, yi, zi + 1, s), u), l(hash(xi, yi + 1, zi + 1, s), hash(xi + 1, yi + 1, zi + 1, s), u), v), w);
}
function fbm(x, y, z, s, oct) { let a = 0.5, f = 1, n = 0, m = 0; for (let i = 0; i < oct; i++) { n += a * vnoise(x * f, y * f, z * f, s + i * 17); m += a; a *= 0.5; f *= 2.03; } return n / m; }

function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function texture(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }

// Paint a world's surface from its recipe. Returns { map, emissiveMap }.
function paint(S, W, seed) {
  const H = W >> 1, cm = canvas(W, H), ce = canvas(W, H), xm = cm.getContext('2d'), xe = ce.getContext('2d');
  const im = xm.createImageData(W, H), ie = xe.createImageData(W, H), dm = im.data, de = ie.data;
  const R = S.ramp.map(rgb), G = rgb(S.glow || '#ffffff'), sc = S.scale || 2.4, mixB = S.bandMix ?? 0.6, tmp = new THREE.Color();
  const pole = new THREE.Vector3(0.55, 0.3, 0.78).normalize(), scar = new THREE.Vector3(0.1, 0.25, 0.96).normalize(), sx = new THREE.Vector3().crossVectors(UP, scar).normalize(), sy = new THREE.Vector3().crossVectors(scar, sx);
  let needEm = !!(S.glow || S.self);
  for (let y = 0; y < H; y++) {
    const lat = (0.5 - (y + 0.5) / H) * Math.PI, cl = Math.cos(lat), dy = Math.sin(lat);
    for (let x = 0; x < W; x++) {
      const lon = (x + 0.5) / W * Math.PI * 2, dx = cl * Math.cos(lon), dz = cl * Math.sin(lon), i = (y * W + x) * 4;
      let n = fbm(dx * sc + 7, dy * sc + 7, dz * sc + 7, seed, 4);
      n = Math.min(1, Math.max(0, (n - 0.5) * 1.9 + 0.5));
      if (S.bands) { const w = S.swirl ? (fbm(dx * 1.4, dy * 1.4, dz * 1.4, seed + 3, 2) - 0.5) * S.swirl : 0; n = n * (1 - mixB) + (0.5 + 0.5 * Math.sin(lat * S.bands * 2 + w * 4 + n * 2)) * mixB; }
      let col;
      if (S.land != null) { // oceans below the land line, then forest → mountain → snow (ramp: 3 sea stops, 4 land stops)
        col = n < S.land ? rampAt(R.slice(0, 3), n / S.land) : rampAt(R.slice(3), (n - S.land) / (1 - S.land));
      } else col = rampAt(R, n);
      if (S.iridescent) { tmp.setHSL((n * 0.9 + lon / 6.283 + dy * 0.3) % 1, 0.6, 0.74); col = mix3(col, [tmp.r * 255, tmp.g * 255, tmp.b * 255], 0.3); }
      if (S.polar && Math.abs(dy) > S.polar - n * 0.12) col = mix3(col, [246, 249, 252], 0.92);
      if (S.blots) { const b = fbm(dx * S.blots.scale, dy * S.blots.scale * 2.2, dz * S.blots.scale, seed + 11, 3); if (b > S.blots.cut) col = mix3(col, rgb(S.blots.color), sstep(0, 0.08, b - S.blots.cut)); }
      let em = 0;
      if (S.cracks) { const c = S.cracks, r = Math.abs(fbm(dx * c.scale + 3, dy * c.scale + 3, dz * c.scale + 3, seed + 7, 4) - 0.5), k = 1 - sstep(0, c.w, r); if (c.dark) { col = mix3(col, [4, 2, 6], k * 0.85); em = Math.max(em, k * k * k * 0.7); } else em = Math.max(em, k); }
      if (S.grid) { let k = Math.max(line(lon / 6.283 * S.grid * 2, 0.07), line(lat / Math.PI * S.grid, 0.07)); if (S.gridSoft) k *= fbm(dx * 3, dy * 3, dz * 3, seed + 5, 2) > 0.52 ? 1 : 0.12; em = Math.max(em, k); }
      if (S.ripples) { const a = Math.acos(Math.max(-1, Math.min(1, dx * pole.x + dy * pole.y + dz * pole.z))); em = Math.max(em, Math.pow(0.5 + 0.5 * Math.cos(a * S.ripples), 8) * (1 - a / Math.PI)); }
      if (S.spiral) { const a = Math.acos(Math.max(-1, Math.min(1, dx * scar.x + dy * scar.y + dz * scar.z))), th = Math.atan2(dx * sy.x + dy * sy.y + dz * sy.z, dx * sx.x + dy * sx.y + dz * sx.z); const k = line(th / 6.283 + a * S.spiral / 2.2, 0.09) * (1 - sstep(0.7, 2.3, a)); em = Math.max(em, k * 0.8); col = mix3(col, [20, 26, 36], k * 0.5); }
      dm[i] = col[0]; dm[i + 1] = col[1]; dm[i + 2] = col[2]; dm[i + 3] = 255;
      const s = (S.self || 0) * (0.45 + 0.55 * n);
      de[i] = Math.min(255, col[0] * s + G[0] * em); de[i + 1] = Math.min(255, col[1] * s + G[1] * em); de[i + 2] = Math.min(255, col[2] * s + G[2] * em); de[i + 3] = 255;
      if (em > 0) needEm = true;
    }
  }
  xm.putImageData(im, 0, 0); xe.putImageData(ie, 0, 0);
  if (S.craters) { const r = rng(seed + 99); for (let k = 0; k < S.craters; k++) { const cx = r() * W, cy = (0.15 + r() * 0.7) * H, cr = (0.012 + r() * 0.03) * W; xm.fillStyle = 'rgba(10,2,3,.55)'; xm.beginPath(); xm.ellipse(cx, cy, cr, cr * 0.9, 0, 0, 6.3); xm.fill(); xm.strokeStyle = 'rgba(255,120,90,.35)'; xm.lineWidth = Math.max(1, W / 400); xm.stroke(); } }
  return { map: texture(cm), emissiveMap: needEm ? texture(ce) : null };
}
function paintClouds(C, W, seed) {
  const H = W >> 1, c = canvas(W, H), x2 = c.getContext('2d'), im = x2.createImageData(W, H), d = im.data, col = rgb(C.color);
  for (let y = 0; y < H; y++) { const lat = (0.5 - (y + 0.5) / H) * Math.PI, cl = Math.cos(lat), dy = Math.sin(lat);
    for (let x = 0; x < W; x++) { const lon = (x + 0.5) / W * 6.2832, dx = cl * Math.cos(lon), dz = cl * Math.sin(lon), i = (y * W + x) * 4;
      let n = fbm(dx * 2.6 + 11, dy * 2.6 + 11, dz * 2.6 + 11, seed + 31, 4);
      if (C.bands) n = n * 0.55 + (0.5 + 0.5 * Math.sin(lat * C.bands * 2 + n * 5)) * 0.45;
      d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255 * sstep(0.5, 0.72, n) * C.opacity; } }
  x2.putImageData(im, 0, 0); return texture(c);
}

// ── shared sprite textures (never disposed with a body) ──
let _glow, _ring, _lens, _dot;
const shared = t => { t.userData = { shared: true }; return t; };
function glowTex() { if (_glow) return _glow; const c = canvas(128, 128), x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.5)'); g.addColorStop(0.6, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return (_glow = shared(texture(c))); }
function lensTex() { if (_lens) return _lens; const c = canvas(256, 256), x = c.getContext('2d'), g = x.createRadialGradient(128, 128, 60, 128, 128, 128); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.35, 'rgba(255,255,255,.9)'); g.addColorStop(0.5, 'rgba(255,255,255,.25)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); return (_lens = shared(texture(c))); }
export function ringMarkTex() { if (_ring) return _ring; const c = canvas(256, 256), x = c.getContext('2d'); x.strokeStyle = '#fff'; x.lineWidth = 7; x.beginPath(); x.arc(128, 128, 112, 0, 6.3); x.stroke(); x.lineWidth = 2; x.setLineDash([5, 9]); x.beginPath(); x.arc(128, 128, 96, 0, 6.3); x.stroke(); return (_ring = shared(texture(c))); }
function dotTex() { if (_dot) return _dot; const c = canvas(32, 32), x = c.getContext('2d'), g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, '#fff'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); return (_dot = shared(texture(c))); }
export function glowSprite(color, size, opacity = 0.5, tex = glowTex()) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.setScalar(size); return s; }

const dirOf = (lon, lat) => { const a = lon * Math.PI / 180, b = lat * Math.PI / 180; return new THREE.Vector3(Math.cos(b) * Math.sin(a), Math.sin(b), Math.cos(b) * Math.cos(a)); };
export { dirOf };
function randDir(r, around, spread) { // a direction within `spread` radians of `around` (anywhere when spread ≥ π)
  if (!around || spread >= Math.PI) { const u = r() * 2 - 1, a = r() * 6.2832, s = Math.sqrt(1 - u * u); return new THREE.Vector3(s * Math.cos(a), u, s * Math.sin(a)); }
  const ang = Math.sqrt(r()) * spread, az = r() * 6.2832, t = new THREE.Vector3(1, 0, 0).applyAxisAngle(UP, az).cross(around).normalize();
  return around.clone().applyAxisAngle(t, ang).normalize();
}
const place = (o, dir, dist) => { o.position.copy(dir).multiplyScalar(dist); o.quaternion.setFromUnitVectors(UP, dir); return o; };
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, flatShading: true, ...o });

// ── feature builders: each returns an Object3D (and may register an animation) ──
const FEATURES = {
  lattice(F, r, d) { // a geodesic lattice of light over the world
    const g = new THREE.Group(), geo = new THREE.IcosahedronGeometry(r * 1.03, F.detail || 2);
    const lines = new THREE.LineSegments(new THREE.WireframeGeometry(geo), new THREE.LineBasicMaterial({ color: F.color, transparent: true, opacity: F.opacity ?? 0.75, blending: THREE.AdditiveBlending, depthWrite: false })); g.add(lines);
    if (d) g.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: F.color, size: r * 0.09, map: dotTex(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }))); else geo.dispose();
    return g;
  },
  rings(F, r, d) {
    const g = new THREE.Group();
    for (const k of F) {
      const c = canvas(256, 4), x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 256, 0), R = rng(seedOf(k.color) + 5);
      for (let i = 0; i <= 16; i++) gr.addColorStop(i / 16, `rgba(255,255,255,${k.solid ? 1 : (0.25 + R() * 0.75) * Math.sin(Math.PI * Math.min(1, i / 16 + 0.04))})`);
      x.fillStyle = gr; x.fillRect(0, 0, 256, 4);
      const geo = new THREE.RingGeometry(r * k.inner, r * k.outer, d ? 96 : 48, 1), uv = geo.attributes.uv, p = geo.attributes.position;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, (Math.hypot(p.getX(i), p.getY(i)) - r * k.inner) / (r * (k.outer - k.inner)), 0.5);
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: k.color, map: texture(c), transparent: true, opacity: k.opacity, side: THREE.DoubleSide, depthWrite: false, blending: k.solid ? THREE.NormalBlending : THREE.AdditiveBlending }));
      m.rotation.set(k.tilt[0], 0, k.tilt[1]); g.add(m);
    }
    return g;
  },
  spires(F, r, d, R) { // towers, cathedral spires or industrial stacks rising from one region
    const g = new THREE.Group(), n = d ? F.count : Math.ceil(F.count * 0.45), c = dirOf(F.lon, F.lat), body = std(F.color, { metalness: 0.3 }), tip = std(F.glow, { emissive: new THREE.Color(F.glow), emissiveIntensity: 0.55 });
    for (let i = 0; i < n; i++) {
      const dir = randDir(R, c, F.spread), near = 1 - c.angleTo(dir) / Math.max(F.spread, 0.01), h = r * F.h * (0.35 + 0.65 * R()) * (0.5 + 0.5 * near), w = r * (F.style === 'stack' ? 0.07 : 0.05) * (0.7 + R() * 0.6), s = new THREE.Group();
      if (F.style === 'cathedral') { const b = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.55, w, h * 0.6, 5), body); b.position.y = h * 0.3; const t = new THREE.Mesh(new THREE.ConeGeometry(w * 0.6, h * 0.5, 5), tip); t.position.y = h * 0.85; s.add(b, t); }
      else if (F.style === 'stack') { const b = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.7, w, h, 6), body); b.position.y = h * 0.5; const t = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.75, w * 0.75, h * 0.08, 6), tip); t.position.y = h; s.add(b, t); }
      else { const b = new THREE.Mesh(new THREE.BoxGeometry(w * 1.3, h, w * 1.3), body); b.position.y = h * 0.5; const t = new THREE.Mesh(new THREE.ConeGeometry(w, h * 0.3, 4), tip); t.position.y = h * 1.15; s.add(b, t); }
      g.add(place(s, dir, r * 0.98));
    }
    return g;
  },
  crystals(F, r, d, R) { // crystal or ice spikes, or broken shards, standing out of the surface
    const g = new THREE.Group(), n = d ? F.count : Math.ceil(F.count * 0.5), mat = std(F.color, { roughness: 0.2, metalness: 0.3, emissive: new THREE.Color(F.glow), emissiveIntensity: 0.22 });
    for (let i = 0; i < n; i++) { const len = r * F.len * (0.4 + R() * 0.8), m = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), mat); m.scale.set(r * F.wide * (0.6 + R() * 0.7), len, r * F.wide * (0.6 + R() * 0.7)); const dir = randDir(R); place(m, dir, r * 0.95 + len * 0.45); m.rotateY(R() * 3); g.add(m); }
    return g;
  },
  canopy(F, r, d, R) { // a forest that covers the whole world
    const g = new THREE.Group(), n = d ? F.count : Math.ceil(F.count * 0.4), mats = F.color.map(c => std(c));
    for (let i = 0; i < n; i++) { const s = r * F.size * (0.6 + R() * 0.9), m = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), mats[i % mats.length]); place(m, randDir(R), r * 0.96 + s * 0.35); m.rotateY(R() * 3); g.add(m); }
    return g;
  },
  tree(F, r, d, R) { // one tree as large as the world, its roots gripping the planet
    const g = new THREE.Group(), trunk = std(F.trunk), mats = F.leaf.map(c => std(c));
    const t = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.24, r * 0.5, r * 0.55, 7), trunk); t.position.y = r * 1.1; g.add(t);
    const n = d ? 30 : 12;
    for (let i = 0; i < n; i++) { const a = R() * 6.2832, rad = Math.sqrt(R()) * r * 1.25, s = r * (0.34 + R() * 0.3), m = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), mats[i % mats.length]); m.position.set(Math.cos(a) * rad, r * (1.3 + 0.42 * (1 - rad / (r * 1.25)) + R() * 0.12), Math.sin(a) * rad); m.rotation.set(R() * 3, R() * 3, 0); g.add(m); }
    const roots = d ? 9 : 5;
    for (let i = 0; i < roots; i++) { const a = i / roots * 6.2832 + R() * 0.3, pts = []; for (let k = 0; k <= 8; k++) { const lat = Math.PI / 2 - 0.25 - k / 8 * (1.3 + R() * 0.3), w = a + Math.sin(k * 0.9 + i) * 0.16; pts.push(new THREE.Vector3(Math.cos(lat) * Math.cos(w), Math.sin(lat), Math.cos(lat) * Math.sin(w)).multiplyScalar(r * 1.015)); }
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, r * 0.06, 5), trunk)); }
    return g;
  },
  islands(F, r, d, R, anim) { // landmasses hovering above the surface
    const g = new THREE.Group(), n = d ? F.count : Math.ceil(F.count * 0.45), rock = std(F.rock), top = std(F.top), fall = new THREE.MeshBasicMaterial({ color: '#eaf8ff', transparent: true, opacity: 0.55 }), leaf = std('#2f7a2a');
    for (let i = 0; i < n; i++) {
      const dir = randDir(R), alt = r * (F.alt[0] + R() * (F.alt[1] - F.alt[0])), s = r * F.size * (0.5 + R() * 0.9), isle = new THREE.Group();
      const under = new THREE.Mesh(new THREE.ConeGeometry(s, s * 1.1, 6), rock); under.rotation.x = Math.PI; under.position.y = -s * 0.55;
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.95, s, s * 0.22, 6), top); cap.position.y = s * 0.08; isle.add(under, cap);
      if (d && F.trees) for (let k = 0; k < 2; k++) { const tr = new THREE.Mesh(new THREE.IcosahedronGeometry(s * 0.3, 0), leaf); tr.position.set((R() - 0.5) * s, s * 0.4, (R() - 0.5) * s); isle.add(tr); }
      if (d && F.falls && R() < 0.6) { const len = alt - r * 1.0 - s * 0.5, w = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.06, s * 0.12, len, 5), fall); w.position.set(s * 0.6, -len / 2, 0); isle.add(w); }
      place(isle, dir, alt); isle.rotateY(R() * 6); g.add(isle);
    }
    anim.push((dt, t) => { g.rotation.y = t * 0.012; });
    return g;
  },
  debris(F, r, d, R, anim) { // broken rock travelling with the world
    const n = d ? F.count : Math.ceil(F.count * 0.4), m = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), std(F.color, { roughness: 0.95 }), n), o = new THREE.Object3D();
    for (let i = 0; i < n; i++) { const a = R() * 6.2832, rad = r * (F.spread[0] + R() * (F.spread[1] - F.spread[0])); o.position.set(Math.cos(a) * rad, (R() - 0.5) * r * 0.7, Math.sin(a) * rad); o.rotation.set(R() * 6, R() * 6, R() * 6); o.scale.setScalar(r * (0.04 + R() * 0.12)); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }
    m.rotation.set(0.35, 0, 0.2); anim.push(dt => { m.rotation.y += dt * 0.05; });
    return m;
  },
  halo(F, r) { return glowSprite(F.color, r * F.size, F.opacity); },
  lens(F, r) { return glowSprite(F.color, r * F.size, 0.55, lensTex()); }, // light bent into a ring around the world
  atmosphere(F, r, d) { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(r * 1.035, d ? 4 : 2), new THREE.MeshBasicMaterial({ color: F.color, transparent: true, opacity: F.opacity * 0.5, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false }))); g.add(glowSprite(F.color, r * 2.9, F.opacity * 1.3)); return g; },
  clouds(F, r, d, R, anim, seed) { const m = new THREE.Mesh(new THREE.SphereGeometry(r * 1.035, d ? 48 : 20, d ? 32 : 12), new THREE.MeshStandardMaterial({ map: paintClouds(F, d ? 512 : 128, seed), transparent: true, depthWrite: false, roughness: 1 })); anim.push(dt => { m.rotation.y += dt * 0.02; }); return m; },
  flames(F, r, d, R, anim) { // fire lifting off the surface
    const n = d ? F.count : Math.ceil(F.count * 0.3), pos = new Float32Array(n * 3), dirs = [], ph = [];
    for (let i = 0; i < n; i++) { dirs.push(randDir(R)); ph.push(R()); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: F.color, size: r * (d ? 0.22 : 0.3), map: dotTex(), transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
    const step = (dt, t) => { for (let i = 0; i < n; i++) { const k = (ph[i] + t * 0.25) % 1, q = r * (1 + k * F.lift); pos[i * 3] = dirs[i].x * q; pos[i * 3 + 1] = dirs[i].y * q + k * r * F.lift * 0.5; pos[i * 3 + 2] = dirs[i].z * q; } geo.attributes.position.needsUpdate = true; };
    step(0, 0); anim.push(step); pts.frustumCulled = false; return pts;
  },
  sonic(F, r, d, R, anim) { // rings of sound spreading out from the world
    const g = new THREE.Group(), rings = [];
    for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.012, 5, d ? 72 : 36), new THREE.MeshBasicMaterial({ color: F.color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); m.rotation.x = 1.25; g.add(m); rings.push(m); }
    const step = (dt, t) => rings.forEach((m, i) => { const k = (t * 0.22 + i / 3) % 1; m.scale.setScalar(1.1 + k * 0.9); m.material.opacity = (1 - k) * 0.7; });
    step(0, 0); anim.push(step); return g;
  },
  moons(F, r, d, R, anim, seed, anchors) {
    const g = new THREE.Group();
    F.forEach((mn, i) => { const tx = paint({ ramp: mn.color, scale: 3 }, d ? 128 : 32, seed + 50 + i), m = new THREE.Mesh(new THREE.IcosahedronGeometry(r * mn.r, d ? 2 : 1), new THREE.MeshStandardMaterial({ map: tx.map, flatShading: true, roughness: 0.9 })); g.add(m); anchors[mn.id] = m;
      const step = (dt, t) => { const a = mn.phase + t * mn.speed; m.position.set(Math.cos(a) * r * mn.dist, r * mn.y, Math.sin(a) * r * mn.dist); m.rotation.y = t * 0.05; }; step(0, 0); anim.push(step); });
    return g;
  },
  trail(F, r) { // the faint trail a drifting world leaves behind it
    const c = canvas(8, 128), x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,.7)'); x.fillStyle = gr; x.fillRect(0, 0, 8, 128);
    const m = new THREE.Mesh(new THREE.ConeGeometry(r * 0.45, r * 6, 12, 1, true), new THREE.MeshBasicMaterial({ color: F.color, map: texture(c), transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    m.rotation.z = Math.PI / 2; m.position.x = r * 3.2; return m;
  }
};
const STILL = ['halo', 'lens', 'rings', 'debris', 'moons', 'sonic', 'trail', 'atmosphere']; // not carried round by the world's own spin

// Build one world. Returns { group, r, extent, spin, anchors, animate(dt, t), dispose() }.
export function buildWorld(target, detail) {
  const V = target.visual, r = R0 * (V.size || 1), seed = seedOf(target.id), R = rng(seed), group = new THREE.Group(), spin = new THREE.Group(), anim = [], anchors = {};
  group.add(spin);
  const geoDetail = V.geometry === 'polyhedron' ? 0 : V.geometry === 'faceted' ? 1 : detail ? 4 : 2;
  const geo = new THREE.IcosahedronGeometry(r, geoDetail);
  if (V.geometry === 'faceted') { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const k = 1 + (hash(Math.round(v.x * 50), Math.round(v.y * 50), Math.round(v.z * 50), seed) - 0.5) * 0.14; p.setXYZ(i, v.x * k, v.y * k, v.z * k); } geo.computeVertexNormals(); }
  const S = V.surface, tx = paint(S, detail ? 512 : 128, seed);
  const mat = new THREE.MeshStandardMaterial({ map: tx.map, roughness: Math.max(0.5, S.rough ?? 0.8), metalness: Math.min(0.3, S.metal ?? 0), flatShading: !!V.geometry }); // faceted worlds keep their hard edges; round ones shade smoothly
  if (tx.emissiveMap) { mat.emissiveMap = tx.emissiveMap; mat.emissive = new THREE.Color('#ffffff'); mat.emissiveIntensity = S.power ?? 1; }
  spin.add(new THREE.Mesh(geo, mat));
  for (const k of Object.keys(FEATURES)) if (V[k]) (STILL.includes(k) ? group : spin).add(FEATURES[k](V[k], r, detail, R, anim, seed, anchors));
  const rate = 0.05 * (V.spin || 1);
  return { group, spin, r, extent: V.extent || 1.25, anchors, frozen: false,
    animate(dt, t) { if (!this.frozen) spin.rotation.y += dt * rate; for (const f of anim) f(dt, t); },
    dispose() { disposeTree(group); } };
}

// Aenor, the Highest Eye: a gold-white star with a corona, a cross-shaped flare, and the eye inside it.
export function buildStar(target, detail) {
  const r = R0 * target.visual.size, group = new THREE.Group(), spin = new THREE.Group(), seed = seedOf('aenor'); group.add(spin);
  const tx = paint({ ramp: ['#c8641a', '#ffb02a', '#fff2b0'], scale: 3.2, cracks: { scale: 3, w: 0.08 }, glow: '#fff6c8' }, detail ? 512 : 128, seed);
  spin.add(new THREE.Mesh(new THREE.IcosahedronGeometry(r, detail ? 4 : 3), new THREE.MeshBasicMaterial({ map: tx.map }))); tx.emissiveMap?.dispose();
  const g1 = glowSprite('#ffb84a', r * 5, 0.55), g2 = glowSprite('#fff0c0', r * 3, 0.8); group.add(g1, g2); let dim = 1;
  const fc = canvas(256, 256), x = fc.getContext('2d'); for (const [w, h] of [[256, 10], [10, 256]]) { const g = w > h ? x.createLinearGradient(0, 0, 256, 0) : x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect((256 - w) / 2, (256 - h) / 2, w, h); }
  const flare = glowSprite('#ffe6a0', r * 7, 0.5, texture(fc)); group.add(flare);
  const ec = canvas(256, 256), e = ec.getContext('2d'); e.strokeStyle = 'rgba(120,50,0,.85)'; e.lineWidth = 9; e.beginPath(); e.moveTo(28, 128); e.quadraticCurveTo(128, 30, 228, 128); e.quadraticCurveTo(128, 226, 28, 128); e.stroke(); e.beginPath(); e.arc(128, 128, 34, 0, 6.3); e.stroke(); e.fillStyle = 'rgba(120,50,0,.85)'; e.beginPath(); e.arc(128, 128, 13, 0, 6.3); e.fill();
  const eye = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture(ec), transparent: true, depthTest: false, depthWrite: false })); eye.scale.setScalar(r * 1.5); eye.renderOrder = 5; group.add(eye);
  const anchors = { eye };
  return { group, spin, r, extent: target.visual.extent, anchors, frozen: false,
    setDim(k) { dim = k; g1.material.opacity = 0.55 * k; g2.material.opacity = 0.8 * k; },
    animate(dt, t) { if (!this.frozen) spin.rotation.y += dt * 0.03; flare.material.opacity = (0.42 + Math.sin(t * 0.8) * 0.08) * dim; flare.material.rotation = Math.sin(t * 0.1) * 0.05; },
    dispose() { disposeTree(group); } };
}
export function disposeTree(o) {
  o.traverse(c => { c.geometry?.dispose?.(); const ms = Array.isArray(c.material) ? c.material : c.material ? [c.material] : []; for (const m of ms) { for (const k of ['map', 'emissiveMap', 'alphaMap']) if (m[k] && !m[k].userData?.shared) m[k].dispose(); m.dispose(); } if (c.isInstancedMesh) c.dispose(); });
}
