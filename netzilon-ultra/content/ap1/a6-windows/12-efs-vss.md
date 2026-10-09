---
id: ap1-a6-efs-vss
bereich: AP1
block: A6
kapitel: Windows Server
titel: EFS-Verschlüsselung & Schattenkopien (VSS)
stufe: Fortgeschritten
quellen: [Server_2008_R2_-_70_642_2nd_de.pdf, 07-Uebung-Dateisystem.pdf]
verweise: [ap1-a2-dateisysteme, ap1-a2-backup, ap1-a6-ntfs, az801-bitlocker]
---

## Profi

### EFS – Encrypting File System
**EFS** verschlüsselt **einzelne Dateien und Ordner** auf **NTFS**-Volumes, **benutzerbezogen** und transparent: Der berechtigte Benutzer arbeitet ganz normal, alle anderen (auch Administratoren mit NTFS-Vollzugriff) sehen nur verschlüsselten Inhalt bzw. erhalten „Zugriff verweigert“.

**Funktionsweise (hybride Verschlüsselung)**:
1. Für jede Datei wird ein zufälliger symmetrischer Schlüssel erzeugt – der **FEK** (File Encryption Key, AES-256). Damit werden die Daten verschlüsselt (schnell).
2. Der FEK wird mit dem **öffentlichen Schlüssel** des Benutzers (EFS-Zertifikat) verschlüsselt und im Dateikopf gespeichert (DDF).
3. Zusätzlich wird der FEK mit dem öffentlichen Schlüssel jedes **Wiederherstellungsagenten** (DRA – Data Recovery Agent) verschlüsselt (DRF).
4. Beim Öffnen entschlüsselt Windows den FEK mit dem **privaten Schlüssel** des Benutzers (liegt im Benutzerprofil, geschützt durch das Anmeldekennwort/DPAPI).

**Zertifikat**: Wird beim ersten Verschlüsseln automatisch **selbstsigniert** erzeugt – in Domänen besser über **AD CS** (Vorlage „Basis-EFS“) ausstellen und archivieren.

**Wiederherstellung**: Geht der private Schlüssel verloren (Profil gelöscht, Kennwort durch Admin **zurückgesetzt** statt geändert, neues Konto), sind die Daten **verloren** – außer:
- das EFS-Zertifikat mit privatem Schlüssel wurde **exportiert** (.pfx), oder
- ein **Wiederherstellungsagent** ist per **GPO** definiert (Computerkonfiguration → Sicherheitseinstellungen → Richtlinien für öffentliche Schlüssel → **Verschlüsselndes Dateisystem**) – in Domänen ist standardmäßig der **Domänen-Administrator** DRA; dessen Schlüssel sicher auslagern.

**Freigeben**: Weitere Benutzer können über „Details“ Zugriff auf eine verschlüsselte **Datei** erhalten (sie brauchen ein eigenes EFS-Zertifikat).

**Wichtige Regeln**:
- Nur **NTFS** (kein FAT/exFAT; ReFS unterstützt kein EFS).
- **Komprimierung und Verschlüsselung schließen sich aus** (Attribute „Komprimieren“ und „Verschlüsseln“ gleichzeitig nicht möglich).
- Dateien mit Attribut **System** und der Ordner `%SystemRoot%` können nicht verschlüsselt werden.
- **Kopieren/Verschieben** auf FAT, per E-Mail oder über das Netzwerk (SMB) → Datei wird **entschlüsselt** übertragen (auf dem Zielserver ggf. neu verschlüsselt). EFS schützt also **Daten im Ruhezustand** auf dem Datenträger, nicht bei der Übertragung.
- Neue Dateien in einem verschlüsselten **Ordner** werden automatisch verschlüsselt.
- Im Explorer grüne bzw. mit **Schloss** markierte Dateinamen.

