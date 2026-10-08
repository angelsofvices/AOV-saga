# RP7D · Malezor NPCs: the cast, ready to build in 3D

**Source:** `rp7b.html` (Sep 25): the `NPCS` table, `STUDENTS`, `DISTRICT_ELDERS`, and the interiors. Every name, position, role and line of dialogue below comes from RP7B unless it's marked ⚠. RP7B is canon; this file is its 3D brief.
**Look reference:** `rp7d/Claude outputs/_malezor_npcs_sheet.png` shows all 24 sprites side by side. The full 4×4 sprite sheets are in `/Users/mctherockstar/Documents/GitHub/AOV-saga-new/assets/2D sprites/`.
**Scope:** Malezor only (District I · Beastlands). Enemies are listed at the end for reference, but they aren't part of this NPC build.

---

## How to read an entry

- **Place:** the RP7B tile `(x, y)` followed by the RP7D position. RP7D converts with `world-data.js` → `fromRP7B` (K 2, centre 61, 94), which the world pass already uses. For NPCs, pass the tile through `site()` / `P()` just as the buildings do. Interiors don't exist in RP7D yet (see "Interiors" at the end).
- **Faces:** the direction the NPC stands facing in RP7B.
- **Height:** relative to Rizer (1.0).
- **Rig:** every humanoid shares Rizer's Mixamo rig, so it takes our clips (idle, walk, talk, point). Animal-headed people are humanoid bodies with a sculpted head, ears, horns or tail parented to the Head and Hips bones. Bodies that aren't humanoid are called out.
- **Behaviour:**
  - `stationary`: holds its spot. It **turns to face Rizer** on interact and blinks while idle.
  - `idle`: stands in place with a small idle loop.
  - `wander`: roams a small radius around its home spot.
- **Lines:** verbatim from RP7B. `*asterisks*` are stage directions and should play as a gesture clip where one exists. Use the Zyphone dialogue style for text.
- **Items:** per canon, an NPC hand-off is one of only three ways Rizer can get an item (chests, NPC hand-offs and designed world finds are the others). Any gift below must be handed over with an animation, and the item appears in Rizer's hand. Nothing just shows up.

---

## A · Family (Rizer's home and Dad's lab)

### Mom
- **Place:** inside Rizer's Home, ground floor (interior tile 7, 3), facing down. Until the home interior exists, stand her **on the home's front step, just inside the door light**, at about (−78, 20).
- **Look:** a warm, kind mother of average height (0.95). Shoulder-length brown bob with a soft fringe, fair-to-light skin and green eyes. Moss-green dress with puffed short sleeves over a cream underblouse, a cream apron, a brown belt with a gold buckle, and brown shoes.
- **Behaviour:** `stationary`. She never wanders.
- **Role and hand-offs:**
  - Gives the **Zycube**, a "smooth cube of woven starlight" that stores anything found on the road, with **2 Potions** tucked inside. This is the backpack the Creator mentioned; it can become our inventory.
  - Hatches the **Elzebub egg** if Rizer brings one. The **Elzebub** hatches and joins his party at Lv 10.
  - Holds Dad's notebook for Rizer to deliver.
- **Lines:**
  - "Oh honey — before you go..."
  - "*hands you a smooth cube of woven starlight* This is my Zycube. It stores anything you find on the road."
  - "*tucks two potions inside* And take these — heal a scrape before it becomes a scar."
  - Egg: "*gasps · gently takes the egg* Oh, honey · is this what I think it is?" … "Look at that. It chose you. You take good care of this one, alright?"

### Yara · Rizer's little sister
- **Place:** inside the home beside Mom (interior tile 9, 3). Outdoors she stands next to Mom.
- **Look:** a **kid, 0.75 of Rizer's height** (canon spec), described in RP7B as a "green-haired kid warrior".
  - Very long, thick **bright green hair** falling past her shoulders, with two small gold clips.
  - Warm brown skin.
  - Navy tunic with **gold armour trim** and a gold chest emblem with a blue gem, gold pauldrons, and brown boots with gold bands.
  - She has her own **jog** sheet (`yara-jog.png`), so give her a jog loop.
- **Behaviour:** `stationary`, turns to face Rizer, and can follow Rizer while escorted: Professor Elarion wants her with Rizer when he registers.
- **Rules:** no soul swap; she's family, not a faction Zyrex.
- **Lines:**
  - "*grins* Lucky you got your own room upstairs. I'm still sharing wall with Mom's snoring."
  - "When you catch a really cool Zyrex, bring it back to show me, okay??"

