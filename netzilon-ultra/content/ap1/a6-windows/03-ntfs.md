---
id: ap1-a6-ntfs
bereich: AP1
block: A6
kapitel: Windows Server
titel: NTFS-Berechtigungen, Vererbung & Besitz
stufe: Fortgeschritten
quellen: [08-02-folien-ntfs-Berechtigungen.pdf, 08-02-uebung-ntfs-Berechtigungen.pdf]
verweise: [ap1-a6-freigaben, ap1-a6-gruppen, ap1-a2-dateisysteme, az800-fsrm]
---

## Profi

### Standardberechtigungen
NTFS-Berechtigungen gelten **immer** – lokal und über das Netzwerk. Sie werden auf der Registerkarte **Sicherheit** vergeben.

**Dateiberechtigungen**
| Berechtigung | erlaubt |
|---|---|
| **Lesen** | Datei lesen, Attribute, Besitzer und Berechtigungen anzeigen |
| **Schreiben** | Datei überschreiben, Attribute ändern, Besitzer/Berechtigungen anzeigen |
| **Lesen, Ausführen** | Programme ausführen + Lesen |
| **Ändern** | Ändern und **Löschen** der Datei + Schreiben + Lesen/Ausführen |
| **Vollzugriff** | zusätzlich **Berechtigungen ändern** und **Besitz übernehmen** |

**Ordnerberechtigungen**
| Berechtigung | erlaubt |
|---|---|
| **Ordnerinhalt anzeigen** | Namen von Dateien und Unterordnern anzeigen |
| **Lesen** | Dateien/Unterordner, Attribute, Besitzer, Berechtigungen anzeigen |
| **Schreiben** | neue Dateien und Unterordner **erstellen**, Attribute ändern |
| **Lesen, Ausführen** | Ordner durchsuchen (durchqueren) + Lesen + Inhalt anzeigen |
| **Ändern** | Ordner **löschen** + Schreiben + Lesen/Ausführen |
| **Vollzugriff** | Berechtigungen ändern, Besitz übernehmen, alles andere (inkl. „Unterordner und Dateien löschen“) |
Hinter den Standardrechten stehen **13 spezielle (erweiterte) Berechtigungen** (z. B. „Ordner durchsuchen/Datei ausführen“, „Dateien erstellen/Daten schreiben“, „Löschen“, „Berechtigungen lesen/ändern“, „Besitz übernehmen“) – sichtbar unter **Erweitert**.

### Vererbung
- Standardmäßig **erben** Ordner und Dateien die Berechtigungen des **direkt übergeordneten** Ordners. Geerbte Einträge erscheinen **grau** (abgeblendet) und **können am Unterobjekt nicht geändert** werden.
- **Explizite** Berechtigungen (direkt am Objekt) können **zusätzlich** vergeben werden: weitere Rechte hinzufügen oder geerbte Rechte **verweigern**.
- **Explizite Berechtigungen haben Vorrang vor geerbten** – auch ein **explizites Zulassen schlägt ein geerbtes Verweigern**.

**Rangfolge** (von stark nach schwach):
1. Explizites Verweigern
2. Explizites Zulassen
3. Geerbtes Verweigern
4. Geerbtes Zulassen
(Geerbte Einträge vom näheren Elternordner haben Vorrang vor weiter entfernten.)

### Vererbung deaktivieren / aktivieren
Unter **Sicherheit → Erweitert → „Vererbung deaktivieren“** (früher Haken „Berechtigungen übergeordneter Objekte, sofern vererbbar, … einschließen“):
- **„Vererbte Berechtigungen in explizite Berechtigungen konvertieren“ (Kopieren)**: geerbte Rechte bleiben als **explizite** Einträge erhalten und können nun bearbeitet werden.
- **„Alle vererbten Berechtigungen entfernen“**: geerbte Rechte verschwinden, die ACL muss **komplett neu aufgebaut** werden (Vorsicht: SYSTEM/Administratoren nicht vergessen!).
Danach wirken sich Änderungen am übergeordneten Ordner **nicht mehr** aus.

**Vererbung wieder aktivieren**:
- **Vom Unterordner aus** („Vererbung aktivieren“): Rechte des Elternordners werden wieder übernommen – **explizit hinzugefügte Rechte bleiben erhalten** (kumulativ).
- **Vom übergeordneten Ordner aus** („**Alle Berechtigungseinträge für untergeordnete Objekte durch vererbbare Berechtigungseinträge von diesem Objekt ersetzen**“): Die Rechte werden nach unten **durchgesetzt**, **explizite Rechte der Unterobjekte gehen verloren** und die Vererbung wird überall wieder eingeschaltet.

