// HUD: live minimap (rotating) + full map, location readout, discovery
// banners, field note progress, interact prompt and note card, clock.
import { quarterWeights, sectionAt } from './world-data.js';
import { DISTRICTS, ZYRAXIS, coastEdge, malezorOwns, emptyDistrictAt } from './district-view.js';
import { describeHour } from './sky.js';
import { LAND_ROUTES } from './overworld-land.js';

const $ = s => document.querySelector(s);
const ICON = { civic: '#e9c982', shop: '#e9c982', home: '#f1e6cf', farm: '#d9a05a', landmark: '#f5eedf', gemlord: '#ff3b55', stadium: '#ff3b55', seer: '#a878ff', crossing: '#c9b28a', chest: '#6fa0ff' };

export function createHUD(W, world) {
  const T = world.T, E = W.extent, RES = 2; // px per unit on the base map
  // ── pre-render the district once ──
  const base = document.createElement('canvas'); base.width = base.height = E * 2 * RES;
  const miniBase = document.createElement('canvas'); miniBase.width = base.width; miniBase.height = base.height;
  {
    const ctx = base.getContext('2d'), img = ctx.createImageData(base.width, base.height), d = img.data;
    const schematic = miniBase.getContext('2d'), miniImg = schematic.createImageData(base.width, base.height), md = miniImg.data;
    const Q = { core: [128, 146, 96], open: [150, 160, 98], forest: [86, 112, 66], wetland: [104, 136, 84], highland: [138, 144, 100] };
    for (let py = 0; py < base.height; py++) for (let px = 0; px < base.width; px++) {
      const x = px / RES - E, z = py / RES - E, h = T.heightAt(x, z), i = (py * base.width + px) * 4;
      md[i] = 5; md[i + 1] = 16; md[i + 2] = 31; md[i + 3] = 255;
      if (W.containsLand && !W.containsLand(x, z)) { d[i] = 12; d[i + 1] = 23; d[i + 2] = 45; d[i + 3] = 255; continue; }
      const wts = quarterWeights(x, z, W); let r = 0, g = 0, b = 0;
      for (const k in wts) { r += Q[k][0] * wts[k]; g += Q[k][1] * wts[k]; b += Q[k][2] * wts[k]; }
      const hx = T.heightAt(x + 1, z) - h, shade = 1 + hx * -0.18 + (h - 4) * 0.012;
      r *= shade; g *= shade; b *= shade;
      const road = T.roadAt(x, z); if (road > 0.3) { r = 196; g = 176; b = 128; }
      if (T.waterAt(x, z) > h - 0.05) { r = 92; g = 146; b = 150; }
      if (Math.hypot(x - W.plaza.x, z - W.plaza.z) < W.plaza.r) { r = 188; g = 180; b = 160; }
      d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
      // A separate schematic palette keeps the full Zyphone map unchanged.
      const contour = Math.floor(h * 1.5) % 4 === 0 ? 5 : 0;
      md[i] = 10 + contour; md[i + 1] = 29 + wts.forest * 9 + contour; md[i + 2] = 48 + wts.highland * 8 + contour;
      if (road > 0.3) { md[i] = 37; md[i + 1] = 84; md[i + 2] = 112; }
      if (T.waterAt(x, z) > h - 0.05) { md[i] = 12; md[i + 1] = 50; md[i + 2] = 75; }
      if (Math.hypot(x - W.plaza.x, z - W.plaza.z) < W.plaza.r) { md[i] = 33; md[i + 1] = 66; md[i + 2] = 89; }
    }
    ctx.putImageData(img, 0, 0);
    schematic.putImageData(miniImg, 0, 0);
    ctx.fillStyle = 'rgba(40,34,30,.75)';
    for (const o of world.obstacles) if (o.type === 'box' && o.top && o.hw > 2) {
      ctx.save(); ctx.translate((o.x + E) * RES, (o.z + E) * RES); ctx.rotate(-(o.rot || 0)); ctx.fillRect(-o.hw * RES, -o.hd * RES, o.hw * 2 * RES, o.hd * 2 * RES); ctx.restore();
      schematic.save(); schematic.translate((o.x + E) * RES, (o.z + E) * RES); schematic.rotate(-(o.rot || 0));
      schematic.fillStyle = '#132c46'; schematic.strokeStyle = '#4d91b4'; schematic.lineWidth = RES * 0.55;
      schematic.fillRect(-o.hw * RES, -o.hd * RES, o.hw * 2 * RES, o.hd * 2 * RES);
      schematic.strokeRect(-o.hw * RES, -o.hd * RES, o.hw * 2 * RES, o.hd * 2 * RES); schematic.restore();
    }
    for (const m of world.mapShapes || []) { // stadiums: the stands as a ring, the arena inside
      for (const [c, fillOut, fillIn, stroke] of [[ctx, 'rgba(40,34,30,.8)', 'rgba(200,165,122,.85)', null], [schematic, '#132c46', '#1d4260', '#4d91b4']]) {
        c.save(); c.translate((m.x + E) * RES, (m.z + E) * RES); c.rotate(-m.rot);
        c.fillStyle = fillOut; c.beginPath(); c.ellipse(0, 0, m.ax * RES, m.bz * RES, 0, 0, Math.PI * 2); c.fill();
        if (stroke) { c.strokeStyle = stroke; c.lineWidth = RES * 0.55; c.stroke(); }
        c.fillStyle = fillIn; c.beginPath(); c.ellipse(0, 0, m.inAx * RES, m.inBz * RES, 0, 0, Math.PI * 2); c.fill(); c.restore();
      }
    }
  }
  const mini = $('#mini-canvas'), mctx = mini.getContext('2d');
  const big = $('#map-canvas'), bctx = big.getContext('2d');
  const nodes = new Map();
  const node = id => { if (!nodes.has(id)) nodes.set(id, document.getElementById(id)); return nodes.get(id); };
  const text = (id, value) => { const el = node(id), next = String(value); if (el && el.textContent !== next) el.textContent = next; };
  const attr = (el, key, value) => { if (el && el.getAttribute(key) !== String(value)) el.setAttribute(key, String(value)); };
  const style = (el, key, value) => { if (el && el.style.getPropertyValue(key) !== value) el.style.setProperty(key, value); };
  const clamp01 = value => Math.max(0, Math.min(1, value));
  const countFormat = new Intl.NumberFormat('en-US'), compactFormat = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 });

  const places = world.interactables.filter(i => i.discover);
  const found = new Set(), regionsSeen = new Set();
  let reachedSquare = false, promptTarget = null, cardTimer = 0, lastRegion = '', bannerTimer = null;
  // Every HUD meter is ten segmented cells; the last lit cell fills partway (--f).
  const CELLS = 10;
  for (const id of ['hp-cells', 'stamina-cells', 'energy-cells', 'zhud-hp-cells', 'zhud-ap-cells']) {
    const el = node(id); if (!el) continue;
    el.replaceChildren();
    attr(el, 'role', 'progressbar'); attr(el, 'aria-valuemin', 0);
    for (let i = 0; i < CELLS; i++) el.appendChild(document.createElement('i'));
  }
  function cells(id, value, max) {
    const el = node(id); if (!el) return;
    const f = max > 0 ? clamp01(value / max) : 0, lit = f * CELLS;
    attr(el, 'aria-valuemax', Math.round(max)); attr(el, 'aria-valuenow', Math.round(Math.max(0, value)));
    el.classList.toggle('low', f > 0 && f < 0.25);
    [...el.children].forEach((c, i) => { const k = clamp01(lit - i); c.classList.toggle('empty', k <= 0); style(c, '--f', k.toFixed(2)); });
  }
  let lootHint = null; // name of the loot ○ would pick up right now (set by game.js each frame)
  let partner = null; // { name, type, lv, hp, maxHp, ap, maxAp } once bonding exists
  function setPartner(p) { partner = p; }

  function banner(kicker, title) {
    const el = $('#banner'); el.querySelector('small').textContent = kicker; el.querySelector('b').textContent = title;
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    clearTimeout(bannerTimer); bannerTimer = setTimeout(() => el.classList.remove('show'), 3200);
  }
  function setNote(kicker, text) { $('#note-kicker').textContent = kicker; $('#note-text').textContent = text; }
  function refreshNote() {
    if (!reachedSquare) return setNote('FIELD NOTE', 'Head down the lane into Malezor Square');
    setNote(`FIELD NOTE · ${found.size}/${places.length} PLACES`, found.size >= places.length ? 'Every landmark of Malezor found' : 'Explore Malezor — find every landmark');
  }
  refreshNote();

  function regionName(x, z) {
    const cave = world.interiorName?.(x, z); if (cave) return cave; // inside a cave (cave-interior.js)
    if (!malezorOwns(x, z)) { const d = world.expanse?.districtAt(x, z); if (d) return `${d.name} · District ${d.numeral}`; } // an empty district beyond Malezor
    if (Math.hypot(x - W.plaza.x, z - W.plaza.z) < W.plaza.r + 4) return W.plaza.name;
    const section = sectionAt(x, z, W);
    return section === 'central' ? W.subdistricts.central : W.subdistricts[section];
  }

  function drawMini(p, yaw, facing, zyrex, seers) {
    // Rectangular, heading-up map (the frame is the MHUD panel); `w` is the reach radius used for culling.
    const W2 = mini.width, H2 = mini.height, w = Math.hypot(W2, H2), s = 1.5 * devicePixelRatio / RES * RES; // px per unit
    mctx.clearRect(0, 0, W2, H2);
    mctx.save(); mctx.beginPath(); mctx.rect(0, 0, W2, H2); mctx.clip();
    mctx.translate(W2 / 2, H2 / 2); mctx.rotate(yaw);
    mctx.drawImage(base, -(p.x + E) * s, -(p.z + E) * s, base.width * s / RES, base.height * s / RES);
    { // the empty districts in reach of the minimap: flat colour, then Malezor's own map back over its coast
      const reach = w / s / 2 + 340, near = DISTRICTS.filter((d, i) => i && Math.abs(d.x - p.x) < reach && Math.abs(d.z - p.z) < reach);
      const trace = pts => { mctx.beginPath(); pts.forEach(([x, z], i) => i ? mctx.lineTo((x - p.x) * s, (z - p.z) * s) : mctx.moveTo((x - p.x) * s, (z - p.z) * s)); mctx.closePath(); };
      for (const d of near) { trace(coasts[DISTRICTS.indexOf(d)]); mctx.fillStyle = d.tint[1]; mctx.fill(); mctx.strokeStyle = 'rgba(231,216,174,.5)'; mctx.lineWidth = 1.5; mctx.stroke(); }
      if (near.length && Math.abs(p.x) < E + reach && Math.abs(p.z) < E + reach) { mctx.save(); trace(coasts[0]); mctx.clip(); mctx.drawImage(base, -(p.x + E) * s, -(p.z + E) * s, base.width * s / RES, base.height * s / RES); mctx.restore(); }
    }
    for (const it of world.interactables) {
      if (it.active && !it.active()) continue;
      if (!it.discover && it.kind === 'home') continue;
      if (it.kind === 'chest' || it.kind === 'enemyLoot') continue; // chests are found by exploring; Astralvision (AV) blips them for a few seconds
      const x = (it.cx - p.x) * s, y = (it.cz - p.z) * s; if (x * x + y * y > (w / 2) ** 2) continue;
      mctx.save(); mctx.translate(x, y); mctx.rotate(-yaw);
      mctx.fillStyle = ICON[it.kind] || '#fff'; mctx.strokeStyle = 'rgba(20,24,20,.8)'; mctx.lineWidth = 1.5 * devicePixelRatio;
      const r = (found.has(it.id) ? 3.6 : 2.6) * devicePixelRatio;
      mctx.beginPath(); if (it.kind === 'landmark' || it.kind === 'gemlord' || it.kind === 'stadium') { mctx.moveTo(0, -r * 1.3); mctx.lineTo(r, 0); mctx.lineTo(0, r * 1.3); mctx.lineTo(-r, 0); mctx.closePath(); } else mctx.arc(0, 0, r, 0, Math.PI * 2);
      mctx.fill(); mctx.stroke(); mctx.restore();
    }
    for (const z of zyrex) { const x = (z.pos.x - p.x) * s, y = (z.pos.z - p.z) * s; if (x * x + y * y < 900 * devicePixelRatio ** 2) { mctx.fillStyle = '#ffd98a'; mctx.beginPath(); mctx.arc(x, y, 2 * devicePixelRatio, 0, 7); mctx.fill(); } }
    for (const g of seers || []) { // Seers show once close; red while hunting you
      if (g.state === 'down') continue;
      const x = (g.pos.x - p.x) * s, y = (g.pos.z - p.z) * s; if (x * x + y * y > (w / 2) ** 2) continue;
      const hunting = g.state === 'chase' || g.state === 'attack' || g.state === 'alert';
      mctx.fillStyle = hunting ? '#ff5a4a' : '#a878ff'; mctx.strokeStyle = '#140f1c'; mctx.lineWidth = devicePixelRatio;
      mctx.beginPath(); mctx.arc(x, y, (hunting ? 3.2 : 2.6) * devicePixelRatio, 0, 7); mctx.fill(); mctx.stroke();
    }
    const sc = getScan?.(); // Astralvision: the pulse ring and anything it lit up
    if (sc) {
      if (sc.ring && sc.ring.a > 0) { mctx.strokeStyle = `rgba(111,180,255,${0.9 * sc.ring.a})`; mctx.lineWidth = 2.5 * devicePixelRatio; mctx.shadowColor = '#6fb4ff'; mctx.shadowBlur = 10; mctx.beginPath(); mctx.arc((sc.ring.x - p.x) * s, (sc.ring.z - p.z) * s, sc.ring.r * s, 0, 7); mctx.stroke(); mctx.shadowBlur = 0; }
      const pulseR = (3 + Math.sin(performance.now() / 160) * 1.2) * devicePixelRatio;
      for (const b of sc.blips) {
        let x = (b.x - p.x) * s, y = (b.z - p.z) * s; const d = Math.hypot(x, y), lim = Math.min(W2, H2) / 2 - 6 * devicePixelRatio;
        if (d > lim) { x *= lim / d; y *= lim / d; } // off the edge: pin to the rim, pointing the way
        mctx.globalAlpha = b.a; mctx.fillStyle = b.kind === 'quest' ? '#ffd98a' : '#6fb4ff'; mctx.shadowColor = mctx.fillStyle; mctx.shadowBlur = 12;
        mctx.beginPath(); mctx.arc(x, y, pulseR, 0, 7); mctx.fill(); mctx.strokeStyle = '#e8f2ff'; mctx.lineWidth = devicePixelRatio; mctx.stroke();
        mctx.shadowBlur = 0; mctx.globalAlpha = 1;
      }
    }
    mctx.rotate(Math.PI - facing);
    mctx.fillStyle = '#fff3c4'; mctx.shadowColor = '#fff3bf'; mctx.shadowBlur = 8;
    const a = 7 * devicePixelRatio; mctx.beginPath(); mctx.moveTo(0, -a); mctx.lineTo(a * 0.7, a * 0.7); mctx.lineTo(0, a * 0.3); mctx.lineTo(-a * 0.7, a * 0.7); mctx.closePath(); mctx.fill();
    mctx.restore();
    // north marker rides the frame edge, rotating with the camera
    const nEl = document.querySelector('.mhud-n');
    if (nEl) { const r = Math.min(W2, H2) / 2 / devicePixelRatio - 10; nEl.style.transform = `translate(${Math.sin(yaw) * -r}px, ${-Math.cos(yaw) * r}px)`; }
    // scale bar: 20 units
    mctx.fillStyle = 'rgba(233,201,130,.85)'; mctx.fillRect(10 * devicePixelRatio, H2 - 10 * devicePixelRatio, 20 * s, 2 * devicePixelRatio);
  }
  // Dev map: the world point under a screen point on the Zyphone map (null off the canvas), and a teleport cursor.
  let mapCursor = null;
  function mapToWorld(cx, cy) {
    const r = big.getBoundingClientRect(); if (!r.width || cx < r.left || cy < r.top || cx > r.right || cy > r.bottom) return null;
    if (mapView === 'world') { const f = worldFit(r.width); return { x: ((cx - r.left) - f.ox) / f.s, z: ((cy - r.top) - f.oz) / f.s }; }
    return { x: (cx - r.left) / r.width * E * 2 - E, z: (cy - r.top) / r.height * E * 2 - E };
  }
  // ── Zyphone world map: all ten districts of Zyraxis (World Expansion 2) ──
  // The map page has two views: the district Rizer knows (Malezor, drawn below) and the whole planet. It follows
  // Rizer: stepping off Malezor shows the world, coming home shows Malezor; the button on the page switches by hand.
  let mapView = 'district', wasAway = false;
  const ZB = ZYRAXIS.bounds, ZSPAN = Math.max(ZB.x1 - ZB.x0, ZB.z1 - ZB.z0) + 80;
  const worldFit = w => { const s = w / ZSPAN; return { s, ox: (w - (ZB.x0 + ZB.x1) * s) / 2, oz: (w - (ZB.z0 + ZB.z1) * s) / 2 }; };
  const coasts = DISTRICTS.map(d => { // each district's coast, traced once
    const pts = [];
    for (let i = 0; i < 160; i++) {
      const a = i / 160 * Math.PI * 2, dx = Math.cos(a), dz = Math.sin(a); let lo = 0, hi = 400;
      for (let n = 0; n < 16; n++) { const m = (lo + hi) * 0.5; if (coastEdge(d.x + dx * m, d.z + dz * m, d) <= 0) lo = m; else hi = m; }
      pts.push([d.x + dx * lo, d.z + dz * lo]);
    }
    return pts;
  });
  function setMapView(v) {
    mapView = v === 'world' ? 'world' : 'district'; mapCursor = null;
    const b = $('#zy-map-view'); if (b) { b.textContent = mapView === 'world' ? 'MALEZOR · DISTRICT MAP' : 'ZYRAXIS · WORLD MAP'; b.classList.toggle('active', mapView === 'world'); }
  }
  function drawWorld(p, facing) {
    const w = big.width, { s, ox, oz } = worldFit(w), X = x => x * s + ox, Z = z => z * s + oz;
    bctx.clearRect(0, 0, w, w);
    const sea = bctx.createLinearGradient(0, 0, w, w); sea.addColorStop(0, '#091427'); sea.addColorStop(.5, '#18243f'); sea.addColorStop(1, '#100e25');
    bctx.fillStyle = sea; bctx.fillRect(0, 0, w, w);
    bctx.strokeStyle = 'rgba(102,153,196,.08)'; bctx.lineWidth = 1;
    for (let y = w * .07; y < w; y += w * .035) {
      bctx.beginPath();
      for (let x = 0; x <= w; x += w / 80) { const z = y + Math.sin(x / w * 18 + y / w * 12) * w * .004; if (x === 0) bctx.moveTo(x, z); else bctx.lineTo(x, z); }
      bctx.stroke();
    }
    bctx.save(); bctx.lineCap = 'round';
    for (const r of LAND_ROUTES) {
      const g = bctx.createLinearGradient(X(r.a.x), Z(r.a.z), X(r.b.x), Z(r.b.z));
      g.addColorStop(0, r.a.tint[0]); g.addColorStop(1, r.b.tint[0]);
      bctx.strokeStyle = g; bctx.lineWidth = r.radius * 2 * s;
      bctx.beginPath(); bctx.moveTo(X(r.a.x), Z(r.a.z)); bctx.lineTo(X(r.b.x), Z(r.b.z)); bctx.stroke();
    }
    bctx.restore();
    const trace = pts => { bctx.beginPath(); pts.forEach(([x, z], i) => i ? bctx.lineTo(X(x), Z(z)) : bctx.moveTo(X(x), Z(z))); bctx.closePath(); };
    for (let i = DISTRICTS.length - 1; i >= 1; i--) { // the empty districts: flat colour, nothing in them yet
      const d = DISTRICTS[i], g = bctx.createLinearGradient(0, Z(d.z - 300), 0, Z(d.z + 300)); g.addColorStop(0, d.tint[0]); g.addColorStop(1, d.tint[1]);
      trace(coasts[i]); bctx.fillStyle = g; bctx.fill(); bctx.strokeStyle = 'rgba(231,216,174,.55)'; bctx.lineWidth = Math.max(1, w / 520); bctx.stroke();
    }
    bctx.save(); trace(coasts[0]); bctx.clip(); bctx.drawImage(base, X(-E), Z(-E), E * 2 * s, E * 2 * s); bctx.restore(); // Malezor: its own map, in miniature
    trace(coasts[0]); bctx.strokeStyle = 'rgba(231,216,174,.9)'; bctx.lineWidth = Math.max(1.5, w / 380); bctx.stroke();
    bctx.textAlign = 'center';
    for (const d of DISTRICTS) {
      const x = X(d.x), y = Z(d.z), light = ['vorashil', 'xilnar', 'korathen', 'zarvane'].includes(d.id);
      bctx.fillStyle = light ? 'rgba(20,18,26,.9)' : 'rgba(250,244,226,.95)';
      bctx.font = `600 ${Math.round(w / 34)}px Cinzel, serif`; bctx.fillText(d.numeral, x, y - w / 60);
      bctx.font = `600 ${Math.round(w / 58)}px Cinzel, serif`; bctx.fillText(d.name.toUpperCase(), x, y + w / 190);
      bctx.font = `${Math.round(w / 88)}px "DM Sans", sans-serif`; bctx.fillText(d.land.toUpperCase(), x, y + w / 44);
    }
    bctx.font = `${Math.round(w / 50)}px Cinzel, serif`; bctx.fillStyle = 'rgba(233,201,130,.9)'; bctx.textAlign = 'left';
    bctx.fillText('ZYRAXIS · THE TEN DISTRICTS', w * 0.035, w * 0.06);
    bctx.font = `${Math.round(w / 65)}px Cinzel, serif`; bctx.fillStyle = 'rgba(148,184,217,.8)'; bctx.fillText('VOID SEA', w * .055, w * .94); bctx.textAlign = 'center';
    bctx.save(); bctx.translate(X(p.x), Z(p.z)); bctx.rotate(Math.PI - facing); bctx.strokeStyle = '#1a1f1a'; bctx.lineWidth = 2;
    bctx.fillStyle = '#fff3c4'; bctx.beginPath(); bctx.moveTo(0, -11); bctx.lineTo(8, 8); bctx.lineTo(0, 3); bctx.lineTo(-8, 8); bctx.closePath(); bctx.fill(); bctx.stroke(); bctx.restore();
    if (mapCursor) { // Dev map: where a click / ✕ will teleport Rizer
      const x = X(mapCursor.x), y = Z(mapCursor.z), ok = isLand(mapCursor.x, mapCursor.z);
      bctx.save(); bctx.strokeStyle = ok ? '#7fe3ff' : '#ff6a5a'; bctx.lineWidth = 2; bctx.shadowColor = bctx.strokeStyle; bctx.shadowBlur = 8;
      bctx.beginPath(); bctx.arc(x, y, 9, 0, 7); bctx.moveTo(x - 16, y); bctx.lineTo(x - 5, y); bctx.moveTo(x + 5, y); bctx.lineTo(x + 16, y); bctx.moveTo(x, y - 16); bctx.lineTo(x, y - 5); bctx.moveTo(x, y + 5); bctx.lineTo(x, y + 16); bctx.stroke();
      bctx.shadowBlur = 0; bctx.font = `${Math.round(w / 60)}px "DM Sans", sans-serif`; bctx.fillStyle = bctx.strokeStyle; bctx.fillText(ok ? 'TELEPORT' : 'NO LAND', x, y + 30); bctx.restore();
    }
  }
  // Where the dev map may put Rizer: Malezor on its own map, any district's land on the world map.
  const isLand = (x, z) => mapView === 'world' ? (world.onLand ? world.onLand(x, z) && (malezorOwns(x, z) || !!emptyDistrictAt(x, z)) : true) : (!W.containsLand || W.containsLand(x, z));
  function drawBig(p, facing) {
    if (mapView === 'world') return drawWorld(p, facing);
    const w = big.width, s = w / (E * 2);
    bctx.clearRect(0, 0, w, w); bctx.drawImage(base, 0, 0, w, w);
    // Trace the RP7B coast and label the measured regions instead of drawing
    // the retired square-center / equal-compass expansion.
    if (W.containsLand) {
      bctx.save(); bctx.strokeStyle = 'rgba(231,216,174,.8)'; bctx.lineWidth = 2.5; bctx.beginPath();
      const c = W.center;
      for (let i = 0; i <= 192; i++) {
        const a = i / 192 * Math.PI * 2, dx = Math.cos(a), dz = Math.sin(a);
        let lo = 0, hi = E * 1.5;
        for (let n = 0; n < 18; n++) { const m = (lo + hi) * 0.5; if (W.containsLand(c.x + dx * m, c.z + dz * m)) lo = m; else hi = m; }
        const x = c.x + dx * lo, z = c.z + dz * lo, px = (x + E) * s, py = (z + E) * s;
        if (i === 0) bctx.moveTo(px, py); else bctx.lineTo(px, py);
      }
      bctx.stroke(); bctx.restore();
    }
    bctx.textAlign = 'center';
    for (const it of world.interactables) {
      if (it.kind === 'home' && !it.discover) continue;
      if (it.kind === 'chest' || it.kind === 'enemyLoot') continue; // never on the map: explore, or scan with AV
      const x = (it.cx + E) * s, y = (it.cz + E) * s, known = found.has(it.id);
      bctx.fillStyle = ICON[it.kind] || '#fff'; bctx.strokeStyle = '#1a1f1a'; bctx.lineWidth = 2;
      bctx.beginPath(); bctx.arc(x, y, known ? 6 : 4, 0, 7); bctx.fill(); bctx.stroke();
      bctx.font = `${Math.round(w / 62)}px "DM Sans", sans-serif`; bctx.fillStyle = known ? '#f5eedf' : 'rgba(245,238,223,.45)';
      bctx.fillText(known ? it.name : '?', x, y - 10);
    }
    bctx.save(); bctx.translate((p.x + E) * s, (p.z + E) * s); bctx.rotate(Math.PI - facing);
    bctx.fillStyle = '#fff3c4'; bctx.beginPath(); bctx.moveTo(0, -11); bctx.lineTo(8, 8); bctx.lineTo(0, 3); bctx.lineTo(-8, 8); bctx.closePath(); bctx.fill(); bctx.restore();
    bctx.font = `${Math.round(w / 54)}px Cinzel, serif`; bctx.fillStyle = 'rgba(245,238,223,.82)';
    for (const [name, at] of Object.entries(W.wildZones || {})) bctx.fillText(W.subdistricts[name].toUpperCase(), (at.x + E) * s, (at.z + E) * s);
    bctx.fillText(W.subdistricts.central.toUpperCase(), (W.hub.x + E) * s, (W.hub.z + E) * s);
    bctx.fillText('↓ ZARVANE', (W.structures.find(q => q.id === 'malezor-zarvane-gate').x + E) * s, (W.structures.find(q => q.id === 'malezor-zarvane-gate').z + E) * s);
    if (mapCursor) { // Dev map: where a click / ✕ will teleport Rizer
      const x = (mapCursor.x + E) * s, y = (mapCursor.z + E) * s, ok = !W.containsLand || W.containsLand(mapCursor.x, mapCursor.z);
      bctx.save(); bctx.strokeStyle = ok ? '#7fe3ff' : '#ff6a5a'; bctx.lineWidth = 2; bctx.shadowColor = bctx.strokeStyle; bctx.shadowBlur = 8;
      bctx.beginPath(); bctx.arc(x, y, 9, 0, 7); bctx.moveTo(x - 16, y); bctx.lineTo(x - 5, y); bctx.moveTo(x + 5, y); bctx.lineTo(x + 16, y); bctx.moveTo(x, y - 16); bctx.lineTo(x, y - 5); bctx.moveTo(x, y + 5); bctx.lineTo(x, y + 16); bctx.stroke();
      bctx.shadowBlur = 0; bctx.font = `${Math.round(w / 60)}px "DM Sans", sans-serif`; bctx.fillStyle = bctx.strokeStyle; bctx.fillText(ok ? 'TELEPORT' : 'NO LAND', x, y + 30); bctx.restore();
    }
  }

  const KIND = { civic: 'MALEZOR', shop: 'SHOP', home: 'HOME', farm: 'FARM', landmark: 'DISTRICT LANDMARK', gemlord: 'GEMLORD SANCTUM · RAKORON', stadium: 'GEMLORD CHAMPION STADIUM · RAKORON', seer: 'SEER TERRITORY', crossing: 'CROSSING', npc: 'MALEZOR · CHARACTER' };
  function update(dt, { rizer, cam, hour, zyrex, seers, mapOpen, busy }) {
    const p = rizer.position;
    // location
    const region = regionName(p.x, p.z);
    { const away = !malezorOwns(p.x, p.z) && !!world.expanse?.contains(p.x, p.z); if (away !== wasAway) { wasAway = away; setMapView(away ? 'world' : 'district'); } }
    if (region !== lastRegion) {
      lastRegion = region; $('#loc-name').textContent = region.toUpperCase();
      if (!regionsSeen.has(region)) { regionsSeen.add(region); if (regionsSeen.size > 1) banner('ENTERING', region); }
      api.onEvent?.('region', region); // game.js decides what a first visit is worth (once, remembered with the save)
      if (region === W.plaza.name && !reachedSquare) { reachedSquare = true; refreshNote(); api.onEvent?.('square'); }
    }
    // discovery
    for (const it of places) {
      if (found.has(it.id)) continue;
      const d = Math.hypot(p.x - it.cx, p.z - it.cz);
      if (d < Math.max(it.reach + 10, 16)) { found.add(it.id); banner('DISCOVERED', it.name); refreshNote(); api.onEvent?.('place', it); if (found.size >= places.length) api.onEvent?.('allPlaces'); }
    }
    // interact prompt: only while standing at a place and facing it, and never mid-fight
    let best = null, bd = Infinity;
    for (const it of world.interactables) {
      if (it.active && !it.active()) continue;
      if (busy && it.id !== 'auraxion-ufo' && it.id !== 'west-lake-bus' && it.kind !== 'enemyLoot' && it.kind !== 'astraliteGem') continue; // world pickups stay usable mid-fight
      if (it.kind === 'enemyLoot' && !it.enemy?.lootBag.visible) continue;
      const d = Math.hypot(p.x - it.x, p.z - it.z) - (it.kind === 'chest' ? 1.5 : 0); // loot right in front wins over the house behind it, but only by a step
      if (d + (it.kind === 'chest' ? 1.5 : 0) > it.reach || d >= bd) continue;
      const ang = Math.atan2(it.cx - p.x, it.cz - p.z), off = Math.abs(Math.atan2(Math.sin(ang - rizer.facing), Math.cos(ang - rizer.facing)));
      if (off < 0.85 || Math.hypot(p.x - it.cx, p.z - it.cz) < 1.5 || (it.door && d < 3.4)) { bd = d; best = it; }
    }
    promptTarget = best;
    $('#prompt').classList.toggle('show', (!!best || !!lootHint) && cardTimer <= 0);
    if (!best && lootHint) { $('#prompt-name').textContent = lootHint; $('#prompt .k').textContent = 'E'; $('#prompt .p').textContent = '○'; } // loot at his feet (game.js · pickups)
    if (best) {
      $('#prompt-name').textContent = best.name;
      const vehicle = best.vehicle || best.id === 'auraxion-ufo' || best.id === 'west-lake-bus'; // vehicles (bus, UFO, Astralboard, every future ride): △ on and off
      const glyph = vehicle ? '△' : best.door ? '✕' : '○';
      $('#prompt .k').textContent = vehicle ? 'E' : best.door ? 'X / SPACE' : 'E';
      $('#prompt .p').textContent = glyph;
    }
    if (cardTimer > 0) { cardTimer -= dt; if (cardTimer <= 0 || !best) { $('#card').classList.remove('show'); cardTimer = 0; } }
    // vitals
    const setMeter = (id, numId, value, max) => { text(numId, Math.ceil(Math.max(0, value))); cells(id, value, max); };
    // ZHUD: the partner (none until bonding lands), plus how many wild Zyrex are close
    if (partner) {
      text('zhud-name', partner.name.toUpperCase()); text('zhud-type', partner.type || ''); text('zhud-lv', 'LV ' + partner.lv);
      setMeter('zhud-hp-cells', 'zhud-hp-num', partner.hp, partner.maxHp); setMeter('zhud-ap-cells', 'zhud-ap-num', partner.ap, partner.maxAp);
    } else { cells('zhud-hp-cells', 0, 1); cells('zhud-ap-cells', 0, 1); }
    node('zhud-disc')?.classList.toggle('empty', !partner);
    let near = 0; for (const z of zyrex || []) if (Math.hypot(z.pos.x - p.x, z.pos.z - p.z) < 45) near++;
    text('zhud-sense', near ? `SENSING · ${near} wild Zyrex nearby` : 'No wild Zyrex sensed');
    node('zhud-sense')?.classList.toggle('on', near > 0);
    setMeter('hp-cells', 'hp-num', rizer.hp, rizer.maxHp);
    setMeter('stamina-cells', 'stamina-num', rizer.stamina, rizer.maxStamina);
    setMeter('energy-cells', 'energy-num', rizer.astralEnergy, rizer.maxAstralEnergy);
    const gem = document.querySelector('.rizer-portrait');
    if (gem) {
      const charge = Math.max(0, Math.min(1, rizer.astralEnergy / rizer.maxAstralEnergy));
      gem.style.setProperty('--gem-charge', charge.toFixed(3));
      gem.style.setProperty('--gem-pulse', `${(3.2 - charge * 1.65).toFixed(2)}s`);
      gem.style.setProperty('--gem-brightness', (0.62 + charge * 0.58).toFixed(2));
      gem.style.setProperty('--gem-glow', `${(3 + charge * 9).toFixed(1)}px`);
      gem.style.setProperty('--gem-peak', (0.96 + charge * 0.1).toFixed(2));
      gem.style.setProperty('--gem-dim', (0.64 + charge * 0.3).toFixed(2));
      gem.style.setProperty('--gem-aura-opacity', (0.18 + charge * 0.62).toFixed(2));
      gem.classList.toggle('low-charge', charge < 0.2);
    }
    // clock
    const { time, phase } = describeHour(hour);
    text('clock', time); text('phase', phase);
    drawMini(p, cam.yaw, rizer.facing, zyrex, seers);
    if (mapOpen) drawBig(p, rizer.facing);
  }
  function interact() {
    if (!promptTarget) return false;
    if (promptTarget.kind === 'chest' || promptTarget.kind === 'enemyLoot' || promptTarget.kind === 'astraliteGem') { $('#prompt').classList.remove('show'); return promptTarget; } // world loot handles itself, no card
    $('#card-title').textContent = promptTarget.name; $('#card-text').textContent = promptTarget.note || '';
    $('#card-kicker').textContent = KIND[promptTarget.kind] || 'MALEZOR';
    $('#card').classList.add('show'); $('#prompt').classList.remove('show'); cardTimer = 5.5; return promptTarget;
  }
  function say(name, line) {
    $('#card-title').textContent = name; $('#card-text').textContent = line || '';
    $('#card-kicker').textContent = KIND.npc; $('#card').classList.add('show'); $('#prompt').classList.remove('show'); cardTimer = 7;
  }
  function resize() {
    const dpr = devicePixelRatio; const mr = mini.getBoundingClientRect(); mini.width = Math.round(mr.width * dpr) || 300; mini.height = Math.round(mr.height * dpr) || 190;
    const br = big.getBoundingClientRect(); if (br.width) big.width = big.height = Math.round(br.width * dpr);
  }
  addEventListener('resize', resize); resize();
  let getScan = null;
  let levelFlash = 0;
  // Level / RXP panel: a view of the progression state (progression.js), never its owner.
  // info: { level, into, need, pct } · gained: RXP just awarded (shows "+N RXP") · levels: how many Levels that crossed.
  function setProgress(info, gained = 0, levels = 0) {
    const n = v => info.need >= 100000 ? compactFormat.format(v) : countFormat.format(v); // long counts go compact (1.23M / 3.32M) so the row always fits
    text('lvl-num', countFormat.format(info.level)); text('lvl-count', `${n(info.into)} / ${n(info.need)} RXP`);
    const fill = node('lvl-fill'), panel = node('rhud-level'), gain = node('lvl-gain'), again = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
    if (levels > 0 && panel) { again(panel, 'levelup'); clearTimeout(levelFlash); levelFlash = setTimeout(() => panel.classList.remove('levelup'), 900); } // a new Level: the bar starts over, no sweep backwards
    if (fill) fill.style.width = (Math.max(0, Math.min(1, info.pct)) * 100).toFixed(2) + '%';
    if (gained > 0 && gain) { gain.textContent = `+${countFormat.format(gained)} RXP`; again(gain, 'show'); }
  }
  function setWallet(inv) { text('coins-num', countFormat.format(inv.coins || 0)); text('gems-num', countFormat.format(inv.gems || 0)); }
  const api = { onEvent: null, mapToWorld, get mapCursor() { return mapCursor; }, set mapCursor(v) { mapCursor = v; }, extent: E, isLand, get mapView() { return mapView; }, setMapView, toggleMapView: () => setMapView(mapView === 'world' ? 'district' : 'world'), mapBounds: () => mapView === 'world' ? ZB : { x0: -E, x1: E, z0: -E, z1: E }, setScanSource: f => { getScan = f; }, setLootHint: n => { lootHint = n || null; }, setPartner, setWallet, setProgress, update, interact, say, resize, banner, places, found, regionOf: regionName, kindLabel: k => KIND[k] || 'MALEZOR', get hasPrompt() { return !!promptTarget; }, get doorPrompt() { return !!promptTarget?.door; }, get promptTarget() { return promptTarget; } };
  return api;
}
