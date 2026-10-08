/* ★ 2026-10-08 · THE CODEX · renderer for zyrex-codex.html.
   Reads window.ZYREX_CODEX (zyrex-codex-data.js) and builds the roster with search,
   type / district / game filters and an entry panel. Works with an empty roster. */
(() => {
  const root = document.getElementById('codex-roster');
  if (!root) return;
  const DATA = (window.ZYREX_CODEX || []).slice().sort((a, b) => (a.no || 0) - (b.no || 0));

  // the 21 canon types and their locked colours · data/TYPE_COLORS_V1.json
  const TYPES = { Beast:'#593522', Creature:'#CAB32C', Humanoid:'#B29D74', Draconic:'#D70024', Nature:'#1F7841', Verdant:'#4BDA32',
    Aquatic:'#087EE1', Elemental:'#DA6404', Crystal:'#86C4D9', Tech:'#1843AA', Extraterrestrial:'#99FABC', Spirit:'#565099',
    Aura:'#FFAA3B', Astral:'#3D365B', Radiant:'#FBA6B6', Divine:'#FFFFFF', Corrupted:'#44037D', Chrono:'#606060', Unknown:'#030002',
    Ultramax:'#7E1C7A', Ultimate:'#FFD401' };
  const DISTRICTS = ['Malezor','Zarvane','Andrannor','Veridan','Netharion','Vorashil','Xilnar','Baelgor','Thardin','Korathen'];
  const GAMES = ['RP7B','RP7D'];

  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const pad = n => String(n || 0).padStart(3, '0');
  const chip = t => `<span class="zx-type" style="--c:${TYPES[t] || '#888'}"><i></i>${esc(t)}</span>`;
  const state = { q:'', type:'', district:'', game:'' };

  root.innerHTML = `
    <div class="zx-tools">
      <label class="zx-search"><span>SEARCH</span><input type="search" placeholder="Name or number" autocomplete="off" aria-label="Search the Codex"></label>
      <label class="zx-sel"><span>DISTRICT</span><select data-f="district"><option value="">All ten</option>${DISTRICTS.map(d => `<option>${d}</option>`).join('')}</select></label>
      <label class="zx-sel"><span>GAME</span><select data-f="game"><option value="">RP7B + RP7D</option>${GAMES.map(g => `<option>${g}</option>`).join('')}</select></label>
    </div>
    <div class="zx-types" role="group" aria-label="Filter by type">
      ${Object.keys(TYPES).map(t => `<button type="button" class="zx-tf" data-type="${t}" aria-pressed="false" style="--c:${TYPES[t]}"><i></i>${t}</button>`).join('')}
    </div>
    <p class="zx-count" aria-live="polite"></p>
    <div class="zx-grid"></div>
    <div class="zx-entry" hidden></div>`;

  const grid = root.querySelector('.zx-grid'), count = root.querySelector('.zx-count'), entry = root.querySelector('.zx-entry');

  function match(z){
    const q = state.q.trim().toLowerCase();
    if (q && !(String(z.name || '').toLowerCase().includes(q) || pad(z.no).includes(q.replace(/^#/, '')))) return false;
    if (state.type && !(z.types || []).includes(state.type)) return false;
    if (state.district && !(z.districts || []).includes(state.district)) return false;
    if (state.game && !(z.games || []).includes(state.game)) return false;
    return true;
  }

  function render(){
    if (!DATA.length) {
      count.textContent = '0 RECORDED';
      grid.innerHTML = `<div class="zx-empty">
        <div class="zx-empty-gem" aria-hidden="true"></div>
        <p class="zx-empty-k">THE ROSTER IS BEING CATALOGUED</p>
        <p>Every catchable Zyrex in RP7B and RP7D will be recorded here — over two hundred of them, one entry each. Search and filters are ready for them.</p>
      </div>`;
      return;
    }
    const list = DATA.filter(match);
    count.textContent = list.length === DATA.length ? `${DATA.length} RECORDED` : `SHOWING ${list.length} OF ${DATA.length}`;
    grid.innerHTML = list.length ? list.map(z => `
      <button type="button" class="zx-card" data-no="${z.no}" style="--c:${TYPES[(z.types || [])[0]] || 'var(--gold)'}">
        <span class="zx-no">#${pad(z.no)}</span>
        ${z.art ? `<img src="${esc(z.art)}" alt="" loading="lazy">` : '<span class="zx-sil" aria-hidden="true"></span>'}
        <span class="zx-nm">${esc(z.name)}</span>
        <span class="zx-ty">${(z.types || []).map(chip).join('')}</span>
      </button>`).join('') : '<p class="zx-none">No Zyrex match those filters.</p>';
  }

  function open(no){
    const z = DATA.find(x => String(x.no) === String(no)); if (!z) return;
    const row = (k, v) => v ? `<div><dt>${k}</dt><dd>${v}</dd></div>` : '';
    entry.hidden = false;
    entry.style.setProperty('--c', TYPES[(z.types || [])[0]] || 'var(--gold)');
    entry.innerHTML = `
      <div class="zx-e-head">
        ${z.art ? `<img src="${esc(z.art)}" alt="${esc(z.name)}">` : '<span class="zx-sil big" aria-hidden="true"></span>'}
        <div><p class="zx-e-k">CODEX #${pad(z.no)}</p><h3 class="zx-e-nm">${esc(z.name)}</h3><p>${(z.types || []).map(chip).join('')}</p></div>
        <button type="button" class="zx-x" aria-label="Close entry">×</button>
      </div>
      <dl class="zx-facts">
        ${row('FOUND IN', (z.districts || []).map(esc).join(' · '))}
        ${row('CATCHABLE IN', (z.games || []).map(esc).join(' · '))}
        ${row('STAGE', z.stage ? esc(z.stage) : '')}
        ${row('EVOLVES FROM', esc(z.evolvesFrom || ''))}
        ${row('EVOLVES INTO', (z.evolvesTo || []).map(esc).join(' · '))}
      </dl>
      ${z.lore ? `<p class="zx-lore">${esc(z.lore)}</p>` : ''}`;
    entry.scrollIntoView({ behavior:'smooth', block:'nearest' });
  }

  root.addEventListener('input', e => { if (e.target.type === 'search') { state.q = e.target.value; render(); } });
  root.addEventListener('change', e => { const f = e.target.dataset.f; if (f) { state[f] = e.target.value; render(); } });
  root.addEventListener('click', e => {
    const tf = e.target.closest('.zx-tf');
    if (tf) {
      state.type = state.type === tf.dataset.type ? '' : tf.dataset.type;
      root.querySelectorAll('.zx-tf').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.type === state.type)));
      root.querySelector('.zx-types').classList.toggle('picked', !!state.type);
      render(); return;
    }
    const card = e.target.closest('.zx-card'); if (card) { open(card.dataset.no); return; }
    if (e.target.closest('.zx-x')) { entry.hidden = true; }
  });

  document.querySelectorAll('[data-codex-count]').forEach(n => { n.textContent = DATA.length; });
  render();
})();
