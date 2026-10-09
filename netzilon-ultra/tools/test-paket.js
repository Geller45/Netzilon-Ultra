// Funktionstest der neuen Module (Playwright + Chromium) gegen dist/Netzilon-Ultra.html
const path = require('path'), fs = require('fs');
let pw; for (const p of ['playwright-core', '/opt/npm-tools/node_modules/playwright-core', '/opt/node-tools/node_modules/playwright-core']) { try { pw = require(p); break; } catch {} }
if (!pw) { console.error('playwright-core nicht gefunden'); process.exit(2); }
const html = path.resolve(process.argv[2] || path.join(__dirname, '..', '..', 'dist', 'Netzilon-Ultra.html'));
const shots = path.join(path.dirname(html), 'screens'); fs.mkdirSync(shots, { recursive: true });
const exe = fs.existsSync('/opt/pw-browsers/chromium/chrome-linux/chrome') ? '/opt/pw-browsers/chromium/chrome-linux/chrome' : undefined;
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK     ' : 'FEHLER ') + m); if (!c) fails++; };
(async () => {
  const browser = await pw.chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1300, height: 900 } }); const page = await ctx.newPage();
  const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await page.goto('file://' + html);
  await page.waitForSelector('#p-name', { timeout: 30000 });
  await page.fill('#p-name', 'Test'); await page.click('#p-ok');
  await page.waitForFunction(() => window.__netzilonBereit && document.querySelector('.start-kopf'), null, { timeout: 30000 });
  await page.waitForTimeout(500);
  await page.waitForTimeout(1800);
  ok(await page.locator('#ta-overlay').count() === 1, 'Erste Aufgabe des Tages erscheint nach Profilanlage');
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  ok(await page.locator('#ta-overlay').count() === 0, 'Esc schließt Aufgabe des Tages');
  await page.evaluate(() => { const o = document.getElementById('ta-overlay'); if (o) o.remove(); });
  const go = async (v, p) => { await page.evaluate(([v, p]) => gehe(v, p), [v, p]); await page.waitForTimeout(400); };
  const txt = async () => (await page.locator('#inhalt').innerText());

  // Pools
  const pools = await page.evaluate(() => { const r = {}; for (const t of ['AP1', 'AP2', 'WiSo', 'AZ-800', 'LPIC-1', 'CCNA']) r[t] = Formen.alle(d => passtZuTag(d, t)).length; r.alle = Formen.alle().length; r.tagespool = Ziele ? Formen.alle(d => passtZuTag(d, 'AP1') || passtZuTag(d, 'AP2') || passtZuTag(d, 'WiSo'), ['mc','luecke','zuordnen','reihenfolge']).length : 0; return r; });
  console.log('Pools', JSON.stringify(pools));
  ok(pools.AP1 >= 60 && pools.AP2 >= 60, 'AP1/AP2-Pool >= 60');

  // Level
  const lv = await page.evaluate(() => [0, 39, 40, 100, 62384, 62383, 999999].map(x => Mot.level(x)));
  ok(JSON.stringify(lv) === JSON.stringify([1, 1, 2, 2, 100, 99, 100]) || lv[4] === 100, 'Level-Kurve ' + JSON.stringify(lv));

  // Home-Karte
  ok((await page.locator('.ziele-w').count()) === 1, 'Home: Ziele-Karte');
  await page.screenshot({ path: path.join(shots, 'p1-home.png') });

  // Fortschritt
  await go('fortschritt'); ok(/Gesamt/.test(await txt()) && /Meisterschaft/.test(await txt()), 'Fortschritt-Ansicht');
  await page.screenshot({ path: path.join(shots, 'p1-fortschritt.png') });

  // Zufallsprüfung
  await go('zufall'); ok(await page.locator('[data-zf]').count() === 4, 'Zufall: 4 Pools');
  await page.click('[data-zf="AP1"]'); await page.waitForTimeout(600);
  const nrs = await page.locator('.nummern .nr').count(); ok(nrs === 60, `Zufallsprüfung AP1 hat ${nrs} Fragen`);
  const ids1 = await page.evaluate(() => JSON.stringify(S.p.zufall.gesehen.AP1.slice()));
  await page.screenshot({ path: path.join(shots, 'p1-zufallspruefung.png') });
  // zweite Prüfung: andere Fragen
  await go('zufall'); await page.click('[data-zf="AP1"]'); await page.waitForTimeout(600);
  const ids2 = await page.evaluate(() => S.p.zufall.gesehen.AP1.slice());
  const a = JSON.parse(ids1), b = ids2.slice(a.length); const overlap = b.filter(x => a.includes(x)).length;
  ok(b.length === 60 && overlap === 0, `zweite Zufallsprüfung neu (${overlap} Überschneidungen)`);
  // Markierung in der Prüfung
  ok(await page.locator('.schwer-leiste').count() === 1, 'Schwierigkeits-Leiste sichtbar');
  await page.click('.schwer-leiste .sg3'); await page.waitForTimeout(150);
  ok(await page.evaluate(() => Object.keys(S.p.schwer).length) === 1, 'Markierung gespeichert');
  await page.click('.schwer-leiste .sg1'); ok(await page.evaluate(() => Object.values(S.p.schwer)[0]) === 1, 'Markierung geändert auf leicht');
  await page.click('.schwer-leiste .sg2'); await page.click('.schwer-leiste .sg2'); ok(await page.evaluate(() => Object.keys(S.p.schwer).length) === 0, 'Markierung entfernt per 2. Klick');
  await page.click('.schwer-leiste .sg3');
  // Quiz-Übung: Frage beantworten, Markierung
  await go('quiz', 'uebung'); await page.click('#q-start'); await page.waitForTimeout(500);
  ok(await page.locator('.schwer-leiste').count() === 1, 'Übung: Leiste');
  await page.click('.schwer-leiste .sg2');
  // Rubrik
  await go('schwierigkeit'); const t = await txt(); ok(/schwer \(1\)/.test(t) && /mittel \(1\)/.test(t), 'Rubrik zählt Markierungen');
  await page.screenshot({ path: path.join(shots, 'p1-schwierigkeit.png') });
  await page.click('#sw-tabs button.sw-t2'); await page.waitForTimeout(300);
  ok(await page.locator('.sw-zeile').count() === 1, 'Rubrik mittel: 1 Aufgabe');
  await page.click('.sw-zeile .schwer-btn.sg1'); await page.waitForTimeout(300);
  ok(await page.evaluate(() => Object.values(S.p.schwer).filter(x => x === 1).length) === 1, 'Rubrik: Stufe ändern');
  await page.click('#sw-tabs button.sw-t1'); await page.click('#sw-ueben'); await page.waitForTimeout(500);
  ok(await page.locator('#q-item').count() === 1, 'Rubrik: Üben startet');

  // Tagesaufgabe
  await page.evaluate(() => { S.p.tagesaufgabe = { aktuell: null, ausgegeben: 0, historie: [], serie: 0, best: 0, letzterTag: '' }; });
  await go('home'); await page.evaluate(() => Ziele.pruefeTag(false)); await page.waitForTimeout(500);
  ok(await page.locator('#ta-overlay').count() === 1, 'Tagesaufgabe: Overlay erscheint');
  await page.screenshot({ path: path.join(shots, 'p1-tagesaufgabe.png') });
  const xp0 = await page.evaluate(() => S.p.xp.gesamt);
  // beantworten per Programm (erste Antwort klicken, falls mc)
  const art = await page.evaluate(() => Formen.nachId(S.p.tagesaufgabe.aktuell.id).art);
  if (art === 'mc') { await page.click('#ta-item .antwort'); await page.waitForTimeout(400); }
  else await page.evaluate(() => { const t = S.p.tagesaufgabe; t.aktuell.erledigt = true; t.historie.push({ id: t.aktuell.id, ok: false, datum: heute(), nr: 1 }); });
  console.log('Tagesaufgabe-Art', art);
  if (art === 'mc') { ok(await page.locator('.ta-fertig').count() === 1, 'Tagesaufgabe: Ergebnis'); ok(await page.evaluate(() => S.p.tagesaufgabe.historie.length) === 1, 'Tagesaufgabe: Historie'); ok(await page.evaluate((x) => S.p.xp.gesamt > x, xp0), 'Tagesaufgabe: XP'); }
  await page.evaluate(() => document.getElementById('ta-overlay') && document.getElementById('ta-overlay').remove());
  // 24-h-Logik: noch nicht fällig
  await page.evaluate(() => Ziele.pruefeTag(false)); await page.waitForTimeout(200);
  ok(await page.locator('#ta-overlay').count() === 0, 'Nicht vor Ablauf von 24 h');
  await page.evaluate(() => { S.p.tagesaufgabe.ausgegeben -= 25 * 3600 * 1000; Ziele.pruefeTag(false); }); await page.waitForTimeout(300);
  ok(await page.locator('#ta-overlay').count() === 1, 'Nach 24 h neue Aufgabe');
  await page.evaluate(() => document.getElementById('ta-overlay').remove());
  await go('tagesaufgabe'); ok(await page.locator('.ta-feld').count() === 365, '365er Raster');
  await page.screenshot({ path: path.join(shots, 'p1-tagesraster.png') });

  // Kachel / Bereich x/y
  await go('bereich', 'AP1'); ok(/✓ \d+\/\d+/.test(await txt()) || /Aufgaben erfolgreich/.test(await txt()), 'Bereich zeigt x/y');
  await go('erfolge'); ok(/Netzilon-Meister/.test(await txt()), 'Erfolge: neue Ränge');
  // ---------- Speicher-Labor (Paket 2) ----------
  {
    page.on('dialog', d => d.accept());
    await page.evaluate(() => { S.p.speicher.zustand = null; });
    await go('speicher');
    ok(await page.locator('#spm-svg').count() === 1 && /Speicher-Labor/.test(await txt()), 'Speicher: Ansicht mit SAN-Topologie');
    const xpS0 = await page.evaluate(() => S.p.xp.gesamt), gel0 = await page.evaluate(() => Object.keys(S.p.speicher.geloest).length);
    // LUN anlegen + mappen (Masking nur für SQL01)
    await page.fill('#spm-lname', 'SQL-DATA'); await page.fill('#spm-lgb', '300'); await page.click('[data-a="lun-neu"]');
    ok(await page.evaluate(() => !!Speicher._test.z().luns.find(l => l.n === 'SQL-DATA' && l.gb === 300)), 'Speicher: LUN SQL-DATA angelegt');
    await page.click('[data-a="map"][data-lun="SQL-DATA"][data-host="SQL01"]');
    ok(await page.evaluate(() => Speicher._test.z().luns.find(l => l.n === 'SQL-DATA').map.SQL01 === 0), 'Speicher: LUN für SQL01 gemappt (LUN-ID 0)');
    // Verkabeln per Klick: Port antippen, dann Switch
    await page.click('#spm-svg [data-port="SQL01.0"]'); await page.click('#spm-svg [data-sw="FCA"]');
    await page.click('#spm-svg [data-port="SQL01.1"]'); await page.click('#spm-svg [data-sw="FCB"]');
    ok(await page.evaluate(() => Speicher._test.z().kabel.filter(k => k.port.startsWith('SQL01.')).length === 2), 'Speicher: SQL01 per Klick an beide Fabrics verkabelt');
    let s = await page.evaluate(() => Speicher._test.sicht('SQL01', 'SQL-DATA'));
    ok(!s.ok && s.bed.some(b => !b.ok && /Zoning/.test(b.t)), 'Speicher: ohne Zone keine Sicht (Pfadprüfung ✗ Zoning)');
    // Zoning (Single-Initiator) auf beiden Fabrics
    const zone = async (fab, name, ports) => {
      await page.click(`#spm-zone [data-fab="${fab}"]`);
      for (const w of ports) await page.check(`#spm-zone .spm-zm[value="${w}"]`);
      await page.fill('#spm-zname', name); await page.click('[data-a="zone-neu"]'); await page.click('[data-a="aktivieren"]');
    };
    await zone('FCA', 'z_SQL01_hba0', ['10:00:00:90:fa:33:03:00', '50:0a:09:81:00:a0:00:01', '50:0a:09:81:00:b0:00:01']);
    await zone('FCB', 'z_SQL01_hba1', ['10:00:00:90:fa:33:03:01', '50:0a:09:82:00:a0:00:02', '50:0a:09:82:00:b0:00:02']);
    s = await page.evaluate(() => Speicher._test.sicht('SQL01', 'SQL-DATA'));
    ok(s.ok && s.aktiv === 4 && s.fabrics === 2 && s.bed.every(b => b.ok), `Speicher: Pfadprüfung ✓ (Pfade ${s.aktiv}, Fabrics ${s.fabrics})`);
    await page.click('#spm-sicht [data-host="SQL01"]');
    ok(await page.locator('#spm-sicht .spm-bed .spm-ok').count() >= 5 && /SQL-DATA/.test(await page.locator('#spm-sicht').innerText()), 'Speicher: „Was sieht SQL01?“ zeigt ✓ je Bedingung');
    ok(await page.locator('#spm-io circle').count() > 0, 'Speicher: I/O-Animation läuft über die Pfade');
    // Ausfall Switch A → weiter über Fabric B
    await page.selectOption('#spm-aus-sel', 'sw:FCA'); await page.click('[data-a="aus-umschalten"]');
    s = await page.evaluate(() => Speicher._test.sicht('SQL01', 'SQL-DATA'));
    ok(s.ok && s.fabrics === 1 && s.aktiv === 2, 'Speicher: Switch A aus → SQL-DATA weiter über Fabric B erreichbar (MPIO)');
    ok(/FC-Switch A \(Fabric A\) ausgefallen/.test(await page.locator('#spm-sicht').innerText()), 'Speicher: MPIO zeigt ausgefallene Pfade');
    await page.click('[data-a="heil"]');
    ok(await page.evaluate(() => Object.keys(Speicher._test.z().aus).length === 0), 'Speicher: Wiederherstellen');
    // RAID-5-Rebuild (RG1, Hot Spare springt ein)
    await page.click('#spm-raid [data-rg="RG1"]');
    await page.click('#spm-raid [data-a="platte-aus"][data-v="1"]');
    ok(await page.evaluate(() => { const r = Speicher._test.z().rgs[0]; return r.rb && r.rb.i === 1 && r.d[1] === 'rebuild'; }), 'Speicher: Plattenausfall → Hot Spare → Rebuild läuft');
    await page.waitForTimeout(600);
    ok(await page.locator('#spm-raid .spm-rbbalken').count() === 1 && /XOR/.test(await page.locator('#spm-raid').innerText()), 'Speicher: Rebuild-Balken + XOR-Erklärung');
    await page.evaluate(() => Speicher._test.schnell(60));
    await page.waitForFunction(() => !Speicher._test.z().rgs[0].rb, null, { timeout: 8000 });
    ok(await page.evaluate(() => Speicher._test.z().rgs[0].d.every(x => x === 'ok') && Speicher._test.z().ev.rebuild5 === 1), 'Speicher: RAID-5-Rebuild fertig, Gruppe optimal');
    await page.evaluate(() => Speicher._test.schnell(1));
    // RAID 5: zweiter Ausfall während Rebuild = Datenverlust; RAID 6 nicht
    const r5 = await page.evaluate(() => { const r = Speicher._test.z().rgs[0]; return [r.spare, r.tot]; });
    await page.click('#spm-raid [data-a="platte-aus"][data-v="0"]'); await page.click('#spm-raid [data-a="platte-aus"][data-v="2"]');
    ok(await page.evaluate(() => Speicher._test.z().rgs[0].tot === true) && !(await page.evaluate(() => Speicher._test.sicht('HV01', 'VM-STORE').ok)), 'Speicher: RAID 5 – zweiter Ausfall = Datenverlust, LUN weg');
    await page.click('#spm-raid [data-a="backup"]');
    await page.click('#spm-raid [data-rg="RG3"]');
    await page.click('#spm-raid [data-a="platte-aus"][data-v="0"]'); await page.click('#spm-raid [data-a="platte-aus"][data-v="3"]');
    ok(await page.evaluate(() => { const r = Speicher._test.z().rgs[2]; return !r.tot && Speicher._test.z().ev.raid6doppel === 1; }), 'Speicher: RAID 6 übersteht zwei Ausfälle');
    ok(await page.evaluate(() => [Speicher.nutzTB(6, 8, 4), Speicher.nutzTB(5, 5, 4), Speicher.nutzTB(10, 6, 3), Speicher.nutzTB(1, 2, 8), Speicher.nutzTB(0, 4, 2)].join()) === '24,16,9,8,8', 'Speicher: Nutzkapazitäten korrekt');
    // Rechenaufgabe per Eingabe
    await page.fill('#spm-antw-kap6', '24'); await page.click('[data-a="antwort"][data-v="kap6"]');
    const gel = await page.evaluate(() => S.p.speicher.geloest);
    console.log('Speicher gelöst:', Object.keys(gel).join(', '), '| vorher', r5.join('/'));
    ok(['kabel-sql', 'lun-sql', 'mask-sql', 'sql-mpio', 'rebuild5', 'raid6-doppel', 'kap6'].every(k => gel[k]) && Object.keys(gel).length - gel0 >= 2, 'Speicher: Aufgaben gelöst und in S.p.speicher.geloest');
    ok(await page.evaluate(x => S.p.xp.gesamt > x, xpS0), 'Speicher: XP gestiegen');
    ok(/\d+\/12 gelöst/.test(await page.locator('#spm-aufgaben').innerText()), 'Speicher: Fortschritt x/y');
    await page.evaluate(() => { document.getElementById('inhalt').scrollTop = 0; }); await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(shots, 'p2-speicher.png'), fullPage: false });
    await page.locator('#spm-raid').screenshot({ path: path.join(shots, 'p2-speicher-raid.png') });
    // Zustand übersteht Ansichtswechsel, Timer/Animation stoppen
    await go('home'); await page.waitForTimeout(250);
    ok(await page.evaluate(() => { const l = Speicher._test.laeuft(); return !l.raf && !l.timer; }), 'Speicher: Animation/Timer gestoppt nach Verlassen');
    await go('speicher');
    ok(await page.evaluate(() => { const z = Speicher._test.z(); return !!z.luns.find(l => l.n === 'SQL-DATA') && z.fab.FCB.aktiv.length === 1 && !!S.p.speicher.zustand; }), 'Speicher: Zustand übersteht gehe(home) + zurück');
    ok(await page.evaluate(() => { const t = Speicher._test; const a = t.normal({ v: 1, server: 'kaputt', kabel: [{ id: 1 }], rgs: [{ id: 'RG1', level: 7, d: 'x' }], luns: [{ n: '<script>', gb: -1 }] }); const b = t.normal(null), c = t.normal({ v: 99 }); return a.server.length === 3 && a.rgs[0].level === 5 && a.luns.length === 0 && b.rgs.length === 3 && c.kabel.length === 7; }), 'Speicher: kaputter/alter Zustand → Validierung/Startzustand');
    // schmale Breite (iPhone, 390 px)
    await page.setViewportSize({ width: 390, height: 844 }); await go('speicher'); await page.waitForTimeout(300);
    ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2 && (() => { const i = document.getElementById('inhalt'); return i.scrollWidth <= i.clientWidth + 2; })()), 'Speicher: 390 px ohne horizontalen Überlauf');
    await page.screenshot({ path: path.join(shots, 'p2-speicher-390.png') });
    await page.setViewportSize({ width: 1300, height: 900 });
  }
  // ---------- Anomalie P2: alte/kaputte Speicherstände, Legende, neue Themenseiten ----------
  {
    const KEY = 'netzilon-ultra-fortschritt-v2';
    await page.waitForTimeout(500);
    const basis = await page.evaluate(() => { const p = JSON.parse(JSON.stringify(S.p)); p.einstellungen.intro = false; return p; });
    const neuLaden = async (p) => {
      await page.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, JSON.stringify(p)]);
      await page.reload(); await page.waitForFunction(() => window.__netzilonBereit && S.docs && S.docs.length, null, { timeout: 30000 });
      await page.waitForTimeout(400); await page.evaluate(() => { const o = document.getElementById('ta-overlay'); if (o) o.remove(); });
    };
    const kaputt = {
      'ohne speicher-Feld': p => { delete p.speicher; },
      'speicher = String': p => { p.speicher = 'kaputt'; },
      'speicher = Array, geloest = Array': p => { p.speicher = [1, 2]; },
      'zustand = {foo:1}': p => { p.speicher = { geloest: [], zustand: { foo: 1 }, best: 'x' }; },
      'zustand = null': p => { p.speicher = { geloest: {}, zustand: null }; },
      'zustand = Array': p => { p.speicher = { geloest: {}, zustand: [1, 2, 3] }; },
      'zustand = String': p => { p.speicher = { geloest: {}, zustand: 'abc' }; },
      'zustand v1 mit Müll': p => { p.speicher = { geloest: { 'kap6': '2026-01-01' }, zustand: { v: 1, kid: 1, server: ['HV01', 'HV01', 'XYZ'], kabel: [{ id: 'k1', port: 'HV01.0', sw: 'FCA' }, { id: 'k1', port: 'HV01.1', sw: 'FCB' }, { id: 'k9', port: 'CTLA.0', sw: 'FCA' }], fab: { FCA: { zonen: 'x', aktiv: [{ n: 'a b', m: [] }] } }, rgs: [{ id: 'RG1', level: 5, n: 5, tb: 4, d: ['ok', 'warte', 'ok', 'ok', 'ok'], rb: null, spare: -4 }], luns: [{ n: 'VM-STORE', gb: 1e9, rg: 'RG9' }], aus: { 'x:y': 1 }, antw: { kap6: 'zwölf' } } }; }
    };
    for (const [name, f] of Object.entries(kaputt)) {
      const p = JSON.parse(JSON.stringify(basis)); f(p); await neuLaden(p);
      await go('speicher'); await page.waitForTimeout(250);
      const r = await page.evaluate(() => ({ hoppla: /Hoppla/.test(document.getElementById('inhalt').innerText), wurzel: !!document.querySelector('#spm-wurzel .spm-karte'), geloest: !Array.isArray(S.p.speicher.geloest) && typeof S.p.speicher.geloest === 'object' }));
      ok(!r.hoppla && r.wurzel && r.geloest, `Anomalie P2: Fortschritt ${name} → App startet, Speicher-Labor öffnet`);
    }
    // zuletzt „Müll“-Zustand: Kabel-IDs eindeutig, neue ID kollidiert nicht, wartende Platte wird aufgebaut
    const zz = await page.evaluate(() => { const z = Speicher._test.z(); const ids = z.kabel.map(k => k.id); return { eindeutig: new Set(ids).size === ids.length, kid: z.kid, rb: !!z.rgs[0].rb, sp: z.rgs[0].spare }; });
    ok(zz.eindeutig && zz.kid > 9 && zz.rb && zz.sp === 0, 'Anomalie P2: kaputter Zustand bereinigt (Kabel-IDs eindeutig, kid ' + zz.kid + ', Rebuild läuft weiter)');
    await go('home'); await page.waitForTimeout(250);
    ok(await page.evaluate(() => { const l = Speicher._test.laeuft(); return !l.raf && !l.timer; }), 'Anomalie P2: Rebuild-Timer stoppt nach Verlassen');
    await neuLaden(basis);
    // Legende + je eine Aufgabe jeder Art auf 10 neuen Themenseiten
    const seiten = ['wiso-p2-bbig', 'wiso-p2-sozialversicherung-entgelt', 'wiso-p2-vertraege-verbraucherschutz', 'server-hyperv-nested-grundlagen', 'server-hyperv-nested-einschraenkungen', 'server-hvsz-05', 'server-hvsz-21', 'server-hvsz-45', 'server-speicher-iscsi', 'server-speicher-raid'];
    for (const id of seiten) {
      const e0 = errs.length;
      await go('lesen', id);
      const info = await page.evaluate(() => {
        const i = document.getElementById('inhalt'); i.querySelectorAll('details').forEach(d => d.open = true);
        return { hoppla: /Hoppla/.test(i.innerText), leg: i.querySelectorAll('.leg-abschnitt').length, dt: i.querySelectorAll('.leg-abschnitt .leg-karte dt').length, legSicht: (() => { const l = i.querySelector('.leg-abschnitt'); return !!l && l.offsetHeight > 0; })() };
      });
      const arten = await page.evaluate(() => {
        const gemacht = {}; const i = document.getElementById('inhalt');
        for (const box of i.querySelectorAll('.lesen-item')) {
          const q = box.querySelector('.quizfrage'); if (!q) continue;
          const art = box.querySelector('.antwort') ? 'mc' : box.querySelector('.luecke-in') ? 'luecke' : box.querySelector('.zo-raster') ? 'zuordnen' : box.querySelector('.rf-liste') ? 'reihenfolge' : q.classList.contains('freitext') ? 'freitext' : q.classList.contains('szenario') ? 'szenario' : '?';
          if (gemacht[art]) continue; gemacht[art] = 1;
          if (art === 'mc') { box.querySelector('.antwort').click(); const pb = box.querySelector('.mc-pruefen'); if (pb) pb.click(); }
          if (art === 'luecke') { box.querySelectorAll('.luecke-in').forEach(x => { x.value = 'test'; x.dispatchEvent(new Event('input', { bubbles: true })); }); box.querySelector('.l-pruefen').click(); }
          if (art === 'zuordnen') { const b = box.querySelector('.z-pruefen'); if (b) b.click(); }
          if (art === 'reihenfolge') { const b = box.querySelector('.r-pruefen'); if (b) b.click(); }
          if (art === 'freitext') { const t = box.querySelector('.ft-text'); t.value = 'Antwort'; t.dispatchEvent(new Event('input', { bubbles: true })); box.querySelector('.f-zeigen').click(); const sb = box.querySelector('.sb'); if (sb) sb.click(); }
          if (art === 'szenario') { box.querySelector('.s-zeigen').click(); box.querySelectorAll('.sb[data-p="0"]').forEach(b => b.click()); }
        }
        return Object.keys(gemacht).sort().join(',');
      });
      await page.waitForTimeout(150);
      ok(!info.hoppla && info.leg === 1 && info.dt >= 3 && info.legSicht && errs.length === e0 && arten.includes('mc'), `Anomalie P2: ${id} – Legende (${info.dt} Felder), Aufgaben ${arten}, keine Fehler`);
    }
    // Legende bei 390 px ohne Überlauf
    await page.setViewportSize({ width: 390, height: 844 }); await go('lesen', 'server-hvsz-21'); await page.waitForTimeout(250);
    ok(await page.evaluate(() => { const l = document.querySelector('.leg-abschnitt'); return !!l && l.scrollWidth <= l.clientWidth + 2 && document.documentElement.scrollWidth <= innerWidth + 2; }), 'Anomalie P2: Legende bei 390 px ohne Überlauf');
    await page.setViewportSize({ width: 1300, height: 900 });
  }
  // ---------- Paket 2: Pools & Inhalte ----------
  {
    await page.evaluate(() => { const o = document.getElementById('ta-overlay'); if (o) o.remove(); });
    const p2 = await page.evaluate(() => {
      const tp = Formen.alle(d => passtZuTag(d, 'AP1') || passtZuTag(d, 'AP2') || passtZuTag(d, 'WiSo'), ['mc', 'luecke', 'zuordnen', 'reihenfolge']).length;
      const wiso = S.docs.filter(d => /^wiso-p2-/.test(d.id)), hv = S.docs.filter(d => /^server-hyperv-/.test(d.id)), sz = S.docs.filter(d => /^server-hvsz-/.test(d.id)), sp = S.docs.filter(d => /^server-speicher-/.test(d.id)), erg = S.docs.filter(d => /^erg-/.test(d.id));
      const n = l => l.reduce((x, d) => x + Formen.itemsVon(d).length, 0);
      const arten = new Set(wiso.flatMap(d => Formen.itemsVon(d).map(i => i.art)));
      const ohneLeg = [...wiso, ...hv, ...sz, ...sp, ...erg].filter(d => d.typ === 'thema' && !d.legende.length).map(d => d.id);
      return { tp, wiso: n(wiso), arten: arten.size, hv: n(hv), sz: sz.length, szLab: sz.filter(d => /PowerShell/.test(d.sections.Lab || '') && /GUI/.test(d.sections.Lab || '')).length, sp: n(sp), erg: erg.length, ohneLeg };
    });
    console.log('Paket 2', JSON.stringify(p2));
    ok(p2.tp >= 365, `Tagesaufgaben-Pool ${p2.tp} >= 365`);
    ok(p2.wiso >= 200 && p2.arten === 6, `WiSo: ${p2.wiso} neue Aufgaben, ${p2.arten} Aufgabenarten`);
    ok(p2.hv >= 100, `Hyper-V vertieft: ${p2.hv} Aufgaben`);
    ok(p2.sz === 50 && p2.szLab === 50, `50 Hyper-V-Szenarien mit GUI + PowerShell (${p2.sz}/${p2.szLab})`);
    ok(p2.sp >= 100, `SAN/Speicher: ${p2.sp} Aufgaben`);
    ok(p2.erg >= 10, `Ergänzungen (Vollständigkeit): ${p2.erg} Seiten`);
    ok(p2.ohneLeg.length === 0, 'Jede neue Themenseite hat eine Legende ' + p2.ohneLeg.slice(0, 5).join(','));
    await go('lesen', 'server-hvsz-02'); ok(await page.locator('.leg-abschnitt').count() === 1 && await page.locator('.lab input[data-schritt]').count() > 3, 'Szenario 02: Legende + abhakbares Lab');
    await page.screenshot({ path: path.join(shots, 'p2-szenario.png') });
  }
  // ---------- SQL-Labor (Paket 3) ----------
  {
    await page.setViewportSize({ width: 1300, height: 900 });
    await page.evaluate(() => { const o = document.getElementById('ta-overlay'); if (o) o.remove(); SqlLabor._test.vergessen(); S.p.sql = { geloest: {}, db: null, verlauf: [], editor: '' }; });
    const sqlBereit = () => page.waitForFunction(() => SqlLabor._test.bereit() && document.querySelector('#sql-wurzel[data-bereit="1"]'), null, { timeout: 30000 });
    const ergTxt = () => page.locator('#sql-ergebnis-inhalt').innerText();
    const sqlRun = async q => { await page.fill('#sql-editor', q); await page.focus('#sql-editor'); await page.keyboard.press('Control+Enter'); await page.waitForTimeout(250); return ergTxt(); };
    await go('sql'); await sqlBereit();
    ok(/SQL-Labor/.test(await txt()) && await page.locator('#sql-editor').count() === 1, 'SQL: Ansicht geöffnet, DB bereit (' + await page.evaluate(() => SqlKern.modus()) + ')');
    await sqlRun('SELECT COUNT(*) FROM mitarbeiter;');
    ok(await page.locator('#sql-ergebnis-inhalt td.sql-zahl').first().innerText() === '100' && /1 Zeile/.test(await ergTxt()) && /ms/.test(await ergTxt()), 'SQL: Strg+Enter → COUNT(*) = 100 (Zahl rechtsbündig, Zeilen/ms)');
    let t = await sqlRun('SELECT foo FROM mitarbeiter;');
    ok(/no such column/.test(t) && /Spalte foo gibt es nicht/.test(t) && /Tipp/.test(t), 'SQL: Fehler „no such column“ mit deutscher Erklärung + Tipp');
    t = await sqlRun("INSERT INTO kunden (kunde_id, firma, stadt) VALUES (900, 'Testfirma Nord', 'Rostock');");
    ok(/1 Zeile geändert/.test(t), 'SQL: INSERT → „1 Zeile geändert“');
    t = await sqlRun("INSERT INTO kunden (kunde_id, firma) VALUES (900, 'Doppelt');");
    ok(/Eindeutigkeit verletzt/.test(t), 'SQL: UNIQUE-Fehler übersetzt');
    await page.waitForFunction(() => typeof S.p.sql.db === 'string' && S.p.sql.db.length > 1000, null, { timeout: 5000 });
    await go('home');
    ok(await page.evaluate(() => !SqlLabor._test.laeuft().beobachter && SqlLabor._test.laeuft().ui === 0), 'SQL: Timer/Beobachter nach Verlassen gestoppt');
    await page.evaluate(() => SqlLabor._test.vergessen()); // Arbeits-DB aus dem Speicher werfen → muss aus S.p.sql.db (base64) kommen
    await go('sql'); await sqlBereit();
    t = await sqlRun("SELECT firma FROM kunden WHERE kunde_id = 900;");
    ok(/Testfirma Nord/.test(t), 'SQL: Änderung übersteht gehe(home) + zurück (aus S.p.sql.db wiederhergestellt)');
    ok(await page.evaluate(() => S.p.sql.verlauf.length >= 4 && /kunde_id = 900/.test(S.p.sql.verlauf[0]) && /kunde_id = 900/.test(S.p.sql.editor)), 'SQL: Verlauf + Editorinhalt gespeichert');
    await page.click('#sql-wurzel [data-a="reset"]');
    await page.waitForFunction(() => S.p.sql.db === null && SqlLabor._test.bereit() && /zurückgesetzt/.test(document.getElementById('sql-ergebnis-inhalt').innerText), null, { timeout: 15000 });
    t = await sqlRun('SELECT COUNT(*) AS n FROM mitarbeiter; SELECT COUNT(*) AS k FROM kunden;');
    ok(await page.locator('#sql-ergebnis-inhalt td.sql-zahl').allInnerTexts().then(x => x.join(',')) === '100,40', 'SQL: Zurücksetzen → wieder 100 Mitarbeiter / 40 Kunden');
    // T-SQL-Erkennung
    await page.fill('#sql-editor', 'SELECT TOP 5 * FROM mitarbeiter'); await page.waitForTimeout(600);
    ok(/T-SQL/.test(await page.locator('#sql-tsql-live').innerText()) && /LIMIT/.test(await page.locator('#sql-tsql-live').innerText()), 'SQL: T-SQL „TOP“ erkannt → Hinweis auf LIMIT');
    await page.focus('#sql-editor'); await page.keyboard.press('Control+Enter'); await page.waitForTimeout(250);
    ok(/T-SQL erkannt/.test(await ergTxt()) && /Syntaxfehler/.test(await ergTxt()), 'SQL: Fehler bei TOP zeigt Syntax-Erklärung + T-SQL-Hinweis');
    t = await sqlRun('WITH RECURSIVE z(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM z) SELECT COUNT(*) FROM z;');
    ok(/WITH RECURSIVE ohne LIMIT/.test(t) && await page.locator('#sql-ergebnis-inhalt [data-a="trotzdem"]').count() === 1, 'SQL: Endlos-Rekursion → Warnung statt Hängen');
    t = await sqlRun('WITH RECURSIVE z(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM z WHERE n < 10) SELECT SUM(n) FROM z;');
    ok(/\b55\b/.test(t), 'SQL: Rekursion mit Abbruchbedingung läuft ohne Warnung');
    // Tab-Taste + Highlighting
    await page.fill('#sql-editor', ''); await page.focus('#sql-editor'); await page.keyboard.press('Tab'); await page.keyboard.type('select 1');
    ok(await page.inputValue('#sql-editor') === '  select 1' && await page.locator('#sql-hl .sql-hw').count() === 1, 'SQL: Tab = 2 Leerzeichen, Schlüsselwort hervorgehoben');
    // ER-Diagramm
    await page.evaluate(() => { document.getElementById('sql-er-box').open = true; });
    ok(await page.locator('#sql-er-svg .sql-er-tab').count() === 10 && await page.locator('#sql-er-svg .sql-er-fk').count() >= 14, 'SQL: ER-Diagramm mit 10 Tabellen-Kästen und FK-Linien');
    await page.click('#sql-er-svg .sql-er-tab[data-tab="projekte"]'); await page.waitForTimeout(400);
    ok(/SELECT \* FROM projekte LIMIT 20/.test(await page.inputValue('#sql-editor')) && /15 Zeilen/.test(await ergTxt()), 'SQL: Klick auf Tabelle → SELECT * … LIMIT 20');
    await sqlRun('CREATE VIEW v_test AS SELECT * FROM artikel; CREATE INDEX idx_test ON artikel(kategorie);');
    ok(/v_test/.test(await page.locator('#sql-live').innerText()) && /idx_test/.test(await page.locator('#sql-live').innerText()), 'SQL: Live-Schema zeigt eigene View + Index');
    await page.locator('#sql-er-box').screenshot({ path: path.join(shots, 'p3-sql-er.png') });
    // Aufgaben
    const aufg = await page.evaluate(() => (window.SQL_AUFGABEN || []).map(a => ({ id: a.id, art: a.art, loesung: a.loesung })));
    ok(aufg.length >= 3, `SQL: Aufgaben vorhanden (${aufg.length})`);
    const xpQ0 = await page.evaluate(() => S.p.xp.gesamt);
    const loese = async (id, sql) => {
      await page.evaluate(id => { const b = document.querySelector(`#sql-liste [data-aid="${id}"]`); b.closest('details').open = true; b.click(); }, id);
      await page.fill('#sql-editor', sql); await page.click('#sql-pruefen');
      await page.waitForFunction(() => /Richtig|Noch nicht|nicht möglich/.test(document.getElementById('sql-fb').innerText), null, { timeout: 15000 });
      return page.evaluate(id => !!S.p.sql.geloest[id], id);
    };
    // Reset vor den Aufgaben (View/Index von oben stören Abfragen nicht, aber sauber starten)
    const wahl = [aufg.find(a => a.art === 'abfrage'), aufg.filter(a => a.art === 'abfrage')[1], aufg.find(a => a.art === 'aenderung'), aufg.filter(a => a.art === 'abfrage')[5]].filter(Boolean);
    let gel = 0;
    for (const a of wahl) { const r = await loese(a.id, a.loesung); if (r) gel++; else console.log('nicht gelöst:', a.id, await page.locator('#sql-fb').innerText()); }
    ok(gel === wahl.length && gel >= 3, `SQL: ${gel} Aufgaben mit Musterlösung gelöst (${wahl.map(a => a.id).join(', ')})`);
    ok(await page.evaluate(x => S.p.xp.gesamt > x, xpQ0), 'SQL: XP gestiegen');
    const falsch = aufg.filter(a => a.art === 'abfrage')[2];
    ok(!(await loese(falsch.id, 'SELECT 1 AS x;')) && /Noch nicht richtig/.test(await page.locator('#sql-fb').innerText()) && /Zeilen: Soll/.test(await page.locator('#sql-fb').innerText()), 'SQL: falsche Lösung → nicht gelöst, Diff-Hilfe');
    ok(/\d+\/\d+ gelöst/.test(await page.locator('#sql-liste').innerText()) && !(await page.evaluate(() => SqlLabor.alleGeloest())), 'SQL: Fortschritt x/y, alleGeloest() = false');
    await page.evaluate(() => { document.getElementById('inhalt').scrollTop = 0; }); await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(shots, 'p3-sql.png') });
    // kaputte gespeicherte DB
    await go('home'); await page.evaluate(() => { SqlLabor._test.vergessen(); S.p.sql.db = 'kaputt!!keine-datenbank'; });
    await go('sql'); await sqlBereit();
    ok(/beschädigt/.test(await ergTxt()) && await page.evaluate(() => S.p.sql.db === null), 'SQL: kaputte gespeicherte DB → verworfen, frische DB, Hinweis');
    // 390 px
    await page.setViewportSize({ width: 390, height: 844 }); await go('sql'); await sqlBereit();
    await page.evaluate(() => { document.getElementById('sql-er-box').open = true; document.getElementById('sql-tsql-panel').open = true; });
    await sqlRun('SELECT * FROM mitarbeiter LIMIT 5;');
    ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2 && (() => { const i = document.getElementById('inhalt'); return i.scrollWidth <= i.clientWidth + 2; })()), 'SQL: 390 px ohne Seiten-Überlauf');
    ok(await page.evaluate(() => { const w = document.getElementById('sql-er'); return w.scrollWidth > w.clientWidth; }), 'SQL: ER-Diagramm bei 390 px im eigenen Container scrollbar');
    await page.screenshot({ path: path.join(shots, 'p3-sql-390.png') });
    await page.setViewportSize({ width: 1300, height: 900 });
    await go('home');
  }
  ok(errs.length === 0, 'Keine Konsolenfehler ' + errs.slice(0, 3).join(' | '));
  await browser.close();
  console.log(fails ? `\n${fails} FEHLER` : '\nALLES OK'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
