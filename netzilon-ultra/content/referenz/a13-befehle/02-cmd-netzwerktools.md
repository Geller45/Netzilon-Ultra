---
id: ref-cmd-tools
bereich: Referenz
block: A13
kapitel: Befehlsreferenz
titel: CMD- und Netzwerktools (Windows)
stufe: Einsteiger
typ: referenz
quellen: [Eigene Zusammenstellung, Microsoft Learn]
verweise: [ap1-a4-netzwerkgrundlagen, ap1-a5-dns, ap1-a5-dhcp, az801-ad-replikation]
---

## Profi

Die klassischen **Kommandozeilentools** laufen in **CMD** und **PowerShell**. Für die **Fehlersuche im Netzwerk** gilt eine feste Reihenfolge (von unten nach oben durch die Schichten): **1.** `ipconfig /all` (habe ich eine gültige IP, Gateway, DNS?), **2.** `ping 127.0.0.1` (Stack ok), **3.** `ping` eigene IP, **4.** `ping` Gateway, **5.** `ping` Ziel-IP, **6.** `ping` Zielname (**DNS**), **7.** `tracert` (wo bricht der Weg ab?), **8.** `nslookup`, `netstat -ano`, `arp -a` für Details.

Für **AD** gibt es die Trio-Diagnose: `dcdiag` (Gesundheit), `repadmin /replsummary` (Replikation) und `nltest /dsgetdc` (welcher DC antwortet). Das Werkzeug **`icacls`** setzt NTFS-Rechte, **`robocopy`** kopiert robust (`/MIR` spiegelt und **löscht** im Ziel).

## Einfach

Bei einem Netzwerkproblem gehst du vor wie ein **Arzt**: erst **Puls fühlen** (`ipconfig`: Habe ich überhaupt eine Adresse?), dann **an die Tür klopfen** (`ping` zum Gateway), dann **nach der Adresse fragen** (`nslookup`: Kennt das Telefonbuch den Namen?), und wenn es weit weg ist, **den Weg verfolgen** (`tracert`). So findest du den Fehler **Schicht für Schicht**. Für den Domänencontroller ist `dcdiag` der **Gesundheitscheck**.

## Merksatz
- Fehlersuche **von unten nach oben**: IP → Gateway → Ziel-IP → Name.
- **`ipconfig /release` + `/renew`** = neue DHCP-Adresse.
- **`ping -t`** = Dauerping, **`ping -f -l`** = MTU-Test.
- **`dcdiag`, `repadmin /replsummary`, `netdom query fsmo`** = AD-Trio.
- **`gpupdate /force`** = sofort, **`gpresult /r`** = was gilt?

## Prüfungsfalle
- `ping` blockiert = **nicht** automatisch Netzfehler (Firewall kann ICMP sperren).
- `ipconfig /flushdns` leert den **Client**-Cache, nicht den DNS-Server-Cache.
- `robocopy /MIR` **löscht** Dateien im Ziel, die in der Quelle fehlen.
- **`net use`** ist Legacy-Stil, PowerShell hat `New-SmbMapping`.
- Ein `169.254.x.x` bedeutet: **kein DHCP** erreichbar (APIPA).

## Grafik

### Diagnose-Leiter
Eine Leiter mit sieben Sprossen (ipconfig, Loopback, eigene IP, Gateway, Ziel-IP, Name, tracert). Ein Klick auf „Ping Gateway schlägt fehl“ färbt die Sprossen darüber grau und leuchtet die Ursache („Kabel/Switch/VLAN“) auf.

## Befehle

### Netzwerk-Diagnose
- `ipconfig /all` – Vollständige IP-Konfiguration inkl. MAC, DHCP, DNS
- `ipconfig /release` – DHCP-Lease freigeben
- `ipconfig /renew` – DHCP-Lease erneuern
- `ipconfig /flushdns` – DNS-Client-Cache leeren
- `ipconfig /displaydns` – DNS-Client-Cache anzeigen
- `ipconfig /registerdns` – DNS-Namen des Clients neu registrieren
- `ping -t 10.0.0.1` – Dauer-Ping bis Abbruch (Strg+C)
- `ping -f -l 1472 www.example.com` – Ping ohne Fragmentierung mit Paketgröße (MTU-Test)
- `tracert www.example.com` – Weg der Pakete (Hops) anzeigen
- `pathping www.example.com` – Kombination aus tracert und Ping-Statistik pro Hop
- `nslookup www.example.com` – DNS-Namen auflösen
- `nslookup -type=SRV _ldap._tcp.dc._msdcs.firma.local` – SRV-Einträge der Domänencontroller abfragen
- `arp -a` – ARP-Tabelle (IP → MAC) anzeigen
- `netstat -ano` – Verbindungen und lauschende Ports mit Prozess-ID
- `route print` – Routingtabelle anzeigen
- `route add 10.2.0.0 mask 255.255.0.0 10.1.0.254 -p` – Statische Route dauerhaft hinzufügen
- `nbtstat -n` – Lokale NetBIOS-Namen anzeigen
- `getmac` – MAC-Adressen der Adapter anzeigen
- `hostname` – Computernamen anzeigen
- `netsh interface ip show config` – IP-Konfiguration per netsh anzeigen
- `netsh wlan show profiles` – Gespeicherte WLAN-Profile anzeigen
- `netsh advfirewall set allprofiles state off` – Firewall für alle Profile ausschalten (nur Test!)

