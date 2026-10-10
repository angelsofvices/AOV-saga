# 22 · The party on foot, Aethren at home, and live combat

*Survey 10.18 · 2026-10-10 · Creator:*

> "give party aethren natural follow cycles, not just floating whenever you move. also make all aethren not in party naturally roam nasura. they will eventually do work and socialize on planet while youre gone. you only bring 9 with you. the rest are stored on home planet after cloning. also, no more card battles. no turn based. I wanna see how it looks if the aethren actually fight the enemies on the overworld. create some battle animations. they fight automatically. they attack enemies. we will have different enemy groups but for now just include seers grunts, nova guardians, penumbra, mori, and daemon from canon. see rp7d info for enemy descriptions and behavior."

## The party (up to 9)

- The party walks the map as real bodies, tile by tile:
  - **Following:** each companion takes its own place along the trail the pilot leaves behind.
  - **Catching up:** they hurry when they fall behind, and reappear beside the pilot if they get more than 16 tiles away.
  - **Idling:** when the pilot stands still, they idle nearby: a step here and there, sitting down, turning to look at the pilot.
- Nobody stacks on the pilot or on each other.
- Companions never block the pilot's path; enemies do.
- Fliers bob as they move.

## The rest live on NASARUS

- Every clone not in the party is stored on NASARUS and seen around the camp (up to 40). Each one cycles through:
  - **working:** it walks to a facility or machine and works there (hammer bubble);
  - **socializing:** it keeps another Aethren company (heart bubble);
  - **resting:** it naps by the camp (Z);
  - **wandering.**
- Press A at one to see what it's doing.
- **While you're away:** leaving NASARUS starts a clock. On your return, each Aethren at home has gathered one material per 5 minutes away, up to 10 each (scrap, fibre, crystal, terra), paid into the stores.

## No more card battles: combat is live, on the map

- **No BATTLE screen.** Encounters have no BATTLE button. The old card-battle code stays in the file but is never called.
- **The party fights on its own.** Any enemy within 7 tiles of the pilot, or one already fighting, draws the nearest companions in:
  - companions whose type is Aura, Astral, Radiant, Spirit, Elemental, Tech, Crystal, Divine or Chrono fire bolts in their type's colour from 4 tiles;
  - the rest close in and strike.
- **Damage:** attack against defence, scaled by level, with type advantage against Aethren foes.
- **Animations:**
  - lunges, slash arcs, bite marks;
  - bolts with trails, impact sparks, shockwave rings;
  - hit flashes, floating damage numbers, HP bars;
  - death bursts and fade-outs, and hearts for calmed Aethren.
- **Enemies fight back.** They hit companions or the pilot; a hit on the pilot damages the SUIT, and an empty SUIT means recall, as before.
- **Downed companions** lie where they fell and get back up at 25 % once the fighting has stopped for 6 seconds.
- **Rewards:**
  - experience for every companion that fought nearby, with level-ups, within the Aethren cap;
  - a chance of a material drop;
  - `S.kills` per enemy kind;
  - each defeated group counts as a battle won (`S.fightsWon`), which feeds the ship-level gates.
- **Aethren are calmed, not killed:**
  - **Wild Aethren that charge:** the party meets them live.
  - **Vault guardians:** calming one opens the vault, as before.
  - **Wardens:** their Aethren are spawned and calmed live. The warden steps aside and pays the reward, as before.

## The five enemy groups (`explorer/enemies.js`)

From the canon (`data/ENEMY_CANON_2026-09-14.md`, RP7B's `ENEMY_BASE_STATS`, RP7D's `nova` definition):

| Enemy | Lineage | Base (HP/ATK/DEF/SPD) | Behaviour here |
|---|---|---|---|
| MORI | corrupt Haemen, tier 1, the baseline grunt | 125 / 5 / 45 / 40 | packs of 2–4 patrol open ground · neck bite |
| DAEMON (Black or Red) | corrupt Haemen, tier 2, a faster Mori | 125 / 5 / 40 / 70 | lurks alone or in pairs, half-seen until close · hook punch |
| SEER GRUNT | the Seers' foot-soldiers | 95 / 4 / 55 / 55 | hold a post in twos and threes · staff strike |
| NOVA GUARDIAN | Thardin faction, ranged tech | (RP7D: blaster rifle) | keeps its distance, fires amber bolts, backs off when you close in |
| PENUMBRA | seized Thardin war machine, tier 6 commander, 1.45× size | 800 HP | lone, heavy · shadow crush; walks only in Thardin until you have reached Thardin, then spreads |

**Placement (a proposal):**
- **Zyraxis** follows the district canon:
  - Malezor has no Daemons;
  - Daemons thicken from Andrannor on;
  - Thardin has the Nova Guardians and the Penumbra.
- **Other worlds** carry thinner mixed patrols (Mori, Seer Grunts, Daemon, Nova Guardian), so the fighting can be seen everywhere until each world gets its own enemy groups.
- Enemy level follows the world's level plus its tier.
- Enemies respawn on each landing.
- Each enemy has a new 16-pixel sprite; Daemons come in Black and Red.
