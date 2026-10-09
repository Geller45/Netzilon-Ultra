---
id: ap1-a3-logik
bereich: AP1
block: A3
kapitel: Zahlen & Logik
titel: Boolesche Logik & Wahrheitstabellen
stufe: Einsteiger
quellen: [03-2-uebung-Zahlensysteme2.pdf]
verweise: [ap1-a3-zahlensysteme, ap1-a4-subnetting, ap1-a2-raid]
---

## Profi

### Grundlagen
Die **Boolesche Algebra** (George Boole, 1847) kennt nur zwei Werte: **wahr (W, 1)** und **falsch (F, 0)**. Sie ist die Grundlage digitaler Schaltungen (Logikgatter) und jeder CPU (ALU). In der IT begegnet sie uns bei Subnetzmasken, Berechtigungen, Suchfiltern, Programmierung (if-Bedingungen) und RAID-Parität.

### Die Grundverknüpfungen
| Verknüpfung | Symbol/Schreibweise | Ergebnis ist 1, wenn … |
|---|---|---|
| **UND (AND)** | A ∧ B, A · B, `&` | **beide** Eingänge 1 sind |
| **ODER (OR)** | A ∨ B, A + B, `\|` | **mindestens einer** 1 ist |
| **NICHT (NOT)** | ¬A, Ā, `~`, `!` | der Eingang 0 ist (Umkehrung) |
| **XOR (exklusives ODER)** | A ⊕ B, `^` | die Eingänge **verschieden** sind |
| NAND | ¬(A ∧ B) | nicht beide 1 sind |
| NOR | ¬(A ∨ B) | beide 0 sind |
| XNOR | ¬(A ⊕ B) | die Eingänge **gleich** sind |

### Wahrheitstabellen (W/F-Schreibweise aus der Übung)
**UND**
| UND | W | F |
|---|---|---|
| **W** | W | F |
| **F** | F | F |

**ODER**
| ODER | W | F |
|---|---|---|
| **W** | W | W |
| **F** | W | F |

**XOR**
| XOR | W | F |
|---|---|---|
| **W** | F | W |
| **F** | W | F |

### Vollständige Tabelle (0/1)
| A | B | AND | OR | XOR | NAND | NOR | XNOR |
|---|---|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 | 1 | 1 | 1 |
| 0 | 1 | 0 | 1 | 1 | 1 | 0 | 0 |
| 1 | 0 | 0 | 1 | 1 | 1 | 0 | 0 |
| 1 | 1 | 1 | 1 | 0 | 0 | 0 | 1 |

Mit n Eingängen hat eine Wahrheitstabelle **2ⁿ Zeilen**.

### Bitweise Verknüpfung
Bei Binärzahlen wird **jede Stelle einzeln** (Spalte für Spalte) verknüpft – **ohne Übertrag**.
```
    1001 1100
UND 0101 0011
    ---------
    0001 0000
```

### Anwendungen in der IT
| Anwendung | Verknüpfung | Beispiel |
|---|---|---|
| **Netzadresse ermitteln** | IP **AND** Subnetzmaske | 192.168.10.77 AND 255.255.255.192 = 192.168.10.64 |
| **Broadcast ermitteln** | Netzadresse **OR** invertierte Maske (Wildcard) | 192.168.10.64 OR 0.0.0.63 = 192.168.10.127 |
| Wildcard-Maske (Cisco-ACL) | **NOT** Subnetzmaske | NOT 255.255.255.0 = 0.0.0.255 |
| **RAID-5-Parität** | **XOR** | Daten wiederherstellen |
| Einfache Verschlüsselung/Prüfsummen | XOR | One-Time-Pad, CRC-Teilschritte |
| Bits gezielt löschen / setzen / umschalten | AND mit 0 / OR mit 1 / XOR mit 1 | Flags, Berechtigungsmasken (Linux umask) |
| Suchfilter | AND/OR/NOT | `Get-ADUser -Filter {Enabled -eq $true -and Department -eq "IT"}` |
| Berechtigungen (Windows) | effektive NTFS-Rechte = OR der Gruppenrechte, Verweigern hat Vorrang | |

### Rechenregeln (Auswahl)
- **De Morgan**: ¬(A ∧ B) = ¬A ∨ ¬B · ¬(A ∨ B) = ¬A ∧ ¬B
- A ∧ 0 = 0 · A ∨ 1 = 1 · A ⊕ A = 0 · A ⊕ 0 = A · ¬¬A = A
- NAND und NOR sind **universell**: Mit ihnen allein lässt sich jede andere Verknüpfung bauen.

## Übungen
- A: 1001 1100 UND 0101 0011 | L: 0001 0000
- A: 0110 1011 UND 1011 1001 | L: 0010 1001
- A: 1001 1100 ODER 0101 0011 | L: 1101 1111
- A: 0110 1011 ODER 1011 1001 | L: 1111 1011
- A: 1001 1100 XOR 0101 0011 | L: 1100 1111
- A: 0110 1011 XOR 1011 1001 | L: 1101 0010
- A: Wahrheitstabelle UND (W/F) | L: W∧W = W, sonst F
- A: Wahrheitstabelle ODER (W/F) | L: F∨F = F, sonst W
- A: Wahrheitstabelle XOR (W/F) | L: W bei ungleichen Eingängen (W/F, F/W), sonst F
- A: 192.168.10.77 AND 255.255.255.192 | L: letztes Oktett 0100 1101 AND 1100 0000 = 0100 0000 → 192.168.10.64

