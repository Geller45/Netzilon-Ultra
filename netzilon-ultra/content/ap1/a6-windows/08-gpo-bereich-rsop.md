---
id: ap1-a6-gpo-bereich
bereich: AP1
block: A6
kapitel: Windows Server
titel: GPO-Bereich – Vererbung, Erzwungen, Filterung, Loopback, RSoP
stufe: Profi
quellen: [Übung_Gruppenrichtlinien2.pdf, Übung_Gruppenrichtlinien3.pdf, Übung_Gruppenrichtlinien4.pdf, AD-Gruppenrichtlinien.pdf]
verweise: [ap1-a6-gpo-grundlagen, ap1-a6-gruppen, ap1-a6-adds, az800-gpo]
---

## Profi

### Verknüpfung (Link) und Gültigkeitsbereich
Ein GPO wirkt erst, wenn es **verknüpft** ist – mit einem **Standort**, der **Domäne** oder einer **OU**. Ein GPO kann an **mehreren** Stellen verknüpft sein; das Löschen einer **Verknüpfung** löscht nicht das GPO (liegt im Container „Gruppenrichtlinienobjekte“). Verknüpfungen lassen sich **deaktivieren** (Rechtsklick → „Verknüpfung aktiviert“ entfernen), ebenso die Benutzer- oder Computerhälfte des GPOs selbst.

### Verarbeitungsreihenfolge: LSDOU
1. **L**okales GPO
2. **S**tandort-GPOs
3. **D**omänen-GPOs
4. **O**U-GPOs – von der **obersten** OU bis zur OU, in der das Objekt liegt
**Später angewendet = gewinnt** bei Konflikten („näher am Objekt gewinnt“). Nicht widersprüchliche Einstellungen **addieren** sich.
Sind **mehrere GPOs an derselben Stelle** verknüpft, bestimmt die **Verknüpfungsreihenfolge**: **1 = höchste Priorität** (wird **zuletzt** angewendet). „Das zuletzt in der Liste aufgeführte GPO wird als erstes ausgeführt.“ Die Registerkarte **Gruppenrichtlinienvererbung** einer OU zeigt die resultierende **Rangfolge**.

### Vererbung deaktivieren und Erzwungen
- **Vererbung deaktivieren** (Block Inheritance) an einer **OU/Domäne**: GPOs von **oberhalb** werden **nicht** angewendet (blaues Ausrufezeichen). Beispiel: Ingenieur-OU ohne das Bildschirmschoner-GPO der Domäne – aber das blockiert **alle** höheren GPOs.
- **Erzwungen** (Enforced, früher „Kein Vorrang“) an einer **Verknüpfung**: Das GPO wird **trotz** deaktivierter Vererbung angewendet **und** seine Einstellungen können von tieferen GPOs **nicht überschrieben** werden (erzwungene GPOs erhalten die höchste Rangfolge; bei mehreren erzwungenen gewinnt das **höher** gelegene). Typisch für unternehmensweite Sicherheitsvorgaben in der Default Domain Policy.
- **Erzwungen schlägt Vererbung deaktivieren.**
Beide Mittel **sparsam** einsetzen – sie machen die Wirkung schwer nachvollziehbar.

### Sicherheitsfilterung
Ein GPO wird nur auf Objekte angewendet, die **Lesen** und **Gruppenrichtlinie übernehmen** (Apply Group Policy) dürfen. Standard: **Authentifizierte Benutzer** (enthält Benutzer **und Computer**).
- **Einschränken**: Authentifizierte Benutzer aus der Sicherheitsfilterung entfernen und eine bestimmte **Gruppe** hinzufügen → GPO wirkt nur auf deren Mitglieder (innerhalb des verknüpften Bereichs!). **Wichtig**: Seit MS16-072 muss dann auf der Registerkarte **Delegierung** „Authentifizierte Benutzer“ (oder Domänencomputer) weiterhin **Lesen** behalten, sonst kann der Computer das GPO nicht lesen und es wird gar nicht angewendet.
- **Ausnahmen**: Einer Gruppe (z. B. **GPO_EXAMPLE-Standards_Ausnahmen**) auf der Registerkarte **Delegierung → Erweitert** „**Gruppenrichtlinie übernehmen: Verweigern**“ setzen → Mitglieder sind ausgenommen (**Verweigern hat Vorrang**). Eleganter als ein eigenes Überschreibungs-GPO: Ausnahme = Benutzer in die Gruppe aufnehmen.
- Computer-Einstellungen filtern → **Computerkonten/-gruppen** in den Filter, Benutzer-Einstellungen → Benutzergruppen.

