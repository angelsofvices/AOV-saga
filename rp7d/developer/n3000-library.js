// Production registry contains only portable package references. Discovery paths live in reports/tools.
const titles = ['The Long Return', 'The Training Yard', 'The Battlegrounds', 'The Viridian Expedition', 'Cardmaster Showdown', 'The Eternal War', 'Rizing Power 7 Beta · RP7B', 'The Tree of Power · Arborynth', 'The Origins of Power · Gardenlands'];
const descriptions = ['Fly the original gem-collecting journey, or play its endless blaster mode.', 'Train through the original card battles.', 'Enter the original battle arena.', 'Explore the original Viridian expedition.', 'Play the original card showdown.', 'Return to the original Eternal War.', 'The legacy RP7B game. This entry never launches another RP7D.', 'Explore the original Arborynth tree.', 'The original Gardenlands playtest.'];
export const RP_GAME_LIBRARY = Object.freeze(titles.map((title, i) => Object.freeze({
  id: `RP${i + 1}`, title, description: descriptions[i], packagePath: `./assets/n3000/rp${i + 1}/`, entryPoint: 'index.html',
  runtimeType: i === 8 ? 'webgl-module' : [1, 2, 4].includes(i) ? 'web-dom' : 'web-canvas',
  enabled: i === 0, availability: i === 0 ? 'AVAILABLE' : 'UNAVAILABLE', adapter: 'isolated-html', coverAsset: null,
  inputProfile: { nativeKeyboard: true, nativeGamepad: true, description: i === 0 ? 'WASD / arrows · mouse / touch · left stick / D-pad · Space / B or R2 fires in Endless mode' : 'Audited; per-title adapter validation pending' },
  saveProfile: { namespace: `rp7d.n3000.saves.RP${i + 1}.v1`, resumableRun: false, description: i === 0 ? 'Local scores and preferences. Runs start fresh.' : 'Save compatibility pending' },
  warning: i === 0 ? 'Original RP1 soundtrack is missing. Blaster and explosion sounds are included.' : 'Package audited. Asset packaging and adapter testing pending.'
})));