**Gültigkeitsbereich** eines ACE („Anwenden auf“): nur dieser Ordner; dieser Ordner, Unterordner und Dateien (Standard); nur Unterordner; nur Dateien … (in icacls: `(OI)` Object Inherit = Dateien, `(CI)` Container Inherit = Ordner, `(IO)` Inherit Only).

### Kopieren und Verschieben
| Vorgang | Rechte |
|---|---|
| **Kopieren** (egal wohin) | Kopie ist ein **neues Objekt** → **erbt die Rechte des Zielordners**; der Kopierende wird **Besitzer** |
| **Verschieben innerhalb derselben Partition** | Objekt wird nur umgehängt → **behält seine expliziten Rechte** (Explorer passt geerbte Einträge an das neue Elternobjekt an) |
| **Verschieben auf eine andere Partition** | ist intern Kopieren + Löschen → **erbt die Rechte des Zielordners** |
| Kopieren/Verschieben auf **FAT** | alle NTFS-Rechte gehen verloren |
Rechte beim Kopieren erhalten: `robocopy Quelle Ziel /COPYALL` bzw. `/SEC`.

### Effektive Berechtigungen
Unter **Erweitert → Effektiver Zugriff** lässt sich für einen Benutzer/eine Gruppe (optional mit Gerät, Freigabe) berechnen, welche Rechte **tatsächlich** gelten – berücksichtigt Gruppenmitgliedschaften, Vererbung, Verweigern und (ab Server 2012) auch **Freigabeberechtigungen**, wenn der Zugriff über die Freigabe geprüft wird. In älteren Versionen zeigte die Registerkarte nur die NTFS-Sicht – für die Praxis bedeutet das: **Freigabe und NTFS immer gemeinsam betrachten**.

### Besitzer
- Jedes Objekt hat einen **Besitzer** (standardmäßig der **Ersteller**; bei Administratoren oft die Gruppe Administratoren).
- Der Besitzer darf **immer die Berechtigungen ändern** – auch wenn er selbst in der ACL gar nicht steht („CREATOR OWNER“-Effekt).
- **Administratoren** haben das Recht **„Besitz übernehmen“** – damit kommen sie auch an Ordner, aus denen sie ausgesperrt wurden: erst **Besitz übernehmen**, dann Berechtigungen setzen. Der Besitz kann nicht verschenkt, nur übernommen (oder mit Recht „Dateien/Verzeichnisse wiederherstellen“ gesetzt) werden.

### Praxis-Empfehlungen
- Rechte **nur an Gruppen** vergeben, nie an einzelne Benutzer (→ AGDLP).
- Möglichst **oben** vergeben und vererben lassen; Vererbung nur gezielt unterbrechen.
- **Verweigern sparsam** einsetzen (schwer nachvollziehbar) – lieber gar nicht erlauben.
- Nach dem Prinzip der **minimalen Rechte** (Least Privilege): meist „Ändern“ statt „Vollzugriff“ für Benutzer.
- **SYSTEM** und **Administratoren** immer Vollzugriff lassen (Backup, Virenscanner).
- **Access-Based Enumeration** (ABE) an der Freigabe aktivieren: Benutzer sehen nur Ordner, auf die sie Zugriff haben.

## Lab
**Maschinen**: SRV01 (Windows Server, in der Unterlage „2012-Maschine“) und CL01 (Client, „Win7“). Benutzer wscheel und hkohl existieren (auf SRV01 bzw. in der Domäne).

