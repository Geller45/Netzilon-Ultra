---
id: az801-rodc-sicherheit
bereich: AZ-801
block: A9
kapitel: Sicherheit
titel: RODC-Kontosicherheit (Kennwortreplikationsrichtlinie)
stufe: Fortgeschritten
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az800-rodc, az801-dc-haertung, az801-protected-users, ap1-a6-adds]
---

## Profi

### Grundidee
Ein **RODC** (*Read-Only Domain Controller*, **Schreibgeschützter Domänencontroller**) steht in **unsicheren Standorten** (Filiale). Er **speichert keine Kennwörter aller Konten**, sondern nur die, die die **Kennwortreplikationsrichtlinie** (*Password Replication Policy*, **PRP**) erlaubt. Wird er **gestohlen/kompromittiert**, sind **nur die zwischengespeicherten Konten** betroffen.

### Ablauf der Anmeldung
1. Benutzer meldet sich am **RODC** an.
2. RODC **hat das Kennwort nicht** → **leitet** die Anfrage an einen **schreibbaren DC** (*Writable DC*) **weiter**.
3. Schreibbarer DC **prüft** und stellt ein **TGT** aus.
4. Ist das Konto laut **PRP erlaubt**, **repliziert** der DC das **Kennwort** zum RODC (**Cache**) → **nächste Anmeldung lokal** (auch bei **WAN-Ausfall**).

### PRP-Gruppen und Attribute
| Objekt | Bedeutung |
|---|---|
| **Allowed RODC Password Replication Group** | Konten, **deren Kennwörter** auf **RODCs** repliziert **werden dürfen** (**Standard: leer**) |
| **Denied RODC Password Replication Group** | Konten, die **nie** auf RODCs **repliziert werden** (**Deny gewinnt**) |
| `msDS-RevealOnDemandGroup` | **Zulassen-Liste** pro RODC |
| `msDS-NeverRevealGroup` | **Ablehnen-Liste** pro RODC |
| `msDS-RevealedList` | Konten, deren Kennwort **auf diesem RODC** **liegt** (**Cache**) |
| `msDS-AuthenticatedToAccountlist` | Konten, die sich **an diesem RODC** **angemeldet** haben |

**Regeln**
- **Ablehnen** hat **immer Vorrang** vor **Zulassen**.
- **Standardmäßig abgelehnt**: **Domänen-Admins**, **Enterprise-Admins**, **Schema-Admins**, **Gruppenrichtlinien-Ersteller-Besitzer**, **Zertifikatherausgeber**, **Domänencontroller**, **schreibgeschützte DCs**, **krbtgt**, **Administratoren**, **Server-Operatoren**, **Sicherungs-Operatoren**, **Konten-Operatoren**.
- **krbtgt**: **Jeder RODC** hat **sein eigenes** Konto `krbtgt_<Nummer>` – **kein** Zugriff auf den **Haupt-krbtgt**.
- **Empfehlung**: **Nur Benutzer/Computer des Standorts** in **Allowed**-Gruppe, **keine Admins**.

### Kennwörter vorab laden (Prepopulate)
Damit die Filiale **auch bei WAN-Ausfall** funktioniert, **vorab** replizieren:
```powershell
repadmin /rodcpwdrepl RODC01 DC01 "CN=Anna,OU=Filiale,DC=example,DC=com"
```
- ADUC → **RODC-Computerkonto** → **Eigenschaften → Kennwortreplikationsrichtlinie → Erweitert → Kennwörter vorab laden**.

### Bei Kompromittierung des RODC
1. **ADUC** → **RODC-Computerkonto** **löschen**.
2. Option **„Kennwörter aller Benutzerkonten zurücksetzen, die auf diesem RODC zwischengespeichert waren“** wählen.
3. Optional **Liste exportieren** (**wer war betroffen**) und **Benutzer informieren**.
- Danach **Kennwörter aller Betroffenen zurückgesetzt** (**Änderung beim nächsten Anmelden erzwingen**).

### Weitere Schutzfunktionen
| Funktion | Details |
|---|---|
| **Einseitige Replikation** (*Unidirectional*) | **Änderungen** fließen **nur zum RODC**, **nie** zurück – **Schreib-Angriffe** über RODC nicht möglich |
| **Gefilterter Attributsatz** (*Filtered Attribute Set*, **FAS**) | **Attribute** (z. B. **Anwendungsdaten**), die **nicht** auf **RODCs** repliziert werden; **mit Vorsicht** (**vertrauliche** Attribute) |
| **Rollentrennung** (*Administrator Role Separation*, **ADRS**) | **Lokaler Admin** des RODC **ohne Domänenadmin-Rechte** (z. B. **Filialen-IT**) |
| **Delegierte Installation** | **RODC-Konto** **vorab** im AD anlegen (**Staged**), **Filialen-Admin** **fügt** Server **hinzu** |
| **Lokaler DNS** | **RODC** hat **schreibgeschützte** DNS-Zone (**Clients** aktualisieren über **Weiterleitung**) |

