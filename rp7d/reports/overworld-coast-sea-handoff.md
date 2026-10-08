# Overworld coast and void sea patch

## Changes
- Clipped existing Malezor terrain triangles at its real shoreline. Removed the square offshore terrain sheet and triangles descending from the coast to void vertices.
- Removed the decorative horizon cones that were unsupported beyond the land.
- Replaced separate district terrain sheets with one connected surface based on the canonical district coast union and existing nine land bridge widths.
- Eased Malezor border heights into adjacent ground over 42 world units, matching its edge height. Blended district colors over 26 world units and added a narrow bare shoreline.
- Clipped shores into closed side faces below the water line. Internal district boundaries do not receive cliff walls.
- Added a dark blue/violet void sea with gentle ripples, sun glints, horizon blending, and shared day/night lighting.
- Added sea colors, wave marks, and canonical land connections to the Zyphone world map; district map offshore areas now use the sea palette.
- Exterior sea visibility follows interiors. Offshore water queries return the sea level; offshore height queries no longer clamp to remote inland terrain.

## Scope
No buildings, props, nature, loot, or NPCs added to Districts II–X. Canon world-data.js and rp7b.html remain unchanged. The districts retain their existing empty terrain for later canon-specific development.

## Delivery
- Active playtest: dist/RP7D_Malezor_Playtest.html
- Original source and previous playtest backed up in backups/overworld-20261007-171750/.
- HTML bundle compiled successfully. Interactive visual playtesting has not been performed for this patch.

## Suggested next world pass
Refine Malezor riverbanks, shore contours, and ground material transitions using the existing terrain, before adding canon-specific district content.
