---
id: server-hvsz-24
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 24 – Erweiterte Sitzung und Zwischenablage funktionieren nicht
stufe: Einsteiger
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-enhanced-session, az800-powershell-direct, server-hvsz-25]
---

## Profi

### Ticket
**Kunde meldet:** „In der VM-Verbindung kann ich nichts per Strg+C/Strg+V zwischen meinem Rechner und der VM kopieren. Die Auflösung ist winzig, und das Symbol ‚Erweiterte Sitzung‘ ist ausgegraut.“
- Datum/Priorität: 03.10.2026, **Priorität 4 (niedrig)** – Komfort, aber Admins verlieren Zeit.
- Betroffene Maschinen: Host **HV01.example.com**, VM **CL01** (Windows 11 Pro).

### Ausgangslage
- HV01: Windows Server 2025, Administratoren arbeiten per RDP auf HV01 und öffnen dort den Hyper-V-Manager.
- CL01: Gen 2, Windows 11 Pro, Domänenmitglied, IP 192.168.10.101.
- In der VM-Verbindung läuft die **Basissitzung**: nur „Zwischenablage → Text eingeben“ möglich.

### Analyse
Die **erweiterte Sitzung** (*Enhanced Session Mode*) ist eine **RDP-Verbindung über den VMBus** – ohne Netzwerk. Erst damit gibt es Zwischenablage für Text und Dateien, Laufwerksumleitung, freie Auflösung.

| Hypothese | Prüfung |
|---|---|
| **Server-Richtlinie** auf dem Host aus (auf Windows Server **standardmäßig deaktiviert**) | `Get-VMHost \| Select EnableEnhancedSessionMode` |
| **Benutzereinstellung** „Erweiterten Sitzungsmodus verwenden“ aus | Hyper-V-Einstellungen → Benutzer |
| Gast unterstützt RDP nicht (z. B. Windows **Home**) | Edition im Gast |
| RDP-Dienst im Gast gestoppt | `Get-Service TermService` in CL01 |
| Benutzer darf sich nicht per RDP anmelden | Gruppe *Remotedesktopbenutzer*/Administratoren |
| Windows 11: Option „Nur Windows Hello-Anmeldung zulassen“ aktiv | Einstellungen → Konten → Anmeldeoptionen |
| Zwischenablage-Umleitung per Richtlinie im Gast verboten | GPO *Umleitung der Zwischenablage nicht zulassen* |
| Zwischenablage im Verbindungsdialog abgewählt | Dialog „Lokale Ressourcen“ |

**Befund:** `EnableEnhancedSessionMode = False` auf HV01.

### Lösungsweg
1. **Server-Richtlinie aktivieren**: Hyper-V-Einstellungen → Server → *Richtlinie für den erweiterten Sitzungsmodus* → *Zulassen* bzw. `Set-VMHost -EnableEnhancedSessionMode $true` – Begründung: Auf Windows Server ist die Funktion standardmäßig aus.
2. **Benutzereinstellung** prüfen: Hyper-V-Einstellungen → Benutzer → *Erweiterter Sitzungsmodus* → *verwenden* – Begründung: pro Benutzer separat.
3. **Gast prüfen**: Remotedesktopdienst läuft, Benutzer berechtigt, bei Windows 11 ggf. „Nur Windows Hello-Anmeldung …“ deaktivieren – Begründung: Die erweiterte Sitzung ist eine RDP-Anmeldung.
4. **Verbindung neu öffnen** → Dialog *Anzeigekonfiguration* → *Lokale Ressourcen* → **Zwischenablage** angehakt, ggf. Laufwerke – Begründung: Zwischenablage ist eine Umleitungsoption.
5. Falls weiterhin keine Zwischenablage: Richtlinie im Gast „Umleitung der Zwischenablage nicht zulassen“ prüfen.

### Ergebnis prüfen
- Symbol **Erweiterte Sitzung** in der Symbolleiste aktiv, Auflösung wählbar.
- Text und Dateien lassen sich per Strg+C/Strg+V zwischen Host und CL01 kopieren.
- `Get-VMHost | Select EnableEnhancedSessionMode` → **True**.

