---
id: ihk-hf3-systeme-lernkarten-2
bereich: AP2
block: IHK
kapitel: Lernkarten Handlungsfelder
titel: Handlungsfeld 3 – Marktgängige IT-Systeme beurteilen (Lernkarten-Katalog) (Teil 2)
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP1, AP2]
quellen: [3._Beurteilen_marktgängiger_IT-Systeme_und_kundenspezifischer_Lösungen.pdf]
verweise: [ihk-handlungsschritte, ihk-lernzettel-guide]
---

## Profi

Handlungsfeld 3 umfasst Hardware (Mainboard, CPU, RAM, Speicher, Peripherie, Schnittstellen), Netzwerktechnik (Topologien, Switches, Access Points, Routing, IP-Adressierung, Subnetting, Protokolle, Firewalls), Kosten (Anschaffung, Betrieb, Lizenz, Finanzierung, fix/variabel), Leistung und Wirkungsgrad, Kennzeichnungen, Barrierefreiheit sowie Angebots- und Nutzwertvergleich. Dieser Teil enthält 164 Fragen und Antworten in 21 Themenblöcken: Subnetting, Überblick, Routing, Switches, Firewalls, Access Points, Barrierefreier Zugriff auf IT-Systeme, Kennzeichnungen, Wirkungsgrad, Leistung, Leistungsaufnahme, Anschaffungskosten, Betriebskosten, Variable und fixe Kosten, Lizenzkosten, Finanzierungskosten, Kostenvergleich, Zukunftssicherheit, Preis-Leistungs-Verhältnis, Qualitativer und quantitativer Angebotsvergleich, Nutzwertanalyse. Die Antworten sind der Originalformulierung der Lernkarten entnommen und nach Themen geordnet.

### Subnetting

- **Was ist Subnetting?** Subnetting ist der Prozess der Aufteilung eines IP-Netzwerks in kleinere, effizientere Segmente oder Subnetze.
- **Warum wird Subnetting in Netzwerken verwendet?** Subnetting wird verwendet, um die Netzwerkperformance zu verbessern, den Verkehr zu organisieren und die Sicherheit zu erhöhen.
- **Subnetting ist der Prozess der Aufteilung eines IP-Netzwerks in ___, um die Netzwerkperformance zu verbessern, den Verkehr zu organisieren und die Sicherheit zu erhöhen.** kleinere Segmente oder Subnetze
- **Was ist ein Subnetz?** Ein Subnetz ist ein kleineres Netzwerk innerhalb eines größeren IP-Netzwerks.
- **Wie kann Subnetting die Netzwerkperformance verbessern?** Subnetting kann die Netzwerkperformance verbessern, indem es die Menge an Netzwerkverkehr reduziert und somit die Effizienz erhöht.
- **Was ist eine Subnetzmaske?** Eine Subnetzmaske ist eine Zahlenfolge, die verwendet wird, um zu bestimmen, wie ein IP-Netzwerk in Subnetze aufgeteilt wird.
- **Wie sieht eine typische Subnetzmaske für ein Klasse-C-Netzwerk aus?** 255.255.255.0
- **Was passiert, wenn zwei Geräte in verschiedenen Subnetzen kommunizieren möchten?** Sie müssen über einen Router kommunizieren, da sie nicht direkt miteinander kommunizieren können. Der Router leitet den Datenverkehr zwischen den Subnetzen weiter.
- **Was bedeutet die Abkürzung CIDR?** CIDR steht für Classless Inter-Domain Routing.
- **Was ist die CIDR-Notation?** Die CIDR-Notation ist eine Methode zur Darstellung von Subnetzen, die eine Kombination aus IP-Adresse und Präfixlänge verwendet.
- **Wie wird ein Subnetz mithilfe der CIDR-Notation repräsentiert?** Ein Subnetz wird mithilfe der CIDR-Notation durch eine IP-Adresse gefolgt von einem Slash und der Präfixlänge repräsentiert, z.B. 192.168.1.0/24.
- **Welchen Vorteil bietet die CIDR-Notation gegenüber klassenbasiertem Routing?** Die CIDR-Notation bietet mehr Flexibilität als klassenbasiertes Routing, da Subnetze nicht streng nach Klassen eingeteilt werden müssen.
- **Wie verbessert die CIDR-Notation die IP-Adressnutzung?** CIDR verbessert die IP-Adressnutzung, indem es erlaubt, IP-Adressbereiche in kleinere, effizientere Subnetze zu unterteilen.
- **Was bedeutet ein /24 in der CIDR-Notation?** Ein /24 in der CIDR-Notation bedeutet, dass die ersten 24 Bits der IP-Adresse das Netzwerksegment identifizieren.
- **Welche IP-Adresse repräsentiert das gesamte Netzwerk in einem Subnetz?** Die Netzwerkadresse.
- **Wie wird die spezielle IP-Adresse genannt, die alle Hosts in einem Subnetz repräsentiert?** Die Broadcastadresse.
- **Was bedeutet die Abkürzung VLSM?** Variable Length Subnet Mask.
- **Was ist eine Variable Length Subnet Mask (VLSM)?** VLSM ermöglicht die Verwendung verschiedener Subnetzmasken innerhalb desselben Netzwerks.
- **Wenn ein Netzwerk die Adresse 192.168.1.0/24 hat, was ist die Subnetzmaske?** Die Subnetzmaske ist 255.255.255.0.
- **Wenn ein Netzwerk die Adresse 192.168.1.0/24 hat, was ist die Netzwerkadresse?** Die Netzwerkadresse ist 192.168.1.0.
- **Wenn ein Netzwerk die Adresse 192.168.1.0/24 hat, was ist die Broadcastadresse?** Die Broadcastadresse ist 192.168.1.255.
- **Wenn ein Netzwerk die Adresse 192.168.1.0/24 hat, wie viele nutzbare Host-Adressen gibt es?** Es gibt 254 nutzbare Host-Adressen.
- **Wenn ein Netzwerk die Adresse 192.168.1.0/24 ist und in zwei Subnetze mit den Adressen 192.168.1.0/25 und 192.168.1.128/26 unterteilt wird, wie viele nutzbare Host-Adressen gibt es in jedem Subnetz?** Im ersten Subnetz (192.168.1.0/25) gibt es 126 nutzbare Host-Adressen und im zweiten Subnetz (192.168.1.128/26) gibt es 62 nutzbare Host-Adressen.
- **Wie unterscheidet sich VLSM von CIDR?** VLSM ist eine Methode zur Subnetz-Aufteilung, während CIDR eine Methode zur IP-Adressierung ist. Mit VLSM können verschiedene Subnetze unterschiedliche Subnetzmasken haben, während CIDR das Klassensystem von IP-Adressen aufhebt und eine feingranulare Kontrolle über die IP-Adressentrennung ermöglicht.

### Überblick

- **Was ist ein Router?** Ein Router ist ein Gerät, das verschiedene Netzwerke miteinander verbindet und Datenpakete zwischen diesen Netzwerken leitet.
- **Was ist die Hauptfunktion eines Routers?** Die Hauptfunktion eines Routers ist es, verschiedene Netzwerke miteinander zu verbinden und Datenpakete zwischen diesen Netzwerken zu leiten.
- **Ein Router leitet Datenpakete zwischen ____________.** verschiedenen Netzwerken
- **Was ist eine Routing-Tabelle?** Eine Routing-Tabelle ist eine Datenstruktur in einem Router, die Informationen darüber enthält, wie Datenpakete zu ihren Zieladressen geleitet werden können.
- **Welche zusätzliche Funktion kann ein Router außer dem Leiten von Datenpaketen haben?** Viele Router haben zusätzliche Funktionen wie Firewall-Schutz, VPN-Unterstützung und WLAN-Funktionen.
- **Was bedeutet es, wenn ein Router als Gateway fungiert?** Wenn ein Router als Gateway fungiert, dient er als Zugangspunkt für Geräte, um von einem Netzwerk zu einem anderen zu gelangen, oft vom lokalen Netzwerk zum Internet.
- **Was bedeutet es, wenn ein Router Datenpakete "routet"?** Das "Routen" von Datenpaketen bedeutet, dass der Router die beste Route für jedes Datenpaket zu seinem Ziel bestimmt und es entsprechend weiterleitet.
- **Was ist ein Switch im IT-Kontext?** Ein Switch ist ein Netzwerkgerät, das Datenpakete innerhalb eines Netzwerks weiterleitet.
- **Wie leitet ein Switch Datenpakete weiter?** Ein Switch leitet Datenpakete basierend auf der MAC-Adresse der Geräte weiter.
- **Was ist der Unterschied zwischen einem Switch und einem Hub?** Ein Switch leitet Datenpakete gezielt an das richtige Gerät weiter, während ein Hub die Datenpakete an alle Geräte im Netzwerk sendet.
- **Was ist ein Access Point?** Ein Access Point ist ein Gerät, das drahtlose Geräte mit einem kabelgebundenen Netzwerk verbindet.
- **Wie wird ein Access Point in einem drahtlosen Netzwerk verwendet?** Ein Access Point fungiert als Schnittstelle zwischen WLAN-Geräten und dem kabelgebundenen LAN.
- **Welche Technologie bildet die Grundlage für die meisten Access Points?** Die meisten Access Points basieren auf dem IEEE 802.11 Standard, auch bekannt als Wi-Fi.
- **Was ist eine Firewall?** Eine Firewall ist ein Sicherheitssystem, das den ein- und ausgehenden Netzwerkverkehr überwacht und steuert.
- **Welche Hauptfunktion erfüllt eine Firewall in einem Netzwerk?** Sie schützt Netzwerkressourcen vor unautorisierten Zugriffen und Angriffen.
- **Auf welcher Grundlage trifft eine Firewall ihre Entscheidungen zur Kontrolle des Netzwerkverkehrs?** Basierend auf einer definierten Sicherheitsrichtlinie.
- **Welche Funktion erfüllt eine Firewall in Bezug auf Netzwerkverbindungen?** Sie überwacht alle ein- und ausgehenden Verbindungen und lässt nur diejenigen zu, die den festgelegten Sicherheitsrichtlinien entsprechen.
- **Nenne zwei Arten von Firewalls.** Paketfilter-Firewall und Stateful Inspection Firewall.
- **Wie unterscheidet sich eine Paketfilter-Firewall von einer Stateful Inspection Firewall?** Eine Paketfilter-Firewall überwacht Pakete einzeln, ohne den Kontext zu beachten, während eine Stateful Inspection Firewall den Status der Netzwerkverbindungen überwacht.
- **Welchen Vorteil bietet eine Stateful Inspection Firewall gegenüber einer Paketfilter-Firewall?** Sie bietet eine höhere Sicherheit, da sie den Kontext der Netzwerkverbindungen berücksichtigt.
- **Was ist ein potenzieller Nachteil einer Stateful Inspection Firewall gegenüber einer Paketfilter-Firewall?** Sie kann mehr Systemressourcen verbrauchen und die Netzwerkleistung beeinträchtigen.
- **Was ist ein Modem?** Ein Modem ist ein Gerät, das digitale Daten in analoge Signale umwandelt und umgekehrt.
- **Wie wandelt ein Modem digitale Daten in analoge Signale um?** Es verwendet eine Methode namens Modulation, um digitale Informationen in ein analoges Signal zu konvertieren.
- **Wie wandelt ein Modem analoge Signale in digitale Daten um?** Es verwendet eine Methode namens Demodulation, um das analoge Signal zurück in digitale Information zu konvertieren.
- **Wofür wird ein Modem hauptsächlich verwendet?** Es wird hauptsächlich verwendet, um eine Internetverbindung über den Internetdienstanbieter (ISP) zu ermöglichen.
- **Welche Arten von Leitungen werden typischerweise für die Datenübertragung mit einem Modem verwendet?** Telefon- oder Kabelleitungen.
- **Worin unterscheiden sich DSL- und Kabelmodems?** Ein Gateway ist der Übergang zwischen Netzwerken, oft mit unterschiedlichen Protokollen oder Adressbereichen (z. B. Standardgateway ins Internet).
- **Was ist ein Gateway?** Ein Gateway ist der Übergang zwischen Netzwerken, oft mit unterschiedlichen Protokollen oder Adressbereichen (z. B. Standardgateway ins Internet).
- **Welches Gerät wird typischerweise verwendet, um ein Heimnetzwerk mit dem Internet zu verbinden?** Ein Router

