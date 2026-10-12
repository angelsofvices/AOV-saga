global.window = global; global.document = undefined;
const dir = process.argv[2];
['fauna.js','environments.js','biomes.js','world_canon.js','worldgen.js'].forEach(f => { try { require(dir + '/' + f); } catch (e) { console.log('load', f, e.message.slice(0, 80)); } });
const G = window.AOV_WORLDGEN; let bad = [], t0 = Date.now(), rooms = 0, stats = {peak:0, valley:0};
for (let no = 1; no <= 27; no++) {
  const t = Date.now(), c = G.cave(no); stats[c.kind]++;
  c.rooms.forEach((r, k) => { rooms++; if (!r.verified) bad.push(no + ':' + k); });
  if (process.argv[3]) console.log(no, c.kind, c.rooms.length, c.rooms.map(r => r.W + 'x' + r.H + (r.verified ? '' : '!')).join(' '), (Date.now() - t) + 'ms');
}
console.log('rooms', rooms, 'unverified', bad.length, bad.join(' '), 'total ms', Date.now() - t0, JSON.stringify(stats));
