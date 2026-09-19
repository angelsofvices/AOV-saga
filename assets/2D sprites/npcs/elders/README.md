# DISTRICT ELDER SPRITE SHEETS

One Elder per district. Nine of ten districts are assigned; **Korathen has no
Elder yet** and is deliberately absent from `DISTRICT_ELDERS`.

| # | District  | Elder                | Sheet                       | Look |
|---|-----------|----------------------|-----------------------------|------|
| 1 | Malezor   | Warden Kelthor       | `../kelthor.png`            | existing reference sheet |
| 2 | Zarvane   | Choirmother Ivelith  | `ivelith.png`               | white braids, ivory-and-gold sunpriestess robes, sun crown |
| 3 | Andrannor | Beastkeeper Mora     | `mora.png`                  | dark braids, black-and-citrine leathers, fur and fang mantle |
| 4 | Veridan   | Grovewarden Selis    | `selis.png`                 | green hair, branch crown, emerald leaf mantle |
| 5 | Netharion | Nullkeeper Voss      | `voss.png`                  | silver hair and beard, black-and-amethyst void robes |
| 6 | Vorashil  | Skybroker Ezekar     | `ezekar.png`                | silver hair, blue coat, glowing technological monocle |
| 7 | Xilnar    | Wispkeeper Naela     | `naela.png`                 | silver-blue braid, midnight robes, wisp lantern |
| 8 | Baelgor   | Emberkeeper Draith   | `draith.png`                | red-and-silver forge beard, leather apron, brass bracer |
| 9 | Thardin   | Foremanchief Yorik   | `yorik.png`                 | gray moustache, goggles, engineer's coat, mechanical arm |

## Format

1254×1254 transparent PNG · 4×4 grid of 313px cells · rows **Down, Left, Right,
Up** · four idle/blink frames per direction.

Scale is anchored to Kelthor: `scaleRefBh: 295`, which is Kelthor's measured
column-0 DOWN body height (his four are 295 / 278 / 278 / 290). Crowns, antlers
and lanterns therefore change the silhouette without changing how big the
character reads.

## ★ KNOWN ART ISSUE · THE ROWS BLEED INTO EACH OTHER

Measured 2026-09-18, on every one of the eight new sheets: opaque pixels bridge
the seam between the DOWN row and the LEFT row.

```
ivelith 199px   mora 358   selis 452   voss 464
ezekar  378px   naela 409   draith 527  yorik 243
```

Two consequences, both real:

1. **A per-cell bbox is meaningless on these sheets.** Measured naively, the
   LEFT row of all eight returns `y=0, h=313` — the full cell — because the ink
   never stops. That is not the character; it is the character plus the row
   above.
2. **Connected-component ownership also breaks**, because on ezekar and naela
   the LEFT and RIGHT rows are *one blob* (274 and 213 px joining them). Given
   to whichever cell holds the centroid, that blob measures 584px tall at
   `y=-286`, and the other row measures nothing at all.

The shipped `bboxes` in `DISTRICT_ELDER_SPRITES` are tighter than the cell and
are sound: each keeps 96.4–99.9% of its own cell's ink and pulls in at most
228px of a neighbour's. `tools/verify_elder_sprites.mjs` asserts exactly that.

**If the sheets are re-exported with clean seams**, re-run
`python3 tools/measure_elder_sheets.py` and paste the tables back in — the
ownership measurement becomes trustworthy the moment the rows stop touching.
