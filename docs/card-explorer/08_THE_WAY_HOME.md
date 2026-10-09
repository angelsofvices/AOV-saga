# Aethryx Adventures: 1936 · Survey build 9 · The Way Home

## Creator direction (2026-10-09), word for word

> keep it as is, just lose the pack. suit ai delivers you back to base on death logic. also I want this to be like an extraction shooter but the aethren are your weapons. you lead the team to find clues to get you through the worlds and back home, they help you survive. build the right team, find the right clues. haemen bosses along the way that try and kill you since youre the alien to them. some allies that help. the whole idea is to bring your loot back to nasurus to fix your ship to be able to reach hyperspace back home. it is too damaged rn. we must upgrade it to perfection which will require exploring all the worlds. in the time being, nasurus becomes home. we will even populate it will new species of aethren and new haemen populations from rescuing refugees from native war regions on planets. its like creating your own planet in the saga

## The loop

**Land → find the clue → beat the warden → open the vault → get home alive → install → repeat.**

Every expedition is an extraction. Air only refills at NASARUS. If you die out there, the suit's AI flies you home to the base, but the pack stays where you fell. A ship part in that pack goes back into its vault, to be won again.

## The ship (`explorer/expedition.js` · `ship`)

The ship is too damaged to reach hyperspace. It has seven systems: Hull, Life Support, Power Plant, Drive Core, Star Compass, Hyperspace Shielding and Hyperspace Coil. Each of worlds 1–27 holds one sealed vault with one part, and world *n*'s part belongs to system (*n* − 1) mod 7. That makes 4 + 4 + 4 + 4 + 4 + 4 + 3 = 27 parts, so **a perfect ship needs every world explored**. AEP-28 is sealed.

Parts count only once they're home. You install them at the Workshop for materials. At 100% the AstraNav reports that the way home is open. **The journey home itself isn't written.** That's a story beat for the Creator.

## Clues

Each vault's lock is a puzzle of marks.

- On worlds with a people, the clue comes from **learning their words** (show them two scans).
- On worlds without a people, the clue is in the world's **records**.
- On Zyraxis, the vault is in **Korathen**, and the clue is with Korathen's people.

With the clue, the vault shows on the field sketch, and the AstraNav points toward it on landing.

## Wardens and guardians (bosses)

On the 18 worlds with a people, a **warden** guards the vault: *WARDEN OF THE [people]*. Wardens are titled by their people and given no invented names. To them you're the alien, and they attack on sight within three tiles.

- **The fight:** a warden sends a chain of three Aethren, the strongest of that world, a few levels higher than the wild ones. You can't scan them while the warden commands them.
- **Lose or run:** you take heavy SUIT damage and are thrown back.
- **Win:** the warden falls back and doesn't return, and you get RELICS 2 and DATA 12.

On the 8 worlds with only records, and on Zyraxis, a strong Aethren **guardian** sits at the vault and charges when you come near. Beating it opens the way.

## Allies

Once a people has taught you its words, they're allies. The first time you go back, they patch your SUIT (+30) and rest your team. They also keep pointing you toward the vault.

## Your Aethren are your weapons

Your battle team fights every warden and guardian, so **build the right team** for the world's types. The **lead card's first type** also gives a field perk:

| Perk | Lead types | Effect |
|---|---|---|
| FAR SIGHT | Radiant, Astral, Divine | The fog lifts two tiles wider |
| GREEN BREATH | Verdant, Nature | AIR drains a fifth slower |
| CALM AURA | Spirit, Unknown, Chrono | Territorial creatures settle instead of charging (guardians still charge) |
| SOFT FOOT | Beast, Creature, Humanoid, Aquatic | Sprinting no longer scares skittish creatures |
| VAULT SENSE | Tech, Crystal, Extraterrestrial | Vaults show on the field sketch without the clue |
| WAR FURY | Elemental, Draconic, Ultramax, Corrupted, Aura | Your cards hit 20% harder |

## NASARUS becomes home

- **Refugees:** every world with a people has a refugee camp in a war region. They come with you once the warden is beaten and the **Habitation Zone** is built, and then they live beside it on NASARUS.
- **Aethren:** build the **Aethren Sanctuary**, then settle any species you hold a spare copy of. It lives on NASARUS from then on.
- **Stage 5 · Emerging World** is now reachable. It needs the Habitation Zone, the Sanctuary, 3 refugee groups and 6 settled species.

## Provisional (for the Creator)

1. **War regions:** for now, every world with a people has one. Which worlds are actually at war?
2. **Part names and costs**, the perks, and warden strength are proposals.
3. **The journey home** at 100% isn't written.
4. **The warden's people:** a warden is drawn from the same people who become your allies on that world. Should wardens be a different faction, such as the war's other side?
