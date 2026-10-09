---
id: az800-nps
bereich: AZ-800
block: A7
kapitel: Netzwerkinfrastruktur
titel: NPS – RADIUS-Server & -Proxy, Richtlinien, 802.1X, Kontoführung & Entra-MFA-Erweiterung
stufe: Profi
quellen: [AZ-800 Study Guide, Microsoft Learn, Netzwerkinfrastruktur_mit_Windows_Server_2016_implementieren_70-741.pdf]
verweise: [az800-vpn, ap1-a5-vpn, ap1-a4-vlan, az800-hybrid-auth, az800-ipam]
---

## Profi

### NPS und RADIUS
**Netzwerkrichtlinienserver** (*Network Policy Server*, NPS) ist Microsofts **RADIUS**-Implementierung (*Remote Authentication Dial-In User Service*): zentrale **Authentifizierung, Autorisierung und Kontoführung** (**AAA**) für Netzwerkzugriffe.
| Begriff | Bedeutung |
|---|---|
| **RADIUS-Client** | Gerät, das Zugriff gewährt und NPS fragt: **VPN-Server (RRAS)**, **WLAN-Access-Point/Controller**, **802.1X-Switch**, RD-Gateway |
| **RADIUS-Server** | NPS, der entscheidet (prüft gegen AD) |
| **RADIUS-Proxy** | NPS, der Anfragen an **Remote-RADIUS-Servergruppen** weiterleitet (z. B. andere Forests, Partner, Lastverteilung) |
| **Gemeinsamer geheimer Schlüssel** (*Shared Secret*) | Kennwort zwischen RADIUS-Client und -Server (identisch auf beiden Seiten) |
| **Ports** | UDP **1812** Authentifizierung, **1813** Kontoführung (Legacy **1645/1646**) |
NPS muss in AD **registriert** werden → Computerkonto in Gruppe **RAS- und IAS-Server** (Leserecht auf Einwahleigenschaften der Benutzer). Bei mehreren Domänen: in jeder Domäne registrieren.

### Richtlinientypen und Verarbeitung
1. **Verbindungsanforderungsrichtlinien** (*Connection Request Policies*): **lokal** verarbeiten oder an **Remote-RADIUS-Servergruppe weiterleiten** (Proxy). Standardrichtlinie: „Windows-Authentifizierung für alle Benutzer verwenden“ (lokal).
2. **Netzwerkrichtlinien** (*Network Policies*): wer darf **unter welchen Bedingungen** mit **welchen Einstellungen** rein. Verarbeitung **der Reihe nach**, die **erste passende** Richtlinie gilt:
| Bestandteil | Beispiele |
|---|---|
| **Bedingungen** (*Conditions*) | Windows-Gruppe, Computergruppe, NAS-Porttyp (Virtual/VPN, Wireless 802.11, Ethernet), Tageszeit, Called-Station-ID (SSID), Client-IPv4 |
| **Zugriffsberechtigung** | **Zugriff gewähren** / **Zugriff verweigern** |
| **Einschränkungen** (*Constraints*) | **Authentifizierungsmethoden** (EAP-Typen), Leerlaufzeitlimit, Sitzungszeitlimit, Tageszeiten |
| **Einstellungen** (*Settings*) | RADIUS-Attribute (z. B. **VLAN**), Verschlüsselung, IP-Filter |
- **Benutzereinwahl-Eigenschaft** (Registerkarte „Einwählen“) hat Vorrang: *Zugriff verweigern* am Konto schlägt eine gewährende Richtlinie; *über NPS-Netzwerkrichtlinien steuern* (Standard) → Richtlinie entscheidet. Option „**Benutzerkonto-Einwählinformationen ignorieren**“ in der Richtlinie hebelt das aus.
- Passt **keine** Richtlinie → Zugriff **verweigert**.
- **NAP** (Netzwerkzugriffsschutz) wurde **entfernt** (seit Server 2016) – Legacy.

### 802.1X (portbasierte Zugriffskontrolle)
**Supplicant** (Client) ↔ **Authenticator** (Switch/AP = RADIUS-Client) ↔ **Authentication Server** (NPS). Methoden: **PEAP-MS-CHAPv2** (Kennwort + Serverzertifikat) oder **EAP-TLS** (Computer-/Benutzerzertifikate).
**Dynamische VLAN-Zuweisung** über RADIUS-Standardattribute in der Netzwerkrichtlinie:
- `Tunnel-Type` = **Virtual LANs (VLAN)**
- `Tunnel-Medium-Type` = **802 (includes all 802 media plus Ethernet canonical format)**
- `Tunnel-Pvt-Group-ID` = **VLAN-ID** (z. B. 20)
Client-Einstellungen (Wired AutoConfig/WLAN) per **GPO**: „Richtlinien für Kabelnetzwerke (IEEE 802.3)“ bzw. „Drahtlosnetzwerkrichtlinien (IEEE 802.11)“.

