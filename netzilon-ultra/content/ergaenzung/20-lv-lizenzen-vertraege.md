---
id: erg-lizenzen-vertraege
bereich: AP2
block: ERG
kapitel: Ergänzungen 2.2
titel: Softwarelizenzen und IT-Verträge – Lizenzmodelle, Windows-Server-Lizenzierung, Open Source, Vertragsarten und Mängelrechte
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP1, AP2, WiSo]
quellen: [UrhG §§ 69a ff. (Computerprogramme), BGB §§ 433 ff., 535 ff., 611 ff., 631 ff., HGB § 377, Microsoft Product Terms – Windows Server 2022/2025 Lizenzierung, GNU GPL v3, MIT License, EuGH C-128/11 (UsedSoft)]
verweise: [ap2-beschaffung, ap2-vertraege, server-pv-lizenz-service-miet-leasingvertrag, server-pv-werk-dienstvertrag-sla, server-pv-verzug-maengel-gewaehrleistung, server-pv-vertragsgrundlagen-kaufvertrag, linux-ess-open-source-lizenzen, wiso-kaufvertrag]
---

## Profi

### Lizenz = Nutzungsrecht
Software ist urheberrechtlich geschützt (**§§ 69a ff. UrhG**). Wer Software „kauft“, erwirbt in der Regel kein Eigentum am Programm, sondern ein **Nutzungsrecht** zu den Bedingungen des **Lizenzvertrags (EULA)**. Unterlizenzierung ist eine Urheberrechtsverletzung (Unterlassung, Schadensersatz, Nachlizenzierung); ein **Lizenzmanagement (Software Asset Management)** dokumentiert Bestand, Zuordnung und Nachweise.

### Lizenzmodelle
| Modell | Merkmal |
|---|---|
| **OEM** | mit neuer Hardware ausgeliefert, an das Gerät gebunden, nicht auf neue Hardware übertragbar |
| **Retail/Box (FPP)** | Einzelhandelsversion, auf anderes Gerät übertragbar (nach Deinstallation) |
| **Volumenlizenz** | Rahmenverträge für Organisationen, zentrale Verwaltung, oft mit Software Assurance (Upgraderechte) |
| **Abonnement (Subscription)** | zeitlich befristet, laufende Gebühr, inkl. Updates (z. B. Microsoft 365 über CSP) |
| **Named User / pro Benutzer** | je benannter Person, egal wie viele Geräte |
| **pro Gerät** | je Gerät, egal wie viele Benutzer |
| **Concurrent/Floating** | maximale Anzahl **gleichzeitiger** Nutzungen, Lizenzserver verteilt |
| **Core-basiert** | nach Anzahl physischer Prozessorkerne |

### Windows Server 2022/2025 (Standard und Datacenter)
- Lizenziert werden **alle physischen Kerne** des Servers, **mindestens 8 Kerne je Prozessor** und **mindestens 16 Kerne je Server**; Core-Lizenzen werden in **2-Kern-Paketen** verkauft.
- **Standard**: berechtigt bei vollständiger Lizenzierung aller Kerne zu **2 virtuellen Betriebssystemumgebungen (VMs)**; für jeweils 2 weitere VMs müssen alle Kerne erneut lizenziert werden.
- **Datacenter**: **unbegrenzt viele** Windows-Server-VMs auf dem lizenzierten Host – lohnt sich bei hoher VM-Dichte.
- Zusätzlich brauchen Benutzer oder Geräte, die auf den Server zugreifen, **Client Access Licenses (CALs)** – als **User-CAL** oder **Device-CAL**; für Remotedesktop-Sitzungen zusätzlich **RDS-CALs**.
Beispiel: Server mit 2 Prozessoren à 12 Kernen = 24 Kerne → 24 Core-Lizenzen (12 Zweierpakete). Für 4 VMs mit Standard: 2 × 24 = 48 Core-Lizenzen; Datacenter ist ab einer bestimmten VM-Zahl günstiger.

