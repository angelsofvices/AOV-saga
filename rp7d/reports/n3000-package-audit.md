# N3000 package audit

Read-only audit of local website packages. No guest source or public website files modified.

| Game | Title | Entry | Runtime | Save | Input | Screen | First pass |
|---|---|---|---|---|---|---|---|
| RP1 | The Long Return | return.html | web-canvas | localStorage | WASD/arrows movement; Space/B endless-mode blaster; mouse drag/touch; native left stick/D-pad + R2; shared controller menu navigation | Responsive canvas sizes itself to window | SELECTED |
| RP2 | The Training Yard | training.html | web-dom | No save calls found | Left/right or A/D attack selection; 1–3 attacks; native gamepad plus shared menu navigation | Responsive DOM card layout | AUDITED_NOT_ENABLED |
| RP3 | The Battlegrounds | battlegrounds.html | web-dom | No save calls found | DOM button/card selections; shared controller navigation | Responsive DOM card layout | AUDITED_NOT_ENABLED |
| RP4 | The Viridian Expedition | expedition.html | web-canvas | localStorage | Arrows/WASD, escape; native gamepad; exploration canvas | Responsive 2D canvas | AUDITED_NOT_ENABLED |
| RP5 | Cardmaster Showdown | cardmaster.html | web-dom | No save calls found | DOM cards/buttons; shared controller navigation | Responsive DOM card layout | AUDITED_NOT_ENABLED |
| RP6 | The Eternal War | realms.html | web-canvas | localStorage | WASD/arrows, Space, Z/J, X/K, 1–3, Escape; native gamepad | 1280×720 fight canvas (16:9) | AUDITED_NOT_ENABLED |
| RP7 | Rizing Power 7 Beta · RP7B | rp7b.html | web-canvas | localStorage | Native RP7B keyboard and controller bindings; own menu and pointer-lock assumptions need adapter review | 960×528 canvas; own responsive scaling | AUDITED_NOT_ENABLED |
| RP8 | The Tree of Power · Arborynth | arborynth.html | web-canvas | localStorage | Arrow movement; native controller menu bridge; touch controls | Square world canvas, responsive HUD | AUDITED_NOT_ENABLED |
| RP9 | The Origins of Power · Gardenlands Playtest | rp9.html | webgl-module | No save calls found | WASD/arrows, Shift, 1–3, Escape; Three.js pointer and controller flow needs isolated host review | Responsive Three.js viewport | AUDITED_NOT_ENABLED |

## Package issues
- RP1 references assets/rp1/rp1_soundtrack.mp3, which was not found in the project, Downloads, Desktop, or Documents.
- RP1 blaster sound located in Downloads/naboo-guard-blaster.mp3; explosion sound located in the website assets/barrel-exploding.mp3. The portable snapshot embeds these exact files.
- RP1 online leaderboard imports a CDN module. The snapshot excludes that optional online module and uses the existing local leaderboard fallback; no external score submissions are sent.
- Website catalog defines RP8 as Arborynth, not the older rp8.html Zyraxis map. RP7 entry is labeled RP7B to prevent recursive RP7D launch.
- Several other titles reference moved assets under assets/rpX; some files now live in _archive/assets. They stay disabled until complete asset packaging and adapter testing.
- RP9 uses a CDN import map for Three.js and GLTF loaders. Offline dependency packaging is needed before enabling.

The JSON companion preserves discovered dependencies, assets, controls, storage keys, screen expectations, hashes, and path limitations for every title.