### Routing

- **Was ist ein Routing-Protokoll?** Ein Routing-Protokoll ist ein Algorithmus, der von Routern verwendet wird.
- **Welche Hauptfunktion hat ein Routing-Protokoll in einem Netzwerk?** Seine Hauptfunktion ist es, den besten Pfad zur Weiterleitung von Datenpaketen zwischen Netzwerken zu bestimmen.
- **Wie bestimmt ein Routing-Protokoll den besten Pfad für die Weiterleitung von Datenpaketen?** Es berücksichtigt verschiedene Faktoren wie die Anzahl der Hops, die Bandbreite, die Verkehrsbelastung, die Kosten und andere Netzwerkmetriken.
- **Nennen Sie Beispiele für Routing-Protokolle.** Beispiele sind OSPF (Open Shortest Path First), EIGRP (Enhanced Interior Gateway Routing Protocol), BGP (Border Gateway Protocol) und RIP (Routing Information Protocol).
- **Was ist der Unterschied zwischen statischen und dynamischen Routing-Protokollen?** Statische Routing-Protokolle erfordern manuelle Konfigurationen und Änderungen, während dynamische Routing-Protokolle automatisch Anpassungen basierend auf den Netzwerkbedingungen vornehmen.
- **Was ist ein autonomes System im Kontext von Routing-Protokollen?** Ein autonomes System (AS) ist eine Sammlung von IP-Netzwerken und Routern unter der Kontrolle einer einzigen Verwaltungseinheit (z.B. ein ISP), die eine gemeinsame Routing-Politik verwenden.
- **Was bedeutet die Abkürzung NAT?** NAT steht für Network Address Translation.
- **Was ist die Hauptfunktion von NAT?** NAT ermöglicht es, private IP-Adressen in öffentliche IP-Adressen umzuwandeln und umgekehrt.
- **Warum ist NAT bei IPv4 notwendig?** Wegen der begrenzten Anzahl an verfügbaren öffentlichen IPv4-Adressen.
- **Warum ist NAT bei IPv6 weniger notwendig?** IPv6 bietet einen erheblich größeren Adressraum, wodurch das Problem der Adressknappheit entfällt.
- **Was ist die Rolle der Portnummern in der NAT-Technik?** Portnummern werden verwendet, um spezifische Prozesse oder Dienste auf einem Gerät zu identifizieren. Bei NAT helfen sie, den Datenverkehr zu dem korrekten Gerät auf der lokalen Seite der Übersetzung zu leiten.
- **Was ist Port Forwarding im Zusammenhang mit NAT?** Port Forwarding ist eine Funktion von NAT, die es ermöglicht, Datenverkehr auf bestimmte Ports an ein spezifisches Gerät auf der lokalen Seite der NAT-Übersetzung zu leiten.
- **Was ist der Unterschied zwischen statischem und dynamischem NAT?** Statisches NAT übersetzt eine private IP-Adresse in eine dedizierte öffentliche IP-Adresse, während dynamisches NAT eine Pool von öffentlichen IP-Adressen verwendet, die je nach Bedarf zugewiesen werden.
- **Was ist NAT Traversal?** NAT Traversal ist eine Technik, die die Übertragung von Informationen zwischen Netzwerken ermöglicht, die NAT verwenden.

### Switches

- **Was ist ein Managed Switch?** Ein Managed Switch ist ein Netzwerkgerät, das erweiterte Funktionen wie VLANs und QoS bietet, die konfigurierbar sind.
- **Was ist ein Unmanaged Switch?** Ein Unmanaged Switch ist ein Plug-and-Play-Netzwerkgerät ohne Konfigurationsoptionen.
- **Wie unterscheiden sich Managed und Unmanaged Switches in ihren Funktionen?** Managed Switches bieten erweiterte konfigurierbare Funktionen wie VLANs und QoS, während Unmanaged Switches Plug-and-Play-Geräte ohne solche Konfigurationsoptionen sind.
- **Was bedeutet VLAN bei Managed Switches?** VLAN steht für Virtual Local Area Network. Es ist eine Technik, um logische Netzwerke innerhalb eines physischen Netzwerkes zu erstellen.
- **Warum sind Unmanaged Switches oft einfacher zu bedienen?** Weil sie keine Konfiguration erfordern und sofort nach dem Anschließen einsatzbereit sind (Plug-and-Play).

### Firewalls

- **Was ist ein Intrusion Detection System (IDS)?** Ein Intrusion Detection System (IDS) ist ein System, das verdächtige Aktivitäten oder Verstöße gegen die Sicherheitspolitik in einem Netzwerk erkennt und meldet.
- **Wie arbeitet ein IDS mit einer Firewall zusammen?** Ein IDS arbeitet mit einer Firewall zusammen, indem es ungewöhnlichen oder verdächtigen Netzwerkverkehr identifiziert und die Firewall informiert, die dann entsprechend reagieren und den Verkehr blockieren kann.
- **Welches System ergänzt das Intrusion Detection System, indem es aktiv in den Netzwerkverkehr eingreift und Angriffe unterbindet?** Das Intrusion Prevention System (IPS).
- **Was ist eine Web Application Firewall (WAF)?** Eine WAF ist eine spezialisierte Firewall, die Webanwendungen vor Angriffen schützt.
- **Was macht eine Web Application Firewall (WAF)?** Eine WAF überwacht und filtert HTTP-Anfragen zu Webanwendungen.
- **Vor welchen Angriffen schützt eine WAF?** Eine WAF schützt Webanwendungen vor gängigen Angriffen wie Cross-Site Scripting (XSS) und SQL-Injection.

### Access Points

- **Was ist Roaming in einem WLAN-Netzwerk?** Roaming in einem WLAN-Netzwerk ermöglicht es einem Gerät, nahtlos von einem Access Point (AP) zum anderen zu wechseln, um die Verbindung aufrechtzuerhalten.
- **Warum wird Roaming in einem großen WLAN-Netzwerk verwendet?** Roaming wird in großen WLAN-Netzwerken verwendet, um eine kontinuierliche Verbindung zu gewährleisten, wenn sich das Gerät im Gebäude bewegt.
- **Beschreibe den Prozess des Roamings in einem WLAN-Netzwerk.** Bei Roaming sucht das Gerät kontinuierlich nach starken AP-Signalen in der Nähe und wechselt zu einem anderen AP, wenn das aktuelle Signal schwächer wird.

### Barrierefreier Zugriff auf IT-Systeme

- **Wie beeinflusst die Barrierefreiheit die Benutzerfreundlichkeit eines IT-Systems?** Die Barrierefreiheit verbessert die Benutzerfreundlichkeit, indem sie sicherstellt, dass das System für eine breitere Benutzerbasis zugänglich ist. Sie fördert auch gute Designprinzipien wie klare Navigation und verständliche Inhalte, die allen Nutzern zugutekommen.
- **Welche Technologien werden häufig verwendet, um die Barrierefreiheit für Sehbehinderte zu unterstützen?** Für Sehbehinderte werden Technologien wie Bildschirmleseprogramme, Braille-Zeilen, Vergrößerungssoftware und alternative Textbeschreibungen für Bilder verwendet. Diese Technologien ermöglichen es ihnen, Inhalte zu lesen und mit dem System zu interagieren.
- **Wie können IT-Systeme für Menschen mit motorischen Einschränkungen zugänglich gemacht werden?** Für Menschen mit motorischen Einschränkungen können IT-Systeme durch die Verwendung von adaptiven Eingabegeräten, Spracheingabe, Tastaturkürzeln und einer sorgfältigen Gestaltung der Benutzeroberfläche, die die Verwendung von Maus und Tastatur minimiert, zugänglich gemacht werden.
- **Was sind einige Methoden, um die Barrierefreiheit in Webdesign und -entwicklung zu fördern?** Methoden zur Förderung der Barrierefreiheit in Webdesign und -entwicklung umfassen die Einhaltung von WCAG-Richtlinien, den Einsatz von semantischem HTML, die Bereitstellung von Alternativtexten für Multimedia, die Verwendung von kontrastreichen Farben und die Überprüfung der Zugänglichkeit mit spezialisierten Tools.
- **Welche Gesetze oder Vorschriften regeln die Barrierefreiheit in der IT in Europa?** In Europa regelt die Europäische Barrierefreiheitsrichtlinie (European Accessibility Act) die Barrierefreiheit von Produkten und Dienstleistungen. Einzelne Länder haben auch nationale Gesetze, wie das Behindertengleichstellungsgesetz (BGG) in Deutschland, die die Barrierefreiheit in der IT fördern.
- **Was versteht man unter "barrierefreiem Zugriff" in der IT?** Barrierefreier Zugriff in der IT bedeutet, dass Systeme und Dienste so gestaltet sind, dass sie von allen Menschen, einschließlich Menschen mit Behinderungen, genutzt werden können.
- **Warum ist barrierefreier Zugriff in der IT wichtig?** Barrierefreier Zugriff ist wichtig, um Gleichberechtigung zu fördern und sicherzustellen, dass niemand aufgrund von körperlichen oder sensorischen Einschränkungen ausgeschlossen wird.
- **Was ist ein Bildschirmleseprogramm?** Ein Bildschirmleseprogramm ist eine Software, die den Inhalt auf dem Bildschirm in gesprochene Sprache oder Brailleschrift übersetzt.
- **Was sind die Web Content Accessibility Guidelines (WCAG)?** Die Web Content Accessibility Guidelines (WCAG) sind Richtlinien, die darauf abzielen, das Web für Menschen mit Behinderungen zugänglicher zu machen.
- **Warum sind die Web Content Accessibility Guidelines (WCAG) wichtig?** Sie bieten klare Standards und Kriterien für die Barrierefreiheit und dienen oft als rechtliche Grundlage in vielen Ländern.
- **Nenne drei wichtige Bereiche, die von den WCAG-Richtlinien abgedeckt werden.** Textalternativen, Zeitgesteuerte Medien, Anpassbarkeit.

