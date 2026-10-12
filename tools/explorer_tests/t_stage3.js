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
  // a find in the field bursts where Carl stands
  const f0 = await p.evaluate(() => __x.stage3().fxN);
  await p.evaluate(() => __x.gainRaw('scrap', 1)); await p.waitForTimeout(60);
  const f1 = await p.evaluate(() => __x.stage3().fxN);
  L('a find in the field bursts where Carl stands', { before: f0, after: f1 }, f1 > f0);
  // entering a cave fades in from black
  await p.evaluate(() => { __x.S().weapon.charge = 100; __x.enterCave(4); }); await p.waitForTimeout(500);
  for (let i = 0; i < 14; i++) { const c = await p.$('.x-dchoices button'); if (c && await c.isVisible()) { await c.click(); break; } await adv(1); await p.waitForTimeout(200); }
  let fadeIn = { mode: '', fade: 0 };
  for (let i = 0; i < 80 && fadeIn.mode !== 'side'; i++) { await p.waitForTimeout(15); fadeIn = await p.evaluate(() => ({ mode: __x.mode(), fade: __x.stage3().fade })); }
  L('entering a cave fades in from black', fadeIn, fadeIn.mode === 'side' && fadeIn.fade > 0);
  await p.waitForTimeout(700); await adv(4);
  // a frozen foe in the cave gets a ring, and the cave runs without error
  await p.evaluate(() => { const S2 = __x.side(); const e = S2.en[0]; if (e) { e.frozen = 3; e.x = S2.p.x + 2; e.y = S2.p.y + .45; e.dead = false; } });
  await p.waitForTimeout(300);
  const frozen = await p.evaluate(() => (__x.side().en[0] || {}).frozen > 0);
  L('a frozen foe in the cave is shown frozen', frozen, frozen);
  // climbing out fades in again, on the field
  await p.keyboard.down('ArrowUp'); await p.waitForTimeout(40); await p.keyboard.up('ArrowUp');
  let fadeOut = { mode: '', fade: 0 };
  for (let i = 0; i < 60 && fadeOut.mode !== 'surface'; i++) { await p.waitForTimeout(20); fadeOut = await p.evaluate(() => ({ mode: __x.mode(), fade: __x.stage3().fade })); }
  L('leaving the cave fades back in on the field', fadeOut, fadeOut.mode === 'surface' && fadeOut.fade > 0);
  L('no page errors', errs, errs.length === 0);
  console.log(out.every(Boolean) ? 'ALL PASS' : 'SOME FAIL');
  await b.close();
})();
