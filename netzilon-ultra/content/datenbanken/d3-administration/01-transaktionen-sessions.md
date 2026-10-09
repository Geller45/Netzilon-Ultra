---
id: db-transaktionen
bereich: Datenbanken
pruefungen: [Schule, AP2]
fach: SQL / Datenbanken
block: D3
kapitel: Administration
titel: Transaktionen, ACID, Sperren und Session-Administration (SQL Server)
stufe: Profi
quellen: [arbeitsauftrag_sessions.pdf, backup_restore.pdf]
verweise: [db-dml, db-backup-restore, db-einfuehrung]
---

## Profi

### Transaktion und ACID
Eine **Transaktion** ist eine Folge von Operationen, die als **logische Einheit** entweder ganz oder gar nicht ausgeführt wird. Eigenschaften (**ACID**):
- **A**tomicity (Atomarität): alles oder nichts
- **C**onsistency (Konsistenz): Übergang von einem konsistenten Zustand in den nächsten (Constraints bleiben gültig)
- **I**solation: parallele Transaktionen beeinflussen sich nicht (Isolationsebenen)
- **D**urability (Dauerhaftigkeit): nach COMMIT bleibt das Ergebnis erhalten (Transaktionsprotokoll)
```
BEGIN TRANSACTION;
  UPDATE Konto SET Stand = Stand - 100 WHERE KontoID = 1;
  UPDATE Konto SET Stand = Stand + 100 WHERE KontoID = 2;
COMMIT TRANSACTION;     -- oder ROLLBACK TRANSACTION;
```
SQL Server nutzt standardmäßig **Autocommit** (jede Einzelanweisung ist eine Transaktion). `SAVE TRANSACTION name` setzt Sicherungspunkte. Fehlerbehandlung mit `BEGIN TRY … BEGIN CATCH`, `XACT_ABORT ON`.

### Sperren und Isolation
**Shared Lock (S)** beim Lesen (mehrere gleichzeitig), **Exclusive Lock (X)** beim Schreiben (exklusiv). Ein X-Lock blockiert andere Leser/Schreiber auf derselben Ressource → **Blocking**. Gegenseitiges Warten zweier Sessions = **Deadlock** (SQL Server wählt ein Opfer, Fehler 1205). Probleme paralleler Zugriffe: **Dirty Read**, **Non-Repeatable Read**, **Phantom Read**, **Lost Update**. Isolationsebenen: READ UNCOMMITTED, **READ COMMITTED (Standard)**, REPEATABLE READ, SERIALIZABLE, SNAPSHOT.

### Session-Administration (Arbeitsauftrag)
| Aufgabe | Befehl | Aussage |
|---|---|---|
| Transaktionszustand nach Fehler | `XACT_STATE()` | 1 = aktiv & gültig, 0 = keine Transaktion, **-1 = aktiv, aber fehlerhaft: nur noch ROLLBACK** |
| Offene Transaktionen im Block | `@@TRANCOUNT` | Schachtelungstiefe |
| Eigene Session-ID | `SELECT @@SPID` | jede Verbindung hat eine SPID (für Fehleranalyse, Blocking, KILL) |
| Älteste offene Transaktion | `DBCC OPENTRAN` | SPID und Startzeit |
| Log-Auslastung | `DBCC SQLPERF(LOGSPACE)` | Größe und % belegt (hoch bei langen Transaktionen/fehlenden Log-Backups) |
| Blocking finden | `SELECT session_id, status, command, wait_type, blocking_session_id FROM sys.dm_exec_requests WHERE blocking_session_id <> 0;` | wer wartet auf wen |
| Session beenden | `KILL 57;` | automatischer **ROLLBACK** der offenen Transaktion |
| Rollback-Fortschritt | `KILL 57 WITH STATUSONLY;` | Prozent und Restdauer |
Es gibt **kein** `ROLLBACK SESSION`: Eine Transaktion gehört immer zu einer Session; Admins können nur die **Session beenden**, was das Rollback auslöst. Lange offene Transaktionen verursachen Sperren/Blocking und verhindern das Abschneiden des Logs (Logwachstum). Transaktionen daher **kurz** halten.

## Einfach