### GUI
1. **SRV01**: `C:\ntfs-test` anlegen → Freigabe `ntfs-test` → **Jeder – Vollzugriff**.
2. **SRV01**: Registerkarte **Sicherheit** ansehen → Einträge grau = **geerbt von C:\**.
3. Unterordner `C:\ntfs-test\vererbung` anlegen.
4. `ntfs-test` → Sicherheit → Bearbeiten → **wscheel – Ändern** → im Ordner `vererbung` erscheint wscheel geerbt (grau).
5. **CL01** (als wscheel): `\\SRV01\ntfs-test` → in beiden Ordnern Dateien/Ordner anlegen, bearbeiten, löschen ✔ – Berechtigungen von `vererbung` ändern ✘.
6. **SRV01**: `vererbung` → geerbten Eintrag ändern ✘ (grau) → stattdessen **Hinzufügen** → wscheel → **Schreiben: Verweigern** (explizit).
7. **CL01**: in `ntfs-test` schreiben ✔, in `vererbung` ✘.
8. **SRV01**: `vererbung` → Erweitert → **Vererbung deaktivieren** → **„In explizite Berechtigungen konvertieren“**.
9. **SRV01**: Schreiben-Verweigern entfernen, wscheel **Schreiben – Zulassen**, **Ändern** entfernen → **CL01**: schreiben ✔, Ordner `vererbung` löschen ✘ (fehlendes Löschrecht, Besitzer ist Administrator).
10. **SRV01**: hkohl zur ACL von `ntfs-test` hinzufügen → `vererbung` unverändert (Vererbung aus).
11. **SRV01**: `vererbung` → Vererbung aktivieren → hkohl erscheint; wscheel Schreiben verweigern; Vererbung wieder deaktivieren (kopieren).
12. **SRV01**: `ntfs-test` → Erweitert → Haken **„Alle Berechtigungseinträge für untergeordnete Objekte … ersetzen“** → `vererbung`: das explizite Verweigern für wscheel ist **weg**.
13. `C:\kopieren` und `C:\verschieben` anlegen → `vererbung` nach `kopieren` **kopieren** → ACL vergleichen (Kopie erbt von `C:\kopieren`) → Original nach `verschieben` **verschieben** → wscheel steht weiterhin in der ACL.
14. **Effektiver Zugriff**: `vererbung` → Erweitert → Effektiver Zugriff → Benutzer auswählen → wscheel anzeigen; ebenso hkohl an `ntfs-test`.
15. Freigabeberechtigung von `ntfs-test` auf „Jeder – Lesen“ ändern → effektiven Zugriff erneut prüfen (Option „Freigabe einbeziehen“) → wieder Vollzugriff setzen, `vererbung` zurückverschieben.
16. **CL01** (wscheel): in `vererbung` Ordner **scheel** anlegen → Vererbung deaktivieren und **alle** entfernen → nur wscheel Vollzugriff.
17. **SRV01** (Administrator): Ordner `scheel` öffnen ✘ → Erweitert → **Besitzer: Ändern** → Administratoren → „Besitzer der Objekte und untergeordneten Container ersetzen“ → danach **Administratoren – Vollzugriff** hinzufügen.

### PowerShell / icacls
```powershell
# Auf SRV01
New-Item C:\ntfs-test\vererbung -ItemType Directory -Force
New-SmbShare -Name ntfs-test -Path C:\ntfs-test -FullAccess Jeder

icacls C:\ntfs-test /grant "wscheel:(OI)(CI)M"            # Ändern, vererbbar
icacls C:\ntfs-test\vererbung                               # (I) = geerbt
icacls C:\ntfs-test\vererbung /deny "wscheel:(OI)(CI)W"     # explizit Schreiben verweigern
icacls C:\ntfs-test\vererbung /inheritance:d                # Vererbung aus, Rechte kopieren
icacls C:\ntfs-test\vererbung /inheritance:r                # Vererbung aus, geerbte entfernen
icacls C:\ntfs-test\vererbung /inheritance:e                # Vererbung wieder an
icacls C:\ntfs-test\* /reset /T                             # Unterobjekte auf Vererbung zurücksetzen (wie „ersetzen“)
icacls C:\ntfs-test\vererbung /remove:d wscheel             # Verweigern-Eintrag entfernen

# Besitz übernehmen und Admins berechtigen
takeown /F C:\ntfs-test\vererbung\scheel /R /A
icacls C:\ntfs-test\vererbung\scheel /grant "Administratoren:(OI)(CI)F" /T

# PowerShell-Sicht
Get-Acl C:\ntfs-test\vererbung | Format-List Owner, AccessToString
# Kopieren mit Rechten
robocopy C:\ntfs-test\vererbung C:\kopieren\vererbung /E /COPYALL
```
Rechte-Kürzel icacls: **F** Vollzugriff, **M** Ändern, **RX** Lesen/Ausführen, **R** Lesen, **W** Schreiben, **D** Löschen.

