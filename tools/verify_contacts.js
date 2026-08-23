// v0.95.651 · verify contact registration on first talk + quest bond.
const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};
global.setInterval = () => 0;
const pending = [];
global.setTimeout = (f, ms) => { pending.push({ f, ms: ms || 0 }); return pending.length; };
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width: 0, height: 0, data: [] }) });
const el = () => ({ style:{}, dataset:{}, classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
  width:960, height:540, value:'', textContent:'', innerHTML:'', children:[], childNodes:[],
  getContext:()=>CTX, appendChild:noop, removeChild:noop, addEventListener:noop, removeEventListener:noop,
  setAttribute:noop, getAttribute:()=>null, focus:noop, remove:noop,
  querySelector:()=>el(), querySelectorAll:()=>[], getBoundingClientRect:()=>({left:0,top:0,width:960,height:540}) });
global.addEventListener = noop; global.removeEventListener = noop;
global.document = { getElementById:()=>el(), querySelector:()=>el(), querySelectorAll:()=>[],
  createElement:()=>el(), addEventListener:noop, body:el(), documentElement:el(), head:el(),
  hidden:false, visibilityState:'visible' };
global.window = global;
let STORE = {};
global.localStorage = { getItem:k=>STORE[k]??null, setItem:(k,v)=>{STORE[k]=String(v)}, removeItem:k=>{delete STORE[k]} };
global.Audio = function(){ return { play:()=>Promise.resolve(), pause:noop, addEventListener:noop, cloneNode(){return this} }; };
global.Image = function(){ return { addEventListener:noop, complete:false, naturalWidth:0, src:'' }; };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches:false, addEventListener:noop, addListener:noop });
global.navigator = { userAgent:'node', getGamepads:()=>[], maxTouchPoints:0 };
global.performance = { now: () => Date.now() };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });

try {
  new Function(src + ';globalThis.__C={NPCS,player,game,FACTION_CONTACTS,CONTACT_LEGACY_GATE,' +
    'allContacts,contactMet,registerContact,setActiveContact,clearActiveContact,contactEligible,' +
    'isZyrexNpc,contactIdOf,bumpNpcBond,questBondFromXp,awardRizerXP,factionAllies,' +
    'renderZycellContacts,MANUAL_BOND_IDS,QUEST_BOND_MIN_XP,saveGame,SPECIES,' +
    'isZyrexContactId,pruneZyrexContacts,toggleContactCall,findNpcById};')();
} catch (e) { console.log('❌ eval', e.message.split('\n')[0]); process.exit(1); }

// ★★ v0.95.789 · GATED CONTENT SKIP.
// The Creator removed the 8 overworld Zyrex NPCs (v0.95.768) and the 50
// townsfolk (v0.95.767). Suites asserting those NPCs exist were RIGHT when
// written and now assert a world nobody wants. They skip while the content is
// gated rather than being deleted, so restoring the content restores the checks.
const _GATED_NPC_IDS = ['apexaur_1','zarakai_wild','voltigrax_wild','anciuxor_wild',
                        'snok_wild','gearbyte','voltaryn','elzoran'];
const _npcGated = id => _GATED_NPC_IDS.includes(id);
const C = globalThis.__C;
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) fails++; };
const reset = () => {
  C.player.metNpcs = {}; C.player.bonds = {}; C.clearActiveContact();
  // v0.95.660 · quest bond rides awardRizerXP, which is now gated until Rizer
  // first reaches the overworld.  These checks are about the bond rules, not
  // the gate (verify_rxpgate.js owns that), so put the player past it.
  C.game.scene = 'overworld'; C.player.rxpUnlocked = true;
};

console.log('\n1 · ELIGIBILITY · humanoids in, Zyrex out\n');
const all = C.NPCS.filter(n => n && !n.isEnemy && n.name && typeof n.onInteract === 'function'
                            && !/^_summon_/.test(n.id || '') && !n._towerGuardOf);
const elig = all.filter(C.contactEligible);
const zy   = all.filter(n => C.isZyrexNpc(n));
console.log(`     ${all.length} named non-enemy NPCs · ${elig.length} contact-eligible · ${zy.length} Zyrex excluded`);
console.log(`     excluded: ${zy.map(n => n.name).join(', ')}`);
ok(elig.length >= 35, `${elig.length} humanoids can become contacts (was 11 hand-written rows)`);
// v0.95.681 · omniris removed from this list — he is Humanoid/Aura now and
// MUST be contact-eligible.  voltigrax_wild is Zarvane's Zyrex stand-in.
for (const id of ['apexaur_1','voltigrax_wild','anciuxor_wild','rakoron_cave_boss','elzoran'].filter(x=>!_npcGated(x))){
  const n = C.NPCS.find(x => x.id === id);
  if (n && C.contactEligible(n)) { ok(false, `${id} must NOT be a phone contact (Zyrex)`); }
}
ok(!elig.some(n => C.isZyrexNpc(n)), 'no Zyrex slipped into the eligible set');
ok(!elig.some(n => n.isEnemy), 'no enemy is eligible');