### Kennzeichnungen

- **Was sind IT-Normen?** IT-Normen sind vereinbarte Richtlinien und Spezifikationen für Produkte, Dienstleistungen und Prozesse in der IT.
- **Warum sind IT-Normen wichtig in der IT-Branche?** Sie sind wichtig, um die Interoperabilität, Qualität, und Sicherheit von IT-Systemen sicherzustellen.
- **Nenne ein Beispiel für eine IT-Norm im Bereich der IT-Sicherheit.** Ein Beispiel ist der ISO/IEC 27001-Standard für Informationssicherheitsmanagementsysteme.
- **Was ist IEEE 802?** IEEE 802 ist eine Familie von IT-Normen für Netzwerkstandards, die von der IEEE (Institute of Electrical and Electronics Engineers) entwickelt wurde.
- **Was ist UTF-8?** UTF-8 ist eine weit verbreitete Methode zur Zeichenkodierung, die fast alle menschlichen Sprachen unterstützt.
- **Was bedeutet das CE-Zeichen in der IT?** CE steht für Europäische Konformität und zeigt an, dass das Produkt den geltenden europäischen Standards entspricht.
- **Was bedeutet das FCC-Zeichen in der IT?** FCC steht für US-Bundeskommunikationskommission. Es zeigt an, dass das Produkt den Standards der Kommunikationskommission der USA entspricht.
- **Was bedeutet das RoHS-Zeichen in der IT?** RoHS steht für Beschränkung gefährlicher Stoffe. Es zeigt an, dass das Produkt die EU-Richtlinie erfüllt, die die Verwendung bestimmter gefährlicher Stoffe in Elektro- und Elektronikgeräten einschränkt.
- **Was bedeutet das Energy Star-Zeichen in der IT?** Energy Star ist ein Zeichen für Energieeffizienz. Produkte mit diesem Zeichen erfüllen bestimmte Energieeffizienzstandards.
- **Warum sind Zertifikate und Kennzeichnungen in der IT wichtig?** Sie zeigen an, dass ein Produkt bestimmte Standards in Bezug auf Sicherheit, Umweltschutz und Energieverbrauch erfüllt.
- **Welche Art von Standards zeigt das CE-Zeichen an?** Das CE-Zeichen zeigt an, dass das Produkt den geltenden europäischen Standards für Sicherheit, Gesundheitsschutz und Umweltschutz entspricht.

### Wirkungsgrad

- **Was sind Energiekenngrößen?** Energiekenngrößen sind spezifische Messwerte, die den Energieverbrauch und die Effizienz von Geräten und Systemen beschreiben.
- **Nenne zwei Beispiele für Energiekenngrößen.** Beispiele für Energiekenngrößen sind der Wirkungsgrad und der Energieverbrauch.
- **Was ist der Wirkungsgrad als Energiekenngröße?** Der Wirkungsgrad gibt an, welcher Anteil der zugeführten Energie in Nutzenergie umgewandelt wird.
- **Was sagt der Energieverbrauch als Energiekenngröße aus?** Der Energieverbrauch gibt an, wie viel Energie ein Gerät oder System benötigt, um seine Funktion auszuführen.
- **Wie wird der Energieverbrauch von IT-Geräten gemessen?** Der Energieverbrauch von IT-Geräten wird in Watt gemessen.
- **Warum wird der Energieverbrauch von IT-Geräten oft über einen bestimmten Zeitraum betrachtet?** Um den Gesamtverbrauch in Kilowattstunden (kWh) zu berechnen.

### Leistung

- **Was ist Strom in der Elektrotechnik?** Strom ist die Fließrate von Elektronen.
- **Was ist Spannung in der Elektrotechnik?** Spannung ist die elektrische Kraft, die den Strom antreibt.
- **Was ist Leistung in der Elektrotechnik?** Leistung ist die Rate, mit der Energie übertragen oder umgewandelt wird.
- **In welcher Einheit wird elektrischer Strom gemessen?** Elektrischer Strom wird in Ampere (A) gemessen.
- **In welcher Einheit wird elektrische Spannung gemessen?** Elektrische Spannung wird in Volt (V) gemessen.
- **In welcher Einheit wird elektrische Leistung gemessen?** Elektrische Leistung wird in Watt (W) gemessen.
- **Wie ist die Beziehung zwischen Strom, Spannung und Widerstand in einem elektrischen Kreislauf?** Sie sind durch das Ohm'sche Gesetz verbunden, das besagt: Strom = Spannung / Widerstand.
- **Nennen Sie ein Gerät, das zur Messung der elektrischen Spannung verwendet wird.** Ein Voltmeter wird zur Messung der elektrischen Spannung verwendet.
- **Wie lautet die Formel zur Berechnung der elektrischen Leistung?** Die Formel zur Berechnung der elektrischen Leistung ist P=I*V.<br />P = Leistung in Watt, I = Strom in Ampere, V = Spannung in Volt
- **Berechne die Leistung, wenn der Strom 2 Ampere und die Spannung 230 Volt beträgt.** Die Leistung beträgt 460 Watt.
- **Wenn eine Lampe eine Leistung von 60 Watt hat und mit einer Spannung von 230 Volt betrieben wird, wie hoch ist der Strom?** Der Strom beträgt etwa 0,26 Ampere.
- **Wie berechnet man den elektrischen Widerstand in einem Schaltkreis?** Der elektrische Widerstand wird mit der Formel R=V/I berechnet, wobei R der Widerstand in Ohm, V die Spannung in Volt und I der Strom in Ampere ist.
- **Was ist das Ohmsche Gesetz?** Das Ohmsche Gesetz ist eine grundlegende Regel in der Elektrotechnik, die den Zusammenhang zwischen Strom, Spannung und Widerstand beschreibt.
- **Wie wird das Ohmsche Gesetz formuliert?** Das Ohmsche Gesetz wird formuliert als U = R * I, wobei U die Spannung, R der Widerstand und I der Strom ist.

### Leistungsaufnahme

- **Was versteht man unter Leistungsaufnahme?** Leistungsaufnahme bezieht sich auf die Menge an elektrischer Energie, die ein elektronisches Gerät aus dem Netz bezieht.
- **In welcher Einheit wird die Leistungsaufnahme gemessen?** Die Leistungsaufnahme wird in Watt gemessen.
- **Was ist der CO2-Fußabdruck?** Der CO2-Fußabdruck ist die Menge an Treibhausgasemissionen, die direkt und indirekt durch eine Aktivität verursacht werden, gemessen als ihre CO2-Äquivalente.
- **Wie beeinflusst die Leistungsaufnahme von IT-Geräten den CO2-Fußabdruck?** Eine höhere Leistungsaufnahme führt zu einem höheren Energieverbrauch, der wiederum einen größeren CO2-Fußabdruck verursacht.
- **Wie beeinflusst die Nutzung von Cloud-Diensten die Leistungsaufnahme und den CO2-Fußabdruck?** Cloud-Dienste können die Leistungsaufnahme und den CO2-Fußabdruck reduzieren, da sie eine effizientere Nutzung von IT-Ressourcen ermöglichen.
- **Was ist "Green IT" und wie kann es die Leistungsaufnahme von IT-Geräten beeinflussen?** Green IT bezeichnet Maßnahmen zur Reduzierung der Umweltauswirkungen der IT, einschließlich der Senkung der Leistungsaufnahme von IT-Geräten.
- **Wie kann Virtualisierung helfen, die Leistungsaufnahme von IT-Geräten zu reduzieren?** Durch Virtualisierung können mehrere virtuelle Maschinen auf einem einzigen physischen Server laufen, wodurch die Gesamtzahl der benötigten physischen Server und damit die Leistungsaufnahme reduziert wird.

### Anschaffungskosten

- **Was sind Anschaffungskosten?** Anschaffungskosten sind die einmaligen Ausgaben, die für den Kauf eines Produkts oder einer Dienstleistung anfallen.
- **Wie beziehen sich Anschaffungskosten auf IT-Systeme?** Bei IT-Systemen umfassen die Anschaffungskosten den Kaufpreis, Versand, Installation und ähnliche Kosten, die bei der Inbetriebnahme anfallen.
- **Wie können Anschaffungskosten reduziert werden?** Durch den Kauf gebrauchter Hardware, die Nutzung von Open-Source-Software oder die Wahl günstigerer Anbieter.

### Betriebskosten

- **Was sind Betriebskosten in Bezug auf IT-Systeme?** Betriebskosten sind die laufenden Kosten für den Betrieb von IT-Systemen.
- **Welcher Kostenfaktor gehört zu den Betriebskosten von IT-Systemen?** Wartung.
- **Was ist ein weiterer Kostenfaktor, der zu den Betriebskosten von IT-Systemen gehört?** Stromverbrauch.
- **Warum sind Betriebskosten ein wichtiger Faktor in der IT?** Weil sie oft einen großen Anteil an den Gesamtkosten eines IT-Systems ausmachen.
- **Wie beeinflussen Betriebskosten die Total Cost of Ownership (TCO) in der IT?** Betriebskosten sind ein wesentlicher Bestandteil der TCO und können deren Höhe erheblich beeinflussen.

### Variable und fixe Kosten

- **Was sind variable Kosten im Kontext von IT-Systemen?** Variable Kosten ändern sich mit der Nutzung des IT-Systems, wie zum Beispiel Stromkosten.
- **Was sind fixe Kosten im Kontext von IT-Systemen?** Fixe Kosten bleiben unabhängig von der Nutzung des IT-Systems gleich, wie zum Beispiel Mietkosten für Räumlichkeiten oder Lizenzgebühren für Software.
- **Wie wirkt sich eine Erhöhung der Nutzung auf variable Kosten in IT-Systemen aus?** Eine Erhöhung der Nutzung führt in der Regel zu einer Erhöhung der variablen Kosten.
- **Welche Kosten sind im Kontext von Cloud Computing zu berücksichtigen?** Im Kontext von Cloud Computing sind Kosten wie Datenspeicherung (oft variabel), Bandbreitennutzung (variabel) und monatliche oder jährliche Abonnementgebühren (fix) zu berücksichtigen.

### Lizenzkosten

- **Was sind Lizenzkosten?** Lizenzkosten sind Gebühren, die für die Nutzung von urheberrechtlich geschützter Software oder Technologie bezahlt werden müssen.
- **Welche Faktoren können die Höhe der Lizenzkosten beeinflussen?** Faktoren wie Lizenztyp, Anzahl der Benutzer und Vertragsbedingungen können die Höhe der Lizenzkosten beeinflussen.
- **Wie können Unternehmen Lizenzkosten reduzieren?** Unternehmen können Lizenzkosten reduzieren, indem sie beispielsweise Open-Source-Software nutzen oder Mengenrabatte für Mehrbenutzerlizenzen nutzen.
- **Was ist eine Volumenlizenz?** Eine Volumenlizenz ist eine Lizenz, die es Unternehmen erlaubt, eine Software auf einer bestimmten Anzahl von Computern zu installieren.

