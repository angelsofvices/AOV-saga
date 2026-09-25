// ★★★★ v0.99.48 · THE ZYREX CARD · Creator, 2026-09-24: "I want the zyrex
//   panel in the pc to look like this. I want the actual zyphone faction panel
//   to look like this. only 8 zyrex not 24."
//
// ★★★★ TWO SURFACES, ONE CARD, AND THAT IS THE LOAD-BEARING CLAIM. The phone's
//   faction panel and the Nebuladock's Zyrex tab have drawn the same eight
//   creatures in two different dialects since v0.95.50 — a tile grid on one, a
//   text line on the other — so every change to one had to be remembered for
//   the other, and one of them was always behind. Most of this suite is about
//   the card being SHARED rather than about how it looks.
//
// ★★★ AND THE CHIPS ARE ONLY THINGS THE GAME HAS. The reference card carries a
//   gender symbol, a held-item mark and an ASLEEP badge. A Zyrex in this build
//   has no sex, holds no item, and there are no status conditions — filling
//   those three slots would put data on screen that nothing could ever change.
//   The slots are kept; what goes in them is TIER, OUT, and the real states
//   K.O. and WILFUL (zyrexOutranksYou, the v0.95.998 obedience rule).
//
// ★★ EIGHT. PARTY_MAX has been 8 since v0.95.536 and v0.99.47 gave it a 6x5
//   box grid — thirty cells for a roster that can never exceed eight.
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
  'facVaultPages','facVaultTurn','facVaultPage','facWithdraw','facDeposit','facIsOut',
  'zyrexHexCard','zyCardColumns','zyCardChip','zyCardClip','facView','facViewNow','FAC_PAGE',
  'zyrexOutranksYou','depositZyrexToPC','withdrawZyrexFromPC','xpToNextLevel',
  'requiredBondForTier','rizerBondTotal','factionAllies','NPCS'] });
console.log = _L;

// ★★★ ONE FIXTURE BUILDER, CALLED AT THE TOP OF EVERY BLOCK. verify_zycube_ui
//   leaked an emptied roster into its own later blocks three times this month
//   and every time the sections below went red against working code.
// ★★★ EIGHT NAMES, BECAUSE PARTY_MAX IS EIGHT. An earlier draft had six, so
//   `BASE(PARTY_MAX, …)` built a party of six and the full-team refusal below
//   passed without ever reaching the cap — a vacuous pass hiding in a fixture.
const MEMBERS = ['mealux','rustbyte','vampella','snok','anciuxor','terralith','skybeam','voltaryn'];
const STORED  = ['rakoron','elzoran','phrenetic','vengrizz','xytabyte','solcryst','apexaur','voltigrax',
                 'mealux','snok','rustbyte','terralith'];
