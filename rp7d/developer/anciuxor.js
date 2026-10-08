// Anciuxor roaming placeholder — classic RP7B sprite art + approach relocation.
import * as THREE from 'three';
import { rng } from './util.js';
import { loadArtTexture } from './art-texture.js';

const IDLE = './assets/anciuxor/anciuxor.png';
const FLY = './assets/anciuxor/anciuxor-fly.png';

export async function createAnciuxor(scene, world, W) {
  const [idleTex, flyTex] = await Promise.all([loadArtTexture(IDLE, 4), loadArtTexture(FLY, 4)]);
  const mat = new THREE.SpriteMaterial({ map: idleTex, transparent: true, alphaTest: 0.04, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(6.0, 6.0, 1); sprite.renderOrder = 4; scene.add(sprite);

  const random = rng(W.seed ^ 0xa6c10); // stable district seed, varied from the world plan
  const pos = new THREE.Vector3();
  const lerp = new THREE.Vector3();
  const pickLanding = (from, player, minPlayerDist = 20) => {
    for (let i = 0; i < 180; i++) {
      const x = random.range(-W.bound + 8, W.bound - 8), z = random.range(-W.bound + 8, W.bound - 8);
      if (W.containsLand && !W.containsLand(x, z)) continue;
      if (Math.hypot(x - player.x, z - player.z) < minPlayerDist) continue;
      if (Math.hypot(x - from.x, z - from.z) < 28) continue;
      if (world.waterAt(x, z) > world.heightAt(x, z) - 0.15) continue;
      const test = new THREE.Vector3(x, world.groundAt(x, z), z);
      if (world.resolve(test, 3.2)) continue;
      return test;
    }
    const safe = W.anciuxorStart || W.playerStart;
    return new THREE.Vector3(safe.x, world.groundAt(safe.x, safe.z), safe.z);
  };

  const start = W.anciuxorStart || W.playerStart;
  pos.copy(pickLanding(new THREE.Vector3(start.x, 0, start.z), new THREE.Vector3(W.playerStart.x, 0, W.playerStart.z), 30));
  let target = pos.clone(), flightStart = pos.clone(), flightDuration = 2;
  let state = 'landed', timer = 0, frame = 0, frameT = 0, altitude = 0;

  function setFrame(tex, n) {
    const col = n % 4, row = Math.floor(n / 4);
    tex.offset.set(col * 0.25, 1 - (row + 1) * 0.25);
  }
  function update(dt, time, rizer) {
    const p = rizer.position;
    timer += dt; frameT += dt;
    const near = Math.hypot(p.x - pos.x, p.z - pos.z) < 12;
    if (state === 'landed' && near) {
      target = pickLanding(pos, p, 25);
      flightStart.copy(pos); flightDuration = Math.max(1.4, pos.distanceTo(target) / 24);
      state = 'takeoff'; timer = 0; frameT = 0; altitude = 0;
    }
    if (state === 'takeoff') {
      altitude = Math.min(1, timer / 0.65);
      if (timer >= 0.65) { state = 'flying'; timer = 0; }
    } else if (state === 'flying') {
      const k = Math.min(1, timer / flightDuration);
      lerp.copy(flightStart).lerp(target, k);
      pos.x = lerp.x; pos.z = lerp.z; pos.y = world.groundAt(pos.x, pos.z);
      altitude = 1 + Math.sin(k * Math.PI) * 5.5;
      if (k >= 1) { state = 'landing'; timer = 0; }
    } else if (state === 'landing') {
      altitude = Math.max(0, 1 - timer / 0.75);
      if (timer >= 0.75) { pos.copy(target); state = 'landed'; timer = 0; altitude = 0; }
    }
    const moving = state !== 'landed';
    if (frameT > (moving ? 0.13 : 0.72)) { frame = (frame + 1) % 4; frameT = 0; }
    const tex = moving ? flyTex : idleTex;
    if (mat.map !== tex) { mat.map = tex; mat.needsUpdate = true; }
    setFrame(tex, frame);
    sprite.position.set(pos.x, pos.y + 2.8 + altitude * 5 + (moving ? 0 : Math.sin(time * 1.7) * 0.08), pos.z);
    sprite.material.opacity = 0.94;
    sprite.scale.set(6.0 + altitude * 0.12, 6.0 + altitude * 0.12, 1);
  }

  const dispose = () => {
    scene.remove(sprite); idleTex.dispose(); flyTex.dispose(); mat.dispose();
  };
  return { sprite, pos, update, dispose, get state() { return state; }, get target() { return target.clone(); } };
}
