// The Aethryx Expanse: canonical world data, Astragraphy knowledge and playability.
// This file owns the data. The Telescope (astragraphy.js) is only one way of looking at it; the Zyphone, Dad's
// Notebook, Space Studies, RXP or a future mission board can all read and write the same log through
// createAstragraphyLog(). Names, numbers and zones follow the Creator's ordered list (ASTRAGRAPHY FOUNDATION 01);
// positions follow AETHRYX_EXPANSE_LAYOUT (ring = ceil(n / 4), zone = (n - 1) mod 4); registers, first races and
// axes follow the Master Codex WORLDS sheet. Nothing here is procedurally invented: empty arrays are waiting for
// authored content.

// Development override: every lock below is bypassed while this is true. The lock logic itself stays in place.
export const ASTRAGRAPHY_SETTINGS = { allUnlocked: true, telescope: 'stargazer' };

// Knowledge and playability are two separate ladders and are never collapsed into one flag.
export const KNOWLEDGE = ['UNKNOWN', 'OBSERVED', 'IDENTIFIED', 'STUDIED', 'DETAILED', 'MASTERED'];
export const KNOWLEDGE_LABEL = { UNKNOWN: 'Unknown', OBSERVED: 'Observed', IDENTIFIED: 'Identified', STUDIED: 'Studied', DETAILED: 'Detailed', MASTERED: 'Mastered' };
export const PLAYABILITY = ['OBSERVATION_ONLY', 'MISSION_AVAILABLE', 'EVENT_AVAILABLE', 'EXTRACTION_AVAILABLE', 'EXPANSION_AVAILABLE', 'FULLY_PLAYABLE'];
export const PLAYABILITY_LABEL = { OBSERVATION_ONLY: 'Observation Only', MISSION_AVAILABLE: 'Mission Available', EVENT_AVAILABLE: 'Event Available', EXTRACTION_AVAILABLE: 'Extraction Available', EXPANSION_AVAILABLE: 'Expansion Available', FULLY_PLAYABLE: 'Playable' };
const rank = s => Math.max(0, KNOWLEDGE.indexOf(s));
// What each layer of an entry needs before it is shown (bypassed by allUnlocked).
export const SECTION_REQUIRES = { name: 'IDENTIFIED', classification: 'IDENTIFIED', summary: 'STUDIED', astralite: 'STUDIED', environment: 'STUDIED', civilization: 'DETAILED', history: 'DETAILED', pois: 'OBSERVED' };
// Messages for what Rizer can see but does not understand yet.
export const UNKNOWN_TEXT = { object: 'UNIDENTIFIED OBJECT', signal: 'UNIDENTIFIED SIGNAL', structure: 'UNKNOWN STRUCTURE', astral: 'ASTRAL SIGNATURE UNKNOWN', data: 'INSUFFICIENT ASTRAGRAPHY DATA', dad: "DAD'S NOTES: PAGE MISSING", space: 'SPACE STUDIES DATA REQUIRED' };
// Completion is knowledge only, never story, map or ownership. Weights are data so they can be retuned.
export const COMPLETION_WEIGHTS = { observed: 1, identified: 1, studied: 2, poi: 1, mystery: 2 };
// Observation equipment. The Stargazer reaches everything for now; later instruments can differ.
export const TELESCOPES = { stargazer: { name: 'Stargazer Telescope', tier: 1, magnification: 1.5, scan: true, poiKinds: null /* null = every kind */ } };

export const QUADRANTS = {
  ALPHA: { key: 'ALPHA', numeral: 'I', name: 'Alpha Zone', spire: 'North spire', angle: 0, color: '#e9b84a', register: 'Beginning · awakening · first light · primordial source' },
  OMEGA: { key: 'OMEGA', numeral: 'IV', name: 'Omega Zone', spire: 'East spire', angle: 90, color: '#e2463c', register: 'Ending · closure · finality · the last word' },
  TRINITY: { key: 'TRINITY', numeral: 'III', name: 'Trinity Zone', spire: 'South spire', angle: 180, color: '#3fd08a', register: 'Devotion · synthesis · the three-fold · integration' },
  DICHOTOMY: { key: 'DICHOTOMY', numeral: 'II', name: 'Dichotomy Zone', spire: 'West spire', angle: 270, color: '#a45cf0', register: 'Pairs · duality · conflict · opposing forces' }
};
export const QUADRANT_ORDER = ['ALPHA', 'DICHOTOMY', 'TRINITY', 'OMEGA'];
const ZONE_BY_MOD = ['ALPHA', 'OMEGA', 'TRINITY', 'DICHOTOMY'];
const era = n => n <= 9 ? 'Genesis' : n <= 18 ? 'Omen' : 'Definitive';

// Visual status. APPROVED = built from a dedicated Creator reference of that world. REQUIRED = no dedicated
// reference yet: the model is a development placeholder read off the Creator's Expanse overview painting and the
// layout render hints, and must be rebuilt when the world's own reference arrives.
const REF_OVERVIEW = 'expanse-overview-01', PLACEHOLDER = { status: 'REFERENCE_REQUIRED', placeholder: true, referenceId: REF_OVERVIEW };
const poi = (id, name, kind, lon, lat, note) => ({ id, name, kind, lon, lat, note });

