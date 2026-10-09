---
id: erg-windows-client
bereich: AP1
block: ERG
kapitel: Ergänzungen 2.2
titel: Windows 11 als Client – Installation, Konten, UAC, Updates, Wiederherstellung und Fehlersuche
stufe: Einsteiger
fach: ITK / Grundlagen
pruefungen: [AP1, AP2, Schule]
quellen: [Microsoft Learn – Windows 11 Spezifikationen und Windows Update for Business, Microsoft Learn – Windows RE, IHK-Prüfungskatalog FiSi AP1]
verweise: [ap1-a6-ntfs, ap1-a6-freigaben, ap1-a6-sysprep, ap1-a6-powershell, ap1-a6-efs-vss, ref-cmd-tools, legacy-bios-uefi, erg-it-arbeitsplatz]
---

## Profi

### Editionen und Bereitstellung
Im Unternehmen kommen **Windows 11 Pro**, **Enterprise** oder **Education** zum Einsatz – **Home** kann keiner Active-Directory-Domäne beitreten, hat keine Gruppenrichtlinien-Verwaltung (gpedit) und kein BitLocker-Management im vollen Umfang. Bereitstellungswege:
- **Saubere Installation** vom USB-Stick (Media Creation Tool) – für Einzelgeräte.
- **Image-basiert** (Referenzrechner → **Sysprep /generalize** → Abbild mit WDS/MDT/Configuration Manager verteilen).
- **Windows Autopilot** – Gerät kommt vom Hersteller direkt zum Benutzer, registriert sich in **Entra ID** und bekommt Richtlinien und Apps über **Intune**.
- **In-Place-Upgrade** – Daten und Programme bleiben erhalten.

### Benutzerkonten und Benutzerkontensteuerung (UAC)
| Kontotyp | Beschreibung |
|---|---|
| Lokales Konto | nur auf diesem Gerät, in der SAM-Datenbank |
| Microsoft-Konto | private Cloud-Identität (outlook.com …) |
| Domänenkonto | in Active Directory, zentral verwaltet |
| Entra-ID-Konto (Geschäfts-/Schulkonto) | Cloud-Identität der Organisation |

Rollen: **Standardbenutzer** vs. **Administrator**. Die **Benutzerkontensteuerung (User Account Control, UAC)** sorgt dafür, dass auch Administratoren standardmäßig mit **Standardrechten** arbeiten; erst nach Bestätigung (Zustimmungsaufforderung, ggf. auf dem **sicheren Desktop**) läuft ein Prozess mit erhöhten Rechten. Prinzip: **Least Privilege** – Alltagsarbeit nie als Admin.

### Updates
- **Qualitätsupdates** (kumulativ, monatlich am **Patchday**, zweiter Dienstag im Monat) und **Funktionsupdates** (jährlich, neue Version wie 24H2).
- Steuerung über **Windows Update for Business** (GPO/Intune: Aufschub, Wartungsfenster), **WSUS** (lokaler Updateserver) oder Configuration Manager.
- **Servicing**: Jede Windows-11-Version hat begrenzten Support (Pro: 24 Monate, Enterprise/Education: 36 Monate).

### Wiederherstellung und Fehlersuche
- **Windows-Wiederherstellungsumgebung (Windows RE)**: Starthilfe, Systemwiederherstellung, Updates deinstallieren, Eingabeaufforderung, **Diesen PC zurücksetzen** (Dateien behalten oder alles entfernen).
- **Systemwiederherstellungspunkte** setzen Systemdateien und Registry zurück – **keine Datensicherung** der Benutzerdateien.
- **Abgesicherter Modus** lädt nur Basistreiber.
- Werkzeuge: **Ereignisanzeige** (eventvwr.msc), **Geräte-Manager** (devmgmt.msc), **Zuverlässigkeitsverlauf**, **Task-Manager**, `sfc /scannow` (Systemdateien prüfen), `DISM /Online /Cleanup-Image /RestoreHealth` (Komponentenspeicher reparieren), `chkdsk`, `msinfo32`.
- Netzwerk: `ipconfig /all`, `ping`, `tracert`, `nslookup`, `Test-NetConnection`.

