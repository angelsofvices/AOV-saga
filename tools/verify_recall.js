// v0.95.955 · hold Circle in Contacts = dial everyone home.
// The behaviour tests RUN the extracted functions against fake NPCs rather
// than asserting the source is spelled a certain way.
const fs = require('fs');
const H = fs.readFileSync('rp7b.html', 'utf8');
let pass = 0, fail = 0;
const t = (n, f) => { try { f(); console.log('  ok   ' + n); pass++; }
                      catch (e) { console.log('  FAIL ' + n + ' · ' + e.message); fail++; } };
const ok = (c, m) => { if (!c) throw new Error(m); };

// ── build a sandbox holding the recall + walkNpcHome ──────────────────────
function sandbox(NPCS){
  const src =
    H.slice(H.indexOf('function walkNpcHome'), H.indexOf('function uncompanionize'))
    + '\nreturn { recallAllContactsHome, recalledContacts, walkNpcHome, HOLD: CONTACT_RECALL_HOLD_MS };';
  const toasts = [];
  const fn = new Function('NPCS', 'playSFX', 'showToast', 'saveGame', 'performance', src);
  const api = fn(NPCS, () => {}, (m) => toasts.push(m), () => {}, { now: () => 1000 });
  api.toasts = toasts;
  return api;
}
const mk = (o) => Object.assign({ id: 'x', name: 'X', tileX: 5, tileY: 5, scene: 'overworld',
                                  mode: 'follow', _phoneSpawned: true }, o);

console.log('\n1 · they WALK, they do not teleport');
t('every recalled contact ends in walkHome with a target', () => {
  const a = mk({ id: 'a', name: 'Yara', _phoneHomeX: 40, _phoneHomeY: 90, _phoneHomeScene: 'interior_home', _phoneHomeMode: 'wander' });
  const b = mk({ id: 'b', name: 'Elarion', tileX: 9, tileY: 9, _phoneHomeX: 12, _phoneHomeY: 20, _phoneHomeMode: 'stationary' });
  const api = sandbox([a, b]);
  ok(api.recallAllContactsHome() === 2, 'did not recall both');
  [a, b].forEach(n => {
    ok(n.mode === 'walkHome', `${n.name} is "${n.mode}" · a teleport, not a walk`);
    ok(n._walkHomeTarget, `${n.name} has no destination`);
  });
  // ★ the position must NOT have jumped — that is the whole difference
  ok(a.tileX === 5 && a.tileY === 5, `Yara teleported to ${a.tileX},${a.tileY} instead of setting off`);
  ok(a._walkHomeTarget.x === 40 && a._walkHomeTarget.y === 90 && a._walkHomeTarget.scene === 'interior_home',
     'the saved call-origin was not used as the destination');
});
t('nobody stays flagged as out, or keeps following', () => {
  const a = mk({ id: 'a', _phoneHomeX: 1, _phoneHomeY: 1 });
  const api = sandbox([a]);
  api.recallAllContactsHome();
  ok(a._phoneSpawned === false, 'still flagged WITH YOU · the row would offer SEND HOME forever');
  ok(a.mode !== 'follow', 'still following');
  ok(api.recalledContacts().length === 0, 'recalledContacts still counts them');
});
t('what they were doing is restored on ARRIVAL, not on departure', () => {
  const a = mk({ id: 'a', mode: 'follow', _phoneHomeMode: 'wander', _phoneHomeX: 1, _phoneHomeY: 1 });
  const api = sandbox([a]);
  api.recallAllContactsHome();
  ok(a._walkHomeMode === 'wander', 'the original mode was dropped');
  ok(a.mode === 'walkHome', 'mode was restored immediately · they would stop walking home');
});
t('a contact with no home coordinate is released, not stranded', () => {
  const a = mk({ id: 'a', name: 'Nomad', mode: 'follow', homeX: null, homeY: null, _phoneHomeMode: 'stationary' });
  const api = sandbox([a]);
  ok(api.recallAllContactsHome() === 1, 'not counted');
  ok(a.mode !== 'follow' && a.mode !== 'walkHome', `left as "${a.mode}" with nowhere to go`);
});
t('an empty recall is a no-op', () => {
  const api = sandbox([mk({ _phoneSpawned: false })]);
  ok(api.recallAllContactsHome() === 0, 'recalled somebody who was not out');
});

console.log('\n2 · hold vs tap');
t('Circle arms a timer instead of closing, on the contacts page only', () => {
  const h = H.slice(H.indexOf('function handleZycellKey'), H.indexOf('function handleZycellKey') + 3000);
  ok(/zycellPage === 'contacts'/.test(h), 'the hold is not scoped to the contacts page');
  ok(/game\._zyRecallArmed/.test(h) && /setTimeout/.test(h), 'no hold timer');
  ok(/if \(!game\._zyRecallArmed\)/.test(h),
     'unguarded against key-repeat · a held key would restart the timer forever and never fire');
  // ★ scope the ordering check to the HANDLER.  Searching the whole file finds
  // the first "contacts" string anywhere in it, which is a page-name literal
  // hundreds of lines earlier -- the test failed on its own sloppiness, not on
  // the code, and would have gone on failing whatever order the branches were in.
  ok(h.indexOf("zycellPage === 'contacts'") < h.indexOf("if (k === 'b' || k === 'escape'){"),
     'the hold branch sits BELOW the plain close · Circle would shut the phone first');
});
t('release closes only when the hold did NOT fire', () => {
  const u = H.slice(H.indexOf("if (k === '2') return;   // touchpad keyup"), H.indexOf("if (k === '2') return;   // touchpad keyup") + 1200);
  ok(/clearTimeout\(game\._zyRecallTimer\)/.test(u), 'the timer is never cancelled · a tap would still recall');
  ok(/if \(!fired\)/.test(u), 'back fires even after the recall · it would send everyone home AND close');
  ok(/closeZphonePanel\(\)/.test(u), 'a tap no longer closes the phone');
});
t('the hold is long enough to be deliberate', () => {
  const m = /const CONTACT_RECALL_HOLD_MS = (\d+);/.exec(H);
  ok(m, 'no named constant · the threshold would be a literal in two places');
  const ms = Number(m[1]);
  ok(ms >= 300 && ms <= 1200, `${ms}ms is not a hold a player can distinguish from a tap`);
});

console.log('\n3 · you can find it without being told');
t('a button and a hint appear, and only when someone is out', () => {
  const at = H.indexOf('const recallBar');
  ok(at > 0, 'no affordance · the gesture would be undiscoverable and mouse-only users locked out');
  const bar = H.slice(at, at + 1400);
  ok(/canCall && _out/.test(bar), 'shown even when nobody is out');
  ok(/recallAllContactsHome\(\)/.test(bar), 'the button does not call the recall');
  ok(/hold ◯/.test(bar), 'the hold gesture is never named to the player');
  ok(H.includes('recallBar + rows'), 'the bar is built but never rendered');
});

console.log(`\n${fail ? '✗' : '★'} ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
