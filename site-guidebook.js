// ★ 2026-10-06 · Site-wide Macro Book behaviour: rail scroll-spy, menu drawer, starfield parallax.
// Lifted from macrobook.html so the portal pages behave like the book.
(function(){
  var links = Array.prototype.slice.call(document.querySelectorAll('#nav a'));
  var map = {};
  links.forEach(function(a){
    var id = a.getAttribute('href').slice(1);
    var el = document.getElementById(id);
    if (el) map[id] = a;
  });
  var sections = Object.keys(map).map(function(id){ return document.getElementById(id); });
  if (!sections.length || !('IntersectionObserver' in window)) {
    if (links[0]) links[0].classList.add('on');
    return;
  }
  links[0].classList.add('on');
  var visible = {};
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ visible[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; });
    var best = null, bestVal = 0;
    Object.keys(visible).forEach(function(id){
      if (visible[id] > bestVal) { bestVal = visible[id]; best = id; }
    });
    if (best) {
      links.forEach(function(a){ a.classList.remove('on'); });
      map[best].classList.add('on');
    }
  }, { rootMargin: '-15% 0px -70% 0px', threshold: [0, 0.02, 0.2, 0.5, 1] });
  sections.forEach(function(s){ io.observe(s); });
})();
  (function(){
    const t=document.querySelector('.menu-toggle'),
          d=document.querySelector('.menu-drawer'),
          b=document.querySelector('.menu-backdrop');
    function open(){ t.classList.add('open'); d.classList.add('open'); b.classList.add('open');
      document.body.classList.add('menu-open'); t.setAttribute('aria-expanded','true');
      t.setAttribute('aria-label','Close menu'); d.setAttribute('aria-hidden','false'); }
    function close(){ t.classList.remove('open'); d.classList.remove('open'); b.classList.remove('open');
      document.body.classList.remove('menu-open'); t.setAttribute('aria-expanded','false');
      t.setAttribute('aria-label','Open menu'); d.setAttribute('aria-hidden','true'); }
    t.addEventListener('click',()=> t.classList.contains('open') ? close() : open());
    b.addEventListener('click', close);
    document.addEventListener('keydown', e => { if(e.key==='Escape' && t.classList.contains('open')) close(); });
  })();
// Match the home page's passive, frame-scheduled 0.08 scroll parallax.
// Repeating transforms keep the stars covering even the bottom of this long book.
(function(){
  const field = document.querySelector('.starfield');
  const layers = field.querySelectorAll('.star-parallax');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const periods = [600, 900];
  let frame = null;
  let currentY = Math.max(0, window.scrollY);
  let targetY = currentY;
  let lastTime = null;
  let travel = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  function paint(time){
    frame = null;
    const elapsed = lastTime === null ? 16.67 : Math.min(64, time - lastTime);
    lastTime = time;
    // Time-based easing keeps touch/wheel and anchor jumps smooth at any refresh rate.
    currentY = motion.matches ? targetY : currentY + (targetY - currentY) * (1 - Math.exp(-elapsed / 90));
    if (Math.abs(targetY - currentY) < 0.1) currentY = targetY;
    const depth = Math.pow(Math.min(1, currentY / travel), 0.65);
    field.style.setProperty('--cosmic-depth', (depth * 0.65).toFixed(3));
    layers.forEach((layer, i) => {
      layer.style.transform = motion.matches ? 'none' : `translate3d(0, ${-(currentY * 0.08 % periods[i])}px, 0)`;
    });
    if (currentY !== targetY) frame = requestAnimationFrame(paint);
    else lastTime = null;
  }
  function onScroll(){
    targetY = Math.max(0, window.scrollY);
    if (frame === null) frame = requestAnimationFrame(paint);
  }
  function onResize(){
    travel = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    onScroll();
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onResize, {passive:true});
  window.addEventListener('load', onResize, {once:true});
  motion.addEventListener('change', onScroll);
  if (document.fonts) document.fonts.ready.then(onResize);
  onScroll();
})();