### Vorbeugung
- Einstellung per Host-Bereitstellungsskript setzen.
- Für Server Core oder Automatisierung **PowerShell Direct** bzw. `Copy-VMFile` nutzen.
- Sicherheitsabwägung: Erweiterte Sitzung erlaubt Datei-/Laufwerksumleitung – in Hochsicherheitsumgebungen bewusst einschränken.

## Einfach

Die normale **VM-Verbindung** ist wie ein **Fenster mit dicker Glasscheibe**: Du siehst die VM und kannst tippen, aber du kannst **nichts durchreichen** – keine Bilder, keine Texte, keine Dateien.

Die **erweiterte Sitzung** ist wie eine **Durchreiche** in diesem Fenster. Dann kannst du Sachen hin- und herschieben (Zwischenablage), das Fenster größer machen (Auflösung) und sogar deinen eigenen Rucksack (Laufwerke) mit reinnehmen.

Damit die Durchreiche aufgeht, müssen **drei Leute** „Ja“ sagen:
1. Der **Hausmeister** (die Server-Einstellung auf HV01) – auf Windows Server sagt er zuerst immer „Nein“.
2. **Du selbst** (die Benutzereinstellung).
3. Die **VM** (sie muss Remotedesktop können und dich reinlassen). Windows Home kann das nicht.

Und wenn die Durchreiche offen ist, aber trotzdem nichts durchkommt, hat vielleicht jemand ein **Schild „Zwischenablage verboten“** aufgehängt (Gruppenrichtlinie) – oder du hast beim Verbinden den Haken bei „Zwischenablage“ weggenommen.

## Merksatz
- Erweiterte Sitzung = **RDP über VMBus**, kein Netzwerk nötig.
- Windows Server: **standardmäßig aus** → `Set-VMHost -EnableEnhancedSessionMode $true`.
- Server-Richtlinie **und** Benutzereinstellung **und** RDP-fähiger Gast.
- Zwischenablage = Option unter **Lokale Ressourcen**.

## Prüfungsfalle
- Auf **Windows 10/11 (Client-Hyper-V)** ist der Modus standardmäßig **an**, auf **Windows Server aus**.
- Die erweiterte Sitzung braucht **kein** Netzwerk und **keine** Firewallregel im Gast – aber den **RDP-Dienst**.
- Windows **Home** als Gast unterstützt keine erweiterte Sitzung.
- Vor dem Booten/Setup gibt es nur die **Basissitzung**.

## Grafik
### Drei Ja für die Durchreiche
1. Admin -> HV01: VM-Verbindung zu CL01 öffnen
2. HV01: Server-Richtlinie aus – nur Basissitzung
3. Admin -> HV01: Set-VMHost EnableEnhancedSessionMode true
4. HV01 -> CL01: RDP-Anmeldung über den VMBus
5. CL01: RDP-Dienst läuft, Benutzer berechtigt
6. HV01 -> CL01: Zwischenablage und Laufwerke umgeleitet
7. Admin: Strg+C und Strg+V funktionieren

## Lab
**Maschinen**: Host **HV01.example.com** (Windows Server), VM **CL01** (Windows 11 Pro/Enterprise).
Nachstellen: Zuerst den Fehler bewusst erzeugen, dann beheben.

