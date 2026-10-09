// RP7D · where each cave goes (RP7D Cave System V1.1 · §5 placement, §6 steps 3–6 and 14).
//
// Deterministic, and data-driven from the live world (world-data.js): every district's own coast mask, its roads,
// structures, landmarks, homes, water, pastures and patrol routes. Nothing here moves anything: it only finds the
// emptiest valid ground for each cave's whole formation and reports what it found.
//
//   hard rules (any failure rejects a candidate)
//     · the whole footprint + approach stays on its own district's land (worldDistrictAt) with BUFFER units of clearance
//       from its coast, and BUFFER units outside every OTHER district's coast (no straddling, no adjacency)
//     · no protected asset inside the footprint or the approach (roads, sites, homes, water, pastures, patrols, spawn)
//     · the district's two caves stay PAIR_MIN apart
//     · solid, dry ground (when the live height field is given)
//   score (only among survivors), in the spec's order of importance:
//     border clearance › terrain suitability › empty space › separation › access › map-image prior
//
// A pinned cave (an existing landmark that already is the mouth: Rakoron's Ruby Cave) is never moved; it is still
// measured and reported. A cave with no valid ground is reported as a CONFLICT and is not built.
import { CAVES, CAVE_BY_ID, validateManifest } from './caves-data.js';

export const PLACEMENT = { BUFFER: 18, PAIR_MIN: 70, STEP: 6, APPROACH: 14,
  FOOTPRINT: { mountain: 26, canyon: 24 },   // radius of the whole formation (rock mass / cut + rims)
  WEIGHTS: { border: 0.26, terrain: 0.2, empty: 0.18, separation: 0.14, access: 0.12, prior: 0.1 } };

const SITE_R = { championStadium: 46, townHall: 18, research: 18, academy: 16, hospital: 14, seerHQ: 18, seerGate: 12, districtGate: 14, radioTower: 12, treehouse: 12, rubyCave: 22, fountain: 18, fallenTitan: 18, bridge: 14, ufo: 12 };
const pt = p => Array.isArray(p) ? { x: p[0], z: p[1] } : { x: p.x, z: p.z ?? p.y };
function segDist(px, pz, a, b) {
  const vx = b.x - a.x, vz = b.z - a.z, L = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((px - a.x) * vx + (pz - a.z) * vz) / L));
  return Math.hypot(px - (a.x + vx * t), pz - (a.z + vz * t));
}
const lineDist = (x, z, pts) => { let d = Infinity; for (let i = 1; i < pts.length; i++) d = Math.min(d, segDist(x, z, pt(pts[i - 1]), pt(pts[i]))); return pts.length === 1 ? Math.hypot(x - pt(pts[0]).x, z - pt(pts[0]).z) : d; };

// Everything a cave must never touch, per district: circles (x, z, r) and lines (pts, half-width).
export function protectedAssets(d) {
  const circles = [], lines = [];
  const add = (p, r, why) => p && Number.isFinite(p.x) && circles.push({ x: p.x, z: p.z, r, why });
  for (const s of [...(d.structures || []), ...(d.landmarks || [])]) add(s, SITE_R[s.recipe] ?? 14, s.id);
  for (const h of d.homes || []) add(h, 11, h.id);
  for (const p of d.ponds || []) add(p, (p.r || 6) + 6, 'pond');
  for (const p of d.paddocks || []) add(p, Math.hypot(p.w || 20, p.d || 20) / 2 + 4, 'paddock');
  for (const c of d.clearings || []) add(c, (c.r || 12) + 4, c.name || 'clearing');
  if (d.plaza) add(d.plaza, d.plaza.r + 8, 'plaza');
  if (d.playerStart) add(d.playerStart, 30, 'spawn');
  for (const r of d.roads || []) lines.push({ pts: r.pts, w: (r.width || 3) + 6, why: r.id });
  if (d.river?.length) lines.push({ pts: d.river, w: 12, why: 'river' });
  for (const key of ['seerPatrols', 'moriPatrols', 'creptPatrols', 'skellorPatrols']) for (const r of d[key] || []) if (r.pts?.length) lines.push({ pts: r.pts, w: 6, why: `${key}:${r.id || ''}` });
  return { circles, lines };
}

