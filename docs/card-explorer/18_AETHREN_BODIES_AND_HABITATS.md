# 18 · Aethren bodies and habitat compatibility

*Survey 10.13 and 10.14 · 2026-10-10*

> Creator: "add more differentiations across body types… more not less."
> Creator: "zyraxis has the most diversity of aethren but all worlds have aethren that match habitat compatibility."

## Bodies (`explorer/aethren_variants.js`)

- **42 native body plans:**
  - the 4 canon bodies;
  - the 12 earlier silhouettes;
  - 26 added on 2026-10-10: stag, hound, feline, bear, ape, hopper, frog, ray, eel, jelly, urchin, snail, wasp, dragonfly, owl, wader, drake, turtle, scorpion, spider, mantis, worm, wisp, drone, mushroom, hydra.
- **Every variant also gets** (from `art.js` `registerVariant`):
  - a **pattern**: spots, stripes, bands, speckle, mottle or belly, painted inside the outline;
  - a **second feature**, including contour features that follow the body (spikes, mane, tendrils, aura, tusks, plates, halo, whiskers).
- Every variant renders differently.

## Habitat compatibility

- **Body environments.** Each body lives in some of these environments: water, sky, under, heat, cold, wild, arid, ruin, arcane and land (`BODY_ENV`).
  - fish: water only;
  - drake: sky, heat, land;
  - owl: sky, wild, ruin, cold.
- **Habitat tags.** Each habitat carries its own tags, plus its world's canon kind from `biomes.js` (ocean → water, fire → heat, ascension → sky, and so on).
- **Spawning.** A variant spawns only where its body and its habitat share an environment.
- **Nothing deleted.** Pairings that don't fit stay registered but hidden: they never spawn, and saved cards still open.
- **Totals:** 89 habitats × 42 bodies = 3,738 registered variants. 1,919 are compatible.

## Every world, and Zyraxis first

- Every world from 1 to 27 has at least three habitats.
  - The 51 new habitats take their names from that world's canon biome manifest (`biomes.js`): Great Scale Slopes, Carbide Dusk, Perpetual Ignition, Predator Aeries, and so on.
  - Worlds 7, 13, 18 and 21, which had none, now have their own Aethren.
- **Zyraxis** has the most:
  - 405 compatible kinds across its eleven district habitats, which carry the broadest environments;
  - the next most is Viridia, with 108.
- **AEP-28 stays sealed.** The "Worldender Stormline" habitat row is kept in the data but never registered, because the Worldender is the drift world.