### GUI
1. **HV01**: Hyper-V-Manager → **Hyper-V-Einstellungen** → **Server: Richtlinie für den erweiterten Sitzungsmodus** → Haken **entfernen** → OK (Fehlerzustand).
2. **HV01**: CL01 → **Verbinden** → nur Basissitzung, Symbol „Erweiterte Sitzung“ ausgegraut; Strg+V von Host-Text funktioniert nicht.
3. **HV01**: Hyper-V-Einstellungen → **Server: Richtlinie für den erweiterten Sitzungsmodus** → **Erweiterten Sitzungsmodus zulassen** → **Benutzer: Erweiterter Sitzungsmodus** → **verwenden** → OK.
4. **CL01**: Einstellungen → Konten → **Anmeldeoptionen** → „Zur Verbesserung der Sicherheit nur Windows Hello-Anmeldung … zulassen“ → **Aus** (falls aktiv).
5. **HV01**: VM-Verbindung schließen → CL01 → **Verbinden** → Dialog **Anzeigekonfiguration** → **Optionen anzeigen** → **Lokale Ressourcen** → **Zwischenablage** angehakt → **Weitere** → Laufwerk C: → Verbinden.
6. **CL01**: Datei vom Host-Desktop per Strg+C/Strg+V in den Ordner Dokumente kopieren.
7. **HV01**: Symbolleiste → **Erweiterte Sitzung** aus- und wieder einschalten, Unterschied beobachten.

### PowerShell
1. **HV01**: Fehler erzeugen und prüfen.
2. **HV01**: Richtlinie aktivieren.
3. **CL01** (per PowerShell Direct): RDP-Dienst prüfen.

```powershell
# Auf HV01 – Fehler erzeugen
Set-VMHost -EnableEnhancedSessionMode $false
Get-VMHost | Select-Object EnableEnhancedSessionMode

# Auf HV01 – Beheben
Set-VMHost -EnableEnhancedSessionMode $true
Get-VMHost | Select-Object EnableEnhancedSessionMode

# In CL01 – per PowerShell Direct prüfen
Invoke-Command -VMName CL01 -Credential (Get-Credential) -ScriptBlock {
  Get-Service TermService | Select-Object Name, Status, StartType
  Get-LocalGroupMember -Group "Remotedesktopbenutzer" -ErrorAction SilentlyContinue
  (Get-CimInstance Win32_OperatingSystem).Caption
}

# Auf HV01 – Alternative ohne Sitzung: Datei kopieren (Gastdienste nötig)
Enable-VMIntegrationService -VMName CL01 -Name "Gastdienstschnittstelle"   # engl. "Guest Service Interface"
Copy-VMFile -Name CL01 -SourcePath C:\Tools\tool.zip -DestinationPath C:\Temp\tool.zip -FileSource Host -CreateFullPath
vmconnect.exe localhost CL01
```

## Szenario
### Kontrollfragen
Auf HV01 (Windows Server 2025) zeigt die VM-Verbindung zu CL01 nur die Basissitzung; die Zwischenablage funktioniert nicht.
- F: Welche Host-Einstellung ist auf Windows Server standardmäßig aus? | A: Die Server-Richtlinie für den erweiterten Sitzungsmodus (Set-VMHost -EnableEnhancedSessionMode $true).
- F: Welche drei Ebenen müssen stimmen? | A: Server-Richtlinie auf dem Host, Benutzereinstellung im Hyper-V-Manager, RDP-fähiger Gast mit laufendem Remotedesktopdienst und berechtigtem Benutzer.
- F: Braucht die erweiterte Sitzung Netzwerk in der VM? | A: Nein, sie läuft als RDP über den VMBus.
- F: Wo wird die Zwischenablage beim Verbinden ausgewählt? | A: Im Dialog Anzeigekonfiguration → Lokale Ressourcen → Zwischenablage.
- F: Welche Gast-Edition unterstützt keine erweiterte Sitzung? | A: Windows Home.

## Reihenfolge
### Erweiterte Sitzung aktivieren
1. Server-Richtlinie auf dem Host aktivieren
2. Benutzereinstellung „verwenden“ setzen
3. RDP-Dienst und Berechtigung im Gast prüfen
4. Windows-Hello-only-Option im Gast deaktivieren
5. VM-Verbindung neu öffnen und Zwischenablage auswählen
6. Kopieren testen

