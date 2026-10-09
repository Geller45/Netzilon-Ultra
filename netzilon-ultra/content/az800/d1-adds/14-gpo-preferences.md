---
id: az800-gpo-preferences
bereich: AZ-800
block: A7
kapitel: AD DS on-premises & Cloud
titel: Gruppenrichtlinieneinstellungen (Preferences) & Zielgruppenadressierung
stufe: Fortgeschritten
quellen: [Identitätsmanagement_mit_Windows_Server_2016_70-742.pdf, AZ-800 Study Guide]
verweise: [ap1-a6-gpo-grundlagen, az800-gpo, ap1-a6-druckserver]
---

## Profi

### Richtlinien vs. Einstellungen
| | **Richtlinien** (Policies) | **Einstellungen** (Preferences) |
|---|---|---|
| Durchsetzung | **erzwungen**, Benutzer kann nicht ändern (ausgegraut) | **Standardwert**, Benutzer kann ändern (sofern nicht „nur einmal anwenden“) |
| Rücknahme | automatisch beim Entfernen des GPOs (verwaltet) | bleibt bestehen („Tattooing“), außer „Element entfernen, wenn es nicht mehr angewendet wird“ |
| Umfang | durch ADMX/Sicherheitsvorlagen vorgegeben | nahezu beliebige Einstellungen (Registry, Dateien, Laufwerke …) |
| Filterung | ganzes GPO (Sicherheits-/WMI-Filter) | **pro Element** mit **Zielgruppenadressierung** |
| Aktualisierung | Vorder- und Hintergrund | Vorder- und Hintergrund (je nach Element) |

### Kategorien
**Windows-Einstellungen**: Anwendungen, **Laufwerkszuordnungen** (nur Benutzer), **Umgebung** (Variablen), **Dateien**, **Ordner**, **INI-Dateien**, **Registrierung**, **Netzwerkfreigaben** (nur Computer), **Verknüpfungen**.
**Systemsteuerungseinstellungen**: Datenquellen (ODBC), Geräte, Ordneroptionen, Internet-Einstellungen, **Lokale Benutzer und Gruppen**, Netzwerkoptionen (VPN/DFÜ), **Energieoptionen**, **Drucker**, Regionale Einstellungen, **Geplante Aufgaben**, **Dienste**, Startmenü.

### Aktionen (CRUD)
| Aktion | Wirkung |
|---|---|
| **Erstellen** (Create) | legt das Element an, **falls es noch nicht existiert** |
| **Ersetzen** (Replace) | löscht und legt **neu** an (alle Werte wie konfiguriert, nicht angegebene Werte gehen verloren) |
| **Aktualisieren** (Update) | ändert **nur die konfigurierten** Werte, legt an, falls nicht vorhanden – **Standard und meist richtig** |
| **Löschen** (Delete) | entfernt das Element |
Farbcodes im Editor (z. B. Laufwerke): **grüne Linie** = wird angewendet, **rote gestrichelte Linie** = wird nicht angewendet; F5/F6/F7/F8 aktivieren/deaktivieren Felder.

### Registerkarte „Gemeinsam“
- **Verarbeitung dieses Erweiterungselements bei Fehler beenden** – stoppt die Verarbeitung weiterer Elemente derselben Erweiterung bei einem Fehler.
- **Im Sicherheitskontext des angemeldeten Benutzers ausführen** (Benutzerkonfiguration) – z. B. für Laufwerke/Drucker, die Benutzerrechte brauchen (Standard: SYSTEM).
- **Element entfernen, wenn es nicht mehr angewendet wird** – macht das Element „verwaltet“ (erzwingt Aktion Ersetzen) → Rücknahme bei Wegfall.
- **Nur einmalig anwenden** – danach darf der Benutzer ändern (z. B. Startseite vorgeben).
- **Zielgruppenadressierung auf Elementebene** (Item-Level Targeting, ILT).

