# ZORYN — PLAYER TWO, BEST FRIEND, RIVAL
**Creator canon, 2026-08-29.** Wired at v0.95.906 (companion + chest race). The
Part 2 boss beat is **design-locked, not built**.

---

## The one-line version

> Your best friend walks the whole of Part 1 beside you — and becomes the final
> fight of Part 2 because you were chosen and he wasn't.

---

## 1 · WHAT HE IS MECHANICALLY

**Player Two.** Bond **50** is the threshold at which he follows you and fights
alongside you. He is not an escort and not a summon: he is a second Rizer with
his own judgement, and the design brief is *smart NPC* — a character we keep
expanding, not a stat block that trails you.

### ★★ He fights (shipped v0.95.922)

He engages what threatens **Rizer** — range measured from you, not from him —
so he defends your ground instead of picking fights across the map, and a leash
keeps him off your flank. He alternates punch and kick on his own body at
620ms a blow against your 165-300: help, not a replacement, because if he
cleared rooms you would stop playing. His kills pay you exactly as a Zyrex's do
and are counted in `player.zorynKills`, beside `zorynChestsTaken` — **the
rivalry keeps its own books long before Part 2 gives it a name.**

And he stops looting the moment a fight starts. The chest-snatching is
needling, not greed, and a friend does not go through a box while you are being
hit.

### ★★★ He can fall (shipped v0.95.923)

**120 HP, ~14 blows to drop him.** Enemies adjacent to him hit back on their own
clock — this is the first time anything in RP7 has damaged an ally, because
every hostile in the game called `hurtPlayer` and only `hurtPlayer`. Out of
combat he catches his breath, but **a KO does not heal itself**: only a
**MYTHIC ELIXIR** gets him up, spent by facing his body and pressing X.

**Why he needs to be losable.** A companion who cannot fall is scenery with a
sword. Part 2 asks you to fight this person — so the game should first let you
lose him in the small way, dozens of times, until kneeling over him with an
elixir is muscle memory. That is also why the cure is the Mythic Elixir and not
a potion: it has to cost something you would rather keep.

A downed Zoryn answers nothing else — the revive sits above every other branch
of his interact, because a man face-down in the road does not hand you a map.

### ★ The chest race (shipped v0.95.906)

> *"sometimes zoryn will collect chests before you on expeditions if you dont
> loot fast."*

On expeditions he notices unlooted chests and, if you dawdle, **takes them**.
This is the single most character-defining mechanic he could have, because it
does three jobs at once:

1. **It makes him feel autonomous** — he acts on the world without being told.
2. **It creates friction with a friend**, which is the only honest way to earn a
   rivalry later. A betrayal out of nowhere is a twist; a hundred small losses
   to the same person is a *relationship*.
3. **It is the rivalry in miniature.** Part 2's premise is that Zoryn believes
   the prize should have been his. Every chest he beats you to has been
   rehearsing that for the whole game.

He gloats, lightly. He is still your friend here.

---

## 2 · THE TURN (end of Part 1)

**Rizer bonds a Gemlord before Zoryn does.** That is the whole fracture — not a
betrayal, not a corruption, a *comparison*. Zoryn concludes he is **unworthy of
his Rizer path**, and the conclusion is the danger, not the loss.

He becomes obsessed with proving his calling to the **RIZEMASTER (Master
Rizer)** — a title he is trying to deserve rather than a person who wronged him.

---

## 3 · THE FALL (Part 2)

- He goes to the **PIT OF NO RETURN** and finds an **ancient power** there.
- He makes contact with **cosmic Tier 9 power through ABOMINALYS** —
  single-handedly, which is exactly the proof he was looking for.
- He moves to **take Lower Zyraxis for himself**.

**Abominalys** is one of the SIX DRACOLORDS (T9 Demigod, Divine/Beast, survivor
of the First Ancient War). A T9 contact is not a power-up; it is the largest
thing a mortal Rizer has ever touched, which is why it costs him.

---

## 4 · THE BOSS FIGHT

**Part 2's major boss battle, in the Pit of No Return: you versus your best
friend.**

He should fight like a player, because he *is* one — the same four attack tiers,
the same bond mechanics, a real faction. The measure of this fight is not its
difficulty; it is that the player recognises every move he uses, because they
learned the game together.

---

## 5 · WHAT IS BUILT vs WHAT IS WRITTEN

| | status |
|---|---|
| Bond-50 companion threshold | **shipped** |
| Chest race on expeditions | **shipped** |
| Fights alongside you | **shipped v0.95.922** — guards Rizer, alternates fists and feet, leashed, kills counted |
| Can be hurt and killed | **shipped v0.95.923** — 120 HP, Mythic Elixir revives |
| The Gemlord turn | **written only** |
| Pit of No Return / Abominalys contact | **written only** |
| The boss fight | **written only** |

