# Aethryx Adventures: 1936 · Survey build 10.7 · The suit

Creator direction (2026-10-10): *"make a standard space suit helmet too. air adapts to environment based on upgrades. fully customizable suit. helmet and suit plus colored specs."*

## The standard space-suit helmet

The pilot portrait (CUSTOMIZE PILOT · HEADWEAR) has a new **SPACE HELMET** option:
- a glass dome on a collar ring;
- the rim takes the **helmet** colour, and the glass is tinted by the **visor** colour, with a shine across it;
- the collar ring takes the **trim** colour and carries **spec** lights in the spec colour.

The aviator cap and the other headwear are unchanged.

## A fully customizable suit

CUSTOMIZE PILOT · **SUIT COLOURS** colours five parts. Each part has sixteen quick swatches, a picker for **any** colour, and STOCK to return to the original colour. The changes show on the field figure and the portrait:

| Part | On the field figure | On the portrait |
|---|---|---|
| SUIT | Body (lit and shaded tones made for you) | Collar and shoulders |
| TRIM & BOOTS | Collar ring and boots | Helmet collar ring |
| HELMET | Helmet shell | Helmet rim |
| VISOR | Visor glass | Glass tint |
| SPECS | The coloured spec lights and chest badge | Spec lights on the collar |

The original FLIGHT SUIT presets (suit, helmet and visor) are kept. A custom colour wins over a preset, and STOCK clears it. Custom colours are saved in `S.hero.look.cust`.

## Air adapts to the environment

Every world and Zyraxis district has an **atmosphere** (`explorer/suit.js`), and each atmosphere works the suit's air harder. **The atmosphere assignments are Creator-approved** (2026-10-10: *"atmosphere assignments are good"*).

| Atmosphere | Air × | Where | Module that adapts the suit |
|---|---|---|---|
| Breathable | 1.00 | Viridia, Myraclese, Zyraxis (Malezor, Andrannor) | — |
| Heat | 1.60 | Pyrauna, Ignara, Draevos, Velkryn | HEAT SHIELDING |
| Cold | 1.55 | Yvoris | THERMAL LINING |
| Submersion | 1.80 | Thallassar, Halcyra | PRESSURE SEALS |
| Spores | 1.40 | Arborynth, Cytherion, Sylvanir, Veridan | SPORE FILTERS |
| Thin air | 1.50 | Wyvera, Elythera, Jynaera, Vorashil, Korathen | ALTITUDE REGULATOR |
| Dense | 1.45 | Origon, Quorauna, Rhyzor, Gravaron | LOAD FRAME |
| Radiance | 1.30 | Lumeria, Uralyx, Xylos, Zarvane | GLARE VISOR |
| Void | 1.35 | Kyrathos, Nexyros, Netharion, Xilnar | LAMP ARRAY |
| Smoke | 1.35 | Bellatora, Ferros, Baelgor, Thardin | SMOKE SCRUBBER |

**Modules**
- Fit them at **NASARUS's Workshop** from CUSTOMIZE PILOT · **SUIT SYSTEMS**, paying from the stores.
- A fitted module takes away **three quarters** of its atmosphere's extra strain: Heat drops from ×1.60 to ×1.15.
- Modules stack with the Air Recycler, the Green Breath perk and the air tanks, and sprinting still burns air faster on top.
- Fitted modules show in the inventory's STORES view.

**Readouts**
- AstraNav · SYSTEM shows the current atmosphere under the AIR gauge, for example *ATMOSPHERE · HEAT · AIR ×1.60 · HEAT SHIELDING would adapt the suit*.
- Landing in a hard atmosphere gives the same notice.

The air multipliers, the modules and their costs are still proposals in `explorer/suit.js`; change them freely.