**EFS vs. BitLocker**
| | EFS | **BitLocker** |
|---|---|---|
| Ebene | einzelne Dateien/Ordner | **ganzes Volume** |
| Bezug | **pro Benutzer** (schützt auch vor anderen Benutzern/Admins am selben PC) | **pro Gerät** (schützt vor Diebstahl/Ausbau der Platte) |
| Schlüssel | Benutzerzertifikat | **TPM**, PIN, USB-Schlüssel, Wiederherstellungsschlüssel |
| Systemdateien | nein | ja (inkl. Auslagerungsdatei, Ruhezustand) |
| Kombination | sinnvoll: BitLocker gegen Diebstahl + EFS für vertrauliche Einzeldateien |

### Schattenkopien – Volume Shadow Copy Service (VSS)
**VSS** erstellt **Momentaufnahmen (Snapshots)** eines Volumes zu einem bestimmten Zeitpunkt – auch von **geöffneten Dateien**, konsistent (Anwendungen wie SQL/Exchange werden über **VSS-Writer** kurz „eingefroren“).
Zwei Einsatzzwecke:
1. **Backup**: Windows Server-Sicherung und Backup-Programme sichern aus dem Snapshot → konsistente Sicherung im laufenden Betrieb.
2. **Schattenkopien für freigegebene Ordner** (**Vorgängerversionen**): Benutzer können **selbst** ältere Versionen von Dateien/Ordnern wiederherstellen – Registerkarte **„Vorgängerversionen“** (bzw. Rechtsklick → Vorgängerversion wiederherstellen). Entlastet den Helpdesk massiv („Ich habe gestern die Tabelle überschrieben“).

**Konfiguration (Volume-Ebene)**: Datenträger → Eigenschaften → **Schattenkopien** → Volume auswählen → **Aktivieren**. Standard: **7:00 und 12:00 Uhr** an Werktagen, **Speicherbereich** min. 300 MB bzw. ca. **10 %** des Volumes, max. **64 Schattenkopien** pro Volume (danach werden die ältesten überschrieben). Speicherbereich möglichst auf einem **anderen Volume** (Performance).

**Copy-on-Write-Prinzip**: Beim Erstellen wird nichts kopiert; erst wenn ein Block geändert wird, sichert VSS den **alten Block** in den Speicherbereich. Dadurch geringer Platzbedarf.

**Wichtig**: Schattenkopien liegen **auf demselben System** – bei Plattenausfall, Brand oder **Ransomware** (die gezielt `vssadmin delete shadows` ausführt) sind sie weg. **Kein Ersatz für Backups!** Sie ergänzen sie für schnelle Einzelwiederherstellungen.

## Lab
**Maschinen**: SRV01 (Datenlaufwerk D:, Freigabe „Daten“), CL01 (Benutzer a.meier, b.test).

### GUI – EFS
1. **CL01** (als a.meier): Ordner `C:\Geheim` → Eigenschaften → **Erweitert** → „**Inhalt verschlüsseln, um Daten zu schützen**“ → OK → „Änderungen für diesen Ordner, Unterordner und Dateien übernehmen“.
2. Textdatei in `C:\Geheim` anlegen → Dateiname grün/Schloss.
3. Benachrichtigung „Dateiverschlüsselungsschlüssel sichern“ → **Jetzt sichern** → Zertifikatexport-Assistent → .pfx mit Kennwort auf USB-Stick.
4. **CL01** (als b.test, lokaler Admin): Datei öffnen → **Zugriff verweigert** – obwohl NTFS-Rechte vorhanden.
5. a.meier: Datei → Eigenschaften → Erweitert → **Details** → b.test hinzufügen (b.test braucht vorher ein EFS-Zertifikat: einmal selbst etwas verschlüsseln).
6. **DC01**: GPO → Computerkonfiguration → Richtlinien → Windows-Einstellungen → Sicherheitseinstellungen → Richtlinien für öffentliche Schlüssel → **Verschlüsselndes Dateisystem** → vorhandenen **Wiederherstellungsagenten** prüfen bzw. neuen hinzufügen.

