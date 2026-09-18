/* Public Gemlord profiles. Sources: the shipped Gemlord cards, the Macrobook
   district/gem language, RP7's field-scroll records, and the explicit public
   boundary in RP7_CANON_NINTH_TENTH_GEM_FORMATIONS.md §8. Plot outcomes,
   private bonds, the IX/X origin, and Obsidius's hidden role stay outside. */
(() => {
  const profiles = [
    {id:'rakoron',name:'Rakoron',district:'District I · Malezor',rank:'Gemlord of the Beastlands',gem:'Ruby',principle:'Body · Instinct',
      lore:'Rakoron is the living Ruby will beneath Malezor. He embodies physical force, predatory instinct, survival, and the discipline required to keep strength from becoming mindless violence.',
      presence:'The Beastlands answer him through territorial life, warm earth, and creatures that understand danger before they understand language. He does not need to rule Malezor for Malezor to bear his nature.',
      note:'Field record: the ground above Rakoron remains warm in winter. The people of Malezor do not treat that as a metaphor.'},
    {id:'ivirium',name:'Ivirium',district:'District II · Zarvane',rank:'Pearlord of the Auralands',gem:'Pearl',principle:'Balance · Reflection',
      lore:'Ivirium gives Pearl balance a living form. His principle receives many forces without letting one erase the others: order without stillness, perception without immediate judgment.',
      presence:'Pearl-light is said to keep Zarvane’s night from ever becoming wholly dark. The oasis, its measured rhythms, and the district’s sensitivity to energy all carry Ivirium’s balanced attention.',
      note:'Zarvane has an old word for dusk that translates as “the looking.” People use it as casually as evening.'},
    {id:'mutaryn',name:'Mutaryn',district:'District III · Andrannor',rank:'Citrinelord of the Creaturelands',gem:'Citrine',principle:'Adaptation · Mutation',
      lore:'Mutaryn embodies adaptation in motion: life responding, recombining, and becoming capable of surviving what it could not survive before. That gift can serve life or push it beyond recognition.',
      presence:'Andrannor’s hybrid creatures and fast-changing biology echo his Citrine nature. The district lives with transformation as an ordinary condition, even when the change itself is extraordinary.',
      note:'Much of Andrannor’s nightlife was built directly over the deep seam associated with its Gemlord. The district considers that proximity normal.'},
    {id:'emeralix',name:'Emeralix',district:'District IV · Veridan',rank:'Emeralord of the Naturelands',gem:'Emerald',principle:'Growth · Restoration',
      lore:'Emeralix is less like one organism than an ecosystem given singular will. Growth, renewal, interdependence, and the danger of life that no longer knows when to stop all belong to his Emerald principle.',
      presence:'Veridan bends and grows back. Roots, rivers, migrations, and old forests behave as parts of one living structure, making stewardship more important than control.',
      note:'Veridan’s root-scribes will not write Emeralix’s name in any ink that can be erased. Everything else is allowed to fade.'},
    {id:'eurakeon',name:'Eurakeon',district:'District V · Netharion',rank:'Amethystlord of the Unknownlands',gem:'Amethyst',principle:'Spirit · Sanctuary',
      lore:'Eurakeon anchors Netharion through Amethyst: spirit, connection, identity, and sanctuary amid forces that do not fit ordinary categories. His presence makes the world hub a refuge and a question at the same time.',
      presence:'Netharion gathers routes, records, anomalies, and travelers from across Zyraxis. Around Eurakeon’s principle, knowledge can be protected without ever becoming completely comfortable.',
      note:'The central ledgers describe each Gemlord as an anchor, not a ruler. Remove an anchor and the record does not become empty; it becomes false.'},
    {id:'azurel',name:'Azurel',district:'District VI · Vorashil',rank:'Sapphirelord of the Allelands',gem:'Sapphire',principle:'Mind · Intellect',
      lore:'Azurel embodies the Sapphire mind: clarity, intelligence, perception, and energy given deliberate direction. His intellect is not limited to humanoid ways of thinking or speaking.',
      presence:'Vorashil’s sky roads, alien structures, and unfamiliar intelligences reflect a district that treats thought as architecture. Understanding Azurel begins with accepting that intelligence may not resemble your own.',
      note:'Vorashil’s embassy calls the Gemlords a treaty. The field record objects: a treaty assumes every party could have refused.'},
    {id:'obsidius',name:'Obsidius',district:'District VII · Xilnar',rank:'Onyxlord of the Spiritlands',gem:'Onyx',principle:'Absorption · Restraint',
      lore:'Obsidius is the Black Gemlord and the strongest of the eight natural Gemlords. His Onyx principle concerns what is taken in, what is held, and the restraint required to contain power without being consumed by it.',
      presence:'Xilnar speaks through binding mountains, memory, souls, and forces felt more easily than seen. Its people describe their Gemlord in the present tense, as though grammar itself refuses distance.',
      note:'Visitors report that Xilnar’s way of speaking about its dead—and its Gemlord—settles into their own speech before they notice.'},
    {id:'ambrevon',name:'Ambrevon',district:'District VIII · Baelgor',rank:'Amberlord of the Humanoidlands',gem:'Amber',principle:'Evolution · Perfected Form',
      lore:'Ambrevon embodies Amber evolution: form changed by pressure until it reaches a further expression of itself. “Perfection” here is a direction and a responsibility, never proof that growth is finished.',
      presence:'Baelgor turns evolution toward civilization, lineage, structure, and the forms people build together. Ambrevon’s principle asks whether leadership can shape a society without demanding obedience from it.',
      note:'Baelgor’s oldest institutions treat a perfected form as an obligation: if you can become more, what will you become for?'},
    {id:'oathane',name:'Oathane',district:'District IX · Thardin',rank:'Gemlord of the Mechlands',gem:'Ninth Composite',principle:'System · Anomaly · Order',
      lore:'Oathane is associated with the Ninth Composite Formation, one of two expressions beyond the eight natural Gem Types. Its full structure and origin remain guarded; publicly, it is known through system, anomaly, and ordered complexity.',
      presence:'Thardin translates that principle into mechanisms, measurements, transit networks, and exacting institutions. Machines are not separate from its lore; they are how the district asks what order means.',
      note:'The Ninth is visibly composite. Which relationships make it possible—and why it differs from the first eight—are not public knowledge.'},
    {id:'oatheus',name:'Oatheus',district:'District X · Korathen',rank:'Gemlord of the Ultralands',gem:'Tenth Composite',principle:'Authority · Law · Final Balance',
      lore:'Oatheus is associated with the Tenth Composite Formation. Korathen reads its public meaning as authority, divine law, totality, and the burden of final balance. Its true origin remains closely guarded.',
      presence:'At the far seat, the principles of all ten districts become questions of responsibility. Korathen’s architecture and law treat power as something that must answer for the world it orders.',
      note:'Korathen teaches that Gemlords do not claim to rule because of strength. Their authority begins with having been noticed by Aethryx.'}
  ];
  const byId = Object.fromEntries(profiles.map((profile,index) => [profile.id,{profile,index}]));
  const dialog = document.getElementById('gemlord-dialog');
  const triggers = Array.from(document.querySelectorAll('[data-gemlord]'));
  let selected = 0;
  let opener = null;
  function show(index) {
    selected = (index + profiles.length) % profiles.length;
    const p = profiles[selected];
    const fields = {counter:`GEMLORD ${String(selected + 1).padStart(2,'0')} / 10`,title:p.name,district:p.district,rank:p.rank,gem:p.gem,principle:p.principle,lore:p.lore,presence:p.presence,fieldnote:p.note};
    Object.entries(fields).forEach(([key,value]) => { document.getElementById(`gemlord-${key}`).textContent = value; });
    triggers.forEach(trigger => trigger.setAttribute('aria-expanded',String(trigger.dataset.gemlord === p.id)));
    dialog.scrollTop = 0;
  }
  triggers.forEach(trigger => {
    trigger.setAttribute('aria-expanded','false');
    trigger.addEventListener('click',() => {
      const entry = byId[trigger.dataset.gemlord];
      if (!entry) return;
      opener = trigger;
      show(entry.index);
      document.body.classList.add('gemlord-open');
      dialog.showModal();
      document.getElementById('gemlord-close').focus({preventScroll:true});
    });
  });
  document.getElementById('gemlord-close').addEventListener('click',() => dialog.close());
  document.getElementById('gemlord-prev').addEventListener('click',() => show(selected - 1));
  document.getElementById('gemlord-next').addEventListener('click',() => show(selected + 1));
  dialog.addEventListener('keydown',event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    show(selected + (event.key === 'ArrowRight' ? 1 : -1));
  });
  dialog.addEventListener('click',event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close',() => {
    document.body.classList.remove('gemlord-open');
    triggers.forEach(trigger => trigger.setAttribute('aria-expanded','false'));
    if (opener) opener.focus({preventScroll:true});
  });
})();
