// Red Daemon: the larger berserker variant, with heavier and more frequent blows.
export const DAEMON_RED_SPEC = {
  name: 'Red Daemon', key: 'daemon-red', family: 'daemon',
  scale: 1.5, hp: 26, armor: 0.65, radius: 0.68,
  walk: 2.15, run: 5.0, sight: 20, sightNight: 19, cone: 1.25, sense: 4.4,
  loseAfter: 6, giveUpDist: 36, leash: 48, callRadius: 13, maxAttackers: 2,
  punch: { damage: 11, weight: 0.66, range: 1.5 }, kick: { damage: 15, weight: 0.34, range: 1.8 },
  bite: { damage: 17, range: 1.42 },
  comboLength: [0.22, 0.32, 0.31, 0.15], clipSpeed: 0.9,
  windup: [0.22, 0.36], turnRate: 2.8, whiff: 0.34, cooldown: [0.72, 0.92],
  dodge: { chance: 0.38, cooldown: [2.0, 3.0], duration: 0.52, distance: 2.5 },
  biome: ['forest', 'open', 'highland', 'wetland'], spawnCount: 9, seed: 8181
};
