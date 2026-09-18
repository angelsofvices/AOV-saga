// ★★★★ v0.98.1 · THE PRIME GRAPH · the 2K attribute screen, driven.
//
//   Creator, 2026-09-17, with the NBA 2K27 MyCAREER upgrade screen:
//   "make the rizer panel (upgrades) section like this. learn the way 2k does
//    it. make it a vertical graph. be smart. retheme"
//
// ★★★ WHAT THIS SUITE IS FOR, and it is not "does it look like the picture".
//   Turning a list of rows into a chart moves TWO things that can silently
//   break and that no existing suite watches:
//
//   1 · THE ARROWS. A standing ruling (v0.95.809) fixed how this panel walks:
//       "right arrow goes right in the column. down goes down a row to the next
//        stat ... no inner cell wrapping." Written for horizontal rows. The
//       graph is vertical now, so the CONTROL GRID had to transpose — three
//       tier rows of five stats — or DOWN would have walked you sideways.
//       ★ The shared _stepRow was not touched. This suite proves that by
//         extracting the REAL handler source out of the build and driving it
//         against the REAL item list the panel produces. A reimplementation
//         would only prove my copy of the algorithm works.
//   2 · COLUMN ALIGNMENT. Bars and buttons are two separate grids. If their
//       templates ever drift, every button sits under the wrong bar and the
//       panel lies about what it is going to spend. One string, asserted equal.
import { bootGame } from './lib/boot_game.mjs';
import fs from 'fs';

let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);
const src = fs.readFileSync('/tmp/all.js', 'utf8');

const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['buildRizerAttrPanel','rizerAttrUnspent','rizerAttrPool','rizerAttrSpent',
  'rizerAttrs','recomputeRizerStats','RIZER_ATTR_META','RIZER_STAT_MAX_PTS','RIZER_ATTR_MAX',
  'RIZER_ATTR_KEYS','rizerSpend','zyAttrHilite'] });
const sheet = (lvl, attrs) => {
  G.player.rizerLvl = lvl;
  G.player.attrs = Object.assign({ hp:0, atk:0, def:0, speed:0, special:0 }, attrs);
  try { G.recomputeRizerStats({ quiet:true }); } catch(_){}
  return G.buildRizerAttrPanel('phone');
};
console.log = _L;

const CAP   = G.RIZER_STAT_MAX_PTS;
const ORDER = ['hp','def','atk','special','speed'];        // the display order the graph uses

// ── a document-order scan · this is what querySelectorAll returns ──────────
function scan(html){
  const out = [];
  for (const m of html.matchAll(/<(button|div)\b([^>]*)>/g)){
    const at = m[2];
    const g  = n => (new RegExp(`data-${n}="([^"]*)"`).exec(at) || [])[1];
    if (g('zyitem') !== undefined || g('zybar') !== undefined || g('zydetail') !== undefined)
      out.push({ tag:m[1], item:g('zyitem'), row:g('zyrow'), attr:g('zyattr'),
                 bar:g('zybar'), detail:g('zydetail'), disabled:/\bdisabled\b/.test(at) });
  }
  return out;
}

H('★★★ THE CONTROL GRID IS TRANSPOSED · three tiers x five stats');
const MID = sheet(24, { hp:240, atk:180, def:90, speed:120, special:60 });   // free 109
{
  const els   = scan(MID);
  const items = els.filter(e => e.item);                     // what _zycellContentItems yields
  ok(items.length === 15, `${items.length} focus stops · 5 stats x 3 tiers`);
  const rows = ['tier_p1','tier_p10','tier_max'];
  for (let r = 0; r < 3; r++){
    const R = items.filter(e => e.row === rows[r]);
    ok(R.length === 5, `  ${rows[r]} holds 5 buttons`);
    ok(R.map(e => e.attr).join(',') === ORDER.join(','),
       `  ${rows[r]} columns run ${R.map(e=>e.attr).join(' ')}`);
  }
  // ★★ CONTIGUITY IS THE WHOLE MECHANISM. _stepRow collapses "a run of
  //   same-row items" into one unit. Interleave two rows and the units shatter
  //   into ten and UP/DOWN stops meaning anything.
  const seq = items.map(e => e.row);
  const runs = seq.filter((v,i) => v !== seq[i-1]);
  ok(runs.length === 3, `the three rows are CONTIGUOUS in document order (${runs.length} runs, not ${seq.length})`);
  ok(runs.join(',') === rows.join(','), `and in tier order · ${runs.join(' → ')}`);
}

