# WEBSITE HANDOFF · The Macro Book · BETA V7.5.16

**Prepared:** 2026-09-07
**Target:** `AOV-saga-new` (github.com/angelsofvices/AOV-saga) · branch `main`
**Source of truth:** Master Codex v15.8 · Gamedex v5 · Codex v16
**Build tag:** `BETA V7.5.16` — RP7 · Gamedex 5 · Codex 16 · patch 0.95.990

The macro book is **built and on disk**. Nothing is pushed. This document is
everything needed to finish the job from the website chat.

---

## ★ DO THIS FIRST

```bash
cd ~/Documents/GitHub/AOV-saga-new

# a stale lock may block the commit — clear it if git complains
rm -f .git/index.lock

git status                      # confirm the state below still holds
git add macrobook.html
git commit -m "macro book · catching canon lock"
git push origin main
```

Push must run from a real Terminal. The Cowork sandbox on this Mac has **no
GitHub credentials** — no credential helper, no `~/.ssh`, no `gh` — so
`git push` there fails with `could not read Username for 'https://github.com'`.
That is a permanent property of the sandbox, not a transient error.

---

## ★ STATE AS OF LAST VERIFIED CHECK

The local Linux VM went unresponsive after these were confirmed. **Re-run
`git status` before acting.**

| | |
|---|---|
| HEAD | `4d18ca1` · "site · Rizing Power BETA V7.5.16 (+ The Macro Book, not my work)" |
| Parent | `0142fc4` · "v0.95.990 · Omniris' eight trials, meditation, and Kelthor becomes the router" |
| Unpushed | Both of the above |
| Uncommitted | `macrobook.html` — the catching canon lock, written to disk, not staged |
| Stale lock | `.git/index.lock` was present and could not be removed from the sandbox |

★ **Consider amending the commit subject before pushing.** `4d18ca1` currently
reads `site · Rizing Power BETA V7.5.16 (+ The Macro Book, not my work)`. A
parallel session wrote that after the macro book files were swept into its
commit. The files are correct — `macrobook.html` in HEAD is byte-identical to
what was built (sha256 prefix `60594f32616ffa92`). Only the message is odd, and
it becomes permanent public history on push. `git commit --amend` while local.

---

## ★ FILES

### NEW · `macrobook.html` (~204 KB, root)

The official guidebook, served at `/macrobook.html`. Single self-contained page
— no build step, no local assets, no JS dependencies. Loads only Google Fonts.

**Structure:** site head boilerplate (favicons, manifest, OG/Twitter,
`theme-color` `#0D0716`) → site hamburger drawer, retuned to the book palette
and moved to **top-right** so it clears the book's own contents rail → the book
itself → footer with links back to `/games.html`, `/rp7b.html`, `/legal.html`.

**Design:** deliberately single-theme. Gold-and-purple AOV language in a retro
JRPG register — bordered menu windows, `DotGothic16` and `Press Start 2P` for
display and chrome, `Zen Kaku Gothic New` body, `JetBrains Mono` for data. It
does **not** adopt the site's Cinzel/Cormorant treatment on purpose: it is a
manual, a distinct artifact inside the site, not another site page.

**Contents:** nine parts — 00 Before You Begin · 01 The World · 02 You Are a
Rizer · 03 Zyrex · 04 Combat · 05 The Bond · 06 The Journey · 07 Field Guide ·
08 The Launch Series. Sticky contents rail with scroll-spy. The V3.5 story is
behind a `<details>` spoiler gate.

**Five SVG diagrams**, hand-drawn as code so they stay crisp and stay editable
when canon moves — no raster art anywhere:

| Fig | What |
|---|---|
| 1.1 | The Ten Gem-Glyph Seals — one faceted gem per Gemlord cave in its canon stone |
| 1.2 | Zyraxis · the Z-shape — ten districts, ten routes, interstitials, Bridge of Hope |
| 3.1 | The T×333 ladder — stat pool per tier, with the Ultimate exemption at 4,995 |
| 3.2 | The complete 20×20 effectiveness chart |
| 3.3 | The five evolution ladders |

### MODIFIED · `games.html`

Three edits, all additive:

1. **CSS** — a `.macrobook-band` block inserted immediately before the
   `/* Responsive */` comment in the main `<style>`. Uses existing site vars
   only (`--border-gold`, `--gold-bright`, `--ivory`, `--mist`, `--font-*`).
2. **Markup** — the band, inserted directly after
   `<p class="hero-game-list-note">`, inside `.hero`. Deliberately **not** a
   `.game-card`: it is a document, not prototype 10.
3. **Nav** — `<li><a href="/macrobook.html" class="menu-link">The Macro Book</a></li>`
   added after the Games item.

### MODIFIED · `index.html`

Hero button `V7.4.15` → `BETA V7.5.16`. **Not this session's work** — it came
from the parallel session and was already in the tree.

---

## ★ NOT DONE — the nav item is games.html only

Every other page (`index`, `saga`, `timeline`, `aethryx`, `codex`) still ships
the 6-item menu. Adding the 7th to each is a one-line insert after the Games
`<li>`, and the `.menu-drawer.open .menu-list li:nth-child(7)` transition delay
already exists in every page's CSS, so no style change is needed.

---

## ★ CANON RULINGS MADE THIS SESSION

All three are Creator rulings and should propagate to the Master Codex.

**1 · The type palette is 21.** Twenty standard — ten original plus ten
expansion, Divine and Aquatic among them — plus ULTIMATE above the chart. This
**supersedes the 12-type reduction** described in the v7.4.15 website handoff
and in COSMIC THEORIES §v14.8. Any surviving "12 types" copy on the site is
stale.

