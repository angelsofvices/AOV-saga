// ★★★ A REAL WORLD IN A VM · the terrain chain, with no DOM.
//
// ★ Why this exists: "drive it, don't grep it" keeps colliding with the fact
//   that rp7b.html needs a browser to boot. But the TERRAIN functions do not —
//   worldDistrictAt and everything under it are pure maths over a seed. Pulling
//   just that chain into a vm gives a suite the actual map to test against
//   instead of a mock that agrees with whatever it is asked.
//
// ★★ It pulls declarations BY NAME IN SOURCE ORDER, brace-matched. Order is not
//   cosmetic: these are const/function decls with real dependencies, and a
//   `const` evaluated out of order dies in its TDZ exactly the way the build
//   itself has died four times.
const fs = require('fs'), vm = require('vm');

// ★★★ THE END OF A DECLARATION IS THE FIRST POINT AT WHICH IT PARSES.
//
// ★ My first version brace-matched by hand and got nine of these wrong —
//   template literals, apostrophes inside comments, and `try{}catch{}` all
//   defeat a counter that cannot tell code from text. The fix is not a better
//   counter. It is to stop writing a parser at all and ask the one that ships
//   with node: extend the slice to each plausible closing line and compile it.
//   The first slice that compiles is the declaration, by definition.
const CLOSE = /^\s*(\}|\};|\)|\);|\)\(\);|\}\)\(\);|\];|\])\s*$/;
function grabDecl(src, name){
  // ★ a name can be the SECOND declarator on a shared line
  //   (`const MAP_COLS = 1020, MAP_ROWS = 800;`). Match the name anywhere in
  //   the declarator list, then rewind to the keyword that owns it.
  const shared = new RegExp(`\\b(const|var|let)\\s[^;\\n]*\\b${name}\\s*=[^;\\n]*;`).exec(src);
  const pats = [`\\bconst ${name}\\s*=`, `\\bvar ${name}\\s*=`, `\\blet ${name}\\s*=`,
                `\\bfunction ${name}\\s*\\(`];
  for (const p of pats){
    const m = new RegExp(p).exec(src);
    if (!m) continue;
    const at = m.index;
    void 0;
    // a one-line scalar first: const X = 5;
    const nl = src.indexOf('\n', at);
    // ★ strip a trailing line comment before deciding "is this one line?" —
    //   without this, `const X = 9;   // note` failed the test and the walker
    //   below happily swallowed the next three declarations with it. That is
    //   how the harness reported "already declared" for constants that appear
    //   exactly once in the file.
    const oneLine = src.slice(at, nl + 1).replace(/\s*\/\/[^\n]*$/m, '');
    if (/;\s*$/.test(oneLine.trim()) && compiles(oneLine)) return { at, code: oneLine };
    // otherwise walk the closing lines
    // ★ NPCS is 1.1 MB and ~9,000 lines · the first caps here (260 KB / 4,000
    //   lines) were sized for terrain helpers and silently returned null for it,
    //   which reads identically to "this declaration does not exist".
    const lines = src.slice(at, at + 2000000).split('\n');
    let acc = lines[0];
    for (let k = 1; k < lines.length && k < 40000; k++){
      acc += '\n' + lines[k];
      if (!CLOSE.test(lines[k])) continue;
      if (compiles(acc)) return { at, code: acc + (/^function/.test(m[0]) ? '' : ';') };
      if (compiles(acc + ';')) return { at, code: acc + ';' };
    }
  }
  if (shared && compiles(shared[0])) return { at: shared.index, code: shared[0] };
  return null;
}
function compiles(code){
  try { new vm.Script('{' + code + '\n}'); return true; } catch(_){ return false; }
}

// the terrain + settlement + siting chain, listed by name; loaded in the order
// they appear in the file so every dependency is already defined
const CHAIN = [
  'LEGACY_MAP_COLS','LEGACY_MAP_ROWS','MAP_COLS','MAP_ROWS','WORLD_MIN_COL','WORLD_MIN_ROW','TILE',
  'ZYRAXIS_DISTRICTS','ZYRAXIS_DISTRICT_BY_ID',
  'legacyWorldLandTile','legacyDistrictAt','irregularDistrictContains','_worldDistrictAtUncached',
  '_WD_W','_wdCache','_wdNames','_wdSlot','worldDistrictAt',
  'isWorldLandTile','worldBorderDirections','_wbCache','isWorldBorderTile',
  'isVeridanRiverTile','_makeWorldRng',
  '_BEARING_DEG','DISTRICT_WHEEL','WHEEL_BY_DIST','wheelQuarterAt',
  'SETTLEMENT_DOCTRINE','SETTLEMENT_QUARTERS',
  'TOWER_NETWORK','GOLD_CHEST_TILE_POSITIONS','COSMIC_CHEST_SPOTS',
  'ENEMY_SITE_MIN_SPACING','ENEMY_SITE_CIVIC_CLEAR','ENEMY_SITE_CANDIDATES',
  '_siteCivic','siteCivicTiles','_siteBearing','siteIsTownGround',
  'siteCoastScore','_siteTreasure','siteTreasureTiles','siteTreasureScore',
  '_scanobotWalkable','siteEnemyTile',
  'NEW_ENEMY_PLACEMENT','penumbraHasSpread','newEnemyDepth','newEnemyCountFor',
  'NEW_ENEMY_STATS','NEW_ENEMY_IDS',
];

