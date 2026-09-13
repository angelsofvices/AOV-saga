# CODEX + WEBSITE UPDATE HANDOFF
## Current canon of the AOV™ Saga and RP7 · 2026-09-13

**Build:** `rp7b.html` · internal `v0.96.88` · public tag **BETA V7.5.16**
**Top canon authority:** `data/AOV_SAGA_DEFINITIVE_CANON_HANDOFF.md`
**Conformance suite:** `node tools/verify_definitive_canon.js` — green as of this doc

> ★ **Public tag vs internal build.** `BETA V{game}.{gamedex}.{codex}`, with
> Codex ≡ Gamedex + 11. **7.5.16 is current and correct.** `v0.96.88` is the
> internal patch counter and should never appear on the site. **Do not "update"
> any V7.5.16 string** — several already-correct strings look stale and aren't.

---

# PART 0 · READ THIS FIRST

## 0.1 The precedence order, now that the handoff exists

1. Latest explicit Creator statement
2. Explicit Creator correction/lock
3. `AOV_SAGA_DEFINITIVE_CANON_HANDOFF.md`, then the repo's `*_CANON.md` docs
4. Current site/codex/game material that doesn't conflict with 1–3
5. Older published wording, read in the **least-retconning** way
6. **Assistant theories are not canon.** ★ This clause has already cost us once —
   see §1.2.

Orthogonal and still live: **story > cards > game** for roster/typing/number
conflicts. The two stack; one is about *recency*, the other about *medium*.

## 0.2 The rule that governs this whole job

> **Never fix an unresolved issue by inventing an answer.**

Where canon is silent, the handoff says leave it silent and flag it. §5 of this
document lists every open item. **Do not close one to make a page read better.**

## 0.3 The failure mode this document exists to prevent

`codex.html` line 999 carries a self-congratulatory comment about having fixed
bad counts — *"the old copy claimed '547 cards · 543 numbered entries' and this
page holds 358. Three different wrong numbers lived on the site at once."*

**It happened again anyway, on the very next page over.** `games.html` still
advertises "200+ bondable Zyrex · 400+ characters," which no data source in the
repo supports. A number fixed in one place is not a number fixed.

★ **So: every count in this handoff was re-counted from the file, not quoted
from another document.** Do the same when you edit.

---

# PART 1 · CANON THAT CHANGED (apply these)

## 1.1 ★★★ Obsidius performs the Soul Split

The single largest correction. Handoff §10.3–10.4, §24.10.

| | |
|---|---|
| **RETIRED** | Egnellahc divided his own essence |
| **CANON** | **Obsidius — Black Gemlord of Xilnar, the strongest natural Gemlord — personally performs the Soul Split on Egnellahc.** Not teaching, not instruction: he does it, to him, as a rescue, because the IX/X state was destroying him and fracturing reality. |
| **Oathane (IX)** | a **stabilized copy patterned from Obsidius** |
| **Oatheus (X)** | a **hybrid of Egnellahc + Obsidius** |
| **After** | Obsidius helps perfect and stabilize them; the other Gemlords bless the two **under his influence**. The Ten are completed by consent of the eight. |

Neither is a biological child (§24.9). Egnellahc outranks Obsidius **only** by
holding the composites.

> ### ★★★ SPOILER LOCK — the part that governs your copy
> **Obsidius's involvement is now itself a spoiler.** His *name* is public
> setting — he is the Gemlord of Xilnar and appears on district tables. **His
> hand in the Ninth and Tenth is not.**
>
> **Public copy MAY say:** eight fundamental Gem Types · two exceptional
> composite formations whose origin is guarded · still ten Gemlords · the final
> two differ in origin.
>
> **Public copy MUST NOT say:** Egnellahc created them · IX = First Four,
> X = Final Four · that he held both · the fracture · **the Soul Split** ·
> **Obsidius's role** · **that the Gemlords blessed them under his influence** ·
> the rapture · Ultharis · the **World and Space Gems** · Oatheus's duty to
> conceal them.
>
> **Approved wording, use verbatim:**
> > *For most of recorded history, eight Gem Types were believed to define the
> > natural limits of gem formation. Zyraxis also recognizes two exceptional
> > composite formations whose structure and origin remain closely guarded. From
> > these ten expressions come the Ten Gemlords — but the final two do not share
> > the same origin as the first eight.*