// [order, name, register, type, first race / civilization, defining attribute, axes, age (Bya), summary, pois, visual]
const ROWS = [
  [1, 'Origon', 'The First World', 'Father Gem Core', 'Cosmic beings only', 'Direct Highest One presence; no inhabitants', 'Ax-1 core · Ax-6 · Ax-9', 12,
    'The First World. The first planet to crystallize from the Aenor substrate. No humanoid life has ever been recorded here.',
    [poi('light', 'Central light', 'astralite', 20, 5, 'A single point of white light at the centre of the world.')],
    { surface: { ramp: ['#3a2f1c', '#b98d45', '#fff0c4'], scale: 2.2, glow: '#ffe2a0', self: 0.75 }, lattice: { color: '#ffe9b0', detail: 2 }, halo: { color: '#ffd98a', size: 3.4, opacity: 0.55 }, rings: [{ inner: 1.55, outer: 1.6, tilt: [1.35, 0.1], color: '#ffd98a', opacity: 0.55 }] }],
  [2, 'Lumeria', 'The Recorder World', 'Pure Light', 'Astrums, the original light-beings', 'Pure light · awareness', 'Ax-2 core · Ax-5 · Ax-9', 11.5,
    'The Recorder World, a world of pure light and home of the Astrums, the original light-beings.',
    [poi('halo', 'Soft halo', 'phenomenon', 0, 30, 'A soft white-gold halo surrounds the whole world.')],
    { surface: { ramp: ['#b9a274', '#f4e6c0', '#ffffff'], scale: 1.8, glow: '#fff3d0', self: 0.55 }, lattice: { color: '#fff6dc', detail: 2, opacity: 0.5 }, halo: { color: '#fff0c8', size: 3.4, opacity: 0.45 } }],
  [3, 'Draevos', 'The Draconic Forge', 'Sky-Dominant', 'Dracolords and Mandrakes', 'Sky-dominant; primordial dragons', 'Ax-3 · Ax-7 · Ax-1', 10,
    'The Draconic Forge. A sky-dominant world and the cradle of the Dracolord lineage.',
    [poi('wings', 'Wing cloud-bands', 'phenomenon', 60, 20, 'Faint cloud-bands shaped like wings cross the upper sky.')],
    { surface: { ramp: ['#2a2530', '#8e8a92', '#e6e2de'], scale: 2.6, bands: 5, bandMix: 0.35, blots: { color: '#15121a', scale: 1.6, cut: 0.6 } }, clouds: { color: '#d8d4dc', opacity: 0.35, bands: 6 }, atmosphere: { color: '#c9c6d8', opacity: 0.25 } }],
  [4, 'Arborynth', 'The World Tree', 'Living Planet', 'The Great Root, embodied as the planet', 'Single living planetary organism', 'Ax-4 core · Ax-6 core · Ax-2', 9.8,
    'The World Tree. A single living planetary organism: the Great Root is embodied as the planet itself.',
    [poi('root', 'The Great Root', 'forest', 0, 80, 'One organism. The canopy and the root-vein network are the same living body.')],
    { surface: { ramp: ['#1d2b12', '#3f6b25', '#7fae45'], scale: 3, cracks: { scale: 2.4, w: 0.035 }, glow: '#b6e06a', power: 0.7 }, tree: { trunk: '#5a3b20', leaf: ['#2f7a2a', '#4ea33a', '#7cc74d'] }, atmosphere: { color: '#8fd66a', opacity: 0.18 }, extent: 2.1 }],
  [5, 'Thallassar', 'The Living Ocean', 'Ocean World', 'The Great Fin, oceanic axis-being', 'Oceanic harmony', 'Ax-9 · Ax-7 · Ax-5', 9.6,
    'The Living Ocean. Solid abyssal blue with no landmass: the seat of the Great Fin.',
    [poi('wave', 'Silvery wave-arc', 'ocean', 30, 15, 'One silver arc of wave travels the surface of the ocean.')],
    { surface: { ramp: ['#06204a', '#0d4fa8', '#3aa0ff'], scale: 2.4, glow: '#7fd0ff', self: 0.35, rough: 0.35 }, lattice: { color: '#8fdcff', detail: 2 }, halo: { color: '#3aa0ff', size: 3, opacity: 0.4 } }],
  [6, 'Pyrauna', 'The Expansion World', 'Expansion', 'The Great Fang, axis-being of expansion', 'Expansion megabeast', 'Ax-3 core · Ax-8 · Ax-7', 9.5,
    'The expansion world. Volcanic destruction as a creative principle, paired with Quorauna\'s collapse.',
    [poi('fissures', 'Expanding fissures', 'energy', 40, -10, 'Bright fissures spread outward across the crust.')],
    { surface: { ramp: ['#1c2a12', '#4d6b1f', '#b8641c'], scale: 2.8, cracks: { scale: 3.2, w: 0.06 }, glow: '#ffae3a', power: 1.6 }, flames: { color: '#ffb347', count: 120, lift: 0.18 }, atmosphere: { color: '#ff9a3a', opacity: 0.2 } }],
  [7, 'Quorauna', 'The Collapse World', 'Collapse', 'The Great Scale, axis-being of collapse', 'Collapse megabeast', 'Ax-7 core · Ax-6 · Ax-4', 9.4,
    'The collapse world. Its fissures pull inward: Pyrauna\'s mirror.',
    [poi('fissures', 'Inward fissures', 'energy', -30, 10, 'The fissures draw toward the core instead of spreading.')],
    { surface: { ramp: ['#12091f', '#2c1560', '#5a34b8'], scale: 2.4, cracks: { scale: 2.6, w: 0.03, dark: true }, glow: '#9a6bff', power: 0.9, rough: 0.3 }, halo: { color: '#6a3cff', size: 2.8, opacity: 0.35 } }],
  [8, 'Cytherion', 'The Grid World', 'First Artificial Structure', 'Synthrax; all insectoid life traces here', 'First artificial structure: the Grid', 'Ax-8 core · Ax-4 · Ax-6', 9.2,
    'The Grid World. Site of the first deliberate cosmic architecture, and the homeworld of all insectoid life.',
    [poi('grid', 'The Grid', 'grid', 10, 0, 'A glowing tessellation covers the whole planet. It was built, not grown.')],
    { surface: { ramp: ['#02060e', '#06122a', '#0b2550'], scale: 2, grid: 14, glow: '#41d9ff', power: 1.7, rough: 0.4 }, lattice: { color: '#41d9ff', detail: 3, opacity: 0.35 }, halo: { color: '#2aa8ff', size: 2.7, opacity: 0.35 } }],
  [9, 'Zyraxis', 'The Spirit Anchor', 'Crystal Planet', 'Gemlords', 'Gemlords; gems first crystallise', 'Ax-9 core · Ax-1 · Ax-8', 9,
    'World of gems, and Rizer\'s home. Gems first crystallized here; ten Gemlords each claim a District.',
    [poi('rings', 'Twin ring system', 'ring', 90, 0, 'Two planetary rings at different inclinations. No other world in the Expanse carries a pair.')],
    { size: 1.4, geometry: 'faceted', surface: { ramp: ['#1f0b3d', '#6a2bd0', '#c58bff'], scale: 2.4, cracks: { scale: 2.8, w: 0.03 }, glow: '#e0b0ff', power: 1.3, self: 0.25, rough: 0.3 }, lattice: { color: '#e6c2ff', detail: 2 },
      rings: [{ inner: 1.45, outer: 1.95, tilt: [1.25, 0.25], color: '#c59bff', opacity: 0.6 }, { inner: 2.1, outer: 2.3, tilt: [1.05, -0.45], color: '#ffd9a0', opacity: 0.45 }], halo: { color: '#9a55ff', size: 3.4, opacity: 0.45 }, extent: 2.3 }],
  [10, 'Myraclese', 'The Dominion World', 'Enforced Devotion', 'Humanoids; their first true home', 'Enforced devotion', 'Ax-1 corrupted · Ax-8 · Ax-3', 8.5,
    'The Dominion World. A world of enforced devotion, and the first true home of humanoids.',
    [poi('halo', 'Chapel-light halo', 'phenomenon', 0, 60, 'A halo of chapel-light stands over the gold-leaf surface.')],
    { surface: { ramp: ['#3a2a10', '#a37a2a', '#f1d27a'], scale: 2.6, metal: 0.6, rough: 0.35, glow: '#ffe6a0', self: 0.3 }, spires: { count: 26, color: '#e9c46a', glow: '#fff0b8', h: 0.55, lon: 0, lat: 78, spread: 0.85, style: 'cathedral' }, halo: { color: '#ffdf8a', size: 3.2, opacity: 0.5 }, extent: 1.5 }],
  [11, 'Bellatora', 'The War World', 'Endless Combat', 'Beastfolk warrior clans', 'Endless war', 'Ax-3 corrupted · Ax-7 · Ax-6', 8,
    'The War World. Endless combat under a matriarchal warrior culture.',
    [poi('craters', 'Battle-scarred craters', 'terrain', 20, -20, 'Blood-red ground, cratered by war.')],
    { surface: { ramp: ['#1a0406', '#7a0f14', '#d42a22'], scale: 3, craters: 26, cracks: { scale: 3, w: 0.025 }, glow: '#ff5a3a', power: 0.9 }, spires: { count: 22, color: '#2a0a0c', glow: '#ff3a2a', h: 0.6, lon: 0, lat: 78, spread: 0.85, style: 'tower' }, atmosphere: { color: '#ff3a2a', opacity: 0.2 }, extent: 1.5 }],
  [12, 'Yvoris', 'The Frozen World', 'Cosmic-Time Stasis', 'Enduring hardened forms', 'Frozen stasis; hardened forms', 'Ax-2 corrupted · Ax-6 · Ax-9', 7.7,
    'The Frozen World. The planet exists in a frozen cosmic moment.',
    [poi('ice', 'Glassy frozen surface', 'ice', 0, 40, 'Pale ice-blue and glass-smooth. Nothing on the surface moves.')],
    { geometry: 'faceted', surface: { ramp: ['#3c6fa8', '#9fd0f4', '#f2fbff'], scale: 2.2, rough: 0.15, metal: 0.2, glow: '#cfeeff', self: 0.25 }, crystals: { count: 30, color: '#bfe0f8', glow: '#9fdcff', len: 0.55, wide: 0.16 }, halo: { color: '#9fd8ff', size: 3, opacity: 0.4 }, extent: 1.7 }],
  [13, 'Kyrathos', 'The Truth World', 'Hidden Awareness', 'Minimal life; awareness without form', 'Hidden world of awareness', 'Ax-6 corrupted · Ax-4 · Ax-2', 7.4,
    'The Truth World. Hidden awareness: almost no life, and nothing here is permitted to change.',
    [poi('limb', 'Violet limb-glow', 'phenomenon', -90, 0, 'Near-black, except for one dim violet glow along the limb.')],
    { geometry: 'faceted', surface: { ramp: ['#06040b', '#1a1028', '#3a2460'], scale: 3.2, cracks: { scale: 2.2, w: 0.02 }, glow: '#7a4bd0', power: 0.6 }, crystals: { count: 16, color: '#1a1028', glow: '#3a2070', len: 0.35, wide: 0.22 }, debris: { count: 26, color: '#241838', spread: [1.5, 2.2] }, halo: { color: '#7a3cff', size: 3, opacity: 0.3 }, extent: 2.2 }],
  [14, 'Nexyros', 'The Humanoid Prime World', 'Abandoned', 'Nexyrosillians, scattered', 'Abandoned', 'Ax-1 corrupted (dispersed) · Ax-9 · Ax-3', 7,
    'The Humanoid Prime World. Abandoned: pale, hollow, and marked by a faint spiral scar.',
    [poi('scar', 'Spiral scar', 'anomaly', 0, 10, 'A faint spiral is cut into the pale surface.')],
    { surface: { ramp: ['#1c2430', '#5b6a80', '#b8c4d4'], scale: 2.6, spiral: 3, glow: '#9fc0ff', power: 0.7 }, spires: { count: 20, color: '#8090a8', glow: '#bcd4ff', h: 0.5, lon: 0, lat: 78, spread: 0.85, style: 'tower' }, atmosphere: { color: '#9fb8e0', opacity: 0.16 }, extent: 1.45 }],
  [15, 'Jynaera', 'The Time World', 'Hyper-Accelerated', 'Avians; fast-lived civilizations', 'Hyper-accelerated time', 'Ax-5 corrupted · Ax-4 · Ax-6', 6.7,
    'The Time World. Cosmic time runs faster here: civilizations rise and fall in flickers.',
    [poi('swirls', 'Motion-blur swirls', 'phenomenon', 45, 0, 'The surface smears into swirls, as if it were moving too fast to see.')],
    { surface: { ramp: ['#3a0a55', '#b030d0', '#ff8cf0'], scale: 2, bands: 9, bandMix: 0.7, swirl: 3.2, glow: '#ff9cf5', self: 0.45, rough: 0.4 }, lattice: { color: '#ffb8f8', detail: 2, opacity: 0.5 }, halo: { color: '#d040ff', size: 3.2, opacity: 0.45 }, spin: 3 }],
  [16, 'Sylvanir', 'The Conscious World', 'Sentient Forest', 'Forest sapients', 'Sentient forest consciousness', 'Ax-6 corrupted · Ax-5 · Ax-7', 6.4,
    'The Conscious World. The entire biosphere is one continuous forest awareness.',
    [poi('canopy', 'Canopy patterns', 'forest', 0, 20, 'The canopy forms patterns that look like faces.')],
    { surface: { ramp: ['#0a1f0c', '#1f5a22', '#3f8f34'], scale: 3.4 }, canopy: { count: 46, color: ['#14401a', '#226b26', '#3a8f30'], size: 0.26 }, atmosphere: { color: '#5ad06a', opacity: 0.16 }, extent: 1.25 }],
  [17, 'Velkryn', 'The Consumption World', 'Crimsonian Titans', 'Greatkin Cyclopes, single-eyed giants', 'Pure consumption', 'Ax-7 corrupted · Ax-8 · Ax-3', 6.2,
    'The Consumption World. Home of the Crimsonian Titans.',
    [poi('rings', 'Negative-space rings', 'ring', 90, 0, 'Dark rings like open mouths circle the crimson world.')],
    { surface: { ramp: ['#200306', '#8a0f18', '#e0303a'], scale: 2.8, cracks: { scale: 2.6, w: 0.03, dark: true }, glow: '#ff5060', self: 0.3 }, rings: [{ inner: 1.4, outer: 1.75, tilt: [1.3, 0.2], color: '#0a0002', opacity: 0.85, solid: true }], halo: { color: '#ff2a3a', size: 3, opacity: 0.4 }, extent: 1.8 }],
  [18, 'Ignara', 'The Instability World', 'Perpetual Ignition', 'Reptiloids, fire-kin', 'Failed balance; perpetual ignition', 'Ax-3 corrupted · Ax-8 · Ax-1', 6,
    'The Instability World. Entirely on fire, with no stable terrain.',
    [poi('fire', 'Perpetual ignition', 'fire', 0, 0, 'The whole surface burns and never goes out.')],
    { surface: { ramp: ['#3a0c02', '#c8440a', '#ffb02a'], scale: 3, cracks: { scale: 3.4, w: 0.07 }, glow: '#ffd060', power: 2, self: 0.5 }, flames: { color: '#ff8a2a', count: 260, lift: 0.3 }, halo: { color: '#ff6a1a', size: 3.4, opacity: 0.6 } }],
  [19, 'Uralyx', 'The Perception World', 'What Is Observed Becomes', 'Unknown', 'Perception shapes reality', 'Ax-1 refined · Ax-9 refined · Ax-5', 5.8,
    'The Perception World. What is observed becomes; what is not, fades.',
    [poi('prism', 'Shifting prismatic surface', 'phenomenon', 0, 0, 'The surface colour changes while it is being watched.')],
    { geometry: 'faceted', surface: { ramp: ['#5a5878', '#b8b4d8', '#f4f0ff'], scale: 2.4, iridescent: true, rough: 0.2, metal: 0.4, glow: '#e8dcff', self: 0.2 }, spires: { count: 24, color: '#cfc8ec', glow: '#ffffff', h: 0.7, lon: 0, lat: 78, spread: 0.85, style: 'cathedral' }, halo: { color: '#c8b8ff', size: 3, opacity: 0.4 }, extent: 1.6 }],
  [20, 'Halcyra', 'The Harmony World', 'Oceanic Devotion', 'Aquatics', 'Oceanic harmony with devotion', 'Ax-5 refined · Ax-2 refined · Ax-6', 5.6,
    'The Harmony World. Calm turquoise ocean and devotional aquatic peoples.',
    [poi('bands', 'Calm cloud bands', 'ocean', 0, 15, 'Slow cloud bands over a turquoise ocean.'), poi('ring', 'Planetary ring', 'ring', 90, 0, 'A single pale ring.')],
    { surface: { ramp: ['#0a4a5a', '#18a0a8', '#7fe0d0'], scale: 2.4, bands: 4, bandMix: 0.25, rough: 0.4 }, clouds: { color: '#eafffb', opacity: 0.5, bands: 5 }, rings: [{ inner: 1.5, outer: 1.9, tilt: [1.4, 0.12], color: '#f0d8a0', opacity: 0.5 }], atmosphere: { color: '#5fe0d8', opacity: 0.25 }, extent: 1.9 }],
  [21, 'Wyvera', 'The Ascension World', 'Sky-Dominant Predators', 'Avians, sky-predator lineages', 'Sky-dominant winged predators', 'Ax-3 refined · Ax-7 refined · Ax-1', 5.5,
    'The Ascension World. Sky-dominant winged predators.',
    [poi('wind', 'Wind-streaks', 'phenomenon', 30, 10, 'White wind-streaks cross a sky-blue world.')],
    { geometry: 'faceted', surface: { ramp: ['#3a6fc0', '#8fc4f4', '#ffffff'], scale: 2, bands: 7, bandMix: 0.45, swirl: 1.4, rough: 0.3 }, crystals: { count: 12, color: '#e8f6ff', glow: '#bfe4ff', len: 0.6, wide: 0.12 }, clouds: { color: '#ffffff', opacity: 0.4, bands: 8 }, halo: { color: '#9fd0ff', size: 3, opacity: 0.4 }, extent: 1.6 }],
  [22, 'Rhyzor', 'The Resonance World', 'Sound Is Matter', 'Beastfolk and synthetics of sound', 'Sound is matter', 'Ax-6 refined · Ax-8 refined · Ax-7', 5.4,
    'The Resonance World. Sound is matter here.',
    [poi('ripples', 'Concentric sound-wave ripples', 'phenomenon', 0, 0, 'Rings of sound spread across the surface from one point.')],
    { surface: { ramp: ['#060d24', '#14306a', '#4a78c8'], scale: 2.2, ripples: 16, glow: '#6fd0ff', power: 1.4, rough: 0.3, metal: 0.4 }, sonic: { color: '#6fd0ff' }, halo: { color: '#3a8cff', size: 3, opacity: 0.4 }, extent: 2 }],
  [23, 'Elythera', 'The Floating World', 'Elevated Continents', 'Avians, floating civilizations', 'Floating continents', 'Ax-4 refined · Ax-9 refined · Ax-5', 5.3,
    'The Floating World. Gravity-defying continents and a civilization built on many altitudes.',
    [poi('continents', 'Floating continents', 'floating', 0, 30, 'Whole landmasses hover above the surface.')],
    { surface: { ramp: ['#1a5a70', '#5fb8c8', '#eafaff'], scale: 2.4, rough: 0.4 }, islands: { count: 16, rock: '#8fa0b0', top: '#d8f0f4', alt: [1.16, 1.4], size: 0.2 }, rings: [{ inner: 1.7, outer: 1.82, tilt: [1.35, -0.15], color: '#f0d8a0', opacity: 0.5 }], clouds: { color: '#ffffff', opacity: 0.4, bands: 0 }, atmosphere: { color: '#9fe8ff', opacity: 0.22 }, extent: 1.9 }],
  [24, 'Xylos', 'The Crystal World', 'Frequency-Locked', 'Energy-based, crystalline', 'Crystalline; frequency-locked', 'Ax-8 refined · Ax-1 refined · Ax-4', 5.2,
    'The Crystal World. Crystalline and frequency-locked.',
    [poi('edges', 'Polyhedral edges', 'crystal', 0, 0, 'Ice-white and prismatic. Every edge is a straight line.')],
    { geometry: 'polyhedron', surface: { ramp: ['#4a5ac8', '#c8a8f0', '#ffffff'], scale: 1.6, iridescent: true, rough: 0.1, metal: 0.5, glow: '#f0e0ff', self: 0.3 }, lattice: { color: '#ffffff', detail: 1, opacity: 0.9 }, halo: { color: '#d0b8ff', size: 3, opacity: 0.45 } }],
  [25, 'Gravaron', 'The Gravity World', 'Extreme Force', 'Beastfolk and synthetics of force', 'Extreme gravity', 'Ax-7 refined · Ax-3 refined · Ax-6', 5.15,
    'The Gravity World. Extreme force.',
    [poi('halo', 'Gravitational lensing halo', 'phenomenon', 90, 0, 'Light bends around the planet in a visible halo.')],
    { geometry: 'faceted', surface: { ramp: ['#08060c', '#221a2c', '#4a3c50'], scale: 3, cracks: { scale: 2.4, w: 0.018 }, glow: '#c8a86a', power: 0.7, rough: 0.9 }, lens: { color: '#b89cff', size: 3.6 }, extent: 1.6 }],
  [26, 'Ferros', 'The Machine World', 'Industrial Dominance', 'Synthetic mortals', 'Industrial dominance', 'Ax-6 refined · Ax-1 refined · Ax-7', 5.1,
    'The Machine World. Industrial dominance.',
    [poi('scars', 'Industrial scars', 'grid', 0, -10, 'Rust-grey ground cut by circuit-like industrial scars.')],
    { surface: { ramp: ['#1c1410', '#5a4030', '#a07050'], scale: 3, grid: 9, gridSoft: true, glow: '#ff9a4a', power: 0.8, metal: 0.5, rough: 0.6 }, spires: { count: 26, color: '#4a3a30', glow: '#ffb060', h: 0.5, lon: 0, lat: 78, spread: 0.85, style: 'stack' }, atmosphere: { color: '#c88a5a', opacity: 0.18 }, extent: 1.45 }],
  [27, 'Viridia', 'The Balance World', 'Life Planet', 'Human Origin', 'Final planet · balance', 'Ax-5 core · Ax-9 · Ax-6', 5,
    'Viridia is the twenty-seventh world of the Aethryx Expanse and the birthplace of humanity within the Expanse. A world of abundant life, deep ecosystems and natural harmony, Viridia holds a unique connection to the Astralite of Growth.',
    [poi('continents', 'Floating continents', 'floating', 60, 25, 'Diverse biomes and floating continents.'), poi('forest', 'Central forest continent', 'forest', 0, 5, 'A massive central forest continent.'), poi('city', 'Major city', 'city', -15, 30, 'Advanced but peaceful civilizations.'),
      poi('waters', 'Crystalline waters', 'ocean', 35, -30, 'Rich Astralite energy in the atmosphere and waters.'), poi('polar', 'Polar region', 'ice', 0, 82, 'Snowbound mountains at the pole.'), poi('viridis', 'Viridis', 'moon', 120, 20, 'Moon. Life reflection.'), poi('lumea', 'Lumea', 'moon', 150, 35, 'Moon. Tidal balance.')],
    { status: 'REFERENCE_APPROVED', placeholder: false, referenceId: 'viridia-planet-view-01', size: 1.3,
      surface: { ramp: ['#0c3a6a', '#1a78b0', '#3fb8c8', '#3a8a34', '#2a6a26', '#8a8a6a', '#f4f6f8'], scale: 2.1, land: 0.44, polar: 0.82, rough: 0.6 },
      clouds: { color: '#ffffff', opacity: 0.55, bands: 0 }, atmosphere: { color: '#8fd8ff', opacity: 0.3 }, islands: { count: 22, rock: '#6a5a48', top: '#3f9a3a', alt: [1.1, 1.26], size: 0.13, falls: true, trees: true },
      spires: { count: 18, color: '#f0ead8', glow: '#fff4c8', h: 0.42, lon: -15, lat: 30, spread: 0.5, style: 'cathedral' },
      moons: [{ id: 'viridis', name: 'Viridis', r: 0.2, dist: 2.0, color: ['#2a4a2c', '#5a8a4a', '#a8c890'], speed: 0.06, phase: 0.6, y: 0.5 }, { id: 'lumea', name: 'Lumea', r: 0.13, dist: 2.4, color: ['#4a4a52', '#8a8a94', '#d8d8e0'], speed: 0.04, phase: 1.5, y: 0.75 }], extent: 1.5 }]
];