// Map-image calibration: an affine fit (least squares) from each district's two image candidates' midpoint to its
// real centre. Reported with its residual; used only as the weakest score term.
export function calibrate(districts, caves = CAVES) {
  const rows = districts.map(d => { const L = caves.filter(c => c.districtId === d.id); if (L.length < 2) return null; return { px: (L[0].prior[0] + L[1].prior[0]) / 2, py: (L[0].prior[1] + L[1].prior[1]) / 2, x: d.center.x, z: d.center.z }; }).filter(Boolean);
  const solve = key => { // normal equations for [a b c]: key = a·px + b·py + c
    const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], B = [0, 0, 0];
    for (const r of rows) { const v = [r.px, r.py, 1]; for (let i = 0; i < 3; i++) { B[i] += v[i] * r[key]; for (let j = 0; j < 3; j++) A[i][j] += v[i] * v[j]; } }
    for (let i = 0; i < 3; i++) { let m = i; for (let k = i + 1; k < 3; k++) if (Math.abs(A[k][i]) > Math.abs(A[m][i])) m = k; [A[i], A[m]] = [A[m], A[i]]; [B[i], B[m]] = [B[m], B[i]]; for (let k = i + 1; k < 3; k++) { const f = A[k][i] / A[i][i]; for (let j = i; j < 3; j++) A[k][j] -= f * A[i][j]; B[k] -= f * B[i]; } }
    const s = [0, 0, 0]; for (let i = 2; i >= 0; i--) { let v = B[i]; for (let j = i + 1; j < 3; j++) v -= A[i][j] * s[j]; s[i] = v / A[i][i]; } return s;
  };
  const fx = solve('x'), fz = solve('z'), toWorld = ([px, py]) => ({ x: fx[0] * px + fx[1] * py + fx[2], z: fz[0] * px + fz[1] * py + fz[2] });
  const residual = rows.length ? rows.reduce((s, r) => { const w = toWorld([r.px, r.py]); return s + Math.hypot(w.x - r.x, w.z - r.z); }, 0) / rows.length : NaN;
  return { toWorld, residual: Math.round(residual) };
}

