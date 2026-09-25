// ★★★★ v0.99.45 · THE ARMORY · the ZyPhone weapon panel, rebuilt on the
//   Creator's reference sheet.
//
//   Creator, 2026-09-24: "upgrade the weapon UI in the zyphone and make it
//   like this reference image. weapons (main slot) & gear (combat utilities)
//   exist here. trinkets (coming), ammo, etc. exist here."
//
// ★★★★ THE OLD PANEL WAS FIVE COPIES OF ITSELF and that is the thing this
//   suite is really guarding. Five hand-written weapon blocks meant five
//   durability clamps, five equip handlers, five colour sets — and every bug
//   it ever had was a fix applied to one copy and not the other four (the
//   Fang missing from the empty-state check; the Tearsword's bar reading
//   `dur / 200` for six builds after the sword dropped to 100). So the
//   assertions below are written against the TABLE, not against five literal
//   names: a sixth weapon added to ZYARMS is covered the day it lands, and a
//   weapon that renders differently from its own row fails here.
//
// ★★★ IT RENDERS THE PANEL AND READS THE HTML. Whether a card says EQUIPPED
//   is a question about what the player sees, not about what the source
//   contains — and the one bug class this panel is most exposed to (the main
//   slot and the card disagreeing about the same weapon) is invisible to a
//   grep and obvious to a render.
import { bootGame } from './lib/boot_game.mjs';

let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; return !!c; };
const H  = t => console.log('\n' + t);

const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['renderZycellWeapons','ZYARMS','ZYGEAR','player','game',
  '_zyArmState','_zyArmClick','_zyArmsSetTab','_zyArmsTab','_zyArtStyle','_zyMainSlot',
  '_zyArmSheet','countGems','spendGems','keepOneS1Weapon','_armWeapon','WEAPON_MAX_DUR',
  'BOW_MAX','SWORD_MAX','RUBY_MAX','AXE_MAX','FANG_MAX','zycubeArtFor','addBowArrows'] });
console.log = _L;

// ── fixture ───────────────────────────────────────────────────────────────
// ★★★ RESTORE, NEVER EMPTY. verify_zycube_ui leaked an emptied player.items
//   into its own later blocks THREE separate times this month, and every time
//   the sections below it went red against working code. One builder, called
//   at the top of every block.
const BASE = () => {
  G.player.items = { sapphire_sword:1, rubypaw_sword:1, emerald_axe:1, pearlbow:1, rubypaw_fang:1,
                     // ★★★ countGems() reads GEM_VALUES, and there is no plain `gem` in it.
                     //   A fixture of `gem: 400` counts ZERO, which would have made the
                     //   can't-afford block below pass while never testing anything.
                     gem_red:20, shardshare:1, zysphere:3, faenet:1 };
  G.player.cosmeticSkin = 'normal';
  for (const W of G.ZYARMS){ G.player[W.equipFlag] = false; G.player[W.brokenFlag] = false; G.player[W.durFlag] = W.max; }
  try { G.game._zyArmsTab = 'arms'; } catch(_){}
};
const paint = (tab) => { try { G.game._zyArmsTab = tab || 'arms'; } catch(_){} return G.renderZycellWeapons(); };
// the card for one weapon, sliced out of the panel so a claim about the
// Tearsword cannot be satisfied by text belonging to the Pearlbow
const cardOf = (h, item) => {
  const i = h.indexOf(`data-zyitem="arm_${item}"`);
  if (i < 0) return '';
  const j = h.indexOf('data-zyitem="arm_', i + 10);
  return h.slice(i, j < 0 ? h.length : j);
};
const mainSlot = (h) => h.slice(0, h.indexOf('data-zyitem="arm_') + 1 || h.length);