### WMI-Filter
Filtern nach **Eigenschaften des Computers** per WMI-Abfrage (WQL), z. B. nur Windows 11, nur Laptops, nur ≥ 8 GB RAM:
`SELECT * FROM Win32_OperatingSystem WHERE Version LIKE "10.0.2%" AND ProductType = "1"`
Ein GPO kann **einen** WMI-Filter haben; Auswertung kostet Anmeldezeit.

### Loopbackverarbeitung
Normalerweise erhält ein Benutzer die **Benutzereinstellungen** aus den GPOs **seiner** OU – egal, an welchem Computer er sich anmeldet. Mit **Loopback** („Loopbackverarbeitungsmodus für Benutzergruppenrichtlinie“, **Computerkonfiguration** → Administrative Vorlagen → System → Gruppenrichtlinie) werden die **Benutzereinstellungen** abhängig vom **Computer** angewendet:
- **Zusammenführen (Merge)**: erst die Benutzer-GPOs des Benutzers, **dann** die Benutzereinstellungen der GPOs des **Computers** (diese gewinnen bei Konflikten).
- **Ersetzen (Replace)**: **nur** die Benutzereinstellungen der Computer-GPOs – die des Benutzers werden ignoriert.
Einsatz: **Kiosk-PCs**, Terminalserver/RDS, Schulungsräume, **Vertriebslaptops** (fester Hintergrund nur auf diesen Geräten).
**Besonderheit mit Sicherheitsfilterung**: Welche GPOs per Loopback infrage kommen, wird mit den **Computer**-Anmeldeinformationen ermittelt – der **angemeldete Benutzer braucht aber ebenfalls „Gruppenrichtlinie übernehmen“** für das GPO (daher im Übungsbeispiel zusätzlich **Domänen-Benutzer** im Filter).

### Richtlinienergebnissatz (RSoP) und Problembehandlung
- **Gruppenrichtlinienergebnisse** (GPMC, Assistent): welche GPOs/Einstellungen **tatsächlich** auf einem Computer/Benutzer wirken – mit Registerkarten **Zusammenfassung** (letzte Aktualisierung, zulässige/verweigerte GPOs, Komponenten/CSEs), **Einstellungen** (inkl. „gewinnendes GPO“), **Richtlinienereignisse**.
- **`gpresult`**: `/r` (Zusammenfassung), `/v` (ausführlich), `/z` (sehr ausführlich), `/h datei.html` (Bericht), `/scope computer|user`. Ohne Adminrechte sieht man nur den Benutzerteil.
- **Gruppenrichtlinienmodellierung** (Was-wäre-wenn): simuliert Ergebnisse **vor** einer Änderung (anderer OU, andere Gruppe, langsame Verbindung, Loopback).
- **Ereignisprotokolle**: Windows-Protokolle → **System**, Quelle **Group Policy** (Microsoft-Windows-GroupPolicy); **Anwendungs- und Dienstprotokolle → Microsoft → Windows → GroupPolicy → Betriebsbereit** (Details jedes Verarbeitungsschritts, Start = Ereignis 4004/4016ff). Im Anwendungsprotokoll finden sich auch Einträge zur GPO-Verwaltung.
Typische Fehler: GPO nicht verknüpft / Verknüpfung deaktiviert, falsche OU, Sicherheitsfilter ohne Lesen für Computer, Benutzer-Einstellungen an Computer-OU, Vererbung blockiert, WMI-Filter trifft nicht zu, DNS/Netzwerk beim Start nicht bereit, SYSVOL-Replikation.

