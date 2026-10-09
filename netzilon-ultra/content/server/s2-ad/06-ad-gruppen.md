---
id: server-ad-gruppen
bereich: AZ-800
pruefungen: [Schule, AP2]
fach: Windows Server / Adv.
block: S2
kapitel: Active Directory
titel: AD-Gruppen – Typen, Gruppenbereiche und Strategie
stufe: Profi
quellen: [AD-Gruppen.pdf]
verweise: [server-trusts-uebungen, server-ad-ds-ueberblick]
---

## Profi

### Gruppentypen
| Typ | Zweck | Sicherheitsprinzipal (SID) |
|---|---|---|
| **Verteilergruppe** (*Distribution*) | E-Mail-Verteiler (z. B. Exchange) | nein, **nicht** in ACLs nutzbar |
| **Sicherheitsgruppe** (*Security*) | Berechtigungen und Rechte, auch als Verteiler nutzbar | **ja**, in ACLs und GPO-Rechten nutzbar |

Ein Typ kann nachträglich zwischen Verteiler und Sicherheit gewechselt werden.

### Gruppenbereiche (Scopes)
| Bereich | Mitglieder aus | Verwendbar in | Replikation |
|---|---|---|---|
| **Lokal** (Computer, SAM) | beliebige Domänen der Gesamtstruktur und vertrauten Domänen | nur auf diesem Computer | keine |
| **Lokal in Domäne** (domänenlokal) | Konten, globale und universale Gruppen **beliebiger** Domäne; domänenlokale nur der **eigenen** Domäne | Ressourcen **nur in der eigenen Domäne** | nur in der Domäne |
| **Global** | Konten und globale Gruppen der **eigenen** Domäne | überall in der Gesamtstruktur und in vertrauenden Domänen | in der Domäne; im GC nur der Name, **nicht** die Mitglieder |
| **Universal** | Konten, globale und universale Gruppen **beliebiger** Domäne | überall in der Gesamtstruktur | **Mitgliederliste im globalen Katalog** (jede Änderung wird gesamtstrukturweit repliziert) |

Universale Gruppen sind nur in Domänen ab funktionalem Level „Windows 2000 pur“ (nativ) vorhanden, heute selbstverständlich.

### Strategien
- **A-G-DL-P**: **A**ccounts → **G**lobale Gruppen (nach Rolle/Abteilung) → **D**omänen**l**okale Gruppen (nach Ressource/Recht) → **P**ermission (NTFS, Freigabe).
- **A-G-U-DL-P**: In Gesamtstrukturen mit mehreren Domänen wird zwischen globale und domänenlokale Gruppe eine **universale Gruppe** eingefügt, die **nur globale Gruppen** (selten ändernde Mitglieder) enthält – spart GC-Replikation.
- **Verschachtelung** (*Nesting*) hält Verwaltung übersichtlich: Berechtigungen **nie** direkt an Benutzer.

### Verwaltet von
Im Reiter **Verwaltet von** (*managedBy*) einer Gruppe trägt man einen Verantwortlichen ein. Mit Haken **„Verwalter kann Mitgliederliste aktualisieren“** darf dieser Mitglieder ohne Admin-Rechte pflegen – eine einfache Delegierung.

### Standardgruppen und Spezielle Identitäten
- Im Container **Builtin** (domänenlokal): *Administratoren, Konten-Operatoren, Server-Operatoren, Sicherungs-Operatoren, Druck-Operatoren*. Im Container **Users** (meist global): *Domänen-Admins, Domänen-Benutzer, Organisations-Admins (universal, nur Stammdomäne), Schema-Admins*.
- Viele Standardgruppen sind **überdelegiert** (mehr Rechte als nötig) – Mitgliedschaften minimal halten (Tier-Modell, „Least Privilege“).
- **Spezielle Identitäten** werden vom System dynamisch gefüllt, ihre Mitglieder kann man nicht ändern: *Jeder* (Everyone), *Authentifizierte Benutzer*, *Interaktiv*, *Netzwerk*, *Ersteller-Besitzer*, *Anonymous*.

## Einfach

Stell dir eine **Schule** mit mehreren Gebäuden vor. Eine **Gruppe** ist wie eine Klassenliste: Statt jedem Schüler einzeln den Schlüssel zu geben, bekommt die Klasse den Schlüssel.

**Typ:** Eine **Verteilergruppe** ist nur eine Rundmail-Liste (der Hausmeister kann damit niemand ins Labor lassen). Eine **Sicherheitsgruppe** ist wie die Klassenliste mit Schlüsselrecht: Sie darf in Berechtigungslisten stehen und ist zugleich als Rundmail nutzbar.