H('★★★★ DRIVE THE REAL HANDLER · extracted from the build, not rewritten');
{
  // pull the genuine helpers + _stepRow + the RIGHT/LEFT row-walks out of source
  const grab = (start, end) => {
    const i = src.indexOf(start); if (i < 0) return null;
    const j = src.indexOf(end, i); return j < 0 ? null : src.slice(i, j + end.length);
  };
  const helpers = grab("const _rowOf  = el =>", "const _stepRow = (dir) => {");
  const stepEnd = (() => {                                  // brace-match _stepRow
    const i = src.indexOf('const _stepRow = (dir) => {');
    let j = src.indexOf('{', i), d = 0;
    do { if (src[j] === '{') d++; else if (src[j] === '}') d--; j++; } while (d);
    return src.slice(i, j + 2);
  })();
  const right = grab("if (k === 'arrowright' && _curRow){", "      return true;\n    }");
  ok(!!helpers && !!stepEnd && !!right, 'the row-walk source was found in the build');

  // items are plain objects with getAttribute · that is all the handler uses
  const mk = list => list.map(e => ({
    getAttribute: n => (n === 'data-zyrow' ? e.row : n === 'data-zyattr' ? e.attr : null),
  }));
  const items = mk(scan(MID).filter(e => e.item));
  const game  = { _zycellItemIdx: 0, _zycellFocus: 'content' };
  const noop  = () => {};
  const drive = new Function('items','game','_zycellPaintFocus','_zycellScrollFocusIntoView','playSFX', `
    return function(k){
      const _curEl  = items[game._zycellItemIdx];
      const _curRow = _curEl && _curEl.getAttribute && _curEl.getAttribute('data-zyrow');
      ${helpers.slice(0, helpers.lastIndexOf('const _stepRow'))}
      ${stepEnd}
      if (k === 'arrowup')  { _stepRow(-1); return 'move'; }
      if (k === 'arrowdown'){ _stepRow(+1); return 'move'; }
      ${right.replace("playSFX('doorLock')", "playSFX('doorLock'), edge.hit = true")
             .replace(/return true;\n\s*\}$/, "return edge.hit ? 'edge' : 'move';\n    }")}
      return 'none';
    };`)(items, game, noop, noop, noop);
  const edge = { hit:false };
  globalThis.edge = edge;
  const at = () => { const e = items[game._zycellItemIdx];
                     return e.getAttribute('data-zyrow').replace('tier_','') + ':' + e.getAttribute('data-zyattr'); };

  ok(at() === 'p1:hp', `start at ${at()}`);
  const steps = [];
  for (let i = 0; i < 4; i++){ edge.hit = false; drive('arrowright'); steps.push(at()); }
  ok(steps.join(' → ') === 'p1:def → p1:atk → p1:special → p1:speed',
     `★★★ RIGHT walks the five STATS · ${steps.join(' → ')}`);
  edge.hit = false; drive('arrowright');
  ok(at() === 'p1:speed' && edge.hit, '★★ and DEAD STOPS at the last column · no wrap, no spill (the v0.95.809 ruling)');
  drive('arrowdown');
  ok(at() === 'p10:speed', `★★★ DOWN steps the TIER and HOLDS the column · ${at()}`);
  drive('arrowdown');
  ok(at() === 'max:speed', `★ and again · ${at()}`);
  drive('arrowdown');
  ok(at() === 'p1:speed', '★★ only the LIST wraps, bottom to top · column still held');
  drive('arrowup');
  ok(at() === 'max:speed', '★ UP is its mirror');
}

H('★★★ THE TWO GRIDS SHARE ONE TEMPLATE · or every button lies');
{
  const t = [...MID.matchAll(/grid-template-columns:([^;]+);/g)].map(m => m[1].trim());
  ok(t.length === 2, `${t.length} grid templates in the panel`);
  ok(t[0] === t[1], `★★★ graph and controls use the SAME column track · ${t[0]}`);
  const cells = t[0].split(/\s+(?![^(]*\))/);
  ok(cells.length === 1 + 3 + 5, `${cells.length} tracks · 1 tier gutter + 3 group spines + 5 bars`);
  ok(cells[0] === '34px', 'track 0 is the tier-label gutter');
  ok(cells.filter(c => c === '16px').length === 3, 'three 16px spines · one per group');
  ok(cells.filter(c => c === 'minmax(0,1fr)').length === 5, 'five elastic bar tracks');
  // ★★★ AND NOTHING PINS ITSELF. The three rows stay in register because each
  //   emits exactly 9 cells and AUTO-PLACEMENT flows them. My first cut left a
  //   `grid-row:1` on the group spines from an earlier design — which yanked
  //   all three rotated labels up into the CAP row, where the numbers live,
  //   while the bars sat in row 2 with empty gaps beside them. Auto-placement
  //   and explicit placement in the same grid is how a layout drifts silently.
  ok(!/grid-row\s*:/.test(MID),
     '★★★ no cell pins its own row · the register is auto-placement, one source of truth');
}

