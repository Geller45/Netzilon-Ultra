// Baut EINE HTML-Datei (offline, iPhone/Browser): App-Code + Schrift + Inhalte (gzip+base64) + window.api-Shim (localStorage)
// Aufruf: node tools/build-html.js [--split] [--out ordner]
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const { root, sammle } = require('./lib');
const split = process.argv.includes('--split');
const oi = process.argv.indexOf('--out');
const outDir = oi > 0 ? path.resolve(process.argv[oi + 1]) : path.resolve(root, '..', 'dist');
const pkg = require(path.join(root, 'package.json'));
const app = f => fs.readFileSync(path.join(root, 'app', f), 'utf8');
const safe = s => s.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');

function fontCss() {
  const fs_ = [['kalam', 'Kalam', 400], ['kalam', 'Kalam', 700], ['atkinson-hyperlegible', 'Atkinson Hyperlegible', 400], ['atkinson-hyperlegible', 'Atkinson Hyperlegible', 700], ['jetbrains-mono', 'JetBrains Mono', 400]];
  let css = '';
  for (const [dir, fam, w] of fs_) {
    const p = path.join(root, 'node_modules', '@fontsource', dir, 'files', `${dir}-latin-${w}-normal.woff2`);
    if (!fs.existsSync(p)) continue;
    css += `@font-face{font-family:'${fam}';font-style:normal;font-weight:${w};font-display:swap;src:url(data:font/woff2;base64,${fs.readFileSync(p).toString('base64')}) format('woff2');}\n`;
  }
  return css;
}

const SHIM = `
(function(){
  var KEY='netzilon-ultra-fortschritt-v2', mem=null;
  function lsGet(){ try{ return localStorage.getItem(KEY); }catch(e){ return mem; } }
  function lsSet(v){ try{ localStorage.setItem(KEY,v); }catch(e){ mem=v; } }
  async function inhalte(){
    var el=document.getElementById('netzilon-inhalt'), b64=el.textContent.trim();
    var bin=Uint8Array.from(atob(b64),function(c){return c.charCodeAt(0);});
    var txt;
    if(typeof DecompressionStream==='function'){
      var s=new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'));
      txt=await new Response(s).text();
    } else throw new Error('Dieser Browser kann keine komprimierten Inhalte entpacken (DecompressionStream fehlt). Bitte Safari 16.4+ / aktuelles Chrome nutzen.');
    return JSON.parse(txt);
  }
  window.api={
    plattform:'web',
    loadContent:function(){ return inhalte().then(function(f){ return {files:f,fehler:[]}; }); },
    loadProgress:function(){ try{ var t=lsGet(); return Promise.resolve(t?JSON.parse(t):null);}catch(e){return Promise.resolve(null);} },
    saveProgress:function(d){ try{ lsSet(JSON.stringify(d)); return Promise.resolve(true);}catch(e){return Promise.resolve(false);} },
    exportProgress:function(d){ try{
      var a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}));
      a.download='netzilon-ultra-fortschritt.json'; document.body.appendChild(a); a.click(); setTimeout(function(){a.remove();},500); return Promise.resolve(true);}catch(e){return Promise.resolve(false);} },
    importProgress:function(){ return new Promise(function(res){
      var i=document.createElement('input'); i.type='file'; i.accept='.json,application/json';
      i.onchange=function(){ var f=i.files[0]; if(!f) return res(null); var r=new FileReader(); r.onload=function(){ try{res(JSON.parse(r.result));}catch(e){res(null);} }; r.readAsText(f); };
      i.click(); }); },
    changelog:function(){ return Promise.resolve(document.getElementById('netzilon-changelog').textContent); },
    toggleFullscreen:function(){ try{ if(document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); }catch(e){} return Promise.resolve(!!document.fullscreenElement); },
    info:function(){ return Promise.resolve({baseDir:'',externalContent:'',progressFile:'',version:'${pkg.version}',plattform:'web'}); }
  };
})();`;

function baue(files, name, titelZusatz) {
  let html = app('index.html');
  const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
  html = html.replace(/<!--FONTS-->[\s\S]*?<!--\/FONTS-->/, '').replace(/<link rel="stylesheet" href="style.css">/, '');
  html = html.replace(/<script src="[^"]+"><\/script>\s*/g, '');
  html = html.replace('</head>', `<style>${fontCss()}\n${app('style.css')}</style>\n<link rel="manifest" href="data:application/json,%7B%22name%22%3A%22Netzilon%20Ultra%22%2C%22display%22%3A%22standalone%22%7D">\n</head>`);
  const json = JSON.stringify(files.map(f => ({ path: f.path, source: f.source, text: f.text })));
  const gz = zlib.gzipSync(Buffer.from(json, 'utf8'), { level: 9 }).toString('base64');
  const code = scripts.map(s => `/* ${s} */\n` + app(s)).join('\n;\n');
  const chlog = fs.existsSync(path.join(root, 'CHANGELOG.md')) ? fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8') : '';
  const ende = `<script type="text/plain" id="netzilon-changelog">${chlog.replace(/<\/script/gi, '<\\/script')}</script>
<script type="application/octet-stream" id="netzilon-inhalt">${gz}</script>
<script>${safe(SHIM)}</script>
<script>${safe(code)}</script>
</body>`;
  html = html.replace('</body>', () => ende);
  if (titelZusatz) html = html.replace('<title>Netzilon Ultra</title>', `<title>Netzilon Ultra – ${titelZusatz}</title>`);
  fs.mkdirSync(outDir, { recursive: true });
  const p = path.join(outDir, name);
  fs.writeFileSync(p, html);
  console.log(`${p}: ${(html.length / 1048576).toFixed(2)} MB, ${files.length} Inhaltsdateien`);
  return p;
}

const files = sammle();
if (!split) baue(files, 'Netzilon-Ultra.html');
else {
  // Aufteilen nach obersten Ordnern; jede Datei enthält dazu die Referenz-/Prüfungs-Basis nicht doppelt
  const gruppen = { 'Teil1-AP-Schule': ['ap1', 'ap2', 'wiso', 'ihk', 'bonus', 'referenz', 'legacy'], 'Teil2-Server-Netz': ['az800', 'az801', 'server', 'ccna', 'netz', 'linux'], 'Teil3-Daten-Pruefung': ['datenbanken', 'azure-data', 'pruefung'] };
  const genutzt = new Set();
  for (const [n, ordner] of Object.entries(gruppen)) {
    const f = files.filter(x => ordner.includes(x.path.split('/')[0])); f.forEach(x => genutzt.add(x.path));
    baue(f, `Netzilon-Ultra-${n}.html`, n.replace(/-/g, ' '));
  }
  const rest = files.filter(x => !genutzt.has(x.path));
  if (rest.length) baue(rest, 'Netzilon-Ultra-Teil4-Sonstiges.html', 'Sonstiges');
}
