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
  // Authored biome levels are available to future selectors without changing
  // the current seeded map behavior.
  var AOV_BIOME_MANIFEST = window.AOV_BIOMES || {};
  function biomesForWorld(worldId){
    return AOV_BIOME_MANIFEST.byWorld ? AOV_BIOME_MANIFEST.byWorld(worldId) : [];
  }
  var SOLID = { T:1, b:1, B:1, '~':1, A:1, S:1, M:1, X:1, '#':1, P:1, L:1, F:1, w:1, K:1 };

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
      if (ch === 'P') { var wx = (window.AOV_WORLD_ART || { env:{} }).env[e.id], pool = wx && wx.extra ? e.props.concat([[wx.extra.key, '__x']]) : e.props; m.props[i] = pool[(r() * pool.length) | 0]; }
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
    var x = ax, y = ay, guard = 0, trail = [];
    while ((x !== bx || y !== by) && guard++ < 4000) {
      var dx = bx - x, dy = by - y;
      if (Math.abs(dx) > 0 && (Math.abs(dy) === 0 || r() < Math.abs(dx) / (Math.abs(dx) + Math.abs(dy)))) x += dx > 0 ? 1 : -1;
      else y += dy > 0 ? 1 : -1;
      if (x < 1 || y < 1 || x >= m.W - 1 || y >= m.H - 1) continue;
      var c = m.at(x, y);
      if ('SEXMLA*FwK'.indexOf(c) >= 0) continue;
      m.set(x, y, 'd'); delete m.props[y * m.W + x]; trail.push({ x:x, y:y });
    }
    return trail;
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
    // a crowded area: stand a little closer rather than on top of someone
    // (never closer than 3, or 6 for landmarks, so the ground cleared around one never erases another)
    var floor = arguments[8] || (minD >= 8 ? 6 : 3);
    if (minD > floor) return spot(m, r, x0, y0, w, h, away, minD - 1, floor);
    return { x:x0 + (w >> 1), y:y0 + (h >> 1), full:true };
  }
  function reachable(m, sx, sy){
    var seen = new Uint8Array(m.W * m.H), q = [sy * m.W + sx]; seen[q[0]] = 1;
    while (q.length) {
      var c = q.pop(), cx = c % m.W, cy = (c / m.W) | 0;
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){
        var nx = cx + d[0], ny = cy + d[1], ni = ny * m.W + nx;
        if (nx < 0 || ny < 0 || nx >= m.W || ny >= m.H || seen[ni]) return;
        if (SOLID[m.grid[ni]] && m.grid[ni] !== 'S' && !(m.gate && m.gate.some(function(g){ return g.x === nx && g.y === ny; }))) return;
        seen[ni] = 1; q.push(ni);
      });
    }
    return seen;
  }
  function speciesFor(no, district){
    return Object.keys(FAUNA.species).filter(function(id){
      var s = FAUNA.species[id]; return s.world === no && !s.retired && !s.hidden && (!district || s.district === district);
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
  // THE WAY HOME · each world's sealed vault, as far from the ship as the area allows. Peoples set a
  // warden on it and have a refugee camp in a war region; worlds without a people (and Zyraxis) have an
  // Aethren guardian at the vault instead.
  function strongest(no, district){
    return speciesFor(no, district).filter(function(id){ return (FAUNA.species[id].tier || 1) <= 8; }).sort(function(a, b){ return (FAUNA.species[b].tier || 0) - (FAUNA.species[a].tier || 0) || (a < b ? -1 : 1); });
  }
  function vault(m, r, area, no, envId, people, lvl, district){
    var best = null, bd = -1, stood = m.records.concat(m.landmarks, m.npcs);   // keep clear of what already stands here
    for (var k = 0; k < 50; k++) {
      var p = spot(m, r, area.x, area.y, area.w, area.h, [], 0), d = Math.abs(p.x - area.sx) + Math.abs(p.y - area.sy);
      if (stood.some(function(o){ return Math.abs(o.x - p.x) <= 5 && Math.abs(o.y - p.y) <= 5; })) continue;
      if (d > bd && p.y > area.y + 3 && p.y < area.y + area.h - 4) { bd = d; best = p; }
    }
    if (!best) best = spot(m, r, area.x, area.y, area.w, area.h, stood, 8);
    clearRect(m, best.x, best.y, 3, 3, 'd'); m.set(best.x, best.y, 'K');
    m.vault = { x:best.x, y:best.y, no:no };
    road(m, area.sx, area.sy, best.x, best.y + 2, r);
    if (people && people.race) {
      m.npcs.push({ x:best.x + 1, y:best.y + 2, dir:'down', key:'warden_w' + no, env:envId, n:0, warden:true });
      var rp = spot(m, r, area.x, area.y, area.w, area.h, [best, { x:area.sx, y:area.sy }].concat(stood), 12);
      clearRect(m, rp.x, rp.y, 3, 2, 'd');
      for (var n = 0; n < 3; n++) m.npcs.push({ x:rp.x - 1 + n, y:rp.y, dir:'down', key:'ref_w' + no, env:envId, n:n, refugee:true });
      m.refugeeCamp = { x:rp.x, y:rp.y };
      road(m, area.sx, area.sy, rp.x, rp.y + 1, r);
    } else {
      var g = strongest(no, district)[0];
      if (g) m.spawns.push({ x:best.x + 1, y:best.y + 1, id:g, lv:lvl + 8, guardian:true });
    }
  }
  // THE MASTER CODEX on the ground (explorer/codex_beings.js): every person lives on their home world, and every
  // other Codex entry (index terms, pages, the timeline) is a landmark, a find or a record stone there.
  //   rg = { name, i, n } on a regional world: only what belongs to that region (things with no region named
  //   are spread across the regions). Landmarks go down first, so a Viridian district's people and records
  //   can stand around their district's landmark.
  function codexPlace(m, r, area, no, district, envId, pts, rg){
    var CX = window.AOV_CODEX; if (!CX) return;
    function mine(home, key){ return !rg || (home.region ? home.region === rg.name : hashStr(key) % rg.n === rg.i); }
    var here = CX.beings.filter(function(b){
      if (b.kind !== 'humanoid' || !b.home || b.home.world !== no) return false;
      if (no !== 9) return mine(b.home, b.id);
      var d = b.home.district || ZD9[hashStr(b.id) % 9];   // Malezor's own people live in the hand-built meadow (malezorPeople)
      return d === district;
    });
    // keep clear of everything already standing in this area (camps, landmarks, records, the vault)
    pts = (pts || [{ x:area.sx, y:area.sy }]).concat(m.landmarks, m.records, m.npcs, m.vault ? [m.vault] : []).filter(function(o){
      return o.x >= area.x - 3 && o.y >= area.y - 3 && o.x < area.x + area.w + 3 && o.y < area.y + area.h + 3; });
    m.anchors = m.anchors || {};
    function near(home, minD){
      var a = home && home.near && m.anchors[home.near];
      if (!a) return spot(m, r, area.x, area.y, area.w, area.h, pts, minD);
      var x0 = Math.max(area.x, a.x - 9), y0 = Math.max(area.y, a.y - 8), x1 = Math.min(area.x + area.w, a.x + 10), y1 = Math.min(area.y + area.h, a.y + 9);
      var q = spot(m, r, x0, y0, x1 - x0, y1 - y0, pts, minD);
      return q.full ? spot(m, r, area.x, area.y, area.w, area.h, pts, minD) : q;   // the district is full: the next street over
    }
    // everything else the Codex names (places, relics, concepts, books, games, the timeline) stands here too:
    // landmarks to reach, finds to pick up, and record stones to read once you know this world's words
    var lore = [];
    codexLore(function(pl){ return here9(no, district)(pl) && mine(pl.home, pl.term || (pl.terms || []).concat(pl.pages || []).join('|')); }, function(pl){ lore.push(pl); });
    lore.sort(function(a, b){ return (a.t === 'lm' ? 0 : 1) - (b.t === 'lm' ? 0 : 1); });
    lore.forEach(function(pl){
      var q = pl.t === 'lm' ? spot(m, r, area.x, area.y, area.w, area.h, pts, 8) : near(pl.home, 4); pts.push(q);
      if (pl.t === 'lm') {
        clearRect(m, q.x, q.y, 2, 2); m.set(q.x, q.y, 'L'); m.anchors[pl.term] = q;
        m.landmarks.push({ x:q.x, y:q.y, name:pl.term, id:'cxl_' + pl.i, env:'codex', codexTerm:pl.term });
      } else if (pl.t === 'find') {
        clearRect(m, q.x, q.y, 1, 1); m.set(q.x, q.y, '*');
        (m.codexFinds = m.codexFinds || {})[q.y * m.W + q.x] = pl.term;
      } else {
        clearRect(m, q.x, q.y, 1, 1); m.set(q.x, q.y, 'M');
        m.records.push({ x:q.x, y:q.y, key:'cxs_' + pl.i, n:0, codexTerms:pl.terms || [], codexPages:pl.pages || [] });
      }
      road(m, area.sx, area.sy, q.x, q.y + 1, r);
    });
    here.filter(function(b){ return b.place === 'npc'; }).forEach(function(b, i){
      var p = near(b.home, 3); pts.push(p);
      clearRect(m, p.x, p.y, 1, 1, 'd'); road(m, area.sx, area.sy, p.x, p.y + 1, r);
      m.npcs.push({ x:p.x, y:p.y, dir:'down', key:'cx_' + b.id, codex:b.id, env:envId, n:i, person:true });
    });
  }
  // Zyraxis: entries with no district (or Malezor, the hand-built opening) are spread across the other nine
  var ZD9 = ['zarvane','andrannor','veridan','netharion','vorashil','xilnar','baelgor','thardin','korathen'];
  function hashStr(s){ var h = 0; for (var c = 0; c < s.length; c++) h = (h * 31 + s.charCodeAt(c)) >>> 0; return h; }
  function here9(no, district){
    return function(pl){
      if (!pl.home || pl.home.world !== no) return false;
      if (no !== 9) return true;
      var d = pl.home.district && pl.home.district !== 'malezor' ? pl.home.district : ZD9[hashStr(pl.term || (pl.terms || []).concat(pl.pages || []).join('|')) % 9];
      return d === district;
    };
  }
  // Malezor is built by hand, so its Codex people stand on open ground beside its road, clear of the ship
  function malezorPeople(m, ox, oy, rows){
    var CX = window.AOV_CODEX; if (!CX) return;
    var folk = CX.beings.filter(function(b){ return b.kind === 'humanoid' && b.place === 'npc' && b.home && b.home.world === 9 && b.home.district === 'malezor'; });
    var slots = [], taken = m.npcs.concat(m.spawns, [m.ship]);
    for (var y = 1; y < rows.length - 1; y++) for (var x = 1; x < rows[y].length - 1; x++) {
      if (rows[y][x] !== '.' || rows[y + 1][x] !== 'd') continue;   // stand just above the road, facing it
      var gx = ox + x, gy = oy + y;
      if (taken.concat(slots).some(function(t){ return Math.abs(t.x - gx) + Math.abs(t.y - gy) < 4; })) continue;
      slots.push({ x:gx, y:gy });
    }
    folk.forEach(function(b, i){ var p = slots[i]; if (p) m.npcs.push({ x:p.x, y:p.y, dir:'down', key:'cx_' + b.id, codex:b.id, env:'malezor', n:i, person:true }); });
  }
  function codexLore(test, fn){
    var PL = (window.AOV_CODEX || {}).placements || [];
    PL.forEach(function(pl, i){ if (test(pl)) { pl.i = i; fn(pl); } });
  }
  function finish(m){
    // the ship stands three tiles wide and two tall around its anchor
    for (var j = -1; j <= 0; j++) for (var i = -1; i <= 1; i++) { var c = m.at(m.ship.x + i, m.ship.y + j); if (c !== '#' || j === 0) m.set(m.ship.x + i, m.ship.y + j, 'S'); delete m.props[(m.ship.y + j) * m.W + m.ship.x + i]; }
    var seen = reachable(m, m.ship.x, m.ship.y + 1);
    m.spawns = m.spawns.filter(function(s){ return seen[s.y * m.W + s.x]; });
    m.npcs = m.npcs.filter(function(n){ return seen[n.y * m.W + n.x]; });
    return m;
  }

  // ── one ordinary world, in its named regions ──
  // Every world is split into the regions of its biome manifest (explorer/biomes.js): five laid out as a compass
  // cross with the first in the middle, Origon's ten lands in a 4 × 3 grid. Viridia uses its five canon regions
  // (Northern, Eastern, Central, Southern, Western), each in its own country: frost to the north, fire to the
  // south, coast to the east, dust and canyon to the west. Worlds with many Codex people and places grow.
  var CROSS = [[1,1],[1,0],[2,1],[1,2],[0,1]];
  var VIR_CELL = { 'Central Region':[1,1], 'Northern Region':[1,0], 'Eastern Region':[2,1], 'Southern Region':[1,2], 'Western Region':[0,1] };
  var VIR_SKIN = { 'Northern Region':'yvoris', 'Southern Region':'pyrauna', 'Eastern Region':'halcyra', 'Western Region':'nexyros' };
  function regionsOf(no){
    var B = window.AOV_BIOMES, w = B && B.worlds && B.worlds[no];
    var names = w ? w[4].filter(function(x){ return typeof x === 'string'; }) : [];
    if (names.length < 2) return null;
    if (no === 27) { var ord = ['Central Region','Northern Region','Eastern Region','Southern Region','Western Region']; if (ord.every(function(n){ return names.indexOf(n) >= 0; })) names = ord; }
    var cols, rows, cells, L = ((window.AOV_WORLDCANON || {}).worlds || {})[no];
    L = L && L.layout;
    if (L && names.every(function(n){ return L.cells[n]; })) return { names:names, cols:L.cols, rows:L.rows, cells:names.map(function(n){ return L.cells[n]; }), cross:false };   // Origon: the Codex's compass
    if (names.length <= 5) { cols = 3; rows = 3; cells = names.map(function(n, i){ return no === 27 ? VIR_CELL[n] : CROSS[i]; }); }
    else { cols = Math.ceil(Math.sqrt(names.length)); rows = Math.ceil(names.length / cols); cells = names.map(function(n, i){ return [i % cols, (i / cols) | 0]; }); }
    return { names:names, cols:cols, rows:rows, cells:cells, cross:names.length <= 5 };
  }
  function terrainFor(name){
    var n = String(name).toLowerCase();
    if (/sea|shallow|reef|harbo|deep|shoal|coast|water|bay|tide|current|sharedwater/.test(n)) return { wet:.4, high:.75 };
    if (/mountain|peak|cliff|slope|shelf|aerie|crag|heights|ridge|forge/.test(n)) return { wet:.24, high:.62 };
    if (/plain|field|flat|grass|march|road|causeway/.test(n)) return { wet:.22, high:.78 };
    return { wet:.3, high:.69 };
  }
  function buildWorld(no){
    var w = (window.EXP_DATA.worlds || []).filter(function(x){ return x.no === no; })[0];
    var e = ENV[(w && w.name || '').toLowerCase()];
    if (!e) return null;
    var RG = regionsOf(no);
    var CX = window.AOV_CODEX || {};
    var load = (CX.beings || []).filter(function(b){ return b.kind === 'humanoid' && b.home && b.home.world === no; }).length +
               (CX.placements || []).filter(function(p){ return p.home && p.home.world === no; }).length * .6;
    if (!RG) return buildOpenWorld(no, e, load);
    // size the regions by the busiest one, so a crowded region (Lumeria's Halo Archive, Central Viridia) has room
    var n = RG.names.length, per = {};
    (CX.beings || []).filter(function(b){ return b.kind === 'humanoid' && b.home && b.home.world === no; }).forEach(function(b){ var k = b.home.region || '*'; per[k] = (per[k] || 0) + 1; });
    (CX.placements || []).filter(function(p){ return p.home && p.home.world === no; }).forEach(function(p){ var k = p.home.region || '*'; per[k] = (per[k] || 0) + .6; });
    var busiest = Math.max.apply(null, RG.names.map(function(nm){ return (per[nm] || 0) + (per['*'] || 0) / n; }).concat([0]));
    var g = Math.max(1, Math.min(1.8, Math.sqrt(Math.max(load / (n * 12), busiest / 22)))), cw = Math.round(40 * g), ch = Math.round(32 * g);
    var W = cw * RG.cols, H = ch * RG.rows, m = new Map('w' + no, W, H), seed = no * 7919 + 17, r = rng(seed);
    m.world = no; m.name = e.id; m.districts = [];
    m.envs = RG.names.map(function(name){
      var skin = no === 27 && ENV[VIR_SKIN[name]];
      return skin ? Object.assign({}, skin, { kind:e.kind, no:e.no, name:e.name, title:e.title, canon:e.canon, concept:e.concept, hazard:e.hazard, mechanic:e.mechanic, landmarks:[], lord:e.lord, spoiler:e.spoiler }) : e;
    });
    var ri0 = m.envs.length;
    m.envs.push(Object.assign({}, e, { landmarks:[] }));   // the wild edges between the arms of the cross
    for (var cy = 0; cy < RG.rows; cy++) for (var cx = 0; cx < RG.cols; cx++) {
      if (RG.cells.some(function(c){ return c[0] === cx && c[1] === cy; })) continue;
      terrain(m, cx * cw, cy * ch, cw, ch, ri0, seed + 99 + cx * 7 + cy * 13, no === 27 || /ocean|harmony/.test((window.AOV_BIOMES.worlds[no] || [])[3]) ? { high:.8, wet:.55 } : { high:.48, wet:.3 });
    }
    var areas = RG.names.map(function(name, i){
      var c = RG.cells[i], x0 = c[0] * cw, y0 = c[1] * ch;
      terrain(m, x0, y0, cw, ch, i, seed + i * 31, terrainFor(name));
      m.districts.push({ id:'rg_' + no + '_' + i, name:name, x:x0, y:y0, w:cw, h:ch, i:i });
      return { x:x0, y:y0, w:cw, h:ch, sx:x0 + (cw >> 1), sy:y0 + (ch >> 1), name:name, i:i };
    });
    border(m);
    areas.forEach(function(a){ clearRect(m, a.sx, a.sy, 1, 1, 'd'); });
    // the ship sets down in the first region (Viridia: the Central Region), west of its centre
    var a0 = areas[0], sx = a0.x + 8 + ((r() * 4) | 0), sy = a0.sy + ((r() * 6) | 0) - 3;
    clearRect(m, sx, sy, 4, 3);
    m.ship = { x:sx, y:sy }; m.set(sx, sy, 'S');
    road(m, sx, sy + 1, a0.sx, a0.sy, r);
    // the roads between regions: out from the centre of the cross, or region to region across the grid
    areas.forEach(function(a, i){
      if (RG.cross) { if (i > 0) road(m, a0.sx, a0.sy, a.sx, a.sy, r); return; }
      // a grid: each region joins its neighbours to the east and south
      areas.forEach(function(b){ var ca = RG.cells[a.i], cb = RG.cells[b.i]; if ((cb[0] === ca[0] + 1 && cb[1] === ca[1]) || (cb[1] === ca[1] + 1 && cb[0] === ca[0])) road(m, a.sx, a.sy, b.sx, b.sy, r); });
    });
    var people = FAUNA.peoples[no] || null;
    a0.sx = sx; a0.sy = sy + 1;
    areas.forEach(function(a, i){
      populate(m, r, a, i, i === 0 ? { people:people, peopleKey:'w' + no, camps:2, perCamp:2, landmarks:3, minerals:3, finds:2 } : { landmarks:0, minerals:2, finds:1 });
      spawnFauna(m, r, a, speciesFor(no), Math.ceil(18 / n) + 1, levelFor(no));
    });
    // the vault lies in the region farthest from the ship
    var far = areas.slice(1).sort(function(p, q){ return (Math.abs(q.sx - sx) + Math.abs(q.sy - sy)) - (Math.abs(p.sx - sx) + Math.abs(p.sy - sy)); })[0];
    vault(m, r, far, no, e.id, people, levelFor(no));
    canonPlace(m, r, areas, no, e.id);
    if (no !== 28) areas.forEach(function(a, i){ codexPlace(m, r, a, no, null, e.id, null, { name:a.name, i:i, n:n }); });
    return finish(m);
  }
  // THE WORLDS, FLESHED OUT (explorer/world_canon.js, from game_roster/world_canon.json): in each region, a marker
  // stone with the Codex's note, the camps of its peoples, its named figures, and its sites
  function canonPlace(m, r, areas, no, envId){
    var W = ((window.AOV_WORLDCANON || {}).worlds || {})[no]; if (!W) return;
    var byName = {}; areas.forEach(function(a){ byName[a.name] = a; });
    var spName = {}; Object.keys(FAUNA.species).forEach(function(id){ var s = FAUNA.species[id]; if (s.name && !s.retired) spName[s.name.toLowerCase()] = id; });
    function free(a, d){ return spot(m, r, a.x, a.y, a.w, a.h, [{ x:a.sx, y:a.sy }].concat(m.landmarks, m.records, m.npcs, m.vault ? [m.vault] : [], m.refugeeCamp ? [m.refugeeCamp] : []), d); }
    function site(a, name, text, id){
      var q = free(a, 7); clearRect(m, q.x, q.y, 1, 1); m.set(q.x, q.y, 'L'); road(m, a.sx, a.sy, q.x, q.y + 1, r);
      m.landmarks.push({ x:q.x, y:q.y, name:name, id:id, env:'codex', codexTerm:name, text:name.toUpperCase() + '. ' + text });
      return q;
    }
    var named = {};
    areas.forEach(function(a){ if (W.notes && W.notes[a.name]) site(a, a.name, W.notes[a.name], 'rgm_' + no + '_' + a.i); });
    (W.sites || []).forEach(function(x, k){ var a = byName[x.region]; if (!a || named[x.name]) return; named[x.name] = 1; site(a, x.name, x.text, 'site_' + no + '_' + k); });
    (W.peoples || []).forEach(function(pe, k){
      (pe.regions || []).forEach(function(rn, j){
        var a = byName[rn]; if (!a) return;
        var c = free(a, 8); clearRect(m, c.x, c.y, 3, 2, 'd'); road(m, a.sx, a.sy, c.x, c.y + 1, r);
        for (var t = 0; t < 2; t++) m.npcs.push({ x:c.x - 1 + t * 2, y:c.y, dir:'down', key:'folk_' + no + '_' + k, env:envId, n:j * 2 + t, folk:{ name:pe.name, text:pe.text } });
      });
    });
    (W.figures || []).forEach(function(f, k){
      var a = byName[f.region]; if (!a) return;
      var sid = spName[String(f.name).toLowerCase()];
      if (sid) {   // an Aethren of the Codex who keeps to this region
        var q = free(a, 6); clearRect(m, q.x, q.y, 1, 1); road(m, a.sx, a.sy, q.x, q.y, r);
        m.spawns.push({ x:q.x, y:q.y, id:sid, lv:levelFor(no) + 8, calm:true, figure:true });
      } else if (f.kind === 'humanoid') {
        var p = free(a, 6); clearRect(m, p.x, p.y, 1, 1, 'd'); road(m, a.sx, a.sy, p.x, p.y + 1, r);
        m.npcs.push({ x:p.x, y:p.y, dir:'down', key:'fig_' + no + '_' + k, env:envId, n:0, figure:{ name:f.name, text:f.text } });
      } else if (!named[f.name]) { named[f.name] = 1; site(a, f.name, f.text, 'fig_' + no + '_' + k); }   // axis-beings and the like: a presence at a place
    });
  }
  // a world with no named regions: one open map, as before
  function buildOpenWorld(no, e, load){
    var grow = load > 20 ? Math.min(2.2, Math.sqrt(load / 20)) : 1;
    var W = Math.round(84 * grow), H = Math.round(64 * grow), m = new Map('w' + no, W, H), seed = no * 7919 + 17, r = rng(seed);
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
    vault(m, r, area, no, e.id, people, levelFor(no));
    if (no !== 28) codexPlace(m, r, area, no, null, e.id);
    return finish(m);
  }

  // ── Zyraxis: the ten districts in the canon Z ──
  // Codex · WORLDS · Zyraxis geography expansion: the TEN routes (west to east), each with a Gemlord Cave for its
  // owning Gemlord; the interstitial regions; the Bridge of Hope south of Baelgor and Xilnar; the Part 2 southern zones.
  var ZROUTES = ['Valley of the Benevolent Beast','Choir of the Pearlord','Wilds of the Citrinehowl','Verge of the Emeraldbloom','Rift of the Amethyst Voice','Skylanes of the Sapphirebroker','Threshold of the Onyxwhisper','Roads of the Amberchain','Fracture of the Anomaly','Throne of the Ultralord'];
  var ZGEMLORDS = ['rakoron','ivirium','mutaryn','emeralix','eurakeon','azurel','obsidius','ambrevon','oathane','oatheus'];
  var ZEXTRA = [   // [id, name, cell x, cell y, codex text]
    ['wildmarch', 'The Wild March', 0, 1, 'Mid-north, between Malezor, Zarvane, Andrannor and Netharion. Training, exploration, sidequests, and wild Zyrex of every type.'],
    ['greendivide', 'The Green Divide', 3, 1, 'Mid-east, between Andrannor, Veridan and Netharion. Nature-family Zyrex, and the terrain of the Verdant Awakening.'],
    ['bridgeofhope', 'The Bridge of Hope', 0, 3, 'A ceremonial corridor south of Baelgor and Xilnar, joining the main continent to the southern lands. It opens only after the endgame.'],
    ['throne', 'The Throne', 3, 3, 'The terminal route: from Korathen, the Throne of the Ultralord.'],
    ['oldconquest', 'The Old Conquest', 0, 4, 'Pre-Accord ruins, ghost-Zyrex, and the era before free will.'],
    ['newconquest', 'The New Conquest', 1, 4, 'Seer-remnant country: reconciliation, and healing after the long war.'],
    ['pitofnoreturn', 'The Pit of No Return', 2, 4, 'The southernmost molten zone. The final challenge.']
  ];
  var ZSHRINES = ['Sunlit Pillar','Broken Obelisk','Great Tree','Void Rift','Alien Landing Pad','Spirit Tree','Forge Anvil','Machine Tower','Throne Dais'];
  var DIST = ['malezor','zarvane','andrannor','veridan','netharion','vorashil','xilnar','baelgor','thardin','korathen'];
  var ZPOS = [[0,0],[1,0],[2,0],[3,0],[2,1],[1,1],[0,2],[1,2],[2,2],[3,2]];
  var CW = 36, CH = 28;
  function buildZyraxis(){
    // rows 0-2: the Z of districts; row 3 (half height): the Bridge of Hope and the Throne; row 4: the southern lands
    var BH = CH >> 1, D = window.EXP_DATA, m = new Map('w9', CW * 4, CH * 4 + BH), seed = 9 * 7919 + 17, r = rng(seed);
    m.world = 9; m.name = 'zyraxis'; m.districts = [];
    m.envs = DIST.map(function(id){ return ENV[id]; }).concat([ENV.zyraxis]);
    var cellY = function(cy){ return cy <= 3 ? cy * CH : 3 * CH + BH; }, cellH = function(cy){ return cy === 3 ? BH : CH; };
    // what is not a district or a named region: the dome's edge, rock and still water
    for (var ey = 0; ey < 5; ey++) for (var ex = 0; ex < 4; ex++) terrain(m, ex * CW, cellY(ey), CW, cellH(ey), 10, seed + 99, { high:.5, wet:.42 });
    var xc = ZEXTRA.map(function(z){
      var x0 = z[2] * CW, y0 = cellY(z[3]), w = z[0] === 'bridgeofhope' ? CW * 2 : CW, h = cellH(z[3]);
      terrain(m, x0, y0, w, h, 10, seed + 7 * x0 + y0, z[0] === 'pitofnoreturn' ? { high:.66, wet:.2 } : z[0] === 'bridgeofhope' ? { high:.9, wet:.0 } : { high:.72, wet:.28 });
      return { id:z[0], name:z[1], text:z[4], x:x0, y:y0, w:w, h:h, sx:x0 + (w >> 1), sy:y0 + (h >> 1) };
    });
    var centres = [];
    DIST.forEach(function(id, i){
      var cx = ZPOS[i][0] * CW, cy = ZPOS[i][1] * CH;
      terrain(m, cx, cy, CW, CH, i, seed + i * 31, { high:.72, wet:.28 });
      centres.push({ x:cx + (CW >> 1), y:cy + (CH >> 1) });
      m.districts.push({ id:id, x:cx, y:cy, w:CW, h:CH, i:i });
    });
    xc.forEach(function(a){ m.districts.push({ id:a.id, name:a.name, x:a.x, y:a.y, w:a.w, h:a.h, extra:true }); });   // after the ten, so districts[0-9] stay the Z
    border(m);
    xc.forEach(function(a){ clearRect(m, a.sx, a.sy, 1, 1, 'd'); });
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
    malezorPeople(m, ox, oy, rows);
    // the roads of the Z, district to district
    var trails = [road(m, ox + 30, oy + 12, centres[1].x, centres[1].y, r)];
    for (var d = 1; d < DIST.length - 1; d++) trails.push(road(m, centres[d].x, centres[d].y, centres[d + 1].x, centres[d + 1].y, r));
    var X = {}; xc.forEach(function(a){ X[a.id] = a; });
    trails.push(road(m, centres[9].x, centres[9].y, X.throne.sx, X.throne.sy, r));           // route 10: Korathen to the Throne
    road(m, centres[5].x, centres[5].y, X.wildmarch.sx, X.wildmarch.sy, r);                    // Vorashil to the Wild March
    road(m, centres[4].x, centres[4].y, X.greendivide.sx, X.greendivide.sy, r);                // Netharion to the Green Divide
    road(m, X.greendivide.sx, X.greendivide.sy, centres[3].x, centres[3].y, r);                // and on to Veridan
    // the Bridge of Hope: from between Xilnar and Baelgor, south across the gap to the southern lands
    var bx = CW, by0 = 3 * CH, br = X.bridgeofhope;
    road(m, centres[6].x, centres[6].y, bx, by0 - 2, r); road(m, centres[7].x, centres[7].y, bx, by0 - 2, r);
    for (var yy = by0 - 2; yy < by0 + BH + 2; yy++) for (var xx = bx - 1; xx <= bx + 1; xx++) { m.set(xx, yy, 'd'); delete m.props[yy * m.W + xx]; }
    m.gate = [{ x:bx - 1, y:by0 + 1 }, { x:bx, y:by0 + 1 }, { x:bx + 1, y:by0 + 1 }];
    m.gate.forEach(function(g){ m.set(g.x, g.y, '#'); });
    m.set(bx + 2, by0, 'X'); m.signs[by0 * m.W + bx + 2] = 'THE BRIDGE OF HOPE. A ceremonial corridor to the southern lands. Its gate opens only when the long work is done (restore every system of the ship).';
    road(m, bx, by0 + BH + 2, X.oldconquest.sx, X.oldconquest.sy, r); road(m, bx, by0 + BH + 2, X.newconquest.sx, X.newconquest.sy, r);
    road(m, X.newconquest.sx, X.newconquest.sy, X.pitofnoreturn.sx, X.pitofnoreturn.sy, r);
    // the nine routes of the Z (Codex · 9 District Routes), each marked where it crosses into the next district
    var caves = [];
    ZROUTES.forEach(function(name, k){
      var t = trails[k] || [], d2 = k < 9 ? m.districts.filter(function(z){ return z.id === DIST[k + 1]; })[0] : X.throne, hit = null;
      for (var j = 0; j < t.length && !hit; j++) if (t[j].x >= d2.x && t[j].y >= d2.y && t[j].x < d2.x + d2.w && t[j].y < d2.y + d2.h) hit = t[Math.min(t.length - 1, j + 2)];
      hit = hit || t[t.length >> 1]; if (!hit) return;
      [[1,0],[-1,0],[0,1],[0,-1]].some(function(o){ var x = hit.x + o[0], y = hit.y + o[1], c = m.at(x, y);
        if (c !== '.' && c !== ',') return false; m.set(x, y, 'X'); m.signs[y * m.W + x] = 'ROUTE MARKER · ' + name.toUpperCase() + '. Carved deep, and kept clear by someone.'; return true; });
      caves.push({ k:k, name:name, t:t });
    });
    // what lives and stands in each district
    DIST.forEach(function(id, i){
      var a = m.districts[i], area = { x:a.x, y:a.y, w:a.w, h:a.h, sx:centres[i].x, sy:centres[i].y };
      if (i === 0) area = { x:a.x + 1, y:a.y + 26, w:a.w - 2, h:2, sx:centres[0].x, sy:centres[0].y };
      else {
        clearRect(m, centres[i].x, centres[i].y, 1, 1, 'd');
        populate(m, r, area, i, { people:FAUNA.peoples[9], peopleKey:'z_' + id, camps:1, perCamp:2, landmarks:3, minerals:2, finds:2 });
      }
      if (i > 0) {
        // each district beyond Malezor has its shrine (Codex · District Shrine)
        var sp = spot(m, r, area.x, area.y, area.w, area.h, [{ x:area.sx, y:area.sy }].concat(m.landmarks, m.records, m.npcs), 7);
        clearRect(m, sp.x, sp.y, 2, 2); m.set(sp.x, sp.y, 'L'); road(m, area.sx, area.sy, sp.x, sp.y + 1, r);
        m.landmarks.push({ x:sp.x, y:sp.y, name:ZSHRINES[i - 1], id:'shrine_' + id, env:'codex', codexTerm:'District Shrine', shrine:ZSHRINES[i - 1] });
        codexPlace(m, r, area, 9, id, id, [{ x:area.sx, y:area.sy }, sp]);
      }
      var ids = speciesFor(9, id).filter(function(s){ return ZGEMLORDS.indexOf(s) < 0 && (i !== 0 || ['otterlin','verdanix','aetherwing','volcanut'].indexOf(s) < 0); });
      spawnFauna(m, r, i === 0 ? { x:a.x + 1, y:a.y + 1, w:a.w - 2, h:a.h - 2, sx:m.ship.x, sy:m.ship.y } : area, ids, i === 0 ? 4 : 9, levelFor(9, i));
    });
    // the named regions beyond the districts: a marker stone with the Codex's words, wild Zyrex, and a cache or two
    var all9 = speciesFor(9).filter(function(s){ return ZGEMLORDS.indexOf(s) < 0; });
    xc.forEach(function(a, k){
      var q = spot(m, r, a.x, a.y, a.w, a.h, [{ x:a.sx, y:a.sy }].concat(m.landmarks, m.records, m.npcs), 5);
      clearRect(m, q.x, q.y, 1, 1); m.set(q.x, q.y, 'L'); road(m, a.sx, a.sy, q.x, q.y + 1, r);
      m.landmarks.push({ x:q.x, y:q.y, name:a.name, id:'zx_' + a.id, env:'codex', codexTerm:'Zyraxis', text:a.name.toUpperCase() + '. ' + a.text });
      if (a.id === 'bridgeofhope') return;
      var pool = a.id === 'greendivide' ? all9.filter(function(s){ return (FAUNA.species[s].types || []).some(function(t){ return /Nature|Verdant/.test(t); }); }) : all9;
      spawnFauna(m, r, a, pool.length ? pool : all9, 7, levelFor(9, a.id === 'wildmarch' ? 3 : a.id === 'greendivide' ? 5 : 9) + (a.y >= 3 * CH ? 6 : 0));
      populate(m, r, a, 10, { landmarks:0, minerals:2, finds:2 });
    });
    // each route's Gemlord Cave, a little off the road, and its Gemlord, who keeps to it
    caves.forEach(function(job){
      var k = job.k, name = job.name, t = job.t;
      var cv = null;
      for (var tries = 0; tries < 60 && !cv; tries++) {
        var q = t[Math.max(0, Math.min(t.length - 1, (t.length >> 1) + ((r() * 9) | 0) - 4))]; if (!q) break;
        var ox2 = q.x + ((r() * 9) | 0) - 4, oy2 = q.y + ((r() * 7) | 0) - 3;
        if (ox2 < 3 || oy2 < 3 || ox2 > m.W - 4 || oy2 > m.H - 4 || 'dSXMLK'.indexOf(m.at(ox2, oy2)) >= 0) continue;
        if (m.landmarks.concat(m.records, m.npcs).some(function(o){ return Math.abs(o.x - ox2) + Math.abs(o.y - oy2) < 6; })) continue;
        cv = { x:ox2, y:oy2 };
      }
      if (!cv) return;
      clearRect(m, cv.x, cv.y, 1, 1); m.set(cv.x, cv.y, 'L'); road(m, q.x, q.y, cv.x, cv.y + 1, r);
      var gl = ZGEMLORDS[k], gs = FAUNA.species[gl];
      m.landmarks.push({ x:cv.x, y:cv.y, name:'Gemlord Cave · ' + (gs ? gs.name : gl.toUpperCase()), id:'cave_' + gl, env:'codex', codexTerm:'9 District Routes',
        text:'A Gemlord Cave on the ' + name + '. It belongs to ' + (gs ? gs.name : gl.toUpperCase()) + ', the route’s owning Gemlord.' });
      if (gs) m.spawns.push({ x:cv.x + 1, y:cv.y + 1, id:gl, lv:levelFor(9, Math.min(9, k + 1)) + 10, calm:true, gemlord:true });
    });
    // Zyraxis's vault lies in Korathen, the far end of the Z, with an Aethren guardian
    var kd = m.districts[9];
    vault(m, r, { x:kd.x, y:kd.y, w:kd.w, h:kd.h, sx:centres[9].x, sy:centres[9].y }, 9, 'korathen', null, levelFor(9, 9), 'korathen');
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

  // ── NASARUS: the headquarters, rebuilt from the player's saved progress every time ──
  //   st = { built:{id:1}, ruins:{id:{found,restored}}, regions:[], found:{tileKey:1}, stage:n }
  function hqStructure(m, st, s){
    var i0 = s.y * m.W + s.x;
    for (var i = 0; i < s.w; i++) { m.set(s.x + i, s.y, 'F'); delete m.props[i0 + i]; m.sidx[i0 + i] = m.structs.length; }
    for (var j = 1; j <= (s.clear || 1); j++) for (var k = -1; k <= s.w; k++) { var c = m.at(s.x + k, s.y - j); if (c !== 'F' && c !== 'S') { m.set(s.x + k, s.y - j, '.'); delete m.props[(s.y - j) * m.W + s.x + k]; } }
    m.structs.push(s);
  }
  function buildNasarus(st){
    var HQ = window.AOV_HQ; if (!HQ) return null;
    st = st || {}; var built = st.built || {}, ruins = st.ruins || {}, regions = st.regions || [], found = st.found || {}, stage = st.stage || 1;
    var W = HQ.size[0], H = HQ.size[1], m = new Map('nasarus', W, H), seed = 1936, r = rng(seed);
    m.world = 'nasarus'; m.hq = true; m.name = 'nasarus'; m.envs = [HQ.env]; m.structs = []; m.sidx = {};
    terrain(m, 0, 0, W, H, 0, seed, { high:.71, wet:.1 });
    for (var q = 0; q < m.grid.length; q++) if (m.grid[q] === '~') m.grid[q] = ',';
    border(m);
    var reg = HQ.regions[0], open = regions.indexOf(reg.id) >= 0;
    for (var y = 1; y < H - 1; y++) for (var x = reg.ridgeX; x <= reg.ridgeX + 1; x++) {
      var inGap = y >= reg.gap[0] && y <= reg.gap[1];
      m.set(x, y, inGap ? (open ? 'd' : 'X') : '#'); delete m.props[y * W + x];
    }
    clearRect(m, 25, 26, 12, 7);
    // ancient streets between the ruin sites, broken unless the settlement is reclaimed
    var sites = HQ.ruins.map(function(u){ return { x:u.at[0] + (u.w >> 1), y:u.at[1] + 1 }; });
    var camp = { x:24, y:27 };
    sites.forEach(function(a, i){ var b = i ? sites[i - 1] : camp; if (a.x < reg.ridgeX || open) road(m, b.x, b.y, a.x, a.y, r); });
    if (stage < 4) for (q = 0; q < m.grid.length; q++) if (m.grid[q] === 'd' && (q % W) < reg.ridgeX && r() < .32) m.grid[q] = r() < .5 ? ',' : '.';
    m.ship = { x:HQ.ship.x, y:HQ.ship.y }; clearRect(m, m.ship.x, m.ship.y, 3, 2); m.set(m.ship.x, m.ship.y, 'S');
    // the camp's own paths, once it is an established headquarters
    if (stage >= 3) HQ.facilities.forEach(function(f){ if (built[f.id]) road(m, camp.x, camp.y, f.at[0], f.at[1] + 1, r); });
    // facilities: built, or a staked plot once its requirements are met
    var have = function(id){ return !!built[id] || (id === 'drive' && st.drive) || (st.research && st.research[id]) || regions.indexOf(id) >= 0; };
    HQ.facilities.forEach(function(f){
      var ok = (f.requires || []).every(have);
      if (built[f.id]) hqStructure(m, st, { id:f.id, kind:'fac', ref:f, x:f.at[0], y:f.at[1], w:f.w, spr:f.spr, clear:2 });
      else if (f.future ? stage >= 3 : ok) hqStructure(m, st, { id:f.id, kind:'plot', ref:f, x:f.at[0], y:f.at[1], w:f.w, spr:'hq_plot', clear:1 });
    });
    // the departure machines: each built one stands as a station of its own (AOV_CORE.starter · at, w, spr)
    ((window.AOV_CORE || {}).starter || []).forEach(function(cm){
      if (!(st.core || {})[cm.id] || !cm.at) return;
      hqStructure(m, st, { id:'core:' + cm.id, kind:'core', ref:cm, x:cm.at[0], y:cm.at[1], w:cm.w || 1, spr:cm.spr || 'machine_workstation', clear:2 });
      for (var k = -1; k <= (cm.w || 1); k++) { var cx = cm.at[0] + k, cy = cm.at[1] + 1, c0 = m.at(cx, cy); if (c0 !== 'F' && c0 !== 'S' && cx > 0 && cx < W - 1) { m.set(cx, cy, '.'); delete m.props[cy * W + cx]; } }   // room to stand in front of it
    });
    HQ.ruins.forEach(function(u){
      var rs = ruins[u.id] || {};
      hqStructure(m, st, { id:u.id, kind:'ruin', ref:u, x:u.at[0], y:u.at[1], w:u.w, spr:(rs.restored ? 'rest_' : 'ruin_') + u.spr, clear:u.spr === 'obelisk' || u.spr === 'spire_old' ? 3 : 2 });
    });
    // wreckage from the crash, crystal outcrops, scrub: each can be taken once
    var used = {};
    function free(x, y){ var c = m.at(x, y); return (c === '.' || c === ',') && !used[x + ',' + y]; }
    function put(x, y, ch){ used[x + ',' + y] = 1; if (!found['nasarus:' + x + ',' + y]) m.set(x, y, ch); }
    for (var n = 0; n < 14; n++) {
      var a2 = r() * 6.283, d2 = 3 + r() * 6, wx = Math.round(m.ship.x + Math.cos(a2) * d2), wy = Math.round(m.ship.y + Math.sin(a2) * d2 * .7);
      if (free(wx, wy)) put(wx, wy, 'w');
    }
    function scatter(ch, count){ var made = 0, t = 0; while (made < count && t++ < 600) { var x2 = 2 + ((r() * (reg.ridgeX - 4)) | 0), y2 = 2 + ((r() * (H - 4)) | 0); if (Math.abs(x2 - camp.x) + Math.abs(y2 - camp.y) < 11 || !free(x2, y2)) continue; put(x2, y2, ch); made++; } }
    scatter('A', 8); scatter('b', 12);
    var basinMade = 0, t3 = 0; while (basinMade < 5 && t3++ < 300) { var bx = reg.ridgeX + 3 + ((r() * (W - reg.ridgeX - 5)) | 0), by = 2 + ((r() * (H - 4)) | 0); if (!free(bx, by)) continue; put(bx, by, basinMade % 2 ? 'A' : 'w'); basinMade++; }
    // the new population: refugees by the Habitation Zone, settled Aethren around the Sanctuary
    (st.residents || []).forEach(function(rs, i){
      var hx = 33 + (i % 4) * 2, hy = 25 + ((i / 4) | 0) * 2;
      if (free(hx, hy)) { used[hx + ',' + hy] = 1; m.npcs.push({ x:hx, y:hy, dir:'down', key:'res_w' + rs.no, env:rs.env, n:i, resident:true }); }
    });
    (st.settled || []).forEach(function(id, i){
      for (var t4 = 0; t4 < 40; t4++) {
        var sx2 = 36 + ((r() * 10) | 0), sy2 = 30 + ((r() * 10) | 0);
        if (free(sx2, sy2)) { used[sx2 + ',' + sy2] = 1; m.spawns.push({ x:sx2, y:sy2, id:id, lv:5, resident:true }); break; }
      }
    });
    if (stage >= 2) [[18, 28], [30, 28], [24, 20], [33, 24]].forEach(function(l){ if (free(l[0], l[1])) { m.set(l[0], l[1], 'P'); m.props[l[1] * W + l[0]] = ['hq_lamp', null]; used[l[0] + ',' + l[1]] = 1; } });
    return finish(m);
  }

  var cache = {};

  // ── CAVE DUNGEONS & IMMORTAL ZONES (Planetary Dungeon System V1.0) ──
  // Every planet 1–27 has ONE cave mouth on the overworld (a rock tile on the edge of open ground). The cave is a 2D
  // side-scrolling level, and its far door opens onto the planet's IMMORTAL ZONE, a secret map region.
  function worldEnv(no){ return (window.AOV_ENV || []).filter(function(e){ return e.no === no; })[0] || (window.AOV_ENV || [])[0]; }
  // the mouth: a rock tile with exactly one open neighbour, reachable from the ship, away from everything else
  function placeDungeon(m, no){
    var r = rng(no * 6151 + 3), seen = reachable(m, m.ship.x, m.ship.y + 1), cands = [];
    for (var y = 2; y < m.H - 2; y++) for (var x = 2; x < m.W - 2; x++) {
      var i = y * m.W + x; if (m.grid[i] !== '#' || m.props[i] || m.sidx && m.sidx[i] != null) continue;
      var open = [[1,0],[-1,0],[0,1],[0,-1]].filter(function(d){ var j = (y + d[1]) * m.W + x + d[0]; return !SOLID[m.grid[j]] && seen[j]; });
      if (open.length !== 1) continue;
      if (m.landmarks.some(function(l){ return Math.abs(l.x - x) + Math.abs(l.y - y) < 10; })) continue;
      cands.push({ x:x, y:y, stand:{ x:x + open[0][0], y:y + open[0][1] } });
    }
    if (!cands.length) return null;
    var c = cands[(r() * cands.length) | 0];
    m.set(c.x, c.y, 'L');
    var lm = { x:c.x, y:c.y, name:'The cave mouth', id:'dcave_' + no, env:'dungeon', dungeon:no, stand:c.stand };
    m.landmarks.push(lm); return lm;
  }
  // one cave: a horizontal level, pits, platforms, spikes, loot and enemies, with the door at the far end
  function buildCave(no){
    var r = rng(no * 104729 + 31), W = 170 + (no % 6) * 14, H = 16, g = [], x, y;
    for (y = 0; y < H; y++) { g.push([]); for (x = 0; x < W; x++) g[y].push('.'); }
    for (x = 0; x < W; x++) { g[0][x] = '#'; }
    for (y = 0; y < H; y++) { g[y][0] = '#'; g[y][W - 1] = '#'; }
    var pits = [], x0 = 1;
    for (x = 1; x < W - 14; ) {
      var seg = 6 + ((r() * 14) | 0);
      for (var c = x; c < Math.min(W - 14, x + seg); c++) { g[H - 3][c] = 'G'; g[H - 2][c] = 'G'; }
      x += seg;
      if (r() < .55 && x < W - 16) { var pw = 2 + ((r() * 2) | 0); pits.push([x, x + pw]); x += pw; }
    }
    // platforms over the floor (one tile above the ground: reachable with one jump)
    for (x = 8; x < W - 16; ) {
      x += 9 + ((r() * 16) | 0);
      var pl = 3 + ((r() * 3) | 0);
      for (c = x; c < x + pl && c < W - 16; c++) if (g[H - 5][c] === '.') g[H - 5][c] = 'P';
      x += pl;
    }
    // spikes on the floor, and loot in the air
    for (x = 6; x < W - 16; x++) if (g[H - 4][x] === '.' && g[H - 3][x] === 'G' && r() < .07 && !pits.some(function(p){ return x >= p[0] - 1 && x <= p[1]; })) g[H - 4][x] = 'H';
    for (var k = 0; k < 14 + ((W / 20) | 0); k++) {
      var lx = 4 + ((r() * (W - 22)) | 0), ly = H - 4 - ((r() * 4) | 0);
      if (g[ly][lx] === '.' && g[ly + 1][lx] !== '.') g[ly][lx] = '$';
    }
    // enemies: a pair every 30 cells, on the floor, never on a pit or at the start
    var en = [], lv = levelFor(no) || 5;
    var kinds = ['mori', 'seer_grunt', 'daemon', 'nova'];
    for (x = 22; x < W - 22; x += 26 + ((r() * 10) | 0)) {
      if (pits.some(function(p){ return x >= p[0] - 2 && x <= p[1] + 1; })) continue;
      var k2 = kinds[(r() * kinds.length) | 0];
      en.push({ x:x, y:H - 4, k:k2, lv:lv + ((r() * 3) | 0) });
      if (r() < .5) en.push({ x:x + 2, y:H - 4, k:kinds[(r() * kinds.length) | 0], lv:lv });
    }
    g[H - 4][W - 6] = '.'; g[H - 5][W - 6] = '.'; g[H - 6][W - 6] = '.';
    g[H - 4][W - 5] = 'E'; g[H - 5][W - 5] = 'E';
    return { no:no, W:W, H:H, rows:g.map(function(row){ return row.join(''); }), enemies:en, start:{ x:2, y:H - 4 }, exit:{ x:W - 5, y:H - 4 } };
  }
  // the Immortal Zone: a secret top-down region of the planet, with its deity, rare Aethren and rare caches
  function buildImmortal(no){
    var HX = 40, HY = 30, m = new Map('iz' + no, HX, HY), seed = no * 9973 + 61, r = rng(seed);
    m.world = no; m.name = 'iz' + no; m.immortal = true; m.envs = [worldEnv(no)]; m.structs = []; m.sidx = {};
    terrain(m, 0, 0, HX, HY, 0, seed, { high:.66, wet:.12 });
    for (var q = 0; q < m.grid.length; q++) if (m.grid[q] === '~') m.grid[q] = ',';
    border(m);
    m.ship = { x:6, y:HY - 8 };   // the arrival point, where the cave's door lets you out
    clearRect(m, 2, HY - 12, 9, 10);
    m.records = []; m.codexFinds = {}; m.props = m.props || {}; m.spawns = []; m.npcs = [];
    finish(m);   // clears the arrival area, so everything below is placed after it
    var cx = 24, cy = 12, exitX = m.ship.x + 1, exitY = m.ship.y - 1;
    clearRect(m, cx - 4, cy - 4, 9, 9);
    m.set(cx, cy, 'L');
    m.landmarks.push({ x:cx, y:cy, name:'The deity of this world', id:'fig_deity_' + no, env:'immortal', deity:no });
    m.set(exitX, exitY, 'L');
    m.landmarks.push({ x:exitX, y:exitY, name:'The way out', id:'dback_' + no, env:'immortal', dungeonExit:no });
    for (var c = 0; c < 4; c++) {
      var kx = 8 + ((r() * 28) | 0), ky = 4 + ((r() * 22) | 0);
      if (Math.hypot(kx - cx, ky - cy) < 6 || m.at(kx, ky) !== '.') continue;
      m.set(kx, ky, 'L'); m.landmarks.push({ x:kx, y:ky, name:'An ancient cache', id:'lm_izrelic_' + no + '_' + c, env:'immortal', izLoot:no + ':' + c });
    }
    var pool = Object.keys(SPECIES_FOR_IZ.list(no));
    for (var a = 0; a < Math.min(3, pool.length); a++) {
      var sx = 10 + ((r() * 22) | 0), sy = 8 + ((r() * 14) | 0);
      if (m.at(sx, sy) !== '.' && m.at(sx, sy) !== ',') continue;
      m.spawns.push({ x:sx, y:sy, id:pool[(r() * pool.length) | 0], lv:(levelFor(no) || 5) + 4, calm:1 });
    }
    return m;
  }
  // rare Aethren for an Immortal Zone: the planet's own species, rarest first (tier 3 and up, never sealed or retired)
  var SPECIES_FOR_IZ = { list:function(no){
    var sp = (window.AOV_FAUNA || {}).species || {}, out = {};
    Object.keys(sp).forEach(function(id){ var s = sp[id]; if (s.world === no && !s.retired && !s.hidden && !s.sealed && (s.tier || 1) >= 3 && (s.tier || 1) <= 8) out[id] = s.tier; });
    return out;
  } };
  function build(id, st){
    if (id === 'nasarus') return buildNasarus(st);
    if (cache[id]) return cache[id];
    if (/^iz\d+$/.test(id)) { var zm = buildImmortal(+id.slice(2)); if (zm) cache[id] = zm; return zm; }
    var m = id === 'w9' ? buildZyraxis() : /^w\d+$/.test(id) ? buildWorld(+id.slice(1)) : buildInterior(id);
    if (m && /^w\d+$/.test(id) && +id.slice(1) >= 1 && +id.slice(1) <= 27 && !m.dungeonPlaced) { placeDungeon(m, +id.slice(1)); m.dungeonPlaced = true; }
    if (m) cache[id] = m;
    return m;
  }
  // which district (Zyraxis) or world a cell belongs to
  function zoneAt(m, x, y){
    if (!m.districts) return null;
    for (var i = 0; i < m.districts.length; i++) { var d = m.districts[i]; if (x >= d.x && y >= d.y && x < d.x + d.w && y < d.y + d.h) return d; }
    return null;
  }

  window.AOV_WORLDGEN = { cave:function(no){ return buildCave(no); }, reset:function(){ cache = {}; }, build:build, zoneAt:zoneAt, SOLID:SOLID, DISTRICTS:DIST, levelFor:levelFor, nasarus:buildNasarus, biomesForWorld:biomesForWorld };
})();