Stell dir eine **Überweisung** vor: 100 € von Konto A nach Konto B. Das sind zwei Schritte: bei A abziehen, bei B draufschlagen. Was, wenn der Strom nach Schritt 1 ausfällt? Dann sind 100 € **verschwunden**! Eine **Transaktion** ist wie ein **Paket**: Entweder passieren **beide** Schritte oder **keiner**. Mit `BEGIN TRANSACTION` öffnest du das Paket, mit `COMMIT` machst du es zu („fertig, gilt!“), mit `ROLLBACK` sagst du „Stopp, alles auf Anfang zurück!“.

Die vier Versprechen heißen **ACID**:
- **A**tomar: alles oder nichts
- **C**onsistent: danach stimmt die Welt wieder
- **I**soliert: andere sehen nicht meine halbfertige Arbeit
- **D**auerhaft: was „fertig“ ist, bleibt auch nach einem Stromausfall

**Sperren (Locks)** sind wie das **„Besetzt“-Schild an einer Toilette**: Wer schreibt, hängt ein Schild an die Zeile, damit niemand dazwischenfunkt. Wenn jemand das Schild hängen lässt (Transaktion offen, aber er ist in der Mittagspause), müssen alle anderen **warten** – das nennt man **Blocking**. Als Admin findest du heraus, **wer** blockiert (`blocking_session_id`), und kannst dessen Verbindung (Session) mit `KILL` kappen. Dabei wird das, was er angefangen hat, automatisch **zurückgerollt**. Einzelne Transaktionen kann man nicht direkt abbrechen, nur die ganze Verbindung.

## Merksatz
- **ACID: Atomar – Konsistent – Isoliert – Dauerhaft.**
- **COMMIT = festschreiben, ROLLBACK = zurück.**
- **Blocking: Wer hält den Lock? (blocking_session_id) → KILL.**
- **XACT_STATE = -1 → nur ROLLBACK.**
- Transaktionen **kurz** halten!

## Prüfungsfalle
- KILL beendet die **Session**, nicht „die Transaktion“; Rollback erfolgt automatisch und kann lange dauern.
- Deadlock ≠ Blocking: Deadlock ist zyklisches Warten, Blocking einseitiges Warten.
- Standard-Isolationsebene ist **READ COMMITTED**.
- Eine offene Transaktion verhindert das Abschneiden des Logs (Wachstum der Logdatei).
- Autocommit: ohne BEGIN TRAN ist jede Anweisung schon festgeschrieben.
- Nach `XACT_STATE() = -1` ist COMMIT nicht mehr möglich.

## Grafik
### Blocking entsteht
1. Session A -> Tabelle Konto: BEGIN TRAN, UPDATE KontoID 1 (X-Lock)
2. Session A: bleibt offen, kein COMMIT
3. Session B -> Tabelle Konto: SELECT/UPDATE KontoID 1
4. Tabelle Konto: Session B muss warten (Blocking)
5. Admin -> Session A: KILL 57
6. Session A: ROLLBACK, Lock frei, Session B läuft weiter
### Transaktion
1. Client -> SQL-Server: BEGIN TRAN
2. Client -> SQL-Server: UPDATE Konto 1 (-100)
3. Client -> SQL-Server: UPDATE Konto 2 (+100)
4. Client -> SQL-Server: COMMIT
5. SQL-Server: schreibt Protokoll, Änderung dauerhaft

## Lab
### SQL
Maschine: SQL-Server-VM (SSMS), zwei Abfragefenster A und B. Tabelle dbo.Konto(KontoID, Kontostand).
```
-- Fenster A
BEGIN TRANSACTION; UPDATE dbo.Konto SET Kontostand = Kontostand + 1 WHERE KontoID = 1; WAITFOR DELAY '00:01:00';
-- Fenster B (wartet!)
SELECT * FROM dbo.Konto WHERE KontoID = 1;
-- Fenster C
SELECT session_id, status, command, wait_type, blocking_session_id FROM sys.dm_exec_requests;
DBCC OPENTRAN;  DBCC SQLPERF(LOGSPACE);
KILL 57;  KILL 57 WITH STATUSONLY;
```

## Befehle
- `BEGIN TRAN / COMMIT / ROLLBACK` – Transaktion
- `SELECT @@SPID` – eigene Session-ID
- `SELECT XACT_STATE()` – Transaktionsstatus
- `DBCC OPENTRAN` – älteste offene Transaktion
- `DBCC SQLPERF(LOGSPACE)` – Log-Auslastung
- `KILL <spid>` – Session beenden
- `sys.dm_exec_requests` – laufende Anfragen, Blocking