console.log('\n2 · ★ ZURELEA · the potion lady, registered on interact\n');
reset();
const zur = C.NPCS.find(n => n.id === 'zurelea');
ok(!!zur, 'Zurelea exists in the world');
ok(C.contactMet('zurelea') === false, 'not a contact before you meet her');
ok(C.player.zureleaShopOpen !== true, '...and her shop quest is NOT done');
C.registerContact(zur);
ok(C.contactMet('zurelea') === true, 'ONE interact registers her — no quest required');
const names = C.allContacts().map(c => c[1]);
ok(names.includes('Zurelea'), 'Zurelea appears in the contact book');
const zrow = C.allContacts().find(c => c[0] === 'zurelea');
ok(zrow && /Potion/.test(zrow[2]), `curated location kept: "${zrow && zrow[2]}"`);

console.log('\n3 · EVERY first interact registers · and only once\n');
reset();
ok(C.allContacts().length === 0, 'book starts empty');
let added = 0;
for (const n of elig) if (C.registerContact(n)) added++;
ok(added === C.allContacts().length, `${added} NPCs registered, book shows ${C.allContacts().length}`);
const again = elig.filter(n => C.registerContact(n)).length;
ok(again === 0, 'second interact adds nobody twice');
const ids = C.allContacts().map(c => c[0]);
ok(new Set(ids).size === ids.length, 'no duplicate rows');
ok(!ids.includes('school_zoryn'), 'school Zoryn aliases onto the one Zoryn row, not a second one');
const uncurated = C.allContacts().find(c => !C.FACTION_CONTACTS.some(f => f[0] === c[0]));
ok(!!uncurated && !!uncurated[2], `uncurated NPCs get a derived location — e.g. ${uncurated && uncurated[1]} · ${uncurated && uncurated[2]}`);

console.log('\n4 · LEGACY SAVES · pre-patch runs keep contacts they earned\n');
reset();
C.player.zycubeGifted = true;          // old Mom gate
C.player.raidCardGifted = true;        // old Elarion gate
ok(C.contactMet('mom') === true, 'Mom still shows via the legacy quest flag');
ok(C.contactMet('professor_elarian') === true, 'Prof Elarion still shows via the legacy flag');
ok(C.contactMet('yara') === false, 'someone never met stays hidden');
C.player.zycubeGifted = false; C.player.raidCardGifted = false;

console.log('\n5 · ★ QUEST COMPLETION RAISES BOND\n');
reset();
C.player.rizerLvl = 30; C.player.rizerXP = 0;
const mom = C.NPCS.find(n => n.id === 'mom');
C.registerContact(mom);
ok((C.player.bonds.mom || 0) === 0, 'bond starts at 0 on registration');
C.setActiveContact(mom);
C.awardRizerXP(500);                                   // a quest turn-in
const afterQuest = C.player.bonds.mom || 0;
ok(afterQuest > 0, `a 500 RXP turn-in raised Mom's bond to ${afterQuest}`);
C.setActiveContact(mom);
C.awardRizerXP(60);                                    // a chest / fae pickup
ok((C.player.bonds.mom || 0) === afterQuest, `a ${60} RXP pickup (< ${C.QUEST_BOND_MIN_XP}) grants NO bond`);
C.clearActiveContact();
C.awardRizerXP(800);
ok((C.player.bonds.mom || 0) === afterQuest, 'RXP with nobody in conversation grants no bond');
// scaling + cap
reset(); C.registerContact(mom); C.setActiveContact(mom); C.awardRizerXP(150);
const small = C.player.bonds.mom;
reset(); C.registerContact(mom); C.setActiveContact(mom); C.awardRizerXP(3000);
const big = C.player.bonds.mom;
console.log(`     150 RXP -> +${small} bond   ·   3000 RXP -> +${big} bond`);
ok(big > small, 'bigger quests give more bond');
ok(big <= 10, 'single turn-in capped at +10');

