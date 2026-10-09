---
id: ap1-a6-druckserver
bereich: AP1
block: A6
kapitel: Windows Server
titel: Druckserver & Druckverwaltung
stufe: Fortgeschritten
quellen: [Server_2008_R2_-_70_642_2nd_de.pdf, 14_Übung_Drucker_Scanner.pdf]
verweise: [ap1-a1-drucker, ap1-a6-gpo-grundlagen, ap1-a6-freigaben]
---

## Profi

### Begriffe (Microsoft-Terminologie)
| Begriff | Bedeutung |
|---|---|
| **Druckgerät** | die physische Hardware (der „Drucker“ im Alltag) |
| **Drucker** (logischer Drucker) | die **Software-Schnittstelle** in Windows: Treiber + Anschluss + Einstellungen + Warteschlange |
| **Druckwarteschlange / Spooler** | Dienst **Druckwarteschlange** (`Spooler`), speichert Aufträge zwischen (`C:\Windows\System32\spool\PRINTERS`) und schickt sie ans Gerät |
| **Druckertreiber** | übersetzt die Daten in die Druckersprache (PCL, PostScript); Version 3 (klassisch) oder **Version 4** (vereinfacht, weniger Abhängigkeiten) |
| **Anschluss (Port)** | Verbindung zum Gerät: **Standard-TCP/IP-Port** (RAW 9100 oder LPR 515), WSD, USB, LPT |
| **Druckserver** | Windows Server mit der Rolle **Druck- und Dokumentdienste**, stellt freigegebene Drucker zentral bereit |

### Warum ein Druckserver?
- **Zentrale Verwaltung**: Treiber, Warteschlangen, Berechtigungen und Einstellungen an einer Stelle.
- **Treiberverteilung**: Clients laden den Treiber beim Verbinden automatisch vom Server (Point and Print).
- **Überwachung**: Auftragslisten, Fehler, Tonerstatus, Benachrichtigungen, Protokollierung (wer druckt wie viel).
- **Druckerpools** und **Prioritäten** möglich; Verteilung per **GPO**.
- Nachteil: **Single Point of Failure** (Hochverfügbarkeit per Cluster-Rolle ist ab Server 2012 abgekündigt → zweiter Server/Migration mit `printbrm`) und Angriffsfläche (**PrintNightmare** 2021 → Spooler aktuell halten, auf DCs **deaktivieren**, Point and Print nur für Admins erlauben).

### Rolle „Druck- und Dokumentdienste“
Rollendienste: **Druckserver**, Internetdrucken (IPP über IIS, veraltet), LPD-Dienst (für UNIX-Clients), Verteilte Scanverwaltung (entfernt). Verwaltungskonsole: **Druckverwaltung** (`printmanagement.msc`) – zeigt Server, Drucker, Treiber, Anschlüsse, benutzerdefinierte Filter („Drucker nicht bereit“, „Drucker mit Aufträgen“), Bereitstellung per GPO.

### Druckerpool und Prioritäten
- **Druckerpool**: **Ein logischer Drucker → mehrere gleiche Druckgeräte** (Anschlüsse-Registerkarte: „Druckerpool aktivieren“ + mehrere Ports). Aufträge gehen an das nächste freie Gerät – Lastverteilung/Ausfallsicherheit. Geräte sollten **nebeneinander** stehen (Benutzer wissen nicht, wo der Ausdruck landet).
- **Priorität**: **Mehrere logische Drucker → ein Druckgerät**, mit unterschiedlicher **Priorität** (1 = niedrig, 99 = hoch). Beispiel: Drucker „Chef“ (Priorität 99, nur Geschäftsleitung) und „Alle“ (Priorität 1) auf dasselbe Gerät → Aufträge der Chefs werden vorgezogen.
- **Verfügbarkeit**: Drucker nur zu bestimmten Zeiten (z. B. große Aufträge nachts).

### Druckerberechtigungen
| Berechtigung | erlaubt | Standard |
|---|---|---|
| **Drucken** | drucken, eigene Aufträge verwalten | Jeder |
| **Dokumente verwalten** | **alle** Aufträge anhalten, fortsetzen, löschen, neu starten | Ersteller-Besitzer (für eigene Dokumente) |
| **Drucker verwalten** | Einstellungen, Freigabe, Berechtigungen, Treiber ändern | Administratoren, Druck-Operatoren |
Delegation z. B.: Sekretariat bekommt „Dokumente verwalten“ für den Abteilungsdrucker.

