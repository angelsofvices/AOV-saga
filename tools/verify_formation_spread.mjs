// ★★★★ v0.99.46 · "the zyrex still stand on top of eachother. I cant see all
//   their beautiful sprites." (Creator, 2026-09-24)
//
// ★★★★ THIS IS THE SUITE THAT SHOULD HAVE EXISTED AT v0.99.10. The formation
//   was stepped by the widest body back then and the spacing was "proved by
//   the geometry" — and the proof was about the wrong two quantities, twice:
//
//   1 · THE ROW STEP WAS A COLLISION NUMBER. wildBodyFootprint.depth answers
//       "how many tile rows does this body BLOCK" and is literally
//       `tilesW >= 4 ? 1 : 0` — derived from width, capped at one. Nothing to
//       do with how tall the thing DRAWS. 37 of the 38 species with sheets
//       draw taller than the gap that gave them; Anciuxor draws 4.28 tiles
//       into a 2-tile slot.
//
//   2 · THE ROTATION SWAPPED THE AXES AND NOT THE STEPS. The lattice is built
//       in LOCAL space (+x his right, +y behind him) and rotated to the world,
//       so under a left/right basis the width-derived step governs the
//       SCREEN-VERTICAL spacing and the rank step governs the HORIZONTAL.
//       Every separation this file proves held only while he walked north or
//       south — which is why the Creator's screenshot piles up the instant he
//       heads east.
//
// ★★★★ SO THIS SUITE MEASURES DRAWN RECTANGLES, IN ALL FOUR FACINGS, AND
//   COUNTS OVERLAP IN TILES. A station list that "looks spread out" is not the
//   claim; the claim is that you can see every sprite, and the only thing that
//   answers it is the pixels each body occupies. Reasoning about the lattice
//   is what produced two wrong proofs already.
import { bootGame } from './lib/boot_game.mjs';
import fs from 'fs';
import path from 'path';
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');

let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; return !!c; };
const H  = t => console.log('\n' + t);

const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['SUMMONABLE_SPRITES','wildBodyFootprint','zyrexDrawSpan','TILE',
  'partyFormation','partyFormationStep','summonFormation','SUMMON_FORMATION','player',
  '_formationRotate','_formationBasis','FORM_VIEW_HALF_X','FORM_VIEW_HALF_Y'] });
console.log = _L;

// ── drive the basis the way the game does: he WALKS, and the walk sets it ──
// ★★ Not by poking _formFacing (a module-local `let` the harness cannot see),
//   and not by trusting player.dir — the basis is deliberately the direction
//   he last TRAVELLED, so turning on the spot does not scramble the team. The
//   only honest way to ask for a facing is to move him.
const STEP = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
function walk(facing){
  const [dx, dy] = STEP[facing];
  G.player.x = 200; G.player.y = 200; G._formationBasis();
  G.player.x += dx; G.player.y += dy;
  const got = G._formationBasis();
  if (got !== facing) throw new Error(`basis did not take: asked ${facing}, got ${got}`);
  return got;
}

// ── the drawn rectangle of a body standing at a world offset ──────────────
// ★ Sprites are BOTTOM-ANCHORED: the feet sit on the station row and the body
//   extends upward from there. A head-height overlap is the whole complaint,
//   so the rectangle has to be built that way round.
function rectAt(speciesId, dx, dy){
  const s = G.zyrexDrawSpan(speciesId);
  return { x0: dx - s.w / 2, x1: dx + s.w / 2, y0: dy - s.h + 1, y1: dy + 1, w: s.w, h: s.h };
}
function survey(ids, facing){
  walk(facing);
  G.player.party = ids.map(id => ({ speciesId: id, name: id, hp: 10 }));
  const F = G.partyFormation();
  const bodies = ids.map((id, i) => {
    const st = F[i % F.length];
    const [dx, dy] = G._formationRotate(st[0], st[1], facing);
    return Object.assign(rectAt(id, dx, dy), { id, st, dx, dy });
  });
  let worst = 0, bad = 0;
  for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++){
    const a = bodies[i], b = bodies[j];
    const ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
    const oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
    const o = Math.min(ox, oy);
    if (ox > 0.15 && oy > 0.15){ bad++; worst = Math.max(worst, o); }
  }
  // ★ two members MUST NOT share a station · that is the modulo-alias bug
  const seats = new Set(bodies.map(b => b.dx + ',' + b.dy));
  return { bodies, bad, worst: +worst.toFixed(2), seats: seats.size,
           stations: F.length, step: G.partyFormationStep().map(n => +n.toFixed(2)) };
}

