---
id: ap1-a6-gpo-grundlagen
bereich: AP1
block: A6
kapitel: Windows Server
titel: Gruppenrichtlinien – Grundlagen & Infrastruktur
stufe: Fortgeschritten
quellen: [AD-Gruppenrichtlinien.pdf, 16-01-uebung-richtlinien_erstellen.pdf, Übung_Gruppenrichtlinien1.pdf, Identitätsmanagement_mit_Windows_Server_2016_70-742.pdf]
verweise: [ap1-a6-gpo-bereich, ap1-a6-adds, ap1-a6-kontorichtlinien, az800-gpo]
---

## Profi

### Konfigurationsverwaltung
**Gruppenrichtlinien** (Group Policy) sind das zentrale Werkzeug, um **Einstellungen für Benutzer und Computer** in einer Domäne **einheitlich, automatisch und dauerhaft** festzulegen: Sicherheit (Kennwörter, Firewall, BitLocker), Desktop/Startmenü, Laufwerkszuordnungen, Ordnerumleitung, Softwareverteilung, Skripte, Windows Update. Einmal konfigurieren – für tausende Rechner gültig.

### Gruppenrichtlinienobjekt (GPO)
Ein **GPO** ist ein Container für Richtlinieneinstellungen mit zwei Hälften:
- **Computerkonfiguration**: gilt für den **Computer**, wird beim **Start** (und dann regelmäßig) angewendet – unabhängig davon, wer sich anmeldet.
- **Benutzerkonfiguration**: gilt für den **Benutzer**, wird bei der **Anmeldung** (und dann regelmäßig) angewendet – auf jedem Rechner, an dem er sich anmeldet.
Jede Hälfte hat **Richtlinien** (Softwareeinstellungen, Windows-Einstellungen, Administrative Vorlagen) und **Einstellungen** (Preferences). Nicht benötigte Hälften kann man im GPO **deaktivieren** (Registerkarte Details → GPO-Status) → schnellere Verarbeitung.

Eine Richtlinie hat drei Zustände: **Nicht konfiguriert** (keine Wirkung, andere GPOs/Standard gelten), **Aktiviert**, **Deaktiviert** (aktiv das Gegenteil erzwingen – wichtig zum Überschreiben!).

### Lokale vs. domänenbasierte GPOs
- **Lokales GPO** (`gpedit.msc`): auf jedem Windows-Rechner, gilt auch ohne Domäne; wird **zuerst** angewendet und von Domänen-GPOs überschrieben. Mehrere lokale GPOs (MLGPO) für Administratoren/Nicht-Administratoren/bestimmte Benutzer möglich.
- **Domänenbasierte GPOs**: zentral im AD, verknüpft mit **Standort, Domäne oder OU**.
- Standard-GPOs: **Default Domain Policy** (an der Domäne – Kontorichtlinien) und **Default Domain Controllers Policy** (an der OU Domain Controllers – Benutzerrechte, Überwachung der DCs). Diese nicht für alles missbrauchen – lieber eigene GPOs anlegen.

### Speicherung eines GPOs
| Teil | Ort | Inhalt |
|---|---|---|
| **GPC** (Group Policy Container) | im **AD** (`CN=Policies,CN=System,DC=…`), benannt nach einer **GUID** | Eigenschaften: Name, Version, Status, Verknüpfungen, Sicherheitsfilter, WMI-Filter |
| **GPT** (Group Policy Template) | im **SYSVOL** (`\\contoso.local\SYSVOL\contoso.local\Policies\{GUID}`) | eigentliche Einstellungen: `Registry.pol`, Skripte, Sicherheitsvorlagen (`GptTmpl.inf`), Installationspakete-Verweise |
GPC repliziert per AD-Replikation, GPT per **DFS-R**. Sind beide nicht synchron (Versionsnummer), wird das GPO nicht korrekt angewendet.

