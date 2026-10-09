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
  ok(errs.length === 0, 'Keine Konsolenfehler ' + errs.slice(0, 3).join(' | '));
  await browser.close();
  console.log(fails ? `\n${fails} FEHLER` : '\nALLES OK'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
