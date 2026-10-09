---
id: server-hvsz-18
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 18 – VM auf anderen Host umziehen: Export und Import
stufe: Einsteiger
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-vhdx, az800-vswitch, server-hvsz-17, server-hvsz-21, server-hvsz-22]
---

## Profi

### Ticket
**Kunde meldet:** „HV01 wird nächsten Monat ersetzt. Bitte die VM WIKI01 auf den neuen Host HV02 umziehen. Ein Cluster gibt es nicht, Live-Migration ist noch nicht eingerichtet. Eine kurze Downtime am Abend ist ok.“
- Datum/Priorität: 01.10.2026, **Priorität 4 (geplant)**.
- Betroffene Maschinen: VM **WIKI01** von **HV01.example.com** nach **HV02.example.com**.

### Ausgangslage
- HV01 (192.168.10.21) und HV02 (192.168.10.22): Server 2025, Domäne example.com.
- WIKI01: Gen 2, Konfigurationsversion 12.0, 1 VHDX 80 GB, vSwitch **LAN**, IP 192.168.10.80.
- Auf HV02 heißt der externe Switch **LAN-Neu** (Abweichung!).
- Exportziel: Freigabe `\\HV02\Import$` bzw. Laufwerk E:\Import auf HV02.

### Analyse
**Export** schreibt eine vollständige Kopie einer VM (Konfiguration **.vmcx**, Laufzeitzustand, VHDX, Prüfpunkte) in einen Ordner. Seit Server 2012 R2 kann man auch **laufende** VMs exportieren. **Import** liest diesen Ordner auf dem Zielhost ein. Typische Stolpersteine:

| Hypothese / Risiko | Prüfung |
|---|---|
| Ziel-Host unterstützt die Konfigurationsversion nicht | `Get-VMHostSupportedVersion` auf HV02 vs. `Get-VM WIKI01 \| Select Version` |
| vSwitch-Name auf dem Ziel abweichend | `Compare-VM` → Inkompatibilitätsbericht |
| Zu wenig Speicher auf dem Ziel | `Get-Volume` auf HV02 |
| Doppelte VM-ID/MAC, falls Original weiterläuft | Importtyp wählen |
| Prozessor anderer Hersteller (Intel ↔ AMD) | Gespeicherter Zustand nicht übertragbar → VM vor Export herunterfahren |

**Importtypen**:
| Typ | Was passiert | Wann |
|---|---|---|
| **Direkt registrieren** (vorhandene ID) | VM wird **am Ort** der Dateien registriert, nichts kopiert | Dateien liegen schon am Zielort |
| **Wiederherstellen** (vorhandene ID) | Dateien werden an einen neuen Ort **kopiert**, ID bleibt | Umzug, Original wird gelöscht |
| **Kopieren** (neue eindeutige ID) | Dateien werden kopiert, **neue VM-ID** | Klon/zweites Exemplar, Original bleibt bestehen |

