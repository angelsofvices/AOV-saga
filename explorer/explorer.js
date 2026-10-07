// ★ 2026-10-07 · PROJECT 1936 (working title) · survey build 2
// Design: docs/card-explorer/01_EXPLORATION_DESIGN.md · Content: explorer/data.js
//
// The two goals of the game (Creator, 2026-10-07):
//   I.  Collect cards to bring back to Earth.
//   II. Construct the first map of the newly discovered star system.
//
// Flow: dossier → launch → hyperspace → ship (restore systems)
//       → THE MAP BOARD (home) → world panel → districts → land
//       → classic top-down exploration (examine, talk, encounters, caves)
//       → cards → back to the ship (darkroom, laboratory) → the board again.
(function(){
  'use strict';
  var D = window.EXP_DATA;
  var doc = document, ui = doc.getElementById('ui'), cv = doc.getElementById('view'), ctx = cv.getContext('2d');
  var A = '/explorer/assets/';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // World names join the lexicon: unknown bodies are catalogued by number.
  D.worlds.forEach(function(w){
    w.term = w.name.toLowerCase();
    D.lexicon[w.term] = { unknown:'UNIDENTIFIED BODY No. ' + w.no, canon:w.name };
  });
  var WORLD = {}; D.worlds.forEach(function(w){ WORLD[w.no] = w; });
  function setTerm(n){ return n === 29 ? 'aenor' : n === 30 ? 'zoryth' : WORLD[n].term; }

  // ───────────────────────── save ─────────────────────────
  var KEY = 'aov.explorer.v1';
  function blank(){
    return { v:2, name:'', stage:'title', flags:{}, film:12, frames:[], archive:{}, cards:{}, lex:{},
             suit:100, air:100, flares:2, visited:{}, last:null, map:null, pos:null, fog:{}, notes:{}, found:{},
             sound:false, started:Date.now() };
  }
  var S = null, fresh = /[?&]newgame\b/.test(location.search);
  try { S = JSON.parse(localStorage.getItem(KEY)); } catch(e){}
  if (S && S.v === 1) {          // carry an early-build save forward
    var old = S; S = blank();
    ['name','cards','archive','notes','lex','sound'].forEach(function(k){ if (old[k]) S[k] = old[k]; });
    ['power','air','radio','shotAenor','shotZoryth','copied','decoded'].forEach(function(k){ if (old.flags && old.flags[k]) S.flags[k] = old.flags[k]; });
    if (old.landed) S.visited[9] = Date.now();
    S.stage = S.flags.power ? 'map' : 'ship';
  }
  if (fresh || !S || S.v !== 2) S = fresh ? null : (S && S.v === 2 ? S : null);
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){ /* storage full or blocked: keep playing */ } }

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
    step:    function(){ tone(140, .03, 'triangle', .02); },
    click:   function(){ tone(420, .05, 'square', .04); tone(180, .06, 'square', .04, .03); },
    shutter: function(){ tone(2400, .02, 'square', .05); tone(900, .05, 'sawtooth', .04, .03); },
    warn:    function(){ tone(220, .25, 'sawtooth', .05); tone(180, .25, 'sawtooth', .05, .25); },
    bump:    function(){ tone(90, .06, 'square', .04); },
    reveal:  function(){ [392,494,587,784].forEach(function(f,i){ tone(f, .18, 'triangle', .04, i*.09); }); },
    meet:    function(){ [660,520,780].forEach(function(f,i){ tone(f, .1, 'square', .035, i*.07); }); }
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
      node._finish = finish;
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
  var POINTS = {
    aethren:{ observe:1, fair:1, classified:2 }, haemen:{ talk:1, classified:2 },
    mineral:{ classified:3 }, plant:{ classified:3 }, location:{ reached:1, classified:2 }, celestial:{ classified:3 }
  };
  function arc(id){ return S.archive[id] || (S.archive[id] = {}); }
  function mark(id, what){ var a = arc(id); if (a[what]) return false; a[what] = Date.now(); save(); return true; }
  function setPct(n){
    var got = 0, max = 0;
    Object.keys(D.subjects).forEach(function(id){
      var s = subj(id); if (s.set !== n) return;
      var P = POINTS[s.kind] || {}, a = S.archive[id] || {};
      Object.keys(P).forEach(function(k){ max += P[k]; if (a[k] || (a.classified && k === 'fair')) got += P[k]; });
    });
    return max ? Math.round(got / max * 100) : 0;
  }
  function setCards(n){ return Object.keys(S.cards).filter(function(id){ return subj(id) && subj(id).set === n; }).length; }
  function totalCopies(){ return Object.keys(S.cards).reduce(function(n, id){ return n + S.cards[id].qty; }, 0); }
  function classifiedCount(kind){
    return Object.keys(S.archive).filter(function(id){ return S.archive[id].classified && subj(id) && (!kind || subj(id).kind === kind); }).length;
  }
  // GOAL II: the first map. Half credit for identifying a body, half for visiting
  // (or, for Aenor and Zoryth, photographing) it.
  function mapPct(){
    var pts = 0;
    D.worlds.forEach(function(w){ if (known(w.term)) pts += .5; if (S.visited[w.no]) pts += .5; });
    ['aenor','zoryth'].forEach(function(k){ if (known(k)) pts += .5; if (S.cards[k]) pts += .5; });
    return Math.round(pts / (D.worlds.length + 2) * 100);
  }
  function identifiedCount(){ return D.worlds.filter(function(w){ return known(w.term); }).length; }
  function manifest(id, img, foil){
    var c = S.cards[id], first = !c;
    if (!c) c = S.cards[id] = { qty:0, img:img || null, foil:false, at:Date.now() };
    c.qty++; if (foil) c.foil = true; if (!c.img && img) c.img = img;
    if (!arc(id).classified) arc(id).classified = Date.now();
    S.notes[id] = 1;
    save();
    return first;
  }
  function rarity(s){ return s.tier ? s.tier + '/10' : 'UNRATED'; }
  function classLine(s){
    return s.kind === 'aethren' ? term('aethren') : s.kind === 'haemen' ? term('haemen') : s.kind === 'mineral' ? 'MINERAL SPECIMEN' :
      s.kind === 'plant' ? 'BOTANICAL SPECIMEN' : s.kind === 'location' ? 'LOCATION' : 'CELESTIAL BODY';
  }
  function artHtml(s, c){
    if (c && c.img) return '<img alt="" src="' + c.img + '">';
    if (s.sprite) return '<span class="x-spr' + (s.sheet || s.kind === 'aethren' ? ' sheet' : '') + '" style="background-image:url(' + A + s.sprite + ')"></span>';
    return '<span class="x-noimg">NO PLATE</span>';
  }
  function cardHtml(id, big){
    var s = subj(id), c = S.cards[id] || { qty:0 };
    var rows = [['SET', setName(s.set)], ['CLASS', classLine(s)]];
    if (s.district) rows.push(['WORLD', term('zyraxis')], ['DISTRICT', term(s.district)]);
    if (s.kind === 'aethren') rows.push(['SPECIES', subjName(id)]);
    if (s.kind === 'haemen') rows.push(['SPECIES', s.species || '— awaiting canon —']);
    rows.push(['RARITY', rarity(s)], ['QUANTITY', String(c.qty)]);
    return '<div class="x-card' + (c.foil ? ' foil' : '') + (big ? ' big' : '') + '" data-card="' + id + '">' +
      '<div class="x-card-band">' + esc(setName(s.set)) + '</div>' +
      '<div class="x-card-art">' + artHtml(s, c) + '</div>' +
      '<div class="x-card-nm">' + esc(subjName(id)) + '</div>' +
      (big ? '<dl class="x-card-dl">' + rows.map(function(r){ return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl>' +
        (s.canonNote && known(s.term) ? '<p class="x-card-canon">' + esc(s.canonNote) + '</p>' : '') +
        '<p class="x-card-note">“' + esc(s.journal) + '”</p>'
        : '<div class="x-card-meta"><span>' + esc(classLine(s)) + '</span><b>' + rarity(s) + '</b></div>') +
      (c.qty > 1 ? '<span class="x-qty">×' + c.qty + '</span>' : '') +
      '</div>';
  }
  // The field reveal: a card flips into existence over the game.
  function cardReveal(id, first, label){
    return new Promise(function(res){
      sfx.reveal();
      var m = el('div', 'x-modal x-reveal', '<div class="x-modal-in"><p class="x-man-k">' + esc(label || (first ? 'CARD ACQUIRED' : 'ANOTHER COPY · QUANTITY +1')) + '</p>' + cardHtml(id, true) + '<button class="x-btn">CONTINUE</button></div>');
      ui.appendChild(m);
      var b = $('.x-btn', m); setTimeout(function(){ b.focus(); }, 50);
      b.addEventListener('click', function(){ m.remove(); res(); });
    });
  }

  // ───────────────────────── objectives (Expedition Log) ─────────────────────────
  function goalsHtml(){
    return '<div class="x-goals">' +
      '<div class="x-goal"><span>GOAL I</span><b>CARDS FOR EARTH</b><em>' + Object.keys(S.cards).length + ' cards · ' + totalCopies() + ' copies aboard</em></div>' +
      '<div class="x-goal"><span>GOAL II</span><b>THE FIRST MAP</b><em>' + mapPct() + '% charted · ' + identifiedCount() + ' of 28 bodies named</em></div></div>';
  }
  function objectives(){
    var F = S.flags, fauna = classifiedCount('aethren'), spec = classifiedCount('plant') + classifiedCount('mineral');
    return [
      { t:'Restore ship systems: power, air, wireless', done: F.power && F.air && F.radio },
      { t:'Chart the surrounding bodies and land on one within range', done: !!S.visited[9] },
      { t:'Make contact with an inhabitant', done: !!(S.archive.furtrader && S.archive.furtrader.talk) },
      { t:'Photograph local ' + (known('aethren') ? 'Aethren' : 'fauna') + ' and develop the prints aboard (' + Math.min(fauna,3) + '/3 classified)', done: fauna >= 3 },
      { t:'Document botanical and mineral specimens (' + Math.min(spec,3) + '/3)', done: spec >= 3 },
      { t:'Show the inhabitant your photographs', done: !!F.taught },
      { t: known('firstden') ? 'Copy the carved markings in The First Den' : 'Explore the stone cave and copy its markings', done: F.copied },
      { t:'Decode the markings (Laboratory)', done: F.decoded },
      { t: known('aenor') ? 'Photograph Aenor and Zoryth from the Observation Port' : 'Photograph the radiant body and its satellite (Observation Port)', done: F.shotAenor && F.shotZoryth, side:true },
      { t:'FIND A WAY HOME', done:false, main:true }
    ];
  }
  function objList(){
    return goalsHtml() + '<ol class="x-obj">' + objectives().map(function(o){ return '<li class="' + (o.done ? 'done' : '') + (o.main ? ' main' : '') + (o.side ? ' side' : '') + '">' + esc(o.t) + '</li>'; }).join('') + '</ol>';
  }

  // ═════════════════════════ SCENES (DOM) ═════════════════════════
  function screen(cls, html){
    stopWorld();
    camOpen = false; aim = { x:0, y:0 };
    ui.innerHTML = ''; var s = el('div', 'x-screen ' + cls, html); ui.appendChild(s); return s;
  }

  // ── title ──
  function title(){
    var s = screen('x-title',
      '<div class="x-title-in">' +
        '<p class="x-stamp">TOP SECRET</p>' +
        '<h1>PROJECT<br>1936</h1>' +
        '<p class="x-tsub">AN AOV™ SAGA EXPEDITION</p>' +
        '<p class="x-tgoals">Collect the cards and bring them home to Earth.<br>Draw humanity’s first map of a newly discovered star system.</p>' +
        '<div class="x-btns">' +
          (S ? '<button class="x-btn" data-a="continue">CONTINUE EXPEDITION</button>' : '') +
          '<button class="x-btn' + (S ? ' ghost' : '') + '" data-a="new">' + (S ? 'NEW EXPEDITION' : 'OPEN THE DOSSIER') + '</button>' +
        '</div>' +
        '<p class="x-fine">Working title · survey build 2 · progress is saved in this browser only<br><a href="/games.html">← THE GAMES</a></p>' +
      '</div>');
    s.addEventListener('click', function(e){
      var a = e.target.closest('[data-a]'); if (!a) return;
      if (a.dataset.a === 'continue') { resume(); return; }
      if (S && !confirm('Start a new expedition? Your current records will be lost.')) return;
      S = blank(); save(); dossier();
    });
  }
  function resume(){
    if (S.stage === 'surface' && S.map) surface(S.map);
    else if (S.stage === 'map') expanse();
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
      'ISSUED:\n· Bellows field camera, 12 exposures per roll\n· Field journal and typewriter\n· Specimen case\n' +
      '· Pressure suit with SUIT and AIR instruments\n· Signal flares (2)\n\n' +
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
    ['chart', 'CHART ROOM', 'The map board'],
    ['panel', 'CONTROL PANEL', 'Power · air · wireless'],
    ['port', 'OBSERVATION PORT', 'Telescope & camera'],
    ['dark', 'DARKROOM', 'Develop film'],
    ['lab', 'LABORATORY', 'Decoding'],
    ['locker', 'CARD LOCKER', 'Cards for Earth'],
    ['archive', 'ARCHIVE', 'What has been documented'],
    ['log', 'EXPEDITION LOG', 'Goals & objectives']
  ];
  function systemsUp(){ return S.flags.power && S.flags.air && S.flags.radio; }
  function ship(firstArrival){
    if (S.stage !== 'adrift') S.stage = 'ship';
    S.suit = 100; S.air = 100; S.flares = 2; save();
    var undeveloped = S.frames.length;
    var s = screen('x-ship' + (S.flags.power ? '' : ' unpowered'),
      '<header class="x-shiphead riv"><div><p class="x-plate">EXPERIMENTAL VESSEL</p>' +
        '<p class="x-where">' + (S.map ? 'LANDED · ' + esc(term(D.maps[S.map].district)) + ' · ' + esc(term('zyraxis')) : 'ADRIFT · ' + esc(term('expanse'))) + '</p></div>' +
        '<button class="x-snd" aria-pressed="' + !!S.sound + '" title="Sound">' + (S.sound ? '♪ ON' : '♪ OFF') + '</button></header>' +
      '<div class="x-stations">' + STATIONS.map(function(st){
        var off = (!S.flags.power && st[0] !== 'panel' && st[0] !== 'log') || (st[0] === 'chart' && !systemsUp());
        var badge = st[0] === 'dark' && undeveloped ? '<i>' + undeveloped + '</i>' : st[0] === 'lab' && canDecode() ? '<i>!</i>' : '';
        return '<button class="x-station riv' + (st[0] === 'chart' ? ' wide' : '') + '" data-st="' + st[0] + '"' + (off ? ' disabled' : '') + '><b>' + st[1] + '</b><span>' +
          (off ? (S.flags.power ? 'RESTORE ALL SYSTEMS' : 'NO POWER') : st[2]) + '</span>' + badge + '</button>';
      }).join('') + '</div>' +
      (S.map ? '<button class="x-btn big" data-st="out">▶ DISEMBARK · ' + esc(term(D.maps[S.map].district)) + '</button>' : '') +
      '<p class="x-shipnote"></p>');
    s.addEventListener('click', function(e){
      if (e.target.closest('.x-snd')) { S.sound = !S.sound; save(); ship(); sfx.click(); return; }
      var b = e.target.closest('[data-st]'); if (!b || b.disabled) return;
      sfx.click();
      ({ chart:expanse, panel:controlPanel, port:observationPort, dark:darkroom, lab:laboratory, locker:locker, archive:archive, log:logbook,
         out:function(){ surface(S.map); } })[b.dataset.st]();
    });
    var note = $('.x-shipnote', s);
    if (firstArrival) typeInto(note, 'Main power is out. Start at the CONTROL PANEL.', 24);
    else if (!S.flags.power) note.textContent = 'Main power is out. Start at the CONTROL PANEL.';
    else if (!systemsUp()) note.textContent = 'Restore air and the wireless, then open the CHART ROOM.';
    else if (undeveloped) note.textContent = undeveloped + ' exposed frame' + (undeveloped > 1 ? 's' : '') + ' waiting in the DARKROOM.';
    else if (!S.visited[9]) note.textContent = 'All systems nominal. Open the CHART ROOM.';
  }
  function sub(title, body, cls, back){
    var s = screen('x-sub ' + (cls || ''), '<header class="x-subhead riv"><button class="x-back">◀ ' + (back ? back[0] : 'SHIP') + '</button><p class="x-plate">' + title + '</p></header><div class="x-subbody">' + body + '</div>');
    $('.x-back', s).addEventListener('click', function(){ sfx.click(); (back ? back[1] : ship)(); });
    return s;
  }

  // ── control panel ──
  function controlPanel(){
    var sys = [['power','MAIN POWER','Generator · vacuum-tube bank'],['air','AIR SCRUBBERS','Requires power'],['radio','WIRELESS SET','Requires power']];
    var s = sub('CONTROL PANEL', '<div class="x-switches">' + sys.map(function(x){
      return '<div class="x-sw riv' + (S.flags[x[0]] ? ' on' : '') + '">' + dial(x[1], x[0]) +
        '<button class="x-toggle" data-sys="' + x[0] + '" aria-pressed="' + !!S.flags[x[0]] + '" aria-label="' + x[1] + '"><span></span></button><small>' + x[2] + '</small></div>';
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
      if (systemsUp()) setTimeout(function(){ toast('ALL SYSTEMS NOMINAL · open the CHART ROOM'); }, 600);
    });
  }

  // ═════════════════════════ THE MAP BOARD (home) ═════════════════════════
  // Theme: the Creator's map-board reference: a glowing cosmic chart on a board
  // in a dark stone room, framed by gold-edged parchment panels.
  // Layout is canon (AETHRYX_EXPANSE_SCHEMATIC.png): Aenor at the centre, four
  // spires carrying the worlds in order, seven rings, AEP-28 on its drift orbit.
  var SPIRE = [[-1,0],[0,-1],[1,0],[0,1]];   // n%4: 0 → left, 1 → up, 2 → right, 3 → down
  function worldPos(w){
    var ring = Math.ceil(w.no / 4), d = SPIRE[w.no % 4], r = 62 + (ring - 1) * 62;
    if (w.no === 28) return { x:210, y:700 };
    return { x:500 + d[0] * r, y:500 + d[1] * r };
  }
  var ZORYTH_POS = { x:548, y:452 };
  function bodies(){
    var list = D.worlds.filter(function(w){ return !w.hidden; }).map(function(w){
      var p = worldPos(w); return { kind:'world', w:w, id:'w' + w.no, x:p.x, y:p.y, set:w.no };
    });
    list.push({ kind:'aenor', id:'aenor', x:500, y:500, set:29 });
    list.push({ kind:'zoryth', id:'zoryth', x:ZORYTH_POS.x, y:ZORYTH_POS.y, set:30 });
    return list;
  }
  function distAU(b){ var v = D.arrival; return Math.hypot(b.x - v.x, b.y - v.y); }
  function inRange(b){ return distAU(b) <= D.arrival.range; }
  function bodyStatus(b){
    if (b.kind !== 'world') return known(b.kind) ? 'identified' : 'unidentified';
    return S.visited[b.w.no] ? 'visited' : known(b.w.term) ? 'identified' : 'unidentified';
  }

  function chartSvg(){
    var defs = '<defs>' +
      '<radialGradient id="neb1" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe7b0" stop-opacity=".55"/><stop offset=".2" stop-color="#d9a35a" stop-opacity=".25"/><stop offset=".55" stop-color="#5b3c8c" stop-opacity=".18"/><stop offset="1" stop-color="#0b0a14" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="sun"><stop offset="0" stop-color="#fffdf0"/><stop offset=".25" stop-color="#ffe7a0"/><stop offset=".6" stop-color="#f0b850" stop-opacity=".55"/><stop offset="1" stop-color="#f0b850" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="orbUnk" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#5a5868"/><stop offset=".6" stop-color="#26242e"/><stop offset="1" stop-color="#0c0b10"/></radialGradient>' +
      '<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>' +
      '<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>';
    D.worlds.forEach(function(w){
      defs += '<radialGradient id="orb' + w.no + '" cx="34%" cy="30%" r="72%"><stop offset="0" stop-color="#ffffff" stop-opacity=".85"/><stop offset=".18" stop-color="' + w.color + '"/><stop offset=".75" stop-color="' + w.color + '"/><stop offset="1" stop-color="#05040a"/></radialGradient>';
    });
    defs += '<radialGradient id="orbZ" cx="34%" cy="30%" r="72%"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="#d8d0e2"/><stop offset="1" stop-color="#3a3444"/></radialGradient></defs>';
    var svg = '<svg class="x-chart-svg" viewBox="0 0 1000 1000" role="group" aria-label="The first map of the system">' + defs;
    // the nebula disc and swirling dust lanes
    svg += '<circle cx="500" cy="500" r="480" fill="url(#neb1)"/>';
    for (var k = 0; k < 6; k++) svg += '<ellipse cx="500" cy="500" rx="' + (430 - k * 40) + '" ry="' + (190 - k * 14) + '" transform="rotate(' + (k * 31 - 20) + ' 500 500)" class="x-dust" style="opacity:' + (.22 - k * .02).toFixed(2) + '"/>';
    for (var r = 1; r <= 7; r++) svg += '<circle cx="500" cy="500" r="' + (62 + (r - 1) * 62) + '" class="x-ring"/>';
    svg += '<line x1="500" y1="40" x2="500" y2="960" class="x-spire"/><line x1="40" y1="500" x2="960" y2="500" class="x-spire"/>';
    if (known('expanse')) svg += '<ellipse cx="470" cy="520" rx="470" ry="250" transform="rotate(-28 470 520)" class="x-drift"/>';
    svg += '<circle cx="' + D.arrival.x + '" cy="' + D.arrival.y + '" r="' + D.arrival.range + '" class="x-range-c"/>';
    bodies().forEach(function(b){
      var st = bodyStatus(b), lit = st !== 'unidentified';
      var rr = b.kind === 'aenor' ? 26 : b.kind === 'zoryth' ? 10 : (b.w.no === 9 || b.w.no === 27 ? 19 : 15);
      svg += '<g class="x-bd ' + st + (inRange(b) ? ' reach' : '') + '" data-id="' + b.id + '" transform="translate(' + b.x + ' ' + b.y + ')">';
      if (b.kind === 'aenor') {
        svg += '<circle r="90" fill="url(#sun)"/><path d="M0 -150 L5 -6 L150 0 L5 6 L0 150 L-5 6 L-150 0 L-5 -6 Z" class="x-flare"/><circle r="' + rr + '" fill="#fffbe8" filter="url(#glow)"/><circle r="' + (rr - 6) + '" fill="#fffef6"/>';
      } else {
        var fill = !lit ? 'url(#orbUnk)' : b.kind === 'zoryth' ? 'url(#orbZ)' : 'url(#orb' + b.w.no + ')';
        if (lit && b.kind === 'world') svg += '<circle r="' + (rr + 8) + '" fill="' + b.w.color + '" opacity=".35" filter="url(#glow)"/>';
        if (b.w && b.w.ringed && lit) svg += '<ellipse rx="' + (rr + 13) + '" ry="7" transform="rotate(-18)" class="x-pring back"/>';
        svg += '<circle r="' + rr + '" fill="' + fill + '" class="x-orb"/>';
        if (b.w && b.w.ringed && lit) svg += '<path d="M' + -(rr + 13) + ' 0 A' + (rr + 13) + ' 7 0 0 0 ' + (rr + 13) + ' 0" transform="rotate(-18)" class="x-pring"/>';
        if (!lit) svg += '<text y="5" class="x-q">?</text>';
      }
      var label = b.kind === 'aenor' ? (known('aenor') ? 'AENOR' : '') : b.kind === 'zoryth' ? (known('zoryth') ? 'ZORYTH' : '') :
        (known(b.w.term) ? b.w.no + ' · ' + b.w.name : 'No. ' + b.w.no);
      if (label) svg += '<g class="x-tag" transform="translate(0 ' + (rr + 18) + ')"><rect x="' + (-label.length * 4.6 - 8) + '" y="-11" width="' + (label.length * 9.2 + 16) + '" height="18" rx="3"/><text y="3">' + esc(label) + '</text></g>';
      svg += '</g>';
    });
    svg += '<g class="x-vessel" transform="translate(' + D.arrival.x + ' ' + D.arrival.y + ')"><circle r="12" class="x-vring"/><path d="M-6 -6 L6 6 M6 -6 L-6 6"/><text y="-18">YOUR VESSEL</text></g></svg>';
    return svg;
  }

  function expanse(selectId){
    S.stage = 'map'; save();
    var name = S.name ? S.name.toUpperCase() : 'THE PILOT-OBSERVER';
    var visited = D.worlds.filter(function(w){ return S.visited[w.no]; }).length;
    var s = screen('x-board',
      '<div class="x-board-in">' +
        '<aside class="x-bcol left">' +
          '<section class="x-plq x-plq-title"><h2>' + (known('expanse') ? 'THE AETHRYX EXPANSE' : 'AN UNCHARTED SYSTEM') + '</h2><p class="x-plq-sub">THE FIRST MAP · DRAWN BY ' + esc(name) + ' · 1936</p>' +
            '<p>' + (known('expanse') ? 'Twenty-eight worlds on four spires around one star. No person from Earth has seen it before.' : 'Bodies on four lines around a single star. No Earth chart matches it. I am drawing the first.') + '</p></section>' +
          '<section class="x-plq"><h3>THE TWO GOALS</h3>' +
            '<div class="x-gl"><span>I</span><div><b>CARDS FOR EARTH</b><em>' + Object.keys(S.cards).length + ' cards · ' + totalCopies() + ' copies in the locker</em></div></div>' +
            '<div class="x-gl"><span>II</span><div><b>THE FIRST MAP</b><em>' + mapPct() + '% charted</em><i class="x-bar"><i style="width:' + mapPct() + '%"></i></i></div></div></section>' +
          '<section class="x-plq x-hide-sm"><h3>THE SYSTEM</h3><ul class="x-facts">' +
            '<li><span>Central star</span><b>' + esc(term('aenor')) + '</b></li><li><span>Satellite</span><b>' + esc(term('zoryth')) + '</b></li>' +
            '<li><span>Bodies charted</span><b>' + D.worlds.filter(function(w){ return !w.hidden; }).length + '</b></li><li><span>Named</span><b>' + identifiedCount() + '</b></li><li><span>Landed upon</span><b>' + visited + '</b></li></ul></section>' +
        '</aside>' +
        '<div class="x-bmap">' + chartSvg() + '<p class="x-banner">' + (known('expanse') ? 'THE AETHRYX EXPANSE' : 'UNCHARTED REGION') + '</p></div>' +
        '<aside class="x-bcol right">' +
          '<section class="x-plq"><h3>KEY</h3><ul class="x-key">' +
            '<li><i class="k visited"></i>VISITED</li><li><i class="k identified"></i>NAMED, NOT YET VISITED</li><li><i class="k unidentified"></i>UNIDENTIFIED</li><li><i class="k range"></i>RANGE OF THE DRIVE</li></ul></section>' +
          '<section class="x-plq x-hide-sm"><h3>BODIES NAMED</h3><ol class="x-named">' + D.worlds.filter(function(w){ return !w.hidden; }).map(function(w){
            return '<li class="' + (known(w.term) ? 'k' : '') + '"><span>' + w.no + '.</span>' + (known(w.term) ? esc(title1936(w.name)) : '· · ·') + '</li>'; }).join('') + '</ol></section>' +
          '<section class="x-plq x-vplq"><h3>THE VESSEL</h3><p>Film ' + S.film + ' · Prints waiting ' + S.frames.length + '</p><button class="x-btn" data-a="ship">BOARD SHIP</button></section>' +
        '</aside>' +
      '</div>' +
      '<div class="x-sheet" hidden></div>');
    $('[data-a="ship"]', s).addEventListener('click', function(){ sfx.click(); ship(); });
    var svgEl = $('svg', s);
    svgEl.addEventListener('click', function(e){
      var pt = svgEl.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      var p = pt.matrixTransform(svgEl.getScreenCTM().inverse()), best = null, bd = 46;
      bodies().forEach(function(b){ var d = Math.hypot(b.x - p.x, b.y - p.y); if (d < bd) { bd = d; best = b; } });
      if (best) { sfx.click(); openSheet(best); }
    });
    if (selectId) { var b0 = bodies().filter(function(b){ return b.id === selectId; })[0]; if (b0) openSheet(b0); }
    else if (!S.visited[9]) setTimeout(function(){ toast('Every body is unidentified. One lies within range of the drive. Tap it.'); }, 400);
  }
  function openSheet(b){
    var sh = $('.x-sheet'); if (!sh) return;
    $$('.x-bd').forEach(function(g){ g.classList.toggle('sel', g.dataset.id === b.id); });
    var html, set = b.set, inR = inRange(b), au = (distAU(b) / 62 * 1.4).toFixed(1);
    if (b.kind === 'aenor' || b.kind === 'zoryth') {
      var kn = known(b.kind);
      html = '<p class="x-sh-k">' + esc(setName(set)) + '</p><h3>' + esc(term(b.kind)) + '</h3>' +
        '<dl><dt>STATUS</dt><dd>' + (S.cards[b.kind] ? 'PHOTOGRAPHED' : 'OBSERVED BY EYE') + '</dd><dt>SURVEY</dt><dd>' + setPct(set) + '%</dd>' +
        '<dt>CARDS</dt><dd>' + setCards(set) + ' / ???</dd></dl>' +
        '<p class="x-sh-note">' + (kn ? esc(subj(b.kind).canonNote) + ' ' : '') + 'Cannot be landed upon. Photograph it from the ship.</p>' +
        '<div class="x-sh-btns"><button class="x-btn" data-a="port">OBSERVATION PORT</button><button class="x-btn ghost" data-a="close">CLOSE</button></div>';
    } else {
      var w = b.w, kn2 = known(w.term), vis = S.visited[w.no];
      if (!kn2 && !vis) {
        html = '<p class="x-sh-k">CATALOGUE ENTRY</p><h3>UNIDENTIFIED BODY No. ' + w.no + '</h3>' +
          '<dl><dt>DISTANCE</dt><dd>' + au + ' A.U. (INSTRUMENT READING)</dd><dt>SURVEY</dt><dd>NONE</dd></dl>' +
          '<p class="x-sh-note">' + (inR ? (w.playable ? 'Within range of the drive. A landing may be possible.' : 'Within range, but no safe landing site has been found. A future expedition.') :
            'Beyond the present range of the drive.') + '</p>' +
          '<div class="x-sh-btns">' + (inR && w.playable ? '<button class="x-btn" data-a="explore">ATTEMPT LANDING</button>' : '') + '<button class="x-btn ghost" data-a="close">CLOSE</button></div>';
      } else {
        html = '<p class="x-sh-k">' + esc(setName(w.no)) + '</p><h3>' + esc(term(w.term)) + '</h3>' + (kn2 && w.title ? '<p class="x-sh-sub">' + esc(w.title.toUpperCase()) + '</p>' : '') +
          '<dl><dt>STATUS</dt><dd>' + (vis ? 'VISITED' : 'NAMED') + '</dd><dt>SURVEY</dt><dd>' + setPct(w.no) + '%</dd>' +
          '<dt>CARDS</dt><dd>' + setCards(w.no) + ' / ???</dd>' + (S.last && w.no === 9 ? '<dt>LAST EXPEDITION</dt><dd>' + esc(term(S.last)) + '</dd>' : '') + '</dl>' +
          '<div class="x-sh-btns">' + (w.playable && inR ? '<button class="x-btn" data-a="explore">EXPLORE</button>' : '<p class="x-sh-note">' + (inR ? 'No safe landing site yet. A future expedition.' : 'Beyond the present range of the drive.') + '</p>') +
          '<button class="x-btn ghost" data-a="close">CLOSE</button></div>';
      }
    }
    sh.innerHTML = '<div class="x-plq x-sheet-in">' + html + '</div>';
    sh.hidden = false;
    sh.onclick = function(e){
      var a = e.target.closest('[data-a]'); if (!a) return;
      sfx.click();
      if (a.dataset.a === 'close') { sh.hidden = true; $$('.x-bd').forEach(function(g){ g.classList.remove('sel'); }); }
      if (a.dataset.a === 'port') observationPort();
      if (a.dataset.a === 'explore') planet(b.w.no);
    };
  }

  // ── a world: its districts ──
  function planet(no){
    var w = WORLD[no], list = D.districts[no] || [];
    var s = sub(esc(term(w.term)), '<div class="x-plq"><p class="x-sh-k">' + esc(setName(no)) + ' · SURVEY ' + setPct(no) + '% · CARDS ' + setCards(no) + ' / ???</p>' +
      '<p class="x-sh-note">Orbital survey: ten distinct regions visible from orbit.' + (known('malezor') ? '' : ' None are named.') + '</p>' +
      '<ol class="x-dist">' + list.map(function(d, i){
        var open = !!d.map;
        return '<li class="' + (open ? 'open' : '') + '"><span class="x-roman">' + ['I','II','III','IV','V','VI','VII','VIII','IX','X'][i] + '</span>' +
          '<b>' + esc(term(d.id)) + '</b>' + (open ? '<button class="x-btn small" data-d="' + d.id + '">' + (S.visited[no] ? 'LAND' : 'ATTEMPT LANDING') + '</button>' : '<em>Not yet surveyed</em>') + '</li>';
      }).join('') + '</ol></div>', 'x-planet', ['MAP', function(){ expanse('w' + no); }]);
    s.addEventListener('click', function(e){
      var b = e.target.closest('[data-d]'); if (!b) return;
      var d = list.filter(function(x){ return x.id === b.dataset.d; })[0];
      if (!S.visited[no]) descent(no, d.map); else land(no, d.map);
    });
  }
  function land(no, mapId){
    S.visited[no] = S.visited[no] || Date.now();
    if (S.map !== mapId) S.pos = null;
    S.map = mapId; S.last = D.maps[mapId].district; save();
    surface(mapId);
  }
  function descent(no, mapId){
    var s = screen('x-cockpit shake', '<div class="x-panel riv"><p class="x-plate">DESCENT</p><p class="x-alt">ALT <b>0420000</b> FT</p><p class="x-readout">HULL TEMPERATURE RISING</p></div>');
    tone(55, 3, 'sawtooth', .05);
    var b = $('.x-alt b', s), t0 = performance.now();
    (function tick(now){
      var k = Math.min(1, (now - t0) / (reduced ? 200 : 3200));
      b.textContent = String(Math.round(420000 * Math.pow(1 - k, 2))).padStart(7, '0');
      if (k < 1) requestAnimationFrame(tick);
      else {
        $('.x-readout', s).textContent = 'TOUCHDOWN';
        s.classList.remove('shake'); sfx.click();
        setTimeout(function(){ land(no, mapId); setTimeout(function(){ toast('TOUCHDOWN · ' + term(D.maps[mapId].district) + ' · SUIT ON, AIR TANK FULL'); }, 300); }, reduced ? 50 : 900);
      }
    })(t0);
  }

  // ── darkroom: film → cards ──
  function darkroom(){
    var s = sub('DARKROOM', '<div class="x-dark"><div class="x-tray"><div class="x-print"><img alt=""></div><p class="x-grade"></p></div>' +
      '<div class="x-darkctl"><p class="x-darknote"></p><button class="x-btn" data-a="dev">DEVELOP ROLL</button></div>' +
      '<div class="x-manifest"></div></div>', 'x-redroom');
    var n = S.frames.length, note = $('.x-darknote', s), btn = $('[data-a="dev"]', s);
    note.textContent = n ? n + ' exposed frame' + (n > 1 ? 's' : '') + ' on the roll.' : 'No exposed film. Photograph things on the surface or from the Observation Port.';
    btn.disabled = !n;
    btn.addEventListener('click', function(){ btn.disabled = true; develop(s); });
  }
  async function develop(s){
    var print = $('.x-print', s), img = $('img', print), grade = $('.x-grade', s), man = $('.x-manifest', s), note = $('.x-darknote', s);
    var frames = S.frames.slice();
    S.film = Math.max(S.film, 12); save();
    for (var i = 0; i < frames.length; i++) {
      if (!$('.x-redroom')) return;     // left the darkroom: the rest stay on the roll
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
        if (f.grade === 'excellent' || f.grade === 'good') {
          var first = manifest(f.subj, f.img, f.grade === 'excellent');
          man.innerHTML = '<p class="x-man-k">' + (first ? 'CARD MANIFESTED' : 'ANOTHER COPY · QUANTITY +1') + '</p>' + cardHtml(f.subj, false);
          sfx.reveal();
        } else {
          mark(f.subj, 'fair');
          man.innerHTML = '<p class="x-man-k dim">' + (f.grade === 'fair' ? 'USABLE AS EVIDENCE · TOO SOFT FOR A CARD' : 'UNUSABLE PRINT') + '<br>' + esc(subjName(f.subj)) + '</p>';
        }
      } else man.innerHTML = '<p class="x-man-k dim">NO SUBJECT IN FRAME</p>';
      await wait(1500);
    }
    S.flags.developed = true; save();
    note.textContent = 'Roll finished. Film reloaded: ' + S.film + ' exposures.';
    $('[data-a="dev"]', s).hidden = true;
  }

  // ── laboratory: decoding ──
  function canDecode(){ return S.flags.copied && !S.flags.decoded && classifiedCount() >= 4; }
  function laboratory(){
    var s = sub('LABORATORY',
      '<div class="x-lab riv"><h3>DECODING</h3><p>' + (S.flags.decoded ? 'The markings are decoded.' :
        !S.flags.copied ? 'No inscriptions copied yet. Look for carved markings on the surface.' :
        classifiedCount() < 4 ? 'Markings copied. Too little to cross-reference: classify at least 4 subjects first (' + classifiedCount() + '/4).' :
        'Markings copied. Enough records to cross-reference against the carved figures.') + '</p>' +
      '<button class="x-btn" data-a="dec"' + (canDecode() ? '' : ' disabled') + '>DECODE THE MARKINGS</button></div>' +
      '<div class="x-lab riv"><h3>CLASSIFICATION</h3><p>' + classifiedCount() + ' subjects classified. Plants and minerals are classified in the field; photographs in the Darkroom.</p></div>');
    $('[data-a="dec"]', s).addEventListener('click', function(){
      reclassify(D.teaches.markings, 'The carved figures match your records. Beside each figure, a word. The words repeat in the wireless pattern.', function(){
        S.flags.decoded = true; save(); expanse(); toast('The map board now reads in the true names.');
      });
    });
  }

  // The premise lands here: 1936 descriptions struck out, true names typed in.
  async function reclassify(terms, intro, done){
    terms = terms.filter(function(t){ return D.lexicon[t] && D.lexicon[t].canon && !S.lex[t]; });
    var s = screen('x-reclass', '<div class="x-paper"><p class="x-stamp red">RECLASSIFICATION</p><p class="x-mono">' + esc(intro) + '</p><ul class="x-relist"></ul><button class="x-btn" hidden>CONTINUE</button></div>');
    var list = $('.x-relist', s);
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i], L = D.lexicon[t];
      var li = el('li', '', '<s>' + esc(L.unknown) + '</s><b></b>'); list.appendChild(li);
      li.scrollIntoView({ block:'nearest' });
      await wait(320); li.classList.add('struck'); sfx.click();
      await typeInto(li.querySelector('b'), L.canon, 40);
      S.lex[t] = true; save();
      await wait(160);
    }
    var b = $('.x-btn', s); b.hidden = false; b.focus();
    b.addEventListener('click', done);
  }

  // ── card locker (inventory) ──
  function locker(){
    var ids = Object.keys(S.cards).filter(subj).sort(function(a, b){ return subj(a).set - subj(b).set; });
    var s = sub('CARD LOCKER', '<p class="x-mono light">GOAL I · CARDS FOR EARTH — ' + ids.length + ' card' + (ids.length === 1 ? '' : 's') + ' · ' + totalCopies() + ' copies, sealed for the voyage home</p>' +
      (ids.length ? '<div class="x-grid">' + ids.map(function(id){ return cardHtml(id, false); }).join('') + '</div>'
      : '<p class="x-empty">No cards yet. Examine plants and minerals on the surface; photographs become cards in the DARKROOM.</p>'));
    s.addEventListener('click', function(e){
      var c = e.target.closest('.x-grid [data-card]'); if (!c) return;
      var m = el('div', 'x-modal', '<div class="x-modal-in">' + cardHtml(c.dataset.card, true) + '<button class="x-btn ghost">CLOSE</button></div>');
      ui.appendChild(m); sfx.click();
      m.addEventListener('click', function(ev){ if (ev.target === m || ev.target.closest('.x-btn')) m.remove(); });
    });
  }

  // ── archive (knowledge) ──
  function archive(){
    var sets = [9, 29, 30];
    sub('ARCHIVE', sets.map(function(n){
      var ids = Object.keys(D.subjects).filter(function(id){ return subj(id).set === n; });
      return '<section class="x-arc riv"><h3>' + esc(setName(n)) + ' <b>' + setPct(n) + '%</b></h3>' +
        (n === 9 ? '<p class="x-mono">This build covers one district of this world.</p>' : '') +
        '<ul>' + ids.map(function(id){
          var a = S.archive[id] || {}, seen = Object.keys(a).length;
          return '<li class="' + (a.classified ? 'done' : seen ? 'part' : '') + '"><b>' + (seen ? esc(subjName(id)) : '— not yet recorded —') + '</b>' +
            '<span>' + (a.classified ? 'CLASSIFIED' : seen ? 'FIELD RECORD' : '') + '</span>' +
            (S.notes[id] ? '<em>' + esc(subj(id).journal) + '</em>' : '') + '</li>';
        }).join('') + '</ul></section>';
    }).join('') + '<p class="x-mono dim">The master collection holds 30 sets. 27 remain unexplored.</p>');
  }

  function logbook(){
    var name = S.name ? esc(S.name.toUpperCase()) : 'PILOT-OBSERVER';
    sub('EXPEDITION LOG', '<div class="x-paper"><p class="x-mono">LOG OF ' + name + '</p>' + objList() +
    (S.flags.decoded ? '<p class="x-mono">END OF THIS BUILD\'S SURVEY. Keep documenting: every Good or Excellent photograph adds a copy to your Card Locker. The way home lies further out, in a future build.</p>' : '') +
    '<button class="x-btn ghost" data-a="reset">ERASE EXPEDITION</button></div>');
    $('[data-a="reset"]').addEventListener('click', function(){
      if (!confirm('Erase this expedition and start over?')) return;
      try { localStorage.removeItem(KEY); } catch(e){}
      S = null; title();
    });
  }

  // ═════════════════════════ CANVAS LOOP ═════════════════════════
  var IMG = {};
  function img(name){ if (!IMG[name]) { IMG[name] = new Image(); IMG[name].src = A + name; } return IMG[name]; }
  ['grass.png','den.png','water.png','tree.png','bush.png','boulder.png','crater.png','astralite.png','haemen.png','otterlin.png','verdanix.png','aetherwing.png','volcanut.png'].forEach(img);

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
    else if (mode === 'space') drawSpace(now);
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

  // ── observation port (space) ──
  var stars = null, aim = { x:0, y:0 }, camOpen = false, focus = .5;
  var SPACE = { aenor:{ x:-260, y:-60, r:70 }, zoryth:{ x:300, y:90, r:34 } };
  function observationPort(){
    screen('x-port', '<header class="x-subhead riv"><button class="x-back">◀ SHIP</button><p class="x-plate">OBSERVATION PORT</p></header>' +
      '<p class="x-porthint">Drag to aim the telescope. Set the focus ring, then release the shutter.</p>' +
      '<div class="x-cam"><div class="x-vf"><i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i><span class="x-vfc">+</span></div>' +
      '<div class="x-camctl riv"><div class="x-range"><span>RANGE</span><b class="x-rng">—</b></div>' +
        '<label class="x-ring"><span>FOCUS</span><input type="range" min="0" max="1000" value="500" aria-label="Focus ring"><span class="x-scale"><i>1</i><i>2</i><i>3</i><i>5</i><i>10</i><i>∞</i></span></label>' +
        '<div class="x-cambtns"><button class="x-shutter" aria-label="Release shutter"></button></div><p class="x-camfilm"></p></div></div>');
    aim = { x:0, y:0 }; camOpen = true; focus = .5;
    startWorld('space');
    $('.x-back').addEventListener('click', function(){ sfx.click(); ship(); });
    var ring = $('.x-ring input');
    ring.addEventListener('input', function(){ focus = ring.value / 1000; });
    $('.x-shutter').addEventListener('click', spaceShot);
    $('.x-camfilm').textContent = S.film + ' EXPOSURES LEFT';
  }
  function spaceFramed(){
    var vf = $('.x-vf'); if (!vf) return null;
    var r = vf.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, best = null, bd = 9;
    ['aenor', 'zoryth'].forEach(function(id){
      var b = SPACE[id], sx = innerWidth / 2 + (b.x - aim.x), sy = innerHeight / 2 + (b.y - aim.y);
      if (sx < r.left || sx > r.right || sy < r.top || sy > r.bottom) return;
      var off = Math.hypot((sx - cx) / (r.width / 2), (sy - cy) / (r.height / 2));
      if (off < bd) { bd = off; best = { id:id, off:off }; }
    });
    return best;
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
    var a = SPACE.aenor, ax = cx + a.x*z, ay = cy + a.y*z;
    var g = ctx.createRadialGradient(ax, ay, 0, ax, ay, a.r*3.2*z);
    g.addColorStop(0, '#fffbe8'); g.addColorStop(.18, '#ffe9a8'); g.addColorStop(.32, 'rgba(255,200,110,.55)'); g.addColorStop(1, 'rgba(255,170,80,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ax, ay, a.r*3.2*z, 0, 7); ctx.fill();
    var m = SPACE.zoryth, mx = cx + m.x*z, my = cy + m.y*z;
    ctx.fillStyle = '#cfc7d8'; ctx.beginPath(); ctx.arc(mx, my, m.r*z, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(90,80,110,.45)';
    [[-10,-8,8],[12,4,6],[-4,14,5],[8,-14,4]].forEach(function(c){ ctx.beginPath(); ctx.arc(mx + c[0]*z, my + c[1]*z, c[2]*z, 0, 7); ctx.fill(); });
    var shd = ctx.createLinearGradient(mx - m.r*z, my, mx + m.r*z, my);
    shd.addColorStop(0, 'rgba(5,4,10,0)'); shd.addColorStop(1, 'rgba(5,4,10,.75)');
    ctx.fillStyle = shd; ctx.beginPath(); ctx.arc(mx, my, m.r*z, 0, 7); ctx.fill();
    var f = spaceFramed(), err = Math.abs(focus - 1);
    cv.style.filter = 'blur(' + clamp(err * 26, 0, 9).toFixed(1) + 'px) sepia(.25)';
    var rngEl = $('.x-rng'); if (rngEl) rngEl.textContent = f ? '∞' : '—';
  }
  function spaceShot(){
    if (S.film <= 0) { toast('ROLL FINISHED · develop it in the Darkroom', 'red'); return; }
    var f = spaceFramed(), err = Math.abs(focus - 1) + (f && f.off > .45 ? .06 : 0);
    var g = !f ? 'poor' : err < .035 ? 'excellent' : err < .085 ? 'good' : err < .17 ? 'fair' : 'poor';
    var vf = $('.x-vf').getBoundingClientRect(), out = doc.createElement('canvas'); out.width = 240; out.height = 180;
    var o = out.getContext('2d'); o.filter = 'blur(' + clamp(Math.abs(focus - 1) * 10, 0, 4).toFixed(1) + 'px)';
    var cw = vf.width * .62, chh = vf.height * .62;
    try { o.drawImage(cv, (vf.left + (vf.width - cw) / 2) * DPR, (vf.top + (vf.height - chh) / 2) * DPR, cw * DPR, chh * DPR, 0, 0, 240, 180); } catch(e){}
    var data = ''; try { data = out.toDataURL('image/jpeg', .72); } catch(e){}
    S.film--; S.frames.push({ subj:f ? f.id : null, grade:g, img:data, t:Date.now() });
    if (f) { S.notes[f.id] = 1; S.flags[f.id === 'aenor' ? 'shotAenor' : 'shotZoryth'] = true; }
    save(); sfx.shutter();
    var box = $('.x-cam'); box.classList.remove('flash'); void box.offsetWidth; box.classList.add('flash');
    $('.x-camfilm').textContent = S.film + ' EXPOSURES LEFT';
    toast(f ? 'EXPOSED · ' + subjName(f.id) + ' · develop in the Darkroom' : 'EXPOSED · no subject in frame');
  }

  // ═════════════════════════ SURFACE · classic tile exploration ═════════════════════════
  var T = 40, M = null, P = null, critters = [], fogArr = null, dialogOpen = false, encounterOpen = false, held = null, path = [];
  var SOLID = { T:1, b:1, B:1, '~':1, A:1, S:1, H:1, M:1, X:1, '#':1 };
  var DIRS = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };

  function parseMap(id){
    var def = D.maps[id], rows = def.rows, H = rows.length, W = rows[0].length;
    var grid = [], spawns = [], shipAt = null, npc = null;
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var ch = rows[y][x];
      if ('OVWC'.indexOf(ch) >= 0) { spawns.push({ c:ch, x:x, y:y }); ch = '.'; }
      if (ch === 'S') shipAt = { x:x, y:y };
      if (ch === 'H') npc = { x:x, y:y, dir:'down' };
      grid.push(ch);
    }
    // the ship covers 3×2 tiles around its anchor
    if (shipAt) for (var j = -1; j <= 0; j++) for (var i = -1; i <= 1; i++) grid[(shipAt.y + j) * W + shipAt.x + i] = 'S';
    return { id:id, def:def, W:W, H:H, grid:grid, spawns:spawns, ship:shipAt, npc:npc, ground:null };
  }
  function at(x, y){ return (x < 0 || y < 0 || x >= M.W || y >= M.H) ? '#' : M.grid[y * M.W + x]; }
  function critterAt(x, y){ for (var i = 0; i < critters.length; i++) if (critters[i].x === x && critters[i].y === y) return critters[i]; return null; }
  function blocked(x, y, who){
    var ch = at(x, y);
    if (who && who.swims && ch === '~') return !!critterAt(x, y);
    if (who && who.flies) return ch === '#' || x <= 0 || y <= 0 || x >= M.W - 1 || y >= M.H - 1 || !!critterAt(x, y) || (P && P.x === x && P.y === y);
    if (SOLID[ch]) return true;
    if (critterAt(x, y)) return true;
    if (who !== P && P && P.x === x && P.y === y) return true;
    return false;
  }

  function bakeGround(){
    var gc = doc.createElement('canvas'); gc.width = M.W * T; gc.height = M.H * T;
    var g = gc.getContext('2d'), grass = img('grass.png'), den = img('den.png'), water = img('water.png');
    function tile(im, x, y, fallback){
      var sx = (x * 40) % 88, sy = (y * 40) % 88;
      if (im.complete && im.naturalWidth) g.drawImage(im, sx, sy, 40, 40, x * T, y * T, T, T);
      else { g.fillStyle = fallback; g.fillRect(x * T, y * T, T, T); }
    }
    for (var y = 0; y < M.H; y++) for (var x = 0; x < M.W; x++) {
      var ch = at(x, y);
      if (M.def.indoor) {
        if (ch === '#') { g.fillStyle = '#1a1410'; g.fillRect(x * T, y * T, T, T); g.fillStyle = '#2c2219'; g.fillRect(x * T + 2, y * T + 2, T - 4, T - 10); }
        else tile(den, x, y, '#7a5a3a');
        continue;
      }
      if (ch === '~') tile(water, x, y, '#1e4a8c');
      else if (ch === 'd' || ch === 'E' || ch === '#') tile(den, x, y, '#7a5a3a');
      else tile(grass, x, y, '#3d6b2a');
      if (ch === '#') { g.fillStyle = 'rgba(20,14,10,.75)'; g.fillRect(x * T, y * T, T, T); }
      if (ch === 'E') { g.fillStyle = '#0d0a08'; g.beginPath(); g.ellipse(x * T + T / 2, y * T + T * .7, T * .42, T * .5, 0, Math.PI, 0); g.fill(); }
      if (ch === ',') { g.fillStyle = 'rgba(255,214,230,.85)'; for (var k = 0; k < 4; k++) g.fillRect(x * T + 6 + (k * 9) % 28, y * T + 8 + (k * 13) % 24, 3, 3); }
    }
    g.strokeStyle = 'rgba(210,235,255,.35)'; g.lineWidth = 2;
    for (y = 0; y < M.H; y++) for (x = 0; x < M.W; x++) if (at(x, y) === '~') {
      [[-1,0,0,0,0,1],[1,0,1,0,1,1],[0,-1,0,0,1,0],[0,1,0,1,1,1]].forEach(function(e){
        if (at(x + e[0], y + e[1]) !== '~') { g.beginPath(); g.moveTo((x + e[2]) * T, (y + e[3]) * T); g.lineTo((x + e[4]) * T, (y + e[5]) * T); g.stroke(); }
      });
    }
    M.ground = gc;
  }

  // the 1936 astronaut and the rocket, drawn as pixel art in code (no art exists yet)
  var SPR = {};
  function pixelSprite(rows, pal, scale){
    var c = doc.createElement('canvas'); c.width = rows[0].length * scale; c.height = rows.length * scale;
    var g = c.getContext('2d');
    rows.forEach(function(r, y){ for (var x = 0; x < r.length; x++) { var p = pal[r[x]]; if (p) { g.fillStyle = p; g.fillRect(x*scale, y*scale, scale, scale); } } });
    return c;
  }
  function buildSprites(){
    if (SPR.front) return;
    var pal = { o:'#3a2a18', c:'#c8843c', C:'#e9a95a', g:'#9fd2e6', G:'#d8f1fa', s:'#8d8a74', S:'#b3b096', d:'#5d5b4b', b:'#2b2a22', t:'#b08d57', w:'#efe6d0' };
    SPR.front = pixelSprite([
      '....oooooo....','...occCCcco...','..occgGGgcco..','..ocgGGGGgco..','..ocgggggGco..','..occgggggco..','...occcccco...',
      '....odSSdo....','..osSSwwSSso..','.osSSSwwSSSso.','.osdSSSSSSdso.','.ott.SSSS.tto.','.oS.sSSSSs.So.','...sSSddSSs...','...sSS..SSs...','...sSs..sSs...','...bbb..bbb...','..bbbb..bbbb..'
    ], pal, 3);
    SPR.back = pixelSprite([
      '....oooooo....','...occCCcco...','..occcCCccco..','..occcccccco..','..occcccccco..','..occcccccco..','...occcccco...',
      '....odttdo....','..osttttttso..','.osSttttttSso.','.osdttttttdso.','.oS.SSSSSS.So.','.oS.sSSSSs.So.','...sSSddSSs...','...sSS..SSs...','...sSs..sSs...','...bbb..bbb...','..bbbb..bbbb..'
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

  function surface(mapId){
    buildSprites();
    M = parseMap(mapId); bakeGround();
    S.stage = 'surface'; S.map = mapId; save();
    var start = S.pos && S.pos.map === mapId ? S.pos : (M.ship ? { x:M.ship.x, y:M.ship.y + 1, dir:'down' } : { x:1, y:1, dir:'down' });
    P = { x:start.x, y:start.y, fx:start.x, fy:start.y, dir:start.dir || 'down', t:0, moving:false, stalk:false, anim:0 };
    critters = M.spawns.map(function(sp){
      var id = { O:'otterlin', V:'verdanix', W:'aetherwing', C:'volcanut' }[sp.c];
      return { id:id, x:sp.x, y:sp.y, fx:sp.x, fy:sp.y, fromX:sp.x, fromY:sp.y, t:1, home:{ x:sp.x, y:sp.y }, dir:'down', cool:Math.random() * 2,
               swims:id === 'otterlin', flies:id === 'aetherwing', state:'idle', anim:0 };
    });
    fogArr = new Uint8Array(M.W * M.H);
    var saved = S.fog[mapId]; if (saved && saved.length === fogArr.length) for (var i = 0; i < fogArr.length; i++) fogArr[i] = saved.charCodeAt(i) === 49 ? 1 : 0;
    dialogOpen = false; encounterOpen = false; path = []; held = null; dlg = null;
    screen('x-surface',
      '<div class="x-hud riv"><div class="x-zone"><b class="x-zn"></b><span class="x-zw"></span></div>' +
        '<div class="x-gauges">' + gauge('SUIT','suit') + gauge('AIR','air') + '</div>' +
        '<div class="x-counts"><span title="Exposures left"><i>FILM</i><b class="x-film"></b></span></div>' +
        '<button class="x-menu" aria-label="Field journal">☰</button></div>' +
      '<div class="x-pad" aria-label="Direction pad"><button data-d="up" aria-label="Up">▲</button><button data-d="left" aria-label="Left">◀</button><button data-d="right" aria-label="Right">▶</button><button data-d="down" aria-label="Down">▼</button></div>' +
      '<div class="x-ab"><button class="x-b" aria-label="B: back, or stalk">B<small>STALK</small></button><button class="x-a" aria-label="A: examine">A<small>EXAMINE</small></button></div>' +
      '<div class="x-dialog" hidden><p class="x-dtext"></p><div class="x-dchoices"></div><span class="x-dmore">▼</span></div>');
    bindSurfaceUI();
    startWorld('surface');
    hudRefresh();
    revealFog();
    if (!S.flags.tutorialPad) { S.flags.tutorialPad = 1; save(); say(['Use the arrows to walk, or tap the ground to walk there.', 'A examines whatever you face: plants, stones, people, creatures. B toggles STALK, a slow and quiet walk.']); }
  }
  function gauge(label, id){
    return '<div class="x-g" data-g="' + id + '"><svg viewBox="0 0 60 40" aria-hidden="true"><path d="M6 36 A24 24 0 0 1 54 36" class="x-arc"/><path d="M6 36 A24 24 0 0 1 14 18" class="x-arc red"/>' +
      '<line x1="30" y1="36" x2="30" y2="15" class="x-needle"/><circle cx="30" cy="36" r="3"/></svg><span>' + label + '</span></div>';
  }
  function hudRefresh(){
    var zn = $('.x-zn'); if (!zn || !M) return;
    zn.textContent = M.def.location ? term(M.def.location) : term(M.def.district);
    $('.x-zw').textContent = (M.def.location ? term(M.def.district) + ' · ' : '') + term('zyraxis');
    [['suit', S.suit], ['air', S.air]].forEach(function(g){
      var n = $('[data-g="' + g[0] + '"] .x-needle'); if (n) n.style.transform = 'rotate(' + (-80 + clamp(g[1], 0, 100) / 100 * 160) + 'deg)';
      var box = $('[data-g="' + g[0] + '"]'); if (box) box.classList.toggle('low', g[1] < 25);
    });
    $('.x-film').textContent = pad2(S.film);
    var b = $('.x-b small'); if (b) b.textContent = P.stalk ? 'WALK' : 'STALK';
    var bb = $('.x-b'); if (bb) bb.classList.toggle('on', P.stalk);
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
    $('.x-menu').addEventListener('click', fieldMenu);
    $('.x-dialog').addEventListener('click', function(e){ if (!e.target.closest('[data-c]')) btnA(); });
  }
  var keys = {}, KEYDIR = { arrowup:'up', w:'up', arrowdown:'down', s:'down', arrowleft:'left', a:'left', arrowright:'right', d:'right' };
  addEventListener('keydown', function(e){
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (mode !== 'surface' || encounterOpen || doc.querySelector('.x-modal')) return;
    var k = e.key.toLowerCase(), d = KEYDIR[k];
    if (d) { e.preventDefault(); keys[d] = true; held = d; path = []; return; }
    if (k === 'z' || k === 'enter' || k === ' ') { e.preventDefault(); btnA(); }
    if (k === 'x' || k === 'escape' || k === 'backspace') { e.preventDefault(); btnB(); }
    if (k === 'j' || k === 'm') fieldMenu();
  });
  addEventListener('keyup', function(e){
    var d = KEYDIR[e.key.toLowerCase()];
    if (d) { keys[d] = false; if (held === d) held = ['up','down','left','right'].filter(function(x){ return keys[x]; })[0] || null; }
  });
  // tap the ground: walk there; tap a thing: walk next to it, face it, examine it
  var tapStart = null;
  cv.addEventListener('pointerdown', function(e){
    if (mode === 'space') { tapStart = { x:e.clientX, y:e.clientY, ax:aim.x, ay:aim.y }; try { cv.setPointerCapture(e.pointerId); } catch(err){} return; }
    if (mode !== 'surface' || dialogOpen || encounterOpen) return;
    tapStart = { x:e.clientX, y:e.clientY };
  });
  cv.addEventListener('pointermove', function(e){
    if (mode === 'space' && tapStart) {
      aim.x = clamp(tapStart.ax - (e.clientX - tapStart.x), -520, 520); aim.y = clamp(tapStart.ay - (e.clientY - tapStart.y), -360, 360);
    }
  });
  cv.addEventListener('pointerup', function(e){
    if (mode !== 'surface' || !tapStart || dialogOpen || encounterOpen) { tapStart = null; return; }
    if (Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y) > 20) { tapStart = null; return; }
    tapStart = null;
    var t = screenToTile(e.clientX, e.clientY);
    walkTo(t.x, t.y);
  });

  function zoom(){ return clamp(Math.min(innerWidth, innerHeight * 1.1) / (T * 9), .8, 1.8) * DPR; }
  function screenToTile(sx, sy){
    var z = zoom();
    return { x:Math.floor(P.fx + .5 + (sx * DPR - cv.width / 2) / (T * z)), y:Math.floor(P.fy + .5 + (sy * DPR - cv.height / 2) / (T * z)) };
  }
  function walkTo(tx, ty){
    if (tx === P.x && ty === P.y) return;
    var target = { x:tx, y:ty }, interact = blocked(tx, ty, P) || !!critterAt(tx, ty);
    var W = M.W, prev = new Int32Array(W * M.H).fill(-1), q = [P.y * W + P.x], seen = new Uint8Array(W * M.H); seen[q[0]] = 1;
    var goal = -1, startI = q[0];
    if (interact && Math.abs(P.x - tx) + Math.abs(P.y - ty) === 1) goal = startI;
    while (goal < 0 && q.length) {
      var c = q.shift(), cx = c % W, cy = (c / W) | 0;
      if (interact ? (Math.abs(cx - tx) + Math.abs(cy - ty) === 1) : (cx === tx && cy === ty)) { goal = c; break; }
      [[0,-1],[0,1],[-1,0],[1,0]].forEach(function(d){
        var nx = cx + d[0], ny = cy + d[1], ni = ny * W + nx;
        if (nx < 0 || ny < 0 || nx >= W || ny >= M.H || seen[ni] || blocked(nx, ny, P)) return;
        seen[ni] = 1; prev[ni] = c; q.push(ni);
      });
    }
    if (goal < 0) { sfx.bump(); return; }
    var steps = [];
    for (var n = goal; n !== startI; n = prev[n]) steps.unshift({ x:n % W, y:(n / W) | 0 });
    path = steps;
    if (interact) path.push({ face:target });
  }

  function facing(){ var d = DIRS[P.dir]; return { x:P.x + d[0], y:P.y + d[1] }; }

  var saveTimer = 0, airTimer = 0;
  function updateSurface(dt, now){
    if (!P) return;
    if (P.moving) {
      P.t += dt / (P.stalk ? .3 : .17);
      P.anim += dt * (P.stalk ? 5 : 9);
      if (P.t >= 1) { P.moving = false; P.fx = P.x; P.fy = P.y; arrived(); if (mode !== 'surface') return; }
      else { P.fx = P.px0 + (P.x - P.px0) * P.t; P.fy = P.py0 + (P.y - P.py0) * P.t; }
    }
    if (!P.moving && !dialogOpen && !encounterOpen) {
      var want = null;
      if (held) want = held;
      else if (path.length) {
        var nx = path[0];
        if (nx.face) { path = []; P.dir = dirTo(nx.face.x, nx.face.y); setTimeout(btnA, 60); }
        else { want = dirTo(nx.x, nx.y); path.shift(); if (blocked(nx.x, nx.y, P)) { path = []; want = null; } }
      }
      if (want) step(want);
    }
    critters.forEach(function(c){ if (mode === 'surface') updateCritter(c, dt, now); });
    if (mode !== 'surface') return;
    airTimer += dt;
    if (airTimer > 1) {
      airTimer = 0;
      if (!M.def.indoor && !dialogOpen && !encounterOpen) S.air = Math.max(0, S.air - .28);
      hudRefresh();
      if (S.air <= 0) return recall('AIR');
      if (Math.abs(S.air - 25) < .2) { toast('AIR LOW · return to the ship', 'red'); sfx.warn(); }
    }
    saveTimer -= dt;
    if (saveTimer <= 0) { saveTimer = 3; S.pos = { map:M.id, x:P.x, y:P.y, dir:P.dir }; save(); }
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
    revealFog();
    var ch = at(P.x, P.y), warp = M.def.warps && M.def.warps[ch];
    if (warp) { held = null; path = []; S.pos = { map:warp.to, x:warp.x, y:warp.y, dir:warp.dir }; save(); var to = warp.to; stopWorld(); fade(function(){ surface(to); }); return; }
    if (M.def.location && mark(M.def.location, 'reached')) { S.notes[M.def.location] = 1; toast('NEW FIELD RECORD · ' + term(subj(M.def.location).term)); }
  }
  function revealFog(){
    var R = 4, changed = false;
    for (var y = P.y - R; y <= P.y + R; y++) for (var x = P.x - R; x <= P.x + R; x++) {
      if (x < 0 || y < 0 || x >= M.W || y >= M.H) continue;
      if (Math.hypot(x - P.x, y - P.y) <= R + .3 && !fogArr[y * M.W + x]) { fogArr[y * M.W + x] = 1; changed = true; }
    }
    if (changed) S.fog[M.id] = Array.prototype.map.call(fogArr, function(v){ return v ? '1' : '0'; }).join('');
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
    if (dialogOpen || encounterOpen) return;
    var s = subj(c.id), dist = Math.abs(c.x - P.x) + Math.abs(c.y - P.y);
    c.cool -= dt;
    if (s.temperament === 'skittish' && dist <= 2 && !P.stalk) {
      if (c.state !== 'flee') { c.state = 'flee'; c.cool = 0; }
    } else if (c.state === 'flee' && dist > 4) c.state = 'idle';
    if (s.temperament === 'territorial') {
      if (dist <= 2 && c.state !== 'warn' && c.cool <= 0) { c.state = 'warn'; c.warnT = 1.3; sfx.warn(); toast('The creature bristles and glows. It will charge.', 'red'); }
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
      if (Math.abs(nx - c.home.x) + Math.abs(ny - c.home.y) <= (c.flies ? 5 : 3) && !blocked(nx, ny, c)) choice = o;
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
    var f = facing(), ch = at(f.x, f.y), c = critterAt(f.x, f.y);
    if (c) { encounter(c, false); return; }
    if (M.npc && f.x === M.npc.x && f.y === M.npc.y) { talkHaemen(); return; }
    if (ch === 'b') return examinePlant('shrub');
    if (ch === 'T') return examinePlant('fruittree');
    if (ch === 'A') return examineAstralite();
    if (ch === 'M') return examineMarkings();
    if (ch === 'S') return boardShip();
    if (ch === 'X') return say([M.def.sign]);
    if (ch === 'B') return say(['A heavy boulder, streaked with something that glints.']);
    if (ch === '#') return say([M.def.indoor ? 'Fitted stone. The joints are too fine for hand tools.' : 'Rock, too steep to climb without gear.']);
    if (ch === '~') return say(['Clear, cold water. Something sleek moves under the surface.']);
    var hid = M.id + ':' + f.x + ',' + f.y;
    if (ch === '*' && !S.found[hid]) {
      S.found[hid] = 1; S.film += 6; save(); hudRefresh(); sfx.reveal();
      return say(['Half-buried in the ' + (M.def.indoor ? 'dust' : 'grass') + ': your own spare film canister, lost on landing. Dented, but sealed.', 'FILM +6']);
    }
  }
  function btnB(){
    if (dialogOpen) { advanceDialog(true); return; }
    if (encounterOpen || doc.querySelector('.x-modal')) return;
    P.stalk = !P.stalk; hudRefresh(); sfx.click();
    toast(P.stalk ? 'STALKING · slow and quiet' : 'WALKING');
  }

  // ── dialog box ──
  var dlg = null;
  function say(lines, choices){
    return new Promise(function(res){
      dlg = { lines:lines.slice(), choices:choices, res:res, typing:null };
      dialogOpen = true; held = null; path = [];
      var box = $('.x-dialog'); if (!box) { dialogOpen = false; res(-1); return; }
      box.hidden = false;
      nextLine();
    });
  }
  function nextLine(){
    var box = $('.x-dialog'), t = $('.x-dtext', box), ch = $('.x-dchoices', box), d = dlg;
    var line = d.lines.shift();
    ch.innerHTML = ''; box.classList.remove('ask');
    d.typing = typeInto(t, line, 16).then(function(){
      d.typing = null;
      if (!d.lines.length && d.choices && dlg === d) {
        box.classList.add('ask');
        ch.innerHTML = d.choices.map(function(c, i){ return '<button data-c="' + i + '">' + esc(c) + '</button>'; }).join('');
        $$('[data-c]', ch).forEach(function(b){ b.addEventListener('click', function(e){ e.stopPropagation(); closeDialog(+b.dataset.c); }); });
        $('[data-c]', ch).focus();
      }
    });
  }
  function advanceDialog(isB){
    if (!dlg) return;
    var t = $('.x-dtext');
    if (dlg.typing) { if (t && t._finish) t._finish(); return; }
    if (dlg.lines.length) { nextLine(); return; }
    if (dlg.choices) { closeDialog(isB ? dlg.choices.length - 1 : 0); return; }
    closeDialog(-1);
  }
  function closeDialog(answer){
    var d = dlg; dlg = null; dialogOpen = false;
    var box = $('.x-dialog'); if (box) box.hidden = true;
    if (d) d.res(answer);
  }

  // ── examining things ──
  async function examinePlant(id){
    var s = subj(id), had = !!S.cards[id];
    await say([s.journal]);
    if (had) { await say(['Already documented. ' + title1936(subjName(id)) + ' is in your Card Locker.']); return; }
    await say(['SPECIMEN DOCUMENTED.']);
    var first = manifest(id, null, false);
    await cardReveal(id, first);
  }
  async function examineAstralite(){
    var had = !!S.cards.astralite;
    await say([subj('astralite').journal, 'You chip a sample into a sealed jar.']);
    var first = manifest('astralite', null, false);
    if (had) { toast('ANOTHER SAMPLE · QUANTITY +1'); return; }
    await cardReveal('astralite', first, 'SPECIMEN DOCUMENTED · CARD ACQUIRED');
  }
  async function examineMarkings(){
    if (S.flags.copied) { await say(['The carved figures and their words are already in your journal.', S.flags.decoded ? 'You can read them now.' : 'Decode them in the LABORATORY aboard ship.']); return; }
    await say(['Carved into the stone: figures, each beside a mark like a word. Some figures look like the animals outside. One is a star. One is a small pale circle.', 'You copy every mark into the field journal.']);
    S.flags.copied = true; save(); toast('MARKINGS COPIED · decode them aboard ship');
    if (!S.cards.firstden) {
      var ok = await say(['Photograph the cave for the record? (uses 1 exposure)'], ['YES', 'NO']);
      if (ok === 0) shootStatic('firstden');
    }
  }
  function shootStatic(id){
    if (S.film <= 0) { toast('ROLL FINISHED · develop it aboard ship', 'red'); return; }
    var out = doc.createElement('canvas'); out.width = 240; out.height = 180;
    var o = out.getContext('2d'), im = img('den.png');
    if (im.complete) o.drawImage(im, 0, 0, 128, 96, 0, 0, 240, 180);
    o.fillStyle = 'rgba(0,0,0,.35)'; o.fillRect(0, 0, 240, 180);
    var data = ''; try { data = out.toDataURL('image/jpeg', .75); } catch(e){}
    S.film--; S.frames.push({ subj:id, grade:'good', img:data, t:Date.now() }); save(); hudRefresh(); sfx.shutter();
    toast('EXPOSED · ' + subjName(id) + ' · develop aboard ship');
  }
  async function boardShip(){
    var a = await say(['Your ship. Board, and return to orbit?'], ['BOARD', 'STAY']);
    if (a !== 0) return;
    S.pos = { map:M.id, x:P.x, y:P.y, dir:P.dir }; save(); sfx.click();
    ship();
  }
  function fieldMenu(){
    if (dialogOpen || encounterOpen || doc.querySelector('.x-modal')) return;
    held = null;
    var m = el('div', 'x-modal', '<div class="x-modal-in x-paper journal"><p class="x-stamp">FIELD JOURNAL</p>' +
      '<canvas class="x-sketch" width="460" height="340" aria-label="Field sketch map"></canvas>' + objList() +
      '<div class="x-notes">' + Object.keys(S.notes).filter(function(id){ return subj(id); }).map(function(id){ return '<p><b>' + esc(subjName(id)) + '.</b> ' + esc(subj(id).journal) + '</p>'; }).join('') + '</div>' +
      '<div class="x-sh-btns"><button class="x-btn" data-a="flare">FIRE RECALL FLARE (' + S.flares + ')</button><button class="x-btn ghost" data-a="close">CLOSE JOURNAL</button></div></div>');
    ui.appendChild(m);
    drawSketch(m.querySelector('.x-sketch'));
    m.addEventListener('click', function(e){
      var a = e.target.closest('[data-a]');
      if (e.target === m || (a && a.dataset.a === 'close')) m.remove();
      if (a && a.dataset.a === 'flare') {
        if (!S.flares) { toast('NO FLARES LEFT · walk back to the ship', 'red'); return; }
        S.flares--; m.remove(); S.pos = null; save(); ship(); toast('RECALL FLARE · the ship homed in on you');
      }
    });
  }
  function drawSketch(c){
    var g = c.getContext('2d'), sx = c.width / M.W, sy = c.height / M.H;
    g.fillStyle = '#efe6d0'; g.fillRect(0, 0, c.width, c.height);
    for (var y = 0; y < M.H; y++) for (var x = 0; x < M.W; x++) {
      if (!fogArr[y * M.W + x]) continue;
      var ch = at(x, y);
      g.fillStyle = ch === '~' ? 'rgba(40,70,120,.4)' : ch === 'd' ? 'rgba(120,80,40,.3)' : ch === 'T' ? 'rgba(40,80,40,.45)' : ch === '#' ? 'rgba(40,30,20,.55)' : 'rgba(60,50,30,.07)';
      g.fillRect(x * sx, y * sy, sx + .5, sy + .5);
      if (ch === 'A') { g.fillStyle = '#3b5bd6'; g.fillRect(x * sx + 2, y * sy + 2, sx - 4, sy - 4); }
      if (ch === 'E' || ch === 'x') { g.fillStyle = '#2a2118'; g.fillRect(x * sx + 1, y * sy + 1, sx - 2, sy - 2); }
    }
    if (M.ship) { g.fillStyle = '#222'; g.font = 'bold 12px Courier Prime, monospace'; g.fillText('▲ SHIP', (M.ship.x - 1) * sx, (M.ship.y + 1.6) * sy); }
    g.fillStyle = '#9b2a1f'; g.beginPath(); g.arc((P.x + .5) * sx, (P.y + .5) * sy, 4, 0, 7); g.fill();
    g.fillStyle = '#3a2a18'; g.font = '13px Special Elite, monospace';
    g.fillText('FIELD SKETCH · ' + (M.def.location ? term(M.def.location) : term(M.def.district)), 8, 16);
  }
  function recall(why){
    if (mode !== 'surface') return;
    S.pos = null; save(); stopWorld();
    var s = screen('x-recall', '<div class="x-paper"><p class="x-stamp red">EMERGENCY RECALL</p><p class="x-mono">' + why + ' gauge at zero. The suit\'s recall beacon fired, and the ship\'s winch hauled you back aboard.</p>' +
      '<p class="x-mono">Your film, cards and records are safe.</p><button class="x-btn">ABOARD SHIP</button></div>');
    $('.x-btn', s).addEventListener('click', function(){ ship(); });
  }

  // ── the Haemen: a relationship, not a pickup ──
  async function talkHaemen(){
    var id = M.def.haemen, a = arc(id), aethrenCards = Object.keys(S.cards).filter(function(k){ return subj(k) && subj(k).kind === 'aethren'; });
    sfx.meet();
    if (!a.talk) {
      mark(id, 'talk'); S.notes[id] = 1; save();
      await say(['A man in heavy furs. He looks at your helmet for a long moment, then speaks.', '“◆▲◇ ▲◆ ◇◇▲?”', 'The words mean nothing to you. He points at your camera, then out at the meadow, then at your camera again.']);
      toast('CONTACT · ' + subjName(id));
      return;
    }
    if (S.flags.taught) {
      await say(['“' + title1936(term('malezor')) + '.” He taps the ground and nods, as if checking you remember.', S.flags.decoded ? 'You have learned a great deal. He seems to approve.' : 'He points north-east, toward the stone cave.']);
      return;
    }
    if (aethrenCards.length < 2) {
      await say(['He points at your camera again, then at the animals by the water.', '(He seems to want to see photographs. Develop at least 2 photographs of the local animals aboard ship, then come back.)']);
      return;
    }
    await say(['You hold up your developed prints. He laughs out loud, takes them one by one, and names each animal, slowly, so you can follow.', 'He taps the ground: a word. He points up at the sky: another. He taps his own chest, then yours.']);
    var mapId = M.id;
    reclassify(D.teaches.haemen.concat(aethrenCards.map(function(k){ return subj(k).term; })),
      'First contact. The inhabitant names his land, his world, his people, and the animals in your photographs.',
      async function(){
        S.flags.taught = true;
        var first = manifest(id, null, false); save();
        surface(mapId);
        await cardReveal(id, first, 'RELATIONSHIP · CARD ACQUIRED');
      });
  }

  // ── encounters: observe, interact, photograph, or (later) battle ──
  function encounter(c, charged){
    var s = subj(c.id);
    if (s.temperament === 'skittish' && !P.stalk && !charged) {
      c.state = 'flee';
      toast('It bolted before you got close. Try STALKING (B).', 'red'); return;
    }
    encounterOpen = true; held = null; path = [];
    var dist = 2 + Math.round(Math.random() * 3), acted = 0, gone = false, focusE = .5, t0 = performance.now();
    var o = el('div', 'x-encounter', '<div class="x-enc-in riv">' +
      '<p class="x-enc-k">' + (charged ? 'IT CHARGES!' : 'ENCOUNTER') + '</p>' +
      '<div class="x-enc-stage"><div class="x-enc-spr" style="background-image:url(' + A + s.sprite + ')"></div><div class="x-enc-vf" hidden><i></i></div></div>' +
      '<p class="x-enc-nm">' + esc(subjName(c.id)) + '</p>' +
      '<p class="x-enc-sub">CLASS: ' + esc(term('aethren')) + ' · RARITY: ' + (S.cards[c.id] ? rarity(s) : 'UNKNOWN') + ' · ' + (S.cards[c.id] ? 'CLASSIFIED' : 'UNCLASSIFIED') + '</p>' +
      '<p class="x-enc-msg" aria-live="polite"></p>' +
      '<div class="x-enc-acts">' +
        '<button data-e="observe">OBSERVE</button><button data-e="photo">PHOTOGRAPH</button>' +
        (s.temperament === 'curious' ? '<button data-e="offer">OFFER RATION</button>' : '') +
        (s.temperament === 'territorial' ? '<button data-e="battle" disabled title="Card battles arrive in a future build">CARD BATTLE · SOON</button>' : '') +
        '<button data-e="leave" class="ghost">' + (charged ? 'RETREAT' : 'MOVE ON') + '</button></div>' +
      '<div class="x-enc-cam" hidden><div class="x-range"><span>RANGE</span><b>' + dist + ' YD</b></div>' +
        '<label class="x-ring"><span>FOCUS</span><input type="range" min="0" max="1000" value="500" aria-label="Focus ring"><span class="x-scale"><i>1</i><i>2</i><i>3</i><i>5</i><i>10</i><i>∞</i></span></label>' +
        '<div class="x-cambtns"><button class="x-shutter" aria-label="Release shutter"></button><button class="x-camx">LOWER</button></div><p class="x-camfilm">' + S.film + ' EXPOSURES LEFT</p></div>' +
      '</div>');
    ui.appendChild(o);
    var spr = $('.x-enc-spr', o), msg = $('.x-enc-msg', o), camBox = $('.x-enc-cam', o);
    if (s.temperament === 'flighty') spr.classList.add('flit');
    if (charged) o.classList.add('hit');
    sfx.meet();
    var intro = { curious:'It sniffs the air and edges closer.', skittish:'It has not noticed you. Stay low.', flighty:'It hovers, darts, hovers again.', territorial:'It stands its ground, glowing hotter.' }[s.temperament];
    typeInto(msg, charged ? 'It charges! You throw yourself aside. SUIT damaged. Photograph it, or retreat.' : intro, 14);
    if (charged) { S.suit = Math.max(0, S.suit - 22); save(); hudRefresh(); sfx.warn(); vibrate(150); }

    function blurOf(){ return Math.abs(focusE - needFor(dist)); }
    function wingOffset(){ var t = (performance.now() - t0) / 1000; return Math.sin(t * 2.6) * Math.sin(t * 1.3); }
    var focusRaf = 0;
    (function tick(){
      if (!o.isConnected) return;
      spr.style.filter = camBox.hidden ? '' : 'blur(' + clamp(blurOf() * 24, 0, 8).toFixed(1) + 'px)';
      if (s.temperament === 'flighty' && !gone) spr.style.transform = 'translateX(' + (wingOffset() * 34).toFixed(1) + '%)';
      focusRaf = requestAnimationFrame(tick);
    })();

    function react(){
      acted++;
      if (s.temperament === 'territorial' && acted >= 2 && !gone) {
        S.suit = Math.max(0, S.suit - 22); save(); hudRefresh(); sfx.warn(); vibrate(150);
        o.classList.remove('hit'); void o.offsetWidth; o.classList.add('hit');
        typeInto(msg, 'It charges again! SUIT damaged. Time to go.', 14);
        if (S.suit <= 0) { end(); recall('SUIT'); return true; }
      }
      if (s.temperament === 'flighty' && acted >= 3 && Math.random() < .5) { leaveScene('It zips away over the grass.'); return true; }
      if (s.temperament === 'skittish' && acted >= 3 && Math.random() < .35) { leaveScene('A twig snaps. It is gone.'); return true; }
      return false;
    }
    function leaveScene(text){
      gone = true; spr.classList.add('gone');
      typeInto(msg, text, 14);
      $$('.x-enc-acts button', o).forEach(function(b){ if (b.dataset.e !== 'leave') b.disabled = true; });
      camBox.hidden = true; $('.x-enc-acts', o).hidden = false; $('.x-enc-vf', o).hidden = true;
      if (s.temperament !== 'territorial') c.state = 'flee';
    }
    function end(){
      cancelAnimationFrame(focusRaf);
      o.remove(); encounterOpen = false;
      if (s.temperament === 'territorial') { c.cool = 6; c.state = 'idle'; }
    }
    o.addEventListener('click', async function(e){
      var b = e.target.closest('[data-e]'); if (!b || b.disabled) return;
      var act = b.dataset.e;
      if (act === 'leave') { end(); return; }
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
        typeInto(msg, 'It takes the ration from your glove and nuzzles your knee. INTERACTION RECORDED. It holds still now: a fine moment for a photograph.', 10);
        spr.classList.add('calm');
        react();
      }
      if (act === 'photo') {
        if (S.film <= 0) { typeInto(msg, 'The roll is finished. Develop it aboard ship.', 14); return; }
        $('.x-enc-acts', o).hidden = true; camBox.hidden = false; $('.x-enc-vf', o).hidden = false;
        var ring = $('.x-ring input', o); ring.value = Math.round(focusE * 1000);
        ring.oninput = function(){ focusE = ring.value / 1000; };
        typeInto(msg, 'RANGE ' + dist + ' YD. Turn the focus ring until it is sharp.' + (s.temperament === 'flighty' ? ' Shoot when it hovers in the centre.' : ''), 10);
      }
    });
    $('.x-camx', o).addEventListener('click', function(){
      camBox.hidden = true; $('.x-enc-acts', o).hidden = false; $('.x-enc-vf', o).hidden = true;
    });
    $('.x-shutter', o).addEventListener('click', function(){
      if (gone) return;
      if (S.film <= 0) { typeInto(msg, 'The roll is finished.', 14); return; }
      var off = s.temperament === 'flighty' ? wingOffset() : 0;
      var err = blurOf() + Math.abs(off) * .12 + (spr.classList.contains('calm') ? -.01 : 0);
      var g = err < .035 ? 'excellent' : err < .085 ? 'good' : err < .17 ? 'fair' : 'poor';
      S.film--; S.frames.push({ subj:c.id, grade:g, img:encounterPhoto(s, blurOf(), off), t:Date.now() });
      save(); hudRefresh(); sfx.shutter(); vibrate(25);
      o.classList.remove('flash'); void o.offsetWidth; o.classList.add('flash');
      $('.x-camfilm', o).textContent = S.film + ' EXPOSURES LEFT';
      typeInto(msg, 'EXPOSED. Develop it in the Darkroom to see what you caught.', 10);
      react();
    });
  }
  // the print: what the camera saw, as sharp or soft as it was
  function encounterPhoto(s, blur, offset){
    var out = doc.createElement('canvas'); out.width = 240; out.height = 180;
    var o = out.getContext('2d'), grass = img('grass.png'), sp = img(s.sprite);
    if (grass.complete) o.drawImage(grass, 0, 0, 128, 96, 0, 0, 240, 180);
    o.filter = 'blur(' + clamp(blur * 10, 0, 4).toFixed(1) + 'px)';
    if (sp.complete) o.drawImage(sp, 0, 0, 72, 72, 50 + offset * 40, 14, 140, 140);
    var data = ''; try { data = out.toDataURL('image/jpeg', .74); } catch(e){}
    return data;
  }
  function needFor(dist){ var yd = Math.max(1, dist); return clamp(Math.log(yd) / Math.log(10) * .84, 0, .84); }
  function vibrate(ms){ try { if (navigator.vibrate) navigator.vibrate(ms); } catch(e){} }

  // ── drawing the surface ──
  var ROW = { down:0, left:1, right:2, up:3 };
  function drawSurface(now){
    var w = cv.width, h = cv.height, z = zoom();
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = M.def.indoor ? '#0d0a08' : '#0b0912'; ctx.fillRect(0, 0, w, h);
    var ox = Math.round(w / 2 - (P.fx + .5) * T * z), oy = Math.round(h / 2 - (P.fy + .5) * T * z);
    ctx.drawImage(M.ground, ox, oy, M.W * T * z, M.H * T * z);
    var cr = img('crater.png');
    if (M.ship && cr.complete) ctx.drawImage(cr, ox + (M.ship.x - 1.4) * T * z, oy + (M.ship.y - 1) * T * z, 3.8 * T * z, 2.8 * T * z);
    var list = [], x0 = Math.max(0, Math.floor(P.fx - w / (2 * T * z)) - 2), x1 = Math.min(M.W - 1, Math.ceil(P.fx + w / (2 * T * z)) + 2),
        y0 = Math.max(0, Math.floor(P.fy - h / (2 * T * z)) - 2), y1 = Math.min(M.H - 1, Math.ceil(P.fy + h / (2 * T * z)) + 3);
    for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) {
      var ch = at(x, y);
      if ('TbBAMX'.indexOf(ch) >= 0) list.push({ k:ch, x:x, y:y, s:y });
    }
    if (M.ship) list.push({ k:'ship', x:M.ship.x, y:M.ship.y, s:M.ship.y + .1 });
    if (M.npc) list.push({ k:'npc', x:M.npc.x, y:M.npc.y, s:M.npc.y });
    critters.forEach(function(c){ list.push({ k:'critter', c:c, s:c.fy + (c.flies ? .5 : 0) }); });
    list.push({ k:'player', s:P.fy + .01 });
    list.sort(function(a, b){ return a.s - b.s; });
    list.forEach(function(o){
      var X = ox + ((o.c ? o.c.fx : o.k === 'player' ? P.fx : o.x) + .5) * T * z, Y = oy + ((o.c ? o.c.fy : o.k === 'player' ? P.fy : o.y) + 1) * T * z;
      if (o.k === 'T') drawImg('tree.png', X, Y, 1.9, 1.9, z);
      else if (o.k === 'b') drawImg('bush.png', X, Y, 1.25, .85, z);
      else if (o.k === 'B') drawImg('boulder.png', X, Y, 1.05, 1.05, z);
      else if (o.k === 'A') drawSheet('astralite.png', 0, Math.floor(now / 220) % 4, X, Y, 1.15, z, 64);
      else if (o.k === 'M') { ctx.fillStyle = '#3a2d22'; ctx.fillRect(X - 16*z, Y - 34*z, 32*z, 32*z); ctx.fillStyle = 'rgba(255,214,120,' + (.5 + .25 * Math.sin(now / 400)) + ')'; ctx.fillRect(X - 10*z, Y - 28*z, 4*z, 10*z); ctx.fillRect(X - 3*z, Y - 30*z, 4*z, 14*z); ctx.fillRect(X + 4*z, Y - 26*z, 4*z, 8*z); ctx.fillRect(X - 8*z, Y - 14*z, 14*z, 3*z); }
      else if (o.k === 'X') { ctx.fillStyle = '#5a4128'; ctx.fillRect(X - 3*z, Y - 30*z, 6*z, 28*z); ctx.fillStyle = '#efe6d0'; ctx.fillRect(X - 14*z, Y - 34*z, 28*z, 14*z); ctx.fillStyle = '#9b2a1f'; ctx.fillRect(X - 10*z, Y - 29*z, 20*z, 3*z); }
      else if (o.k === 'ship') { var sp = SPR.ship; ctx.drawImage(sp, X - sp.width / 2 * z, Y - sp.height * z + 6 * z, sp.width * z, sp.height * z); }
      else if (o.k === 'npc') { var hm = img('haemen.png'); if (hm.complete) { ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(X, Y - 4*z, 12*z, 4*z, 0, 0, 7); ctx.fill(); ctx.imageSmoothingEnabled = true; ctx.drawImage(hm, X - 20*z, Y - 64*z, 40*z, 62*z); ctx.imageSmoothingEnabled = false; } }
      else if (o.k === 'critter') drawCritter(o.c, X, Y, z, now);
      else if (o.k === 'player') drawPlayer(X, Y, z);
    });
    for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) {
      if (fogArr[y * M.W + x]) continue;
      ctx.fillStyle = M.def.indoor ? 'rgba(6,4,3,.96)' : 'rgba(11,9,18,.9)';
      ctx.fillRect(Math.floor(ox + x * T * z), Math.floor(oy + y * T * z), Math.ceil(T * z) + 1, Math.ceil(T * z) + 1);
    }
    if (M.def.indoor) {
      var gr = ctx.createRadialGradient(w / 2, h / 2, T * z * 1.5, w / 2, h / 2, T * z * 5);
      gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.7)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
    }
    // facing marker: what A will examine
    if (!P.moving && !dialogOpen) {
      var f = facing(), fx = ox + f.x * T * z, fy = oy + f.y * T * z, fc = at(f.x, f.y);
      var interesting = 'TbAMSXB'.indexOf(fc) >= 0 || critterAt(f.x, f.y) || (M.npc && M.npc.x === f.x && M.npc.y === f.y);
      if (interesting) { ctx.strokeStyle = 'rgba(255,224,150,' + (.4 + .3 * Math.sin(now / 250)) + ')'; ctx.lineWidth = 2 * DPR; ctx.strokeRect(fx + 3*z, fy + 3*z, T*z - 6*z, T*z - 6*z); }
    }
  }
  function drawImg(name, X, Y, wT, hT, z){
    var im = img(name); if (!im.complete || !im.naturalWidth) return;
    var w = wT * T * z, h = hT * T * z;
    ctx.drawImage(im, X - w / 2, Y - h, w, h);
  }
  function drawSheet(name, row, col, X, Y, sizeT, z, fr){
    var im = img(name); if (!im.complete || !im.naturalWidth) return;
    var s = sizeT * T * z;
    ctx.drawImage(im, col * fr, row * fr, fr, fr, X - s / 2, Y - s + 2 * z, s, s);
  }
  function drawCritter(c, X, Y, z, now){
    if (!fogArr[c.y * M.W + c.x]) return;
    var s = subj(c.id), size = c.id === 'volcanut' ? 1.45 : c.id === 'aetherwing' ? 1.05 : 1.2;
    var lift = c.flies ? (12 + Math.sin(now / 160 + c.x) * 4) * z : 0, inWater = c.swims && at(c.x, c.y) === '~';
    if (inWater) { ctx.save(); ctx.beginPath(); ctx.rect(X - 40*z, Y - 80*z, 80*z, 70*z); ctx.clip(); }
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(X, Y - 4*z, 12*z, 4*z, 0, 0, 7); ctx.fill();
    var col = c.t < 1 || c.flies ? Math.floor(c.anim) % 4 : 0, sx = c.state === 'warn' ? Math.sin(now / 30) * 2 * z : 0;
    drawSheet(s.sprite, ROW[c.dir], col, X + sx, Y - lift, size, z, 72);
    if (inWater) ctx.restore();
    if (c.state === 'warn' || c.state === 'flee') {
      ctx.fillStyle = c.state === 'warn' ? '#ffde59' : '#ffffff'; ctx.font = 'bold ' + (18 * z) + 'px Courier Prime, monospace'; ctx.textAlign = 'center';
      ctx.fillText('!', X, Y - size * T * z - lift);
    }
  }
  function drawPlayer(X, Y, z){
    var sp = P.dir === 'up' ? SPR.back : P.dir === 'down' ? SPR.front : SPR.side;
    var bob = P.moving ? Math.abs(Math.sin(P.anim)) * 2 * z : 0, sc = z * (P.stalk ? .74 : .8);
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(X, Y - 4*z, 10 * z, 4 * z, 0, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(X, Y - 3*z - bob);
    if (P.dir === 'left') ctx.scale(-1, 1);
    ctx.drawImage(sp, -sp.width * sc / 2, -sp.height * sc, sp.width * sc, sp.height * sc);
    ctx.restore();
  }

  // ───────────────────────── boot ─────────────────────────
  // ?debug exposes internals for automated tests only.
  if (/[?&]debug\b/.test(location.search)) window.__x = { S:function(){ return S; }, P:function(){ return P; }, M:function(){ return M; }, critters:function(){ return critters; },
    tp:function(x, y, dir){ P.x = P.fx = x; P.y = P.fy = y; P.dir = dir || P.dir; P.moving = false; path = []; revealFog(); } };
  title();
})();
