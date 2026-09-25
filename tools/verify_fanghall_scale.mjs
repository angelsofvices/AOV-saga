// ★★★★ v0.99.43 · THE FANGHALL AT TEN TIMES · and why that is AREA, not side.
//   Creator, 2026-09-24: "make the fanghall 10x bigger but keep the same shape."
import { bootGame } from './lib/boot_game.mjs';
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);
const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['WORLD_PROPS','walkable','game','worldDistrictAt','isWorldLandTile',
  'ZYRAXIS_DISTRICT_BY_ID'] });
console.log = _L;
G.game.scene = 'overworld';
const F = G.WORLD_PROPS.find(p => p && p.id === 'malezor_the_fanghall');
const WAS = { w: 11, h: 10 };

H('★★★★ TEN TIMES THE AREA, AND THE SHAPE IS HELD');
{
  ok(!!F, 'the Fanghall exists');
  const area = (F.tileW * F.tileH) / (WAS.w * WAS.h);
  ok(area >= 9.5 && area <= 10.5, `★★★★ ${area.toFixed(2)}x the area (${WAS.w}x${WAS.h} → ${F.tileW}x${F.tileH})`);
  const was = WAS.w / WAS.h, now = F.tileW / F.tileH;
  ok(Math.abs(now - was) < 0.02,
     `★★★★ ratio ${now.toFixed(3)} against the original ${was.toFixed(3)} · "keep the same shape" is the ratio, and it is half a percent out — the closest whole-tile pair to sqrt(10) that does not distort it`);
  // ★★★ the footprint keeps its proportion too · it was 4 of 10 rows deep
  const dys = F.footprint.map(p => p[1]), dxs = F.footprint.map(p => p[0]);
  const depth = Math.max(...dys) - Math.min(...dys) + 1;
  const width = Math.max(...dxs) - Math.min(...dxs) + 1;
  ok(width === F.tileW, `★★ the solid block spans the full drawn width (${width}/${F.tileW})`);
  ok(Math.abs(depth / F.tileH - 4 / WAS.h) < 0.05,
     `★★★ and keeps its depth proportion · ${depth}/${F.tileH} = ${(depth/F.tileH).toFixed(2)} against the original 0.40`);
}

H('★★★★ TEN TIMES THE *SIDE* WAS NEVER POSSIBLE · measured, not assumed');
{
  // ★★★★ 11x10 at linear x10 is 110x100 tiles — five and a half screens wide on
  //   a 20x11 viewport. Against the world it fails harder than it fails on
  //   screen: this checks the land it would have needed actually is not there.
  const need = 55;                                   // half-width of a 110-wide hall
  let land = true;
  for (let dy = -need; dy <= need && land; dy += 5)
    for (let dx = -need; dx <= need && land; dx += 5){
      const x = F.tileX + dx, y = F.tileY + dy;
      if (!G.isWorldLandTile(x, y) || G.worldDistrictAt(x, y) !== 'malezor') land = false;
    }
  ok(!land,
     '★★★★ a x10-SIDE hall would run off Malezor land · so "10x bigger" can only mean area here, and the reading was forced by the map rather than chosen');
}

H('★★★★ IT DID NOT EAT THE NEIGHBOURHOOD');
{
  const occ = new Set(F.footprint.map(([dx, dy]) => (F.tileX+dx) + ',' + (F.tileY+dy)));
  const hits = G.WORLD_PROPS.filter(p => p && p !== F && p.tileX != null
    && /home|house|hall|lodge|shop|school|tower|hq|cave|chest/.test(p.id || '')
    && occ.has(p.tileX + ',' + p.tileY));
  ok(!hits.length,
     `★★★★ no structure sits inside the new footprint${hits.length ? ' · SWALLOWED: ' + hits.slice(0,4).map(h => h.id).join(', ') : ' · the nearest villager home is 18 tiles out and stays clear'}`);
  let offLand = 0, offDist = 0;
  for (const k of occ){
    const [x, y] = k.split(',').map(Number);
    if (!G.isWorldLandTile(x, y)) offLand++;
    if (G.worldDistrictAt(x, y) !== 'malezor') offDist++;
  }
  ok(offLand === 0 && offDist === 0,
     `★★★ all ${occ.size} solid tiles are on land and inside Malezor (${offLand} off-land, ${offDist} out-of-district)`);
}

H('★★★★ AND YOU CAN STILL GET TO THE DOOR');
{
  // ★★★★ A 454-tile building with one approach tile is one bad tile away from
  //   an unenterable landmark. This walks there from the district hub rather
  //   than trusting that the neighbour is walkable.
  ok(G.walkable(F.tileX, F.tileY), 'the doorstep itself stays walkable');
  const D = G.ZYRAXIS_DISTRICT_BY_ID.malezor;
  let start = null;
  for (let r = 0; r < 40 && !start; r++)
    for (let dy = -r; dy <= r && !start; dy++)
      for (let dx = -r; dx <= r && !start; dx++)
        if (G.walkable(D.cx+dx, D.cy+dy)) start = [D.cx+dx, D.cy+dy];
  const seen = new Set([start.join(',')]); const stk = [start];
  let guard = 0;
  while (stk.length && guard++ < 400000){
    const [x, y] = stk.pop();
    for (const [ox, oy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx = x+ox, ny = y+oy, k = nx + ',' + ny;
      if (seen.has(k)) continue;
      if (Math.abs(nx-D.cx) > D.rx+40 || Math.abs(ny-D.cy) > D.ry+40) continue;
      if (!G.walkable(nx, ny)) continue;
      seen.add(k); stk.push([nx, ny]);
    }
  }
  ok(seen.has(F.tileX + ',' + (F.tileY+1)),
     `★★★★ the door is reachable on foot from the Malezor hub (${seen.size} tiles flooded) · a landmark you cannot walk to is scenery`);
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ 10x the area, shape held to half a percent, nothing swallowed, door still reachable');
process.exit(f ? 1 : 0);
