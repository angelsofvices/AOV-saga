# Bag icons delivered but NOT yet wired

Files listed here are on disk and deliberately absent from `ZYCUBE_ART` in
`rp7b.html`. `verify_zycube_ui` reads this file, so a delivery parked here is
not reported as an orphan — and anything in the folder that is neither wired
nor listed here still is. That is the point: a new icon should show up as
either *live* or *pending*, never as *silently ignored*.

To wire one: give it an item key, add `key: 'file-name.png'` to `ZYCUBE_ART`,
add the key to `ZYCUBE_CAT_OF` so it lands in a drawer, then delete its line
below.

| file | what it looks like | blocked on |
|---|---|---|
| `radio-tower-transmission-remote.png` | field radio handset — green enamel body, brass fittings, VU meter, tuning dial, two toggles, red and blue buttons, coiled cable, a glowing cyan crystal seated on top | no item key exists. The radio tower itself does (`malezor_radio_tower`, `towerBossKills`), so this is almost certainly its quest piece — but what the item IS called and what using it DOES are the Creator's to say, and inventing either would make a guess canon. |

1254×1254 RGBA, transparent background, same as every other bag icon.
