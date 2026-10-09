---
id: ap1-a6-freigaben
bereich: AP1
block: A6
kapitel: Windows Server
titel: Zugriffssteuerung & Freigaben
stufe: Einsteiger
quellen: [08-01-Folien-Zugriffssteuerung.pdf, 08-01-Uebung-Freigaben-erstellen.pdf]
verweise: [ap1-a6-ntfs, ap1-a6-gruppen, ap1-a2-dateisysteme]
---

## Profi

### Sicherheitsprinzipale und SIDs
Ein **Sicherheitsprinzipal** ist ein Konto, das **authentifiziert** werden kann: **Benutzer**, **Gruppen**, **Computer** (und Dienstkonten). Ihnen werden Berechtigungen für Ressourcen zugewiesen.
- Jeder Sicherheitsprinzipal wird durch eine **SID** (Security Identifier) eindeutig gekennzeichnet, z. B. `S-1-5-21-3623811015-3361044348-30300820-1013`. Die SID entsteht **automatisch** bei der Kontoerstellung und wird **nie wiederverwendet**.
- **Autorisierung erfolgt über die SID**, nicht über den Namen: Ein gelöschtes und gleichnamig neu angelegtes Konto hat eine **neue SID** und damit **keine** alten Rechte. Eine umbenannte Person behält ihre Rechte.
- Bekannte SIDs: `S-1-1-0` Jeder, `S-1-5-11` Authentifizierte Benutzer, `…-500` Administrator, `…-512` Domänen-Admins. Anzeigen: `whoami /user`, `whoami /groups`.

### Zugriffssteuerungslisten
Jede Ressource (Ordner, Datei, Freigabe, Drucker, AD-Objekt) hat eine **ACL** (Access Control List, genauer DACL). Sie besteht aus **ACEs** (Access Control Entries) mit: **SID**, **Berechtigung**, **Vererbungsinformationen**, **Zulassen oder Verweigern**.
**Ablauf des Zugriffs**: Bei der Anmeldung erhält der Benutzer ein **Zugriffstoken** mit seiner SID und den SIDs **aller Gruppen**, in denen er Mitglied ist. Beim Zugriff vergleicht Windows das Token mit der ACL der Ressource. **Gruppenänderungen wirken daher erst nach erneuter Anmeldung** (neues Token).

**Grundregeln**:
1. Berechtigungen sind **kumulativ** – die Rechte aus allen Gruppen und dem Benutzerkonto werden addiert.
2. **Verweigern hat Vorrang vor Zulassen** (bei gleicher Ebene).
3. Wer in keinem ACE vorkommt, hat **keinen** Zugriff (implizites Verweigern).

### Freigaben
**Freigaben** machen einen **Ordner mit seinem gesamten Inhalt über das Netzwerk** (SMB, TCP 445) zugänglich. Zugriff über den **UNC-Pfad** `\\Server\Freigabename`.
- **Nur Ordner** können freigegeben werden, **keine einzelnen Dateien**.
- **Standardberechtigung**: **Jeder – Lesen**.
- Beim **Kopieren** des Ordners geht die Freigabe verloren (sie hängt am Originalpfad).
- Ein **$ am Ende** des Namens **versteckt** die Freigabe in der Netzwerkumgebung – der Zugriff über den UNC-Pfad ist trotzdem möglich (kein Sicherheitsmerkmal!).
- **Administrative Freigaben**: `C$`, `ADMIN$` (Windows-Ordner), `IPC$`; auf DCs zusätzlich `SYSVOL` und `NETLOGON`.

**Freigabeberechtigungen**
| Berechtigung | erlaubt |
|---|---|
| **Lesen** | Datei-/Ordnernamen anzeigen, Dateien und Attribute anzeigen, Programme ausführen |
| **Ändern** | alles aus Lesen + Dateien/Ordner anlegen, Daten ändern, löschen |
| **Vollzugriff** | alles aus Ändern + **Berechtigungen ändern** (und Besitz übernehmen) |
- Können an alle Sicherheitsprinzipale vergeben werden, sind **kumulativ** und stellen die **maximale Berechtigung über das Netzwerk** dar.
- Sie wirken **nur beim Zugriff über das Netzwerk** – **lokal** angemeldete Benutzer (oder per RDP) unterliegen nur den **NTFS-Berechtigungen**.

