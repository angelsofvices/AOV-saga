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
  // ★★ v0.99.46 · was `>= 5`. partyFormationStep returns the MEASURED drawn
  //   span now rather than a count of blocked tiles, so Anciuxor reads 4.84
  //   — the true width — and summonFormation is what ceils it to a whole 5.
  //   Asserting the raw measurement against a rounded number tested the
  //   rounding, not the width.
  ok(big[0] >= 4.8, `★★ and ${big[0].toFixed(2)} tiles · Anciuxor's real drawn width, measured off its own bboxes`);
  ok(Math.ceil(big[0]) >= 5, `★★ which the lattice steps by as ${Math.ceil(big[0])} whole tiles`);
  ok(big[1] >= 4, `★★★★ and it steps ${big[1].toFixed(2)} tiles BACKWARD too · the row step was `
   + 'wildBodyFootprint.depth (max 1) until v0.99.46, so every rank behind was buried in the rank in front');
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

H('★★★★ AND EVERY ONE OF THEM IS ON SCREEN · as far as the screen allows');
{
  // ★★★★ v0.99.46 · THIS DEMANDED SOMETHING GEOMETRY FORBIDS. Eight Zyrex
  //   including an Anciuxor and a Rakoron need roughly thirty tiles of width
  //   and the viewport is twenty. "All on screen" and "none overlapping" cannot
  //   both hold — and the old lattice satisfied this check only because its
  //   stations were two tiles apart, i.e. by piling the bodies on top of each
  //   other, which is the bug the Creator reported. The check was passing FOR
  //   the bug.
  //   ★ So the claim is scoped to what the screen can actually hold, and the
  //   overflow is required to be off CAMERA rather than on top of a friend.
  for (const ids of [['mealux','rustbyte','vampella'],
                     ['mealux','snok','rustbyte','vampella','terralith','skybeam']]){
    const party = build(ids);
    const F = G.partyFormation().slice(0, party.length);
    const off = F.filter(([x, y]) => Math.abs(x) > VIEW_X || y > VIEW_Y);
    ok(off.length === 0,
       `  ${String(party.length).padStart(2)} ordinary Zyrex · ${off.length} off-screen`
     + (off.length ? ` · ${JSON.stringify(off)}` : ''));
  }
  {
    const party = build(['anciuxor','rakoron','snok','mealux','rustbyte','vampella','terralith','skybeam']);
    const F = G.partyFormation().slice(0, party.length);
    const on = F.filter(([x, y]) => Math.abs(x) <= VIEW_X && y <= VIEW_Y);
    ok(on.length >= 5,
       `★★★ eight Zyrex behind two giants · ${on.length} of ${party.length} inside the viewport · `
     + 'the near seats are handed out first, so what you SEE is never the overflow');
  }
  // ★★ WIDE AND SHALLOW, because the viewport is.
  ok(G.FORM_MAX_BEHIND <= 4, `★★★ the default bound keeps a rank within ${G.FORM_MAX_BEHIND} tiles of him · the screen shows five`);
  ok(G.FORM_MAX_SIDE === 9, `★★ and no further than ${G.FORM_MAX_SIDE} to a side · ±10 is exactly the edge, where a body is half off`);
}

H('★★★ EVERYTHING .874 ESTABLISHED SURVIVES · never in front of him');
{
  const F = G.partyFormation();
  ok(F.every(([, ly]) => ly >= 0),
     '★★★★ not one station has ly < 0 · "dont make your zyrex run in front of you"');
  // ★★★★ v0.99.46 · "BEHIND OUTRANKS BESIDE" IS NO LONGER UNCONDITIONAL, and
  //   the measurement is why. Sprites draw upward from their feet, so walking
  //   SOUTH a station behind him is a station ABOVE him on screen — and a
  //   4.28-tile Anciuxor put there hangs three tiles off the top edge. It read
  //   35% visible. It needs at least its own height of clearance not to cover
  //   Rizer and at most (6.5 - height) for its head to stay on screen, and for
  //   the big bodies those two demands cross: there is NO legal seat directly
  //   behind him. The wings are level with him, in the lattice already, and
  //   100% visible. Ranking the seats by what the camera shows picks them, and
  //   that is the correct answer rather than a concession.
  //   ★ What stays absolute is the Creator's own instruction — never IN FRONT.
  const small = (build(['mealux','rustbyte','vampella']), G.partyFormation());
  ok(small.slice(0, 3).every(([, ly]) => ly > 0),
     '★★★ with ordinary bodies the first three seats are still strictly BEHIND him · behind outranks beside wherever behind FITS');
  build(['anciuxor','rakoron','snok']);
  ok(G.partyFormation().every(([, ly]) => ly >= 0),
     '★★★★ and with giants, where it does not fit, nothing is ever in front of him anyway');
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

console.log(f ? `\n❌ ${f} failed` : '\n✅ stepped by the widest body · nothing overlaps · everyone the screen can hold is on it · nobody in front');
process.exit(f ? 1 : 0);
