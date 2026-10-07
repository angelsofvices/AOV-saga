// ★ 2026-10-07 · THEME · the eight gem crystals on cosmic black.
// Adds the pulsing gem-tinted star layer and the eight-gem crown on each cover.
// Pure decoration: remove this file (and site-theme.css) to fall back to the guidebook look.
(function(){
  var GEMS = [
    ['Ruby','var(--ruby)','var(--ruby-hi)'], ['Sapphire','var(--sapphire)','var(--sapphire-hi)'],
    ['Emerald','var(--emerald)','var(--emerald-hi)'], ['Citrine','var(--citrine)','var(--citrine-hi)'],
    ['Pearl','var(--pearl)','var(--pearl-hi)'], ['Amber','var(--amber)','var(--amber-hi)'],
    ['Amethyst','var(--amethyst)','var(--amethyst-hi)'], ['Onyx','var(--onyx-hi)','#E4E0EC']
  ];
  var TINTS = ['#ffffff','#ffffff','#ffffff','#FF7A9C','#8FB4FF','#7FF0B8','#FFE694','#FFC58A','#D2B4FF'];

  var field = document.querySelector('.starfield');
  if (field && !field.querySelector('.gem-stars')) {
    var layer = document.createElement('div');
    layer.className = 'gem-stars';
    var n = window.innerWidth < 700 ? 60 : 120, html = '';
    for (var i = 0; i < n; i++) {
      var s = Math.random() < 0.85 ? (1 + Math.random() * 1.4) : (2.2 + Math.random() * 1.3);
      var c = TINTS[Math.floor(Math.random() * TINTS.length)];
      html += '<i' + (s > 2.4 ? ' class="x"' : '') + ' style="left:' + (Math.random() * 100).toFixed(2) + '%;top:' + (Math.random() * 100).toFixed(2) +
        '%;--s:' + s.toFixed(1) + 'px;--c:' + c + ';--d:' + (2.5 + Math.random() * 5).toFixed(1) + 's;--w:-' + (Math.random() * 7).toFixed(1) + 's"></i>';
    }
    layer.innerHTML = html;
    field.appendChild(layer);
  }

  // ── the eight-gem crown · pick a gem and the site's lines take its colour; pick it again for all eight ──
  var KEY = 'aov-theme-gem';
  function stored(){ try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
  function store(v){ try { if (v) localStorage.setItem(KEY, v); else localStorage.removeItem(KEY); } catch (e) {} }
  function apply(name, flash){
    var root = document.documentElement, g = null;
    GEMS.forEach(function(x){ if (x[0] === name) g = x; });
    if (g) {
      root.setAttribute('data-gem', g[0].toLowerCase());
      root.style.setProperty('--gem-c', g[1]);
      root.style.setProperty('--gem-hi', g[2]);
    } else {
      root.removeAttribute('data-gem');
      root.style.removeProperty('--gem-c');
      root.style.removeProperty('--gem-hi');
    }
    var row = document.querySelector('.gemrow');
    if (row) {
      row.classList.toggle('picked', !!g);
      row.querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.gem === (g ? g[0] : '') ? 'true' : 'false'); });
      var hint = document.querySelector('.gemhint');
      if (hint) hint.textContent = g ? g[0] + ' leads · tap it again for all eight' : 'Tap a gem to make it lead';
    }
    if (flash && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.remove('gem-flash'); void root.offsetWidth; root.classList.add('gem-flash');
      setTimeout(function(){ root.classList.remove('gem-flash'); }, 650);
    }
  }

  var cover = document.querySelector('.cover .col');
  if (cover && !cover.querySelector('.gemrow')) {
    var ul = document.createElement('ul');
    ul.className = 'gemrow';
    ul.setAttribute('aria-label', 'The eight gems · pick one to colour the site');
    ul.innerHTML = GEMS.map(function(g, i){
      return '<li style="--c:' + g[1] + ';--w:' + (i * 0.5) + 's"><button type="button" data-gem="' + g[0] + '" aria-pressed="false" title="' + g[0] + '">' +
        '<span class="gx"></span><span class="gn">' + g[0] + '</span></button></li>';
    }).join('');
    var hint = document.createElement('p');
    hint.className = 'gemhint';
    var after = cover.querySelector('.covertags') || cover.querySelector('h1');
    if (after) { after.insertAdjacentElement('afterend', ul); ul.insertAdjacentElement('afterend', hint); }
    else { cover.appendChild(ul); cover.appendChild(hint); }
    ul.addEventListener('click', function(e){
      var b = e.target.closest('button[data-gem]'); if (!b) return;
      var next = b.getAttribute('aria-pressed') === 'true' ? '' : b.dataset.gem;
      store(next); apply(next, true);
    });
  }
  apply(stored(), false);
})();