### Kontoführung (*Accounting*)
Protokollierung in **Textdatei** (`%windir%\System32\LogFiles`, IAS-/DTS-Format) oder **SQL Server**; Option „Verbindungsanforderung verwerfen, wenn Protokollierung fehlschlägt“. Ereignisse im Ereignisprotokoll **Sicherheit** (Anmeldung/Abmeldung) → z. B. Ereignis **6272** (gewährt), **6273** (verweigert) → Grundlage für **IPAM**-Anmeldeverlauf.

### NPS-Erweiterung für Microsoft Entra MFA
- Plugin auf einem **NPS-Server**: nach erfolgreicher primärer Authentifizierung (AD) fordert NPS **Entra-MFA** (Push/Anruf) an → **MFA für VPN, RD-Gateway, WLAN** ohne Umbau der RADIUS-Clients.
- Voraussetzungen: Benutzer per **Entra Connect** synchronisiert und für MFA registriert, Lizenz (Entra ID P1/P2), Internetzugriff zu Entra-Endpunkten, Ausführen des Skripts `AzureMfaNpsExtnConfigSetup.ps1` (Mandanten-ID, Zertifikat).
- Nur Authentifizierungsprotokolle mit ausreichender Unterstützung (PAP alle Methoden; **MS-CHAPv2** nur Push/Anruf; **EAP-TLS/PEAP-TLS** nicht unterstützt für MFA-Challenge).
- Typisch: **eigener NPS** für MFA, bestehender NPS leitet per Proxy weiter.

### Hochverfügbarkeit und Vorlagen
- Mehrere NPS-Server als RADIUS-Server im Client eintragen; Proxy-Lastverteilung über **Priorität/Gewichtung** in der Remote-RADIUS-Servergruppe.
- **Vorlagen** (Gemeinsame Geheimnisse, RADIUS-Clients, Remote-Server, IP-Filter) + **Vorlagen exportieren/importieren**.
- Gesamtkonfiguration: `Export-NpsConfiguration` / `Import-NpsConfiguration` bzw. `netsh nps export`.

## Lab
**Maschinen**: **DC01** (example.com, AD CS), **NPS01** (Mitgliedsserver 192.168.10.40), **VPN01** (RRAS aus der RAS-Seite), **SW01** (802.1X-fähiger Switch, 192.168.10.2), **CL01**.

### GUI
1. **NPS01**: Rolle **Netzwerkrichtlinien- und Zugriffsdienste** installieren → `nps.msc` → Kontextmenü **NPS (lokal)** → **Server in Active Directory registrieren**.
2. **NPS01**: Zertifikat „RAS- und IAS-Server“ aus der Enterprise-CA anfordern (für PEAP).
3. **NPS01**: RADIUS-Clients → Neu → `VPN01`, 192.168.10.30, Geheimnis `R4dius!VPN`; zweiter Client `SW01`, 192.168.10.2, Geheimnis `R4dius!SW`.
4. **NPS01**: Netzwerkrichtlinien → Neu „VPN-Mitarbeiter“ → Bedingungen: **Windows-Gruppen** = `VPN-Benutzer`, **NAS-Porttyp** = Virtuell (VPN) → **Zugriff gewähren** → Authentifizierung: **PEAP** (MS-CHAPv2) → Leerlaufzeit 30 Min.
5. **NPS01**: Netzwerkrichtlinie „LAN-Buchhaltung“ → Gruppe `GG-Buchhaltung`, NAS-Porttyp **Ethernet** → PEAP → Einstellungen → Standard-RADIUS-Attribute: Tunnel-Type = VLAN, Tunnel-Medium-Type = 802, Tunnel-Pvt-Group-ID = 20.
6. **NPS01**: Reihenfolge der Richtlinien prüfen (spezifische oben, Standardrichtlinien „Verbindungen mit anderen Zugriffsservern“ unten/deaktiviert).
7. **NPS01**: **Kontoführung** → Konfigurieren → Textdatei.
8. **VPN01**: Routing und RAS → Eigenschaften → Sicherheit → Authentifizierungsanbieter **RADIUS-Authentifizierung** → Server NPS01, Geheimnis `R4dius!VPN`; Kontoführungsanbieter **RADIUS-Kontoführung**.
9. **CL01**: VPN-Verbindung als Mitglied von `VPN-Benutzer` → Erfolg; als Nicht-Mitglied → Fehler; **NPS01**: Ereignisanzeige → Sicherheit → 6272/6273.
10. **SW01** (Cisco-Beispiel, siehe unten) → **CL01** am Switchport, Dienst „Automatische Konfiguration für Kabelnetzwerke“ + 802.1X aktiv → landet in VLAN 20.

