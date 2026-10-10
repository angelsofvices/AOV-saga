// RP7D animation assignments: which clip fills which slot on which actor.
// Empty slots fall back to the clips baked into each character's GLB
// (Idle, Walk, Run, Punch, Kick) or to the procedural motion.
// `more` lists extra variants; one is picked at random (per NPC for loops, per play for one-shots).
// Edit in the playtest's Anim Lab, then paste its export here to make it the default.
// Clip ids: builtin:<actor>:<Clip> · lib:<file in assets/anims> · drop:<file dropped in the lab>
const L = f => 'lib:rizer/' + f + '.fbx';
const RF = f => 'lib:rifle/' + f + '.fbx';
// The rifle set, shared by Rizer and the Nova Guardian (thardin-rifle.js RIFLE_PROFILE).
const RIFLE = {
  rifleIdle: { clip: RF('Rifle_Idle'), inPlace: true },
  rifleAim: { clip: RF('Rifle_Aiming_Idle'), more: [RF('Rifle_Aiming_Idle_1')], inPlace: true },
  rifleFire: { clip: RF('Firing_Rifle'), inPlace: true },
  rifleWalk: { clip: RF('Walk_With_Rifle'), inPlace: true },
  rifleAimWalk: { clip: RF('Walk_Forward'), inPlace: true },
  rifleBack: { clip: RF('Walk_Backward_Right'), inPlace: true },
  rifleRun: { clip: RF('Rifle_Run'), inPlace: true },
  rifleStrafeL: { clip: RF('Run_Left'), inPlace: true },
  rifleStrafeR: { clip: RF('Run_Right'), inPlace: true },
  rifleStart: { clip: RF('Rifle_Start_Run'), inPlace: true },
  rifleJump: { clip: RF('Rifle_Jump'), inPlace: true },
  rifleCrouch: { clip: RF('Idle_Crouching_Aiming'), inPlace: true },
  rifleKneel: { clip: RF('Rifle_Aim_To_Kneel'), inPlace: true },
  rifleDeath: { clip: RF('Rifle_Death'), inPlace: true },
  drawBlaster: { clip: RF('Grab_Rifle_From_Behind_Shoulder'), inPlace: true },
  sheatheBlaster: { clip: RF('Put_Back_Rifle_Behind_Shoulder'), inPlace: true }
};
const M = f => 'lib:mori/' + f + '.fbx';
const DEATHS = { clip: L('death_1'), more: [L('death_2'), L('death_3'), L('death_4')] };
const PLAYER = {
  plantTree: { clip: L('Plant_Tree'), inPlace: true },
  ladderClimb: { clip: L('Ladder_Climbing'), inPlace: true },
  walk: { clip: L('walk_1'), stride: 1.15 }, // same 1.17 s cadence, 15% longer steps (legs swing wider, covers more ground)
  stairWalkUp: { clip: L('Ascending Stairs'), inPlace: true },
  stairRunUp: { clip: L('Running Up Stairs'), inPlace: true },
  stairWalkDown: { clip: L('Descending Stairs'), inPlace: true },
  stairRunDown: { clip: L('Descending Stairs (1)'), inPlace: true },
  astralift: { clip: L('Standing_1H_Magic_Attack_03') }, // lock on + d-pad ↑: crouch, then the right hand thrusts up (the lift)
  thunder: { clip: L('Astralthunder_Lock_Down') }, // lock on + d-pad ↓: hands up, then slams down (the strike)
  astralburst: { clip: L('Standing_2H_Magic_Area_Attack_02') }, // lock on + d-pad ←: lightning gathers over him, then bursts out around him
  rollingThunder: { clip: L('Rolling_Thunder'), inPlace: true }, // lock on + d-pad →: builds and rolls a lightning sphere at the target
  astralclap: { clip: L('Astralclap') },                    // Focus Move: arms up, hands to the ground, rise, CLAP (astral-storm.js · STORM_TIMING)
  astralspin: { clip: L('Astralspin'), inPlace: true },     // Focus Move: two fast turns, then out of the spin (ground or air)
  block: { clip: L('Standing_Block_Idle') },      // hold L2 + R2
  airslam: { clip: L('Jump_Attack'), inPlace: true }, // in the air, locked on, □: dives onto the target and slams the ground (rizer.js · airSlam)
  parry: { clip: L('Perfect_Block_Parry'), inPlace: true }, // guard raised just as a blow lands: deflects it and stuns the attacker
  fight: { clip: L('fightform') },
  crouch: { clip: L('Crouched_Sneaking_Right'), yaw: 180 }, // authored facing back toward the camera
  swim: { clip: L('Treading_Water') },          // walking in deep water
  swimrun: { clip: L('Swimming') },              // sprinting (R2) in deep water
  float: { clip: L('float') },
  fly: { clip: L('fly_1') },
  descend: { clip: L('float') },
  jump: { clip: L('Jumping_1') },
  doublejump: { clip: L('double_jump_flip') },
  wallflip: { clip: L('Run_To_Flip') },          // jump at a wall, ✕ again before reaching it
  bigland: { clip: L('Falling_To_Landing') },
  bail: { clip: L('Flight_Bail') },               // out of stamina mid-flight: flailing all the way down
  bailImpact: { clip: L('Flight_Bail_Impact') },   // ...slammed flat into the ground
  standup: { clip: L('Standing Up') },             // ...and back up if he survived it
  fastfall: { clip: L('Fast_Controlled_Fall') },   // flying, R2 held + L3: the fast dive down
  fastland: { clip: L('Fast_Controlled_Landing') }, // ...and the rolling landing at the bottom of it
  dodge: { clip: L('Dodgeroll') },
  slide: { clip: L('Running_Slide') },            // hold L2
  blast: { clip: L('Astral_Blast') },
  blast2: { clip: L('Astralstrike_2') },
  blast3: { clip: L('Astralstrike_3') },
  punch: { clip: L('Jab_1') },
  punch2: { clip: L('Hook_2') },
  punch3: { clip: L('Elbow_Uppercut_Combo_3') },
  punch4: { clip: L('Uppercut_Jab_4') },
  kick: { clip: L('Kick_1') },
  kick2: { clip: L('Kick_2') },
  kick3: { clip: L('Kick_3') },
  kick4: { clip: L('Kick_4') },
  flykick: { clip: L('Flying_Kick') },            // running + △
  kickup: { clip: L('Kick_Up_Combo') },
  vault: { clip: L('Running_Vault') },            // running + ✕ at a waist-high obstacle: vault over it           // running + △△: inverted kick, kip up, keep running
  ledgeGrab: { clip: L('Jumping_To_Hanging'), inPlace: true },
  ledgeClimb: { clip: L('Climbing'), inPlace: true },
  teeter: { clip: L('Teeter'), inPlace: true },
  prayKneel: { clip: L('Pray_Kneel'), inPlace: true },
  prayHold: { clip: L('Pray_Hold'), inPlace: true },
  prayStand: { clip: L('Pray_Stand'), inPlace: true },
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`bond${i + 1}`, { clip: L(`Bond_Tier_${i + 1}`), inPlace: true }])),
  astralboardCruise: { clip: L('Astralboard_Cruise'), inPlace: true },
  astralboardPush: { clip: L('Astralboard_Push'), inPlace: true },
  runpunch: { clip: L('Punch_To_Elbow_Combo') },  // running + □
  hurt: { clip: L('Hit_1'), more: [L('Big_Stomach_Hit'), L('Head_Hit')] }, // one picked at random per hit
  knockdown: DEATHS,
  interact: { clip: L('Picking_Up') },
  pickup: { clip: L('Picking_Up') },
  runpickup: { clip: L('Pick_Up_Item') },         // running + ○ near loot: scooped up without stopping
  // ○ near a fae / faery / astral fae leaps for it (50/50): the hands reach it at the top of each clip (rizer.js · faeCatch).
  faeCatch: { clip: L('catch_fae_success') },     // hit: jog-in, leap, two-handed catch
  faeCatchMiss: { clip: L('catch_fae_miss') },    // miss: lunge, whiff just under it, dive to the ground
  store: { clip: L('Store_Item') },
  sword: { clip: L('Sword_Slash') },
  sword2: { clip: L('Sword_Slash_2') },           // Tearsword combo 2
  sword3: { clip: L('Sword_3') },
  sword4: { clip: L('Sword_4') },
  // Rubypaw Sword: a Malezor-district variant of the same blade shape — swings the identical
  // combo as the Tearsword, drawn and sheathed the same way (handling() falls back to draw/sheathe).
  rubypaw: { clip: L('Sword_Slash') },
  rubypaw2: { clip: L('Sword_Slash_2') },
  rubypaw3: { clip: L('Sword_3') },
  rubypaw4: { clip: L('Sword_4') },
  drawBow: { clip: L('Take_Out_Bow') },
  bowDraw: { clip: L('Draw_Arrow') },
  bowAim: { clip: L('Aim_Bow') },
  bowAimWalk: { clip: L('Aim_Bow_Walking'), inPlace: true },
  bowShoot: { clip: L('Shoot_Bow') },
  draw: { clip: L('Sword_Take_Out') },
  sheathe: { clip: L('Sword_Put_Away') },
  axe: { clip: L('Axe_1_Light_Swing') },         // Jaded Axe of Emeralix · 4-stage combo
  axe2: { clip: L('Axe_2_Heavy_Swings') },
  axe3: { clip: L('Axe_3_Double_Slash') },
  axe4: { clip: L('Axe_4_Heavy_360_Swing') },
  drawAxe: { clip: L('Axe_Equip_Underarm') },      // take the axe out
  sheatheAxe: { clip: L('Axe_Disarm_Underarm') },  // put it away
  enter: { clip: L('Opening_Door_Inwards') },     // hand on the knob: opens Rizer's front door with his right hand, walks in, pulls it shut
  exitDoor: { clip: L('Opening_Door_Inwards'), mirror: true }, // the same clip mirrored: leaving pushes with the left hand, so the hinge stays on the same edge
  emote: { clip: L('Flair') },
  guitarPlay: { clip: L('Guitar_Playing'), inPlace: true },
  ...RIFLE,
  pullStart: { clip: 'lib:furniture/Pull Heavy Object Start.fbx', inPlace: true }, // ■ on a locked piece of furniture in Rizer's home
  pullMove: { clip: 'lib:furniture/Pull Heavy Object Moving.fbx', inPlace: true },
  pullStop: { clip: 'lib:furniture/Pull Heavy Object Stop.fbx', inPlace: true }, // ■ again: set it down
  chairSit: { clip: 'lib:seat/Stand To Sit.fbx', inPlace: true },       // Nebuladock chair (seating.js): ○ at the chair
  chairStand: { clip: 'lib:seat/Sit To Stand.fbx', inPlace: true },
  chairToType: { clip: 'lib:seat/Sit To Type.fbx', inPlace: true },     // ○ at the keyboard
  chairFromType: { clip: 'lib:seat/Type To Sit.fbx', inPlace: true },
  chairTyping: { clip: 'lib:seat/Typing.fbx', inPlace: true },
  heavyRun: { clip: 'lib:heavy/Standing Run Forward.fbx', inPlace: true }, // axe + longswords drawn
  heavyFight: { clip: 'lib:heavy/Heavy_Fight_Stance.fbx', inPlace: true }, // locked on with the axe or a longsword drawn: the heavy guard instead of Fight Form
  kickHeavy: { clip: 'lib:heavy/Great_Sword_Kick.fbx' },                   // △ with the axe or a longsword drawn: one committed kick instead of the kick chain
  aerialEvade: { clip: L('Aerial_Evade'), inPlace: true },                 // dodge pressed just before a bolt arrives: the jump spin
  treeSpin: { clip: L('Tree_Spin_Evade'), inPlace: true },                 // running into a tree: he spins off the trunk and keeps running
  heavyRunAttack: { clip: 'lib:heavy/Heavy_Running_Attack.fbx' },          // running + □ with the axe or a longsword drawn
  craft: { clip: L('Crafting'), inPlace: true }          // □ with the telescope drawn: crafts it, piece by piece
};
// Mori: use the dedicated zombie pack for his idle, movement and attacks.
const TORNADO = {
  tornadoWobble: { clip: M('Wobbling'), inPlace: true },
  tornadoFloat: { clip: L('float'), inPlace: true }
};
const MORI = {
  ...TORNADO,
  idle: { clip: M('Zombie Idle') },
  walk: { clip: M('Slow_Walk'), inPlace: true },
  run: { clip: M('Jog_Chase'), inPlace: true },
  crawl: { clip: M('Crawl'), inPlace: true },
  astraliftHit: { clip: L('blastback') },
  shocked: { clip: L('Being_Electrocuted') },     // struck by Astralthunder
  dazedWalk: { clip: M('Dazed Walk'), inPlace: true }, // Circle / Astralstrike: mobile 3-second daze
  dazedRun: { clip: M('Dazed Run'), inPlace: true },
  stunned: { clip: M('Stunned React'), inPlace: true }, // surprise Circle hit while unaware
  standup: { clip: M('Revive'), inPlace: true },
  punch: { clip: M('Zombie Punching') },
  punch2: { clip: M('Fast_Swing'), inPlace: true },
  punch3: { clip: M('Hook_Punch'), inPlace: true },
  kick: { clip: M('Zombie Kicking'), more: [M('Daemon_Kick')], inPlace: true },
  bite: { clip: M('Neck_Bite'), inPlace: true },
  feedBody: { clip: M('Body_Feed'), inPlace: true },
  emote: { clip: M('Zombie dance') },
  dance: { clip: 'lib:dance/Zombie dance.fbx', inPlace: true },
  hurt: { clip: L('Hit_1'), more: [L('Big_Stomach_Hit'), L('Head_Hit')] }, // one picked at random per hit
  knockdown: { clip: L('death_1'), more: [L('death_2'), L('death_3'), L('death_4')] }
};
export default {
  rizer: PLAYER,
  psychosyd: PLAYER, // Rizer's Psychosyd skin
  elzoran: PLAYER,
  seer: {
    ...TORNADO,
    dance: { clip: 'lib:dance/Rockstar Hips.fbx', more: ['lib:dance/dance cheer.fbx','lib:dance/Flair.fbx','lib:dance/guy dance 2.fbx','lib:dance/guy dance 3.fbx','lib:dance/gyat dance 2.fbx','lib:dance/gyat dance 3.fbx','lib:dance/gyat dance girl.fbx','lib:dance/kid dance.fbx','lib:dance/pop lock dance.fbx','lib:dance/Rockstar hips variaint 2.fbx'], inPlace: true },
    walk: { clip: L('npc_walk_1'), more: [L('npc_walk_2')] },
    astraliftHit: { clip: L('blastback') },
    shocked: { clip: L('Being_Electrocuted') },
    stunned: { clip: M('Stunned React'), inPlace: true },
    fight: { clip: 'lib:seer/Fight Idle 2.fbx', more: ['lib:seer/Fight Idle 3.fbx'], inPlace: true },
    standup: { clip: L('Standing Up') },
    // same combos as Rizer (the baseline enemy fights like you do)
    punch: { clip: L('Jab_1') },
    punch2: { clip: L('Hook_2') },
    punch3: { clip: L('Elbow_Uppercut_Combo_3') },
    punch4: { clip: L('Uppercut_Jab_4') },
    kick: { clip: L('Kick_1') },
    kick2: { clip: L('Kick_2') },
    kick3: { clip: L('Kick_3') },
    kick4: { clip: L('Kick_4') },
    hurt: { clip: L('Hit_1'), more: [L('Big_Stomach_Hit'), L('Head_Hit')] }, // one picked at random per hit
    knockdown: DEATHS
  },
  // Nova Guardian: the shared clips for moving, being hit and falling. Its rifle slots (rifleIdle … rifleDeath) are empty
  // until Mixamo rifle clips are assigned; the rifle rig holds and aims the weapon meanwhile.
  nova: {
    ...TORNADO,
    ...RIFLE,
    walk: { clip: L('npc_walk_1') },
    hurt: { clip: L('Hit_1'), more: [L('Big_Stomach_Hit'), L('Head_Hit')] },
    knockdown: DEATHS,
    punch: { clip: L('Jab_1') },
    punch2: { clip: L('Hook_2') },
    kick: { clip: L('Kick_1') },
    kick2: { clip: L('Kick_2') },
    fight: { clip: 'lib:seer/Fight Idle 2.fbx', inPlace: true },
    shocked: { clip: L('Being_Electrocuted') },
    stunned: { clip: M('Stunned React'), inPlace: true },
    astraliftHit: { clip: L('blastback') }
  },
  mori: MORI,
  crept: MORI,
  skellor: MORI,
  'daemon-black': {
    ...MORI,
    fight: { clip: L('fightform'), inPlace: true },
    dodge: { clip: L('Dodgeroll'), inPlace: true },
    punch: { clip: M('Hook_Punch'), inPlace: true },
    punch2: { clip: M('Fast_Swing'), inPlace: true },
    punch3: { clip: M('Hook_Punch'), inPlace: true },
    kick: { clip: M('Daemon_Kick'), inPlace: true }
  },
  'daemon-red': {
    ...MORI,
    fight: { clip: L('fightform'), inPlace: true },
    dodge: { clip: L('Dodgeroll'), inPlace: true },
    punch: { clip: M('Fast_Swing'), inPlace: true },
    punch2: { clip: M('Hook_Punch'), inPlace: true },
    punch3: { clip: M('Fast_Swing'), inPlace: true },
    punch4: { clip: M('Hook_Punch'), inPlace: true },
    kick: { clip: M('Daemon_Kick'), inPlace: true },
    kick2: { clip: M('Daemon_Kick'), inPlace: true }
  }
};
