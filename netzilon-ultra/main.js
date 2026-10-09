// Netzilon Ultra 2.0.0 – Electron-Hauptprozess (GPProductions)
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const baseDir = process.env.PORTABLE_EXECUTABLE_DIR || (app.isPackaged ? path.dirname(process.execPath) : __dirname);
const builtinContent = app.isPackaged ? path.join(process.resourcesPath, 'content') : path.join(__dirname, 'content');
const externalContent = path.join(baseDir, 'content');
const progressFile = path.join(baseDir, 'fortschritt.json');
const changelogFile = app.isPackaged ? path.join(process.resourcesPath, 'CHANGELOG.md') : path.join(__dirname, 'CHANGELOG.md');

// Inhalte einsammeln: eine kaputte Datei darf nie den Start blockieren
function collect(root, dir, out, source, fehler) {
  let eintraege;
  try { if (!fs.existsSync(dir)) return; eintraege = fs.readdirSync(dir, { withFileTypes: true }); }
  catch (e) { fehler.push({ path: dir, msg: 'Ordner nicht lesbar: ' + e.message }); return; }
  for (const e of eintraege) {
    if (e.name.startsWith('_') || e.name.startsWith('.') || e.name === 'FORTSCHRITT.md') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) collect(root, p, out, source, fehler);
    else if (e.name.toLowerCase().endsWith('.md')) {
      try { out.push({ path: p, rel: path.relative(root, p).replace(/\\/g, '/'), source, text: fs.readFileSync(p, 'utf8') }); }
      catch (err) { fehler.push({ path: p, msg: 'Datei nicht lesbar: ' + err.message }); }
    }
  }
}

// Alter Netzilon-Fortschritt: gleiche Datei (fortschritt.json) bleibt kompatibel.
// Liegt Netzilon Ultra in einem neuen Ordner, wird ein alter Stand in der Nähe gesucht.
function alterFortschritt() {
  const kandidaten = [
    path.join(baseDir, 'netzilon-fortschritt.json'),
    path.join(baseDir, '..', 'Netzilon', 'fortschritt.json'),
    path.join(baseDir, '..', 'netzilon', 'fortschritt.json')
  ];
  for (const k of kandidaten) {
    try { if (fs.existsSync(k)) { const d = JSON.parse(fs.readFileSync(k, 'utf8')); if (d && d.profil) { d._migriertAus = k; return d; } } } catch {}
  }
  return null;
}

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1400, height: 900, minWidth: 1000, minHeight: 680,
    backgroundColor: '#0a1222', title: 'Netzilon Ultra', autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  win.setMenu(null);
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
}

ipcMain.handle('content:load', () => {
  const files = [], fehler = [];
  collect(builtinContent, builtinContent, files, 'eingebaut', fehler);
  if (path.resolve(externalContent) !== path.resolve(builtinContent)) collect(externalContent, externalContent, files, 'extern', fehler);
  return { files: files.map(f => ({ path: f.rel, abs: f.path, source: f.source, text: f.text })), fehler };
});
ipcMain.handle('progress:load', () => {
  try { return JSON.parse(fs.readFileSync(progressFile, 'utf8')); }
  catch { return alterFortschritt(); }
});
ipcMain.handle('progress:save', (_e, data) => {
  try {
    // Einmalige Sicherung eines alten 1.x-Standes vor dem ersten Speichern im 2.0-Format
    if (fs.existsSync(progressFile)) {
      const backup = path.join(baseDir, 'fortschritt.v1-sicherung.json');
      if (!fs.existsSync(backup)) {
        try { const alt = JSON.parse(fs.readFileSync(progressFile, 'utf8')); if (!alt.version || alt.version < 2) fs.copyFileSync(progressFile, backup); } catch {}
      }
    }
    const tmp = progressFile + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 1), 'utf8');
    fs.renameSync(tmp, progressFile);
    return true;
  } catch { return false; }
});
ipcMain.handle('progress:export', async (_e, data) => {
  const r = await dialog.showSaveDialog(win, { title: 'Fortschritt exportieren', defaultPath: 'netzilon-ultra-fortschritt.json', filters: [{ name: 'JSON', extensions: ['json'] }] });
  if (r.canceled) return false;
  fs.writeFileSync(r.filePath, JSON.stringify(data, null, 2), 'utf8'); return true;
});
ipcMain.handle('progress:import', async () => {
  const r = await dialog.showOpenDialog(win, { title: 'Fortschritt importieren', filters: [{ name: 'JSON', extensions: ['json'] }], properties: ['openFile'] });
  if (r.canceled) return null;
  try { return JSON.parse(fs.readFileSync(r.filePaths[0], 'utf8')); } catch { return null; }
});
ipcMain.handle('changelog', () => { try { return fs.readFileSync(changelogFile, 'utf8'); } catch { return ''; } });
ipcMain.handle('win:fullscreen', () => { win.setFullScreen(!win.isFullScreen()); return win.isFullScreen(); });
ipcMain.handle('info', () => ({ baseDir, externalContent, progressFile, version: app.getVersion(), plattform: 'desktop' }));

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