### PowerShell
```powershell
# Auf NPS01 – Installation und Registrierung
Install-WindowsFeature NPAS -IncludeManagementTools
netsh nps add registeredserver domain=example.com server=NPS01.example.com
# alternativ: Add-ADGroupMember "RAS and IAS Servers" -Members NPS01$

# Auf NPS01 – RADIUS-Clients
New-NpsRadiusClient -Name "VPN01" -Address 192.168.10.30 -SharedSecret "R4dius!VPN"
New-NpsRadiusClient -Name "SW01" -Address 192.168.10.2 -SharedSecret "R4dius!SW"
Get-NpsRadiusClient

# Auf NPS01 – Konfiguration sichern / auf zweiten NPS übertragen
Export-NpsConfiguration -Path C:\NPS\nps-config.xml
# auf NPS02: Import-NpsConfiguration -Path \\NPS01\C$\NPS\nps-config.xml

# Auf VPN01 – RADIUS statt Windows-Authentifizierung
Set-RemoteAccessRadius -ServerName 192.168.10.40 -SharedSecret "R4dius!VPN" -Purpose Authentication
Set-RemoteAccessAccounting -EnableAccountingType Inbox,ExternalRadius
Add-RemoteAccessRadius -ServerName 192.168.10.40 -SharedSecret "R4dius!VPN" -Purpose Accounting

# Auf NPS01 – Ereignisse prüfen
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=6272,6273} -MaxEvents 10 | Format-List TimeCreated,Id,Message

# Auf NPS-MFA01 – Entra-MFA-Erweiterung (nach Installation des NPS-Extension-MSI)
cd "C:\Program Files\Microsoft\AzureMfa\Config"
.\AzureMfaNpsExtnConfigSetup.ps1
```
```
! Auf SW01 (Cisco IOS) – 802.1X mit NPS
aaa new-model
radius server NPS01
 address ipv4 192.168.10.40 auth-port 1812 acct-port 1813
 key R4dius!SW
aaa authentication dot1x default group radius
aaa authorization network default group radius
dot1x system-auth-control
interface GigabitEthernet0/5
 switchport mode access
 authentication port-control auto
 dot1x pae authenticator
```

## Einfach

Stell dir eine Firma mit vielen **Türen** vor: VPN-Tor, WLAN-Tür, Netzwerkdosen im Büro. An jeder Tür steht ein **Türsteher** (VPN-Server, Access Point, Switch). Die Türsteher entscheiden aber **nicht selbst** – sie rufen die **Zentrale** an: den **NPS** (RADIUS-Server).

- Der Türsteher fragt: „Max will rein, Kennwort xy – darf er?“
- Der NPS schaut im **Active Directory** nach und in seinen **Regeln** (Netzwerkrichtlinien): „Max ist in der Gruppe VPN-Benutzer, es ist 10 Uhr → **ja**, aber nach 30 Minuten Nichtstun wird er rausgeworfen.“
- Das **Geheimwort** zwischen Türsteher und Zentrale (Shared Secret) verhindert, dass ein falscher Türsteher anruft.

**Regeln der Reihe nach**: Der NPS liest seine Regelliste **von oben nach unten**, die **erste passende** Regel entscheidet. Passt keine → **draußen bleiben**.

**802.1X** = sogar die **Netzwerkdose** im Büro prüft dich. Und der NPS kann sagen: „Buchhaltung? Dann ab in **VLAN 20**!“ – der Switch steckt dich automatisch in den richtigen Raum.

**RADIUS-Proxy** = der NPS ist nicht zuständig und **leitet den Anruf weiter** (z. B. an die Zentrale der Partnerfirma).

**Kontoführung** = das **Besucherbuch**: wer war wann wie lange drin.

**MFA-Erweiterung** = nach dem Kennwort klingelt zusätzlich dein **Handy** (Microsoft Authenticator) – erst dann geht das VPN auf.

## Merksatz
- **RADIUS**: UDP **1812** Auth, **1813** Accounting.
- **Client** = Türsteher (VPN/AP/Switch), **Server** = NPS, **Proxy** = leitet weiter.
- Erst **Verbindungsanforderungsrichtlinie** (lokal oder weiter), dann **Netzwerkrichtlinie** (erste passende gewinnt).
- **Einwählen verweigert** am Benutzerkonto schlägt Richtlinie.
- VLAN per **Tunnel-Type / Tunnel-Medium-Type / Tunnel-Pvt-Group-ID**.
- NPS in AD **registrieren** (Gruppe RAS- und IAS-Server).
- **NAP** gibt es nicht mehr.

