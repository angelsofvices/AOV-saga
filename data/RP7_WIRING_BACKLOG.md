# RP7 · WIRING BACKLOG — canon that EXISTS but is not in the game

**Opened:** 2026-09-13 · build `v0.96.98`
**Creator:** *"we will eventually need to wire a shit ton of world/game accurate
items and events throughout the game. we shouldnt really be inventing any
besides new weapons and stuff. we have alot of hanging existing material to add
where it fits."*

> ### ★★★ THE RULE FOR THIS WHOLE DOCUMENT
> **Every row names its source.** If a thing is here, canon already said it
> somewhere and this file says where. Nothing on this list is invented, and a
> row with no source is a bug in the row, not a licence to make something up.

★ Ordered against `RP7_STORY_SPINE`, so "where it fits" is answered by the
progression rather than by taste.

---

## ★★★ THE HEADLINE, AND I GOT IT WRONG THE FIRST TIME

**3 of the 30 canon lore buildings are actually built.** Not 29.

My first sweep substring-matched their names against `rp7b.html` and reported
29/30 present. That was a **false positive on my own test**: it was matching
the name inside a *code comment* (*"a fae that landed under the Fanghall
moves"*) and inside *scroll flavour text* (*"Netharion. The Impossible Archive
is blunt where everyone else has been careful…"*). Neither is a building.

Re-checked properly — a building counts only if its name appears as an
`id`/`label`/`name`/`title` field on a real prop:

| district | built | missing |
|---|---|---|
| Malezor | The Fanghall | The Bloodscent Lodge · The First Den |
| Zarvane | — | The Resonance Spire · The Quiet Between · The Vibration Conservatory |
| Andrannor | — | CLUB VX · The Morphic Menagerie · The Chimera Exchange |
| Veridan | The Seedvault | The Root Parliament · The Overgrowth Hospice |
| Netharion | — | The Impossible Archive · The Null Observatory · The Crooked House |
| Vorashil | — | The Shape Embassy · The Unmouth Academy · The Manybody Habitat |
| Xilnar | — | The Last Lantern · The Blackwake Chapel · The Walking Lord's Station |
| Baelgor | — | Baelgor University · The Hall of First Settlement · The Tenfold Forum |
| Thardin | — | The Orphan Foundry · The Precision Ministry · The Anomaly Engine |
| Korathen | The Empty Throne | The Tribunal of Ten · The Mothergem Sanctum |

**Source:** `RP7_MAIN_STORY_CANON.md` — the 30-building table, three per district,
all named and all assigned. ★ **This is the single largest block of
ready-to-build canon in the repo**: 27 named places, each already belonging to a
district, none needing a word invented.

> ★ Worth recording *why* the false positive happened, because it will happen
> again: **a name in flavour text is evidence the world knows about a place, not
> evidence the place exists.** The Impossible Archive is *quoted* by a scroll in
> Netharion — which is exactly the kind of hook that makes the building worth
> building, and exactly the kind of hit that fools a grep.

---

## 1 · ITEMS AND RELICS

### 1.1 ★★★ TEN district shrines and TEN relics — *the loop RUNS THE OTHER WAY*

> **★★★ RULED 2026-09-14.** Creator: *"there should be 30 lore buildings. also,
> 10 district shrines and 10 relics you have to bring to the shrine to complete
> the loop. for instance, the statue of novarius is the relic in malezor. the
> water fountain in andrannor is their shrine."*

**Two changes to everything written below.**

1. **TEN, not nine.** Malezor gets a shrine and a relic like everywhere else.
   The rp8 table starts at district II; Malezor was left out because it was the
   tutorial. It is not the tutorial any more.
2. **★★★ THE DIRECTION REVERSES.** rp8's shrines *granted* a relic on first
   touch. Now the relic is **found in the district and carried to the shrine**.
   The shrine is the lock; the relic is the key.

★★ **This is strictly better and it is worth saying why.** A shrine that hands
you something for arriving rewards *walking*. A shrine that wants something
rewards *searching* — it turns every district into a small closed loop with its
own answer, which is the same principle as "every district answers one story
question". **The monument stops being scenery and becomes a door.**

> ### ★★★ LOCKED 2026-09-14 · the three answers
> **1 · Malezor's relic is a BROKEN NOVARIUS STATUE FRAGMENT.**
> *"a broken novarius statue fragment."* — which solves the one physical snag:
> you were never meant to carry the statue. ★★ And it is better than a generic
> token, because a **broken** fragment says the monument was damaged, which is a
> fact about the world rather than a fetch excuse. The statue at (8,29) becomes
> a thing with a piece missing.
>
> **2 · THE TWO HUNTS HAVE DIFFERENT BENEFICIARIES.**
> *"gemstone hunt will only be for rizer. the relic hunt will be for the
> elder/master of the district."*
> ★★★ That is what separates them, and it is a sharper split than "two fetch
> quests": the **gemstone is self-interested** (Rizer's own progression) and the
> **relic is service** (you are doing it for the district's elder). Same verb,
> opposite motive.
> ★★ **And it fills the eight empty elders.** The relic hunt *is* the elder's
> questline — so `DISTRICT_ELDERS` stops being eight `built:false` rows with
> nothing to say and becomes eight people who each want one specific thing back.

★ **And both of the Creator's examples are already in the build:**
- `novarius_statue` — Malezor **(8, 29)**, 2×4 tiles, currently does nothing but
  toast *"◈ Statue of NOVARIUS · First Beast Master."*
- `andrannor_fountain` — a live **animated multi-cell** prop with a working SFX
  loop, currently pure decor.
- ★★ And a detail worth keeping: the **Elzoran easter egg already kneels at
  (8, 31)**, two tiles from the statue, *"kneeling before Novarius' statue."*
  Malezor's shrine site has had a worshipper at it this whole time.

★ Count check: the build has **11 monument-class props** already
(`novarius_statue`, `andrannor_fountain`, `korathen_the_empty_throne`,
`zarvane_the_resonance_spire`, `malezor_radio_tower`, `rizer_treehouse`, a
`spire`, a `tree`…). **Zero are called shrines.** Most of the twenty objects this
loop needs are probably already standing.

---

### 1.1b The rp8 nine — *the source table, now superseded on direction*
**Source:** `MASTER_CODEX_HANDOFF.md` §5b — *"Each district II–X has a landmark
shrine. First-visit interaction grants a unique named relic + XP."*
**Status:** absent from rp7b · **already implemented in `rp8.html`** (`SHRINES`
table with `item`/`itemName`), so this is a port, not a build.

| district | shrine | relic |
|---|---|---|
| II Zarvane | Sunlit Pillar | Sunlit Ember |
| III Andrannor | Broken Obelisk | Ancient Rune |
| IV Veridan | Great Tree | Verdant Seed |
| V Netharion | Void Rift | Void Fragment |
| VI Vorashil | Alien Landing Pad | Alien Chip |
| VII Xilnar | Spirit Tree | Wisp Breath |
| VIII Baelgor | Forge Anvil | Forge Ember |
| IX Thardin | Machine Tower | Gear Cog |
| X Korathen | Throne Dais | Imperial Crest |

★ rp7b **already has a Spirit Tree in Xilnar** (it stocks `life_seed_pure`) — so
shrine VII has its host object waiting. One down before we start.
★★ Completing all nine unlocks **ANCIENT GEMSIGHT** (same source) — a lens
revealing chest counts, undefeated commanders and shrine visits on the map.

### 1.2 ★★★ The ten district gemstones — *the bijection is locked*
**Source:** `GEM_BADGE_SYSTEM_BRAINSTORM.md` §17/§17a, Creator: *"can we make it
that the district gem matches their gemlord… we can potentially go on a hunt for
the gems in each district and return them to the elder of that district."*

Malezor/Rakoron→**Ruby** · Zarvane/Ivirium→**Pearl** · Andrannor/Mutaryn→**Citrine** ·
Veridan/Emeralix→**Emerald** · Netharion/Eurakeon→**Amethyst** ·
Vorashil/Azurel→**Sapphire** · Xilnar/Obsidius→**Onyx** · Baelgor/Ambrevon→**Amber** ·
Thardin/Oathane→**World** · Korathen/Oatheus→**Space**

**Status:** absent. The build's only stones are the 8 generic `gem_<colour>`
currencies. §17d is explicit that the named stone is a **key** (one per district,
returned to that district's elder) and is *not* the fuel gem.
★★ **This is the intended filler for the eight unbuilt elders** — see §2.1.

### 1.3 The WORLD and SPACE gems (types IX and X)
**Source:** `PRISMSHARD_GEMSHARD_CANON.md` §0h§2 and the top-authority
`AOV_SAGA_DEFINITIVE_CANON_HANDOFF.md` §10.2 (*IX = composite of types 1–4,
X = composite of 5–8*). Homes: **Thardin** (IX, Oathane) and **Korathen** (X,
Oatheus). Canon says they behave as Ultrashards — an already-built pathway.

### 1.4 Three Prismshards are already placed on Zyraxis
**Source:** `PRISMSHARD_REGISTRY` (in the build, `rp7b.html:4173`) carries all
sixteen names with tier/realm/planet — but none is an item.
★ Three of the sixteen are **on this planet, in named districts**:
**The Deep Prism · Xilnar** · **The Refuge Prism · Vorashil** ·
**The Prism of Omnithris · Korathen**. Three placements written and unbuilt.

### 1.5 ★★★ Zyramid — CARRY CAPACITY · *ruled 2026-09-14*
**Source:** `PRISMSHARD_GEMSHARD_CANON.md` §0g — *"Thardin mass-produces three —
Zysphere, Zycube, Zyramid — and calls them utility prisms."*
> **Creator, 2026-09-14:** *"zyramid will be earned and upgraded to increase
> backpack inventory size throughout game."*

★★ **The three utility prisms now own three distinct ideas and none overlap:**
**Zysphere = bond** · **Zycube = storage** · **Zyramid = how much you can carry.**
That is a clean set, and it retires the vague "powers" function the old doc gave
it.

> ### ★★★ LOCKED 2026-09-14 · the numbers
> **Creator:** *"zyramid comes with zycube. start with 30 slots. can be upgraded
> to 60, 90, 120, 150, 180, 210, etc, up to zycube level 10 with 300 slots. so
> the zyramid upgrading increases the zycube capacity."*
>
> - **The Zyramid arrives WITH the ZyCube** — not a separate acquisition. Mom
>   hands over the ZyCube early; the Zyramid is what makes it hold anything.
> - **`cap = 30 × zycubeLevel`** · L1 = 30 · L10 = **300**. Clean linear +30.
> - **It upgrades the ZYCUBE, not a separate bag.** ★ Correct on the build's own
>   terms: `ZYCUBE_CATEGORIES` is the registry the inventory UI renders from, so
>   the ZyCube *is* the bag. The Zyramid is its capacity stat.
>
> ★★★ **ONE NUMBER TO CHECK BEFORE BUILDING, and it is not a small one.**
> `INVENTORY_META` defines **81 item types.** The cap starts at **30**. There is
> currently **no limit at all** anywhere in 3.5 MB — so this does not raise a
> cap, it **creates** one, and it creates it well below what the game can hand a
> player.
>
> ★ So the open question is what a **slot** counts:
> **(a) one item TYPE** — 30 slots against 81 types means a normal player fills
> it and starts making real decisions about what to carry. Tight and meaningful,
> but it will bind early and often, and every existing save needs checking.
> **(b) one STACK or unit count** — far looser, and 30 would rarely bite.
> ★★ (a) is almost certainly the intent — 30→300 only reads as progression if
> the number is scarce — but it is the difference between a feature and a
> frustration, so it is recorded rather than assumed.
>
> ★ Existing saves: anything already over the starting cap needs a migration
> that grants levels rather than deletes items. **Never confiscate.**

### 1.6 The six unnamed Gemlord weapons — *the schema is already there*
`GEMLORD_WEAPONS` has four keyed and six `{key:null, weapon:null}`: Eurakeon
(Netharion) · Obsidius (Xilnar) · Ambrevon (Baelgor) · Mutaryn (Andrannor) ·
Oathane (Thardin) · Oatheus (Korathen).
★ `COSMIC_CHEST_SPOTS` is documented as *"one per Gemlord weapon"* and holds 5 of
10 rows. **Six rows, no schema change.**
★★ This is the one area the Creator named as fair to invent — *"besides new
weapons and stuff."* Everything else on this page already has a name.

### 1.7 Present in the build but unobtainable
| item | situation |
|---|---|
| `evolution_catalyst` | **zero grants anywhere.** Two mentions in 3.5 MB: its META row and `RELIC_CLASS_MAP`. Never emitted by `synthesizeCompound`, never consumed. Canon home: ORANGE/evolution → **Baelgor**. |
| `prismshard` (generic) | dev GIVE-ALL only. Has a live **sink** (Kelthor Trial 8) and no source — the source was deliberately removed when Rakoron's Fang replaced it. Currently a dev-only orphan. |
| `rare_item` · `moon_gem` | dev GIVE-ALL only. No source, no consumer, no effect. |

★ **And an inverse bug:** `townmap` **is** granted by a live Zoryn easter egg,
but was removed from `INVENTORY_META` at v0.95.419 — so any player who triggers
that egg gets a bag row rendering the raw key `townmap` instead of a label.

---

## 2 · PEOPLE AND PLACES

### 2.1 ★★★ Eight of the ten district elders are unbuilt
`DISTRICT_ELDERS` in the build: **Kelthor** (Malezor, The Bond) and **Omniris**
(Zarvane, The Sight) are `built:true`. The other eight are
`{id:null, name:null, teaches:null, seat:null, at:null, built:false}` with
`handoff:'TBD -> <next district>'`.

★ Canon gives each district a Gemlord, a Lands name and a theme
(`RP7_MAIN_STORY_CANON.md`), so each elder has a subject waiting:
Andrannor *evolution/hybrids* · Veridan *ecosystems* · Netharion *the unknown* ·
Vorashil *shape/identity* · Xilnar *death-energy* · Baelgor *settlement/history* ·
Thardin *technology without oversight* · Korathen *the Council*.
★★ **The elders are also the return-point for the district gemstones (§1.2)** —
which means one design closes two gaps.
★★★ **Names are NOT in canon.** Eight elders need naming, and that is a Creator
call, not a thing to invent quietly. **BLOCKED ON RULING.**

### 2.2 The 27 unbuilt lore buildings
See the headline table. All named, all assigned, none built.
★ `RP7_MAIN_STORY_CANON.md` §6.4 also singles out **CLUB VX** (Andrannor) — and
note the build already has a `club_50` prop and an `andrannor_club_vx` prop on
the same art, which is the naming question flagged at v0.96.86.

### 2.3 Xilnar has a Walking Lord's Station and nothing else
The only one of the 30 whose *name* appears nowhere in the build at all — not
even in flavour text.

---

## 3 · THE MECHANISMS THAT ALREADY EXIST

★ Nothing below needs building. This is the list of hooks the material above can
be hung on, which is why this backlog is mostly *placement* work rather than
*systems* work.

- **`addItems(drop)`** — one choke point, 32 call sites. A new item needs an
  `INVENTORY_META` row and one call.
- **Chests, four tiers with a written loot contract** (`CHEST_LOOT_LADDER`):
  wood (common) · silver (quest items, hand-placed) · **gold**
  (`GOLD_CHEST_TILE_POSITIONS`, 13 tiles, **all ten districts already covered**) ·
  **cosmic** (`COSMIC_CHEST_SPOTS`, *"one per Gemlord weapon"*, 5 of 10 filled).
- **Shops:** `ZURELEA_STOCK` (Malezor potions) · `ZYSPHERE_SHOP_STOCK` ·
  `SCRAP_SHOP` (barter).
- **NPC gifts:** the `player.<thing>Gifted` one-shot pattern, 8 live examples.
- **Elder ladders:** the `KELTHOR_LADDER` rung schema already hands out items
  mid-dialog (`s12` grants the Rubypaw Fang).
- **★ `DADS_BOOKSHELF_ITEMS`** — an intentionally **empty array with a working
  dispenser**, described in its own comment as *"the extension point the Creator
  asked for."*
- **Harvest/craft:** `HARVEST_RECIPES` and the Astralite Experiment Table both
  feed `addItems` directly.

---

## 4 · SUGGESTED ORDER

Ordered so that each block makes the next one cheaper.

| # | block | why here |
|---|---|---|
| 1 | **Port the 9 shrines + relics from rp8** | Reference code exists, placement is fully specified, and it puts a reason to visit in every district II–X in one pass |
| 2 | **The 10 district gemstones** | Locked bijection, and it gives the elders their purpose before we name them |
| 3 | **The 27 lore buildings** | Largest block of ready canon; they are the *containers* everything else goes in |
| 4 | **Fix the four orphan items** | Cheapest correctness win on the page — `evolution_catalyst` has a home (Baelgor), `townmap` has a rendering bug |
| 5 | **The 6 Gemlord weapons** | Schema ready; the only block where inventing is sanctioned |
| 6 | **Zyramid · WORLD/SPACE gems · the 3 placed Prismshards** | Small, specific, high-lore-value |
| 7 | **The 8 elders** | **Blocked** — needs eight names first |

---

## 5 · BLOCKED ON A RULING

1. **Eight elder names** (§2.1) — the largest blocker; eight districts cannot
   have a teacher until they have one.
2. **Do the six Gemlord weapons exist yet in-world?** `GEM_BADGE_SYSTEM_BRAINSTORM`
   §17d offers that the district stone *is* the weapon's Gemshard and *"the other
   six have not been found"* — not settled.
3. **The ten Mother Gems are named nowhere** (`STORY_MASTER_RECALL.md:383`
   flags this itself). The Mothergem Sanctum can be built; its contents cannot.
4. **CLUB VX vs Club 50**, still open from v0.96.86, and now it also decides a
   lore-building name.
5. **Is `EARLY_GAME_FLOW.md` live or stale?** It describes Jax, Quinn, a Bronze
   Key and a Silver Key, none of which exist in rp7b — and it still says
   "Gemsphere" rather than "Zysphere", which dates it to the old prototype.
   ★ Recommend marking it superseded rather than building from it.
