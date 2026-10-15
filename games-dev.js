/* ★ 2026-10-15 · DEV DOOR · Creator: "allow a cmd click on RP7D to prompt the password to unlock RP7D".
   Cmd-click (Ctrl-click on Windows) the sealed RP7D card on The Games → password box.
   The right password unlocks RP7D on this browser and opens /play-rp7d/.
   It checks the SAME SHA-256 hash and sets the SAME localStorage key as RP7D's own gate
   (play-rp7d/index.html), so once you are through here, RP7D does not ask again.
   A plain click still knocks on the seal (site-game.js). */
(() => {
  const HASH = '45e251c0fdfbad2379e4fbcb8c76341c08188d38c37a0a1312d5f76f8705bb47';
  const KEY = 'rp7d.dev.pass';
  const DEST = '/play-rp7d/';
  const sha = async t => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)))]
    .map(b => b.toString(16).padStart(2, '0')).join('');
  const known = () => { try { return localStorage.getItem(KEY) === HASH; } catch (e) { return false; } };

  let dlg = null;
  function build(){
    dlg = document.createElement('dialog');
    dlg.className = 'devdoor';
    dlg.setAttribute('aria-labelledby', 'devdoor-t');
    dlg.innerHTML = `
      <form method="dialog" class="devdoor-in">
        <p class="devdoor-k">DEV ACCESS · RIZING POWER</p>
        <h2 id="devdoor-t" class="devdoor-t">UNLOCK RP7D</h2>
        <label class="devdoor-l"><span>PASSWORD</span><input type="password" autocomplete="current-password" required></label>
        <p class="devdoor-err" hidden>That is not the password.</p>
        <div class="devdoor-btns">
          <button type="button" class="btn ghost devdoor-x">CANCEL</button>
          <button type="submit" class="btn devdoor-go">▶ UNLOCK</button>
        </div>
      </form>`;
    document.body.appendChild(dlg);
    const input = dlg.querySelector('input'), err = dlg.querySelector('.devdoor-err');
    dlg.querySelector('.devdoor-x').addEventListener('click', () => dlg.close());
    dlg.querySelector('form').addEventListener('submit', async e => {
      e.preventDefault();
      let ok = false;
      try { ok = await sha(input.value.trim()) === HASH; } catch (_) {}
      if (!ok) {
        err.hidden = false; input.select();
        dlg.classList.remove('shake'); void dlg.offsetWidth; dlg.classList.add('shake');
        return;
      }
      try { localStorage.setItem(KEY, HASH); } catch (_) {}
      dlg.querySelector('.devdoor-go').textContent = 'UNLOCKED · OPENING…';
      location.href = DEST;
    });
    dlg.addEventListener('close', () => { input.value = ''; err.hidden = true; });
  }
  function open(){
    if (known()) { location.href = DEST; return; }
    if (!dlg) build();
    dlg.showModal();
    dlg.querySelector('input').focus();
  }

  // capture on window runs before the seal's knock handler on document
  window.addEventListener('click', e => {
    if (!(e.metaKey || e.ctrlKey)) return;
    const card = e.target.closest && e.target.closest('[data-unlock-id="game-rp7d"]');
    if (!card) return;
    e.preventDefault(); e.stopImmediatePropagation();
    open();
  }, true);
  window.addEventListener('keydown', e => {
    if (!(e.metaKey || e.ctrlKey) || e.key !== 'Enter') return;
    const card = e.target.closest && e.target.closest('[data-unlock-id="game-rp7d"]');
    if (!card) return;
    e.preventDefault(); e.stopImmediatePropagation();
    open();
  }, true);
})();
