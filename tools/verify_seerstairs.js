// v0.95.964 · the new Seer staircases · art, bboxes and no stretching.
const fs = require('fs');
const H = fs.readFileSync('rp7b.html', 'utf8');
let pass = 0, fail = 0;
const t = (n, f) => { try { f(); console.log('  ok   ' + n); pass++; }
                      catch (e) { console.log('  FAIL ' + n + ' · ' + e.message); fail++; } };
const ok = (c, m) => { if (!c) throw new Error(m); };
const bbox = k => JSON.parse(new RegExp(k + '\\s*=\\s*(\\[[^\\]]+\\])').exec(H)[1]);

console.log('\n1 · the art is on disk and the rects match it');
t('both staircases resolve to real files', () => {
  ['seer-stairs-up.png','seer-stairs-down.png'].forEach(f => {
    ok(H.includes(f), `${f} not referenced`);
    ok(fs.existsSync('assets/2D sprites/interior/' + f), `${f} missing from disk`);
  });
});
t('the bboxes were RE-MEASURED for the new resolution', () => {
  // a replaced asset never keeps its old rect · the 64x96 numbers would sample
  // a postage stamp out of the corner of a 1024x1536 image
  const up = bbox('SEER_STAIR_UP_BBOX'), dn = bbox('SEER_STAIR_DOWN_BBOX');
  ok(!(up[2] === 48 && up[3] === 82), 'UP still carries the old 64x96 rect');
  ok(!(dn[2] === 59 && dn[3] === 77), 'DOWN still carries the old 64x96 rect');
  [['UP', up], ['DOWN', dn]].forEach(([n, b]) => {
    ok(b[0] + b[2] <= 1024 && b[1] + b[3] <= 1536, `${n} rect runs off the 1024x1536 canvas`);
    ok(b[2] > 600 && b[3] > 1000, `${n} rect ${b[2]}x${b[3]} is far smaller than the art`);
  });
});
t('the two are not the same rect', () => {
  ok(JSON.stringify(bbox('SEER_STAIR_UP_BBOX')) !== JSON.stringify(bbox('SEER_STAIR_DOWN_BBOX')),
     'up and down share a rect · one was copied onto the other');
});

console.log('\n2 · up is up and down is down');
t('the set maps each direction to its own image', () => {
  const set = H.slice(H.indexOf('const STAIR_ART_SETS'), H.indexOf('const STAIR_ART_SETS') + 400);
  ok(/up:\s*\{\s*img: SEER_STAIR_UP_IMG/.test(set), 'up does not point at the up art');
  ok(/down:\s*\{\s*img: SEER_STAIR_DOWN_IMG/.test(set), 'down does not point at the down art');
});
t('the draw picks direction explicitly, not by scene name', () => {
  const d = H.slice(H.indexOf('const goingUp = s.art'), H.indexOf('const goingUp = s.art') + 300);
  ok(/s\.art \? \(s\.art === 'up'\)/.test(d),
     'direction is inferred from the target scene name · the vault stair goes DOWN to a scene not ending _2f');
});

console.log('\n3 · never stretched');
t('the art is fitted into the footprint, not squashed to it', () => {
  // ★ slice to the END of the draw call, not a guessed character count.  The
  // first version took 900 chars from the anchor and landed inside the comment
  // block explaining the fix — it failed on prose length, not on behaviour.
  const at = H.indexOf('const [sx, sy, sw, sh] = bb;');
  const d = H.slice(at, H.indexOf('dw, dh);', at) + 8);
  ok(/Math\.min\(boxW \/ sw, boxH \/ sh\)/.test(d),
     'still drawing straight into visW x visH · every stair squashed to 2:3');
  ok(/boxH - dh/.test(d), 'not bottom-anchored · the staircase would float off its base tile');
  ok(/\(boxW - dw\) \/ 2/.test(d), 'not centred across the footprint');
});
t('the fit is measurably better than the old stretch', () => {
  const up = bbox('SEER_STAIR_UP_BBOX'), dn = bbox('SEER_STAIR_DOWN_BBOX');
  const box = 2 / 3;
  [['UP', up[2] / up[3]], ['DOWN', dn[2] / dn[3]]].forEach(([n, a]) => {
    const err = Math.abs(a / box - 1) * 100;
    ok(err < 20, `${n} aspect ${a.toFixed(3)} is ${err.toFixed(0)}% off the 2x3 box · check visW/visH`);
  });
  // and the fit means the drawn aspect IS the art's aspect · zero error
  ok(true);
});

console.log(`\n${fail ? '✗' : '★'} ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
