---
id: server-gpo-uebungen
bereich: AP1
pruefungen: [Schule, AP1, AP2]
fach: Windows Server / Basic
block: S2
kapitel: Active Directory
titel: Gruppenrichtlinien – Übungen 1 bis 4 komplett (GUI und PowerShell)
stufe: Fortgeschritten
typ: uebung
quellen: [AD-Gruppenrichtlinien.pdf, Übung_Gruppenrichtlinien1.pdf, Übung_Gruppenrichtlinien2.pdf, Übung_Gruppenrichtlinien3.pdf, Übung_Gruppenrichtlinien4.pdf]
verweise: [ap1-a6-gpo-grundlagen, ap1-a6-gpo-bereich, az800-gpo, az800-gpo-preferences, az801-ereignisprotokolle]
---

## Profi

Die Theorie zu Gruppenrichtlinien steht in **Gruppenrichtlinien – Grundlagen** (ap1-a6-gpo-grundlagen) und **GPO-Bereich, Vererbung, Loopback, RSoP** (ap1-a6-gpo-bereich). Diese Seite liefert die **vier Schulübungen als vollständiges Lab** – jede Aufgabe mit GUI-Schritten **und** PowerShell, Maschine immer angegeben – plus Auswertung.

### Gliederung der Folie „Kapitel 6 – Gruppenrichtlinieninfrastruktur“
Konfigurationsverwaltung · Richtlinien und Einstellungen (Preferences) · GPO, Gültigkeitsbereich, Client und **clientseitige Erweiterungen (CSE)** · Aktualisierung (Start, Anmeldung, alle **90 ± 30 Min.**, DCs alle 5 Min.) · Richtlinienergebnissatz (RSoP) · lokale und domänenbasierte GPOs, Speicherung (**GPC** im AD, **GPT** im **SYSVOL**) · **Administrative Vorlagen** (ADMX/ADML) und **zentraler Speicher** (SYSVOL\…\Policies\PolicyDefinitions) · verwaltete vs. nicht verwaltete Einstellungen · Verknüpfungen, **Vererbung und Rangfolge (LSDOU)** · **Sicherheitsfilterung**, **WMI-Filter**, GPO/Knoten deaktivieren · Zielgruppenadressierung · **Loopback** · Verarbeitung, langsame Verbindungen · Problembehandlung mit RSoP-Berichten, Modellierung („Was wäre wenn“) und Ereignisprotokollen.

### Was die vier Übungen trainieren
| Übung | Inhalt | Kernaussage |
|---|---|---|
| 1 | GPO **EXAMPLE-Standards** erstellen, kommentieren, Filter, Bildschirmschoner 600 s + Kennwortschutz, mit Domäne verknüpfen | Richtlinien sind **verwaltet** → im Dialog **ausgegraut** |
| 2 | OU **Ingenieure** mit Gegen-GPO (Einstellung **Deaktiviert**), **Erzwungen** an der Default Domain Policy | **Näher am Objekt gewinnt**, aber **Erzwungen schlägt alles** |
| 3 | **Sicherheitsfilterung** mit Gruppe und **Verweigern**, **Loopback** (Zusammenführen) für Vertriebslaptops | Ausnahmen per Gruppe; Benutzer-Einstellungen abhängig vom **Computer** |
| 4 | **RSoP**: Gruppenrichtlinienergebnis-Assistent, `gpresult`, Ereignisanzeige | Nachweis, **welche** GPO **warum** gewirkt hat |

## Einfach

