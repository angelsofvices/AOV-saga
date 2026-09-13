# RULINGS NEEDED · fallout from merging the Definitive Canon Handoff

**Raised:** 2026-09-13 · from `data/AOV_SAGA_DEFINITIVE_CANON_HANDOFF.md`
**Applied already:** everything the handoff explicitly supersedes. See the commit.
**Below:** everything it does **not** answer. §26.6 — *"Never 'fix' an unresolved
issue by inventing an answer"* — so none of these were touched.

---

## 1 · ★★ The `Elder Prime of Nexyros` card

`codex.json` ships **two cards for one being**: `egnellahc` (Tier VII) and
`Elder Prime of Nexyros` (Tier VIII), and its own note says the second title
"accurately refers to EGNELLAHC". §7.2/§24.6 says he is **not** an Elder Prime.

I corrected the *note* to say the title is a legacy label and flagged it.
**I did not merge or delete a card** — that is a roster change, and
`staple_roster_v1.json` is locked.

**Needed:** is `Elder Prime of Nexyros` (a) a second card that should be retired,
(b) a legitimate separate *title card* for the same being, or (c) actually a
different entity that got mislabelled?

## 2 · ★★ Mykarlyth as "first humanoid in cosmic time"

Shipped in `codex.json` and on `timeline.html`: *"The Mandrake egg from Draevos
is later laid here, hatching the first humanoid: **Mykarlyth**."*

§7.1 makes Mykarlyth **a late-generation Dracolord, Mass lineage**. §7.2 makes
**Egnellahc** the Humanoid Prime and origin of foundational humanoid life. The
repo's own `codex.html` already says *"Egnellahc, Humanoid Prime — the first
humanoid."* Both are live, in the same product.

**Needed:** the handoff does not mention the Mandrake egg at all. Is Mykarlyth a
Dracolord who was *also* Mandrake-hatched (§6.3 makes Mandrakes forced
embodiments of Astrums, which does not obviously fit), or is "first humanoid"
obsolete wording for him? **`UNRESOLVED_DO_NOT_INVENT`.**

## 3 · Elyssia Eldersoul vs the Elder Primes

`codex.json`: Elyssia is *"the first divine humanoid and origin of all human life
in Viridia… establishing a unified beginning for all bloodlines."*
§12.2: Viridians descend from the **four Elder Primes**, who arrive after the
failed Transplacement.

Two mutually exclusive origins for the same population. The handoff never names
Elyssia, so it does not supersede her. ★ Note she does **not** violate §12.1 —
her parents Lucienis and Theia are Immortals, so Immortals still precede
humanoids, which is correct.

## 4 · Anciuxor siring Azyrath

`timeline.html` and `STORY_MASTER_RECALL.md`: Alphaea *"mated once with Anciuxor
(the Father, not a Dracolord). Their one direct child was Azyrath."*
§1.2 makes Anciuxor a **manifestation/interface of the Highest One**, not a
second God. A manifestation of God fathering a Dracolord line is at least in
tension with §24.22. May well be legacy canon you want kept — flagging, not
asserting.

## 5 · The Father Gem and its "10 Mother Gems"

`timeline.html`: the Father Gem is *"the source from which all 10 Mother Gems
descend."* §10.2 makes only **eight** natural, with IX/X composite. §6.2 says
preserve legacy Father-Gem material where compatible and does **not** renumber.
Left exactly as written. `PRISMSHARD_GEMSHARD_CANON.md` documents the gap.

## 6 · §25's own queue, restated

The handoff lists these as unresolved and the new suite now **asserts they stay
unresolved** — a silent resolution is as much a retcon as a contradiction:

- **Ferros / Ferralis.** `aethryx.html` and `timeline.html` both said
  "(formerly Ferros)" — which quietly picked a winner. **Claim removed**, both
  names left standing. `saga.html`'s route now reads "Ferros/Ferralis", matching
  the handoff's own §19 wording.
- **Ovauron / AEP-28 / Primalutonia.** `aethryx.html` calls planet 28 both
  "Ovauron · The Drift World" (L1689) and "AEP-28 / Primalutonia · The
  Worldender" (L1835) — in the same file.
- **Immortal War dating.** 990–1000 vs 908–1000.
- **Book IX → Book X chronology.** Expedition after 2031, Earth contact 1945.
  §24.16 forbids solving it with time dilation.
- **Surviving Planetelles · the three Fae sister races · the unnamed Astralites.**
  The word "Planetelle" appears **nowhere** in the repo. That is a gap, not an
  error, and §24.3–24.5 say leave it.

## 7 · ★ `rp8.html` says "trainer" about ten times in player-facing copy

Character creation reads **"Trainer Name"**. Dialogue reads *"Each of them is
looking for a trainer"*, *"The Seers pay in coin for every trainer we bury"*,
and the default player name is `'Trainer'`.

The terminology lock is Rizer, never trainer, and `macrobook.html` says so out
loud: *"A Rizer is not a trainer. Nobody on Zyraxis uses that word."*

`rp7b.html` had exactly **one** such string; it is fixed. rp8 is a bigger job
touching UI labels and default names, and rp8 is not the mainline build — so I
did not sweep it unasked. **Say the word and it is one pass.**

---

## What the merge DID change

| | |
|---|---|
| `RP7_CANON_NINTH_TENTH_GEM_FORMATIONS.md` | §3 rewritten — **Obsidius performs the Soul Split**; Oathane patterned from him, Oatheus a hybrid; new §10 amendment log |
| `EGNELLAHC_SPLIT_PROPOSAL.md` | **PARTIALLY SUPERSEDED** banner — my invented "refused to rule alone" motive retired; the concealment/reveal design survives |
| `ZORYN_ARC_CANON.md` | the Egnellahc mirror re-motivated on **consent**, flagged for your confirmation |
| `aethryx.html` | "45 Discovered · 200+ Theorized" → **7 Tiers · 63 Astralites** |
| `timeline.html` | "THE FIRST WAR" → "THE FIRST **ASTRUM** WAR" · Egnellahc no longer an Elder Prime · the split attributed to Obsidius · Viridia's "First race" → "First **mortal** race" |
| `codex.html` · `codex.json` · `roster.json` · `cards_v6.7.json` | "Born from Egnellahc" removed from Oathane/Oatheus; "father to two Immortals" → "origin of" |
| `zyraxis.html` | "Ten fragments"/"Each fragment became a faction" → wording that doesn't make all ten Mothergem shards |
| `rp8.html` | "ten shards become the TEN GEMLORDS" → eight, with the final two set apart |
| `STORY_MASTER_RECALL.md` · `EARLY_GAME_FLOW.md` · `PRISMSHARD_GEMSHARD_CANON.md` | same two corrections, with the reason recorded inline |
| `rp7b.html` | the one player-facing "trainer" → "Rizers" |
| `tools/verify_definitive_canon.js` | **new** — §24 as 20 executable assertions |

★ Nothing under `backups/` or `_archive/` was touched. A dated snapshot is
history; editing one would be the actual retcon.