## Lab
**Maschinen**: DC01 (contoso.local; in den Unterlagen EXA-DC01/example.com), CL01. GPO **EXAMPLE-Standards** (Bildschirmschoner 600 s) ist an die Domäne verknüpft.

### GUI – Übung 2: Bereich konfigurieren
1. **DC01**: `dsa.msc` → in OU **Schulung** Unter-OU **Ingenieure** anlegen.
2. `gpmc.msc` → Rechtsklick OU Ingenieure → GPO **„Überschreibung für Ingenieuranwendung“** erstellen und verknüpfen → Bearbeiten → Benutzerkonfiguration → Administrative Vorlagen → Systemsteuerung → Anpassung → **„Zeitlimit für Bildschirmschoner“ → Deaktiviert**.
3. OU Ingenieure → Registerkarte **Gruppenrichtlinienvererbung** → „Überschreibung…“ steht **vor** EXAMPLE-Standards (höhere Rangfolge).
4. **Default Domain Policy** → Bearbeiten → Computerkonfiguration → Administrative Vorlagen → System → **Anmelden** → **„Beim Neustart des Computers und bei der Anmeldung immer auf das Netzwerk warten“ → Aktiviert**.
5. Verknüpfung Default Domain Policy → Rechtsklick → **Erzwungen** → OU Ingenieure → Gruppenrichtlinienvererbung: DDP steht jetzt ganz oben (erzwungen).

### GUI – Übung 3: Sicherheitsfilterung und Loopback
6. `dsa.msc` → OU **Gruppen** → globale Sicherheitsgruppe **GPO_EXAMPLE-Standards_Ausnahmen**.
7. `gpmc.msc` → Gruppenrichtlinienobjekte → „Überschreibung für Ingenieuranwendung“ **löschen**.
8. GPO **EXAMPLE-Standards** → Registerkarte **Delegierung** → **Erweitert** → Hinzufügen → GPO_EXAMPLE-Standards_Ausnahmen → **„Gruppenrichtlinie übernehmen“: Verweigern** → OK.
9. Registerkarte **Bereich** → Sicherheitsfilterung zeigt weiter „Authentifizierte Benutzer“ – das Verweigern wirkt trotzdem (Vorrang). Ausnahme = Benutzer in die Gruppe aufnehmen.
10. `dsa.msc` → OU Gruppen → globale Gruppe **Vertriebslaptops**; OU **Clients** (falls nicht vorhanden).
11. `gpmc.msc` → Gruppenrichtlinienobjekte → Neu → **Vertriebslaptopkonfiguration** → Bearbeiten → Benutzerkonfiguration → Administrative Vorlagen → **Desktop → Desktop** → **„Desktophintergrund“** → Aktiviert, Kommentar „Unternehmensstandardhintergrund für Vertriebslaptops“, Hintergrundname `C:\Windows\Web\Wallpaper\Windows\img0.jpg` (in der Unterlage `…\server.jpg`).
12. Computerkonfiguration → Administrative Vorlagen → System → **Gruppenrichtlinie** → **„Loopbackverarbeitungsmodus für Benutzergruppenrichtlinie“** → Aktiviert → Modus **Zusammenführen**.
13. GPO → Registerkarte **Bereich** → Sicherheitsfilterung: **Authentifizierte Benutzer entfernen** → **Vertriebslaptops** hinzufügen → **Domänen-Benutzer** hinzufügen. Registerkarte **Delegierung**: Authentifizierte Benutzer bzw. Domänencomputer mit **Lesen** ergänzen (MS16-072).
14. Rechtsklick OU **Clients** → **Vorhandenes Gruppenrichtlinienobjekt verknüpfen** → Vertriebslaptopkonfiguration.
15. Computerkonto **CL01** in die OU Clients und in die Gruppe **Vertriebslaptops** aufnehmen → CL01 **neu starten** (neue Gruppenmitgliedschaft) → beliebiger Domänenbenutzer meldet sich an → fester Hintergrund.