Gruppenrichtlinien sind die **Hausordnung** der Firma. In den vier Übungen spielst du Hausmeister:
1. Du schreibst eine Regel für **alle**: „Nach 10 Minuten geht der Bildschirmschoner an und will ein Kennwort.“ Danach können die Mitarbeiter das **nicht mehr selbst ändern** – das Feld ist grau.
2. Die **Ingenieure** beschweren sich: Ihr Rechenprogramm stürzt ab, wenn der Bildschirmschoner kommt. Du hängst in ihrem Büro (OU) eine **eigene Regel** auf: „Bei uns kein Zeitlimit.“ Weil diese Regel **näher** an den Ingenieuren hängt, gewinnt sie. Für eine andere Regel sagt der Chef aber: „**Die gilt immer, egal was die Abteilung sagt**“ – das ist **Erzwungen**.
3. Statt vieler Gegenregeln machst du eine **Ausnahmeliste** (Gruppe mit „Verweigern“): Wer drauf steht, für den gilt die Regel nicht. Und für die **Vertriebs-Laptops** gilt: Egal wer sich anmeldet, das **Firmen-Hintergrundbild** wird gezeigt – der Laptop bestimmt die Benutzerregeln mit (**Loopback**).
4. Am Ende prüfst du mit dem **Beweis-Zettel** (RSoP/gpresult), welche Regeln wirklich gelten, und liest im **Logbuch** (Ereignisanzeige) nach, wann sie angewendet wurden.

## Merksatz
- **LSDOU** – später/näher gewinnt; **Erzwungen** gewinnt immer.
- **Deaktiviert** überstimmt, **Nicht konfiguriert** schweigt.
- Ausnahme = Gruppe mit **„Gruppenrichtlinie übernehmen: Verweigern“**.
- Loopback = **Computerkonfiguration**, Modus **Zusammenführen** oder **Ersetzen**.
- `gpresult /r` Zusammenfassung, `/v` ausführlich, `/z` maximal, `/h` HTML.

## Prüfungsfalle
- Wer „Authentifizierte Benutzer“ aus der **Sicherheitsfilterung** entfernt, muss unter **Delegierung** mindestens **Lesen** für die Computer (Authentifizierte Benutzer oder Domänencomputer) behalten – seit MS16-072 lesen Clients GPOs im Computerkontext, sonst wird das GPO **gar nicht** angewendet.
- Bei **Loopback + Sicherheitsfilterung** braucht **auch der angemeldete Benutzer** „Gruppenrichtlinie übernehmen“ – deshalb kommt in Übung 3 **Domänen-Benutzer** in den Filter.
- `Set-GPPermission` kann **kein Verweigern** setzen – das geht nur über die GUI (Delegierung → Erweitert) oder ein ACL-Skript.
- Übung 2 im Original ist lückenhaft (Schritte 5–6, 9–10 fehlen; die zu aktivierende Richtlinie „Beim Neustart des Computers und bei der Anmeldung immer auf das Netzwerk warten“ liegt unter **System\Anmelden**).
- Der Hintergrund-Pfad `c:\windows\web\Wallpaper\server.jpg` existiert unter Server 2025 nicht mehr standardmäßig – vorhandenes Bild verwenden (z. B. `C:\Windows\Web\Wallpaper\Windows\img0.jpg`).

## Grafik
### Rangfolge in Übung 2
1. Lokal: kein Wert
2. Domäne: EXAMPLE-Standards setzt Zeitlimit 600 s
3. OU-Ingenieure: Überschreibung setzt Zeitlimit Deaktiviert
4. Benutzer-Ingenieur: letzte Einstellung gewinnt → kein Zeitlimit
5. Default-Domain-Policy: Erzwungen → gewinnt auch gegen OU-GPOs
### Loopback Zusammenführen auf einem Vertriebslaptop
1. Laptop: Computerkonfiguration aktiviert Loopback Zusammenführen
2. Laptop -> EXA-DC01: Benutzer-GPOs des Benutzers laden
3. Laptop -> EXA-DC01: Benutzer-GPOs aus dem Bereich des Computers laden
4. Laptop: Computer-Bereich gewinnt bei Konflikt → Firmenhintergrund

## Lab
Heimlabor **example.com**, Arbeitsmaschine **EXA-DC01** (Anmeldung als EXAMPLE\Administrator). OU **Schulung** ist vorhanden (sonst anlegen). Test-Client: **EXA-CL01**.

