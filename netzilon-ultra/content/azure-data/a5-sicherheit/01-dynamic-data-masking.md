---
id: azd-sicherheit
bereich: Azure Data
pruefungen: [DP-203, Schule]
fach: Data Engineering
block: A5
kapitel: Sicherheit
titel: Dynamic Data Masking und Datensicherheit in Azure
stufe: Fortgeschritten
quellen: [02a_Data_Engineering_-_SQL_Dynamik_Data_Masking.pdf, 05a_Data_Engineering_-_Storage_Grundlagen.pdf]
verweise: [db-dcl, azd-storage, azd-azure-sql]
---

## Profi

### Dynamic Data Masking (DDM)
DDM blendet sensible Spaltenwerte für nicht berechtigte Benutzer **zur Abfragezeit** aus: Anstelle der Daten werden Platzhalter angezeigt, die Daten in der Tabelle bleiben **unverändert**. Wirkung ist **benutzerabhängig**: Benutzer mit der Berechtigung **UNMASK** (und Administratoren/db_owner) sehen die Klartextdaten, alle anderen die maskierten. Es ist eine **Zusatzmaßnahme** und ersetzt keine Verschlüsselung/Berechtigungen.
```
CREATE TABLE Membership (
  MemberID INT IDENTITY(1,1) PRIMARY KEY,
  FirstName VARCHAR(100) MASKED WITH (FUNCTION = 'partial(1, "xxxxx", 1)'),
  Phone VARCHAR(12) MASKED WITH (FUNCTION = 'default()'),
  Email VARCHAR(100) MASKED WITH (FUNCTION = 'email()'),
  DiscountCode SMALLINT MASKED WITH (FUNCTION = 'random(1, 100)'));
GRANT UNMASK TO vertriebsleiter;     -- darf Klartext sehen
ALTER TABLE Membership ALTER COLUMN Phone ADD MASKED WITH (FUNCTION = 'default()');
```
| Funktion | Maskierung |
|---|---|
| **default()** | volle Maske nach Datentyp: String `xxxx`, Zahl `0`, Datum `1900-01-01` |
| **email()** | erster Buchstabe + Domain maskiert: `aXX@XXXX.com` |
| **random(start, ende)** | Zufallszahl im Bereich (numerische Typen) |
| **partial(prefix, padding, suffix)** | zeigt erste/letzte Zeichen, Rest durch Padding-String (Custom String) |
| (Kreditkarte) | über partial: `XXXX-XXXX-XXXX-1234` |

### Prüfungslogik (Szenarien)
Wer Zugriff auf sensible Daten (PII = personenbezogen, Finanzdaten, medizinisch, je Region unterschiedlich) hat, braucht eine Maskierungsrichtlinie; wer keinen Zugriff hat, benötigt keine Maske. „Nur weil jemand Zugang hat, bedeutet das nicht, dass er keine Maskierung braucht – er hat nur Zugang, und eine Richtlinie ist erforderlich.“ Prüfen: **Welche Spalte, welche Klassifizierung (PII/Finance/Health), welche Region, wer hat Zugriff?**

### Weitere Sicherheitsebenen in Azure Data
| Ebene | Maßnahme |
|---|---|
| Netzwerk | Firewallregeln, Private Endpoints, VNet-Dienstendpunkte |
| Identität | Microsoft Entra ID (Authentifizierung), Managed Identities, RBAC (Azure-Rollen), SQL-Rollen |
| Daten im Ruhezustand | Storage Service Encryption (AES-256, Standard), **TDE** (Transparent Data Encryption) für SQL, Customer-managed keys in **Key Vault** |
| Daten bei der Übertragung | TLS/HTTPS (Mindestversion erzwingen), „Sichere Übertragung erforderlich“ |
| Zugriff auf Storage | Kontoschlüssel (vermeiden), **SAS** (Shared Access Signature, zeitlich/rechtlich begrenzt), Entra ID/RBAC (empfohlen) |
| Spalten/Zeilen | **Always Encrypted**, **Row-Level Security**, **DDM**, Datenklassifizierung |
| Überwachung | Auditing, Microsoft Defender for SQL/Storage, Azure Monitor |

