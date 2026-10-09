---
id: server-freigaben-ntfs-uebungen
bereich: AP1
pruefungen: [AP1, Schule]
fach: Windows Server / Basic
block: S2
kapitel: Zugriffssteuerung
titel: Freigaben und NTFS-Berechtigungen – Folien und beide Übungen komplett (GUI und PowerShell)
stufe: Einsteiger
typ: uebung
quellen: [08-01-Folien-Zugriffssteuerung.pdf, 08-01-Uebung-Freigaben-erstellen.pdf, 08-02-folien-ntfs-Berechtigungen.pdf, 08-02-uebung-ntfs-Berechtigungen.pdf]
verweise: [ap1-a6-freigaben, ap1-a6-ntfs, az800-freigaben, ap1-a6-gruppen]
---

## Profi

Theorie: **Zugriffssteuerung & Freigaben** (ap1-a6-freigaben) und **NTFS-Berechtigungen** (ap1-a6-ntfs). Hier die Folien von Herrn Schwab kompakt und beide Übungen als Lab, umgestellt von Windows 7/Server 2012 auf **Windows 11 (EXA-CL01, EXA-CL02)** und **Windows Server 2025 (EXA-SRV01)**.

### Folien 08-01 – Zugriffssteuerung
- **Sicherheitsprinzipal**: Konto, das authentifiziert werden kann (Benutzer, Gruppen, Computer). Bekommt bei der Erstellung automatisch eine eindeutige **SID**. **Autorisiert wird über die SID**, nicht über den Namen.
- Jede Ressource hat eine **ACL** aus **ACEs**: SID + Berechtigung + Vererbungsinformation + Zulassen/Verweigern. **Verweigern hat Vorrang vor Zulassen** (auf gleicher Ebene).
- Ablauf: Anmeldung → **Zugriffstoken** mit Benutzer-SID und allen Gruppen-SIDs → beim Zugriff vergleicht Windows das Token mit der ACL.
- **Freigaben**: Zugriff auf **Ordner** über das Netzwerk; **Dateien** können nicht freigegeben werden. Standard: **Jeder – Lesen**. Beim **Kopieren** des Ordners geht die Freigabe verloren. **$** am Ende versteckt die Freigabe – Zugriff per UNC (`\\EXA-SRV01\Daten$`) bleibt möglich.
- Freigabeberechtigungen: **Lesen** (Namen anzeigen, Daten/Attribute anzeigen, Programme ausführen) < **Ändern** (+ Daten ändern, Dateien/Ordner hinzufügen und löschen) < **Vollzugriff** (+ Berechtigungen ändern). Sie sind **kumulativ** und stellen die **maximale** Berechtigung über das Netz dar.
- Tipps: **„Authentifizierte Benutzer“ statt „Jeder“** (schließt Gäste/Anonymous aus), nur benötigte Rechte, **Gruppen statt Benutzer**.
- Verbinden: Netzwerk im Explorer, **Netzlaufwerk verbinden**, Ausführen (`\\server\freigabe`), Adressleiste, `net use`, `New-PSDrive`/`New-SmbMapping`.

