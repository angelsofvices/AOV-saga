const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1000, height: 600 }, reducedMotion: 'reduce' }); p.setDefaultTimeout(8000);
  const errs = []; p.on('pageerror', e => errs.push(e.message)); const out = [];
  const L = (k, v, ok) => { out.push(ok); console.log('STEP', k, ok ? 'PASS' : 'FAIL', JSON.stringify(v).slice(0, 300)); };
  const U = 'http://localhost:8765/explorer/';
  const flush = async (n) => { for (let i = 0; i < (n || 14); i++) { const v = await p.$('.x-dialog:not([hidden])'); if (!v) return; await v.click({ force: true }).catch(() => {}); await p.waitForTimeout(160); } };
  const allText = async () => { let t = ''; for (let i = 0; i < 6; i++) { const d = await p.$('.x-dialog:not([hidden])'); if (!d) break; t += ' ' + await d.innerText(); const ch = await p.$('.x-dchoices button'); if (ch) break; await d.click({ force: true }); await p.waitForTimeout(160); } return t; };
  const hold = async (key, ms) => { await p.keyboard.down(key); await p.waitForTimeout(ms); await p.keyboard.up(key); await p.waitForTimeout(150); };
  await p.goto(U + '?debug&newgame', { timeout: 20000 }); await p.waitForTimeout(500);
  await p.mouse.click(500, 280); await p.waitForTimeout(200); await p.click('[data-a="new"]'); await p.waitForTimeout(300);
  await p.evaluate(() => { const S = JSON.parse(JSON.stringify(__x.S())); S.hero.first = 'CARL'; S.stage = 'nav'; S.at = 'nasarus'; Object.assign(S.flags, {crashed:1, crashIntro:1, tutorialPad:1, charted:1, airRule:1}); S.hq.built = { camp: Date.now() }; localStorage.setItem('aov.explorer.v1', JSON.stringify(S)); });
  await p.goto(U + '?debug', { timeout: 20000 }); await p.waitForTimeout(500); await p.mouse.click(500, 280); await p.waitForTimeout(200); await p.click('[data-a="continue"]'); await p.waitForTimeout(800);

  // 1 · every cave: 3-5 rooms to a peak or a valley, every room crossable both ways
  const census = await p.evaluate(() => { const r = []; for (let no = 1; no <= 27; no++) { const c = window.AOV_WORLDGEN.cave(no); r.push({ no, kind: c.kind, n: c.rooms.length, ok: c.rooms.every(x => x.verified), last: c.rooms.filter(x => x.last).length === 1 && c.rooms[c.rooms.length - 1].last, teachers: c.npcs.length }); } return r; });
  const bad = census.filter(c => c.n < 3 || c.n > 5 || !c.ok || !c.last || c.teachers || !/^(peak|valley)$/.test(c.kind));
  L('27 caves · 3-5 rooms each · peak or valley · all rooms crossable both ways', { peaks: census.filter(c => c.kind === 'peak').length, valleys: census.filter(c => c.kind === 'valley').length, rooms: census.reduce((a, c) => a + c.n, 0), bad }, bad.length === 0);

  // 2 · the mouth: the cave leads to a peak or valley; no shortcut past it
  await p.evaluate(() => __x.touchdown(2)); await p.waitForTimeout(400);
  await p.evaluate(() => __x.enterCave(2)); await p.waitForTimeout(300);
  const mouth = await allText(); const choices = await p.evaluate(() => [...document.querySelectorAll('.x-dchoices button')].map(b => b.innerText));
  L('the mouth names the peak or valley and offers only the cave', { mouth: mouth.slice(0, 160), choices }, /peak|valley/.test(mouth) && choices.length === 2 && !choices.some(c => /ZONE/.test(c)));
  await p.click('.x-dchoices button'); await p.waitForTimeout(700); await flush();
  const s0 = await p.evaluate(() => __x.caveState());
  L('in the cave, room 1, painted', s0, s0 && s0.k === 0 && s0.art);

  // 3 · walk out of the room's far opening: the next room
  await p.evaluate(() => { const s = __x.side(); s.p.x = s.C.W - 2.2; s.p.y = s.C.exit.y - .001; s.p.vy = 0; });
  await hold('ArrowRight', 700);
  const s1 = await p.evaluate(() => __x.caveState());
  L('the far opening leads into room 2', s1, s1.k === 1);
  // and back the way you came: you arrive at room 1's far side
  await p.evaluate(() => { const s = __x.side(); s.p.x = 1.2; s.p.y = s.C.start.y - .001; s.p.vy = 0; });
  await hold('ArrowLeft', 700);
  const back = await p.evaluate(() => ({ st: __x.caveState(), x: __x.side().p.x }));
  L('the near opening leads back to room 1, at its far side', back, back.st.k === 0 && back.x > back.st.W - 8);

  // 4 · the last room opens onto the PEAK or VALLEY: the Immortal Zone, with the teacher and rare Zyrex
  const n = s0.n;
  await p.evaluate(k => __x.caveRoom(k, 'left'), n - 1); await p.waitForTimeout(300);
  await p.evaluate(() => { const s = __x.side(); s.p.x = s.C.W - 2.2; s.p.y = s.C.exit.y - .001; s.p.vy = 0; });
  await hold('ArrowRight', 900); await p.waitForTimeout(600);
  const zone = await p.evaluate(() => { const m = __x.M(); return { mode: __x.mode(), id: m && m.id, kind: m && m.zoneKind, teacher: (__x.npcs() || []).filter(n => n.teacher).map(n => n.key), spawns: (m.spawns || []).map(s => s.id), target: __x.teachTarget() && __x.teachTarget().key }; });
  L('the last room opens onto the zone (peak or valley)', zone, zone.mode === 'surface' && zone.id === 'iz2' && zone.kind === census[1].kind);
  L('the teacher waits there, marked on the minimap', zone, zone.teacher.length === 1 && zone.teacher[0] === 'w2' && zone.target === 'w2');
  L('rare Zyrex roam there', zone.spawns, zone.spawns.some(id => /^zyrex-/.test(id)));

  // 5 · the teacher teaches (two of the world's creatures in the AstraNav first)
  await p.evaluate(() => { const ids = Object.keys(window.AOV_FAUNA.species).filter(id => { const s = window.AOV_FAUNA.species[id]; return s.world === 2 && !s.retired && !s.hidden && !/^zyrex-/.test(id); }).slice(0, 2); ids.forEach(id => __x.give(id, 5)); });
  await p.waitForTimeout(300); await flush();
  await p.evaluate(() => { const t = __x.npcs().filter(n => n.teacher)[0]; __x.tp(t.x, t.y + 1, 'up'); }); await p.waitForTimeout(250);
  await p.evaluate(() => __x.btnA()); await p.waitForTimeout(400);
  for (let i = 0; i < 24; i++) {
    const r = await p.$('.x-reclass .x-btn:not([hidden])'); if (r) { await r.click({ force: true }); await p.waitForTimeout(300); }
    const d = await p.$('.x-dialog:not([hidden])'); if (d) await d.click({ force: true }).catch(() => {});
    await p.waitForTimeout(250);
    if (await p.evaluate(() => !!__x.S().lore.w2)) break;
  }
  await p.waitForTimeout(800); await flush(); await p.waitForTimeout(400);
  for (let i = 0; i < 4; i++) { const rv = await p.$('.x-reveal button, .x-reveal'); if (!rv) break; await rv.click({ force: true }).catch(() => {}); await p.waitForTimeout(400); await flush(); }
  const left = await p.evaluate(() => document.querySelectorAll('.x-modal').length); if (left) await p.evaluate(() => document.querySelectorAll('.x-modal,.x-reveal').forEach(m => m.remove()));
  const taught = await p.evaluate(() => ({ lore: !!__x.S().lore.w2, map: __x.M() && __x.M().id, target: __x.teachTarget() }));
  L('the planet is registered at the peak/valley; the cue clears', taught, taught.lore && taught.map === 'iz2' && !taught.target);

  // 6 · the way home is back through the cave: the zone's exit drops you in the last room
  await p.evaluate(() => { const lm = __x.M().landmarks.filter(l => l.dungeonExit)[0]; __x.tp(lm.x + 1, lm.y, 'left'); }); await p.waitForTimeout(250);
  console.log("DBG", JSON.stringify(await p.evaluate(() => { const m = __x.M(), lm = m.landmarks.filter(l => l.dungeonExit)[0], P = __x.P(); return { lm: { x: lm.x, y: lm.y }, P: { x: P.x, y: P.y, dir: P.dir }, below: m.grid[(lm.y + 1) * m.W + lm.x], at: m.grid[lm.y * m.W + lm.x] }; })));
  await p.evaluate(() => __x.btnA()); await p.waitForTimeout(800);
  console.log("DLG", (await allText()).slice(0, 200), JSON.stringify(await p.evaluate(() => ({ screen: (document.querySelector('.x-screen') || {}).className, overlays: [...document.querySelectorAll('#ui > *')].map(e => e.className), btns: [...document.querySelectorAll('button:not([hidden])')].slice(0, 8).map(b => b.innerText.slice(0, 20)) }))));
  await flush();
  const home = await p.evaluate(() => ({ mode: __x.mode(), st: __x.caveState(), x: __x.side() && __x.side().p.x }));
  L('the zone exit leads back into the last cave room, at its far side', home, home.mode === 'side' && home.st.k === n - 1 && home.x > home.st.W - 4);
  // through the rooms to the mouth: out onto the overworld, at the mouth
  await p.evaluate(() => __x.caveRoom(0, 'right')); await p.waitForTimeout(300);
  await p.evaluate(() => { const s = __x.side(); s.p.x = 1.2; s.p.y = s.C.start.y - .001; s.p.vy = 0; });
  await hold('ArrowLeft', 800); await p.waitForTimeout(700); await flush();
  const out2 = await p.evaluate(() => { const m = __x.M(), P = __x.P(), lm = m.landmarks.filter(l => l.id === 'dcave_2')[0]; return { mode: __x.mode(), id: m.id, d: lm ? Math.abs(P.x - lm.x) + Math.abs(P.y - lm.y) : -1 }; });
  L('room 1’s near opening is the mouth: back on the overworld beside it', out2, out2.mode === 'surface' && out2.id === 'w2' && out2.d >= 0 && out2.d <= 3);

  L('no page errors', errs, errs.length === 0);
  console.log(out.every(Boolean) ? 'ALL PASS' : 'SOME FAIL', out.filter(Boolean).length + '/' + out.length);
  await b.close();
})().catch(e => { console.error('CRASH', e.message); process.exit(1); });
