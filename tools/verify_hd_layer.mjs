// ★★★ RP7B-HD · the 2DHD layer, checked by RUNNING it in a real browser.
//
//   The other verify_* suites boot the game in a DOM shim, which is the right
//   tool for "what is in the world" and the wrong one for this: the HD layer is
//   nothing BUT rendering. So this one serves the repo, opens rp7b.html?hd=1 in
//   headless Chromium (software GL is fine), and asserts on what HD reports.
//
//   It checks the conversion's contract, not its looks:
//     · the 3D view comes up on the overworld, and the 2D canvas goes transparent
//     · ground chunks, prop billboards and captured actors all exist
//     · Rizer's own draw call is the thing being captured (player actor present)
//     · Cmd+F turns it off and the classic view comes straight back
//     · fae float · interiors render in 3D with the room's own furniture
//     · HD never threw
//
//   Run:  node tools/verify_hd_layer.mjs        (from the repo root)
//   Needs Playwright + Chromium. Screenshots land in $HD_SHOTS if it is set.
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let chromium;
for (const spec of ['playwright', '/opt/node-tools/node_modules/playwright/index.mjs']){
  try { ({ chromium } = await import(spec)); break; } catch(_){}
}
if (!chromium){ console.log('⚠ Playwright not installed · skipped'); process.exit(0); }