### Datenschutz und Sicherheit am Client
**BitLocker** (Laufwerksverschlüsselung mit TPM), **Microsoft Defender Antivirus**, **Windows-Firewall** mit Profilen (Domäne/Privat/Öffentlich), **Windows Hello** (PIN/Biometrie, an das Gerät gebunden), **Smart App Control/SmartScreen**.

## Einfach
Windows ist das **Betriebssystem** – der Hausmeister des Computers. Es sorgt dafür, dass Programme laufen, Dateien gespeichert werden und Maus, Drucker und Internet funktionieren.

In einer Firma gibt es nicht einen Computer, sondern Hunderte. Damit man nicht jeden einzeln einrichten muss, macht man es wie beim Plätzchenbacken: Man baut **einen perfekten Computer** (den Teig), stanzt ihn mit **Sysprep** neutral aus und kopiert dieses **Abbild** auf alle anderen Rechner. Noch moderner ist **Autopilot**: Der neue Laptop kommt direkt aus der Fabrik zum Mitarbeiter und richtet sich beim ersten Anmelden **von selbst** ein.

Jeder Mensch bekommt ein **Benutzerkonto**. Die meisten sind **normale Benutzer** – sie dürfen arbeiten, aber nichts Wichtiges am System verstellen. Wenn doch einmal etwas Wichtiges passieren soll, erscheint ein **Fenster, das nachfragt** („Möchten Sie zulassen, dass…?“). Das ist die **Benutzerkontensteuerung**. Sie ist wie die Kindersicherung an der Steckdose: Man kann sie öffnen, aber nicht aus Versehen.

**Updates** sind wie Impfungen: Sie schließen Sicherheitslücken. Microsoft liefert sie jeden zweiten Dienstag im Monat.

Und wenn Windows einmal nicht mehr startet? Dann gibt es den **Notfallkoffer**: die **Wiederherstellungsumgebung**. Dort kann man reparieren, ein kaputtes Update entfernen oder den Computer auf einen früheren Stand zurücksetzen. Aber Achtung: Ein Wiederherstellungspunkt ist **keine Datensicherung** für Fotos und Dokumente!

## Merksatz
- **Home kann keine Domäne** – im Betrieb Pro/Enterprise/Education.
- **UAC = Admin arbeitet als Standardbenutzer, bis er bestätigt.**
- **Patchday = zweiter Dienstag im Monat.**
- **Wiederherstellungspunkt ≠ Backup.**
- **sfc repariert Dateien, DISM repariert die Quelle dafür.**

## Prüfungsfalle
- Windows 11 **Home** kann der AD-Domäne **nicht** beitreten.
- **Sysprep** ohne `/generalize` behält SID und gerätespezifische Daten – für Images falsch.
- Systemwiederherstellung stellt **keine gelöschten Benutzerdateien** wieder her.
- „Administrator“ bedeutet bei aktivierter UAC nicht, dass Programme automatisch mit vollen Rechten laufen.
- Wenn `sfc /scannow` scheitert, zuerst **DISM … /RestoreHealth**, dann sfc erneut.

## Grafik
### Benutzerkontensteuerung
1. Benutzer -> Programm: Startet Setup.exe
2. Programm -> UAC: Fordert Administratorrechte an
3. UAC: Wechsel auf den sicheren Desktop
4. UAC -> Benutzer: Zustimmungs- oder Anmeldeaufforderung
5. Benutzer -> UAC: Bestätigt bzw. gibt Admin-Anmeldedaten ein
6. UAC -> Programm: Startet mit erhöhtem Token

### Reparatur einer beschädigten Installation
1. Admin -> Client: DISM /Online /Cleanup-Image /RestoreHealth
2. Client -> Windows Update: Lädt intakte Komponenten
3. Admin -> Client: sfc /scannow
4. Client: Ersetzt beschädigte Systemdateien
5. Admin: Prüft CBS.log und startet neu

## Lab
**Maschinen**: Windows-11-Client **CL01** im Heimlabor **example.com**, Domänencontroller **DC01**.

