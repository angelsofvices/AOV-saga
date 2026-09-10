# RULING NEEDED · Omniris Trial 8 · and two art files for the Fang

**From:** v0.96.73, removing Kelthor's Prismshard.
You ruled it out and you were right — `aov-five-relic-definitions` says a
Prismshard **is** the Aenor Eruption: uncraftable, one of the sixteen. Ending a
tutorial with one is ending a tutorial with a sun.

## 1 · The change stranded something, and I want your ruling on the fix

**Omniris's Trial 8 requires a Prismshard.** Its own dialogue said so out loud:

> *"One trial left. Bring me a PRISMSHARD. You already have one.
> **Kelthor put it in your hand** and told you it could reshape anything worthy."*

Kelthor's grant was the **only** source in the game. Dev-mode GIVE ALL is the
other, and that is not a source. So removing it made the final oasis trial —
the one that unlocks **meditation** and closes out Zarvane's elder ladder —
unreachable in normal play.

### What I did, and why it is provisional

**Additive, not a replacement.** The Prismshard path is untouched for anyone who
somehow has one. I added a second key, taken from canon rather than invented:

> `aov-mealux` — **MEALUX = REMNANT TRACES of Prismshard XVI.**

A bonded Mealux *is* a piece of the same substance. And it is already what the
newly-locked Gemlord caves send you to find, so the chain now reads:

**Rakoron shuts the door → find your Mealux → the Mealux opens both the caves
and Omniris's last trial.**

Omniris's lines changed to match:

> *"Bring me a piece of a Prismshard. A whole one, if you have been given one.
> Or the living trace of one — the creature that opens the Gemlord doors.
> It is the same substance wearing a smaller shape."*

**★ This keeps the trial reachable. It does not settle the canon.** Three ways
you might rule instead:

| option | effect |
|---|---|
| **(a) Keep my fix** | Mealux is a valid Prismshard-trace. Tightens Zarvane→Malezor into one loop. |
| **(b) Trial 8 wants something else entirely** | Name it and I will rewire — it needs one obtainable thing. |
| **(c) A Prismshard IS obtainable somewhere later** | Then Trial 8 stays pure and gets gated behind wherever that is. |

## 2 · The Fang is built. It needs two art files.

`rubypaw_fang` is a full S1 weapon, declared in `S1_WEAPON_RING` — so the L1/R1
cycle, the Weapons panel, the HUD and the save all already know it.

- **damage** `baseAtk × 1.6`, **flat** — no combo table of its own and none
  borrowed. Above a first punch, below a third. It rewards hit-and-move.
- **durability 300** — the longest-lived of the five, because it is not forged.
  It is a tooth a Gemlord shed.
- **cycle order: last.** A dagger loses every tie to the sword, axe and bow.
- **one-shot** — `rubypawFangGiven` persists, so Rakoron sheds a tooth, not a supply.

### The two files I need from you

```
assets/2D sprites/rizer/rubypaw-fang.png        1254×1254 · 4×4 DLRU · 313 cells
    S1 Rizer, reverse-grip dagger jab. A short curved TOOTH, not a blade —
    bone-cream fading to ember-red at the root, the same crimson as Rakoron's
    Fathergem. Quick forward stab, minimal wind-up: the swing should read as
    FASTER than the Sapphire Tearsword's sweep, not stronger. Magenta key.

assets/2D sprites/ui/weapon-hud-fang.png        1254×1254 · same canvas + content
    bbox as weapon-hud-sapphire / -rubypaw / -emerald / -pearlbow, so the wheel
    swap moves nothing on screen. Tooth on the wheel, ember-red rim.
```

Until they land, equipping the Fang **falls back to the punch animation** and the
HUD shows the fists wheel — the same graceful degrade the Sapphire Tearsword
shipped with (`rp7b.html`, "anim will fall back to punch until file lands").
Nothing is broken; it is just not yet drawn.
