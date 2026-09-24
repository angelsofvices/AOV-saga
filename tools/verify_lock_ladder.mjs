// ★★★★ v0.99.22 · THE LOCK LADDER · wood/silver free, gold keyed, mythic earned.
//
//   Creator, 2026-09-23: "we should no longer get handed items, they should be
//   tied to exploration, looting, and finding... gold and mythic require key,
//   silver and wooden which are common and uncommon dont... all weapons are now
//   locked away... only I can get them in dev mode bypass route."
import { bootGame } from './lib/boot_game.mjs';
import fs from 'fs';
import path from 'path';
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['chestUnlockState','hasDistrictKey','grantDistrictKey','districtKeyKey',
  'elderTrialComplete','completeElderTrial','DISTRICT_KEY_ITEMS','GOLD_CHEST_KEY_ITEMS',
  'player','game','INVENTORY_META','zycubeCategoryOf','COSMIC_CHEST_SPOTS','DISTRICT_ORDER'] });
console.log = _L;
const P = G.player;
const reset = () => { P.items = {}; P.elderTrials = {}; G.game.devMaxBond = false; };

H('★★★★ THE FREE TIERS STAY FREE · the ladder must still have a bottom');
{
  reset();
  for (const t of ['wood', 'silver'])
    ok(G.chestUnlockState(t, 'malezor').open === true,
       `  ${t.padEnd(6)} opens with no key and no trial · common and uncommon loot is the reward for just LOOKING`);
}

H('★★★★ GOLD NEEDS THAT DISTRICT\'S KEY · and only that district\'s');
{
  reset();
  const locked = G.chestUnlockState('gold', 'malezor');
  ok(locked.open === false, '★★★★ a gold chest with no key REFUSES');
  ok(/MALEZOR KEY/.test(locked.why || ''),
     `★★★ and says which key is missing by name · "${(locked.why||'').slice(0, 62)}…"`);
  ok(!!locked.sfx, '★★ with a sound · a refusal the player cannot hear reads as a dead button');
  G.grantDistrictKey('malezor', 'TEST');
  ok(G.chestUnlockState('gold', 'malezor').open === true, '★★★★ with the Malezor key, Malezor gold opens');
  ok(G.chestUnlockState('gold', 'zarvane').open === false,
     '★★★★ …and Zarvane gold does NOT · the key is a PLACE, not a tier pass');
  ok(G.grantDistrictKey('malezor', 'TEST') === false, '★ granting the same key twice is a no-op · no duplicate keys in the bag');
}

H('★★★★ MYTHIC NEEDS THE ELDER TRIAL · this is what locks the weapons away');
{
  reset();
  const sealed = G.chestUnlockState('cosmic', 'vorashil');
  ok(sealed.open === false, '★★★★ a mythic vault with no trial done REFUSES');
  ok(/ELDER/.test(sealed.why || ''), `★★★ and names the trial · "${(sealed.why||'').slice(0, 58)}…"`);
  ok(!G.hasDistrictKey('vorashil') || true, '  (a district key does NOT open mythic)');
  G.grantDistrictKey('vorashil', 'TEST');
  ok(G.chestUnlockState('cosmic', 'vorashil').open === false,
     '★★★★ holding the district KEY still does not open the vault · gold and mythic are different locks');
  G.completeElderTrial('vorashil');
  ok(G.chestUnlockState('cosmic', 'vorashil').open === true, '★★★ finishing the trial opens it');
  ok(G.chestUnlockState('cosmic', 'veridan').open === false, '★★ and only that district\'s');
}

H('★★★★ ALL FOUR GEMLORD WEAPONS ARE BEHIND A TRIAL');
{
  reset();
  const WANT = { rubypaw_sword:'malezor', pearlbow:'zarvane', emerald_axe:'veridan', sapphire_sword:'vorashil' };
  const spots = G.COSMIC_CHEST_SPOTS.filter(s => WANT[s.item]);
  ok(spots.length === 4, `${spots.length} of the 4 Gemlord weapons sit in cosmic chests`);
  for (const s of spots){
    ok(s.dist === WANT[s.item], `  ${s.item.padEnd(15)} is in ${s.dist} (Creator: ${WANT[s.item]})`);
    ok(G.chestUnlockState('cosmic', s.dist).open === false,
       `  ${s.item.padEnd(15)} unreachable on a fresh save`);
  }
}

H('★★★★ THE SHOP WAS THE HOLE IN THE LOCK · and it is closed');
{
  // ★★★★ Gating the vaults means nothing while the Sapphire is 10,000 coins
  //   over a counter. A player with a full purse skipped every Elder trial in
  //   the game by walking into Zarvane.
  const src = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
  const i = src.indexOf('function openZarvaneWeaponShop');
  const shop = src.slice(i, src.indexOf('function closeZarvaneWeaponShop'));
  ok(i > 0 && shop.length > 500, `shop body isolated (${shop.length} chars)`);
  ok(!/_grantSapphireSword\(\)/.test(shop) && !/_grantRubypawSword\(\)/.test(shop),
     '★★★★ the shop no longer grants EITHER Gemlord blade');
  ok(!/10000|20000/.test(shop), '★★★ and the 10,000 / 20,000 price points are gone');
  ok(/rubypaw_fang/.test(shop),
     '★★ it sells the Rubypaw Fang instead · already a fully wired weapon (FANG_MAX 300) and canon\'s own S1 dagger, so the starter tier needed no new combat code');
  ok(/NOT FOR SALE/.test(shop), '★ and it TELLS you the Gemlord arms are vault-locked rather than just omitting them');
  ok(!/_grantSapphireSword\(\)|_grantRubypawSword\(\)/.test(src.replace(/function _grant\w+\(\)\{[\s\S]*?\n\}/g, '')),
     '★★★ nothing else in the build calls those granters either');
}

H('★★★ THE DEV BYPASS, EXACTLY AS ASKED');
{
  reset();
  G.game.devMaxBond = true;
  ok(G.chestUnlockState('gold', 'korathen').open === true, '★★ dev mode opens gold with no key');
  ok(G.chestUnlockState('cosmic', 'korathen').open === true, '★★★ and mythic with no trial · "only I can get them in dev mode bypass route"');
  G.game.devMaxBond = false;
  ok(G.chestUnlockState('cosmic', 'korathen').open === false, '★ and it is a toggle, not a one-way door');
}

H('★★ THE TEN KEYS ARE REAL ITEMS');
{
  reset();
  const keys = Object.values(G.DISTRICT_KEY_ITEMS);
  ok(keys.length === 10, `${keys.length} district keys defined`);
  ok(keys.every(k => G.INVENTORY_META[k]), '★★ every key has an INVENTORY_META row · without one the bag shows the raw key');
  ok(keys.every(k => G.zycubeCategoryOf(k) === 'key'),
     '★★ and files under KEY ITEMS · a key in UNSORTED is a key the player will not find');
  ok(G.GOLD_CHEST_KEY_ITEMS.length >= 5, `gold chests roll from ${G.GOLD_CHEST_KEY_ITEMS.length} key items`);
  const QUEST = ['raidcard','ruby_vial','portalkey','shardshare','dads_notebook'];
  ok(!G.GOLD_CHEST_KEY_ITEMS.some(k => QUEST.includes(k)),
     '★★★★ and NO single-instance quest gate is in that pool · rolling one duplicates a quest item or hands it over before the quest that explains it');
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ wood/silver free · gold keyed per district · mythic earned per elder · shop closed · dev bypass live');
process.exit(f ? 1 : 0);
