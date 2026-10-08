// Inline playtest assets and source files use the same art loader.
import * as THREE from 'three';

const pending = new Map();
export function loadArtTexture(url, frames = 1) {
  const key = `${url}:${frames}`;
  if (pending.has(key)) return pending.get(key);
  const result = (async () => {
    const packed = globalThis.__RP7D_ASSETS?.[url];
    let src = url, revoke = null;
    if (packed) {
      const encoded = packed.replace(/^gz:/, ''), bin = atob(encoded), bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const raw = packed.startsWith('gz:')
        ? await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()
        : bytes;
      src = URL.createObjectURL(new Blob([raw], { type: 'image/png' })); revoke = src;
    }
    try {
      const tex = await new THREE.TextureLoader().loadAsync(src);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.generateMipmaps = true;
      if (frames > 1) tex.repeat.set(1 / frames, 1 / frames);
      tex.needsUpdate = true;
      return tex;
    } finally { if (revoke) URL.revokeObjectURL(revoke); }
  })();
  pending.set(key, result);
  result.catch(() => pending.delete(key));
  return result;
}
