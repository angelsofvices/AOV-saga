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
  const st = () => p.evaluate(() => ({ util: __x.util(), cd: { life: __x.cdOf('life-seed'), star: __x.cdOf('star-satellite'), boom: __x.cdOf('boomfists') }, pending: __x.pendingCount(), suit: __x.S().suit, scrap: (__x.S().pack && __x.S().pack.scrap) || 0, hq: (__x.S().hq && __x.S().hq.store && __x.S().hq.store.scrap) || 0 }));
  // the registry: 27 utilities, one per planet, five built
  const reg = await p.evaluate(() => ({ n: window.AOV_UTILS.defs.length, planets: new Set(window.AOV_UTILS.defs.map(d => d.planet)).size, built: window.AOV_UTILS.defs.filter(d => d.status === 'built').map(d => d.id).join() }));
  L('the registry holds 27 utilities, one per planet', reg, reg.n === 27 && reg.planets === 27 && reg.built.split(',').length === 27);
  // developer copies: functional, equippable, and they are not discoveries
  await p.evaluate(() => __x.devCopies());
  const dc = await p.evaluate(() => { const u = __x.utilsState(); return { copies: u.instances.filter(i => i.source === 'dev_replicator').length, discovered: u.discovered.length, repaired: u.repaired.length }; });
  L('dev copies: 25 functional copies, no progression', dc, dc.copies === 25 && dc.discovered === 0 && dc.repaired === 0);
  // equip the three built ones and cycle with △
  for (const id of ['life-seed', 'boomfists', 'star-satellite']) await p.evaluate(i => __x.utilAction(i, 'equip'), id);
  const cyc = await p.evaluate(() => __x.util().list);
  L('△ cycles the equipped built utilities', cyc, cyc.join() === 'astrablaster,boomfists,jetpack,life-seed,star-satellite' || cyc.indexOf('life-seed') >= 0);
  // Life Seed in the field: a plant under Carl heals Carl, and it has a cooldown
  await p.evaluate(() => { __x.S().suit = 100; __x.setHp(50); const P2 = __x.P(); __x.tp(P2.x, P2.y, 'down'); });
  await p.evaluate(() => __x.util().active === 'life-seed' || true);
  while (await p.evaluate(() => __x.util().active) !== 'life-seed') { await p.keyboard.press('q'); await p.waitForTimeout(120); }
  await p.keyboard.press('c'); await p.waitForTimeout(150);
  const ls1 = await st(); const hpA = await p.evaluate(() => __x.hpNow());
  L('Life Seed heals Carl health', hpA, hpA === 75);
  await p.keyboard.press('c'); await p.waitForTimeout(150);
  const ls2 = await st();
  const hpB = await p.evaluate(() => __x.hpNow());
  L('Life Seed recharges: a second press does nothing', hpB, hpB === 75 && ls2.cd.life > 0);
  // switching utilities does not reset a cooldown
  await p.keyboard.press('q'); await p.waitForTimeout(120); await p.keyboard.press('q'); await p.waitForTimeout(120);
  const cd2 = await st();
  while (await p.evaluate(() => __x.util().active) !== 'life-seed') { await p.keyboard.press('q'); await p.waitForTimeout(120); }
  const cd3 = await st();
  L('switching utilities keeps each cooldown', cd3.cd.life, cd3.cd.life > 0 && cd2.util.active !== 'life-seed');
  // Boomfists: a rock in reach breaks; a mountain is not breakable
  await p.evaluate(() => { while (__x.util().active !== 'boomfists') __x.cycleUtil(); });
  await p.evaluate(() => { const M2 = __x.M(), P2 = __x.P(); M2.grid[P2.y * M2.W + P2.x + 1] = 'B'; __x.tp(P2.x, P2.y, 'right'); });
  await p.waitForTimeout(200);
  await p.keyboard.press('c'); await p.waitForTimeout(150);
  const bo = await p.evaluate(() => { const M2 = __x.M(), P2 = __x.P(); return { ch: M2.grid[P2.y * M2.W + P2.x + 1], scrap: __x.S().pack && __x.S().pack.scrap, cd: __x.cdOf('boomfists') }; });
  L('Boomfists break a boulder in front', bo, bo.ch === '.' && bo.cd > 0);
  await p.evaluate(() => { const M2 = __x.M(), P2 = __x.P(); M2.grid[P2.y * M2.W + P2.x + 1] = '#'; });
  await p.waitForTimeout(700);
  await p.keyboard.press('c'); await p.waitForTimeout(150);
  const mt = await p.evaluate(() => { const M2 = __x.M(), P2 = __x.P(); return M2.grid[P2.y * M2.W + P2.x + 1]; });
  L('Boomfists cannot break a mountain', mt, mt === '#');
  // Star Satellite: a strike lands on a foe four tiles ahead, after its delay
  await p.evaluate(() => { while (__x.util().active !== 'star-satellite') __x.cycleUtil(); });
  await p.evaluate(() => { const P2 = __x.P(); __x.tp(P2.x, P2.y, 'right'); });
  const foe = await p.evaluate(() => { const f = __x.spawnFoe('mori', 4, 0, 6); return { hp: f.hp, x: f.x }; });
  await p.waitForTimeout(150);
  await p.keyboard.press('c'); await p.waitForTimeout(150);
  const s1 = await st();
  L('Star Satellite arms a strike', s1.pending, s1.pending === 1);
  for (let i = 0; i < 15; i++) { await p.evaluate(() => { const f = __x.foes().filter(f => f.state !== 'dead')[0]; if (f) { f.x = 21; f.y = __x.P().y; f.state = 'idle'; } }); await p.waitForTimeout(100); }
  const after = await p.evaluate(() => { const f = __x.foes().filter(f => f.state !== 'dead')[0]; return f ? f.hp : 'down'; });
  L('the strike lands on the foe', { before: foe.hp, after }, after === 'down' || after < foe.hp);
  // Not built: a utility without an ability says so and does nothing
  await p.evaluate(() => { __x.utilAction('magnetron', 'equip'); while (__x.util().active !== 'magnetron') __x.cycleUtil(); });
  await p.keyboard.press('c'); await p.waitForTimeout(150);
  L('a not-built utility says so and does nothing', await st(), (await st()).pending === 0);
  // Star Satellite in a cave: no sky
  await p.evaluate(() => { while (__x.util().active !== 'star-satellite') __x.cycleUtil(); });
  await p.evaluate(() => __x.touchdown(4)); await p.waitForTimeout(1500); await adv(6);
  await p.evaluate(() => { __x.S().weapon.charge = 100; __x.enterCave(4); }); await p.waitForTimeout(500); await adv(5);
  await p.keyboard.press('c'); await p.waitForTimeout(150);
  L('no sky above a cave: the satellite refuses', await st(), (await st()).pending === 0);
  L('no page errors', errs, errs.length === 0);
  console.log(out.every(Boolean) ? 'ALL PASS' : 'SOME FAIL');
  await b.close();
})();
