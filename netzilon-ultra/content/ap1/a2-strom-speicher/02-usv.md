---
id: ap1-a2-usv
bereich: AP1
block: A2
kapitel: Strom & Speicher
titel: USV – Unterbrechungsfreie Stromversorgung
stufe: Fortgeschritten
quellen: [USV_Aufgabe_Winter_2010.pdf, USV_phys_Kenngrößen_Winter_2018.pdf]
verweise: [ap1-a2-netzteil, ap1-a2-backup, az801-azure-backup]
---

## Profi

### Zweck
Eine **USV** (Unterbrechungsfreie Stromversorgung, engl. UPS – Uninterruptible Power Supply) schützt IT-Systeme vor **Netzstörungen**: Stromausfall, Unter-/Überspannung, Spannungsspitzen, Frequenzschwankungen, Oberschwingungen. Sie überbrückt Ausfälle mit Akkus, bis ein Notstromaggregat anläuft oder die Server **kontrolliert heruntergefahren** werden (über USB/Netzwerkkarte und Software wie APC PowerChute, NUT). Ohne USV drohen Datenverlust, beschädigte Dateisysteme/Datenbanken und Hardwareschäden.

### Klassifizierung nach IEC 62040-3
| Klasse | Bezeichnung | Funktionsweise | Umschaltzeit | Schutz |
|---|---|---|---|---|
| **VFD** | Offline / Standby (Voltage and Frequency Dependent) | Verbraucher hängen **direkt am Netz**. Fällt es aus, schaltet ein Umschalter auf den **Wechselrichter** (Akku) um. | ca. 2–10 ms | nur Stromausfall; Ausgang abhängig von Netzspannung und -frequenz |
| **VI** | Line-Interactive (Voltage Independent) | Wie Offline, zusätzlich **AVR** (Automatic Voltage Regulation, Spannungsregelung per Transformator) mit Steuerlogik; Wechselrichter läuft teils mit. | ca. 2–4 ms | Ausfall + Unter-/Überspannung; Frequenz bleibt netzabhängig |
| **VFI** | Online / Doppelwandler (Voltage and Frequency Independent) | Strom fließt **immer** über **Gleichrichter → Zwischenkreis/Akku → Wechselrichter**. Der Ausgang wird ständig neu erzeugt. | **0 ms** | vollständig: Ausfall, Spannung, Frequenz, Spitzen, Oberschwingungen |

**Abbildungen erkennen (Prüfungsaufgabe)**:
1. Eingang → Block „**AVR, Umschalter**“ → Ausgang, darunter Ladeteil, **Steuerlogik**, Wechselrichter, Batterie → **VI** (Line-Interactive).
2. Eingang → **Umschalter** → Ausgang, darunter nur Ladeteil, Batterie, Wechselrichter → **VFD** (Offline).
3. Eingang → **Gleichrichter → DC/DC-Wandler (Batterie) → Wechselrichter** → Ausgang, dazu **statischer Bypass** und **Service-Bypass** → **VFI** (Online).

**Bypass**: Der **statische Bypass** schaltet bei Überlast oder Defekt der Elektronik automatisch direkt aufs Netz. Der **Service-Bypass** (manuell) ermöglicht Wartung/Akkutausch ohne Abschalten der Verbraucher.

### VFI – Vor- und Nachteile
| Vorteile | Nachteile |
|---|---|
| Keine Umschaltzeit (0 ms) | höherer Anschaffungspreis |
| Ausgang unabhängig von Netzspannung und -frequenz → sauberer Sinus | geringerer Wirkungsgrad (Doppelwandlung → 5–10 % Verlust, Wärme, höhere Stromkosten; Eco-Modus als Kompromiss) |
| Schutz vor allen Netzstörungen | Lüftergeräusche, Klimatisierung nötig |
| Ideal für Server, Rechenzentren, empfindliche Geräte | höherer Verschleiß durch Dauerbetrieb |

### Leistungsangaben: VA und W
- **Scheinleistung S** in **VA** (Voltampere) = U × I.
- **Wirkleistung P** in **W** = S × **Leistungsfaktor (cos φ)**.
- Beispiel: USV 1500 VA mit Leistungsfaktor 0,9 → 1350 W. Bei der Auswahl beide Werte prüfen. In AP1-Aufgaben wird oft **W = VA** vereinfacht angenommen (Hinweis in der Aufgabe beachten).

### Überbrückungszeit berechnen (Prüfungsaufgabe)
**Gegeben**: 2 Server mit je 700 W Netzteil; USV mit 4 Akkus à **100 Ah** und **12 V**; Akkus voll, vollständige Entladung, keine Verluste, Volllast.

