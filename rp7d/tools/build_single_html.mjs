// Build RP7D into an HTML file that opens straight from disk in Chrome
// (double-click, no server): code bundled with Three.js, CSS inlined, and every model and
// animation the game loads embedded as base64. Music stays in a companion assets/audio
// folder by default, avoiding a large base64 copy in the HTML. Keep that folder beside it.
//
//   npm i esbuild three@0.185.1      (once: in this folder, or anywhere and point NODE_PATH at its node_modules)
//   node tools/build_single_html.mjs  → dist/RP7D_Malezor_Playtest.html
//   node tools/build_single_html.mjs --embed-audio → completely self-contained, larger HTML
//   node tools/build_single_html.mjs --web → ../play-rp7d/, the website copy behind the dev password:
//     the same page split into files under 20 MB (Cloudflare serves nothing over 25 MiB), with the
//     intro movie and soundtrack re-encoded to fit (needs ffmpeg, only when they change)
//
// Layout: the code (game.js, index.html, every module) may sit in developer/ and the stylesheet in
// documents/, with assets/ and node_modules/ at the project root; a flat folder (everything at the root)
// works too. Imports of ./assets/... from the code folder resolve to the root's assets/.
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const codeDir = fs.existsSync(path.join(root, 'developer', 'game.js')) ? path.join(root, 'developer') : root;
const cssFile = [path.join(root, 'documents', 'style.css'), path.join(codeDir, 'style.css'), path.join(root, 'style.css')].find(f => fs.existsSync(f));
const out = path.join(root, 'dist', 'RP7D_Malezor_Playtest.html');
const audioRelative = 'assets/audio/fantasy-magical-draft.mp3';
const audioFile = path.join(root, audioRelative);
const embedAudio = process.argv.includes('--embed-audio');
// Fail before building if the soundtrack is missing, instead of shipping a silent game.
const audioSize = fs.statSync(audioFile).size;
const audioSource = embedAudio
  ? `data:audio/mpeg;base64,${fs.readFileSync(audioFile).toString('base64')}`
  : `./${audioRelative}`;
// esbuild + three may live next to the project or anywhere on NODE_PATH
const searchPaths = [root, path.join(root, 'node_modules'), ...(process.env.NODE_PATH ? process.env.NODE_PATH.split(path.delimiter) : [])];
const { build } = await import(pathToFileURL(createRequire(import.meta.url).resolve('esbuild', { paths: searchPaths })).href);