### Zielgruppenadressierung (ILT)
Bedingungen, die per **UND/ODER/NICHT** kombiniert und in **Sammlungen** gruppiert werden können, u. a.:
Sicherheitsgruppe (Benutzer oder Computer), **Organisationseinheit**, **Standort**, **IP-Adressbereich**, Computername, Betriebssystem, **Batterie vorhanden** (Laptop), Arbeitsspeicher/Festplattenspeicher, Datum/Uhrzeit, Sprache, Registrierung/Datei vorhanden, **WMI-Abfrage**, LDAP-Abfrage, Terminalsitzung, Umgebungsvariable.
Vorteil gegenüber vielen kleinen GPOs: **ein** GPO mit vielen Elementen, jedes mit eigener Bedingung → weniger GPOs, schnellere Anmeldung. Ablage als XML in SYSVOL (`...\Preferences\Drives\Drives.xml`).

### Typische Einsatzfälle
- **Laufwerke**: H: → `\\SRV01\Home$\%USERNAME%` für alle, X: → Abteilungsfreigabe nur für Gruppe.
- **Drucker**: nach Standort/IP-Bereich, Standarddrucker.
- **Lokale Gruppen**: Helpdesk-Gruppe in lokale Administratoren der Clients (**Aktualisieren**, nicht Ersetzen – sonst werden andere Mitglieder entfernt!); besser Kombination mit LAPS/eingeschränkten Gruppen.
- **Registrierung**: Werte ohne ADMX setzen.
- **Dateien/Verknüpfungen**: Firmenlogo, Desktop-Link zum Intranet.
- **Energieoptionen**, **Geplante Aufgaben** (Skripte nachts), **Dienste** (Starttyp setzen).
- **Umgebungsvariablen** für Anwendungen.
Achtung **Kennwörter in Preferences** (früher „cpassword“ bei lokalen Benutzern/Diensten/Tasks): seit **MS14-025** nicht mehr möglich – Schlüssel war öffentlich, Kennwörter im SYSVOL auslesbar. Alte GPOs mit cpassword unbedingt entfernen → stattdessen **LAPS**/gMSA.

## Lab
**Maschinen**: DC01, SRV01 (Freigaben Home$, Vertrieb, Drucker), CL01 (Laptop-VM), CL02.

### GUI
1. **DC01**: GPO **„Benutzer-Einstellungen“** an OU Schulung\Benutzer → Benutzerkonfiguration → Einstellungen → Windows-Einstellungen → **Laufwerkszuordnungen** → Neu → Zugeordnetes Laufwerk → Aktion **Aktualisieren** → Pfad `\\SRV01\Home$\%USERNAME%` → Laufwerk **H:** → „Verbindung wiederherstellen“, Beschriftung „Eigene Dateien Server“.
2. Neues Laufwerk **V:** → `\\SRV01\Vertrieb` → Registerkarte **Gemeinsam** → **Zielgruppenadressierung** → Neues Element **Sicherheitsgruppe** → GG-Vertrieb → OK.
3. **Drucker** → Neu → Freigegebener Drucker → `\\PRINT01\Drucker-EG` → Standard → ILT: **IP-Adressbereich** 192.168.1.1–192.168.1.254.
4. **Registrierung**: `HKCU\Software\Firma\Intranet` → Wert `URL` = `https://intranet.contoso.local` → „Element entfernen, wenn es nicht mehr angewendet wird“.
5. GPO **„Computer-Einstellungen“** an OU Computer → Computerkonfiguration → Einstellungen → Systemsteuerungseinstellungen → **Lokale Benutzer und Gruppen** → Neu → Lokale Gruppe → **Administratoren (integriert)** → Aktion **Aktualisieren** → Mitglied hinzufügen `CONTOSO\GG-Helpdesk`.
6. **Energieoptionen** → Energiesparplan „Ausbalanciert“ → ILT: **Batterie vorhanden** → Bildschirm aus nach 5 Minuten.
7. **CL01/CL02**: Neuanmeldung/`gpupdate` → Laufwerke/Drucker prüfen; `gpresult /h` → Abschnitt „Einstellungen“. Bei Fehlern: Ereignisanzeige → Anwendung → Quelle „Group Policy Drive Maps“ usw.; Ablaufverfolgung per GPO „Gruppenrichtlinie → Protokollierung und Ablaufverfolgung“.