| Schritt | Rechnung | Ergebnis |
|---|---|---|
| 1. Angeschlossene Leistung P | 2 × 700 W | **1400 W (VA)** |
| 2. Gesamte Ladungsmenge Q | 4 × 100 Ah | **400 Ah** |
| 3. Energie W = Q × U | 400 Ah × 12 V | **4800 Wh** |
| 4. Überbrückungszeit t = W / P | 4800 Wh ÷ 1400 W | 3,4286 h |
| 5. Umrechnen | 0,4286 h × 60 | 25,7 min |
| | **abgerundet** | **3 h 25 min** |

**Wichtig**: Diese Annahme gilt nur, wenn die Akkus **parallel** geschaltet sind bzw. die Aufgabe die Spannung mit 12 V vorgibt. Bei **Reihenschaltung** addieren sich die Spannungen (4 × 12 V = 48 V), die Kapazität bleibt 100 Ah → Energie ebenfalls 4800 Wh. Die Energie ist in beiden Fällen gleich.

**Praxis-Einschränkungen**: Akkus sollten nicht vollständig entladen werden (Lebensdauer), Wandlerverluste (Wirkungsgrad ca. 85–95 %), Alterung (Kapazität sinkt), Temperatur; reale Server ziehen selten dauerhaft die volle Netzteilleistung. Hersteller geben Laufzeittabellen an.

### Planung und Betrieb
- Dimensionierung: Summe der Verbraucher + Reserve (ca. 20–30 %).
- Nur kritische Geräte anschließen (Laserdrucker nicht – hohe Einschaltströme).
- **Kommunikation**: USV meldet Stromausfall per USB/SNMP; Shutdown-Skripte fahren Hyper-V-Hosts, VMs und Server in der richtigen Reihenfolge herunter.
- Regelmäßige **Akkutests** und Tausch alle 3–5 Jahre (Blei-Gel), Lithium-Ionen hält länger.
- Ergänzend: **Notstromaggregat** für lange Ausfälle, **Überspannungsschutz**.

## Einfach

Stell dir vor, du spielst am PC und plötzlich **fällt der Strom aus** – alles weg, nicht gespeichert! Eine **USV** ist wie eine **Powerbank für den Computer**: Wenn der Strom aus der Steckdose weg ist, springt sofort ein großer Akku ein.

Es gibt drei Sorten:

1. **Offline-USV (VFD)** – der **Ersatzspieler auf der Bank**: Normalerweise bekommt der PC seinen Strom direkt aus der Steckdose. Fällt der Strom aus, springt der Ersatzspieler (Akku) ein. Das dauert ein paar Millisekunden – meistens merkt der PC das nicht, manchmal aber doch.

2. **Line-Interactive-USV (VI)** – der **Ersatzspieler, der auch mitdenkt**: Er schaut ständig, ob der Strom zu schwach oder zu stark ist, und gleicht das aus (wie ein Wasserhahn, der den Druck regelt). Nur bei echtem Ausfall springt der Akku ein.

3. **Online-USV (VFI)** – der **Spieler, der immer auf dem Platz ist**: Der Strom fließt **immer** durch den Akku-Kreis. Der PC hängt sozusagen nie direkt an der Steckdose. Fällt der Strom aus, merkt er **gar nichts** – null Umschaltzeit. Das ist das Beste, aber teurer und verbraucht selbst etwas mehr Strom.

**Wie lange hält der Akku?** Das rechnest du wie beim Handy:
1. Wie viel Strom brauchen die Geräte? (2 Server × 700 W = 1400 W)
2. Wie viel „Saft“ ist in den Akkus? (4 × 100 Ah = 400 Ah)
3. Mal die Spannung ergibt die Energie: 400 Ah × 12 V = 4800 Wh
4. Energie geteilt durch Verbrauch = Zeit: 4800 ÷ 1400 ≈ 3,43 Stunden
5. Die 0,43 Stunden mal 60 = etwa 25 Minuten → **3 Stunden 25 Minuten**

In echt hält es kürzer, weil kein Akku perfekt ist – aber in der Prüfung rechnet man ohne Verluste.

## Merksatz
- **VFD** = **D**epends → Offline, abhängig vom Netz.
- **VI** = **I**ndependent von der Spannung → Line-Interactive mit AVR.
- **VFI** = **F**requency **I**ndependent → Online, Doppelwandler, 0 ms.
- Überbrückungszeit: **Q × U = W**, dann **W ÷ P = t**.
- Nachkommastelle × 60 = Minuten, **abrunden**!

