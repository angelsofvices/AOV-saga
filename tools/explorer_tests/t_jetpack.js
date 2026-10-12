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
  const pos = () => p.evaluate(() => ({ x: __x.P().x, y: __x.P().y, alt: +(__x.P().alt || 0).toFixed(2) }));
  // the blaster is repaired and equipped; the jetpack is assembled and equipped from the Workstation API
  await p.evaluate(() => { __x.S().weapon.repaired = true; __x.S().weapon.equipped = true; __x.S().weapon.charge = 100; });
  const jr = await p.evaluate(() => [__x.jetAction('repair'), __x.jetAction('equip')]);
  L('the jetpack assembles and equips', jr, jr[0] && jr[1]);
  const lst = await p.evaluate(() => __x.util());
  L('△ cycle list holds both utilities', lst.list, lst.list.join() === 'astrablaster,jetpack');
  // △ cycles, and a cycle fires nothing and lifts nothing
  await p.keyboard.press('q'); await p.waitForTimeout(200);
  const afterQ = await p.evaluate(() => ({ active: __x.util().active, bolts: __x.bolts().length, alt: __x.P().alt || 0 }));
  L('△ switches to the jetpack without firing or lifting', afterQ, afterQ.active === 'jetpack' && afterQ.bolts === 0 && afterQ.alt === 0);
  await p.keyboard.press('q'); await p.waitForTimeout(150);
  L('△ again returns to the blaster', await p.evaluate(() => __x.util().active), await p.evaluate(() => __x.util().active) === 'astrablaster');
  await p.keyboard.press('q'); await p.waitForTimeout(150);
  // takeoff: lift builds gradually, it does not snap to the maximum
  await p.keyboard.down('c'); await p.waitForTimeout(330);
  const l1 = await p.evaluate(() => __x.util().lift);
  await p.waitForTimeout(250);
  const l2 = await p.evaluate(() => __x.util().lift);
  L('takeoff: lift builds gradually', { l1, l2 }, l1 > 0 && l1 < 1.6 && l2 > l1);
  await p.waitForTimeout(1300);
  const up = await pos();
  L('holding □ lifts Carl off the ground', up, up.alt >= .6);
  await p.keyboard.up('c'); await p.waitForTimeout(100);
  // release: lift fades and gravity settles Carl down
  const r1 = await p.evaluate(() => __x.util().alt);
  await p.waitForTimeout(1600);
  const r2 = await pos();
  L('release: Carl settles back to the ground', { r1, alt: r2.alt }, r2.alt === 0 && r1 > r2.alt);
  // a bush ahead: grounded Carl is stopped, a flying Carl clears it, and walls still stop him
  const base = await pos();
  await p.evaluate((b) => { const M2 = __x.M(); const put = (x, y, c) => { M2.grid[y * M2.W + x] = c; }; for (let k = 1; k <= 1; k++) put(b.x + k, b.y, 'b'); put(b.x + 6, b.y, '#'); }, base);
  await p.evaluate(() => { __x.P().x = __x.P().x; });
  await p.keyboard.down('ArrowRight'); await p.waitForTimeout(700); await p.keyboard.up('ArrowRight'); await p.waitForTimeout(150);
  const gr = await pos();
  L('grounded: the bush stops Carl', { from: base.x, to: gr.x }, gr.x === base.x);
  await p.keyboard.down('c'); await p.waitForTimeout(1500);
  await p.keyboard.down('ArrowRight'); await p.waitForTimeout(1300); await p.keyboard.up('ArrowRight');
  const fly = await pos();
  L('flying: Carl clears the bush and stops at the wall', { from: base.x, to: fly.x, alt: fly.alt }, fly.x > base.x + 1 && fly.x < base.x + 6 && fly.alt >= .6);
  await p.keyboard.up('c'); await p.waitForTimeout(2200);
  const land = await p.evaluate(() => { const P2 = __x.P(); return { alt: P2.alt || 0, onSolid: ['T','b','B','~','A','S','M','X','#','P','L','F','w','K'].indexOf(__x.M().grid[Math.floor(P2.y) * __x.M().W + Math.floor(P2.x)]) >= 0 }; });
  L('landing: grounded on open ground', land, land.alt === 0 && !land.onSolid);
  // the cave: the same button lifts Carl in the side view
  await p.evaluate(() => __x.touchdown(4)); await p.waitForTimeout(1500); await adv(6);
  await p.evaluate(() => { __x.S().weapon.charge = 100; __x.enterCave(4); }); await p.waitForTimeout(500); await adv(4);
  // the tallest open column in the cave's rooms (the rooms are ledges under a ragged ceiling)
  await p.evaluate(() => { const solid = c => c === 'G' || c === 'P' || c === '#' || c === 'C'; let best = null; for (let k = 0; k < __x.caveState().n; k++) { __x.caveRoom(k, 'left'); const S2 = __x.side(), g = S2.g; for (let y = 2; y < S2.C.H - 1; y++) for (let x = 2; x < S2.C.W - 3; x++) { if (!solid(g[y][x]) || !solid(g[y][x + 1])) continue; let hgt = 0; while (y - hgt - 1 > 0 && !solid(g[y - hgt - 1][x]) && !solid(g[y - hgt - 1][x + 1]) && g[y - hgt - 1][x] !== 'H') hgt++; if (!best || hgt > best.h) best = { k, x, y, h: hgt }; } } __x.caveRoom(best.k, 'left'); const S3 = __x.side(); S3.p.x = best.x + .2; S3.p.y = best.y - .9 - .001; S3.p.vy = 0; window.__best = best; });
  await p.waitForTimeout(300);
  const y0 = await p.evaluate(() => __x.side().p.y);
  await p.keyboard.down('c'); await p.waitForTimeout(900);
  const cv = await p.evaluate(() => ({ vy: __x.side().p.vy, y: __x.side().p.y }));
  L('cave: holding □ flies Carl up', { y0, ...cv }, cv.vy < 0 && cv.y < y0 - .3);
  await p.waitForTimeout(400);
  const cap = await p.evaluate(() => __x.side().p.vy);
  L('cave: the climb is capped', cap, cap >= -11.05);
  await p.keyboard.up('c'); await p.waitForTimeout(120);
  const fade = await p.evaluate(() => __x.side().p.vy);
  await p.waitForTimeout(1400);
  const fall = await p.evaluate(() => __x.side().p.vy);
  L('cave: release fades the climb into a fall', { fade, fall }, fall > 0 && fade < 0);
  // ○ cycles crouch, walk, run; the gait is shared with the field
  await p.evaluate(() => __x.setGait('steady')); await p.waitForTimeout(200);
  const gs = [];
  for (let i = 0; i < 3; i++) { await p.keyboard.press('x'); await p.waitForTimeout(120); gs.push(await p.evaluate(() => __x.util().gait)); }
  L('○ cycles walk → run → crouch → walk', gs, gs.join() === 'sprint,stalk,steady');
  // X taps interact and do not fly or fire
  await p.keyboard.press('z'); await p.waitForTimeout(150);
  const zz = await p.evaluate(() => ({ alt: __x.P() ? (__x.P().alt || 0) : 0, bolts: __x.bolts().length }));
  L('X interacts without flying or firing', zz, zz.bolts === 0);
  L('no page errors', errs, errs.length === 0);
  console.log(out.every(Boolean) ? 'ALL PASS' : 'SOME FAIL');
  await b.close();
})();
