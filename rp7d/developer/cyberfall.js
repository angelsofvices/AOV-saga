// Offline, authored social/code community. Draft community posts are explicitly
// illustrative; verified progress comes only from actual inventory/research.
import { inventory, saveInv } from './loot.js';
import { engineering, chipByUid, carriedChips, insertChip, ejectChip, newLabSession, beginChallenge, challengeInput, submitChallenge } from './engineering.js';
import { AX36_INPUTS, AX36_RECIPE, hasStudied } from './engineering-research.js';

export const CYBERFALL_USERS = [
  { id: 'loopseed', role: 'Youth · coding learner' }, { id: 'patchworks', role: 'Adult · open-source maintainer' }, { id: 'quietvector', role: 'Adult · community moderator' }
];
const CONTENT = [
  { id: 'welcome', area: 'social', user: 'quietvector', title: 'Small projects belong here too', body: 'CyberFall is a place to share code, ask questions and work together. You do not have to be a hacker to contribute.', replies: ['loopseed: My first project is still just a notebook.', 'patchworks: Notes are a useful first commit.'], when: () => true },
  { id: 'chip-safety', area: 'social', user: 'patchworks', title: 'Keep an unmodified chip when experimenting', body: 'Read the submission warning before testing a firewall. Keep a record of which physical chip is on your desk.', replies: ['quietvector: A closed window should never count as a failed submission.'], when: () => engineering().chips.length > 0 },
  { id: 'study-note', area: 'social', user: 'loopseed', title: 'Owning a sample and understanding it are different', body: 'I am keeping study notes separate from my material list. Using the last sample should not erase what I learned.', replies: ['patchworks: Keep the research record alongside the project.'], when: () => AX36_INPUTS.some(hasStudied) },
  { id: 'district-notes', area: 'social', user: 'quietvector', title: 'Keep field discussions tied to observations', body: 'Keep a separate notebook for each district. A trending community claim is not a verified discovery. This is an illustrative discussion template, not a report about hidden world events.', replies: [], when: () => (engineering().social.districts?.length || 0) > 1 },
  { id: 'starter-repo', area: 'code', user: 'patchworks', title: 'Community starter notebooks', body: 'An offline, readable project about documenting experiments and their inputs. This repository contains authored notes, not executable downloads.', replies: [], when: () => true },
  { id: 'ax36-repo', area: 'code', user: 'quietvector', title: 'AX-36 installation notebook', body: 'For Rizer’s verified AX-36 recipe: decode a physical chip, then validate the installation circuit. A successful program uses one physical compound. A failed submission destroys the committed chip.', replies: ['patchworks: Permanent installations should identify the exact weapon and free slot.'], when: () => inventory.recipes?.includes(AX36_RECIPE) }
];
export function cyberfallContent(area) { return CONTENT.filter(p => p.area === area && p.when()); }
let nextNotice = 0;
export function cyberfallTick({ district = null, quiet = false, notify = () => {} } = {}) {
  const s = engineering().social, unlocked = CONTENT.filter(p => p.when()).map(p => p.id);
  const fresh = unlocked.filter(id => !s.unlocked.includes(id));
  if (district && !(s.districts ||= []).includes(district)) { s.districts.push(district); if (!saveInv()) s.districts.pop(); }
  if (fresh.length) { const before = s.unlocked; s.unlocked = [...s.unlocked, ...fresh]; if (!saveInv()) s.unlocked = before; }
  if (!quiet || Date.now()<nextNotice) return;
  const id = s.unlocked.find(id => !s.notified.includes(id) && !s.read.includes(id)); if (!id) return;
  s.notified.push(id);
  if (saveInv()) {nextNotice=Date.now()+12000;notify('CYBERFALL · new community notes · read on your home computer');} else s.notified.pop();
}
export function createCyberFallPanel({ root, back, toast = () => {} }) {
  let area = 'social', selected = null, focus = 0, notice = '';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  function mark(field, id) {
    const s = engineering().social, old = [...s[field]];
    if (field === 'bookmarks' && s[field].includes(id)) s[field] = s[field].filter(x => x !== id); else if (!s[field].includes(id)) s[field].push(id);
    if (!saveInv()) { s[field] = old; notice = 'Could not save this change'; }
  }
  const button = (label, action, extra = '') => `<button class="st-btn cf-button" data-cf="${action}" ${extra}>${label}</button>`;
  function labHTML() {
    const lab = engineering().lab, chip = chipByUid(lab.chipUid), q = lab.challenge;
    let body = `<p>Failed submissions ${lab.failures}/3. Every wrong submission permanently destroys the inserted chip. The third fries this session. AX-36 is consumed only when programming succeeds. Closing this screen preserves your inserted chip and puzzle.</p>`;
    if (lab.fried || lab.complete) return body + `<b>${lab.fried ? 'SESSION CIRCUIT-FRIED' : 'PROGRAMMING COMPLETE'}</b>${button('NEW SESSION', 'new')}`;
    if (!chip) return body + `<h3>Insert a physical chip</h3>${carriedChips().map(c => button(`${esc(c.uid)} · ${esc(c.state)} · INSERT`, 'insert', `data-uid="${c.uid}"`)).join('') || '<p>Find standard Portal Chips by defeating tech enemies. No chips are supplied by this computer.</p>'}`;
    body += `<h3>${esc(chip.uid)} · ${esc(chip.state.toUpperCase())}</h3>`;
    if (!q) return body + button(chip.state === 'decoded' ? 'REPROGRAM CHIP · requires carried AX-36' : 'DECODE / UNSCRAMBLE', chip.state === 'decoded' ? 'program' : 'decode') + button('EJECT SAFELY', 'eject');
    if (q.phase === 'decode') body += `<p>Reference: ${q.target.map(esc).join(' → ')}. Select two fragments to swap them.</p><div class="cf-fragments">${q.input.map((v, i) => button(esc(v), 'cell', `data-index="${i}" aria-pressed="${q.selected === i}"`)).join('')}</div>`;
    else body += `<p>Trace an adjacent route from IN to OUT. Blocked cells cannot carry the signal. Select IN to restart the route.</p><div class="cf-circuit">${Array.from({length:9}, (_, i) => button(q.blocked.includes(i) ? '×' : i === 0 ? 'IN' : i === 8 ? 'OUT' : String(i + 1), 'cell', `data-index="${i}" ${q.blocked.includes(i) ? 'disabled' : ''} aria-pressed="${q.path.includes(i)}"`)).join('')}</div>`;
    return body + button('SUBMIT · WRONG ANSWER DESTROYS THIS CHIP', 'submit') + button('EJECT WITHOUT SUBMITTING', 'eject');
  }
  function render() {
    const s = engineering().social, posts = cyberfallContent(area), post = posts.find(p => p.id === selected);
    root.innerHTML = `<section class="st-panel cf-panel"><div class="st-head"><small>RIZER’S COMPUTER · OFFLINE COMMUNITY CACHE</small><b>CYBERFALL</b><span>Open-source coding culture · projects, discussions and shared notes · youth and adults</span></div>
      <nav class="nb-tabs">${['social','code','lab'].map(a => button(a.toUpperCase(), 'area', `data-area="${a}" aria-pressed="${a === area}"`)).join('')}${button('BACK TO COMPUTER', 'back')}</nav>
      <p class="cf-notice" role="status">${esc(notice)}</p><div class="cf-body">${area === 'lab' ? labHTML() : `<small>ILLUSTRATIVE COMMUNITY CONTENT · not a canonical report or Codex discovery</small><div class="cf-feed">${posts.map(p => button(`${esc(p.title)} <small>@${esc(p.user)} · ${s.read.includes(p.id) ? 'READ' : 'UNREAD'}${s.bookmarks.includes(p.id) ? ' · BOOKMARKED' : ''}</small>`, 'post', `data-id="${p.id}"`)).join('')}</div>${post ? `<article class="cf-post"><h3>${esc(post.title)}</h3><small>@${esc(post.user)} · ${esc(CYBERFALL_USERS.find(u => u.id === post.user)?.role || '')}</small><p>${esc(post.body)}</p>${post.replies.map(r => `<p>${esc(r)}</p>`).join('')}${button(s.bookmarks.includes(post.id) ? 'REMOVE BOOKMARK' : 'BOOKMARK', 'bookmark', `data-id="${post.id}"`)}</article>` : '<p>Choose a discussion or repository to read it.</p>'}`}</div>
      <footer class="st-foot">D-pad / arrows choose · ✕ / Enter select · ○ / Esc back · no remote code executes</footer></section>`;
    if(area==='code'&&post)root.querySelector('.cf-post')?.insertAdjacentHTML('beforeend',button(s.downloads.includes(post.id)?'PROJECT CACHED':'CACHE PROJECT NOTES','download',`data-id="${post.id}" ${s.downloads.includes(post.id)?'disabled':''}`));
    const buttons = [...root.querySelectorAll('[data-cf]:not(:disabled)')]; focus = Math.min(focus, buttons.length - 1); buttons[focus]?.classList.add('focus');
  }
  function click(target) {
    const b = target.closest('[data-cf]'); if (!b || b.disabled) return;
    let result;
    if (b.dataset.cf === 'back') return back();
    if (b.dataset.cf === 'area') { area = b.dataset.area; focus = 0; selected = null; }
    else if (b.dataset.cf === 'post') { selected = b.dataset.id; mark('read', selected); }
    else if (b.dataset.cf === 'bookmark') mark('bookmarks', b.dataset.id);
    else if (b.dataset.cf === 'download') { mark('downloads',b.dataset.id);notice='Project cached on this computer · authored notes only · no remote code executes'; }
    else if (b.dataset.cf === 'insert') result = insertChip(b.dataset.uid);
    else if (b.dataset.cf === 'eject') result = ejectChip();
    else if (b.dataset.cf === 'new') result = newLabSession();
    else if (b.dataset.cf === 'decode' || b.dataset.cf === 'program') result = beginChallenge(b.dataset.cf);
    else if (b.dataset.cf === 'cell') result = challengeInput(+b.dataset.index);
    else if (b.dataset.cf === 'submit') result = submitChallenge();
    if (result?.message) { notice = result.message; toast(notice); }
    render();
  }
  function key(code) {
    if (code === 'Escape' || code === 'Backspace') return back();
    const buttons = [...root.querySelectorAll('[data-cf]:not(:disabled)')];
    if (['ArrowDown','ArrowRight','KeyS','KeyD'].includes(code)) focus = (focus + 1) % buttons.length;
    else if (['ArrowUp','ArrowLeft','KeyW','KeyA'].includes(code)) focus = (focus - 1 + buttons.length) % buttons.length;
    else if (code === 'Enter' || code === 'Space') return click(buttons[focus]);
    buttons.forEach((b, i) => b.classList.toggle('focus', i === focus)); buttons[focus]?.scrollIntoView({ block:'nearest' });
  }
  return { render, click, key, pad(p) { if (p.edge(1)) return back(); if (p.edge(12)) key('ArrowUp'); if (p.edge(13)) key('ArrowDown'); if (p.edge(14)) key('ArrowLeft'); if (p.edge(15)) key('ArrowRight'); if (p.edge(0)) key('Enter'); } };
}
