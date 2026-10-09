---
id: server-hvsz-39
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 39 – Alten physischen Server virtualisieren (P2V mit Disk2vhd)
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-vhdx, az801-migration-serverrollen, server-hvsz-40, server-hvsz-38]
---

## Profi

### Ticket
**Kunde meldet:** „Unser alter Branchensoftware-Server (Hardware 9 Jahre alt) macht komische Geräusche. Die Software lässt sich nicht neu installieren – der Hersteller existiert nicht mehr. Können wir die Kiste ‚so wie sie ist‘ in Hyper-V übernehmen?“
- **Priorität:** hoch (Hardwareausfall droht)
- **Betroffene Maschine:** physischer Server **ALTSRV01** → Ziel-VM auf **HV01**

### Ausgangslage
- **ALTSRV01**: Windows Server 2016, 192.168.10.90, eine Systemplatte (C:) und eine Datenplatte (D:).
- **HV01.example.com**: Server 2025, Datenträger D: mit genug Platz, Freigabe `\\HV01\P2V$` (nur für Admins).
- Software benötigt die vorhandene Installation inkl. Lizenzdatei.

### Analyse
- **P2V** (Physical to Virtual) überführt ein bestehendes System 1:1 in eine VM.
- Werkzeug: **Disk2vhd** (Sysinternals). Es erstellt im laufenden Betrieb mit **Volumeschattenkopie (VSS)** ein Abbild der gewählten Volumes als **VHD/VHDX**.
- **Generation wählen** nach dem **Startmodus** des Quellsystems:
  - **BIOS / MBR** → **Generation 1**
  - **UEFI / GPT** → **Generation 2**
  - Ermitteln mit `msinfo32` → „BIOS-Modus“ (Legacy oder UEFI) oder `bcdedit` (winload.exe vs. winload.efi).
- Nach der Übernahme: neue (synthetische) Hardware → Hersteller-Agenten/Treiber entfernen, neue Netzwerkkarte bekommt neue Konfiguration, ggf. erneute **Aktivierung** von Windows.
- **Wichtig:** Der physische Server und die VM dürfen **nie gleichzeitig** mit demselben Namen und derselben IP im Netz sein.

### Lösungsweg
1. **Startmodus** von ALTSRV01 ermitteln (hier: BIOS/MBR → **Gen 1**). *Begründung:* Falsche Generation = VM bootet nicht.
2. Dienste der Branchensoftware **stoppen** (Konsistenz der Datenbankdateien). *Begründung:* VSS sichert zwar im Betrieb, aber eine ruhende Anwendung ist am sichersten.
3. **Disk2vhd** auf ALTSRV01 starten, Volumes C: und D: (und ggf. „Systemreserviert“) wählen, „**Use Vhdx**“ und „**Use Volume Shadow Copy**“ aktivieren, Ziel `\\HV01\P2V$\ALTSRV01.vhdx`. *Begründung:* VHDX ist robuster und größer möglich; Ziel nicht auf einem der gesicherten Volumes.
4. ALTSRV01 **herunterfahren** und vom Netz trennen. *Begründung:* Kein Namens-/IP-Konflikt.
5. Auf HV01 **neue VM** ALTSRV01 als **Generation 1** erstellen, **vorhandene VHDX** am **IDE-Controller 0** anhängen. *Begründung:* Gen 1 bootet nur von IDE.
6. VM starten, **Integrationsdienste** werden durch Windows erkannt (Server 2016 enthält sie), Netzwerkkarte neu konfigurieren (IP 192.168.10.90), Herstellertools (RAID-/Server-Agenten) **deinstallieren**. *Begründung:* Alte Hardwaretreiber stören in der VM.
7. Anwendung testen, Lizenz prüfen, ggf. Windows reaktivieren.

### Ergebnis prüfen
- VM startet ohne Bluescreen, `Get-VMIntegrationService -VMName ALTSRV01` → OK.
- Anwendung erreichbar, Benutzer-Test erfolgreich.
- `Get-VM ALTSRV01 | Select Generation` → 1.

### Vorbeugung
- Alte Software mittelfristig ablösen – P2V verlängert nur die Lebensdauer.
- Altes Betriebssystem (Server 2016) hat ein begrenztes Support-Ende → Netzsegment absichern.
- VM in die normale Sicherung aufnehmen.
- Hardware erst entsorgen, wenn die VM einige Wochen stabil läuft.

## Einfach
Stell dir vor, du hast ein **altes Lieblingsbuch**, das langsam auseinanderfällt. Neu kaufen geht nicht, der Verlag existiert nicht mehr. Was tust du? Du **scannst jede Seite** ein und hast es dann digital – genauso wie vorher, nur nicht mehr auf brüchigem Papier.

**Disk2vhd** ist so ein Scanner für Festplatten. Es macht ein **Foto** der ganzen Festplatte des alten Servers – während er noch läuft (dafür sorgt die Schattenkopie). Heraus kommt eine Datei: die **virtuelle Festplatte**.

