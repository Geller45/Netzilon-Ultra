---
id: server-hvsz-34
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 34 – Backup-VM überlastet das Netz: Bandbreitenverwaltung
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-vswitch, az801-netzwerk-troubleshooting, server-hvsz-29, server-hvsz-37]
---

## Profi

### Ticket
**Kunde meldet:** „Jeden Abend ab 18 Uhr ist das Remote-Desktop-Arbeiten unerträglich langsam. Der Dateiserver ist kaum erreichbar.“
- **Priorität:** mittel
- **Betroffene Maschinen:** **BACKUP01** (Verursacher), **FS01** und **RDS01** auf **HV01**

### Ausgangslage
- **HV01.example.com**: Server 2025, ein externer vSwitch **„Extern“** auf einer 1-Gbit/s-Karte (beim Anlegen ohne Angabe des Bandbreitenmodus erstellt)
- VMs: **FS01** (192.168.10.20), **RDS01** (192.168.10.31), **BACKUP01** (192.168.10.70) – Letztere kopiert ab 18 Uhr Sicherungen auf ein NAS.
- Ressourcenmessung zeigt: BACKUP01 belegt fast die ganze Leitung.

### Analyse
- Hyper-V bietet pro virtueller Netzwerkkarte **Bandbreitenverwaltung** (Bandwidth Management):
  - **Maximale Bandbreite** (`-MaximumBandwidth`, **Bit/s**): harter Deckel.
  - **Minimale Bandbreite**: garantierter Anteil, entweder als **Gewichtung** (`-MinimumBandwidthWeight`, 0–100) oder **absolut** (`-MinimumBandwidthAbsolute`, Bit/s).
- Welche Art von Minimum möglich ist, bestimmt der **Bandbreitenmodus des vSwitch** (`-MinimumBandwidthMode`: Absolute, Weight, Default, None) – **nur beim Erstellen** des Switches festlegbar. „Default“ ergibt **Weight** (bzw. None bei SR-IOV-Switch).
- `Get-VMSwitch Extern | Select BandwidthReservationMode` zeigt den Modus.
- Der Hyper-V-Manager stellt Minimum/Maximum in **Mbit/s** ein; Gewichte lassen sich nur per PowerShell setzen.

### Lösungsweg
1. **Messen**: `Enable-VMResourceMetering`, `Measure-VM` → Netzwerkverkehr pro VM. *Begründung:* Verursacher belegen.
2. **Deckel für BACKUP01:** `-MaximumBandwidth 300000000` (300 Mbit/s). *Begründung:* Backup läuft weiter, lässt aber Platz.
3. **Mindestanteile** per Gewichtung: FS01 30, RDS01 30, BACKUP01 10. *Begründung:* Bei Engpass bekommen die interaktiven Dienste garantierte Anteile; Gewichte gelten relativ zueinander.
4. Modus prüfen: Steht der Switch auf **Weight**, funktionieren Gewichte; bei **Absolute** stattdessen `-MinimumBandwidthAbsolute`. *Begründung:* Der Modus ist nachträglich nicht änderbar (sonst Switch neu anlegen).
5. Optional: Backup-Zeitfenster/Drosselung in der Backup-Software. *Begründung:* Doppelte Absicherung.

### Ergebnis prüfen
- `Get-VMNetworkAdapter -VMName BACKUP01 | Select-Object -ExpandProperty BandwidthSetting`
- Abends: RDP-Sitzungen flüssig, Kopierrate von BACKUP01 bleibt unter 300 Mbit/s (Task-Manager im Gast, Leistungsindikator „Hyper-V Virtual Network Adapter“ am Host).

### Vorbeugung
- Neue vSwitches bewusst mit `-MinimumBandwidthMode Weight` anlegen.
- Standardprofile: Backup/Replikation gedeckelt, Benutzer-VMs mit Gewichtung.
- Backup-Verkehr langfristig auf eigenes Netz/eigene Karte legen.

## Einfach
Stell dir eine **Straße mit nur einer Spur** vor. Abends fährt ein riesiger **Lkw-Konvoi** (das Backup) los und blockiert alles. Die kleinen Autos (Remote Desktop, Dateiserver) stehen im Stau.

Hyper-V kann wie ein Verkehrspolizist zwei Regeln aufstellen:
- **Tempolimit / Höchstmenge** für die Lkw: „Ihr dürft höchstens 300 Mbit/s nutzen.“ Dann bleibt Platz für die anderen.
- **Garantierte Plätze**: „Die Autos vom Dateiserver und Remote Desktop bekommen bei Stau immer ihren Anteil.“ Das geht über **Gewichte** – wer mehr Punkte hat, bekommt mehr Platz.