### Lösungsweg
1. **WIKI01 herunterfahren** (Downtime erlaubt) – Begründung: konsistenter Zustand, kein gespeicherter RAM-Zustand, der auf anderer CPU scheitern könnte.
2. **Exportieren** nach `\\HV02\Import$\` – Begründung: komplette, transportierbare Kopie.
3. **Kompatibilität prüfen** mit `Compare-VM` auf HV02 – Begründung: zeigt fehlende Switches/Pfade vor dem Import.
4. **Importieren** auf HV02 als **Wiederherstellen** (ID bleibt, Kopie in `E:\VMs`) – Begründung: Es ist ein Umzug; Original wird anschließend entfernt, deshalb gleiche ID unproblematisch. Für ein **zusätzliches** Exemplar wäre **Kopieren (neue ID)** zu wählen.
5. **Netzwerkkarte** mit `LAN-Neu` verbinden – Begründung: Switch-Name weicht ab.
6. **Starten und testen**, danach **Original auf HV01 entfernen** – Begründung: Doppelte Instanzen (gleiche IP/MAC/SID) vermeiden.

### Ergebnis prüfen
- WIKI01 läuft auf HV02, `Get-VM WIKI01 -ComputerName HV02` zeigt *Running*.
- Wiki unter http://wiki01.example.com erreichbar, DNS/IP unverändert.
- Auf HV01 ist WIKI01 entfernt (nach erfolgreichem Test).

### Vorbeugung
- vSwitch-Namen auf allen Hosts **einheitlich** halten.
- Für regelmäßige Umzüge **Live-Migration** (ohne Cluster: Shared-Nothing) einrichten – Szenario 21.
- Konfigurationsversion erst aktualisieren, wenn alle Ziel-Hosts sie unterstützen.

## Einfach

Stell dir vor, du ziehst mit deinem **Kinderzimmer** um. Beim **Export** packst du **alles in Umzugskartons**: Möbel (Einstellungen), Spielzeug (Festplatten), sogar die Fotos von früher (Prüfpunkte). Die Kartons stellst du ins neue Haus (HV02).

Beim **Import** packst du wieder aus. Dabei gibt es drei Möglichkeiten:
- **Direkt registrieren**: Die Kartons stehen schon im richtigen Zimmer, du sagst nur „Das ist jetzt mein Zimmer“.
- **Wiederherstellen**: Du räumst alles in ein neues Zimmer – und du bist immer noch **derselbe** (gleiche ID). Gut beim Umzug, weil das alte Zimmer danach leer ist.
- **Kopieren**: Du baust ein **zweites, gleiches Zimmer** für deinen Zwilling – der bekommt einen **eigenen Namen** (neue ID), damit man euch nicht verwechselt.

Im neuen Haus heißt der **Flur** anders (LAN-Neu statt LAN). Also musst du die Tür deines Zimmers an den richtigen Flur anschließen. Erst wenn alles klappt, räumst du das alte Zimmer leer.

## Merksatz
- Export = **komplette Kopie** (Konfiguration, VHDX, Prüfpunkte).
- Import: **Registrieren** (vor Ort), **Wiederherstellen** (kopieren, gleiche ID), **Kopieren** (neue ID).
- Klon = **Kopieren mit neuer ID**.
- `Compare-VM` zeigt Probleme **vor** dem Import.

## Prüfungsfalle
- „Kopieren (neue ID)“ ändert **nicht** den Computernamen/die SID im Gast – für echte Klone Sysprep verwenden.
- Export einer **laufenden** VM ist seit Server 2012 R2 möglich.
- Ein Import scheitert, wenn der Ziel-Host die **Konfigurationsversion** nicht kennt.
- Gespeicherter Zustand ist zwischen **Intel und AMD** nicht übertragbar.

## Grafik
### Umzugskartons
1. Admin -> WIKI01: Herunterfahren
2. HV01 -> HV02: Export-Ordner mit vmcx, VHDX und Prüfpunkten
3. HV02: Compare-VM meldet fehlenden Switch LAN
4. Admin -> HV02: Import als Wiederherstellen nach E VMs
5. HV02 -> WIKI01: Netzwerkkarte mit LAN-Neu verbinden
6. WIKI01: Start auf HV02, Test erfolgreich
7. Admin -> HV01: Original entfernen

## Lab
**Maschinen**: **HV01.example.com** (Quelle), **HV02.example.com** (Ziel), VM **WIKI01**.
Nachstellen: Zuerst den Fehler bewusst erzeugen (abweichender Switch-Name), dann beheben.

### GUI
1. **HV02**: Hyper-V-Manager → Manager für virtuelle Switches → externen Switch **LAN-Neu** anlegen (absichtlich anderer Name als auf HV01).
2. **HV01**: Hyper-V-Manager → WIKI01 → **Herunterfahren** → Rechtsklick → **Exportieren** → Ziel `\\HV02\Import$` → Exportieren; Fortschritt in der Statusspalte.
3. **HV02**: Hyper-V-Manager → Aktionen → **Virtuellen Computer importieren** → Ordner `E:\Import\WIKI01` → VM auswählen.
4. **HV02**: Importtyp **Virtuellen Computer wiederherstellen (vorhandene eindeutige ID verwenden)** → Speicherorte `E:\VMs\WIKI01` → Weiter.
5. **HV02**: Seite **Netzwerk verbinden** (Fehlerbild: Switch „LAN“ nicht gefunden) → **LAN-Neu** auswählen → Fertig stellen.
6. **HV02**: WIKI01 → Starten → Anmeldung und Webseite testen.
7. **HV01**: Hyper-V-Manager → WIKI01 → **Löschen** und alte Dateien nach Prüfung entfernen.

### PowerShell
1. **HV01**: Exportieren.
2. **HV02**: Kompatibilität prüfen und Bericht korrigieren.
3. **HV02**: Importieren, starten, Original entfernen.

```powershell
# Auf HV01 – Export
Stop-VM -Name WIKI01
Export-VM -Name WIKI01 -Path \\HV02\Import$

