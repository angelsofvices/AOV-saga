// ★ 2026-10-10 · AETHRYX ADVENTURES: 1936 · VICEWORLD PORTRAITS (native art)
// The saga's origin: the first ViceWorld NFT characters, before The AOV™ Saga. Their look is the look of the
// Expanse's people: a big square head, a bold black outline, eyes that are dots, round shines, closed smiles or
// pixel shades, blush marks, tongues out, bucket hats and caps with a gem badge, halos, horns, earrings and smoke,
// on a bright backdrop. Colour theory decides the skin:
//   · HUMANS (Viridians, Earth, the pilot) keep human skin tones;
//   · HAEMEN carry the colour of their district's Mothergem shard (Malezor ruby, Zarvane pearl, Andrannor citrine,
//     Veridan emerald, Netharion amethyst, Vorashil sapphire, Xilnar onyx, Baelgor amber, Thardin topaz,
//     Korathen gold);
//   · HYBRIDS (every other people) wear bold colours from their world, and the backdrop is the complement.
// Portraits are 32 × 32 pixel data drawn at runtime. Nothing is a PNG.
(function(){
  'use strict';
  function rng(seed){ var h = 2166136261; for (var i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); } return function(){ h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; }; }
  function hsl(h, s, l){ s /= 100; l /= 100; var a = s * Math.min(l, 1 - l); function f(n){ var k = (n + h / 30) % 12, c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(255 * c).toString(16).padStart(2, '0'); } return '#' + f(0) + f(8) + f(4); }
  function toHsl(hex){ var r = parseInt(hex.substr(1, 2), 16) / 255, g = parseInt(hex.substr(3, 2), 16) / 255, b = parseInt(hex.substr(5, 2), 16) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0, l = (mx + mn) / 2, s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
    if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [(h * 60 + 360) % 360, s * 100, l * 100]; }
  function shade(hex, dl){ var c = toHsl(hex); return hsl(c[0], c[1], Math.max(4, Math.min(96, c[2] + dl))); }

  // ── colour theory ──
  var HUMAN = [['#f6d8bc','#dcb08c'], ['#f0c8a0','#c89a78'], ['#e0aa7c','#b8805a'], ['#c88c5c','#9c643c'], ['#a8704a','#7c4c2c'], ['#8a5638','#62381e'], ['#6a4028','#4a2a16'], ['#f4dcc8','#e0b49c']];
  var GEMS = {
    ruby:['#d8343c','RUBY','malezor'], pearl:['#ece4d8','PEARL','zarvane'], citrine:['#ecc432','CITRINE','andrannor'], emerald:['#2fae64','EMERALD','veridan'],
    amethyst:['#8c4ad8','AMETHYST','netharion'], sapphire:['#2f62d8','SAPPHIRE','vorashil'], onyx:['#2e2a36','ONYX','xilnar'], amber:['#e8842c','AMBER','baelgor'],
    topaz:['#3fd2c8','TOPAZ','thardin'], gold:['#e8c440','GOLD','korathen'], diamond:['#d8f0ff','DIAMOND',null], jade:['#6ac88a','JADE',null]
  };
  var DISTRICT_GEM = {}; Object.keys(GEMS).forEach(function(k){ if (GEMS[k][2]) DISTRICT_GEM[GEMS[k][2]] = k; });
  var BACKDROPS = [['#7a2cff','#a64dff'], ['#20c8f0','#3a7cf0'], ['#a8f06a','#30c8a0'], ['#ffd84a','#ffb02a'], ['#ff6a8a','#c83aff'], ['#30d8c8','#2a8ae8'], ['#ff8a3a','#ff4a6a'], ['#3a3a6a','#7a2cff'], ['#e8e8e8','#b8c8d8']];

  var OPTIONS = {
    eyes:['dot','big','closed','shades','sleepy','xeyes','patch','wink'],
    mouth:['line','smile','grin','tongue','lips','frown','pipe','o'],
    hair:['short','slick','bob','long','mohawk','spiky','bun','bald'],
    hat:['none','bucket','cap','beret','aviator','helmet','halo','horns','catears'],
    acc:['earring','freckles','mustache','scar','bandage','smoke','blush']
  };

  // ── a 32 × 32 grid ──
  function grid(){ var g = []; for (var y = 0; y < 32; y++) g.push(new Array(32).fill('.')); return g; }
  function px(g, x, y, c){ x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < 32 && y < 32) g[y][x] = c; }
  function rect(g, x, y, w, h, c){ for (var j = y; j < y + h; j++) for (var i = x; i < x + w; i++) px(g, i, j, c); }
  function ell(g, cx, cy, rx, ry, c){ for (var y = 0; y < 32; y++) for (var x = 0; x < 32; x++) if (Math.pow((x - cx) / rx, 2) + Math.pow((y - cy) / ry, 2) <= 1) g[y][x] = c; }
  function line(g, x0, y0, x1, y1, c){ var n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (var t = 0; t <= n; t++) px(g, x0 + (x1 - x0) * t / n, y0 + (y1 - y0) * t / n, c); }
  function tri(g, ax, ay, bx, by, cx, cy, c){ for (var y = 0; y < 32; y++) for (var x = 0; x < 32; x++) {
    var d1 = (x - bx) * (ay - by) - (ax - bx) * (y - by), d2 = (x - cx) * (by - cy) - (bx - cx) * (y - cy), d3 = (x - ax) * (cy - ay) - (cx - ax) * (y - ay);
    if (!((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0))) g[y][x] = c; } }
  function outline(g){
    var o = g.map(function(r){ return r.slice(); });
    for (var y = 0; y < 32; y++) for (var x = 0; x < 32; x++) if (g[y][x] === '.') {
      if ([[1,0],[-1,0],[0,1],[0,-1]].some(function(d){ var yy = y + d[1], xx = x + d[0]; return yy >= 0 && yy < 32 && xx >= 0 && xx < 32 && g[yy][xx] !== '.' && g[yy][xx] !== 'k'; })) o[y][x] = 'k';
    }
    return o;
  }

  // ── the bust ──
  function draw(sp){
    var g = grid(), t = sp.traits || {};
    // shoulders, collar and neck
    rect(g, 8, 29, 16, 3, 'c'); rect(g, 8, 29, 16, 1, 'C'); rect(g, 13, 26, 6, 4, 'S'); rect(g, 14, 29, 4, 1, 'C');
    // ears (or fins, or long elf ears)
    if (t.fins) { tri(g, 1, 12, 7, 14, 7, 20, 'A'); tri(g, 30, 12, 24, 14, 24, 20, 'A'); }
    else if (t.elf) { tri(g, 1, 9, 7, 14, 7, 19, 's'); tri(g, 30, 9, 24, 14, 24, 19, 's'); }
    else { rect(g, 5, 14, 2, 5, 's'); rect(g, 25, 14, 2, 5, 'S'); }
    // the head: a big square with eased corners
    rect(g, 7, 6, 18, 20, 's'); px(g, 7, 6, '.'); px(g, 24, 6, '.'); px(g, 7, 25, '.'); px(g, 24, 25, '.');
    rect(g, 23, 7, 1, 18, 'S'); rect(g, 8, 24, 16, 1, 'S');
    // hair
    var hs = sp.hair;
    if (hs === 'short' || hs === 'slick' || hs === 'bob' || hs === 'long' || hs === 'bun') { rect(g, 7, 5, 18, 4, 'h'); rect(g, 7, 9, 2, hs === 'slick' ? 2 : 4, 'h'); rect(g, 23, 9, 2, 4, 'h'); px(g, 9, 9, 'h'); line(g, 9, 6, 15, 6, 'H'); }
    if (hs === 'slick') { line(g, 10, 8, 22, 7, 'H'); rect(g, 7, 4, 18, 1, 'h'); }
    if (hs === 'bob') { rect(g, 5, 8, 3, 13, 'h'); rect(g, 24, 8, 3, 13, 'h'); }
    if (hs === 'long') { rect(g, 4, 8, 4, 19, 'h'); rect(g, 24, 8, 4, 19, 'h'); line(g, 5, 10, 5, 24, 'H'); }
    if (hs === 'bun') { ell(g, 16, 3, 3, 2.5, 'h'); px(g, 15, 2, 'H'); }
    if (hs === 'mohawk') { rect(g, 14, 1, 4, 7, 'h'); line(g, 15, 1, 15, 6, 'H'); }
    if (hs === 'spiky') { for (var sx = 7; sx < 25; sx += 4) tri(g, sx, 8, sx + 2, 1, sx + 4, 8, 'h'); line(g, 9, 6, 9, 4, 'H'); }
    // headwear
    var hat = sp.hat;
    if (hat === 'bucket') { rect(g, 9, 2, 14, 6, 'a'); rect(g, 8, 3, 16, 5, 'a'); rect(g, 5, 7, 22, 2, 'a'); line(g, 9, 2, 22, 2, 'A'); line(g, 5, 7, 26, 7, 'A'); gem(g, 15, 4, sp); }
    if (hat === 'cap') { rect(g, 7, 3, 18, 6, 'a'); rect(g, 8, 2, 16, 1, 'a'); rect(g, 2, 7, 12, 2, 'a'); line(g, 3, 7, 13, 7, 'A'); line(g, 9, 2, 22, 2, 'A'); gem(g, 18, 4, sp); }
    if (hat === 'beret') { ell(g, 14, 5, 10, 3.2, 'a'); px(g, 14, 1, 'a'); line(g, 7, 4, 18, 3, 'A'); }
    if (hat === 'aviator') { rect(g, 6, 3, 20, 8, 'a'); rect(g, 7, 2, 18, 1, 'a'); rect(g, 4, 10, 4, 10, 'a'); rect(g, 24, 10, 4, 10, 'a'); line(g, 8, 3, 23, 3, 'A');
      ell(g, 12, 8, 2.6, 2.2, 'A'); ell(g, 20, 8, 2.6, 2.2, 'A'); ell(g, 12, 8, 1.5, 1.2, 'G'); ell(g, 20, 8, 1.5, 1.2, 'G'); px(g, 11, 7, 'w'); px(g, 19, 7, 'w'); line(g, 14, 8, 18, 8, 'A'); }
    if (hat === 'helmet') { rect(g, 6, 2, 20, 8, 'a'); rect(g, 8, 1, 16, 1, 'a'); rect(g, 5, 9, 22, 2, 'A'); line(g, 9, 2, 22, 2, 'A'); gem(g, 15, 4, sp); }
    if (hat === 'halo') { for (var hx = 9; hx <= 22; hx++) { px(g, hx, 0, 'G'); px(g, hx, 2, 'G'); } px(g, 8, 1, 'G'); px(g, 23, 1, 'G'); }
    if (hat === 'horns' || t.horns) { tri(g, 7, 7, 9, 0, 11, 6, 'A'); tri(g, 21, 6, 23, 0, 25, 7, 'A'); }
    if (hat === 'catears' || t.ears) { tri(g, 7, 8, 8, 0, 13, 5, 'h'); tri(g, 19, 5, 24, 0, 25, 8, 'h'); tri(g, 9, 5, 9, 2, 11, 5, 'r'); tri(g, 21, 5, 23, 2, 23, 5, 'r'); }
    if (t.antennae) { line(g, 12, 6, 9, 0, 'k'); line(g, 20, 6, 23, 0, 'k'); px(g, 9, 0, 'G'); px(g, 23, 0, 'G'); }
    if (t.crystal) { tri(g, 10, 6, 12, 0, 14, 6, 'G'); tri(g, 17, 6, 20, 1, 22, 6, 'G'); line(g, 12, 1, 12, 5, 'w'); }
    if (t.leaf) { ell(g, 11, 4, 3, 1.6, 'Q'); ell(g, 20, 4, 3, 1.6, 'Q'); ell(g, 16, 2.5, 2.4, 1.6, 'Q'); }
    // eyes
    var ey = sp.eyes, L = 12, R = 19, Y = 14;
    if (t.cyclops) { rect(g, 13, 12, 6, 5, 'w'); rect(g, 14, 13, 4, 4, 'e'); px(g, 14, 13, 'w'); }
    else if (t.visor) { rect(g, 8, 13, 16, 3, 'G'); line(g, 9, 13, 22, 13, 'w'); }
    else if (ey === 'dot') { rect(g, L - 2, Y - 1, 3, 3, 'e'); rect(g, R, Y - 1, 3, 3, 'e'); px(g, L - 2, Y - 1, 'w'); px(g, R, Y - 1, 'w'); }
    else if (ey === 'big') { rect(g, L - 3, Y - 2, 5, 5, 'e'); rect(g, R - 1, Y - 2, 5, 5, 'e'); rect(g, L - 3, Y - 2, 2, 2, 'w'); rect(g, R - 1, Y - 2, 2, 2, 'w'); px(g, L, Y + 1, 'w'); px(g, R + 2, Y + 1, 'w'); }
    else if (ey === 'closed') { line(g, L - 2, Y + 1, L - 1, Y, 'e'); line(g, L - 1, Y, L + 1, Y, 'e'); px(g, L + 1, Y + 1, 'e'); line(g, R - 1, Y + 1, R, Y, 'e'); line(g, R, Y, R + 2, Y, 'e'); px(g, R + 2, Y + 1, 'e'); }
    else if (ey === 'shades') {
      rect(g, 7, Y - 1, 18, 1, 'l'); rect(g, 8, Y - 1, 7, 4, 'l'); rect(g, 17, Y - 1, 7, 4, 'l'); rect(g, 15, Y, 2, 1, 'l');
      [9, 18].forEach(function(x0){ px(g, x0 + 1, Y, 'w'); px(g, x0 + 2, Y + 1, 'w'); px(g, x0 + 3, Y, 'w'); px(g, x0 + 4, Y + 1, 'w'); });
    }
    else if (ey === 'sleepy') { rect(g, L - 1, Y, 3, 1, 'e'); rect(g, R, Y, 3, 1, 'e'); rect(g, L - 1, Y + 1, 2, 1, 'e'); rect(g, R, Y + 1, 2, 1, 'e'); }
    else if (ey === 'xeyes') { [L - 1, R].forEach(function(x0){ line(g, x0 - 1, Y - 1, x0 + 1, Y + 1, 'e'); line(g, x0 - 1, Y + 1, x0 + 1, Y - 1, 'e'); }); }
    else if (ey === 'patch') { rect(g, L - 1, Y, 2, 2, 'e'); px(g, L - 1, Y, 'w'); rect(g, R - 1, Y - 2, 5, 5, 'l'); line(g, 7, 9, R + 3, Y - 2, 'l'); }
    else if (ey === 'wink') { rect(g, L - 1, Y, 2, 2, 'e'); px(g, L - 1, Y, 'w'); line(g, R - 1, Y + 1, R + 2, Y + 1, 'e'); }
    // the shine of sunglasses and cyclops eyes aside, faces get a nose and a mouth
    px(g, 16, 18, 'S'); px(g, 17, 19, 'S');
    if (t.beak) { tri(g, 12, 18, 20, 18, 16, 24, 'A'); line(g, 12, 21, 20, 21, 'k'); }
    else if (t.snout) { rect(g, 11, 18, 10, 6, 'S'); px(g, 13, 19, 'e'); px(g, 18, 19, 'e'); line(g, 12, 22, 19, 22, 'm'); }
    else {
      var mo = sp.mouth, my = 22;
      if (mo === 'line') line(g, 14, my, 18, my, 'm');
      else if (mo === 'smile') { px(g, 12, my - 1, 'm'); line(g, 13, my, 19, my, 'm'); px(g, 20, my - 1, 'm'); }
      else if (mo === 'grin') { rect(g, 12, my - 1, 9, 3, 'm'); line(g, 13, my - 1, 19, my - 1, 'w'); }
      else if (mo === 'tongue') { line(g, 12, my, 20, my, 'm'); rect(g, 15, my + 1, 4, 4, 't'); rect(g, 18, my + 1, 1, 4, 'T'); px(g, 16, my + 2, 'T'); }
      else if (mo === 'lips') { rect(g, 13, my - 1, 7, 1, 'r'); rect(g, 13, my, 7, 1, 'm'); rect(g, 14, my + 1, 5, 1, 'r'); }
      else if (mo === 'frown') { px(g, 12, my + 1, 'm'); line(g, 13, my, 19, my, 'm'); px(g, 20, my + 1, 'm'); }
      else if (mo === 'o') { rect(g, 15, my - 1, 3, 3, 'm'); }
      else if (mo === 'pipe') { line(g, 13, my, 17, my, 'm'); line(g, 17, my + 1, 22, my + 2, 'b'); rect(g, 22, my, 3, 3, 'b'); px(g, 23, my - 2, 'y'); px(g, 24, my - 4, 'y'); px(g, 23, my - 6, 'y'); }
    }
    // extras
    var acc = sp.acc || [];
    if (acc.indexOf('blush') >= 0 || ey === 'closed') { rect(g, 9, Y + 3, 3, 1, 'r'); rect(g, 20, Y + 3, 3, 1, 'r'); }
    if (acc.indexOf('freckles') >= 0) { [[10, 18], [12, 19], [9, 20], [21, 18], [19, 19], [22, 20]].forEach(function(p){ px(g, p[0], p[1], 'S'); }); }
    if (acc.indexOf('mustache') >= 0 && !t.beak && !t.snout) { rect(g, 12, 20, 9, 1, 'h'); px(g, 11, 21, 'h'); px(g, 21, 21, 'h'); }
    if (acc.indexOf('scar') >= 0) { line(g, 19, 17, 22, 21, 'r'); }
    if (acc.indexOf('bandage') >= 0) { rect(g, 9, 18, 4, 2, 'w'); px(g, 10, 17, 'w'); px(g, 11, 20, 'w'); }
    if (acc.indexOf('earring') >= 0 && !t.fins && !t.elf) { px(g, 5, 19, 'x'); px(g, 5, 20, 'x'); px(g, 26, 19, 'x'); }
    if (acc.indexOf('smoke') >= 0 && sp.mouth !== 'pipe') { line(g, 20, 22, 25, 22, 'w'); px(g, 25, 22, 'r'); px(g, 26, 20, 'y'); px(g, 27, 18, 'y'); px(g, 26, 16, 'y'); }
    if (t.glow) { for (var y = 0; y < 32; y++) for (var x = 0; x < 32; x++) if (g[y][x] === '.' && [[1,0],[-1,0],[0,1],[0,-1]].some(function(d){ var yy = y + d[1], xx = x + d[0]; return yy >= 0 && yy < 32 && xx >= 0 && xx < 32 && g[yy][xx] !== '.'; })) g[y][x] = '+'; }
    var o = outline(g);
    if (t.glow) for (var yy = 0; yy < 32; yy++) for (var xx = 0; xx < 32; xx++) if (o[yy][xx] === '+') o[yy][xx] = 'G';
    return o.map(function(r){ return r.join(''); });
  }
  function gem(g, x, y, sp){ px(g, x, y, 'g'); px(g, x + 1, y, 'g'); px(g, x - 1, y + 1, 'g'); px(g, x, y + 1, 'G'); px(g, x + 1, y + 1, 'g'); px(g, x + 2, y + 1, 'g'); px(g, x, y + 2, 'g'); px(g, x + 1, y + 2, 'g'); px(g, x + 1, y - 0, 'G'); }

  function palette(sp){
    var gm = GEMS[sp.badge] || GEMS.gold;
    return { k:'#101014', s:sp.skin[0], S:sp.skin[1], h:sp.hairc[0], H:sp.hairc[1], e:'#101014', w:'#ffffff', r:'#ec3a50', t:'#f05878', T:'#b02848', m:'#3a1418',
      a:sp.hatc[0], A:sp.hatc[1], g:gm[0], G:shade(gm[0], 22), x:'#ffd23a', y:'#c8c8c8', l:'#101014', c:sp.cloth[0], C:sp.cloth[1], b:'#6a4428', Q:'#5fc04a' };
  }
  var cache = {};
  function sprite(sp){
    var key = JSON.stringify(sp); if (cache[key]) return cache[key];
    return (cache[key] = { rows:draw(sp), pal:palette(sp) });
  }
  // paint a portrait on a canvas: the backdrop gradient, then the bust
  function render(cnv, sp, opts){
    opts = opts || {};
    var g = cnv.getContext('2d'), W = cnv.width, H = cnv.height, s = Math.floor(Math.min(W, H) / 32), ox = Math.floor((W - 32 * s) / 2), oy = H - 32 * s;
    g.imageSmoothingEnabled = false; g.clearRect(0, 0, W, H);
    if (!opts.noBg) { var gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, sp.bg[0]); gr.addColorStop(1, sp.bg[1]); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
    var spr = sprite(sp);
    for (var y = 0; y < 32; y++) for (var x = 0; x < 32; x++) { var c = spr.rows[y][x]; if (c === '.') continue; g.fillStyle = spr.pal[c] || '#f0f'; g.fillRect(ox + x * s, oy + y * s, s, s); }
  }
  function url(sp, scale){ var c = document.createElement('canvas'); c.width = c.height = 32 * (scale || 3); render(c, sp); return c.toDataURL(); }

  // ── who someone is → how they look ──
  var HAIRC = [['#2a1a12','#5a3a22'], ['#1e1814','#3e3228'], ['#c89a48','#ecc878'], ['#9a3e1e','#c8642e'], ['#8a8a8a','#c0c0c0'], ['#e8e0d0','#ffffff'], ['#ff5aa8','#ffa0d0'], ['#3ad85a','#9af08a'], ['#5a7aff','#a0b8ff'], ['#c83a2a','#ff6a4a']];
  var HATC = [['#f4f0e8','#ffffff'], ['#2a6a3a','#4aa85a'], ['#ff9a2a','#ffc06a'], ['#3a7ad8','#7ab0ff'], ['#d83a4a','#ff7a8a'], ['#2a2a30','#545460'], ['#6a4428','#9a6a40'], ['#7a3ad8','#b07aff']];
  function kindOf(text){ return /haemen/i.test(text) ? 'haemen' : /viridian|human|earth|pilot|aur-|aurellion|true human/i.test(text) ? 'human' : 'hybrid'; }
  function specFor(key, text, o){
    o = o || {}; var r = rng(key), T = window.AOV_PEOPLE_ART ? window.AOV_PEOPLE_ART.traitsOf(text || '') : {};
    var kind = o.kind || kindOf(text || ''), skin, bg, badge;
    if (kind === 'haemen') { badge = o.gem || DISTRICT_GEM[o.district] || Object.keys(GEMS)[(r() * 10) | 0]; var gc = GEMS[badge][0]; skin = [gc, shade(gc, -16)]; }
    else if (kind === 'human') { skin = HUMAN[(r() * HUMAN.length) | 0]; badge = ['ruby','sapphire','emerald','gold','amethyst'][(r() * 5) | 0]; }
    else { var hue = o.hue != null ? o.hue : r() * 360; var c = hsl(hue, 55 + r() * 25, 50 + r() * 12); skin = [c, shade(c, -16)]; badge = Object.keys(GEMS)[(r() * 12) | 0]; }
    var sh = toHsl(skin[0]);
    // the backdrop: humans any bright pair; gems and hybrids the complement of the skin, for contrast
    if (kind === 'human') bg = BACKDROPS[(r() * BACKDROPS.length) | 0];
    else { var cp = (sh[0] + 180) % 360; bg = [hsl(cp, 75, 55), hsl((cp + 40) % 360, 80, 45)]; }
    var hats = OPTIONS.hat, cls = text || '';
    var hat = /king|queen|emperor|ruler|lord|lady|regent/i.test(cls) ? 'helmet' : /warrior|knight|guard|warden|soldier|legion/i.test(cls) ? 'helmet' : /mage|wizard|witch|seer/i.test(cls) ? 'beret'
      : /priest|monk|sage|divine|spirit|angel|holy/i.test(cls) ? 'halo' : /demon|corrupt|devil/i.test(cls) ? 'horns' : ['none', 'none', 'bucket', 'cap', 'cap', 'bucket', 'beret', 'none'][(r() * 8) | 0];
    return { skin:skin, hair:OPTIONS.hair[(r() * OPTIONS.hair.length) | 0], hairc:HAIRC[(r() * HAIRC.length) | 0], eyes:['dot','big','big','closed','shades','sleepy','xeyes','dot'][(r() * 8) | 0], mouth:OPTIONS.mouth[(r() * 6) | 0],
      hat:hat, hatc:HATC[(r() * HATC.length) | 0], badge:badge, acc:OPTIONS.acc.filter(function(a){ return r() < ({ scar:.05, bandage:.04, smoke:.08, earring:.3, blush:.3, freckles:.12, mustache:.1 }[a] || .1); }), bg:bg, cloth:[hsl((sh[0] + 150) % 360, 50, 42), hsl((sh[0] + 150) % 360, 55, 58)], traits:T, kind:kind };
  }
  window.AOV_VICE = { render:render, url:url, sprite:sprite, specFor:specFor, kindOf:kindOf, OPTIONS:OPTIONS, HUMAN:HUMAN, GEMS:GEMS, DISTRICT_GEM:DISTRICT_GEM, BACKDROPS:BACKDROPS, HAIRC:HAIRC, HATC:HATC, shade:shade, hsl:hsl };
})();
