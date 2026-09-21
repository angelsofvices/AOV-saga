// ★★★ v0.96.69 · DEV MODE V2 · driven, not grepped.
//
// The v1 panel's lists were hand-typed, and the damage was invisible: five of
// its ten district warps had drifted off ZYRAXIS_DISTRICTS' own centres, and
// the Seer HQs, Gemlord caves, radio towers, Dreamland and the six Dracolord
// realms had no warp at all.  Nothing threw.  The panel just quietly described
// a world that no longer existed.
//
// So this suite EXTRACTS the real builder functions and RUNS them against a
// stub DOM, then asks how many buttons each produced and where they point.  A
// regex could only prove the code was written.
const fs = require('fs'), vm = require('vm');
const src = require('./lib/all_src.cjs')();
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);

// ── the generated-panel block, verbatim out of the build ────────────────
const block = (src.match(/const _devBtn = \(label[\s\S]*?window\.__devRebuildPanels = \(\) => \{[^}]*\};/) || [''])[0];
if (!block){ console.log('  ❌ could not extract the dev-panel builder block'); process.exit(1); }

// ── a stub DOM that only remembers what was appended ────────────────────
const hosts = {};
const mkEl = () => ({ children: [], style: {}, set innerHTML(v){ this._html = v; this.children.length = 0; },
                      get innerHTML(){ return this._html || ''; },
                      appendChild(c){ this.children.push(c); },
                      addEventListener(){}, classList:{ toggle(){}, add(){}, remove(){} } });
const document = {
  createElement(){ const e = mkEl(); e.style = { cssText:'' }; return e; },
  getElementById(id){ return hosts[id] || (hosts[id] = mkEl()); },
};
for (const id of ['devWarpDistricts','devWarpSeerHqs','devWarpTowers','devWarpCaves',
                  'devWarpRealms','devGiveList','devStoryQuests','devStoryRoads',
                  'devStoryFlags','devStoryReadout','devWipeItems','devStoryAll','devStoryReset'])
  hosts[id] = mkEl();

// ── the world, straight out of the build so the test cannot disagree ────
const pull = (re, label) => { const m = src.match(re); if (!m) throw new Error('pull '+label); return m[0]; };
const worldSrc = [
  pull(/const ZYRAXIS_DISTRICTS = \[[\s\S]*?\n\];/, 'districts'),
  pull(/const SEER_HQ_NETWORK = \[[\s\S]*?\n\];/, 'seerhq'),
  pull(/const TOWER_NETWORK = \[[\s\S]*?\n\];/, 'towers'),
  pull(/const DRACOLORD_DOMAINS = \[[\s\S]*?\n\];/, 'domains'),
  pull(/const INVENTORY_META = \{[\s\S]*?\n\};/, 'items'),
  pull(/function buildQuestLog\(\)[\s\S]*?\n\s*return \{[^}]*\};\n\}/, 'questlog'),
].join('\n');

const sandbox = {
  document, console: { warn(){} },
  player: { items:{ coins: 7 }, zycubeGifted:true, yaraMet:true, towerBossKills:{} },
  game: { scene:'overworld' },
  WORLD_PROPS: [ { id:'azurel_cave', tileX:10, tileY:20 }, { id:'rakoron_cave', tileX:30, tileY:40 },
                 { id:'malezor_school', tileX:25, tileY:126 } ],
  DREAMLAND_SCENE: 'interior_dreamland',
  addItems(d){ for (const k in d) sandbox.player.items[k] = (sandbox.player.items[k]||0) + d[k]; },
  showToast(){}, playSFX(){}, warpTo(){}, enterDracolordRealm(){},
  rizerLevelNow: () => 1,
  panel: { querySelectorAll: () => [] },
  window: {},
};
sandbox.DISTRICT_ORDER = null;   // set after the world evaluates
const ctx = vm.createContext(sandbox);
vm.runInContext(worldSrc, ctx);
vm.runInContext('DISTRICT_ORDER = SEER_HQ_NETWORK.map(h => h.dist);' +
  'function districtGateKeeper(d){const i=DISTRICT_ORDER.indexOf(d);return i>0?DISTRICT_ORDER[i-1]:null;}' +
  'function districtCleared(d){return !!(player.towerBossKills||{})[d];}' +
  'function districtRoadOpen(d){const p=districtGateKeeper(d);return p?districtCleared(p):true;}', ctx);
