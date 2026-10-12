const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1000, height: 600 }, reducedMotion: 'reduce' }); p.setDefaultTimeout(8000);
  const errs = []; p.on('pageerror', e => errs.push(e.message)); const out = [];
  const L = (k, v, ok) => { out.push(ok); console.log('STEP', k, ok ? 'PASS' : 'FAIL', JSON.stringify(v).slice(0, 300)); };
  const adv = async (n) => { for (let i = 0; i < n; i++) { const d = await p.$('.x-dialog:not([hidden])'); if (!d) return; await d.click({ force: true }); await p.waitForTimeout(120); } };
  const U = 'http://localhost:8765/explorer/';
  await p.goto(U + '?debug&newgame', { timeout: 20000 }); await p.waitForTimeout(500);
  await p.mouse.click(500, 280); await p.waitForTimeout(200); await p.click('[data-a="new"]'); await p.waitForTimeout(300);
  await p.evaluate(() => { const S = JSON.parse(JSON.stringify(__x.S())); S.hero.first = 'CARL'; S.stage = 'nav'; S.at = 'nasarus'; Object.assign(S.flags, {crashed:1, crashIntro:1, tutorialPad:1, charted:1, airRule:1});
    const now = Date.now(); S.hq.built = { camp: now, stores: now, research: now, workshop: now }; S.hq.drive = true; S.hq.store = { scrap: 20, crystal: 10, data: 10 }; S.core.machines = { workstation: now }; S.core.recipes = {}; S.ship = { fuel: 0, level: 1 }; localStorage.setItem('aov.explorer.v1', JSON.stringify(S)); });
  await p.goto(U + '?debug', { timeout: 20000 }); await p.waitForTimeout(500); await p.mouse.click(500, 280); await p.waitForTimeout(200); await p.click('[data-a="continue"]'); await p.waitForTimeout(800);
  await p.evaluate(() => __x.touchdown('nasarus')); await p.waitForTimeout(1500); await adv(6);
  await p.evaluate(() => { __x.S().weapon.repaired = true; __x.S().weapon.equipped = true; __x.S().weapon.charge = 100; __x.jetAction('repair'); __x.jetAction('equip'); }); await p.evaluate(() => { for (let i = 0; i < 30 && __x.util().active !== 'jetpack'; i++) __x.cycleUtil(); });
  await p.evaluate(() => { const M2 = __x.M(), P2 = __x.P(); __x.tp(17, 27, 'right'); for (let x = 18; x < 28; x++) M2.grid[27 * M2.W + x] = '.'; });
  await p.waitForTimeout(200);
  // a tap hops: Carl leaves the ground briefly and settles back
  await p.keyboard.press('c'); await p.waitForTimeout(90);
  const hop = await p.evaluate(() => __x.utilPos().alt);
  L('a tap of square hops', hop, hop > 0);
  await p.waitForTimeout(1800);
  const landed = await p.evaluate(() => __x.utilPos().alt);
  L('the hop settles back to the ground', landed, landed === 0);
  // holding flies: no lift before the hold time, lift after it
  await p.keyboard.down('c'); await p.waitForTimeout(100);
  const early = await p.evaluate(() => __x.utilPos().alt);
  await p.waitForTimeout(1600);
  const flying = await p.evaluate(() => __x.utilPos().alt);
  await p.keyboard.up('c'); await p.waitForTimeout(2200);
  L('holding square flies after the hold time', { early, flying }, early === 0 && flying > .3);
  // the field stride: a walk starts slow and builds to full pace
  await p.evaluate(() => { const M2 = __x.M(); __x.tp(17, 27, 'right'); for (let x = 18; x < 28; x++) M2.grid[27 * M2.W + x] = '.'; });
  await p.waitForTimeout(200);
  await p.keyboard.down('ArrowRight'); await p.waitForTimeout(90);
  const sp0 = await p.evaluate(() => __x.P().spd);
  await p.waitForTimeout(500);
  const sp1 = await p.evaluate(() => __x.P().spd);
  await p.keyboard.up('ArrowRight'); await p.waitForTimeout(300);
  L('a walk starts slow and builds to full pace', { sp0, sp1 }, sp0 < 1 && sp1 === 1);
  // the cave: speed builds with acceleration, and stops with friction
  await p.evaluate(() => __x.touchdown(4)); await p.waitForTimeout(1500); await adv(6);
  await p.evaluate(() => { __x.S().weapon.charge = 100; __x.enterCave(4); }); await p.waitForTimeout(500); await adv(4);
  await p.evaluate(() => { const solid = c => c === 'G' || c === 'P' || c === '#' || c === 'C'; let best = null; for (let k = 0; k < __x.caveState().n; k++) { __x.caveRoom(k, 'left'); const R = __x.side(), g = R.g; for (let y = 2; y < R.C.H - 1; y++) for (let x = 2; x < R.C.W - 3; x++) { if (!solid(g[y][x]) || !solid(g[y][x + 1])) continue; let hgt = 0; while (y - hgt - 1 > 0 && !solid(g[y - hgt - 1][x]) && !solid(g[y - hgt - 1][x + 1]) && g[y - hgt - 1][x] !== 'H') hgt++; if (!best || hgt > best.h) best = { k, x, y, h: hgt }; } } __x.caveRoom(best.k, 'left'); const S2 = __x.side(); const x0 = best.x - 1, FLOOR = best.y; S2.p.x = x0 + 1; S2.p.y = FLOOR + (12.1 - 13); S2.p.vy = 0; S2.p.vx = 0; S2.p.ground = true; });
  await p.waitForTimeout(300);
  await p.keyboard.down('ArrowRight'); await p.waitForTimeout(60);
  const v1 = await p.evaluate(() => __x.side().p.vx);
  await p.waitForTimeout(400);
  const v2 = await p.evaluate(() => __x.side().p.vx);
  await p.keyboard.up('ArrowRight'); await p.waitForTimeout(40);
  const v3 = await p.evaluate(() => __x.side().p.vx);
  await p.waitForTimeout(250);
  const v4 = await p.evaluate(() => __x.side().p.vx);
  L('the cave run accelerates, then friction stops it', { v1, v2, v3, v4 }, v1 < v2 && v2 > 4 && v4 < v2 * .5);
  // coyote time: a jump still works just after leaving the ledge
  await p.evaluate(() => { const S2 = __x.side(); S2.p.ground = false; S2.p.coyote = .1; S2.p.jumpBuf = 0; S2.p.vy = 0; });
  await p.keyboard.press('ArrowUp'); await p.waitForTimeout(30);
  const cy = await p.evaluate(() => __x.side().p.vy);
  L('coyote time lets a jump start just after leaving a ledge', cy, cy < 0);
  L('no page errors', errs, errs.length === 0);
  console.log(out.every(Boolean) ? 'ALL PASS' : 'SOME FAIL');
  await b.close();
})();