### Administrative Vorlagen und zentraler Speicher
- **Administrative Vorlagen** sind **registrierungsbasierte Richtlinien**. Beschrieben in **ADMX**-Dateien (Sprach-unabhängig) + **ADML** (Sprachdateien, z. B. de-DE). Sie schreiben in die Richtlinienschlüssel `HKLM\Software\Policies` bzw. `HKCU\Software\Policies`.
- **Verwaltete Einstellungen** (unter Policies): werden beim Entfernen des GPOs **automatisch zurückgenommen**, der Benutzer kann sie nicht ändern (ausgegraut).
- **Nicht verwaltete Einstellungen** (klassische ADM, Preferences): schreiben an beliebige Registry-Stellen und **bleiben** nach dem Entfernen bestehen (**„Tattooing“**).
- **Zentraler Speicher (Central Store)**: Ordner `\\contoso.local\SYSVOL\contoso.local\Policies\PolicyDefinitions` mit allen ADMX/ADML-Dateien. Existiert er, verwenden **alle Admins** dieselben, aktuellen Vorlagen (statt der lokalen `C:\Windows\PolicyDefinitions`). Anlegen: Ordner kopieren; neue Vorlagen (z. B. Windows 11, Office, Edge) dort ablegen.
- **Filteroptionen** im Editor: Schlüsselwortfilter (z. B. „Bildschirmschoner“), nur konfigurierte, Anforderungen (Unterstützt auf …) – sehr hilfreich bei tausenden Einstellungen.

### Gruppenrichtlinieneinstellungen (Preferences)
Seit Server 2008 zusätzlich zu den Richtlinien: **Laufwerkszuordnungen**, Drucker, Dateien/Ordner, Verknüpfungen, Registry, Umgebungsvariablen, geplante Aufgaben, lokale Benutzer/Gruppen, Energieoptionen …
- **Nicht erzwungen** (Benutzer kann ändern, wird bei nächster Aktualisierung ggf. wieder gesetzt) – Aktionen: Erstellen, Ersetzen, Aktualisieren, Löschen.
- **Zielgruppenadressierung (Item-Level Targeting)**: Einzelne Einstellung nur anwenden, wenn Bedingungen zutreffen – Sicherheitsgruppe, OU, IP-Bereich, Betriebssystem, Computername, Batterie vorhanden … (z. B. Laufwerk H: nur für GG-HR).

### Clientseitige Verarbeitung
- Der **Gruppenrichtlinienclient-Dienst** auf dem Rechner holt die Liste der GPOs vom DC; **clientseitige Erweiterungen (CSEs)** setzen die jeweiligen Bereiche um (Registry, Sicherheit, Skripte, Ordnerumleitung, Softwareinstallation, Laufwerke …).
- **Zeitpunkte**: Computer beim **Start**, Benutzer bei der **Anmeldung**, danach **Hintergrundaktualisierung alle 90 Minuten ± 0–30 Min.** Zufallsversatz (DCs: alle 5 Minuten).
- Manche Einstellungen wirken nur **im Vordergrund** (Start/Anmeldung): **Softwareinstallation**, **Ordnerumleitung** – dafür ggf. mehrere Anmeldungen/Neustarts nötig oder die Richtlinie „Beim Neustart des Computers und bei der Anmeldung immer auf das Netzwerk warten“ aktivieren.
- **Langsame Verbindungen** (Standard < 500 kbit/s): bestimmte CSEs (Softwareinstallation, Ordnerumleitung, Skripte) werden übersprungen; Registry und Sicherheit werden immer verarbeitet.
- **Manuell**: `gpupdate` (nur Änderungen), `gpupdate /force` (alles neu), `/boot`, `/logoff`, `/target:computer|user`. Remote aus der GPMC: Rechtsklick OU → **Gruppenrichtlinienupdate**, oder `Invoke-GPUpdate`.

