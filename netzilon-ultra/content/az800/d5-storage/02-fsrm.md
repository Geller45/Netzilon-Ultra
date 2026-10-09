---
id: az800-fsrm
bereich: AZ-800
block: A7
kapitel: Storage & Dateidienste
titel: FSRM – Kontingente, Dateiprüfung, Speicherberichte, Klassifizierung & Dateiverwaltungsaufgaben
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn, Speicher-/Dateidienste-Unterlagen]
verweise: [az800-freigaben, ap1-a6-ntfs, ap1-a6-lds-rms, az800-dateisysteme, az800-dedup]
---

## Profi

**Ressourcen-Manager für Dateiserver** (*File Server Resource Manager*, **FSRM**) ist ein Rollendienst von **Datei- und Speicherdienste** zur **Steuerung und Auswertung** von Daten auf **NTFS**-Volumes (ReFS nur eingeschränkt: Kontingente/Dateiprüfungen auf ReFS nicht unterstützt → siehe ReFS-Seite). Konsole: `fsrm.msc`, PowerShell-Modul `FileServerResourceManager`.

### 1. Kontingentverwaltung (*Quota*)
| Typ | Wirkung |
|---|---|
| **Hartes Kontingent** (*Hard*) | Speichern über dem Limit wird **verhindert** |
| **Weiches Kontingent** (*Soft*) | nur **Überwachung/Benachrichtigung**, Speichern erlaubt |
- Gilt pro **Ordner** (nicht pro Benutzer!) – Gegensatz zu **NTFS-Datenträgerkontingenten** (pro Benutzer und Volume, Besitzer-basiert).
- **Schwellenwerte** (z. B. 85 %, 95 %, 100 %) mit Aktionen: **E-Mail**, **Ereignisprotokoll**, **Befehl**, **Bericht**.
- **Kontingentvorlagen** (z. B. „200 MB-Limit mit 50 MB Erweiterung“): Änderungen an der Vorlage können auf abgeleitete Kontingente übertragen werden.
- **Automatisch angewendetes Kontingent** (*Auto Apply Quota*): auf übergeordneten Ordner → jeder **bestehende und neue Unterordner** erhält ein eigenes Kontingent (z. B. Home-Laufwerke: jeder Benutzerordner 2 GB).
- Automatische **Erweiterung** per Befehl bei Schwellenwert möglich (`dirquota`-Befehl / Vorlage „mit Erweiterung“).

### 2. Dateiprüfungsverwaltung (*File Screening*)
| Typ | Wirkung |
|---|---|
| **Aktive Dateiprüfung** | Speichern blockierter Dateitypen wird **verhindert** |
| **Passive Dateiprüfung** | nur **Protokollierung/Benachrichtigung** |
- **Dateigruppen** (z. B. Audio/Video, Ausführbare Dateien, Komprimierte Dateien) definieren Muster (`*.mp3`, `*.exe`) mit **Einschluss-** und **Ausschlussdateien**.
- **Dateiprüfungsvorlagen** analog zu Kontingentvorlagen.
- **Dateiprüfungsausnahme** (*Exception*): Unterordner, in dem blockierte Typen doch erlaubt sind (z. B. `\Marketing\Videos`).
- Prüfung erfolgt **nach Dateinamen/Erweiterung**, nicht nach Inhalt → Umbenennen umgeht die Prüfung.
- Einsatz auch gegen **Ransomware** (Dateigruppe mit bekannten Erweiterungen, Befehl „Benutzer sperren“).

### 3. Speicherberichte (*Storage Reports*)
Sofort oder **geplant**, Formate DHTML/HTML/XML/CSV/Text, per E-Mail. Berichte: **Große Dateien**, **Doppelte Dateien**, **Am längsten nicht verwendete Dateien**, **Zuletzt verwendete Dateien**, **Dateien nach Dateigruppe**, **Dateien nach Besitzer**, **Dateien nach Eigenschaft**, **Kontingentauslastung**, **Dateiprüfungsüberwachung**, **Ordner nach Eigenschaft**.

