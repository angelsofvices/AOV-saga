# OMNIRIS · Elder of Zarvane · 8-Trial Ladder
### DRAFT for Creator approval — nothing wired yet

**Purpose of this pass:** set the anchor. Zarvane has no NPCs and no side quests yet, so Omniris has to be able to run his entire ladder using systems that already exist plus things he himself provides. Everything below is checked against what is actually in `rp7b.html` today.

---

## ★ ONE DECISION NEEDED FIRST

You said **"omniris (humanoid-aura)"**. Right now the code has him the other way round:

```
rp7b.html:23572   id:'omniris', name:'Omniris', tier:6, type:'Aura', type2:'Humanoid'
                  src: 'assets/2D sprites/zyrex/omniris.png'   ← filed under zyrex/
```

He is currently an **Aura-primary Zyrex** sitting in `SPECIES`. Flipping him to **Humanoid-primary** is not a cosmetic swap — under [[aov-viridian-humanoid-primary-key]], which you called *key to canon*:

> Any being written as Humanoid-primary is **not** a Zyrex and belongs in `HUMANOID_ALLIES` / CONTACTS, never the roster.

That memory currently cites Omniris by name as an example of a *legal Zyrex with Humanoid secondary*. So this change:

- removes Omniris from the catchable/roster Zyrex list
- moves him to the humanoid ally track, alongside Kelthor, Scrapjaw and Auraxion
- means his sprite should move `zyrex/` → an ally path
- requires updating `aov-viridian-humanoid-primary-key` so it stops using him as the counter-example

**I think this is right**, and not just because you said so. An elder who runs eight trials and then *bonds with you* is structurally a Kelthor, and Kelthor is a humanoid ally. A Zyrex you bond with goes in your party; an elder you bond with goes in your phone. Omniris behaves like the second.

But it does contradict a locked memory, so I want you to confirm rather than have me quietly rewrite canon.

**→ Confirm: Omniris becomes Humanoid-primary / Aura-secondary, off-roster, ally id `omniris`?**

---

## ★ THE HANDOFF ALREADY EXISTS

Worth knowing before we design anything: **Kelthor's ladder already ends by pointing at Omniris.**

```
Step 8 · Cross to Zarvane · Lv 30 · 3 Soulphish + zarvaneEntered
```

Soulphish come from the Zarvane oasis. Omniris hovers on the **eastern oasis rim, deliberately clear of the Soulphish water cells** — the comment in his NPC block says exactly that. So the player's last errand for the Malezor elder is a fishing trip to the Zarvane elder's doorstep.

Nobody planned that as a handoff, but it is one, and it is better than anything I'd invent. **Trial 1 should fire the moment the player surfaces that third Soulphish** — they look up, and he's watching.

---

## ★ WHAT OMNIRIS TEACHES (and why it isn't Kelthor again)

Two elders teaching the same thing is one elder with two faces. The split:

| | KELTHOR · Malezor | OMNIRIS · Zarvane |
|:--|:--|:--|
| Land | Beastlands | **Auralands** |
| Teaches | **The Bond** — trust, not domination | **The Sight** — the Third Eye |
| Gem axis | Red · body · [[aov-gem-canon]] | **Blue → Purple** · brain → soul |
| Question | *"Will it come when called?"* | *"Do you know what it wants before it moves?"* |
| Descends from | Novarius's covenant | first humanoids to open the Third Eye |
| Failure mode | a Zyrex that obeys but does not trust | a Rizer who commands but cannot perceive |

Canon already supports this: Omniris is described as **one of the first humanoid masters to open the Third Eye**, Zarvane is the Auralands, and its Gemlord **Ivirium the Pearlord** is Spirit/Aura.

This also sets up the **Purple gem late-game reveal** ([[aov-gem-canon]] — Purple = Spirit/Soul) and feeds **Dreamland**, which per [[aov-dreamland]] gates the Rizer Ultimate Amp Form through *Blue + Purple pure balance*. Omniris is the character who should first say the word "Dreamland" out loud.

**Kelthor makes you a Rizer. Omniris makes you a seer — the real kind, which is why the Seers hate him.**

---

## ★ THE EIGHT TRIALS

Same machinery as Kelthor: strictly sequential, each gated on a Rizer Level, each verifying against a **real** system — no counters that were never wired. Flags in `player.omnirisStep = {s1..s8}`, bond in `player.bonds.omniris`.

Level band **15 → 55**. Kelthor runs 1→30, so the two overlap through the twenties: you finish learning to bond while you start learning to see. That overlap is deliberate and it's what makes Zarvane feel like a step up rather than a reset.