### GUI
**Übung 1 – GPO erstellen, bearbeiten, Bereich festlegen**
1. EXA-DC01: `gpmc.msc` → Gesamtstruktur → Domänen → example.com → **Gruppenrichtlinienobjekte** → Rechtsklick **Neu** → Name **EXAMPLE-Standards**.
2. Rechtsklick → **Bearbeiten** → Stammknoten EXAMPLE-Standards → Rechtsklick **Eigenschaften** → Registerkarte **Kommentar**: „Example-Unternehmensstandardrichtlinien. Einstellungsbereich wird für alle Benutzer und Computer in der Domäne festgelegt. Verantwortlich: <Name>.“
3. Benutzerkonfiguration → Richtlinien → **Administrative Vorlagen** → Rechtsklick **Filteroptionen** → **Schlüsselwortfilter aktivieren** → „Bildschirmschoner“ → **Genau** → Filter anwenden (Rechtsklick → Filter ein).
4. Systemsteuerung → Anpassung → **Zeitlimit für Bildschirmschoner** → Hilfe lesen → **Aktiviert** → **600** Sekunden → Kommentar eintragen.
5. **Kennwortschutz für den Bildschirmschoner verwenden** → **Aktiviert** → Kommentar → Editor schließen.
6. Rechtsklick auf **example.com** → **Vorhandenes Gruppenrichtlinienobjekt verknüpfen** → EXAMPLE-Standards.
7. Test: Systemsteuerung → Darstellung → **Bildschirmschoner ändern** (Werte noch änderbar) → CMD `gpupdate /force /boot /logoff` → Dialog erneut öffnen → Wartezeit und „Anmeldeseite bei Reaktivierung“ sind **ausgegraut**.

**Übung 2 – Bereich und Erzwungen**
8. EXA-DC01: `dsa.msc` → OU Schulung → Neu → OU **Ingenieure**.
9. GPMC → Rechtsklick OU Ingenieure → **Gruppenrichtlinienobjekt hier erstellen und verknüpfen** → „Überschreibung für Ingenieuranwendung“ → Bearbeiten → Benutzerkonfiguration\Richtlinien\Administrative Vorlagen\Systemsteuerung\Anpassung → **Zeitlimit für Bildschirmschoner** → **Deaktiviert**.
10. OU Ingenieure → Registerkarte **Gruppenrichtlinienvererbung** → Überschreibung hat **Rangfolge 1**, EXAMPLE-Standards Rangfolge 2.
11. **Default Domain Policy** (DDP) → Bearbeiten → Computerkonfiguration\Richtlinien\Administrative Vorlagen\System\**Anmelden** → **Beim Neustart des Computers und bei der Anmeldung immer auf das Netzwerk warten** → Aktiviert.
12. Rechtsklick auf die **Verknüpfung** der DDP an example.com → **Erzwungen** → OU Ingenieure → Gruppenrichtlinienvererbung: DDP steht jetzt **ganz oben** (mit Schloss-Symbol).

**Übung 3 – Sicherheitsfilterung und Loopback**
13. ADUC → OU **Gruppen** → globale Sicherheitsgruppe **GPO_EXAMPLE-Standards_Ausnahmen**.
14. GPMC → Gruppenrichtlinienobjekte → „Überschreibung für Ingenieuranwendung“ **löschen**.
15. EXAMPLE-Standards → Registerkarte **Delegierung** → **Erweitert** → **Hinzufügen** → GPO_EXAMPLE-Standards_Ausnahmen → bei **Gruppenrichtlinie übernehmen** **Verweigern** → OK (Warnhinweis bestätigen).
16. Registerkarte Delegierung zeigt für die Gruppe „**Benutzerdefiniert**“; Registerkarte **Bereich** → Sicherheitsfilterung zeigt weiter **Authentifizierte Benutzer** (Verweigern wird dort nicht angezeigt).
17. ADUC → OU Gruppen → globale Gruppe **Vertriebslaptops**; OU **Clients** anlegen.
18. GPMC → Gruppenrichtlinienobjekte → Neu **Vertriebslaptopkonfiguration** → Bearbeiten → Benutzerkonfiguration\…\Desktop\**Desktop** → **Desktophintergrund** → Kommentar „Unternehmensstandardhintergrund für Vertriebslaptops“ → Feld „Unterstützt auf“ lesen → Aktiviert → Hintergrundname (Pfad zu einem vorhandenen Bild).
19. Computerkonfiguration\…\System\**Gruppenrichtlinie** → **Loopbackverarbeitungsmodus für Benutzergruppenrichtlinie** → Aktiviert → Modus **Zusammenführen**.
20. Registerkarte **Bereich** → Sicherheitsfilterung: **Authentifizierte Benutzer entfernen** → **Hinzufügen** Vertriebslaptops → **Hinzufügen** Domänen-Benutzer. Registerkarte **Delegierung** → prüfen, dass **Authentifizierte Benutzer – Lesen** vorhanden ist (sonst hinzufügen).
21. Rechtsklick OU **Clients** → **Vorhandenes GPO verknüpfen** → Vertriebslaptopkonfiguration. Laptop-Computerkonten zur Gruppe Vertriebslaptops hinzufügen (Laptop neu starten, damit das Computer-Token die Gruppe enthält).

