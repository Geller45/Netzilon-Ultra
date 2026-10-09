---
id: ap2-skripte-sql
bereich: AP2
block: A11
kapitel: Skripte und Datenbanken
titel: Skripte (PowerShell/Bash), Pseudocode, Struktogramm und SQL
stufe: Fortgeschritten
quellen: [IHK-Prüfungskatalog, DIN 66261]
verweise: [ap2-linux, ap2-itil-monitoring]
---

## Profi

### Kontrollstrukturen
**Sequenz**, **Verzweigung** (if/else, switch/case), **Schleife** (**kopfgesteuert** while/for – evtl. 0 Durchläufe; **fußgesteuert** do-while – min. 1 Durchlauf), **Funktion/Unterprogramm**.

### Pseudocode (IHK-Stil)
```
FUNKTION pruefeSpeicher(prozent)
  WENN prozent >= 90 DANN
    AUSGABE "Kritisch"
  SONST WENN prozent >= 75 DANN
    AUSGABE "Warnung"
  SONST
    AUSGABE "OK"
  ENDE WENN
ENDE FUNKTION

summe ← 0
FÜR i ← 1 BIS 10
  summe ← summe + i
ENDE FÜR
AUSGABE summe      // 55
```

### Struktogramm (Nassi-Shneiderman) / PAP
**Struktogramm**: Blöcke für **Anweisung**, **Verzweigung** (Dreieck mit Ja/Nein), **Schleife** (L-förmig). **PAP** (Programmablaufplan, DIN 66001): **Oval** Start/Ende, **Rechteck** Anweisung, **Raute** Verzweigung, **Parallelogramm** Ein-/Ausgabe.

### PowerShell (Windows)
```powershell
# Alle gestoppten automatischen Dienste starten
Get-Service | Where-Object { $_.StartType -eq 'Automatic' -and $_.Status -ne 'Running' } | Start-Service

# Benutzer aus CSV anlegen
Import-Csv C:\benutzer.csv -Delimiter ';' | ForEach-Object {
  New-ADUser -Name $_.Name -SamAccountName $_.Login -Department $_.Abteilung `
    -AccountPassword (ConvertTo-SecureString $_.Passwort -AsPlainText -Force) -Enabled $true
}

# Freier Speicher unter 10 %
Get-Volume | Where-Object { $_.SizeRemaining / $_.Size -lt 0.1 } |
  Select-Object DriveLetter, @{n='FreiGB';e={[math]::Round($_.SizeRemaining/1GB,1)}}

# Schleifen / Bedingungen
foreach ($pc in Get-Content C:\pcs.txt) {
  if (Test-Connection $pc -Count 1 -Quiet) { "$pc online" } else { "$pc offline" }
}
```
**Verb-Nomen**, **Pipeline mit Objekten**, `$_` = aktuelles Objekt, `-eq -ne -gt -lt -like`, `Get-Help`, `Get-Member`.

### Bash (Linux)
```bash
#!/bin/bash
# Backup mit Datum
ZIEL="/backup/home_$(date +%F).tar.gz"
tar -czf "$ZIEL" /home && echo "OK: $ZIEL" || echo "Fehler" >&2

# Schleife und Bedingung
for host in 192.168.1.{1..5}; do
  if ping -c1 -W1 "$host" &>/dev/null; then echo "$host online"; else echo "$host offline"; fi
done

# Alte Logs löschen (älter als 30 Tage)
find /var/log/app -name "*.log" -mtime +30 -delete
```
**Variablen** ohne Leerzeichen (`a=5`), **Zugriff** `$a`, **Vergleich** `-eq -ne -gt -lt` (Zahlen), `==` (Text), `$?` = Rückgabecode (0 = ok), `$1` erster Parameter.

### SQL
**Relationale Datenbank**: **Tabellen**, **Primärschlüssel (PK)** eindeutig, **Fremdschlüssel (FK)** verweist auf PK. **Beziehungen 1:1, 1:n, n:m** (**n:m braucht Zwischentabelle**). **Normalisierung**: **1NF** (atomare Werte), **2NF** (volle Abhängigkeit vom ganzen Schlüssel), **3NF** (keine transitiven Abhängigkeiten).

```sql
-- DDL
CREATE TABLE Geraet (
  ID INT PRIMARY KEY,
  Name VARCHAR(50) NOT NULL,
  RaumID INT,
  Kaufdatum DATE,
  Preis DECIMAL(8,2),
  FOREIGN KEY (RaumID) REFERENCES Raum(ID)
);
ALTER TABLE Geraet ADD Seriennr VARCHAR(30);
DROP TABLE Alt;

-- DML
INSERT INTO Geraet (ID, Name, RaumID, Preis) VALUES (1, 'PC-01', 101, 899.00);
UPDATE Geraet SET RaumID = 102 WHERE ID = 1;
DELETE FROM Geraet WHERE Kaufdatum < '2020-01-01';