### Zusammenspiel Freigabe + NTFS
Beim Netzwerkzugriff werden **beide** geprüft; es gilt die **restriktivere** der beiden **effektiven** Berechtigungen:
1. Effektive **Freigabe**berechtigung ermitteln (kumuliert, Verweigern beachten).
2. Effektive **NTFS**-Berechtigung ermitteln (kumuliert, Vererbung, Verweigern beachten).
3. **Das Strengere gewinnt** (Schnittmenge).
Praxis-Best-Practice: Freigabe **„Authentifizierte Benutzer – Vollzugriff“** (bzw. Ändern), die eigentliche Steuerung **nur über NTFS** (eine Stelle, feiner, gilt auch lokal).

**Beispiel**: Freigabe: Jeder – Lesen · NTFS: Vertrieb – Ändern → Vertrieb darf übers Netz nur **lesen**. Freigabe: Jeder – Vollzugriff · NTFS: Vertrieb – Lesen → nur **lesen**.

### Arbeitsgruppe vs. Domäne
In einer **Arbeitsgruppe** hat jeder Rechner seine **eigene lokale Benutzerdatenbank (SAM)**. Um auf eine Freigabe zuzugreifen, muss das Konto **auf dem freigebenden Rechner** existieren (gleicher Name + gleiches Kennwort ermöglicht „Durchreichen“, sonst Anmeldedialog). In einer **Domäne** gibt es zentrale Konten im AD – einmal anlegen, überall nutzbar.

## Lab
**Maschinen**: CL01 (freigebender Rechner, Windows 11 – in der Schulunterlage Win7-1) und CL02 (zugreifender Rechner – Win7-2), Arbeitsgruppe, gleiches Netz.

### GUI
1. **Beide**: gegenseitig `ping` (ICMP-Regel aktiv).
2. **CL01**: `lusrmgr.msc` → Benutzer → Neuer Benutzer: **wbrandt** (Willy Brandt), **hkohl** (Helmut Kohl), **wscheel** (Walter Scheel) – Kennwort, „Benutzer muss Kennwort ändern“ abwählen.
3. **CL01**: Gruppen → Neue Gruppe **G_Vollzugriff** (Mitglieder: wbrandt, hkohl) und **G_Lesen** (hkohl, wscheel).
4. **CL01**: Ordner `C:\Zugriffstest` → Eigenschaften → **Freigabe** → **Erweiterte Freigabe** → „Diesen Ordner freigeben“ → **Berechtigungen** → **Jeder entfernen** → G_Vollzugriff **Vollzugriff**, G_Lesen **Lesen** → OK.
5. **CL01**: Registerkarte **Sicherheit** → Bearbeiten → **Benutzer** → **Vollzugriff** (nur Übung: damit NTFS nicht stört) → Dialog schließen!
6. **CL01**: in `C:\Zugriffstest` eine Textdatei anlegen.
7. **CL02**: als lokaler Admin „superman“ anmelden → `\\CL01\Zugriffstest` → Zugriff verweigert/Anmeldedialog, weil „superman“ auf CL01 nicht existiert → auf CL01 **superman mit gleichem Kennwort** anlegen.
8. **CL02**: nacheinander als wbrandt, hkohl, wscheel (Konten auch auf CL02 anlegen oder im Anmeldedialog `CL01\wscheel` verwenden) → Datei öffnen, anlegen, löschen → Ergebnisse dokumentieren.
9. **CL01**: Freigabe → **Jeder – Vollzugriff** hinzufügen → **CL02** als wscheel testen.
10. **CL01**: Freigabeberechtigungen → wscheel hinzufügen → **Lesen: Verweigern** → **CL02** testen.
11. **CL01**: lokal als wscheel anmelden → `C:\Zugriffstest` und die Textdatei öffnen/ändern.

