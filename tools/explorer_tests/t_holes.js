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
  const use = async (id) => { await p.evaluate(() => __x.devCopies()); await p.evaluate(i => __x.utilAction(i, 'equip'), id); while (await p.evaluate(() => __x.util().active) !== id) { await p.keyboard.press('q'); await p.waitForTimeout(90); } };
  // NASARUS: its terrain is fixed, so no hole opens
  const onNas = await p.evaluate(() => { const M2 = __x.M(); let n = 0; for (let y = 1; y < M2.H - 1; y++) for (let x = 1; x < M2.W - 1; x++) if (__x.holeAt(x, y)) n++; return n; });
  L('NASARUS terrain is fixed: no hole can open', onNas, onNas === 0);
  // a planet: find a rock on its edge with one walkable side
  await p.evaluate(() => __x.touchpad && 0);
  await p.evaluate(() => __x.touchdown(4)); await p.waitForTimeout(1500); await adv(6);
  const cand = await p.evaluate(() => { const M2 = __x.M(); for (let y = 1; y < M2.H - 1; y++) for (let x = 1; x < M2.W - 1; x++) { const st = __x.holeAt(x, y); if (st) return { x, y, st, world: M2.world }; } return null; });
  L('a planet edge has a rock that can open', cand, !!cand);
  if (cand) {
    const dir = cand.st.x > cand.x ? 'left' : cand.st.x < cand.x ? 'right' : cand.st.y > cand.y ? 'up' : 'down';
    await p.evaluate(s => __x.tp(s.st.x, s.st.y, s.dir), { st: cand.st, dir }); await p.waitForTimeout(200);
    await p.evaluate(() => { __x.S().weapon.repaired = true; __x.S().weapon.equipped = true; __x.S().weapon.charge = 100; });
    await use('boomfists'); await p.waitForTimeout(100);
    await p.keyboard.press('c'); await p.waitForTimeout(200);
    const made = await p.evaluate(s => { const M2 = __x.M(); return { ch: M2.grid[s.y * M2.W + s.x], lm: M2.landmarks.some(l => l.x === s.x && l.y === s.y && l.hole && l.dungeon === M2.world) }; }, cand);
    L('Boomfists break the edge open into a cave mouth', made, made.ch === 'L' && made.lm);
    // the hole is kept: it is there when the planet is built again
    const kept = await p.evaluate(s => { const M3 = __x.buildMapId(__x.M().id); return M3.landmarks.some(l => l.x === s.x && l.y === s.y && l.hole); }, cand);
    L('the hole persists when the planet is built again', kept, kept);
    // entering it opens the regular cave; leaving it puts Carl back at the regular mouth
    const regular = await p.evaluate(() => __x.regularStandOf(__x.M().world));
    await p.evaluate(s => __x.enterHole(s.x, s.y), cand); await p.waitForTimeout(500);
    const choose = await p.$('.x-dchoices button'); if (choose) await choose.click(); await p.waitForTimeout(900);
    await adv(6); await p.waitForTimeout(400);
    const inCave = await p.evaluate(() => ({ mode: __x.mode(), via: __x.side() ? __x.side().viaHole : null }));
    L('the hole opens the same cave', inCave, inCave.mode === 'side' && inCave.via === true);
    await p.keyboard.down('ArrowUp'); await p.waitForTimeout(400); await p.keyboard.up('ArrowUp'); await p.waitForTimeout(700);
    const back = await p.evaluate(() => ({ mode: __x.mode(), pos: __x.utilPos() }));
    L('leaving the cave puts Carl at the regular mouth', { regular, back }, back.mode === 'surface' && regular && back.pos.x === regular.x && back.pos.y === regular.y);
  }
  L('no page errors', errs, errs.length === 0);
  console.log(out.every(Boolean) ? 'ALL PASS' : 'SOME FAIL');
  await b.close();
})();