function makeWorld([order, name, register, type, civilization, attribute, axes, age, summary, pois, visual]) {
  const quadrant = ZONE_BY_MOD[(order - 1) % 4], current = name === 'Zyraxis';
  return {
    id: name.toLowerCase(), order, designation: null, name, quadrant, ring: Math.ceil(order / 4), celestialType: 'ORDERED_WORLD', currentWorld: current,
    register, type, era: era(order), age,
    visual: { ...PLACEHOLDER, ...visual },
    astragraphy: {
      knowledgeState: current ? 'STUDIED' : 'UNKNOWN', firstObservation: null, summary,
      astraliteInfo: name === 'Zyraxis' ? ['Gem / Energy', axes] : name === 'Viridia' ? ['Life / Growth', 'Natural evolution · regeneration · balance of all living things', axes] : [axes],
      environmentInfo: name === 'Zyraxis' ? ['Crystalline Realms'] : name === 'Viridia' ? ['Lush / Diverse'] : [attribute],
      civilizationInfo: [civilization], historyInfo: [`${era(order)} system · formed about ${age} billion years ago`],
      pointsOfInterest: pois, phenomena: [], dadNotes: [], rizerNotes: [], spaceStudies: [], mysteries: name === 'Nexyros' ? [{ id: 'abandoned', state: 'data', title: 'Abandoned world' }] : [], photographs: []
    },
    playability: { state: current ? 'FULLY_PLAYABLE' : 'OBSERVATION_ONLY' }
  };
}
export const WORLDS = ROWS.map(makeWorld);

