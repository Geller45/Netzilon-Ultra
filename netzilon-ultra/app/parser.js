// Netzilon Ultra – Parser für content/_SCHEMA.md (Format 2.0, abwärtskompatibel zu 1.x)
// Läuft im Browser UND in Node (vm) – deshalb keine DOM-Abhängigkeiten.
const Parser = (() => {
  const SECTIONS = ['Profi', 'Einfach', 'Merksatz', 'Prüfungsfalle', 'Grafik', 'Lab', 'Befehle', 'Übungen', 'Karteikarten', 'Quiz',
    'Lücken', 'Zuordnen', 'Reihenfolge', 'Freitext', 'Szenario', 'Spickzettel', 'Legende'];

  function parseValue(v) {
    v = String(v).replace(/\s+#\s.*$/, '').trim();
    if (v.startsWith('[') && v.endsWith(']')) return v.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    return v.replace(/^["']|["']$/g, '');
  }

  function splitPipe(line) {
    // trennt an " | ", ignoriert "\|"
    const parts = []; let cur = '';
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '\\' && line[i + 1] === '|') { cur += '|'; i++; continue; }
      if (line[i] === '|' && line[i - 1] === ' ' && line[i + 1] === ' ') { parts.push(cur.trim()); cur = ''; continue; }
      cur += line[i];
    }
    parts.push(cur.trim());
    return parts;
  }
  const feldWert = (teile, key) => { const t = teile.find(x => new RegExp('^' + key + ':\\s*', 'i').test(x)); return t ? t.replace(new RegExp('^' + key + ':\\s*', 'i'), '').trim() : ''; };

  // ### Untertitel-Blöcke eines Abschnitts
  function bloecke(sek, standardTitel) {
    const out = [];
    if (!sek) return out;
    const teile = sek.split(/^###\s+/m);
    if (teile[0].trim()) out.push({ titel: standardTitel || '', text: teile[0] });
    for (const t of teile.slice(1)) {
      const nl = t.indexOf('\n');
      out.push({ titel: (nl < 0 ? t : t.slice(0, nl)).trim(), text: nl < 0 ? '' : t.slice(nl + 1) });
    }
    return out;
  }

  // Lückentext: "Text {Lösung} Text {a|b}"
  function lueckenTeile(txt) {
    const teile = []; const re = /\{([^{}]+)\}/g; let m, last = 0;
    while ((m = re.exec(txt))) {
      if (m.index > last) teile.push({ t: txt.slice(last, m.index) });
      teile.push({ gap: m[1].split('|').map(s => s.trim()).filter(Boolean) });
      last = re.lastIndex;
    }
    if (last < txt.length) teile.push({ t: txt.slice(last) });
    return teile;
  }

  // Grafik-Schritte maschinenlesbar: "1. A -> B: Text" | "1. A: Text" | "1. Text"
  function grafikSchritte(text) {
    const schritte = [];
    for (const raw of text.split('\n')) {
      const m = raw.match(/^\s*(\d+)[.)]\s+(.+)$/);
      if (!m) continue;
      const s = m[2].trim();
      const pk = s.match(/^([^:>]{1,40}?)\s*(?:->|→)\s*([^:]{1,60}?)\s*:\s*(.*)$/);
      if (pk && !/`/.test(pk[1])) {
        const ziele = pk[2].split(/\s*,\s*/).map(x => x.trim()).filter(Boolean);
        schritte.push({ art: 'paket', von: pk[1].trim(), nach: ziele, text: pk[3].trim() });
        continue;
      }
      const ak = s.match(/^([^:`]{1,32}?):\s+(.+)$/);
      if (ak && ak[1].trim().split(/\s+/).length <= 4 && !/^(https?|ftp)$/i.test(ak[1].trim())) { schritte.push({ art: 'akteur', akteur: ak[1].trim(), text: ak[2].trim() }); continue; }
      schritte.push({ art: 'text', text: s });
    }
    return schritte;
  }

  function parse(text, meta = {}) {
    text = String(text == null ? '' : text).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
    const doc = { head: {}, sections: {}, legende: [], cards: [], quiz: [], uebungen: [], befehle: [], luecken: [], zuordnen: [], reihenfolge: [], freitext: [], szenarien: [], spickzettel: [], grafiken: [], labSchritte: [], warnungen: [], ...meta };
    let body = text;
    const m = text.match(/^---\n([\s\S]*?)\n---[ \t]*(\n|$)/);
    if (m) {
      for (const line of m[1].split('\n')) {
        const i = line.indexOf(':');
        if (i > 0 && !/^\s*#/.test(line)) doc.head[line.slice(0, i).trim()] = parseValue(line.slice(i + 1));
      }
      body = text.slice(m[0].length);
    }
    const h = doc.head;
    const str = v => Array.isArray(v) ? v.join(', ') : (v == null ? '' : String(v));
    doc.id = str(h.id) || meta.path || '';
    doc.titel = str(h.titel) || doc.id;
    doc.bereich = str(h.bereich) || 'Sonstiges';
    doc.kapitel = str(h.kapitel) || '';
    doc.block = str(h.block) || '';
    doc.stufe = str(h.stufe) || '';
    doc.typ = str(h.typ) || 'thema';
    doc.verweise = Array.isArray(h.verweise) ? h.verweise : (h.verweise ? [String(h.verweise)] : []);
    doc.quellen = Array.isArray(h.quellen) ? h.quellen : (h.quellen ? [String(h.quellen)] : []);
    doc.pruefungen = Array.isArray(h.pruefungen) ? h.pruefungen : (h.pruefungen ? String(h.pruefungen).split(/\s*,\s*/).filter(Boolean) : []);
    doc.fach = Array.isArray(h.fach) ? h.fach : (h.fach ? [String(h.fach)] : []);
    doc.zeit = parseFloat(String(h.zeit || '').replace(',', '.')) || 0;       // Minuten
    doc.punkte = parseFloat(String(h.punkte || '').replace(',', '.')) || 0;   // Gesamtpunkte
    doc.order = String(meta.path || '').replace(/\\/g, '/');

    // Abschnitte (## Name) – Codeblöcke dürfen kein "## " enthalten, das wäre ein neuer Abschnitt
    const parts = body.split(/^## /m);
    for (const p of parts.slice(1)) {
      const nl = p.indexOf('\n');
      const name = (nl < 0 ? p : p.slice(0, nl)).trim();
      const inhalt = nl < 0 ? '' : p.slice(nl + 1).trim();
      doc.sections[name] = doc.sections[name] ? doc.sections[name] + '\n\n' + inhalt : inhalt;
    }
    const S = doc.sections;

    // Karteikarten
    for (const line of (S['Karteikarten'] || '').split('\n')) {
      const t = line.trim();
      if (!t.startsWith('- F:')) continue;
      const [f, a] = splitPipe(t.slice(2));
      if (f && a) doc.cards.push({ f: f.replace(/^F:\s*/, ''), a: a.replace(/^A:\s*/, '') });
      else doc.warnungen.push('Karteikarte ohne " | A:": ' + t.slice(0, 60));
    }
    // Übungen
    for (const line of (S['Übungen'] || '').split('\n')) {
      const t = line.trim();
      if (!t.startsWith('- A:')) continue;
      const [a, l] = splitPipe(t.slice(2));
      doc.uebungen.push({ a: (a || '').replace(/^A:\s*/, ''), l: (l || '').replace(/^L:\s*/, '') });
    }
    // Quiz (mehrere richtige erlaubt, ! Erklärung, @ Quelle)
    let q = null;
    for (const line of (S['Quiz'] || '').split('\n')) {
      const t = line.trim();
      if (t.startsWith('? ')) { q = { frage: t.slice(2), antworten: [], erklaerung: '', quelle: '' }; doc.quiz.push(q); }
      else if (q && t.startsWith('* ')) q.antworten.push({ text: t.slice(2), richtig: true });
      else if (q && t.startsWith('- ')) q.antworten.push({ text: t.slice(2), richtig: false });
      else if (q && t.startsWith('! ')) q.erklaerung = q.erklaerung ? q.erklaerung + ' ' + t.slice(2) : t.slice(2);
      else if (q && t.startsWith('@ ')) q.quelle = t.slice(2).trim();
      else if (q && t && !q.antworten.length && !/^#/.test(t)) q.frage += ' ' + t; // mehrzeilige Frage
    }
    const vorher = doc.quiz.length;
    doc.quiz = doc.quiz.filter(x => x.antworten.some(a => a.richtig) && x.antworten.length >= 2);
    if (doc.quiz.length < vorher) doc.warnungen.push(`${vorher - doc.quiz.length} Quizfrage(n) ohne richtige Antwort oder mit < 2 Antworten übersprungen`);
    doc.quiz.forEach(x => { x.multi = x.antworten.filter(a => a.richtig).length > 1; });
    // Befehle
    for (const line of (S['Befehle'] || '').split('\n')) {
      const mm = line.trim().match(/^-?\s*`([^`]+)`\s*[–—-]\s*(.+)$/);
      if (mm) doc.befehle.push({ befehl: mm[1], text: mm[2] });
    }
    // Grafik: ### Name + Schritte (+ maschinenlesbare Animation)
    for (const g of bloecke(S['Grafik'], 'Ablauf')) {
      const schritte = grafikSchritte(g.text);
      const animierbar = schritte.length >= 2 && schritte.some(s => s.art !== 'text');
      doc.grafiken.push({ name: g.titel, text: g.text.trim(), schritte, animierbar });
    }
    // Lab-Schritte für Checklisten
    let labTeil = 'Allgemein';
    for (const line of (S['Lab'] || '').split('\n')) {
      const hh = line.match(/^###\s+(.+)/); if (hh) { labTeil = hh[1].trim(); continue; }
      const st = line.match(/^\s*(?:\d+\.|-)\s+(.+)/);
      if (st) doc.labSchritte.push({ teil: labTeil, text: st[1] });
    }
    // Lücken
    for (const line of (S['Lücken'] || S['Luecken'] || '').split('\n')) {
      const t = line.trim();
      if (!/^[-*]\s+/.test(t)) continue;
      const txt = t.replace(/^[-*]\s+/, '');
      const teile = lueckenTeile(txt);
      if (teile.some(x => x.gap)) doc.luecken.push({ text: txt, teile });
      else doc.warnungen.push('Lücke ohne {…}: ' + txt.slice(0, 60));
    }
    // Zuordnen
    for (const b of bloecke(S['Zuordnen'], doc.titel)) {
      const paare = [];
      for (const line of b.text.split('\n')) {
        const mm = line.trim().match(/^[-*]\s+(.+?)\s*(?:=>|⇒)\s*(.+)$/);
        if (mm) paare.push({ l: mm[1].trim(), r: mm[2].trim() });
      }
      if (paare.length >= 2) doc.zuordnen.push({ titel: b.titel || doc.titel, paare });
    }
    // Reihenfolge
    for (const b of bloecke(S['Reihenfolge'], doc.titel)) {
      const schritte = [];
      for (const line of b.text.split('\n')) { const mm = line.trim().match(/^\d+[.)]\s+(.+)$/); if (mm) schritte.push(mm[1].trim()); }
      if (schritte.length >= 2) doc.reihenfolge.push({ titel: b.titel || doc.titel, schritte });
    }
    // Freitext: - F: Aufgabe | M: Musterlösung | P: Punkte
    for (const line of (S['Freitext'] || '').split('\n')) {
      const t = line.trim();
      if (!/^[-*]\s+F:/.test(t)) continue;
      const teile = splitPipe(t.replace(/^[-*]\s+/, ''));
      const frage = feldWert(teile, 'F'), muster = feldWert(teile, 'M'), p = parseFloat(feldWert(teile, 'P').replace(',', '.'));
      if (frage && muster) doc.freitext.push({ frage, muster, punkte: p > 0 ? p : 2 });
      else doc.warnungen.push('Freitext unvollständig: ' + t.slice(0, 60));
    }
    // Szenario: ### Titel, Ausgangslage, - F: | A:
    for (const b of bloecke(S['Szenario'], 'Szenario')) {
      const lage = [], fragen = [];
      for (const line of b.text.split('\n')) {
        const t = line.trim();
        if (/^[-*]\s+F:/.test(t)) {
          const teile = splitPipe(t.replace(/^[-*]\s+/, ''));
          const f = feldWert(teile, 'F'), a = feldWert(teile, 'A') || feldWert(teile, 'L') || feldWert(teile, 'M');
          const p = parseFloat(feldWert(teile, 'P').replace(',', '.'));
          if (f) fragen.push({ f, a, punkte: p > 0 ? p : 2 });
        } else if (!fragen.length) lage.push(line);
      }
      if (fragen.length) doc.szenarien.push({ titel: b.titel, lage: lage.join('\n').trim(), fragen });
    }
    // Legende (2.2): "- Was: …", "- Wie: …", "- Wann: …", "- Wo: …", "- Warum: …" (optional ### Begriff für mehrere Legenden)
    for (const b of bloecke(S['Legende'], '')) {
      const felder = [];
      for (const line of b.text.split('\n')) {
        const m = line.trim().match(/^[-*]\s+(Was|Wie|Wann|Wo|Warum|Wer|Womit|Beispiel)\s*[:?]\s*(.+)$/i);
        if (m) felder.push({ k: m[1][0].toUpperCase() + m[1].slice(1).toLowerCase(), v: m[2].trim() });
      }
      if (felder.length) doc.legende.push({ titel: b.titel, felder });
      else if (b.text.trim()) doc.warnungen.push('Legende ohne „- Was: …“-Zeilen' + (b.titel ? ' (' + b.titel + ')' : ''));
    }
    // Spickzettel
    doc.spickzettel = (S['Spickzettel'] || '').split('\n').map(l => l.trim()).filter(Boolean).map(l => l.replace(/^[-*]\s+/, ''));
    // Suchtext
    doc.plain = (doc.titel + ' ' + doc.kapitel + ' ' + body).replace(/[#*`|>\[\]{}]/g, ' ');
    return doc;
  }

  // Sichere Variante: wirft nie, liefert {doc} oder {fehler}
  function parseSicher(text, meta = {}) {
    try {
      if (typeof text !== 'string') return { fehler: 'Kein Text' };
      if (!/^\uFEFF?---\r?\n/.test(text)) return { fehler: 'Kopf (---) fehlt' };
      const doc = parse(text, meta);
      if (!doc.head.id) return { fehler: 'id fehlt im Kopf' };
      if (!doc.head.titel) doc.warnungen.push('titel fehlt');
      return { doc };
    } catch (e) { return { fehler: 'Parserfehler: ' + (e && e.message || e) }; }
  }

  // ---------- Markdown-Renderer ----------
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  function inline(s) {
    s = String(s == null ? '' : s);
    const codes = [];
    s = s.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
    s = esc(s)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*\w])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
      .replace(/\[\[([^\]]+)\]\]/g, '<a class="xref" data-id="$1">$1</a>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<span class="link" title="$2">$1</span>');
    return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[i])}</code>`);
  }

  function md(src, opts = {}) {
    if (!src) return '';
    let chk = 0;
    const lines = String(src).replace(/\r\n/g, '\n').split('\n');
    let out = '', i = 0, schutz = 0;
    while (i < lines.length) {
      if (++schutz > 200000) break;
      const l = lines[i];
      if (/^```/.test(l)) {
        const lang = l.slice(3).trim(); let code = []; i++;
        while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
        i++;
        out += `<pre class="code" data-lang="${esc(lang)}"><button class="copy" title="Kopieren">⧉</button><code>${esc(code.join('\n'))}</code></pre>`;
        continue;
      }
      const h = l.match(/^(#{3,6})\s+(.+)/);
      if (h) { const n = Math.min(h[1].length, 5); out += `<h${n}>${inline(h[2])}</h${n}>`; i++; continue; }
      if (/^\s*\|/.test(l)) {
        const rows = [];
        while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(lines[i++]);
        const cells = r => r.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map(c => inline(c.trim().replace(/\\\|/g, '|')));
        const hasHead = rows[1] && /^\s*\|?\s*:?-+/.test(rows[1]);
        out += '<div class="tablewrap"><table>';
        if (hasHead) { out += '<thead><tr>' + cells(rows[0]).map(c => `<th>${c}</th>`).join('') + '</tr></thead>'; rows.splice(0, 2); }
        out += '<tbody>' + rows.map(r => '<tr>' + cells(r).map(c => `<td>${c}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>';
        continue;
      }
      if (/^\s*([-*]|\d+\.)\s+/.test(l)) {
        const ordered = /^\s*\d+\./.test(l);
        let items = [];
        while (i < lines.length && (/^\s*([-*]|\d+\.)\s+/.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length))) {
          const t = lines[i];
          const sub = /^\s{2,}/.test(t);
          const txt = t.replace(/^\s*([-*]|\d+\.)\s+/, '').trim();
          if (sub && items.length) items[items.length - 1].sub.push(txt); else items.push({ txt, sub: [] });
          i++;
        }
        const tag = ordered ? 'ol' : 'ul';
        out += `<${tag}${opts.check ? ' class="check"' : ''}>` + items.map(it => `<li>${opts.check ? `<label class="haken-box"><input type="checkbox" data-schritt="${chk++}"${opts.erledigt && opts.erledigt[chk - 1] ? ' checked' : ''}><span></span></label>` : ''}${inline(it.txt)}${it.sub.length ? '<ul>' + it.sub.map(s => `<li>${inline(s)}</li>`).join('') + '</ul>' : ''}</li>`).join('') + `</${tag}>`;
        continue;
      }
      if (/^>\s?/.test(l)) {
        let q = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, ''));
        out += `<blockquote>${inline(q.join(' '))}</blockquote>`; continue;
      }
      if (/^---+$/.test(l.trim())) { out += '<hr>'; i++; continue; }
      if (!l.trim()) { i++; continue; }
      let para = [];
      while (i < lines.length && lines[i].trim() && !/^(```|#{3,6}\s|\s*\||\s*([-*]|\d+\.)\s|>)/.test(lines[i])) para.push(lines[i++]);
      if (!para.length) { para.push(lines[i++]); }
      out += `<p>${inline(para.join(' '))}</p>`;
    }
    if (opts.zaehler) opts.zaehler.n = chk;
    return out;
  }

  return { parse, parseSicher, md, inline, esc, splitPipe, lueckenTeile, grafikSchritte, SECTIONS };
})();
