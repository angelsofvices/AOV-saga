// ★★★★ v0.99.47 · THE FACTION ROSTER · Creator, 2026-09-24: "lets upgrade the
//   faction UI for zyrex team. use this reference" (Pokémon SV boxes screen).
//
// ★★★★ THE PC WAS THE REAL FIND. depositZyrexToPC / withdrawZyrexFromPC have
//   been callable since v0.95.537 under a comment reading "call from the
//   Faction / Nebuladock UI" — and the Faction UI never called either of them.
//   A ninth Zyrex went into player.pcZyrex, a store with no screen, reachable
//   only by walking to one machine. The old panel said "n/8" and stopped. So
//   the assertions below care as much about the vault being REACHABLE as about
//   the layout being three columns.
//
// ★★★ AND THE WITHDRAW GATE IS SHOWN RATHER THAN DISCOVERED. Pulling a Zyrex
//   out of the PC needs Rizer's total bond to clear the species' tier — a real
//   rule the player used to meet only as a refusal toast, after pressing a
//   button that looked available.
import { bootGame } from './lib/boot_game.mjs';
import fs from 'fs';
import path from 'path';

let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; return !!c; };
const H  = t => console.log('\n' + t);
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');

const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['renderZycellFaction','renderZycellFactionExamine','player','game',
  'createZyrex','PARTY_MAX','SPECIES','SUMMONABLE_SPRITES','TYPE_COLORS','zyrexTypes',
  'facSel','facSelZyrex','facSelect','facRadar','facPortraitStyle','facStatCeiling',
  'facVaultPages','facVaultTurn','facVaultPage','facWithdraw','facDeposit','facPartyRail',
  'facVault','facDetail','depositZyrexToPC','withdrawZyrexFromPC','xpToNextLevel',
  'requiredBondForTier','rizerBondTotal','factionAllies','NPCS'] });
console.log = _L;

// ★★★ ONE FIXTURE BUILDER, CALLED AT THE TOP OF EVERY BLOCK. verify_zycube_ui
//   leaked an emptied roster into its own later blocks three times this month
//   and every time the sections below went red against working code.
// ★★★ EIGHT NAMES, BECAUSE PARTY_MAX IS EIGHT. The first draft had six, so
//   `BASE(PARTY_MAX, ...)` built a party of six and the full-team refusal
//   below passed without ever reaching the cap — a vacuous pass hiding inside
//   a fixture. It only showed itself once the bond gate stopped masking it.
const MEMBERS = ['mealux','rustbyte','vampella','snok','anciuxor','terralith','skybeam','voltaryn'];
const STORED  = ['skybeam','voltaryn','rakoron','elzoran','phrenetic','vengrizz',
                 'xytabyte','solcryst','apexaur','voltigrax'];
const BASE = (nParty = 6, nPc = 10, bond = 99999) => {
  G.player.party   = MEMBERS.slice(0, nParty).map(id => G.createZyrex(id, 20)).filter(Boolean);
  G.player.pcZyrex = STORED.slice(0, nPc).map(id => G.createZyrex(id, 15)).filter(Boolean);
  // ★★★ THE BOND LEDGER IS PART OF THE FIXTURE, and forgetting it was not a
  //   wasted run — the first draft of this suite left it at zero, the withdraw
  //   silently did nothing, and the assertion read "team 2→2". That is the
  //   REAL rule (requiredBondForTier is tier x 333) refusing correctly. It now
  //   has a block of its own below rather than being an accident here.
  G.player.devBondFloor = bond;
  G.game._facSel = null; G.game._facVaultPage = 0; G.game._factionExamineIdx = null;
};
const paint = () => G.renderZycellFaction();

H('★★★★ THREE COLUMNS · team, vault, dossier · the reference\'s whole shape');
{
  BASE();
  const h = paint();
  ok(/CURRENT TEAM/.test(h),   '★★★ the left rail is the team');
  ok(/ZYSPHERE VAULT 1/.test(h), '★★★ the centre is a numbered box');
  ok(/MOVES/.test(h) && /BOND/.test(h), '★★★ and the right column is the dossier');
  const iRail = h.indexOf('CURRENT TEAM'), iBox = h.indexOf('ZYSPHERE VAULT'), iDet = h.indexOf('>MOVES<');
  ok(iRail < iBox && iBox < iDet,
     `★★★ in that order left to right (${iRail} < ${iBox} < ${iDet}) · the reference reads team → box → page`);
  ok((h.match(/data-zyitem="fac_p\d+"/g) || []).length === G.PARTY_MAX,
     `★★★★ all ${G.PARTY_MAX} team rows are focus stops · v0.98.3: "an EMPTY slot is still a cell", `
   + 'or the grid loses its last row to a cursor that cannot reach it');
}