### Konten, Freigaben, Richtlinien
- `whoami /all` – Benutzer, Gruppen und Rechte des aktuellen Kontos
- `net user anna /domain` – Domänenbenutzer anzeigen
- `net use Z: \\SRV01\Daten` – Netzlaufwerk verbinden
- `net share` – Lokale Freigaben anzeigen
- `net localgroup Administratoren` – Mitglieder der lokalen Admin-Gruppe anzeigen
- `gpupdate /force` – Gruppenrichtlinien sofort neu anwenden
- `gpresult /r` – Angewendete Richtlinien (Zusammenfassung) anzeigen
- `gpresult /h bericht.html` – Ausführlicher GPO-Bericht als HTML
- `klist` – Kerberos-Tickets des Kontos anzeigen
- `nltest /dsgetdc:firma.local` – Domänencontroller der Domäne ermitteln
- `w32tm /query /status` – Status der Zeitsynchronisierung anzeigen
- `w32tm /resync` – Zeitsynchronisierung sofort auslösen

### AD-Diagnose und Zertifikate
- `dcdiag` – Integritätstests eines Domänencontrollers
- `repadmin /replsummary` – Zusammenfassung der AD-Replikation
- `repadmin /showrepl` – Replikationspartner und letzter Erfolg
- `netdom query fsmo` – Inhaber der FSMO-Rollen anzeigen
- `ntdsutil` – Konsole für AD-Wartung (Metadaten, autoritative Wiederherstellung)
- `dfsrmig /getmigrationstate` – Stand der SYSVOL-Migration FRS → DFSR
- `certutil -backup C:\CABackup` – Zertifizierungsstelle sichern
- `certutil -dspublish -f root.cer RootCA` – Root-Zertifikat in AD veröffentlichen
- `certutil -crl` – Neue CRL veröffentlichen

### Datenträger, Dateien, System
- `diskpart` – Partitionierungswerkzeug (list disk, select disk, clean, convert gpt)
- `chkdsk C: /f` – Dateisystem prüfen und reparieren
- `sfc /scannow` – Systemdateien prüfen und reparieren
- `DISM /Online /Cleanup-Image /RestoreHealth` – Windows-Komponentenspeicher reparieren
- `robocopy C:\Daten D:\Backup /MIR` – Ordner spiegeln (Vorsicht: löscht im Ziel)
- `xcopy /E /I` – Dateien und Unterordner kopieren (älter, robocopy bevorzugen)
- `icacls D:\HR /grant "FIRMA\GG-HR:(OI)(CI)M"` – NTFS-Rechte setzen (Ändern, vererbt)
- `cipher /w:D:` – Freien Speicherplatz sicher überschreiben
- `systeminfo` – System-, Betriebssystem- und Hotfix-Informationen
- `tasklist` – Laufende Prozesse anzeigen
- `taskkill /PID 1234 /F` – Prozess beenden
- `shutdown /r /t 0` – Sofort neu starten
- `mbr2gpt /validate /allowFullOS` – Prüfen, ob MBR → GPT konvertiert werden kann
- `bcdedit` – Bootkonfiguration anzeigen

