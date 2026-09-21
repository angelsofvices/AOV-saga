// ★★★★ v0.99.15 · THE BUILD'S CONCATENATED SCRIPT, DERIVED — NOT REMEMBERED.
//
//   182 suites opened with `fs.readFileSync('/tmp/all.js', 'utf8')`. That file
//   was a scratch artefact written by hand in the session that authored the
//   first of them. /tmp does not survive a session, so from the next one onward
//   every one of those suites exited with ENOENT before a single assertion ran.
//
// ★★★★ THAT IS WHAT THE RED-SUITE BACKLOG ACTUALLY WAS. It read as ~51 failing
//   checks needing 51 investigations; it was ONE missing file. A suite that
//   crashes and a suite that fails look identical from the exit code, and
//   nobody had looked at the message.
//
// ★★ The concatenation is four lines and the page is right there. Deriving it
//   means the suites depend on nothing outside the repo and cannot rot again.
const fs = require('fs');
const path = require('path');
let _cache = null;
module.exports = function allSrc(){
  if (_cache) return _cache;
  const page = fs.readFileSync(path.join(__dirname, '..', '..', 'rp7b.html'), 'utf8');
  let out = '';
  const re = /<script[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(page))) out += m[1] + '\n';
  return (_cache = out);
};