### GUI
1. **CL01**: Einstellungen → Konten → Andere Benutzer → lokales Konto **lab-user** als Standardbenutzer anlegen (Kennwort beim ersten Anmelden selbst setzen lassen).
2. **CL01**: Systemsteuerung → Benutzerkonten → „Einstellungen der Benutzerkontensteuerung ändern“ → Stufe prüfen (Standard: „Nur benachrichtigen, wenn von Apps Änderungen vorgenommen werden“).
3. **CL01**: Einstellungen → Windows Update → Erweiterte Optionen → Nutzungszeit festlegen.
4. **CL01**: Einstellungen → System → Wiederherstellung → „Erweiterter Start“ → Windows RE ansehen (nicht zurücksetzen).
5. **CL01**: `eventvwr.msc` → Windows-Protokolle → System → nach Quelle „Microsoft-Windows-WindowsUpdateClient“ filtern.

### PowerShell
```powershell
# Auf CL01 als Administrator
New-LocalUser -Name 'lab-user' -NoPassword
Add-LocalGroupMember -Group 'Benutzer' -Member 'lab-user'
Get-LocalGroupMember -Group 'Administratoren'
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 5
Checkpoint-Computer -Description 'Vor Treiberupdate' -RestorePointType MODIFY_SETTINGS
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
Get-WinEvent -LogName System -MaxEvents 20 | Format-Table TimeCreated, Id, ProviderName -AutoSize
```

## Legende
### Benutzerkontensteuerung (UAC)
- Was: Sicherheitsfunktion, die Prozesse standardmäßig mit eingeschränkten Rechten startet.
- Wie: Bei Bedarf an Adminrechten erscheint eine Zustimmungs- oder Anmeldeaufforderung, oft auf dem sicheren Desktop.
- Wann: Bei Installationen, Systemänderungen, Start von Werkzeugen „als Administrator“.
- Wo: Jeder Windows-Client und -Server; Konfiguration per GPO/Intune.
- Warum: Least Privilege – Schadsoftware erhält nicht automatisch Adminrechte.

### Windows RE
- Was: Wiederherstellungsumgebung auf Basis von Windows PE.
- Wie: Startet automatisch nach mehreren Fehlstarts oder über „Erweiterter Start“ bzw. `shutdown /r /o`.
- Wann: Wenn Windows nicht mehr normal startet oder ein Update Probleme macht.
- Wo: Eigene Wiederherstellungspartition auf dem Systemdatenträger.
- Warum: Reparatur ohne externes Installationsmedium.

## Karteikarten
- F: Welche Windows-11-Edition kann keiner AD-Domäne beitreten? | A: Windows 11 Home.
- F: Was bewirkt die Benutzerkontensteuerung (UAC)? | A: Prozesse laufen mit Standardrechten; Adminrechte erst nach Zustimmung bzw. Anmeldung – Least Privilege.
- F: Was ist der Patchday? | A: Der zweite Dienstag im Monat, an dem Microsoft kumulative Sicherheitsupdates veröffentlicht.
- F: Unterschied Qualitätsupdate und Funktionsupdate? | A: Qualitätsupdates monatlich mit Sicherheits-/Fehlerkorrekturen; Funktionsupdates jährlich mit neuer Windows-Version.
- F: Wozu dient `sfc /scannow`? | A: Prüft geschützte Systemdateien und ersetzt beschädigte Dateien.
- F: Wozu dient `DISM /Online /Cleanup-Image /RestoreHealth`? | A: Repariert den Komponentenspeicher, aus dem sfc die intakten Dateien bezieht.
- F: Ist ein Systemwiederherstellungspunkt eine Datensicherung? | A: Nein – er sichert Systemdateien, Registry und Treiber, nicht die persönlichen Dateien.
- F: Was ist Windows Autopilot? | A: Cloud-basierte Bereitstellung: Gerät registriert sich in Entra ID und erhält Richtlinien und Apps über Intune.
- F: Was macht `sysprep /generalize`? | A: Entfernt rechnerspezifische Informationen (z. B. SID), damit das Abbild auf viele Geräte verteilt werden kann.
- F: Welche drei Profile hat die Windows-Firewall? | A: Domäne, Privat, Öffentlich.