// The drift world. Not planet 28: it has a designation instead of an order number and sits outside the ordered cycle.
export const OVAURON = {
  id: 'ovauron', order: null, designation: 'AEP-28', name: 'Ovauron', quadrant: null, ring: null, celestialType: 'DRIFT_WORLD', currentWorld: false,
  register: 'The Drift World', type: 'Drift World', era: 'Drift', age: 4.85,
  visual: { ...PLACEHOLDER, size: 1.25, geometry: 'faceted', surface: { ramp: ['#04080a', '#12302a', '#3a1a5a'], scale: 2.8, cracks: { scale: 2.4, w: 0.035 }, glow: '#9a4cff', power: 1.3 },
    crystals: { count: 20, color: '#10201c', glow: '#3fd08a', len: 0.45, wide: 0.2 }, debris: { count: 60, color: '#1c1428', spread: [1.5, 2.8] }, rings: [{ inner: 2, outer: 2.25, tilt: [1.2, 0.5], color: '#a45cf0', opacity: 0.6 }],
    halo: { color: '#8a3cff', size: 4, opacity: 0.45 }, trail: { color: '#a45cf0' }, extent: 2.3 },
  astragraphy: {
    knowledgeState: 'UNKNOWN', firstObservation: null, summary: 'A drift world outside the ordered cycle. Its wandering path crosses every zone of the Expanse.',
    astraliteInfo: [], environmentInfo: [], civilizationInfo: [], historyInfo: ['Drift · formed about 4.85 billion years ago'],
    pointsOfInterest: [poi('trail', 'Comet-trail', 'phenomenon', 180, 0, 'A faint trail follows the world along its path.'), poi('debris', 'Debris field', 'debris', 90, 10, 'Broken rock travels with it.')],
    phenomena: [], dadNotes: [], rizerNotes: [], spaceStudies: [], photographs: [],
    mysteries: [{ id: 'signature', state: 'astral', title: 'Astral signature' }, { id: 'origin', state: 'object', title: 'Origin' }]
  },
  playability: { state: 'OBSERVATION_ONLY' }
};

