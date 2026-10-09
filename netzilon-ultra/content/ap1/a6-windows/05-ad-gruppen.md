---
id: ap1-a6-gruppen
bereich: AP1
block: A6
kapitel: Windows Server
titel: AD-Gruppen – Typen, Bereiche, AGDLP
stufe: Fortgeschritten
quellen: [AD-Gruppen.pdf, Server_2008_R2_-_70_640_2nd_de.pdf]
verweise: [ap1-a6-adds, ap1-a6-freigaben, ap1-a6-ntfs, ap1-a6-gpo-bereich]
---

## Profi

### Warum Gruppen?
Ohne Gruppen müsste man **jedem Benutzer an jeder Ressource** einzeln Rechte geben – bei 500 Benutzern und 100 Ordnern unüberschaubar. Mit Gruppen: **Identität → Gruppe → Ressource**. Neue Mitarbeiterin? Nur in die passende Gruppe aufnehmen – alle Rechte folgen automatisch. Abgang? Aus den Gruppen entfernen.

### Gruppentyp
| Typ | SID | Berechtigungen vergeben | Einsatz |
|---|---|---|---|
| **Sicherheitsgruppe** | **ja** (Sicherheitsprinzipal) | **ja** | Rechte auf Ressourcen, GPO-Filterung; kann zusätzlich E-Mail-aktiviert sein |
| **Verteilergruppe** | nein | **nein** | nur E-Mail-Verteiler (Exchange) |
Der Typ kann nachträglich umgewandelt werden.

### Gruppenbereiche
Unterscheidungsmerkmale: **Replikation** (wo wird die Gruppe gespeichert?), **Mitgliedschaft** (wer darf Mitglied sein?), **Verfügbarkeit** (wo kann die Gruppe verwendet bzw. in welche Gruppen verschachtelt werden?).

| Bereich | Gespeichert/repliziert | Mögliche Mitglieder | Verwendbar | Typischer Zweck |
|---|---|---|---|---|
| **Lokal** (Computer) | nur in der **SAM** des einzelnen Computers | Benutzer, Computer, globale Gruppen aus beliebigen Domänen der Gesamtstruktur und vertrauten Domänen, universelle Gruppen, lokale Domänengruppen der eigenen Domäne | nur in ACLs **dieses Computers**; kann nicht Mitglied anderer Gruppen sein | Rechte auf einem einzelnen Server (z. B. lokale Administratoren) |
| **Lokal (in Domäne)** – DL | auf alle DCs der **Domäne** | B, C, GG, **UG** aus der ganzen Gesamtstruktur und vertrauten Domänen, **andere DL-Gruppen derselben Domäne** | in ACLs aller Ressourcen **der eigenen Domäne**; Mitglied anderer DL-Gruppen/lokaler Gruppen | **Ressourcenzugriff** („Geschäftsregeln“: DL-Vertrieb-Lesen) |
| **Global** – GG | auf alle DCs der **Domäne** | **nur** Benutzer, Computer und andere **globale Gruppen derselben Domäne** | überall in der Gesamtstruktur und in vertrauenden Domänen; Mitglied in DL, UG und anderen GG | **Rollen** (GG-Vertrieb = alle Vertriebsmitarbeiter) |
| **Universal** – UG | Gruppe in einer Domäne, **Mitgliedschaft im globalen Katalog** (gesamtstrukturweit) | B, C, GG und UG aus **allen Domänen der Gesamtstruktur** | überall in der Gesamtstruktur | Rollen **über Domänen hinweg** (Multi-Domain-Forest) |

Merkhilfe: **Global** = Mitglieder **lokal** (nur eigene Domäne), aber **global** verwendbar. **Lokal (Domäne)** = Mitglieder **global** (von überall), aber nur **lokal** (eigene Domäne) verwendbar.

**Bereich ändern**: Global ↔ Universal und Lokal (Domäne) ↔ Universal möglich (sofern die Mitgliedschaftsregeln passen), Global ↔ Lokal (Domäne) nur über den Umweg Universal.

### AGDLP (bzw. AGUDLP)
Die Microsoft-Best-Practice für Berechtigungen:
- **A**ccounts (Benutzer/Computer) →
- **G**lobale Gruppen (Rollen: *wer* ist das?) →
- (**U**niverselle Gruppen – bei mehreren Domänen) →
- **D**omänen**l**okale Gruppen (Ressourcenzugriff: *was* darf man?) →
- **P**ermissions (Berechtigungen an der Ressource, NTFS/Freigabe)

Beispiel (Heimlabor-Schema):
- Benutzer hr.meier, hr.schmidt → **GG-HR**
- GG-HR → **DL-HR-Aendern** und **DL-Austausch-Lesen**
- NTFS: `\\SRV\HR` → DL-HR-Aendern: Ändern; `\\SRV\Austausch` → DL-Austausch-Lesen: Lesen

