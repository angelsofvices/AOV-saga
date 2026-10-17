import * as THREE from 'three';
import { Actor, loadGLB } from './actor.js';
import { SLOTS } from './anim-lib.js';
import { addFiles as addAnimationFiles, clipFor as retargetAnimation, ready as animationLibraryReady } from './anim-lib.js';
import { CONTROL_GUIDE } from './zyphone.js';

const SAVE_KEY = 'rp7d.andre.save.v1';
const CHARACTER_PROFILE_KEY = 'rp7d.character-profile.v1';
const DEFAULT_ANDRE_SKIN = '#ebab7f';
const DREAMLAND_CSS = `
#game.viridia-active{background:#fff;color:#171717}#game.viridia-active>#world{position:absolute;inset:0;width:100%;height:100%;display:block;z-index:0}
#game.viridia-active>:not(#world):not(#viridia-ui){display:none!important}
#viridia-ui{position:absolute;inset:0;z-index:4;pointer-events:none;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#27251f}
#viridia-ui[hidden],#viridia-ui [hidden]{display:none!important}#viridia-ui header{position:absolute;left:clamp(20px,4vw,64px);top:clamp(18px,4vh,48px);display:grid;grid-template-columns:auto 1fr;column-gap:12px;align-items:center;color:#756443;letter-spacing:.2em;font-size:12px}
#viridia-ui header>span{grid-row:span 2;color:#c1a25d;font-size:24px}#viridia-ui header b{font-weight:700}#viridia-ui header small{font-size:9px;letter-spacing:.22em;color:#888176}
#viridia-ui .viridia-help{position:absolute;bottom:22px;left:50%;transform:translateX(-50%);white-space:nowrap;color:#77736b;font-size:10px;letter-spacing:.16em}
#viridia-ui kbd{display:inline-block;border:1px solid #b7ad98;border-radius:4px;padding:4px 7px;background:#fff;color:#49463f;font:inherit;letter-spacing:.06em}#viridia-ui .viridia-help i{margin:0 9px;color:#c0a561;font-style:normal}
#viridia-ui .viridia-prompt{position:absolute;left:50%;bottom:clamp(62px,10vh,112px);transform:translateX(-50%);display:flex;align-items:center;gap:12px;padding:13px 18px;border:1px solid #c7b477;border-radius:5px;background:#fffffff0;box-shadow:0 8px 32px #5147251f;color:#39362e;font-size:12px;letter-spacing:.12em;white-space:nowrap}
#viridia-ui .viridia-chapters{pointer-events:auto;position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5vh 5vw;background:#fffffff0;backdrop-filter:blur(10px)}
#viridia-ui .viridia-chapter-head{text-align:center;margin-bottom:24px}#viridia-ui .viridia-chapter-head small{color:#9a7e3e;letter-spacing:.24em;font-size:10px}#viridia-ui .viridia-chapter-head h1{margin:8px 0;color:#24221e;font:500 clamp(27px,4vw,48px) Georgia,serif;letter-spacing:.13em}#viridia-ui .viridia-chapter-head p{margin:0;color:#77736b;font-size:13px}
#viridia-ui .viridia-chapter-list{width:min(820px,90vw);max-height:65vh;overflow:auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:4px}
#viridia-ui .viridia-chapter{display:grid;grid-template-columns:40px 1fr;grid-template-rows:auto auto;align-items:center;text-align:left;gap:3px 12px;padding:12px 14px;border:1px solid #d8d2c4;border-radius:4px;background:#fff;color:#333;cursor:pointer}
#viridia-ui .viridia-chapter.selected,#viridia-ui .viridia-chapter:focus-visible{outline:2px solid #b89b58;border-color:#b89b58;background:#fbf8ef}#viridia-ui .viridia-chapter>span{grid-row:span 2;color:#b2985d;font:22px Georgia,serif}#viridia-ui .viridia-chapter>b{font-size:11px;letter-spacing:.12em}#viridia-ui .viridia-chapter>small{color:#777;font-size:10px}
#viridia-ui .viridia-chapters footer{display:flex;gap:24px;margin-top:18px;color:#777;font-size:9px;letter-spacing:.12em}#viridia-ui .viridia-notice{position:absolute;left:50%;bottom:10vh;transform:translateX(-50%);padding:10px 15px;background:#29271feF;color:#f4e8c5;border:1px solid #b89b58;font-size:11px;letter-spacing:.08em}
#viridia-phone{pointer-events:auto;position:absolute;inset:0;background:#090b14ee;backdrop-filter:blur(14px);color:#e8e4d9;display:grid;grid-template-rows:auto auto 1fr auto;font-family:Inter,ui-sans-serif,system-ui,sans-serif}
#viridia-phone[hidden]{display:none!important}#viridia-phone header{position:static;display:flex;justify-content:space-between;padding:18px 24px;border-bottom:1px solid #b6985144;color:#f2d88b;letter-spacing:.18em;font-size:12px}#viridia-phone header small{color:#73d9e7;letter-spacing:.16em}
#viridia-phone nav{display:flex;gap:8px;padding:12px 24px;border-bottom:1px solid #b6985144}#viridia-phone button{cursor:pointer;color:#d8e5ed;background:#111b2a;border:1px solid #34516a;border-radius:4px;padding:9px 13px;font:inherit}#viridia-phone button:hover,#viridia-phone button:focus-visible,#viridia-phone button.current{outline:1px solid #65dced;border-color:#65dced;color:#fff}
#viridia-phone .viridia-phone-body{min-height:0;overflow:auto;padding:22px 24px}#viridia-phone h2{margin:0 0 8px;color:#f2d88b;font:500 25px Georgia,serif;letter-spacing:.08em}#viridia-phone .phone-lede{color:#93a9b7;font-size:12px;margin:0 0 18px}
#viridia-phone .anim-tools{display:flex;gap:10px;align-items:center;position:sticky;top:0;background:#090b14;padding:8px 0;z-index:2}#viridia-phone .anim-tools input{max-width:340px}#viridia-phone .anim-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,310px),1fr));gap:9px}
#viridia-phone .anim-card{border:1px solid #263d50;background:#0d1420;padding:11px;min-height:84px;display:grid;grid-template-columns:1fr auto;gap:7px 12px;align-items:center}#viridia-phone .anim-card.drag-over{border-color:#71e4f2;background:#112532}#viridia-phone .anim-card b{font-size:11px;letter-spacing:.08em;color:#d8e5ed}#viridia-phone .anim-card small{display:block;color:#7193a7;font-size:10px;margin-top:4px;overflow-wrap:anywhere}#viridia-phone .anim-card .drop-hint{grid-column:1/-1;color:#668092;font-size:9px;letter-spacing:.08em}#viridia-phone .controls-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:12px}#viridia-phone .control-card{border:1px solid #263d50;background:#0d1420;padding:14px}#viridia-phone .control-card h3{margin:0 0 10px;color:#68dce9;font-size:12px;letter-spacing:.14em}.control-row{display:grid;grid-template-columns:1fr auto;gap:6px;border-top:1px solid #263d5038;padding:7px 0;font-size:10px}.control-row span{color:#8197a5;text-align:right}
@media(max-width:620px){#viridia-phone header{padding:12px;font-size:10px}#viridia-phone nav,#viridia-phone .viridia-phone-body{padding:10px}#viridia-phone nav{overflow:auto}#viridia-phone nav button{white-space:nowrap}.control-row{grid-template-columns:1fr}.control-row span{text-align:left}}
@media(max-width:620px){#viridia-ui .viridia-chapter-list{grid-template-columns:1fr;max-height:58vh}#viridia-ui .viridia-help{font-size:8px;letter-spacing:.04em}#viridia-ui .viridia-chapters footer{gap:9px;font-size:8px}}
`;
const CHAPTERS = [
  ['I', 'DARKENFELL', 'Lucienis'], ['II', 'FLESH & BLOOD', 'Malrec'], ['III', 'THE KINGS', 'Solion Highreach'],
  ['IV', 'THE BLOOD WAR', 'Audrelius Veridae X'], ['V', 'THE SECOND HEDONISTIC', 'Audrelius / King Amyros'],
  ['VI', 'THE IMMORTAL WAR', 'Amyra Silverstone'], ['VII', 'THE SUPERNOVA ERA', 'Valstorm / The Mech'],
  ['VIII', 'THE EQUINOX WAR', 'Andre Hart'], ['IX', 'THE AETHRYX EXPEDITION', 'Auraxion'],
  ['X', 'SKYFALL · MUTAGENESIS', 'Aurellyn / Auraxion']
];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function createViridiaDreamland(host) {
  const style = document.createElement('style'); style.id = 'viridia-dreamland-style'; style.textContent = DREAMLAND_CSS; document.head.appendChild(style);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#ffffff');
  scene.fog = new THREE.Fog('#ffffff', 45, 180);
  const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 500);
  const hemi = new THREE.HemisphereLight('#ffffff', '#e8e8e8', 2.15); scene.add(hemi);
  const key = new THREE.DirectionalLight('#fff7e7', 2.5); key.position.set(-8, 18, 10); key.castShadow = true; scene.add(key);
  const fill = new THREE.DirectionalLight('#e2edff', 0.8); fill.position.set(12, 8, -12); scene.add(fill);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = 0; floor.receiveShadow = true; floor.name = 'Viridia_Dreamland_White_World_Floor'; scene.add(floor);

  const player = new THREE.Group(); player.name = 'Andre_Hart'; scene.add(player);
  let model = null, bones = {}, mixer = null, actorRig = null, previewAction = null, previewTimer = 0;
  const avatar = new THREE.Group(); player.add(avatar);
  const book = buildBook(); book.position.set(2.2, 0, -1.1); scene.add(book);
  const focusLight = new THREE.PointLight('#fff0c8', 2.8, 7); focusLight.position.set(2.2, 1.5, -1.1); scene.add(focusLight);
  const focusRing = new THREE.Mesh(new THREE.RingGeometry(0.52, 0.57, 48), new THREE.MeshBasicMaterial({ color: '#d5b66e', transparent: true, opacity: 0.45, side: THREE.DoubleSide }));
  focusRing.rotation.x = -Math.PI / 2; focusRing.position.set(2.2, 0.015, -1.1); scene.add(focusRing);

  const ui = document.createElement('section'); ui.id = 'viridia-ui'; ui.className = 'viridia-ui'; ui.innerHTML = `
    <header><span>✦</span><b>BOOK OF VIRIDIA</b><small>ANDRE HART · DREAMLAND</small></header>
    <div class="viridia-prompt" id="viridia-prompt" hidden><kbd>E</kbd><span>OPEN THE BOOK OF VIRIDIA</span><kbd class="pad">○</kbd></div>
    <div class="viridia-help"><kbd>W A S D</kbd> MOVE <i>·</i> <kbd>SHIFT</kbd> RUN <i>·</i> <kbd>SPACE</kbd> JUMP <i>·</i> <kbd>E</kbd> INTERACT</div>
    <div class="viridia-chapters" id="viridia-chapters" hidden role="dialog" aria-modal="true" aria-label="Book of Viridia chapters">
      <div class="viridia-chapter-head"><small>THE BLOODLINE ECHOES</small><h1>BOOK OF VIRIDIA</h1><p>Ten chapters. One unbroken history.</p></div>
      <div class="viridia-chapter-list" id="viridia-chapter-list"></div>
      <footer><span>↑ ↓ SELECT</span><span>ENTER / ✕ OPEN</span><span>ESC / ○ CLOSE</span></footer>
    </div>
    <section id="viridia-phone" hidden aria-label="Andre's Zyphone">
      <header><span>✦ &nbsp; ASTRADECK</span><small>BOOK OF VIRIDIA · ANDRE HART</small><button type="button" data-phone-close>○ CLOSE</button></header>
      <nav aria-label="Astradeck pages"><button type="button" data-phone-page="home">HOME</button><button type="button" data-phone-page="character">CHARACTER</button><button type="button" data-phone-page="controls">CONTROLS</button><button type="button" data-phone-page="animations">ANIMATIONS</button></nav>
      <div class="viridia-phone-body" id="viridia-phone-body"></div>
      <footer class="viridia-help"><kbd>TOUCHPAD / Z</kbd> OPEN / CLOSE <i>·</i> <kbd>L1 / R1</kbd> PAGES <i>·</i> <kbd>○</kbd> BACK</footer>
    </section>
    <div class="viridia-notice" id="viridia-notice" hidden></div>`;
  host.appendChild(ui);
  const prompt = ui.querySelector('#viridia-prompt'), chapterPanel = ui.querySelector('#viridia-chapters'), chapterList = ui.querySelector('#viridia-chapter-list'), notice = ui.querySelector('#viridia-notice');
  const phone = ui.querySelector('#viridia-phone'), phoneBody = ui.querySelector('#viridia-phone-body');
  let active = false, panelOpen = false, phoneOpen = false, phonePage = 'home', selected = 0, bookFound = false, chapter = null, clock = 0, noticeTimer = 0;
  const characterProfile = loadCharacterProfile();
  const pos = new THREE.Vector3(), velocity = new THREE.Vector3(), camPos = new THREE.Vector3(), lookAt = new THREE.Vector3(0, 1, 0);
  let yaw = Math.PI, pitch = 0.22, lastPad = [], lastMoveX = 0, lastMoveY = 0, interactWasDown = false, jumpWasDown = false, runningJumpActive = false, saveTimer = 0, selectedAnimSlot = 'idle';
  const actionSlots = SLOTS.filter(s => !['standup','shocked','tornadoWobble','tornadoFloat','dazedWalk','dazedRun','undeadRun','crawl','stunned','bite','feedBody','rifleDeath'].includes(s.key));
  const slotGroup = s => /punch|kick|fight|astral|blast|sword|axe|bow|rifle|pistol|blaster|stomp|parry|block|runpunch|runKick|heavyRunAttack/.test(s.key) ? 'Combat' : /walk|run|strafe|stair|jump|fall|land|fly|hover|slide|dodge|vault|ledge|wall|board|swim|treeSpin|ladder|teleport/.test(s.key) ? 'Traversal' : /pray|meditate|interact|pickup|store|craft|chair|pull|plant|guitar|emote|exitDoor|bond/.test(s.key) ? 'Actions' : 'Movement';
  const escHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const assignmentKey = 'rp7d.viridia.andre.animations.v1';
  let animationAssignments = {};
  try { animationAssignments = JSON.parse(localStorage.getItem(assignmentKey) || '{}') || {}; } catch {}
  let animationDbPromise;
  function animationDb() {
    if (!animationDbPromise) animationDbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open('rp7d-viridia-animation-lab-v1', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('clips'); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error);
    });
    return animationDbPromise;
  }
  async function saveAnimationFile(slot, file) {
    try {
      if (!actorRig) await ready;
      const ids = await addAnimationFiles([file]); if (!ids.length) throw new Error('No usable animation clip was found in this FBX.');
      const retargeted = await retargetAnimation(ids[0], actorRig, { inPlace: true, rootY: true });
      animationAssignments[slot] = { name: file.name, clipId: ids[0], clips: [retargeted.clip.name] };
      localStorage.setItem(assignmentKey, JSON.stringify(animationAssignments));
      bindAndreClip(slot, retargeted.clip); renderPhone(); announce(`${file.name} · ASSIGNED TO ANDRE`);
    } catch (error) { announce(`FBX IMPORT FAILED · ${error.message || 'Could not read this clip'}`); }
  }
  function bindAndreClip(slot, clip) {
    if (!actorRig || !clip) return;
    actorRig.setSlot(slot, clip);
    actorRig.startPreview(clip, { loop: actionSlots.find(s => s.key === slot)?.kind !== 'oneshot' }); previewAction = clip; previewTimer = clip.duration + 0.15;
  }
  async function playAssigned(slot) {
    try { if (!actorRig) await ready; const assignment = animationAssignments[slot]; if (!assignment?.clipId) throw new Error('Drop an FBX into this action slot first.');
      const result = await retargetAnimation(assignment.clipId, actorRig, { inPlace: true, rootY: true }); bindAndreClip(slot, result.clip);
    } catch (error) { announce(error.message || 'Could not preview animation.'); }
  }

  function buildBook() {
    const root = new THREE.Group(); root.name = 'Physical_Book_of_Viridia';
    const gold = new THREE.MeshStandardMaterial({ color: '#c5a75d', metalness: 0.72, roughness: 0.28 });
    const cover = new THREE.MeshStandardMaterial({ color: '#163d2b', roughness: 0.48 });
    const pages = new THREE.MeshStandardMaterial({ color: '#f1e7cc', roughness: 0.9 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.634, 0.1056, 0.827), gold); base.position.y = 0.0528; root.add(base);
    const page = new THREE.Mesh(new THREE.BoxGeometry(0.563, 0.1012, 0.7656), pages); page.position.set(0.018, 0.1012, 0); root.add(page);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.6424, 0.0484, 0.8448), cover); lid.position.set(0, 0.1496, 0); root.add(lid);
    const inset = new THREE.Mesh(new THREE.BoxGeometry(0.4928, 0.0079, 0.6688), new THREE.MeshStandardMaterial({ color: '#20543a', roughness: 0.62 })); inset.position.set(0, 0.1769, 0); root.add(inset);
    const sigil = new THREE.Mesh(new THREE.OctahedronGeometry(0.1056, 0), new THREE.MeshStandardMaterial({ color: '#e8cc78', emissive: '#8c6d24', emissiveIntensity: 0.55, metalness: 0.45, roughness: 0.28 })); sigil.position.set(0, 0.2464, 0); root.add(sigil);
    for (const z of [-0.2816, 0.2816]) { const band = new THREE.Mesh(new THREE.BoxGeometry(0.0352, 0.0106, 0.1408), gold); band.position.set(0, 0.1857, z); root.add(band); }
    root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    root.userData.sigil = sigil; return root;
  }
  function buildFallbackAndre() {
    const skin = new THREE.MeshStandardMaterial({ color: characterProfile.skin.color, roughness: 0.82 });
    const dark = new THREE.MeshStandardMaterial({ color: '#1a1b20', roughness: 0.76 });
    const cloth = new THREE.MeshStandardMaterial({ color: '#ddd8c9', roughness: 0.9 });
    const blue = new THREE.MeshStandardMaterial({ color: '#243b53', roughness: 0.82 });
    const part = (geo, mat, parent, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
    const torso = part(new THREE.CapsuleGeometry(0.29, 0.42, 3, 7), cloth, avatar, 0, 1.04, 0);
    const head = part(new THREE.SphereGeometry(0.22, 9, 7), skin, avatar, 0, 1.62, 0);
    part(new THREE.SphereGeometry(0.23, 8, 5), dark, avatar, 0, 1.78, -0.02);
    part(new THREE.BoxGeometry(0.36, 0.16, 0.24), blue, avatar, 0, 0.7, 0);
    const arms = [], legs = [];
    for (const s of [-1, 1]) {
      const arm = new THREE.Group(); arm.position.set(s * 0.34, 1.31, 0); avatar.add(arm);
      part(new THREE.CapsuleGeometry(0.085, 0.32, 2, 5), cloth, arm, 0, -0.2, 0); part(new THREE.SphereGeometry(0.075, 7, 5), skin, arm, 0, -0.4, 0); arms.push(arm);
      const leg = new THREE.Group(); leg.position.set(s * 0.13, 0.64, 0); avatar.add(leg);
      part(new THREE.CapsuleGeometry(0.11, 0.39, 2, 5), blue, leg, 0, -0.28, 0); part(new THREE.BoxGeometry(0.18, 0.1, 0.32), dark, leg, 0, -0.53, 0.065); legs.push(leg);
    }
    const mantle = part(new THREE.ConeGeometry(0.36, 0.8, 5, 1, true), cloth, avatar, 0, 1.05, -0.19); mantle.rotation.x = Math.PI;
    return { torso, head, arms, legs };
  }
  function loadCharacterProfile() {
    const defaults = { version: 1, characterId: 'andre', stages: ['build', 'skin', 'hairAndFace', 'clothing', 'archetype', 'attributes', 'animations'], build: { preset: 'base' }, skin: { color: DEFAULT_ANDRE_SKIN }, hairAndFace: {}, clothing: {}, archetype: {}, attributes: {}, animations: {} };
    try {
      const saved = JSON.parse(localStorage.getItem(CHARACTER_PROFILE_KEY) || 'null');
      if (!saved || saved.characterId !== 'andre') return defaults;
      return { ...defaults, ...saved, skin: { ...defaults.skin, ...saved.skin }, build: { ...defaults.build, ...saved.build } };
    } catch { return defaults; }
  }
  function saveCharacterProfile() {
    try { localStorage.setItem(CHARACTER_PROFILE_KEY, JSON.stringify(characterProfile)); } catch {}
  }
  function recolorAndre(root) {
    root.traverse(o => {
      if (!o.isMesh) return;
      o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      const changed = mats.map(m => {
        const c = m.clone(); const n = `${o.name} ${m.name}`.toLowerCase();
        if (/\bband\b|\bbelt\b/.test(n)) c.visible = false;
        else if (/skin|body/.test(n)) c.color.set(characterProfile.skin.color);
        else if (/pant|cloth|shirt|torso/.test(n)) c.color.set('#d9d3c1');
        else if (/band|belt|gold|trim/.test(n)) c.color.set('#ad8b4c');
        else if (/eye|mouth/.test(n)) c.color.set('#19191c');
        return c;
      });
      o.material = Array.isArray(o.material) ? changed : changed[0];
    });
  }
  async function loadAndre() {
    try {
      // Use the shared asset loader so this works both from the source project and
      // from the self-contained playtest, where models are embedded in the page.
      const gltf = await loadGLB('./assets/npc/npc_base.glb');
      actorRig = new Actor(gltf, 1.25, null); model = actorRig.model; recolorAndre(model); avatar.add(actorRig.pivot); mixer = actorRig.mixer;
      bones = Object.fromEntries(['mixamorigLeftArm','mixamorigRightArm','mixamorigLeftUpLeg','mixamorigRightUpLeg','mixamorigHips'].map(n => [n, model.getObjectByName(n)]));
      await animationLibraryReady;
      // These are Andre's official Dreamland locomotion clips. Keep them in the
      // campaign-specific assignment store; imported Rizer assignments remain separate.
      const locomotionVersionKey = `${assignmentKey}.locomotionVersion`;
      const officialAndreLocomotion = {
        idle: { name: 'Rizer · Idle', clipId: 'builtin:rizer:Idle' },
        walk: { name: 'Rizer · Walk', clipId: 'lib:rizer/walk_1.fbx', stride: 1.15 },
        run: { name: 'Rizer · Run', clipId: 'builtin:rizer:Run' },
      };
      // One-time migration replaces the earlier Hart-specific walk/idle clips;
      // later Animation Lab edits remain saved as Andre's own choices.
      if (localStorage.getItem(locomotionVersionKey) !== 'rizer-shared-v1') {
        Object.assign(animationAssignments, officialAndreLocomotion);
        localStorage.setItem(locomotionVersionKey, 'rizer-shared-v1');
      }
      for (const [slot, assignment] of Object.entries({
        jump: { name: 'hartJump.fbx', clipId: 'lib:viridia/Hart_Jump.fbx' },
        runJump: { name: 'hartRunningJump.fbx', clipId: 'lib:viridia/Hart_Running_Jump.fbx' },
      })) if (!animationAssignments[slot]?.clipId) animationAssignments[slot] = assignment;
      localStorage.setItem(assignmentKey, JSON.stringify(animationAssignments));
      if (Object.keys(animationAssignments).length) {
        try {
          const db = await animationDb();
          for (const slot of Object.keys(animationAssignments)) {
            let assignment = animationAssignments[slot];
            if (!assignment?.clipId) {
              const bytes = await new Promise((resolve, reject) => { const req = db.transaction('clips').objectStore('clips').get(slot); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); });
              if (bytes && assignment?.name) {
                const file = new File([bytes], assignment.name, { type: 'application/octet-stream' }), ids = await addAnimationFiles([file]);
                if (ids[0]) { assignment = animationAssignments[slot] = { ...assignment, clipId: ids[0] }; localStorage.setItem(assignmentKey, JSON.stringify(animationAssignments)); }
              }
            }
            if (!assignment?.clipId) continue;
            const result = await retargetAnimation(assignment.clipId, actorRig, { inPlace: true, rootY: true, stride: assignment.stride || 1 }); actorRig.setSlot(slot, result.clip, { travel: result.travel });
          }
        } catch (error) { console.warn('[viridia] Could not restore Andre animation assignments', error); }
      }
    } catch (error) { console.warn('[viridia] Andre base model unavailable; using native low-poly stand-in', error); bones = buildFallbackAndre(); }
  }
  let readyState = 'loading';
  const ready = loadAndre().then(() => { saveTimer = 0; readyState = 'ready'; window.dispatchEvent(new Event('rp7d:viridia-ready')); });

  function renderChapters() {
    chapterList.innerHTML = CHAPTERS.map(([roman, name, perspective], i) => `<button class="viridia-chapter${i === selected ? ' selected' : ''}" data-index="${i}" type="button"><span>${roman}</span><b>${name}</b><small>${perspective}</small></button>`).join('');
    chapterList.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { selected = Number(b.dataset.index); renderChapters(); announce(`${CHAPTERS[selected][1]} · BLOODLINE ECHO NOT BUILT YET`); }));
  }
  function renderPhone() {
    if (phonePage === 'home') {
      phoneBody.innerHTML = `<h2>ANDRE'S ASTRADECK</h2><p class="phone-lede">Campaign tools for Andre Hart. Controls are shared with Book of Zyraxis; animation assignments are saved to Andre's campaign only.</p><div class="controls-grid"><div class="control-card"><h3>CHARACTER SETUP</h3><p class="phone-lede">Build a character in stages, starting from Andre's base model.</p><button type="button" data-phone-page="character">OPEN CHARACTER SETUP</button></div><div class="control-card"><h3>ANIMATION LAB</h3><p class="phone-lede">Assign and preview FBX clips for generic gameplay actions. Drop a clip into any action slot.</p><button type="button" data-phone-page="animations">OPEN ANIMATIONS</button></div><div class="control-card"><h3>RP7 CONTROLS</h3><p class="phone-lede">Browse the shared keyboard and controller layout.</p><button type="button" data-phone-page="controls">VIEW CONTROLS</button></div><div class="control-card"><h3>BLOODLINE ECHOES</h3><p class="phone-lede">Open the physical Book of Viridia to browse its ten chapters.</p><button type="button" data-phone-close>RETURN TO DREAMLAND</button></div></div>`;
    } else if (phonePage === 'character') {
      const stages = [['build','01 · BUILD','Base skeletal body'],['skin','02 · SKIN','Skin tone'],['hairAndFace','03 · HAIR & FACE','Hair and facial features'],['clothing','04 · CLOTHING','Clothing and equipment'],['archetype','05 · ARCHETYPE','Character role'],['attributes','06 · ATTRIBUTES','Gameplay attributes'],['animations','07 · ANIMATIONS','Movement and action set']];
      phoneBody.innerHTML = `<h2>CHARACTER SETUP</h2><p class="phone-lede">A reusable character creation pipeline for Viridia and future online characters. Andre is the starting base; later stages stay ready for confirmed assets.</p><div class="controls-grid"><section class="control-card"><h3>CREATION ORDER</h3>${stages.map(([key, label, desc]) => `<div class="control-row"><b>${label}</b><span>${key === 'build' ? 'BASE MODEL' : key === 'skin' ? 'EDITABLE' : 'NEXT PHASE'} · ${desc}</span></div>`).join('')}</section><section class="control-card"><h3>01 · BASE BODY</h3><p class="phone-lede">Andre's neutral skeletal base. Character details will be layered on after the customization pipeline is confirmed.</p><h3>02 · SKIN</h3><label class="control-row" for="andre-skin-color"><b>Andre's skin tone</b><span><input id="andre-skin-color" type="color" value="${escHtml(characterProfile.skin.color)}" aria-label="Andre skin color"></span></label><p class="phone-lede">Current base tone: ${escHtml(characterProfile.skin.color.toUpperCase())}</p></section></div>`;
      phoneBody.querySelector('#andre-skin-color')?.addEventListener('input', event => {
        characterProfile.skin.color = event.target.value.toLowerCase(); saveCharacterProfile();
        if (actorRig?.model) actorRig.model.traverse(o => {
          if (!o.isMesh) return;
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          for (const material of mats) if (/skin|body/i.test(`${o.name} ${material.name}`)) material.color.set(characterProfile.skin.color);
        });
        else if (bones.head) { bones.head.material.color.set(characterProfile.skin.color); bones.arms.forEach(arm => arm.children.at(-1)?.material.color.set(characterProfile.skin.color)); }
        const label = phoneBody.querySelector('.phone-lede:last-child'); if (label) label.textContent = `Current base tone: ${characterProfile.skin.color.toUpperCase()}`;
      });
    } else if (phonePage === 'controls') {
      phoneBody.innerHTML = `<h2>RP7 CONTROL GUIDE</h2><p class="phone-lede">These inputs match the Book of Zyraxis. Move sets and animation assignments remain character-specific.</p><div class="controls-grid">${Object.values(CONTROL_GUIDE).map(group => `<section class="control-card"><h3>${escHtml(group.name).toUpperCase()}</h3>${group.rows.map(([action,keyboard,controller]) => `<div class="control-row"><b>${escHtml(action.replace('Zyphone','Astradeck'))}</b><span>${escHtml(keyboard)} &nbsp; / &nbsp; ${escHtml(controller)}</span></div>`).join('')}</section>`).join('')}</div>`;
    } else {
      const query = (phoneBody.querySelector('[data-anim-search]')?.value || '').trim().toLowerCase();
      const visible = actionSlots.filter(s => `${s.label} ${s.key} ${slotGroup(s)}`.toLowerCase().includes(query));
      const groups = ['Movement','Combat','Traversal','Actions'];
      phoneBody.innerHTML = `<h2>ANIMATION LIBRARY</h2><p class="phone-lede">Andre's action slots use RP7 controls. Assignments are isolated to this campaign. Drop an FBX onto a slot or select a slot, then use Import FBX.</p><div class="anim-tools"><button type="button" data-anim-import>IMPORT FBX TO SELECTED SLOT</button><input data-anim-search type="search" placeholder="Search actions" value="${escHtml(query)}" aria-label="Search animation actions"><input data-anim-file type="file" accept=".fbx,model/fbx" hidden></div>${groups.map(group => { const rows = visible.filter(s => slotGroup(s) === group); if (!rows.length) return ''; return `<h3 style="color:#68dce9;letter-spacing:.15em;font-size:11px;margin:20px 0 8px">${group.toUpperCase()}</h3><div class="anim-grid">${rows.map(s => { const assignment = animationAssignments[s.key]; return `<article class="anim-card${selectedAnimSlot===s.key?' current':''}" data-anim-slot="${escHtml(s.key)}" tabindex="0"><div><b>${escHtml(s.label)}</b><small>${assignment ? `ASSIGNED · ${escHtml(assignment.name)}` : `EMPTY · ${escHtml(s.kind.toUpperCase())}`}</small></div><button type="button" data-anim-preview="${escHtml(s.key)}">PREVIEW</button><div class="drop-hint">DROP FBX HERE · ${escHtml(s.kind.toUpperCase())}</div></article>`; }).join('')}</div>`; }).join('')}`;
      phoneBody.querySelector('[data-anim-search]')?.addEventListener('input', () => { const input = phoneBody.querySelector('[data-anim-search]'); const value = input.value; renderPhone(); const next = phoneBody.querySelector('[data-anim-search]'); next.value = value; next.focus(); next.setSelectionRange(value.length, value.length); });
    }
    phone.querySelectorAll('[data-phone-page]').forEach(button => button.classList.toggle('current', button.dataset.phonePage === phonePage));
  }
  function setPhonePage(page) { phonePage = page; renderPhone(); }
  function openPhone() { phoneOpen = true; panelOpen = false; chapterPanel.hidden = true; prompt.hidden = true; phone.hidden = false; renderPhone(); }
  function closePhone() { phoneOpen = false; phone.hidden = true; }
  phone.addEventListener('click', event => {
    const pageButton = event.target.closest('[data-phone-page]'); if (pageButton) { setPhonePage(pageButton.dataset.phonePage); return; }
    if (event.target.closest('[data-phone-close]')) { closePhone(); return; }
    const importButton = event.target.closest('[data-anim-import]'); if (importButton) { phoneBody.querySelector('[data-anim-file]')?.click(); return; }
    const preview = event.target.closest('[data-anim-preview]'); if (preview) { selectedAnimSlot = preview.dataset.animPreview; playAssigned(selectedAnimSlot); return; }
    const slot = event.target.closest('[data-anim-slot]'); if (slot) { selectedAnimSlot = slot.dataset.animSlot; phoneBody.querySelectorAll('.anim-card').forEach(card => card.classList.toggle('current', card === slot)); }
  });
  phone.addEventListener('change', event => { if (event.target.matches('[data-anim-file]') && event.target.files?.[0]) saveAnimationFile(selectedAnimSlot, event.target.files[0]); });
  phone.addEventListener('dragover', event => { const slot = event.target.closest('[data-anim-slot]'); if (slot) { event.preventDefault(); slot.classList.add('drag-over'); } });
  phone.addEventListener('dragleave', event => { const slot = event.target.closest('[data-anim-slot]'); if (slot && !slot.contains(event.relatedTarget)) slot.classList.remove('drag-over'); });
  phone.addEventListener('drop', event => { const slot = event.target.closest('[data-anim-slot]'); if (!slot) return; event.preventDefault(); slot.classList.remove('drag-over'); selectedAnimSlot = slot.dataset.animSlot; const file = [...(event.dataTransfer?.files || [])].find(f => /\.fbx$/i.test(f.name)); if (file) saveAnimationFile(selectedAnimSlot, file); else announce('DROP AN FBX FILE INTO AN ACTION SLOT.'); });
  function announce(text) { notice.textContent = text; notice.hidden = false; clearTimeout(noticeTimer); noticeTimer = setTimeout(() => notice.hidden = true, 2600); }
  function openBook() { panelOpen = true; bookFound = true; chapterPanel.hidden = false; prompt.hidden = true; selected = chapter ? Math.max(0, CHAPTERS.findIndex(q => q[0] === chapter)) : 0; renderChapters(); save(); }
  function closeBook() { panelOpen = false; chapterPanel.hidden = true; }
  function save() {
    try { const data = { version: 2, campaign: 'viridia', character: 'andre', x: player.position.x, z: player.position.z, yaw, bookFound, chapter, updatedAt: Date.now() }; localStorage.setItem(SAVE_KEY, JSON.stringify(data)); return data; }
    catch (e) { return null; }
  }
  function enter(data = null) {
    active = true; panelOpen = false; phoneOpen = false; phone.hidden = true; bookFound = !!data?.bookFound; chapter = data?.chapter || null;
    player.position.set(Number.isFinite(data?.x) ? data.x : 0, 0, Number.isFinite(data?.z) ? data.z : 3.2); yaw = Number.isFinite(data?.yaw) ? data.version < 2 ? data.yaw + Math.PI : data.yaw : Math.PI;
    host.classList.add('viridia-active'); ui.hidden = false; chapterPanel.hidden = true; prompt.hidden = true;
    scene.updateMatrixWorld(true); followCamera(1); return true;
  }
  function exit() { active = false; closeBook(); closePhone(); ui.hidden = true; host.classList.remove('viridia-active'); }
  function followCamera(dt) {
    const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    camPos.set(player.position.x + forward.x * 6.8, 4.0 + pitch * 2.2, player.position.z + forward.z * 6.8);
    camera.position.lerp(camPos, 1 - Math.exp(-dt * 5)); lookAt.set(player.position.x, 1.05, player.position.z); camera.lookAt(lookAt);
  }
  function update(dt, keys, pressed) {
    if (!active) return;
    clock += dt; dt = Math.min(dt, 0.05);
    const pad = [...(navigator.getGamepads?.() || [])].find(g => g?.connected);
    const b = i => !!pad?.buttons?.[i]?.pressed, edge = i => b(i) && !lastPad[i];
    const axisX = pad?.axes?.[0] || 0, axisY = pad?.axes?.[1] || 0;
    if (pressed.has('KeyZ') || edge(17)) { if (phoneOpen) closePhone(); else openPhone(); pressed.delete('KeyZ'); lastPad = pad?.buttons.map(q => q.pressed) || []; return; }
    if (phoneOpen) {
      if (actorRig && previewAction) { actorRig.update(dt, 0, true, 0); previewTimer -= dt; if (previewTimer <= 0) { actorRig.stopPreview(); previewAction = null; } }
      if (pressed.has('Escape') || pressed.has('Backspace') || edge(1)) { closePhone(); }
      else if (edge(4)) { const pages = ['home','character','controls','animations']; setPhonePage(pages[(pages.indexOf(phonePage) + pages.length - 1) % pages.length]); }
      else if (edge(5)) { const pages = ['home','character','controls','animations']; setPhonePage(pages[(pages.indexOf(phonePage) + 1) % pages.length]); }
      else if (pressed.has('Enter') || edge(0)) { document.activeElement?.click?.(); }
      else if (pressed.has('ArrowUp') || pressed.has('ArrowDown') || edge(12) || edge(13)) {
        const cards = [...phoneBody.querySelectorAll('[data-anim-slot], [data-phone-page], [data-anim-preview], [data-anim-import]')];
        if (cards.length) { const current = cards.findIndex(el => el === document.activeElement || el.closest?.('.anim-card')?.dataset.animSlot === selectedAnimSlot); const step = (pressed.has('ArrowUp') || edge(12)) ? -1 : 1; cards[(current + step + cards.length) % cards.length].focus(); }
      }
      lastPad = pad?.buttons.map(q => q.pressed) || []; pressed.clear(); return;
    }
    if (panelOpen) {
      if (pressed.has('ArrowUp') || pressed.has('KeyW') || edge(12)) { selected = (selected + CHAPTERS.length - 1) % CHAPTERS.length; renderChapters(); }
      if (pressed.has('ArrowDown') || pressed.has('KeyS') || edge(13)) { selected = (selected + 1) % CHAPTERS.length; renderChapters(); }
      if (pressed.has('Escape') || pressed.has('KeyX') || edge(1) || edge(2)) closeBook();
      if (pressed.has('Enter') || pressed.has('Space') || edge(0)) announce(`${CHAPTERS[selected][1]} · BLOODLINE ECHO NOT BUILT YET`);
      lastPad = pad?.buttons.map(q => q.pressed) || []; pressed.clear(); return;
    }
    const forward = Number(keys.has('KeyW') || keys.has('ArrowUp')) - Number(keys.has('KeyS') || keys.has('ArrowDown')) - axisY;
    const side = Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft')) + axisX;
    const moving = Math.hypot(forward, side) > 0.12, running = keys.has('ShiftLeft') || keys.has('ShiftRight') || b(7);
    const speed = running ? 6.1 : 3.5, fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = -fz, rz = fx;
    const wish = new THREE.Vector3(fx * forward + rx * side, 0, fz * forward + rz * side); if (wish.lengthSq() > 1) wish.normalize();
    const jump = pressed.has('Space') || pressed.has('KeyX') || edge(0), interact = pressed.has('KeyE') || edge(1) || edge(2);
    velocity.x = THREE.MathUtils.damp(velocity.x, wish.x * speed, moving ? 10 : 14, dt); velocity.z = THREE.MathUtils.damp(velocity.z, wish.z * speed, moving ? 10 : 14, dt);
    player.position.x += velocity.x * dt; player.position.z += velocity.z * dt;
    player.position.y += velocity.y * dt; if (player.position.y > 0 || velocity.y > 0) velocity.y -= 18 * dt;
    if (player.position.y < 0) { player.position.y = 0; velocity.y = 0; runningJumpActive = false; }
    if (jump && player.position.y <= 0.001) { velocity.y = 5.8; runningJumpActive = moving && running; }
    const angle = Math.atan2(wish.x, wish.z); if (moving) player.rotation.y += Math.atan2(Math.sin(angle - player.rotation.y), Math.cos(angle - player.rotation.y)) * Math.min(1, dt * 10);
    if (actorRig) {
      actorRig.tiredRunning = false; actorRig.flying = false;
      actorRig.runningJump = runningJumpActive;
      actorRig.update(dt, moving ? speed : 0, player.position.y <= 0.001 && velocity.y <= 0, velocity.y);
      if (previewAction) { previewTimer -= dt; if (previewTimer <= 0) { actorRig.stopPreview(); previewAction = null; } }
    } else if (model && bones.mixamorigHips) {
      const stride = moving ? Math.sin(clock * (running ? 10 : 7)) : 0;
      bones.mixamorigLeftUpLeg.rotation.x = stride * 0.38; bones.mixamorigRightUpLeg.rotation.x = -stride * 0.38;
      bones.mixamorigLeftArm.rotation.x = -stride * 0.28 - (moving ? 0.08 : 0); bones.mixamorigRightArm.rotation.x = stride * 0.28;
      bones.mixamorigHips.position.y = Math.abs(stride) * 0.025;
    } else if (bones.legs) {
      const stride = moving ? Math.sin(clock * (running ? 10 : 7)) : 0;
      bones.legs[0].rotation.x = stride * 0.42; bones.legs[1].rotation.x = -stride * 0.42;
      bones.arms[0].rotation.x = -stride * 0.3; bones.arms[1].rotation.x = stride * 0.3;
      bones.torso.position.y = 1.04 + Math.abs(stride) * 0.025;
    }
    book.rotation.y = 0.08 * Math.sin(clock * 0.55); if (book.userData.sigil) book.userData.sigil.rotation.y += dt * 0.7;
    const distance = Math.hypot(player.position.x - book.position.x, player.position.z - book.position.z);
    prompt.hidden = bookFound || distance > 2.3;
    if (interact && distance <= 2.3) openBook();
    if (pad && Math.abs(pad.axes?.[2] || 0) > 0.1) yaw -= (pad.axes[2] || 0) * dt * 1.6;
    if (moving) saveTimer += dt; else saveTimer += dt * 0.2;
    if (saveTimer >= 5) { saveTimer = 0; save(); }
    followCamera(dt); lastPad = pad?.buttons.map(q => q.pressed) || []; pressed.clear();
  }
  renderChapters();
  return { scene, camera, ready, enter, exit, update, save, get active() { return active; }, get panelOpen() { return panelOpen || phoneOpen; }, get readyState() { return readyState; }, hasSave() { try { const v = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); return v?.campaign === 'viridia' && v?.character === 'andre'; } catch { return false; } }, getSave() { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch { return null; } } };
}