### Dad · the beastologist
- **Place:** **Dad's Research Facility**, upstairs lab (interior tile 17, 3). Until interiors exist, stand him **at the facility door**, at about (−78, −106).
- **Look:** a tall, broad-shouldered man (1.05). Dark brown skin, short black hair, a trimmed full beard. White shirt with rolled sleeves, a **black waistcoat with brass buttons**, a thin brown tie, and dark trousers and shoes. He looks like a scientist, not a fighter.
- **Behaviour:** `stationary`, at his scope. The first line has him not looking up, so give him a "lean over the desk or telescope" idle.
- **Role:**
  - Starts the **Starter Quest**.
  - Mom sends Rizer to him with his notebook. He refuses it and gives **Dad's Notebook** back to Rizer, which becomes the Zyphone → Notebook page.
- **Lines:**
  - "*does not look up from the scope* Busy morning, kid."
  - "Go see your mother before you do anything else. She has been holding something for me all morning and I know that face."
  - "Your mother sent you all this way to hand me a book I left behind on purpose."
  - "I said keep it. I have walked every field in that book twice. It is finished. I am not."

---

## B · The civic mentors

### Warden Kelthor · Elder of Malezor
- **Place:** tile (22, 82) → **(−78, −24)**, just **south of the Town Hall door with his back to it, facing south** down the road.
- **Canon:** Malezor's district Elder. He teaches **The Bond**, and his seat is the **Beastwarden's Hall** (the town hall). His 8-step Elder ladder ends with "3 Soulphish + enter Zarvane".
- **Look:** a tall old man (1.05) with an upright, dignified bearing. Long **white hair swept back** and a full white beard to the chest, with bushy brows. A **royal-blue greatcoat with gold trim and a white fur collar**, a brown belt with a gold buckle, and dark boots.
- **Behaviour:** `stationary`, turns to face Rizer.
- **Role:**
  - Won't take Rizer until he has his **R.A.I.D.** card from Professor Elarion.
  - Then he enrols him in the **Beastmaster Practicum** and asks for **10 Seeds** for his ward.
- **Lines:**
  - "*looks you over once · not unkindly* Beastmaster path, is it. Your father's road."
  - "I take students, not visitors. The Academy registers a Rizer before I can enrol one."
  - "*nods toward the school* Get your R.A.I.D. from Professor Elarion. Bring it back, and we begin."
  - "*a rare, short laugh* Your father stood where you are standing, and he was worse at it."
  - "First thing a beastmaster learns is that the animal eats before he does."

### Professor Elarion · elephant scholar, Rizer Academy
- **Place:** tile (27, 128) → **(−68, 68)**, in front of the **Malezor School**.
- **Name note:** the display name is **"Elarion"**; the code id is `professor_elarian`. RP7D's current note says "Elarian", so fix it to **Elarion**.
- **Look:**
  - A **grey elephant-headed scholar** (1.1, heavy-set) with large ears, short ivory tusks, **round gold spectacles** and a tuft of dark hair.
  - A **forest-green academic coat** with gold piping and a crest patch on the chest.
  - A brown waistcoat and belt with pouches, dark trousers and brown shoes.
  - The trunk hangs to mid-chest.
- **Behaviour:** `stationary`, turns to face Rizer. Give him an "adjust spectacles" gesture.
- **Role:** hands out the **R.A.I.D.** (Rizer Academy Identification) card, a "shimmering silver card". Only when Rizer brings **Yara** ("a Rizer's first ID is a family occasion").
- **Lines:**
  - "*peers over his spectacles* Come back with your sister, Rizer."
  - "A Rizer's first ID is a family occasion. Bring Yara from your home · then we can begin."
  - "*produces a shimmering silver card* Your R.A.I.D. — Rizer Academy Identification. Every student carries one."
  - "The Academy holds the oldest bond-lore in Zyraxis · come by when the doors open."

### Assistant Professor Vireta · giraffe mystic
- **Place:** in RP7B she's **inside the school classroom**, at the front lectern. For now, put her **beside Elarion at the school**, at about (−64, 70).
- **Look:**
  - A **giraffe-headed woman**, notably **tall at 1.25**; "she is a good deal taller than the desk". Short ossicone horns, large ears, patterned golden hide and long wavy brown hair.
  - A **violet and white mystic robe** with gold trim and a gold waist gem.
  - Divine-type.
