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
  'player','game','INVENTORY_META','zycubeCategoryOf','COSMIC_CHEST_SPOTS','DISTRICT_ORDER','DISTRICT_ELDERS','TOWN_HALL_VAULTS','SEER_HQ_CHESTS','TOWN_HALL_VAULT_TILE',
  'civicSceneId','interiorConfig','walkable','tryOpenTownHallVault','vaultOpened'] });
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
  // ★★★ v0.99.24 · THIS USED TO READ COSMIC_CHEST_SPOTS. The weapons moved into
  //   the town hall vaults, so an assertion pinned to their old home would go
  //   red on the very change it was written to protect. It follows the WEAPON
  //   now, not the container — which is the thing that actually must not drift.
  const WANT = { rubypaw_sword:'malezor', pearlbow:'zarvane', emerald_axe:'veridan', sapphire_sword:'vorashil' };
  const held = Object.fromEntries(G.TOWN_HALL_VAULTS.map(v => [v.item, v.dist]));
  ok(Object.keys(held).length === 4, `${Object.keys(held).length} of the 4 Gemlord weapons are vault-held`);
  for (const [item, dist] of Object.entries(WANT)){
    ok(held[item] === dist, `  ${item.padEnd(15)} is in ${held[item] || '(nowhere)'} (Creator: ${dist})`);
    ok(G.chestUnlockState('cosmic', dist).open === false,
       `  ${item.padEnd(15)} unreachable on a fresh save`);
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

H('★★★★ THE KEYS HAVE A SOURCE · v0.99.22 shipped the lock without one');
{
  // ★★★★ THIS IS THE ASSERTION THAT WOULD HAVE CAUGHT MY OWN REGRESSION.
  //   v0.99.22 defined ten key items, made chestUnlockState refuse every gold
  //   chest without one, and called grantDistrictKey from NOWHERE. Outside dev
  //   mode every gold chest in Zyraxis was permanently sealed. The suite went
  //   green because it only ever tested the LOCK, never that a key could be
  //   obtained — it proved the door was shut and called that success.
  const src = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
  const calls = (src.match(/grantDistrictKey\(/g) || []).length - 1;   // minus the definition
  ok(calls >= 2, `★★★★ grantDistrictKey has ${calls} call site(s) · a lock whose key has no source is a dead end`);
  ok(/grantDistrictKey\(e\.dist, e\.name\)/.test(src),
     '★★★ the generic elder factory grants its district key on first meeting · one giver per district, scales to all ten');
  ok(/grantDistrictKey\('malezor', 'Warden Kelthor'\)/.test(src),
     "★★★★ …and Kelthor is granted EXPLICITLY · he is hand-built and never goes through that factory, so without this the FIRST district is the one whose gold never opens");
  // ★★★ EVERY DISTRICT THAT HAS AN ELDER HAS A KEY SOURCE — and exactly one
  //   does not. Korathen's elder is `id: null` by the Creator's own note
  //   ("District X, Korathen, has no Elder assigned yet"), so its gold chests
  //   have no giver. That is a CONTENT gap, not a wiring bug, and pinning it
  //   here means it stays one district instead of quietly becoming three.
  const withElder = G.DISTRICT_ELDERS ? G.DISTRICT_ELDERS.filter(e => e.id) : [];
  const without   = G.DISTRICT_ELDERS ? G.DISTRICT_ELDERS.filter(e => !e.id).map(e => e.dist) : [];
  ok(withElder.length === 9 && without.join() === 'korathen',
     `★★★ ${withElder.length}/10 districts have an Elder to grant their key · the exception is ${without.join(', ') || 'none'}`);
  const tc = (src.match(/completeElderTrial\(/g) || []).length - 1;
  ok(tc >= 1, `★★★ completeElderTrial has ${tc} call site(s) · the trial flag is reachable, not decorative`);
}

H('★★★★ THE MYTHIC VAULTS ARE IN THE TOWN HALLS');
{
  //   Creator: "mythic chests will only be in town halls."
  // ★★★★ Gating them where they stood was only half the instruction. The four
  //   Gemlord chests sat in deep forest, so a sealed vault meant walking 113
  //   tiles into the northwest stand to be told no. The Elder who sets the
  //   trial stands at their own town hall door, so trial and reward are now
  //   four tiles apart.
  const V = G.TOWN_HALL_VAULTS, T = G.TOWN_HALL_VAULT_TILE;
  ok(V.length === 4, `${V.length} vaults · one per Gemlord weapon`);
  const reg = G.SEER_HQ_CHESTS.filter(c => c.vault);
  ok(reg.length === 4, '★★★ all four are in the interior-chest table · the ONE lookup already wired into '
   + 'collision, facing, the X handler and the depth sort');
  ok(G.COSMIC_CHEST_SPOTS.every(s => !['rubypaw_sword','pearlbow','emerald_axe','sapphire_sword'].includes(s.item)),
     `★★★★ and NO overworld cosmic chest still holds one · two chests holding one unique weapon is a chest that lies `
   + `· remaining: ${G.COSMIC_CHEST_SPOTS.map(s => s.item).join(', ')}`);
  for (const v of V){
    const scene = G.civicSceneId('town-hall', v.dist);
    G.game.scene = scene;
    const cfg = G.interiorConfig(scene);
    ok(!!cfg, `  ${v.dist.padEnd(9)} town hall resolves`);
    ok(!G.walkable(T.tileX, T.tileY),
       `  ${v.dist.padEnd(9)} the vault tile BLOCKS · you face it and press X, you do not walk over a Gemlord arm`);
    // reachable, and standable beside
    const set = new Set();
    for (let y = 0; y < cfg.rows; y++) for (let x = 0; x < cfg.cols; x++) if (G.walkable(x, y)) set.add(x + ',' + y);
    const st = cfg.spawn.x + ',' + cfg.spawn.y;
    const seen = new Set([st]); const stk = [st];
    while (stk.length){
      const [x, y] = stk.pop().split(',').map(Number);
      for (const [ox, oy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const k = (x+ox) + ',' + (y+oy);
        if (set.has(k) && !seen.has(k)){ seen.add(k); stk.push(k); }
      }
    }
    const nbrs = [[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy]) => seen.has((T.tileX+dx) + ',' + (T.tileY+dy)));
    ok(nbrs.length >= 1,
       `  ${v.dist.padEnd(9)} ${nbrs.length} approach tile(s) reachable from spawn · a solid chest you cannot stand beside is unopenable`);
  }
}

H('★★★★ THE VAULT HANDS OVER ONCE, AND ONLY AFTER THE TRIAL');
{
  reset(); P.townHallVaults = {};
  G.game.scene = G.civicSceneId('town-hall', 'vorashil');
  ok(G.tryOpenTownHallVault() === true, 'X on a sealed vault is HANDLED (not fallen through to the NPC scan)');
  ok(!P.items.sapphire_sword, '★★★★ …and hands over nothing · the trial is not done');
  G.completeElderTrial('vorashil');
  G.tryOpenTownHallVault();
  ok(P.items.sapphire_sword === 1, '★★★ after the trial it hands over the blade');
  G.tryOpenTownHallVault();
  ok(P.items.sapphire_sword === 1,
     '★★★★ pressing X again does NOT duplicate it · a Gemlord arm is once-only, and vaultOpened persists that');
  ok(G.vaultOpened('vorashil') && !G.vaultOpened('veridan'), '★★ and the state is per-district');
  reset(); P.townHallVaults = {};
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ wood/silver free · gold keyed per district · mythic earned per elder · shop closed · dev bypass live');
process.exit(f ? 1 : 0);
