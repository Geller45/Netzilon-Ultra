---
id: az801-firewall-lokal
bereich: AZ-801
block: A9
kapitel: Sicherheit
titel: Windows Defender Firewall mit erweiterter Sicherheit (lokal)
stufe: Fortgeschritten
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-domaenenisolierung, az801-ipsec-verbindungssicherheit, az801-dc-haertung, ap1-a5-firewall]
---

## Profi

### Grundlagen
Die **Windows Defender Firewall** ist eine **hostbasierte, zustandsbehaftete** (*stateful*) Firewall. Standard: **Eingehend blockiert** (außer **erlaubt**), **Ausgehend erlaubt** (außer **blockiert**).

**Werkzeuge**
| Werkzeug | Verwendung |
|---|---|
| `wf.msc` | **Windows Defender Firewall mit erweiterter Sicherheit** (**GUI**, **alle** Optionen) |
| **Einstellungen/Systemsteuerung** | **Einfache** Ansicht |
| **PowerShell** (`NetSecurity`-Modul) | `Get-`/`New-`/`Set-`/`Enable-NetFirewallRule`, `Set-NetFirewallProfile` |
| `netsh advfirewall` | **Legacy-CLI** |
| **Gruppenrichtlinie** | **Computerkonfiguration → Windows-Einstellungen → Sicherheitseinstellungen → Windows Defender Firewall mit erweiterter Sicherheit** |
| **Windows Admin Center** | **Remote-Verwaltung** |
| **Intune** | **Endpoint Security → Firewall** |

### Profile
| Profil | Wann aktiv |
|---|---|
| **Domäne** (*Domain*) | Rechner ist **im Domänennetz** (**DC erreichbar**, **NLA** erkennt **Domäne**) |
| **Privat** (*Private*) | **Vertrauenswürdiges** Heim-/Arbeitsnetz |
| **Öffentlich** (*Public*) | **Öffentliches** Netz (**Standard** für **unbekannte** Netze) |

**Pro Profil** einstellbar: **Firewall ein/aus**, **Standardverhalten** (**Eingehend/Ausgehend**), **Benachrichtigungen**, **Lokale Regeln zusammenführen**, **Protokollierung**. **Ein** Profil **gleichzeitig** **aktiv** (**pro Netzwerkadapter**).

### Regeltypen
| Typ | Beschreibung |
|---|---|
| **Programm** | **Regel** für eine **.exe** (**Pfad**) |
| **Port** | **TCP/UDP** und **Portnummer(n)** |
| **Vordefiniert** | **Rollen/Funktionen** (z. B. **Remotedesktop**, **Datei- und Druckerfreigabe**) |
| **Benutzerdefiniert** | **Alle Eigenschaften** (**Adresse**, **Protokoll**, **Benutzer**, **Schnittstelle**) |

**Aktionen**: **Verbindung zulassen**, **Verbindung zulassen, wenn sie sicher ist** (**IPsec** erforderlich), **Verbindung blockieren**.

**Weitere Eigenschaften**: **Lokale/Remoteadresse**, **Protokoll**, **Ports**, **Profile**, **Schnittstellentyp**, **Benutzer/Computer** (nur **bei „sicher“**), **Dienste**, **Edge Traversal**.

### Verarbeitungsreihenfolge
1. **Windows-Dienstehärtung** (*Service Hardening*)
2. **Verbindungssicherheitsregeln** (**IPsec**)
3. **Authentifizierte Umgehung** (*Authenticated Bypass*)
4. **Blockierungsregeln** (*Block*)
5. **Zulassungsregeln** (*Allow*)
6. **Standardprofilverhalten**

**Faustregel**: **Block** **schlägt Allow**. **Bei Konflikt** **gewinnt** die **spezifischere** Regel nur **innerhalb** derselben Stufe – **Block bleibt stärker**.

