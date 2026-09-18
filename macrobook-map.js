/* Illustrated atlas: regions follow zyraxis-worldmap.png. Overlay copy stays
   inside the public Macrobook boundary: it offers a premise, never an outcome. */
(() => {
  const districts = [
    {name:'Malezor', roman:'I', land:'Beastlands', known:'The Beastlands', lord:'Rakoron', gem:'Ruby · Instinct',
      description:'Primal. Predatory. Survival of the strongest, encoded into the soil itself. In the western Beastlands, even the grass hides things with teeth.',
      hook:'The journey begins close to home: first bonds, local routines, and reports of Zyrex behaving outside their usual patterns. A small investigation teaches you how people and creatures share a district.',
      question:'Can strength protect without becoming domination?',
      points:'140,100 310,70 390,160 350,335 240,405 130,330 100,205', pin:[240,260]},
    {name:'Zarvane', roman:'II', land:'Auralands', known:'The silver oasis', lord:'Ivirium', gem:'Pearl · Balance',
      description:'Energy flow and perception shape this silver oasis. The pearl keeps balance, and the south is orderly in a way that feels almost enforced.',
      hook:'Clues from Malezor reach the silver oasis, where repeated disturbances look too deliberate to dismiss. Here a Rizer begins to understand that some dangers must be faced beside a Zyrex, not from behind one.',
      question:'What can perfect balance be hiding?',
      points:'390,145 475,155 540,225 525,375 430,415 345,335', pin:[450,305]},
    {name:'Andrannor', roman:'III', land:'Creaturelands', known:'Everything adapts', lord:'Mutaryn', gem:'Citrine · Mutation',
      description:'Evolution without limit. Hybrid life. Every creature here is becoming something it is not yet.',
      hook:'Altered tracks and strange readings turn an investigation into a true expedition. Andrannor asks the player to study change closely enough to tell natural development from something being pushed too fast.',
      question:'When adaptation is forced, is it still evolution?',
      points:'545,195 685,220 720,350 690,445 595,475 525,375 520,270', pin:[625,370]},
    {name:'Veridan', roman:'IV', land:'Naturelands', known:'The living forest', lord:'Emeralix', gem:'Emerald · Growth',
      description:'A living forest of growth and interwoven ecosystems. The slowest, oldest dominance: the green wall that bends but does not break.',
      hook:'In Veridan, a disturbance cannot touch one creature without touching the forest around it. The player follows changes in the ecosystem itself, reading damage through roots, rivers, migration, and silence.',
      question:'What happens when growth loses its balance?',
      points:'725,230 840,250 1000,370 1000,490 875,550 735,610 660,535 700,430 730,350', pin:[840,475]},
    {name:'Netharion', roman:'V', land:'Unknownlands · Center', known:'The world hub', lord:'Eurakeon', gem:'Amethyst · Sanctuary',
      description:'The amethyst at the centre is a sanctuary. Reality anomalies and forbidden knowledge surround the world hub, where Zyraxis itself becomes unstable.',
      hook:'At the world hub, incidents from distant districts can finally be compared. Routes cross, records disagree, and coincidences begin to resemble a pattern with someone behind it.',
      question:'Which coincidence is actually a connection?',
      points:'250,485 450,485 515,565 495,650 350,755 215,715 180,605', pin:[340,635]},
    {name:'Vorashil', roman:'VI', land:'Allelands', known:'The sky roads', lord:'Azurel', gem:'Sapphire · Intellect',
      description:'Alien logic and non-humanoid intelligence. Along the sky roads, a world thinks in shapes not made for tongues.',
      hook:'The trail leaves familiar ground and enters the sky roads. Evidence must be understood across unfamiliar cultures and forms of intelligence, turning translation itself into part of the adventure.',
      question:'Can intellect understand what refuses familiar language?',
      points:'115,720 205,710 260,770 235,900 145,930 65,855 65,790', pin:[145,850]},
    {name:'Xilnar', roman:'VII', land:'Spiritlands', known:'The binding mountains', lord:'Obsidius', gem:'Onyx · Restraint',
      description:'Souls, death-energy and unseen forces gather in the binding mountains. Xilnar is a land of restraint, memory, and forces felt more easily than seen.',
      hook:'The clearest path forward is also the least visible. In Xilnar, memories, absences, and spiritual traces become evidence, and the player must decide what deserves pursuit and what needs protection.',
      question:'What is being held—and what happens if it slips free?',
      points:'260,780 350,755 400,825 385,965 260,1010 205,945 235,900', pin:[305,895]},
    {name:'Baelgor', roman:'VIII', land:'Humanoidlands', known:'The ember reach', lord:'Ambrevon', gem:'Amber · Perfection',
      description:'Civilization and structure define the ember reach. Amber speaks of perfected form, and of the dominance that sustains it.',
      hook:'After distant expeditions, Baelgor brings the journey back toward ordinary lives, family histories, and the structures people trust. What felt remote elsewhere becomes personal when it reaches familiar streets.',
      question:'What does progress cost the people asked to survive it?',
      points:'405,715 495,650 560,675 590,780 570,930 460,980 390,935 400,825 350,755', pin:[485,800]},
    {name:'Thardin', roman:'IX', land:'Mechlands', known:'The Mechlands', lord:'Oathane', gem:'Composite · IX',
      description:'Technology, precision and system control. This machine-district measures everything, building order from mechanisms, records, and exacting systems.',
      hook:'Thardin turns scattered clues into infrastructure: transit lines, measurements, machines, and networks reveal a scale that no single encounter could show. The system itself becomes the place to investigate.',
      question:'Can a system built for order recognize when it is being used?',
      points:'590,700 665,665 735,715 780,825 745,965 590,970 570,930 590,780', pin:[665,825]},
    {name:'Korathen', roman:'X', land:'Ultralands', known:'The far seat', lord:'Oatheus', gem:'Composite · X',
      description:'Absolute authority. Divine law. Final balance. Korathen is the far seat where power, responsibility, and the order of the ten districts meet.',
      hook:'Every district road eventually points toward Korathen. Earlier questions about instinct, balance, change, life, spirit, intellect, restraint, form, and order arrive here as questions of responsibility.',
      question:'Who should hold power when the whole world depends on the answer?',
      points:'755,650 870,625 950,680 1005,800 1010,925 905,990 745,965 780,825 735,715', pin:[875,870]}
  ];
  const dialog = document.getElementById('district-dialog');
  const regions = document.getElementById('atlas-regions');
  const key = document.getElementById('atlas-key');
  const svgNS = 'http://www.w3.org/2000/svg';
  let selected = 0;
  let opener = null;
  const triggers = [];
  function show(index) {
    selected = (index + districts.length) % districts.length;
    const d = districts[selected];
    const fields = {counter:`DISTRICT ${d.roman} / X`, title:d.name, land:d.land, known:d.known, gem:d.gem, description:d.description, hook:d.hook, question:d.question};
    Object.entries(fields).forEach(([id, text]) => { document.getElementById(`district-${id}`).textContent = text; });
    const lord = document.getElementById('district-lord');
    lord.textContent = d.lord;
    lord.dataset.gemlord = d.lord.toLowerCase();
    triggers.forEach(({element, index:i}) => element.setAttribute('aria-expanded', String(i === selected)));
    dialog.scrollTop = 0;
  }
  function open(index, trigger) {
    opener = trigger;
    show(index);
    document.body.classList.add('district-open');
    dialog.showModal();
    document.getElementById('district-close').focus({preventScroll:true});
  }
  function wire(element, index) {
    element.setAttribute('aria-haspopup', 'dialog');
    element.setAttribute('aria-controls', 'district-dialog');
    element.setAttribute('aria-expanded', 'false');
    element.addEventListener('click', () => open(index, element));
    triggers.push({element, index});
  }
  districts.forEach((d, index) => {
    const region = document.createElementNS(svgNS, 'g');
    region.classList.add('atlas-region');
    region.setAttribute('role', 'button');
    region.setAttribute('tabindex', '0');
    region.setAttribute('aria-label', `Explore ${d.name}, district ${d.roman}`);
    const shape = document.createElementNS(svgNS, 'polygon');
    shape.setAttribute('points', d.points);
    const pin = document.createElementNS(svgNS, 'circle');
    pin.setAttribute('cx', d.pin[0]); pin.setAttribute('cy', d.pin[1]); pin.setAttribute('r', '25');
    const label = document.createElementNS(svgNS, 'text');
    label.setAttribute('x', d.pin[0]); label.setAttribute('y', d.pin[1]); label.textContent = d.roman;
    region.append(shape, pin, label);
    wire(region, index);
    region.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(index, region); }
    });
    regions.append(region);
    const button = document.createElement('button');
    button.type = 'button';
    const number = document.createElement('span'); number.textContent = d.roman;
    button.append(number, document.createTextNode(d.name));
    wire(button, index);
    key.append(button);
  });
  document.getElementById('district-close').addEventListener('click', () => dialog.close());
  document.getElementById('district-prev').addEventListener('click', () => show(selected - 1));
  document.getElementById('district-next').addEventListener('click', () => show(selected + 1));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); show(selected + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('district-open');
    triggers.forEach(({element}) => element.setAttribute('aria-expanded', 'false'));
    if (opener) opener.focus({preventScroll:true});
  });
})();