### Werkzeuge
| Werkzeug | Zweck |
|---|---|
| **Gruppenrichtlinienverwaltung** (`gpmc.msc`) | GPOs anlegen, verknüpfen, filtern, sichern, Berichte, Ergebnisse, Modellierung – heute über RSAT/Rolle installiert (früher gpmc.msi) |
| **Gruppenrichtlinienverwaltungs-Editor** | Einstellungen im GPO bearbeiten |
| `gpresult /r`, `/h bericht.html` | angewendete GPOs (RSoP) auf dem Client |
| **Starter-GPOs** | Vorlagen nur mit administrativen Vorlagen |
| `Backup-GPO`, `Restore-GPO`, `Import-GPO` | Sicherung/Übertragung |

## Lab
**Maschinen**: DC01 (contoso.local), CL01 (Windows 11, Domänenmitglied). Benutzer w.scheel, h.kohl, w.brandt existieren.

### GUI (Übung „Richtlinien erstellen“ + Übung 1 „Implementieren“)
1. **DC01**: `dsa.msc` → OU **Haupt** anlegen, w.scheel hinein; darin OU **Unter**, h.kohl hinein.
2. **DC01**: `gpmc.msc` → Rechtsklick OU Haupt → **„Gruppenrichtlinienobjekt hier erstellen und verknüpfen“** → **Haupt-GPO** → Bearbeiten.
3. Benutzerkonfiguration → Richtlinien → Administrative Vorlagen → **Startmenü und Taskleiste** → „**Befehl ‚Ausführen‘ aus dem Startmenü entfernen**“ → Aktiviert; ebenso „**Hilfe aus dem Startmenü entfernen**“ (bei Windows 11 wirksame Alternativen: „Zugriff auf Kontextmenüs der Taskleiste entfernen“, „Suchen … aus Startmenü entfernen“) → Editor schließen.
4. **CL01**: als w.scheel und h.kohl anmelden → Einträge fehlen (h.kohl erbt aus Haupt).
5. **DC01**: OU Unter → **Unter-GPO** erstellen → Rechtsklick OU Unter → **„Vererbung deaktivieren“** (blaues Ausrufezeichen) → **CL01**: h.kohl ab-/anmelden → Einschränkungen weg.
6. **DC01**: Verknüpfung Haupt-GPO → Rechtsklick → **Erzwungen** → **CL01**: h.kohl ab-/anmelden → Einschränkungen wieder da (Erzwungen schlägt Vererbung deaktivieren).
7. Beides rückgängig machen. Im Unter-GPO zusätzlich eine Einschränkung aktivieren → h.kohl hat alle Einschränkungen (kumulativ).
8. Im Unter-GPO „Hilfe entfernen“ auf **Deaktiviert** setzen → Hilfe wieder da (**Unter-GPO ist näher am Objekt**).
9. w.brandt in OU Unter verschieben → gleiches Ergebnis wie h.kohl.
10. **Ordnerumleitung**: auf DC01 bzw. SRV01 Freigabe **Benutzerordner** (Freigabe: Authentifizierte Benutzer Vollzugriff; NTFS: Ersteller-Besitzer Vollzugriff für Unterordner, Benutzer „Ordner erstellen“ nur diesen Ordner) → GPO **Benutzerordner** an OU Haupt → Benutzerkonfiguration → Richtlinien → Windows-Einstellungen → **Ordnerumleitung** → **Dokumente**, **Desktop**, **Downloads** → Eigenschaften → „Standard – Leitet alle Ordner auf den gleichen Pfad um“ → „Einen Ordner für jeden Benutzer im Stammverzeichnis erstellen“ → `\\DC01\Benutzerordner` → **CL01**: zweimal an-/abmelden (Vordergrundverarbeitung) → Explorer: Dokumente liegt auf dem Server.
11. **Übung 1 (EXAMPLE-Standards)**: GPO **EXAMPLE-Standards** anlegen → Stammknoten → Eigenschaften → **Kommentar** (Zweck, Verantwortlicher) → Benutzerkonfiguration → Administrative Vorlagen → Rechtsklick → **Filteroptionen** → Schlüsselwortfilter „Bildschirmschoner“, **Genau** → Systemsteuerung → Anpassung → **„Zeitlimit für Bildschirmschoner“** Aktiviert, **600 Sekunden** (+ Kommentar) → **„Kennwortschutz für den Bildschirmschoner verwenden“** Aktiviert → GPO mit der **Domäne** verknüpfen.
12. **CL01/DC01**: Systemsteuerung → Darstellung → Bildschirmschoner ändern (Wartezeit änderbar) → `gpupdate /force /boot /logoff` → erneut öffnen → **Wartezeit und „Anmeldeseite bei Reaktivierung“ ausgegraut**.

