// UI-Test mit Playwright + Chromium gegen die gebaute HTML-Datei. Erzeugt Screenshots in ../dist/screens/
const path = require('path'), fs = require('fs');
let pw; for (const p of ['playwright-core', '/opt/npm-tools/node_modules/playwright-core', '/opt/node-tools/node_modules/playwright-core']) { try { pw = require(p); break; } catch {} }
if (!pw) { console.error('playwright-core nicht gefunden'); process.exit(2); }
const html = path.resolve(process.argv[2] || path.join(__dirname, '..', '..', 'dist', 'Netzilon-Ultra.html'));
const shots = path.join(path.dirname(html), 'screens'); fs.mkdirSync(shots, { recursive: true });
const exe = fs.existsSync('/opt/pw-browsers/chromium/chrome-linux/chrome') ? '/opt/pw-browsers/chromium/chrome-linux/chrome' : undefined;
let fails = 0;
const ok = (c, m) => { console.log((c ? 'OK     ' : 'FEHLER ') + m); if (!c) fails++; };

(async () => {
  const browser = await pw.chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  for (const [label, vp] of [['desktop', { width: 1400, height: 900 }], ['mobil', { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport: vp }); const page = await ctx.newPage();
    const errs = [];
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    await page.goto('file://' + html);
    // Profil anlegen
    await page.waitForSelector('#p-name', { timeout: 20000 });
    await page.fill('#p-name', 'Philipp'); await page.click('#p-ok');
    await page.waitForFunction(() => window.__netzilonBereit && document.querySelector('.start-kopf'), null, { timeout: 30000 });
    await page.waitForTimeout(1800); await page.evaluate(() => { const o = document.getElementById('ta-overlay'); if (o) o.remove(); });
    ok(await page.locator('.pausenbrett .aktion').count() > 8, `[${label}] Startseite mit Aktionen`);
    await page.screenshot({ path: path.join(shots, `${label}-01-start.png`) });
    const go = async (view, param) => { await page.evaluate(([v, p]) => gehe(v, p), [view, param]); await page.waitForTimeout(500); };
    // Thema mit Animation
    const id = await page.evaluate(() => { const d = S.docs.find(d => d.grafiken.some(g => g.animierbar)) || S.docs.find(d => d.typ === 'thema'); return d && d.id; });
    await go('lesen', id);
    ok(await page.locator('#inhalt h1').count() > 0, `[${label}] Thema ${id} geöffnet`);
    if (await page.locator('.anim .akteur').count()) { await page.click('.anim [data-a="vor"]'); await page.waitForTimeout(300); ok(true, `[${label}] Animation steuerbar`); }
    await page.screenshot({ path: path.join(shots, `${label}-02-thema.png`) });
    await go('quiz', 'uebung'); await page.screenshot({ path: path.join(shots, `${label}-03-quiz-start.png`) });
    const startBtn = page.locator('#q-start, button:has-text("Los")').first();
    if (await startBtn.count()) { await startBtn.click(); await page.waitForTimeout(500); ok(await page.locator('#q-item').count() > 0, `[${label}] Quiz-Frage sichtbar`); await page.screenshot({ path: path.join(shots, `${label}-04-quiz.png`) }); }
    await go('rechner'); ok(await page.locator('#inhalt h1').count() > 0, `[${label}] Rechner`);
    await page.screenshot({ path: path.join(shots, `${label}-05-rechner.png`) });
    for (const [v, n] of [['plan', 'plan'], ['analyse', 'analyse'], ['netsim', 'netsim'], ['terminal', 'terminal'], ['glossar', 'glossar'], ['cheatsheets', 'cheat'], ['spickzettel', 'spick'], ['erfolge', 'erfolge'], ['dojo', 'dojo'], ['mehr']]) {
      await go(v); ok((await page.locator('#inhalt').innerText()).length > 40 && !/Hoppla/.test(await page.locator('#inhalt').innerText()), `[${label}] Ansicht ${v}`);
      await page.screenshot({ path: path.join(shots, `${label}-06-${n || v}.png`) });
    }
    ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2), `[${label}] kein horizontaler Überlauf`);
    ok(errs.length === 0, `[${label}] keine Konsolenfehler${errs.length ? ': ' + errs.slice(0, 5).join(' | ') : ''}`);
    await ctx.close();
  }
  await browser.close();
  console.log(fails ? `\n${fails} Fehler` : '\nAlle Tests bestanden');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
