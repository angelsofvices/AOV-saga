// ★★★★ v0.99.44 · DEV · WEAPONS TAB.
//   Creator, 2026-09-24: "add a weapons tab in the dev menu.. add give arrows
//   and all gemlord weapons."
//
// ★★★★ WHY A TAB AND NOT TWO MORE BUTTONS IN 'GIVE': the GIVE tab grants
//   ITEMS, and a Gemlord blade is an item PLUS a durability pool PLUS an
//   unbroken flag. Granting `pearlbow` alone leaves the bow in the bag with a
//   null durability the HUD reads as BROKEN — you hold the weapon and cannot
//   fire it.
import { bootGame } from './lib/boot_game.mjs';
import fs from 'fs';
import path from 'path';
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const page = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['WEAPON_MAX_DUR','BOW_MAX','_armWeapon','addBowArrows','player','INVENTORY_META'] });
console.log = _L;
const P = G.player;

H('★★★ THE TAB EXISTS AND IS REACHABLE');
{
  ok(/<button data-devtab="weapons">Weapons<\/button>/.test(page), 'a Weapons button sits in the dev tab bar');
  ok(/<div class="devtab" data-devtab="weapons">/.test(page), 'and a matching pane · a tab button with no pane is a dead tab');
  for (const id of ['devGiveAllWeapons','devGiveArrows','devWeaponList','devRepairWeapons','devBreakWeapons'])
    ok(new RegExp(`id="${id}"`).test(page), `  ${id} is in the markup`);
}

H('★★★★ ARMING IS THREE WRITES, AND IT USES THE FUNCTION THAT KNOWS THEM');
{
  const i = page.indexOf('(function wireDevWeapons()');
  const fn = page.slice(i, page.indexOf('\n  })();', i));
  ok(i > 0, 'the wiring block was found');
  ok(/_armWeapon\(k\)/.test(fn),
     '★★★★ it calls _armWeapon() rather than re-listing the pools · that function already knows which flag belongs to which weapon, and a second list would drift from it');
  ok(/Object\.keys\(WEAPON_MAX_DUR\)/.test(fn),
     '★★★ the list comes from WEAPON_MAX_DUR · a sixth weapon appears in this tab the day it exists, with no edit here');
  ok(!/sapphire_sword.*rubypaw_sword.*emerald_axe/s.test(fn.split('devBreakWeapons')[0]),
     '★★ and the grant path hardcodes no weapon names');
}

H('★★★★ IT ACTUALLY ARMS THEM · driven, not read');
{
  P.items = {};
  P.swordDurability = 0; P.swordBroken = true;
  P.bowDurability = 0;   P.bowBroken = true;
  const LIST = Object.keys(G.WEAPON_MAX_DUR);
  for (const k of LIST){ P.items[k] = (P.items[k] || 0) + 1; G._armWeapon(k); }
  ok(LIST.every(k => P.items[k] >= 1), `all ${LIST.length} weapons in the bag`);
  ok(P.swordDurability === G.WEAPON_MAX_DUR.sapphire_sword && P.swordBroken === false,
     `★★★★ the Tearsword arrives at its own ceiling (${P.swordDurability}/${G.WEAPON_MAX_DUR.sapphire_sword}) and UNBROKEN · the item alone would read as broken in the HUD`);
  ok(P.bowDurability === G.BOW_MAX && P.bowBroken === false,
     `★★★ and the bow arrives with arrows (${P.bowDurability}/${G.BOW_MAX})`);
  ok(P.fangDurability === G.WEAPON_MAX_DUR.rubypaw_fang,
     `★★ the Fang too, at its own ${P.fangDurability} · the ceilings genuinely differ per weapon`);
}

H('★★★★ FILL ARROWS WORKS EVEN WITH NO BOW');
{
  // ★★★★ addBowArrows() REFUSES without the pearlbow, by design — arrows ARE
  //   the bow's durability, so there is nothing to fill. In a dev tool that
  //   reads as a dead button, which is why the handler hands over the bow
  //   first.
  P.items = {}; P.bowDurability = 0; P.bowBroken = true;
  ok(G.addBowArrows(G.BOW_MAX) === false,
     '★★★★ addBowArrows returns FALSE with no bow · the raw call really is a no-op, so the guard is not theoretical');
  const i = page.indexOf("on('devGiveArrows'");
  const h = page.slice(i, page.indexOf('});', i));
  ok(/if \(!\(player\.items && player\.items\.pearlbow\)\) arm\('pearlbow'\)/.test(h),
     '★★★ so the handler arms the bow first · the button cannot be pressed to no effect');
  P.items.pearlbow = 1; G._armWeapon('pearlbow'); P.bowDurability = 3;
  G.addBowArrows(G.BOW_MAX);
  ok(P.bowDurability === G.BOW_MAX && P.bowBroken === false,
     `★★★ and with a bow it fills to ${P.bowDurability}/${G.BOW_MAX}, un-breaking a dry one`);
  P.items = {};
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ weapons tab · all Gemlord arms armed and full · arrows fill even from nothing');
process.exit(f ? 1 : 0);