Vorteile: Rollen und Ressourcenrechte sind **getrennt verwaltet**; ACLs bleiben klein und stabil; bei Umorganisation ändert man nur Mitgliedschaften; funktioniert auch über Domänen- und Gesamtstrukturgrenzen hinweg. Namenskonvention (Präfixe **GG-**, **DL-**, **UG-**) macht das Konzept sichtbar.

### Standardgruppen (Auswahl)
| Gruppe | Bereich | Bedeutung |
|---|---|---|
| **Domänen-Admins** | global | volle Kontrolle über die Domäne; Mitglied der lokalen Administratoren aller Domänenrechner |
| **Organisations-Admins** (Enterprise Admins) | universal (nur Stammdomäne) | volle Kontrolle über die Gesamtstruktur |
| **Schema-Admins** | universal (nur Stammdomäne) | Schema ändern |
| **Domänen-Benutzer** | global | alle Benutzerkonten der Domäne |
| **Domänencomputer** | global | alle Mitgliedscomputer (ohne DCs) |
| **Administratoren** (Builtin) | lokal (Domäne) | Admin auf den DCs |
| **Konten-Operatoren**, **Server-Operatoren**, **Sicherungs-Operatoren**, **Druck-Operatoren** | lokal (Domäne) | delegierte Teilrechte (möglichst **leer lassen**, Delegierung stattdessen) |
| **Protected Users** | global | verschärfter Schutz für privilegierte Konten (kein NTLM, keine Delegierung, kein Caching) |
| **DnsAdmins**, **Gruppenrichtlinien-Ersteller-Besitzer** | – | Teilverwaltung |
Privilegierte Gruppen **so klein wie möglich** halten und überwachen.

### Sonderidentitäten (spezielle Gruppen)
Mitgliedschaft **automatisch** durch das System, nicht verwaltbar, erscheinen in ACLs:
| Identität | Wer ist Mitglied? |
|---|---|
| **Jeder** (Everyone) | alle, die auf das System zugreifen (inkl. Gäste) |
| **Authentifizierte Benutzer** | alle mit gültiger Anmeldung (Benutzer **und Computer**, ohne Gast) – Standard-Sicherheitsfilter bei GPOs |
| **Interaktiv** | lokal/per RDP angemeldete Benutzer |
| **Netzwerk** | Zugriff über das Netzwerk |
| **Ersteller-Besitzer** (CREATOR OWNER) | der Ersteller eines Objekts (Platzhalter für Vererbung) |
| **Anonymous-Anmeldung** | nicht authentifizierte Zugriffe |
| **SYSTEM** | das Betriebssystem selbst |

### Mitgliedschaft verwalten und delegieren
- Mitglieder hinzufügen: Gruppe → Eigenschaften → **Mitglieder**; umgekehrt Benutzer → **Mitglied von**.
- **Delegation**: Gruppe → Eigenschaften → **Verwaltet von** → Benutzer/Gruppe + Haken „**Manager kann Mitgliedschaftsliste aktualisieren**“ – so kann z. B. die Teamleitung selbst Mitglieder pflegen.
- Gruppenänderungen wirken erst nach **Neuanmeldung** (Kerberos-Ticket/Token), bei Computern nach **Neustart** (oder `klist purge -li 0x3e7`).
- **Standardgruppe eines Benutzers** = „Domänen-Benutzer“ (primäre Gruppe, nur für POSIX/Mac relevant).

## Lab
**Maschine: DC01** (Domäne contoso.local, OU Schulung mit Unter-OUs vorhanden), Dateiserver **SRV01** mit Ordner `D:\Freigaben\HR`.

### GUI
1. **DC01**: `dsa.msc` → OU Schulung\Gruppen → Neu → Gruppe → **GG-HR**, Bereich **Global**, Typ **Sicherheit**.
2. Ebenso **DL-HR-Aendern** (Bereich **Lokal (in Domäne)**) und **DL-HR-Lesen**.
3. Benutzer hr.meier und hr.schmidt → Eigenschaften → **Mitglied von** → Hinzufügen → GG-HR.
4. DL-HR-Aendern → Mitglieder → Hinzufügen → **GG-HR** (Gruppenverschachtelung).
5. DL-HR-Aendern → Registerkarte **Verwaltet von** → Teamleitung hr.meier eintragen + „Manager kann Mitgliedschaftsliste aktualisieren“.
6. **SRV01**: `D:\Freigaben\HR` → Freigabe „HR“ → **Authentifizierte Benutzer: Vollzugriff** → Sicherheit → Erweitert → Vererbung deaktivieren (konvertieren) → Benutzer-Einträge entfernen → **DL-HR-Aendern: Ändern**, **DL-HR-Lesen: Lesen** (SYSTEM + Administratoren behalten).
7. **CL01**: als hr.schmidt **neu anmelden** → `\\SRV01\HR` → Datei anlegen ✔ → `whoami /groups` (GG-HR und DL-HR-Aendern sichtbar).

