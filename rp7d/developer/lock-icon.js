// RP7D · lock-on focus icon. The RHUD's round portrait is the focus area: the blue astral diamond when nothing is locked,
// and a themed pulsing icon for whatever Rizer is locked onto. One entry per kind of target: a colour and a glyph (viewBox 100×112).
// iconKey() turns a lock ({kind, ref, icon?}) into a key; apply() swaps the portrait's SVG and tints it (--lock-c).
const S = (c, body) => `<svg class="rizer-gem lock-ico" viewBox="0 0 100 112" role="img" aria-hidden="true" style="--lock-c:${c}">${body}</svg>`;
const f = 'class="li-f"', k = 'class="li-k"', d = 'class="li-d"';
const ICONS = {
  seer: ['#ff5a6e', `<path ${f} d="M4 56Q50 8 96 56Q50 104 4 56Z"/><circle ${d} cx="50" cy="56" r="21"/><circle ${f} cx="50" cy="56" r="9"/><path ${k} d="M4 56Q50 8 96 56Q50 104 4 56Z"/>`],
  mori: ['#ff5a6e', `<path ${f} d="M14 12 34 38H66L86 12 92 50Q92 92 50 104 8 92 8 50Z"/><path ${d} d="M26 56 44 62 40 74ZM74 56 56 62 60 74Z"/><path ${k} d="M38 90 44 82 50 90 56 82 62 90"/>`],
  crept: ['#6fe08a', `<path ${f} d="M50 104V44"/><path ${f} d="M50 44C50 14 82 8 94 12 94 40 72 52 50 44ZM50 70C50 46 22 44 8 50 10 74 30 82 50 70Z"/><path ${k} d="M50 104V30M50 66 28 56M50 42 78 24"/>`],
  skellor: ['#e6e9ef', `<path ${f} d="M50 6C22 6 10 28 14 52 16 62 24 66 28 70V92H72V70C76 66 84 62 86 52 90 28 78 6 50 6Z"/><circle ${d} cx="34" cy="50" r="11"/><circle ${d} cx="66" cy="50" r="11"/><path ${d} d="M50 62 44 76H56Z"/><path ${k} d="M38 92V80M50 92V82M62 92V80"/>`],
  scanobot: ['#ff8a4a', `<circle ${f} cx="50" cy="62" r="30"/><circle ${d} cx="50" cy="62" r="14"/><circle ${f} cx="50" cy="62" r="6"/><path ${k} d="M30 38 22 14M70 38 78 14M20 62H4M80 62H96"/><circle ${f} cx="22" cy="12" r="5"/><circle ${f} cx="78" cy="12" r="5"/>`],
  penumbra: ['#ff8a4a', `<path ${f} d="M50 6 92 30V82L50 106 8 82V30Z"/><path ${d} d="M50 26 74 40V72L50 86 26 72V40Z"/><circle ${f} cx="50" cy="56" r="10"/><path ${k} d="M50 6V26M92 30 74 40M8 30 26 40"/>`],
  nova: ['#ff8a4a', `<path ${f} d="M50 6 92 20V58Q92 90 50 106 8 90 8 58V20Z"/><path ${d} d="M50 22 78 32V58Q78 80 50 92 22 80 22 58V32Z"/><path ${f} d="M50 36 55 50H70L58 59 63 74 50 65 37 74 42 59 30 50H45Z"/>`],
  chest: ['#e9c982', `<path ${f} d="M10 52Q10 20 50 20T90 52Z"/><rect ${f} x="10" y="52" width="80" height="44" rx="4"/><path ${d} d="M10 52H90"/><rect ${d} x="42" y="46" width="16" height="22" rx="3"/><path ${k} d="M10 52Q10 20 50 20T90 52V96H10Z"/>`],
  coinchest: ['#ffd85a', `<circle ${f} cx="50" cy="56" r="42"/><circle ${d} cx="50" cy="56" r="31"/><path ${f} d="M50 30V82M38 42H60Q66 42 66 49T58 56H42Q34 56 34 63T42 70H64"/><circle ${k} cx="50" cy="56" r="42"/>`],
  zyrex: ['#c58cff', `<ellipse ${f} cx="50" cy="76" rx="22" ry="20"/><ellipse ${f} cx="16" cy="48" rx="10" ry="14" transform="rotate(-20 16 48)"/><ellipse ${f} cx="38" cy="24" rx="10" ry="14"/><ellipse ${f} cx="62" cy="24" rx="10" ry="14"/><ellipse ${f} cx="84" cy="48" rx="10" ry="14" transform="rotate(20 84 48)"/>`],
  friendly: ['#7ce8bd', `<circle ${f} cx="50" cy="32" r="22"/><path ${f} d="M8 106Q8 62 50 62T92 106Z"/><path ${k} d="M50 62V80"/>`],
  stone: ['#a9b4c4', `<path ${f} d="M6 92 20 46 46 14 78 24 94 62 82 98Z"/><path ${d} d="M20 46 46 14 52 56ZM52 56 78 24 94 62ZM52 56 82 98 6 92 20 46Z" opacity=".35"/><path ${k} d="M20 46 52 56 94 62M52 56 82 98"/>`],
  astralite: ['#76ccff', `<path ${f} d="M6 96 18 56 42 40 62 52 90 40 94 96Z" opacity=".7"/><path ${f} d="M50 4 72 30 50 82 28 30Z"/><path ${d} d="M50 4 72 30 50 38 28 30Z" opacity=".45"/><path ${k} d="M28 30H72M50 38V82"/>`],
  tree: ['#6fe08a', `<rect ${f} x="44" y="66" width="12" height="42" rx="2"/><circle ${f} cx="50" cy="36" r="30"/><circle ${f} cx="26" cy="52" r="20"/><circle ${f} cx="74" cy="52" r="20"/><path ${k} d="M50 90V62M50 74 36 60M50 70 64 56"/>`],
  bush: ['#6fe08a', `<circle ${f} cx="30" cy="68" r="24"/><circle ${f} cx="70" cy="68" r="24"/><circle ${f} cx="50" cy="48" r="28"/><path ${k} d="M20 100H80"/>`],
  fruit: ['#ff7a5a', `<path ${f} d="M50 34C32 20 8 34 12 64 16 94 38 106 50 98 62 106 84 94 88 64 92 34 68 20 50 34Z"/><path ${d} d="M50 34C50 24 54 14 62 8" style="fill:none;stroke-width:6"/><path ${f} d="M54 22C62 8 80 8 88 14 80 28 62 30 54 22Z" style="fill:#6fe08a"/>`]
};
// A lock target → icon key. Targets may carry their own `icon`; enemies use their type key (seer, mori, crept, skellor).
export function iconKey(lock) {
  if (!lock) return 'gem';
  const key = lock.icon || (lock.kind === 'enemy' ? lock.ref?.T?.key : lock.kind === 'stone' && lock.ref?.isAstraliteStone ? 'astralite' : lock.kind);
  return ICONS[key] ? key : lock.kind === 'enemy' ? 'seer' : lock.kind === 'scanobot' ? 'scanobot' : 'gem';
}
let shown = 'gem', home = null;
export function applyLockIcon(portrait, lock) {
  if (!portrait) return;
  const key = iconKey(lock);
  if (key === shown) return;
  const gem = portrait.querySelector('.rizer-gem:not(.lock-ico)'), cur = portrait.querySelector('.lock-ico');
  if (!home && gem) home = gem;
  cur?.remove(); shown = key;
  if (key === 'gem') { if (home) home.style.display = ''; portrait.style.removeProperty('--lock-c'); portrait.classList.remove('locked'); return; }
  const [c, body] = ICONS[key];
  if (home) home.style.display = 'none';
  portrait.insertAdjacentHTML('afterbegin', S(c, body)); portrait.style.setProperty('--lock-c', c); portrait.classList.add('locked');
  portrait.dataset.lock = key;
}