**Übung 4 – Richtlinienergebnissatz und Ereignisse**
22. EXA-DC01: CMD `gpupdate /force /boot` → Uhrzeit notieren.
23. GPMC → Rechtsklick **Gruppenrichtlinienergebnisse** → **Gruppenrichtlinienergebnis-Assistent** → **Dieser Computer** → Bestimmten Benutzer **EXAMPLE\Administrator** → Fertig stellen.
24. Registerkarte **Zusammenfassung** → **Alle anzeigen**: letzte Aktualisierung, **zulässige und verweigerte GPOs**, verwendete Komponenten (CSEs). Registerkarte **Einstellungen** → **Alle anzeigen**: welche Einstellung aus welchem GPO (Spalte „Gewinnendes GPO“). Registerkarte **Richtlinienereignisse**: Ereignis zum gpupdate.
25. Rechtsklick auf Bericht → **Bericht speichern** → Dokumente → .html.
26. CMD: `gpresult /r`, `gpresult /v`, `gpresult /z`, `gpresult /h "%UserProfile%\Documents\RSOP.html"` → Berichte vergleichen.
27. **Ereignisanzeige** → Windows-Protokolle → **System** → Aktuelles Protokoll filtern → Quelle **Gruppenrichtlinie** (GroupPolicy). Dann **Anwendung** nach Quelle sortieren. Danach **Anwendungs- und Dienstprotokolle → Microsoft → Windows → GroupPolicy → Betriebsbereit** → erstes Ereignis zur manuellen Aktualisierung (ID **4004** Computer, **4005** Benutzer) und folgende (5312 angewendete GPOs, 5313 gefilterte GPOs, Ende 8004/8005).

### PowerShell
```powershell
# EXA-DC01 – Uebung 1
Import-Module GroupPolicy
New-GPO -Name 'EXAMPLE-Standards' -Comment 'Example-Unternehmensstandardrichtlinien. Gilt fuer alle Benutzer und Computer der Domaene.'
$key = 'HKCU\Software\Policies\Microsoft\Windows\Control Panel\Desktop'
Set-GPRegistryValue -Name 'EXAMPLE-Standards' -Key $key -ValueName ScreenSaveTimeOut -Type String -Value '600'
Set-GPRegistryValue -Name 'EXAMPLE-Standards' -Key $key -ValueName ScreenSaverIsSecure -Type String -Value '1'
New-GPLink -Name 'EXAMPLE-Standards' -Target 'DC=example,DC=com'

# EXA-DC01 – Uebung 2
New-ADOrganizationalUnit -Name Ingenieure -Path 'OU=Schulung,DC=example,DC=com'
New-GPO -Name 'Ueberschreibung fuer Ingenieuranwendung' | New-GPLink -Target 'OU=Ingenieure,OU=Schulung,DC=example,DC=com'
Set-GPRegistryValue -Name 'Ueberschreibung fuer Ingenieuranwendung' -Key $key -ValueName ScreenSaveTimeOut -Disable
Get-GPInheritance -Target 'OU=Ingenieure,OU=Schulung,DC=example,DC=com'
Set-GPRegistryValue -Name 'Default Domain Policy' -Key 'HKLM\Software\Policies\Microsoft\Windows NT\CurrentVersion\Winlogon' `
  -ValueName SyncForegroundPolicy -Type DWord -Value 1
