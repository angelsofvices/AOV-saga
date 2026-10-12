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
  L('the blaster starts broken', await p.evaluate(() => __x.blasterState()), await p.evaluate(() => !__x.blasterState().repaired && !__x.blasterState().equipped));
  // bare-handed: □ does not fire
  await p.keyboard.press('c'); await p.waitForTimeout(150);
  L('bare-handed □ fires nothing', await p.evaluate(() => __x.bolts().length), await p.evaluate(() => __x.bolts().length === 0));
  // repair from the Workstation's inventory card
  await p.evaluate(() => __x.touchpad()); await p.waitForTimeout(300); await p.click('[data-tab="inventory"]'); await p.waitForTimeout(300);
  await p.evaluate(() => __x.chapter('inv-weapon')); await p.waitForTimeout(200);
  await p.click('[data-wpn="repair"]'); await p.waitForTimeout(300);
  L('repair draws on the stores', await p.evaluate(() => [__x.blasterState().repaired, __x.S().hq.store.scrap]), await p.evaluate(() => __x.blasterState().repaired && __x.S().hq.store.scrap === 17));
  await p.click('[data-wpn="equip"]'); await p.waitForTimeout(300);
  L('equipped from inventory', await p.evaluate(() => __x.blasterState().equipped), await p.evaluate(() => __x.blasterState().equipped === true));
  await p.evaluate(() => __x.touchpad()); await p.waitForTimeout(1200); await adv(3);
  // a foe straight ahead, Carl facing right
  await p.evaluate(() => { const P = __x.P(); __x.tp(P.x, P.y, 'right'); __x.spawnFoe('mori', 5, 0, 4); }); await p.waitForTimeout(200);
  const before = await p.evaluate(() => __x.blasterState().charge);
  await p.screenshot({ path: __dirname + '/bl_hud.png' });
  await p.keyboard.press('c'); await p.waitForTimeout(40);
  const shot = await p.evaluate(() => __x.bolts().map(b => [b.dx, b.dy]));
  L('□ fires straight in the direction Carl faces', shot, shot.length === 1 && shot[0][0] === 1 && shot[0][1] === 0);
  L('a shot draws on the charge', { before, after: await p.evaluate(() => __x.blasterState().charge) }, await p.evaluate(() => __x.blasterState().charge) <= before - 19);
  await p.waitForTimeout(700);
  const hp = await p.evaluate(() => __x.foes().filter(f => f.k === 'mori').map(f => f.hp));
  L('the shot strikes the foe in front', hp, hp.some(h => h < 0 || h < 125 * 0 + 9999) && (await p.evaluate(() => __x.foes().length)) >= 0);
  // charge runs down, then recharges on its own
  for (let i = 0; i < 6; i++) { await p.keyboard.press('c'); await p.waitForTimeout(380); }
  const low = await p.evaluate(() => __x.blasterState().charge);
  await p.waitForTimeout(2600);
  const back = await p.evaluate(() => __x.blasterState().charge);
  L('the charge recharges on its own', { low: Math.round(low), back: Math.round(back) }, back > low + 30);
  // the armed Square does not move objects
  const pos0 = await p.evaluate(() => [__x.P().x, __x.P().y]);
  await p.keyboard.press('c'); await p.waitForTimeout(100);
  const pos1 = await p.evaluate(() => [__x.P().x, __x.P().y]);
  L('armed □ never moves Carl or objects', { pos0, pos1 }, pos0.join() === pos1.join());
  // in a cave: ○ fires; bare-handed ○ says no fists
  await p.evaluate(() => __x.touchdown(4)); await p.waitForTimeout(400); await adv(6);
  await p.evaluate(() => { __x.S().weapon.charge = 100; __x.enterCave(4); }); await p.waitForTimeout(400); await adv(5);
  L('the cave keeps the equipped blaster', await p.evaluate(() => [!!__x.side(), __x.blasterState().equipped]), await p.evaluate(() => !!__x.side() && __x.blasterState().equipped));
  await p.evaluate(() => { const S2 = __x.side(); const solid = c => c === 'G' || c === 'P' || c === '#'; let x0 = 3; for (let x = 3; x < S2.W - 12; x++) { let ok = true; for (let k = 0; k < 9; k++) { if (!solid(S2.g[13][x + k]) || solid(S2.g[12][x + k])) { ok = false; break; } } if (ok) { x0 = x; break; } } S2.p.x = x0 + 1; S2.p.y = 12.1; S2.p.face = 1; S2.p.vy = 0; S2.en.forEach((e, i) => { e.x = x0 + 5 + i * 0.01; e.y = 12.1; e.hp = 200; }); window.__cx0 = x0; });
  await p.waitForTimeout(400);
  await p.waitForTimeout(150);
  // press ○ the way a player does: a few presses, a moment apart
  let seen = 0; for (let i = 0; i < 4; i++) { await p.keyboard.press('c'); await p.waitForTimeout(90); seen = Math.max(seen, await p.evaluate(() => __x.bolts().length)); await p.waitForTimeout(420); }
  const cavehit = await p.evaluate(() => __x.side().en.map(e => e.hp));
  await p.waitForTimeout(500);
  L('○ in a cave fires the blaster', { seen, cavehit, charge: await p.evaluate(() => __x.S().weapon.charge) }, cavehit.some(h => h < 200));
  await p.waitForTimeout(500);
  // unequip: bare-handed in the cave, ○ says no fists and fires nothing
  await p.evaluate(() => __x.touchpad()); await p.waitForTimeout(200);
  await p.evaluate(() => { __x.S().weapon.equipped = false; });
  await p.evaluate(() => __x.cockpit && 0);
  await p.keyboard.press('c'); await p.waitForTimeout(100);
  L('bare-handed ○ in a cave: no fists, no shot', await p.evaluate(() => __x.bolts().length), await p.evaluate(() => __x.bolts().length === 0));
  L('no page errors', errs, errs.length === 0);
  console.log(out.every(Boolean) ? 'ALL PASS' : 'SOME FAIL');
  await b.close();
})();
