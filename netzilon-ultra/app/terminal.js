// Netzilon Ultra – Terminal-Trainer: simuliertes PowerShell, CMD, Cisco IOS und Linux-Bash mit Aufgaben (nichts wird wirklich ausgeführt)
const Terminal = (() => {
  const SH = {
    ps: { name: 'PowerShell', farbe: '#7ee0ff', hinweis: 'Maschine: EXA-DC01 (Windows Server 2022, PowerShell als Administrator)' },
    cmd: { name: 'CMD', farbe: '#f3d86a', hinweis: 'Maschine: EXA-CL01 (Windows 11, Eingabeaufforderung)' },
    ios: { name: 'Cisco IOS', farbe: '#82f0b4', hinweis: 'Gerät: Switch/Router SW1 (Konsole)' },
    bash: { name: 'Linux-Bash', farbe: '#f5a66b', hinweis: 'Maschine: lab-ubuntu (Ubuntu Server 24.04, Benutzer azubi)' }
  };
  // Aufgaben: ok = Regex auf die normalisierte Eingabe (Kleinschreibung, Leerzeichen zusammengezogen); loesung = Musterlösung
  const AUFG = {
    ps: [
      { f: 'Zeige alle laufenden Dienste an.', ok: /^get-service(\s+\|\s*where.*running.*)?$/, l: 'Get-Service | Where-Object Status -eq Running' , ok2: /get-service/ },
      { f: 'Lege den Benutzer „Max.Muster“ in AD an (Cmdlet reicht, Parameter -Name).', ok: /^new-aduser\s.*-name/, l: 'New-ADUser -Name "Max Muster" -SamAccountName Max.Muster -Enabled $true' },
      { f: 'Installiere die Serverrolle DHCP inklusive Verwaltungstools.', ok: /^install-windowsfeature\s+(-name\s+)?dhcp.*-includemanagementtools/, l: 'Install-WindowsFeature -Name DHCP -IncludeManagementTools' },
      { f: 'Setze eine statische IPv4-Adresse 192.168.10.10/24 auf den Adapter „Ethernet“.', ok: /^new-netipaddress\s.*-ipaddress\s+192\.168\.10\.10.*-prefixlength\s+24/, l: 'New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.10.10 -PrefixLength 24 -DefaultGateway 192.168.10.1' },
      { f: 'Zeige alle Mitglieder der Gruppe „Domain Admins“.', ok: /^get-adgroupmember\s+(-identity\s+)?["']?domain admins/, l: 'Get-ADGroupMember "Domain Admins"' },
      { f: 'Teste die Verbindung zu 192.168.10.1 über Port 443.', ok: /^test-netconnection\s.*(-port|-commontcpport)\s+(443|https)/, l: 'Test-NetConnection 192.168.10.1 -Port 443' },
      { f: 'Benenne den Computer in „EXA-SRV02“ um und starte neu.', ok: /^rename-computer\s.*exa-srv02.*-restart/, l: 'Rename-Computer -NewName EXA-SRV02 -Restart' },
      { f: 'Lege den Ordner D:\\Daten\\HR an.', ok: /^(new-item\s.*-itemtype\s+directory|mkdir|md)\s/, l: 'New-Item -Path D:\\Daten\\HR -ItemType Directory' }
    ],
    cmd: [
      { f: 'Zeige die vollständige IP-Konfiguration aller Adapter.', ok: /^ipconfig\s+\/all$/, l: 'ipconfig /all' },
      { f: 'Erneuere die DHCP-Adresse.', ok: /^ipconfig\s+\/renew$/, l: 'ipconfig /renew' },
      { f: 'Leere den DNS-Resolver-Cache.', ok: /^ipconfig\s+\/flushdns$/, l: 'ipconfig /flushdns' },
      { f: 'Verfolge den Weg zu 8.8.8.8.', ok: /^tracert\s+8\.8\.8\.8$/, l: 'tracert 8.8.8.8' },
      { f: 'Frage den A-Record von www.example.com ab.', ok: /^nslookup\s+www\.example\.com/, l: 'nslookup www.example.com' },
      { f: 'Zeige alle offenen Verbindungen mit Prozess-ID, numerisch.', ok: /^netstat\s+-(ano|nao|ona)$/, l: 'netstat -ano' },
      { f: 'Wende die Gruppenrichtlinien sofort an.', ok: /^gpupdate\s+\/force$/, l: 'gpupdate /force' },
      { f: 'Zeige die ARP-Tabelle.', ok: /^arp\s+-a$/, l: 'arp -a' }
    ],
    ios: [
      { f: 'Wechsle in den privilegierten Modus.', ok: /^en(a|ab|abl|able)?$/, l: 'enable' },
      { f: 'Setze den Hostnamen auf SW1 (globaler Konfigmodus).', ok: /^hostname\s+sw1$/, modus: 'config', l: 'configure terminal → hostname SW1' },
      { f: 'Lege VLAN 10 mit dem Namen VERTRIEB an.', ok: /^name\s+vertrieb$/, modus: 'vlan', l: 'vlan 10 → name VERTRIEB' },
      { f: 'Setze Interface Fa0/1 als Access-Port in VLAN 10.', ok: /^switchport access vlan 10$/, modus: 'if', l: 'interface fa0/1 → switchport mode access → switchport access vlan 10' },
      { f: 'Vergib auf dem Interface Gi0/0 die Adresse 192.168.1.1/24.', ok: /^ip address 192\.168\.1\.1 255\.255\.255\.0$/, modus: 'if', l: 'interface gi0/0 → ip address 192.168.1.1 255.255.255.0 → no shutdown' },
      { f: 'Speichere die Konfiguration dauerhaft.', ok: /^(copy running-config startup-config|copy run start|write( memory)?|wr)$/, l: 'copy running-config startup-config' },
      { f: 'Zeige die Kurzübersicht aller Interfaces (IP).', ok: /^sh(ow)? ip int(erface)? br(ief)?$/, l: 'show ip interface brief' },
      { f: 'Setze das Enable-Secret auf „geheim“ (Konfigmodus).', ok: /^enable secret\s+\S+$/, modus: 'config', l: 'enable secret geheim' }
    ],
    bash: [
      { f: 'Liste alle Dateien (auch versteckte) mit Details im aktuellen Ordner.', ok: /^ls\s+-(la|al|a\s+-l|l\s+-a)$/, l: 'ls -la' },
      { f: 'Lege den Benutzer „max“ mit Home-Verzeichnis an.', ok: /^(sudo\s+)?useradd\s+(-m\s+max|max\s+-m)$/, l: 'sudo useradd -m max' },
      { f: 'Mache das Skript backup.sh für den Besitzer ausführbar.', ok: /^chmod\s+(u\+x|700|755|\+x)\s+backup\.sh$/, l: 'chmod u+x backup.sh' },
      { f: 'Suche in /var/log/syslog nach „error“, ohne Groß/Kleinschreibung.', ok: /^grep\s+-i\s+["']?error["']?\s+\/var\/log\/syslog$/, l: 'grep -i error /var/log/syslog' },
      { f: 'Installiere das Paket nginx (Debian/Ubuntu).', ok: /^sudo\s+apt(-get)?\s+install\s+(-y\s+)?nginx$/, l: 'sudo apt install nginx' },
      { f: 'Zeige die Netzwerkadressen aller Schnittstellen (iproute2).', ok: /^ip\s+(-c\s+)?(a|addr|address)(\s+show)?$/, l: 'ip a' },
      { f: 'Starte und aktiviere den Dienst ssh dauerhaft.', ok: /^sudo\s+systemctl\s+enable\s+--now\s+ssh$/, l: 'sudo systemctl enable --now ssh' },
      { f: 'Zeige die letzten 20 Zeilen von /var/log/auth.log.', ok: /^(sudo\s+)?tail\s+-n\s*20\s+\/var\/log\/auth\.log$|^(sudo\s+)?tail\s+-20\s+\/var\/log\/auth\.log$/, l: 'sudo tail -n 20 /var/log/auth.log' }
    ]
  };
  const L = (...z) => z.join('\n');
  // Freie Befehle mit Beispielausgabe
  const FREI = {
    ps: [
      [/^get-service/, L('Status   Name               DisplayName', '------   ----               -----------', 'Running  DNS                DNS Server', 'Running  NTDS               Active Directory Domain Services', 'Stopped  Spooler            Druckwarteschlange')],
      [/^get-process/, L('Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  ProcessName', '   410      22    38200      51000      4,31    920  svchost', '   180      12    11800      20400      0,52   1344  explorer')],
      [/^(get-)?ipconfig|^get-netipaddress/, L('IPAddress    : 192.168.10.10', 'PrefixLength : 24', 'InterfaceAlias: Ethernet')],
      [/^get-help|^help/, 'Tipp: Get-Command *Service* findet Cmdlets, Get-Help <Cmdlet> -Examples zeigt Beispiele.'],
      [/^get-command/, L('CommandType Name            Version', 'Cmdlet      Get-Service     3.0.0.0', 'Cmdlet      Start-Service   3.0.0.0')],
      [/^get-aduser/, L('DistinguishedName : CN=Max Muster,OU=Schulung,DC=exa,DC=local', 'Enabled           : True', 'SamAccountName     : Max.Muster')],
      [/^cls|^clear/, '@@clear'], [/^hostname/, 'EXA-DC01'], [/^ping/, L('Antwort von 192.168.10.1: Bytes=32 Zeit<1ms TTL=128', 'Antwort von 192.168.10.1: Bytes=32 Zeit<1ms TTL=128')]
    ],
    cmd: [
      [/^ipconfig(\s+\/all)?$/, L('Windows-IP-Konfiguration', '', 'Ethernet-Adapter Ethernet:', '   IPv4-Adresse  . . . . : 192.168.10.50', '   Subnetzmaske  . . . . : 255.255.255.0', '   Standardgateway . . . : 192.168.10.1', '   DHCP-Server . . . . . : 192.168.10.10')],
      [/^ping/, L('Antwort von 192.168.10.1: Bytes=32 Zeit<1ms TTL=64', 'Antwort von 192.168.10.1: Bytes=32 Zeit<1ms TTL=64', '', 'Ping-Statistik: Gesendet = 2, Empfangen = 2, Verloren = 0 (0% Verlust)')],
      [/^whoami/, 'exa\\azubi'], [/^hostname/, 'EXA-CL01'], [/^dir/, L(' Verzeichnis von C:\\Users\\azubi', '', '24.09.2026  09:12    <DIR>          Desktop', '24.09.2026  09:12    <DIR>          Dokumente')],
      [/^cls/, '@@clear'], [/^help/, 'Befehle: ipconfig, ping, tracert, nslookup, netstat, arp, gpupdate, net use, whoami ...'], [/^net use/, 'Neue Verbindungen werden gespeichert.\n\nStatus  Lokal  Remote\nOK      H:     \\\\EXA-SRV01\\Home'],
      [/^gpresult/, 'Angewendete Gruppenrichtlinienobjekte: Default Domain Policy, GPO_Schulung_Laufwerke']
    ],
    ios: [
      [/^sh(ow)? ver/, L('Cisco IOS Software, C2960 Software, Version 15.0(2)SE', 'SW1 uptime is 2 hours, 14 minutes')],
      [/^sh(ow)? run/, L('Building configuration...', 'hostname Switch', '!', 'interface FastEthernet0/1', ' switchport mode access', '!', 'end')],
      [/^sh(ow)? vlan/, L('VLAN Name                 Status    Ports', '---- -------------------- --------- ----------------', '1    default              active    Fa0/2, Fa0/3', '10   VERTRIEB             active    Fa0/1')],
      [/^sh(ow)? ip int(erface)? br/, L('Interface              IP-Address      OK? Method Status                Protocol', 'GigabitEthernet0/0     192.168.1.1     YES manual up                    up', 'GigabitEthernet0/1     unassigned      YES unset  administratively down down')],
      [/^ping/, L('Type escape sequence to abort.', 'Sending 5, 100-byte ICMP Echos, timeout is 2 seconds:', '!!!!!', 'Success rate is 100 percent (5/5)')],
      [/^\?$/, 'Mögliche Befehle hängen vom Modus ab: enable, configure terminal, show, interface, vlan, exit, end ...']
    ],
    bash: [
      [/^ls(\s|$)/, L('total 24', 'drwxr-xr-x 3 azubi azubi 4096 Okt  8 09:12 .', 'drwxr-xr-x 4 root  root  4096 Okt  1 08:00 ..', '-rw------- 1 azubi azubi  220 Okt  1 08:00 .bash_logout', '-rwxr-xr-x 1 azubi azubi  412 Okt  8 09:10 backup.sh')],
      [/^pwd/, '/home/azubi'], [/^whoami/, 'azubi'], [/^id/, 'uid=1000(azubi) gid=1000(azubi) groups=1000(azubi),27(sudo)'],
      [/^ip\s+(-c\s+)?a/, L('1: lo: <LOOPBACK,UP> mtu 65536', '    inet 127.0.0.1/8 scope host lo', '2: ens33: <BROADCAST,MULTICAST,UP> mtu 1500', '    inet 192.168.10.20/24 brd 192.168.10.255 scope global ens33')],
      [/^uname/, 'Linux lab-ubuntu 6.8.0-45-generic x86_64 GNU/Linux'], [/^clear/, '@@clear'], [/^df/, L('Dateisystem  Größe Benutzt Verf. Verw% Eingehängt auf', '/dev/sda2      40G    9,1G   29G   24% /')],
      [/^cat\s+\/etc\/os-release/, L('PRETTY_NAME="Ubuntu 24.04 LTS"', 'ID=ubuntu')], [/^man\s/, 'Handbuchseite (simuliert) – Taste q beendet. Tipp: --help oder tldr geht schneller.'],
      [/^grep/, L('Oct  8 09:11:02 lab sshd[812]: error: maximum authentication attempts exceeded')], [/^systemctl status/, L('● ssh.service - OpenBSD Secure Shell server', '     Active: active (running) since Thu 2026-10-08 08:00:12 CEST')]
    ]
  };
  const BERECHTIGUNG = { bash: /^sudo\s/ };

  let sh = 'ps', idx = 0, hist = [], hi = 0, iosModus = 'user', iosKontext = '', geloest = 0, zeigeLoesung = false;

  function prompt() {
    if (sh === 'ps') return 'PS C:\\Users\\Administrator> ';
    if (sh === 'cmd') return 'C:\\Users\\azubi>';
    if (sh === 'bash') return 'azubi@lab-ubuntu:~$ ';
    const h = 'SW1';
    return { user: h + '>', priv: h + '#', config: h + '(config)#', if: h + '(config-if)#', vlan: h + '(config-vlan)#' }[iosModus];
  }
  const norm = s => s.trim().replace(/\s+/g, ' ').toLowerCase();

  // IOS-Zustandsmaschine
  function iosBefehl(cmd) {
    const n = norm(cmd);
    if (/^en(a|ab|abl|able)?$/.test(n)) { if (iosModus === 'user') { iosModus = 'priv'; return ''; } return ''; }
    if (/^(conf(igure)?|conf t|configure terminal)( t(erminal)?)?$/.test(n) || n === 'conf t') { if (iosModus === 'priv') { iosModus = 'config'; return 'Enter configuration commands, one per line.  End with CNTL/Z.'; } return '% Invalid input detected (erst mit „enable“ in den privilegierten Modus).'; }
    if (/^(exit|end)$/.test(n)) { if (n === 'end' || iosModus === 'config') iosModus = n === 'end' ? 'priv' : 'priv'; else if (iosModus === 'if' || iosModus === 'vlan') iosModus = 'config'; else if (iosModus === 'priv') iosModus = 'user'; return ''; }
    if (iosModus === 'config' && /^int(erface)? \S+/.test(n)) { iosModus = 'if'; return ''; }
    if (iosModus === 'config' && /^vlan \d+$/.test(n)) { iosModus = 'vlan'; return ''; }
    if (iosModus === 'user' && /^(sh|show|ping)/.test(n)) return null;
    if (iosModus === 'user') return '% Befehl erfordert privilegierten Modus (enable).';
    return null;
  }
  function inhalt() {
    const aufg = AUFG[sh], a = aufg[idx % aufg.length];
    return a;
  }
  function pruefe(cmd, ausgabeOk) {
    const a = inhalt(), n = norm(cmd);
    let ok = a.ok.test(n);
    if (ok && sh === 'ios' && a.modus) ok = iosModus === a.modus || (a.modus === 'config' && iosModus === 'config');
    return ok;
  }

  function ansicht() {
    krumen([START, { txt: 'Terminal-Trainer' }]);
    const a = inhalt();
    const stand = S.p.terminal[sh] || (S.p.terminal[sh] = { ok: 0 });
    $('#inhalt').innerHTML = `
      <h1>Terminal-Trainer</h1>
      <p class="unter">Simulierte Konsole – nichts wird wirklich ausgeführt. Aufgaben mit Prüfung, freie Befehle mit Beispielausgabe. Pfeiltasten hoch/runter = Verlauf, <kbd>Tab</kbd> = Vervollständigen.</p>
      <div class="term-tabs">${Object.entries(SH).map(([k, v]) => `<button class="glas knopf ${k === sh ? 'primär' : ''}" data-sh="${k}">${v.name}</button>`).join('')}</div>
      <p class="unter">${E(SH[sh].hinweis)} · Gelöst: <b>${stand.ok}</b></p>
      <div class="glas term-aufgabe"><b>Aufgabe ${idx % AUFG[sh].length + 1}/${AUFG[sh].length}:</b> ${E(a.f)}
        <span class="term-knoepfe"><button class="glas knopf" id="t-hinweis">Lösung zeigen</button><button class="glas knopf" id="t-weiter">Nächste Aufgabe</button></span>
        <div id="t-loesung" class="rechenweg" hidden><code>${E(a.l)}</code></div></div>
      <div class="term" id="term" style="--tf:${SH[sh].farbe}"><div id="term-out" aria-live="polite"></div><div class="term-zeile"><span id="term-prompt"></span><input id="term-in" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Befehl eingeben"></div></div>`;
    document.querySelectorAll('[data-sh]').forEach(b => b.onclick = () => { sh = b.dataset.sh; idx = 0; iosModus = 'user'; hist = []; ansicht(); });
    $('#t-hinweis').onclick = () => { $('#t-loesung').hidden = !$('#t-loesung').hidden; };
    $('#t-weiter').onclick = () => { idx++; ansicht(); };
    const out = $('#term-out'), inp = $('#term-in'), pr = $('#term-prompt');
    const schreibe = (t, k) => { const d = document.createElement('div'); d.className = k || ''; d.textContent = t; out.appendChild(d); $('#term').scrollTop = 1e6; };
    const setzePrompt = () => { pr.textContent = prompt(); };
    schreibe(sh === 'ios' ? 'Cisco IOS Software – SW1 con0 ist jetzt verfügbar. Drücke RETURN.' : sh === 'bash' ? 'Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0-45-generic x86_64)' : 'Windows ' + (sh === 'ps' ? 'PowerShell – Copyright (C) Microsoft Corporation.' : '[Version 10.0.22631]'), 'term-info');
    setzePrompt();
    inp.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp') { e.preventDefault(); if (hist.length) { hi = Math.max(0, hi - 1); inp.value = hist[hi] || ''; } }
      else if (e.key === 'ArrowDown') { e.preventDefault(); hi = Math.min(hist.length, hi + 1); inp.value = hist[hi] || ''; }
      else if (e.key === 'Tab') {
        e.preventDefault();
        const kandidaten = [...new Set(AUFG[sh].map(x => x.l.split(' → ').pop()).concat(FREI[sh].map(f => f[0].source.replace(/[\^\\$()?|].*$/, ''))))].filter(x => x && x.toLowerCase().startsWith(inp.value.toLowerCase()));
        if (kandidaten.length === 1) inp.value = kandidaten[0];
      }
      else if (e.key === 'Enter') {
        const cmd = inp.value; inp.value = '';
        schreibe(prompt() + cmd, 'term-cmd');
        if (!cmd.trim()) return;
        hist.push(cmd); hi = hist.length;
        antwort(cmd, schreibe, out, setzePrompt);
      }
    });
    $('#term').onclick = () => inp.focus();
    inp.focus();
  }
  function antwort(cmd, schreibe, out, setzePrompt) {
    const n = norm(cmd);
    let ausgabe = null;
    if (sh === 'ios') { ausgabe = iosBefehl(cmd); if (ausgabe) schreibe(ausgabe, 'term-err'); }
    // Aufgabenprüfung vor Ausgabe (IOS: Modus vor/nach dem Befehl berücksichtigen)
    const korrekt = pruefe(cmd);
    if (ausgabe === null || ausgabe === undefined) {
      let gefunden = false;
      for (const [re, txt] of FREI[sh]) if (re.test(n)) { gefunden = true; if (txt === '@@clear') out.innerHTML = ''; else schreibe(txt); break; }
      if (!gefunden && !korrekt && !(sh === 'ios' && ['config', 'if', 'vlan'].includes(iosModus))) {
        const msg = { ps: `Die Benennung „${cmd.split(' ')[0]}“ wurde nicht als Name eines Cmdlet erkannt.`, cmd: `„${cmd.split(' ')[0]}“ ist kein interner oder externer Befehl.`, ios: '% Invalid input detected at \'^\' marker.', bash: `bash: ${cmd.split(' ')[0]}: Befehl nicht gefunden` }[sh];
        schreibe(msg, 'term-err');
      } else if (!gefunden && korrekt && sh !== 'ios') schreibe(sh === 'bash' ? '' : '(ausgeführt)', 'term-info');
    }
    if (korrekt) {
      schreibe('✔ Aufgabe gelöst! (+XP)', 'term-ok');
      const st = S.p.terminal[sh] || (S.p.terminal[sh] = { ok: 0 }); st.ok++; speichern(); melde('terminal', 1);
      setTimeout(() => { idx++; const w = document.querySelector('#t-weiter'); if (w && S.ansicht?.ansicht === 'terminal') { const verlaufMerk = hist.slice(); ansicht(); hist = verlaufMerk; } }, 1400);
    }
    setzePrompt();
  }
  window.VIEWS = Object.assign(window.VIEWS || {}, { terminal: ansicht });
  return { AUFG, FREI, SH, norm };
})();
window.Terminal = Terminal;
