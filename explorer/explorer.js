// ★ 2026-10-07 · PROJECT 1936 (working title) · first playable slice
// Design: docs/card-explorer/01_EXPLORATION_DESIGN.md · Content: explorer/data.js
//
// Flow: title → dossier → launch & malfunction → adrift (ship) → observation port
//       → star chart → descent → Malezor survey zone → back aboard → darkroom
//       (photos become cards) → laboratory (specimens, decoding) → reclassification.
(function(){
  'use strict';
  var D = window.EXP_DATA;
  var doc = document, ui = doc.getElementById('ui'), cv = doc.getElementById('view'), ctx = cv.getContext('2d');
  var A = '/explorer/assets/';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ───────────────────────── save ─────────────────────────
  var KEY = 'aov.explorer.v1';
  function blank(){
    return { v:1, name:'', stage:'title', flags:{}, film:12, frames:[], jars:[], archive:{}, cards:{}, lex:{},
             suit:100, air:100, flares:2, landed:false, pos:null, fog:'', notes:{}, sound:false, started:Date.now() };
  }
  var S = null;
  try { S = JSON.parse(localStorage.getItem(KEY)); } catch(e){}
  if (!S || S.v !== 1 || /[?&]newgame\b/.test(location.search)) S = null;
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){ /* storage full or blocked: keep playing */ } }

  // ───────────────────────── helpers ─────────────────────────
  function el(tag, cls, html){ var n = doc.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function $(sel, root){ return (root || ui).querySelector(sel); }
  function $$(sel, root){ return Array.prototype.slice.call((root || ui).querySelectorAll(sel)); }
  function clamp(v, a, b){ return v < a ? a : v > b ? b : v; }
  function term(t){ var L = D.lexicon[t]; return L ? (S.lex[t] ? L.canon : L.unknown) : t; }
  function subj(id){ return D.subjects[id]; }
  function subjName(id){ return term(subj(id).term); }
  function setName(n){ return 'SET ' + (n < 10 ? '0' : '') + n + ' — ' + term(D.sets[n].term); }
  function wait(ms){ return new Promise(function(r){ setTimeout(r, reduced ? Math.min(ms, 60) : ms); }); }
  function pad2(n){ return (n < 10 ? '0' : '') + n; }

  // ───────────────────────── sound (off by default) ─────────────────────────
  var actx = null;
  function tone(f, d, type, vol, when){
    if (!S || !S.sound) return;
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
    click:   function(){ tone(420, .05, 'square', .04); tone(180, .06, 'square', .04, .03); },
    shutter: function(){ tone(2400, .02, 'square', .05); tone(900, .05, 'sawtooth', .04, .03); },
    warn:    function(){ tone(220, .25, 'sawtooth', .05); tone(180, .25, 'sawtooth', .05, .25); },
    reveal:  function(){ [392,494,587,784].forEach(function(f,i){ tone(f, .18, 'triangle', .04, i*.09); }); }
  };

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
      function finish(){ if (done) return; done = true; node.textContent = text; node.removeEventListener('click', finish); res(); }
      node.addEventListener('click', finish);
      if (reduced) return finish();
      (function step(){
        if (done) return;
        node.textContent = text.slice(0, ++i);
        if (i % 2) sfx.key();
        if (i >= text.length) finish(); else setTimeout(step, speed || 22);
      })();
    });
  }

  // ───────────────────────── archive & cards ─────────────────────────
  var POINTS = { aethren:{observe:1, fair:1, classified:2}, astralite:{specimen:1, classified:2},
                 location:{reached:1, classified:2}, celestial:{fair:1, classified:2} };
  function arc(id){ return S.archive[id] || (S.archive[id] = {}); }
  function mark(id, what){
    var a = arc(id); if (a[what]) return false;
    a[what] = Date.now(); save(); return true;
  }
  function setPct(n){
    var got = 0, max = 0;
    Object.keys(D.subjects).forEach(function(id){
      var s = subj(id); if (s.set !== n) return;
      var P = POINTS[s.kind] || {}, a = S.archive[id] || {};
      Object.keys(P).forEach(function(k){ max += P[k]; if (a[k] || (k === 'fair' && a.classified)) got += P[k]; });
    });
    return max ? Math.round(got / max * 100) : 0;
  }
  function classifiedCount(kind){
    return Object.keys(S.archive).filter(function(id){ return S.archive[id].classified && (!kind || subj(id).kind === kind); }).length;
  }
  function manifest(id, img, foil){
    var c = S.cards[id], first = !c;
    if (!c) c = S.cards[id] = { qty:0, img:img || null, foil:false, at:Date.now() };
    c.qty++; if (foil) c.foil = true; if (!c.img && img) c.img = img;
    if (!arc(id).classified) arc(id).classified = Date.now();
    save();
    return first;
  }
  function rarity(s){ return s.tier ? s.tier + '/10' : 'UNRATED'; }
  function classLine(s){
    if (s.kind === 'aethren') return term('aethren');
    if (s.kind === 'astralite') return 'MINERAL SPECIMEN';
    if (s.kind === 'location') return 'LOCATION';
    return 'CELESTIAL BODY';
  }
  function cardHtml(id, big){
    var s = subj(id), c = S.cards[id] || { qty:0 };
    var art = c.img ? '<img alt="" src="' + c.img + '">'
      : (s.sprite ? '<span class="x-spr" style="background-image:url(' + A + s.sprite + ')"></span>' : '<span class="x-noimg">NO PLATE</span>');
    var rows = [['SET', setName(s.set)], ['CLASS', classLine(s)]];
    if (s.district) rows.push(['WORLD', term('zyraxis')], ['DISTRICT', term(s.district)]);
    if (s.kind === 'aethren') rows.push(['SPECIES', subjName(id)]);
    rows.push(['RARITY', rarity(s)], ['QUANTITY', String(c.qty)]);
    return '<div class="x-card' + (c.foil ? ' foil' : '') + (big ? ' big' : '') + '" data-card="' + id + '">' +
      '<div class="x-card-band">' + esc(setName(s.set)) + '</div>' +
      '<div class="x-card-art">' + art + '</div>' +
      '<div class="x-card-nm">' + esc(subjName(id)) + '</div>' +
      (big ? '<dl class="x-card-dl">' + rows.map(function(r){ return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl>' +
        (s.canonNote && S.lex[s.term] ? '<p class="x-card-canon">' + esc(s.canonNote) + '</p>' : '') +
        '<p class="x-card-note">“' + esc(s.journal) + '”</p>'
        : '<div class="x-card-meta"><span>' + esc(classLine(s)) + '</span><b>' + rarity(s) + '</b></div>') +
      (c.qty > 1 ? '<span class="x-qty">×' + c.qty + '</span>' : '') +
      '</div>';
  }

  // ───────────────────────── objectives (Expedition Log) ─────────────────────────
  function objectives(){
    var F = S.flags, fauna = classifiedCount('aethren');
    return [
      { t:'Restore ship systems: power, air, wireless', done: F.power && F.air && F.radio },
      { t: S.lex.aenor ? 'Photograph Aenor and Zoryth' : 'Photograph the primary radiant body and its satellite', done: F.shotAenor && F.shotZoryth },
      { t:'Take instrument readings; plot the nearest bodies', done: F.charted },
      { t: S.lex.zyraxis ? 'Land on Zyraxis' : 'Land on the crystalline body', done: S.landed },
      { t:'Document three forms of local fauna (' + Math.min(fauna,3) + '/3 classified)', done: fauna >= 3 },
      { t: S.lex.astralite ? 'Recover an Astralite specimen' : 'Recover an unknown crystalline specimen', done: F.sampled },
      { t: S.lex.firstden ? 'Copy the carved markings at The First Den' : 'Copy the carved markings at the stone clearing', done: F.copied },
      { t:'Aboard ship: develop film, analyse specimens', done: F.developed && (F.analysed || !F.sampled) },
      { t:'Decode the markings (Laboratory)', done: F.decoded },
      { t:'FIND A WAY HOME', done:false, main:true }
    ];
  }

  // ═════════════════════════ SCENES (DOM) ═════════════════════════
  function screen(cls, html){
    stopWorld();
    camOpen = false; doc.body.classList.remove('cam-on'); aim = { x:0, y:0 };
    ui.innerHTML = ''; var s = el('div', 'x-screen ' + cls, html); ui.appendChild(s); return s;
  }

  // ── title ──
  function title(){
    var s = screen('x-title',
      '<div class="x-title-in">' +
        '<p class="x-stamp">TOP SECRET</p>' +
        '<h1>PROJECT<br>1936</h1>' +
        '<p class="x-tsub">AN AOV™ SAGA EXPEDITION · FIRST PLAYABLE SURVEY</p>' +
        '<div class="x-btns">' +
          (S ? '<button class="x-btn" data-a="continue">CONTINUE EXPEDITION</button>' : '') +
          '<button class="x-btn' + (S ? ' ghost' : '') + '" data-a="new">' + (S ? 'NEW EXPEDITION' : 'OPEN THE DOSSIER') + '</button>' +
        '</div>' +
        '<p class="x-fine">Working title · early build · progress is saved in this browser only<br><a href="/games.html">← THE GAMES</a></p>' +
      '</div>');
    s.addEventListener('click', function(e){
      var a = e.target.closest('[data-a]'); if (!a) return;
      if (a.dataset.a === 'continue') { resume(); return; }
      if (S && !confirm('Start a new expedition? Your current records will be lost.')) return;
      S = blank(); save(); dossier();
    });
  }
  function resume(){
    if (S.stage === 'surface') surface();
    else if (S.stage === 'ship' || S.stage === 'adrift') ship();
    else if (S.stage === 'launch') launch();
    else dossier();
  }

  // ── dossier ──
  function dossier(){
    S.stage = 'dossier'; save();
    var s = screen('x-dossier',
      '<div class="x-paper">' +
        '<p class="x-stamp red">MOST SECRET</p>' +
        '<p class="x-mono">EXPERIMENTAL ROCKET PROGRAM · MISSION ORDERS · 1936</p>' +
        '<pre class="x-typed"></pre>' +
        '<label class="x-sign">PILOT-OBSERVER<input type="text" maxlength="24" autocomplete="off" placeholder="sign your surname"></label>' +
        '<button class="x-btn" data-a="go" disabled>SIGN &amp; PROCEED TO LAUNCH</button>' +
      '</div>');
    var text = 'You are hereby assigned as Pilot-Observer aboard the experimental rocket vessel described in Annex A (withheld).\n\n' +
      'OBJECTIVE: Proceed beyond the atmosphere. Survey the planets of the Solar System. Return with photographic and written records.\n\n' +
      'ISSUED:\n· Bellows field camera, 12 exposures per roll\n· Field journal and typewriter\n· Specimen case, 6 sealed jars\n' +
      '· Pressure suit with SUIT, AIR and WARMTH instruments\n· Signal flares (2)\n\n' +
      'The existence of this vessel is not to be disclosed.';
    var pre = $('.x-typed', s), inp = $('input', s), go = $('[data-a="go"]', s);
    typeInto(pre, text, 12).then(function(){ inp.focus(); });
    function ok(){ go.disabled = !inp.value.trim(); }
    inp.addEventListener('input', ok);
    inp.addEventListener('keydown', function(e){ if (e.key === 'Enter' && !go.disabled) go.click(); });
    go.addEventListener('click', function(){ S.name = inp.value.trim().slice(0, 24); save(); sfx.click(); launch(); });
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
      r.textContent = 'IGNITION'; s.classList.add('shake'); tone(60, 1.5, 'sawtooth', .06);
      setNeedle(s, 'alt', .7); setNeedle(s, 'vel', .8); setNeedle(s, 'fuel', .55);
      await wait(1800);
      s.classList.add('alarm');
      r.textContent = 'NAVIGATION FAILURE'; sfx.warn(); await wait(1100);
      r.textContent = 'WIRELESS · NO SIGNAL'; setNeedle(s, 'alt', 1.1); setNeedle(s, 'vel', 1.25); await wait(1100);
      r.textContent = 'VELOCITY · OFF SCALE'; sfx.warn();
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
    startWorld('hyper');
    (async function(){
      await wait(2600);
      s.classList.add('white'); await wait(700);
      stopWorld(); s.classList.remove('white'); s.classList.add('black');
      var t = $('.x-hyper-t', s);
      await typeInto(t, 'Silence.\n\nThe instruments are dead. The stars outside are wrong.', 30);
      await wait(1100);
      S.stage = 'adrift'; save(); ship(true);
    })();
  }

  // ── ship hub ──
  var STATIONS = [
    ['panel', 'CONTROL PANEL', 'Power · air · wireless'],
    ['port', 'OBSERVATION PORT', 'Telescope & camera'],
    ['nav', 'NAVIGATION', 'Star chart'],
    ['dark', 'DARKROOM', 'Develop film'],
    ['lab', 'LABORATORY', 'Specimens · decoding'],
    ['locker', 'CARD LOCKER', 'Inventory'],
    ['archive', 'ARCHIVE', 'What has been documented'],
    ['log', 'EXPEDITION LOG', 'Objectives']
  ];
  function ship(firstArrival){
    if (S.stage !== 'adrift') S.stage = 'ship';
    S.suit = 100; S.air = 100; S.flares = 2; save();
    var undeveloped = S.frames.length, jars = S.jars.length;
    var s = screen('x-ship' + (S.flags.power ? '' : ' unpowered'),
      '<header class="x-shiphead riv"><div><p class="x-plate">EXPERIMENTAL VESSEL</p>' +
        '<p class="x-where">' + (S.landed ? 'LANDED · ' + esc(term('malezor')) + ' · ' + esc(term('zyraxis')) : 'ADRIFT · ' + esc(term('expanse'))) + '</p></div>' +
        '<button class="x-snd" aria-pressed="' + !!S.sound + '" title="Sound">' + (S.sound ? '♪ ON' : '♪ OFF') + '</button></header>' +
      '<div class="x-stations">' + STATIONS.map(function(st){
        var off = !S.flags.power && st[0] !== 'panel' && st[0] !== 'log';
        var badge = st[0] === 'dark' && undeveloped ? '<i>' + undeveloped + '</i>' : st[0] === 'lab' && (jars || canDecode()) ? '<i>' + (jars || '!') + '</i>' : '';
        return '<button class="x-station riv" data-st="' + st[0] + '"' + (off ? ' disabled' : '') + '><b>' + st[1] + '</b><span>' + (off ? 'NO POWER' : st[2]) + '</span>' + badge + '</button>';
      }).join('') + '</div>' +
      (S.landed ? '<button class="x-btn big" data-st="out">▶ DISEMBARK</button>' : '') +
      '<p class="x-shipnote"></p>');
    s.addEventListener('click', function(e){
      if (e.target.closest('.x-snd')) { S.sound = !S.sound; save(); ship(); sfx.click(); return; }
      var b = e.target.closest('[data-st]'); if (!b || b.disabled) return;
      sfx.click();
      var st = b.dataset.st;
      ({ panel:controlPanel, port:observationPort, nav:navigation, dark:darkroom, lab:laboratory, locker:locker, archive:archive, log:logbook, out:disembark })[st]();
    });
    if (firstArrival) typeInto($('.x-shipnote', s), 'Main power is out. Start at the CONTROL PANEL.', 24);
    else if (!S.flags.power) $('.x-shipnote', s).textContent = 'Main power is out. Start at the CONTROL PANEL.';
    else if (undeveloped) $('.x-shipnote', s).textContent = undeveloped + ' exposed frame' + (undeveloped > 1 ? 's' : '') + ' waiting in the DARKROOM.';
  }
  function sub(title, body, cls){
    var s = screen('x-sub ' + (cls || ''), '<header class="x-subhead riv"><button class="x-back" aria-label="Back to ship">◀ SHIP</button><p class="x-plate">' + title + '</p></header><div class="x-subbody">' + body + '</div>');
    $('.x-back', s).addEventListener('click', function(){ sfx.click(); ship(); });
    return s;
  }

  // ── control panel ──
  function controlPanel(){
    var sys = [['power','MAIN POWER','Generator · vacuum-tube bank'],['air','AIR SCRUBBERS','Requires power'],['radio','WIRELESS SET','Requires power']];
    var s = sub('CONTROL PANEL', '<div class="x-switches">' + sys.map(function(x){
      return '<div class="x-sw riv' + (S.flags[x[0]] ? ' on' : '') + '">' + dial(x[1], x[0]) +
        '<button class="x-toggle" data-sys="' + x[0] + '" aria-pressed="' + !!S.flags[x[0]] + '"><span></span></button><small>' + x[2] + '</small></div>';
    }).join('') + '</div><pre class="x-radio"></pre>');
    sys.forEach(function(x){ setNeedle(s, x[0], S.flags[x[0]] ? .62 : 0); });
    s.addEventListener('click', function(e){
      var b = e.target.closest('[data-sys]'); if (!b) return;
      var k = b.dataset.sys;
      if (S.flags[k]) return;
      if (k !== 'power' && !S.flags.power) { toast('NO POWER · restore MAIN POWER first', 'red'); sfx.warn(); return; }
      S.flags[k] = true; save(); sfx.click();
      b.setAttribute('aria-pressed', 'true'); b.closest('.x-sw').classList.add('on');
      setNeedle(s, k, .62);
      if (k === 'power') toast('MAIN POWER RESTORED');
      if (k === 'air') toast('AIR SCRUBBERS RUNNING');
      if (k === 'radio') typeInto($('.x-radio', s), 'WIRELESS: scanning all Earth bands . . .\n. . . no carrier.\n. . . no carrier.\n. . . a pattern on an unknown band. Not Morse. Not speech I know.', 26);
      if (S.flags.power && S.flags.air && S.flags.radio) setTimeout(function(){ toast('ALL SYSTEMS NOMINAL · try the OBSERVATION PORT'); }, 600);
    });
  }

  // ── navigation / star chart ──
  var BODIES = [
    { id:'violet', name:function(){ return term('zyraxis'); }, x:.68, y:.36, reach:true },
    { id:'ocean',  name:function(){ return 'LARGE OCEANIC BODY'; }, x:.26, y:.62, reach:false },
    { id:'dense',  name:function(){ return 'DENSE BODY, HIGH GRAVITY'; }, x:.5, y:.82, reach:false }
  ];
  function navigation(){
    var n = S.flags.readings || 0;
    var s = sub('NAVIGATION', '<div class="x-chart"><div class="x-chart-grid"></div>' +
      '<span class="x-you" style="left:46%;top:46%">✕<small>VESSEL</small></span>' +
      BODIES.slice(0, n).map(function(b){
        return '<button class="x-body' + (b.reach ? ' reach' : '') + (S.landed && b.reach ? ' here' : '') + '" data-b="' + b.id + '" style="left:' + b.x*100 + '%;top:' + b.y*100 + '%"><i></i><small>' + esc(b.name()) + '</small></button>';
      }).join('') + '</div>' +
      '<div class="x-navctl">' +
        (n < 3 ? '<button class="x-btn" data-a="read">TAKE INSTRUMENT READING (' + n + '/3)</button>' : '') +
        '<p class="x-navnote">' + (n < 3 ? 'Sextant and radio direction-finder. Each reading plots one body.' :
          S.landed ? 'You are on the violet body. The other bodies are beyond the crippled drive. Drive repairs are not in this build.' :
          'Tap a plotted body. The crippled drive can reach only one of them.') + '</p>' +
      '</div>', 'x-navsub');
    s.addEventListener('click', function(e){
      if (e.target.closest('[data-a="read"]')) {
        S.flags.readings = n + 1; if (S.flags.readings >= 3) S.flags.charted = true;
        save(); sfx.click(); navigation(); return;
      }
      var b = e.target.closest('[data-b]'); if (!b) return;
      var body = BODIES.filter(function(x){ return x.id === b.dataset.b; })[0];
      if (!body.reach) { toast('BEYOND PRESENT RANGE · DRIVE REPAIR REQUIRED', 'red'); sfx.warn(); return; }
      if (S.landed) { toast('ALREADY LANDED HERE'); return; }
      if (!S.flags.air) { toast('Restore AIR SCRUBBERS before descent', 'red'); return; }
      if (confirm('Attempt a descent to the ' + body.name().toLowerCase() + '?')) descent();
    });
  }

  function descent(){
    var s = screen('x-cockpit shake', '<div class="x-panel riv"><p class="x-plate">DESCENT</p><p class="x-alt">ALT <b>0420000</b> FT</p><p class="x-readout">HULL TEMPERATURE RISING</p></div>');
    tone(55, 3, 'sawtooth', .05);
    var b = $('.x-alt b', s), alt = 420000, t0 = performance.now();
    (function tick(now){
      var k = Math.min(1, (now - t0) / (reduced ? 200 : 3200));
      alt = Math.round(420000 * Math.pow(1 - k, 2));
      b.textContent = String(alt).padStart(7, '0');
      if (k < 1) requestAnimationFrame(tick);
      else {
        $('.x-readout', s).textContent = 'TOUCHDOWN';
        s.classList.remove('shake'); sfx.click();
        S.landed = true; S.stage = 'ship'; save();
        setTimeout(function(){ disembark(true); }, reduced ? 50 : 900);
      }
    })(t0);
  }

  // ── darkroom: film → cards ──
  function darkroom(){
    var s = sub('DARKROOM', '<div class="x-dark"><div class="x-tray"><div class="x-print"><img alt=""></div><p class="x-grade"></p></div>' +
      '<div class="x-darkctl"><p class="x-darknote"></p><button class="x-btn" data-a="dev">DEVELOP ROLL</button></div>' +
      '<div class="x-manifest"></div></div>', 'x-redroom');
    var n = S.frames.length, note = $('.x-darknote', s), btn = $('[data-a="dev"]', s);
    note.textContent = n ? n + ' exposed frame' + (n > 1 ? 's' : '') + ' on the roll.' : 'No exposed film. Take photographs on the surface or from the Observation Port.';
    btn.disabled = !n;
    btn.addEventListener('click', function(){ btn.disabled = true; develop(s); });
  }
  async function develop(s){
    var print = $('.x-print', s), img = $('img', print), grade = $('.x-grade', s), man = $('.x-manifest', s), note = $('.x-darknote', s);
    var frames = S.frames.slice();
    S.film = 12; save();
    for (var i = 0; i < frames.length; i++) {
      var f = frames[i];
      S.frames.shift(); save();
      note.textContent = 'FRAME ' + (i + 1) + ' OF ' + frames.length;
      print.className = 'x-print'; grade.textContent = ''; man.innerHTML = '';
      img.src = f.img; void print.offsetWidth; print.classList.add('dev');
      await wait(1700);
      grade.textContent = f.grade.toUpperCase(); grade.className = 'x-grade g-' + f.grade;
      sfx.click();
      await wait(500);
      if (f.subj) {
        var s2 = subj(f.subj), good = f.grade === 'excellent' || f.grade === 'good';
        if (good) {
          var first = manifest(f.subj, f.img, f.grade === 'excellent');
          man.innerHTML = '<p class="x-man-k">' + (first ? 'CARD MANIFESTED' : 'ANOTHER COPY · QUANTITY +1') + '</p>' + cardHtml(f.subj, false);
          sfx.reveal();
        } else {
          mark(f.subj, 'fair');
          man.innerHTML = '<p class="x-man-k dim">' + (f.grade === 'fair' ? 'USABLE AS EVIDENCE · TOO SOFT FOR A CARD' : 'UNUSABLE PRINT') + '<br>' + esc(subjName(f.subj)) + '</p>';
        }
      } else {
        man.innerHTML = '<p class="x-man-k dim">NO SUBJECT IN FRAME</p>';
      }
      await wait(1500);
    }
    S.flags.developed = true; save();
    note.textContent = 'Roll finished. New film loaded: 12 exposures.';
    $('[data-a="dev"]', s).hidden = true;
  }

  // ── laboratory: specimens, decoding ──
  function canDecode(){ return S.flags.copied && !S.flags.decoded && classifiedCount() >= 3; }
  function laboratory(){
    var jars = S.jars.length;
    var s = sub('LABORATORY',
      '<div class="x-lab riv"><h3>SPECIMEN ANALYSIS</h3><p>' + (jars ? jars + ' sealed jar' + (jars > 1 ? 's' : '') + ' in the specimen case.' : 'The specimen case is empty.') + '</p>' +
      '<button class="x-btn" data-a="an"' + (jars ? '' : ' disabled') + '>ANALYSE SPECIMENS</button><div class="x-out"></div></div>' +
      '<div class="x-lab riv"><h3>DECODING</h3><p>' + (S.flags.decoded ? 'The markings are decoded.' :
        !S.flags.copied ? 'No inscriptions copied yet.' :
        classifiedCount() < 3 ? 'Markings copied. Too little to cross-reference: classify at least 3 subjects first (' + classifiedCount() + '/3).' :
        'Markings copied. Enough photographs to cross-reference against the carved figures.') + '</p>' +
      '<button class="x-btn" data-a="dec"' + (canDecode() ? '' : ' disabled') + '>DECODE THE MARKINGS</button></div>');
    $('[data-a="an"]', s).addEventListener('click', async function(){
      this.disabled = true;
      var out = $('.x-out', s), list = S.jars.slice();
      for (var i = 0; i < list.length; i++) {
        S.jars.shift(); save();
        out.innerHTML = '<p class="x-mono">INSTRUMENT READING . . .</p>';
        await wait(900);
        mark(list[i], 'specimen');
        var first = manifest(list[i], null, false);
        out.innerHTML = '<p class="x-man-k">' + (first ? 'CARD MANIFESTED' : 'QUANTITY +1') + '</p>' + cardHtml(list[i], false);
        sfx.reveal();
        await wait(1300);
      }
      S.flags.analysed = true; save();
    });
    $('[data-a="dec"]', s).addEventListener('click', function(){ reclassify(); });
  }

  // The premise lands here: 1936 descriptions struck out, true names typed in.
  async function reclassify(){
    var terms = Object.keys(D.lexicon).filter(function(t){ return !S.lex[t]; });
    var s = screen('x-reclass', '<div class="x-paper"><p class="x-stamp red">RECLASSIFICATION</p><p class="x-mono">The carved figures match your photographs. Beside each figure, a word. The words repeat in the wireless pattern.</p><ul class="x-relist"></ul><button class="x-btn" hidden>RETURN TO SHIP</button></div>');
    var list = $('.x-relist', s);
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i], L = D.lexicon[t];
      var li = el('li', '', '<s>' + esc(L.unknown) + '</s><b></b>'); list.appendChild(li);
      li.scrollIntoView({ block:'nearest' });
      await wait(350); li.classList.add('struck'); sfx.click();
      await typeInto(li.querySelector('b'), L.canon, 45);
      S.lex[t] = true; save();
      await wait(200);
    }
    S.flags.decoded = true; save();
    var b = $('.x-btn', s); b.hidden = false; b.focus();
    b.addEventListener('click', function(){ ship(); toast('Your records now read in the true names.'); });
  }

  // ── card locker (inventory) ──
  function locker(){
    var ids = Object.keys(S.cards);
    var s = sub('CARD LOCKER', ids.length ? '<p class="x-mono">' + ids.length + ' card' + (ids.length > 1 ? 's' : '') + ' · ' +
      ids.reduce(function(n, id){ return n + S.cards[id].qty; }, 0) + ' copies in inventory</p><div class="x-grid">' + ids.map(function(id){ return cardHtml(id, false); }).join('') + '</div>'
      : '<p class="x-empty">No cards yet. Photographs become cards in the DARKROOM; specimens become cards in the LABORATORY.</p>');
    s.addEventListener('click', function(e){
      var c = e.target.closest('.x-grid [data-card]'); if (!c) return;
      var m = el('div', 'x-modal', '<div class="x-modal-in">' + cardHtml(c.dataset.card, true) + '<button class="x-btn ghost">CLOSE</button></div>');
      ui.appendChild(m); sfx.click();
      m.addEventListener('click', function(ev){ if (ev.target === m || ev.target.closest('.x-btn')) m.remove(); });
    });
  }

  // ── archive (knowledge) ──
  function archive(){
    var sets = Object.keys(D.sets).map(Number);
    sub('ARCHIVE', sets.map(function(n){
      var ids = Object.keys(D.subjects).filter(function(id){ return subj(id).set === n; });
      return '<section class="x-arc riv"><h3>' + esc(setName(n)) + ' <b>' + setPct(n) + '%</b></h3>' +
        (n === 9 ? '<p class="x-mono">This build covers one survey zone of this world only.</p>' : '') +
        '<ul>' + ids.map(function(id){
          var a = S.archive[id] || {}, seen = Object.keys(a).length;
          return '<li class="' + (a.classified ? 'done' : seen ? 'part' : '') + '"><b>' + (seen ? esc(subjName(id)) : '— not yet recorded —') + '</b>' +
            '<span>' + (a.classified ? 'CLASSIFIED' : seen ? 'FIELD RECORD' : '') + '</span>' +
            (S.notes[id] ? '<em>' + esc(subj(id).journal) + '</em>' : '') + '</li>';
        }).join('') + '</ul></section>';
    }).join('') + '<p class="x-mono dim">The master collection holds 30 sets. ' + (30 - sets.length) + ' remain uncharted.</p>');
  }

  function logbook(){
    var name = S.name ? esc(S.name.toUpperCase()) : 'PILOT-OBSERVER';
    sub('EXPEDITION LOG', '<div class="x-paper"><p class="x-mono">LOG OF ' + name + '</p><ol class="x-obj">' + objectives().map(function(o){
      return '<li class="' + (o.done ? 'done' : '') + (o.main ? ' main' : '') + '">' + esc(o.t) + '</li>';
    }).join('') + '</ol>' +
    (S.flags.decoded ? '<p class="x-mono">END OF THIS BUILD\'S SURVEY. Keep documenting Malezor: every Good or Excellent photograph adds a copy to your Card Locker. The way home lies further out, in a future build.</p>' : '') +
    '<button class="x-btn ghost" data-a="reset">ERASE EXPEDITION</button></div>');
    $('[data-a="reset"]').addEventListener('click', function(){
      if (!confirm('Erase this expedition and start over?')) return;
      try { localStorage.removeItem(KEY); } catch(e){}
      S = null; title();
    });
  }

  // ═════════════════════════ WORLD (canvas) ═════════════════════════
  var IMG = {};
  function img(name){ if (!IMG[name]) { IMG[name] = new Image(); IMG[name].src = A + name; } return IMG[name]; }
  ['grass.png','den.png','water.png','tree.png','bush.png','boulder.png','crater.png','astralite.png','otterlin.png','verdanix.png','aetherwing.png','volcanut.png'].forEach(img);

  var W = null, raf = 0, mode = null, last = 0;
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
    else if (mode === 'space') { updateCamera(dt); drawSpace(now); }
    else if (mode === 'surface') { updateSurface(dt, now); drawSurface(now); }
    if (mode) raf = requestAnimationFrame(loop);
  }

  // ── seeded random ──
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

  // ── observation port (space) ──
  var stars = null, aim = { x:0, y:0 };
  var SPACE = { aenor:{ x:-260, y:-60, r:70 }, zoryth:{ x:300, y:90, r:34 } };
  function observationPort(){
    screen('x-port', '<header class="x-subhead riv"><button class="x-back">◀ SHIP</button><p class="x-plate">OBSERVATION PORT</p></header>' +
      '<p class="x-porthint">Drag to aim the telescope. Raise the camera to photograph.</p>' + hudCamera());
    aim = { x:0, y:0 };
    startWorld('space');
    $('.x-back').addEventListener('click', function(){ sfx.click(); ship(); });
    bindCamera('space');
  }
  function drawSpace(now){
    var w = cv.width, h = cv.height, z = DPR;
    if (!stars) { var r = rng(3); stars = []; for (var i = 0; i < 420; i++) stars.push({ x:(r()-.5)*2400, y:(r()-.5)*1600, s:r() }); }
    ctx.fillStyle = '#05040a'; ctx.fillRect(0, 0, w, h);
    var cx = w/2 - aim.x*z, cy = h/2 - aim.y*z;
    stars.forEach(function(p){
      var tw = .5 + .5*Math.sin(now/700 + p.x);
      ctx.fillStyle = 'rgba(255,255,255,' + (.25 + .6*p.s*tw) + ')';
      ctx.fillRect(cx + p.x*z, cy + p.y*z, (p.s > .9 ? 2 : 1)*z, (p.s > .9 ? 2 : 1)*z);
    });
    // Aenor
    var a = SPACE.aenor, ax = cx + a.x*z, ay = cy + a.y*z;
    var g = ctx.createRadialGradient(ax, ay, 0, ax, ay, a.r*3.2*z);
    g.addColorStop(0, '#fffbe8'); g.addColorStop(.18, '#ffe9a8'); g.addColorStop(.32, 'rgba(255,200,110,.55)'); g.addColorStop(1, 'rgba(255,170,80,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ax, ay, a.r*3.2*z, 0, 7); ctx.fill();
    // Zoryth
    var m = SPACE.zoryth, mx = cx + m.x*z, my = cy + m.y*z;
    ctx.fillStyle = '#cfc7d8'; ctx.beginPath(); ctx.arc(mx, my, m.r*z, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(90,80,110,.45)';
    [[-10,-8,8],[12,4,6],[-4,14,5],[8,-14,4]].forEach(function(c){ ctx.beginPath(); ctx.arc(mx + c[0]*z, my + c[1]*z, c[2]*z, 0, 7); ctx.fill(); });
    var sh = ctx.createLinearGradient(mx - m.r*z, my, mx + m.r*z, my);
    sh.addColorStop(0, 'rgba(5,4,10,0)'); sh.addColorStop(1, 'rgba(5,4,10,.75)');
    ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(mx, my, m.r*z, 0, 7); ctx.fill();
    drawFrameOverlay();
  }

  // ── surface ──
  var MW = 46, MH = 34, T = 40;
  var SHIP_POS = { x:8.5, y:22.5 };
  function buildWorld(){
    var r = rng(1936), ground = [], solid = [], objs = [];
    for (var y = 0; y < MH; y++) for (var x = 0; x < MW; x++) { ground.push(0); solid.push(0); }
    function G(x, y){ return y * MW + x; }
    // pond
    for (y = 0; y < MH; y++) for (x = 0; x < MW; x++) {
      var dx = (x - 33.5) / 4.6, dy = (y - 23) / 3.3;
      if (dx*dx + dy*dy < 1 + Math.sin(x*1.7 + y)*0.12) { ground[G(x,y)] = 2; solid[G(x,y)] = 1; }
      var ex = (x - 37) / 4.2, ey = (y - 6.5) / 3.2;
      if (ex*ex + ey*ey < 1) ground[G(x,y)] = 1;
    }
    function put(type, x, y, isSolid, extra){
      var o = { type:type, x:x, y:y }; if (extra) for (var k in extra) o[k] = extra[k];
      objs.push(o); if (isSolid) solid[G(Math.floor(x), Math.floor(y))] = 1; return o;
    }
    // border of trees
    for (x = 0; x < MW; x += 1) { put('tree', x + .5, .8, true); put('tree', x + .5, MH - .2, true); solid[G(x, MH-1)] = 1; solid[G(x, 0)] = 1; }
    for (y = 1; y < MH - 1; y += 1) { put('tree', .5, y + .8, true); put('tree', MW - .5, y + .8, true); solid[G(0, y)] = 1; solid[G(MW-1, y)] = 1; }
    function free(x, y, pad){
      for (var j = -pad; j <= pad; j++) for (var i = -pad; i <= pad; i++) {
        var X = Math.floor(x) + i, Y = Math.floor(y) + j;
        if (X < 1 || Y < 1 || X >= MW-1 || Y >= MH-1 || solid[G(X,Y)] || ground[G(X,Y)]) return false;
      }
      return Math.hypot(x - SHIP_POS.x, y - SHIP_POS.y) > 5;
    }
    for (var i = 0; i < 70; i++) { x = 2 + r()*(MW-4); y = 2 + r()*(MH-4); if (free(x, y, 1)) put('tree', x, y, true); }
    for (i = 0; i < 40; i++) { x = 2 + r()*(MW-4); y = 2 + r()*(MH-4); if (free(x, y, 0)) put('bush', x, y, false); }
    for (i = 0; i < 18; i++) { x = 2 + r()*(MW-4); y = 2 + r()*(MH-4); if (free(x, y, 0)) put('boulder', x, y, true); }
    // fixed features
    put('astralite', 17.5, 8.5, true, { id:'a1' });
    put('astralite', 24.5, 28.5, true, { id:'a2' });
    put('astralite', 11.5, 4.5, true, { id:'a3' });
    put('markings', 38.5, 5.5, true);
    put('ship', SHIP_POS.x, SHIP_POS.y, true);
    for (y = -1; y <= 0; y++) for (x = -1; x <= 1; x++) solid[G(Math.floor(SHIP_POS.x) + x, Math.floor(SHIP_POS.y) + y)] = 1;
    // clear the paths around fixed features
    [[17,8],[24,28],[11,4],[38,5]].forEach(function(p){ objs = objs.filter(function(o){ return !(o.type === 'tree' || o.type === 'boulder') || Math.hypot(o.x - p[0] - .5, o.y - p[1] - .5) > 1.6 || o.y < 1 || o.y > MH - 1 || o.x < 1 || o.x > MW - 1; }); });
    solid = solid.map(function(v, idx){ return ground[idx] === 2 ? 1 : 0; });
    objs.forEach(function(o){ if (o.type === 'tree' || o.type === 'boulder' || o.type === 'astralite' || o.type === 'markings') solid[G(Math.floor(o.x), Math.floor(o.y))] = 1; });
    for (y = -1; y <= 0; y++) for (x = -1; x <= 1; x++) solid[G(Math.floor(SHIP_POS.x) + x, Math.floor(SHIP_POS.y) + y)] = 1;
    for (x = 0; x < MW; x++) { solid[G(x,0)] = 1; solid[G(x,MH-1)] = 1; }
    for (y = 0; y < MH; y++) { solid[G(0,y)] = 1; solid[G(MW-1,y)] = 1; }

    var critters = [
      { id:'otterlin',  x:29, y:20, home:{x:31,y:21}, roam:4, speed:1.6 },
      { id:'otterlin',  x:37, y:26, home:{x:36,y:26}, roam:3, speed:1.6 },
      { id:'verdanix',  x:28.5, y:25, home:{x:28.5,y:25}, roam:2.5, speed:3.4 },
      { id:'verdanix',  x:39.5, y:21, home:{x:39.5,y:21}, roam:2.5, speed:3.4 },
      { id:'aetherwing',x:20, y:19, home:{x:21,y:20}, roam:6, speed:3.2, fly:true },
      { id:'aetherwing',x:13, y:12, home:{x:14,y:12}, roam:5, speed:3.2, fly:true },
      { id:'volcanut',  x:24, y:14, home:{x:24,y:14}, roam:2, speed:1.2 }
    ].map(function(c){ c.dir = 'down'; c.state = 'wander'; c.t = 0; c.tx = c.x; c.ty = c.y; c.anim = 0; c.cool = 0; c.obs = 0; return c; });

    var fog = new Uint8Array(MW * MH);
    if (S.fog && S.fog.length === MW * MH) for (i = 0; i < fog.length; i++) fog[i] = S.fog.charCodeAt(i) === 49 ? 1 : 0;
    var taken = S.flags.takenStones || {};
    objs.forEach(function(o){ if (o.type === 'astralite' && taken[o.id]) o.taken = true; });
    objs.sort(function(a, b){ return a.y - b.y; });
    return { ground:ground, solid:solid, objs:objs, critters:critters, fog:fog, groundCanvas:null };
  }
  function bakeGround(){
    var gc = doc.createElement('canvas'); gc.width = MW * T; gc.height = MH * T;
    var g = gc.getContext('2d');
    var tiles = [img('grass.png'), img('den.png'), img('water.png')];
    for (var y = 0; y < MH; y++) for (var x = 0; x < MW; x++) {
      var t = W.ground[y * MW + x], im = tiles[t];
      // sample a 40px patch from the 128px seamless tile, offset per cell, so repeats don't line up
      var sx = ((x * 40) % 88), sy = ((y * 40) % 88);
      if (im.complete && im.naturalWidth) g.drawImage(im, sx, sy, 40, 40, x * T, y * T, T, T);
      else { g.fillStyle = ['#3d6b2a','#7a5a3a','#1e4a8c'][t]; g.fillRect(x*T, y*T, T, T); }
    }
    // soften the water edge
    g.strokeStyle = 'rgba(210,235,255,.35)'; g.lineWidth = 2;
    for (y = 1; y < MH - 1; y++) for (x = 1; x < MW - 1; x++) if (W.ground[y*MW+x] === 2) {
      if (W.ground[y*MW+x-1] !== 2) { g.beginPath(); g.moveTo(x*T, y*T); g.lineTo(x*T, y*T+T); g.stroke(); }
      if (W.ground[y*MW+x+1] !== 2) { g.beginPath(); g.moveTo(x*T+T, y*T); g.lineTo(x*T+T, y*T+T); g.stroke(); }
      if (W.ground[(y-1)*MW+x] !== 2) { g.beginPath(); g.moveTo(x*T, y*T); g.lineTo(x*T+T, y*T); g.stroke(); }
      if (W.ground[(y+1)*MW+x] !== 2) { g.beginPath(); g.moveTo(x*T, y*T+T); g.lineTo(x*T+T, y*T+T); g.stroke(); }
    }
    W.groundCanvas = gc;
  }

  // player & ship sprites, drawn as pixel art in code (no art exists yet for a 1936 astronaut)
  var SPR = {};
  function pixelSprite(rows, pal, scale){
    var c = doc.createElement('canvas'); c.width = rows[0].length * scale; c.height = rows.length * scale;
    var g = c.getContext('2d');
    rows.forEach(function(r, y){ for (var x = 0; x < r.length; x++) { var p = pal[r[x]]; if (p) { g.fillStyle = p; g.fillRect(x*scale, y*scale, scale, scale); } } });
    return c;
  }
  function buildSprites(){
    var pal = { o:'#3a2a18', c:'#c8843c', C:'#e9a95a', g:'#9fd2e6', G:'#d8f1fa', s:'#8d8a74', S:'#b3b096', d:'#5d5b4b', b:'#2b2a22', t:'#b08d57', w:'#efe6d0', r:'#9b2a1f' };
    SPR.front = pixelSprite([
      '....oooooo....','...occCCcco...','..occgGGgcco..','..ocgGGGGgco..','..ocgggggGco..','..occgggggco..','...occcccco...',
      '....odSSdo....','..osSSwwSSso..','.osSSSwwSSSso.','.osdSSSSSSdso.','.ott.SSSS.tto.','.oS.sSSSSs.So.','...sSSddSSs...','...sSS..SSs...','...sSs..sSs...','...bbb..bbb...','..bbbb..bbbb..'
    ], pal, 3);
    SPR.back = pixelSprite([
      '....oooooo....','...occCCcco...','..occcCCccco..','..occcccccco..','..occcccccco..','..occcccccco..','...occcccco...',
      '....odttdo....','..ostttttso..','.osStttttSso..','.osdtttttdso..','.oS.SSSS.So...','.oS.sSSSSs.So.','...sSSddSSs...','...sSS..SSs...','...sSs..sSs...','...bbb..bbb...','..bbbb..bbbb..'
    ], pal, 3);
    SPR.side = pixelSprite([
      '....oooooo....','...occCCcco...','..occcCgGgo...','..occcgGGGo...','..occcggggo...','..occcccco....','...occcccco...',
      '....odSSdo....','..ttSSSSSso...','.ttdSSSSSSo...','.ttdSSSSSdo...','.tt.SSSSSo....','...SSSSSSSo...','...sSSddSs....','....SS..SSs...','....Ss...sSs..','...bbb...bbb..','..bbbb...bbbb.'
    ], pal, 3);
    var sp = { m:'#cfd3d6', M:'#f2f4f5', k:'#6f767c', K:'#3e4448', R:'#a3261c', r:'#d24a36', p:'#7fc8e8', P:'#dff4fb', y:'#e8c46a', o:'#1d1f22' };
    SPR.ship = pixelSprite([
      '.........oo.........','........oMMo........','.......oMMmmo.......','......oMMmmmmo......','......oMmmmmko......','.....oMMmmmmmko.....','.....oMmmmmmmko.....',
      '.....oMmoooomko.....','.....oMoPPpokko.....','.....oMoPpppokko....','.....oMooppookko....','.....oMmoooomko.....','.....oMmmmmmmko.....','.....oMmymmmmko.....',
      '.....oMmmmmmmko.....','.....oMmmmymmko.....','....oRoMmmmmmkoRo...','...oRRoMmmmmmkoRRo..','..oRRroMmmmmmkorRRo.','..oRrroMmmmmmkorrRo.','..oRrrooKKKKKoorrRo.',
      '..oooo.oKKKKKo.oooo.','.......oyyyyyo......','........oyyyo.......'
    ], sp, 4);
  }

  function surface(){
    S.stage = 'surface'; save();
    if (!W) { W = buildWorld(); buildSprites(); }
    if (!W.groundCanvas) bakeGround();
    if (!S.pos) S.pos = { x:SHIP_POS.x + 1.5, y:SHIP_POS.y + 1.8 };
    P = { x:S.pos.x, y:S.pos.y, dir:'down', moving:false, crouch:false, anim:0, target:null, joy:null, hurt:0 };
    screen('x-surface',
      '<div class="x-hud riv"><div class="x-zone"><b class="x-zn"></b><span>' + esc(term('zyraxis')) + '</span></div>' +
        '<div class="x-gauges">' + gauge('SUIT','suit') + gauge('AIR','air') + gauge('WARMTH','warm') + '</div>' +
        '<div class="x-counts"><span class="x-film" title="Exposures left"><i>FILM</i><b></b></span><span class="x-jars" title="Specimen jars"><i>JARS</i><b></b></span></div></div>' +
      '<div class="x-actbar">' +
        '<button class="x-act" data-a="cam">CAMERA</button>' +
        '<button class="x-act primary" data-a="use" disabled>—</button>' +
        '<button class="x-act" data-a="crouch" aria-pressed="false">STALK</button>' +
        '<button class="x-act" data-a="journal">JOURNAL</button>' +
        '<button class="x-act" data-a="flare">FLARE <b class="x-fl"></b></button>' +
      '</div>' + hudCamera());
    if (!S.flags.landedNote) { S.flags.landedNote = 1; save(); setTimeout(function(){ toast('Tap the ground to walk. Drag to steer. Raise the CAMERA to photograph.'); }, 500); }
    bindSurfaceUI();
    bindCamera('surface');
    startWorld('surface');
    hudRefresh();
  }
  function disembark(first){ surface(); if (first) setTimeout(function(){ toast('TOUCHDOWN · ' + term('malezor') + ' · SUIT ON, AIR TANK FULL'); }, 300); }
  function gauge(label, id){
    return '<div class="x-g" data-g="' + id + '"><svg viewBox="0 0 60 40" aria-hidden="true"><path d="M6 36 A24 24 0 0 1 54 36" class="x-arc"/><path d="M6 36 A24 24 0 0 1 14 18" class="x-arc red"/>' +
      '<line x1="30" y1="36" x2="30" y2="15" class="x-needle"/><circle cx="30" cy="36" r="3"/></svg><span>' + label + '</span></div>';
  }
  function hudRefresh(){
    var zn = $('.x-zn'); if (!zn) return;
    zn.textContent = term('malezor');
    [['suit', S.suit], ['air', S.air], ['warm', 78]].forEach(function(g){
      var n = $('[data-g="' + g[0] + '"] .x-needle');
      if (n) n.style.transform = 'rotate(' + (-80 + clamp(g[1], 0, 100) / 100 * 160) + 'deg)';
      var box = $('[data-g="' + g[0] + '"]'); if (box) box.classList.toggle('low', g[1] < 25);
    });
    $('.x-film b').textContent = pad2(S.film);
    $('.x-jars b').textContent = (6 - S.jars.length) + '/6';
    $('.x-fl').textContent = S.flares;
  }

  var P = null, nearUse = null;
  function bindSurfaceUI(){
    ui.querySelector('.x-actbar').addEventListener('click', function(e){
      var b = e.target.closest('[data-a]'); if (!b || b.disabled) return;
      var a = b.dataset.a;
      if (a === 'cam') openCamera();
      if (a === 'use' && nearUse) nearUse.fn();
      if (a === 'crouch') { P.crouch = !P.crouch; b.setAttribute('aria-pressed', P.crouch); b.classList.toggle('on', P.crouch); toast(P.crouch ? 'STALKING · slow and quiet' : 'WALKING'); }
      if (a === 'journal') journal();
      if (a === 'flare') {
        if (!S.flares) { toast('NO FLARES LEFT · walk back to the ship', 'red'); return; }
        if (!confirm('Fire a recall flare and return to the ship now?')) return;
        S.flares--; board('flare');
      }
    });
  }
  // One input handler for the canvas. Camera raised (or in space): drag aims.
  // On the surface otherwise: tap to walk there, drag to steer like a thumbstick.
  var drag = null;
  cv.addEventListener('pointerdown', function(e){
    if (mode !== 'surface' && mode !== 'space') return;
    drag = { x:e.clientX, y:e.clientY, ax:aim.x, ay:aim.y, joy:false };
    try { cv.setPointerCapture(e.pointerId); } catch(err){}
  });
  cv.addEventListener('pointermove', function(e){
    if (!drag) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (camOpen || mode === 'space') {
      var lim = mode === 'space' ? 520 : 170;
      aim.x = clamp(drag.ax - dx, -lim, lim); aim.y = clamp(drag.ay - dy, -lim * .7, lim * .7);
      return;
    }
    if (mode !== 'surface' || !P) return;
    if (!drag.joy && Math.hypot(dx, dy) > 14) { drag.joy = true; P.target = null; }
    if (drag.joy) { var m = Math.hypot(dx, dy) || 1; P.joy = { x:dx / m, y:dy / m, k:clamp(m / 60, .3, 1) }; }
  });
  function endDrag(e){
    if (!drag) return;
    if (!drag.joy && !camOpen && mode === 'surface' && P && e.type === 'pointerup') P.target = screenToWorld(e.clientX, e.clientY);
    if (P) P.joy = null;
    drag = null;
  }
  cv.addEventListener('pointerup', endDrag);
  cv.addEventListener('pointercancel', endDrag);
  var keys = {};
  addEventListener('keydown', function(e){
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    keys[e.key.toLowerCase()] = true;
    if (mode === 'surface' && !camOpen) {
      if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') { if (nearUse) nearUse.fn(); }
      if (e.key === 'c' || e.key === 'C') openCamera();
      if (e.key === 'j' || e.key === 'J') journal();
    } else if (camOpen && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); shoot(); }
    else if (camOpen && e.key === 'Escape') closeCamera();
  });
  addEventListener('keyup', function(e){ keys[e.key.toLowerCase()] = false; });

  function zoom(){ return clamp(Math.min(innerWidth, innerHeight * 1.2) / (T * 9.5), .8, 1.7) * DPR; }
  function camCenter(){ var k = DPR / (T * zoom()); return { x:P.x + aim.x * k, y:P.y + aim.y * k }; }
  function screenToWorld(sx, sy){
    var z = zoom(), c = camCenter();
    return { x:c.x + (sx * DPR - cv.width / 2) / (T * z), y:c.y + (sy * DPR - cv.height / 2) / (T * z) };
  }
  function worldToScreen(x, y){
    var z = zoom(), c = camCenter();
    return { x:(cv.width / 2 + (x - c.x) * T * z) / DPR, y:(cv.height / 2 + (y - c.y) * T * z) / DPR };
  }
  function isSolid(x, y){
    var X = Math.floor(x), Y = Math.floor(y);
    if (X < 0 || Y < 0 || X >= MW || Y >= MH) return true;
    return !!W.solid[Y * MW + X];
  }
  function moveBody(b, dx, dy, r){
    if (!isSolid(b.x + dx + Math.sign(dx) * r, b.y) && !isSolid(b.x + dx + Math.sign(dx) * r, b.y - r * .6)) b.x += dx;
    if (!isSolid(b.x, b.y + dy + Math.sign(dy) * r) && !isSolid(b.x - r * .6, b.y + dy + Math.sign(dy) * r) && !isSolid(b.x + r * .6, b.y + dy + Math.sign(dy) * r)) b.y += dy;
  }

  var fogTimer = 0, saveTimer = 0, airTimer = 0;
  function updateSurface(dt, now){
    if (!P) return;
    // movement
    var mx = 0, my = 0;
    if (!camOpen) {
      if (keys.w || keys.arrowup) my -= 1; if (keys.s || keys.arrowdown) my += 1;
      if (keys.a || keys.arrowleft) mx -= 1; if (keys.d || keys.arrowright) mx += 1;
      if (mx || my) P.target = null;
      if (P.joy) { mx = P.joy.x * P.joy.k; my = P.joy.y * P.joy.k; }
      else if (P.target) {
        var tx = P.target.x - P.x, ty = P.target.y - P.y, d = Math.hypot(tx, ty);
        if (d < .12) P.target = null; else { mx = tx / d; my = ty / d; }
      }
    }
    var m = Math.hypot(mx, my);
    P.moving = m > .05;
    if (P.moving) {
      if (m > 1) { mx /= m; my /= m; }
      var sp = (P.crouch ? 1.6 : 3.4) * dt;
      var bx = P.x, by = P.y;
      moveBody(P, mx * sp, my * sp, .32);
      if (P.target && Math.hypot(P.x - bx, P.y - by) < sp * .2) P.target = null; // blocked
      P.dir = Math.abs(mx) > Math.abs(my) ? (mx < 0 ? 'left' : 'right') : (my < 0 ? 'up' : 'down');
      P.anim += dt * (P.crouch ? 5 : 9);
    }
    if (P.hurt > 0) P.hurt -= dt;
    // fog
    fogTimer -= dt;
    if (fogTimer <= 0) {
      fogTimer = .2;
      var R = 5.2, changed = false;
      for (var y = Math.floor(P.y - R); y <= P.y + R; y++) for (var x = Math.floor(P.x - R); x <= P.x + R; x++) {
        if (x < 0 || y < 0 || x >= MW || y >= MH) continue;
        if (Math.hypot(x + .5 - P.x, y + .5 - P.y) <= R && !W.fog[y * MW + x]) { W.fog[y * MW + x] = 1; changed = true; }
      }
      if (changed) S.fog = Array.prototype.map.call(W.fog, function(v){ return v ? '1' : '0'; }).join('');
      // the den: reached
      if (W.ground[Math.floor(P.y) * MW + Math.floor(P.x)] === 1 && mark('firstden', 'reached')) { S.notes.firstden = 1; toast('NEW FIELD RECORD · ' + subjName('firstden')); }
    }
    // air drains on the surface; the tank lasts about four minutes
    airTimer += dt;
    if (airTimer > 1) { airTimer = 0; S.air = Math.max(0, S.air - 0.42); hudRefresh(); if (S.air <= 0) return recall('AIR'); if (Math.abs(S.air - 25) < .3) { toast('AIR LOW · return to the ship', 'red'); sfx.warn(); } }
    // creatures
    W.critters.forEach(function(c){ if (mode === 'surface') updateCritter(c, dt); });
    if (mode !== 'surface') return;
    // nearest usable thing
    findUse();
    saveTimer -= dt;
    if (saveTimer <= 0) { saveTimer = 3; S.pos = { x:P.x, y:P.y }; save(); }
  }

  function updateCritter(c, dt){
    var s = subj(c.id), dx = P.x - c.x, dy = P.y - c.y, d = Math.hypot(dx, dy);
    c.t -= dt; c.cool -= dt; c.anim += dt * 6;
    var speed = c.speed, flee = false;
    if (s.temperament === 'skittish') {
      var alarm = P.crouch ? 1.3 : (P.moving ? 3.2 : 2.2);
      if (d < alarm) { flee = true; c.state = 'flee'; }
      else if (c.state === 'flee' && d > 4.5) c.state = 'wander';
    }
    if (s.temperament === 'curious' && c.state !== 'flee') {
      if (d < 5 && d > 1.4 && !P.moving && c.t < 0) { c.tx = P.x - dx / d * 1.2; c.ty = P.y - dy / d * 1.2; c.t = 2; }
    }
    if (s.temperament === 'territorial') {
      if (c.state === 'charge') {
        speed = 6;
        if (d < .7 && P.hurt <= 0) {
          P.hurt = 1.2; S.suit = Math.max(0, S.suit - 28); hudRefresh(); sfx.warn();
          toast('STRUCK · SUIT DAMAGED', 'red'); vibrate(120);
          moveBody(P, dx / d * 1.6, dy / d * 1.6, .32);
          c.state = 'wander'; c.cool = 4;
          if (S.suit <= 0) recall('SUIT');
        }
        if (d > 5) { c.state = 'wander'; c.cool = 2; }
      } else if (d < 4 && c.cool <= 0) {
        if (c.state !== 'warn') { c.state = 'warn'; c.warnT = 1.4; sfx.warn(); toast('The creature bristles. Back away, or be charged.', 'red'); }
        c.warnT -= dt;
        if (c.warnT <= 0 && d < 2.6) { c.state = 'charge'; c.tx = P.x; c.ty = P.y; }
        if (d > 3.8) c.state = 'wander';
      } else if (c.state === 'warn') c.state = 'wander';
      if (c.state === 'charge') { c.tx = P.x; c.ty = P.y; }
    }
    if (flee) { c.tx = c.x - dx / (d || 1) * 3; c.ty = c.y - dy / (d || 1) * 3; speed *= 1.3; }
    else if (c.state === 'wander' && c.t < 0) {
      var a = Math.random() * Math.PI * 2, r = Math.random() * c.roam;
      c.tx = c.home.x + Math.cos(a) * r; c.ty = c.home.y + Math.sin(a) * r;
      c.t = (c.fly ? .8 : 2) + Math.random() * (c.fly ? 1.5 : 3);
    }
    if (c.state === 'warn') speed = 0;
    var vx = c.tx - c.x, vy = c.ty - c.y, vd = Math.hypot(vx, vy);
    c.moving = vd > .1 && speed > 0;
    if (c.moving) {
      var st = Math.min(vd, speed * dt);
      var ox = c.x, oy = c.y;
      if (c.fly || c.id === 'otterlin') { c.x += vx / vd * st; c.y += vy / vd * st; c.x = clamp(c.x, 1.5, MW - 1.5); c.y = clamp(c.y, 1.5, MH - 1.5); }
      else moveBody(c, vx / vd * st, vy / vd * st, .3);
      if (Math.hypot(c.x - ox, c.y - oy) < st * .2) c.t = -1;
      c.dir = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? 'left' : 'right') : (vy < 0 ? 'up' : 'down');
    }
    // observation: stay close and still without disturbing it
    if (d < 4.2 && !P.moving && c.state !== 'flee' && c.state !== 'charge' && !S.notes[c.id]) {
      c.obs += dt;
      if (c.obs >= 3) {
        S.notes[c.id] = 1; mark(c.id, 'observe'); save();
        toast('OBSERVATION RECORDED · ' + subjName(c.id)); sfx.click();
      }
    } else c.obs = Math.max(0, c.obs - dt * 2);
  }

  function vibrate(ms){ try { if (navigator.vibrate) navigator.vibrate(ms); } catch(e){} }

  function findUse(){
    var best = null, bd = 1.6;
    W.objs.forEach(function(o){
      var d = Math.hypot(o.x - P.x, o.y - P.y - .2);
      if (o.type === 'ship' && d < 2.6) { best = { label:'BOARD SHIP', fn:function(){ board('walk'); } }; bd = 0; }
      if (d >= bd) return;
      if (o.type === 'astralite' && !o.taken) { best = { label:'TAKE SPECIMEN', fn:function(){ sample(o); } }; bd = d; }
      if (o.type === 'markings') { best = { label: S.flags.copied ? 'MARKINGS COPIED' : 'COPY MARKINGS', fn:function(){ copyMarkings(); } }; bd = d; }
    });
    var b = $('[data-a="use"]');
    if (!b) return;
    nearUse = best;
    var label = best ? best.label : '—';
    if (b.textContent !== label) b.textContent = label;
    b.disabled = !best;
  }
  function sample(o){
    if (S.jars.length >= 6) { toast('SPECIMEN CASE FULL · return to the ship', 'red'); return; }
    o.taken = true;
    S.flags.takenStones = S.flags.takenStones || {}; S.flags.takenStones[o.id] = 1;
    S.jars.push('astralite'); S.flags.sampled = true; S.notes.astralite = 1;
    mark('astralite', 'specimen'); save(); hudRefresh(); sfx.click();
    toast('SPECIMEN SEALED · ' + subjName('astralite'));
  }
  function copyMarkings(){
    if (S.flags.copied) { toast('Already in your journal. Decode them in the LABORATORY.'); return; }
    S.flags.copied = true; save(); sfx.click();
    toast('MARKINGS COPIED INTO THE JOURNAL');
    setTimeout(function(){ toast('Carved figures, each beside a word. Some figures look like the animals here.'); }, 900);
  }
  function board(how){
    S.pos = how === 'walk' ? { x:P.x, y:P.y } : { x:SHIP_POS.x + 1.5, y:SHIP_POS.y + 1.8 };
    save(); sfx.click();
    ship();
    if (how === 'flare') toast('RECALL FLARE · the ship homed in on you');
  }
  function recall(why){
    if (mode !== 'surface') return;
    var lost = S.jars.length ? S.jars.pop() : null;
    S.pos = { x:SHIP_POS.x + 1.5, y:SHIP_POS.y + 1.8 }; save();
    stopWorld();
    var s = screen('x-recall', '<div class="x-paper"><p class="x-stamp red">EMERGENCY RECALL</p><p class="x-mono">' + why + ' gauge at zero. The suit\'s recall beacon fired, and the ship\'s winch hauled you back aboard.</p>' +
      '<p class="x-mono">' + (lost ? 'One unsecured specimen was lost in the recall.' : 'Nothing was lost.') + ' Your exposed film and field records are safe.</p><button class="x-btn">ABOARD SHIP</button></div>');
    $('.x-btn', s).addEventListener('click', function(){ ship(); });
  }

  function journal(){
    var m = el('div', 'x-modal', '<div class="x-modal-in x-paper journal"><p class="x-stamp">FIELD JOURNAL</p>' +
      '<canvas class="x-sketch" width="460" height="340" aria-label="Field sketch map"></canvas>' +
      '<ol class="x-obj">' + objectives().map(function(o){ return '<li class="' + (o.done ? 'done' : '') + (o.main ? ' main' : '') + '">' + esc(o.t) + '</li>'; }).join('') + '</ol>' +
      '<div class="x-notes">' + Object.keys(S.notes).map(function(id){ return '<p><b>' + esc(subjName(id)) + '.</b> ' + esc(subj(id).journal) + '</p>'; }).join('') + '</div>' +
      '<button class="x-btn ghost">CLOSE JOURNAL</button></div>');
    ui.appendChild(m);
    drawSketch(m.querySelector('.x-sketch'));
    m.addEventListener('click', function(e){ if (e.target === m || e.target.closest('.x-btn')) m.remove(); });
  }
  function drawSketch(c){
    var g = c.getContext('2d'), sx = c.width / MW, sy = c.height / MH;
    g.fillStyle = '#efe6d0'; g.fillRect(0, 0, c.width, c.height);
    for (var y = 0; y < MH; y++) for (var x = 0; x < MW; x++) {
      if (!W.fog[y * MW + x]) continue;
      var t = W.ground[y * MW + x];
      g.fillStyle = t === 2 ? 'rgba(40,70,120,.35)' : t === 1 ? 'rgba(120,80,40,.3)' : 'rgba(60,50,30,.08)';
      g.fillRect(x * sx, y * sy, sx + .5, sy + .5);
    }
    g.strokeStyle = 'rgba(40,30,20,.6)'; g.lineWidth = 1;
    W.objs.forEach(function(o){
      if (!W.fog[Math.floor(o.y) * MW + Math.floor(o.x)]) return;
      if (o.type === 'tree') { g.beginPath(); g.arc(o.x * sx, o.y * sy - 3, 3, 0, 7); g.stroke(); }
      if (o.type === 'astralite') { g.fillStyle = o.taken ? 'rgba(40,30,20,.3)' : '#3b5bd6'; g.fillRect(o.x * sx - 2, o.y * sy - 2, 4, 4); }
      if (o.type === 'markings') { g.fillStyle = '#9b2a1f'; g.font = '11px Courier Prime, monospace'; g.fillText('✕ markings', o.x * sx - 4, o.y * sy + 3); }
      if (o.type === 'ship') { g.fillStyle = '#222'; g.font = 'bold 11px Courier Prime, monospace'; g.fillText('▲ SHIP', o.x * sx - 14, o.y * sy + 3); }
    });
    g.fillStyle = '#9b2a1f'; g.beginPath(); g.arc(P.x * sx, P.y * sy, 3.5, 0, 7); g.fill();
    g.fillStyle = '#3a2a18'; g.font = '12px Special Elite, monospace'; g.fillText('FIELD SKETCH · ' + term('malezor'), 8, 16);
  }

  function drawSurface(now){
    var w = cv.width, h = cv.height, z = zoom(), c = camCenter();
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#0b0912'; ctx.fillRect(0, 0, w, h);
    var ox = w / 2 - c.x * T * z, oy = h / 2 - c.y * T * z;
    if (W.groundCanvas) ctx.drawImage(W.groundCanvas, ox, oy, MW * T * z, MH * T * z);
    // crater under the ship
    var cr = img('crater.png');
    if (cr.complete) ctx.drawImage(cr, ox + (SHIP_POS.x - 2.2) * T * z, oy + (SHIP_POS.y - 1.6) * T * z, 4.4 * T * z, 3.2 * T * z);
    // y-sorted drawables
    var list = W.objs.slice();
    W.critters.forEach(function(cc){ list.push({ type:'critter', c:cc, x:cc.x, y:cc.y }); });
    list.push({ type:'player', x:P.x, y:P.y });
    list.sort(function(a, b){ return a.y - b.y; });
    var vx0 = c.x - w / (2 * T * z) - 2, vx1 = c.x + w / (2 * T * z) + 2, vy0 = c.y - h / (2 * T * z) - 2, vy1 = c.y + h / (2 * T * z) + 3;
    list.forEach(function(o){
      if (o.x < vx0 || o.x > vx1 || o.y < vy0 || o.y > vy1) return;
      var X = ox + o.x * T * z, Y = oy + o.y * T * z;
      if (o.type === 'tree') drawImg('tree.png', X, Y, 2.3, 2.3, z);
      else if (o.type === 'bush') drawImg('bush.png', X, Y, 1.5, 1, z);
      else if (o.type === 'boulder') drawImg('boulder.png', X, Y, 1.1, 1.1, z);
      else if (o.type === 'astralite') drawSheet('astralite.png', o.taken ? 3 : 0, o.taken ? 3 : Math.floor(now / 220) % 4, X, Y, 1.25, z, 64);
      else if (o.type === 'markings') { drawImg('boulder.png', X, Y, 1.5, 1.5, z); ctx.fillStyle = 'rgba(255,214,120,' + (.45 + .25 * Math.sin(now / 400)) + ')'; ctx.fillRect(X - 9*z, Y - 26*z, 4*z, 10*z); ctx.fillRect(X - 2*z, Y - 30*z, 4*z, 14*z); ctx.fillRect(X + 5*z, Y - 24*z, 4*z, 8*z); }
      else if (o.type === 'ship') { var sp = SPR.ship; ctx.drawImage(sp, X - sp.width / 2 * z, Y - sp.height * z + 10 * z, sp.width * z, sp.height * z); }
      else if (o.type === 'critter') drawCritter(o.c, X, Y, z, now);
      else if (o.type === 'player') drawPlayer(X, Y, z);
    });
    // fog of war: unexplored ground stays dark
    var x0 = Math.max(0, Math.floor(vx0)), x1 = Math.min(MW - 1, Math.ceil(vx1)), y0 = Math.max(0, Math.floor(vy0)), y1 = Math.min(MH - 1, Math.ceil(vy1));
    for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) {
      if (W.fog[y * MW + x]) continue;
      ctx.fillStyle = 'rgba(11,9,18,.9)'; ctx.fillRect(Math.floor(ox + x * T * z), Math.floor(oy + y * T * z), Math.ceil(T * z) + 1, Math.ceil(T * z) + 1);
    }
    if (P.target && !camOpen) { var t = { x:ox + P.target.x * T * z, y:oy + P.target.y * T * z }; ctx.strokeStyle = 'rgba(239,230,208,.7)'; ctx.lineWidth = 2 * DPR; ctx.beginPath(); ctx.arc(t.x, t.y, 7 * z, 0, 7); ctx.stroke(); }
    if (P.hurt > 0) { ctx.fillStyle = 'rgba(160,20,10,' + (P.hurt * .25) + ')'; ctx.fillRect(0, 0, w, h); }
    drawFrameOverlay();
  }
  function drawImg(name, X, Y, wT, hT, z){
    var im = img(name); if (!im.complete || !im.naturalWidth) return;
    var w = wT * T * z, h = hT * T * z;
    ctx.drawImage(im, X - w / 2, Y - h + 4 * z, w, h);
  }
  function drawSheet(name, row, col, X, Y, sizeT, z, fr){
    var im = img(name); if (!im.complete || !im.naturalWidth) return;
    var s = sizeT * T * z;
    ctx.drawImage(im, col * fr, row * fr, fr, fr, X - s / 2, Y - s + 6 * z, s, s);
  }
  var ROW = { down:0, left:1, right:2, up:3 };
  function drawCritter(c, X, Y, z, now){
    var s = subj(c.id), size = c.id === 'volcanut' ? 1.6 : c.id === 'aetherwing' ? 1.2 : 1.35;
    var lift = c.fly ? (10 + Math.sin(now / 160 + c.x) * 4) * z : 0;
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(X, Y, 13 * z, 5 * z, 0, 0, 7); ctx.fill();
    var col = c.moving || c.fly ? Math.floor(c.anim) % 4 : 0;
    if (c.state === 'warn') X += Math.sin(now / 30) * 2 * z;
    drawSheet(s.sprite, ROW[c.dir], col, X, Y - lift, size, z, 72);
    if (c.state === 'warn' || c.state === 'charge') { ctx.fillStyle = '#ffde59'; ctx.font = 'bold ' + (16 * z) + 'px Courier Prime, monospace'; ctx.textAlign = 'center'; ctx.fillText('!', X, Y - size * T * z - 2 * z); }
    if (c.obs > 0 && !S.notes[c.id]) {
      ctx.strokeStyle = 'rgba(239,230,208,.85)'; ctx.lineWidth = 3 * DPR;
      ctx.beginPath(); ctx.arc(X, Y - size * T * z - 8 * z, 6 * z, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, c.obs / 3)); ctx.stroke();
    }
  }
  function drawPlayer(X, Y, z){
    var sp = P.dir === 'up' ? SPR.back : P.dir === 'down' ? SPR.front : SPR.side;
    var bob = P.moving ? Math.abs(Math.sin(P.anim)) * 2 * z : 0, sc = z * (P.crouch ? .78 : .85);
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(X, Y, 10 * z, 4 * z, 0, 0, 7); ctx.fill();
    ctx.save();
    ctx.translate(X, Y - bob);
    if (P.dir === 'left') ctx.scale(-1, 1);
    if (P.hurt > 0 && Math.floor(P.hurt * 12) % 2) ctx.globalAlpha = .4;
    ctx.drawImage(sp, -sp.width * sc / 2, -sp.height * sc, sp.width * sc, sp.height * sc);
    ctx.restore();
  }

  // ═════════════════════════ CAMERA ═════════════════════════
  var camOpen = false, camStage = null, focus = .5;
  function hudCamera(){
    return '<div class="x-cam" hidden><div class="x-vf"><i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i><span class="x-vfc">+</span></div>' +
      '<div class="x-camctl riv"><div class="x-range"><span>RANGE</span><b class="x-rng">—</b></div>' +
        '<label class="x-ring"><span>FOCUS</span><input type="range" min="0" max="1000" value="500" aria-label="Focus ring"><span class="x-scale"><i>1</i><i>2</i><i>3</i><i>5</i><i>10</i><i>∞</i></span></label>' +
        '<div class="x-cambtns"><button class="x-shutter" aria-label="Release shutter"></button><button class="x-camx">LOWER</button></div>' +
        '<p class="x-camfilm"></p></div></div>';
  }
  function bindCamera(stage){
    camStage = stage;
    var box = $('.x-cam'); if (!box) return;
    var ring = $('.x-ring input', box);
    ring.addEventListener('input', function(){ focus = ring.value / 1000; });
    $('.x-shutter', box).addEventListener('click', shoot);
    $('.x-camx', box).addEventListener('click', closeCamera);
    if (stage === 'space') { setTimeout(openCamera, 0); }
  }
  function openCamera(){
    var box = $('.x-cam'); if (!box) return;
    camOpen = true; box.hidden = false; aim = { x:0, y:0 }; doc.body.classList.add('cam-on');
    if (P) { P.target = null; P.joy = null; }
    $('.x-ring input', box).value = Math.round(focus * 1000);
    $('.x-camfilm', box).textContent = S.film + ' EXPOSURES LEFT';
  }
  function closeCamera(){
    var box = $('.x-cam'); camOpen = false; doc.body.classList.remove('cam-on'); cv.style.filter = ''; aim = { x:0, y:0 };
    if (box) box.hidden = true;
    if (camStage === 'space') ship();
  }
  function updateCamera(){}

  // Which subject is framed, how far, and how sharp
  function framed(){
    var vf = $('.x-vf'); if (!vf) return null;
    var r = vf.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var cands = [];
    if (camStage === 'space') {
      ['aenor', 'zoryth'].forEach(function(id){
        var b = SPACE[id], sx = innerWidth / 2 + (b.x - aim.x), sy = innerHeight / 2 + (b.y - aim.y);
        cands.push({ id:id, sx:sx, sy:sy, dist:Infinity, moving:false });
      });
    } else if (W) {
      W.critters.forEach(function(c){ var p = worldToScreen(c.x, c.y - .5); cands.push({ id:c.id, sx:p.x, sy:p.y, dist:Math.hypot(c.x - P.x, c.y - P.y), moving:c.moving, c:c }); });
      var den = worldToScreen(37, 6.5); cands.push({ id:'firstden', sx:den.x, sy:den.y, dist:Math.hypot(37 - P.x, 6.5 - P.y), moving:false });
    }
    var best = null, bd = 1e9;
    cands.forEach(function(k){
      if (k.sx < r.left || k.sx > r.right || k.sy < r.top || k.sy > r.bottom) return;
      if (k.id !== 'firstden' && camStage === 'surface' && W.fog[Math.floor(k.c.y) * MW + Math.floor(k.c.x)] === 0) return;
      var off = Math.hypot((k.sx - cx) / (r.width / 2), (k.sy - cy) / (r.height / 2));
      var score = off + (k.id === 'firstden' ? 0.6 : 0);
      if (score < bd) { bd = score; best = k; best.off = off; }
    });
    return best;
  }
  // focus ring is logarithmic in yards: 1 · 2 · 3 · 5 · 10 · ∞
  function needFor(dist){ if (!isFinite(dist)) return 1; var yd = Math.max(1, dist * 1.5); return clamp(Math.log(yd) / Math.log(10) * .84, 0, .84); }
  function drawFrameOverlay(){
    if (!camOpen) { cv.style.filter = ''; return; }
    var f = framed(), rng = $('.x-rng');
    var need = f ? needFor(f.dist) : 1, err = Math.abs(focus - need);
    var blur = clamp(err * 26, 0, 9);
    cv.style.filter = 'blur(' + blur.toFixed(1) + 'px) sepia(.25) contrast(1.05)';
    if (rng) rng.textContent = f ? (isFinite(f.dist) ? Math.max(1, Math.round(f.dist * 1.5)) + ' YD' : '∞') : '—';
  }

  function grade(f){
    if (!f) return null;
    if (isFinite(f.dist) && f.dist > 9) return 'poor';
    if (f.off > .75) return 'poor';  // outside the dashed print area: cut off in the print
    var err = Math.abs(focus - needFor(f.dist)) + (f.moving ? .03 : 0) + (f.off > .45 ? .06 : 0);
    return err < .035 ? 'excellent' : err < .085 ? 'good' : err < .17 ? 'fair' : 'poor';
  }
  function shoot(){
    if (!camOpen) return;
    if (S.film <= 0) { toast('ROLL FINISHED · develop it aboard ship', 'red'); return; }
    var f = framed(), g = grade(f);
    // the print is the real view, cropped to the viewfinder and blurred as it was
    var vf = $('.x-vf').getBoundingClientRect(), out = doc.createElement('canvas');
    out.width = 240; out.height = 180;
    var o = out.getContext('2d');
    var err = f ? Math.abs(focus - needFor(f.dist)) : .3;
    o.filter = 'blur(' + clamp(err * 10, 0, 4).toFixed(1) + 'px)';
    var cw = vf.width * .62, chh = vf.height * .62, cl = vf.left + (vf.width - cw) / 2, ct = vf.top + (vf.height - chh) / 2;
    try { o.drawImage(cv, cl * DPR, ct * DPR, cw * DPR, chh * DPR, 0, 0, 240, 180); } catch(e){}
    var data = ''; try { data = out.toDataURL('image/jpeg', .72); } catch(e){}
    S.film--;
    S.frames.push({ subj:f ? f.id : null, grade:f ? g : 'poor', img:data, t:Date.now() });
    if (f && (f.id === 'aenor' || f.id === 'zoryth')) { S.notes[f.id] = 1; S.flags[f.id === 'aenor' ? 'shotAenor' : 'shotZoryth'] = true; }
    if (f && f.id === 'firstden') S.notes.firstden = 1;
    save(); sfx.shutter(); vibrate(30);
    var box = $('.x-cam'); box.classList.remove('flash'); void box.offsetWidth; box.classList.add('flash');
    $('.x-camfilm', box).textContent = S.film + ' EXPOSURES LEFT';
    toast(f ? 'EXPOSED · ' + subjName(f.id) + ' · develop aboard ship' : 'EXPOSED · no subject in frame');
    if (camStage === 'surface') hudRefresh();
    if (camStage === 'surface' && f && f.c && subj(f.id).temperament === 'skittish') { f.c.state = 'flee'; }
  }

  // ───────────────────────── boot ─────────────────────────
  // ?debug exposes internals for automated tests only.
  if (/[?&]debug\b/.test(location.search)) window.__x = { S:function(){ return S; }, P:function(){ return P; }, W:function(){ return W; }, aim:function(){ return aim; }, setFocus:function(v){ focus = v; }, needFor:needFor, framed:framed };
  title();
})();