H('★★★ THE BARS SAY WHAT THE NUMBERS SAY');
{
  const free = 109, a = { hp:240, def:90, atk:180, special:60, speed:120 };
  // the three fills per bar, in document order
  const heights = [...MID.matchAll(/class="rzFill" style="height:([\d.]+)%/g)].map(m => +m[1]);
  ok(heights.length === 10, `${heights.length} fill layers · 2 per bar (affordable + owned)`);
  ORDER.forEach((k, i) => {
    const buy = heights[i*2], own = heights[i*2+1];
    const wantOwn = +Math.min(100, a[k]/CAP*100).toFixed(1);
    const wantBuy = +Math.min(100, Math.min(CAP, a[k]+free)/CAP*100).toFixed(1);
    ok(own === wantOwn && buy === wantBuy,
       `  ${k.padEnd(7)} owned ${own}%  affordable ${buy}%  (${a[k]} / ${Math.min(CAP,a[k]+free)} of ${CAP})`);
  });
  ok(heights.every((h,i) => i%2 ? true : h >= heights[i+1]),
     '★★ the affordance zone never sits BELOW the owned zone · it is a superset');
  ok(heights.every(h => h <= 100), '★ and nothing overflows the shaft');
}

H('★★ EVERY BAR HAS A DISTINCT COLOUR · DEF no longer shares SPECIAL\'s blue');
{
  const cols = ORDER.map(k => G.RIZER_ATTR_META[k].color.toLowerCase());
  ok(new Set(cols).size === 5, `5 distinct hues · ${cols.join(' ')}`);
  ok(G.RIZER_ATTR_META.special.color.toLowerCase() === '#4fb3ff',
     '★★ SPECIAL keeps #4fb3ff · that blue is the HUD astral bar, it is canon');
  ok(G.RIZER_ATTR_META.hp.color.toLowerCase() === '#ff6b6b'
     && G.RIZER_ATTR_META.speed.color.toLowerCase() === '#ffd66b',
     '★ HP red and STAMINA gold are the other two HUD bars · both untouched');
  ok(G.RIZER_ATTR_META.def.color.toLowerCase() === '#b268ff',
     '★★ DEF is the one that moved · it had no HUD bar, so its blue was arbitrary');
}

H('★★★ THE SELECTION HOOK · the thing you point at is 180px above the thing you stand on');
{
  const els  = scan(MID);
  const bars = els.filter(e => e.bar).map(e => e.bar);
  const dets = els.filter(e => e.detail).map(e => e.detail);
  const attr = [...new Set(els.filter(e => e.attr).map(e => e.attr))];
  ok(bars.join(',') === ORDER.join(','),   `5 bars, in display order · ${bars.join(' ')}`);
  ok(dets.join(',') === ORDER.join(','),   '5 detail lines, one per bar');
  ok(attr.join(',') === ORDER.join(','),   'and every button names the column it owns');
  ok(typeof G.zyAttrHilite === 'function', 'zyAttrHilite is live');
  ok(/zyAttrHilite\(fe && fe\.getAttribute/.test(src),
     '★★★ _zycellPaintFocus forwards data-zyattr · generic, and a no-op on every other panel');
  ok((MID.match(/display:block/g) || []).length === 1,
     '★ exactly ONE detail line starts visible · the rail is never an empty box');
}

H('★★ A MAXED STAT GOES DEAD, AND THE COLUMNS STILL LINE UP');
const LATE = sheet(60, { hp:400, atk:300, def:150, speed:220, special:666 });
{
  const items = scan(LATE).filter(e => e.item);
  ok(items.length === 12, `${items.length} live stops · SPECIAL's three are gone at ${CAP}/${CAP}`);
  ok(!items.some(e => e.attr === 'special'), '★★ and rizerSpend would have refused them anyway · the UI now agrees');
  for (const r of ['tier_p1','tier_p10','tier_max']){
    const R = items.filter(e => e.row === r).map(e => e.attr);
    ok(R.join(',') === 'hp,def,atk,speed', `  ${r} · ${R.join(' ')} · same four, same order`);
  }
  ok(/★<\/span>/.test(LATE), '★ the capped bar is starred');
}

H('★ THE DRY SHEET · no points, no stops, and that is deliberate');
{
  const DRY = sheet(40, { hp:300, atk:300, def:266, speed:266, special:200 });   // free 0
  const items = scan(DRY).filter(e => e.item);
  ok(items.length === 0, 'zero focus stops when nothing can be spent');
  // ★ _zycellContentItems then yields only the _zySection wrapper → items.length
  //   === 1 → the v0.95.995 scroll fallback takes UP/DOWN. The panel stays
  //   readable on a controller. That path is not new and is not touched here.
  ok(/ALL 1332 POINTS ALLOCATED/.test(DRY), 'and the banner says so in words');
  ok(!/ARCHETYPE PRESETS/.test(DRY), '★ presets stay hidden once a point is spent · no silent hybrid builds');
}

H('★ THE FRESH SHEET · Lv 1, the archetype you leave the room with');
{
  const FRESH = sheet(1, {});
  ok(/ARCHETYPE PRESETS · spends all 33/.test(FRESH), 'presets offered · all 33 points');
  ok(/UNWRITTEN/.test(FRESH), '★ the build read says UNWRITTEN rather than guessing a title from zeros');
  const heights = [...FRESH.matchAll(/class="rzFill" style="height:([\d.]+)%/g)].map(m => +m[1]);
  ok(heights.filter((h,i) => i%2).every(h => h === 0), 'every owned zone is empty');
  ok(heights.filter((h,i) => !(i%2)).every(h => h > 0),
     '★★ and every affordance zone is NOT · a new player can see where 33 points reach');
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ vertical graph · arrows match the layout · one template · bars agree with the numbers');
process.exit(f ? 1 : 0);
