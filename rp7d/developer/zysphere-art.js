// RP7 Zysphere silhouette, lifted from the original item art for 2DHD world use.
import * as THREE from 'three';
import { loadArtTexture } from './art-texture.js';

export const ZYSPHERE_ART = './assets/items/zysphere-drop.png';
export const zysphereTexture = () => loadArtTexture(ZYSPHERE_ART);

export function makeZysphereSprite(size = 0.75) {
  const mat = new THREE.SpriteMaterial({ color: '#ffffff', transparent: true, alphaTest: 0.025, depthWrite: false, toneMapped: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(size * (912 / 955), size, 1);
  sprite.renderOrder = 3;
  sprite.userData.noCollide = true;
  zysphereTexture().then(tex => { if (sprite.userData.disposed) return; mat.map = tex; mat.needsUpdate = true; sprite.visible = true; })
    .catch(e => console.warn('[rp7d] Zysphere art unavailable', e));
  sprite.visible = false;
  return sprite;
}

export function disposeZysphereSprite(sprite) {
  sprite.userData.disposed = true;
  sprite.parent?.remove(sprite);
  sprite.material.dispose();
}