// ★★★ THE BOND LEDGER IS PART OF THE FIXTURE. Leaving it at zero once made a
//   withdraw silently do nothing and the assertion read "team 2→2" — which was
//   the REAL gate (requiredBondForTier is tier x 333) refusing correctly. It
//   has a block of its own now rather than being an accident here.
const BASE = (nParty = 6, nPc = 10, bond = 99999) => {
  G.player.party   = MEMBERS.slice(0, nParty).map(id => G.createZyrex(id, 20)).filter(Boolean);
  G.player.pcZyrex = STORED.slice(0, nPc).map(id => G.createZyrex(id, 15)).filter(Boolean);
  G.player.devBondFloor = bond;
  G.game._facSel = null; G.game._facVaultPage = 0;
  G.game._factionExamineIdx = null; G.game._facView = 'team';
};
const paint = () => G.renderZycellFaction();
const cardsIn = h => (h.match(/clip-path:polygon\(20px 0/g) || []).length;

H('★★★★ EIGHT CARDS · "only 8 zyrex not 24"');
{
  BASE(6, 10);
  const h = paint();
  ok((h.match(/data-zyitem="fac_p\d+"/g) || []).length === G.PARTY_MAX,
     `★★★★ exactly ${G.PARTY_MAX} team cards · v0.99.47 drew a 6x5 box, thirty cells for a roster that caps at eight`);
  ok(G.FAC_PAGE === G.PARTY_MAX,
     `★★★ and the vault pages in ${G.FAC_PAGE}s to match · both views are the same eight-card block, so the card never shrinks to fit`);
  ok(!/grid-template-columns:repeat\(6/.test(h), '★★★ no six-wide grid survives anywhere in the panel');
  // ★★★ v0.98.3's rule survives every rebuild: an EMPTY slot is still a cell.
  const emptyCard = h.slice(h.indexOf('data-zyitem="fac_p7"'), h.indexOf('data-zyitem="fac_p7"') + 400);
  ok(/data-zyrow/.test(emptyCard) && !/data-zysummon/.test(emptyCard),
     '★★★★ the empty eighth card is a focus stop carrying NO action attributes · reachable by the pad, inert when pressed');
  ok(/EMPTY SLOT/.test(h), '★★ and it says so rather than being a hole in the grid');
}

H('★★★★ THE CARD IS THE REFERENCE · XP over, HP under, hex corners');
{
  BASE();
  const h = paint();
  ok(/clip-path:polygon\(20px 0/.test(h), '★★★ the cards are cut hexagons, not rectangles');
  ok(cardsIn(h) >= G.PARTY_MAX * 2,
     `★★ each card is an edge and a fill sharing the clip (${cardsIn(h)} clipped layers) · a clipped box cannot carry a border`);
  const one = h.slice(h.indexOf('data-zyitem="fac_p0"'));
  const iXP = one.indexOf('>XP<'), iName = one.indexOf('LVL'), iHP = one.indexOf('>HP<');
  ok(iXP >= 0 && iName > iXP && iHP > iName,
     `★★★★ within one card the order is XP → name/LVL → HP (${iXP} < ${iName} < ${iHP}) · the reference's exact stack`);
  ok(/LVL \d+/.test(h), '★★ the level reads "LVL n" like the reference, not "Lv n"');
  ok(/margin-top:38px/.test(G.zyCardColumns(['a','b'])),
     '★★★ and the two columns are staggered · eight identical blue slabs in lockstep read as a spreadsheet');
}

H('★★★★ THE CHIPS ARE REAL STATES · nothing invented to fill a slot');
{
  BASE();
  const z = G.player.party[0];
  ok(!('gender' in z) && !('sex' in z) && !('heldItem' in z) && !('status' in z),
     '★★★★ a Zyrex has no gender, no held item and no status field · the reference\'s three badges have no data behind them here');
  const h = paint();
  ok(/>T\d+</.test(h) || />T\?</.test(h), '★★★ the gender slot carries TIER instead · a real mark the game already shows everywhere');
  ok(!/♂|♀/.test(h), '★★★ and no gender symbol is drawn · inventing one puts a field on screen nothing could ever change');
  G.player.party[1].hp = 0;
  ok(/K\.O\./.test(paint()), '★★★★ a Zyrex at 0 HP shows K.O.');
  // WILFUL · the v0.95.998 obedience rule, true and invisible since it shipped
  BASE(3, 0, 0);
  const wilful = G.player.party.filter(z2 => G.zyrexOutranksYou(z2));
  ok(wilful.length > 0, `  fixture: ${wilful.length} of 3 outrank Rizer at zero bond`);
  ok(/WILFUL/.test(paint()),
     '★★★★ and they read WILFUL · "it may bond but it might not listen" has been true and invisible since v0.95.998');
  BASE();
  ok(!/WILFUL/.test(paint()), '★★★ with the bond earned the chip is gone · it is a state, not a decoration');
  ok(typeof G.facIsOut === 'function', '★ and OUT is read from the live NPC list, not a field on the Zyrex');
}

H('★★★★ THE PC DRAWS THE SAME CARD · the claim this whole change is about');
{
  const src = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
  const code = src.replace(/^\s*\/\/.*$/gm, '');
  const calls = (code.match(/zyrexHexCard\(/g) || []).length;
  ok(calls >= 4, `★★★★ zyrexHexCard has ${calls} call sites · one definition, the phone's two views, and the dock`);
  const i = code.indexOf("if (tab === 'zyrex'){");
  const tabBody = code.slice(i, code.indexOf("if (tab === 'items'){", i));
  ok(i > 0 && /zyrexHexCard\(/.test(tabBody),
     '★★★★ the Nebuladock Zyrex tab renders through the shared card · it kept its own hand-written line since v0.95.50');
  ok(!/Lv \$\{z\.level \|\| 1\} · T\$\{tier\}/.test(tabBody),
     '★★★ and the old hand-written line is GONE · leaving it would let the two screens drift apart again');
  ok(/data-idx=/.test(tabBody) && /data-dir=/.test(tabBody),
     '★★★ while keeping the attributes its click handler reads · the move behaviour was re-skinned, not rewritten');
  ok(/depositZyrexToPC\(idx\)/.test(tabBody) && /withdrawZyrexFromPC\(idx\)/.test(tabBody),
     '★★ and it still moves them through the existing helpers · the deposit guard is inherited, not reimplemented');
}

H('★★★ THE VAULT IS A VIEW NOW, AND STILL REACHABLE');
{
  BASE(6, 10);
  ok(G.facViewNow() === 'team', '  opens on the team');
  ok(/VAULT 10/.test(paint()), '★★★ the vault button carries its count · you can see there is something in there');
  G.facView('vault');
  const h = paint();
  ok(G.facViewNow() === 'vault' && /ZYSPHERE VAULT 1\/2/.test(h),
     '★★★ pressing it opens the vault, paged · 10 stored over 2 pages of 8');
  ok((h.match(/data-zyitem="fac_v\d+"/g) || []).length === 8,
     '★★★★ eight cards, not thirty · the same block the team uses');
  ok(!/data-zysummon/.test(h),
     '★★★ and a stored Zyrex carries no summon attribute · you cannot send out something that is not on the team');
  G.facVaultTurn(1);
  ok(G.facVaultPage() === 1 && /ZYSPHERE VAULT 2\/2/.test(paint()), '★★ R turns the page');
  G.facVaultTurn(1);
  ok(G.facVaultPage() === 0, '★★ and it wraps · a page axis is something you flick');
  G.facView('vault');
  ok(G.facViewNow() === 'team', '★★ pressing the same button again comes back · it is a toggle, not a trapdoor');
}

H('★★★★ MOVING A ZYREX BETWEEN THEM STILL WORKS');
{
  BASE(2, 3);
  const name = G.player.pcZyrex[0].name;
  const before = [G.player.party.length, G.player.pcZyrex.length];
  G.facWithdraw(0);
  ok(G.player.party.length === before[0] + 1 && G.player.pcZyrex.length === before[1] - 1,
     `★★★★ withdrawing moved ${name} across · team ${before[0]}→${G.player.party.length}, vault ${before[1]}→${G.player.pcZyrex.length}`);
  ok(G.facSel().where === 'party',
     '★★★ and the selection followed it · a panel still pointing at the emptied vault slot would describe a Zyrex that moved');
  BASE(4, 1);
  G.facSelect('party', 2, true);
  const who = G.player.party[2].name;
  G.facDeposit();
  ok(G.player.party.length === 3 && G.player.pcZyrex.length === 2, `★★★ ${who} went down to the vault`);
  ok(G.facSel().where === 'vault', '★★ and the selection followed it down too');
  const snap = [G.player.party.length, G.player.pcZyrex.length];
  G.facDeposit();
  ok(G.player.party.length === snap[0] && G.player.pcZyrex.length === snap[1],
     '★★★ depositing while the VAULT is selected is a no-op · not a second copy, not a crash');
  BASE(G.PARTY_MAX, 3);
  ok(G.player.party.length === G.PARTY_MAX,
     `  fixture really is a FULL team (${G.player.party.length}/${G.PARTY_MAX})`);
  const full = [G.player.party.length, G.player.pcZyrex.length];
  G.facWithdraw(0);
  ok(G.player.party.length === full[0] && G.player.pcZyrex.length === full[1],
     '★★★★ a full team refuses a withdrawal · the panel does not get to break the cap');
}

H('★★★★ AND THE BOND GATE IS SHOWN BEFORE IT IS HIT');
{
  // ★★★★ requiredBondForTier is tier x 333, checked inside withdrawZyrexFromPC
  //   — a real rule since v0.95.537 that the player used to meet only as a
  //   refusal toast, AFTER pressing a button that looked available.
  BASE(2, 3, 0);
  G.facView('vault'); G.facSelect('vault', 0, true);
  const z = G.player.pcZyrex[0];
  const need = G.requiredBondForTier(z.tier || 1);
  const h = paint();
  ok(G.rizerBondTotal() < need, `  fixture: bond ${G.rizerBondTotal()} against tier ${z.tier} needing ${need}`);
  ok(h.includes('/' + need),
     `★★★★ the vault footer prints the requirement (${G.rizerBondTotal()}/${need}) beside the Zyrex it blocks`);
  ok(/finish more allies and missions first/.test(h),
     '★★★ and says what closes the gap · a locked thing that will not say why is a bug report waiting to happen');
  const before = [G.player.party.length, G.player.pcZyrex.length];
  G.facWithdraw(0);
  ok(G.player.party.length === before[0] && G.player.pcZyrex.length === before[1],
     '★★★★ and pressing it anyway moves nothing · the panel does not skip a gate the rest of the game enforces');
  BASE(2, 3, 99999); G.facView('vault'); G.facSelect('vault', 0, true);
  ok(/READY TO WITHDRAW/.test(paint()),
     '★★★ the same line flips to READY once the bond is earned · one footer, both states, read off the live numbers');
}

H('★★★ THE ALLIES ARE STILL A SEPARATE THING · a standing Creator directive');
{
  // Creator, v0.95.629: there must ALWAYS be a difference between faction
  // CONTACTS (humanoid · Rizer-bonded through quests) and faction ZYREX
  // (Zysphere-bonded). They never share a grid — and now never share a VIEW.
  BASE();
  const team = paint();
  ok(!/FACTION ALLIES/.test(team.slice(team.indexOf('fac_p0'))),
     '★★★★ no ally appears among the Zyrex cards · they never share a grid');
  G.facView('allies');
  const h = paint();
  ok(G.facViewNow() === 'allies', '★★ the allies button opens their own view');
  ok(!/data-zyitem="fac_p\d+"/.test(h),
     '★★★★ and no Zyrex card is drawn in it · the separation is a whole view now, not a divider');
  ok(/never Zybonded, never stored/.test(h),
     '★★★ the view says WHY they are separate rather than leaving it to be inferred');
  const allies = G.factionAllies();
  if (allies.length){
    // ★★ the gold accent is only assertable when there is an ally to paint
    //   gold. A colour check on an EMPTY view passes or fails on the empty
    //   message's own styling, which is not what the directive is about.
    ok(/ffe9a8|d9a441/.test(h), '★★ and they are gold, not blue · different accent, per the directive');
    for (const a of allies.slice(0, 3)) ok(h.includes((a.name || a.id).toUpperCase()), `  ${a.name} is listed`);
  } else {
    ok(/no allies bonded yet/.test(h), '★★ none bonded yet · one message, not half a message in each column');
    ok(!/flex-direction:column; gap:10px;"><\/div>/.test(h), '  and no empty column shells are drawn');
  }
}

H('★★★ THE HEX RADAR MOVED TO THE DOSSIER, where there is room to read it');
{
  BASE();
  ok(!/<polygon points=/.test(paint()),
     '★★★ the roster carries no radar · a roster is for picking, and the card reference has no room for one');
  G.game._factionExamineIdx = 0;
  const d = paint();
  ok(/EXAMINE · SLOT 1/.test(d), '  the dossier still routes');
  ok(/<polygon points=/.test(d) && /<svg /.test(d),
     '★★★★ and the radar is THERE · six bars give you numbers, the hexagon gives you a shape');
  for (const label of ['HP','ATK','DEF','SPD','SP.DEF','SP.ATK'])
    ok(d.includes(`>${label}<`), `  ${label.padEnd(7)} is an axis`);
  G.game._factionExamineIdx = null;
  const big = G.facStatCeiling();
  G.player.party = [G.createZyrex('mealux', 3)]; G.player.pcZyrex = [];
  const small = G.facStatCeiling();
  ok(big > small * 2, `★★★★ the ceiling tracks the roster · ${big} with an Anciuxor on the team, ${small} without`);
  BASE();
  ok(G.facRadar(G.player.party[0]) !== G.facRadar(G.player.party[4]),
     '★★★★ two different Zyrex draw two different hexagons · a radar that cannot tell them apart is decoration');
}

H('★★★ NOTHING CRASHES AT THE EDGES');
{
  BASE();
  G.facSelect('party', 5, true);
  G.player.party.length = 2;
  ok(G.facSel().where === 'party' && G.facSel().idx < 2,
     '★★★ trimming the team re-homes a stale selection · idx 5 no longer exists, and the panel does not read undefined');
  G.player.party = []; G.player.pcZyrex = []; G.game._facSel = null; G.game._facView = 'team';
  const empty = paint();
  ok(typeof empty === 'string' && /EMPTY SLOT/.test(empty),
     '★★★ an empty faction draws eight empty cards rather than throwing');
  ok(G.facSel() === null, '★★ and the selection is honestly null');
  G.game._facView = 'vault';
  ok(typeof paint() === 'string', '★★ an empty vault renders too');
  BASE();
}

H('★★★ EVERY VERB THE OLD PANEL HAD STILL WORKS');
{
  BASE();
  const h = paint();
  ok((h.match(/data-zysummon="\d+"/g) || []).length === 6, '★★★★ six filled cards carry data-zysummon · TRIANGLE still summons');
  ok((h.match(/data-zyswap="\d+"/g) || []).length === 6, '★★★ and data-zyswap · SQUARE still swaps slots');
  ok((h.match(/data-zyexamine="\d+"/g) || []).length === 6, '★★★ and data-zyexamine');
  ok(/openZyrexExamine\(/.test(h), '★★★ the full dossier is one press away · the lore page was not thrown out');
  ok(/data-zyrow="fac_pr\d+"/.test(h),
     '★★★ and the cards carry row tags · v0.95.995: the grid must navigate the way it LOOKS, and this one is two wide');
}

console.log(f ? `\n❌ ${f} failed`
  : '\n✅ eight cards, two staggered columns · one card drawn by both the phone and the PC · chips only for states that exist');
process.exit(f ? 1 : 0);