H('★★★★ THE PANEL IS THE TABLE · five weapons, no hand-written sixth copy');
{
  BASE();
  const h = paint('arms');
  ok(G.ZYARMS.length === Object.keys(G.WEAPON_MAX_DUR).length,
     `★★★★ ZYARMS carries ${G.ZYARMS.length} arms and WEAPON_MAX_DUR carries ${Object.keys(G.WEAPON_MAX_DUR).length} · `
   + 'the panel and the durability table cannot drift apart without this going red');
  for (const W of G.ZYARMS)
    ok(G.WEAPON_MAX_DUR[W.item] === W.max,
       `  ${W.item.padEnd(16)} max ${W.max} matches WEAPON_MAX_DUR · the bar reads the real ceiling, not a copy of it`);
  for (const W of G.ZYARMS)
    ok(cardOf(h, W.item).includes(W.name),
       `  ${W.name} has a card of its own`);
  ok((h.match(/data-zyitem="arm_/g) || []).length === G.ZYARMS.length,
     `★★★ every arm is a focus stop · ${(h.match(/data-zyitem="arm_/g) || []).length} of ${G.ZYARMS.length} · a card you cannot reach on a pad is not a card`);
}

H('★★★★ THE REPAIR BUTTON IS GONE AND REPAIR STILL WORKS · the v0.95.995 trap, closed');
{
  // ★★★★ _zycellAutoEnrol will not enrol a control INSIDE an already-tagged
  //   element, so the old nested REPAIR button was unreachable on a pad. That
  //   was patched by making the broken row act as its own repair — and the
  //   button was left in place anyway, a mouse-only duplicate of a thing the
  //   card already did. Deleting it is only safe if repair still happens.
  BASE();
  G.player.swordBroken = true; G.player.swordDurability = 0;
  const h = paint('arms');
  ok(!/id="zy(Sword|Ruby|Axe|Bow|Fang)Repair"/.test(h),
     '★★★★ no nested repair button anywhere in the panel · one card, one stop, one action');
  ok(/100 ◆ TO RESTORE/.test(cardOf(h, 'sapphire_sword')),
     '★★★ and the broken card says what pressing it costs · the affordance moved, it did not vanish');
  const before = G.countGems();
  G._zyArmClick('sapphire_sword');
  ok(G.player.swordDurability === G.SWORD_MAX && !G.player.swordBroken,
     `★★★★ pressing the broken card REPAIRED it · ${G.player.swordDurability}/${G.SWORD_MAX}, unbroken`);
  ok(G.countGems() === before - 100, `★★★ and it charged 100 gems (${before} → ${G.countGems()})`);
  ok(!G.player.swordEquipped,
     '★★ repairing did not also equip · a broken card does ONE thing, and guessing the second is how a player loses a form gate they meant to keep');
}

H('★★★★ A REPAIR YOU CANNOT AFFORD CHANGES NOTHING');
{
  BASE();
  G.player.items.gem_red = 1;          // 20 gems · not 100
  G.player.bowBroken = true; G.player.bowDurability = 0;
  const gems = G.countGems();
  G._zyArmClick('pearlbow');
  ok(G.player.bowDurability === 0 && G.player.bowBroken,
     '★★★★ 20 gems is not 100 · the bow stayed dry · a card that half-fires is worse than one that refuses');
  ok(G.countGems() === gems, `★★★ and no gems were spent (${gems} still there)`);
}

H('★★★★ THE FORM GATE · four arms are S1\'s and the Longsword is S2\'s');
{
  BASE();
  // S1 · the Longsword must refuse
  G._zyArmClick('rubypaw_sword');
  ok(!G.player.rubypawEquipped, '★★★★ S1 Rizer cannot draw the RUBYPAW LONGSWORD · it is S2\'s blade');
  G._zyArmClick('sapphire_sword');
  ok(G.player.swordEquipped, '★★★ and the Tearsword goes on the same press that the Longsword refused');
  let h = paint('arms');
  ok(/⚠ S2 ONLY/.test(cardOf(h, 'rubypaw_sword')),
     '★★★ the Longsword card SAYS S2 ONLY rather than disappearing · a weapon you own and cannot hold is information');
  ok(cardOf(h, 'rubypaw_sword').includes('RUBYPAW LONGSWORD'),
     '★★ it is still drawn · a blank space cannot tell you the blade exists');
  // S2 · the ring must let go
  G.player.cosmeticSkin = 'power_upgrade';
  h = paint('arms');
  ok(!/● EQUIPPED/.test(cardOf(h, 'sapphire_sword')),
     '★★★★ switching to S2 stops the Tearsword reading EQUIPPED · the gate is evaluated at paint, not remembered from the press');
  G._zyArmClick('rubypaw_sword');
  ok(G.player.rubypawEquipped, '★★★ and now the Longsword draws');
}

H('★★★★ ONE ARM AT A TIME · the S1 ring still collapses');
{
  BASE();
  G._zyArmClick('sapphire_sword');
  G._zyArmClick('emerald_axe');
  const on = G.ZYARMS.filter(W => G.player[W.equipFlag]);
  ok(on.length === 1 && on[0].item === 'emerald_axe',
     `★★★★ equipping the Axe stowed the Tearsword · ${on.length} arm held (${on.map(w=>w.item).join(', ')}) · keepOneS1Weapon still runs`);
  G._zyArmClick('emerald_axe');
  ok(!G.player.axeEquipped, '★★★ and the same press takes it off again');
}

H('★★★★ THE MAIN SLOT CANNOT DISAGREE WITH THE CARDS · the bug a grep cannot see');
{
  BASE();
  let h = paint('arms');
  ok(/BARE HANDS/.test(mainSlot(h)),
     '★★★★ nothing equipped · the slot says BARE HANDS rather than showing the first weapon you own');
  for (const W of G.ZYARMS.filter(w => w.form === 'S1')){
    BASE();
    G._zyArmClick(W.item);
    h = paint('arms');
    const slot = mainSlot(h);
    ok(slot.includes(W.name) && /MAIN SLOT/.test(slot),
       `★★★ holding the ${W.tag} · the main slot names it (${W.name})`);
    ok(new RegExp(`${G.player[W.durFlag]}/${W.max}`).test(slot),
       `  and reads its OWN ceiling · ${G.player[W.durFlag]}/${W.max} · not a shared 200 the way the Tearsword's bar did until v0.95.791`);
    ok(cardOf(h, W.item).includes('● EQUIPPED'),
       `  and the card agrees · both read the same _zyArmState`);
  }
}

H('★★★ A BROKEN WEAPON IS NOT HELD · the slot does not lie about a snapped blade');
{
  BASE();
  G._zyArmClick('rubypaw_fang');
  ok(G.player.fangEquipped, '  the Fang is drawn');
  G.player.fangDurability = 0;
  const h = paint('arms');
  ok(/BARE HANDS/.test(mainSlot(h)),
     '★★★ durability hit zero · the main slot falls back to BARE HANDS without anyone clearing the equip flag');
  ok(/⛔ BROKEN/.test(cardOf(h, 'rubypaw_fang')),
     '★★ and the card says BROKEN · zero edge is broken whether or not the flag was set');
}

H('★★★ THE BOW\'S EMPTY STATE IS A QUIVER, NOT A SNAPPED STAVE');
{
  BASE();
  G.player.bowDurability = 0;
  const h = paint('arms');
  ok(/QUIVER EMPTY/.test(cardOf(h, 'pearlbow')),
     '★★★ the Pearlbow reads QUIVER EMPTY · its durability IS its arrows, and "broken" never meant snapped');
  ok(/⛔ BROKEN/.test(cardOf(h, 'emerald_axe')) === false,
     '  and a full Axe does not · the word is per-weapon, off the table');
  ok(/ARROWS/.test(cardOf(h, 'pearlbow')) && /AMMO · ARROWS/.test(h),
     '★★★ the ammo block is on the arms tab · Creator: "ammo, etc. exist here"');
  ok(new RegExp(`0/${G.BOW_MAX}`).test(h), `★★ and it reads 0/${G.BOW_MAX} when the quiver is dry`);
}

H('★★★★ GEAR · combat utilities, carried not equipped');
{
  BASE();
  const h = paint('gear');
  ok(G.ZYGEAR.length >= 4, `★★ ${G.ZYGEAR.length} utilities in the table`);
  for (const g of G.ZYGEAR)
    ok(h.includes(g.name), `  ${g.name} has a socket`);
  ok(/● CARRIED/.test(h), '★★★ the ones in the bag read CARRIED');
  ok(/· EMPTY ·/.test(h),
     '★★★★ and the ones that are not still draw as an empty socket · the SHAPE of the set is information, '
   + 'and an armory that silently shrinks cannot tell you there is a slot to fill');
  ok(!/data-zyitem="arm_/.test(h),
     '★★★ no weapon cards leak onto the gear tab · the tabs are exclusive, not stacked');
  // ★★★ none of these has an equip flag — the game reads them straight out of
  //   the bag — so offering a toggle here would be a control that does nothing.
  ok(!/onclick="_zyArmClick/.test(h),
     '★★★ and gear offers no equip press · there is no gear equip flag in this game, and a dead toggle is worse than none');
}

H('★★★ TRINKETS ARE EMPTY SOCKETS AND NOTHING ELSE');
{
  BASE();
  const h = paint('trinket');
  ok((h.match(/TRINKET SLOT/g) || []).length === 4, '★★ four sockets drawn');
  ok(/COMING/.test(h), '★★★ and they say COMING · Creator: "trinkets (coming)"');
  // ★★★ Filling these with plausible trinkets would look finished and quietly
  //   become the spec — the same trap the R.A.I.D. card was kept out of.
  ok(!/\+\d+\s*(ATK|DEF|HP)/i.test(h),
     '★★★★ nothing is invented in them · a placeholder that lies about being a placeholder is worse than an empty box');
}

H('★★★ THE TABS ARE WALKABLE AND THEY SWITCH');
{
  BASE();
  const h = paint('arms');
  ok((h.match(/data-zyitem="armstab_/g) || []).length === 3,
     '★★★ three tabs, each a focus stop · this panel has no bumper axis of its own because L1/R1 already belong to the ZyCube drawers');
  G._zyArmsSetTab('gear');
  ok(G._zyArmsTab() === 'gear', '★★ setting a tab sticks');
  ok(/data-zyitem="armstab_gear"/.test(paint('gear')), '  and the gear tab is still a stop while it is open');
}

H('★★★ ART · every arm draws its own icon, cropped off its own bbox');
{
  BASE();
  const h = paint('arms');
  for (const W of G.ZYARMS){
    ok(cardOf(h, W.item).includes(W.art.src),
       `  ${W.tag.padEnd(10)} card carries ${W.art.src.split('/').pop()}`);
  }
  // ★★★★ bbox IS [x, y, WIDTH, HEIGHT]. Read as two corners, the Axe and the
  //   Pearlbow would crop to a sliver and nothing would throw. The tell needs
  //   no pixels: x+w and y+h must both FIT inside the sheet.
  for (const W of G.ZYARMS){
    const bb = W.art.bbox || [0, 0, W.art.W, W.art.H];
    ok(bb[0] + bb[2] <= W.art.W && bb[1] + bb[3] <= W.art.H,
       `  ${W.tag.padEnd(10)} bbox [${bb}] fits in ${W.art.W}×${W.art.H} · x+w=${bb[0]+bb[2]} y+h=${bb[1]+bb[3]}`);
  }
  const s = G._zyArtStyle({ src:'x.png', W:1254, H:1254, bbox:[218,170,818,898] }, 64);
  ok(/background-size:\s*89\.\d/.test(s),
     `★★★ the crop scales the WHOLE sheet so the bbox lands at 64px · ${s.match(/background-size:[^;]*/)[0]}`);
}

H('★★ THE ANIM SHEET IS LOOKED UP BY SWITCH, NOT BY eval');
{
  ok(typeof G._zyArmSheet === 'function', '  _zyArmSheet exists');
  for (const W of G.ZYARMS)
    ok(G._zyArmSheet(W.item) != null, `  ${W.tag.padEnd(10)} resolves to a real sheet object`);
  ok(G._zyArmSheet('nope') === null, '★★ and an unknown key returns null instead of throwing');
}

H('★★★★ NOTHING OWNED · the empty armory still draws, and still says so');
{
  BASE();
  G.player.items = { gem: 5 };
  const h = paint('arms');
  ok(/no arms found yet/.test(h), '★★★★ the hint appears · and it checks the TABLE, so the Fang cannot be left out of it the way it was in v0.96.76');
  ok(/BARE HANDS/.test(mainSlot(h)), '★★★ the main slot reads BARE HANDS');
  ok(!/data-zyitem="arm_/.test(h),
     '★★★ and an unowned weapon is not a focus stop · a pad should not stop on a blade you have never seen');
  for (const W of G.ZYARMS)
    ok(h.includes(W.name), `  ${W.tag.padEnd(10)} socket is still drawn · the armory shows you what there is to find`);
  BASE();   // ★ leave the fixture whole for anything that runs after this
}

console.log(f ? `\n❌ ${f} failed`
  : '\n✅ five arms from one table · main slot agrees with its cards · repair without a nested button · gear carried, trinkets empty, ammo named');
process.exit(f ? 1 : 0);
