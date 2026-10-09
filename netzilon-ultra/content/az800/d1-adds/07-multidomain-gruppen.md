---
id: az800-multidomain-gruppen
bereich: AZ-800
block: A7
kapitel: AD DS on-premises & Cloud
titel: Benutzer, Gruppen & Delegierung in Multi-Domain- und Multi-Forest-Umgebungen
stufe: Profi
quellen: [Identitätsmanagement_mit_Windows_Server_2016_70-742.pdf, AZ-800 Study Guide]
verweise: [ap1-a6-gruppen, az800-trusts, ap1-a6-adds, az801-admin-delegierung]
---

## Profi

### Objekte massenhaft verwalten
- **Vorlagenkonten** (Kopieren): Benutzer mit gemeinsamen Eigenschaften (OU, Gruppen, Profilpfad, Anmeldezeiten) als deaktivierte Vorlage anlegen → Rechtsklick **Kopieren** → Name/Kennwort ergänzen.
- **Massenänderung**: mehrere Objekte markieren → Eigenschaften (gemeinsame Attribute wie Abteilung, Firma, Profilpfad).
- **CSV-Import**: `Import-Csv benutzer.csv | ForEach-Object { New-ADUser … }` (Alternativen: `csvde`, `ldifde`).
- **Active Directory-Verwaltungscenter (ADAC)**: moderne Konsole mit **PowerShell-Verlauf** (zeigt die ausgeführten Cmdlets!), globale Suche, AD-Papierkorb, FGPP, dynamische Zugriffssteuerung.
- **UPN-Suffixe**: Unter „AD-Domänen und -Vertrauensstellungen“ → Eigenschaften der Stammebene → zusätzliche UPN-Suffixe (z. B. `firma.de`), damit Benutzer sich mit `vorname.nachname@firma.de` anmelden (wichtig für Entra Connect: UPN = E-Mail-Adresse, **routbare** Domäne statt `.local`).

### Gruppen über Domänen und Gesamtstrukturen hinweg
| Szenario | Empfehlung |
|---|---|
| **Eine Domäne** | **AGDLP**: Benutzer → globale Gruppe → domänenlokale Gruppe → Rechte |
| **Mehrere Domänen, eine Gesamtstruktur** | **AGUDLP**: globale Gruppen je Domäne → **universelle Gruppe** (sammelt Rollen domänenübergreifend; Mitgliedschaft im GC) → domänenlokale Gruppe in der Ressourcendomäne |
| **Mehrere Gesamtstrukturen (Forest-Trust)** | globale oder universelle Gruppen der Kontengesamtstruktur → **domänenlokale Gruppe** der Ressourcengesamtstruktur → Rechte. **Universelle Gruppen können keine Mitglieder aus fremden Gesamtstrukturen** enthalten – dafür nur **domänenlokale** (bzw. lokale) Gruppen. |
Fremde Sicherheitsprinzipale werden in der Ressourcendomäne als **Foreign Security Principals** (Container `ForeignSecurityPrincipals`, sichtbar mit „Erweiterte Features“) gespeichert.

**Warum universelle Gruppen nur mit globalen Gruppen befüllen?** Ändern sich Mitglieder, wird die **gesamte Mitgliedschaft im GC repliziert** (seit 2003 nur noch das geänderte Mitglied, trotzdem Replikationslast). Mit globalen Gruppen als Mitgliedern ändert sich die universelle Gruppe selten.

**Universelle Gruppenmitgliedschaftszwischenspeicherung** (UGMC): In Standorten **ohne GC** können DCs die universellen Mitgliedschaften zwischenspeichern → Anmeldung auch bei WAN-Ausfall zum GC (Aktivierung in `dssite.msc` → Standort → NTDS Site Settings).

