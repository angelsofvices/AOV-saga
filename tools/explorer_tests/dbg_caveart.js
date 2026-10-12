const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1000, height: 600 } }); p.setDefaultTimeout(8000);
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const U = 'http://localhost:8765/explorer/', OUT = process.argv[2];
  await p.goto(U + '?debug&newgame', { timeout: 20000 }); await p.waitForTimeout(500);
  await p.mouse.click(500, 280); await p.waitForTimeout(200); await p.click('[data-a="new"]'); await p.waitForTimeout(300);
  await p.evaluate(() => { const S = JSON.parse(JSON.stringify(__x.S())); S.hero.first = 'CARL'; S.stage = 'nav'; S.at = 'nasarus'; Object.assign(S.flags, {crashed:1, crashIntro:1, tutorialPad:1, charted:1, airRule:1}); S.hq.built = { camp: Date.now() }; localStorage.setItem('aov.explorer.v1', JSON.stringify(S)); });
  await p.goto(U + '?debug', { timeout: 20000 }); await p.waitForTimeout(500); await p.mouse.click(500, 280); await p.waitForTimeout(200); await p.click('[data-a="continue"]'); await p.waitForTimeout(800);
  for (const [no, k] of (process.argv[3] || '2:0,2:2,4:1').split(',').map(s => s.split(':').map(Number))) {
    await p.evaluate(n => __x.touchdown(n), no); await p.waitForTimeout(400);
    await p.evaluate(n => __x.enterCave(n), no); await p.waitForTimeout(300);
    for (let i = 0; i < 8; i++) { const ch = await p.$('.x-dchoices button'); if (ch) { await ch.click(); break; } const d = await p.$('.x-dialog:not([hidden])'); if (d) await d.click({ force: true }); await p.waitForTimeout(250); }
    await p.waitForTimeout(600);
    if (k) { await p.evaluate(k => __x.caveRoom(k, 'left'), k); await p.waitForTimeout(500); }
    await p.evaluate(() => { const s = __x.side(); s.p.x = Math.min(s.C.W - 8, s.p.x + (+(new URLSearchParams('').get('x')) || 0)); });
    await p.waitForTimeout(900);
    console.log(no, k, JSON.stringify(await p.evaluate(() => __x.caveState())), JSON.stringify(await p.evaluate(() => { const s = __x.side(), p = s.p; return { x:p.x, y:p.y, ground:p.ground, below:s.g[Math.floor(p.y + 1)] && s.g[Math.floor(p.y + 1)].slice(0, 4).join("") }; })));
    for (let i = 0; i < 3; i++) { console.log("t", i, JSON.stringify(await p.evaluate(() => ({ y:__x.side().p.y, mode:__x.mode(), dlg:!!document.querySelector(".x-dialog:not([hidden])"), modal:!!document.querySelector(".x-modal"), feel:__x.feel() })))); await p.waitForTimeout(300); }
    await p.screenshot({ path: OUT + '/cave_' + no + '_' + k + '.png' });
  }
  console.log('errors', JSON.stringify(errs));
  await b.close();
})().catch(e => { console.error('CRASH', e.message); process.exit(1); });
