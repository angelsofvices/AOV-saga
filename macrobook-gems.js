/* Canon sources: GEM_COLOR_PSYCHOLOGY_CANON.md (explicit Creator rulings,
   established body/mind/spirit meanings; not its proposed economy or abilities),
   RP7_CANON_NINTH_TENTH_GEM_FORMATIONS.md §8 (public boundary), Macrobook
   Zyrex/Rizers sections, and zyraxis.html's published district descriptions.
   Manifestations explain those principles; no new species affinities, universal
   moves, stat bonuses, transformations or composite-origin claims are assigned. */
(() => {
  const gems = [
    {id:'ruby',name:'Ruby',color:'#C4133C',principle:'Body · Instinct · The will to act',seat:'Malezor · Rakoron',
      world:'Red is the physical principle: body, force and instinct. In Malezor’s Beastlands, that nature is felt in strength, survival and predatory life. The same drive can protect what it loves or turn to rage; Ruby is not inherently violent or evil.',
      zyrex:'Read Ruby as an emphasis on the living body and its physical power. Instinct, strength and the force of an attack express that leaning. The creature’s own nature gives that force its particular shape.',
      rizers:'Rizers channel astralite through their own bodies. Ruby’s language is physical action: strength, commitment and instinct brought into the fight beside a partner. Pushing power through a mortal frame still demands control; passion alone does not make the body limitless.'},
    {id:'pearl',name:'Pearl',color:'#EFE6DA',principle:'Balance · Reflection · No single leaning',seat:'Zarvane · Ivirium',
      world:'White reflects all rather than favouring one hue. In the canon, it is a trace of Aethryx carrying balance between astralites. Pearl gives that principle a face in Zarvane: equilibrium and energy held without one leaning overwhelming the rest.',
      zyrex:'Pearl points to balance among the energies within a living being. Its white carries power without a single hue taking precedence. The important quality is the relationship between its energies: how they can coexist without one overwhelming the rest.',
      rizers:'For a Rizer, this is the language of balance in channeling astral energy. Pearl’s reflection returns what it receives; its achromacy speaks of energy without a single preference. How a person learns to hold that balance is part of their own journey.'},
    {id:'citrine',name:'Citrine',color:'#E0A62A',principle:'Adaptation · Responsiveness · Change in the moment',seat:'Andrannor · Mutaryn',
      world:'Yellow is adaptation: the capacity to respond when conditions change. Andrannor makes the theme visible through hybrid life and creatures still becoming. Mutation is one expression of that landscape; the underlying principle is responsiveness.',
      zyrex:'Think of a living creature meeting a new pressure: responding, adjusting and finding a way to continue. Citrine names that adaptive tendency. Andrannor’s hybrid life makes the theme visible, with creatures continually becoming something beyond what they were.',
      rizers:'In a Rizer, adaptation is felt as alertness, agility and the effort of responding under pressure. It is the difference between repeating an action and adjusting to what a fight asks of you. Adaptation is not an unlimited supply of strength.'},
    {id:'emerald',name:'Emerald',color:'#1E8E52',principle:'Growth · Restoration · Life cultivated',seat:'Veridan · Emeralix',
      world:'Green is growth and restoration. Veridan’s living forest expresses this through interconnected life and ecosystems. Growth can renew a place, but growth without balance can also overwhelm it. Green is a living principle, not a guarantee of gentleness.',
      zyrex:'Emerald’s language is the development and renewal of living things. Read it through recovery, flourishing and the care that sustains a creature over time. Growth connects the individual to the living world around it, just as Veridan’s life belongs to an ecosystem.',
      rizers:'Rizers live this principle through care: nurturing their partners and giving living bonds room to grow. Emerald’s theme connects that patient cultivation with restoration. A growing bond is more than another way to demand power from a Zyrex.'},
    {id:'amethyst',name:'Amethyst',color:'#7A4FCF',principle:'Spirit · Connection · Sanctuary',seat:'Netharion · Eurakeon',
      world:'Purple carries the spirit and soul register of the gem language. Amethyst’s sanctuary at the centre of Zyraxis belongs to Netharion, where familiar reality gives way to mysteries. Sanctuary is its place in the world; spirit is the deeper principle it expresses.',
      zyrex:'A Zyrex has a living astralite nature. Amethyst directs attention to the bond and the being behind the body: connection, identity and the spiritual side of its power. The relationship a creature forms matters alongside the force it carries.',
      rizers:'For a Rizer, power is also a relationship with a living partner. Amethyst speaks to that spiritual connection. Respect and trust matter because a bond involves another will; connection and domination are not the same thing.'},
    {id:'sapphire',name:'Sapphire',color:'#1F5FD0',principle:'Mind · Intellect · Power directed',seat:'Vorashil · Azurel',
      world:'Blue is the mind: intellect, clarity and the direction of energy. Vorashil expresses this through intelligence and ways of thinking beyond the familiar. Blue is not inherently wiser or kinder; clarity can also become cold detachment.',
      zyrex:'Sapphire is the mental side of the colour language, associated with defense and special energy. It points toward how power is directed. Vorashil’s unfamiliar intelligences remind you that thought can take forms very different from your own.',
      rizers:'A Rizer channels astral energy through a mortal body; intellect gives that channel direction. Sapphire speaks to concentration, understanding and deliberate control. A natural affinity and mastery of it are different things: control must still be learned.'},
    {id:'onyx',name:'Onyx',color:'#2B2B33',principle:'Absorption · Holding · Restraint',seat:'Xilnar · Obsidius',
      world:'Black absorbs all rather than reflecting all. Onyx expresses holding and restraint, echoed in Xilnar’s binding mountains and its unseen forces. Absorption is a natural principle. Black is not the colour of evil, and it is not another name for corruption.',
      zyrex:'Onyx asks you to read inward: what a being takes in and holds. Absorption gives the black gem its natural meaning; restraint gives that holding a direction. Xilnar’s association with souls and unseen forces carries the same inward mystery.',
      rizers:'For Rizers, the useful distinction is between taking power in and controlling what is held. Restraint matters when energy passes through a mortal frame. Onyx gives that discipline a natural language: power received, contained and held under control.'},
    {id:'amber',name:'Amber',color:'#D9812A',principle:'Evolution · Lasting change · Perfected form',seat:'Baelgor · Ambrevon',
      world:'Orange is evolution: form changing under pressure. Amber’s ideal of perfected form is reflected in Baelgor’s civilization and structure. Where adaptation answers the moment, evolution concerns what a living thing becomes.',
      zyrex:'Evolution is central to Zyrex life. Amber is the colour-language for becoming: a body changed into a further expression of itself. Different creatures follow different paths, and some do not evolve at all. The principle is change in form, not a single destination.',
      rizers:'In Rizers, Amber offers a way to read lasting development. Change becomes part of the person who carries it, and learning to command that change matters as much as reaching it. Perfected form is an ideal with a demanding question inside it: what are you becoming?'},
    {id:'ninth',name:'Ninth Formation',color:'conic-gradient(from 220deg,#C4133C,#1F5FD0,#1E8E52,#E8C84A,#C4133C)',composite:true,principle:'Composite IX · Ordered structure · Anomaly',seat:'Thardin · Oathane',
      world:'The Ninth is one of two exceptional composite formations beyond the eight natural Gem Types. Several colours answer together. Thardin gives its public association a setting: systems, precision and the Mechlands. Its structure and origin remain closely guarded.',
      zyrex:'Oathane is the Gemlord associated with this formation. That exceptional manifestation is not evidence that an ordinary Zyrex has a ninth natural gem affinity. The guide records the connection without revealing the formation’s hidden nature.',
      rizers:'For a Rizer, recognizing a composite is different from knowing how it works. IX is not presented as an ordinary affinity anyone can acquire, or a technique every Rizer can learn. Its deeper powers are part of what remains to be discovered.'},
    {id:'tenth',name:'Tenth Formation',color:'conic-gradient(from 220deg,#F2EDE4,#D9812A,#7A4FCF,#141018,#F2EDE4)',composite:true,principle:'Composite X · Authority · Final balance',seat:'Korathen · Oatheus',
      world:'The Tenth is the other exceptional composite formation. Korathen carries its public associations of authority, law and final balance. Like the Ninth, it differs in origin from the first eight; its mixed light is visible, while the explanation remains guarded.',
      zyrex:'Oatheus is the Gemlord associated with the Tenth. This exceptional expression does not add another ordinary natural Gem Type for every species to inherit. The connection is known; the full nature of the formation is not disclosed here.',
      rizers:'A Rizer can recognize that this is something beyond a single natural leaning without knowing its workings. The Tenth is not a promised final upgrade for every person. Its secrets belong to the world you are entering.'}
  ];
  const dialog = document.getElementById('gem-dialog');
  const cards = Array.from(document.querySelectorAll('[data-gem]'));
  let selected = 0;
  let opener = null;
  function show(index) {
    selected = (index + gems.length) % gems.length;
    const gem = gems[selected];
    const fields = {counter:`GEM ${String(selected + 1).padStart(2,'0')} / 10`,title:gem.name,
      kind:gem.composite ? 'Exceptional composite formation' : 'Natural gem principle',
      principle:gem.principle,seat:gem.seat,world:gem.world,zyrex:gem.zyrex,rizers:gem.rizers};
    Object.entries(fields).forEach(([key,value]) => { document.getElementById(`gem-${key}`).textContent = value; });
    const emblem = document.getElementById('gem-emblem');
    emblem.style.background = gem.color;
    emblem.style.setProperty('--gem-glow',gem.composite ? '#e8c878' : gem.color);
    cards.forEach(card => card.setAttribute('aria-expanded',String(card.dataset.gem === gem.id)));
    dialog.scrollTop = 0;
  }
  cards.forEach(card => {
    card.setAttribute('aria-expanded','false');
    card.addEventListener('click',() => {
      const index = gems.findIndex(gem => gem.id === card.dataset.gem);
      if (index < 0) return;
      opener = card;
      show(index);
      document.body.classList.add('gem-open');
      dialog.showModal();
      document.getElementById('gem-close').focus({preventScroll:true});
    });
  });
  document.getElementById('gem-close').addEventListener('click',() => dialog.close());
  document.getElementById('gem-prev').addEventListener('click',() => show(selected - 1));
  document.getElementById('gem-next').addEventListener('click',() => show(selected + 1));
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
    document.body.classList.remove('gem-open');
    cards.forEach(card => card.setAttribute('aria-expanded','false'));
    if (opener) opener.focus({preventScroll:true});
  });
})();
