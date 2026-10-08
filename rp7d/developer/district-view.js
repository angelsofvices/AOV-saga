// Compatibility for the existing world map and empty-terrain renderer. The
// supplied world-data.js stays authoritative and unchanged; display records
// derive their coordinates and coast functions from it.
import { MALEZOR, DISTRICTS as DATA, worldDistrictAt } from './world-data.js';
export { malezorEdge } from './world-data.js';
const TINTS = [
  ['#98a262','#5e7644'], ['#c9a24a','#b0873a'], ['#6a5450','#544347'], ['#74a043','#5b8a36'],
  ['#7350c2','#5a3c9e'], ['#b3cee2','#94b4cf'], ['#bdc0cc','#a4a7b8'], ['#c2732f','#a65e27'],
  ['#70909a','#5b7780'], ['#e6d9b0','#d2c191']
];
export const DISTRICTS = DATA.map((d, i) => ({ ...d, name:d.district, x:d.center.x, z:d.center.z, tint:TINTS[i], built:i === 0 }));
export const ZYRAXIS = {
  id:'zyraxis', name:'Zyraxis', districts:DISTRICTS,
  bounds:{ x0:Math.min(...DISTRICTS.map(d => d.x - d.extent)) - 12, x1:Math.max(...DISTRICTS.map(d => d.x + d.extent)) + 12,
    z0:Math.min(...DISTRICTS.map(d => d.z - d.extent)) - 12, z1:Math.max(...DISTRICTS.map(d => d.z + d.extent)) + 12 }
};
export const coastEdge = (x, z, d) => d.edge(x, z);
export const malezorOwns = (x, z) => Math.abs(x) <= MALEZOR.extent - 1 && Math.abs(z) <= MALEZOR.extent - 1 && MALEZOR.containsLand(x, z);
export function emptyDistrictAt(x, z, out) {
  const id = worldDistrictAt(x, z), who = id !== 'malezor' ? DISTRICTS.find(d => d.id === id) || null : null;
  if (out) out.edge = who ? who.edge(x, z) : 0;
  return who;
}
