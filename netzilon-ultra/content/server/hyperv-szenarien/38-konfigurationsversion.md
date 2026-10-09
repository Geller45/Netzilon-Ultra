---
id: server-hvsz-38
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 38 – Nach Host-Upgrade: VM-Konfigurationsversion aktualisieren
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AZ-801, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az801-cau-rolling-upgrade, az800-nested, az800-pruefpunkte, server-hvsz-31]
---

## Profi

### Ticket
**Kunde meldet:** „HV01 läuft seit letzter Woche mit Server 2025. Die alten VMs gehen, aber neue Funktionen lassen sich nicht aktivieren, und der Hyper-V-Manager zeigt bei ihnen ‚Konfigurationsversion 9.0‘. Können wir einfach alles hochziehen?“
- **Priorität:** niedrig (Planungsfrage)
- **Betroffene Maschinen:** **FS01**, **APP01**, **SQL01** auf **HV01**

### Ausgangslage
- **HV01.example.com**: von Server 2019 auf **Server 2025** aktualisiert (neu installiert, VMs importiert).
- **HV02.example.com** läuft noch mit **Server 2019** und dient als Ausweich-/Replikatziel.
- VMs FS01 (192.168.10.20), APP01 (192.168.10.22), SQL01 (192.168.10.21) mit Version **9.0**.

### Analyse
- Jede VM hat eine **Konfigurationsversion** (VM configuration version). Sie bestimmt, welche Hyper-V-Funktionen die VM nutzen kann, und mit welchen Hosts sie kompatibel ist.
- Ein neuer Host kann VMs **älterer** Versionen ausführen (für Migration/Rolling Upgrade), aktualisiert sie aber **nicht automatisch**.
- `Get-VMHostSupportedVersion` zeigt, welche Versionen der Host kann und welche **Standard** ist (Server 2025: Standard **12.0**; Server 2022: 10.0; Server 2019: 9.0; Server 2016: 8.0).
- `Update-VMVersion` hebt die VM auf die **höchste vom Host unterstützte** Version.
- **Einbahnstraße:** Ein Zurück gibt es **nicht**. Danach läuft die VM **nicht mehr** auf älteren Hosts – hier also nicht mehr auf **HV02 (Server 2019)**, weder per Live-Migration noch per Replikat oder Import.
- In einem Failover-Cluster erst nach Abschluss des **Rolling Upgrades** und `Update-ClusterFunctionalLevel` aktualisieren.

### Lösungsweg
1. **Abhängigkeiten klären**: Muss eine VM noch auf HV02 laufen (Replikat, Notfall)? *Begründung:* Nach dem Update ist der alte Host kein Ziel mehr.
2. **Entscheidung**: FS01 und APP01 jetzt aktualisieren; SQL01 bleibt auf 9.0, bis HV02 ebenfalls Server 2025 hat. *Begründung:* SQL01 wird nach HV02 repliziert.
3. **Sicherung** der betroffenen VMs. *Begründung:* Rückweg nur über Wiederherstellung.
4. VMs **herunterfahren** (Zustand „Aus“, nicht „Gespeichert“). *Begründung:* Update-VMVersion verlangt eine ausgeschaltete VM; gespeicherte Zustände/ältere Prüfpunkte sollten vorher bereinigt werden.
5. `Update-VMVersion` ausführen. *Begründung:* VM erhält Version 12.0.
6. VMs starten und neue Funktionen nutzen. *Begründung:* Zweck der Maßnahme.

### Ergebnis prüfen
- `Get-VM | Format-Table Name, Version, State`
- FS01, APP01 → 12.0; SQL01 → 9.0 (bewusst).
- Dokumentation: Welche VM kann auf welchem Host laufen?

### Vorbeugung
- Upgrade-Plan: erst **alle** Hosts eines Verbunds aktualisieren, dann die VM-Versionen.
- Neue VMs auf gemischten Umgebungen bewusst mit älterer Version erstellen: `New-VM -Version 9.0`.
- Versionsstand in die CMDB aufnehmen.

## Einfach
Stell dir vor, du hast ein **Videospiel-Speicherstand** von einer alten Konsole. Die neue Konsole kann den alten Speicherstand laden und spielen – super! Aber neue Spielfunktionen gibt es erst, wenn du den Speicherstand **auf das neue Format umwandelst**.

