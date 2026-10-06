/* AOV Saga — home-screen app.
 * Hash-routed single page: #/ · #/codex · #/codex/<key> · #/games · #/timeline · #/bonds
 * Codex data: /app/data/codex.json (built by tools/build_app_data.py).
 */
(function () {
  'use strict';

  var view = document.getElementById('view');
  var DATA_URL = '/app/data/codex.json';
  var ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  var PAGE = 60;

  var CATS = {
    zyrex: { label: 'Zyrex', plural: 'Zyrex', c: '47, 230, 168' },
    divine: { label: 'Divine', plural: 'Divine', c: '184, 124, 255' },
    aetheon: { label: 'Aetheon', plural: 'Aetheons', c: '111, 179, 255' },
    virtue: { label: 'Virtue', plural: 'Virtues', c: '232, 200, 120' },
    vice: { label: 'Vice', plural: 'Vices', c: '255, 128, 160' },
    gemlord: { label: 'Gemlord', plural: 'Gemlords', c: '255, 150, 110' },
    legend: { label: 'Legend', plural: 'Legends', c: '243, 236, 220' },
    creature: { label: 'Creature', plural: 'Creatures', c: '212, 150, 86' }
  };

  var GAMES = [
    { file: 'rp7b', no: 'RP7', name: 'The Rize of Power', kind: 'Adventure RPG · Zyraxis', blurb: 'The flagship saga game. Ten districts, 200+ bondable Zyrex and the fight for Lower Zyraxis.', badge: 'Beta V7.5.16', featured: true },
    { file: 'return', no: '01', name: 'The Long Return', kind: 'Arcade dodger · one hand', blurb: 'An Astralnaut, a ship and one hundred gems. Pilot home with a single fingertip.' },
    { file: 'training', no: '02', name: 'The Training Yard', kind: '1v1 TCG tutorial', blurb: 'Two cards meet in the cosmic arena. A first taste of Rizing Powers combat.' },
    { file: 'battlegrounds', no: '03', name: 'The Battlegrounds', kind: '3v3 TCG match', blurb: 'Three Rizers a side, gem economy, the gamble rule and revivals.' },
    { file: 'expedition', no: '04', name: 'The Expedition', kind: 'Exploration RPG · Viridia', blurb: 'Walk Viridia, meet the Rizers and chart the cosmos one footstep at a time.' },
    { file: 'cardmaster', no: '05', name: 'Cardmaster Showdown', kind: 'Rizing Powers TCG · 3v3', blurb: 'The full trading-card game: possession turns, gem gamble, backfire control.' },
    { file: 'realms', no: '06', name: 'The Eternal War', kind: 'Fighter · landscape only', blurb: 'Every fighter from every saga in one arena, best of three. Turn your phone sideways.' },
    { file: 'arborynth', no: 'RP8', name: 'The Tree of Power', kind: 'Action-adventure · Arborynth', blurb: 'Restore three severed Root-Hearts and awaken the path to the Great Root.' },
    { file: 'rp9', no: 'RP9', name: 'The Origins of Power', kind: '3D playtest · Origon', blurb: 'Walk the Gardenlands of Origon as Anciuxor or Elzoran.' }
  ];

  var TIMELINE = [
    { when: '~15 Billion Years Ago', title: 'The Aenor Eruption', body: 'The cosmic Big Bang. Aenor erupts and forges the substrate of the Aethryx Expanse, birthing 1,000+ original Dracolords — the first macro-lifeforms of the cosmos.' },
    { when: 'First Billion Years', title: 'The Great Dying', body: 'Nearly all the original Dracolords fall: some become suns, some pass beyond dimensions, some destroy one another. Of 1,000, only six survive — and they are one family.' },
    { when: '~14 Billion Years Ago', title: 'The Six Cosmic Guardians', body: 'Alphaea, Azyrath, Abyssion, Aetherion, Abominalys and Aethravax. All dragonkind in the Expanse descends from them.' },
    { when: '~13 Billion Years Ago', title: 'The Eternal Accord', body: 'The six survivors choose balance over domination and found dimensional stability and astralite equilibrium across the Expanse.' },
    { when: '333 CE', title: 'Audrelius Veridae X', body: 'The Royal Emperor founds the first global government of Viridia, wins the Blood War and summons the Royal Pegasus.' },
    { when: '2031', title: 'The Coming Equinox', body: 'Where the canonical spine currently ends. The full chronicle — seven eons, fifty-six eras — lives on the Timeline page.' }
  ];

  var ICON = {
    arrow: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true" style="fill:currentColor"><path d="M7 4l13 8-13 8z"/></svg>',
    back: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
    chev: '<svg class="icon chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    star: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/></svg>',
    search: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" style="width:18px;height:18px"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
    share: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3M8 7l4-4 4 4"/><path d="M5 11v9h14v-9"/></svg>',
    close: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" style="width:16px;height:16px"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  // ---------- storage (best effort; private mode can throw) ----------
  function load(key, fallback) {
    try { var v = localStorage.getItem('aov.' + key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem('aov.' + key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  var bonds = load('bonds', []);
  var codexState = { q: '', cat: 'all', tier: 0, shown: PAGE };
  var timelineOpen = 0;

  // ---------- data ----------
  var entries = null;
  var byKey = {};
  var dataPromise = fetch(DATA_URL)
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) {
      entries = d.entries;
      entries.forEach(function (e) {
        e.search = (e.n + ' ' + e.tag + ' ' + e.types + ' ' + (e.district || '')).toLowerCase();
        byKey[e.k] = e;
      });
    });

  // ---------- helpers ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function cat(e) { return CATS[e.c] || CATS.legend; }
  function initial(name) { return esc(name.replace(/^the\s+/i, '').charAt(0).toUpperCase()); }
  function tierLabel(t) { return 'Tier ' + (ROMAN[t] || t); }
  function sigil(e, cls) {
    return '<div class="sigil ' + (cls || '') + '" style="--c:' + cat(e).c + '" aria-hidden="true">' + initial(e.n) + '</div>';
  }
  function entryRow(e) {
    return '<a class="entry" href="#/codex/' + esc(e.k) + '">' + sigil(e) +
      '<div class="entry-main"><span class="entry-name">' + esc(e.n) + '</span>' +
      '<span class="entry-sub">' + esc(e.tag) + '</span></div>' +
      '<div class="entry-meta"><span class="tier">' + tierLabel(e.t) + '</span>' +
      '<span class="code">' + esc(e.id) + '</span></div></a>';
  }
  function isBonded(k) { return bonds.indexOf(k) !== -1; }
  function toggleBond(k) {
    bonds = isBonded(k) ? bonds.filter(function (b) { return b !== k; }) : bonds.concat(k);
    save('bonds', bonds);
  }
  function entryOfTheDay() {
    var pool = entries.filter(function (e) { return e.lore; });
    var d = new Date();
    var n = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate();
    return pool[(n * 7919) % pool.length];
  }
  function isStandalone() {
    return window.navigator.standalone === true ||
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  }
  function isIOSSafari() {
    var ua = navigator.userAgent;
    return /iP(hone|ad|od)/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  }
  function gameByFile(f) { return GAMES.filter(function (g) { return g.file === f; })[0]; }

  // ---------- screens ----------
  function homeView() {
    var last = gameByFile(load('lastGame', 'rp7b')) || GAMES[0];
    var played = load('lastGame', null) !== null;
    var html = '';
    html += '<header class="header"><div><div class="eyebrow">Official Saga Portal</div>' +
      '<h1 class="title" style="font-size:26px">The AOV™ Saga</h1></div>' +
      '<a class="round-btn" href="#/bonds" aria-label="Your bonds">' + ICON.star + '</a></header>';

    if (isIOSSafari() && !isStandalone() && !load('installHidden', false)) {
      html += '<div class="install" role="note"><p><b>Keep the Saga on your phone.</b> Tap ' + ICON.share +
        ' Share, then <b>Add to Home Screen</b>.</p>' +
        '<button class="round-btn" data-action="hide-install" aria-label="Dismiss">' + ICON.close + '</button></div>';
    }

    html += '<section class="card"><div class="glow"></div>' +
      '<span class="kicker">' + (played ? 'Continue playing' : 'Start here') + '</span>' +
      '<h2 class="card-title">' + esc(last.name) + '</h2>' +
      '<p class="muted" style="margin:0">' + esc(last.blurb) + '</p>' +
      '<div><a class="btn" href="/' + last.file + '.html" data-game="' + last.file + '">' + ICON.play +
      (played ? 'Resume' : 'Play') + (last.badge ? ' · ' + esc(last.badge) : '') + '</a></div></section>';

    html += '<section class="stack"><h2 class="h2">Five Doors</h2><div class="doors">' +
      door('/saga.html', 'Macro Arc', 'The Saga', '10 Books · 3 Wars · 1 Mirror') +
      door('#/timeline', 'Canon Chronicle', 'Timeline', '12 Bya · 7 Eons') +
      door('/aethryx.html', 'Cosmic Geography', 'Aethryx Expanse', '28 Worlds · 1 Star') +
      door('#/codex', 'Master Archive', 'The Codex', (entries ? entries.length : '400') + '+ Entries') +
      door('/macrobook.html', 'Official Guidebook', 'The Macro Book', 'Ten districts, ten Gemlords, the full type chart', true) +
      '</div></section>';

    var e = entryOfTheDay();
    html += '<section class="stack"><div class="row"><h2 class="h2">From the Archive</h2>' +
      '<a class="link" href="#/codex">See all</a></div>' +
      '<a class="card" href="#/codex/' + esc(e.k) + '" style="color:inherit;border-color:rgba(' + cat(e).c + ',0.35)">' +
      '<div class="row"><span class="code" style="font-size:11px;color:rgb(' + cat(e).c + ')">' + esc(e.id) + '</span>' +
      '<span class="tier" style="font-size:11px">' + tierLabel(e.t) + ' · ' + cat(e).label + '</span></div>' +
      '<span class="card-title" style="font-size:21px">' + esc(e.n) + '</span>' +
      '<span class="lore" style="font-style:italic;font-size:17px">' + esc(e.lore) + '</span></a></section>';

    if (bonds.length) {
      html += '<section class="stack"><div class="row"><h2 class="h2">Your Bonds</h2>' +
        '<a class="link" href="#/bonds">All ' + bonds.length + '</a></div><div class="list">' +
        bonds.slice(-3).reverse().map(function (k) { return byKey[k] ? entryRow(byKey[k]) : ''; }).join('') +
        '</div></section>';
    }
    return html;
  }

  function door(href, kicker, title, sub, wide) {
    return '<a class="door' + (wide ? ' wide' : '') + '" href="' + href + '"><span class="eyebrow" style="font-size:10px">' +
      kicker + '</span><b>' + title + '</b><span>' + sub + '</span></a>';
  }

  function codexView() {
    var html = '<header><div class="eyebrow">Master Archive · Codex v16</div><h1 class="title">The Codex</h1></header>';
    html += '<div class="stack" style="gap:12px">' +
      '<label class="search">' + ICON.search + '<span class="sr-only">Search the codex</span>' +
      '<input id="q" type="search" placeholder="Search beings, Zyrex, types" autocomplete="off" value="' + esc(codexState.q) + '"></label>' +
      '<div class="chips" role="group" aria-label="Category">' + chip('cat', 'all', 'All', codexState.cat) +
      chip('cat', 'bonded', 'Bonded', codexState.cat) +
      Object.keys(CATS).map(function (k) { return chip('cat', k, CATS[k].plural, codexState.cat); }).join('') + '</div>' +
      '<div class="chips" role="group" aria-label="Tier">' + chip('tier', 0, 'All tiers', codexState.tier) +
      [10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(function (t) { return chip('tier', t, tierLabel(t), codexState.tier); }).join('') +
      '</div></div><div id="results" class="stack"></div>';
    return html;
  }

  function chip(group, value, label, current) {
    return '<button class="chip" data-' + group + '="' + value + '" aria-pressed="' + (String(value) === String(current)) + '">' + label + '</button>';
  }

  function renderResults() {
    var box = document.getElementById('results');
    if (!box) return;
    var q = codexState.q.trim().toLowerCase();
    var list = entries.filter(function (e) {
      if (codexState.cat === 'bonded' ? !isBonded(e.k) : (codexState.cat !== 'all' && e.c !== codexState.cat)) return false;
      if (codexState.tier && e.t !== codexState.tier) return false;
      return !q || e.search.indexOf(q) !== -1;
    });
    var shown = list.slice(0, codexState.shown);
    var html = '<span class="small-meta" aria-live="polite">' + list.length + ' of ' + entries.length + ' entries</span>';
    html += list.length ? '<div class="list">' + shown.map(entryRow).join('') + '</div>' :
      '<p class="empty">' + (codexState.cat === 'bonded' ? 'No bonds yet. Open any entry and tap Bond.' : 'Nothing in the archive matches that.') + '</p>';
    if (list.length > shown.length) {
      html += '<button class="btn ghost" data-action="more">Show more (' + (list.length - shown.length) + ' left)</button>';
    }
    box.innerHTML = html;
  }

  function entryView(e) {
    var c = cat(e);
    var html = '<div class="hero">' +
      '<a class="round-btn back" href="#/codex" data-action="back" aria-label="Back">' + ICON.back + '</a>' +
      '<button class="round-btn fav' + (isBonded(e.k) ? ' on' : '') + '" data-action="bond" aria-pressed="' + isBonded(e.k) + '" aria-label="Bond ' + esc(e.n) + '">' + ICON.star + '</button>' +
      sigil(e, 'lg') + '</div>';
    html += '<div class="sheet"><div class="stack" style="gap:6px">' +
      '<div class="pills"><span class="pill">' + tierLabel(e.t) + '</span>' +
      '<span class="pill alt" style="--c:' + c.c + '">' + c.label + '</span>' +
      (e.b ? '<span class="pill alt" style="--c:47, 230, 168">Bondable</span>' : '') + '</div>' +
      '<h1 class="name">' + esc(e.n) + '</h1><span class="muted">' + esc(e.tag) + '</span></div>';

    if (e.lore) html += '<p class="lore">' + esc(e.lore) + '</p>';

    html += '<div class="facts">' + (e.id !== 'ZYREX' ? fact('Codex ID', e.id) : '') + fact('Types', e.types) +
      (e.district ? fact('District', e.district) : '') +
      (e.stats ? fact('Base pool', e.stats.reduce(function (a, b) { return a + b; }, 0)) : '') + '</div>';

    if (e.stats) {
      var chain = evoChain(e);
      html += '<div class="segmented" role="tablist">' +
        '<button role="tab" data-tab="stats" aria-selected="true">Stats</button>' +
        (chain.length > 1 ? '<button role="tab" data-tab="evo" aria-selected="false">Evolution</button>' : '') + '</div>';
      var max = Math.max.apply(null, e.stats) * 1.12;
      var top = Math.max.apply(null, e.stats);
      html += '<div class="stack" data-panel="stats">' + ['HP', 'ATK', 'DEF', 'SPD', 'SPC'].map(function (k, i) {
        var v = e.stats[i];
        return '<div class="stat"><span class="stat-k">' + k + '</span><div class="stat-bar"><i class="' + (v === top ? 'hi' : '') +
          '" style="width:' + Math.round(v / max * 100) + '%"></i></div><span class="stat-v">' + v + '</span></div>';
      }).join('') + '</div>';
      if (chain.length > 1) {
        html += '<div class="stack" data-panel="evo" hidden style="gap:8px">' + chain.map(function (s) {
          var tag = s.e ? tierLabel(s.e.t) : '';
          var inner = '<div><b>' + esc(s.n) + '</b><small>' + tag + (s.k === e.k ? ' · this entry' : '') + '</small></div>' +
            '<em>' + (s.lv ? 'Lv ' + s.lv : 'Start') + '</em>';
          return s.e && s.k !== e.k ? '<a class="evo" href="#/codex/' + esc(s.k) + '">' + inner + '</a>' :
            '<div class="evo' + (s.k === e.k ? ' current' : '') + '">' + inner + '</div>';
        }).join('') + '</div>';
      }
    }

    html += '<button class="btn' + (isBonded(e.k) ? ' bonded' : '') + '" data-action="bond" style="min-height:52px">' +
      (isBonded(e.k) ? 'Bonded to your Rizer' : 'Bond ' + esc(e.n)) + '</button></div>';
    return html;
  }

  function fact(label, value) {
    return '<div class="fact"><span>' + label + '</span><span>' + esc(value) + '</span></div>';
  }

  function evoChain(e) {
    var root = e;
    var guard = 0;
    while (root.from && byKey[root.from.k] && guard++ < 10) root = byKey[root.from.k];
    var chain = [{ n: root.n, k: root.k, e: root, lv: null }];
    var cur = root;
    guard = 0;
    while (cur.evolve && guard++ < 10) {
      var next = byKey[cur.evolve.k];
      chain.push({ n: next ? next.n : cur.evolve.to, k: cur.evolve.k, e: next, lv: cur.evolve.lv });
      if (!next) break;
      cur = next;
    }
    return chain;
  }

  function gamesView() {
    var f = GAMES[0];
    var html = '<header><div class="eyebrow">Playable Layer · Live Playtest</div><h1 class="title">The Games</h1></header>';
    html += '<section class="card feature" style="border-color:rgba(232,200,120,0.3)">' +
      '<div class="feature-art"><span>ZYRAXIS · THE NINTH WORLD</span></div><div class="feature-body">' +
      '<div class="pills"><span class="badge live">' + esc(f.badge) + '</span><span class="badge">' + esc(f.no) + ' · Flagship</span></div>' +
      '<h2 class="card-title">' + esc(f.name) + '</h2><p class="muted" style="margin:0">' + esc(f.blurb) + '</p>' +
      '<div style="display:flex;gap:10px"><a class="btn" style="flex:1" href="/' + f.file + '.html" data-game="' + f.file + '">' + ICON.play + 'Play</a>' +
      '<a class="btn ghost" href="/macrobook.html">Guidebook</a></div></div></section>';
    html += '<section class="stack"><h2 class="h2">All Prototypes</h2><div class="list">' +
      GAMES.slice(1).map(function (g) {
        return '<a class="entry" href="/' + g.file + '.html" data-game="' + g.file + '">' +
          '<div class="sigil game-icon" aria-hidden="true">' + esc(g.no) + '</div>' +
          '<div class="entry-main"><span class="entry-name">' + esc(g.name) + '</span>' +
          '<span class="entry-sub">' + esc(g.kind) + '</span></div>' + ICON.chev + '</a>';
      }).join('') + '</div></section>';
    return html;
  }

  function timelineView() {
    var html = '<header><div class="eyebrow">Aenor Eruption → Equinox 2031</div><h1 class="title">The Long Order</h1>' +
      '<p class="muted" style="margin:4px 0 0">~15 billion years · 27 worlds · 3 wars · 1 bloodline</p></header>';
    html += '<ol class="tl" style="list-style:none;margin:0;padding:0">' + TIMELINE.map(function (t, i) {
      var open = i === timelineOpen;
      return '<li class="tl-item' + (open ? ' open' : '') + '"><div class="tl-rail"><div class="tl-dot"></div><div class="tl-line"></div></div>' +
        '<button class="tl-card" data-tl="' + i + '" aria-expanded="' + open + '">' +
        '<span class="kicker">' + esc(t.when) + '</span><b>' + esc(t.title) + '</b><p>' + esc(t.body) + '</p></button></li>';
    }).join('') + '</ol>';
    html += '<a class="btn ghost" href="/timeline.html">Read the full timeline ' + ICON.arrow + '</a>';
    return html;
  }

  function bondsView() {
    var list = bonds.map(function (k) { return byKey[k]; }).filter(Boolean).reverse();
    return '<header><div class="eyebrow">Your Rizer</div><h1 class="title">Your Bonds</h1></header>' +
      (list.length ? '<div class="list">' + list.map(entryRow).join('') + '</div>' :
        '<p class="empty">No bonds yet. Open any codex entry and tap <b>Bond</b> to keep it here.</p>' +
        '<a class="btn" href="#/codex">Open the Codex</a>');
  }

  // ---------- router ----------
  var navDepth = 0;

  function route() {
    var hash = location.hash.replace(/^#/, '') || '/';
    var parts = hash.split('/').filter(Boolean);
    var tab = parts[0] || 'home';
    if (tab === 'bonds') tab = 'home';

    document.querySelectorAll('.tabbar a').forEach(function (a) {
      if (a.getAttribute('data-tab') === tab) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    if (!entries) {
      view.className = 'view';
      view.innerHTML = '<p class="empty">Opening the archive…</p>';
      dataPromise.then(route, function () {
        view.innerHTML = '<p class="empty">The archive could not be reached. Check your connection and try again.</p>' +
          '<button class="btn" onclick="location.reload()">Retry</button>';
      });
      return;
    }

    var detail = parts[0] === 'codex' && parts[1] && byKey[decodeURIComponent(parts[1])];
    view.className = detail ? 'view flush' : 'view';
    if (detail) {
      view.innerHTML = entryView(detail);
      document.title = detail.n + ' · AOV Saga';
    } else if (parts[0] === 'codex') {
      view.innerHTML = codexView();
      renderResults();
      document.title = 'The Codex · AOV Saga';
    } else if (parts[0] === 'games') {
      view.innerHTML = gamesView();
      document.title = 'Games · AOV Saga';
    } else if (parts[0] === 'timeline') {
      view.innerHTML = timelineView();
      document.title = 'Timeline · AOV Saga';
    } else if (parts[0] === 'bonds') {
      view.innerHTML = bondsView();
      document.title = 'Your Bonds · AOV Saga';
    } else {
      view.innerHTML = homeView();
      document.title = 'AOV Saga';
    }
    view.scrollTop = 0;
  }

  // ---------- events ----------
  window.addEventListener('hashchange', function () { navDepth++; route(); });

  view.addEventListener('input', function (ev) {
    if (ev.target.id === 'q') {
      codexState.q = ev.target.value;
      codexState.shown = PAGE;
      renderResults();
    }
  });

  view.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-action],[data-cat],[data-tier],[data-tab],[data-tl],[data-game]');
    if (!t) return;

    if (t.hasAttribute('data-game')) {
      save('lastGame', t.getAttribute('data-game'));
      return; // let the link navigate
    }
    if (t.hasAttribute('data-cat') || t.hasAttribute('data-tier')) {
      if (t.hasAttribute('data-cat')) codexState.cat = t.getAttribute('data-cat');
      else codexState.tier = Number(t.getAttribute('data-tier'));
      codexState.shown = PAGE;
      var group = t.parentNode;
      group.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === t)); });
      renderResults();
      return;
    }
    if (t.hasAttribute('data-tab')) {
      var which = t.getAttribute('data-tab');
      t.parentNode.querySelectorAll('[role="tab"]').forEach(function (b) { b.setAttribute('aria-selected', String(b === t)); });
      view.querySelectorAll('[data-panel]').forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== which; });
      return;
    }
    if (t.hasAttribute('data-tl')) {
      var i = Number(t.getAttribute('data-tl'));
      timelineOpen = timelineOpen === i ? -1 : i;
      view.querySelectorAll('.tl-item').forEach(function (li, j) {
        li.classList.toggle('open', j === timelineOpen);
        li.querySelector('.tl-card').setAttribute('aria-expanded', String(j === timelineOpen));
      });
      return;
    }

    var action = t.getAttribute('data-action');
    if (action === 'more') {
      codexState.shown += PAGE;
      renderResults();
    } else if (action === 'bond') {
      var k = decodeURIComponent(location.hash.split('/')[2] || '');
      if (byKey[k]) {
        toggleBond(k);
        var y = view.scrollTop;
        view.innerHTML = entryView(byKey[k]);
        view.scrollTop = y;
      }
    } else if (action === 'back') {
      if (navDepth > 0) { ev.preventDefault(); history.back(); }
    } else if (action === 'hide-install') {
      save('installHidden', true);
      t.closest('.install').remove();
    }
  });

  route();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/app/sw.js', { scope: '/app/' }).catch(function () { /* offline support is optional */ });
    });
  }
})();
