// Prüft alle Inhalte: Parser-Fehler, doppelte ids, Mindestumfang. Exit-Code 1 bei Fehlern.
const { ladeParser, sammle } = require('./lib');
const Parser = ladeParser();
const files = sammle(), ids = new Map();
let fehler = 0, warn = 0, karten = 0, aufgaben = 0, themen = 0;
const streng = process.argv.includes('--streng');
for (const f of files) {
  const { doc, fehler: e } = Parser.parseSicher(f.text, { path: f.path, source: f.source });
  if (e) { console.log('FEHLER', f.path, e); fehler++; continue; }
  if (ids.has(doc.id)) { console.log('FEHLER', f.path, `id „${doc.id}“ doppelt (auch ${ids.get(doc.id)})`); fehler++; continue; }
  ids.set(doc.id, f.path);
  themen++; karten += doc.cards.length;
  aufgaben += doc.quiz.length + doc.luecken.length + doc.zuordnen.length + doc.reihenfolge.length + doc.freitext.length + doc.szenarien.length;
  for (const w of doc.warnungen) { warn++; if (process.argv.includes('-v')) console.log('Warnung', f.path, w); }
  if (streng && doc.typ === 'thema' && (doc.cards.length < 8 || doc.quiz.length < 8)) { console.log('Hinweis', f.path, `${doc.cards.length} Karten, ${doc.quiz.length} Quizfragen (<8)`); warn++; }
}
// Querverweise
for (const f of files) {
  const { doc } = Parser.parseSicher(f.text, { path: f.path });
  for (const v of doc.verweise || []) if (!ids.has(v) && process.argv.includes('-v')) console.log('Verweis ins Leere', doc.id, '→', v);
}
console.log(`${themen} Dateien, ${karten} Karteikarten, ${aufgaben} Aufgaben, ${fehler} Fehler, ${warn} Warnungen`);
process.exit(fehler ? 1 : 0);