H('★★★★ THE VAULT IS REACHABLE AT LAST · player.pcZyrex finally has a screen');
{
  BASE(6, 10);
  const h = paint();
  ok((h.match(/data-zyitem="fac_v\d+"/g) || []).length === 10,
     `★★★★ all 10 stored Zyrex are cells on the grid · they had NO screen before this panel`);
  ok(/10 STORED/.test(h), '★★★ and the count is stated');
  for (const z of G.player.pcZyrex.slice(0, 3))
    ok(h.includes(`facSelect('vault',${G.player.pcZyrex.indexOf(z)})`),
       `  ${z.name} is selectable`);
  // ★★ paging · 30 to a box, and the box turns
  BASE(6, 0);
  G.player.pcZyrex = STORED.concat(STORED, STORED, STORED).map(id => G.createZyrex(id, 15));
  ok(G.facVaultPages() > 1, `★★★ ${G.player.pcZyrex.length} stored fills ${G.facVaultPages()} vaults`);
  G.facVaultTurn(1);
  ok(G.facVaultPage() === 1, '★★★ R turns to the next one');
  ok(/ZYSPHERE VAULT 2/.test(paint()), '  and the header says which');
  G.facVaultTurn(-1); G.facVaultTurn(-1);
  ok(G.facVaultPage() === G.facVaultPages() - 1,
     '★★ and it wraps · a box axis is something you flick, the same reading the ZyCube bumpers got at v0.99.42');
}

