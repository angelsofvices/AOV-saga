# RIZING POWER 3D · vertical-slice prompt for Codex / Astra

> ## ⚠ PARKED · 2026-09-06
> **Creator:** *"the 3d prompt testing with astra was ok but not worth polishing
> since we are so far in rp7. rp7 remains current mainline game."*
>
> Kept for reference, not for use. **Two things are wrong with it as written:**
> 1. It says "from scratch". `rp10.html` already exists — Three.js, a working
>    third-person camera and movement **ported verbatim from RP9**, a Mixamo
>    mixer and Wind-Waker framing. A revival should say *extend rp10.html*.
> 2. RP9 (`rp9.html`) is already the 3D playtest, so the camera rig has been
>    through one game already and should not be re-derived.
>
> Also ruled that day: **no 3D minigame in RP7's Nebulaport 3000.**

**Target:** Three.js + React-Three-Fiber · **Scope:** Malezor, playable end to end.
Paste everything inside the fence. Nothing in it is a suggestion.

---

```
Build a third-person action-RPG vertical slice called RIZING POWER: MALEZOR.

It is the 3D prototype for the sequel to an existing 2D game, so treat this as
a PROVING GROUND: every system must be real and shippable, and none of it may
be faked with a cutscene or a placeholder that "would be replaced later."

═══════════════════════════════════════════════════════════════════════
STACK — not negotiable
═══════════════════════════════════════════════════════════════════════
  Vite + TypeScript + React + @react-three/fiber + @react-three/drei
  + @react-three/rapier (physics)  + zustand (state)  + postprocessing
  Target 60fps at 1080p on an M-series MacBook / mid-range discrete GPU.

  · `npm run dev` must work from a clean clone with no manual asset steps.
  · No paid assets, no external CDN at runtime, no login walls.
  · Anything procedural beats anything downloaded. Generate meshes, terrain,
    foliage and materials in code wherever it is remotely reasonable.

═══════════════════════════════════════════════════════════════════════
THE LOOK — this is the point of the exercise
═══════════════════════════════════════════════════════════════════════
STYLE: stylised painterly realism. Think Genshin/Zelda silhouette clarity with
Horizon-grade lighting. NOT photoreal, NOT flat toon, NOT low-poly cute.

Deliver a real render pipeline, not default materials:
  · Custom toon-PBR: banded diffuse (3 steps), real GGX specular, rim light
    keyed to the sun vector, and a warm/cool shadow tint rather than grey.
  · Cascaded shadow maps with a soft contact-hardening PCF kernel.
  · A proper sky: physical Rayleigh/Mie scattering, a moving sun, and volumetric
    god-rays through the tree line. Time of day on a 20-minute cycle, exposed as
    a slider.
  · Postprocessing stack: SMAA, HDR bloom on emissives only, SSAO, subtle
    chromatic aberration at the frame edge, filmic tonemap (ACES), and a
    per-district colour LUT.
  · Wind: a single global wind uniform driving grass, foliage, cloth and hair
    from the same source, so nothing moves independently of anything else.
  · Distance fog with height falloff, and aerial perspective that ties the far
    terrain to the sky colour.

★ THE ONE RULE THAT MATTERS: silhouette reads before detail. Every character
and landmark must be identifiable as a black shape at 200 metres. If a thing is
only recognisable close up, it is designed wrong.

═══════════════════════════════════════════════════════════════════════
THE WORLD — MALEZOR
═══════════════════════════════════════════════════════════════════════
Malezor is the home district of a continent called Zyraxis: a temperate
beastlands. Roughly 1km x 1km of playable ground, hand-authored — not endless
procedural terrain.

Build it as FOUR TERRAIN QUARTERS around a central settlement, with one road
leaving the district to the outside world:
   · RESIDENTIAL   — the player's home, a school, packed dirt streets
   · CAPITAL       — a hall, a shop, one landmark that is visible from anywhere
                     in the district and is used for navigation
   · WILDS         — tall grass, boulders, a river, the creatures
   · HIGHLAND/CAVE — a climb, and one sealed cave door

Settlement doctrine: houses sit in forest and highland, never fronting the main
road, and there are no homes without a shop within sight. Density falls off with
distance from the capital.

★ Terrain must do real work. Elevation gates progression — a place you can SEE
early and cannot REACH until later is worth more than a locked door.

═══════════════════════════════════════════════════════════════════════
THE PLAYER — RIZER
═══════════════════════════════════════════════════════════════════════
Third person, camera on a spring arm with collision-aware pull-in.
Gamepad first, keyboard/mouse fully supported. Both must be playable.

TRAVERSAL: walk · sprint (stamina) · dodge-roll with i-frames · mantle ledges ·
climb marked surfaces · swim. Root-motion-feeling acceleration curves — no
instant velocity changes, no ice skating. Foot IK on slopes.

COMBAT — a 4-button melee ladder, all four in the slice:
   A1 LIGHT     fast, chains 4 deep
   A2 HEAVY     slow, breaks guard, chains 4 deep
   A3 ASTRAL    ranged energy attack, costs the blue meter
   A4 ULTIMATE  screen-clearing, costs a full meter

★ COMBO CHAINS ARE THE CORE, and they are HELD not blended: each step in a
chain is its own committed strike with its own hitbox, damage multiplier and
recovery. Press again inside a 900ms window to advance the chain; miss the
window and you start over. Taking damage breaks the chain. Escalate damage
0.85 / 1.00 / 1.15 / 1.50 across the four steps so the finisher is worth
reaching. Give every step real hitstop, screen shake scaled to the step, and a
distinct swing VFX.

★ A weapon changes the chain, not just the damage number. Ship ONE sword (a
crystalline blue longsword) with its own four-step chain, plus unarmed.

METERS: red HEALTH · yellow STAMINA · blue ASTRAL. Astral fuels A3 and A4 and
regenerates only on landed hits, so aggression is the resource economy.

═══════════════════════════════════════════════════════════════════════
CREATURES — ZYREX
═══════════════════════════════════════════════════════════════════════
Zyrex are the world's creatures — the player bonds them rather than fighting
them into submission. Ship THREE species in the slice, visually unrelated to
each other: one small quadruped, one large flying, one humanoid construct.

  · WILD BEHAVIOUR. Every Zyrex has a home area and never leaves it permanently.
    Temperaments: CALM grazes and ignores you · WARY watches and keeps distance ·
    HOSTILE closes. A frightened one flees and walks home over minutes.
  · BONDING. Approach a calm one and hold a button through a short skill check.
    Success is gated on a global BOND stat, so early creatures are reachable and
    late ones are not. Failure makes it flee — recoverable, never lost forever.
  · COMPANIONS. A bonded Zyrex follows you and fights. It must PATHFIND, not
    trail you — if a rock is between it and its station it walks around, and if
    it is walled in it re-routes rather than freezing.
  · Companions hold a formation BEHIND the player, never in front, rotated by
    the direction you last travelled.

═══════════════════════════════════════════════════════════════════════
THE ENEMY — THE SEERS
═══════════════════════════════════════════════════════════════════════
A hooded cult occupying the district. Build ONE Seer HQ as a three-floor
interior dungeon:
   floor 1  fight in through the garrison
   floor 2  search rooms for a key · chests, lootable, some trapped
   floor 3  the commander — a real boss with telegraphed attacks, a stagger
            meter, and two phases

Grunt AI: patrol or idle until they SEE you, then close and fight. They must
never twitch or slide. They attack only within one body-length.

Interiors are rooms connected by DOORS, not open boxes — walls are solid, doors
are interactable, and a door takes you to a new room rather than being a hole
you walk through.

═══════════════════════════════════════════════════════════════════════
THE GATE — one locked thing, one key
═══════════════════════════════════════════════════════════════════════
Somewhere remote in the district, place ONE rare creature. Its spawn point is
randomised per playthrough from a seed stored in the save — so it is in a
different place in your game than in mine, but never moves within one game.

Bonding it opens the sealed cave door. Nothing else does. Do not print its
coordinates to the console, the UI, or any log.

═══════════════════════════════════════════════════════════════════════
UI
═══════════════════════════════════════════════════════════════════════
Diegetic and minimal. Meters top-left, a compass strip, no minimap. Damage
numbers optional and off by default. An in-world interaction prompt that
appears on the object, not in a corner.

Every HUD element must fit its own frame at any value — a counter that overflows
its panel is a bug, so measure the frame and fit the text to it.

═══════════════════════════════════════════════════════════════════════
HOW TO BUILD IT — the order is part of the instruction
═══════════════════════════════════════════════════════════════════════
1. Traversal and camera on a grey-box slope. Make MOVING feel good before
   anything else exists. Do not proceed until it does.
2. The render pipeline and the sky. Prove the look on grey boxes.
3. Combat chains against a training dummy with a damage readout.
4. Terrain, the four quarters, the settlement.
5. Zyrex — wild behaviour, then bonding, then companion pathfinding.
6. The Seer HQ and the boss.
7. The gate, the save system, the seed.

★ Ship a RUNNING BUILD at the end of every step. Never leave the project in a
state where `npm run dev` shows a black screen.

═══════════════════════════════════════════════════════════════════════
WHAT TO HAND BACK
═══════════════════════════════════════════════════════════════════════
  · The repository, running.
  · README with controls, the tuning constants, and where each system lives.
  · A DECISIONS.md recording every judgement call you made that I did not
    specify — especially the ones you were unsure about. If you invented a
    number, say so and say why.
  · A short list of what you cut and what you would do next.

★★ Where this spec is ambiguous, choose the option that makes the game FEEL
better and write down that you chose it. Where it is silent, do not invent
lore — leave a hook and name it in DECISIONS.md.
```

---

## Notes for you, not for the prompt

★ **The build order is load-bearing.** Traversal first is deliberate: if Rizer
doesn't feel good to move, nothing built on top of him will, and it's the
cheapest thing to iterate before there's a world to break.

★ **What I deliberately left out:** the full 20-type chart, tiers, the 210-species
roster, the Gemlord and Prismshard cosmology, the story. A vertical slice that
tries to carry canon becomes a lore-import job instead of a feel prototype. Every
one of those is better added once the moving-and-hitting is right — and the
prompt is written so nothing blocks them later.

★ **The randomised rare creature** is in there because it's the one system that
is genuinely awkward to retrofit (it touches save, world-gen and gating at once),
and because it is a good test of whether Astra respects a "never reveal this"
constraint.

★ **If you want it closer to RP7's actual canon**, the two things worth adding
next are the district-wheel layout for the other nine districts and the bond →
tier gate maths. Say the word and I'll write those as an addendum rather than
bloating the first run.