const GIANTS = ['anciuxor','rakoron','solcryst'];
const SIX    = ['anciuxor','rakoron','solcryst','apexaur','voltigrax','snok'];
const MIXED  = ['anciuxor','snok','mealux','phrenetic','elzoran','vengrizz'];
const FACINGS = ['up','down','left','right'];

H('★★★★ THE ROW STEP IS NOW A DRAWN HEIGHT · the number that was never measured');
{
  const tall = [];
  for (const id of Object.keys(G.SUMMONABLE_SPRITES)){
    const d = G.SUMMONABLE_SPRITES[id]; if (!d || !d.bboxes) continue;
    const s = G.zyrexDrawSpan(id), fp = G.wildBodyFootprint(id);
    if (s.h > (fp.depth || 0) + 1) tall.push({ id, h: +s.h.toFixed(2), gap: (fp.depth || 0) + 1 });
  }
  ok(typeof G.zyrexDrawSpan === 'function', 'zyrexDrawSpan exists · the height comes off the same bboxes the width always did');
  const A = G.zyrexDrawSpan('anciuxor');
  ok(A.h > 4, `★★★★ Anciuxor measures ${A.h.toFixed(2)} tiles tall · the old lattice gave it a 2-tile slot`);
  ok(A.w > 4, `★★ and ${A.w.toFixed(2)} wide · that half was already right, which is why only the ranks piled up`);
  ok(tall.length >= 30,
     `★★★★ ${tall.length} of the 38 species with sheets draw taller than wildBodyFootprint.depth implies · `
   + 'that field answers a COLLISION question (how many rows do the feet block) and was being asked a DRAWING one');
  // ★★ the party step must now report the drawn height, not the blocked depth
  G.player.party = [{ speciesId:'anciuxor', name:'a', hp:10 }];
  const [w, h] = G.partyFormationStep();
  ok(h > 4, `★★★★ partyFormationStep returns height ${h.toFixed(2)} for an Anciuxor party · it returned 2 before`);
  ok(w > 4, `  and width ${w.toFixed(2)}`);
}

H('★★★★ NOBODY STANDS ON ANYBODY · all four facings, three party shapes');
{
  for (const [label, ids] of [['THREE GIANTS', GIANTS], ['SIX MIXED', MIXED], ['SIX GIANTS', SIX]]){
    for (const facing of FACINGS){
      const r = survey(ids, facing);
      const pairs = ids.length * (ids.length - 1) / 2;
      ok(r.bad === 0,
         `  ${label.padEnd(12)} ${facing.padEnd(5)} · ${r.bad}/${pairs} overlapping pairs`
       + (r.bad ? ` · worst ${r.worst} tiles` : '') + ` · lattice ${r.stations} stations`);
    }
  }
}