### Folien 08-02 – NTFS-Berechtigungen
| Datei | Ordner |
|---|---|
| **Lesen**: Datei, Attribute, Besitzer, Berechtigungen lesen | **Ordnerinhalt auflisten**: Namen und Unterordner anzeigen |
| **Schreiben**: überschreiben, Attribute ändern | **Lesen**: Dateien/Unterordner, Attribute, Besitzer, Rechte anzeigen |
| **Lesen und Ausführen**: + Programme ausführen | **Schreiben**: neue Dateien/Unterordner erstellen, Attribute ändern |
| **Ändern**: + ändern und **löschen** | **Lesen und Ausführen**: + Ordner durchsuchen |
| **Vollzugriff**: + Berechtigungen ändern, **Besitz übernehmen** | **Ändern**: + Ordner löschen; **Vollzugriff**: + Rechte, Besitz |
- **Vererbung**: Rechte kommen nur vom **direkt übergeordneten** Objekt, geerbte Rechte sind grau und nicht änderbar; **explizite** Rechte können hinzugefügt werden und **haben Vorrang vor geerbten** – **explizites Zulassen schlägt geerbtes Verweigern**.
- **Vererbung deaktivieren**: **Kopieren** (geerbte werden explizit und editierbar) oder **Entfernen** (ACL komplett neu aufbauen). Danach wirken Änderungen am Elternordner nicht mehr.
- **Wieder aktivieren**: vom **Unterordner** aus → **kumulativ**, explizite Rechte bleiben; vom **Elternordner** mit „Alle Berechtigungseinträge für untergeordnete Objekte durch vererbbare Einträge ersetzen“ → setzt durch, **explizite Rechte der Unterobjekte gehen verloren**.
- **Kopieren** (gleiche oder andere Partition): Kopie **erbt vom Ziel**. **Verschieben auf andere Partition** = Kopieren + Löschen → erbt vom Ziel. **Verschieben innerhalb einer Partition**: **explizite Rechte bleiben erhalten**.
- **Besitzer**: „Ersteller-Besitzer“; Besitzer darf immer Berechtigungen ändern. **Administratoren** dürfen den **Besitz übernehmen** (Recht kann auch explizit vergeben werden).
- **Effektive Berechtigung**: kumulativ, Verweigern vor Zulassen, explizit vor geerbt, Besitzer hat Rechte-Änderungsrecht; **Freigabe und NTFS wirken zusammen restriktiv** (das Strengere gewinnt).

## Einfach

Freigabe und NTFS sind **zwei Türen hintereinander**:
1. Die **Freigabe** ist die **Haustür** – sie zählt nur, wenn du **von draußen** (übers Netzwerk) kommst.
2. **NTFS** ist das **Schloss an jedem Zimmer** – das gilt **immer**, auch wenn du schon im Haus bist (lokal angemeldet).
Du kommst nur so weit, wie die **strengere Tür** dich lässt.

In den Übungen spielst du mit drei Personen: **Willy** (nur in der Gruppe Vollzugriff), **Helmut** (in beiden Gruppen) und **Walter** (nur Lesen). Helmut bekommt **beide Rechte zusammen**, also das Bessere: Vollzugriff. Wenn du Walter aber ausdrücklich **verbietest** zu lesen, hilft ihm keine Erlaubnis mehr – **Verbot schlägt Erlaubnis**.

Bei NTFS geht es um **Erben**: Ein Unterordner übernimmt die Regeln vom Elternordner – wie Kinder die Hausregeln der Eltern. Das Kind kann **eigene strengere Zusatzregeln** haben („in meinem Zimmer darf Walter nicht schreiben“), und die gelten vor den geerbten. Sperrt sich jemand selbst so ein, dass **nicht einmal der Admin** rein darf, muss der Admin sich erst zum **Besitzer** erklären – dann darf er wieder Regeln ändern.

## Merksatz
- **Kumulativ – Verweigern gewinnt – nicht gelistet = kein Zugriff.**
- **Netz: Freigabe ∩ NTFS (das Strengere). Lokal: nur NTFS.**
- **Explizit schlägt geerbt.**
- **Kopieren erbt vom Ziel, Verschieben im Volume behält.**
- Ausgesperrt? **Besitz übernehmen**, dann Rechte setzen.

## Prüfungsfalle
- „Schreiben“ erlaubt **kein Löschen** des Ordners – dafür braucht man **Ändern** (oder Besitz).
- Neue Gruppenmitgliedschaft wirkt erst nach **Neuanmeldung** (neues Token).
- In einer **Arbeitsgruppe** gibt es keine zentrale Anmeldung: Ein Netzwerkzugriff klappt nur, wenn auf dem Freigabe-PC ein Konto mit **gleichem Namen und Kennwort** existiert (oder man sich explizit mit einem dortigen Konto anmeldet).
- Seit Server 2012 zeigt die Registerkarte **Effektiver Zugriff** bei freigegebenen Ordnern in der Spalte „Zugriff eingeschränkt durch“ auch die **Freigabe** an – das alte Fenster „Effektive Berechtigungen“ (Server 2008/Win 7) ignorierte Freigaberechte.
- „Dateirechte haben Vorrang vor Ordnerrechten“ (Folie) heißt: Explizite Rechte direkt an der Datei gelten vor den vom Ordner geerbten.

