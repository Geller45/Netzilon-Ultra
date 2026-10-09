---
id: ihk-hf6-sicherheit-lernkarten-2
bereich: AP2
block: IHK
kapitel: Lernkarten Handlungsfelder
titel: Handlungsfeld 6 – Maßnahmen zur IT-Sicherheit und zum Datenschutz (Lernkarten-Katalog) (Teil 2)
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP1, AP2]
quellen: [6._Umsetzen_Integrieren_und_Prüfen_von_Maßnahmen_zur_IT-Sicherheit_und_zum_Datenschutz.pdf]
verweise: [ihk-handlungsschritte, ihk-lernzettel-guide]
---

## Profi

Handlungsfeld 6 deckt Informationssicherheit (Schutzziele, Schutzbedarfskategorien), BSI IT-Grundschutz, ISO 2700x, IT-Sicherheitsmanagement, technische, organisatorische und personelle Maßnahmen, Zugangs- und Zugriffskontrolle, Authentifizierung, Verschlüsselung, Backup, RAID/USV, Kommunikationsverbindungen (SSH/Telnet) sowie DSGVO, BDSG und personenbezogene Daten ab. Dieser Teil enthält 139 Fragen und Antworten in 7 Themenblöcken: Security by Default, Datensicherung / Backup-Verfahren, Sicherung der Verfügbarkeit / RAID / USV, Zugangs- und Zugriffskontrolle, Verschlüsselungstechniken, Authentifizierung, SSH vs. Telnet. Die Antworten sind der Originalformulierung der Lernkarten entnommen und nach Themen geordnet.

### Security by Default

- **Was bedeutet der Begriff "Security by Default"?** "Security by Default" ist ein Designkonzept, bei dem Systeme und Anwendungen von Beginn an mit den sichersten Standardeinstellungen ausgeliefert werden.
- **"Security by Default" bezieht sich auf Systeme und Anwendungen, die von Beginn an mit den ___ ausgeliefert werden.** sichersten Standardeinstellungen
- **Warum ist das Prinzip "Security by Default" wichtig?** Es erhöht die generelle Systemsicherheit, indem es die Wahrscheinlichkeit von Fehlkonfigurationen und dadurch entstehenden Sicherheitslücken reduziert.
- **Wie ist "Security by Default" in Bezug auf Datenschutzgesetze relevant?** Viele Datenschutzgesetze, wie die DSGVO, verlangen, dass Sicherheitsmaßnahmen von Anfang an in Systeme und Anwendungen integriert werden, was dem Prinzip von "Security by Default" entspricht.

### Datensicherung / Backup-Verfahren

- **Was sind lokale und externe Backups?** Lokale Backups werden auf demselben physischen Standort oder Netzwerk gespeichert, während externe Backups an einem anderen Ort (z.B. in der Cloud oder einem externen Rechenzentrum) gespeichert werden.
- **Was sind die Vorteile von Cloud-Backups?** Cloud-Backups bieten Skalierbarkeit, Kosteneffizienz, einfache Zugänglichkeit von überall und oft eine hohe Sicherheit durch Verschlüsselung und redundante Speicherung.
- **Was versteht man unter einem "Hot Backup"?** Ein Hot Backup ist eine Datensicherung, die durchgeführt wird, während das System in Betrieb ist, ohne die Systemverfügbarkeit zu beeinträchtigen.
- **Was ist ein "Cold Backup"?** Ein Cold Backup erfordert, dass das System oder die Datenbank heruntergefahren wird, um eine Konsistenz der gesicherten Daten sicherzustellen.
- **Welche Rolle spielt die Datenwiederherstellungszeit?** Die Datenwiederherstellungszeit (Recovery Time Objective, RTO) definiert, wie schnell Daten nach einem Ausfall oder einem anderen Ereignis wiederhergestellt werden müssen.
- **Was bedeutet Datensicherung?** Datensicherung bezeichnet den Prozess, Kopien von Daten zu erstellen, die zur Wiederherstellung der ursprünglichen Daten verwendet werden können, falls ein Datenverlust eintritt.
- **Warum ist Datensicherung wichtig?** Datensicherung ist wichtig, um Datenverluste durch verschiedene unvorhergesehene Faktoren wie Hardware-Ausfälle, Softwarefehler, Viren oder menschliche Fehler zu verhindern.
- **Nenne zwei mögliche Ursachen für Datenverlust.** Hardware-Ausfälle und Softwarefehler.
- **Welche Rolle spielen Viren und Hackerangriffe bei Datenverlust?** Viren und Hackerangriffe können Daten beschädigen, löschen oder stehlen, was zu Datenverlust führt.
- **Wie trägt die Datensicherung zur Datenintegrität bei?** Durch die Erstellung von Backups kann die unveränderte und vollständige Form von Daten gewährleistet werden, was zur Datenintegrität beiträgt.
- **Nenne eine Maßnahme zur Datensicherung.** Die Erstellung regelmäßiger Backups ist eine gängige Maßnahme zur Datensicherung.
- **Wie trägt Verschlüsselung zur Datensicherung bei?** Verschlüsselung sichert Daten, indem sie sie in eine Form umwandelt, die ohne einen speziellen Schlüssel nicht gelesen werden kann. Dies schützt die Daten vor unerwünschtem Zugriff.
- **Datensicherung ist wichtig, um ___ zu verhindern.** Datenverlust
- **Was ist eine Offsite-Datensicherung?** Bei der Offsite-Datensicherung werden Backups an einem geografisch getrennten Ort aufbewahrt, um die Daten vor lokalen Katastrophen zu schützen.
- **Was ist eine lokale Datensicherung?** Eine lokale Datensicherung bezeichnet das Speichern von Datenkopien an demselben physischen Ort wie die primären Daten.
- **Was ist der Unterschied zwischen einer Voll- und einer inkrementellen Sicherung?** Bei einer Vollsicherung werden alle Daten gesichert, während bei einer inkrementellen Sicherung nur die seit der letzten Sicherung geänderten oder neuen Daten gesichert werden.
- **Warum ist es wichtig, regelmäßige Backups zu erstellen?** Regelmäßige Backups stellen sicher, dass die neuesten Versionen der Daten gesichert sind und minimieren den Datenverlust im Falle eines Ausfalls.
- **Was ist RAID und wie trägt es zur Datensicherung bei?** RAID (Redundant Array of Independent Disks) ist eine Technik, die Daten über mehrere Festplatten verteilt, um die Datenverfügbarkeit und -sicherheit zu erhöhen.
- **Was ist eine Grandfather-Father-Son (GFS)-Sicherungsstrategie?** Eine GFS-Strategie ist eine Methode zur Organisation von Backups, die eine Mischung aus Voll-, Differenzial- und Inkrementalsicherungen verwendet.
- **Wie funktioniert die GFS-Strategie?** Bei der GFS-Strategie wird regelmäßig ein Vollbackup erstellt (Großvater), dazu tägliche inkrementelle (Sohn) oder wöchentliche differenzielle (Vater) Backups.
- **Was geschieht mit älteren Vollbackups?** Ältere Vollbackups werden normalerweise nach einer festgelegten Zeit oder wenn der Speicherplatz knapp wird, gelöscht oder überschrieben.
- **Warum ist es wichtig, Backups auf einem externen Medium oder in der Cloud zu speichern?** Damit die Daten im Falle eines physischen Schadens am ursprünglichen Speicherort (z.B. durch Feuer oder Wasser) geschützt sind.
- **Was ist die Datenwiederherstellungszeit?** Die Datenwiederherstellungszeit, auch bekannt als Recovery Time Objective (RTO), definiert, wie schnell Daten nach einem Ausfall oder einem anderen Ereignis wiederhergestellt werden müssen.
- **Wie unterscheidet sich die RTO (Recovery Time Objective) vom Recovery Point Objective (RPO)?** Während RTO die maximale tolerierte Ausfallzeit definiert, legt RPO den maximal tolerierten Datenverlust fest, der in Bezug auf Zeit gemessen wird.

### Sicherung der Verfügbarkeit / RAID / USV