## Quiz
? Welche Edition eignet sich NICHT für einen Domänenbeitritt?
* Windows 11 Home
- Windows 11 Pro
- Windows 11 Enterprise
- Windows 11 Education
! Home fehlt die Funktion für den AD-Domänenbeitritt.

? Wann veröffentlicht Microsoft regulär kumulative Sicherheitsupdates?
* Am zweiten Dienstag im Monat
- Am ersten Montag im Monat
- Täglich um Mitternacht
- Nur einmal im Jahr
! Dieser Termin heißt Patchday („Patch Tuesday“).

? Ein Administrator startet ein Setup. Warum erscheint trotzdem eine Abfrage?
* Die UAC startet Prozesse zunächst mit Standardrechten.
- Das Konto ist gesperrt.
- Windows ist nicht aktiviert.
- Die Firewall blockiert das Setup.
! Erst nach Zustimmung erhält der Prozess das volle Administrator-Token.

? Welcher Befehl prüft und repariert geschützte Windows-Systemdateien?
* sfc /scannow
- chkdsk /f
- ipconfig /flushdns
- gpupdate /force
! chkdsk prüft das Dateisystem, sfc die Systemdateien.

? Was stellt ein Systemwiederherstellungspunkt NICHT wieder her?
* Gelöschte persönliche Dokumente
- Registry-Einstellungen
- Treiber
- Systemdateien
! Benutzerdateien sind nicht Teil der Systemwiederherstellung – dafür braucht man ein Backup.

? Welches Verfahren richtet neue Geräte direkt beim Benutzer über die Cloud ein?
* Windows Autopilot
- WDS mit PXE
- Sysprep ohne Generalisierung
- In-Place-Upgrade
! Autopilot nutzt Entra ID und Intune.

? Welche Funktion verschlüsselt das Systemlaufwerk unter Nutzung des TPM?
* BitLocker
- EFS
- SmartScreen
- Windows Hello
! EFS verschlüsselt einzelne Dateien/Ordner, BitLocker ganze Laufwerke.

? Welcher Schritt gehört zur Image-Erstellung?
* Sysprep mit /generalize auf dem Referenzrechner
- Domänenbeitritt des Referenzrechners vor dem Abbild
- Abschalten der UAC
- Löschen der Wiederherstellungspartition
! Ohne Generalisierung haben alle Klone dieselbe SID und gerätespezifische Daten.

? Welche Reihenfolge ist bei beschädigten Systemdateien empfehlenswert?
* Erst DISM /RestoreHealth, dann sfc /scannow
- Erst sfc, dann Neuinstallation
- Erst chkdsk, dann Format
- Erst gpupdate, dann ipconfig
! DISM repariert die Quelle, aus der sfc anschließend die Dateien ersetzt.

## Lücken
- Die {Benutzerkontensteuerung|UAC} fragt vor Systemänderungen nach Zustimmung.
- Der {Patchday} ist der zweite Dienstag im Monat.
- Vor dem Abbild wird der Referenzrechner mit {Sysprep} generalisiert.
- Die Wiederherstellungsumgebung heißt {Windows RE|WinRE}.
- Beschädigte Systemdateien prüft der Befehl {sfc /scannow}.

## Zuordnen
### Werkzeug und Zweck
- eventvwr.msc => Ereignisprotokolle auswerten
- devmgmt.msc => Treiber und Geräte prüfen
- msinfo32 => Systeminformationen, BIOS-Modus, Secure Boot
- tpm.msc => TPM-Status anzeigen

### Bereitstellungsweg und Merkmal
- Autopilot => Cloud-Registrierung über Entra ID und Intune
- Image mit Sysprep => einheitliches Abbild für viele Geräte
- In-Place-Upgrade => Daten und Programme bleiben erhalten
- Saubere Installation => Einzelgerät vom USB-Stick

