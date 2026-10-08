// RP7D · ZyLink: the software that lets compatible technology talk to each other.
//
// ZyLink is connectivity. It is NOT storage, NOT an inventory and NOT a crafting system, and it never moves a physical
// item by itself. This table only answers "which device may look at which storage, and which may move things":
//   reads   storage locations the device can see
//   writes  storage locations the device can put things into
//   moves   whether the device is a place where items are shifted between two locations
// A new compatible device is one more row here. Nothing else in the game needs to change to learn about it.
export const ZYLINK_DEVICES = Object.freeze({
  zyphone: { name: 'Zyphone', role: 'interface', reads: ['ZYCUBE'], writes: [], moves: false },
  zycube: { name: 'Zycube', role: 'portable storage', reads: ['ZYCUBE'], writes: ['ZYCUBE'], moves: false },
  homepc: { name: 'Nebuladock 3000', role: 'reserve storage', reads: ['HOME_PC', 'ZYCUBE'], writes: ['HOME_PC', 'ZYCUBE'], moves: true },
  experiment_table: { name: 'Experiment Table', role: 'creation', reads: ['HOME_PC', 'ZYCUBE'], writes: ['HOME_PC'], moves: false },
  astralite_station: { name: 'Astralite Station', role: 'synthesis', reads: ['HOME_PC', 'ZYCUBE'], writes: ['HOME_PC'], moves: false },
  field_workstation: { name: 'Field Workstation', role: 'field utility', reads: ['ZYCUBE'], writes: ['ZYCUBE'], moves: false }
});

export const link = {
  devices: ZYLINK_DEVICES,
  canRead: (device, loc) => !!ZYLINK_DEVICES[device]?.reads.includes(loc),
  canWrite: (device, loc) => !!ZYLINK_DEVICES[device]?.writes.includes(loc),
  // Moving an item from one location to another needs a device that moves things AND can write to both ends.
  // Connectivity alone (the Zyphone, ZyLink itself) never qualifies: nothing is pulled in from home remotely.
  canMove: (device, from, to) => { const d = ZYLINK_DEVICES[device]; return !!d?.moves && d.writes.includes(from) && d.writes.includes(to); }
};