Wichtig: Wie die garantierten Plätze gezählt werden (Punkte oder feste Mbit/s), legt man fest, **wenn die Straße gebaut wird** (beim Anlegen des virtuellen Switches). Später kann man das nicht mehr umbauen – nur eine neue Straße bauen.

## Merksatz
- **Maximum** = Deckel in **Bit/s**.
- **Minimum** = Garantie als **Gewicht (0–100)** oder **absolut**.
- Modus legt der **vSwitch beim Erstellen** fest.
- GUI rechnet in **Mbit/s**, PowerShell in **Bit/s**.

## Prüfungsfalle
- `-MaximumBandwidth 300` bedeutet 300 **Bit/s**, nicht Mbit/s.
- `-MinimumBandwidthWeight` funktioniert nur, wenn der vSwitch im Modus **Weight** ist.
- Der Bandbreitenmodus des vSwitch kann **nicht nachträglich** geändert werden.
- Gewichte sind **relativ** – entscheidend ist das Verhältnis, nicht die absolute Zahl.

## Grafik
### Abendstau auf dem vSwitch
1. BACKUP01 -> NAS: Sicherung belegt fast 1 Gbit/s
2. Client -> RDS01: Sitzung ruckelt im Stau
3. Admin -> BACKUP01: MaximumBandwidth 300 Mbit/s
4. Admin -> FS01, RDS01: MinimumBandwidthWeight 30
5. vSwitch: verteilt bei Engpass nach Gewichten
6. Client -> RDS01: Sitzung wieder flüssig

## Lab
**Nachstellen:** Große Kopie erzeugt Last, Deckel und Gewichte bändigen sie. Maschinen: **HV01**, VMs **BACKUP01**, **FS01**.

### GUI
1. **BACKUP01**: große Datei (mehrere GB) per Explorer auf `\\FS01\Daten` kopieren → Rate notieren.
2. **HV01**: Hyper-V-Manager → BACKUP01 → Einstellungen → Netzwerkkarte → **Bandbreitenverwaltung aktivieren** → Maximale Bandbreite **300** Mbit/s → OK.
3. **BACKUP01**: Kopie erneut starten → Rate bleibt unter ca. 300 Mbit/s.
4. **HV01**: PowerShell → Modus des Switches prüfen (siehe unten).
5. **HV01**: Gewichte für FS01 und BACKUP01 per PowerShell setzen (Gewichtung gibt es nur in PowerShell).
6. **HV01**: Lab zurücksetzen: Bandbreitenverwaltung bei BACKUP01 deaktivieren.

### PowerShell
```powershell
# Auf HV01 – Verbrauch messen
Enable-VMResourceMetering -VMName BACKUP01, FS01, RDS01
Measure-VM -VMName BACKUP01 | Select-Object -ExpandProperty NetworkMeteredTrafficReport

# Auf HV01 – Modus des Switches
Get-VMSwitch -Name Extern | Select-Object Name, BandwidthReservationMode

# Auf HV01 – Deckel und Gewichte (Werte in Bit/s bzw. 0-100)
Set-VMNetworkAdapter -VMName BACKUP01 -MaximumBandwidth 300000000 -MinimumBandwidthWeight 10
Set-VMNetworkAdapter -VMName FS01  -MinimumBandwidthWeight 30
Set-VMNetworkAdapter -VMName RDS01 -MinimumBandwidthWeight 30
Get-VMNetworkAdapter -VMName BACKUP01, FS01, RDS01 | Format-List VMName, BandwidthSetting

# Auf HV01 – künftige Switches gleich richtig anlegen
New-VMSwitch -Name "Extern2" -NetAdapterName "Ethernet 2" -MinimumBandwidthMode Weight -AllowManagementOS $true
```

## Szenario
### Kontrollfragen
BACKUP01 belegt abends die 1-Gbit/s-Leitung des vSwitch „Extern“. FS01 und RDS01 sollen bei Engpass garantierte Anteile bekommen.
- F: Welcher Parameter deckelt BACKUP01 auf 300 Mbit/s? | A: Set-VMNetworkAdapter -VMName BACKUP01 -MaximumBandwidth 300000000
- F: In welcher Einheit erwartet -MaximumBandwidth den Wert? | A: In Bit pro Sekunde.
- F: Welche Voraussetzung hat -MinimumBandwidthWeight? | A: Der vSwitch muss im Bandbreitenmodus Weight sein.
- F: Kann man den Modus eines bestehenden vSwitch ändern? | A: Nein, nur beim Erstellen festlegen – sonst Switch neu anlegen.
- F: Wie belegst du, welche VM das Netz belastet? | A: Enable-VMResourceMetering und Measure-VM bzw. Leistungsindikatoren der virtuellen Netzwerkadapter.

