# RULING NEEDED · what is the Field Workstation's `rear` frame for?

**Raised:** 2026-09-13 · v0.96.87
**Asset:** `assets/2D sprites/decor/fieldstation/station-rear.png` · 342×405

## Status of the other seven

All eight delivered frames are on disk, declared in `FS_FRAMES`, preloaded, and
bbox-exact. Seven of them now draw:

| frame | when it shows |
|---|---|
| `case` | stowed / the moment you set it down |
| `unlatch` · `half` · `deployed` | the unfold, 190ms a step |
| `crafting` | recipe tab open · tools out, drawer open |
| `scanning` | **★ v0.96.87 · Astralite Matrix tab open** — the art puts a gem on the pedestal under a live waveform readout, which is the Matrix and nothing else |
| `packing` | folding back into the case |

`rear` is the one left.

## Why I did not guess

It is **not a camera angle** — the perspective is identical to the other seven,
same 3/4 view, latch and operator edge still at the bottom, exactly to the
standard you set when you re-cut them. What actually differs is the *equipment*:

- a **tall antenna mast is raised** from the left side
- a **brass canister / boiler** with hoses stands where the specimen jar is in
  the other frames
- the drawer is open with tools visible

So `rear` is a **mode**, the same way `crafting` and `scanning` are modes — the
station configured for a third job. Wiring it to a pose I invented would put a
raised antenna on screen for a reason that isn't canon.

## The likely reads, in the order I'd bet on them

1. **★ Comms relay.** The mast is the loudest element. This would tie the camp
   into the existing network — the Z-Phone CONTACTS tab, Scrapjaw's broadcast
   towers, the contact-call signal gate. "Set up camp, raise the antenna, call
   anyone in your book from the middle of nowhere" is a real feature the art
   would be paying for.
2. **Distillation / brewing.** The boiler and hoses suggest the potion or
   harvest-consumable side rather than assembly — i.e. a third tab.
3. **Repair.** The station fixing itself or your gear after a raid, which would
   give the 40 HP some counterplay other than packing it.

## What is needed

Which one — or a fourth thing. Until then the suite
`tools/verify_field_station.js` asserts that `rear` is **the only** undrawn
frame, so if another one ever falls out of use it fails immediately instead of
quietly joining it.