### 4. Klassifizierungsverwaltung (*File Classification Infrastructure*, FCI)
- **Klassifizierungseigenschaften** (z. B. „Vertraulichkeit“ = Hoch/Mittel/Niedrig, „Abteilung“, „Personenbezogene Daten“ = Ja/Nein).
- **Klassifizierungsregeln** setzen Eigenschaften automatisch:
| Methode | Beschreibung |
|---|---|
| **Ordnerklassifizierer** | nach **Speicherort** (alles unter `\Personal` = Vertraulich) |
| **Inhaltsklassifizierer** | nach **Inhalt**: Zeichenfolgen, **reguläre Ausdrücke** (z. B. IBAN, Kreditkartennummern) |
| **Windows PowerShell-Klassifizierer** / eigene | Skriptlogik |
- Grundlage für **Dynamische Zugriffssteuerung** (*DAC*, zentrale Zugriffsrichtlinien auf Basis von Datei-Eigenschaften + Benutzeransprüchen), Berichte und Dateiverwaltungsaufgaben; RMS-Verschlüsselung per Aufgabe möglich.

### 5. Dateiverwaltungsaufgaben (*File Management Tasks*)
Geplante Aktionen auf Dateien nach Bedingungen (Eigenschaft, Alter, letzter Zugriff):
- **Dateiablauf** (*Expiration*): Dateien z. B. „seit 365 Tagen nicht geändert“ in ein Archiv verschieben.
- **Benutzerdefiniert**: Skript/Programm ausführen.
- **RMS-Verschlüsselung**: Dateien mit Eigenschaft „Vertraulich“ automatisch schützen.
- Vorab-Benachrichtigung der Dateibesitzer möglich.

### 6. Zugriff verweigert-Unterstützung (*Access-Denied Assistance*)
Statt „Zugriff verweigert“ erhält der Benutzer (Windows 8+) eine **benutzerdefinierte Meldung** und kann per **E-Mail Zugriff anfordern** (an Ordnerbesitzer/Admin). Aktivierung per FSRM-Optionen oder **GPO**.

### Voraussetzungen / Einstellungen
- **SMTP-Server** und Absender in den FSRM-Optionen für E-Mail-Benachrichtigungen.
- **Benachrichtigungsgrenzen** (Standard 60 Min. je Typ), damit keine Mailflut entsteht.
- FSRM-Konfiguration exportieren: `dirquota template export`, `filescrn template export` bzw. PowerShell.

## Lab
**Maschinen**: **FS01** (Dateiserver, NTFS-Volume E:), **DC01** (example.com, SMTP-Relay optional), **CL01** (Windows 11).

### GUI
1. **FS01**: Server-Manager → Rollen → Datei- und Speicherdienste → **Ressourcen-Manager für Dateiserver** installieren → `fsrm.msc`.
2. **FS01**: FSRM → Kontextmenü **Optionen konfigurieren** → SMTP-Server `mail.example.com`, Standardadministrator `it@example.com` → Test-E-Mail.
3. **FS01**: **Kontingentverwaltung → Kontingentvorlagen** → „200 MB-Limit mit Bericht an Benutzer“ kopieren → „Home 2 GB hart“, Grenze 2 GB, **Hartes Kontingent**, Schwellenwerte 85 % (E-Mail an Benutzer), 100 % (Ereignisprotokoll).
4. **FS01**: **Kontingente** → Kontingent erstellen → Pfad `E:\Home` → **Vorlage automatisch anwenden und Kontingente in vorhandenen und neuen Unterordnern erstellen** → „Home 2 GB hart“.
5. **FS01**: **Dateiprüfungsverwaltung → Dateiprüfungen** → Neu → Pfad `E:\Vertrieb` → Vorlage **Audio- und Videodateien blockieren** (aktiv).
6. **FS01**: **Dateiprüfungsausnahme** für `E:\Vertrieb\Werbevideos` → Dateigruppe Audio/Video erlauben.
7. **CL01**: `test.mp3` nach `\\FS01\Vertrieb` kopieren → blockiert; nach `\Werbevideos` → erlaubt. Datei in `test.txt` umbenennen → wird **nicht** blockiert (nur Endung).
8. **FS01**: **Klassifizierungsverwaltung → Klassifizierungseigenschaften** → Neu „Vertraulichkeit“ (Auswahlliste Hoch/Niedrig) → **Klassifizierungsregeln** → Neu „IBAN = Hoch“ → Bereich `E:\Vertrieb` → **Inhaltsklassifizierer** → regulärer Ausdruck `DE\d{20}` → Wert „Hoch“ → **Klassifizierung mit allen Regeln jetzt ausführen**.
9. **FS01**: **Speicherberichtverwaltung** → Bericht jetzt generieren → „Doppelte Dateien“, „Große Dateien“, „Dateien nach Eigenschaft (Vertraulichkeit)“ für `E:\`.
10. **FS01**: **Dateiverwaltungsaufgaben** → Neu → Bereich `E:\Vertrieb` → Aktion **Dateiablauf** → Ziel `E:\Archiv` → Bedingung **Datum der letzten Änderung** älter als 365 Tage → Zeitplan wöchentlich.
11. **FS01**: FSRM → Optionen → **Unterstützung bei verweigertem Zugriff** aktivieren → Meldung „Zugriff beim Ordnerbesitzer anfordern“.

### PowerShell
```powershell
# Auf FS01 – Installation und SMTP
Install-WindowsFeature FS-Resource-Manager -IncludeManagementTools
Set-FsrmSetting -SmtpServer mail.example.com -AdminEmailAddress it@example.com -FromEmailAddress fsrm@example.com

