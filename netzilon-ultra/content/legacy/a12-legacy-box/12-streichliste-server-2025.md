---
id: legacy-streichliste-2025
bereich: Legacy
block: A12
kapitel: Legacy-Box
titel: Streichliste Windows Server 2025 – entfernt, abgekündigt, ersetzt
stufe: Fortgeschritten
quellen: [Microsoft Learn „Features removed or no longer developed in Windows Server 2025“, Deprecated-Features-Resources, Stand 09/2026]
verweise: [legacy-lebenszyklus, legacy-netbios-wins, legacy-smb1, legacy-ntlm-altlasten, legacy-tools-skripting, legacy-vpn-wlan-tls]
---

## Profi

### Zwei Begriffe
| Begriff | Bedeutung |
|---|---|
| **Removed** (entfernt) | Ist im Installationsabbild **nicht mehr enthalten** und lässt sich nicht mehr nutzen |
| **Deprecated / no longer developed** (abgekündigt) | **Funktioniert noch**, wird aber **nicht weiterentwickelt** und **in einer künftigen Version entfernt** |

Microsoft pflegt die Listen auf **Microsoft Learn** („Features removed or no longer developed“). Vor der Prüfung oder vor einem Upgrade **dort nachschlagen**, weil sich die Listen mit Updates ändern.

### Entfernt (Windows Server 2025, Stand 09/2026)
| Feature | Ersatz |
|---|---|
| **NTLMv1** | NTLMv2 → besser **Kerberos** |
| **Windows PowerShell 2.0** (mit dem Update 09/2025) | PowerShell 5.1 / 7 |
| **SMTP-Server-Feature** | Exchange, Microsoft 365, andere Mailrelays |
| **IIS 6-Verwaltungskonsole** | IIS-Manager |
| **WordPad** | Notepad, Word |
| **DES** (Kerberos-Verschlüsselung) | AES |
| **Internet Explorer** (2022 ausgemustert, in Server 2025 nicht mehr enthalten) | Microsoft Edge |

### Abgekündigt (nicht mehr weiterentwickelt)
| Feature | Ersatz/Hinweis |
|---|---|
| **NTLM** (LANMAN, NTLMv2) | **Kerberos**, Negotiate |
| **WINS** | **DNS**, GlobalNames-Zone; **2025 = letzte Version mit WINS** |
| **Computer Browser** | DNS, AD-Suche |
| **VBScript** | PowerShell (als FOD, wird entfernt) |
| **WMIC** | `Get-CimInstance` |
| **WSUS** | Windows Update for Business, Intune, Azure Update Manager |
| **Network Load Balancing (NLB)** | Failover-Cluster + Load Balancer, Azure Load Balancer |
| **PPTP und L2TP in RRAS** | **SSTP, IKEv2**, Always On VPN |
| **TLS 1.0 / 1.1** | TLS 1.2/1.3 |
| **Windows Internal Database (WID)** | SQL Server Express/Standard |
| **Remote Mailslots** | Named Pipes / moderne IPC |
| **WebDAV-Redirector** | SMB/HTTPS/OneDrive |
| **Cluster Sets** (Failover-Cluster-Funktion) | Storage Spaces Direct/Azure Arc-basierte Verbünde (nicht mehr weiterentwickelt) |
| **DirectAccess** | Always On VPN |

### Gleichzeitig neu in Server 2025 (Auswahl zum Gegenlesen)
- **SMB über QUIC** in allen Editionen, **SMB-Signierung standardmäßig erforderlich**, NTLM-Blockierung für SMB möglich
- **Neues Forest-/Domänenfunktions-Level** (mit größerer AD-Datenbankseite)
- **Hotpatching** (mit Azure Arc), **Windows Admin Center** verbessert, **Delegated Managed Service Accounts (dMSA)**
- **LDAP** mit **TLS 1.3**, **Kerberos** mit **AES-SHA2**

