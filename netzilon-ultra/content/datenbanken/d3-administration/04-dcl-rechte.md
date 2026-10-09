---
id: db-dcl
bereich: Datenbanken
pruefungen: [Schule, AP2]
fach: SQL / Datenbanken
block: D3
kapitel: Administration
titel: DCL – Logins, Benutzer, Rollen, GRANT, REVOKE, DENY
stufe: Fortgeschritten
quellen: [tsql.pdf, sql.pdf, Lernen_SQL.pdf, aufgaben_benutzermanagement.pdf]
verweise: [db-sql-grundlagen, db-backup-restore, db-ddl]
---

## Profi

### Sicherheitsmodell von SQL Server
1. **Authentifizierung**: Windows-Authentifizierung (Kerberos/AD, empfohlen) oder SQL Server-Authentifizierung (gemischter Modus); in Azure SQL zusätzlich Microsoft Entra ID.
2. **Login** (Serverebene, Anmeldung an der Instanz) → **Benutzer** (Datenbankebene, `CREATE USER … FOR LOGIN …`) → **Rollen** → **Berechtigungen** auf Objekte (Tabelle, Sicht, Schema, Prozedur).
3. Berechtigungen werden per **DCL** vergeben:
   - `GRANT SELECT, INSERT ON dbo.Kunde TO vertrieb;` – erlauben
   - `REVOKE INSERT ON dbo.Kunde FROM vertrieb;` – ausdrückliche Erlaubnis/Verweigerung **zurücknehmen** (neutral)
   - `DENY DELETE ON dbo.Kunde TO vertrieb;` – ausdrücklich **verbieten**; **DENY schlägt GRANT** (auch über Rollenmitgliedschaft).
   - `WITH GRANT OPTION` erlaubt Weitergabe.
Berechtigungen auf Schema- und Datenbankebene werden vererbt.

### Feste Rollen
| Ebene | Rollen (Auswahl) |
|---|---|
| Server | **sysadmin** (alles), serveradmin, securityadmin, dbcreator, bulkadmin |
| Datenbank | **db_owner**, db_datareader, db_datawriter, db_ddladmin, db_securityadmin, db_backupoperator, db_denydatareader, db_denydatawriter, public |
Benutzerdefinierte Rollen: `CREATE ROLE vertrieb; ALTER ROLE vertrieb ADD MEMBER anna;`

### Anmeldung und Benutzer anlegen
```
CREATE LOGIN anna WITH PASSWORD = '<starkes Passwort>';        -- Server
CREATE LOGIN [EXA\Vertrieb] FROM WINDOWS;                       -- AD-Gruppe
USE Schulung;
CREATE USER anna FOR LOGIN anna;
GRANT SELECT ON SCHEMA::Sales TO anna;
```
In Azure SQL Database: **contained database users** `CREATE USER anna WITH PASSWORD = '…'`, Firewallregeln, Entra-Admin.

### Prinzipien und Zusatzfunktionen
**Least Privilege**, Rollen/Gruppen statt Einzelrechte (analog AGDLP), Sichten und gespeicherte Prozeduren als Zugriffsschicht, **Dynamic Data Masking**, Zeilenebenen-Sicherheit (RLS), Always Encrypted, TDE (Transparent Data Encryption), Auditing.

## Einfach

Stell dir die Datenbank als **Gebäude mit vielen Zimmern** vor. Wer hinein darf und in welches Zimmer, regelst du mit **Schlüsseln und Ausweisen**:

1. **Login** = Der **Eingangsausweis am Haupttor**: Nur wer einen hat, kommt aufs Gelände (den Server).
2. **Benutzer** = Der **Zimmerausweis** für ein bestimmtes Gebäude (eine Datenbank).
3. **Rolle** = Eine **Berufsgruppe** („Vertrieb“, „Praktikanten“). Statt jedem einzeln Schlüssel zu geben, gibst du der Gruppe die Rechte, und Leute werden Mitglied.

Die Rechte-Befehle sind wie eine **Ampel**:
- **GRANT** (grün) = „Du darfst.“
- **REVOKE** (Schild abnehmen) = „Meine frühere Ansage gilt nicht mehr“ – weder grün noch rot, einfach neutral.
- **DENY** (rot) = „Du darfst **auf keinen Fall**“ – und rot schlägt immer grün. Auch wenn deine Gruppe darf, **du** darfst nicht.

Beispiel: Anna ist im Vertrieb (Gruppe darf lesen und schreiben), aber du sagst `DENY DELETE … TO anna` → Anna darf lesen und schreiben, aber nie löschen.

Die goldene Regel heißt **Least Privilege**: Gib jedem **nur das Minimum**, was er für seine Arbeit braucht. Nicht „Admin für alle“.

## Merksatz
- **Login → Benutzer → Rolle → Berechtigung.**
- **GRANT erlaubt, REVOKE nimmt zurück, DENY verbietet – DENY gewinnt.**
- **Least Privilege.**
- **Rollen/Gruppen statt Einzelrechte.**

## Prüfungsfalle
- REVOKE ≠ DENY: REVOKE hebt nur auf, DENY verbietet aktiv.
- DENY gewinnt gegen GRANT, auch wenn das GRANT über eine Rolle kommt.
- Login (Server) und Benutzer (Datenbank) sind zwei verschiedene Objekte.
- `public` hat jeder – dorthin keine weitreichenden Rechte vergeben.
- `sa`/sysadmin nicht für Anwendungen verwenden.

