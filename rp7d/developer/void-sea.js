import * as THREE from 'three';
import { ZYRAXIS } from './district-view.js';
import { VOID_SEA_LEVEL } from './overworld-land.js';

// A single low-cost water sheet surrounds the existing land, including map gaps.
// Terrain occludes it inland. No props or district content are generated here.
export function createVoidSea(shared) {
  const b = ZYRAXIS.bounds, margin = 4096;
  const geometry = new THREE.PlaneGeometry(b.x1 - b.x0 + margin * 2, b.z1 - b.z0 + margin * 2);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: shared.uTime, uNight: shared.uNight, uSunDir: shared.uSunDir, uSunColor: shared.uSunColor, uSky: shared.uSkyHorizon },
    vertexShader: `varying vec3 vWorld;
      void main(){ vec4 p=modelMatrix*vec4(position,1.); vWorld=p.xyz; gl_Position=projectionMatrix*viewMatrix*p; }`,
    fragmentShader: `uniform float uTime,uNight; uniform vec3 uSunDir,uSunColor,uSky;
      varying vec3 vWorld;
      void main(){
        vec2 p=vWorld.xz; float t=uTime*.24;
        float a=sin(p.x*.065+p.y*.043+t), b=sin(p.y*.13-p.x*.025-t*.7);
        vec3 n=normalize(vec3(-.035*cos(p.x*.065+p.y*.043+t),1.,-.045*cos(p.y*.13-p.x*.025-t*.7)));
        vec3 view=normalize(cameraPosition-vWorld); float fres=pow(1.-max(0.,dot(n,view)),3.);
        vec3 deep=mix(vec3(.018,.035,.085),vec3(.006,.009,.025),uNight);
        vec3 color=mix(deep,vec3(.05,.07,.14),(.5+.5*a)*.18+(.5+.5*b)*.08);
        color=mix(color,uSky*.52,fres*.8);
        float glint=pow(max(0.,dot(reflect(-normalize(uSunDir),n),view)),150.);
        color+=uSunColor*glint*(1.-uNight)*.5;
        float dist=length(cameraPosition-vWorld);
        color=mix(color,uSky,smoothstep(180.,420.,dist)*.8);
        gl_FragColor=vec4(color,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  const mesh = new THREE.Mesh(geometry, material); mesh.name = 'void-sea';
  mesh.position.set((b.x0 + b.x1) / 2, VOID_SEA_LEVEL, (b.z0 + b.z1) / 2);
  mesh.userData.level = VOID_SEA_LEVEL;
  return mesh;
}
