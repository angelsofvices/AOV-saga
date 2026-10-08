# RP7D — Malezor Sandbox (Field Test 02)

A bounded third-person 3D slice of **Malezor, District I · Beastlands**, laid out from RP7 canon and built entirely from seeded data plus reusable procedural recipes.

RP7D stays separate from RP7B. RP7B remains the 2D open playtest and canon reference. This sandbox tests movement, camera, scale, lighting and environment. It does not implement Saga Mode or the full RPG.

## Run

**Quickest:** open `dist/RP7D_Malezor_Playtest.html` in Chrome. It is a single self-contained file (code, CSS, models and animations inside) that runs straight from disk, no server needed. Rebuild it after changes with `npm i esbuild three@0.185.1` then `node tools/build_single_html.mjs`. `dist/RP7D_source.zip` is the code-only bundle for sharing with another AI, and `CHATGPT_HANDOFF.md` explains the layout.

**From source:**

Serve the project root over HTTP so the ES modules can load, then open `/rp7d/`:

```sh
python3 -m http.server 8000
# → http://localhost:8000/rp7d/
```

Three.js (and its post-processing add-ons) load from jsDelivr through the import map in `index.html`, so you need a network connection.

## World Expansion 1 · Malezor

Malezor is rebuilt from RP7B's measured tile layout at **2 world units per tile**, using one transform in `world-data.js`. The civic spine, ten homes, terrain, roads, river, landmarks and encounter routes all share that transform. Its outer edge follows RP7B's irregular ellipse and ends in a hard void; the south Zarvane gate is the only outbound road. The north road reaches Rakoron's Cave at the foot of the ridge.

The four outer areas follow the confirmed Malezor wheel: northern highland, western forest, eastern wetland and southern open lowlands. The HUD/map uses the measured wild-zone locations, and enemy patrol selection follows RP7B's radial bands from Rizer's home, with no spawns inside 44 units. The Fanghall, Bloodscent Lodge and First Den are gold Astralvision targets with canon toasts. The radio-tower, treehouse and Auraxion chest sites are sealed scenery placeholders; they grant no items. The Fallen Titan and Timber Crossing remain as RP7D additions. Interiors, NPCs, quests and purchasable homes remain out of scope.

## Playable characters

The playtest starts as **Rizer**, a low-poly placeholder (about 1,800 triangles, flat-shaded) built from the Rizer character sheet. Switch to **Elzoran**, or put on a skin, from the Zyphone's Rizer tab. Your pick is remembered between sessions. Every character, the Seers included, shares the Mixamo rig and five clips: Idle, Walk, Run, Punch and Kick. A full-art model on the same bone names drops straight in.

- `assets/rizer/rizer.glb`, `assets/seer/seer.glb`, `assets/elzoran/elzoran.glb`: the game models. The `.blend` files beside them are the editable sources (Blender 4.2+).
- `tools/blender/`: `lowpoly_kit.py` holds the shared primitives and authors the Punch and Kick clips. `build_rizer.py`, `build_seer.py` and `build_elzoran.py` rebuild each GLB (`pip install bpy`, then `python3 build_rizer.py`). Outputs land next to the scripts; copy them into `assets/`.
- `actor.js` drives any character: stride locked to ground speed, one-shot attack clips, and base64 `.glb.js` fallbacks for hosts that can't serve `.glb`.

### Skins

- **Rizer · Psychosyd** (`assets/rizer/rizer_psychosyd.glb`) is Rizer's own mesh and rig, dressed after Psychosyd, Baelgor's rock-star idol. It has the Psychosyd Mohawk in green (shaved sides, a tall serrated centre ridge swept back) and the Psychosyd Skull Shirt: the vest panels, V-straps and chest pendant come off and a white skull-and-crossbones goes on the black shirt. Every gem glows green. His astral energy turns green too: the Astral Blast bolt, its light, cast sparks, trail and burst, plus Astralvision's wave and loot holograms.
- The skin is built by `assets/rizer/build_psychosyd.py` (Blender, from `rizer_lowpoly.blend`). A skin is just another `CHARACTERS` entry with `skinOf: 'rizer'` and an `astral` colour (`ASTRAL_PALETTES` in `astral.js`), and it reuses Rizer's animation assignments.
- The `rizer skin 2.fbx` you uploaded has the same mesh, materials and colours as the T-pose FBX made for Mixamo (it only carries Mixamo's five extra end bones). So the costume was modelled here from canon: the Mohawk and Skull Shirt cosmetics in the RP7 files. To use your own mesh instead, export it on this rig and replace the GLB.

## Anim Lab

Press **L** (or Zyphone → Rizer → Anim Lab on the controller) to open the Anim Lab beside the world.

- **Clips:** everything in `assets/anims/library.js`, the five clips built into each GLB, and any FBX/GLB you drag onto the page. Dragged-in clips stay in that browser only.
- **Play:** choose a clip and it plays on the current character. Loop, speed and root motion (in place or keep travel) are adjustable. Switch the preview character between Rizer, Elzoran and the Seer grunt. Stop the preview to walk, run, jump and fight with the assigned clips.
- **Assign:** pick an actor, then select a slot to put the chosen clip there. Slots: idle, walk, run, sprint, jump, fall, land, punch combo 1–4, kick, hit reaction, knockdown, interact and emote. Clearing a slot returns it to the GLB clip or the code pose.
- **Save:** assignments are kept in the browser. **Export assignments** gives the file to paste into `anim-assignments.js`, which sets everyone's defaults.
- **Retargeting** (`anim-lib.js`) matches bones by Mixamo name and corrects for each skeleton's rest pose, so clips made on the T-pose Rizer (`assets/rizer/mixamo/`) play on the arms-down game rigs. It also finds each strike's contact moments and each jump's take-off and landing from the motion itself.

Mixamo workflow: upload `assets/rizer/mixamo/Rizer_TPose_Rigged.fbx`, download clips as **FBX · 30 fps** with **In Place** ticked for locomotion, and drop them on the playtest.

## Punch combo

Rizer's punch chains through four clips: Jab → Hook → Elbow Uppercut → Uppercut Jab. Every press counts. Presses during a punch are buffered and each one fires the next stage as soon as the current blow lands. After a punch ends, a press within 0.5 s continues the chain, a longer pause starts over at 1, and finishing stage 4 always starts over at 1. Each contact in a clip is a hit (the Uppercut Jab lands six), and a clip's damage is split across its blows. Stages 3 and 4 deal 1.5× and 2× damage, so a full clean chain does 5.5. Tuning: `comboWindow`, `comboCancel` and `comboDamage` in `COMBAT` (`rizer.js`). Rizer's jump uses the Mixamo Jumping clip from take-off to landing.

## Moves added from the Mixamo set

- **Kick combo:** Kick 1 → 2 → 3 → 4, chained exactly like the punch combo.
- **Dodge roll:** L2 (C). Rolls about 6 units along the stick (or straight ahead), and Rizer can't be hit mid-roll. Rolls chain: as soon as one roll's burst ends (0.62 s) you can roll again, run out of it (hold R2 and the stick, and the roll eases straight into your run speed), or strike out of it. Leave the stick alone and the full get-up plays. Tuning: `COMBAT.dodge`.
- **Double jump:** press jump again in the air for the flip. Tuning: `COMBAT.doubleJump`.
- **Roads stay clear of buildings:** RP7B threads its lanes through building tiles; `clearRoads` in world-data.js bends every road around each building footprint (`FOOTPRINT`) and stops roads that begin or end at a building at its edge. The terrain, minimap and Zyphone map all read the same lines. Gates, the bridge and the fountain keep their roads.
- **Chests on the map:** never shown on the minimap or Zyphone map; they're found by exploring, or blipped for a few seconds by an Astralvision (AV) scan (silver and wooden chests).
- **Rizer's front door:** at the door prompt press ✕: he walks right up to the knob (collision gives way for that last step), then Opening Door Inwards plays from his hand on the knob. The latch gives as he turns it, the live door leaf rides his pushing hand, swings wide as he walks through, and after a quick dip to black he pulls the same door shut behind him inside. Walking up to the front door from inside plays the same clip mirrored (slot `exitDoor`) and he shuts the front door behind him outside. His body follows the clip's own hip path relative to the door. Data and door timing: doorwalk.js.
- **No hitch at the door:** the scene always has the same lights (the four lamp lights and the ruby light light the town; indoors the same five light the house, `lightIndoors`), because a change in light count recompiles every material. At load, one frame is drawn with the town and the whole house on screen (`warmShaders`), so the first trip inside doesn't stall either.
- **Wall flip:** jump at a wall and press jump again before you reach it. Rizer keeps flying at the wall, plants a foot on it at the clip's own contact distance and backflips off (Run To Flip). His body follows the clip's recorded hip arc while the foot is on the wall, then gravity takes the fall with the clip timed so its touchdown frame meets the ground. The wall must reach about a hip height above his feet (fences are too low); with no wall ahead the second jump is the normal double jump. Tuning: `WALLFLIP` in rizer.js.
- **Big landing:** after flight, or a fall that started at least `COMBAT.bigLand.minDrop` (4 units) above the ground, Falling To Landing plays. The game tracks Rizer's height every frame and starts the clip in the air, timed so its touchdown frame meets the ground. The whole landing then plays out; control returns 85% of the way through, and moving earlier blends out of it. Normal jumps and the double-jump flip keep their own landings.
- **Emote:** G / D-pad ↓ plays Flair until you move.
- **Swimming:** in water deeper than `COMBAT.swimDepth`, Rizer treads water while moving and floats (Float) while still, with the water line at the chest.
- **Flight:** double jump and keep ✕ (Space) held; after `COMBAT.fly.holdToFly` s the flip blends into Fly 1. While flying, steer up and down with the camera: look up with the right stick (or mouse) while moving and he climbs, look down and he dives, with his body pitching to match (`COMBAT.fly.pitchClimb`). ✕ still rises straight up and R2 (Shift) boosts. L3 (X) starts a slower, floating descent (the Float clip replaces the flight pose), ending in the big landing; ✕ during the descent cancels it. Tuning: `COMBAT.fly`.
- **Aetherstride:** press E / ○ at the craft to board. Left stick or WASD steers relative to the camera; look up to climb and look down to dive like Rizer's flight, with ✕ / Space for a direct rise and L2 / C to descend. R2 / Shift sustains faster flight at 54 units/s (Rizer's boost is 22); ○ / F fires a 4-damage laser at a locked Seer or Mori, or triggers a 1.35-second, 112-units/s turbo burst when no enemy is locked (2.4-second cooldown). Press □ / E to exit. The pilot is protected inside, and Rizer's normal attacks are disabled while flying the craft.
- **Stealth crouch:** L3 (X) toggles crouch on the ground. He sneaks at 1.8 with Crouched Sneaking Right, facing where he's going (the clip was authored facing backward, so its assignment turns it 180° with `yaw: 180`), and holds its first frame as the crouched idle. Crouched, Seers see him at 55% of their range and only sense him within 40% of the usual distance; Zyrex notice him late and let him get close. Running is noisier than walking. Running, jumping, rolling, flying or swimming stands him up. Tuning: `COMBAT.crouch`.
- **Interact:** E at a door plays Walk Inside Door; at landmarks it plays Picking Up.
- **Taking hits:** Hit 1 is the hit reaction, and the four deaths are knockdown variants picked at random (Rizer and Seers).
- **Astralift:** lock a Seer, Mori, or closed chest with R3, then press D-pad ↑. Rizer plays Astralift; living enemies take 2 damage, start Blastback immediately and fall in place, then play Standing Up. They resume pursuit after getting up. Chests open. Position copying is click-only on the HUD panel.
- **Combat stance:** Rizer stays in Fight Form while locked on an enemy, including while traversing. Without an enemy lock, his usual idle and walk/run play, even if enemies are nearby.
- **Seers** walk with NPC Walk 1 or 2, one picked per grunt.
- **Walk stride:** Rizer's Walk 1 keeps its 1.17 s cadence, but its assignment has `stride: 1.15`. Each leg's swing widens 15% around its average pose (the arms by half that), and the walk speed rises to match, so his feet stay planted while he covers about 15% more ground. Any slot can take a `stride` option in `anim-assignments.js`.

