// Build RP7D into an HTML file that opens straight from disk in Chrome
// (double-click, no server): code bundled with Three.js, CSS inlined, and every model and
// animation the game loads embedded as base64. Music stays in a companion assets/audio
// folder by default, avoiding a large base64 copy in the HTML. Keep that folder beside it.
//
//   npm i esbuild three@0.185.1      (once: in this folder, or anywhere and point NODE_PATH at its node_modules)
//   node tools/build_single_html.mjs  → dist/RP7D_Malezor_Playtest.html
//   node tools/build_single_html.mjs --embed-audio → completely self-contained, larger HTML
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
fs.mkdirSync(path.dirname(out), { recursive: true });
if (!embedAudio) {
  const audioOut = path.join(path.dirname(out), audioRelative);
  fs.mkdirSync(path.dirname(audioOut), { recursive: true });
  fs.copyFileSync(audioFile, audioOut);
}
fs.writeFileSync(out, page);
console.log(`wrote ${path.relative(root, out)} · ${(page.length / 1e6).toFixed(1)} MB · ${assets.length} assets`);
console.log(`soundtrack · ${(audioSize / 1e6).toFixed(1)} MB · ${embedAudio ? 'embedded in HTML' : `keep dist/${audioRelative} beside the HTML`}`);
