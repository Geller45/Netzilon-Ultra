// Netzilon Ultra – Netzwerk-Simulator „Packet-Tracer-light“
// Idee und Weiterleitungslogik abgeleitet aus NetworkGodMode (builder.js: bAnalyze/bDeliver/bPing), erweitert um
// VLANs (Access/Trunk), Router-Subinterfaces (Router-on-a-Stick), Traceroute, animierte Pakete, Aufgaben + Subnetting-Generator.
const Netsim = (() => {
  const TYP = { pc: { n: 'PC', icon: '💻', end: true }, server: { n: 'Server', icon: '🗄', end: true }, switch: { n: 'Switch', icon: '⇆' }, router: { n: 'Router', icon: '⇄', l3: true } };
  const ip2n = s => { const p = String(s).trim().split('.').map(Number); if (p.length !== 4 || p.some(x => !Number.isInteger(x) || x < 0 || x > 255)) return null; return ((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3]; };
  const n2ip = n => [24, 16, 8, 0].map(s => (n >>> s) & 255).join('.');
  const maske = p => p === 0 ? 0 : (0xFFFFFFFF << (32 - p)) >>> 0;
  const gleichesNetz = (a, b, p) => ((a & maske(p)) >>> 0) === ((b & maske(p)) >>> 0);
  function prefixAus(m) {
    m = String(m || '').trim().replace(/^\//, ''); if (!m) return null;
    if (/^\d{1,2}$/.test(m)) { const p = +m; return p >= 0 && p <= 32 ? p : null; }
    const n = ip2n(m); if (n === null) return null; const b = n.toString(2).padStart(32, '0'); if (!/^1*0*$/.test(b)) return null; return b.indexOf('0') < 0 ? 32 : b.indexOf('0');
  }
  function ipCidr(s) { // "192.168.1.1/24"
    const m = String(s || '').trim().match(/^(\d+\.\d+\.\d+\.\d+)\s*\/\s*(\d{1,2})$/); if (!m) return null;
    const n = ip2n(m[1]), p = +m[2]; return n === null || p > 32 ? null : { n, p, ip: m[1] };
  }

  let T = null, aufgabe = null, sel = null, modus = 'bewegen', verbVon = null, nid = 1, animRaf = null;
  const leer = () => ({ nodes: [], links: [] });
  const neuId = p => p + (nid++) + '_' + Date.now().toString(36).slice(-3);
  function knoten(type, name, x, y, extra = {}) { return Object.assign({ id: neuId('n'), type, name, x, y, ip: '', maske: '', gw: '', routes: '' }, extra); }
  function link(a, b, extra = {}) { return Object.assign({ id: neuId('l'), a, b, ifA: '', ifB: '', vlanA: '1', vlanB: '1' }, extra); }
  const by = id => T.nodes.find(n => n.id === id);
  const portName = (node, l) => { const ls = T.links.filter(x => x.a === node.id || x.b === node.id); const k = ls.indexOf(l); return node.type === 'router' ? `Gi0/${k}` : node.type === 'switch' ? `Fa0/${k + 1}` : 'NIC'; };
  const seite = (l, node) => l.a === node.id ? 'A' : 'B';
  const ifTxt = (l, node) => l['if' + seite(l, node)] || '';
  const vlanTxt = (l, node) => l['vlan' + seite(l, node)] || '1';

  // Router-Schnittstelle: "ip/präfix [vlan N]" mehrfach mit ";" (Subinterfaces)
  function routerIfs(l, node) {
    return ifTxt(l, node).split(';').map(s => s.trim()).filter(Boolean).map(s => { const m = s.match(/^(\S+)(?:\s+vlan\s+(\d+))?$/i); const c = m && ipCidr(m[1]); return c ? { ...c, vlan: m[2] ? +m[2] : null, roh: s } : { fehler: s }; });
  }
  // ---------- Analyse: Broadcast-Domänen mit VLANs ----------
  function analyse() {
    const par = {}; const find = x => { if (par[x] === undefined) par[x] = x; return par[x] === x ? x : (par[x] = find(par[x])); }; const uni = (a, b) => { par[find(a)] = find(b); };
    const vlans = new Set([1]);
    T.links.forEach(l => [l.vlanA, l.vlanB].forEach(v => { if (/^\d+$/.test(v)) vlans.add(+v); }));
    T.nodes.filter(n => n.type === 'router').forEach(r => T.links.forEach(l => { if (l.a === r.id || l.b === r.id) routerIfs(l, r).forEach(i => { if (i.vlan) vlans.add(i.vlan); }); }));
    const ifaces = [];
    const endKey = (node, l) => {
      if (TYP[node.type].end) return ['E:' + node.id];
      if (node.type === 'router') return routerIfs(l, node).filter(i => !i.fehler).map((i, k) => { const key = `R:${node.id}:${l.id}:${k}`; ifaces.push({ node, link: l, ...i, key }); return key; });
      return [];
    };
    for (const l of T.links) {
      const A = by(l.a), B = by(l.b); if (!A || !B) continue;
      const swA = A.type === 'switch', swB = B.type === 'switch';
      if (swA && swB) {
        const ta = l.vlanA === 'trunk', tb = l.vlanB === 'trunk';
        if (ta && tb) vlans.forEach(v => uni(`S:${A.id}:${v}`, `S:${B.id}:${v}`));
        else uni(`S:${A.id}:${ta ? 1 : +l.vlanA || 1}`, `S:${B.id}:${tb ? 1 : +l.vlanB || 1}`);
      } else if (swA || swB) {
        const sw = swA ? A : B, o = swA ? B : A, modusPort = vlanTxt(l, sw);
        if (o.type === 'router') {
          routerIfs(l, o).forEach((i, k) => { if (i.fehler) return; const key = `R:${o.id}:${l.id}:${k}`; ifaces.push({ node: o, link: l, ...i, key });
            if (modusPort === 'trunk') uni(key, `S:${sw.id}:${i.vlan || 1}`); else if (!i.vlan || i.vlan === +modusPort) uni(key, `S:${sw.id}:${+modusPort || 1}`); });
        } else uni('E:' + o.id, `S:${sw.id}:${modusPort === 'trunk' ? 1 : +modusPort || 1}`);
      } else {
        const ka = endKey(A, l), kb = endKey(B, l);
        if (ka.length && kb.length) uni(ka[0], kb[0]);
      }
    }
    const domEnd = n => find('E:' + n.id);
    ifaces.forEach(i => i.dom = find(i.key));
    return { ifaces, domEnd };
  }
  function endIp(n) { const ip = ip2n(n.ip), p = prefixAus(n.maske); return ip === null || p === null ? null : { n: ip, p }; }
  // Physischer Pfad (für die Animation): Breitensuche, Switches dürfen durchlaufen werden
  function physPfad(von, nach) {
    const q = [[von]], seen = new Set([von]);
    while (q.length) { const p = q.shift(), cur = p[p.length - 1]; if (cur === nach) return p;
      for (const l of T.links) { const nx = l.a === cur ? l.b : l.b === cur ? l.a : null; if (!nx || seen.has(nx)) continue; const n = by(nx); if (!n) continue; if (n.type !== 'switch' && nx !== nach) continue; seen.add(nx); q.push([...p, nx]); } }
    return [von, nach];
  }
  // ---------- Zustellung ----------
  function zustellen(A, src, zielIp) {
    const tr = [src.id], hops = [];
    const si = endIp(src); if (!si) return { ok: false, msg: `${src.name}: keine gültige IP-Adresse/Subnetzmaske`, tr, wo: src.id };
    if (zielIp === null) return { ok: false, msg: 'Ziel-IP ungültig', tr };
    const dom = A.domEnd(src);
    const findeZiel = (d, ip) => T.nodes.find(n => TYP[n.type].end && A.domEnd(n) === d && endIp(n) && endIp(n).n === ip) || A.ifaces.find(i => i.dom === d && i.n === ip)?.node;
    if (gleichesNetz(si.n, zielIp, si.p)) {
      const t = findeZiel(dom, zielIp);
      if (!t) {
        const woanders = T.nodes.find(n => TYP[n.type].end && endIp(n) && endIp(n).n === zielIp);
        return { ok: false, msg: woanders ? `ARP ohne Antwort: ${n2ip(zielIp)} (${woanders.name}) liegt im selben IP-Netz, aber in einer anderen Broadcast-Domäne – VLAN-Zuordnung oder Verkabelung prüfen` : `ARP ohne Antwort: ${n2ip(zielIp)} gibt es im lokalen Netz nicht`, tr, wo: src.id };
      }
      return { ok: true, msg: 'direkt im selben Netz (Layer 2)', tr: physPfad(src.id, t.id), hops, ziel: t };
    }
    const gw = ip2n(src.gw);
    if (gw === null) return { ok: false, msg: `${src.name}: Ziel liegt in einem anderen Netz, aber es ist kein Standardgateway eingetragen`, tr, wo: src.id };
    if (!gleichesNetz(gw, si.n, si.p)) return { ok: false, msg: `${src.name}: Gateway ${src.gw} liegt nicht im eigenen Netz (${n2ip(si.n & maske(si.p))}/${si.p})`, tr, wo: src.id };
    const gi = A.ifaces.find(i => i.n === gw && i.dom === dom);
    if (!gi) return { ok: false, msg: `Gateway ${src.gw} antwortet nicht – kein Router mit dieser Adresse im eigenen Netz/VLAN`, tr, wo: src.id };
    let pfad = physPfad(src.id, gi.node.id), cur = gi.node; hops.push({ name: cur.name, ip: n2ip(gi.n) });
    for (let hop = 0; hop < 16; hop++) {
      const raus = A.ifaces.find(i => i.node === cur && gleichesNetz(i.n, zielIp, i.p));
      if (raus) {
        if (raus.n === zielIp) return { ok: true, msg: 'Ziel ist eine Router-Schnittstelle', tr: pfad, hops, ziel: cur };
        const t = findeZiel(raus.dom, zielIp);
        if (!t) return { ok: false, msg: `${cur.name}: ${n2ip(zielIp)} im Netz hinter ${n2ip(raus.n)} nicht gefunden (ARP ohne Antwort)`, tr: pfad, hops, wo: cur.id };
        return { ok: true, msg: `über ${hops.map(h => h.name).join(' → ')}`, tr: [...pfad, ...physPfad(cur.id, t.id).slice(1)], hops, ziel: t };
      }
      let best = null;
      (cur.routes || '').split(/\r?\n/).forEach(l => { const m = l.trim().match(/^(\d+\.\d+\.\d+\.\d+)\s*\/\s*(\d+)\s+(?:via\s+)?(\d+\.\d+\.\d+\.\d+)$/i); if (!m) return; const net = ip2n(m[1]), p = +m[2]; if (net !== null && gleichesNetz(net, zielIp, p) && (!best || p > best.p)) best = { p, nh: ip2n(m[3]) }; });
      if (!best) return { ok: false, msg: `${cur.name} kennt keine Route zu ${n2ip(zielIp)} (statische Route oder Standardroute 0.0.0.0/0 fehlt)`, tr: pfad, hops, wo: cur.id };
      const via = A.ifaces.find(i => i.node === cur && gleichesNetz(i.n, best.nh, i.p));
      if (!via) return { ok: false, msg: `${cur.name}: Next Hop ${n2ip(best.nh)} liegt in keinem direkt angeschlossenen Netz`, tr: pfad, hops, wo: cur.id };
      const nx = A.ifaces.find(j => j.n === best.nh && j.dom === via.dom && j.node !== cur);
      if (!nx) return { ok: false, msg: `Next Hop ${n2ip(best.nh)} antwortet nicht`, tr: pfad, hops, wo: cur.id };
      pfad = [...pfad, ...physPfad(cur.id, nx.node.id).slice(1)]; cur = nx.node; hops.push({ name: cur.name, ip: n2ip(nx.n) });
    }
    return { ok: false, msg: 'Routing-Schleife – TTL abgelaufen', tr: pfad, hops };
  }
  function ping(src, zielIpTxt) {
    const A = analyse(), zielIp = ip2n(zielIpTxt);
    const hin = zustellen(A, src, zielIp);
    if (!hin.ok) return { ...hin, msg: 'Hinweg: ' + hin.msg };
    const ziel = hin.ziel;
    if (ziel && TYP[ziel.type].end) {
      const rueck = zustellen(A, ziel, endIp(src).n);
      if (!rueck.ok) return { ok: false, msg: 'Hinweg klappt, aber der Rückweg scheitert: ' + rueck.msg, tr: hin.tr, hops: hin.hops, wo: rueck.wo };
    }
    return hin;
  }
  function doppelteIps() {
    const A = analyse(), m = {}; const out = [];
    T.nodes.filter(n => TYP[n.type].end && endIp(n)).forEach(n => { const k = A.domEnd(n) + '|' + endIp(n).n; if (m[k]) out.push(`${m[k]} und ${n.name} haben dieselbe IP ${n.ip}`); else m[k] = n.name; });
    return out;
  }

  // ---------- Aufgaben ----------
  const AUFGABEN = [
    { id: 'zwei-pcs', titel: '1. Zwei PCs am Switch', text: 'PC1 und PC2 hängen am selben Switch. Vergib beiden eine IP-Adresse aus 192.168.1.0/24 (Maske 255.255.255.0), sodass PC1 PC2 anpingen kann.',
      topo() { const s = knoten('switch', 'SW1', 450, 140), a = knoten('pc', 'PC1', 280, 360), b = knoten('pc', 'PC2', 620, 360); return { nodes: [s, a, b], links: [link(s.id, a.id), link(s.id, b.id)] }; }, ziele: [['PC1', 'PC2', true]] },
    { id: 'gateway', titel: '2. Standardgateway', text: 'PC1 (192.168.1.10/24) soll den Server SRV1 (10.0.0.10) im anderen Netz erreichen. Der Router ist fertig konfiguriert – was fehlt am PC?',
      topo() { const r = knoten('router', 'R1', 450, 90), s1 = knoten('switch', 'SW1', 250, 230), s2 = knoten('switch', 'SW2', 650, 230), p = knoten('pc', 'PC1', 160, 420, { ip: '192.168.1.10', maske: '255.255.255.0' }), v = knoten('server', 'SRV1', 740, 420, { ip: '10.0.0.10', maske: '/24', gw: '10.0.0.1' });
        return { nodes: [r, s1, s2, p, v], links: [link(r.id, s1.id, { ifA: '192.168.1.1/24' }), link(r.id, s2.id, { ifA: '10.0.0.1/24' }), link(s1.id, p.id), link(s2.id, v.id)] }; }, ziele: [['PC1', 'SRV1', true]] },
    { id: 'maske', titel: '3. Falsche Subnetzmaske', text: 'PC1 erreicht PC2 nicht, obwohl beide im selben Switch stecken. Finde den Fehler (Tipp: Rückweg!) und korrigiere ihn.',
      topo() { const s = knoten('switch', 'SW1', 450, 140), a = knoten('pc', 'PC1', 280, 360, { ip: '192.168.1.10', maske: '255.255.255.0' }), b = knoten('pc', 'PC2', 620, 360, { ip: '192.168.1.200', maske: '255.255.255.128' }); return { nodes: [s, a, b], links: [link(s.id, a.id), link(s.id, b.id)] }; }, ziele: [['PC1', 'PC2', true], ['PC2', 'PC1', true]] },
    { id: 'gw-tipp', titel: '4. Tippfehler im Gateway', text: 'PC1 kommt nicht ins Servernetz. Prüfe die IP-Konfiguration von PC1 gegen die Router-Schnittstelle.',
      topo() { const r = knoten('router', 'R1', 450, 90), s1 = knoten('switch', 'SW1', 250, 230), p = knoten('pc', 'PC1', 160, 420, { ip: '172.16.5.20', maske: '/24', gw: '172.16.5.254' }), v = knoten('server', 'SRV1', 700, 300, { ip: '172.16.9.10', maske: '/24', gw: '172.16.9.1' });
        return { nodes: [r, s1, p, v], links: [link(r.id, s1.id, { ifA: '172.16.5.1/24' }), link(r.id, v.id, { ifA: '172.16.9.1/24' }), link(s1.id, p.id)] }; }, ziele: [['PC1', 'SRV1', true]] },
    { id: 'routen', titel: '5. Statische Routen', text: 'Zwei Standorte sind über das Transfernetz 10.0.12.0/30 verbunden. Trage auf R1 und R2 je eine statische Route ein (Format: 192.168.2.0/24 via 10.0.12.2), damit PC1 PC2 erreicht.',
      topo() { const r1 = knoten('router', 'R1', 330, 120), r2 = knoten('router', 'R2', 640, 120), a = knoten('pc', 'PC1', 160, 380, { ip: '192.168.1.10', maske: '/24', gw: '192.168.1.1' }), b = knoten('pc', 'PC2', 820, 380, { ip: '192.168.2.10', maske: '/24', gw: '192.168.2.1' });
        return { nodes: [r1, r2, a, b], links: [link(r1.id, r2.id, { ifA: '10.0.12.1/30', ifB: '10.0.12.2/30' }), link(r1.id, a.id, { ifA: '192.168.1.1/24' }), link(r2.id, b.id, { ifA: '192.168.2.1/24' })] }; }, ziele: [['PC1', 'PC2', true]] },
    { id: 'vlan', titel: '6. VLANs trennen', text: 'Alle drei PCs sind im selben IP-Netz. Trenne sie per VLAN: PC1 und PC2 in VLAN 10 (Vertrieb), PC3 in VLAN 20 (Technik). Danach darf PC1 PC2 erreichen, aber PC3 nicht. (Switch-Port anklicken → VLAN setzen)',
      topo() { const s = knoten('switch', 'SW1', 450, 130), a = knoten('pc', 'PC1', 220, 380, { ip: '192.168.10.11', maske: '/24' }), b = knoten('pc', 'PC2', 450, 400, { ip: '192.168.10.12', maske: '/24' }), c = knoten('pc', 'PC3', 680, 380, { ip: '192.168.10.13', maske: '/24' });
        return { nodes: [s, a, b, c], links: [link(s.id, a.id), link(s.id, b.id), link(s.id, c.id)] }; }, ziele: [['PC1', 'PC2', true], ['PC1', 'PC3', false]] },
    { id: 'roas', titel: '7. Router-on-a-Stick', text: 'PC1 (VLAN 10, 192.168.10.0/24) und PC2 (VLAN 20, 192.168.20.0/24) sollen sich über R1 erreichen. Setze den Switch-Port zum Router auf „Trunk“ und gib R1 auf dieser Leitung zwei Subinterfaces: 192.168.10.1/24 vlan 10; 192.168.20.1/24 vlan 20',
      topo() { const r = knoten('router', 'R1', 450, 80), s = knoten('switch', 'SW1', 450, 240), a = knoten('pc', 'PC1', 250, 420, { ip: '192.168.10.10', maske: '/24', gw: '192.168.10.1' }), b = knoten('pc', 'PC2', 650, 420, { ip: '192.168.20.10', maske: '/24', gw: '192.168.20.1' });
        return { nodes: [r, s, a, b], links: [link(r.id, s.id), link(s.id, a.id, { vlanA: '10' }), link(s.id, b.id, { vlanA: '20' })] }; }, ziele: [['PC1', 'PC2', true]] },
    { id: 'default', titel: '8. Standardroute ins Internet', text: 'R1 soll alles Unbekannte an den Provider-Router ISP weitergeben (0.0.0.0/0 via 203.0.113.2). ISP kennt den Rückweg bereits. Ziel: PC1 erreicht den DNS-Server 8.8.8.8.',
      topo() { const r1 = knoten('router', 'R1', 380, 140), isp = knoten('router', 'ISP', 680, 140, { routes: '192.168.50.0/24 via 203.0.113.1' }), p = knoten('pc', 'PC1', 180, 380, { ip: '192.168.50.20', maske: '/24', gw: '192.168.50.1' }), d = knoten('server', 'DNS', 820, 380, { ip: '8.8.8.8', maske: '/24', gw: '8.8.8.1' });
        return { nodes: [r1, isp, p, d], links: [link(r1.id, isp.id, { ifA: '203.0.113.1/30', ifB: '203.0.113.2/30' }), link(r1.id, p.id, { ifA: '192.168.50.1/24' }), link(isp.id, d.id, { ifA: '8.8.8.1/24' })] }; }, ziele: [['PC1', 'DNS', true]] }
  ];
  function subnettingAufgabe() {
    const o3 = 10 + Math.floor(Math.random() * 240), basis = `192.168.${o3}.0/24`;
    const anz = 2 + Math.floor(Math.random() * 2), namen = ['LAN-A', 'LAN-B', 'LAN-C'];
    const bed = namen.slice(0, anz).map((n, k) => ({ n, h: [40 + Math.floor(Math.random() * 70), 14 + Math.floor(Math.random() * 16), 4 + Math.floor(Math.random() * 8)][k] }));
    const plan = Werkzeuge.vlsm(basis, bed.map(b => `${b.n}=${b.h}`).join(',')).out;
    const r = knoten('router', 'R1', 450, 80), nodes = [r], links = [];
    plan.forEach((zeile, k) => { const x = 180 + k * (640 / Math.max(1, anz - 1)); const s = knoten('switch', 'SW-' + zeile[0].slice(-1), x, 240), p = knoten('pc', 'PC-' + zeile[0].slice(-1), x, 420); nodes.push(s, p); links.push(link(r.id, s.id), link(s.id, p.id)); });
    const init = JSON.stringify({ nodes, links });
    return { id: 'subnetz-' + basis, titel: '🎲 Subnetting-Aufgabe', auto: true, plan,
      text: `Teile <b>${basis}</b> nach VLSM auf (größter Bedarf zuerst, lückenlos): ${bed.map(b => `${b.n} ${b.h} Hosts`).join(', ')}. R1 bekommt in jedem LAN die <b>erste</b> nutzbare Adresse (am Router-Port, Format a.b.c.d/präfix), jeder PC die <b>letzte</b> nutzbare Adresse, Maske und Gateway. Ziel: alle PCs erreichen sich.`,
      topo: () => JSON.parse(init), ziele: [] };
  }
  function pruefeSubnetz(a) {
    const fehler = [];
    a.plan.forEach(z => {
      const buchst = z[0].slice(-1), pc = T.nodes.find(n => n.name === 'PC-' + buchst);
      const [netz, p] = z[2].split('/'), net = ip2n(netz), pp = +p, erster = n2ip(net + 1), letzter = n2ip(net + 2 ** (32 - pp) - 2);
      if (!pc) { fehler.push(`PC-${buchst} fehlt`); return; }
      if (pc.ip !== letzter) fehler.push(`PC-${buchst}: erwartet ${letzter}, eingetragen ${pc.ip || '–'}`);
      if (prefixAus(pc.maske) !== pp) fehler.push(`PC-${buchst}: Maske muss /${pp} (${n2ip(maske(pp))}) sein`);
      if (pc.gw !== erster) fehler.push(`PC-${buchst}: Gateway muss ${erster} sein`);
      const r = T.nodes.find(n => n.type === 'router'), sw = T.nodes.find(n => n.name === 'SW-' + buchst);
      const l = r && sw && T.links.find(x => (x.a === r.id && x.b === sw.id) || (x.b === r.id && x.a === sw.id));
      if (!l) fehler.push(`Verbindung R1 ↔ SW-${buchst} fehlt`);
      else if (!routerIfs(l, r).some(i => n2ip(i.n) === erster && i.p === pp)) fehler.push(`R1 Richtung SW-${buchst}: erwartet ${erster}/${pp}`);
    });
    return fehler;
  }

  // ---------- Darstellung ----------
  const BW = 112, BH = 64;
  function speichernTopo() { if (!aufgabe) { S.p.netsim.topo = T; speichern(); } }
  function zeichnen() {
    const svg = $('#ns-svg'); if (!svg) return;
    let s = '';
    for (const l of T.links) {
      const A = by(l.a), B = by(l.b); if (!A || !B) continue;
      const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
      const lab = (n, o) => n.type === 'switch' ? (vlanTxt(l, n) === 'trunk' ? 'Trunk' : 'VLAN ' + vlanTxt(l, n)) : n.type === 'router' ? (ifTxt(l, n) || '–') : '';
      const p = (n, o, t) => { const dx = o.x - n.x, dy = o.y - n.y, d = Math.hypot(dx, dy) || 1; return { x: n.x + dx / d * (t), y: n.y + dy / d * (t) }; };
      const la = lab(A, B), lb = lab(B, A), pa = p(A, B, 78), pb = p(B, A, 78);
      s += `<g class="ns-link ${sel && sel.link === l.id ? 'sel' : ''} ${l.vlanA === 'trunk' || l.vlanB === 'trunk' ? 'trunk' : ''}" data-link="${l.id}"><line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" class="ns-kabel-hit"/><line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" class="ns-kabel"/>
        ${la ? `<text x="${pa.x}" y="${pa.y - 6}" class="ns-port" text-anchor="middle">${E(portName(A, l))} ${E(la.length > 22 ? la.slice(0, 21) + '…' : la)}</text>` : ''}${lb ? `<text x="${pb.x}" y="${pb.y - 6}" class="ns-port" text-anchor="middle">${E(portName(B, l))} ${E(lb.length > 22 ? lb.slice(0, 21) + '…' : lb)}</text>` : ''}
        <circle cx="${mx}" cy="${my}" r="5" class="ns-mitte"/></g>`;
    }
    for (const n of T.nodes) {
      const t = TYP[n.type];
      s += `<g class="ns-node ${n.type} ${sel && sel.node === n.id ? 'sel' : ''} ${verbVon === n.id ? 'verb' : ''}" data-node="${n.id}" transform="translate(${n.x - BW / 2},${n.y - BH / 2})">
        <rect width="${BW}" height="${BH}" rx="12" class="ns-box"/><rect x="4" y="4" width="${BW - 8}" height="${BH / 2 - 6}" rx="9" class="ns-glanz"/>
        <text x="20" y="28" class="ns-icon" text-anchor="middle">${t.icon}</text><text x="${BW / 2 + 12}" y="26" class="ns-name" text-anchor="middle">${E(n.name)}</text>
        <text x="${BW / 2}" y="50" class="ns-ip" text-anchor="middle">${E(t.end ? (n.ip ? n.ip + (prefixAus(n.maske) !== null ? '/' + prefixAus(n.maske) : '') : 'keine IP') : n.type === 'router' ? `${T.links.filter(l => l.a === n.id || l.b === n.id).length} Ports` : 'Layer 2')}</text></g>`;
    }
    s += '<g id="ns-pakete"></g>';
    svg.innerHTML = s;
    eigenschaften();
    const sel1 = $('#ns-von'), sel2 = $('#ns-nach');
    if (sel1) {
      const ends = T.nodes.filter(n => TYP[n.type].end || n.type === 'router');
      const alt1 = sel1.value, alt2 = sel2.value;
      sel1.innerHTML = ends.filter(n => TYP[n.type].end).map(n => `<option value="${n.id}">${E(n.name)}</option>`).join('');
      sel2.innerHTML = ends.map(n => `<option value="${n.id}">${E(n.name)}${n.ip ? ' (' + E(n.ip) + ')' : ''}</option>`).join('') + '<option value="__ip">andere IP …</option>';
      if (alt1 && [...sel1.options].some(o => o.value === alt1)) sel1.value = alt1;
      if (alt2 && [...sel2.options].some(o => o.value === alt2)) sel2.value = alt2; else if (sel2.options.length > 1) sel2.selectedIndex = Math.min(1, sel2.options.length - 1);
    }
  }
  function eigenschaften() {
    const el = $('#ns-props'); if (!el) return;
    if (sel && sel.node) {
      const n = by(sel.node); if (!n) { sel = null; return eigenschaften(); }
      const ls = T.links.filter(l => l.a === n.id || l.b === n.id);
      let h = `<h3>${TYP[n.type].icon} ${E(n.name)}</h3><label class="r-feld"><span>Name</span><input data-f="name" value="${E(n.name)}"></label>`;
      if (TYP[n.type].end) h += `<label class="r-feld"><span>IP-Adresse</span><input data-f="ip" value="${E(n.ip)}" placeholder="192.168.1.10"></label><label class="r-feld"><span>Subnetzmaske (oder /Präfix)</span><input data-f="maske" value="${E(n.maske)}" placeholder="255.255.255.0"></label><label class="r-feld"><span>Standardgateway</span><input data-f="gw" value="${E(n.gw)}" placeholder="192.168.1.1"></label>`;
      if (n.type === 'router') h += ls.map(l => { const o = by(l.a === n.id ? l.b : l.a); return `<label class="r-feld"><span>${portName(n, l)} → ${E(o.name)}: IP/Präfix <small>(Subinterfaces: „ip/p vlan N; …“)</small></span><input data-if="${l.id}" value="${E(ifTxt(l, n))}" placeholder="192.168.1.1/24"></label>`; }).join('') +
        `<label class="r-feld"><span>Statische Routen (je Zeile „Netz/Präfix via Next-Hop“)</span><textarea data-f="routes" rows="3" placeholder="192.168.2.0/24 via 10.0.12.2&#10;0.0.0.0/0 via 203.0.113.2">${E(n.routes)}</textarea></label>`;
      if (n.type === 'switch') h += ls.map(l => { const o = by(l.a === n.id ? l.b : l.a); return `<label class="r-feld"><span>${portName(n, l)} → ${E(o.name)}</span><select data-vlan="${l.id}"><option value="trunk" ${vlanTxt(l, n) === 'trunk' ? 'selected' : ''}>Trunk (802.1Q)</option>${[1, 10, 20, 30, 40, 99].map(v => `<option value="${v}" ${vlanTxt(l, n) === String(v) ? 'selected' : ''}>Access VLAN ${v}</option>`).join('')}</select></label>`; }).join('') || '<p class="tipp">Noch keine Ports verbunden.</p>';
      h += `<button class="glas knopf klein" id="ns-del">Gerät löschen</button>`;
      el.innerHTML = h;
      el.querySelectorAll('[data-f]').forEach(i => i.oninput = () => { n[i.dataset.f] = i.value.trim() === '' ? '' : (i.dataset.f === 'routes' ? i.value : i.value.trim()); speichernTopo(); clearTimeout(i._t); i._t = setTimeout(zeichnenOhneProps, 250); });
      el.querySelectorAll('[data-if]').forEach(i => i.oninput = () => { const l = T.links.find(x => x.id === i.dataset.if); l['if' + seite(l, n)] = i.value.trim(); speichernTopo(); clearTimeout(i._t); i._t = setTimeout(zeichnenOhneProps, 250); });
      el.querySelectorAll('[data-vlan]').forEach(i => i.onchange = () => { const l = T.links.find(x => x.id === i.dataset.vlan); l['vlan' + seite(l, n)] = i.value; speichernTopo(); zeichnenOhneProps(); });
      $('#ns-del').onclick = () => { T.links = T.links.filter(l => l.a !== n.id && l.b !== n.id); T.nodes = T.nodes.filter(x => x !== n); sel = null; speichernTopo(); zeichnen(); };
    } else if (sel && sel.link) {
      const l = T.links.find(x => x.id === sel.link); if (!l) { sel = null; return eigenschaften(); }
      el.innerHTML = `<h3>Kabel ${E(by(l.a).name)} ↔ ${E(by(l.b).name)}</h3><p class="tipp">Ports und VLANs stellst du am Router bzw. Switch ein (Gerät anklicken).</p><button class="glas knopf klein" id="ns-ldel">Kabel entfernen</button>`;
      $('#ns-ldel').onclick = () => { T.links = T.links.filter(x => x !== l); sel = null; speichernTopo(); zeichnen(); };
    } else el.innerHTML = `<h3>Eigenschaften</h3><p class="tipp">Gerät antippen = konfigurieren. Modus „Verbinden“: erst Gerät A, dann Gerät B antippen. Geräte lassen sich mit Maus/Finger verschieben.</p>${doppelteIps().map(t => `<p class="fehler">⚠ ${E(t)}</p>`).join('')}`;
  }
  function zeichnenOhneProps() { const fokus = document.activeElement; const props = $('#ns-props'); const merk = props.innerHTML; zeichnen(); if (fokus && fokus.dataset) { const sel_ = fokus.dataset.f ? `[data-f="${fokus.dataset.f}"]` : fokus.dataset.if ? `[data-if="${fokus.dataset.if}"]` : fokus.dataset.vlan ? `[data-vlan="${fokus.dataset.vlan}"]` : null; if (sel_) { const neu = props.querySelector(sel_); if (neu) { neu.focus(); if (neu.setSelectionRange && typeof neu.value === 'string') try { neu.setSelectionRange(neu.value.length, neu.value.length); } catch {} } } } }

  // ---------- Paket-Animation ----------
  function animiere(pfad, ok, fertig) {
    cancelAnimationFrame(animRaf);
    const g = document.getElementById('ns-pakete'); if (!g) return fertig && fertig();
    const pts = pfad.map(by).filter(Boolean).map(n => ({ x: n.x, y: n.y }));
    if (pts.length < 2) { if (fertig) fertig(); return; }
    g.innerHTML = `<polyline points="${pts.map(p => p.x + ',' + p.y).join(' ')}" class="ns-spur ${ok ? 'ok' : 'nein'}"/><g class="ns-paket ${ok ? 'ok' : 'nein'}"><rect x="-13" y="-9" width="26" height="18" rx="4"/><path d="M-13,-9 L0,2 L13,-9"/></g>`;
    const pk = g.querySelector('.ns-paket'), seg = pts.length - 1, dauer = 380 * seg, t0 = performance.now();
    const frame = now => {
      if (!pk.isConnected) return;
      const t = Math.min(1, (now - t0) / dauer), x = t * seg, k = Math.min(seg - 1, Math.floor(x)), u = x - k;
      pk.setAttribute('transform', `translate(${pts[k].x + (pts[k + 1].x - pts[k].x) * u},${pts[k].y + (pts[k + 1].y - pts[k].y) * u})`);
      if (t < 1) animRaf = requestAnimationFrame(frame); else { pk.classList.add('da'); if (fertig) fertig(); }
    };
    animRaf = requestAnimationFrame(frame);
  }
  function konsole(txt, art = '') { const k = $('#ns-konsole'); if (!k) return; k.insertAdjacentHTML('beforeend', `<div class="${art}">${txt}</div>`); k.scrollTop = k.scrollHeight; }
  function testen(trace) {
    const src = by($('#ns-von').value); if (!src) { toast('Erst Geräte anlegen.'); return; }
    let ziel = $('#ns-nach').value, zielIp;
    if (ziel === '__ip') { zielIp = prompt('Ziel-IP-Adresse:', '8.8.8.8'); if (!zielIp) return; }
    else { const z = by(ziel); if (!z) return; if (TYP[z.type].end) zielIp = z.ip; else { const A = analyse(); const i = A.ifaces.find(x => x.node === z); zielIp = i ? n2ip(i.n) : ''; } }
    if (!zielIp) { konsole(`${E(src.name)}&gt; ${trace ? 'tracert' : 'ping'} – Ziel hat keine IP-Adresse`, 'nein'); return; }
    const r = ping(src, zielIp);
    konsole(`<b>${E(src.name)}&gt; ${trace ? 'tracert' : 'ping'} ${E(zielIp)}</b>`);
    animiere(r.tr, r.ok, () => {
      if (trace) { (r.hops || []).forEach((h, k) => konsole(`  ${k + 1}  &lt;1 ms  ${E(h.ip)} [${E(h.name)}]`)); if (r.ok) konsole(`  ${(r.hops || []).length + 1}  &lt;1 ms  ${E(zielIp)}`, 'ok'); else konsole('  *  Zeitüberschreitung der Anforderung.', 'nein'); }
      else if (r.ok) { konsole(`Antwort von ${E(zielIp)}: Bytes=32 Zeit&lt;1ms TTL=${128 - (r.hops || []).length}`, 'ok'); melde('ping', 1); }
      else konsole('Zielhost nicht erreichbar / Zeitüberschreitung.', 'nein');
      konsole((r.ok ? '✓ ' : '✗ ') + E(r.msg), r.ok ? 'ok' : 'hinweis');
    });
  }
  function aufgabePruefen() {
    if (!aufgabe) return;
    const fehler = [];
    for (const [a, b, soll] of aufgabe.ziele) {
      const A = T.nodes.find(n => n.name === a), B = T.nodes.find(n => n.name === b);
      if (!A || !B) { fehler.push(`${a} oder ${b} fehlt`); continue; }
      const r = ping(A, B.ip);
      if (r.ok !== soll) fehler.push(`${a} → ${b}: ${soll ? 'muss klappen' : 'darf NICHT klappen'} (${r.msg})`);
    }
    if (aufgabe.auto) {
      fehler.push(...pruefeSubnetz(aufgabe));
      const pcs = T.nodes.filter(n => n.type === 'pc');
      for (const a of pcs) for (const b of pcs) if (a !== b && !ping(a, b.ip).ok) { fehler.push(`${a.name} erreicht ${b.name} nicht`); break; }
    }
    if (!fehler.length) {
      konsole(`🎉 Aufgabe „${E(aufgabe.titel)}“ gelöst!`, 'ok'); toast('Aufgabe gelöst! +XP', 'gold');
      if (!S.p.netsim.geloest[aufgabe.id] || aufgabe.auto) melde('netsim', 1); if (aufgabe.auto) melde('subnetz', 1);
      S.p.netsim.geloest[aufgabe.id] = heute(); speichern(); if (window.Mot) Mot.konfetti(70); ton('gong');
      const ns = $('#ns-aufgabe'); if (ns) ns.classList.add('geloest');
    } else { konsole('Noch nicht ganz:', 'nein'); fehler.forEach(f => konsole('• ' + E(f), 'hinweis')); ton('schlecht'); }
  }

  // ---------- Interaktion ----------
  function svgPunkt(e) { const s = $('#ns-svg'), p = s.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(s.getScreenCTM().inverse()); }
  function binden() {
    const svg = $('#ns-svg');
    let zieh = null;
    svg.addEventListener('pointerdown', e => {
      const g = e.target.closest('[data-node]'), lk = e.target.closest('[data-link]');
      if (g) {
        const n = by(g.dataset.node);
        if (modus === 'loeschen') { T.links = T.links.filter(l => l.a !== n.id && l.b !== n.id); T.nodes = T.nodes.filter(x => x !== n); sel = null; speichernTopo(); zeichnen(); return; }
        if (modus === 'verbinden') {
          if (!verbVon) { verbVon = n.id; zeichnen(); return; }
          if (verbVon !== n.id && !T.links.some(l => (l.a === verbVon && l.b === n.id) || (l.b === verbVon && l.a === n.id))) {
            const A = by(verbVon);
            if (TYP[A.type].end && T.links.some(l => l.a === A.id || l.b === A.id)) toast(`${A.name} hat nur eine Netzwerkkarte.`);
            else if (TYP[n.type].end && T.links.some(l => l.a === n.id || l.b === n.id)) toast(`${n.name} hat nur eine Netzwerkkarte.`);
            else { T.links.push(link(verbVon, n.id)); ton('klick'); }
          }
          verbVon = null; speichernTopo(); zeichnen(); return;
        }
        sel = { node: n.id }; const p = svgPunkt(e); zieh = { n, dx: n.x - p.x, dy: n.y - p.y, moved: false }; svg.setPointerCapture(e.pointerId); zeichnen();
      } else if (lk) {
        if (modus === 'loeschen') { T.links = T.links.filter(l => l.id !== lk.dataset.link); speichernTopo(); zeichnen(); return; }
        sel = { link: lk.dataset.link }; zeichnen();
      } else { sel = null; verbVon = null; zeichnen(); }
    });
    svg.addEventListener('pointermove', e => { if (!zieh) return; const p = svgPunkt(e); zieh.n.x = Math.max(60, Math.min(940, p.x + zieh.dx)); zieh.n.y = Math.max(40, Math.min(560, p.y + zieh.dy)); zieh.moved = true; const g = svg.querySelector(`[data-node="${zieh.n.id}"]`); if (g) g.setAttribute('transform', `translate(${zieh.n.x - BW / 2},${zieh.n.y - BH / 2})`);
      svg.querySelectorAll('.ns-link').forEach(gl => { const l = T.links.find(x => x.id === gl.dataset.link); if (!l || (l.a !== zieh.n.id && l.b !== zieh.n.id)) return; const A = by(l.a), B = by(l.b); gl.querySelectorAll('line').forEach(li => { li.setAttribute('x1', A.x); li.setAttribute('y1', A.y); li.setAttribute('x2', B.x); li.setAttribute('y2', B.y); }); }); });
    const ende = () => { if (zieh) { if (zieh.moved) { speichernTopo(); zeichnen(); } zieh = null; } };
    svg.addEventListener('pointerup', ende); svg.addEventListener('pointercancel', ende);
  }
  function neuGeraet(type) {
    const anz = T.nodes.filter(n => n.type === type).length + 1;
    const name = { pc: 'PC', server: 'SRV', switch: 'SW', router: 'R' }[type] + anz;
    T.nodes.push(knoten(type, name, 120 + (T.nodes.length * 97) % 760, 100 + (T.nodes.length * 131) % 400)); sel = { node: T.nodes[T.nodes.length - 1].id }; speichernTopo(); zeichnen(); ton('klick');
  }
  function ladeAufgabe(a) { aufgabe = a; T = a.topo(); sel = null; verbVon = null; ansichtRender(); konsole(`Aufgabe: ${a.titel}`, 'hinweis'); }

  function ansicht(param) {
    krumen([START, { txt: 'Werkzeuge', go: 'werkzeuge' }, { txt: 'Netzwerk-Simulator' }]);
    if (!T) { T = S.p.netsim.topo && S.p.netsim.topo.nodes ? JSON.parse(JSON.stringify(S.p.netsim.topo)) : AUFGABEN[1].topo(); aufgabe = null; }
    ansichtRender();
  }
  function ansichtRender() {
    const geloest = S.p.netsim.geloest || {};
    $('#inhalt').innerHTML = `<h1>Netzwerk-Simulator</h1><p class="unter">Packet-Tracer-light: Geräte platzieren, verkabeln, IP/Maske/Gateway/VLAN setzen und mit ping/traceroute testen. Fehler werden erklärt.</p>
      <div class="ns-aufgaben"><select id="ns-aufg" class="sp-select"><option value="">Freies Bauen${aufgabe ? '' : ' (aktiv)'}</option>${AUFGABEN.map(a => `<option value="${a.id}" ${aufgabe && aufgabe.id === a.id ? 'selected' : ''}>${geloest[a.id] ? '✓ ' : ''}${E(a.titel)}</option>`).join('')}<option value="__subnetz" ${aufgabe && aufgabe.auto ? 'selected' : ''}>🎲 Neue Subnetting-Aufgabe</option></select>
        ${aufgabe ? `<button class="glas knopf primär klein" id="ns-check">Aufgabe prüfen</button><button class="glas knopf klein" id="ns-reset">Neu laden</button>` : ''}</div>
      ${aufgabe ? `<div class="glas ns-aufgabe ${geloest[aufgabe.id] ? 'geloest' : ''}" id="ns-aufgabe"><b>${E(aufgabe.titel)}</b><p>${aufgabe.text}</p></div>` : ''}
      <div class="ns-leiste">
        <div class="schalter" id="ns-modus"><button data-m="bewegen" class="${modus === 'bewegen' ? 'an' : ''}">✋ Bewegen</button><button data-m="verbinden" class="${modus === 'verbinden' ? 'an' : ''}">🔌 Verbinden</button><button data-m="loeschen" class="${modus === 'loeschen' ? 'an' : ''}">🗑 Löschen</button></div>
        ${Object.entries(TYP).map(([k, t]) => `<button class="glas knopf klein" data-neu="${k}">+ ${t.icon} ${t.n}</button>`).join('')}
        <button class="glas knopf klein" id="ns-leer">Alles leeren</button>
      </div>
      <div class="ns-raster"><div class="ns-buehne glas"><svg id="ns-svg" viewBox="0 0 1000 600" role="img" aria-label="Netzwerktopologie"></svg></div><div class="ns-seite glas" id="ns-props"></div></div>
      <div class="ns-test glas"><b>Test:</b> von <select id="ns-von" class="sp-select"></select> nach <select id="ns-nach" class="sp-select"></select>
        <button class="glas knopf primär klein" id="ns-ping">ping</button><button class="glas knopf klein" id="ns-trace">traceroute</button><button class="glas knopf klein" id="ns-klar">Konsole leeren</button></div>
      <div class="ns-konsole" id="ns-konsole" aria-live="polite"></div>`;
    $$('#ns-modus button').forEach(b => b.onclick = () => { modus = b.dataset.m; verbVon = null; $$('#ns-modus button').forEach(x => x.classList.toggle('an', x === b)); zeichnen(); });
    $$('[data-neu]').forEach(b => b.onclick = () => neuGeraet(b.dataset.neu));
    $('#ns-leer').onclick = () => { if (!T.nodes.length || confirm('Alle Geräte entfernen?')) { T = leer(); aufgabe = null; sel = null; speichernTopo(); ansichtRender(); } };
    $('#ns-ping').onclick = () => testen(false); $('#ns-trace').onclick = () => testen(true);
    $('#ns-klar').onclick = () => { $('#ns-konsole').innerHTML = ''; };
    $('#ns-aufg').onchange = e => { const v = e.target.value; if (!v) { aufgabe = null; T = S.p.netsim.topo && S.p.netsim.topo.nodes ? JSON.parse(JSON.stringify(S.p.netsim.topo)) : leer(); ansichtRender(); return; } ladeAufgabe(v === '__subnetz' ? subnettingAufgabe() : AUFGABEN.find(a => a.id === v)); };
    if (aufgabe) { $('#ns-check').onclick = aufgabePruefen; $('#ns-reset').onclick = () => ladeAufgabe(aufgabe.auto ? aufgabe : AUFGABEN.find(a => a.id === aufgabe.id)); }
    binden(); zeichnen();
  }

  window.VIEWS = Object.assign(window.VIEWS || {}, { netsim: ansicht });
  return { AUFGABEN, ping, analyse, subnettingAufgabe, _setT: t => { T = t; }, _getT: () => T, ladeAufgabe, aufgabePruefen };
})();
window.Netsim = Netsim;
