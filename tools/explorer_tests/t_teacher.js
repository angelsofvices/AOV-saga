const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1000, height: 600 }, reducedMotion: 'reduce' }); p.setDefaultTimeout(8000);
  const errs = []; p.on('pageerror', e => errs.push(e.message)); const out = [];
  const L = (k, v, ok) => { out.push(ok); console.log('STEP', k, ok ? 'PASS' : 'FAIL', JSON.stringify(v).slice(0, 300)); };
  const U = 'http://localhost:8765/explorer/';
  const gold = () => p.evaluate(() => { const c = document.querySelector('.x-minimap'); if (!c) return -1; const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 240 && d[i + 1] > 195 && d[i + 1] < 235 && d[i + 2] > 50 && d[i + 2] < 100) n++; return n; });
  const flush = async () => { for (let i = 0; i < 14; i++) { const v = await p.$('.x-dialog:not([hidden])'); if (!v) return; await v.click({ force: true }).catch(() => {}); await p.waitForTimeout(160); } };
  await p.goto(U + '?debug&newgame', { timeout: 20000 }); await p.waitForTimeout(500);
  await p.mouse.click(500, 280); await p.waitForTimeout(200); await p.click('[data-a="new"]'); await p.waitForTimeout(300);
  await p.evaluate(() => { const S = JSON.parse(JSON.stringify(__x.S())); S.hero.first = 'CARL'; S.stage = 'nav'; S.at = 'nasarus'; Object.assign(S.flags, {crashed:1, crashIntro:1, tutorialPad:1, charted:1, airRule:1}); S.hq.built = { camp: Date.now() }; localStorage.setItem('aov.explorer.v1', JSON.stringify(S)); });
  await p.goto(U + '?debug', { timeout: 20000 }); await p.waitForTimeout(500); await p.mouse.click(500, 280); await p.waitForTimeout(200); await p.click('[data-a="continue"]'); await p.waitForTimeout(800);
  // 1 · the teacher of every people world waits at its peak or valley; no teacher stands in a cave
  const census = await p.evaluate(() => { const F = window.AOV_FAUNA.peoples, G = window.AOV_WORLDGEN, rows = []; for (let no = 1; no <= 27; no++) { const want = !!(F[no] && F[no].race) && no !== 9, z = G.build('iz' + no), t = (z.npcs || []).filter(n => n.teacher); rows.push([no, want, t.length, t.every(n => n.key === 'w' + no), G.cave(no).npcs.length]); } return rows; });
  const bad = census.filter(r => r[1] !== (r[2] === 1) || !r[3] || r[4]);
  L('one teacher per people world, at its peak or valley', { people: census.filter(r => r[1]).length, bad: bad.map(r => r[0]) }, bad.length === 0);
  // 2 · the overworld minimap points at the cave mouth while the words are unlearned
  await p.evaluate(() => __x.touchdown(2)); await p.waitForTimeout(400);
  const tgt = await p.evaluate(() => { const t = __x.teachTarget(); return t && t.id; });
  L('overworld cue targets the cave mouth', tgt, tgt === 'dcave_2');
  await p.waitForTimeout(260); const g0 = await gold();
  L('the cue is drawn on the minimap', g0, g0 > 0);
  // 3 · camp folk point the way, and do not teach
  const camp = await p.evaluate(() => { const n = __x.npcs().filter(n => n.key === 'w2' && !n.teacher)[0]; if (n) __x.tp(n.x, n.y + 1, 'up'); return !!n; });
  await p.waitForTimeout(200); await p.evaluate(() => __x.btnA()); await p.waitForTimeout(300);
  let txt = ''; for (let i = 0; i < 4; i++) { const d = await p.$('.x-dialog:not([hidden])'); if (!d) break; txt += ' ' + await d.innerText(); await d.click({ force: true }); await p.waitForTimeout(160); }
  L('camp folk point past the cave, to the peak or valley', txt.slice(0, 200), camp && /peak or valley/.test(txt) && !(await p.evaluate(() => !!__x.S().lore.w2)));
  await flush();
  // 4 · once learned, the cue clears
  await p.evaluate(() => { __x.S().lore.w2 = Date.now(); }); await p.waitForTimeout(400);
  const after = await p.evaluate(() => __x.teachTarget()); const g1 = await gold();
  L('cue cleared once the words are learned', { after, g1 }, !after && g1 === 0);
  L('no page errors', errs, errs.length === 0);
  console.log(out.every(Boolean) ? 'ALL PASS' : 'SOME FAIL', out.filter(Boolean).length + '/' + out.length);
  await b.close();
})().catch(e => { console.error('CRASH', e.message); process.exit(1); });