- **Was ist ein RAID-System und warum wird es verwendet?** RAID (Redundant Array of Independent Disks) ist eine Technologie, bei der mehrere Festplatten zu einem logischen Verbund zusammengeschlossen werden, um die Datenverfügbarkeit und -leistung zu erhöhen. Es bietet Redundanz, um Ausfälle einzelner Festplatten ohne Datenverlust zu überstehen.
- **Welche RAID-Level gibt es und welche sind die gängigsten?** Es gibt verschiedene RAID-Level (z.B. RAID 0, 1, 5, 6, 10). Die gängigsten sind RAID 1 (Spiegelung), RAID 5 (mit Parität) und RAID 10 (Kombination von Spiegelung und Striping).
- **Was ist ein Storage Area Network (SAN) und welchen Vorteil bietet es?** Ein SAN ist ein dediziertes Netzwerk, das Speichergeräte mit Servern verbindet. Es ermöglicht eine hohe Datenverfügbarkeit, da es redundante Pfade zu den Speichergeräten bietet und eine zentrale Datenverwaltung ermöglicht.
- **Welche Technologien werden oft mit SANs verwendet, um die Datenverfügbarkeit zu erhöhen?** Zu den Technologien gehören Multipathing (mehrere Pfade zu einem Speichergerät), Failover (automatischer Wechsel zu einem anderen Pfad bei Ausfall) und Clustering (Gruppierung von Servern, um Ausfallzeiten zu minimieren).
- **Was ist Redundanz und warum ist sie wichtig für die Verfügbarkeit?** Redundanz bezeichnet das Vorhandensein von zusätzlichen oder alternativen Systemkomponenten, die im Falle eines Ausfalls aktiviert werden können, um die Verfügbarkeit zu gewährleisten.
- **Was ist ein Failover-System?** Ein Failover-System ist ein Backup-Betriebsmodus, in dem sekundäre Systemkomponenten aktiv werden, wenn die primären Komponenten ausfallen, um die Systemverfügbarkeit zu gewährleisten.
- **Was versteht man unter Lastausgleich (Load Balancing)?** Lastausgleich verteilt den Datenverkehr auf mehrere Server oder Netzwerkkomponenten, um die Leistung zu optimieren und Ausfallzeiten zu minimieren.
- **Was ist ein "Hot Standby"?** Ein Hot Standby bezeichnet ein redundantes und vollständig betriebsbereites System, das sofort aktiviert werden kann, wenn das primäre System ausfällt.
- **Warum ist eine regelmäßige Überwachung der Systemverfügbarkeit wichtig?** Durch kontinuierliche Überwachung können potenzielle Probleme frühzeitig erkannt und behoben werden, bevor sie zu ernsthaften Ausfällen führen.
- **Wie funktioniert Parität in RAID-Systemen, z.B. RAID 5?** Parität ist eine Methode zur Fehlerüberprüfung, bei der zusätzliche Daten generiert und gespeichert werden. Im Falle eines Laufwerksausfalls kann die Parität verwendet werden, um fehlende Daten aus den verbleibenden Laufwerken zu rekonstruieren.
- **Welche Vorteile bieten RAID-Systeme im Bezug auf Datenverfügbarkeit und -integrität?** RAID-Systeme erhöhen die Datenverfügbarkeit durch Redundanz, da sie den Betrieb auch bei einem oder mehreren Laufwerksausfällen (abhängig vom RAID-Level) fortsetzen können. Sie bieten auch Datenintegrität durch den Einsatz von Parität oder Mirroring, um Datenverlust zu verhindern.
- **Was bedeutet die Abkürzung "RAID"?** RAID steht für "Redundant Array of Independent Disks".
- **Was versteht man unter einem RAID-System?** Ein RAID-System ist eine Technologie, bei der mehrere Festplatten zu einem logischen Verbund zusammengeschlossen werden, um die Datenverfügbarkeit und -leistung zu erhöhen.
- **Warum wird ein RAID-System verwendet?** Ein RAID-System wird verwendet, um die Datenverfügbarkeit und -leistung zu erhöhen und um Ausfälle einzelner Festplatten ohne Datenverlust zu überstehen.
- **Welche Vorteile bietet ein RAID-System?** Ein RAID-System bietet erhöhte Datenverfügbarkeit, verbesserte Leistung und Redundanz zur Toleranz von Festplattenausfällen.
- **Ein RAID-System ist eine Technologie, bei der mehrere ___ zu einem logischen Verbund zusammengeschlossen werden.** Festplatten
- **Welche RAID-Level kennen Sie?** Bekannte RAID-Level sind RAID 0, RAID 1, RAID 5 und RAID 6
- **Was ist die Funktion von RAID 0?** RAID 0 teilt Daten gleichmäßig über zwei oder mehr Festplatten auf (Striping), ohne Redundanz. Es verbessert die Leistung, bietet jedoch keinen Ausfallschutz.
- **Was ist die Funktion von RAID 1?** RAID 1 spiegelt die selben Daten auf zwei oder mehr Festplatten (Mirroring). Es bietet Redundanz und somit einen Ausfallschutz.
- **Was ist die Funktion von RAID 5?** RAID 5 verteilt Paritäts- und Datenblöcke über alle Festplatten im Verbund. Es bietet sowohl verbesserte Leistung als auch Ausfallschutz.
- **Was ist die Funktion von RAID 6?** RAID 6 ist ähnlich wie RAID 5, verwendet aber zwei unabhängige Paritätsblöcke auf jeder Festplatte. Dies bietet einen erhöhten Ausfallschutz.
- **Was sind potenzielle Nachteile eines RAID-Systems?** RAID-Systeme können komplex in der Einrichtung und Verwaltung sein, und je nach RAID-Level kann ein Ausfall von zwei oder mehr Festplatten zu Datenverlust führen.
- **Was bedeutet Redundanz im IT-Kontext?** Redundanz bezeichnet das Vorhandensein von zusätzlichen oder alternativen Systemkomponenten, die im Falle eines Ausfalls aktiviert werden können.
- **Welche verschiedenen Arten von Redundanz gibt es in der IT?** Es gibt verschiedene Arten von Redundanz, zum Beispiel Hardware-Redundanz (wie doppelte Netzteil- oder Festplatten-Redundanz), Software-Redundanz (wie redundante Server oder Datenbanken) und Datenredundanz (wie RAID-Systeme oder Backups).
- **Wie wird Redundanz in einem Cloud-Umfeld umgesetzt?** In einem Cloud-Umfeld wird Redundanz oft durch die Verteilung von Daten und Anwendungen auf mehrere geografisch verteilte Rechenzentren umgesetzt. Dies kann z.B. durch Clustering oder Datenreplikation erreicht werden.
- **Wie wird Redundanz in Bezug auf Datenbanken umgesetzt?** Bei Datenbanken wird Redundanz oft durch Techniken wie Spiegelung (Mirroring), Replikation oder Clustering umgesetzt, um die Verfügbarkeit der Datenbank auch im Falle eines Ausfalls zu gewährleisten.
- **Was ist ein Storage Area Network (SAN)?** Ein Storage Area Network (SAN) ist ein dediziertes Netzwerk, das Speichergeräte mit Servern verbindet.
- **Welchen Vorteil bietet ein SAN in Bezug auf Datenverfügbarkeit?** Ein SAN ermöglicht eine hohe Datenverfügbarkeit durch redundante Pfade zu den Speichergeräten.
- **Wie hilft ein SAN bei der Datenverwaltung?** Ein SAN ermöglicht eine zentrale Datenverwaltung, indem es Speichergeräte mit Servern verbindet.
- **Welches Netzwerkmodell könnte als Alternative zu einem SAN verwendet werden?** Ein alternatives Netzwerkmodell zu einem SAN könnte ein Network Attached Storage (NAS) sein.
- **Was ist der Hauptunterschied zwischen einem SAN und einem NAS?** Während ein SAN ein dediziertes Netzwerk ist, das Server mit Speichergeräten verbindet, ist ein NAS ein einzelner Speicherserver, der direkt an das Netzwerk angeschlossen ist.
- **Welche Art von Datenverbindungen werden typischerweise in einem SAN verwendet?** In einem SAN werden typischerweise Glasfaserkabel für Datenverbindungen verwendet.
- **Welche Vorteile bietet ein SAN gegenüber direktem Speicher?** Ein SAN bietet gegenüber direktem Speicher Vorteile wie zentrale Datenverwaltung, hohe Datenverfügbarkeit und Skalierbarkeit.
- **Welche Nachteile hat ein SAN gegenüber simpleren Speicherlösungen wie direkt angebundenem Speicher oder einem NAS?** Ein SAN kann komplexer in der Einrichtung und Verwaltung sein und erfordert spezielle Hardware und Verkabelung, was zu höheren Kosten führen kann.
- **Was ist RAID Level 10?** RAID Level 10, auch bekannt als "1+0", ist eine Kombination von RAID Level 1 (Spiegelung) und RAID Level 0 (Striping).
- **Nenne zwei Protokolle, die in einem SAN verwendet werden können.** Fibre Channel und iSCSI.
- **Q: SAN steht für ____ Area Network.** Storage
- **Was ist ein HBA in Bezug auf ein SAN?** Ein HBA (Host Bus Adapter) ist eine Schnittstelle, die es einem Server ermöglicht, sich mit einem SAN zu verbinden.
- **Welches Protokoll in SAN ermöglicht eine Netzwerkverbindung über Ethernet?** Das iSCSI-Protokoll.
- **Warum benötigt RAID 0 mindestens 2 Festplatten?** Weil bei RAID 0 die Daten gleichmäßig über alle Festplatten verteilt (gestreift) werden, um die Leistung zu steigern.
- **Warum benötigt RAID 1 mindestens 2 Festplatten?** Weil bei RAID 1 die Daten auf zwei Festplatten gespiegelt werden, um eine Redundanz zu gewährleisten.
- **Warum benötigt RAID 5 mindestens 3 Festplatten?** Weil bei RAID 5 die Paritätsinformationen über alle Festplatten verteilt werden, um bei Ausfall einer Festplatte den Datenverlust zu verhindern.
- **Warum benötigt RAID 6 mindestens 4 Festplatten?** Weil bei RAID 6 zwei unabhängige Paritätsblöcke auf verschiedenen Festplatten gespeichert werden, um den Ausfall von bis zu zwei Festplatten zu überstehen.
- **Welches RAID-Level bietet die höchste Lese-/Schreibgeschwindigkeit, aber keine Redundanz?** RAID 0.
- **Welches RAID-Level bietet eine vollständige Spiegelung der Daten für hohe Redundanz?** RAID 1.
- **Welches RAID-Level bietet eine gute Balance zwischen Speichereffizienz, Performance und Datenverfügbarkeit?** RAID 5.
- **Welches RAID-Level bietet eine verbesserte Fehlertoleranz gegenüber RAID 5 durch zusätzliche Paritätsblöcke?** RAID 6.
- **Was bedeutet die Abkürzung "USV" in Bezug auf die IT?** Unterbrechungsfreie Stromversorgung.
- **Was ist eine USV in IT-Systemen?** Eine USV ist ein Gerät, das sicherstellt, dass IT-Systeme auch bei Stromausfällen oder Spannungsschwankungen weiterlaufen können.
- **Was sind die zwei Hauptaufgaben einer USV?** 1. Schutz vor Stromausfällen, 2. Schutz vor Spannungsspitzen.
- **Wie schützt eine USV vor Stromausfällen?** Eine USV hat Batterien, die bei einem Stromausfall die Stromversorgung der IT-Systeme sofort übernehmen.
- **Wie schützt eine USV vor Spannungsspitzen?** Eine USV hat Schutzschaltungen, die Spannungsspitzen abfangen und so die IT-Systeme vor Schäden bewahren.
- **Welche drei Klassen von USVs gibt es?** Offline, Line-Interactive, Online.
- **Was kennzeichnet eine Offline-USV?** Eine Offline-USV ist im Normalbetrieb nicht aktiv. Bei einem Stromausfall wird sie aktiviert und übernimmt die Stromversorgung.
- **Was kennzeichnet eine Line-Interactive-USV?** Eine Line-Interactive-USV schützt zusätzlich vor Netzschwankungen und Spannungsspitzen. Bei einem Stromausfall übernimmt sie die Stromversorgung.
- **Was kennzeichnet eine Online-USV?** Eine Online-USV erzeugt konstant künstlichen Strom und ist daher immer aktiv. Sie hält die Ausgangsspannung konstant, unabhängig von der Eingangsspannung.
- **Welche Vorteile bietet eine USV?** Eine USV schützt IT-Systeme vor Datenverlust und Hardwarebeschädigung durch Stromausfälle und Spannungsspitzen.
- **Welche Nachteile hat eine USV?** USVs können hohe Kosten verursachen und erfordern einen hohen Wartungsaufwand.
- **Für welche Geräte ist eine Line-Interactive-USV geeignet?** Eine Line-Interactive-USV ist geeignet für Server und andere Geräte, die zusätzlich vor Netzschwankungen und Spannungsspitzen geschützt werden sollen.
- **Für welche Geräte ist eine Online-USV geeignet?** Eine Online-USV ist geeignet für hochsensible Geräte wie Server, die nicht durch Spannungsspitzen oder Stromausfälle beschädigt werden dürfen.
- **Warum ist eine Online-USV besonders für hochsensible Geräte geeignet?** Weil sie konstant künstlichen Strom erzeugt und so auch bei starken Schwankungen der Eingangsspannung eine konstante Ausgangsspannung gewährleistet.