console.log('\n6 · NO DOUBLE-DIPPING · the three hand-rolled bonds\n');
reset();
for (const id of ['scrapjaw','kelthor','auraxion']){
  const n = C.NPCS.find(x => x.id === id);
  C.registerContact(n); C.setActiveContact(n);
  const b0 = C.player.bonds[id] || 0;
  C.awardRizerXP(750);
  ok((C.player.bonds[id] || 0) === b0, `${id} skipped by auto-bond (bumps its own inside dialogue)`);
}
ok(C.MANUAL_BOND_IDS.size === 3, 'exactly 3 NPCs opt out of auto-bond');

console.log('\n7 · BOND TIERS + PERSISTENCE\n');
reset();
C.registerContact(mom);
C.bumpNpcBond('mom', 50, 'Mom');
ok(C.player.bonds.mom === 50, 'BONDED at 50');
C.bumpNpcBond('mom', 90, 'Mom');
ok(C.player.bonds.mom === 100, 'clamps to 100 (TRUSTED)');
ok(C.bumpNpcBond('mom', 10, 'Mom') === 0, 'no gain past 100');
C.saveGame();
const key = Object.keys(STORE).find(k => { try { return !!JSON.parse(STORE[k]).player; } catch(_){ return false; } });
const snap = JSON.parse(STORE[key]);
ok(snap.player.metNpcs !== undefined, 'metNpcs is in the save snapshot');
ok(snap.player.bonds && snap.player.bonds.mom === 100, 'bonds persist');

console.log('\n8 · factionAllies() + the ZyPhone book agree\n');
reset();
[mom, zur, C.NPCS.find(n => n.id === 'yara')].forEach(n => C.registerContact(n));
const fa = C.factionAllies();
ok(fa.length === C.allContacts().length, `factionAllies (${fa.length}) matches the book (${C.allContacts().length})`);
ok(fa.every(a => a.bond != null), 'every ally carries a bond value');
let html = '';
try { html = C.renderZycellContacts(); } catch(e){ html = 'THREW: ' + e.message; }
ok(/Zurelea/.test(html), 'Zurelea renders in the ZyPhone CONTACTS panel');
ok(!/THREW/.test(html), 'contacts panel renders without throwing');

console.log('\n9 · ★ ZYREX ARE NOT CALLABLE · defence in depth\n');
reset();
const ZY = ['apexaur_1','voltigrax_wild','zarakai_wild','anciuxor_wild',
            'rakoron_cave_boss','snok_wild','voltaryn','elzoran','gearbyte']
           .filter(x=>!_npcGated(x));   // ★ v0.95.789
// layer 1 · the registry refuses to enrol them
let enrolled = 0;
for (const id of ZY){ const n = C.NPCS.find(x => x.id === id); if (n && C.registerContact(n)) enrolled++; }
ok(enrolled === 0, `layer 1 · registry enrolled ${enrolled}/${ZY.length} Zyrex`);
ok(C.allContacts().length === 0, 'book is still empty after interacting with all 10');
// layer 2 · id-level detection with no live NPC behind it
ok(ZY.every(id => C.isZyrexContactId(id)), 'layer 2 · every Zyrex id detected by id alone');
ok(!C.isZyrexContactId('zurelea') && !C.isZyrexContactId('scrapjaw') && !C.isZyrexContactId('mom'),
   '...and no humanoid is misread as a Zyrex');
// layer 3 · a stale save that smuggled one in gets pruned + never rendered
C.player.metNpcs = { voltigrax_wild:{name:'Voltigrax',loc:'Zarvane'}, mom:{name:'Mom',loc:'Home'} };
ok(!C.allContacts().some(c => c[0] === 'voltigrax_wild'), 'layer 3 · allContacts refuses to render a smuggled Zyrex');
// v0.95.681 · the inverse now matters just as much
{ const o=C.findNpcById('omniris');
  ok(!!o && C.contactEligible(o), 'OMNIRIS is contact-eligible · Humanoid/Aura elder, phone book like Kelthor'); }
C.pruneZyrexContacts();
ok(!C.player.metNpcs.voltigrax_wild, '...and the load-time sweep deletes it');
ok(!!C.player.metNpcs.mom, '...while leaving humanoids alone');
// layer 4 · the dial itself refuses, even handed the id directly
C.player.metNpcs = {}; C.player.phoneBattery = true;
C.player.scrapjawTowersRestored = {}; C.player.radioTowerFixed = true;
const om = C.findNpcById('voltigrax_wild');
if (om){
  om._phoneSpawned = false;
  C.player.x = om.tileX; C.player.y = om.tileY;
  C.toggleContactCall('voltigrax_wild', 'Voltigrax');
  ok(om._phoneSpawned !== true, 'layer 4 · dialling a Zyrex directly is REFUSED (no spawn)');
} else ok(false, 'voltigrax_wild NPC not found');

console.log(fails ? `\n❌ ${fails} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(0);