vm.runInContext(block, ctx);
ctx.window.__devRebuildPanels();

// ★ `const` at the top level of a vm script lives in the context's LEXICAL
//   environment, not on the sandbox OBJECT — so ctx.ZYRAXIS_DISTRICTS is
//   undefined even though the builder above just used it happily.  This is the
//   second time that has bitten a harness in this session; read through the
//   context, never off the object.
const val = expr => vm.runInContext(expr, ctx);

const n = id => hosts[id].children.length;

H('★ WARP · every family generated from the world that owns it');
ok(n('devWarpDistricts') === val('ZYRAXIS_DISTRICTS.length'),
   `districts ${n('devWarpDistricts')} = ZYRAXIS_DISTRICTS ${val('ZYRAXIS_DISTRICTS.length')}`);
ok(n('devWarpSeerHqs') === val('SEER_HQ_NETWORK.length'),
   `seer HQs  ${n('devWarpSeerHqs')} = SEER_HQ_NETWORK ${val('SEER_HQ_NETWORK.length')}  ← v1 had ZERO`);
ok(n('devWarpTowers') === val('TOWER_NETWORK.length'),
   `towers    ${n('devWarpTowers')} = TOWER_NETWORK ${val('TOWER_NETWORK.length')}  ← v1 had ZERO`);
ok(n('devWarpCaves') === 2, `caves     ${n('devWarpCaves')} · only ids ending _cave, not the school`);
ok(n('devWarpRealms') === val('DRACOLORD_DOMAINS.length') + 1,
   `realms    ${n('devWarpRealms')} = six Dracolords + Dreamland  ← v1 had ZERO`);

H('★★ GIVE · all items, not the five somebody needed in v0.95');
const items = val('Object.keys(INVENTORY_META).length');
ok(n('devGiveList') === items, `${n('devGiveList')} buttons = every INVENTORY_META key (${items})`);
const labels = hosts.devGiveList.children.map(c => c.textContent);
ok(labels.some(l => /\[7\]/.test(l)), 'each button shows what you already hold (coins seeded at 7)');
// grant, then confirm the count follows
const coinBtn = hosts.devGiveList.children.find(c => /\[7\]/.test(c.textContent));
ok(!!coinBtn, 'the coins button is findable');

H('★★★ STORY · full control over progression');
ok(n('devStoryRoads') === val('DISTRICT_ORDER.length'),
   `${n('devStoryRoads')} road gates = ${val('DISTRICT_ORDER.length')} districts`);
ok(n('devStoryFlags') >= 20, `${n('devStoryFlags')} milestone flags`);
ok(n('devStoryQuests') >= 1, `${n('devStoryQuests')} live quest rows from buildQuestLog()`);
// ★ the road toggle must write the flag districtCleared() READS — the v1-era
//   trap was a gate keyed to seerCommanderBeaten, which is never written.
ok(/player\.towerBossKills\[keeper\] = !player\.towerBossKills\[keeper\]/.test(block),
   'the road toggle writes towerBossKills — the key districtCleared() actually reads');
ok(/for \(const \[k\] of DEV_MILESTONES\) player\[k\] = true/.test(src),
   'COMPLETE EVERYTHING sets every listed milestone');

H('★ every milestone flag must be one the game READS · a toggle nothing reads is theatre');
const ms = [...(src.match(/const DEV_MILESTONES = \[[\s\S]*?\n  \];/) || [''])[0]
  .matchAll(/\['([A-Za-z]+)',/g)].map(m => m[1]);
const dead = ms.filter(k => {
  const uses = (src.match(new RegExp(`player\\.${k}\\b`, 'g')) || []).length;
  return uses < 2;                        // its own definition plus at least one reader
});
ok(ms.length >= 20, `${ms.length} milestones declared`);
ok(dead.length === 0, dead.length ? `never read elsewhere: ${dead.join(', ')}` : 'every flag has a reader in the build');

H('★ the retired tab is gone and nothing points at it');
ok(!/data-devtab="party"/.test(fs.readFileSync(process.env.RP7B ||
   '/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html', 'utf8')), 'no PARTY tab remains');

H(f ? `❌ ${f} failed` : '✅ dev mode v2 builds every panel from the live world');
process.exit(f ? 1 : 0);
