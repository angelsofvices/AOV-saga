// ★ 2026-10-06 · THE GAME LAYER — turns the portal into something you play.
//
// Reads the unlock manifest (site-unlocks.js) and keeps a save file in the
// visitor's browser. Everything here is progressive: with JS off, or with
// storage blocked, every page still reads as the plain guidebook.
//
//   · Title screen + unlock cutscenes when the manifest opens something new
//   · HUD: level, XP, Mothergem Shards, achievements
//   · Zones discovered as you scroll · Codex cards scanned on click
//   · Hidden shards on every page · quests · journal (J) · patch notes
//   · Star map on The Worlds, built from the manifest
(function(){
  'use strict';
  var M = window.AOV_UNLOCKS || { items:[], patches:[], build:'' };
  var doc = document, body = doc.body;
  var motionQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches:false };
  function reduced(){ return motionQ.matches; }

  // ───────────────────────── page identity ─────────────────────────
  var PAGES = { home:'The Saga', worlds:'The Worlds', zyraxis:'Zyraxis', games:'The Games', books:'The Books', 'zyrex-codex':'The Codex', legal:'Legal' };
  var path = location.pathname.replace(/\/+$/, '/');
  var PAGE = (function(){
    if (path === '/' || /\/index(?:\.html)?$/.test(path)) return 'home';
    // Netlify serves pretty URLs (/books, not /books.html) · accept both
    var m = path.match(/\/([a-z0-9-]+)(?:\.html)?$/);
    return m && PAGES[m[1]] ? m[1] : 'other';
  })();
  body.classList.add('gm', 'gm-page-' + PAGE);

  // ───────────────────────── save file ─────────────────────────
  var KEY = 'aov.save.v1';
  var params = new URLSearchParams(location.search);
  function blank(){
    return { v:1, xp:0, created:Date.now(), last:0, pages:{}, zones:{}, scans:{}, shards:{},
             ach:{}, seen:{}, opened:{}, sound:false, crt:false, knocks:0 };
  }
  function load(){
    try { var raw = localStorage.getItem(KEY); if (raw) { var s = JSON.parse(raw); if (s && s.v === 1) return s; } } catch(e){}
    return null;
  }
  var S = params.has('newgame') ? null : load();
  var isNew = !S;
  if (!S) S = blank();
  ['pages','zones','scans','shards','ach','seen','opened'].forEach(function(k){ if (!S[k] || typeof S[k] !== 'object') S[k] = {}; });
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} }
  function sess(k, v){ try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch(e){ return null; } }
  if (params.has('newgame') || params.has('replay')) {
    if (params.has('replay')) S.seen = {};
    params.delete('newgame'); params.delete('replay');
    var qs = params.toString();
    try { history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash); } catch(e){}
  }

  // ───────────────────────── helpers ─────────────────────────
  function el(tag, cls, html){ var n = doc.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function $all(sel, root){ return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }
  function slug(s){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function count(obj){ return Object.keys(obj).length; }
  var items = M.items || [];
  var byId = {}; items.forEach(function(it){ byId[it.id] = it; });
  function isOpen(it){ return it && it.status === 'unlocked'; }
  var KIND = { world:'WORLD', game:'GAME', guide:'GUIDEBOOK', book:'BOOK' };

  // ───────────────────────── sound (off by default) ─────────────────────────
  var actx = null;
  function tone(freq, dur, type, vol, when){
    if (!S.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var t = actx.currentTime + (when || 0), o = actx.createOscillator(), g = actx.createGain();
      o.type = type || 'square'; o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(vol || 0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur + 0.02);
    } catch(e){}
  }
  var sfx = {
    tick:   function(){ tone(880, .04, 'square', .02); },
    ok:     function(){ tone(660, .07); tone(990, .1, 'square', .05, .07); },
    xp:     function(){ tone(1320, .06, 'triangle', .05); tone(1760, .08, 'triangle', .04, .05); },
    deny:   function(){ tone(160, .12, 'sawtooth', .05); tone(120, .16, 'sawtooth', .05, .1); },
    shard:  function(){ [1047,1319,1568,2093].forEach(function(f,i){ tone(f, .12, 'triangle', .05, i*.07); }); },
    level:  function(){ [523,659,784,1047,784,1047].forEach(function(f,i){ tone(f, .12, 'square', .045, i*.09); }); },
    unlock: function(){ [262,330,392,523,659,784,1047].forEach(function(f,i){ tone(f, .2, 'square', .04, i*.08); }); tone(1047, .7, 'triangle', .05, .6); }
  };

  // ───────────────────────── levels ─────────────────────────
  var LEVELS = [
    [0,'Wanderer'],[120,'Initiate'],[280,'Rizer'],[480,'Shardseeker'],[720,'Gembound'],
    [980,'Warden'],[1240,'Ascendant'],[1480,'Gemlord-Touched']
  ];
  function levelOf(xp){
    var i = 0; while (i + 1 < LEVELS.length && xp >= LEVELS[i+1][0]) i++;
    var cur = LEVELS[i][0], next = LEVELS[i+1] ? LEVELS[i+1][0] : null;
    return { lv:i+1, title:LEVELS[i][1], cur:cur, next:next, pct: next ? (xp-cur)/(next-cur) : 1 };
  }

  // ───────────────────────── toasts ─────────────────────────
  var toastBox = el('div', 'gm-toasts'); toastBox.setAttribute('aria-live', 'polite'); body.appendChild(toastBox);
  function toast(label, text, kind){
    var t = el('div', 'gm-toast win' + (kind ? ' ' + kind : ''),
      '<span class="gm-toast-k">' + esc(label) + '</span><span class="gm-toast-v">' + esc(text) + '</span>');
    toastBox.appendChild(t);
    while (toastBox.children.length > 3) toastBox.removeChild(toastBox.firstChild);
    setTimeout(function(){ t.classList.add('out'); setTimeout(function(){ t.remove(); }, 400); }, 2800);
  }

  function gain(n, why){
    var before = levelOf(S.xp).lv;
    S.xp += n; save(); renderHud(true);
    if (why) toast(why, '+' + n + ' XP');
    var after = levelOf(S.xp);
    if (after.lv > before) {
      sfx.level();
      levelBanner(after);
      checkAch();
    } else sfx.xp();
  }
  function levelBanner(L){
    var b = el('div', 'gm-levelup', '<div class="gm-levelup-in"><span>LEVEL UP!</span><b>LV ' + L.lv + '</b><i>' + esc(L.title.toUpperCase()) + '</i></div>');
    body.appendChild(b);
    setTimeout(function(){ b.classList.add('out'); setTimeout(function(){ b.remove(); }, 500); }, 2200);
  }

  // ───────────────────────── achievements ─────────────────────────
  var SHARDS = [
    { id:'s-home',     page:'home',    sel:'.cover h1',             x:'96%', y:'8%'  },
    { id:'s-corefall', page:'zyraxis', sel:'#corefall .figttl',      x:'97%', y:'50%' },
    { id:'s-triad',    page:'zyraxis', sel:'#triad .triad',         x:'99%', y:'-4%' },
    { id:'s-worlds',   page:'worlds',  sel:'#locked .worldgrid',    x:'101%', y:'101%' },
    { id:'s-games',    page:'games',   sel:'[data-unlock-id="game-rp7d"]', x:'92%', y:'12%' },
    { id:'s-books',    page:'books',   sel:'#viridia .box',         x:'98%', y:'-6%' },
    { id:'s-legal',    page:'legal',   sel:'#trademarks .chipwrap', x:'100%', y:'50%' }
  ];
  var ZYRAXIS_ZONES = ['cover','prologue','corefall','arches','lands','triad','hunt','inhabitants','play'];
  function zyraxisZones(){ return ZYRAXIS_ZONES.filter(function(z){ return S.zones['zyraxis:' + z]; }).length; }
  var SCAN_TOTAL = 16;
  var ACH = [
    { id:'start',     name:'Press Start',        desc:'Begin your journey on the portal.',            test:function(){ return true; } },
    { id:'explorer',  name:'Zone Explorer',      desc:'Discover every zone of Zyraxis.',              test:function(){ return zyraxisZones() >= ZYRAXIS_ZONES.length; } },
    { id:'carto',     name:'Cartographer',       desc:'Visit every page of the portal.',              test:function(){ return Object.keys(PAGES).every(function(p){ return S.pages[p]; }); } },
    { id:'archivist', name:'Archivist',          desc:'Scan all ' + SCAN_TOTAL + ' Zyraxis codex cards.', test:function(){ return count(S.scans) >= SCAN_TOTAL; } },
    { id:'firstshard',name:'Glint in the Dark',  desc:'Find your first Mothergem Shard.',             test:function(){ return count(S.shards) >= 1; } },
    { id:'mothergem', name:'Mothergem Restored', desc:'Find all ' + SHARDS.length + ' Mothergem Shards.', test:function(){ return count(S.shards) >= SHARDS.length; } },
    { id:'patchday',  name:'Patch Day',          desc:'Return and witness a new unlock.',             test:function(){ return !!S.witnessed; } },
    { id:'player',    name:'Ready Player',       desc:'Launch the Rizing Power beta.',                test:function(){ return !!S.played; } },
    { id:'sealed',    name:'Sealed Tight',       desc:'Knock on locked doors five times.',            test:function(){ return S.knocks >= 5; } },
    { id:'scholar',   name:'Scholar',            desc:'Open the Macro Book guidebook.',               test:function(){ return !!S.opened['guide-macrobook']; } },
    { id:'lv5',       name:'Gembound',           desc:'Reach Level 5.',                               test:function(){ return levelOf(S.xp).lv >= 5; } },
    { id:'konami',    name:'Ancient Code',       desc:'??? — some codes are older than Zyraxis.',      test:function(){ return !!S.konami; }, secret:true }
  ];
  function checkAch(){
    if (!started) return;   // nothing pops behind the title screen or a cutscene
    var fresh = ACH.filter(function(a){ return !S.ach[a.id] && a.test(); });
    fresh.forEach(function(a, i){
      S.ach[a.id] = Date.now();
      setTimeout(function(){
        toast('★ ACHIEVEMENT', a.name, 'gold');
        gain(25);
      }, 500 + i * 900);
    });
    if (fresh.length) save();
  }

  // ───────────────────────── HUD ─────────────────────────
  var hud = el('div', 'gm-hud');
  hud.setAttribute('role', 'region'); hud.setAttribute('aria-label', 'Player status');
  hud.innerHTML =
    '<button class="gm-hud-pl" type="button" data-open="status" aria-label="Open journal">' +
      '<span class="gm-gem" aria-hidden="true"></span><span class="gm-lv">LV <b>1</b></span><span class="gm-ttl"></span></button>' +
    '<div class="gm-xp" aria-hidden="true"><div class="gm-xp-bar"><i></i></div><span class="gm-xp-n"></span></div>' +
    '<button class="gm-hud-chip gm-chip-shard" type="button" data-open="quests" title="Mothergem Shards"><span class="gm-ico">◆</span><b></b></button>' +
    '<button class="gm-hud-chip gm-chip-ach" type="button" data-open="trophies" title="Achievements"><span class="gm-ico">★</span><b></b></button>' +
    '<button class="gm-hud-btn" type="button" data-open="quests" title="Journal (J)"><span>JOURNAL</span><kbd>J</kbd></button>' +
    '<button class="gm-hud-btn gm-snd" type="button" aria-pressed="false" title="Sound"><span class="gm-snd-i">♪</span></button>';
  body.appendChild(hud);
  var lastLv = null;
  function renderHud(bump){
    var L = levelOf(S.xp);
    hud.querySelector('.gm-lv b').textContent = L.lv;
    hud.querySelector('.gm-ttl').textContent = L.title.toUpperCase();
    hud.querySelector('.gm-xp-bar i').style.width = Math.round(L.pct * 100) + '%';
    hud.querySelector('.gm-xp-n').textContent = L.next ? (S.xp + ' / ' + L.next + ' XP') : (S.xp + ' XP · MAX');
    hud.querySelector('.gm-chip-shard b').textContent = count(S.shards) + '/' + SHARDS.length;
    hud.querySelector('.gm-chip-ach b').textContent = count(S.ach) + '/' + ACH.length;
    var snd = hud.querySelector('.gm-snd');
    snd.setAttribute('aria-pressed', S.sound ? 'true' : 'false');
    snd.setAttribute('aria-label', S.sound ? 'Sound on' : 'Sound off');
    snd.classList.toggle('on', !!S.sound);
    body.classList.toggle('gm-crt', !!S.crt);
    hud.classList.toggle('gm-mothergem', count(S.shards) >= SHARDS.length);
    if (bump && lastLv !== null) { hud.classList.remove('bump'); void hud.offsetWidth; hud.classList.add('bump'); }
    lastLv = L.lv;
    renderSave();
    renderMenuCard(L);
  }
  hud.querySelector('.gm-snd').addEventListener('click', function(){ S.sound = !S.sound; save(); renderHud(); sfx.ok(); });
  $all('[data-open]', hud).forEach(function(b){ b.addEventListener('click', function(){ openJournal(b.getAttribute('data-open')); }); });

  // Player card at the foot of the hamburger drawer.
  var drawer = doc.querySelector('.menu-drawer'), menuCard = null;
  if (drawer) { menuCard = el('div', 'menu-save'); drawer.appendChild(menuCard); }
  function renderMenuCard(L){
    if (!menuCard) return;
    menuCard.innerHTML = '<div class="ms"><span class="gem" aria-hidden="true"></span><div>' +
      '<b>LV ' + L.lv + ' · ' + esc(L.title.toUpperCase()) + '</b>' +
      '◆ ' + count(S.shards) + '/' + SHARDS.length + ' · ★ ' + count(S.ach) + '/' + ACH.length + ' · ' + S.xp + ' XP</div></div>';
  }

  // Save-file window on the home page.
  function renderSave(){
    var box = doc.querySelector('[data-render="savefile"]');
    if (!box) return;
    var L = levelOf(S.xp);
    var open = items.filter(isOpen).length;
    box.innerHTML =
      '<div class="boxttl">' + (isNew && !S.started ? 'NEW GAME' : 'SAVE FILE 01 · CONTINUE') + '</div>' +
      '<div class="boxbody gm-save">' +
        '<div class="gm-save-gem" aria-hidden="true"></div>' +
        '<div class="gm-save-main"><div class="gm-save-nm">LV ' + L.lv + ' · ' + esc(L.title.toUpperCase()) + '</div>' +
        '<div class="gm-xp-bar big"><i style="width:' + Math.round(L.pct*100) + '%"></i></div>' +
        '<div class="gm-save-row"><span>XP <b>' + S.xp + '</b></span><span>SHARDS <b>' + count(S.shards) + '/' + SHARDS.length + '</b></span>' +
        '<span>TROPHIES <b>' + count(S.ach) + '/' + ACH.length + '</b></span><span>UNLOCKED <b>' + open + '/' + items.length + '</b></span></div></div>' +
        '<button class="btn ghost gm-save-btn" type="button">OPEN JOURNAL</button>' +
      '</div>';
    box.querySelector('.gm-save-btn').addEventListener('click', function(){ openJournal('quests'); });
  }

  // ───────────────────────── manifest → page ─────────────────────────
  // Counters: <span data-count="world:locked">27</span>
  $all('[data-count]').forEach(function(n){
    var p = n.getAttribute('data-count').split(':'), kind = p[0], st = p[1];
    n.textContent = items.filter(function(it){
      if (it.kind !== kind) return false;
      if (st === 'unlocked') return isOpen(it);
      if (st === 'locked') return !isOpen(it);
      return true;
    }).length;
  });
  $all('[data-build]').forEach(function(n){ if (M.build) n.textContent = M.build; });

  function isNewItem(it){ return isOpen(it) && !S.opened[it.id] && !isNew; }
  function markOpened(id){ if (id && !S.opened[id]) { S.opened[id] = Date.now(); save(); checkAch(); } }
  // Visiting an item's page counts as opening it.
  items.forEach(function(it){ if (isOpen(it) && it.href && it.href.replace(/\/$/, '') === path.replace(/\/$/, '')) markOpened(it.id); });

  // Doors bound to manifest entries: <div class="door soon" data-unlock-id="game-rp7d">
  $all('[data-unlock-id]').forEach(function(d){
    var it = byId[d.getAttribute('data-unlock-id')];
    if (!it) return;
    if (isOpen(it) && it.href && d.tagName !== 'A') {
      var a = el('a', d.className.replace(/\bsoon\b/, '').trim());
      a.innerHTML = d.innerHTML; a.href = it.href;
      a.setAttribute('data-unlock-id', it.id);
      var ttl = a.querySelector('.doorttl'); if (ttl) ttl.textContent = 'AVAILABLE NOW';
      var go = a.querySelector('.go'); if (go) go.innerHTML = '<span class="cur">▶</span> ' + esc(it.cta || 'ENTER');
      d.parentNode.replaceChild(a, d); d = a;
    }
    if (isOpen(it)) {
      if (isNewItem(it)) d.appendChild(el('span', 'gm-new', 'NEW!'));
      d.addEventListener('click', function(){ markOpened(it.id); });
    } else {
      d.classList.add('gm-locked');
      d.setAttribute('tabindex', '0'); d.setAttribute('role', 'button');
      d.setAttribute('aria-label', it.name + ' — ' + (it.status === 'soon' ? 'coming soon' : 'locked'));
    }
  });

  // Anything still sealed answers a knock.
  function knock(node, it){
    sfx.deny();
    node.classList.remove('gm-shake'); void node.offsetWidth; node.classList.add('gm-shake');
    S.knocks = (S.knocks || 0) + 1; save();
    toast(it && it.status === 'soon' ? 'COMING SOON' : '🔒 SEALED',
      (it ? it.name + ' · ' : '') + 'opens in a future update', 'red');
    checkAch();
  }
  doc.addEventListener('click', function(e){
    var n = e.target.closest && e.target.closest('.gm-locked');
    if (n) { e.preventDefault(); knock(n, byId[n.getAttribute('data-unlock-id')]); }
  });
  doc.addEventListener('keydown', function(e){
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('gm-locked')) {
      e.preventDefault(); knock(e.target, byId[e.target.getAttribute('data-unlock-id')]);
    }
  });

  // Track launching the beta.
  doc.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href');
    if (/rp7b\.html/.test(h)) { S.played = true; save(); checkAch(); }
    if (/macrobook\.html/.test(h)) markOpened('guide-macrobook');
  }, true);

  // Patch log: <div data-render="patches"></div>
  function patchHtml(limit){
    return (M.patches || []).slice(0, limit || 99).map(function(p){
      return '<article class="gm-patch"><header><span class="gm-patch-d">' + esc(p.date) + '</span><span class="gm-patch-b">' + esc(p.build || '') + '</span></header>' +
        '<h4>' + esc(p.title) + '</h4><ul>' + (p.notes || []).map(function(n){
          var m = String(n).match(/^([A-Z ]+?) · (.*)$/);
          return '<li>' + (m ? '<span class="gm-patch-tag">' + esc(m[1]) + '</span> ' + esc(m[2]) : esc(n)) + '</li>';
        }).join('') + '</ul></article>';
    }).join('');
  }
  $all('[data-render="patches"]').forEach(function(n){ n.innerHTML = patchHtml(+n.getAttribute('data-limit') || 0); });

  // ───────────────────────── The Worlds: grid + doors + star map ─────────────────────────
  var worlds = items.filter(function(it){ return it.kind === 'world'; }).sort(function(a,b){ return a.no - b.no; });
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  var grid = doc.querySelector('[data-render="locked-worlds"]');
  if (grid) {
    grid.innerHTML = worlds.filter(function(w){ return !isOpen(w); }).map(function(w){
      return '<div class="world gm-locked" data-unlock-id="' + w.id + '" tabindex="0" role="button" aria-label="' + esc(w.name) + ' — locked">' +
        '<div class="top"><span class="no">' + pad(w.no) + '</span><span class="lk">🔒 ' + (w.status === 'soon' ? 'SOON' : 'LOCKED') + '</span></div>' +
        '<div class="nm">' + esc(w.name) + '</div><div class="arch">' + esc(w.title.toUpperCase()) + ' · Q ' + w.quadrant + '</div></div>';
    }).join('');
  }
  var openDoors = doc.querySelector('[data-render="unlocked-worlds"]');
  if (openDoors) {
    worlds.filter(isOpen).forEach(function(w){
      if (openDoors.querySelector('[data-unlock-id="' + w.id + '"]')) return;
      var a = el('a', 'door', '<div class="doorttl">WORLD ' + pad(w.no) + ' · ' + esc(w.title.toUpperCase()) + '</div><div class="doorbody">' +
        '<div class="nm">' + esc(w.name.toUpperCase()) + '</div><p>' + esc(w.blurb || '') + '</p>' +
        '<div class="stat">QUADRANT ' + w.quadrant + ' · OPEN</div><div class="go"><span class="cur">▶</span> ' + esc(w.cta || 'ENTER ' + w.name.toUpperCase()) + '</div></div>');
      a.href = w.href || '#'; a.setAttribute('data-unlock-id', w.id);
      if (isNewItem(w)) a.appendChild(el('span', 'gm-new', 'NEW!'));
      a.addEventListener('click', function(){ markOpened(w.id); });
      openDoors.insertBefore(a, openDoors.firstChild);
    });
  }

  var map = doc.querySelector('[data-render="starmap"]');
  if (map) buildStarmap(map);
  function buildStarmap(host){
    var C = 400, NS = 'http://www.w3.org/2000/svg';
    var Q = { 'I':-90, 'II':-180, 'III':90, 'IV':0 };
    var byQ = {}; worlds.forEach(function(w){ (byQ[w.quadrant] = byQ[w.quadrant] || []).push(w); });
    function pos(w){
      var list = byQ[w.quadrant], i = list.indexOf(w), n = list.length;
      var ang = (Q[w.quadrant] + 10 + (n > 1 ? i / (n - 1) : .5) * 70 + ((w.no * 37) % 9 - 4)) * Math.PI / 180;
      var r = 78 + (w.no - 1) * 11;
      return { x: C + Math.cos(ang) * r, y: C + Math.sin(ang) * r, r: r };
    }
    var svg = '<svg viewBox="0 0 800 800" role="group" aria-label="Star map of the Aethryx Expanse"><defs>' +
      '<radialGradient id="gmSun"><stop offset="0" stop-color="#FFF6D0"/><stop offset=".45" stop-color="#FFC83D"/><stop offset="1" stop-color="#FFC83D" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="gmNeb" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#4A2D8A" stop-opacity=".35"/><stop offset="1" stop-color="#050310" stop-opacity="0"/></radialGradient></defs>' +
      '<circle cx="400" cy="400" r="400" fill="url(#gmNeb)"/>' +
      '<line x1="400" y1="20" x2="400" y2="780" class="gm-axis"/><line x1="20" y1="400" x2="780" y2="400" class="gm-axis"/>' +
      '<text x="770" y="40" class="gm-q" text-anchor="end">Q I</text><text x="30" y="40" class="gm-q">Q II</text>' +
      '<text x="30" y="772" class="gm-q">Q III</text><text x="770" y="772" class="gm-q" text-anchor="end">Q IV</text>';
    worlds.forEach(function(w){ svg += '<circle cx="400" cy="400" r="' + pos(w).r + '" class="gm-orbit' + (isOpen(w) ? ' open' : '') + '"/>'; });
    svg += '<g class="gm-sun"><circle cx="400" cy="400" r="58" fill="url(#gmSun)" class="gm-sun-glow"/><circle cx="400" cy="400" r="20" fill="#FFE9A8"/>' +
      '<text x="400" y="448" text-anchor="middle" class="gm-sun-lbl">AENOR</text></g>';
    worlds.forEach(function(w){
      var p = pos(w), o = isOpen(w), c = w.color || '#B87CFF';
      svg += '<g transform="translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')"><g class="gm-planet' + (o ? ' open' : ' gm-locked') + '" data-unlock-id="' + w.id + '" tabindex="0" role="button" ' +
        'aria-label="World ' + w.no + ', ' + esc(w.name) + ', ' + (o ? 'unlocked' : 'locked') + '" style="--pc:' + c + '">' +
        '<circle r="18" class="gm-hit"/>' +
        (o ? '<circle r="22" class="gm-halo"/><circle r="12" class="gm-body"/><text y="-22" text-anchor="middle" class="gm-plbl">' + esc(w.name.toUpperCase()) + '</text>'
           : '<circle r="6.5" class="gm-body"/><path d="M-2.6 -1.2 v-1.6 a2.6 2.6 0 0 1 5.2 0 v1.6 M-3.6 -1.2 h7.2 v4.6 h-7.2z" class="gm-padlock"/>') +
        '</g></g>';
    });
    svg += '</svg>';
    host.innerHTML = '<div class="gm-map">' + svg + '</div><div class="gm-mapinfo win" aria-live="polite"></div>';
    var info = host.querySelector('.gm-mapinfo');
    function show(w){
      var o = isOpen(w);
      info.innerHTML = '<div class="boxttl">WORLD ' + pad(w.no) + ' · QUADRANT ' + w.quadrant + '</div><div class="boxbody">' +
        '<div class="gm-mi-nm" style="--pc:' + (o ? (w.color || '#B87CFF') : '#7a6d93') + '">' + esc(w.name.toUpperCase()) + '</div>' +
        '<div class="gm-mi-t">' + esc(w.title.toUpperCase()) + '</div>' +
        '<p>' + (o ? esc(w.blurb || '') : 'Sealed. This world opens in a future update.') + '</p>' +
        (o ? '<a class="btn" href="' + esc(w.href) + '">▶ ' + esc(w.cta || 'ENTER') + '</a>' : '<span class="gm-mi-lock">🔒 ' + (w.status === 'soon' ? 'COMING SOON' : 'LOCKED') + '</span>') +
        '</div>';
      $all('.gm-planet', host).forEach(function(g){ g.classList.toggle('sel', g.getAttribute('data-unlock-id') === w.id); });
    }
    $all('.gm-planet', host).forEach(function(g){
      var w = byId[g.getAttribute('data-unlock-id')];
      g.addEventListener('mouseenter', function(){ show(w); sfx.tick(); });
      g.addEventListener('focus', function(){ show(w); });
      if (isOpen(w)) {
        g.addEventListener('click', function(){ markOpened(w.id); warp(w.href); });
        g.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); markOpened(w.id); warp(w.href); } });
      }
    });
    show(worlds.filter(isOpen)[0] || worlds[0]);
  }

  // ───────────────────────── zones (sections) ─────────────────────────
  var fog = body.hasAttribute('data-fog');
  var zones = $all('main > header.cover, main > section[id]');
  zones.forEach(function(z){ if (!z.id) z.setAttribute('data-zone', 'cover'); });
  function zid(z){ return PAGE + ':' + (z.id || 'cover'); }
  function zoneName(z){
    var h = z.querySelector('h2');
    return h ? h.textContent.trim() : (PAGES[PAGE] || 'Cover');
  }
  var railLinks = {};
  $all('#nav a').forEach(function(a){ railLinks[a.getAttribute('href').slice(1)] = a; });
  function markRail(z){ var a = railLinks[z.id]; if (a) a.classList.add('gm-found'); }
  zones.forEach(function(z){
    if (S.zones[zid(z)]) { markRail(z); return; }
    if (fog && z.tagName === 'SECTION') z.classList.add('gm-fog');
  });
  if ('IntersectionObserver' in window) {
    var zio = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (!e.isIntersecting) return;
        var z = e.target; zio.unobserve(z);
        var id = zid(z);
        if (z.classList.contains('gm-fog')) { z.classList.remove('gm-fog'); z.classList.add('gm-reveal'); }
        if (S.zones[id]) return;
        S.zones[id] = Date.now(); save(); markRail(z);
        if (started) gain(15, 'ZONE DISCOVERED · ' + zoneName(z).toUpperCase());
        else S.xp += 15;
        checkAch();
      });
    }, { rootMargin: '0px 0px -18% 0px', threshold: 0.05 });
    zones.forEach(function(z){ zio.observe(z); });
  } else zones.forEach(function(z){ z.classList.remove('gm-fog'); });

  // ───────────────────────── codex scanning (Zyraxis cards) ─────────────────────────
  if (PAGE === 'zyraxis') {
    $all('#lands .card, #inhabitants .card').forEach(function(c){
      var nm = c.querySelector('.nm'); if (!nm) return;
      var id = c.closest('section').id + ':' + slug(nm.textContent);
      c.classList.add('gm-scan'); c.setAttribute('tabindex', '0'); c.setAttribute('role', 'button');
      c.setAttribute('aria-label', 'Scan ' + nm.textContent + ' into your codex');
      var stamp = el('span', 'gm-stamp', '◆ LOGGED'); c.appendChild(stamp);
      if (S.scans[id]) c.classList.add('scanned');
      function scan(){
        if (c.classList.contains('scanned') || c.classList.contains('scanning')) return;
        c.classList.add('scanning'); sfx.tick();
        setTimeout(function(){
          c.classList.remove('scanning'); c.classList.add('scanned');
          S.scans[id] = Date.now(); save();
          gain(10, 'CODEX ' + count(S.scans) + '/' + SCAN_TOTAL + ' · ' + nm.textContent.toUpperCase());
          checkAch();
        }, reduced() ? 0 : 650);
      }
      c.addEventListener('click', scan);
      c.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scan(); } });
    });
    var hint = doc.querySelector('#lands .lede');
    if (hint) hint.insertAdjacentHTML('afterend', '<p class="gm-hint">▶ TAP A CARD TO SCAN IT INTO YOUR CODEX</p>');
  }

  // ───────────────────────── Mothergem Shards ─────────────────────────
  SHARDS.filter(function(s){ return s.page === PAGE && !S.shards[s.id]; }).forEach(function(s){
    var host = doc.querySelector(s.sel); if (!host) return;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    var b = el('button', 'gm-shard'); b.type = 'button';
    b.setAttribute('aria-label', 'A glint of light — a Mothergem Shard');
    b.style.left = s.x; b.style.top = s.y;
    b.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      if (S.shards[s.id]) return;
      S.shards[s.id] = Date.now(); save();
      b.classList.add('got'); sfx.shard();
      setTimeout(function(){ b.remove(); }, 900);
      gain(50, 'MOTHERGEM SHARD ' + count(S.shards) + '/' + SHARDS.length);
      checkAch();
    });
    host.appendChild(b);
  });

  // ───────────────────────── journal ─────────────────────────
  var jr = null, jrReturn = null;
  function quests(){
    var visited = Object.keys(PAGES).filter(function(p){ return S.pages[p]; }).length;
    return [
      { nm:'Walk the Portal',        d:'Visit every page of the site.',            n:visited, of:Object.keys(PAGES).length },
      { nm:'Survey Zyraxis',         d:'Discover every zone of the Zyraxis page.', n:zyraxisZones(), of:ZYRAXIS_ZONES.length },
      { nm:'Fill the Codex',         d:'Scan every card on the Zyraxis page.',     n:count(S.scans), of:SCAN_TOTAL },
      { nm:'Restore the Mothergem',  d:'Find the Shards hidden across the site. One per page — two on Zyraxis.', n:count(S.shards), of:SHARDS.length },
      { nm:'Answer the Call',        d:'Launch the Rizing Power beta.',            n:S.played ? 1 : 0, of:1 }
    ];
  }
  function tabHtml(tab){
    var L = levelOf(S.xp);
    if (tab === 'status') {
      return '<div class="gm-j-status"><div class="gm-save-gem big" aria-hidden="true"></div><div>' +
        '<div class="gm-j-big">LV ' + L.lv + ' · ' + esc(L.title.toUpperCase()) + '</div>' +
        '<div class="gm-xp-bar big"><i style="width:' + Math.round(L.pct*100) + '%"></i></div>' +
        '<p class="gm-j-dim">' + S.xp + ' XP' + (L.next ? ' · ' + (L.next - S.xp) + ' to next level' : ' · max level') + '</p></div></div>' +
        '<div class="gm-j-grid">' +
          '<div><span>PAGES</span><b>' + Object.keys(PAGES).filter(function(p){ return S.pages[p]; }).length + '/' + Object.keys(PAGES).length + '</b></div>' +
          '<div><span>ZONES</span><b>' + count(S.zones) + '</b></div>' +
          '<div><span>CODEX</span><b>' + count(S.scans) + '/' + SCAN_TOTAL + '</b></div>' +
          '<div><span>SHARDS</span><b>' + count(S.shards) + '/' + SHARDS.length + '</b></div>' +
          '<div><span>UNLOCKED</span><b>' + items.filter(isOpen).length + '/' + items.length + '</b></div>' +
          '<div><span>BUILD</span><b>' + esc(M.build || '—') + '</b></div></div>';
    }
    if (tab === 'quests') {
      return quests().map(function(q){
        var done = q.n >= q.of;
        return '<div class="gm-quest' + (done ? ' done' : '') + '"><div class="gm-q-top"><span class="gm-q-nm">' + (done ? '✓ ' : '▶ ') + esc(q.nm) + '</span>' +
          '<span class="gm-q-n">' + Math.min(q.n, q.of) + '/' + q.of + '</span></div><p>' + esc(q.d) + '</p>' +
          '<div class="gm-xp-bar"><i style="width:' + Math.round(Math.min(1, q.n / q.of) * 100) + '%"></i></div></div>';
      }).join('');
    }
    if (tab === 'trophies') {
      return '<div class="gm-trophies">' + ACH.map(function(a){
        var got = !!S.ach[a.id], hide = a.secret && !got;
        return '<div class="gm-trophy' + (got ? ' got' : '') + '"><span class="gm-t-i">' + (got ? '★' : '☆') + '</span><div>' +
          '<div class="gm-t-nm">' + (hide ? '???' : esc(a.name)) + '</div><p>' + esc(a.desc) + '</p></div></div>';
      }).join('') + '</div>';
    }
    if (tab === 'updates') {
      var sealed = items.filter(function(it){ return !isOpen(it); });
      return '<p class="gm-j-dim">The portal unlocks as the saga grows. ' + items.filter(isOpen).length + ' open · ' + sealed.length + ' still sealed.</p>' + patchHtml();
    }
    return '<div class="gm-settings">' +
      '<label><input type="checkbox" data-set="sound"' + (S.sound ? ' checked' : '') + '> SOUND EFFECTS</label>' +
      '<label><input type="checkbox" data-set="crt"' + (S.crt ? ' checked' : '') + '> CRT SCANLINES</label>' +
      '<p class="gm-j-dim">Your save lives only in this browser. Nothing is sent anywhere.</p>' +
      '<button type="button" class="btn ghost gm-reset">ERASE SAVE FILE</button></div>';
  }
  var TABS = [['status','STATUS'],['quests','QUESTS'],['trophies','TROPHIES'],['updates','UPDATES'],['options','OPTIONS']];
  function openJournal(tab){
    if (jr) { setTab(tab); return; }
    jrReturn = doc.activeElement;
    jr = el('div', 'gm-modal');
    jr.innerHTML = '<div class="gm-journal win" role="dialog" aria-modal="true" aria-label="Journal">' +
      '<div class="gm-j-head"><span>◆ JOURNAL</span><button type="button" class="gm-x" aria-label="Close journal">✕</button></div>' +
      '<div class="gm-tabs" role="tablist">' + TABS.map(function(t){ return '<button type="button" role="tab" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' +
      '<div class="gm-j-body" role="tabpanel"></div></div>';
    body.appendChild(jr);
    jr.addEventListener('click', function(e){
      if (e.target === jr || e.target.closest('.gm-x')) return closeJournal();
      var t = e.target.closest('[data-tab]'); if (t) { setTab(t.getAttribute('data-tab')); sfx.tick(); }
      if (e.target.closest('.gm-reset') && confirm('Erase your save file? XP, shards and trophies will be lost.')) {
        try { localStorage.removeItem(KEY); } catch(err){}
        location.href = location.pathname + '?newgame';
      }
    });
    jr.addEventListener('change', function(e){
      var k = e.target.getAttribute('data-set'); if (!k) return;
      S[k] = e.target.checked; save(); renderHud(); sfx.ok();
    });
    setTab(tab || 'quests');
    sfx.ok();
    requestAnimationFrame(function(){ jr.classList.add('in'); var f = jr.querySelector('[data-tab].on'); if (f) f.focus(); });
  }
  function setTab(tab){
    $all('[data-tab]', jr).forEach(function(b){ var on = b.getAttribute('data-tab') === tab; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    jr.querySelector('.gm-j-body').innerHTML = tabHtml(tab);
  }
  function closeJournal(){
    if (!jr) return;
    var j = jr; jr = null; j.classList.remove('in');
    setTimeout(function(){ j.remove(); }, 200);
    if (jrReturn && jrReturn.focus) jrReturn.focus();
  }

  // ───────────────────────── keyboard ─────────────────────────
  var KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'], kpos = 0;
  doc.addEventListener('keydown', function(e){
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === 'Escape' && jr) { closeJournal(); return; }
    if ((e.key === 'j' || e.key === 'J') && !e.metaKey && !e.ctrlKey && !e.altKey && !overlayOpen) { jr ? closeJournal() : openJournal('quests'); }
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    kpos = (k === KONAMI[kpos]) ? kpos + 1 : (k === KONAMI[0] ? 1 : 0);
    if (kpos === KONAMI.length) {
      kpos = 0;
      if (!S.konami) { S.konami = true; save(); body.classList.add('gm-flash'); setTimeout(function(){ body.classList.remove('gm-flash'); }, 700); gain(100, '↑↑↓↓←→←→BA'); checkAch(); }
    }
  });

  // ───────────────────────── warp between pages ─────────────────────────
  var warpEl = el('div', 'gm-warp', '<div class="gm-warp-t">LOADING<span>…</span></div>'); warpEl.setAttribute('aria-hidden', 'true'); body.appendChild(warpEl);
  function warp(href){
    if (!href) return;
    if (reduced()) { location.href = href; return; }
    warpEl.classList.add('on'); sfx.ok();
    setTimeout(function(){ location.href = href; }, 380);
  }
  doc.addEventListener('click', function(e){
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var u; try { u = new URL(a.href, location.href); } catch(err){ return; }
    if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash)) return;
    if (!/\.html$|\/$/.test(u.pathname)) return;
    e.preventDefault(); warp(u.href);
  });
  window.addEventListener('pageshow', function(){ warpEl.classList.remove('on'); });

  // ───────────────────────── title screen + unlock cutscene ─────────────────────────
  var overlayOpen = false, started = !isNew;
  function newUnlocks(){ return items.filter(function(it){ return isOpen(it) && !S.seen[it.id]; }); }

  function titleScreen(done){
    overlayOpen = true;
    var L = levelOf(S.xp);
    var t = el('div', 'gm-title');
    t.setAttribute('role', 'dialog'); t.setAttribute('aria-modal', 'true'); t.setAttribute('aria-label', 'Title screen');
    t.innerHTML = '<div class="gm-title-in">' +
      '<p class="gm-title-k">THE AOV SAGA · ANGELS OF VICES™</p>' +
      '<h2 class="gm-title-h">ZYRAXIS</h2>' +
      '<p class="gm-title-sub">THE PORTAL · ' + esc(M.build || '') + '</p>' +
      '<button type="button" class="gm-start">▶ ' + (isNew ? 'PRESS START' : 'CONTINUE · LV ' + L.lv) + '</button>' +
      '<p class="gm-title-f">' + items.filter(isOpen).length + ' UNLOCKED · ' + items.filter(function(i){ return !isOpen(i); }).length + ' SEALED · NEW CONTENT UNLOCKS WITH EVERY UPDATE</p>' +
      '</div>';
    body.appendChild(t); body.classList.add('gm-lock-scroll');
    var btn = t.querySelector('.gm-start');
    function go(){
      if (!overlayOpen) return;
      doc.removeEventListener('keydown', key);
      sfx.ok(); t.classList.add('out');
      setTimeout(function(){ t.remove(); body.classList.remove('gm-lock-scroll'); overlayOpen = false; done(); }, reduced() ? 0 : 500);
    }
    function key(e){ if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') { e.preventDefault(); go(); } }
    btn.addEventListener('click', go);
    t.addEventListener('click', function(e){ if (e.target === t) go(); });
    doc.addEventListener('keydown', key);
    requestAnimationFrame(function(){ t.classList.add('in'); btn.focus({ preventScroll:true }); });
  }

  function unlockScene(list, done){
    overlayOpen = true;
    var one = list.length === 1, it = list[0];
    var o = el('div', 'gm-unlock' + (one ? ' one' : ' many'));
    o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-label', 'New content unlocked');
    var lockSvg = '<svg class="gm-bigl" viewBox="0 0 64 72" aria-hidden="true"><path class="gm-shackle" d="M18 32 V20 a14 14 0 0 1 28 0 V32" fill="none" stroke-width="7"/>' +
      '<rect x="8" y="30" width="48" height="38" rx="3"/><rect x="29" y="42" width="6" height="14" class="gm-key"/></svg>';
    var inner;
    if (one) {
      inner = '<p class="gm-u-k">' + (KIND[it.kind] || 'CONTENT') + ' UNLOCKED</p>' +
        '<h2 class="gm-u-nm" style="--pc:' + (it.color || '#FFC83D') + '">' + esc(it.name.toUpperCase()) + '</h2>' +
        '<p class="gm-u-t">' + esc((it.title || '').toUpperCase()) + '</p>' +
        (it.blurb ? '<p class="gm-u-b">' + esc(it.blurb) + '</p>' : '');
    } else {
      inner = '<p class="gm-u-k">NEW CONTENT UNLOCKED</p><h2 class="gm-u-nm">×' + list.length + '</h2><ul class="gm-u-list">' +
        list.map(function(x, i){
          return '<li style="--d:' + (i * 0.22 + 1.1) + 's;--pc:' + (x.color || '#FFC83D') + '"><span class="gm-u-kind">' + (KIND[x.kind] || '') + '</span>' +
            '<b>' + esc(x.name) + '</b><i>' + esc(x.title || '') + '</i>' +
            (x.href ? '<a href="' + esc(x.href) + '">▶</a>' : '') + '</li>';
        }).join('') + '</ul>';
    }
    var here = one && it.href && it.href.replace(/\/$/, '') === path.replace(/\/$/, '');
    o.innerHTML = '<div class="gm-burst" aria-hidden="true"></div><div class="gm-u-in">' + lockSvg + '<div class="gm-u-card">' + inner +
      '<div class="gm-u-btns">' + (one && it.href && !here ? '<a class="btn" href="' + esc(it.href) + '">▶ ' + esc(it.cta || 'ENTER') + '</a>' : '') +
      '<button type="button" class="btn ghost gm-u-close">' + (one && it.href && !here ? 'LATER' : 'CONTINUE') + '</button></div>' +
      '<p class="gm-u-xp">+' + (30 * list.length) + ' XP</p></div></div>';
    body.appendChild(o); body.classList.add('gm-lock-scroll');
    list.forEach(function(x){ S.seen[x.id] = Date.now(); });
    S.xp += 30 * list.length; save();
    function close(){
      if (!overlayOpen) return;
      doc.removeEventListener('keydown', key);
      o.classList.add('out');
      setTimeout(function(){ o.remove(); body.classList.remove('gm-lock-scroll'); overlayOpen = false; renderHud(true); done && done(); }, reduced() ? 0 : 400);
    }
    function key(e){ if (e.key === 'Escape') close(); }
    o.querySelector('.gm-u-close').addEventListener('click', close);
    $all('a', o).forEach(function(a){ a.addEventListener('click', function(){ list.forEach(function(x){ if (x.href === a.getAttribute('href')) markOpened(x.id); }); }); });
    doc.addEventListener('keydown', key);
    requestAnimationFrame(function(){
      o.classList.add('in');
      setTimeout(function(){ sfx.unlock(); }, reduced() ? 0 : 900);
      setTimeout(function(){ o.querySelector('.gm-u-close').focus({ preventScroll:true }); }, reduced() ? 0 : 1200);
    });
  }

  // ───────────────────────── boot ─────────────────────────
  function arrive(){
    var firstVisit = !S.pages[PAGE];
    if (PAGES[PAGE] && firstVisit) { S.pages[PAGE] = Date.now(); save(); }
    var news = newUnlocks();
    var after = function(){
      started = true;
      if (!S.started) S.started = Date.now();
      S.last = Date.now(); save();
      renderHud();
      if (firstVisit && PAGES[PAGE]) gain(20, 'NEW AREA · ' + PAGES[PAGE].toUpperCase());
      checkAch();
    };
    var cutscene = function(){
      if (news.length) {
        if (!isNew) S.witnessed = true;
        unlockScene(news, after);
      } else after();
    };
    var wantTitle = isNew || (PAGE === 'home' && !sess('aov.title'));
    if (wantTitle) { sess('aov.title', '1'); titleScreen(cutscene); }
    else cutscene();
  }
  renderHud();
  arrive();
})();