# Auf HV02 – Versionen und Kompatibilität prüfen
Get-VMHostSupportedVersion
$vmcx = Get-ChildItem "E:\Import\WIKI01\Virtual Machines\*.vmcx"
$bericht = Compare-VM -Path $vmcx.FullName -Copy -VirtualMachinePath E:\VMs\WIKI01 -VhdDestinationPath E:\VMs\WIKI01
$bericht.Incompatibilities | Format-Table Message, MessageId
$bericht.Incompatibilities | Where-Object MessageId -eq 33012 | ForEach-Object { $_.Source | Connect-VMNetworkAdapter -SwitchName "LAN-Neu" }

# Auf HV02 – Import (Wiederherstellen = kopieren mit vorhandener ID)
Import-VM -CompatibilityReport $bericht
Start-VM -Name WIKI01

# Variante Klon: Import-VM -Path $vmcx.FullName -Copy -GenerateNewId -VirtualMachinePath ... -VhdDestinationPath ...

# Auf HV01 – Original nach erfolgreichem Test entfernen
Remove-VM -Name WIKI01 -Force
```

## Szenario
### Kontrollfragen
WIKI01 soll ohne Cluster von HV01 nach HV02 umziehen. Auf HV02 heißt der Switch „LAN-Neu“.
- F: Welche Importart passt für einen Umzug? | A: Wiederherstellen – Dateien werden an den Zielort kopiert, die vorhandene ID bleibt; das Original wird danach entfernt.
- F: Wann wählt man „Kopieren (neue eindeutige ID)“? | A: Wenn ein zusätzliches Exemplar neben dem Original entstehen soll.
- F: Wie erkennt man den fehlenden Switch vor dem Import? | A: Mit Compare-VM; der Bericht listet die Inkompatibilität, die man korrigiert und an Import-VM übergibt.
- F: Was muss vor dem Import zur Konfigurationsversion geprüft werden? | A: Ob der Ziel-Host sie unterstützt (Get-VMHostSupportedVersion).
- F: Ändert „neue ID“ den Computernamen oder die SID im Gast? | A: Nein, nur die Hyper-V-VM-ID; für echte Klone Sysprep verwenden.

## Reihenfolge
### Umzug per Export/Import
1. VM herunterfahren
2. VM exportieren
3. Konfigurationsversion und Kompatibilität auf dem Ziel prüfen
4. Inkompatibilitäten wie Switch-Namen korrigieren
5. Importieren mit passender Importart
6. VM starten und testen
7. Original auf dem Quell-Host entfernen

## Legende
### Importtypen
- Was: Direkt registrieren (vor Ort, alte ID), Wiederherstellen (kopieren, alte ID), Kopieren (kopieren, neue ID).
- Wie: Assistent „Virtuellen Computer importieren“ bzw. `Import-VM` mit `-Register` (Standard), `-Copy` oder `-Copy -GenerateNewId`.
- Wann: Registrieren bei bereits platzierten Dateien, Wiederherstellen beim Umzug, Kopieren beim Klonen.
- Wo: auf dem Ziel-Host HV02.
- Warum: verhindert doppelte IDs und legt fest, ob Dateien kopiert werden.

## Karteikarten
- F: Was enthält ein Export? | A: VM-Konfiguration (.vmcx), Laufzeitzustand, virtuelle Festplatten und Prüfpunkte.
- F: Kann man laufende VMs exportieren? | A: Ja, seit Windows Server 2012 R2.
- F: Welche drei Importtypen gibt es? | A: Direkt registrieren, Wiederherstellen, Kopieren (neue eindeutige ID).
- F: Welcher Importtyp erzeugt eine neue VM-ID? | A: Kopieren (Import-VM -Copy -GenerateNewId).
- F: Wofür dient Compare-VM? | A: Erstellt einen Kompatibilitätsbericht vor dem Import (z. B. fehlender Switch).
- F: Wie zeigt man unterstützte Konfigurationsversionen an? | A: Get-VMHostSupportedVersion
- F: Welches Cmdlet exportiert eine VM? | A: Export-VM -Name <VM> -Path <Ziel>
- F: Warum vor dem Umzug zwischen Intel und AMD herunterfahren? | A: Gespeicherter Zustand ist zwischen Prozessorherstellern nicht übertragbar.
- F: Was ändert „neue ID“ nicht? | A: Computername und SID im Gastbetriebssystem.

## Quiz
? Welcher Importtyp passt für einen Umzug mit anschließendem Löschen des Originals?
* Wiederherstellen (vorhandene ID, Dateien kopieren)
- Kopieren (neue eindeutige ID erstellen)
- Direkt registrieren (Dateien am Exportort lassen)
- Kein Import, nur die VHDX-Dateien kopieren
! Die ID bleibt, die Dateien landen im neuen Speicherort.

? Welcher Parameter erzeugt beim Import eine neue VM-ID?
* -GenerateNewId
- -Register
- -VhdDestinationPath
- -VirtualMachinePath
! In Kombination mit -Copy. -Register lässt die Dateien am Ort, die Pfad-Parameter legen nur Speicherorte fest.

? Womit erkennt man einen fehlenden Switch vor dem Import?
* Compare-VM
- Test-VHD
- Get-VMSwitch -Missing
- Measure-VM
! Der Bericht kann korrigiert und an Import-VM übergeben werden.

? Seit wann kann man laufende VMs exportieren?
* Windows Server 2012 R2
- Windows Server 2008
- Windows Server 2019
- Gar nicht
! Seit 2012 R2 ist Live-Export möglich.

? Was ändert „Kopieren (neue ID)“ NICHT?
* Den Computernamen und die SID im Gast
- Die Hyper-V-VM-ID
- Den Speicherort der Dateien
- Die Registrierung auf dem Host
! Dafür braucht es Sysprep.

? Warum kann ein Import an der Version scheitern?
* Der Ziel-Host kennt die Konfigurationsversion nicht
- Die VM hat für den Ziel-Host zu wenig RAM
- Die VM verwendet eine statische IP-Adresse
- Die VM wurde als Generation 2 angelegt
! Neuere Versionen laufen nicht auf älteren Hosts.

? Welches Cmdlet zeigt unterstützte Versionen?
* Get-VMHostSupportedVersion
- Get-VMVersion -All
- Get-WindowsFeature Hyper-V
- winver
! Liste der Konfigurationsversionen des Hosts.

? Was ist nach erfolgreichem Umzug zu tun?
* Original auf dem Quell-Host entfernen
- Original parallel weiterlaufen lassen
- Prüfpunkt auf HV02 dauerhaft behalten
- MAC-Spoofing aktivieren
! Sonst entstehen doppelte Instanzen mit gleicher IP und MAC.
