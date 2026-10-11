// ── CARL'S ANIMATION LIBRARY · data-driven, one entry per distinct action ──
// Every animation has its own id, frame count, timing, looping, collision profile and events. The movement
// controller decides what Carl is doing; this file decides which animation shows it. Poses here are procedural
// (see explorer.js, carlPose) until the art pass draws the frames; the ids and timing are final.
(function(){
  // persp: 'top' (four-way), 'side' (left/right), or both. dirs: 'dir4', 'dir2' or 'none'. events fire on a frame.
  var DEF = [
    // idle
    { n:'idle', f:5, fps:4, loop:true, profile:'stand', pri:0, dirs:'none', ev:[] },
    { n:'breathe', f:4, fps:3, loop:true, profile:'stand', pri:0, dirs:'none', ev:[] },
    { n:'turn', f:3, fps:12, loop:false, profile:'stand', pri:1, dirs:'dir4', ev:[] },
    // walking
    { n:'walk', f:7, fps:9, loop:true, profile:'stand', pri:30, dirs:'dir4', ev:[{ f:0, e:'step' }, { f:3, e:'step' }] },
    { n:'walk_start', f:3, fps:12, loop:false, profile:'stand', pri:31, dirs:'dir4', ev:[{ f:0, e:'dust' }] },
    { n:'walk_stop', f:3, fps:12, loop:false, profile:'stand', pri:31, dirs:'dir4', ev:[{ f:0, e:'dust' }] },
    // running
    { n:'run', f:8, fps:14, loop:true, profile:'stand', pri:30, dirs:'dir4', ev:[{ f:0, e:'step' }, { f:4, e:'step' }, { f:0, e:'dust' }] },
    { n:'run_accel', f:4, fps:14, loop:false, profile:'stand', pri:31, dirs:'dir4', ev:[{ f:0, e:'dust' }] },
    { n:'run_decel', f:3, fps:12, loop:false, profile:'stand', pri:31, dirs:'dir4', ev:[{ f:1, e:'dust' }] },
    // crouching
    { n:'crouch_enter', f:4, fps:12, loop:false, profile:'crouch', pri:40, dirs:'dir2', ev:[] },
    { n:'crouch_idle', f:3, fps:3, loop:true, profile:'crouch', pri:40, dirs:'dir2', ev:[] },
    { n:'crouch_walk', f:6, fps:8, loop:true, profile:'crouch', pri:40, dirs:'dir2', ev:[{ f:0, e:'step' }] },
    { n:'crouch_exit', f:4, fps:12, loop:false, profile:'crouch', pri:40, dirs:'dir2', ev:[] },
    // jumping and falling (side view, with the top-down hop)
    { n:'jump_antic', f:2, fps:14, loop:false, profile:'air', pri:50, dirs:'dir2', ev:[] },
    { n:'jump_takeoff', f:3, fps:14, loop:false, profile:'air', pri:50, dirs:'dir2', ev:[{ f:0, e:'dust' }] },
    { n:'jump_ascent', f:3, fps:10, loop:true, profile:'air', pri:50, dirs:'dir2', ev:[] },
    { n:'jump_apex', f:2, fps:8, loop:false, profile:'air', pri:50, dirs:'dir2', ev:[] },
    { n:'jump_descent', f:3, fps:10, loop:true, profile:'air', pri:50, dirs:'dir2', ev:[] },
    { n:'jump_land', f:4, fps:16, loop:false, profile:'stand', pri:52, dirs:'dir2', ev:[{ f:0, e:'land' }, { f:1, e:'dust' }] },
    // climbing (the cave's climb-out and any ladder)
    { n:'climb_idle', f:3, fps:3, loop:true, profile:'climb', pri:60, dirs:'dir2', ev:[] },
    { n:'climb_up', f:6, fps:8, loop:true, profile:'climb', pri:60, dirs:'dir2', ev:[{ f:0, e:'step' }] },
    { n:'climb_down', f:6, fps:8, loop:true, profile:'climb', pri:60, dirs:'dir2', ev:[{ f:0, e:'step' }] },
    { n:'climb_exit', f:4, fps:12, loop:false, profile:'stand', pri:61, dirs:'dir2', ev:[{ f:2, e:'dust' }] },
    // the jetpack
    { n:'jet_equip', f:3, fps:12, loop:false, profile:'stand', pri:45, dirs:'none', ev:[] },
    { n:'jet_ignite', f:4, fps:16, loop:false, profile:'air', pri:55, dirs:'none', ev:[{ f:0, e:'shutter' }] },
    { n:'jet_takeoff', f:4, fps:14, loop:false, profile:'air', pri:55, dirs:'dir4', ev:[{ f:0, e:'dust' }] },
    { n:'jet_hover', f:4, fps:8, loop:true, profile:'air', pri:55, dirs:'dir4', ev:[] },
    { n:'jet_fly', f:8, fps:12, loop:true, profile:'air', pri:55, dirs:'dir4', ev:[{ f:0, e:'step' }] },
    { n:'jet_descent', f:4, fps:10, loop:false, profile:'air', pri:55, dirs:'dir4', ev:[] },
    { n:'jet_land', f:4, fps:14, loop:false, profile:'stand', pri:52, dirs:'dir4', ev:[{ f:0, e:'land' }, { f:1, e:'dust' }] },
    // the AstraBlaster
    { n:'blaster_draw', f:3, fps:12, loop:false, profile:'stand', pri:45, dirs:'dir4', ev:[] },
    { n:'blaster_aim', f:2, fps:10, loop:true, profile:'stand', pri:70, dirs:'dir4', ev:[] },
    { n:'blaster_shoot', f:5, fps:16, loop:false, profile:'stand', pri:70, dirs:'dir4', ev:[{ f:1, e:'shutter' }] },
    { n:'blaster_recoil', f:2, fps:14, loop:false, profile:'stand', pri:70, dirs:'dir4', ev:[] },
    { n:'blaster_recharge', f:3, fps:6, loop:false, profile:'stand', pri:45, dirs:'dir4', ev:[] },
    { n:'blaster_holster', f:3, fps:12, loop:false, profile:'stand', pri:45, dirs:'dir4', ev:[] },
    // the Boomfists
    { n:'bf_equip', f:3, fps:12, loop:false, profile:'stand', pri:45, dirs:'dir4', ev:[] },
    { n:'bf_punch', f:6, fps:16, loop:false, profile:'stand', pri:70, dirs:'dir4', ev:[{ f:2, e:'impact' }] },
    { n:'bf_punch_alt', f:6, fps:16, loop:false, profile:'stand', pri:70, dirs:'dir4', ev:[{ f:2, e:'impact' }] },
    { n:'bf_impact', f:3, fps:14, loop:false, profile:'stand', pri:70, dirs:'dir4', ev:[{ f:0, e:'impact' }] },
    { n:'bf_recover', f:4, fps:10, loop:false, profile:'stand', pri:45, dirs:'dir4', ev:[] },
    // interaction
    { n:'pickup', f:5, fps:12, loop:false, profile:'crouch', pri:65, dirs:'dir2', ev:[{ f:3, e:'pickup' }] },
    { n:'collect', f:5, fps:12, loop:false, profile:'stand', pri:65, dirs:'none', ev:[{ f:1, e:'pickup' }] },
    { n:'push', f:4, fps:8, loop:true, profile:'stand', pri:65, dirs:'dir2', ev:[{ f:0, e:'step' }] },
    { n:'pull', f:4, fps:8, loop:true, profile:'stand', pri:65, dirs:'dir2', ev:[{ f:0, e:'step' }] },
    { n:'operate', f:4, fps:8, loop:true, profile:'stand', pri:65, dirs:'dir4', ev:[] },
    // damage
    { n:'hurt', f:4, fps:14, loop:false, profile:'stand', pri:90, dirs:'dir2', ev:[{ f:0, e:'impact' }] },
    { n:'knockback', f:4, fps:14, loop:false, profile:'air', pri:90, dirs:'dir2', ev:[{ f:0, e:'impact' }] },
    { n:'fall', f:4, fps:12, loop:false, profile:'air', pri:100, dirs:'none', ev:[] },
    { n:'recover', f:4, fps:10, loop:false, profile:'stand', pri:89, dirs:'none', ev:[] },
    // special utilities: summoning, planting, scanning, activating
    { n:'summon', f:5, fps:12, loop:false, profile:'stand', pri:70, dirs:'dir4', ev:[{ f:2, e:'shutter' }] },
    { n:'plant', f:4, fps:10, loop:false, profile:'crouch', pri:70, dirs:'dir2', ev:[{ f:2, e:'dust' }] },
    { n:'scan', f:5, fps:8, loop:false, profile:'stand', pri:70, dirs:'dir4', ev:[{ f:1, e:'shutter' }] },
    { n:'activate', f:5, fps:10, loop:false, profile:'stand', pri:70, dirs:'dir4', ev:[{ f:2, e:'shutter' }] }
  ];
  // the two perspectives: side-view artwork, and four-way top-down artwork
  var DIRS = { dir4:['up', 'down', 'left', 'right'], dir2:['left', 'right'], none:[null] };
  var ANIMS = {}, ORDER = [];
  DEF.forEach(function(d){
    ['top', 'side'].forEach(function(persp){
      var dirs = persp === 'side' ? (d.dirs === 'dir4' ? ['left', 'right'] : d.dirs === 'dir2' ? ['left', 'right'] : [null]) : DIRS[d.dirs];
      dirs.forEach(function(dir){
        var id = 'carl_' + d.n + '_' + persp + (dir ? '_' + dir : '');
        ANIMS[id] = { id:id, name:d.n, persp:persp, dir:dir, frames:d.f, fps:d.fps, loop:d.loop, profile:d.profile, pri:d.pri, events:d.ev };
        ORDER.push(id);
      });
    });
  });
  // which animation a utility's action plays. Any utility without its own entry uses 'activate'.
  var ACTION = { astrablaster:'blaster_shoot', boomfists:'bf_punch', 'life-seed':'plant', 'star-satellite':'activate',
    'echo-decoy':'summon', 'dragonflare-horn':'summon', 'bio-scanner':'scan', 'lumelys-lantern':'activate', 'return-beacon':'activate' };
  function actionName(util){ return ACTION[util] || 'activate'; }
  function animId(name, persp, dir){ return 'carl_' + name + '_' + persp + (dir ? '_' + dir : ''); }
  // the lookup the state machine uses: pick the id that matches this name, perspective and facing, with the nearest valid facing
  function pick(name, persp, facing){
    var d = DEF.filter(function(x){ return x.n === name; })[0];
    if (!d) return null;
    var dir = null;
    if (d.dirs !== 'none') {
      var ok = persp === 'side' ? ['left', 'right'] : DIRS[d.dirs];
      dir = ok.indexOf(facing) >= 0 ? facing : (facing === 'up' || facing === 'down' ? (persp === 'side' ? 'right' : facing) : facing === 'left' ? 'left' : 'right');
      if (persp === 'side' && (facing === 'up' || facing === 'down')) dir = 'right';
    }
    return animId(name, persp, dir);
  }
  // ── the state machine: Character → Active utility → Movement → Facing → Animation ──
  // state: { perspective, facing, movement, gait, util, action, interact, hurt, knockback, dead, vy, justLanded, ignite, climbing }
  function resolve(st){
    var persp = st.perspective === 'side' ? 'side' : 'top', f = st.facing || 'down', name = 'idle';
    if (st.dead) name = 'fall';
    else if (st.hurt) name = st.knockback ? 'knockback' : 'hurt';
    else if (st.action && st.util) name = st.util === 'jetpack' ? 'jet_takeoff' : actionName(st.util);
    else if (st.interact) name = st.interact;
    else if (st.climbing) name = st.climbing === 'down' ? 'climb_down' : st.climbing === 'up' ? 'climb_up' : 'climb_idle';
    else if (st.util === 'jetpack' && st.movement === 'fly') name = st.moving ? 'jet_fly' : 'jet_hover';
    else if (st.util === 'jetpack' && st.movement === 'ignite') name = 'jet_ignite';
    else if (st.util === 'jetpack' && st.movement === 'descend') name = 'jet_descent';
    else if (st.util === 'jetpack' && st.movement === 'land') name = 'jet_land';
    else if (st.movement === 'jump' || st.movement === 'fall') {
      var v = st.vy || 0;
      name = st.movement === 'jump' && st.jumpPhase === 'antic' ? 'jump_antic' : v < -6 ? 'jump_ascent' : v < -1.5 ? 'jump_apex' : v < 0 ? 'jump_apex' : 'jump_descent';
      if (st.movement === 'jump' && st.jumpPhase === 'takeoff') name = 'jump_takeoff';
    }
    else if (st.movement === 'land' || st.justLanded) name = 'jump_land';
    else if (st.movement === 'crouch') name = st.moving ? 'crouch_walk' : 'crouch_idle';
    else if (st.moving && st.gait === 'sprint') name = 'run';
    else if (st.moving) name = 'walk';
    var pri = DEF.filter(function(x){ return x.n === name; })[0];
    return { name:name, id:pick(name, persp, f), pri:pri ? pri.pri : 0 };
  }
  // ── playback: a frame for every moment, and events on the frames they belong to ──
  function animator(){ return { name:null, id:null, t:0, frame:-1, done:false }; }
  // advance an animator by dt; onEvent(eventName) is called as each event's frame is reached. Returns the frame index.
  function advance(a, id, dt, onEvent){
    var anim = ANIMS[id]; if (!anim) return -1;
    if (a.id !== id) { a.id = id; a.t = 0; a.frame = -1; a.done = false; }
    a.t += dt;
    var raw = Math.floor(a.t * anim.fps), frame = anim.loop ? raw % anim.frames : Math.min(anim.frames - 1, raw);
    if (!anim.loop && raw >= anim.frames) a.done = true;
    if (frame !== a.frame) {
      a.frame = frame;
      if (onEvent) anim.events.forEach(function(ev){ if (ev.f === frame) onEvent(ev.e); });
    }
    return frame;
  }
  window.AOV_ANIM = { ANIMS:ANIMS, ORDER:ORDER, DEF:DEF, ACTION:ACTION, resolve:resolve, pick:pick, animator:animator, advance:advance, count:ORDER.length };
})();