# Auf FS01 – Kontingentvorlage + automatisch angewendetes Kontingent
$warn = New-FsrmQuotaThreshold -Percentage 85 -Action (New-FsrmAction -Type Email -MailTo "[Source Io Owner Email]" -Subject "Home-Laufwerk fast voll" -Body "Du hast [Quota Used Percent] % belegt.")
New-FsrmQuotaTemplate -Name "Home 2 GB hart" -Size 2GB -Threshold $warn
New-FsrmAutoQuota -Path E:\Home -Template "Home 2 GB hart"
New-FsrmQuota -Path E:\Projekte -Size 10GB -SoftLimit
Get-FsrmQuota | Select-Object Path,Size,Usage,SoftLimit

# Auf FS01 – Dateiprüfung + Ausnahme
New-FsrmFileScreen -Path E:\Vertrieb -Template "Block Audio and Video Files" -Active
New-FsrmFileScreenException -Path E:\Vertrieb\Werbevideos -IncludeGroup "Audio and Video Files"
New-FsrmFileGroup -Name "Ransomware" -IncludePattern @("*.locky","*.crypt","*.encrypted")
New-FsrmFileScreen -Path E:\ -IncludeGroup "Ransomware" -Active

# Auf FS01 – Klassifizierung
New-FsrmClassificationPropertyDefinition -Name "Vertraulichkeit" -Type SingleChoice `
  -PossibleValue @((New-FsrmClassificationPropertyValue -Name "Hoch"),(New-FsrmClassificationPropertyValue -Name "Niedrig"))
New-FsrmClassificationRule -Name "IBAN=Hoch" -Property "Vertraulichkeit" -PropertyValue "Hoch" -Namespace @("E:\Vertrieb") `
  -ClassificationMechanism "Content Classifier" -Parameters @("RegularExpressionEx=Min=1;Expr=DE\d{20}") -ReevaluateProperty Overwrite
Start-FsrmClassification -Confirm:$false
Get-FsrmClassification

