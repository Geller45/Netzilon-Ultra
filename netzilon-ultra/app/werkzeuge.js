// Netzilon Ultra – Suche, Befehlsreferenz (Rechner: rechner.js)
const Werkzeuge = (() => {
  // ================= SUCHE =================
  const SYN = [
    ['gpo', 'gruppenrichtlinie', 'gruppenrichtlinien', 'group policy', 'richtlinie'],
    ['dc', 'domänencontroller', 'domaenencontroller', 'domain controller'],
    ['ad', 'active directory', 'adds', 'ad ds', 'verzeichnisdienst'],
    ['adcs', 'ad cs', 'zertifizierungsstelle', 'ca', 'pki', 'zertifikat', 'zertifikate'],
    ['adfs', 'ad fs', 'verbunddienste', 'federation'],
    ['dns', 'namensauflösung', 'nameserver', 'namensaufloesung'],
    ['dhcp', 'ip-vergabe', 'adressvergabe'],
    ['usv', 'ups', 'unterbrechungsfreie stromversorgung'],
    ['raid', 'festplattenverbund', 'spiegelung'],
    ['vlan', '802.1q', 'tagging', 'trunk'],
    ['vpn', 'tunnel', 'ipsec', 'l2tp', 'sstp', 'ikev2'],
    ['nps', 'radius', '802.1x'],
    ['ps', 'powershell', 'cmdlet'],
    ['cmd', 'eingabeaufforderung', 'kommandozeile'],
    ['hyper-v', 'hyperv', 'virtualisierung', 'vm', 'virtuelle maschine'],
    ['subnetz', 'subnetting', 'subnetzmaske', 'netzmaske', 'cidr', 'vlsm'],
    ['mac', 'mac-adresse', 'hardwareadresse'],
    ['ntfs', 'berechtigungen', 'rechte', 'acl'],
    ['freigabe', 'share', 'smb', 'freigaben'],
    ['kerberos', 'ticket', 'tgt', 'kdc'],
    ['fsmo', 'betriebsmaster', 'pdc-emulator', 'rid-master'],
    ['rodc', 'schreibgeschützter domänencontroller'],
    ['backup', 'datensicherung', 'sicherung'],
    ['firewall', 'paketfilter'],
    ['osi', 'schichtenmodell', 'iso/osi'],
    ['ram', 'arbeitsspeicher', 'speicher'],
    ['cpu', 'prozessor'],
    ['entra', 'azure ad', 'aad', 'entra id'],
    ['wac', 'windows admin center'],
    ['dfs', 'dfsr', 'verteiltes dateisystem'],
    ['ha', 'hochverfügbarkeit', 'cluster', 'failover'],
    ['dsgvo', 'datenschutz', 'gdpr'],
    ['sla', 'service level agreement', 'dienstgütevereinbarung'],
    ['switch', 'layer 2', 'l2'],
    ['router', 'routing', 'layer 3', 'gateway'],
    ['sql', 'datenbank', 'datenbanken', 'select', 'abfrage'],
    ['linux', 'bash', 'shell', 'gnu'],
    ['chmod', 'rechte', 'permissions', 'dateirechte'],
    ['ccna', 'cisco', 'ios'],
    ['ospf', 'routingprotokoll', 'link state'],
    ['stp', 'spanning tree', 'rstp'],
    ['nat', 'pat', 'adressumsetzung'],
    ['wiso', 'wirtschaft', 'sozialkunde'],
    ['kalkulation', 'bezugskalkulation', 'handelskalkulation', 'preis'],
    ['netzplan', 'kritischer pfad', 'faz', 'fez', 'puffer'],
    ['azure', 'cloud', 'iaas', 'paas', 'saas'],
    ['dp-203', 'synapse', 'data factory', 'databricks']
  ];
  const norm = s => s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
  const tok = s => norm(s).split(/[^a-z0-9.\-]+/).map(t => t.replace(/^[.\-]+|[.\-]+$/g, '')).filter(t => t.length > 1);
  const synMap = new Map();
  for (const g of SYN) { const ng = g.map(norm); for (const w of ng) synMap.set(w, ng); }

  let chunks = [], index = new Map(), vocab = [];
  function aufbauen() {
    chunks = []; index = new Map();
    const add = (ci, text, w) => { for (const t of tok(text)) { let m = index.get(t); if (!m) index.set(t, m = new Map()); m.set(ci, (m.get(ci) || 0) + w); } };
    for (const d of S.docs) {
      const ci0 = chunks.length;
      chunks.push({ d, sek: null, sub: null, text: d.titel + ' – ' + d.kapitel });
      add(ci0, d.titel, 12); add(ci0, d.kapitel + ' ' + d.bereich, 3);
      for (const [sek, inhalt] of Object.entries(d.sections)) {
        for (const teil of inhalt.split(/^(?=###\s)/m)) {
          const hm = teil.match(/^###\s+(.+)/), sub = hm ? hm[1].trim() : null;
          const text = teil.replace(/^###.*\n?/, '');
          if (!text.trim() && !sub) continue;
          const ci = chunks.length;
          chunks.push({ d, sek, sub, text });
          if (sub) add(ci, sub, 6);
          add(ci, d.titel, 2);
          add(ci, text, 1);
        }
      }
    }
    vocab = [...index.keys()];
  }
  function lev(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i]; let min = i;
      for (let j = 1; j <= b.length; j++) { cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); min = Math.min(min, cur[j]); }
      if (min > max) return max + 1; prev = cur;
    }
    return prev[b.length];
  }
  function begriffe(t) { // liefert Map term -> faktor
    const out = new Map();
    const push = (x, f) => { if (index.has(x)) out.set(x, Math.max(out.get(x) || 0, f)); };
    push(t, 1);
    for (const v of vocab) if (v !== t && v.startsWith(t) && t.length >= 2) push(v, t.length >= 4 ? 0.7 : 0.4);
    const syn = synMap.get(t) || [];
    for (const s of syn) for (const st of tok(s)) push(st, 0.8);
    if (out.size < 3 && t.length >= 4) { const max = t.length >= 7 ? 2 : 1; for (const v of vocab) if (lev(t, v, max) <= max) push(v, 0.5); }
    return out;
  }
  function suchen(q, bereich) {
    const phrase = norm(q).trim(), tokens = tok(q);
    if (!tokens.length) return [];
    const score = new Map(), treffer = new Map();
    tokens.forEach((t, ti) => {
      for (const [term, f] of begriffe(t)) for (const [ci, w] of index.get(term)) {
        score.set(ci, (score.get(ci) || 0) + w * f);
        const s = treffer.get(ci) || new Set(); s.add(ti); treffer.set(ci, s);
      }
    });
    let res = [...score.entries()].map(([ci, sc]) => {
      const c = chunks[ci], alle = treffer.get(ci).size === tokens.length;
      if (tokens.length > 1 && norm(c.text + ' ' + (c.sub || '')).includes(phrase)) sc *= 2;
      return { c, sc: sc * (alle ? 3 : 1), alle };
    }).filter(r => !bereich || r.c.d.bereich === bereich);
    if (res.some(r => r.alle)) res = res.filter(r => r.alle);
    res.sort((a, b) => b.sc - a.sc);
    const seen = new Set(), out = [];
    for (const r of res) { const k = r.c.d.id + '|' + r.c.sek + '|' + r.c.sub; if (seen.has(k)) continue; seen.add(k); out.push(r); if (out.length >= 80) break; }
    return out;
  }
  function snippet(text, tokens) {
    const clean = text.replace(/[#*`>|]/g, ' ').replace(/\s+/g, ' ').trim(), n = norm(clean);
    let pos = -1; for (const t of tokens) { pos = n.indexOf(t.slice(0, Math.max(3, t.length - 1))); if (pos >= 0) break; }
    const st = Math.max(0, pos - 70), s = (st ? '…' : '') + clean.slice(st, st + 220) + (clean.length > st + 220 ? '…' : '');
    return markieren(E(s), tokens);
  }
  function markieren(html, tokens) {
    const muster = tokens.filter(t => t.length >= 2).map(t => t.slice(0, Math.max(3, t.length - 1)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .map(t => t.replace(/ae/g, '(?:ae|ä)').replace(/oe/g, '(?:oe|ö)').replace(/ue/g, '(?:ue|ü)').replace(/ss/g, '(?:ss|ß)'));
    if (!muster.length) return html;
    const re = new RegExp(`(${muster.join('|')})`, 'gi');
    return html.split(/(<[^>]+>)/).map(p => p.startsWith('<') ? p : p.replace(re, '<mark>$1</mark>')).join('');
  }
  let letzteSuche = '', letzterBereich = '';
  function suche(q) {
    if (!chunks.length) aufbauen();
    if (typeof q === 'string') letzteSuche = q;
    krumen([START, { txt: 'Suche' }]);
    $('#inhalt').innerHTML = `<h1>Suche</h1>
      <input type="text" id="s-feld" placeholder="Begriff, Befehl, Port, Abkürzung … z. B. „gpo loopback“, „port 389“, „kerbros“" value="${E(letzteSuche)}" autocomplete="off">
      <div class="filterleiste" id="s-filter"><button class="glas knopf ${letzterBereich ? '' : 'an'}" data-b="">Alles</button>${BEREICHE.filter(b => docsIn(b.key).length).map(b => `<button class="glas knopf ${letzterBereich === b.key ? 'an' : ''}" data-b="${E(b.key)}">${E(b.name)}</button>`).join('')}</div>
      <p class="unter" id="s-info"></p><div id="s-liste"></div>`;
    const feld = $('#s-feld');
    let t;
    const los = () => {
      letzteSuche = feld.value;
      const tokens = tok(feld.value);
      if (!tokens.length) { $('#s-info').textContent = `Tippfehler werden toleriert, Abkürzungen und Synonyme mitgesucht (GPO ↔ Gruppenrichtlinie, DC ↔ Domänencontroller …). ${chunks.length} Abschnitte durchsuchbar.`; $('#s-liste').innerHTML = ''; return; }
      const res = suchen(feld.value, letzterBereich);
      $('#s-info').textContent = res.length ? `${res.length}${res.length >= 80 ? '+' : ''} Treffer` : 'Keine Treffer. Anders schreiben oder weniger Wörter versuchen.';
      $('#s-liste').innerHTML = res.map((r, i) => `<button class="glas treffer" data-i="${i}">
        <b>${markieren(E(r.c.d.titel), tokens)}</b>
        <span class="meta"><span>${E(r.c.d.bereich)}</span><span>${E(r.c.d.kapitel)}</span>${r.c.sek ? `<span>${E(r.c.sek)}${r.c.sub ? ' › ' + markieren(E(r.c.sub), tokens) : ''}</span>` : ''}</span>
        <span class="snip">${snippet(r.c.text, tokens)}</span></button>`).join('');
      document.querySelectorAll('.treffer').forEach(b => b.onclick = () => oeffnen(res[b.dataset.i].c, tokens));
    };
    feld.oninput = () => { clearTimeout(t); t = setTimeout(los, 120); };
    feld.onkeydown = e => { if (e.key === 'Enter') { const f = document.querySelector('.treffer'); if (f) f.click(); } };
    document.querySelectorAll('#s-filter button').forEach(b => b.onclick = () => { letzterBereich = b.dataset.b; document.querySelectorAll('#s-filter button').forEach(x => x.classList.toggle('an', x === b)); los(); });
    feld.focus(); feld.select(); los();
  }
  function oeffnen(c, tokens) {
    if (c.sek === 'Einfach' || c.sek === 'Profi') S.p.einstellungen.modus = c.sek === 'Einfach' ? 'einfach' : 'profi';
    gehe('lesen', c.d.id);
    const art = document.querySelector('.lesen');
    // Markieren im Text
    const walker = document.createTreeWalker(art, NodeFilter.SHOW_TEXT);
    const muster = tokens.map(t => t.slice(0, Math.max(3, t.length - 1)));
    const re = new RegExp(`(${muster.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ae/g, '(?:ae|ä)').replace(/oe/g, '(?:oe|ö)').replace(/ue/g, '(?:ue|ü)').replace(/ss/g, '(?:ss|ß)')).join('|')})`, 'gi');
    const nodes = []; while (walker.nextNode()) if (re.test(walker.currentNode.nodeValue)) nodes.push(walker.currentNode);
    for (const n of nodes) { const span = document.createElement('span'); span.innerHTML = E(n.nodeValue).replace(re, '<mark>$1</mark>'); n.replaceWith(span); }
    let ziel = null;
    if (c.sub) ziel = [...art.querySelectorAll('h3,h4,h5')].find(h => h.textContent.trim() === c.sub.replace(/[*`]/g, '').trim());
    if (!ziel && c.sek) ziel = [...art.querySelectorAll('summary,h2')].find(s => s.textContent.includes(c.sek.split(' ')[0]));
    if (!ziel) ziel = art.querySelector('mark');
    if (ziel) {
      const det = ziel.closest('details'); if (det) det.open = true;
      setTimeout(() => { ziel.scrollIntoView({ behavior: 'smooth', block: 'start' }); ziel.classList.add('blitz'); }, 60);
    }
  }

  // ================= RECHNER =================
  const ip2n = s => { const p = s.trim().split('.').map(Number); if (p.length !== 4 || p.some(x => !Number.isInteger(x) || x < 0 || x > 255)) throw 'Ungültige IPv4-Adresse'; return ((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3]; };
  const n2ip = n => [24, 16, 8, 0].map(s => (n >>> s) & 255).join('.');
  const n2bin = n => [24, 16, 8, 0].map(s => ((n >>> s) & 255).toString(2).padStart(8, '0')).join('.');
  const maske = p => p === 0 ? 0 : (0xFFFFFFFF << (32 - p)) >>> 0;
  function maskeZuPrefix(s) { s = s.trim().replace(/^\//, ''); if (/^\d+$/.test(s)) { const p = +s; if (p < 0 || p > 32) throw 'Präfix 0–32'; return p; } const m = ip2n(s), b = m.toString(2).padStart(32, '0'); if (!/^1*0*$/.test(b)) throw 'Keine gültige Subnetzmaske'; return b.indexOf('0') < 0 ? 32 : b.indexOf('0'); }
  function ipv4(eingabe, mEingabe) {
    let [ip, p] = eingabe.split('/'); p = p !== undefined ? maskeZuPrefix(p) : maskeZuPrefix(mEingabe || '24');
    const a = ip2n(ip), m = maske(p), net = (a & m) >>> 0, bc = (net | ~m) >>> 0;
    const hosts = p >= 31 ? (p === 31 ? 2 : 1) : 2 ** (32 - p) - 2;
    const o1 = a >>> 24, klasse = o1 < 128 ? 'A' : o1 < 192 ? 'B' : o1 < 224 ? 'C' : o1 < 240 ? 'D (Multicast)' : 'E';
    const privat = (a >>> 24) === 10 || (a >>> 20) === 0xAC1 || (a >>> 16) === 0xC0A8 ? 'privat (RFC 1918)' : (a >>> 24) === 127 ? 'Loopback' : (a >>> 16) === 0xA9FE ? 'APIPA (169.254/16)' : 'öffentlich';
    return [['Adresse', `${n2ip(a)}`, n2bin(a)], ['Subnetzmaske', `${n2ip(m)} = /${p}`, n2bin(m)], ['Wildcard', n2ip(~m >>> 0), ''], ['Netzadresse', n2ip(net), n2bin(net)], ['Broadcast', n2ip(bc), n2bin(bc)],
      ['Erster Host', p >= 31 ? n2ip(net) : n2ip(net + 1), ''], ['Letzter Host', p >= 31 ? n2ip(bc) : n2ip(bc - 1), ''], ['Nutzbare Hosts', `2^${32 - p} − 2 = ${hosts.toLocaleString('de-DE')}`, ''], ['Klasse / Typ', `${klasse} · ${privat}`, '']];
  }
  function vlsm(netz, liste) {
    let [ip, p] = netz.split('/'); p = maskeZuPrefix(p || '24');
    const start = (ip2n(ip) & maske(p)) >>> 0, ende = start + 2 ** (32 - p);
    const bed = liste.split(/[,;\s]+/).filter(Boolean).map((x, i) => { const m = x.match(/^(?:([^=:]+)[=:])?(\d+)$/); if (!m) throw `Eintrag „${x}“ unklar (Format: Name=Hosts oder nur Hosts)`; return { name: m[1] || `Netz ${i + 1}`, h: +m[2] }; });
    bed.sort((a, b) => b.h - a.h);
    let pos = start; const out = [];
    for (const b of bed) {
      let hb = 2; while (2 ** hb - 2 < b.h) hb++;
      const pp = 32 - hb, gr = 2 ** hb;
      pos = Math.ceil((pos - start) / gr) * gr + start;
      if (pos + gr > ende) throw `Kein Platz mehr für ${b.name} (${b.h} Hosts)`;
      out.push([b.name, b.h, `${n2ip(pos)}/${pp}`, n2ip(maske(pp)), `${n2ip(pos + 1)} – ${n2ip(pos + gr - 2)}`, n2ip(pos + gr - 1), gr - 2]);
      pos += gr;
    }
    return { out, frei: ende - pos };
  }
  // IPv6 mit BigInt
  function v6parse(s) {
    s = s.trim().toLowerCase(); if (!/^[0-9a-f:]+$/.test(s) || (s.match(/::/g) || []).length > 1) throw 'Ungültige IPv6-Adresse';
    let [l, r] = s.split('::'); const L = l ? l.split(':') : [], R = r !== undefined ? (r ? r.split(':') : []) : [];
    const fehlend = 8 - L.length - R.length; if (r === undefined && L.length !== 8 || fehlend < 0) throw 'Ungültige IPv6-Adresse (8 Blöcke nötig)';
    const bl = [...L, ...Array(r !== undefined ? fehlend : 0).fill('0'), ...R];
    if (bl.some(b => !b || b.length > 4)) throw 'Blöcke max. 4 Hex-Ziffern';
    return bl.reduce((n, b) => (n << 16n) + BigInt('0x' + b), 0n);
  }
  const v6voll = n => Array.from({ length: 8 }, (_, i) => ((n >> BigInt(112 - 16 * i)) & 0xFFFFn).toString(16).padStart(4, '0')).join(':');
  function v6kurz(n) {
    const bl = v6voll(n).split(':').map(b => b.replace(/^0+(?=.)/, ''));
    let best = [-1, 0], cur = [-1, 0];
    bl.forEach((b, i) => { if (b === '0') { if (cur[0] < 0) cur = [i, 0]; cur[1]++; if (cur[1] > best[1]) best = [...cur]; } else cur = [-1, 0]; });
    if (best[1] < 2) return bl.join(':');
    const l = bl.slice(0, best[0]).join(':'), r = bl.slice(best[0] + best[1]).join(':');
    return `${l}::${r}`;
  }
  function ipv6(e, neu, anzahl) {
    let [a, p] = e.split('/'); p = p === undefined ? 64 : +p; if (!(p >= 0 && p <= 128)) throw 'Präfix 0–128';
    const n = v6parse(a), m = p === 0 ? 0n : ((1n << 128n) - 1n) ^ ((1n << BigInt(128 - p)) - 1n), net = n & m;
    const zeilen = [['Voll', v6voll(n)], ['Gekürzt', v6kurz(n)], ['Präfix (Netz)', `${v6kurz(net)}/${p}`], ['Interface-ID-Bits', `${128 - p}`], ['Adressen im Netz', `2^${128 - p}`], ['/64-Netze darin', p <= 64 ? `2^${64 - p} = ${(2n ** BigInt(64 - p)).toLocaleString('de-DE')}` : '–']];
    let subs = [];
    if (neu && +neu > p && +neu <= 128) {
      const np = +neu, schritt = 1n << BigInt(128 - np), max = 2n ** BigInt(np - p);
      zeilen.push(['Teilnetze /' + np, `2^${np - p} = ${max.toLocaleString('de-DE')}`]);
      for (let i = 0n; i < BigInt(Math.min(+anzahl || 8, 256)) && i < max; i++) subs.push(`${v6kurz(net + i * schritt)}/${np}`);
    }
    return { zeilen, subs };
  }
  function zahl(w, basis) {
    w = w.trim().replace(/\s|_/g, '').replace(/^0x/i, '').replace(/^0b/i, ''); if (!w) throw 'Wert fehlt';
    const ziff = '0123456789abcdef'.slice(0, basis); if (![...w.toLowerCase()].every(c => ziff.includes(c))) throw `Ungültige Ziffer für Basis ${basis}`;
    let n = 0n; for (const c of w.toLowerCase()) n = n * BigInt(basis) + BigInt(ziff.indexOf(c));
    const bin = n.toString(2), gr = (s, k) => s.padStart(Math.ceil(s.length / k) * k, '0').match(new RegExp(`.{${k}}`, 'g')).join(' ');
    return [['Dezimal', n.toLocaleString('de-DE')], ['Binär', gr(bin, 4)], ['Hexadezimal', n.toString(16).toUpperCase()], ['Oktal', n.toString(8)], ['Bits nötig', String(bin.length)], ['Bytes', String(Math.ceil(bin.length / 8))]];
  }

  // ================= BEFEHLSREFERENZ =================
  function befehle(kat = '') {
    krumen([START, { txt: 'Befehle' }]);
    const alle = [];
    for (const d of S.docs) for (const b of d.befehle) alle.push({ ...b, d, kat: d.typ === 'referenz' ? d.titel : 'Aus Themen' });
    const kats = [...new Set(alle.map(b => b.kat))];
    $('#inhalt').innerHTML = `<h1>Befehlsreferenz</h1>
      <input type="text" id="b-feld" placeholder="Filtern … z. B. „ipconfig“, „vlan“, „Get-AD“, „443“" autocomplete="off">
      <div class="filterleiste" id="b-kat"><button class="glas knopf ${kat ? '' : 'an'}" data-k="">Alle (${alle.length})</button>${kats.map(k => `<button class="glas knopf ${k === kat ? 'an' : ''}" data-k="${E(k)}">${E(k)} (${alle.filter(b => b.kat === k).length})</button>`).join('')}</div>
      <div id="b-liste"></div>`;
    let aktiv = kat;
    const los = () => {
      const q = norm($('#b-feld').value.trim());
      const l = alle.filter(b => (!aktiv || b.kat === aktiv) && (!q || norm(b.befehl + ' ' + b.text + ' ' + b.d.titel).includes(q))).slice(0, 400);
      $('#b-liste').innerHTML = l.length ? `<div class="tablewrap"><table class="befehle"><thead><tr><th>Befehl</th><th>Erklärung</th><th>Thema</th></tr></thead><tbody>${l.map((b, i) => `<tr><td><code>${E(b.befehl)}</code> <button class="mini-copy" data-i="${i}" title="Kopieren">⧉</button></td><td>${Parser.inline(b.text)}</td><td><a class="verweis" data-go="lesen" data-param="${E(b.d.id)}">${E(b.d.titel)}</a></td></tr>`).join('')}</tbody></table></div>` : '<p class="leer">Nichts gefunden.</p>';
      document.querySelectorAll('.mini-copy').forEach(c => c.onclick = () => { navigator.clipboard.writeText(l[c.dataset.i].befehl); toast('Kopiert.'); });
    };
    $('#b-feld').oninput = los;
    document.querySelectorAll('#b-kat button').forEach(b => b.onclick = () => { aktiv = b.dataset.k; S.ansicht.param = aktiv; document.querySelectorAll('#b-kat button').forEach(x => x.classList.toggle('an', x === b)); los(); });
    $('#b-feld').focus(); los();
  }

  document.addEventListener('keydown', e => {
    if (e.ctrlKey && (e.key === 'k' || e.key === 'K' || e.key === 'f' || e.key === 'F')) { e.preventDefault(); gehe('suche'); }
  });
  window.VIEWS = Object.assign(window.VIEWS || {}, { suche, befehle });
  return { aufbauen, ipv4, vlsm, ipv6, zahl, ip2n, n2ip, n2bin, maske, maskeZuPrefix, v6parse, v6voll, v6kurz, norm, markieren };
})();
