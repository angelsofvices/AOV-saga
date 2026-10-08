// Character factory: build template → live character. The Build Lab preview is made here, and so is
// anything the game spawns from a template ("Place in world" today, NPCs later), so the same data makes
// the same body everywhere.
//
//   const ch = await createCharacter(build);   scene.add(ch.pivot);   … ch.update(dt, speed) each frame …
//   await ch.apply(next);                        // same body: re-shape / re-equip in place
//   ch.dispose();                                // frees only what this character created
//
// A character uses its saved NPC or Mori foundation on the Rizer 1:1 skeleton,
// with the build's sliders and compatible slot assets on top.
// Isolation: the body is a SkeletonUtils clone (its own bones and skinned meshes). Geometry and materials
// stay shared with every other actor of that body and are never edited or disposed here; assets get their
// own material copies. Nothing here touches Rizer, Zoryn or any other live character.
import { Actor, loadGLB } from './actor.js';
import { unregisterActor } from './anim-lib.js';
import { HitRig } from './hitbox.js';
import { buildBase, normalizeBuild, applyBuildToActor, resolveProportions, removeBuildAssets, preloadBuild } from './build-library.js';

export const BASE_RADIUS = 0.55; // body collision radius at canonical size (seers.js SEER.radius)

export async function createCharacter(value) {
  const build = normalizeBuild(value), body = buildBase(build);
  const [gltf] = await Promise.all([loadGLB(body.url), preloadBuild(build)]);
  const actor = new Actor(gltf, body.scale, body.animProfile); // animates with Rizer's Anim Lab assignments
  applyBuildToActor(actor, build);
  await actor.ready;
  actor.update(0, 0, true, 0);
  let rig = null, alive = true, serial = 0;
  return {
    build, body, actor, pivot: actor.pivot, ready: actor.ready,
    get proportions() { return resolveProportions(build); },
    get radius() { return BASE_RADIUS * resolveProportions(build).height; },
    get issues() { return actor.buildIssues || []; },
    async apply(next) { // loads any newly equipped asset first; a later call supersedes an earlier one still loading
      if (buildBase(normalizeBuild(next)).id !== body.id) throw new Error('Changing the base requires a new character');
      const n = ++serial; await preloadBuild(next);
      if (n !== serial || !alive) return build;
      const b = applyBuildToActor(actor, next); Object.assign(build, b); return build;
    },
    hitRig() { return rig ||= new HitRig(actor); }, // capsules ride the bones' world matrices, so they follow the build
    update(dt, speed = 0) { if (alive) actor.update(dt, speed, true, 0); },
    dispose() {
      if (!alive) return; alive = false;
      unregisterActor(actor); actor.stopPreview(); actor.mixer.stopAllAction(); actor.mixer.uncacheRoot(actor.model);
      removeBuildAssets(actor); actor.shape = null; actor.pivot.removeFromParent(); rig = null;
    }
  };
}