### PowerShell
```powershell
# Auf DC01
Import-Module GroupPolicy
New-ADOrganizationalUnit Haupt -Path "DC=contoso,DC=local"
New-ADOrganizationalUnit Unter -Path "OU=Haupt,DC=contoso,DC=local"
Get-ADUser w.scheel | Move-ADObject -TargetPath "OU=Haupt,DC=contoso,DC=local"
Get-ADUser h.kohl  | Move-ADObject -TargetPath "OU=Unter,OU=Haupt,DC=contoso,DC=local"

New-GPO -Name "Haupt-GPO" | New-GPLink -Target "OU=Haupt,DC=contoso,DC=local"
# "Ausführen" entfernen (registrierungsbasierte Richtlinie)
Set-GPRegistryValue -Name "Haupt-GPO" -Key "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" -ValueName NoRun -Type DWord -Value 1

New-GPO -Name "Unter-GPO" | New-GPLink -Target "OU=Unter,OU=Haupt,DC=contoso,DC=local"
Set-GPInheritance -Target "OU=Unter,OU=Haupt,DC=contoso,DC=local" -IsBlocked Yes
Set-GPLink -Name "Haupt-GPO" -Target "OU=Haupt,DC=contoso,DC=local" -Enforced Yes
Get-GPInheritance -Target "OU=Unter,OU=Haupt,DC=contoso,DC=local"

# EXAMPLE-Standards: Bildschirmschoner 600 s + Kennwortschutz
New-GPO -Name "EXAMPLE-Standards" -Comment "Unternehmensstandards, gilt für alle Benutzer/Computer der Domäne" |
  New-GPLink -Target "DC=contoso,DC=local"
Set-GPRegistryValue -Name "EXAMPLE-Standards" -Key "HKCU\Software\Policies\Microsoft\Windows\Control Panel\Desktop" -ValueName ScreenSaveTimeOut -Type String -Value "600"
Set-GPRegistryValue -Name "EXAMPLE-Standards" -Key "HKCU\Software\Policies\Microsoft\Windows\Control Panel\Desktop" -ValueName ScreenSaverIsSecure -Type String -Value "1"

# Zentralen Speicher anlegen
Copy-Item C:\Windows\PolicyDefinitions "\\contoso.local\SYSVOL\contoso.local\Policies\" -Recurse

# Bericht und Aktualisierung
Get-GPOReport -Name "EXAMPLE-Standards" -ReportType Html -Path C:\Temp\EXAMPLE.html
Invoke-GPUpdate -Computer CL01 -Force

# Auf CL01
gpupdate /force
gpresult /r
```

## Übungen
- A: Warum sind die Einträge nach „Vererbung deaktivieren“ an OU Unter wieder da? | L: Das Haupt-GPO wird nicht mehr an OU Unter vererbt
- A: Warum fehlen sie nach „Erzwungen“ am Haupt-GPO wieder? | L: Erzwungene GPOs werden trotz deaktivierter Vererbung angewendet und haben höchsten Vorrang
- A: Warum ist „Hilfe“ wieder sichtbar, wenn das Unter-GPO die Einstellung deaktiviert? | L: Das Unter-GPO ist näher am Objekt (OU) und wird später angewendet – letzte Einstellung gewinnt
- A: Warum hat w.brandt nach dem Verschieben das gleiche Startmenü wie h.kohl? | L: GPOs wirken nach der OU-Zugehörigkeit des Objekts
- A: Warum greift die Ordnerumleitung erst nach mehreren Anmeldungen? | L: Ordnerumleitung wird nur im Vordergrund (bei Anmeldung) verarbeitet; bei schneller Anmeldung erst beim nächsten Mal
- A: Warum ist die Bildschirmschoner-Wartezeit nach gpupdate ausgegraut? | L: Verwaltete Richtlinie in HKCU\Software\Policies – der Benutzer kann sie nicht ändern