## Karteikarten
- F: Wofür steht/was bewirkt ipconfig /all? | A: Vollständige IP-Konfiguration inkl. MAC, DHCP, DNS
- F: Wofür steht/was bewirkt ipconfig /release? | A: DHCP-Lease freigeben
- F: Wofür steht/was bewirkt ipconfig /renew? | A: DHCP-Lease erneuern
- F: Wofür steht/was bewirkt ipconfig /flushdns? | A: DNS-Client-Cache leeren
- F: Wofür steht/was bewirkt ipconfig /displaydns? | A: DNS-Client-Cache anzeigen
- F: Wofür steht/was bewirkt ipconfig /registerdns? | A: DNS-Namen des Clients neu registrieren
- F: Wofür steht/was bewirkt ping -t 10.0.0.1? | A: Dauer-Ping bis Abbruch (Strg+C)
- F: Wofür steht/was bewirkt ping -f -l 1472 www.example.com? | A: Ping ohne Fragmentierung mit Paketgröße (MTU-Test)
- F: Wofür steht/was bewirkt tracert www.example.com? | A: Weg der Pakete (Hops) anzeigen
- F: Wofür steht/was bewirkt pathping www.example.com? | A: Kombination aus tracert und Ping-Statistik pro Hop
- F: Wofür steht/was bewirkt nslookup www.example.com? | A: DNS-Namen auflösen
- F: Wofür steht/was bewirkt nslookup -type=SRV _ldap._tcp.dc._msdcs.firma.local? | A: SRV-Einträge der Domänencontroller abfragen
- F: Wofür steht/was bewirkt arp -a? | A: ARP-Tabelle (IP → MAC) anzeigen
- F: Wofür steht/was bewirkt netstat -ano? | A: Verbindungen und lauschende Ports mit Prozess-ID
- F: Wofür steht/was bewirkt route print? | A: Routingtabelle anzeigen
- F: Wofür steht/was bewirkt route add 10.2.0.0 mask 255.255.0.0 10.1.0.254 -p? | A: Statische Route dauerhaft hinzufügen
- F: Wofür steht/was bewirkt nbtstat -n? | A: Lokale NetBIOS-Namen anzeigen
- F: Wofür steht/was bewirkt getmac? | A: MAC-Adressen der Adapter anzeigen
- F: Wofür steht/was bewirkt hostname? | A: Computernamen anzeigen
- F: Wofür steht/was bewirkt netsh interface ip show config? | A: IP-Konfiguration per netsh anzeigen
- F: Wofür steht/was bewirkt netsh wlan show profiles? | A: Gespeicherte WLAN-Profile anzeigen
- F: Wofür steht/was bewirkt netsh advfirewall set allprofiles state off? | A: Firewall für alle Profile ausschalten (nur Test!)
- F: Wofür steht/was bewirkt whoami /all? | A: Benutzer, Gruppen und Rechte des aktuellen Kontos
- F: Wofür steht/was bewirkt net user anna /domain? | A: Domänenbenutzer anzeigen
- F: Wofür steht/was bewirkt net use Z: \\SRV01\Daten? | A: Netzlaufwerk verbinden
- F: Wofür steht/was bewirkt net share? | A: Lokale Freigaben anzeigen
- F: Wofür steht/was bewirkt net localgroup Administratoren? | A: Mitglieder der lokalen Admin-Gruppe anzeigen
- F: Wofür steht/was bewirkt gpupdate /force? | A: Gruppenrichtlinien sofort neu anwenden
- F: Wofür steht/was bewirkt gpresult /r? | A: Angewendete Richtlinien (Zusammenfassung) anzeigen
- F: Wofür steht/was bewirkt gpresult /h bericht.html? | A: Ausführlicher GPO-Bericht als HTML
- F: Wofür steht/was bewirkt klist? | A: Kerberos-Tickets des Kontos anzeigen
- F: Wofür steht/was bewirkt nltest /dsgetdc:firma.local? | A: Domänencontroller der Domäne ermitteln
- F: Wofür steht/was bewirkt w32tm /query /status? | A: Status der Zeitsynchronisierung anzeigen
- F: Wofür steht/was bewirkt w32tm /resync? | A: Zeitsynchronisierung sofort auslösen
- F: Wofür steht/was bewirkt dcdiag? | A: Integritätstests eines Domänencontrollers
- F: Wofür steht/was bewirkt repadmin /replsummary? | A: Zusammenfassung der AD-Replikation
- F: Wofür steht/was bewirkt repadmin /showrepl? | A: Replikationspartner und letzter Erfolg
- F: Wofür steht/was bewirkt netdom query fsmo? | A: Inhaber der FSMO-Rollen anzeigen
- F: Wofür steht/was bewirkt ntdsutil? | A: Konsole für AD-Wartung (Metadaten, autoritative Wiederherstellung)
- F: Wofür steht/was bewirkt dfsrmig /getmigrationstate? | A: Stand der SYSVOL-Migration FRS → DFSR
- F: Wofür steht/was bewirkt certutil -backup C:\CABackup? | A: Zertifizierungsstelle sichern
- F: Wofür steht/was bewirkt certutil -dspublish -f root.cer RootCA? | A: Root-Zertifikat in AD veröffentlichen
- F: Wofür steht/was bewirkt certutil -crl? | A: Neue CRL veröffentlichen
- F: Wofür steht/was bewirkt diskpart? | A: Partitionierungswerkzeug (list disk, select disk, clean, convert gpt)
- F: Wofür steht/was bewirkt chkdsk C: /f? | A: Dateisystem prüfen und reparieren
- F: Wofür steht/was bewirkt sfc /scannow? | A: Systemdateien prüfen und reparieren
- F: Wofür steht/was bewirkt DISM /Online /Cleanup-Image /RestoreHealth? | A: Windows-Komponentenspeicher reparieren
- F: Wofür steht/was bewirkt robocopy C:\Daten D:\Backup /MIR? | A: Ordner spiegeln (Vorsicht: löscht im Ziel)
- F: Wofür steht/was bewirkt xcopy /E /I? | A: Dateien und Unterordner kopieren (älter, robocopy bevorzugen)
- F: Wofür steht/was bewirkt icacls D:\HR /grant "FIRMA\GG-HR:(OI)(CI)M"? | A: NTFS-Rechte setzen (Ändern, vererbt)
- F: Wofür steht/was bewirkt cipher /w:D:? | A: Freien Speicherplatz sicher überschreiben
- F: Wofür steht/was bewirkt systeminfo? | A: System-, Betriebssystem- und Hotfix-Informationen
- F: Wofür steht/was bewirkt tasklist? | A: Laufende Prozesse anzeigen
- F: Wofür steht/was bewirkt taskkill /PID 1234 /F? | A: Prozess beenden
- F: Wofür steht/was bewirkt shutdown /r /t 0? | A: Sofort neu starten
- F: Wofür steht/was bewirkt mbr2gpt /validate /allowFullOS? | A: Prüfen, ob MBR → GPT konvertiert werden kann
- F: Wofür steht/was bewirkt bcdedit? | A: Bootkonfiguration anzeigen