## Einfach

**Dynamic Data Masking** ist wie ein **Sichtschutz-Aufkleber** auf dem Bildschirm: Die echten Daten sind darunter immer noch da, aber wer nicht dazugehört, sieht nur **Sternchen**.

Beispiel: Ein Mitarbeiter im Callcenter darf sehen, dass es einen Kunden „M**** M*****“ mit der E-Mail `aXX@XXXX.com` gibt, damit er weiß, um wen es geht, aber er darf **nicht** die ganze Telefonnummer oder die Kreditkarte sehen (`XXXX-XXXX-XXXX-1234`, nur die letzten vier Ziffern). Die Chefin dagegen hat die Erlaubnis **UNMASK** und sieht alles.

Die fünf Verkleidungen:
1. **default**: komplett verstecken (Text → xxxx, Zahl → 0, Datum → 1900-01-01).
2. **email**: nur den ersten Buchstaben zeigen.
3. **random**: eine **Zufallszahl** statt der echten (z. B. bei Rabattcodes).
4. **partial**: Anfang und Ende zeigen, Mitte verstecken (z. B. `A*****e`).
5. **Kreditkarte**: nur die letzten 4 Ziffern.

Wichtig zu wissen: Das ist **nur ein Vorhang**, kein Tresor. Wer sich auskennt, kann durch geschickte Abfragen manchmal Rückschlüsse ziehen. Deshalb gibt es für die wirklich geheimen Daten zusätzlich **Verschlüsselung** (Always Encrypted, TDE) und **Rechte** (wer darf überhaupt in die Tabelle?).

Rund ums Daten-Haus gibt es außerdem **mehrere Schlösser**: die **Haustür** (Firewall), den **Ausweis** (Entra ID), den **Tresor** (Verschlüsselung), den **Besucherschein** (SAS-Token: „darf 1 Stunde in Raum 3“) und die **Kamera** (Auditing).

## Merksatz
- **DDM versteckt nur die Anzeige – die Daten bleiben unverändert.**
- **UNMASK-Recht = Klartext.**
- **Funktionen: default, email, random, partial.**
- **Verschlüsselung (TDE/Always Encrypted) ≠ Maskierung.**
- **SAS = zeitlich begrenzter Zugriff, Entra ID/RBAC bevorzugen.**

## Prüfungsfalle
- DDM ist **keine Verschlüsselung**; bei direktem Zugriff auf Dateien/Backups sind Daten im Klartext.
- Administratoren und Benutzer mit UNMASK sehen immer Klartext.
- Wer keinen Zugriff auf die Daten hat, braucht keine Maske (und umgekehrt: Zugang ≠ Freibrief).
- `random()` gilt nur für numerische Typen, `email()` für Strings.
- `partial(prefix, padding, suffix)`: Anzahl der sichtbaren Zeichen vorne/hinten.
- Region/Klassifizierung beachten: Gesundheitsdaten können nur in einer Region als sensibel gelten.

## Grafik
### Maskierte Abfrage
1. Vertrieb -> SQL-Server: SELECT Email, Phone FROM Membership
2. SQL-Server: prüft UNMASK-Recht, Benutzer hat es nicht
3. SQL-Server -> Vertrieb: aXX@XXXX.com und xxxx
4. Leiterin -> SQL-Server: dieselbe Abfrage (UNMASK)
5. SQL-Server -> Leiterin: Klartextwerte

## Lab
### SQL
Maschine: SQL-Server-VM oder Azure SQL (SSMS).
```
CREATE USER TestUser WITHOUT LOGIN;
GRANT SELECT ON Membership TO TestUser;
EXECUTE AS USER = 'TestUser'; SELECT * FROM Membership; REVERT;      -- maskiert
GRANT UNMASK TO TestUser;
EXECUTE AS USER = 'TestUser'; SELECT * FROM Membership; REVERT;      -- Klartext
```