const TYPES = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css',
  '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.json':'application/json',
  '.mp3':'audio/mpeg', '.mp4':'video/mp4', '.svg':'image/svg+xml' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT)){ res.writeHead(403); return res.end(); }
  fs.readFile(p, (err, buf) => {
    if (err){ res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
    res.end(buf);
  });
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond){ pass++; console.log('  ✅ ' + msg); } else { fail++; console.log('  ❌ ' + msg); } };
const shots = process.env.HD_SHOTS;

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
  const hdErrors = [];
  page.on('console', m => { if (/\[hd\]/.test(m.text()) && m.type() === 'error') hdErrors.push(m.text()); });
  page.on('pageerror', e => { if (/hd|three/i.test(e.stack || e.message)) hdErrors.push(e.message); });
  await page.route(u => !String(u).startsWith(base), r => r.abort());
  await page.goto(base + '/rp7b.html?hd=1', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForFunction('window.RP7B_HD && typeof game !== "undefined"', null, { timeout: 90000 });
  await page.waitForTimeout(2500);

  console.log('\n★ overworld · Malezor');
  await page.evaluate("startNewGame(); game.scene='overworld'; player.x=22; player.y=108; snapCameraToPlayer();");
  await page.waitForFunction('RP7B_HD.stats.frames >= 6', null, { timeout: 120000 });
  let st = await page.evaluate(`({ on: RP7B_HD.on, broken: !!RP7B_HD.broken, s: RP7B_HD.stats,
    gl: document.getElementById('hd3d') && document.getElementById('hd3d').style.display,
    bg: document.getElementById('game').style.background, actors: RP7B_HD._actors() })`);
  ok(st.on && !st.broken, 'HD is on and WebGL came up');
  ok(st.gl === 'block', '3D canvas is showing');
  ok(st.bg === 'transparent', '2D canvas went transparent (UI sheet over the 3D view)');
  ok(st.s.chunks > 0, `ground chunks in view (${st.s.chunks})`);
  ok(st.s.props > 0, `prop billboards in view (${st.s.props})`);
  ok(st.actors.some(a => a.startsWith('player:')), "Rizer's own draw is captured as a billboard");
  ok(st.s.sprites > 1, `actors captured (${st.s.sprites})`);
  if (shots) await page.screenshot({ path: path.join(shots, 'hd_overworld.png') });

  console.log('\n★ Cmd+F · back to classic');
  await page.keyboard.press('Meta+KeyF');
  await page.waitForTimeout(1500);
  st = await page.evaluate(`({ on: RP7B_HD.on, gl: document.getElementById('hd3d').style.display,
                               bg: document.getElementById('game').style.background })`);
  ok(!st.on, 'Cmd+F turns HD off');
  ok(st.gl === 'none' && st.bg === '', 'classic view restored (3D hidden, canvas opaque again)');
  await page.keyboard.press('Meta+KeyF');
  await page.waitForTimeout(1500);
  ok(await page.evaluate('RP7B_HD.on'), 'Cmd+F turns HD back on');
  await page.keyboard.press('Control+KeyF');
  await page.waitForTimeout(800);
  ok(!(await page.evaluate('RP7B_HD.on')), 'Ctrl+F toggles too (Windows/Linux)');
  await page.keyboard.press('Control+KeyF');
  await page.waitForTimeout(800);

  console.log('\n★ fae float');
  st = await page.evaluate(`(() => {
    const f = _fae.find(f => !f.collected && Math.abs(f.x - player.x) < 25 && Math.abs(f.y - player.y) < 25);
    return { near: !!f };
  })()`);
  if (st.near){
    await page.waitForTimeout(1500);
    ok(await page.evaluate(`RP7B_HD._fae().some(y => y > 0.5)`), 'fae float above the ground');
  } else ok(true, 'no fae near spawn · float check skipped');

  console.log('\n★ standing things · gems, an Astralstrike shot · ground art lies flat');
  await page.evaluate(`(() => {
    const now = performance.now();
    GEM_ENTITIES.push({ x: player.x - 2, y: player.y - 1, color: Object.keys(GEM_IMG)[0], scene: 'overworld', collected: false, phase: 0, born: now });
    PROJECTILES.push({ tileX: player.x - 4, tileY: player.y, dir: 'left', dist: 5, state: 'flight', t0: now - 400,
                       lastStep: now + 99999, scene: 'overworld' });
  })()`);
  await page.waitForTimeout(2500);
  const fx = await page.evaluate('RP7B_HD._fx()');
  ok(fx.length >= 2, `gems and the Astralstrike shot stand in 3D (${fx.length})`);
  ok(fx.some(y => y > 0.5), 'the Astralstrike shot flies at hand height');
  await page.evaluate("PROJECTILES.length = 0; player.ufoFlying = true;");
  await page.waitForTimeout(2500);
  st = await page.evaluate(`({ fx: RP7B_HD._fx(), ufoActor: RP7B_HD._actors().some(a => a.startsWith('ufo')) })`);
  ok(st.fx.some(y => y > 2) && !st.ufoActor, 'the UFO hull flies high, one hull only (no captured duplicate)');
  await page.evaluate("player.ufoFlying = false; PROJECTILES.length = 0; player.x = 7; player.y = 199; snapCameraToPlayer();");
  await page.waitForTimeout(3500);
  ok((await page.evaluate('RP7B_HD._flatProps()')).includes('meteor_crash_wildarm'), 'the meteor crater lies flat on the ground');

  console.log("\n★ interior · Rizer's room in 3D");
  await page.evaluate("game.scene='interior_home_2f'; player.x=10; player.y=7; snapCameraToPlayer();");
  await page.waitForTimeout(3000);
  st = await page.evaluate(`({ mode: RP7B_HD.mode, gl: document.getElementById('hd3d').style.display,
                               objs: RP7B_HD.stats.roomObjects || 0, actors: RP7B_HD._actors() })`);
  ok(st.mode === 'interior' && st.gl === 'block', 'the room renders in 3D');
  ok(st.objs >= 8, `the room's own furniture stands up in 3D (${st.objs} pieces)`);
  ok(st.actors.some(a => a.startsWith('player:')), 'Rizer is captured indoors too');
  ok(await page.evaluate('(RP7B_HD.stats.glows || 0) >= 1'), "the backpack's glow is real light (halo + point light)");

  console.log('\n★ Seer HQ · walls and the radio tower · painted light');
  await page.evaluate("game.scene='interior_seer_hq_1f'; player.x=10; player.y=8; snapCameraToPlayer();");
  await page.waitForTimeout(3000);
  ok(await page.evaluate('RP7B_HD._roomWalls() > 0'), 'Seer HQ stands its wall band up as real walls');
  await page.evaluate("game.scene='interior_radio_tower_malezor'; player.x=10; player.y=13; snapCameraToPlayer();");
  await page.waitForTimeout(3000);
  ok(await page.evaluate('(RP7B_HD.stats.roomPaint || 0) > 0'), "the radio tower's painted glows carry into 3D");
  await page.evaluate("game.scene='interior_home_2f'; player.x=10; player.y=7; snapCameraToPlayer();");
  await page.waitForTimeout(2000);
  if (shots) await page.screenshot({ path: path.join(shots, 'hd_room.png') });
  await page.keyboard.press('Meta+KeyF');
  await page.waitForTimeout(1200);
  ok(await page.evaluate(`document.getElementById('hd3d').style.display`) === 'none', 'Cmd+F indoors · classic room');
  await page.keyboard.press('Meta+KeyF');
  await page.waitForTimeout(800);

  console.log('\n★ the main RP7B · plain /rp7b.html opens in 2DHD');
  const fresh = await browser.newPage({ viewport: { width: 1280, height: 760 } });
  await fresh.route(u => !String(u).startsWith(base), r => r.abort());
  await fresh.goto(base + '/rp7b.html', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await fresh.waitForFunction('window.RP7B_HD', null, { timeout: 90000 });
  ok(await fresh.evaluate('RP7B_HD.on === true'), 'a first-time visitor to /rp7b.html gets 2DHD with no flag');
  await fresh.goto(base + '/rp7b.html?hd=0', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await fresh.waitForFunction('window.RP7B_HD', null, { timeout: 90000 });
  ok(await fresh.evaluate('RP7B_HD.on === false'), '?hd=0 still forces classic');
  await fresh.close();

  console.log('\n★ errors');
  ok(hdErrors.length === 0, 'the HD layer threw nothing' + (hdErrors.length ? ' · ' + hdErrors[0] : ''));
} finally {
  await browser.close();
  server.close();
}
console.log(`\n★ ${pass} passed · ${fail} failed`);
process.exit(fail ? 1 : 0);
