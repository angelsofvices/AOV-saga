# SEER COMMANDERS · Ten Officers, Ten Districts
### Design brief for the 4×4 idle sheets · v0.95.699

The top floor of every Seer HQ holds one officer. This is the art direction for all ten, plus the sheet spec and the two rules that keep them reading as a single organisation rather than ten unrelated bosses.

---

## ★ THE TWO RULES

**1 · Humanoid Seer officer FIRST.** Before anything district-specific, every Commander must be legible as the same thing the player has been fighting for eighty grunts: hooded, masked, dark-clad, the Seer sigil at the throat. If you can't tell at a glance that a Commander outranks a grunt *of the same organisation*, the silhouette has failed.

**2 · The district is CORRUPTION, not costume.** The local biology, materials, palette and elder symbolism should look **taken** — grafted, harvested, worn as trophy. The Seers are not of these places. They are occupying them. A Commander who looks like he *belongs* to his district reads as a native guardian, which is the opposite of the story.

The tell that you've got the balance right: **the Seer parts are worn, the district parts are attached.**

---

## ★ RANK LANGUAGE (shared across all ten)

So rank reads before flavour does:

| | Grunt A | Grunt B (Elite) | **Commander** |
|:--|:--|:--|:--|
| Height in game | 2.15 tiles | 2.30 tiles | **~2.9 tiles** |
| Hood | plain, close | plain, longer drape | **layered / high collar rising behind the head** |
| Face | slit + goggles | slit + goggles | **full mask — no eye slit at all, or a single lens** |
| Sigil | small chest disc | chest disc | **large, worn as a pectoral or shoulder plate** |
| Cloak | short tail | long tail | **floor-length, splits at the walk** |
| Trim | thin white piping | white piping | **district material replaces the piping** |

That last row is where the district enters, and it should be the *only* place it enters on the base costume.

---

## ★ THE TEN

Order and numbering as specified. Each entry: **what the district is → what the Seers took from it → how it hangs on the officer.**

### 1 · MALEZOR — Beastlands
Beast-primary world, humanoid-leaning; the player's home. **Taken:** pelts and horn. The Commander wears a mantle of beast hide with the skull-cap still attached, worn like a helm over the hood. Horn fragments laced along the forearms. Rust-red leather under the Seer black.
*Elder echo:* Warden Kelthor teaches the Bond — so this Commander wears the animal as a **trophy**, the exact inversion of Kelthor's covenant. The first Commander the player meets should make that argument visually.

### 2 · ZARVANE — Auralands
Aura, oasis, the Third Eye. **Taken:** sight itself. Pale bandage-wrapping over the eyes — he is blind under the mask by choice — with a pearlescent third-eye plate set into the brow. Aura-blue vapour trailing from the sleeve cuffs.
*Elder echo:* Omniris opened the Third Eye through discipline; this one had one **cut and fitted**.

### 3 · ANDRANNOR — Creaturelands
Creature-primary, dense forest, the fountain district. **Taken:** carapace. Segmented chitin plating across the shoulders and shins, citrine-yellow, still faintly iridescent. Mandible fragments as a collar.
The plates should not fit him properly — sized for something else and strapped on.

### 4 · VERIDAN — Naturelands
Living forest, the river, emerald. **Taken:** growth. Green root-matter has been grafted under the skin of the forearms and is escaping through the sleeves. Leaf-mail scaled from a single enormous frond. Emerald bosses at the belt.
The vegetation should look **parasitic on him**, not decorative — the one Commander whose trophy is winning.

### 5 · NETHARION — Unknownlands
The centre of the map; the district defined by what nobody has established. **Taken:** nothing you can name. Amethyst geometry that doesn't resolve — rings and spirals that read wrong at the edges, exactly like Eurakeon's door. His cloak has more folds than its silhouette allows.
Deliberately the hardest to describe. **Under-design this one.** Ambiguity is the district.