Der Haken: Ist der Speicherstand einmal umgewandelt, kann die **alte Konsole ihn nie wieder lesen**. Es gibt keinen Rückweg.

Genau so ist es bei Hyper-V:
- Die **Konfigurationsversion** ist das Format des VM-Speicherstands.
- Der neue Host (Server 2025) kann alte VMs laufen lassen.
- Mit **Update-VMVersion** wandelt man sie ins neue Format.
- Danach kann der alte Host (Server 2019) sie nicht mehr starten.

Darum überlegt man vorher genau: Braucht diese VM den alten Host noch – zum Beispiel als Notfall-Ersatz? Wenn ja, wartet man mit dem Umwandeln, bis auch der alte Host modernisiert ist.

## Merksatz
- **Update-VMVersion = Einbahnstraße.**
- Erst **alle Hosts**, dann die **VMs**.
- Server 2025 = **12.0**, 2022 = 10.0, 2019 = 9.0, 2016 = 8.0.
- VM muss **aus** sein.

## Prüfungsfalle
- Die Version wird beim Import/Upgrade des Hosts **nicht automatisch** erhöht.
- Nach dem Update ist **keine Migration** mehr auf ältere Hosts möglich – auch kein Hyper-V-Replikat dorthin.
- Im Cluster erst nach `Update-ClusterFunctionalLevel` die VM-Versionen anheben.
- `Get-VMHostSupportedVersion -Default` zeigt die Standardversion für neue VMs.

## Grafik
### Einbahnstraße Konfigurationsversion
1. HV01: Upgrade auf Server 2025, VMs bleiben auf 9.0
2. HV01 -> HV02: VM 9.0 kann weiterhin zum 2019-Host migriert werden
3. Admin -> FS01: Update-VMVersion auf 12.0
4. HV01 -> HV02: Migration von FS01 abgelehnt – Version zu neu
5. Admin: SQL01 bleibt bewusst auf 9.0

## Lab
**Nachstellen:** VM mit alter Version erzeugen, aktualisieren, Folgen beobachten. Maschinen: **HV01** (Server 2025), optional **HV02** mit älterer Version.

### GUI
1. **HV01**: PowerShell → Test-VM mit Version 9.0 anlegen (siehe unten; im GUI ist die Version nicht wählbar).
2. **HV01**: Hyper-V-Manager → Spalte **Konfigurationsversion** einblenden (Ansicht → Spalten hinzufügen/entfernen) → ALT01 zeigt 9.0.
3. **HV01**: ALT01 → Rechtsklick → **Konfigurationsversion aktualisieren** → Warnung lesen („kann nicht rückgängig gemacht werden“) → bestätigen.
4. **HV01**: Spalte zeigt 12.0.
5. **HV01**: ALT01 exportieren → auf **HV02** (Server 2019) importieren → Import schlägt fehl (Version nicht unterstützt).

### PowerShell
```powershell
# Auf HV01 – unterstützte Versionen
Get-VMHostSupportedVersion
Get-VMHostSupportedVersion -Default

# Auf HV01 – VM mit älterer Version erzeugen
New-VM -Name ALT01 -Generation 2 -MemoryStartupBytes 1GB -Version 9.0 -NoVHD
Get-VM -Name ALT01 | Select-Object Name, Version

# Auf HV01 – Bestand anzeigen
Get-VM | Format-Table Name, State, Version

# Auf HV01 – aktualisieren (VM aus; keine Rückkehr möglich)
Stop-VM -Name FS01, APP01
Update-VMVersion -Name FS01, APP01 -Confirm
Start-VM -Name FS01, APP01
Get-VM -Name FS01, APP01, SQL01 | Format-Table Name, Version
```

## Szenario
### Kontrollfragen
HV01 wurde auf Server 2025 aktualisiert, HV02 läuft noch mit Server 2019. SQL01 wird nach HV02 repliziert; FS01 und APP01 laufen nur auf HV01.
- F: Welche VMs dürfen jetzt aktualisiert werden? | A: FS01 und APP01; SQL01 erst, wenn HV02 ebenfalls aktualisiert ist.
- F: Welches Cmdlet hebt die Version an? | A: Update-VMVersion -Name <VM>
- F: Kann man die Version wieder senken? | A: Nein, nur durch Wiederherstellen einer Sicherung.
- F: Welche Standardversion hat Server 2025? | A: 12.0.
- F: Wie zeigst du die vom Host unterstützten Versionen? | A: Get-VMHostSupportedVersion

