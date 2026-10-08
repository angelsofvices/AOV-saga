// Time of day: gradient sky dome, sun + moon, stars, matching fog and ambient.
import * as THREE from 'three';
import { smooth, rng } from './util.js';

const K = (h, top, hor, sun, sunI, hemiSky, hemiGround, hemiI, fogD) => ({ h, top: new THREE.Color(top), hor: new THREE.Color(hor), sun: new THREE.Color(sun), sunI, hemiSky: new THREE.Color(hemiSky), hemiGround: new THREE.Color(hemiGround), hemiI, fogD });
// Keyframes by hour. Late afternoon (the original RP7D mood) is kept as the golden default.
const KEYS = [
  K(0, '#070b1c', '#1c2540', '#9fb3ff', 0.55, '#3a4a78', '#141a22', 0.55, 0.0042),
  K(4.8, '#0e1430', '#2b3150', '#9fb3ff', 0.4, '#3a4a78', '#141a22', 0.5, 0.0042),
  K(6.0, '#3d4f7c', '#e79a6c', '#ffb07a', 1.2, '#b9a7a0', '#4a4436', 1.0, 0.0038),
  K(7.5, '#6c93c4', '#f2d2b0', '#ffe0b8', 2.4, '#d8e2e0', '#5b604c', 1.6, 0.0032),
  K(12, '#5a8fcc', '#cfe2e6', '#fff4e2', 2.8, '#dfe9ec', '#5d6650', 1.55, 0.0026),
  K(16.5, '#6a93c2', '#e6dcc0', '#ffe8c4', 3.0, '#e8ecdf', '#5d624c', 1.8, 0.0029),
  K(18.4, '#4a5c8c', '#f0a064', '#ff9d5c', 1.9, '#d5b19c', '#4d4538', 1.25, 0.0034),
  K(19.6, '#232b52', '#b0607a', '#ff7a6a', 0.5, '#6c5f7c', '#241f26', 0.75, 0.0040),
  K(21, '#0a0f24', '#252c4a', '#9fb3ff', 0.5, '#3a4a78', '#141a22', 0.55, 0.0042),
  K(24, '#070b1c', '#1c2540', '#9fb3ff', 0.55, '#3a4a78', '#141a22', 0.55, 0.0042)
];

