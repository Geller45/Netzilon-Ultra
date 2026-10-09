---
id: ap1-a5-firewall
bereich: AP1
block: A5
kapitel: Netzdienste
titel: Firewall – Typen, DMZ, Windows Defender Firewall
stufe: Fortgeschritten
quellen: [Firewall_ms.pdf, 13-02-uebung-Firewall-b.pdf, Aufgaben10.pdf]
verweise: [ap1-a5-vpn, ap1-a4-netzwerkgrundlagen, ap1-a4-routing, az801-firewall-lokal]
---

## Profi

### Aufgabe
Eine **Firewall** schützt einen Rechner oder ein Netz vor **unerwünschten Netzwerkzugriffen**, indem sie den Datenverkehr anhand **klar definierter Regeln** erlaubt oder blockiert. Grundprinzip in Unternehmen: **Default Deny** – alles verboten, was nicht ausdrücklich erlaubt ist (Whitelist).
- **Personal/Host-Firewall**: Software auf einem einzelnen Rechner (Windows Defender Firewall).
- **Netzwerk-/externe Firewall**: eigenes Gerät (Appliance) zwischen Netzen, schützt ein ganzes Netz (Sophos, Fortinet, pfSense/OPNsense, Palo Alto).
- Eine klassische Firewall **erkennt keine Angriffe** im erlaubten Verkehr → dafür **IDS** (Intrusion Detection System, meldet) bzw. **IPS** (Intrusion Prevention System, blockiert), oft auf derselben Hardware (**UTM**/**NGFW**).

### Firewalltypen
| Typ | OSI | Prüft | Vorteile | Nachteile |
|---|---|---|---|---|
| **Paketfilter** (stateless) | 3/4 | Quell-/Ziel-IP, Protokoll, Ports – jedes Paket einzeln | schnell, einfach, günstig | kennt keine Verbindungen; Rückverkehr muss extra erlaubt werden; leicht zu täuschen |
| **Stateful Packet Inspection (SPI)** | 3/4 | zusätzlich den **Verbindungszustand** (Zustandstabelle): merkt sich ausgehende Anfragen und lässt **nur die passenden Antworten** dynamisch zurück | sicherer, weniger Regeln, heute Standard | mehr Ressourcen |
| **Application-Level-Gateway (Proxy)** | 7 | Inhalte der Anwendung; der **Proxy baut als Stellvertreter** die Verbindung zum Server auf und gibt Antworten an den Client weiter | sehr genaue Regeln, **Inhaltsfilter** (Viren, URLs), Client bleibt verborgen | für **jeden Dienst eigener Proxy**, langsamer, aufwendig |
| **Next-Generation Firewall** | 3–7 | SPI + Anwendungserkennung + IPS + TLS-Inspection + Benutzerbezug | umfassend | teuer, komplex |

### Typische Architektur mit DMZ
Die **DMZ** (Demilitarized Zone) ist ein eigenes Netzsegment zwischen Internet und internem LAN für **öffentlich erreichbare Server** (Webserver, Mail-Relay, Reverse-Proxy).
- **Internet → DMZ**: nur benötigte Dienste (z. B. TCP 443 zum Webserver).
- **DMZ → LAN**: grundsätzlich verboten bzw. nur eng definierte Verbindungen (z. B. Webserver → SQL-Server Port 1433).
- **LAN → Internet/DMZ**: erlaubt nach Regeln.
Wird ein DMZ-Server kompromittiert, ist das interne Netz weiter geschützt. Varianten: **eine Firewall mit drei Schnittstellen** (Internet, DMZ, LAN – wie im Netzplan der Event GmbH: WAN 80.90.100.2/30, LAN-Transfer 172.16.31.1/30, DMZ 192.168.250.0/29) oder **zwei Firewalls hintereinander** (idealerweise verschiedener Hersteller).

### Regeln
Eine Regel besteht aus: **Richtung** (eingehend/ausgehend), **Quelle**, **Ziel**, **Protokoll/Port**, **Aktion** (Zulassen/Blockieren), ggf. **Profil**, Programm, Benutzer. Regeln werden meist **von oben nach unten** abgearbeitet (erste passende gewinnt – bei Hardware-Firewalls); am Ende steht „alles verbieten“.

### Windows Defender Firewall
- **Eingehende Regeln**: steuern Zugriffe **auf** diesen Rechner – Standard **Blockieren** (außer Ausnahmen).
- **Ausgehende Regeln**: steuern Zugriffe **von** diesem Rechner – Standard **Zulassen** (seit Vista konfigurierbar).
- **Verbindungssicherheitsregeln**: verlangen **IPsec-Authentifizierung/Verschlüsselung** zwischen Rechnern (Domänen-/Serverisolierung).
- **Profile** – je nach erkanntem Netzwerk (Network Location Awareness):
  - **Domäne**: Rechner erreicht einen DC seiner Domäne
  - **Privat**: vertrauenswürdiges Netz (manuell)
  - **Öffentlich**: unbekanntes Netz – strengste Einstellungen (Standard für neue Netze)
- **Regeltypen**: **Programm** (für eine .exe), **Port** (TCP/UDP-Nummer), **Vordefiniert** (Regelgruppen wie „Datei- und Druckerfreigabe“, „Remotedesktop“, „WWW-Dienste“), **Benutzerdefiniert** (alles kombinierbar, inkl. ICMP-Typ, IP-Bereiche).
- Filterung nach **Quell- und Ziel-IP** (Bereich), **Schnittstellentyp**, Benutzer/Computer.
- Einstellungen: aktivieren/deaktivieren je Profil, „**Alle eingehenden Verbindungen blockieren** (keine Ausnahmen)“, Benachrichtigungen, **Protokollierung** (`%SystemRoot%\System32\LogFiles\Firewall\pfirewall.log`, standardmäßig aus – verworfene/erfolgreiche Verbindungen aktivierbar).
- Verwaltung: `wf.msc` („Windows Defender Firewall mit erweiterter Sicherheit“, MMC-Snap-In), **GPO** (Computerkonfiguration → Richtlinien → Windows-Einstellungen → Sicherheitseinstellungen → Windows Defender Firewall mit erweiterter Sicherheit), `netsh advfirewall` (das alte `netsh firewall` ist veraltet), PowerShell-Modul **NetSecurity**.
- **Nie** in Produktion komplett abschalten – stattdessen gezielte Regeln.

### ICMP
**ICMP** (Internet Control Message Protocol) überträgt Status- und Fehlermeldungen (ping = Echo Request Typ 8 / Echo Reply Typ 0). Die Windows-Firewall blockiert eingehende Echo-Anforderungen standardmäßig → Rechner antwortet nicht auf ping, obwohl er erreichbar ist. Lösung: vordefinierte Regel **„Datei- und Druckerfreigabe (Echoanforderung – ICMPv4 eingehend)“** aktivieren. ICMPv6 ist für IPv6 lebenswichtig (NDP) und darf nicht pauschal gesperrt werden.

### Ports für die Übung
- **HTTP 80**, HTTPS 443 → vordefinierte Gruppe **„WWW-Dienste (HTTP eingehender Datenverkehr)“** – wird bei der IIS-Installation meist automatisch angelegt/aktiviert.
- **FTP**: Steuerkanal **TCP 21**, Daten **TCP 20** (aktiv) oder **dynamische Ports** (passiv) → Gruppe **„FTP-Server“** (inkl. Passiv-Regel); der FTP-Dienst meldet sich zusätzlich als zustandsbehaftete Firewall-Ausnahme an.

## Lab
**Maschinen**: CL01 (Windows 11) und SRV01 (Windows Server 2022/2025) im gleichen Hyper-V-Switch (entspricht „Host-Only“ in VMware).

### GUI
1. **Beide**: `wf.msc` → Eigenschaften → alle Profile **Aus** → gegenseitig `ping` → funktioniert.
2. **Beide**: Firewall wieder **Ein** → ping scheitert.
3. **Beide**: Eingehende Regeln → **„Datei- und Druckerfreigabe (Echoanforderung – ICMPv4 eingehend)“** → Regel aktivieren (passendes Profil) → ping funktioniert.
4. **SRV01**: Server-Manager → Rollen und Features → **Webserver (IIS)** → Rollendienste zusätzlich **FTP-Server** (FTP-Dienst) → Installieren.
5. **CL01**: Browser → `http://<IP von SRV01>` – wenn die Regel „WWW-Dienste (HTTP eingehend)“ nicht aktiv ist, scheitert es → **SRV01**: diese Regel aktivieren → Standard-Website erscheint.
6. **SRV01**: Tools → **IIS-Manager** → Sites → Rechtsklick **FTP-Site hinzufügen** → Name „Test-FTP“, Pfad `C:\inetpub\ftproot` → Bindung: alle IPs, Port 21, **Kein SSL** → Authentifizierung **Anonym + Standard**, Autorisierung **Alle Benutzer: Lesen + Schreiben** (nur Testumgebung!).
7. **CL01**: `cmd` → `ftp` → `open <IP SRV01>` → keine Antwort, falls die Regel fehlt.
8. **SRV01**: Eingehende Regeln → **„FTP-Server (FTP-Datenverkehr eingehend)“** und **„FTP-Server Passiv“** aktivieren → `net stop ftpsvc & net start ftpsvc`.
9. **CL01**: `ftp` → `open <IP>` → Benutzer `anonymous` → `dir`, `quit`.
10. **SRV01**: `wf.msc` → Eigenschaften → Profil → Protokollierung → **Verworfene Pakete: Ja**, **Erfolgreiche Verbindungen: Ja** → Log unter `C:\Windows\System32\LogFiles\Firewall\pfirewall.log` ansehen.

### PowerShell
```powershell
# Beide – Firewall-Status
Get-NetFirewallProfile | Format-Table Name, Enabled, DefaultInboundAction, DefaultOutboundAction

# Beide – ping erlauben
Enable-NetFirewallRule -Name "FPS-ICMP4-ERQ-In"

# SRV01 – IIS + FTP installieren
Install-WindowsFeature Web-Server, Web-Ftp-Server -IncludeManagementTools
Enable-NetFirewallRule -DisplayGroup "WWW-Dienste (HTTP)"      # deutsche Gruppenbezeichnung
Enable-NetFirewallRule -DisplayGroup "FTP-Server"
# Alternativ sprachunabhängig eigene Regeln:
New-NetFirewallRule -DisplayName "HTTP 80 eingehend" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow -Profile Any
New-NetFirewallRule -DisplayName "FTP 21 eingehend" -Direction Inbound -Protocol TCP -LocalPort 21 -Action Allow

# FTP-Site anlegen (Testumgebung)
Import-Module WebAdministration
New-WebFtpSite -Name "Test-FTP" -Port 21 -PhysicalPath "C:\inetpub\ftproot"
Set-ItemProperty "IIS:\Sites\Test-FTP" -Name ftpServer.security.ssl.controlChannelPolicy -Value 0
Set-ItemProperty "IIS:\Sites\Test-FTP" -Name ftpServer.security.ssl.dataChannelPolicy -Value 0
Set-ItemProperty "IIS:\Sites\Test-FTP" -Name ftpServer.security.authentication.anonymousAuthentication.enabled -Value $true
Add-WebConfiguration "/system.ftpServer/security/authorization" -PSPath IIS:\ -Location "Test-FTP" -Value @{accessType="Allow";users="*";permissions="Read,Write"}

# SRV01 – Protokollierung
Set-NetFirewallProfile -Profile Domain,Private,Public -LogBlocked True -LogAllowed True -LogFileName "%SystemRoot%\System32\LogFiles\Firewall\pfirewall.log"
Get-Content C:\Windows\System32\LogFiles\Firewall\pfirewall.log -Tail 20

# CL01 – Tests
Test-NetConnection <IP-SRV01> -Port 80
Test-NetConnection <IP-SRV01> -Port 21
```

## Übungen
- A: Was bedeutet ICMP? | L: Internet Control Message Protocol – Status- und Fehlermeldungen (ping, tracert, „Ziel nicht erreichbar“)
- A: Warum funktioniert ping nach dem Einschalten der Firewall nicht mehr? | L: Eingehende ICMP-Echoanforderungen werden standardmäßig blockiert
- A: Warum ist die Standard-Website zunächst nicht erreichbar? | L: Eingehender TCP-Port 80 ist blockiert, bis die Regel „WWW-Dienste (HTTP eingehend)“ aktiv ist
- A: Welche Ports braucht FTP? | L: TCP 21 (Steuerung) und TCP 20 bzw. dynamische Ports im Passivmodus (Daten)

## Einfach

Eine Firewall ist der **Türsteher** vor einem Club (dem Netzwerk). Er hat eine **Gästeliste** (Regeln) und lässt nur rein, wer draufsteht.

**Drei Sorten Türsteher**:
- **Paketfilter**: Schaut nur auf den **Ausweis** (Adresse und Port): „Kommst du von hier und willst zu Tür 80? Okay.“ Schnell, aber nicht sehr schlau.
- **Stateful Inspection**: Merkt sich zusätzlich, **wer rausgegangen ist**: „Du hast vorhin Pizza bestellt – der Pizzabote darf rein.“ Wer nicht erwartet wird, bleibt draußen.
- **Proxy**: Lässt **niemanden direkt** rein. Er nimmt dein Paket an der Tür entgegen, **schaut hinein** (Virus?), und bringt es dann selbst zu dir. Sehr sicher, aber langsam, und für jede Sorte Lieferung braucht man einen eigenen Proxy.

**DMZ** ist wie der **Empfangsbereich** eines Firmengebäudes: Besucher (das Internet) dürfen bis zum Empfang (Webserver), aber nicht in die Büros (internes Netz). Bricht jemand im Empfang ein, ist das Büro trotzdem noch abgeschlossen.

**Windows-Firewall**:
- **Rein** (eingehend): standardmäßig **alles zu**, außer es gibt eine Regel.
- **Raus** (ausgehend): standardmäßig **alles offen**.
- Je nach Ort gelten andere Regeln – wie Kleidung: im **Firmennetz** (Domäne) locker, **zu Hause** (Privat) normal, im **Café-WLAN** (Öffentlich) ganz streng.

**Ping geht nicht?** Oft ist gar nicht das Netzwerk kaputt – der Türsteher lässt einfach keine „Hallo, bist du da?“-Fragen (ICMP) rein. Nicht den Türsteher entlassen (Firewall aus), sondern ihm sagen: „Diese Frage ist okay“ (Regel aktivieren).

## Merksatz
- **Paketfilter → Stateful → Proxy** = immer genauer, immer aufwendiger.
- Windows: **eingehend blockieren, ausgehend erlauben**.
- Profile: **Domäne – Privat – Öffentlich**.
- **DMZ** = öffentliche Server zwischen Internet und LAN.
- Firewall **nie ausschalten**, Regeln setzen!

## Prüfungsfalle
- Eine Firewall ist kein Virenscanner und kein IDS.
- Stateful erlaubt Antworten automatisch; ein reiner Paketfilter braucht dafür eigene Regeln.
- Regeln gelten pro **Profil** – falsches Profil = Regel greift nicht.
- `netsh firewall` ist veraltet → `netsh advfirewall` bzw. PowerShell.
- DMZ-Server dürfen nicht frei ins LAN.

## Grafik
### Drei Türsteher
Paket kommt an; Paketfilter prüft nur das Etikett, Stateful gleicht mit einer Liste „erwartete Antworten“ ab, Proxy öffnet das Paket, scannt den Inhalt und trägt es selbst weiter.

### DMZ-Plan
Internet – Firewall – DMZ (Web, Mail) – LAN (Datei-, SQL-Server). Pfeile für erlaubte (grün) und blockierte (rot) Verbindungen; Klick auf einen Pfeil zeigt die Regel.

### Profilwechsel
Laptop wandert vom Büro (Domäne) nach Hause (Privat) ins Café (Öffentlich); der Schild-Schutz wird sichtbar dicker.

### Firewall-Log
Scrollende Logzeilen (DROP/ALLOW); Filter nach Port zeigt die geblockten FTP-Versuche.

## Karteikarten
- F: Aufgabe einer Firewall? | A: Netzwerkverkehr anhand definierter Regeln erlauben oder blockieren.
- F: Unterschied Paketfilter und Stateful Inspection? | A: Paketfilter prüft Pakete einzeln (IP/Port); SPI merkt sich Verbindungen und lässt nur passende Antworten zurück.
- F: Was ist ein Application-Level-Gateway? | A: Proxy auf Schicht 7 – baut stellvertretend Verbindungen auf, kann Inhalte filtern; pro Dienst ein Proxy.
- F: Was ist eine DMZ? | A: Separates Netzsegment für öffentlich erreichbare Server zwischen Internet und LAN.
- F: Standardverhalten der Windows-Firewall? | A: Eingehend blockieren, ausgehend zulassen.
- F: Drei Profile der Windows-Firewall? | A: Domäne, Privat, Öffentlich.
- F: Vier Regeltypen in wf.msc? | A: Programm, Port, Vordefiniert, Benutzerdefiniert.
- F: Was sind Verbindungssicherheitsregeln? | A: Regeln, die IPsec-Authentifizierung/-Verschlüsselung zwischen Rechnern erzwingen.
- F: Wo liegt das Firewall-Log? | A: %SystemRoot%\System32\LogFiles\Firewall\pfirewall.log
- F: Unterschied IDS und IPS? | A: IDS erkennt und meldet Angriffe, IPS blockiert sie zusätzlich.
- F: Welche Regel erlaubt ping unter Windows? | A: „Datei- und Druckerfreigabe (Echoanforderung – ICMPv4 eingehend)“.

## Quiz
? Welcher Firewalltyp merkt sich ausgehende Verbindungen und lässt passende Antworten automatisch zu?
* Stateful Packet Inspection
- Statischer Paketfilter
- Hub
- NAT

? Wie verhält sich die Windows-Firewall standardmäßig bei ausgehendem Verkehr?
* Zulassen
- Blockieren
- Nachfragen
- Nur HTTP zulassen

? Wo sollte ein öffentlich erreichbarer Webserver platziert werden?
* In der DMZ
- Im internen LAN neben dem Domänencontroller
- Direkt ohne Firewall im Internet
- Im Management-VLAN

? Ein Server antwortet nicht auf ping, ist aber per RDP erreichbar. Wahrscheinlichste Ursache?
* Die Firewall blockiert eingehende ICMP-Echoanforderungen
- Das Netzwerkkabel ist defekt
- Der DNS-Server ist ausgefallen
- Das Standardgateway fehlt

? Welcher Nachteil gilt für Proxy-Firewalls?
* Für jeden Dienst wird ein eigener Proxy benötigt
- Sie können keine Inhalte prüfen
- Sie arbeiten nur auf Schicht 2
- Sie kennen keine Regeln