## Legende
### Erweiterter Sitzungsmodus (Enhanced Session Mode)
- Was: VM-Verbindung per RDP über den VMBus mit Zwischenablage, Laufwerks-/Geräteumleitung und freier Auflösung.
- Wie: Hyper-V-Einstellungen (Server + Benutzer) bzw. `Set-VMHost -EnableEnhancedSessionMode $true`; Gast mit RDP-Unterstützung.
- Wann: für komfortable GUI-Arbeit in Windows-VMs, auch ohne Netzwerk in der VM.
- Wo: Einstellung auf HV01, Nutzung im VM-Verbindungsfenster (vmconnect).
- Warum: spart Zeit beim Kopieren und Arbeiten, ohne RDP-Freigaben über das Netzwerk zu öffnen.

## Karteikarten
- F: Was ist die erweiterte Sitzung technisch? | A: Eine RDP-Verbindung über den VMBus.
- F: Ist der Modus auf Windows Server standardmäßig aktiv? | A: Nein, er muss auf dem Host zugelassen werden.
- F: Cmdlet zum Aktivieren? | A: Set-VMHost -EnableEnhancedSessionMode $true
- F: Welche Benutzereinstellung gehört dazu? | A: Hyper-V-Einstellungen → Benutzer → Erweiterten Sitzungsmodus verwenden.
- F: Welcher Dienst muss im Gast laufen? | A: Remotedesktopdienste (TermService).
- F: Welche Windows-11-Option kann die Anmeldung verhindern? | A: „Nur Windows Hello-Anmeldung … zulassen“.
- F: Wo aktiviert man die Zwischenablage für die Sitzung? | A: Anzeigekonfiguration → Lokale Ressourcen → Zwischenablage.
- F: Welche Richtlinie im Gast verbietet die Zwischenablage? | A: „Umleitung der Zwischenablage nicht zulassen“ (Remotedesktopdienste → Geräte- und Ressourcenumleitung).
- F: Wie kopiert man ohne Sitzung eine Datei in die VM? | A: Copy-VMFile mit aktivierter Gastdienstschnittstelle.

## Quiz
? Auf Windows Server ist die erweiterte Sitzung nicht verfügbar. Was fehlt zuerst?
* Set-VMHost -EnableEnhancedSessionMode $true
- Set-VMProcessor -ExposeVirtualizationExtensions $true
- Enable-PSRemoting im Gast
- Eine Firewallregel für Port 3389 im Gast
! Auf Windows Server ist die Richtlinie standardmäßig aus.

? Welche Technik nutzt die erweiterte Sitzung?
* RDP über den VMBus
- VNC über das LAN
- SSH über Port 22
- PowerShell Direct
! Ein Netzwerk in der VM ist nicht nötig.

? Welcher Gast unterstützt KEINE erweiterte Sitzung?
* Windows 11 Home
- Windows 11 Pro
- Windows Server 2022
- Windows 11 Enterprise
! Home hat keinen Remotedesktop-Host.

? Wo wird die Zwischenablage-Umleitung beim Verbinden gewählt?
* Lokale Ressourcen im Dialog Anzeigekonfiguration
- VM-Einstellungen → Firmware
- Manager für virtuelle Switches
- Hyper-V-Einstellungen → NUMA
! Sie ist eine RDP-Umleitungsoption.

? Welcher Dienst muss im Gast laufen?
* Remotedesktopdienste (TermService)
- Hyper-V-Taktdienst allein
- DHCP-Client
- Windows Update
! Die erweiterte Sitzung ist eine RDP-Anmeldung.

? Wann ist nur die Basissitzung möglich?
* Vor dem Booten bzw. während des Setups
- Immer bei Gen-2-VMs
- Nur bei Domänenmitgliedern
- Bei aktivem Secure Boot
! Die erweiterte Sitzung braucht ein angemeldetes Gast-OS mit RDP.

? Auf welcher Plattform ist der Modus standardmäßig an?
* Windows 11 mit Client-Hyper-V
- Windows Server 2025
- Windows Server 2022
- Hyper-V Server 2019
! Auf Windows Server muss er zugelassen werden.

? Wie kopiert man ohne erweiterte Sitzung eine Datei vom Host in die VM?
* Copy-VMFile mit Gastdienstschnittstelle
- Set-VMHost -CopyFile
- Move-VMStorage
- Export-VM
! Copy-VMFile nutzt die Integrationsdienste.