## Grafik
### Netzwerkzugriff von Walter Scheel
1. EXA-CL02 -> EXA-CL01: \\EXA-CL01\Zugriffstest mit Token von wscheel
2. EXA-CL01: Freigabe prüft G_Lesen → Lesen
3. EXA-CL01: NTFS prüft Benutzer → Vollzugriff
4. EXA-CL01: Ergebnis = strengeres Recht → Lesen
5. EXA-CL01: Freigabe ergänzt Jeder Vollzugriff → Vollzugriff
6. EXA-CL01: Lesen verweigert für wscheel → kein Zugriff

## Lab
### GUI
**Übung 08-01 – Freigaben erstellen** (EXA-CL01 und EXA-CL02, Windows 11, Arbeitsgruppe)
1. Beide VMs starten → auf EXA-CL02: `ping EXA-CL01` (ggf. Windows-Firewall: Datei- und Druckerfreigabe zulassen).
2. EXA-CL01: `lusrmgr.msc` → Benutzer **wbrandt** (Willy Brandt), **hkohl** (Helmut Kohl), **wscheel** (Walter Scheel) anlegen.
3. Gruppen **G_Vollzugriff** und **G_Lesen** anlegen → Mitglieder: wbrandt → G_Vollzugriff; hkohl → beide; wscheel → G_Lesen.
4. Ordner **C:\Zugriffstest** → Eigenschaften → **Freigabe** → **Erweiterte Freigabe** → Freigeben → **Berechtigungen**: **Jeder entfernen**, **G_Vollzugriff – Vollzugriff**, **G_Lesen – Lesen**.
5. Registerkarte **Sicherheit** → Bearbeiten → **Benutzer – Vollzugriff** (nur fürs Labor!) → Dialog **immer schließen**, bevor man testet.
6. In C:\Zugriffstest eine Textdatei anlegen.
7. EXA-CL02: als **superman** anmelden → `\\EXA-CL01\Zugriffstest` → Fehler, weil superman auf EXA-CL01 nicht existiert → auf EXA-CL01 superman mit **gleichem Kennwort** anlegen (in G_Lesen oder G_Vollzugriff) → erneut testen.
8. Nacheinander als wbrandt, hkohl, wscheel über EXA-CL02 zugreifen → Datei öffnen, neue Datei/Ordner anlegen → Ergebnisse dokumentieren.
9. EXA-CL01: Freigabe-Berechtigungen → **Jeder – Vollzugriff** hinzufügen → als wscheel testen.
10. EXA-CL01: Freigabe-Berechtigungen → **wscheel – Lesen: Verweigern** → testen.
11. Lokal an EXA-CL01 als wscheel anmelden → C:\Zugriffstest und Textdatei öffnen/ändern.

**Übung 08-02 – NTFS-Berechtigungen** (Server **EXA-SRV01**, Client **EXA-CL01**; Benutzer wscheel/hkohl als Domänenbenutzer oder lokal mit gleichem Kennwort)
12. EXA-SRV01: **C:\ntfs-test** anlegen → freigeben als **ntfs-test**, Freigabe **Jeder – Vollzugriff** → Registerkarte Sicherheit: Einträge sind **grau** = geerbt von C:\.
13. Unterordner **vererbung** anlegen → an **ntfs-test** wscheel **Ändern** geben → an vererbung erscheint wscheel geerbt.
14. EXA-CL01 als wscheel → `\\EXA-SRV01\ntfs-test` → in beiden Ordnern erstellen/bearbeiten/löschen klappt; Rechte an vererbung ändern geht nicht.
15. EXA-SRV01: an vererbung den geerbten Eintrag ändern → geht nicht → **Hinzufügen** wscheel **Schreiben: Verweigern** (explizit).
16. EXA-CL01: in ntfs-test schreiben geht, in vererbung **nicht**.
17. EXA-SRV01: vererbung → Erweitert → **Vererbung deaktivieren** → **Vererbte Berechtigungen in explizite Berechtigungen konvertieren** (kopieren).
18. Schreiben-Verweigern entfernen, wscheel **Schreiben: Zulassen**, **Ändern** entfernen → testen: schreiben geht, Ordner vererbung **löschen geht nicht** (außer wscheel ist Besitzer, weil er ihn selbst neu erstellt hat).
19. hkohl in die ACL von **ntfs-test** aufnehmen → vererbung bleibt unverändert (Vererbung ist aus).
20. vererbung → **Vererbung aktivieren** (vom Unterordner) → hkohl erscheint; wscheel Schreiben verweigern; Vererbung wieder deaktivieren (kopieren).
21. ntfs-test → Erweitert → Haken **Alle Berechtigungseinträge für untergeordnete Objekte durch vererbbare Einträge von diesem Objekt ersetzen** → vererbung: Verweigern für wscheel ist **weg**.
22. **C:\kopieren** und **C:\verschieben** anlegen → vererbung nach kopieren **kopieren** → ACL vergleichen (Kopie erbt von C:\kopieren); vererbung nach C:\verschieben **verschieben** → wscheel steht weiter in der ACL.
23. vererbung → Erweitert → **Effektiver Zugriff** → wscheel; ntfs-test → hkohl; Freigaberechte ändern und erneut prüfen; vererbung zurückverschieben.
24. EXA-CL01 als wscheel: in vererbung Ordner **scheel** anlegen → Vererbung **entfernen** → nur **wscheel – Vollzugriff**.
25. EXA-SRV01 als Administrator: Zugriff auf scheel verweigert → Erweitert → **Besitzer: Ändern** → Administratoren → „Besitzer der Objekte und untergeordneten Container ersetzen“ → danach **Administratoren – Vollzugriff** hinzufügen.

