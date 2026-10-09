// Netzilon Ultra – Lernformen: Multiple Choice (auch Mehrfachauswahl), Lückentext, Zuordnen (Drag&Drop + Tippen),
// Reihenfolge, Freitext mit Selbstbewertung, Szenario-Fälle. Einheitliche "Items" für Lesen, Quiz und Prüfung.
const Formen = (() => {
  const ARTEN = { mc: 'Multiple Choice', luecke: 'Lückentext', zuordnen: 'Zuordnen', reihenfolge: 'Reihenfolge', freitext: 'Freitext', szenario: 'Szenario' };
  const I = s => Parser.inline(s);
  const mix = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function itemsVon(d) {
    if (d._items) return d._items;
    const out = [];
    d.quiz.forEach((q, i) => out.push({ id: d.id + '#' + i, art: 'mc', doc: d, frage: q.frage, antworten: q.antworten, erklaerung: q.erklaerung, quelle: q.quelle, multi: q.multi, punkte: 1 }));
    d.luecken.forEach((l, i) => out.push({ id: d.id + '#L' + i, art: 'luecke', doc: d, text: l.text, teile: l.teile, punkte: l.teile.filter(t => t.gap).length }));
    d.zuordnen.forEach((z, i) => out.push({ id: d.id + '#Z' + i, art: 'zuordnen', doc: d, titel: z.titel, paare: z.paare, punkte: Math.min(z.paare.length, 8) }));
    d.reihenfolge.forEach((r, i) => out.push({ id: d.id + '#R' + i, art: 'reihenfolge', doc: d, titel: r.titel, schritte: r.schritte, punkte: r.schritte.length }));
    d.freitext.forEach((f, i) => out.push({ id: d.id + '#F' + i, art: 'freitext', doc: d, frage: f.frage, muster: f.muster, punkte: f.punkte }));
    d.szenarien.forEach((s, i) => out.push({ id: d.id + '#S' + i, art: 'szenario', doc: d, titel: s.titel, lage: s.lage, fragen: s.fragen, punkte: s.fragen.reduce((n, f) => n + f.punkte, 0) }));
    Object.defineProperty(d, '_items', { value: out, enumerable: false, configurable: true });
    return out;
  }
  function alle(filter, arten) {
    if (!S.items) { S.items = []; S.itemById = {}; for (const d of S.docs) for (const it of itemsVon(d)) { S.items.push(it); S.itemById[it.id] = it; } }
    return S.items.filter(it => (!filter || filter(it.doc)) && (!arten || arten.includes(it.art)));
  }
  const nachId = id => { alle(); return S.itemById[id]; };
  const selbstbewertet = it => it.art === 'freitext' || it.art === 'szenario';

  // Vergleich für Lücken: tolerant gegenüber Groß/Klein, Umlauten, Leerzeichen, Komma/Punkt
  const normal = s => String(s || '').toLowerCase().trim()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/(\d)[.,](?=\d{3}\b)/g, '$1').replace(/(\d),(\d)/g, '$1.$2')
    .replace(/[„“"'`´]/g, '').replace(/\s*([\/\-:=,()])\s*/g, '$1').replace(/\s+/g, ' ').replace(/[.;!]+$/, '');
  const gleich = (ein, loesungen) => { const n = normal(ein); return !!n && loesungen.some(l => normal(l) === n || normal(l).replace(/\s/g, '') === n.replace(/\s/g, '')); };

  // Vorbereitung je Darstellung (gemischte Antworten, Auswahl bei vielen Paaren)
  function vorbereiten(it, st, mischen) {
    if (st._bereit) return;
    st._bereit = true;
    if (it.art === 'mc') st.reihe = mischen ? mix(it.antworten.map((_, i) => i)) : it.antworten.map((_, i) => i);
    if (it.art === 'zuordnen') {
      st.auswahl = it.paare.length > 8 ? mix(it.paare.map((_, i) => i)).slice(0, 8).sort((a, b) => a - b) : it.paare.map((_, i) => i);
      st.pool = mix(st.auswahl.slice()); st.zu = {};
    }
    if (it.art === 'reihenfolge') {
      let o = mix(it.schritte.map((_, i) => i));
      if (o.length > 1 && o.every((x, i) => x === i)) o = o.reverse();
      st.ord = o;
    }
    if (it.art === 'luecke') st.ein = {};
    if (it.art === 'szenario') st.txt = {};
  }

  // ---------- Auswertung ----------
  function auswerten(it, st) {
    switch (it.art) {
      case 'mc': {
        const w = st.wahl || [];
        const richtig = it.antworten.map((a, i) => a.richtig ? i : -1).filter(i => i >= 0);
        const ok = w.length === richtig.length && richtig.every(i => w.includes(i));
        return { punkte: ok ? 1 : 0, max: 1, beantwortet: w.length > 0 };
      }
      case 'luecke': {
        const gaps = it.teile.filter(t => t.gap); let p = 0;
        gaps.forEach((g, k) => { if (gleich((st.ein || {})[k], g.gap)) p++; });
        return { punkte: p, max: gaps.length, beantwortet: Object.values(st.ein || {}).some(v => String(v).trim()) };
      }
      case 'zuordnen': {
        let p = 0;
        for (const li of st.auswahl) { const ri = st.zu[li]; if (ri !== undefined && it.paare[ri].r === it.paare[li].r) p++; }
        return { punkte: p, max: st.auswahl.length, beantwortet: Object.keys(st.zu).length > 0 };
      }
      case 'reihenfolge': {
        let p = 0; st.ord.forEach((o, i) => { if (it.schritte[o] === it.schritte[i]) p++; });
        return { punkte: p, max: it.schritte.length, beantwortet: !!st.bewegt };
      }
      case 'freitext': return { punkte: st.selbst ?? null, max: it.punkte, selbst: true, beantwortet: !!(st.text || '').trim() };
      case 'szenario': {
        const sb = st.selbst || {}; const fertig = it.fragen.every((_, i) => sb[i] !== undefined);
        return { punkte: fertig ? it.fragen.reduce((n, f, i) => n + (sb[i] || 0), 0) : null, max: it.punkte, selbst: true, beantwortet: Object.values(st.txt || {}).some(v => String(v).trim()) };
      }
    }
    return { punkte: 0, max: 1 };
  }
  function verbuchen(it, r) {
    const ok = r.max ? r.punkte / r.max >= (it.art === 'mc' ? 1 : 0.5) : false;
    Lernen.quizStat(it.id, ok);
    if (selbstbewertet(it)) { S.p.freitext[it.id] = { punkte: r.punkte, max: r.max, datum: heute() }; speichern(); }
    melde(ok ? 'richtig' : 'falsch', 1, { art: it.art, item: it });
    if (it.art === 'luecke') melde('luecke', r.punkte);
    if (it.art === 'zuordnen' || it.art === 'reihenfolge') melde('puzzle', 1);
    if (selbstbewertet(it)) melde('freitext', 1);
    return ok;
  }

  // ---------- Lösungsdarstellung ----------
  function loesungHtml(it, st = {}) {
    switch (it.art) {
      case 'mc': {
        const w = st.wahl || [];
        return `${w.length ? `<div class="antwort-z ${auswerten(it, st).punkte ? 'richtig' : 'falsch'}">Deine Antwort: ${w.map(i => I(it.antworten[i].text)).join(' · ')}</div>` : (st._bereit ? '<div class="antwort-z falsch">Nicht beantwortet</div>' : '')}
          <div class="antwort-z richtig">Richtig: ${it.antworten.filter(a => a.richtig).map(a => I(a.text)).join(' · ')}</div>
          ${it.erklaerung ? `<div class="erklaerung">${I(it.erklaerung)}</div>` : ''}${it.quelle ? `<div class="quelle">Quelle: ${E(it.quelle)}</div>` : ''}`;
      }
      case 'luecke': return `<div class="antwort-z richtig">${it.teile.map(t => t.gap ? `<b>${E(t.gap[0])}</b>${t.gap.length > 1 ? ` <small>(auch: ${t.gap.slice(1).map(E).join(', ')})</small>` : ''}` : I(t.t)).join('')}</div>`;
      case 'zuordnen': return `<div class="tablewrap"><table><tbody>${(st.auswahl || it.paare.map((_, i) => i)).map(i => `<tr><td>${I(it.paare[i].l)}</td><td>→ ${I(it.paare[i].r)}</td></tr>`).join('')}</tbody></table></div>`;
      case 'reihenfolge': return `<ol class="loesung-liste">${it.schritte.map(s => `<li>${I(s)}</li>`).join('')}</ol>`;
      case 'freitext': return `<div class="muster"><b>Musterlösung (${fmtP(it.punkte)} P):</b> ${I(it.muster)}</div>`;
      case 'szenario': return it.fragen.map((f, i) => `<div class="muster"><b>${i + 1}. ${I(f.f)}</b><br>${I(f.a || '–')}</div>`).join('');
    }
    return '';
  }
  const fmtP = p => String(+(+p).toFixed(1)).replace('.', ',');
  function kopf(it, ctx) {
    const art = it.art !== 'mc' ? `<span class="art-chip">${ARTEN[it.art]}</span>` : (it.multi ? `<span class="art-chip multi">Mehrfachauswahl · ${it.antworten.filter(a => a.richtig).length} richtig</span>` : '');
    const p = ctx.modus === 'pruefung' && it.punkte ? `<span class="art-chip">${fmtP(ctx.punkteAnzeige ?? it.punkte)} P</span>` : '';
    return art || p ? `<div class="item-kopf">${art}${p}</div>` : '';
  }

  // ---------- Darstellung ----------
  // ctx: { modus: 'lesen' | 'uebung' | 'pruefung', state, fertig(res), nr, mischen }
  function render(it, el, ctx = {}) {
    const st = ctx.state || {}; ctx.state = st;
    vorbereiten(it, st, ctx.modus !== 'lesen' || it.art !== 'mc');
    const pr = ctx.modus === 'pruefung';
    let erledigt = !!st._fertig && !pr;
    const nr = ctx.nr ? `${ctx.nr}. ` : '';
    const zeigeErgebnis = r => {
      st._fertig = true; erledigt = true;
      if (!ctx.ohneStat) verbuchen(it, r);
      if (ctx.fertig) ctx.fertig(r);
    };
    const ctl = { pruefen: () => {}, beantwortet: () => auswerten(it, st).beantwortet, el };

    if (it.art === 'mc') {
      const multi = it.multi;
      st.wahl = st.wahl || [];
      el.innerHTML = `<div class="quizfrage ${ctx.modus === 'lesen' ? '' : 'gross'}">${kopf(it, ctx)}<div class="frage">${nr}${I(it.frage)}</div>
        <div class="antworten">${st.reihe.map((ai, k) => `<button class="glas antwort ${st.wahl.includes(ai) ? 'gewaehlt' : ''}" data-ai="${ai}" aria-pressed="${st.wahl.includes(ai)}">${ctx.modus !== 'lesen' ? `<kbd>${'ABCDEFGH'[k] || k + 1}</kbd> ` : ''}${multi ? '<span class="box"></span>' : ''}${I(it.antworten[ai].text)}</button>`).join('')}</div>
        ${multi && !pr ? '<div class="lesen-fuss klein"><button class="glas knopf primär mc-pruefen">Prüfen (Enter)</button></div>' : ''}
        <div class="erklaerung" hidden></div></div>`;
      const btns = [...el.querySelectorAll('.antwort')];
      const markieren = () => {
        btns.forEach(b => { const ai = +b.dataset.ai; b.classList.toggle('gewaehlt', st.wahl.includes(ai)); b.setAttribute('aria-pressed', st.wahl.includes(ai)); });
      };
      const feedback = () => {
        btns.forEach(b => { const ai = +b.dataset.ai; if (it.antworten[ai].richtig) b.classList.add('richtig'); else if (st.wahl.includes(ai)) b.classList.add('falsch'); b.classList.remove('gewaehlt'); });
        const e = el.querySelector('.erklaerung');
        if (it.erklaerung || it.quelle) { e.hidden = false; e.innerHTML = (it.erklaerung ? I(it.erklaerung) : '') + (it.quelle ? `<div class="quelle">Quelle: ${E(it.quelle)}</div>` : ''); }
      };
      ctl.pruefen = () => { if (erledigt || pr || !st.wahl.length) return; const r = auswerten(it, st); feedback(); ton(r.punkte ? 'gut' : 'schlecht'); zeigeErgebnis(r); };
      ctl.waehle = k => { const ai = st.reihe[k]; if (ai === undefined || erledigt) return; klick(ai); };
      const klick = ai => {
        if (erledigt) return;
        if (multi) { st.wahl = st.wahl.includes(ai) ? st.wahl.filter(x => x !== ai) : [...st.wahl, ai]; markieren(); ton('klick'); if (ctx.geaendert) ctx.geaendert(); }
        else { st.wahl = [ai]; markieren(); if (pr) { ton('klick'); if (ctx.geaendert) ctx.geaendert(); } else ctl.pruefen(); }
      };
      btns.forEach(b => b.onclick = () => klick(+b.dataset.ai));
      const pb = el.querySelector('.mc-pruefen'); if (pb) pb.onclick = ctl.pruefen;
      if (erledigt) feedback();
      return ctl;
    }

    if (it.art === 'luecke') {
      let k = 0;
      el.innerHTML = `<div class="quizfrage luecke">${kopf(it, ctx)}<div class="frage normal">${nr}${it.teile.map(t => t.gap ? `<input class="luecke-in" data-g="${k}" value="${E((st.ein || {})[k++] || '')}" style="width:${Math.max(5, Math.min(26, Math.max(...t.gap.map(x => x.length)) + 2))}ch" autocomplete="off" spellcheck="false" aria-label="Lücke ${k}">` : I(t.t)).join('')}</div>
        ${!pr ? '<div class="lesen-fuss klein"><button class="glas knopf primär l-pruefen">Prüfen (Enter)</button><button class="glas knopf l-zeigen">Lösung zeigen</button></div>' : ''}<div class="erklaerung" hidden></div></div>`;
      const ins = [...el.querySelectorAll('.luecke-in')];
      ins.forEach(i => {
        i.oninput = () => { st.ein[i.dataset.g] = i.value; if (ctx.geaendert) ctx.geaendert(); };
        i.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); const n = ins[ins.indexOf(i) + 1]; if (n && !pr && !n.value) n.focus(); else ctl.pruefen(); } };
      });
      const gaps = it.teile.filter(t => t.gap);
      const feedback = () => {
        ins.forEach((i, j) => { const ok = gleich(i.value, gaps[j].gap); i.classList.add(ok ? 'ok' : 'nein'); i.readOnly = true; if (!ok) { const s = document.createElement('span'); s.className = 'l-loesung'; s.textContent = gaps[j].gap[0]; i.after(s); } });
      };
      ctl.pruefen = () => { if (erledigt || pr) return; const r = auswerten(it, st); feedback(); ton(r.punkte === r.max ? 'gut' : 'schlecht'); zeigeErgebnis(r); };
      const zb = el.querySelector('.l-zeigen'); if (zb) zb.onclick = () => { if (!erledigt) { ins.forEach(i => { if (!i.value) i.value = ''; }); ctl.pruefen(); } };
      const pb = el.querySelector('.l-pruefen'); if (pb) pb.onclick = ctl.pruefen;
      if (erledigt) feedback();
      return ctl;
    }

    if (it.art === 'zuordnen') {
      let gewaehlt = null;
      const zeichnen = () => {
        const frei = st.pool.filter(ri => !Object.values(st.zu).includes(ri));
        el.innerHTML = `<div class="quizfrage zuordnen">${kopf(it, ctx)}<div class="frage">${nr}${I(it.titel)}</div>
          <p class="tipp">Ziehe die Begriffe rechts in die Felder – oder tippe erst einen Begriff, dann ein Feld.</p>
          <div class="zo-raster">${st.auswahl.map(li => { const ri = st.zu[li]; return `<div class="zo-zeile"><div class="zo-l">${I(it.paare[li].l)}</div><div class="zo-slot ${ri !== undefined ? 'voll' : ''}" data-li="${li}">${ri !== undefined ? `<span class="zo-chip gesetzt" data-ri="${ri}">${I(it.paare[ri].r)}</span>` : '<span class="zo-platz">hierher</span>'}</div></div>`; }).join('')}</div>
          <div class="zo-pool">${frei.map(ri => `<span class="zo-chip ${gewaehlt === ri ? 'sel' : ''}" draggable="true" data-ri="${ri}" tabindex="0">${I(it.paare[ri].r)}</span>`).join('') || '<span class="tipp">Alle verteilt.</span>'}</div>
          ${!pr ? '<div class="lesen-fuss klein"><button class="glas knopf primär z-pruefen">Prüfen (Enter)</button></div>' : ''}<div class="erklaerung" hidden></div></div>`;
        if (erledigt) { feedback(); return; }
        el.querySelectorAll('.zo-pool .zo-chip').forEach(c => {
          c.onclick = () => { gewaehlt = gewaehlt === +c.dataset.ri ? null : +c.dataset.ri; ton('klick'); zeichnen(); };
          c.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.click(); } };
          c.ondragstart = e => { e.dataTransfer.setData('text/plain', c.dataset.ri); e.dataTransfer.effectAllowed = 'move'; };
        });
        el.querySelectorAll('.zo-slot').forEach(s => {
          const li = +s.dataset.li;
          s.onclick = () => {
            if (gewaehlt !== null) { setze(li, gewaehlt); gewaehlt = null; }
            else if (st.zu[li] !== undefined) { delete st.zu[li]; }
            ton('klick'); zeichnen(); if (ctx.geaendert) ctx.geaendert();
          };
          s.ondragover = e => { e.preventDefault(); s.classList.add('drueber'); };
          s.ondragleave = () => s.classList.remove('drueber');
          s.ondrop = e => { e.preventDefault(); const ri = +e.dataTransfer.getData('text/plain'); if (!isNaN(ri)) { setze(li, ri); gewaehlt = null; zeichnen(); if (ctx.geaendert) ctx.geaendert(); } };
        });
        const pb = el.querySelector('.z-pruefen'); if (pb) pb.onclick = ctl.pruefen;
      };
      const setze = (li, ri) => { for (const k of Object.keys(st.zu)) if (st.zu[k] === ri) delete st.zu[k]; st.zu[li] = ri; };
      const feedback = () => {
        el.querySelectorAll('.zo-slot').forEach(s => {
          const li = +s.dataset.li, ri = st.zu[li], ok = ri !== undefined && it.paare[ri].r === it.paare[li].r;
          s.classList.add(ok ? 'ok' : 'nein');
          if (!ok) s.insertAdjacentHTML('beforeend', `<span class="l-loesung">${I(it.paare[li].r)}</span>`);
        });
        const pb = el.querySelector('.z-pruefen'); if (pb) pb.remove();
      };
      ctl.pruefen = () => { if (erledigt || pr) return; const r = auswerten(it, st); erledigt = true; zeichnen(); ton(r.punkte === r.max ? 'gut' : 'schlecht'); zeigeErgebnis(r); };
      zeichnen();
      return ctl;
    }

    if (it.art === 'reihenfolge') {
      let ziehe = null;
      const zeichnen = () => {
        el.innerHTML = `<div class="quizfrage reihenfolge">${kopf(it, ctx)}<div class="frage">${nr}${I(it.titel)}</div>
          <p class="tipp">Bringe die Schritte in die richtige Reihenfolge (ziehen oder Pfeile).</p>
          <ol class="rf-liste">${st.ord.map((o, i) => `<li class="rf-zeile ${erledigt ? (it.schritte[o] === it.schritte[i] ? 'ok' : 'nein') : ''}" draggable="${!erledigt}" data-i="${i}"><span class="rf-griff" aria-hidden="true">⠿</span><span class="rf-text">${I(it.schritte[o])}</span>${erledigt ? '' : `<span class="rf-pfeile"><button class="glas mini" data-hoch="${i}" ${i ? '' : 'disabled'} aria-label="nach oben">▲</button><button class="glas mini" data-runter="${i}" ${i < st.ord.length - 1 ? '' : 'disabled'} aria-label="nach unten">▼</button></span>`}</li>`).join('')}</ol>
          ${!pr && !erledigt ? '<div class="lesen-fuss klein"><button class="glas knopf primär r-pruefen">Prüfen (Enter)</button></div>' : ''}
          ${erledigt && auswerten(it, st).punkte < it.schritte.length ? `<div class="erklaerung">Richtig wäre:${loesungHtml(it)}</div>` : ''}</div>`;
        if (erledigt) return;
        const tausch = (a, b) => { [st.ord[a], st.ord[b]] = [st.ord[b], st.ord[a]]; st.bewegt = true; ton('klick'); zeichnen(); if (ctx.geaendert) ctx.geaendert(); };
        el.querySelectorAll('[data-hoch]').forEach(b => b.onclick = () => tausch(+b.dataset.hoch, +b.dataset.hoch - 1));
        el.querySelectorAll('[data-runter]').forEach(b => b.onclick = () => tausch(+b.dataset.runter, +b.dataset.runter + 1));
        el.querySelectorAll('.rf-zeile').forEach(z => {
          z.ondragstart = e => { ziehe = +z.dataset.i; e.dataTransfer.setData('text/plain', z.dataset.i); };
          z.ondragover = e => { e.preventDefault(); z.classList.add('drueber'); };
          z.ondragleave = () => z.classList.remove('drueber');
          z.ondrop = e => { e.preventDefault(); const von = ziehe, nach = +z.dataset.i; if (von === null || von === nach) return; const [x] = st.ord.splice(von, 1); st.ord.splice(nach, 0, x); st.bewegt = true; ziehe = null; zeichnen(); if (ctx.geaendert) ctx.geaendert(); };
        });
        const pb = el.querySelector('.r-pruefen'); if (pb) pb.onclick = ctl.pruefen;
      };
      ctl.pruefen = () => { if (erledigt || pr) return; st.bewegt = true; const r = auswerten(it, st); erledigt = true; zeichnen(); ton(r.punkte === r.max ? 'gut' : 'schlecht'); zeigeErgebnis(r); };
      zeichnen();
      return ctl;
    }

    if (it.art === 'freitext') {
      el.innerHTML = `<div class="quizfrage freitext">${kopf(it, ctx)}<div class="frage">${nr}${I(it.frage)} <span class="p-chip">${fmtP(it.punkte)} P</span></div>
        <textarea class="ft-text" rows="5" placeholder="Deine Antwort (Stichpunkte reichen – wie in der IHK-Prüfung)">${E(st.text || '')}</textarea>
        ${!pr ? '<div class="lesen-fuss klein"><button class="glas knopf primär f-zeigen">Musterlösung zeigen & bewerten</button></div>' : ''}<div class="ft-bewertung"></div></div>`;
      const ta = el.querySelector('.ft-text');
      ta.oninput = () => { st.text = ta.value; if (ctx.geaendert) ctx.geaendert(); };
      const bew = el.querySelector('.ft-bewertung');
      const zeigen = () => {
        ta.readOnly = true;
        bew.innerHTML = loesungHtml(it) + selbstHtml(it, st);
        selbstBinden(it, st, bew, () => { const r = auswerten(it, st); if (r.punkte !== null && !erledigt) { ton(r.punkte >= r.max / 2 ? 'gut' : 'schlecht'); zeigeErgebnis(r); bew.querySelector('.sb-info').textContent = `${fmtP(r.punkte)} von ${fmtP(r.max)} Punkten verbucht.`; } });
        const b = el.querySelector('.f-zeigen'); if (b) b.remove();
      };
      ctl.pruefen = () => { if (!pr && !erledigt) zeigen(); };
      const b = el.querySelector('.f-zeigen'); if (b) b.onclick = zeigen;
      if (erledigt) zeigen();
      return ctl;
    }

    if (it.art === 'szenario') {
      el.innerHTML = `<div class="quizfrage szenario">${kopf(it, ctx)}<div class="frage">${nr}Fall: ${I(it.titel)} <span class="p-chip">${fmtP(it.punkte)} P</span></div>
        ${it.lage ? `<div class="sz-lage">${Parser.md(it.lage)}</div>` : ''}
        ${it.fragen.map((f, i) => `<div class="sz-frage"><b>${i + 1}. ${I(f.f)}</b><textarea class="sz-text" data-i="${i}" rows="3" placeholder="Deine Antwort">${E(st.txt[i] || '')}</textarea></div>`).join('')}
        ${!pr ? '<div class="lesen-fuss klein"><button class="glas knopf primär s-zeigen">Lösungen zeigen & bewerten</button></div>' : ''}<div class="ft-bewertung"></div></div>`;
      el.querySelectorAll('.sz-text').forEach(t => t.oninput = () => { st.txt[t.dataset.i] = t.value; if (ctx.geaendert) ctx.geaendert(); });
      const bew = el.querySelector('.ft-bewertung');
      const zeigen = () => {
        el.querySelectorAll('.sz-text').forEach(t => t.readOnly = true);
        bew.innerHTML = selbstHtml(it, st);
        selbstBinden(it, st, bew, () => { const r = auswerten(it, st); if (r.punkte !== null && !erledigt) { ton(r.punkte >= r.max / 2 ? 'gut' : 'schlecht'); zeigeErgebnis(r); bew.querySelector('.sb-info').textContent = `${fmtP(r.punkte)} von ${fmtP(r.max)} Punkten verbucht.`; } });
        const b = el.querySelector('.s-zeigen'); if (b) b.remove();
      };
      ctl.pruefen = () => { if (!pr && !erledigt) zeigen(); };
      const b = el.querySelector('.s-zeigen'); if (b) b.onclick = zeigen;
      if (erledigt) zeigen();
      return ctl;
    }
    el.innerHTML = '<p class="leer">Unbekannte Aufgabenart.</p>';
    return ctl;
  }

  // ---------- Selbstbewertung (Freitext/Szenario) ----------
  function selbstHtml(it, st) {
    if (it.art === 'freitext') {
      const P = it.punkte, stufen = P <= 12 ? Array.from({ length: Math.round(P * 2) + 1 }, (_, i) => i / 2).filter(x => P <= 6 || Number.isInteger(x)) : null;
      return `<div class="selbst"><div class="sb-titel">Wie viele Punkte gibst du dir? <small>Vergleiche ehrlich mit der Musterlösung – die IHK bewertet Fachbegriffe und Begründungen.</small></div>
        ${stufen ? `<div class="sb-knoepfe">${stufen.map(x => `<button class="glas knopf sb ${st.selbst === x ? 'an' : ''}" data-p="${x}">${fmtP(x)}</button>`).join('')}</div>` : `<input type="number" class="sb-zahl" min="0" max="${P}" step="0.5" value="${st.selbst ?? ''}"> / ${fmtP(P)}`}
        <div class="sb-info tipp"></div></div>`;
    }
    return `<div class="selbst">${it.fragen.map((f, i) => `<div class="sz-l"><div class="muster"><b>${i + 1}. ${I(f.f)}</b><br>${I(f.a || '–')}</div>
      <div class="sb-knoepfe">${[[f.punkte, 'Voll'], [f.punkte / 2, 'Teilweise'], [0, 'Nicht gewusst']].map(([p, t]) => `<button class="glas knopf sb ${(st.selbst || {})[i] === p ? 'an' : ''}" data-i="${i}" data-p="${p}">${t} (${fmtP(p)})</button>`).join('')}</div></div>`).join('')}<div class="sb-info tipp"></div></div>`;
  }
  function selbstBinden(it, st, root, geaendert) {
    root.querySelectorAll('.sb').forEach(b => b.onclick = () => {
      if (it.art === 'freitext') { st.selbst = +b.dataset.p; root.querySelectorAll('.sb').forEach(x => x.classList.toggle('an', x === b)); }
      else { st.selbst = st.selbst || {}; st.selbst[b.dataset.i] = +b.dataset.p; root.querySelectorAll(`.sb[data-i="${b.dataset.i}"]`).forEach(x => x.classList.toggle('an', x === b)); }
      ton('klick'); geaendert();
    });
    const z = root.querySelector('.sb-zahl');
    if (z) z.onchange = () => { const v = Math.max(0, Math.min(it.punkte, parseFloat(z.value.replace(',', '.')) || 0)); st.selbst = v; geaendert(); };
  }

  return { ARTEN, itemsVon, alle, nachId, render, auswerten, verbuchen, loesungHtml, selbstHtml, selbstBinden, selbstbewertet, normal, gleich, fmtP, vorbereiten };
})();
window.Formen = Formen;
