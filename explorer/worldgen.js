// ★ 2026-10-07 · THE LIVING MASTER CODEX · OPEN-WORLD GENERATOR
//
// Every world is built from its Codex environment (environments.js): its tiles,
// palette, props, landmarks and peoples. The same seed always builds the same
// world, so a world is the same place every time Carl lands on it.
//
// Zyraxis is one seamless map: its ten districts laid out in the canon Z, I → X,
// with the hand-built Malezor (data.js) set into district I.
//
// Tile letters (one per cell):
//   .  ground          ,  ground (alternate / special)   ~  liquid (water, cloud sea)
//   d  path or bridge  #  wall (rock)                     T  tree   b  plant (examine)
//   B  boulder         A  mineral (examine)               P  scenery prop
//   S  the ship        E  cave mouth   M  carved record   X  sign   *  hidden find
//   L  landmark (a canon location)
(function(){
  'use strict';
  var ENV = {}; (window.AOV_ENV || []).forEach(function(e){ ENV[e.id] = e; });
  var FAUNA = window.AOV_FAUNA || { species:{}, peoples:{} };
  var SOLID = { T:1, b:1, B:1, '~':1, A:1, S:1, M:1, X:1, '#':1, P:1, L:1 };

  // ── seeded noise ──
  function hash(x, y, s){ var h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
  function smooth(t){ return t * t * (3 - 2 * t); }
  function vnoise(x, y, s){
    var xi = Math.floor(x), yi = Math.floor(y), xf = smooth(x - xi), yf = smooth(y - yi);
    var a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  }
  function fbm(x, y, s){ return vnoise(x, y, s) * .55 + vnoise(x * 2.1, y * 2.1, s + 7) * .3 + vnoise(x * 4.3, y * 4.3, s + 13) * .15; }
  function rng(seed){ seed = (seed >>> 0) || 1; return function(){ seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }

  function Map(id, W, H){
    this.id = id; this.W = W; this.H = H;
    this.grid = []; for (var i = 0; i < W * H; i++) this.grid.push('#');
    this.region = new Uint8Array(W * H);
    this.envs = []; this.props = {}; this.landmarks = []; this.npcs = []; this.spawns = [];
    this.signs = {}; this.warps = {}; this.records = []; this.ship = null;
  }
  Map.prototype.at = function(x, y){ return (x < 0 || y < 0 || x >= this.W || y >= this.H) ? '#' : this.grid[y * this.W + x]; };
  Map.prototype.set = function(x, y, ch){ if (x >= 0 && y >= 0 && x < this.W && y < this.H) this.grid[y * this.W + x] = ch; };
  Map.prototype.env = function(x, y){ return this.envs[this.region[y * this.W + x]] || this.envs[0]; };

  // ── terrain for one rectangle of the map, in one environment ──
  function terrain(m, x0, y0, w, h, ri, seed, opts){
    var e = m.envs[ri], hasSpecial = !!(e.tiles && e.tiles.special), cloud = e.tiles && e.tiles.liquid === 'cloud';
    var wet = opts.wet != null ? opts.wet : .3, high = opts.high != null ? opts.high : .69, r = rng(seed);
    for (var y = y0; y < y0 + h; y++) for (var x = x0; x < x0 + w; x++) {
      var i = y * m.W + x; m.region[i] = ri;
      var el = fbm(x / 13, y / 13, seed), mo = fbm(x / 8 + 50, y / 8 + 50, seed + 3), ch = '.';
      if (el > high) ch = '#';
      else if (el < wet) ch = '~';
      else if (mo > .63 && r() < .34) ch = e.props && e.props.length ? 'P' : 'T';
      else if (mo > .58 && r() < .05) ch = 'b';
      else if (hasSpecial && mo < .36 && r() < .5) ch = ',';
      else if (r() < .006) ch = 'B';
      m.grid[i] = ch;
      if (ch === 'P') m.props[i] = e.props[(r() * e.props.length) | 0];
    }
    if (cloud) for (y = y0; y < y0 + h; y++) for (x = x0; x < x0 + w; x++) if (m.grid[y * m.W + x] === '#' && r() < .5) m.grid[y * m.W + x] = '~';
  }
  function clearRect(m, cx, cy, rw, rh, ch){
    for (var y = cy - rh; y <= cy + rh; y++) for (var x = cx - rw; x <= cx + rw; x++) {
      if (x < 1 || y < 1 || x >= m.W - 1 || y >= m.H - 1) continue;
      m.set(x, y, ch || '.'); delete m.props[y * m.W + x];
    }
  }
  // a winding road from a to b; bridges water, cuts passes through rock
  function road(m, ax, ay, bx, by, r){
    var x = ax, y = ay, guard = 0;
    while ((x !== bx || y !== by) && guard++ < 4000) {
      var dx = bx - x, dy = by - y;
      if (Math.abs(dx) > 0 && (Math.abs(dy) === 0 || r() < Math.abs(dx) / (Math.abs(dx) + Math.abs(dy)))) x += dx > 0 ? 1 : -1;
      else y += dy > 0 ? 1 : -1;
      if (x < 1 || y < 1 || x >= m.W - 1 || y >= m.H - 1) continue;
      var c = m.at(x, y);
      if ('SEXMLA*'.indexOf(c) >= 0) continue;
      m.set(x, y, 'd'); delete m.props[y * m.W + x];
    }
  }
  function border(m){
    for (var x = 0; x < m.W; x++) { m.set(x, 0, '#'); m.set(x, m.H - 1, '#'); }
    for (var y = 0; y < m.H; y++) { m.set(0, y, '#'); m.set(m.W - 1, y, '#'); }
  }
  // a free ground cell inside a rectangle, away from the given points
  function spot(m, r, x0, y0, w, h, away, minD){
    for (var k = 0; k < 400; k++) {
      var x = x0 + 2 + ((r() * (w - 4)) | 0), y = y0 + 2 + ((r() * (h - 4)) | 0), ok = true;
      for (var j = 0; j < away.length && ok; j++) if (Math.abs(away[j].x - x) + Math.abs(away[j].y - y) < minD) ok = false;
      if (ok) return { x:x, y:y };
    }
    return { x:x0 + (w >> 1), y:y0 + (h >> 1) };
  }
  function reachable(m, sx, sy){
    var seen = new Uint8Array(m.W * m.H), q = [sy * m.W + sx]; seen[q[0]] = 1;
    while (q.length) {
      var c = q.pop(), cx = c % m.W, cy = (c / m.W) | 0;
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){
        var nx = cx + d[0], ny = cy + d[1], ni = ny * m.W + nx;
        if (nx < 0 || ny < 0 || nx >= m.W || ny >= m.H || seen[ni]) return;
        if (SOLID[m.grid[ni]] && m.grid[ni] !== 'S') return;
        seen[ni] = 1; q.push(ni);
      });
    }
    return seen;
  }
  function speciesFor(no, district){
    return Object.keys(FAUNA.species).filter(function(id){
      var s = FAUNA.species[id]; return s.world === no && (!district || s.district === district);
    });
  }
  // wild levels rise with distance from the start: Zyraxis by district order, other worlds by ring
  function levelFor(no, dIdx){ if (no === 9) return 2 + dIdx * 4; return 3 + Math.ceil(no / 4) * 4; }

  // people, records and landmarks inside one area of the map
  function populate(m, r, area, ri, opts){
    var e = m.envs[ri], pts = [{ x:area.sx, y:area.sy }];
    var gated = e.mechanic && /spoiler/i.test(e.mechanic.name);
    (gated ? [] : (e.landmarks || [])).slice(0, opts.landmarks || 3).forEach(function(name, i){
      var p = spot(m, r, area.x, area.y, area.w, area.h, pts, 12); pts.push(p);
      clearRect(m, p.x, p.y, 2, 2); m.set(p.x, p.y, 'L');
      m.landmarks.push({ x:p.x, y:p.y, name:name, id:'lm_' + e.id + '_' + i, env:e.id });
      road(m, area.sx, area.sy, p.x, p.y + 1, r);
    });
    var pe = opts.people;
    if (pe && pe.race) {
      for (var c = 0; c < (opts.camps || 1); c++) {
        var cp = spot(m, r, area.x, area.y, area.w, area.h, pts, 10); pts.push(cp);
        clearRect(m, cp.x, cp.y, 3, 2, 'd');
        for (var n = 0; n < (opts.perCamp || 2); n++) m.npcs.push({ x:cp.x - 1 + n * 2, y:cp.y, dir:'down', key:opts.peopleKey, env:e.id, n:n });
        road(m, area.sx, area.sy, cp.x, cp.y + 1, r);
      }
    } else if (pe && pe.record) {
      for (var k = 0; k < 3; k++) {
        var rp = spot(m, r, area.x, area.y, area.w, area.h, pts, 9); pts.push(rp);
        clearRect(m, rp.x, rp.y, 1, 1); m.set(rp.x, rp.y, 'M');
        m.records.push({ x:rp.x, y:rp.y, key:opts.peopleKey, n:k });
        road(m, area.sx, area.sy, rp.x, rp.y + 1, r);
      }
    }
    for (var a = 0; a < (opts.minerals || 3); a++) { var mp = spot(m, r, area.x, area.y, area.w, area.h, pts, 6); pts.push(mp); clearRect(m, mp.x, mp.y, 1, 1); m.set(mp.x, mp.y, 'A'); }
    for (var f = 0; f < (opts.finds || 2); f++) { var fp = spot(m, r, area.x, area.y, area.w, area.h, pts, 6); if (m.at(fp.x, fp.y) === '.') m.set(fp.x, fp.y, '*'); }
    return pts;
  }
  function spawnFauna(m, r, area, ids, count, lvl){
    if (!ids.length) return;
    var made = 0, tries = 0;
    while (made < count && tries++ < count * 30) {
      var x = area.x + 1 + ((r() * (area.w - 2)) | 0), y = area.y + 1 + ((r() * (area.h - 2)) | 0), ch = m.at(x, y);
      if (ch !== '.' && ch !== ',') continue;
      if (Math.abs(x - area.sx) + Math.abs(y - area.sy) < 6) continue;
      // lower tiers are commoner
      var pick = ids[(Math.pow(r(), 1.6) * ids.length) | 0];
      m.spawns.push({ x:x, y:y, id:pick, lv:lvl + ((r() * 4) | 0) });
      made++;
    }
  }
  function finish(m){
    // the ship stands three tiles wide and two tall around its anchor
    for (var j = -1; j <= 0; j++) for (var i = -1; i <= 1; i++) { var c = m.at(m.ship.x + i, m.ship.y + j); if (c !== '#' || j === 0) m.set(m.ship.x + i, m.ship.y + j, 'S'); delete m.props[(m.ship.y + j) * m.W + m.ship.x + i]; }
    var seen = reachable(m, m.ship.x, m.ship.y + 1);
    m.spawns = m.spawns.filter(function(s){ return seen[s.y * m.W + s.x]; });
    m.npcs = m.npcs.filter(function(n){ return seen[n.y * m.W + n.x]; });
    return m;
  }

  // ── one ordinary world ──
  function buildWorld(no){
    var w = (window.EXP_DATA.worlds || []).filter(function(x){ return x.no === no; })[0];
    var e = ENV[(w && w.name || '').toLowerCase()];
    if (!e) return null;
    var W = 84, H = 64, m = new Map('w' + no, W, H), seed = no * 7919 + 17, r = rng(seed);
    m.world = no; m.envs = [e]; m.name = e.id;
    terrain(m, 0, 0, W, H, 0, seed, {});
    border(m);
    var sx = 14 + ((r() * 8) | 0), sy = (H >> 1) + ((r() * 8) | 0) - 4;
    clearRect(m, sx, sy, 4, 3);
    m.ship = { x:sx, y:sy }; m.set(sx, sy, 'S');
    var area = { x:0, y:0, w:W, h:H, sx:sx, sy:sy + 1 };
    var people = FAUNA.peoples[no] || null;
    populate(m, r, area, 0, { people:people, peopleKey:'w' + no, camps:2, perCamp:2, landmarks:3, minerals:4, finds:3 });
    for (var k = 0; k < 4; k++) { var a = spot(m, r, 0, 0, W, H, [area], 18); road(m, sx, sy + 1, a.x, a.y, r); }
    spawnFauna(m, r, area, speciesFor(no), 16, levelFor(no));
    return finish(m);
  }

  // ── Zyraxis: the ten districts in the canon Z ──
  var DIST = ['malezor','zarvane','andrannor','veridan','netharion','vorashil','xilnar','baelgor','thardin','korathen'];
  var ZPOS = [[0,0],[1,0],[2,0],[3,0],[2,1],[1,1],[0,2],[1,2],[2,2],[3,2]];
  var CW = 36, CH = 28;
  function buildZyraxis(){
    var D = window.EXP_DATA, m = new Map('w9', CW * 4, CH * 3), seed = 9 * 7919 + 17, r = rng(seed);
    m.world = 9; m.name = 'zyraxis'; m.districts = [];
    m.envs = DIST.map(function(id){ return ENV[id]; }).concat([ENV.zyraxis]);
    // the two empty cells of the Z: the dome's edge, rock and still water
    [[0,1],[3,1]].forEach(function(c){
      terrain(m, c[0] * CW, c[1] * CH, CW, CH, 10, seed + 99, { high:.5, wet:.42 });
    });
    var centres = [];
    DIST.forEach(function(id, i){
      var cx = ZPOS[i][0] * CW, cy = ZPOS[i][1] * CH;
      terrain(m, cx, cy, CW, CH, i, seed + i * 31, { high:.72, wet:.28 });
      centres.push({ x:cx + (CW >> 1), y:cy + (CH >> 1) });
      m.districts.push({ id:id, x:cx, y:cy, w:CW, h:CH, i:i });
    });
    border(m);
    // Malezor, as built by hand, set into district I
    var MZ = D.maps.malezor, ox = 3, oy = 2, rows = MZ.rows, codes = { O:'otterlin', V:'verdanix', W:'aetherwing', C:'volcanut' };
    for (var y = 0; y < rows.length; y++) for (var x = 0; x < rows[y].length; x++) {
      var ch = rows[y][x], gx = ox + x, gy = oy + y, i2 = gy * m.W + gx;
      delete m.props[i2]; m.region[i2] = 0;
      if (codes[ch]) { m.spawns.push({ x:gx, y:gy, id:codes[ch], lv:2 + ((r() * 3) | 0), home:true }); ch = '.'; }
      if (ch === 'H') { m.npcs.push({ x:gx, y:gy, dir:'down', key:'furtrader', env:'malezor', n:0 }); ch = '.'; }
      if (ch === 'X') m.signs[i2] = 'ROUTE EAST · toward the silver district. The road is long. Keep your AIR in mind.';
      if (ch === 'M') m.records.push({ x:gx, y:gy, key:'markings', n:0 });
      m.grid[i2] = ch;
    }
    m.warps.E = { to:'firstden', x:5, y:7, dir:'up' };
    var sh = null;
    for (y = 0; y < rows.length && !sh; y++) { var sxi = rows[y].indexOf('S'); if (sxi >= 0) sh = { x:ox + sxi, y:oy + y }; }
    m.ship = sh;
    // the roads of the Z, district to district
    road(m, ox + 30, oy + 12, centres[1].x, centres[1].y, r);
    for (var d = 1; d < DIST.length - 1; d++) road(m, centres[d].x, centres[d].y, centres[d + 1].x, centres[d + 1].y, r);
    // what lives and stands in each district
    DIST.forEach(function(id, i){
      var a = m.districts[i], area = { x:a.x, y:a.y, w:a.w, h:a.h, sx:centres[i].x, sy:centres[i].y };
      if (i === 0) area = { x:a.x + 1, y:a.y + 26, w:a.w - 2, h:2, sx:centres[0].x, sy:centres[0].y };
      else {
        clearRect(m, centres[i].x, centres[i].y, 1, 1, 'd');
        populate(m, r, area, i, { people:FAUNA.peoples[9], peopleKey:'z_' + id, camps:1, perCamp:2, landmarks:3, minerals:2, finds:2 });
      }
      var ids = speciesFor(9, id).filter(function(s){ return i !== 0 || ['otterlin','verdanix','aetherwing','volcanut'].indexOf(s) < 0; });
      spawnFauna(m, r, i === 0 ? { x:a.x + 1, y:a.y + 1, w:a.w - 2, h:a.h - 2, sx:m.ship.x, sy:m.ship.y } : area, ids, i === 0 ? 4 : 9, levelFor(9, i));
    });
    // Malezor's own landmarks, beyond the meadow
    return finish(m);
  }

  // ── an interior from data.js (The First Den) ──
  function buildInterior(id){
    var def = window.EXP_DATA.maps[id]; if (!def) return null;
    var rows = def.rows, m = new Map(id, rows[0].length, rows.length);
    m.indoor = true; m.world = 9; m.location = def.location; m.name = def.district;
    m.envs = [ENV[def.district] || ENV.malezor];
    for (var y = 0; y < m.H; y++) for (var x = 0; x < m.W; x++) {
      var ch = rows[y][x];
      if (ch === 'M') m.records.push({ x:x, y:y, key:'markings', n:0 });
      m.grid[y * m.W + x] = ch;
    }
    m.warps.x = { to:'w9', x:30, y:5, dir:'down' };
    return m;
  }

  var cache = {};
  function build(id){
    if (cache[id]) return cache[id];
    var m = id === 'w9' ? buildZyraxis() : /^w\d+$/.test(id) ? buildWorld(+id.slice(1)) : buildInterior(id);
    if (m) cache[id] = m;
    return m;
  }
  // which district (Zyraxis) or world a cell belongs to
  function zoneAt(m, x, y){
    if (!m.districts) return null;
    for (var i = 0; i < m.districts.length; i++) { var d = m.districts[i]; if (x >= d.x && y >= d.y && x < d.x + d.w && y < d.y + d.h) return d; }
    return null;
  }

  window.AOV_WORLDGEN = { build:build, zoneAt:zoneAt, SOLID:SOLID, DISTRICTS:DIST, levelFor:levelFor };
})();
