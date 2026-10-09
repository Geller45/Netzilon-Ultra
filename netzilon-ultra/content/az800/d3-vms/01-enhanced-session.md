---
id: az800-enhanced-session
bereich: AZ-800
block: A7
kapitel: VMs & Container
titel: Hyper-V – Erweiterter Sitzungsmodus
stufe: Einsteiger
quellen: [AZ-800 Study Guide, Microsoft Learn]
verweise: [az800-powershell-direct, az800-integrationsdienste, az800-dda]
---

## Profi

### Basis- vs. erweiterte Sitzung
Die **VM-Verbindung** (`vmconnect.exe`) im Hyper-V-Manager zeigt die Konsole einer VM. Es gibt zwei Modi:
| | **Standard-/Basissitzung** | **Erweiterte Sitzung** (Enhanced Session Mode) |
|---|---|---|
| Technik | emulierte Grafik/Tastatur/Maus über den VMBus | **RDP über den VMBus** (kein Netzwerk nötig) |
| Auflösung | begrenzt, Fenster skaliert schlecht | **frei wählbar**, dynamische Anpassung, mehrere Monitore |
| Zwischenablage | nur **Text eingeben** („Zwischenablage → Text eingeben“) | **Text und Dateien** kopieren/einfügen |
| Laufwerke, USB, Drucker, Audio, Smartcards | nein | **lokale Ressourcen umleiten** |
| Anmeldung | über VM-Konsole | über RDP-Anmeldung (auch **Windows Hello/Smartcard**) |
| Netzwerk in der VM | egal | **nicht nötig** – funktioniert auch ohne vNIC |
| Vor dem Booten / BIOS / Setup | ja (einziger Weg vor dem Start des Gasts) | nein – erst nach der Anmeldung verfügbar |

### Voraussetzungen
1. **Host**: Hyper-V-Einstellungen → **Server** → „Richtlinie für den erweiterten Sitzungsmodus“ → **Erweiterten Sitzungsmodus zulassen** (auf **Windows Server standardmäßig AUS**, auf Windows 10/11 Client-Hyper-V standardmäßig an).
2. **Benutzer**: Hyper-V-Einstellungen → **Benutzer** → „Erweiterter Sitzungsmodus“ → **verwenden** (pro Benutzer).
3. **Gastbetriebssystem**: muss **Remotedesktopdienste** unterstützen – Windows 8.1/Server 2012 R2 und neuer; Windows **Home** nicht als Gast; Linux nur mit xrdp-Konfiguration (Ubuntu-„Quick Create“-Images).
4. Im Gast muss **Remotedesktop-Dienst** laufen; der Benutzer muss sich per RDP anmelden dürfen (Gruppe **Remotedesktopbenutzer** oder Admin). Die Netzwerkeinstellung „Remotedesktop zulassen“ ist nicht zwingend, der RDP-Dienst schon.
5. Integrationsdienst **Gastdienste** hilft beim Dateikopieren; generell VMBus/Integrationsdienste aktiv.

### Bedienung
- Beim Verbinden erscheint der Dialog **„Anzeigekonfiguration/Lokale Ressourcen“** (Auflösung, alle Monitore, Laufwerke, Drucker, Audio).
- Umschalten per **Symbolleiste** („Erweiterte Sitzung“) bzw. **Ansicht → Erweiterte Sitzung**.
- Wenn der erweiterte Modus scheitert (z. B. Gast noch in Installation), fällt die Verbindung auf die Basissitzung zurück.

### Abgrenzung zu anderen Wegen
| Weg | Netzwerk nötig | Einsatz |
|---|---|---|
| Basissitzung | nein | Setup, BIOS, Troubleshooting |
| Erweiterte Sitzung | nein | Arbeit mit GUI, Dateien kopieren |
| **PowerShell Direct** | nein (nur Host ↔ Gast) | Automatisierung, Befehle |
| RDP/WAC über Netzwerk | ja | Remoteverwaltung von überall |
| **Dateien kopieren** mit `Copy-VMFile` | nein | Datei auf Gast schieben (Gastdienste nötig) |

