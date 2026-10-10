# AA:1936 roster × Master Codex v16.2

Creator request (2026-10-10): "diff the new 1936 roster against codex master roster. add any missing entries. delete none. skip repeats. we will merge entire codex with game soon. humanoids included."

Result: [`game_roster/aa1936_roster.json`](../../game_roster/aa1936_roster.json), the 1936 master roster. It holds the official 1936 list (`aethren_official.json`, unchanged, still the only thing that spawns in the wild) plus every CODEX-sheet entry it was missing, each with the Codex's class, tier, types, archetype, stats and lore. Nothing is wired into gameplay yet; that comes with the full Codex merge.

| | Count |
|---|---:|
| 1936 official roster (including Smogrin and Smogrim) | 196 |
| Codex entries already on it, skipped as repeats | 125 |
| … of those, matched through a confirmed older spelling | 13 |
| Codex repeat rows skipped (Eïrforn, Noctyra) | 2 |
| **Added from the Codex** | **375** |
| · Aethren | 84 |
| · Humanoids | 244 |
| · Unconfirmed (Aethren or humanoid?) | 47 |
| **Total** | **571** |

**Aethren or humanoid:** this follows `data/CODEX_TRIAGE_ZYREX_VS_HUMANOID.md`, an earlier signal-based triage of the Codex. Its REVIEW and GEMLORD rows were left to the Creator, so they are *unconfirmed* here, as is anything new since that triage that has no Humanoid type.

**Older spellings counted as repeats:** Abyssarch (Codex: Abyssarach), Chamelor (Codex: Chameleor), Cindercut (Codex: Cindercur), Floravexa (Codex: Floravex), Gravemourne (Codex: Gravemourn), Luminacore (Codex: Luminacor), Nimbovus (Codex: Nimbovis), Nytopus (Codex: Nyctopus), Sigilmore (Codex: Sigilmor), Sprinkie (Codex: Sprinklez), Suburrow (Codex: Saburrow), Volcanax (Codex: Vulcanax), Voltimite (Codex: Volitimite).

## Added · Aethren (84)

Abominalys, Abyssylyx, Amaelyth, Ancient Peacock, Astralape, Auralux, Aurareris, Avianex, Boreursa, Canyon Vultureking, Canythra, Cinderbeetle, Crownfeather Gryphon, Crycarys, Devormor, Diviniara, Dunechitter, Elrik Draconical, Embercrest, Embermoth, Emberskin Cobra, Faunwell, Flarewisp, Glacial Widow, Glacierwing Falcon, Glaciobolt, Glaucivor, Gloomthane, Gravigon, Gryphycore, Iguanax, Inferleon, Irondrake, Krallathor, Lyncora, Marisyth, Meadowhorn, Morlingspawn, Mudlarion, Myrradon, Nightstang, Obsidian Behemoth, Onyaxius, Ossyrix, Pelagion, Phantuar, Pheonaris, Pyrocarapax, Pyrsect, Redveil Falcon, Rhaegor IV, Robotryx, Rocaris, Ryterrhax, Sagamorne, Sanaraine, Scaleon, Serperyx, Shadowelk, Shadowmink, Sharkfin, Skorleax, Solandra, Solvarion, Sphyxenor, Staevor Beastcall, Stavros Beastcall, Stormcliff Ram, Stormtide Seagull, Sylvarion, Terrathra, Thalassion, Thaloryx, Theryndel, Tick & Tune, Titan Owl, Titantusk, Tonitrex, Verdellum, Voltaryx, Voltibex, Voltmantis, Vorakhan, Vulkarmor.

## Added · Humanoids (244)