### Delegierung der Verwaltung
Nach dem **Least-Privilege-Prinzip** bekommen Helpdesk/Teamleiter nur die Rechte, die sie brauchen – an einer **OU**, nicht Domänen-Admin:
- **Assistent zum Zuweisen der Objektverwaltung** (Rechtsklick OU → **Objektverwaltung zuweisen**): vordefinierte Aufgaben wie „Kennwörter zurücksetzen und Kennwortänderung bei nächster Anmeldung erzwingen“, „Benutzerkonten erstellen, löschen und verwalten“, „Gruppenmitgliedschaft ändern“, „Gruppenrichtlinienverknüpfungen verwalten“ – oder benutzerdefiniert für bestimmte Objekttypen/Attribute.
- Rechte immer an **Gruppen** delegieren (z. B. `DL-Helpdesk-PWReset`), nicht an Einzelpersonen.
- Delegierte Rechte sichtbar in OU → Eigenschaften → Sicherheit → Erweitert (**Erweiterte Features** aktivieren) bzw. `dsacls`.
- Integrierte Operatorgruppen (Konten-Operatoren usw.) vermeiden – zu grob.
- Über Domänen hinweg: Delegierung an Gruppen der anderen Domäne möglich (Trust vorausgesetzt).

### Wichtige Werkzeuge
| Werkzeug | Einsatz |
|---|---|
| `dsa.msc` | Benutzer und Computer |
| `dsac.exe` | Verwaltungscenter + PowerShell-Verlauf |
| `domain.msc` | Domänen, Trusts, UPN-Suffixe |
| `dssite.msc` | Standorte, UGMC |
| `dsacls` | Berechtigungen auf AD-Objekten |
| `Get-ADUser -Server dc.anderedomaene.tld` | Cmdlets gegen andere Domänen per `-Server` |

## Lab
**Maschinen**: DC01 (contoso.local, Stammdomäne), DC-SUP (support.contoso.local), Fileserver SRV01 in contoso.local.

### GUI
1. **DC-SUP**: globale Gruppe **GG-Support-Techniker** (Mitglieder: Support-Benutzer).
2. **DC01**: globale Gruppe **GG-Zentrale-Techniker**; **universelle** Gruppe **UG-Techniker** (in contoso.local) → Mitglieder: GG-Zentrale-Techniker und **SUPPORT\GG-Support-Techniker**.
3. **DC01**: domänenlokale Gruppe **DL-Tools-Lesen** → Mitglied UG-Techniker.
4. **SRV01**: `D:\Tools` → NTFS: DL-Tools-Lesen = Lesen.
5. **Delegierung**: `dsa.msc` → OU Schulung\Benutzer → Rechtsklick **Objektverwaltung zuweisen** → Gruppe **DL-Helpdesk** → Aufgabe „**Setzt Benutzerkennwörter zurück und erzwingt Kennwortänderung bei der nächsten Anmeldung**“ → Fertig stellen.
6. Helpdesk-Benutzer testet auf einem Client mit RSAT: Kennwort in OU Schulung\Benutzer zurücksetzen ✔, in anderer OU ✘.
7. **UPN-Suffix**: `domain.msc` → Rechtsklick „Active Directory-Domänen und -Vertrauensstellungen“ → Eigenschaften → UPN-Suffix `firma.de` hinzufügen → Benutzer → Konto → Anmeldename mit `@firma.de`.

### PowerShell
```powershell
# Auf DC01
New-ADGroup UG-Techniker -GroupScope Universal -GroupCategory Security -Path "OU=Gruppen,OU=Schulung,DC=contoso,DC=local"
Add-ADGroupMember UG-Techniker -Members (Get-ADGroup GG-Zentrale-Techniker), (Get-ADGroup GG-Support-Techniker -Server dc-sup.support.contoso.local)
New-ADGroup DL-Tools-Lesen -GroupScope DomainLocal -Path "OU=Gruppen,OU=Schulung,DC=contoso,DC=local"
Add-ADGroupMember DL-Tools-Lesen -Members UG-Techniker

# Massenanlage aus CSV (Spalten: Vorname;Nachname;Abteilung)
Import-Csv C:\Temp\neu.csv -Delimiter ';' | ForEach-Object {
  $sam = ("{0}.{1}" -f $_.Vorname, $_.Nachname).ToLower()
  New-ADUser -Name "$($_.Vorname) $($_.Nachname)" -GivenName $_.Vorname -Surname $_.Nachname -SamAccountName $sam `
    -UserPrincipalName "$sam@firma.de" -Department $_.Abteilung -Path "OU=Benutzer,OU=Schulung,DC=contoso,DC=local" `
    -AccountPassword (ConvertTo-SecureString "Start#2026!" -AsPlainText -Force) -ChangePasswordAtLogon $true -Enabled $true }

# UPN-Suffix
Get-ADForest | Set-ADForest -UPNSuffixes @{Add="firma.de"}

# Delegierung per dsacls (Kennwort zurücksetzen für Benutzerobjekte der OU)
dsacls "OU=Benutzer,OU=Schulung,DC=contoso,DC=local" /I:S /G "CONTOSO\DL-Helpdesk:CA;Reset Password;user" "CONTOSO\DL-Helpdesk:RPWP;pwdLastSet;user"
```