H('★★★★ AND IT IS THE SAME WHICHEVER WAY HE WALKS · the rotation bug, by name');
{
  // ★★★★ THIS IS THE BLOCK THAT WOULD HAVE CAUGHT THE SCREENSHOT. The old
  //   formation was clean walking north and a pile walking east, because the
  //   steps did not turn with the axes. Comparing facings to each other —
  //   rather than checking each one against "looks fine" — is what makes that
  //   asymmetry impossible to ship.
  for (const [label, ids] of [['SIX GIANTS', SIX], ['SIX MIXED', MIXED]]){
    const worst = {};
    for (const facing of FACINGS) worst[facing] = survey(ids, facing).worst;
    const spread = Math.max(...Object.values(worst)) - Math.min(...Object.values(worst));
    ok(spread < 0.2,
       `★★★★ ${label} · overlap is ${JSON.stringify(worst)} across the four facings · `
     + 'no direction of travel is worse than another');
  }
  // ★★★★ THE SEAT ORDER TURNS WITH HIM, which is the whole repair. The
  //   lattice underneath is the same shape whichever way he walks — my first
  //   fix swapped its axes too, and measuring that against the ranking alone
  //   showed the swap was strictly worse (three giants walking east: 100/50/0%
  //   visible with it, 100/84/83% without). What has to change with the facing
  //   is which seats get handed out FIRST, because that is where the screen
  //   edges actually bite.
  G.player.party = SIX.map(id => ({ speciesId:id, name:id, hp:10 }));
  walk('up');    const vert = G.partyFormation();
  walk('right'); const horz = G.partyFormation();
  ok(JSON.stringify(vert) !== JSON.stringify(horz),
     '★★★ north and east hand out DIFFERENT seats first · a single fixed order cannot be right for both');
  ok(vert.length === horz.length,
     `★★ out of the same ${vert.length} seats · it is a reordering, not a second lattice`);
  ok(G.FORM_VIEW_HALF_X > G.FORM_VIEW_HALF_Y,
     `★★ and the screen bounds say why · ${G.FORM_VIEW_HALF_X} columns of room to each side, ${G.FORM_VIEW_HALF_Y} rows · `
   + 'a 20x11 viewport is not square and neither is the room behind him');
}

H('★★★★ EVERY MEMBER GETS ITS OWN STATION · the modulo alias');
{
  // ★★★★ _claimFormationSlot walked SUMMON_FORMATION (the default 2x2 list)
  //   while _formationTile indexed partyFormation() and took `% length`. A
  //   unique slot INDEX is only a unique STATION if both ends agree which list
  //   the index is into — and the party-stepped list is SHORTER, so a large
  //   party wrapped two members onto one tile.
  for (const facing of FACINGS){
    const r = survey(SIX, facing);
    ok(r.seats === SIX.length,
       `  ${facing.padEnd(5)} · ${r.seats} distinct stations for ${SIX.length} members`);
  }
}

H('★★★★ AND THE CLAIM WALKS THE LIST THE STATIONS COME FROM');
{
  // ★★★★ _claimFormationSlot handed out the first unused index into
  //   SUMMON_FORMATION — the default 2x2 list — while _formationTile indexed
  //   partyFormation() and took `% length`. A unique slot INDEX is only a
  //   unique STATION if both ends agree which list it indexes, and the
  //   party-stepped list is the shorter of the two, so a big party wrapped two
  //   members onto one tile. The overlap survey above cannot see this: it
  //   reads stations directly. Only driving the real claim can.
  const src = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8').replace(/^\s*\/\/.*$/gm, '');
  const i = src.indexOf('function _claimFormationSlot');
  const body = src.slice(i, src.indexOf('\n}', i));
  ok(i > 0 && !/SUMMON_FORMATION/.test(body),
     '★★★★ _claimFormationSlot no longer mentions the default SUMMON_FORMATION at all');
  ok(/partyFormation\(\)/.test(body),
     '★★★ it claims out of partyFormation() · the same list _formationTile reads');
  // and the live lattice really is shorter than the default, which is what
  // made the mismatch bite rather than merely being untidy
  G.player.party = SIX.map(id => ({ speciesId:id, name:id, hp:10 }));
  walk('up');
  ok(G.partyFormation().length < G.SUMMON_FORMATION.length,
     `★★★ the giant lattice holds ${G.partyFormation().length} seats against the default's `
   + `${G.SUMMON_FORMATION.length} · indices past the short list wrapped, which is two Zyrex on one tile`);
}

