# Aethryx Adventures: 1936 · Survey build 10.6 · ViceWorld people and the Pilot

Creator direction (2026-10-10): *"first ever viceworld nft samples before AOV™ saga. its origin. here are what the characters looked like. adopt this style for haemen. go with color theory and gems. humanoid skin vs hybrids. design humans like this. also add a customize pilot panel in the system screen as a widget that clicks into a full character build screen. wire everything. dont delete anything. additive."*

## The ViceWorld style (`explorer/vice_art.js`)

The saga's origin characters are rebuilt as native pixel data: 32 × 32 busts drawn at runtime, with no PNGs.

| Part | Choices |
|---|---|
| Head | A big square head with eased corners, a bold black outline, ears, a nose, a neck and collar |
| Eyes | Dot, big shine, closed with blush, pixel shades, sleepy, X, eye patch, wink |
| Mouth | Line, smile, grin, tongue out, red lips, frown, pipe (1936), O |
| Hair | Short, slicked, bob, long, mohawk, spiky, bun, bald, in ten colours (natural plus pink, green, blue and red) |
| Headwear | Bucket hat and cap, both with a **gem badge**; beret; 1936 leather aviator cap with goggles; helmet; halo; horns; cat ears |
| Extras | Earring, freckles, moustache, scar, bandage, cigarette smoke, blush |
| People traits | Beak and crest, snout, beast ears, fins, antennae, visor, one great eye, crystal growths, horns, elf ears, leaf crown, glow |
| Backdrop | A bright gradient |

**Colour theory**
- **Humans:** Viridians, the humanoid peoples, Codex humanoids (other than Haemen) and the pilot keep **human skin**: eight natural tones from fair to deep.
- **Haemen** wear the colour of their **district's Mothergem shard**: Malezor ruby, Zarvane pearl, Andrannor citrine, Veridan emerald, Netharion amethyst, Vorashil sapphire, Xilnar onyx, Baelgor amber, Thardin topaz, Korathen gold.
- **Hybrids** are every people whose body is not human-shaped (beaks, snouts, fins, antennae, visors, cyclops eyes). They wear bold colours, and members of one people share a colour family. Their backdrop is the **complement** of their skin, for contrast; humans get any bright backdrop pair.

**In the game**
- **Portraits:** everyone you talk to (Codex people, folk, camps, wardens, refugees, Malezor's fur trader) shows their ViceWorld portrait in the dialog box.
- **Field figures:** each person's field figure (`explorer/people_art.js`) takes the **same** skin, hair, clothes and hat colours as their portrait, with blush marks or pixel shades on the face, so a person looks like themselves in both.

## CUSTOMIZE PILOT

- **Where:** a **PILOT** widget on AstraNav · SYSTEM shows your portrait and name; tap it for the full **CUSTOMIZE PILOT** screen. Setup has a CUSTOMIZE PILOT button too.
- **Tabs:**

  | Tab | What it sets |
  |---|---|
  | FACE | Skin tone (natural human tones: the pilot is an Earth human) |
  | HAIR | Style and colour |
  | EYES | Eye style |
  | MOUTH | Mouth style |
  | HEADWEAR | Hat, its colour, and the gem on its badge |
  | EXTRAS | Accessories, each toggled on or off |
  | FLIGHT SUIT | Suit, helmet and visor colour (what you wear in the field) |
  | BACKDROP | Portrait background |

- **Choosing:** every choice shows as a small portrait with that option applied. The big portrait and the four-way field figure update live.
- **Buttons:** RANDOMIZE, RESET, CANCEL and SAVE PILOT.

Saving keeps everything that was there before. The portrait is stored as `S.hero.pilot`, and the field kit goes into the existing `S.hero.look`: skin, hair style and hair colour map onto the original kit wherever they match, so the opening's portrait and REFIT YOUR KIT keep working. Nothing was removed.