### PowerShell
```powershell
# Auf DC01
$ou = "OU=Gruppen,OU=Schulung,DC=contoso,DC=local"
New-ADGroup -Name "GG-HR" -GroupScope Global -GroupCategory Security -Path $ou
New-ADGroup -Name "DL-HR-Aendern" -GroupScope DomainLocal -GroupCategory Security -Path $ou
New-ADGroup -Name "DL-HR-Lesen" -GroupScope DomainLocal -GroupCategory Security -Path $ou
Add-ADGroupMember "GG-HR" -Members hr.meier, hr.schmidt
Add-ADGroupMember "DL-HR-Aendern" -Members "GG-HR"
Set-ADGroup "DL-HR-Aendern" -ManagedBy hr.meier
Get-ADGroupMember "DL-HR-Aendern" -Recursive | Select-Object SamAccountName
Get-ADPrincipalGroupMembership hr.schmidt | Select-Object Name, GroupScope

# Auf SRV01
New-Item D:\Freigaben\HR -ItemType Directory -Force
New-SmbShare -Name HR -Path D:\Freigaben\HR -FullAccess "Authentifizierte Benutzer"
icacls D:\Freigaben\HR /inheritance:d
icacls D:\Freigaben\HR /remove "Benutzer" /remove "VORDEFINIERT\Benutzer"
icacls D:\Freigaben\HR /grant "CONTOSO\DL-HR-Aendern:(OI)(CI)M" /grant "CONTOSO\DL-HR-Lesen:(OI)(CI)RX"

# Auf CL01 (als hr.schmidt)
whoami /groups
klist purge          # Kerberos-Tickets verwerfen, falls Gruppenänderung nicht greift
```

## Einfach

Stell dir eine Schule mit **500 Schülern** vor. Der Hausmeister müsste jedem einzeln sagen, welche Räume er betreten darf – unmöglich! Stattdessen gibt es **Gruppen**.

**Zwei Arten von Gruppen**:
- **Sicherheitsgruppen** bekommen **Schlüssel** (Berechtigungen).
- **Verteilergruppen** sind nur **E-Mail-Verteiler** („Rundmail an alle Lehrer“) – ohne Schlüssel.

**AGDLP – der Profi-Trick** in zwei Stufen:
1. **Globale Gruppe = WER bist du?** Zum Beispiel „Klasse 10b“ – darin stehen alle Schüler der 10b.
2. **Domänenlokale Gruppe = WAS darfst du?** Zum Beispiel „Darf in den Chemieraum“ – darin steht die Gruppe „Klasse 10b“.
3. Am **Chemieraum** (der Ressource) steht nur: „Wer in ‚Darf in den Chemieraum‘ ist, kommt rein.“

Kommt ein neuer Schüler in die 10b, trägt man ihn **nur in die Klassenliste** ein – und er darf automatisch überall hin, wo die 10b hin darf. Und will man auch der 10c den Chemieraum erlauben, packt man die 10c in „Darf in den Chemieraum“ – ohne am Raum selbst etwas zu ändern.

**Die vier Bereiche** kurz:
- **Global**: Mitglieder nur aus der **eigenen Schule**, aber die Gruppe kann **überall** eingesetzt werden. → für Rollen („Lehrer“, „10b“)
- **Lokal (Domäne)**: Mitglieder aus **allen Schulen**, aber nur für Räume der **eigenen Schule**. → für Rechte
- **Universal**: Mitglieder von **überall**, Einsatz **überall** – für große Schulverbünde.
- **Lokal (Computer)**: gilt nur auf **einem einzigen Rechner**.

**Sonderidentitäten** sind Gruppen, in die man **automatisch** kommt: „**Jeder**“ (wirklich jeder, auch Gäste) oder „**Authentifizierte Benutzer**“ (jeder, der sich angemeldet hat).

## Merksatz
- **AGDLP**: Accounts → Global → Domain Local → Permissions.
- **Global = Wer** (Rolle), **Domänenlokal = Was** (Recht).
- Global: Mitglieder **nur eigene Domäne**; Domänenlokal: Verwendung **nur eigene Domäne**.
- Universal-Mitgliedschaft liegt im **globalen Katalog**.
- Verteilergruppe = **keine SID, keine Rechte**.

## Prüfungsfalle
- Verteilergruppen können keine Berechtigungen erhalten.
- Globale Gruppen können keine Benutzer aus anderen Domänen enthalten.
- Domänenlokale Gruppen können nicht in ACLs anderer Domänen verwendet werden.
- Rechte an einzelne Benutzer statt an Gruppen = schlechte Praxis.
- „Jeder“ ≠ „Authentifizierte Benutzer“ (Gäste/anonym).

