# RESEND NEEDED · 4 Zoryn action sheets were keyed on BLACK

**Found:** v0.96.66, from your report that Zoryn's attack frames lost body pixels.
You were right. **This is not the v0.96.65 de-fringe** — that took a 0.05% green
rim off these sheets. The damage is from **c990b69 (v0.95.370)**, and it has been
in the build ever since.

## What happened

That commit's own message says it: the baker

> *"auto-detects corner chroma color per sheet (**black bg for punch/kick/hurt/skate** ·
> magenta for interact · green for death/jump) then flood-fills from edges"*

**Zoryn wears a black coat.** His coat touches the silhouette edge, so a flood-fill
of black started outside him and walked straight in. What survived is his red hair,
his face, the gold trim and the metal pauldrons — floating in empty space, attached
to nothing.

The three sheets keyed on canon colours are perfect. That is the proof:

| sheet | key used | solidity of frame 1 | |
|---|---|---|---|
| jump.png | neon green | **71.6%** | ✅ intact |
| interact.png | magenta | **68.1%** | ✅ intact |
| death.png | neon green | **63.0%** | ✅ intact |
| hurt.png | **black** | 46.5% | ❌ hollow |
| punch.png | **black** | 43.2% | ❌ hollow |
| kick.png | **black** | 42.0% | ❌ hollow |
| skate.png | **black** | 40.2% | ❌ hollow |

*(solidity = what fraction of the pose's own bounding box is still art)*

## ★ The pixels are gone. I looked everywhere.

Erosion is not reversible, so restoring means finding a pre-bake master. There
isn't one:

- **git history** — `c990b69` is the ADD commit for all seven. They entered the
  repo already baked. No earlier blob exists.
- **the codex worktree** (`~/.codex/worktrees/rp7-new`) — byte-identical baked copies.
- **dangling git objects** — 0 orphaned 1254×1254 PNGs.
- **uploads, Desktop, all Claude delivery folders** — no Zoryn action sheets.

## What I need from you

**The four original sheets, un-keyed:** `punch`, `kick`, `hurt`, `skate`.
Whatever background they came on is fine — including black, now that I know.

I will key them **by silhouette rather than by colour**: build the character mask
from the frames that are *not* background-coloured, and never flood a colour the
character is also wearing. Canon (`aov-chroma-key-canon`) has always been
**magenta or neon green only** — a corner-sniffing baker that accepts "whatever
colour the corner happens to be" will key a character's own wardrobe, which is
exactly what it did.

The other three sheets do not need re-sending.

## The guard is already in

`tools/verify_hollow_sheets.js` compares every sheet in a character bank against
its **most solid sibling** and fails anything under 75%. It currently reports the
four above and nothing else, and it turns green the moment the re-keys land.

★ It is written against the *best* sibling, not the median, because the first
version compared to the median and **passed all seven** — four of the seven are
the broken ones, so the median *was* the damage. Same shape as a crashed suite
reporting nothing: when the defect is the majority, an average calls it normal.