### GUI – Schattenkopien
7. **SRV01**: Explorer → Laufwerk D: → Eigenschaften → **Schattenkopien** → D: → **Aktivieren** → **Einstellungen** → Speicherbereich/Limit, **Zeitplan** (z. B. zusätzlich 17:00) → **Jetzt erstellen**.
8. **CL01**: `\\SRV01\Daten\Bericht.docx` ändern und speichern.
9. **CL01**: Rechtsklick Datei → Eigenschaften → **Vorgängerversionen** → Version vom Snapshot → **Wiederherstellen** oder **Öffnen/Kopieren**.

### PowerShell / Befehle
```powershell
# Auf CL01 – EFS
cipher /e /s:C:\Geheim             # Ordner inkl. Inhalt verschlüsseln
cipher C:\Geheim                   # Status anzeigen (E = verschlüsselt)
cipher /r:C:\Temp\DRA              # Wiederherstellungsagent-Zertifikat (.cer/.pfx) erzeugen
cipher /x C:\Temp\EFS-Backup       # eigenes EFS-Zertifikat sichern
cipher /d /s:C:\Geheim             # entschlüsseln

# Auf SRV01 – Schattenkopien
vssadmin add shadowstorage /for=D: /on=E: /maxsize=10%
vssadmin create shadow /for=D:     # (auf Serverbetriebssystemen verfügbar)
vssadmin list shadows
vssadmin list writers
Get-CimInstance Win32_ShadowCopy | Select-Object InstallDate, VolumeName
# geplante Erstellung wie in der GUI: Aufgabe in der Aufgabenplanung (ShadowCopyVolume{GUID})
```

## Einfach

**EFS** ist ein **Tagebuch mit persönlichem Zahlenschloss**. Auch wenn deine Geschwister (andere Benutzer) oder sogar deine Eltern (Administratoren) das Tagebuch aus dem Regal nehmen dürfen – aufmachen kannst **nur du**. Der Schlüssel steckt in deinem Benutzerprofil.

**Gefahr**: Verlierst du den Schlüssel (Profil kaputt, Konto gelöscht), ist das Tagebuch **für immer zu**. Deshalb:
- **Schlüssel sichern** (Zertifikat exportieren) – wie ein Ersatzschlüssel bei Oma.
- Oder die Firma legt einen **Generalschlüssel** fest (Wiederherstellungsagent), mit dem der Chef im Notfall aufmachen kann.

**Achtung**: Schickst du das Tagebuch per E-Mail oder kopierst es auf einen USB-Stick mit FAT, wird das Schloss **abgenommen**. EFS schützt nur, solange die Datei auf deiner Festplatte liegt.

**BitLocker** ist dagegen ein **Tresor um den ganzen Schrank** – schützt, wenn jemand den ganzen Computer klaut, aber nicht vor anderen Benutzern am selben PC.

**Schattenkopien** sind wie **Fotos von deinem Zimmer**, die automatisch zweimal am Tag gemacht werden. Hast du aus Versehen dein Bild übermalt, schaust du auf das Foto von heute Morgen und holst dir die alte Version zurück – **ganz ohne Admin**, über „Vorgängerversionen“.
Aber: Die Fotos liegen **im selben Zimmer**. Brennt das Zimmer ab (Festplatte kaputt, Erpressungsvirus), sind auch die Fotos weg. Deshalb ersetzen sie **kein richtiges Backup**.

## Merksatz
- **EFS = pro Benutzer, pro Datei** · **BitLocker = pro Gerät, ganzes Volume**.
- EFS-Schlüssel **sichern** oder **DRA** definieren – sonst Datenverlust.
- **Verschlüsseln und Komprimieren schließen sich aus**.
- Schattenkopien: **7:00 + 12:00**, max. **64**, Speicherbereich ~**10 %**.
- **Schattenkopie ≠ Backup**.

## Prüfungsfalle
- Administratoren können EFS-Dateien anderer Benutzer nicht einfach öffnen (nur als DRA).
- Kennwort-**Zurücksetzen** durch den Admin kann den Zugriff auf EFS-Schlüssel kosten (anders als Kennwort-**Ändern** durch den Benutzer).
- EFS gibt es nicht auf FAT32/exFAT/ReFS.
- Kopieren über das Netzwerk überträgt EFS-Dateien unverschlüsselt.
- Schattenkopien werden pro **Volume** aktiviert, nicht pro Freigabe.