## Grafik
### AGDLP-Kette
Vier Stationen als Förderband: Benutzer-Figuren fallen in eine GG-Kiste, die GG-Kiste in eine DL-Kiste, die DL-Kiste bekommt einen Schlüssel für einen Ordner. Neuer Mitarbeiter springt in die GG-Kiste und kann sofort den Ordner öffnen.

### Bereichs-Matrix
Tabelle mit den vier Bereichen; Drag & Drop „Kann X Mitglied von Y sein?“ mit grünem Haken/rotem Kreuz.

### Mit/ohne Gruppen
Links ein Spinnennetz aus 20 Benutzern und 10 Ordnern (200 Linien), rechts dasselbe mit AGDLP (wenige, geordnete Linien).

## Karteikarten
- F: Unterschied Sicherheits- und Verteilergruppe? | A: Sicherheitsgruppe hat eine SID und kann Rechte erhalten; Verteilergruppe nur für E-Mail.
- F: Vier Gruppenbereiche? | A: Lokal (Computer), Lokal (in Domäne), Global, Universal.
- F: Wer darf Mitglied einer globalen Gruppe sein? | A: Nur Benutzer, Computer und globale Gruppen derselben Domäne.
- F: Wo sind universelle Gruppenmitgliedschaften gespeichert? | A: Im globalen Katalog (gesamtstrukturweit).
- F: Wofür steht AGDLP? | A: Accounts → Global groups → Domain Local groups → Permissions.
- F: Wofür nutzt man globale Gruppen, wofür domänenlokale? | A: Global: Rollen (wer). Domänenlokal: Ressourcenzugriff (was).
- F: Wann braucht man AGUDLP? | A: In Gesamtstrukturen mit mehreren Domänen – Universelle Gruppen fassen globale Gruppen verschiedener Domänen zusammen.
- F: Unterschied „Jeder“ und „Authentifizierte Benutzer“? | A: Jeder schließt Gäste/anonyme Zugriffe ein; Authentifizierte Benutzer nur angemeldete Benutzer und Computer.
- F: Wie delegiert man die Mitgliedschaftsverwaltung? | A: Gruppe → Verwaltet von → Manager + „Manager kann Mitgliedschaftsliste aktualisieren“.
- F: Warum wirkt eine neue Gruppenmitgliedschaft nicht sofort? | A: Token/Kerberos-Ticket enthält die alten Gruppen – neu anmelden bzw. Computer neu starten.
- F: Welche Gruppe hat volle Kontrolle über die gesamte Gesamtstruktur? | A: Organisations-Admins (Enterprise Admins).

## Quiz
? Welche Gruppe sollte laut AGDLP direkt in der ACL eines Ordners stehen?
* Eine domänenlokale Gruppe
- Eine globale Gruppe
- Ein einzelner Benutzer
- Eine Verteilergruppe

? Welche Mitglieder kann eine globale Gruppe haben?
* Benutzer, Computer und globale Gruppen derselben Domäne
- Benutzer aus allen Domänen der Gesamtstruktur
- Domänenlokale Gruppen anderer Domänen
- Universelle Gruppen

? Welcher Gruppentyp kann keine Berechtigungen erhalten?
* Verteilergruppe
- Sicherheitsgruppe
- Globale Sicherheitsgruppe
- Universelle Sicherheitsgruppe

? Wo wird die Mitgliedschaft universeller Gruppen gespeichert?
* Im globalen Katalog
- Nur in der SAM des Clients
- In der DNS-Zone
- Im SYSVOL

? Welche Sonderidentität ist der Standard-Sicherheitsfilter eines neuen GPOs?
* Authentifizierte Benutzer
- Jeder
- Domänen-Admins
- Interaktiv

? Wofür steht das „DL“ in AGDLP?
* Domänenlokale Gruppe
- Download-Link
- Delegierte Leserechte
- Domain Login
! Accounts → Global → Domänenlokal → Permissions.

? Wo werden globale Gruppen typischerweise eingesetzt?
* Zum Bündeln von Benutzern nach Rolle bzw. Abteilung
- Direkt für NTFS-Berechtigungen auf Ressourcen
- Nur für E-Mail-Verteiler
- Für lokale Computerkonten
! Rechte erhält nach AGDLP die domänenlokale Gruppe.

? Welche Gruppenart hat keine SID und eignet sich nur für E-Mails?
* Verteilergruppe
- Sicherheitsgruppe
- Universelle Sicherheitsgruppe
- Domänenlokale Sicherheitsgruppe
! Verteilergruppen lassen sich in Exchange als Verteiler nutzen.