## Übungen
- A: Woran erkennt man geerbte Berechtigungen? | L: Einträge sind abgeblendet (grau) und stammen vom übergeordneten Objekt; in icacls mit (I) markiert
- A: Warum kann wscheel in ntfs-test schreiben, in vererbung aber nicht (Schritt 8)? | L: Explizites Schreiben-Verweigern an vererbung hat Vorrang vor dem geerbten Ändern
- A: Warum kann wscheel vererbung nicht löschen, obwohl er schreiben darf? | L: Schreiben erlaubt kein Löschen; Löschen gehört zu Ändern; er ist nicht Besitzer
- A: Vererbung vom Unterordner vs. vom Elternordner aktivieren | L: Unterordner: kumulativ, explizite Rechte bleiben. Elternordner („ersetzen“): setzt die Rechte durch, explizite Rechte der Unterobjekte gehen verloren
- A: Kopieren vs. Verschieben (gleiche Partition) | L: Kopie erbt die Rechte des Ziels; Verschiebung behält ihre expliziten Rechte
- A: Bedeutung für die Praxis, wenn der effektive Zugriff die Freigabe nicht berücksichtigt | L: Freigabe- und NTFS-Rechte müssen immer zusammen geprüft werden; am besten Freigabe offen, Steuerung per NTFS
- A: Warum kann der Administrator nicht auf den Ordner „scheel“ zugreifen, und was muss er tun? | L: Er steht nicht in der ACL; er muss zuerst den Besitz übernehmen, danach kann er sich Rechte geben

## Einfach

NTFS-Rechte sind die **Schlösser an jedem Schrank und jeder Schublade** – sie gelten immer, egal ob du im Raum sitzt oder von draußen kommst.

**Vererbung** ist wie **Hausregeln in einer Familie**: Was die Eltern (der obere Ordner) festlegen, gilt automatisch für alle Kinder (Unterordner). Die Kinder können die Regeln der Eltern **nicht einfach umschreiben** (grau), aber sie können **eigene Zusatzregeln** haben: „Bei mir im Zimmer darfst du nicht schreiben!“ – und die eigene Regel ist **stärker** als die geerbte.

**Vererbung abschalten** ist wie **ausziehen**:
- **Kopieren**: Du nimmst eine **Abschrift der Hausregeln** mit in deine Wohnung und darfst sie jetzt selbst ändern.
- **Entfernen**: Du ziehst ohne Regeln aus und musst **alles neu festlegen** – vergisst du, dir selbst einen Schlüssel zu geben, stehst du draußen!

**Kopieren vs. Verschieben**:
- Eine **Kopie** ist ein **neues Kind** im neuen Haus – es lernt die Regeln des neuen Hauses.
- **Verschieben** im selben Haus: Das Kind zieht nur ins Nachbarzimmer und **behält seine eigenen Regeln**.

**Besitzer** ist wie der **Eigentümer** eines Schranks: Er darf immer bestimmen, wer den Schlüssel bekommt. Der **Admin** ist wie der **Hausmeister mit Generalschlüssel-Recht**: Wurde er ausgesperrt, erklärt er sich zum Besitzer – und dann darf er wieder bestimmen.

## Merksatz
- **Explizit schlägt geerbt**, Verweigern schlägt Zulassen (auf gleicher Stufe).
- **Kopieren = erbt vom Ziel**, **Verschieben (gleiche Partition) = behält**.
- Vererbung aus: **Kopieren** (behalten) oder **Entfernen** (neu aufbauen).
- Unterordner aktiviert = **kumulativ**, Elternordner „ersetzen“ = **durchsetzen**.
- Ausgesperrt? **Besitz übernehmen**, dann Rechte setzen.

## Prüfungsfalle
- Explizites Zulassen schlägt **geerbtes** Verweigern.
- „Schreiben“ erlaubt kein Löschen – dafür „Ändern“.
- Verschieben auf eine **andere** Partition verhält sich wie Kopieren.
- Beim Entfernen der Vererbung SYSTEM/Administratoren vergessen → niemand kommt mehr ran.
- Effektive Berechtigungen immer mit Freigaberechten kombinieren.

## Grafik
### Familienbaum der Rechte
Ordnerbaum; Rechte fließen als farbige Tropfen von oben nach unten; ein expliziter roter Verweigern-Stempel an einem Unterordner stoppt den Tropfen. Knöpfe: „Vererbung aus (kopieren)“ friert die Tropfen als eigene Farben ein; „ersetzen“ spült alle Unterordner neu.

### Kopieren vs. Verschieben
Ordner mit Schloss-Symbol wird kopiert (neues Schloss in Zielfarbe) bzw. verschoben (behält sein Schloss).