## Einfach

In einer **großen Firma mit mehreren Standorten-Domänen** (z. B. Zentrale und Support-Tochter) gibt es Techniker in beiden Firmen, die dasselbe Werkzeuglager nutzen sollen.

**AGUDLP** ist das Rezept:
1. Jede Firma hat ihre **eigene Liste** ihrer Techniker (**globale Gruppe**).
2. Eine **Sammelliste für den ganzen Konzern** fasst beide Listen zusammen (**universelle Gruppe**).
3. Am **Lager** hängt eine **Zutrittsliste** (**domänenlokale Gruppe**), auf der die Sammelliste steht.
4. Die Zutrittsliste hat den **Schlüssel** (Berechtigung).
Neuer Techniker? Nur in die Liste seiner Firma eintragen – fertig.

**Bei zwei getrennten Konzernen** (Gesamtstrukturen) gilt: Die Sammelliste (universell) darf **keine** fremden Konzern-Mitarbeiter enthalten. Fremde kommen **direkt auf die Zutrittsliste** (domänenlokal).

**Delegierung** = der **Hausmeister-Schlüssel nur für einen Flur**: Der Helpdesk darf Passwörter zurücksetzen – aber **nur** für Mitarbeiter in einer bestimmten OU, und sonst nichts. Viel sicherer, als ihn zum Domänen-Admin zu machen.

**Vorlagenkonto** = ein **Muster-Mitarbeiter**, den man kopiert: Abteilung, Gruppen und Einstellungen sind schon drin, nur Name und Passwort ändern.

## Merksatz
- Eine Domäne **AGDLP**, mehrere Domänen **AGUDLP**.
- Fremde Forests → **nur domänenlokale** Gruppen.
- Universelle Gruppen mit **globalen Gruppen** befüllen (weniger GC-Replikation).
- Delegieren an **OUs** und **Gruppen** mit dem **Objektverwaltungs-Assistenten**.
- UPN-Suffix für **routbare** Anmeldenamen (Entra Connect).

## Prüfungsfalle
- Universelle Gruppen können keine Mitglieder aus anderen Gesamtstrukturen aufnehmen.
- Globale Gruppen können keine Mitglieder aus anderen Domänen aufnehmen.
- Delegierte Rechte sind erst mit „Erweiterte Features“ in der Sicherheitsansicht sichtbar.
- UGMC nur relevant in Standorten ohne GC.
- `.local`-UPNs sind für Entra-Synchronisation ungeeignet.

## Grafik
### Konzern-Kette AGUDLP
Zwei Firmengebäude mit je einer GG-Liste; beide Listen fliegen in eine goldene UG-Mappe; die Mappe landet auf der DL-Liste am Lager; Schlüssel öffnet das Lager.

### Fremder Forest
Zweiter Wald mit eigenen Gruppen; Versuch, sie in die UG zu legen, wird rot abgelehnt; stattdessen landen sie auf der DL-Liste (grün).

### Delegierung
OU als Flur mit Türen; Helpdesk-Figur hat einen Schlüssel nur für „Kennwort zurücksetzen“ in diesem Flur; andere Türen bleiben zu.