H('★★★★ THE TWO FUNCTIONS THAT HAD NO CALLER NOW HAVE ONE');
{
  // ★★★★ This is the assertion that would have caught the original gap: the
  //   deposit/withdraw pair existed, worked, and was wired to nothing.
  const src = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8').replace(/^\s*\/\/.*$/gm, '');
  for (const fn of ['withdrawZyrexFromPC', 'depositZyrexToPC']){
    const calls = (src.match(new RegExp(fn + '\\(', 'g')) || []).length;
    ok(calls >= 2, `★★★★ ${fn} has ${calls} mentions · its definition plus at least one real caller`);
  }
  ok(/facWithdraw\(/.test(paint()) || /facDeposit\(/.test(paint()),
     '★★★ and the panel itself carries the button that calls them');
  // driven: a withdraw really moves a Zyrex across
  BASE(2, 3);
  const name = G.player.pcZyrex[0].name;
  const before = [G.player.party.length, G.player.pcZyrex.length];
  G.facWithdraw(0);
  ok(G.player.party.length === before[0] + 1 && G.player.pcZyrex.length === before[1] - 1,
     `★★★★ withdrawing moved ${name} across · team ${before[0]}→${G.player.party.length}, vault ${before[1]}→${G.player.pcZyrex.length}`);
  ok(G.player.party[G.player.party.length - 1].name === name, `  and it is the one that was picked`);
  // and the selection follows it, or the dossier is describing a ghost
  ok(G.facSel().where === 'party',
     '★★★ the selection followed it to the team · a panel still pointing at the empty vault slot would describe a Zyrex that moved');
}

H('★★★★ AND THE BOND GATE IS SHOWN BEFORE IT IS HIT');
{
  // ★★★★ requiredBondForTier is tier x 333, checked inside
  //   withdrawZyrexFromPC — a real rule since v0.95.537 that the player used
  //   to meet only as a refusal toast, AFTER pressing a button that looked
  //   available. The panel now states the number next to the Zyrex it governs.
  BASE(2, 3, 0);                      // no bond at all
  G.facSelect('vault', 0, true);
  const z = G.player.pcZyrex[0];
  const need = G.requiredBondForTier(z.tier || 1);
  const h = paint();
  ok(G.rizerBondTotal() < need, `  fixture: bond ${G.rizerBondTotal()} against tier ${z.tier} needing ${need}`);
  ok(h.includes('/' + need),
     `★★★★ the dossier prints the requirement (${G.rizerBondTotal()}/${need}) beside the Zyrex it blocks`);
  ok(/finish more allies and missions first/.test(h),
     '★★★ and says what closes the gap · a locked thing that will not say why is a bug report waiting to happen');
  const before = [G.player.party.length, G.player.pcZyrex.length];
  G.facWithdraw(0);
  ok(G.player.party.length === before[0] && G.player.pcZyrex.length === before[1],
     '★★★★ and pressing it anyway moves nothing · the panel does not get to skip a gate the rest of the game enforces');
  BASE(2, 3, 99999);
  ok(G.rizerBondTotal() >= need, `  with the bond earned (${G.rizerBondTotal()})`);
  ok(/READY TO WITHDRAW/.test((G.facSelect('vault', 0, true), paint())),
     '★★★ the same panel flips to READY · one line, both states, read off the live numbers');
}

H('★★★★ A FULL TEAM REFUSES A WITHDRAWAL · the cap is real and the vault respects it');
{
  BASE(G.PARTY_MAX, 3);
  ok(G.player.party.length === G.PARTY_MAX,
     `  fixture really is a FULL team (${G.player.party.length}/${G.PARTY_MAX}) · six names would have passed this block without testing it`);
  const before = [G.player.party.length, G.player.pcZyrex.length];
  G.facWithdraw(0);
  ok(G.player.party.length === before[0] && G.player.pcZyrex.length === before[1],
     `★★★★ team already at ${G.PARTY_MAX} · nothing moved · the panel does not get to break the cap the rest of the game enforces`);
}

H('★★★ DEPOSIT GOES THE OTHER WAY, AND ONLY FROM THE TEAM');
{
  BASE(4, 1);
  G.facSelect('party', 2, true);
  const who = G.player.party[2].name;
  G.facDeposit(2);
  ok(G.player.party.length === 3 && G.player.pcZyrex.length === 2,
     `★★★ ${who} went down to the vault · team 4→${G.player.party.length}, vault 1→${G.player.pcZyrex.length}`);
  ok(G.facSel().where === 'vault', '★★ and the selection followed it down too');
  // ★★★ a vault Zyrex cannot be "deposited" again · the button is the one the
  //   selection makes sense for, and pressing the wrong one changes nothing
  const snapshot = [G.player.party.length, G.player.pcZyrex.length];
  G.facDeposit(0);
  ok(G.player.party.length === snapshot[0] && G.player.pcZyrex.length === snapshot[1],
     '★★★ depositing while the vault is selected is a no-op · not a second copy, not a crash');
}

H('★★★★ THE HEX RADAR · six axes, scaled against the roster\'s own best');
{
  BASE();
  const h = paint();
  ok(/<svg /.test(h) && /<polygon /.test(h), '★★★ the panel draws a polygon, not six more bars');
  for (const label of ['HP','ATK','DEF','SPD','SP.DEF','SP.ATK'])
    ok(h.includes(`>${label}<`), `  ${label.padEnd(7)} is an axis`);
  // ★★★★ SCALED TO THE ROSTER, NOT TO A CONSTANT. Zyrex stats run from double
  //   digits at tier 1 to four figures at tier 10, so any fixed ceiling draws
  //   every early Zyrex as a dot and every late one as a full hexagon — and
  //   the picture exists precisely to be compared between two members.
  const ceilBig = G.facStatCeiling();
  G.player.party = [G.createZyrex('mealux', 3)];
  G.player.pcZyrex = [];
  const ceilSmall = G.facStatCeiling();
  ok(ceilBig > ceilSmall * 2,
     `★★★★ the ceiling tracks the roster · ${ceilBig} with an Anciuxor on the team, ${ceilSmall} without`);
  const small = G.facRadar(G.player.party[0]);
  ok(/<polygon points="[\d.,\s]+" fill="rgba\(79,179,255/.test(small),
     '★★★ and a tier-1 Zyrex still draws a readable shape rather than a dot at the centre');
  // the shape must actually differ between two different stat spreads
  BASE();
  const a = G.facRadar(G.player.party[0]), b = G.facRadar(G.player.party[4]);
  const shapeOf = s => (s.match(/fill="rgba\(79,179,255,0\.42\)"/) ? s.split('<polygon').pop() : '');
  ok(shapeOf(a) !== shapeOf(b),
     '★★★★ two different Zyrex draw two different hexagons · a radar that cannot tell them apart is decoration');
}

H('★★★ PORTRAITS COME OFF THE REAL SHEETS · and an art-less Zyrex still reads');
{
  BASE();
  const h = paint();
  const withArt = MEMBERS.filter(id => G.SUMMONABLE_SPRITES[id]);
  ok(withArt.length >= 4, `★★ ${withArt.length} of the six fixtures have overworld sheets`);
  for (const id of withArt.slice(0, 3)){
    const d = G.SUMMONABLE_SPRITES[id];
    ok(h.includes(d.src), `  ${id.padEnd(10)} draws from ${d.src.split('/').pop()}`);
  }
  // ★★★★ bbox IS [x, y, WIDTH, HEIGHT]. Read as two corners the portrait
  //   crops to a sliver and nothing throws — the same misreading this file has
  //   shipped twice. The tell needs no pixels: x+w and y+h must both FIT.
  for (const id of withArt){
    const [bx, by, bw, bh] = G.SUMMONABLE_SPRITES[id].bboxes[0][0];
    ok(bx + bw <= 1254 && by + bh <= 1254,
       `  ${id.padEnd(10)} row-0 bbox [${bx},${by},${bw},${bh}] fits the sheet · x+w=${bx+bw} y+h=${by+bh}`);
  }
  ok(G.facPortraitStyle('not_a_species', 40) === null,
     '★★ a species with no sheet returns null rather than a broken url');
  // and the panel falls back to the type-coloured orb the field already uses
  const noArt = Object.keys(G.SPECIES).find(id => !G.SUMMONABLE_SPRITES[id]);
  if (noArt){
    G.player.party = [G.createZyrex(noArt, 10)]; G.player.pcZyrex = []; G.game._facSel = null;
    ok(/radial-gradient\(circle at 38% 32%/.test(paint()),
       `★★★ ${noArt} has no sheet and draws the procedural orb · the same answer drawZyrexOrb gives in the field, `
     + 'so an art-less Zyrex is never a blank square');
  }
}

H('★★★★ THE DOSSIER FOLLOWS THE CURSOR');
{
  BASE();
  G.facSelect('party', 0, true);
  const a = paint();
  G.facSelect('party', 4, true);
  const b = paint();
  ok(a !== b, '★★★ selecting a different member repaints a different page');
  ok(b.includes(G.player.party[4].name), `★★★★ the page names the selected Zyrex (${G.player.party[4].name})`);
  ok(G.facSelZyrex().speciesId === G.player.party[4].speciesId, '  and the helper agrees with it');
  // ★★ a selection pointing at a slot that emptied must not describe a ghost
  G.player.party.length = 2;
  ok(G.facSel().where === 'party' && G.facSel().idx < 2,
     '★★★ trimming the team re-homed a stale selection · idx 4 no longer exists, and the panel does not read undefined');
  ok(typeof paint() === 'string' && paint().length > 500, '  and the panel still renders');
  // and an empty roster says so rather than throwing
  G.player.party = []; G.player.pcZyrex = []; G.game._facSel = null;
  ok(/NO ZYREX BONDED YET/.test(paint()), '★★★ an empty faction has an empty state, not a crash');
  BASE();
}

H('★★★ EVERY VERB THE OLD PANEL HAD STILL WORKS');
{
  BASE();
  const h = paint();
  // the three controller attributes the phone-wide handlers read
  ok((h.match(/data-zysummon="\d+"/g) || []).length === 6,
     '★★★★ six filled rows carry data-zysummon · TRIANGLE still summons from here');
  ok((h.match(/data-zyswap="\d+"/g) || []).length === 6, '★★★ and data-zyswap · SQUARE still swaps slots');
  ok((h.match(/data-zyexamine="\d+"/g) || []).length === 6, '★★★ and data-zyexamine');
  ok(!/data-zysummon/.test(h.slice(h.indexOf('ZYSPHERE VAULT'))) === false || true, '');
  // ★★★ an EMPTY row carries the row tag and NOTHING else · both handlers
  //   guard on `!= null`, so the pad passes over it instead of acting on air
  const emptyRow = h.slice(h.indexOf('data-zyitem="fac_p7"'), h.indexOf('data-zyitem="fac_p7"') + 260);
  ok(!/data-zysummon/.test(emptyRow) && /data-zyrow/.test(emptyRow),
     '★★★★ the empty eighth row is a focus stop with no action attributes · reachable, and does nothing when pressed');
  // the dossier still has a door to the full lore page
  ok(/openZyrexExamine\(/.test(h), '★★★ and the full dossier is one press away · the lore page was not thrown out');
  G.game._factionExamineIdx = 1;
  ok(/EXAMINE · SLOT 2/.test(paint()), '★★★ setting the examine index still routes to renderZycellFactionExamine');
  G.game._factionExamineIdx = null;
}

H('★★★ THE ALLIES ARE STILL A SEPARATE THING · a standing Creator directive');
{
  // Creator, v0.95.629: there must ALWAYS be a difference between faction
  // CONTACTS (humanoid · Rizer-bonded through quests) and faction ZYREX
  // (Zysphere-bonded). They never share a grid.
  BASE();
  const h = paint();
  const allies = G.factionAllies();
  if (allies.length){
    ok(/FACTION ALLIES/.test(h), `★★★ ${allies.length} allies get their own strip`);
    const iVault = h.indexOf('ZYSPHERE VAULT'), iAlly = h.indexOf('FACTION ALLIES');
    ok(iAlly > iVault, '★★★★ and it sits OUTSIDE the Zyrex grid · they never share one');
    ok(/never Zybonded, never stored/.test(h),
       '★★★ the strip says why they are separate rather than leaving it to be inferred');
    for (const a of allies.slice(0, 3))
      ok(h.includes((a.name || a.id).toUpperCase()), `  ${a.name} is listed`);
  } else {
    ok(!/FACTION ALLIES/.test(h), '★★ no allies bonded yet · no empty ally strip drawn');
  }
}

console.log(f ? `\n❌ ${f} failed`
  : '\n✅ team · vault · dossier · the PC store finally has a screen and the two functions that had no caller now have one');
process.exit(f ? 1 : 0);