### Open Source und andere Formen
- **Open Source**: Quellcode offen, Nutzung, Änderung, Weitergabe erlaubt – unter Bedingungen der Lizenz.
- **Copyleft** (**GPL**): Wer veränderte Versionen **weitergibt**, muss sie ebenfalls unter der GPL mit Quellcode weitergeben. **LGPL**: schwaches Copyleft (Bibliotheken dürfen von proprietärer Software genutzt werden).
- **Permissiv** (**MIT**, **BSD**, **Apache 2.0**): Weiterverwendung auch in proprietärer Software erlaubt, Lizenz- und Copyright-Hinweis beibehalten.
- **Freeware** (kostenlos, aber Quellcode nicht offen, oft nur privat), **Shareware** (Testversion, später kostenpflichtig), **Public Domain** (in Deutschland kein Verzicht auf Urheberrecht möglich, nur weitgehende Nutzungsrechte).
- Gebrauchte Lizenzen: Nach dem **EuGH-Urteil UsedSoft (C-128/11, 2012)** ist der Weiterverkauf dauerhaft erworbener Softwarelizenzen grundsätzlich zulässig (Erschöpfungsgrundsatz), wenn der Verkäufer seine Kopie unbrauchbar macht.

### Vertragsarten im IT-Geschäft
| Vertrag | BGB | geschuldet | IT-Beispiel |
|---|---|---|---|
| **Kaufvertrag** | §§ 433 ff. | Übergabe und Eigentum an einer Sache | Kauf von Notebooks |
| **Werkvertrag** | §§ 631 ff. | **Erfolg** (Werk), **Abnahme** | Einrichtung eines funktionierenden Netzwerks, Individualsoftware |
| **Dienstvertrag** | §§ 611 ff. | **Tätigkeit**, kein Erfolg | Support-Hotline nach Stunden, IT-Beratung |
| **Mietvertrag** | §§ 535 ff. | Gebrauchsüberlassung gegen Entgelt, Vermieter erhält Gebrauchstauglichkeit | Server-Miete, Softwaremiete (ASP) |
| **Leasingvertrag** | gesetzlich nicht eigens geregelt (mietähnlich) | Gebrauchsüberlassung, Leasinggeber finanziert; Gefahr/Instandhaltung meist beim Leasingnehmer | Leasing von Kopierern/PCs |
| **Werklieferungsvertrag** | § 650 | herzustellende bewegliche Sache, Kaufrecht anwendbar | individuell konfigurierter Server |

### Mängelrechte (Gewährleistung) beim Kauf
**Sachmangel** (§ 434 BGB) bei Abweichung von vereinbarter Beschaffenheit, gewöhnlicher Verwendung, Montagefehler oder falscher Lieferung. Reihenfolge der Rechte: **1. Nacherfüllung** (Nachbesserung oder Ersatzlieferung, Wahl beim Käufer) → bei Scheitern **2. Rücktritt** oder **Minderung**, ggf. **Schadensersatz**. **Verjährung**: in der Regel **2 Jahre** ab Ablieferung (§ 438). Beim **Verbrauchsgüterkauf** wird innerhalb eines Jahres vermutet, dass der Mangel schon bei Übergabe bestand (Beweislastumkehr). Unter Kaufleuten gilt die **unverzügliche Rügepflicht** (§ 377 HGB). Eine **Garantie** ist eine **freiwillige** Zusatzleistung von Händler oder Hersteller.

## Einfach
Wenn du ein **Buch** kaufst, darfst du es lesen, verleihen oder verkaufen – aber du darfst es nicht abschreiben und als dein eigenes Buch verkaufen. Mit **Software** ist es ähnlich: Du kaufst nicht das Programm selbst, sondern die **Erlaubnis, es zu benutzen**. Diese Erlaubnis heißt **Lizenz**. Was genau erlaubt ist, steht im Lizenzvertrag.

Es gibt verschiedene Arten von Erlaubnis:
- **Pro Gerät** – wie eine Kinokarte für einen bestimmten Platz.
- **Pro Person** – wie ein Monatsticket, das nur du benutzen darfst, egal in welchem Bus.
- **Gleichzeitig** – wie Leihfahrräder: 10 Räder, und wer eins bekommt, fährt, bis er es zurückgibt.
- **Abo** – wie ein Streamingdienst: Solange du zahlst, darfst du es nutzen.