### Zugangs- und Zugriffskontrolle

- **Warum ist Zugriffskontrolle in IT-Systemen wichtig?** Zugriffskontrolle stellt sicher, dass nur autorisierte Benutzer auf bestimmte Ressourcen zugreifen können und schützt so Daten vor unberechtigtem Zugriff, Manipulation oder Diebstahl.
- **Was ist das Prinzip der minimalen Rechtevergabe?** Das Prinzip besagt, dass Benutzern nur die minimalen Zugriffsrechte gewährt werden sollten, die sie benötigen, um ihre Aufgaben auszuführen. Dies minimiert das Risiko eines Missbrauchs oder Fehlers.
- **Wie kann das Prinzip der minimalen Rechtevergabe in der Praxis umgesetzt werden?** Durch genaue Rollen- und Rechteverwaltung, bei der Benutzern auf Basis ihrer Rolle im Unternehmen oder ihrer Aufgabe spezifische Rechte zugewiesen werden.
- **Was versteht man unter Zugangskontrolle?** Unter Zugangskontrolle versteht man Methoden und Technologien, die den Zugriff auf Systeme und Daten steuern und begrenzen.
- **Was sind Beispiele für physische Zugangskontrollmethoden?** Beispiele für physische Zugangskontrollmethoden sind Türen, Schranken und Schlösser.
- **Was sind Beispiele für biometrische Zugangskontrollmethoden?** Beispiele für biometrische Zugangskontrollmethoden sind Fingerabdruck- und Gesichtserkennung.
- **Was versteht man unter einem Passwortsystem als Zugangskontrollmethode?** Ein Passwortsystem ist eine Zugangskontrollmethode, bei der ein Nutzer ein geheimes Passwort eingeben muss, um Zugang zu erhalten.
- **Was ist eine elektronische Schlüsselkarte als Zugangskontrollmethode?** Eine elektronische Schlüsselkarte ist eine Zugangskontrollmethode, bei der ein Nutzer eine spezielle Karte besitzt, die beim Scannen Zugang gewährt.
- **__ und __ sind Beispiele für biometrische Zugangskontrollmethoden.** Fingerabdruckerkennung, Gesichtserkennung
- **Warum ist die Zugangskontrolle wichtig?** Zugangskontrolle ist wichtig, um unautorisierten Zugriff auf Systeme und Daten zu verhindern und die Sicherheit zu gewährleisten.
- **In welchen Situationen werden physische Barrieren als Zugangskontrollmethoden typischerweise eingesetzt?** Physische Barrieren werden oft in Gebäuden oder Räumen eingesetzt, um den physischen Zugang zu sensiblen Bereichen zu kontrollieren.
- **Wie unterscheiden sich Zugriffskontrolle und Zugangskontrolle?** Während Zugriffskontrolle bestimmt, ob ein Nutzer auf bestimmte Daten oder Ressourcen zugreifen darf, legt die Zugangskontrolle fest, ob der Nutzer Zugang zu einem bestimmten Bereich oder System erhält.
- **Verwandte Themen Q: Welche zwei Haupttypen der Zugriffskontrolle gibt es?** Discretionary Access Control (DAC) und Mandatory Access Control (MAC).

### Verschlüsselungstechniken

- **Was ist Verschlüsselung in der IT-Sicherheit?** Verschlüsselung ist der Prozess der Umwandlung von Daten in eine Form, die ohne den entsprechenden Schlüssel nicht gelesen werden kann.
- **Was ist der Hauptzweck der Verschlüsselung in der IT-Sicherheit?** Der Hauptzweck der Verschlüsselung ist die Gewährleistung der Vertraulichkeit und Datenintegrität.
- **Warum ist Verschlüsselung wichtig für die Vertraulichkeit von Daten?** Verschlüsselung ist wichtig für die Vertraulichkeit, weil sie sicherstellt, dass nur autorisierte Personen Zugang zu den Daten haben.
- **Warum ist Verschlüsselung wichtig für die Datenintegrität?** Verschlüsselung ist wichtig für die Datenintegrität, weil sie sicherstellt, dass die Daten während der Übertragung nicht verändert wurden.
- **Was ist ein symmetrisches Verschlüsselungsverfahren?** Ein symmetrisches Verschlüsselungsverfahren ist ein Verschlüsselungsverfahren, bei dem der gleiche Schlüssel zum Ver- und Entschlüsseln verwendet wird.
- **Was ist ein asymmetrisches Verschlüsselungsverfahren?** Ein asymmetrisches Verschlüsselungsverfahren ist ein Verschlüsselungsverfahren, bei dem zwei verschiedene Schlüssel (ein öffentlicher und ein privater Schlüssel) zum Ver- und Entschlüsseln verwendet werden.
- **Was ist bei der Verschlüsselung der Unterschied zwischen dem öffentlichen und dem privaten Schlüssel?** Der öffentliche Schlüssel kann von jedem genutzt werden, um Daten zu verschlüsseln, aber nur der private Schlüssel kann sie wieder entschlüsseln.
- **Was ist ein Beispiel für ein symmetrisches Verschlüsselungsverfahren?** Ein Beispiel für ein symmetrisches Verschlüsselungsverfahren ist AES (Advanced Encryption Standard).
- **Was ist ein Beispiel für ein asymmetrisches Verschlüsselungsverfahren?** Ein Beispiel für ein asymmetrisches Verschlüsselungsverfahren ist RSA (Rivest-Shamir-Adleman).
- **Was ist eine Ende-zu-Ende-Verschlüsselung?** Eine Ende-zu-Ende-Verschlüsselung ist eine Form der Kommunikation, bei der nur die kommunizierenden Benutzer die Nachrichten entschlüsseln können.
- **Was bedeutet es, wenn eine Verschlüsselung als "gebrochen" bezeichnet wird?** Wenn eine Verschlüsselung als "gebrochen" bezeichnet wird, bedeutet das, dass ein Angreifer einen Weg gefunden hat, die verschlüsselten Daten ohne Zugang zum richtigen Schlüssel zu lesen.
- **Was ist eine Zertifikatsbehörde (CA)?** Eine Zertifikatsbehörde ist eine vertrauenswürdige Organisation, die digitale Zertifikate ausstellt und verwaltet.
- **Was bestätigt ein von einer Zertifikatsbehörde ausgestelltes Zertifikat?** Ein solches Zertifikat bestätigt die Identität des Zertifikatinhabers.
- **Welche Informationen bietet ein von einer Zertifikatsbehörde ausgestelltes Zertifikat?** Das Zertifikat bietet den öffentlichen Schlüssel des Zertifikatinhabers.
- **Eine ___ ist eine vertrauenswürdige Organisation, die digitale Zertifikate ausstellt und verwaltet.** Zertifikatsbehörde
- **Welche Rolle spielt die Zertifikatsbehörde in der Public Key Infrastruktur (PKI)?** In der PKI ist die Zertifikatsbehörde für die Ausstellung und Verwaltung von digitalen Zertifikaten verantwortlich.
- **Was ist ein digitales Zertifikat?** Ein digitales Zertifikat ist eine elektronische Datei, die die Identität des Zertifikatinhabers bestätigt und dessen öffentlichen Schlüssel enthält.
- **Was ist der öffentliche Schlüssel in einem digitalen Zertifikat?** Der öffentliche Schlüssel ist ein Teil eines Schlüsselpaars, das in asymmetrischen Verschlüsselungssystemen verwendet wird. Er wird für die Verschlüsselung oder Signaturprüfung verwendet.
- **Was ist die Rolle von Zertifikatsbehörden in der Internetsicherheit?** Zertifikatsbehörden spielen eine zentrale Rolle bei der Gewährleistung der Sicherheit im Internet, indem sie die Identität von Webseiten bestätigen und Verschlüsselung ermöglichen.
- **Wie validiert eine Zertifikatsbehörde die Identität eines Zertifikatantragstellers?** Die Zertifikatsbehörde validiert die Identität durch einen Prozess namens "Vetting", bei dem der Antragsteller verschiedene Beweise für seine Identität vorlegen muss.
- **Was ist ein selbstsigniertes Zertifikat?** Ein selbstsigniertes Zertifikat ist ein Zertifikat, das von der Entität generiert wird, die es verwendet, anstatt von einer Zertifikatsbehörde.
- **Was ist ein Zertifikatsperrlisten (CRL)?** Eine Zertifikatsperrliste ist eine Liste von digitalen Zertifikaten, die von einer Zertifikatsbehörde vor ihrem Ablaufdatum widerrufen wurden.