### Drucker bereitstellen
- **Manuell**: `\\PRINT01\Drucker-EG` öffnen bzw. Einstellungen → Drucker hinzufügen.
- **Per GPO (Druckverwaltung)**: Rechtsklick Drucker → **Mit Gruppenrichtlinie bereitstellen** (pro Benutzer oder pro Computer).
- **Per GPO-Einstellungen (Preferences)**: Benutzerkonfiguration → Einstellungen → Systemsteuerungseinstellungen → **Drucker** → Freigegebener Drucker, mit **Zielgruppenadressierung** (z. B. nur OU Vertrieb, nur IP-Bereich 2. OG) und „als Standard festlegen“ – heute der übliche Weg.
- **Standortabhängig**: Standortbewusstes Drucken, Location-Attribut in AD.
- **Im AD veröffentlichen**: Haken „In Verzeichnis anzeigen“ → Benutzer können Drucker im AD suchen.
- **Point-and-Print-Einschränkungen** (GPO): nur genehmigte Server, Treiberinstallation nur für Admins (seit PrintNightmare Standard).

### Treiber
Treiber für **x64** (und ggf. ARM64) auf dem Server hinterlegen; **Treiberisolation** (Treiber läuft in eigenem Prozess, Absturz reißt Spooler nicht mit); **Universaldrucktreiber** der Hersteller vereinfachen die Verwaltung. Moderner Ansatz: **Windows Protected Print Mode** (nur Microsoft-IPP-Klassentreiber, Mopria) bzw. **Universal Print** (Cloud-Druckdienst in Microsoft 365, kein lokaler Druckserver nötig).

### Troubleshooting
| Problem | Lösung |
|---|---|
| Aufträge hängen in der Warteschlange | Dienst Druckwarteschlange neu starten, ggf. `spool\PRINTERS` leeren |
| Gerät nicht erreichbar | ping, Port 9100/515 testen (`Test-NetConnection -Port 9100`), IP geändert? → DHCP-Reservierung |
| Falscher Ausdruck/Zeichensalat | falscher Treiber/Druckersprache |
| Treiber lässt sich nicht installieren | Point-and-Print-Einschränkungen, fehlende Architektur, Admin-Rechte |
| Spooler stürzt ab | Treiberisolation, fehlerhaften Treiber entfernen |
| „Drucker geht nicht“ allgemein | Papier? Toner? Strom? Netzwerkkabel? Offline-Modus? Standarddrucker? Neustart? 😉 |

## Lab
**Maschinen**: PRINT01 (Windows Server, Domänenmitglied), DC01, CL01. Ein Netzwerkdrucker mit IP 192.168.1.50 (ohne echtes Gerät: Anschluss trotzdem anlegen, Aufträge bleiben in der Warteschlange).

### GUI
1. **PRINT01**: Server-Manager → Rollen → **Druck- und Dokumentdienste** → Rollendienst **Druckserver** → Installieren.
2. Tools → **Druckverwaltung** → Druckserver → PRINT01 → **Drucker** → Rechtsklick **Drucker hinzufügen** → „Neuen TCP/IP- oder Webdienst-Drucker per IP-Adresse …“ → 192.168.1.50 → Treiber wählen (z. B. „Microsoft PCL6 Class Driver“ oder Herstellertreiber) → Name **Drucker-EG**, **freigeben**, „In Verzeichnis anzeigen“.
3. Drucker-EG → Eigenschaften → **Sicherheit** → Gruppe **GG-Sekretariat** → **Dokumente verwalten**.
4. **Druckerpool**: Zweiten Anschluss 192.168.1.51 anlegen → Drucker-EG → Anschlüsse → „**Druckerpool aktivieren**“ → beide Ports anhaken.
5. **Priorität**: Zweiten Drucker **Drucker-EG-Chef** auf denselben Anschluss/Treiber → Erweitert → **Priorität 99**, Sicherheit: nur **GG-Geschäftsleitung** „Drucken“.
6. **DC01**: `gpmc.msc` → GPO „Drucker Vertrieb“ an OU Vertrieb → Benutzerkonfiguration → Einstellungen → Systemsteuerungseinstellungen → **Drucker** → Neu → **Freigegebener Drucker** → Aktion **Aktualisieren** → `\\PRINT01\Drucker-EG` → **Als Standarddrucker festlegen** → Registerkarte Gemeinsam → **Zielgruppenadressierung** → Sicherheitsgruppe GG-Vertrieb.
7. **CL01**: Vertriebsbenutzer neu anmelden → Drucker vorhanden und Standard → Testseite → **PRINT01**: Warteschlange ansehen, Auftrag anhalten/löschen.

