---
id: legacy-betrieb-absichern
bereich: Legacy
block: A12
kapitel: Legacy-Box
titel: Legacy im Betrieb – inventarisieren, isolieren, ablösen
stufe: Profi
quellen: [BSI IT-Grundschutz (OPS.1.1.3 Patch- und Änderungsmanagement, NET.1.1), ITIL, eigene Zusammenstellung]
verweise: [legacy-lebenszyklus, ap2-it-sicherheit, ap2-itil-monitoring, ap2-projektmanagement, ap1-a4-vlan, ap1-a5-firewall]
---

## Profi

### Kernidee
Ein Altsystem lässt sich nicht immer **sofort** ersetzen. Die IT-Verantwortung besteht darin, das **Risiko sichtbar zu machen, zu begrenzen und zeitlich zu beenden**.

### Vorgehen in fünf Schritten
| Schritt | Inhalt | Werkzeuge |
|---|---|---|
| **1. Inventarisieren** | Wer/was/wo/wie kritisch? | **CMDB**, **Netzwerk-Scan** (`nmap`), **Intune/SCCM**, **Azure Arc**, **AD-Abfragen** (`Get-ADComputer -Properties OperatingSystem`) |
| **2. Risiko bewerten** | Schutzbedarf (**Vertraulichkeit/Integrität/Verfügbarkeit**), **Eintrittswahrscheinlichkeit × Schadenshöhe** | **BSI-Schutzbedarf** (normal/hoch/sehr hoch), **Risikomatrix** |
| **3. Absichern** (kompensierende Maßnahmen) | Risiko senken, solange das Altsystem läuft | Isolation, Firewall, Virtual Patching, Monitoring |
| **4. Ablösen** | **Migration** oder **Ersatz** planen mit Termin | **Projektplan**, **Kosten-Nutzen** |
| **5. Dokumentieren** | Ausnahmen, Verantwortliche, Befristung | **Ausnahmeregister** mit **Ablaufdatum**, Genehmigung durch Leitung |

### Kompensierende Maßnahmen (Absichern)
| Maßnahme | Wirkung |
|---|---|
| **Netzwerksegmentierung** (eigenes **VLAN**, eigene **Subnetze**) | Angreifer kommt vom Altsystem nicht seitwärts |
| **Firewall mit Whitelist** | Nur **nötige Ports** von **nötigen Quellen**; **kein Internet** aus dem Altsegment |
| **Jump-Host/Bastion** | Zugriff nur über **gehärteten Zwischenserver** mit **MFA** |
| **Virtual Patching** | **IPS/WAF** blockt bekannte Exploits, obwohl kein Patch existiert |
| **Anwendungs-Whitelisting** (**AppLocker/WDAC**) | Nur erlaubte Programme laufen |
| **Endpunktschutz/EDR** | Soweit unterstützt; sonst **Netz-Monitoring** |
| **Backup + Wiederherstellungstest** | Offline-Backup (3-2-1); **Image-Backup** des Altsystems |
| **Monitoring/Logging** | **SIEM/Syslog**, Alarme bei Abweichung |
| **Zugriff minimieren** | Minimale Konten, **keine Domänenadmins** darauf anmelden, **lokales Admin-Kennwort (LAPS)** |
| **Physischer Schutz** | Serverraum, Zugriffsbeschränkung |

### Migrationsstrategien („6 Rs“ / vereinfachte Formen)
| Strategie | Bedeutung | Beispiel |
|---|---|---|
| **Retain** (Beibehalten) | Unverändert lassen, absichern | Steuerung, die nur mit XP läuft |
| **Retire** (Außerbetriebnahme) | Abschalten, weil nicht mehr genutzt | Alter Testserver |
| **Rehost** („Lift & Shift“) | Unverändert auf neue Infrastruktur/VM | **P2V** mit Disk2vhd, **Azure Migrate** |
| **Replatform** | Kleine Anpassungen, neue Plattform | DB auf **Azure SQL/Managed Instance** |
| **Refactor/Rearchitect** | Anwendung **neu entwerfen** | Monolith → Container/Microservices |
| **Replace** | **Standardsoftware/SaaS** statt Eigenbau | Eigene Zeiterfassung → SaaS |

### Bezug zu ITIL und Verträgen
- **Change Management**: Änderung an Altsystemen als **Change** mit **Risikoprüfung**, **Rollback**, **Wartungsfenster**.
- **Problem Management**: Wiederkehrende Störungen mit Ursache **Alterung**.
- **Service-Level (SLA)**: Für Altsysteme evtl. **abgesenkte Verfügbarkeit** vereinbaren.
- **Lizenz/Support-Verträge**: **Extended Security Updates**, **Custom Support** (teuer).
- **Haftung/Compliance**: DSGVO Art. 32 („Stand der Technik“), **NIS2** (Meldepflichten, Risikomanagement), **Cyber-Versicherung** (Ausschlüsse bei unsupported Software).