**2 · Wild Zyrex are caught via Zysphere and by no other means.** No trap, no
item, no battle outcome, no quest reward. This supersedes the build note
asserting "catching is quest-only canon; no wild-grass catches." Recorded as an
explicit lock in Part 02 of the book.

**3 · The 20×20 effectiveness chart is recovered, not rebuilt.** See below.

---

## ★ THE TYPE CHART · recovered, needs ratification

COSMIC THEORIES marks the v2.29 chart RETIRED and points at a 12×12 replacement
that never shipped. It did not need replacing — **58 of its 60 edges were
already locked in canon** and simply never collected in one place.

- The nine expansion types with full INDEX entries supply 30 directed edges.
- The legacy 10-type cyclic chart (RPZ_Rules_Update_v5.7) supplies the
  original-vs-original relationships.
- Laid together, a structure falls out: **each expansion type beats exactly one
  original and is beaten by exactly one original.** Nine of ten pairs were
  already determined.

Radiant is the only type with no INDEX entry, and Aura was the only original
with no expansion predator, Unknown the only original with no expansion prey.
Exactly one assignment closes the graph:

> ★ **DERIVED, NEEDS CREATOR SIGN-OFF:**
> **Radiant is strong vs Aura. Unknown is strong vs Radiant.**

With those added the chart verifies: **60 edges · every type at exactly 3 strong
and 3 weak · zero mutual counter-pairs · clean diagonal.** Recommend
un-retiring the 20×20 chart rather than building a 12×12.

| Type | Family | Strong against | Weak against |
|---|---|---|---|
| Aura | Original | Corrupted · Spirit · Unknown | Creature · Extraterrestrial · Radiant |
| Beast | Original | Creature · Spirit · Verdant | Draconic · Humanoid · Ultramax |
| Creature | Original | Aquatic · Aura · Nature | Beast · Elemental · Unknown |
| Extraterrestrial | Original | Aura · Divine · Nature | Astral · Tech · Ultramax |
| Humanoid | Original | Beast · Draconic · Ultramax | Corrupted · Spirit · Tech |
| Nature | Original | Elemental · Tech · Unknown | Aquatic · Creature · Extraterrestrial |
| Tech | Original | Crystal · Extraterrestrial · Humanoid | Nature · Spirit · Verdant |
| Spirit | Original | Chrono · Humanoid · Tech | Aura · Beast · Crystal |
| Ultramax | Original | Astral · Beast · Extraterrestrial | Chrono · Humanoid · Unknown |
| Unknown | Original | Creature · Radiant · Ultramax | Aura · Divine · Nature |
| Draconic | Expansion | Aquatic · Beast · Elemental | Astral · Divine · Humanoid |
| Crystal | Expansion | Chrono · Radiant · Spirit | Elemental · Tech · Verdant |
| Radiant | Expansion | Aquatic · Aura · Chrono | Corrupted · Crystal · Unknown |
| Divine | Expansion | Corrupted · Draconic · Unknown | Astral · Chrono · Extraterrestrial |
| Corrupted | Expansion | Humanoid · Radiant · Verdant | Aquatic · Aura · Divine |
| Verdant | Expansion | Astral · Crystal · Tech | Beast · Corrupted · Elemental |
| Aquatic | Expansion | Corrupted · Elemental · Nature | Creature · Draconic · Radiant |
| Chrono | Expansion | Astral · Divine · Ultramax | Crystal · Radiant · Spirit |
| Astral | Expansion | Divine · Draconic · Extraterrestrial | Chrono · Ultramax · Verdant |
| Elemental | Expansion | Creature · Crystal · Verdant | Aquatic · Draconic · Nature |

---

## ★ OPEN ITEMS

**1 · Eight type colors are placeholders.** Canon supplies twelve. These eight
are invented and currently render as if official — they will end up on cards,
so they need a real lock:

| Type | Placeholder |
|---|---|
| Creature | `#A0763F` |
| Extraterrestrial | `#3F7A6B` |
| Ultramax | `#C08A2E` |
| Radiant | `#F0E0A8` |
| Verdant | `#5C8B3A` |
| Chrono | `#6E6A9E` |
| Astral | `#4A4A8B` |
| Elemental | `#A85C2E` |

Locked already: Aura `#E8C878` · Beast `#6B4A2E` · Humanoid `#8B6F5A` · Tech
`#3A5C7A` · Spirit `#6B4E7A` · Nature `#3A6B3A` · Unknown `#1F1F2E` · Draconic
`#8B2E2E` · Crystal `#3A6B7A` · Divine `#AAA275` · Corrupted `#5C1F1F` ·
Aquatic `#2E5A7A` · Ultimate `#FFD700`.

**2 · Visual Constitution has no guidebook medium.** It defines COMIC, TCG and
GAME. Proposed addition:

> **MACRO BOOK / GUIDEBOOK:** Two registers. **Plates** follow the Master Style
> Block + Aethryx Light modifier, Zyraxis Era gemstone palette — cover and part
> openers only, always framed. **Diagrams** are flat, non-rendered, drawn in the
> gold/amethyst book system — information graphics, never illustrations, never
> framed. Website edition ships diagrams only; plates are reserved for print.

**3 · Roster numbers disagree across three places.** The RP7 card on games.html
claims "316 catchable Zyrex" and a "547-card master codex"; the codex GAMES tab
says 537 canonical; the build survey reports locked roster 210, index 229, 57
implemented. **The book deliberately states no roster count** — that is the safe
position until one number wins. Do not add one until it does.

**4 · Print edition.** Deferred by decision: diagrams for the site, generated
plates for print later.

---

*Handoff prepared from Master Codex v15.8 · MMXXVI © 2026 Angels of Vices™ LLC*
