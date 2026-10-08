// Read-only canonical source → portable N3000 snapshot. Override --source-root for another checkout.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const audit = JSON.parse(fs.readFileSync(path.join(root, 'reports/n3000-package-audit.json')));
const first = Array.isArray(audit) ? audit[0] : audit.records?.[0];
const flag = process.argv.indexOf('--source-root');
const sourceRoot = flag >= 0 ? path.resolve(process.argv[flag + 1]) : first.packageLocation;
const entry = path.join(sourceRoot, 'return.html');
const original = fs.readFileSync(entry, 'utf8');
let html = original;
html = html.replace(/<script\b[^>]*type=["']module["'][^>]*>[\s\S]*?<\/script>/gi, ''); // optional online leaderboard; local fallback stays intact
html = html.replace(/<link\b[^>]*href=["']https?:[^>]*>/gi, '');
for (const name of ['aov-gamepad-boot.js', 'card-game-controller-nav.js']) {
  const code = fs.readFileSync(path.join(sourceRoot, name), 'utf8');
  html = html.replace(new RegExp('<script[^>]*src=["\']/?' + name.replaceAll('.', '\\.') + '["\'][^>]*>\\s*</script>', 'gi'), `<script>${code.replace(/<\/script/gi, '<\\/script')}</script>`);
}
const audio = {
  'assets/rp1/naboo-guard-blaster.mp3': process.env.N3000_RP1_BLASTER || '/Users/mctherockstar/Downloads/naboo-guard-blaster.mp3',
  'assets/rp1/barrel-exploding.mp3': path.join(sourceRoot, 'assets/barrel-exploding.mp3')
};
for (const [ref, file] of Object.entries(audio)) html = html.replaceAll(ref, 'data:audio/mpeg;base64,' + fs.readFileSync(file).toString('base64'));
// Preserve the original optional music UI, but supply no invented replacement soundtrack.
html = html.replace(/\s+src=["']\/?assets\/rp1\/rp1_soundtrack\.mp3["']/g, '');
const output = path.join(root, 'assets/n3000/rp1'); fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'index.html'), html);
fs.writeFileSync(path.join(output, 'package.js'), 'export default ' + JSON.stringify(html) + ';\n');
const sha = crypto.createHash('sha256').update(original).digest('hex');
fs.writeFileSync(path.join(output, 'provenance.json'), JSON.stringify({ id: 'RP1', entryPoint: 'index.html', canonicalEntry: 'return.html', sourceSha256: sha, format: 'self-contained HTML snapshot', adaptations: ['Inline existing controller helpers', 'Embed exact blaster and explosion audio', 'Omit optional online leaderboard module; existing local leaderboard fallback', 'Missing original soundtrack: no replacement'], warnings: ['RP1 soundtrack is missing'] }, null, 2));
console.log('RP1 packaged; canonical source unchanged; SHA256 ' + sha);