### PowerShell
```powershell
# EXA-CL01 – Uebung 08-01
New-LocalUser -Name wbrandt -FullName 'Willy Brandt'  -Password (Read-Host -AsSecureString)
New-LocalUser -Name hkohl   -FullName 'Helmut Kohl'   -Password (Read-Host -AsSecureString)
New-LocalUser -Name wscheel -FullName 'Walter Scheel' -Password (Read-Host -AsSecureString)
New-LocalGroup G_Vollzugriff; New-LocalGroup G_Lesen
Add-LocalGroupMember G_Vollzugriff -Member wbrandt, hkohl
Add-LocalGroupMember G_Lesen       -Member hkohl, wscheel
New-Item C:\Zugriffstest -ItemType Directory
New-SmbShare -Name Zugriffstest -Path C:\Zugriffstest -FullAccess G_Vollzugriff -ReadAccess G_Lesen
icacls C:\Zugriffstest /grant 'Benutzer:(OI)(CI)F'
Grant-SmbShareAccess -Name Zugriffstest -AccountName Jeder -AccessRight Full -Force     # Schritt 9
Block-SmbShareAccess -Name Zugriffstest -AccountName wscheel -Force                    # Schritt 10 (Verweigern)
Get-SmbShareAccess -Name Zugriffstest

# EXA-SRV01 – Uebung 08-02
New-Item C:\ntfs-test\vererbung -ItemType Directory -Force
New-SmbShare -Name ntfs-test -Path C:\ntfs-test -FullAccess Jeder
icacls C:\ntfs-test /grant 'EXAMPLE\wscheel:(OI)(CI)M'
icacls C:\ntfs-test\vererbung                                   # (I) = geerbt
icacls C:\ntfs-test\vererbung /deny 'EXAMPLE\wscheel:(OI)(CI)W'
icacls C:\ntfs-test\vererbung /inheritance:d                    # deaktivieren + kopieren (/inheritance:r = entfernen)
icacls C:\ntfs-test\vererbung /remove:d 'EXAMPLE\wscheel'
icacls C:\ntfs-test\vererbung /grant 'EXAMPLE\wscheel:(OI)(CI)W'
icacls C:\ntfs-test\vererbung /inheritance:e                    # Vererbung vom Unterordner aktivieren
icacls C:\ntfs-test /reset /t /c                                # wie „durch vererbbare Eintraege ersetzen“
Copy-Item C:\ntfs-test\vererbung C:\kopieren -Recurse
Move-Item C:\ntfs-test\vererbung C:\verschieben
(Get-Acl C:\verschieben\vererbung).Access | Format-Table IdentityReference, FileSystemRights, AccessControlType, IsInherited
takeown /f C:\ntfs-test\vererbung\scheel /a /r /d j            # Besitz an Administratoren
icacls C:\ntfs-test\vererbung\scheel /grant 'Administratoren:(OI)(CI)F'
```

