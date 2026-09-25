// ★★★★ v0.99.49 · ONE DOOR INTO THE PARTY.
//
//   Creator, 2026-09-25: "for some reason my party UI doesnt match the active
//   zyrex. make sure the pc (storage) and the zysphere (8 max) always match in
//   gameplay. or else player wont ever know who is in their party."
//
// ★★★★ NOTHING WAS WRONG WITH THE UI. It drew eight because eight is the
//   roster; the ROSTER had thirty-eight in it. PARTY_MAX has been 8 since
//   v0.95.536 and catchZyrex has honoured it and routed the overflow to the PC
//   that whole time — but two writers never went through that door and just
//   pushed:
//     · setDevFactionActor()  · the dev faction toggles
//     · devSummonAllZyrex     · one press, every species in DEV_FACTION_ACTORS
//   So thirty Zyrex were real, summonable and invisible, and the PC — the one
//   place they should have been — stayed empty.
//
// ★★★★ A CAP ENFORCED AT FOUR CALL SITES IS A CAP ENFORCED AT THREE OF THEM the
//   day someone adds a fifth, which is exactly how this happened. This suite
//   cares about the RULE living in one function far more than about any single
//   number, so it drives every writer it can find and then greps for raw
//   pushes that skipped the door.
import { bootGame } from './lib/boot_game.mjs';
import fs from 'fs';
import path from 'path';

let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; return !!c; };
const H  = t => console.log('\n' + t);
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');

const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['player','game','PARTY_MAX','DEV_FACTION_ACTORS','setDevFactionActor',
  'createZyrex','joinParty','enforcePartyCap','addZyrexToRoster','withdrawZyrexFromPC','depositZyrexToPC',
  'requiredBondForTier','rizerBondTotal','SPECIES','isHumanoidAlly','canonType','NPCS',
  'renderZycellFaction','summonedZyrexCount'] });
console.log = _L;

const RESET = (bond = 99999) => {
  G.player.party = []; G.player.pcZyrex = [];
  G.player.devBondFloor = bond;
  G.game._facSel = null; G.game._facView = 'team';
};
const counts = () => [G.player.party.length, G.player.pcZyrex.length];

H('★★★★ THE BUG, REPRODUCED AND THEN NOT · every dev actor at once');
{
  RESET();
  const ids = Object.keys(G.DEV_FACTION_ACTORS || {});
  ok(ids.length > G.PARTY_MAX,
     `  ${ids.length} dev faction actors against a cap of ${G.PARTY_MAX} · the overflow is not hypothetical`);
  for (const id of ids){ try { G.setDevFactionActor(id, true, { silent:true, deferRefresh:true }); } catch(_){} }
  const [p, pc] = counts();
  ok(p <= G.PARTY_MAX,
     `★★★★ party holds ${p} of a maximum ${G.PARTY_MAX} · it held ${ids.length} before this change`);
  ok(pc > 0, `★★★★ and the overflow is IN THE PC · ${pc} stored, where it was 0 before`);
  ok(p + pc === ids.length,
     `★★★★ nobody was lost on the way · ${p} + ${pc} = ${ids.length} · a cap that drops creatures is a worse bug than no cap`);
}