- **Behaviour:** `stationary`, lore-only (no battle).
- **Role:** gives **8 Zyspheres** as enrolment ("Not a gift — an enrolment") and asks Rizer to bring back three bonded Zyrex.
- **Lines:**
  - "*looks up, and keeps looking up — she is a good deal taller than the desk*"
  - "A sphere does not catch anything, Rizer. It holds the moment a Zyrex decides. Your bond makes the moment; the sphere only remembers it."
  - "*almost an afterthought* Kaizari sat where you are standing. She still writes."

---

## C · Shops and services

### Scrapjaw · hyena bandit, Gear Shop
- **Place:** tile (16, 58) → **(−90, −72)**, outside the **Malezor Gear Shop**.
- **Look:**
  - A **spotted-hyena man** (1.0, lean and wiry) with a tan hide, dark spots, a black muzzle, a scruffy mane and big round ears.
  - A **dark olive hooded scarf**, worn brown leather armour with crossed bandoliers and **knives at his belt**, and wrapped forearms and shins.
  - Bandit silhouette, friendly face.
- **Behaviour:** `stationary`, turns to face Rizer.
- **Role:**
  - Runs the Gear Shop.
  - Owns the **radio-tower** questline: bring back the tower remotes and he brings each district online, and slots a **Phone Battery** into the ZyCellite.
  - Becomes a companion: "I'm rollin' with you from here on out."
- **Lines:**
  - "*claps hard on your shoulder* I'm rollin' with you from here on out · gear-work wherever you stand."
  - "My crew spent nine years failing at what you did in one run. Whatever you need, wherever you stand · you call, I answer."
- ⚠ **Name collision:** canon also has a Zyrex line "Plainshound → Scrapjaw". The NPC keeps the name.

### Zurelea · octopus alchemist, Potion Shop (the "Potion Maker")
- **Place:** tile (11, 140) → **(−100, 92)**, in front of her own Potion Shop door.
- **Look:**
  - An **octopus-woman**: a humanoid upper body with **eight purple tentacles instead of legs**, spreading around her like a skirt. She is purple-skinned with a head-fin crown and a small gold forehead gem.
  - A **long violet gown with gold filigree** and a gold neck clasp.
  - Height 1.0 to the head; the tentacles spread wide.
- **Rig:** ⚠ not humanoid below the waist. Use the Mixamo upper body with the legs hidden. The **tentacles are separate skinned chains**, or a procedural sway (sine-wave bones), parented to Hips. Her stance is a slow bob, and she **glides** rather than walks.
- **Behaviour:** `stationary`.
- **Role:**
  - Won't trade until Rizer brings the **Ruby Vial**. It was her mother's, and a Seer quartermaster took it; RP7B keeps it at **Seer HQ 1F**.
  - After that she sells **ales, potions and elixirs**: "I charge a premium, but I never run dry."
- **Lines:**
  - "Welcome to the Malezor Potion Shop. I would love to sell you something. I can't."
  - "*her tentacles uncoil all at once* You FOUND it. The Ruby Vial — my mother's, before the Seers took the shop apart."
  - "Tempered glass. Nothing else holds a volatile brew without cracking halfway through the boil."

### Nurse Rein · reindeer head nurse, Hospital
- **Place:** tile (22, 158) → **(−78, 128)**, a step in front of the **Hospital** door.
- **Look:**
  - A **reindeer/deer-woman** (0.95): tan fur with white spots on her cheeks and arms, **branching antlers**, big ears and long brown hair.
  - A **forest-green nurse's jacket** over a cream blouse, a **white apron**, a brown belt with a blue brooch, and navy trousers.
  - She carries a small cup or phial.
- **Behaviour:** `stationary`, turns to face Rizer.
- **Role:**
  - **Heals Rizer and every Zyrex to full** on talk, with a soft chime (the RP7B SFX is a "sakura chime").
  - Once she's a contact, she can be called from anywhere every 10 minutes.
- **Lines:**
  - "Welcome, dear Rizer! Come here · let me look at those wounds."
  - "*sakura chime* There · every hit patched · every Zyrex ready."
  - "*taps ZyCellite* Dial me anywhere · once every ten minutes I bring a full heal to your tile."