### GUI – Übung 4: Richtlinienergebnisse
16. **DC01**: `gpupdate /force /boot` → Uhrzeit notieren.
17. `gpmc.msc` → Rechtsklick **Gruppenrichtlinienergebnisse** → **Gruppenrichtlinienergebnis-Assistent** → Dieser Computer → Bestimmter Benutzer **CONTOSO\Administrator** → Fertig stellen.
18. Registerkarte **Zusammenfassung** → „Alle anzeigen“ → letzte Aktualisierung, zulässige/verweigerte GPOs (mit Grund), Komponentenstatus (CSEs).
19. Registerkarte **Einstellungen** → „Alle anzeigen“ → Spalte „Gewinnendes GPO“.
20. Registerkarte **Richtlinienereignisse** → Ereignis der gpupdate-Aktualisierung finden.
21. Rechtsklick auf den Bericht → **Bericht speichern** → HTML in Dokumente.
22. Eingabeaufforderung: `gpresult /r`, `gpresult /v`, `gpresult /z`, `gpresult /h "%UserProfile%\Documents\RSOP.html"` → Berichte vergleichen.
23. **Ereignisanzeige** → Windows-Protokolle → System → Aktuelles Protokoll filtern → Quelle **Group Policy**; Anwendungsprotokoll nach Quelle sortieren; **Anwendungs- und Dienstprotokolle → Microsoft → Windows → GroupPolicy → Betriebsbereit** → erstes Ereignis der Aktualisierung aus Schritt 16 und folgende prüfen.
24. Optional: Rechtsklick **Gruppenrichtlinienmodellierung** → Assistent → Benutzer aus OU Ingenieure an Computer in OU Clients mit Loopback simulieren.

### PowerShell
```powershell
# Auf DC01 – Übung 2
New-ADOrganizationalUnit Ingenieure -Path "OU=Schulung,DC=contoso,DC=local"
New-GPO "Überschreibung für Ingenieuranwendung" | New-GPLink -Target "OU=Ingenieure,OU=Schulung,DC=contoso,DC=local"
Set-GPRegistryValue -Name "Überschreibung für Ingenieuranwendung" -Key "HKCU\Software\Policies\Microsoft\Windows\Control Panel\Desktop" -ValueName ScreenSaveActive -Type String -Value "0"
Get-GPInheritance -Target "OU=Ingenieure,OU=Schulung,DC=contoso,DC=local" | Select-Object -ExpandProperty InheritedGpoLinks
Set-GPRegistryValue -Name "Default Domain Policy" -Key "HKLM\Software\Policies\Microsoft\Windows NT\CurrentVersion\Winlogon" -ValueName SyncForegroundPolicy -Type DWord -Value 1
Set-GPLink -Name "Default Domain Policy" -Target "DC=contoso,DC=local" -Enforced Yes

# Übung 3 – Ausnahme per Verweigern
New-ADGroup "GPO_EXAMPLE-Standards_Ausnahmen" -GroupScope Global -Path "OU=Gruppen,OU=Schulung,DC=contoso,DC=local"
Remove-GPO "Überschreibung für Ingenieuranwendung"
$gpo = Get-GPO "EXAMPLE-Standards"
$adObj = [ADSI]"LDAP://CN={$($gpo.Id)},CN=Policies,CN=System,DC=contoso,DC=local"
$sid = (Get-ADGroup "GPO_EXAMPLE-Standards_Ausnahmen").SID
$applyGuid = [Guid]"edacfd8f-ffb3-11d1-b41d-00a0c968f939"   # Recht "Gruppenrichtlinie übernehmen"
$rule = New-Object System.DirectoryServices.ActiveDirectoryAccessRule($sid, "ExtendedRight", "Deny", $applyGuid)
$adObj.ObjectSecurity.AddAccessRule($rule); $adObj.CommitChanges()

# Übung 3 – Vertriebslaptops mit Loopback
New-ADGroup "Vertriebslaptops" -GroupScope Global -Path "OU=Gruppen,OU=Schulung,DC=contoso,DC=local"
New-GPO "Vertriebslaptopkonfiguration" | Out-Null
Set-GPRegistryValue -Name "Vertriebslaptopkonfiguration" -Key "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\System" -ValueName Wallpaper -Type String -Value "C:\Windows\Web\Wallpaper\Windows\img0.jpg"
Set-GPRegistryValue -Name "Vertriebslaptopkonfiguration" -Key "HKLM\Software\Policies\Microsoft\Windows\System" -ValueName UserPolicyMode -Type DWord -Value 1   # 1 = Zusammenführen, 2 = Ersetzen
Set-GPPermission -Name "Vertriebslaptopkonfiguration" -TargetName "Authentifizierte Benutzer" -TargetType Group -PermissionLevel GpoRead -Replace
Set-GPPermission -Name "Vertriebslaptopkonfiguration" -TargetName "Vertriebslaptops" -TargetType Group -PermissionLevel GpoApply
Set-GPPermission -Name "Vertriebslaptopkonfiguration" -TargetName "Domänen-Benutzer" -TargetType Group -PermissionLevel GpoApply
New-GPLink -Name "Vertriebslaptopkonfiguration" -Target "OU=Clients,DC=contoso,DC=local"
Add-ADGroupMember "Vertriebslaptops" -Members (Get-ADComputer CL01)

# Übung 4 – Ergebnisse
Get-GPResultantSetOfPolicy -ReportType Html -Path "$env:USERPROFILE\Documents\RSoP.html"
gpresult /h "$env:USERPROFILE\Documents\RSOP.html"
Get-WinEvent -LogName "Microsoft-Windows-GroupPolicy/Operational" -MaxEvents 30 | Format-Table TimeCreated, Id, Message -Wrap
```