### Wichtige Ports (Server-Rollen)
| Dienst | Port |
|---|---|
| **RDP** | **TCP 3389** |
| **WinRM** | **TCP 5985** (HTTP), **5986** (HTTPS) |
| **SMB** | **TCP 445** |
| **DNS** | **TCP/UDP 53** |
| **Kerberos** | **TCP/UDP 88** |
| **LDAP / LDAPS** | **389 / 636** |
| **Globaler Katalog** | **3268 / 3269** |
| **RPC Endpoint Mapper** | **TCP 135**, **dynamisch 49152–65535** |
| **DHCP** | **UDP 67/68** |
| **HTTP/HTTPS** | **80 / 443** |
| **ICMPv4-Echo** | **ICMP-Typ 8** |

### GPO oder lokal
| Merkmal | Details |
|---|---|
| **Lokale Regeln zusammenführen** | **Ein**: **GPO-Regeln** **und** lokale Regeln **gelten**; **Aus**: **nur GPO** (**Lokale Admins** **können nichts** hinzufügen) |
| **Verknüpfung** | **GPO** **an OU** mit **Servern**/**Clients** |
| **Filter** | **Sicherheitsgruppenfilterung** (**Regeln** **nur** für **Server**) |
| **WMI-Filter** | **Betriebssystem**/**Rolle** |

### Protokollierung
- **Pro Profil** **konfigurieren**: **Verworfene Pakete protokollieren** und/oder **Erfolgreiche Verbindungen protokollieren**.
- **Datei**: `%systemroot%\System32\LogFiles\Firewall\pfirewall.log` (**Standardgröße 4 MB**, **anpassbar**).
- **Überwachung** (wf.msc → **Überwachung**): **Aktive Regeln**, **Verbindungssicherheitsregeln**, **Sicherheitszuordnungen**.
- **Ereignisse**: **Ereignisanzeige → Anwendungs- und Dienstprotokolle → Microsoft → Windows → Windows Firewall With Advanced Security**.

### PowerShell (typisch)
```powershell
# Auf SRV01 – Profile
Get-NetFirewallProfile | Select-Object Name, Enabled, DefaultInboundAction, DefaultOutboundAction
Set-NetFirewallProfile -Profile Domain,Private,Public -Enabled True

# Auf SRV01 – Regel für Port
New-NetFirewallRule -DisplayName "Web-Server 8080" -Direction Inbound -Protocol TCP -LocalPort 8080 `
  -Action Allow -Profile Domain -RemoteAddress 10.0.0.0/24

# Auf SRV01 – Programmregel
New-NetFirewallRule -DisplayName "App erlauben" -Direction Inbound -Program "C:\Apps\app.exe" -Action Allow

# Auf SRV01 – Vordefinierte Regelgruppe aktivieren (Sprache beachten)
Enable-NetFirewallRule -DisplayGroup "Remote Desktop"
Enable-NetFirewallRule -DisplayGroup "Remotedesktop"

# Auf SRV01 – Regel prüfen und blockieren
Get-NetFirewallRule -DisplayName "Web-Server 8080" | Get-NetFirewallPortFilter
New-NetFirewallRule -DisplayName "Block Telnet" -Direction Outbound -Protocol TCP -RemotePort 23 -Action Block

# Auf SRV01 – Protokollierung
Set-NetFirewallProfile -Profile Domain -LogAllowed False -LogBlocked True -LogFileName "%systemroot%\System32\LogFiles\Firewall\pfirewall.log"