H('★★★★ AND THE SAVES THAT ALREADY OVERFLOWED GET REPAIRED');
{
  // ★★★★ Capping new writes does nothing for a file already carrying
  //   thirty-eight — and that file is the one the Creator is playing.
  RESET();
  G.player.party = Array.from({ length: 38 }, (_, i) => G.createZyrex('snok', i + 1));
  const spilled = G.enforcePartyCap();
  const [p, pc] = counts();
  ok(spilled === 38 - G.PARTY_MAX, `★★★★ a 38-deep save spills ${spilled} · party ${p}, pc ${pc}`);
  ok(p === G.PARTY_MAX, `★★★ the team is ${G.PARTY_MAX} again`);
  // ★★★ ORDER IS THE WHOLE COURTESY HERE. The first eight are the team the
  //   player has been looking at; the rest go to the vault in arrival order.
  ok(G.player.party[0].level === 1 && G.player.party[7].level === 8,
     `★★★★ the first eight stayed the team, in order (lv ${G.player.party[0].level}..${G.player.party[7].level})`);
  ok(G.player.pcZyrex[0].level === 9,
     `★★★ and the spill starts exactly where the team stops (lv ${G.player.pcZyrex[0].level}) · nothing is shuffled`);
  // idempotent · running it twice must not move anything a second time
  const again = G.enforcePartyCap();
  ok(again === 0 && counts()[0] === G.PARTY_MAX,
     '★★★ running the repair again spills nothing · it is a fixpoint, not a ratchet that keeps draining the team');
  // and holes are swept, because index-based UI and filter(Boolean) disagree
  RESET();
  G.player.party = [G.createZyrex('snok', 5), null, G.createZyrex('mealux', 5), undefined];
  G.enforcePartyCap();
  ok(G.player.party.length === 2 && G.player.party.every(Boolean),
     '★★★★ holes are swept too · an array with gaps makes party[i] and filter(Boolean) name different Zyrex, '
   + 'which is the same "UI does not match" complaint by another route');
}