## Prüfungsfalle
- Richtlinienreihenfolge falsch → allgemeine Verweigerungsregel oben blockiert alle.
- Unterschiedliches Shared Secret → Anfragen werden verworfen (Ereignis „ungültiger Authenticator“).
- NPS nicht in AD registriert → Einwahleigenschaften der Benutzer nicht lesbar.
- Entra-MFA-Erweiterung funktioniert nicht mit EAP-TLS-Challenges.
- NAP-Konfigurationen sind in Server 2016+ nicht mehr verfügbar.
- VPN-Server muss auf RADIUS-Authentifizierung umgestellt werden, sonst nutzt er lokale Richtlinien.

## Grafik
### Zentrale und Türsteher
Drei Türen (VPN, WLAN, Switchport) mit Türstehern, die per Telefon (UDP 1812) die Zentrale NPS anrufen; NPS blättert im AD-Buch und hebt grünen oder roten Daumen.

### Regelliste
Stapel Karteikarten; Anfrage fällt von oben durch, bleibt an der ersten passenden Karte hängen („VPN-Mitarbeiter → gewähren“).

### VLAN-Zuweisung
Buchhalterin steckt Laptop ein; Switch fragt NPS; NPS antwortet mit Zettel „VLAN 20“; Port färbt sich in VLAN-20-Farbe.

### MFA-Klingel
VPN-Anmeldung → NPS prüft Kennwort → Handy vibriert „Genehmigen?“ → Daumen hoch → Tunnel öffnet sich.

## Karteikarten
- F: Was ist NPS? | A: Microsofts RADIUS-Server/-Proxy für Authentifizierung, Autorisierung und Kontoführung.
- F: RADIUS-Ports? | A: UDP 1812 (Authentifizierung), 1813 (Kontoführung).
- F: Beispiele für RADIUS-Clients? | A: VPN-Server, WLAN-Access-Points/Controller, 802.1X-Switches.
- F: Welche Richtlinie entscheidet über lokale Verarbeitung oder Weiterleitung? | A: Verbindungsanforderungsrichtlinie.
- F: Nach welchem Prinzip werden Netzwerkrichtlinien ausgewertet? | A: Der Reihe nach, erste passende Richtlinie gilt.
- F: Was passiert, wenn keine Netzwerkrichtlinie passt? | A: Zugriff wird verweigert.
- F: Welche drei Attribute weisen ein VLAN zu? | A: Tunnel-Type, Tunnel-Medium-Type, Tunnel-Pvt-Group-ID.
- F: In welche Gruppe muss der NPS registriert werden? | A: RAS- und IAS-Server.
- F: Ereignis-IDs für gewährten/verweigerten Zugriff? | A: 6272 / 6273.
- F: Wie MFA für RADIUS-basiertes VPN mit Entra? | A: NPS-Erweiterung für Microsoft Entra MFA.
- F: Cmdlet für RADIUS-Client? | A: New-NpsRadiusClient
- F: Wie überträgt man die NPS-Konfiguration auf einen zweiten Server? | A: Export-NpsConfiguration / Import-NpsConfiguration.

## Quiz
? Ein Benutzer ist in der Gruppe VPN-Benutzer, die Richtlinie gewährt Zugriff, trotzdem wird er abgelehnt. Mögliche Ursache?
* Einwählen ist am Benutzerkonto auf „Zugriff verweigern“ gesetzt
- Die Kontoführung ist aktiviert
- Der NPS nutzt UDP 1812
- Die Richtlinie steht ganz oben

? Mitarbeiter der Buchhaltung sollen beim Einstecken automatisch in VLAN 20 landen. Wo wird das konfiguriert?
* RADIUS-Attribute in der NPS-Netzwerkrichtlinie
- DHCP-Richtlinie mit Benutzerklasse
- Verbindungsanforderungsrichtlinie mit Proxy
- NRPT-Regel

? Anfragen für Benutzer der Partnerdomäne sollen an deren RADIUS-Server gehen. Lösung?
* Verbindungsanforderungsrichtlinie mit Weiterleitung an eine Remote-RADIUS-Servergruppe
- Netzwerkrichtlinie mit Zugriff verweigern
- Zweiter RADIUS-Client
- Registrierung des NPS in der Partnerdomäne reicht

? VPN-Zugriff soll mit Microsoft Entra MFA abgesichert werden, ohne den VPN-Server zu wechseln. Lösung?
* NPS-Erweiterung für Microsoft Entra MFA
- NAP-Integritätsrichtlinie
- DNSSEC
- Always On VPN Gerätetunnel

? Welche Ports verwendet RADIUS standardmäßig?
* UDP 1812 und 1813
- TCP 1723 und GRE
- UDP 500 und 4500
- TCP 647