// 1 · code: bundle game.js (and Three.js) into a single ES module
const js = (await build({
  entryPoints: [path.join(codeDir, 'game.js')], bundle: true, format: 'esm', write: false, minify: true,
  target: 'es2020', legalComments: 'none', logLevel: 'error',
  plugins: [{ name: 'root-assets', setup(b) { // ./assets/... imported from the code folder lives at the project root
    b.onResolve({ filter: /^\.\/assets\// }, a => { const local = path.join(a.resolveDir, a.path); return { path: fs.existsSync(local) ? local : path.join(root, a.path) }; });
  } }],
  nodePaths: [path.join(root, 'node_modules'), ...(process.env.NODE_PATH ? process.env.NODE_PATH.split(path.delimiter) : [])]
})).outputFiles[0].text;

// 2 · assets: the three character models + every clip listed in the animation library
const library = (await import(pathToFileURL(path.join(root, 'assets/anims/library.js')).href)).default;
const assets = ['./assets/rizer/rizer.glb', './assets/rizer/rizer_psychosyd.glb', './assets/seer/seer.glb', './assets/mori/mori.glb', './assets/elzoran/elzoran.glb', './assets/npc/npc_base.glb', './assets/npc/npc_heads.glb',
  './assets/anciuxor/anciuxor.png', './assets/anciuxor/anciuxor-fly.png', './assets/items/zysphere-drop.png',
  ...library.map(it => './assets/anims/' + it.file),
  ...fs.readdirSync(path.join(root, 'assets/zyrex2d')).filter(f => f.endsWith('.webp')).map(f => './assets/zyrex2d/' + f), // 2DHD Zyrex sheets (zyrex2d.js)
  ...fs.readdirSync(path.join(root, 'assets/hair')).filter(f => f.endsWith('.glb')).map(f => './assets/hair/' + f), // hairstyles (build-library.js)
  ...fs.readdirSync(path.join(root, 'assets/audio/sfx')).filter(f => f.endsWith('.mp3')).map(f => './assets/audio/sfx/' + f)]; // sound effects ride inline (sfx.js)
const b64 = rel => { // gzip then base64 ("gz:" prefix); the page inflates with DecompressionStream
  const file = path.join(root, rel);
  let bin;
  if (fs.existsSync(file)) bin = fs.readFileSync(file);
  else { const mod = fs.readFileSync(file + '.js', 'utf8'); bin = Buffer.from(mod.slice(mod.indexOf('"') + 1, mod.lastIndexOf('"')), 'base64'); } // .glb.js / .fbx.js fallback
  return 'gz:' + zlib.gzipSync(bin, { level: 9 }).toString('base64');
};
const packed = assets.map(a => `<script>(window.__RP7D_ASSETS||(window.__RP7D_ASSETS={}))[${JSON.stringify(a)}]="${b64(a)}";</script>`).join('\n');

// 3 · page: index.html's body, the stylesheet inline, assets, then the bundle
const html = fs.readFileSync(path.join(codeDir, 'index.html'), 'utf8');
const body = html.slice(html.indexOf('<main'), html.indexOf('</main>') + 7)
  .replace('./assets/ui/rizer-hud.png', `data:image/png;base64,${fs.readFileSync(path.join(root, 'assets/ui/rizer-hud.png')).toString('base64')}`)
  .replace('./assets/ui/title.jpg', `data:image/jpeg;base64,${fs.readFileSync(path.join(root, 'assets/ui/title.jpg')).toString('base64')}`); // title screen art
const css = fs.readFileSync(cssFile, 'utf8');
const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>RP7D · Malezor Playtest</title>
<style>${css}</style></head>
<body>
${body}
${packed}
<script>window.__RP7D_SOUNDTRACK_SRC=${JSON.stringify(audioSource)};</script>
<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>
</body></html>`;
if (process.argv.includes('--web')) await buildWeb();
else {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  if (!embedAudio) {
    const audioOut = path.join(path.dirname(out), audioRelative);
    fs.mkdirSync(path.dirname(audioOut), { recursive: true });
    fs.copyFileSync(audioFile, audioOut);
  }
  fs.writeFileSync(out, page);
  console.log(`wrote ${path.relative(root, out)} · ${(page.length / 1e6).toFixed(1)} MB · ${assets.length} assets`);
  console.log(`soundtrack · ${(audioSize / 1e6).toFixed(1)} MB · ${embedAudio ? 'embedded in HTML' : `keep dist/${audioRelative} beside the HTML`}`);
}

// ── --web · the website copy (angelsofvices.com/play-rp7d/) ────────────────────
// Same body, assets and bundle as the playtest file, but every file stays under Cloudflare's 25 MiB cap,
// and nothing loads until the dev password is in. The password only keeps the game off the public
// page: the repo is public, so it is a door, not a lock.
async function buildWeb() {
  const webDir = path.resolve(root, '..', 'play-rp7d'), LIMIT = 20e6;
  const passHash = (await import('node:crypto')).createHash('sha256').update('aovdev').digest('hex');
  fs.rmSync(webDir, { recursive: true, force: true, filter: undefined });
  fs.mkdirSync(path.join(webDir, 'assets/video'), { recursive: true });
  fs.mkdirSync(path.join(webDir, 'assets/audio'), { recursive: true });
  // assets → chunk-N.js, each under LIMIT
  const chunks = []; let cur = '';
  for (const a of assets) {
    const line = `(window.__RP7D_ASSETS||(window.__RP7D_ASSETS={}))[${JSON.stringify(a)}]="${b64(a)}";\n`;
    if (cur && cur.length + line.length > LIMIT) { chunks.push(cur); cur = ''; }
    cur += line;
  }
  if (cur) chunks.push(cur);
  chunks.forEach((c, i) => fs.writeFileSync(path.join(webDir, `chunk-${i}.js`), c));
  fs.writeFileSync(path.join(webDir, 'game.js'), js);
  // media: re-encoded to fit the cap, and to stream (the movie's index sits at the front)
  const media = [
    [path.join(root, 'assets/video/intro.mp4'), 'assets/video/intro.mp4', ['-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart']],
    [audioFile, audioRelative, ['-map', '0:a', '-c:a', 'libmp3lame', '-b:a', '96k']] // 33 min of music: 96k keeps it under the cap
  ];
  const { execFileSync } = await import('node:child_process');
  const cache = path.join(root, 'dist', 'web-media'); // re-encoded once, reused until the source changes
  for (const [src, rel, args] of media) {
    if (!fs.existsSync(src)) { console.log(`skip ${rel} · not found`); continue; }
    const cached = path.join(cache, rel);
    if (!fs.existsSync(cached) || fs.statSync(cached).mtimeMs < fs.statSync(src).mtimeMs) {
      fs.mkdirSync(path.dirname(cached), { recursive: true });
      execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', src, ...args, cached]);
    }
    fs.copyFileSync(cached, path.join(webDir, rel));
  }
  // page: the gate, then the playtest body; the game's files load only once the password is in
  const gate = `<div class="dev-gate" id="dev-gate"><form class="dg-box" id="dg-form" autocomplete="off">
  <b>RIZING POWER 7 · DELUXE</b><small>DEV PLAYTEST · ENTER THE PASSWORD</small>
  <input id="dg-pass" type="password" aria-label="Password" autofocus/>
  <button type="submit">LAUNCH</button><p id="dg-err" hidden>That isn’t it. Try again.</p></form></div>`;
  const boot = `<script>
(function () {
  const HASH = ${JSON.stringify(passHash)}, KEY = 'rp7d.dev.pass', root = document.documentElement;
  const files = ${JSON.stringify(chunks.map((_, i) => `./chunk-${i}.js`))};
  const sha = async t => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)))].map(b => b.toString(16).padStart(2, '0')).join('');
  let launched = false;
  const launch = () => { // asset chunks in order, then the game module
    if (launched) return; launched = true;
    const next = i => {
      const s = document.createElement('script');
      if (i < files.length) { s.src = files[i]; s.onload = () => next(i + 1); }
      else { s.type = 'module'; s.src = './game.js'; }
      s.onerror = () => { document.getElementById('loading').textContent = 'COULD NOT LOAD ' + (files[i] || 'game.js') + ' · REFRESH TO TRY AGAIN'; };
      document.body.appendChild(s);
    };
    next(0);
  };
  // The movie downloads first; the game's ~55 MB waits until it can play through (or is skipped, or ends),
  // so the two don't fight over the connection and leave the movie black. After 15 s the game loads anyway.
  const video = document.getElementById('intro-video');
  const afterMovie = () => {
    if (!video || !document.getElementById('intro-movie')) return launch();
    video.addEventListener('canplaythrough', launch, { once: true });
    const gone = setInterval(() => { if (!document.getElementById('intro-movie') || document.getElementById('intro-movie').classList.contains('out')) { clearInterval(gone); launch(); } }, 250);
    video.addEventListener('play', () => setTimeout(launch, 15000), { once: true });
  };
  let saved = null; try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === HASH) { // known browser: buffer the movie behind PRESS ANY KEY
    document.getElementById('dev-gate').remove();
    if (video) { video.preload = 'auto'; video.load(); }
    afterMovie(); return;
  }
  root.classList.add('dev-locked');
  const form = document.getElementById('dg-form'), input = document.getElementById('dg-pass');
  input.focus();
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (await sha(input.value.trim()) !== HASH) { document.getElementById('dg-err').hidden = false; input.select(); return; }
    try { localStorage.setItem(KEY, HASH); } catch (e) {}
    root.classList.remove('dev-locked'); document.getElementById('dev-gate').remove();
    window.__rp7dIntro?.play(); // the submit is the gesture, so the movie starts with sound
    afterMovie();
  });
})();
</script>`;
  const gateCss = `.dev-gate{position:fixed;inset:0;z-index:100;display:grid;place-items:center;background:#000}
.dg-box{display:grid;gap:12px;justify-items:center;width:min(440px,88vw);color:#e9d39c}
.dg-box b{font:600 18px Cinzel,serif;letter-spacing:.24em;text-align:center}
.dg-box small{font:600 9px 'DM Sans',sans-serif;letter-spacing:.24em;color:#f5eedf80}
.dg-box input{width:100%;padding:12px 14px;font:16px 'DM Sans',sans-serif;color:#fff;background:#0b0d16;border:1px solid #e9d39c66;border-radius:6px;text-align:center;letter-spacing:.2em}
.dg-box input:focus{outline:none;border-color:#e9d39c}
.dg-box button{padding:11px 26px;font:600 11px 'DM Sans',sans-serif;letter-spacing:.24em;color:#1a2119;background:linear-gradient(120deg,#dac184,#b69a5f);border:0;border-radius:6px;cursor:pointer}
.dg-box p{margin:0;font-size:12px;color:#ff9a9a}.dg-box p[hidden]{display:none}`;
  const webPage = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>RP7D · Malezor Playtest</title>
<style>${css}\n${gateCss}</style></head>
<body>
${gate}
${body.replace('preload="auto"', 'preload="none"').replace(/\s*<source src="\.\.\/assets\/video\/intro\.mp4"\/>/, '')}
<script>window.__RP7D_SOUNDTRACK_SRC=${JSON.stringify('./' + audioRelative)};</script>
${boot}
</body></html>`;
  fs.writeFileSync(path.join(webDir, 'index.html'), webPage);
  let worst = 0;
  for (const f of fs.readdirSync(webDir, { recursive: true })) { const p = path.join(webDir, f); if (fs.statSync(p).isFile()) { const n = fs.statSync(p).size; worst = Math.max(worst, n); console.log(`  ${f} · ${(n / 1e6).toFixed(1)} MB`); } }
  if (worst > 24 * 1024 * 1024) throw new Error('a website file is over 24 MiB; Cloudflare will refuse it');
  console.log(`wrote ${path.relative(path.resolve(root, '..'), webDir)}/ · ${chunks.length} asset chunks · largest file ${(worst / 1e6).toFixed(1)} MB`);
}