# Auf SRV01 – Alle Regeln exportieren (Sicherung)
netsh advfirewall export "C:\Backup\firewall.wfw"
```

### Remote-Verwaltung für Firewall-Regeln
- **Ferne Verwaltung** durch **PowerShell-Remoting** (`Invoke-Command`) oder **GPO**.
- **Windows Admin Center** → **Server → Firewall**.
- **Regelgruppe**: **Windows-Verwaltungsinstrumentation (WMI)**, **Remotedienstverwaltung**, **Remote-Ereignisprotokollverwaltung** **aktivieren**, **damit** **RSAT/MMC** **Remote** **funktioniert**.

### Azure-Bezug
**Azure-VMs** haben **zusätzlich** **NSGs** (**Network Security Groups**) **auf Subnetz/NIC-Ebene**. **Beides muss** **den Verkehr zulassen**: **NSG** **und** **Windows-Firewall**.

## Lab
**Maschinen**: **SRV01** (Server 2022, Domäne example.com), **CLIENT01** (Windows 11), **DC01**.

### GUI
1. **SRV01**: **Start → wf.msc** → **Windows Defender Firewall mit erweiterter Sicherheit**.
2. **SRV01**: **Eingehende Regeln → Neue Regel → Port** → **TCP**, **Bestimmte lokale Ports: 8080** → **Verbindung zulassen** → **Profile: Nur Domäne** → **Name: Web-Server 8080** → Fertig.
3. **SRV01**: **Eigenschaften → Bereich → Remote-IP-Adresse → Diese IP-Adressen → 10.0.0.0/24**.
4. **SRV01**: **Rechtsklick Windows Defender Firewall → Eigenschaften → Domänenprofil → Protokollierung → Anpassen** → **Verworfene Pakete protokollieren: Ja** → OK.
5. **CLIENT01**: `Test-NetConnection SRV01 -Port 8080` → **Erfolg** (falls Dienst lauscht) bzw. **Firewall-Log** auf **SRV01** prüfen.
6. **SRV01**: **Ausgehende Regeln → Neue Regel → Port → TCP 23 → Verbindung blockieren** → **Test**.
7. **SRV01**: **Überwachung → Firewall** → **aktive Regeln** ansehen.
8. **DC01**: **GPMC** → **GPO-Firewall-Server** an OU `Server` → **Domänenprofil: Lokale Regeln zusammenführen = Nein**.

### PowerShell
```powershell
# Auf SRV01
Get-NetFirewallProfile | Select-Object Name, Enabled
New-NetFirewallRule -DisplayName "Web-Server 8080" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow -Profile Domain
Get-NetFirewallRule -DisplayName "Web-Server 8080"

# Auf CLIENT01
Test-NetConnection -ComputerName SRV01 -Port 8080

