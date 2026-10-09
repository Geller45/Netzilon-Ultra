---
id: ihk-er-schluessel-modultest
bereich: AP2
block: IHK
kapitel: Zwischenprüfung-Ergänzungen
titel: Entitätsmenge, Schlüsselarten und Modultest (Komponententest)
stufe: Fortgeschritten
fach: SQL / Datenbanken
pruefungen: [AP1, AP2, Schule]
quellen: [Abschlussprüfung_Lernzettel.pdf, AP1_Lernzettel_1.pdf, Lernzettel_AP1AP2_2024.pdf]
verweise: [db-er-modell, ihk-softwaretests-qs]
---

## Profi

### Entitätstyp und Entitätsmenge
- **Entität**: einzelnes, eindeutig unterscheidbares Objekt (ein Kunde, ein Auftrag).
- **Entitätstyp**: Bauplan; alle Entitäten mit denselben Attributen (Kunde mit Name, Adresse).
- **Entitätsmenge**: Gesamtheit aller konkreten Entitäten eines Typs zu einem bestimmten Zeitpunkt (z. B. alle Studenten, die am ersten Tag im Kurs eingeschrieben sind). In der Praxis wird die Tabelle als Entitätsmenge, die Zeile als Entität verstanden.
- **Entitätskategorien**: **stark** (existiert unabhängig), **schwach** (abhängig von einer starken Entität, z. B. Rechnungsposition von Rechnung), **assoziativ** (verbindet Entitäten, löst n:m auf).

### Schlüsselarten
1. **Superschlüssel**: Menge von Attributen (ein oder mehrere), die eine Entität in der Entitätsmenge eindeutig bestimmt, auch mit überflüssigen Attributen.
2. **Schlüsselkandidat (Candidate Key)**: **minimaler** Superschlüssel; kein Attribut kann entfallen, ohne die Eindeutigkeit zu verlieren. Eine Entitätsmenge kann mehrere haben.
3. **Primärschlüssel (Primary Key)**: der vom Datenbankdesigner gewählte Schlüsselkandidat (eindeutig, nie NULL, unveränderlich).
4. **Fremdschlüssel (Foreign Key)**: Attribut, das auf den Primärschlüssel einer anderen Tabelle verweist und damit die Beziehung herstellt; sichert Referenzielle Integrität.

Beispiel Kunde(KdNr, Email, Name): {KdNr}, {Email} sind Schlüsselkandidaten; {KdNr, Name} ist Superschlüssel, aber nicht minimal.

### Modultest (Unit-/Komponententest)
Softwaretest, der einzelne abgrenzbare Teile eines Programms (Methoden, Klassen, Module, Units) isoliert prüft, meist automatisiert (JUnit, xUnit, pytest) und vom Entwickler geschrieben. Abhängigkeiten werden durch Mocks/Stubs ersetzt. Er steht in der Teststufen-Pyramide ganz unten: Modultest, Integrationstest, Systemtest, Abnahmetest.

## Einfach

In einer Schulklasse ist die **Entitätsmenge** die Liste aller Kinder, die heute da sind. Jedes Kind ist eine **Entität**. Damit man Kinder nicht verwechselt, braucht jedes etwas Einmaliges: die Schülernummer. Jede Kombination, die ein Kind eindeutig findet, ist ein **Superschlüssel**, auch „Schülernummer plus Lieblingsfarbe“. Der **Schlüsselkandidat** ist die schlankste Variante: nur die Schülernummer. Der Lehrer sucht sich einen davon als **Primärschlüssel** aus. Der **Fremdschlüssel** ist wie die Klassenzimmer-Nummer auf dem Zettel des Kindes: Sie zeigt, in welche andere Liste man schauen muss.

Ein **Modultest** ist, als würdest du bei einem Auto nur die Bremse einzeln auf dem Prüfstand testen, bevor das ganze Auto fährt.

## Merksatz
- Super > Kandidat > Primär: immer enger.
- Kandidat = minimaler Superschlüssel.
- Fremdschlüssel zeigt auf einen Primärschlüssel.
- Modultest = kleinste Einheit, isoliert.