### Authentifizierung

- **Was bedeutet Authentifizierung im IT-Kontext?** Authentifizierung ist der Prozess der Überprüfung der Identität eines Benutzers, Systems oder einer Anwendung.
- **Wann wird eine Authentifizierung typischerweise durchgeführt?** Bevor Zugriff auf Ressourcen oder Daten gewährt wird.
- **Welche Rolle spielt Authentifizierung in der IT-Sicherheit?** Sie stellt sicher, dass nur autorisierte Benutzer oder Systeme Zugriff auf bestimmte Ressourcen oder Daten haben.
- **Was ist eine Zwei-Faktor-Authentifizierung?** Eine Authentifizierung, bei der mindestens zwei der genannten Faktoren kombiniert werden.
- **Nennen Sie ein Beispiel für eine Zwei-Faktor-Authentifizierung.** Zugang zu einem Bankkonto mittels einer Bankkarte (etwas, das man hat) und einer PIN (etwas, das man weiß).
- **Was ist im IT-Kontext der Unterschied zwischen Authentifizierung und Autorisierung?** Authentifizierung bestätigt die Identität eines Benutzers, Systems oder einer Anwendung, während Autorisierung bestimmt, welche Aktionen diese durchführen dürfen.
- **___ ist der Prozess der Überprüfung der Identität eines Benutzers, Systems oder einer Anwendung.** Authentifizierung
- **Was ist ein häufig genutztes Authentifizierungsprotokoll in Unternehmensnetzwerken?** LDAP (Lightweight Directory Access Protocol)
- **Was ist ein Single Sign-On (SSO)?** Ein Authentifizierungsverfahren, bei dem ein Benutzer mit nur einer Anmeldeaktion auf mehrere Anwendungen oder Dienste zugreifen kann.
- **Wie sind die Begriffe "Identität", "Authentifizierung" und "Autorisierung" miteinander verknüpft?** Die Identität eines Benutzers wird zuerst authentifiziert, dann werden seine Autorisierungen bestimmt, basierend auf seiner Identität und Rolle.

### SSH vs. Telnet

- **Warum sollte SSH Telnet vorgezogen werden?** SSH sollte Telnet vorgezogen werden, da es Daten während der Übertragung verschlüsselt, was die Gefahr von Man-in-the-Middle-Angriffen und das Abfangen von Daten verhindert. Telnet überträgt Daten, einschließlich Passwörter, im Klartext, was ein hohes Sicherheitsrisiko darstellt.
- **Was ist SSH?** SSH (Secure Shell) ist ein verschlüsseltes Protokoll zur sicheren Kommunikation über unsichere Netzwerke.
- **Was ist Telnet?** Telnet ist ein älteres, unverschlüsseltes Protokoll zur Kommunikation über Netzwerke.
- **Welche Hauptunterschiede gibt es zwischen SSH und Telnet bezüglich der Sicherheit?** SSH bietet Verschlüsselung, Authentifizierung und Integrität, während Telnet diese Sicherheitsfunktionen nicht bietet.
- **__ ist ein verschlüsseltes Protokoll zur sicheren Kommunikation, während __ ein unverschlüsseltes Protokoll ist.** SSH, Telnet

## Einfach

Dieses Handlungsfeld ist die Schutzzone der Firma. Du lernst drei Wünsche an jede Information: geheim bleiben, unverändert bleiben, verfügbar sein. Dann überlegst du, was alles schiefgehen kann (Diebstahl, Feuer, Viren, Fehler von Mitarbeitern) und wie man das verhindert: mit Technik (Firewall, Verschlüsselung, Backup), mit Regeln (Richtlinien, Zugangskontrolle) und mit Menschen (Schulung). Das BSI gibt Vorlagen dafür, den IT-Grundschutz. Der zweite Teil ist Datenschutz: Persönliche Daten gehören den Menschen, nicht der Firma, und die DSGVO sagt, was man damit darf. Die Karteikarten gehen jeden Baustein einzeln durch, damit du in der Prüfung nichts vergisst.

Tipp zum Lernen: Mach dir pro Themenblock eine Mini-Zusammenfassung in drei Sätzen. Wenn du einen Block mit eigenen Worten erklären kannst, ohne auf die Karte zu schauen, hast du ihn wirklich verstanden. Wiederhole schwierige Karten nach einem Tag, nach drei Tagen und nach einer Woche. Im Quiz kannst du danach prüfen, ob du die Antworten auch erkennst, wenn sie zwischen ähnlichen Formulierungen stehen. Das ist genau die Situation in der Multiple-Choice-Aufgabe der Prüfung. Bei Fragen mit „Nennen Sie“ reichen Stichworte, bei „Erläutern Sie“ brauchst du ganze Sätze mit Begründung, genau so, wie die Antworten auf den Karten formuliert sind.

## Merksatz
- Technisch, organisatorisch, personell: die drei Maßnahmenarten.
- SSH verschlüsselt, Telnet nicht.
- DSGVO schützt natürliche Personen, nicht Firmendaten.

## Prüfungsfalle
- Technische mit organisatorischen Maßnahmen verwechseln.
- RAID als Backup bezeichnen.
- Personenbezogene Daten nur auf Namen beschränken (auch IP-Adresse, Kennzeichen, Kundennummer zählen).
- Lernkarten sind knapp formuliert; in der Prüfung verlangen Operatoren wie „Erläutern“ ganze Sätze mit Begründung.

## Grafik
### Lernen mit dem Karteikasten
1. Lernender: zieht eine Karte und liest die Frage
2. Lernender -> Gedächtnis: antwortet laut
3. Lernender -> Karte: deckt die Antwort auf
4. Karte: richtig, dann ins nächste Fach
5. Karte: falsch, dann zurück ins erste Fach