// opts: { districts, worldDistrictAt, heightAt?, waterAt?, pinnedSites?: { id: site } }
export function placeCaves({ districts, worldDistrictAt, heightAt = null, waterAt = null, pinnedSites = {} }) {
  const P = PLACEMENT, manifest = validateManifest(), cal = calibrate(districts);
  const byId = Object.fromEntries(districts.map(d => [d.id, d]));
  const border = (d, x, z) => -d.edge(x, z) * d.districtRadius; // ≈ units inside the coast (negative = outside)
  const placements = [];
  for (const d of districts) {
    const prot = protectedAssets(d), mine = [];
    for (const cave of CAVES.filter(c => c.districtId === d.id).sort((a, b) => (a.classification === 'gemlord' ? -1 : 1))) {
      const R = P.FOOTPRINT[cave.terrainType], prior = cal.toWorld(cave.prior), why = {};
      const reject = k => { why[k] = (why[k] || 0) + 1; return null; };
      // One candidate, fully measured (null = rejected, with the reason counted).
      const measure = (cx, cz, face, pinned = false) => {
        const fx = Math.sin(face), fz = Math.cos(face), samples = [[cx, cz]];
        for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; samples.push([cx + Math.sin(a) * R, cz + Math.cos(a) * R]); }
        for (let k = 1; k <= 3; k++) samples.push([cx + fx * (R + P.APPROACH * k / 3), cz + fz * (R + P.APPROACH * k / 3)]); // the walk up to the mouth
        let minBorder = Infinity;
        for (const [x, z] of samples) {
          if (worldDistrictAt(x, z) !== d.id) { if (!pinned) return reject('leaves its district'); }
          const b = border(d, x, z); minBorder = Math.min(minBorder, b);
          if (!pinned && b < P.BUFFER) return reject('too near its district border');
          for (const e of districts) if (e !== d && border(e, x, z) > -P.BUFFER) { if (!pinned) return reject(`too near ${e.district}`); minBorder = Math.min(minBorder, -border(e, x, z)); }
          if (heightAt && waterAt && waterAt(x, z) > heightAt(x, z) - 0.2 && !pinned) return reject('water');
        }
        let clear = Infinity, nearest = '';
        for (const c of prot.circles) { if (pinned && c.why === cave.pinned) continue; const g = Math.hypot(c.x - cx, c.z - cz) - R - c.r; if (g < clear) { clear = g; nearest = c.why; } }
        for (const l of prot.lines) { const g = Math.min(lineDist(cx, cz, l.pts) - R, lineDist(cx + fx * (R + P.APPROACH), cz + fz * (R + P.APPROACH), l.pts) - 4) - l.w; if (g < clear) { clear = g; nearest = l.why; } }
        if (!pinned && clear < 0) return reject('protected asset');
        const pair = mine.length ? Math.min(...mine.map(m => Math.hypot(m.center.x - cx, m.center.z - cz))) : Infinity;
        if (!pinned && pair < P.PAIR_MIN) return reject('too near its pair');
        // terrain suitability: mountains want high, firm ground; canyons want low ground to cut down from
        let terrain = 0.5, slope = 0;
        if (heightAt) {
          const hs = samples.map(([x, z]) => heightAt(x, z)), mean = hs.reduce((s, h) => s + h, 0) / hs.length;
          slope = (Math.max(...hs) - Math.min(...hs)) / (2 * R);
          if (!pinned && slope > 0.45) return reject('too steep');
          const lift = Math.max(0, Math.min(1, (mean - d._hLow) / Math.max(1, d._hHigh - d._hLow)));
          terrain = (cave.terrainType === 'mountain' ? lift : 1 - lift) * 0.8 + (1 - Math.min(1, slope / 0.45)) * 0.2;
        }
        const roadD = Math.min(Infinity, ...(d.roads || []).map(r => lineDist(cx + fx * (R + P.APPROACH), cz + fz * (R + P.APPROACH), r.pts)));
        const S = {
          border: Math.min(1, Math.max(0, minBorder) / 120), terrain, empty: Math.min(1, Math.max(0, clear) / 80),
          separation: Number.isFinite(pair) ? Math.min(1, pair / 220) : 1, access: Number.isFinite(roadD) ? 1 - Math.min(1, roadD / 260) : 0.5,
          prior: 1 - Math.min(1, Math.hypot(prior.x - cx, prior.z - cz) / 300)
        };
        const score = Object.entries(P.WEIGHTS).reduce((s, [k, w]) => s + S[k] * w, 0);
        return { center: { x: cx, z: cz }, face, entrance: { x: cx + fx * R * 0.72, z: cz + fz * R * 0.72, face }, minBorder: Math.round(minBorder), clearance: Math.round(clear), nearestAsset: nearest, pair, scores: S, score, slope };
      };
      // ground height range of the district (terrain suitability is relative to it)
      if (heightAt && d._hLow === undefined) { let lo = Infinity, hi = -Infinity; for (let i = 0; i < 400; i++) { const a = i * 2.39996, r = Math.sqrt(i / 400) * d.districtRadius * 0.9, x = d.center.x + Math.sin(a) * r, z = d.center.z + Math.cos(a) * r; if (worldDistrictAt(x, z) !== d.id) continue; const h = heightAt(x, z); lo = Math.min(lo, h); hi = Math.max(hi, h); } d._hLow = lo; d._hHigh = hi; }
      let best = null;
      const site = cave.pinned && pinnedSites[cave.pinned];
      if (site) {
        const face = site.face || 0, R0 = R; // the mouth faces local +Z (props.js · rubyCave door)
        best = measure(site.x - Math.sin(face) * R0 * 0.3, site.z - Math.cos(face) * R0 * 0.3, face, true);
        if (best) best.entrance = { x: site.x + Math.sin(face) * 4, z: site.z + Math.cos(face) * 4, face };
      } else {
        const E = d.extent * 0.95;
        for (let x = Math.ceil((d.center.x - E) / P.STEP) * P.STEP; x <= d.center.x + E; x += P.STEP)
          for (let z = Math.ceil((d.center.z - E) / P.STEP) * P.STEP; z <= d.center.z + E; z += P.STEP) {
            if (worldDistrictAt(x, z) !== d.id || border(d, x, z) < P.BUFFER + R) continue; // cheap pre-filter
            const face = Math.atan2(d.center.x - x, d.center.z - z); // the mouth looks inward, toward the district's heart
            const m = measure(x, z, face);
            if (m && (!best || m.score > best.score + 1e-9 || (Math.abs(m.score - best.score) <= 1e-9 && (x < best.center.x || (x === best.center.x && z < best.center.z))))) best = m;
          }
      }
      const rec = { cave, district: d.district, status: best ? 'PASS' : 'CONFLICT', pinned: !!site, priorWorld: { x: Math.round(prior.x), z: Math.round(prior.z) }, footprintR: R, rejected: why, ...(best || {}) };
      if (best) mine.push(best);
      placements.push(rec);
    }
  }
  for (const p of placements) if (p.status === 'PASS') { const twin = placements.find(q => q !== p && q.cave.districtId === p.cave.districtId && q.status === 'PASS'); p.pairSeparation = twin ? Math.round(Math.hypot(twin.center.x - p.center.x, twin.center.z - p.center.z)) : null; }
  return { placements, manifest, calibration: { residual: cal.residual }, settings: { BUFFER: P.BUFFER, PAIR_MIN: P.PAIR_MIN, STEP: P.STEP, FOOTPRINT: P.FOOTPRINT } };
}

