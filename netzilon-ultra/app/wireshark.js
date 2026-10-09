// Netzilon Ultra 2.5 – Wireshark-Simulator: deterministisch erzeugte Mitschnitte mit echten Bytes (Ethernet/IP/TCP/UDP korrekt
// inkl. Prüfsummen), Paketliste mit Wireshark-Farben, Anzeigefilter-Parser, aufklappbare Schichten, Hex-/ASCII-Ansicht mit
// Feldmarkierung, „Follow TCP Stream“, Protokollhierarchie, Aufgaben und Anbindung an den Netzwerk-Simulator.
const Wireshark = (() => {
  const istObj = o => o && typeof o === 'object' && !Array.isArray(o);
  // ---------- Byte-Helfer ----------
  const u16 = n => [(n >> 8) & 255, n & 255], u32 = n => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  const ipB = s => s.split('.').map(Number), macB = s => s.split(':').map(h => parseInt(h, 16));
  const txtB = s => [...new TextEncoder().encode(s)];
  const hex = (n, l = 4) => '0x' + n.toString(16).padStart(l, '0');
  const pruefsumme = a => { let s = 0; for (let i = 0; i < a.length; i += 2) s += (a[i] << 8) + (a[i + 1] || 0); while (s >>> 16) s = (s & 0xffff) + (s >>> 16); return (~s) & 0xffff; };
  function zufall(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  let rnd = zufall(1);
  const zb = n => Array.from({ length: n }, () => Math.floor(rnd() * 256));
  // Schicht mit Feldern (Offsets relativ zur Schicht)
  function Sch(n) { return { n, b: [], f: [], add(t, by, sub) { this.f.push({ t, o: this.b.length, l: by.length, sub }); this.b.push(...by); return this.f.length - 1; }, setze(i, by, t) { const f = this.f[i]; this.b.splice(f.o, by.length, ...by); if (t) f.t = t; } }; }
  // ASN.1/DER-Mini-Encoder (Kerberos, LDAP)
  const derLen = n => n < 128 ? [n] : n < 256 ? [0x81, n] : [0x82, n >> 8, n & 255];
  const der = (tag, inhalt) => [tag, ...derLen(inhalt.length), ...inhalt];
  const dInt = n => der(0x02, n < 128 ? [n] : n < 32768 ? u16(n) : u32(n));
  const dStr = (s, tag = 0x1b) => der(tag, txtB(s));
  const seq = (...xs) => der(0x30, xs.flat());
  const ctx = (i, x) => der(0xa0 + i, x);
  function finde(b, nadel) { outer: for (let i = 0; i <= b.length - nadel.length; i++) { for (let j = 0; j < nadel.length; j++) if (b[i + j] !== nadel[j]) continue outer; return i; } return -1; }
  function asnSch(name, bytes, felder) { const s = Sch(name); s.b = bytes; s.f = felder.map(([t, nadel]) => { const o = nadel ? finde(bytes, nadel) : 0; return { t, o: Math.max(0, o), l: nadel && o >= 0 ? nadel.length : 0 }; }); return s; }

  // ---------- Hosts ----------
  const HER = { '00:15:5d': 'Microsof', '08:00:27': 'PcsCompu', '00:1b:54': 'Cisco', '02:00:00': 'Netsim' };
  const H = {
    cli: { n: 'PC-HH-042', mac: '00:15:5d:0a:01:2a', ip: '10.0.0.142' }, dc: { n: 'DC01', mac: '00:15:5d:0a:00:0a', ip: '10.0.0.10' },
    fs: { n: 'FS01', mac: '00:15:5d:0a:00:14', ip: '10.0.0.20' }, web: { n: 'WEB01', mac: '00:15:5d:0a:00:1e', ip: '10.0.0.30' },
    gw: { n: 'Router', mac: '00:1b:54:3c:4d:01', ip: '10.0.0.1' }, ang: { n: 'Angreifer', mac: '08:00:27:6e:13:37', ip: '10.0.0.66' },
    pc2: { n: 'PC-HH-017', mac: '00:15:5d:0a:01:11', ip: '10.0.0.117' }
  };
  const BC = 'ff:ff:ff:ff:ff:ff';
  const macName = m => m === BC ? 'Broadcast' : m === '00:00:00:00:00:00' ? '00:00:00_00:00:00' : (HER[m.slice(0, 8)] || m.slice(0, 8)) + '_' + m.slice(9);

  // ---------- Paket-Erzeugung ----------
  let liste = [], zeit = 0, stromNr = -1;
  function neu() { liste = []; zeit = 0; stromNr = -1; rnd = zufall(4711); }
  function rahmen(dt, schs, m) {
    zeit += dt;
    const nr = liste.length + 1; let o = 0; const layers = [], bytes = [];
    for (const s of schs) { layers.push({ n: s.n, o, l: s.b.length, f: s.f.map(f => ({ ...f, o: f.o + o })) }); bytes.push(...s.b); o += s.b.length; }
    if (bytes.length < 60) { const pad = 60 - bytes.length; layers[0].f.push({ t: `Padding: ${'00'.repeat(Math.min(pad, 8))}${pad > 8 ? '…' : ''} (${pad} Bytes, auf Mindestlänge 60 aufgefüllt)`, o: bytes.length, l: pad }); bytes.push(...new Array(pad).fill(0)); layers[0].l = bytes.length; }
    const protos = ['eth', 'ethertype', ...m.protos];
    const p = { nr, zeit: +zeit.toFixed(6), quelle: m.q, ziel: m.z, proto: m.proto, len: bytes.length, info: m.info, bytes, strom: m.strom, app: m.app || null, dir: m.dir, farbe: m.farbe || m.proto.toLowerCase(), protos: new Set(protos), v: Object.assign({ 'frame.number': nr, 'frame.len': bytes.length }, m.v) };
    layers.unshift({ n: `Frame ${nr}: ${bytes.length} Bytes auf der Leitung (${bytes.length * 8} Bit), ${bytes.length} Bytes mitgeschnitten`, o: 0, l: bytes.length, f: [
      { t: `Ankunftszeit: 09.10.2026 08:00:${(zeit).toFixed(6).padStart(9, '0')}`, o: 0, l: 0 }, { t: `Zeit seit erstem Paket: ${p.zeit.toFixed(6)} s`, o: 0, l: 0 },
      { t: `Frame-Nummer: ${nr}`, o: 0, l: 0 }, { t: `Frame-Länge: ${bytes.length} Bytes`, o: 0, l: 0 }, { t: `[Protokolle im Frame: ${protos.join(':')}]`, o: 0, l: 0 }] });
    p.schichten = layers; liste.push(p); return p;
  }
  function eth(src, dst, typ) {
    const s = Sch(`Ethernet II, Src: ${macName(src)} (${src}), Dst: ${macName(dst)} (${dst})`);
    s.add(`Ziel (Destination): ${macName(dst)} (${dst})`, macB(dst)); s.add(`Quelle (Source): ${macName(src)} (${src})`, macB(src));
    s.add(`Typ: ${typ === 0x0800 ? 'IPv4' : 'ARP'} (${hex(typ)})`, u16(typ)); return s;
  }
  let ipId = 0x3a10;
  function ipv4(src, dst, proto, nutzlast, ttl = 128) {
    const s = Sch(`Internet Protocol Version 4, Src: ${src}, Dst: ${dst}`), len = 20 + nutzlast, id = (ipId += 7) & 0xffff;
    s.add('0100 .... = Version: 4', [0x45], ['.... 0101 = Header Length: 20 Bytes (5)']); s.add('Differentiated Services Field: 0x00 (DSCP: CS0, ECN: Not-ECT)', [0]);
    s.add(`Gesamtlänge (Total Length): ${len}`, u16(len)); s.add(`Identification: ${hex(id)} (${id})`, u16(id));
    s.add(`Flags: 0x2, Don't fragment`, [0x40, 0], ['0... .... = Reserved bit: Not set', '.1.. .... = Don\'t fragment: Set', '..0. .... = More fragments: Not set', 'Fragment Offset: 0']);
    s.add(`Time to Live (TTL): ${ttl}`, [ttl]); s.add(`Protocol: ${{ 1: 'ICMP', 6: 'TCP', 17: 'UDP' }[proto]} (${proto})`, [proto]);
    const ci = s.add('Header Checksum', [0, 0]); s.add(`Quelle (Source Address): ${src}`, ipB(src)); s.add(`Ziel (Destination Address): ${dst}`, ipB(dst));
    const c = pruefsumme(s.b); s.setze(ci, u16(c), `Header Checksum: ${hex(c)} [korrekt]`); return s;
  }
  const pseudo = (src, dst, proto, len) => [...ipB(src), ...ipB(dst), 0, proto, ...u16(len)];
  function udp(src, dst, sp, dp, nl) {
    const s = Sch(`User Datagram Protocol, Src Port: ${sp}, Dst Port: ${dp}`), len = 8 + nl.length;
    s.add(`Quellport (Source Port): ${sp}`, u16(sp)); s.add(`Zielport (Destination Port): ${dp}`, u16(dp)); s.add(`Länge: ${len}`, u16(len));
    const ci = s.add('Checksum', [0, 0]); const c = pruefsumme([...pseudo(src, dst, 17, len), ...s.b, ...nl]) || 0xffff; s.setze(ci, u16(c), `Checksum: ${hex(c)} [korrekt]`); return s;
  }
  const FL = { F: 1, S: 2, R: 4, P: 8, A: 16 };
  const flagTxt = f => ['SYN', 'FIN', 'RST', 'PSH', 'ACK'].filter(x => f.includes(x[0] === 'S' ? 'S' : x === 'FIN' ? 'F' : x === 'RST' ? 'R' : x === 'PSH' ? 'P' : 'A')).sort((a, b) => ['FIN', 'SYN', 'RST', 'PSH', 'ACK'].indexOf(a) - ['FIN', 'SYN', 'RST', 'PSH', 'ACK'].indexOf(b)).join(', ');
  function tcpSch(src, dst, sp, dp, seqA, ackA, seqR, ackR, flags, win, nl) {
    const fl = [...flags].reduce((a, c) => a | FL[c], 0);
    const s = Sch(`Transmission Control Protocol, Src Port: ${sp}, Dst Port: ${dp}, Seq: ${seqR}${flags.includes('A') ? ', Ack: ' + ackR : ''}, Len: ${nl.length}`);
    s.add(`Quellport (Source Port): ${sp}`, u16(sp)); s.add(`Zielport (Destination Port): ${dp}`, u16(dp));
    s.add(`Sequenznummer: ${seqR} (relativ)  [roh: ${seqA}]`, u32(seqA)); s.add(`Bestätigungsnummer (Ack): ${flags.includes('A') ? ackR + ' (relativ)  [roh: ' + ackA + ']' : '0'}`, u32(flags.includes('A') ? ackA : 0));
    const bit = (m, n) => `${(fl & m) ? 'Set' : 'Not set'}`;
    s.add(`0101 .... = Header Length: 20 Bytes (5); Flags: ${hex(fl, 3)} (${flagTxt(flags)})`, [0x50, fl], [`.... ..${(fl & 16) ? 1 : 0}. .... = Acknowledgment: ${bit(16)}`, `.... .... ${(fl & 8) ? 1 : 0}... = Push: ${bit(8)}`, `.... .... .${(fl & 4) ? 1 : 0}.. = Reset: ${bit(4)}`, `.... .... ..${(fl & 2) ? 1 : 0}. = Syn: ${bit(2)}`, `.... .... ...${fl & 1} = Fin: ${bit(1)}`]);
    s.add(`Window: ${win}`, u16(win)); const ci = s.add('Checksum', [0, 0]); s.add('Urgent Pointer: 0', [0, 0]);
    const c = pruefsumme([...pseudo(src, dst, 6, 20 + nl.length), ...s.b, ...nl]); s.setze(ci, u16(c), `Checksum: ${hex(c)} [korrekt]`);
    if (nl.length) s.f.push({ t: `TCP-Nutzdaten (${nl.length} Bytes)`, o: 20, l: nl.length, nurText: true });
    return { s, fl };
  }
  // Pakete auf IP-Ebene
  function ipPaket(dt, a, b, l4proto, l4, app, m, opt = {}) {
    const nl = app ? app.b : [];
    const ip = ipv4(a.ip, b.ip, l4proto, l4.b.length + nl.length, opt.ttl || 128);
    const schs = [eth(opt.sm || a.mac, opt.dm || b.mac, 0x0800), ip, l4]; if (app) schs.push(app);
    return rahmen(dt, schs, Object.assign({ q: a.ip, z: b.ip }, m, { v: Object.assign({ 'eth.src': opt.sm || a.mac, 'eth.dst': opt.dm || b.mac, 'ip.src': a.ip, 'ip.dst': b.ip, 'ip.ttl': opt.ttl || 128, 'ip.proto': l4proto }, m.v || {}) }));
  }
  function arp(dt, von, frage, antwortAn) {
    const s = Sch(`Address Resolution Protocol (${antwortAn ? 'reply' : 'request'})`);
    s.add('Hardware type: Ethernet (1)', [0, 1]); s.add('Protocol type: IPv4 (0x0800)', [8, 0]); s.add('Hardware size: 6', [6]); s.add('Protocol size: 4', [4]);
    s.add(`Opcode: ${antwortAn ? 'reply (2)' : 'request (1)'}`, [0, antwortAn ? 2 : 1]);
    s.add(`Sender MAC address: ${macName(von.mac)} (${von.mac})`, macB(von.mac)); s.add(`Sender IP address: ${von.ip}`, ipB(von.ip));
    const tm = antwortAn ? antwortAn.mac : '00:00:00:00:00:00';
    s.add(`Target MAC address: ${tm}`, macB(tm)); s.add(`Target IP address: ${antwortAn ? antwortAn.ip : frage}`, ipB(antwortAn ? antwortAn.ip : frage));
    const dm = antwortAn ? antwortAn.mac : BC;
    return rahmen(dt, [eth(von.mac, dm, 0x0806), s], { q: macName(von.mac), z: macName(dm), proto: 'ARP', protos: ['arp'], info: antwortAn ? `${von.ip} is at ${von.mac}` : `Who has ${frage}? Tell ${von.ip}`, v: { 'eth.src': von.mac, 'eth.dst': dm, 'arp.opcode': antwortAn ? 2 : 1, 'arp.src.proto_ipv4': von.ip, 'arp.dst.proto_ipv4': antwortAn ? antwortAn.ip : frage } });
  }
  function icmp(dt, a, b, typ, code, idn, sq, opt = {}) {
    const s = Sch('Internet Control Message Protocol');
    const namen = { '8.0': 'Echo (ping) request', '0.0': 'Echo (ping) reply', '3.0': 'Destination unreachable (Network unreachable)', '3.1': 'Destination unreachable (Host unreachable)', '3.3': 'Destination unreachable (Port unreachable)' };
    s.add(`Type: ${typ} (${typ === 3 ? 'Destination unreachable' : namen[typ + '.0']})`, [typ]); s.add(`Code: ${code}${typ === 3 ? ' (' + namen[typ + '.' + code].match(/\((.*)\)/)[1] + ')' : ''}`, [code]);
    const ci = s.add('Checksum', [0, 0]);
    let rest;
    if (typ === 3) { s.add('Unused: 00000000', [0, 0, 0, 0]); rest = opt.original; s.add(`Original-Paket (IP-Header + 8 Bytes): ${opt.origTxt}`, rest); }
    else { s.add(`Identifier (BE): ${idn} (${hex(idn)})`, u16(idn)); s.add(`Sequence Number (BE): ${sq} (${hex(sq)})`, u16(sq)); rest = txtB('abcdefghijklmnopqrstuvwabcdefghi'); s.add('Data (32 Bytes): abcdefghijklmnopqrstuvwabcdefghi', rest); }
    const c = pruefsumme(s.b); s.setze(ci, u16(c), `Checksum: ${hex(c)} [korrekt]`);
    const info = typ === 3 ? namen[typ + '.' + code] : `${namen[typ + '.0']}  id=${hex(idn)}, seq=${sq}/${((sq & 255) << 8) | (sq >> 8)}, ttl=${opt.ttl || 128}${opt.extra || ''}`;
    return ipPaket(dt, a, b, 1, s, null, { proto: 'ICMP', protos: ['ip', 'icmp'], info, farbe: typ === 3 ? 'fehler' : 'icmp', v: { 'icmp.type': typ, 'icmp.code': code } }, opt);
  }
  // UDP-Anwendungen
  function udpPaket(dt, a, b, sp, dp, app, m, opt) { const s = udp(a.ip, b.ip, sp, dp, app.b); return ipPaket(dt, a, b, 17, s, app, Object.assign({}, m, { protos: ['ip', 'udp', ...m.protos], v: Object.assign({ 'udp.srcport': sp, 'udp.dstport': dp }, m.v) }), opt); }
  const qName = n => [...n.split('.').flatMap(l => [l.length, ...txtB(l)]), 0];
  const TYPEN = { A: 1, CNAME: 5, AAAA: 28, SRV: 33, PTR: 12 };
  function dns(dt, a, b, id, name, typ, antwort, rcode = 0, opt) {
    const s = Sch(`Domain Name System (${antwort ? 'response' : 'query'})`), istA = !!antwort;
    const fl = istA ? 0x8180 | rcode : 0x0100, an = istA ? antwort.length : 0;
    s.add(`Transaction ID: ${hex(id)}`, u16(id));
    s.add(`Flags: ${hex(fl)} ${istA ? 'Standard query response, ' + (rcode === 3 ? 'No such name' : 'No error') : 'Standard query'}`, u16(fl), istA ? ['1... .... .... .... = Response: Message is a response', '.... ...1 .... .... = Recursion desired: Do query recursively', '.... .... 1... .... = Recursion available: Server can do recursive queries', `.... .... .... ${rcode.toString(2).padStart(4, '0')} = Reply code: ${rcode === 3 ? 'No such name (3) – NXDOMAIN' : 'No error (0)'}`] : ['0... .... .... .... = Response: Message is a query', '.... ...1 .... .... = Recursion desired: Do query recursively']);
    s.add('Questions: 1', u16(1)); s.add(`Answer RRs: ${an}`, u16(an)); s.add('Authority RRs: 0', u16(0)); s.add('Additional RRs: 0', u16(0));
    s.add(`Query: ${name}: type ${typ}, class IN`, [...qName(name), ...u16(TYPEN[typ]), 0, 1]);
    const v = { 'dns.qry.name': name, 'dns.flags.response': istA ? 1 : 0, 'dns.flags.rcode': istA ? rcode : 0, 'dns.id': id, 'dns.qry.type': TYPEN[typ] };
    let info = `Standard query ${istA ? 'response ' : ''}${hex(id)} ${typ} ${name}`;
    if (istA) {
      if (rcode === 3) info += ' No such name';
      for (const [rn, rt, wert] of antwort) {
        const daten = rt === 'A' ? ipB(wert) : qName(wert);
        s.add(`Answer: ${rn}: type ${rt}, class IN, ${rt === 'A' ? 'addr' : 'cname'} ${wert} (TTL 3600)`, [...qName(rn), ...u16(TYPEN[rt]), 0, 1, ...u32(3600), ...u16(daten.length), ...daten]);
        info += ` ${rt} ${wert}`; if (rt === 'A') v['dns.a'] = wert;
      }
    }
    return udpPaket(dt, a, b, istA ? 53 : opt.sp, istA ? opt.sp : 53, s, { proto: 'DNS', protos: ['dns'], info, farbe: rcode ? 'dnsfehler' : 'dns', v }, opt);
  }
  function dhcp(dt, typ, xid, opts) {
    const NAMEN = { 1: 'Discover', 2: 'Offer', 3: 'Request', 5: 'ACK' }, vomClient = typ === 1 || typ === 3, c = H.cli;
    const s = Sch(`Dynamic Host Configuration Protocol (${NAMEN[typ]})`);
    s.add(`Message type: ${vomClient ? 'Boot Request (1)' : 'Boot Reply (2)'}`, [vomClient ? 1 : 2]); s.add('Hardware type: Ethernet (0x01)', [1]); s.add('Hardware address length: 6', [6]); s.add('Hops: 0', [0]);
    s.add(`Transaction ID: ${hex(xid, 8)}`, u32(xid)); s.add('Seconds elapsed: 0', [0, 0]); s.add(`Bootp flags: ${vomClient ? '0x8000 (Broadcast)' : '0x0000 (Unicast)'}`, vomClient ? [0x80, 0] : [0, 0]);
    s.add('Client IP address: 0.0.0.0', [0, 0, 0, 0]); const yi = vomClient ? '0.0.0.0' : c.ip;
    s.add(`Your (client) IP address: ${yi}`, ipB(yi)); s.add(`Next server IP address: ${vomClient ? '0.0.0.0' : H.dc.ip}`, ipB(vomClient ? '0.0.0.0' : H.dc.ip)); s.add('Relay agent IP address: 0.0.0.0', [0, 0, 0, 0]);
    s.add(`Client MAC address: ${macName(c.mac)} (${c.mac})`, [...macB(c.mac), ...new Array(10).fill(0)]); s.add('Server host name not given', new Array(64).fill(0)); s.add('Boot file name not given', new Array(128).fill(0));
    s.add('Magic cookie: DHCP', [0x63, 0x82, 0x53, 0x63]);
    s.add(`Option: (53) DHCP Message Type (${NAMEN[typ]})`, [53, 1, typ]);
    for (const [nr, txt, by] of opts) s.add(`Option: (${nr}) ${txt}`, [nr, by.length, ...by]);
    s.add('Option: (255) End', [255]);
    const info = `DHCP ${NAMEN[typ]} - Transaction ID ${hex(xid, 8)}`;
    const a = vomClient ? { ip: '0.0.0.0', mac: c.mac } : H.dc, b = vomClient ? { ip: '255.255.255.255', mac: BC } : c;
    const v = { 'dhcp.option.dhcp': typ, 'dhcp.ip.your': yi, 'dhcp.id': xid };
    return udpPaket(dt, a, b, vomClient ? 68 : 67, vomClient ? 67 : 68, s, { proto: 'DHCP', protos: ['dhcp', 'bootp'], info, farbe: 'udp', v });
  }
  // TCP-Verbindungen
  function verbindung(a, b, cp, sp, isnA, isnB) { return { a, b, cp, sp, isn: [isnA, isnB], seq: [isnA, isnB], strom: ++stromNr, win: [64240, 65535], last: [isnA, isnB], sm: null, dm: null }; }
  function seg(dt, c, dir, flags, app, m = {}) {
    const [x, y] = dir ? [c.b, c.a] : [c.a, c.b], [px, py] = dir ? [c.sp, c.cp] : [c.cp, c.sp];
    const nl = app ? app.b : [], sq = m.retrans ? c.last[dir] : c.seq[dir], ak = c.seq[1 - dir];
    const seqR = sq - c.isn[dir], ackR = ak - c.isn[1 - dir];
    const { s, fl } = tcpSch(x.ip, y.ip, px, py, sq >>> 0, ak >>> 0, seqR, ackR, flags, c.win[dir], nl);
    if (!m.retrans) c.last[dir] = sq;
    if (!m.retrans) c.seq[dir] = (sq + nl.length + (/[SF]/.test(flags) ? 1 : 0)) >>> 0;
    let info = `${px} → ${py} [${flagTxt(flags)}] Seq=${seqR}${flags.includes('A') ? ' Ack=' + ackR : ''} Win=${c.win[dir]} Len=${nl.length}`;
    if (m.retrans) info = '[TCP Retransmission] ' + info;
    const opt = { sm: dir ? c.dm || c.b.mac : c.sm || c.a.mac, dm: dir ? c.sm || c.a.mac : c.dm || c.b.mac, ttl: m.ttl };
    const farbe = m.retrans ? 'fehler' : (fl & 4) ? 'rst' : (fl & 3) ? 'syn' : null;
    const v = Object.assign({ 'tcp.srcport': px, 'tcp.dstport': py, 'tcp.stream': c.strom, 'tcp.len': nl.length, 'tcp.seq': seqR, 'tcp.ack': ackR, 'tcp.flags.syn': (fl & 2) ? 1 : 0, 'tcp.flags.ack': (fl & 16) ? 1 : 0, 'tcp.flags.fin': fl & 1, 'tcp.flags.reset': (fl & 4) ? 1 : 0, 'tcp.flags.push': (fl & 8) ? 1 : 0 }, m.retrans ? { 'tcp.analysis.retransmission': 1 } : {}, m.v || {});
    if (m.retrans) s.f.push({ t: '[SEQ/ACK-Analyse: Dies ist eine TCP-Retransmission – keine Antwort auf das vorige Segment]', o: 0, l: 0 });
    return ipPaket(dt, x, y, 6, s, app, { proto: m.proto || 'TCP', protos: ['ip', 'tcp', ...(m.protos || [])], info: m.info || info, farbe: m.farbe || farbe || (m.proto ? m.proto.toLowerCase() : 'tcp'), strom: c.strom, dir, app: m.appArt ? { art: m.appArt, text: m.appText } : null, v }, opt);
  }
  const handshake = (c, dt = 0.0003) => { seg(dt, c, 0, 'S'); seg(dt, c, 1, 'SA'); seg(dt, c, 0, 'A'); };
  const abbau = (c, dt = 0.0004) => { seg(dt, c, 0, 'FA'); seg(dt, c, 1, 'FA'); seg(dt, c, 0, 'A'); };
  function httpSch(text, name) { const s = Sch(name); for (const z of text.split('\r\n').slice(0, -1)) s.add(z ? z + '\\r\\n' : '\\r\\n', txtB(z + '\r\n')); const rest = text.split('\r\n').pop(); if (rest) s.add(`Datei-Daten (text/html): ${rest.length} Bytes`, txtB(rest)); return s; }
  function tlsHello(sni) {
    const s = Sch('Transport Layer Security'), rand = zb(32), sess = zb(32);
    const ext = [0, 0, ...u16(sni.length + 5), ...u16(sni.length + 3), 0, ...u16(sni.length), ...txtB(sni)], ver = [0, 0x2b, 0, 3, 2, 3, 4];
    const ciphers = [0x13, 1, 0x13, 2, 0xc0, 0x2f];
    const hs = [3, 3, ...rand, 32, ...sess, ...u16(ciphers.length), ...ciphers, 1, 0, ...u16(ext.length + ver.length), ...ext, ...ver];
    s.add('TLSv1.3 Record Layer: Handshake Protocol: Client Hello – Content Type: Handshake (22), Version: TLS 1.0 (0x0301)', [22, 3, 1]); s.add(`Länge: ${hs.length + 4}`, u16(hs.length + 4));
    s.add('Handshake Type: Client Hello (1)', [1]); s.add(`Länge: ${hs.length}`, [0, ...u16(hs.length)]); s.add('Version: TLS 1.2 (0x0303) – echte Version steht in supported_versions', [3, 3]);
    s.add('Random: ' + rand.slice(0, 8).map(x => x.toString(16).padStart(2, '0')).join('') + '…', rand); s.add('Session ID (32 Bytes)', [32, ...sess]);
    s.add('Cipher Suites (3): TLS_AES_128_GCM_SHA256, TLS_AES_256_GCM_SHA384, TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256', [...u16(ciphers.length), ...ciphers]); s.add('Compression Methods: null', [1, 0]);
    s.add(`Extensions Length: ${ext.length + ver.length}`, u16(ext.length + ver.length));
    s.add(`Extension: server_name (SNI) – Server Name: ${sni}  ← im Klartext sichtbar!`, ext); s.add('Extension: supported_versions: TLS 1.3', ver);
    return s;
  }
  function tlsServerHello() {
    const s = Sch('Transport Layer Security'), rand = zb(32), sess = zb(32), ver = [0, 0x2b, 0, 2, 3, 4];
    const hs = [3, 3, ...rand, 32, ...sess, 0x13, 1, 0, ...u16(ver.length), ...ver], enc = zb(1180);
    s.add('TLSv1.3 Record Layer: Handshake Protocol: Server Hello – Content Type: Handshake (22)', [22, 3, 3]); s.add(`Länge: ${hs.length + 4}`, u16(hs.length + 4));
    s.add('Handshake Type: Server Hello (2)', [2]); s.add(`Länge: ${hs.length}`, [0, ...u16(hs.length)]); s.add('Version: TLS 1.2 (0x0303)', [3, 3]);
    s.add('Random (32 Bytes)', rand); s.add('Session ID (32 Bytes)', [32, ...sess]); s.add('Cipher Suite: TLS_AES_128_GCM_SHA256 (0x1301)', [0x13, 1]); s.add('Compression Method: null (0)', [0]); s.add('Extension: supported_versions: TLS 1.3', [...u16(ver.length), ...ver]);
    s.add('TLSv1.3 Record Layer: Change Cipher Spec Protocol', [20, 3, 3, 0, 1, 1]);
    s.add(`TLSv1.3 Record Layer: Application Data – Encrypted Application Data (${enc.length} Bytes: Zertifikat, Finished – verschlüsselt)`, [23, 3, 3, ...u16(enc.length), ...enc]);
    return s;
  }
  function tlsDaten(n) { const s = Sch('Transport Layer Security'), enc = zb(n); s.add('TLSv1.3 Record Layer: Application Data Protocol: http-over-tls', [23, 3, 3]); s.add(`Länge: ${n}`, u16(n)); s.add(`Encrypted Application Data: ${enc.slice(0, 6).map(x => x.toString(16).padStart(2, '0')).join('')}… (${n} Bytes, ohne Schlüssel nicht lesbar)`, enc); return s; }
  // SMB2
  const utf16 = s => [...s].flatMap(ch => [ch.charCodeAt(0) & 255, ch.charCodeAt(0) >> 8]);
  let smbMid = 0;
  function smb2(cmd, antwort, body, bodyF, sess = 0, tree = 0) {
    const CMD = { 0: 'Negotiate Protocol', 1: 'Session Setup', 3: 'Tree Connect' };
    const s = Sch(`SMB2 (Server Message Block Protocol version 2) – ${CMD[cmd]} ${antwort ? 'Response' : 'Request'}`);
    const len = 64 + body.length;
    s.add(`NetBIOS Session Service: Länge ${len}`, [0, 0, ...u16(len)]);
    s.add('ProtocolId: 0xfe534d42 (\\xFESMB)', [0xfe, 0x53, 0x4d, 0x42]); s.add('Header Length: 64', [64, 0]); s.add('Credit Charge: 1', [1, 0]);
    s.add('NT Status: STATUS_SUCCESS (0x00000000)', [0, 0, 0, 0]); s.add(`Command: ${CMD[cmd]} (${cmd})`, [cmd, 0]); s.add('Credits: 1', [1, 0]);
    s.add(`Flags: ${antwort ? '0x00000001 (Response)' : '0x00000000 (Request)'}`, [antwort ? 1 : 0, 0, 0, 0]); s.add('Chain Offset: 0', [0, 0, 0, 0]);
    const mid = antwort ? smbMid : ++smbMid; s.add(`Message ID: ${mid}`, [mid, 0, 0, 0, 0, 0, 0, 0]); s.add('Process ID: 0x0000feff', [0xff, 0xfe, 0, 0]);
    s.add(`Tree ID: ${hex(tree, 8)}`, [tree & 255, 0, 0, 0]); s.add(`Session ID: ${hex(sess, 16)}`, [sess & 255, sess >> 8, 0, 0, 0, 0, 0, 0]); s.add('Signature: 00000000000000000000000000000000', new Array(16).fill(0));
    let o = 0; for (const [t, l] of bodyF) { s.add(t, body.slice(o, o + l)); o += l; }
    return { s, info: `${CMD[cmd]} ${antwort ? 'Response' : 'Request'}`, cmd };
  }
  const smbSeg = (dt, c, dir, x, extra = '') => seg(dt, c, dir, 'PA', x.s, { proto: 'SMB2', protos: ['nbss', 'smb2'], info: x.info + extra, farbe: 'smb', v: { 'smb2.cmd': x.cmd } });
  // Kerberos
  const REALM = 'NETZILON.EXAMPLE';
  function krb(art, extra) {
    const T = { 'AS-REQ': [0x6a, 10], 'AS-REP': [0x6b, 11], 'TGS-REQ': [0x6c, 12], 'TGS-REP': [0x6d, 13] }[art], user = 'lena.neumann';
    const sname = extra.sname, realmB = dStr(REALM), cname = dStr(user), snB = dStr(sname);
    const body = art.endsWith('REQ') ? seq(ctx(1, dInt(5)), ctx(2, dInt(T[1])), ctx(4, seq(ctx(1, seq(ctx(0, dInt(1)), ctx(1, seq(cname)))), ctx(2, realmB), ctx(3, seq(ctx(0, dInt(2)), ctx(1, seq(snB)))), ctx(7, dInt(0x5a3c)), ctx(8, seq(dInt(18), dInt(17))))))
      : seq(ctx(0, dInt(5)), ctx(1, dInt(T[1])), ctx(3, realmB), ctx(4, seq(ctx(1, seq(cname)))), ctx(5, der(0x61, seq(ctx(1, realmB), ctx(2, seq(snB)), ctx(3, der(0x04, zb(180)))))), ctx(6, seq(ctx(0, dInt(18)), ctx(2, der(0x04, zb(120))))));
    const b = der(T[0], body);
    const s = asnSch(`Kerberos – ${art.toLowerCase().replace('-', '-')}`, b, [[`Kerberos ${art} (Application ${T[0] - 0x60})`, b.slice(0, 1)], ['pvno: 5', dInt(5)], [`msg-type: krb-${art.toLowerCase()} (${T[1]})`, dInt(T[1])], [`realm: ${REALM}`, realmB], [`cname: ${user}`, cname], [`sname: ${sname}  ← angefragter Dienst`, snB], ['etype: eTYPE-AES256-CTS-HMAC-SHA1-96 (18)', dInt(18)]]);
    return { s, info: art === 'AS-REQ' || art === 'TGS-REQ' ? art.toLowerCase().replace('-', '-') : art.toLowerCase(), sname };
  }
  // LDAP
  function ldap(id, art, s1) {
    let op, felder;
    if (art === 'bind') { op = der(0x60, [...dInt(3), ...der(0x04, []), ...der(0xa3, [...der(0x04, txtB('GSS-SPNEGO')), ...der(0x04, zb(40))])]); felder = [['bindRequest(' + id + ') "<ROOT>" sasl (GSS-SPNEGO)', [0x60]], ['version: 3', dInt(3)], ['mechanism: GSS-SPNEGO', txtB('GSS-SPNEGO')]]; }
    else if (art === 'bindAntw') { op = der(0x61, [...der(0x0a, [0]), ...der(0x04, []), ...der(0x04, [])]); felder = [['bindResponse(' + id + ') success', [0x61]], ['resultCode: success (0)', der(0x0a, [0])]]; }
    else if (art === 'search') { op = der(0x63, [...der(0x04, txtB('DC=netzilon,DC=example')), ...der(0x0a, [2]), ...der(0x0a, [0]), ...dInt(0), ...dInt(0), ...der(0x01, [0]), ...der(0xa3, [...der(0x04, txtB('sAMAccountName')), ...der(0x04, txtB(s1))]), ...seq(der(0x04, txtB('memberOf')), der(0x04, txtB('mail')))]); felder = [[`searchRequest(${id}) "DC=netzilon,DC=example" wholeSubtree`, [0x63]], ['baseObject: DC=netzilon,DC=example', txtB('DC=netzilon,DC=example')], ['scope: wholeSubtree (2)', der(0x0a, [2])], [`Filter: (sAMAccountName=${s1})`, txtB(s1)], ['attributes: memberOf, mail', txtB('memberOf')]]; }
    else if (art === 'entry') { const dn = 'CN=Lena Neumann,OU=IT-Support,OU=Hamburg,OU=Netzilon,DC=netzilon,DC=example'; op = der(0x64, [...der(0x04, txtB(dn)), ...seq(seq(der(0x04, txtB('memberOf')), der(0x31, der(0x04, txtB('CN=GG_ITS,OU=Gruppen,OU=Netzilon,DC=netzilon,DC=example')))), seq(der(0x04, txtB('mail')), der(0x31, der(0x04, txtB('lena.neumann@netzilon.example')))))]); felder = [[`searchResEntry(${id}) "${dn}"`, [0x64]], ['objectName: ' + dn, txtB(dn)], ['memberOf: CN=GG_ITS,…', txtB('CN=GG_ITS')], ['mail: lena.neumann@netzilon.example', txtB('lena.neumann@netzilon.example')]]; }
    else { op = der(0x65, [...der(0x0a, [0]), ...der(0x04, []), ...der(0x04, [])]); felder = [[`searchResDone(${id}) success [1 result]`, [0x65]], ['resultCode: success (0)', der(0x0a, [0])]]; }
    const b = seq(dInt(id), op);
    const s = asnSch('Lightweight Directory Access Protocol', b, [['LDAPMessage ' + felder[0][0], b.slice(0, 2)], [`messageID: ${id}`, dInt(id)], ...felder]);
    return { s, info: felder[0][0] };
  }
  const ldapSeg = (dt, c, dir, x) => seg(dt, c, dir, 'PA', x.s, { proto: 'LDAP', protos: ['ldap'], info: x.info, farbe: 'ldap' });

  // ---------- Szenarien ----------
  const ext = { shop: { ip: '203.0.113.80', mac: H.gw.mac }, fern: { ip: '198.51.100.25', mac: H.gw.mac }, nirgends: { ip: '192.168.99.10', mac: H.gw.mac } };
  const SZEN = {
    buero: { n: 'Büro-Start (Anmeldung am Morgen)', txt: 'PC-HH-042 startet: DHCP, ARP, DNS, Ping, HTTP-Intranet, HTTPS-Shop, Kerberos, LDAP, SMB-Laufwerk.', bau() {
      neu(); const c = H.cli, d = H.dc, xid = 0x5e1f2a7c;
      const dopts = [[1, 'Subnet Mask: 255.255.255.0', [255, 255, 255, 0]], [3, 'Router: 10.0.0.1', ipB('10.0.0.1')], [6, 'Domain Name Server: 10.0.0.10', ipB('10.0.0.10')], [15, 'Domain Name: netzilon.example', txtB('netzilon.example')], [54, 'DHCP Server Identifier: 10.0.0.10', ipB('10.0.0.10')], [51, 'IP Address Lease Time: (691200 s) 8 Tage', u32(691200)], [58, 'Renewal Time Value: (345600 s) 4 Tage (T1)', u32(345600)]];
      dhcp(0, 1, xid, [[12, 'Host Name: PC-HH-042', txtB('PC-HH-042')], [55, 'Parameter Request List (1, 3, 6, 15, 51)', [1, 3, 6, 15, 51]]]);
      dhcp(0.0021, 2, xid, dopts);
      dhcp(0.0009, 3, xid, [[50, 'Requested IP Address: 10.0.0.142', ipB('10.0.0.142')], [54, 'DHCP Server Identifier: 10.0.0.10', ipB('10.0.0.10')], [12, 'Host Name: PC-HH-042', txtB('PC-HH-042')]]);
      dhcp(0.0018, 5, xid, dopts);
      arp(0.21, c, '10.0.0.1'); arp(0.0004, H.gw, null, c); arp(0.0011, c, '10.0.0.10'); arp(0.0003, d, null, c);
      dns(0.012, c, d, 0x1a01, 'intranet.netzilon.example', 'A', null, 0, { sp: 53211 });
      dns(0.0007, d, c, 0x1a01, 'intranet.netzilon.example', 'A', [['intranet.netzilon.example', 'CNAME', 'web01.netzilon.example'], ['web01.netzilon.example', 'A', '10.0.0.30']], 0, { sp: 53211 });
      dns(0.0004, c, d, 0x1a02, 'intranet.netzilon.example', 'AAAA', null, 0, { sp: 53212 });
      dns(0.0006, d, c, 0x1a02, 'intranet.netzilon.example', 'AAAA', [['intranet.netzilon.example', 'CNAME', 'web01.netzilon.example']], 0, { sp: 53212 });
      arp(0.001, c, '10.0.0.30'); arp(0.0003, H.web, null, c);
      for (let i = 1; i <= 2; i++) { icmp(i === 1 ? 0.002 : 1, c, H.web, 8, 0, 1, i); icmp(0.0005, H.web, c, 0, 0, 1, i); }
      const h = verbindung(c, H.web, 49812, 80, 0x2f1a0b11, 0x7c33e901); handshake(h);
      const get = 'GET /intranet/start.html HTTP/1.1\r\nHost: intranet.netzilon.example\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/130.0\r\nAccept: text/html\r\nConnection: keep-alive\r\n\r\n';
      seg(0.0008, h, 0, 'PA', httpSch(get, 'Hypertext Transfer Protocol – GET /intranet/start.html'), { proto: 'HTTP', protos: ['http'], info: 'GET /intranet/start.html HTTP/1.1', appArt: 'http', appText: get, v: { 'http.request': 1, 'http.request.uri': '/intranet/start.html', 'http.host': 'intranet.netzilon.example', 'http.request.method': 'GET' } });
      seg(0.0003, h, 1, 'A');
      const html = '<!DOCTYPE html><html><head><title>Netzilon Intranet</title></head><body><h1>Guten Morgen!</h1><p>Kantine heute: Linsensuppe</p></body></html>';
      const ok = `HTTP/1.1 200 OK\r\nServer: Microsoft-IIS/10.0\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: ${html.length}\r\n\r\n${html}`;
      seg(0.0041, h, 1, 'PA', httpSch(ok, 'Hypertext Transfer Protocol – HTTP/1.1 200 OK'), { proto: 'HTTP', protos: ['http'], info: 'HTTP/1.1 200 OK  (text/html)', appArt: 'http', appText: ok, v: { 'http.response': 1, 'http.response.code': 200 } });
      seg(0.0002, h, 0, 'A'); abbau(h);
      dns(0.3, c, d, 0x1a03, 'www.netzilon-shop.example', 'A', null, 0, { sp: 53213 });
      dns(0.0182, d, c, 0x1a03, 'www.netzilon-shop.example', 'A', [['www.netzilon-shop.example', 'A', '203.0.113.80']], 0, { sp: 53213 });
      const t = verbindung(c, ext.shop, 49813, 443, 0x51b2c3d4, 0x0a0b0c0d); t.dm = H.gw.mac; t.sm = c.mac;
      const tt = { ttl: 52 };
      seg(0.0008, t, 0, 'S'); seg(0.0214, t, 1, 'SA', null, tt); seg(0.0002, t, 0, 'A');
      seg(0.0011, t, 0, 'PA', tlsHello('www.netzilon-shop.example'), { proto: 'TLSv1.3', protos: ['tls'], info: 'Client Hello (SNI=www.netzilon-shop.example)', farbe: 'tls', appArt: 'tls', appText: 'TLS Client Hello – SNI: www.netzilon-shop.example', v: { 'tls.handshake.type': 1, 'tls.handshake.extensions_server_name': 'www.netzilon-shop.example' } });
      seg(0.0221, t, 1, 'PA', tlsServerHello(), { proto: 'TLSv1.3', protos: ['tls'], info: 'Server Hello, Change Cipher Spec, Application Data', farbe: 'tls', appArt: 'tls', appText: 'TLS Server Hello + verschlüsselte Daten', ttl: 52, v: { 'tls.handshake.type': 2 } });
      seg(0.0012, t, 0, 'PA', tlsDaten(412), { proto: 'TLSv1.3', protos: ['tls'], info: 'Application Data', farbe: 'tls', appArt: 'tls' });
      seg(0.0301, t, 1, 'PA', tlsDaten(1320), { proto: 'TLSv1.3', protos: ['tls'], info: 'Application Data', farbe: 'tls', appArt: 'tls', ttl: 52 });
      seg(0.0004, t, 0, 'RA');
      // Kerberos
      const k = (dt, a, b, art, sname) => { const x = krb(art, { sname }); const req = art.endsWith('REQ'); return udpPaket(dt, a, b, req ? 50311 : 88, req ? 88 : 50311, x.s, { proto: 'KRB5', protos: ['kerberos'], info: art + (sname ? '  sname=' + sname : ''), farbe: 'krb', v: { 'kerberos.msg_type': { 'AS-REQ': 10, 'AS-REP': 11, 'TGS-REQ': 12, 'TGS-REP': 13 }[art], 'kerberos.sname': sname } }); };
      k(0.5, c, d, 'AS-REQ', 'krbtgt/' + REALM); k(0.0031, d, c, 'AS-REP', 'krbtgt/' + REALM);
      k(0.0009, c, d, 'TGS-REQ', 'ldap/dc01.netzilon.example'); k(0.0022, d, c, 'TGS-REP', 'ldap/dc01.netzilon.example');
      const l = verbindung(c, d, 49814, 389, 0x11aa22bb, 0x33cc44dd); handshake(l);
      ldapSeg(0.0006, l, 0, ldap(1, 'bind')); ldapSeg(0.0019, l, 1, ldap(1, 'bindAntw'));
      ldapSeg(0.0005, l, 0, ldap(2, 'search', 'lena.neumann')); ldapSeg(0.0012, l, 1, ldap(2, 'entry')); ldapSeg(0.0001, l, 1, ldap(2, 'done'));
      abbau(l);
      k(0.2, c, d, 'TGS-REQ', 'cifs/fs01.netzilon.example'); k(0.0024, d, c, 'TGS-REP', 'cifs/fs01.netzilon.example');
      arp(0.001, c, '10.0.0.20'); arp(0.0003, H.fs, null, c);
      const s = verbindung(c, H.fs, 49815, 445, 0x6a6b6c6d, 0x1d2e3f40); handshake(s);
      const dial = [0x02, 0x02, 0x10, 0x02, 0x00, 0x03, 0x02, 0x03, 0x11, 0x03];
      smbSeg(0.0007, s, 0, smb2(0, false, [0x24, 0, 5, 0, ...dial], [['StructureSize: 0x24, Dialect count: 5', 4], ['Dialects: SMB 2.0.2, 2.1, 3.0, 3.0.2, 3.1.1', 10]]));
      smbSeg(0.0011, s, 1, smb2(0, true, [0x41, 0, 1, 0, 0x11, 0x03], [['StructureSize: 0x41, Security mode: Signing enabled', 4], ['Dialect: SMB 3.1.1 (0x0311) ausgehandelt', 2]]));
      const gss = [0x60, 0x82, ...zb(30)];
      smbSeg(0.0009, s, 0, smb2(1, false, [0x19, 0, 1, 1, ...gss], [['StructureSize: 0x19, Security mode: Signing enabled', 4], ['Security Blob: GSS-API/SPNEGO mit Kerberos AP-REQ (Ticket cifs/fs01.netzilon.example)', gss.length]]));
      smbSeg(0.0021, s, 1, smb2(1, true, [9, 0, 0, 0], [['StructureSize: 0x09, Session Flags: 0x0000 – Anmeldung erfolgreich', 4]], 0x41));
      const pfad = utf16('\\\\fs01\\Austausch');
      smbSeg(0.0006, s, 0, smb2(3, false, [9, 0, 0, 0, 0x48, 0, ...u16(pfad.length).reverse(), ...pfad], [['StructureSize: 0x09, Flags: 0', 4], [`Pfad-Offset/-Länge: 0x48 / ${pfad.length}`, 4], ['Tree: \\\\fs01\\Austausch', pfad.length]], 0x41), ' Tree: \\\\fs01\\Austausch');
      smbSeg(0.0010, s, 1, smb2(3, true, [0x10, 0, 1, 0], [['StructureSize: 0x10, Share Type: Disk (0x01)', 4]], 0x41, 5));
      seg(0.0002, s, 0, 'A');
    } },
    scan: { n: 'Port-Scan im LAN', txt: 'Auf FS01 (10.0.0.20) gehen plötzlich viele Verbindungsversuche ein. Wer scannt, welche Ports sind offen?', bau() {
      neu(); const a = H.ang, z = H.fs;
      dns(0, H.pc2, H.dc, 0x2b01, 'mail.netzilon.example', 'A', null, 0, { sp: 60011 });
      dns(0.0006, H.dc, H.pc2, 0x2b01, 'mail.netzilon.example', 'A', [['mail.netzilon.example', 'A', '10.0.0.25']], 0, { sp: 60011 });
      arp(0.4, a, '10.0.0.20'); arp(0.0003, z, null, a);
      const offen = [135, 139, 445, 3389], ports = [21, 22, 23, 25, 53, 80, 110, 135, 139, 143, 443, 445, 993, 1433, 3306, 3389, 5900, 8080];
      const sp = 51234; let isn = 0x9e3779b9;
      for (const p of ports) {
        const c = verbindung(a, z, sp, p, isn, (isn * 7 + p) >>> 0); c.win = [1024, 65535]; isn = (isn + 0x1000193) >>> 0;
        seg(0.00011, c, 0, 'S');
        if (offen.includes(p)) { seg(0.00021, c, 1, 'SA'); seg(0.00004, c, 0, 'R'); } else { c.win[1] = 0; seg(0.00018, c, 1, 'RA'); }
      }
      dns(0.9, H.pc2, H.dc, 0x2b02, 'intranet.netzilon.example', 'A', null, 0, { sp: 60012 });
      dns(0.0007, H.dc, H.pc2, 0x2b02, 'intranet.netzilon.example', 'A', [['intranet.netzilon.example', 'CNAME', 'web01.netzilon.example'], ['web01.netzilon.example', 'A', '10.0.0.30']], 0, { sp: 60012 });
    } },
    fehler: { n: 'Fehlersuche („Das Netz geht nicht!“)', txt: 'Ein Kollege meldet: Laufwerk „fs1“ nicht erreichbar, Ping ins Lager-Netz geht nicht, Syslog kommt nicht an, Webseite lädt ewig.', bau() {
      neu(); const c = H.cli, d = H.dc;
      dns(0, c, d, 0x3c01, 'fs1.netzilon.example', 'A', null, 0, { sp: 54001 });
      dns(0.0009, d, c, 0x3c01, 'fs1.netzilon.example', 'A', [], 3, { sp: 54001 });
      dns(0.0004, c, d, 0x3c02, 'fs1.netzilon.example.netzilon.example', 'A', null, 0, { sp: 54002 });
      dns(0.0008, d, c, 0x3c02, 'fs1.netzilon.example.netzilon.example', 'A', [], 3, { sp: 54002 });
      arp(0.6, c, '10.0.0.1'); arp(0.0003, H.gw, null, c);
      const req = icmp(0.0011, c, ext.nirgends, 8, 0, 7, 1, { dm: H.gw.mac });
      const orig = req.bytes.slice(14, 14 + 28);
      icmp(0.0006, H.gw, c, 3, 0, 0, 0, { original: orig, origTxt: `ICMP Echo an ${ext.nirgends.ip}`, ttl: 255 });
      const sl = Sch('Syslog-Nachricht'); sl.add('Syslog: <134>Okt  9 08:00:01 PC-HH-042 Backup: Sicherung gestartet', txtB('<134>Okt  9 08:00:01 PC-HH-042 Backup: Sicherung gestartet'));
      const sp = udpPaket(0.5, c, H.web, 55514, 514, sl, { proto: 'Syslog', protos: ['syslog'], info: 'LOCAL0.INFO: Backup: Sicherung gestartet', farbe: 'udp', v: {} });
      icmp(0.0004, H.web, c, 3, 3, 0, 0, { original: sp.bytes.slice(14, 14 + 28), origTxt: `UDP ${c.ip}:55514 → ${H.web.ip}:514` });
      const t = verbindung(c, ext.fern, 49900, 443, 0x0badf00d, 0); t.dm = H.gw.mac;
      seg(0.8, t, 0, 'S'); seg(1.0, t, 0, 'S', null, { retrans: true }); seg(2.0, t, 0, 'S', null, { retrans: true }); seg(4.0, t, 0, 'S', null, { retrans: true });
    } }
  };

  // ---------- Netzwerk-Simulator → Mitschnitt ----------
  function macVon(n) { let h = 0; for (const ch of String(n.id || n.name)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return '02:00:00:' + [h >> 16, h >> 8, h].map(x => (x & 255).toString(16).padStart(2, '0')).join(':'); }
  function ausNetsim(srcName, zielName) {
    const topo = S.p.netsim && S.p.netsim.topo;
    const ends = topo && Array.isArray(topo.nodes) ? topo.nodes.filter(n => (n.type === 'pc' || n.type === 'server') && /^\d+\.\d+\.\d+\.\d+$/.test(String(n.ip || '').trim())) : [];
    if (ends.length < 2) return { ok: false, msg: 'Keine passende Topologie im Netzwerk-Simulator gefunden. Baue dort mindestens zwei Geräte (PC/Server) mit IP-Adresse und speichere die Topologie (freies Bauen, keine Aufgabe).' };
    const src = ends.find(n => n.name === srcName) || ends.find(n => n.type === 'pc') || ends[0];
    const dst = ends.find(n => n.name === zielName && n !== src) || ends.find(n => n !== src);
    let r = null;
    if (window.Netsim && Netsim.ping) { const alt = Netsim._getT(); try { Netsim._setT(JSON.parse(JSON.stringify(topo))); r = Netsim.ping(src, dst.ip.trim()); } catch (e) { r = null; } finally { Netsim._setT(alt); } }
    neu();
    const a = { n: src.name, ip: src.ip.trim(), mac: macVon(src) }, b = { n: dst.name, ip: dst.ip.trim(), mac: macVon(dst) };
    const direkt = r ? !(r.hops && r.hops.length) && (r.ok || /ARP/.test(r.msg)) : !String(src.gw || '').trim();
    const ttl = 128 - (r && r.hops ? r.hops.length : 0);
    if (direkt) {
      arp(0, a, b.ip); if (!r || r.ok) arp(0.0004, b, null, a); else { arp(1, a, b.ip); arp(1, a, b.ip); }
      if (!r || r.ok) for (let i = 1; i <= 4; i++) { icmp(i === 1 ? 0.001 : 1, a, b, 8, 0, 1, i); icmp(0.0006, b, a, 0, 0, 1, i, { ttl }); }
    } else {
      const g = { n: 'Gateway', ip: String(src.gw || '').trim() || '0.0.0.0', mac: '00:1b:54:' + macVon({ id: 'gw' + src.gw }).slice(9) };
      arp(0, a, g.ip); if (r && /Gateway/.test(r.msg) && !r.ok) { arp(1, a, g.ip); arp(1, a, g.ip); }
      else {
        arp(0.0005, g, null, a);
        for (let i = 1; i <= 4; i++) { icmp(i === 1 ? 0.001 : 1, a, b, 8, 0, 1, i, { dm: g.mac, extra: !r || r.ok ? '' : ' (keine Antwort gefunden!)' }); if (!r || r.ok) icmp(0.002, b, a, 0, 0, 1, i, { sm: g.mac, ttl }); }
      }
    }
    const erfolg = liste.some(p => p.v['icmp.type'] === 0);
    return { ok: true, erfolg, pakete: liste, msg: `Ping ${a.n} (${a.ip}) → ${b.n} (${b.ip}): ${r ? (r.ok ? 'erfolgreich' : 'fehlgeschlagen – ' + r.msg) : 'simuliert'}${direkt ? ' – gleiches Netz, ARP direkt nach dem Ziel' : ' – über Router: ARP nach dem Gateway, Echo an die Gateway-MAC'}`, src: a, dst: b };
  }

  // ---------- Anzeigefilter ----------
  const FELDER = { 'frame.number': 'n', 'frame.len': 'n', 'eth.src': 'm', 'eth.dst': 'm', 'eth.addr': 'm', 'ip.src': 'i', 'ip.dst': 'i', 'ip.addr': 'i', 'ip.ttl': 'n', 'ip.proto': 'n',
    'tcp.port': 'n', 'tcp.srcport': 'n', 'tcp.dstport': 'n', 'tcp.stream': 'n', 'tcp.len': 'n', 'tcp.seq': 'n', 'tcp.ack': 'n', 'tcp.flags.syn': 'n', 'tcp.flags.ack': 'n', 'tcp.flags.fin': 'n', 'tcp.flags.reset': 'n', 'tcp.flags.push': 'n', 'tcp.analysis.retransmission': 'n',
    'udp.port': 'n', 'udp.srcport': 'n', 'udp.dstport': 'n', 'dns.flags.rcode': 'n', 'dns.flags.response': 'n', 'dns.qry.name': 's', 'dns.a': 'i', 'dns.id': 'n', 'dns.qry.type': 'n', 'icmp.type': 'n', 'icmp.code': 'n', 'arp.opcode': 'n',
    'arp.src.proto_ipv4': 'i', 'arp.dst.proto_ipv4': 'i', 'dhcp.option.dhcp': 'n', 'dhcp.ip.your': 'i', 'http.request.uri': 's', 'http.host': 's', 'http.request.method': 's', 'http.response.code': 'n', 'http.request': 'n', 'http.response': 'n',
    'tls.handshake.type': 'n', 'tls.handshake.extensions_server_name': 's', 'kerberos.msg_type': 'n', 'kerberos.sname': 's', 'smb2.cmd': 'n' };
  const ALIAS = { 'bootp.option.dhcp': 'dhcp.option.dhcp', 'ssl.handshake.type': 'tls.handshake.type', 'tcp.flags.rst': 'tcp.flags.reset' };
  const PROTOS = ['eth', 'arp', 'ip', 'icmp', 'tcp', 'udp', 'dns', 'dhcp', 'bootp', 'http', 'tls', 'ssl', 'smb2', 'smb', 'nbss', 'kerberos', 'krb5', 'ldap', 'syslog', 'frame'];
  const MULTI = { 'ip.addr': ['ip.src', 'ip.dst'], 'eth.addr': ['eth.src', 'eth.dst'], 'tcp.port': ['tcp.srcport', 'tcp.dstport'], 'udp.port': ['udp.srcport', 'udp.dstport'] };
  const OPS = { '==': '==', 'eq': '==', '!=': '!=', 'ne': '!=', '>': '>', 'gt': '>', '<': '<', 'lt': '<', '>=': '>=', 'ge': '>=', '<=': '<=', 'le': '<=', 'contains': 'contains' };
  function lexer(t) {
    const toks = []; let i = 0;
    while (i < t.length) {
      const ch = t[i];
      if (/\s/.test(ch)) { i++; continue; }
      const zwei = t.slice(i, i + 2);
      if (['&&', '||', '==', '!=', '>=', '<='].includes(zwei)) { toks.push({ k: zwei === '&&' ? 'and' : zwei === '||' ? 'or' : 'op', v: zwei, p: i }); i += 2; continue; }
      if (ch === '!') { toks.push({ k: 'not', p: i }); i++; continue; }
      if (ch === '(' || ch === ')') { toks.push({ k: ch, p: i }); i++; continue; }
      if (ch === '>' || ch === '<') { toks.push({ k: 'op', v: ch, p: i }); i++; continue; }
      if (ch === '=') throw new Error(`Einzelnes „=“ an Position ${i + 1}: Vergleiche schreibt man mit „==“ (z. B. ip.addr==10.0.0.10).`);
      if (ch === '"') { const e = t.indexOf('"', i + 1); if (e < 0) throw new Error('Anführungszeichen nicht geschlossen.'); toks.push({ k: 'wert', v: t.slice(i + 1, e), str: true, p: i }); i = e + 1; continue; }
      const m = t.slice(i).match(/^[A-Za-z0-9_.:\/-]+/);
      if (!m) throw new Error(`Unerwartetes Zeichen „${ch}“ an Position ${i + 1}.`);
      const w = m[0], wl = w.toLowerCase();
      if (wl === 'and') toks.push({ k: 'and', p: i }); else if (wl === 'or') toks.push({ k: 'or', p: i }); else if (wl === 'not') toks.push({ k: 'not', p: i });
      else if (OPS[wl] && /^[a-z]+$/.test(wl)) toks.push({ k: 'op', v: wl, p: i }); else toks.push({ k: 'wort', v: w, p: i });
      i += w.length;
    }
    return toks;
  }
  function parse(text) {
    const toks = lexer(text); let i = 0;
    const sieh = () => toks[i], nimm = () => toks[i++];
    function oder() { let l = und(); while (sieh() && sieh().k === 'or') { nimm(); l = { k: 'or', l, r: und() }; } return l; }
    function und() { let l = nicht(); while (sieh() && sieh().k === 'and') { nimm(); l = { k: 'and', l, r: nicht() }; } return l; }
    function nicht() { if (sieh() && sieh().k === 'not') { nimm(); return { k: 'not', x: nicht() }; } return atom(); }
    function atom() {
      const t = nimm();
      if (!t) throw new Error('Ausdruck endet unerwartet – nach „&&“, „||“ oder „!“ fehlt eine Bedingung.');
      if (t.k === '(') { const x = oder(); if (!sieh() || sieh().k !== ')') throw new Error('Klammer „(“ wurde nicht geschlossen.'); nimm(); return x; }
      if (t.k !== 'wort') throw new Error(`„${t.v || t.k}“ an Position ${t.p + 1} ist hier nicht erlaubt – erwartet wird ein Feld oder Protokoll (z. B. tcp, ip.addr).`);
      let f = t.v.toLowerCase(); f = ALIAS[f] || f;
      const istFeld = !!FELDER[f], istProto = PROTOS.includes(f);
      if (!istFeld && !istProto) throw new Error(`„${t.v}“ ist weder ein bekanntes Feld noch ein Protokoll. Beispiele: ip.addr, tcp.port, dns, arp, http, tcp.flags.syn.`);
      if (sieh() && sieh().k === 'op') {
        const op = OPS[nimm().v]; const w = nimm();
        if (!w || (w.k !== 'wort' && w.k !== 'wert')) throw new Error(`Nach dem Vergleich bei „${t.v}“ fehlt ein Wert.`);
        if (!istFeld) throw new Error(`„${t.v}“ ist ein Protokoll, kein Feld – Protokolle filtert man ohne Vergleich (einfach „${t.v}“).`);
        const typ = FELDER[f]; let v = w.v;
        if (typ === 'i' && !/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(\/\d{1,2})?$/.test(v)) throw new Error(`„${v}“ ist keine gültige IPv4-Adresse für ${f}.`);
        if (typ === 'i' && v.split('/')[0].split('.').some(x => +x > 255)) throw new Error(`„${v}“: Oktette dürfen höchstens 255 sein.`);
        if (typ === 'm') { v = v.toLowerCase().replace(/-/g, ':'); if (!/^([0-9a-f]{2}:){5}[0-9a-f]{2}$/.test(v)) throw new Error(`„${w.v}“ ist keine gültige MAC-Adresse (Format aa:bb:cc:dd:ee:ff).`); }
        if (typ === 'n') { if (!/^(0x[0-9a-f]+|\d+)$/i.test(v)) throw new Error(`${f} erwartet eine Zahl, nicht „${v}“.`); v = Number(v); }
        if (typ === 's') v = String(v).toLowerCase();
        if (op === 'contains' && typ !== 's') throw new Error('„contains“ funktioniert nur bei Text-Feldern (z. B. dns.qry.name contains "netzilon").');
        return { k: 'cmp', f, op, v, typ };
      }
      if (sieh() && (sieh().k === 'wort' || sieh().k === 'wert')) throw new Error(`Zwischen „${t.v}“ und „${sieh().v}“ fehlt ein Operator (==, !=, &&, ||).`);
      return istProto && !istFeld ? { k: 'proto', p: f } : { k: 'hat', f };
    }
    if (!toks.length) return null;
    const x = oder();
    if (i < toks.length) { const t = toks[i]; throw new Error(t.k === ')' ? 'Zu viele schließende Klammern „)“.' : `Unerwartetes „${t.v || t.k}“ an Position ${t.p + 1} – fehlt „&&“ oder „||“?`); }
    return x;
  }
  const ip2n = s => s.split('.').reduce((a, x) => (a * 256) + +x, 0);
  function vgl(pw, op, v, typ) {
    if (pw === undefined || pw === null) return false;
    if (typ === 'i') { const [ip, pr] = String(v).split('/'); if (pr) { const m = pr === '0' ? 0 : (0xffffffff << (32 - pr)) >>> 0; const g = ((ip2n(pw) & m) >>> 0) === ((ip2n(ip) & m) >>> 0); return op === '!=' ? !g : g; } v = ip; }
    const a = typ === 's' ? String(pw).toLowerCase() : pw;
    switch (op) { case '==': return a === v; case '!=': return a !== v; case '>': return a > v; case '<': return a < v; case '>=': return a >= v; case '<=': return a <= v; case 'contains': return String(a).includes(v); }
    return false;
  }
  function pruefen(x, p) {
    switch (x.k) {
      case 'or': return pruefen(x.l, p) || pruefen(x.r, p);
      case 'and': return pruefen(x.l, p) && pruefen(x.r, p);
      case 'not': return !pruefen(x.x, p);
      case 'proto': { const n = { bootp: 'dhcp', ssl: 'tls', smb: 'smb2', krb5: 'kerberos', frame: 'eth' }[x.p] || x.p; return p.protos.has(n); }
      case 'hat': return (MULTI[x.f] || [x.f]).some(f => p.v[f] !== undefined);
      case 'cmp': { const fs = MULTI[x.f] || [x.f]; return x.op === '!=' && MULTI[x.f] ? fs.every(f => p.v[f] !== undefined && vgl(p.v[f], '!=', x.v, x.typ)) : fs.some(f => vgl(p.v[f], x.op, x.v, x.typ)); }
    }
    return false;
  }
  function filterAnwenden(text, pakete) {
    try { const ast = parse(String(text || '').trim()); return { ok: true, leer: !ast, treffer: ast ? pakete.filter(p => pruefen(ast, p)) : pakete.slice() }; }
    catch (e) { return { ok: false, err: e.message, treffer: pakete.slice() }; }
  }

  // ---------- Aufgaben ----------
  const nums = s => (String(s).match(/\d+/g) || []).map(Number).sort((a, b) => a - b).join(',');
  const AUFGABEN = [
    { id: 'dhcp-ip', sz: 'buero', art: 'text', t: 'DHCP-Lease: Welche IP-Adresse hat der Client per DHCP erhalten?', tipp: 'Filter „dhcp“ → DHCP ACK → Feld „Your (client) IP address“.', ok: a => a.trim() === '10.0.0.142', loes: '10.0.0.142' },
    { id: 'lease', sz: 'buero', art: 'text', t: 'Wie lange ist die Lease gültig?', tipp: 'Im DHCP ACK: Option 51 „IP Address Lease Time“.', ok: a => /(^|\D)8\s*(tage?|d\b|days?)|691\s?200|192\s*(h|std|stunden)/i.test(a), loes: '8 Tage (691200 s)' },
    { id: 'dns-ip', sz: 'buero', art: 'text', t: 'Welche IP-Adresse liefert DNS für intranet.netzilon.example?', tipp: 'Filter: dns.qry.name == "intranet.netzilon.example" – die Antwort enthält einen CNAME auf web01 und dann den A-Eintrag.', ok: a => a.trim() === '10.0.0.30', loes: '10.0.0.30' },
    { id: 'syn-filter', sz: 'buero', art: 'filter', t: 'Finde den Filter, der nur die ersten beiden Schritte aller TCP-Handshakes zeigt (alle Pakete mit gesetztem SYN-Flag: SYN und SYN/ACK).', tipp: 'Feld tcp.flags.syn – Wert 1 heißt gesetzt.', ziel: p => p.v['tcp.flags.syn'] === 1, loes: 'tcp.flags.syn==1' },
    { id: 'sni', sz: 'buero', art: 'text', t: 'Welcher Hostname steht im TLS-SNI des HTTPS-Aufrufs?', tipp: 'Filter „tls“ → Client Hello → Extension server_name.', ok: a => /^www\.netzilon-shop\.example\.?$/i.test(a.trim()), loes: 'www.netzilon-shop.example' },
    { id: 'http-get', sz: 'buero', art: 'text', t: 'Welche Ressource (Pfad) fordert der HTTP-GET an?', tipp: 'Filter „http“ oder „Follow TCP Stream“ auf das GET-Paket.', ok: a => /^(https?:\/\/intranet\.netzilon\.example)?\/intranet\/start\.html$/i.test(a.trim()), loes: '/intranet/start.html' },
    { id: 'kerberos', sz: 'buero', art: 'text', t: 'Für welchen Dienst holt sich der Client direkt vor dem SMB-Zugriff ein Kerberos-Ticket (sname im TGS-REQ)?', tipp: 'Filter „kerberos“ – das letzte TGS-REQ.', ok: a => /^cifs\/fs01(\.netzilon\.example)?$/i.test(a.trim()), loes: 'cifs/fs01.netzilon.example' },
    { id: 'scanner', sz: 'scan', art: 'text', t: 'Wer hat den Port-Scan gemacht? (IP-Adresse)', tipp: 'Filter „tcp.flags.syn==1 && tcp.flags.ack==0“ – wer schickt viele SYNs an verschiedene Ports?', ok: a => a.trim() === '10.0.0.66', loes: '10.0.0.66' },
    { id: 'offen', sz: 'scan', art: 'text', t: 'Welche Ports auf FS01 sind offen? (alle, durch Komma getrennt)', tipp: 'Offen = Antwort SYN/ACK. Filter: tcp.flags.syn==1 && tcp.flags.ack==1', ok: a => nums(a) === '135,139,445,3389', loes: '135, 139, 445, 3389' },
    { id: 'nxdomain', sz: 'fehler', art: 'wahl', t: 'Warum schlägt die Namensauflösung von „fs1“ fehl?', tipp: 'Filter „dns.flags.rcode==3“ – was bedeutet Reply code 3?', wahl: ['Der DNS-Server ist nicht erreichbar (Timeout)', 'Den Namen gibt es nicht (NXDOMAIN) – vermutlich Tippfehler, der Server heißt fs01', 'Die Firewall blockiert UDP 53', 'Der Client hat keine IP-Adresse'], richtig: 1, loes: 'NXDOMAIN – der Name existiert nicht (richtig: fs01)' },
    { id: 'unreach', sz: 'fehler', art: 'paket', t: 'Klicke das Paket an, mit dem der Router meldet, dass das Netz 192.168.99.0 nicht erreichbar ist – und prüfe es.', tipp: 'Filter „icmp“ – ICMP Type 3 kommt vom Router 10.0.0.1.', ok: p => p.v['icmp.type'] === 3 && p.v['ip.src'] === '10.0.0.1', loes: 'ICMP Destination unreachable (Network unreachable) von 10.0.0.1' },
    { id: 'retrans', sz: 'fehler', art: 'text', t: 'Wie oft wurde das SYN an 198.51.100.25 wiederholt (Retransmissions)?', tipp: 'Filter: tcp.analysis.retransmission', ok: a => a.trim() === '3' || /^drei$/i.test(a.trim()), loes: '3' },
    { id: 'netsim', sz: 'netsim', art: 'auto', t: 'Erzeuge einen Mitschnitt aus dem Netzwerk-Simulator, in dem der Ping eine Antwort (Echo Reply) bekommt.', tipp: 'Im Netzwerk-Simulator zwei Geräte mit IP verbinden (frei bauen), dann hier „Mitschnitt aus Netzwerk-Simulator“.', loes: 'Netsim: z. B. PC1 192.168.1.10/24 und PC2 192.168.1.20/24 am Switch' }
  ];

  // ---------- Zustand ----------
  let pakete = [], sichtbar = 0, timer = null, sel = null, feldSel = null, szen = 'buero', ftext = '', fres = null, panel = '', aufgSel = 'dhcp-ip', nsInfo = '', offen = {};
  function P() {
    if (!istObj(S.p.wireshark)) S.p.wireshark = { geloest: {}, filter: '', szenario: '' };
    const w = S.p.wireshark; if (!istObj(w.geloest)) w.geloest = {}; if (typeof w.filter !== 'string') w.filter = ''; if (typeof w.szenario !== 'string') w.szenario = '';
    return w;
  }
  function laden(id, animiert = true) {
    if (!SZEN[id] && id !== 'netsim') id = 'buero';
    stopp(); szen = id; sel = null; feldSel = null; panel = '';
    if (id === 'netsim') { const r = ausNetsim(); pakete = r.ok ? r.pakete.slice() : []; nsInfo = r.msg; if (r.ok && r.erfolg) loesen('netsim'); }
    else { SZEN[id].bau(); pakete = liste.slice(); nsInfo = ''; }
    P().szenario = id; speichern();
    sichtbar = animiert ? 0 : pakete.length; zeichne();
    if (animiert) aufzeichnen();
  }
  function aufzeichnen() {
    stopp(); if (sichtbar >= pakete.length) sichtbar = 0;
    timer = setInterval(() => { sichtbar = Math.min(pakete.length, sichtbar + (pakete.length > 60 ? 2 : 1)); listeZeichnen(true); if (sichtbar >= pakete.length) stopp(); }, 45);
    knoepfe();
  }
  function stopp() { if (timer) clearInterval(timer); timer = null; knoepfe(); }
  function knoepfe() { const a = document.getElementById('ws-rec'); if (a) { a.classList.toggle('ws-rec-an', !!timer); a.textContent = timer ? '● Zeichnet auf …' : '▶ Aufzeichnen'; } }
  function loesen(id) {
    const g = P().geloest; if (g[id]) return false;
    g[id] = heute(); melde('wireshark', 1); speichern();
    const a = AUFGABEN.find(x => x.id === id);
    setTimeout(() => toast(`✓ Aufgabe gelöst: ${a ? a.t.slice(0, 60) : id}`, 'gold'), 60);
    try { if (window.Mot && Mot.konfetti) Mot.konfetti(80); } catch {}
    try { ton('gong'); } catch {}
    return true;
  }
  function pruefeAufgabe(id, antwort) {
    const a = AUFGABEN.find(x => x.id === id); if (!a) return { ok: false, msg: 'Unbekannte Aufgabe' };
    let ok = false, msg = '';
    if (a.art === 'text') { ok = !!a.ok(String(antwort || '')); msg = ok ? 'Richtig!' : 'Noch nicht richtig. Tipp: ' + a.tipp; }
    else if (a.art === 'wahl') { ok = +antwort === a.richtig; msg = ok ? 'Richtig! Reply code 3 = NXDOMAIN: Der Server antwortet, kennt den Namen aber nicht.' : 'Leider falsch. Tipp: ' + a.tipp; }
    else if (a.art === 'paket') { const p = pakete.find(x => x.nr === sel); ok = szen === a.sz && !!p && a.ok(p); msg = ok ? 'Richtig – das ist die ICMP-Fehlermeldung des Routers.' : (p ? 'Das ist nicht das gesuchte Paket. ' : 'Erst ein Paket in der Liste anklicken. ') + 'Tipp: ' + a.tipp; }
    else if (a.art === 'filter') {
      const r = filterAnwenden(ftext, pakete);
      if (szen !== a.sz) msg = 'Lade zuerst den passenden Mitschnitt.'; else if (!r.ok || r.leer) msg = 'Gib zuerst einen gültigen Anzeigefilter ein.';
      else { const soll = pakete.filter(a.ziel).map(p => p.nr).join(), ist = r.treffer.map(p => p.nr).join(); ok = soll === ist; msg = ok ? `Richtig! ${r.treffer.length} Pakete – genau SYN und SYN/ACK.` : `Dein Filter zeigt ${r.treffer.length} Pakete, gesucht sind ${pakete.filter(a.ziel).length}. Tipp: ${a.tipp}`; }
    } else { ok = !!P().geloest[a.id]; msg = ok ? 'Bereits gelöst.' : a.tipp; }
    if (ok) loesen(a.id);
    return { ok, msg };
  }

  // ---------- Darstellung ----------
  const E2 = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function zeichne() {
    const w = document.getElementById('ws-wurzel'); if (!w) return;
    const g = P().geloest, n = AUFGABEN.filter(a => g[a.id]).length;
    w.innerHTML = `<div class="ws-leiste glas">
        <label class="ws-lab">Mitschnitt <select id="ws-szen">${Object.entries(SZEN).map(([k, s]) => `<option value="${k}"${k === szen ? ' selected' : ''}>${E2(s.n)}</option>`).join('')}<option value="netsim"${szen === 'netsim' ? ' selected' : ''}>Aus Netzwerk-Simulator</option></select></label>
        <button class="glas knopf klein" id="ws-rec" data-a="rec">▶ Aufzeichnen</button><button class="glas knopf klein" data-a="stopp">■ Stopp</button><button class="glas knopf klein" data-a="sofort">⏭ Sofort alle</button>
        <button class="glas knopf klein" data-a="netsim">🔗 Mitschnitt aus Netzwerk-Simulator</button><button class="glas knopf klein" data-a="follow">⇄ Follow TCP Stream</button><button class="glas knopf klein" data-a="stat">📊 Protokollhierarchie</button>
      </div>
      <p class="ws-szentxt">${E2(szen === 'netsim' ? nsInfo : SZEN[szen].txt)}</p>
      <div class="ws-filter"><input id="ws-filter" spellcheck="false" autocomplete="off" placeholder="Anzeigefilter … z. B. ip.addr==10.0.0.10 && !arp" value="${E2(ftext)}" aria-label="Anzeigefilter"><button class="glas knopf klein" data-a="filter">Anwenden</button><button class="glas knopf klein" data-a="fweg">✕</button></div>
      <div id="ws-ferr" class="ws-ferr" role="status"></div>
      <div class="ws-listebox" id="ws-listebox"><table class="ws-liste"><thead><tr><th>Nr.</th><th>Zeit</th><th>Quelle</th><th>Ziel</th><th>Protokoll</th><th>Länge</th><th>Info</th></tr></thead><tbody id="ws-tbody"></tbody></table></div>
      <div class="ws-status" id="ws-status"></div>
      <div id="ws-panel"></div>
      <div class="ws-unten"><div class="ws-details glas" id="ws-details"></div><div class="ws-hex glas" id="ws-hex"></div></div>
      <section class="glas ws-aufg" id="ws-aufgaben"><h2>Aufgaben <small>${n}/${AUFGABEN.length} gelöst</small></h2>
        <div class="ws-aliste">${AUFGABEN.map((a, i) => `<button class="ws-achip${a.id === aufgSel ? ' ws-aktiv' : ''}${g[a.id] ? ' ws-ok' : ''}" data-a="aufg" data-v="${a.id}">${g[a.id] ? '✓' : i + 1}</button>`).join('')}</div>
        <div id="ws-aufg"></div></section>
      ${legende()}`;
    filterSetzen(ftext, true); aufgabeZeichnen(); panelZeichnen(); detailsZeichnen(); knoepfe();
  }
  function aufgabeZeichnen() {
    const el = document.getElementById('ws-aufg'); if (!el) return;
    const a = AUFGABEN.find(x => x.id === aufgSel), g = P().geloest[a.id];
    const szN = a.sz === 'netsim' ? 'Aus Netzwerk-Simulator' : SZEN[a.sz].n;
    let ein = '';
    if (a.art === 'text') ein = `<div class="ws-zeile"><input id="ws-antw" class="ws-ein" placeholder="Antwort" aria-label="Antwort"><button class="glas knopf klein" data-a="pruef">Prüfen</button></div>`;
    else if (a.art === 'wahl') ein = a.wahl.map((w, i) => `<label class="ws-wahl"><input type="radio" name="ws-wahl" value="${i}"> ${E2(w)}</label>`).join('') + `<button class="glas knopf klein" data-a="pruef">Prüfen</button>`;
    else if (a.art === 'paket') ein = `<button class="glas knopf klein" data-a="pruef">Ausgewähltes Paket prüfen</button>`;
    else if (a.art === 'filter') ein = `<button class="glas knopf klein" data-a="pruef">Aktuellen Filter prüfen</button>`;
    else ein = `<button class="glas knopf klein" data-a="netsim">🔗 Mitschnitt aus Netzwerk-Simulator</button> <button class="glas knopf klein" data-a="go-netsim">Zum Netzwerk-Simulator</button>`;
    el.innerHTML = `<p><b>${E2(a.t)}</b> ${g ? '<span class="ws-gut">✓ gelöst</span>' : ''}</p><p class="ws-klein">Mitschnitt: ${E2(szN)} ${szen !== a.sz ? `<button class="glas knopf klein" data-a="szen" data-v="${a.sz}">laden</button>` : '(geladen)'}</p>${ein}
      <div id="ws-afb" class="ws-klein"></div><details class="ws-klein"><summary>Tipp / Lösung</summary><p>${E2(a.tipp)}</p><p>Lösung: <code>${E2(a.loes)}</code></p></details>`;
  }
  const FARBE = { arp: 'ws-c-arp', icmp: 'ws-c-icmp', fehler: 'ws-c-err', rst: 'ws-c-err', dnsfehler: 'ws-c-err', syn: 'ws-c-syn', tcp: 'ws-c-tcp', udp: 'ws-c-udp', dns: 'ws-c-udp', http: 'ws-c-http', tls: 'ws-c-tcp', smb: 'ws-c-smb', ldap: 'ws-c-tcp', krb: 'ws-c-udp', syslog: 'ws-c-udp' };
  function filterSetzen(t, still) {
    ftext = t; const r = filterAnwenden(t, pakete); fres = r;
    const inp = document.getElementById('ws-filter'), err = document.getElementById('ws-ferr');
    if (inp) { inp.classList.toggle('ws-f-ok', r.ok && !r.leer); inp.classList.toggle('ws-f-bad', !r.ok); }
    if (err) err.textContent = r.ok ? '' : '✗ Ungültiger Filter: ' + r.err;
    if (r.ok) { P().filter = t; if (!still) speichern(); }
    listeZeichnen();
  }
  function listeZeichnen(anim) {
    const tb = document.getElementById('ws-tbody'); if (!tb) return;
    const menge = new Set((fres && fres.ok ? fres.treffer : pakete).map(p => p.nr));
    const zeige = pakete.slice(0, sichtbar).filter(p => menge.has(p.nr));
    tb.innerHTML = zeige.map(p => `<tr class="${FARBE[p.farbe] || 'ws-c-tcp'}${p.nr === sel ? ' ws-sel' : ''}${anim && p.nr > sichtbar - 2 ? ' ws-neu' : ''}" data-a="paket" data-v="${p.nr}" tabindex="0"><td>${p.nr}</td><td>${p.zeit.toFixed(6)}</td><td>${E2(p.quelle)}</td><td>${E2(p.ziel)}</td><td>${E2(p.proto)}</td><td>${p.len}</td><td>${E2(p.info)}</td></tr>`).join('');
    if (anim) { const b = document.getElementById('ws-listebox'); if (b) b.scrollTop = b.scrollHeight; }
    const st = document.getElementById('ws-status');
    if (st) st.textContent = `Pakete: ${sichtbar}${sichtbar < pakete.length ? ' (Aufzeichnung läuft)' : ''} · Angezeigt: ${zeige.length} (${sichtbar ? Math.round(zeige.length / sichtbar * 1000) / 10 : 0} %)${ftext && fres && fres.ok ? ' · Filter: ' + ftext : ''}`;
  }
  function detailsZeichnen() {
    const d = document.getElementById('ws-details'), hx = document.getElementById('ws-hex'); if (!d || !hx) return;
    const p = pakete.find(x => x.nr === sel);
    if (!p) { d.innerHTML = '<p class="ws-klein">Paket in der Liste anklicken → Details (Schichten) und Bytes.</p>'; hx.innerHTML = ''; return; }
    d.innerHTML = p.schichten.map((s, i) => `<details class="ws-sch"${offen[i] ? ' open' : ''} data-i="${i}"><summary data-a="feld" data-o="${s.o}" data-l="${s.l}">${E2(s.n)}</summary><ul>${s.f.map(f => `<li><span class="ws-feld${feldSel && feldSel.o === f.o && feldSel.l === f.l && f.l ? ' ws-fsel' : ''}" data-a="feld" data-o="${f.o}" data-l="${f.l}" tabindex="0">${E2(f.t)}</span>${f.sub ? `<ul>${f.sub.map(x => `<li class="ws-klein">${E2(x)}</li>`).join('')}</ul>` : ''}</li>`).join('')}</ul></details>`).join('');
    const b = p.bytes, von = feldSel ? feldSel.o : -1, bis = feldSel ? feldSel.o + feldSel.l : -1;
    let h = '';
    for (let o = 0; o < b.length; o += 16) {
      const r = b.slice(o, o + 16);
      h += `<div class="ws-hz"><span class="ws-ho">${o.toString(16).padStart(4, '0')}</span><span class="ws-hb">${r.map((x, j) => `<span class="${o + j >= von && o + j < bis ? 'ws-hm' : ''}" data-b="${o + j}">${x.toString(16).padStart(2, '0')}</span>`).join('')}</span><span class="ws-ha">${r.map((x, j) => `<span class="${o + j >= von && o + j < bis ? 'ws-hm' : ''}">${x >= 32 && x < 127 ? E2(String.fromCharCode(x)) : '.'}</span>`).join('')}</span></div>`;
    }
    hx.innerHTML = h + (feldSel && feldSel.l ? `<p class="ws-klein">Markiert: Bytes ${feldSel.o}–${feldSel.o + feldSel.l - 1} (${feldSel.l} Bytes)</p>` : '');
  }
  function folgen() {
    const p = pakete.find(x => x.nr === sel);
    if (!p || p.strom === undefined) return { ok: false, html: '<p>Wähle zuerst ein TCP-Paket aus (z. B. das HTTP-GET).</p>' };
    const st = pakete.filter(x => x.strom === p.strom && x.app !== null || (x.strom === p.strom && x.v['tcp.len'] > 0));
    const teile = st.map(x => { const tls = x.protos.has('tls') || (x.app && x.app.art === 'tls'), smb = x.protos.has('smb2') || x.protos.has('ldap');
      const txt = x.app && x.app.art === 'http' ? x.app.text : tls ? `🔒 [TLS – verschlüsselt, ${x.v['tcp.len']} Bytes${x.app && x.app.text ? ': ' + x.app.text : ''}]\n` + Array.from({ length: Math.min(3, Math.ceil(x.v['tcp.len'] / 60)) }, () => '.'.repeat(56)).join('\n') : (smb ? `[${x.proto}: ${x.info}]\n` : '') + x.bytes.slice(-x.v['tcp.len']).map(c => c >= 32 && c < 127 ? String.fromCharCode(c) : '.').join('').slice(0, 300);
      return `<pre class="ws-st ${x.dir ? 'ws-st-s' : 'ws-st-c'}">${E2(txt)}</pre>`; });
    const c = pakete.find(x => x.strom === p.strom);
    return { ok: true, html: `<h3>Follow TCP Stream (tcp.stream eq ${p.strom})</h3><p class="ws-klein"><span class="ws-st-c">■ Client ${E2(c.quelle)}:${c.v['tcp.srcport']}</span> · <span class="ws-st-s">■ Server ${E2(c.ziel)}:${c.v['tcp.dstport']}</span></p>${teile.join('') || '<p>Keine Nutzdaten in diesem Stream (nur Handshake/Flags).</p>'}<button class="glas knopf klein" data-a="streamfilter" data-v="${p.strom}">Als Filter: tcp.stream==${p.strom}</button>` };
  }
  function hierarchie() {
    const z = {}, ges = pakete.length;
    for (const p of pakete) { let k = ''; for (const pr of [...p.protos].filter(x => !['ethertype', 'bootp', 'nbss'].includes(x))) { k = k ? k + ' › ' + pr : pr; z[k] = (z[k] || 0) + 1; } }
    return `<h3>Protokollhierarchie (${ges} Pakete)</h3><table class="ws-hier"><tr><th>Protokoll</th><th>Pakete</th><th>Anteil</th></tr>${Object.entries(z).map(([k, n]) => `<tr><td style="padding-left:${(k.split('›').length - 1) * 12}px">${E2(k.split(' › ').pop())}</td><td>${n}</td><td><span class="ws-bar" style="width:${Math.round(n / ges * 80)}px"></span> ${(n / ges * 100).toFixed(1)} %</td></tr>`).join('')}</table>`;
  }
  function panelZeichnen() {
    const el = document.getElementById('ws-panel'); if (!el) return;
    el.className = panel ? 'glas ws-panelbox' : '';
    el.innerHTML = panel === 'follow' ? folgen().html + ' <button class="glas knopf klein" data-a="zu">Schließen</button>' : panel === 'stat' ? hierarchie() + ' <button class="glas knopf klein" data-a="zu">Schließen</button>' : '';
  }
  function legende() {
    const L = [['Mitschnitt (Capture)', 'Was: Aufzeichnung aller Frames an einer Netzwerkkarte (pcap/pcapng). Wie: Karte im Promiscuous-Modus, Wireshark/tcpdump. Wann: Fehlersuche, Sicherheitsanalyse, Lernen. Wo: am Client, am Server oder per Port-Spiegelung am Switch. Warum: Man sieht, was wirklich über die Leitung geht – nicht, was die Anwendung behauptet.'],
      ['Anzeigefilter vs. Mitschnittfilter', 'Anzeigefilter (ip.addr==10.0.0.10, tcp.port==443) blenden nur aus – die Pakete bleiben im Mitschnitt. Mitschnittfilter (BPF, z. B. „host 10.0.0.10 and port 53“) werden VOR der Aufzeichnung gesetzt, alles andere wird gar nicht erst gespeichert. Andere Syntax!'],
      ['ARP', 'Was: Auflösung IPv4 → MAC im eigenen Netz. Wie: „Who has 10.0.0.1? Tell 10.0.0.142“ als Broadcast, Antwort per Unicast. Wann: vor dem ersten Frame an eine IP (bzw. ans Gateway, wenn das Ziel in einem anderen Netz liegt). Warum: Ethernet stellt nur an MAC-Adressen zu.'],
      ['DHCP – DORA', 'Discover (Broadcast, 0.0.0.0 → 255.255.255.255, UDP 68→67), Offer, Request, ACK. Im ACK stehen IP (yiaddr), Maske (Opt. 1), Gateway (3), DNS (6), Lease-Zeit (51). Nach der Hälfte der Lease (T1) verlängert der Client.'],
      ['DNS', 'UDP/TCP 53. Query mit Transaction ID, Response mit derselben ID. A = IPv4, AAAA = IPv6, CNAME = Alias. Reply code 3 = NXDOMAIN (Name existiert nicht). In AD findet der Client DCs über SRV-Einträge.'],
      ['TCP-3-Wege-Handshake', 'SYN → SYN/ACK → ACK. Danach Daten mit Seq/Ack-Nummern, Ende mit FIN/ACK (geordnet) oder RST (sofort abbrechen). Keine Antwort auf SYN → Retransmissions (1 s, 2 s, 4 s …) → Firewall verwirft oder Host aus.'],
      ['TLS', 'HTTPS = HTTP in TLS (TCP 443). Im Client Hello stehen Cipher Suites und die SNI (Hostname im Klartext!). Ab Server Hello ist der Inhalt verschlüsselt – man sieht nur „Application Data“. Ohne Schlüssel kein Mitlesen.'],
      ['Kerberos, LDAP, SMB', 'Kerberos (UDP/TCP 88): AS-REQ/AS-REP holt das TGT, TGS-REQ/TGS-REP ein Dienstticket (z. B. cifs/fs01). LDAP (389) fragt das AD ab (bind, searchRequest). SMB2/3 (445): Negotiate → Session Setup → Tree Connect \\\\server\\freigabe.'],
      ['Port-Scan', 'SYN-Scan (nmap -sS): Angreifer schickt SYN an viele Ports. SYN/ACK = offen (Scanner antwortet mit RST), RST/ACK = geschlossen, keine Antwort = gefiltert. Erkennen: viele SYNs einer Quelle an viele Ports in kurzer Zeit.'],
      ['Port-Spiegelung (SPAN)', 'Ein Switch leitet nur gezielt weiter – fremden Verkehr sieht man am eigenen Port nicht. Port-Spiegelung (Cisco: monitor session) kopiert den Verkehr eines Ports/VLANs auf den Analyse-Port. Alternative: TAP. Rechtlich: Mitschnitt nur mit Erlaubnis (Datenschutz, Betriebsrat)!']];
    return `<details class="glas ws-leg"><summary><b>Legende: Was – Wie – Wann – Wo – Warum</b></summary><dl>${L.map(([a, b]) => `<dt>${E2(a)}</dt><dd>${E2(b)}</dd>`).join('')}</dl><p class="ws-klein">Farben wie in Wireshark: <span class="ws-c-arp ws-tag">ARP</span> <span class="ws-c-udp ws-tag">UDP/DNS</span> <span class="ws-c-tcp ws-tag">TCP</span> <span class="ws-c-http ws-tag">HTTP</span> <span class="ws-c-syn ws-tag">SYN/FIN</span> <span class="ws-c-icmp ws-tag">ICMP</span> <span class="ws-c-smb ws-tag">SMB</span> <span class="ws-c-err ws-tag">Fehler/RST</span></p></details>`;
  }
  function waehle(nr) { sel = nr; feldSel = null; listeZeichnen(); detailsZeichnen(); if (panel === 'follow') panelZeichnen(); }
  function klick(e) {
    const t = e.target.closest('[data-a]'); if (!t) return;
    const a = t.dataset.a, v = t.dataset.v;
    if (a === 'paket') return waehle(+v);
    if (a === 'feld') { if (t.tagName === 'SUMMARY') { const det = t.parentElement; offen[det.dataset.i] = !det.open; } feldSel = { o: +t.dataset.o, l: +t.dataset.l }; const op = {}; document.querySelectorAll('#ws-details details').forEach(d => { op[d.dataset.i] = d.open; }); if (t.tagName === 'SUMMARY') { op[t.parentElement.dataset.i] = !t.parentElement.open; e.preventDefault(); } offen = op; detailsZeichnen(); return; }
    if (a === 'rec') return aufzeichnen();
    if (a === 'stopp') return stopp();
    if (a === 'sofort') { stopp(); sichtbar = pakete.length; return listeZeichnen(); }
    if (a === 'netsim') { laden('netsim'); return toast(nsInfo.slice(0, 120)); }
    if (a === 'go-netsim') return gehe('netsim');
    if (a === 'filter') return filterSetzen(document.getElementById('ws-filter').value);
    if (a === 'fweg') { document.getElementById('ws-filter').value = ''; return filterSetzen(''); }
    if (a === 'follow') { panel = 'follow'; return panelZeichnen(); }
    if (a === 'stat') { panel = 'stat'; return panelZeichnen(); }
    if (a === 'zu') { panel = ''; return panelZeichnen(); }
    if (a === 'streamfilter') { document.getElementById('ws-filter').value = 'tcp.stream==' + v; return filterSetzen('tcp.stream==' + v); }
    if (a === 'aufg') { aufgSel = v; zeichne(); return; }
    if (a === 'szen') return laden(v);
    if (a === 'pruef') {
      const au = AUFGABEN.find(x => x.id === aufgSel);
      const antw = au.art === 'text' ? document.getElementById('ws-antw').value : au.art === 'wahl' ? (document.querySelector('input[name="ws-wahl"]:checked') || {}).value : null;
      const r = pruefeAufgabe(aufgSel, antw);
      if (r.ok) zeichne();
      const fb = document.getElementById('ws-afb'); if (fb) { fb.textContent = (r.ok ? '✓ ' : '✗ ') + r.msg; fb.className = 'ws-klein ' + (r.ok ? 'ws-gut' : 'ws-schlecht'); }
    }
  }
  function taste(e) {
    if (e.target.id === 'ws-filter' && e.key === 'Enter') return filterSetzen(e.target.value);
    if (e.target.id === 'ws-antw' && e.key === 'Enter') { const r = pruefeAufgabe(aufgSel, e.target.value); if (r.ok) zeichne(); const fb = document.getElementById('ws-afb'); if (fb) { fb.textContent = (r.ok ? '✓ ' : '✗ ') + r.msg; fb.className = 'ws-klein ' + (r.ok ? 'ws-gut' : 'ws-schlecht'); } return; }
    if (e.key === 'Enter' && e.target.dataset && (e.target.dataset.a === 'paket' || e.target.dataset.a === 'feld')) { e.preventDefault(); klick(e); }
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && e.target.dataset && e.target.dataset.a === 'paket') { e.preventDefault(); const n = e.key === 'ArrowDown' ? e.target.nextElementSibling : e.target.previousElementSibling; if (n) { waehle(+n.dataset.v); const r = document.querySelector(`#ws-tbody tr[data-v="${n.dataset.v}"]`); if (r) r.focus(); } }
  }
  function eingabe(e) { if (e.target.id === 'ws-filter') { const r = filterAnwenden(e.target.value, pakete); e.target.classList.toggle('ws-f-ok', r.ok && !r.leer); e.target.classList.toggle('ws-f-bad', !r.ok); } }
  function stil() {
    if (document.getElementById('ws-style')) return;
    const st = document.createElement('style'); st.id = 'ws-style';
    st.textContent = `
.ws-leiste{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:8px;border-radius:12px}
.ws-lab{display:flex;gap:6px;align-items:center;flex-wrap:wrap;max-width:100%}.ws-lab select{max-width:100%;min-width:0}
.ws-rec-an{color:var(--rot)!important;animation:ws-blink 1s infinite}@keyframes ws-blink{50%{opacity:.55}}
.ws-szentxt{color:var(--tinte-leise);font-size:.9em;margin:6px 0}
.ws-filter{display:flex;gap:6px;margin:6px 0}.ws-filter input{flex:1;min-width:0;font-family:var(--mono);padding:7px 9px;border-radius:8px;border:2px solid var(--glas-rand);background:var(--code-bg);color:var(--tinte)}
.ws-f-ok{border-color:#3fbf5a!important;background:rgba(63,191,90,.14)!important}.ws-f-bad{border-color:#e0464b!important;background:rgba(224,70,75,.18)!important}
.ws-ferr{color:var(--rot);font-size:.88em;min-height:1.1em}
.ws-listebox{max-height:320px;overflow:auto;border:1px solid var(--glas-rand);border-radius:8px;max-width:100%}
.ws-liste{border-collapse:collapse;width:100%;font-family:var(--mono);font-size:.76em;white-space:nowrap}
.ws-liste th{position:sticky;top:0;background:var(--code-bg);color:var(--tinte);text-align:left;padding:3px 6px;z-index:1}
.ws-liste td{padding:2px 6px;color:#12272e;cursor:pointer}.ws-liste tr.ws-sel td{background:#2c5cc5!important;color:#fff}
.ws-neu{animation:ws-ein .35s ease-out}@keyframes ws-ein{from{opacity:0;transform:translateX(-12px)}}
.ws-c-arp,.ws-c-arp td{background:#faf0d7}.ws-c-udp,.ws-c-udp td{background:#daeeff}.ws-c-tcp,.ws-c-tcp td{background:#e7e6ff}.ws-c-http,.ws-c-http td{background:#e4ffc7}
.ws-c-syn,.ws-c-syn td{background:#a0a0a0}.ws-c-icmp,.ws-c-icmp td{background:#fce0ff}.ws-c-smb,.ws-c-smb td{background:#feffd0}.ws-c-err,.ws-c-err td{background:#12272e;color:#f78787!important}
.ws-tag{padding:1px 6px;border-radius:4px;color:#12272e}.ws-tag.ws-c-err{color:#f78787}
.ws-status{font-size:.8em;color:var(--tinte-leise);margin:4px 0 8px}
.ws-unten{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px}
.ws-details,.ws-hex{padding:8px;border-radius:10px;max-height:380px;overflow:auto;font-family:var(--mono);font-size:.76em}
.ws-sch summary{cursor:pointer;font-weight:600;word-break:break-word}.ws-sch ul{margin:2px 0 4px;padding-left:18px}
.ws-feld{cursor:pointer;word-break:break-word}.ws-feld:hover{text-decoration:underline}.ws-fsel{background:#2c5cc5;color:#fff;border-radius:3px}
.ws-hz{display:flex;gap:10px;white-space:nowrap}.ws-ho{color:var(--tinte-leise)}.ws-hb span{margin-right:4px}.ws-hm{background:#2c5cc5;color:#fff;border-radius:2px}
.ws-panelbox{padding:10px;border-radius:12px;margin:8px 0;max-height:420px;overflow:auto}
.ws-st{white-space:pre-wrap;word-break:break-word;margin:4px 0;padding:6px;border-radius:6px;font-size:.78em;font-family:var(--mono)}
.ws-st-c{color:#e0464b}.ws-st-s{color:#3b82f6}pre.ws-st-c{background:rgba(224,70,75,.1)}pre.ws-st-s{background:rgba(59,130,246,.1)}
.ws-hier{border-collapse:collapse;font-size:.85em}.ws-hier td,.ws-hier th{padding:2px 8px;text-align:left}.ws-bar{display:inline-block;height:8px;background:var(--akzent);border-radius:4px}
.ws-aufg{padding:10px;border-radius:12px;margin:10px 0}.ws-aliste{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px}
.ws-achip{min-width:34px;padding:4px 8px;border-radius:8px;border:1px solid var(--glas-rand);background:var(--glas-hover);color:var(--tinte);cursor:pointer}
.ws-achip.ws-aktiv{outline:2px solid var(--akzent)}.ws-achip.ws-ok{color:var(--gruen)}
.ws-zeile{display:flex;gap:6px}.ws-ein{flex:1;min-width:0;padding:6px 8px;border-radius:8px;border:1px solid var(--glas-rand);background:var(--code-bg);color:var(--tinte)}
.ws-wahl{display:block;margin:3px 0}.ws-klein{font-size:.85em;color:var(--tinte-leise)}.ws-gut{color:var(--gruen)}.ws-schlecht{color:var(--rot)}
.ws-leg{padding:10px;border-radius:12px;margin:10px 0}.ws-leg summary{cursor:pointer}.ws-leg dt{font-weight:700;margin-top:6px}.ws-leg dd{margin:2px 0 0 0}
@media (max-width:760px){.ws-unten{grid-template-columns:minmax(0,1fr)}.ws-listebox{max-height:260px}.ws-hex{font-size:.66em}}
`;
    document.head.appendChild(st);
  }
  function ansicht() {
    krumen([START, { txt: 'Werkzeuge', go: 'werkzeuge' }, { txt: 'Wireshark-Simulator' }]);
    stil(); const w = P(); ftext = w.filter || '';
    $('#inhalt').innerHTML = `<h1>Wireshark-Simulator</h1><p class="unter">Mitschnitte wie im echten Wireshark: Pakete mitschneiden, filtern, Schichten aufklappen, Bytes lesen, TCP-Streams verfolgen – und Netzwerkprobleme finden.</p><div id="ws-wurzel"></div>`;
    const el = $('#ws-wurzel');
    el.addEventListener('click', klick); el.addEventListener('keydown', taste); el.addEventListener('input', eingabe);
    el.addEventListener('change', e => { if (e.target.id === 'ws-szen') laden(e.target.value); });
    laden(w.szenario || 'buero', true);
  }
  window.VIEWS = Object.assign(window.VIEWS || {}, { wireshark: ansicht });
  return {
    ansicht, AUFGABEN, SZEN,
    alleGeloest: () => { try { return AUFGABEN.every(a => P().geloest[a.id]); } catch { return false; } },
    _test: { laden: (id, anim = false) => laden(id, anim), pakete: () => pakete, sofort: () => { stopp(); sichtbar = pakete.length; listeZeichnen(); }, filter: t => { const r = filterAnwenden(t, pakete); return { ok: r.ok, err: r.err, n: r.treffer.length, nr: r.treffer.map(p => p.nr) }; }, setzeFilter: t => filterSetzen(t), waehle, pruefe: pruefeAufgabe, ausNetsim, parse, pruefsumme, sichtbar: () => sichtbar }
  };
})();
window.Wireshark = Wireshark;