## Übungen
- A: Warum gewinnt „Überschreibung für Ingenieuranwendung“ gegen EXAMPLE-Standards? | L: Es ist an der OU verknüpft (näher am Objekt, später verarbeitet) – LSDOU
- A: Wozu „Erzwungen“ an der DDP? | L: Die Einstellung kann von keiner OU (auch nicht per Vererbung deaktivieren) aufgehoben werden
- A: Warum Verweigern statt eigenem Überschreibungs-GPO? | L: Weniger Aufwand, übersichtlicher; Ausnahme = Gruppenmitgliedschaft; Verweigern hat Vorrang vor Zulassen
- A: Warum ist Loopback für die Vertriebslaptops nötig? | L: Der Hintergrund ist eine Benutzereinstellung, soll aber abhängig vom Computer (Laptop) gelten
- A: Warum müssen zusätzlich Domänen-Benutzer im Sicherheitsfilter stehen? | L: Bei Loopback braucht auch der angemeldete Benutzer „Gruppenrichtlinie übernehmen“ für das GPO
- A: Unterschied gpresult /r, /v, /z | L: /r Zusammenfassung, /v ausführlich mit Einstellungen, /z sehr ausführlich inkl. aller Details
- A: Wo findet man die detaillierten Verarbeitungsereignisse? | L: Anwendungs- und Dienstprotokolle → Microsoft → Windows → GroupPolicy → Betriebsbereit

## Einfach

Stell dir die **Hausordnungen** (GPOs) wie **Regeln in einer Schule** vor, die auf verschiedenen Ebenen gemacht werden:
1. Die **Regeln im eigenen Zimmer** (lokal),
2. die Regeln der **Stadt** (Standort),
3. die Regeln der **ganzen Schule** (Domäne),
4. die Regeln der **Abteilung**, dann der **Klasse** (OUs).
Die Regeln werden **in dieser Reihenfolge** vorgelesen. Sagen zwei Regeln etwas Verschiedenes, gilt die, die **zuletzt** vorgelesen wurde – also die **nächste an dir** (die Klassenregel schlägt die Schulregel). Das merkt man sich mit **LSDOU**.