### Kaizari · cheetah warrior, Zyrex Farm
- **Place:** tile (35, 140) → **(−52, 92)**, at the **Zyrex Farm** gate.
- **Look:**
  - A **cheetah-woman** (1.0, athletic) with a golden spotted pelt and black tear-marks under amber eyes.
  - A **huge mane of wavy blonde hair** with braids, and a **long ringed tail**.
  - A **dark green hunter's vest** with a blue gem clasp, leather belts and pouches, dark trousers, and wrapped forearms and shins.
  - Claws.
- **Behaviour:** `stationary`. Her tail should flick in idle; "*tail flicks*" appears in her lines.
- **Role:**
  - Gives the **Fae Net** (woven vine).
  - Asks for **10 fae + 1 Zyrex**, then unlocks the wooden gate behind her into the pasture.
  - She once sat in Vireta's class.
- **Lines:**
  - "*tail flicks · claws out* A Rizer with no net? That is not hunting · that is asking."
  - "Take mine. Feet quiet, breath quieter · that's how you catch a fae."
  - "*tail flicks · unlocks a wooden gate behind her* You've earned this, hunter."

---

## D · Neighbours, friends and classmates

### Albert Orren · bear neighbour
- **Place:** tile (11, 82) → **(−100, −24)**, in front of **his green-roofed villager home**.
- **Look:**
  - A **big brown bear-man** (1.15, very broad) with a grumpy brow and a kind face.
  - A **green waistcoat** with a blue gem clasp over a cream shirt with rolled sleeves, and **navy shoulder pads**.
  - A brown belt with a pouch and dark trousers.
- **Behaviour:** `stationary`. Idle is a grumble-and-shrug.
- **Role:** the **dodge** trainer. "Show me 10 clean dodges while a Grunt is on you." When done, he teaches "my father's old grapple trick". This fits our L2 dodge: count dodges that are made while a Seer is attacking.
- **Lines:**
  - "*grumbles* Ah, the Rizer kid. Been meaning to say hello."
  - "Watch yourself past the town hall · Seer Grunts move fast for boots that big."
  - "*belly laugh* Ten clean dodges under a Grunt's nose. That's the old rhythm right there."

### Zoryn · best friend and rival
- **Place:** tile (22, 14) → **(−78, −160)**, in front of **Rakoron's Ruby Cave**.
- **Look:**
  - A **rival mirror of Rizer** (1.0). Same build and age.
  - A **tall red mohawk** (spiked crimson crest) and warm brown skin.
  - A **black and crimson coat with a high flared collar and a red-lined cape**, a gold chest medallion, gold-trimmed belts and dark boots.
  - He "dreams of studying the Gemlords".
- **Behaviour:** `stationary`, arms folded, facing the cave mouth.
- **Role:**
  - On day one he gives Rizer his **Town Map** ("Malezor only — no world map, you'll earn that back"). This could gate the minimap.
  - He comments on the Ancient Astralite hum at the cave.
  - Canon: he becomes **the Part 2 final boss at the Pit of No Return**. He is a friend now; foreshadow lightly.
- **Lines:**
  - "*folds his arms · half a grin* What'd you · forget your map again?"
  - "It's day one, Rizer. DAY ONE."
  - "*smirks* Now try not to lose this one before lunch."
  - "*eyes on the cave mouth* You feel that? Ancient Astralite hums out here."

### Noot ("Crazy") · Kid Pals inventor
- **Place:** RP7B has him **inside his own home**: red-roof home #4, **"Crazy's House"**, tile (32, 98) → (−58, 8), wandering the room. Until the interior exists, put him **wandering the yard of Crazy's House**.
- **Look:** a **kid** (0.8). Curly dark brown hair under a **backwards blue cap**, warm brown skin, a red tank top with a white X-strap, denim shorts with a tool pouch, and sneakers. He's always fiddling with a wrench.
- **Behaviour:** `wander`, small radius. He spins a wrench.
- **Role:**
  - His mom builds tech in **Thardin**; he offers a portable **crafting bench** kit for 20 scrap.
  - He **lost his raygun** out by Rizer's **treehouse**. The raygun chest sits two tiles south of the treehouse.
  - Hints that Rizer has a gap in his memory ("you really do not remember that day either, do you").
- **Lines:**
  - "*spins a wrench on one finger and misses the catch* Okay okay okay — check it."
  - "*quiet* I lost my raygun. My GOOD one. Somewhere out by your treehouse."
  - "*a beat* ...you really do not remember that day either, do you."