### PowerShell
```powershell
# Auf PRINT01
Install-WindowsFeature Print-Server -IncludeManagementTools
Add-PrinterPort -Name "IP_192.168.1.50" -PrinterHostAddress "192.168.1.50"
Add-PrinterPort -Name "IP_192.168.1.51" -PrinterHostAddress "192.168.1.51"
Add-PrinterDriver -Name "Microsoft PCL6 Class Driver"
Add-Printer -Name "Drucker-EG" -DriverName "Microsoft PCL6 Class Driver" -PortName "IP_192.168.1.50,IP_192.168.1.51" `
  -Shared -ShareName "Drucker-EG" -Published -Location "EG Flur"
Add-Printer -Name "Drucker-EG-Chef" -DriverName "Microsoft PCL6 Class Driver" -PortName "IP_192.168.1.50" `
  -Shared -ShareName "Drucker-EG-Chef" -Priority 99
Get-Printer | Format-Table Name, PortName, Shared, Priority
Get-PrintJob -PrinterName "Drucker-EG"
Restart-Service Spooler

# Druckwarteschlange auf dem DC deaktivieren (PrintNightmare-Härtung) – auf DC01
Stop-Service Spooler; Set-Service Spooler -StartupType Disabled

# Auf CL01
Add-Printer -ConnectionName "\\PRINT01\Drucker-EG"
(Get-CimInstance Win32_Printer -Filter "ShareName='Drucker-EG'") | Invoke-CimMethod -MethodName SetDefaultPrinter
```

## Einfach

Im Alltag sagt man zu dem Kasten, der Papier ausspuckt, „Drucker“. Microsoft ist da genauer:
- Der **Kasten** heißt **Druckgerät**.
- Der **„Drucker“** ist das **Symbol im Computer** – quasi die **Bestell-Theke**, an der deine Aufträge angenommen werden.

**Der Druckserver** ist wie eine **zentrale Poststelle**: Alle schicken ihre Druckaufträge dorthin, die Poststelle stellt sie in eine **Warteschlange** und gibt sie der Reihe nach an die Druckgeräte weiter. Vorteil: Der Admin muss Treiber und Einstellungen nur **an einer Stelle** pflegen, und jeder PC holt sich den passenden Treiber automatisch.

**Druckerpool** = **eine Theke, mehrere Geräte**: Wie bei einer Kasse mit mehreren Kassierern – dein Auftrag geht zum nächsten freien Gerät. (Die Geräte sollten nebeneinander stehen, sonst suchst du deinen Ausdruck im ganzen Haus.)

**Priorität** = **zwei Theken, ein Gerät**: Die Chef-Theke ist die **Überholspur** – deren Aufträge werden zuerst gedruckt.

**Berechtigungen**: „Drucken“ darf jeder, „Dokumente verwalten“ (fremde Aufträge löschen) nur das Sekretariat, „Drucker verwalten“ nur der Admin.

**Und das berühmte Ticket „Drucker geht nicht“?** Meistens: Papier leer, Toner leer, Kabel ab, Warteschlange hängt (Druckwarteschlange neu starten), oder der falsche Drucker ist als Standard eingestellt. Der Stickman in der App weiß, wovon er spricht! 🏃

## Merksatz
- **Druckgerät = Hardware**, **Drucker = logische Warteschlange + Treiber**.
- **Pool: 1 Drucker → n Geräte**, **Priorität: n Drucker → 1 Gerät** (99 = höchste).
- Rechte: **Drucken – Dokumente verwalten – Drucker verwalten**.
- Verteilung per **GPO-Einstellungen + Zielgruppenadressierung**.
- Spooler auf **DCs deaktivieren** (PrintNightmare).

## Prüfungsfalle
- Pool und Priorität verwechselt.
- Priorität 1 ist die **niedrigste**, 99 die höchste.
- „Dokumente verwalten“ erlaubt keine Änderung der Druckereinstellungen.
- Druckerpool mit unterschiedlichen Gerätemodellen → Treiberprobleme.
- Port 9100 = RAW, 515 = LPR/LPD.

