# RULING NEEDED · Morvexar · Nymphysyl · Penumbra

**Raised:** 2026-09-14 · art delivered and processed, placement not built.

★ **All 24 sheets are keyed, de-fringed and measured.** Masters in
`assets/2D sprites/enemies/_orig/`, keyed sheets alongside, bbox tables in
`data/ENEMY_BANKS_MEASURED_2026-09-14.json`. Every one is a clean 4×4 D/L/R/U on
313px cells, all under the 6% de-fringe cap.

**What is NOT done is placement**, and that is deliberate: three things in the
briefs collide with ruled canon or with what the engine can currently express.

---

## ★★★ 1 · MORVEXAR IS DESCRIBED AS "FINAL BOSS" — AND RP7 ALREADY HAS ONE

**Brief:** *"Corrupted Astral Charged Daemon Troll, **Final Boss** … multi-phase
encounters that evolve throughout the fight … They exert influence over their
environment, altering terrain, energy flow, or combat conditions within their
arena. Designed as narrative anchors, these encounters represent peak threat."*

**Ruled canon:** RP7 Part One's final boss is **XENOXIL + ORRYX + OPHIRA**,
fought together, and Xenoxil is *not fought anywhere before it*
(`RP7_STORY_LAWS.xenoxilFirstFightAt`). The suite fails if anything else is
wired as the Part One finale.

★★ **And the folder says something.** The art arrived from
`planets/27_viridia/V_characters:creatures/enemies/` — **Viridia is planet 27**,
the book setting. **RP7 is on Zyraxis, planet 9.** Memory records that the
Viridia roster is *source truth* for RP7 enemies **via a 5-band mapping**, so
these are legitimately RP7-bound — but "Final Boss" may well mean *Viridia's*
final boss, not RP7's.

**So: final boss of WHAT?** The candidates, none assumed:
- **a district boss** — peak threat for one district, like Vilerok/Vorugath but bigger
- **the Part One finale** — which would collide with a ruled beat
- **Lower Zyraxis / Part Two** — fits "narrative anchor" and leaves Part One intact
- **Viridia's, not RP7's** — i.e. banked for the book-era game

★ Note the art supports *any* of these: **two full phases** (p1 idle/walk/light/
heavy, p2 idle/light/heavy) plus **hurt, defeated, and "ready to loot."** That is
a complete multi-phase boss kit — 10 sheets, more than any enemy currently in
the build has.

---

## ★★★ 2 · NYMPHYSYL'S DEFINING RULE DOES NOT EXIST IN THE ENGINE

**Brief:** *"**Immune to all physical damage**, it can only be harmed through
astral abilities or energy-based attacks. Designed as a **rule-breaking enemy**,
it forces players to rely on astral systems and awareness rather than
traditional combat."*

> ### ★★★ THE BUILD HAS NO DAMAGE TYPES.
> No `damageType`, no `dmgType`, no `immuneTo`, no physical/astral split
> anywhere in 3.5 MB. Every attack in the game deals one undifferentiated kind
> of damage.

So the Nymphysyl cannot be built as briefed — **not because the art is missing,
but because the rule she breaks has not been written yet.** She is the first
enemy who needs the combat system to have a concept it does not have.

★ That is not a blocker on her, it is a **scoping question**. The minimum is a
per-enemy `immuneTo:['physical']` flag plus tagging the four attack slots
(`A1 Light · A2 Heavy · A3 Astral · A4 Ultimate` — ★ and note **A3 is already
called "Astral"**, so the vocabulary is half there). The maximum is a full
damage-type system touching every move in `MOVE_DEX`.

★★ **She is worth the smaller version.** The brief's own reasoning — *"forces
players to rely on astral systems"* — is exactly what the A1–A4 split exists
for, and nothing in the game currently makes a player choose between those four
buttons. **She would be the first enemy that makes the attack ladder matter.**

**Ruling needed:** minimum flag now, or full damage types later?

---

## ★★ 3 · PENUMBRA REFERENCES A MACHINE THAT DOES NOT EXIST YET

**Brief:** *"the evolutionary preamble to the **Penultinator War Machine** …
often deployed in advance of **Penumbra** units to destabilize targets."*

- **`Penultinator` appears nowhere** — not in the build, not in any canon doc.
  The Penumbra is defined as the *precursor to* something unwritten.
- ★ **And the last sentence reads as a typo:** *"deployed in advance of Penumbra
  units"* — in a Penumbra brief. Almost certainly *"in advance of **Penultinator**
  units"*, which is what the rest of the paragraph implies (the fast scout goes
  first, the heavy follows). **Confirm, because it inverts who leads.**

★★ Otherwise Penumbra is the cleanest of the three: **Tech**, bipedal, agile,
squad-coordinating. **Thardin is the Mechlands** and its Act IV beat is already
*"Seer corruption has infected/weaponised the technological systems"* with
**Industrial Mori and Daemon Sentinels** — a sentient war machine walks straight
into that district with no new lore required.
★ It also ships a **`defeat 2 - breadcrumb - ready to loot`** sheet, which
matches the existing enemy-drop pattern rather than needing new systems.

---

## WHAT I NEED, MINIMALLY

| # | question | blocks |
|---|---|---|
| 1 | **Morvexar is the final boss of what?** | all placement |
| 2 | **Nymphysyl: ship a simple `immuneTo:['physical']` flag, or wait for full damage types?** | her entire design |
| 3 | **Is "Penultinator" a real thing to write down, and is that last line a typo?** | lore only, not the build |
| 4 | **Which districts** do Nymphysyl and Penumbra patrol? Penumbra → Thardin is the obvious read; Nymphysyl is unassigned. | placement |
| 5 | **Are these Zyraxis enemies or Viridia enemies borrowed via the 5-band mapping?** ★ That mapping lives only in memory — there is **no doc for it in the repo**, which is worth fixing while we are here. | how they get tiered |

---

## READY THE MOMENT THOSE LAND

- 24 keyed sheets + 24 untouched masters
- 24 measured bbox tables, CC-extracted so VFX overhang is owned and no frame's
  box eats its neighbour's art
- torso-band body heights per sheet for the `refBh` yardstick
- **Morvexar** 10 sheets · **Nymphysyl** 7 · **Penumbra** 7
