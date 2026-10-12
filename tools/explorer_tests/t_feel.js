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
  await p.evaluate(() => __x.touchdown(4)); await p.waitForTimeout(1500); await adv(6);
  await p.evaluate(() => { __x.S().weapon.charge = 100; __x.enterCave(4); }); await p.waitForTimeout(500); await adv(4);
  // a hard landing: Carl falls onto the floor and squashes, shakes the picture, and kicks up dust
  await p.evaluate(() => { const solid = c => c === 'G' || c === 'P' || c === '#' || c === 'C'; let best = null; for (let k = 0; k < __x.caveState().n; k++) { __x.caveRoom(k, 'left'); const R = __x.side(), g = R.g; for (let y = 2; y < R.C.H - 1; y++) for (let x = 2; x < R.C.W - 3; x++) { if (!solid(g[y][x]) || !solid(g[y][x + 1])) continue; let hgt = 0; while (y - hgt - 1 > 0 && !solid(g[y - hgt - 1][x]) && !solid(g[y - hgt - 1][x + 1]) && g[y - hgt - 1][x] !== 'H') hgt++; if (!best || hgt > best.h) best = { k, x, y, h: hgt }; } } __x.caveRoom(best.k, 'left'); const S2 = __x.side(); const x0 = best.x - 1, FLOOR = best.y; S2.p.x = x0 + 1; S2.p.y = FLOOR + (6 - 13); S2.p.vy = 0; S2.p.ground = false; });
  let land = { shakeT: 0, sq: null };
  for (let i = 0; i < 80 && !(land.sq && land.shakeT > 0); i++) { await p.waitForTimeout(25); const f = await p.evaluate(() => __x.feel()); if (f.sq) land.sq = f.sq; if (f.shakeT > land.shakeT) land.shakeT = f.shakeT; }
  L('a hard landing squashes Carl and shakes the picture', land, land.sq !== null && land.shakeT > 0);
  // a jump stretches Carl
  await p.waitForTimeout(600);
  await p.evaluate(() => { const S2 = __x.side(); S2.p.ground = true; S2.p.coyote = .1; S2.p.jumpBuf = 0; });
  await p.keyboard.press('ArrowUp'); await p.waitForTimeout(20);
  const jump = await p.evaluate(() => __x.feel().sq);
  L('a jump stretches Carl', jump, jump && jump.y > 1);
  // a boomfist strike freezes a frame: the world holds still briefly
  await p.waitForTimeout(800);
  await p.evaluate(() => { __x.devCopies(); __x.utilAction('boomfists', 'equip'); });
  await p.evaluate(() => { for (let i = 0; i < 4; i++) __x.cycleUtil(); });
  const hit = await p.evaluate(() => { const S2 = __x.side(); S2.en.forEach(e => { e.x = S2.p.x + .8; e.y = S2.p.y + .45; e.hp = 200; e.dead = false; }); return __x.util().active; });
  await p.keyboard.press('c'); await p.waitForTimeout(10);
  const fz = await p.evaluate(() => __x.feel().hitStop);
  L('a boomfist strike freezes a frame', { active: hit, hitStop: fz }, fz > 0);
  L('no page errors', errs, errs.length === 0);
  console.log(out.every(Boolean) ? 'ALL PASS' : 'SOME FAIL');
  await b.close();
})();