## Karteikarten
- F: Was bedeutet der Begriff "Security by Default"? | A: "Security by Default" ist ein Designkonzept, bei dem Systeme und Anwendungen von Beginn an mit den sichersten Standardeinstellungen ausgeliefert werden.
- F: "Security by Default" bezieht sich auf Systeme und Anwendungen, die von Beginn an mit den ___ ausgeliefert werden. | A: sichersten Standardeinstellungen
- F: Warum ist das Prinzip "Security by Default" wichtig? | A: Es erhöht die generelle Systemsicherheit, indem es die Wahrscheinlichkeit von Fehlkonfigurationen und dadurch entstehenden Sicherheitslücken reduziert.
- F: Wie ist "Security by Default" in Bezug auf Datenschutzgesetze relevant? | A: Viele Datenschutzgesetze, wie die DSGVO, verlangen, dass Sicherheitsmaßnahmen von Anfang an in Systeme und Anwendungen integriert werden, was dem Prinzip von "Security by Default" entspricht.
- F: Was sind lokale und externe Backups? | A: Lokale Backups werden auf demselben physischen Standort oder Netzwerk gespeichert, während externe Backups an einem anderen Ort (z.B. in der Cloud oder einem externen Rechenzentrum) gespeichert werden.
- F: Was sind die Vorteile von Cloud-Backups? | A: Cloud-Backups bieten Skalierbarkeit, Kosteneffizienz, einfache Zugänglichkeit von überall und oft eine hohe Sicherheit durch Verschlüsselung und redundante Speicherung.
- F: Was versteht man unter einem "Hot Backup"? | A: Ein Hot Backup ist eine Datensicherung, die durchgeführt wird, während das System in Betrieb ist, ohne die Systemverfügbarkeit zu beeinträchtigen.
- F: Was ist ein "Cold Backup"? | A: Ein Cold Backup erfordert, dass das System oder die Datenbank heruntergefahren wird, um eine Konsistenz der gesicherten Daten sicherzustellen.
- F: Welche Rolle spielt die Datenwiederherstellungszeit? | A: Die Datenwiederherstellungszeit (Recovery Time Objective, RTO) definiert, wie schnell Daten nach einem Ausfall oder einem anderen Ereignis wiederhergestellt werden müssen.
- F: Was bedeutet Datensicherung? | A: Datensicherung bezeichnet den Prozess, Kopien von Daten zu erstellen, die zur Wiederherstellung der ursprünglichen Daten verwendet werden können, falls ein Datenverlust eintritt.
- F: Warum ist Datensicherung wichtig? | A: Datensicherung ist wichtig, um Datenverluste durch verschiedene unvorhergesehene Faktoren wie Hardware-Ausfälle, Softwarefehler, Viren oder menschliche Fehler zu verhindern.
- F: Nenne zwei mögliche Ursachen für Datenverlust. | A: Hardware-Ausfälle und Softwarefehler.
- F: Welche Rolle spielen Viren und Hackerangriffe bei Datenverlust? | A: Viren und Hackerangriffe können Daten beschädigen, löschen oder stehlen, was zu Datenverlust führt.
- F: Wie trägt die Datensicherung zur Datenintegrität bei? | A: Durch die Erstellung von Backups kann die unveränderte und vollständige Form von Daten gewährleistet werden, was zur Datenintegrität beiträgt.
- F: Nenne eine Maßnahme zur Datensicherung. | A: Die Erstellung regelmäßiger Backups ist eine gängige Maßnahme zur Datensicherung.
- F: Wie trägt Verschlüsselung zur Datensicherung bei? | A: Verschlüsselung sichert Daten, indem sie sie in eine Form umwandelt, die ohne einen speziellen Schlüssel nicht gelesen werden kann. Dies schützt die Daten vor unerwünschtem Zugriff.
- F: Datensicherung ist wichtig, um ___ zu verhindern. | A: Datenverlust
- F: Was ist eine Offsite-Datensicherung? | A: Bei der Offsite-Datensicherung werden Backups an einem geografisch getrennten Ort aufbewahrt, um die Daten vor lokalen Katastrophen zu schützen.
- F: Was ist eine lokale Datensicherung? | A: Eine lokale Datensicherung bezeichnet das Speichern von Datenkopien an demselben physischen Ort wie die primären Daten.
- F: Was ist der Unterschied zwischen einer Voll- und einer inkrementellen Sicherung? | A: Bei einer Vollsicherung werden alle Daten gesichert, während bei einer inkrementellen Sicherung nur die seit der letzten Sicherung geänderten oder neuen Daten gesichert werden.
- F: Warum ist es wichtig, regelmäßige Backups zu erstellen? | A: Regelmäßige Backups stellen sicher, dass die neuesten Versionen der Daten gesichert sind und minimieren den Datenverlust im Falle eines Ausfalls.
- F: Was ist RAID und wie trägt es zur Datensicherung bei? | A: RAID (Redundant Array of Independent Disks) ist eine Technik, die Daten über mehrere Festplatten verteilt, um die Datenverfügbarkeit und -sicherheit zu erhöhen.
- F: Was ist eine Grandfather-Father-Son (GFS)-Sicherungsstrategie? | A: Eine GFS-Strategie ist eine Methode zur Organisation von Backups, die eine Mischung aus Voll-, Differenzial- und Inkrementalsicherungen verwendet.
- F: Wie funktioniert die GFS-Strategie? | A: Bei der GFS-Strategie wird regelmäßig ein Vollbackup erstellt (Großvater), dazu tägliche inkrementelle (Sohn) oder wöchentliche differenzielle (Vater) Backups.
- F: Was geschieht mit älteren Vollbackups? | A: Ältere Vollbackups werden normalerweise nach einer festgelegten Zeit oder wenn der Speicherplatz knapp wird, gelöscht oder überschrieben.
- F: Warum ist es wichtig, Backups auf einem externen Medium oder in der Cloud zu speichern? | A: Damit die Daten im Falle eines physischen Schadens am ursprünglichen Speicherort (z.B. durch Feuer oder Wasser) geschützt sind.
- F: Was ist die Datenwiederherstellungszeit? | A: Die Datenwiederherstellungszeit, auch bekannt als Recovery Time Objective (RTO), definiert, wie schnell Daten nach einem Ausfall oder einem anderen Ereignis wiederhergestellt werden müssen.
- F: Wie unterscheidet sich die RTO (Recovery Time Objective) vom Recovery Point Objective (RPO)? | A: Während RTO die maximale tolerierte Ausfallzeit definiert, legt RPO den maximal tolerierten Datenverlust fest, der in Bezug auf Zeit gemessen wird.
- F: Was ist ein RAID-System und warum wird es verwendet? | A: RAID (Redundant Array of Independent Disks) ist eine Technologie, bei der mehrere Festplatten zu einem logischen Verbund zusammengeschlossen werden, um die Datenverfügbarkeit und -leistung zu erhöhen. Es bietet Redundanz, um Ausfälle einzelner Festplatten ohne Datenverlust zu überstehen.
- F: Welche RAID-Level gibt es und welche sind die gängigsten? | A: Es gibt verschiedene RAID-Level (z.B. RAID 0, 1, 5, 6, 10). Die gängigsten sind RAID 1 (Spiegelung), RAID 5 (mit Parität) und RAID 10 (Kombination von Spiegelung und Striping).
- F: Was ist ein Storage Area Network (SAN) und welchen Vorteil bietet es? | A: Ein SAN ist ein dediziertes Netzwerk, das Speichergeräte mit Servern verbindet. Es ermöglicht eine hohe Datenverfügbarkeit, da es redundante Pfade zu den Speichergeräten bietet und eine zentrale Datenverwaltung ermöglicht.
- F: Welche Technologien werden oft mit SANs verwendet, um die Datenverfügbarkeit zu erhöhen? | A: Zu den Technologien gehören Multipathing (mehrere Pfade zu einem Speichergerät), Failover (automatischer Wechsel zu einem anderen Pfad bei Ausfall) und Clustering (Gruppierung von Servern, um Ausfallzeiten zu minimieren).
- F: Was ist Redundanz und warum ist sie wichtig für die Verfügbarkeit? | A: Redundanz bezeichnet das Vorhandensein von zusätzlichen oder alternativen Systemkomponenten, die im Falle eines Ausfalls aktiviert werden können, um die Verfügbarkeit zu gewährleisten.
- F: Was ist ein Failover-System? | A: Ein Failover-System ist ein Backup-Betriebsmodus, in dem sekundäre Systemkomponenten aktiv werden, wenn die primären Komponenten ausfallen, um die Systemverfügbarkeit zu gewährleisten.
- F: Was versteht man unter Lastausgleich (Load Balancing)? | A: Lastausgleich verteilt den Datenverkehr auf mehrere Server oder Netzwerkkomponenten, um die Leistung zu optimieren und Ausfallzeiten zu minimieren.
- F: Was ist ein "Hot Standby"? | A: Ein Hot Standby bezeichnet ein redundantes und vollständig betriebsbereites System, das sofort aktiviert werden kann, wenn das primäre System ausfällt.
- F: Warum ist eine regelmäßige Überwachung der Systemverfügbarkeit wichtig? | A: Durch kontinuierliche Überwachung können potenzielle Probleme frühzeitig erkannt und behoben werden, bevor sie zu ernsthaften Ausfällen führen.
- F: Wie funktioniert Parität in RAID-Systemen, z.B. RAID 5? | A: Parität ist eine Methode zur Fehlerüberprüfung, bei der zusätzliche Daten generiert und gespeichert werden. Im Falle eines Laufwerksausfalls kann die Parität verwendet werden, um fehlende Daten aus den verbleibenden Laufwerken zu rekonstruieren.
- F: Welche Vorteile bieten RAID-Systeme im Bezug auf Datenverfügbarkeit und -integrität? | A: RAID-Systeme erhöhen die Datenverfügbarkeit durch Redundanz, da sie den Betrieb auch bei einem oder mehreren Laufwerksausfällen (abhängig vom RAID-Level) fortsetzen können. Sie bieten auch Datenintegrität durch den Einsatz von Parität oder Mirroring, um Datenverlust zu verhindern.
- F: Was bedeutet die Abkürzung "RAID"? | A: RAID steht für "Redundant Array of Independent Disks".
- F: Was versteht man unter einem RAID-System? | A: Ein RAID-System ist eine Technologie, bei der mehrere Festplatten zu einem logischen Verbund zusammengeschlossen werden, um die Datenverfügbarkeit und -leistung zu erhöhen.
- F: Warum wird ein RAID-System verwendet? | A: Ein RAID-System wird verwendet, um die Datenverfügbarkeit und -leistung zu erhöhen und um Ausfälle einzelner Festplatten ohne Datenverlust zu überstehen.
- F: Welche Vorteile bietet ein RAID-System? | A: Ein RAID-System bietet erhöhte Datenverfügbarkeit, verbesserte Leistung und Redundanz zur Toleranz von Festplattenausfällen.
- F: Ein RAID-System ist eine Technologie, bei der mehrere ___ zu einem logischen Verbund zusammengeschlossen werden. | A: Festplatten
- F: Welche RAID-Level kennen Sie? | A: Bekannte RAID-Level sind RAID 0, RAID 1, RAID 5 und RAID 6
- F: Was ist die Funktion von RAID 0? | A: RAID 0 teilt Daten gleichmäßig über zwei oder mehr Festplatten auf (Striping), ohne Redundanz. Es verbessert die Leistung, bietet jedoch keinen Ausfallschutz.
- F: Was ist die Funktion von RAID 1? | A: RAID 1 spiegelt die selben Daten auf zwei oder mehr Festplatten (Mirroring). Es bietet Redundanz und somit einen Ausfallschutz.
- F: Was ist die Funktion von RAID 5? | A: RAID 5 verteilt Paritäts- und Datenblöcke über alle Festplatten im Verbund. Es bietet sowohl verbesserte Leistung als auch Ausfallschutz.
- F: Was ist die Funktion von RAID 6? | A: RAID 6 ist ähnlich wie RAID 5, verwendet aber zwei unabhängige Paritätsblöcke auf jeder Festplatte. Dies bietet einen erhöhten Ausfallschutz.
- F: Was sind potenzielle Nachteile eines RAID-Systems? | A: RAID-Systeme können komplex in der Einrichtung und Verwaltung sein, und je nach RAID-Level kann ein Ausfall von zwei oder mehr Festplatten zu Datenverlust führen.
- F: Was bedeutet Redundanz im IT-Kontext? | A: Redundanz bezeichnet das Vorhandensein von zusätzlichen oder alternativen Systemkomponenten, die im Falle eines Ausfalls aktiviert werden können.
- F: Welche verschiedenen Arten von Redundanz gibt es in der IT? | A: Es gibt verschiedene Arten von Redundanz, zum Beispiel Hardware-Redundanz (wie doppelte Netzteil- oder Festplatten-Redundanz), Software-Redundanz (wie redundante Server oder Datenbanken) und Datenredundanz (wie RAID-Systeme oder Backups).
- F: Wie wird Redundanz in einem Cloud-Umfeld umgesetzt? | A: In einem Cloud-Umfeld wird Redundanz oft durch die Verteilung von Daten und Anwendungen auf mehrere geografisch verteilte Rechenzentren umgesetzt. Dies kann z.B. durch Clustering oder Datenreplikation erreicht werden.
- F: Wie wird Redundanz in Bezug auf Datenbanken umgesetzt? | A: Bei Datenbanken wird Redundanz oft durch Techniken wie Spiegelung (Mirroring), Replikation oder Clustering umgesetzt, um die Verfügbarkeit der Datenbank auch im Falle eines Ausfalls zu gewährleisten.
- F: Was ist ein Storage Area Network (SAN)? | A: Ein Storage Area Network (SAN) ist ein dediziertes Netzwerk, das Speichergeräte mit Servern verbindet.
- F: Welchen Vorteil bietet ein SAN in Bezug auf Datenverfügbarkeit? | A: Ein SAN ermöglicht eine hohe Datenverfügbarkeit durch redundante Pfade zu den Speichergeräten.
- F: Wie hilft ein SAN bei der Datenverwaltung? | A: Ein SAN ermöglicht eine zentrale Datenverwaltung, indem es Speichergeräte mit Servern verbindet.
- F: Welches Netzwerkmodell könnte als Alternative zu einem SAN verwendet werden? | A: Ein alternatives Netzwerkmodell zu einem SAN könnte ein Network Attached Storage (NAS) sein.
- F: Was ist der Hauptunterschied zwischen einem SAN und einem NAS? | A: Während ein SAN ein dediziertes Netzwerk ist, das Server mit Speichergeräten verbindet, ist ein NAS ein einzelner Speicherserver, der direkt an das Netzwerk angeschlossen ist.
- F: Welche Art von Datenverbindungen werden typischerweise in einem SAN verwendet? | A: In einem SAN werden typischerweise Glasfaserkabel für Datenverbindungen verwendet.
- F: Welche Vorteile bietet ein SAN gegenüber direktem Speicher? | A: Ein SAN bietet gegenüber direktem Speicher Vorteile wie zentrale Datenverwaltung, hohe Datenverfügbarkeit und Skalierbarkeit.
- F: Welche Nachteile hat ein SAN gegenüber simpleren Speicherlösungen wie direkt angebundenem Speicher oder einem NAS? | A: Ein SAN kann komplexer in der Einrichtung und Verwaltung sein und erfordert spezielle Hardware und Verkabelung, was zu höheren Kosten führen kann.
- F: Was ist RAID Level 10? | A: RAID Level 10, auch bekannt als "1+0", ist eine Kombination von RAID Level 1 (Spiegelung) und RAID Level 0 (Striping).
- F: Nenne zwei Protokolle, die in einem SAN verwendet werden können. | A: Fibre Channel und iSCSI.
- F: SAN steht für ____ Area Network. | A: Storage
- F: Was ist ein HBA in Bezug auf ein SAN? | A: Ein HBA (Host Bus Adapter) ist eine Schnittstelle, die es einem Server ermöglicht, sich mit einem SAN zu verbinden.
- F: Welches Protokoll in SAN ermöglicht eine Netzwerkverbindung über Ethernet? | A: Das iSCSI-Protokoll.
- F: Warum benötigt RAID 0 mindestens 2 Festplatten? | A: Weil bei RAID 0 die Daten gleichmäßig über alle Festplatten verteilt (gestreift) werden, um die Leistung zu steigern.
- F: Warum benötigt RAID 1 mindestens 2 Festplatten? | A: Weil bei RAID 1 die Daten auf zwei Festplatten gespiegelt werden, um eine Redundanz zu gewährleisten.
- F: Warum benötigt RAID 5 mindestens 3 Festplatten? | A: Weil bei RAID 5 die Paritätsinformationen über alle Festplatten verteilt werden, um bei Ausfall einer Festplatte den Datenverlust zu verhindern.
- F: Warum benötigt RAID 6 mindestens 4 Festplatten? | A: Weil bei RAID 6 zwei unabhängige Paritätsblöcke auf verschiedenen Festplatten gespeichert werden, um den Ausfall von bis zu zwei Festplatten zu überstehen.
- F: Welches RAID-Level bietet die höchste Lese-/Schreibgeschwindigkeit, aber keine Redundanz? | A: RAID 0.
- F: Welches RAID-Level bietet eine vollständige Spiegelung der Daten für hohe Redundanz? | A: RAID 1.
- F: Welches RAID-Level bietet eine gute Balance zwischen Speichereffizienz, Performance und Datenverfügbarkeit? | A: RAID 5.
- F: Welches RAID-Level bietet eine verbesserte Fehlertoleranz gegenüber RAID 5 durch zusätzliche Paritätsblöcke? | A: RAID 6.
- F: Was bedeutet die Abkürzung "USV" in Bezug auf die IT? | A: Unterbrechungsfreie Stromversorgung.
- F: Was ist eine USV in IT-Systemen? | A: Eine USV ist ein Gerät, das sicherstellt, dass IT-Systeme auch bei Stromausfällen oder Spannungsschwankungen weiterlaufen können.
- F: Was sind die zwei Hauptaufgaben einer USV? | A: 1. Schutz vor Stromausfällen, 2. Schutz vor Spannungsspitzen.
- F: Wie schützt eine USV vor Stromausfällen? | A: Eine USV hat Batterien, die bei einem Stromausfall die Stromversorgung der IT-Systeme sofort übernehmen.
- F: Wie schützt eine USV vor Spannungsspitzen? | A: Eine USV hat Schutzschaltungen, die Spannungsspitzen abfangen und so die IT-Systeme vor Schäden bewahren.
- F: Welche drei Klassen von USVs gibt es? | A: Offline, Line-Interactive, Online.
- F: Was kennzeichnet eine Offline-USV? | A: Eine Offline-USV ist im Normalbetrieb nicht aktiv. Bei einem Stromausfall wird sie aktiviert und übernimmt die Stromversorgung.
- F: Was kennzeichnet eine Line-Interactive-USV? | A: Eine Line-Interactive-USV schützt zusätzlich vor Netzschwankungen und Spannungsspitzen. Bei einem Stromausfall übernimmt sie die Stromversorgung.
- F: Was kennzeichnet eine Online-USV? | A: Eine Online-USV erzeugt konstant künstlichen Strom und ist daher immer aktiv. Sie hält die Ausgangsspannung konstant, unabhängig von der Eingangsspannung.
- F: Welche Vorteile bietet eine USV? | A: Eine USV schützt IT-Systeme vor Datenverlust und Hardwarebeschädigung durch Stromausfälle und Spannungsspitzen.
- F: Welche Nachteile hat eine USV? | A: USVs können hohe Kosten verursachen und erfordern einen hohen Wartungsaufwand.
- F: Für welche Geräte ist eine Line-Interactive-USV geeignet? | A: Eine Line-Interactive-USV ist geeignet für Server und andere Geräte, die zusätzlich vor Netzschwankungen und Spannungsspitzen geschützt werden sollen.
- F: Für welche Geräte ist eine Online-USV geeignet? | A: Eine Online-USV ist geeignet für hochsensible Geräte wie Server, die nicht durch Spannungsspitzen oder Stromausfälle beschädigt werden dürfen.
- F: Warum ist eine Online-USV besonders für hochsensible Geräte geeignet? | A: Weil sie konstant künstlichen Strom erzeugt und so auch bei starken Schwankungen der Eingangsspannung eine konstante Ausgangsspannung gewährleistet.
- F: Warum ist Zugriffskontrolle in IT-Systemen wichtig? | A: Zugriffskontrolle stellt sicher, dass nur autorisierte Benutzer auf bestimmte Ressourcen zugreifen können und schützt so Daten vor unberechtigtem Zugriff, Manipulation oder Diebstahl.
- F: Was ist das Prinzip der minimalen Rechtevergabe? | A: Das Prinzip besagt, dass Benutzern nur die minimalen Zugriffsrechte gewährt werden sollten, die sie benötigen, um ihre Aufgaben auszuführen. Dies minimiert das Risiko eines Missbrauchs oder Fehlers.
- F: Wie kann das Prinzip der minimalen Rechtevergabe in der Praxis umgesetzt werden? | A: Durch genaue Rollen- und Rechteverwaltung, bei der Benutzern auf Basis ihrer Rolle im Unternehmen oder ihrer Aufgabe spezifische Rechte zugewiesen werden.
- F: Was versteht man unter Zugangskontrolle? | A: Unter Zugangskontrolle versteht man Methoden und Technologien, die den Zugriff auf Systeme und Daten steuern und begrenzen.
- F: Was sind Beispiele für physische Zugangskontrollmethoden? | A: Beispiele für physische Zugangskontrollmethoden sind Türen, Schranken und Schlösser.
- F: Was sind Beispiele für biometrische Zugangskontrollmethoden? | A: Beispiele für biometrische Zugangskontrollmethoden sind Fingerabdruck- und Gesichtserkennung.
- F: Was versteht man unter einem Passwortsystem als Zugangskontrollmethode? | A: Ein Passwortsystem ist eine Zugangskontrollmethode, bei der ein Nutzer ein geheimes Passwort eingeben muss, um Zugang zu erhalten.
- F: Was ist eine elektronische Schlüsselkarte als Zugangskontrollmethode? | A: Eine elektronische Schlüsselkarte ist eine Zugangskontrollmethode, bei der ein Nutzer eine spezielle Karte besitzt, die beim Scannen Zugang gewährt.
- F: __ und __ sind Beispiele für biometrische Zugangskontrollmethoden. | A: Fingerabdruckerkennung, Gesichtserkennung
- F: Warum ist die Zugangskontrolle wichtig? | A: Zugangskontrolle ist wichtig, um unautorisierten Zugriff auf Systeme und Daten zu verhindern und die Sicherheit zu gewährleisten.
- F: In welchen Situationen werden physische Barrieren als Zugangskontrollmethoden typischerweise eingesetzt? | A: Physische Barrieren werden oft in Gebäuden oder Räumen eingesetzt, um den physischen Zugang zu sensiblen Bereichen zu kontrollieren.
- F: Wie unterscheiden sich Zugriffskontrolle und Zugangskontrolle? | A: Während Zugriffskontrolle bestimmt, ob ein Nutzer auf bestimmte Daten oder Ressourcen zugreifen darf, legt die Zugangskontrolle fest, ob der Nutzer Zugang zu einem bestimmten Bereich oder System erhält.
- F: Verwandte Themen Q: Welche zwei Haupttypen der Zugriffskontrolle gibt es? | A: Discretionary Access Control (DAC) und Mandatory Access Control (MAC).
- F: Was ist Verschlüsselung in der IT-Sicherheit? | A: Verschlüsselung ist der Prozess der Umwandlung von Daten in eine Form, die ohne den entsprechenden Schlüssel nicht gelesen werden kann.
- F: Was ist der Hauptzweck der Verschlüsselung in der IT-Sicherheit? | A: Der Hauptzweck der Verschlüsselung ist die Gewährleistung der Vertraulichkeit und Datenintegrität.
- F: Warum ist Verschlüsselung wichtig für die Vertraulichkeit von Daten? | A: Verschlüsselung ist wichtig für die Vertraulichkeit, weil sie sicherstellt, dass nur autorisierte Personen Zugang zu den Daten haben.
- F: Warum ist Verschlüsselung wichtig für die Datenintegrität? | A: Verschlüsselung ist wichtig für die Datenintegrität, weil sie sicherstellt, dass die Daten während der Übertragung nicht verändert wurden.
- F: Was ist ein symmetrisches Verschlüsselungsverfahren? | A: Ein symmetrisches Verschlüsselungsverfahren ist ein Verschlüsselungsverfahren, bei dem der gleiche Schlüssel zum Ver- und Entschlüsseln verwendet wird.
- F: Was ist ein asymmetrisches Verschlüsselungsverfahren? | A: Ein asymmetrisches Verschlüsselungsverfahren ist ein Verschlüsselungsverfahren, bei dem zwei verschiedene Schlüssel (ein öffentlicher und ein privater Schlüssel) zum Ver- und Entschlüsseln verwendet werden.
- F: Was ist bei der Verschlüsselung der Unterschied zwischen dem öffentlichen und dem privaten Schlüssel? | A: Der öffentliche Schlüssel kann von jedem genutzt werden, um Daten zu verschlüsseln, aber nur der private Schlüssel kann sie wieder entschlüsseln.
- F: Was ist ein Beispiel für ein symmetrisches Verschlüsselungsverfahren? | A: Ein Beispiel für ein symmetrisches Verschlüsselungsverfahren ist AES (Advanced Encryption Standard).
- F: Was ist ein Beispiel für ein asymmetrisches Verschlüsselungsverfahren? | A: Ein Beispiel für ein asymmetrisches Verschlüsselungsverfahren ist RSA (Rivest-Shamir-Adleman).
- F: Was ist eine Ende-zu-Ende-Verschlüsselung? | A: Eine Ende-zu-Ende-Verschlüsselung ist eine Form der Kommunikation, bei der nur die kommunizierenden Benutzer die Nachrichten entschlüsseln können.
- F: Was bedeutet es, wenn eine Verschlüsselung als "gebrochen" bezeichnet wird? | A: Wenn eine Verschlüsselung als "gebrochen" bezeichnet wird, bedeutet das, dass ein Angreifer einen Weg gefunden hat, die verschlüsselten Daten ohne Zugang zum richtigen Schlüssel zu lesen.
- F: Was ist eine Zertifikatsbehörde (CA)? | A: Eine Zertifikatsbehörde ist eine vertrauenswürdige Organisation, die digitale Zertifikate ausstellt und verwaltet.
- F: Was bestätigt ein von einer Zertifikatsbehörde ausgestelltes Zertifikat? | A: Ein solches Zertifikat bestätigt die Identität des Zertifikatinhabers.
- F: Welche Informationen bietet ein von einer Zertifikatsbehörde ausgestelltes Zertifikat? | A: Das Zertifikat bietet den öffentlichen Schlüssel des Zertifikatinhabers.
- F: Eine ___ ist eine vertrauenswürdige Organisation, die digitale Zertifikate ausstellt und verwaltet. | A: Zertifikatsbehörde
- F: Welche Rolle spielt die Zertifikatsbehörde in der Public Key Infrastruktur (PKI)? | A: In der PKI ist die Zertifikatsbehörde für die Ausstellung und Verwaltung von digitalen Zertifikaten verantwortlich.
- F: Was ist ein digitales Zertifikat? | A: Ein digitales Zertifikat ist eine elektronische Datei, die die Identität des Zertifikatinhabers bestätigt und dessen öffentlichen Schlüssel enthält.
- F: Was ist der öffentliche Schlüssel in einem digitalen Zertifikat? | A: Der öffentliche Schlüssel ist ein Teil eines Schlüsselpaars, das in asymmetrischen Verschlüsselungssystemen verwendet wird. Er wird für die Verschlüsselung oder Signaturprüfung verwendet.
- F: Was ist die Rolle von Zertifikatsbehörden in der Internetsicherheit? | A: Zertifikatsbehörden spielen eine zentrale Rolle bei der Gewährleistung der Sicherheit im Internet, indem sie die Identität von Webseiten bestätigen und Verschlüsselung ermöglichen.
- F: Wie validiert eine Zertifikatsbehörde die Identität eines Zertifikatantragstellers? | A: Die Zertifikatsbehörde validiert die Identität durch einen Prozess namens "Vetting", bei dem der Antragsteller verschiedene Beweise für seine Identität vorlegen muss.
- F: Was ist ein selbstsigniertes Zertifikat? | A: Ein selbstsigniertes Zertifikat ist ein Zertifikat, das von der Entität generiert wird, die es verwendet, anstatt von einer Zertifikatsbehörde.
- F: Was ist ein Zertifikatsperrlisten (CRL)? | A: Eine Zertifikatsperrliste ist eine Liste von digitalen Zertifikaten, die von einer Zertifikatsbehörde vor ihrem Ablaufdatum widerrufen wurden.
- F: Was bedeutet Authentifizierung im IT-Kontext? | A: Authentifizierung ist der Prozess der Überprüfung der Identität eines Benutzers, Systems oder einer Anwendung.
- F: Wann wird eine Authentifizierung typischerweise durchgeführt? | A: Bevor Zugriff auf Ressourcen oder Daten gewährt wird.
- F: Welche Rolle spielt Authentifizierung in der IT-Sicherheit? | A: Sie stellt sicher, dass nur autorisierte Benutzer oder Systeme Zugriff auf bestimmte Ressourcen oder Daten haben.
- F: Was ist eine Zwei-Faktor-Authentifizierung? | A: Eine Authentifizierung, bei der mindestens zwei der genannten Faktoren kombiniert werden.
- F: Nennen Sie ein Beispiel für eine Zwei-Faktor-Authentifizierung. | A: Zugang zu einem Bankkonto mittels einer Bankkarte (etwas, das man hat) und einer PIN (etwas, das man weiß).
- F: Was ist im IT-Kontext der Unterschied zwischen Authentifizierung und Autorisierung? | A: Authentifizierung bestätigt die Identität eines Benutzers, Systems oder einer Anwendung, während Autorisierung bestimmt, welche Aktionen diese durchführen dürfen.
- F: ___ ist der Prozess der Überprüfung der Identität eines Benutzers, Systems oder einer Anwendung. | A: Authentifizierung
- F: Was ist ein häufig genutztes Authentifizierungsprotokoll in Unternehmensnetzwerken? | A: LDAP (Lightweight Directory Access Protocol)
- F: Was ist ein Single Sign-On (SSO)? | A: Ein Authentifizierungsverfahren, bei dem ein Benutzer mit nur einer Anmeldeaktion auf mehrere Anwendungen oder Dienste zugreifen kann.
- F: Wie sind die Begriffe "Identität", "Authentifizierung" und "Autorisierung" miteinander verknüpft? | A: Die Identität eines Benutzers wird zuerst authentifiziert, dann werden seine Autorisierungen bestimmt, basierend auf seiner Identität und Rolle.
- F: Warum sollte SSH Telnet vorgezogen werden? | A: SSH sollte Telnet vorgezogen werden, da es Daten während der Übertragung verschlüsselt, was die Gefahr von Man-in-the-Middle-Angriffen und das Abfangen von Daten verhindert. Telnet überträgt Daten, einschließlich Passwörter, im Klartext, was ein hohes Sicherheitsrisiko darstellt.
- F: Was ist SSH? | A: SSH (Secure Shell) ist ein verschlüsseltes Protokoll zur sicheren Kommunikation über unsichere Netzwerke.
- F: Was ist Telnet? | A: Telnet ist ein älteres, unverschlüsseltes Protokoll zur Kommunikation über Netzwerke.
- F: Welche Hauptunterschiede gibt es zwischen SSH und Telnet bezüglich der Sicherheit? | A: SSH bietet Verschlüsselung, Authentifizierung und Integrität, während Telnet diese Sicherheitsfunktionen nicht bietet.
- F: __ ist ein verschlüsseltes Protokoll zur sicheren Kommunikation, während __ ein unverschlüsseltes Protokoll ist. | A: SSH, Telnet

