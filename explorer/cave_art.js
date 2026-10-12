// AA:1936 · CAVE ART (Cave Rooms V2) · Celeste-style tilesets, painted procedurally.
// The method follows "Celeste Tilesets, Step-by-Step" (Aran P. Ink): solids on an 8x8 grid (each cave tile is 2x2 of
// them), several tilesets per room that share ONE dark infill, a 1px edge outline, auto-tiling from the neighbours,
// 1-4 random variants of every edge so rows never repeat, a second ring of random dark infill tiles (10-15% empty),
// foreground props that break the grid (moss, pebbles, crystals, stalactites, spikes), a background tile layer with
// holes, background props, a parallax backdrop, two particle layers and a faint left-to-right gradient.
// Every tileset uses 3-5 colours: 1-2 lights for edges, a mid-tone for bulk, 1-2 darks before the infill.
(function(){
  'use strict';
  var A = 8;   // art pixels per auto-tile; a cave tile (one physics cell) is 2x2 auto-tiles = 16x16 art pixels

  // ── colour ──
  function hex2rgb(h){ h = String(h || '#444').replace('#', ''); if (h.length === 3) h = h.replace(/(.)/g, '$1$1'); var n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function rgb2hsl(c){ var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, h = 0, s = 0, d = mx - mn;
    if (d) { s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; }
    return [h, s, l]; }
  function hsl2rgb(h, s, l){ h = ((h % 1) + 1) % 1; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
    function f(p, q, t){ t = ((t % 1) + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; }
    if (!s) return [l * 255, l * 255, l * 255].map(Math.round);
    var q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; return [f(p, q, h + 1 / 3), f(p, q, h), f(p, q, h - 1 / 3)].map(function(v){ return Math.round(v * 255); }); }
  function hsl(h, s, l){ return hsl2rgb(h, s, l); }
  function css(c, a){ return a == null ? 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')' : 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function hslOf(hx){ return rgb2hsl(hex2rgb(hx)); }
  // one tileset from a single hue: [light1, light2, mid, dark1, dark2] (hue-shifted lights warm, darks cool, like pixel artists do)
  function ramp(h, s, l){ return { light1:hsl(h - .02, s * .8, Math.min(.86, l + .28)), light2:hsl(h - .01, s * .9, Math.min(.74, l + .13)), mid:hsl(h, s, l), dark1:hsl(h + .02, s * .95, Math.max(.1, l - .11)), dark2:hsl(h + .04, s * .9, Math.max(.07, l - .18)) }; }
  function clampL(x, lo, hi){ return Math.max(lo, Math.min(hi, x)); }
  function mix(a, b, t){ return [0, 1, 2].map(function(i){ return Math.round(a[i] + (b[i] - a[i]) * t); }); }

  // the cave's palette, from its planet's own palette (environments.js), hue-shifted into cave light
  function palette(no, kind, env){
    var p = (env && env.palette) || {}, gr = p.ground || {}, pa = p.path || {};
    var gv = Object.keys(gr).map(function(k){ return gr[k]; }), pv = Object.keys(pa).map(function(k){ return pa[k]; });
    var rockC = hslOf(gv[2] || gv[0] || '#3a3440'), earthC = hslOf(gv[1] || pv[0] || '#6a5a44'), ledgeC = hslOf(pv[1] || pv[0] || '#7a6a50'), accC = hslOf(pv[2] || '#9a7aff');
    var rh = rockC[0], rs = clampL(rockC[1], .08, .4);
    var T = {
      '#':ramp(rh, rs, clampL(rockC[2], .24, .38)),
      G:ramp(earthC[0], clampL(earthC[1], .15, .55), clampL(earthC[2], .3, .46)),
      P:ramp(ledgeC[0], clampL(ledgeC[1], .12, .45), clampL(ledgeC[2], .34, .5)),
      C:ramp(accC[0], clampL(accC[1] + .2, .4, .85), clampL(accC[2], .46, .6))
    };
    var infill = hsl(rh, rs * .6, .07);
    Object.keys(T).forEach(function(k){ T[k].infill = infill; T[k].name = k; });
    var bgL = .15, bgT = { name:'b', light1:hsl(rh, rs * .45, bgL + .07), light2:hsl(rh, rs * .45, bgL + .04), mid:hsl(rh, rs * .4, bgL + .015), dark1:hsl(rh, rs * .35, bgL - .01), dark2:hsl(rh, rs * .35, bgL - .025), infill:hsl(rh, rs * .35, bgL - .02) };
    var up = kind === 'peak';
    return { tiles:T, bg:bgT, infill:infill, kind:kind,
      skyTop:up ? hsl(rh + .45, .25, .3) : hsl(rh, rs * .4, .05), skyBot:up ? hsl(rh, rs * .4, .07) : hsl(rh - .15, .3, .17),
      far:hsl(rh, rs * .35, up ? .13 : .1), near:hsl(rh, rs * .35, up ? .1 : .12),
      flora:up ? hsl(earthC[0] + .05, .15, .74) : hsl(.28 + (earthC[0] - .28) * .25, .45, .42), flora2:up ? hsl(earthC[0], .12, .58) : hsl(.3, .4, .3),
      glow:hsl(accC[0], .8, .72), light:up ? [226, 238, 255] : [196, 236, 168],
      spike:{ tip:[242, 240, 246], body:[156, 152, 170], base:[88, 86, 102] },
      motes:hsl(rh + .45, .2, .82), motesBg:hsl(rh, .15, .34) };
  }

  // ── seeded randomness ──
  function hash(a, b, c){ var h = (a * 73856093) ^ (b * 19349663) ^ ((c || 0) * 83492791); h = Math.imul(h ^ (h >>> 13), 1274126177); return (h ^ (h >>> 16)) >>> 0; }
  function mulberry(seed){ return function(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function strHash(s){ var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  // ── auto-tiles: an 8x8 tile for a tileset, a neighbour mask and a variant, made once and reused (a real tileset) ──
  var N = 1, E = 2, S = 4, W = 8, NE = 16, SE = 32, SW = 64, NW = 128;
  var cache = {};
  function edgeTile(ts, mask, variant){
    var key = ts.name + ts.mid.join() + ':' + mask + ':' + variant; if (cache[key]) return cache[key];
    var r = mulberry(strHash(key)), px = new Uint8ClampedArray(A * A * 4), col = [], x, y;
    // the infill side is never a straight line: a jag for every row and column
    var jagT = [], jagB = [], jagL = [], jagR = [];
    for (x = 0; x < A; x++) { jagT.push(r() < .35 ? 1 : 0); jagB.push(r() < .3 ? 1 : 0); jagL.push(r() < .35 ? 1 : 0); jagR.push(r() < .35 ? 1 : 0); }
    var inner = { NE:(mask & NE) && !(mask & N) && !(mask & E), SE:(mask & SE) && !(mask & S) && !(mask & E), SW:(mask & SW) && !(mask & S) && !(mask & W), NW:(mask & NW) && !(mask & N) && !(mask & W) };
    for (y = 0; y < A; y++) for (x = 0; x < A; x++) {
      var d = 99, side = null;
      function t(v, sd){ if (v < d) { d = v; side = sd; } }
      if (mask & N) t(y - jagT[x] * (y > 1 ? 1 : 0), 'top');
      if (mask & S) t(A - 1 - y - jagB[x] * (y < A - 2 ? 1 : 0), 'bot');
      if (mask & W) t(x - jagL[y] * (x > 1 ? 1 : 0), 'side');
      if (mask & E) t(A - 1 - x - jagR[y] * (x < A - 2 ? 1 : 0), 'side');
      if (inner.NE) t(Math.max(y, A - 1 - x) + 1, 'corner');
      if (inner.SE) t(Math.max(A - 1 - y, A - 1 - x) + 1, 'corner');
      if (inner.SW) t(Math.max(A - 1 - y, x) + 1, 'corner');
      if (inner.NW) t(Math.max(y, x) + 1, 'corner');
      var c, alpha = 255, top = side === 'top', bot = side === 'bot';
      if (d <= 0) c = top ? ts.light1 : bot ? ts.dark1 : ts.light2;
      else if (d === 1) c = top ? ts.light2 : bot ? ts.mid : side === 'corner' ? ts.light2 : ts.mid;
      else if (d <= (bot ? 2 : 3)) c = ts.mid;
      else if (d <= (bot ? 3 : 5)) c = ts.dark1;
      else if (d <= (bot ? 4 : 6)) c = ts.dark2;
      else c = ts.infill;
      // rounded outer corners and a broken contour: a few transparent pixels on the outside edge
      var exposedCorners = ((mask & N) && (mask & W) && x + y < 1) || ((mask & N) && (mask & E) && (A - 1 - x) + y < 1) || ((mask & S) && (mask & W) && x + (A - 1 - y) < 1) || ((mask & S) && (mask & E) && (A - 1 - x) + (A - 1 - y) < 1);
      if (exposedCorners) alpha = 0;
      else if (d === 0 && side !== 'corner' && r() < .1) alpha = 0;
      col.push([c, alpha]);
    }
    // rocks: oblong chunks in the mid band, light on top, dark underneath (implied 3D forms, light from above)
    function put(ix, iy, c){ if (ix < 0 || iy < 0 || ix >= A || iy >= A) return; var k = iy * A + ix; if (col[k][1] && col[k][0] !== ts.infill) col[k][0] = c; }
    var chunks = (mask & (N | E | W)) ? 1 + ((r() * 2) | 0) : 0;
    for (var q = 0; q < chunks; q++) {
      var cx = 1 + ((r() * 5) | 0), cy = (mask & N) ? 2 + ((r() * 2) | 0) : 1 + ((r() * 5) | 0), cw = 2 + ((r() * 2) | 0);
      for (x = cx; x < cx + cw; x++) { put(x, cy, ts.light2); put(x, cy + 1, ts.dark1); }
    }
    if (ts.name === 'C') { var sx = 2 + ((r() * 4) | 0), sy = 2 + ((r() * 4) | 0); put(sx, sy, ts.light1); }   // a glint in the crystal
    for (var i = 0; i < col.length; i++) { px[i * 4] = col[i][0][0]; px[i * 4 + 1] = col[i][0][1]; px[i * 4 + 2] = col[i][0][2]; px[i * 4 + 3] = col[i][1]; }
    return (cache[key] = px);
  }
  // the second ring: abstract dark blobs on the infill, darker toward the bottom, touching 1-2 edges; some empty
  function infillTile(ts, variant){
    var key = 'in:' + ts.name + ts.mid.join() + ':' + variant; if (cache[key]) return cache[key];
    var r = mulberry(strHash(key)), px = new Uint8ClampedArray(A * A * 4), i, x, y;
    for (i = 0; i < A * A; i++) { px[i * 4] = ts.infill[0]; px[i * 4 + 1] = ts.infill[1]; px[i * 4 + 2] = ts.infill[2]; px[i * 4 + 3] = 255; }
    if (variant >= 2) {
      var shapes = 1 + ((r() * 3) | 0);
      for (var s = 0; s < shapes; s++) {
        var edge = (r() * 4) | 0, cx = edge === 3 ? 0 : edge === 1 ? A - 1 : 1 + r() * 6, cy = edge === 0 ? 0 : edge === 2 ? A - 1 : 1 + r() * 6, rad = 1.2 + r() * 1.8, shape = (r() * 3) | 0;
        for (y = 0; y < A; y++) for (x = 0; x < A; x++) {
          var dx = x - cx, dy = y - cy, inside = shape === 0 ? dx * dx + dy * dy <= rad * rad : shape === 1 ? Math.abs(dx) + Math.abs(dy) <= rad + .5 : Math.abs(dx) <= rad && Math.abs(dy) <= rad * .6;
          if (!inside) continue;
          var c = y >= 4 ? mix(ts.infill, ts.dark2, .5) : mix(ts.infill, ts.dark1, .4), k = (y * A + x) * 4;   // close to the infill: depth, not noise px[k] = c[0]; px[k + 1] = c[1]; px[k + 2] = c[2];
        }
      }
    }
    return (cache[key] = px);
  }

  // ── painting a room: the background layer, then the solids, then the props, once per room ──
  function paint(room, pal){
    var Wt = room.W, Ht = room.H, rows = room.rows, w2 = Wt * 2, h2 = Ht * 2;
    function tileAt(x, y){ if (y < 0 || y >= Ht || x < 0 || x >= Wt) return '#'; return rows[y][x]; }
    function solidCh(c){ return c === '#' || c === 'G' || c === 'P' || c === 'C'; }
    function subSolid(sx, sy){ var c = tileAt(sx >> 1, sy >> 1); return solidCh(c) ? c : null; }
    function mk(w, h){ var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
    var fg = mk(Wt * 16, Ht * 16), bg = mk(Wt * 16, Ht * 16);
    var fx = fg.getContext('2d'), bx = bg.getContext('2d');
    var fimg = fx.createImageData(fg.width, fg.height), bimg = bx.createImageData(bg.width, bg.height);
    function blit(img, px, ox, oy){ for (var y = 0; y < A; y++) for (var x = 0; x < A; x++) { var s = (y * A + x) * 4; if (!px[s + 3]) continue; var d = ((oy + y) * img.width + ox + x) * 4; img.data[d] = px[s]; img.data[d + 1] = px[s + 1]; img.data[d + 2] = px[s + 2]; img.data[d + 3] = px[s + 3]; } }
    function layer(img, isSolid, tsOf, ringVariants){
      // distance to the nearest open auto-tile (1 = edge, 2 = infill ring, 3 = deep)
      var D = new Uint8Array(w2 * h2), x, y;
      for (y = 0; y < h2; y++) for (x = 0; x < w2; x++) {
        if (!isSolid(x, y)) continue; var e = false;
        for (var dy = -1; dy <= 1 && !e; dy++) for (var dx = -1; dx <= 1; dx++) { var nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w2 || ny >= h2) continue; if (!isSolid(nx, ny)) { e = true; break; } }
        D[y * w2 + x] = e ? 1 : 3;
      }
      for (y = 0; y < h2; y++) for (x = 0; x < w2; x++) if (D[y * w2 + x] === 3) {
        for (var ey = -1; ey <= 1; ey++) for (var ex = -1; ex <= 1; ex++) { var mx = x + ex, my = y + ey; if (mx >= 0 && my >= 0 && mx < w2 && my < h2 && D[my * w2 + mx] === 1) { D[y * w2 + x] = 2; ey = 2; break; } }
      }
      for (y = 0; y < h2; y++) for (x = 0; x < w2; x++) {
        var d = D[y * w2 + x]; if (!d) continue;
        var ts = tsOf(x, y), h = hash(x, y, 7), px;
        if (d === 1) {
          var m = 0; function open(ax, ay, bit){ if (ax >= 0 && ay >= 0 && ax < w2 && ay < h2 && !isSolid(ax, ay)) m |= bit; }
          open(x, y - 1, N); open(x + 1, y, E); open(x, y + 1, S); open(x - 1, y, W); open(x + 1, y - 1, NE); open(x + 1, y + 1, SE); open(x - 1, y + 1, SW); open(x - 1, y - 1, NW);
          var straight = m === N || m === S || m === E || m === W;
          px = edgeTile(ts, m, straight ? h % 4 : h % 2);
        } else if (d === 2) px = infillTile(ts, h % ringVariants);
        else px = infillTile(ts, 0);
        blit(img, px, x * A, y * A);
      }
    }
    // the background layer (with holes where the far cave shows through)
    var bgRows = room.bg || [];
    layer(bimg, function(x, y){ var r0 = bgRows[y >> 1]; return !!r0 && r0[x >> 1] === 'b'; }, function(){ return pal.bg; }, 8);
    bx.putImageData(bimg, 0, 0);
    // the solids: every tileset shares the same infill, so they blend into one another
    layer(fimg, function(x, y){ return !!subSolid(x, y); }, function(x, y){ return pal.tiles[subSolid(x, y)] || pal.tiles['#']; }, 12);
    fx.putImageData(fimg, 0, 0);
    // ── props ──
    var r = mulberry(strHash('props:' + room.no + ':' + room.k));
    function pix(c, col, x, y, w, h){ c.fillStyle = css(col); c.fillRect(x, y, w || 1, h || 1); }
    // background props: old support beams, roots, and carved marks in the world's script
    for (var x = 2; x < Wt - 2; x++) {
      var ceilY = -1, floorY = -1;
      for (var y = 1; y < Ht - 1; y++) { if (solidCh(tileAt(x, y)) && !solidCh(tileAt(x, y + 1))) ceilY = y; if (ceilY >= 0 && !solidCh(tileAt(x, y)) && solidCh(tileAt(x, y + 1))) { floorY = y; break; } }
      if (ceilY >= 0 && floorY > ceilY + 3 && floorY - ceilY < 10 && r() < .06) {
        var bx0 = x * 16 + 6, beam = hsl(.08, .25, .2), beamL = hsl(.08, .25, .27);
        pix(bx, beam, bx0, (ceilY + 1) * 16, 3, (floorY - ceilY) * 16); pix(bx, beamL, bx0, (ceilY + 1) * 16, 1, (floorY - ceilY) * 16);
        pix(bx, beam, bx0 - 7, (ceilY + 1) * 16 + 2, 17, 3); pix(bx, beamL, bx0 - 7, (ceilY + 1) * 16 + 2, 17, 1);
      }
      if (ceilY >= 0 && r() < .12) { var rl = 4 + ((r() * 14) | 0), rx = x * 16 + ((r() * 14) | 0); for (var ry = 0; ry < rl; ry++) pix(bx, pal.flora2, rx + (ry > rl / 2 && r() < .3 ? 1 : 0), (ceilY + 1) * 16 + ry, 1, 1); }
    }
    for (var gq = 0; gq < 6; gq++) {   // carved marks: the cave's own script, a nod to the words you have come to learn
      var gx = 2 + ((r() * (Wt - 4)) | 0), gy = 2 + ((r() * (Ht - 4)) | 0);
      if (solidCh(tileAt(gx, gy)) || !bgRows[gy] || bgRows[gy][gx] !== 'b') continue;
      for (var gi = 0; gi < 3; gi++) { var gm = (r() * 512) | 0; for (var b = 0; b < 9; b++) if (gm & (1 << b)) pix(bx, pal.bg.light1, gx * 16 + 2 + gi * 4 + (b % 3), gy * 16 + 5 + ((b / 3) | 0), 1, 1); }
    }
    // foreground props: moss and grass on the tops, pebbles, crystal shards, stalactites from the ceilings, spikes
    for (var sy = 0; sy < h2; sy++) for (var sx = 0; sx < w2; sx++) {
      var c = subSolid(sx, sy); if (!c) continue;
      var openUp = sy > 0 && !subSolid(sx, sy - 1), openDown = sy < h2 - 1 && !subSolid(sx, sy + 1), X = sx * A, Y = sy * A;
      if (openUp && tileAt(sx >> 1, (sy - 1) >> 1) !== 'H') {
        var pr = c === 'G' ? .45 : c === '#' ? .14 : c === 'C' ? .5 : .08;
        if (r() < pr) {
          if (c === 'C') { var cx2 = X + 2 + ((r() * 4) | 0), ch = 2 + ((r() * 3) | 0); pix(fx, pal.tiles.C.light1, cx2, Y - ch, 1, ch); pix(fx, pal.glow, cx2 + 1, Y - ch + 1, 1, ch - 1); }
          else { var blades = 2 + ((r() * 3) | 0); for (var bl = 0; bl < blades; bl++) { var bh = 1 + ((r() * 3) | 0), bxp = X + ((r() * 8) | 0); pix(fx, r() < .5 ? pal.flora : pal.flora2, bxp, Y - bh, 1, bh); } }
        } else if (r() < .1) pix(fx, pal.tiles[c].light2, X + 1 + ((r() * 5) | 0), Y - 1, 2, 1);
      }
      if (openDown && r() < (c === 'P' ? .05 : .2)) {
        var sl = 2 + ((r() * 5) | 0), sxp = X + 2 + ((r() * 4) | 0), tc = pal.tiles[c];
        pix(fx, tc.mid, sxp, Y + A, 2, Math.ceil(sl / 2)); pix(fx, tc.dark1, sxp, Y + A + Math.ceil(sl / 2), 1, Math.floor(sl / 2));
        if (r() < .3) pix(fx, pal.glow, sxp, Y + A + sl + 2, 1, 1);   // a drip
      }
    }
    for (var ty = 0; ty < Ht; ty++) for (var tx = 0; tx < Wt; tx++) if (rows[ty][tx] === 'H') {
      var sp = pal.spike, X2 = tx * 16, Y2 = ty * 16 + 16;
      for (var k = 0; k < 4; k++) { var x0 = X2 + k * 4; pix(fx, sp.base, x0, Y2 - 2, 4, 2); pix(fx, sp.body, x0 + 1, Y2 - 5, 2, 3); pix(fx, sp.tip, x0 + 1, Y2 - 7, 1, 2); pix(fx, sp.body, x0 + 2, Y2 - 6, 1, 1); }
    }
    // the far cave: two silhouette layers for the parallax, cut from noise
    function silhouette(col, seed, rough){
      var c = mk(512, Ht * 16), g = c.getContext('2d'), rr = mulberry(seed); g.fillStyle = css(col);
      var a1 = rr() * 6, a2 = rr() * 6;
      for (var x3 = 0; x3 < 512; x3++) {
        var t = x3 / 512 * Math.PI * 2, top = (Math.sin(t * 2 + a1) * .5 + Math.sin(t * 5 + a2) * .3 + Math.sin(t * 11) * .2 * rough + 1.2) * Ht * 16 * .14;
        var bot = (Math.sin(t * 3 + a2) * .5 + Math.sin(t * 7 + a1) * .3 + 1.2) * Ht * 16 * .12;
        g.fillRect(x3, 0, 1, Math.round(top)); g.fillRect(x3, Ht * 16 - Math.round(bot), 1, Math.round(bot));
      }
      return c;
    }
    var motes = [], mr = mulberry(strHash('motes' + room.no + room.k));
    for (var mi = 0; mi < 70; mi++) motes.push({ x:mr(), y:mr(), v:.004 + mr() * .01, ph:mr() * 6.3, front:mi < 30 });
    return { fg:fg, bg:bg, far:silhouette(pal.far, strHash('far' + room.no), 1), near:silhouette(pal.near, strHash('near' + room.no + room.k), .6), pal:pal, room:room, motes:motes, t:0 };
  }

  // ── drawing, every frame ──
  function drawBack(ctx, art, camX, camY, w, h, z, now){
    var pal = art.pal, g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, css(pal.skyTop)); g.addColorStop(1, css(pal.skyBot)); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    [[art.far, .15], [art.near, .35]].forEach(function(L){
      var img = L[0], f = L[1], sw = img.width * z, ox = -((camX * f) % sw), oy = -camY * f * .5;
      for (var x = ox - sw; x < w; x += sw) ctx.drawImage(img, x, oy, sw, img.height * z);
    });
    // the slow layer of motes, behind the back wall
    art.motes.forEach(function(m){ if (m.front) return; var x = ((m.x - now * m.v * .00002 * 60) % 1 + 1) % 1, y = (m.y + Math.sin(now / 1800 + m.ph) * .01) % 1; ctx.fillStyle = css(pal.motesBg); ctx.fillRect(Math.round(x * w), Math.round(y * h), Math.max(1, z), Math.max(1, z)); });
  }
  function drawRoom(ctx, art, ox, oy, z){
    ctx.drawImage(art.bg, ox, oy, art.bg.width * z, art.bg.height * z);
    ctx.drawImage(art.fg, ox, oy, art.fg.width * z, art.fg.height * z);
  }
  function drawFront(ctx, art, ox, oy, z, w, h, now){
    var pal = art.pal, rm = art.room, TZ = 16 * z, lt = pal.light;
    // daylight from the mouth (first room) and the light of the peak or valley (last room)
    function glow(X, Y, rad, a){ var g = ctx.createRadialGradient(X, Y, 0, X, Y, rad); g.addColorStop(0, 'rgba(' + lt[0] + ',' + lt[1] + ',' + lt[2] + ',' + a + ')'); g.addColorStop(1, 'rgba(' + lt[0] + ',' + lt[1] + ',' + lt[2] + ',0)'); ctx.fillStyle = g; ctx.fillRect(X - rad, Y - rad, rad * 2, rad * 2); }
    if (rm.last) glow(ox + rm.W * TZ, oy + (rm.exit.y - .5) * TZ, TZ * 7, .42 + .05 * Math.sin(now / 900));
    if (rm.first) glow(ox, oy + (rm.start.y - .5) * TZ, TZ * 5, .22);
    // the fast layer of motes, in front of everything
    art.motes.forEach(function(m){ if (!m.front) return; var x = ((m.x - now * m.v * .00004 * 60) % 1 + 1) % 1, y = ((m.y + Math.sin(now / 1300 + m.ph) * .02) % 1 + 1) % 1; ctx.fillStyle = css(pal.motes, .7); ctx.fillRect(Math.round(x * w), Math.round(y * h), Math.max(1, z), Math.max(1, z)); });
    // the faint gradient over the whole scene: warm on the left, cool on the right
    var gg = ctx.createLinearGradient(0, 0, w, 0); gg.addColorStop(0, 'rgba(255,190,140,.05)'); gg.addColorStop(1, 'rgba(120,160,255,.05)'); ctx.fillStyle = gg; ctx.fillRect(0, 0, w, h);
  }
  window.AOV_CAVE_ART = { palette:palette, paint:paint, drawBack:drawBack, drawRoom:drawRoom, drawFront:drawFront, edgeTile:edgeTile };
})();
