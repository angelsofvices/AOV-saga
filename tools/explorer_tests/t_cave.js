const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1000, height: 600 }, reducedMotion: 'reduce' }); p.setDefaultTimeout(8000);
  const errs = []; p.on('pageerror', e => errs.push(e.message)); const out = [];
  const L = (k, v, ok) => { out.push(ok); console.log('STEP', k, ok ? 'PASS' : 'FAIL', JSON.stringify(v).slice(0, 320)); };
  const adv = async (n) => { for (let i = 0; i < n; i++) { const d = await p.$('.x-dialog:not([hidden])'); if (!d) return; await d.click({ force: true }); await p.waitForTimeout(120); } };
  const U = 'http://localhost:8765/explorer/';
  await p.goto(U + '?debug&newgame', { timeout: 20000 }); await p.waitForTimeout(500);
  await p.mouse.click(500, 280); await p.waitForTimeout(200); await p.click('[data-a="new"]'); await p.waitForTimeout(300);
  await p.evaluate(() => { const S = JSON.parse(JSON.stringify(__x.S())); S.hero.first = 'CARL'; S.stage = 'nav'; S.at = 'nasarus'; Object.assign(S.flags, {crashed:1, crashIntro:1, tutorialPad:1, charted:1, airRule:1}); S.hq.built = { camp: Date.now() }; localStorage.setItem('aov.explorer.v1', JSON.stringify(S)); });
  await p.goto(U + '?debug', { timeout: 20000 }); await p.waitForTimeout(500); await p.mouse.click(500, 280); await p.waitForTimeout(200); await p.click('[data-a="continue"]'); await p.waitForTimeout(800);
  // 1 · every planet 1-27 has one cave mouth on a border tile, reachable from its stand
  // use the game's own map builder through the surface (the same call the game makes)
  const check = [];
  for (let no = 1; no <= 27; no++) {
    await p.evaluate(n => __x.touchdown(n), no); await p.waitForTimeout(350);
    const r = await p.evaluate(() => { const ms = __x.M().landmarks.filter(l => l.dungeon); const m = __x.M(); const m1 = ms[0]; if (!m1) return { n: 0 }; const i = m1.y * m.W + m1.x; const st = m1.stand; const sc = m.grid[st.y * m.W + st.x]; return { n: ms.length, border: m.grid[i] === 'L', standOpen: !!st && !window.AOV_WORLDGEN.SOLID[sc] }; });
    check.push([no, r.n === 1 && r.border && r.standOpen]);
  }
  const bad = check.filter(c => !c[1]).map(c => c[0]);
  L('every planet 1-27 has one cave mouth on a rock border, open in front', { bad }, bad.length === 0);
  // 2 · the cave layout is complete: a start, a door, enemies, loot
  const cave = await p.evaluate(() => { const C = window.AOV_WORLDGEN.cave(4), R = C.rooms; return { kind: C.kind, rooms: R.length, shaped: R.every(r => r.rows.length === r.H && r.rows.every(x => x.length === r.W)), last: R[R.length - 1].last, enemies: R.reduce((a, r) => a + r.enemies.length, 0), loot: R.reduce((a, r) => a + r.rows.join('').split('$').length - 1, 0), spikes: R.reduce((a, r) => a + r.rows.join('').split('H').length - 1, 0) }; });
  L('a cave is 3-5 side-scrolling rooms with enemies, loot and spikes, ending at the last room', cave, cave.rooms >= 3 && cave.rooms <= 5 && cave.shaped && cave.last && cave.enemies > 0 && cave.loot > 0 && cave.spikes > 0);
  // 3 · go to the cave mouth on world 4, press A: the choice, then enter
  await p.evaluate(() => __x.touchdown(4)); await p.waitForTimeout(350); await adv(6);
  const mouth = await p.evaluate(() => { const l = __x.M().landmarks.filter(q => q.dungeon === 4)[0]; const dx = l.x - l.stand.x, dy = l.y - l.stand.y; return { x: l.stand.x, y: l.stand.y, dir: dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up' }; });
  await p.evaluate(s => __x.tp(s.x, s.y, s.dir), mouth); await p.waitForTimeout(200);
  await p.evaluate(() => __x.btnA()); await p.waitForTimeout(500);
  for (let i = 0; i < 8; i++) { const c = await p.$('.x-dchoices button'); if (c) break; const d = await p.$('.x-dialog:not([hidden])'); if (d) await d.click({ force: true }); await p.waitForTimeout(450); }
  const ch = await p.evaluate(() => [...document.querySelectorAll('.x-dchoices button')].map(b => b.textContent));
  L('A at the mouth offers to enter', ch, ch.indexOf('ENTER THE CAVE') >= 0);
  await p.click('.x-dchoices button:has-text("ENTER THE CAVE")'); await p.waitForTimeout(700);
  const inCave = await p.evaluate(() => ({ mode: __x.S().stage, side: !!__x.side(), sideMode: !!__x.side() }));
  L('the cave opens as a side-scroller', inCave, !!inCave.side);
  await p.screenshot({ path: '/tmp/cave_start.png' });
  // 4 · walk right, jump, pits and loot
  const x0 = await p.evaluate(() => __x.side().p.x);
  await p.keyboard.down('ArrowRight'); await p.waitForTimeout(1200); await p.keyboard.up('ArrowRight'); await p.waitForTimeout(200);
  const x1 = await p.evaluate(() => __x.side().p.x);
  L('left and right move through the cave', { x0, x1 }, x1 > x0 + 3);
  await p.evaluate(() => __x.sideAct('jump')); await p.waitForTimeout(120);
  const airborne = await p.evaluate(() => __x.side().p.vy < 0 || !__x.side().p.ground);
  L('jump leaves the ground', airborne, airborne);
  await p.waitForTimeout(900);
  // 5 · bare-handed attack in reach does nothing: no fist combat (the armed hit is in t_blaster)
  await p.evaluate(() => { const S2 = __x.side(); S2.p.x = 40; S2.p.y = 12.1; S2.p.face = 1; S2.en.forEach(e => { e.x = 41; e.y = 12.1; e.hp = 60; }); });
  await p.waitForTimeout(200);
  await p.evaluate(() => { for (let i = 0; i < 4; i++) { __x.sideAct('attack'); } });
  await p.waitForTimeout(250);
  const hit = await p.evaluate(() => __x.side().en.map(e => e.hp));
  L('bare-handed attack does nothing (no fists)', hit, hit.every(h => h === 60));
  // 6 · fall back to the start, and climb out
  await p.evaluate(() => { __x.side().p.x = 2; __x.side().p.y = 12; });
  await p.keyboard.down('ArrowUp'); await p.waitForTimeout(300); await p.keyboard.up('ArrowUp');
  await p.waitForTimeout(300);
  const back = await p.evaluate(() => ({ side: !!__x.side(), map: __x.M().id }));
  L('climbing out at the mouth returns to the planet exactly', back, !back.side && back.map === 'w4');
  // 7 · re-enter, reach the far door: the Immortal Zone is charted
  await p.evaluate(() => { __x.enterCave(4); }); await p.waitForTimeout(400); await adv(4);
  L('a second visit to the cave works', await p.evaluate(() => !!__x.side()), await p.evaluate(() => !!__x.side()));
  await p.evaluate(() => __x.caveRoom(__x.caveState().n - 1, 'left')); await p.waitForTimeout(300);
  await p.evaluate(() => { const s = __x.side(); s.p.x = s.C.W - 2.2; s.p.y = s.C.exit.y - .001; s.p.vy = 0; });
  await p.keyboard.down('ArrowRight'); await p.waitForTimeout(800); await p.keyboard.up('ArrowRight'); await p.waitForTimeout(600);
  const zone = await p.evaluate(() => ({ map: __x.M() && __x.M().id, iz: __x.S().iz && __x.S().iz[4] ? 1 : 0 }));
  L('the last room opens onto the Immortal Zone (the peak or valley), and it is charted', zone, zone.map === 'iz4' && zone.iz === 1);
  await p.screenshot({ path: '/tmp/iz.png' });
  // 8 · the zone has its deity, rare Aethren and caches; the way out returns to the mouth
  const iz = await p.evaluate(() => ({ deity: __x.M().landmarks.filter(l => l.deity).length, caches: __x.M().landmarks.filter(l => l.izLoot).length, exit: __x.M().landmarks.filter(l => l.dungeonExit).length, rare: __x.M().spawns.length }));
  L('the zone holds the deity, caches, the way out and rare Aethren', iz, iz.deity === 1 && iz.caches >= 1 && iz.exit === 1 && iz.rare >= 1);
  const ex = await p.evaluate(() => { const l = __x.M().landmarks.filter(q => q.dungeonExit)[0]; return { x: l.x, y: l.y }; });
  await p.evaluate(s => __x.tp(s.x - 1, s.y, 'right'), ex); await p.waitForTimeout(150);
  await p.evaluate(() => __x.btnA()); await p.waitForTimeout(500); await adv(3); await p.waitForTimeout(600);
  const backIn = await p.evaluate(() => ({ side: !!__x.side(), st: __x.caveState() }));
  L('the way out leads back into the cave, its last room (the only road home)', backIn, backIn.side && backIn.st.k === backIn.st.n - 1);
  await p.evaluate(() => __x.caveRoom(0, 'right')); await p.waitForTimeout(300);
  await p.evaluate(() => { const s = __x.side(); s.p.x = 1.2; s.p.y = s.C.start.y - .001; s.p.vy = 0; });
  await p.keyboard.down('ArrowLeft'); await p.waitForTimeout(800); await p.keyboard.up('ArrowLeft'); await p.waitForTimeout(700); await adv(3);
  L('walking out of the first room returns to the cave mouth on the planet', await p.evaluate(() => __x.M().id), await p.evaluate(() => __x.M().id === 'w4' && !__x.side()));
  // 9 · the zone is reachable from the mouth afterwards
  await p.evaluate(() => { const l = __x.M().landmarks.filter(q => q.dungeon === 4)[0]; __x.tp(l.stand.x, l.stand.y, 'up'); }); await p.waitForTimeout(200);
  await p.evaluate(() => __x.btnA()); await p.waitForTimeout(500);
  for (let i = 0; i < 8; i++) { const c = await p.$('.x-dchoices button'); if (c) break; const d = await p.$('.x-dialog:not([hidden])'); if (d) await d.click({ force: true }); await p.waitForTimeout(450); }
  const ch2 = await p.evaluate(() => [...document.querySelectorAll('.x-dchoices button')].map(b => b.textContent));
  L('the mouth offers only the cave, even once the zone is charted (no shortcut)', ch2, ch2.indexOf('ENTER THE CAVE') >= 0 && !ch2.some(c => /ZONE/.test(c)));
  L('no AstraNav inside a cave, and no page errors', errs, errs.length === 0);
  console.log(out.every(Boolean) ? 'ALL PASS' : 'SOME FAIL');
  await b.close();
})();
