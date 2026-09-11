// ★★★ v0.96.76 · IS THE FANG ACTUALLY IN?  Every link in the chain, checked.
// Creator asked "so is it in?" — and the honest answer at v0.96.75 was "almost":
// the art, damage, HUD, grant and L1/R1 cycle all worked, but the ZyPhone
// Weapons panel had no row, while Rakoron's own toast told the player to go
// there.  A weapon the game tells you where to find must be there when you look.
const fs=require('fs'); const src=fs.readFileSync('/tmp/all.js','utf8');
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
let f=0; const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);

H('★ 1 · THE FILES EXIST, at the paths the code names');
for (const m of new Set([...src.matchAll(/'(assets\/[^']*fang[^']*\.png)'/g)].map(x=>x[1]))){
  if (/fanghall/.test(m)) continue;
  ok(fs.existsSync(ROOT+decodeURIComponent(m)), m);
}
H('★ 2 · IT IS OBTAINABLE');
ok(/rubypaw_fang: 1/.test(src), 'Rakoron grants it on the meeting');
ok(/rubypawFangGiven/.test(src), 'and only once — persisted');
H('★ 3 · IT IS EQUIPPABLE · both routes');
ok(/key:'fang'/.test(src.match(/const S1_WEAPON_RING = \[[\s\S]*?\n\];/)[0]), 'L1/R1 ring cycle');
ok(/id="zyFangRow"/.test(src), '★ ZyPhone → Weapons row — the one the toast points at');
ok(/player\.fangEquipped = !player\.fangEquipped/.test(src), 'and the row toggles it');
ok(/!hasSword && !hasRuby && !hasAxe && !hasBow && !hasFang/.test(src),
   '★ the empty state counts it — owning only the Fang is not "no weapons yet"');
H('★ 4 · IT DRAWS, AND IT HITS');
ok(/_fangActive \? RIZER_RUBYPAW_FANG/.test(src), 'the draw picker selects its sheet');
ok(/fang:\s*'assets\/2D%20sprites\/ui\/weapon-hud-fang\.png'/.test(src), 'the HUD wheel is registered');
ok(/return \(player\.fangEquipped && !player\.fangBroken\) \? 'fang' : 'fists'/.test(src),
   'currentWeaponKey resolves it');
ok(/_fangSwing/.test(src) && /baseAtk \|\| 25\) \* 1\.6/.test(src), 'the swing deals its x1.6');
ok(/fangDurability = Math\.max\(0/.test(src), 'and spends durability on connect');
H('★ 5 · IT REPAIRS, LIKE EVERY OTHER BLADE');
ok(/id="zyFangRepair"/.test(src) && /player\.fangDurability = FANG_MAX/.test(src), '100 gems re-hones it');
H('★ 6 · ONE SQUARE SLOT still holds with five weapons');
ok(!/axeEquipped = false; player\.bowEquipped = false/.test(src.replace(/\/\/[^\n]*/g,'')),
   'no hand-listed exclusion survives — all four sites ask the ring');
ok((src.match(/keepOneS1Weapon\(/g)||[]).length >= 5, 'keepOneS1Weapon used at every equip site');
H('★ 7 · IT SURVIVES A RELOAD');
for (const k of ['rubypawFangGiven','fangEquipped','fangBroken','fangDurability'])
  ok(new RegExp(k+':').test(src), `save shape carries ${k}`);
H(f?`❌ ${f} failed`:'✅ the Fang is IN · obtainable, equippable both ways, draws, hits, repairs, persists');
process.exit(f?1:0);