## Prüfungsfalle
- VA ist nicht automatisch W (Leistungsfaktor), außer die Aufgabe sagt es.
- Dezimalstunden nicht als Minuten lesen: 3,43 h ≠ 3 h 43 min!
- Ah ist Ladung, Wh ist Energie – erst mit U multiplizieren.
- „Abrunden auf volle Minuten“ beachten.
- VFI-Nachteil ist der **Wirkungsgrad**, nicht die Umschaltzeit.

## Grafik
### Drei USV-Typen im Stromfluss
Drei Schaltbilder nebeneinander. Gelbe Stromteilchen fließen vom Eingang zum Ausgang. Knopf „Stromausfall“: Bei VFD/VI stockt der Fluss kurz (Umschaltblitz, Zeitanzeige 2–10 ms), bei VFI fließt er ohne Unterbrechung weiter.

### Überbrückungszeit-Rechner
Eingabefelder für Verbraucher (W), Anzahl Akkus, Ah, V; die vier Rechenschritte erscheinen nacheinander mit Einheiten; Ergebnis als Uhr, die rückwärts läuft.

### Zuordnungsspiel
Die drei Prüfungsabbildungen werden gemischt; per Drag & Drop VFD/VI/VFI zuordnen.

## Karteikarten
- F: Wofür steht USV? | A: Unterbrechungsfreie Stromversorgung (UPS).
- F: Welche Norm klassifiziert USV-Anlagen? | A: IEC 62040-3 (EN 62040-3).
- F: Was bedeutet VFD? | A: Voltage and Frequency Dependent – Offline-/Standby-USV.
- F: Was bedeutet VI? | A: Voltage Independent – Line-Interactive-USV mit Spannungsregelung (AVR).
- F: Was bedeutet VFI? | A: Voltage and Frequency Independent – Online-/Doppelwandler-USV.
- F: Umschaltzeit einer VFI-USV? | A: 0 ms – Verbraucher laufen permanent über den Wechselrichter.
- F: Zwei Vorteile und zwei Nachteile VFI? | A: Vorteile: keine Umschaltzeit, Schutz vor allen Netzstörungen. Nachteile: teurer, geringerer Wirkungsgrad/mehr Abwärme.
- F: Formel Energie aus Akku? | A: W = Q × U (Ah × V = Wh).
- F: Formel Überbrückungszeit? | A: t = W / P.
- F: 2 Server à 700 W, 4 Akkus à 100 Ah/12 V – Überbrückungszeit? | A: 4800 Wh / 1400 W = 3,43 h ≈ 3 h 25 min.
- F: Was ist ein statischer Bypass? | A: Automatische Umgehung der USV-Elektronik bei Überlast/Defekt direkt aufs Netz.

## Quiz
? Welche USV-Klasse hat keine Umschaltzeit?
* VFI
- VFD
- VI
- Alle haben 0 ms

? Eine USV hat 2 Akkus à 50 Ah bei 12 V. Die Last beträgt 400 W. Wie lange hält sie theoretisch?
* 3 Stunden
- 30 Minuten
- 1 Stunde 30 Minuten
- 6 Stunden

? Ein Schaltbild zeigt Eingang, AVR mit Umschalter, Steuerlogik, Ladeteil, Batterie und Wechselrichter. Welche Klasse ist das?
* VI (Line-Interactive)
- VFD (Offline)
- VFI (Online)
- Keine USV

? Was ist ein Nachteil der Online-USV?
* Geringerer Wirkungsgrad durch Doppelwandlung
- Lange Umschaltzeit
- Kein Schutz bei Spannungsschwankungen
- Keine Akkus vorhanden

? 3,75 Stunden entsprechen…
* 3 Stunden 45 Minuten
- 3 Stunden 75 Minuten
- 3 Stunden 7 Minuten
- 4 Stunden 15 Minuten

? Wofür steht die Abkürzung VFI bei USV-Anlagen?
* Voltage and Frequency Independent
- Very Fast Interrupt
- Voltage Filter Integrated
- Variable Frequency Inverter
! VFI = Online-USV, Ausgang unabhängig von Netzspannung und -frequenz.

? Warum sollte eine USV mit dem Server per USB oder Netzwerk kommunizieren?
* Damit der Server bei niedrigem Akkustand automatisch herunterfährt
- Damit die USV Updates aus dem Internet lädt
- Damit der Server schneller startet
- Damit die Akkus schneller laden
! Kontrollierter Shutdown verhindert Datenverlust.

? Eine USV wird mit 1500 VA und 900 W angegeben. Was ist für die Auswahl entscheidend?
* Beide Werte dürfen von der Last nicht überschritten werden.
- Nur der VA-Wert zählt.
- Nur die Akkukapazität zählt.
- Die Werte sind Werbung ohne Bedeutung.
! Wirkleistung (W) und Scheinleistung (VA) müssen ausreichen.