Set-GPLink -Name 'Default Domain Policy' -Target 'DC=example,DC=com' -Enforced Yes

# EXA-DC01 – Uebung 3
New-ADOrganizationalUnit -Name Gruppen -Path 'DC=example,DC=com'
New-ADOrganizationalUnit -Name Clients -Path 'DC=example,DC=com'
New-ADGroup -Name 'GPO_EXAMPLE-Standards_Ausnahmen' -GroupScope Global -GroupCategory Security -Path 'OU=Gruppen,DC=example,DC=com'
Remove-GPO -Name 'Ueberschreibung fuer Ingenieuranwendung'
# Verweigern "Gruppenrichtlinie uebernehmen" ist nur per GUI (Delegierung -> Erweitert) moeglich
New-ADGroup -Name Vertriebslaptops -GroupScope Global -GroupCategory Security -Path 'OU=Gruppen,DC=example,DC=com'
New-GPO -Name Vertriebslaptopkonfiguration -Comment 'Unternehmensstandardhintergrund fuer Vertriebslaptops'
Set-GPRegistryValue -Name Vertriebslaptopkonfiguration -Key 'HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\System' `
  -ValueName Wallpaper -Type String -Value 'C:\Windows\Web\Wallpaper\Windows\img0.jpg'
Set-GPRegistryValue -Name Vertriebslaptopkonfiguration -Key 'HKLM\Software\Policies\Microsoft\Windows\System' `
  -ValueName UserPolicyMode -Type DWord -Value 1      # 1 = Zusammenfuehren, 2 = Ersetzen
Set-GPPermission -Name Vertriebslaptopkonfiguration -TargetName 'Authenticated Users' -TargetType Group -PermissionLevel GpoRead -Replace
Set-GPPermission -Name Vertriebslaptopkonfiguration -TargetName Vertriebslaptops -TargetType Group -PermissionLevel GpoApply
Set-GPPermission -Name Vertriebslaptopkonfiguration -TargetName 'Domain Users' -TargetType Group -PermissionLevel GpoApply
New-GPLink -Name Vertriebslaptopkonfiguration -Target 'OU=Clients,DC=example,DC=com'