H('★★★ THE LAWS .827 AND .874 ESTABLISHED ALL SURVIVE');
{
  G.player.party = SIX.map(id => ({ speciesId:id, name:id, hp:10 }));
  walk('up');
  const F = G.partyFormation();
  ok(F.every(p => p[1] >= 0),
     `★★★ every one of the ${F.length} stations is level with him or BEHIND him (ly >= 0) · `
   + 'Creator: "dont make your zyrex walk in front of you"');
  ok(F.every(p => !(Math.abs(p[0]) <= 1 && Math.abs(p[1]) <= 1)),
     '★★ and nothing is close enough to crowd him');
  // ★★★ A LONE ZYREX STILL FALLS IN AT HIS BACK — when it can.
  for (const facing of FACINGS){
    walk(facing);
    G.player.party = [{ speciesId:'snok', name:'snok', hp:10 }];
    const one = G.partyFormation()[0];
    ok(one[0] === 0 && one[1] > 0,
       `  ${facing.padEnd(5)} · a lone ordinary Zyrex takes the centre station directly behind him ([${one}])`);
  }
  // ★★★★ AND A GIANT DELIBERATELY DOES NOT, because it cannot.
  //   A body needs at least its own height of clearance not to cover Rizer,
  //   and at most (6.5 - height) for its head to stay on screen. For a
  //   4.28-tile Anciuxor those two demands cross, so there is NO legal station
  //   directly behind him — and the old lattice's answer was to use one
  //   anyway and show 35% of the creature. The wing is not a compromise here,
  //   it is the only fully visible seat there is.
  walk('down');
  G.player.party = [{ speciesId:'anciuxor', name:'a', hp:10 }];
  const g = G.partyFormation()[0];
  ok(g[1] === 0 && Math.abs(g[0]) > 1,
     `★★★★ a lone Anciuxor walking south is given a WING ([${g}]) rather than a station it would hang off the screen from`);
}

H('★★★★ AND YOU CAN ACTUALLY SEE THEM · measured as visible sprite AREA');
{
  // ★★★★ REMOVING THE OVERLAP WAS ONLY HALF THE SENTENCE. "I cant see all
  //   their beautiful sprites" is answered by how much of each body lands
  //   inside the viewport, not by how tidy the station list looks — and a
  //   Zyrex with its head off the top edge is exactly as unseen as one buried
  //   in a friend. This is the assertion that speaks to what the Creator said.
  const clamp = (v) => Math.max(0, v);
  const seen = (ids, facing) => {
    const r = survey(ids, facing);
    return r.bodies.map(b => {
      const vx = clamp(Math.min(b.x1, G.FORM_VIEW_HALF_X + 1) - Math.max(b.x0, -G.FORM_VIEW_HALF_X - 1));
      const vy = clamp(Math.min(b.y1, G.FORM_VIEW_HALF_Y + 1.5) - Math.max(b.y0, -G.FORM_VIEW_HALF_Y - 1.5));
      return Math.round(100 * (vx * vy) / (b.w * b.h));
    });
  };
  const MID = ['snok','elzoran','phrenetic','vengrizz','mealux','xytabyte'];
  for (const facing of FACINGS){
    const v = seen(MID, facing);
    ok(v.every(p => p >= 95),
       `★★★★ ${facing.padEnd(5)} · a full six-Zyrex party is ${v.join('% / ')}% visible · all six, whichever way he walks`);
  }
  for (const facing of FACINGS){
    const v = seen(['anciuxor'], facing);
    ok(v[0] >= 95,
       `★★★★ ${facing.padEnd(5)} · a lone ANCIUXOR — the biggest body in the game — is ${v[0]}% visible `
     + '(it was 35% walking south before the seats were ranked)');
  }
  // ★★ THE HONEST LIMIT, STATED RATHER THAN HIDDEN. Six Anciuxor-sized bodies
  //   need about thirty tiles of width and the viewport has twenty, and
  //   walking sideways the rear-only law leaves only the half-screen behind
  //   him. They cannot all be on camera at once. What the fix guarantees is
  //   that the ones you CAN see are whole — the deeper ranks hold a Zyrex the
  //   camera has not reached yet, never two Zyrex in the same pixels.
  const vg = seen(SIX, 'up');
  ok(vg.filter(p => p >= 80).length >= 5,
     `★★★ six giants walking north · ${vg.filter(p => p >= 80).length} of 6 are 80%+ visible (${vg.join('/')})`);
  ok(survey(SIX, 'left').bad === 0 && survey(SIX, 'up').bad === 0,
     '★★ and the overflow never overlaps · off camera is a limit, on top of each other is a bug');
}

console.log(f ? `\n❌ ${f} failed`
  : '\n✅ rows stepped by drawn HEIGHT · seats ranked by what the camera shows · one station each · nobody buried in anybody');
process.exit(f ? 1 : 0);
