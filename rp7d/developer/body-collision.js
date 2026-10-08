// RP7D · solid bodies. Enemies are always solid: Rizer (and other bodies) cannot stand inside them, whatever he is doing
// (attacking, dodging, lunging). A body is an oriented box on the ground plane:
//   { x, z, hw, hd, rot, y, top }   centre · half width (local x) · half depth (local z) · yaw · base and top height
// rot follows world.js: a box rotated by rot lines up with a mesh whose rotation.y = rot.
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const toLocal = (B, x, z) => { const c = Math.cos(B.rot), s = Math.sin(B.rot), dx = x - B.x, dz = z - B.z; return [dx * c - dz * s, dx * s + dz * c]; };
const toWorld = (B, lx, lz) => { const c = Math.cos(B.rot), s = Math.sin(B.rot); return [B.x + lx * c + lz * s, B.z - lx * s + lz * c]; };

// Push a standing body (centre pos, horizontal radius rad, height h) out of the box. True if it moved.
export function pushOut(pos, rad, B, h = 1.7) {
  if (pos.y >= B.top - 0.02 || pos.y + h <= B.y + 0.02) return false; // stands on top of it, or passes below it
  let [lx, lz] = toLocal(B, pos.x, pos.z);
  const qx = clamp(lx, -B.hw, B.hw), qz = clamp(lz, -B.hd, B.hd), ex = lx - qx, ez = lz - qz, d = Math.hypot(ex, ez);
  if (d >= rad) return false;
  if (d < 1e-5) { const px = B.hw - Math.abs(lx), pz = B.hd - Math.abs(lz); if (px < pz) lx = Math.sign(lx || 1) * (B.hw + rad); else lz = Math.sign(lz || 1) * (B.hd + rad); }
  else { lx = qx + ex / d * rad; lz = qz + ez / d * rad; }
  const [wx, wz] = toWorld(B, lx, lz); pos.x = wx; pos.z = wz; return true;
}
// A fast mover must not skip through a thin wall of box between two frames: test the path, stop at the first contact.
export function sweepOut(prev, pos, rad, B, h = 1.7) {
  const dx = pos.x - prev.x, dz = pos.z - prev.z, len = Math.hypot(dx, dz);
  if (len < 0.2 || len > 4) return pushOut(pos, rad, B, h); // standing still, or teleported: no path to test
  const n = Math.ceil(len / 0.2), t = { x: 0, y: pos.y, z: 0 };
  for (let i = 1; i <= n; i++) { t.x = prev.x + dx * i / n; t.z = prev.z + dz * i / n; if (pushOut(t, rad, B, h)) { pos.x = t.x; pos.z = t.z; return true; } }
  return false;
}
export function pushOutCircle(pos, rad, cx, cz, r) { // keep `pos` at least rad + r from a circle centre
  const dx = pos.x - cx, dz = pos.z - cz, d = Math.hypot(dx, dz), m = rad + r; if (d >= m) return false;
  if (d < 1e-5) { pos.x = cx + m; return true; }
  pos.x = cx + dx / d * m; pos.z = cz + dz / d * m; return true;
}