### Hinweis Azure
Azure-VMs haben **keine Hyper-V-Konsole**; dort nutzt man **RDP/Bastion**, **serielle Konsole**, **Run Command**. Enhanced Session betrifft nur lokales Hyper-V.

## Lab
**Maschinen**: Hyper-V-**Host** (Windows Server), VM **CL01** (Windows 11 Pro/Enterprise), VM **SRV01**.

### GUI
1. **Host**: Hyper-V-Manager → rechts **Hyper-V-Einstellungen** → **Server: Richtlinie für den erweiterten Sitzungsmodus** → Haken „**Erweiterten Sitzungsmodus zulassen**“.
2. **Benutzer: Erweiterter Sitzungsmodus** → Haken „**Erweiterten Sitzungsmodus verwenden**“ → OK.
3. **CL01** starten → **Verbinden** → Dialog: Auflösung 1920×1080 bzw. „Alle Monitore“, **Weitere Optionen** → Lokale Ressourcen → Laufwerke (C: des Hosts) → Verbinden.
4. **CL01**: Datei vom Host-Desktop per **Strg+C / Strg+V** in die VM kopieren; im Explorer erscheint das umgeleitete Host-Laufwerk.
5. Symbolleiste → Symbol **Erweiterte Sitzung** ausschalten → Basissitzung (nur Konsole) → wieder einschalten.
6. **SRV01** (Server Core): Erweiterte Sitzung klappt nur, wenn RDP-Dienst läuft – ggf. `sconfig` → Remotedesktop aktivieren.
7. Alternativ Datei ohne Sitzung kopieren: **Host**-PowerShell (siehe unten).

### PowerShell
```powershell
# Auf dem Hyper-V-Host
Set-VMHost -EnableEnhancedSessionMode $true
Get-VMHost | Select-Object EnableEnhancedSessionMode

# Gastdienste aktivieren und Datei in die VM kopieren
Enable-VMIntegrationService -VMName CL01 -Name "Gastdienstschnittstelle"   # englisch: "Guest Service Interface"
Copy-VMFile -Name CL01 -SourcePath C:\ISO\tools.zip -DestinationPath C:\Temp\tools.zip -FileSource Host -CreateFullPath

# VM-Verbindung direkt öffnen
vmconnect.exe localhost CL01

# Im Gast (CL01) prüfen, ob RDP-Dienst läuft
Get-Service TermService
```

## Einfach

Wenn du eine virtuelle Maschine im Hyper-V-Manager öffnest, siehst du ihren Bildschirm in einem kleinen Fenster. Das gibt es in **zwei Varianten**:

- **Basissitzung** = wie durch ein **kleines Guckloch** schauen: Du siehst den Bildschirm und kannst tippen – aber die Auflösung ist klein, und **Kopieren und Einfügen** von Dateien zwischen deinem PC und der VM geht nicht. Dafür funktioniert sie **immer**, auch beim Starten und bei der Installation.

- **Erweiterte Sitzung** = wie eine **große Glastür**: Die VM fühlt sich an wie ein richtiger Computer. Du kannst die Bildschirmgröße frei wählen, **Dateien einfach hin- und herkopieren**, deine Laufwerke, Drucker und den Ton durchreichen. Technisch ist das eine **Remotedesktop-Verbindung** – aber ohne Netzwerkkabel, direkt durch die „Wand“ zwischen Host und VM (den VMBus).

**Damit die Glastür funktioniert**:
1. Auf dem Server-Host muss sie **erlaubt** sein (bei Windows Server ist sie standardmäßig aus!).
2. Du musst sie **für dich einschalten**.
3. In der VM muss ein Windows laufen, das Remotedesktop kann (nicht Home-Edition).