**Open Source** ist wie ein Rezept, das jeder lesen und verbessern darf. Bei manchen Rezepten (**GPL**) gilt: Wenn du deine verbesserte Version weitergibst, musst du dein Rezept auch offenlegen. Bei anderen (**MIT**) darfst du es fast frei verwenden – du musst nur sagen, woher es stammt.

Auch bei **Verträgen** gibt es Unterschiede: Beim **Kauf** gehört dir die Sache danach. Bei der **Miete** darfst du sie nur benutzen. Beim **Werkvertrag** bezahlst du für ein **fertiges Ergebnis** – das Netzwerk muss am Ende funktionieren. Beim **Dienstvertrag** bezahlst du für die **Arbeitszeit** – wie bei einem Nachhilfelehrer, der nicht garantieren kann, dass du eine Eins schreibst.

Und wenn etwas kaputt ist, das du gekauft hast? Dann darf der Verkäufer es erst einmal **reparieren oder austauschen**. Erst wenn das nicht klappt, bekommst du Geld zurück.

## Merksatz
- **Lizenz = Nutzungsrecht, nicht Eigentum.**
- **OEM klebt am Gerät, Retail wandert mit.**
- **Windows Server: alle Kerne, min. 8 je CPU, min. 16 je Server; Standard 2 VMs, Datacenter unbegrenzt; plus CALs.**
- **GPL: Weitergabe nur mit Quellcode unter GPL. MIT: fast alles erlaubt, Hinweis behalten.**
- **Werkvertrag = Erfolg + Abnahme, Dienstvertrag = Tätigkeit.**
- **Mängel: erst Nacherfüllung, dann Rücktritt/Minderung.**

## Prüfungsfalle
- **OEM-Lizenzen** dürfen nicht auf einen neuen PC übertragen werden.
- Windows Server Standard deckt **nicht** beliebig viele VMs ab – nur 2 je vollständiger Kernlizenzierung.
- **CALs** werden zusätzlich zur Serverlizenz benötigt (auch bei Core-Lizenzierung).
- Die GPL verbietet **nicht** den kommerziellen Einsatz – sie regelt die Weitergabe.
- **Garantie ≠ Gewährleistung**: Gewährleistung ist gesetzlich, Garantie freiwillig.
- Beim **Werkvertrag** ist die **Abnahme** entscheidend (Fälligkeit der Vergütung, Beginn der Verjährung).

## Grafik
### Windows-Server-Lizenz berechnen
1. Admin: Host mit 2 CPUs à 10 Kernen = 20 Kerne
2. Admin: Mindestens 16 je Server, 8 je CPU – erfüllt, 20 Core-Lizenzen
3. Admin: Standard deckt 2 VMs ab
4. Admin: Für 6 VMs Standard 3 × 20 = 60 Core-Lizenzen
5. Admin: Vergleich mit Datacenter (20 Core-Lizenzen, unbegrenzt VMs)
6. Admin: CALs für alle Benutzer oder Geräte ergänzen

### Mängelrechte beim Kauf
1. Käufer -> Verkäufer: Mangel anzeigen (Kaufleute: unverzüglich rügen)
2. Verkäufer -> Käufer: Nacherfüllung – Reparatur oder Ersatz
3. Käufer: Nacherfüllung gescheitert
4. Käufer -> Verkäufer: Rücktritt oder Minderung, ggf. Schadensersatz

## Lab
**Maschinen**: Hyper-V-Host **HV01** (Windows Server 2025) und Client **CL01** im Heimlabor **example.com**.

### GUI
1. **HV01**: Einstellungen bzw. `slmgr /dlv` → Edition, Lizenzkanal (OEM, Retail, Volume) und Aktivierungsstatus ablesen.
2. **HV01**: Task-Manager → Leistung → CPU → Anzahl Sockel und Kerne notieren → Core-Lizenzen berechnen.
3. **CL01**: Einstellungen → System → Aktivierung → Status und Lizenzart prüfen.
4. **CL01**: Inventarliste „Lizenzen“ anlegen: Produkt, Modell, Anzahl, Zuordnung, Nachweis, Laufzeit.

