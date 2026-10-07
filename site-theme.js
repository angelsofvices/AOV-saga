// ★ 2026-10-07 · THEME · the eight gem crystals on cosmic black.
// Adds the pulsing gem-tinted star layer and the eight-gem crown on each cover.
// Pure decoration: remove this file (and site-theme.css) to fall back to the guidebook look.
(function(){
  var GEMS = [
    ['Ruby','var(--ruby)'], ['Sapphire','var(--sapphire)'], ['Emerald','var(--emerald)'], ['Citrine','var(--citrine)'],
    ['Pearl','var(--pearl)'], ['Amber','var(--amber)'], ['Amethyst','var(--amethyst)'], ['Onyx','var(--onyx-hi)']
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

  var cover = document.querySelector('.cover .col');
  if (cover && !cover.querySelector('.gemrow')) {
    var ul = document.createElement('ul');
    ul.className = 'gemrow';
    ul.setAttribute('aria-label', 'The eight gems');
    ul.innerHTML = GEMS.map(function(g, i){
      return '<li style="--c:' + g[1] + ';--w:' + (i * 0.5) + 's"><span class="gx"></span><span class="gn">' + g[0] + '</span></li>';
    }).join('');
    var after = cover.querySelector('.covertags') || cover.querySelector('h1');
    if (after) after.insertAdjacentElement('afterend', ul); else cover.appendChild(ul);
  }
})();
