/* ★ 2026-10-08 · THE ASTRALITE MATRIX · interactive 9 × 7 table for the Macro Book (Part 07).
   Canon only — nothing here is invented to fill a cell:
   · names, symbols, families, roles, colours, energy 1–7 ......... rp7b.html ASTRALITE_FAMILIES (mainline build)
   · tier bands + art ............................................ rp7b.html ASTRALITE_GEM_SHEETS (tier-1-core … tier-7-mythic)
   · recovery odds 40/21/15/11/7/4/2 % · stone family by position .. rp7b.html recoverAstraliteMaterial()
   · the five compounds + their stat gains ....................... rp7b.html ASTRALITE_COMPOUNDS / _COMPOUND_EFFECTS
   · relic-bearing signatures (Prismshard anchors, names withheld) . rp7b.html PRISMSHARD_FAMILY
   · family meaning, core aliases, Aenor + Dispersal Era ......... data/AOV_SAGA_DEFINITIVE_CANON_HANDOFF.md §2.4, §3
   · family verbs ................................................ rp8.html ASTRALITE_FAMILIES (role)
   · world signatures (core / primary / present) ................. aethryx.html CODEX_ENRICH (Master Codex v13.17)
   · Aethric Convergence ......................................... aethryx.html
   · Cognara on Arborynth · Synthara on Cytherion ................ docs/card-explorer/03_ENVIRONMENTS.md
   The definitive handoff says: do not invent unnamed Astralite functions. Where canon is
   silent the entry says so, in the book's own voice. */