### Finanzierungskosten

- **Was sind Finanzierungskosten?** Finanzierungskosten sind die Kosten, die mit der Beschaffung von Kapital für Projekte verbunden sind.
- **Welche Arten von Kosten können zu den Finanzierungskosten gehören?** Zinsen für Kredite, Gebühren für Finanzierungsdienstleistungen und Kosten für die Erstellung von Sicherheiten.

### Kostenvergleich

- **Was bedeutet "Leasing" im Kontext von IT-Ressourcen?** Beim Leasing werden IT-Ressourcen für einen bestimmten Zeitraum vom Leasinggeber zur Verfügung gestellt. Die Kosten werden meist in monatlichen Raten gezahlt.
- **Was bedeutet "Kauf" im Kontext von IT-Ressourcen?** Beim Kauf erwerbt ein Unternehmen die IT-Ressourcen und besitzt diese dann vollständig. Die Kosten werden sofort in voller Höhe gezahlt.
- **Was bedeutet "Miete" im Kontext von IT-Ressourcen?** Bei der Miete werden IT-Ressourcen für einen bestimmten Zeitraum gemietet. Wie beim Leasing werden die Kosten in monatlichen Raten gezahlt, allerdings ist die Mietdauer oft flexibler.
- **Was bedeutet "Pay-per-use" im Kontext von IT-Ressourcen?** Pay-per-use bezieht sich auf ein Modell, bei dem Unternehmen nur für die Nutzung der IT-Ressourcen zahlen, die sie tatsächlich verbrauchen.
- **Welcher Faktor ist wichtig bei der Entscheidung zwischen Leasing, Kauf, Miete und Pay-per-use?** Die Gesamtkosten über die Nutzungsdauer der IT-Ressourcen.

### Zukunftssicherheit

- **Was bedeutet Auslastung, Anpassungsfähigkeit und Erweiterbarkeit im Kontext von IT-Systemen?** Auslastung bezieht sich auf die Menge der genutzten Ressourcen. Anpassungsfähigkeit ist die Fähigkeit eines Systems, sich an veränderte Anforderungen anzupassen. Erweiterbarkeit bezeichnet die Möglichkeit, das System durch zusätzliche Ressourcen oder Funktionen zu erweitern.
- **Warum sind Zukunftssicherheit und Erweiterbarkeit wichtige Faktoren bei der Auswahl von IT-Systemen?** Zukunftssicherheit und Erweiterbarkeit sind wichtig, da sie sicherstellen, dass das System auch in Zukunft den Anforderungen gerecht wird. Sie erlauben es, das System bei Bedarf zu erweitern oder zu aktualisieren, ohne dass eine komplette Neubeschaffung notwendig ist.

### Preis-Leistungs-Verhältnis

- **Was bedeutet das Preis-Leistungs-Verhältnis in Bezug auf IT-Systeme?** Das Preis-Leistungs-Verhältnis bezieht sich auf den Vergleich der Kosten eines IT-Systems mit den gebotenen Funktionen und Vorteilen. Ein gutes Preis-Leistungs-Verhältnis bedeutet, dass das System seinen Preis in Bezug auf die gebotene Leistung rechtfertigt.
- **Wie kann das Preis-Leistungs-Verhältnis bei der Auswahl von IT-Systemen analysiert werden?** Das Preis-Leistungs-Verhältnis kann durch den Vergleich der Kosten mit den spezifischen Anforderungen, Funktionen, Leistung, Support und Qualität des Systems analysiert werden. Bewertungen, Benchmarks und die Berücksichtigung von Total Cost of Ownership (TCO) können hilfreich sein.

### Qualitativer und quantitativer Angebotsvergleich

- **Was unterscheidet den qualitativen von einem quantitativen Angebotsvergleich?** Der qualitative Angebotsvergleich berücksichtigt subjektive und schwer messbare Faktoren wie Qualität und Markenreputation, während der quantitative Angebotsvergleich objektive und messbare Faktoren wie Preis, Geschwindigkeit oder Kapazität berücksichtigt.
- **Wie wird ein qualitativer Angebotsvergleich in Bezug auf IT-Systeme durchgeführt?** Ein qualitativer Angebotsvergleich analysiert Faktoren wie Benutzerfreundlichkeit, Kundenservice, Flexibilität, Anpassungsfähigkeit und Qualität des Designs. Es kann durch Benutzerbewertungen, Fachexpertise und persönliche Einschätzungen erfolgen.
- **Wie wird ein quantitativer Angebotsvergleich in Bezug auf IT-Systeme durchgeführt?** Ein quantitativer Angebotsvergleich betrachtet messbare Faktoren wie Preis, Leistung, Spezifikationen und Kapazität. Es beinhaltet den direkten Vergleich dieser Zahlen und kann durch Tabellen, Diagramme und spezifische Metriken visualisiert werden.
- **Warum ist ein kombinierter qualitativer und quantitativer Angebotsvergleich wichtig bei der Auswahl von IT-Systemen?** Ein kombinierter Ansatz ermöglicht eine ganzheitliche Bewertung, die sowohl objektive als auch subjektive Kriterien berücksichtigt. Dies hilft, das bestmögliche System auszuwählen, das sowohl den technischen Anforderungen als auch den spezifischen Bedürfnissen des Unternehmens entspricht.

### Nutzwertanalyse

- **Was ist eine Nutzwertanalyse, und wie wird sie im Kontext von IT-Systemen verwendet?** Die Nutzwertanalyse ist eine Methode zur Bewertung und Vergleich von Alternativen basierend auf mehreren Kriterien. In der IT wird sie verwendet, um verschiedene Systeme oder Lösungen anhand von Faktoren wie Kosten, Leistung, Qualität und anderen relevanten Aspekten zu vergleichen.
- **Wie wird die Nutzwertanalyse bei der Auswahl von IT-Systemen durchgeführt?** Die Nutzwertanalyse wird durchgeführt, indem die relevanten Kriterien identifiziert, gewichtet und bewertet werden. Die Alternativen werden dann anhand dieser Kriterien verglichen, um diejenige zu identifizieren, die den größten Nutzen bietet.
- **Welche Vorteile bietet die Nutzwertanalyse bei der Auswahl und Bewertung von IT-Systemen?** Die Nutzwertanalyse bietet eine strukturierte und objektive Methode, um komplexe Entscheidungen zu treffen. Sie hilft, die wichtigsten Faktoren zu identifizieren, fördert die Transparenz im Entscheidungsprozess und unterstützt eine fundierte Auswahl, die den Geschäftszielen entspricht.

## Einfach

In diesem Handlungsfeld bist du der Einkäufer und Prüfer. Der Kunde sagt: „Wir brauchen neue Computer und ein Netzwerk.“ Du musst wissen, was in einem Computer steckt (Mainboard, Prozessor, Arbeitsspeicher, Festplatte), wie ein Netzwerk aufgebaut ist (Switch, Access Point, Router, IP-Adressen) und was das alles kostet, nicht nur beim Kauf, sondern auch im Betrieb (Strom, Lizenzen, Wartung). Am Ende vergleichst du Angebote mit Zahlen (quantitativ) und Kriterien (Nutzwertanalyse) und empfiehlst eins. Die Karteikarten fragen dir alle Bausteine einzeln ab, vom Mainboard bis zum Wirkungsgrad. Lerne in kleinen Päckchen: erst Hardware, dann Netzwerk, dann Kosten.

Tipp zum Lernen: Mach dir pro Themenblock eine Mini-Zusammenfassung in drei Sätzen. Wenn du einen Block mit eigenen Worten erklären kannst, ohne auf die Karte zu schauen, hast du ihn wirklich verstanden. Wiederhole schwierige Karten nach einem Tag, nach drei Tagen und nach einer Woche. Im Quiz kannst du danach prüfen, ob du die Antworten auch erkennst, wenn sie zwischen ähnlichen Formulierungen stehen. Das ist genau die Situation in der Multiple-Choice-Aufgabe der Prüfung. Bei Fragen mit „Nennen Sie“ reichen Stichworte, bei „Erläutern Sie“ brauchst du ganze Sätze mit Begründung, genau so, wie die Antworten auf den Karten formuliert sind.

## Merksatz
- Gesamtkosten = Anschaffung + Betrieb + Lizenzen + Finanzierung.
- Wirkungsgrad = abgegebene / aufgenommene Leistung.
- Quantitativ = Zahlen, qualitativ = Kriterien mit Gewichtung.

## Prüfungsfalle
- Nur die Anschaffungskosten vergleichen und Betriebskosten vergessen.
- Leistung (W) und Arbeit (kWh) verwechseln.
- Subnetting: Netz- und Broadcastadresse als Hosts mitzählen.
- Lernkarten sind knapp formuliert; in der Prüfung verlangen Operatoren wie „Erläutern“ ganze Sätze mit Begründung.

## Grafik
### Lernen mit dem Karteikasten
1. Lernender: zieht eine Karte und liest die Frage
2. Lernender -> Gedächtnis: antwortet laut
3. Lernender -> Karte: deckt die Antwort auf
4. Karte: richtig, dann ins nächste Fach
5. Karte: falsch, dann zurück ins erste Fach