Aelion Everfrost, Aelis Iceveil, Aelora Iceveil, Aethra Solcrest, Aionis, Alaric Borealeus, Aldoris, Alphaea, Amira Silverstone, Amyra Silverstone-Veridae, Amyros Silverstone, Andre Hart, Aquaris Korr, Arla Stonebloom, Asha Nylen, Audrelius Veridae I, Audrelius Veridae II, Audrelius Veridae III, Audrelius Veridae IV, Audrelius Veridae IX, Audrelius Veridae V, Audrelius Veridae VI, Audrelius Veridae VII, Audrelius Veridae VIII, Audrelius Veridae X, Audrellius, Auraxion, Aurelia Hart, Aurelios Pearlheart II, Aurellion Veridae, Aurellyn, Aurys Hayden Hart, Azorak, Baelgrin, Bishop Kade, Brakkar Wildscar, Brandt Ironfordt, Brandt Ironfordt I, Brenna Ironfordt, Brontar Highstone, Canyon Saint Dredge, Carl Stormvale II, Carl Valstorm Stormvale III, Cassiel Coralbourne, Cassius Noct, Civaelius Goddhart, Dad's Former Mentor, Dain Cloudwatch, Daniel Hart, Dante Vireo, Despera, Doctor Omorphis, Dr. Selwyn Quill, Draeven Thunderice, Dreavus Aresean, Dreneus Drenn, Drex Volmark, Edda Skarn, Edmund Hart, Edras Starwake, Egnellahc, Eirforn, Elarion Whitefern, Elder Marrowgate, Elder Prime of Nexyros, Eldran Eldersoul, Elisa Hart, Elowen Glaive, Elyndra Atlas, Elyon Everfrost, Elyraes, Elyrion Frostvein, Elyssia Eldersoul, Evron Solari, Fae, Feralis Rex, Gaeldir Goddhart, Galfor Highstone, Glaciara, Graveon Aresean, Hal Benton, Havaerys Valenor III, Havenhawk, Heavaerys Valeonor VI, Helior Dawncrest, Henry Hart, Hollis Quay, Hymn-Matriarch Odelia, Hymynos Crosswind I, Hymynos Crosswind VI, Ignis Oraculos, Illyion Goldmane, Ilma Frostveil, Ilyas Lumeneus, Ilyra Korr, Imogen Riftwright, Imperion, Iscara Iceveil, Jaevis Solbright, Jonah Cinderlane, Juno Rivetale, Kaedryn Frostpoint, Kael Redbanner, Kaelith Valebark, Kaito Murr, Kaivor Drenn, Kaizu Ignar, Kaldir Polaris, Kalenatel, Kess Vinemark, Kessara Ironwake, Kharrek Herrowbrand, Khronicore, Khronis, Korrin Slate, Korven Highreach, Krovyn, Legarion Oldsoul, Leonus Kingsrock, Lerylles Glacierfang, Lezlie Tahiti Stormvale, Lucienis, Lumenna Eldersoul, Lunara Watersoul, Lyle Meridian, Lyrenis Aurepage, Lyssara Iceveil, Maddox Rill, Maelor Borealis, Magnus Goldhouse, Malrec Malviros, Malzareth Malviros, Marcellion Valeonor, Marek Hart, Margaret Hart, Maris Kain, Marris Venn, Marrow the Pale, Marvis Stormvale, Matriaris, Mira, Mira Vell, Mykarlyth, Nara Pearlquay, Natura, Nedrus Drenn, Netherlin, Noctyra, Norell Goddhart, Novakid, Noxurnis, Nyaeri Polaris, Nyxara Grimvoid, Odion, Odrin Fairline, Omniris, Opharion, Ophira, Oraculi, Orin Hart, Orren Saltvow, Orryx, Oshen Koi, Oulira Aquaris, Ovauron, Pearl Regent Isolde, Pelagus Finn, Phoenaris, Princess Ophira, Prof. Yara Loom, Pyraelis Oraculos, Pyraeus, Pyreon Emberlord, Pyris Emberlord, Quotor, Radiant Vicar Soren, Raegis Redrock, Ragnar Whitefang, Ragnor Thunderstep, Rees Hart, Rex Bloodbanner, Rhazek Malviros, Rook Harrow, Rook Sablehollow, Rowan Icevein, Sable Rowan, Saturnis, Scrapjaw, Selyra Aquaris, Ser Calwen Ashward, Sera Trident, Seraphine Auroracrest, Seraphine Rook, Serren Atlas, Solaris Highreach, Solion Highreach, Solvar Atlas, Somnara, Sovereign Vael, Spargus, Steelward, Sun-Archon Calyx, Sydren Coilglass, Sylvaeris Noct, Syria Sirenport, Tarek Horizon II, Tessa Kain, Thalira Corralborne-Korr, Thalorien Korr, Thalric Glacierborne, The Journalist, The Wandering Merchant, Theia, Theorin Grimlord, Thorakor, Thorne Greybloom, Tide-Seer Maelor, Torren Blackquill, Ultharis, Umbrellena Eldersoul, Vaeldrik Crownice, Vaelerys Dragonsong I, Vaelis Watersoul, Vaelor Frostvein, Vaelor Stonewind, Vaelor Stride, Vaelorith, Vaelyra Nethis, Vaerys Silverstone, Valdyr Glacierfang, Vale Ridgewatch, Valek Stormedge, Varek Emberlord, Veda Sunscript, Vesha Grimvoid, Vesper Nyx, Veya Dawnlance, Veynerra Eldersoul, Veyron Glacius I, Veyron Glacius II, Virexil, Vitriarch, Vitricon, Voidward.