### Corvan and Serel · the Lost Boy's parents
- **Place:** tiles (29, 74) and (30, 74), about **(−64, −40) and (−62, −40)**. They stand **side by side on the road, facing each other's side**: "two people waiting for a missing child do not stand apart."
- **Look:**
  - **Corvan** (1.05): tired, with messy black hair and a full beard. A grey hooded jacket over a plum shirt, dark trousers and boots.
  - **Serel** (0.95): long black hair and a worried face. A purple shawl over a long grey dress; her hands are clasped and she holds a small red token.
- **Behaviour:** `stationary`, `wanderRadius 0`; "they are waiting". Give them a subdued, worried idle.
- **Role:**
  - Their son, **the Lost Boy**, is in **Andrannor** at (263, 315).
  - Bringing him home is Malezor's cross-district escort and rewards **Vengrizz**.
  - Build the parents now; the boy comes with Andrannor.

### Kaelith and Yuma · Rizer's classmates
They graduated with Rizer, "the same R.A.I.D. on the same day". Build them from the classmate portraits; RP7B sheet index 0 is Kaelith and 1 is Yuma.

- **Kaelith**
  - Tile (58, 103) → **(−6, 18)**, out on the wild arm.
  - An eager girl mapping the district with her **Aetherwing**.
  - "*startles, then laughs* Rizer! I thought you were a Mori." … "My Aetherwing maps better than I do — we're charting the wild arm, tile by tile."
- **Yuma**
  - Tile (93, 103) → **(64, 18)**, "sitting on his pack at the roadside".
  - A hesitant boy with an **Aurarat** whose ears he scratches.
  - "I've been looking at this road for about an hour. It just keeps going." … "Don't tell Kaelith how long it took me."
  - Each time Rizer comes back, Yuma is "a little further down the road".
- Both have "met" and "back" lines (first visit and return visits). Their partner Zyrex should stand beside them.

---

## E · Townsfolk (ambient)

These are small generic townsfolk sprites (not the 4×4 hero sheets). All are `idle`, with one line each. Build them as simple variants on one body and change the outfit and colours. Each gets a gentle look-at-Rizer turn when he's close.

| Who | Tile → RP7D | Where | Look | Line |
|---|---|---|---|---|
| **Adventurer** | (22, 39) → (−78, −110) | "at Rakoron's cave mouth" road, by Dad's lab | Young man, spiky brown hair, red travelling jacket with gold trim, belt pouches, boots | "Every road out of here goes somewhere worse. I keep walking anyway." |
| **Barmaid** | (22, 79) → (−78, −30) | by the Town Hall | Chestnut ponytail with a pink ribbon, white blouse, red bodice and skirt, white apron | "You look like you have been sleeping in grass. Sit down, I will fetch something." |
| **Ranger** | (22, 157) → (−78, 126) | by the Hospital | Short black hair, green tunic, brown leather bracers and belt | "The wild ones moved their trails again this season. Something is pushing them." |
| **Maid** | (6, 91) → (−110, −6) | the west homes | Blonde, white cap, navy dress with a white apron and collar | "Mind the step. I have only just done that floor." |
| **Knight** | (32, 99) → (−58, 10) | by Crazy's House | Dark hair, polished steel plate with pauldrons, navy tabard | "I swore an oath to this district. Nobody has released me from it yet." |

---

## F · Beings (not ordinary townsfolk)

### Auraxion · the astral pilot
- **Place:** tile (15, 180) → **(−92, 172)**, beside **his grounded UFO** in the southern wild arm.
- **Look:**
  - A **humanoid in a white and gold spacesuit** (1.1): a round helmet with a **black mirrored visor** edged in gold, and a large **gold chest disc**.
  - Gold trim on the gloves, boots and belt, and a short dark cape.
  - Counted among the humanoid allies.
- **Behaviour:** `stationary`. Give his visor a slow astral shimmer.
- **Role:**
  - His UFO's flight matrix is drained. He asks for the **Astralcore** from a chest in the wild arm (RP7B tile (5, 195)).
  - Installing it lets Rizer **fly the UFO** ("she will lift you above every district").
- **Lines:**
  - "I read the astral currents. You walk a bright path, Rizer."
  - "*gestures at his silent craft* My UFO is COLD · the flight matrix drained its last core cycles ago."
  - "*slots the core into a chest-plate socket · the UFO hums awake behind him*"

