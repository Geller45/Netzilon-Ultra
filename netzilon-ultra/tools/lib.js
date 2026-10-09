// Gemeinsame Helfer für tools/*: Parser laden, Inhalte einsammeln
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
function ladeParser() {
  const ctx = { console, window: {} }; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'app', 'parser.js'), 'utf8') + '\n;this.Parser = Parser;', ctx);
  return ctx.Parser;
}
function sammle(dir = path.join(root, 'content'), base = dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('_') || e.name.startsWith('.') || e.name === 'FORTSCHRITT.md') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) sammle(p, base, out);
    else if (e.name.toLowerCase().endsWith('.md')) out.push({ path: path.relative(base, p).replace(/\\/g, '/'), source: 'eingebaut', text: fs.readFileSync(p, 'utf8') });
  }
  return out;
}
module.exports = { root, ladeParser, sammle };