## Einfach

Stell dir vor, du bist **Schulleiter** und hast 1.000 Computer. Du willst, dass auf allen der Bildschirm nach 10 Minuten sperrt, das Hintergrundbild das Schullogo zeigt und keiner die Systemsteuerung öffnen darf. **Jeden Computer einzeln einstellen? Nie im Leben!**

**Gruppenrichtlinien** sind die **Hausordnung**, die du einmal schreibst und die sich **automatisch an alle Computer verteilt**. Jede neue Hausordnung ist ein **GPO** (Gruppenrichtlinienobjekt).

**Zwei Hälften jeder Hausordnung**:
- **Computerkonfiguration**: Regeln für den **Raum** – gelten für jeden, der drin sitzt (z. B. „Firewall immer an“). Werden beim **Einschalten** geladen.
- **Benutzerkonfiguration**: Regeln für die **Person** – gelten auf jedem Rechner, an den sie sich setzt (z. B. „Dein Hintergrundbild“). Werden beim **Anmelden** geladen.

**Aktiviert, Deaktiviert, Nicht konfiguriert**: „Nicht konfiguriert“ heißt „Dazu sage ich nichts“ – andere Regeln oder der Standard gelten. „Deaktiviert“ heißt „Ich verbiete das Gegenteil ausdrücklich“ – so kann man eine andere Regel **überstimmen**.

**Wo liegen die Regeln?** Das **Inhaltsverzeichnis** (Name, Version, wo gültig) steht im Active Directory, der **eigentliche Text** im Ordner **SYSVOL** auf jedem DC.

**Wann wird die Hausordnung verteilt?** Beim Einschalten, beim Anmelden und dann **alle 90 Minuten** von selbst. Ungeduldig? `gpupdate /force` – „Jetzt sofort!“

**Richtlinien vs. Einstellungen (Preferences)**:
- **Richtlinie** = **Gesetz**: Der Benutzer kann es nicht ändern (ausgegraut), und wenn die Regel weg ist, ist auch die Einstellung weg.
- **Einstellung** = **Vorschlag**: z. B. „Laufwerk H: verbinden“. Der Benutzer könnte es ändern. Mit **Zielgruppenadressierung** gilt sie nur für bestimmte Leute („H: nur für die Personalabteilung“).

## Merksatz
- **Computer = beim Start, Benutzer = bei der Anmeldung**, dann alle **90 ± 30 Min.**
- **GPC im AD + GPT im SYSVOL**.
- **Deaktiviert ≠ Nicht konfiguriert**.
- Richtlinie = verwaltet (ausgegraut, wird zurückgenommen), Einstellung = Preference (Tattooing möglich).
- Zentraler Speicher = **PolicyDefinitions im SYSVOL**.

## Prüfungsfalle
- Ordnerumleitung/Softwareinstallation brauchen Vordergrundverarbeitung (Neuanmeldung/Neustart).
- Benutzereinstellungen in einem GPO, das nur mit einer Computer-OU verknüpft ist, wirken nicht (außer Loopback).
- An Container wie „Users“ kann man keine GPO verknüpfen.
- Lokales GPO wird zuerst angewendet und von Domänen-GPOs überschrieben.
- Kontorichtlinien wirken für Domänenkonten nur auf Domänenebene.

## Grafik
### Hausordnung verteilen
DC mit einem GPO-Dokument; Pfeile verteilen es an viele Rechner; Uhr zeigt 90-Minuten-Zyklus; Knopf „gpupdate /force“ schickt es sofort.