## Merksatz
- Erweiterte Sitzung = **RDP über VMBus**, **kein Netzwerk** nötig.
- **Zwei Schalter**: Server-Richtlinie **zulassen** + Benutzer **verwenden**.
- Auf **Windows Server standardmäßig aus**.
- Dateien, Laufwerke, Drucker, Audio, beliebige Auflösung.
- Für **Setup/BIOS** nur die **Basissitzung**.

## Prüfungsfalle
- Erweiterter Sitzungsmodus braucht keine Netzwerkverbindung der VM.
- Windows Home als Gast unterstützt ihn nicht (kein RDP-Host).
- Server-Einstellung und Benutzereinstellung sind getrennt.
- Vor der Anmeldung/während der Installation nur Basissitzung.
- Copy-VMFile benötigt den Integrationsdienst „Gastdienstschnittstelle“.

## Grafik
### Guckloch vs. Glastür
Links eine VM hinter einer Wand mit kleinem Guckloch (Basissitzung, nur Text-Zwischenablage), rechts dieselbe VM hinter einer großen Glastür mit Dateien, Druckern und Lautsprecher, die hindurchgereicht werden; darunter der VMBus als Tunnel ohne Netzwerkkabel.

### Zwei Schalter
Hyper-V-Einstellungen mit Server-Schalter und Benutzer-Schalter; nur wenn beide grün sind, öffnet sich die Glastür.

## Karteikarten
- F: Was ist der erweiterte Sitzungsmodus? | A: VM-Verbindung per RDP über den VMBus – mit Zwischenablage für Dateien, lokalen Ressourcen und freier Auflösung.
- F: Braucht die VM dafür Netzwerk? | A: Nein, die Verbindung läuft über den VMBus.
- F: Welche zwei Einstellungen sind auf dem Host nötig? | A: Server-Richtlinie „Erweiterten Sitzungsmodus zulassen“ und Benutzereinstellung „verwenden“.
- F: Ist der Modus auf Windows Server standardmäßig aktiv? | A: Nein (auf Windows-Client-Hyper-V schon).
- F: Wann muss man die Basissitzung verwenden? | A: Vor der Anmeldung, beim Booten/BIOS/Setup oder wenn der Gast kein RDP unterstützt.
- F: PowerShell zum Aktivieren? | A: Set-VMHost -EnableEnhancedSessionMode $true
- F: Wie kopiert man eine Datei ohne Sitzung in eine VM? | A: Copy-VMFile (Integrationsdienst Gastdienstschnittstelle).
- F: Welche Gäste unterstützen den Modus? | A: Windows 8.1/Server 2012 R2 und neuer mit RDP-Dienst (nicht Home); Linux mit xrdp.

## Quiz
? Ein Admin kann auf einem Hyper-V-Server keine Dateien per Kopieren/Einfügen in eine VM übertragen. Was fehlt am wahrscheinlichsten?
* Der erweiterte Sitzungsmodus ist in den Hyper-V-Einstellungen nicht zugelassen
- Die VM hat zu wenig RAM
- Die VM ist Generation 2
- DHCP ist aus

? Welche Technik verwendet der erweiterte Sitzungsmodus?
* RDP über den VMBus
- VNC über das Netzwerk
- SSH
- SMB-Freigaben

? Welcher Gast unterstützt den erweiterten Sitzungsmodus NICHT?
* Windows 11 Home
- Windows 11 Pro
- Windows Server 2022
- Windows Server 2025

? Welches Cmdlet aktiviert den Modus serverweit?
* Set-VMHost -EnableEnhancedSessionMode $true
- Enable-VMIntegrationService
- Set-VM -Enhanced
- Enable-PSRemoting

? Wann ist die Basissitzung zwingend nötig?
* Während der Installation des Gastbetriebssystems
- Beim Kopieren von Dateien
- Bei Mehrfachmonitoren
- Beim Drucken aus der VM