## Astral Blast + lock-on

- **Astral Blast:** ○ (F on keyboard) on foot. Rizer casts with the 1H magic attack clip. At the moment his hand thrusts out, a blue energy bolt leaves it, flies at 30 units/s and homes on the locked enemy. With nothing locked, it homes on the nearest Seer roughly ahead. A hit deals 2 damage and knocks the grunt back. The bolt bursts on Seers, the ground and walls, and fizzles after 42 units. Tuning: `ASTRAL.blast` in `astral.js`.
- **○ is contextual:** facing a place, it interacts. Locked on a Zyrex within 8 units, it bonds (placeholder until the bond system exists). Otherwise it casts Astral Blast on foot. In the UFO it fires the laser at a locked Seer or Mori. Free flight is traversal-only.
- **Lock on:** R3 (R or middle click). It locks to the nearest Seer, Mori, closed chest, or wild Zyrex within 30 units, and pressing it again releases. A red ATTACK, gold BOND, or LIFT marker floats over the target, the camera frames it from behind Rizer, and Rizer keeps facing it while walking (hold R2 to run freely). Punches, kicks and blasts aim at enemies. The lock drops if the target goes down, a chest opens, or the target gets beyond 42 units. A Zyrex that is locked for bonding lets Rizer walk right up to it; only sprinting spooks it. While locked, flick the right stick left or right (Z / V) to swap to the next target in that direction on screen; the stick doesn't orbit the camera while locked.

## Coordinates panel

The POSITION panel on the left of the HUD shows Rizer's live X / Y / Z, facing and region. Click it (press Esc first if the mouse is captured) to copy a placement line like `{ x: -31.64, y: 1.91, z: -1.71, facing: 0.64 } // Malezor Square`. Paste it straight into asset placement code. `facing` is in radians, in the same convention as `rizer.facing` and `W.playerStart.facing`. The line is also logged to the console as `[RP7D coords]`. Toggle the panel in Zyphone → Options.

## Pick-ups

Nothing ever just appears on Rizer. The first time he picks the Basic Sword up from the chest, the grip closes in his hand, and when the pick-up ends he stands and plays the full Sword Put Away clip. The blade moves from hand to hip at the clip's scabbard frame. He holds still for it, and a punch or kick cuts it short. (A backpack for other items is coming.)


Rizer steps up so the item sits where his hand closes in the pick-up clip. The Basic Sword hovers at that grip height. In the last 0.22 s before the grab frame, the sword's grip locks to his right-hand grip. It then rides in his hand for the rest of the clip and is sheathed at the hip. Tuning: `COMBAT.pickup` (`reach`, `grab`) in `rizer.js`, and the hover height (`rest.y`) in `loot.js`.

## Astralvision

L3 + R3 together (B on keyboard) fires Astralvision, Rizer's holographic scan. A blue wall of light sweeps out from him to 90 units, with a blue tint and scanlines washing over the screen. Anything registered as loot or a quest target glows through walls as a blue hologram (quests will use gold) once the wave passes it. It also gets a floating tag with its name and distance, and a pulsing blip on the minimap, pinned to the rim when it's off the map. Marks last 8 seconds. The cooldown is 10 seconds, shown by the AV badge beside the weapon wheel. Pressed alone, L3 and R3 still crouch and lock on; a single press waits 120 ms to see whether the other stick joins it. Current targets: the Rizer's chest and the Basic Sword once it's out. Quests register with `av.register({ id, kind: 'quest', label, pos, object, active })`. Tuning: `ASTRALVISION` in `astralvision.js`.

## The Rizer's chest + Basic Sword