### Aufbau eines GPOs
GPO als Buch mit zwei Kapiteln (Computer/Benutzer); Unterkapitel Richtlinien/Einstellungen; Hover zeigt Beispiele. Daneben: Inhaltsverzeichnis im AD (GPC), Seiten im SYSVOL (GPT) – beide mit Versionsnummer, die übereinstimmen muss.

### Verwaltet vs. Tattooing
Registry-Schlüssel füllt sich; GPO wird entfernt: Policy-Schlüssel verschwinden (verwaltet), Preference-Wert bleibt als „Tätowierung“ stehen.

## Karteikarten
- F: Was ist ein GPO? | A: Gruppenrichtlinienobjekt – Container für Computer- und Benutzereinstellungen, verknüpfbar mit Standort, Domäne, OU.
- F: Wann wird die Computerkonfiguration angewendet? | A: Beim Start und danach alle 90 ± 30 Minuten.
- F: Wann wird die Benutzerkonfiguration angewendet? | A: Bei der Anmeldung und danach alle 90 ± 30 Minuten.
- F: Unterschied „Deaktiviert“ und „Nicht konfiguriert“? | A: Deaktiviert erzwingt aktiv das Gegenteil; nicht konfiguriert hat keine Wirkung.
- F: Woraus besteht ein GPO technisch? | A: GPC (im AD) und GPT (im SYSVOL-Ordner Policies\{GUID}).
- F: Was ist der zentrale Speicher? | A: PolicyDefinitions-Ordner im SYSVOL mit ADMX/ADML-Dateien für alle Admins.
- F: Unterschied Richtlinien und Einstellungen (Preferences)? | A: Richtlinien verwaltet/erzwungen, werden zurückgenommen; Preferences nicht erzwungen, können „tätowieren“.
- F: Was ist Zielgruppenadressierung? | A: Preference-Element nur anwenden, wenn Bedingungen (Gruppe, OU, IP, OS …) zutreffen.
- F: Was macht gpupdate /force? | A: Wendet alle Richtlinien erneut an (nicht nur Änderungen).
- F: Welche Einstellungen brauchen eine Neuanmeldung/einen Neustart? | A: Vordergrund-CSEs wie Ordnerumleitung und Softwareinstallation.
- F: Wo stehen Kontorichtlinien der Domäne standardmäßig? | A: In der Default Domain Policy.
- F: Was sind ADMX-Dateien? | A: Beschreibungsdateien der Administrativen Vorlagen (registrierungsbasierte Richtlinien); ADML = Sprachdateien.
- F: Wie oft aktualisieren DCs ihre Richtlinien? | A: Alle 5 Minuten.

## Quiz
? Wann wird die Benutzerkonfiguration eines GPOs erstmals angewendet?
* Bei der Anmeldung des Benutzers
- Beim Start des Computers
- Nur nach gpupdate
- Einmal täglich um Mitternacht

? Wo liegt der Teil eines GPOs mit den eigentlichen Einstellungsdateien?
* Im SYSVOL-Ordner
- In der Registry des DCs
- Im globalen Katalog
- Auf jedem Client unter C:\GPO

? Eine GPO-Einstellung soll eine Einstellung eines übergeordneten GPOs aufheben. Welcher Zustand ist richtig?
* Deaktiviert (bzw. gegenteilig aktiviert)
- Nicht konfiguriert
- Gelöscht
- Ausgeblendet

? Was passiert mit einer verwalteten Richtlinieneinstellung, wenn das GPO entfernt wird?
* Sie wird automatisch zurückgenommen
- Sie bleibt dauerhaft bestehen
- Der Computer startet neu
- Sie wird auf alle OUs kopiert

? Warum wird die Ordnerumleitung nach einem gpupdate nicht sofort wirksam?
* Sie wird nur bei der Anmeldung im Vordergrund verarbeitet
- Sie funktioniert nur auf Servern
- Sie benötigt DHCP
- Sie gilt nur für Computer
