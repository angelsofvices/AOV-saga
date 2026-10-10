// ★ 2026-10-09 · AETHRYX ADVENTURES: 1936 · THE WAY HOME (survey build 9)
// Creator direction (2026-10-09): an extraction game where the Aethren are your weapons.
// Lead the team through the worlds, find the clues, survive, and bring the loot home to
// NASARUS to rebuild the ship until it can reach hyperspace and take you back to Earth.
// Haemen wardens hunt you as the alien; some peoples are allies. NASARUS becomes home,
// and is populated with Aethren you settle there and refugees you rescue from war regions.
//
// Everything here is an IMPLEMENTATION PROPOSAL (names of parts, costs, perks, which worlds
// hold wardens or refugees). Change it freely; the engine reads this file.
window.AOV_EXP = {
  // THE SHIP · seven systems. Every world (1–27; AEP-28 is sealed) holds one sealed vault with one
  // part. World n's part belongs to system (n − 1) mod 7, so the needs below add up to 27:
  // a perfect ship means every world has been explored.
  ship: {
    name: 'THE SHIP',
    systems: [
      { id: 'hull',   name: 'HULL',                 part: 'HULL ALLOY',     cost: { scrap: 6, fibre: 2 } },
      { id: 'life',   name: 'LIFE SUPPORT',         part: 'AIR FILTER CELL', cost: { fibre: 4, crystal: 2 } },
      { id: 'power',  name: 'POWER PLANT',          part: 'POWER CELL',     cost: { crystal: 4, scrap: 2 } },
      { id: 'core',   name: 'DRIVE CORE',           part: 'DRIVE CRYSTAL',  cost: { crystal: 6, data: 6 } },
      { id: 'nav',    name: 'STAR COMPASS',         part: 'STAR LENS',      cost: { data: 10, crystal: 2 } },
      { id: 'shield', name: 'HYPERSPACE SHIELDING', part: 'SHIELD PLATE',   cost: { scrap: 8, relic: 1 } },
      { id: 'coil',   name: 'HYPERSPACE COIL',      part: 'COIL WINDING',   cost: { relic: 2, crystal: 4, data: 8 } }
    ],
    done: 'Every system is restored. The ship could reach hyperspace. The way home is open.'
  },
  // THE LEAD CARD'S FIELD PERK · your team keeps you alive. The lead Aethren's first type decides it.
  perks: [
    { id: 'sight',  name: 'FAR SIGHT',   types: ['Radiant', 'Astral', 'Divine'],                         text: 'You see further: the fog lifts two tiles wider.' },
    { id: 'breath', name: 'GREEN BREATH', types: ['Verdant', 'Nature'],                                  text: 'It breathes out what you breathe in: AIR drains a fifth slower.' },
    { id: 'calm',   name: 'CALM AURA',   types: ['Spirit', 'Unknown', 'Chrono'],                         text: 'Territorial creatures settle instead of charging.' },
    { id: 'quiet',  name: 'SOFT FOOT',   types: ['Beast', 'Creature', 'Humanoid', 'Aquatic'],             text: 'Sprinting no longer scares skittish creatures.' },
    { id: 'sense',  name: 'VAULT SENSE', types: ['Tech', 'Crystal', 'Extraterrestrial'],                  text: 'Sealed vaults show on the field sketch, clue or no clue.' },
    { id: 'fury',   name: 'WAR FURY',    types: ['Elemental', 'Draconic', 'Ultramax', 'Corrupted', 'Aura'], text: 'Your Aethren party hits a fifth harder in every battle.' }
  ],
  // WARDENS · on worlds with a people, a warden guards the vault and hunts the alien on sight.
  // Worlds with no people (records only), and Zyraxis, have an Aethren guardian at the vault instead.
  warden: { team: 3, levelUp: 6, suitHit: 35, reward: { relic: 2, data: 12 } },
  guardian: { levelUp: 8, reward: { relic: 1, data: 8 } },
  // REFUGEES · every world with a people has a war region with a refugee camp (provisional: the
  // Creator to name which worlds are at war). They come to NASARUS once the warden is beaten and
  // there is a Habitation Zone to take them to.
  refugees: { needs: ['habitation'], reward: { data: 6 } },
  // ALLIES · a people who have taught you also aid you once: your suit is patched and your team rested.
  ally: { suit: 30 }
};
