#!/usr/bin/env node
/* verify_portalkey.js · v0.95.984
 *
 *   Creator: "bring scrapjaw to your dad with 40 scrap metal and they will
 *   repair your old remote transmitter. this will allow you to use the
 *   transmitter to teleport to any unlocked portal in a district. this is a
 *   dual companion mechanic... but first, you have to find the old transmitter
 *   in a silver zarvane radio tower chest... keep bringing dad portalchips to
 *   unlock more districts. call it the portalkey."
 *
 * ★★ THE MECHANIC IS THE GATE, so that is what this suite tests. "Dual
 *   companion" means the ability exists only where two companions overlap —
 *   Dad knows what the machine is and cannot open it; Scrapjaw can open
 *   anything and would not know what he was holding. A test that only checked
 *   "does it teleport" would pass on a version where either half was optional,
 *   which is the version that is not the feature.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');

let pass = 0, fail = 0;
const ok = (m) => { pass++; console.log('  ok   · ' + m); };
const no = (m) => { fail++; console.log('  FAIL · ' + m); };
const t  = (c, m) => c ? ok(m) : no(m);

console.log('\n=== PORTALKEY · the dual-companion transmitter (v0.95.984) ===\n');

/* ── 1 · the two items exist and are distinct ───────────────────────────── */
t(/portalkey_broken:\s*\{\s*label:\s*'Broken Transmitter'/.test(HTML),
  "the BROKEN transmitter is its own item");
t(/\n\s*portalkey:\s*\{\s*label:\s*'PORTALKEY'/.test(HTML),
  "★ and the repaired one is a DIFFERENT item · the repair is a transformation, not a flag");
t(/portalkey_broken:'key', portalkey:'key'/.test(HTML), 'both file under KEY in the ZyCube');

/* ── 2 · found in the ZARVANE tower chest, and only there ───────────────── */
{
  const at = HTML.indexOf("spot.dist === 'zarvane' && !player.portalkeyFound");
  t(at > 0, '★ the find is gated on the ZARVANE tower chest specifically');
  const blk = HTML.slice(at - 900, at + 900);
  t(/chest_tower_battery|_towerBatteryDist|tower_battery/.test(blk),
    '  · riding the SILVER tower-battery chest that already exists, not a new one');
  t(/!player\.portalkeyFound/.test(blk), '  · once only · the flag guards a re-loot');
}

/* ── 3 · ★★ THE DUAL GATE · all three, and each refuses differently ─────── */
{
  const at = HTML.indexOf('A DUAL-COMPANION REPAIR');
  t(at > 0, '★★ the repair branch exists in Dad\'s interact');
  const blk = HTML.slice(at, at + 4200);

  t(/player\.portalkeyFound/.test(blk) && /portalkey_broken \|\| 0\) > 0/.test(blk),
    '  1 · you must be CARRYING the broken transmitter');
  t(/if \(!player\.scrapjawCompanion\)/.test(blk),
    '  2 · ★ SCRAPJAW must be with you · a companion, not a conversation');
  t(/scrap < PORTALKEY_SCRAP/.test(blk),
    '  3 · and the scrap must be paid');

  // ★ each refusal has to SAY something different, or the player cannot tell
  // which of the three they are missing
  const noScrapjaw = blk.slice(blk.indexOf('if (!player.scrapjawCompanion)'), blk.indexOf('if (scrap <'));
  const noScrap    = blk.slice(blk.indexOf('if (scrap <'), blk.indexOf('player.items.scrap_metal = scrap'));
  t(/cannot get into it|tool I do not own|scrapper/i.test(noScrapjaw),
    '★★ without Scrapjaw, DAD explains he cannot open it — the refusal teaches the gate');
  t(/PORTALKEY_SCRAP|Bring the metal/i.test(noScrap),
    '  · without the scrap, SCRAPJAW names his price · a different voice for a different lack');
  t(noScrapjaw !== noScrap, '  · and the two refusals are not the same text');

  t(/player\.portalkeyRepaired = true/.test(blk), 'the repair sets the flag');
  t(/player\.items\.portalkey = \(player\.items\.portalkey \|\| 0\) \+ 1/.test(blk),
    '  · grants the working key');
  t(/portalkey_broken[^\n]*- 1|Math\.max\(0, \(player\.items\.portalkey_broken \|\| 1\) - 1\)/.test(blk),
    '★ and CONSUMES the broken one · you cannot hold both');
  t(/scrap_metal = scrap - PORTALKEY_SCRAP/.test(blk), '  · and spends the scrap');
}

/* ── 4 · the Creator's number ───────────────────────────────────────────── */
{
  const m = HTML.match(/const PORTALKEY_SCRAP\s*=\s*(\d+)/);
  t(!!m && +m[1] === 40, `★ the cost is 40 scrap, as specified (found ${m ? m[1] : '?'})`);
}

/* ── 5 · ★★ it READS the portal network rather than owning a list ───────── */
{
  const at = HTML.indexOf('function portalkeyDestinations');
  t(at > 0, 'portalkeyDestinations() exists');
  const fn = HTML.slice(at, HTML.indexOf('\n}', at));
  t(/PORTAL_NETWORK/.test(fn) && /portalDistrictsUnlocked\(\)/.test(fn),
    '★★ it reads PORTAL_NETWORK and portalDistrictsUnlocked() — so bringing Dad ' +
    'more chips extends the key for free, and the two cannot drift apart');
  t(/P\.i !== hereIdx/.test(fn),
    '  · and never offers the district you are standing in');
}

/* ── 6 · where it may NOT be used · every rule already existed ──────────── */
{
  const at = HTML.indexOf('function portalkeyBlockedReason');
  const fn = HTML.slice(at, HTML.indexOf('\n}', at));
  t(/game\.scene !== 'overworld'/.test(fn), '★ blocked indoors · gates are outdoors');
  t(/battleState/.test(fn) && /wildBattleState/.test(fn), '  · blocked mid-battle');
  t(/rizerInCombat/.test(fn),
    '★★ and blocked while anything is chasing you — fast travel is not an escape hatch');
  // ★ strip comments first. The fix is DOCUMENTED next to itself — including
  // the wrong name — and a bare /combatIsHot/ fails on its own explanation.
  // Third time this exact trap has bitten a suite this session; the rule is
  // that any check asserting an ABSENCE has to look at code, never prose.
  const CODE = HTML.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  t(!/combatIsHot/.test(CODE),
    '  · using the game\'s OWN rizerInCombat(), not an invented name that would ' +
    'have silently no-opped behind a typeof guard');
}

/* ── 7 · the faction travels with you ───────────────────────────────────── */
{
  const at = HTML.indexOf('function portalTravel');
  const fn = HTML.slice(at, at + 1400);
  t(/carrySummonsTo/.test(fn),
    '★★ summons come through the portal · fast travel is the easiest place in ' +
    'the game to strand a companion, and v0.95.980 already owns that rule');
}

/* ── 8 · reachable, and persisted ───────────────────────────────────────── */
t(/case 'portalkey': \{ openPortalkey\(\); return; \}/.test(HTML),
  '★ tapping it in the bag opens it');
t(/case 'portalkey_broken':/.test(HTML),
  '  · and tapping the BROKEN one tells you what it needs, rather than nothing');
t(/portalkeyFound:\s*!!player\.portalkeyFound/.test(HTML)
  && /portalkeyRepaired:\s*!!player\.portalkeyRepaired/.test(HTML),
  '★ both flags are written to the save');

/* ── 9 · the art is on disk ─────────────────────────────────────────────── */
t(fs.existsSync(path.join(ROOT, 'assets/2D sprites/decor/portalkey.png')),
  'the transmitter art is on disk');

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