## Prüfungsfalle
- Jeder Schlüsselkandidat ist ein Superschlüssel, aber nicht umgekehrt.
- Primärschlüssel darf nie NULL sein.
- Modultest mit Integrationstest verwechseln.
- Entitätstyp (Bauplan) und Entitätsmenge (konkrete Daten) verwechseln.

## Grafik
### Schlüsselhierarchie
1. Superschlüssel: alle eindeutigen Attributmengen
2. Schlüsselkandidat: minimale unter ihnen
3. Primärschlüssel: der gewählte Kandidat
4. Fremdschlüssel: Verweis in einer anderen Tabelle

## Übungen
- A: Tabelle Person(PersNr, Email, Name). PersNr und Email sind eindeutig. Welche Schlüsselkandidaten gibt es? | L: {PersNr} und {Email}; {PersNr, Name} ist nur ein Superschlüssel
- A: Welche Teststufe prüft eine einzelne Methode isoliert? | L: Modultest (Komponententest)

## Lücken
- Ein minimaler Superschlüssel heißt {Schlüsselkandidat}.
- Ein {Fremdschlüssel} verweist auf den Primärschlüssel einer anderen Tabelle.
- Ein {Modultest} prüft einzelne Units isoliert.

## Spickzettel
- Super ⊇ Kandidat ⊇ Primär
- Primärschlüssel: eindeutig, nicht NULL
- Fremdschlüssel = Beziehung + referenzielle Integrität
- Modultest = unterste Teststufe

## Karteikarten
- F: Was ist eine Entitätsmenge? | A: Gesamtheit aller Entitäten eines Typs zu einem Zeitpunkt
- F: Was ist ein Entitätstyp? | A: Beschreibung gleichartiger Entitäten mit denselben Attributen
- F: Was ist eine schwache Entität? | A: Eine Entität, die von einer starken abhängt
- F: Was ist eine assoziative Entität? | A: Verbindet Entitäten, löst z. B. n:m-Beziehungen auf
- F: Was ist ein Superschlüssel? | A: Attributmenge, die eine Entität eindeutig bestimmt, auch nicht minimal
- F: Was ist ein Schlüsselkandidat? | A: Minimaler Superschlüssel
- F: Was ist ein Primärschlüssel? | A: Der vom Designer gewählte Schlüsselkandidat
- F: Was ist ein Fremdschlüssel? | A: Attribut, das auf den Primärschlüssel einer anderen Tabelle verweist
- F: Was ist ein Modultest? | A: Test einzelner Units, Klassen oder Methoden isoliert, auch Komponententest oder Unit-Test genannt
- F: Wie heißen die Teststufen von klein nach groß? | A: Modultest, Integrationstest, Systemtest, Abnahmetest

## Quiz
? Was ist ein Schlüsselkandidat?
* Ein minimaler Superschlüssel
- Ein Fremdschlüssel
- Jede beliebige Attributmenge
- Ein Index

? Welcher Schlüssel verweist auf eine andere Tabelle?
* Fremdschlüssel
- Primärschlüssel
- Superschlüssel
- Schlüsselkandidat

? Welche Aussage stimmt?
* Jeder Schlüsselkandidat ist ein Superschlüssel
- Jeder Superschlüssel ist ein Schlüsselkandidat
- Ein Primärschlüssel darf NULL sein
- Ein Fremdschlüssel ist immer eindeutig

? Was ist eine Entitätsmenge?
* Alle Entitäten eines Typs zu einem Zeitpunkt
- Ein einzelnes Attribut
- Eine Beziehung zwischen Tabellen
- Eine SQL-Abfrage

? Was prüft ein Modultest?
* Einzelne abgrenzbare Units isoliert
- Das Zusammenspiel aller Systeme
- Die Abnahme durch den Kunden
- Die Netzwerkgeschwindigkeit

? Welche Entität ist von einer anderen abhängig?
* Schwache Entität
- Starke Entität
- Superentität
- Freie Entität

? Wofür ist eine assoziative Entität typisch?
* Auflösen einer n:m-Beziehung
- Speichern von Passwörtern
- Verschlüsseln von Daten
- Sortieren von Tabellen

? Wer wählt den Primärschlüssel aus den Kandidaten?
* Der Datenbankdesigner
- Der Anwender zur Laufzeit
- Der Router
- Die IHK
