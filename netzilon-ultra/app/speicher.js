// Platzhalter – wird durch das Speicher-Labor (Paket 2) ersetzt
const Speicher = (() => { function ansicht() { krumen([START, { txt: 'Speicher-Labor' }]); $('#inhalt').innerHTML = '<h1>Speicher-Labor</h1><p class="unter">In Arbeit.</p>'; } window.VIEWS = Object.assign(window.VIEWS || {}, { speicher: ansicht }); return { ansicht }; })();
window.Speicher = Speicher;
