---
id: ap1-uebung-hw-win
bereich: Prüfung
block: A13
kapitel: AP1-Aufgaben
titel: AP1-Übungen: Hardware, Strom, RAID, Backup, Windows-Rechte (eigene Aufgaben mit Lösung)
stufe: Fortgeschritten
typ: uebung
quellen: [Eigene Übungsaufgaben im AP1-Stil, alle Lösungen nachgerechnet]
verweise: [ap1-a2-raid, ap1-a2-usv, ap1-a2-backup, ap1-a6-ntfs, ap1-a6-freigaben, ap1-a6-gruppen]
---

## Profi

**Hinweis:** Eigene Übungsaufgaben im Stil der AP1, keine Original-Prüfungsaufgaben.

### Formelsammlung
| Thema | Formel/Regel |
|---|---|
| RAID 0 / 1 / 5 / 6 / 10 (n Platten à C) | n·C / C / (n−1)·C / (n−2)·C / n·C ÷ 2 |
| Ausfalltoleranz | RAID 0: keine, RAID 1: n−1, RAID 5: 1, RAID 6: 2, RAID 10: je Spiegelpaar 1 |
| Scheinleistung USV | **S (VA) = P (W) ÷ cos φ** |
| Wirkungsgrad | **η = P_ab ÷ P_auf**, also **P_auf = P_ab ÷ η** |
| Backup Wiederherstellung | **Voll + Differenz(letzte)** bzw. **Voll + alle Inkremente** |
| Effektives Recht Freigabe + NTFS | **Restriktivste** Kombination |
| Gruppenprinzip | **AGDLP** |
| GPO-Reihenfolge | **LSDOU**, letzte gewinnt |

## Einfach

**RAID** ist wie **mehrere Schulhefte**: RAID 0 schreibt jede zweite Seite in ein anderes Heft (schnell, aber ein Heft weg = alles weg). RAID 1 schreibt **alles doppelt** (sicher, aber halber Platz). RAID 5 ist ein **Kompromiss** mit einem **Sicherheitsheft**. Bei einer **USV** rechnest du nicht nur Watt, sondern **VA**, weil Geräte nicht perfekt ausgelastet sind. Bei **Rechten** gilt: **die strengere Tür gewinnt**. Wenn die Freigabe „Ändern“ erlaubt, aber NTFS nur „Lesen“, dann gilt **Lesen**.

## Merksatz
- **RAID 5: (n−1)·C, eine Platte darf ausfallen.**
- **RAID 6: (n−2)·C, zwei Platten dürfen ausfallen.**
- **RAID 10: halbe Kapazität, schnell und sicher.**
- **VA = W ÷ cos φ.**
- **Effektives Recht = restriktivste Kombination.**
- **Differenziell = Voll + letzte Differenz; inkrementell = Voll + alle Inkremente.**

## Prüfungsfalle
- **RAID ist kein Backup.**
- **cos φ** berücksichtigen: USV in **VA**, nicht nur in Watt.
- **Explizites Verweigern (Deny)** schlägt **Erlauben** in NTFS.
- **Freigabe- und NTFS-Rechte** gelten **beide**; die **restriktivere** gewinnt.
- Beim **inkrementellen** Backup **jedes** Inkrement bis zum Zieltag zurückspielen.

## Grafik
### RAID-Regler
Platten-Symbole (2 bis 8) und Auswahl RAID 0/1/5/6/10; die nutzbare Kapazität und die zulässigen Ausfälle werden live berechnet, ein Klick auf „Platte ausfallen“ zeigt, ob das Array überlebt.

### Rechte-Waage
Zwei Waagschalen (Freigabe, NTFS); die niedrigere bestimmt das effektive Recht.