# Auf FS01 – Bericht und Dateiablauf
New-FsrmStorageReport -Name "Aufräumen" -Namespace @("E:\") -ReportType @("DuplicateFiles","LargeFiles","LeastRecentlyAccessed") -Interactive
$act = New-FsrmFmjAction -Type Expiration -ExpirationFolder E:\Archiv
$cond = New-FsrmFmjCondition -Property "File.DateLastModified" -Condition LessThan -Value "Date.Now" -DateOffset -365
New-FsrmFileManagementJob -Name "Ablauf-365" -Namespace @("E:\Vertrieb") -Action $act -Condition $cond -Schedule (New-FsrmScheduledTask -Time (Get-Date "22:00") -Weekly Sunday)

# Auf FS01 – Access-Denied Assistance
Set-FsrmAdrSetting -Event AccessDenied -Enabled:$true -DisplayMessage "Kein Zugriff – Anforderung an den Ordnerbesitzer senden." -AllowRequests:$true
```

## Einfach

Der **FSRM** ist der **Hausmeister des Dateiservers**:

- **Kontingent** = jeder Ordner bekommt einen **Schrank mit fester Größe**. **Hart** = der Schrank ist voll, **nichts passt mehr rein**. **Weich** = der Hausmeister **meckert nur** („Dein Schrank ist fast voll!“), aber du darfst weiter reinstopfen.
- **Automatisches Kontingent** = für den Ordner „Home“ bekommt **jeder neue Schüler automatisch** seinen eigenen 2-GB-Schrank.
- **Dateiprüfung** = der Hausmeister kontrolliert am Eingang: „**Keine Musik und keine Videos** im Vertriebsordner!“ **Aktiv** = er lässt sie nicht rein, **passiv** = er schreibt es nur auf. Aber: Er schaut nur aufs **Etikett** (Dateiendung). Wer `lied.mp3` in `lied.txt` umbenennt, schmuggelt es durch.
- **Berichte** = der Hausmeister macht eine **Inventur**: Was sind die größten Dateien? Welche gibt es doppelt? Was hat seit Jahren keiner angefasst?
- **Klassifizierung** = er **klebt Aufkleber** auf Dateien, z. B. „VERTRAULICH“, wenn in der Datei eine **IBAN** steht.
- **Dateiverwaltungsaufgaben** = er **räumt automatisch auf**: Alles, was ein Jahr nicht angefasst wurde, kommt in den **Keller** (Archiv).
- **Zugriff verweigert-Hilfe** = statt nur „Zugang verboten!“ steht an der Tür: „**Klingel hier, um den Besitzer zu fragen.**“

## Merksatz
- **Hart** blockiert, **weich** warnt.
- FSRM-Kontingent = **pro Ordner**; NTFS-Datenträgerkontingent = **pro Benutzer**.
- **Automatisch angewendetes Kontingent** = für **jeden Unterordner**, auch neue.
- **Aktive** Prüfung blockiert, **passive** protokolliert; Prüfung nur nach **Dateiendung**.
- **Ausnahme** für Unterordner.
- Klassifizierung: **Ordner**- oder **Inhalts**klassifizierer (RegEx).
- **Dateiablauf** = alte Dateien automatisch verschieben.
- FSRM braucht **NTFS** (Kontingente/Prüfungen nicht auf ReFS).

## Prüfungsfalle
- Weiches Kontingent verhindert kein Speichern.
- Normales Kontingent auf `E:\Home` gilt für den Ordner insgesamt, nicht pro Benutzerordner → automatisch angewendetes Kontingent nötig.
- Dateiprüfungen lassen sich durch Umbenennen umgehen.
- Ohne SMTP-Konfiguration keine E-Mail-Benachrichtigungen.
- FSRM-Kontingente und Dateiprüfungen funktionieren nicht auf ReFS-Volumes.
- Klassifizierungsregeln wirken erst nach Ausführung (Zeitplan oder manuell).

## Grafik
### Schränke
Ordner als Schränke; harter Schrank schließt sich bei 100 %, weicher Schrank bekommt ein Warnschild, bleibt aber offen. Neuer Benutzerordner erscheint unter Home und bekommt automatisch einen eigenen Schrank.

### Eingangskontrolle
Dateien laufen zur Tür „Vertrieb“: `.mp3` wird abgewiesen (aktiv), in der Tür „Werbevideos“ (Ausnahme) darf sie rein; eine umbenannte `.txt` schlüpft durch.

### Aufkleber
Scanner fährt über Dateien; findet IBAN-Muster → roter Aufkleber „Vertraulich: Hoch“.

### Keller
Kalender springt um ein Jahr; alte Dateien rollen auf Förderband ins Archiv.

## Karteikarten
- F: Unterschied hartes und weiches Kontingent? | A: Hart verhindert Überschreiten, weich warnt nur.
- F: Unterschied FSRM-Kontingent und NTFS-Datenträgerkontingent? | A: FSRM pro Ordner, NTFS pro Benutzer und Volume.
- F: Was macht ein automatisch angewendetes Kontingent? | A: Erstellt für jeden bestehenden und neuen Unterordner ein eigenes Kontingent.
- F: Unterschied aktive und passive Dateiprüfung? | A: Aktiv blockiert, passiv protokolliert/benachrichtigt nur.
- F: Wonach prüft die Dateiprüfung? | A: Nach Dateinamen/Dateiendung, nicht nach Inhalt.
- F: Wie erlaubt man blockierte Typen in einem Unterordner? | A: Dateiprüfungsausnahme.
- F: Zwei eingebaute Klassifizierer? | A: Ordnerklassifizierer und Inhaltsklassifizierer.
- F: Was ist ein Dateiablauf? | A: Dateiverwaltungsaufgabe, die Dateien nach Bedingungen (z. B. Alter) in einen Ablaufordner verschiebt.
- F: Welche Aktionen können Schwellenwerte auslösen? | A: E-Mail, Ereignisprotokoll, Befehl, Bericht.
- F: Was bietet die Unterstützung bei verweigertem Zugriff? | A: Eigene Meldung und Zugriffsanforderung per E-Mail.
- F: Cmdlet für automatisches Kontingent? | A: New-FsrmAutoQuota
- F: Unterstützt FSRM Kontingente auf ReFS? | A: Nein, nur NTFS.

## Quiz
? Jeder Benutzerordner unter E:\Home soll automatisch – auch für neue Benutzer – auf 2 GB begrenzt werden. Lösung?
* Automatisch angewendetes Kontingent auf E:\Home
- Hartes Kontingent auf E:\Home
- NTFS-Datenträgerkontingent auf E:
- Passive Dateiprüfung

? Benutzer sollen informiert, aber nicht am Speichern gehindert werden, wenn ein Ordner 5 GB überschreitet. Lösung?
* Weiches Kontingent
- Hartes Kontingent
- Aktive Dateiprüfung
- Dateiablauf

? Musikdateien sind in E:\Vertrieb blockiert, sollen aber in E:\Vertrieb\Werbevideos erlaubt sein. Lösung?
* Dateiprüfungsausnahme für den Unterordner
- Zweite aktive Dateiprüfung
- Weiches Kontingent
- Klassifizierungsregel

? Dateien mit IBAN-Nummern sollen automatisch als „Vertraulich“ markiert werden. Welche FSRM-Funktion?
* Klassifizierungsregel mit Inhaltsklassifizierer
- Ordnerklassifizierer
- Speicherbericht „Große Dateien“
- Dateiprüfung

? Dateien, die seit einem Jahr nicht geändert wurden, sollen automatisch ins Archiv verschoben werden. Lösung?
* Dateiverwaltungsaufgabe mit Dateiablauf
- Hartes Kontingent
- Passive Dateiprüfung
- Access-Denied Assistance

? Was unterscheidet ein hartes von einem weichen Kontingent?
* Hart verhindert weiteres Speichern, weich warnt nur
- Weich verhindert Speichern, hart warnt nur
- Hart gilt nur für Administratoren
- Es gibt keinen Unterschied
! Weiche Kontingente eignen sich zur Überwachung.

? Was ist eine Dateiprüfung (File Screen)?
* Blockieren oder Überwachen bestimmter Dateitypen anhand von Dateigruppen
- Prüfung auf Viren
- Verschlüsselung von Dateien
- Komprimierung alter Dateien
! Aktive Prüfung blockiert, passive Prüfung protokolliert nur.

? Welche FSRM-Funktion erzeugt Berichte über große oder doppelte Dateien?
* Speicherberichteverwaltung
- Kontingentverwaltung
- Klassifizierungsverwaltung
- Dateiprüfungsverwaltung
! Berichte können geplant und per E-Mail versendet werden.