### Kosten-Nutzen-Argumentation (AP2-relevant)
- **Kosten Altbetrieb**: ESU, Sonderwartung, Ausfallzeit, Risiko (Schaden × Wahrscheinlichkeit).
- **Kosten Ablösung**: Lizenzen, Migration, Schulung, Projektstunden.
- **Amortisation** (Break-even) und **Nutzwertanalyse** (Kriterien gewichten) vergleichen.

### Beispiel: Messgerät mit Windows XP
1. **Inventar**: PC XP, Messgerät, Schnittstelle **seriell** (COM1), Software 32-Bit.
2. **Risiko**: XP nicht patchbar, aber Gerät **nicht vernetzt** nötig.
3. **Maßnahmen**: **Netzwerkkabel ziehen** (Air Gap) **oder** eigenes **VLAN** ohne Internet, **USB-Ports sperren**, **Image-Backup**, **Datentransfer über Datenschleuse** (geprüfter USB-Stick).
4. **Ablösung**: **Gerät oder Software** mit **Windows 11/Server 2025** beschaffen (Kosten-Nutzen), Frist: **Ende der Kalibrierung in 18 Monaten**.
5. **Doku**: Ausnahme im Register mit **Verantwortlichem** und **Befristung**.

## Lab
**Maschinen**: **DC01**, **SW1** (Cisco), **FW01** (Firewall), **LEG01** (Altsystem, z. B. Server 2012 R2 oder XP-Test-VM).

### GUI
1. **DC01**: **ADUC → Suchen → Benutzerdefinierte Suche → Erweitert** → `(operatingSystem=*2008*)` bzw. `*2012*` → Liste alter Server.
2. **SW1**: Altsystem in **eigenes VLAN 99** legen (CLI unten).
3. **FW01**: **Regel**: VLAN 99 → nur **Ziel 192.168.10.30:445** und **Rückverkehr**; **Internet verboten**.
4. **DC01**: **GPMC → GPO „Legacy-Server“** → **AppLocker** aktivieren, nur nötige Programme erlauben.
5. **LEG01**: **Windows Server Backup** oder **Disk2vhd** → **Image sichern**.
6. **DC01**: **Ausnahmeregister (Excel/SharePoint)** mit **Verantwortlichem** und **Ablaufdatum** anlegen.

### PowerShell / CLI
```powershell
# Auf DC01 – Inventar alter Betriebssysteme im AD
Get-ADComputer -Filter * -Properties OperatingSystem, LastLogonDate |
  Where-Object { $_.OperatingSystem -match "2003|2008|2012|Windows 7|XP|Vista" } |
  Select-Object Name, OperatingSystem, LastLogonDate | Sort-Object OperatingSystem

# Auf DC01 – Konten ohne Anmeldung (Kandidaten zum Abschalten)
Search-ADAccount -ComputersOnly -AccountInactive -TimeSpan 90.00:00:00 |
  Select-Object Name, LastLogonDate
```

```
! Auf SW1 – Altsystem isolieren
vlan 99
 name LEGACY
interface fa0/10
 switchport mode access
 switchport access vlan 99
 switchport port-security
 switchport port-security maximum 1
 switchport port-security violation shutdown
!
! ACL zwischen den VLANs auf dem L3-Switch (Beispiel)
ip access-list extended LEGACY-IN
 permit tcp host 192.168.99.10 host 192.168.10.30 eq 445
 permit udp host 192.168.99.10 host 192.168.10.5 eq 53
 deny ip any any log
interface vlan 99
 ip access-group LEGACY-IN in
```

## Befehle
- `Get-ADComputer -Properties OperatingSystem` – Betriebssysteme im AD
- `Search-ADAccount -ComputersOnly -AccountInactive` – Inaktive Computerkonten
- `nmap -sV 192.168.99.0/24` – Dienste und Versionen im Segment
- `show vlan brief` – VLAN-Zuordnung (Cisco)
- `show ip access-lists` – ACLs mit Treffern
- `Disk2vhd` – Physisch zu virtuell (Sysinternals)

## Einfach

Stell dir vor, im Schulkeller steht **eine alte Dampfmaschine**, die **eine wichtige Maschine antreibt**. Sie ist **schwer zu ersetzen**, aber **gefährlich**: Funken und Schmieröl.

Was macht ein kluger Hausmeister?
1. **Zählen**: Welche alten Maschinen gibt es überhaupt? (**Inventar**)
2. **Überlegen**: Wie gefährlich ist jede? Was passiert, wenn sie ausfällt? (**Risiko**)
3. **Absperren**: Um die Dampfmaschine kommt ein **Zaun** und eine **Tür mit Schloss** (**VLAN + Firewall**). Nur der Hausmeister mit **Schlüssel** kommt rein (**Jump-Host**). **Feuerlöscher** und **Rauchmelder** (**Monitoring**) kommen dazu. Es gibt **Ersatzteile** und **eine Kopie der Bedienungsanleitung** (**Backup**).
4. **Neue Maschine bestellen**: Mit **Datum**, wann die alte in Rente geht (**Migration mit Frist**).
5. **Aufschreiben**: „Die Dampfmaschine darf noch bis Dezember laufen, verantwortlich: Herr Müller.“ (**Ausnahmeregister**)

