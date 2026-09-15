/* Illustrated atlas: regions follow zyraxis-worldmap.png. Names, gems and
   previews follow the Macrobook and the existing zyraxis.html district guide. */
(() => {
  const districts = [
    {name:'Malezor', roman:'I', land:'Beastlands', known:'The Beastlands', lord:'Rakoron', gem:'Ruby · Instinct',
      description:'Primal. Predatory. Survival of the strongest, encoded into the soil itself. In the western Beastlands, even the grass hides things with teeth.',
      points:'140,100 310,70 390,160 350,335 240,405 130,330 100,205', pin:[240,260], view:'95 65 350 330'},
    {name:'Zarvane', roman:'II', land:'Auralands', known:'The silver oasis', lord:'Ivirium', gem:'Pearl · Balance',
      description:'Energy flow and perception shape this silver oasis. The pearl keeps balance, and the south is orderly in a way that feels almost enforced.',
      points:'390,145 475,155 540,225 525,375 430,415 345,335', pin:[450,305], view:'315 135 300 300'},
    {name:'Andrannor', roman:'III', land:'Creaturelands', known:'Everything adapts', lord:'Mutaryn', gem:'Citrine · Mutation',
      description:'Evolution without limit. Hybrid life. Every creature here is becoming something it is not yet.',
      points:'545,195 685,220 720,350 690,445 595,475 525,375 520,270', pin:[625,370], view:'485 190 290 310'},
    {name:'Veridan', roman:'IV', land:'Naturelands', known:'The living forest', lord:'Emeralix', gem:'Emerald · Growth',
      description:'A living forest of growth and interwoven ecosystems. The slowest, oldest dominance: the green wall that bends but does not break.',
      points:'725,230 840,250 1000,370 1000,490 875,550 735,610 660,535 700,430 730,350', pin:[840,475], view:'685 245 370 320'},
    {name:'Netharion', roman:'V', land:'Unknownlands · Center', known:'The world hub', lord:'Eurakeon', gem:'Amethyst · Sanctuary',
      description:'The amethyst at the centre is a sanctuary. Reality anomalies and forbidden knowledge surround the world hub, where Zyraxis itself becomes unstable.',
      points:'250,485 450,485 515,565 495,650 350,755 215,715 180,605', pin:[340,635], view:'165 460 375 300'},
    {name:'Vorashil', roman:'VI', land:'Allelands', known:'The sky roads', lord:'Azurel', gem:'Sapphire · Intellect',
      description:'Alien logic and non-humanoid intelligence. Along the sky roads, a world thinks in shapes not made for tongues.',
      points:'115,720 205,710 260,770 235,900 145,930 65,855 65,790', pin:[145,850], view:'45 700 285 260'},
    {name:'Xilnar', roman:'VII', land:'Spiritlands', known:'The binding mountains', lord:'Obsidius', gem:'Onyx · Restraint',
      description:'Souls, death-energy and unseen forces gather in the binding mountains. The onyx once held the whole world together by binding the other gems.',
      points:'260,780 350,755 400,825 385,965 260,1010 205,945 235,900', pin:[305,895], view:'185 745 290 265'},
    {name:'Baelgor', roman:'VIII', land:'Humanoidlands', known:'The ember reach', lord:'Ambrevon', gem:'Amber · Perfection',
      description:'Civilization and structure define the ember reach. Amber speaks of perfected form, and of the dominance that sustains it.',
      points:'405,715 495,650 560,675 590,780 570,930 460,980 390,935 400,825 350,755', pin:[485,800], view:'345 650 300 325'},
    {name:'Thardin', roman:'IX', land:'Mechlands', known:'The Mechlands', lord:'Oathane', gem:'Composite · IX',
      description:'Technology, precision and system control. This machine-district measures everything; its land grew without its god, and grew strange because of it.',
      points:'590,700 665,665 735,715 780,825 745,965 590,970 570,930 590,780', pin:[665,825], view:'555 665 280 310'},
    {name:'Korathen', roman:'X', land:'Ultralands', known:'The far seat', lord:'Oatheus', gem:'Composite · X',
      description:'Absolute authority. Divine law. Final balance. At the far seat stands the throne that nothing has filled since the day it emptied.',
      points:'755,650 870,625 950,680 1005,800 1010,925 905,990 745,965 780,825 735,715', pin:[875,870], view:'720 650 335 340'}
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
    const fields = {counter:`DISTRICT ${d.roman} / X`, title:d.name, land:d.land, known:d.known, lord:d.lord, gem:d.gem, description:d.description};
    Object.entries(fields).forEach(([id, text]) => { document.getElementById(`district-${id}`).textContent = text; });
    const preview = document.getElementById('district-preview');
    preview.setAttribute('viewBox', d.view);
    preview.setAttribute('aria-label', `${d.name} — illustrated district preview`);
    preview.setAttribute('preserveAspectRatio', 'xMidYMid slice');
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