**ADRS einrichten** (Beispiel, **auf dem RODC**):
```
ntdsutil
local roles
add FilialeAdmin Administrators
quit
quit
```
- **Oder** in **ADUC** beim **Anlegen** des RODC-Kontos: **Delegierte Administratoren**.

### PRP verwalten
```powershell
# Auf DC01
Add-ADDomainControllerPasswordReplicationPolicy -Identity RODC01 -AllowedList "Anna","Ben"
Add-ADDomainControllerPasswordReplicationPolicy -Identity RODC01 -DeniedList "Domain Admins"
Get-ADDomainControllerPasswordReplicationPolicy -Identity RODC01 -Allowed
Get-ADDomainControllerPasswordReplicationPolicyUsage -Identity RODC01 -RevealedAccounts
Get-ADDomainControllerPasswordReplicationPolicyUsage -Identity RODC01 -AuthenticatedAccounts
```

### Voraussetzungen (Wiederholung, Details Seite AZ-800)
- **Schreibbarer DC** mit **Windows Server 2008 oder höher** im **Standort/erreichbar**.
- **Gesamtstruktur/Domänenfunktionsebene ≥ 2003**.
- **PDC-Emulator** muss **Windows Server 2008+** sein (**RODC-Rollen**).
- **Vorbereitung** bei älteren Strukturen: `adprep /rodcprep`.

## Lab
**Maschinen**: **DC01** (schreibbar, example.com), **RODC01** (Filiale, Server Core), Benutzer `anna` (Filiale), `chef` (Domänen-Admin).

### GUI
1. **DC01**: **Active Directory-Benutzer und -Computer** → **Domain Controllers** → **RODC01** → **Eigenschaften → Kennwortreplikationsrichtlinie**.
2. **DC01**: **Hinzufügen → Kennwörter dieses Kontos auf diesem RODC zwischenspeichern zulassen** → `anna` wählen → OK.
3. **DC01**: **Hinzufügen → Ablehnen** → `chef` (**Domänen-Admin** bereits **abgelehnt**, **Standard prüfen**).
4. **RODC01**: **Anmeldung** als `anna` (erste Anmeldung **braucht WAN**).
5. **DC01**: RODC01 → **Erweitert → Erweitert-Fenster → Zwischengespeicherte Kennwörter** → **Konten, deren Kennwörter auf diesem RODC gespeichert sind**.
6. **DC01**: **RODC01** → **Rechtsklick → Löschen** → **Kennwörter zurücksetzen** (**Kompromittierung simulieren**).

### PowerShell
```powershell
# Auf DC01
Add-ADDomainControllerPasswordReplicationPolicy -Identity RODC01 -AllowedList "anna"
Get-ADDomainControllerPasswordReplicationPolicy -Identity RODC01 -Denied
Get-ADDomainControllerPasswordReplicationPolicyUsage -Identity RODC01 -RevealedAccounts

# Vorab laden
repadmin /rodcpwdrepl RODC01 DC01 "CN=anna,OU=Filiale,DC=example,DC=com"

# Auf DC01 – Replikationsstatus des RODC
repadmin /showrepl RODC01
```

## Einfach

Stell dir vor, deine **Firma** hat einen **Hauptsitz (sicher)** und eine **kleine Filiale (unsicher)**. In der Filiale steht ein **Ausweis-Prüfer** (**RODC**). Wenn der **gestohlen** wird, sollen die **Dieb-Daten** **möglichst nutzlos** sein.

- Der Prüfer **kennt nicht alle Passwörter** – nur die von den **Leuten aus der Filiale**, die du **erlaubt** hast (**Allowed-Liste**).
- Für den **Chef und die Admins** steht auf einer **Verbotsliste** (**Denied**): **deren Passwörter** darf der Prüfer **nie** bekommen. **Verbot schlägt Erlaubnis.**
- Wenn jemand **neu** ist, **fragt** der Prüfer **beim Hauptsitz**, ob das Passwort stimmt (**WAN**).
- Wird der Prüfer **gestohlen**: **Konto löschen** + **„Passwörter zurücksetzen“ anklicken** → nur die **paar** Filial-Mitarbeiter müssen **neue Passwörter** bekommen. Der **Rest** der Firma ist **sicher**.

Ein **Extra-Trick**: **Änderungen laufen nur einseitig** (Hauptsitz → Filiale). Selbst wenn ein Angreifer im Prüfer **etwas ändert**, **kommt das nie zurück**.

## Merksatz
- **RODC** = **nur erlaubte Kennwörter** im **Cache**.
- **Deny schlägt Allow**.
- **Admin-Gruppen** sind **standardmäßig abgelehnt**.
- **Eigener krbtgt** pro RODC (`krbtgt_xxxxx`).
- **Kompromittiert** → **Konto löschen + Kennwörter zurücksetzen**.
- **ADRS** = **lokaler Admin ohne Domänenadmin**.

