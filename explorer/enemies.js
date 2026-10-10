// ★ 2026-10-10 · AETHRYX ADVENTURES: 1936 · ENEMIES (overworld, real-time)
// Creator: "no more card battles. no turn based. I wanna see how it looks if the aethren actually fight the enemies on
// the overworld… we will have different enemy groups but for now just include seers grunts, nova guardians, penumbra,
// mori, and daemon from canon. see rp7d info for enemy descriptions and behavior."
// Canon (data/ENEMY_CANON_2026-09-14.md): everything comes from MORI and DAEMON, corrupt Haemen made by the Seers'
// plagues; the Seers' foot-soldiers are the GRUNTS; PENUMBRA is Thardin's seized war machinery; NOVA GUARDIANS are
// Thardin-faction riflemen (RP7D: ranged tech, blaster rifle, keep their distance). Base stats are RP7B's
// ENEMY_BASE_STATS (Mori the baseline grunt). Sizes from RP7B (Mori 1.00, Penumbra = Vilerok 1.45).
// Placement is a proposal: Zyraxis follows the district canon; other worlds carry thinner patrols so the
// fighting can be seen everywhere until each world gets its own enemy groups.
(function(){
  var ART = window.AOV_ART; if (!ART) return;
  function pad(rows){ return rows.map(function(r){ return (r + '................').slice(0, 16); }); }
  var KINDS = {
    mori: { name:'MORI', lineage:'Corrupt Haemen · tier 1 · the baseline grunt', tier:1, hp:125, atk:5, def:45, spd:40, range:1, aggro:6, behavior:'patrol', group:[2, 4], size:1,
      attack:'NECK BITE', fx:'bite', note:'Corrupted by the Seers\' plague. Hunts in loose packs across open ground.',
      pal:{ k:'#14101a', s:'#7a6a8a', S:'#5a4a6a', e:'#ff3a3a', c:'#e8e0d0', r:'#8a2030' },
      rows:pad(['....kkkk........','...ksssSk.......','..kssssSSk......','..kseksekk......','..kssrrssk......','...kcssck.......','..kksssskk......','.ksksssSksk.....','.kc.ksSSk.ck....','....ksssk.......','...kss.ssk......','...ks...sk......','..kk.....kk.....']) },
    daemon: { name:'DAEMON', lineage:'Corrupt Haemen · tier 2 · a faster Mori', tier:2, hp:125, atk:5, def:40, spd:70, range:1, aggro:7, behavior:'lurk', group:[1, 2], size:1.05,
      attack:'HOOK PUNCH', fx:'slash', note:'Lurks alone in the deep wild and strikes fast: kicks, hook punches, the neck bite.',
      variants:{ black:{ s:'#2a2232', S:'#18121e' }, red:{ s:'#9a2a2a', S:'#6a1818' } },
      pal:{ k:'#0e0a12', s:'#2a2232', S:'#18121e', e:'#ffb02a', h:'#d8d0c0', r:'#ff3a3a', c:'#e8e0d0' },
      rows:pad(['.h........h.....','.hk.kkkk.kh.....','..kksssSkk......','..kssssSSk......','..kseksekk......','..kssrrssk......','..kkcssckk......','.kksssssSkk.....','ks.ksssSSk.sk...','k..ksSSSSk..k...','...kss.sSk......','..kks...skk.....','..k.......k.....']) },
    seer_grunt: { name:'SEER GRUNT', lineage:'The Seers\' foot-soldiers', tier:2, hp:95, atk:4, def:55, spd:55, range:1, aggro:7, behavior:'guard', group:[2, 3], size:1.05,
      attack:'STAFF STRIKE', fx:'slash', note:'Armoured and disciplined. They hold a post and fight in formation.',
      pal:{ k:'#100c14', h:'#3a2a4a', H:'#22182e', m:'#c8c0b0', e:'#ff5a6e', a:'#5a4a62', w:'#9a7a4a' },
      rows:pad(['.....kkkk.......','....khhhhk......','...khHHHHhk.....','...khmmmmhk.....','...khmeemhk..w..','...khmmmmhk..w..','..khhhhhhhhk.w..','.khaahhhhaahkw..','.kh.khhhhk.hkw..','....khhHhk...w..','....khh.hk......','...kkk..kkk.....']) },
    nova: { name:'NOVA GUARDIAN', lineage:'Thardin faction · ranged tech', tier:3, hp:110, atk:6, def:50, spd:50, range:5, aggro:9, behavior:'kite', group:[1, 2], size:1.1,
      attack:'BLASTER RIFLE', fx:'bolt', bolt:'#ffb02a', note:'Thardin riflemen. They keep their distance, fire in bursts, and back away when you close in.',
      pal:{ k:'#0c0e12', a:'#3a3e48', A:'#24272e', v:'#ffb02a', g:'#6a7280', o:'#ffd23a' },
      rows:pad(['.....kkkk.......','....kaaaak......','...kaAvvAak.....','...kaavvaak.....','....kaaaak......','..kkaaaaaakk....','.kaakAAAAkaakk..','.ka.kaaaak.gggo.','....kaAAak.kk...','....kaa.aak.....','....kak.kak.....','...kkk..kkk.....']) },
    penumbra: { name:'PENUMBRA', lineage:'Thardin\'s seized war machinery · tier 6 commander', tier:6, hp:800, atk:9, def:70, spd:35, range:2, aggro:9, behavior:'patrol', group:[1, 1], size:1.45,
      attack:'SHADOW CRUSH', fx:'slam', note:'A Thardin war machine taken by a Seer commander. Before you reach Thardin it walks only there; after, it spreads.',
      pal:{ k:'#08060c', m:'#2a2438', M:'#1a1624', e:'#b86aff', o:'#ffb02a', p:'#4a3a62' },
      rows:pad(['...kkkkkkkk.....','..kmmmmmmmmk....','.kmMeMMMMeMmk...','.kmMMMooMMMmk...','.kmmmmmmmmmmk...','kkpmmMMMMmmpkk..','kpkmMMMMMMmkpk..','kp.kmmmmmmk.pk..','kk.kmMMMMmk.kk..','...kmm..mmk.....','..kkmk..kmkk....','..kkk....kkk....']) }
  };
  Object.keys(KINDS).forEach(function(id){ var d = KINDS[id]; ART.registerBodyPlan('foe_' + id, { rows:d.rows, pal:d.pal, note:'Enemy · ' + d.name });
    Object.keys(d.variants || {}).forEach(function(v){ ART.registerBodyPlan('foe_' + id + '_' + v, { rows:d.rows, pal:Object.assign({}, d.pal, d.variants[v]), note:'Enemy · ' + d.name + ' (' + v + ')' }); }); });
  // where each group lives · Zyraxis districts by canon (Malezor has no daemons; Thardin is the machines' home)
  var ZYRAXIS = {
    malezor:['mori', 'mori', 'seer_grunt'], zarvane:['mori', 'mori', 'seer_grunt', 'daemon'], andrannor:['mori', 'daemon', 'daemon', 'seer_grunt'],
    veridan:['mori', 'daemon', 'seer_grunt', 'seer_grunt'], netharion:['daemon', 'mori', 'seer_grunt'], vorashil:['daemon', 'mori', 'seer_grunt'],
    xilnar:['daemon', 'seer_grunt', 'mori'], baelgor:['daemon', 'seer_grunt', 'nova'], thardin:['nova', 'nova', 'penumbra', 'seer_grunt'], korathen:['daemon', 'seer_grunt', 'nova']
  };
  var ELSEWHERE = ['mori', 'mori', 'seer_grunt', 'daemon', 'nova'];
  window.AOV_ENEMIES = { kinds:KINDS, zyraxis:ZYRAXIS, elsewhere:ELSEWHERE };
})();
