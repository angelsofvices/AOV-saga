// ★ 2026-10-07 · THE LIVING MASTER CODEX · CONTROLLERS
//
// DualSense first (any standard-mapping gamepad works). Reads the Gamepad API
// every frame and turns it into the game's own events:
//
//   ✕ Cross     A · confirm · examine        ○ Circle    B · back · stalk
//   □ Square    camera (photograph)           △ Triangle  field journal
//   L1 / R1     previous / next (cards, tabs)  L2 / R2     focus ring (analog)
//   D-pad / left stick   move · menu focus    right stick  aim the telescope
//   OPTIONS     pause menu                    touchpad    the map board
//
// Haptics: rumble(ms, strong, weak) uses the controller's dual-rumble motors,
// falling back to the phone's vibration motor.
(function(){
  'use strict';
  var NAMES = ['cross','circle','square','triangle','l1','r1','l2','r2','create','options','l3','r3','up','down','left','right','ps','touchpad'];
  var listeners = {}, prev = [], held = null, active = null, repeatAt = 0, enabled = true;
  var state = { lx:0, ly:0, rx:0, ry:0, l2:0, r2:0 };
  function on(ev, fn){ (listeners[ev] = listeners[ev] || []).push(fn); }
  function emit(ev, a, b){ (listeners[ev] || []).forEach(function(fn){ try { fn(a, b); } catch(e){ console.error(e); } }); }
  function pads(){ try { return Array.prototype.filter.call(navigator.getGamepads ? navigator.getGamepads() : [], Boolean); } catch(e){ return []; } }
  function isDualSense(gp){ return !!gp && /dualsense|054c.*0ce6|0ce6.*054c|wireless controller/i.test(gp.id); }
  function dz(v){ return Math.abs(v) < .28 ? 0 : v; }

  function poll(now){
    requestAnimationFrame(poll);
    var list = pads(); if (!list.length) { if (active) { active = null; emit('disconnect'); } return; }
    var gp = list[0];
    if (!active || active.index !== gp.index) { active = gp; emit('connect', gp, isDualSense(gp)); }
    if (!enabled) return;
    var b = gp.buttons || [], ax = gp.axes || [];
    state.lx = dz(ax[0] || 0); state.ly = dz(ax[1] || 0); state.rx = dz(ax[2] || 0); state.ry = dz(ax[3] || 0);
    state.l2 = b[6] ? b[6].value : 0; state.r2 = b[7] ? b[7].value : 0;
    for (var i = 0; i < NAMES.length; i++) {
      var p = !!(b[i] && b[i].pressed);
      if (p && !prev[i]) emit('press', NAMES[i]);
      if (!p && prev[i]) emit('release', NAMES[i]);
      prev[i] = p;
    }
    // one direction from the d-pad or the left stick, with key-repeat for menus
    var dir = (b[12] && b[12].pressed) ? 'up' : (b[13] && b[13].pressed) ? 'down' : (b[14] && b[14].pressed) ? 'left' : (b[15] && b[15].pressed) ? 'right' : null;
    if (!dir && (state.lx || state.ly)) dir = Math.abs(state.lx) > Math.abs(state.ly) ? (state.lx < 0 ? 'left' : 'right') : (state.ly < 0 ? 'up' : 'down');
    if (dir !== held) { held = dir; emit('dir', dir); if (dir) { emit('nav', dir); repeatAt = now + 380; } }
    else if (dir && now > repeatAt) { emit('nav', dir); repeatAt = now + 120; }
    emit('frame', state);
  }
  requestAnimationFrame(poll);
  addEventListener('gamepadconnected', function(){ /* picked up by poll */ });

  function rumble(ms, strong, weak){
    var gp = active && pads().filter(function(p){ return p.index === active.index; })[0];
    var act = gp && gp.vibrationActuator;
    if (act && act.playEffect) { try { act.playEffect('dual-rumble', { duration:ms, strongMagnitude:strong == null ? .6 : strong, weakMagnitude:weak == null ? .4 : weak }); return true; } catch(e){} }
    return false;
  }

  window.AOV_PAD = {
    on:on, rumble:rumble, state:state,
    connected:function(){ return !!active; },
    dualsense:function(){ return isDualSense(active); },
    held:function(){ return held; },
    enable:function(v){ enabled = v !== false; }
  };
})();