### PowerShell
```powershell
# HV01 – Kerne und Prozessoren für die Lizenzberechnung
Get-CimInstance Win32_Processor | Select-Object SocketDesignation, NumberOfCores
$kerne = (Get-CimInstance Win32_Processor | Measure-Object NumberOfCores -Sum).Sum
$sockel = (Get-CimInstance Win32_Processor).Count
$lizenz = [Math]::Max([Math]::Max($kerne, 8 * $sockel), 16)
"Physische Kerne: $kerne – zu lizenzieren: $lizenz Core-Lizenzen"
Get-CimInstance SoftwareLicensingProduct -Filter "PartialProductKey IS NOT NULL" | Select-Object Name, LicenseStatus
```

## Legende
### Client Access License (CAL)
- Was: Zugriffslizenz für Benutzer oder Geräte, die Dienste eines Windows Servers nutzen.
- Wie: Als User-CAL (je Person) oder Device-CAL (je Gerät), zusätzlich zur Serverlizenz; RDS-CAL für Remotedesktop.
- Wann: Sobald Benutzer/Geräte auf Server-Dienste zugreifen (Datei, Druck, Anmeldung …).
- Wo: Lizenznachweis im Volumenlizenzportal; RDS-CALs zusätzlich auf dem RD-Lizenzserver.
- Warum: Microsoft lizenziert Server nach Kernen und den Zugriff separat.

### Werkvertrag
- Was: Vertrag, bei dem ein bestimmter Erfolg (Werk) geschuldet ist (§§ 631 ff. BGB).
- Wie: Unternehmer erstellt das Werk, Besteller nimmt es ab und zahlt die Vergütung.
- Wann: Bei Projekten mit definiertem Ergebnis, z. B. Netzwerkinstallation, Individualsoftware.
- Wo: Projektverträge, Pflichtenheft als Leistungsbeschreibung, Abnahmeprotokoll.
- Warum: Der Auftraggeber bezahlt für ein funktionierendes Ergebnis, nicht nur für Zeit.

## Karteikarten
- F: Was erwirbt man beim „Kauf“ von Software in der Regel? | A: Ein Nutzungsrecht (Lizenz) zu den Bedingungen des Lizenzvertrags, kein Eigentum am Programm.
- F: Was kennzeichnet eine OEM-Lizenz? | A: Sie wird mit neuer Hardware ausgeliefert und ist an dieses Gerät gebunden.
- F: Was ist eine Concurrent-Lizenz? | A: Eine Lizenz für eine bestimmte Anzahl gleichzeitiger Nutzungen, unabhängig von benannten Benutzern.
- F: Wie viele Core-Lizenzen braucht ein Windows Server mit einer CPU à 4 Kernen? | A: 16 (Minimum 16 je Server).
- F: Wie viele VMs deckt Windows Server Standard bei vollständiger Kernlizenzierung ab? | A: 2 virtuelle Betriebssystemumgebungen.
- F: Was ist der Unterschied zwischen User-CAL und Device-CAL? | A: User-CAL je Person (beliebig viele Geräte), Device-CAL je Gerät (beliebig viele Benutzer).
- F: Was bedeutet Copyleft? | A: Veränderte Versionen dürfen nur unter derselben Lizenz (mit Quellcode) weitergegeben werden, z. B. GPL.
- F: Unterschied Werkvertrag und Dienstvertrag? | A: Werkvertrag: Erfolg geschuldet, Abnahme. Dienstvertrag: Tätigkeit geschuldet, kein Erfolg.
- F: Welche Rechte hat der Käufer bei einem Mangel zuerst? | A: Nacherfüllung – Nachbesserung oder Ersatzlieferung nach Wahl des Käufers.
- F: Wie lange verjähren Mängelansprüche beim Kauf beweglicher Sachen in der Regel? | A: 2 Jahre ab Ablieferung (§ 438 BGB).

## Quiz
? Ein Unternehmen kauft neue PCs und möchte die Windows-Lizenzen der alten OEM-Geräte übertragen. Ist das zulässig?
* Nein, OEM-Lizenzen sind an die ursprüngliche Hardware gebunden.
- Ja, jederzeit ohne Einschränkung.
- Ja, wenn die alten PCs weiterlaufen.
- Nur bei mehr als 5 PCs.
! Übertragbar sind z. B. Retail-Lizenzen.