Diese Datei steckst du in eine neue **VM**. Und plötzlich startet der alte Server – nur jetzt im Hyper-V-Host statt auf alter Hardware.

Zwei Dinge musst du beachten:
- Ein alter Server mit „altem Startsystem“ (BIOS) braucht eine **Generation-1-VM**. Ein moderner mit UEFI eine **Generation-2-VM**.
- Der echte alte Server muss **ausgeschaltet** werden. Sonst gibt es zwei Zwillinge mit gleichem Namen im Netz – und das gibt Chaos.

## Merksatz
- **P2V** = physisch → virtuell.
- **BIOS/MBR → Gen 1**, **UEFI/GPT → Gen 2**.
- Disk2vhd: **VSS + VHDX**, Ziel **nicht** auf dem Quellvolume.
- Alte Kiste **aus** – keine Zwillinge im Netz.

## Prüfungsfalle
- Eine MBR/BIOS-Platte in einer **Gen-2-VM** bootet nicht.
- Bei Gen 1 muss die Startplatte am **IDE-Controller** hängen, nicht am SCSI-Controller.
- Hersteller-Agenten und alte Treiber nach P2V entfernen, sonst Fehler/Dienstabbrüche.
- Windows kann wegen geänderter Hardware eine **erneute Aktivierung** verlangen.

## Grafik
### P2V-Ablauf
1. ALTSRV01: msinfo32 zeigt BIOS-Modus Legacy → Gen 1
2. ALTSRV01 -> HV01: Disk2vhd schreibt VHDX per VSS auf \\HV01\P2V$
3. ALTSRV01: Herunterfahren und Netzwerkkabel ziehen
4. HV01: neue Gen-1-VM mit vorhandener VHDX an IDE 0
5. HV01 -> ALTSRV01-VM: Start, Treiber und Agenten bereinigen
6. Client -> ALTSRV01-VM: Branchensoftware läuft

## Lab
**Nachstellen:** Statt eines physischen Servers dient eine Lab-VM oder ein alter PC als Quelle. Maschinen: Quelle **ALTSRV01**, Ziel **HV01**.

### GUI
1. **ALTSRV01**: `msinfo32` → Systemübersicht → **BIOS-Modus** notieren (Legacy oder UEFI).
2. **ALTSRV01**: Disk2vhd (Sysinternals) starten → Volumes C: und D: auswählen → „Use Vhdx“ und „Use Volume Shadow Copy“ angehakt → Ziel `\\HV01\P2V$\ALTSRV01.vhdx` → **Create**.
3. **ALTSRV01**: herunterfahren, vom Netz trennen.
4. **HV01**: Hyper-V-Manager → Neu → Virtueller Computer → Name ALTSRV01 → **Generation 1** (bei Legacy) → RAM 8 GB → Netzwerk „Extern“ → „**Vorhandene virtuelle Festplatte verwenden**“ → `D:\P2V\ALTSRV01.vhdx`.
5. **HV01**: VM starten → Verbinden → Anmeldung → Geräte-Manager prüfen → Netzwerkkarte konfigurieren → Herstellertools unter „Programme und Features“ entfernen.
6. **ALTSRV01-VM**: Anwendung testen.

### PowerShell
```powershell
# Auf ALTSRV01 – Startmodus ermitteln
bcdedit | Select-String "winload"          # winload.efi = UEFI, winload.exe = BIOS
Get-Disk | Select-Object Number, PartitionStyle   # MBR oder GPT

# Auf ALTSRV01 – Disk2vhd per Kommandozeile (Sysinternals)
.\disk2vhd64.exe C: D: \\HV01\P2V$\ALTSRV01.vhdx

# Auf HV01 – Gen-1-VM mit vorhandener VHDX
New-VM -Name ALTSRV01 -Generation 1 -MemoryStartupBytes 8GB -VHDPath "D:\P2V\ALTSRV01.vhdx" -SwitchName "Extern"
Set-VMProcessor -VMName ALTSRV01 -Count 2
Start-VM -Name ALTSRV01

# Auf HV01 – Kontrolle
Get-VM -Name ALTSRV01 | Select-Object Name, Generation, State
Get-VMIntegrationService -VMName ALTSRV01
```

## Reihenfolge
### P2V mit Disk2vhd
1. Startmodus BIOS oder UEFI ermitteln
2. Anwendungsdienste stoppen
3. Disk2vhd mit VSS und VHDX auf Netzziel ausführen
4. Physischen Server herunterfahren und vom Netz trennen
5. VM passender Generation mit vorhandener VHDX anlegen
6. VM starten, Netz konfigurieren, Altagenten entfernen
7. Anwendung und Lizenz testen