## Übungen
- A: Was bedeutet XACT_STATE() = -1? | L: Transaktion ist aktiv, aber beschädigt; sie darf nur noch per ROLLBACK beendet werden.
- A: Wie finden Sie die blockierende Session? | L: sys.dm_exec_requests mit WHERE blocking_session_id <> 0; blocking_session_id nennt den Verursacher.
- A: Warum kann der Admin eine Transaktion nicht direkt zurückrollen? | L: Transaktionen gehören immer zu einer Session; es gibt nur KILL der Session, was automatisch ROLLBACK auslöst.
- A: Warum soll man Transaktionen kurz halten? | L: Lange Transaktionen halten Locks (Blocking), verhindern Log-Abschneiden, verlängern Rollback.
- A: Wozu dient KILL … WITH STATUSONLY? | L: Zeigt Fortschritt in Prozent und geschätzte Restdauer eines Rollbacks.
- A: Was sind Shared und Exclusive Lock? | L: Shared beim Lesen (mehrere parallel), Exclusive beim Schreiben (exklusiv, blockiert andere).

## Karteikarten
- F: Was bedeutet ACID? | A: Atomicity, Consistency, Isolation, Durability.
- F: Was macht COMMIT? | A: Schreibt die Transaktion dauerhaft fest.
- F: Was macht ROLLBACK? | A: Macht alle Änderungen der Transaktion rückgängig.
- F: Was ist Autocommit? | A: Jede Einzelanweisung ist automatisch eine eigene festgeschriebene Transaktion.
- F: Was ist Blocking? | A: Eine Session wartet auf Sperren einer anderen Session.
- F: Was ist ein Deadlock? | A: Zwei Sessions warten gegenseitig aufeinander; SQL Server bricht eine ab (Opfer).
- F: Standard-Isolationsebene? | A: READ COMMITTED.
- F: Was ist eine SPID? | A: Session-ID einer Verbindung (@@SPID).
- F: Was bewirkt KILL 57? | A: Beendet Session 57; offene Transaktion wird zurückgerollt.
- F: Was zeigt DBCC OPENTRAN? | A: Älteste offene Transaktion mit SPID und Startzeit.
- F: Was zeigt DBCC SQLPERF(LOGSPACE)? | A: Größe und Auslastung der Transaktionsprotokolle.

## Quiz
? Was bedeutet das A in ACID?
* Atomarität (alles oder nichts)
- Aktualität
- Administration
- Autorisierung

? Wie beendet ein Admin eine blockierende Transaktion?
* KILL der Session
- ROLLBACK SESSION
- COMMIT SESSION
- DROP TRANSACTION

? Was bedeutet XACT_STATE() = -1?
* Transaktion aktiv, aber nur noch ROLLBACK möglich
- Keine Transaktion
- Transaktion gültig
- Transaktion committed

? Welche Sperre setzt ein UPDATE?
* Exclusive Lock
- Shared Lock
- Kein Lock
- Schema Lock

? Welche Isolationsebene ist Standard in SQL Server?
* READ COMMITTED
- SERIALIZABLE
- READ UNCOMMITTED
- SNAPSHOT

? Welcher Befehl zeigt die älteste offene Transaktion?
* DBCC OPENTRAN
- DBCC CHECKDB
- SELECT @@SPID
- KILL

? Was verursacht oft starkes Logwachstum?
* Lange offene Transaktionen oder fehlende Log-Backups
- Zu viele SELECTs
- Zu kleine Tabellen
- Fehlende Indizes

? Was passiert bei KILL einer Session mit offener Transaktion?
* Automatisches Rollback
- Automatisches Commit
- Nichts
- Die Transaktion läuft in einer anderen Session weiter

## Lücken
- Mit {COMMIT} schreibt man eine Transaktion fest, mit {ROLLBACK} macht man sie rückgängig.
- Die Session-ID einer Verbindung nennt man {SPID}.

## Zuordnen
### Begriff und Bedeutung
- Atomicity => alles oder nichts
- Isolation => parallele Transaktionen stören sich nicht
- Durability => nach COMMIT dauerhaft
- Blocking => Warten auf fremden Lock
- Deadlock => zyklisches Warten

## Spickzettel
- ACID; COMMIT / ROLLBACK; Autocommit
- Locks: S (lesen), X (schreiben); Blocking vs. Deadlock
- @@SPID, DBCC OPENTRAN, DBCC SQLPERF(LOGSPACE), KILL
- XACT_STATE -1 → nur ROLLBACK
