// ★ 2026-10-09 · AETHRYX ADVENTURES: 1936 · survey build 8 · NASARUS
// The Living Master Codex is the game's underlying lore and discovery schema (handoff §8);
// AETHRYX ADVENTURES: 1936 is the title. NASARUS canon: docs/card-explorer/05_NASARUS_CANON.md
// Canon: docs/card-explorer/02_CARL_NASARO_LIVING_MASTER_CODEX_CANON.md (locked)
// Design: docs/card-explorer/01_EXPLORATION_DESIGN.md · 04_OPEN_EXPANSE.md
// Content: data.js (story, Malezor) · environments.js (every world) · fauna.js (canon Aethren, type chart)
// Engine helpers: art.js (native pixel art) · worldgen.js (open worlds) · pad.js (DualSense)
//
// The player plays the role of Nasaro: they choose a first name, a gender and a
// look in a classic pocket-style opening. Three objectives (canon):
//   COLLECT THE EXPANSE · MAP THE EXPANSE · BRING IT HOME
//
// Flow: PRESS START → the Director → who are you → the kit → dossier (the AstraNav
//       is issued) → launch → hyperspace → the AstraNav wakes with all 28 bodies in
//       view → choose a first landing → open-world exploration: scan Aethren into
//       the AstraNav, meet the peoples and learn the
//       world → back aboard, set course for the next world.
// THE ASTRANAV is the whole interface: star map, field sketch, cards, Codex, log, setup.
(function(){
  'use strict';
  var D = window.EXP_DATA, STORY = D.story, ENVS = window.AOV_ENV || [], FAUNA = window.AOV_FAUNA, GEN = window.AOV_WORLDGEN, PAD = window.AOV_PAD;
  var ART = window.AOV_ART, HQ = window.AOV_HQ, CORE = window.AOV_CORE || { starter:[], recipes:[], classes:[] }, MATS = HQ.materials, MACHINES = HQ.machines || [];
  var COMPANIONS = CORE.companions || { enabled:true, clone:true, follow:true, battle:true, partySize:9 };
  var doc = document, ui = doc.getElementById('ui'), cv = doc.getElementById('view'), ctx = cv.getContext('2d');
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  // World names join the lexicon: unknown bodies are catalogued by number.
  D.worlds.forEach(function(w){
    w.term = w.name.toLowerCase();
    D.lexicon[w.term] = { unknown:'UNIDENTIFIED BODY No. ' + w.no, canon:w.name };
  });
  var WORLD = {}; D.worlds.forEach(function(w){ WORLD[w.no] = w; });
  var ENV = {}; ENVS.forEach(function(e){ ENV[e.id] = e; });
  function envOf(no){ var w = WORLD[no]; return w && ENV[w.term]; }
  function setTerm(n){ return n === 29 ? 'aenor' : n === 30 ? 'zoryth' : WORLD[n].term; }

  // ───────────────────────── the Codex's content, registered from the data files ─────────────────────────
  // Canon Aethren (fauna.js) and every world's plants, minerals, landmarks and peoples
  // become subjects that can be recorded and turned into cards.
  var EXP = window.AOV_EXP || { ship:{ systems:[] }, perks:[], warden:{}, guardian:{}, refugees:{}, ally:{} };
  var SP = FAUNA.species, BODY = { quad:'otterlin', amph:'verdanix', wing:'aetherwing', spine:'volcanut' };
  function shade(hex, k){
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function f(c){ return Math.max(0, Math.min(255, Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k))); }
    return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
  }
  function registerContent(){
    Object.keys(SP).forEach(function(id){
      var s = SP[id];
      if (!D.subjects[id]) D.subjects[id] = { kind:'aethren', set:s.world, term:id, district:s.district, tier:s.tier, types:s.types.join(' / '),
        temperament:s.temperament, canonNote:s.note || '', journal:s.journal, provisional:!!s.provisional,
        provisionalData:!!s.provisionalData, retired:!!s.retired, hidden:!!s.hidden };
      D.subjects[id].sp = id;
      if (!D.lexicon[id]) D.lexicon[id] = { unknown:s.unknown, canon:s.canon ? s.name : null };
      if (!ART.ANIM[id]) {
        var c = s.col || '#888888', c2 = s.col2 || c, map;
        if (s.body === 'quad') map = { i:shade(c, -.25), j:shade(c, .35), I:c2 };
        else if (s.body === 'amph') map = { x:shade(c, -.45), q:c, Q:shade(c, .4), h:shade(c2, -.3) };
        else if (s.body === 'wing') map = { V:c, c:c2, C:shade(c2, .6) };
        else map = { r:c, R:shade(c, .4), u:shade(c, -.5), y:c2 };
        ART.recolour('sp-' + id, map);
      }
    });
    D.worlds.forEach(function(w){
      var e = ENV[w.term]; if (!e || w.no === 9 || w.hidden) return;
      var p = e.palette || {}, gr = p.ground || {}, sp = p.special || p.liquid || {}, sv = Object.keys(sp).map(function(k){ return sp[k]; });
      var g0 = gr.g || '#5fa845';
      ART.recolour('pl-' + w.no, { h:shade(g0, -.35), g:shade(g0, .1), G:shade(g0, .4), c:sv[0] || '#3fa0e0', C:sv[1] || '#a8e8ff' });
      ART.recolour('mn-' + w.no, { c:sv[0] || '#3fa0e0', C:shade(sv[0] || '#3fa0e0', .6), N:shade(g0, -.5), n:shade(g0, -.2) });
      var terr = (e.terrain || ['ground', 'rock']);
      D.subjects['pl_' + w.no] = { kind:'plant', set:w.no, term:'pl_' + w.no, art:'shrub@pl-' + w.no, tier:null, types:'Botanical', canonNote:'',
        journal:'A plant growing among the ' + terr[0] + '. I pressed a leaf into the journal. Nothing on Earth grows like it.' };
      D.lexicon['pl_' + w.no] = { unknown:'PLANT · BODY No. ' + w.no, canon:null };
      D.subjects['mn_' + w.no] = { kind:'mineral', set:w.no, term:'mn_' + w.no, art:'astralite@mn-' + w.no, tier:null, types:'Mineral', canonNote:'',
        journal:'A crystalline sample from the ' + (terr[1] || terr[0]) + '. It is warm through the glove, and the wireless hisses when I hold it close.' };
      D.lexicon['mn_' + w.no] = { unknown:'MINERAL · BODY No. ' + w.no, canon:null };
    });
    ART.recolour('lm-gold', { c:'#e8c46a', C:'#fff3c8', N:'#5a4a2a', n:'#a8834c' });
    ENVS.forEach(function(e){
      (e.landmarks || []).forEach(function(name, i){
        var id = 'lm_' + e.id + '_' + i, no = e.kind === 'world' ? e.no : 9;
        D.subjects[id] = { kind:'location', set:no, term:id, art:'spire@lm-gold', district:e.kind === 'district' ? e.id : null, tier:null, types:'Location', canonNote:'',
          journal:'A structure no animal built. I sketched it from every side and paced out its base.' };
        D.lexicon[id] = { unknown:'UNNAMED STRUCTURE No. ' + (i + 1), canon:name.toUpperCase() };
      });
      var wall = (e.palette && e.palette.wall) || {}, path = (e.palette && e.palette.path) || {};
      ART.recolour('ppl-' + e.id, { u:wall.L || '#4b2e1a', b:path.P || path.p || '#7a4f2c', W:wall.W || '#cfc8b4' });
    });
    // the peoples: one relationship card per world (per district on Zyraxis)
    Object.keys(FAUNA.peoples).forEach(function(no){
      var pe = FAUNA.peoples[no]; no = +no;
      if (!pe.race || no === 9) return;
      var id = 'ppl_w' + no;
      D.subjects[id] = { kind:'haemen', set:no, term:id, art:'haemen_down@ppl-' + (envOf(no) || {}).id, tier:null, types:'People', species:pe.race, canonNote:'',
        journal:'They met me without fear. They looked longest at the AstraNav.' };
      D.lexicon[id] = { unknown:pe.unknown, canon:pe.race };
    });
    GEN.DISTRICTS.forEach(function(d, i){
      if (i === 0) return;
      var id = 'ppl_z_' + d;
      D.subjects[id] = { kind:'haemen', set:9, term:id, district:d, art:'haemen_down@ppl-' + d, tier:null, types:'Haemen', species:null, canonNote:'',
        journal:'People of this district. Their dress is nothing like the furs of the meadow.' };
      D.lexicon[id] = { unknown:'INHABITANTS, REGION ' + ['I','II','III','IV','V','VI','VII','VIII','IX','X'][i], canon:'HAEMEN OF ' + D.lexicon[d].canon };
    });
  }
  // NASARUS's ground recolours the native tiles, like every other environment
  (function(e){
    var p = e.palette || {}, all = {};
    ['ground','path','liquid','wall','special'].forEach(function(k){ if (p[k]) for (var c in p[k]) all[c] = p[k][c]; });
    ['ground','path','liquid','wall','special'].forEach(function(k){ ART.recolour(e.id + '-' + k, Object.assign({}, all, p[k] || {})); });
    Object.keys(e.prop_palette || {}).forEach(function(k){ ART.recolour(e.id + '-' + k, e.prop_palette[k]); });
  })(HQ.env);
  registerContent();

  // ───────────────────────── save ─────────────────────────
  var KEY = 'aov.explorer.v1';
  var LOOK = { skin:0, hair:0, style:0, hc:0, suit:0, helmet:0, visor:0 };
  function blank(){
    return { v:3, hero:{ first:'CARL', gender:'m', look:Object.assign({}, LOOK) }, stage:'title', flags:{ cloneRule:1 }, archive:{}, cards:{}, lex:{}, machines:{}, dev:{ access:false, chests:{} },
             core:{ enabled:true, recipes:{}, machines:{}, oil:0, astralites:{}, automation:{}, gameOver:false },
             suit:100, air:100, flares:2, visited:{}, at:null, landed:false, pos:null, fog:{}, notes:{}, found:{}, lore:{}, team:[], seen:{}, hq:newHQ(), pack:{}, exp:newExp(), codex:{}, codexPages:{}, codexIdx:{},
             opts:{ sound:false, haptics:true, text:1, hand:'right', alpha:1 }, started:Date.now() };
  }
  function newHQ(){ return { id:'nasarus', name:HQ.canonicalName, built:{}, drive:false, ruins:{}, regions:[], store:{}, research:{}, records:[], stage:1, equip:{}, parts:{}, installed:{}, residents:{}, settled:{} }; }
  function newExp(){ return { beaten:{}, vault:{}, aid:{} }; }
  var S = null, fresh = /[?&]newgame\b/.test(location.search);
  try { S = JSON.parse(localStorage.getItem(KEY)); } catch(e){}
  if (S && S.v === 1) {          // carry an early-build save forward
    var old1 = S; S = blank(); S.v = 2;
    ['cards','archive','notes','lex'].forEach(function(k){ if (old1[k]) S[k] = old1[k]; });
    ['power','air','radio','shotAenor','shotZoryth','copied','decoded'].forEach(function(k){ if (old1.flags && old1.flags[k]) S.flags[k] = old1.flags[k]; });
    if (old1.landed) S.visited[9] = Date.now();
    S.opts.sound = !!old1.sound;
  }
  if (S && S.v === 2) {          // survey builds 2-5: one map per district → the open Expanse
    var old2 = S, nu = blank();
    ['flags','archive','cards','lex','visited','notes','suit','air','flares'].forEach(function(k){ if (old2[k] != null) nu[k] = old2[k]; });
    nu.opts.sound = !!old2.sound;
    // undeveloped film becomes scans: every sharp frame is a card now
    (old2.frames || []).forEach(function(f){ if (f.subj && D.subjects[f.subj] && (f.grade === 'good' || f.grade === 'excellent')) { var c = nu.cards[f.subj] || (nu.cards[f.subj] = { qty:0, at:Date.now() }); c.qty++; } });
    Object.keys(nu.cards).forEach(function(id){ nu.cards[id].img = null; if (!nu.archive[id]) nu.archive[id] = { classified:Date.now() }; });
    nu.at = old2.visited && old2.visited[9] ? 9 : null; nu.landed = !!nu.at;
    nu.stage = old2.stage === 'title' || old2.stage === 'dossier' || old2.stage === 'launch' ? 'title' : 'nav';
    if (old2.pos && old2.pos.map === 'malezor') { nu.pos = { map:'w9', x:old2.pos.x + 3, y:old2.pos.y + 2, dir:old2.pos.dir }; nu.landed = true; }
    else if (old2.pos && old2.pos.map === 'firstden') { nu.pos = old2.pos; nu.landed = true; }
    Object.keys(nu.cards).forEach(function(id){ if (SP[id]) { nu.cards[id].lv = 4; nu.cards[id].xp = 0; } });
    nu.hq.drive = true; nu.hq.built.nav = Date.now(); nu.flags.charted = true; nu.flags.hqNew = true;
    S = nu;
  }
  if (S && S.v === 3 && S.frames) { delete S.frames; delete S.film; }
  // survey build 7 saves: the expedition is already under way, and NASARUS appears on the AstraNav to be claimed
  if (S && S.v === 3 && S.hq) { ['equip','parts','installed','residents','settled'].forEach(function(k){ S.hq[k] = S.hq[k] || {}; }); S.exp = S.exp || newExp(); S.codex = S.codex || {}; S.codexPages = S.codexPages || {}; S.codexIdx = S.codexIdx || {}; S.machines = S.machines || {}; S.dev = S.dev || { access:false, chests:{} }; S.dev.chests = S.dev.chests || {}; }
  if (S && S.v === 3 && !S.hq) { S.hq = newHQ(); S.hq.drive = true; S.hq.built.nav = Date.now(); S.pack = {}; S.machines = S.machines || {}; S.dev = S.dev || { access:false, chests:{} }; S.dev.chests = S.dev.chests || {}; S.flags.charted = true; S.flags.hqNew = true; }
  if (S && S.v === 3) {
    S.core = S.core || { enabled:false, recipes:{}, machines:{}, oil:0, astralites:{}, automation:{}, gameOver:false };
    S.core.recipes = S.core.recipes || {}; S.core.machines = S.core.machines || {}; S.core.astralites = S.core.astralites || {};
    S.core.automation = S.core.automation || {}; S.core.oil = Math.max(0, S.core.oil || 0);
  }
  // The cloning rule: a scan is a profile; an Aethren fights for Carl only
  // after its card has been cloned at NASARUS. Existing companions survive the migration.
  if (S && S.v === 3 && S.flags && !S.flags.cloneRule) {
    Object.keys(S.cards || {}).forEach(function(id){ var c = S.cards[id]; if (c.lv && c.clone == null) c.clone = Date.now(); });
    S.flags.cloneRule = 1;
  }
  if (fresh || !S || S.v !== 3) S = null;
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){ /* storage full or blocked: keep playing */ } }
  function opt(k){ return S && S.opts ? S.opts[k] : blank().opts[k]; }

  // ───────────────────────── the hero: the player is Nasaro ─────────────────────────
  var SKIN = [['#f0d0b0','#cca482'], ['#e8c8a8','#c49a78'], ['#d0a07a','#a8784e'], ['#a87450','#7e5234'], ['#7a4e30','#583420']];
  var HAIRC = [['#5a3a22','#8a5c34','BROWN'], ['#1e1814','#3e3228','BLACK'], ['#c89a48','#ecc878','FAIR'], ['#9a3e1e','#c8642e','AUBURN'], ['#8a8a8a','#c0c0c0','GREY'], ['#e8e0d0','#ffffff','WHITE']];
  var STYLES = [['hair_short','SHORT'], ['hair_slick','SLICKED'], ['hair_bob','BOB'], ['hair_long','LONG']];
  var SUITS = [['#b3a982','#d8cfa8','#6e6450','KHAKI'], ['#6e7a4a','#94a06a','#3e4628','OLIVE'], ['#3e4a6a','#5e6c92','#242c40','NAVY'], ['#7a7a74','#a4a49c','#4a4a44','GREY'], ['#8a4e34','#b2704e','#5a2e1c','RUST']];
  var HELMS = [['#c8843c','#eaa860','COPPER'], ['#c8a040','#ecd078','BRASS'], ['#8a949c','#c0c8d0','STEEL'], ['#2a2a30','#545460','ENAMEL']];
  var VISORS = [['#9fd2e6','#dff4fb','SKY'], ['#e8b860','#fbe8b8','AMBER'], ['#8ad0a0','#d8f4e0','GREEN']];
  function hero(){ return (S && S.hero) || blank().hero; }
  function heroName(){ return hero().first + ' NASARO'; }
  function heroSet(){ return hero().gender === 'f' ? 'nasf' : 'carl'; }
  function applyLook(look, id){
    look = look || hero().look;
    var sk = SKIN[look.skin] || SKIN[1], hc = HAIRC[look.hc] || HAIRC[0], su = SUITS[look.suit] || SUITS[0], he = HELMS[look.helmet] || HELMS[0], vi = VISORS[look.visor] || VISORS[0];
    ART.recolour(id || 'player', { t:sk[0], T:sk[1], Z:hc[0], X:hc[1], s:su[0], S:su[1], d:su[2], o:he[0], O:he[1], e:vi[0], E:vi[1] });
  }
  ART.recolour('director', { t:SKIN[1][0], T:SKIN[1][1], Z:'#a8a8a8', X:'#dcdcdc', s:'#2a2a34', S:'#3a3a48', d:'#1a1a22', y:'#9a2a2a', W:'#efe6d0' });
  function withRc(spec, rc){ var p = spec.split('|'); return p[0] + '@' + rc + (p[1] ? '|' + p[1] : ''); }
  function heroSpec(dir, n){ return withRc(ART.frame(heroSet(), dir, n), 'player'); }
  function portraitDraw(c, look, gender, scale){
    var g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); g.imageSmoothingEnabled = false;
    applyLook(look, 'preview');
    var st = STYLES[look.style] || STYLES[0];
    ART.draw(g, (gender === 'f' ? 'face_f' : 'face_m') + '@preview', c.width / 2, c.height, scale);
    ART.draw(g, st[0] + '@preview', c.width / 2, c.height, scale);
  }

  // ───────────────────────── helpers ─────────────────────────
  function el(tag, cls, html){ var n = doc.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function $(sel, root){ return (root || ui).querySelector(sel); }
  function $$(sel, root){ return Array.prototype.slice.call((root || ui).querySelectorAll(sel)); }
  function clamp(v, a, b){ return v < a ? a : v > b ? b : v; }
  function known(t){ var L = D.lexicon[t]; return !!(L && L.canon && S.lex[t]); }
  function term(t){ var L = D.lexicon[t]; return L ? (known(t) ? L.canon : L.unknown) : t; }
  function subj(id){ return D.subjects[id]; }
  function subjName(id){ return term(subj(id).term); }
  function setName(n){ return 'SET ' + (n < 10 ? '0' : '') + n + ' — ' + term(setTerm(n)); }
  function wait(ms){ return new Promise(function(r){ setTimeout(r, reduced ? Math.min(ms, 60) : ms); }); }
  function pad2(n){ return (n < 10 ? '0' : '') + n; }
  function title1936(s){ return s.charAt(0) + s.slice(1).toLowerCase(); }
  function textSpeed(){ return [30, 16, 6][opt('text')] || 16; }

  // ───────────────────────── sound (off by default) & haptics ─────────────────────────
  var actx = null;
  function tone(f, d, type, vol, when){
    if (!S || !opt('sound')) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var t = actx.currentTime + (when || 0), o = actx.createOscillator(), g = actx.createGain();
      o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(vol || 0.04, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + d + 0.02);
    } catch(e){}
  }
  var sfx = {
    key:     function(){ tone(1800 + Math.random()*400, .015, 'square', .015); },
    step:    function(){ tone(140, .03, 'triangle', .02); },
    click:   function(){ tone(420, .05, 'square', .04); tone(180, .06, 'square', .04, .03); },
    shutter: function(){ tone(2400, .02, 'square', .05); tone(900, .05, 'sawtooth', .04, .03); },
    warn:    function(){ tone(220, .25, 'sawtooth', .05); tone(180, .25, 'sawtooth', .05, .25); },
    bump:    function(){ tone(90, .06, 'square', .04); },
    reveal:  function(){ [392,494,587,784].forEach(function(f,i){ tone(f, .18, 'triangle', .04, i*.09); }); },
    meet:    function(){ [660,520,780].forEach(function(f,i){ tone(f, .1, 'square', .035, i*.07); }); },
    hit:     function(){ tone(120, .12, 'square', .06); tone(70, .15, 'sawtooth', .05, .05); },
    start:   function(){ [523,659,784,1046].forEach(function(f,i){ tone(f, .12, 'square', .04, i*.08); }); }
  };
  function vibrate(ms, strong){
    if (S && opt('haptics') === false) return;
    if (PAD && PAD.rumble(ms, strong == null ? .7 : strong, .4)) return;
    try { if (navigator.vibrate) navigator.vibrate(ms); } catch(e){}
  }

  // ───────────────────────── toasts ─────────────────────────
  var toasts = el('div', 'x-toasts'); toasts.setAttribute('aria-live', 'polite'); doc.body.appendChild(toasts);
  function toast(txt, kind){
    var t = el('div', 'x-toast' + (kind ? ' ' + kind : ''), esc(txt));
    toasts.appendChild(t);
    while (toasts.children.length > 3) toasts.removeChild(toasts.firstChild);
    setTimeout(function(){ t.classList.add('out'); setTimeout(function(){ t.remove(); }, 400); }, 2600);
  }

  // Typewriter: types `text` into node, returns a promise. Tap to finish early.
  function typeInto(node, text, speed){
    return new Promise(function(res){
      var i = 0, done = false;
      function finish(){ if (done) return; done = true; node.textContent = text; node.removeEventListener('click', finish); node._finish = null; node._doneAt = performance.now(); res(); }
      node.addEventListener('click', finish);
      node._finish = finish;
      if (reduced) return finish();
      (function step(){
        if (done) return;
        node.textContent = text.slice(0, ++i);
        if (i % 2) sfx.key();
        if (i >= text.length) finish(); else setTimeout(step, speed || textSpeed());
      })();
    });
  }

  // ───────────────────────── archive & cards ─────────────────────────
  var POINTS = {
    aethren:{ observe:1, battled:1, fair:1, classified:2 }, haemen:{ talk:1, classified:2 },
    mineral:{ classified:3 }, plant:{ classified:3 }, location:{ reached:1, classified:2 }, celestial:{ classified:3 }
  };
  function arc(id){ return S.archive[id] || (S.archive[id] = {}); }
  function mark(id, what){ var a = arc(id); if (a[what]) return false; a[what] = Date.now(); save(); return true; }
  var setCache = {};
  function setSubjects(n){ return setCache[n] || (setCache[n] = Object.keys(D.subjects).filter(function(id){ var x = subj(id); return x.set === n && !x.retired && !x.hidden; })); }
  function setPct(n){
    var got = 0, max = 0;
    setSubjects(n).forEach(function(id){
      var s = subj(id), P = POINTS[s.kind] || {}, a = S.archive[id] || {};
      Object.keys(P).forEach(function(k){ max += P[k]; if (a[k] || (a.classified && (k === 'fair' || k === 'battled' || k === 'observe'))) got += P[k]; });
    });
    return max ? Math.round(got / max * 100) : 0;
  }
  function setCards(n){ return Object.keys(S.cards).filter(function(id){ return subj(id) && subj(id).set === n; }).length; }
  function totalCopies(){ return Object.keys(S.cards).reduce(function(n, id){ return n + S.cards[id].qty; }, 0); }
  function classifiedCount(kind){
    return Object.keys(S.archive).filter(function(id){ return S.archive[id].classified && subj(id) && (!kind || subj(id).kind === kind); }).length;
  }
  // GOAL II: the first map. Half credit for identifying a body, half for visiting
  // (or, for Aenor and Zoryth, scanning) it.
  function mapPct(){
    var pts = 0, list = D.worlds.filter(function(w){ return !w.hidden; });
    list.forEach(function(w){ if (known(w.term)) pts += .5; if (S.visited[w.no]) pts += .5; });
    ['aenor','zoryth'].forEach(function(k){ if (known(k)) pts += .5; if (S.cards[k]) pts += .5; });
    return Math.round(pts / (list.length + 2) * 100);
  }
  function identifiedCount(){ return D.worlds.filter(function(w){ return !w.hidden && known(w.term); }).length; }
  function manifest(id, img, foil, lv){
    var c = S.cards[id], first = !c;
    if (!c) c = S.cards[id] = { qty:0, img:img || null, foil:false, at:Date.now() };
    c.qty++; if (foil) c.foil = true; if (!c.img && img) c.img = img;
    if (!(M && M.hq && mode === 'surface') && S.at !== 'nasarus') c.pend = (c.pend || 0) + 1;   // redeemed at home
    if (subj(id).sp) { c.lv = Math.max(c.lv || 0, lv || 3); c.xp = c.xp || 0; if (c.hp == null) c.hp = maxHp(id); autoTeam(); }
    if (!arc(id).classified) arc(id).classified = Date.now();
    S.notes[id] = 1;
    save();
    return first;
  }
  function rarity(s){ return s.tier ? s.tier + '/10' : 'UNRATED'; }
  function classLine(s){
    return s.kind === 'aethren' ? term('aethren') : s.kind === 'haemen' ? (s.types === 'Haemen' ? term('haemen') : 'PEOPLE') : s.kind === 'mineral' ? 'MINERAL SPECIMEN' :
      s.kind === 'plant' ? 'BOTANICAL SPECIMEN' : s.kind === 'location' ? 'LOCATION' : 'CELESTIAL BODY';
  }
  // the sprite for any Aethren: its own art if drawn, else its body plan in its colours
  function critterSpec(id, dir, n){
    if (ART.ANIM[id]) return ART.frame(id, dir, n);
    var s = SP[id]; if (!s) return 'boulder';
    return withRc(ART.frame(BODY[s.body] || 'otterlin', dir, n), 'sp-' + id);
  }
  function subjArt(id){ var s = subj(id); return s.art || (s.sp ? critterSpec(s.sp, 'down', 0) : null); }
  function artHtml(s, c, id){
    if (c && c.img) return '<img alt="" src="' + c.img + '">';
    var a = subjArt(id);
    if (a) return '<img class="x-pix" alt="" src="' + ART.url(a, 8) + '">';
    return '<span class="x-noimg">NO PLATE</span>';
  }
  function worldOfSubj(s){ return s.set <= 28 ? term(setTerm(s.set)) : null; }
  function cardHtml(id, big){
    var s = subj(id), c = S.cards[id] || { qty:0 };
    var rows = [['SET', setName(s.set)], ['CLASS', classLine(s)]];
    if (s.district) rows.push(['DISTRICT', term(s.district)]);
    if (s.kind === 'aethren') rows.push(['SPECIES', subjName(id)], ['TYPES', s.types]);
    if (s.kind === 'haemen') rows.push(['PEOPLE', s.species ? (known(s.term) ? s.species : '— not yet learned —') : '— awaiting canon —']);
    if (s.sp && c.lv) rows.push(['LEVEL', String(c.lv)], ['VIGOUR', Math.max(0, c.hp == null ? maxHp(id) : c.hp) + ' / ' + maxHp(id)]);
    rows.push(['RARITY', rarity(s)], ['QUANTITY', String(c.qty)]);
    return '<div class="x-card' + (c.foil ? ' foil' : '') + (big ? ' big' : '') + (c.pend ? ' pend' : '') + '" data-card="' + id + '">' +
      (c.pend ? '<div class="x-card-pend">IN PACK · BRING HOME</div>' : s.sp && !c.clone ? '<div class="x-card-pend prof">PROFILE · CLONE AT ' + esc(hqName()) + '</div>' : '') +
      '<div class="x-card-band">' + esc(setName(s.set)) + '</div>' +
      '<div class="x-card-art">' + artHtml(s, c, id) + '</div>' +
      '<div class="x-card-nm">' + esc(subjName(id)) + '</div>' +
      (big ? '<dl class="x-card-dl">' + rows.map(function(r){ return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl>' +
        (s.sp && c.lv ? '<p class="x-card-moves">' + spMoves(s.sp).map(function(m){ return '<span style="--tc:' + typeCol(m.t) + '">' + esc(m.n) + ' · ' + esc(m.t.toUpperCase()) + '</span>'; }).join('') + '</p>' : '') +
        (s.canonNote && known(s.term) ? '<p class="x-card-canon">' + esc(s.canonNote) + '</p>' : '') +
        (s.provisional ? '<p class="x-card-canon">PROVISIONAL · awaiting the Creator’s species for this world</p>' : '') +
        (s.provisionalData ? '<p class="x-card-canon">OFFICIAL ROSTER · tier and types provisional, awaiting the Creator</p>' : '') +
        (s.retired ? '<p class="x-card-canon">RETIRED · no longer on the official roster</p>' : '') +
        '<p class="x-card-note">“' + esc(s.journal) + '”</p>'
        : '<div class="x-card-meta"><span>' + esc(classLine(s)) + (s.sp && c.lv ? ' · LV ' + c.lv : '') + '</span><b>' + rarity(s) + '</b></div>') +
      (c.qty > 1 ? '<span class="x-qty">×' + c.qty + '</span>' : '') +
      '</div>';
  }
  // The field reveal: a card flips into existence over the game.
  function cardReveal(id, first, label){
    return new Promise(function(res){
      sfx.reveal(); vibrate(60, .3);
      var m = el('div', 'x-modal x-reveal', '<div class="x-modal-in"><p class="x-man-k">' + esc(label || (first ? 'CARD ACQUIRED' : 'ANOTHER COPY · QUANTITY +1')) + '</p>' + cardHtml(id, true) + '<button class="x-btn">CONTINUE</button></div>');
      ui.appendChild(m);
      var b = $('.x-btn', m); setTimeout(function(){ b.focus(); }, 50);
      b.addEventListener('click', function(){ m.remove(); res(); });
    });
  }

  // ───────────────────────── battle numbers (canon stats, canon chart) ─────────────────────────
  function typeCol(t){ return FAUNA.colors[t] || '#8a8a8a'; }
  function spMoves(spId){ return (SP[spId] && SP[spId].moves) || []; }
  function stat(base, lv){ return Math.floor(base * 2 * lv / 100) + 5; }
  function hpOf(spId, lv){ var b = SP[spId].base; return Math.floor(b.hp * 2 * lv / 100) + lv + 10; }
  function maxHp(cardId){ var s = subj(cardId), c = S.cards[cardId]; return s && s.sp ? hpOf(s.sp, (c && c.lv) || 3) : 0; }
  function mult(moveType, defTypes){
    var m = 1, strong = FAUNA.strong;
    defTypes.forEach(function(d){
      if (!strong[moveType] || !strong[d]) return;
      if (strong[moveType].indexOf(d) >= 0) m *= 2;
      else if (strong[d].indexOf(moveType) >= 0) m *= .5;
    });
    return m;
  }
  function effLabel(m){ return m >= 3 ? 'It’s overwhelming!' : m > 1 ? 'It’s super effective!' : m <= .25 ? 'It barely scratched it . . .' : m < 1 ? 'It’s not very effective . . .' : null; }
  function damage(att, def, mv){
    var sa = SP[att.sp], sd = SP[def.sp], special = mv.s === 'A3';
    var A = stat(special ? sa.base.spc : sa.base.atk, att.lv), Dd = stat(special ? sd.base.spc : sd.base.def, def.lv);
    var mu = mult(mv.t, sd.types), stab = sa.types.indexOf(mv.t) >= 0 ? 1.5 : 1;
    var dmg = Math.floor(((2 * att.lv / 5 + 2) * mv.p * A / Dd) / 50 + 2);
    dmg = Math.max(1, Math.floor(dmg * mu * stab * (.85 + Math.random() * .15)));
    return { dmg:dmg, mult:mu };
  }
  function aethrenCards(){ if (!COMPANIONS.clone) return []; return Object.keys(S.cards).filter(function(id){ return subj(id) && subj(id).sp && S.cards[id].lv && S.cards[id].clone; }); }
  function profileIds(){ return Object.keys(S.cards).filter(function(id){ return subj(id) && subj(id).sp && !S.cards[id].clone; }); }
  function autoTeam(){
    if (!COMPANIONS.follow) { S.team = []; return; }
    S.team = (S.team || []).filter(function(id){ return S.cards[id] && S.cards[id].clone; });
    aethrenCards().sort(function(a, b){ return (S.cards[b].lv || 0) - (S.cards[a].lv || 0); }).forEach(function(id){ if (S.team.length < teamMax() && S.team.indexOf(id) < 0) S.team.push(id); });
  }
  function teamReady(){ if (!COMPANIONS.follow || !COMPANIONS.battle) return []; autoTeam(); return S.team.filter(function(id){ var c = S.cards[id]; return c.hp == null || c.hp > 0; }); }
  function healTeam(){ if (!COMPANIONS.clone) return; aethrenCards().forEach(function(id){ S.cards[id].hp = maxHp(id); }); }

  // ───────────────────────── objectives (Expedition Log) ─────────────────────────
  function goalLines(){
    return [
      Object.keys(S.cards).length + ' cards · ' + totalCopies() + ' copies in the collection',
      mapPct() + '% charted · ' + identifiedCount() + ' of 27 bodies named',
      'Earth’s position: UNKNOWN'
    ];
  }
  function goalsHtml(){
    var L = goalLines();
    return '<div class="x-goals">' + STORY.goals.map(function(g, i){
      return '<div class="x-goal"><span>' + ['I','II','III'][i] + '</span><b>' + esc(g[0]) + '</b><em>' + esc(L[i]) + '</em></div>';
    }).join('') + '</div>';
  }
  function chaptersHtml(){
    return '<div class="x-chapters"><p class="x-mono">THE EXPEDITION</p><ol>' + STORY.chapters.map(function(c, i){
      return '<li class="' + (c.open ? 'open' : '') + '"><span>' + ['I','II','III','IV'][i] + '</span>' +
        (c.open ? '<b>' + esc(c.era) + ' · ' + esc(c.title.toUpperCase()) + '</b><em>' + esc(c.note.replace('Carl Nasaro', title1936(hero().first) + ' Nasaro')) + '</em>' : '<b>· · · A FUTURE CHAPTER</b>') + '</li>';
    }).join('') + '</ol></div>';
  }
  function peoplesMet(){ return Object.keys(S.lore).length; }
  function battlesWon(){ return Object.keys(S.archive).filter(function(id){ return S.archive[id].battled; }).length; }
  function objectives(){
    var F = S.flags, fauna = classifiedCount('aethren'), spec = classifiedCount('plant') + classifiedCount('mineral');
    var worlds = D.worlds.filter(function(w){ return S.visited[w.no]; }).length;
    return [
      { t:'Make camp beside the wreck on ' + hqName(), done: !!S.hq.built.camp },
      { t:'Recover the five NASARUS machine papers (' + Object.keys(S.core.recipes || {}).length + '/5)', done: Object.keys(S.core.recipes || {}).length >= 5 },
      { t:'Build the five-machine departure chain (' + coreBuiltCount() + '/5)', done: coreBuiltCount() >= 5 },
      { t:'Survey the ruins of ' + hqName() + ' (' + Math.min(Object.keys(S.hq.ruins).length, 3) + '/3)', done: Object.keys(S.hq.ruins).length >= 3 },
      { t:'Build the ROCKETSHIP REPAIR STATION', done: coreMachine('rocketship_repair') || (!S.core.enabled && !!S.hq.drive) },
      { t:'Build the Navigation Center', done: !!S.hq.built.nav },
      { t:'Depart on your first expedition', done: worlds > 0 },
      { t:'Return to ' + hqName() + ' and deposit what you extracted', done: !!S.flags.returned },
      { t:'Reach STAGE 2 · EXPEDITION CAMP', done: hqStage() >= 2 },
      { t:'Find a world’s clue: learn from its people, or read its records', done: D.worlds.some(function(w){ return hasClue(w.no); }) },
      { t:'Face a warden or a vault’s guardian, and win', done: Object.keys(S.exp.beaten).length > 0 },
      { t:'Bring a ship part home to ' + hqName() + ' and install it (ship ' + shipPct() + '%)', done: Object.keys(S.hq.installed).length > 0 },
      { t:'Rescue refugees from a war region', done: Object.keys(S.hq.residents).length > 0 },
      { t:'Settle an Aethren species on ' + hqName(), done: Object.keys(S.hq.settled).length > 0 },
      { t:'Make contact with an inhabitant', done: !!(S.archive.furtrader && S.archive.furtrader.talk) || peoplesMet() > 0 },
      { t:'Scan ' + (known('aethren') ? 'Aethren' : 'creatures') + ' into the AstraNav (' + Math.min(fauna, 3) + '/3)', done: fauna >= 3 },
      { t:'Clone a scanned profile at ' + hqName() + '’s Research Station: your first companion', done: aethrenCards().length > 0 },
      { t:'Win an Aethren battle with your deployed party (' + Math.min(battlesWon(), 1) + '/1)', done: battlesWon() >= 1 },
      { t:'Document botanical and mineral specimens (' + Math.min(spec, 3) + '/3)', done: spec >= 3 },
      { t:'Show an inhabitant your scans and learn their words', done: !!F.taught || peoplesMet() > 0 },
      { t: known('firstden') ? 'Copy the carved markings in The First Den' : 'Explore the stone cave and copy its markings', done: F.copied },
      { t:'Decode the markings (AstraNav · CODEX)', done: F.decoded },
      { t:'Set course for another world and land there (' + Math.min(worlds, 2) + '/2 worlds)', done: worlds >= 2 },
      { t:'Learn the ways of three peoples (' + Math.min(peoplesMet(), 3) + '/3)', done: peoplesMet() >= 3 },
      { t: known('aenor') ? 'Scan Aenor and Zoryth (AstraNav · SYSTEM)' : 'Scan the radiant body and its satellite (AstraNav · SYSTEM)', done: F.shotAenor && F.shotZoryth, side:true },
      { t:'REBUILD THE SHIP FOR HYPERSPACE · THE WAY HOME (' + shipPct() + '%)', done: shipPct() >= 100, main:true }
    ];
  }
  function objList(){
    return goalsHtml() + chaptersHtml() + '<ol class="x-obj">' + objectives().map(function(o){ return '<li class="' + (o.done ? 'done' : '') + (o.main ? ' main' : '') + (o.side ? ' side' : '') + '">' + esc(o.t) + '</li>'; }).join('') + '</ol>';
  }

  // ═════════════════════════ SCENES (DOM) ═════════════════════════
  function screen(cls, html){
    stopWorld(); closeDialog(-2);
    ui.innerHTML = ''; var s = el('div', 'x-screen ' + cls, html); ui.appendChild(s);
    doc.body.classList.toggle('in-nav', /\bx-nav\b/.test(cls));
    setTimeout(function(){ if (padOn) focusFirst(); }, 30);
    return s;
  }
  // phones play sideways: go full screen and hold landscape where the browser allows
  function goLandscape(){
    if (!coarse) return;
    var de = doc.documentElement;
    try {
      var p = de.requestFullscreen ? de.requestFullscreen({ navigationUI:'hide' }) : de.webkitRequestFullscreen ? de.webkitRequestFullscreen() : null;
      var sc = window.screen; Promise.resolve(p).then(function(){ if (sc.orientation && sc.orientation.lock) return sc.orientation.lock('landscape'); }).catch(function(){});
    } catch(e){}
  }

  // ── title · PRESS START ──
  function title(){
    var s = screen('x-title',
      '<div class="x-title-in">' +
        '<p class="x-stamp">TOP SECRET · 1936</p>' +
        '<h1>AETHRYX<br>ADVENTURES</h1><p class="x-year">1936</p>' +
        '<p class="x-tsub">THE AOV™ SAGA · THE EXPEDITION OF NASARO · THE LIVING MASTER CODEX</p>' +
        '<img class="x-title-ship x-pix" alt="" src="' + ART.url('ship', 5) + '">' +
        '<p class="x-press" data-nav tabindex="0" role="button">PRESS START</p>' +
        '<div class="x-btns" hidden>' +
          (S ? '<button class="x-btn" data-a="continue">CONTINUE</button>' : '') +
          '<button class="x-btn' + (S ? ' ghost' : '') + '" data-a="new">NEW GAME</button>' +
        '</div>' +
        '<p class="x-fine">Survey build 8 · NASARUS · progress is saved in this browser only<br>' + esc(STORY.rule) + '<br><a href="/games.html">← THE GAMES</a></p>' +
      '</div>');
    var pressed = false;
    function start(){
      if (pressed) return; pressed = true;
      sfx.start(); goLandscape();
      $('.x-press', s).hidden = true; var b = $('.x-btns', s); b.hidden = false;
      setTimeout(function(){ var f = $('.x-btn', b); if (f) f.focus(); }, 30);
      removeEventListener('keydown', anyKey);
    }
    function anyKey(e){ if (!/^(Tab|Shift|Alt|Control|Meta)$/.test(e.key)) { e.preventDefault(); start(); } }
    addEventListener('keydown', anyKey);
    s.addEventListener('click', function(e){
      if (!pressed) { if (!e.target.closest('a')) start(); return; }
      var a = e.target.closest('[data-a]'); if (!a) return;
      sfx.click();
      if (a.dataset.a === 'continue') { applyLook(); resume(); return; }
      if (S && !confirm('Start a new game? Your current expedition will be lost.')) return;
      intro();
    });
    titleStart = start;
  }
  var titleStart = null;
  function resume(){
    if (S.stage === 'surface' && S.pos && S.landed) surface(S.pos.map);
    else if (S.stage === 'nav' || S.stage === 'surface') ship();
    else if (S.stage === 'launch') launch();
    else if (S.stage === 'crash') crash();
    else if (S.stage === 'dossier') dossier();
    else intro();
  }

  // ── the opening, in the classic pocket style: the Director, who are you, your name, your kit ──
  function gbaScene(){
    var g = screen('x-gba',
      '<div class="x-gba-stage"><div class="x-gba-floor"></div>' +
        '<canvas class="x-gba-por" width="144" height="192" aria-hidden="true"></canvas>' +
        '<div class="x-gba-pick" hidden></div>' +
        '<img class="x-gba-prop x-pix" alt="" hidden></div>' +
      '<div class="x-dialog gba" hidden><p class="x-dtext"></p><div class="x-dchoices"></div><span class="x-dmore">▼</span></div>');
    g.addEventListener('click', function(e){ if (dlg && !e.target.closest('[data-c]')) advanceDialog(); });
    return g;
  }
  function drawDirector(c){
    var g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); g.imageSmoothingEnabled = false;
    ['face_m','hair_slick','moustache'].forEach(function(n){ ART.draw(g, n + '@director', c.width / 2, c.height, 6); });
  }
  async function intro(){
    S = blank(); S.stage = 'intro';
    var s = gbaScene(), por = $('.x-gba-por', s), prop = $('.x-gba-prop', s), pick = $('.x-gba-pick', s);
    drawDirector(por); por.classList.add('in');
    await wait(500);
    await say(['Hello there! Welcome to the EXPERIMENTAL ROCKET PROGRAM.',
               'Around here, they call me the DIRECTOR. My name is not important. Yours will be.']);
    prop.src = ART.url('ship', 6); prop.hidden = false;
    await say(['This is our vessel. It has never flown.',
               'Some of our astronomers believe the sky is full of other worlds, with creatures and peoples no one on Earth has ever seen.',
               'We know nothing about them. That is why we need an observer.']);
    prop.hidden = true;
    prop.src = ART.url('astranav', 8); prop.hidden = false;
    await say(['And this is yours: the ASTRANAV. Navigation, survey and a scanner, all in one case. American-made.',
               'Point it at anything you find out there and it will take its measure: plants, minerals, places, living things. Every scan is kept.',
               'It is the only one in the world. Do not lose it.']);
    prop.hidden = true;
    await say(['First, tell me a little about yourself.']);
    por.hidden = true;
    var lookM = Object.assign({}, LOOK), lookF = Object.assign({}, LOOK, { style:2 });
    pick.innerHTML = '<figure data-g="m"><canvas width="120" height="160"></canvas><figcaption>MAN</figcaption></figure><figure data-g="f"><canvas width="120" height="160"></canvas><figcaption>WOMAN</figcaption></figure>';
    var cs = $$('canvas', pick); portraitDraw(cs[0], lookM, 'm', 5); portraitDraw(cs[1], lookF, 'f', 5);
    pick.hidden = false;
    var g = await say(['Are you a man or a woman?'], ['MAN', 'WOMAN'], null, function(i){ $$('figure', pick).forEach(function(f, k){ f.classList.toggle('on', k === i); }); });
    S.hero.gender = g === 1 ? 'f' : 'm'; S.hero.look = g === 1 ? lookF : lookM;
    pick.hidden = true; por.hidden = false;
    var name = '';
    while (!name) {
      var presets = S.hero.gender === 'm' ? ['NEW NAME', 'CARL'] : ['NEW NAME'];
      var choice = presets.length > 1 ? await say(['Let’s begin with your name. What is it?'], presets) : 0;
      if (presets.length === 1) await say(['Let’s begin with your name. What is it?']);
      var first = choice === 1 ? 'CARL' : await naming({ gender:S.hero.gender });
      s = gbaScene(); por = $('.x-gba-por', s); prop = $('.x-gba-prop', s); drawDirector(por); por.classList.add('in', 'now');
      var ok = await say(['Right . . . so your name is ' + first + ' NASARO?'], ['YES', 'NO']);
      if (ok === 0) name = first;
    }
    S.hero.first = name;
    await say(['' + name + ' NASARO. Good. Before you suit up, let’s get your kit fitted.']);
    S.hero.look = await kit(S.hero.gender, S.hero.look);
    applyLook();
    s = gbaScene(); por = $('.x-gba-por', s); drawDirector(por); por.classList.add('in', 'now');
    await say([name + ' NASARO! You will be the first person from Earth to see what is out there.',
               'Scan everything into the AstraNav. Keep a record. And whatever you find . . .', 'bring it home.',
               'Your very own expedition is about to unfold! A sky full of worlds is waiting. Let’s go!']);
    // the classic shrink: the portrait becomes the little figure who walks the worlds
    var c = por.getContext('2d'); portraitDraw(por, S.hero.look, S.hero.gender, 6);
    await wait(400);
    por.classList.add('shrink'); await wait(reduced ? 50 : 900);
    c.clearRect(0, 0, por.width, por.height); c.imageSmoothingEnabled = false;
    ART.draw(c, heroSpec('down', 0), por.width / 2, por.height - 40, 6);
    por.classList.remove('shrink'); por.classList.add('tiny');
    await wait(reduced ? 50 : 900);
    fade(function(){ S.stage = 'dossier'; save(); dossier(); });
  }

  // the naming screen: a letter grid, as on a handheld (type on a keyboard too)
  function naming(o){
    o = o || {}; var gender = o.gender || hero().gender, suffix = o.suffix == null ? 'NASARO' : o.suffix, max = o.max || 10;
    return new Promise(function(res){
      var rows = ['ABCDEFGHI', 'JKLMNOPQR', 'STUVWXYZ-', "'.     "], v = o.def || '';
      var s = screen('x-name',
        '<div class="x-name-in"><div class="x-name-head"><canvas width="48" height="64" aria-hidden="true"></canvas><div><p>' + esc(o.title || 'YOUR NAME?') + '</p>' +
          '<p class="x-name-v"><span class="x-name-slots"></span> <b>' + esc(suffix) + '</b></p></div></div>' +
        '<div class="x-name-grid">' + rows.map(function(r){ return '<div>' + r.split('').map(function(ch){
          return ch === ' ' ? '<span></span>' : '<button data-k="' + esc(ch) + '">' + esc(ch) + '</button>'; }).join('') + '</div>'; }).join('') +
          '<div class="x-name-ctl"><button data-k="DEL">DEL</button><button data-k="OK" class="ok">OK</button></div></div></div>');
      var cnv = $('canvas', s), g2 = cnv.getContext('2d'); g2.imageSmoothingEnabled = false;
      if (o.world) { g2.fillStyle = '#8a8272'; g2.beginPath(); g2.arc(24, 34, 18, 0, 7); g2.fill(); g2.fillStyle = '#5e574d'; g2.fillRect(14, 30, 8, 4); g2.fillRect(28, 38, 6, 3); g2.strokeStyle = '#6fd0c0'; g2.beginPath(); g2.arc(24, 34, 22, 0, 7); g2.stroke(); }
      else { applyLook(S.hero.look); ART.draw(g2, withRc(ART.frame(gender === 'f' ? 'nasf' : 'carl', 'down', 0), 'player'), 24, 64, 3); }
      function paint(){ $('.x-name-slots', s).innerHTML = Array.from({ length:max }, function(_, i){ return '<i>' + (v[i] ? esc(v[i]) : i === v.length ? '▁' : '·') + '</i>'; }).join(''); }
      paint();
      function key(k){
        if (k === 'DEL') v = v.slice(0, -1);
        else if (k === 'OK') { if (!v.trim()) { toast('Enter a name first', 'red'); sfx.bump(); return; } removeEventListener('keydown', kb); sfx.click(); res(v.trim()); return; }
        else if (v.length < max) v += k;
        sfx.key(); paint();
      }
      function kb(e){
        if (/^[a-zA-Z.'\-]$/.test(e.key)) { e.preventDefault(); key(e.key.toUpperCase()); }
        else if (e.key === 'Backspace') { e.preventDefault(); key('DEL'); }
        else if (e.key === 'Enter' && doc.activeElement && !doc.activeElement.closest('.x-name-grid')) { e.preventDefault(); key('OK'); }
      }
      addEventListener('keydown', kb);
      s.addEventListener('click', function(e){ var b = e.target.closest('[data-k]'); if (b) key(b.dataset.k); });
    });
  }

  // the kit: skin, hair, suit, helmet and visor. Everything is a recolour of the native sprites.
  var KIT = [
    ['skin', 'SKIN', SKIN.map(function(x, i){ return 'TONE ' + (i + 1); })],
    ['style', 'HAIR', STYLES.map(function(x){ return x[1]; })],
    ['hc', 'HAIR COLOUR', HAIRC.map(function(x){ return x[2]; })],
    ['suit', 'SUIT', SUITS.map(function(x){ return x[3]; })],
    ['helmet', 'HELMET', HELMS.map(function(x){ return x[2]; })],
    ['visor', 'VISOR', VISORS.map(function(x){ return x[2]; })]
  ];
  function kit(gender, look, back){
    return new Promise(function(res){
      look = Object.assign({}, LOOK, look);
      var s = screen('x-kit',
        '<div class="x-kit-in riv"><p class="x-plate">FIT YOUR KIT</p><div class="x-kit-grid">' +
          '<div class="x-kit-prev"><canvas class="por" width="120" height="160" aria-label="Portrait"></canvas><canvas class="spr" width="96" height="96" aria-label="Field sprite"></canvas></div>' +
          '<div class="x-kit-rows">' + KIT.map(function(k){
            return '<div class="x-kit-row" data-k="' + k[0] + '"><span>' + k[1] + '</span><button data-d="-1" aria-label="Previous ' + k[1] + '">◀</button><b></b><button data-d="1" aria-label="Next ' + k[1] + '"' + (k[0] === 'skin' ? ' data-first' : '') + '>▶</button></div>';
          }).join('') + '<button class="x-btn" data-a="done">' + (back ? 'SAVE KIT' : 'DONE') + '</button>' + (back ? '<button class="x-btn ghost" data-a="back">CANCEL</button>' : '') + '</div></div></div>');
      var por = $('.por', s), spr = $('.spr', s), t0 = performance.now(), raf2 = 0;
      function paint(){
        KIT.forEach(function(k){ $('[data-k="' + k[0] + '"] b', s).textContent = k[2][look[k[0]]]; });
        portraitDraw(por, look, gender, 5);
      }
      (function anim(now){
        if (!spr.isConnected) return;
        var g = spr.getContext('2d'), dirs = ['down','left','up','right'], d = dirs[Math.floor((now - t0) / 1400) % 4];
        g.clearRect(0, 0, 96, 96); g.imageSmoothingEnabled = false;
        ART.draw(g, withRc(ART.frame(gender === 'f' ? 'nasf' : 'carl', d, Math.floor(now / 180)), 'preview'), 48, 88, 5);
        raf2 = requestAnimationFrame(anim);
      })(t0);
      paint();
      s.addEventListener('click', function(e){
        var b = e.target.closest('button'); if (!b) return;
        if (b.dataset.a === 'done') { cancelAnimationFrame(raf2); sfx.click(); res(look); return; }
        if (b.dataset.a === 'back') { cancelAnimationFrame(raf2); back(); return; }
        var row = b.closest('[data-k]'); if (!row) return;
        var k = KIT.filter(function(x){ return x[0] === row.dataset.k; })[0], n = k[2].length;
        look[k[0]] = (look[k[0]] + (+b.dataset.d) + n) % n; sfx.key(); paint();
      });
    });
  }

  // ── dossier ──
  function dossier(){
    S.stage = 'dossier'; save();
    var hn = heroName(), sig = hero().first.charAt(0) + '. Nasaro';
    var s = screen('x-dossier',
      '<div class="x-paper">' +
        '<p class="x-stamp red">MOST SECRET</p>' +
        '<p class="x-mono">EXPERIMENTAL ROCKET PROGRAM · MISSION ORDERS · 1936</p>' +
        '<pre class="x-typed"></pre>' +
        '<p class="x-sign">PILOT-OBSERVER<b class="x-sig"></b></p>' +
        '<button class="x-btn" data-a="go" disabled>PROCEED TO LAUNCH</button>' +
      '</div>');
    var text = 'TO: ' + (hero().gender === 'f' ? 'MISS ' : 'MR. ') + hn + '\n\nYou are hereby assigned as Pilot-Observer aboard the experimental rocket vessel described in Annex A (withheld).\n\n' +
      'OBJECTIVE: Proceed beyond the atmosphere. Survey the planets of the Solar System. Return with scanned and written records.\n\n' +
      'ISSUED:\n· ASTRANAV navigation and survey unit, Mk. I (experimental)\n· Field journal\n· Specimen case\n' +
      '· Pressure suit with SUIT and AIR instruments\n· Signal flares (2)\n\n' +
      'The existence of this vessel is not to be disclosed.';
    var pre = $('.x-typed', s), go = $('[data-a="go"]', s);
    typeInto(pre, text, 12).then(function(){ return typeInto($('.x-sig', s), sig, 70); }).then(function(){ go.disabled = false; go.focus(); });
    go.addEventListener('click', function(){ sfx.click(); launch(); });
  }

  // ── launch & malfunction ──
  function launch(){
    S.stage = 'launch'; save();
    var s = screen('x-cockpit shake-soft',
      '<div class="x-panel riv">' +
        '<p class="x-plate">FLIGHT DECK</p>' +
        '<div class="x-dials">' + dial('ALTITUDE','alt') + dial('VELOCITY','vel') + dial('FUEL','fuel') + '</div>' +
        '<p class="x-readout" aria-live="polite">T-MINUS 3</p>' +
        '<button class="x-lever" hidden>PULL<br>EMERGENCY<br>LEVER</button>' +
      '</div>');
    var r = $('.x-readout', s);
    setNeedle(s, 'alt', 0); setNeedle(s, 'vel', 0); setNeedle(s, 'fuel', 1);
    (async function(){
      for (var i = 3; i > 0; i--) { r.textContent = 'T-MINUS ' + i; sfx.click(); await wait(700); }
      r.textContent = 'IGNITION'; s.classList.add('shake'); tone(60, 1.5, 'sawtooth', .06); vibrate(900, .9);
      setNeedle(s, 'alt', .7); setNeedle(s, 'vel', .8); setNeedle(s, 'fuel', .55);
      await wait(1800);
      s.classList.add('alarm');
      r.textContent = 'NAVIGATION FAILURE'; sfx.warn(); vibrate(200); await wait(1100);
      r.textContent = 'WIRELESS · NO SIGNAL'; setNeedle(s, 'alt', 1.1); setNeedle(s, 'vel', 1.25); await wait(1100);
      r.textContent = 'VELOCITY · OFF SCALE'; sfx.warn(); vibrate(300);
      s.classList.remove('shake', 'shake-soft');
      var lever = $('.x-lever', s); lever.hidden = false; lever.focus();
      lever.addEventListener('click', function(){ sfx.click(); hyperspace(); }, { once:true });
    })();
  }
  function dial(label, id){
    return '<div class="x-dial" data-d="' + id + '"><svg viewBox="0 0 100 64" aria-hidden="true">' +
      '<path d="M10 58 A40 40 0 0 1 90 58" class="x-arc"/><path d="M74 26 A40 40 0 0 1 90 58" class="x-arc red"/>' +
      '<line x1="50" y1="58" x2="50" y2="24" class="x-needle"/><circle cx="50" cy="58" r="4"/></svg><span>' + label + '</span></div>';
  }
  function setNeedle(root, id, v){
    var n = root.querySelector('[data-d="' + id + '"] .x-needle');
    if (n) n.style.transform = 'rotate(' + (-80 + clamp(v, 0, 1.3) * 160) + 'deg)';
  }

  function hyperspace(){
    var s = screen('x-hyper', '<p class="x-hyper-t"></p>');
    startWorld('hyper'); vibrate(1200, .5);
    (async function(){
      await wait(2600);
      s.classList.add('white'); await wait(700);
      stopWorld(); s.classList.remove('white'); s.classList.add('black');
      var t = $('.x-hyper-t', s);
      await typeInto(t, 'Silence.\n\nThe instruments are dead. The stars outside are wrong.\n\nSomething below is pulling the ship down.', 30);
      await wait(1100);
      crash();
    })();
  }

  // ═════════════════════════ THE ASTRANAV ═════════════════════════
  // Early American tech, issued to the pilot-observer on the first mission: a
  // navigation, survey and scanning unit in cream enamel and chrome with a green
  // phosphor screen. It is the whole interface, in seven sections: SYSTEM (home),
  // HEADQUARTERS, NAVIGATION (the star map), COMPANIONS, RESEARCH, JOURNAL and SETUP.
  //
  //   S.stage 'nav'      aboard the ship (S.landed: on the ground at S.at, or in orbit; S.at null: deep space)
  //   S.stage 'surface'  on foot, the AstraNav in hand
  // the seven sections, in order: 1 SYSTEM (home) · 2 HEADQUARTERS · 3 NAVIGATION · 4 COMPANIONS · 5 RESEARCH · 6 JOURNAL · 7 SETUP
  var NAV_TABS = [['system', 'SYSTEM'], ['hq', 'HEADQUARTERS'], ['stars', 'NAVIGATION'], ['companions', 'COMPANIONS'], ['research', 'RESEARCH'], ['journal', 'JOURNAL'], ['setup', 'SETUP']];
  var navTab = 'system';
  function onFoot(){ return S.stage === 'surface'; }
  function whereLine(){
    if (onFoot() && M) return 'ON FOOT · ' + zoneName() + (M.world === 9 ? ' · ' + term(WORLD[9].term) : '');
    if (S.at && S.landed) return 'ABOARD · LANDED ON ' + placeName(S.at);
    if (S.at) return 'ABOARD · IN ORBIT · ' + placeName(S.at);
    return 'ABOARD · DEEP SPACE · ' + term('expanse');
  }
  // climbing aboard repairs the suit and rests the Aethren party. AIR refills only at NASARUS.
  function aboard(){
    S.stage = 'nav'; S.suit = 100; S.flares = Math.max(S.flares, flaresMax()); healTeam();
    if (S.at === 'nasarus') refillAir();         // the ship carries no oxygen of its own: only the base refills it
    save();
  }
  function ship(){ if (S.stage !== 'nav') aboard(); nav('system'); }
  function nav(tab, sel){
    navTab = tab || navTab || 'system';
    navTab = { field:'system', cards:'companions', codex:'research', log:'journal' }[navTab] || navTab;   // old section names
    var tabs = NAV_TABS;
    var s = screen('x-nav',
      '<div class="x-nav-dev">' +
        '<header class="x-nav-top"><b class="x-nav-logo">ASTRANAV</b><span class="x-nav-mk">MK.I · U.S. EXPERIMENTAL ROCKET PROGRAM · 1936</span>' +
          '<span class="x-nav-where">' + esc(whereLine()) + '</span></header>' +
        '<nav class="x-nav-tabs" aria-label="AstraNav">' + tabs.map(function(t){
          return '<button data-tab="' + t[0] + '" class="' + (t[0] === navTab ? 'on' : '') + (t[0] === 'hq' ? ' x-tab-hq' : '') + '"' + (t[0] === navTab ? ' aria-current="page"' : '') + '><i class="x-tab-n">' + (NAV_TABS.indexOf(t) + 1) + '</i>' + esc(t[1]) + '</button>';
        }).join('') + (onFoot() ? '<button data-tab="close" class="x-nav-close">◀ FIELD</button>' : '') + '</nav>' +
        '<div class="x-nav-screen x-nav-' + navTab + '"></div>' +
      '</div>');
    var body = $('.x-nav-screen', s);
    s.addEventListener('click', function(e){
      var t = e.target.closest('[data-tab]'); if (!t) return;
      sfx.click();
      if (t.dataset.tab === 'close') { backToField(); return; }
      nav(t.dataset.tab);
      setTimeout(function(){ var b = $('[data-tab="' + navTab + '"]'); if (b && padOn) b.focus(); }, 20);
    });
    ({ system:navHome, hq:navHQ, stars:navSystem, companions:navCompanions, research:navResearch, journal:navJournal, setup:navSetup })[navTab](body, sel);
    return s;
  }
  function backToField(){ if (S.pos && S.pos.map) { S.stage = 'surface'; surface(S.pos.map); } else nav('system'); }
  function navCycle(d){
    var tabs = $$('.x-nav-tabs [data-tab]').filter(function(b){ return b.dataset.tab !== 'close'; }).map(function(b){ return b.dataset.tab; });
    var i = tabs.indexOf(navTab); if (i < 0) return;
    sfx.click(); nav(tabs[(i + d + tabs.length) % tabs.length]);
    setTimeout(function(){ var b = $('[data-tab="' + navTab + '"]'); if (b && padOn) b.focus(); }, 20);
  }

  // ── SYSTEM · the bodies through the AstraNav telescope ──
  // The layout is RP7D's telescope (rp7d/developer/astragraphy.js): each world on its zone's spire,
  // zone = (n − 1) mod 4 → ALPHA north · OMEGA east · TRINITY south · DICHOTOMY west, at radius
  // 22 + 8 × ring, fanned off the spire by a per-ring angle so the worlds read apart; AEP-28 on its own
  // tilted drift orbit; all seen at RP7D's camera pitch. NASARUS, the headquarters, is not part of
  // RP7D's chart: its place here is provisional, and it is kept apart from AEP-28.
  var K = 4.6, PITCH = .98, TILT = Math.sin(PITCH), LIFT = Math.cos(PITCH);
  var FAN = [-28, 17, -15, 29, -31, 13, 25], RING_R = function(n){ return 22 + n * 8; };
  var ZONES = [['ALPHA', 'I', 0, '#e9b84a'], ['OMEGA', 'IV', 90, '#e2463c'], ['TRINITY', 'III', 180, '#3fd08a'], ['DICHOTOMY', 'II', 270, '#a45cf0']];
  var ORBIT = { cx:-6, cz:-4, a:102, b:72, yaw:.62, tilt:.2, at:5.62 };
  function flat(deg, r, y){ var a = deg * Math.PI / 180; return { x:Math.sin(a) * r * K, y:-Math.cos(a) * r * K, h:(y || 0) * K }; }
  function driftAt(t){
    var x = Math.cos(t) * ORBIT.a, z = Math.sin(t) * ORBIT.b;
    var y2 = -z * Math.sin(ORBIT.tilt), z2 = z * Math.cos(ORBIT.tilt);
    var x3 = x * Math.cos(ORBIT.yaw) + z2 * Math.sin(ORBIT.yaw), z3 = -x * Math.sin(ORBIT.yaw) + z2 * Math.cos(ORBIT.yaw);
    return { x:(x3 + ORBIT.cx) * K, y:(z3 + ORBIT.cz) * K, h:y2 * K };
  }
  var POS = (function(){
    var out = {};
    for (var n = 1; n <= 27; n++) { var ring = Math.ceil(n / 4); out[n] = flat(ZONES[(n - 1) % 4][2] + FAN[ring - 1], RING_R(ring)); }
    out[28] = driftAt(ORBIT.at);
    out.aenor = { x:0, y:0, h:0 }; out.zoryth = flat(48, 13, 1);
    out.nasarus = flat(214, RING_R(7) + 18, 4);
    return out;
  })();
  function proj(p){ return { x:p.x, y:p.y * TILT - p.h * LIFT, k:1 + p.y / 1400 }; }
  function bodies(){
    var list = D.worlds.map(function(w){ return { kind:'world', w:w, id:'w' + w.no, p:POS[w.no], set:w.no }; });
    list.push({ kind:'aenor', id:'aenor', p:POS.aenor, set:29 }, { kind:'zoryth', id:'zoryth', p:POS.zoryth, set:30 }, { kind:'hq', id:'nasarus', p:POS.nasarus });
    return list;
  }
  function bodyStatus(b){
    if (b.kind === 'hq') return 'hq';
    if (b.kind !== 'world') return known(b.kind) ? 'identified' : 'unidentified';
    if (b.w.hidden) return 'sealed';
    return S.visited[b.w.no] ? 'visited' : known(b.w.term) ? 'identified' : 'unidentified';
  }
  function hopDist(to){ var a = S.at ? POS[S.at] : flat(30, 95), b = POS[to]; return Math.hypot(a.x - b.x, a.y - b.y); }
  function au(to){ return (hopDist(to) / (8 * K) * 1.4).toFixed(1); }
  function spiralSvg(){
    var defs = '<defs>' +
      '<radialGradient id="core"><stop offset="0" stop-color="#fffdf0"/><stop offset=".12" stop-color="#ffe7a0"/><stop offset=".35" stop-color="#f0a850" stop-opacity=".45"/><stop offset="1" stop-color="#5b3c8c" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="neb"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="orbUnk" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#6a6878"/><stop offset=".6" stop-color="#2a2832"/><stop offset="1" stop-color="#0c0b10"/></radialGradient>' +
      '<radialGradient id="orbHQ" cx="34%" cy="30%" r="72%"><stop offset="0" stop-color="#e8e0cc"/><stop offset=".4" stop-color="#8a8272"/><stop offset="1" stop-color="#1e1c18"/></radialGradient>' +
      '<filter id="blur8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>' +
      '<filter id="blur3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>';
    D.worlds.forEach(function(w){
      defs += '<radialGradient id="orb' + w.no + '" cx="34%" cy="30%" r="72%"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset=".2" stop-color="' + w.color + '"/><stop offset=".78" stop-color="' + w.color + '"/><stop offset="1" stop-color="#05040a"/></radialGradient>';
    });
    defs += '<radialGradient id="orbZ" cx="34%" cy="30%" r="72%"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="#d8d0e2"/><stop offset="1" stop-color="#3a3444"/></radialGradient></defs>';
    var svg = '<svg class="x-spiral" viewBox="-560 -400 1120 800" role="group" aria-label="The Aethryx Expanse through the AstraNav telescope">' + defs;
    var r0 = rng(28);
    for (var i = 0; i < 300; i++) svg += '<circle cx="' + ((r0() - .5) * 1700).toFixed(0) + '" cy="' + ((r0() - .5) * 1200).toFixed(0) + '" r="' + (r0() < .08 ? 1.6 : .8) + '" class="x-st" style="opacity:' + (.25 + r0() * .6).toFixed(2) + '"/>';
    // the nebula glows of RP7D's Expanse
    [[-380, -420, '#5a2ab0', 330, .28], [420, -300, '#2a4ab8', 300, .22], [300, 380, '#b0502a', 270, .16], [-420, 300, '#2a8a6a', 250, .14], [0, -80, '#c88a2a', 220, .2]].forEach(function(n){
      var q = proj({ x:n[0], y:n[1], h:0 });
      svg += '<ellipse cx="' + q.x.toFixed(0) + '" cy="' + q.y.toFixed(0) + '" rx="' + n[3] + '" ry="' + (n[3] * TILT).toFixed(0) + '" fill="url(#neb)" style="opacity:' + n[4] + ';fill:' + n[2] + '" filter="url(#blur8)"/>';
    });
    svg += '<ellipse cx="0" cy="0" rx="150" ry="' + (150 * TILT).toFixed(0) + '" fill="url(#core)"/>';
    // the four zones: spires and labels
    ZONES.forEach(function(z){
      var a = proj(flat(z[2], 8)), b = proj(flat(z[2], RING_R(7) + 6)), l = proj(flat(z[2], RING_R(7) + 13));
      svg += '<line x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) + '" x2="' + b.x.toFixed(1) + '" y2="' + b.y.toFixed(1) + '" stroke="' + z[3] + '" class="x-zspire"/>';
      svg += '<text x="' + l.x.toFixed(1) + '" y="' + l.y.toFixed(1) + '" fill="' + z[3] + '" class="x-zone-l">' + z[1] + ' · ' + z[0] + ' ZONE</text>';
    });
    for (var ring = 1; ring <= 7; ring++) { var R = RING_R(ring) * K; svg += '<ellipse cx="0" cy="0" rx="' + R.toFixed(1) + '" ry="' + (R * TILT).toFixed(1) + '" class="x-orbit"/>'; }
    // the drift world's own path: broken, tilted, crossing every zone
    var dp = []; for (var t = 0; t <= 120; t++) { var q2 = proj(driftAt(t / 120 * 6.2832)); dp.push(q2.x.toFixed(1) + ',' + q2.y.toFixed(1)); }
    svg += '<polyline points="' + dp.join(' ') + '" class="x-drift3"/>';
    bodies().sort(function(a, b){ return a.p.y - b.p.y; }).forEach(function(b){
      var st = bodyStatus(b), lit = st === 'visited' || st === 'identified' || st === 'hq', q = proj(b.p);
      var base = b.kind === 'aenor' ? 24 : b.kind === 'zoryth' ? 5 : b.kind === 'hq' ? 10 : (b.w.no === 9 || b.w.no === 27 ? 13 : 9.5), rr = base * q.k;
      var here = (b.w && b.w.no === S.at) || (b.kind === 'hq' && S.at === 'nasarus');
      var label0 = b.kind === 'aenor' ? term('aenor') : b.kind === 'zoryth' ? term('zoryth') : b.kind === 'hq' ? hqName() + ', headquarters' : b.w.hidden ? 'Sealed body' : term(b.w.term);
      svg += '<g class="x-bd ' + st + (here ? ' here' : '') + '" data-id="' + b.id + '" data-nav tabindex="0" role="button" aria-label="' + esc(label0) + '" transform="translate(' + q.x.toFixed(1) + ' ' + q.y.toFixed(1) + ')">';
      if (b.kind === 'aenor') {
        svg += '<circle r="60" fill="url(#core)" filter="url(#blur8)"/><circle r="' + rr + '" fill="#fffbe8" filter="url(#blur3)"/><circle r="' + (rr - 7) + '" fill="#fffef6"/>';
      } else {
        var fill = st === 'hq' ? 'url(#orbHQ)' : (st === 'sealed' || !lit) ? 'url(#orbUnk)' : b.kind === 'zoryth' ? 'url(#orbZ)' : 'url(#orb' + b.w.no + ')';
        if (lit && b.kind === 'world') svg += '<circle r="' + (rr + 6) + '" fill="' + b.w.color + '" opacity=".35" filter="url(#blur3)"/>';
        if (b.w && b.w.ringed && lit) svg += '<ellipse rx="' + (rr + 9) + '" ry="' + (3.5 + rr * .2).toFixed(1) + '" transform="rotate(-12)" class="x-pring back"/>';
        svg += '<circle r="' + rr.toFixed(1) + '" fill="' + fill + '" class="x-orb"/><circle r="' + rr.toFixed(1) + '" class="x-shade"/>';
        if (b.w && b.w.ringed && lit) svg += '<path d="M' + -(rr + 9) + ' 0 A' + (rr + 9) + ' ' + (3.5 + rr * .2).toFixed(1) + ' 0 0 0 ' + (rr + 9) + ' 0" transform="rotate(-12)" class="x-pring"/>';
        if (st === 'hq') svg += '<circle r="' + (rr + 5).toFixed(1) + '" class="x-hqring"/><circle r="' + (rr + 9).toFixed(1) + '" class="x-hqring2"/>';
        if (st === 'sealed') svg += '<text y="4" class="x-q">✕</text>'; else if (!lit) svg += '<text y="4" class="x-q">?</text>';
      }
      var label = b.kind === 'aenor' ? (known('aenor') ? 'AENOR' : '') : b.kind === 'zoryth' ? (known('zoryth') ? 'ZORYTH' : '') : b.kind === 'hq' ? hqName() + ' · HQ' :
        b.w.hidden ? 'AEP-28 · SEALED' : (known(b.w.term) ? b.w.no + ' · ' + b.w.name : 'No. ' + b.w.no);
      if (label) svg += '<g class="x-tag" transform="translate(0 ' + (rr + 12).toFixed(1) + ')"><rect x="' + (-label.length * 3.9 - 6) + '" y="-9" width="' + (label.length * 7.8 + 12) + '" height="15" rx="3"/><text y="2.5">' + esc(label) + '</text></g>';
      if (here) svg += '<g class="x-vessel" transform="translate(0 ' + (-rr - 13).toFixed(1) + ')"><path d="M0 8 L-5 -2 L5 -2 Z"/><text y="-7">' + (S.landed ? 'SHIP' : 'ORBIT') + '</text></g>';
      svg += '</g>';
    });
    if (!S.at) { var v0 = proj(flat(30, 95)); svg += '<g class="x-vessel" transform="translate(' + v0.x.toFixed(1) + ' ' + v0.y.toFixed(1) + ')"><circle r="7" class="x-vring"/><path d="M-4 -4 L4 4 M4 -4 L-4 4"/><text y="-12">YOU ARE HERE</text></g>'; }
    return svg + '</svg>';
  }
  var VIEW = { x:0, y:0, w:1120 };
  function setView(svg){ var h = VIEW.w * 800 / 1120; svg.setAttribute('viewBox', (VIEW.x - VIEW.w / 2).toFixed(1) + ' ' + (VIEW.y - h / 2).toFixed(1) + ' ' + VIEW.w.toFixed(1) + ' ' + h.toFixed(1)); }
  function navSystem(body, sel){
    body.innerHTML = '<div class="x-scope">' + spiralSvg() + '<div class="x-scope-ui"><button data-z="1" aria-label="Zoom in">+</button><button data-z="-1" aria-label="Zoom out">−</button><button data-z="0" aria-label="Whole system">◎</button></div>' +
      '<p class="x-scope-k">' + (known('expanse') ? 'THE AETHRYX EXPANSE' : 'AN UNCHARTED SYSTEM') + ' · ' + mapPct() + '% CHARTED</p></div>' +
      '<aside class="x-sheet2" hidden></aside>';
    var svg = $('svg', body), sheet = $('.x-sheet2', body);
    setView(svg);
    // drag to pan, wheel or pinch to zoom
    var pts = {}, startV = null, pinch0 = 0;
    svg.addEventListener('pointerdown', function(e){ pts[e.pointerId] = { x:e.clientX, y:e.clientY }; startV = { x:VIEW.x, y:VIEW.y, w:VIEW.w, cx:e.clientX, cy:e.clientY, moved:false };
      var k = Object.keys(pts); if (k.length === 2) pinch0 = Math.hypot(pts[k[0]].x - pts[k[1]].x, pts[k[0]].y - pts[k[1]].y); });
    svg.addEventListener('pointermove', function(e){
      if (!pts[e.pointerId] || !startV) return;
      pts[e.pointerId] = { x:e.clientX, y:e.clientY };
      var k = Object.keys(pts), r = svg.getBoundingClientRect(), sc = VIEW.w / r.width;
      if (k.length === 2 && pinch0) { var d = Math.hypot(pts[k[0]].x - pts[k[1]].x, pts[k[0]].y - pts[k[1]].y); VIEW.w = clamp(startV.w * pinch0 / d, 320, 1500); startV.moved = true; }
      else { var dx = e.clientX - startV.cx, dy = e.clientY - startV.cy; if (Math.abs(dx) + Math.abs(dy) > 6) startV.moved = true; VIEW.x = clamp(startV.x - dx * sc, -560, 560); VIEW.y = clamp(startV.y - dy * sc, -400, 400); }
      setView(svg);
    });
    function up(e){ delete pts[e.pointerId]; if (!Object.keys(pts).length) setTimeout(function(){ startV = null; }, 0); }
    svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
    svg.addEventListener('wheel', function(e){ e.preventDefault(); VIEW.w = clamp(VIEW.w * (e.deltaY > 0 ? 1.12 : .89), 320, 1500); setView(svg); }, { passive:false });
    svg.addEventListener('click', function(e){
      if (startV && startV.moved) return;
      var g = e.target.closest && e.target.closest('.x-bd'); if (!g) return;
      var b = bodies().filter(function(x){ return x.id === g.dataset.id; })[0]; if (b) { sfx.click(); openSheet(b, sheet); }
    });
    svg.addEventListener('keydown', function(e){ if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.x-bd')) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles:true })); } });
    $('.x-scope-ui', body).addEventListener('click', function(e){
      var z = e.target.closest('[data-z]'); if (!z) return;
      if (z.dataset.z === '0') { VIEW = { x:0, y:0, w:1120 }; } else VIEW.w = clamp(VIEW.w * (z.dataset.z === '1' ? .75 : 1.33), 320, 1500);
      setView(svg);
    });
    var id = sel || (S.at === 'nasarus' ? 'nasarus' : S.at ? 'w' + S.at : null);
    if (id) { var b0 = bodies().filter(function(x){ return x.id === id; })[0]; if (b0) { openSheet(b0, sheet); var g0 = $('.x-bd[data-id="' + id + '"]', body); if (g0 && padOn) g0.focus(); } }
  }
  function scope(no){ var e = envOf(no); return e && !e.spoiler ? e.telescope || '' : ''; }
  function fauna(no){ var lo = GEN.levelFor(no, 0), hi = no === 9 ? GEN.levelFor(9, 9) + 3 : lo + 3; return 'LV ' + lo + '–' + hi; }
  function openSheet(b, sh){
    sh = sh || $('.x-sheet2'); if (!sh) return;
    $$('.x-bd').forEach(function(g){ g.classList.toggle('sel', g.dataset.id === b.id); });
    var html;
    if (b.kind === 'aenor' || b.kind === 'zoryth') {
      var kn = known(b.kind), got = !!S.cards[b.kind];
      html = '<p class="x-sh-k">' + esc(setName(b.set)) + '</p><h3>' + esc(term(b.kind)) + '</h3>' +
        '<dl><dt>STATUS</dt><dd>' + (got ? 'SCANNED' : 'IN VIEW') + '</dd><dt>CARDS</dt><dd>' + setCards(b.set) + ' / ???</dd></dl>' +
        '<p class="x-sh-note">' + (kn ? esc(subj(b.kind).canonNote) + ' ' : '') + 'Cannot be landed upon. The AstraNav can scan it from here.</p>' +
        '<div class="x-sh-btns">' + (got ? '' : '<button class="x-btn" data-a="scan">SCAN</button>') + '<button class="x-btn ghost" data-a="close">CLOSE</button></div>';
    } else if (b.kind === 'hq') {
      var hereH = S.at === 'nasarus', stg = hqStage(), actH;
      if (onFoot()) actH = hereH ? '<button class="x-btn" data-a="field">RETURN TO FIELD</button>' : '<p class="x-sh-note">Board your ship to set course.</p>' + (S.flares ? '<button class="x-btn" data-a="flare">RECALL FLARE · BOARD (' + S.flares + ')</button>' : '');
      else if (hereH) actH = '<button class="x-btn" data-a="landhq">' + (S.landed ? 'DISEMBARK' : 'LAND AT CAMP') + '</button>';
      else actH = navOnline() ? '<button class="x-btn" data-a="gohq">RETURN TO ' + esc(hqName()) + '</button>' : '<p class="x-sh-note">NAVIGATION OFFLINE.</p>';
      html = '<p class="x-sh-k">HEADQUARTERS</p><h3>' + esc(hqName()) + '</h3><p class="x-sh-sub">STAGE ' + stg + ' · ' + esc(stageName(stg)) + '</p>' +
        '<dl><dt>' + (hereH ? 'POSITION' : 'COURSE') + '</dt><dd>' + (hereH ? (S.landed ? 'LANDED HERE' : 'IN ORBIT') : au('nasarus') + ' A.U.') + '</dd>' +
          '<dt>PACK</dt><dd>' + packTotal() + ' materials to deposit</dd><dt>RUINS</dt><dd>' + Object.keys(S.hq.ruins).length + ' / ' + HQ.ruins.length + ' surveyed · ' + hqRestored() + ' restored</dd></dl>' +
        '<p class="x-sh-note">An ancient drifting world. Haemen and Aethren lived here before the First Eternal War. Return here to deposit, build and restore.</p>' +
        '<div class="x-sh-btns">' + actH + '<button class="x-btn ghost" data-a="hq">HQ PAGE</button><button class="x-btn ghost" data-a="close">CLOSE</button></div>';
    } else if (b.w.hidden) {
      html = '<p class="x-sh-k">CATALOGUE ENTRY · AEP-28</p><h3>THE DRIFT BODY</h3><p class="x-sh-sub">SEALED</p>' +
        '<p class="x-sh-note">A body outside the ordered cycle, on a tilted path that crosses every zone. The AstraNav will not plot a course to it.</p>' +
        '<div class="x-sh-btns"><button class="x-btn ghost" data-a="close">CLOSE</button></div>';
    } else {
      var w = b.w, no = w.no, kn2 = known(w.term), vis = S.visited[no], here = S.at === no, act;
      if (onFoot()) act = here ? '<button class="x-btn" data-a="field">RETURN TO FIELD</button>' :
        '<p class="x-sh-note">Board your ship to set course.</p>' + (S.flares ? '<button class="x-btn" data-a="flare">RECALL FLARE · BOARD (' + S.flares + ')</button>' : '');
      else if (here) act = '<button class="x-btn" data-a="land">' + (S.landed ? 'DISEMBARK' : vis ? 'LAND' : 'ATTEMPT LANDING') + '</button>';
      else act = navOnline() ? '<button class="x-btn" data-a="go">SET COURSE</button>' : '<p class="x-sh-note">NAVIGATION OFFLINE · repair the drive and build the Navigation Center on ' + esc(hqName()) + '.</p>';
      html = '<p class="x-sh-k">' + (kn2 || vis ? esc(setName(no)) : 'CATALOGUE ENTRY') + '</p><h3>' + esc(term(w.term)) + '</h3>' + (kn2 && w.title ? '<p class="x-sh-sub">' + esc(w.title.toUpperCase()) + '</p>' : '') +
        '<dl><dt>' + (here ? 'POSITION' : 'COURSE') + '</dt><dd>' + (here ? (S.landed ? 'LANDED HERE' : 'IN ORBIT') : au(no) + ' A.U.') + '</dd>' +
          '<dt>STATUS</dt><dd>' + (vis ? 'VISITED' : kn2 ? 'NAMED' : 'UNVISITED') + '</dd><dt>SURVEY</dt><dd>' + setPct(no) + '%</dd><dt>CARDS</dt><dd>' + setCards(no) + ' / ???</dd>' +
          '<dt>FAUNA SIGNALS</dt><dd>' + fauna(no) + '</dd>' +
          (vis && no <= WORLDS_ALL ? '<dt>VAULT</dt><dd>' + esc(sysOf(no).part) + ' · ' + vaultState(no) + '</dd>' : '') +
          (scope(no) && !vis ? '<dt>TELESCOPE</dt><dd>' + esc(scope(no)) + '</dd>' : '') + '</dl>' +
        '<div class="x-sh-btns">' + act + '<button class="x-btn ghost" data-a="close">CLOSE</button></div>';
    }
    sh.innerHTML = '<div class="x-plq x-sheet-in">' + html + '</div>';
    sh.hidden = false;
    sh.onclick = function(e){
      var a = e.target.closest('[data-a]'); if (!a) return;
      sfx.click();
      if (a.dataset.a === 'close') { sh.hidden = true; $$('.x-bd').forEach(function(g){ g.classList.remove('sel'); }); var g1 = $('.x-bd[data-id="' + b.id + '"]'); if (g1 && padOn) g1.focus(); }
      if (a.dataset.a === 'scan') scanCelestial(b.kind);
      if (a.dataset.a === 'go') travel(b.w.no);
      if (a.dataset.a === 'land') { if (S.landed) disembark(); else land(b.w.no); }
      if (a.dataset.a === 'field') backToField();
      if (a.dataset.a === 'flare') fireFlare();
      if (a.dataset.a === 'gohq') travel('nasarus');
      if (a.dataset.a === 'landhq') { if (S.landed) disembark(); else land('nasarus'); }
      if (a.dataset.a === 'hq') nav('hq');
    };
    if (padOn) setTimeout(function(){ var f = sh.querySelector('.x-btn:not(.ghost)') || sh.querySelector('.x-btn'); if (f) f.focus(); }, 30);
  }
  async function scanCelestial(id){
    var o = el('div', 'x-modal x-scanning', '<div class="x-modal-in"><p class="x-man-k">ASTRANAV · LOCKING ON</p><div class="x-scanbar"><i></i></div></div>');
    ui.appendChild(o); vibrate(300, .3); sfx.shutter();
    await wait(1200); o.remove();
    S.flags[id === 'aenor' ? 'shotAenor' : 'shotZoryth'] = true;
    var first = manifest(id, null, true); S.notes[id] = 1; save();
    await cardReveal(id, first, 'SCANNED INTO THE ASTRANAV · CARD ACQUIRED');
    nav('stars', id);
  }
  function fireFlare(){
    if (!S.flares) { toast('NO FLARES LEFT · walk back to the ship', 'red'); return; }
    S.flares--; if (M && fogArr) S.fog[M.id] = fogEnc(fogArr);
    if (M && M.ship) S.pos = { map:M.hq ? 'nasarus' : M.world ? 'w' + M.world : M.id, x:M.ship.x, y:M.ship.y + 1, dir:'down' };
    aboard(); toast('RECALL FLARE · the ship homed in on you'); nav('stars');
  }

  // ── the drive ──
  function travel(no){
    if (!navOnline()) { toast('NAVIGATION OFFLINE', 'red'); return; }
    if (S.core && S.core.enabled && no !== 'nasarus') {
      var fuel = coreOilCost(no);
      if (!coreReady() || S.core.oil < fuel) { toast('INSUFFICIENT OIL · produce fuel at NASARUS before departure', 'red'); return; }
      S.core.oil -= fuel; hqRecord('Spent ' + fuel + ' OIL on the course to ' + placeName(no) + '.'); save();
      if (coreHomeDistance(no) > coreNavRadius() * 70) toast('ASTRONAV INTERFERENCE · out-of-range course · OIL ' + fuel, 'red');
    }
    var from = placeName(S.at), d = hopDist(no);
    if (no !== 'nasarus' && airPct() < 40) toast('AIR ' + Math.round(airPct()) + '% · there is no oxygen out there. Refill at ' + hqName() + ' first.', 'red');
    var s = screen('x-hyper', '<p class="x-hyper-t x-travel"></p>');
    startWorld('hyper'); vibrate(700, .4);
    S.stage = 'nav'; S.landed = false; S.pos = null; save();
    (async function(){
      await typeInto($('.x-hyper-t', s), 'COURSE SET\n' + from + ' → ' + placeName(no), 18);
      await wait(700 + Math.min(1600, d * 1.4));
      stopWorld();
      S.at = no; save();
      toast('IN ORBIT · ' + placeName(no));
      nav('stars', no === 'nasarus' ? 'nasarus' : 'w' + no);
    })();
  }
  function land(no){
    if (no === 'nasarus') return touchdown('nasarus');
    if (WORLD[no].hidden || !envOf(no)) { toast('The AstraNav will not plot a landing.', 'red'); return; }
    if (!S.visited[no]) return descent(no);
    touchdown(no);
  }
  function touchdown(no){
    S.visited[no] = S.visited[no] || Date.now();
    S.at = no; S.landed = true;
    var m = no === 'nasarus' ? buildMap('nasarus') : GEN.build('w' + no);
    if (no === 'nasarus') { S.pos = { map:'nasarus', x:m.ship.x + 2, y:m.ship.y + 1, dir:'down' }; S.stage = 'surface';
      if (S.hq.built.camp && S.air < airMax()) { refillAir(); setTimeout(function(){ toast('OXYGEN · the tank refilled from the base · AIR ' + airMax()); }, 300); }
      save();
      if (S.hq.built.depot && (packTotal() || packParts() || pendingCards())) setTimeout(function(){ deposit(); }, 600);
      else if ((packParts() || pendingCards()) && S.hq.built.stores) setTimeout(function(){ deposit(); }, 600);
      else if (packTotal()) setTimeout(function(){ toast('PACK · ' + packTotal() + ' materials · deposit them at the camp stores'); }, 600);
      surface('nasarus'); return; }
    S.pos = { map:m.id, x:m.ship.x, y:m.ship.y + 1, dir:'down' }; save();
    surface(m.id);
    if (!S.flags.airRule) { S.flags.airRule = 1; save(); setTimeout(function(){ if (mode === 'surface' && !dlg) say(['The air here cannot be breathed. Everything you breathe is in the tank on your back.',
      'Only ' + hqName() + ' holds oxygen. The ship carries none of its own: watch the AIR gauge, and turn for home before it runs low.',
      'If the tank runs dry out here, you will not come back. Sprinting burns air twice as fast.']); }, 1400); }
  }
  function disembark(){ if (S.pos && S.pos.map) surface(S.pos.map); else touchdown(S.at); }
  function descent(no){
    var s = screen('x-cockpit shake', '<div class="x-panel riv"><p class="x-plate">DESCENT · ' + esc(term(WORLD[no].term)) + '</p><p class="x-alt">ALT <b>0420000</b> FT</p><p class="x-readout">HULL TEMPERATURE RISING</p></div>');
    tone(55, 3, 'sawtooth', .05); vibrate(1600, .5);
    var b = $('.x-alt b', s), t0 = performance.now();
    (function tick(now){
      var k = Math.min(1, (now - t0) / (reduced ? 200 : 3200));
      b.textContent = String(Math.round(420000 * Math.pow(1 - k, 2))).padStart(7, '0');
      if (k < 1) requestAnimationFrame(tick);
      else {
        $('.x-readout', s).textContent = 'TOUCHDOWN';
        s.classList.remove('shake'); sfx.click(); vibrate(250, 1);
        setTimeout(function(){ touchdown(no); setTimeout(function(){ toast('TOUCHDOWN · ' + term(WORLD[no].term) + ' · AIR ' + Math.round(airPct()) + '% · only ' + hqName() + ' can refill it', airPct() < 50 ? 'red' : undefined); }, 300); }, reduced ? 50 : 900);
      }
    })(t0);
  }

  // ── FIELD · the sketch of where you stand ──
  // ── 1 · SYSTEM · the home panel: every section as a widget ──
  function navHome(body){
    var landed = onFoot() || (S.landed && S.pos), team = (S.team || []).filter(function(k){ return S.cards[k]; }), lp = leadPerk();
    var next = objectives().filter(function(o){ return !o.done && !o.main; })[0];
    var visited = D.worlds.filter(function(w){ return S.visited[w.no]; }).length, pend = pendingCards();
    function w(tab, title, inner, cls){ return '<button class="x-wd' + (cls ? ' ' + cls : '') + '" data-go="' + tab + '"><h4><i>' + (NAV_TABS.map(function(t){ return t[0]; }).indexOf(tab) + 1) + '</i>' + title + '</h4>' + inner + '</button>'; }
    body.innerHTML = '<div class="x-home">' +
      '<section class="x-wd x-wd-status riv"><h4>STATUS</h4><p class="x-crt">' + esc(whereLine()) + '</p>' +
        '<div class="x-meters">' + meter('SUIT', S.suit, 100) + meter('AIR', S.air, airMax()) + '</div>' +
        '<p class="x-mono light">FLARES ' + S.flares + '/' + flaresMax() + ' · PACK ' + (packTotal() + packParts() + pend) + (packParts() ? ' · ' + packParts() + ' SHIP PART' + (packParts() > 1 ? 'S' : '') : '') + '</p>' +
        '<div class="x-sh-btns">' + (onFoot() ? '<button class="x-btn" data-a="field">RETURN TO FIELD</button><button class="x-btn ghost" data-a="flare">RECALL FLARE (' + S.flares + ')</button>' :
          landed ? '<button class="x-btn" data-a="out">DISEMBARK</button>' : '<button class="x-btn" data-go="stars">SET A COURSE</button>') + '</div></section>' +
      ((landed || S.at) ? '<section class="x-wd x-wd-sketch riv"><h4>LIVE SCANNER · ' + esc(placeName(S.at || (M && M.world))) + ' <b class="x-scanner-clock"></b></h4><canvas class="x-live-scanner" width="640" height="400" aria-label="Live scanner of the current world"></canvas></section>' : '') +
      w('hq', 'HEADQUARTERS', '<p class="x-crt">' + esc(hqName()) + ' · STAGE ' + hqStage() + '</p><p class="x-mono light">' + esc(stageName(hqStage())) + ' · SHIP ' + shipPct() + '% · ' + Object.keys(S.hq.residents).length + ' groups · ' + Object.keys(S.hq.settled).length + ' species</p><i class="x-shipbar"><i style="width:' + shipPct() + '%"></i></i>') +
      w('stars', 'NAVIGATION', '<p class="x-crt">' + (navOnline() ? 'DRIVE ONLINE' : 'NAVIGATION OFFLINE') + '</p><p class="x-mono light">' + visited + ' / 27 worlds visited · ' + Object.keys(S.hq.installed).length + ' parts home</p>') +
      w('companions', 'COMPANIONS', team.length ? '<div class="x-wd-team">' + team.map(function(id){ return '<img class="x-pix" alt="" src="' + ART.url(subjArt(id), 2) + '" title="' + esc(subjName(id)) + '">'; }).join('') + '</div><p class="x-mono light">' + (lp ? 'LEAD PERK · ' + esc(lp.name) : 'PARTY READY') + '</p>' : '<p class="x-mono light">Scan an Aethren, bring the profile home, and clone it to deploy it.' + (profileIds().length ? ' ' + profileIds().length + ' profile(s) waiting.' : '') + '</p>') +
      w('research', 'RESEARCH', '<p class="x-crt">' + researchCount() + ' records · ' + Object.keys(S.hq.store).reduce(function(n, k){ return n + (S.hq.store[k] || 0); }, 0) + ' in stores</p><p class="x-mono light">' + (packTotal() + packParts() + pend ? (packTotal() + packParts() + pend) + ' unredeemed in the pack · bring them home' : 'Nothing waiting in the pack') + '</p>') +
      w('journal', 'JOURNAL', '<p class="x-crt">MISSION</p><p class="x-mono light">' + esc(next ? next.t : 'Every mission in the log is done.') + '</p>') +
      w('setup', 'SETUP', '<p class="x-mono light">' + (PAD && PAD.connected() ? (PAD.dualsense() ? 'DUALSENSE CONNECTED' : 'CONTROLLER CONNECTED') : 'Sound, controls, text, controller') + '</p>', 'x-wd-small') +
      '</div>';
    if (landed) navSketchReady();
    var scanner = $('.x-live-scanner', body);
    if (scanner) liveScannerReady(scanner, $('.x-scanner-clock', body));
    body.onclick = function(e){
      var a = e.target.closest('[data-a]');
      if (a) { if (a.dataset.a === 'field') backToField(); if (a.dataset.a === 'flare') fireFlare(); if (a.dataset.a === 'out') disembark(); return; }
      var g = e.target.closest('[data-go]'); if (g) { sfx.click(); nav(g.dataset.go); }
    };
  }
  function meter(label, v, max){ var k = clamp(v / max, 0, 1); return '<div class="x-meter' + (k < .25 ? ' low' : '') + '"><span>' + label + '</span><i><i style="width:' + Math.round(k * 100) + '%"></i></i><b>' + Math.round(v) + '/' + max + '</b></div>'; }
  function navSketchReady(){
    if (!M || (S.pos && M.id !== S.pos.map)) { var m0 = S.pos && buildMap(S.pos.map); if (m0) { M = m0; fogArr = fogDec(S.fog[M.id], M.W * M.H); if (!P) P = { x:S.pos.x, y:S.pos.y }; } }
  }
  function liveScannerReady(cnv, clock){
    // on foot: the map you stand on; aboard: where the ship is (worlds are built as 'w' + number)
    var mapId = onFoot() && M ? M.id : (S.pos && S.pos.map) || (S.at === 'nasarus' ? 'nasarus' : S.at ? 'w' + S.at : null);
    if (!mapId) return;
    var scanMap = M && M.id === mapId ? M : buildMap(mapId);
    if (!scanMap) return;
    function draw(){
      if (!cnv.isConnected) { clearInterval(timer); return; }
      var g = cnv.getContext('2d'), s2 = Math.min(cnv.width / scanMap.W, cnv.height / scanMap.H), now = performance.now();
      g.fillStyle = '#04110a'; g.fillRect(0, 0, cnv.width, cnv.height);
      for (var y = 0; y < scanMap.H; y++) for (var x = 0; x < scanMap.W; x++) {
        var ch = scanMap.at(x, y);
        g.fillStyle = ch === '#' ? '#0f3a20' : ch === '~' ? '#203e64' : ch === 'X' ? '#5a4a20' : ch === 'd' ? '#123d24' : ch === 'w' ? '#3a5a44' : ch === 'A' ? '#3a6ad6' : ch === 'S' ? '#e8f4ea' : '#0a2414';
        g.fillRect(x * s2, y * s2, s2 - .5, s2 - .5);
      }
      (scanMap.structs || []).forEach(function(st){
        var rs = st.kind === 'ruin' && S.hq.ruins[st.id];
        g.fillStyle = st.kind === 'fac' ? '#7cf08a' : st.kind === 'plot' ? '#3d6a48' : rs && rs.restored ? '#6fd0c0' : rs ? '#ffb347' : '#8a6a2a';
        g.fillRect(st.x * s2 - 1, (st.y - 1) * s2, st.w * s2 + 2, s2 * 2);
      });
      var sameMap = M && M.id === mapId && mode === 'surface';
      (sameMap ? npcs : (scanMap.npcs || [])).forEach(function(n){
        g.fillStyle = n.warden ? '#ffb347' : n.resident ? '#9fe8ff' : '#b96bce';
        g.beginPath(); g.arc((n.x + .5) * s2, (n.y + .5) * s2, Math.max(2, s2 * .28), 0, 7); g.fill();
      });
      (sameMap ? critters : (scanMap.spawns || [])).forEach(function(c){
        g.fillStyle = c.guardian ? '#ff6b55' : c.resident ? '#ff7ae0' : '#d8c65a';
        g.beginPath(); g.arc((c.x + .5) * s2, (c.y + .5) * s2, Math.max(2, s2 * .24), 0, 7); g.fill();
      });
      var pos = sameMap && P ? P : (scanMap.ship || null);
      if (pos && Math.floor(now / 400) % 2) { g.fillStyle = '#ff4a2a'; g.beginPath(); g.arc((pos.x + .5) * s2, (pos.y + .5) * s2, Math.max(3, s2 * .55), 0, 7); g.fill(); }
      if (scanMap.vault) { g.fillStyle = '#ffe08a'; g.fillRect(scanMap.vault.x * s2, scanMap.vault.y * s2, Math.max(3, s2), Math.max(3, s2)); }
      var sweep = (now / 3000 % 1) * cnv.height; g.fillStyle = 'rgba(124,240,138,.08)'; g.fillRect(0, sweep, cnv.width, 10);
      if (clock) { var d0 = new Date(); clock.textContent = 'LIVE · ' + String(d0.getHours()).padStart(2, '0') + ':' + String(d0.getMinutes()).padStart(2, '0') + ':' + String(d0.getSeconds()).padStart(2, '0'); }
    }
    var timer = setInterval(draw, 250); draw();
  }

  // ── 2 · HEADQUARTERS · the base systems and restoration work ──
  function navHQPanel(body, sec){
    body.innerHTML = '';
    navHQ(body, sec);
  }

  // ── 4 · COMPANIONS · the Aethren you have cloned ──
  function navCompanions(body){ navCards(body); }

  // ── 5 · RESEARCH · everything you collect. It counts once it is home at NASARUS. ──
  function researchIds(){ return Object.keys(S.cards).filter(function(id){ return subj(id) && (!subj(id).sp || !S.cards[id].clone); }).sort(function(a, b){ return subj(a).set - subj(b).set || (subj(a).kind > subj(b).kind ? 1 : -1); }); }
  function researchCount(){ return researchIds().length; }
  function pendingCards(){ return Object.keys(S.cards).reduce(function(n, id){ return n + (S.cards[id].pend || 0); }, 0); }
  // CLONING · at NASARUS's Research Station, from a redeemed profile. The clone comes out at the scanned level.
  function cloneCost(id){ var t = (SP[subj(id).sp] || {}).tier || 1; return { data:2 + t * 2, crystal:Math.max(1, Math.ceil(t / 2)) }; }
  function canClone(id){ if (!COMPANIONS.clone) return false; var c = S.cards[id]; return !!(c && subj(id).sp && !c.clone && c.qty - (c.pend || 0) > 0 && S.hq.built.research && onHQ()); }
  function cloneCard(id){
    if (!COMPANIONS.clone) return false;
    if (!canClone(id) || !canAfford(cloneCost(id))) return false;
    var c = S.cards[id]; pay(cloneCost(id)); c.clone = Date.now(); c.hp = maxHp(id); c.xp = c.xp || 0; autoTeam();
    hqRecord('Cloned ' + subjName(id) + ' from its profile. A new companion.'); save(); sfx.reveal(); vibrate(200, .5);
    toast('CLONED · ' + subjName(id) + ' is a companion now · LV ' + c.lv); return true;
  }
  function navResearch(body){
    var ids = researchIds(), h = S.hq, eq = (HQ.airTanks || []).filter(function(t){ return (h.equip || {})[t.id]; });
    var pendIds = ids.filter(function(id){ return S.cards[id].pend; });
    body.innerHTML = '<p class="x-crt">RESEARCH · what you carry counts only once it is home at ' + esc(hqName()) + '</p>' +
      '<section class="x-arc riv" id="rs-pack"><h3>IN THE PACK · UNREDEEMED <b>' + (packTotal() + packParts() + pendingCards()) + '</b></h3>' +
        '<p class="x-mono light">Lost if you die out there. Bring it home to ' + esc(hqName()) + ' to redeem it.</p><ul class="x-hqlist">' +
        MATS.filter(function(m){ return S.pack[m[0]]; }).map(function(m){ return '<li><b>' + m[1] + ' × ' + S.pack[m[0]] + '</b><span>' + esc(m[2]) + '</span><div></div></li>'; }).join('') +
        (S.pack.parts || []).map(function(no){ return '<li><b>' + esc(sysOf(no).part) + '</b><span>Ship part from ' + esc(placeName(no)) + ', for the ' + esc(sysOf(no).name) + '.</span><div><em>SHIP PART</em></div></li>'; }).join('') +
        pendIds.map(function(id){ return '<li><b>' + esc(subjName(id)) + (S.cards[id].pend > 1 ? ' × ' + S.cards[id].pend : '') + '</b><span>' + esc(classLine(subj(id))) + ' · ' + esc(setName(subj(id).set)) + '</span><div><em>CARD</em></div></li>'; }).join('') +
        (packTotal() + packParts() + pendingCards() ? '' : '<li><b>— the pack is empty —</b><span></span><div></div></li>') + '</ul></section>' +
      '<section class="x-arc riv" id="rs-stores"><h3>REDEEMED AT ' + esc(hqName()) + '</h3><table class="x-mats"><tr><th></th><th>STORES</th></tr>' +
        MATS.map(function(m){ return '<tr><td><b>' + m[1] + '</b><small>' + esc(m[2]) + '</small></td><td>' + (h.store[m[0]] || 0) + '</td></tr>'; }).join('') + '</table>' +
        '<ul class="x-hqlist">' + Object.keys(h.parts).map(function(no){ return '<li class="done"><b>' + esc(sysOf(+no).part) + '</b><span>From ' + esc(placeName(+no)) + '. Ready to install (HEADQUARTERS).</span><div><em class="ok">HOME</em></div></li>'; }).join('') + '</ul></section>' +
      '<section class="x-arc riv" id="rs-kit"><h3>EQUIPMENT AND CRAFTS</h3><ul class="x-hqlist">' +
        '<li class="done"><b>THE ASTRANAV</b><span>Navigation, survey, cloning and the record of everything.</span><div><em class="ok">ISSUED</em></div></li>' +
        '<li class="done"><b>AIR TANK · ' + airMax() + ' AIR</b><span>' + (eq.length ? esc(eq[eq.length - 1].name) : 'The stock tank.') + ' Only ' + esc(hqName()) + ' refills it.</span><div><em class="ok">FITTED</em></div></li>' +
        '<li class="done"><b>RECALL FLARES · ' + S.flares + ' / ' + flaresMax() + '</b><span>Crafted at the Workshop. The ship homes in on the flare.</span><div><em class="ok">CARRIED</em></div></li>' +
        '<li class="' + (h.built.workshop ? 'done' : '') + '"><b>AETHREN PARTY</b><span>Scan profiles, clone them at NASARUS, deploy them in the overworld, and send the party into battle.</span><div><button class="x-btn small" data-go="companions">PARTY</button></div></li>' +
        '</ul></section>' +
      '<section class="x-arc riv" id="rs-cards"><h3>RESEARCH CARDS <b>' + ids.length + '</b></h3>' +
        (ids.length ? '<div class="x-grid">' + ids.map(function(id){ return cardHtml(id, false); }).join('') + '</div>' : '<p class="x-mono light">Scan plants, minerals, places, peoples and bodies in the sky.</p>') + '</section>' +
      '<section class="x-arc riv" id="rs-canon"><h3>MASTER CANON <b class="x-canon-count"></b></h3><div class="x-canon"></div></section>' +
      '<section class="x-arc riv" id="rs-codex"><h3>THE LIVING MASTER CODEX · PLAYER DISCOVERIES</h3><div class="x-codex-in"></div></section>';
    navCodex($('.x-codex-in', body));
    canonPanel($('.x-canon', body), $('.x-canon-count', body));
    body.onclick = function(e){
      var g = e.target.closest('[data-go]'); if (g) { nav(g.dataset.go); return; }
      var c = e.target.closest('.x-grid [data-card]'); if (!c) return;
      var id = c.dataset.card;
      var m = el('div', 'x-modal', '<div class="x-modal-in">' + cardHtml(id, true) + '<div class="x-sh-btns"><button class="x-btn ghost" data-t="close">CLOSE</button></div></div>');
      ui.appendChild(m); sfx.click(); setTimeout(function(){ if (padOn) focusFirst(); }, 30);
      m.addEventListener('click', function(ev){ if (ev.target === m || ev.target.closest('[data-t]')) m.remove(); });
    };
  }

  // ── MASTER CANON · the full Master Codex, sealed until discovered ──
  // Beings unlock when scanned, met or read on a record; WORLDS rows when the world is visited;
  // INDEX entries when their subject is unlocked; COSMIC THEORIES, BOOKS and GAMES pages are decoded
  // with DATA at NASARUS's Research Station. AEP-28, Ovauron and Mealux stay sealed (canon).
  var canonTab = 'beings', canonLetter = 'A', SEALED_RX = /(ovauron|primalutonia|drift planet|aep[- ]?28|\bae-28\b)/i, PAGE_COST = 4;
  function spIdByName(){ if (spIdByName.m) return spIdByName.m; var m = {}; Object.keys(SP).forEach(function(id){ var n = (SP[id].name || '').toLowerCase().replace(/[^a-z0-9]/g, ''); if (n && !m[n]) m[n] = id; }); return (spIdByName.m = m); }
  function beingOpen(b){
    if (SEALED_RX.test(b.name)) return false;
    if (b.kind === 'humanoid') return !!S.codex[b.id];
    var keys = [b.name].concat(b.aliases || []).map(function(n){ return n.toLowerCase().replace(/[^a-z0-9]/g, ''); });
    return keys.some(function(k){ var id = spIdByName()[k]; return id && (S.cards[id] || (S.archive[id] && (S.archive[id].classified || S.archive[id].battled))); });
  }
  function loadCanon(cb){
    if (window.AOV_CODEX_REF) return cb();
    var sc = doc.createElement('script'); sc.src = '/explorer/codex_reference.js'; sc.onload = cb; sc.onerror = function(){ toast('The Master Canon could not be read', 'red'); };
    doc.head.appendChild(sc);
  }
  function canonPanel(host, countEl){
    var all = CODEX.beings, open = all.filter(beingOpen);
    countEl.textContent = open.length + ' / ' + all.length + ' BEINGS UNLOCKED';
    var tabs = [['beings','BEINGS'],['worlds','WORLDS'],['cosmic','COSMIC THEORIES'],['books','BOOKS'],['games','GAMES'],['timeline','TIMELINE'],['index','INDEX']];
    host.innerHTML = '<div class="x-canon-tabs">' + tabs.map(function(t){ return '<button class="x-btn small' + (t[0] === canonTab ? '' : ' ghost') + '" data-ct="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div><div class="x-canon-body"><p class="x-mono light">Reading the Master Canon…</p></div>';
    host.onclick = function(e){
      var t = e.target.closest('[data-ct]'); if (t) { canonTab = t.dataset.ct; canonPanel(host, countEl); return; }
      var l = e.target.closest('[data-cl]'); if (l) { canonLetter = l.dataset.cl; canonPanel(host, countEl); return; }
      var b = e.target.closest('[data-cb]'); if (b) { showBeing(CXB[b.dataset.cb]); return; }
      var pg = e.target.closest('[data-cp]'); if (pg) { showPage(pg.dataset.cp); return; }
      var dc = e.target.closest('[data-dec]'); if (dc) { decodePage(dc.dataset.dec, host, countEl); return; }
    };
    var bodyEl = $('.x-canon-body', host);
    if (canonTab === 'beings') return renderBeings(bodyEl, all);
    loadCanon(function(){ if (!bodyEl.isConnected) return; if (canonTab === 'index') renderIndex(bodyEl); else renderPages(bodyEl, canonTab); });
  }
  function letters(list, nameOf){ var ls = {}; list.forEach(function(x){ var c = (nameOf(x)[0] || '#').toUpperCase(); ls[/[A-Z]/.test(c) ? c : '#'] = 1; }); return Object.keys(ls).sort(); }
  function letterBar(ls){ if (ls.indexOf(canonLetter) < 0) canonLetter = ls[0]; return '<div class="x-canon-letters">' + ls.map(function(c){ return '<button data-cl="' + c + '" class="' + (c === canonLetter ? 'on' : '') + '">' + c + '</button>'; }).join('') + '</div>'; }
  function renderBeings(el, all){
    var ls = letters(all, function(b){ return b.name; });
    var rows = all.filter(function(b){ var c = (b.name[0] || '#').toUpperCase(); return (/[A-Z]/.test(c) ? c : '#') === canonLetter || ls.indexOf(canonLetter) < 0; });
    el.innerHTML = letterBar(ls) + '<ul class="x-hqlist x-canon-list">' + rows.map(function(b){
      var o = beingOpen(b);
      if (!o) return '<li class="sealed"><b>' + b.name[0] + '█████████</b><span>' + (b.kind === 'humanoid' ? 'A person' : 'An Aethren') + ' · SEALED</span><div><em class="dim">' + (b.kind === 'humanoid' ? (b.place === 'npc' ? 'MEET THEM' : b.place === 'record' ? 'FIND THEIR RECORD' : 'NOT YET FOUND') : 'SCAN IT') + '</em></div></li>';
      return '<li class="done"><b>' + esc(b.name) + '</b><span>' + esc([b.kind === 'humanoid' ? 'Humanoid' : 'Aethren', b.cls && b.cls !== '—' ? b.cls : null, b.tierName, (b.types || []).join(' / ')].filter(Boolean).join(' · ')) + '</span><div><button class="x-btn small" data-cb="' + b.id + '">READ</button></div></li>';
    }).join('') + '</ul>';
  }
  function showBeing(b){
    if (!b || !beingOpen(b)) return;
    loadCanon(function(){
      var lore = (window.AOV_CODEX_REF.lore || {})[b.id] || b.blurb || 'The Master Codex’s account of ' + b.name + ' is still being written.';
      var st = b.stats && b.stats.total ? '<p class="x-mono">HP ' + b.stats.hp + ' · ATK ' + b.stats.atk + ' · DEF ' + b.stats.def + ' · SPD ' + b.stats.spd + ' · SPC ' + b.stats.spc + ' · TOTAL ' + b.stats.total + '</p>' : '';
      var m = el('div', 'x-modal', '<div class="x-modal-in x-canon-page"><p class="x-man-k">MASTER CANON · ' + (b.kind === 'humanoid' ? 'HUMANOID' : 'AETHREN') + '</p><h2>' + esc(b.name) + '</h2>' +
        '<p class="x-mono">' + esc([b.cls && b.cls !== '—' ? b.cls : null, b.tier ? 'Tier ' + b.tier : null, b.tierName, (b.types || []).join(' / '), b.arch].filter(Boolean).join(' · ')) + '</p>' + st +
        '<div class="x-canon-text">' + esc(lore).replace(/\n/g, '<br>') + '</div><div class="x-sh-btns"><button class="x-btn ghost" data-t="close">CLOSE</button></div></div>');
      ui.appendChild(m); m.addEventListener('click', function(ev){ if (ev.target === m || ev.target.closest('[data-t]')) m.remove(); });
    });
  }
  function worldOpenByName(t){ var n = String(t || '').toLowerCase(); return D.worlds.some(function(w){ return S.visited[w.no] && n.indexOf(String(w.name || '').toLowerCase()) >= 0; }); }
  function pageOpen(sec, i, pg){
    var text = pg.title + ' ' + pg.rows.map(function(r){ return r.join(' '); }).join(' ');
    if (SEALED_RX.test(pg.title)) return false;
    if (sec === 'worlds') return pg.rows.some(function(r){ return worldOpenByName(r[1]); }) || (S.codexPages['worlds:' + i] && true);
    return !!S.codexPages[sec + ':' + i];
  }
  function renderPages(el, sec){
    var S2 = window.AOV_CODEX_REF.sections.filter(function(x){ return x.key === sec; })[0]; if (!S2) return;
    var canDecode = onHQ() && S.hq.built.research;
    el.innerHTML = '<p class="x-mono light">' + (sec === 'worlds' ? 'Pages open as you visit their worlds.' : 'Encrypted pages. Find them on record stones out in the worlds, or decode them at ' + esc(hqName()) + '’s Research Station for ' + PAGE_COST + ' DATA each.' + (canDecode ? '' : ' (You must be at the Research Station.)')) + '</p>' +
      '<ul class="x-hqlist x-canon-list">' + S2.pages.map(function(pg, i){
        var o = pageOpen(sec, i, pg), restricted = SEALED_RX.test(pg.title);
        if (o) return '<li class="done"><b>' + esc(pg.title) + '</b><span>' + pg.rows.length + ' lines</span><div><button class="x-btn small" data-cp="' + sec + ':' + i + '">READ</button></div></li>';
        return '<li class="sealed"><b>PAGE ' + (i + 1) + ' · ██████</b><span>' + (restricted ? 'RESTRICTED' : 'ENCRYPTED') + '</span><div>' +
          (!restricted && sec !== 'worlds' && canDecode ? '<button class="x-btn small" data-dec="' + sec + ':' + i + '"' + ((S.hq.store.data || 0) >= PAGE_COST ? '' : ' disabled') + '>DECODE · ' + PAGE_COST + ' DATA</button>' : '') + '</div></li>';
      }).join('') + '</ul>';
  }
  function decodePage(key, host, countEl){
    if (!onHQ() || !S.hq.built.research || (S.hq.store.data || 0) < PAGE_COST) { toast('Decoding needs ' + PAGE_COST + ' DATA at the Research Station', 'red'); return; }
    S.hq.store.data -= PAGE_COST; S.codexPages[key] = Date.now(); hqRecord('Decoded a Master Canon page (' + key + ').'); save(); sfx.reveal(); toast('MASTER CANON · page decoded');
    canonPanel(host, countEl);
  }
  function showPage(key){
    var p = key.split(':'), S2 = window.AOV_CODEX_REF.sections.filter(function(x){ return x.key === p[0]; })[0], pg = S2 && S2.pages[+p[1]];
    if (!pg || !pageOpen(p[0], +p[1], pg)) return;
    var m = el('div', 'x-modal', '<div class="x-modal-in x-canon-page"><p class="x-man-k">MASTER CANON · ' + esc(S2.title) + '</p><h2>' + esc(pg.title) + '</h2><div class="x-canon-text">' +
      pg.rows.map(function(r){ if (p[0] === 'worlds' && r[1] && D.worlds.some(function(w){ return String(r[1]).toLowerCase().indexOf(String(w.name || '').toLowerCase()) >= 0; }) && !worldOpenByName(r[1])) return '<p class="dim">██████ · an unvisited world</p>';
        if (SEALED_RX.test(r.join(' '))) return '<p class="dim">██████ · RESTRICTED</p>';
        return r.length > 1 ? '<p><b>' + esc(r[0]) + '</b> ' + esc(r.slice(1).join(' · ')) + '</p>' : '<p>' + esc(r[0]) + '</p>'; }).join('') +
      '</div><div class="x-sh-btns"><button class="x-btn ghost" data-t="close">CLOSE</button></div></div>');
    ui.appendChild(m); m.addEventListener('click', function(ev){ if (ev.target === m || ev.target.closest('[data-t]')) m.remove(); });
  }
  function indexOpen(term){
    if (SEALED_RX.test(term)) return false;
    var k = term.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (CODEX.beings.some(function(b){ return b.name.toLowerCase().replace(/[^a-z0-9]/g, '') === k && beingOpen(b); })) return true;
    if (worldOpenByName(term)) return true;
    if (S.codexIdx[k]) return true;
    return Object.keys(S.lex || {}).some(function(t){ var L = D.lexicon[t]; return L && L.canon && L.canon.toLowerCase().replace(/[^a-z0-9]/g, '') === k; });
  }
  function ixWhere(term){
    if (!ixWhere.m) { ixWhere.m = {}; (CODEX.placements || []).forEach(function(p){ (p.term ? [p.term] : p.terms || []).forEach(function(t){ ixWhere.m[ixKey(t)] = p.home.world; }); }); }
    var no = ixWhere.m[ixKey(term)], w = no && D.worlds.filter(function(x){ return x.no === no; })[0];
    return w && S.visited[no] ? String(w.name).toUpperCase() : '';
  }
  function renderIndex(el){
    var IX = window.AOV_CODEX_REF.index, ls = letters(IX, function(r){ return r[1]; });
    var rows = IX.filter(function(r){ var c = (r[1][0] || '#').toUpperCase(); return (/[A-Z]/.test(c) ? c : '#') === canonLetter; });
    var open = IX.filter(function(r){ return indexOpen(r[1]); }).length;
    el.innerHTML = '<p class="x-mono light">' + open + ' / ' + IX.length + ' entries readable. Entries open as you discover their subjects.</p>' + letterBar(ls) +
      '<ul class="x-hqlist x-canon-list">' + rows.map(function(r){ return indexOpen(r[1]) ? '<li class="done"><b>' + esc(r[1]) + '</b><span>' + esc(redact(r[2])).slice(0, 600) + '</span><div></div></li>' : '<li class="sealed"><b>' + esc(r[1][0]) + '█████████</b><span>SEALED' + (ixWhere(r[1]) ? ' · somewhere on ' + esc(ixWhere(r[1])) : '') + '</span><div></div></li>'; }).join('') + '</ul>';
  }

  // ── 6 · JOURNAL · the missions ──
  function navJournal(body){
    var vis = D.worlds.filter(function(w){ return S.visited[w.no] && w.no <= 27; });
    body.innerHTML = '<div class="x-paper"><p class="x-mono">JOURNAL OF ' + esc(heroName()) + ' · ' + STORY.year + '</p>' + objList() + '</div>' +
      '<section class="x-arc riv"><h3>EXPEDITIONS <b>' + vis.length + ' / 27</b></h3><ul class="x-hqlist">' +
      (vis.length ? vis.map(function(w){
        var no = w.no, steps = [hasClue(no) ? '✓ CLUE' : '· CLUE', S.exp.beaten[no] ? '✓ ' + (hasWarden(no) ? 'WARDEN' : 'GUARDIAN') : '· ' + (hasWarden(no) ? 'WARDEN' : 'GUARDIAN'),
          S.hq.installed[no] || S.hq.parts[no] ? '✓ PART HOME' : S.exp.vault[no] ? '… PART IN PACK' : '· PART'];
        if (hasWarden(no)) steps.push(S.hq.residents[no] ? '✓ REFUGEES' : '· REFUGEES');
        return '<li class="' + (S.hq.installed[no] || S.hq.parts[no] ? 'done' : '') + '"><b>' + esc(placeName(no)) + '</b><span>' + steps.join(' · ') + '</span><div><em>' + esc(vaultState(no)) + '</em></div></li>';
      }).join('') : '<li><b>— no expeditions yet —</b><span>Set a course in NAVIGATION.</span><div></div></li>') + '</ul></section>';
  }

  function machineDef(id){ return MACHINES.filter(function(m){ return m.id === id; })[0]; }
  function developerRoom(){
    if (!S.dev.access) {
      var code = window.prompt('AOV DEVELOPER ROOM · PASSWORD');
      if (code !== 'aovdev') { toast('DEVELOPER ACCESS DENIED', 'red'); return; }
      S.dev.access = true; save();
    }
    showDeveloperRoom();
  }
  function showDeveloperRoom(){
    var s = screen('x-devroom', '<div class="x-devroom-in"><p class="x-stamp">AOV™ DEVELOPMENT ANNEX</p><h1>STARTING ROOM</h1><p class="x-mono">Developer machines are staged in chests. Claim one to add it to the machine inventory, then press TEST to run its current logic.</p><div class="x-devchests">' +
      MACHINES.map(function(m){ var owned = !!S.machines[m.id]; return '<section class="x-devchest ' + (owned ? 'claimed' : '') + '"><div class="x-devchest-art"><img class="x-chest-sprite" src="' + ART.url('dev_chest', 8) + '" alt=""><img class="x-devsprite" src="' + ART.url(m.sprite, 8) + '" alt=""></div><h3>' + esc(m.name) + '</h3><p>' + esc(m.does) + '</p><button class="x-btn" data-machine="' + m.id + '">' + (owned ? 'TEST MACHINE' : 'OPEN CHEST') + '</button></section>'; }).join('') +
      '</div><div class="x-sh-btns"><button class="x-btn ghost" data-dev="back">RETURN TO ASTRA NAV</button></div></div>');
    s.addEventListener('click', function(e){
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.dev === 'back') { nav('setup'); return; }
      if (!b.dataset.machine) return;
      var id = b.dataset.machine;
      if (!S.machines[id]) { S.machines[id] = { claimed:Date.now() }; S.dev.chests[id] = Date.now(); save(); toast(machineDef(id).name + ' ACQUIRED'); showDeveloperRoom(); return; }
      useMachine(id);
    });
  }
  function useMachine(id){
    var m = machineDef(id); if (!m || !S.machines[id]) return;
    if (id === 'astranav') { nav('system'); return; }
    if (id === 'cloning_pod') { S.flags.cloningPodOnline = Date.now(); save(); nav('companions'); return; }
    if (id === 'generator') { S.flags.generatorOnline = Date.now(); save(); toast('GENERATOR ONLINE · developer power available'); return; }
    if (id === 'jetpack') { S.flags.jetpackOnline = Date.now(); save(); toast('JETPACK TEST ONLINE · movement hook enabled'); return; }
    if (id === 'workstation') { S.flags.workstationOnline = Date.now(); save(); toast('WORKSTATION ONLINE · machine test bench ready'); return; }
    if (id === 'rocketship') { S.flags.rocketshipOnline = Date.now(); save(); toast('ROCKETSHIP TEST ONLINE · vehicle hook enabled'); return; }
    toast(m.name + ' TEST COMPLETE');
  }

  // ── COMPANIONS · cloned Aethren and the deployed party ──
  function navCards(body){
    autoTeam();
    var ids = Object.keys(S.cards).filter(function(id){ return subj(id) && subj(id).sp; }).sort(function(a, b){ return subj(a).set - subj(b).set || (S.cards[b].lv || 0) - (S.cards[a].lv || 0); });
    var prof = profileIds();
    ids = ids.filter(function(id){ return S.cards[id].clone; });
    body.innerHTML = '<p class="x-crt">AETHREN PARTY · ' + ids.length + ' cloned at ' + esc(hqName()) + ' · deployed companions follow you in the overworld</p>' +
      '<section class="x-arc riv" id="cp-clone"><h3>PROFILES · READY TO CLONE <b>' + prof.length + '</b></h3>' +
        '<p class="x-mono light">A scan is only a profile. Bring it home, then clone it at the Research Station on ' + esc(hqName()) + '. ' +
          (onHQ() ? (S.hq.built.research ? '' : 'Build the RESEARCH STATION first.') : 'You are away from ' + esc(hqName()) + '.') + '</p>' +
        (prof.length ? '<ul class="x-hqlist">' + prof.map(function(id){
          var c = S.cards[id], home = c.qty - (c.pend || 0) > 0, act;
          if (!home) act = '<em class="dim">IN THE PACK · BRING IT HOME</em>';
          else if (!onHQ()) act = '<em class="dim">CLONE AT ' + esc(hqName()) + '</em>';
          else if (!S.hq.built.research) act = '<em class="dim">NEEDS RESEARCH STATION</em>';
          else act = '<em>' + costText(cloneCost(id)) + '</em><button class="x-btn small" data-clone="' + id + '"' + (canAfford(cloneCost(id)) ? '' : ' disabled') + '>CLONE</button>';
          return '<li><b>' + esc(subjName(id)) + ' · LV ' + c.lv + '</b><span>' + esc(subj(id).types) + ' · tier ' + ((SP[subj(id).sp] || {}).tier || '?') + '</span><div>' + act + '</div></li>';
        }).join('') + '</ul>' : '<p class="x-mono light">No profiles waiting. Scan Aethren in the field.</p>') + '</section>' +
      '<section class="x-team riv"><h3>PARTY <small>up to ' + teamMax() + ' · the first leads</small></h3>' +
        (leadPerk() ? '<p class="x-perk"><b>LEAD PERK · ' + esc(leadPerk().name) + '</b> ' + esc(leadPerk().text) + '</p>' : '<p class="x-perk dim">The lead card’s first type gives a field perk.</p>') +
        '<div class="x-teamrow">' +
        (S.team.length ? S.team.map(teamChip).join('') : '<p class="x-mono light">No companions yet. Clone a scanned profile at ' + esc(hqName()) + '.</p>') + '</div></section>' +
      (ids.length ? '<div class="x-grid">' + ids.map(function(id){ return cardHtml(id, false); }).join('') + '</div>'
      : '<p class="x-empty">No companions yet. Scan an Aethren, bring the profile home, and clone it.</p>');
    body.onclick = function(e){
      var cl = e.target.closest('[data-clone]');
      if (cl) { if (!cloneCard(cl.dataset.clone)) { toast('Not possible yet: check the stores and requirements', 'red'); sfx.bump(); } nav('companions'); return; }
      var c = e.target.closest('.x-grid [data-card], .x-teamrow [data-card]'); if (!c) return;
      var id = c.dataset.card, isA = !!(subj(id).sp && S.cards[id].lv && S.cards[id].clone), on = S.team.indexOf(id);
      var m = el('div', 'x-modal', '<div class="x-modal-in">' + cardHtml(id, true) + '<div class="x-sh-btns">' +
        (isA ? (on >= 0 ? (on > 0 ? '<button class="x-btn" data-t="lead">MAKE LEAD</button>' : '') + '<button class="x-btn ghost" data-t="off">REMOVE FROM TEAM</button>' :
          '<button class="x-btn" data-t="on">ADD TO TEAM</button>') : '') + '<button class="x-btn ghost" data-t="close">CLOSE</button></div></div>');
      ui.appendChild(m); sfx.click();
      setTimeout(function(){ if (padOn) focusFirst(); }, 30);
      m.addEventListener('click', function(ev){
        var t = ev.target.closest('[data-t]');
        if (ev.target === m || (t && t.dataset.t === 'close')) { m.remove(); return; }
        if (!t) return;
        if (t.dataset.t === 'on') { if (S.team.length >= teamMax()) S.team.pop(); S.team.push(id); }
        if (t.dataset.t === 'off') S.team.splice(S.team.indexOf(id), 1);
        if (t.dataset.t === 'lead') { S.team.splice(S.team.indexOf(id), 1); S.team.unshift(id); }
        S.flags.teamSet = true; save(); m.remove(); nav('companions');
      });
    };
  }
  function teamChip(id){
    var c = S.cards[id], mh = maxHp(id), hp = c.hp == null ? mh : c.hp;
    return '<button class="x-chip" data-card="' + id + '"><img class="x-pix" alt="" src="' + ART.url(subjArt(id), 3) + '"><span><b>' + esc(subjName(id)) + '</b><em>LV ' + c.lv + ' · ' + hp + '/' + mh + '</em>' +
      '<i class="x-hpbar"><i style="width:' + Math.round(hp / mh * 100) + '%"></i></i></span></button>';
  }

  // ── CODEX · what the scans, peoples and records have taught ──
  function canDecode(){ return S.flags.copied && !S.flags.decoded && classifiedCount() >= 4; }
  function loreHtml(e){
    var c = e.canon || {};
    return '<div class="x-lore">' +
      (c.trait ? '<p><b>' + esc(c.trait) + '</b></p>' : '') +
      (c.notes ? '<p>' + esc(c.notes) + '</p>' : '') +
      (c.firstRace ? '<p><span>FIRST RACE</span> ' + esc(c.firstRace) + '</p>' : '') +
      (c.notable ? '<p><span>NOTABLE</span> ' + esc(c.notable) + '</p>' : '') +
      (e.lord ? '<p><span>GEMLORD</span> ' + esc(e.lord) + (e.gem ? ' · ' + esc(e.gem) : '') + '</p>' : '') +
      ((e.landmarks || []).length && !(e.mechanic && /spoiler/i.test(e.mechanic.name)) ? '<p><span>LANDMARKS</span> ' + esc(e.landmarks.join(' · ')) + '</p>' : '') +
      (e.hazard && e.hazard.name !== '—' ? '<p><span>WARNING · ' + esc(e.hazard.name.toUpperCase()) + '</span> ' + esc(e.hazard.rule) + '</p>' : '') +
      '</div>';
  }
  function navCodex(body){
    var worlds = D.worlds.filter(function(w){ return !w.hidden && (S.visited[w.no] || known(w.term) || setCards(w.no)); }).map(function(w){ return w.no; });
    var sets = worlds.concat([29, 30]);
    body.innerHTML = (S.flags.copied && !S.flags.decoded ? '<section class="x-arc riv"><h3>DECODING</h3><p class="x-mono light">' +
        (canDecode() ? 'The carved markings can be cross-referenced against your scans.' : 'Markings copied. Classify at least 4 subjects to cross-reference them (' + classifiedCount() + '/4).') +
        '</p><button class="x-btn" data-a="dec"' + (canDecode() ? '' : ' disabled') + '>DECODE THE MARKINGS</button></section>' : '') +
      '<p class="x-crt">' + esc(heroName()) + '’S LIVING MASTER CODEX · ' + esc(STORY.rule) + '</p>' +
      '<p class="x-mono light">PLAYER DISCOVERIES, drawn from the MASTER CANON. Aethren cards are in COMPANIONS, research cards above; the planetary survey is in NAVIGATION; restoration records are in HEADQUARTERS.</p>' +
      '<section class="x-arc riv"><h3>' + esc(hqName()) + ' · HEADQUARTERS <b>STAGE ' + hqStage() + '</b></h3><p class="x-mono light">An ancient drifting planet. Haemen and Aethren lived here before the First Eternal War. Why it was abandoned is not known.</p>' +
        '<ul>' + HQ.ruins.filter(function(u){ return S.hq.ruins[u.id]; }).map(function(u){ return '<li class="done"><b>' + esc(u.label) + '</b><span>' + (S.hq.ruins[u.id].restored ? 'RESTORED' : 'SURVEYED') + '</span><em>' + esc(u.survey) + '</em></li>'; }).join('') +
        (Object.keys(S.hq.ruins).length ? '' : '<li><b>— no ruins surveyed yet —</b></li>') + '</ul></section>' + sets.map(function(n){
      var ids = setSubjects(n).filter(function(id){ return S.archive[id] || S.cards[id]; });
      var e = n <= 28 ? envOf(n) : null, learned = n === 9 ? GEN.DISTRICTS.filter(function(d){ return S.lore['z_' + d] || (d === 'malezor' && S.flags.taught); }) : (S.lore['w' + n] ? [true] : []);
      return '<section class="x-arc riv"><h3>' + esc(setName(n)) + ' <b>' + setPct(n) + '%</b></h3>' +
        (e && learned.length ? (n === 9 ? learned.map(function(d){ return '<h4>' + esc(term(d)) + '</h4>' + loreHtml(ENV[d]); }).join('') : loreHtml(e)) :
          e ? '<p class="x-mono">' + (FAUNA.peoples[n] && FAUNA.peoples[n].record ? 'Find and copy this world’s carved records to learn about it.' : 'Meet its people and show them your scans to learn about this world.') + '</p>' : '') +
        '<ul>' + (ids.length ? ids : ['']).map(function(id){
          if (!id) return '<li><b>— nothing recorded yet —</b></li>';
          var a = S.archive[id] || {};
          return '<li class="' + (a.classified ? 'done' : 'part') + '"><b>' + esc(subjName(id)) + '</b>' +
            '<span>' + (a.classified ? 'SCANNED' : a.battled ? 'BATTLED' : 'FIELD RECORD') + '</span>' +
            (S.notes[id] ? '<em>' + esc(subj(id).journal) + '</em>' : '') + '</li>';
        }).join('') + '</ul></section>';
    }).join('') + '<p class="x-mono dim">The master collection holds 30 sets.</p>';
    var dec = $('[data-a="dec"]', body);
    if (dec) dec.addEventListener('click', function(){
      reclassify(D.teaches.markings, 'The carved figures match your scans. Beside each figure, a word. The words repeat in the wireless pattern.', function(){
        S.flags.decoded = true; save(); nav('research'); toast('The AstraNav now reads in the true names.');
      });
    });
  }

  // The premise lands here: 1936 descriptions struck out, true names typed in.
  async function reclassify(terms, intro, done){
    terms = terms.filter(function(t, i){ return terms.indexOf(t) === i && D.lexicon[t] && D.lexicon[t].canon && !S.lex[t]; });
    var s = screen('x-reclass', '<div class="x-paper"><p class="x-stamp red">RECLASSIFICATION</p><p class="x-mono">' + esc(intro) + '</p><ul class="x-relist"></ul><button class="x-btn" hidden>CONTINUE</button></div>');
    var list = $('.x-relist', s);
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i], L = D.lexicon[t];
      var li = el('li', '', '<s>' + esc(L.unknown) + '</s><b></b>'); list.appendChild(li);
      li.scrollIntoView({ block:'nearest' });
      await wait(260); li.classList.add('struck'); sfx.click();
      await typeInto(li.querySelector('b'), L.canon, 34);
      S.lex[t] = true; save();
      await wait(120);
    }
    if (!terms.length) list.appendChild(el('li', '', '<b>Nothing new to learn here yet.</b>'));
    var b = $('.x-btn', s); b.hidden = false; b.focus();
    b.addEventListener('click', done);
  }

  // ── SETUP · everything a player can tune ──
  function navSetup(body){
    var O = S.opts;
    function row(k, label, vals){
      return '<div class="x-kit-row" data-o="' + k + '"><span>' + label + '</span><button data-d="-1" aria-label="Previous">◀</button><b>' + esc(vals[typeof O[k] === 'boolean' ? (O[k] ? 1 : 0) : k === 'hand' ? (O[k] === 'left' ? 1 : 0) : k === 'alpha' ? [1, .7, .4].indexOf(O[k]) : O[k]]) + '</b><button data-d="1" aria-label="Next">▶</button></div>';
    }
    var padTxt = PAD && PAD.connected() ? (PAD.dualsense() ? 'DUALSENSE CONNECTED' : 'CONTROLLER CONNECTED') : 'NO CONTROLLER · connect a DualSense by USB or Bluetooth, then press any button';
    body.innerHTML = '<div class="x-opts riv">' +
      row('sound', 'SOUND', ['OFF', 'ON']) + row('haptics', 'HAPTICS', ['OFF', 'ON']) + row('text', 'TEXT SPEED', ['SLOW', 'NORMAL', 'FAST']) +
      row('hand', 'TOUCH CONTROLS', ['D-PAD LEFT', 'D-PAD RIGHT']) + row('alpha', 'CONTROL OPACITY', ['SOLID', 'SOFT', 'FAINT']) +
      '<p class="x-mono light">' + esc(padTxt) + '</p>' +
      '<p class="x-mono light">✕ examine · ○ back / gait (stalk · steady · sprint) · □ scan · TOUCHPAD AstraNav · L1/R1 AstraNav pages · L2/R2 tuning dial and zoom · right stick pans the telescope</p>' +
      '<div class="x-sh-btns"><button class="x-btn" data-a="kit">REFIT YOUR KIT</button><button class="x-btn ghost" data-a="devroom">DEVELOPER ROOM</button><button class="x-btn ghost" data-a="rename">RENAME ASTRONAUT</button><button class="x-btn ghost" data-a="renamehq">RENAME ' + esc(hqName()) + '</button>' + (coarse ? '<button class="x-btn ghost" data-a="fs">FULL SCREEN · LANDSCAPE</button>' : '') +
        '<button class="x-btn ghost" data-a="reset">ERASE EXPEDITION</button></div>' +
      '<p class="x-mono light">PILOT-OBSERVER: ' + esc(heroName()) + ' · HEADQUARTERS: ' + esc(hqName()) + '</p>' +
      '<p class="x-mono dim">Personal names live in this save only. The canon identities stay Carl Nasaro and NASARUS.</p></div>';
    body.onclick = function(e){
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.a === 'kit') { kit(hero().gender, hero().look, function(){ nav('setup'); }).then(function(l){ S.hero.look = l; applyLook(); save(); toast('KIT REFITTED'); nav('setup'); }); return; }
      if (b.dataset.a === 'devroom') { developerRoom(); return; }
      if (b.dataset.a === 'fs') { goLandscape(); return; }
      if (b.dataset.a === 'rename') { naming({ def:hero().first }).then(function(n){ S.hero.first = n; save(); toast('ASTRONAUT · ' + heroName()); nav('setup'); }); return; }
      if (b.dataset.a === 'renamehq') { naming({ title:'NAME THIS WORLD', suffix:'', def:hqName(), max:12, world:true }).then(function(n){ S.hq.name = n; hqRecord('The log renames this world ' + n + '.'); save(); toast('HEADQUARTERS · ' + n); nav('setup'); }); return; }
      if (b.dataset.a === 'reset') { if (!confirm('Erase this expedition and start over?')) return; try { localStorage.removeItem(KEY); } catch(err){} S = null; title(); return; }
      var r = b.closest('[data-o]'); if (!r) return;
      var k = r.dataset.o, d = +b.dataset.d;
      if (k === 'sound' || k === 'haptics') O[k] = !O[k];
      else if (k === 'text') O.text = (O.text + d + 3) % 3;
      else if (k === 'hand') O.hand = O.hand === 'left' ? 'right' : 'left';
      else if (k === 'alpha') { var a = [1, .7, .4], i = (a.indexOf(O.alpha) + d + 3) % 3; O.alpha = a[i]; }
      save(); sfx.click(); applyOpts(); nav('setup');
      setTimeout(function(){ var again = $('[data-o="' + k + '"] [data-d="' + d + '"]'); if (again) again.focus(); }, 40);
    };
  }
  function applyOpts(){
    if (!S) return;
    doc.body.classList.toggle('lefty', S.opts.hand === 'left');
    doc.body.style.setProperty('--ctl-alpha', S.opts.alpha || 1);
  }



  // ═════════════════════════ NASARUS · the headquarters ═════════════════════════
  // Canon: docs/card-explorer/05_NASARUS_CANON.md. Data: nasarus.js. Loop:
  //   EXPLORE → EXTRACT (materials into the pack) → RETURN → CATALOG (deposit) → DEVELOP → REPEAT
  // Materials are carried in S.pack and only usable once deposited in S.hq.store at NASARUS.
  // S.hq maps onto the handoff's suggested schema: name = display_name, built = constructed_facilities,
  // ruins = discovered_ruins / restored_landmarks, regions = unlocked_regions, store = stored_resources,
  // research = research_progress, stage = current_stage, built.camp = camp_established.
  function hqName(){ return (S && S.hq && S.hq.name) || HQ.canonicalName; }
  function placeName(at){ return at === 'nasarus' ? hqName() : at ? term(WORLD[at].term) : 'DEEP SPACE'; }
  function onHQ(){ return S.at === 'nasarus' && (S.landed || S.stage === 'surface'); }
  function nameOf(k){
    if (k === 'drive') return 'REPAIRED DRIVE';
    var f = HQ.facilities.filter(function(x){ return x.id === k; })[0], r = HQ.research.filter(function(x){ return x.id === k; })[0], g = HQ.regions.filter(function(x){ return x.id === k; })[0];
    var t = (HQ.airTanks || []).filter(function(x){ return x.id === k; })[0];
    return f ? f.name : r ? r.name : g ? g.name : t ? t.name : k.toUpperCase();
  }
  function hqHas(k){ var h = S.hq; return !!(h.built[k] || (k === 'drive' && h.drive) || h.research[k] || (h.equip && h.equip[k]) || h.regions.indexOf(k) >= 0); }
  // ── AIR: only NASARUS holds oxygen. The tank refills at the base, never on another world. ──
  function airMax(){ var cap = 100; (HQ.airTanks || []).forEach(function(t){ if (S.hq.equip && S.hq.equip[t.id]) cap = Math.max(cap, t.cap); }); return cap; }
  function airPct(){ return S.air / airMax() * 100; }
  function refillAir(){ S.air = airMax(); }
  // ── THE WAY HOME · vaults, ship parts, wardens, refugees, settled Aethren, the lead card's perk ──
  var WORLDS_ALL = 27;
  function sysOf(no){ return EXP.ship.systems[(no - 1) % EXP.ship.systems.length]; }
  function sysNeed(id){ var n = 0; for (var w = 1; w <= WORLDS_ALL; w++) if (sysOf(w).id === id) n++; return n; }
  function sysDone(id){ return Object.keys(S.hq.installed).filter(function(w){ return sysOf(+w).id === id; }).length; }
  function shipPct(){ return Math.round(Object.keys(S.hq.installed).length / WORLDS_ALL * 100); }
  function hasClue(no){ return no === 9 ? !!S.lore.z_korathen : !!S.lore['w' + no]; }
  function worldPeople(no){ return no === 9 ? null : (FAUNA.peoples[no] || null); }
  function hasWarden(no){ var pe = worldPeople(no); return !!(pe && pe.race); }
  function wardenName(no){ var pe = worldPeople(no); return 'WARDEN OF THE ' + (pe && pe.race ? pe.race.replace(/^THE /, '') : 'PEOPLE'); }
  function leadPerk(){
    if (!COMPANIONS.follow) return null;
    var id = (S.team || []).filter(function(k){ return S.cards[k]; })[0], s = id && subj(id), t = s && s.sp && SP[s.sp].types[0];
    return EXP.perks.filter(function(p){ return p.types.indexOf(t) >= 0; })[0] || null;
  }
  function perk(id){ var p = leadPerk(); return !!(p && p.id === id); }
  function vaultState(no){ return S.hq.installed[no] ? 'INSTALLED' : S.hq.parts[no] ? 'AT ' + hqName() : S.exp.vault[no] ? 'IN YOUR PACK' : S.exp.beaten[no] && hasClue(no) ? 'OPEN TO YOU' : hasClue(no) ? 'CLUE FOUND' : 'SEALED'; }
  function packParts(){ return (S.pack.parts || []).length; }
  function installPart(no){
    var sy = sysOf(no);
    if (!S.hq.parts[no] || S.hq.installed[no] || !S.hq.built.workshop || !canAfford(sy.cost)) return false;
    pay(sy.cost); delete S.hq.parts[no]; S.hq.installed[no] = Date.now();
    hqRecord('Installed the ' + sy.part + ' from ' + placeName(no) + ' in the ' + sy.name + '. The ship is ' + shipPct() + '% restored.'); save();
    toast(sy.part + ' INSTALLED · SHIP ' + shipPct() + '%');
    if (shipPct() >= 100) setTimeout(function(){ toast(EXP.ship.done); }, 600);
    return true;
  }
  function settleAethren(id){
    var c = S.cards[id], s = subj(id);
    if (!S.hq.built.sanctuary || !c || !s || !s.sp || c.qty < 2 || S.hq.settled[id]) return false;
    c.qty--; S.hq.settled[id] = Date.now();
    hqChanged(subjName(id) + ' settled at the Aethren Sanctuary. A new species lives on ' + hqName() + '.');
    toast('SETTLED · ' + subjName(id)); return true;
  }
  function residentsList(){ return Object.keys(S.hq.residents).map(function(no){ return { no:+no, env:(envOf(+no) || {}).id }; }); }
  function buildTank(id){
    var t = (HQ.airTanks || []).filter(function(x){ return x.id === id; })[0];
    if (!t || !S.hq.built.workshop || (S.hq.equip || {})[id] || !(t.requires || []).every(hqHas) || !canAfford(t.cost)) return false;
    pay(t.cost); S.hq.equip = S.hq.equip || {}; S.hq.equip[id] = Date.now(); refillAir();
    hqRecord('Fitted the ' + t.name + '. The tank now holds ' + t.cap + ' AIR.'); save(); toast(t.name + ' FITTED · AIR ' + t.cap); return true;
  }
  function reqText(reqs){ return (reqs || []).filter(function(k){ return !hqHas(k); }).map(nameOf).join(' · '); }
  function hqRestored(){ return Object.keys(S.hq.ruins).filter(function(k){ return S.hq.ruins[k].restored; }).length; }
  function stageNeedMet(k){ var m = /^(restored|residents|settled):(\d+)$/.exec(k); if (!m) return hqHas(k); var n = m[1] === 'restored' ? hqRestored() : Object.keys(S.hq[m[1]] || {}).length; return n >= +m[2]; }
  function hqStage(){
    var n = 1;
    for (var i = 1; i < HQ.stages.length; i++) { var st = HQ.stages[i]; if (st.future || !st.needs.every(stageNeedMet)) break; n = i + 1; }
    return n;
  }
  function stageName(n){ return HQ.stages[n - 1].name; }
  function needLabel(k){ var m = /^(restored|residents|settled):(\d+)$/.exec(k), L = { restored:'RUINS RESTORED', residents:'REFUGEE GROUPS HOME', settled:'AETHREN SPECIES SETTLED' };
    return (stageNeedMet(k) ? '✓ ' : '') + (m ? m[2] + ' ' + L[m[1]] + ' (' + (m[1] === 'restored' ? hqRestored() : Object.keys(S.hq[m[1]] || {}).length) + ')' : nameOf(k)); }
  function hqState(){ return { built:S.hq.built, ruins:S.hq.ruins, regions:S.hq.regions, found:S.found, stage:hqStage(), drive:S.hq.drive, research:S.hq.research, residents:residentsList(), settled:Object.keys(S.hq.settled) }; }
  function buildMap(id){ return id === 'nasarus' ? GEN.build('nasarus', hqState()) : GEN.build(id); }
  function hqRecord(text){ S.hq.records.push({ t:Date.now(), text:text }); if (S.hq.records.length > 200) S.hq.records.shift(); }
  function matName(k){ return (MATS.filter(function(m){ return m[0] === k; })[0] || [k, k.toUpperCase()])[1]; }
  function costText(c){ return Object.keys(c || {}).map(function(k){ return matName(k) + ' ' + c[k]; }).join(' · ') || 'FREE'; }
  function packTotal(){ return MATS.reduce(function(n, m){ return n + (S.pack[m[0]] || 0); }, 0); }
  function gainAll(obj, quiet){
    var parts = [];
    Object.keys(obj || {}).forEach(function(k){ if (obj[k]) { S.pack[k] = (S.pack[k] || 0) + obj[k]; parts.push('+' + obj[k] + ' ' + matName(k)); } });
    save(); if (parts.length && !quiet) toast(parts.join(' · ') + ' · in your pack');
    return parts.join(' · ');
  }
  function gain(k, n, quiet){ var o = {}; o[k] = n; return gainAll(o, quiet); }
  // take a tile's material once: the same spot never pays twice
  function takeOnce(x, y, obj){ var key = M.id + ':' + x + ',' + y; if (S.found[key]) return ''; S.found[key] = 1; return gainAll(obj, true); }
  // ── CORE GAMEPLAY SYSTEMS · the five-machine departure chain ──
  function coreRecipe(id){ return (CORE.recipes || []).filter(function(r){ return r.id === id; })[0]; }
  function coreStarter(id){ return (CORE.starter || []).filter(function(m){ return m.id === id; })[0]; }
  function coreMachine(id){ return !!(S.core && S.core.machines && S.core.machines[id]); }
  function coreDiscoverRecipe(id){
    if (!onHQ()) return false;
    var r = coreRecipe(id); if (!r || S.core.recipes[id]) return false;
    S.core.recipes[id] = Date.now(); hqRecord('Recovered the ' + r.name + ' from ' + r.source + '. The recipe is recorded in the Journal.'); save(); toast('RECIPE RECOVERED · ' + r.name); return true;
  }
  function coreBuiltCount(){ return (CORE.starter || []).filter(function(m){ return coreMachine(m.id); }).length; }
  function coreReady(){ return (CORE.starter || []).every(function(m){ return coreMachine(m.id); }) && S.core.oil > 0; }
  function coreHomeDistance(no){ var a = POS.nasarus, b = POS[no]; return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0; }
  function coreNavRadius(){ return (CORE.navigation.baseRadius || 2) + (S.core.machines.astranav_terminal ? CORE.navigation.upgradeStep : 0); }
  function coreOilCost(no){
    var distance = hopDist(no), outside = coreHomeDistance(no) > coreNavRadius() * 70;
    return Math.max(1, Math.ceil(distance / 70 * (outside ? CORE.oil.outOfRangeMultiplier : CORE.oil.normalPerDistance)));
  }
  function coreProduceOil(){
    if (!onHQ() || !coreMachine('fuel_generator') || (S.hq.store.fibre || 0) < 1) return false;
    S.hq.store.fibre--; S.core.oil += 1; hqRecord('Produced 1 OIL from 1 FIBRE in the FUEL GENERATOR.'); save(); toast('OIL +1 · FUEL RESERVE ' + S.core.oil); return true;
  }
  function coreBuild(id){
    var m = coreStarter(id); if (!onHQ() || !m || coreMachine(id) || !S.core.recipes[m.recipe] || !canAfford(m.cost)) return false;
    pay(m.cost); S.core.machines[id] = Date.now();
    if (id === 'rocketship_repair') { S.hq.drive = true; hqRecord('The ROCKETSHIP REPAIR STATION restored the damaged drive.'); }
    hqRecord('Built the ' + m.name + '.'); save(); toast('BUILT · ' + m.name); hqChanged('Built: ' + m.name + '.'); return true;
  }
  function deposit(quiet){
    if ((S.pack.parts || []).length && S.hq.built.stores) {
      S.pack.parts.forEach(function(no){ S.hq.parts[no] = Date.now(); delete S.exp.vault[no]; hqRecord('Brought the ' + sysOf(no).part + ' home from ' + placeName(no) + '.'); });
      if (!quiet) toast('SHIP PARTS HOME · ' + S.pack.parts.length + ' · install them at the Workshop'); S.pack.parts = []; save();
    }
    var pc = pendingCards();
    if (pc && S.hq.built.stores) {
      Object.keys(S.cards).forEach(function(id){ S.cards[id].pend = 0; });
      S.hq.store.data = (S.hq.store.data || 0) + pc * 2; hqRecord('Redeemed ' + pc + ' research card' + (pc > 1 ? 's' : '') + ' (+' + (pc * 2) + ' DATA).'); save();
      if (!quiet) toast('REDEEMED · ' + pc + ' research card' + (pc > 1 ? 's' : '') + ' · +' + (pc * 2) + ' DATA');
    }
    var n = packTotal(); if (!n || !S.hq.built.stores) return 0;
    MATS.forEach(function(m){ var k = m[0]; if (S.pack[k]) { S.hq.store[k] = (S.hq.store[k] || 0) + S.pack[k]; S.pack[k] = 0; } });
    S.flags.deposited = true; if (D.worlds.some(function(w){ return S.visited[w.no]; })) S.flags.returned = true;
    hqRecord('Deposited ' + n + ' materials in the ' + (S.hq.built.depot ? 'Resource Depot' : 'camp stores') + '.'); save();
    if (!quiet) toast('DEPOSITED · ' + n + ' materials'); return n;
  }
  function canAfford(c){ return Object.keys(c || {}).every(function(k){ return (S.hq.store[k] || 0) >= c[k]; }); }
  function pay(c){ Object.keys(c || {}).forEach(function(k){ S.hq.store[k] -= c[k]; }); }
  function missing(c){ return Object.keys(c || {}).map(function(k){ return matName(k) + ' ' + (S.hq.store[k] || 0) + '/' + c[k]; }).join(' · '); }
  function navOnline(){ return !!(S.hq.drive && S.hq.built.nav); }
  function teamMax(){ return Math.max(1, COMPANIONS.partySize || 9); }
  function flaresMax(){ return S && S.hq && S.hq.research['r-pack'] ? 4 : 2; }
  function suitDmg(n){ return Math.round(n * (S.hq.research['r-suit'] ? .65 : 1)); }
  var DRIVE_COST = { scrap:6, crystal:2 };

  // a change to the headquarters: record it, recheck the stage, redraw the camp if we are standing in it
  function hqChanged(text){
    var before = S.hq.stage || 1; if (text) hqRecord(text);
    var now = hqStage(); S.hq.stage = now; save();
    if (M && M.hq && mode === 'surface') { S.pos = { map:'nasarus', x:P.x, y:P.y, dir:P.dir }; S.fog.nasarus = fogEnc(fogArr); surface('nasarus'); }
    if (now > before) { hqRecord('STAGE ' + now + ' · ' + stageName(now) + '.'); save(); setTimeout(function(){ stageReveal(now); }, 200); }
  }
  function stageReveal(n){
    sfx.reveal(); vibrate(300, .5);
    var m = el('div', 'x-modal x-reveal', '<div class="x-modal-in x-stagecard"><p class="x-man-k">' + esc(hqName()) + '</p><h2>STAGE ' + n + '</h2><p class="x-stage-nm">' + esc(stageName(n)) + '</p>' +
      '<p class="x-mono light">' + esc({ 2:'Storage, research and navigation are running. The crash site is an expedition camp now.', 3:'More facilities stand, and some of the old buildings stand again.', 4:'Whole sections of the ancient ruins are restored. A long-term goal, reached.' }[n] || '') + '</p><button class="x-btn">CONTINUE</button></div>');
    ui.appendChild(m); var b = $('.x-btn', m); setTimeout(function(){ b.focus(); }, 40);
    b.addEventListener('click', function(){ m.remove(); });
  }
  function buildFac(id){
    var f = HQ.facilities.filter(function(x){ return x.id === id; })[0]; if (!f || f.future || S.hq.built[id]) return false;
    if (!(f.requires || []).every(hqHas) || (!f.free && !canAfford(f.cost))) return false;
    pay(f.cost); S.hq.built[id] = Date.now();
    if (id === 'camp') S.hq.built.stores = Date.now();
    sfx.reveal(); vibrate(200, .4); toast('BUILT · ' + f.name);
    hqChanged('Built: ' + f.name + '.');
    if (id === 'nav' && navOnline()) setTimeout(navOnlineBoot, 400);
    return true;
  }
  function restoreRuin(id){
    var u = HQ.ruins.filter(function(x){ return x.id === id; })[0], rs = S.hq.ruins[id];
    if (!u || !rs || rs.restored || !S.hq.built.terminal || !(u.requires || []).every(hqHas) || !canAfford(u.restore)) return false;
    pay(u.restore); rs.restored = Date.now(); gain('data', 5, true);
    sfx.reveal(); vibrate(300, .5); toast((u.dig ? 'EXCAVATED · ' : 'RESTORED · ') + u.label);
    hqChanged((u.dig ? 'Excavated: ' : 'Restored: ') + u.label + '.');
    return true;
  }
  function clearRegion(id){
    var g = HQ.regions.filter(function(x){ return x.id === id; })[0];
    if (!g || S.hq.regions.indexOf(id) >= 0 || !(g.requires || []).every(hqHas) || !canAfford(g.cost)) return false;
    pay(g.cost); S.hq.regions.push(id); sfx.reveal(); vibrate(500, .9); toast(g.name + ' · OPEN');
    hqChanged('Cleared the rockfall. ' + g.name + ' is open.');
    return true;
  }
  function study(id){
    var r = HQ.research.filter(function(x){ return x.id === id; })[0];
    if (!r || S.hq.research[id] || !S.hq.built.research || !(r.requires || []).every(hqHas) || !canAfford(r.cost)) return false;
    pay(r.cost); S.hq.research[id] = Date.now(); sfx.reveal(); toast('RESEARCH · ' + r.name);
    hqChanged('Research complete: ' + r.name + '.');
    return true;
  }
  function repairDrive(){
    if (S.core && S.core.enabled && !coreMachine('rocketship_repair')) return false;
    if (S.hq.drive || !canAfford(DRIVE_COST)) return false;
    pay(DRIVE_COST); S.hq.drive = true; sfx.reveal(); vibrate(700, 1); toast('DRIVE REPAIRED');
    hqChanged('The drive is repaired.');
    if (S.hq.built.nav) setTimeout(navOnlineBoot, 400);
    return true;
  }
  function craftFlare(){ var c = { fibre:2, scrap:1 }; if (!S.hq.built.workshop || !canAfford(c) || S.flares >= flaresMax()) return false; pay(c); S.flares++; hqRecord('Crafted a recall flare.'); save(); toast('FLARE CRAFTED · ' + S.flares + '/' + flaresMax()); return true; }
  function exchange(from, to){ if (!S.hq.built.depot || from === to || (S.hq.store[from] || 0) < 3) return false; S.hq.store[from] -= 3; S.hq.store[to] = (S.hq.store[to] || 0) + 1; save(); return true; }

  // the Navigation Center comes online: the AstraNav charts the Expanse for the first time
  async function navOnlineBoot(){
    if (!navOnline() || S.flags.charted) return;
    S.flags.charted = true;
    if (M && M.hq && P) { S.pos = { map:'nasarus', x:P.x, y:P.y, dir:P.dir }; S.fog.nasarus = fogEnc(fogArr); }
    save();
    var s = screen('x-nav x-boot', '<div class="x-nav-dev"><header class="x-nav-top"><b class="x-nav-logo">ASTRANAV</b><span class="x-nav-mk">MK.I · NAVIGATION CENTER LINK</span></header><pre class="x-crt x-bootlog"></pre></div>');
    var log = $('.x-bootlog', s);
    var lines = ['NAVIGATION CENTER · ONLINE', 'DRIVE .............. ' + (S.hq.drive ? 'REPAIRED' : 'OFFLINE'), 'STAR CATALOGUE ..... NO MATCH', 'EARTH .............. NOT FOUND', '', 'CHARTING THE BODIES IN VIEW . . .', '28 BODIES · 1 STAR · 1 SATELLITE', 'HOME BASE .......... ' + hqName(), '', coreReady() ? 'EXPEDITIONS MAY DEPART.' : 'DEPARTURE LOCKED · COMPLETE THE FIVE-MACHINE CHAIN.'];
    for (var i = 0; i < lines.length; i++) { await typeInto(log.appendChild(el('span', '')), lines[i] + '\n', 14); await wait(80); }
    await wait(700);
    nav('stars');
    toast('Choose a destination. Board your ship at the wreck to depart.');
  }

  // ── the crash, and the first page of the log ──
  function crash(){
    var s = screen('x-cockpit shake', '<div class="x-panel riv"><p class="x-plate">UNKNOWN BODY</p><p class="x-alt">ALT <b>0090000</b> FT</p><p class="x-readout">GRAVITY CAPTURE</p></div>');
    S.stage = 'crash'; S.flags.crashed = true; save(); tone(48, 3.5, 'sawtooth', .06); vibrate(2000, .7);
    var b = $('.x-alt b', s), r = $('.x-readout', s), t0 = performance.now();
    (function tick(now){
      var k = Math.min(1, (now - t0) / (reduced ? 200 : 3400));
      b.textContent = String(Math.round(90000 * Math.pow(1 - k, 1.6))).padStart(7, '0');
      r.textContent = k < .35 ? 'GRAVITY CAPTURE' : k < .7 ? 'DRIVE FAILURE' : 'BRACE FOR IMPACT';
      if (k < 1) { requestAnimationFrame(tick); return; }
      sfx.warn(); vibrate(700, 1); s.classList.add('impact');
      setTimeout(function(){
        S.at = 'nasarus'; S.landed = true; S.visited.nasarus = Date.now();
        S.pos = { map:'nasarus', x:HQ.ship.x + 2, y:HQ.ship.y + 1, dir:'down' }; S.stage = 'surface'; save();
        fade(function(){ surface('nasarus'); });
      }, reduced ? 50 : 700);
    })(t0);
  }
  async function crashIntro(){
    var crashed = !!S.flags.crashed;
    S.flags.crashIntro = 1; S.flags.tutorialPad = 1; save();
    await say(crashed ? ['You come to in the wreck. The hull is split and the drive is dead. Only the AstraNav is still glowing.',
      'Outside: grey ground under a black sky. On the horizon, shapes too regular to be rock.',
      'This world is on no chart. The log needs a name for it.']
      : ['A drifting world, scattered with ruins. Nothing on it moves.', 'A good place for a headquarters. The log needs a name for it.']);
    var nm = await naming({ title:'NAME THIS WORLD', suffix:'', def:HQ.canonicalName, max:12, world:true });
    S.hq.name = nm; hqRecord((crashed ? 'Crash landing. ' : 'First landing. ') + 'The log names this world ' + nm + '.'); save();
    surface('nasarus');
    await say([nm + '. You write it on the first page of the log.',
      'Walk with the arrows (or the stick), or tap the ground. A examines what you face. B changes your gait: STALK, STEADY or SPRINT. The touchpad opens the AstraNav.',
      crashed ? 'First, a camp: there is a staked patch of flat ground beside the wreck.' : 'Make camp on the staked ground, and this world becomes your headquarters.',
      'The drive is dead and there is no established base. Recover the recipe papers on NASARUS, build the five starter machines, turn FIBRE into OIL, and only then risk the first departure.']);
  }

  // ── NASARUS in the field: plots, facilities, ruins, rubble, wreckage, the ship ──
  async function hqUse(s){
    deposit(true); hudRefresh();
    if (s.kind === 'plot') {
      var f = s.ref;
      if (f.future) { await say(['A plot marked out for the ' + f.name + '. ' + f.does, '(A future expansion. Not yet available.)']); return; }
      if (f.id === 'camp') {
        var a0 = await say([S.flags.crashed ? 'A patch of flat ground beside the wreck. Pitch the shelter and stack what you salvage beside it?' : 'Pitch a shelter here and make this world your headquarters?'], ['MAKE CAMP', 'NOT YET']);
        if (a0 === 0 && buildFac('camp')) await say(['The shelter is up and the stores are stacked. Rest at the CAMP SHELTER; anything you carry goes into the CAMP STORES.',
          S.hq.drive ? 'The ruins are waiting.' : 'The drive needs SCRAP and CRYSTAL. Search the wreckage, the outcrops, and the ruins on the horizon.']);
        return;
      }
      if (!canAfford(f.cost)) { await say(['A plot for the ' + f.name + '. ' + f.does, 'Needs ' + costText(f.cost) + '. In the stores: ' + missing(f.cost) + '.']); return; }
      var a = await say(['A plot for the ' + f.name + '. ' + f.does, 'Build it for ' + costText(f.cost) + '?'], ['BUILD', 'LATER']);
      if (a === 0) buildFac(f.id);
      return;
    }
    if (s.kind === 'fac') {
      var id = s.id;
      if (id === 'camp') return rest();
      if (id === 'nav') { if (navOnline() && !S.flags.charted) return navOnlineBoot(); return openNav('stars'); }
      return openNav({ stores:'hq', depot:'hq', research:'hq', workshop:'hq', archive:'companions', terminal:'hq', history:'hq' }[id] || 'hq',
        { research:'research', workshop:'workshop', terminal:'restore', history:'history', stores:'mats', depot:'mats' }[id]);
    }
    if (s.kind === 'ruin') return hqRuin(s.ref);
  }
  async function hqRuin(u){
    var rs = S.hq.ruins[u.id];
    if (!rs) {
      S.hq.ruins[u.id] = { found:Date.now() };
      var got = gainAll(u.found, true); sfx.reveal(); vibrate(120, .4);
      hqChanged('Surveyed: ' + u.label + ' (' + u.cat + ').');
      await say([u.survey, 'SURVEYED · ' + u.label + ' · ' + u.cat.toUpperCase() + (got ? '. Recovered: ' + got + '.' : '.')].concat(u.dig ? ['Something lies buried here. A Restoration Terminal could manage an excavation.'] : []));
      return;
    }
    if (rs.restored) { await say([u.label + (u.dig ? ' · excavated.' : ' · restored.'), HQ.recordNote]); return; }
    if (!S.hq.built.terminal) { await say([u.survey, (u.dig ? 'Excavating' : 'Restoring') + ' it needs a RESTORATION TERMINAL at camp.']); return; }
    if (!(u.requires || []).every(hqHas)) { await say([u.survey, 'Restoring it needs research first: ' + reqText(u.requires) + '.']); return; }
    if (!canAfford(u.restore)) { await say([u.label + '. ' + (u.dig ? 'Excavation' : 'Restoration') + ' needs ' + costText(u.restore) + '. In the stores: ' + missing(u.restore) + '.']); return; }
    var a = await say([u.label + '. ' + (u.dig ? 'Excavate' : 'Restore') + ' it for ' + costText(u.restore) + '?'], [u.dig ? 'EXCAVATE' : 'RESTORE', 'LATER']);
    if (a === 0) restoreRuin(u.id);
  }
  async function hqRubble(){
    var g = HQ.regions[0]; deposit(true);
    if (!S.hq.built.workshop) { await say(['A rockfall blocks the way east. Beyond it, ' + g.name.toLowerCase() + '.', 'Clearing it needs tools from a WORKSHOP.']); return; }
    if (!canAfford(g.cost)) { await say(['Clearing the rockfall needs ' + costText(g.cost) + '. In the stores: ' + missing(g.cost) + '.']); return; }
    var a = await say(['Clear the rockfall for ' + costText(g.cost) + '?'], ['CLEAR IT', 'LATER']);
    if (a === 0) clearRegion(g.id);
  }
  async function hqShip(){
    deposit(true); hudRefresh();
    if (!S.hq.built.camp) { await say(['The wreck of your ship. The drive is dead, and there is nowhere yet to keep salvage.', 'Make camp first, on the staked ground beside the wreck.']); return; }
    if (!S.hq.drive) {
      if (S.core.enabled && !coreMachine('rocketship_repair')) { await say(['The drive is dead. The hand tools are not enough for this repair.', 'Recover the ROCKETSHIP REPAIR STATION paper, build the station, and let the machine restore the ship.']); return; }
      if (!canAfford(DRIVE_COST)) { await say(['The drive is dead. Repairing it needs ' + costText(DRIVE_COST) + '.', 'In the stores: ' + missing(DRIVE_COST) + '. Salvage the wreckage, and look for crystal outcrops.']); return; }
      var a = await say(['Repair the drive for ' + costText(DRIVE_COST) + '?'], ['REPAIR', 'LATER']);
      if (a === 0 && repairDrive() && !S.hq.built.nav) await say(['The drive turns over. Now it needs a course: build a NAVIGATION CENTER at camp.']);
      return;
    }
    return boardShip();
  }
  async function hqPick(ch, x, y){
    var got = takeOnce(x, y, ch === 'w' ? { scrap:1 + ((x * 3 + y) % 3 === 0 ? 1 : 0) } : ch === 'A' ? { crystal:2 } : { fibre:1 });
    M.set(x, y, '.'); sfx.click(); vibrate(60, .3); hudRefresh();
    await say([(ch === 'w' ? 'Wreckage from the crash. Twisted, but useful.' : ch === 'A' ? 'A crystal outcrop. You break off what you can carry.' : 'Grey scrub with tough, stringy fibre.') + (got ? ' (' + got + ')' : '')]);
  }
  async function rest(){
    S.suit = 100; refillAir(); S.flares = Math.max(S.flares, flaresMax()); healTeam(); save(); hudRefresh(); sfx.meet();
    await say(['You rest in the shelter. SUIT and AIR refilled, flares restocked, your Aethren party rested. The expedition is saved.']);
  }

  // ── AstraNav · the headquarters page ──
  var xFrom = 'scrap', xTo = 'crystal';
  function navHQ(body, sec){
    var h = S.hq, at = onHQ(), stg = hqStage(), next = HQ.stages[stg];
    var html = '<section class="x-arc riv x-hqhead" id="hq-top"><h3>' + esc(hqName()) + ' <b>STAGE ' + stg + ' · ' + esc(stageName(stg)) + '</b></h3>' +
      '<div class="x-stages">' + HQ.stages.map(function(s2){ return '<span class="' + (s2.n <= stg ? 'on' : '') + (s2.future ? ' fut' : '') + '"><b>' + s2.n + '</b><i>' + esc(s2.name) + '</i></span>'; }).join('') + '</div>' +
      (next && !next.future ? '<p class="x-mono light">NEXT · STAGE ' + next.n + (next.longTerm ? ' (LONG-TERM)' : '') + ' · ' + esc(next.needs.map(needLabel).join(' · ')) + '</p>' :
        '') +
      (h.name !== HQ.canonicalName ? '<p class="x-mono dim">Canon name: ' + HQ.canonicalName + '. Your name for it: ' + esc(h.name) + '.</p>' : '') +
      (at ? '' : '<p class="x-crt">AWAY FROM ' + esc(hqName()) + ' · return to deposit, build and restore</p>') + '</section>';
    html += '<section class="x-arc riv" id="hq-ship"><h3>THE WAY HOME <b>SHIP ' + shipPct() + '%</b></h3>' +
      '<p class="x-mono light">The ship is too damaged to reach hyperspace. Every world holds one sealed vault with one part. Find the world’s clue, beat its warden or guardian, and bring the part home. A perfect ship needs every world.</p>' +
      '<i class="x-shipbar"><i style="width:' + shipPct() + '%"></i></i><ul class="x-hqlist">' +
      EXP.ship.systems.map(function(sy){
        var need = sysNeed(sy.id), done = sysDone(sy.id), ready = Object.keys(h.parts).filter(function(w){ return sysOf(+w).id === sy.id; });
        var act = done >= need ? '<em class="ok">RESTORED</em>' : '<em>' + done + ' / ' + need + '</em>' +
          ready.map(function(w){ return at && h.built.workshop ? '<button class="x-btn small" data-i="' + w + '"' + (canAfford(sy.cost) ? '' : ' disabled') + '>INSTALL · ' + esc(placeName(+w)) + '</button>' : '<em class="dim">' + esc(sy.part) + ' READY</em>'; }).join('');
        return '<li class="' + (done >= need ? 'done' : '') + '"><b>' + esc(sy.name) + '</b><span>' + esc(sy.part) + ' × ' + need + ' · each installs for ' + costText(sy.cost) + (h.built.workshop ? '' : ' · needs the WORKSHOP') + '</span><div>' + act + '</div></li>';
      }).join('') + '</ul>' + (shipPct() >= 100 ? '<p class="x-crt">' + esc(EXP.ship.done) + '</p>' : '') + '</section>';
    var resN = Object.keys(h.residents).length, setN = Object.keys(h.settled).length;
    html += '<section class="x-arc riv" id="hq-pop"><h3>THE PEOPLE OF ' + esc(hqName()) + ' <b>' + resN + ' GROUPS · ' + setN + ' SPECIES</b></h3>' +
      '<p class="x-mono light">' + (h.built.habitation ? 'Refugees you rescue from war regions live at the Habitation Zone.' : 'Build the HABITATION ZONE to take in refugees from war regions on other worlds.') + '</p>' +
      (resN ? '<ul class="x-hqlist">' + Object.keys(h.residents).map(function(no){ var pe = FAUNA.peoples[+no] || {}; return '<li class="done"><b>' + esc(known(WORLD[+no].term) && pe.race ? pe.race : 'REFUGEES') + '</b><span>From ' + esc(placeName(+no)) + '. They live on ' + esc(hqName()) + ' now.</span><div></div></li>'; }).join('') + '</ul>' : '') +
      (h.built.sanctuary ? '<p class="x-mono light">AETHREN SANCTUARY · settle a species from a spare copy (2 or more of the card).</p><ul class="x-hqlist">' +
        aethrenCards().filter(function(id){ return h.settled[id] || (S.cards[id].qty >= 2); }).map(function(id){
          return '<li class="' + (h.settled[id] ? 'done' : '') + '"><b>' + esc(subjName(id)) + '</b><span>' + (h.settled[id] ? 'Lives on ' + esc(hqName()) + '.' : 'You hold ' + S.cards[id].qty + ' copies.') + '</span><div>' +
            (h.settled[id] ? '<em class="ok">SETTLED</em>' : at ? '<button class="x-btn small" data-settle="' + id + '">SETTLE</button>' : '<em class="dim">AT ' + esc(hqName()) + '</em>') + '</div></li>';
        }).join('') + '</ul>' : '<p class="x-mono light">Build the AETHREN SANCTUARY to settle Aethren on ' + esc(hqName()) + '.</p>') + '</section>';
    html += '<section class="x-arc riv" id="hq-mats"><h3>MATERIALS <b>PACK ' + packTotal() + '</b></h3><table class="x-mats"><tr><th></th><th>PACK</th><th>STORES</th></tr>' +
      MATS.map(function(m){ return '<tr><td><b>' + m[1] + '</b><small>' + esc(m[2]) + '</small></td><td>' + (S.pack[m[0]] || 0) + '</td><td>' + (h.store[m[0]] || 0) + '</td></tr>'; }).join('') + '</table>' +
      '<div class="x-sh-btns">' + (at && h.built.stores ? '<button class="x-btn" data-h="deposit"' + (packTotal() ? '' : ' disabled') + '>DEPOSIT PACK</button>' : '') +
      (at && h.built.depot ? '<span class="x-xch">EXCHANGE <button class="x-btn ghost small" data-h="xfrom">' + matName(xFrom) + ' ×3</button> → <button class="x-btn ghost small" data-h="xto">' + matName(xTo) + ' ×1</button><button class="x-btn small" data-h="xgo">TRADE</button></span>' : '') + '</div></section>';
    html += '<section class="x-arc riv" id="hq-core"><h3>CORE SYSTEMS <b>' + coreBuiltCount() + '/' + CORE.starter.length + ' STARTER MACHINES · OIL ' + (S.core.oil || 0) + '</b></h3>' +
      '<p class="x-mono light">NASARUS carries the opening departure sequence. Recover each physical recipe paper, build the machine, then produce OIL from FIBRE in the FUEL GENERATOR.</p>' +
      '<ul class="x-hqlist">' + CORE.starter.map(function(m){
        var built=coreMachine(m.id), learned=!!S.core.recipes[m.recipe], r=coreRecipe(m.recipe), can=learned && canAfford(m.cost);
        return '<li class="' + (built ? 'done' : '') + '"><b>' + esc(m.name) + '</b><span>' + esc(m.does) + ' · ' + (built ? 'operational' : learned ? costText(m.cost) : 'recipe paper not recovered') + '</span><div>' +
          (built ? '<em class="ok">BUILT</em>' : (!learned ? '<button class="x-btn small" data-core-recipe="' + m.recipe + '">RECOVER PAPER</button>' : '<button class="x-btn small" data-core-build="' + m.id + '"' + (can ? '' : ' disabled') + '>BUILD</button>')) + '</div></li>';
      }).join('') +
      (coreMachine('fuel_generator') ? '<li><b>FUEL RESERVE</b><span>FIBRE → FUEL GENERATOR → OIL · safe navigation radius ' + coreNavRadius() + '</span><div><em>FIBRE 1</em><button class="x-btn small" data-core-oil="1"' + ((h.store.fibre || 0) ? '' : ' disabled') + '>PRODUCE OIL</button></div></li>' : '') +
      '</ul></section>';
    html += '<section class="x-arc riv" id="hq-fac"><h3>FACILITIES</h3><ul class="x-hqlist">' +
      '<li class="' + (h.drive ? 'done' : '') + '"><b>THE DRIVE</b><span>Your ship’s drive, repaired at the wreck.</span><div>' + (h.drive ? '<em class="ok">REPAIRED</em>' : '<em>' + costText(DRIVE_COST) + '</em><em class="dim">AT THE WRECK</em>') + '</div></li>' +
      HQ.facilities.map(function(f){
        var b = h.built[f.id], req = (f.requires || []).filter(function(k){ return !hqHas(k); }), act;
        if (b) act = '<em class="ok">BUILT</em>';
        else if (f.future) act = '<em class="dim">FUTURE EXPANSION</em>';
        else if (req.length) act = '<em class="dim">NEEDS ' + esc(reqText(f.requires)) + '</em>';
        else if (f.free) act = '<em class="dim">AT THE STAKED PLOT</em>';
        else act = '<em>' + costText(f.cost) + '</em>' + (at ? '<button class="x-btn small" data-b="' + f.id + '"' + (canAfford(f.cost) ? '' : ' disabled') + '>BUILD</button>' : '');
        return '<li class="' + (b ? 'done' : '') + '"><b>' + esc(f.name) + '</b><span>' + esc(f.does) + '</span><div>' + act + '</div></li>';
      }).join('') + '</ul></section>';
    if (h.built.research) html += '<section class="x-arc riv" id="hq-research"><h3>RESEARCH STATION</h3><ul class="x-hqlist">' + HQ.research.map(function(r){
      var done = h.research[r.id], req = (r.requires || []).filter(function(k){ return !hqHas(k); });
      return '<li class="' + (done ? 'done' : '') + '"><b>' + esc(r.name) + '</b><span>' + esc(r.effect) + '</span><div>' + (done ? '<em class="ok">DONE</em>' : req.length ? '<em class="dim">NEEDS ' + esc(reqText(r.requires)) + '</em>' :
        '<em>' + costText(r.cost) + '</em>' + (at ? '<button class="x-btn small" data-r="' + r.id + '"' + (canAfford(r.cost) ? '' : ' disabled') + '>RESEARCH</button>' : '')) + '</div></li>';
    }).join('') + '</ul></section>';
    if (h.built.workshop) {
      var g = HQ.regions[0], open = h.regions.indexOf(g.id) >= 0;
      html += '<section class="x-arc riv" id="hq-workshop"><h3>WORKSHOP</h3><ul class="x-hqlist">' +
        (HQ.airTanks || []).map(function(t){
          var have = (h.equip || {})[t.id], req = (t.requires || []).filter(function(k){ return !hqHas(k); }), act;
          if (have) act = '<em class="ok">FITTED</em>';
          else if (req.length) act = '<em class="dim">NEEDS ' + esc(reqText(t.requires)) + '</em>';
          else act = '<em>' + costText(t.cost) + '</em>' + (at ? '<button class="x-btn small" data-w="' + t.id + '"' + (canAfford(t.cost) ? '' : ' disabled') + '>FIT</button>' : '');
          return '<li class="' + (have ? 'done' : '') + '"><b>' + esc(t.name) + ' · ' + t.cap + ' AIR</b><span>' + esc(t.does) + '</span><div>' + act + '</div></li>';
        }).join('') +
        '<li><b>RECALL FLARE</b><span>Craft a flare. You carry ' + S.flares + ' of ' + flaresMax() + '.</span><div><em>FIBRE 2 · SCRAP 1</em>' + (at ? '<button class="x-btn small" data-w="flare"' + (canAfford({ fibre:2, scrap:1 }) && S.flares < flaresMax() ? '' : ' disabled') + '>CRAFT</button>' : '') + '</div></li>' +
        '<li class="' + (open ? 'done' : '') + '"><b>' + esc(g.name) + '</b><span>' + esc(g.does) + '</span><div>' + (open ? '<em class="ok">OPEN</em>' : '<em>' + costText(g.cost) + '</em>' + (at ? '<button class="x-btn small" data-w="clear"' + (canAfford(g.cost) ? '' : ' disabled') + '>CLEAR</button>' : '')) + '</div></li></ul></section>';
    }
    html += '<section class="x-arc riv" id="hq-restore"><h3>' + (h.built.terminal ? 'RESTORATION TERMINAL' : 'THE RUINS') + ' <b>' + Object.keys(h.ruins).length + '/' + HQ.ruins.length + ' SURVEYED · ' + hqRestored() + ' RESTORED</b></h3><ul class="x-hqlist">' + HQ.ruins.map(function(u){
      var rs = h.ruins[u.id];
      if (!rs) return '<li><b>? · UNSURVEYED SITE</b><span>' + (h.research['r-survey'] ? esc(u.cat) + (u.region ? ' · beyond the rockfall' : '') : 'Somewhere on ' + esc(hqName()) + '.') + '</span><div></div></li>';
      var act;
      if (rs.restored) act = '<em class="ok">' + (u.dig ? 'EXCAVATED' : 'RESTORED') + '</em>';
      else if (!h.built.terminal) act = '<em class="dim">NEEDS RESTORATION TERMINAL</em>';
      else if (!(u.requires || []).every(hqHas)) act = '<em class="dim">NEEDS ' + esc(reqText(u.requires)) + '</em>';
      else act = '<em>' + costText(u.restore) + '</em>' + (at ? '<button class="x-btn small" data-u="' + u.id + '"' + (canAfford(u.restore) ? '' : ' disabled') + '>' + (u.dig ? 'EXCAVATE' : 'RESTORE') + '</button>' : '');
      return '<li class="' + (rs.restored ? 'done' : '') + '"><b>' + esc(u.label) + '</b><span>' + esc(u.cat) + ' · ' + esc(u.survey) + '</span><div>' + act + '</div></li>';
    }).join('') + '</ul></section>';
    if (h.built.history) html += '<section class="x-arc riv" id="hq-history"><h3>HISTORICAL ARCHIVE</h3><p class="x-mono light">Haemen and Aethren lived on ' + HQ.canonicalName + ' before the First Eternal War. Why it was abandoned is not known.</p><ul class="x-hqlist">' +
      HQ.ruins.filter(function(u){ return h.ruins[u.id]; }).map(function(u){ return '<li class="done"><b>' + esc(u.label) + '</b><span>' + esc(u.cat.toUpperCase()) + '</span><em>' + esc(u.survey) + ' ' + esc(HQ.recordNote) + '</em></li>'; }).join('') + '</ul></section>';
    html += '<section class="x-arc riv" id="hq-records"><h3>RESTORATION RECORDS</h3><ol class="x-records">' + h.records.slice().reverse().map(function(r){ return '<li>' + esc(r.text) + '</li>'; }).join('') + '</ol></section>';
    body.innerHTML = html;
    var hqOpen = sec ? 'hq-' + sec : 'hq-top';
    Array.prototype.slice.call(body.querySelectorAll('section.x-arc[id^="hq-"]')).forEach(function(section){
      var heading = section.querySelector(':scope > h3');
      if (!heading) return;
      var details = el('details', 'x-subsection x-arc riv');
      details.id = section.id;
      details.open = section.id === hqOpen;
      var summary = el('summary', '', heading.innerHTML);
      details.appendChild(summary);
      heading.remove();
      while (section.firstChild) details.appendChild(section.firstChild);
      section.replaceWith(details);
    });
    if (sec) { var t = $('#hq-' + sec, body); if (t) setTimeout(function(){ try { t.scrollIntoView({ block:'start' }); } catch(e){} }, 30); }
    body.onclick = function(e){
      var b = e.target.closest('button'); if (!b || b.disabled) return;
      var d = b.dataset, keep = sec, ok = true;
      if (d.coreRecipe) { ok = coreDiscoverRecipe(d.coreRecipe); keep = 'core'; }
      else if (d.coreBuild) { ok = coreBuild(d.coreBuild); keep = 'core'; }
      else if (d.coreOil) { ok = coreProduceOil(); keep = 'core'; }
      else if (d.h === 'deposit') { deposit(); keep = 'mats'; }
      else if (d.h === 'xfrom') { xFrom = MATS[(MATS.map(function(m){ return m[0]; }).indexOf(xFrom) + 1) % MATS.length][0]; keep = 'mats'; }
      else if (d.h === 'xto') { xTo = MATS[(MATS.map(function(m){ return m[0]; }).indexOf(xTo) + 1) % MATS.length][0]; keep = 'mats'; }
      else if (d.h === 'xgo') { ok = exchange(xFrom, xTo); keep = 'mats'; }
      else if (d.b) { ok = buildFac(d.b); keep = 'fac'; }
      else if (d.r) { ok = study(d.r); keep = 'research'; }
      else if (d.u) { ok = restoreRuin(d.u); keep = 'restore'; }
      else if (d.w === 'flare') { ok = craftFlare(); keep = 'workshop'; }
      else if (d.w === 'clear') { ok = clearRegion('basin'); keep = 'workshop'; }
      else if (/^tank/.test(d.w)) { ok = buildTank(d.w); keep = 'workshop'; }
      else if (d.i) { ok = installPart(+d.i); keep = 'ship'; }
      else if (d.settle) { ok = settleAethren(d.settle); keep = 'pop'; }
      else return;
      if (!ok) { toast('Not possible yet: check the stores and requirements', 'red'); sfx.bump(); }
      else sfx.click();
      setTimeout(function(){ if (doc.querySelector('.x-nav-hq')) nav('hq', keep); }, 30);
    };
  }

  // ═════════════════════════ CANVAS LOOP ═════════════════════════
  var raf = 0, mode = null, last = 0;
  var DPR = Math.min(2, window.devicePixelRatio || 1);
  function resize(){
    DPR = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(innerWidth * DPR); cv.height = Math.round(innerHeight * DPR);
    cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
  }
  addEventListener('resize', resize); resize();
  function startWorld(m){ mode = m; cv.classList.add('on'); cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(loop); }
  function stopWorld(){ mode = null; cancelAnimationFrame(raf); cv.classList.remove('on'); cv.style.filter = ''; }
  function loop(now){
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (mode === 'hyper') drawHyper(now);
    else if (mode === 'surface') { updateSurface(dt, now); if (mode === 'surface') drawSurface(now); }
    if (mode) raf = requestAnimationFrame(loop);
  }
  function rng(seed){ return function(){ seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

  // ── hyperspace ──
  var streaks = null;
  function drawHyper(now){
    var w = cv.width, h = cv.height;
    if (!streaks) { var r = rng(7); streaks = []; for (var i = 0; i < 260; i++) streaks.push({ a:r()*Math.PI*2, d:r(), s:.3 + r()*1.2 }); }
    ctx.fillStyle = 'rgba(4,3,10,.35)'; ctx.fillRect(0, 0, w, h);
    var cx = w/2, cy = h/2, t = (now % 100000) / 1000, R = Math.hypot(w, h) / 2;
    ctx.lineWidth = 2 * DPR;
    streaks.forEach(function(p){
      var d = (p.d + t * p.s * .55) % 1, r1 = d * d * R, r2 = r1 + 60 * DPR * d * p.s;
      ctx.strokeStyle = 'rgba(' + (180 + 60*p.s|0) + ',' + (190 + 40*d|0) + ',255,' + d + ')';
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(p.a)*r1, cy + Math.sin(p.a)*r1); ctx.lineTo(cx + Math.cos(p.a)*r2, cy + Math.sin(p.a)*r2); ctx.stroke();
    });
  }

  // ═════════════════════════ SURFACE · the open worlds ═════════════════════════
  var T = 16, M = null, P = null, critters = [], npcs = [], fogArr = null, dialogOpen = false, encounterOpen = false, held = null, path = [], zoneId = null;
  var DIRS = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
  var SOLID = GEN.SOLID;

  function at(x, y){ return M.at(x, y); }
  function critterAt(x, y){ for (var i = 0; i < critters.length; i++) if (critters[i].x === x && critters[i].y === y) return critters[i]; return null; }
  function npcAt(x, y){ for (var i = 0; i < npcs.length; i++) if (npcs[i].x === x && npcs[i].y === y) return npcs[i]; return null; }
  function blocked(x, y, who){
    var ch = at(x, y);
    if (who && who.swims && ch === '~') return !!critterAt(x, y);
    if (who && who.flies) return ch === '#' || x <= 0 || y <= 0 || x >= M.W - 1 || y >= M.H - 1 || !!critterAt(x, y) || !!npcAt(x, y) || (P && P.x === x && P.y === y);
    if (SOLID[ch]) return true;
    if (critterAt(x, y) || npcAt(x, y)) return true;
    if (who !== P && P && P.x === x && P.y === y) return true;
    return false;
  }
  function shadow(X, Y, z, w){ ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(Math.round(X - w * z / 2), Math.round(Y - 2 * z), w * z, 2 * z); }

  // fog of war, saved compactly (run lengths)
  function fogEnc(a){ var out = [], cur = 0, run = 0; for (var i = 0; i < a.length; i++) { if (a[i] === cur) run++; else { out.push(run.toString(36)); cur ^= 1; run = 1; } } out.push(run.toString(36)); return out.join('.'); }
  function fogDec(s, n){ var a = new Uint8Array(n); if (!s) return a; var cur = 0, i = 0; s.split('.').forEach(function(r){ var k = parseInt(r, 36); for (var j = 0; j < k && i < n; j++) a[i++] = cur; cur ^= 1; }); return a; }

  function worldNo(){ return M.world; }
  function zoneOf(x, y){ var d = GEN.zoneAt(M, x, y); return d ? d.id : null; }
  function surface(mapId){
    M = buildMap(mapId);
    if (!M) { ship(); return; }
    specCache = {};
    S.stage = 'surface'; S.landed = true; if (M.world) S.at = M.world;
    var start = S.pos && S.pos.map === mapId ? S.pos : { x:M.ship ? M.ship.x : 1, y:M.ship ? M.ship.y + 1 : 1, dir:'down' };
    if (SOLID[at(start.x, start.y)]) start = { x:M.ship.x, y:M.ship.y + 1, dir:'down' };
    P = { x:start.x, y:start.y, fx:start.x, fy:start.y, dir:start.dir || 'down', t:0, moving:false, gait:S.gait || 'steady', dust:[], anim:0 };
    critters = M.spawns.map(function(sp){
      var s = SP[sp.id] || {};
      return { id:sp.id, lv:sp.lv, x:sp.x, y:sp.y, fx:sp.x, fy:sp.y, fromX:sp.x, fromY:sp.y, t:1, home:{ x:sp.x, y:sp.y }, dir:'down', cool:Math.random() * 2,
               swims:sp.id === 'otterlin' || s.body === 'amph', flies:s.body === 'wing', state:'idle', anim:0, calm:sp.resident ? 1e9 : 0,
               guardian:!!sp.guardian, resident:!!sp.resident };
    });
    npcs = M.npcs.filter(function(n){
      var no = M.world;
      if (n.warden && S.exp.beaten[no]) return false;               // a beaten warden does not come back
      if (n.refugee && S.hq.residents[no]) return false;             // rescued: they live on NASARUS now
      return true;
    }).map(function(n){ return Object.assign({}, n); });
    critters = critters.filter(function(c){ return !(c.guardian && S.exp.beaten[M.world]); });
    fogArr = fogDec(S.fog[mapId], M.W * M.H);
    if (M.hq && S.hq.research['r-survey']) fogArr.fill(1);
    dialogOpen = false; encounterOpen = false; path = []; held = null; dlg = null; zoneId = null;
    screen('x-surface',
      '<div class="x-hud riv"><div class="x-zone"><b class="x-zn"></b><span class="x-zw"></span></div>' +
        '<div class="x-gauges">' + gauge('SUIT','suit') + gauge('AIR','air') + '</div>' +
        '<div class="x-counts"><span class="x-lead" title="Lead card"></span></div>' +
        '<button class="x-menu" aria-label="Open the AstraNav">NAV</button></div>' +
      '<p class="x-objhint" aria-live="polite"></p>' +
      '<p class="x-padhint" aria-hidden="true">✕ EXAMINE · ○ GAIT · □ SCAN · TOUCHPAD ASTRANAV</p>' +
      '<div class="x-pad" aria-label="Direction pad"><button data-d="up" aria-label="Up">▲</button><button data-d="left" aria-label="Left">◀</button><button data-d="right" aria-label="Right">▶</button><button data-d="down" aria-label="Down">▼</button></div>' +
      '<div class="x-ab"><button class="x-b" aria-label="B: back, or change gait">B<small>STEADY</small></button><button class="x-a" aria-label="A: examine">A<small>EXAMINE</small></button></div>' +
      '<div class="x-dialog" hidden><p class="x-dtext"></p><div class="x-dchoices"></div><span class="x-dmore">▼</span></div>');
    bindSurfaceUI();
    startWorld('surface');
    hudRefresh();
    revealFog();
    checkZone(true);
    save();
    if (M.hq && !S.flags.crashIntro) { setTimeout(crashIntro, 300); return; }
    if (M.vault && !M.hq && (hasClue(M.world) || perk('sense')) && !S.hq.installed[M.world] && !S.hq.parts[M.world] && !S.exp.vault[M.world])
      setTimeout(function(){ toast((hasClue(M.world) ? 'THE CLUE' : 'VAULT SENSE') + ' · the sealed vault lies ' + compass(M.vault.x - P.x, M.vault.y - P.y)); }, 1600);
    if (S.flags.hqNew) { S.flags.hqNew = false; save(); setTimeout(function(){ toast('A new body on the AstraNav: a drifting world with ruins. Set course for ' + hqName() + ' to make your headquarters.'); }, 800); }
    if (!S.flags.tutorialPad) { S.flags.tutorialPad = 1; save(); say(['Walk with the arrows (or the stick), or tap the ground to walk there.', 'A examines whatever you face: plants, stones, people, creatures. B changes your gait: STALK (slow and quiet), STEADY or SPRINT (fast and loud).', 'The touchpad opens the AstraNav: the star map, your cards, the Codex and everything else.']); }
  }
  function gauge(label, id){
    return '<div class="x-g" data-g="' + id + '"><svg viewBox="0 0 60 40" aria-hidden="true"><path d="M6 36 A24 24 0 0 1 54 36" class="x-arc"/><path d="M6 36 A24 24 0 0 1 14 18" class="x-arc red"/>' +
      '<line x1="30" y1="36" x2="30" y2="15" class="x-needle"/><circle cx="30" cy="36" r="3"/></svg><span>' + label + '</span></div>';
  }
  function zoneName(){
    if (M.hq) return hqName();
    if (M.indoor) return term(M.location);
    if (M.world === 9) return term(zoneId || 'malezor');
    return term(WORLD[M.world].term) + (zoneId && M.districts ? ' · ' + zoneLabel(zoneId) : '');
  }
  function hudRefresh(){
    var zn = $('.x-zn'); if (!zn || !M) return;
    zn.textContent = zoneName();
    $('.x-zw').textContent = M.hq ? 'HEADQUARTERS · STAGE ' + hqStage() + ' · PACK ' + packTotal() : M.world === 9 ? term('zyraxis') : M.indoor ? term(M.name) : setName(M.world).replace(/ — .*/, '') + ' · PACK ' + packTotal();
    var oh = $('.x-objhint'); if (oh) { var nx = objectives().filter(function(o){ return !o.done && !o.main; })[0]; oh.textContent = nx ? '▸ ' + nx.t : ''; }
    [['suit', S.suit], ['air', airPct()]].forEach(function(g){
      var n = $('[data-g="' + g[0] + '"] .x-needle'); if (n) n.style.transform = 'rotate(' + (-80 + clamp(g[1], 0, 100) / 100 * 160) + 'deg)';
      var box = $('[data-g="' + g[0] + '"]'); if (box) box.classList.toggle('low', g[1] < 25);
    });
    var lead = $('.x-lead'), team = teamReady();
    if (lead) lead.innerHTML = team.length ? '<img class="x-pix" alt="" src="' + ART.url(subjArt(team[0]), 2) + '"><b>LV ' + S.cards[team[0]].lv + '</b>' : '';
    var b = $('.x-b small'); if (b) b.textContent = GAIT[P.gait].label;
    var bb = $('.x-b'); if (bb) { bb.classList.toggle('on', P.gait !== 'steady'); bb.dataset.gait = P.gait; }
  }
  // a zone's name: a Zyraxis district by its lexicon term; a world's region by name once you know the world's words
  function zoneLabel(id){
    var d = (M.districts || []).filter(function(x){ return x.id === id; })[0];
    if (!d || !d.name) return term(id);
    return worldLearned(M.world) ? d.name.toUpperCase() : 'REGION ' + ['I','II','III','IV','V','VI','VII','VIII','IX','X'][d.i];
  }
  function checkZone(quiet){
    if (!M || M.indoor || !M.districts) return;
    var z = zoneOf(P.x, P.y); if (!z || z === zoneId) return;
    zoneId = z;
    if (!quiet) { toast('ENTERING · ' + zoneLabel(z)); sfx.meet(); }
    if (!S.seen[z]) { S.seen[z] = Date.now(); save(); }
    hudRefresh();
  }

  function bindSurfaceUI(){
    var pad = $('.x-pad');
    function release(){ held = null; }
    $$('button', pad).forEach(function(b){
      b.addEventListener('pointerdown', function(e){ e.preventDefault(); held = b.dataset.d; path = []; try { b.setPointerCapture(e.pointerId); } catch(err){} });
      b.addEventListener('pointerup', release); b.addEventListener('pointercancel', release); b.addEventListener('lostpointercapture', release);
    });
    $('.x-a').addEventListener('click', btnA);
    $('.x-b').addEventListener('click', btnB);
    // AstraNav controller access is reserved for the DualSense touchpad.
    $('.x-dialog').addEventListener('click', function(e){ if (!e.target.closest('[data-c]')) advanceDialog(); });
  }
  // tap the ground: walk there; tap a thing: walk next to it, face it, examine it
  var tapStart = null;
  cv.addEventListener('pointerdown', function(e){
    if (mode !== 'surface' || dialogOpen || encounterOpen) return;
    tapStart = { x:e.clientX, y:e.clientY };
  });
  cv.addEventListener('pointermove', function(e){

  });
  cv.addEventListener('pointerup', function(e){
    if (mode !== 'surface' || !tapStart || dialogOpen || encounterOpen) { tapStart = null; return; }
    if (Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y) > 20) { tapStart = null; return; }
    tapStart = null;
    var t = screenToTile(e.clientX, e.clientY);
    walkTo(t.x, t.y);
  });

  // pocket style: whole-number pixel scaling only, so every pixel stays crisp. Landscape shows 15 × 9 tiles or more.
  function zoom(){ return Math.max(2, Math.floor(Math.min(cv.width / (15 * T), cv.height / (9 * T)))); }
  function screenToTile(sx, sy){
    var z = zoom();
    return { x:Math.floor(P.fx + .5 + (sx * DPR - cv.width / 2) / (T * z)), y:Math.floor(P.fy + .5 + (sy * DPR - cv.height / 2) / (T * z)) };
  }
  function walkTo(tx, ty){
    if (tx === P.x && ty === P.y) return;
    var target = { x:tx, y:ty }, interact = blocked(tx, ty, P) || !!critterAt(tx, ty);
    var W = M.W, prev = new Int32Array(W * M.H).fill(-1), q = [P.y * W + P.x], qi = 0, seen = new Uint8Array(W * M.H); seen[q[0]] = 1;
    var goal = -1, startI = q[0];
    if (interact && Math.abs(P.x - tx) + Math.abs(P.y - ty) === 1) goal = startI;
    while (goal < 0 && qi < q.length && qi < 6000) {
      var c = q[qi++], cx = c % W, cy = (c / W) | 0;
      if (interact ? (Math.abs(cx - tx) + Math.abs(cy - ty) === 1) : (cx === tx && cy === ty)) { goal = c; break; }
      for (var k = 0; k < 4; k++) {
        var d = [[0,-1],[0,1],[-1,0],[1,0]][k], nx = cx + d[0], ny = cy + d[1], ni = ny * W + nx;
        if (nx < 0 || ny < 0 || nx >= W || ny >= M.H || seen[ni] || blocked(nx, ny, P)) continue;
        seen[ni] = 1; prev[ni] = c; q.push(ni);
      }
    }
    if (goal < 0) { sfx.bump(); return; }
    var steps = [];
    for (var n = goal; n !== startI; n = prev[n]) steps.unshift({ x:n % W, y:(n / W) | 0 });
    path = steps;
    if (interact) path.push({ face:target });
  }

  function facing(){ var d = DIRS[P.dir]; return { x:P.x + d[0], y:P.y + d[1] }; }

  var saveTimer = 0, airTimer = 0;
  function hazardDrain(){
    var e = M.env(P.x, P.y), r = e && e.hazard && e.hazard.rule || '';
    var k = (S.hq.research['r-air'] ? .65 : 1) * (perk('breath') ? .8 : 1);
    var run = P && P.gait === 'sprint' && (P.moving || held || path.length) ? 2.2 : 1;   // sprinting burns air
    return { air:(M.indoor ? 0 : (M.hq ? .08 : .16 * (/AIR/.test(r) ? 1.8 : 1)) * k) * run, suit:/SUIT/.test(r) ? .06 * (S.hq.research['r-suit'] ? .65 : 1) : 0 };
  }
  function updateSurface(dt, now){
    if (!P) return;
    if (P.moving) {
      var G = GAIT[P.gait];
      P.t += dt / G.step;
      P.anim += dt * G.anim;
      if (P.t >= 1) { P.moving = false; P.fx = P.x; P.fy = P.y; arrived(); if (mode !== 'surface') return; }
      else { P.fx = P.px0 + (P.x - P.px0) * P.t; P.fy = P.py0 + (P.y - P.py0) * P.t; }
    }
    if (!P.moving && !dialogOpen && !encounterOpen && !doc.querySelector('.x-modal')) {
      var want = null;
      if (held) want = held;
      else if (path.length) {
        var nx = path[0];
        if (nx.face) { path = []; P.dir = dirTo(nx.face.x, nx.face.y); setTimeout(btnA, 60); }
        else { want = dirTo(nx.x, nx.y); path.shift(); if (blocked(nx.x, nx.y, P)) { path = []; want = null; } }
      }
      if (want) step(want);
    }
    for (var i = 0; i < critters.length && mode === 'surface'; i++) updateCritter(critters[i], dt, now);
    if (mode !== 'surface') return;
    airTimer += dt;
    if (airTimer > 1) {
      airTimer = 0;
      if (!dialogOpen && !encounterOpen) { var hz = hazardDrain(); S.air = Math.max(0, S.air - hz.air); S.suit = Math.max(0, S.suit - hz.suit); }
      hudRefresh();
      if (S.air <= 0) return airDeath();
      if (S.suit <= 0) return recall('SUIT');
      var ap = airPct(), band = ap <= 10 ? 3 : ap <= 25 ? 2 : ap <= 50 ? 1 : 0;
      if (band > (P.airBand || 0)) {
        toast(band === 3 ? 'AIR CRITICAL · ' + Math.round(ap) + '% · get back to ' + hqName() + ' now' : band === 2 ? 'AIR LOW · ' + Math.round(ap) + '% · head home to ' + hqName() : 'AIR HALF GONE · only ' + hqName() + ' can refill the tank', band > 1 ? 'red' : undefined);
        sfx.warn(); vibrate(band * 150, .3 * band);
      }
      P.airBand = band;
    }
    saveTimer -= dt;
    if (saveTimer <= 0) { saveTimer = 3; S.pos = { map:M.id, x:P.x, y:P.y, dir:P.dir }; S.fog[M.id] = fogEnc(fogArr); save(); }
  }
  function dirTo(x, y){ var dx = x - P.x, dy = y - P.y; return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down'); }
  function step(dir){
    P.dir = dir;
    var d = DIRS[dir], nx = P.x + d[0], ny = P.y + d[1];
    if (blocked(nx, ny, P)) return;
    P.px0 = P.x; P.py0 = P.y; P.x = nx; P.y = ny; P.t = 0; P.moving = true;
    if ((nx + ny) % 2) sfx.step();
  }
  function arrived(){
    revealFog(); checkZone();
    var ch = at(P.x, P.y), warp = M.warps && M.warps[ch];
    if (warp) {
      held = null; path = []; S.pos = { map:warp.to, x:warp.x, y:warp.y, dir:warp.dir }; S.fog[M.id] = fogEnc(fogArr); save();
      var to = warp.to; stopWorld(); fade(function(){ surface(to); }); return;
    }
    if (M.location && mark(M.location, 'reached')) { S.notes[M.location] = 1; toast('NEW FIELD RECORD · ' + term(subj(M.location).term)); }
    var wd = npcs.filter(function(n){ return n.warden; })[0];
    if (wd && !S.exp.beaten[M.world] && Math.abs(wd.x - P.x) + Math.abs(wd.y - P.y) <= 3 && !(wd.cool > performance.now())) { held = null; path = []; wardenMeet(wd); }
  }
  function revealFog(){
    var R = M.indoor ? 4 : perk('sight') ? 7 : 5;
    for (var y = P.y - R; y <= P.y + R; y++) for (var x = P.x - R; x <= P.x + R; x++) {
      if (x < 0 || y < 0 || x >= M.W || y >= M.H) continue;
      if (Math.hypot(x - P.x, y - P.y) <= R + .3) fogArr[y * M.W + x] = 1;
    }
  }
  function fade(fn){
    var f = el('div', 'x-fade'); doc.body.appendChild(f);
    requestAnimationFrame(function(){ f.classList.add('on'); });
    setTimeout(function(){ fn(); f.classList.remove('on'); setTimeout(function(){ f.remove(); }, 300); }, reduced ? 20 : 280);
  }

  function updateCritter(c, dt){
    c.anim += dt * 6;
    if (c.t < 1) {
      c.t = Math.min(1, c.t + dt / (c.flies ? .22 : .35));
      c.fx = c.fromX + (c.x - c.fromX) * c.t; c.fy = c.fromY + (c.y - c.fromY) * c.t;
      return;
    }
    if (dialogOpen || encounterOpen || doc.querySelector('.x-modal')) return;
    var dist = Math.abs(c.x - P.x) + Math.abs(c.y - P.y);
    if (dist > 22) return;                      // far away: asleep until you come near
    var s = subj(c.id) || {};
    c.cool -= dt; if (c.calm > 0) c.calm -= dt;
    if (c.resident) { if (c.cool > 0) return; }
    else if (s.temperament === 'skittish' && !stalking() && dist <= (P.gait === 'sprint' && P.moving && !perk('quiet') ? 4 : 2)) {
      if (c.state !== 'flee') { c.state = 'flee'; c.cool = 0; }
    } else if (c.state === 'flee' && dist > 4) c.state = 'idle';
    if ((s.temperament === 'territorial' || c.guardian) && c.calm <= 0 && (c.guardian || !perk('calm'))) {
      if (dist <= 2 && c.state !== 'warn' && c.cool <= 0) { c.state = 'warn'; c.warnT = 1.3; sfx.warn(); vibrate(120, .4); toast(c.guardian ? 'THE VAULT’S GUARDIAN rises. It will not let you pass.' : 'It bristles and glows. It will charge.', 'red'); }
      if (c.state === 'warn') {
        c.warnT -= dt; c.dir = c.x === P.x ? (P.y < c.y ? 'up' : 'down') : (P.x < c.x ? 'left' : 'right');
        if (dist > 3) { c.state = 'idle'; c.cool = 2; }
        else if (c.warnT <= 0) { c.state = 'idle'; c.cool = 6; encounter(c, true); }
        return;
      }
    }
    if (c.cool > 0) return;
    var opts = [['up',0,-1],['down',0,1],['left',-1,0],['right',1,0]], choice = null;
    if (c.state === 'flee') {
      opts.sort(function(a, b){ return (Math.abs(c.x + b[1] - P.x) + Math.abs(c.y + b[2] - P.y)) - (Math.abs(c.x + a[1] - P.x) + Math.abs(c.y + a[2] - P.y)); });
      for (var i = 0; i < opts.length; i++) if (!blocked(c.x + opts[i][1], c.y + opts[i][2], c)) { choice = opts[i]; break; }
      c.cool = .25;
    } else {
      var o = opts[(Math.random() * 4) | 0], nx = c.x + o[1], ny = c.y + o[2];
      if (Math.abs(nx - c.home.x) + Math.abs(ny - c.home.y) <= (c.flies ? 6 : 4) && !blocked(nx, ny, c)) choice = o;
      c.cool = c.flies ? .5 + Math.random() * .8 : 1.2 + Math.random() * 2.4;
      if (s.temperament === 'curious' && dist <= 4 && dist > 1 && !P.moving && Math.random() < .5) {
        var toward = opts.filter(function(q){ return Math.abs(c.x + q[1] - P.x) + Math.abs(c.y + q[2] - P.y) < dist && !blocked(c.x + q[1], c.y + q[2], c); })[0];
        if (toward) choice = toward;
      }
    }
    if (choice) { c.fromX = c.x; c.fromY = c.y; c.x += choice[1]; c.y += choice[2]; c.dir = choice[0]; c.t = 0; }
  }

  // ── A and B ──
  function btnA(){
    if (encounterOpen || doc.querySelector('.x-modal')) return;
    if (dialogOpen) { advanceDialog(); return; }
    if (P.moving) return;
    var f = facing(), ch = at(f.x, f.y), c = critterAt(f.x, f.y), n = npcAt(f.x, f.y), i = f.y * M.W + f.x;
    if (c && c.resident) { return say([subjName(c.id) + ' lives on ' + hqName() + ' now. It watches you without fear.']); }
    if (c) { encounter(c, false); return; }
    if (n) {
      n.dir = { up:'down', down:'up', left:'right', right:'left' }[P.dir];
      if (n.warden) return wardenMeet(n);
      if (n.refugee) return talkRefugee(n);
      if (n.resident) return talkResident(n);
      if (n.codex) return talkCodexPerson(n);
      talkPeople(n); return;
    }
    if (ch === 'K' && M.vault) return openVault();
    if (M.hq) {
      if (ch === 'F' && M.sidx[i] != null) return hqUse(M.structs[M.sidx[i]]);
      if (ch === 'S') return hqShip();
      if (ch === 'X') return hqRubble();
      if (ch === 'w' || ch === 'A' || ch === 'b') return hqPick(ch, f.x, f.y);
    }
    var no = M.world;
    if (ch === 'b' || ch === 'T') { takeOnce(f.x, f.y, { fibre:2 }); hudRefresh(); }
    if (ch === 'A') { takeOnce(f.x, f.y, { crystal:2 }); hudRefresh(); }
    if (ch === 'b') return examineSpecimen(no === 9 ? 'shrub' : 'pl_' + no);
    if (ch === 'T') return examineSpecimen(no === 9 ? 'fruittree' : 'pl_' + no);
    if (ch === 'A') return examineSpecimen(no === 9 ? 'astralite' : 'mn_' + no, true);
    if (ch === 'M') { var rec = M.records.filter(function(r){ return r.x === f.x && r.y === f.y; })[0]; return rec && rec.key !== 'markings' ? examineRecord(rec) : examineMarkings(); }
    if (ch === 'L') { var lm = M.landmarks.filter(function(l){ return l.x === f.x && l.y === f.y; })[0]; if (lm) return examineLandmark(lm); }
    if (ch === 'S') return boardShip();
    if (ch === 'X') return say([M.signs[i] || 'A route marker.']);
    if (ch === 'B') return say(['A heavy boulder, streaked with something that glints.']);
    if (ch === 'P') { var pk = (M.props[i] || [])[0], pm = { pylon:{ scrap:1 }, vent:{ scrap:1 }, pillar:{ scrap:1 }, spire:{ crystal:1 }, deadtree:{ fibre:1 }, tree:{ fibre:1 }, shrub:{ fibre:1 } }[pk];
      var pg = pm ? takeOnce(f.x, f.y, pm) : ''; hudRefresh(); return say([propLine(M.props[i])].concat(pg ? ['You take what you can carry: ' + pg + '.'] : [])); }
    if (ch === '#') return say([M.indoor ? 'Fitted stone. The joints are too fine for hand tools.' : 'Rock, too steep to climb without gear.']);
    if (ch === '~') return say([M.env(f.x, f.y).tiles.liquid === 'cloud' ? 'Cloud, far below the edge. Nothing to stand on.' : 'Cold, clear liquid. Something moves under the surface.']);
    var hid = M.id + ':' + f.x + ',' + f.y;
    if (ch === '*' && !S.found[hid] && M.codexFinds && M.codexFinds[i]) return pickCodexFind(hid, M.codexFinds[i]);
    if (ch === '*' && !S.found[hid]) {
      S.found[hid] = 1; var k = Object.keys(S.found).length % 2; sfx.reveal(); vibrate(60, .3); gain('scrap', 2);
      if (k === 1) { S.air = Math.min(airMax(), S.air + 40); save(); hudRefresh(); return say(['A spare air cylinder from your own kit, lost on landing. Still charged.', 'AIR +40']); }
      S.flares++; save(); return say(['A signal flare, wrapped in oilcloth.', 'FLARES +1']);
    }
  }
  function propLine(p){
    var k = p && p[0];
    return { spire:'A spire of crystal, taller than a man. It rings faintly when the wind passes.', pillar:'A pillar, worked by hands. Whoever made it is not here.',
      vent:'A vent in the ground, breathing heat. Better not stand over it.', pylon:'A machine, still humming. No one tends it.', deadtree:'A tree with no leaves, hard as iron.',
      tree:'A tree. Its bark is warm.', shrub:'A thicket, too dense to push through.', boulder:'A boulder.' }[k] || 'Something strange, and too heavy to move.';
  }
  function btnB(){
    if (dialogOpen) { advanceDialog(true); return; }
    if (encounterOpen || doc.querySelector('.x-modal')) return;
    var order = ['stalk', 'steady', 'sprint'];
    P.gait = S.gait = order[(order.indexOf(P.gait) + 1) % order.length]; hudRefresh(); sfx.click(); vibrate(40, P.gait === 'sprint' ? .5 : .2);
    toast(GAIT[P.gait].toast);
  }
  // the three gaits: ○ / B cycles STALK → STEADY → SPRINT
  var GAIT = {
    stalk:  { label:'STALK',  step:.3,  anim:5,  toast:'STALK · slow and quiet. Skittish creatures let you near.' },
    steady: { label:'STEADY', step:.17, anim:9,  toast:'STEADY · an ordinary walking pace.' },
    sprint: { label:'SPRINT', step:.095, anim:17, toast:'SPRINT · fast and loud. Burns AIR twice as fast, and creatures hear you coming.' }
  };
  function stalking(){ return P && P.gait === 'stalk'; }

  // ── dialog box (the field, and the opening) ──
  var dlg = null;
  function say(lines, choices, box, onPick){
    return new Promise(function(res){
      if (dlg) closeDialog(-2);
      box = box || $('.x-dialog');
      if (!box) { res(-1); return; }
      dlg = { lines:lines.slice(), choices:choices, res:res, typing:null, box:box, onPick:onPick };
      dialogOpen = true; held = null; path = [];
      box.hidden = false;
      nextLine();
    });
  }
  function nextLine(){
    var d = dlg, box = d.box, t = $('.x-dtext', box), ch = $('.x-dchoices', box);
    var line = d.lines.shift();
    ch.innerHTML = ''; box.classList.remove('ask');
    d.typing = typeInto(t, line).then(function(){
      d.typing = null;
      if (!d.lines.length && d.choices && dlg === d) {
        box.classList.add('ask');
        ch.innerHTML = d.choices.map(function(c, i){ return '<button data-c="' + i + '">' + esc(c) + '</button>'; }).join('');
        $$('[data-c]', ch).forEach(function(b){
          b.addEventListener('click', function(e){ e.stopPropagation(); closeDialog(+b.dataset.c); });
          b.addEventListener('focus', function(){ if (d.onPick) d.onPick(+b.dataset.c); });
        });
        $('[data-c]', ch).focus();
      }
    });
  }
  function advanceDialog(isB){
    if (!dlg) return;
    var t = $('.x-dtext', dlg.box);
    if (dlg.typing) { if (t && t._finish) t._finish(); return; }
    if (t && t._doneAt && performance.now() - t._doneAt < 120) return;     // the tap that finished the line does not also skip it
    if (dlg.lines.length) { nextLine(); return; }
    if (dlg.choices) { if (isB) closeDialog(dlg.choices.length - 1); else { var f = doc.activeElement && doc.activeElement.closest && doc.activeElement.closest('[data-c]'); closeDialog(f ? +f.dataset.c : 0); } return; }
    closeDialog(-1);
  }
  function closeDialog(answer){
    var d = dlg; dlg = null; dialogOpen = false;
    if (d && d.box) { d.box.hidden = true; }
    if (d && answer !== -2) d.res(answer);
    else if (d) d.res(-1);
  }

  // ── examining things ──
  async function examineSpecimen(id, sample){
    var s = subj(id), had = !!S.cards[id];
    await say([s.journal, 'You hold the AstraNav over it. The needle swings, settles, and the scan prints.']);
    if (had && !sample) { await say(['Already in the AstraNav: ' + title1936(subjName(id)) + '.']); return; }
    var first = manifest(id, null, false); vibrate(120, .3);
    if (had) { toast('ANOTHER SAMPLE · QUANTITY +1'); return; }
    await cardReveal(id, first, 'SCANNED INTO THE ASTRANAV · CARD ACQUIRED');
  }
  async function examineMarkings(){
    if (S.flags.copied) { await say(['The carved figures and their words are already in your journal.', S.flags.decoded ? 'You can read them now.' : 'Decode them in the AstraNav CODEX.']); return; }
    await say(['Carved into the stone: figures, each beside a mark like a word. Some figures look like the animals outside. One is a star. One is a small pale circle.', 'You copy every mark into the field journal.']);
    S.flags.copied = true; save(); toast('MARKINGS COPIED · decode them in the AstraNav CODEX');
    if (!S.cards.firstden) { var ok = await say(['Scan the cave into the AstraNav?'], ['SCAN', 'NOT NOW']); if (ok === 0) scanPlace('firstden'); }
  }
  async function examineLandmark(lm){
    if (lm.codexTerm) return examineCodexLandmark(lm);
    var first = mark(lm.id, 'reached'); S.notes[lm.id] = 1; save();
    if (first) gainAll({ relic:1, data:4 });
    await say([known(lm.id) ? title1936(term(lm.id)) + '. ' + subj(lm.id).journal : subj(lm.id).journal,
      known(lm.id) ? 'The Codex has its name.' : 'Its name is not in your journal. The people of this world will know it.']);
    if (first) toast('NEW FIELD RECORD · ' + term(lm.id));
    if (!S.cards[lm.id]) { var ok = await say(['Scan it into the AstraNav?'], ['SCAN', 'NOT NOW']); if (ok === 0) scanPlace(lm.id); }
  }
  async function scanPlace(id){
    sfx.shutter(); vibrate(200, .3);
    var first = manifest(id, null, false); mark(id, 'reached'); S.notes[id] = 1; save(); hudRefresh();
    await cardReveal(id, first, 'SCANNED INTO THE ASTRANAV · CARD ACQUIRED');
  }
  async function boardShip(){
    var a = await say(['Your ship. Board?'], ['BOARD', 'STAY']);
    if (a !== 0) return;
    S.pos = { map:M.id, x:P.x, y:P.y, dir:P.dir }; S.fog[M.id] = fogEnc(fogArr); S.landed = true; save(); sfx.click();
    aboard(); nav('stars');
  }
  // the AstraNav, opened in the field
  function openNav(tab){
    if (dialogOpen || encounterOpen || doc.querySelector('.x-modal, .x-battle')) return;
    held = null; path = [];
    S.pos = { map:M.id, x:P.x, y:P.y, dir:P.dir }; S.fog[M.id] = fogEnc(fogArr); save(); sfx.click();
    nav(typeof tab === 'string' ? tab : 'system');
  }
  // the field sketch: the stretch of ground around you, as far as you have walked it
  function drawSketch(c){
    var g = c.getContext('2d'), VW = Math.min(M.W, 64), VH = Math.min(M.H, 40);
    var vx = clamp(P.x - (VW >> 1), 0, M.W - VW), vy = clamp(P.y - (VH >> 1), 0, M.H - VH);
    var s = Math.min(c.width / VW, c.height / VH), ox = (c.width - VW * s) / 2, oy = (c.height - VH * s) / 2;
    g.fillStyle = '#efe6d0'; g.fillRect(0, 0, c.width, c.height);
    for (var y = vy; y < vy + VH; y++) for (var x = vx; x < vx + VW; x++) {
      if (!fogArr[y * M.W + x]) continue;
      var ch = at(x, y), X = ox + (x - vx) * s, Y = oy + (y - vy) * s;
      g.fillStyle = ch === '~' ? 'rgba(40,70,120,.45)' : ch === 'd' ? 'rgba(120,80,40,.4)' : 'TP'.indexOf(ch) >= 0 ? 'rgba(40,80,40,.45)' : ch === '#' ? 'rgba(40,30,20,.6)' : 'rgba(60,50,30,.1)';
      g.fillRect(X, Y, s + .5, s + .5);
      if (ch === 'L') { g.fillStyle = '#b8862a'; g.fillRect(X - 1, Y - 1, s + 2, s + 2); }
      if (ch === 'A') { g.fillStyle = '#3b5bd6'; g.fillRect(X + 1, Y + 1, s - 2, s - 2); }
    }
    if (M.vault && !M.hq && (hasClue(M.world) || perk('sense') || fogArr[M.vault.y * M.W + M.vault.x])) {
      var vX = ox + (M.vault.x - vx) * s, vY = oy + (M.vault.y - vy) * s;
      if (M.vault.x >= vx && M.vault.y >= vy && M.vault.x < vx + VW && M.vault.y < vy + VH) {
        g.fillStyle = '#c8402c'; g.fillRect(vX - 2, vY - 2, s + 4, s + 4); g.fillStyle = '#ffe08a'; g.fillRect(vX, vY, s, s);
        g.fillStyle = '#5a1a12'; g.font = 'bold 10px Courier Prime, monospace'; g.fillText('VAULT', vX - 8, vY - 4);
      }
    }
    npcs.forEach(function(n){ if (fogArr[n.y * M.W + n.x] && n.x >= vx && n.y >= vy && n.x < vx + VW && n.y < vy + VH) { g.fillStyle = '#7a3a8a'; g.beginPath(); g.arc(ox + (n.x - vx + .5) * s, oy + (n.y - vy + .5) * s, 3, 0, 7); g.fill(); } });
    if (M.structs) M.structs.forEach(function(st){
      var seen = fogArr[st.y * M.W + st.x] || S.hq.research['r-survey']; if (!seen) return;
      var rs = st.kind === 'ruin' && S.hq.ruins[st.id];
      g.fillStyle = st.kind === 'fac' ? '#3a6ab8' : st.kind === 'plot' ? '#9a9080' : rs && rs.restored ? '#3a9a5a' : rs ? '#e0a030' : '#b8862a';
      g.fillRect(ox + (st.x - vx) * s - 1, oy + (st.y - vy) * s - s, st.w * s + 2, s + 2);
      if (st.kind === 'ruin' && !rs) { g.fillStyle = '#2a2118'; g.font = 'bold 10px Courier Prime, monospace'; g.fillText('?', ox + (st.x - vx) * s, oy + (st.y - vy) * s); }
    });
    if (M.hq) for (var ry = vy; ry < vy + VH; ry++) for (var rx = vx; rx < vx + VW; rx++) if (at(rx, ry) === 'X' && fogArr[ry * M.W + rx]) { g.fillStyle = '#9b2a1f'; g.fillRect(ox + (rx - vx) * s, oy + (ry - vy) * s, s, s); }
    if (M.districts) M.districts.forEach(function(d){
      g.strokeStyle = 'rgba(90,60,30,.4)'; g.setLineDash([4, 4]); g.strokeRect(ox + (d.x - vx) * s, oy + (d.y - vy) * s, d.w * s, d.h * s); g.setLineDash([]);
      if (S.seen[d.id]) { g.fillStyle = '#5a4a36'; g.font = '11px Courier Prime, monospace'; g.fillText(zoneLabel(d.id), ox + (d.x - vx) * s + 4, oy + (d.y - vy) * s + 13); }
    });
    if (M.ship && M.ship.x >= vx && M.ship.x < vx + VW && M.ship.y >= vy && M.ship.y < vy + VH) { g.fillStyle = '#222'; g.font = 'bold 11px Courier Prime, monospace'; g.fillText('▲ SHIP', ox + (M.ship.x - vx - 1) * s, oy + (M.ship.y - vy + 2.5) * s); }
    g.fillStyle = '#9b2a1f'; g.beginPath(); g.arc(ox + (P.x - vx + .5) * s, oy + (P.y - vy + .5) * s, 4, 0, 7); g.fill();
  }
  function recall(why){
    if (mode !== 'surface') return;
    S.pos = null; S.fog[M.id] = fogEnc(fogArr); save(); stopWorld(); vibrate(400, .8);
    var s = screen('x-recall', '<div class="x-paper"><p class="x-stamp red">EMERGENCY RECALL</p><p class="x-mono">' + why + ' gauge at zero. The suit\'s recall beacon fired, and the ship\'s winch hauled you back aboard.</p>' +
      '<p class="x-mono">Your AstraNav, cards and records are safe.</p><button class="x-btn">ABOARD SHIP</button></div>');
    $('.x-btn', s).addEventListener('click', function(){ aboard(); nav('system'); });
  }

  // ── the vault, the warden, the refugees, the residents, the allies ──
  async function openVault(){
    var no = M.world, sy = sysOf(no);
    if (S.hq.installed[no] || S.hq.parts[no] || S.exp.vault[no]) return say(['The vault stands open and empty. Its ' + sy.part + ' is ' + (S.exp.vault[no] ? 'in your pack.' : 'already home.')]);
    if (!hasClue(no)) return say(['A sealed vault, older than anything around it. Its lock is a puzzle of marks you cannot read.',
      no === 9 ? '(The clue is with the people of the far end of the Z. Learn their words.)' : hasWarden(no) ? '(The clue is with this world’s people. Show them your scans and learn their words.)' : '(The clue is in this world’s records. Find and read them.)']);
    if (!S.exp.beaten[no]) return say([hasWarden(no) ? 'The ' + wardenName(no) + ' guards this vault. Beat the warden first.' : 'Something guards this vault. It will not let you open it.']);
    var a = await say(['You know the marks now. The lock turns. Inside, packed in something like wax: a ' + sy.part + '.', 'It is exactly what the ' + sy.name + ' needs. Take it home to ' + hqName() + '?'], ['TAKE IT', 'LEAVE IT']);
    if (a !== 0) return;
    S.pack.parts = S.pack.parts || []; S.pack.parts.push(no); S.exp.vault[no] = Date.now(); gain('relic', 1, true); save(); sfx.reveal(); vibrate(200, .6); hudRefresh();
    await say(['The ' + sy.part + ' is in your pack (+1 RELIC). It only counts once it is home: get back to ' + hqName() + ' alive.']);
  }
  function wardenTeam(no){
    var ids = Object.keys(SP).filter(function(id){ var x = SP[id]; return x.world === no && !x.retired && !x.hidden; })
      .filter(function(id){ return (SP[id].tier || 1) <= 8; })        // bosses send Aethren up to tier VIII; IX+ roam the wild
      .sort(function(a, b){ return SP[b].tier - SP[a].tier || (a < b ? -1 : 1); }).slice(0, EXP.warden.team || 3).reverse();
    var lv = GEN.levelFor(no) + (EXP.warden.levelUp || 6);
    return ids.map(function(id, i){ return { sp:id, lv:lv + i * 2 }; });
  }
  async function wardenMeet(n){
    if (!COMPANIONS.battle) { say(['The encounter is recorded in the AstraNav. Aethren combat systems are locked in this build.']); return; }
    var no = M.world; if (S.exp.beaten[no] || dialogOpen || encounterOpen) return;
    n.cool = performance.now() + 9000; n.dir = n.x === P.x ? (P.y < n.y ? 'up' : 'down') : (P.x < n.x ? 'left' : 'right');
    sfx.warn(); vibrate(400, .8);
    var team = teamReady();
    await say(['The ' + wardenName(no) + ' sees you. To them you are the alien, the thing from outside, and they raise the call to kill.',
      team.length ? 'They loose their Aethren on you. Your team stands between you and them.' : 'You have no cards ready to stand between you. Run.']);
    if (!team.length) { S.suit = Math.max(0, S.suit - suitDmg(EXP.warden.suitHit || 35)); save(); hudRefresh(); knockBack(n); if (S.suit <= 0) recall('SUIT'); return; }
    var foes = wardenTeam(no); if (!foes.length) return;
    battle({ id:foes[0].sp, lv:foes[0].lv, x:n.x, y:n.y, cool:0, calm:0, state:'idle' }, true, {
      name:wardenName(no), foes:foes,
      winLine:'The ' + wardenName(no).toLowerCase() + ' has nothing left to send. They fall back, and do not return.',
      loseLine:'Your party is spent. The warden’s Aethren come for you.',
      onWin:function(){ S.exp.beaten[no] = Date.now(); gainAll(EXP.warden.reward, true); save(); npcs = npcs.filter(function(x){ return !x.warden; });
        toast('WARDEN DEFEATED · +' + costText(EXP.warden.reward) + (hasClue(no) ? ' · the vault is open to you' : ' · now find the clue to its vault')); hudRefresh(); },
      onLose:function(){ S.suit = Math.max(0, S.suit - suitDmg(EXP.warden.suitHit || 35)); save(); hudRefresh(); knockBack(n); if (S.suit <= 0) recall('SUIT'); },
      onRun:function(){ S.suit = Math.max(0, S.suit - suitDmg(10)); save(); hudRefresh(); knockBack(n); }
    });
  }
  function knockBack(n){
    var dx = Math.sign(P.x - n.x) || 1, dy = Math.sign(P.y - n.y);
    for (var k = 6; k > 0; k--) { var tx = P.x + dx * k, ty = P.y + dy * k; if (!blocked(tx, ty, P)) { P.x = P.fx = tx; P.y = P.fy = ty; P.moving = false; revealFog(); break; } }
    toast('You fall back, hurt. SUIT ' + Math.round(S.suit) + '%', 'red');
  }
  async function talkRefugee(n){
    var no = M.world, pe = worldPeople(no) || {}, race = known(WORLD[no].term) && pe.race ? pe.race : 'these people';
    if (S.hq.residents[no]) return;
    if (!S.lore['w' + no]) return say(['A camp at the edge of the fighting. Tired faces, few belongings. They speak fast and low, and you cannot follow it yet.', '(Learn this world’s words from its people first.)']);
    if (!S.exp.beaten[no]) return say(['Refugees from the war region. They point toward the vault, and the warden who holds it, and shake their heads. Not while the warden hunts here.']);
    if (!S.hq.built.habitation) return say(['They ask, as far as you can follow, whether there is anywhere else. There is: ' + hqName() + '. But you have nowhere to put them yet.', '(Build the HABITATION ZONE at ' + hqName() + '.)']);
    var a = await say(['They ask whether there is anywhere else, anywhere the war does not reach. There is: ' + hqName() + '. A drifting world, quiet, with room.', 'Take ' + race.toLowerCase() + ' home to ' + hqName() + '?'], ['TAKE THEM', 'NOT NOW']);
    if (a !== 0) return;
    S.hq.residents[no] = Date.now(); gainAll(EXP.refugees.reward, true);
    npcs = npcs.filter(function(x){ return !x.refugee; });
    hqChanged('Rescued refugees from the war region on ' + placeName(no) + '. They live at the Habitation Zone now.');
    sfx.reveal(); toast('REFUGEES RESCUED · they will be waiting at ' + hqName());
  }
  async function talkResident(n){
    var no = +n.key.replace('res_w', '');
    var lines = ['They have made a corner of ' + hqName() + ' their own. Someone has planted something.', 'They ask after ' + placeName(no) + '. You tell them what you saw.',
      'The children follow you, then lose interest and go back to their game.', 'No warden here. They say it more than once.'];
    var k = (S.seen['res:' + no] || 0); S.seen['res:' + no] = k + 1; save();
    await say([lines[k % lines.length]]);
  }
  // an allied people, once they have taught you, help you once: your suit patched, your team rested
  function allyAid(no){
    if (S.exp.aid[no]) return false;
    S.exp.aid[no] = Date.now(); S.suit = Math.min(100, S.suit + (EXP.ally.suit || 30)); healTeam(); save(); hudRefresh();
    return true;
  }
  // AIR at zero: you die where you stand. The expedition is lost: what you carried stays there.
  // The record picks up again at NASARUS, at the camp (or the wreck, before there is a camp).
  function airDeath(){
    if (mode !== 'surface') return;
    var where = M.hq ? hqName() : zoneName(), lost = packTotal() + packParts() + pendingCards();
    if (fogArr) S.fog[M.id] = fogEnc(fogArr);
    stopWorld(); vibrate(1200, 1); sfx.warn();
    (S.pack.parts || []).forEach(function(no){ delete S.exp.vault[no]; });
    var lostCards = pendingCards();
    Object.keys(S.cards).forEach(function(id){ var c = S.cards[id]; if (!c.pend) return; c.qty -= c.pend; c.pend = 0; if (c.qty <= 0 && !c.clone) delete S.cards[id]; });
    S.team = (S.team || []).filter(function(id){ return S.cards[id]; });   // the part goes back to lie where you fell: its vault holds it again
    S.pack = {}; S.deaths = (S.deaths || 0) + 1;
    hqRecord(hero().first + ' NASARO ran out of air on ' + where + '.' + (lost ? ' ' + lost + ' materials were lost there.' : ''));
    var s = screen('x-recall x-death', '<div class="x-paper"><p class="x-stamp red">OUT OF AIR</p><h2 class="x-death-h">' + esc(hero().first) + ' NASARO DID NOT COME BACK</h2>' +
      '<p class="x-mono">The tank ran dry on ' + esc(where) + '. Nothing there can be breathed.</p>' +
      '<p class="x-mono">The suit’s AI took over. It flew what was left of you home to ' + esc(hqName()) + ' and brought you round at the base.</p>' +
      '<p class="x-mono">' + (lost ? 'The pack (' + lost + ' items) stayed where you fell. ' : 'The pack stayed where you fell. ') + 'Cards and records already in the AstraNav are kept.</p>' +
      '<p class="x-mono"><b>Only ' + esc(hqName()) + ' holds oxygen.</b> Watch the AIR gauge, and turn for home before it runs low. Sprinting burns air twice as fast.</p>' +
      '<button class="x-btn">WAKE AT THE BASE · ' + esc(hqName()) + '</button></div>');
    $('.x-btn', s).addEventListener('click', function(){
      var m = buildMap('nasarus');
      S.at = 'nasarus'; S.landed = true; S.suit = 100; refillAir(); healTeam();
      var c = S.hq.built.camp ? HQ.facilities.filter(function(f){ return f.id === 'camp'; })[0].at : [m.ship.x + 2, m.ship.y];
      S.pos = { map:'nasarus', x:c[0], y:c[1] + 1, dir:'down' }; S.stage = 'surface'; save();
      fade(function(){ surface('nasarus'); });
    });
  }
  // ── the peoples: relationships, and what they teach ──
  function compass(dx, dy){
    var a = Math.atan2(dy, dx) * 180 / Math.PI, i = Math.round(((a + 360) % 360) / 45) % 8;
    return ['east','south-east','south','south-west','west','north-west','north','north-east'][i];
  }
  function worldCardsAethren(no, district){
    return Object.keys(S.cards).filter(function(k){ var s = subj(k); return s && s.sp && s.set === no && (!district || s.district === district); });
  }
  function teachTerms(no, district){
    var t = [];
    if (no !== 9) t.push(WORLD[no].term, 'ppl_w' + no);
    else t.push('zyraxis', 'haemen', 'aethren', district, 'ppl_z_' + district);
    worldCardsAethren(no).forEach(function(k){ if (no !== 9 || subj(k).district === district || !district) t.push(subj(k).term); });
    var e = no === 9 ? ENV[district] : envOf(no);
    (e && e.landmarks || []).forEach(function(n, i){ t.push('lm_' + e.id + '_' + i); });
    return t;
  }
  function loreLines(no, district){
    var e = no === 9 ? ENV[district] : envOf(no), out = [], c = e.canon || {};
    out.push('They draw this ' + (no === 9 ? 'land' : 'world') + ' in the dust and name it: ' + term(no === 9 ? district : WORLD[no].term) + '.');
    if (e.hazard && e.hazard.name !== '—') out.push('They warn you, with gestures and the words you share: ' + e.hazard.rule);
    if (e.mechanic && e.mechanic.name !== '—' && !/spoiler/i.test(e.mechanic.name)) out.push('They explain: ' + e.mechanic.rule);
    if (c.notable) out.push('One name comes up again and again: ' + c.notable + '.');
    if (e.lord) out.push('They speak of the Gemlord of this land: ' + e.lord + '.');
    var lm = M.landmarks.filter(function(l){ return l.env === e.id && !(S.archive[l.id] || {}).reached; })
      .sort(function(a, b){ return (Math.abs(a.x - P.x) + Math.abs(a.y - P.y)) - (Math.abs(b.x - P.x) + Math.abs(b.y - P.y)); })[0];
    if (lm) out.push('They point ' + compass(lm.x - P.x, lm.y - P.y) + ': ' + title1936(term(lm.id)) + '.');
    return out;
  }
  async function teach(key, no, district, intro){
    var mapId = M.id;
    S.pos = { map:M.id, x:P.x, y:P.y, dir:P.dir }; S.fog[M.id] = fogEnc(fogArr); save();
    var pid = no === 9 ? 'ppl_z_' + district : 'ppl_w' + no;
    reclassify(teachTerms(no, district), intro, async function(){
      S.lore[key] = Date.now(); gain('data', 10, true); save();
      surface(mapId);
      if (subj(pid)) { mark(pid, 'talk'); var first = manifest(pid, null, false); await cardReveal(pid, first, 'RELATIONSHIP · CARD ACQUIRED'); }
      toast('THE CODEX · ' + term(no === 9 ? district : WORLD[no].term) + ' · new pages');
    });
  }
  // ── THE MASTER CODEX in the field ──
  // People from the Codex live on their home worlds; dated historical figures are inscribed on records.
  // Meeting or reading unlocks their Codex entries (AstraNav · RESEARCH · MASTER CANON).
  var CODEX = window.AOV_CODEX || { beings:[] }, CXB = {};
  CODEX.beings.forEach(function(b){ CXB[b.id] = b; });
  function cxUnlock(id, how){ if (!S.codex[id]) { S.codex[id] = { how:how, at:Date.now() }; save(); return true; } return false; }
  function cxHeader(b){ return b.name.toUpperCase() + (b.cls && b.cls !== '—' ? ' · ' + b.cls.toUpperCase() : '') + (b.tierName ? ' · ' + b.tierName.toUpperCase() : ''); }
  async function talkCodexPerson(n){
    var b = CXB[n.codex]; if (!b) return;
    var no = M.world, learned = no === 9 ? Object.keys(S.lore).some(function(k){ return /^z_/.test(k); }) || S.flags.taught : !!S.lore['w' + no];
    sfx.meet();
    if (!learned) { await say(['A stranger. They watch you with open curiosity, and say something you cannot follow.', '(Learn this world’s words first, from its people or its records.)']); return; }
    var first = cxUnlock(b.id, 'met');
    if (first) { gain('data', 3, true); toast('MASTER CODEX · ' + b.name + ' · entry unlocked'); }
    await say([cxHeader(b) + '.', b.blurb || 'They tell you a little about themselves.'].concat(first ? ['(Recorded in the AstraNav · RESEARCH · MASTER CANON. +3 DATA)'] : []));
  }
  async function examineCodexRecord(rec){
    var bs = rec.codex.map(function(id){ return CXB[id]; }).filter(Boolean);
    var no = M.world, learned = no === 9 ? Object.keys(S.lore).some(function(k){ return /^z_/.test(k); }) || S.flags.taught : !!S.lore['w' + no];
    if (!learned) { await say(['A worn stone, carved with names and dates in a script you cannot read yet.', '(Learn this world’s words first, from its people or its records.)']); return; }
    var fresh = bs.filter(function(b){ return cxUnlock(b.id, 'record'); });
    if (fresh.length) { gain('data', 2 * fresh.length, true); toast('MASTER CODEX · ' + fresh.length + ' historical ' + (fresh.length > 1 ? 'figures' : 'figure') + ' recorded'); }
    await say(['A record stone, carved with the names of people long gone.'].concat(bs.map(function(b){ return cxHeader(b) + (b.blurb ? ': ' + b.blurb : '.'); })));
  }
  // places, relics and record stones from the Master Codex index, pages and timeline
  function ixKey(t){ return String(t || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
  function ixUnlock(term, how){ var k = ixKey(term); if (S.codexIdx[k]) return false; S.codexIdx[k] = { how:how, at:Date.now() }; return true; }
  function ixDesc(term){ var R = window.AOV_CODEX_REF, k = ixKey(term), r = R && R.index.filter(function(x){ return ixKey(x[1]) === k; })[0]; return r ? redact(r[2]) : ''; }
  // AEP-28 stays sealed: any clause that names it is blacked out
  function redact(t){ return String(t || '').split(/( · |\. |; )/).map(function(c){ return SEALED_RX.test(c) ? '██████' : c; }).join(''); }
  function worldLearned(no){ return no === 9 ? Object.keys(S.lore).some(function(k){ return /^z_/.test(k); }) || S.flags.taught : !!S.lore['w' + no]; }
  async function examineCodexLandmark(lm){
    if (lm.shrine) return visitShrine(lm);
    var first = ixUnlock(lm.codexTerm, 'reached'); save();
    if (first) { gainAll({ relic:1, data:4 }); toast('MASTER CODEX · ' + lm.codexTerm); }
    await new Promise(function(res){ loadCanon(res); });
    var d = ixDesc(lm.codexTerm);
    await say([lm.codexTerm.toUpperCase() + '.', d ? d.slice(0, 420) : 'A place the Master Codex names.'].concat(first ? ['(Recorded in the AstraNav · RESEARCH · MASTER CANON · INDEX.)'] : []));
  }
  // the nine district shrines of Zyraxis: visiting all nine gives ANCIENT GEMSIGHT (Codex · District Shrine)
  async function visitShrine(lm){
    var key = 'shrine:' + lm.id, first = !S.seen[key];
    if (first) { S.seen[key] = Date.now(); ixUnlock('District Shrine', 'reached'); gainAll({ relic:1, data:4 }); }
    var n = Object.keys(S.seen).filter(function(k){ return /^shrine:/.test(k); }).length;
    var lines = [lm.shrine.toUpperCase() + '. A district shrine of Zyraxis.', 'Shrines visited: ' + n + ' of 9.'];
    if (n >= 9 && !S.flags.gemsight) { S.flags.gemsight = Date.now(); lines.push('Every shrine of the nine districts has seen you. ANCIENT GEMSIGHT.'); toast('ANCIENT GEMSIGHT'); hqRecord('All nine district shrines of Zyraxis visited: Ancient Gemsight.'); }
    save(); if (first) toast('SHRINE · ' + lm.shrine);
    await say(lines);
  }
  async function pickCodexFind(hid, term){
    S.found[hid] = 1; var first = ixUnlock(term, 'found'); sfx.reveal(); vibrate(60, .3); gain('relic', 1); save(); hudRefresh();
    await new Promise(function(res){ loadCanon(res); });
    var d = ixDesc(term);
    await say(['You find something half buried: ' + term + '.', d ? d.slice(0, 420) : 'The Master Codex knows it.', 'RELICS +1'].concat(first ? ['(Recorded in the AstraNav · RESEARCH · MASTER CANON · INDEX.)'] : []));
  }
  async function readCodexStone(rec){
    if (!worldLearned(M.world)) { await say(['A tall stone, densely inscribed. The script is this world’s, and you cannot read it yet.', '(Learn this world’s words first, from its people or its records.)']); return; }
    await new Promise(function(res){ loadCanon(res); });
    var R = window.AOV_CODEX_REF, terms = rec.codexTerms.filter(function(t){ return ixUnlock(t, 'record'); }), pages = rec.codexPages.filter(function(k){ if (S.codexPages[k]) return false; S.codexPages[k] = Date.now(); return true; });
    var n = terms.length + pages.length; if (n) { gain('data', 2 * n, true); toast('MASTER CODEX · ' + n + ' ' + (n > 1 ? 'entries' : 'entry') + ' recorded'); }
    save();
    var titles = rec.codexPages.map(function(k){ var p = k.split(':'), sec = R.sections.filter(function(x){ return x.key === p[0]; })[0], pg = sec && sec.pages[+p[1]]; return pg ? sec.title + ': ' + pg.title : null; }).filter(Boolean);
    await say(['A record stone. You read it against the words you have learned.'].concat(rec.codexTerms.map(function(t){ var d = ixDesc(t); return t + (d ? ': ' + d.slice(0, 200) : '.'); }), titles.length ? ['It carries ' + (titles.length > 1 ? 'pages' : 'a page') + ' of the Master Canon: ' + titles.join(' · ') + '.'] : [], n ? ['(Recorded in the AstraNav · RESEARCH · MASTER CANON. +' + (2 * n) + ' DATA)'] : ['You have copied this stone before.']));
  }
  async function talkPeople(n){
    if (n.key === 'furtrader') return talkHaemen();
    sfx.meet();
    var no = M.world, district = no === 9 ? n.key.replace('z_', '') : null, key = n.key, pid = no === 9 ? 'ppl_z_' + district : 'ppl_w' + no;
    var firstMeet = mark(pid, 'talk'); S.notes[pid] = 1; save();
    if (S.lore[key]) {
      if (no !== 9 && allyAid(no)) { await say(['They are allies now. They patch your suit with their own materials and rest your Aethren by their fire. (SUIT +' + (EXP.ally.suit || 30) + ', team rested.)',
        hasWarden(no) && !S.exp.beaten[no] ? 'They warn you: the ' + wardenName(no).toLowerCase() + ' guards the old vault, and hunts anything from outside.' : 'They point you on your way.']); return; }
      var lines = loreLines(no, district), k = (S.seen['talk:' + key] || 0); S.seen['talk:' + key] = k + 1; save();
      if (M.vault && !S.exp.vault[no] && !S.hq.parts[no] && !S.hq.installed[no]) lines = lines.concat(['They draw the vault’s marks for you again, and point ' + compass(M.vault.x - P.x, M.vault.y - P.y) + '.']);
      await say([lines[k % lines.length]]);
      return;
    }
    if (firstMeet) toast('CONTACT · ' + subjName(pid));
    if (no === 9) {
      if (!S.flags.taught) { await say(['They greet you in a tongue like the fur-clad man’s in the meadow, but faster. You cannot follow it yet.', '(Learn the first words from the inhabitant near your ship.)']); return; }
      await say(['They speak the tongue you began to learn in the meadow. Slowly, with the AstraNav’s scans between you, you understand each other.']);
      return teach(key, no, district, 'The people of this land name it, its creatures, and its places.');
    }
    var have = worldCardsAethren(no);
    if (have.length < 2) {
      await say(['They speak. You cannot follow a word, but you know this dance now: they point at the glowing AstraNav, then at the creatures of this world.', '(Scan at least 2 of this world’s creatures into the AstraNav. You have ' + have.length + '.)']);
      return;
    }
    await say(['You show them the AstraNav, scan by scan. They name each creature, then the land, then themselves, slowly, so you can follow.']);
    teach(key, no, null, 'First contact. The people of this world name it, its creatures, its places, and themselves.');
  }
  async function examineRecord(rec){
    if (rec.codex) return examineCodexRecord(rec);
    if (rec.codexTerms) return readCodexStone(rec);
    var no = M.world, key = rec.key, fid = 'rec:' + key + ':' + rec.n, pe = FAUNA.peoples[no] || {};
    if (!S.found[fid]) {
      S.found[fid] = 1; gain('data', 3, true); save();
      await say(['Carved, grown or pressed into the surface: a record. ' + (pe.record || ''), 'You copy it into the field journal.']);
    } else await say(['A record you have already copied.']);
    var copied = M.records.filter(function(r){ return S.found['rec:' + key + ':' + r.n]; }).length;
    if (S.lore[key]) { var lines = loreLines(no, null); await say([lines[(S.seen['rec:' + key] = (S.seen['rec:' + key] || 0) + 1) % lines.length]]); save(); return; }
    if (copied < 2) { await say(['(' + copied + ' of this world’s records copied. Copy one more and they may line up with what you know.)']); return; }
    await say(['Laid side by side, the records line up with your scans. The marks are names.']);
    var mapId = M.id; S.pos = { map:M.id, x:P.x, y:P.y, dir:P.dir }; save();
    reclassify(teachTerms(no, null), 'The records of this world, read against your own.', function(){ S.lore[key] = Date.now(); save(); surface(mapId); toast('THE CODEX · new pages'); });
  }
  // Malezor's first contact: the relationship that teaches the Haemen words
  async function talkHaemen(){
    var id = 'furtrader', a = arc(id), aethren = Object.keys(S.cards).filter(function(k){ return subj(k) && subj(k).kind === 'aethren'; });
    sfx.meet();
    if (!a.talk) {
      mark(id, 'talk'); S.notes[id] = 1; save();
      await say(['A man in heavy furs. He looks at your helmet for a long moment, then speaks.', '“◆▲◇ ▲◆ ◇◇▲?”', 'The words mean nothing to you. He points at the glowing AstraNav, then out at the meadow, then at the AstraNav again.']);
      toast('CONTACT · ' + subjName(id));
      return;
    }
    if (S.flags.taught) {
      await say(['“' + title1936(term('malezor')) + '.” He taps the ground and nods, as if checking you remember.', S.flags.decoded ? 'He points east, toward the long road. Other districts lie that way.' : 'He points north-east, toward the stone cave.']);
      return;
    }
    if (aethren.length < 2) {
      await say(['He points at the AstraNav again, then at the animals by the water.', '(He seems to want to see what it can do. Scan at least 2 of the local animals, then come back and show him.)']);
      return;
    }
    await say(['You hold up the AstraNav and page through your scans. He laughs out loud and names each animal on the screen, slowly, so you can follow.', 'He taps the ground: a word. He points up at the sky: another. He taps his own chest, then yours.']);
    var mapId = M.id; S.pos = { map:M.id, x:P.x, y:P.y, dir:P.dir }; save();
    reclassify(D.teaches.haemen.concat(aethren.map(function(k){ return subj(k).term; })),
      'First contact. The inhabitant names his land, his world, his people, and the animals in your scans.',
      async function(){
        S.flags.taught = true; S.lore.z_malezor = Date.now();
        var first = manifest(id, null, false); save();
        surface(mapId);
        await cardReveal(id, first, 'RELATIONSHIP · CARD ACQUIRED');
      });
  }

  // ── encounters: observe, interact, and scan into the AstraNav ──
  // SCAN: tune the AstraNav's dial to the creature's range until the signal locks,
  // then scan. A strong lock writes it into the AstraNav as a card on the spot.
  function encounter(c, charged){
    var s = subj(c.id), team = teamReady();
    if (s.temperament === 'skittish' && !stalking() && !charged) {
      c.state = 'flee';
      toast('It bolted before you got close. Try STALKING (B).', 'red'); return;
    }
    if (charged) { S.suit = Math.max(0, S.suit - suitDmg(18)); save(); hudRefresh(); sfx.warn(); vibrate(220, 1); if (S.suit <= 0) { recall('SUIT'); return; } }
    if (COMPANIONS.battle && charged && team.length) { battle(c, true); return; }
    encounterOpen = true; held = null; path = [];
    var dist = 2 + Math.round(Math.random() * 3), acted = 0, gone = false, tune = .5, t0 = performance.now();
    var e = M.env(c.x, c.y);
    var o = el('div', 'x-encounter', '<div class="x-enc-in riv">' +
      '<p class="x-enc-k">' + (charged ? 'IT CHARGES!' : 'ENCOUNTER') + ' · LV ' + c.lv + '</p>' +
      '<div class="x-enc-stage" style="background-image:url(' + ART.url(M.indoor ? 'den' : e.tiles.ground + '@' + e.id + '-ground', 4) + ')"><div class="x-enc-spr" style="background-image:url(' + ART.url(subjArt(c.id), 8) + ')"></div><div class="x-enc-vf" hidden><i></i><b class="x-sweep"></b></div></div>' +
      '<p class="x-enc-nm">' + esc(subjName(c.id)) + '</p>' +
      '<p class="x-enc-sub">CLASS: ' + esc(term('aethren')) + ' · RARITY: ' + (S.cards[c.id] ? rarity(s) : 'UNKNOWN') + ' · ' + (S.cards[c.id] ? 'IN THE ASTRANAV' : 'NOT YET SCANNED') + '</p>' +
      '<p class="x-enc-msg" aria-live="polite"></p>' +
      '<div class="x-enc-acts">' +
        '<button data-e="observe">OBSERVE</button><button data-e="scan">SCAN</button>' +
        (COMPANIONS.battle ? '<button data-e="battle"' + (team.length ? '' : ' disabled title="Scan and clone an Aethren first"') + '>BATTLE</button>' : '') +
        (s.temperament === 'curious' ? '<button data-e="offer">OFFER RATION</button>' : '') +
        '<button data-e="leave" class="ghost">' + (charged ? 'RETREAT' : 'MOVE ON') + '</button></div>' +
      '<div class="x-enc-cam" hidden><div class="x-range"><span>RANGE</span><b>' + dist + ' YD</b></div>' +
        '<label class="x-ring"><span>TUNING</span><input type="range" min="0" max="1000" value="500" aria-label="Tuning dial"><span class="x-signal"><i></i></span></label>' +
        '<div class="x-cambtns"><button class="x-shutter x-scanbtn" aria-label="Scan">SCAN</button><button class="x-camx">CANCEL</button></div><p class="x-camfilm">ASTRANAV · TUNE UNTIL THE SIGNAL LOCKS</p></div>' +
      '</div>');
    ui.appendChild(o);
    var spr = $('.x-enc-spr', o), msg = $('.x-enc-msg', o), camBox = $('.x-enc-cam', o), sig = $('.x-signal i', o);
    if (s.temperament === 'flighty') spr.classList.add('flit');
    if (charged) o.classList.add('hit');
    sfx.meet();
    setTimeout(function(){ if (padOn) focusFirst(); }, 40);
    var intro = { curious:'It sniffs the air and edges closer.', skittish:'It has not noticed you. Stay low.', flighty:'It hovers, darts, hovers again.', territorial:'It stands its ground, glowing hotter.' }[s.temperament];
    typeInto(msg, charged ? 'It charges! You throw yourself aside. SUIT damaged. Send a deployed Aethren to battle, scan it, or retreat.' :
      intro + (COMPANIONS.battle && team.length ? ' Your party is ready.' : ' (Scan and clone an Aethren before you can send one into battle.)'), 14);

    function lockErr(){ return Math.abs(tune - needFor(dist)) * (S.hq.research['r-scan'] ? .74 : 1); }
    function wingOffset(){ var t = (performance.now() - t0) / 1000; return Math.sin(t * 2.6) * Math.sin(t * 1.3); }
    var raf3 = 0;
    (function tick(){
      if (!o.isConnected) return;
      var off = s.temperament === 'flighty' && !gone ? wingOffset() : 0;
      if (s.temperament === 'flighty' && !gone) spr.style.transform = 'translateX(' + (off * 34).toFixed(1) + '%)';
      var q = clamp(1 - (lockErr() * 5.5 + Math.abs(off) * .5), 0, 1);
      if (sig) { sig.style.width = Math.round(q * 100) + '%'; sig.parentNode.classList.toggle('lock', q > .82); }
      spr.style.filter = camBox.hidden ? '' : 'hue-rotate(' + Math.round((1 - q) * 90) + 'deg) saturate(' + (.4 + q * .8).toFixed(2) + ')';
      raf3 = requestAnimationFrame(tick);
    })();

    function react(){
      acted++;
      if (s.temperament === 'territorial' && acted >= 2 && !gone) {
        S.suit = Math.max(0, S.suit - suitDmg(18)); save(); hudRefresh(); sfx.warn(); vibrate(180, 1);
        o.classList.remove('hit'); void o.offsetWidth; o.classList.add('hit');
        typeInto(msg, 'It charges again! SUIT damaged. Time to go, or fight.', 14);
        if (S.suit <= 0) { end(); recall('SUIT'); return true; }
      }
      if (s.temperament === 'flighty' && acted >= 3 && Math.random() < .5) { leaveScene('It zips away.'); return true; }
      if (s.temperament === 'skittish' && acted >= 3 && Math.random() < .35) { leaveScene('A twig snaps. It is gone.'); return true; }
      return false;
    }
    function leaveScene(text){
      gone = true; spr.classList.add('gone');
      typeInto(msg, text, 14);
      $$('.x-enc-acts button', o).forEach(function(b){ if (b.dataset.e !== 'leave') b.disabled = true; });
      camBox.hidden = true; $('.x-enc-acts', o).hidden = false; $('.x-enc-vf', o).hidden = true;
      if (s.temperament !== 'territorial') c.state = 'flee';
      if (padOn) setTimeout(function(){ $('[data-e="leave"]', o).focus(); }, 30);
    }
    function end(){
      cancelAnimationFrame(raf3);
      o.remove(); encounterOpen = false;
      if (s.temperament === 'territorial') { c.cool = 6; c.state = 'idle'; }
    }
    o.addEventListener('click', async function(ev){
      var b = ev.target.closest('[data-e]'); if (!b || b.disabled) return;
      var act = b.dataset.e;
      if (act === 'leave') { end(); return; }
      if (act === 'battle' && COMPANIONS.battle) { end(); battle(c, false); return; }
      if (act === 'observe') {
        b.disabled = true;
        await typeInto(msg, 'You keep still and watch . . .', 18);
        await wait(1200);
        if (!o.isConnected) return;
        var isNew = mark(c.id, 'observe'); S.notes[c.id] = 1; save();
        typeInto(msg, (isNew ? 'OBSERVATION RECORDED. ' : '') + s.journal, 10);
        react();
      }
      if (act === 'offer') {
        b.disabled = true;
        mark(c.id, 'observe'); S.notes[c.id] = 1; save();
        typeInto(msg, 'It takes the ration from your glove and nuzzles your knee. INTERACTION RECORDED. It holds still now: an easy scan.', 10);
        spr.classList.add('calm');
        react();
      }
      if (act === 'scan') {
        $('.x-enc-acts', o).hidden = true; camBox.hidden = false; $('.x-enc-vf', o).hidden = false;
        var ring = $('.x-ring input', o); ring.value = Math.round(tune * 1000);
        ring.oninput = function(){ tune = ring.value / 1000; };
        typeInto(msg, 'RANGE ' + dist + ' YD. Turn the tuning dial until the signal locks.' + (s.temperament === 'flighty' ? ' Scan while it hovers in the centre.' : ''), 10);
        if (padOn) setTimeout(function(){ ring.focus(); }, 30);
      }
    });
    $('.x-camx', o).addEventListener('click', function(){
      camBox.hidden = true; $('.x-enc-acts', o).hidden = false; $('.x-enc-vf', o).hidden = true;
      if (padOn) setTimeout(function(){ $('[data-e="scan"]', o).focus(); }, 30);
    });
    $('.x-shutter', o).addEventListener('click', async function(){
      if (gone) return;
      var off = s.temperament === 'flighty' ? wingOffset() : 0;
      var err = lockErr() + Math.abs(off) * .12 + (spr.classList.contains('calm') ? -.01 : 0);
      var g = err < .035 ? 'excellent' : err < .085 ? 'good' : err < .17 ? 'fair' : 'poor';
      sfx.shutter(); vibrate(160, .35);
      o.classList.remove('flash'); void o.offsetWidth; o.classList.add('flash');
      if (g === 'excellent' || g === 'good') {
        var first = manifest(c.id, null, g === 'excellent', c.lv); S.notes[c.id] = 1; gain('data', first ? 4 : 1, true); save();
        await typeInto(msg, (g === 'excellent' ? 'PERFECT LOCK. ' : 'LOCKED. ') + 'Scanned into the AstraNav.', 10);
        await wait(500); end(); hudRefresh();
        c.calm = 60;
        await cardReveal(c.id, first, (first ? 'SCANNED INTO THE ASTRANAV · CARD ACQUIRED' : 'SCANNED AGAIN · QUANTITY +1') + (g === 'excellent' ? ' · FIRST EDITION' : ''));
        if (first) toast('PROFILE SCANNED · bring it home and CLONE it at ' + hqName() + ' to make it a companion');
        return;
      }
      mark(c.id, 'fair');
      typeInto(msg, g === 'fair' ? 'PARTIAL SCAN. The signal was too weak for a card, but the AstraNav kept the data. Tune closer.' : 'NO LOCK. The dial is far off.', 10);
      react();
    });
  }
  function needFor(dist){ var yd = Math.max(1, dist); return clamp(Math.log(yd) / Math.log(10) * .84, 0, .84); }

  // ═════════════════════════ AETHREN BATTLES ═════════════════════════
  // Your Aethren cards fight a wild Aethren. Canon stats (tier × 333 pools), canon
  // moves where the roster names them, and the canon 20-type chart. A1 and A2
  // are free; A3 spends 2 gems (one gem builds each turn). Win and it calms:
  // it lets you close enough for a perfect scan. Scan a weakened one mid-battle
  // and it is written into the AstraNav, and slips away unharmed.
  function battle(c, charged, boss){
    if (!COMPANIONS.battle) { toast('AETHREN COMBAT LOCKED'); return; }
    var team = teamReady(); if (!team.length) return;
    encounterOpen = true; held = null; path = [];
    var queue = boss ? boss.foes.slice(1) : [];
    var foe = { sp:c.id, lv:c.lv, max:hpOf(c.id, c.lv) }; foe.hp = foe.max; foe.gems = 1;
    var me = null, gems = 1, busy = false, over = false;
    function load(id){ var cd = S.cards[id]; me = { id:id, sp:subj(id).sp, lv:cd.lv, max:maxHp(id) }; me.hp = cd.hp == null ? me.max : cd.hp; }
    load(team[0]);
    var e = M.env(c.x, c.y);
    var o = el('div', 'x-battle', '<div class="x-bt-field" style="--bg:url(' + ART.url(M.indoor ? 'den' : e.tiles.ground + '@' + e.id + '-ground', 4) + ')">' +
        '<div class="x-bt-info foe riv"><b class="nm"></b><span class="lv"></span><i class="x-hpbar"><i></i></i></div>' +
        '<div class="x-bt-mon foe"><img class="x-pix" alt=""></div>' +
        '<div class="x-bt-mon me"><img class="x-pix" alt=""></div>' +
        '<div class="x-bt-info me riv"><b class="nm"></b><span class="lv"></span><i class="x-hpbar"><i></i></i><em class="hp"></em><span class="x-gems"></span></div>' +
      '</div>' +
      '<div class="x-bt-low riv"><p class="x-bt-msg" aria-live="polite"></p>' +
        '<div class="x-bt-menu"><button data-b="fight">FIGHT</button><button data-b="cards">PARTY</button><button data-b="photo">SCAN</button><button data-b="run">RUN</button></div>' +
        '<div class="x-bt-sub" hidden></div></div>');
    ui.appendChild(o); sfx.meet(); vibrate(160, .6);
    var msg = $('.x-bt-msg', o), menu = $('.x-bt-menu', o), subm = $('.x-bt-sub', o);
    function paint(){
      $('.foe .nm', o).textContent = subjName(foe.sp); $('.foe .lv', o).textContent = 'LV ' + foe.lv;
      $('.x-bt-info.foe .x-hpbar i', o).style.width = Math.max(0, foe.hp / foe.max * 100) + '%';
      $('.x-bt-info.foe .x-hpbar', o).className = 'x-hpbar' + (foe.hp / foe.max < .25 ? ' red' : foe.hp / foe.max < .5 ? ' amber' : '');
      $('.x-bt-mon.foe img', o).src = ART.url(critterSpec(foe.sp, 'left', 0), 6);
      $('.me .nm', o).textContent = subjName(me.id); $('.me .lv', o).textContent = 'LV ' + me.lv;
      $('.x-bt-info.me .x-hpbar i', o).style.width = Math.max(0, me.hp / me.max * 100) + '%';
      $('.x-bt-info.me .x-hpbar', o).className = 'x-hpbar' + (me.hp / me.max < .25 ? ' red' : me.hp / me.max < .5 ? ' amber' : '');
      $('.me .hp', o).textContent = Math.max(0, me.hp) + ' / ' + me.max;
      $('.x-gems', o).textContent = '◆◆◆'.slice(0, gems) + '◇◇◇'.slice(0, 3 - gems);
      $('.x-bt-mon.me img', o).src = ART.url(critterSpec(me.sp, 'right', 0), 6);
    }
    function say2(t){ return typeInto(msg, t, 12); }
    function showMenu(){ subm.hidden = true; menu.hidden = false; busy = false; if (padOn) setTimeout(function(){ $('button', menu).focus(); }, 20); }
    function hit(side){ var n = $('.x-bt-mon.' + side, o); n.classList.remove('hit'); void n.offsetWidth; n.classList.add('hit'); sfx.hit(); vibrate(side === 'me' ? 160 : 90, side === 'me' ? .9 : .5); }
    function lunge(side){ var n = $('.x-bt-mon.' + side, o); n.classList.remove('lunge'); void n.offsetWidth; n.classList.add('lunge'); }
    async function attack(att, def, mv, side){
      lunge(side === 'me' ? 'foe' : 'me');
      await say2(subjName(att.sp === me.sp && att === me ? me.id : foe.sp) + ' used ' + mv.n.toUpperCase() + '!');
      var r = damage(att, def, mv); if (att === me && perk('fury')) r.dmg = Math.round(r.dmg * 1.2); def.hp = Math.max(0, def.hp - r.dmg);
      hit(side); paint(); await wait(380);
      var lab = effLabel(r.mult); if (lab) await say2(lab);
    }
    async function foeTurn(){
      var mvs = spMoves(foe.sp), mv = foe.gems >= 2 && Math.random() < .4 ? mvs[2] : mvs[Math.random() < .55 ? 0 : 1];
      if (mv.s === 'A3') foe.gems -= 2;
      await attack(foe, me, mv, 'me');
      foe.gems = Math.min(3, foe.gems + 1);
      S.cards[me.id].hp = me.hp; save();
      if (me.hp <= 0) {
        await say2(subjName(me.id) + ' is spent!');
        var next = teamReady();
        if (!next.length) return lose();
        await say2('Choose another card.');
        return pickCard(true);
      }
    }
    async function turn(action){
      busy = true; menu.hidden = true; subm.hidden = true;
      var meFirst = stat(SP[me.sp].base.spd, me.lv) >= stat(SP[foe.sp].base.spd, foe.lv);
      if (action.move) {
        var mv = action.move;
        if (mv.s === 'A3') gems -= 2;
        if (meFirst) { await attack(me, foe, mv, 'foe'); if (foe.hp <= 0) return win(); await foeTurn(); }
        else { await foeTurn(); if (over || !o.isConnected) return; if (me.hp <= 0) return; await attack(me, foe, mv, 'foe'); if (foe.hp <= 0) return win(); }
      } else if (action.swap) {
        load(action.swap); paint(); await say2('Deploy, ' + subjName(me.id) + '!');
        if (!action.free) await foeTurn();
      } else if (action.photo && boss) {
        await say2('The warden’s Aethren will not hold still for a scan. Not while it commands them.'); await foeTurn();
      } else if (action.photo) {
        var f = foe.hp / foe.max, g = f < .25 ? 'excellent' : f < .5 ? 'good' : Math.random() < .25 ? 'good' : 'fair';
        sfx.shutter(); vibrate(160, .35); o.classList.remove('flash'); void o.offsetWidth; o.classList.add('flash');
        await say2('The AstraNav sweeps it . . .');
        if (g !== 'fair') {
          over = true; mark(foe.sp, 'battled');
          var first = manifest(foe.sp, null, g === 'excellent', foe.lv); S.notes[foe.sp] = 1; gain('data', first ? 4 : 1, true); save();
          await say2((g === 'excellent' ? 'PERFECT LOCK! ' : 'LOCKED! ') + subjName(foe.sp) + ' is in the AstraNav. It slips away, unharmed.');
          c.calm = 120; c.state = 'idle'; await wait(400); close();
          await cardReveal(foe.sp, first, first ? 'PROFILE SCANNED INTO THE ASTRANAV' : 'PROFILE SCANNED AGAIN · QUANTITY +1');
          return;
        }
        await say2('Too much movement. Wear it down first.');
        await foeTurn();
      } else if (action.run) {
        var ch = clamp(.5 + (stat(SP[me.sp].base.spd, me.lv) - stat(SP[foe.sp].base.spd, foe.lv)) / 120, .3, .95);
        if (boss) { await say2('You break away and run!'); close(); if (boss.onRun) boss.onRun(); return; }
        if (Math.random() < ch) { await say2('Got away safely!'); c.cool = 8; c.state = 'idle'; return close(); }
        await say2('Couldn’t get away!'); await foeTurn();
      }
      if (over || !o.isConnected) return;
      if (me.hp > 0) { gems = Math.min(3, gems + 1); paint(); await say2('What will ' + subjName(me.id) + ' do?'); showMenu(); }
    }
    async function win(){
      if (queue.length) {                      // the warden sends the next of its Aethren
        mark(foe.sp, 'battled'); S.notes[foe.sp] = 1;
        $('.x-bt-mon.foe', o).classList.add('calmed');
        await say2(subjName(foe.sp) + ' is beaten back!'); await wait(300);
        var nx = queue.shift(); foe = { sp:nx.sp, lv:nx.lv, max:hpOf(nx.sp, nx.lv) }; foe.hp = foe.max; foe.gems = 1;
        $('.x-bt-mon.foe', o).classList.remove('calmed'); paint(); sfx.warn();
        await say2('The ' + boss.name.toLowerCase().replace(/^warden/, 'warden') + ' sends ' + subjName(foe.sp) + '!');
        gems = Math.min(3, gems + 1); paint(); await say2('What will ' + subjName(me.id) + ' do?'); showMenu(); return;
      }
      if (boss) {
        over = true; mark(foe.sp, 'battled');
        $('.x-bt-mon.foe', o).classList.add('calmed');
        await say2(boss.winLine);
        var cd0 = S.cards[me.id]; cd0.hp = me.hp; cd0.xp = (cd0.xp || 0) + 40 + foe.lv * 4; save();
        await wait(400); close(); if (boss.onWin) boss.onWin(); return;
      }
      over = true; mark(foe.sp, 'battled'); S.notes[foe.sp] = 1;
      if (c.guardian) { S.exp.beaten[M.world] = Date.now(); gainAll(EXP.guardian.reward, true); save(); setTimeout(function(){ toast('THE GUARDIAN STANDS ASIDE · the vault is unguarded · +' + costText(EXP.guardian.reward)); }, 900); }
      var tier = SP[foe.sp].tier || 1, xp = Math.round((8 + foe.lv * 5 * Math.sqrt(tier)) * (S.hq.research['r-cards'] ? 1.3 : 1)); gain('data', 2, true);
      $('.x-bt-mon.foe', o).classList.add('calmed');
      await say2(subjName(foe.sp) + ' is calmed! It stops, and watches you.');
      var cd = S.cards[me.id]; cd.xp = (cd.xp || 0) + xp; cd.hp = me.hp;
      await say2(subjName(me.id) + ' gained ' + xp + ' experience. +2 DATA.');
      while (cd.xp >= cd.lv * 12 + 20 && cd.lv < 100) {
        cd.xp -= cd.lv * 12 + 20; var oldMax = maxHp(me.id); cd.lv++; cd.hp = Math.min(maxHp(me.id), cd.hp + maxHp(me.id) - oldMax);
        load(me.id); paint(); sfx.reveal(); vibrate(80, .4);
        await say2(subjName(me.id) + ' grew to level ' + cd.lv + '!');
      }
      save();
      c.calm = 120; c.state = 'idle'; c.cool = 3;
      menu.hidden = true;
      subm.innerHTML = '<button data-w="photo">SCAN IT</button><button data-w="leave">LEAVE IT BE</button>'; subm.hidden = false;
      if (padOn) setTimeout(function(){ $('button', subm).focus(); }, 20);
      subm.onclick = async function(ev){
        var b = ev.target.closest('[data-w]'); if (!b) return;
        if (b.dataset.w === 'photo') {
          var first = manifest(foe.sp, null, true, foe.lv); S.notes[foe.sp] = 1; gain('data', first ? 4 : 1, true); save(); sfx.shutter(); vibrate(160, .35);
          o.classList.remove('flash'); void o.offsetWidth; o.classList.add('flash');
          subm.hidden = true;
          await say2('It holds perfectly still. A perfect scan.');
          await wait(400); close();
          await cardReveal(foe.sp, first, first ? 'PROFILE SCANNED · FIRST EDITION · CLONE IT AT HOME' : 'SCANNED AGAIN · QUANTITY +1');
          return;
        }
        close();
      };
    }
    async function lose(){
      over = true;
      if (boss) { await say2(boss.loseLine); await wait(400); close(); if (boss.onLose) boss.onLose(); return; }
      await say2('Your party is spent! You fall back, and it lets you go.');
      S.suit = Math.max(1, S.suit - suitDmg(15)); save(); c.cool = 10; c.calm = 30;
      await wait(500); close();
    }
    function close(){ o.remove(); encounterOpen = false; hudRefresh(); }
    function pickCard(forced){
      var list = teamReady();
      subm.innerHTML = list.map(function(id){ return teamChip(id); }).join('') + (forced ? '' : '<button data-x="back" class="ghost">BACK</button>');
      subm.hidden = false; menu.hidden = true; busy = false;
      if (padOn) setTimeout(function(){ $('button', subm).focus(); }, 20);
      subm.onclick = function(ev){
        if (ev.target.closest('[data-x="back"]')) return showMenu();
        var b = ev.target.closest('[data-card]'); if (!b || busy) return;
        if (b.dataset.card === me.id && me.hp > 0) return;
        turn({ swap:b.dataset.card, free:forced });
      };
    }
    menu.addEventListener('click', function(ev){
      var b = ev.target.closest('[data-b]'); if (!b || busy || over) return;
      sfx.click();
      if (b.dataset.b === 'fight') {
        subm.innerHTML = spMoves(me.sp).map(function(m, i){
          var cost = m.s === 'A3' ? 2 : 0;
          return '<button data-m="' + i + '" style="--tc:' + typeCol(m.t) + '"' + (cost > gems ? ' disabled' : '') + '><b>' + esc(m.n.toUpperCase()) + '</b><span>' + esc(m.t.toUpperCase()) + (cost ? ' · ◆◆' : '') + '</span></button>';
        }).join('') + '<button data-x="back" class="ghost">BACK</button>';
        subm.hidden = false; menu.hidden = true;
        if (padOn) setTimeout(function(){ $('button:not([disabled])', subm).focus(); }, 20);
        subm.onclick = function(e2){
          if (e2.target.closest('[data-x="back"]')) return showMenu();
          var mb = e2.target.closest('[data-m]'); if (!mb || mb.disabled || busy) return;
          turn({ move:spMoves(me.sp)[+mb.dataset.m] });
        };
      }
      if (b.dataset.b === 'cards') pickCard(false);
      if (b.dataset.b === 'photo') turn({ photo:true });
      if (b.dataset.b === 'run') turn({ run:true });
    });
    paint();
    busy = true; menu.hidden = true;
    (async function(){
      await say2((charged ? 'It charges! ' : '') + 'A wild ' + subjName(foe.sp) + ' (LV ' + foe.lv + ')!');
      await say2('Deploy, ' + subjName(me.id) + '!');
      showMenu();
    })();
  }

  // ── drawing the surface: only the tiles on screen, every frame ──
  var specCache = {};
  function tileSpec(ri, ch, x, y, fr){
    var key = ri + ch + ((x * 7 + y * 13) % 5 === 0 ? 'v' : '') + fr + (M.indoor ? 'i' : '');
    var c = specCache[key]; if (c) return c;
    var e = M.envs[ri] || M.envs[0], t = e.tiles, id = e.id, s;
    if (M.indoor) s = ch === '#' ? 'rock' : 'den';
    else if (ch === '~') s = (t.liquid === 'water' && fr ? 'water1' : t.liquid) + '@' + id + '-liquid';
    else if (ch === 'd' || ch === 'x') s = t.path + '@' + id + '-path';
    else if (ch === '#') s = t.wall + '@' + id + '-wall';
    else if (ch === 'E') s = 'cave';
    else if (ch === ',' && t.special) s = t.special + '@' + id + '-special';
    else if (ch === ',' && t.ground === 'grass') s = 'flowers@' + id + '-ground';
    else s = (t.ground === 'grass' && key.indexOf('v') > 0 ? 'grass2' : t.ground) + '@' + id + '-ground';
    return (specCache[key] = s);
  }
  var OBJ = 'TbBAMXPLSwFK';
  function objSpec(ch, i, e, now){
    var no = M.world;
    if (ch === 'T') return 'tree';
    if (ch === 'b') return no === 9 ? 'shrub' : 'shrub@pl-' + no;
    if (ch === 'B') return 'boulder@' + e.id + '-wall';
    if (ch === 'A') return no === 9 ? ART.frame('astralite', 'any', now / 500) : 'astralite@mn-' + no;
    if (ch === 'M') return M.indoor || no === 9 ? 'markings' : 'markings@' + e.id + '-wall';
    if (ch === 'X') return M.hq ? 'hq_rubble' : 'sign';
    if (ch === 'w') return 'hq_scrap';
    if (ch === 'L') return 'spire@lm-gold';
    if (ch === 'K') return S.hq.installed[no] || S.hq.parts[no] || S.exp.vault[no] ? 'ruin_vault' : 'rest_vault';
    if (ch === 'P') { var p = M.props[i]; return p ? p[0] + (p[1] ? '@' + e.id + '-' + p[1] : '') : 'boulder'; }
    return null;
  }
  function drawSurface(now){
    var w = cv.width, h = cv.height, z = zoom(), TZ = T * z;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = M.indoor ? '#0d0a08' : '#0b0912'; ctx.fillRect(0, 0, w, h);
    var ox = Math.round((w / 2 - (P.fx + .5) * TZ) / z) * z, oy = Math.round((h / 2 - (P.fy + .5) * TZ) / z) * z;
    var x0 = Math.max(0, Math.floor(-ox / TZ) - 1), x1 = Math.min(M.W - 1, Math.ceil((w - ox) / TZ) + 1),
        y0 = Math.max(0, Math.floor(-oy / TZ) - 1), y1 = Math.min(M.H - 1, Math.ceil((h - oy) / TZ) + 2);
    var fr = Math.floor(now / 650) % 2, list = [], x, y;
    for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) {
      var i = y * M.W + x, ch = M.grid[i], ri = M.region[i];
      var under = OBJ.indexOf(ch) >= 0 || ch === '*' ? (ch === 'X' && M.hq ? 'd' : '.') : ch;
      var cnv = ART.canvas(tileSpec(ri, under, x, y, fr));
      if (cnv) ctx.drawImage(cnv, ox + x * TZ, oy + y * TZ, TZ, TZ);
      if (ch === '*' && M.codexFinds && M.codexFinds[i] && !S.found[M.id + ':' + x + ',' + y]) { ctx.fillStyle = fr ? '#ffe9a0' : '#d9a441'; var gs = TZ / 8; ctx.fillRect(ox + x * TZ + TZ / 2 - gs / 2, oy + y * TZ + TZ / 2 - gs * 1.5, gs, gs * 3); ctx.fillRect(ox + x * TZ + TZ / 2 - gs * 1.5, oy + y * TZ + TZ / 2 - gs / 2, gs * 3, gs); }   // a Codex relic glints
      if (OBJ.indexOf(ch) >= 0 && ch !== 'S' && ch !== 'F') list.push({ k:ch, i:i, x:x, y:y, s:y, ri:ri });
    }
    if (M.ship) { ctx.fillStyle = 'rgba(40,24,12,.35)'; ctx.beginPath(); ctx.ellipse(ox + (M.ship.x + .5) * TZ, oy + (M.ship.y + .85) * TZ, 1.2 * TZ, .4 * TZ, 0, 0, 7); ctx.fill(); list.push({ k:'ship', x:M.ship.x, y:M.ship.y, s:M.ship.y + .1 }); }
    npcs.forEach(function(n){ if (n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1) list.push({ k:'npc', n:n, x:n.x, y:n.y, s:n.y }); });
    (M.structs || []).forEach(function(st){ if (st.x + st.w >= x0 - 2 && st.x <= x1 + 2 && st.y >= y0 - 1 && st.y <= y1 + 4) list.push({ k:'struct', st:st, x:st.x, y:st.y, s:st.y }); });
    critters.forEach(function(c){ if (c.x >= x0 - 1 && c.x <= x1 + 1 && c.y >= y0 - 1 && c.y <= y1 + 1) list.push({ k:'critter', c:c, s:c.fy + (c.flies ? .5 : 0) }); });
    if (COMPANIONS.follow && onFoot()) {
      var party = teamReady(), slots = [[-1,1],[1,1],[-2,2],[2,2],[-1,3],[1,3],[-3,3],[3,3], [0,4]];
      party.forEach(function(id, pi){ var sl = slots[pi] || [0, pi + 2]; list.push({ k:'companion', id:id, x:P.fx + sl[0], y:P.fy + sl[1], s:P.fy + sl[1] }); });
    }
    list.push({ k:'player', s:P.fy + .01 });
    list.sort(function(a, b){ return a.s - b.s; });
    list.forEach(function(o){
      var X = ox + ((o.c ? o.c.fx : o.k === 'player' ? P.fx : o.x) + .5) * TZ, Y = oy + ((o.c ? o.c.fy : o.k === 'player' ? P.fy : o.y) + 1) * TZ;
      if (o.k === 'struct') { ART.draw(ctx, o.st.spr, ox + (o.st.x + o.st.w / 2) * TZ, Y, z); return; }
      if (o.k === 'ship') { ART.draw(ctx, 'ship', X, Y + 2 * z, z);
        if (M.hq && !S.hq.drive) for (var sm = 0; sm < 4; sm++) { var ph = ((now / 1600) + sm / 4) % 1; ctx.fillStyle = 'rgba(70,66,60,' + (.45 * (1 - ph)).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(X + Math.sin(ph * 6 + sm) * 6 * z, Y - (26 + ph * 26) * z, (3 + ph * 6) * z, 0, 7); ctx.fill(); } }
      else if (o.k === 'npc' && o.n.warden) {
        shadow(X, Y, z, 12); ART.draw(ctx, withRc(ART.frame('haemen', o.n.dir, 0), 'ppl-' + o.n.env), X, Y, z);
        var wy = Y - 21 * z + Math.sin(now / 200) * z; ctx.fillStyle = '#1c0a08'; ctx.fillRect(X - 4 * z, wy - z, 8 * z, 10 * z);
        ctx.fillStyle = '#ff4a2a'; ctx.fillRect(X - z, wy, 2 * z, 5 * z); ctx.fillRect(X - z, wy + 6 * z, 2 * z, 2 * z);
      }
      else if (o.k === 'npc') { shadow(X, Y, z, 10); ART.draw(ctx, o.n.key === 'furtrader' ? ART.frame('haemen', o.n.dir, 0) : withRc(ART.frame('haemen', o.n.dir, 0), 'ppl-' + o.n.env), X, Y, z); }
      else if (o.k === 'critter') drawCritter(o.c, X, Y, z, now);
      else if (o.k === 'companion') drawCompanion(o.id, X, Y, z, now);
      else if (o.k === 'player') drawPlayer(X, Y, z);
      else {
        var spc = objSpec(o.k, o.i, M.envs[o.ri] || M.envs[0], now);
        if (o.k === 'L') { ctx.fillStyle = 'rgba(255,220,140,' + (.18 + .1 * Math.sin(now / 300)) + ')'; ctx.beginPath(); ctx.ellipse(X, Y - 2 * z, 10 * z, 4 * z, 0, 0, 7); ctx.fill(); }
        if (spc) ART.draw(ctx, spc, X, Y, z);
      }
    });
    for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) {
      if (fogArr[y * M.W + x]) continue;
      ctx.fillStyle = M.indoor ? 'rgba(6,4,3,.96)' : 'rgba(11,9,18,.9)';
      ctx.fillRect(ox + x * TZ, oy + y * TZ, TZ, TZ);
    }
    if (M.indoor) {
      var gr = ctx.createRadialGradient(w / 2, h / 2, TZ * 1.5, w / 2, h / 2, TZ * 5);
      gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.7)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
    }
    // facing marker: what A will examine (pocket-style corner brackets)
    if (!P.moving && !dialogOpen) {
      var f = facing(), fx = ox + f.x * TZ, fy = oy + f.y * TZ, fc = at(f.x, f.y);
      var interesting = 'TbAMSXBLPwF'.indexOf(fc) >= 0 || critterAt(f.x, f.y) || npcAt(f.x, f.y);
      if (interesting && Math.floor(now / 400) % 2) {
        ctx.fillStyle = '#ffe08a';
        [[0,0],[T-3,0],[0,T-3],[T-3,T-3]].forEach(function(c){ ctx.fillRect(fx + c[0] * z, fy + c[1] * z, 3 * z, z); ctx.fillRect(fx + c[0] * z + (c[0] ? 2 * z : 0), fy + c[1] * z, z, 3 * z); });
      }
    }
  }
  function drawCritter(c, X, Y, z, now){
    if (!fogArr[c.y * M.W + c.x]) return;
    var lift = c.flies ? Math.round(5 + Math.sin(now / 160 + c.x) * 2) * z : 0, inWater = c.swims && at(c.x, c.y) === '~';
    if (!inWater) shadow(X, Y, z, c.flies ? 8 : 12);
    var n = c.flies ? now / 90 : (c.t < 1 ? c.anim * .6 : 0), sx = c.state === 'warn' ? (Math.floor(now / 60) % 2 ? z : -z) : 0;
    var spec = critterSpec(c.id, c.dir, n);
    if (inWater) {
      var cnv = ART.canvas(spec); if (cnv) { ctx.drawImage(cnv, 0, 0, cnv.width, cnv.height - 5, Math.round(X - cnv.width * z / 2), Math.round(Y - cnv.height * z), cnv.width * z, (cnv.height - 5) * z); }
    } else ART.draw(ctx, spec, X + sx, Y - lift, z);
    if (c.state === 'warn' || c.state === 'flee') {
      var bx = X - 3 * z, by = Y - 19 * z - lift;
      ctx.fillStyle = '#1c1626'; ctx.fillRect(bx - z, by - z, 8 * z, 10 * z);
      ctx.fillStyle = c.state === 'warn' ? '#ffde59' : '#ffffff'; ctx.fillRect(bx + 2 * z, by, 2 * z, 5 * z); ctx.fillRect(bx + 2 * z, by + 6 * z, 2 * z, 2 * z);
    }
  }
  function drawCompanion(id, X, Y, z, now){
    var s = subj(id), sp = s && s.sp;
    if (!sp) return;
    shadow(X, Y, z, 10);
    var bob = Math.sin(now / 220 + id.length) * z;
    ART.draw(ctx, critterSpec(sp, 'down', Math.floor(now / 260) % 2), X, Y - bob, z);
  }
  function drawPlayer(X, Y, z){
    shadow(X, Y, z, 10);
    var stp = P.moving ? Math.floor(P.anim / 1.6) % 4 : 0, g = P.gait, now = performance.now();
    // sprint: kicked-up dust behind the boots
    if (g === 'sprint' && P.moving && (!P.dust.length || now - P.dust[P.dust.length - 1].t > 70)) P.dust.push({ x:P.fx, y:P.fy, t:now, j:(Math.random() - .5) * 6 });
    P.dust = P.dust.filter(function(d){ return now - d.t < 420; });
    P.dust.forEach(function(d){
      var k = (now - d.t) / 420, dx = X + (d.x - P.fx) * T * z + d.j * z, dy = Y + (d.y - P.fy) * T * z - k * 5 * z, r = Math.max(1, Math.round((1 + k * 2.5) * z));
      ctx.fillStyle = 'rgba(214,200,170,' + (.55 * (1 - k)).toFixed(2) + ')'; ctx.fillRect(Math.round(dx - r), Math.round(dy - r), r * 2, r * 2);
    });
    if (g === 'stalk') {
      // stalk: crouched low, half-shadowed, careful steps
      ctx.save(); ctx.translate(X, Y); ctx.scale(1.06, .84);
      ART.draw(ctx, heroSpec(P.dir, stp), 0, 0, z, .78); ctx.restore();
    } else if (g === 'sprint' && P.moving) {
      // sprint: a running bob, the body leaning into the run
      var bob = (stp % 2 ? 1 : 0) * z, lean = P.dir === 'left' ? -.08 : P.dir === 'right' ? .08 : 0;
      ctx.save(); ctx.translate(X, Y - bob); if (lean) ctx.transform(1, 0, -lean, 1, 0, 0);
      ART.draw(ctx, heroSpec(P.dir, stp), 0, 0, z); ctx.restore();
    } else ART.draw(ctx, heroSpec(P.dir, stp), X, Y, z);
  }

  // ═════════════════════════ INPUT · keyboard, touch, DualSense ═════════════════════════
  var padOn = false, padHeld = false;
  function surfaceFree(){ return mode === 'surface' && !dlg && !encounterOpen && !doc.querySelector('.x-modal, .x-battle'); }
  function visible(n){
    if (!n || n.disabled || n.closest('[hidden]')) return false;
    var r = n.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
  }
  function topLayer(){
    var L = doc.querySelector('.x-battle') || doc.querySelector('.x-encounter') || doc.querySelector('.x-modal:last-of-type');
    if (L) return L;
    if (dlg && dlg.box && dlg.box.classList.contains('ask')) return dlg.box;
    var sh = doc.querySelector('.x-sheet:not([hidden])'); if (sh && sh.contains(doc.activeElement)) return sh;
    return ui.querySelector('.x-screen') || ui;
  }
  var FOCUSABLE = 'button, a[href], input[type=range], [data-nav]';
  function cands(L){ return Array.prototype.slice.call(L.querySelectorAll(FOCUSABLE)).filter(visible); }
  function focusFirst(){
    var L = topLayer(), list = cands(L); if (!list.length) return;
    var pick = list.filter(function(n){ return n.matches('[data-first]'); })[0] || list.filter(function(n){ return n.matches('[data-c], .x-btn:not(.ghost), .x-press, .x-station:not([disabled])'); })[0] || list[0];
    pick.focus({ preventScroll:false });
  }
  function navFocus(dir){
    var L = topLayer(), list = cands(L), cur = doc.activeElement;
    if (!list.length) return;
    if (!cur || list.indexOf(cur) < 0) { focusFirst(); return; }
    if (cur.matches('input[type=range]') && (dir === 'left' || dir === 'right')) {
      cur.value = clamp(+cur.value + (dir === 'right' ? 40 : -40), +cur.min, +cur.max); cur.dispatchEvent(new Event('input', { bubbles:true })); return;
    }
    var a = cur.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2, best = null, bs = 1e9;
    list.forEach(function(n){
      if (n === cur) return;
      var r = n.getBoundingClientRect(), dx = r.left + r.width / 2 - ax, dy = r.top + r.height / 2 - ay, p, q;
      if (dir === 'right') { p = dx; q = dy; } else if (dir === 'left') { p = -dx; q = dy; } else if (dir === 'down') { p = dy; q = dx; } else { p = -dy; q = dx; }
      if (p <= 4) return;
      var sc = p + Math.abs(q) * 2.2;
      if (sc < bs) { bs = sc; best = n; }
    });
    if (best) { best.focus({ preventScroll:true }); try { best.scrollIntoView({ block:'nearest', inline:'nearest' }); } catch(e){} sfx.key(); }
  }
  function activate(){
    var L = topLayer(), cur = doc.activeElement;
    if (!cur || !L.contains(cur) || cur === doc.body) { focusFirst(); return; }
    if (cur.tagName === 'BUTTON' || cur.tagName === 'A') cur.click();
    else cur.dispatchEvent(new MouseEvent('click', { bubbles:true }));
  }
  function goBack(){
    var L = topLayer();
    var b = L.querySelector('.x-camx:not([hidden])');
    if (b && visible(b)) { b.click(); return; }
    b = ['[data-e="leave"]', '[data-x="back"]', '[data-t="close"]', '[data-a="close"]', '[data-a="back"]', '.x-back'].map(function(sel){ return L.querySelector(sel); }).filter(visible)[0];
    if (b) { b.click(); return; }
    if (L.classList.contains('x-modal')) { L.remove(); return; }
    var sh = doc.querySelector('.x-sheet:not([hidden]) [data-a="close"]'); if (sh) { sh.click(); return; }
    var bk = doc.querySelector('.x-back'); if (bk) bk.click();
  }

  var keys = {}, KEYDIR = { arrowup:'up', w:'up', arrowdown:'down', s:'down', arrowleft:'left', a:'left', arrowright:'right', d:'right' };
  addEventListener('keydown', function(e){
    if (e.target && /TEXTAREA/.test(e.target.tagName)) return;
    var k = e.key.toLowerCase(), d = KEYDIR[k];
    if (doc.querySelector('.x-name') && /^[a-z]$/.test(k)) return;      // the naming screen types letters
    if (dlg && !(dlg.box.classList.contains('ask'))) {
      if (k === 'z' || k === 'enter' || k === ' ') { e.preventDefault(); advanceDialog(); }
      else if (k === 'x' || k === 'escape' || k === 'backspace') { e.preventDefault(); advanceDialog(true); }
      return;
    }
    if (surfaceFree()) {
      if (d) { e.preventDefault(); keys[d] = true; held = d; path = []; return; }
      if (k === 'z' || k === 'enter' || k === ' ') { e.preventDefault(); btnA(); }
      if (k === 'x' || k === 'escape' || k === 'backspace') { e.preventDefault(); btnB(); }
      if (k === 'j' || k === 'm' || k === 'tab') { e.preventDefault(); openNav(); }
      return;
    }
    if (e.target && e.target.matches && e.target.matches('input[type=range]') && (k === 'arrowleft' || k === 'arrowright')) return;
    if (k.indexOf('arrow') === 0) { e.preventDefault(); navFocus(d); return; }
    if (doc.querySelector('.x-nav-tabs') && !doc.querySelector('.x-modal') && (k === 'q' || k === 'e' || k === '[' || k === ']')) { navCycle(k === 'q' || k === '[' ? -1 : 1); return; }
    if (k === 'escape' || (k === 'backspace' && !doc.querySelector('.x-name'))) { e.preventDefault(); goBack(); }
  });
  addEventListener('keyup', function(e){
    var d = KEYDIR[e.key.toLowerCase()];
    if (d) { keys[d] = false; if (held === d) held = ['up','down','left','right'].filter(function(x){ return keys[x]; })[0] || null; }
  });

  if (PAD) {
    PAD.on('connect', function(gp, ds){
      padOn = true; doc.body.classList.add('pad'); doc.body.classList.toggle('dualsense', !!ds);
      toast(ds ? 'DUALSENSE CONNECTED' : 'CONTROLLER CONNECTED'); vibrate(120, .5);
      if (!surfaceFree()) setTimeout(focusFirst, 30);
    });
    PAD.on('disconnect', function(){ padOn = false; doc.body.classList.remove('pad', 'dualsense'); toast('CONTROLLER DISCONNECTED'); });
    PAD.on('dir', function(d){
      if (surfaceFree()) { if (d) { held = d; padHeld = true; path = []; } else if (padHeld) { held = null; padHeld = false; } }
      else if (padHeld) { held = null; padHeld = false; }
    });
    PAD.on('nav', function(d){ if (!surfaceFree()) navFocus(d); });
    PAD.on('press', function(b){
      if (titleStart && doc.querySelector('.x-title .x-press:not([hidden])')) { titleStart(); return; }
      if (doc.querySelector('.x-name') && b === 'triangle') { var ok = $('[data-k="OK"]'); if (ok) ok.focus(); return; }
      if (doc.querySelector('.x-name') && b === 'square') { var del = $('[data-k="DEL"]'); if (del) del.click(); return; }
      var ask = dlg && dlg.box.classList.contains('ask');
      if (b === 'cross') { if (dlg && !ask) advanceDialog(); else if (surfaceFree()) btnA(); else activate(); }
      else if (b === 'circle') { if (dlg && !ask) advanceDialog(true); else if (ask) closeDialog(dlg.choices.length - 1); else if (surfaceFree()) btnB(); else goBack(); }
      else if (b === 'square') {
        var ph = doc.querySelector('.x-encounter .x-shutter'); if (ph && visible(ph)) { ph.click(); return; }
        ph = doc.querySelector('.x-encounter [data-e="scan"]'); if (ph && visible(ph)) { ph.click(); return; }
        ph = doc.querySelector('.x-battle [data-b="photo"]'); if (ph && visible(ph)) { ph.click(); return; }
        if (surfaceFree()) btnB();
      }
      else if (b === 'triangle') { if (!surfaceFree() && doc.querySelector('.x-nav-close') && !doc.querySelector('.x-modal')) backToField(); else if (!surfaceFree() && doc.querySelector('.x-battle [data-b="cards"]')) { var cb = doc.querySelector('.x-battle [data-b="cards"]'); if (visible(cb)) cb.click(); } }
      else if (b === 'options') { if (!surfaceFree()) goBack(); }
      else if (b === 'touchpad') { if (doc.querySelector('.x-nav-tabs')) { if (onFoot() && !doc.querySelector('.x-modal')) backToField(); } else if (surfaceFree()) openNav('system'); }
      else if ((b === 'l1' || b === 'r1') && doc.querySelector('.x-nav-tabs') && !doc.querySelector('.x-modal') && !(doc.activeElement && doc.activeElement.closest && doc.activeElement.closest('.x-kit-row'))) navCycle(b === 'l1' ? -1 : 1);
      else if (b === 'l1' || b === 'r1') {
        var row = doc.activeElement && doc.activeElement.closest && doc.activeElement.closest('.x-kit-row');
        if (row) { var bt = row.querySelector('[data-d="' + (b === 'l1' ? -1 : 1) + '"]'); if (bt) bt.click(); }
      }
    });
    PAD.on('frame', function(st){
      var sv = doc.querySelector('.x-spiral'), trig = st.r2 - st.l2;
      if (sv && (st.rx || st.ry || Math.abs(trig) > .05)) {
        VIEW.x = clamp(VIEW.x + st.rx * VIEW.w * .012, -600, 600); VIEW.y = clamp(VIEW.y + st.ry * VIEW.w * .012, -300, 300);
        if (Math.abs(trig) > .05) VIEW.w = clamp(VIEW.w * (1 - trig * .02), 360, 1600);
        setView(sv); return;
      }
      if (Math.abs(trig) > .05) {
        var ring = Array.prototype.slice.call(doc.querySelectorAll('.x-ring input')).filter(visible)[0];
        if (ring) { ring.value = clamp(+ring.value + trig * 14, 0, 1000); ring.dispatchEvent(new Event('input', { bubbles:true })); }
      }
    });
  }

  // ───────────────────────── boot ─────────────────────────
  // ?debug exposes internals for automated tests only.
  if (/[?&]debug\b/.test(location.search)) window.__x = { S:function(){ return S; }, P:function(){ return P; }, M:function(){ return M; }, critters:function(){ return critters; }, npcs:function(){ return npcs; },
    tp:function(x, y, dir){ P.x = P.fx = x; P.y = P.fy = y; P.dir = dir || P.dir; P.moving = false; path = []; revealFog(); checkZone(); },
    battle:function(c){ if (COMPANIONS.battle) battle(c || critters[0], false); }, encounter:function(c){ encounter(c || critters[0], false); },
    surface:surface, ship:function(){ ship(); }, nav:nav, travel:travel, touchdown:touchdown, give:function(id, lv){ manifest(id, null, false, lv || 5); },
    nav:navFocus, activate:activate, back:goBack, btnA:function(){ btnA(); },
    hq:function(){ return S.hq; }, pack:function(){ return S.pack; }, give2:function(o){ gainAll(o, true); }, store:function(o){ Object.keys(o).forEach(function(k){ S.hq.store[k] = (S.hq.store[k] || 0) + o[k]; }); save(); },
    buildFac:buildFac, restoreRuin:restoreRuin, study:study, repairDrive:repairDrive, deposit:deposit, stage:hqStage, crash:crash, buildTank:buildTank, airMax:function(){ return airMax(); }, exp:function(){ return S.exp; }, installPart:installPart, settle:settleAethren, wardenMeet:function(){ var w = npcs.filter(function(n){ return n.warden; })[0]; if (w) wardenMeet(w); }, openVault:openVault, perk:function(){ return leadPerk(); }, codex:function(){ return S.codex; }, codexUnlock:function(id){ cxUnlock(id, 'debug'); }, beingOpen:function(id){ return beingOpen(CXB[id]); }, clone:function(id){ return COMPANIONS.clone ? cloneCard(id) : false; }, openNav:function(t){ openNav(t); }, giveClone:function(id, lv){ if (!COMPANIONS.clone) return false; manifest(id, null, false, lv || 5); S.cards[id].pend = 0; S.cards[id].clone = Date.now(); S.cards[id].hp = maxHp(id); autoTeam(); save(); return true; } };
  applyOpts();
  if (S) applyLook();
  title();
})();