### 6 · VORASHIL — Alienlands
Alien, highland, sapphire, cold. **Taken:** frost and wing. Sapphire-ice spurs along the spine and shoulders. A pair of vestigial wings, frozen mid-fold, clearly not his and clearly dead. Deep blue-white palette, the coldest of the ten.

### 7 · XILNAR — Spiritlands
Spirit, wetland, onyx, violet flame. **Taken:** the dead. Black glass shards set into the mask, each holding a faint violet light — captured spirits. Vapour instead of a lower body silhouette where the cloak parts. Onyx and violet.
*The only Commander who should read as slightly transparent.*

### 8 · BAELGOR — Humanoidlands
Pure humanoid; Mom's home; the amber, royal-relief district. **Taken:** lineage. Amber inlay carrying fossilised *human* forms — the same royal reliefs as Ambrevon's door, but the crowned figures are cracked. A broken circlet worn over the hood.
**The most disturbing of the ten and it should be the subtlest:** this is the district where what got taken was *people*. Baelgor is the player's mother's home.

### 9 · THARDIN — Mechlands
Corporate; mass-produced the Zysphere without understanding it. **Taken:** machinery. Pipework and gear-wheels bolted through the armour, cyan coolant light bleeding at the joints. Some of it visibly does nothing — pipes feeding nothing, wheels turning against their own gearing, exactly like Oathane's vault.
*The anomaly is the point:* a Commander augmented with machinery that shouldn't work, and works.

> Naming note: canon spells the district **Thardin**. *Thardun* is the corporation that manufactures Zyspheres. Your list said Thardun for #9 — flagging it in case you want the corporate name on this one deliberately, which would actually be a good joke.

### 10 · KORATHEN — Ultralands
The final district. Gold, starfield stone, the Empty Throne above it. **Taken:** authority. Prism-white gem at the centre of a gold pectoral — the same white as Oatheus' door, the one Gemlord who never came. Gold filigree over black.
*Elder echo:* he is standing in for someone who isn't there. He should look like a **regent**, not a king — the whole district is built around an absence, and this officer has quietly assumed the vacancy.

---

## ★ SHEET SPEC

Identical to the grunt sheets, so the pipeline is unchanged:

```
1254 × 1254 · 4×4 grid · cell 313 × 313
row 0 DOWN · row 1 LEFT · row 2 RIGHT · row 3 UP
cols 0-3 = idle cycle
magenta chroma background (#FF00FF family)
```

**Filenames:** `assets/2D sprites/enemies/seer-commander-<district>.png`
e.g. `seer-commander-malezor.png`

### Two things that cost time if missed

- **Keep the figure clear of the cell edges.** A Commander is ~2.9 tiles, the tallest humanoid sheet in the game — it's tempting to fill the cell. Anything touching a cell boundary is severed there and renders as a floating fragment beside the neighbouring frame. A pixel or two of margin is enough.
- **No enclosed magenta.** Gaps sealed by the silhouette — inside a raised arm, under a cloak fold — can't be reached by the corner flood and survive as hot pink specks. A second pass catches them, but it's cheaper if the art doesn't create sealed pockets in the first place.

---

## ★ WHAT'S WIRED NOW

- Three floors per HQ: **vault (14×10) → hall (20×15) → command (14×12)**
- Silver chest moved to the vault; it now yields **that district's Seer Key**
- Stair to the top floor **locked** until the key is held — per district, ten separate raids
- **8 grunts** patrolling the hall you have to cross twice
- **One Commander NPC** that renames and re-sheets itself per district, exactly like the interior does
- Placeholder sprite until each sheet lands, so a missing asset is the wrong costume rather than an invisible NPC

**Not built yet:** the fight. `talkToSeerCommander()` delivers the district line and stops there rather than faking a battle with a toast. Encounter design is the next decision — stats, party, whether defeat opens something.

Related canon: `aov-seer-hq-network` · `aov-district-wheel-canon` · `aov-rp7-enemy-mapping` · `aov-gemlord-cave-network` · `aov-viridian-humanoid-primary-key`