## Karteikarten
- F: Was ist Subnetting? | A: Subnetting ist der Prozess der Aufteilung eines IP-Netzwerks in kleinere, effizientere Segmente oder Subnetze.
- F: Warum wird Subnetting in Netzwerken verwendet? | A: Subnetting wird verwendet, um die Netzwerkperformance zu verbessern, den Verkehr zu organisieren und die Sicherheit zu erhöhen.
- F: Subnetting ist der Prozess der Aufteilung eines IP-Netzwerks in ___, um die Netzwerkperformance zu verbessern, den Verkehr zu organisieren und die Sicherheit zu erhöhen. | A: kleinere Segmente oder Subnetze
- F: Was ist ein Subnetz? | A: Ein Subnetz ist ein kleineres Netzwerk innerhalb eines größeren IP-Netzwerks.
- F: Wie kann Subnetting die Netzwerkperformance verbessern? | A: Subnetting kann die Netzwerkperformance verbessern, indem es die Menge an Netzwerkverkehr reduziert und somit die Effizienz erhöht.
- F: Was ist eine Subnetzmaske? | A: Eine Subnetzmaske ist eine Zahlenfolge, die verwendet wird, um zu bestimmen, wie ein IP-Netzwerk in Subnetze aufgeteilt wird.
- F: Wie sieht eine typische Subnetzmaske für ein Klasse-C-Netzwerk aus? | A: 255.255.255.0
- F: Was passiert, wenn zwei Geräte in verschiedenen Subnetzen kommunizieren möchten? | A: Sie müssen über einen Router kommunizieren, da sie nicht direkt miteinander kommunizieren können. Der Router leitet den Datenverkehr zwischen den Subnetzen weiter.
- F: Was bedeutet die Abkürzung CIDR? | A: CIDR steht für Classless Inter-Domain Routing.
- F: Was ist die CIDR-Notation? | A: Die CIDR-Notation ist eine Methode zur Darstellung von Subnetzen, die eine Kombination aus IP-Adresse und Präfixlänge verwendet.
- F: Wie wird ein Subnetz mithilfe der CIDR-Notation repräsentiert? | A: Ein Subnetz wird mithilfe der CIDR-Notation durch eine IP-Adresse gefolgt von einem Slash und der Präfixlänge repräsentiert, z.B. 192.168.1.0/24.
- F: Welchen Vorteil bietet die CIDR-Notation gegenüber klassenbasiertem Routing? | A: Die CIDR-Notation bietet mehr Flexibilität als klassenbasiertes Routing, da Subnetze nicht streng nach Klassen eingeteilt werden müssen.
- F: Wie verbessert die CIDR-Notation die IP-Adressnutzung? | A: CIDR verbessert die IP-Adressnutzung, indem es erlaubt, IP-Adressbereiche in kleinere, effizientere Subnetze zu unterteilen.
- F: Was bedeutet ein /24 in der CIDR-Notation? | A: Ein /24 in der CIDR-Notation bedeutet, dass die ersten 24 Bits der IP-Adresse das Netzwerksegment identifizieren.
- F: Welche IP-Adresse repräsentiert das gesamte Netzwerk in einem Subnetz? | A: Die Netzwerkadresse.
- F: Wie wird die spezielle IP-Adresse genannt, die alle Hosts in einem Subnetz repräsentiert? | A: Die Broadcastadresse.
- F: Was bedeutet die Abkürzung VLSM? | A: Variable Length Subnet Mask.
- F: Was ist eine Variable Length Subnet Mask (VLSM)? | A: VLSM ermöglicht die Verwendung verschiedener Subnetzmasken innerhalb desselben Netzwerks.
- F: Wenn ein Netzwerk die Adresse 192.168.1.0/24 hat, was ist die Subnetzmaske? | A: Die Subnetzmaske ist 255.255.255.0.
- F: Wenn ein Netzwerk die Adresse 192.168.1.0/24 hat, was ist die Netzwerkadresse? | A: Die Netzwerkadresse ist 192.168.1.0.
- F: Wenn ein Netzwerk die Adresse 192.168.1.0/24 hat, was ist die Broadcastadresse? | A: Die Broadcastadresse ist 192.168.1.255.
- F: Wenn ein Netzwerk die Adresse 192.168.1.0/24 hat, wie viele nutzbare Host-Adressen gibt es? | A: Es gibt 254 nutzbare Host-Adressen.
- F: Wenn ein Netzwerk die Adresse 192.168.1.0/24 ist und in zwei Subnetze mit den Adressen 192.168.1.0/25 und 192.168.1.128/26 unterteilt wird, wie viele nutzbare Host-Adressen gibt es in jedem Subnetz? | A: Im ersten Subnetz (192.168.1.0/25) gibt es 126 nutzbare Host-Adressen und im zweiten Subnetz (192.168.1.128/26) gibt es 62 nutzbare Host-Adressen.
- F: Wie unterscheidet sich VLSM von CIDR? | A: VLSM ist eine Methode zur Subnetz-Aufteilung, während CIDR eine Methode zur IP-Adressierung ist. Mit VLSM können verschiedene Subnetze unterschiedliche Subnetzmasken haben, während CIDR das Klassensystem von IP-Adressen aufhebt und eine feingranulare Kontrolle über die IP-Adressentrennung ermöglicht.
- F: Was ist ein Router? | A: Ein Router ist ein Gerät, das verschiedene Netzwerke miteinander verbindet und Datenpakete zwischen diesen Netzwerken leitet.
- F: Was ist die Hauptfunktion eines Routers? | A: Die Hauptfunktion eines Routers ist es, verschiedene Netzwerke miteinander zu verbinden und Datenpakete zwischen diesen Netzwerken zu leiten.
- F: Ein Router leitet Datenpakete zwischen ____________. | A: verschiedenen Netzwerken
- F: Was ist eine Routing-Tabelle? | A: Eine Routing-Tabelle ist eine Datenstruktur in einem Router, die Informationen darüber enthält, wie Datenpakete zu ihren Zieladressen geleitet werden können.
- F: Welche zusätzliche Funktion kann ein Router außer dem Leiten von Datenpaketen haben? | A: Viele Router haben zusätzliche Funktionen wie Firewall-Schutz, VPN-Unterstützung und WLAN-Funktionen.
- F: Was bedeutet es, wenn ein Router als Gateway fungiert? | A: Wenn ein Router als Gateway fungiert, dient er als Zugangspunkt für Geräte, um von einem Netzwerk zu einem anderen zu gelangen, oft vom lokalen Netzwerk zum Internet.
- F: Was bedeutet es, wenn ein Router Datenpakete "routet"? | A: Das "Routen" von Datenpaketen bedeutet, dass der Router die beste Route für jedes Datenpaket zu seinem Ziel bestimmt und es entsprechend weiterleitet.
- F: Was ist ein Switch im IT-Kontext? | A: Ein Switch ist ein Netzwerkgerät, das Datenpakete innerhalb eines Netzwerks weiterleitet.
- F: Wie leitet ein Switch Datenpakete weiter? | A: Ein Switch leitet Datenpakete basierend auf der MAC-Adresse der Geräte weiter.
- F: Was ist der Unterschied zwischen einem Switch und einem Hub? | A: Ein Switch leitet Datenpakete gezielt an das richtige Gerät weiter, während ein Hub die Datenpakete an alle Geräte im Netzwerk sendet.
- F: Was ist ein Access Point? | A: Ein Access Point ist ein Gerät, das drahtlose Geräte mit einem kabelgebundenen Netzwerk verbindet.
- F: Wie wird ein Access Point in einem drahtlosen Netzwerk verwendet? | A: Ein Access Point fungiert als Schnittstelle zwischen WLAN-Geräten und dem kabelgebundenen LAN.
- F: Welche Technologie bildet die Grundlage für die meisten Access Points? | A: Die meisten Access Points basieren auf dem IEEE 802.11 Standard, auch bekannt als Wi-Fi.
- F: Was ist eine Firewall? | A: Eine Firewall ist ein Sicherheitssystem, das den ein- und ausgehenden Netzwerkverkehr überwacht und steuert.
- F: Welche Hauptfunktion erfüllt eine Firewall in einem Netzwerk? | A: Sie schützt Netzwerkressourcen vor unautorisierten Zugriffen und Angriffen.
- F: Auf welcher Grundlage trifft eine Firewall ihre Entscheidungen zur Kontrolle des Netzwerkverkehrs? | A: Basierend auf einer definierten Sicherheitsrichtlinie.
- F: Welche Funktion erfüllt eine Firewall in Bezug auf Netzwerkverbindungen? | A: Sie überwacht alle ein- und ausgehenden Verbindungen und lässt nur diejenigen zu, die den festgelegten Sicherheitsrichtlinien entsprechen.
- F: Nenne zwei Arten von Firewalls. | A: Paketfilter-Firewall und Stateful Inspection Firewall.
- F: Wie unterscheidet sich eine Paketfilter-Firewall von einer Stateful Inspection Firewall? | A: Eine Paketfilter-Firewall überwacht Pakete einzeln, ohne den Kontext zu beachten, während eine Stateful Inspection Firewall den Status der Netzwerkverbindungen überwacht.
- F: Welchen Vorteil bietet eine Stateful Inspection Firewall gegenüber einer Paketfilter-Firewall? | A: Sie bietet eine höhere Sicherheit, da sie den Kontext der Netzwerkverbindungen berücksichtigt.
- F: Was ist ein potenzieller Nachteil einer Stateful Inspection Firewall gegenüber einer Paketfilter-Firewall? | A: Sie kann mehr Systemressourcen verbrauchen und die Netzwerkleistung beeinträchtigen.
- F: Was ist ein Modem? | A: Ein Modem ist ein Gerät, das digitale Daten in analoge Signale umwandelt und umgekehrt.
- F: Wie wandelt ein Modem digitale Daten in analoge Signale um? | A: Es verwendet eine Methode namens Modulation, um digitale Informationen in ein analoges Signal zu konvertieren.
- F: Wie wandelt ein Modem analoge Signale in digitale Daten um? | A: Es verwendet eine Methode namens Demodulation, um das analoge Signal zurück in digitale Information zu konvertieren.
- F: Wofür wird ein Modem hauptsächlich verwendet? | A: Es wird hauptsächlich verwendet, um eine Internetverbindung über den Internetdienstanbieter (ISP) zu ermöglichen.
- F: Welche Arten von Leitungen werden typischerweise für die Datenübertragung mit einem Modem verwendet? | A: Telefon- oder Kabelleitungen.
- F: Worin unterscheiden sich DSL- und Kabelmodems? | A: Ein Gateway ist der Übergang zwischen Netzwerken, oft mit unterschiedlichen Protokollen oder Adressbereichen (z. B. Standardgateway ins Internet).
- F: Was ist ein Gateway? | A: Ein Gateway ist der Übergang zwischen Netzwerken, oft mit unterschiedlichen Protokollen oder Adressbereichen (z. B. Standardgateway ins Internet).
- F: Welches Gerät wird typischerweise verwendet, um ein Heimnetzwerk mit dem Internet zu verbinden? | A: Ein Router
- F: Was ist ein Routing-Protokoll? | A: Ein Routing-Protokoll ist ein Algorithmus, der von Routern verwendet wird.
- F: Welche Hauptfunktion hat ein Routing-Protokoll in einem Netzwerk? | A: Seine Hauptfunktion ist es, den besten Pfad zur Weiterleitung von Datenpaketen zwischen Netzwerken zu bestimmen.
- F: Wie bestimmt ein Routing-Protokoll den besten Pfad für die Weiterleitung von Datenpaketen? | A: Es berücksichtigt verschiedene Faktoren wie die Anzahl der Hops, die Bandbreite, die Verkehrsbelastung, die Kosten und andere Netzwerkmetriken.
- F: Nennen Sie Beispiele für Routing-Protokolle. | A: Beispiele sind OSPF (Open Shortest Path First), EIGRP (Enhanced Interior Gateway Routing Protocol), BGP (Border Gateway Protocol) und RIP (Routing Information Protocol).
- F: Was ist der Unterschied zwischen statischen und dynamischen Routing-Protokollen? | A: Statische Routing-Protokolle erfordern manuelle Konfigurationen und Änderungen, während dynamische Routing-Protokolle automatisch Anpassungen basierend auf den Netzwerkbedingungen vornehmen.
- F: Was ist ein autonomes System im Kontext von Routing-Protokollen? | A: Ein autonomes System (AS) ist eine Sammlung von IP-Netzwerken und Routern unter der Kontrolle einer einzigen Verwaltungseinheit (z.B. ein ISP), die eine gemeinsame Routing-Politik verwenden.
- F: Was bedeutet die Abkürzung NAT? | A: NAT steht für Network Address Translation.
- F: Was ist die Hauptfunktion von NAT? | A: NAT ermöglicht es, private IP-Adressen in öffentliche IP-Adressen umzuwandeln und umgekehrt.
- F: Warum ist NAT bei IPv4 notwendig? | A: Wegen der begrenzten Anzahl an verfügbaren öffentlichen IPv4-Adressen.
- F: Warum ist NAT bei IPv6 weniger notwendig? | A: IPv6 bietet einen erheblich größeren Adressraum, wodurch das Problem der Adressknappheit entfällt.
- F: Was ist die Rolle der Portnummern in der NAT-Technik? | A: Portnummern werden verwendet, um spezifische Prozesse oder Dienste auf einem Gerät zu identifizieren. Bei NAT helfen sie, den Datenverkehr zu dem korrekten Gerät auf der lokalen Seite der Übersetzung zu leiten.
- F: Was ist Port Forwarding im Zusammenhang mit NAT? | A: Port Forwarding ist eine Funktion von NAT, die es ermöglicht, Datenverkehr auf bestimmte Ports an ein spezifisches Gerät auf der lokalen Seite der NAT-Übersetzung zu leiten.
- F: Was ist der Unterschied zwischen statischem und dynamischem NAT? | A: Statisches NAT übersetzt eine private IP-Adresse in eine dedizierte öffentliche IP-Adresse, während dynamisches NAT eine Pool von öffentlichen IP-Adressen verwendet, die je nach Bedarf zugewiesen werden.
- F: Was ist NAT Traversal? | A: NAT Traversal ist eine Technik, die die Übertragung von Informationen zwischen Netzwerken ermöglicht, die NAT verwenden.
- F: Was ist ein Managed Switch? | A: Ein Managed Switch ist ein Netzwerkgerät, das erweiterte Funktionen wie VLANs und QoS bietet, die konfigurierbar sind.
- F: Was ist ein Unmanaged Switch? | A: Ein Unmanaged Switch ist ein Plug-and-Play-Netzwerkgerät ohne Konfigurationsoptionen.
- F: Wie unterscheiden sich Managed und Unmanaged Switches in ihren Funktionen? | A: Managed Switches bieten erweiterte konfigurierbare Funktionen wie VLANs und QoS, während Unmanaged Switches Plug-and-Play-Geräte ohne solche Konfigurationsoptionen sind.
- F: Was bedeutet VLAN bei Managed Switches? | A: VLAN steht für Virtual Local Area Network. Es ist eine Technik, um logische Netzwerke innerhalb eines physischen Netzwerkes zu erstellen.
- F: Warum sind Unmanaged Switches oft einfacher zu bedienen? | A: Weil sie keine Konfiguration erfordern und sofort nach dem Anschließen einsatzbereit sind (Plug-and-Play).
- F: Was ist ein Intrusion Detection System (IDS)? | A: Ein Intrusion Detection System (IDS) ist ein System, das verdächtige Aktivitäten oder Verstöße gegen die Sicherheitspolitik in einem Netzwerk erkennt und meldet.
- F: Wie arbeitet ein IDS mit einer Firewall zusammen? | A: Ein IDS arbeitet mit einer Firewall zusammen, indem es ungewöhnlichen oder verdächtigen Netzwerkverkehr identifiziert und die Firewall informiert, die dann entsprechend reagieren und den Verkehr blockieren kann.
- F: Welches System ergänzt das Intrusion Detection System, indem es aktiv in den Netzwerkverkehr eingreift und Angriffe unterbindet? | A: Das Intrusion Prevention System (IPS).
- F: Was ist eine Web Application Firewall (WAF)? | A: Eine WAF ist eine spezialisierte Firewall, die Webanwendungen vor Angriffen schützt.
- F: Was macht eine Web Application Firewall (WAF)? | A: Eine WAF überwacht und filtert HTTP-Anfragen zu Webanwendungen.
- F: Vor welchen Angriffen schützt eine WAF? | A: Eine WAF schützt Webanwendungen vor gängigen Angriffen wie Cross-Site Scripting (XSS) und SQL-Injection.
- F: Was ist Roaming in einem WLAN-Netzwerk? | A: Roaming in einem WLAN-Netzwerk ermöglicht es einem Gerät, nahtlos von einem Access Point (AP) zum anderen zu wechseln, um die Verbindung aufrechtzuerhalten.
- F: Warum wird Roaming in einem großen WLAN-Netzwerk verwendet? | A: Roaming wird in großen WLAN-Netzwerken verwendet, um eine kontinuierliche Verbindung zu gewährleisten, wenn sich das Gerät im Gebäude bewegt.
- F: Beschreibe den Prozess des Roamings in einem WLAN-Netzwerk. | A: Bei Roaming sucht das Gerät kontinuierlich nach starken AP-Signalen in der Nähe und wechselt zu einem anderen AP, wenn das aktuelle Signal schwächer wird.
- F: Wie beeinflusst die Barrierefreiheit die Benutzerfreundlichkeit eines IT-Systems? | A: Die Barrierefreiheit verbessert die Benutzerfreundlichkeit, indem sie sicherstellt, dass das System für eine breitere Benutzerbasis zugänglich ist. Sie fördert auch gute Designprinzipien wie klare Navigation und verständliche Inhalte, die allen Nutzern zugutekommen.
- F: Welche Technologien werden häufig verwendet, um die Barrierefreiheit für Sehbehinderte zu unterstützen? | A: Für Sehbehinderte werden Technologien wie Bildschirmleseprogramme, Braille-Zeilen, Vergrößerungssoftware und alternative Textbeschreibungen für Bilder verwendet. Diese Technologien ermöglichen es ihnen, Inhalte zu lesen und mit dem System zu interagieren.
- F: Wie können IT-Systeme für Menschen mit motorischen Einschränkungen zugänglich gemacht werden? | A: Für Menschen mit motorischen Einschränkungen können IT-Systeme durch die Verwendung von adaptiven Eingabegeräten, Spracheingabe, Tastaturkürzeln und einer sorgfältigen Gestaltung der Benutzeroberfläche, die die Verwendung von Maus und Tastatur minimiert, zugänglich gemacht werden.
- F: Was sind einige Methoden, um die Barrierefreiheit in Webdesign und -entwicklung zu fördern? | A: Methoden zur Förderung der Barrierefreiheit in Webdesign und -entwicklung umfassen die Einhaltung von WCAG-Richtlinien, den Einsatz von semantischem HTML, die Bereitstellung von Alternativtexten für Multimedia, die Verwendung von kontrastreichen Farben und die Überprüfung der Zugänglichkeit mit spezialisierten Tools.
- F: Welche Gesetze oder Vorschriften regeln die Barrierefreiheit in der IT in Europa? | A: In Europa regelt die Europäische Barrierefreiheitsrichtlinie (European Accessibility Act) die Barrierefreiheit von Produkten und Dienstleistungen. Einzelne Länder haben auch nationale Gesetze, wie das Behindertengleichstellungsgesetz (BGG) in Deutschland, die die Barrierefreiheit in der IT fördern.
- F: Was versteht man unter "barrierefreiem Zugriff" in der IT? | A: Barrierefreier Zugriff in der IT bedeutet, dass Systeme und Dienste so gestaltet sind, dass sie von allen Menschen, einschließlich Menschen mit Behinderungen, genutzt werden können.
- F: Warum ist barrierefreier Zugriff in der IT wichtig? | A: Barrierefreier Zugriff ist wichtig, um Gleichberechtigung zu fördern und sicherzustellen, dass niemand aufgrund von körperlichen oder sensorischen Einschränkungen ausgeschlossen wird.
- F: Was ist ein Bildschirmleseprogramm? | A: Ein Bildschirmleseprogramm ist eine Software, die den Inhalt auf dem Bildschirm in gesprochene Sprache oder Brailleschrift übersetzt.
- F: Was sind die Web Content Accessibility Guidelines (WCAG)? | A: Die Web Content Accessibility Guidelines (WCAG) sind Richtlinien, die darauf abzielen, das Web für Menschen mit Behinderungen zugänglicher zu machen.
- F: Warum sind die Web Content Accessibility Guidelines (WCAG) wichtig? | A: Sie bieten klare Standards und Kriterien für die Barrierefreiheit und dienen oft als rechtliche Grundlage in vielen Ländern.
- F: Nenne drei wichtige Bereiche, die von den WCAG-Richtlinien abgedeckt werden. | A: Textalternativen, Zeitgesteuerte Medien, Anpassbarkeit.
- F: Was sind IT-Normen? | A: IT-Normen sind vereinbarte Richtlinien und Spezifikationen für Produkte, Dienstleistungen und Prozesse in der IT.
- F: Warum sind IT-Normen wichtig in der IT-Branche? | A: Sie sind wichtig, um die Interoperabilität, Qualität, und Sicherheit von IT-Systemen sicherzustellen.
- F: Nenne ein Beispiel für eine IT-Norm im Bereich der IT-Sicherheit. | A: Ein Beispiel ist der ISO/IEC 27001-Standard für Informationssicherheitsmanagementsysteme.
- F: Was ist IEEE 802? | A: IEEE 802 ist eine Familie von IT-Normen für Netzwerkstandards, die von der IEEE (Institute of Electrical and Electronics Engineers) entwickelt wurde.
- F: Was ist UTF-8? | A: UTF-8 ist eine weit verbreitete Methode zur Zeichenkodierung, die fast alle menschlichen Sprachen unterstützt.
- F: Was bedeutet das CE-Zeichen in der IT? | A: CE steht für Europäische Konformität und zeigt an, dass das Produkt den geltenden europäischen Standards entspricht.
- F: Was bedeutet das FCC-Zeichen in der IT? | A: FCC steht für US-Bundeskommunikationskommission. Es zeigt an, dass das Produkt den Standards der Kommunikationskommission der USA entspricht.
- F: Was bedeutet das RoHS-Zeichen in der IT? | A: RoHS steht für Beschränkung gefährlicher Stoffe. Es zeigt an, dass das Produkt die EU-Richtlinie erfüllt, die die Verwendung bestimmter gefährlicher Stoffe in Elektro- und Elektronikgeräten einschränkt.
- F: Was bedeutet das Energy Star-Zeichen in der IT? | A: Energy Star ist ein Zeichen für Energieeffizienz. Produkte mit diesem Zeichen erfüllen bestimmte Energieeffizienzstandards.
- F: Warum sind Zertifikate und Kennzeichnungen in der IT wichtig? | A: Sie zeigen an, dass ein Produkt bestimmte Standards in Bezug auf Sicherheit, Umweltschutz und Energieverbrauch erfüllt.
- F: Welche Art von Standards zeigt das CE-Zeichen an? | A: Das CE-Zeichen zeigt an, dass das Produkt den geltenden europäischen Standards für Sicherheit, Gesundheitsschutz und Umweltschutz entspricht.
- F: Was sind Energiekenngrößen? | A: Energiekenngrößen sind spezifische Messwerte, die den Energieverbrauch und die Effizienz von Geräten und Systemen beschreiben.
- F: Nenne zwei Beispiele für Energiekenngrößen. | A: Beispiele für Energiekenngrößen sind der Wirkungsgrad und der Energieverbrauch.
- F: Was ist der Wirkungsgrad als Energiekenngröße? | A: Der Wirkungsgrad gibt an, welcher Anteil der zugeführten Energie in Nutzenergie umgewandelt wird.
- F: Was sagt der Energieverbrauch als Energiekenngröße aus? | A: Der Energieverbrauch gibt an, wie viel Energie ein Gerät oder System benötigt, um seine Funktion auszuführen.
- F: Wie wird der Energieverbrauch von IT-Geräten gemessen? | A: Der Energieverbrauch von IT-Geräten wird in Watt gemessen.
- F: Warum wird der Energieverbrauch von IT-Geräten oft über einen bestimmten Zeitraum betrachtet? | A: Um den Gesamtverbrauch in Kilowattstunden (kWh) zu berechnen.
- F: Was ist Strom in der Elektrotechnik? | A: Strom ist die Fließrate von Elektronen.
- F: Was ist Spannung in der Elektrotechnik? | A: Spannung ist die elektrische Kraft, die den Strom antreibt.
- F: Was ist Leistung in der Elektrotechnik? | A: Leistung ist die Rate, mit der Energie übertragen oder umgewandelt wird.
- F: In welcher Einheit wird elektrischer Strom gemessen? | A: Elektrischer Strom wird in Ampere (A) gemessen.
- F: In welcher Einheit wird elektrische Spannung gemessen? | A: Elektrische Spannung wird in Volt (V) gemessen.
- F: In welcher Einheit wird elektrische Leistung gemessen? | A: Elektrische Leistung wird in Watt (W) gemessen.
- F: Wie ist die Beziehung zwischen Strom, Spannung und Widerstand in einem elektrischen Kreislauf? | A: Sie sind durch das Ohm'sche Gesetz verbunden, das besagt: Strom = Spannung / Widerstand.
- F: Nennen Sie ein Gerät, das zur Messung der elektrischen Spannung verwendet wird. | A: Ein Voltmeter wird zur Messung der elektrischen Spannung verwendet.
- F: Wie lautet die Formel zur Berechnung der elektrischen Leistung? | A: Die Formel zur Berechnung der elektrischen Leistung ist P=I*V.<br />P = Leistung in Watt, I = Strom in Ampere, V = Spannung in Volt
- F: Berechne die Leistung, wenn der Strom 2 Ampere und die Spannung 230 Volt beträgt. | A: Die Leistung beträgt 460 Watt.
- F: Wenn eine Lampe eine Leistung von 60 Watt hat und mit einer Spannung von 230 Volt betrieben wird, wie hoch ist der Strom? | A: Der Strom beträgt etwa 0,26 Ampere.
- F: Wie berechnet man den elektrischen Widerstand in einem Schaltkreis? | A: Der elektrische Widerstand wird mit der Formel R=V/I berechnet, wobei R der Widerstand in Ohm, V die Spannung in Volt und I der Strom in Ampere ist.
- F: Was ist das Ohmsche Gesetz? | A: Das Ohmsche Gesetz ist eine grundlegende Regel in der Elektrotechnik, die den Zusammenhang zwischen Strom, Spannung und Widerstand beschreibt.
- F: Wie wird das Ohmsche Gesetz formuliert? | A: Das Ohmsche Gesetz wird formuliert als U = R * I, wobei U die Spannung, R der Widerstand und I der Strom ist.
- F: Was versteht man unter Leistungsaufnahme? | A: Leistungsaufnahme bezieht sich auf die Menge an elektrischer Energie, die ein elektronisches Gerät aus dem Netz bezieht.
- F: In welcher Einheit wird die Leistungsaufnahme gemessen? | A: Die Leistungsaufnahme wird in Watt gemessen.
- F: Was ist der CO2-Fußabdruck? | A: Der CO2-Fußabdruck ist die Menge an Treibhausgasemissionen, die direkt und indirekt durch eine Aktivität verursacht werden, gemessen als ihre CO2-Äquivalente.
- F: Wie beeinflusst die Leistungsaufnahme von IT-Geräten den CO2-Fußabdruck? | A: Eine höhere Leistungsaufnahme führt zu einem höheren Energieverbrauch, der wiederum einen größeren CO2-Fußabdruck verursacht.
- F: Wie beeinflusst die Nutzung von Cloud-Diensten die Leistungsaufnahme und den CO2-Fußabdruck? | A: Cloud-Dienste können die Leistungsaufnahme und den CO2-Fußabdruck reduzieren, da sie eine effizientere Nutzung von IT-Ressourcen ermöglichen.
- F: Was ist "Green IT" und wie kann es die Leistungsaufnahme von IT-Geräten beeinflussen? | A: Green IT bezeichnet Maßnahmen zur Reduzierung der Umweltauswirkungen der IT, einschließlich der Senkung der Leistungsaufnahme von IT-Geräten.
- F: Wie kann Virtualisierung helfen, die Leistungsaufnahme von IT-Geräten zu reduzieren? | A: Durch Virtualisierung können mehrere virtuelle Maschinen auf einem einzigen physischen Server laufen, wodurch die Gesamtzahl der benötigten physischen Server und damit die Leistungsaufnahme reduziert wird.
- F: Was sind Anschaffungskosten? | A: Anschaffungskosten sind die einmaligen Ausgaben, die für den Kauf eines Produkts oder einer Dienstleistung anfallen.
- F: Wie beziehen sich Anschaffungskosten auf IT-Systeme? | A: Bei IT-Systemen umfassen die Anschaffungskosten den Kaufpreis, Versand, Installation und ähnliche Kosten, die bei der Inbetriebnahme anfallen.
- F: Wie können Anschaffungskosten reduziert werden? | A: Durch den Kauf gebrauchter Hardware, die Nutzung von Open-Source-Software oder die Wahl günstigerer Anbieter.
- F: Was sind Betriebskosten in Bezug auf IT-Systeme? | A: Betriebskosten sind die laufenden Kosten für den Betrieb von IT-Systemen.
- F: Welcher Kostenfaktor gehört zu den Betriebskosten von IT-Systemen? | A: Wartung.
- F: Was ist ein weiterer Kostenfaktor, der zu den Betriebskosten von IT-Systemen gehört? | A: Stromverbrauch.
- F: Warum sind Betriebskosten ein wichtiger Faktor in der IT? | A: Weil sie oft einen großen Anteil an den Gesamtkosten eines IT-Systems ausmachen.
- F: Wie beeinflussen Betriebskosten die Total Cost of Ownership (TCO) in der IT? | A: Betriebskosten sind ein wesentlicher Bestandteil der TCO und können deren Höhe erheblich beeinflussen.
- F: Was sind variable Kosten im Kontext von IT-Systemen? | A: Variable Kosten ändern sich mit der Nutzung des IT-Systems, wie zum Beispiel Stromkosten.
- F: Was sind fixe Kosten im Kontext von IT-Systemen? | A: Fixe Kosten bleiben unabhängig von der Nutzung des IT-Systems gleich, wie zum Beispiel Mietkosten für Räumlichkeiten oder Lizenzgebühren für Software.
- F: Wie wirkt sich eine Erhöhung der Nutzung auf variable Kosten in IT-Systemen aus? | A: Eine Erhöhung der Nutzung führt in der Regel zu einer Erhöhung der variablen Kosten.
- F: Welche Kosten sind im Kontext von Cloud Computing zu berücksichtigen? | A: Im Kontext von Cloud Computing sind Kosten wie Datenspeicherung (oft variabel), Bandbreitennutzung (variabel) und monatliche oder jährliche Abonnementgebühren (fix) zu berücksichtigen.
- F: Was sind Lizenzkosten? | A: Lizenzkosten sind Gebühren, die für die Nutzung von urheberrechtlich geschützter Software oder Technologie bezahlt werden müssen.
- F: Welche Faktoren können die Höhe der Lizenzkosten beeinflussen? | A: Faktoren wie Lizenztyp, Anzahl der Benutzer und Vertragsbedingungen können die Höhe der Lizenzkosten beeinflussen.
- F: Wie können Unternehmen Lizenzkosten reduzieren? | A: Unternehmen können Lizenzkosten reduzieren, indem sie beispielsweise Open-Source-Software nutzen oder Mengenrabatte für Mehrbenutzerlizenzen nutzen.
- F: Was ist eine Volumenlizenz? | A: Eine Volumenlizenz ist eine Lizenz, die es Unternehmen erlaubt, eine Software auf einer bestimmten Anzahl von Computern zu installieren.
- F: Was sind Finanzierungskosten? | A: Finanzierungskosten sind die Kosten, die mit der Beschaffung von Kapital für Projekte verbunden sind.
- F: Welche Arten von Kosten können zu den Finanzierungskosten gehören? | A: Zinsen für Kredite, Gebühren für Finanzierungsdienstleistungen und Kosten für die Erstellung von Sicherheiten.
- F: Was bedeutet "Leasing" im Kontext von IT-Ressourcen? | A: Beim Leasing werden IT-Ressourcen für einen bestimmten Zeitraum vom Leasinggeber zur Verfügung gestellt. Die Kosten werden meist in monatlichen Raten gezahlt.
- F: Was bedeutet "Kauf" im Kontext von IT-Ressourcen? | A: Beim Kauf erwerbt ein Unternehmen die IT-Ressourcen und besitzt diese dann vollständig. Die Kosten werden sofort in voller Höhe gezahlt.
- F: Was bedeutet "Miete" im Kontext von IT-Ressourcen? | A: Bei der Miete werden IT-Ressourcen für einen bestimmten Zeitraum gemietet. Wie beim Leasing werden die Kosten in monatlichen Raten gezahlt, allerdings ist die Mietdauer oft flexibler.
- F: Was bedeutet "Pay-per-use" im Kontext von IT-Ressourcen? | A: Pay-per-use bezieht sich auf ein Modell, bei dem Unternehmen nur für die Nutzung der IT-Ressourcen zahlen, die sie tatsächlich verbrauchen.
- F: Welcher Faktor ist wichtig bei der Entscheidung zwischen Leasing, Kauf, Miete und Pay-per-use? | A: Die Gesamtkosten über die Nutzungsdauer der IT-Ressourcen.
- F: Was bedeutet Auslastung, Anpassungsfähigkeit und Erweiterbarkeit im Kontext von IT-Systemen? | A: Auslastung bezieht sich auf die Menge der genutzten Ressourcen. Anpassungsfähigkeit ist die Fähigkeit eines Systems, sich an veränderte Anforderungen anzupassen. Erweiterbarkeit bezeichnet die Möglichkeit, das System durch zusätzliche Ressourcen oder Funktionen zu erweitern.
- F: Warum sind Zukunftssicherheit und Erweiterbarkeit wichtige Faktoren bei der Auswahl von IT-Systemen? | A: Zukunftssicherheit und Erweiterbarkeit sind wichtig, da sie sicherstellen, dass das System auch in Zukunft den Anforderungen gerecht wird. Sie erlauben es, das System bei Bedarf zu erweitern oder zu aktualisieren, ohne dass eine komplette Neubeschaffung notwendig ist.
- F: Was bedeutet das Preis-Leistungs-Verhältnis in Bezug auf IT-Systeme? | A: Das Preis-Leistungs-Verhältnis bezieht sich auf den Vergleich der Kosten eines IT-Systems mit den gebotenen Funktionen und Vorteilen. Ein gutes Preis-Leistungs-Verhältnis bedeutet, dass das System seinen Preis in Bezug auf die gebotene Leistung rechtfertigt.
- F: Wie kann das Preis-Leistungs-Verhältnis bei der Auswahl von IT-Systemen analysiert werden? | A: Das Preis-Leistungs-Verhältnis kann durch den Vergleich der Kosten mit den spezifischen Anforderungen, Funktionen, Leistung, Support und Qualität des Systems analysiert werden. Bewertungen, Benchmarks und die Berücksichtigung von Total Cost of Ownership (TCO) können hilfreich sein.
- F: Was unterscheidet den qualitativen von einem quantitativen Angebotsvergleich? | A: Der qualitative Angebotsvergleich berücksichtigt subjektive und schwer messbare Faktoren wie Qualität und Markenreputation, während der quantitative Angebotsvergleich objektive und messbare Faktoren wie Preis, Geschwindigkeit oder Kapazität berücksichtigt.
- F: Wie wird ein qualitativer Angebotsvergleich in Bezug auf IT-Systeme durchgeführt? | A: Ein qualitativer Angebotsvergleich analysiert Faktoren wie Benutzerfreundlichkeit, Kundenservice, Flexibilität, Anpassungsfähigkeit und Qualität des Designs. Es kann durch Benutzerbewertungen, Fachexpertise und persönliche Einschätzungen erfolgen.
- F: Wie wird ein quantitativer Angebotsvergleich in Bezug auf IT-Systeme durchgeführt? | A: Ein quantitativer Angebotsvergleich betrachtet messbare Faktoren wie Preis, Leistung, Spezifikationen und Kapazität. Es beinhaltet den direkten Vergleich dieser Zahlen und kann durch Tabellen, Diagramme und spezifische Metriken visualisiert werden.
- F: Warum ist ein kombinierter qualitativer und quantitativer Angebotsvergleich wichtig bei der Auswahl von IT-Systemen? | A: Ein kombinierter Ansatz ermöglicht eine ganzheitliche Bewertung, die sowohl objektive als auch subjektive Kriterien berücksichtigt. Dies hilft, das bestmögliche System auszuwählen, das sowohl den technischen Anforderungen als auch den spezifischen Bedürfnissen des Unternehmens entspricht.
- F: Was ist eine Nutzwertanalyse, und wie wird sie im Kontext von IT-Systemen verwendet? | A: Die Nutzwertanalyse ist eine Methode zur Bewertung und Vergleich von Alternativen basierend auf mehreren Kriterien. In der IT wird sie verwendet, um verschiedene Systeme oder Lösungen anhand von Faktoren wie Kosten, Leistung, Qualität und anderen relevanten Aspekten zu vergleichen.
- F: Wie wird die Nutzwertanalyse bei der Auswahl von IT-Systemen durchgeführt? | A: Die Nutzwertanalyse wird durchgeführt, indem die relevanten Kriterien identifiziert, gewichtet und bewertet werden. Die Alternativen werden dann anhand dieser Kriterien verglichen, um diejenige zu identifizieren, die den größten Nutzen bietet.
- F: Welche Vorteile bietet die Nutzwertanalyse bei der Auswahl und Bewertung von IT-Systemen? | A: Die Nutzwertanalyse bietet eine strukturierte und objektive Methode, um komplexe Entscheidungen zu treffen. Sie hilft, die wichtigsten Faktoren zu identifizieren, fördert die Transparenz im Entscheidungsprozess und unterstützt eine fundierte Auswahl, die den Geschäftszielen entspricht.