**Vererbung deaktivieren** = Eine Klasse sagt: „Die Schulregeln gelten bei uns nicht!“
**Erzwungen** = Der Direktor sagt: „Diese Regel gilt **für alle**, egal was eine Klasse sagt!“ – und der Direktor gewinnt immer.

**Sicherheitsfilter** = Eine Regel gilt nur für **bestimmte Schüler**, z. B. nur für die „Fußball-AG“. Oder umgekehrt: „Die Regel gilt für alle – **außer** für die auf der Ausnahmeliste.“ Wer eine Ausnahme braucht, kommt einfach auf die Liste.

**WMI-Filter** = Regel nur für **bestimmte Geräte**: „Gilt nur für Laptops“ oder „nur für Windows 11“.

**Loopback** ist der **Computerraum-Trick**: Normalerweise bringt jeder Schüler seine **eigenen** Einstellungen überall hin mit. Im **Computerraum** sollen aber für **alle** dieselben Regeln gelten – egal, wer sich hinsetzt. Loopback sagt: „An **diesem** Computer gelten zusätzlich (Zusammenführen) oder ausschließlich (Ersetzen) die Benutzerregeln **des Raums**.“

**RSoP / gpresult** ist der **Beweis-Zettel**: „Welche Regeln gelten gerade **wirklich** für mich – und welche Regel hat gewonnen?“ Die **Modellierung** ist die **Generalprobe**: „Was würde passieren, **wenn** ich Max in die andere Klasse stecke?“

## Merksatz
- **LSDOU** – später = stärker, **näher am Objekt gewinnt**.
- Verknüpfungsreihenfolge **1 = höchste Priorität**.
- **Erzwungen schlägt Vererbung deaktivieren**.
- Ausnahme = **„Gruppenrichtlinie übernehmen: Verweigern“**.
- Loopback: **Zusammenführen** (Computer gewinnt bei Konflikt) oder **Ersetzen** (nur Computer).

## Prüfungsfalle
- Nach Entfernen von „Authentifizierte Benutzer“ aus dem Filter braucht der Computer weiter **Lesen** (Delegierung) – sonst wirkt das GPO gar nicht.
- Vererbung deaktivieren blockiert **alle** höheren GPOs, nicht nur eines.
- Loopback wird in der **Computerkonfiguration** aktiviert.
- Computereinstellungen filtern nach **Computer**gruppen – neue Mitgliedschaft erst nach Neustart.
- Gelöschte Verknüpfung ≠ gelöschtes GPO.

## Grafik
### LSDOU-Treppe
Vier Stufen (Lokal, Standort, Domäne, OU, Unter-OU); Einstellungen fallen als farbige Karten nacheinander auf einen Stapel; die oberste Karte je Einstellung gewinnt. Schalter „Vererbung deaktivieren“ an der OU lässt höhere Karten abprallen; „Erzwungen“ legt eine goldene Karte, die immer oben bleibt.

### Sicherheitsfilter
GPO als Regenschirm über einer OU; nur Figuren mit „Übernehmen“-Plakette werden nass; eine Figur mit rotem „Verweigern“-Schild bleibt trocken.

### Loopback
Benutzer mit eigenem Rucksack (seine Einstellungen) setzt sich an einen Laptop mit eigener Kiste; Merge: beide ausgepackt, Laptop-Kiste oben; Replace: Rucksack bleibt zu.

### RSoP-Bericht
Animierter Bericht mit „Gewinnendes GPO“ pro Einstellung; Klick springt zum GPO.