## Legende
### VM-Konfigurationsversion
- Was: Versionsstand der VM-Konfiguration, der Funktionen und Host-Kompatibilität bestimmt.
- Wie: Anzeige mit Get-VM, Anheben mit Update-VMVersion, Vorgabe mit New-VM -Version.
- Wann: Nach dem Upgrade **aller** Hosts, auf denen die VM laufen soll.
- Wo: Auf dem Hyper-V-Host bzw. im Hyper-V-Manager (Spalte Konfigurationsversion).
- Warum: Neue Funktionen nutzen, ohne die Kompatibilität zu früh aufzugeben.

## Karteikarten
- F: Was bestimmt die VM-Konfigurationsversion? | A: Welche Hyper-V-Funktionen die VM nutzen kann und auf welchen Hosts sie läuft.
- F: Welches Cmdlet aktualisiert die Version? | A: Update-VMVersion
- F: Kann man eine aktualisierte VM auf einen älteren Host migrieren? | A: Nein.
- F: Welche Standardversion hat Windows Server 2025? | A: 12.0.
- F: Welche Standardversion hat Windows Server 2022? | A: 10.0.
- F: Wie erstellt man eine VM mit älterer Version? | A: New-VM -Version 9.0 (Beispiel).
- F: Welchen Zustand muss die VM beim Update haben? | A: Ausgeschaltet.
- F: Was gilt im Cluster? | A: Erst Rolling Upgrade abschließen und Update-ClusterFunctionalLevel ausführen, dann VM-Versionen anheben.

## Quiz
? Was passiert mit den VM-Versionen nach einem Host-Upgrade automatisch?
* Nichts – sie bleiben auf der alten Version
- Sie werden auf die höchste Version gesetzt
- Sie werden auf 1.0 zurückgesetzt
- Sie werden gelöscht
! Das Anheben ist ein bewusster Schritt mit Update-VMVersion.

? Welche Folge hat Update-VMVersion für eine VM in einer gemischten Hostumgebung?
* Sie läuft nicht mehr auf Hosts mit älterer Version
- Die VM wird automatisch in Generation 2 umgewandelt
- Die VM kann danach auf jeden Host migriert werden
- Die VM wird auf allen Hosts auf Version 5.0 gesetzt
! Es gibt keinen Rückweg.

? Welche Standard-Konfigurationsversion verwendet Windows Server 2025?
* 12.0
- 9.0
- 10.0
- 8.0
! Server 2022 nutzt 10.0, Server 2019 9.0.

? Mit welchem Cmdlet siehst du die vom Host unterstützten Versionen?
* Get-VMHostSupportedVersion
- Get-VMVersion -All
- Get-WindowsFeature Hyper-V
- Compare-VM
! Mit -Default zusätzlich die Standardversion.

? In welchem Zustand muss die VM für Update-VMVersion sein?
* Ausgeschaltet
- Laufend
- Gespeichert
- Angehalten
! Konfigurationsänderung nur offline.

? Wann sollte man in einem Cluster die VM-Versionen anheben?
* Nach Rolling Upgrade und Update-ClusterFunctionalLevel
- Vor dem Upgrade des ersten Clusterknotens
- Während des gemischten Modus mit alten Knoten
- Nie, die Version wird automatisch angehoben
! Sonst laufen VMs nicht mehr auf alten Knoten.

? Wie erzeugst du auf einem 2025-Host eine VM, die auch auf Server 2019 läuft?
* New-VM -Version 9.0
- New-VM -Generation 1
- New-VM -Legacy
- Set-VMHost -Version 9.0
! Die Version kann beim Erstellen gewählt werden.

? Wie kann man nach einem versehentlichen Update auf eine ältere Version zurück?
* Nur durch Wiederherstellen einer Sicherung
- Mit Downgrade-VMVersion
- Mit Update-VMVersion -Version 9.0
- Durch Neustart des Hosts
! Ein Downgrade-Cmdlet gibt es nicht.
