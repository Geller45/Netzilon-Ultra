# Status E – Vollständigkeitsprüfung

## Abdeckungsquote
- Ledger: 981 Einträge; 740 text/ocr geprüft (Skript: IDF-gewichtete Fachbegriffe Quelle vs. content, plus Stichproben pro Quelle). Dateinamen-Abgleich allein reichte nicht (viele Seiten nennen die Quelle nicht).
- Ergebnis: alle 740 inhaltlich abgedeckt (gewichtete Begriffsabdeckung meist 0,65–1,0; niedrig nur bei Büchern/RemNote/Code). Danach 5 echte Lücken geschlossen: ca. 99 %.
- dup/zip/asset/binary: Stichprobe, keine relevanten Inhalte (Icons, Obsidian-Plugins, Lizenzen, Git-Skripte).
- Server-Themen: DHCP, DNS, Hyper-V, Failover, DFS, Backup, Monitoring sind in az800/az801/netz/ap1 vorhanden (nicht nur im alten Teil). WSUS/WDS/NLB kommen in den Quellen nur am Rand vor, dort auch in Seiten erwähnt.
- FIAE v2 (Netzwerke, Speicher/Cloud, SQL): inhaltlich abgedeckt (Begriffsabdeckung 0,8+ , Stichproben ok).
- DP-203: 343 Quellfragen (Topic/Nr.), Stichprobe aller mit <60 % Treffern geprüft, ok. Nummernlücken 122,162… sind Topic-Nummerierung (wie B vermerkt).
- kaufmaennisch_80.md: alle 80 Fragen wortgleich in wiso/90-fragen-a..h (Skript, 0 fehlend). Kopf der Quelle sagt „75“, Inhalt sind 80.
- Plan-Ansicht (app/plan.js): Ausbildungsplan Feb 2026–Apr 2027 + Nov 2027 mit Fächern, Feiertagen, Ferien, Markierungen, AP1-Tag; Prüfungstermine trägt Philipp selbst ein (Countdown erst dann, Rückwärts-Lernplan). Monate Mai–Okt 2027 sind in der Vorlage nicht vorhanden („nicht im Plan“).

## Lücken und Maßnahmen (neue Dateien)
| Lücke | Quelle | Neue Datei |
|---|---|---|
| Verbundarten, Regelkreis/Steuerung, Fog/Edge | Zwischenprüfung-2022-Zusammenfassung | ihk/60-netzverbund-regelkreis-fog-edge.md |
| Neuronale Netze, Lernarten, Overfitting | AP1_Lernzettel | ihk/61-ki-neuronale-netze-lernarten.md |
| BPMN-Poster: Teilprozess, Ereignisse, Konversation, Choreographie | bpmn-2-0-poster | ihk/62-bpmn-elemente-poster.md |
| Entitätsmenge, Superschlüssel, Modultest | Abschlussprüfung_Lernzettel | ihk/63-er-schluessel-entitaetsmenge-modultest.md |
| Verbrauchsgüterkauf/Beweislastumkehr, Angebot/Nachfrage, Konsumentenrente | Zwischenprüfung-Zusammenfassung | wiso/21-verbrauchsgueterkauf-markt-angebot-nachfrage.md |

Jede Datei: Profi, Einfach, Merksatz, Falle, Grafik, Übungen, Lücken, Spickzettel, 10 Karten, 8-9 Quizfragen.
Check: check-content 532 Dateien, 6855 Karten, 0 Fehler, 0 Warnungen. build-html OK (3,03 MB), test-ui: alle Tests bestanden.

## Offen
- Konsumenten-/Produzentenrente-Grafiken der Quelle sind Bilder; Text aus Standardwissen ergänzt.
- Beweislastumkehr: Quelle nennt 6 Monate, korrekt seit 2022 sind 12 (in Datei als Falle vermerkt).
- Bücher (Essential C#, C# Pocket, Eckert, LPI) wegen Umfang nur über Kapitel-/Lernziel-Abgleich geprüft; LPI-Lernziele 101/102 vollständig.
- Veralteter Kopf „75 Fragen“ in der Quelldatei, nur kosmetisch.