## Grafik
### Poststelle
Clients schicken Briefe (Aufträge) zum Druckserver, sie reihen sich in der Warteschlange ein und laufen zum Gerät; Knopf „Spooler hängt“ staut alles; „Dienst neu starten“ löst den Stau.

### Pool vs. Priorität
Links: eine Theke, drei Geräte – Aufträge verteilen sich. Rechts: zwei Theken (Chef grün mit 99, Alle grau mit 1), ein Gerät – Chef-Aufträge überholen.

### GPO-Druckerverteilung
Benutzer aus OU Vertrieb meldet sich an, Drucker-Symbol fliegt auf seinen Desktop und bekommt einen Standard-Haken; Benutzer aus OU Technik bekommt ihn nicht (Zielgruppenadressierung).

## Karteikarten
- F: Unterschied Drucker und Druckgerät (Microsoft)? | A: Druckgerät = Hardware; Drucker = logische Schnittstelle mit Treiber, Port, Warteschlange.
- F: Was ist ein Druckerpool? | A: Ein logischer Drucker verteilt Aufträge auf mehrere gleiche Druckgeräte.
- F: Wie priorisiert man Aufträge einer Gruppe? | A: Zweiten logischen Drucker für dasselbe Gerät mit höherer Priorität (bis 99) und passenden Rechten.
- F: Drei Druckerberechtigungen? | A: Drucken, Dokumente verwalten, Drucker verwalten.
- F: Welche Rolle macht einen Server zum Druckserver? | A: Druck- und Dokumentdienste (Rollendienst Druckserver).
- F: Wie heißt die Verwaltungskonsole? | A: Druckverwaltung (printmanagement.msc).
- F: Wie verteilt man Drucker gezielt an eine Abteilung? | A: GPO-Einstellungen (Drucker) mit Zielgruppenadressierung.
- F: Welcher Dienst verwaltet Druckaufträge? | A: Druckwarteschlange (Spooler).
- F: Warum Spooler auf DCs deaktivieren? | A: Angriffsfläche (PrintNightmare); DCs brauchen keinen Druckdienst.
- F: Standardport für RAW-Druck? | A: TCP 9100.
- F: Was ist Treiberisolation? | A: Druckertreiber läuft in einem eigenen Prozess, damit ein Treiberabsturz den Spooler nicht beendet.

## Quiz
? Drei identische Laserdrucker stehen nebeneinander, Aufträge sollen automatisch verteilt werden. Was richtet man ein?
* Einen Druckerpool
- Drei Druckprioritäten
- Einen WSD-Port
- Eine Verteilergruppe

? Welche Priorität ist die höchste?
* 99
- 1
- 0
- 100

? Welche Berechtigung braucht das Sekretariat, um fremde Druckaufträge zu löschen?
* Dokumente verwalten
- Drucken
- Drucker verwalten
- Vollzugriff auf C:\Windows

? Druckaufträge bleiben in der Warteschlange hängen. Erster sinnvoller Schritt?
* Dienst „Druckwarteschlange“ neu starten
- Domänencontroller neu installieren
- DHCP-Bereich löschen
- NTFS-Vererbung deaktivieren

? Wie werden Drucker heute bevorzugt benutzerabhängig verteilt?
* Über Gruppenrichtlinien-Einstellungen mit Zielgruppenadressierung
- Durch manuelle Installation an jedem Client
- Über den DNS-Server
- Über die Kontosperrungsrichtlinie

? Welcher Dienst verwaltet unter Windows die Druckwarteschlangen?
* Druckwarteschlange (Spooler)
- Windows Update
- Server (LanmanServer)
- Netlogon
! Bei hängenden Aufträgen Spooler neu starten.

? Welche Konsole dient zur zentralen Verwaltung von Druckservern?
* Druckverwaltung (printmanagement.msc)
- Geräte-Manager
- Datenträgerverwaltung
- Ereignisanzeige
! Dort werden Drucker, Treiber und Anschlüsse verwaltet und per GPO bereitgestellt.

? Welche Berechtigung braucht ein Benutzer standardmäßig, um zu drucken?
* Drucken
- Drucker verwalten
- Dokumente verwalten
- Vollzugriff auf den Spoolordner
! „Dokumente verwalten“ erlaubt das Steuern fremder Aufträge.