`macrobook.html` and `zyraxis.html` already comply. **Keep them that way** —
the suite asserts it.

## 1.2 ★★ Why a "proposal" is not a safe place to park a guess

`EGNELLAHC_SPLIT_PROPOSAL.md` invented the old motive ("he refused to rule
alone"), labelled itself *"PROPOSAL, not canon until the Creator rules,"* and
said outright *"no text gives a reason — that is the gap this proposal exists to
fill."* It was still quoted onward into `ZORYN_ARC_CANON.md` and became
load-bearing for Zoryn's whole thematic inversion.

**A hypothesis labelled as one is not safe if it is the only answer in the room.**
When the codex or the site needs a reason canon doesn't supply, leave the gap
visible. Don't write around it.

## 1.3 The other canon corrections already applied

| was | now | authority |
|---|---|---|
| "45 Discovered · 200+ Theorized" Astralites (`aethryx.html`) | **9 families · 7 tiers · 63 Astralites** | §3.1, §24.1 |
| "THE FIRST WAR · Dracolords vs Astrums" | "**THE FIRST ASTRUM WAR**" — a front, not the start. The Eternal War began **Dracolords vs Planetelles** | §4.3, §24.2 |
| Egnellahc "future Elder Prime of Nexyros" | **Humanoid Prime / first Egnellar.** Genealogically *above* the four Elder Primes, never one of them | §7.2, §24.6 |
| "Born from Egnellahc" on Oathane/Oatheus | wording that removes parentage without adding the spoiler | §24.9 |
| Viridia's "First race: TRUE HUMANS" | "**First mortal race**" — Immortals held Viridia long before | §12.1, §24.12 |
| "ten shards become the TEN GEMLORDS" (rp8), "Ten fragments" (zyraxis) | eight, with the final two set apart | §10.2 |
| "(formerly Ferros)" | **claim removed — both names stand** | §24.19 |

## 1.4 Counts that are canon now

| thing | number | source of truth |
|---|---|---|
| Astralites | **63** = 9 families × 7 tiers | handoff §3.1 |
| Natural Gem Types | **8** | §10.2 |
| Gemlords | **10** (8 natural + 2 composite) | §10.2, §21.1 |
| Official worlds | **27** + drift world 28 | §5.1 |
| Zyraxis districts | **10** | §21.1 |
| Types | **21** (20 standard + ULTIMATE as an exclusive 21st) | `data/TYPE_COLORS_V1.json` |
| Locked staple roster | **210** species, locked 2026-08-27 | `data/staple_roster_v1.json` |
| Planet 19 | **Uralyx** — Ultharis is the Highest One only | §5.1, §24.18 |

---

# PART 2 · THE CODEX

`codex.html` — 4,815 lines, 487 KB, **358 entries**, fully self-contained.

★ **Architecture note before you touch it.** Every entry exists **twice**: once
as hand-written `article.codex-card` HTML, and again inside a single 174 KB JSON
line at `<script id="cx-data">` (line 4697) that powers the click-through
overlay. **An edit in one place and not the other silently desyncs the grid from
the popup.** `data/codex.json` and `game_roster/roster.json` are *never* read by
the page — the codex does not fetch anything.

## 2.1 ★★★ P1 — the type taxonomy is a generation behind

The codex uses **29 type tokens**. Thirteen are non-canon legacy, and several
conflate **cast** with **type**:

`Humanoid-Noid` (67) · `Unknown-Void` (46) · `Light` (15) · `Ground` (15) ·
`Water` (11) · `Air` (6) · `Robot` (5) · `Fire` (4) · `Ice` (4) · `Storms` (3) ·
`Shadow` (3) · `Force` (3) · `High Seers Master` (1)

**Five of the canonical 21 appear nowhere:** `Astral` · `Chrono` · `Elemental` ·
`Radiant` · `Verdant`.

Ground truth: `data/TYPE_COLORS_V1.json` (21 types, 20×20 chart, ported
v0.95.993) and `TYPE_STRONG_VS` in `rp7b.html`. `game_roster/roster.json` is
*partly* migrated — it already has Elemental/Radiant/Verdant/Corrupted but still
carries `Unknown-Void` (17) and `Humanoid-Noid` (8).

**Do:** migrate the codex to the 21 canonical types, and split the cast field out
rather than folding casts into types.
**Don't:** invent a type for an entry that has none. `Mira` has `"types": ""` —
leave it empty and flag it.

## 2.2 ★★★ P1 — the page contradicts itself on one screen

| where | claims |
|---|---|
| lead copy, line 998 | "358 archive entries · **210 bondable** Zyrex · **69 playable**" |
| embedded `cx-data` counts object | `{"entries":358,"bondable":210,"playable":69,"onPage":65}` |
| **actual entry flags** | **bondable 65 · playable 29** |

A visitor reads "210 bondable" and then scrolls an archive where 65 say so. The
210 is `staple_roster_v1.json`'s number, quoted rather than counted — beside a
comment insisting these figures are *"COUNTED, not quoted."*

**Do:** either publish the missing roster entries (§2.3) so the count becomes
true, or say plainly: *"210 bondable species on the locked roster — 65 published
in the archive so far."* Both are honest. What isn't honest is the current pair.

## 2.3 ★★ P2 — coverage holes

- **145 of the 210 locked staple species are missing from the codex.**
  e.g. Aetherwing · Aurarat · Barkchitter · Blazonon · Bogarion · Bonemaw ·
  Chameleor · Cinderant · Dunechitter · Dunestinger · Emberuk · Flarepaw ·
  Flarewisp · Florlyan · Frostwisp.
- **170 `data/codex.json` entries never reached the page** (43 zyrex, 127
  zyraxian). The generator `data/build_codex.py` exists; the publish step
  doesn't.
- ★ **Audrelius Veridae I–III and VIII–X are published; IV–VII are not.** A
  ten-generation dynasty with a hole in the middle is worse than publishing none
  of it — it reads as data loss, which it is.

## 2.4 ★★ P2 — data defects, verbatim

- **Duplicate ID `VD-X001`** on both **Anciuxor** and **Ultharis**. Deliberate
  (each carries a `shared` array) and the overlay was re-keyed to a `data-cx`
  index to cope — but it will bite any downstream consumer that keys on ID.
  ★ Note this also touches canon: §1.1/§1.2 make Anciuxor a **manifestation of**
  the Highest One, so "Ultharis IS Anciuxor's divine humanoid form" needs a
  ruling (§5.4), not a code fix.
- **Placeholders shipped:** `Mira` → `"tag":"TBD"`, `"types":""` · `Kalenatel`
  → `"tag":"TBD · Light / Spirit"` (both casts, not types) · `Anciuxor` →
  `"tag":"— · Ultramax / Ultramax"` while its `types` says `Ultimate`, so tag and
  types disagree.
- **~30 cards show a changelog where lore should be.** Eirforn, Baelgrin,
  Netherlin, Saturnis, Strixel, Onyaxius and others open with a version stamp
  ("v9.6 PATCH 43…"). That is an editorial note rendered as the visible
  description.
- **Tier naming disagrees with itself:** the filter pills say VII =
  "Pseudoimmortal" / VIII = "Immortal"; the overlay's `CLASSNAME` map says
  6 = Pseudoimmortal, 7 = Immortal, 8 = "Immortal · Creator". The same card reads
  differently in the grid and the popup. The map also defines a Tier I label
  (with a stray CJK glyph) for a tier that has **zero** entries — and there is no
  Tier I filter pill either.
- **Immortal count:** 22 entries at Tier VIII, while the page's own Vaelorith
  card says *"1 of 24 Immortals · all Tier VIII."* Two short of its own claim.
- **`Makai "The Mech" Stormvale`** stores HTML-escaped quotes inside the JSON
  blob, so it is the one entry that won't join against `data/codex.json`.
- `pool == gate` on all 358 — the overlay presents them as two stats that are
  never different.

## 2.5 P3 — version stamps

The header says **"Codex v16 · Gamedex v5"** (correct). But lore bodies carry
v8.6, v8.9, v9.0, v9.1, v9.3, v9.6, v9.7.1, v9.8, v11.3, and a script comment
says "v11.10 archive · site sync". **Four-plus version generations coexist on one
page.** Strip in-lore version stamps; keep one header stamp.

---

# PART 3 · THE WEBSITE

## 3.1 ★★★ P0 — `games.html` describes a game that no longer exists

This is **the only page on the site that describes the flagship**, and a player
can falsify it at the title screen. All of this is in `games.html:1189` and
`:1191`:

| claim on the site | reality in `rp7b.html` |
|---|---|
| *"Title screen lets you pick CLASSIC (procedural render) or BETA (full art pass)"* | `TITLE_OPTIONS = ['NEW GAME', 'LOAD GAME']`. **Zero occurrences of "CLASSIC".** ★ Falsifiable in one click. |
| *"learn the eight Bond Lessons from Warden Kelthor"* | **0 hits for "Bond Lesson".** It is a **13-rung ladder in 3 ladders**, and it is now the entire tutorial. |
| *"sweep the 3-bracket Hall Rizer tournaments to earn all 10 Hall Flags"* | **0 hits for "Hall Rizer". 0 for "Hall Flag".** The system is absent. |
| *"200+ bondable Zyrex"* · *"400+ characters"* | Supported by **nothing**. The game's `SPECIES` table has **67** entries; the locked roster is **210**; the codex publishes **358** archive entries with **65** flagged bondable. Pick a real number and say which one it is. |

**Still correct — do not "fix" these:** ten districts · 21 types · T×333 ·
Novarian Challenge · Baelgor · Bridge of Hope · Key of Anciuxor · Prismsynch ·
Lower Zyraxis · **BETA V7.5.16**.

## 3.2 ★★★ P0 — everything shipped in 2026 is invisible

~1,228 commits since the RP7 card was written (its own comment is dated
2026-07-27). Site mentions of each shipped feature:

| shipped in RP7 | mentioned on the site |
|---|---|
| **Zoryn** — a Player Two who runs when you run, fights when you fight, and loots chests before you | **nowhere** |
| **The 13-rung Kelthor ladder** — the whole tutorial | wrongly, as "eight Bond Lessons" |
| **Field Workstation** — craft it for 20 scrap, deploy it anywhere, craft on expedition, 40 HP and enemies wreck it | **nowhere** |
| **Rubypaw Fang** — S1 dagger, Rakoron's shed tooth | **nowhere** |
| **Vorugath** — 5 placed, 2× a Vilerok | **nowhere** |
| **S1 / S2 / S3 Rizer forms** — S3 = **Luminary**, Lv100, T8 max mortal | **nowhere** |
| **Zysphere wild bonding** — stick-spin imprint, difficulty = tier : bond | **nowhere** |
| **The Sanctuary** — donate permanently for bond | **nowhere** |
| grass noise aggro · minimap POI law · dev mode v2 | **nowhere** |

**Recommendation:** `macrobook.html` is the natural home, but it is deliberately
a **world-lore teaser with no gameplay chapter** — that was a Creator decision
and shouldn't be undone casually. ★ The cleaner answer is a **dedicated RP7
page** (`rp7.html`), linked from the drawer nav, holding the gameplay material
the macrobook is keeping out. See §5.8 — this needs your call.

## 3.3 ★★ P1 — `index.html`

- line **1299**: *"Realms, Cardmaster, and Expedition — three working
  prototypes."* ★ **The flagship isn't named**, and all three that are have been
  parked since July.
- line **1301**: **"7 Games"** — `games.html` ships **9** cards.

## 3.4 ★★ P1 — a 1 MB game is orphaned

`rp8.html` — actively developed, updated in the same canon-merge commit as
rp7b — has **zero inbound links**. The RP8 card at `games.html:1209` points at
`arborynth.html`, the older, smaller, minified predecessor. Either rewire the
card or retire `rp8.html`. Right now it is invisible.

`rp10.html` is also orphaned, and is a genuine stub (placeholder sky, placeholder
ground, a red capsule standing in for the player). Link it, hide it, or archive
it — but decide.

## 3.5 P2 — navigation

Canonical drawer = 7 links: Home · The Saga · Timeline · Aethryx Expanse ·
The Codex · Games · The Macro Book. It is **hand-copied into every page**, so it
drifts.

- ★ **`zyraxis.html` is missing the Macro Book link** — its nav predates the
  rollout.
- `zyraxis` / `viridia` / `origon` are reachable only from `aethryx.html` and
  each other — three substantial lore pages one link-removal from unreachable.
- Every playable build except rp7b is reachable **only** via `games.html`.

## 3.6 P2 — design system drift

Shared system is real: `--gold: #e8c878`, Cinzel + Cormorant Garamond + Inter,
and a consistent token vocabulary.

- `realms.html` + `cardmaster.html` are on the **old palette** `#c9a961` and load
  no Cormorant Garamond. Built as a pair before the current system, never
  migrated.
- `rp9.html` uses a third gold, `#f5c85a`.
- `macrobook.html` is a deliberate outlier — Archivo Black + DotGothic16, its own
  token set, with explicit bridge tokens back to the site. ★ **That looks
  intentional ("a book object, not a web page"). Confirm before anyone
  "harmonises" it.**

## 3.7 P3 — mobile

All 20 pages have a viewport meta. Responsive coverage is uneven:
`timeline.html` has 13 breakpoints, `saga.html` 10 — while **`arborynth.html` and
`rp10.html` have zero**, and `expedition.html` has **one** across 8,775 lines.
Known separately: `verify_macrobook_mobile` is failing 20/21 — the mobile layer
needs re-applying over the purple palette.

---

# PART 4 · SUGGESTED ORDER OF WORK

| # | job | why first |
|---|---|---|
| 1 | Rewrite `games.html` RP7 card | Three claims a player disproves in one click |
| 2 | Fix `index.html` 1299 + 1301 | Flagship unnamed; wrong game count |
| 3 | Decide where 2026 RP7 features get documented (§5.8) | Blocks all new RP7 copy |
| 4 | Codex → 21 canonical types, cast split out | Largest correctness gap in the archive |
| 5 | Reconcile the codex 210/69 vs 65/29 | Self-contradiction on one screen |
| 6 | Rewire or retire `rp8.html` | 1 MB build currently invisible |
| 7 | Publish the 145 missing staple species + Audrelius IV–VII | Fills the holes rather than renumbering around them |
| 8 | Strip in-lore version stamps; fix the tier-name map | Cosmetic but cheap |
| 9 | Add Macro Book to `zyraxis.html` nav | One line |
| 10 | Migrate realms + cardmaster palettes | Lowest risk, lowest value |

**Before committing any of it:** `node tools/verify_definitive_canon.js`. It
turns the handoff's 24 prohibitions into 20 assertions over every live
html/json/md file, and it asserts the **inverse** too — §5's queue must stay
open, because silently resolving is as much a retcon as contradicting.

---

# PART 5 · OPEN — DO NOT CLOSE THESE YOURSELF

Canon is silent on all of these. Detail in
`data/RULING_NEEDED_CANON_MERGE_2026-09-13.md`.

1. **`Elder Prime of Nexyros` card** — the codex ships it *and* `egnellahc` as
   two cards for one being. §24.6 says he is not an Elder Prime. Retire it,
   keep it as a title card, or is it a different entity mislabelled?
2. **Mykarlyth as "first humanoid in cosmic time"** — shipped in the codex and on
   `timeline.html`, against §7.1–7.2 making Egnellahc the Humanoid Prime.
   `UNRESOLVED_DO_NOT_INVENT`.
3. **Elyssia Eldersoul** as *"origin of all human life in Viridia"* vs §12.2's
   descent from the four Elder Primes. Two origins for one population.
4. **Anciuxor siring Azyrath**, and `VD-X001` shared with Ultharis — against
   §1.2 making Anciuxor a manifestation, not a second God.
5. **Father Gem "10 Mother Gems"** — §6.2 says preserve legacy Father-Gem
   material and does **not** renumber. Left exactly as written.
6. **Ferros / Ferralis · Ovauron / AEP-28 / Primalutonia · Immortal War
   990–1000 vs 908–1000 · Book IX→X 2031 vs 1945.** §24.16 forbids solving the
   last one with time dilation.
7. **`rp8.html` says "trainer" ~10× in player-facing copy**, including the
   character-creation label **"Trainer Name"** and a default player name of
   `'Trainer'`. `macrobook.html` says out loud: *"A Rizer is not a trainer.
   Nobody on Zyraxis uses that word."* rp7b had exactly one and it's fixed. rp8
   is one sweep — **say the word.**
8. **★ Where do the 2026 RP7 features live?** A new `rp7.html` gameplay page, a
   gameplay chapter in the macrobook (against its current spoiler-free teaser
   brief), or an expanded `games.html` card? Everything in §3.2 is blocked on
   this.

---

*Nothing under `backups/` or `_archive/` was touched or should be. A dated
snapshot is history — editing one would be the actual retcon.*