Wichtig: **Nicht einfach nichts tun** („Läuft ja noch“) und **nicht alles panisch wegwerfen** („Ich schalte alles ab!“), sondern **planvoll** vorgehen.

## Merksatz
- **Inventarisieren → Bewerten → Absichern → Ablösen → Dokumentieren.**
- **Isolieren** = VLAN + Firewall-Whitelist + kein Internet.
- **Virtual Patching** = IPS/WAF ersetzt fehlenden Patch.
- **Ausnahme braucht Verantwortlichen und Ablaufdatum.**
- **6 Rs: Retain, Retire, Rehost, Replatform, Refactor, Replace.**
- **Risiko = Eintrittswahrscheinlichkeit × Schadenshöhe.**

## Prüfungsfalle
- **Isolation ist keine Lösung**, nur eine **kompensierende Maßnahme** auf Zeit.
- **Air Gap** (kein Netz) hilft nicht gegen **USB-Stick-Viren**.
- **Virtual Patching** ersetzt den echten Patch nicht.
- **Ausnahmen ohne Ablaufdatum** werden zu **Dauerzuständen**.
- **Rehost (Lift & Shift)** löst **Sicherheitsprobleme des Betriebssystems nicht**, nur den Hardware-Ausfall.

## Grafik
### Fünf-Schritte-Weg
Ein Weg mit fünf Stationen; ein Altsystem-Symbol wandert von „Inventar“ über „Risiko“ und „Zaun“ bis zur „Rente“ mit Kalenderblatt. Ein Regler „Zeit“ zeigt, wie das Risiko ohne Maßnahmen steigt.

### Zaun-Simulation
Ein Netzplan mit Altsystem; per Klick entstehen VLAN-Zaun, Firewall-Tor, Jump-Host und Kamera. Ein Angreifer versucht, ins Altsystem zu gelangen, und wird an jeder Schicht gestoppt.

## Karteikarten
- F: Was sind die fünf Schritte im Umgang mit Legacy? | A: Inventarisieren, Risiko bewerten, absichern, ablösen, dokumentieren.
- F: Nenne drei kompensierende Maßnahmen. | A: VLAN-Isolation, Firewall-Whitelist, Virtual Patching (auch Jump-Host, Backup, Monitoring).
- F: Was ist Virtual Patching? | A: Ein IPS/WAF blockiert bekannte Exploits, obwohl kein Patch existiert.
- F: Was gehört in ein Ausnahmeregister? | A: Verantwortlicher, Begründung, Maßnahmen, Ablaufdatum.
- F: Was bedeutet Rehost? | A: Lift & Shift, System unverändert auf neue Infrastruktur/VM übertragen.
- F: Was bedeutet Retire? | A: System abschalten, weil es nicht mehr gebraucht wird.
- F: Was bedeutet Replace? | A: Durch Standardsoftware/SaaS ersetzen.
- F: Was bedeutet Refactor? | A: Anwendung neu entwerfen (z. B. Container).
- F: Wie lautet die Risikoformel? | A: Eintrittswahrscheinlichkeit × Schadenshöhe.
- F: Wie inventarisiert man alte Betriebssysteme im AD? | A: `Get-ADComputer -Properties OperatingSystem`
- F: Was ist ein Jump-Host? | A: Gehärteter Zwischenserver, über den man auf isolierte Systeme zugreift.
- F: Warum ist ein Air Gap nicht sicher? | A: Wechselmedien (USB) können Malware einschleppen.

## Quiz
? Was ist der erste Schritt im Umgang mit Legacy?
* Inventarisieren
- Abschalten
- Firewall deaktivieren
- Neu kaufen

? Was leistet Virtual Patching?
* Blockt Exploits per IPS/WAF ohne echten Patch
- Installiert Updates automatisch
- Verschlüsselt die Festplatte
- Ersetzt das Betriebssystem

? Was muss jede Ausnahme für ein Altsystem enthalten?
* Verantwortlichen und Ablaufdatum
- Ein Passwort
- Eine Lizenz
- Ein Backup der Firewall

? Was bedeutet Rehost?
* Unverändert auf neue Infrastruktur verschieben
- Anwendung neu programmieren
- System löschen
- Durch SaaS ersetzen

? Welche Maßnahme trennt ein Altsystem vom restlichen Netz?
* VLAN mit Firewall-Whitelist
- Größere Subnetzmaske
- Zusätzliche DNS-Zone
- Zeitserver

? Wie lautet die Risikoformel?
* Eintrittswahrscheinlichkeit × Schadenshöhe
- Kosten + Nutzen
- Verfügbarkeit − Ausfall
- MTBF ÷ MTTR
