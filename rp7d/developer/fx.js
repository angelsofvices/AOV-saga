// Small particle systems: drifting motes by day / fireflies by night,
// and a pooled burst emitter for footstep dust, landings, splashes, fountain spray.
import * as THREE from 'three';

const pointVS = `
  attribute float aSize; attribute float aSeed; attribute vec3 aColor; attribute float aAlpha;
  uniform float uTime, uScale; varying vec3 vColor; varying float vAlpha;
  void main(){ vColor = aColor; vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uScale / -mv.z; }`;
const pointFS = `varying vec3 vColor; varying float vAlpha;
  void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); if (d > 0.5) discard;
    gl_FragColor = vec4(vColor, vAlpha * smoothstep(0.5, 0.1, d)); }`;

export function createFX(scene, shared) {
  const scaleU = { value: innerHeight * 0.5 };
  addEventListener('resize', () => { scaleU.value = innerHeight * 0.5; });

  // ── ambient: 360 points wrapped in a box around the camera focus ──
  const N = 360, box = 70;
  const aPos = new Float32Array(N * 3), aSeed = new Float32Array(N), aSize = new Float32Array(N), aCol = new Float32Array(N * 3), aAlpha = new Float32Array(N);
  for (let i = 0; i < N; i++) { aPos[i * 3] = (Math.random() - 0.5) * box; aPos[i * 3 + 1] = Math.random() * 6; aPos[i * 3 + 2] = (Math.random() - 0.5) * box; aSeed[i] = Math.random() * 100; }
  const ag = new THREE.BufferGeometry();
  ag.setAttribute('position', new THREE.BufferAttribute(aPos, 3)); ag.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1));
  ag.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1)); ag.setAttribute('aColor', new THREE.BufferAttribute(aCol, 3)); ag.setAttribute('aAlpha', new THREE.BufferAttribute(aAlpha, 1));
  const ambient = new THREE.Points(ag, new THREE.ShaderMaterial({ uniforms: { uTime: shared.uTime, uScale: scaleU }, vertexShader: pointVS, fragmentShader: pointFS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  ambient.frustumCulled = false; scene.add(ambient);
  const base = new Float32Array(aPos);

  // ── burst pool ──
  const P = 220;
  const bPos = new Float32Array(P * 3), bSize = new Float32Array(P), bCol = new Float32Array(P * 3), bAlpha = new Float32Array(P), bSeed = new Float32Array(P);
  const vel = new Float32Array(P * 3), life = new Float32Array(P), maxLife = new Float32Array(P), grav = new Float32Array(P), size0 = new Float32Array(P);
  const bg = new THREE.BufferGeometry();
  bg.setAttribute('position', new THREE.BufferAttribute(bPos, 3)); bg.setAttribute('aSize', new THREE.BufferAttribute(bSize, 1));
  bg.setAttribute('aColor', new THREE.BufferAttribute(bCol, 3)); bg.setAttribute('aAlpha', new THREE.BufferAttribute(bAlpha, 1)); bg.setAttribute('aSeed', new THREE.BufferAttribute(bSeed, 1));
  const bursts = new THREE.Points(bg, new THREE.ShaderMaterial({ uniforms: { uTime: shared.uTime, uScale: scaleU }, vertexShader: pointVS, fragmentShader: pointFS, transparent: true, depthWrite: false }));
  bursts.frustumCulled = false; scene.add(bursts);
  let head = 0;
  const col = new THREE.Color();
  function emit(x, y, z, n, { color = '#cbb994', speed = 1.5, up = 1, life: L = 0.7, size = 0.5, g = 3, spread = 0.4 } = {}) {
    col.set(color);
    for (let k = 0; k < n; k++) {
      const i = head; head = (head + 1) % P;
      bPos[i * 3] = x + (Math.random() - 0.5) * spread; bPos[i * 3 + 1] = y + Math.random() * 0.2; bPos[i * 3 + 2] = z + (Math.random() - 0.5) * spread;
      const a = Math.random() * Math.PI * 2, s = speed * (0.4 + Math.random() * 0.6);
      vel[i * 3] = Math.cos(a) * s; vel[i * 3 + 1] = up * (0.5 + Math.random()); vel[i * 3 + 2] = Math.sin(a) * s;
      life[i] = maxLife[i] = L * (0.7 + Math.random() * 0.6); grav[i] = g; size0[i] = size * (0.6 + Math.random() * 0.8);
      bCol[i * 3] = col.r; bCol[i * 3 + 1] = col.g; bCol[i * 3 + 2] = col.b;
    }
  }

  function update(dt, t, focus, night) {
    // ambient: gold motes by day, green-gold fireflies at night
    for (let i = 0; i < N; i++) {
      const s = aSeed[i];
      let x = base[i * 3] + Math.sin(t * 0.3 + s) * 1.5, z = base[i * 3 + 2] + Math.cos(t * 0.25 + s * 1.3) * 1.5;
      x = ((x - focus.x + box / 2) % box + box) % box - box / 2 + focus.x;
      z = ((z - focus.z + box / 2) % box + box) % box - box / 2 + focus.z;
      const gy = shared.groundAt(x, z);
      aPos[i * 3] = x; aPos[i * 3 + 2] = z; aPos[i * 3 + 1] = gy + 0.6 + base[i * 3 + 1] * (night > 0.5 ? 0.5 : 1) + Math.sin(t * 0.8 + s) * 0.4;
      const fire = night * (i % 3 === 0 ? 1 : 0.25);
      const blink = Math.max(0, Math.sin(t * (1.4 + (s % 1.3)) + s * 7));
      aSize[i] = 0.18 + fire * 0.35;
      aAlpha[i] = (1 - night) * 0.22 + fire * blink * 0.95;
      aCol[i * 3] = 1 - fire * 0.25; aCol[i * 3 + 1] = 0.93; aCol[i * 3 + 2] = 0.7 - fire * 0.35;
    }
    ag.attributes.position.needsUpdate = ag.attributes.aSize.needsUpdate = ag.attributes.aAlpha.needsUpdate = ag.attributes.aColor.needsUpdate = true;
    for (let i = 0; i < P; i++) {
      if (life[i] <= 0) { bAlpha[i] = 0; continue; }
      life[i] -= dt; const k = Math.max(life[i] / maxLife[i], 0);
      vel[i * 3 + 1] -= grav[i] * dt; const drag = Math.exp(-2.5 * dt); vel[i * 3] *= drag; vel[i * 3 + 2] *= drag;
      bPos[i * 3] += vel[i * 3] * dt; bPos[i * 3 + 1] += vel[i * 3 + 1] * dt; bPos[i * 3 + 2] += vel[i * 3 + 2] * dt;
      bSize[i] = size0[i] * (1.6 - k * 0.6); bAlpha[i] = k * 0.55;
    }
    bg.attributes.position.needsUpdate = bg.attributes.aSize.needsUpdate = bg.attributes.aAlpha.needsUpdate = bg.attributes.aColor.needsUpdate = true;
  }
  return { emit, update };
}
