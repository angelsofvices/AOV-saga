import * as THREE from 'three';

// Trim grid triangles at a signed coastline instead of connecting land to void vertices.
// Shared edge intersections are cached, keeping the clipped sheet watertight. Surface
// heights/colors interpolate the original triangle; collision keeps using that same plane.
export function clipCoast(geometry, edge, { skirt = () => true, bottom = -46, boundaryHeight = null, columns = 0 } = {}) {
  const source = geometry.index.array, attrs = geometry.attributes, position = attrs.position;
  const fields = Object.fromEntries(Object.entries(attrs).map(([name, a]) => [name, Array.from(a.array)]));
  const values = new Float32Array(position.count);
  for (let i = 0; i < values.length; i++) values[i] = edge(position.getX(i), position.getZ(i));
  const out = [], crossings = new Map(), boundaryCells = new Map();
  let count = position.count, clipped = 0, removed = 0, walls = 0;
  const intersection = (a, b) => {
    const key = a < b ? a + ':' + b : b + ':' + a;
    if (crossings.has(key)) return crossings.get(key);
    let lo = 0, hi = 1;
    const ax = position.getX(a), az = position.getZ(a), bx = position.getX(b), bz = position.getZ(b);
    for (let n = 0; n < 20; n++) {
      const t = (lo + hi) * .5, inside = edge(ax + (bx - ax) * t, az + (bz - az) * t) <= 0;
      if (inside === (values[a] <= 0)) lo = t; else hi = t;
    }
    const t = (lo + hi) * .5, index = count++;
    for (const [name, attr] of Object.entries(attrs)) for (let k = 0; k < attr.itemSize; k++) {
      const v = attr.array[a * attr.itemSize + k];
      fields[name].push(v + (attr.array[b * attr.itemSize + k] - v) * t);
    }
    if (boundaryHeight) {
      const p = fields.position, y = boundaryHeight(p[index * 3], p[index * 3 + 2]);
      if (y !== null) p[index * 3 + 1] = y;
    }
    crossings.set(key, index); return index;
  };
  const wall = (a, b) => {
    const p = fields.position, x = (p[a * 3] + p[b * 3]) * .5, z = (p[a * 3 + 2] + p[b * 3 + 2]) * .5;
    if (!skirt(x, z)) return;
    const start = count, dx = p[b * 3] - p[a * 3], dz = p[b * 3 + 2] - p[a * 3 + 2], len = Math.hypot(dx, dz) || 1;
    for (const [index, low] of [[a, false], [a, true], [b, false], [b, true]]) {
      for (const [name, attr] of Object.entries(attrs)) for (let k = 0; k < attr.itemSize; k++) {
        let v = fields[name][index * attr.itemSize + k];
        if (name === 'position' && k === 1 && low) v = bottom;
        if (name === 'normal') v = k === 0 ? -dz / len : k === 2 ? dx / len : 0;
        if (name === 'color') v *= low ? .12 : .48;
        fields[name].push(v);
      }
      count++;
    }
    out.push(start, start + 1, start + 2, start + 2, start + 1, start + 3); walls++;
  };
  for (let q = 0; q < source.length; q += 3) {
    const tri = [source[q], source[q + 1], source[q + 2]], inside = tri.map(i => values[i] <= 0);
    if (inside.every(Boolean)) { out.push(...tri); continue; }
    if (!inside.some(Boolean)) { removed++; continue; }
    const polygon = [], cuts = [];
    for (let k = 0; k < 3; k++) {
      const a = tri[k], b = tri[(k + 1) % 3];
      if (inside[k]) polygon.push(a);
      if (inside[k] !== inside[(k + 1) % 3]) { const i = intersection(a, b); polygon.push(i); cuts.push(i); }
    }
    const triangles = [];
    for (let k = 1; k < polygon.length - 1; k++) {
      const t = [polygon[0], polygon[k], polygon[k + 1]]; out.push(...t); triangles.push(t);
    }
    if (columns) {
      const cell = Math.floor(q / 6), list = boundaryCells.get(cell) || [];
      list.push(...triangles); boundaryCells.set(cell, list);
    }
    if (cuts.length === 2) {
      // Winding follows the polygon boundary, so the shore face points out to sea.
      for (let k = 0; k < polygon.length; k++) if (cuts.includes(polygon[k]) && cuts.includes(polygon[(k + 1) % polygon.length])) {
        wall(polygon[k], polygon[(k + 1) % polygon.length]); break;
      }
    }
    clipped++;
  }
  for (const [name, attr] of Object.entries(attrs)) geometry.setAttribute(name, new THREE.Float32BufferAttribute(fields[name], attr.itemSize));
  geometry.setIndex(out); geometry.computeBoundingSphere();
  geometry.userData.coast = { clipped, removed, walls, topTriangles: out.length / 3 - walls * 2 };
  const surfacePositions = geometry.attributes.position.array;
  // Boundary overrides (the Malezor seam) are also used by the runtime floor query.
  function boundaryHeightAt(cell, x, z) {
    const triangles = boundaryCells.get(cell); if (!triangles) return null;
    const p = surfacePositions;
    for (const [a, b, c] of triangles) {
      const ax = p[a * 3], az = p[a * 3 + 2], bx = p[b * 3] - ax, bz = p[b * 3 + 2] - az;
      const cx = p[c * 3] - ax, cz = p[c * 3 + 2] - az, det = bx * cz - bz * cx;
      if (Math.abs(det) < 1e-12) continue;
      const u = ((x - ax) * cz - (z - az) * cx) / det, v = (bx * (z - az) - bz * (x - ax)) / det;
      if (u >= -1e-5 && v >= -1e-5 && u + v <= 1.00001) return p[a * 3 + 1] + u * (p[b * 3 + 1] - p[a * 3 + 1]) + v * (p[c * 3 + 1] - p[a * 3 + 1]);
    }
    return null;
  }
  return { boundaryHeightAt };
}
