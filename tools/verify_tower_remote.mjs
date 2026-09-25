// ★★★★ v0.99.50 · THE TOWER PICKUP IS A TRANSMISSION REMOTE.
//
//   Creator, 2026-09-25: "this is the pick up item from each radio tower to
//   return to scrapjaw to fix each one. It uses the tower's green metal, brass
//   hardware, cyan crystal, bent antenna, analog meter, speaker grille,
//   transmission controls, and weathered relic-tech style."
//
// ★★★★ THE ITEM ALREADY EXISTED AND THE ART DID NOT MATCH IT. `tower_battery`
//   has been the per-district tower pickup since v0.95.611: one drops from the
//   Scrap Chest at each tower's base, Scrapjaw spends it to bring that
//   district's signal back. Its icon was a steel battery cell. The Creator's
//   delivery is a radio handset, and they confirmed it REPLACES the battery.
//
// ★★★★ SO THE KEY DID NOT CHANGE AND THE LABEL DID. `tower_battery` is written
//   into every save, into player.towerBatteries, into the chest ids
//   (`chest_tower_battery_<district>`) and into Scrapjaw's delivery loop.
//   Renaming it to match a string would strand a live playthrough's progress.
//   A key is a database column; a label is what the player reads. This suite
//   exists mostly to hold that line — it checks that the key survived AND that
//   no surface still calls it a battery to the player's face.
//
// ★★★ AND THE PHONE BATTERY IS A DIFFERENT ITEM. Scrapjaw also builds a PHONE
//   BATTERY out of scrap metal in Malezor, which unlocks overworld contact
//   calls. Two "batteries", one quest-giver, and only one of them became a
//   remote — so every assertion below that bans the word has to spare that
//   one, or this rename quietly eats an unrelated quest.
import { bootGame } from './lib/boot_game.mjs';
import fs from 'fs';
import path from 'path';

let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; return !!c; };
const H  = t => console.log('\n' + t);
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');

const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['INVENTORY_META','ZYCUBE_ART','ZYCUBE_ICON','ZYCUBE_CAT_OF',
  'zycubeArtFor','zycubeIconFor','zycubeCategoryOf','player','game','TOWER_ORDER',
  'towerRestored','towersRestoredCount','heldTowerBatteries','renderZycellZycube'] });
console.log = _L;

const SRC  = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
const CODE = SRC.replace(/^\s*\/\/.*$/gm, '');      // ★ an absence check must read CODE, never prose
const ART  = 'radio-tower-transmission-remote.png';

H('★★★★ THE ART IS ON DISK AND WIRED TO THE ITEM THAT ALREADY EXISTED');
{
  const p = path.join(ROOT, 'assets/2D sprites/items/bag', ART);
  ok(fs.existsSync(p), `${ART} exists (${fs.existsSync(p) ? (fs.statSync(p).size / 1024 | 0) : 0} KB)`);
  ok(G.ZYCUBE_ART.tower_battery === ART,
     `★★★★ ZYCUBE_ART.tower_battery → ${G.ZYCUBE_ART.tower_battery}`);
  ok(String(G.zycubeArtFor('tower_battery')).endsWith(ART),
     '★★★ and the resolver hands back that path · the bag row draws the remote');
  ok(G.ZYCUBE_ART.tower_battery !== 'tower-battery.png',
     '★★★ the battery sprite is no longer the icon');
}

H('★★★★ THE KEY SURVIVED THE RENAME · this is the assertion that protects saves');
{
  ok(!!G.INVENTORY_META.tower_battery,
     '★★★★ the item is still keyed `tower_battery` · it is written into every save file in existence');
  ok(G.INVENTORY_META.tower_battery.label === 'Tower Transmission Remote',
     `★★★★ and reads "${G.INVENTORY_META.tower_battery.label}" to the player · label changed, key did not`);
  ok(G.ZYCUBE_CAT_OF.tower_battery === 'mat',
     '★★ still filed under MATERIALS · the drawer it has always been in');
  // the three places the key is baked into ids and state
  ok(/chest_tower_battery_\$\{spot\.dist\}/.test(CODE),
     '★★★ the per-district chest id still spells tower_battery · renaming the key would have orphaned every chest');
  ok(/player\.towerBatteries/.test(CODE),
     '★★★ and player.towerBatteries is untouched · it is the record Scrapjaw actually spends');
  ok(/player\.items\.tower_battery/.test(CODE),
     '★★ the inventory counter too');
}