## Grafik
### Hybride Verschlüsselung
Datei wird mit einem kleinen goldenen Schlüssel (FEK) verschlossen; der FEK kommt in zwei Umschläge (Benutzer-Schloss, DRA-Schloss); beim Öffnen öffnet der private Schlüssel des Benutzers den Umschlag.

### EFS vs. BitLocker
Haus mit mehreren Zimmern: BitLocker = Mauer um das Haus (Dieb draußen), EFS = Tagebuchschloss im Zimmer (Mitbewohner draußen).

### Zeitreise Vorgängerversionen
Zeitleiste mit Snapshot-Kameras um 7:00 und 12:00; eine Datei wird um 15:00 kaputtgemacht; Nutzer klickt auf den 12:00-Snapshot und die alte Version schwebt zurück.

### Copy-on-Write
Volume als Blöcke; Snapshot = Markierung; bei Änderung eines Blocks wird der alte Block in den Speicherbereich kopiert.

## Karteikarten
- F: Was verschlüsselt EFS? | A: Einzelne Dateien/Ordner auf NTFS, benutzerbezogen.
- F: Wie funktioniert EFS technisch? | A: Symmetrischer FEK verschlüsselt die Daten; der FEK wird mit dem öffentlichen Schlüssel von Benutzer und DRA verschlüsselt.
- F: Was ist ein Wiederherstellungsagent (DRA)? | A: Konto, das per GPO EFS-Dateien aller Benutzer entschlüsseln kann.
- F: Unterschied EFS und BitLocker? | A: EFS: Dateien, pro Benutzer. BitLocker: ganzes Volume, pro Gerät, TPM.
- F: Können Dateien gleichzeitig komprimiert und verschlüsselt sein? | A: Nein.
- F: Was passiert beim Kopieren einer EFS-Datei auf FAT32? | A: Sie wird entschlüsselt.
- F: Befehlszeilentool für EFS? | A: cipher.
- F: Wozu dienen Schattenkopien für freigegebene Ordner? | A: Benutzer stellen ältere Dateiversionen selbst über „Vorgängerversionen“ wieder her.
- F: Standardzeitplan für Schattenkopien? | A: Werktags 7:00 und 12:00 Uhr.
- F: Maximale Anzahl Schattenkopien pro Volume? | A: 64.
- F: Warum sind Schattenkopien kein Backup? | A: Sie liegen auf demselben System und gehen bei Ausfall, Brand oder Ransomware mit verloren.
- F: Was ist ein VSS-Writer? | A: Komponente einer Anwendung (SQL, Exchange, AD), die für konsistente Snapshots sorgt.

## Quiz
? Ein Administrator hat Vollzugriff auf eine Datei, die ein Benutzer mit EFS verschlüsselt hat. Kann er sie öffnen?
* Nein, außer er ist als Wiederherstellungsagent eingetragen
- Ja, Vollzugriff genügt
- Ja, wenn er die Datei umbenennt
- Nur über eine Freigabe

? Welches Werkzeug schützt einen gestohlenen Laptop am besten vor dem Auslesen der Festplatte?
* BitLocker
- EFS allein
- Schattenkopien
- NTFS-Berechtigungen

? Wo aktiviert man Schattenkopien?
* In den Eigenschaften des Volumes, Registerkarte Schattenkopien
- In den Freigabeberechtigungen
- Im DHCP-Bereich
- In der Default Domain Policy

? Warum kann man eine EFS-verschlüsselte Datei nicht zusätzlich komprimieren?
* Verschlüsselung und NTFS-Komprimierung schließen sich gegenseitig aus
- Weil EFS nur auf FAT funktioniert
- Weil komprimierte Dateien schreibgeschützt sind
- Weil EFS die Datei löscht

? Ein Benutzer hat heute um 15 Uhr eine Datei überschrieben. Schattenkopien laufen um 7 und 12 Uhr. Was kann er wiederherstellen?
* Den Stand von 12:00 Uhr
- Den Stand von 14:59 Uhr
- Nichts
- Den Stand von gestern 18 Uhr