## Quiz

? Ein Router leitet Datenpakete zwischen ____________.
* verschiedenen Netzwerken
- Endgeräten desselben Netzwerks.
- Switches in einem VLAN.
- Zwei Wireless Access Points.

? Was bedeutet ein /24 in der CIDR-Notation?
* Ein /24 in der CIDR-Notation bedeutet, dass die ersten 24 Bits der IP-Adresse das Netzwerksegment identifizieren.
- Die ersten 24 Bits der IP-Adresse identifizieren den Host.
- Die letzten 24 Bits der IP-Adresse identifizieren das Netzwerk.
- Die IP-Adresse hat nur 24 Bits.

? In welcher Einheit wird elektrische Leistung gemessen?
* Elektrische Leistung wird in Watt (W) gemessen.
- In Volt (V).
- In Ampere (A).
- In Ohm (Ω).

? Was ist ein Gateway?
* Ein Gateway ist der Übergang zwischen Netzwerken, oft mit unterschiedlichen Protokollen oder Adressbereichen (z. B. Standardgateway ins Internet).
- Ein Gateway ist der Übergang zwischen Netzwerken, oft mit unterschiedlichen Protokollen oder Adressbereichen.
- Ein Gateway ist ein Gerät zur Verstärkung des WLAN-Signals.
- Ein Gateway ist ein Switch mit mehr als 24 Ports.

