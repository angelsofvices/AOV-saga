#!/usr/bin/env node
/* verify_depthcam.js · v0.95.978
 *
 *   Creator: "Add a depth camera option (motion blur) in the home panel.
 *   toggle functionality"
 *
 * ★ "toggle functionality" is the load-bearing half of that sentence, so this
 *   suite RUNS the toggle against a fake canvas rather than checking that a
 *   card exists. A switch that renders and does nothing is the exact failure
 *   worth catching, and it looks identical to a working one in a screenshot.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');

let pass = 0, fail = 0;
const ok = (m) => { pass++; console.log('  ok   · ' + m); };
const no = (m) => { fail++; console.log('  FAIL · ' + m); };
const t  = (c, m) => c ? ok(m) : no(m);

console.log('\n=== DEPTH CAMERA · motion blur toggle (v0.95.978) ===\n');

/* ── lift the effect and run it ─────────────────────────────────────────── */
function balanced(src, from){
  let i = src.indexOf('{', from), d = 0;
  for (let j = i; j < src.length; j++){
    const c = src[j];
    if (c === '{') d++; else if (c === '}'){ d--; if (!d) return src.slice(from, j + 1); }
  }
  return null;
}
const grab = (n) => { const at = HTML.indexOf(`function ${n}(`); return at < 0 ? '' : balanced(HTML, at); };

// a canvas that records what was asked of it
const draws = [];
const mkCtx = (tag) => ({
  globalAlpha: 1,
  drawImage(img){ draws.push({ tag, op: 'drawImage', alpha: this.globalAlpha, from: img && img.__tag }); },
  clearRect(){ draws.push({ tag, op: 'clearRect' }); },
});
const box = {
  console,
  canvas: { width: 960, height: 540, __tag: 'main', getContext: () => mkCtx('main') },
  player: {},
  document: { createElement: () => { const c = { width: 0, height: 0, __tag: 'buf' };
                                     c.getContext = () => mkCtx('buf'); return c; } },
  showToast(){}, playSFX(){}, saveGame(){}, paintZycellContent(){},
};
box.ctx = mkCtx('main');
box.ctx.drawImage = function(img){ draws.push({ tag:'main', op:'drawImage', alpha:this.globalAlpha, from: img && img.__tag }); };
vm.createContext(box);
vm.runInContext(`
  ${(HTML.match(/^const DEPTH_CAM_ALPHA\s*=\s*[\d.]+;/m) || [''])[0].replace(/^const/, 'var')}
  var _depthCamBuf = null;
  ${grab('depthCameraOn')} ${grab('toggleDepthCamera')} ${grab('applyDepthCamera')}
  globalThis.DEPTH_CAM_ALPHA = DEPTH_CAM_ALPHA;
`, box);

t(typeof box.applyDepthCamera === 'function', 'applyDepthCamera() lifted');
t(typeof box.toggleDepthCamera === 'function', 'toggleDepthCamera() lifted');
t(box.DEPTH_CAM_ALPHA > 0 && box.DEPTH_CAM_ALPHA < 1,
  `blend strength is a real alpha · ${box.DEPTH_CAM_ALPHA}`);

/* ── 1 · OFF is genuinely off ───────────────────────────────────────────── */
{
  draws.length = 0;
  box.player.depthCam = false;
  box.applyDepthCamera(); box.applyDepthCamera();
  t(draws.length === 0,
    '★ OFF costs nothing · not one draw call, not one buffer allocated');
  t(box.depthCameraOn() === false, '  · and reports itself off');
}

/* ── 2 · ON blends the PREVIOUS frame, not the current one ──────────────── */
{
  draws.length = 0;
  box.player.depthCam = true;
  box.applyDepthCamera();                 // frame 1 · nothing to blend yet
  const first = draws.filter(d => d.tag === 'main' && d.op === 'drawImage').length;
  t(first === 0, '★ the FIRST frame has nothing to blend and blends nothing');
  const captured = draws.some(d => d.tag === 'buf' && d.op === 'drawImage');
  t(captured, '  · but it does capture that frame for the next one');

  draws.length = 0;
  box.applyDepthCamera();                 // frame 2 · the trail appears
  const blend = draws.find(d => d.tag === 'main' && d.op === 'drawImage');
  t(!!blend, '★★ the SECOND frame lays the previous one over it — that is the blur');
  t(blend && blend.from === 'buf', '  · and it is the buffered frame, not the live canvas');
  t(blend && Math.abs(blend.alpha - box.DEPTH_CAM_ALPHA) < 1e-9,
    `  · at DEPTH_CAM_ALPHA (${box.DEPTH_CAM_ALPHA}), not fully opaque`);
  t(box.ctx.globalAlpha === 1,
    '★ and it RESTORES globalAlpha · a leaked alpha would fade the whole HUD');
}

/* ── 3 · the toggle actually toggles, and drops the buffer ──────────────── */
{
  box.player.depthCam = false;
  t(box.toggleDepthCamera() === true && box.player.depthCam === true, '★ toggle turns it ON');
  box.applyDepthCamera();                            // build a buffer
  t(box.toggleDepthCamera() === false && box.player.depthCam === false, '★ and OFF again');
  draws.length = 0;
  box.applyDepthCamera();
  t(draws.length === 0,
    '★★ turning it off DROPS THE BUFFER · not just the flag, so a stale frame '
    + 'cannot ghost back in when it is re-enabled');
}

/* ── 4 · resolution changes cannot ghost a wrong-sized frame ────────────── */
{
  box.player.depthCam = true;
  box.applyDepthCamera(); box.applyDepthCamera();    // buffer at 960x540
  box.canvas.width = 1280; box.canvas.height = 720;  // player resizes the window
  draws.length = 0;
  box.applyDepthCamera();
  const blend = draws.find(d => d.tag === 'main' && d.op === 'drawImage');
  t(!blend, '★ a resize discards the old buffer rather than stretching it');
}

/* ── 5 · wired into the paint, in the right place ───────────────────────── */
{
  const at = HTML.indexOf('drawAoeImpactBursts();');
  const blk = HTML.slice(at, at + 400);
  t(/applyDepthCamera\(\)/.test(blk), '★ called from the frame paint');
  // the HUD must stay sharp · the call has to sit before the interface draws
  const call = HTML.indexOf('applyDepthCamera();', at);
  const hud  = HTML.indexOf('drawHUD', at);
  t(hud < 0 || call < hud, '★★ and BEFORE the HUD · the world smears, the interface does not');
}

/* ── 6 · the card is a SWITCH, and says so ──────────────────────────────── */
{
  const at = HTML.indexOf('const depthCam = `');
  t(at > 0, '★ the home-panel card exists');
  const card = HTML.slice(at, at + 1400);
  t(/toggleDepthCamera\(\)/.test(card), '  · and its click calls the toggle');
  t(/ON.*OFF|OFF.*ON/s.test(card), '  · it shows its current state as ON/OFF');
  t(/_dcOn \? /.test(card), '  · read live, so the card cannot show a stale state');
  // ★ it must NOT be a _zyWidget: every one of those NAVIGATES, and a widget
  // that silently toggled would break the promise the other six make.
  t(!/_zyWidget\([^)]*depthCam/.test(HTML),
    '★★ it is deliberately NOT a _zyWidget · those all open panels, this one switches');
  t(/\$\{depthCam\}/.test(HTML), '  · and it is actually rendered into the home grid');
}

/* ── 7 · it survives a reload ───────────────────────────────────────────── */
t(/depthCam:\s*!!player\.depthCam/.test(HTML),
  '★ the preference is written to the save · a display setting you must set every boot is not a setting');

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