## Karteikarten
- F: Gruppenstrategie bei mehreren Domänen einer Gesamtstruktur? | A: AGUDLP – globale → universelle → domänenlokale Gruppe → Berechtigung.
- F: Welche Gruppen können Mitglieder aus einer fremden Gesamtstruktur enthalten? | A: Domänenlokale (und lokale) Gruppen.
- F: Warum universelle Gruppen mit globalen Gruppen befüllen? | A: Seltenere Änderungen → weniger Replikation im globalen Katalog.
- F: Was sind Foreign Security Principals? | A: Stellvertreterobjekte für Sicherheitsprinzipale aus vertrauten externen Domänen/Forests.
- F: Was ist UGMC? | A: Zwischenspeicherung universeller Gruppenmitgliedschaften in Standorten ohne GC.
- F: Wie delegiert man Kennwortzurücksetzung an den Helpdesk? | A: Assistent „Objektverwaltung zuweisen“ an der OU, an eine Gruppe.
- F: Welche Konsole zeigt die ausgeführten PowerShell-Befehle? | A: Active Directory-Verwaltungscenter (PowerShell-Verlauf).
- F: Wozu zusätzliche UPN-Suffixe? | A: Routbare, E-Mail-gleiche Anmeldenamen (z. B. für Entra Connect).
- F: Wie adressiert man mit AD-Cmdlets eine andere Domäne? | A: Mit dem Parameter -Server.

## Quiz
? Techniker aus zwei Domänen derselben Gesamtstruktur sollen auf einen Ordner zugreifen. Welche Gruppe fasst ihre globalen Gruppen zusammen?
* Eine universelle Gruppe
- Eine lokale Computergruppe
- Eine Verteilergruppe
- Eine globale Gruppe der anderen Domäne

? Benutzer einer Partner-Gesamtstruktur sollen Zugriff erhalten. In welche Gruppe nimmt man sie auf?
* Eine domänenlokale Gruppe der Ressourcendomäne
- Eine universelle Gruppe
- Eine globale Gruppe
- Domänen-Admins

? Der Helpdesk soll nur Kennwörter in der OU Vertrieb zurücksetzen. Was ist richtig?
* Objektverwaltung an der OU Vertrieb an eine Helpdesk-Gruppe delegieren
- Den Helpdesk zu Domänen-Admins hinzufügen
- Konten-Operatoren verwenden
- Die Default Domain Policy ändern

? Welche Konsole hilft beim Lernen von AD-PowerShell-Cmdlets?
* Active Directory-Verwaltungscenter (PowerShell-Verlauf)
- DNS-Manager
- Datenträgerverwaltung
- Ereignisanzeige

? Wozu dient die universelle Gruppenmitgliedschaftszwischenspeicherung?
* Anmeldung in Standorten ohne GC auch bei WAN-Ausfall
- Verschlüsselung von Gruppen
- Beschleunigung der DNS-Auflösung
- Replikation von SYSVOL

? Wo sollte eine universelle Gruppe sinnvoll eingesetzt werden?
* Zum domänenübergreifenden Zusammenfassen globaler Gruppen in einer Gesamtstruktur
- Für lokale Ressourcen eines einzelnen Servers
- Für Benutzer einer fremden Gesamtstruktur
- Als Ersatz für OUs
! Mitgliedschaften werden im globalen Katalog repliziert.

? Mit welchem Assistenten werden Verwaltungsrechte auf eine OU übertragen?
* Assistent zum Zuweisen der Objektverwaltung (Delegation of Control Wizard)
- Gruppenrichtlinienverwaltung
- Server-Manager → Rollen
- DNS-Manager
! Die Rechte werden als ACEs am OU-Objekt gesetzt.

? Welche Gruppen dürfen Benutzer aus einer anderen Gesamtstruktur (über einen Trust) als Mitglieder aufnehmen?
* Domänenlokale Gruppen
- Globale Gruppen
- Universelle Gruppen
- Verteilergruppen nur
! Global und universell nehmen nur Mitglieder aus der eigenen Gesamtstruktur auf.
