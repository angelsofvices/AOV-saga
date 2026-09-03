# SEER HQ INTERIORS — the ten raids
**Proposal, 2026-09-03.** *Creator: "fight through each floor, explore in each room, search for chests, and items, find the key reach the top floor and take out the commander. after victory, open his chest and **return stolen goods to the elder/master of that village**." · "each building should feel like a whole new level once inside" · **not puzzles.**

---

## ★★★★★ 0 · THE DIAGNOSIS — there is exactly one level, ten times

**[BUILD]** The interiors are **three module-level constants**, shared by all ten districts:

```js
INTERIOR_SEER_HQ_1F   ·  the entry floor · 8 grunts
INTERIOR_SEER_HQ_B    ·  the VAULT · one silver chest
INTERIOR_SEER_HQ_2F   ·  COMMAND · the commander, key-gated
```

★★★ **Per district, the only things that change are a LABEL STRING and the commander's
sprite.** `seerHqFloorLabel()` rewrites `.label` to *"◈ VERIDAN SEER HQ · 1F"* and
`refreshSeerCommander()` swaps the portrait. **The floor plan, the rooms, the contents
and the loot are identical in all ten.**

> ★★★★★ **It does not feel like a new level because it is not one. It is the same three
> rooms with the district's name written on the wall.**

★ **What is already right and should not be touched:** the **per-district Seer Key**
(`player.seerKeys[dist]` — *"ten basements, ten commanders, ten self-contained raids"*),
the guard ring, the grunt/commander level ladder (**gruntLv 6→81 · cmdLv 10→92 · cmdTier
2→8**), and the three floor *types*. **The skeleton is correct. It has no flesh.**

---

## ★★★★ 1 · THE LOOP, FORMALISED

```
  the district's MASTER or ELDER sends you        ← the expedition (§6.5b)
        ↓
  1F   · fight in                                  the garrison lives here
        ↓
  HOLD · 1–3 floors · ROOMS · chests · items       ★ where the district's things are
        ↓  ★ the SEER KEY is down here, guarded
  TOP  · COMMAND · the Commander                   key-gated
        ↓  his chest
  ★★★★★ RETURN THE STOLEN GOODS TO THE OFFICER WHO SENT YOU
```

★★ **This is the expedition.** §6.5b established Masters and Elders give **ten expedition
missions, one per district, gating story progression.** **The Seer HQ raid IS that
mission** — it was already implied and nothing had to be invented to join them.

---

## ★★★★★ 2 · THE IDENTITY IS THE LOOT, NOT THE ARCHITECTURE

**This is the whole answer to "feel like a whole new level," and it is the cheap one.**

> ★★★★★ **The Seers did not build ten identical bases. They occupied ten different
> buildings and filled them with what they took.**

★★★★ **So the interior's character comes from what is IN the rooms, not from the room
shapes.** Ten sets of authored contents against one reused floor grammar:

| district | the rooms are full of |
|---|---|
| **Malezor** · Beastlands | cages · pelts · confiscated Zysphere stock · a wall of tagged collars |
| **Zarvane** · Auralands | siphon apparatus off the Resonance Spire · sealed jars that hum |
| **Andrannor** · Creaturelands | mutagen racks · Chimera Exchange ledgers · things in tanks |
| **Veridan** · Naturelands | stolen seed-stock · root-cuttings dying under lamps · the Hospice's supplies |
| **Netharion** · Unknownlands | ★ crates from the **Impossible Archive** · records that should not exist |
| **Vorashil** · Alienlands | salvage · things nobody can identify · catalogued anyway |
| **Xilnar** · Spiritlands | ★ **vessels** · the missing souls, shelved and labelled |
| **Baelgor** · Humanoidlands | ★ the **Pledge's** records · rewritten drafts · the collaborators' correspondence |
| **Thardin** · Mechlands | confiscated machinery · gatelock parts · a Scanobot in pieces |
| **Korathen** · Ultralands | ★ everything from everywhere. **This is where it all went** |

★★★ **Authoring cost is a LIST per district, not a level.** ★★★★ And it makes searching
mean something: **you are not finding generic chests, you are finding your district's
property.**

★★ **[BUILD] the vault chest is already per-district-aware** — Malezor's holds the RUBY
VIAL, the other nine a scaled cache. **That per-district hook exists; this proposal fills
it out and adds room chests beside it.**

---

## ★★★★★ 3 · THE RETURN IS THE REWARD SCREEN — and it solves a different problem

★★★★★ **Do not pay this out as a number.** The player walks into the officer's hall with
an armful of the district's stolen property, **and the officer tells them what each thing
was.**

> ★★★★★ **That is where the district explains itself — through its own grief.**

★★★★ **And it fixes §17-bis's complaint at the same time.** The recall doc's cheapest
flagged win was *"54 ambient one-liners are archetype-generic; nothing tells you which of
the ten districts you are standing in."* **Ten return scenes do more than 54 one-liners
could**, because each is a named authority naming what their district lost.

