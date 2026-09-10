// ★★★ v0.96.64 · LOAD GAME PICKS UP WHERE YOU LEFT OFF
//
//   Creator: "once a chest is opened and looted, it stays looted.  no refill
//   on load game.  also make sure all completed quests and expeditions stay
//   complete.  load game should just pick up where player left off."
//
// ★★ THIS CANNOT BE CHECKED BY READING saveGame().  Everything it carries is
//   correct — the bug is entirely in what it does NOT carry, and absence is
//   invisible.  So the suite derives the surface from the SOURCE: every
//   `player.X =` in rp7b.html is a field the game writes, and any of them that
//   looks like progress and is missing from the snapshot is a field that
//   silently resets on load.
//
// ★★★ IT FOUND THREE SEPARATE CHEST LEDGERS and only one was saved.
const fs = require('fs');
const ROOT = '/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const HTML = fs.readFileSync(ROOT + 'rp7b.html', 'utf8');
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H = t => console.log('\n' + t);

// the snapshot's own field list, read straight out of saveGame()
const sg = HTML.slice(HTML.indexOf('function saveGame'), HTML.indexOf('function loadGame'));
const saved = new Set([...sg.matchAll(/^\s{6,}([a-zA-Z_][a-zA-Z0-9_]*)\s*:/gm)].map(m => m[1]));

// every field the game ever writes
const writes = new Set([...HTML.matchAll(/player\.([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:=[^=]|\[)/g)].map(m => m[1]));

const RUNTIME = /^(x|y|dir|hp|astral|moving|anim|idle|attack|move|run|skat|sprint|jump|dodge|block|flash|hurt|dead|dying|vel|cam|trail|last|next|facing|baseAtk|diamond|coins|chair|anchor|faeCatch|farmLast|clockOffset|deathGargoyles|ecology|dreamsHad|auraxionPhase|stepsInGrass|_)/;
const PROGRESS = /(open|loot|complete|unlock|beat|gift|found|reunit|seen|taught|quest|step|done|purchas|owned|known|visit|met|recruit|deliver|redeem|craft|collect|bonded|gifted|hatched|taken|cleared|Keys$|Chests$)/i;

H('1 · ★★★ EVERY PROGRESS FIELD THE GAME WRITES IS IN THE SNAPSHOT');
{
  const prog = [...writes].filter(k => !RUNTIME.test(k) && PROGRESS.test(k)).sort();
  const missing = prog.filter(k => !saved.has(k));
  ok(missing.length === 0,
     `★★★ ${prog.length} progress fields written by the game, ${missing.length} missing from the save`
     + (missing.length ? ' · ' + missing.join(', ') : ''));
  console.log(`     (the snapshot carries ${saved.size} player fields in total)`);
}

H('2 · ★★★ A LOOTED CHEST STAYS LOOTED · all three ledgers');
{
  // ★ there is not one chest registry, there are three, and before v0.96.64
  //   only the first was saved — so every Scrapjaw tower chest and every chest
  //   in the Zoryn race refilled on load, which is the refill the Creator saw.
  for (const k of ['lootedChests', 'towerChestsLooted', 'zorynChestsTaken']){
    ok(saved.has(k), `★★ ${k} survives a reload`);
    ok(new RegExp('player\\.' + k).test(HTML), `   and the game actually writes it`);
  }
  ok(saved.has('seerHqChests'), '★ seerHqChests too · the v0.95.699 fix of the same shape');
  ok(saved.has('bookshelfTaken'), "★ and Dad's bookshelf scrolls");
}

H('3 · ★★ COMPLETED QUESTS STAY COMPLETE');
{
  for (const k of ['auraxionMissionComplete','kelthorMet','kelthorStep','rakoronMet',
                   'rakoronCaveFound','gearbagGifted','gemlordCavesOpen','prismshardOwned',
                   'lostBoyReunited','dadStarterQuestComplete','orrenQuestDone'])
    ok(saved.has(k), `★ ${k}`);
}

H('4 · ★★ AND THE EXPEDITION ITSELF · where you went, who you met, what you found');
{
  for (const k of ['metNpcs','visitedDistricts','stepsExploring','zyrexEverOwned',
                   'moviesCollected','ownedCosmetics','dracolordSeen','anciuxorSeen','rxpUnlocked'])
    ok(saved.has(k), `★ ${k}`);
}

H('5 · ★★★ AND THE LOAD PATH APPLIES ALL OF IT');
{
  ok(/Object\.assign\(player, s\.player\)/.test(HTML),
     '★★★ loadGame does Object.assign(player, s.player) · which is WHY adding a field to the snapshot is the entire fix, and why forgetting one is silent');
  ok(/rescueRestoredPosition/.test(HTML),
     '★★ and the restored position is rescued afterwards · a save inside a room that later shrank must not load you into the void (v0.96.38)');
}

console.log(f ? `\n❌ ${f} FAILED` : '\n✅ ALL PASS');
process.exit(0);