? Welche Arten von Leitungen werden typischerweise für die Datenübertragung mit einem Modem verwendet?
* Telefon- oder Kabelleitungen.
- Ausschließlich Stromleitungen (Powerline).
- Ausschließlich Funkverbindungen.
- Ausschließlich Patchkabel (Cat 6).

? Warum sind IT-Normen wichtig in der IT-Branche?
* Sie sind wichtig, um die Interoperabilität, Qualität, und Sicherheit von IT-Systemen sicherzustellen.
- Sie legen die Preise für IT-Produkte fest.
- Sie ersetzen Verträge zwischen Unternehmen.
- Sie sind nur für Hersteller relevant und haben keine Wirkung.

? Was bedeutet das CE-Zeichen in der IT?
* CE steht für Europäische Konformität und zeigt an, dass das Produkt den geltenden europäischen Standards entspricht.
- CE steht für Computer Equipment.
- CE bedeutet, dass das Produkt in Europa hergestellt wurde.
- CE bedeutet, dass das Produkt besonders umweltfreundlich ist.

? Welcher Kostenfaktor gehört zu den Betriebskosten von IT-Systemen?
* Wartung.
- Anschaffung.
- Entwicklung.
- Planung.

? Was ist Leistung in der Elektrotechnik?
* Leistung ist die Rate, mit der Energie übertragen oder umgewandelt wird.
- Die Menge an gespeicherter Energie in einem Akku.
- Die Kraft, die einen Strom antreibt.
- Die Widerstandsfähigkeit eines Bauteils.