★ **It also gives the Master/Elder distinction (§6.5b) something to DO in dialogue.**
A **Master** — a person — receives stolen property like an official taking an inventory.
An **Elder** — Aethren, of the land — receives it like something being given back a piece
of itself. ★★★ *Same scene, two registers, and it teaches the offices without a codex
entry.*

---

## ★★★★★ 4 · SCALING · **RULED 2026-09-03 · THREE FLOORS, 35×25 EACH**

> **Creator:** *"lets make **3 main floors** in every seers HQ. **35x25 mapping** so we cant see full base on entry."*

★ **My 3/4/5-by-district proposal is withdrawn.** ★★★ **Three floors everywhere, and the
size comes from AREA instead of floor count** — which is the better call, because a
fourth staircase is not more building, it is more stairs.

| | |
|---|---|
| **floors** | **3**, every district · 1F → hold → command |
| **each floor** | ★ **35 × 25** tiles |
| at `TILE=48` | **1680 × 1200 px** against a ~960×720 view |
| **the player sees** | ★★ **~34% of a floor at a time** |

★★★★★ **That is the requirement met exactly: you cannot see the base on entry.** ★★ And
`drawInteriorFloor` **already culls and offsets by `_cam`** **[BUILD]** — interiors scroll
today. **35×25 needs no camera work.** *(`isBlocked(x,y)` exists because Dreamland is
100×100; 875 tiles is nothing.)*

★★★★ **And it makes the text format essential rather than merely nice.** 875 tiles per
floor is impossible to hand-place, but a plan is **25 lines of 35 characters** — so
**thirty floors is ~750 lines**, authorable in a sitting. *The format and the dimensions
were chosen for each other.*

★ **The Seer Key sits on the hold floor**, guarded — one floor of searching between the
door and the stair up.

### ★★ Sequencing · do NOT resize before the plans exist

★★★ **Changing `cols/rows` to 35×25 today would produce three EMPTY BOXES THREE TIMES
BIGGER** — the same nothing, with more walking. **The dimension change lands with the
floor plans, in the same version, or not at all.**

---

## ★★★★★ 5 · THE THREE OCCUPIED DISTRICTS · there is nobody to return them to

★★★★★ **§6.5c/d: in NETHARION, VORASHIL and XILNAR the Elder was DEPOSED.** So the loop's
final beat has no recipient.

> ★★★★★ **The player clears the building, walks out with an armful of the district's
> stolen property, and finds the office empty.**
>
> **That is how they learn the core is different — by trying to give something back and
> having nowhere to put it.** No exposition. No map overlay.

★★★★★ **And it hands the rescue its room.** *"Explore in each room"* — so in those three,
**one of the rooms has a person in it.**

> **You are searching for chests and you find the Elder.**

★★★★ **Then the return happens INSIDE the building, to someone who has been locked in it
with the things that were taken from them.** ★★★ Structurally this costs **one room's
contents**, and it is the strongest scene in the design.

★★ **It also lands the three fates cleanly** (§6.5c§7): with exactly three, the set can be
**one you FREE · one you are TOO LATE for · one where what you find is NOT WHAT WAS
DEPOSED.** ★ *The Elder is in the building in all three cases. What is left of them is the
variable.*

---

## ★ 6 · WHAT IS CHEAP AND WHAT IS NOT

| | cost |
|---|---|
| ★ per-district loot lists · ten return scenes | **writing.** The highest value here |
| ★ stacking hold floors | **small** — one template, instanced |
| room chests beside the vault chest | small · the chest system ships |
| **[BUILD] splitting `INTERIOR_SEER_HQ_*` into per-district instances** | ★★ **the real work.** Three shared constants must become ten sets, or one template plus a district data table |
| ten interior tilesets | ★★ **skip.** Palette-shift the shipped seer wall/floor per district; the loot carries the identity |
| ★ **the Commander fights** | ★★★ **currently unbuilt** — `talkToSeerCommander()` fires one shared line and stops. **This design has no top floor without them** |

★★★ **The one hard dependency: ten Commander fights.** Everything else here is
decoration on a loop that already half-exists. **The boss is the missing half.**

---

## ★★★ 7 · OPEN

1. ★★ **Do the stolen goods enter the bag as items, or as a quest manifest?** *A manifest
   is cheaper, cannot be sold by accident, and makes the return scene a list the officer
   reads aloud.* **Recommended.**
2. ★ **Can a district be re-raided?** The Key is one-per-district and permanent; the
   garrison respawning would undo the restitution.
3. ★ **Does returning goods move the Bond Ledger?** It is a *Rizer-path* act
   (district-scale, civic) — ★★ and the ledger already has a **district** entry worth 15.
4. ★★ **What is in Korathen's HQ**, given it is where everything went — **and given its
   own officer is an Elder with an Empty Throne above them?**