### Leitlinien
1. **Inventar**: Wer nutzt WINS, NTLMv1, TLS 1.0, SMB1, VBScript? **Audit** statt Vermutung.
2. **Priorität**: **Sicherheitsrelevant** (NTLMv1, SMB1, TLS 1.0, PS 2.0) **zuerst**, dann **Komfort** (Skripte).
3. **Pilot** vor Rollout, **Rückfallplan** (Snapshot/Backup).
4. **Dokumentation** aktualisieren, **Schulung** der Admins.

## Lab
**Maschinen**: **SRV01** (Windows Server), **DC01** (GPO).

### GUI
1. **SRV01**: **Server-Manager → Verwalten → Rollen und Features hinzufügen** → **Features** ansehen: Sind **Telnet-Client**, **SMB 1.0**, **WINS**, **NLB** installiert?
2. **SRV01**: **Systemsteuerung → Programme und Features → Windows-Features** (bei Client) bzw. Server-Manager: **Windows PowerShell 2.0** abwählen.
3. **SRV01**: **Ereignisanzeige → Anwendungs- und Dienstprotokolle → Microsoft → Windows → NTLM → Operational** (Nutzung von NTLM).
4. **DC01**: **GPMC → GPO „Legacy-Audit“** anlegen: NTLM überwachen, SMB1-Audit.
5. **SRV01**: **Windows Admin Center → Server → Rollen und Features**: Übersicht der Features.

### PowerShell
```powershell
# Auf SRV01 – installierte Legacy-Features finden
Get-WindowsFeature | Where-Object { $_.Installed -and $_.Name -match "WINS|NLB|SNMP|Telnet|SMTP|SMB1|WebDAV|Web-Lgcy" } |
  Select-Object Name, DisplayName

# Auf SRV01 – Optionales Feature PS 2.0 / SMB1 prüfen
Get-WindowsOptionalFeature -Online | Where-Object FeatureName -match "PowerShellV2|SMB1|TelnetClient" |
  Select-Object FeatureName, State

# Auf SRV01 – TLS 1.0 aktiv?
Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Protocols\TLS 1.0\Server" -ErrorAction SilentlyContinue
```

## Einfach

Stell dir vor, du **räumst dein Kinderzimmer auf**, bevor du **in ein größeres Zimmer** ziehst (Server 2025):

- **Weggeworfen** (**entfernt**): Sachen, die **kaputt oder gefährlich** waren und nicht mehr mitkommen: alte **Schlösser** (NTLMv1), das **alte Werkzeug** (PowerShell 2.0), die **klapprige Kiste** (SMTP-Server), der **Schlüsselbund von 1990** (DES).
- **Im Karton mit „Bald weg“** (**abgekündigt**): Dinge, die du **noch benutzen darfst**, aber sie werden **beim nächsten Umzug** nicht mehr mitgenommen: **WINS**, **NLB**, **VBScript**, **WMIC**, **WSUS**, **PPTP**.

Für **jedes Ding im Karton** überlegst du: **Was nehme ich stattdessen?**
| Alt | Neu |
|---|---|
| WINS | DNS |
| WMIC | PowerShell (CIM) |
| PPTP | IKEv2 / SSTP |
| NLB | Load Balancer |

Und: **Bevor du irgendwas wegwirfst, fragst du die Familie**, ob es noch jemand braucht (**Audit**). Sonst fehlt am nächsten Morgen die Zahnbürste.

## Merksatz
- **Entfernt** = weg, **abgekündigt** = noch da, aber Countdown läuft.
- **2025 entfernt: NTLMv1, PS 2.0, SMTP-Server, IIS-6-Konsole, WordPad, DES.**
- **2025 abgekündigt: NTLM, WINS, VBScript, WMIC, WSUS, NLB, PPTP/L2TP, TLS 1.0/1.1, WID.**
- **WINS letzte Version = Server 2025.**
- **Vor Änderung immer erst auditieren.**