## Added · Unconfirmed (47)

Abyssiq, Aegiri, Celestyx, Celsius, Cindereth, Cira Lux, Dr. Niles Whet, Drakkur, Draghoul, Edglen Ironclad, Eira Sleet, Finwyn & Giltyn, Gemorid, Grin Varr, Halden Lightrail, Helix, Ivo Flintline, Kaeloryn, Leonoror, Lumelys, Luminari, Makai "The Mech" Stormvale, Mirax, Nami Rook, Neuromoo, Nimbusor, Nullis, Orivora, Primaria, Prismarill, Psyrexis, Resha, Royalesus, Satyrs, Seraphaela, Sev Quin, Sylvans, Talon Creed, Tervalor, The Quiet Child, Thorne, Threefold, Titanova, Vaelorion, Verdantus, Volcarith, Vorhil.

## For the Codex: on the 1936 roster but not in Codex v16.2 (71)

These are official 1936 names the Codex sheet doesn't have yet. Nothing was changed in the spreadsheet.

Astronyl, Aurelik, Barracana, Boltwish, Bramblup, Celeseal, Celestial, Chronnlet, Chronohawk, Cogling, Cogor, Cravik, Cravotor, Elzebub, Elzimir, Emberpaw, Ferrik, Foongus, Frezivor, Frosalys, Frosane, Frostphen, G112265, Glimsprit, Gloomseed, Gnasharok, Gnashegrege, Gnashling, Gravik, Halovet, Imysarach, Insidirim, Invish, Ivirium, Kravik, Lupinile, Maulimp, Mortyvaxis, Mortyvyl, Mossfawn, Nanoling, Nyxil, Obsiri, Obsydraze, Obsyrax, Ordoler, Pharophix, Pipsekin, Primzlet, Riftling, Rubracket, Scenarill, Serathyl, Shinobio, Shogunox, Skorrax, Solmiryl, Sproutish, Staglordess, Sweedlin, Sygilyn, Thornkit, Tidepup, Tristen, Umbraspawn, Vyrncub, Wynwyrm, Xeriuk, Xytabyte, Zarakai, Zelozon.

## Possible duplicates inside the Codex

- **Pheonaris** and **Phoenaris** are both Codex entries, so both were added. One may be a misspelling of the other.
- **Eirforn** and **Eïrforn** differ only by the accent. The first was kept and the second skipped as a repeat.
- **Ovauron** is filed as humanoid by the triage, but Ovauron is also the name of AEP-28 (the sealed drift world). Check which one the Codex entry means.