## Befehle
- `MASKED WITH (FUNCTION = 'email()')` – Maske beim CREATE TABLE
- `ALTER TABLE t ALTER COLUMN c ADD MASKED WITH (FUNCTION='default()')` – Maske nachträglich
- `GRANT UNMASK TO user` / `REVOKE UNMASK` – Klartextrecht
- `SELECT * FROM sys.masked_columns` – maskierte Spalten anzeigen

## Übungen
- A: Eine Spalte mit E-Mail soll als aXX@XXXX.com erscheinen. | L: MASKED WITH (FUNCTION = 'email()')
- A: Vom Vornamen sollen nur der erste und letzte Buchstabe sichtbar sein. | L: partial(1, "xxxxx", 1)
- A: Wie erlaubt man einer Rolle den Klartext? | L: GRANT UNMASK TO rolle;
- A: Analysten dürfen Kreditkartennummern nur mit den letzten vier Ziffern sehen. | L: partial(0, "XXXX-XXXX-XXXX-", 4).
- A: Ist DDM ein Ersatz für Verschlüsselung? | L: Nein, es verbirgt nur die Anzeige; Daten bleiben unverschlüsselt (TDE/Always Encrypted nötig).

## Karteikarten
- F: Was ist Dynamic Data Masking? | A: Verbirgt sensible Spaltenwerte bei der Abfrage für nicht berechtigte Benutzer.
- F: Welches Recht hebt die Maskierung auf? | A: UNMASK.
- F: Maskierungsfunktion für E-Mail? | A: email().
- F: Maskierungsfunktion für Zufallszahl? | A: random(start, ende).
- F: Syntax der Teilmaskierung? | A: partial(prefix, padding, suffix).
- F: Ergebnis default() bei Text/Zahl/Datum? | A: xxxx / 0 / 1900-01-01.
- F: Ist DDM Verschlüsselung? | A: Nein, die Daten bleiben unverändert gespeichert.
- F: Was ist TDE? | A: Transparent Data Encryption – Verschlüsselung der Datenbank im Ruhezustand.
- F: Was ist eine SAS? | A: Shared Access Signature – zeitlich und rechtlich begrenzter Zugriffstoken.
- F: Was ist Always Encrypted? | A: Clientseitige Spaltenverschlüsselung, Schlüssel nie beim Server.

## Quiz
? Welche Funktion maskiert E-Mail-Adressen?
* email()
- default()
- random()
- partial()

? Welches Recht zeigt maskierte Daten im Klartext?
* UNMASK
- SELECT
- CONTROL ALL
- VIEW

? Was passiert mit den gespeicherten Daten bei DDM?
* Sie bleiben unverändert
- Sie werden verschlüsselt
- Sie werden gelöscht
- Sie werden überschrieben

? Welche Funktion zeigt nur Anfang und Ende?
* partial()
- email()
- random()
- default()

? Was ergibt default() bei einem Datum?
* 1900-01-01
- 0000-00-00
- NULL
- xxxx

? Was ist die Funktion von TDE?
* Verschlüsselung der Datenbank im Ruhezustand
- Maskierung der Anzeige
- Zeilenfilterung
- Firewall

? Wofür steht SAS im Storage-Kontext?
* Shared Access Signature
- Secure Access System
- Storage Account Service
- Single Authentication Server

? Wer sieht bei DDM immer die Klartextdaten?
* Administratoren und Benutzer mit UNMASK
- Alle Benutzer
- Nur anonyme Benutzer
- Niemand

## Lücken
- Maskierte Daten sieht nur, wer das Recht {UNMASK} besitzt.
- Die Funktion {partial} zeigt nur die ersten und letzten Zeichen.

## Zuordnen
### Maske und Wirkung
- default() => xxxx / 0 / 1900-01-01
- email() => aXX@XXXX.com
- random() => Zufallszahl
- partial() => Anfang und Ende sichtbar

## Spickzettel
- DDM: default, email, random, partial; UNMASK
- Maskiert nur die Anzeige, keine Verschlüsselung
- TDE, Always Encrypted, RLS, Auditing, Firewall, Entra ID, SAS