// ★★★ AND IT RESOLVES ITS OWN DEPENDENCIES.
//
// ★ Listing the chain by hand is a losing game: worldDistrictAt needed
//   legacyWorldLandTile, which needed mapMinXAt, which needs mapWidthAt. Every
//   name I add reveals another. So the harness PROBES — it runs the expressions
//   a suite actually cares about, reads the ReferenceError, pulls that one
//   declaration, and tries again. The list below is a seed, not a manifest.
function buildWorld(src, extra){
  const seen = new Set(), decls = [];
  const add = n => {
    if (seen.has(n)) return false;
    seen.add(n);
    const g = grabDecl(src, n);
    if (!g) return false;
    if (decls.some(d => d.at === g.at)) return false;   // ★ shared line · same decl
    decls.push({ name: n, ...g });
    return true;
  };
  for (const n of CHAIN) add(n);

  // ★★★ THE REAL WORLD_PROPS, EVALUATED — NOT PATTERN-MATCHED NEAR.
  //
  // ★ My first version scraped it with /id:'...'[\s\S]{0,900}?tileX:(\d+)/ and
  //   silently mis-paired: every civic building came back with some later
  //   prop's coordinates, and `siteCivicTiles('malezor')` returned EMPTY for a
  //   district with a town hall, a school, a hospital and two shops.
  //   ★★ This is the third time in one session that a "nearest match" heuristic
  //     has assigned one object's data to another. Proximity is not ownership.
  //     The array is 152 KB of plain data with two helper calls in it, so the
  //     honest move is to run it and read the objects.
  const props = evalLiteral(src, 'WORLD_PROPS');
  const npcs  = evalLiteral(src, 'NPCS');

  const mkCtx = () => vm.createContext(Object.assign({
    console, Math, Array, Object, Number, JSON, String, Set, Map,
    Uint8Array, Int16Array, Float32Array, isNaN, parseInt, parseFloat, Date,
    Image: function(){ return { src: '' }; },
    WORLD_PROPS: props,
    _propBlocked: new Set(),
    player: { districtsVisited: {} },
  }, extra || {}));

  // ★★★ THE PROBES MUST SWEEP, NOT SAMPLE.
  //
  //   My first probe list was two tiles. Both happened to take the fast path
  //   through worldDistrictAt, so the resolver stopped with MAP_ZARVANE_MIN_COL
  //   still missing — and every later call that reached the legacy branch threw
  //   a ReferenceError that siteCivicTiles' own try/catch quietly turned into an
  //   empty list. The harness reported a resolved world; the world was broken in
  //   a region I had not looked at.
  //
  // ★★ So the probe walks the whole map on a coarse lattice plus every district
  //   centre. A dependency that only one corner of the world needs is still a
  //   dependency, and a harness that cannot reach it will lie in exactly the
  //   confident way this one did.
  const SWEEP = [];
  for (let x = -90; x < 1020; x += 37)
    for (let y = -40; y < 800; y += 37) SWEEP.push([x, y]);
  const PROBES = (extra && extra.__probes) || [
    // ★ NO extra brackets. `[${JSON.stringify(SWEEP)}]` wraps the array in a
    //   second array, so forEach ran ONCE with p = the whole sweep and probed
    //   nothing at all — while reporting a fully resolved world.
    `${JSON.stringify(SWEEP)}.forEach(function(p){ worldDistrictAt(p[0],p[1]);
        isWorldLandTile(p[0],p[1]); isWorldBorderTile(p[0],p[1]);
        isVeridanRiverTile(p[0],p[1]); _scanobotWalkable(p[0],p[1]);
        siteCoastScore(p[0],p[1]); siteTreasureScore(p[0],p[1]); })`,
    // ★★★ PROBE THE FUNCTIONS THAT ARE WRAPPED IN try/catch FROM THE INSIDE.
    //   siteIsTownGround catches its own errors, so probing only IT let a
    //   missing _BEARING_DEG hide: wheelQuarterAt threw, the catch turned that
    //   into `q = null`, and the town rule silently became "always false" —
    //   a HARD reject that rejected nothing, in a suite reporting green.
    //   Call the inner function directly, where nothing is there to swallow it.
    `ZYRAXIS_DISTRICTS.forEach(function(d){ siteCivicTiles(d.id);
        ['N','NE','E','SE','S','SW','W','NW'].forEach(function(b){ wheelQuarterAt(d.id, b); });
        siteIsTownGround(d.id, d.cx, d.cy); newEnemyCountFor('penumbra', d.id); })`,
  ];
  let ctx = null;
  // ★ one name is resolved per pass, and the sweep surfaces dozens — 60 was
  //   a cap I picked before I knew the number, and hitting it looked exactly
  //   like success.
  let resolved = 0;
  for (let pass = 0; pass < 600; pass++){
    decls.sort((a, b) => a.at - b.at);            // ★ source order, not list order
    ctx = mkCtx();
    let missing = null;
    for (const d of decls){
      try { vm.runInContext(d.code, ctx); }
      catch (e) {
        const mm = /^(\w+) is not defined/.exec(e.message);
        if (mm) { missing = mm[1]; break; }
      }
    }
    if (!missing){
      for (const p of PROBES){
        try { vm.runInContext(p, ctx); }
        catch (e) {
          const mm = /^(\w+) is not defined/.exec(e.message);
          if (mm) { missing = mm[1]; break; }
          throw e;
        }
      }
    }
    if (!missing) break;
    if (!add(missing)) { console.warn(`  ⚠ harness: cannot resolve ${missing}`); break; }
    resolved++;
  }
  ctx.__resolved = resolved;
  ctx.__props = props;
  ctx.__npcs = npcs;
  ctx.__decls = decls.map(d => d.name);
  return ctx;
}