## Übungen
- A: 08-01 Schritt 9: Warum kann superman zunächst nicht zugreifen? | L: In der Arbeitsgruppe existiert das Konto nur auf EXA-CL02; EXA-CL01 kennt es nicht. Lösung: auf EXA-CL01 gleichnamiges Konto mit gleichem Kennwort anlegen (Pass-Through) oder mit einem Konto von EXA-CL01 anmelden.
- A: 08-01 Schritt 10: Rechte von Willy Brandt über das Netz? | L: Vollzugriff (Freigabe G_Vollzugriff, NTFS Benutzer Vollzugriff).
- A: 08-01 Schritt 10: Rechte von Helmut Kohl? | L: Vollzugriff – Freigaberechte sind kumulativ (G_Vollzugriff + G_Lesen).
- A: 08-01 Schritt 10: Rechte von Walter Scheel? | L: Nur Lesen (Freigabe G_Lesen ist strenger als NTFS Vollzugriff).
- A: 08-01 Schritt 12: Scheel nach „Jeder – Vollzugriff“ auf der Freigabe? | L: Vollzugriff – Jeder ist kumulativ mit G_Lesen, NTFS erlaubt Vollzugriff.
- A: 08-01 Schritt 13: Scheel nach „Lesen verweigern“? | L: Kein Zugriff – Verweigern hat Vorrang vor allen Zulassen-Einträgen.
- A: 08-01 Schritt 14: Scheel lokal an EXA-CL01 auf den Ordner? | L: Vollzugriff – Freigabeberechtigungen gelten lokal nicht, nur NTFS (Benutzer – Vollzugriff).
- A: 08-01 Schritt 15: Scheel lokal auf die Textdatei? | L: Vollzugriff – die Datei erbt die NTFS-Rechte des Ordners.
- A: 08-02 Schritt 3: Woran erkennt man geerbte Rechte? | L: Grau/abgeblendet, Spalte „Geerbt von“ C:\, in icacls mit (I) markiert.
- A: 08-02 Schritt 8: Warum kann Scheel in ntfs-test schreiben, in vererbung nicht? | L: An vererbung steht ein explizites Schreiben-Verweigern, das Vorrang vor dem geerbten Ändern hat.
- A: 08-02 Schritt 10: Warum kann Scheel vererbung nicht löschen? | L: Schreiben erlaubt kein Löschen (das gehört zu Ändern); er ist nicht Besitzer. Hat er den Ordner selbst erstellt, ist er Besitzer (Ersteller-Besitzer) und darf löschen.
- A: 08-02 Schritt 10: Wirkt sich hkohl an ntfs-test auf vererbung aus? | L: Nein – die Vererbung an vererbung ist deaktiviert (Rechte wurden kopiert).
- A: 08-02 Schritt 13: Regel beim Wiederaktivieren der Vererbung? | L: Vom Unterordner aus kumulativ (explizite Rechte bleiben); vom Elternordner „ersetzen“ setzt durch, explizite Rechte der Unterobjekte (hier Verweigern für Scheel) gehen verloren.
- A: 08-02 Schritt 15: Kopie vs. Original? | L: Die Kopie erbt die Rechte von C:\kopieren – Scheels explizite Einträge fehlen bzw. weichen ab.
- A: 08-02 Schritt 16: Verschieben im selben Volume? | L: Die ACL (explizite Einträge, hier wscheel) bleibt erhalten.
- A: 08-02 Schritt 18: Ändert die Freigabe das Ergebnis von „Effektiver Zugriff“ und was bedeutet das? | L: Seit Server 2012 berücksichtigt „Effektiver Zugriff“ bei freigegebenen Ordnern die Freigabe (Spalte „Zugriff eingeschränkt durch: Freigabe“); früher nicht. Praxis: Freigabe- und NTFS-Rechte immer gemeinsam prüfen – am besten Freigabe weit offen (z. B. Authentifizierte Benutzer – Ändern), Steuerung per NTFS.
- A: 08-02 Schritt 19: Warum kommt der Administrator nicht in den Ordner scheel und was muss er tun? | L: Er steht nicht in der ACL (Vererbung entfernt, nur Scheel). Er muss zuerst den Besitz übernehmen (Recht der Administratoren), dann kann er sich Vollzugriff geben.