| # | Trial | Lv | Completion check | Rides on |
|:-:|:--|:-:|:--|:--|
| **1** | **The Watcher on the Rim** | 15 | talk to Omniris at the oasis | ✅ exists |
| **2** | **Still Water** | 18 | land **8 Soulphish** without the meter breaking | ✅ oasis fishing minigame |
| **3** | **The Unblinking** | 22 | stand in the oasis **without moving** for a real 30s while a Satyrbeast circles | ✅ enemies + aggro |
| **4** | **Read the Beast** | 26 | reach **60% bond** on any one Zyrex | ✅ bond curve |
| **5** | **The Hidden Door** | 32 | find the **Zarvane Seer HQ** (202,297) unaided — no marker | ✅ Seer HQ network |
| **6** | **Sleeping Sight** | 38 | sleep in a Zarvane bed and return having entered **Dreamland** | ⚠️ Dreamland is canon, not yet built |
| **7** | **The Pearl Road** | 46 | restore the **Zarvane radio tower** (170,220) | ✅ Scrapjaw tower network |
| **8** | **The Third Eye Opens** | 55 | bring Omniris a **Prismshard** | ⚠️ Prismshards are canon; Kelthor's step 8 already grants one |

**Trial 3 is the one I'd fight for.** Every other trial in the game is *do a thing*. This one is *stop doing things* — the player has to hold still while something dangerous walks past, and the instinct to swing is exactly what fails it. That's what "aura" should feel like mechanically, and it costs almost nothing to build: a timer, a proximity check, and a fail-on-input.

**Trial 5 deliberately withholds the marker.** The Seers hold the road out of every district ([[aov-seer-hq-network]]). Being made to *find* one with no waypoint is the first time the game asks the player to look rather than follow. If it proves too obscure, Omniris can offer a bearing — "east, where the road thins" — rather than a pin.

### Bond curve

Kelthor's total bond is capped at **10 across all 8 steps** (`bumpBond` in his interact). Omniris should mirror that — 8 trials, 10 bond total, weighted to the back:

```
s1 +1   s2 +1   s3 +1   s4 +1   s5 +1   s6 +1   s7 +2   s8 +2   = 10
```

"Bond fully" then means **100%**, reached the same way Kelthor's is — the ladder is the *elder's* half; the rest comes from the district's side quests once Zarvane has any. Which is the honest answer to why we're drafting and not building.

---

## ★ WHAT THIS NEEDS THAT DOESN'T EXIST YET

Being straight about the gaps rather than designing around them:

1. **Dreamland (trial 6)** — canon per [[aov-dreamland]], zero code. Either build a minimal version (sleep → blue-tinted vision scene → wake) or swap trial 6 for something shippable and hold Dreamland for when it's real.
2. **Prismshard as an item (trial 8)** — canon per [[aov-prismshards]]; Kelthor's step 8 already grants one, so this may already work. Needs checking.
3. **The stillness timer (trial 3)** — new, small.
4. **Omniris's dialogue tree** — 8 lessons, and he must not become a walking encyclopedia. Kelthor's rule applies: answers two or three things, then trails off.
5. **Zarvane has 14 homes and 6 shops but 4 friendly NPCs.** Per [[aov-settlement-doctrine]] that's 0.3 people per house against Malezor's 1.0 — Zarvane is the district the doctrine holds up as the *warning*. Omniris alone won't fix that. He's the anchor; the district still needs its dozen citizens.

---

## ★ HOW HE SPEAKS

Kelthor speaks in fragments because he cannot compress ancient events into modern language. Omniris should be the opposite failure: **he is precise, and it is unsettling.** He answers questions the player has not asked yet.

> "You will ask me about the water. Ask me about the thing behind you first."

> "I am not old. I have simply been paying attention for a long time. Those look alike from outside."

> "The Seers took the name because it was the only word left for what they could not do."

Never mystical for its own sake. He is a scientist of perception who happens to be very old.

---

## ★ OPEN QUESTIONS FOR YOU

1. **Confirm the Humanoid-primary flip** and Omniris coming off the Zyrex roster.
2. **Trial 6 — build a minimal Dreamland, or substitute** and save Dreamland for its own pass?
3. **Level band 15–55** — right, or should Omniris start later so Kelthor finishes clean first?
4. **"The main humanoid-aura species of Zyraxis"** — does that species have a name yet? Omniris being its *leader* implies a population, and that population probably lives in Zarvane's 14 empty houses.

---

*Draft only · v0.95.680 · no code changed*

Related: [[aov-dads-mentor]] · [[aov-bonded-astralite-combat]] · [[aov-viridian-humanoid-primary-key]] · [[aov-zyraxis-ten-districts]] · [[aov-gem-canon]] · [[aov-dreamland]] · [[aov-prismshards]] · [[aov-seer-hq-network]] · [[aov-settlement-doctrine]]
