// ★ 2026-10-10 · AETHRYX ADVENTURES: 1936 · PEOPLE OF THE EXPANSE (native art)
// Every person you can meet is drawn here from layered pixel parts, in the game's own 16-pixel style: a body,
// an outfit from their Codex class (robes and hats for mages, armour and helms for warriors and knights, crowns and
// capes for rulers, hoods for priests and sages, coats for scholars and merchants), traits from their people
// (beaks and crests for Avians, snouts for Reptiloids, ears and tails for Beastfolk, fins for Aquatics, antennae for
// insect peoples, visors for the machine-wrought, one great eye for the Greatkin Cyclopes, crystal growths, horns for
// Dragonlords, long ears for elves, a glow for beings of light) and colours from a seed, so no two look alike.
// Sprites are pixel data registered into AOV_ART at runtime; nothing is a PNG.
(function(){
  'use strict';
  var A = window.AOV_ART; if (!A) return;
  function rng(seed){ var h = 2166136261; for (var i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); } return function(){ h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; }; }
  function hsl(h, s, l){ s /= 100; l /= 100; var a = s * Math.min(l, 1 - l); function f(n){ var k = (n + h / 30) % 12, c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(255 * c).toString(16).padStart(2, '0'); } return '#' + f(0) + f(8) + f(4); }
  function hexHue(hex){ var r = parseInt(hex.substr(1, 2), 16) / 255, g = parseInt(hex.substr(3, 2), 16) / 255, b = parseInt(hex.substr(5, 2), 16) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0;
    if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return (h * 60 + 360) % 360; }

  // the traits a people or a person carries, read from their names and Codex words
  var TRAIT_RX = [
    ['beak', /avian|bird|wyver|sky-predator|aerie|feather|wing/i], ['snout', /reptil|serpent|lizard|dragonlord|dracolord|mandrake/i],
    ['ears', /beast|wildkin|fur|wolf|lion|fox|cat/i], ['tail', /beast|wildkin|reptil|serpent|dragon|fox|wolf|lion/i],
    ['fins', /aquatic|ocean|reef|tide|halcyr|sea\b|fin\b|mer/i], ['antennae', /insect|synthrax|mantis|spider|hive|swarm|chitin/i],
    ['visor', /machine|synthetic|mech|wrought|forgemaster|clockwork|android|cyborg/i], ['cyclops', /cyclop|greatkin|single-eye|titan/i],
    ['crystal', /crystal|xyloran|crystalborn|gem|astralite|prism/i], ['horns', /dragon|draco|demon|horn|volcanid|ember|fire-kin/i],
    ['elf', /elf|elves|elven|aetherelv|fae/i], ['glow', /light|astrum|luminar|radiant|divine|spirit|wisp|aura|ghost/i],
    ['leaf', /verdant|forest|grove|sylvan|root|bloom|plant|canopy/i], ['big', /giant|greatkin|titan|cyclop|enduring|endurer|massive/i]
  ];
  var OUTFIT_RX = [
    ['crown', /king|queen|emperor|empress|monarch|ruler|prince|princess|regent|lord|lady|throne|matriarch/i],
    ['helm', /warrior|knight|soldier|guard|general|commander|legion|warden|fighter|champion|paladin|duel/i],
    ['hat', /mage|wizard|witch|sorcer|warlock|alchem|seer/i], ['hood', /priest|monk|sage|oracle|cleric|shaman|ascetic|devot|choir|disciple/i],
    ['goggles', /scien|engineer|inventor|scholar|cartograph|navigator|astronaut|pilot|tinker/i],
    ['cap', /merchant|trader|farmer|smith|builder|sailor|miner|hunter|ranger|scout/i]
  ];
  function traitsOf(text){ var t = {}; TRAIT_RX.forEach(function(r){ if (r[1].test(text)) t[r[0]] = 1; }); return t; }
  function outfitOf(text, r){ for (var i = 0; i < OUTFIT_RX.length; i++) if (OUTFIT_RX[i][1].test(text)) return OUTFIT_RX[i][0]; return ['none', 'cap', 'hood', 'none'][(r() * 4) | 0]; }

  // a 16 × 16 grid with helpers
  function grid(){ var g = []; for (var y = 0; y < 16; y++) g.push(new Array(16).fill('.')); return g; }
  function px(g, x, y, c){ if (x >= 0 && y >= 0 && x < 16 && y < 16) g[y][x] = c; }
  function rect(g, x, y, w, h, c){ for (var j = y; j < y + h; j++) for (var i = x; i < x + w; i++) px(g, i, j, c); }
  function outline(g){
    var o = g.map(function(r){ return r.slice(); });
    for (var y = 0; y < 16; y++) for (var x = 0; x < 16; x++) if (g[y][x] === '.') {
      var n = [[1,0],[-1,0],[0,1],[0,-1]].some(function(d){ var yy = y + d[1], xx = x + d[0]; return yy >= 0 && yy < 16 && xx >= 0 && xx < 16 && g[yy][xx] !== '.' && g[yy][xx] !== 'k'; });
      if (n) o[y][x] = 'k';
    }
    return o;
  }
  // facing: 'down', 'up' or 'side' (side faces right; left is the mirror)
  function body(f, P){
    var g = grid(), big = P.big ? 1 : 0, robe = P.robe;
    // legs and boots
    if (!robe) { if (f === 'side') { rect(g, 6, 12, 3, 2, 'c'); rect(g, 6, 14, 3, 1, 'b'); } else { rect(g, 4 - big, 12, 3, 2, 'c'); rect(g, 9 + big, 12, 3, 2, 'c'); rect(g, 4 - big, 14, 3, 1, 'b'); rect(g, 9 + big, 14, 3, 1, 'b'); } }
    // torso (a robe falls to the ankles)
    if (f === 'side') { rect(g, 5, 6, 5, robe ? 9 : 6, 'c'); rect(g, 5, 6, 1, robe ? 9 : 6, 'C'); px(g, 9, 9, 's'); px(g, 9, 10, 's'); }
    else {
      rect(g, 3 - big, 6, 10 + big * 2, robe ? 9 : 6, 'c'); rect(g, 3 - big, 6, 2, robe ? 9 : 6, 'C'); rect(g, 11 + big, 6, 2, robe ? 9 : 6, 'd');
      rect(g, 2 - big, 7, 1, 3, 'c'); rect(g, 13 + big, 7, 1, 3, 'c'); px(g, 2 - big, 10, 's'); px(g, 13 + big, 10, 's');
      if (f === 'down') { rect(g, 3 - big, 10, 10 + big * 2, 1, 'a'); px(g, 7, 10, 'A'); px(g, 8, 10, 'A'); }
    }
    // head
    if (f === 'side') { rect(g, 5, 1, 6, 5, 's'); rect(g, 5, 1, 6, 2, 'h'); rect(g, 5, 1, 2, 4, 'h'); px(g, 9, 3, 'e'); px(g, 10, 4, 'S'); }
    else {
      rect(g, 4, 1, 8, 5, 's'); rect(g, 4, 1, 8, 2, 'h'); px(g, 4, 3, 'h'); px(g, 11, 3, 'h');
      if (f === 'down') { if (P.cyclops) { rect(g, 7, 3, 2, 2, 'e'); px(g, 7, 3, 'w'); } else { px(g, 6, 3, 'e'); px(g, 9, 3, 'e'); } px(g, 7, 5, 'S'); px(g, 8, 5, 'S'); }
      else rect(g, 4, 1, 8, 5, 'h');
    }
    return g;
  }
  function dress(g, f, P){
    var o = P.outfit;
    if (o === 'crown') { if (f !== 'side') { rect(g, 4, 0, 8, 1, 'A'); px(g, 4, -1, 'A'); px(g, 5, 0, 'a'); px(g, 7, 0, 'w'); px(g, 10, 0, 'a'); } else { rect(g, 5, 0, 6, 1, 'A'); px(g, 8, 0, 'w'); }
      if (f !== 'down') rect(g, f === 'side' ? 3 : 2, 6, f === 'side' ? 2 : 12, 9, 'a'); }
    if (o === 'helm') { rect(g, 4, 0, 8, 3, 'm'); if (f === 'side') rect(g, 4, 0, 7, 3, 'm'); if (f === 'down') rect(g, 5, 3, 6, 1, 'k'); px(g, 7, 0, 'A');
      if (f !== 'side') { rect(g, 2, 6, 3, 2, 'm'); rect(g, 11, 6, 3, 2, 'm'); } else rect(g, 5, 6, 4, 2, 'm'); }
    if (o === 'hat') { var hx = f === 'side' ? 5 : 3; rect(g, hx, 1, f === 'side' ? 8 : 10, 1, 'a'); rect(g, hx + 2, 0, f === 'side' ? 4 : 6, 1, 'a'); px(g, hx + 4, -1, 'a'); px(g, 8, 0, 'A'); }
    if (o === 'hood') { if (f === 'side') { rect(g, 4, 0, 7, 2, 'd'); rect(g, 4, 0, 2, 6, 'd'); } else { rect(g, 3, 0, 10, 2, 'd'); rect(g, 3, 0, 1, 6, 'd'); rect(g, 12, 0, 1, 6, 'd'); if (f === 'up') rect(g, 3, 0, 10, 6, 'd'); } }
    if (o === 'goggles' && f !== 'up') { if (f === 'down') { rect(g, 5, 3, 6, 1, 'A'); px(g, 6, 3, 'w'); px(g, 9, 3, 'w'); } else { rect(g, 8, 3, 3, 1, 'A'); px(g, 9, 3, 'w'); } }
    if (o === 'cap') { if (f === 'side') { rect(g, 5, 0, 6, 2, 'a'); rect(g, 10, 2, 2, 1, 'a'); } else rect(g, 4, 0, 8, 2, 'a'); }
  }
  function traits(g, f, P){
    var t = P.t;
    if (t.horns) { px(g, 3, 0, 'A'); px(g, 3, -1, 'A'); px(g, 12, 0, 'A'); px(g, 2, -1, 'A'); if (f === 'side') { px(g, 6, 0, 'A'); px(g, 6, -1, 'A'); } }
    if (t.ears) { if (f === 'side') { px(g, 6, 0, 'h'); px(g, 6, -1, 'h'); } else { px(g, 4, 0, 'h'); px(g, 11, 0, 'h'); px(g, 4, -1, 'h'); px(g, 11, -1, 'h'); } }
    if (t.elf) { if (f !== 'side') { px(g, 3, 3, 's'); px(g, 2, 2, 's'); px(g, 12, 3, 's'); px(g, 13, 2, 's'); } else { px(g, 6, 2, 's'); px(g, 5, 1, 's'); } }
    if (t.antennae) { if (f === 'side') { px(g, 8, 0, 'k'); px(g, 9, -1, 'A'); } else { px(g, 5, 0, 'k'); px(g, 4, -1, 'A'); px(g, 10, 0, 'k'); px(g, 11, -1, 'A'); } }
    if (t.beak && f !== 'up') { if (f === 'down') { px(g, 7, 4, 'A'); px(g, 8, 4, 'A'); px(g, 7, 5, 'a'); } else { px(g, 11, 3, 'A'); px(g, 12, 4, 'A'); } }
    if (t.beak) { if (f === 'side') { px(g, 5, 0, 'A'); px(g, 4, 0, 'a'); } else { px(g, 7, 0, 'A'); px(g, 8, -1, 'A'); px(g, 9, 0, 'a'); } }
    if (t.snout && f !== 'up') { if (f === 'down') { rect(g, 6, 4, 4, 2, 'S'); px(g, 6, 5, 'k'); px(g, 9, 5, 'k'); } else { rect(g, 10, 3, 2, 2, 'S'); px(g, 11, 4, 'k'); } }
    if (t.fins) { if (f === 'side') { px(g, 4, 2, 'A'); px(g, 3, 1, 'A'); } else { px(g, 3, 2, 'A'); px(g, 2, 1, 'A'); px(g, 12, 2, 'A'); px(g, 13, 1, 'A'); } }
    if (t.visor && f !== 'up') { if (f === 'down') rect(g, 4, 3, 8, 1, 'A'); else rect(g, 8, 3, 3, 1, 'A'); }
    if (t.crystal) { px(g, 2, 5, 'A'); px(g, 2, 4, 'w'); px(g, 13, 5, 'A'); px(g, 13, 4, 'w'); if (f === 'side') { px(g, 5, 5, 'A'); px(g, 5, 4, 'w'); } }
    if (t.leaf) { if (f === 'side') { px(g, 6, 0, 'G'); px(g, 7, -1, 'G'); } else { px(g, 5, 0, 'G'); px(g, 8, -1, 'G'); px(g, 10, 0, 'G'); } }
    if (t.tail && f !== 'down') { if (f === 'side') { px(g, 4, 11, 'h'); px(g, 3, 12, 'h'); px(g, 2, 12, 'h'); } else { px(g, 8, 13, 'h'); px(g, 8, 14, 'h'); px(g, 9, 15, 'h'); } }
  }
  function build(seed, text, base){
    var r = rng(seed), t = traitsOf(text), outfit = outfitOf(text, r);
    // a people shares a colour family: base is a hex colour or a word (their people's name)
    var hue = base ? ((base.charAt(0) === '#' ? hexHue(base) : rng(base)() * 360) + (r() * 50 - 25) + 360) % 360 : r() * 360, acc = (hue + 150 + r() * 60) % 360;
    var skins = t.glow ? ['#fff4c8', '#ffe8a0'] : t.snout ? ['#7ab05a', '#5a8a40'] : t.crystal ? ['#a8d8f0', '#7ab0d0'] : t.visor ? ['#9aa2a8', '#6a727a'] : t.leaf ? ['#a8c878', '#7a9a50']
      : [['#f0c8a0', '#c89a78'], ['#d8a070', '#a87048'], ['#a8704a', '#7a4a2c'], ['#f4d8b8', '#d0a888'], ['#8a5a3a', '#5e3a22']][(r() * 5) | 0];
    var P = { t:t, outfit:outfit, big:!!t.big, robe:/hat|hood/.test(outfit) || (outfit === 'crown' && r() < .5) || r() < .15, cyclops:!!t.cyclops };
    var pal = { k:'#1c1626', s:skins[0], S:skins[1], h:hsl((hue + 200) % 360, 30 + r() * 30, 18 + r() * 25), c:hsl(hue, 40 + r() * 30, 34 + r() * 14), C:hsl(hue, 45, 52 + r() * 8), d:hsl(hue, 45, 22 + r() * 6),
      a:hsl(acc, 60, 42), A:hsl(acc, 75, 62), b:hsl(hue, 25, 18), e:'#1c1626', w:'#ffffff', m:hsl(210, 10, 62), G:'#7ab83a' };
    if (t.glow) pal.c = hsl(hue, 45, 70), pal.C = '#ffffff', pal.d = hsl(hue, 40, 52);
    var out = {};
    ['down', 'up', 'side'].forEach(function(f){
      var g = body(f, P); dress(g, f, P); traits(g, f, P);
      out[f] = { rows:outline(g).map(function(r){ return r.join(''); }), pal:pal };
    });
    return out;
  }
  var made = {};
  // the sprite for a person: key is their stable id; text is everything known about them (class, people, Codex words)
  function person(key, text, base, dir){
    if (!made[key]) {
      var sp = build(key, text || '', base);
      ['down', 'up', 'side'].forEach(function(f){ A.SPRITES['pp_' + key + '_' + f] = sp[f]; });
      made[key] = 1;
    }
    var f = dir === 'up' ? 'up' : dir === 'down' ? 'down' : 'side';
    return 'pp_' + key + '_' + f + (dir === 'left' ? '|flip' : '');
  }
  window.AOV_PEOPLE_ART = { person:person, traitsOf:traitsOf };
})();