- **The chest** sits in the first open spot a few steps off Rizer's doorstep: dark navy wood, gold bands, a sapphire lock gem. ○ / E opens it: the lid swings up, gold light spills out, and the Basic Sword springs out, spins and settles hovering at hand height in front of it.
- **Take it** with ○ / E: Rizer steps in and plays Picking Up. At the grab frame the sword leaves the air and goes onto his left hip, sheathed.
- **Weapon wheel** (bottom left): bare hands are the default. R1 / L1 cycle through every weapon you've collected (Q cycles and 1–2 pick directly on keyboard), and Zyphone → Weapons equips too. Drawing plays Sword Take Out, and the blade moves from hip to hand at the grab frame. Going back to fists plays Sword Put Away and re-sheathes it. Moving, jumping or attacking finishes a draw or sheathe at once.
- **Sword combat:** with the sword drawn, □ swings (Sword Slash; press again to chain slashes). A swing does 3 damage (split across the clip's blows), and the blade itself is the hitbox, so the long edge reaches further than a fist. A blue-white trail follows the blade. Assign more clips to Sword · combo 2–4 in the Anim Lab to build a longer chain. Tuning: `COMBAT.sword`, `COMBAT.draw`, `COMBAT.sheathe`.
- Owned weapons, the equipped weapon and the chest's state are remembered in the browser (`rp7d.inventory.v1` in localStorage).

## Mori

Malezor's tier-1 undead (canon: common grunt, Malezor roster). Six Mori shamble the wild edges: the west woods, the marsh, the highland and the north woods. They're further from home than most Seers.

- **Look:** built from the reference image on the shared rig (`assets/mori/build_mori.py` → `mori.glb`). Gaunt and bald, with grey-green skin stretched over visible ribs, a sternum ridge and scars. Sunken dark sockets with pale pupils, hollow cheeks and a jaw hanging open. Long thin arms, knobbly elbows and curled clawed fingers. A tattered dark waist-wrap with hanging flaps over torn trousers cut ragged at mid-shin, and bare feet.
- **Fighting:** the same contact system and combo AI as the Seers, set by `MORI` in `seers.js`. They have less health (9 against 15) and are slower (walk 1.25, run 3.6, clips at 0.72×). Their zombie punch deals 9 damage and their kick deals 12; punches are more common than kicks. Their combos are mostly 1–2 hits. The wind-up is longer (0.45–0.75 s), they turn slower mid-swing, and they swing at air more often. Mori and Seers only call their own kind for help.
- **Clips:** the Mori pack supplies Zombie Idle, two alternating zombie walks, Zombie Running, Zombie Punching, Zombie Kicking and Zombie Dance. Dance is assigned to the emote slot for preview and future behavior. The FBX files live in `assets/anims/mori/`; assignments are in `anim-assignments.js`.
- **Adding more enemy types:** add a block like `MORI` to `ENEMY_TYPES` with its own `url`, `key` (its animation set) and `patrols` (a list in `world-data.js`).

## Seers

Ten Seer grunts patrol the roads (`seerPatrols` in `world-data.js`; tuning in `SEER` at the top of `seers.js`). Each has 15 health, so it takes about three full punch combos, or one to two sword combos, to drop one.

- They see in a forward cone: 17 units by day, 11 at night. Terrain and buildings block sight, and anything within 3.5 units is noticed.
- On spotting you they raise a "!", call grunts within 14 units, then chase and fight with punches and kicks. Only two attack at once; the rest wait nearby.
- They give up after losing sight for 4.5 seconds, or when you get 32 units away or drag them too far from their route.
- They fight with the same 4-stage punch and kick combos as Rizer (the same clips, played at 0.9× speed). Before each combo they plant and square up for 0.28–0.5 s: that's the tell. Each combo runs 1 to 4 stages (a 2- or 3-hit string is most likely). A punch deals 5 and a kick 8, with the same 1.5× and 2× for stages 3 and 4. Mid-combo they re-aim slowly (2.6 rad/s), so side-steps and rolls beat them. 30% of the time they keep swinging after you've left. They rest 0.9–1.9 s after a combo.
- They're the baseline enemy, with no special moves. The one extra rule: after five or more blows in a row they shake off the stagger faster and may swing straight back, so endless mashing gets answered. A jab that lands while their own blow is already coming through doesn't stop that blow (you trade). While one grunt is on you, the others work round to your sides.
- Grunts have 15 health. A downed grunt respawns on its route after 40 seconds, once you're away.
- Tuning is all in `SEER`: `hp`, `punch`/`kick` damage and `range`, `comboLength`, `clipSpeed`, `windup`, `turnRate`, `whiff` and `cooldown`. The next enemy type (Mori: less health, slower, more damage per hit) is a copy of this block with different numbers.
- You have 100 health. **Meters:** health never regenerates (fruit only). Stamina regenerates slowly (5/s) once you've gone 1.2 s without high output: running, flying, rolling, sliding, blocking, striking, vaulting or being in the air. Astral energy charges up from landed melee blows: +1 / 1.5 / 2.5 / 3.5 by combo stage, +3 more on the finisher; Astralstrike blasts and arrows don't charge it. Fruit refills any of them (gold = stamina, red = health, purple = astral energy, white = all three), and waking after a knock-out refills everything. The rates live in `COMBAT.regen` (rizer.js), ready for the archetypes and perks of the Rizer build. At 0 you're knocked out and wake up at home; the Seers stand down.

## Contact combat (hitboxes)

Every hit is real contact between shapes, not a range check.

- **Poly-bound capsules:** `hitbox.js` measures each character's own mesh once. Every vertex joins the body part its strongest skin weight belongs to: hips, three spine segments, neck, head, upper arms, forearms, hands, thighs, shins and feet. Each part gets a capsule fitted to those vertices, radius at the 82nd percentile. The capsules ride the bones every frame, so they follow the animation exactly.
- **Blows:** a blow lands only when the striking limb touches the other body while it's moving at least 2.2 units/s relative to the attacker's hips. The striking limb is fist + forearm for punches, shin + foot for kicks, and the blade for the sword. The limb also has to be inside a contact window around one of the clip's analysed impact frames (0.2 s before to 0.14 s after). Fast swings are tested at the halfway pose too, so they can't pass through. Each blow hits each target once. Knock-back goes the way the limb was travelling, harder the faster it moved. Mid-combo blows rock the target, and the finisher's last blow sends it flying.
- **Aim assist:** when Rizer strikes at a Seer up to 3.2 units in front of him, he's carried in to contact distance before each blow, so combos stay connected without the old generous reach.
- **Bodies:** torsos (hips to chest capsule) can't overlap. Rizer and a Seer shove each other apart (the Seer takes 55%, Rizer 45%), and grunts keep a little space between them. Bodies now stand about 0.55 apart instead of 1.15.
- **Being hit:** after a hit, Rizer's 0.7 s recovery shields him from everyone else, but not from the rest of the same Seer's combo, so combos land and two grunts can't stun-lock him together.
- **Recentred bodies:** the character rigs were exported with the hips about 0.41 in front of the model origin, so every body was drawn half a unit ahead of its collision point. `Actor` now centres the hips over the feet point.
- **See them:** Zyphone → Dev → Show hitboxes draws the capsules in green on Rizer and nearby Seers. A limb turns red when it's moving fast enough to hurt.
- Tuning: `HITBOX` in `hitbox.js`, `SEER.assist` in `seers.js`.

## The Zyphone

The touchpad (Tab on keyboard) opens the Zyphone: Rizer's phone, the game's menu and hub. The world pauses while it's open.

- **Map**: the district map, with places found per region.
- **Time**: the world clock advances at real time: one real minute equals one in-game minute, so a full lighting cycle lasts 24 real hours. Preset skips to dawn, midday, afternoon, golden hour, dusk or night appear only while Developer Mode is enabled.
- **Field Notes**: every place you've discovered, with its note.
- **Rizer**: health, Seers defeated, places found, and the character switch.
- **Controls**: the full keyboard and controller list.

## Performance (outdoors)
- **Chest lights:** there are no per-chest point lights. One shared light (`createChestLight`) sits on the brightest glowing chest near Rizer. Each point light is paid for by every lit pixel, and 46 chest lights were what made outdoors slow.
- **Enemies:**
  - Not drawn when off-screen (camera-frustum check) or more than `WILD.visible` (85) away.
  - Cast shadows only within `WILD.shadows` (35).
  - Far ones patrol cheaply and animate every third frame.
- **Chests:** wooden chests aren't drawn beyond 70 units.
- **Collision:** the mass-grid warm-up budget is 3 ms per frame.

## Armory · one weapon on the waist
- The Zyphone tab is now **Armory**. It shows the weapon wheel's six slots around what's equipped, and every weapon Rizer owns.
  - **Mouse:** drag a weapon onto a slot, drag a slot onto a slot to swap, or drag a slot back onto the list to take it off the wheel.
  - **Pad:** ✕ picks up the focused weapon, ✕ on a slot drops it, ○ cancels, □ equips.
  - **Keyboard:** Enter picks up / drops, Esc cancels, E equips.
  - Fists can't leave the wheel.
- `inventory.wheel` holds the 6 slots (null = empty). New weapons fill the first empty slot. L1 / R1 (Q) cycle the filled slots, and 1–6 pick a slot directly.
- **Axe handling:** the axe has its own take-out / put-away clips (`drawAxe` = Unarmed Equip Underarm, `sheatheAxe` = Standing Disarm Underarm; `COMBAT.drawAxe/sheatheAxe` grab frames 47% / 35%). Its stowed spot is captured from the exact frame the hand lets go, as a Hips-local transform (`MOUNTS.axe.stow.local`), so the hand-off has no pop. Any weapon can get its own pair the same way (`draw<Weapon>` / `sheathe<Weapon>` slots).
- **Waist:** Rizer carries exactly one visible weapon — the one in hand, or `inventory.hip` (the last weapon put away) on his hip when unarmed. Everything else rides in the bag. Both the Tearsword and the Jaded Axe mount at the hip.

## Combos · no mashing, every hit plays out
- This applies to punches, kicks, Astral Blast, the Tearsword and the Jaded Axe.
- All attack clips play `COMBAT.attackSpeed` (1.2×) faster; the kick-4 overdrive stacks on top.
- Every hit plays its whole clip. The axe's long idle tail is still trimmed to 0.7 s after its last blow.
- A press only counts once the current hit has landed; presses before that are ignored. That press queues the next stage, which starts `COMBAT.comboBlend` (0.12 s) before the current clip ends, so the chain flows.
- After a hit ends, a press within `comboWindow` (0.5 s) still continues the chain.
- A different attack waits for the current one to finish. A dodge roll or slide can still cancel.
- **Kick 4 (backflip) overdrive:**
  - It plays 30% faster, so it connects sooner (`COMBAT.kick.stageSpeed`).
  - It deals 1.75× damage and 1.9× knockback (`COMBAT.kick.overdrive`).
  - On contact: a bigger blue-white burst, a harder camera shake, a longer hit-freeze and the heavy impact sound.

## Running attacks, chains through rolls, combat running
- **Running attacks:** running (R2 held, or moving faster than 6 u/s) turns an attack into its own one-off move. Neither is part of the four-hit chains.
  - △ → **flying kick** (`flykick` = Flying Kick). Heavy impact.
  - □ → **running punch** (`runpunch` = Punch To Elbow Combo, fists only; with a weapon out, □ still swings the weapon). It starts at 1.3 s into the clip (`COMBAT.runpunch.from`), skipping the opening plain jab so it goes straight into the lunging punch-to-elbow.
  - "Running" allows 0.3 s of grace (`runGrace`), so a press just as R2 lifts or a stride leaves the ground still counts.
  - Both carry the run's momentum into their first blow (`COMBAT.flykick/runpunch.carry`).
- **Chains through rolls and slides:** rolling or sliding mid-combo, or just after a hit, keeps the chain. The next press after the roll or slide continues at the next stage (e.g. punch → roll → punch 2 → slide → punch 3). See `keepChain()`.
- **Running while locked on** uses the real run cycle. The fight stance fades out as the run blends in, and stays for standing and walking.

## Block (R2 + L2 · Shift + C)
- Standing still with the stick at rest, hold R2 and L2 together (both for 0.12 s) to raise a guard. It plays the `block` loop (Standing Block Idle).
- Hits from the front (about a 110° arc each side, `COMBAT.block.arc`) glance off. You take 15% of the damage, get a small push, and hear a light clack and see sparks instead of the hurt flash. Each blocked hit costs 8 stamina.
- With no stamina left, the guard breaks and the hit lands in full.
- Hits from behind land normally. You can't move or attack while blocking; releasing either trigger drops the guard.
- A quick L2 tap still rolls. Holding L2 while moving still slides.

## Astralthunder (lock on + d-pad ↓ · T)
- While locked on an enemy, d-pad ↓ is Astralthunder (with no enemy locked it's still the emote); d-pad → is free. Rizer plants and plays `thunder` (Astralthunder_Lock_Down: hands up, then a slam down). The forked bolt drops from about 38 units up onto the locked Seer or Mori on the slam (`ASTRAL.thunder.strikeClip`, 0.98 s on the clip); the cast still spans 2.5 s.
- It deals 6 damage and a long stagger. Anything within 2.6 units takes 3 splash damage. It costs 30 astral energy (`ASTRAL.thunder`).
- On impact: a sky flash, a big spark burst, a hard camera shake, a hit-freeze, and the heavy impact sound layered with a low blast.
- **Struck enemies are electrocuted** (`shocked` slot = Being Electrocuted, on Seers and Mori). The clip lasts about 5.5 s and ends on the ground, with static sparks and small blue flickers crackling over them the whole time. Survivors then play Standing Up (the Astralift recovery) and rejoin the fight. Anyone the strike kills stays on the ground in the electrocution's final pose. Splash victims are electrocuted too (`seers.shock()`).
- **Lights:** blast bolts and the thunder flash use pooled lights, never added at runtime. A change in the light count recompiles every material and causes a hitch; the old per-bolt light did exactly that.

## Astralburst (lock on + d-pad ← · Y)
- Needs a locked Seer or Mori, like Astralthunder, but it hits everything around Rizer. He plants and plays `astralburst` (Standing 2H Magic Area Attack 02).
- While he crouches and gathers it (from 0.35 s), lightning crackles over his whole body: sparks crawl his limbs, arcs jump limb to limb, and a flickering blue glow builds toward the release.
- At the release (arms flung wide, about 1.38 s on the clip) it explodes from around his body: a flash, a ring of light racing out over the ground with a glowing dome, ten lightning arcs thrown out along the ground, and a bolt to every enemy caught.
- Everything within 7.5 units is **blasted up and away**: a bigger Astralift for the whole area (`seers.blastBack()`, `BLAST` in seers.js). Each body leaves at its own angle, up to ±0.6 rad off the blast line, and flies 3.4–5.2 u high and 11–17 u out (closer means harder). Each is turned a little off-square and twists in the air, so a crowd scatters instead of flying out in a ring. Blastback follows the flight, they land on their backs, then get up with Standing Up. Anyone it kills is thrown the same way and lands where the arc ends. It deals 5 damage close in, down to 3 at the edge, and costs 40 astral energy (`ASTRAL.burst`).
- Hard camera shake, a hit-freeze, the thunder sound layered with a heavy impact, and a strong rumble. Its light is one of the pooled bolt lights plus the thunder flash, never an added light.

## Psychosyd's Signed Red Guitar (□ with the guitar equipped)
- **Where:** a silver chest in Malezor Square, on the west side of the fountain (`psychosyd-chest`). Open it with ○; the guitar springs out and you take it like the mythic weapons. It goes on the weapon wheel, where L1 / R1 equip it. Dev › Give Psychosyd's Signed Red Guitar also adds it.
- **The guitar:** cherry-red double-cutaway electric (`buildGuitar` in loot.js). It has a white pickguard, three pickups, a dark neck, six silver strings and a gold signature.
  - Equipped: slung across his back.
  - Carried: by the neck, body down.
  - Playing: held across his hips (`MOUNTS.guitar.play`).
- **□ plays the solo:**
  - Rizer plays `guitarPlay` (Guitar Playing, looped) to `song-beat-it-solo.mp3`, played through `sfx.track('solo')` from `assets/audio/sfx/guitar_solo.mp3`.
  - The soundtrack ducks under it (`music.duck`).
  - Red and gold notes drift up around him.
- **Everyone in earshot dances:**
  - Every Seer and Mori within 24 of him stops (patrolling, chasing, even mid-swing), turns toward him and dances in place until the song ends.
  - Mori dance to Zombie Dance.
  - Each Seer picks one of the dance-pack loops (the `dance` slot's variants: Rockstar Hips, pop lock, gyat and guy dances, Flair, cheer, kid dance…) on its own beat.
  - This is `seers.setMusic()`, and townsfolk join the same way once NPCs return.
- **Hitting a dancer:** it snaps out of it for the rest of that song.
- **When it ends:** at the end of the song (≈35 s), or when you press □ again, move, jump, strike or take a hit. The dancers then go back to what they were doing, chasing if they'd spotted him or back to their route if not.

## Pearlbow of Ivirium (□ with the bow equipped)
- **Tap □** plays the whole shot at a readable pace: Draw Arrow (reach to the quiver, load, raise to full draw) and then Shoot Bow (loose and follow-through). The arrow leaves on the loose frame.
- **Hold □** stops at full draw and plays Aim Bow (Aim Bow Walking while moving) until □ is released, then looses.
  - The longer he holds at full draw, the harder the shot: `BOW.fullHold` is 1.6 s to full power.
  - Power (`BOWSHOT` in pearlbow.js) raises speed (36→78 u/s), reach, damage (3→8) and knockback.
  - Sparks at the grip brighten as it charges, with a flash at full power.
- **It loops.** Shoot Bow ends on Draw Arrow's first pose, so pressing □ during or after a shot flows straight into the next draw.
- A locked or in-front enemy is tracked through the whole draw and aim. The loaded arrow sits on the string, from the draw hand to the grip, from the moment it leaves the quiver until the loose.
- **Sound:** `whoosh_1.mp3` (`LEVEL.whoosh` 0.8) plays on the loose. Stronger shots are a little louder and lower.
- **Held orientation:** the bow's hand mount is solved in the Aim Bow pose (`MOUNTS.bow.hand.local` in loot.js). The limbs stand upright, the string faces Rizer, and the grip sits in the left palm.
- Standing still, the bow clips play at full weight. On the move, draw and loose ride over the walk.

## Astralift (lock on + d-pad ↑)
- Cast with Standing 1H Magic Attack 03 (crouch, then the right hand thrusts up). The lift lands on the thrust (`ASTRAL.lift.release`, 0.8 s) and costs 18 astral energy, only when something valid is locked.
- Lightning erupts from the ground around the target and runs up into its legs, with a spark ring and a flash. A locked Seer or Mori takes 2 damage and is thrown up and back like light telekinesis: a real arc about 2.3 u high and 7 u back, about a second in the air (`LIFT` in seers.js). Blastback's airborne frames follow the flight, so its back hits the ground as they land. Static crackles over them the whole way, then they lie there and get up (Standing Up). A locked closed chest bursts open.
- Sound: `lift_1.mp3` (a lightning crack, `LEVEL.lift` 0.85) starts 0.25 s before the lift lands, so its crack peaks on the jolt.
- All three lock-on d-pad moves (Astralift ↑, Astralthunder ↓, Astralburst ←) are electric.

## Running vault (run + ✕ at a low obstacle)
- **Trigger:** while running (R2 / Shift held), press ✕ with a waist-high obstacle ahead (a fence, a gate, a boulder, furniture) and Rizer vaults it with `vault` (Running Vault).
- **Checks** (`startVault` in rizer.js, `COMBAT.vault`), probing along his run in three lanes:
  - the obstacle is solid at knee height but free at 1.12 hip heights, so up to about 1.4 m (a paddock fence is 1.35);
  - it's no deeper than 1.8;
  - there's 1.1 of clear ground beyond it to land on, at about the same level.
- **What happens otherwise:**
  - Anything taller, deeper, blocked beyond, or nothing at all: ✕ is a normal jump.
  - Pressed early (the obstacle is up to 7 ahead but still out of reach): the press is held for up to 0.4 s and the vault starts as soon as it lines up.
- **The motion:**
  - The clip starts from the frame that puts his body over the obstacle's middle at its peak (0.73 s), however far away you pressed.
  - He's carried along the clip's own hip path at your running pace (clip speed 1–1.6×), committed to the line he started on.
  - Collision is off only while he's over it (0.32–1.17 s on the clip).
  - Take-off dust on the jump; a landing thud at touchdown (1.13 s).
  - He lands, runs out, and control returns at 1.62 s, blending into your run if you're holding the stick.
- Strikes and dodges are ignored mid-vault.

## Kick-up combo (run + △△)
- While running, press △ twice: the first starts the flying kick, and a second △ within 0.35 s turns it into the kick-up (`kickup` = Kick Up Combo). He dives to his hands and throws an inverted kick (the blow lands at 0.66 s on the clip, 5.5 damage, heavy knockback), rolls, kips up and runs on.
- His body follows the clip's own forward path (`KICKUP_Z`), eased in from the run's speed. He's committed to the line he started on, so he can't be turned around mid-move. Holding run, he's straight back into the sprint.

## Knocked out: the hospital and the Zycube
- **Respawn:** when Rizer is knocked out (health 0 in a fight, or a fatal bail), the last 0.8 s fades to black. He comes back walking out of Malezor Hospital's front door, healed with full health, stamina and astral energy. It's the tail of the door walk (`exitDoor` from `DOORWALK.switchAt`): already through the doorway, he pulls the door shut behind him and the door follows his pull. The hospital door is a live hinge like Rizer's home (`hospitalDoor` in props.js). The screen fades back in as he steps out.
- **The Zycube** is Rizer's internal inventory: items, coins and gems. When he's knocked out it drops where he fell (zycube.js). It's a floating holographic cube with glowing ice-blue faces and a white circuit sigil, standing on a corner, bobbing and turning above a ring of light, with a faint beam rising from it. His items, coins and gems are empty until he gets it back. Dying again before recovering it moves everything into the new drop. Weapons stay with him.
- **Tracking it:** every Astralvision pulse (AV · L3 + R3 / B) marks the Zycube at any distance, with an on-screen tag, distance and a minimap blip pinned to the rim when it's off the map. It's never shown otherwise.
- **Recovering it:** walk up to it; a "○ Zycube" prompt shows, and ○ (E) takes it back and restores everything. Until then there's nowhere to carry anything new: fruit is still eaten when it would boost something, but can't be stored, and loot bags can't be taken. The Zyphone Items tab says the Zycube is lost and what it holds. Saved with the inventory (`inventory.zycube`), so it survives a reload.

## Loot pickups (○ · E) and the Items tab
- **○ near loot picks it up; otherwise it interacts or casts Astralstrike.** Loot is anything lying in the world that ○ can take: the wild fruit in the grass, and the bags defeated Seers and Mori drop. A "○ Red Fruit"-style prompt shows when one is in reach. Loot wins over an interact prompt unless the prompt's target is closer.
- **Works mid-fight:** loot bags can be picked up while enemies are engaged. They used to be hidden with the other prompts during a fight.
- **Running** (above 4.5 u/s): he scoops it without stopping (`runpickup` = Pick Up Item). He keeps his pace, steers so the item passes his right hand, and takes it at the scoop (0.3 s, `COMBAT.runPick`). **Walking or standing:** he walks up and picks it up (Picking Up); bags use Store Item.
- **Wild fruit** (nature.js, `ITEMS` in loot.js): round fruit resting in the grass all over Malezor (2,200, colours in loose patches). Each colour gives a small boost to its RHUD meter when picked up:
  - Gold: +10 stamina (the most common, about 48%)
  - Red: +6 health (about 30%)
  - Purple: +8 astral energy (about 16%)
  - White: +15 health, stamina and astral energy (rare, about 7%)
- If every meter a fruit boosts is already full, it goes into the bag instead. Eat it later from Zyphone → Items (✕ / Enter / click); eating only happens if it would boost something. Picked fruit stays picked across sessions (`inventory.picked.flowers`). Old flower items in a save convert to fruit.
- Fruit sits on the ground: on slopes it rests against the high side, and on steep ones it sits into the slope.
- **Items** (`ITEMS` in loot.js, counts in `inventory.items`): the Zyphone's new Items tab lists everything carried that isn't a weapon, by kind: Consumables, Materials, Key Items. Fruit are Consumables. Coins and gems from bags go to the wallet, and the HUD counter now updates when you collect one.
- Next: coins, gems and other loose loot scattered in the rural areas, as if lost, will use the same pickup.

## Dodge roll / dodge slide (L2 · C)
- **Tap** L2 (or C) to roll. **Hold** it for 0.2 s (`COMBAT.slide.hold`) to do a running slide (`slide` slot = Running Slide). The slide covers 7.4 u, costs 10 stamina and gives no damage while sliding, like the roll.
- A tap is decided on release, so the roll starts the moment you let go. In flight, L2 still means descend.

## Fast dive landing (flying: R2 held + L3)
- Press L3 while flying with R2 held and he dives: straight down at 16 u/s in the Fast Controlled Fall pose (`fastfall`), with sideways speed capped at 13 (`COMBAT.dive`). L3 without R2 is still the slow float down and the regular big landing.
- At the bottom he lands with the rolling Fast Controlled Landing (`fastland`). The clip starts in the air, timed so its touchdown frame meets the ground. After touchdown his body travels the clip's own forward roll path (`ROLL_Z` in rizer.js, about 3.3 u), with collisions on, until he's on his feet at 1.33 s. Then moving walks him out of it.

## Flight bail (out of stamina mid-flight)
- Flight drains stamina. If it runs out while he's flying, he drops out of the sky flailing (`bail` = Flight Bail, looped). He keeps his momentum with no steering, and controls are locked.
- Near the ground the impact clip (`bailImpact` = Flight Bail Impact) is steered so the body hits the ground at its 0.33 s frame. He's slammed flat and takes fall damage by the height he fell from: (height − 3) × 3, at least 6 (`COMBAT.bail`). That's about 27 from 12 u, 51 from 20 u, and fatal from about 36 u up.
- **Ground contact:** the impact clip keeps its whole drop to the floor (anim-lib `FLOOR`), so he lies on the ground rather than a body-height above it. It's timed against the ground where his drift will land him, not the ground straight below, and adjusts both ways as he falls. If the ground drops away he goes back to flailing. Lying on a slope, his body tilts to the ground under him (`lieTilt`).
- Survived: he lies there 0.7 s, then gets up with Standing Up (`standup`) and control returns. Health 0: he stays down in the impact pose, KNOCKED OUT (Rizer fell from the sky), then wakes up at home.
- On impact: a heavy crash, a big dust burst, a hard camera slam, a hit-freeze, the hurt flash, and a heavy rumble (thunder-strength for 40+ damage).

## Flight: hover vs. fly, wind
- In the air, standing still (under 1.2 u/s, counting climbing and sinking) plays the **float** clip. Moving plays **fly**. The two crossfade. L3 auto-land and landing work as before.
- `wind.mp3` loops low (`LEVEL.wind` 0.32) only while he's actually flying somewhere (over 2 u/s). It fades in over about a second and out over about 1.5 s, slightly louder at boost speed, and is silent while hovering. It resumes where it left off, like the footstep beds.

## Astral Blast sound
- ○ Astral Blast / Astralstrike plays `blast_1.mp3` as the bolt leaves the hand (a touch louder on the two-hand stage 3).

## Run cadence
- Rizer's run (R2) cycles 14% slower than the clip's natural pace at the same ground speed (`RUN_CADENCE` in rizer.js; `actor.cadence` scales a slot's stride length). Lower it to slow the legs further.

## Walking sound
- `walk.mp3` is one long recording (about 18 s) that loops while Rizer walks.
- When he stops it fades out and remembers where it was, then picks up from there next time. It never restarts at its first step.
- Silence at either end is trimmed from the loop, so the seam is seamless. The run bed works the same way.

## Mythic weapons · Tearsword of Azurel and Jaded Axe of Emeralix
- Two mythic weapons, each tied to a Gemlord. For the playtest both sit in **silver chests side by side** by Rizer's home; they'll be harder to earn later.
  - **Tearsword of Azurel** (`sword`, formerly the Basic Sword): azure fuller and a teardrop sapphire pommel. It stows at the hip. Its combo is Sword Slash → Sword Slash 2 (`sword`, `sword2`). Adding `sword3` / `sword4` clips extends the chain automatically.
  - **Jaded Axe of Emeralix** (`axe`): heavy double-bladed war axe built after the RP7B sprite. It has emerald crescent edges on a moss-green head, a gold-caged emerald heart, a top spike and an emerald spike pommel (`buildAxe()` in loot.js). It stows across the back, head over the right shoulder.
- **Axe combat:**
  - Combo slots are `axe`, `axe2`, `axe3` and `axe4` (Axe 1 Light Swing → 2 Heavy Swings → 3 Double Slash → 4 Heavy 360 Swing).
  - `COMBAT.axe`: 5 damage per stage, split across the clip's blows. The stagger and knockback are the biggest of any weapon, and the swing trail is green.
  - The clips carry long lead-ins, so a swing starts `lead` 0.6 s before its first blow and ends `tail` 0.7 s after its last.
  - Stage 4 adds a procedural 360° body turn through the swing (`COMBAT.axe.spin4`). The supplied "360" FBX is the same motion as Axe 1 shifted by 0.1 s. Replace `rizer/Axe_4_Heavy_360_Swing.fbx` with the intended clip, then set `spin4: false`.
- **Weapon wheel:** fists / Tearsword / Jaded Axe, cycled with L1 / R1 or Q. Going from blade to blade puts the one in hand away (sheathe clip), then draws the next.
  - `rizer.weapon` is what's equipped, `rizer.handWeapon` is what's in hand, and `rizer.swordAt` is whether it's drawn.
  - `createHeldWeapons()` mounts every owned weapon: in hand, or stowed on the body. The drawn weapon is stowed while swimming.
- **Contact:** the drawn weapon is a capsule. The sword blade uses r 0.04; the axe head uses r 0.36.

## Water · float, tread, swim
- Still water plays `float`, moving plays `swim` (Treading Water), and sprinting (R2 / Shift) plays `swimrun` (Swimming, in place).
- The three crossfade by speed. The stroke takes over at 2.2–3.0 u/s.
- The body is placed from the pose so the water line sits at the neck. The horizontal stroke lies at the surface.

## Sound effects
- `sfx.js` plays the effects through Web Audio. The files live in `assets/audio/sfx/`, and the build inlines them.
- Sounds:
  - `walk.mp3` ("quiet run") is looped while walking or sneaking. Sneaking plays it at 45% volume.
  - `run.mp3` ("loud run") is looped while running.
  - The two loops crossfade, and they're silent in the air, while swimming and during a roll.
  - `impact_light_*`, `impact_medium_*` and `impact_heavy_*` play when a blow connects.
    - Rizer's blows: opening punches are light, the chain builds to medium, and kicks from stage 3, finishers and knockouts are heavy.
    - Enemy blows on Rizer go by damage: under 5.5 is light, under 10 is medium, 10+ is heavy.
    - Astral Blast hits are medium, or heavy on a knockout.
  - `miss_*` plays for any blow — punch, kick, Tearsword or Jaded Axe — that touches nothing within 0.16 s of its blow frame (one whiff per blow in multi-hit clips).
  - `land_*` plays for any landing.
- To add a variant, drop in `impact_light_3.mp3` (for example) and list it in `SFX_FILES`. Leading silence is skipped automatically.
- Options has **Sound effects** (on/off) and **Effects volume**, saved in `rp7d.sfx.v1`.

## Chests and auto-walk
- One standard chest size (`CHEST` in loot.js), two finishes:
  - **Silver (uncommon):** Rizer's chest by his home, holding the Basic Sword and no coins.
  - **Wooden (common):** 44 around Malezor, 8 in Central and 36 in the wild. Each holds 1–100 coins, rolled when opened. They open once; which ones are open is saved in `inventory.chests`.
- The sealed quest chests are removed from world-data.js.
- Rizer never slides into an interaction.
  - `rizer.walkTo(spot, face, then, { around })` walks him at normal walking pace to the spot, round the chest if it's in the way. He turns in place, then acts.
  - `pickUp` uses it too, so the sword and loot bags are walked to before the pick-up clip.
  - Pushing the stick cancels the auto-walk.
- NPCs are on hold. `npcs.js` isn't loaded, and Mom and Yara in the home are off (`NPCS_ON_HOLD` in home-interior.js). They come back on new canon meshes.

## Collision · every solid thing blocks
- `massgrid.js` builds a 0.25 m collision grid straight from the rendered meshes of `world.structures` and `world.nature`. It works in 16 m chunks, which are built lazily and pre-warmed around Rizer each frame.
- A cell is solid when geometry sits 0.4–1.9 m above the floor under it. The floor is the terrain or any walkable surface (roof, stair, deck). Each cell also stores the mass's top, so jumping or flying over it stays free.
- Small enclosed pockets are filled, e.g. the inside of a trunk or rock, or the middle of a bush.
- `world.resolve(p, rad, { stealth })` pushes out of the hand-placed boxes and circles first, then out of the grid. Rizer sub-steps his move, so a fast flight can't tunnel through a thin rib or post.
- Bushes are a soft layer: solid when standing, but a crouched Rizer can push in. Crouched inside one he is **hidden** (toast), and Seers and Mori can't see him unless they bump into him.
- Opt-outs: `userData.noCollide` (grass, flowers, reeds and the UFO). Bush layer: `userData.soft`. Band cap from the mesh's own base: `userData.massHi` (broadleaf 1.1, willow 0.7, so canopies are overhead and only the trunk blocks).
- Tune it in `MASS` (massgrid.js).

## The Seers' choke hold · wild packs
- Outside Malezor Central, 28 Seer handlers each herd a pack of 4–5 Mori on a patrol loop.
  - With the hand-placed road patrols, that's 35 Seers (5×) and 120 Mori (20×).
  - Placement is seeded, off water and cliffs, clear of buildings, 24 units apart, and at least 40 tiles from Rizer's home.
- Pack Mori walk in formation behind their handler. The handler walks at Mori pace.
- When any member spots Rizer, the whole pack comes, up to 30 units away. Only two enemies swing at once.
- If the handler falls, the Mori keep walking his route.
- LOD:
  - Full AI and collision within 70 units.
  - A cheap patrol, animated every third frame, out to 125.
  - Hidden beyond that.
  - Anything already chasing stays on full AI.
- Tune all of this in `WILD` (seers.js).

## Landing and title HUD
- Landing from flight plants Rizer where he touches down: no slide. Horizontal velocity is zeroed and he's locked for the landing clip (big landing, or a 0.4 s `land`), then control returns.
- No HUD on the title screen. `beginPlay()` adds `#game.playing`, and every child of `#game` except the canvas, vignette, title and loader stays hidden until then.

## Title screen · New Game / Load Game

RP7D opens on the Rizing Power 7 Deluxe key art (`assets/ui/title.jpg`, embedded in the single-file build). **New Game** and **Load Game** sit under the logo.

- **Controls:** mouse; ↑ ↓ / W S and Enter / Space on the keyboard; D-pad or left stick and ✕ on a DualSense.
- **Load Game** continues from the last save. It is greyed out until one exists, and it shows where and when you saved. A returning player's cursor starts on it.
- **Saving** is automatic, every 5 seconds and whenever the tab closes or hides. It records Rizer's position, whether he is at home, and the time of day, in `rp7d.save.v1`. Inventory, settings and music keep their own keys.
- **New Game** when a save exists asks for a second press. It then clears the save and the inventory and reloads straight into a fresh wake-up.
- **Music** does not play on the title screen. It starts when a game is started or loaded. After a New Game reload, Chrome only lets it start on the first button press.

## HUD · one system, four panels

The HUD shares the Zyphone's look (glass panel, gold rail, `ZY·LINK` mark), so it reads as the phone's live surface. Clicking a panel opens its Zyphone page. **Move UI** (on the minimap header) still lets you drag and pin any panel.

- **ZHUD** (top left): the partner Zyrex, with portrait disc, name, level, HP and Astral meters. It shows an empty "No partner" state until bonding exists (`hud.setPartner({ name, type, lv, hp, maxHp, ap, maxAp })`). Its footer counts wild Zyrex within 45 units. The field note and, in Dev mode, a dev strip sit below it: RP7B tile, scene, FPS and controller status.
- **RHUD** (top right): Rizer's health, stamina and astral energy as 10-cell meters. The last cell fills partly, and low meters pulse. Also here: the astral gem, the character name, and the coin and gem wallet (Mori drop coins, Seers drop gems).
- **WHUD** (bottom left): six slots ringed round the weapon in hand. L1 / R1 (or Q) cycle weapons. The Astralvision badge sits beside it.
- **MHUD** (bottom right): heading-up minimap with the region name, the Move UI and Zyphone map buttons, and live X / Y / Z, facing and RP7B tile. Click the coordinates to copy them. The clock sits alongside.
- The player's astral colour (`--astral`: blue, or green for Psychosyd) tints every panel.

## Soundtrack

The draft music pack (`assets/audio/fantasy-magical-draft.mp3`, played by `soundtrack.js`) loops in the background. It starts when you choose New Game or Load Game on the title screen; nothing plays on the title itself. **Zyphone → Options → Sound** turns music on or off and sets the volume (5–100%, default 16%), and **M** toggles it anywhere. The choice is remembered (`rp7d.soundtrack.v1`). If the browser holds playback back, the next click or key press starts it.

The single-file build keeps the 28 MB track next to the HTML, at `dist/assets/audio/`, rather than inside it, so keep that folder beside the playtest file. `node tools/build_single_html.mjs --embed-audio` builds one fully self-contained HTML instead, at about 37 MB more.

## Home interior camera

Inside Rizer's home, anything standing between the camera and Rizer (a lamp, a shelf, a wall corner) turns see-through while it's in the way, so the room never hides him (`fadeOccluders` in `home-interior.js`).

## Zyphone · Options and Dev

- **Options:** look sensitivity (0.5–1.8×), invert camera up/down, button hints on/off, minimap on/off, and **Reset game**. Reset needs a second press within 4 s. It clears the chest, the sword and places found, then reloads; settings and Anim Lab work are kept. Settings are remembered in the browser (`rp7d.settings.v1`).
- **Dev:** turn Dev mode on to unlock playtest tools:
  - **Player:** god mode, heal to full, give the Basic Sword.
  - **World:** reset the chest, respawn all Seers, slow motion (0.3×).
  - **Debug:** a stats overlay (FPS, position, speed, movement state, weapon, lock, current clip), open the Anim Lab, reset Anim Lab assignments.
  - **Teleport:** to Rizer's door, the chest, or any place in Malezor.
  - **Dev map on/off** (under Teleport, saved as `settings.devMap`). With it on, the Zyphone Map tab teleports Rizer anywhere on land.
    - Mouse: click the spot. A crosshair follows the pointer.
    - Controller: a cyan cursor starts on Rizer; the left stick steers it and ✕ teleports.
    - The cursor turns red over water or off the island, and inside the home or the UFO it asks you to step outside first.

## Controls

| Input | Keyboard / mouse | Controller |
|---|---|---|
| Move | WASD / arrows | Left stick |
| Run (walk is default) | Hold Shift | Hold R2 |
| Jump (hold for higher) | Space | ✕ / A |
| Punch | J, or left click while the mouse is captured | □ / X |
| Kick | K, or right click while the mouse is captured | △ / Y |
| Interact (only when facing a place) | E | ○ |
| Astral Blast | F | ○ |
| Lock on / release | R or middle click | R3 |
| Astralvision | B | L3 + R3 |
| Copy position | Click the panel | — |
| Music on / off | M | Zyphone → Options |
| Astralift (locked enemy or chest) | — | D-pad ↑ |
| Swap lock target left / right | Z / V | Flick right stick |
| Dodge roll | C | L2 |
| Cycle weapon (wheel) | Q · 1–2 | R1 / L1 |
| Double jump | Space in the air | ✕ in the air |
| Wall flip | Jump at a wall, Space again before reaching it | Jump at a wall, ✕ again before reaching it |
| Emote | G | D-pad ↓ |
| Fly: take off | Double jump, keep Space held | Double jump, keep ✕ held |
| Flying: rise · land · boost | Space · X · Shift | ✕ · L3 · R2 |
| Stealth crouch (toggle) | X | L3 |
| Anim Lab | L | Zyphone → Rizer → Anim Lab |
| Zyphone menu (map, time, notes, character) | Tab | Touchpad |
| Look | Mouse (click to capture) or drag | Right stick |
| Zoom | Scroll wheel | — |

## What's in Malezor

Laid out from the **district wheel**. OPEN is pinned to the outbound road south toward Zarvane, HIGHLAND sits opposite it, and FOREST and WETLAND hold the flanks.

- **Core (Malezor Square):** fountain, Town Hall (Warden Kelthor), Rizer Academy (Professor Elarian), Potion Shop, and Zysphere Shop.
- **Home belt:** Rizer's Home and Dad's Research Facility, plus neighbour homes placed by the settlement doctrine (forest + highland arc, facing their lanes, spaced 11+ apart).
- **The Fallen Titan:** Malezor's district landmark, just east of the square.
- **The Wildmarch (highland, north):** the trail climbs to **Rakoron's Ruby Cave** at the escarpment.
- **East Wetland:** the river, ponds, reeds and willows, crossed by the **Timber Crossing**.
- **Rakoron's Stadium of Champions (the eastern flats):** Malezor's Gemlord Champion Stadium, where the Novarian Challenge is held (the qualifiers and the 9-year challenge). Every district will have one.
  - **Recipe:** `championStadium` (stadium.js), one recipe for every district; `gem` sets the Gemlord's colour.
  - **Placement:** { x: 209.70, z: 3.37, facing: 2.12 } on a levelled pad. The **stadium road** runs east from the Timber Crossing to the back gate.
  - **Shape:** a Colosseum-style ellipse, 54 × 64 outside, with a 26 × 38 sand arena (room to fight). The facade is dark stone and crimson:
    - a plinth, three arcades (the upper arches glow ember-red at night), and an attic with small windows;
    - bone tusks along the crown, crimson banners with ruby diamonds, and pennants.
  - **Two gates**, one at each end of the long axis, with straight tunnels through the stands into the arena. Each has a beast skull with ruby eyes and fangs over the outer mouth, and twin towers topped with ruby.
  - **The grand gate (front)** carries the Champions' box over the arena: a canopy and a throne. The Gemlord's great ruby turns slowly above it.
  - **In the arena:** a low dais at the centre with a ruby cluster (○ there reads the place card).
  - **Stairs** on both long sides climb to the podium walk.
  - **The stands are walkable end to end:** two tiers of 6 rows with a walk between, then the top gallery under the attic. The collision surface is a smooth slope through the middle of each row (`bowl` surface in world.js); the stairs use a `stairs` surface: every tread is its own height, 14 steps of 0.2, so his feet are always on a step. Gate roofs are `open` surfaces, so the camera can follow Rizer through the tunnels instead of being held above the roof, and the camera also stays on Rizer's side of tall solid mass (walls, the stands, the gates).
  - **Map:** the maps draw it as a ring with the arena inside (`world.mapShapes`), with a red Gemlord marker.
  - **Collision caveat:** the mass grid is 2.5D, so the few rooftop pieces directly over the tunnels (the gate merlons, the box parapet and throne, the crystal's iron spike) don't collide. Anything standing over a tunnel would otherwise close it.
  - **Added after the first pass (`late`):** wild fruit keeps its numbering, so fruit you already picked stays picked; the ~30 fruit now under the stadium or the new road stay hidden. The pad's grading is kept short (`padEase`) so the common chests elsewhere don't move.
- **South Pasture:** paddocks with hay, **Kaizari's Farm**, the Zarvane road, and the **Seer HQ + Seer Checkpoint** where the Seers hold the road south.
- **Wild Zyrex V0 ×3:** one each in the Wildmarch, the marsh and the pasture. Each keeps a permanent home patch, grazes and wanders, stops to watch Rizer, bolts if rushed, then walks home.

## Files

| File | Role |
|---|---|
| `world-data.js` | **All authored canon + placement**: wheel, roads, river, ponds, structures, landmarks, paddocks, wild Zyrex, detail counts, `quarterAt()` |
| `terrain.js` | Layered heightfield (highland rise, forest hills, wetland sink, graded core/pads/roads, river channel, ponds), painted vertex colours, water shader, settlement-doctrine plot finder |
| `stadium.js` | `championStadium`: the Gemlord Champion Stadium recipe (every district) and `STADIUM` dimensions |
| `props.js` | Structure recipes (house, townHall, academy, shop, zysphereShop, research, barn, seerHQ, seerGate, fountain, fallenTitan, rubyCave, bridge, lamp), baked per material; night-reactive glow materials |
| `nature.js` | Instanced trees/pines/willows/bushes/rocks, swaying grass that parts around Rizer, flowers, reeds, fences, hay; occlusion see-through fade |
| `world.js` | Assembles the district; ground/surface/water queries, collision (circles + oriented boxes), camera ray |
| `sky.js` | Time-of-day keyframes, gradient sky with sun, moon and stars, one shadow light that follows Rizer |
| `rizer.js` | Player controller: characters, movement, punch/kick, health and knock-back, orbit camera |
| `loot.js` | The chest, the Basic Sword mesh, the inventory, and the sword on Rizer's rig (hand / hip) + swing trail |
| `assets/mori/` | Mori model (`mori.glb`), its Blender source and build script |
| `hitbox.js` | Poly-bound capsule hitboxes measured from each mesh, segment/capsule contact tests, debug view |
| `astralvision.js` | Astralvision scan: wave, holograms, tags, minimap blips, cooldown badge |
| `astral.js` | Astral Blast bolts and R3 lock-on |
| `zyrex.js` | Wild Zyrex V0 body + behaviour state machine |
| `fx.js` | Motes/fireflies, dust, landing puffs, splashes, fountain spray |
| `hud.js` | Rotating minimap (Seers shown red while hunting you), district map, health, location, discoveries, facing-only interact prompt, clock |
| `actor.js` | Shared animated character: slots, locomotion blend, air poses, one-shots, lab preview |
| `anim-lib.js` | Clip library, FBX/GLB loading, retargeting, contact detection, per-actor slot assignments |
| `anim-lab.js` | The Anim Lab panel |
| `anim-assignments.js` | Default clip → slot assignments per actor |
| `assets/anims/` | Animation files + `library.js` manifest |
| `seers.js` | Seer grunts: patrol, sight, alert, chase, attack, stagger, knock-down, respawn |
| `zyphone.js` | The Zyphone menu (touchpad / Tab) |
| `game.js` | Bootstrap, input, post-processing (bloom), main loop, `window.__rp7d` debug hook |

## Feel notes

- Movement uses acceleration and braking rather than instant velocity. Walking is the default, at the walk clip's own pace (Walk 1 ≈ 1.9, one full 1.17 s cycle); hold R2 / Shift to run (7.2). Uphill grades slow you and shallow water halves your speed.
- Jumping has coyote time (0.12 s), an input buffer (0.14 s), variable height (release early for a short hop), and heavier fall gravity.
- The body leans into acceleration, banks into turns, squashes on jump and landing, and the stride is distance-driven so feet don't skate. The scarf trails on a spring.
- The camera eases in and out, pulls in instantly against terrain and buildings, kicks the FOV while sprinting, and zooms with the scroll wheel.

## World-pass decisions and limits

- The creator confirmed 2 world units per RP7B tile, retained the Fallen Titan and Timber Crossing, and set the northern road to end at Rakoron's Cave foothill.
- The First Den is restored as one of Malezor's three district landmarks. The Fanghall, Bloodscent Lodge and First Den remain simple exterior blockout models; the Lodge interior comes later.
- The Seer HQ, Zysphere Shop and other buildings use procedural 3D silhouettes rather than the RP7B sprites. Their canon placement and gameplay interactions are in place; art refinement can follow.
- The radio-tower, treehouse and Auraxion chest sites are sealed decorative placeholders. No building grants an item. Quest rewards, NPCs in the home, purchasable homes and other districts remain out of scope.

## Rizer’s home

Rizer starts upstairs in his room, following RP7B’s 15×10 furniture layout. The northwest staircase has real treads and carries him continuously between floors; walking into the upstairs room or downstairs living room no longer relocates him. Entering from outside opens into the living room, and walking through its south doorway returns outside. The downstairs layout follows RP7B’s plant, couch/rug, TV, Mom and Yara positions; press E / Circle near Mom or Yara to talk. The upstairs layout preserves the bed, science desk, TV, guitar, console, Nebuladock desk/chair, dummy, skateboard and basketball anchors. Homes have two visible storeys in RP7D’s low-poly style. Building pads are level beneath structures after road and water shaping, and oversized slab foundations are removed so walls and supports meet the ground.

Field Test 01 is archived in `_archive/v0-first-playable/`.
