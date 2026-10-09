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

## The AstraNav's seven sections (survey build 9.1)

Creator ruling (2026-10-09): the AstraNav is restructured into seven sections, in this order.

| # | Section | What it holds |
|---|---|---|
| 1 | **SYSTEM** | The home panel. STATUS (location, SUIT and AIR meters, flares, pack, return / flare / disembark), the FIELD SKETCH when you're on the ground, and a widget for every other section. Tap a widget to open that section. |
| 2 | **HEADQUARTERS** | A live digital map of NASARUS: facilities, plots, ruins (surveyed and restored), residents, settled Aethren, and you (blinking) when you're there. A running clock shows whether you're there or away. Below the map are the base's own pages: stages, the way home, the people, materials, facilities, research, workshop, restoration and records. |
| 3 | **NAVIGATION** | The star map, laid out as in RP7D's telescope. Boarding the ship, arriving in orbit and booting the Navigation Center open here. |
| 4 | **COMPANIONS** | Every Aethren card you've cloned, plus the battle team and the lead perk. |
| 5 | **RESEARCH** | Everything else you collect. **In the pack · unredeemed**: materials, ship parts, and research cards scanned away from NASARUS. **Redeemed at NASARUS**: stores and parts at home. **Equipment and crafts**: the AstraNav, the air tank, flares, and your Aethren as weapons. **Research cards**: plants, minerals, places, peoples and bodies in the sky. **The Living Master Codex**: the lore. |
| 6 | **JOURNAL** | The missions: the three objectives, the chapters, the mission list, and an **Expeditions** checklist for each world (clue · warden or guardian · part · refugees). |
| 7 | **SETUP** | The settings. |

**Redeeming:** a research card scanned away from NASARUS is in your pack until you bring it home. Depositing at NASARUS redeems it, for +2 DATA per card. If you die out there, unredeemed cards are lost with the pack. Aethren companions are cloned straight into the AstraNav and never wait to be redeemed, because they fight for you in the field.

## Cloning (survey build 9.2)

Creator ruling (2026-10-09): "getting a card does not allow you to use the aethren. you must clone the card at nasarus first. the card is just the scanned profile."

- **A scan makes a profile.** Scanning an Aethren adds its card (the scanned profile, at the level it was scanned) to the AstraNav. A profile can't battle and can't join the team.
- **Profiles travel in the pack.** Like every card scanned away from NASARUS, a profile waits in the pack until it's redeemed at home, and it's lost with the pack if you die out there.
- **Cloning happens at NASARUS.** At the **Research Station** (COMPANIONS · *Profiles · ready to clone*), a redeemed profile is cloned into a companion at its scanned level. The cost is DATA 2 + 2 × tier and CRYSTAL ⌈tier ÷ 2⌉. The clone joins the team.
- **So the first expeditions are for scanning.** With no companions, you can't fight wild Aethren or wardens: you scan, survive and come home. Building the team happens at the base.
- **Older saves** keep the companions they already used. The rule applies to everything scanned from now on.