### Kontotyp und Speicherort
- Lokales Konto => SAM-Datenbank des Geräts
- Domänenkonto => Active Directory
- Geschäfts- oder Schulkonto => Microsoft Entra ID
- Microsoft-Konto => privates Cloud-Konto von Microsoft

## Reihenfolge
### Client per Image bereitstellen
1. Referenzrechner installieren und konfigurieren
2. Updates und Standardsoftware einspielen
3. Sysprep /generalize /oobe /shutdown ausführen
4. Abbild aufzeichnen
5. Abbild per WDS/MDT verteilen
6. Gerät in die Domäne aufnehmen

### Windows startet nicht mehr
1. Windows RE über erweiterten Start bzw. automatische Reparatur öffnen
2. Starthilfe ausführen
3. Letztes Update deinstallieren
4. Systemwiederherstellung auf einen Wiederherstellungspunkt
5. Daten sichern und „Diesen PC zurücksetzen“

### Beschädigte Systemdateien reparieren
1. Eingabeaufforderung als Administrator öffnen
2. DISM /Online /Cleanup-Image /RestoreHealth ausführen
3. sfc /scannow ausführen
4. Neustart durchführen
5. Ereignisanzeige auf erneute Fehler prüfen

## Freitext
- F: Erläutern Sie das Prinzip der Benutzerkontensteuerung und warum Administratoren im Alltag ein Standardkonto nutzen sollten. | M: UAC startet Prozesse mit eingeschränktem Token; erhöhte Rechte nur nach Zustimmung. Ein Standardkonto im Alltag verhindert, dass Schadsoftware oder Fehlbedienung sofort Systemrechte erhält (Least Privilege). | P: 4
- F: Nennen Sie drei Möglichkeiten, Windows 11 in einem Unternehmen auszurollen, und je einen Vorteil. | M: Image mit Sysprep (einheitlich, schnell), Autopilot (ohne IT-Zwischenschritt, direkt zum Benutzer), In-Place-Upgrade (Daten/Programme bleiben), saubere Installation (sauberer Neustart). | P: 6
- F: Ein Benutzer fragt, ob die Systemwiederherstellung seine gelöschten Fotos zurückholt. Antworten Sie fachlich korrekt. | M: Nein; Wiederherstellungspunkte sichern Systemdateien, Registry und Treiber, aber keine persönlichen Dateien. Fotos nur aus Backup, Dateiversionsverlauf, OneDrive-Papierkorb oder Schattenkopien. | P: 3

## Szenario
### Neues Notebook im Homeoffice
Eine neue Mitarbeiterin arbeitet nur im Homeoffice. Die Firma nutzt Microsoft 365 mit Entra ID und Intune.
- F: Wie wird das Gerät bereitgestellt, ohne dass es ins Büro muss? | A: Windows Autopilot: Hardware-Hash registrieren, Gerät direkt zustellen, Anmeldung mit Geschäftskonto, Richtlinien/Apps per Intune. | P: 3
- F: Welche Edition benötigt das Gerät mindestens? | A: Windows 11 Pro (oder Enterprise über Abonnement). | P: 1

### Bluescreen nach Treiberupdate
Nach einem Grafiktreiber-Update startet CL07 mit Bluescreen und landet in der automatischen Reparatur.
- F: Welche Optionen nutzen Sie in Windows RE? | A: Abgesicherten Modus starten und Treiber zurücksetzen, Systemwiederherstellung auf Punkt vor dem Update, ggf. Update deinstallieren. | P: 3
- F: Wo finden Sie danach Hinweise auf die Ursache? | A: Ereignisanzeige (System, Kernel-Power/BugCheck), Zuverlässigkeitsverlauf, Minidump. | P: 2

### Benutzer installiert Software
In der Abteilung sind alle Benutzer lokale Administratoren; mehrfach wurde Adware installiert.
- F: Welche Maßnahme schlagen Sie vor? | A: Benutzer aus der lokalen Administratorengruppe entfernen (Standardkonten), Softwareverteilung zentral, ggf. LAPS für lokale Adminkennwörter und App Control/AppLocker. | P: 3
- F: Welches Prinzip setzen Sie damit um? | A: Least Privilege (minimale Rechte). | P: 1