? Ein Server hat 2 CPUs à 6 Kernen. Wie viele Windows-Server-Core-Lizenzen sind mindestens nötig?
* 16
- 12
- 8
- 24
! 12 physische Kerne, aber Minimum 8 je CPU (= 16) und 16 je Server.

? Welche Edition erlaubt unbegrenzt viele Windows-Server-VMs auf einem lizenzierten Host?
* Datacenter
- Standard
- Essentials
- Home
! Standard deckt 2 VMs je vollständiger Kernlizenzierung ab.

? Was benötigen 50 Mitarbeiter mit je einem PC und einem Notebook für den Zugriff auf einen Dateiserver am günstigsten?
* 50 User-CALs
- 100 Device-CALs
- 50 Device-CALs
- Keine CALs
! Bei mehreren Geräten pro Person sind User-CALs günstiger.

? Welche Lizenz verlangt, dass weitergegebene veränderte Versionen ebenfalls offen und unter derselben Lizenz stehen?
* GPL
- MIT
- BSD
- Freeware
! Das ist das Copyleft-Prinzip.

? Eine Firma beauftragt die Installation eines funktionierenden WLANs zum Festpreis. Welcher Vertrag liegt vor?
* Werkvertrag
- Dienstvertrag
- Mietvertrag
- Leihvertrag
! Geschuldet ist der Erfolg (funktionierendes WLAN), mit Abnahme.

? Was gilt bei einem Mangel an einem gekauften Notebook zuerst?
* Nacherfüllung (Reparatur oder Ersatz)
- Sofortiger Rücktritt
- Minderung ohne Fristsetzung
- Garantie des Herstellers
! Erst nach erfolgloser Nacherfüllung folgen Rücktritt oder Minderung.

? Ein IT-Dienstleister stellt eine Support-Hotline nach Stunden bereit, ohne einen bestimmten Erfolg zu schulden. Welcher Vertrag ist das?
* Dienstvertrag
- Werkvertrag
- Kaufvertrag
- Werklieferungsvertrag
! Geschuldet ist die Tätigkeit.

? Was ist eine Garantie?
* Eine freiwillige Zusatzleistung von Hersteller oder Händler
- Die gesetzliche Mängelhaftung
- Ein anderes Wort für Gewährleistung
- Eine Pflicht nach § 377 HGB
! Gewährleistung ist gesetzlich, Garantie vertraglich-freiwillig.

## Lücken
- Eine {OEM}-Lizenz ist an die Hardware gebunden.
- Windows Server wird nach physischen {Kernen} lizenziert, mindestens {16} je Server.
- Für den Zugriff auf Serverdienste benötigt man zusätzlich {CALs|Client Access Licenses}.
- Beim {Werkvertrag} ist ein Erfolg geschuldet.
- Bei einem Sachmangel hat der Käufer zuerst Anspruch auf {Nacherfüllung}.

## Zuordnen
### Lizenzmodell und Merkmal
- OEM => an das Gerät gebunden
- Retail => übertragbar auf andere Hardware
- Abonnement => zeitlich befristet mit laufender Gebühr
- Concurrent => Anzahl gleichzeitiger Nutzungen
- Core-basiert => nach physischen Prozessorkernen

### Vertragsart und Beispiel
- Kaufvertrag => Kauf von 20 Notebooks
- Werkvertrag => Installation eines funktionierenden Netzwerks
- Dienstvertrag => IT-Beratung nach Stunden
- Mietvertrag => Server im Rechenzentrum mieten
- Leasingvertrag => Multifunktionsdrucker über 48 Monate

### Open-Source-Lizenz und Typ
- GPL => starkes Copyleft
- LGPL => schwaches Copyleft
- MIT => permissiv
- Apache 2.0 => permissiv mit Patentklausel

## Reihenfolge
### Mängelrechte beim Kauf
1. Mangel feststellen und dem Verkäufer anzeigen
2. Nacherfüllung verlangen (Reparatur oder Ersatz)
3. Angemessene Frist setzen
4. Nach Scheitern Rücktritt oder Minderung erklären
5. Gegebenenfalls Schadensersatz geltend machen

