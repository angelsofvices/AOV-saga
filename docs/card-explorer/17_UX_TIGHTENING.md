# 17 · UX tightening

*Survey 10.10 · 2026-10-10 · Creator-approved list (item 9, ○ doing gait and back, stays as it is for now)*

1. **Touch access to the AstraNav.**
   - The HUD NAV button acts as the touchpad.
   - The cockpit's TOUCHPAD · ASTRANAV label is a button too.
   - Pressing either again goes back to the field or the cockpit.
2. **INVENTORY is the only full list.**
   - The System screen shows a glance: the first six bag items, the counts, and a link to INVENTORY.
   - Research no longer shows the bag and stores lists. It opens on RESEARCH CARDS.
3. **Stations split by job:**

   | Station | Does |
   |---|---|
   | Workstation | machines and tools (recall flares) |
   | Workshop | suit and air gear: air tanks, suit modules (fitted here, no longer in the pilot builder), clearing the ridge |
   | Rocketship Repair Station | the ship: installing parts |

   Saves with core systems switched off keep the old Workshop rules.
4. **A context-sensitive A button.**
   - The label names what A will do: OPEN, TALK, TAKE, MINE, GATHER, READ, SURVEY, BUILD, REST, SHIP, PICK UP, and so on.
   - A prompt above the buttons spells it out, for example "A · OPEN THE WORKSTATION"; with a controller it reads "✕ …".
   - □ dims when nothing in front of you can be moved.
5. **One toast at a time.** A new message replaces the last; a repeat only refreshes it.
6. **HEADQUARTERS uses chapter tabs:** OVERVIEW, THE WAY HOME, PEOPLE, MATERIALS, CORE SYSTEMS, FACILITIES, and the rest.
7. **Directions.**
   - Objectives can point somewhere: the camp plot, the nearest machine paper, the nearest unsurveyed ruin, the ship. The objective line adds "· N paces <compass direction>".
   - The live scanner marks machine papers still on the ground.
8. **Reset layout.**
   - SETUP · RESET MOVED OBJECTS (n) puts everything you moved back.
   - Anything already harvested stays harvested.
   - Cached world maps are rebuilt (`AOV_WORLDGEN.reset`).
10. **Housekeeping.**
    - The tests that click the NAV button pass again.
    - The inventory, chapter and items tests now use the INVENTORY tab.