## Einfach

Logik ist wie ein **Türsteher mit Regeln**. Er schaut sich zwei Dinge an (A und B) und entscheidet: **Rein (1)** oder **nicht rein (0)**.

- **UND**: „Du kommst nur rein, wenn du **ein Ticket UND einen Ausweis** hast.“ Fehlt eins → draußen. → Nur **1 und 1** ergibt 1.
- **ODER**: „Du kommst rein, wenn du **ein Ticket ODER einen Ausweis** hast – eins reicht, beides ist auch okay.“ → Nur **0 und 0** ergibt 0.
- **NICHT**: Der Türsteher macht **genau das Gegenteil**: Aus Ja wird Nein und aus Nein wird Ja.
- **XOR** (entweder–oder): „Du kommst rein, wenn du **entweder** Mütze **oder** Schal trägst – aber **nicht beides**!“ → 1, wenn A und B **verschieden** sind.

**Mit ganzen Binärzahlen** macht man das einfach **Spalte für Spalte**, wie bei einem Kreuzworträtsel. Kein Übertrag, kein Merken – jede Spalte für sich.

**Wozu brauche ich das als Admin?** Ganz wichtig beim **Subnetting**! Die Netzadresse bekommst du, indem du die IP-Adresse **UND** die Subnetzmaske verknüpfst. Die Maske ist wie eine **Schablone**: Wo in der Maske eine 1 steht, bleibt die IP-Adresse sichtbar, wo eine 0 steht, wird sie abgedeckt (0). Übrig bleibt das „Netz“.

Und bei **RAID 5** wird XOR benutzt, um verlorene Daten zurückzurechnen – weil XOR sich „rückgängig machen“ lässt: A XOR B XOR B = A.

## Merksatz
- **UND** = alle müssen, **ODER** = einer reicht, **XOR** = genau einer.
- IP **AND** Maske = **Netzadresse**.
- XOR mit sich selbst = **0**.
- **De Morgan**: Klammer auflösen → Verknüpfung umdrehen, alles negieren.
- Bitweise = **Spalte für Spalte, ohne Übertrag**.

## Prüfungsfalle
- ODER (inklusiv) und XOR (exklusiv) verwechselt: 1 OR 1 = 1, aber 1 XOR 1 = 0.
- Bei bitweiser Verknüpfung versehentlich wie bei der Addition Überträge gebildet.
- Netzadresse mit OR statt AND berechnet.
- Tabellen in W/F-Schreibweise: Zeilen und Spalten sauber lesen.

## Grafik
### Türsteher-Spiel
Zwei Schalter A und B, darunter eine Tür mit Türsteher; Umschalter AND/OR/XOR/NAND/NOR; die Tür öffnet sich bei Ergebnis 1, eine Lampe leuchtet; die Wahrheitstabelle markiert die aktuelle Zeile.

### Logikgatter-Schaltplan
Klassische Gattersymbole (DIN/ANSI) mit fließendem „Strom“ (gelb = 1) durch die Leitungen.

### Masken-Schablone
IP-Adresse in Bits, darüber schiebt sich die Subnetzmaske als Schablone; Bits unter Nullen werden grau → Netzadresse bleibt.

## Karteikarten
- F: Wann ist A UND B wahr? | A: Nur wenn beide wahr sind.
- F: Wann ist A ODER B falsch? | A: Nur wenn beide falsch sind.
- F: Wann ist A XOR B wahr? | A: Wenn A und B verschieden sind.
- F: 1100 AND 1010? | A: 1000.
- F: 1100 OR 1010? | A: 1110.
- F: 1100 XOR 1010? | A: 0110.
- F: Wie ermittelt man die Netzadresse? | A: IP-Adresse bitweise AND Subnetzmaske.
- F: Wie viele Zeilen hat eine Wahrheitstabelle mit 3 Eingängen? | A: 2³ = 8.
- F: Regel von De Morgan? | A: ¬(A ∧ B) = ¬A ∨ ¬B und ¬(A ∨ B) = ¬A ∧ ¬B.
- F: Welche Verknüpfung nutzt RAID 5 für die Parität? | A: XOR.

## Quiz
? Was ergibt 1011 0110 UND 1111 0000?
* 1011 0000
- 1111 0110
- 0100 0110
- 0000 0110

? Welche Verknüpfung liefert bei den Eingängen 1 und 1 das Ergebnis 0?
* XOR
- OR
- AND
- XNOR

? Netzadresse von 10.0.5.200 mit Maske 255.255.255.128?
* 10.0.5.128
- 10.0.5.0
- 10.0.5.200
- 10.0.5.255

? Was ergibt 0110 XOR 0110?
* 0000
- 0110
- 1111
- 1100

? Welche Aussage gilt nach De Morgan?
* NICHT(A UND B) = (NICHT A) ODER (NICHT B)
- NICHT(A UND B) = (NICHT A) UND (NICHT B)
- NICHT(A ODER B) = A UND B
- A XOR B = A UND B