### PowerShell
```powershell
# Auf CL01 – Benutzer und Gruppen
$pw = Read-Host "Kennwort" -AsSecureString
"wbrandt","hkohl","wscheel","superman" | ForEach-Object { New-LocalUser -Name $_ -Password $pw -PasswordNeverExpires }
New-LocalGroup G_Vollzugriff; New-LocalGroup G_Lesen
Add-LocalGroupMember G_Vollzugriff -Member wbrandt, hkohl
Add-LocalGroupMember G_Lesen -Member hkohl, wscheel

# Auf CL01 – Ordner, Freigabe, NTFS
New-Item C:\Zugriffstest -ItemType Directory
New-SmbShare -Name Zugriffstest -Path C:\Zugriffstest -FullAccess G_Vollzugriff -ReadAccess G_Lesen
icacls C:\Zugriffstest /grant "Benutzer:(OI)(CI)F"
Get-SmbShareAccess -Name Zugriffstest

# Schritt 9 und 10
Grant-SmbShareAccess -Name Zugriffstest -AccountName Jeder -AccessRight Full -Force
Block-SmbShareAccess -Name Zugriffstest -AccountName wscheel -Force   # Verweigern

# Auf CL02 – Zugriff testen
net use Z: \\CL01\Zugriffstest /user:CL01\wscheel *
Get-ChildItem Z:\
New-Item Z:\test-scheel.txt
net use Z: /delete
```

## Übungen
- A: Rechte von Willy Brandt über das Netzwerk (Schritt 10) | L: Vollzugriff (über G_Vollzugriff)
- A: Rechte von Helmut Kohl | L: Vollzugriff – Rechte sind kumulativ (G_Vollzugriff + G_Lesen)
- A: Rechte von Walter Scheel | L: Nur Lesen (G_Lesen)
- A: Scheel nach Hinzufügen „Jeder – Vollzugriff“ | L: Vollzugriff – Jeder ist kumulativ mit G_Lesen
- A: Scheel nach „Lesen verweigern“ | L: Kein Zugriff – Verweigern hat Vorrang
- A: Scheel lokal an CL01 auf den Ordner | L: Vollzugriff – Freigabeberechtigungen gelten lokal nicht, nur NTFS (Benutzer: Vollzugriff)
- A: Scheel lokal an CL01 auf die Textdatei | L: Vollzugriff – geerbt aus NTFS
- A: Warum konnte „superman“ zunächst nicht zugreifen? | L: In der Arbeitsgruppe existierte das Konto nicht auf CL01

## Einfach

Stell dir einen **Schrank im Klassenzimmer** vor (ein Ordner), den du für andere **freigibst**.

**SID** ist wie deine **Schülerausweis-Nummer**. Der Lehrer schaut nicht auf deinen Namen, sondern auf die Nummer. Wenn jemand mit **gleichem Namen** neu an die Schule kommt, bekommt er eine **neue Nummer** – und darf nicht an deinen Schrank.

**Die ACL** ist die **Liste am Schrank**: „Anna darf reinschauen. Die Gruppe Mathe-AG darf Sachen reinlegen. Tim darf gar nicht.“

**Drei goldene Regeln**:
1. **Rechte addieren sich**: Bist du in zwei Gruppen, bekommst du die Rechte von beiden zusammen.
2. **Verbot schlägt Erlaubnis**: Steht irgendwo „Tim: verboten“, hilft Tim keine andere Erlaubnis.
3. **Wer nicht auf der Liste steht, darf nicht.**

**Freigabe + NTFS = zwei Türen hintereinander**:
- Die **Freigabe** ist die **Klassenzimmertür** (gilt nur, wenn du von draußen, übers Netzwerk, kommst).
- **NTFS** ist das **Schloss am Schrank** (gilt immer, auch wenn du schon im Raum sitzt).
Du kommst nur so weit, wie **die strengere Tür** dich lässt. Deshalb macht man in der Praxis die Klassenzimmertür weit auf und regelt alles am Schrankschloss – dann gibt es nur eine Stelle, an der man aufpassen muss.

**Versteckte Freigabe ($)**: Ein Schrank ohne Namensschild – man sieht ihn nicht in der Liste, aber wer den genauen Namen kennt, findet ihn trotzdem. Kein echter Schutz!

**Neue Gruppe? Neu anmelden!** Deinen Ausweis mit allen Gruppen bekommst du beim Anmelden. Wirst du danach in eine Gruppe aufgenommen, steht das erst auf dem **neuen Ausweis** – also abmelden und neu anmelden.

## Merksatz
- **Kumulativ – Verweigern gewinnt – nicht gelistet = kein Zugriff**.
- Freigabe **Lesen < Ändern < Vollzugriff**.
- Netzwerkzugriff: **das Strengere aus Freigabe und NTFS**.
- Lokal zählt **nur NTFS**.
- Gruppenänderung → **neu anmelden** (Token).