H('★★★★ THE RULE LIVES IN ONE FUNCTION · no writer skips the door');
{
  const src = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
  const code = src.replace(/^\s*\/\/.*$/gm, '');
  // ★★ the door's OWN push is the one legal one — it is the door. Cut its
  //   body out before counting, or the check can never go green and stops
  //   meaning anything.
  const di = code.indexOf('function joinParty');
  const outside = code.slice(0, di) + code.slice(code.indexOf('\n}', di));
  const raw = [...outside.matchAll(/player\.party\.push\(/g)];
  ok(raw.length === 0,
     `★★★★ ZERO raw player.party.push() calls outside the door (${raw.length}) · every addition goes through joinParty, `
   + 'because a cap enforced at four call sites is a cap enforced at three of them the day someone adds a fifth');
  const joins = (code.match(/joinParty\(/g) || []).length;
  ok(joins >= 4, `★★★ joinParty has ${joins} mentions · its definition plus the catch path and both dev writers`);
  // and the door is the only place that knows the cap for an ADDITION
  const i = code.indexOf('function joinParty');
  const body = code.slice(i, code.indexOf('\n}', i));
  ok(/PARTY_MAX/.test(body), '★★★ the door reads PARTY_MAX itself · the number is not copied into its callers');
  ok(/pcZyrex\.push/.test(body), '★★★ and it is the thing that routes the overflow · one rule, one place');
  // ★★★★ AND THE REPAIR HAS TO BE CALLED ON LOAD, not merely to exist. Driving
  //   enforcePartyCap() from a test proves it works; it does not prove the
  //   game ever runs it, and the save already carrying thirty-eight is the
  //   whole reason it was written.
  const mi = code.indexOf('player.pcZyrex = fix(player.pcZyrex);');
  ok(mi > 0 && /enforcePartyCap\(\)/.test(code.slice(mi, mi + 700)),
     '★★★★ the load-time migration calls enforcePartyCap() right after it rebuilds both lists');
}

H('★★★★ THE DOOR ITSELF · party while there is room, PC after');
{
  RESET();
  for (let i = 0; i < G.PARTY_MAX; i++)
    ok(G.joinParty(G.createZyrex('snok', i + 1), { unique:false }) === 'party',
       `  #${i + 1} joins the team`);
  ok(G.joinParty(G.createZyrex('snok', 99), { unique:false }) === 'pc',
     `★★★★ the ${G.PARTY_MAX + 1}th goes to the PC and says so · the caller is told WHERE, so it can toast the truth`);
  ok(counts()[0] === G.PARTY_MAX, `  team still ${G.PARTY_MAX}`);
  // a humanoid ally can never enter the roster, through this door either
  const ally = Object.keys(G.SPECIES).find(id => { try { return G.isHumanoidAlly(id); } catch(_){ return false; } });
  if (ally){
    RESET();
    const z = G.createZyrex(ally, 10);
    ok(G.joinParty(z) === 'none',
       `★★★★ ${ally} is a humanoid ally and is refused at the door · the v0.95.628 gate now covers the dev buttons too`);
    ok(counts()[0] === 0 && counts()[1] === 0, '  and lands in neither list');
  }
  // the same instance twice is a UI arguing with itself
  RESET();
  const one = G.createZyrex('mealux', 10);
  ok(G.joinParty(one) === 'party', '  first copy joins');
  ok(G.joinParty(G.createZyrex('mealux', 10)) === 'duplicate',
     '★★★ a second identical Mealux is refused · the same creature in two slots is a roster that disagrees with itself');
  ok(counts()[0] === 1, '  and it did not land anyway');
}

H('★★★★ THE PANEL AND THE ROSTER NOW AGREE · which is what was actually asked');
{
  // ★★★★ "or else player wont ever know who is in their party" — so the real
  //   test is that what the panel DRAWS and what the game will let you SUMMON
  //   are the same set. Before, the panel drew 8 of 38.
  RESET();
  for (const id of Object.keys(G.DEV_FACTION_ACTORS || {}))
    try { G.setDevFactionActor(id, true, { silent:true, deferRefresh:true }); } catch(_){}
  const h = G.renderZycellFaction();
  const drawn = (h.match(/data-zysummon="\d+"/g) || []).length;
  const active = G.player.party.filter(Boolean).length;
  ok(drawn === active,
     `★★★★ the panel offers ${drawn} summonable cards and the roster holds ${active} · every active Zyrex is on screen`);
  ok(active <= G.PARTY_MAX, `★★★ and that is ${active}, inside the ${G.PARTY_MAX} the Zysphere allows`);
  // the vault view must account for the rest
  G.game._facView = 'vault';
  const v = G.renderZycellFaction();
  ok(/ZYSPHERE VAULT 1\//.test(v), '★★★ the remainder is in the vault view, paged and reachable');
  const pages = (v.match(/ZYSPHERE VAULT 1\/(\d+)/) || [])[1];
  ok(+pages >= Math.ceil(G.player.pcZyrex.length / G.PARTY_MAX),
     `★★★ ${pages} pages for ${G.player.pcZyrex.length} stored · nothing is stranded past the last page`);
  G.game._facView = 'team';
}

H('★★★ THE EXISTING ROUTES STILL BEHAVE');
{
  // catchZyrex keeps its bond gate, its XP and its toasts
  RESET();
  for (let i = 0; i < G.PARTY_MAX; i++) G.joinParty(G.createZyrex('snok', i + 1), { unique:false });
  const r = G.addZyrexToRoster(G.createZyrex('mealux', 10));
  ok(r && r.location === 'pc' && r.reason === 'partyFull',
     `★★★ catching on a full team still reports {pc, partyFull} · addZyrexToRoster's contract did not change`);
  RESET();
  const r2 = G.addZyrexToRoster(G.createZyrex('mealux', 10));
  ok(r2 && r2.location === 'party', '★★★ and catching with room still joins the team');
  // withdraw respects the cap
  RESET();
  for (let i = 0; i < G.PARTY_MAX; i++) G.joinParty(G.createZyrex('snok', i + 1), { unique:false });
  G.player.pcZyrex = [G.createZyrex('mealux', 10)];
  const before = counts();
  G.withdrawZyrexFromPC(0);
  ok(counts()[0] === before[0] && counts()[1] === before[1],
     '★★★ a full team still refuses a withdrawal · the cap holds from the PC side too');
  // deposit frees a slot and the withdraw then works
  G.depositZyrexToPC(0);
  ok(counts()[0] === G.PARTY_MAX - 1, '  depositing frees a slot');
  ok(G.withdrawZyrexFromPC(0) === true && counts()[0] === G.PARTY_MAX,
     '★★★ and the withdrawal goes through · the two directions are a pair, not a trap');
}

console.log(f ? `\n❌ ${f} failed`
  : `\n✅ one door · the team is ${G.PARTY_MAX} and the overflow is in the PC · old saves repaired in arrival order · the panel draws every active Zyrex`);
process.exit(f ? 1 : 0);
