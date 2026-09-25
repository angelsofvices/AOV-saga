# Bag icons on disk but NOT wired into `ZYCUBE_ART`

`verify_zycube_ui` reads this file, so a sprite parked here is not reported as
an orphan — and anything in the folder that is neither wired nor listed here
still is. That is the point: an icon should always be *live* or *parked*, never
*silently ignored*.

To wire one: give it an item key, add `key: 'file-name.png'` to `ZYCUBE_ART`,
add the key to `ZYCUBE_CAT_OF` so it lands in a drawer, then delete its row.

| file | what it is | why it is parked |
|---|---|---|
| `tower-battery.png` | steel cell, red and blue terminals, four cyan charge cells, rust down one side | **Superseded, not rejected.** It was the icon for `tower_battery` — the per-district radio-tower pickup — until v0.99.50, when the Creator delivered a transmission remote for that role and confirmed it replaces the battery. The art is good and the object is coherent; it is kept here in case a real battery item is ever wanted (a Zycellite cell, a tower spare, a crafting material). Nothing references it. |

## Not parked, for the record

`radio-tower-transmission-remote.png` was listed here from v0.99.48 until
v0.99.50 and is now **live** as the icon for `tower_battery` — the item key is
unchanged because it is written into every save, into `player.towerBatteries`,
into the chest ids and into Scrapjaw's delivery loop. Only the label changed,
to **Tower Transmission Remote**.