### Rangfolge-Treppe
Vier Stufen: explizit verweigern, explizit zulassen, geerbt verweigern, geerbt zulassen; ein Benutzer mit mehreren Einträgen läuft die Treppe hinunter, bis ein Eintrag greift.

### Besitz übernehmen
Admin steht vor verschlossenem Ordner, drückt „Besitz übernehmen“, bekommt eine Krone, danach kann er sich einen Schlüssel geben.

## Karteikarten
- F: Unterschied Schreiben und Ändern (NTFS)? | A: Ändern enthält zusätzlich Löschen sowie Lesen/Ausführen.
- F: Was erlaubt nur Vollzugriff? | A: Berechtigungen ändern und Besitz übernehmen.
- F: Kann man geerbte Berechtigungen am Unterordner direkt ändern? | A: Nein – nur explizite Einträge hinzufügen oder Vererbung deaktivieren.
- F: Rangfolge von Berechtigungen? | A: Explizit verweigern > explizit zulassen > geerbt verweigern > geerbt zulassen.
- F: Zwei Optionen beim Deaktivieren der Vererbung? | A: In explizite Rechte konvertieren (kopieren) oder alle geerbten entfernen.
- F: Welche Rechte erhält eine kopierte Datei? | A: Die des Zielordners (neues Objekt).
- F: Welche Rechte behält ein verschobener Ordner auf derselben Partition? | A: Seine expliziten Rechte.
- F: Wer darf immer die Rechte eines Objekts ändern? | A: Der Besitzer.
- F: Wie verschafft sich ein Admin Zugriff auf einen gesperrten Ordner? | A: Besitz übernehmen (takeown), dann Rechte setzen.
- F: icacls-Kürzel M und F? | A: M = Ändern, F = Vollzugriff.
- F: Was bedeuten (OI)(CI) in icacls? | A: Vererbung auf Dateien (Object Inherit) und Unterordner (Container Inherit).
- F: Was ist Access-Based Enumeration? | A: Benutzer sehen in einer Freigabe nur Ordner/Dateien, auf die sie Zugriff haben.

## Quiz
? Ein Benutzer erbt „Schreiben – Verweigern“, hat aber am Ordner explizit „Schreiben – Zulassen“. Ergebnis?
* Er darf schreiben
- Er darf nicht schreiben
- Er darf nur lesen
- Er hat Vollzugriff

? Welche NTFS-Berechtigung ist mindestens nötig, um eine Datei zu löschen?
* Ändern
- Schreiben
- Lesen, Ausführen
- Ordnerinhalt anzeigen

? Ein Ordner wird von D:\Daten nach E:\Archiv verschoben. Welche Rechte hat er danach?
* Die geerbten Rechte von E:\Archiv
- Seine bisherigen expliziten Rechte
- Keine Rechte
- Nur Rechte für Administratoren

? Was passiert bei „Alle Berechtigungseinträge für untergeordnete Objekte ersetzen“ am Elternordner?
* Die Rechte werden durchgesetzt, explizite Rechte der Unterobjekte gehen verloren
- Nur neue Unterordner erhalten die Rechte
- Die Vererbung wird deaktiviert
- Explizite Rechte der Unterobjekte bleiben erhalten

? Wie bekommt ein Administrator Zugriff auf einen Ordner, in dessen ACL er nicht steht?
* Er übernimmt den Besitz und vergibt sich dann Rechte
- Er startet den Server neu
- Er kopiert den Ordner auf den Desktop
- Er ändert die Freigabeberechtigungen

? Welche NTFS-Standardberechtigung erlaubt Lesen, Schreiben und Löschen, aber nicht das Ändern von Berechtigungen?
* Ändern
- Vollzugriff
- Lesen, Ausführen
- Schreiben
! Vollzugriff erlaubt zusätzlich Berechtigungen ändern und Besitz übernehmen.

? Ein Ordner wird innerhalb desselben NTFS-Volumes verschoben. Welche Berechtigungen hat er?
* Er behält seine expliziten Berechtigungen.
- Er übernimmt nur die Rechte des Zielordners.
- Er verliert alle Rechte.
- Er erhält Vollzugriff für Jeder.
! Beim Kopieren oder Verschieben auf ein anderes Volume werden die Rechte des Ziels geerbt.

? Welche Berechtigung gilt, wenn Freigabe- und NTFS-Rechte zusammenwirken?
* Die restriktivere von beiden
- Die großzügigere von beiden
- Immer die Freigabeberechtigung
- Immer die NTFS-Berechtigung
! Beim Zugriff über das Netzwerk werden beide geprüft.
