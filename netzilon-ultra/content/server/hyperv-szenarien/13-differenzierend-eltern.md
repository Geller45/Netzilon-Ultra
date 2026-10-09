---
id: server-hvsz-13
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 13 – Differenzierende Festplatte: Elterndatenträger verschoben
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-vhdx, az800-pruefpunkte, server-hvsz-07, server-hvsz-12]
---

## Profi

### Ticket
**Kunde meldet:** „Ich habe am Wochenende den Ordner mit den Basis-Images von D:\Vorlagen nach E:\Vorlagen verschoben, weil D: voll war. Jetzt starten alle Schulungs-VMs nicht mehr.“
- Datum/Priorität: 05.10.2026, **Priorität 2 (hoch)** – Schulung beginnt um 9 Uhr.
- Betroffene Maschinen: VMs **KURS01** bis **KURS10** auf **HV01.example.com**.
- Meldung (sinngemäß): *„Fehler beim Starten … Die Kette der virtuellen Festplatten ist unterbrochen. Das System kann die angegebene Datei nicht finden.“*

### Ausgangslage
- Host **HV01.example.com**, Server 2025.
- Basis-Image `Win11-Basis.vhdx` (Elterndatenträger, schreibgeschützt behandelt) lag unter `D:\Vorlagen\`, jetzt `E:\Vorlagen\`.
- Jede Schulungs-VM hat eine **differenzierende** VHDX (`D:\VMs\KURS01\KURS01.vhdx`), deren **ParentPath** auf `D:\Vorlagen\Win11-Basis.vhdx` zeigt.

### Analyse
Eine **differenzierende Festplatte** speichert nur Änderungen gegenüber dem **Elterndatenträger**. Im Kopf der Kind-Datei steht der **absolute Pfad** zum Elternteil (plus eine eindeutige ID). Wird das Elternteil verschoben, findet Hyper-V die Kette nicht mehr.

| Hypothese | Prüfung |
|---|---|
| ParentPath zeigt auf alten Ort | `Get-VHD D:\VMs\KURS01\KURS01.vhdx \| Select ParentPath` |
| Elterndatei wurde verändert (ID passt nicht mehr) | `Test-VHD`, Fehlermeldung „ID stimmt nicht überein“ |
| Berechtigungen am neuen Ort fehlen | Ereignis „Zugriff verweigert“ (0x80070005) im Hyper-V-VMMS-Protokoll |
| Elterndatei beschädigt | `Test-VHD -Path E:\Vorlagen\Win11-Basis.vhdx` |

**Befund:** ParentPath = `D:\Vorlagen\Win11-Basis.vhdx` (existiert nicht mehr).

### Lösungsweg
1. **Elterndatei nicht verändern** – Begründung: Würde man sie starten oder bearbeiten, wären **alle** Kinder unbrauchbar.
2. **Datenträger überprüfen** im Hyper-V-Manager (Aktionen → *Datenträger überprüfen* → Kind-VHDX) – Begründung: Hyper-V erkennt die fehlende Elterndatei und bietet **Erneut verbinden** an.
3. **Neuen Elternpfad setzen**: GUI „Erneut verbinden“ oder `Set-VHD -Path <Kind> -ParentPath E:\Vorlagen\Win11-Basis.vhdx` – Begründung: Schreibt den neuen Pfad in den Kopf der Kind-Datei.
4. **Für alle 10 VMs** per Schleife wiederholen.
5. `-IgnoreIdMismatch` **nur**, wenn sicher ist, dass die Elterndatei inhaltlich identisch ist – Begründung: Ein falsches Elternteil führt zu Datenbeschädigung.
6. Bei „Zugriff verweigert“: Datenträger über den Hyper-V-Manager neu anhängen, damit Hyper-V die Berechtigungen der VM setzt.

### Ergebnis prüfen
- `Get-VHD` aller Kinder zeigt den neuen **ParentPath**; `Test-VHD` liefert **True**.
- KURS01–KURS10 starten.

### Vorbeugung
- Elterndatenträger **schreibgeschützt** setzen (Dateiattribut) und **nicht verschieben**.
- Wenn Verschieben nötig: VMs aus, Elternteil verschieben, sofort `Set-VHD -ParentPath` für alle Kinder.
- Alternativ Speicher einer VM mit **Move-VMStorage** bzw. „Verschieben“ umziehen – Hyper-V passt die Kette selbst an.
- Bei Produktion besser **eigenständige** VHDX statt differenzierender Datenträger.

## Einfach

Stell dir ein **Malbuch** vor (das Basis-Image). Damit nicht jedes Kind ein eigenes Buch braucht, bekommt jedes Kind eine **durchsichtige Folie** (die differenzierende Festplatte), die es aufs Malbuch legt und darauf malt. Auf jeder Folie steht oben: „Gehört zum Malbuch im **Regal D**.“

Jetzt hat jemand das Malbuch ins **Regal E** gestellt. Die Kinder suchen in Regal D – nichts da! Ohne Malbuch sind die Folien nur bunte Striche ohne Bild. Die VMs starten nicht.

Die Lösung: Auf **jede Folie** den neuen Platz schreiben: „Malbuch jetzt in **Regal E**.“ Das macht Hyper-V mit „**Erneut verbinden**“ oder `Set-VHD -ParentPath`.

Ganz wichtig: Niemals ins **Malbuch selbst** malen! Sonst passen alle Folien nicht mehr.

## Merksatz
- Kind-VHDX speichert den **Pfad** zum Elternteil.
- Elternteil verschoben → `Set-VHD -ParentPath` bzw. **Erneut verbinden**.
- Elternteil **nie ändern** – sonst sind alle Kinder kaputt.

## Prüfungsfalle
- `Set-VHD -ParentPath` wird auf die **Kind**-Datei angewendet, nicht auf das Elternteil.
- `-IgnoreIdMismatch` ist kein Standardschalter – nur bei garantiert identischem Elternteil.
- Prüfpunkt-AVHDX sind ebenfalls differenzierende Datenträger – die Kette nie manuell umbauen, wenn Hyper-V sie verwaltet.
- Verschieben per **Move-VMStorage** passt Pfade automatisch an, Verschieben im Explorer nicht.

## Grafik
### Folie sucht Malbuch
1. KURS01 -> HV01: Start, Kind-VHDX öffnen
2. HV01: ParentPath D Vorlagen nicht gefunden – Kette unterbrochen
3. Admin -> HV01: Datenträger überprüfen, Erneut verbinden
4. HV01: Set-VHD schreibt ParentPath E Vorlagen in die Kind-VHDX
5. HV01 -> KURS01: Kette vollständig, VM startet

## Lab
**Maschinen**: Host **HV01.example.com**, Basis-Image `Win11-Basis.vhdx`, VMs **KURS01** und **KURS02** mit differenzierenden Datenträgern.
Nachstellen: Zuerst den Fehler bewusst erzeugen, dann beheben.

### GUI
1. **HV01**: Hyper-V-Manager → Neu → **Festplatte** → VHDX → **Differenzierend** → Name `KURS01.vhdx` → Elternteil `D:\Vorlagen\Win11-Basis.vhdx` → Fertig stellen; VM KURS01 damit anlegen und starten, dann ausschalten.
2. **HV01**: Explorer → `D:\Vorlagen\Win11-Basis.vhdx` nach `E:\Vorlagen\` **verschieben** (Fehlerzustand).
3. **HV01**: Hyper-V-Manager → KURS01 → Starten → Fehlermeldung zur unterbrochenen Kette.
4. **HV01**: Hyper-V-Manager → Aktionen → **Datenträger überprüfen** → `D:\VMs\KURS01\KURS01.vhdx` → Meldung „Elterndatenträger nicht gefunden“ → **Erneut verbinden**.
5. **HV01**: Assistent → neuen Elternpfad `E:\Vorlagen\Win11-Basis.vhdx` → Fertig stellen.
6. **HV01**: KURS01 → Starten → läuft.
7. **HV01**: Explorer → Eigenschaften von `Win11-Basis.vhdx` → **Schreibgeschützt** setzen.

### PowerShell
1. **HV01**: Kette aufbauen und Fehler erzeugen.
2. **HV01**: Ursache prüfen.
3. **HV01**: Pfad für alle Kinder korrigieren.

```powershell
# Auf HV01 – Kette aufbauen
New-VHD -Path D:\VMs\KURS01\KURS01.vhdx -ParentPath D:\Vorlagen\Win11-Basis.vhdx -Differencing
New-VM -Name KURS01 -Generation 2 -MemoryStartupBytes 4GB -VHDPath D:\VMs\KURS01\KURS01.vhdx