## ★★★ 7 · THE ESCALATION — best friend → rival → obsessive arch nemesis
**Proposal, 2026-09-01**, written against the day's rulings: *Elder/Warden · the Invasion of Malezor · Rizer named · S2 and the Novarian Challenge are Part 2 · Rakoron defers.*

> **Creator:** *"how should we tie zoryn into part 1 and 2. bestfriend rival turns obsessive arch nemesis"*

### ★★★ 7a · THE FORK, IN ONE SENTENCE

The Ruby Rage ruling gave Rakoron a new job: **he refuses Rizer.** *Not yet. Not like this.*

> ★★★ **Both boys get told no. Rizer accepts it. Zoryn doesn't.**
>
> **That is the entire difference between the protagonist and the final boss**, and
> it is the same difference as the ending — **Rizer is the one who does not take what
> is offered.** Zoryn is the one who cannot stop reaching for it.

★★★ **Which sharpens §2's fracture into something crueller and better.** It is not
*"you were chosen and I wasn't."* It is:

> ***"We were both refused. And then you weren't."***

★★ **So it must be RAKORON** *(answering open question 4)*. Not because he is the
home-district Gemlord — because **he is the one who deferred them both.** The same
god, the same word, twice, and then a change of mind about one of them. Any other
Gemlord makes it a coincidence. Rakoron makes it a verdict.

### ★★★ 7b · PART 1 · four movements, and the SAME shipped mechanic means something different in each

**Nothing new needs building.** The chest race already runs; it just needs to be
allowed to change register.

| | act | the chest race is… | Zoryn is… |
|---|---|---|---|
| **1 · THE GAME** | I–II · Malezor, Zarvane | needling between friends. He gloats, lightly | **your best friend** |
| **2 · THE SCOREBOARD** | III–V | ★ `zorynChestsTaken` climbing where you can see it. **Nobody mentions it** | **your rival**, un-named |
| **3 · THE INVASION** | ★★ IV · Malezor | he stops taking anything | **the other boy who was there** |
| **4 · THE COMPARISON** | V · after Korathen | he congratulates you, and then **stops appearing** | **gone** |

#### ★★★ Movement 3 · the seed of obsession is not envy. It is being unseen.

**Kelthor dies in the Invasion of Malezor. Zoryn's home too. Zoryn was there.**

★★★ **And Zoryn did not save him either.** Both boys failed the same man on the same
day. But the district grieves *with* Rizer, the Warden's death attaches to Rizer's
story, and **nobody writes a line about the other boy who was standing there.**

> ★★★ **The wound is not "you were chosen." It is "you were SEEN."**
>
> Envy makes a rival. **Being invisible makes an obsessive** — because the only
> possible remedy is to become impossible to overlook.