## Szenario
### Kontrollfragen
ALTSRV01 (Server 2016, BIOS-Modus Legacy, MBR) soll mit Disk2vhd nach HV01 übernommen werden.
- F: Welche VM-Generation brauchst du? | A: Generation 1, weil das System im BIOS-/MBR-Modus startet.
- F: Wo muss die Startplatte in der Gen-1-VM hängen? | A: Am IDE-Controller.
- F: Welche Disk2vhd-Optionen wählst du? | A: Use Vhdx und Use Volume Shadow Copy; Ziel nicht auf einem Quellvolume.
- F: Was passiert mit dem physischen Server nach dem Abbild? | A: Herunterfahren und vom Netz trennen, um Namens- und IP-Konflikte zu vermeiden.
- F: Welche Nacharbeiten fallen in der VM an? | A: Netzwerk konfigurieren, Herstellertools/Treiber entfernen, ggf. Windows reaktivieren.

## Legende
### Disk2vhd
- Was: Sysinternals-Werkzeug, das Volumes eines laufenden Systems als VHD/VHDX abbildet.
- Wie: Volumes wählen, VSS nutzen, Ziel auf anderem Datenträger oder Netzlaufwerk.
- Wann: P2V von Systemen, die nicht neu installiert werden können.
- Wo: Auf dem physischen Quellsystem.
- Warum: Schnelle 1:1-Übernahme ohne Neuinstallation.
### Generationswahl bei P2V
- Was: Gen 1 für BIOS/MBR, Gen 2 für UEFI/GPT.
- Wie: msinfo32 (BIOS-Modus), bcdedit (winload.exe/efi), Get-Disk (PartitionStyle).
- Warum: Nur die passende Firmware kann das System starten.

## Karteikarten
- F: Was bedeutet P2V? | A: Physical to Virtual – Übernahme eines physischen Systems in eine VM.
- F: Welches Sysinternals-Tool erstellt VHDX von laufenden Systemen? | A: Disk2vhd.
- F: Welche Technik nutzt Disk2vhd für konsistente Abbilder im Betrieb? | A: Volumeschattenkopie (VSS).
- F: Welche Generation bei BIOS/MBR? | A: Generation 1.
- F: Welche Generation bei UEFI/GPT? | A: Generation 2.
- F: Wie erkennt man den Startmodus? | A: msinfo32 → BIOS-Modus, oder bcdedit: winload.efi = UEFI, winload.exe = BIOS.
- F: Warum darf der physische Server nicht weiterlaufen? | A: Gleicher Name und gleiche IP wie die VM – Konflikte im Netz und im AD.
- F: Was entfernt man nach P2V? | A: Hersteller-Agenten und Treiber der alten Hardware.

## Quiz
? Ein Quellserver startet im BIOS-Modus mit MBR. Welche VM-Generation?
* Generation 1
- Generation 2
- Beide gleichermaßen
- Generation 3
! Gen 2 erwartet UEFI/GPT.

? Welches Werkzeug erstellt ein VHDX-Abbild eines laufenden physischen Servers?
* Disk2vhd
- Sysprep
- Optimize-VHD
- wbadmin get versions
! Sysinternals-Tool mit VSS-Unterstützung.

? Wo sollte das Ziel der VHDX liegen?
* Auf einem anderen Datenträger oder einer Freigabe
- Direkt auf dem Quellvolume C: des Servers
- In einer RAM-Disk im Arbeitsspeicher
- Im Ordner der Auslagerungsdatei pagefile.sys
! Sonst wird die Datei mitgesichert oder der Platz reicht nicht.

? Woran erkennst du per bcdedit ein UEFI-System?
* Pfad winload.efi
- Pfad winload.exe
- Eintrag ntldr
- Eintrag bootmgr.bios
! winload.exe steht für BIOS-Start.

? Was ist nach dem Abbild mit dem physischen Server zu tun?
* Herunterfahren und vom Netz trennen
- Parallel weiterlaufen lassen
- Umbenennen und gleiche IP behalten
- In die Domäne neu aufnehmen
! Zwei identische Systeme verursachen Konflikte.

? An welchem Controller muss die Startplatte einer Gen-1-VM hängen?
* IDE-Controller
- SCSI-Controller
- USB-Controller
- NVMe-Controller
! Gen 1 bootet nicht von SCSI.

? Welche Nacharbeit ist nach P2V typisch?
* Hersteller-Agenten und alte Treiber entfernen
- Update-VMVersion auf 5.0
- BitLocker auf dem Host deaktivieren
- DHCP-Wächter aktivieren
! Diese Programme erwarten die alte Hardware.

? Warum nutzt Disk2vhd die Volumeschattenkopie?
* Für ein konsistentes Abbild im laufenden Betrieb
- Um die erzeugte VHDX automatisch zu verschlüsseln
- Um die VM nach der Konvertierung automatisch zu starten
- Um die Windows-Lizenz auf die VM zu übertragen
! VSS friert einen konsistenten Zeitpunkt ein.
