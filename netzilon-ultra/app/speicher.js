// Netzilon Ultra 2.2 – Speicher-Labor: SAN per Klick (FC-Fabrics, Zoning, LUN-Masking, Multipath/MPIO),
// Ausfallsimulation und animierter RAID-Rebuild (0/1/5/6/10) mit Aufgaben und automatischer Auswertung.
const Speicher = (() => {
  // ---------- Stammdaten ----------
  const SRVIDX = { HV01: 1, HV02: 2, SQL01: 3, FILE01: 4, BAK01: 5 };
  const SRV_BASIS = ['HV01', 'HV02', 'SQL01'];
  const SW = ['FCA', 'FCB'];
  const SWK = { FCA: 'FC-A', FCB: 'FC-B' };
  const SWNAME = { FCA: 'FC-Switch A (Fabric A)', FCB: 'FC-Switch B (Fabric B)' };
  const CTL = ['CTLA', 'CTLB'];
  const CTLNAME = { CTLA: 'Controller A', CTLB: 'Controller B' };
  const CTLW = { 'CTLA.0': '50:0a:09:81:00:a0:00:01', 'CTLA.1': '50:0a:09:82:00:a0:00:02', 'CTLB.0': '50:0a:09:81:00:b0:00:01', 'CTLB.1': '50:0a:09:82:00:b0:00:02' };
  const LEVELS = [0, 1, 5, 6, 10];
  const TB_WAHL = [1, 2, 4, 8, 12, 16];
  const ZEILEN = 6, DAUER = 8; // Streifen je Platte, Rebuild-Dauer in Sekunden (ohne Beschleunigung)
  const PST = ['ok', 'aus', 'warte', 'rebuild'];
  const wwpn = (srv, h) => { const i = SRVIDX[srv]; return `10:00:00:90:fa:${i}${i}:0${i}:0${h}`; };
  const nutzTB = (level, n, tb) => level === 0 ? n * tb : level === 1 ? tb : level === 5 ? (n - 1) * tb : level === 6 ? (n - 2) * tb : level === 10 ? n / 2 * tb : 0;
  const toleranz = level => ({ 0: '0 Platten', 1: 'alle bis auf 1 Platte', 5: '1 Platte', 6: '2 Platten', 10: '1 Platte je Spiegelpaar' })[level];
  function nGueltig(level, n) {
    n = Math.round(+n) || 0;
    if (level === 1) return 2;
    if (level === 10) { n = Math.max(4, Math.min(8, n)); return n % 2 ? n - 1 : n; }
    return Math.max(level === 6 ? 4 : level === 5 ? 3 : 2, Math.min(8, n));
  }

  // ---------- Zustand ----------
  let Z = null, modus = 'kabel', auswahl = null, hostSicht = 'HV01', fabSicht = 'FCA', rgSicht = 'RG1';
  let raf = 0, rbTimer = 0, tempo = 1, tickN = 0, ioPfade = [];
  const rg = id => Z.rgs.find(r => r.id === id);
  const lunVon = n => Z.luns.find(l => l.n.toLowerCase() === String(n).toLowerCase());
  function neueRG(id, level, n, tb, spare) { return { id, level, n, tb, d: Array(n).fill('ok'), spare, rb: null, tot: false }; }
  function start() {
    const a = [{ n: 'z_HV02_hba0', m: [wwpn('HV02', 0), CTLW['CTLA.0']] }];
    return {
      v: 1, server: SRV_BASIS.slice(), kid: 8,
      kabel: [['HV01.0', 'FCA'], ['HV01.1', 'FCB'], ['HV02.0', 'FCA'], ['CTLA.0', 'FCA'], ['CTLA.1', 'FCB'], ['CTLB.0', 'FCA'], ['CTLB.1', 'FCB']].map(([port, sw], i) => ({ id: 'k' + (i + 1), port, sw })),
      fab: { FCA: { zonen: JSON.parse(JSON.stringify(a)), aktiv: JSON.parse(JSON.stringify(a)) }, FCB: { zonen: [], aktiv: [] } },
      luns: [{ n: 'VM-STORE', gb: 2000, rg: 'RG1', own: 'CTLA', map: { HV01: 0, HV02: 1 } }],
      rgs: [neueRG('RG1', 5, 5, 4, 1), neueRG('RG2', 10, 4, 2, 0), neueRG('RG3', 6, 6, 2, 1)],
      aus: {}, ev: {}, antw: {}
    };
  }
  const istObj = o => o && typeof o === 'object' && !Array.isArray(o);
  const portOk = (p, server) => { const m = /^([A-Z0-9]+)\.([01])$/.exec(String(p)); return !!m && (server.includes(m[1]) || CTL.includes(m[1])); };
  const zoneNameOk = s => typeof s === 'string' && /^[A-Za-z0-9_-]{1,32}$/.test(s);
  const lunNameOk = s => typeof s === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.-]{0,23}$/.test(s);
  // Alten/kaputten Zustand säubern: alles Unbekannte verwerfen, bei Strukturfehlern Startzustand
  function normal(z) {
    try {
      if (!istObj(z) || z.v !== 1) return start();
      const s = start();
      const server = Array.isArray(z.server) ? [...new Set(z.server.filter(x => typeof x === 'string' && SRVIDX[x]))] : [];
      for (const b of SRV_BASIS) if (!server.includes(b)) server.unshift(b);
      s.server = server.slice(0, 5);
      const belegt = new Set();
      s.kabel = (Array.isArray(z.kabel) ? z.kabel : []).filter(k => istObj(k) && typeof k.id === 'string' && portOk(k.port, s.server) && SW.includes(k.sw) && !belegt.has(k.port) && belegt.add(k.port)).map(k => ({ id: k.id.slice(0, 12), port: k.port, sw: k.sw }));
      s.kid = Number.isInteger(z.kid) && z.kid > 0 ? z.kid : 100;
      const zonen = arr => (Array.isArray(arr) ? arr : []).filter(x => istObj(x) && zoneNameOk(x.n) && Array.isArray(x.m)).slice(0, 40).map(x => ({ n: x.n, m: [...new Set(x.m.filter(w => typeof w === 'string' && /^[0-9a-f:]{23}$/.test(w)))] }));
      if (istObj(z.fab)) for (const sw of SW) if (istObj(z.fab[sw])) s.fab[sw] = { zonen: zonen(z.fab[sw].zonen), aktiv: zonen(z.fab[sw].aktiv) };
      if (Array.isArray(z.rgs)) s.rgs = s.rgs.map(def => {
        const r = z.rgs.find(x => istObj(x) && x.id === def.id); if (!r) return def;
        const level = LEVELS.includes(r.level) ? r.level : def.level, n = nGueltig(level, r.n), tb = TB_WAHL.includes(r.tb) ? r.tb : def.tb;
        const d = Array.isArray(r.d) && r.d.length === n && r.d.every(x => PST.includes(x)) ? r.d.slice() : Array(n).fill('ok');
        let rb = istObj(r.rb) && Number.isInteger(r.rb.i) && r.rb.i >= 0 && r.rb.i < n && d[r.rb.i] === 'rebuild' && typeof r.rb.p === 'number' && r.rb.p >= 0 ? { i: r.rb.i, p: Math.min(r.rb.p, 0.999) } : null;
        d.forEach((x, i) => { if (x === 'rebuild' && (!rb || rb.i !== i)) d[i] = 'warte'; });
        return { id: def.id, level, n, tb, d, spare: Number.isInteger(r.spare) ? Math.max(0, Math.min(3, r.spare)) : def.spare, rb, tot: r.tot === true };
      });
      s.luns = (Array.isArray(z.luns) ? z.luns : []).filter(l => istObj(l) && lunNameOk(l.n) && Number.isFinite(l.gb) && l.gb >= 1 && l.gb <= 200000 && s.rgs.some(r => r.id === l.rg)).slice(0, 20).map(l => {
        const map = {}; if (istObj(l.map)) for (const [h, id] of Object.entries(l.map)) if (s.server.includes(h) && Number.isInteger(id) && id >= 0 && id <= 255) map[h] = id;
        return { n: l.n, gb: Math.round(l.gb), rg: l.rg, own: CTL.includes(l.own) ? l.own : 'CTLA', map };
      }).filter((l, i, a) => a.findIndex(x => x.n.toLowerCase() === l.n.toLowerCase()) === i);
      s.aus = {}; if (istObj(z.aus)) for (const k of Object.keys(z.aus)) if (/^(kabel|hba|sw|ctl):[A-Za-z0-9.]+$/.test(k) && z.aus[k]) s.aus[k] = 1;
      s.ev = {}; if (istObj(z.ev)) for (const k of ['rebuild5', 'raid6doppel']) if (z.ev[k]) s.ev[k] = 1;
      s.antw = {}; if (istObj(z.antw)) for (const [k, v] of Object.entries(z.antw)) if (/^kap\d+$/.test(k) && Number.isFinite(v)) s.antw[k] = v;
      return s;
    } catch (e) { console.warn('Speicher-Labor: Zustand verworfen', e); return start(); }
  }
  function P() {
    const p = S.p;
    if (!istObj(p.speicher)) p.speicher = { geloest: {}, zustand: null, best: {} };
    if (!istObj(p.speicher.geloest)) p.speicher.geloest = {};
    if (!istObj(p.speicher.best)) p.speicher.best = {};
    return p.speicher;
  }
  function laden() { Z = normal(P().zustand); }
  function sichern() { P().zustand = JSON.parse(JSON.stringify(Z)); speichern(); }

  // ---------- Bezeichnungen ----------
  const portName = p => { const [d, i] = p.split('.'); return CTL.includes(d) ? `${CTLNAME[d]} Port ${i}` : `${d} HBA${i}`; };
  const wwpnVon = p => { const [d, i] = p.split('.'); return CTL.includes(d) ? CTLW[p] : wwpn(d, +i); };
  const istInitiator = w => /^10:/.test(w);
  function wLabel(w) {
    for (const s of Z.server) for (const h of [0, 1]) if (wwpn(s, h) === w) return `${s} HBA${h}`;
    for (const [p, x] of Object.entries(CTLW)) if (x === w) return portName(p);
    return 'unbekannt (verwaist)';
  }
  const kabelAn = port => Z.kabel.find(k => k.port === port);
  const hbaPorts = s => [s + '.0', s + '.1'];
  const ctlPorts = () => ['CTLA.0', 'CTLA.1', 'CTLB.0', 'CTLB.1'];
  const fehlend = r => r.d.filter(x => x !== 'ok').length;
  function istKaputt(r) {
    const f = fehlend(r);
    if (r.level === 0) return f > 0;
    if (r.level === 1) return f >= r.n;
    if (r.level === 5) return f > 1;
    if (r.level === 6) return f > 2;
    for (let i = 0; i < r.n; i += 2) if (r.d[i] !== 'ok' && r.d[i + 1] !== 'ok') return true;
    return false;
  }
  function rgStatus(r) {
    if (r.tot) return { t: 'AUSGEFALLEN – Datenverlust', k: 'spm-no' };
    if (r.rb) return { t: `Rebuild ${Math.floor(r.rb.p * 100)} %`, k: 'spm-warn' };
    if (fehlend(r)) return { t: 'degradiert (ohne Redundanz-Reserve)', k: 'spm-warn' };
    return { t: 'optimal', k: 'spm-ok' };
  }

  // ---------- Pfadprüfung (Physik + Zoning + Masking + RAID) ----------
  function istAus(key, extra) { return !!(Z.aus[key] || (extra && extra.includes(key))); }
  function pfade(host, extra) {
    const res = [];
    for (const hp of hbaPorts(host)) {
      const hk = kabelAn(hp), hw = wwpnVon(hp);
      if (!hk) { res.push({ hp, ok: false, phys: false, grund: `${portName(hp)} ist nicht verkabelt` }); continue; }
      const ziele = ctlPorts().map(cp => ({ cp, ck: kabelAn(cp) })).filter(x => x.ck && x.ck.sw === hk.sw);
      if (!ziele.length) { res.push({ hp, sw: hk.sw, ok: false, phys: false, grund: `an ${SWK[hk.sw]} hängt kein Controller-Port` }); continue; }
      for (const { cp, ck } of ziele) {
        const ctl = cp.split('.')[0];
        let grund = '';
        if (istAus('hba:' + hp, extra)) grund = `${portName(hp)} defekt`;
        else if (istAus('kabel:' + hk.id, extra)) grund = `Kabel ${portName(hp)} ↔ ${SWK[hk.sw]} defekt`;
        else if (istAus('sw:' + hk.sw, extra)) grund = `${SWNAME[hk.sw]} ausgefallen`;
        else if (istAus('kabel:' + ck.id, extra)) grund = `Kabel ${portName(cp)} ↔ ${SWK[ck.sw]} defekt`;
        else if (istAus('ctl:' + ctl, extra)) grund = `${CTLNAME[ctl]} ausgefallen`;
        const phys = !grund;
        const zone = Z.fab[hk.sw].aktiv.some(z => z.m.includes(hw) && z.m.includes(CTLW[cp]));
        if (phys && !zone) grund = `keine aktive Zone mit ${portName(hp)} und ${portName(cp)} auf ${SWK[hk.sw]}`;
        res.push({ hp, cp, ctl, sw: hk.sw, phys, zone, ok: phys && zone, grund });
      }
    }
    return res;
  }
  function sicht(host, lunName, extra) {
    const l = lunVon(lunName), bed = [];
    if (!l || !Z.server.includes(host)) return { ok: false, bed: [{ ok: false, t: 'LUN oder Host existiert nicht' }], pf: [], aktiv: [], fabrics: 0 };
    const id = l.map[host];
    bed.push(id !== undefined ? { ok: true, t: `LUN-Masking: ${l.n} ist für ${host} freigegeben (LUN-ID ${id})` } : { ok: false, t: `LUN-Masking: ${l.n} ist für ${host} nicht freigegeben – im Array-Mapping eintragen` });
    const pf = pfade(host, extra), phys = pf.filter(p => p.phys), akt = pf.filter(p => p.ok);
    bed.push(phys.length ? { ok: true, t: `Physischer Pfad: ${phys.length} intakte Verbindung(en) HBA → Switch → Controller` } : { ok: false, t: 'Physischer Pfad: keine intakte Verbindung HBA → Switch → Controller' + (pf.length ? ` (${pf.map(p => p.grund).filter(Boolean)[0] || ''})` : '') });
    bed.push(akt.length ? { ok: true, t: `Zoning: ${akt.length} Pfad(e) in aktiver Zonenkonfiguration (Initiator + Target in derselben Zone)` } : { ok: false, t: 'Zoning: kein Initiator/Target-Paar in einer aktiven Zone' + (phys.length ? ' – Zone anlegen und Konfiguration aktivieren' : '') });
    const r = rg(l.rg), st = rgStatus(r);
    bed.push({ ok: !r.tot, t: `RAID-Gruppe ${r.id} (RAID ${r.level}): ${st.t}` });
    const dopp = id !== undefined && Z.luns.some(x => x !== l && x.map[host] === id);
    bed.push(dopp ? { ok: false, t: `LUN-ID ${id} ist auf ${host} doppelt vergeben – jede LUN braucht pro Host eine eigene ID` } : { ok: true, t: 'LUN-ID pro Host eindeutig' });
    const ok = bed.every(b => b.ok);
    const ctlOk = c => !istAus('ctl:' + c, extra);
    const owner = ctlOk(l.own) ? l.own : CTL.find(c => c !== l.own);
    akt.forEach(p => p.opt = p.ctl === owner);
    return { ok, bed, pf, aktiv: ok ? akt : [], fabrics: ok ? new Set(akt.map(p => p.sw)).size : 0, id, owner };
  }

  // ---------- Aufgaben ----------
  const kap = (id, wert) => Z.antw[id] === wert;
  const AUFGABEN = [
    { id: 'kap6', st: 1, t: 'Berechne die Nutzkapazität: RAID 6 aus 8 × 4 TB (Antwort in TB).', antwort: 24, tipp: 'RAID 6 opfert zwei Platten für die doppelte Parität (P und Q): (n − 2) × Größe.', ok: () => kap('kap6', 24) },
    { id: 'kap10', st: 1, t: 'Berechne die Nutzkapazität: RAID 10 aus 6 × 3 TB (Antwort in TB).', antwort: 9, tipp: 'RAID 10 spiegelt jedes Plattenpaar – die Hälfte bleibt nutzbar: n / 2 × Größe.', ok: () => kap('kap10', 9) },
    { id: 'kabel-sql', st: 1, t: 'Verkabele SQL01 redundant: ein HBA an Fabric A, der andere an Fabric B.', tipp: 'Modus „Verkabeln“: HBA-Port von SQL01 antippen, dann den Switch.', ok: () => { const a = kabelAn('SQL01.0'), b = kabelAn('SQL01.1'); return !!(a && b && a.sw !== b.sw); } },
    { id: 'lun-sql', st: 1, t: 'Lege eine LUN „SQL-DATA“ mit mindestens 200 GB an.', tipp: 'Abschnitt „LUNs & Masking“: Name, Größe, RAID-Gruppe → Anlegen.', ok: () => { const l = lunVon('SQL-DATA'); return !!(l && l.gb >= 200); } },
    { id: 'mask-sql', st: 2, t: 'Mache die LUN SQL-DATA nur für SQL01 sichtbar (LUN-Masking).', tipp: 'In der Masking-Tabelle nur bei SQL01 freigeben, bei allen anderen Hosts nicht.', ok: () => { const l = lunVon('SQL-DATA'); return !!(l && Object.keys(l.map).length === 1 && l.map.SQL01 !== undefined); } },
    { id: 'lun-id', st: 2, t: 'Cluster-Regel: VM-STORE muss auf HV01 und HV02 dieselbe LUN-ID haben.', tipp: 'Cluster Shared Volumes erwarten auf allen Knoten dieselbe LUN-ID – LUN-ID bei HV02 auf 0 ändern.', ok: () => { const l = lunVon('VM-STORE'); return !!(l && l.map.HV01 !== undefined && l.map.HV01 === l.map.HV02); } },
    { id: 'zone-hv01', st: 2, t: 'Richte Single-Initiator-Zoning für HV01 ein (beide HBAs, beide Fabrics, Konfiguration aktiv).', tipp: 'Je Fabric eine Zone: genau EIN Initiator (HV01-HBA) + Controller-Ports als Targets. Danach „Konfiguration aktivieren“.', ok: () => siZoning('HV01') },
    { id: 'hv02-redundant', st: 2, t: 'Sorge dafür, dass HV02 den Ausfall von Switch A übersteht (VM-STORE bleibt über Fabric B erreichbar).', tipp: 'HV02 HBA1 an FC-B anschließen, auf FC-B eine Zone HV02-HBA1 + Controller-Port anlegen und aktivieren.', ok: () => sicht('HV02', 'VM-STORE', ['sw:FCA']).ok },
    { id: 'rebuild5', st: 3, t: 'Baue ein RAID 5 nach einem Plattenausfall wieder auf (Rebuild bis 100 %).', tipp: 'RAID-Labor: RG1 (RAID 5) – Platte „Ausfall“ → Hot Spare springt ein oder „Tauschen“ → Rebuild abwarten.', ok: () => !!Z.ev.rebuild5 },
    { id: 'raid6-doppel', st: 3, t: 'Zeige, dass RAID 6 zwei gleichzeitige Plattenausfälle ohne Datenverlust übersteht.', tipp: 'RAID-Labor: RG3 (RAID 6) – zwei Platten nacheinander ausfallen lassen (auch während des Rebuilds).', ok: () => !!Z.ev.raid6doppel },
    { id: 'sql-mpio', st: 3, t: 'SQL01 sieht SQL-DATA über beide Fabrics (Multipath: mind. 2 aktive Pfade über A und B).', tipp: 'Verkabelung + Single-Initiator-Zonen auf FC-A und FC-B + Masking nur für SQL01.', ok: () => { const s = sicht('SQL01', 'SQL-DATA'); return s.ok && s.fabrics === 2 && s.aktiv.length >= 2; } },
    { id: 'ctl-ausfall', st: 3, t: 'Controller A ist ausgefallen – HV01 muss VM-STORE trotzdem weiter sehen (Failover auf Controller B).', tipp: 'Zonen müssen auch Ports von Controller B enthalten. Dann im Ausfall-Bereich Controller A ausfallen lassen.', ok: () => !!Z.aus['ctl:CTLA'] && sicht('HV01', 'VM-STORE').ok }
  ];
  function siZoning(host) {
    const sws = new Set();
    for (const hp of hbaPorts(host)) {
      const k = kabelAn(hp); if (!k) return false; sws.add(k.sw);
      const w = wwpnVon(hp), zs = Z.fab[k.sw].aktiv.filter(z => z.m.includes(w));
      if (!zs.length) return false;
      if (!zs.every(z => z.m.filter(istInitiator).length === 1 && z.m.some(x => !istInitiator(x)))) return false;
    }
    return sws.size === 2;
  }
  function pruefe(still) {
    const g = P().geloest; let neu = 0, letzte = null;
    for (const a of AUFGABEN) {
      if (g[a.id]) continue;
      let ok = false; try { ok = a.ok(); } catch (e) { console.warn('Speicher-Aufgabe', a.id, e); }
      if (ok) { g[a.id] = heute(); neu++; letzte = a; melde('speicher', 1); }
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

  // ---------- Aktionen ----------
  function aenderung(msg, art) { sichern(); pruefe(); zeichne(); if (msg) toast(msg, art); }
  function kabelNeu(port, sw) {
    if (!portOk(port, Z.server) || !SW.includes(sw)) return;
    const vorh = kabelAn(port);
    if (vorh) { if (vorh.sw === sw) return toast(`${portName(port)} hängt schon an ${SWK[sw]}.`); return toast(`${portName(port)} ist schon verkabelt – erst das Kabel antippen und entfernen.`); }
    Z.kabel.push({ id: 'k' + (Z.kid++), port, sw });
    auswahl = null;
    aenderung(`Kabel gesteckt: ${portName(port)} ↔ ${SWK[sw]} (FLOGI: ${wwpnVon(port)} meldet sich an der Fabric an)`);
  }
  function kabelWeg(id) {
    const k = Z.kabel.find(x => x.id === id); if (!k) return;
    Z.kabel = Z.kabel.filter(x => x !== k); delete Z.aus['kabel:' + id];
    aenderung(`Kabel ${portName(k.port)} ↔ ${SWK[k.sw]} entfernt`);
  }
  function umschalten(key) {
    if (!/^(kabel|hba|sw|ctl):/.test(key)) return;
    if (Z.aus[key]) delete Z.aus[key]; else Z.aus[key] = 1;
    aenderung(`${ausName(key)}: ${Z.aus[key] ? 'AUSGEFALLEN' : 'repariert'}`, Z.aus[key] ? 'rot' : '');
  }
  function ausName(key) {
    const [t, v] = key.split(':');
    if (t === 'kabel') { const k = Z.kabel.find(x => x.id === v); return k ? `Kabel ${portName(k.port)} ↔ ${SWK[k.sw]}` : 'Kabel'; }
    if (t === 'hba') return portName(v);
    if (t === 'sw') return SWNAME[v] || v;
    if (t === 'ctl') return CTLNAME[v] || v;
    return key;
  }
  function allesHeil() {
    Z.aus = {};
    for (const r of Z.rgs) { r.d = r.d.map(() => 'ok'); r.rb = null; r.tot = false; }
    aenderung('Alles wiederhergestellt: Kabel, HBAs, Switches, Controller und Platten sind wieder in Ordnung.');
  }
  function serverDazu() {
    const neu = Object.keys(SRVIDX).find(s => !Z.server.includes(s));
    if (!neu || Z.server.length >= 5) return toast('Mehr Server passen nicht ins Labor (max. 5).');
    Z.server.push(neu); hostSicht = neu;
    aenderung(`Server ${neu} hinzugefügt (2 HBAs: ${wwpn(neu, 0)}, ${wwpn(neu, 1)})`);
  }
  function serverWeg(s) {
    if (SRV_BASIS.includes(s) || !Z.server.includes(s)) return;
    Z.server = Z.server.filter(x => x !== s);
    Z.kabel.filter(k => k.port.startsWith(s + '.')).forEach(k => delete Z.aus['kabel:' + k.id]);
    Z.kabel = Z.kabel.filter(k => !k.port.startsWith(s + '.'));
    Z.luns.forEach(l => delete l.map[s]); hbaPorts(s).forEach(p => delete Z.aus['hba:' + p]);
    if (hostSicht === s) hostSicht = 'HV01';
    aenderung(`${s} entfernt. Achtung: Zonen mit seinen WWPNs bleiben als „verwaist“ stehen – aufräumen!`);
  }
  // LUNs
  function belegtGB(id) { return Z.luns.filter(l => l.rg === id).reduce((s, l) => s + l.gb, 0); }
  function lunNeu(name, gb, rgId) {
    name = String(name || '').trim(); gb = Math.round(parseFloat(String(gb).replace(',', '.')));
    if (!lunNameOk(name)) return toast('Name: 1–24 Zeichen, Buchstaben/Ziffern/-/_/. (z. B. SQL-DATA)', 'rot');
    if (lunVon(name)) return toast(`Eine LUN „${name}“ gibt es schon.`, 'rot');
    if (!(gb >= 1 && gb <= 200000)) return toast('Größe: 1 bis 200000 GB', 'rot');
    const r = rg(rgId); if (!r) return;
    if (r.tot) return toast(`${r.id} ist ausgefallen – erst wiederherstellen.`, 'rot');
    const frei = nutzTB(r.level, r.n, r.tb) * 1000 - belegtGB(r.id);
    if (gb > frei) return toast(`Zu groß: In ${r.id} sind nur noch ${frei} GB frei.`, 'rot');
    if (Z.luns.length >= 20) return toast('Maximal 20 LUNs im Labor.');
    Z.luns.push({ n: name, gb, rg: r.id, own: Z.luns.length % 2 ? 'CTLB' : 'CTLA', map: {} });
    aenderung(`LUN ${name} (${gb} GB) auf ${r.id} angelegt – noch für niemanden freigegeben (Masking).`);
  }
  function freieId(host) { const ids = new Set(Z.luns.map(l => l.map[host]).filter(x => x !== undefined)); let i = 0; while (ids.has(i)) i++; return i; }
  function mappen(lun, host, an) {
    const l = lunVon(lun); if (!l || !Z.server.includes(host)) return;
    if (an) l.map[host] = freieId(host); else delete l.map[host];
    aenderung(an ? `${l.n} für ${host} freigegeben (LUN-ID ${l.map[host]})` : `${l.n} für ${host} gesperrt (Masking)`);
  }
  function setzeId(lun, host, v) {
    const l = lunVon(lun), n = Math.round(+v); if (!l || l.map[host] === undefined) return;
    if (!(n >= 0 && n <= 255)) { toast('LUN-ID 0–255', 'rot'); zeichne(); return; }
    l.map[host] = n; aenderung(`${l.n} auf ${host}: LUN-ID ${n}`);
  }
  function lunWeg(lun) { const l = lunVon(lun); if (!l) return; Z.luns = Z.luns.filter(x => x !== l); aenderung(`LUN ${l.n} gelöscht`); }
  // Zoning
  function zoneNeu(sw, name, m) {
    const f = Z.fab[sw]; if (!f) return;
    name = String(name || '').trim();
    if (!zoneNameOk(name)) return toast('Zonenname: 1–32 Zeichen, nur Buchstaben, Ziffern, _ und -', 'rot');
    if (f.zonen.some(z => z.n === name)) return toast(`Zone ${name} gibt es auf ${SWK[sw]} schon.`, 'rot');
    m = [...new Set(m)]; if (m.length < 2) return toast('Eine Zone braucht mindestens 2 Mitglieder (Initiator + Target).', 'rot');
    f.zonen.push({ n: name, m });
    const ini = m.filter(istInitiator).length;
    aenderung(`Zone ${name} angelegt${ini > 1 ? ' – Achtung: mehrere Initiatoren, kein Single-Initiator-Zoning' : ''}. Noch nicht aktiv!`);
  }
  function zoneWeg(sw, name) { const f = Z.fab[sw]; f.zonen = f.zonen.filter(z => z.n !== name); aenderung(`Zone ${name} gelöscht (noch nicht aktiv)`); }
  function aktivieren(sw) { const f = Z.fab[sw]; f.aktiv = JSON.parse(JSON.stringify(f.zonen)); aenderung(`Zonenkonfiguration auf ${SWK[sw]} aktiviert (cfgenable): ${f.aktiv.length} Zone(n)`); }
  // RAID
  function plattenAus(r, i) {
    if (!r || !(i >= 0 && i < r.n)) return;
    if (r.tot) return toast(`${r.id} ist bereits ausgefallen.`);
    if (r.d[i] === 'aus') return toast('Diese Platte ist schon ausgefallen.');
    if (r.rb && r.rb.i === i) r.rb = null;
    r.d[i] = 'aus';
    let msg;
    if (istKaputt(r)) { r.tot = true; r.rb = null; msg = r.level === 0 ? `RAID 0 hat keine Redundanz – ${r.id} ist komplett verloren!` : `Zu viele Ausfälle in ${r.id} (RAID ${r.level}) – DATENVERLUST!`; }
    else {
      if (r.level === 6 && fehlend(r) >= 2) Z.ev.raid6doppel = 1;
      msg = `Platte ${i} in ${r.id} ausgefallen – ${r.level === 6 && fehlend(r) >= 2 ? 'zweiter Ausfall, RAID 6 läuft weiter (P + Q)' : 'Array degradiert'}`;
      naechster(r, true);
    }
    rgSicht = r.id;
    aenderung(msg, r.tot ? 'rot' : '');
  }
  function naechster(r, still) {
    if (r.tot || r.rb) return;
    let i = r.d.indexOf('warte');
    if (i < 0 && r.spare > 0 && r.level !== 0) { i = r.d.indexOf('aus'); if (i >= 0) { r.spare--; if (!still) toast(`Hot Spare springt für Platte ${i} ein – Rebuild startet`); } }
    if (i >= 0) { r.d[i] = 'rebuild'; r.rb = { i, p: 0 }; timerStart(); }
  }
  function tauschen(r, i) {
    if (!r || r.tot || r.d[i] !== 'aus') return;
    r.d[i] = 'warte'; naechster(r, true);
    aenderung(`Platte ${i} getauscht (Hot-Swap) – ${r.rb && r.rb.i === i ? 'Rebuild läuft' : 'wartet auf Rebuild'}`);
  }
  function backup(r) { r.d = r.d.map(() => 'ok'); r.rb = null; r.tot = false; aenderung(`${r.id}: neue Platten, Daten aus dem Backup zurückgespielt. Merke: RAID ist kein Backup!`); }
  function rgNeu(r, level, n, tb, spare) {
    level = LEVELS.includes(+level) ? +level : r.level; n = nGueltig(level, n); tb = TB_WAHL.includes(+tb) ? +tb : r.tb; spare = Math.max(0, Math.min(3, Math.round(+spare) || 0));
    const kap = nutzTB(level, n, tb) * 1000, bel = belegtGB(r.id);
    if (bel > kap) return toast(`Geht nicht: Auf ${r.id} liegen LUNs mit ${bel} GB, neue Nutzkapazität wäre nur ${kap} GB.`, 'rot');
    Object.assign(r, { level, n, tb, d: Array(n).fill('ok'), spare, rb: null, tot: false });
    aenderung(`${r.id} neu aufgebaut: RAID ${level} aus ${n} × ${tb} TB = ${nutzTB(level, n, tb)} TB nutzbar`);
  }
  function spareDazu(r) { if (r.spare >= 3) return toast('Maximal 3 Hot Spares je RAID-Gruppe.'); r.spare++; naechster(r); aenderung(`Hot Spare in ${r.id} eingeschoben (${r.spare} verfügbar)`); }

  // ---------- Timer (Rebuild) ----------
  const aktiv = () => !!(S.ansicht && S.ansicht.ansicht === 'speicher' && document.getElementById('spm-wurzel'));
  function timerStart() { if (!rbTimer && aktiv() && Z.rgs.some(r => r.rb)) rbTimer = setInterval(tick, 100); }
  function timerStop() { if (rbTimer) { clearInterval(rbTimer); rbTimer = 0; } }
  function tick() {
    if (!aktiv() || !Z) { timerStop(); return; }
    let fertig = false, laeuft = false;
    for (const r of Z.rgs) {
      if (!r.rb) continue;
      r.rb.p += 0.1 * tempo / DAUER;
      if (r.rb.p >= 1) { r.d[r.rb.i] = 'ok'; r.rb = null; if (r.level === 5) Z.ev.rebuild5 = 1; naechster(r); fertig = true; toast(`Rebuild in ${r.id} abgeschlossen – Redundanz wiederhergestellt`); }
      if (r.rb) laeuft = true;
    }
    if (!laeuft) timerStop();
    if (fertig) { sichern(); pruefe(); zeichne(); return; }
    if (++tickN % 10 === 0) sichern();
    const el = document.getElementById('spm-raid'); if (el) el.innerHTML = raidHtml();
  }

  // ---------- I/O-Animation ----------
  function animStart() {
    if (raf || (S.p.einstellungen && S.p.einstellungen.effekte === false)) return;
    let last = 0;
    const f = t => {
      raf = 0;
      const g = document.getElementById('spm-io');
      if (!g || !aktiv()) return;
      if (t - last > 40) { last = t; punkte(g, t); }
      raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
  }
  function punkte(g, t) {
    const kids = g.children;
    for (let c = 0; c < kids.length; c++) {
      const el = kids[c], p = ioPfade[+el.dataset.p]; if (!p) continue;
      let s = ((t / 2200 + (+el.dataset.k) / 3 + p.off) % 1) * p.len;
      let i = 0; while (i < p.seg.length - 1 && s > p.seg[i]) { s -= p.seg[i]; i++; }
      const a = p.pt[i], b = p.pt[i + 1], q = p.seg[i] ? Math.min(1, s / p.seg[i]) : 0;
      el.setAttribute('cx', (a[0] + (b[0] - a[0]) * q).toFixed(1)); el.setAttribute('cy', (a[1] + (b[1] - a[1]) * q).toFixed(1));
    }
  }

  // ---------- Darstellung: Topologie ----------
  const W = 400, H = 440;
  function lay() {
    const L = { srv: {}, port: {}, sw: { FCA: { x: 105, y: 190 }, FCB: { x: 295, y: 190 } }, ctl: { CTLA: { x: 105, y: 304 }, CTLB: { x: 295, y: 304 } } };
    const n = Z.server.length, sp = W / n, bw = Math.min(112, sp - 8);
    Z.server.forEach((s, i) => { const x = sp * (i + 0.5); L.srv[s] = { x, w: bw }; L.port[s + '.0'] = [x - bw / 4, 70]; L.port[s + '.1'] = [x + bw / 4, 70]; });
    L.port['CTLA.0'] = [65, 284]; L.port['CTLA.1'] = [145, 284]; L.port['CTLB.0'] = [255, 284]; L.port['CTLB.1'] = [335, 284];
    return L;
  }
  function swPunkt(L, sw, von, oben) { const s = L.sw[sw]; return [s.x + Math.max(-62, Math.min(62, (von[0] - s.x) * 0.35)), oben ? s.y - 23 : s.y + 23]; }
  function topoSvg() {
    const L = lay(); let o = '';
    // Kabel
    for (const k of Z.kabel) {
      const a = L.port[k.port]; if (!a) continue;
      const ctl = CTL.includes(k.port.split('.')[0]), b = swPunkt(L, k.sw, a, !ctl), aus = Z.aus['kabel:' + k.id];
      o += `<g class="spm-kabel ${aus ? 'spm-aus' : ''} ${k.sw === 'FCA' ? 'spm-fa' : 'spm-fb'}" data-kabel="${k.id}"><line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="spm-hit"/><line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="spm-ader"/><title>Kabel ${E(portName(k.port))} ↔ ${SWK[k.sw]}${aus ? ' (defekt)' : ''}</title></g>`;
    }
    // Server
    for (const s of Z.server) {
      const p = L.srv[s];
      o += `<g class="spm-srv ${hostSicht === s ? 'spm-sel' : ''}" data-host="${s}"><rect x="${p.x - p.w / 2}" y="8" width="${p.w}" height="56" rx="8"/><text x="${p.x}" y="30" class="spm-t1">🖥 ${s}</text><text x="${p.x}" y="46" class="spm-t2">${Z.luns.filter(l => sicht(s, l.n).ok).length} LUN(s)</text></g>`;
      for (const h of [0, 1]) {
        const pp = s + '.' + h, [x, y] = L.port[pp], aus = Z.aus['hba:' + pp];
        o += `<g class="spm-port ${auswahl === pp ? 'spm-sel' : ''} ${aus ? 'spm-aus' : ''} ${kabelAn(pp) ? 'spm-belegt' : ''}" data-port="${pp}"><circle cx="${x}" cy="${y}" r="11"/><text x="${x}" y="${y + 4}">${h}</text><title>${s} HBA${h} – WWPN ${wwpn(s, h)}${aus ? ' (defekt)' : ''}</title></g>`;
      }
    }
    // Switches
    for (const sw of SW) {
      const p = L.sw[sw], aus = Z.aus['sw:' + sw], n = Z.fab[sw].aktiv.length;
      o += `<g class="spm-sw ${aus ? 'spm-aus' : ''} ${auswahl && !aus ? 'spm-ziel' : ''} ${sw === 'FCA' ? 'spm-fa' : 'spm-fb'}" data-sw="${sw}"><rect x="${p.x - 75}" y="${p.y - 23}" width="150" height="46" rx="10"/><text x="${p.x}" y="${p.y - 2}" class="spm-t1">⇆ ${SWK[sw]}</text><text x="${p.x}" y="${p.y + 14}" class="spm-t2">Fabric ${sw.slice(-1)} · ${n} Zone(n) aktiv</text><title>${SWNAME[sw]}${aus ? ' (ausgefallen)' : ''}</title></g>`;
    }
    // Array
    o += `<rect x="8" y="250" width="384" height="184" rx="12" class="spm-array"/><text x="18" y="265" class="spm-t2 spm-li">ARRAY01 (Storage-Array)</text>`;
    for (const c of CTL) {
      const p = L.ctl[c], aus = Z.aus['ctl:' + c];
      o += `<g class="spm-ctl ${aus ? 'spm-aus' : ''}" data-ctl="${c}"><rect x="${p.x - 80}" y="284" width="160" height="40" rx="8"/><text x="${p.x}" y="${p.y + 4}" class="spm-t1">${CTLNAME[c]}</text><title>${CTLNAME[c]}${aus ? ' (ausgefallen)' : ''}</title></g>`;
    }
    for (const cp of ctlPorts()) {
      const [x, y] = L.port[cp], aus = Z.aus['ctl:' + cp.split('.')[0]];
      o += `<g class="spm-port spm-tgt ${auswahl === cp ? 'spm-sel' : ''} ${aus ? 'spm-aus' : ''} ${kabelAn(cp) ? 'spm-belegt' : ''}" data-port="${cp}"><circle cx="${x}" cy="${y}" r="11"/><text x="${x}" y="${y + 4}">${cp.slice(-1)}</text><title>${portName(cp)} – WWPN ${CTLW[cp]}</title></g>`;
    }
    // Plattenfächer
    Z.rgs.forEach((r, j) => {
      const y = 334 + j * 33, n = r.n + r.spare, bw = Math.min(30, 300 / Math.max(n, 1)) - 3;
      o += `<text x="18" y="${y + 17}" class="spm-t2 spm-li ${rgSicht === r.id ? 'spm-akz' : ''}" data-rg="${r.id}">${r.id} R${r.level}</text>`;
      r.d.forEach((st, i) => { const x = 86 + i * (bw + 3); o += `<rect x="${x}" y="${y}" width="${bw}" height="24" rx="4" class="spm-disk spm-d-${st}" data-disk="${r.id}:${i}"><title>${r.id} Platte ${i}: ${st}</title></rect>`; });
      for (let i = 0; i < r.spare; i++) { const x = 86 + (r.n + i) * (bw + 3); o += `<rect x="${x}" y="${y}" width="${bw}" height="24" rx="4" class="spm-disk spm-d-hs"><title>Hot Spare</title></rect><text x="${x + bw / 2}" y="${y + 16}" class="spm-t3">HS</text>`; }
      if (r.tot) o += `<text x="${86 + n * (Math.min(30, 300 / n)) + 4}" y="${y + 17}" class="spm-t2 spm-li spm-rotf">✗</text>`;
    });
    // I/O-Pfade
    ioPfade = []; const gesehen = new Set(); let dots = '';
    for (const s of Z.server) for (const l of Z.luns) {
      const v = sicht(s, l.n); if (!v.ok) continue;
      for (const p of v.aktiv) {
        const key = p.hp + '>' + p.cp; if (gesehen.has(key) || ioPfade.length >= 16) continue; gesehen.add(key);
        const a = L.port[p.hp], b = swPunkt(L, p.sw, a, true), c = swPunkt(L, p.sw, L.port[p.cp], false), d = L.port[p.cp];
        const pt = [a, b, c, d], seg = pt.slice(1).map((q, i) => Math.hypot(q[0] - pt[i][0], q[1] - pt[i][1]));
        const j = ioPfade.push({ pt, seg, len: seg.reduce((x, y) => x + y, 0), off: ioPfade.length * 0.13 }) - 1;
        for (let k = 0; k < 3; k++) dots += `<circle class="spm-io ${p.opt ? '' : 'spm-io-n'}" r="3.6" cx="${a[0]}" cy="${a[1]}" data-p="${j}" data-k="${k}"/>`;
      }
    }
    return `<svg id="spm-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="SAN-Topologie">${o}<g id="spm-io">${dots}</g></svg>`;
  }

  // ---------- Darstellung: Bereiche ----------
  const okX = b => `<span class="${b ? 'spm-ok' : 'spm-no'}">${b ? '✓' : '✗'}</span>`;
  const schalter = (attr, werte, akt) => `<div class="schalter spm-schalter">${werte.map(([v, t]) => `<button type="button" data-${attr}="${E(v)}" class="${v === akt ? 'an' : ''}">${t}</button>`).join('')}</div>`;
  function hinweis() {
    if (modus === 'kabel') return auswahl ? `<b>${E(portName(auswahl))}</b> gewählt – jetzt <b>FC-A</b> oder <b>FC-B</b> antippen (oder Port erneut antippen zum Abwählen).` : 'Verkabeln: erst einen Port (HBA oder Controller) antippen, dann den Switch. Kabel antippen = entfernen.';
    if (modus === 'ausfall') return 'Ausfall: Kabel, HBA-Port, Switch, Controller oder Platte antippen – fällt aus bzw. wird repariert (Platten über das RAID-Labor tauschen).';
    return 'Ansehen: Server antippen → „Was sieht Host X?“, Switch → Zoning, Platte → RAID-Labor. Punkte = laufende I/Os (gelb: optimierter Pfad).';
  }
  function topoHtml() {
    return `<div class="spm-kopf">${schalter('modus', [['kabel', '🔌 Verkabeln'], ['ausfall', '⚡ Ausfall'], ['ansehen', '👁 Ansehen']], modus)}</div>
      <div class="spm-hinweis">${hinweis()}</div>${topoSvg()}
      <div class="spm-knoepfe"><button class="glas knopf klein" data-a="server-dazu">+ Server</button>${Z.server.filter(s => !SRV_BASIS.includes(s)).map(s => `<button class="glas knopf klein" data-a="server-weg" data-v="${s}">− ${s}</button>`).join('')}<button class="glas knopf klein" data-a="spare-dazu">+ Platte (Hot Spare ${rgSicht})</button></div>`;
  }
  function sichtHtml() {
    const h = Z.server.includes(hostSicht) ? hostSicht : (hostSicht = 'HV01');
    const zeilen = Z.luns.map(l => {
      const v = sicht(h, l.n), gemappt = l.map[h] !== undefined;
      const pf = v.pf.filter(p => p.cp || p.grund);
      return `<details class="spm-det" ${gemappt ? 'open' : ''}><summary>${okX(v.ok)} <b>${E(l.n)}</b> <small>${l.gb} GB · ${l.rg}</small> ${v.ok ? `<span class="spm-chip">LUN ${v.id} · ${v.aktiv.length} Pfad(e) · ${v.fabrics} Fabric(s)</span>` : `<span class="spm-chip spm-chip-n">nicht sichtbar</span>`}</summary>
        <ul class="spm-bed">${v.bed.map(b => `<li>${okX(b.ok)} ${E(b.t)}</li>`).join('')}</ul>
        ${gemappt ? `<div class="spm-mpio"><b>Multipath (MPIO)</b> – Besitzer-Controller: ${CTLNAME[v.owner] || '–'}${v.owner !== l.own ? ' (Failover!)' : ''}<ul>${pf.map(p => `<li class="${p.ok ? 'spm-ok' : 'spm-no'}">${p.ok ? '●' : '○'} ${E(portName(p.hp))} → ${p.sw ? SWK[p.sw] : '–'}${p.cp ? ' → ' + E(portName(p.cp)) : ''}: ${p.ok ? (p.opt ? 'aktiv (Active/Optimized)' : 'aktiv (Active/Non-Optimized)') : E(p.grund)}</li>`).join('') || '<li>keine Pfade</li>'}</ul></div>` : ''}</details>`;
    }).join('');
    const n = Z.luns.filter(l => sicht(h, l.n).ok).length;
    return `<h2>Was sieht ${E(h)}?</h2>${schalter('host', Z.server.map(s => [s, s]), h)}
      <p class="klein spm-leise">HBA0 ${wwpn(h, 0)} · HBA1 ${wwpn(h, 1)}</p>
      <p><b>${n}</b> von ${Z.luns.length} LUN(s) sichtbar. Sichtbar nur, wenn <i>Pfad + Zone + Masking</i> passen:</p>${zeilen || '<p class="spm-leise">Noch keine LUNs.</p>'}`;
  }
  function lunHtml() {
    const rgOpt = Z.rgs.map(r => `<option value="${r.id}">${r.id} – RAID ${r.level}, frei ${nutzTB(r.level, r.n, r.tb) * 1000 - belegtGB(r.id)} GB</option>`).join('');
    return `<h2>LUNs & LUN-Masking</h2>
      <div class="spm-form"><label>Name<input id="spm-lname" class="spm-ein" maxlength="24" placeholder="z. B. SQL-DATA"></label><label>Größe (GB)<input id="spm-lgb" class="spm-ein" type="number" min="1" value="500"></label><label>RAID-Gruppe<select id="spm-lrg" class="spm-ein">${rgOpt}</select></label><button class="glas knopf primär" data-a="lun-neu">LUN anlegen</button></div>
      <div class="spm-tw"><table class="spm-tab"><thead><tr><th>LUN</th>${Z.server.map(s => `<th>${s}</th>`).join('')}<th></th></tr></thead><tbody>
      ${Z.luns.map(l => `<tr><td><b>${E(l.n)}</b><br><small>${l.gb} GB · ${l.rg} · ${CTLNAME[l.own]}</small></td>${Z.server.map(s => `<td>${l.map[s] !== undefined ? `<span class="spm-map"><input type="number" min="0" max="255" class="spm-ein spm-id" data-lun="${E(l.n)}" data-host="${s}" value="${l.map[s]}" aria-label="LUN-ID für ${s}"><button class="glas spm-x" data-a="unmap" data-lun="${E(l.n)}" data-host="${s}" title="Freigabe entfernen">✕</button></span>` : `<button class="glas spm-plus" data-a="map" data-lun="${E(l.n)}" data-host="${s}" title="für ${s} freigeben">+</button>`}</td>`).join('')}<td><button class="glas spm-x" data-a="lun-weg" data-lun="${E(l.n)}" title="LUN löschen">🗑</button></td></tr>`).join('') || `<tr><td colspan="${Z.server.length + 2}">Keine LUNs.</td></tr>`}
      </tbody></table></div><p class="klein spm-leise">Zahl = LUN-ID, unter der der Host die LUN sieht. „+“ gibt frei (Masking), „✕“ sperrt.</p>`;
  }
  function zoneHtml() {
    const sw = fabSicht, f = Z.fab[sw];
    const angemeldet = Z.kabel.filter(k => k.sw === sw).map(k => ({ w: wwpnVon(k.port), p: k.port }));
    const geaendert = JSON.stringify(f.zonen) !== JSON.stringify(f.aktiv);
    const zl = (z, akt) => { const ini = z.m.filter(istInitiator).length, tg = z.m.length - ini; const si = ini === 1 && tg >= 1; return `<li><b>${E(z.n)}</b> <span class="spm-chip ${si ? '' : 'spm-chip-n'}">${si ? 'Single-Initiator ✓' : ini > 1 ? `${ini} Initiatoren ✗` : 'ohne Initiator/Target'}</span>${akt ? '' : ` <button class="glas spm-x" data-a="zone-weg" data-v="${E(z.n)}" title="Zone löschen">🗑</button>`}<br><small>${z.m.map(w => `${E(wLabel(w))} <code>${w}</code>`).join(' · ')}</small></li>`; };
    return `<h2>Zoning</h2>${schalter('fab', SW.map(s => [s, SWK[s]]), sw)}
      <p class="klein">Angemeldet an ${SWNAME[sw]} (Fabric Login, FLOGI):</p>
      <div class="spm-mitgl">${angemeldet.map(a => `<label class="glas spm-cb"><input type="checkbox" class="spm-zm" value="${a.w}"> ${E(portName(a.p))} <small>${istInitiator(a.w) ? 'Initiator' : 'Target'} · <code>${a.w}</code></small></label>`).join('') || '<p class="spm-leise">Noch nichts angeschlossen.</p>'}</div>
      <div class="spm-form"><label>Zonenname<input id="spm-zname" class="spm-ein" maxlength="32" value="z_${f.zonen.length + 1}"></label><button class="glas knopf primär" data-a="zone-neu">Zone anlegen</button></div>
      <p class="klein spm-leise">Empfehlung: Single-Initiator-Zoning – je Zone genau ein HBA (Initiator) plus die Controller-Ports (Targets).</p>
      <h3>Definierte Zonen (${f.zonen.length})</h3><ul class="spm-zonen">${f.zonen.map(z => zl(z)).join('') || '<li class="spm-leise">keine</li>'}</ul>
      <div class="spm-aktivbox ${geaendert ? 'spm-geaendert' : ''}"><b>Aktive Zonenkonfiguration:</b> ${f.aktiv.length} Zone(n)${f.aktiv.length ? ': ' + f.aktiv.map(z => E(z.n)).join(', ') : ''}
        ${geaendert ? '<br>⚠ Änderungen sind noch nicht aktiv.' : ''} <button class="glas knopf klein ${geaendert ? 'primär' : ''}" data-a="aktivieren">Konfiguration aktivieren (cfgenable)</button></div>`;
  }
  function ausfallHtml() {
    const opts = [];
    for (const k of Z.kabel) opts.push(['kabel:' + k.id, `Kabel ${portName(k.port)} ↔ ${SWK[k.sw]}`]);
    for (const s of Z.server) for (const p of hbaPorts(s)) opts.push(['hba:' + p, portName(p)]);
    for (const s of SW) opts.push(['sw:' + s, SWNAME[s]]);
    for (const c of CTL) opts.push(['ctl:' + c, CTLNAME[c]]);
    const aus = Object.keys(Z.aus);
    const plattenAusN = Z.rgs.reduce((n, r) => n + fehlend(r), 0);
    return `<h2>Ausfall simulieren</h2>
      <div class="spm-form"><label>Komponente<select id="spm-aus-sel" class="spm-ein">${opts.map(([k, t]) => `<option value="${E(k)}">${Z.aus[k] ? '✗ ' : ''}${E(t)}</option>`).join('')}</select></label><button class="glas knopf" data-a="aus-umschalten">Ausfallen lassen / reparieren</button><button class="glas knopf primär" data-a="heil">Alles wiederherstellen</button></div>
      <p>${aus.length || plattenAusN ? `Ausgefallen: ${aus.map(k => `<span class="spm-chip spm-chip-n">${E(ausName(k))}</span>`).join(' ')}${plattenAusN ? ` <span class="spm-chip spm-chip-n">${plattenAusN} Platte(n)</span>` : ''}` : '<span class="spm-ok">Alles läuft.</span>'}</p>
      <div class="spm-tw"><table class="spm-tab"><thead><tr><th>Host</th>${Z.luns.map(l => `<th>${E(l.n)}</th>`).join('')}</tr></thead><tbody>${Z.server.map(s => `<tr><td>${s}</td>${Z.luns.map(l => { const v = sicht(s, l.n); return `<td>${l.map[s] === undefined ? '<span class="spm-leise">–</span>' : v.ok ? `<span class="spm-ok">✓ ${v.aktiv.length} Pfad${v.aktiv.length === 1 ? '' : 'e'}${v.fabrics < 2 ? ' ⚠' : ''}</span>` : '<span class="spm-no">✗ weg</span>'}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="klein spm-leise">MPIO hält die LUN erreichbar, solange mindestens ein Pfad (HBA → Fabric → Controller) übrig ist. ⚠ = nur eine Fabric, also keine Redundanz.</p>`;
  }
  function blockLabel(r, row, j) {
    const n = r.n;
    if (r.level === 0) return 'D' + (row * n + j);
    if (r.level === 1) return 'D' + row;
    if (r.level === 10) return 'D' + (row * n / 2 + (j >> 1));
    const P = ((n - 1 - row) % n + n) % n, Q = r.level === 6 ? (P + 1) % n : -1;
    if (j === P) return 'P'; if (j === Q) return 'Q';
    let k = 0; for (let x = 0; x < j; x++) if (x !== P && x !== Q) k++;
    return 'D' + (row * (n - (r.level === 6 ? 2 : 1)) + k);
  }
  const hex = v => '0x' + (v & 255).toString(16).toUpperCase().padStart(2, '0');
  function xorText(r) {
    if (!r.rb) return '';
    const row = Math.min(ZEILEN - 1, Math.floor(r.rb.p * ZEILEN)), i = r.rb.i;
    if (r.level === 1 || r.level === 10) { const partner = r.level === 1 ? (i === 0 ? 1 : 0) : (i ^ 1); return `Rebuild = Kopie: Block ${blockLabel(r, row, i)} wird 1:1 von Spiegelpartner Platte ${partner} gelesen.`; }
    const wert = j => ((row + 1) * 53 + (j + 1) * 29 + r.n * 7) & 255;
    const P = ((r.n - 1 - row) % r.n + r.n) % r.n;
    const val = j => { if (j !== P) return wert(j); let x = 0; for (let k = 0; k < r.n; k++) if (k !== P && (r.level !== 6 || k !== (P + 1) % r.n)) x ^= wert(k); return x; };
    if (r.level === 6) return `Zeile ${row + 1}: ${blockLabel(r, row, i)} wird aus den übrigen Blöcken berechnet – P per XOR (⊕), Q per Reed-Solomon-Code (Galois-Feld). Deshalb darf bei RAID 6 auch während des Rebuilds noch eine Platte ausfallen.`;
    const andere = []; for (let k = 0; k < r.n; k++) if (k !== i) andere.push(k);
    const erg = andere.reduce((x, k) => x ^ val(k), 0);
    return `<b>XOR-Rekonstruktion (Zeile ${row + 1}):</b> ${blockLabel(r, row, i)} = ${andere.map(k => `${blockLabel(r, row, k)} (${hex(val(k))})`).join(' ⊕ ')} = <b>${hex(erg)}</b><br><small>Parität P = XOR aller Datenblöcke. Fehlt ein Block, ergibt das XOR der übrigen genau den fehlenden – dafür müssen ALLE anderen Platten fehlerfrei gelesen werden.</small>`;
  }
  function raidHtml() {
    const r = rg(rgSicht) || Z.rgs[0], st = rgStatus(r), nutz = nutzTB(r.level, r.n, r.tb), brutto = r.n * r.tb;
    const done = r.rb ? Math.floor(r.rb.p * ZEILEN) : 0;
    const kacheln = r.d.map((s, j) => {
      const bl = []; for (let row = 0; row < ZEILEN; row++) {
        const lab = blockLabel(r, row, j), par = /^[PQ]$/.test(lab);
        let k = par ? 'spm-b-par' : 'spm-b-dat', txt = lab;
        if (s === 'aus' || s === 'warte') { k = 'spm-b-weg'; txt = s === 'warte' ? '…' : '✗'; }
        else if (s === 'rebuild') { if (row < done) k += ' spm-b-neu'; else if (row === done) { k = 'spm-b-akt'; txt = lab; } else { k = 'spm-b-weg'; txt = '…'; } }
        bl.push(`<i class="spm-b ${k}">${txt}</i>`);
      }
      const knopf = r.tot ? '' : s === 'aus' ? `<button class="glas knopf klein" data-a="tauschen" data-v="${j}">Tauschen</button>` : s === 'ok' ? `<button class="glas knopf klein" data-a="platte-aus" data-v="${j}">Ausfall</button>` : '';
      return `<div class="spm-platte spm-p-${s}"><div class="spm-pkopf">Platte ${j}<br><small>${{ ok: 'online', aus: 'DEFEKT', warte: 'neu, wartet', rebuild: 'Rebuild' }[s]}</small></div>${bl.join('')}${knopf}</div>`;
    }).join('');
    const lvOpt = LEVELS.map(l => `<option value="${l}" ${l === r.level ? 'selected' : ''}>RAID ${l}</option>`).join('');
    const nOpt = [2, 3, 4, 5, 6, 7, 8].map(n => `<option ${n === r.n ? 'selected' : ''}>${n}</option>`).join('');
    const tbOpt = TB_WAHL.map(t => `<option value="${t}" ${t === r.tb ? 'selected' : ''}>${t} TB</option>`).join('');
    return `<h2>RAID-Labor</h2>${schalter('rg', Z.rgs.map(x => [x.id, `${x.id} · RAID ${x.level}`]), r.id)}
      <div class="spm-raidinfo"><div><b>RAID ${r.level}</b> · ${r.n} × ${r.tb} TB</div><div>Nutzkapazität <b>${nutz} TB</b> <small>(brutto ${brutto} TB, ${Math.round(nutz / brutto * 100)} %)</small></div><div>verkraftet: ${toleranz(r.level)}</div><div>Hot Spares: ${r.spare}</div><div>Status: <b class="${st.k}">${st.t}</b></div><div>LUNs: ${Z.luns.filter(l => l.rg === r.id).map(l => E(l.n)).join(', ') || '–'}</div></div>
      ${r.rb ? `<div class="spm-rbbalken"><div class="spm-rbtxt">Rebuild Platte ${r.rb.i}: ${Math.floor(r.rb.p * 100)} %</div><div class="spm-bar"><i style="width:${(r.rb.p * 100).toFixed(1)}%"></i></div></div><div class="spm-xor">${xorText(r)}</div>` : ''}
      ${r.tot ? `<div class="spm-tot">💥 Datenverlust in ${r.id}: ${r.level === 0 ? 'RAID 0 hat keine Redundanz.' : r.level === 5 ? 'Zweiter Ausfall bevor der Rebuild fertig war – RAID 5 verkraftet nur eine Platte.' : 'Mehr Platten ausgefallen als die Redundanz erlaubt.'} LUNs auf ${r.id} sind weg. <button class="glas knopf klein primär" data-a="backup">Neue Platten + Backup zurückspielen</button></div>` : ''}
      <div class="spm-platten" style="--n:${r.n}">${kacheln}</div>
      <details class="spm-det"><summary>RAID-Gruppe umbauen (löscht Daten der Gruppe, nur wenn LUNs hineinpassen)</summary><div class="spm-form"><label>Level<select id="spm-rlevel" class="spm-ein">${lvOpt}</select></label><label>Platten<select id="spm-rn" class="spm-ein">${nOpt}</select></label><label>Größe<select id="spm-rtb" class="spm-ein">${tbOpt}</select></label><label>Hot Spares<select id="spm-rsp" class="spm-ein">${[0, 1, 2, 3].map(x => `<option ${x === r.spare ? 'selected' : ''}>${x}</option>`).join('')}</select></label><button class="glas knopf" data-a="rg-neu">Neu aufbauen</button></div>
      <p class="klein spm-leise">Formeln: RAID 0 = n × G · RAID 1 = 1 × G · RAID 5 = (n − 1) × G · RAID 6 = (n − 2) × G · RAID 10 = n / 2 × G</p></details>`;
  }
  function aufgabenHtml() {
    const g = P().geloest, n = AUFGABEN.filter(a => g[a.id]).length, pz = Math.round(n / AUFGABEN.length * 100);
    const STU = { 1: 'leicht', 2: 'mittel', 3: 'schwer' };
    return `<h2>Aufgaben <small>${n}/${AUFGABEN.length} gelöst</small></h2><div class="spm-bar spm-fort"><i style="width:${pz}%"></i></div>
      <ol class="spm-aufg">${AUFGABEN.map(a => `<li class="glas spm-a ${g[a.id] ? 'spm-a-ok' : ''}" data-aid="${a.id}"><div class="spm-a-kopf"><span class="spm-stufe spm-st${a.st}">${STU[a.st]}</span>${g[a.id] ? `<span class="spm-ok">✓ gelöst am ${E(g[a.id])}</span>` : '<span class="spm-leise">offen</span>'}</div><div>${E(a.t)}</div>
        ${a.antwort !== undefined && !g[a.id] ? `<div class="spm-form"><input class="spm-ein spm-antw" id="spm-antw-${a.id}" inputmode="decimal" placeholder="TB"><button class="glas knopf klein" data-a="antwort" data-v="${a.id}">Prüfen</button></div>` : ''}
        <details><summary class="klein">Tipp</summary><p class="klein">${E(a.tipp)}</p></details></li>`).join('')}</ol>`;
  }
  const LEGENDE = [
    ['SAN (Storage Area Network)', 'Eigenes, schnelles Netz nur für Speicherzugriffe auf Blockebene – Server sehen entfernte Platten wie lokale.', 'Server (Initiatoren) sprechen per Fibre Channel (FC) oder iSCSI über Switches (Fabrics) mit dem Storage-Array (Target). Protokoll: SCSI-Befehle in FC-Frames.', 'Wenn viele Server zentral, hochverfügbar und schnell auf Speicher zugreifen müssen (Virtualisierung, Datenbanken, Cluster).', 'Rechenzentrum: Server ↔ zwei getrennte Fabrics A/B ↔ Storage-Array.', 'Zentral verwaltbar, Live-Migration und Cluster möglich, hohe Leistung, Ausfallsicherheit durch Redundanz.'],
    ['LUN (Logical Unit Number)', 'Ein logisches Laufwerk, das das Storage-Array aus einer RAID-Gruppe herausschneidet und einem Host anbietet.', 'Im Array anlegen (Name, Größe, RAID-Gruppe), per Masking einem Host mit einer LUN-ID zuordnen; der Host sieht sie als „Datenträger“ und formatiert sie (z. B. NTFS/ReFS, CSV).', 'Für jedes Volume, das ein Server oder Cluster braucht – z. B. VM-Speicher, SQL-Daten, Log-Laufwerk.', 'Im Storage-Array; Anzeige am Host in der Datenträgerverwaltung (diskmgmt.msc) bzw. Get-Disk.', 'Trennt physische Platten von logischen Volumes: Größe, Leistung und Zugriff sind pro LUN steuerbar.'],
    ['LUN-Masking', 'Zugriffskontrolle im Storage-Array: welche Host-WWPNs welche LUN sehen dürfen (auch Host-Gruppe/Mapping genannt).', 'Host-Gruppe mit den WWPNs der HBAs anlegen, LUN zuordnen und eine LUN-ID vergeben. Im Cluster alle Knoten mit derselben LUN-ID.', 'Immer, sobald mehrere Hosts am SAN hängen – nie eine LUN „für alle“ freigeben.', 'Auf dem Storage-Controller (Array-Verwaltung).', 'Verhindert, dass ein fremder Server (z. B. Windows ohne Cluster) eine LUN initialisiert und Daten zerstört. Ergänzt Zoning (zweite Schutzschicht).'],
    ['Zoning', 'Zugriffskontrolle im FC-Switch: nur Ports/WWPNs in derselben Zone dürfen miteinander reden.', 'Zone mit Mitgliedern (WWPNs) anlegen, Zonen zu einer Konfiguration (Zoneset) bündeln und diese aktivieren (cfgenable). Best Practice: Single-Initiator-Zoning (ein HBA + Targets je Zone).', 'Beim Anschluss jedes neuen Servers oder Storage-Ports an die Fabric.', 'Auf jedem FC-Switch bzw. pro Fabric (A und B getrennt pflegen).', 'Begrenzt Störungen (RSCN-Meldungen) und unberechtigte Zugriffe; Single-Initiator verhindert, dass sich HBAs gegenseitig stören.'],
    ['WWPN (World Wide Port Name)', 'Weltweit eindeutige 64-Bit-Adresse eines FC-Ports, geschrieben als 8 Hex-Bytes (z. B. 10:00:00:90:fa:11:01:00) – vergleichbar mit einer MAC-Adresse.', 'Vom Hersteller fest vergeben (bei virtuellen HBAs/NPIV auch generiert). Wird beim Fabric-Login (FLOGI) am Switch bekannt.', 'Beim Zoning und Masking – überall dort, wo ein Port eindeutig benannt werden muss.', 'HBA-BIOS, Get-InitiatorPort (PowerShell), Switch-Anzeige (nameserver), Storage-Verwaltung.', 'Eindeutige Identität: Zonen und Host-Gruppen beziehen sich auf WWPNs, nicht auf Servernamen.'],
    ['HBA (Host Bus Adapter)', 'Steckkarte im Server, die ihn an das SAN anschließt (FC-HBA oder iSCSI-Adapter) – der „Netzwerkkarte“ fürs Speichernetz entsprechend.', 'Verarbeitet SCSI/FC-Protokoll in Hardware; jeder Port hat eine WWPN. Für Redundanz zwei Ports/Karten, je einer pro Fabric.', 'In jedem Server, der LUNs aus dem SAN nutzt.', 'Im PCIe-Slot des Servers; Kabel (meist LWL/Glasfaser) zum FC-Switch.', 'Entlastet die CPU und bietet zwei unabhängige Wege zum Speicher.'],
    ['Multipath / MPIO (Multipath I/O)', 'Treiberschicht, die mehrere Pfade zur selben LUN zu einem Datenträger zusammenfasst.', 'Erkennt die LUN über jeden Pfad, zeigt sie nur einmal an, verteilt I/Os (Round Robin/ALUA: Active/Optimized bevorzugt) und schaltet bei Pfadausfall automatisch um (Failover).', 'Sobald ein Host über mehr als einen Pfad (2 HBAs, 2 Fabrics, 2 Controller) angebunden ist.', 'Auf dem Host: Windows-Feature „Multipath I/O“ (mpclaim, Get-MSDSMSupportedHW), Linux dm-multipath.', 'Ohne MPIO sähe der Host die LUN doppelt (Datenkorruption möglich) und hätte keinen automatischen Failover.'],
    ['RAID-Level (Redundant Array of Independent Disks)', 'Verfahren, mehrere Platten zu einer logischen Einheit zu verbinden: RAID 0 (Striping), 1 (Spiegel), 5 (einfache Parität), 6 (doppelte Parität), 10 (Spiegel + Stripe).', 'Daten werden in Blöcken (Stripes) verteilt; Parität per XOR (RAID 5) bzw. P+Q (RAID 6). Nutzkapazität: 0 = n, 1 = 1, 5 = n − 1, 6 = n − 2, 10 = n / 2 Platten.', 'Bei der Planung jeder RAID-Gruppe: Leistung vs. Kapazität vs. Ausfallsicherheit abwägen; große Platten → RAID 6 wegen langer Rebuilds.', 'Im Storage-Array (Controller) oder im Server (Hardware-RAID-Controller, Storage Spaces).', 'Schützt vor Plattenausfall und erhöht Leistung – ersetzt aber KEIN Backup (Löschen, Ransomware, Brand).'],
    ['Hot Spare', 'Eingebaute, unbenutzte Reserveplatte, die bei einem Plattenausfall automatisch einspringt.', 'Controller erkennt den Ausfall, nimmt die Spare in die RAID-Gruppe auf und startet sofort den Rebuild; die defekte Platte wird später getauscht.', 'Immer bei produktiven RAID-Gruppen, besonders wenn niemand sofort vor Ort tauschen kann.', 'Im Plattenfach des Arrays (global für alle oder dediziert pro RAID-Gruppe).', 'Verkürzt die gefährliche Zeit im degradierten Zustand – ein zweiter Ausfall vor dem Rebuild wäre bei RAID 5 Datenverlust.'],
    ['Rebuild (Wiederaufbau)', 'Wiederherstellen der Daten einer ausgefallenen Platte auf eine neue/Hot-Spare-Platte.', 'RAID 1/10: Kopie vom Spiegelpartner. RAID 5: jeder fehlende Block = XOR aller anderen Blöcke der Zeile. RAID 6: über P und Q. Alle übrigen Platten werden komplett gelesen.', 'Nach Plattentausch oder automatisch mit Hot Spare; dauert bei großen Platten Stunden bis Tage.', 'Läuft im RAID-Controller des Arrays, Fortschritt in der Verwaltung sichtbar.', 'Stellt Redundanz wieder her. Währenddessen hohe Last und Risiko: ein weiterer Ausfall (oder Lesefehler, URE) zerstört ein RAID 5 – Grund für RAID 6.']
  ];
  function legendeHtml() {
    return `<h2>Legende</h2>${LEGENDE.map(([b, was, wie, wann, wo, warum]) => `<details class="abschnitt spm-leg"><summary>${E(b)}</summary><div class="text"><ul><li><b>Was:</b> ${E(was)}</li><li><b>Wie:</b> ${E(wie)}</li><li><b>Wann:</b> ${E(wann)}</li><li><b>Wo:</b> ${E(wo)}</li><li><b>Warum:</b> ${E(warum)}</li></ul></div></details>`).join('')}`;
  }
  function zeichne() {
    const w = document.getElementById('spm-wurzel'); if (!w || !Z) return;
    w.innerHTML = `<div class="spm-raster"><section class="spm-karte" id="spm-topo">${topoHtml()}</section><section class="spm-karte" id="spm-sicht">${sichtHtml()}</section></div>
      <div class="spm-raster"><section class="spm-karte" id="spm-lun">${lunHtml()}</section><section class="spm-karte" id="spm-zone">${zoneHtml()}</section></div>
      <section class="spm-karte" id="spm-ausfall">${ausfallHtml()}</section>
      <section class="spm-karte" id="spm-raid">${raidHtml()}</section>
      <section class="spm-karte" id="spm-aufgaben">${aufgabenHtml()}</section>
      <section class="spm-karte" id="spm-legende">${legendeHtml()}</section>
      <div class="lesen-fuss"><button class="glas knopf" data-a="reset">Labor zurücksetzen</button><button class="glas knopf" data-go="werkzeuge">Zu den Werkzeugen</button></div>`;
    const g = document.getElementById('spm-io'); if (g) punkte(g, performance.now());
    animStart(); timerStart();
  }

  // ---------- Ereignisse ----------
  function klick(e) {
    const t = e.target; if (!t.closest) return;
    const b = t.closest('[data-modus],[data-host]:not(input):not(.spm-x):not(.spm-plus),[data-fab],[data-rg],[data-a],[data-port],[data-sw],[data-kabel],[data-ctl],[data-disk]');
    if (!b || !document.getElementById('spm-wurzel').contains(b)) return;
    const d = b.dataset;
    if (d.a) return aktion(d.a, b);
    if (d.modus) { modus = d.modus; auswahl = null; return zeichne(); }
    if (d.fab) { fabSicht = d.fab; return zeichne(); }
    if (d.rg) { rgSicht = d.rg; return zeichne(); }
    if (d.host && b.closest('.spm-schalter')) { hostSicht = d.host; return zeichne(); }
    // Topologie
    if (d.port) {
      if (modus === 'ausfall') return d.port.startsWith('CTL') ? umschalten('ctl:' + d.port.split('.')[0]) : umschalten('hba:' + d.port);
      if (modus === 'kabel') { auswahl = auswahl === d.port ? null : d.port; if (auswahl && auswahlSw) { const s = auswahlSw; auswahlSw = null; return kabelNeu(auswahl, s); } return zeichne(); }
      const k = kabelAn(d.port); toast(`${portName(d.port)} · WWPN ${wwpnVon(d.port)}${k ? ' · an ' + SWK[k.sw] : ' · nicht verkabelt'}`); return;
    }
    if (d.sw) {
      if (modus === 'ausfall') return umschalten('sw:' + d.sw);
      if (modus === 'kabel') { if (auswahl) return kabelNeu(auswahl, d.sw); auswahlSw = d.sw; return toast(`${SWK[d.sw]} gewählt – jetzt einen Port antippen.`); }
      fabSicht = d.sw; zeichne(); return hinScrollen('spm-zone');
    }
    if (d.kabel) { if (modus === 'ausfall') return umschalten('kabel:' + d.kabel); if (modus === 'kabel') return kabelWeg(d.kabel); return; }
    if (d.ctl) { if (modus === 'ausfall') return umschalten('ctl:' + d.ctl); return toast(`${CTLNAME[d.ctl]} – 2 FC-Ports (Targets)`); }
    if (d.disk) { const [id, i] = d.disk.split(':'); const r = rg(id); if (!r) return; rgSicht = id; if (modus === 'ausfall') return plattenAus(r, +i); zeichne(); return hinScrollen('spm-raid'); }
    if (d.host) { hostSicht = d.host; zeichne(); if (modus === 'ansehen') hinScrollen('spm-sicht'); }
  }
  let auswahlSw = null;
  function hinScrollen(id) { const el = document.getElementById(id); if (el && el.scrollIntoView) try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch {} }
  const wert = id => { const el = document.getElementById(id); return el ? el.value : ''; };
  function aktion(a, b) {
    const d = b.dataset, r = rg(rgSicht) || Z.rgs[0];
    switch (a) {
      case 'server-dazu': return serverDazu();
      case 'server-weg': return serverWeg(d.v);
      case 'spare-dazu': return spareDazu(r);
      case 'lun-neu': return lunNeu(wert('spm-lname'), wert('spm-lgb'), wert('spm-lrg'));
      case 'map': return mappen(d.lun, d.host, true);
      case 'unmap': return mappen(d.lun, d.host, false);
      case 'lun-weg': return lunWeg(d.lun);
      case 'zone-neu': return zoneNeu(fabSicht, wert('spm-zname'), [...document.querySelectorAll('#spm-zone .spm-zm:checked')].map(x => x.value));
      case 'zone-weg': return zoneWeg(fabSicht, d.v);
      case 'aktivieren': return aktivieren(fabSicht);
      case 'aus-umschalten': return umschalten(wert('spm-aus-sel'));
      case 'heil': return allesHeil();
      case 'platte-aus': return plattenAus(r, +d.v);
      case 'tauschen': return tauschen(r, +d.v);
      case 'backup': return backup(r);
      case 'rg-neu': return rgNeu(r, wert('spm-rlevel'), wert('spm-rn'), wert('spm-rtb'), wert('spm-rsp'));
      case 'antwort': {
        const auf = AUFGABEN.find(x => x.id === d.v); if (!auf) return;
        const v = parseFloat(String(wert('spm-antw-' + d.v)).replace(',', '.').replace(/[^\d.]/g, ''));
        if (!Number.isFinite(v)) return toast('Bitte eine Zahl in TB eingeben.');
        Z.antw[d.v] = v;
        if (v !== auf.antwort) { sichern(); return toast(`${v} TB stimmt nicht. ${auf.tipp}`, 'rot'); }
        return aenderung('Richtig gerechnet!');
      }
      case 'reset':
        if (!confirm('Labor auf den Startzustand zurücksetzen? (Gelöste Aufgaben bleiben gelöst.)')) return;
        timerStop(); Z = start(); auswahl = null; hostSicht = 'HV01'; fabSicht = 'FCA'; rgSicht = 'RG1';
        return aenderung('Speicher-Labor zurückgesetzt.');
    }
  }
  function aenderungEingabe(e) {
    const t = e.target;
    if (t.classList && t.classList.contains('spm-id')) setzeId(t.dataset.lun, t.dataset.host, t.value);
  }

  // ---------- CSS ----------
  function stil() {
    if (document.getElementById('spm-style')) return;
    const st = document.createElement('style'); st.id = 'spm-style';
    st.textContent = `
#spm-wurzel{min-width:0;max-width:100%}
.spm-raster{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:14px;margin:0 0 14px}
.spm-raster>*{min-width:0}
.spm-karte{background:var(--glas);border:1px solid var(--glas-rand);border-radius:var(--radius-klein);padding:12px 14px;margin:0 0 14px;min-width:0;overflow-wrap:anywhere}
.spm-raster>.spm-karte{margin:0}
.spm-karte h2{margin:2px 0 10px}
.spm-kopf{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.spm-schalter{flex-wrap:wrap;max-width:100%;border-radius:16px;margin:0 0 8px}
.spm-schalter button{padding:6px 12px}
.spm-hinweis{font-size:14px;color:var(--tinte-leise);margin:4px 0 6px;min-height:2.6em}
#spm-svg{width:100%;height:auto;max-height:72vh;display:block;touch-action:manipulation;user-select:none;-webkit-user-select:none}
#spm-svg text{fill:var(--tinte);font-family:var(--text);text-anchor:middle;pointer-events:none}
#spm-svg .spm-t1{font-size:13px;font-weight:700}
#spm-svg .spm-t2{font-size:10.5px;fill:var(--tinte-leise)}
#spm-svg .spm-t3{font-size:9px;fill:var(--tinte-leise)}
#spm-svg .spm-li{text-anchor:start}
#spm-svg .spm-akz{fill:var(--akzent);font-weight:700}
#spm-svg .spm-rotf{fill:var(--rot);font-size:16px}
#spm-svg [data-rg]{pointer-events:auto;cursor:pointer}
.spm-srv rect,.spm-sw rect,.spm-ctl rect{fill:var(--code-bg);stroke:var(--glas-rand);stroke-width:1.5;cursor:pointer}
.spm-srv.spm-sel rect{stroke:var(--akzent);stroke-width:2.5}
.spm-sw.spm-fa rect{stroke:var(--blau)}.spm-sw.spm-fb rect{stroke:var(--gruen)}
.spm-sw.spm-ziel rect{stroke-dasharray:5 3;stroke-width:2.5;stroke:var(--akzent)}
.spm-array{fill:none;stroke:var(--glas-rand);stroke-width:1.5;stroke-dasharray:4 3}
.spm-port circle{fill:var(--grund2,#123);stroke:var(--tinte-leise);stroke-width:2;cursor:pointer}
.spm-port text{font-size:10px;font-weight:700}
.spm-port.spm-belegt circle{stroke:var(--akzent)}
.spm-port.spm-sel circle{fill:var(--akzent);stroke:var(--akzent)}
.spm-port.spm-sel text{fill:var(--grund2,#000)}
.spm-aus rect,.spm-port.spm-aus circle{stroke:var(--rot)!important;stroke-dasharray:3 3}
.spm-aus text{fill:var(--rot)!important}
.spm-kabel{cursor:pointer}
.spm-kabel .spm-hit{stroke:transparent;stroke-width:16}
.spm-kabel .spm-ader{stroke-width:3;stroke-linecap:round}
.spm-kabel.spm-fa .spm-ader{stroke:var(--blau)}.spm-kabel.spm-fb .spm-ader{stroke:var(--gruen)}
.spm-kabel.spm-aus .spm-ader{stroke:var(--rot);stroke-dasharray:6 5}
.spm-kabel:hover .spm-ader{stroke-width:5}
.spm-disk{stroke:var(--glas-rand);cursor:pointer}
.spm-d-ok{fill:var(--gruen);opacity:.75}.spm-d-aus{fill:var(--rot)}.spm-d-warte{fill:var(--tinte-leise)}.spm-d-rebuild{fill:var(--akzent);animation:spm-blink 1s infinite}.spm-d-hs{fill:var(--glas-hover);stroke-dasharray:3 2}
.spm-io{fill:var(--akzent);pointer-events:none}.spm-io-n{fill:var(--tinte);opacity:.7}
@keyframes spm-blink{50%{opacity:.4}}
@keyframes spm-pop{0%{transform:scale(.4);background:var(--akzent)}100%{transform:scale(1)}}
.spm-knoepfe{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.spm-leise{color:var(--tinte-leise)}
.spm-ok{color:var(--gruen);font-weight:700}.spm-no{color:var(--rot);font-weight:700}.spm-warn{color:var(--akzent);font-weight:700}
.spm-chip{display:inline-block;font-size:12.5px;border:1px solid var(--gruen);color:var(--gruen);border-radius:12px;padding:1px 8px;margin:2px 0}
.spm-chip-n{border-color:var(--rot);color:var(--rot)}
.spm-det{border:1px solid var(--glas-rand);border-radius:8px;margin:8px 0;padding:6px 10px;background:var(--code-bg)}
.spm-det>summary{cursor:pointer}
.spm-bed,.spm-mpio ul,.spm-zonen{list-style:none;padding-left:4px;margin:6px 0}
.spm-bed li,.spm-mpio li,.spm-zonen li{margin:4px 0;font-size:14.5px}
.spm-mpio{font-size:14.5px;border-top:1px dashed var(--glas-rand);padding-top:6px}
.spm-mpio li{font-weight:400}
.spm-form{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end;margin:8px 0}
.spm-form label{display:flex;flex-direction:column;font-size:13px;color:var(--tinte-leise);gap:3px;min-width:0;flex:1 1 120px}
.spm-ein{background:var(--code-bg);border:1px solid var(--glas-rand);color:var(--tinte);border-radius:8px;padding:8px 10px;font:inherit;min-width:0;max-width:100%;box-sizing:border-box}
.spm-ein:focus{outline:2px solid var(--akzent);outline-offset:1px}
.spm-tw{overflow-x:auto;max-width:100%;-webkit-overflow-scrolling:touch}
.spm-tab{border-collapse:collapse;font-size:14px;min-width:100%}
.spm-tab th,.spm-tab td{border-bottom:1px solid var(--glas-rand);padding:6px;text-align:left;vertical-align:middle;white-space:nowrap}
.spm-map{display:inline-flex;gap:3px;align-items:center}
.spm-id{width:58px;padding:5px 6px}
.spm-x,.spm-plus{min-width:34px;min-height:34px;padding:2px 6px;font-weight:700}
.spm-plus{color:var(--gruen)}
.spm-mitgl{display:flex;flex-direction:column;gap:6px}
.spm-cb{display:flex;gap:8px;align-items:center;padding:8px 10px;cursor:pointer;flex-wrap:wrap}
.spm-cb:hover{transform:none}
.spm-cb input{width:20px;height:20px;flex:none}
.spm-zonen code,.spm-cb code{font-family:var(--mono);font-size:11.5px;word-break:break-all}
.spm-aktivbox{border:1px solid var(--glas-rand);border-radius:8px;padding:8px 10px;margin-top:8px}
.spm-geaendert{border-color:var(--akzent)}
.spm-raidinfo{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:4px 14px;margin:8px 0;font-size:14.5px}
.spm-platten{display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:6px;margin:10px 0}
.spm-platte{border:1px solid var(--glas-rand);border-radius:8px;padding:5px;display:flex;flex-direction:column;gap:3px;min-width:0;background:var(--code-bg)}
.spm-p-aus{border-color:var(--rot)}.spm-p-rebuild{border-color:var(--akzent)}
.spm-pkopf{font-size:12px;text-align:center;line-height:1.2}
.spm-b{display:block;font-style:normal;text-align:center;font-family:var(--mono);font-size:12px;border-radius:4px;padding:3px 0;overflow:hidden}
.spm-b-dat{background:rgba(120,170,255,.25)}
.spm-b-par{background:rgba(243,216,106,.35);font-weight:700}
.spm-b-weg{background:transparent;border:1px dashed var(--glas-rand);color:var(--tinte-leise)}
.spm-b-neu{animation:spm-pop .5s ease-out;outline:1px solid var(--gruen)}
.spm-b-akt{background:var(--akzent);color:var(--grund2,#000);animation:spm-blink .6s infinite}
.spm-platte .knopf{padding:6px 4px;font-size:12.5px;min-height:36px}
.spm-bar{height:10px;border-radius:6px;background:var(--glas-rand);overflow:hidden}
.spm-bar i{display:block;height:100%;background:var(--gruen);transition:width .12s linear}
.spm-fort{margin:0 0 10px}
.spm-rbbalken{margin:8px 0}.spm-rbtxt{font-size:14px;margin-bottom:3px}
.spm-xor{font-size:14px;background:var(--code-bg);border-left:3px solid var(--akzent);padding:8px 10px;border-radius:6px;font-family:var(--mono);overflow-wrap:anywhere}
.spm-xor small{font-family:var(--text)}
.spm-tot{border:1px solid var(--rot);color:var(--rot);border-radius:8px;padding:8px 10px;margin:8px 0;background:rgba(255,100,110,.08)}
.spm-aufg{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px}
.spm-a{padding:10px 12px;cursor:default}.spm-a:hover{transform:none}
.spm-a-ok{border-color:var(--gruen)}
.spm-a-kopf{display:flex;justify-content:space-between;gap:6px;margin-bottom:4px;font-size:13px}
.spm-stufe{border-radius:10px;padding:0 8px;font-size:12px;border:1px solid}
.spm-st1{color:var(--gruen)}.spm-st2{color:var(--akzent)}.spm-st3{color:var(--rot)}
.spm-antw{width:90px;flex:0 1 90px}
.spm-leg ul{padding-left:18px}.spm-leg li{margin:4px 0}
@media (max-width:820px){
 .spm-raster{grid-template-columns:minmax(0,1fr)}
 .spm-karte{padding:10px}
 .spm-platten{gap:3px}
 .spm-b{font-size:10px}
 .spm-pkopf{font-size:10.5px}
 .spm-platte .knopf{font-size:11px;padding:4px 2px}
 .spm-aufg{grid-template-columns:minmax(0,1fr)}
}`;
    document.head.appendChild(st);
  }

  // ---------- Ansicht ----------
  function ansicht() {
    krumen([START, { txt: 'Werkzeuge', go: 'werkzeuge' }, { txt: 'Speicher-Labor' }]);
    stil();
    if (raf) { cancelAnimationFrame(raf); raf = 0; } timerStop();
    laden();
    $('#inhalt').innerHTML = `<h1>Speicher-Labor</h1>
      <p class="unter">SAN zum Anfassen: Server mit HBAs, zwei FC-Fabrics, Storage-Array mit Controllern und RAID-Gruppen. Verkabeln, Zonen bauen, LUNs maskieren, Ausfälle simulieren und RAID-Rebuilds beobachten.</p>
      <div id="spm-wurzel"></div>`;
    const w = $('#spm-wurzel');
    w.addEventListener('click', klick);
    w.addEventListener('change', aenderungEingabe);
    w.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'spm-lname') aktion('lun-neu', { dataset: {} }); });
    pruefe(true);
    zeichne();
  }

  window.VIEWS = Object.assign(window.VIEWS || {}, { speicher: ansicht });
  return {
    ansicht, AUFGABEN, nutzTB,
    _test: {
      z: () => Z, sicht: (h, l, x) => { const v = sicht(h, l, x); return { ok: v.ok, aktiv: v.aktiv.length, fabrics: v.fabrics, bed: v.bed }; },
      schnell: f => { tempo = Math.max(0.1, Math.min(500, +f || 1)); },
      rebuildFertig: () => { for (const r of Z.rgs) if (r.rb) r.rb.p = 1; tick(); },
      laeuft: () => ({ raf: !!raf, timer: !!rbTimer }),
      normal, start, pruefe
    }
  };
})();
window.Speicher = Speicher;