### PowerShell
```powershell
# Auf DC01 – Registrierungs-Preference per Cmdlet (andere Preference-Typen nur GUI/XML)
New-GPO "Benutzer-Einstellungen" | New-GPLink -Target "OU=Benutzer,OU=Schulung,DC=contoso,DC=local"
Set-GPPrefRegistryValue -Name "Benutzer-Einstellungen" -Context User -Action Update `
  -Key "HKCU\Software\Firma\Intranet" -ValueName "URL" -Type String -Value "https://intranet.contoso.local"
Get-GPPrefRegistryValue -Name "Benutzer-Einstellungen" -Context User -Key "HKCU\Software\Firma\Intranet"

# Alte GPOs mit gespeicherten Kennwörtern (cpassword) finden
Get-ChildItem "\\contoso.local\SYSVOL\contoso.local\Policies" -Recurse -Include *.xml |
  Select-String -Pattern "cpassword" | Select-Object Path

# Auf CL01
gpupdate /force
Get-PSDrive -PSProvider FileSystem
gpresult /h C:\Temp\rsop.html
```

## Einfach

**Richtlinien** sind **Gesetze**: Der Benutzer **kann nichts ändern** (ausgegraut). **Einstellungen (Preferences)** sind **Empfehlungen, die automatisch eingerichtet werden**: „Ich verbinde dir schon mal Laufwerk H: und deinen Drucker.“ Der Benutzer könnte es theoretisch ändern – aber beim nächsten Aktualisieren wird es wieder hergestellt.

**Vier Aktionen** – wie beim Aufräumen eines Regals:
- **Erstellen** = „Stell das Buch hin, **falls noch keins da ist**.“
- **Ersetzen** = „Wirf das alte Buch weg und stell ein **neues** hin.“
- **Aktualisieren** = „**Ändere nur**, was ich dir sage; fehlt das Buch, stell es hin.“ ← meistens die beste Wahl.
- **Löschen** = „Nimm das Buch weg.“

**Zielgruppenadressierung** ist der **Superfilter**: Jede einzelne Einstellung bekommt ihre eigene Bedingung.
- „Laufwerk V: nur für die **Vertriebsgruppe**.“
- „Drucker EG nur für PCs im **Netz des Erdgeschosses**.“
- „Stromsparplan nur für Geräte **mit Akku** (Laptops).“
So braucht man nicht für jede Abteilung eine eigene Hausordnung – eine reicht, mit vielen kleinen „Wenn…dann“-Regeln.

**Achtung Falle**: Früher konnte man in Preferences **Passwörter** speichern (z. B. für lokale Admins). Die waren aber für jeden Mitarbeiter lesbar! Das ist heute gesperrt – nie wieder so machen, lieber **LAPS**.

## Merksatz
- Policies = **erzwingen**, Preferences = **vorkonfigurieren**.
- Aktionen: **C-R-U-D**, Standard **Aktualisieren**.
- **ILT** = Filter **pro Element** (Gruppe, OU, IP, Akku, WMI …).
- „**Element entfernen, wenn nicht mehr angewendet**“ = verwaltet.
- **Keine Kennwörter** in Preferences (MS14-025).

## Prüfungsfalle
- Lokale Administratoren mit **Ersetzen** konfiguriert → andere Admins fliegen raus.
- Laufwerkszuordnungen gibt es nur in der **Benutzerkonfiguration**.
- Preferences ohne „Element entfernen …“ bleiben nach GPO-Entfernung bestehen.
- ILT „Sicherheitsgruppe“ prüft Benutzer- **oder** Computergruppen – richtige Option wählen.
- Registry-Preferences ≠ ADMX-Richtlinien (keine automatische Rücknahme).

## Grafik
### Gesetz vs. Empfehlung
Zwei Einstellungsfenster: links ausgegraut mit Schloss (Richtlinie), rechts änderbar mit Zauberstab (Preference), der beim nächsten Refresh den Standard zurückzaubert.

### CRUD-Regal
Regal mit Büchern; vier Knöpfe (Erstellen/Ersetzen/Aktualisieren/Löschen) zeigen das Ergebnis animiert.

### ILT-Filter
Ein GPO-Paket, aus dem viele Einstellungskarten fliegen; jede Karte hat ein Schloss mit Bedingung (Gruppe, IP, Akku) und landet nur bei passenden Benutzern/Geräten.

## Karteikarten
- F: Hauptunterschied Richtlinien und Einstellungen? | A: Richtlinien werden erzwungen und zurückgenommen; Einstellungen setzen Werte, die Benutzer ändern können und die bestehen bleiben.
- F: Vier Aktionen bei Preferences? | A: Erstellen, Ersetzen, Aktualisieren, Löschen.
- F: Unterschied Ersetzen und Aktualisieren? | A: Ersetzen löscht und legt neu an; Aktualisieren ändert nur konfigurierte Werte.
- F: Was ist Zielgruppenadressierung? | A: Filterung einzelner Preference-Elemente nach Bedingungen (Gruppe, OU, IP, WMI, Akku …).
- F: Wie wird eine Preference beim Entfernen des GPOs zurückgenommen? | A: Option „Element entfernen, wenn es nicht mehr angewendet wird“.
- F: Wofür „Im Sicherheitskontext des angemeldeten Benutzers ausführen“? | A: Für Elemente, die Benutzerrechte benötigen (z. B. Laufwerke, Drucker).
- F: Warum keine Kennwörter in Preferences? | A: cpassword war mit öffentlichem Schlüssel verschlüsselt und im SYSVOL lesbar (MS14-025).
- F: Welche Aktion eignet sich, um eine Gruppe zu den lokalen Administratoren hinzuzufügen? | A: Aktualisieren (Ersetzen würde andere Mitglieder entfernen).
- F: Cmdlet für Registry-Preferences? | A: Set-GPPrefRegistryValue.

## Quiz
? Laufwerk V: soll nur für Mitglieder von GG-Vertrieb verbunden werden, alles in einem gemeinsamen GPO. Was nutzt man?
* Zielgruppenadressierung am Laufwerkselement
- Einen WMI-Filter am GPO
- Ein separates GPO pro Laufwerk mit Vererbung deaktivieren
- Eine Migrationstabelle

? Welche Aktion ändert nur die konfigurierten Werte eines vorhandenen Elements?
* Aktualisieren
- Ersetzen
- Erstellen
- Löschen

? Eine Preference-Einstellung bleibt nach dem Löschen des GPOs auf den Clients bestehen. Welche Option hätte das verhindert?
* „Element entfernen, wenn es nicht mehr angewendet wird“
- „Nur einmalig anwenden“
- „Verarbeitung bei Fehler beenden“
- Erzwungen

? Warum ist das Speichern von Kennwörtern in Preferences gesperrt?
* Die Kennwörter waren für alle Domänenbenutzer aus dem SYSVOL entschlüsselbar
- Weil Preferences keine Registry schreiben können
- Weil Kennwörter zu lang sind
- Weil nur Richtlinien Kennwörter kennen

? Wo sind Laufwerkszuordnungen in den Preferences zu finden?
* Benutzerkonfiguration → Einstellungen → Windows-Einstellungen
- Computerkonfiguration → Richtlinien → Sicherheitseinstellungen
- Computerkonfiguration → Einstellungen → Netzwerkfreigaben
- Benutzerkonfiguration → Richtlinien → Administrative Vorlagen