## Karteikarten
- F: Womit autorisiert Windows einen Zugriff? | A: Mit den SIDs im Zugriffstoken, verglichen mit den ACEs der ACL
- F: Standard-Freigabeberechtigung? | A: Jeder – Lesen
- F: Was bewirkt ein $ am Freigabenamen? | A: Freigabe ist in der Netzwerkansicht versteckt, per UNC aber erreichbar
- F: Geht eine Freigabe beim Kopieren des Ordners mit? | A: Nein, sie geht verloren
- F: Warum „Authentifizierte Benutzer“ statt „Jeder“? | A: Schließt Gäste und anonyme Zugriffe aus
- F: Welches NTFS-Recht erlaubt das Löschen? | A: Ändern (oder Vollzugriff)
- F: Explizites Zulassen vs. geerbtes Verweigern? | A: Explizites Zulassen gewinnt
- F: Vererbung deaktivieren – zwei Optionen? | A: Kopieren (in explizite konvertieren) oder Entfernen
- F: Was passiert beim Kopieren mit den NTFS-Rechten? | A: Die Kopie erbt die Rechte des Zielordners
- F: Wer darf den Besitz übernehmen? | A: Administratoren (bzw. wem das Recht explizit erteilt wurde)
- F: icacls-Kürzel für geerbt? | A: (I)
- F: Cmdlet für Freigabe-Verweigern? | A: Block-SmbShareAccess

## Quiz
? Helmut ist in G_Vollzugriff (Freigabe Vollzugriff) und G_Lesen (Freigabe Lesen), NTFS: Benutzer Vollzugriff. Netzwerkrecht?
* Vollzugriff
- Lesen
- Kein Zugriff
- Ändern

? Walter hat über die Freigabe nur Lesen, NTFS Vollzugriff. Was gilt lokal am Freigabe-PC?
* Vollzugriff – lokal zählt nur NTFS
- Lesen
- Kein Zugriff
- Ändern

? An einem Unterordner steht ein explizites „Schreiben verweigern“, geerbt ist „Ändern zulassen“. Ergebnis?
* Schreiben ist verweigert
- Ändern gilt, geerbt gewinnt
- Vollzugriff
- Fehler in der ACL

? Was passiert mit expliziten Rechten der Unterordner, wenn man am Elternordner „durch vererbbare Einträge ersetzen“ wählt?
* Sie gehen verloren
- Sie bleiben erhalten
- Sie werden verdoppelt
- Sie werden zu Freigaberechten

? Ein Ordner wird auf demselben NTFS-Volume verschoben. Was gilt?
* Explizite Rechte bleiben erhalten
- Er erbt nur noch vom Ziel
- Alle Rechte werden gelöscht
- Die Freigabe wird mitgenommen

? Der Administrator steht nicht in der ACL eines Benutzerordners. Was muss er zuerst tun?
* Den Besitz übernehmen
- Den Ordner verschieben
- Die Freigabe löschen
- Neu starten

? Welche Aussage zu Freigaben stimmt?
* Dateien können nicht einzeln freigegeben werden
- Freigaberechte gelten auch lokal
- Ein $ verhindert jeden Zugriff
- Standard ist „Jeder – Vollzugriff“

? Welche Berechtigung erlaubt das Schreiben in einen Ordner, aber nicht das Löschen des Ordners selbst?
* Schreiben
- Ändern
- Vollzugriff
- Besitzer

## Zuordnen
### Situation und effektives Recht
- Netz, Freigabe Lesen, NTFS Vollzugriff => Lesen
- Lokal, Freigabe Lesen, NTFS Vollzugriff => Vollzugriff
- Netz, Freigabe Vollzugriff, NTFS Lesen => Lesen
- Netz, Freigabe Verweigern Lesen => kein Zugriff

## Spickzettel
- Token-SIDs vs. ACL; Verweigern > Zulassen, explizit > geerbt
- Freigabe: Lesen < Ändern < Vollzugriff, Standard Jeder Lesen
- Netz = Freigabe ∩ NTFS, lokal = NTFS
- Vererbung aus: kopieren/entfernen; an: Unterordner kumulativ, Elternordner ersetzt
- Kopieren erbt vom Ziel, Verschieben im Volume behält
- Besitz übernehmen → Rechte setzen (takeown, icacls)
- New-SmbShare, Grant-/Block-SmbShareAccess, icacls /grant /deny /inheritance
