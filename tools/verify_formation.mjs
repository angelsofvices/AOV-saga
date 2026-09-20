// ★★★★ v0.99.10 · THE IDLE TEAM GRAB · every Zyrex visible, none overlapping.
//
//   Creator, 2026-09-20: "instead of zyrex overlapping each other, I want them
//   all spread out so they are visible. the sprites are beautiful. I just want
//   it to look like a full screen team grab when we are idle. team ready
//   behind you."
//
// ★★★★ THE v0.95.827 SPACING LAW WAS NEVER VIOLATED. It proves every station is
//   Chebyshev >= 2 from every other, so no two Zyrex can share a TILE — and it
//   held perfectly while the picture clumped, because a tile is 48px and these
//   bodies are not. Anciuxor draws FIVE tiles wide. Two of them two tiles apart
//   overlap by three. "No two occupy one tile" and "no two pictures overlap"
//   are different claims and only the first was being made.
import { bootGame } from './lib/boot_game.mjs';

let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; return !!c; };
const H  = t => console.log('\n' + t);
const VIEW_X = 9, VIEW_Y = 5;          // 20x11 tiles, Rizer centred

const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['summonFormation','partyFormation','partyFormationStep',
  'wildBodyFootprint','createZyrex','SUMMONABLE_SPRITES','SUMMON_FORMATION',
  'FORM_MAX_BEHIND','FORM_MAX_SIDE','_formationRotate','_formationBasis'] });
console.log = _L;
const P = G.player;

const build = ids => { P.party = ids.map(i => G.createZyrex(i, 20)).filter(Boolean); return P.party; };
const widthOf = z => { const b = G.wildBodyFootprint(z.speciesId); return (b.left||0)+(b.right||0)+1; };
const depthOf = z => { const b = G.wildBodyFootprint(z.speciesId); return (b.depth||0)+1; };

H('★★★ THE STEP IS A MEASUREMENT, NOT THE CONSTANT 2');
{
  ok(typeof G.partyFormationStep === 'function', 'partyFormationStep exists');
  build(['mealux','rustbyte','vampella']);
  const small = G.partyFormationStep();
  build(['anciuxor','mealux']);
  const big = G.partyFormationStep();
  ok(big[0] > small[0], `★★★ a party with Anciuxor steps ${big[0]} tiles sideways; one without steps ${small[0]}`);
  ok(big[0] >= 5, `★★ and ${big[0]} >= 5 · Anciuxor DRAWS five tiles wide, which is the number that matters`);
  ok(small[0] === 2, '★ a team of small bodies keeps the original 2 · nothing is spread further than it needs');
}

H('★★★★ NO TWO SPRITES OVERLAP · the claim that was never being made');
{
  const CASES = [
    ['three small',                ['mealux','rustbyte','vampella']],
    ['six mixed, one 3-wide',      ['mealux','snok','rustbyte','vampella','terralith','skybeam']],
    ['eight incl. Anciuxor',       ['anciuxor','rakoron','snok','mealux','rustbyte','vampella','terralith','skybeam']],
  ];
  for (const [label, ids] of CASES){
    const party = build(ids);
    if (!party.length){ ok(false, `${label}: no party built`); continue; }
    const F = G.partyFormation().slice(0, party.length);
    const maxW = Math.max(...party.map(widthOf));
    const maxD = Math.max(...party.map(depthOf));
    let clash = null;
    for (let a = 0; a < F.length && !clash; a++)
      for (let b = a + 1; b < F.length; b++){
        const dx = Math.abs(F[a][0] - F[b][0]), dy = Math.abs(F[a][1] - F[b][1]);
        if (dx < maxW && dy < maxD){ clash = `${JSON.stringify(F[a])} vs ${JSON.stringify(F[b])}`; break; }
      }
    ok(!clash, `  ${label.padEnd(24)} widest ${maxW} tiles · ${F.length} stations · `
             + (clash ? `★ OVERLAP ${clash}` : 'no two pictures touch'));
  }
}

H('★★★★ AND EVERY ONE OF THEM IS ON SCREEN · "a full screen team grab"');
{
  for (const ids of [['mealux','rustbyte','vampella'],
                     ['mealux','snok','rustbyte','vampella','terralith','skybeam'],
                     ['anciuxor','rakoron','snok','mealux','rustbyte','vampella','terralith','skybeam']]){
    const party = build(ids);
    const F = G.partyFormation().slice(0, party.length);
    const off = F.filter(([x, y]) => Math.abs(x) > VIEW_X || y > VIEW_Y);
    ok(off.length === 0,
       `  ${String(party.length).padStart(2)} Zyrex · ${off.length} off-screen`
     + (off.length ? ` · ${JSON.stringify(off)}` : ' · all inside the 20x11 viewport'));
  }
  // ★★ WIDE AND SHALLOW, because the viewport is. A square lattice stepped by
  //   the widest body put the first station SIX tiles back the moment Anciuxor
  //   joined — off the bottom of a screen that shows five.
  ok(G.FORM_MAX_BEHIND <= 4, `★★★ nothing stands more than ${G.FORM_MAX_BEHIND} tiles behind him · the screen shows five`);
  ok(G.FORM_MAX_SIDE === 9, `★★ and no further than ${G.FORM_MAX_SIDE} to a side · ±10 is exactly the edge, where a body is half off`);
}

H('★★★ EVERYTHING .874 ESTABLISHED SURVIVES · never in front of him');
{
  const F = G.partyFormation();
  ok(F.every(([, ly]) => ly >= 0),
     '★★★★ not one station has ly < 0 · "dont make your zyrex run in front of you"');
  ok(F.slice(0, 6).every(([, ly]) => ly > 0),
     '★★ and the first six are strictly BEHIND him, not merely level · behind outranks beside');
  // rotation must keep it behind him in every facing
  for (const face of ['up','down','left','right']){
    const rot = F.slice(0, 8).map(([x, y]) => G._formationRotate(x, y, face));
    const inFront =
      face === 'up'    ? rot.some(([, y]) => y < 0) :
      face === 'down'  ? rot.some(([, y]) => y > 0) :
      face === 'left'  ? rot.some(([x]) => x < 0) :
                         rot.some(([x]) => x > 0);
    ok(!inFront, `  facing ${face.padEnd(6)} · no station in the ground he is walking into`);
  }
}

H('★ THE DEFAULT TABLE IS UNCHANGED FOR ANYTHING READING IT DIRECTLY');
{
  ok(Array.isArray(G.SUMMON_FORMATION) && G.SUMMON_FORMATION.length > 10,
     `SUMMON_FORMATION still exists · ${G.SUMMON_FORMATION.length} stations at the 2-step default`);
  ok(G.SUMMON_FORMATION.every(([, ly]) => ly >= 0), '★ and still rear-only');
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ stepped by the widest body · nothing overlaps · everyone on screen · nobody in front');
process.exit(f ? 1 : 0);