★★ **That is why he fixates on a TITLE rather than on Rizer** (§2: *"a title he is
trying to deserve rather than a person who wronged him"*). **A person can forgive
you. A title has to certify you.** He does not want revenge. He wants a receipt.

#### ★★ Movement 4 · the turn should be an ABSENCE, not a confrontation

He does not accuse you. **He congratulates you — and means it — and then the
bond-50 companion simply stops arriving.** No scene, no door slam, no note.

★★★ **The player will check the count.** `zorynChestsTaken` stops moving. That
frozen number is the last thing he says in Part 1.

★★ **And it rhymes with the game's whole spine: an absence that means something.**
Oatheus's empty seat, the tenth signature missing from the Pledge, the fourth place
at the Bridge — **Part 1 has taught the player for fifty hours that a gap is a
message. Zoryn is the one gap they thought was a friend.**

### ★★★ 7c · PART 2a · THE NOVARIAN CHALLENGE IS ZORYN'S ARENA

The ruling that moved the Challenge into Part 2 handed Zoryn a stage he did not have.

- ★★ **He is your bracket rival.** Faction of 9 against Faction of 9 — *the chest race
  at scale, with the whole planet watching.* Exactly the visibility he was denied.
- ★★ **He is GOOD.** The obsession is productive first, which is what makes it
  frightening. For a while he looks like a man who was right about himself.
- ★★★ **And then the Challenge refuses him too.** The shipped scroll: *"It measures
  whether a bonded pair can be **TRUSTED** with what comes next."*
  **Zoryn passes the skill test and fails the trust test.**

> ★★★ **THREE REFUSALS.** Rakoron defers him · Rakoron chooses Rizer · the Challenge
> judges him unworthy.
>
> **Obsession is what happens when a man is told no three times and concludes the
> problem is the judges.**

★★★ **[PROPOSAL, answering open question 3] Make the RIZEMASTER the living holder of
Novarius's mantle — i.e. the reigning Grand Champion of the Novarian Challenge.**

Then Zoryn's obsession and the Challenge are **the same object**, the player has
already met the man without knowing what he was, and:

> ★★★★ **Rizer, by winning, BECOMES the thing Zoryn was trying to prove himself to.**

The judge Zoryn has spent two parts trying to satisfy turns out to be his best friend.
**There is no version of that he can accept.**

### ★★★ 7d · PART 2b · HE GOES WHERE NOTHING CAN REFUSE HIM

★★★ **The Pit of No Return is the only place in the saga with no authority in it.** No
Gemlord, no Elder, no Accord, no Council, no bracket. **He goes to the one place that
cannot say no.**

And what he finds there is **ABOMINALYS — "The Endless Catastrophe," domain:
EXISTENTIAL FAILURE.**

> ★★ **That is not a coincidence to smooth over; it is the diagnosis.** The Dracolord
> whose domain is *existential failure* is exactly the power that answers a man who
> cannot survive not having been chosen. **The cosmos hands him a mirror and he calls
> it a weapon.**

★★★ **He is also Egnellahc inverted, and the game gets that for free.** Egnellahc,
offered a throne, **divided himself so no one being would hold the whole.** Zoryn,
offered nothing, **fuses himself with a Dracolord to become whole enough to hold it
alone.** Same act, opposite directions — **humility and pride making the identical
decision about how many people one being should be.**

★ And *"he moves to take Lower Zyraxis for himself"* (§3) becomes precise: **he is a
claimant.** Part 1 ended with a throne that *"violently rejects unworthy claimants."*
**Zoryn is the claimant it was rejecting.**

### ★★★ 7e · THE BOSS FIGHT · S1 versus S2

§4 already has him fighting like a player. The S2 ruling gives that a blade:

> ★★★ **He has S2. He did not earn it — he took it out of the Pit.**
> **You fight a man wielding the power you were refused, using the power you were
> given.**

★★★ **And S1 wins, for the third and last time, for the same reason it beat Xenoxil:
a refusal is not won with fury. It is won with clarity.** S1 is defined as *"controlled
Aura circulation, explicitly **not fuelled by anger**."* Zoryn is nothing but anger
with a discipline bolted on. **He has the stronger power and the weaker argument.**

#### ★★★ [PROPOSAL, answering open question 5] He can be saved — but not by winning.

**The non-lethal resolution should not be a menu option. It should be Rizer declining
to finish him** — which is **the same move he made at the Empty Throne**, and the same
move Novarius made when he *"tamed Rakoron through TRUST, not force."*

> ★★★★ **Rizer's entire character is one gesture performed three times: he declines.**
> **He declines the throne. He accepts being declined by Rakoron. And he declines to
> finish his friend.**
>
> ★★★ **Which is the Novarian Challenge's real examination — and it is not held in the
> bracket. It is held in the Pit.** The Challenge asked whether a bonded pair can be
> *trusted* with what comes next. **The answer is not a trophy. It is what Rizer does
> to the person who would have taken it.**

### ★ 7f · ANSWERS TO THE REMAINING OPEN QUESTIONS

- **(1) Does the chest race have a floor?** ★★ **Quest-critical: exempt. Cosmic:
  NOT exempt** — he should be able to cost you something real. ★★★ **And the chest he
  takes should come back.** A cosmic chest he beat you to in Act II, showing up in his
  hands in the Pit, is a five-hour setup the game is *already recording for free.*
- **(2) Does he keep what he takes?** ★★ **Yes, and make it visible.** *"The rivalry
  keeps its own books"* (§1) — let the player read the books. A number that only ever
  goes up is the quietest possible antagonist.

---

## 6 · OPEN QUESTIONS FOR THE CREATOR
*(★ 3, 4 and 5 are answered as proposals in §7 above — 1 and 2 too. All still yours to overrule.)*

1. **Does the chest race have a floor?** Right now he can take any unlooted
   chest you leave. Should quest-critical or cosmic chests be exempt, or is
   "he got there first" allowed to cost you something real?
2. **Does he keep what he takes?** If his haul is visible — a growing count you
   can see — the rivalry has a scoreboard long before Part 2 says the word.
3. **Is the Rizemaster a person we meet in Part 1?** If the player has shaken
   that hand, Zoryn's obsession has a face and the turn lands harder.
4. **Which Gemlord?** The one Rizer bonds is the one Zoryn will never forgive.
   Rakoron (Malezor, the home district) would be the cruellest and the most
   personal.
5. **Can he be saved?** Whether the boss fight has a non-lethal resolution
   changes how Part 1 should be written — a friend you can lose plays
   differently from a friend you will have to bury.