## Quiz

? Warum benötigt RAID 1 mindestens 2 Festplatten?
* Weil bei RAID 1 die Daten auf zwei Festplatten gespiegelt werden, um eine Redundanz zu gewährleisten.
- Weil RAID 1 die Daten auf mindestens drei Festplatten verteilt und Parität berechnet.
- Weil RAID 1 zwei Platten zur Leistungssteigerung zusammenschaltet.
- Weil bei RAID 1 eine Platte als Hot Spare dient.

? Welche Rolle spielt Authentifizierung in der IT-Sicherheit?
* Sie stellt sicher, dass nur autorisierte Benutzer oder Systeme Zugriff auf bestimmte Ressourcen oder Daten haben.
- Sie verschlüsselt die übertragenen Daten.
- Sie schützt vor Viren und Malware.
- Sie sichert Daten gegen Verlust.

? Welches RAID-Level bietet eine vollständige Spiegelung der Daten für hohe Redundanz?
* RAID 1.
- RAID 0
- RAID 5
- RAID 10

? Nenne zwei Protokolle, die in einem SAN verwendet werden können.
* Fibre Channel und iSCSI.
- HTTP und FTP.
- SMTP und IMAP.
- DHCP und DNS.

? Was ist eine Zertifikatsbehörde (CA)?
* Eine Zertifikatsbehörde ist eine vertrauenswürdige Organisation, die digitale Zertifikate ausstellt und verwaltet.
- Eine Behörde, die Domänennamen vergibt.
- Eine Organisation, die Netzwerkgeräte wartet.
- Eine Organisation, die IP-Adressen vergibt.

