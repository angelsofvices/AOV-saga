// Black Daemon: the smaller, evasive member of the Daemon base species.
// The shared Mori skeleton keeps body contact and all existing locomotion slots.
export const DAEMON_BLACK_SPEC = {
  name: 'Black Daemon', key: 'daemon-black', family: 'daemon',
  scale: 1.0, hp: 18, armor: 0.72, radius: 0.52,
  walk: 2.8, run: 5.2, sight: 18, sightNight: 17, cone: 1.2, sense: 4,
  loseAfter: 5, giveUpDist: 34, leash: 45, callRadius: 11, maxAttackers: 2,
  punch: { damage: 7, weight: 0.7, range: 1.2 }, kick: { damage: 9, weight: 0.3, range: 1.48 },
  bite: { damage: 10, range: 1.18 },
  comboLength: [0.42, 0.35, 0.18, 0.05], clipSpeed: 1.1,
  windup: [0.25, 0.42], turnRate: 3.5, whiff: 0.22, cooldown: [1.1, 1.3],
  dodge: { chance: 0.7, cooldown: [1.35, 2.2], duration: 0.44, distance: 3.7 },
  biome: ['forest', 'open', 'highland', 'wetland'], spawnCount: 12, seed: 7171
};