## Quiz

? Was bewirkt `whoami /all`?
* Benutzer, Gruppen und Rechte des aktuellen Kontos
- Ping ohne Fragmentierung mit Paketgröße (MTU-Test)
- Replikationspartner und letzter Erfolg
- DNS-Namen des Clients neu registrieren

? Was bewirkt `shutdown /r /t 0`?
* Sofort neu starten
- Zusammenfassung der AD-Replikation
- Computernamen anzeigen
- Zertifizierungsstelle sichern

? Was bewirkt `bcdedit`?
* Bootkonfiguration anzeigen
- Stand der SYSVOL-Migration FRS → DFSR
- Domänenbenutzer anzeigen
- Replikationspartner und letzter Erfolg

? Was bewirkt `ntdsutil`?
* Konsole für AD-Wartung (Metadaten, autoritative Wiederherstellung)
- ARP-Tabelle (IP → MAC) anzeigen
- Sofort neu starten
- DNS-Client-Cache anzeigen

? Was bewirkt `nbtstat -n`?
* Lokale NetBIOS-Namen anzeigen
- Netzlaufwerk verbinden
- Replikationspartner und letzter Erfolg
- Zertifizierungsstelle sichern

? Was bewirkt `systeminfo`?
* System-, Betriebssystem- und Hotfix-Informationen
- DNS-Namen des Clients neu registrieren
- Routingtabelle anzeigen
- Dauer-Ping bis Abbruch (Strg+C)

? Was bewirkt `ipconfig /renew`?
* DHCP-Lease erneuern
- Windows-Komponentenspeicher reparieren
- Stand der SYSVOL-Migration FRS → DFSR
- System-, Betriebssystem- und Hotfix-Informationen

? Was bewirkt `DISM /Online /Cleanup-Image /RestoreHealth`?
* Windows-Komponentenspeicher reparieren
- Zertifizierungsstelle sichern
- Domänenbenutzer anzeigen
- DNS-Namen auflösen

? Was bewirkt `gpresult /h bericht.html`?
* Ausführlicher GPO-Bericht als HTML
- Zusammenfassung der AD-Replikation
- Integritätstests eines Domänencontrollers
- Verbindungen und lauschende Ports mit Prozess-ID

? Was bewirkt `dcdiag`?
* Integritätstests eines Domänencontrollers
- System-, Betriebssystem- und Hotfix-Informationen
- MAC-Adressen der Adapter anzeigen
- Prozess beenden