? Welche Nachteile hat eine USV?
* USVs können hohe Kosten verursachen und erfordern einen hohen Wartungsaufwand.
- USVs sind nur für Server geeignet und haben eine sehr kurze Lebensdauer.
- USVs sparen Strom, schützen aber nicht vor Spannungsschwankungen.
- USVs können ausschließlich Strom speichern, aber nicht regeln.

? Was bedeutet die Abkürzung "RAID"?
* RAID steht für "Redundant Array of Independent Disks".
- Redundant Array of Individual Drives
- Rapid Access of Independent Disks
- Reliable Array of Inexpensive Data

? ___ ist der Prozess der Überprüfung der Identität eines Benutzers, Systems oder einer Anwendung.
* Authentifizierung
- Autorisierung
- Verschlüsselung
- Protokollierung

? Welche Hauptunterschiede gibt es zwischen SSH und Telnet bezüglich der Sicherheit?
* SSH bietet Verschlüsselung, Authentifizierung und Integrität, während Telnet diese Sicherheitsfunktionen nicht bietet.
- SSH ist unverschlüsselt, Telnet ist verschlüsselt.
- SSH und Telnet sind gleich sicher.
- SSH ist nur für Windows verfügbar, Telnet für alle Systeme.

? Was ist ein Beispiel für ein symmetrisches Verschlüsselungsverfahren?
* Ein Beispiel für ein symmetrisches Verschlüsselungsverfahren ist AES (Advanced Encryption Standard).
- RSA
- ECC
- Diffie-Hellman