### Windows-Server-Lizenzbedarf ermitteln
1. Physische Prozessoren und Kerne zählen
2. Mindestwerte anwenden (8 je CPU, 16 je Server)
3. Anzahl benötigter VMs festlegen
4. Standard und Datacenter rechnerisch vergleichen
5. CALs (User oder Device) und ggf. RDS-CALs ergänzen

### Software Asset Management
1. Installierte Software inventarisieren
2. Lizenznachweise erfassen
3. Bestand und Nutzung abgleichen
4. Über- oder Unterlizenzierung bereinigen
5. Prozess für Beschaffung und Ausscheiden festlegen

## Freitext
- F: Erläutern Sie den Unterschied zwischen Werkvertrag und Dienstvertrag und nennen Sie je ein IT-Beispiel. | M: Werkvertrag: Erfolg geschuldet, Abnahme, Mängelrechte – z. B. Einrichtung eines Netzwerks zum Festpreis. Dienstvertrag: Tätigkeit geschuldet, kein Erfolg – z. B. Support/Beratung nach Stunden. | P: 4
- F: Ein Host hat 2 CPUs à 16 Kernen; geplant sind 8 Windows-Server-VMs. Vergleichen Sie den Bedarf an Core-Lizenzen für Standard und Datacenter. | M: 32 physische Kerne. Standard: je 2 VMs 32 Core-Lizenzen → 8 VMs = 4 × 32 = 128 Core-Lizenzen Standard. Datacenter: 32 Core-Lizenzen, unbegrenzt VMs. Preisvergleich entscheidet, bei 8 VMs ist Datacenter meist günstiger. | P: 5
- F: Erklären Sie die Bedeutung der GPL für ein Unternehmen, das eine GPL-Bibliothek in eigene Software einbaut. | M: Interne Nutzung ohne Weitergabe ist unproblematisch. Wird die Software an Kunden weitergegeben, muss das abgeleitete Werk unter der GPL mit Quellcode bereitgestellt werden (Copyleft); Alternativen: permissiv lizenzierte Bibliothek oder LGPL-Bibliothek dynamisch verlinken. | P: 4

## Szenario
### Virtualisierungshost lizenzieren
Die Muster GmbH beschafft einen Host mit 1 CPU à 24 Kernen und plant 4 Windows-Server-VMs. 60 Mitarbeiter greifen zu, 20 davon zusätzlich per Remotedesktop.
- F: Wie viele Core-Lizenzen Standard werden benötigt? | A: 24 Kerne; 4 VMs = 2 × Lizenzierung → 48 Core-Lizenzen Standard. | P: 3
- F: Welche Zugriffslizenzen sind zusätzlich nötig? | A: 60 Windows-Server-CALs (User oder Device) und 20 RDS-CALs. | P: 2

### Defekter Server nach 14 Monaten
Ein bei einem Händler gekaufter Server (B2B) fällt nach 14 Monaten mit defektem Mainboard aus. Der Händler verweist auf den Hersteller.
- F: Welche Ansprüche hat die Firma gegenüber dem Händler? | A: Gesetzliche Mängelrechte (2 Jahre): zuerst Nacherfüllung beim Verkäufer; ggf. muss sie beweisen, dass der Mangel bei Übergabe angelegt war (keine Beweislastumkehr im B2B). | P: 3
- F: Welche Rolle spielt die Herstellergarantie? | A: Freiwillige Zusatzleistung, die zusätzlich in Anspruch genommen werden kann (z. B. Vor-Ort-Service), ersetzt aber nicht die Gewährleistung des Händlers. | P: 2

### Netzwerk-Projekt mit Mängeln
Ein Dienstleister richtet zum Festpreis ein Netzwerk ein. Bei der Abnahme fällt auf, dass das Gäste-WLAN nicht vom Firmennetz getrennt ist.
- F: Welcher Vertragstyp liegt vor und was bedeutet das für die Abnahme? | A: Werkvertrag; der Auftraggeber kann die Abnahme wegen eines wesentlichen Mangels verweigern bzw. unter Vorbehalt abnehmen und Nacherfüllung verlangen. | P: 3
- F: Was sollte im Abnahmeprotokoll stehen? | A: Geprüfte Leistungen, festgestellter Mangel, Frist zur Nachbesserung, Vorbehalt, Datum und Unterschriften. | P: 2