## Übungen
- A: Nutzbare Kapazität von RAID 5 mit 4 × 2 TB? | L: (4 − 1) · 2 TB = 6 TB.
- A: Nutzbare Kapazität von RAID 1 mit 2 × 4 TB und RAID 10 mit 4 × 2 TB? | L: RAID 1: 4 TB; RAID 10: 4 · 2 TB ÷ 2 = 4 TB.
- A: Nutzbare Kapazität von RAID 6 mit 6 × 4 TB, wie viele Platten dürfen ausfallen? | L: (6 − 2) · 4 TB = 16 TB; zwei Platten.
- A: Ein Server (450 W) und ein Switch (50 W) hängen an einer USV. Leistungsfaktor cos φ = 0,8, 20 % Reserve. Welche Mindestscheinleistung? | L: P = 500 W; S = 500 ÷ 0,8 = 625 VA; mit 20 % Reserve 625 · 1,2 = 750 VA.
- A: Ein Netzteil liefert 300 W bei 80 % Wirkungsgrad. Welche Leistung nimmt es auf, welche Verlustleistung entsteht? | L: P_auf = 300 ÷ 0,8 = 375 W; Verlust 375 − 300 = 75 W.
- A: Nenne die PoE-Standards mit ihrer maximalen Leistung am Port. | L: 802.3af (PoE) 15,4 W; 802.3at (PoE+) 30 W; 802.3bt (PoE++) bis 60 W (Typ 3) bzw. 90 W (Typ 4).
- A: Sonntag Vollsicherung (200 GB), danach täglich +10 GB neue Daten. Welche Sicherungen braucht die Wiederherstellung am Mittwoch bei differenzieller und bei inkrementeller Sicherung? | L: Differenziell: Voll (So) + Differenz vom Mittwoch (30 GB). Inkrementell: Voll (So) + Mo + Di + Mi (je 10 GB).
- A: Nenne die 3-2-1-Regel. | L: 3 Kopien der Daten, auf 2 verschiedenen Medien, davon 1 an einem anderen Ort (Offsite/Offline).
- A: Auf der Freigabe hat die Gruppe „Vertrieb“ Ändern, im NTFS nur Lesen. Welches Recht gilt bei Zugriff über das Netzwerk? | L: Lesen (restriktivste Kombination).
- A: Anna ist in einer Gruppe mit NTFS „Ändern“ und in einer zweiten mit explizitem „Verweigern“ für Schreiben. Kann sie schreiben? | L: Nein, explizites Verweigern hat Vorrang vor Erlauben.
- A: Ordne nach AGDLP: Konten, globale Gruppen, domänenlokale Gruppen, Berechtigungen. | L: Konten (A) → globale Gruppen (G) → domänenlokale Gruppen (DL) → Berechtigungen (P).
- A: In welcher Reihenfolge werden GPOs angewendet, und welche gewinnt? | L: Lokal, Standort, Domäne, OU (LSDOU); die zuletzt angewendete (OU) gewinnt bei Konflikten; „Erzwungen“ überstimmt Vererbungsblockierung.
- A: Wie viele Bit hat ein Byte, und wie viele Byte hat ein KiB? | L: 8 Bit; 1 KiB = 1024 Byte.
- A: Ein Laptop hat UEFI, GPT und TPM 2.0. Warum ist das für Windows 11 wichtig? | L: Windows 11 verlangt UEFI mit Secure Boot und TPM 2.0; GPT ist Voraussetzung für den UEFI-Start von Windows.

## Quiz
? Welche Kapazität hat RAID 5 mit 5 × 2 TB?
* 8 TB
- 10 TB
- 6 TB
- 4 TB

? Welche Mindestscheinleistung braucht eine Last von 400 W bei cos φ = 0,8?
* 500 VA
- 320 VA
- 400 VA
- 480 VA

? Welches effektive Recht gilt bei Freigabe „Vollzugriff“ und NTFS „Lesen“?
* Lesen
- Vollzugriff
- Ändern
- Kein Zugriff

? Was benötigt die Wiederherstellung bei inkrementeller Sicherung am Mittwoch?
* Vollsicherung plus Mo, Di, Mi
- Nur die Vollsicherung
- Vollsicherung plus Mittwoch
- Nur Mittwoch

? Wofür steht das „L“ in AGDLP?
* Local (domänenlokale Gruppe)
- Lizenz
- Logon
- Löschen