? Ein RAID-System ist eine Technologie, bei der mehrere ___ zu einem logischen Verbund zusammengeschlossen werden.
* Festplatten
- Netzwerkkarten
- Netzteile
- Bildschirme

? Was sind Beispiele für physische Zugangskontrollmethoden?
* Beispiele für physische Zugangskontrollmethoden sind Türen, Schranken und Schlösser.
- Firewalls, Virenscanner und Passwörter.
- Zertifikate, Proxys und VPNs.
- Router, Switches und Server.

? Was ist ein häufig genutztes Authentifizierungsprotokoll in Unternehmensnetzwerken?
* LDAP (Lightweight Directory Access Protocol)
- HTTP (Hypertext Transfer Protocol)
- SNMP (Simple Network Management Protocol)
- FTP (File Transfer Protocol)

? SAN steht für ____ Area Network.
* Storage
- Wide
- Local
- Public

? Welches Netzwerkmodell könnte als Alternative zu einem SAN verwendet werden?
* Ein alternatives Netzwerkmodell zu einem SAN könnte ein Network Attached Storage (NAS) sein.
- Ein alternatives Netzwerkmodell zu einem SAN könnte ein Local Area Network (LAN) sein.
- Ein alternatives Netzwerkmodell zu einem SAN könnte ein Virtual Private Network (VPN) sein.
- Ein alternatives Netzwerkmodell zu einem SAN könnte ein Metropolitan Area Network (MAN) sein.

? Was sind Beispiele für biometrische Zugangskontrollmethoden?
* Beispiele für biometrische Zugangskontrollmethoden sind Fingerabdruck- und Gesichtserkennung.
- Türen, Schlösser und Passwörter.
- Fingerabdruck und Passwort.
- Smartcards und PINs.

? Wie schützt eine USV vor Stromausfällen?
* Eine USV hat Batterien, die bei einem Stromausfall die Stromversorgung der IT-Systeme sofort übernehmen.
- Eine USV leitet den Strom bei Ausfall in andere Gebäude um.
- Eine USV erzeugt Strom über einen Dieselgenerator.
- Eine USV warnt den Benutzer per E-Mail, schützt aber nicht aktiv.

? Nenne zwei mögliche Ursachen für Datenverlust.
* Hardware-Ausfälle und Softwarefehler.
- Regelmäßige Backups und Verschlüsselung.
- Starke Passwörter und Firewalls.
- Redundante Netzteile und USV.

? Welches RAID-Level bietet eine verbesserte Fehlertoleranz gegenüber RAID 5 durch zusätzliche Paritätsblöcke?
* RAID 6.
- RAID 0
- RAID 1
- RAID 10

? Was sind die zwei Hauptaufgaben einer USV?
* 1. Schutz vor Stromausfällen, 2. Schutz vor Spannungsspitzen.
- 1. Schutz vor Spannungsspitzen, 2. Verbesserung der Netzwerkgeschwindigkeit.
- 1. Schutz vor Stromausfällen, 2. Verstärkung des WLAN-Signals.
- 1. Schutz vor Datenverlust, 2. Schutz vor Hackerangriffen.
