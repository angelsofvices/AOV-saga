/* ★ THE CODEX · every catchable Zyrex in Rizing Power (RP7B / RP7D).
   This file is the roster. zyrex-codex.js renders whatever is in it — add an
   entry here and it appears on /zyrex-codex.html with search and filters.

   ENTRY SHAPE (only no + name are required; leave anything unknown out):
   {
     no: 1,                          // Codex number
     name: 'Name',
     types: ['Beast'],               // one or two of the 21 canon types (data/TYPE_COLORS_V1.json)
     districts: ['Malezor'],         // where it can be caught on Zyraxis
     games: ['RP7B', 'RP7D'],        // which builds it is catchable in
     stage: 1,                       // evolution stage, if any
     evolvesFrom: 'Name', evolvesTo: ['Name'],
     art: 'assets/…png',             // optional portrait
     lore: 'One or two lines from the record.'
   }

   ★ Empty on purpose — the official roster is coming from the Creator. */
window.ZYREX_CODEX = [];