// The §6 step 14 report, as Markdown (written to documents/ by the build check, and logged in game).
export function placementReport(res) {
  const L = [];
  L.push('# RP7D · Cave placement report', '', `Manifest: ${res.manifest.ok ? 'PASS' : 'FAIL'} · ${CAVES.length} caves · ${res.manifest.floors} floors · ${res.manifest.mountains} mountain / ${res.manifest.canyons} canyon${res.manifest.problems.length ? ' · ' + res.manifest.problems.join('; ') : ''}`);
  L.push(`Rules: border buffer ${res.settings.BUFFER} u · pair separation ≥ ${res.settings.PAIR_MIN} u · footprint radius mountain ${res.settings.FOOTPRINT.mountain} u / canyon ${res.settings.FOOTPRINT.canyon} u · grid ${res.settings.STEP} u`);
  L.push(`Map-image calibration: affine fit of the 10 district candidate midpoints to the district centres · mean residual ${res.calibration.residual} u (soft prior only)`, '');
  L.push('| Cave | District | Class | Terrain | Floors | Entrance (x, z) | Facing° | Min border u | Asset clearance u | Pair sep. u | Status |', '|---|---|---|---|---:|---|---:|---:|---:|---:|---|');
  for (const p of res.placements) {
    const c = p.cave;
    L.push(`| ${c.name} (\`${c.id}\`) | ${p.district || c.districtId[0].toUpperCase() + c.districtId.slice(1)} | ${c.rarity} | ${c.terrainType} ${c.verticalDirection === 'up' ? '↑' : '↓'} | ${c.floorCount} | ${p.entrance ? `${p.entrance.x.toFixed(1)}, ${p.entrance.z.toFixed(1)}` : '—'} | ${p.entrance ? Math.round((p.entrance.face * 180 / Math.PI + 360) % 360) : '—'} | ${p.minBorder ?? '—'} | ${p.clearance ?? '—'}${p.nearestAsset ? ` (${p.nearestAsset})` : ''} | ${p.pairSeparation ?? '—'} | ${p.status}${p.pinned ? ' · pinned landmark' : ''} |`);
  }
  const bad = res.placements.filter(p => p.status !== 'PASS');
  L.push('', bad.length ? `## Conflicts (${bad.length})` : '## Conflicts: none');
  for (const p of bad) L.push(`- ${p.cave.id}: no valid ground · rejections ${JSON.stringify(p.rejected)}`);
  const pinned = res.placements.filter(p => p.pinned);
  for (const p of pinned) L.push(`- ${p.cave.id} is pinned to the existing landmark \`${p.cave.pinned}\` (never moved); its measured border ${p.minBorder} u and clearance ${p.clearance} u are reported, not enforced.`);
  return L.join('\n');
}

// The locked placement (cave-lock.js, Phase F): validated coordinates written once and read from then on, so the
// caves never drift when unrelated code changes. A lock that no longer matches the manifest is ignored.
export function hydrateLock(lock) {
  if (!lock?.placements?.length || lock.placements.length !== CAVES.length) return null;
  const placements = lock.placements.map(p => ({ ...p, cave: CAVE_BY_ID[p.id] }));
  if (placements.some(p => !p.cave)) return null;
  return { ...lock, placements, manifest: validateManifest(), locked: true };
}