## Prüfungsfalle
- Freigaberechte gelten nicht bei lokalem Zugriff/RDP.
- Dateien können nicht einzeln freigegeben werden.
- $-Freigaben sind nur versteckt, nicht geschützt.
- Standard-Freigabeberechtigung ist nur „Jeder – Lesen“ → Schreiben scheitert trotz NTFS-Ändern.
- Neu angelegtes Konto mit gleichem Namen hat andere SID → keine alten Rechte.

## Grafik
### Zwei Türen
Ein Benutzer läuft übers Netzwerk zur Freigabe-Tür (Filter 1), dann zur NTFS-Tür (Filter 2); jede Tür zeigt die ermittelten Rechte; am Ende gilt die schmalere Öffnung. Umschalter „lokal angemeldet“: die erste Tür verschwindet.

### Zugriffstoken
Benutzer meldet sich an, bekommt einen Ausweis mit seiner SID und Gruppen-SIDs; am Ordner wird die ACL Zeile für Zeile verglichen; ein Verweigern-ACE leuchtet rot und stoppt alles.

### Rechte-Rechner (interaktiv)
Benutzer, Gruppen, Freigabe- und NTFS-Rechte auswählen → effektive Berechtigung mit Rechenweg.

## Karteikarten
- F: Was ist ein Sicherheitsprinzipal? | A: Ein authentifizierbares Konto (Benutzer, Gruppe, Computer), dem Rechte zugewiesen werden.
- F: Was ist eine SID? | A: Security Identifier – eindeutige, nie wiederverwendete Kennung eines Sicherheitsprinzipals.
- F: Woraus besteht ein ACE? | A: SID, Berechtigung, Vererbungsinformation, Zulassen/Verweigern.
- F: Drei Grundregeln für Berechtigungen? | A: Kumulativ; Verweigern hat Vorrang; nicht gelistet = kein Zugriff.
- F: Standard-Freigabeberechtigung? | A: Jeder – Lesen.
- F: Drei Freigabeberechtigungen? | A: Lesen, Ändern, Vollzugriff.
- F: Wie versteckt man eine Freigabe? | A: $ an den Freigabenamen anhängen (Zugriff per UNC weiterhin möglich).
- F: Welche Rechte gelten beim Netzwerkzugriff? | A: Die restriktivere Kombination aus effektiver Freigabe- und NTFS-Berechtigung.
- F: Gelten Freigaberechte lokal? | A: Nein, lokal nur NTFS.
- F: Warum wirkt eine neue Gruppenmitgliedschaft nicht sofort? | A: Das Zugriffstoken wird bei der Anmeldung erstellt – neu anmelden.
- F: Port von SMB? | A: TCP 445.
- F: Best Practice für Freigabeberechtigungen? | A: Authentifizierte Benutzer Vollzugriff/Ändern, Steuerung über NTFS.

## Quiz
? Freigabe: Jeder – Lesen. NTFS: Vertrieb – Ändern. Welche Rechte hat ein Vertriebsmitarbeiter über das Netzwerk?
* Lesen
- Ändern
- Vollzugriff
- Kein Zugriff

? Ein Benutzer ist in Gruppe A (Lesen) und Gruppe B (Ändern). Welche Freigabeberechtigung hat er?
* Ändern
- Lesen
- Kein Zugriff
- Vollzugriff

? Welche Aussage zu versteckten Freigaben (Name$) ist richtig?
* Sie erscheinen nicht in der Netzwerkansicht, sind per UNC-Pfad aber erreichbar
- Sie sind verschlüsselt
- Nur Administratoren können darauf zugreifen
- Sie funktionieren nur lokal

? Ein Benutzer hat über eine Gruppe „Lesen – Zulassen“ und über eine andere „Lesen – Verweigern“. Ergebnis?
* Kein Lesezugriff
- Lesezugriff
- Vollzugriff
- Nur Auflisten

? Ein Konto „mmeier“ wurde gelöscht und neu angelegt. Warum fehlen die alten Rechte?
* Das neue Konto hat eine neue SID
- Der Name ist falsch geschrieben
- Die Freigabe wurde gelöscht
- NTFS speichert nur Namen