## Grafik
### Zugriff prüfen
1. Client -> SQL-Server: Anmeldung (Login anna)
2. SQL-Server: Login bekannt, Passwort/Windows-Konto gültig
3. Client -> SQL-Server: SELECT * FROM Kunde
4. SQL-Server: Benutzer anna in DB Schulung? Rolle vertrieb?
5. SQL-Server: DENY vorhanden? Sonst GRANT? Sonst Zugriff verweigert
6. SQL-Server -> Client: Ergebnis oder Fehler 229

## Lab
### SQL
Maschine: SQL-Server-VM (SSMS), Datenbank Schulung.
```
CREATE LOGIN anna WITH PASSWORD = 'Ein-Starkes-Pw-123!';
CREATE USER anna FOR LOGIN anna;
CREATE ROLE vertrieb; ALTER ROLE vertrieb ADD MEMBER anna;
GRANT SELECT, INSERT, UPDATE ON dbo.Kunde TO vertrieb;
DENY DELETE ON dbo.Kunde TO anna;
EXECUTE AS USER = 'anna'; DELETE FROM dbo.Kunde; REVERT;   -- schlägt fehl
```

## Befehle
- `GRANT recht ON objekt TO ziel` – erlauben
- `REVOKE recht ON objekt FROM ziel` – zurücknehmen
- `DENY recht ON objekt TO ziel` – verbieten
- `CREATE LOGIN / CREATE USER / CREATE ROLE` – Sicherheitsprinzipale
- `ALTER ROLE r ADD MEMBER u` – Mitglied hinzufügen

## Übungen
- A: Die Gruppe „Praktikanten“ soll Kunden lesen, aber nicht ändern. | L: GRANT SELECT ON dbo.Kunde TO Praktikanten; (optional DENY INSERT, UPDATE, DELETE)
- A: Anna ist in Rolle vertrieb mit GRANT DELETE; dennoch soll sie nicht löschen. | L: DENY DELETE ON dbo.Kunde TO anna;
- A: Unterschied Login und Benutzer? | L: Login = Anmeldung am Server, Benutzer = Zuordnung in einer Datenbank.
- A: Was bewirkt REVOKE? | L: Nimmt eine frühere GRANT-/DENY-Anweisung zurück, ohne selbst zu verbieten.
- A: Robots4Ever: Lege Login und Benutzer für Lena an, nur SELECT auf Schema Verkauf. | L: CREATE LOGIN lena WITH PASSWORD='<eigenes starkes Kennwort>'; CREATE USER lena FOR LOGIN lena; GRANT SELECT ON SCHEMA::Verkauf TO lena;
- A: Wie gibt man Rechte über eine Rolle weiter? | L: CREATE ROLE r_lesen; GRANT SELECT ON SCHEMA::Verkauf TO r_lesen; ALTER ROLE r_lesen ADD MEMBER lena;
- A: Was bewirken WITH GRANT OPTION und REVOKE CASCADE? | L: GRANT OPTION erlaubt Weitergabe des Rechts; REVOKE CASCADE entzieht es auch allen, die es vom Empfänger erhielten.
- A: Wie testet man Lenas Rechte ohne Anmeldung? | L: EXECUTE AS USER = 'lena'; SELECT * FROM Verkauf.Kunde; REVERT;

## Karteikarten
- F: Wofür steht DCL? | A: Data Control Language – GRANT, REVOKE, DENY.
- F: Was bewirkt GRANT? | A: Erteilt eine Berechtigung.
- F: Was bewirkt DENY? | A: Verweigert ausdrücklich; hat Vorrang vor GRANT.
- F: Was bewirkt REVOKE? | A: Hebt erteilte oder verweigerte Berechtigung auf.
- F: Unterschied Login und User? | A: Login auf Serverebene, User auf Datenbankebene.
- F: Was ist db_owner? | A: Feste Datenbankrolle mit allen Rechten in der Datenbank.
- F: Was ist sysadmin? | A: Feste Serverrolle mit allen Rechten auf der Instanz.
- F: Was ist Least Privilege? | A: Nur minimal nötige Rechte vergeben.
- F: Welche Authentifizierungsarten gibt es? | A: Windows-Authentifizierung und SQL-Server-Authentifizierung (Azure: zusätzlich Entra ID).

## Quiz
? Welcher Befehl verbietet ausdrücklich?
* DENY
- REVOKE
- GRANT
- DROP

? Was gewinnt bei Konflikt GRANT und DENY?
* DENY
- GRANT
- Das jüngere Statement
- Keines

? Was ist ein Login?
* Anmeldung auf Serverebene
- Eine Tabelle
- Eine Rolle in der Datenbank
- Ein Index

? Welche Rolle darf alles in der Datenbank?
* db_owner
- db_datareader
- public
- db_denydatareader

? Was macht REVOKE?
* Nimmt eine Berechtigungsanweisung zurück
- Verbietet ausdrücklich
- Erlaubt alles
- Löscht den Benutzer

? Wie legt man eine Rollenmitgliedschaft an?
* ALTER ROLE r ADD MEMBER u
- GRANT ROLE r TO u
- CREATE MEMBER
- INSERT INTO ROLE

? Was bedeutet Least Privilege?
* Nur die minimal nötigen Rechte
- Alle Rechte für Admins
- Keine Passwörter
- Nur Leserechte für alle

? Welche Authentifizierung wird empfohlen?
* Windows-Authentifizierung (AD)
- Anonym
- Gemeinsames Passwort für alle
- Nur sa

## Lücken
- {GRANT} erlaubt, {DENY} verbietet und {REVOKE} nimmt zurück.

## Spickzettel
- Login (Server) → User (DB) → Rolle → Recht
- GRANT / REVOKE / DENY (DENY gewinnt)
- sysadmin, db_owner, db_datareader/-writer
- Least Privilege
