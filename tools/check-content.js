// Prüft Inhaltsdateien gegen Format 2.0. Aufruf: node check-content.js <ordner> [--strict]
// Nutzt app/parser.js aus dem Projekt. Gibt Fehler (E) und Warnungen (W) aus, Exitcode 1 bei Fehlern.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = '/home/claude/build/netzilon-ultra';
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'app/parser.js'), 'utf8') + '\nthis.Parser = Parser;', ctx);
const P = ctx.Parser;
const dir = path.resolve(process.argv[2] || path.join(ROOT, 'content'));
const strict = process.argv.includes('--strict');
const BEREICHE = ['AP1','AP2','AZ-800','AZ-801','Linux','CCNA','Datenbanken','Azure Data','WiSo','Prüfung','Referenz','Legacy','Bonus'];
const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
  if (e.name.startsWith('_') || e.name === 'FORTSCHRITT.md') continue;
  const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name.endsWith('.md')) files.push(p); } })(dir);
// alle ids im gesamten content für Duplikat-/Verweisprüfung
const allIds = new Map();
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
  if (e.name.startsWith('_')) continue; const p = path.join(d, e.name);
  if (e.isDirectory()) walk(p); else if (e.name.endsWith('.md')) { const m = fs.readFileSync(p, 'utf8').match(/^id:\s*(\S+)/m); if (m) { if (!allIds.has(m[1])) allIds.set(m[1], []); allIds.get(m[1]).push(p); } } } })(path.join(ROOT, 'content'));
let E = 0, W = 0, tot = { cards: 0, quiz: 0, files: 0 };
const err = (f, m) => { E++; console.log('E', path.relative(ROOT, f), m); };
const warn = (f, m) => { W++; console.log('W', path.relative(ROOT, f), m); };
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8'); tot.files++;
  if (!/^---\n[\s\S]*?\n---/.test(t.replace(/\r\n/g, '\n'))) { err(f, 'Kopf (---) fehlt'); continue; }
  const d = P.parse(t, { path: f });
  if (!d.head.id) err(f, 'id fehlt');
  else if ((allIds.get(d.head.id) || []).length > 1) err(f, 'id doppelt: ' + allIds.get(d.head.id).map(x => path.relative(ROOT, x)).join(', '));
  if (!d.head.titel) err(f, 'titel fehlt');
  if (!BEREICHE.includes(d.bereich)) err(f, 'unbekannter bereich: ' + d.bereich);
  for (const v of d.verweise) if (!allIds.has(v)) warn(f, 'Verweis ins Leere: ' + v);
  // Quiz prüfen (Rohtext, da Parser ungültige still filtert)
  let q = null, qs = [];
  for (const line of (d.sections['Quiz'] || '').split('\n')) { const s = line.trim();
    if (s.startsWith('? ')) { q = { f: s, r: 0, w: 0 }; qs.push(q); } else if (q && s.startsWith('* ')) q.r++; else if (q && s.startsWith('- ')) q.w++; }
  for (const x of qs) { if (x.r < 1) err(f, 'Quiz ohne richtige Antwort: ' + x.f.slice(0, 60)); if (x.r + x.w < 2) err(f, 'Quiz < 2 Antworten: ' + x.f.slice(0, 60)); else if (x.w !== 3 && x.r === 1) warn(f, `Quiz hat ${x.w} falsche statt 3: ` + x.f.slice(0, 50)); }
  const kk = (d.sections['Karteikarten'] || '').split('\n').filter(l => l.trim().startsWith('- F:'));
  if (kk.length !== d.cards.length) err(f, `Karteikarten defekt: ${kk.length - d.cards.length} Zeilen ohne " | A:"`);
  for (const l of (d.sections['Lücken'] || '').split('\n')) if (l.trim().startsWith('- ') && !/\{[^}]+\}/.test(l)) err(f, 'Lücke ohne {…}: ' + l.slice(0, 50));
  for (const l of (d.sections['Freitext'] || '').split('\n')) if (l.trim().startsWith('- F:') && !/ \| M: /.test(l)) err(f, 'Freitext ohne " | M:": ' + l.slice(0, 50));
  tot.cards += d.cards.length; tot.quiz += qs.length;
  const typ = d.head.typ || 'thema';
  if (typ === 'thema') {
    for (const s of ['Profi', 'Einfach', 'Merksatz', 'Prüfungsfalle', 'Karteikarten', 'Quiz']) if (!d.sections[s]) (strict ? err : warn)(f, 'Abschnitt fehlt: ' + s);
    if ((d.sections['Profi'] || '').length < 1500) warn(f, 'Profi kurz (' + (d.sections['Profi'] || '').length + ' Zeichen)');
    if ((d.sections['Einfach'] || '').length < 1200) warn(f, 'Einfach kurz (' + (d.sections['Einfach'] || '').length + ' Zeichen)');
    if (d.cards.length < 8) warn(f, 'nur ' + d.cards.length + ' Karteikarten');
    if (qs.length < 8) warn(f, 'nur ' + qs.length + ' Quizfragen');
  }
  if (!d.quellen.length) warn(f, 'quellen leer');
}
console.log(`\n${tot.files} Dateien, ${tot.cards} Karteikarten, ${tot.quiz} Quizfragen, ${E} Fehler, ${W} Warnungen`);
process.exit(E ? 1 : 0);