? Was ist die Hauptfunktion von NAT?
* NAT ermöglicht es, private IP-Adressen in öffentliche IP-Adressen umzuwandeln und umgekehrt.
- NAT verschlüsselt Datenpakete zwischen zwei Netzwerken.
- NAT vergibt dynamisch IP-Adressen an Clients.
- NAT löst Hostnamen in IP-Adressen auf.

? Wie ist die Beziehung zwischen Strom, Spannung und Widerstand in einem elektrischen Kreislauf?
* Sie sind durch das Ohm'sche Gesetz verbunden, das besagt: Strom = Spannung / Widerstand.
- Strom = Spannung × Widerstand.
- Strom = Widerstand / Spannung.
- Strom = Spannung + Widerstand.

? Auf welcher Grundlage trifft eine Firewall ihre Entscheidungen zur Kontrolle des Netzwerkverkehrs?
* Basierend auf einer definierten Sicherheitsrichtlinie.
- Basierend auf der Auslastung des Netzwerks.
- Basierend auf dem Alter der IP-Adressen.
- Basierend auf der Länge der Datenpakete.

? Was ist eine Variable Length Subnet Mask (VLSM)?
* VLSM ermöglicht die Verwendung verschiedener Subnetzmasken innerhalb desselben Netzwerks.
- Alle Subnetze müssen dieselbe Subnetzmaske haben.
- VLSM verbindet mehrere Netzwerke zu einem einzigen.
- VLSM ist ein Protokoll zur Namensauflösung.

? Wie leitet ein Switch Datenpakete weiter?
* Ein Switch leitet Datenpakete basierend auf der MAC-Adresse der Geräte weiter.
- Ein Switch leitet Pakete anhand der IP-Adresse weiter.
- Ein Switch sendet jedes Paket an alle Ports (Broadcast).
- Ein Switch leitet Pakete anhand der Portnummer weiter.

? Wofür wird ein Modem hauptsächlich verwendet?
* Es wird hauptsächlich verwendet, um eine Internetverbindung über den Internetdienstanbieter (ISP) zu ermöglichen.
- Um Datenpakete zwischen mehreren Netzwerken zu routen.
- Um IP-Adressen an Clients zu verteilen.
- Um den Netzwerkverkehr zu filtern.

? Was ist Spannung in der Elektrotechnik?
* Spannung ist die elektrische Kraft, die den Strom antreibt.
- Der Widerstand, der den Stromfluss begrenzt.
- Die Menge an Energie, die pro Sekunde verbraucht wird.
- Die Strommenge, die in einer Sekunde fließt.

? Was versteht man unter Leistungsaufnahme?
* Leistungsaufnahme bezieht sich auf die Menge an elektrischer Energie, die ein elektronisches Gerät aus dem Netz bezieht.
- Die Menge an Daten, die ein Gerät pro Sekunde überträgt.
- Die Lebensdauer eines Gerätes bis zum Ausfall.
- Die Kosten für den Betrieb eines Geräts.

? Was sind Finanzierungskosten?
* Finanzierungskosten sind die Kosten, die mit der Beschaffung von Kapital für Projekte verbunden sind.
- Kosten für den Kauf von Hardware.
- Löhne für IT-Mitarbeiter.
- Kosten für den Betrieb der Systeme.

? Warum sind Betriebskosten ein wichtiger Faktor in der IT?
* Weil sie oft einen großen Anteil an den Gesamtkosten eines IT-Systems ausmachen.
- Weil sie nur einen unwesentlichen Anteil ausmachen.
- Weil sie bei der Anschaffung bereits vollständig bezahlt sind.
- Weil sie nur für Cloud-Systeme anfallen.

? Wenn ein Netzwerk die Adresse 192.168.1.0/24 hat, was ist die Subnetzmaske?
* Die Subnetzmaske ist 255.255.255.0.
- 255.255.0.0
- 255.255.255.128
- 255.255.255.240
