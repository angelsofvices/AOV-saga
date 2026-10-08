// Terrain-only helpers. Canon district masks and route widths remain in world-data.js.
import { ROUTES, RP7B } from './world-data.js';
import { DISTRICTS } from './district-view.js';

export const VOID_SEA_LEVEL = -8;
export const LAND_ROUTES = ROUTES.map(r => ({ ...r,
  a: DISTRICTS.find(d => d.id === r.from), b: DISTRICTS.find(d => d.id === r.to),
  radius: r.width * RP7B.K
}));

export function routeDistance(x, z, r) {
  const dx = r.b.x - r.a.x, dz = r.b.z - r.a.z;
  const t = Math.max(0, Math.min(1, ((x - r.a.x) * dx + (z - r.a.z) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(x - r.a.x - dx * t, z - r.a.z - dz * t) - r.radius;
}

// Negative inside land; zero follows the existing coast and the existing land bridges.
// Use the union, never the selected district's edge: a district border isn't a coastline.
export function overworldEdge(x, z) {
  let edge = Infinity;
  for (const d of DISTRICTS) {
    if (Math.abs(x - d.x) > d.extent + 48 || Math.abs(z - d.z) > d.extent + 48) continue;
    edge = Math.min(edge, d.edge(x, z) * d.extent / 1.097);
  }
  for (const r of LAND_ROUTES) {
    if (x < Math.min(r.a.x, r.b.x) - r.radius - 48 || x > Math.max(r.a.x, r.b.x) + r.radius + 48 ||
      z < Math.min(r.a.z, r.b.z) - r.radius - 48 || z > Math.max(r.a.z, r.b.z) + r.radius + 48) continue;
    edge = Math.min(edge, routeDistance(x, z, r));
  }
  return edge;
}

export function malezorSurfaceEdge(x, z) {
  const d = DISTRICTS[0];
  return Math.max(d.edge(x, z) * 290, Math.abs(x) - (d.extent - 1), Math.abs(z) - (d.extent - 1));
}
