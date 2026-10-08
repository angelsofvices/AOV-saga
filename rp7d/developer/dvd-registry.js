// RP7D · the DVD registry: every collectible movie in the AOV™ Saga, as data.
//
// A DVD is a real inventory item (loot.js builds an ITEMS entry for each one, so storage.js keeps it in exactly
// one place: the Zycube, Home Storage, or inside the TV's DVD player). What it PLAYS lives here, apart from the
// item and from the TV system (tv-system.js), so adding a movie is adding an entry and dropping its video file in.
//
//   id          the item id ('dvd_…'); also the key for the remembered playback position
//   title       on the case spine, the TV menu and the Zycube
//   type        STORY CUTSCENE · WORLD DOCUMENTARY · CHARACTER PROFILE · MUSIC VIDEO · SPECIAL CONTENT
//   cover       { color, accent, art? } · the case is drawn from these (art = an image path, optional)
//   video       paths tried in order (the first that loads plays): the playtest HTML sits in dist/, the website copy
//               beside its own assets/, so each disc lists both
//   duration    seconds, shown before the file has loaded
//   subtitles   [{ label, lang, src }] WebVTT files, optional
//   find        where the disc waits to be found: { level, x, z } in Rizer's home (level 1 living room, 2 bedroom)
export const DVDS = {
  dvd_rp7d_opening: {
    title: 'Rizing Power 7 Deluxe · Opening',
    type: 'STORY CUTSCENE',
    blurb: 'The RP7D opening movie, on disc. The first DVD in the collection: put it in the TV downstairs to watch it.',
    cover: { color: '#1743AA', accent: '#E9D39C' },
    video: ['./assets/video/intro.mp4', '../assets/video/intro.mp4'],
    duration: 58,
    subtitles: [],
    find: { level: 2, x: 7.6, z: 2.1 }
  }
};
export const DVD_TYPES = ['STORY CUTSCENE', 'WORLD DOCUMENTARY', 'CHARACTER PROFILE', 'MUSIC VIDEO', 'SPECIAL CONTENT'];
export const isDvd = id => !!DVDS[id];