(() => {
  const root = document.getElementById('astralite-matrix');
  if (!root) return;

  const TIERS = [
    null,
    { band:'Core',      odds:40 },
    { band:'Major I',   odds:21 },
    { band:'Major II',  odds:15 },
    { band:'Major III', odds:11 },
    { band:'Minor I',   odds:7  },
    { band:'Minor II',  odds:4  },
    { band:'Mythic',    odds:2  },
  ];

  const FAMILIES = [
    { id:1, name:'Creation',     role:'Spark',     axis:'Creation / Origin',          verb:'initiates',   color:'#ffd66b', alias:'Prime Gas · Aethryxeon',
      items:[['Ax-1','Aethryx Prime'],['Gn','Genesis Core'],['Cr','Creatrix'],['Em','Embryonix'],['St','Stellarion'],['Ph','Primordial Hollow'],['Ex','Ex Nihilo Shard']] },
    { id:2, name:'Past',         role:'Record',    axis:'Past / Memory',              verb:'preserves',   color:'#bc83ff', alias:'Mnemos Core',
      items:[['Ax-2','Mnemosyne Aethra'],['Rc','Recallite'],['Ec','Echo Crystal'],['Tr','Time Residue'],['Il','Illuminor'],['Pz','Phasedust'],['Om','Omnicrecord']] },
    { id:3, name:'Destruction',  role:'Release',   axis:'Destruction / Release',      verb:'clears',      color:'#ff6848', alias:'Pyroclast',
      items:[['Ax-3','Pyroclast Aethra'],['Ig','Ignis Core'],['Dn','Detonite'],['Ru','Ruin Shard'],['Af','Abyssal Flare'],['Rs','Riftstone'],['Oh','Oblivion Heart']] },
    { id:4, name:'Mind',         role:'Think',     axis:'Mind / Thought',             verb:'understands', color:'#65e3ff', alias:'Cognara',
      items:[['Ax-4','Cognara'],['Mg','Mindglass'],['Nl','Neuralite'],['Pc','Psycore'],['Tb','Thought Bind'],['Iv','Idea Veil'],['Ao','Auramind Core']] },
    { id:5, name:'Present',      role:'Balance',   axis:'Present / Balance',          verb:'sustains',    color:'#68ef91', alias:'Viridion',
      items:[['Ax-5','Viridion Prime'],['Eq','Equilibris'],['Cf','Coreflux'],['Vb','Vitae Balance'],['Tc','True Balance Crystal'],['Wr','Worldroot'],['Pv','Primordial Verdant']] },
    { id:6, name:'Preservation', role:'Endure',    axis:'Preservation / Endure',      verb:'protects',    color:'#ffc85c', alias:'Fortaris',
      items:[['Ax-6','Fortaris'],['Sh','Stoneheart'],['An','Anchorite'],['Bc','Bastion Core'],['Vs','Vital Shell'],['Pr','Protectionite'],['Ic','Imperisis Core']] },
    { id:7, name:'Body',         role:'Form',      axis:'Body / Form',                verb:'contains',    color:'#ff79ae', alias:'Corporex',
      items:[['Ax-7','Corporex'],['Fs','Fleshstone'],['Dc','Density Core'],['Gv','Gravite'],['Dx','Durexion'],['Hd','Hardetite'],['Px','Phoenix Shell']] },
    { id:8, name:'Future',       role:'Build',     axis:'Future / Systems / Build',   verb:'creates',     color:'#72bfff', alias:'Synthara',
      items:[['Ax-8','Synthara'],['Me','Mechite'],['Gr','Gridstone'],['Dc','Datacore'],['Ps','Protostar Core'],['Nc','Nexus Chip'],['Sx','Synapse Prime']] },
    { id:9, name:'Spirit',       role:'Transcend', axis:'Spirit',                     verb:'elevates',    color:'#d796ff', alias:'Astryx Soul',
      items:[['Ax-9','Astryx Soul'],['Sp','Spirit Gem'],['Ec','Ethereal Core'],['Sf','Soulfract'],['Tc','Transcendent'],['LS','Luminal Soul'],['Ah','Astral Heart']] },
  ];

  // world signatures · Master Codex v13.17 (aethryx.html). Core = the world cores this family.
  const WORLDS = {
    1:{core:['Origon'],   primary:['Gravaron'],                                      present:['Draevos','Kyrathos','Uralyx','Wyvera','Ferros']},
    2:{core:['Lumeria'],  primary:['Nexyros'],                                       present:['Arborynth','Myraclese','Yvoris','Ignara','Wyvera','Elythera','Xylos']},
    3:{core:['Pyrauna'],  primary:['Draevos','Bellatora','Velkryn','Ignara','Wyvera'], present:['Zyraxis','Nexyros','Sylvanir','Gravaron','Ferros']},
    4:{core:['Arborynth'],primary:['Yvoris','Xylos'],                                present:['Quorauna','Cytherion','Jynaera','Ignara','Halcyra','Elythera']},
    5:{core:['Zyraxis'],  primary:['Halcyra','Rhyzor'],                              present:['Lumeria','Thallassar','Yvoris','Sylvanir']},
    6:{core:['Arborynth'],primary:['Myraclese','Sylvanir','Elythera'],               present:['Origon','Quorauna','Cytherion','Kyrathos','Uralyx','Rhyzor','Viridia']},
    7:{core:['Quorauna'], primary:['Viridia'],                                       present:['Draevos','Thallassar','Pyrauna','Bellatora','Nexyros','Halcyra','Xylos']},
    8:{core:['Cytherion'],primary:['Jynaera','Ferros'],                              present:['Pyrauna','Myraclese','Bellatora','Velkryn','Rhyzor','Gravaron']},
    9:{core:[],           primary:['Thallassar','Kyrathos','Uralyx'],                present:['Origon','Lumeria','Zyraxis','Jynaera','Velkryn','Viridia']},
  };

  // the five compounds · Experiment Table · rp7b.html
  const COMPOUNDS = [
    { a:1, b:2, name:'Potential',      gain:'SPECIAL' },
    { a:3, b:6, name:'Transformation', gain:'ATK + DEF' },
    { a:4, b:7, name:'Will',           gain:'ATK + SPECIAL' },
    { a:5, b:9, name:'Ascension',      gain:'HP + SPECIAL' },
    { a:5, b:8, name:'Innovation',     gain:'SPEED + DEF' },
  ];

  // relic-bearing signatures · the Sixteen condensed from these (relic names stay in the game)
  const RELIC = new Set(['1-1','7-1','2-1','5-1','3-1','4-1','9-1','8-7','6-7','3-7','4-7','5-7']);
  const RELIC_QUOTA = {1:1,2:2,3:2,4:2,5:2,6:2,7:2,8:2,9:1};

  // a few Astralites the canon speaks about by name
  const NOTES = {
    '1-1':['The Aethric Convergence', 'Every seven to ten years, when the planets align across the orbital spires, Ax-1 becomes hyper-pure and power spikes across all life. Some call it amplification. Some call it judgment.'],
    '4-1':['On Arborynth', 'Arborynth cores Cognara. In the Living Master Codex, sampling a Cognara core briefly reveals the map around you.'],
    '8-1':['On Cytherion', 'Cytherion cores Synthara, under a self-replicating Grid. In the Living Master Codex, Synthara lets Carl’s ship tools read the Grid and find the route to its centre.'],
    '5-1':['On Zyraxis', 'Zyraxis is the world that cores Viridion. Its full signature reads Present, Destruction and Spirit.'],
  };

  const fam = id => FAMILIES[id - 1];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const art = (f, e) => `assets/2D%20sprites/items/astralites/thumbs/astralite-${f}-${e}.webp`;
  const list = a => a.length ? a.map(esc).join(' · ') : '—';

  // ───────── build the grid ─────────
  let html = '<div class="axm-scroll"><div class="axm-grid" role="grid" aria-label="The Astralite Matrix · nine families by seven grades">';
  html += '<div class="axm-corner" role="columnheader"><span>GRADE</span><span>FAMILY →</span></div>';
  FAMILIES.forEach(f => {
    html += `<button type="button" class="axm-fam" role="columnheader" data-fam="${f.id}" style="--fc:${f.color}" aria-label="${esc(f.name)} family">
      <b>${f.id}</b><span>${esc(f.name)}</span><i>${esc(f.role)}</i></button>`;
  });
  for (let e = 1; e <= 7; e++) {
    const t = TIERS[e];
    html += `<button type="button" class="axm-tier" role="rowheader" data-tier="${e}" aria-label="Grade ${e} · ${t.band}"><b>${e}</b><span>${t.band}</span><i>${t.odds}%</i></button>`;
    FAMILIES.forEach(f => {
      const [sym, name] = f.items[e - 1];
      const key = `${f.id}-${e}`;
      html += `<button type="button" class="axm-cell${RELIC.has(key) ? ' relic' : ''}" role="gridcell" data-key="${key}" data-fam="${f.id}" data-tier="${e}"
        style="--fc:${f.color}" aria-label="${esc(name)} · ${esc(sym)} · ${esc(f.name)} grade ${e}" title="${esc(name)}">
        <img src="${art(f.id, e)}" alt="" loading="lazy" width="80" height="80"><span class="axm-sym">${esc(sym)}</span></button>`;
    });
  }
  html += '</div></div>';
  html += `<div class="axm-foot">
      <button type="button" class="axm-64" data-key="64" aria-label="The sixty-fourth"><span>?</span></button>
      <p class="axm-legend"><span class="axm-dot"></span> relic-bearing signature &nbsp;·&nbsp; % = share of stone finds at that grade &nbsp;·&nbsp; select any cell, family or grade</p>
    </div>
    <div class="axm-detail" aria-live="polite"></div>`;
  root.innerHTML = html;

  const detail = root.querySelector('.axm-detail');
  const cells = Array.from(root.querySelectorAll('.axm-cell'));

  function compoundsFor(fid) {
    return COMPOUNDS.filter(c => c.a === fid || c.b === fid).map(c => {
      const other = fam(c.a === fid ? c.b : c.a);
      return `<li><button type="button" class="axm-chip" data-fam="${other.id}" style="--fc:${other.color}">${esc(other.name)}</button>
        <span>→ <b>${c.name} Core</b> · permanent ${c.gain}</span></li>`;
    }).join('');
  }
  function worldsBlock(fid) {
    const w = WORLDS[fid];
    return `<dl class="axm-worlds">
      <div><dt>CORES ON</dt><dd>${list(w.core)}</dd></div>
      <div><dt>PRIMARY SIGNATURE</dt><dd>${list(w.primary)}</dd></div>
      <div><dt>ALSO PRESENT</dt><dd>${list(w.present)}</dd></div></dl>`;
  }

  function showCell(key) {
    const [fid, e] = key.split('-').map(Number);
    const f = fam(fid), t = TIERS[e], [sym, name] = f.items[e - 1];
    const comp = compoundsFor(fid);
    const note = NOTES[key];
    detail.style.setProperty('--fc', f.color);
    detail.innerHTML = `
      <div class="axm-head">
        <img class="axm-art" src="${art(fid, e)}" alt="${esc(name)}" width="120" height="120">
        <div>
          <p class="axm-k">FAMILY ${fid} · ${esc(f.name.toUpperCase())} · ${esc(f.role.toUpperCase())}</p>
          <h3 class="axm-nm">${esc(name)}</h3>
          <p class="axm-sub"><span class="axm-symbig">${esc(sym)}</span> Grade ${e} of 7 · ${t.band} · ${t.odds}% of finds${RELIC.has(key) ? ' · <b class="axm-relic">Relic-bearing</b>' : ''}</p>
        </div>
      </div>
      <div class="axm-cols">
        <section><h4>WHAT IT DOES</h4>
          <p>A ${esc(f.name)} signature: ${esc(f.axis)}, the family that <b>${f.verb}</b>. In Rizing Power it is Matrix material — kept in the ZyCube’s Astralites tab and spent at the <b>Experiment Table</b> in the Rizer Room, upstairs at home.</p>
          ${comp ? `<p>Fuse it with another family to synthesize a Core:</p><ul class="axm-comp">${comp}</ul>
          <p class="axm-small">A Core is as strong as its weaker Astralite — this one forges grade-${e} Cores or lower.</p>` : `<p class="axm-small">${esc(f.name)} has no compound recorded at the Experiment Table yet.</p>`}
        </section>
        <section><h4>WHERE IT IS FOUND</h4>
          <p><b>On Zyraxis:</b> inside Astralite stones in all ten districts, densest around Malezor. Each stone always yields the same family; when it breaks, the grade is rolled — ${/^[AEIOU]/.test(name) ? 'an' : 'a'} ${esc(name)} turns up in ${t.odds}% of ${esc(f.name)} finds. Shattering a stone also restores half your Special Energy.</p>
          <p><b>Across the Expanse:</b></p>${worldsBlock(fid)}
        </section>
      </div>
      <section class="axm-lore"><h4>LORE</h4>
        ${note ? `<p><b>${esc(note[0])}.</b> ${esc(note[1])}</p>` : ''}
        ${e === 1 ? `<p>The core of its family, recorded in the oldest ledgers as <b>${esc(f.alias)}</b>. Every other ${esc(f.name)} signature sits on top of it.</p>` : ''}
        ${RELIC.has(key) ? `<p>One of the Sixteen — the oldest objects in existence — condensed from this signature. Which one, the book does not say.</p>` : ''}
        <p>Like every Astralite, it came out of Aenor in the eruption fifteen billion years ago and spread through the young Expanse in the Dispersal Era, before the first planet held still.</p>
        ${(!note && e !== 1) ? `<p class="axm-small">The field record lists its name, mark and grade. The rest is yours to find.</p>` : ''}
      </section>`;
  }

  function showFamily(fid) {
    const f = fam(fid);
    detail.style.setProperty('--fc', f.color);
    detail.innerHTML = `
      <div class="axm-head">
        <div class="axm-fambadge"><b>${fid}</b></div>
        <div>
          <p class="axm-k">FAMILY ${fid} OF 9 · ${esc(f.role.toUpperCase())}</p>
          <h3 class="axm-nm">${esc(f.name)}</h3>
          <p class="axm-sub">${esc(f.axis)} · the family that <b>${f.verb}</b> · core: ${esc(f.items[0][1])} (${esc(f.alias)})</p>
        </div>
      </div>
      <div class="axm-strip">${f.items.map((it, i) => `<button type="button" class="axm-mini" data-key="${fid}-${i + 1}" title="${esc(it[1])}"><img src="${art(fid, i + 1)}" alt="" width="56" height="56"><span>${esc(it[0])}</span></button>`).join('')}</div>
      <div class="axm-cols">
        <section><h4>COMPOUNDS</h4>${compoundsFor(fid) ? `<ul class="axm-comp">${compoundsFor(fid)}</ul>` : '<p class="axm-small">No compound recorded yet.</p>'}
          <h4>RELICS</h4><p>The Sixteen are shared across the families: ${RELIC_QUOTA[fid] === 1 ? 'the first and last families shed one each' : 'every family between the first and the last sheds two'} — ${esc(f.name)}’s share is <b>${RELIC_QUOTA[fid]}</b>.</p></section>
        <section><h4>ACROSS THE EXPANSE</h4>${worldsBlock(fid)}</section>
      </div>`;
  }

  function showTier(e) {
    const t = TIERS[e];
    detail.style.removeProperty('--fc');
    detail.innerHTML = `
      <div class="axm-head"><div class="axm-fambadge"><b>${e}</b></div>
        <div><p class="axm-k">GRADE ${e} OF 7</p><h3 class="axm-nm">${t.band}</h3>
        <p class="axm-sub">${t.odds}% of every Astralite stone find lands on this grade</p></div></div>
      <div class="axm-strip">${FAMILIES.map(f => `<button type="button" class="axm-mini" data-key="${f.id}-${e}" title="${esc(f.items[e - 1][1])}" style="--fc:${f.color}"><img src="${art(f.id, e)}" alt="" width="56" height="56"><span>${esc(f.items[e - 1][0])}</span></button>`).join('')}</div>
      <p>Grade is depth within a family: one is its core, seven its mythic peak. When a stone breaks, its family is fixed by where it stands and the grade is rolled — forty in a hundred finds are cores, two in a hundred are mythic. A Core forged at the Experiment Table takes the lower grade of its two Astralites.</p>`;
  }

  function show64() {
    detail.style.removeProperty('--fc');
    detail.innerHTML = `<div class="axm-head"><div class="axm-fambadge"><b>?</b></div>
      <div><p class="axm-k">OUTSIDE THE GRID</p><h3 class="axm-nm">The Sixty-Fourth</h3>
      <p class="axm-sub">Not discussed in polite company</p></div></div>
      <p>Nine by seven is one full matrix. There is a sixty-fourth signature, and it does not sit in it.</p>`;
  }

  // ───────── selection ─────────
  function clearSel() {
    root.querySelectorAll('.sel,.lit').forEach(n => n.classList.remove('sel', 'lit'));
    root.querySelectorAll('[aria-pressed]').forEach(n => n.setAttribute('aria-pressed', 'false'));
    root.querySelector('.axm-grid').classList.remove('dim');
  }
  function select(kind, val, focus) {
    clearSel();
    const grid = root.querySelector('.axm-grid');
    if (kind === 'cell') {
      const c = root.querySelector(`.axm-cell[data-key="${val}"]`);
      c.classList.add('sel'); c.setAttribute('aria-pressed', 'true');
      cells.forEach(x => x.tabIndex = -1); c.tabIndex = 0;
      if (focus) c.focus();
      showCell(val);
    } else if (kind === 'fam') {
      grid.classList.add('dim');
      root.querySelectorAll(`[data-fam="${val}"]`).forEach(n => n.classList.add('lit'));
      root.querySelector(`.axm-fam[data-fam="${val}"]`).setAttribute('aria-pressed', 'true');
      showFamily(+val);
    } else if (kind === 'tier') {
      grid.classList.add('dim');
      root.querySelectorAll(`.axm-cell[data-tier="${val}"],.axm-tier[data-tier="${val}"]`).forEach(n => n.classList.add('lit'));
      root.querySelector(`.axm-tier[data-tier="${val}"]`).setAttribute('aria-pressed', 'true');
      showTier(+val);
    } else {
      root.querySelector('.axm-64').classList.add('sel');
      show64();
    }
  }

  root.addEventListener('click', ev => {
    const t = ev.target.closest('button'); if (!t || !root.contains(t)) return;
    if (t.classList.contains('axm-cell') || t.classList.contains('axm-mini')) select('cell', t.dataset.key);
    else if (t.classList.contains('axm-fam') || t.classList.contains('axm-chip')) select('fam', t.dataset.fam);
    else if (t.classList.contains('axm-tier')) select('tier', t.dataset.tier);
    else if (t.classList.contains('axm-64')) select('64');
  });
  // arrow keys move through the 63 like a real grid
  root.querySelector('.axm-grid').addEventListener('keydown', ev => {
    const c = ev.target.closest('.axm-cell'); if (!c) return;
    const d = {ArrowLeft:[-1,0], ArrowRight:[1,0], ArrowUp:[0,-1], ArrowDown:[0,1]}[ev.key]; if (!d) return;
    ev.preventDefault();
    const f = Math.min(9, Math.max(1, +c.dataset.fam + d[0])), e = Math.min(7, Math.max(1, +c.dataset.tier + d[1]));
    select('cell', `${f}-${e}`, true);
  });

  cells.forEach((c, i) => c.tabIndex = i === 0 ? 0 : -1);
  select('cell', '1-1');
})();