## Prüfungsfalle
- **Abgekündigt ≠ entfernt**: WINS, NTLMv2 und VBScript laufen in Server 2025 noch.
- **NTLMv1 ist weg, NTLMv2 noch nicht.**
- **WSUS ist abgekündigt, aber weiterhin unterstützt** (Sicherheitsupdates laufen).
- Die **Listen ändern sich** – in der Praxis immer **Microsoft Learn** prüfen.
- **SMB1 war schon vor Server 2025 standardmäßig abgeschaltet** (nicht erst dort entfernt).

## Grafik
### Umzugskisten
Zwei Kisten: rot „Entfernt“ (fliegen in die Tonne), gelb „Abgekündigt“ (bekommen ein Verfallsdatum). Klick auf ein Feature zeigt Ersatz und Fristen.

### Zeitleiste Server 2019 → 2022 → 2025
Ein Balken; markierte Punkte zeigen, wann welche Funktion als „deprecated“ und wann als „removed“ geführt wurde.

## Karteikarten
- F: Was heißt „removed“ im Feature-Kontext? | A: Aus dem Installationsabbild entfernt, nicht mehr nutzbar.
- F: Was heißt „deprecated“? | A: Noch vorhanden, aber nicht mehr weiterentwickelt, wird später entfernt.
- F: Welche NTLM-Version ist in Server 2025 entfernt? | A: NTLMv1.
- F: Welche PowerShell-Engine wurde entfernt? | A: Windows PowerShell 2.0.
- F: Welcher Server-Dienst (Mail) wurde entfernt? | A: Das SMTP-Server-Feature.
- F: Welche VPN-Protokolle in RRAS sind nicht mehr weiterentwickelt? | A: PPTP und L2TP.
- F: Wovon löst Always On VPN ab? | A: DirectAccess.
- F: Was ersetzt das abgekündigte WSUS? | A: Windows Update for Business, Intune, Azure Update Manager.
- F: Welche Server-Version ist die letzte mit WINS? | A: Windows Server 2025.
- F: Womit ersetzt man WMIC? | A: `Get-CimInstance`.
- F: Wo prüft man die aktuelle Liste? | A: Microsoft Learn „Features removed or no longer developed“.
- F: Was tut man vor dem Abschalten eines Legacy-Features? | A: Nutzung auditieren, Pilot testen, Rückfallplan.

## Quiz
? Welche Funktion ist in Server 2025 entfernt?
* NTLMv1
- NTLMv2
- WINS
- SMB 3

? Was bedeutet „deprecated“?
* Noch vorhanden, aber nicht mehr weiterentwickelt
- Sofort entfernt
- Neu eingeführt
- Kostenpflichtig

? Welche Server-Version ist die letzte mit WINS?
* Windows Server 2025
- Windows Server 2022
- Windows Server 2019
- Windows Server 2016

? Was geschah in Windows Server 2025 mit der Windows-PowerShell-2.0-Engine?
* Sie wurde entfernt
- Sie wurde Standard
- Sie wurde neu eingeführt
- Sie wurde nur abgekündigt

? Was ist der Ersatz für PPTP/L2TP in RRAS?
* SSTP oder IKEv2
- Telnet
- FTP
- SNMP

? Was ist der erste Schritt vor der Abschaltung eines Legacy-Features?
* Nutzung auditieren
- Feature sofort löschen
- Firewall abschalten
- Server neu starten

? Was bedeutet „removed“ in Microsofts Streichliste?
* Die Funktion ist in der neuen Version nicht mehr enthalten.
- Die Funktion wird weiter entwickelt.
- Die Funktion ist nur umbenannt.
- Die Funktion ist kostenpflichtig geworden.
! „Deprecated“ bedeutet: noch enthalten, aber nicht mehr weiterentwickelt.

? Welche Remotezugriffstechnik ersetzt DirectAccess?
* Always On VPN
- PPTP
- RAS über Modem
- Telnet
! Always On VPN nutzt IKEv2 bzw. SSTP mit Zertifikaten.