// The central star. Its own classification: never listed or numbered as a planet.
export const AENOR = {
  id: 'aenor', order: null, designation: null, name: 'Aenor', title: 'The Highest Eye', quadrant: null, ring: 0, celestialType: 'STAR', currentWorld: false,
  register: 'The Highest Eye', type: 'Central Star', era: null, age: null,
  visual: { status: 'REFERENCE_REQUIRED', placeholder: true, referenceId: REF_OVERVIEW, star: true, size: 2.1, extent: 2.4 },
  astragraphy: {
    knowledgeState: 'IDENTIFIED', firstObservation: null, summary: 'The central body of the Aethryx Expanse and the brightest Eye over it. Every world orbits Aenor, and every Astralite traces back to it.',
    astraliteInfo: ['Origin of all Astralites'], environmentInfo: ['Bright gold-white core · fiery corona'], civilizationInfo: [], historyInfo: [],
    pointsOfInterest: [poi('eye', 'The Eye', 'phenomenon', 0, 0, 'An eye is visible inside the star.'), poi('corona', 'Corona', 'energy', 90, 30, 'A fiery corona with a cross-shaped flare.')],
    phenomena: [], dadNotes: [], rizerNotes: [], spaceStudies: [], mysteries: [], photographs: []
  },
  playability: { state: 'OBSERVATION_ONLY' }
};