# Auf HV01 – Fehler erzeugen
Move-Item D:\Vorlagen\Win11-Basis.vhdx E:\Vorlagen\
Start-VM -Name KURS01            # Kette unterbrochen

# Auf HV01 – Ursache prüfen
Get-VHD -Path D:\VMs\KURS01\KURS01.vhdx | Select-Object Path, VhdType, ParentPath
Test-VHD -Path D:\VMs\KURS01\KURS01.vhdx

# Auf HV01 – für alle Kurs-VMs korrigieren
Get-ChildItem D:\VMs\KURS*\KURS*.vhdx | ForEach-Object {
  Set-VHD -Path $_.FullName -ParentPath E:\Vorlagen\Win11-Basis.vhdx
}
Get-ChildItem D:\VMs\KURS*\KURS*.vhdx | ForEach-Object { Test-VHD -Path $_.FullName }
Set-ItemProperty -Path E:\Vorlagen\Win11-Basis.vhdx -Name IsReadOnly -Value $true
Start-VM -Name KURS01
```

## Szenario
### Kontrollfragen
Das Basis-Image der Schulungs-VMs wurde von D:\Vorlagen nach E:\Vorlagen verschoben; keine VM startet mehr.
- F: Warum startet KURS01 nicht? | A: Die differenzierende VHDX speichert den absoluten Pfad zum Elterndatenträger; dieser Pfad existiert nicht mehr.
- F: Wie zeigt man den gespeicherten Elternpfad an? | A: Get-VHD -Path <Kind.vhdx> \| Select-Object ParentPath
- F: Wie setzt man den neuen Pfad? | A: Set-VHD -Path <Kind.vhdx> -ParentPath E:\Vorlagen\Win11-Basis.vhdx oder Datenträger überprüfen → Erneut verbinden.
- F: Warum darf das Basis-Image nicht verändert werden? | A: Alle Kinder beziehen sich auf seinen Inhalt; jede Änderung macht die Kinder unbrauchbar.
- F: Wann ist -IgnoreIdMismatch vertretbar? | A: Nur wenn sicher ist, dass das neue Elternteil inhaltlich identisch ist; sonst droht Datenbeschädigung.

## Reihenfolge
### Unterbrochene Kette reparieren
1. Fehlermeldung beim Start lesen
2. ParentPath der Kind-VHDX anzeigen
3. Neuen Ort des Elterndatenträgers ermitteln
4. ParentPath mit Set-VHD oder Erneut verbinden korrigieren
5. Kette mit Test-VHD prüfen
6. VMs starten und Elternteil schreibschützen

## Legende
### Differenzierende Festplatte
- Was: VHDX, die nur Änderungen gegenüber einem Elterndatenträger speichert.
- Wie: `New-VHD -Differencing -ParentPath <Eltern>`; Pfad ändern mit `Set-VHD -ParentPath`.
- Wann: für Schulungs-/Test-VMs aus einem gemeinsamen Basis-Image, intern auch bei Prüfpunkten (.avhdx).
- Wo: Kind-Datei im VM-Ordner auf HV01, Elternteil zentral (z. B. E:\Vorlagen).
- Warum: spart Speicher und Bereitstellungszeit, weil viele VMs ein Basis-Image teilen.

## Karteikarten
- F: Was speichert eine differenzierende VHDX? | A: Nur die Änderungen gegenüber dem Elterndatenträger.
- F: Was steht im Kopf der Kind-Datei? | A: Pfad und ID des Elterndatenträgers.
- F: Welche Meldung erscheint bei verschobenem Elternteil? | A: Die Kette der virtuellen Festplatten ist unterbrochen / Datei nicht gefunden.
- F: Cmdlet zum Anzeigen des Elternpfads? | A: Get-VHD (Eigenschaft ParentPath).
- F: Cmdlet zum Ändern des Elternpfads? | A: Set-VHD -Path <Kind> -ParentPath <neuer Pfad>
- F: GUI-Weg zum Reparieren? | A: Hyper-V-Manager → Datenträger überprüfen → Erneut verbinden.
- F: Wie prüft man die Kette? | A: Test-VHD -Path <Kind>
- F: Wie schützt man das Basis-Image? | A: Schreibschutz-Attribut setzen und nicht verschieben oder starten.
- F: Welcher Weg verschiebt VM-Speicher ohne Kettenbruch? | A: Move-VMStorage bzw. Hyper-V-Manager → Verschieben.

## Quiz
? Was ist die Ursache, wenn nach dem Verschieben des Basis-Images keine VM startet?
* Die Kind-VHDX enthält noch den alten Elternpfad
- Die VMs haben keine MAC-Adresse
- Die Integrationsdienste fehlen
- Der vSwitch wurde gelöscht
! Der Elternpfad ist absolut im Kopf gespeichert.

? Welches Cmdlet setzt den neuen Elternpfad?
* Set-VHD -Path KURS01.vhdx -ParentPath E:\Vorlagen\Win11-Basis.vhdx
- Set-VHD -Path Win11-Basis.vhdx -ChildPath KURS01.vhdx
- Merge-VHD -Path KURS01.vhdx
- Convert-VHD -Path KURS01.vhdx -ParentPath E:\
! Geändert wird immer die Kind-Datei.

? Welche GUI-Funktion repariert die Kette?
* Datenträger überprüfen → Erneut verbinden
- Datenträger bearbeiten → Komprimieren
- VM-Einstellungen → Firmware
- Manager für virtuelle Switches
! Hyper-V fragt dabei nach dem neuen Elternteil.

? Was passiert, wenn man das Basis-Image startet und verändert?
* Alle differenzierenden Kinder werden unbrauchbar
- Die Kinder übernehmen die Änderungen sauber
- Nichts
- Hyper-V erstellt automatisch eine Kopie
! Die Kinder beziehen sich auf den exakten Inhalt des Elternteils.

? Wann ist -IgnoreIdMismatch zulässig?
* Nur bei garantiert identischem Elternteil
- Immer als Standard
- Bei jedem Start
- Wenn Secure Boot aktiv ist
! Sonst droht Datenbeschädigung.

? Wie prüft man, ob die Kette in Ordnung ist?
* Test-VHD
- Get-VMSwitch
- Repair-Volume
- Get-VMIntegrationService
! Test-VHD prüft Datei und Kette.

? Welcher Weg verschiebt VM-Dateien, ohne die Kette zu brechen?
* Move-VMStorage
- Verschieben im Explorer
- robocopy ohne Anpassung
- xcopy /s
! Hyper-V passt dabei die Pfade an.

? Welche Dateien sind technisch ebenfalls differenzierende Datenträger?
* Prüfpunkt-Dateien (.avhdx)
- ISO-Dateien
- .vmcx-Konfigurationsdateien
- .vmrs-Laufzeitdateien
! Prüfpunkte nutzen dieselbe Technik.