-- Abfragen
SELECT Name, Preis FROM Geraet WHERE Preis > 500 ORDER BY Preis DESC;
SELECT r.Bezeichnung, COUNT(g.ID) AS Anzahl, SUM(g.Preis) AS Wert
FROM Raum r LEFT JOIN Geraet g ON g.RaumID = r.ID
GROUP BY r.Bezeichnung
HAVING COUNT(g.ID) > 5;
SELECT * FROM Benutzer WHERE Name LIKE 'M%';
SELECT DISTINCT Abteilung FROM Mitarbeiter;

-- DCL
GRANT SELECT ON Geraet TO praktikant;
REVOKE SELECT ON Geraet FROM praktikant;
```
**WHERE** filtert **Zeilen vor** Gruppierung, **HAVING** filtert **Gruppen**. **INNER JOIN** = nur Treffer, **LEFT JOIN** = alle links + Treffer. **Aggregat**: COUNT, SUM, AVG, MIN, MAX.
**Reihenfolge**: SELECT – FROM – JOIN – WHERE – GROUP BY – HAVING – ORDER BY.

## Einfach
**Pseudocode** = **Kochrezept in normaler Sprache**. **Schleife** = „**Rühre, bis der Teig glatt ist**“. **SQL** = **Fragen an eine Tabelle**: „**Zeig mir alle PCs, die mehr als 500 € gekostet haben.**“ **Primärschlüssel** = **Personalausweisnummer** einer Zeile.

## Merksatz
- **Kopfgesteuert 0×, fußgesteuert min. 1×**.
- **WHERE vor Gruppen, HAVING nach Gruppen**.
- **n:m → Zwischentabelle**.
- **PS: Objekte, $_**, **Bash: Text, $?**.
- **DDL: CREATE/ALTER/DROP**, **DML: SELECT/INSERT/UPDATE/DELETE**, **DCL: GRANT/REVOKE**.

## Prüfungsfalle
- **UPDATE/DELETE ohne WHERE** → **alle Zeilen**.
- **Aggregat in WHERE** – falsch, **HAVING** nutzen.
- **Text in SQL mit einfachen Anführungszeichen**.
- **Bash**: Leerzeichen um `=` bei Zuweisung → Fehler.
- **Array-Index** beginnt meist bei **0**.
- **Endlosschleife** ohne Änderung der Bedingung.

## Grafik
### Rezeptkarte
Pseudocode als Rezept mit Schritten, Wenn-Dann-Abzweig.

### Tabellen mit Schlüsseln
Zwei Tabellen, Linie von FK zu PK.

## Übungen
- A: Alle Räume mit mehr als 10 Geräten? | L: SELECT RaumID, COUNT(*) FROM Geraet GROUP BY RaumID HAVING COUNT(*) > 10;
- A: Pseudocode: Zahlen 1–100 ausgeben, die durch 3 teilbar sind. | L: FÜR i ← 1 BIS 100: WENN i MOD 3 = 0 DANN AUSGABE i.
- A: Beziehung Mitarbeiter–Projekt (viele zu viele)? | L: Zwischentabelle Mitarbeiter_Projekt mit zwei FKs.

## Karteikarten
- F: Unterschied kopf- und fußgesteuerte Schleife? | A: Kopf prüft vorher (0 Durchläufe möglich), Fuß nachher (mind. 1).
- F: Was ist ein Primärschlüssel? | A: Eindeutiger Identifikator einer Zeile.
- F: Was ist ein Fremdschlüssel? | A: Verweis auf den Primärschlüssel einer anderen Tabelle.
- F: Wie löst man n:m? | A: Mit einer Zwischentabelle.
- F: Unterschied WHERE und HAVING? | A: WHERE filtert Zeilen, HAVING filtert Gruppen.
- F: Was liefert LEFT JOIN? | A: Alle Zeilen der linken Tabelle plus passende rechts.
- F: Was ist $_ in PowerShell? | A: Das aktuelle Objekt in der Pipeline.
- F: Was bedeutet $? in Bash? | A: Rückgabecode des letzten Befehls.
- F: Was ist 1NF? | A: Nur atomare Werte in jedem Feld.
- F: DCL-Befehle? | A: GRANT und REVOKE.

## Quiz
? Welche Klausel filtert nach COUNT(*) > 5?
* HAVING
- WHERE
- ORDER BY
- SELECT

? Welche Schleife läuft mindestens einmal?
* Fußgesteuerte
- Kopfgesteuerte
- Zählschleife mit 0 Durchläufen
- Keine

? Was passiert bei DELETE FROM Geraet; ohne WHERE?
* Alle Datensätze werden gelöscht
- Nichts
- Nur der erste Datensatz
- Die Tabelle wird umbenannt

? Welcher Befehl gehört zur DDL?
* CREATE TABLE
- SELECT
- GRANT
- INSERT

? Was ist in PowerShell $_?
* Das aktuelle Pipeline-Objekt
- Eine Umgebungsvariable
- Der Rückgabecode
- Ein Kommentar