**Bereich** heißt: Wer darf rein und wo gilt es?
- **Global** = die Klassenliste eines einzelnen Gebäudes. Nur Schüler dieses Gebäudes stehen drauf, aber die Liste ist überall bekannt.
- **Domänenlokal** = der Schlüsselschrank eines Raumes. Hier wird festgelegt, wer ins Labor darf. In den Schrank dürfen Listen aus allen Gebäuden gelegt werden, aber der Schrank gilt nur für dieses eine Gebäude.
- **Universal** = die Schulleitung: Eine zentrale Liste mit Mitgliedern aus allen Gebäuden. Sie wird im Verwaltungsbüro (dem globalen Katalog) abgelegt. Jede Änderung muss deshalb an alle Büros gemeldet werden – darum nimmt man sie nur sparsam und packt am besten nur ganze Klassenlisten hinein.
- **Lokal** = der Spind auf dem eigenen Computer, nur dort gültig.

**Die Faustregel A-G-DL-P:** Die Schüler (Accounts) kommen in Klassenlisten (Global), die Klassenlisten kommen in Schlüssellisten der Räume (Domänenlokal) und die Schlüsselliste bekommt die Berechtigung (Permission). Wenn ein Schüler wechselt, tauscht man nur seine Klassenzugehörigkeit – an den Räumen ändert sich nichts.

**Verwaltet von:** Die Klassenleitung darf ihre Liste selbst pflegen, ohne den Schulleiter zu fragen.

**Spezielle Identitäten** sind wie „jeder, der das Gelände betritt“ oder „jeder mit Besucherausweis“. Du entscheidest nicht, wer drin ist, das System füllt sie automatisch.

**Warum so viel Aufwand?** In großen Netzen mit hunderten Ordnern wäre es unmöglich, jedem Benutzer einzeln Rechte zu geben. Mit Gruppen genügt eine Zeile in der Berechtigungsliste, und die Verwaltung bleibt nachvollziehbar und prüfbar. Das ist in der Prüfung (und im Beruf) die zentrale Antwort auf die Frage, warum man Gruppen und nicht Benutzer berechtigt.

## Merksatz
- **A-G-DL-P**: Konten in globale Gruppen, diese in domänenlokale Gruppen, diese erhalten die Berechtigung.
- **Verteilergruppen haben keine SID für Rechte** – nur Sicherheitsgruppen gehen in ACLs.
- **Global** = Mitglieder nur eigene Domäne, **Universal** = alles, Mitglieder im GC.
- **Domänenlokal** = Ressourcenzugriff nur in der eigenen Domäne.

## Prüfungsfalle
- Globale Gruppen dürfen **keine** Mitglieder anderer Domänen enthalten (nur eigene Domäne), domänenlokale Gruppen dürfen Mitglieder **aller** Domänen haben.
- „Lokal in Domäne“ ≠ „Lokal“: Die lokale Gruppe liegt in der SAM des Computers, die domänenlokale in AD.
- Universale Gruppen werden mit **Mitgliedern** im GC gespeichert, globale nur mit dem Namen. Deshalb nicht ständig Benutzer direkt in universale Gruppen packen.
- Verteilergruppen eignen sich **nicht** für Berechtigungen.
- Organisations-Admins sind **universal**, Domänen-Admins **global**.

## Grafik
### A-G-DL-P Berechtigungskette
1. Benutzer: Anna ist Vertriebsmitarbeiterin
2. Benutzer -> GG_Vertrieb: Anna wird Mitglied der globalen Gruppe
3. GG_Vertrieb -> DL_Ordner_Preise_Aendern: Globale Gruppe wird Mitglied der domänenlokalen Gruppe
4. DL_Ordner_Preise_Aendern -> Ordner Preise: NTFS Ändern wird an die DL-Gruppe vergeben
5. Benutzer -> Ordner Preise: Anna darf nun schreiben, ohne dass ihr Konto direkt in der ACL steht

## Lab
Domäne **example.com**, Server **EXA-DC01**, Client **EXA-CL01**. Alle Schritte als Domänen-Administrator.

### GUI
1. EXA-DC01: Server-Manager → Tools → **Active Directory-Benutzer und -Computer**.
2. OU **Vertrieb** rechtsklicken → Neu → **Gruppe** → Name **GG_Vertrieb**, Bereich **Global**, Typ **Sicherheit**.
3. Neue Gruppe **DL_Preise_Aendern**, Bereich **Lokal in Domäne**, Typ **Sicherheit**.
4. Eigenschaften von DL_Preise_Aendern → **Mitglieder** → GG_Vertrieb hinzufügen.
5. Reiter **Verwaltet von** → Verantwortlichen wählen, Haken „Verwalter kann Mitgliederliste aktualisieren“.
6. EXA-FS01 (Dateiserver): Ordner D:\Preise → Eigenschaften → Sicherheit → DL_Preise_Aendern mit **Ändern** eintragen.

### PowerShell
```powershell
# EXA-DC01
New-ADGroup -Name GG_Vertrieb -GroupScope Global -GroupCategory Security -Path "OU=Vertrieb,DC=example,DC=com"
New-ADGroup -Name DL_Preise_Aendern -GroupScope DomainLocal -GroupCategory Security -Path "OU=Vertrieb,DC=example,DC=com"
Add-ADGroupMember -Identity DL_Preise_Aendern -Members GG_Vertrieb
Add-ADGroupMember -Identity GG_Vertrieb -Members anna.beispiel
Set-ADGroup -Identity GG_Vertrieb -ManagedBy "anna.chef"
Get-ADGroupMember -Identity DL_Preise_Aendern -Recursive
```