## Legende
### Bandbreitenverwaltung
- Was: Maximal- und Mindestbandbreite pro virtueller Netzwerkkarte.
- Wie: Set-VMNetworkAdapter -MaximumBandwidth (Bit/s), -MinimumBandwidthWeight (0–100) oder -MinimumBandwidthAbsolute.
- Wann: Wenn einzelne VMs (Backup, Replikation) andere verdrängen.
- Wo: Hyper-V-Manager → VM → Netzwerkkarte → Bandbreitenverwaltung bzw. PowerShell.
- Warum: Faire Verteilung der gemeinsamen physischen Uplink-Bandbreite.
### MinimumBandwidthMode
- Was: Modus des vSwitch für Mindestbandbreiten (Absolute, Weight, Default, None).
- Wann: Nur beim New-VMSwitch festlegbar.

## Karteikarten
- F: Welche Einheit hat -MaximumBandwidth? | A: Bit pro Sekunde.
- F: Welcher Wertebereich gilt für -MinimumBandwidthWeight? | A: 0 bis 100.
- F: Welche Modi kennt -MinimumBandwidthMode? | A: Absolute, Weight, Default, None.
- F: Was ergibt der Modus Default bei einem Switch ohne SR-IOV? | A: Weight.
- F: Wann wird der Bandbreitenmodus eines vSwitch festgelegt? | A: Beim Erstellen – nachträglich nicht änderbar.
- F: Wie zeigt man die Bandbreiteneinstellung einer vNIC an? | A: Get-VMNetworkAdapter -VMName VM \| Select-Object -ExpandProperty BandwidthSetting
- F: In welcher Einheit stellt der Hyper-V-Manager die Bandbreite ein? | A: Mbit/s.
- F: Was bedeutet die Gewichtung bei Mindestbandbreite? | A: Relativer Anteil, den eine vNIC bei Engpass garantiert bekommt.

## Quiz
? Welcher Befehl begrenzt BACKUP01 auf 300 Mbit/s?
* Set-VMNetworkAdapter -VMName BACKUP01 -MaximumBandwidth 300000000
- Set-VMNetworkAdapter -VMName BACKUP01 -MaximumBandwidth 300
- Set-VMSwitch -MaximumBandwidth 300MB
- Set-VMProcessor -VMName BACKUP01 -Maximum 30
! Der Wert ist in Bit/s anzugeben.

? Wann funktioniert -MinimumBandwidthWeight?
* Wenn der vSwitch im Modus Weight erstellt wurde
- Immer, unabhängig vom Switch
- Nur bei internen Switches
- Nur bei Gen-1-VMs
! Der Modus wird bei New-VMSwitch festgelegt.

? Wie ändert man den Bandbreitenmodus eines vorhandenen vSwitch?
* Gar nicht – der Switch muss neu erstellt werden
- Set-VMSwitch -MinimumBandwidthMode Weight
- Im Hyper-V-Manager unter Netzwerkkarte
- Über Set-VMHost
! Der Modus ist nur bei der Erstellung wählbar.

? Was bedeutet MinimumBandwidthMode Default bei einem Switch ohne SR-IOV?
* Weight
- Absolute
- None
- Maximum
! Bei SR-IOV-Switches ergibt Default dagegen None.

? Welche Werte sind für MinimumBandwidthWeight zulässig?
* 0 bis 100
- 1 bis 10000
- 0 bis 1
- 1 bis 1000 Mbit/s
! Gewichte sind relative Anteile.

? Womit ermittelst du den Netzwerkverbrauch einer VM über die Zeit?
* Enable-VMResourceMetering und Measure-VM
- Get-VMSwitchTeam
- Compare-VM
- Test-NetConnection -Bandwidth
! Die Ressourcenmessung liefert Netzwerkverkehrsberichte.

? Welche Einheit nutzt der Hyper-V-Manager für die Bandbreitenverwaltung?
* Mbit/s
- Bit/s
- Prozent
- Pakete pro Sekunde
! PowerShell erwartet dagegen Bit/s.

? Was ist eine sinnvolle Langfristlösung für Backup-Verkehr?
* Eigenes Netz bzw. eigene Netzwerkkarte für Backups
- Backup-VM in Gen 1 umwandeln
- MAC-Spoofing aktivieren
- DHCP-Wächter einschalten
! Trennung der Verkehrsarten verhindert Konkurrenz.