H('★★★★ NO SURFACE STILL CALLS IT A BATTERY TO THE PLAYER');
{
  // ★★★★ Player-facing means showToast, showDialog lines and quest strings.
  //   Comments and internal ids may say battery all they like — they are not
  //   read by anyone playing.
  const strings = [...CODE.matchAll(/(showToast|showDialog)\s*\(([\s\S]{0,900}?)\)\s*;/g)].map(m => m[2])
    .concat([...CODE.matchAll(/'([^'\\]{12,160})'/g)].map(m => m[1]))
    .concat([...CODE.matchAll(/`([^`\\]{12,300})`/g)].map(m => m[1]));
  // ★★★ THE PHONE BATTERY IS A DIFFERENT ITEM and must survive untouched.
  const phone = /phone battery|PHONE BATTERY|workbench-warm/i;
  const towerish = /\bbatter(y|ies)\b/i;
  const offenders = strings.filter(t => towerish.test(t) && !phone.test(t)
    && /(tower|scrapjaw|signal|chest at the base|grid)/i.test(t));
  ok(!offenders.length,
     `★★★★ no tower-side line still says "battery" (${offenders.length})`
   + (offenders.length ? ' · ' + offenders.slice(0, 3).map(t => t.slice(0, 80)).join(' | ') : ''));
  // and the replacements really landed
  for (const [needle, where] of [
    ['remote in hand',            'the tower approach toast'],
    ['SILVER CHEST at the base holds the remote', 'the chest hint'],
    ['TRANSMISSION REMOTE retrieved', 'the pickup toast'],
    ['keys the remote in',        "Scrapjaw's delivery line"],
    ['Keep the remotes coming',   "Scrapjaw's grid status"],
    ['Bring me the remote',       "Scrapjaw's pitch"],
  ]) ok(CODE.includes(needle), `  ${where} says remote`);
}

H('★★★★ AND THE PHONE BATTERY QUEST IS UNTOUCHED · two batteries, one Scrapjaw');
{
  // ★★★★ The scrap-metal → PHONE BATTERY exchange in Malezor unlocks overworld
  //   contact calls and has nothing to do with the towers. A rename that swept
  //   the whole file would have eaten it silently.
  ok(/PHONE BATTERY/.test(CODE), '★★★★ the PHONE BATTERY still exists by name');
  ok(/workbench-warm PHONE BATTERY/.test(CODE),
     '★★★ Scrapjaw still hands one over, warm off the bench · the line is intact');
  ok(/trade to Scrapjaw for Phone Battery/.test(SRC),
     '★★ and scrap metal still says what it is for');
  ok(/Trade SCRAP METAL for the Phone Battery|trade SCRAP METAL for the Phone Battery/.test(CODE),
     '★★★ the quest hint is intact · the sweep stopped where it should have');
}

H('★★★ ONE PER TOWER, AND THE DELIVERY LOOP STILL RUNS ON IT');
{
  ok(Array.isArray(G.TOWER_ORDER) && G.TOWER_ORDER.length > 1,
     `★★ ${G.TOWER_ORDER.length} towers in TOWER_ORDER · "each one", as the Creator put it`);
  // drive it: hold two remotes, and the held list names exactly those districts
  G.player.towerBatteries = {}; G.player.scrapjawTowersRestored = {}; G.player.radioTowerFixed = false;
  const [a, b] = G.TOWER_ORDER.filter(d => d !== 'malezor').slice(0, 2);
  G.player.towerBatteries[a] = true; G.player.towerBatteries[b] = true;
  const held = G.heldTowerBatteries();
  ok(held.includes(a) && held.includes(b) && held.length === 2,
     `★★★ holding ${a} and ${b} remotes · heldTowerBatteries reports exactly those two`);
  // ★★★ and a remote is DISTRICT-TAGGED · the v0.95.611 bug was a Korathen
  //   pickup restoring Zarvane, because loot was district-agnostic
  G.player.scrapjawTowersRestored[a] = true;
  ok(!G.heldTowerBatteries().includes(a) && G.heldTowerBatteries().includes(b),
     `★★★★ restoring ${a} drops only ${a} from the held list · a remote still belongs to ITS tower`);
  G.player.towerBatteries = {}; G.player.scrapjawTowersRestored = {};
}

H('★★ THE SUPERSEDED BATTERY SPRITE IS PARKED, NOT ORPHANED');
{
  const doc = path.join(ROOT, 'assets/2D sprites/items/bag/_PENDING.md');
  ok(fs.existsSync(doc), '_PENDING.md exists');
  const txt = fs.readFileSync(doc, 'utf8');
  ok(/`tower-battery\.png`/.test(txt),
     '★★★ tower-battery.png is listed there · superseded is not the same as rejected, and the art is still good');
  ok(!new RegExp('\\|\\s*`' + ART.replace(/\./g, '\\.') + '`').test(txt),
     '★★★ and the remote is no longer parked · it went live, so its parking slip came off');
  ok(fs.existsSync(path.join(ROOT, 'assets/2D sprites/items/bag/tower-battery.png')),
     '★★ the file itself is still on disk · nothing was deleted to make a rename tidy');
  ok(!new RegExp("tower-battery\\.png").test(CODE),
     '★★★ and nothing in the code points at it any more · a parked sprite with a live reference is the worst of both');
}

console.log(f ? `\n❌ ${f} failed`
  : '\n✅ the remote is the tower pickup · key kept for saves, label changed for players · the phone battery quest survived intact');
process.exit(f ? 1 : 0);