## Befehle
- `New-ADGroup -GroupScope Global|DomainLocal|Universal` – Gruppe anlegen
- `Add-ADGroupMember -Identity G -Members U` – Mitglied hinzufügen
- `Remove-ADGroupMember -Identity G -Members U` – Mitglied entfernen
- `Get-ADGroupMember -Recursive` – Mitglieder inklusive Verschachtelung
- `Get-ADPrincipalGroupMembership U` – in welchen Gruppen ist ein Benutzer?
- `Set-ADGroup -GroupScope Universal` – Bereich ändern
- `net localgroup Administratoren` – lokale Gruppe anzeigen

## Übungen
- A: Alle Vertriebsmitarbeiter einer einzigen Domäne sollen Schreibrecht auf einen Ordner bekommen. Welche Gruppenstrategie? | L: Konten → globale Gruppe → domänenlokale Gruppe → NTFS (A-G-DL-P).
- A: Wann braucht man eine universale Gruppe? | L: Wenn Mitglieder aus mehreren Domänen einer Gesamtstruktur gebündelt und gesamtstrukturweit genutzt werden sollen. Idealerweise nur globale Gruppen als Mitglieder.
- A: Eine Verteilergruppe soll NTFS-Rechte bekommen. Was tun? | L: Gruppentyp auf Sicherheit umstellen; Verteilergruppen sind kein Sicherheitsprinzipal.
- A: Welche Gruppe kann Mitglieder aus allen Domänen aufnehmen, aber nur in der eigenen Domäne Ressourcen schützen? | L: Die domänenlokale Gruppe.
- A: Wie delegiert man das Pflegen einer Mitgliederliste ohne Adminrechte? | L: Reiter Verwaltet von → Verwalter eintragen → „Verwalter kann Mitgliederliste aktualisieren“.

## Karteikarten
- F: Zwei Gruppentypen in AD? | A: Verteilergruppe (nur E-Mail) und Sicherheitsgruppe (Berechtigungen und Verteiler)
- F: Vier Gruppenbereiche? | A: Lokal, lokal in Domäne (domänenlokal), global, universal
- F: Mitglieder einer globalen Gruppe? | A: Konten und globale Gruppen der eigenen Domäne
- F: Mitglieder einer domänenlokalen Gruppe? | A: Konten, globale und universale Gruppen beliebiger Domänen
- F: Wo ist eine domänenlokale Gruppe verwendbar? | A: Nur für Ressourcen der eigenen Domäne
- F: Was wird für universale Gruppen im GC gespeichert? | A: Die komplette Mitgliederliste
- F: A-G-DL-P? | A: Accounts, Globale Gruppen, Domänenlokale Gruppen, Permission
- F: Wozu dient A-G-U-DL-P? | A: Mehrere Domänen: universale Gruppe bündelt globale Gruppen
- F: Wozu der Reiter Verwaltet von? | A: Verantwortlichen eintragen, der Mitglieder pflegen darf
- F: Spezielle Identitäten? | A: Systemgesteuerte Gruppen wie Jeder, Authentifizierte Benutzer, Interaktiv, Netzwerk

## Quiz
? Welche Gruppe darf in einer ACL stehen?
* Sicherheitsgruppe
- Verteilergruppe
- Keine, nur Benutzer
- Nur die Gruppe Jeder

? Wer darf Mitglied einer globalen Gruppe sein?
* Konten und globale Gruppen der eigenen Domäne
- Beliebige Konten der Gesamtstruktur
- Nur Computerkonten
- Nur domänenlokale Gruppen

? Welche Gruppe speichert die Mitglieder im globalen Katalog?
* Universal
- Global
- Domänenlokal
- Lokal

? Was bedeutet A-G-DL-P?
* Konten in globale Gruppen, in domänenlokale Gruppen, dann Berechtigung
- Administrator, Gast, Domäne, Passwort
- Authentifizierung, GPO, DNS, PowerShell
- Anwender, Gerät, Drucker, Protokoll

? Wo ist eine domänenlokale Gruppe für Berechtigungen nutzbar?
* Nur in der eigenen Domäne
- In der ganzen Gesamtstruktur
- In allen vertrauenden Gesamtstrukturen
- Nur auf einem Computer

? Wofür ist eine Verteilergruppe gedacht?
* E-Mail-Verteiler
- NTFS-Rechte
- Gruppenrichtlinien
- Kerberos-Authentifizierung

? Was sind spezielle Identitäten?
* Systemgesteuerte Gruppen wie Authentifizierte Benutzer
- Gruppen für Administratoren
- Nur Gruppen im Container Builtin
- Gelöschte Gruppen im Papierkorb

? Welchen Bereich hat die Gruppe Organisations-Admins?
* Universal (nur Stammdomäne)
- Lokal
- Global
- Domänenlokal