export function createSky(scene, shared) {
  const uniforms = {
    uTop: { value: new THREE.Color() }, uHor: shared.uSkyHorizon, uSunDir: shared.uSunDir, uMoonDir: { value: new THREE.Vector3() },
    uSunCol: shared.uSunColor, uNight: shared.uNight, uTime: shared.uTime
  };
  const dome = new THREE.Mesh(new THREE.SphereGeometry(360, 32, 16), new THREE.ShaderMaterial({
    uniforms, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = modelMatrix*vec4(position,1.); gl_Position = projectionMatrix*viewMatrix*p; gl_Position.z = gl_Position.w; }`,
    fragmentShader: `uniform vec3 uTop, uHor, uSunDir, uMoonDir, uSunCol; uniform float uNight, uTime; varying vec3 vDir;
      float hash(vec3 p){ p = fract(p*0.3183099+.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
      void main(){
        vec3 d = normalize(vDir); float y = d.y;
        vec3 col = mix(uHor, uTop, pow(smoothstep(-0.02, 0.6, y), 0.7));
        col = mix(col, uHor*0.55, smoothstep(0.0, -0.25, y));
        float s = max(dot(d, normalize(uSunDir)), 0.0);
        col += uSunCol * (pow(s, 900.0)*4.0 + pow(s, 12.0)*0.22 + pow(s, 3.0)*0.08) * (1.0-uNight);
        float m = max(dot(d, normalize(uMoonDir)), 0.0);
        col += vec3(0.85,0.9,1.0) * (smoothstep(0.9993, 0.9996, m)*1.4 + pow(m, 60.0)*0.12) * uNight;
        vec3 sp = floor(d*260.0); float st = step(0.9965, hash(sp)) * smoothstep(0.02, 0.3, y);
        col += st * uNight * (0.6 + 0.4*sin(uTime*3.0 + hash(sp+1.0)*40.0));
        gl_FragColor = vec4(col, 1.0);
      }`
  }));
  dome.frustumCulled = false; dome.renderOrder = -10; scene.add(dome);

  const hemi = new THREE.HemisphereLight('#e8f1df', '#55604b', 1.8); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff1d2', 3); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera; sc.left = sc.bottom = -62; sc.right = sc.top = 62; sc.near = 1; sc.far = 320;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);
  scene.fog = new THREE.FogExp2('#cfe2e6', 0.003);

  const tmp = new THREE.Color(), sunDir = new THREE.Vector3(), moonDir = new THREE.Vector3();
  function lerpKey(hour) {
    let i = 0; while (i < KEYS.length - 2 && KEYS[i + 1].h <= hour) i++;
    const a = KEYS[i], b = KEYS[i + 1], t = smooth(a.h, b.h, hour);
    return { a, b, t };
  }
  function update(hour, focus) {
    const { a, b, t } = lerpKey(hour);
    // Sun rises in the east (+X), arcs across the southern sky (+Z), sets west.
    const ang = (hour - 6) / 12 * Math.PI;
    sunDir.set(Math.cos(ang), Math.sin(ang) * 0.92, 0.38).normalize();
    moonDir.set(-Math.cos(ang), -Math.sin(ang) * 0.85 + 0.15, 0.3).normalize();
    const night = 1 - smooth(-0.14, 0.12, sunDir.y);
    uniforms.uTop.value.copy(a.top).lerp(b.top, t);
    shared.uSkyHorizon.value.copy(a.hor).lerp(b.hor, t);
    shared.uSunColor.value.copy(a.sun).lerp(b.sun, t);
    shared.uSunDir.value.copy(sunDir); uniforms.uMoonDir.value.copy(moonDir);
    shared.uNight.value = night;
    // One directional light plays both roles, fading through the horizon.
    const lightDir = night > 0.5 ? moonDir : sunDir;
    const horizonFade = night > 0.5 ? smooth(0.02, 0.2, moonDir.y) : smooth(-0.02, 0.1, sunDir.y);
    sun.color.copy(shared.uSunColor.value);
    sun.intensity = (a.sunI + (b.sunI - a.sunI) * t) * Math.max(horizonFade, 0.001);
    const snap = 2;
    const fx = Math.round(focus.x / snap) * snap, fz = Math.round(focus.z / snap) * snap;
    sun.target.position.set(fx, focus.y, fz);
    sun.position.set(fx + lightDir.x * 140, focus.y + Math.max(lightDir.y, 0.08) * 140, fz + lightDir.z * 140);
    hemi.color.copy(a.hemiSky).lerp(b.hemiSky, t); hemi.groundColor.copy(a.hemiGround).lerp(b.hemiGround, t);
    hemi.intensity = a.hemiI + (b.hemiI - a.hemiI) * t;
    tmp.copy(shared.uSkyHorizon.value); scene.fog.color.copy(tmp);
    scene.fog.density = a.fogD + (b.fogD - a.fogD) * t;
    dome.position.copy(focus);
    return night;
  }
  return { update, sun, hemi };
}

export function describeHour(h) {
  const hh = Math.floor(h), mm = Math.floor((h - hh) * 60), ampm = hh >= 12 ? 'PM' : 'AM', h12 = ((hh + 11) % 12) + 1;
  const time = `${h12}:${String(mm).padStart(2, '0')} ${ampm}`;
  const phase = h < 5 ? 'Deep night' : h < 7 ? 'Dawn' : h < 11 ? 'Morning' : h < 14 ? 'Midday' : h < 17.5 ? 'Afternoon' : h < 19.3 ? 'Golden hour' : h < 21 ? 'Dusk' : 'Night';
  return { time, phase };
}
