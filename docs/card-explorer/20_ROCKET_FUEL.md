# 20 · The rocket's fuel tank

*Survey 10.16 · 2026-10-10 · Creator:*

> "I have oil in my inventory but rocket still cant fly. add a refuel option when interacting with rocket. pulls from oil inventory. 1 oil fill up 20% of the rocket"

## Why it couldn't fly

Departure checks more than oil:
- the drive;
- the Navigation Center;
- **all five departure machines**.

The rocket now says exactly which is missing ("DEPARTURE LOCKED · still to build: …"), and its status lists **FIVE MACHINES n / 5**.

## The tank

- The rocket has its own **fuel tank, 0–100 %** (`S.ship.fuel`). Old saves start empty.
- **REFUEL +20 %** takes **1 OIL** from the inventory. **FILL UP** refuels until the tank is full or the oil runs out.
  - Both are on the rocket's screen (press A at the ship) and on the cockpit's SHIP tab.
- **A course burns tank fuel:** 4 % per unit of the old oil cost (`courseFuel`).
  - From NASARUS, most worlds take 28–100 % of a tank; Viridia takes 8 %.
  - Out-of-range courses cost 2.5×, so Ignara, Wyvera and Gravaron need a stop on the way.
  - Inside the safe radius the AstraNav refuses a course the tank can't cover. Beyond it the reading is static and you can be stranded, as before.
  - The flight home to NASARUS costs nothing.
- The star map's sheet shows each course's fuel against the tank.

## Fixed along the way

Legacy `.x-station` CSS, written for an old button, was restyling the new station screens: it pinned every `<i>` off-screen and changed `<b>` and `<span>` text. It is now scoped to `button.x-station`. The fuel bar and the party HP bars in station screens show again.
