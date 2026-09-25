# Bag-folder sprites NOT wired into `ZYCUBE_ART`

`verify_zycube_ui` reads this file, so anything listed here is not reported as
an orphan — and anything in the folder that is neither wired nor listed still
is. That is the point: a sprite should always be *live in the bag*, *live
elsewhere*, or *parked*, and never *silently ignored*.

To wire one into the bag: give it an item key, add `key: 'file-name.png'` to
`ZYCUBE_ART`, add the key to `ZYCUBE_CAT_OF` so it lands in a drawer, then move
its row out of here.

## Live, but not as a bag icon

These are in this folder and are drawn by the game — just not from
`ZYCUBE_ART`, because they are not items you can own.

| file | what it is | where it is used |
|---|---|---|
| `barehands.png` | Rizer's fist — brown knuckles, gold-and-navy cuff, blue gem; transparent, tight, 758×992 | The **ARMORY main slot**, as the BARE HANDS mark when no weapon is equipped (`RIZER_FIST_ART`, v0.99.54). It has no item key because "unarmed" is not something you carry — it is the absence of the other five. If the ZyCube's WEAPONS drawer should ever gain an explicit *unarmed* row to unequip from, that is the change that gives this a key. |

## Parked — delivered, not yet used anywhere

| file | what it is | why it is parked |
|---|---|---|
| `tower-battery.png` | steel cell, red and blue terminals, four cyan charge cells, rust down one side | **Superseded, not rejected.** It was the icon for `tower_battery` — the per-district radio-tower pickup — until v0.99.50, when the Creator delivered a transmission remote for that role and confirmed it replaces the battery. The art is good and the object is coherent; it is kept in case a real battery item is ever wanted (a Zycellite cell, a tower spare, a crafting material). Nothing references it. |

## For the record

`radio-tower-transmission-remote.png` was parked from v0.99.48 until v0.99.50
and is now **live** as the icon for `tower_battery`. The item key is unchanged —
it is written into every save, into `player.towerBatteries`, into the chest ids
and into Scrapjaw's delivery loop — and only the label changed, to **Tower
Transmission Remote**.