# Auf SRV01 – Log ansehen
Get-Content "$env:SystemRoot\System32\LogFiles\Firewall\pfirewall.log" -Tail 20
```

## Einfach

Die **Firewall** ist ein **Türsteher direkt an der Tür deines Rechners**.

- **Eingehend** = **wer rein will**. **Standard: „Nein!“** (außer auf der **Gästeliste**).
- **Ausgehend** = **wer raus will**. **Standard: „Ja!“**
- **Regeln** = **Gästeliste**: „Port 8080 darf rein“ oder „Programm XY darf rein“.
- **Profile** = **Anzugsordnung**: **Domäne** (im Firmennetz, **locker**), **Privat** (Zuhause), **Öffentlich** (Café, **streng**).
- **Block schlägt Allow**: **Steht jemand auf beiden Listen, bleibt er draußen.**
- **Log** = **Besucherbuch**: Darin steht, **wer abgewiesen** wurde.

**Merke**: Bei **Azure-Servern** gibt es **zwei Türsteher** (**NSG** **und** **Windows-Firewall**) – **beide** müssen **Ja** sagen.

## Merksatz
- **Eingehend blockiert**, **ausgehend erlaubt** (Standard).
- **Drei Profile**: **Domäne**, **Privat**, **Öffentlich**.
- **Block schlägt Allow**.
- **wf.msc** = **erweiterte Sicherheit**, **NetSecurity-Cmdlets** für **Skripte**.
- **Lokale Regeln zusammenführen: Nein** = **nur GPO-Regeln**.
- **Log**: `pfirewall.log`, **standardmäßig aus**.

## Prüfungsfalle
- **Firewall-Log** ist **standardmäßig deaktiviert** (**Verworfene Pakete** **aktivieren**).
- **Profil** wird **pro Netzwerkadapter** erkannt – **Domänenprofil** **nur** bei **DC-Erreichbarkeit**.
- **Vordefinierte Regelgruppen** heißen je nach **Sprache** **anders** (**Remotedesktop** vs. **Remote Desktop**).
- **Regeln für Programme** brauchen **richtigen Pfad**, **Dienste** **separat** (**Dienstauswahl**).
- **NSG** in **Azure** **ersetzt** die **Windows-Firewall** **nicht**.
- **„Zulassen, wenn sicher“** **braucht** **IPsec** (**Verbindungssicherheitsregel**).
- **GPO** mit **Lokale Regeln zusammenführen = Nein** **verhindert** **Ausnahmen** durch **lokale Admins**.
- **RDP-Regelgruppe** öffnet **Port 3389**, **aktiviert** aber **nicht** die **Remotedesktop-Funktion**.
- **ICMP-Echo (Ping)** ist **standardmäßig blockiert**.

## Grafik
### Türsteher und Gästeliste
Rechner mit Tür; links Warteschlange (Pakete); Türsteher prüft Liste; Block-Karte zerreißt Allow-Karte.

### Drei Anzüge
Rechner wechselt zwischen Domäne (Anzug), Privat (Freizeit), Öffentlich (Rüstung).

### Zwei Türsteher in Azure
VM mit zwei Türen hintereinander: NSG (außen), Windows-Firewall (innen); Paket muss beide passieren.

## Karteikarten
- F: Was ist der Standard der Windows-Firewall? | A: Eingehend blockiert, ausgehend erlaubt.
- F: Welche Profile gibt es? | A: Domäne, Privat, Öffentlich.
- F: Wie öffnet man die erweiterte Firewall? | A: wf.msc
- F: Was hat Vorrang, Block oder Allow? | A: Block.
- F: Wo liegt das Firewall-Log? | A: %systemroot%\System32\LogFiles\Firewall\pfirewall.log
- F: Cmdlet für neue Regeln? | A: New-NetFirewallRule
- F: Cmdlet zum Aktivieren einer Regelgruppe? | A: Enable-NetFirewallRule -DisplayGroup
- F: Was bewirkt „Lokale Regeln zusammenführen: Nein“? | A: Es gelten nur die GPO-Regeln.
- F: Was bedeutet „Verbindung zulassen, wenn sie sicher ist“? | A: Nur mit IPsec-Authentifizierung.
- F: Standardport für RDP? | A: TCP 3389
- F: Welche Firewall gilt zusätzlich bei Azure-VMs? | A: NSG auf Subnetz/NIC-Ebene.
- F: Wie exportiert man Firewall-Regeln? | A: netsh advfirewall export

## Quiz
? Auf allen Servern sollen nur zentral definierte Firewall-Regeln gelten. Lösung?
* GPO mit „Lokale Regeln zusammenführen“ = Nein
- Lokale Regeln je Server
- NSG erstellen
- Defender for Cloud

? Verworfene Pakete sollen protokolliert werden. Wo wird das eingestellt?
* Windows Defender Firewall Eigenschaften, Profil, Protokollierung
- Ereignisanzeige, Sicherheitsprotokoll
- Task-Manager
- Registry Run-Schlüssel

? Welche Regel gewinnt bei Konflikt zwischen Block und Allow?
* Block
- Allow
- Die neuere
- Die mit kleinerem Port

? Ein Server im Firmennetz nutzt das öffentliche Profil, obwohl er in der Domäne ist. Ursache?
* DC-Erkennung (NLA) schlägt fehl
- Falsche Firewallregel
- NSG blockiert
- IPsec fehlt

? Eine Azure-VM ist von außen per RDP nicht erreichbar, Windows-Firewall lässt 3389 zu. Was noch prüfen?
* NSG-Regel für TCP 3389
- DHCP-Bereich
- WSUS
- Hosts-Datei

? Welches Cmdlet zeigt Profile und Standardaktionen?
* Get-NetFirewallProfile
- Get-NetAdapter
- Get-Service
- Get-SmbShare
