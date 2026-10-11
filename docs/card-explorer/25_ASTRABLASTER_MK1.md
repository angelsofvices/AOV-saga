# 25 · AstraBlaster MK1

*Survey 10.21 · 2026-10-11 · Source: "AA:1936 — AstraBlaster MK1 · Official Player Weapon System V1.0"*

## What is in the build (first milestone)

- **The MK1 starts broken.** It was left at the crash site. It cannot fire until it is repaired.
- **Repair at the Workstation.** The Workstation's ASTRABLASTER MK1 card (and the same card in the Inventory, under WEAPON) offers REPAIR for **3 scrap, 2 crystal and 2 data** from NASARUS materials. Repair needs a built Workstation and the stores to pay for it. Repair is one-time; the first repair is achievable at the Workstation.
- **Equip from inventory.** Once repaired, EQUIP in the Inventory's WEAPON card puts the MK1 in Carl's hands. UNEQUIP puts it away. It is never visible while stored.
- **Unlimited rounds, a recharge meter.** A shot costs 20 of a 100-point charge meter. Charge comes back by itself at 16 points a second, after the blaster has been quiet for 0.4 seconds. There is no ammunition to buy or find. A bar labelled CHARGE on the field and in cave HUDs shows READY or RECHARGING.
- **Fire rate.** One shot per 0.34 seconds at most.
- **Visible only while firing.** The weapon is drawn in Carl's hands for about a third of a second after each shot. The bolt travels along the line of fire.
- **Square (□) on the field.** (Doc 26 has the full controls.)
  - With the blaster equipped and repaired, □ fires straight in the direction Carl faces (the four cardinal directions in the top-down field).
  - Bare-handed, □ moves objects, as before. It never moves Carl or objects while the blaster is armed.
- **Square (□) in a cave.** Fires the blaster in the direction Carl faces (left or right). Bare-handed, □ fires nothing. There is no melee. Circle is the crouch, walk and run key (see doc 26).
- **No fist combat.** The melee swing is gone. Bare-handed attacks do nothing.
- **Bolts and hits:**
  - A bolt flies 12 tiles a second and stops after 8 tiles.
  - It is stopped by walls, rock and cave solids.
  - It hits the first foe in its band for 26 damage.
  - Field hits use a 0.7-tile box; cave hits use 0.7 wide by 1.1 tall.
- **Caves:** the equipped MK1 stays equipped when Carl enters a cave; charge and repair carry over.

## Where the code lives

- `explorer/explorer.js`: the blaster block (`BLASTER`, `blaster()`, `repairBlaster()`, `equipBlaster()`, `blasterAction()`, `fireBlaster()`, `updateBolts()`, `drawBlasterFx()`), the inventory WEAPON card, the Workstation card, the field and cave HUD, and the `btnMove` / `btnB` / `sideAct('attack')` routing.
- `explorer/explorer.css`: `.x-weapon`, the charge bar.
- Save: `S.weapon = { repaired, equipped, charge }`.
- Journal: a new objective, "Repair the ASTRABLASTER MK1 at the Workstation (NASARUS materials)", in the first log.

## Not built yet

- **Upgrades:** damage, range, recharge, capacity, fire rate and projectile speed. The numbers above are the MK1 baseline.
- **Cloned variants:** the short, medium and long range categories, and manufacturing them.
- **Vertical aim in caves.** Cave shots go left or right only.
- **Weapon art in hand.** The gun is drawn as a simple shape for now.
- **Companions in caves**, and using items in caves.