// Every Astragraphy target, in observation order: the star, the 27 ordered worlds, then the drift world.
export const TARGETS = [AENOR, ...WORLDS, OVAURON];
export const TARGET = Object.fromEntries(TARGETS.map(t => [t.id, t]));
export const displayNumber = t => t.celestialType === 'ORDERED_WORLD' ? String(t.order) : t.designation || '';
export const displayLabel = t => t.celestialType === 'ORDERED_WORLD' ? `${t.order} · ${t.name}` : t.celestialType === 'DRIFT_WORLD' ? `${t.designation} · ${t.name}` : t.name;

// ── the Astragraphy Log: Rizer's persistent record ──────────────────────────────────────────────
// `store` is any saved object (RP7D passes its inventory) and `save` writes it. Everything the player has
// learned lives in store.astragraphy, so it survives independently of the Telescope.
export function createAstragraphyLog(store, save = () => {}) {
  const S = store.astragraphy ||= { v: 1, targets: {}, history: [] };
  S.targets ||= {}; S.history ||= [];
  const listeners = {};
  const emit = (ev, data) => (listeners[ev] || []).forEach(fn => { try { fn(data); } catch (e) { console.warn('[astragraphy]', e); } });
  const rec = id => S.targets[id] ||= { state: null, firstObservation: null, pois: [], mysteries: [], dad: [], rizer: [], space: [], photos: [], playability: null };
  const stamp = (kind, id, extra) => { S.history.push({ kind, id, t: Date.now(), ...extra }); if (S.history.length > 200) S.history.shift(); };
  // The knowledge Rizer really has (the development override does not change this).
  const state = id => { const base = TARGET[id]?.astragraphy.knowledgeState || 'UNKNOWN', own = S.targets[id]?.state; return rank(own) > rank(base) ? own : base; };
  const observed = id => rank(state(id)) >= 1;
  const unlocked = () => ASTRAGRAPHY_SETTINGS.allUnlocked;
  // What may be shown. Each layer has its own requirement; allUnlocked opens them all.
  const can = (id, section) => unlocked() || rank(state(id)) >= rank(SECTION_REQUIRES[section] || 'UNKNOWN');
  const nameOf = id => can(id, 'name') ? TARGET[id].name : UNKNOWN_TEXT.object;
  function raise(id, to, source) {
    if (rank(to) <= rank(state(id))) return false;
    const was = state(id); rec(id).state = to;
    if (rank(was) < 1 && rank(to) >= 1) { rec(id).firstObservation = Date.now(); stamp('FIRST_OBSERVED', id); emit('observed', { id, source }); }
    if (rank(was) < 2 && rank(to) >= 2) { stamp('FIRST_IDENTIFIED', id); emit('identified', { id, source }); }
    if (rank(was) < 3 && rank(to) >= 3) { stamp('STUDY_COMPLETED', id); emit('studied', { id, source }); }
    save(); emit('change', { id }); return true;
  }
  const observe = id => raise(id, 'OBSERVED', 'telescope');
  function discoverPoi(id, poiId) {
    const r = rec(id); if (r.pois.includes(poiId) || !TARGET[id]?.astragraphy.pointsOfInterest.some(p => p.id === poiId)) return false;
    r.pois.push(poiId); stamp('POI_DISCOVERED', id, { poi: poiId }); save(); emit('poi', { id, poi: poiId }); emit('change', { id }); return true;
  }
  const poiKnown = (id, poiId) => !!S.targets[id]?.pois.includes(poiId);
  function resolveMystery(id, mysteryId) {
    const r = rec(id); if (r.mysteries.includes(mysteryId)) return false;
    r.mysteries.push(mysteryId); stamp('MYSTERY_RESOLVED', id, { mystery: mysteryId }); save(); emit('mystery', { id, mystery: mysteryId }); emit('change', { id }); return true;
  }
  // Hooks for the systems that are not built yet. kind: 'dad' (Notebook pages) · 'rizer' (his own notes) · 'space' (Space Studies).
  function addNote(id, kind, note) { const r = rec(id); if (!r[kind]) return false; r[kind].push(note); save(); emit('note', { id, kind, note }); emit('change', { id }); return true; }
  const notes = (id, kind) => [...(TARGET[id]?.astragraphy[{ dad: 'dadNotes', rizer: 'rizerNotes', space: 'spaceStudies' }[kind]] || []), ...(S.targets[id]?.[kind] || [])];
  // Camera hook: the future Camera app calls this with whatever it captured. Nothing in this build takes photos.
  function addPhoto(id, photo) { rec(id).photos.push({ t: Date.now(), ...photo }); save(); emit('photo', { id, photo }); return true; }
  const photos = id => S.targets[id]?.photos || [];
  // Playability is its own ladder: changing it never touches knowledge, and the reverse.
  const playability = id => S.targets[id]?.playability || TARGET[id].playability.state;
  function setPlayability(id, to) { if (!PLAYABILITY.includes(to)) return false; rec(id).playability = to; save(); emit('playability', { id, state: to }); return true; }
  function completion() {
    const W = COMPLETION_WEIGHTS; let got = 0, all = 0;
    for (const t of TARGETS) {
      const k = rank(state(t.id)), P = t.astragraphy.pointsOfInterest, M = t.astragraphy.mysteries;
      all += W.observed + W.identified + W.studied + P.length * W.poi + M.length * W.mystery;
      got += (k >= 1 ? W.observed : 0) + (k >= 2 ? W.identified : 0) + (k >= 3 ? W.studied : 0) + P.filter(p => poiKnown(t.id, p.id)).length * W.poi + M.filter(m => S.targets[t.id]?.mysteries.includes(m.id)).length * W.mystery;
    }
    return { got, all, pct: all ? Math.round(got / all * 100) : 0 };
  }
  const on = (ev, fn) => { (listeners[ev] ||= []).push(fn); return () => { listeners[ev] = listeners[ev].filter(f => f !== fn); }; };
  return { state, observed, can, nameOf, raise, observe, discoverPoi, poiKnown, resolveMystery, mysteryKnown: (id, m) => !!S.targets[id]?.mysteries.includes(m), addNote, notes, addPhoto, photos, playability, setPlayability, completion, history: () => S.history.slice().reverse(), on, get unlocked() { return unlocked(); } };
}