### Rustbyte · the box robot
- **Place:** tile (17, 180) → **(−88, 172)**, next to Auraxion.
- **Look:**
  - A **small rusty box robot** (0.55): a riveted, rust-streaked square body with **one glowing orange eye-lens** and a smaller second lens.
  - Pipe arms with clamp hands and stubby piston legs.
- **Rig:** ⚠ not humanoid. A simple rigid body with arm and leg hinges and a bobbing, whirring idle.
- **Behaviour:** `stationary`, with an idle "*whirrr*" of the lens pulsing.
- **Line:** "*whirrr* ...system nominal. Bleep."

### Elzoran · the old dragon at the Novarius Statue
- **Place:** tile (5, 28) → **(−112, −132)**, at the **Novarius Statue** in the northern highland.
- **Look:**
  - A **blue-scaled dragon Zyrex**, larger than a person (about 1.25 in RP7B terms, so build around 2× Rizer).
  - A crown of **silver and gold horn-spikes**, green-edged wings and a cream belly-plate.
  - **Violet astral flame in one hand and orange fire in the other.**
- **Rig:** ⚠ a creature rig; it's not Mixamo.
- **Behaviour:** `stationary`, "in mourning" at the statue, with smoke drifting from his nostrils.
- **Role:** Novarius was his kin. If Rizer brings a Zyrex of his line, Elzoran becomes family and "lifts" with him.
- **Lines:**
  - "*a low growl softens · smoke drifting from his nostrils* Greetings, young one. How nice of you to visit."
  - "Few climb this far to sit with an old fire in his mourning."
  - "Novarius fell · but the line survived. You carry it back to me · after all these cycles at the statue."
- ⚠ **Name collision:** RP7D's playable **"Elzoran"** character (`assets/elzoran/elzoran.glb`) is a humanoid model, while canon Elzoran is this dragon. The Creator needs to decide whether to rename the playable model or retire it.

---

## G · Canon characters not built in RP7B yet (⚠ confirm before building)

- **Myara · the Journalist.** Rizer's childhood best friend, first met on Malezor's north path; she later runs the Aethryx Expanse radio broadcast. RP7B lists her as a contact and has her broadcast-tower interview waiting to be wired, but she has **no sprite or position**. She needs a look from the Creator.
- **The Elder of the Fanghall.** "The Elder judges territorial disputes here." No character exists yet.
- **The Wandering Merchant.** A recurring drunk storyteller who shows up in every district. Not placed in RP7B.

---

## Enemies (reference only, not this build)

- **Seer Commander · Malezor.** Seer HQ, 2nd floor; sprite `enemies/seer-commander-malezor.png`. A tall hooded figure (about 1.45) in a **navy and gold robe with a shadowed face**, a blue chest gem and fur-trimmed shoulders. Commander Lv 10 (grunts Lv 6).
- **Rakoron the Rubylord.** The Gemlord in the Ruby Cave, 3rd floor: a colossal red-black dragon with a crimson Fathergem. "Two of you. Good. The ones who come alone do not come back."
- **Vilerok.** The radio-tower boss squad (Mori Lv 5, boss Lv 8).

---

## Build notes

1. **Order to build:**
   1. Kelthor, Elarion, Mom, Yara, Dad: the opening path.
   2. Nurse Rein, Zurelea, Kaizari, Scrapjaw: services.
   3. Zoryn, Albert Orren, Noot, Corvan and Serel, Kaelith and Yuma.
   4. The townsfolk.
   5. Auraxion, Rustbyte, Elzoran: the bodies that need non-humanoid rigs.
2. **One NPC module.** Put `npcs.js` next to `seers.js` with a data table (id, name, tile, facing, height, look recipe, behaviour, lines), then register each NPC:
   - on the minimap as a small dot;
   - as an interactable (**○ / E** to talk);
   - with **Astralvision** tags only for quest-givers who have something to give.
   NPCs aren't lock-on targets.
3. **Hitboxes:** NPCs get body capsules for collision only. They can't be hurt, and a punch just makes them flinch and complain.
4. **Interiors:** Mom, Yara, Dad, Vireta and Noot live indoors in RP7B. Place them at their building doors (as above) until the interiors exist, then move them in.
5. **Dialogue:** reuse the Zyphone/HUD card style. Lines advance on ○ / E. Items are handed over with a give/receive gesture, and the item model appears in Rizer's hand.
