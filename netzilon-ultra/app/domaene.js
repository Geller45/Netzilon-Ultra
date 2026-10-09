// Netzilon Ultra 2.4 – „Meine Domäne“: simulierte AD-Umgebung netzilon.example (DC01) mit ADUC, GPMC, DNS, DHCP,
// Freigaben/NTFS (effektive Rechte), Vertrauensstellungen und simulierter PowerShell. GUI und Konsole teilen einen Zustand.
const Domaene = (() => {
  const DOM = 'netzilon.example', NB = 'NETZILON', DCDN = 'DC=netzilon,DC=example', WURZEL = 'Netzilon';
  const LV = ['Kein Zugriff', 'Lesen', 'Ändern', 'Vollzugriff'];
  const SCOPES = ['Global', 'DomainLocal', 'Universal'];
  const SCOPE_DE = { Global: 'Global', DomainLocal: 'Lokal (in Domäne)', Universal: 'Universal' };
  const SPEZIAL = ['Jeder', 'Authentifizierte Benutzer', 'Domänen-Benutzer'];
  const GPO_FELDER = [
    ['pwMin', 'Kennwortrichtlinie: minimale Kennwortlänge', 'zahl'], ['pwMaxAlter', 'Kennwortrichtlinie: max. Kennwortalter (Tage)', 'zahl'],
    ['sperre', 'Kontosperrung nach Fehlversuchen', 'zahl'], ['usb', 'Wechselmedien (USB-Speicher) sperren', 'bool'],
    ['laufwerk', 'Laufwerkszuordnung (z. B. P:=\\\\FS01\\Personal)', 'text'], ['bildschirm', 'Bildschirmsperre nach Minuten', 'zahl'],
    ['hintergrund', 'Desktophintergrund (Pfad)', 'text']
  ];
  const istObj = o => o && typeof o === 'object' && !Array.isArray(o);
  const kl = s => String(s == null ? '' : s).toLowerCase();
  const kopie = o => JSON.parse(JSON.stringify(o));

  // ---------- Startzustand aus FirmaDB ----------
  let MA = null; // Mitarbeiter-Cache
  function ma() { if (!MA) MA = window.FirmaDB ? FirmaDB.mitarbeiter() : []; return MA; }
  const ouVonMa = m => `${WURZEL}/${m.stadt}/${m.abteilung || 'Stabsstellen'}`;
  function start() {
    const users = {}, ous = new Set([WURZEL, WURZEL + '/Gruppen', WURZEL + '/Ausgeschieden', WURZEL + '/Server', WURZEL + '/Computer', 'Domain Controllers', 'Users']);
    const groups = {};
    const gg = (n, desc) => (groups[kl(n)] = groups[kl(n)] || { n, scope: 'Global', ou: WURZEL + '/Gruppen', m: [], desc: desc || '' });
    gg('Domänen-Admins', 'Administratoren der Domäne').ou = 'Users';
    gg('GG_Azubis', 'Alle Auszubildenden'); gg('GG_STAB', 'Stabsstellen');
    for (const m of ma()) {
      const ou = ouVonMa(m); ous.add(`${WURZEL}/${m.stadt}`); ous.add(ou);
      users[kl(m.benutzername)] = { sam: m.benutzername, vn: m.vorname, nn: m.nachname, abt: m.abteilung || 'Stabsstelle', titel: m.position || '', mgr: m.vorgesetzter || '', stadt: m.stadt, ou, an: !!m.aktiv, mail: m.email };
      const g = gg('GG_' + (m.kuerzel || 'STAB'), m.abteilung ? 'Abteilung ' + m.abteilung : '');
      g.m.push(m.benutzername);
      if (m.azubi) groups.gg_azubis.m.push(m.benutzername);
    }
    const itb = ma().find(m => m.kuerzel === 'ITB' && /Leite/.test(m.position)); if (itb) groups['domänen-admins'].m.push(itb.benutzername);
    const dl = (n, m, desc) => { groups[kl(n)] = { n, scope: 'DomainLocal', ou: WURZEL + '/Gruppen', m, desc }; };
    dl('DL_Personal_RW', ['GG_PE'], 'Freigabe Personal: Ändern'); dl('DL_Personal_R', ['GG_GF', 'GG_VT'], 'Freigabe Personal: Lesen');
    dl('DL_Vertrieb_RW', ['GG_VT', 'GG_GF'], 'Freigabe Vertrieb: Ändern'); dl('DL_IT_RW', ['GG_ITB', 'GG_ITS', 'GG_NWS'], 'Freigabe IT: Ändern');
    dl('DL_Buchhaltung_RW', ['GG_BH'], 'Freigabe Buchhaltung: Ändern');
    const A = (p, r, d) => ({ p, r, d: !!d }), ADM = A('Domänen-Admins', 3);
    const fr = (n, share, ntfs) => ({ n, pfad: 'D:\\Freigaben\\' + n, share, ntfs: [ADM, ...ntfs] });
    const shares = [
      fr('Personal', [A('Authentifizierte Benutzer', 2)], [A('DL_Personal_RW', 2), A('DL_Personal_R', 1)]),
      fr('Vertrieb', [A('Authentifizierte Benutzer', 2)], [A('DL_Vertrieb_RW', 2)]),
      fr('IT', [A('Authentifizierte Benutzer', 2)], [A('DL_IT_RW', 2), A('GG_Azubis', 2, true)]),
      fr('Buchhaltung', [A('Authentifizierte Benutzer', 1)], [A('DL_Buchhaltung_RW', 2)]),
      fr('Austausch', [A('Jeder', 2)], [A('Domänen-Benutzer', 2)])
    ];
    const gpos = {
      'default domain policy': { n: 'Default Domain Policy', s: { pwMin: 10, pwMaxAlter: 90, sperre: 5 }, links: [''] },
      'gpo_laufwerke': { n: 'GPO_Laufwerke', s: { laufwerk: 'S:=\\\\FS01\\Austausch' }, links: [WURZEL] },
      'gpo_bildschirmsperre': { n: 'GPO_Bildschirmsperre', s: { bildschirm: 10 }, links: [WURZEL] },
      'gpo_usb_sperre': { n: 'GPO_USB_Sperre', s: { usb: true }, links: [] }
    };
    const dns = [['dc01', 'A', '10.0.0.10'], ['fs01', 'A', '10.0.0.20'], ['mail', 'A', '10.0.0.25'], ['web01', 'A', '10.0.0.30'], ['drucker-og1', 'A', '10.0.0.50'],
      ['intranet', 'CNAME', 'web01.netzilon.example'], ['_ldap._tcp', 'SRV', '0 100 389 dc01.netzilon.example'], ['_kerberos._tcp', 'SRV', '0 100 88 dc01.netzilon.example'],
      ['10', 'PTR', 'dc01.netzilon.example'], ['20', 'PTR', 'fs01.netzilon.example'], ['30', 'PTR', 'web01.netzilon.example']]
      .map(([n, t, w]) => ({ z: t === 'PTR' ? '0.0.10.in-addr.arpa' : DOM, n, t, w }));
    const orte = ['HH', 'B', 'K', 'M', 'L', 'F'], leases = [];
    for (let i = 0; i < 18; i++) leases.push({ ip: '10.0.0.' + (100 + i), mac: '00-15-5D-0A-01-' + (16 + i).toString(16).toUpperCase().padStart(2, '0'), name: `pc-${kl(orte[i % 6])}-${String(i + 1).padStart(3, '0')}.${DOM}` });
    return {
      v: 1, ous: [...ous].sort(), users, groups, gpos, dns,
      dhcp: { von: '10.0.0.50', bis: '10.0.0.199', gw: '10.0.0.1', dnsSrv: '10.0.0.10', dauer: 8, leases, res: [{ ip: '10.0.0.50', mac: '00-15-5D-0A-00-50', name: 'drucker-og1' }] },
      shares, trusts: [{ ziel: 'partner.example', typ: 'Gesamtstruktur (Forest)', richtung: 'Bidirektional', transitiv: true }]
    };
  }

  // ---------- Validierung (kaputter/alter Zustand → säubern oder Startzustand) ----------
  const str = (x, max = 120) => typeof x === 'string' && x.length <= max;
  const aceOk = a => istObj(a) && str(a.p, 64) && [1, 2, 3].includes(a.r);
  function normal(z) {
    try {
      if (!istObj(z) || z.v !== 1) return start();
      const s = start();
      if (Array.isArray(z.ous)) s.ous = [...new Set(z.ous.filter(o => str(o, 200) && /^[^<>"]+$/.test(o)).concat([WURZEL, WURZEL + '/Gruppen', WURZEL + '/Ausgeschieden', 'Users', 'Domain Controllers']))].sort();
      if (istObj(z.users)) {
        const u = {};
        for (const x of Object.values(z.users)) if (istObj(x) && str(x.sam, 20) && /^[A-Za-z0-9._-]+$/.test(x.sam) && s.ous.includes(x.ou))
          u[kl(x.sam)] = { sam: x.sam, vn: str(x.vn) ? x.vn : '', nn: str(x.nn) ? x.nn : x.sam, abt: str(x.abt) ? x.abt : '', titel: str(x.titel) ? x.titel : '', mgr: str(x.mgr, 20) ? x.mgr : '', stadt: str(x.stadt) ? x.stadt : '', ou: x.ou, an: x.an !== false, mail: str(x.mail) ? x.mail : '' };
        s.users = u;
      }
      if (istObj(z.groups)) {
        const g = {};
        for (const x of Object.values(z.groups)) if (istObj(x) && str(x.n, 64) && /^[^<>"]+$/.test(x.n) && SCOPES.includes(x.scope))
          g[kl(x.n)] = { n: x.n, scope: x.scope, ou: str(x.ou, 200) ? x.ou : WURZEL + '/Gruppen', m: Array.isArray(x.m) ? [...new Set(x.m.filter(m => str(m, 64)))] : [], desc: str(x.desc) ? x.desc : '' };
        s.groups = g;
      }
      if (istObj(z.gpos)) {
        const g = {};
        for (const x of Object.values(z.gpos)) if (istObj(x) && str(x.n, 64) && /^[^<>"]+$/.test(x.n)) {
          const st = {}; if (istObj(x.s)) for (const [k, , t] of GPO_FELDER) { const v = x.s[k]; if (t === 'bool' ? typeof v === 'boolean' : t === 'zahl' ? Number.isFinite(v) : str(v)) st[k] = v; }
          g[kl(x.n)] = { n: x.n, s: st, links: Array.isArray(x.links) ? [...new Set(x.links.filter(l => l === '' || s.ous.includes(l)))] : [] };
        }
        if (g['default domain policy']) s.gpos = g;
      }
      if (Array.isArray(z.dns)) s.dns = z.dns.filter(r => istObj(r) && str(r.z) && str(r.n, 64) && ['A', 'CNAME', 'PTR', 'SRV'].includes(r.t) && str(r.w)).slice(0, 300).map(r => ({ z: r.z, n: r.n, t: r.t, w: r.w }));
      if (istObj(z.dhcp)) {
        const d = z.dhcp, rr = a => (Array.isArray(a) ? a : []).filter(x => istObj(x) && ipOk(x.ip) && macOk(x.mac) && str(x.name)).slice(0, 200).map(x => ({ ip: x.ip, mac: normMac(x.mac), name: x.name }));
        s.dhcp.leases = rr(d.leases); s.dhcp.res = rr(d.res);
      }
      if (Array.isArray(z.shares)) s.shares = z.shares.filter(x => istObj(x) && str(x.n, 40) && /^[A-Za-z0-9_$-]+$/.test(x.n) && str(x.pfad)).slice(0, 50)
        .map(x => ({ n: x.n, pfad: x.pfad, share: (Array.isArray(x.share) ? x.share : []).filter(aceOk).map(a => ({ p: a.p, r: a.r, d: !!a.d })), ntfs: (Array.isArray(x.ntfs) ? x.ntfs : []).filter(aceOk).map(a => ({ p: a.p, r: a.r, d: !!a.d })) }));
      return s;
    } catch (e) { console.warn('Domäne: Zustand verworfen', e); return start(); }
  }

  // ---------- Hilfen: IP, MAC, DN ----------
  function ipOk(ip) { return typeof ip === 'string' && /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(ip) && ip.split('.').every(x => +x <= 255); }
  const normMac = m => String(m).toUpperCase().replace(/[:.]/g, '-');
  const macOk = m => /^([0-9A-F]{2}-){5}[0-9A-F]{2}$/.test(normMac(m));
  const ouDn = ou => ou === '' ? DCDN : ou === 'Users' ? 'CN=Users,' + DCDN : ou.split('/').reverse().map(x => 'OU=' + x).join(',') + ',' + DCDN;
  function zuOu(t) {
    t = String(t || '').trim(); if (!t) return null;
    if (/=/.test(t)) {
      const teile = t.split(/\s*,\s*/), ous = [];
      for (const p of teile) { const m = /^(OU|CN|DC)=(.+)$/i.exec(p); if (!m) return null; if (/^OU$/i.test(m[1])) ous.push(m[2]); else if (/^CN$/i.test(m[1]) && /^users$/i.test(m[2])) return 'Users'; }
      return ous.length ? ous.reverse().join('/') : '';
    }
    return t.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  }
  const ouFinden = t => { const o = zuOu(t); if (o === null) return null; if (o === '' || o === 'Users') return o; return Z.ous.find(x => kl(x) === kl(o)) || null; };
  const ouName = ou => ou === '' ? DOM : ou.split('/').pop();
  const userDn = u => `CN=${u.vn ? u.vn + ' ' : ''}${u.nn},${ouDn(u.ou)}`;
  const uName = u => (u.vn ? u.vn + ' ' : '') + u.nn;

  // ---------- Zustand ----------
  let Z = null, tab = 'aduc', ouSel = WURZEL, objSel = null, suche = '', gpoSel = 'gpo_usb_sperre', shareSel = 'Personal', effUser = '', effShare = 'Personal', rsopUser = '';
  let ausgabe = [], vIdx = -1;
  function P() {
    const p = S.p;
    if (!istObj(p.domaene)) p.domaene = { geloest: {}, zustand: null, verlauf: [] };
    if (!istObj(p.domaene.geloest)) p.domaene.geloest = {};
    if (!Array.isArray(p.domaene.verlauf)) p.domaene.verlauf = [];
    return p.domaene;
  }
  function laden() { Z = normal(P().zustand); }
  function sichern() {
    let j = JSON.stringify(Z);
    P().zustand = j.length < 500000 ? JSON.parse(j) : null;
    speichern();
  }
  const user = id => { if (id == null) return null; const t = String(id).replace(/^NETZILON\\/i, ''); return Z.users[kl(t)] || Object.values(Z.users).find(u => kl(userDn(u)) === kl(t) || kl(t) === kl(u.sam + '@' + DOM)) || null; };
  const gruppe = id => { if (id == null) return null; const t = String(id).replace(/^NETZILON\\/i, ''); return Z.groups[kl(t)] || Object.values(Z.groups).find(g => kl(`CN=${g.n},${ouDn(g.ou)}`) === kl(t)) || null; };
  // Alle Gruppen (transitiv), in denen ein Benutzer/eine Gruppe Mitglied ist
  function mitgliedIn(name) {
    const erg = new Set(), offen = [kl(name)];
    while (offen.length) { const x = offen.pop(); for (const g of Object.values(Z.groups)) if (g.m.some(m => kl(m) === x) && !erg.has(g.n)) { erg.add(g.n); offen.push(kl(g.n)); } }
    return [...erg];
  }
  const direkteGruppen = sam => Object.values(Z.groups).filter(g => g.m.some(m => kl(m) === kl(sam))).map(g => g.n);
  function mitgliederRek(g, seen = new Set()) {
    const out = [];
    for (const m of g.m) { if (seen.has(kl(m))) continue; seen.add(kl(m)); const sub = gruppe(m); if (sub) out.push(...mitgliederRek(sub, seen)); else if (user(m)) out.push(user(m)); }
    return out;
  }

  // ---------- Effektive Rechte ----------
  function ausAces(aces, ident) {
    let erlaubt = 0, kappe = 3; const treffer = [];
    for (const a of aces) {
      const hit = ident.find(i => kl(i) === kl(a.p)); if (!hit) continue;
      treffer.push(a);
      if (a.d) kappe = Math.min(kappe, a.r - 1); else erlaubt = Math.max(erlaubt, a.r);
    }
    return { r: Math.max(0, Math.min(erlaubt, kappe)), erlaubt, kappe, treffer };
  }
  function eff(sam, shareName) {
    const u = user(sam), sh = Z.shares.find(s => kl(s.n) === kl(shareName));
    if (!u || !sh) return null;
    const gr = mitgliedIn(u.sam), ident = [u.sam, ...gr, ...SPEZIAL];
    const fs = ausAces(sh.share, ident), nt = ausAces(sh.ntfs, ident);
    let r = Math.min(fs.r, nt.r); const schritte = [];
    schritte.push(`Identitäten von ${u.sam}: Benutzer selbst, Gruppen ${gr.length ? gr.join(', ') : '(keine)'} sowie Jeder/Authentifizierte Benutzer/Domänen-Benutzer.`);
    const txt = (x, was) => x.treffer.length ? `${was}: ${x.treffer.map(a => `${a.p} ${a.d ? 'VERWEIGERN ' : ''}${LV[a.r]}`).join(' · ')} → kumulativ ${LV[x.erlaubt]}${x.kappe < 3 ? `, Verweigern deckelt auf ${LV[Math.max(0, x.kappe)]}` : ''} ⇒ ${LV[x.r]}` : `${was}: kein passender Eintrag ⇒ Kein Zugriff`;
    schritte.push(txt(fs, 'Freigaberechte (über das Netzwerk)'));
    schritte.push(txt(nt, 'NTFS-Rechte (Dateisystem)'));
    schritte.push(`Effektiv übers Netzwerk = das Restriktivere von Freigabe (${LV[fs.r]}) und NTFS (${LV[nt.r]}) ⇒ ${LV[r]}.`);
    if (!u.an) { r = 0; schritte.push('Das Konto ist deaktiviert – Anmeldung unmöglich ⇒ Kein Zugriff.'); }
    return { r, share: fs.r, ntfs: nt.r, schritte, text: LV[r] };
  }
  // GPOs, die auf eine OU wirken (LSDOU: Domäne → OU-Hierarchie von oben nach unten; spätere gewinnen)
  function gposFuer(ou) {
    const kette = [''], t = ou.split('/'); for (let i = 1; i <= t.length; i++) kette.push(t.slice(0, i).join('/'));
    const out = []; for (const o of kette) for (const g of Object.values(Z.gpos)) if (g.links.includes(o)) out.push({ g, o });
    return out;
  }
  function rsop(ou) { const s = {}, q = {}; for (const { g } of gposFuer(ou)) for (const [k, v] of Object.entries(g.s)) { s[k] = v; q[k] = g.n; } return { s, q }; }

  // ---------- Aufgaben ----------
  const erster = (f) => Object.values(Z.users).find(f);
  const STAMM = {}; // aus Startzustand ermittelte Personen (deterministisch)
  function stamm() {
    if (STAMM.ok) return STAMM;
    const s = start(), us = Object.values(s.users);
    STAMM.dev = (us.find(u => u.titel === 'Softwareentwickler' || u.titel === 'Softwareentwicklerin') || us[0]).sam;
    STAMM.wechsel = (us.find(u => u.abt === 'Vertrieb' && u.an && !/leite/i.test(u.titel)) || us[1]).sam;
    STAMM.geht = (us.find(u => u.abt === 'IT-Betrieb' && u.an && /administrator/i.test(u.titel) && !/Senior/.test(u.titel)) || us[2]).sam;
    STAMM.pe = (us.find(u => u.abt === 'Personal' && u.an) || us[3]).sam;
    STAMM.swe = (us.filter(u => u.abt === 'Softwareentwicklung' && u.an)[3] || us[4]).sam;
    STAMM.vt = (us.filter(u => u.abt === 'Vertrieb' && u.an)[2] || us[5]).sam;
    STAMM.ok = true; return STAMM;
  }
  const inG = (g, m) => { const x = gruppe(g); return !!x && x.m.some(y => kl(y) === kl(m)); };
  const OU_ITS = `${WURZEL}/Berlin/IT-Support`, OU_EK = `${WURZEL}/Leipzig/Einkauf`, OU_VT = `${WURZEL}/München/Vertrieb`, OU_AUS = `${WURZEL}/Ausgeschieden`;
  const AUFGABEN = [
    { id: 'titel', st: 'leicht', t: 'Beförderung: Titel anpassen', txt: () => `${uName(user(stamm().dev) || { nn: stamm().dev })} (${stamm().dev}) wird befördert. Setze den Titel auf „Senior Softwareentwickler“ (bzw. „Senior Softwareentwicklerin“).`,
      ok: () => /^senior softwareentwickler(in)?$/i.test((user(stamm().dev) || {}).titel || ''),
      tipps: ['Attribut „Title“ des Benutzerkontos.', 'GUI: Benutzer suchen → Eigenschaften → Titel.'],
      gui: 'AD-Benutzer und -Computer → Suche nach dem Namen → Benutzer anklicken → Feld „Titel“ ändern → Übernehmen.', ps: () => [`Set-ADUser -Identity ${stamm().dev} -Title "Senior Softwareentwickler"`] },
    { id: 'dns', st: 'leicht', t: 'DNS-A-Eintrag für neuen Drucker', txt: () => 'Der neue Drucker „drucker-og2“ hat die feste IP 10.0.0.60. Lege in der Zone netzilon.example einen A-Eintrag an – inklusive PTR-Eintrag in der Reverse-Zone 0.0.10.in-addr.arpa.',
      ok: () => Z.dns.some(r => r.z === DOM && kl(r.n) === 'drucker-og2' && r.t === 'A' && r.w === '10.0.0.60') && Z.dns.some(r => r.t === 'PTR' && r.n === '60' && /^drucker-og2/i.test(r.w)),
      tipps: ['A = Name → IP, PTR = IP → Name (Reverse-Lookup).', 'Beim Anlegen „PTR-Eintrag erstellen“ anhaken bzw. -CreatePtr.'],
      gui: 'DNS → Zone netzilon.example → Neuer A-Eintrag: Name drucker-og2, IP 10.0.0.60, Haken „PTR erstellen“.', ps: () => ['Add-DnsServerResourceRecordA -Name drucker-og2 -ZoneName netzilon.example -IPv4Address 10.0.0.60 -CreatePtr'] },
    { id: 'dhcp', st: 'leicht', t: 'DHCP-Reservierung', txt: () => 'drucker-og2 (MAC 00-15-5D-0A-00-60) soll per DHCP immer 10.0.0.60 bekommen. Lege im Bereich 10.0.0.0 eine Reservierung an.',
      ok: () => Z.dhcp.res.some(r => r.ip === '10.0.0.60' && r.mac === '00-15-5D-0A-00-60'),
      tipps: ['Reservierung = feste Zuordnung MAC → IP im Bereich.', 'ClientId ist die MAC-Adresse.'],
      gui: 'DHCP → Bereich 10.0.0.0 → Reservierungen → Neu: IP 10.0.0.60, MAC 00-15-5D-0A-00-60, Name drucker-og2.', ps: () => ['Add-DhcpServerv4Reservation -ScopeId 10.0.0.0 -IPAddress 10.0.0.60 -ClientId 00-15-5D-0A-00-60 -Name drucker-og2'] },
    { id: 'azubi', st: 'mittel', t: 'Neuer Azubi im IT-Support', txt: () => 'Lena Neumann beginnt ihre Ausbildung zur FiSi im IT-Support Berlin. Lege das Konto lena.neumann in der OU Berlin/IT-Support an (Abteilung IT-Support, Titel „Auszubildende FiSi“, aktiviert) und nimm sie in GG_ITS und GG_Azubis auf.',
      ok: () => { const u = user('lena.neumann'); return !!u && u.ou === OU_ITS && u.an && u.abt === 'IT-Support' && /auszubild/i.test(u.titel) && inG('GG_ITS', 'lena.neumann') && inG('GG_Azubis', 'lena.neumann'); },
      tipps: ['Konto in der richtigen OU anlegen – dort wirken die GPOs.', 'Berechtigungen nie direkt an Benutzer, sondern über Gruppen (GG_ITS, GG_Azubis).'],
      gui: 'AD-Benutzer und -Computer → OU Netzilon/Berlin/IT-Support → „Neuer Benutzer“ ausfüllen (aktiviert) → Benutzer anklicken → Gruppe GG_ITS und GG_Azubis hinzufügen.',
      ps: () => [`New-ADUser -Name "Lena Neumann" -GivenName Lena -Surname Neumann -SamAccountName lena.neumann -UserPrincipalName lena.neumann@netzilon.example -Department IT-Support -Title "Auszubildende FiSi" -Path "${ouDn(OU_ITS)}" -AccountPassword (Read-Host -AsSecureString) -Enabled $true`, 'Add-ADGroupMember -Identity GG_ITS -Members lena.neumann', 'Add-ADGroupMember -Identity GG_Azubis -Members lena.neumann'] },
    { id: 'marketing', st: 'mittel', t: 'Neue Abteilung Marketing', txt: () => 'In Köln entsteht die Abteilung Marketing. Lege die OU Marketing unter Netzilon/Köln an und eine globale Sicherheitsgruppe GG_MKT in der OU Netzilon/Gruppen.',
      ok: () => Z.ous.includes(`${WURZEL}/Köln/Marketing`) && !!gruppe('GG_MKT') && gruppe('GG_MKT').scope === 'Global',
      tipps: ['OUs bilden die Struktur (Standort/Abteilung), Gruppen die Berechtigungen.', 'GG_ = globale Gruppe für Benutzer (AGDLP: das „G“).'],
      gui: 'AD-Benutzer und -Computer → OU Köln wählen → „Neue OU“ Marketing; OU Gruppen → „Neue Gruppe“ GG_MKT, Bereich Global.',
      ps: () => [`New-ADOrganizationalUnit -Name Marketing -Path "${ouDn(WURZEL + '/Köln')}"`, `New-ADGroup -Name GG_MKT -GroupScope Global -GroupCategory Security -Path "${ouDn(WURZEL + '/Gruppen')}"`] },
    { id: 'kennwort', st: 'mittel', t: 'Kennwortrichtlinie verschärfen', txt: () => 'Die IT-Sicherheit fordert mindestens 12 Zeichen für alle Domänenkonten. Passe die Kennwortrichtlinie an.',
      ok: () => { const g = gruppeGpo('Default Domain Policy'); return !!g && g.links.includes('') && +g.s.pwMin >= 12; },
      tipps: ['Die Domänen-Kennwortrichtlinie gilt nur aus einer GPO, die mit der Domäne verknüpft ist (Default Domain Policy).', 'Alternativ: Set-ADDefaultDomainPasswordPolicy.'],
      gui: 'Gruppenrichtlinien → Default Domain Policy → Einstellung „minimale Kennwortlänge“ auf 12 → Speichern.', ps: () => ['Set-ADDefaultDomainPasswordPolicy -Identity netzilon.example -MinPasswordLength 12'] },
    { id: 'usb', st: 'mittel', t: 'USB-Sperre für den Vertrieb', txt: () => 'Im Vertrieb (München) sind Kundendaten auf USB-Sticks verschwunden. Die GPO „GPO_USB_Sperre“ existiert bereits – verknüpfe sie so, dass sie für den Vertrieb gilt, aber NICHT für die IT in Hamburg.',
      ok: () => { const g = gruppeGpo('GPO_USB_Sperre'); return !!g && g.s.usb === true && gposFuer(OU_VT).some(x => x.g === g) && !gposFuer(`${WURZEL}/Hamburg/IT-Betrieb`).some(x => x.g === g); },
      tipps: ['GPOs wirken auf die verknüpfte OU und alle Unter-OUs (Vererbung).', 'An die Domäne oder OU Netzilon verknüpft würde sie auch die IT treffen.'],
      gui: 'Gruppenrichtlinien → GPO_USB_Sperre wählen → Verknüpfen mit „Netzilon/München/Vertrieb“.', ps: () => [`New-GPLink -Name GPO_USB_Sperre -Target "${ouDn(OU_VT)}"`] },
    { id: 'wechsel', st: 'mittel', t: 'Abteilung wechselt', txt: () => `${uName(user(stamm().wechsel) || { nn: stamm().wechsel })} (${stamm().wechsel}) wechselt vom Vertrieb in den Einkauf (Leipzig). Verschiebe das Konto in die OU Leipzig/Einkauf, setze die Abteilung auf „Einkauf“, nimm es in GG_EK auf und aus GG_VT heraus.`,
      ok: () => { const u = user(stamm().wechsel); return !!u && u.ou === OU_EK && u.abt === 'Einkauf' && inG('GG_EK', u.sam) && !inG('GG_VT', u.sam); },
      tipps: ['Drei Dinge: OU (GPOs/Verwaltung), Attribut Department, Gruppen (Rechte).', 'Alte Gruppe entfernen – sonst behält er Vertriebsrechte (Rechteanhäufung).'],
      gui: 'Benutzer suchen → „Verschieben nach“ Netzilon/Leipzig/Einkauf, Abteilung „Einkauf“, Gruppe GG_EK hinzufügen, GG_VT entfernen.',
      ps: () => { const s = stamm().wechsel; return [`Get-ADUser ${s} | Move-ADObject -TargetPath "${ouDn(OU_EK)}"`, `Set-ADUser -Identity ${s} -Department Einkauf`, `Add-ADGroupMember -Identity GG_EK -Members ${s}`, `Remove-ADGroupMember -Identity GG_VT -Members ${s} -Confirm:$false`]; } },
    { id: 'austritt', st: 'schwer', t: 'Mitarbeiter verlässt die Firma', txt: () => `${uName(user(stamm().geht) || { nn: stamm().geht })} (${stamm().geht}) verlässt die Firma. Konto nicht löschen (Nachvollziehbarkeit!), sondern deaktivieren, aus allen Gruppen entfernen und in die OU Netzilon/Ausgeschieden verschieben.`,
      ok: () => { const u = user(stamm().geht); return !!u && !u.an && u.ou === OU_AUS && direkteGruppen(u.sam).length === 0; },
      tipps: ['Löschen zerstört die SID – Dateien/Protokolle zeigen dann nur noch eine unbekannte SID.', 'Get-ADPrincipalGroupMembership zeigt alle Gruppen des Kontos.'],
      gui: 'Benutzer suchen → „Deaktivieren“, jede Gruppe mit ✕ entfernen, „Verschieben nach“ Netzilon/Ausgeschieden.',
      ps: () => { const s = stamm().geht; return [`Disable-ADAccount -Identity ${s}`, ...direkteGruppen(s).map(g => `Remove-ADGroupMember -Identity ${g} -Members ${s} -Confirm:$false`), `Move-ADObject -Identity "${userDn(user(s))}" -TargetPath "${ouDn(OU_AUS)}"`]; } },
    { id: 'rechte', st: 'schwer', t: 'Rechte zu weit: Vertrieb liest Personalakten', txt: () => `Prüfung durch den Datenschutz: ${stamm().vt} (Vertrieb) kann die Freigabe „Personal“ lesen! Finde die Ursache mit „Effektive Rechte“ und korrigiere sie – der Vertrieb darf keinen Zugriff haben, die Personalabteilung (z. B. ${stamm().pe}) muss weiterhin ändern können.`,
      ok: () => { const vt = gruppe('GG_VT'); if (!vt || vt.m.length < 3) return false; const e = eff(stamm().pe, 'Personal'); return !!e && e.r >= 2 && mitgliederRek(vt).every(u => { const x = eff(u.sam, 'Personal'); return !x || x.r === 0; }); },
      tipps: ['Effektive Rechte für einen Vertriebler auf „Personal“ berechnen – welche Gruppe gibt Lesen?', 'GG_VT ist (fälschlich) Mitglied von DL_Personal_R. Nicht die Freigabe für alle verbiegen, sondern die Mitgliedschaft entfernen.'],
      gui: 'AD-Benutzer und -Computer → Gruppe DL_Personal_R (OU Gruppen) → Mitglied GG_VT entfernen. Danach unter Freigaben/NTFS erneut die effektiven Rechte prüfen.',
      ps: () => ['Get-ADGroupMember -Identity DL_Personal_R', 'Remove-ADGroupMember -Identity DL_Personal_R -Members GG_VT -Confirm:$false'] },
    { id: 'agdlp', st: 'schwer', t: 'AGDLP für neue Freigabe „Projekte“', txt: () => 'Die Softwareentwicklung braucht die Freigabe „Projekte“ (D:\\Freigaben\\Projekte) mit Ändern-Recht. Setze AGDLP um: Konten (A) in GG_SWE (G), GG_SWE in eine neue domänenlokale Gruppe DL_Projekte_RW (DL), NTFS-Recht Ändern nur für DL_Projekte_RW (P). Niemand sonst (z. B. Vertrieb) soll Zugriff haben.',
      ok: () => {
        const sh = Z.shares.find(s => kl(s.n) === 'projekte'), dl = gruppe('DL_Projekte_RW'); if (!sh || !dl || dl.scope !== 'DomainLocal' || !inG('DL_Projekte_RW', 'GG_SWE')) return false;
        if (!sh.ntfs.some(a => kl(a.p) === 'dl_projekte_rw' && !a.d && a.r === 2)) return false;
        if (sh.ntfs.some(a => !a.d && (user(a.p) || /^gg_/i.test(a.p)))) return false;
        const a = eff(stamm().swe, 'Projekte'), b = eff(stamm().vt, 'Projekte'); return !!a && a.r >= 2 && !!b && b.r === 0;
      },
      tipps: ['A → G → DL → P: Benutzer in globale Gruppe, globale Gruppe in domänenlokale Gruppe, Recht an die domänenlokale Gruppe.', 'Freigaberecht großzügig (Authentifizierte Benutzer: Ändern), fein steuern per NTFS.', 'Konsole: New-SmbShare, New-ADGroup -GroupScope DomainLocal, Add-ADGroupMember, icacls … /grant "NETZILON\\DL_Projekte_RW:(OI)(CI)M".'],
      gui: 'AD-Benutzer und -Computer: OU Gruppen → Neue Gruppe DL_Projekte_RW (Lokal in Domäne) → Mitglied GG_SWE. Freigaben/NTFS: Neue Freigabe Projekte (Freigabe: Authentifizierte Benutzer Ändern) → NTFS-Eintrag DL_Projekte_RW Ändern.',
      ps: () => ['New-SmbShare -Name Projekte -Path D:\\Freigaben\\Projekte -ChangeAccess "Authentifizierte Benutzer"', `New-ADGroup -Name DL_Projekte_RW -GroupScope DomainLocal -Path "${ouDn(WURZEL + '/Gruppen')}"`, 'Add-ADGroupMember -Identity DL_Projekte_RW -Members GG_SWE', 'icacls D:\\Freigaben\\Projekte /grant "NETZILON\\DL_Projekte_RW:(OI)(CI)M"'] }
  ];
  function gruppeGpo(n) { return Z.gpos[kl(n)] || null; }
  function pruefe(still) {
    const g = P().geloest; let neu = 0, letzte = null;
    for (const a of AUFGABEN) {
      if (g[a.id]) continue;
      let ok = false; try { ok = a.ok(); } catch (e) { console.warn('Domänen-Aufgabe', a.id, e); }
      if (ok) { g[a.id] = heute(); neu++; letzte = a; melde('domaene', 1); }
    }
    if (neu) {
      speichern();
      if (!still) {
        setTimeout(() => toast(`✓ Aufgabe gelöst: ${letzte.t}${neu > 1 ? ` (+${neu - 1} weitere)` : ''}`, 'gold'), 60);
        try { if (window.Mot && Mot.konfetti) Mot.konfetti(80); } catch {}
        try { ton('gong'); } catch {}
      }
    }
    return neu;
  }
  function aenderung(msg, art) { sichern(); pruefe(); zeichne(); if (msg) toast(msg, art); }

  // ---------- Kern-Operationen (von GUI UND Konsole genutzt; werfen Error mit deutscher Meldung) ----------
  const F = m => { throw new Error(m); };
  const nichtGef = (id, art = 'Objekt') => F(`Ein ${art} mit der Identität „${id}“ wurde unter „${DCDN}“ nicht gefunden.`);
  const samOk = s => /^[A-Za-z0-9._-]{1,20}$/.test(s);
  const OP = {
    neuUser(o) {
      const sam = String(o.sam || '').trim(); if (!samOk(sam)) F('Ungültiger Anmeldename (sAMAccountName): 1–20 Zeichen, Buchstaben/Ziffern/._-');
      if (user(sam) || gruppe(sam)) F(`Der angegebene Kontoname ist bereits vorhanden: „${sam}“.`);
      const ou = ouFinden(o.ou == null ? WURZEL : o.ou); if (ou === null || ou === '') F(`Der Container „${o.ou}“ existiert nicht.`);
      if (o.mgr && !user(o.mgr)) nichtGef(o.mgr, 'Manager-Objekt');
      const nn = String(o.nn || o.name || sam).trim().slice(0, 60);
      Z.users[kl(sam)] = { sam, vn: String(o.vn || '').trim().slice(0, 60), nn, abt: String(o.abt || '').slice(0, 60), titel: String(o.titel || '').slice(0, 80), mgr: o.mgr ? user(o.mgr).sam : '', stadt: ou.split('/')[1] || '', ou, an: !!o.an, mail: sam + '@' + DOM };
      return Z.users[kl(sam)];
    },
    setUser(id, o) {
      const u = user(id) || nichtGef(id);
      if (o.mgr !== undefined) { if (o.mgr && !user(o.mgr)) nichtGef(o.mgr, 'Manager-Objekt'); u.mgr = o.mgr ? user(o.mgr).sam : ''; }
      for (const k of ['abt', 'titel', 'vn', 'nn', 'stadt']) if (o[k] !== undefined) u[k] = String(o[k]).slice(0, 80);
      return u;
    },
    aktiv(id, an) { const u = user(id) || nichtGef(id); u.an = !!an; return u; },
    verschiebe(id, ziel) {
      const ou = ouFinden(ziel); if (ou === null || ou === '') F(`Der Zielcontainer „${ziel}“ existiert nicht.`);
      const u = user(id), g = !u && gruppe(id); if (!u && !g) nichtGef(id);
      (u || g).ou = ou; return u || g;
    },
    loescheUser(id) { const u = user(id) || nichtGef(id); delete Z.users[kl(u.sam)]; for (const g of Object.values(Z.groups)) g.m = g.m.filter(m => kl(m) !== kl(u.sam)); return u; },
    neuOu(name, pfad) {
      name = String(name || '').trim(); if (!/^[^/\\,=<>"]{1,40}$/.test(name)) F('Ungültiger OU-Name.');
      const p = pfad == null || pfad === '' ? '' : ouFinden(pfad); if (p === null || p === 'Users') F(`Der übergeordnete Container „${pfad}“ existiert nicht.`);
      const neu = p === '' ? name : p + '/' + name; if (Z.ous.some(x => kl(x) === kl(neu))) F(`Eine OU „${name}“ existiert dort bereits.`);
      Z.ous.push(neu); Z.ous.sort(); return neu;
    },
    neuGruppe(name, scope, pfad) {
      name = String(name || '').trim(); if (!/^[A-Za-z0-9_ äöüÄÖÜß-]{1,64}$/.test(name)) F('Ungültiger Gruppenname.');
      if (gruppe(name) || user(name)) F(`Das Objekt „${name}“ ist bereits vorhanden.`);
      const sc = SCOPES.find(s => kl(s) === kl(scope || 'Global')); if (!sc) F(`Ungültiger GroupScope „${scope}“ (Global, DomainLocal, Universal).`);
      const ou = ouFinden(pfad == null ? WURZEL + '/Gruppen' : pfad); if (ou === null || ou === '') F(`Der Container „${pfad}“ existiert nicht.`);
      return (Z.groups[kl(name)] = { n: name, scope: sc, ou, m: [], desc: '' });
    },
    gruppeDazu(gid, mid) {
      const g = gruppe(gid) || nichtGef(gid, 'Gruppenobjekt'), u = user(mid), sub = !u && gruppe(mid);
      if (!u && !sub) nichtGef(mid);
      const n = u ? u.sam : sub.n;
      if (sub && kl(sub.n) === kl(g.n)) F('Eine Gruppe kann nicht Mitglied von sich selbst sein.');
      if (sub && g.scope === 'Global' && sub.scope !== 'Global') F(`Eine globale Gruppe kann nur Konten und globale Gruppen enthalten – „${sub.n}“ ist ${SCOPE_DE[sub.scope]}.`);
      if (sub && sub.scope === 'DomainLocal' && g.scope !== 'DomainLocal') F('Eine domänenlokale Gruppe kann nur Mitglied anderer domänenlokaler Gruppen sein.');
      if (sub && mitgliedIn(g.n).some(x => kl(x) === kl(sub.n))) F('Zirkuläre Gruppenschachtelung ist nicht erlaubt.');
      if (!g.m.some(m => kl(m) === kl(n))) g.m.push(n); return g;
    },
    gruppeWeg(gid, mid) {
      const g = gruppe(gid) || nichtGef(gid, 'Gruppenobjekt');
      const vorher = g.m.length; g.m = g.m.filter(m => kl(m) !== kl(String(mid).replace(/^NETZILON\\/i, '')) && !(user(mid) && kl(m) === kl(user(mid).sam)));
      if (g.m.length === vorher) F(`„${mid}“ ist kein Mitglied von „${g.n}“.`); return g;
    },
    neuGpo(name) { name = String(name || '').trim(); if (!/^[A-Za-z0-9_ .-]{1,64}$/.test(name)) F('Ungültiger GPO-Name.'); if (gruppeGpo(name)) F(`Ein GPO mit dem Namen „${name}“ ist bereits vorhanden.`); return (Z.gpos[kl(name)] = { n: name, s: {}, links: [] }); },
    gpLink(name, ziel) {
      const g = gruppeGpo(name) || F(`Ein GPO mit dem Namen „${name}“ wurde in der Domäne ${DOM} nicht gefunden.`);
      const ou = ouFinden(ziel); if (ou === null || ou === 'Users') F(`Das Ziel „${ziel}“ ist keine OU oder Domäne (Container wie CN=Users sind nicht verknüpfbar).`);
      if (g.links.includes(ou)) F(`Das GPO „${g.n}“ ist bereits mit „${ouName(ou)}“ verknüpft.`);
      g.links.push(ou); return { g, ou };
    },
    gpUnlink(name, ou) { const g = gruppeGpo(name) || F(`GPO „${name}“ nicht gefunden.`); g.links = g.links.filter(l => l !== ou); return g; },
    dnsA(name, zone, ip, ptr) {
      name = String(name || '').trim().toLowerCase(); if (!/^[a-z0-9-]{1,63}$/.test(name)) F('Ungültiger Hostname.');
      if (kl(zone || DOM) !== DOM) F(`Die Zone „${zone}“ ist auf dem Server DC01 nicht vorhanden.`);
      if (!ipOk(ip)) F(`„${ip}“ ist keine gültige IPv4-Adresse.`);
      if (Z.dns.some(r => r.z === DOM && r.n === name && r.t === 'A' && r.w === ip)) F('Der Ressourceneintrag ist bereits vorhanden.');
      Z.dns.push({ z: DOM, n: name, t: 'A', w: ip });
      let p = '';
      if (ptr) { if (/^10\.0\.0\./.test(ip)) { const o = ip.split('.')[3]; if (!Z.dns.some(r => r.t === 'PTR' && r.n === o)) Z.dns.push({ z: '0.0.10.in-addr.arpa', n: o, t: 'PTR', w: name + '.' + DOM }); p = ' + PTR'; } else p = ' (PTR nicht möglich: keine Reverse-Zone für dieses Netz)'; }
      return p;
    },
    dnsCname(name, ziel) { name = String(name || '').trim().toLowerCase(); if (!/^[a-z0-9-]{1,63}$/.test(name)) F('Ungültiger Aliasname.'); if (Z.dns.some(r => r.z === DOM && r.n === name)) F('Für diesen Namen existiert bereits ein Eintrag – ein CNAME darf nicht neben anderen Einträgen stehen.'); Z.dns.push({ z: DOM, n: name, t: 'CNAME', w: String(ziel).includes('.') ? ziel : ziel + '.' + DOM }); },
    dnsWeg(i) { Z.dns.splice(i, 1); },
    reserv(ip, mac, name) {
      if (!ipOk(ip) || !/^10\.0\.0\./.test(ip)) F(`Die IP-Adresse „${ip}“ liegt nicht im Bereich 10.0.0.0/24.`);
      if (!macOk(mac)) F(`„${mac}“ ist keine gültige MAC-Adresse (Format 00-15-5D-0A-00-60).`);
      mac = normMac(mac);
      if (Z.dhcp.res.some(r => r.ip === ip)) F(`Für ${ip} existiert bereits eine Reservierung.`);
      if (Z.dhcp.res.some(r => r.mac === mac)) F(`Für die MAC ${mac} existiert bereits eine Reservierung.`);
      const l = Z.dhcp.leases.find(x => x.ip === ip && x.mac !== mac); if (l) F(`${ip} ist aktuell an ${l.name} (${l.mac}) verleast – andere Adresse wählen.`);
      Z.dhcp.res.push({ ip, mac, name: String(name || 'reserviert').slice(0, 40) });
    },
    neuShare(name, pfad) {
      name = String(name || '').trim(); if (!/^[A-Za-z0-9_$-]{1,40}$/.test(name)) F('Ungültiger Freigabename.');
      if (Z.shares.some(s => kl(s.n) === kl(name))) F(`Der Freigabename „${name}“ ist bereits vorhanden.`);
      const sh = { n: name, pfad: String(pfad || 'D:\\Freigaben\\' + name), share: [], ntfs: [{ p: 'Domänen-Admins', r: 3, d: false }] }; Z.shares.push(sh); return sh;
    },
    ace(shName, art, p, r, d) {
      const sh = Z.shares.find(s => kl(s.n) === kl(shName) || kl(s.pfad) === kl(shName)) || F(`Die Freigabe bzw. der Pfad „${shName}“ wurde nicht gefunden.`);
      p = String(p).replace(/^NETZILON\\/i, '').trim(); const ok = SPEZIAL.find(x => kl(x) === kl(p)) || (user(p) && user(p).sam) || (gruppe(p) && gruppe(p).n);
      if (!ok) F(`Zuordnungen von Kontennamen und Sicherheitskennungen wurden nicht durchgeführt: „${p}“.`);
      const l = sh[art]; const vorh = l.find(a => kl(a.p) === kl(ok) && a.d === !!d);
      if (vorh) vorh.r = r; else l.push({ p: ok, r, d: !!d }); return sh;
    },
    aceWeg(shName, art, p) { const sh = Z.shares.find(s => kl(s.n) === kl(shName) || kl(s.pfad) === kl(shName)) || F(`Freigabe „${shName}“ nicht gefunden.`); const v = sh[art].length; sh[art] = sh[art].filter(a => kl(a.p) !== kl(String(p).replace(/^NETZILON\\/i, ''))); if (v === sh[art].length) F(`Kein Eintrag für „${p}“ vorhanden.`); return sh; }
  };

  // ---------- PowerShell ----------
  function tokens(zeile) {
    const t = []; let i = 0;
    while (i < zeile.length) {
      const c = zeile[i];
      if (/\s/.test(c)) { i++; continue; }
      if (c === '|') { t.push({ pipe: true }); i++; continue; }
      let s = '', q = false;
      while (i < zeile.length && !/\s/.test(zeile[i]) && zeile[i] !== '|') {
        const ch = zeile[i];
        if (ch === '"' || ch === "'") { const e = zeile.indexOf(ch, i + 1); if (e < 0) throw new Error('Die Zeichenfolge hat kein Abschlusszeichen: ' + ch); s += zeile.slice(i + 1, e); i = e + 1; q = true; }
        else if (ch === '{') { let tief = 0, j = i; for (; j < zeile.length; j++) { if (zeile[j] === '{') tief++; else if (zeile[j] === '}' && --tief === 0) break; } if (j >= zeile.length) throw new Error('Die schließende „}“ fehlt im Anweisungsblock.'); s += zeile.slice(i + 1, j).trim(); i = j + 1; q = true; }
        else if (ch === '(') { let tief = 0, j = i; for (; j < zeile.length; j++) { if (zeile[j] === '(') tief++; else if (zeile[j] === ')' && --tief === 0) break; } s += zeile.slice(i, j + 1); i = j + 1; q = true; }
        else { s += ch; i++; }
      }
      t.push({ s, q });
    }
    return t;
  }
  function befehle(zeile) {
    const ts = tokens(zeile), stufen = [[]];
    for (const x of ts) if (x.pipe) stufen.push([]); else stufen[stufen.length - 1].push(x);
    return stufen.map(st => {
      if (!st.length) throw new Error('Leeres Pipelineelement ist nicht zulässig.');
      const name = st[0].s, par = {}, pos = [];
      for (let i = 1; i < st.length; i++) {
        const x = st[i];
        if (!x.q && (/^-[A-Za-z]/.test(x.s) || (kl(name) === 'icacls' && /^\/[a-z]+$/i.test(x.s)))) {
          const m = /^[-/]([A-Za-z0-9]+)(?::(.*))?$/.exec(x.s); const k = kl(m[1]);
          if (m[2] !== undefined) par[k] = m[2];
          else if (st[i + 1] && (st[i + 1].q || !/^-[A-Za-z]/.test(st[i + 1].s))) { par[k] = st[i + 1].q ? st[i + 1].s : st[i + 1].s; par['_q' + k] = st[i + 1].q; i++; }
          else par[k] = true;
        } else pos.push(x.s);
      }
      return { name, par, pos };
    });
  }
  const liste = v => v === true || v == null ? [] : String(v).split(',').map(x => x.trim()).filter(Boolean);
  const bool = v => v === true || /^\$?true$/i.test(String(v));
  const pad = (rows) => { const w = Math.max(...rows.map(r => r[0].length)); return rows.map(([k, v]) => k.padEnd(w) + ' : ' + v).join('\n'); };
  const PROPS = { department: ['Department', u => u.abt], title: ['Title', u => u.titel], manager: ['Manager', u => u.mgr ? userDn(user(u.mgr) || { nn: u.mgr, ou: '' }) : ''], city: ['City', u => u.stadt], emailaddress: ['EmailAddress', u => u.mail], memberof: ['MemberOf', u => '{' + direkteGruppen(u.sam).join(', ') + '}'], description: ['Description', () => ''] };
  function userText(u, props) {
    const rows = [['DistinguishedName', userDn(u)], ['Enabled', u.an ? 'True' : 'False'], ['GivenName', u.vn], ['Name', uName(u)], ['ObjectClass', 'user'], ['SamAccountName', u.sam], ['Surname', u.nn], ['UserPrincipalName', u.sam + '@' + DOM]];
    let pk = props === true ? [] : liste(props).map(kl); if (pk.includes('*')) pk = Object.keys(PROPS);
    for (const k of pk) if (PROPS[k]) rows.push([PROPS[k][0], PROPS[k][1](u)]); else if (k) rows.push([k, '']);
    return pad(rows.sort((a, b) => a[0].localeCompare(b[0])));
  }
  const ATTR = { name: uName, samaccountname: u => u.sam, department: u => u.abt, title: u => u.titel, enabled: u => u.an, city: u => u.stadt, surname: u => u.nn, givenname: u => u.vn, userprincipalname: u => u.sam + '@' + DOM, manager: u => u.mgr };
  function filter(f) {
    f = String(f).trim(); if (f === '*') return () => true;
    const teile = f.split(/\s+-and\s+/i).map(c => {
      const m = /^(\w+)\s+-(eq|ne|like|notlike)\s+(.+)$/i.exec(c.trim()); if (!m) throw new Error(`Fehler beim Analysieren der Abfrage: „${c}“. Erwartet: Attribut -eq|-ne|-like Wert`);
      const a = ATTR[kl(m[1])]; if (!a) throw new Error(`Das Attribut „${m[1]}“ wird im Filter nicht unterstützt (z. B. Name, SamAccountName, Department, Title, Enabled, City).`);
      let v = m[3].trim().replace(/^["']|["']$/g, ''); const op = kl(m[2]);
      const re = new RegExp('^' + v.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$', 'i');
      return u => { let x = a(u); if (typeof x === 'boolean') { const b = /^\$?true$/i.test(v); return op === 'ne' ? x !== b : x === b; } x = String(x); return op === 'eq' ? kl(x) === kl(v) : op === 'ne' ? kl(x) !== kl(v) : op === 'like' ? re.test(x) : !re.test(x); };
    });
    return u => teile.every(t => t(u));
  }
  const need = (c, p, ...k) => { for (const x of k) if (c.par[kl(x)] === undefined || c.par[kl(x)] === true) { const alt = x === 'Identity' && c.pos[0]; if (alt) { c.par.identity = alt; continue; } throw new Error(`Fehlender Parameter „-${x}“. Beispiel: ${p}`); } };
  const CMDS = {
    'get-aduser'(c, ein) {
      let us;
      if (c.par.filter !== undefined) us = Object.values(Z.users).filter(filter(c.par.filter));
      else if (c.par.identity || c.pos[0]) { const u = user(c.par.identity || c.pos[0]); if (!u) nichtGef(c.par.identity || c.pos[0]); us = [u]; }
      else if (ein && ein.length) us = ein.filter(x => x.sam);
      else throw new Error('Fehlender Parameter: -Identity oder -Filter. Beispiel: Get-ADUser -Filter "Department -eq \'Vertrieb\'"');
      return { objs: us, text: us.map(u => userText(u, c.par.properties)).join('\n\n') };
    },
    'new-aduser'(c) {
      need(c, 'New-ADUser -Name "Max Muster" -SamAccountName max.muster -Path "OU=…"', 'Name');
      const name = c.par.name, sam = c.par.samaccountname || String(name).replace(/\s+/g, '.').toLowerCase();
      const u = OP.neuUser({ sam, vn: c.par.givenname || '', nn: c.par.surname || (c.par.givenname ? name.replace(c.par.givenname, '').trim() : name), abt: c.par.department, titel: c.par.title, mgr: c.par.manager, ou: c.par.path, an: c.par.enabled !== undefined && bool(c.par.enabled) });
      return { objs: [u], text: u.an ? '' : 'WARNUNG: Konto wurde DEAKTIVIERT angelegt (ohne -Enabled $true). Mit Enable-ADAccount aktivieren.' };
    },
    'set-aduser'(c, ein) {
      const ids = c.par.identity || c.pos[0] ? [c.par.identity || c.pos[0]] : (ein || []).map(x => x.sam); if (!ids.length) need(c, 'Set-ADUser -Identity max.muster -Department Einkauf', 'Identity');
      const o = {}; const map = { department: 'abt', title: 'titel', manager: 'mgr', givenname: 'vn', surname: 'nn', city: 'stadt' };
      for (const [k, v] of Object.entries(map)) if (c.par[k] !== undefined && c.par[k] !== true) o[v] = c.par[k];
      if (!Object.keys(o).length) throw new Error('Keine Änderung angegeben (z. B. -Department, -Title, -Manager, -City).');
      return { objs: ids.map(i => OP.setUser(i, o)), text: '' };
    },
    'disable-adaccount'(c, ein) { const ids = c.par.identity || c.pos[0] ? [c.par.identity || c.pos[0]] : (ein || []).map(x => x.sam); if (!ids.length) need(c, 'Disable-ADAccount -Identity max.muster', 'Identity'); ids.forEach(i => OP.aktiv(i, false)); return { text: '' }; },
    'enable-adaccount'(c, ein) { const ids = c.par.identity || c.pos[0] ? [c.par.identity || c.pos[0]] : (ein || []).map(x => x.sam); if (!ids.length) need(c, 'Enable-ADAccount -Identity max.muster', 'Identity'); ids.forEach(i => OP.aktiv(i, true)); return { text: '' }; },
    'move-adobject'(c, ein) { need(c, 'Move-ADObject -Identity "CN=…" -TargetPath "OU=…"', 'TargetPath'); const ids = c.par.identity || c.pos[0] ? [c.par.identity || c.pos[0]] : (ein || []).map(x => x.sam || x.n); if (!ids.length) need(c, '', 'Identity'); ids.forEach(i => OP.verschiebe(i, c.par.targetpath)); return { text: '' }; },
    'remove-aduser'(c, ein) { const ids = c.par.identity || c.pos[0] ? [c.par.identity || c.pos[0]] : (ein || []).map(x => x.sam); if (!ids.length) need(c, 'Remove-ADUser -Identity max.muster', 'Identity'); ids.forEach(i => OP.loescheUser(i)); return { text: c.par.confirm === undefined ? '(Bestätigung simuliert: Ja) Tipp: Konten ausgeschiedener Mitarbeiter besser deaktivieren statt löschen.' : '' }; },
    'new-adorganizationalunit'(c) { need(c, 'New-ADOrganizationalUnit -Name Marketing -Path "OU=Köln,OU=Netzilon,DC=netzilon,DC=example"', 'Name'); const o = OP.neuOu(c.par.name, c.par.path === undefined ? '' : c.par.path); return { text: '' , ou: o }; },
    'get-adorganizationalunit'() { return { text: Z.ous.filter(o => o !== 'Users').map(o => 'DistinguishedName : ' + ouDn(o)).join('\n') }; },
    'new-adgroup'(c) { need(c, 'New-ADGroup -Name GG_MKT -GroupScope Global -Path "OU=Gruppen,OU=Netzilon,DC=netzilon,DC=example"', 'Name'); if (!c.par.groupscope || c.par.groupscope === true) throw new Error('Fehlender Parameter „-GroupScope“ (Global, DomainLocal, Universal).'); OP.neuGruppe(c.par.name, c.par.groupscope, c.par.path); return { text: '' }; },
    'get-adgroup'(c) { const ids = c.par.filter !== undefined ? Object.values(Z.groups).filter(g => c.par.filter === '*' || new RegExp(String(c.par.filter).replace(/.*-like\s+/i, '').replace(/['"]/g, '').replace(/\*/g, '.*'), 'i').test(g.n)) : [gruppe(c.par.identity || c.pos[0]) || nichtGef(c.par.identity || c.pos[0], 'Gruppenobjekt')]; return { text: ids.map(g => pad([['DistinguishedName', `CN=${g.n},${ouDn(g.ou)}`], ['GroupCategory', 'Security'], ['GroupScope', g.scope], ['Name', g.n], ['SamAccountName', g.n]])).join('\n\n') }; },
    'get-adgroupmember'(c) { need(c, 'Get-ADGroupMember -Identity GG_VT', 'Identity'); const g = gruppe(c.par.identity) || nichtGef(c.par.identity, 'Gruppenobjekt'); const ms = c.par.recursive ? mitgliederRek(g).map(u => u.sam) : g.m; return { objs: ms.map(m => user(m) || gruppe(m)).filter(Boolean), text: ms.length ? ms.map(m => { const u = user(m); return pad([['name', u ? uName(u) : m], ['objectClass', u ? 'user' : 'group'], ['SamAccountName', u ? u.sam : m]]); }).join('\n\n') : '(keine Mitglieder)' }; },
    'get-adprincipalgroupmembership'(c) { need(c, 'Get-ADPrincipalGroupMembership -Identity max.muster', 'Identity'); const u = user(c.par.identity) || gruppe(c.par.identity) || nichtGef(c.par.identity); const gs = direkteGruppen(u.sam || u.n); return { text: ['Domänen-Benutzer (primäre Gruppe)', ...gs].map(g => 'name : ' + g).join('\n') }; },
    'add-adgroupmember'(c) { need(c, 'Add-ADGroupMember -Identity GG_ITS -Members lena.neumann', 'Identity', 'Members'); liste(c.par.members).forEach(m => OP.gruppeDazu(c.par.identity, m)); return { text: '' }; },
    'remove-adgroupmember'(c) { need(c, 'Remove-ADGroupMember -Identity GG_VT -Members max.muster -Confirm:$false', 'Identity', 'Members'); liste(c.par.members).forEach(m => OP.gruppeWeg(c.par.identity, m)); return { text: c.par.confirm === undefined ? '(Bestätigung simuliert: Ja – in echt mit -Confirm:$false unterdrücken)' : '' }; },
    'new-gpo'(c) { need(c, 'New-GPO -Name GPO_Test', 'Name'); const g = OP.neuGpo(c.par.name); return { text: pad([['DisplayName', g.n], ['DomainName', DOM], ['GpoStatus', 'AllSettingsEnabled'], ['Hinweis', 'Noch nicht verknüpft → wirkt nirgends (New-GPLink)']]) }; },
    'new-gplink'(c) { need(c, 'New-GPLink -Name GPO_USB_Sperre -Target "OU=Vertrieb,OU=München,OU=Netzilon,DC=netzilon,DC=example"', 'Name', 'Target'); const { g, ou } = OP.gpLink(c.par.name, c.par.target); return { text: pad([['GpoId', '{' + hashId(g.n) + '}'], ['DisplayName', g.n], ['Enabled', 'True'], ['Enforced', 'False'], ['Target', ouDn(ou)], ['Order', String(Object.values(Z.gpos).filter(x => x.links.includes(ou)).length)]]) }; },
    'remove-gplink'(c) { need(c, 'Remove-GPLink -Name X -Target "OU=…"', 'Name', 'Target'); const ou = ouFinden(c.par.target); if (ou === null) throw new Error('Ziel nicht gefunden.'); OP.gpUnlink(c.par.name, ou); return { text: '' }; },
    'get-gpo'(c) { const gs = c.par.all ? Object.values(Z.gpos) : [gruppeGpo(c.par.name || c.pos[0]) || F(`Ein GPO mit dem Namen „${c.par.name || c.pos[0] || ''}“ wurde nicht gefunden. Tipp: Get-GPO -All`)]; return { text: gs.map(g => pad([['DisplayName', g.n], ['DomainName', DOM], ['Id', hashId(g.n)], ['GpoStatus', 'AllSettingsEnabled'], ['Verknüpft mit', g.links.map(ouName).join(', ') || '(nicht verknüpft)'], ['Einstellungen', Object.entries(g.s).map(([k, v]) => k + '=' + v).join('; ') || '(keine)']])).join('\n\n') }; },
    'set-addefaultdomainpasswordpolicy'(c) { need(c, 'Set-ADDefaultDomainPasswordPolicy -Identity netzilon.example -MinPasswordLength 12', 'MinPasswordLength'); const n = parseInt(c.par.minpasswordlength, 10); if (!(n >= 0 && n <= 14)) throw new Error('MinPasswordLength muss zwischen 0 und 14 liegen.'); gruppeGpo('Default Domain Policy').s.pwMin = n; return { text: '' }; },
    'get-addefaultdomainpasswordpolicy'() { const s = gruppeGpo('Default Domain Policy').s; return { text: pad([['ComplexityEnabled', 'True'], ['LockoutThreshold', String(s.sperre ?? 0)], ['MaxPasswordAge', (s.pwMaxAlter ?? 42) + '.00:00:00'], ['MinPasswordLength', String(s.pwMin ?? 7)]]) }; },
    'add-dnsserverresourcerecorda'(c) { need(c, 'Add-DnsServerResourceRecordA -Name drucker-og2 -ZoneName netzilon.example -IPv4Address 10.0.0.60', 'Name', 'ZoneName', 'IPv4Address'); const p = OP.dnsA(c.par.name, c.par.zonename, c.par.ipv4address, !!c.par.createptr); return { text: p.startsWith(' (') ? 'WARNUNG:' + p : '' }; },
    'add-dnsserverresourcerecordcname'(c) { need(c, 'Add-DnsServerResourceRecordCName -Name wiki -HostNameAlias web01.netzilon.example -ZoneName netzilon.example', 'Name', 'HostNameAlias'); OP.dnsCname(c.par.name, c.par.hostnamealias); return { text: '' }; },
    'get-dnsserverresourcerecord'(c) { need(c, 'Get-DnsServerResourceRecord -ZoneName netzilon.example', 'ZoneName'); const z = kl(c.par.zonename); let rs = Z.dns.filter(r => r.z === z); if (!rs.length && z !== DOM && z !== '0.0.10.in-addr.arpa') throw new Error(`Die Zone „${c.par.zonename}“ ist auf DC01 nicht vorhanden.`); if (c.par.name && c.par.name !== true) rs = rs.filter(r => kl(r.n) === kl(c.par.name)); if (c.par.rrtype && c.par.rrtype !== true) rs = rs.filter(r => kl(r.t) === kl(c.par.rrtype)); return { text: 'HostName'.padEnd(22) + 'RecordType Timestamp  TimeToLive RecordData\n' + '-'.repeat(22) + ' ---------- ---------  ---------- ----------\n' + rs.map(r => r.n.padEnd(22) + ' ' + r.t.padEnd(10) + ' 0          01:00:00   ' + r.w).join('\n') }; },
    'get-dhcpserverv4scope'() { const d = Z.dhcp; return { text: pad([['ScopeId', '10.0.0.0'], ['SubnetMask', '255.255.255.0'], ['Name', 'Netzilon LAN'], ['State', 'Active'], ['StartRange', d.von], ['EndRange', d.bis], ['LeaseDuration', '8.00:00:00'], ['Router (003)', d.gw], ['DNS-Server (006)', d.dnsSrv]]) }; },
    'get-dhcpserverv4lease'(c) { need(c, 'Get-DhcpServerv4Lease -ScopeId 10.0.0.0', 'ScopeId'); if (c.par.scopeid !== '10.0.0.0') throw new Error(`Der Bereich ${c.par.scopeid} ist auf dem DHCP-Server nicht vorhanden.`); return { text: 'IPAddress      ClientId           HostName                          AddressState\n---------      --------           --------                          ------------\n' + [...Z.dhcp.leases.map(l => [l, 'Active']), ...Z.dhcp.res.map(l => [l, 'ActiveReservation'])].map(([l, s]) => l.ip.padEnd(14) + ' ' + l.mac.padEnd(18) + ' ' + l.name.padEnd(33) + ' ' + s).join('\n') }; },
    'get-dhcpserverv4reservation'(c) { need(c, 'Get-DhcpServerv4Reservation -ScopeId 10.0.0.0', 'ScopeId'); return { text: 'IPAddress      ClientId           Name\n' + Z.dhcp.res.map(r => r.ip.padEnd(14) + ' ' + r.mac.padEnd(18) + ' ' + r.name).join('\n') }; },
    'add-dhcpserverv4reservation'(c) { need(c, 'Add-DhcpServerv4Reservation -ScopeId 10.0.0.0 -IPAddress 10.0.0.60 -ClientId 00-15-5D-0A-00-60', 'ScopeId', 'IPAddress', 'ClientId'); if (c.par.scopeid !== '10.0.0.0') throw new Error(`Der Bereich ${c.par.scopeid} ist nicht vorhanden.`); OP.reserv(c.par.ipaddress, c.par.clientid, c.par.name); return { text: '' }; },
    'new-smbshare'(c) {
      need(c, 'New-SmbShare -Name Projekte -Path D:\\Freigaben\\Projekte -ChangeAccess "Authentifizierte Benutzer"', 'Name', 'Path');
      const sh = OP.neuShare(c.par.name, c.par.path);
      for (const [k, r] of [['readaccess', 1], ['changeaccess', 2], ['fullaccess', 3]]) liste(c.par[k]).forEach(p => OP.ace(sh.n, 'share', p, r));
      if (!sh.share.length) sh.share.push({ p: 'Jeder', r: 1, d: false });
      return { text: pad([['Name', sh.n], ['ScopeName', '*'], ['Path', sh.pfad], ['Description', '']]) };
    },
    'grant-smbshareaccess'(c) { need(c, 'Grant-SmbShareAccess -Name Projekte -AccountName "NETZILON\\DL_Projekte_RW" -AccessRight Change', 'Name', 'AccountName', 'AccessRight'); const r = { read: 1, change: 2, full: 3 }[kl(c.par.accessright)]; if (!r) throw new Error('AccessRight muss Read, Change oder Full sein.'); OP.ace(c.par.name, 'share', c.par.accountname, r); return { text: '' }; },
    'revoke-smbshareaccess'(c) { need(c, 'Revoke-SmbShareAccess -Name X -AccountName Jeder', 'Name', 'AccountName'); OP.aceWeg(c.par.name, 'share', c.par.accountname); return { text: '' }; },
    'block-smbshareaccess'(c) { need(c, 'Block-SmbShareAccess -Name X -AccountName Y', 'Name', 'AccountName'); OP.ace(c.par.name, 'share', c.par.accountname, 1, true); return { text: '' }; },
    'get-smbshare'() { return { text: 'Name           Path\n----           ----\n' + Z.shares.map(s => s.n.padEnd(14) + ' ' + s.pfad).join('\n') }; },
    'get-smbshareaccess'(c) { need(c, 'Get-SmbShareAccess -Name Personal', 'Name'); const sh = Z.shares.find(s => kl(s.n) === kl(c.par.name)) || F(`Keine MSFT_SMBShare-Objekte gefunden, bei denen die Eigenschaft „Name“ gleich „${c.par.name}“ ist.`); return { text: 'AccountName                    AccessControlType AccessRight\n' + sh.share.map(a => (NB + '\\' + a.p).padEnd(30) + ' ' + (a.d ? 'Deny ' : 'Allow').padEnd(17) + ' ' + ['', 'Read', 'Change', 'Full'][a.r]).join('\n') }; },
    'get-acl'(c) { const p = c.par.path || c.pos[0]; if (!p) throw new Error('Fehlender Parameter „-Path“. Beispiel: Get-Acl D:\\Freigaben\\Personal | Format-List'); const sh = Z.shares.find(s => kl(s.pfad) === kl(p) || kl(s.n) === kl(p)) || F(`Der Pfad „${p}“ kann nicht gefunden werden, da er nicht vorhanden ist.`); return { text: pad([['Path', sh.pfad], ['Owner', 'VORDEFINIERT\\Administratoren'], ['Access', '']]) + '\n' + sh.ntfs.map(a => '         ' + (SPEZIAL.includes(a.p) ? a.p : NB + '\\' + a.p) + ' ' + (a.d ? 'Deny' : 'Allow') + '  ' + ['', 'ReadAndExecute, Synchronize', 'Modify, Synchronize', 'FullControl'][a.r]).join('\n') }; },
    icacls(c) {
      const p = c.pos[0]; if (!p) throw new Error('Syntax: icacls <Pfad> [/grant|/deny|/remove] "NETZILON\\Gruppe:(OI)(CI)M"');
      const sh = Z.shares.find(s => kl(s.pfad) === kl(p)) || F(`${p}: Das System kann die angegebene Datei nicht finden.`);
      const op = ['grant', 'deny', 'remove'].find(o => c.par[o] !== undefined);
      if (!op) return { text: sh.pfad + ' ' + sh.ntfs.map(a => (SPEZIAL.includes(a.p) ? a.p : NB + '\\' + a.p) + ':' + (a.d ? '(DENY)' : '') + '(OI)(CI)(' + ['', 'RX', 'M', 'F'][a.r] + ')').join('\n' + ' '.repeat(sh.pfad.length + 1)) + '\n1 Datei erfolgreich verarbeitet, bei 0 Dateien ist ein Verarbeitungsfehler aufgetreten.' };
      const arg = String(c.par[op] === true ? c.pos[1] || '' : c.par[op]);
      if (op === 'remove') { OP.aceWeg(sh.n, 'ntfs', arg.replace(/:.*$/, '')); return { text: 'Bearbeitete Datei: ' + sh.pfad + '\n1 Datei erfolgreich verarbeitet.' }; }
      const m = /^(.+?):((?:\([A-Z]+\))*)\(?(F|M|RX|R|W)\)?$/i.exec(arg); if (!m) throw new Error('Ungültiger Parameter: „' + arg + '“ (Beispiel: "NETZILON\\DL_X:(OI)(CI)M")');
      const r = { f: 3, m: 2, w: 2, rx: 1, r: 1 }[kl(m[3])]; OP.ace(sh.n, 'ntfs', m[1], op === 'deny' ? ({ 3: 1, 2: 2, 1: 1 })[r] : r, op === 'deny');
      return { text: 'Bearbeitete Datei: ' + sh.pfad + '\n1 Datei erfolgreich verarbeitet, bei 0 Dateien ist ein Verarbeitungsfehler aufgetreten.' };
    },
    'get-adtrust'() { return { text: Z.trusts.map(t => pad([['Direction', t.richtung === 'Bidirektional' ? 'BiDirectional' : t.richtung], ['ForestTransitive', String(t.transitiv)], ['Name', t.ziel], ['Source', DCDN], ['Target', t.ziel], ['TrustType', 'Uplevel'], ['IntraForest', 'False'], ['SelectiveAuthentication', 'False']])).join('\n\n') }; },
    'measure-object'(c, ein) { return { text: 'Count    : ' + (ein || []).length }; },
    'select-object'(c, ein, vorher) { return { objs: ein, text: vorher }; }, 'format-list'(c, ein, vorher) { return { objs: ein, text: vorher }; }, 'format-table'(c, ein, vorher) { return { objs: ein, text: vorher }; },
    'get-help'(c) {
      const n = kl(c.par.name || c.pos[0] || '');
      if (n && HILFE[n]) return { text: `NAME\n    ${CMDNAME[n]}\n\nÜBERSICHT\n    ${HILFE[n][0]}\n\nBEISPIEL\n    ${HILFE[n][1]}` };
      if (n && !CMDS[n]) throw new Error(`Get-Help konnte keine Hilfe zu „${c.pos[0] || c.par.name}“ finden.`);
      return { text: 'Verfügbare Befehle (Tab vervollständigt, ↑/↓ = Verlauf):\n' + Object.keys(HILFE).map(k => '  ' + CMDNAME[k].padEnd(36) + HILFE[k][0]).join('\n') };
    },
    'clear-host'() { ausgabe = []; return { text: '' }; },
    hostname() { return { text: 'DC01' }; },
    whoami() { return { text: 'netzilon\\administrator' }; }
  };
  CMDS.cls = CMDS.clear = CMDS['clear-host']; CMDS.help = CMDS['get-help']; CMDS.fl = CMDS['format-list']; CMDS.ft = CMDS['format-table']; CMDS.select = CMDS['select-object']; CMDS.measure = CMDS['measure-object'];
  const HILFE = {
    'get-aduser': ['Benutzer anzeigen (-Identity, -Filter, -Properties)', `Get-ADUser -Filter "Department -eq 'Vertrieb'" -Properties Title`],
    'new-aduser': ['Benutzer anlegen', 'New-ADUser -Name "Max Muster" -SamAccountName max.muster -Path "OU=IT-Support,OU=Berlin,OU=Netzilon,DC=netzilon,DC=example" -Enabled $true'],
    'set-aduser': ['Attribute ändern (-Department, -Title, -Manager, -City)', 'Set-ADUser -Identity max.muster -Title "Systemadministrator"'],
    'disable-adaccount': ['Konto deaktivieren', 'Disable-ADAccount -Identity max.muster'], 'enable-adaccount': ['Konto aktivieren', 'Enable-ADAccount -Identity max.muster'],
    'move-adobject': ['Objekt in andere OU verschieben', 'Get-ADUser max.muster | Move-ADObject -TargetPath "OU=Ausgeschieden,OU=Netzilon,DC=netzilon,DC=example"'],
    'remove-aduser': ['Benutzer löschen (Vorsicht: SID weg!)', 'Remove-ADUser -Identity max.muster -Confirm:$false'],
    'new-adorganizationalunit': ['OU anlegen', 'New-ADOrganizationalUnit -Name Marketing -Path "OU=Köln,OU=Netzilon,DC=netzilon,DC=example"'],
    'get-adorganizationalunit': ['Alle OUs auflisten', 'Get-ADOrganizationalUnit -Filter *'],
    'new-adgroup': ['Gruppe anlegen (Global/DomainLocal/Universal)', 'New-ADGroup -Name DL_Projekte_RW -GroupScope DomainLocal'],
    'get-adgroup': ['Gruppe anzeigen', 'Get-ADGroup -Filter "Name -like \'DL_*\'"'],
    'get-adgroupmember': ['Mitglieder einer Gruppe (-Recursive)', 'Get-ADGroupMember -Identity DL_Personal_R'],
    'get-adprincipalgroupmembership': ['Gruppen eines Kontos', 'Get-ADPrincipalGroupMembership -Identity max.muster'],
    'add-adgroupmember': ['Mitglieder hinzufügen', 'Add-ADGroupMember -Identity GG_ITS -Members max.muster,erika.muster'],
    'remove-adgroupmember': ['Mitglieder entfernen', 'Remove-ADGroupMember -Identity GG_VT -Members max.muster -Confirm:$false'],
    'new-gpo': ['Gruppenrichtlinienobjekt anlegen', 'New-GPO -Name GPO_Test'], 'new-gplink': ['GPO mit OU/Domäne verknüpfen', 'New-GPLink -Name GPO_USB_Sperre -Target "OU=Vertrieb,OU=München,OU=Netzilon,DC=netzilon,DC=example"'],
    'remove-gplink': ['Verknüpfung entfernen', 'Remove-GPLink -Name GPO_Test -Target "OU=Netzilon,DC=netzilon,DC=example"'],
    'get-gpo': ['GPO anzeigen (-Name, -All)', 'Get-GPO -All'],
    'set-addefaultdomainpasswordpolicy': ['Kennwortrichtlinie der Domäne setzen', 'Set-ADDefaultDomainPasswordPolicy -Identity netzilon.example -MinPasswordLength 12'],
    'get-addefaultdomainpasswordpolicy': ['Kennwortrichtlinie anzeigen', 'Get-ADDefaultDomainPasswordPolicy'],
    'add-dnsserverresourcerecorda': ['DNS-A-Eintrag (-CreatePtr)', 'Add-DnsServerResourceRecordA -Name drucker-og2 -ZoneName netzilon.example -IPv4Address 10.0.0.60 -CreatePtr'],
    'add-dnsserverresourcerecordcname': ['DNS-Alias (CNAME)', 'Add-DnsServerResourceRecordCName -Name wiki -HostNameAlias web01.netzilon.example -ZoneName netzilon.example'],
    'get-dnsserverresourcerecord': ['DNS-Einträge einer Zone', 'Get-DnsServerResourceRecord -ZoneName netzilon.example -RRType A'],
    'get-dhcpserverv4scope': ['DHCP-Bereich anzeigen', 'Get-DhcpServerv4Scope'],
    'get-dhcpserverv4lease': ['DHCP-Leases anzeigen', 'Get-DhcpServerv4Lease -ScopeId 10.0.0.0'],
    'get-dhcpserverv4reservation': ['Reservierungen anzeigen', 'Get-DhcpServerv4Reservation -ScopeId 10.0.0.0'],
    'add-dhcpserverv4reservation': ['DHCP-Reservierung anlegen', 'Add-DhcpServerv4Reservation -ScopeId 10.0.0.0 -IPAddress 10.0.0.60 -ClientId 00-15-5D-0A-00-60 -Name drucker-og2'],
    'new-smbshare': ['Freigabe anlegen (-FullAccess/-ChangeAccess/-ReadAccess)', 'New-SmbShare -Name Projekte -Path D:\\Freigaben\\Projekte -ChangeAccess "Authentifizierte Benutzer"'],
    'grant-smbshareaccess': ['Freigaberecht erteilen (Read/Change/Full)', 'Grant-SmbShareAccess -Name Projekte -AccountName "NETZILON\\GG_SWE" -AccessRight Read'],
    'revoke-smbshareaccess': ['Freigaberecht entfernen', 'Revoke-SmbShareAccess -Name Projekte -AccountName Jeder'],
    'get-smbshare': ['Freigaben auflisten', 'Get-SmbShare'], 'get-smbshareaccess': ['Freigaberechte anzeigen', 'Get-SmbShareAccess -Name Personal'],
    'get-acl': ['NTFS-Rechte anzeigen', 'Get-Acl D:\\Freigaben\\Personal | Format-List'],
    icacls: ['NTFS-Rechte ändern (/grant, /deny, /remove)', 'icacls D:\\Freigaben\\Projekte /grant "NETZILON\\DL_Projekte_RW:(OI)(CI)M"'],
    'get-adtrust': ['Vertrauensstellungen anzeigen', 'Get-ADTrust -Filter *'], 'get-help': ['Hilfe', 'Get-Help New-ADUser'], 'clear-host': ['Konsole leeren (cls)', 'cls']
  };
  const CMDNAME = {}; for (const k of Object.keys(HILFE)) CMDNAME[k] = k === 'icacls' ? 'icacls' : k.split('-').map(x => x.replace(/^ad/, 'AD').replace(/^gp/, 'GP').replace(/^smb/, 'Smb').replace(/^dns/, 'Dns').replace(/^dhcp/, 'Dhcp').replace(/^./, c => c.toUpperCase())).join('-')
    .replace('Adorganizationalunit', 'ADOrganizationalUnit').replace('ADuser', 'ADUser').replace('ADgroupmember', 'ADGroupMember').replace('ADgroup', 'ADGroup').replace('ADaccount', 'ADAccount').replace('ADobject', 'ADObject').replace('ADtrust', 'ADTrust').replace('ADprincipalgroupmembership', 'ADPrincipalGroupMembership').replace('ADdefaultdomainpasswordpolicy', 'ADDefaultDomainPasswordPolicy').replace('ADorganizationalunit', 'ADOrganizationalUnit')
    .replace('GPlink', 'GPLink').replace('GPo', 'GPO').replace('Dnsserverresourcerecorda', 'DnsServerResourceRecordA').replace('Dnsserverresourcerecordcname', 'DnsServerResourceRecordCName').replace('Dnsserverresourcerecord', 'DnsServerResourceRecord')
    .replace('Dhcpserverv4scope', 'DhcpServerv4Scope').replace('Dhcpserverv4lease', 'DhcpServerv4Lease').replace('Dhcpserverv4reservation', 'DhcpServerv4Reservation').replace('Smbshareaccess', 'SmbShareAccess').replace('Smbshare', 'SmbShare').replace('Clear-Host', 'Clear-Host');
  function hashId(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); const x = (h >>> 0).toString(16).padStart(8, '0'); return `${x}-${x.slice(0, 4)}-4${x.slice(1, 4)}-a${x.slice(5, 8)}-${x}${x.slice(0, 4)}`; }
  // Führt eine Zeile aus → { ok, text }
  function ausfuehren(zeile) {
    zeile = String(zeile || '').trim(); if (!zeile) return { ok: true, text: '' };
    let stufen; try { stufen = befehle(zeile); } catch (e) { return { ok: false, text: e.message }; }
    let objs = null, text = '', geaendert = false;
    for (const c of stufen) {
      const k = kl(c.name), f = CMDS[k];
      if (!f) return { ok: false, text: `${c.name} : Die Benennung „${c.name}“ wurde nicht als Name eines Cmdlet, einer Funktion, einer Skriptdatei oder eines ausführbaren Programms erkannt. Überprüfen Sie die Schreibweise des Namens. Tipp: Get-Help` };
      try {
        const vorher = JSON.stringify(Z);
        const r = f(c, objs, text) || {}; objs = r.objs || null; text = r.text || '';
        if (JSON.stringify(Z) !== vorher) geaendert = true;
      } catch (e) { if (geaendert) aenderung(); return { ok: false, text: `${CMDNAME[k] || c.name} : ${e.message}` }; }
    }
    if (geaendert) { sichern(); pruefe(); }
    return { ok: true, text, geaendert };
  }

  // ---------- Darstellung ----------
  const TABS = [['aduc', 'AD-Benutzer und -Computer'], ['gpo', 'Gruppenrichtlinien'], ['dns', 'DNS'], ['dhcp', 'DHCP'], ['share', 'Freigaben/NTFS'], ['trust', 'Vertrauensstellungen'], ['ps', 'PowerShell']];
  const opts = (arr, sel) => arr.map(([v, t]) => `<option value="${E(v)}" ${v === sel ? 'selected' : ''}>${E(t)}</option>`).join('');
  const ouOpts = (sel, mitRoot) => opts([...(mitRoot ? [['', DOM + ' (Domäne)']] : []), ...Z.ous.filter(o => o !== 'Users' && o !== 'Domain Controllers').map(o => [o, o])], sel);
  const allNamen = () => [...Object.values(Z.users).map(u => u.sam), ...Object.values(Z.groups).map(g => g.n)];
  const lvOpts = sel => opts([['1', 'Lesen'], ['2', 'Ändern'], ['3', 'Vollzugriff']], String(sel));

  function baum() {
    const kinder = p => Z.ous.filter(o => o !== 'Users' && o !== 'Domain Controllers' && (p === '' ? !o.includes('/') : o.startsWith(p + '/') && !o.slice(p.length + 1).includes('/')));
    const zahl = o => Object.values(Z.users).filter(u => u.ou === o).length;
    const knoten = (o, t) => `<button class="dom-knoten ${o === ouSel ? 'dom-akt' : ''}" data-a="ou" data-v="${E(o)}" style="padding-left:${6 + t * 14}px">📁 ${E(ouName(o))}${zahl(o) ? ` <small>(${zahl(o)})</small>` : ''}</button>` + kinder(o).map(k => knoten(k, t + 1)).join('');
    return `<div class="dom-baum"><div class="dom-knoten dom-wurzel">🌐 ${DOM}</div>${['Users', 'Domain Controllers'].map(o => `<button class="dom-knoten ${o === ouSel ? 'dom-akt' : ''}" data-a="ou" data-v="${o}" style="padding-left:20px">📁 ${o}</button>`).join('')}${kinder('').map(k => knoten(k, 1)).join('')}</div>`;
  }
  function panelAduc() {
    const s = kl(suche.trim());
    const us = Object.values(Z.users).filter(u => s ? (kl(u.sam).includes(s) || kl(uName(u)).includes(s) || kl(u.abt).includes(s)) : u.ou === ouSel).sort((a, b) => a.nn.localeCompare(b.nn));
    const gs = s ? Object.values(Z.groups).filter(g => kl(g.n).includes(s)) : Object.values(Z.groups).filter(g => g.ou === ouSel);
    const dc = ouSel === 'Domain Controllers' ? `<tr><td>🖥 DC01</td><td>Computer</td><td>Windows Server 2025 · 10.0.0.10 · AD DS, DNS, DHCP · globaler Katalog</td></tr>` : '';
    const liste = `<div class="dom-tw"><table class="dom-tab"><thead><tr><th>Name</th><th>Typ</th><th>Beschreibung</th></tr></thead><tbody>${dc}
      ${gs.map(g => `<tr class="dom-zeile ${objSel === 'g:' + kl(g.n) ? 'dom-akt' : ''}" data-a="obj" data-v="g:${E(kl(g.n))}"><td>👥 ${E(g.n)}</td><td>Gruppe – ${SCOPE_DE[g.scope]}</td><td>${E(g.desc || g.m.length + ' Mitglieder')}</td></tr>`).join('')}
      ${us.map(u => `<tr class="dom-zeile ${objSel === 'u:' + kl(u.sam) ? 'dom-akt' : ''} ${u.an ? '' : 'dom-aus'}" data-a="obj" data-v="u:${E(kl(u.sam))}"><td>${u.an ? '👤' : '🚫'} ${E(uName(u))}</td><td>Benutzer</td><td>${E(u.sam)} · ${E(u.titel)}</td></tr>`).join('')}
      ${!us.length && !gs.length && !dc ? '<tr><td colspan="3" class="dom-leise">Keine Objekte in diesem Container.</td></tr>' : ''}</tbody></table></div>`;
    return `<div class="dom-raster"><div class="dom-karte"><h3>Struktur</h3>${baum()}
      <div class="dom-form"><input id="dom-ouname" class="dom-ein" placeholder="Neue OU unter ${E(ouName(ouSel))}"><button class="glas knopf klein" data-a="ou-neu">Neue OU</button></div></div>
      <div class="dom-karte"><div class="dom-kopf"><h3>${s ? 'Suchergebnis' : E(ouSel === '' ? DOM : ouSel)}</h3><input id="dom-suche" class="dom-ein" placeholder="🔎 Benutzer/Gruppe suchen …" value="${E(suche)}"></div>
      ${liste}${detail()}
      <details class="dom-det"><summary>➕ Neuer Benutzer in ${E(ouName(ouSel))}</summary><div class="dom-form">
        <input id="dom-nvn" class="dom-ein" placeholder="Vorname"><input id="dom-nnn" class="dom-ein" placeholder="Nachname"><input id="dom-nsam" class="dom-ein" placeholder="Anmeldename (vorname.nachname)">
        <input id="dom-nabt" class="dom-ein" placeholder="Abteilung"><input id="dom-ntit" class="dom-ein" placeholder="Titel"><label class="dom-cb"><input type="checkbox" id="dom-nan" checked> Konto aktiviert</label>
        <button class="glas knopf klein" data-a="user-neu">Benutzer anlegen</button></div></details>
      <details class="dom-det"><summary>➕ Neue Gruppe in ${E(ouName(ouSel))}</summary><div class="dom-form"><input id="dom-ngn" class="dom-ein" placeholder="z. B. GG_MKT oder DL_Projekte_RW"><select id="dom-ngs" class="dom-ein">${opts(SCOPES.map(x => [x, SCOPE_DE[x]]), 'Global')}</select><button class="glas knopf klein" data-a="gruppe-neu">Gruppe anlegen</button></div></details>
      </div></div>`;
  }
  function detail() {
    if (!objSel) return '';
    const [art, id] = [objSel[0], objSel.slice(2)];
    if (art === 'u') {
      const u = Z.users[id]; if (!u) return '';
      const gs = direkteGruppen(u.sam);
      return `<div class="dom-detail" id="dom-detail"><h3>${u.an ? '👤' : '🚫'} ${E(uName(u))} <small>${E(u.sam)}@${DOM}</small></h3>
        <p class="klein"><code>${E(userDn(u))}</code></p>
        <div class="dom-form"><label>Abteilung<input id="dom-eabt" class="dom-ein" value="${E(u.abt)}"></label><label>Titel<input id="dom-etit" class="dom-ein" value="${E(u.titel)}"></label><label>Manager<input id="dom-emgr" class="dom-ein" list="dom-dl-u" value="${E(u.mgr)}"></label><button class="glas knopf klein" data-a="user-set">Übernehmen</button></div>
        <div class="dom-form"><button class="glas knopf klein" data-a="user-an">${u.an ? 'Konto deaktivieren' : 'Konto aktivieren'}</button><label>Verschieben nach<select id="dom-ziel" class="dom-ein">${ouOpts(u.ou)}</select></label><button class="glas knopf klein" data-a="user-mv">Verschieben</button><button class="glas knopf klein dom-rotk" data-a="user-del">Löschen</button></div>
        <p><b>Mitglied von:</b> Domänen-Benutzer (primär) ${gs.map(g => `<span class="dom-chip">${E(g)} <button data-a="mg-weg" data-g="${E(g)}" data-m="${E(u.sam)}" title="entfernen">✕</button></span>`).join('')}</p>
        <div class="dom-form"><input id="dom-gadd" class="dom-ein" list="dom-dl-g" placeholder="Gruppe hinzufügen …"><button class="glas knopf klein" data-a="mg-user">Hinzufügen</button></div></div>`;
    }
    const g = Z.groups[id]; if (!g) return '';
    return `<div class="dom-detail" id="dom-detail"><h3>👥 ${E(g.n)} <small>${SCOPE_DE[g.scope]} · Sicherheit</small></h3><p class="klein"><code>CN=${E(g.n)},${E(ouDn(g.ou))}</code> · Mitglied von: ${E(direkteGruppen(g.n).join(', ') || '–')}</p>
      <p><b>Mitglieder (${g.m.length}):</b> ${g.m.map(m => `<span class="dom-chip">${gruppe(m) ? '👥' : '👤'} ${E(m)} <button data-a="mg-weg" data-g="${E(g.n)}" data-m="${E(m)}" title="entfernen">✕</button></span>`).join('') || '<span class="dom-leise">keine</span>'}</p>
      <div class="dom-form"><input id="dom-madd" class="dom-ein" list="dom-dl-a" placeholder="Benutzer oder Gruppe …"><button class="glas knopf klein" data-a="mg-gruppe">Mitglied hinzufügen</button></div></div>`;
  }
  function panelGpo() {
    const g = Z.gpos[gpoSel] || Object.values(Z.gpos)[0]; gpoSel = kl(g.n);
    const ru = rsopUser && user(rsopUser), rs = ru ? rsop(ru.ou) : null;
    return `<div class="dom-raster"><div class="dom-karte"><h3>Gruppenrichtlinienobjekte</h3>
      ${Object.values(Z.gpos).map(x => `<button class="dom-knoten ${x === g ? 'dom-akt' : ''}" data-a="gpo" data-v="${E(kl(x.n))}">📜 ${E(x.n)} <small>${x.links.length ? '→ ' + x.links.map(ouName).map(E).join(', ') : '(nicht verknüpft)'}</small></button>`).join('')}
      <div class="dom-form"><input id="dom-gponame" class="dom-ein" placeholder="Name der neuen GPO"><button class="glas knopf klein" data-a="gpo-neu">Neue GPO</button></div>
      <h3>Wer bekommt was? (Richtlinienergebnis)</h3><div class="dom-form"><input id="dom-rsop" class="dom-ein" list="dom-dl-u" placeholder="Benutzer, z. B. ${E(stamm().vt)}" value="${E(rsopUser)}"><button class="glas knopf klein" data-a="rsop">Berechnen</button></div>
      ${ru ? `<p class="klein">OU: ${E(ru.ou)} · Reihenfolge (LSDOU): ${gposFuer(ru.ou).map(x => E(x.g.n) + ' @ ' + E(ouName(x.o))).join(' → ') || 'keine'}</p><ul class="klein">${Object.entries(rs.s).map(([k, v]) => `<li>${E((GPO_FELDER.find(f => f[0] === k) || [k, k])[1])}: <b>${E(String(v))}</b> <small>(aus ${E(rs.q[k])})</small></li>`).join('') || '<li>keine Einstellungen</li>'}</ul>` : ''}
      </div><div class="dom-karte"><h3>📜 ${E(g.n)}</h3>
      <p class="klein">Verknüpfungen: ${g.links.map(l => `<span class="dom-chip">${E(l === '' ? DOM : l)} <button data-a="gpo-unlink" data-v="${E(l)}" title="Verknüpfung entfernen">✕</button></span>`).join('') || '<b>keine – die GPO wirkt nirgends!</b>'}</p>
      <div class="dom-form"><select id="dom-gpoziel" class="dom-ein">${ouOpts(WURZEL, true)}</select><button class="glas knopf klein" data-a="gpo-link">Verknüpfen</button></div>
      <h3>Einstellungen</h3><div class="dom-form dom-gpof">${GPO_FELDER.map(([k, t, typ]) => `<label>${E(t)}${typ === 'bool' ? `<select class="dom-ein" data-gs="${k}">${opts([['', 'nicht konfiguriert'], ['true', 'Aktiviert'], ['false', 'Deaktiviert']], g.s[k] === undefined ? '' : String(g.s[k]))}</select>` : `<input class="dom-ein" data-gs="${k}" ${typ === 'zahl' ? 'type="number" min="0" max="999"' : ''} value="${E(g.s[k] === undefined ? '' : String(g.s[k]))}" placeholder="nicht konfiguriert">`}</label>`).join('')}
      <button class="glas knopf klein" data-a="gpo-save">Einstellungen speichern</button></div></div></div>`;
  }
  function panelDns() {
    const zonen = [DOM, '0.0.10.in-addr.arpa'];
    return `<div class="dom-karte"><h3>DNS-Manager · DC01 (AD-integrierte Zonen)</h3>
      ${zonen.map(z => `<h4>${z === DOM ? 'Forward-Lookupzone' : 'Reverse-Lookupzone'} ${z}</h4><div class="dom-tw"><table class="dom-tab"><thead><tr><th>Name</th><th>Typ</th><th>Daten</th><th></th></tr></thead><tbody>
        <tr><td>(identisch mit übergeordnetem Ordner)</td><td>SOA</td><td>[1], dc01.${DOM}., hostmaster.${DOM}.</td><td></td></tr><tr><td>(identisch mit übergeordnetem Ordner)</td><td>NS</td><td>dc01.${DOM}.</td><td></td></tr>
        ${Z.dns.map((r, i) => [r, i]).filter(([r]) => r.z === z).map(([r, i]) => `<tr><td>${E(r.n)}</td><td>${r.t}</td><td>${E(r.w)}</td><td>${r.t !== 'SRV' ? `<button class="dom-x" data-a="dns-weg" data-v="${i}" title="löschen">✕</button>` : ''}</td></tr>`).join('')}</tbody></table></div>`).join('')}
      <div class="dom-form"><input id="dom-dn" class="dom-ein" placeholder="Hostname, z. B. drucker-og2"><input id="dom-dip" class="dom-ein" placeholder="IPv4, z. B. 10.0.0.60"><label class="dom-cb"><input type="checkbox" id="dom-dptr" checked> PTR-Eintrag erstellen</label><button class="glas knopf klein" data-a="dns-a">Neuer A-Eintrag</button></div>
      <div class="dom-form"><input id="dom-cn" class="dom-ein" placeholder="Alias, z. B. wiki"><input id="dom-cz" class="dom-ein" placeholder="Ziel, z. B. web01.netzilon.example"><button class="glas knopf klein" data-a="dns-c">Neuer Alias (CNAME)</button></div>
      <p class="klein dom-leise">A: Name → IPv4 · AAAA: Name → IPv6 · CNAME: Alias → Name · PTR: IP → Name · SRV: Dienst finden (Clients finden den DC über _ldap._tcp/_kerberos._tcp) · NS/SOA: Zuständigkeit.</p></div>`;
  }
  function panelDhcp() {
    const d = Z.dhcp;
    return `<div class="dom-karte"><h3>DHCP · DC01 · Bereich [10.0.0.0] Netzilon LAN</h3>
      <p class="klein">Adresspool ${d.von} – ${d.bis} · Maske 255.255.255.0 · Lease ${d.dauer} Tage · Optionen: 003 Router ${d.gw}, 006 DNS ${d.dnsSrv}, 015 DNS-Domäne ${DOM}</p>
      <div class="dom-dora">${['Discover', 'Offer', 'Request', 'Acknowledge'].map((x, i) => `<span class="dom-dora-s" style="animation-delay:${i * .5}s"><b>${x[0]}</b>${x.slice(1)}<small>${['Client → Broadcast: „Gibt es einen DHCP-Server?“', 'Server → Angebot: 10.0.0.1xx', 'Client → „Ich nehme dieses Angebot“', 'Server → Bestätigung + Lease'][i]}</small></span>`).join('<i>→</i>')}</div>
      <h4>Reservierungen (${d.res.length})</h4><div class="dom-tw"><table class="dom-tab"><thead><tr><th>IP</th><th>MAC (ClientId)</th><th>Name</th><th></th></tr></thead><tbody>${d.res.map((r, i) => `<tr><td>${r.ip}</td><td>${r.mac}</td><td>${E(r.name)}</td><td><button class="dom-x" data-a="res-weg" data-v="${i}">✕</button></td></tr>`).join('')}</tbody></table></div>
      <div class="dom-form"><input id="dom-rip" class="dom-ein" placeholder="IP, z. B. 10.0.0.60"><input id="dom-rmac" class="dom-ein" placeholder="MAC 00-15-5D-0A-00-60"><input id="dom-rname" class="dom-ein" placeholder="Name"><button class="glas knopf klein" data-a="res-neu">Neue Reservierung</button></div>
      <h4>Adressleases (${d.leases.length})</h4><div class="dom-tw"><table class="dom-tab"><thead><tr><th>IP</th><th>MAC</th><th>Hostname</th><th>Ablauf</th></tr></thead><tbody>${d.leases.map((l, i) => `<tr><td>${l.ip}</td><td>${l.mac}</td><td>${E(l.name)}</td><td>in ${1 + (i * 7) % 8} Tagen</td></tr>`).join('')}</tbody></table></div></div>`;
  }
  function aceTab(sh, art) {
    return `<div class="dom-tw"><table class="dom-tab"><thead><tr><th>Prinzipal</th><th>Typ</th><th>Recht</th><th></th></tr></thead><tbody>${sh[art].map(a => `<tr><td>${E(a.p)}</td><td>${a.d ? '<b class="dom-rot">Verweigern</b>' : 'Zulassen'}</td><td>${LV[a.r]}</td><td><button class="dom-x" data-a="ace-weg" data-art="${art}" data-v="${E(a.p)}">✕</button></td></tr>`).join('') || '<tr><td colspan="4" class="dom-leise">keine Einträge</td></tr>'}</tbody></table></div>
      <div class="dom-form"><input id="dom-ap-${art}" class="dom-ein" list="dom-dl-a" placeholder="Benutzer/Gruppe/Jeder"><select id="dom-ar-${art}" class="dom-ein">${lvOpts(2)}</select><select id="dom-ad-${art}" class="dom-ein">${opts([['0', 'Zulassen'], ['1', 'Verweigern']], '0')}</select><button class="glas knopf klein" data-a="ace-neu" data-art="${art}">Eintrag hinzufügen</button></div>`;
  }
  function panelShare() {
    const sh = Z.shares.find(s => s.n === shareSel) || Z.shares[0]; if (sh) shareSel = sh.n;
    const e = effUser && eff(effUser, effShare);
    return `<div class="dom-raster"><div class="dom-karte"><h3>Freigaben auf FS01</h3>
      ${Z.shares.map(s => `<button class="dom-knoten ${s === sh ? 'dom-akt' : ''}" data-a="share" data-v="${E(s.n)}">📂 \\\\FS01\\${E(s.n)} <small>${E(s.pfad)}</small></button>`).join('')}
      <div class="dom-form"><input id="dom-shn" class="dom-ein" placeholder="Name, z. B. Projekte"><button class="glas knopf klein" data-a="share-neu">Neue Freigabe</button></div>
      <h3>Effektive Rechte berechnen</h3><div class="dom-form"><input id="dom-eu" class="dom-ein" list="dom-dl-u" placeholder="Benutzer, z. B. ${E(stamm().vt)}" value="${E(effUser)}"><select id="dom-es" class="dom-ein">${opts(Z.shares.map(s => [s.n, s.n]), effShare)}</select><button class="glas knopf klein" data-a="eff">Berechnen</button></div>
      <div id="dom-eff">${effUser ? (e ? `<div class="dom-erg dom-lv${e.r}"><b>${E(effUser)} auf \\\\FS01\\${E(effShare)}: ${e.text}</b></div><ol class="klein">${e.schritte.map(x => `<li>${E(x)}</li>`).join('')}</ol>` : '<p class="dom-rot">Benutzer oder Freigabe nicht gefunden.</p>') : '<p class="klein dom-leise">Regeln: Rechte aus allen Gruppen addieren sich (kumulativ) · Verweigern gewinnt · über das Netzwerk gilt das Restriktivere aus Freigabe- und NTFS-Recht.</p>'}</div></div>
      ${sh ? `<div class="dom-karte"><h3>📂 ${E(sh.n)} <small>${E(sh.pfad)}</small></h3><h4>Freigabeberechtigungen (SMB)</h4>${aceTab(sh, 'share')}<h4>Sicherheit (NTFS)</h4>${aceTab(sh, 'ntfs')}</div>` : ''}</div>`;
  }
  function panelTrust() {
    return `<div class="dom-karte"><h3>Vertrauensstellungen von ${DOM}</h3><div class="dom-tw"><table class="dom-tab"><thead><tr><th>Domäne</th><th>Typ</th><th>Richtung</th><th>Transitiv</th></tr></thead><tbody>${Z.trusts.map(t => `<tr><td>${E(t.ziel)}</td><td>${E(t.typ)}</td><td>${E(t.richtung)}</td><td>${t.transitiv ? 'Ja' : 'Nein'}</td></tr>`).join('')}</tbody></table></div>
      <svg viewBox="0 0 360 110" class="dom-svg" role="img" aria-label="Vertrauensstellung"><rect x="10" y="30" width="130" height="50" rx="10" class="dom-sv-k"/><text x="75" y="60" text-anchor="middle">netzilon.example</text><rect x="220" y="30" width="130" height="50" rx="10" class="dom-sv-k"/><text x="285" y="60" text-anchor="middle">partner.example</text><path d="M145 48 H215 M215 62 H145" class="dom-sv-p"/><text x="180" y="22" text-anchor="middle" class="dom-sv-t">vertraut ⇄ vertraut</text></svg>
      <ul class="klein"><li><b>Vertrauen ≠ Zugriff:</b> Die Vertrauensstellung erlaubt nur, dass Konten der anderen Domäne <i>authentifiziert</i> werden. Zugriff gibt es erst, wenn man ihnen Rechte gibt (z. B. GG der Partnerdomäne in eine DL-Gruppe – genau dafür sind domänenlokale Gruppen da).</li>
      <li><b>Richtung:</b> Die <i>vertrauende</i> Domäne (Ressourcen) vertraut der <i>vertrauenswürdigen</i> Domäne (Konten). Der Zugriff fließt entgegen der Vertrauensrichtung. Bidirektional = beide Richtungen.</li>
      <li><b>Transitiv:</b> Innerhalb einer Gesamtstruktur vertrauen sich alle Domänen automatisch (transitiv, bidirektional). Eine Gesamtstruktur-Vertrauensstellung erweitert das auf alle Domänen des Partner-Forests; externe Vertrauensstellungen sind nicht transitiv.</li>
      <li><b>Voraussetzung:</b> Namensauflösung in beide Richtungen (bedingte DNS-Weiterleitung auf partner.example), Zeit synchron (Kerberos, max. 5 Minuten Abweichung), Ports frei.</li>
      <li><b>Sicherheit:</b> SID-Filterung ist aktiv; mit „selektiver Authentifizierung“ dürfen sich Partnerkonten nur an ausgewählten Servern anmelden.</li></ul></div>`;
  }
  function panelPs() {
    return `<div class="dom-karte dom-ps"><div class="dom-psaus" id="dom-psaus">${['Windows PowerShell · DC01.netzilon.example (simuliert)', 'Tippe Get-Help für alle Befehle. Tab vervollständigt, ↑/↓ blättert im Verlauf.', ''].map(x => `<div class="dom-ps-i">${E(x)}</div>`).join('')}${ausgabe.map(a => `<div class="${a.k}">${E(a.t)}</div>`).join('')}</div>
      <div class="dom-pszeile"><span>PS C:\\&gt;</span><input id="dom-psin" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="PowerShell-Eingabe"></div></div>`;
  }
  function aufgabenHtml() {
    const g = P().geloest, n = AUFGABEN.filter(a => g[a.id]).length;
    return `<div class="dom-karte" id="dom-aufgaben"><h2>Praxis-Aufgaben <small>${n}/${AUFGABEN.length} gelöst</small></h2><div class="balken"><i style="width:${Math.round(n / AUFGABEN.length * 100)}%"></i></div>
      <ol class="dom-aufg">${AUFGABEN.map(a => `<li class="${g[a.id] ? 'dom-ok' : ''}"><b>${g[a.id] ? '✓' : '○'} ${E(a.t)}</b> <span class="dom-st dom-st-${a.st}">${a.st}</span><p>${E(a.txt())}</p>
        <details><summary class="klein">Hinweise</summary><ul class="klein">${a.tipps.map(t => `<li>${E(t)}</li>`).join('')}</ul></details>
        <details><summary class="klein">Musterlösung</summary><p class="klein"><b>GUI:</b> ${E(a.gui)}</p><p class="klein"><b>PowerShell:</b></p><pre class="dom-code">${E(a.ps().join('\n'))}</pre></details></li>`).join('')}</ol>
      <div class="dom-form"><button class="glas knopf klein" data-a="pruefen">Jetzt prüfen</button><button class="glas knopf klein dom-rotk" data-a="reset">Domäne zurücksetzen</button></div></div>`;
  }
  function legende() {
    const L = [
      ['Domäne', 'Verwaltungs- und Sicherheitsgrenze mit gemeinsamer Benutzerdatenbank (AD DS), hier netzilon.example (NetBIOS NETZILON).', 'Anmeldung einmal, Zugriff überall (SSO via Kerberos); zentrale Verwaltung statt lokaler Konten auf jedem PC.', 'Ab wenigen PCs/Benutzern in jedem Unternehmen.'],
      ['Domänencontroller (DC)', 'Server mit AD DS, speichert und repliziert die Verzeichnisdatenbank (NTDS.dit), authentifiziert per Kerberos. Hier DC01, Windows Server 2025, 10.0.0.10, zugleich DNS und DHCP.', 'Ohne DC keine Anmeldung → mindestens 2 DCs für Ausfallsicherheit; FSMO-Rollen beachten.', 'Rolle „AD DS“ installieren, Server zum DC heraufstufen (Install-ADDSForest).'],
      ['OU (Organisationseinheit)', 'Container zur Strukturierung (Standort/Abteilung). Ziel für GPO-Verknüpfungen und delegierte Verwaltung.', 'GPOs wirken pro OU; Rechte zum Verwalten lassen sich je OU delegieren. Keine Berechtigungen auf Dateien!', 'Struktur nach Standort → Abteilung, eigene OUs für Gruppen, Server, Ausgeschiedene.'],
      ['AGDLP', 'Accounts → Global Groups → Domain Local Groups → Permissions. Benutzer in GG_Abteilung, GG in DL_Ressource_Recht, Recht nur an DL.', 'Übersichtlich, skalierbar, auch über Vertrauensstellungen nutzbar; Abteilungswechsel = nur Gruppenmitgliedschaft ändern.', 'Bei jeder neuen Freigabe/Ressource. Nie Rechte direkt an Benutzer!'],
      ['GPO & Vererbung (LSDOU)', 'Gruppenrichtlinienobjekte enthalten Einstellungen (Kennwort, Laufwerke, USB …). Verarbeitung: Lokal → Standort (Site) → Domäne → OU (von oben nach unten). Bei Konflikt gewinnt die zuletzt angewandte (die näher an der OU).', 'Einheitliche, erzwungene Konfiguration. „Erzwungen“ und „Vererbung deaktivieren“ ändern die Reihenfolge. Kennwortrichtlinie wirkt nur aus der Domänenebene.', 'gpupdate /force, gpresult /r zum Prüfen; GPMC zum Verknüpfen.'],
      ['DNS', 'Namensauflösung: A (Name→IPv4), AAAA, CNAME (Alias), PTR (Reverse), SRV (Dienste – Clients finden den DC über _ldap._tcp).', 'AD funktioniert nicht ohne DNS! Clients müssen den DC als DNS-Server eingetragen haben.', 'AD-integrierte Zonen auf dem DC; Forward- und Reverse-Zone; Weiterleitungen für Internetnamen.'],
      ['DHCP (DORA)', 'Discover (Broadcast) → Offer → Request → Acknowledge. Bereich 10.0.0.0/24, Pool, Optionen (003 Router, 006 DNS), Leases, Reservierungen (MAC → feste IP).', 'Automatische, konfliktfreie IP-Vergabe; Reservierung für Drucker/Server mit fester Adresse über DHCP.', 'DHCP-Server im AD autorisieren; über Router hinweg DHCP-Relay (ip helper-address).'],
      ['Freigabe vs. NTFS', 'Freigaberechte (Lesen/Ändern/Vollzugriff) gelten nur übers Netzwerk, NTFS-Rechte immer (auch lokal). Effektiv: das Restriktivere aus beiden. Innerhalb jeder Ebene: Gruppenrechte kumulativ, explizites Verweigern gewinnt.', 'Best Practice: Freigabe großzügig (Authentifizierte Benutzer: Ändern), fein steuern über NTFS mit DL-Gruppen.', 'Bei jeder Dateifreigabe; prüfen mit „Effektiver Zugriff“ bzw. hier mit dem Rechner.'],
      ['Vertrauensstellung', 'Beziehung zwischen Domänen/Gesamtstrukturen: Konten der vertrauenswürdigen Domäne dürfen sich an Ressourcen der vertrauenden Domäne authentifizieren. Richtung, Transitivität, Typ (Gesamtstruktur, extern, Verknüpfung).', 'Zusammenarbeit mit Partner oder nach Firmenübernahme ohne doppelte Konten.', 'Bedingte DNS-Weiterleitung einrichten, dann „Domänen und Vertrauensstellungen“ / New-ADTrust; Zugriff über DL-Gruppen.']
    ];
    return `<details class="dom-karte dom-leg" id="dom-legende"><summary><b>📖 Legende: Was · Warum · Wie/Wann/Wo</b></summary><div class="dom-tw"><table class="dom-tab"><thead><tr><th>Begriff</th><th>Was?</th><th>Warum?</th><th>Wie / wann / wo?</th></tr></thead><tbody>${L.map(r => `<tr><td><b>${E(r[0])}</b></td><td>${E(r[1])}</td><td>${E(r[2])}</td><td>${E(r[3])}</td></tr>`).join('')}</tbody></table></div></details>`;
  }
  function zeichne() {
    const w = document.getElementById('dom-wurzel'); if (!w || !Z) return;
    const p = { aduc: panelAduc, gpo: panelGpo, dns: panelDns, dhcp: panelDhcp, share: panelShare, trust: panelTrust, ps: panelPs }[tab] || panelAduc;
    const offen = [...w.querySelectorAll('details[id]')].filter(d => d.open).map(d => d.id);
    w.innerHTML = `<div class="schalter dom-tabs" role="tablist">${TABS.map(([k, t]) => `<button role="tab" class="${k === tab ? 'aktiv' : ''}" data-a="tab" data-v="${k}" aria-selected="${k === tab}">${t}</button>`).join('')}</div>
      <div id="dom-panel">${p()}</div>${aufgabenHtml()}${legende()}
      <datalist id="dom-dl-u">${Object.values(Z.users).map(u => `<option value="${E(u.sam)}">`).join('')}</datalist><datalist id="dom-dl-g">${Object.values(Z.groups).map(g => `<option value="${E(g.n)}">`).join('')}</datalist><datalist id="dom-dl-a">${[...SPEZIAL, ...allNamen()].map(n => `<option value="${E(n)}">`).join('')}</datalist>`;
    for (const id of offen) { const d = document.getElementById(id); if (d) d.open = true; }
    if (tab === 'ps') { const a = document.getElementById('dom-psaus'); a.scrollTop = a.scrollHeight; }
  }

  // ---------- Bedienung ----------
  const wert = id => { const e = document.getElementById(id); return e ? e.value.trim() : ''; };
  function versuch(f, msg) { try { const r = f(); aenderung(typeof msg === 'function' ? msg(r) : msg); } catch (e) { toast(e.message, 'rot'); } }
  function klick(ev) {
    const b = ev.target.closest('[data-a]'); if (!b || !document.getElementById('dom-wurzel').contains(b)) return;
    const a = b.dataset.a, v = b.dataset.v;
    if (a === 'tab') { tab = v; zeichne(); if (tab === 'ps') { const i = document.getElementById('dom-psin'); if (i) i.focus(); } return; }
    if (a === 'ou') { ouSel = v; objSel = null; suche = ''; return zeichne(); }
    if (a === 'obj') { objSel = objSel === v ? null : v; zeichne(); const d = document.getElementById('dom-detail'); if (d && d.scrollIntoView) d.scrollIntoView({ block: 'nearest' }); return; }
    const u = objSel && objSel[0] === 'u' ? Z.users[objSel.slice(2)] : null, g = objSel && objSel[0] === 'g' ? Z.groups[objSel.slice(2)] : null;
    switch (a) {
      case 'ou-neu': return versuch(() => OP.neuOu(wert('dom-ouname'), ouSel === 'Users' || ouSel === 'Domain Controllers' ? '' : ouSel), o => `OU ${o} angelegt`);
      case 'user-neu': return versuch(() => { const ou = ouSel === '' || ouSel === 'Domain Controllers' ? 'Users' : ouSel; const r = OP.neuUser({ vn: wert('dom-nvn'), nn: wert('dom-nnn'), sam: wert('dom-nsam') || (wert('dom-nvn') + '.' + wert('dom-nnn')).toLowerCase(), abt: wert('dom-nabt'), titel: wert('dom-ntit'), ou: ou === 'Users' ? 'CN=Users,' + DCDN : ou, an: document.getElementById('dom-nan').checked }); objSel = 'u:' + kl(r.sam); return r; }, r => `Benutzer ${r.sam} angelegt${r.an ? '' : ' (deaktiviert)'}`);
      case 'gruppe-neu': return versuch(() => { const ou = ouSel === '' || ouSel === 'Domain Controllers' ? WURZEL + '/Gruppen' : ouSel; const r = OP.neuGruppe(wert('dom-ngn'), document.getElementById('dom-ngs').value, ou === 'Users' ? 'CN=Users,' + DCDN : ou); objSel = 'g:' + kl(r.n); return r; }, r => `Gruppe ${r.n} (${SCOPE_DE[r.scope]}) angelegt`);
      case 'user-set': return u && versuch(() => OP.setUser(u.sam, { abt: wert('dom-eabt'), titel: wert('dom-etit'), mgr: wert('dom-emgr') }), `${u.sam} geändert`);
      case 'user-an': return u && versuch(() => OP.aktiv(u.sam, !u.an), r => `${r.sam} ${r.an ? 'aktiviert' : 'deaktiviert'}`);
      case 'user-mv': return u && versuch(() => { const r = OP.verschiebe(u.sam, document.getElementById('dom-ziel').value); ouSel = r.ou; return r; }, r => `${r.sam} → ${r.ou}`);
      case 'user-del': if (u && confirm(`Benutzer ${u.sam} wirklich löschen? (In der Praxis besser deaktivieren!)`)) { objSel = null; versuch(() => OP.loescheUser(u.sam), `${u.sam} gelöscht`); } return;
      case 'mg-weg': return versuch(() => OP.gruppeWeg(b.dataset.g, b.dataset.m), `${b.dataset.m} aus ${b.dataset.g} entfernt`);
      case 'mg-user': return u && versuch(() => OP.gruppeDazu(wert('dom-gadd'), u.sam), r => `${u.sam} → ${r.n}`);
      case 'mg-gruppe': return g && versuch(() => OP.gruppeDazu(g.n, wert('dom-madd')), `${wert('dom-madd')} → ${g.n}`);
      case 'gpo': gpoSel = v; return zeichne();
      case 'gpo-neu': return versuch(() => { const r = OP.neuGpo(wert('dom-gponame')); gpoSel = kl(r.n); return r; }, r => `GPO ${r.n} angelegt – noch verknüpfen!`);
      case 'gpo-link': return versuch(() => OP.gpLink(Z.gpos[gpoSel].n, document.getElementById('dom-gpoziel').value === '' ? DCDN : document.getElementById('dom-gpoziel').value), r => `${r.g.n} verknüpft mit ${ouName(r.ou)}`);
      case 'gpo-unlink': return versuch(() => OP.gpUnlink(Z.gpos[gpoSel].n, v), 'Verknüpfung entfernt');
      case 'gpo-save': return versuch(() => {
        const s = Z.gpos[gpoSel].s;
        for (const el of document.querySelectorAll('[data-gs]')) {
          const k = el.dataset.gs, typ = GPO_FELDER.find(f => f[0] === k)[2], x = el.value.trim();
          if (x === '') delete s[k]; else if (typ === 'bool') s[k] = x === 'true'; else if (typ === 'zahl') { const n = parseInt(x, 10); if (!(n >= 0 && n <= 999)) throw new Error('Bitte eine Zahl 0–999 eingeben.'); s[k] = n; } else s[k] = x.slice(0, 120);
        }
      }, 'Einstellungen gespeichert');
      case 'rsop': rsopUser = wert('dom-rsop'); if (!user(rsopUser)) toast('Benutzer nicht gefunden.', 'rot'); return zeichne();
      case 'dns-a': return versuch(() => OP.dnsA(wert('dom-dn'), DOM, wert('dom-dip'), document.getElementById('dom-dptr').checked), p => `A-Eintrag angelegt${p}`);
      case 'dns-c': return versuch(() => OP.dnsCname(wert('dom-cn'), wert('dom-cz')), 'CNAME angelegt');
      case 'dns-weg': return versuch(() => OP.dnsWeg(+v), 'Eintrag gelöscht');
      case 'res-neu': return versuch(() => OP.reserv(wert('dom-rip'), wert('dom-rmac'), wert('dom-rname')), 'Reservierung angelegt');
      case 'res-weg': return versuch(() => Z.dhcp.res.splice(+v, 1), 'Reservierung gelöscht');
      case 'share': shareSel = v; effShare = v; return zeichne();
      case 'share-neu': return versuch(() => { const r = OP.neuShare(wert('dom-shn')); r.share.push({ p: 'Authentifizierte Benutzer', r: 2, d: false }); shareSel = r.n; return r; }, r => `Freigabe \\\\FS01\\${r.n} angelegt`);
      case 'ace-neu': return versuch(() => OP.ace(shareSel, b.dataset.art, wert('dom-ap-' + b.dataset.art), +document.getElementById('dom-ar-' + b.dataset.art).value, document.getElementById('dom-ad-' + b.dataset.art).value === '1'), 'Berechtigung gesetzt');
      case 'ace-weg': return versuch(() => OP.aceWeg(shareSel, b.dataset.art, v), 'Eintrag entfernt');
      case 'eff': effUser = wert('dom-eu'); effShare = document.getElementById('dom-es').value; return zeichne();
      case 'pruefen': { const n = pruefe(); if (!n) toast('Noch keine neue Aufgabe erfüllt – Hinweise lesen!'); zeichne(); return; }
      case 'reset': if (confirm('Domäne auf den Startzustand zurücksetzen? (Gelöste Aufgaben bleiben gelöst.)')) { Z = start(); objSel = null; ausgabe = []; aenderung('Domäne zurückgesetzt'); } return;
    }
  }
  function konsole(zeile) {
    const pd = P();
    ausgabe.push({ k: 'dom-ps-c', t: 'PS C:\\> ' + zeile });
    if (zeile.trim()) { pd.verlauf = pd.verlauf.filter(x => x !== zeile).concat(zeile).slice(-50); }
    const r = ausfuehren(zeile);
    if (r.text) ausgabe.push({ k: r.ok ? 'dom-ps-o' : 'dom-ps-e', t: r.text });
    if (/^\s*(cls|clear|clear-host)\s*$/i.test(zeile)) ausgabe = [];
    ausgabe = ausgabe.slice(-300); vIdx = -1;
    speichern();
    return r;
  }
  function taste(ev) {
    if (ev.target.id === 'dom-suche' && ev.key === 'Enter') { suche = ev.target.value; objSel = null; zeichne(); const s = document.getElementById('dom-suche'); if (s) { s.focus(); s.setSelectionRange(s.value.length, s.value.length); } return; }
    if (ev.target.id !== 'dom-psin') return;
    const i = ev.target, vl = P().verlauf;
    if (ev.key === 'Enter') { ev.preventDefault(); konsole(i.value); zeichne(); const n = document.getElementById('dom-psin'); if (n) n.focus(); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); if (!vl.length) return; vIdx = vIdx < 0 ? vl.length - 1 : Math.max(0, vIdx - 1); i.value = vl[vIdx]; }
    else if (ev.key === 'ArrowDown') { ev.preventDefault(); if (vIdx < 0) return; vIdx++; if (vIdx >= vl.length) { vIdx = -1; i.value = ''; } else i.value = vl[vIdx]; }
    else if (ev.key === 'Tab') {
      ev.preventDefault();
      const m = /(\S*)$/.exec(i.value), w = m[1]; if (!w) return;
      const pool = /^-/.test(w) ? ['-Identity', '-Filter', '-Properties', '-Name', '-SamAccountName', '-GivenName', '-Surname', '-Path', '-TargetPath', '-Department', '-Title', '-Enabled', '-Members', '-GroupScope', '-Target', '-ZoneName', '-IPv4Address', '-CreatePtr', '-ScopeId', '-IPAddress', '-ClientId', '-AccountName', '-AccessRight', '-ChangeAccess', '-FullAccess', '-ReadAccess', '-Confirm:$false', '-All', '-Recursive']
        : i.value.trim() === w ? Object.values(CMDNAME) : allNamen();
      const t = pool.filter(x => kl(x).startsWith(kl(w)));
      if (t.length === 1) i.value = i.value.slice(0, i.value.length - w.length) + t[0] + ' ';
      else if (t.length > 1) { ausgabe.push({ k: 'dom-ps-i', t: t.slice(0, 30).join('   ') }); const val = i.value; zeichne(); const n = document.getElementById('dom-psin'); n.value = val; n.focus(); }
    }
  }

  function stil() {
    if (document.getElementById('dom-style')) return;
    const st = document.createElement('style'); st.id = 'dom-style';
    st.textContent = `
#dom-wurzel{min-width:0;max-width:100%}
.dom-tabs{flex-wrap:wrap;max-width:100%;border-radius:16px;margin:0 0 12px}
.dom-tabs button{padding:6px 12px}
.dom-raster{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.6fr);gap:14px;margin:0 0 14px}
.dom-raster>*{min-width:0}
.dom-karte{background:var(--glas);border:1px solid var(--glas-rand);border-radius:var(--radius-klein);padding:12px 14px;margin:0 0 14px;min-width:0;overflow-wrap:anywhere}
.dom-raster>.dom-karte{margin:0}
.dom-karte h3{margin:4px 0 8px}.dom-karte h4{margin:12px 0 6px}
.dom-kopf{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between}
.dom-baum{max-height:420px;overflow:auto;margin:0 0 8px}
.dom-knoten{display:block;width:100%;text-align:left;background:none;border:0;border-radius:6px;color:var(--tinte);padding:4px 6px;cursor:pointer;font:inherit;overflow-wrap:anywhere}
.dom-knoten:hover{background:var(--glas-hover)}.dom-knoten small{color:var(--tinte-leise)}
.dom-akt{background:var(--glas-hover)!important;outline:1px solid var(--akzent)}
.dom-wurzel{font-weight:700;cursor:default}
.dom-tw{max-width:100%;overflow-x:auto;margin:0 0 8px}
.dom-tab{border-collapse:collapse;width:100%;font-size:.88em}
.dom-tab th,.dom-tab td{padding:4px 6px;border-bottom:1px solid var(--glas-rand);text-align:left;vertical-align:top}
.dom-zeile{cursor:pointer}.dom-zeile:hover{background:var(--glas-hover)}
.dom-aus td{opacity:.6}
.dom-form{display:flex;flex-wrap:wrap;gap:6px;align-items:flex-end;margin:6px 0}
.dom-form label{display:flex;flex-direction:column;font-size:.85em;gap:2px;min-width:0}
.dom-gpof label{flex:1 1 220px}
.dom-ein{background:var(--code-bg);color:var(--tinte);border:1px solid var(--glas-rand);border-radius:8px;padding:6px 8px;font:inherit;min-width:0;max-width:100%}
input.dom-ein{flex:1 1 140px}
.dom-cb{flex-direction:row!important;align-items:center;gap:6px!important}
.dom-detail{border:1px solid var(--akzent);border-radius:var(--radius-klein);padding:8px 10px;margin:8px 0;animation:dom-ein .25s ease}
@keyframes dom-ein{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
.dom-chip{display:inline-flex;align-items:center;gap:4px;background:var(--glas-hover);border-radius:12px;padding:2px 8px;margin:2px;font-size:.85em}
.dom-chip button,.dom-x{background:none;border:0;color:var(--rot);cursor:pointer;font:inherit;padding:0 2px}
.dom-rot{color:var(--rot)}.dom-rotk{color:var(--rot)}.dom-leise{color:var(--tinte-leise)}
.dom-det summary{cursor:pointer;margin:6px 0}
.dom-erg{padding:8px 10px;border-radius:8px;margin:6px 0;animation:dom-ein .3s ease}
.dom-lv0{background:rgba(239,122,112,.18);border:1px solid var(--rot)}.dom-lv1{background:rgba(159,201,239,.18);border:1px solid var(--blau)}
.dom-lv2,.dom-lv3{background:rgba(159,224,168,.18);border:1px solid var(--gruen)}
.dom-ps{padding:0;overflow:hidden;background:#0c1a33}
.dom-psaus{font-family:var(--mono);font-size:.82em;color:#e8eefc;height:360px;overflow:auto;padding:10px 12px;white-space:pre-wrap;word-break:break-word}
.dom-ps-c{color:#ffe08a}.dom-ps-e{color:#ff8b8b}.dom-ps-i{color:#9fb6dc}.dom-ps-o{color:#e8eefc}
.dom-pszeile{display:flex;gap:6px;align-items:center;padding:6px 12px;border-top:1px solid rgba(255,255,255,.15);font-family:var(--mono);color:#ffe08a}
.dom-pszeile input{flex:1;min-width:0;background:transparent;border:0;color:#fff;font:inherit;outline:none}
.dom-aufg{padding-left:20px}.dom-aufg li{margin:0 0 10px}.dom-aufg p{margin:4px 0}
.dom-aufg li.dom-ok>b{color:var(--gruen)}
.dom-st{font-size:.75em;border-radius:8px;padding:1px 6px;border:1px solid var(--glas-rand)}
.dom-st-leicht{color:var(--gruen)}.dom-st-mittel{color:var(--akzent)}.dom-st-schwer{color:var(--rot)}
.dom-code{background:var(--code-bg);padding:8px;border-radius:8px;white-space:pre-wrap;word-break:break-word;font-family:var(--mono);font-size:.8em}
.dom-dora{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:8px 0}
.dom-dora i{color:var(--tinte-leise);font-style:normal}
.dom-dora-s{display:flex;flex-direction:column;background:var(--glas-hover);border-radius:8px;padding:6px 8px;flex:1 1 120px;animation:dom-puls 2s infinite both}
.dom-dora-s b{color:var(--akzent);font-size:1.2em}.dom-dora-s small{color:var(--tinte-leise)}
@keyframes dom-puls{0%,100%{opacity:.75}50%{opacity:1}}
.dom-svg{width:100%;max-width:420px;display:block;margin:8px 0}
.dom-sv-k{fill:var(--glas-hover);stroke:var(--akzent)}.dom-svg text{fill:var(--tinte);font-size:12px}.dom-sv-t{fill:var(--tinte-leise)!important}
.dom-sv-p{stroke:var(--gruen);stroke-width:2;stroke-dasharray:6 4;animation:dom-fl 1s linear infinite;fill:none}
@keyframes dom-fl{to{stroke-dashoffset:-20}}
.dom-leg summary{cursor:pointer}
@media (max-width:760px){.dom-raster{grid-template-columns:minmax(0,1fr)}.dom-baum{max-height:260px}.dom-psaus{height:300px}}
`;
    document.head.appendChild(st);
  }

  // ---------- Ansicht ----------
  function ansicht() {
    krumen([START, { txt: 'Werkzeuge', go: 'werkzeuge' }, { txt: 'Meine Domäne' }]);
    stil(); laden();
    $('#inhalt').innerHTML = `<h1>Meine Domäne</h1>
      <p class="unter">Deine eigene AD-Umgebung <b>${DOM}</b> (NETZILON) mit DC01 (Windows Server 2025, 10.0.0.10, DNS + DHCP) und den 100 Mitarbeitern der Netzilon GmbH. Bediene sie wie in der Praxis – per Konsole (GUI) oder PowerShell. Beides ändert denselben Zustand.</p>
      <div id="dom-wurzel"></div>`;
    const w = $('#dom-wurzel');
    w.addEventListener('click', klick);
    w.addEventListener('keydown', taste);
    pruefe(true);
    zeichne();
  }

  window.VIEWS = Object.assign(window.VIEWS || {}, { domaene: ansicht });
  return {
    ansicht, AUFGABEN,
    alleGeloest: () => { try { return AUFGABEN.every(a => P().geloest[a.id]); } catch { return false; } },
    _test: { laden: () => laden(), z: () => Z, eff: (u, s) => { const e = eff(u, s); return e && { r: e.r, text: e.text, share: e.share, ntfs: e.ntfs }; }, ps: z => konsole(z), normal, start, pruefe, stamm, zeichne, tab: t => { tab = t; zeichne(); }, rsop: u => rsop(user(u).ou).s }
  };
})();
window.Domaene = Domaene;