## Prüfungsfalle
- **Allowed-Gruppe** ist **standardmäßig leer** – **nichts** wird **automatisch** zwischengespeichert.
- **Denied** **gewinnt** **immer**, auch bei Mitgliedschaft in beiden.
- **Admins** **nie** in die **Allowed**-Liste eines **RODC** aufnehmen.
- **„Kennwörter zurücksetzen“** **nicht vergessen** beim **Löschen** des RODC-Kontos.
- **Prepopulate** löst **WAN-Ausfall-Probleme**: **nicht** mit **Allowed-Liste** verwechseln (**Erlaubnis ≠ Vorabladen**).
- **RODC** kann **keine Änderungen** an **AD** **schreiben** (**Kennwortänderung** wird **weitergeleitet**).
- **FAS** ist **kein Ersatz** für **Sicherheit** von **Vertraulichem** in **RODC-Standorten**.
- **ADRS** ≠ **Domänenadmin**: **lokaler** Admin darf **nur** den **RODC** verwalten.

## Grafik
### Filiale und Zentrale
Hauptsitz mit Tresor (DC01) und Filiale mit Schließfach (RODC01); Pfeil „nur einseitig“; erlaubte Konten wandern als Schlüssel ins Schließfach, Admin-Schlüssel bleiben im Tresor.

### Diebstahl
RODC wird gestohlen (Maske); Admin klickt „Konto löschen + Kennwörter zurücksetzen“; nur wenige Schlüssel werden ausgetauscht.

### Entscheidungsbaum
Konto → in Denied? → ja: nie replizieren; nein → in Allowed? → ja: replizieren; nein: nicht replizieren.

## Karteikarten
- F: Wofür steht RODC? | A: Read-Only Domain Controller (schreibgeschützter Domänencontroller).
- F: Was legt die PRP fest? | A: Welche Kennwörter auf den RODC repliziert werden dürfen.
- F: Was ist Standard in der Allowed RODC Password Replication Group? | A: Sie ist leer.
- F: Was hat Vorrang, Allow oder Deny? | A: Deny.
- F: Welches Konto hat jeder RODC? | A: Ein eigenes krbtgt-Konto (krbtgt_Nummer).
- F: Was tun bei kompromittiertem RODC? | A: Computerkonto löschen und Kennwörter zwischengespeicherter Konten zurücksetzen.
- F: Was macht repadmin /rodcpwdrepl? | A: Kennwörter vorab auf den RODC replizieren.
- F: Was ist ADRS? | A: Rollentrennung: lokaler Admin für RODC ohne Domänenadmin-Rechte.
- F: Was bedeutet FAS? | A: Filtered Attribute Set, Attribute, die nicht auf RODCs repliziert werden.
- F: Cmdlet für PRP-Verwendung? | A: Get-ADDomainControllerPasswordReplicationPolicyUsage
- F: Welche Konten stehen standardmäßig auf Denied? | A: Domänen-/Enterprise-/Schema-Admins, krbtgt, Domänencontroller u. a.
- F: Wie ist die Replikationsrichtung beim RODC? | A: Einseitig, nur zum RODC.

## Quiz
? Ein RODC in der Filiale soll die Anmeldung der Filialmitarbeiter auch bei WAN-Ausfall ermöglichen. Was tun?
* Konten in Allowed-Gruppe aufnehmen und Kennwörter vorab laden
- Filialmitarbeiter zu Domänen-Admins machen
- RODC auf schreibbar umstellen
- FAS konfigurieren

? Ein Konto ist in Allowed und in Denied. Ergebnis?
* Kennwort wird nicht repliziert
- Kennwort wird repliziert
- Nur beim ersten Mal repliziert
- Hängt von der Priorität ab

? Ein RODC wurde gestohlen. Erste Maßnahme?
* Computerkonto löschen und Kennwörter zwischengespeicherter Konten zurücksetzen lassen
- Nur Neustart des Standorts
- krbtgt des Hauptsitzes zurücksetzen
- Standort umbenennen

? Wie kann ein Filialen-Admin den RODC verwalten, ohne Domänenadmin zu sein?
* Administrator Role Separation (lokaler Admin)
- Enterprise-Admin-Rolle
- Domänen-Admin auf Zeit
- Schema-Admin

? Welche Eigenschaft hat die Replikation zu einem RODC?
* Einseitig, nur vom schreibbaren DC zum RODC
- Bidirektional
- Nur SYSVOL
- Nur Kennwörter

? Welche Rolle hat der krbtgt eines RODC?
* Eigenes Konto pro RODC für Kerberos-Tickets
- Ersetzt das Konto des PDC
- Gilt für die ganze Gesamtstruktur
- Nur für DNS

? Wo legt man fest, welche Kennwörter ein RODC zwischenspeichern darf?
* In der Kennwortreplikationsrichtlinie (Password Replication Policy) des RODC-Computerkontos
- In der Default Domain Policy
- In der DNS-Zone
- In der Firewall
! Registerkarte „Kennwortreplikationsrichtlinie“ in ADUC.

? Mit welchem Befehl lassen sich Kennwörter vorab auf einen RODC replizieren?
* repadmin /rodcpwdrepl
- repadmin /syncall
- dcdiag /test:replications
- netdom resetpwd
! Konten müssen in der zulässigen Liste stehen.