## Karteikarten
- F: Reihenfolge der GPO-Verarbeitung? | A: LSDOU – Lokal, Standort, Domäne, OU (von oben nach unten).
- F: Welches GPO gewinnt bei Konflikten? | A: Das zuletzt angewendete (näher am Objekt), außer ein anderes ist erzwungen.
- F: Was bedeutet Verknüpfungsreihenfolge 1? | A: Höchste Priorität an dieser Stelle – wird zuletzt angewendet.
- F: Was bewirkt „Vererbung deaktivieren“? | A: GPOs übergeordneter Container werden nicht angewendet (außer erzwungene).
- F: Was bewirkt „Erzwungen“? | A: GPO wird trotz Vererbungssperre angewendet und kann nicht überschrieben werden.
- F: Welche Berechtigungen braucht ein Objekt, damit ein GPO wirkt? | A: Lesen und Gruppenrichtlinie übernehmen.
- F: Wie nimmt man Benutzer von einem GPO aus? | A: Gruppe mit „Gruppenrichtlinie übernehmen: Verweigern“ und die Benutzer dort aufnehmen.
- F: Was ist ein WMI-Filter? | A: WQL-Abfrage auf Computereigenschaften (OS, Hardware), die über die Anwendung des GPOs entscheidet.
- F: Wozu dient Loopback? | A: Benutzereinstellungen abhängig vom Computer anwenden (Kiosk, RDS, Schulungsraum).
- F: Unterschied Loopback Zusammenführen und Ersetzen? | A: Zusammenführen: Benutzer-GPOs + Computer-GPO-Benutzerteil (Computer gewinnt). Ersetzen: nur Computer-GPO-Benutzerteil.
- F: Was zeigt gpresult /r? | A: Zusammenfassung des Richtlinienergebnissatzes (angewendete/gefilterte GPOs).
- F: Unterschied Gruppenrichtlinienergebnisse und -modellierung? | A: Ergebnisse: tatsächlicher Zustand. Modellierung: Was-wäre-wenn-Simulation.
- F: Wo liegen die detaillierten GPO-Ereignisse? | A: Microsoft → Windows → GroupPolicy → Betriebsbereit (Operational).

## Quiz
? An der Domäne setzt GPO A den Bildschirmschoner auf 10 Minuten, an der OU setzt GPO B ihn auf deaktiviert. Was gilt für Benutzer in der OU?
* Deaktiviert (GPO B)
- 10 Minuten (GPO A)
- Beide abwechselnd
- Keine Einstellung

? Eine OU hat „Vererbung deaktivieren“, das Domänen-GPO ist „Erzwungen“. Wird das Domänen-GPO angewendet?
* Ja
- Nein
- Nur für Computer
- Nur nach Neustart des DCs

? Wie schließt man einzelne Benutzer am einfachsten von einem GPO aus?
* Über eine Gruppe mit „Gruppenrichtlinie übernehmen: Verweigern“
- Durch Löschen des GPOs
- Durch Verschieben in den Container Users
- Mit gpupdate /force

? Auf Kiosk-PCs sollen ausschließlich die Benutzereinstellungen des Kiosk-GPOs gelten. Welcher Loopback-Modus?
* Ersetzen
- Zusammenführen
- Erzwungen
- Kein Loopback nötig

? Welcher Befehl erstellt einen HTML-Bericht des Richtlinienergebnissatzes?
* gpresult /h bericht.html
- gpupdate /force
- gpresult /r
- dcdiag /html

? Wofür steht LSDOU?
* Lokal, Standort, Domäne, OU – Verarbeitungsreihenfolge der GPOs
- Login, Sitzung, Datei, Objekt
- LDAP, SMB, DNS, OU
- Lesen, Schreiben, Darstellen, Übernehmen
! Das zuletzt angewendete GPO gewinnt bei Konflikten.

? Welche zwei Berechtigungen braucht eine Gruppe, damit ein GPO für sie gilt?
* Lesen und Gruppenrichtlinie übernehmen
- Schreiben und Ändern
- Vollzugriff und Besitz
- Ausführen und Auflisten
! Standard: Authentifizierte Benutzer.

? Womit lässt sich ein GPO nur auf Computer mit bestimmten Eigenschaften (z. B. Windows 11) anwenden?
* WMI-Filter
- Loopback-Verarbeitung
- Vererbung deaktivieren
- Verknüpfungsreihenfolge
! WMI-Filter prüfen Bedingungen per WQL-Abfrage.