// ★★★ A STUB THAT SURVIVES BEING USED AS ANYTHING.
//
// ★ The data arrays in this build call helpers, spread them, index them, and
//   read properties off the result — `SEER_GRUNT_ART[s.v].standBh` does three
//   of those in one expression. A stub that is only a function dies on the
//   index; one that is only an array dies on the call. So the stub is a Proxy
//   that is callable, iterable, indexable to itself, and numerically harmless.
//   ★★ It exists ONLY so the literal can be EVALUATED — every field it fakes
//     is one this harness never reads. What it does is let the real ids,
//     coordinates and flags come out intact instead of being regex-guessed.
function makeStub(){
  const base = function(){ return stub; };
  base.length = 0;
  const stub = new Proxy(base, {
    get(t, k){
      if (k === Symbol.iterator) return function*(){};
      if (k === Symbol.toPrimitive) return () => 0;
      if (k === 'length') return 0;
      if (k === 'then') return undefined;                 // never look thenable
      if (['filter','map','forEach','slice','concat','flat','sort'].includes(k))
        return () => [];
      if (['toString','valueOf'].includes(k)) return () => '';
      return stub;
    },
    apply(){ return stub; },
    has(){ return true; },
  });
  return stub;
}

// ★ evaluate one big data literal out of the build, stubbing whatever it reaches
//   for, and hand back the real objects.
function evalLiteral(src, name){
  const g = grabDecl(src, name);
  if (!g) { console.warn(`  ⚠ harness: no declaration for ${name}`); return []; }
  const stubs = { console, Math, Array, Object, JSON, String, Set, Map, Number, Date,
                  Image: function(){ return { src: '' }; } };
  for (let pass = 0; pass < 400; pass++){
    const ctx = vm.createContext(Object.assign({}, stubs));   // ★ FRESH each try ·
    try {                                                     //   a retry in the same
      vm.runInContext(g.code, ctx);                           //   context trips over
      // ★★★ `ctx.NAME` IS ALWAYS UNDEFINED, and that is not a failure. A
      //   top-level `const` in a vm script persists by NAME into later runs in
      //   the same context — the trap this codebase has hit four times — but it
      //   never becomes a PROPERTY of the context object. Read it back by
      //   evaluating its name, not by reaching through the sandbox.
      return vm.runInContext(name, ctx) || [];
    } catch (e) {
      const m = /^(\w+) is not defined/.exec(e.message)
             || /^(\w+) is not a function/.exec(e.message)
             || /^(\w+)\.\w+ is not a function/.exec(e.message)
             || /^Cannot read properties of undefined \(reading '.*'\).*$/.test(e.message)
                ? null : null;
      const nm = /^(\w+) is not defined/.exec(e.message)
              || /^(\w+) is not a function/.exec(e.message)
              || /^(\w+)\.\w+ is not a function/.exec(e.message);
      if (!nm){ console.warn(`  ⚠ harness: ${name} — ${e.message}`); return []; }
      stubs[nm[1]] = makeStub();
    }
  }
  return [];
}

module.exports = { buildWorld, grabDecl, evalLiteral };