# EXA-DC01 – Uebung 4
gpupdate /force /boot
Get-GPResultantSetOfPolicy -ReportType Html -Path "$env:USERPROFILE\Documents\RSoP-Assistent.html" -User 'EXAMPLE\Administrator'
gpresult /r
gpresult /h "$env:USERPROFILE\Documents\RSOP.html"
Get-WinEvent -LogName 'Microsoft-Windows-GroupPolicy/Operational' -MaxEvents 30 | Format-Table TimeCreated, Id, Message -Wrap
Get-WinEvent -FilterHashtable @{LogName='System'; ProviderName='Microsoft-Windows-GroupPolicy'} -MaxEvents 10
```

## Übungen
- A: Ü1: Warum kann man nach gpupdate die Wartezeit des Bildschirmschoners nicht mehr ändern? | L: Die Einstellung ist eine verwaltete Richtlinie (Registry-Zweig ...\Policies); die Oberfläche graut sie aus, solange das GPO gilt.
- A: Ü1: Was bewirkt gpupdate /force /boot /logoff? | L: /force wendet alle Einstellungen neu an (nicht nur geänderte), /boot startet neu, /logoff meldet ab, falls CSEs nur im Vordergrund (Start/Anmeldung) wirken.
- A: Ü1: Wozu der Schlüsselwortfilter in den Administrativen Vorlagen? | L: Er zeigt nur Einstellungen, deren Titel/Hilfe/Kommentar das Suchwort enthalten – schnelles Finden unter Tausenden Einstellungen.
- A: Ü2: Warum hat „Überschreibung für Ingenieuranwendung“ Vorrang? | L: Sie ist an der OU verknüpft und wird nach dem Domänen-GPO verarbeitet (LSDOU) – die letzte, objektnähere Einstellung gewinnt. Deaktiviert überstimmt aktiviert.
- A: Ü2: Was bewirkt „Erzwungen“ an der DDP-Verknüpfung? | L: Ihre Einstellungen können von untergeordneten GPOs nicht überschrieben und durch „Vererbung deaktivieren“ nicht blockiert werden; in der Vererbungsliste steht sie oben.
- A: Ü2: Wozu die Richtlinie „Immer auf das Netzwerk warten“? | L: Synchrone Vordergrundverarbeitung beim Start/Anmelden – Änderungen (z. B. Ordnerumleitung, Softwareinstallation) wirken schon bei der nächsten Anmeldung, nicht erst bei der übernächsten.
- A: Ü3: Warum Verweigern statt Überschreibungs-GPO? | L: Weniger Aufwand und übersichtlicher; eine Ausnahme ist nur noch eine Gruppenmitgliedschaft; Verweigern schlägt das Zulassen von „Authentifizierte Benutzer“.
- A: Ü3: Warum ist für die Vertriebslaptops Loopback nötig? | L: Der Hintergrund ist eine Benutzereinstellung, soll aber nur auf bestimmten Computern gelten; Loopback wendet Benutzereinstellungen aus GPOs im Bereich des Computers an.
- A: Ü3: Warum kommt „Domänen-Benutzer“ zusätzlich in die Sicherheitsfilterung? | L: Bei Loopback mit Sicherheitsfilterung muss auch der angemeldete Benutzer „Gruppenrichtlinie übernehmen“ für das GPO haben, sonst werden die Benutzereinstellungen nicht angewendet.
- A: Ü3: Unterschied Zusammenführen und Ersetzen? | L: Zusammenführen: zuerst Benutzer-GPOs des Benutzers, dann die des Computers (Computer gewinnt bei Konflikt). Ersetzen: nur die Benutzer-GPOs aus dem Bereich des Computers.
- A: Ü4: Was zeigt der RSoP-Bericht? | L: Zeit der letzten Aktualisierung (Benutzer/Computer), angewendete und verweigerte GPOs mit Grund (z. B. Sicherheitsfilter, leer, deaktiviert), verwendete CSEs und je Einstellung das gewinnende GPO.
- A: Ü4: Unterschied gpresult /r, /v, /z, /h? | L: /r Zusammenfassung, /v ausführlich inkl. Einstellungen, /z sehr ausführlich (alle Rangfolgeinfos), /h HTML-Bericht in eine Datei.
- A: Ü4: Welche Ereignisse betreffen die Anwendung, welche die Verwaltung? | L: Anwendung: GroupPolicy-Ereignisse im System-Protokoll und Operational-Log (Start 4004/4005, GPO-Listen 5312/5313, Ende 8004/8005). Verwaltung: Einträge der GPMC/des Editors bzw. Verzeichnisdienst-Änderungen (z. B. Ereignisse zu geänderten GPOs auf dem DC).

## Karteikarten
- F: Wo liegt der Bildschirmschoner-Timeout als Richtlinie in der Registry? | A: HKCU\Software\Policies\Microsoft\Windows\Control Panel\Desktop, Wert ScreenSaveTimeOut
- F: Wie verknüpft man ein GPO per PowerShell? | A: New-GPLink -Name <GPO> -Target <DN>
- F: Wie setzt man eine Verknüpfung auf Erzwungen? | A: Set-GPLink -Enforced Yes bzw. Rechtsklick Verknüpfung → Erzwungen
- F: Welche Berechtigung schließt eine Gruppe vom GPO aus? | A: „Gruppenrichtlinie übernehmen“ auf Verweigern
- F: Wo aktiviert man Loopback? | A: Computerkonfiguration\Richtlinien\Administrative Vorlagen\System\Gruppenrichtlinie
- F: Registry-Wert für Loopback-Modus? | A: HKLM\Software\Policies\Microsoft\Windows\System\UserPolicyMode (1 = Zusammenführen, 2 = Ersetzen)
- F: PowerShell-Pendant zum RSoP-Assistenten? | A: Get-GPResultantSetOfPolicy -ReportType Html
- F: Wo stehen die detaillierten GPO-Verarbeitungsereignisse? | A: Anwendungs- und Dienstprotokolle → Microsoft → Windows → GroupPolicy → Betriebsbereit
- F: Was muss nach Entfernen von „Authentifizierte Benutzer“ aus dem Filter erhalten bleiben? | A: Leseberechtigung (Delegierung) für die Computer
- F: Wie oft aktualisieren Clients Gruppenrichtlinien im Hintergrund? | A: Alle 90 Minuten mit bis zu 30 Minuten Zufallsversatz (DCs alle 5 Minuten)

## Quiz
? Ein GPO an der OU Ingenieure setzt „Zeitlimit für Bildschirmschoner“ auf Deaktiviert, das Domänen-GPO auf 600 s. Was gilt für Ingenieure?
* Deaktiviert – das OU-GPO wird später verarbeitet
- 600 s – die Domäne gewinnt immer
- Beide Werte addieren sich
- Keiner – Konflikt blockiert beide

? Wie verhindert man, dass eine Einstellung der Default Domain Policy von OU-GPOs überschrieben wird?
* Verknüpfung auf „Erzwungen“ setzen
- Vererbung an der OU deaktivieren
- GPO-Status „Benutzerkonfiguration deaktiviert“
- WMI-Filter auf die DDP

? Wie schließt man einzelne Benutzer von EXAMPLE-Standards aus?
* Gruppe mit „Gruppenrichtlinie übernehmen: Verweigern“ und Benutzer aufnehmen
- Benutzer in die OU Domain Controllers verschieben
- GPO löschen
- „Lesen: Zulassen“ für die Benutzer setzen

? Welche Einstellung wird für die Vertriebslaptops zusätzlich zum Hintergrundbild benötigt?
* Loopbackverarbeitungsmodus (Zusammenführen) in der Computerkonfiguration
- Ordnerumleitung
- Kennwortrichtlinie
- Softwareinstallation

? Welcher Befehl erzeugt einen RSoP-Bericht als HTML-Datei?
* gpresult /h Datei.html
- gpresult /r
- gpupdate /force
- gpresult /z /html

? Wo findet man die detaillierten Ereignisse der GPO-Verarbeitung?
* GroupPolicy → Betriebsbereit unter Anwendungs- und Dienstprotokolle
- Windows-Protokolle → Sicherheit
- Setup-Protokoll
- Weitergeleitete Ereignisse

? Was passiert, wenn man „Authentifizierte Benutzer“ komplett (auch Lesen) vom GPO entfernt und nur eine Benutzergruppe filtert?
* Das GPO wird ggf. gar nicht angewendet, weil Computer es nicht lesen können
- Es gilt dann für alle Computer
- Es wird erzwungen
- Nichts ändert sich

? Womit lässt sich „Gruppenrichtlinie übernehmen: Verweigern“ NICHT setzen?
* Set-GPPermission
- GPMC → Delegierung → Erweitert
- Set-Acl auf das GPO-Objekt im AD
- dsacls auf den GPC
! Set-GPPermission kennt nur Zulassen-Stufen (GpoRead, GpoApply, GpoEdit …).

## Reihenfolge
### Übung 3 – Loopback für Vertriebslaptops
1. Gruppe Vertriebslaptops und OU Clients anlegen
2. GPO Vertriebslaptopkonfiguration erstellen
3. Desktophintergrund in der Benutzerkonfiguration aktivieren
4. Loopback „Zusammenführen“ in der Computerkonfiguration aktivieren
5. Sicherheitsfilterung: Authentifizierte Benutzer entfernen, Vertriebslaptops und Domänen-Benutzer hinzufügen
6. GPO mit der OU Clients verknüpfen
7. Laptop-Computerkonten in die Gruppe aufnehmen und neu starten

## Spickzettel
- LSDOU, Erzwungen > alles, Vererbung deaktivieren blockiert nur Nicht-Erzwungenes
- Deaktiviert ≠ Nicht konfiguriert
- Ausnahme: Verweigern „Gruppenrichtlinie übernehmen“ (nur GUI)
- Loopback in Computerkonfig: 1 Zusammenführen, 2 Ersetzen
- Filter ändern → Lesen für Computer behalten
- gpupdate /force /boot /logoff; gpresult /r /v /z /h
- Ereignisse: GroupPolicy/Operational 4004/4005 Start, 8004/8005 Ende
