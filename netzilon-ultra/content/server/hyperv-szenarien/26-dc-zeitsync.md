---
id: server-hvsz-26
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 26 – DC-VM geht falsch: Zeitsynchronisation Host vs. Domänenhierarchie
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-integrationsdienste, az800-adds-dc, az800-fsmo, server-hvsz-27]
---

## Profi

### Ticket
**Kunde meldet:** „Seit heute Morgen können sich mehrere Benutzer nicht mehr anmelden, Outlook fragt ständig nach dem Kennwort. Die Uhr auf den Clients geht ein paar Minuten falsch.“
- **Priorität:** hoch (Anmeldung betroffen)
- **Betroffene Maschine:** virtueller Domänencontroller **DC01** (PDC-Emulator) auf **HV01**

### Ausgangslage
- Hyper-V-Host **HV01.example.com** (Windows Server 2025), Mitglied der Domäne example.com, IP 192.168.10.11
- VM **DC01** (Server 2025, Gen 2), IP 192.168.10.10, Inhaber der FSMO-Rolle **PDC-Emulator**
- Clients und Server synchronisieren ihre Zeit nach der **Domänenhierarchie** (NT5DS) vom DC.
- Integrationsdienst **Zeitsynchronisierung** (Time Synchronization) ist an DC01 aktiv (Standard).

### Analyse
- Kerberos toleriert standardmäßig nur **5 Minuten** Zeitabweichung (Richtlinie „Maximale Toleranz für die Synchronisation der Computeruhr“). Darüber schlagen Anmeldungen fehl.
- In DC01 zeigt `w32tm /query /source` die Quelle **„VM IC Time Synchronization Provider“** – der DC holt sich die Zeit vom **Host** statt von einer verlässlichen externen Quelle.
- HV01 ist aber selbst Domänenmitglied und bezieht seine Zeit vom **DC01** → **Zirkelbezug**: Host ↔ DC stimmen sich gegenseitig ab, niemand hat eine echte Referenz, die Uhr driftet.
- Microsoft-Empfehlung für virtuelle DCs: Die Domänenzeit kommt aus der **AD-Hierarchie**; der **PDC-Emulator der Stammdomäne** synchronisiert mit einer **externen NTP-Quelle**. Der Hyper-V-Zeitanbieter (VMICTimeProvider) soll im laufenden Betrieb **nicht** die Zeit des DCs bestimmen.

### Lösungsweg
1. **Zeitanbieter im Gast deaktivieren** (empfohlene Variante): In DC01 den Registrierungswert `HKLM\SYSTEM\CurrentControlSet\Services\W32Time\TimeProviders\VMICTimeProvider\Enabled` auf **0** setzen. *Begründung:* Der Integrationsdienst bleibt aktiv, sodass die Uhr beim Start bzw. nach dem Wiederherstellen aus dem gespeicherten Zustand noch korrigiert werden kann, aber W32Time nutzt den Host nicht mehr als laufende Zeitquelle.
2. **Alternative:** Integrationsdienst **Zeitsynchronisierung** am Host für DC01 deaktivieren. *Begründung:* einfach per GUI, aber dann fehlt auch die Korrektur nach „Speichern/Wiederherstellen“.
3. **PDC-Emulator an externe Quelle hängen:** `w32tm /config /manualpeerlist:"ptbtime1.ptb.de,0x8 ptbtime2.ptb.de,0x8" /syncfromflags:manual /reliable:yes /update`. *Begründung:* Die Hierarchie braucht oben eine zuverlässige Referenz.
4. **Dienst neu starten und neu synchronisieren:** `Restart-Service w32time`, `w32tm /resync /rediscover`. *Begründung:* Änderungen werden erst nach Neustart des Dienstes aktiv.
5. **Host HV01 bleibt NT5DS** (Domänenhierarchie). *Begründung:* So fließt die Zeit sauber von oben nach unten: extern → PDC → DCs → Mitglieder (inkl. Host).

### Ergebnis prüfen
- DC01: `w32tm /query /source` → `ptbtime1.ptb.de` (nicht mehr VM IC Provider).
- DC01: `w32tm /query /status` → Stratum, letzte erfolgreiche Synchronisierung.
- Client: `w32tm /query /source` → `DC01.example.com`; `w32tm /stripchart /computer:DC01.example.com /samples:3` zeigt nur Millisekunden Abweichung.
- Anmeldung funktioniert wieder, keine neuen Kerberos-Fehler (Zeitabweichung, KRB_AP_ERR_SKEW) im System-Protokoll.

### Vorbeugung
- Vorlage/Checkliste „Neuer virtueller DC“: VMICTimeProvider deaktivieren bzw. Zeitsync prüfen.
- Bei Verschieben der PDC-Rolle die externe Zeitquelle auf dem **neuen** PDC einrichten (und am alten zurücksetzen: `w32tm /config /syncfromflags:domhier /update`).
- Überwachung: Zeitabweichung per `w32tm /monitor` oder Monitoring-Tool.
- Hosts **nie** ihre Zeit vom DC beziehen lassen, während der DC vom Host synchronisiert.

## Einfach
Stell dir eine Schule vor. Alle Klassen richten ihre Uhr nach der **Schuluhr im Sekretariat** (das ist der Domänencontroller). Damit niemand zu früh oder zu spät kommt, ist es wichtig, dass die Schuluhr stimmt.

Jetzt passiert etwas Dummes: Die Sekretärin stellt ihre Uhr nach dem **Hausmeister** (dem Hyper-V-Host). Der Hausmeister stellt seine Uhr aber nach der **Sekretärin**! Keiner der beiden schaut je auf eine echte Funkuhr. So geht ihre Uhr langsam immer falscher – und alle Klassen gehen mit falsch.

Irgendwann ist der Unterschied so groß (mehr als 5 Minuten), dass der **Türsteher Kerberos** sagt: „Deine Eintrittskarte hat eine komische Uhrzeit, du kommst nicht rein!“ Und schon kann sich niemand mehr anmelden.

Die Lösung:
- Die Sekretärin hört auf, beim Hausmeister zu gucken (Zeitanbieter vom Host abschalten).
- Sie stellt ihre Uhr nach einer **offiziellen Funkuhr** im Internet (externer NTP-Server, z. B. von der PTB in Braunschweig).
- Alle anderen – auch der Hausmeister – richten sich wieder nach der Schuluhr.

Dann gibt es eine klare Reihenfolge von oben nach unten und keinen Kreis mehr.

## Merksatz
- Zeit fließt von **oben nach unten**: Extern → PDC-Emulator → DCs → Mitglieder.
- Virtueller DC: **VMICTimeProvider aus** (oder Zeitsync-Dienst aus).
- Kerberos: **5 Minuten** Toleranz.
- `w32tm /query /source` sagt dir, **woher** die Zeit kommt.

## Prüfungsfalle
- Nur den Host mit NTP zu versorgen, reicht nicht, wenn der Host selbst Domänenmitglied ist und seine Zeit vom DC holt → Zirkel.
- Die externe Zeitquelle gehört auf den **PDC-Emulator der Stammdomäne**, nicht auf jeden DC.
- Den Integrationsdienst komplett abschalten verhindert auch die Zeitkorrektur nach dem Wiederherstellen aus dem gespeicherten Zustand – Microsoft beschreibt daher das Deaktivieren des **Zeitanbieters im Gast** als feinere Variante.
- `/reliable:yes` gehört auf den PDC, damit er sich als zuverlässige Zeitquelle ankündigt.

## Grafik
### Zirkelbezug vs. saubere Hierarchie
1. HV01 -> DC01: Integrationsdienst liefert Hostzeit (VM IC Provider)
2. DC01 -> HV01: Host holt Zeit per NT5DS vom DC – Kreis geschlossen
3. Uhr: Abweichung wächst auf über 5 Minuten
4. Kerberos -> Client: Ticket abgelehnt, Anmeldung scheitert
5. Admin -> DC01: VMICTimeProvider Enabled = 0
6. NTP-Server -> DC01: PDC-Emulator synchronisiert extern
7. DC01 -> HV01, Clients: Zeit fließt die Hierarchie hinunter

## Lab
**Nachstellen:** Zirkelbezug erzeugen, dann sauber beheben. Maschinen: **HV01** (Host, Domänenmitglied), **DC01** (VM, PDC-Emulator).

### GUI
1. **HV01**: Hyper-V-Manager → DC01 → Einstellungen → **Integrationsdienste** → Haken bei **Zeitsynchronisierung** gesetzt lassen (Fehlerzustand).
2. **DC01**: Eingabeaufforderung → `w32tm /query /source` → „VM IC Time Synchronization Provider“ notieren.
3. **DC01**: Registrierungs-Editor → `HKLM\SYSTEM\CurrentControlSet\Services\W32Time\TimeProviders\VMICTimeProvider` → **Enabled** = 0.
4. **DC01**: Dienste-Konsole → **Windows-Zeitgeber** → Neu starten.
5. **DC01**: Eingabeaufforderung → externe Quelle mit `w32tm /config …` setzen (siehe PowerShell).
6. **HV01**: Eingabeaufforderung → `w32tm /query /source` → muss DC01 zeigen.

### PowerShell
```powershell
# Auf HV01 – Status des Integrationsdienstes ansehen
Get-VMIntegrationService -VMName DC01 | Where-Object Name -match "Zeit|Time"

# Auf DC01 – Fehlerbild prüfen
w32tm /query /source

# Auf DC01 – Hyper-V-Zeitanbieter deaktivieren (Integrationsdienst bleibt an)
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\W32Time\TimeProviders\VMICTimeProvider" -Name Enabled -Value 0

# Auf DC01 – PDC-Emulator an externe NTP-Quelle
w32tm /config /manualpeerlist:"ptbtime1.ptb.de,0x8 ptbtime2.ptb.de,0x8" /syncfromflags:manual /reliable:yes /update
Restart-Service w32time
w32tm /resync /rediscover
w32tm /query /source

# Alternative auf HV01 – Integrationsdienst komplett abschalten
Get-VMIntegrationService -VMName DC01 | Where-Object Name -match "Zeit|Time" | Disable-VMIntegrationService

# Auf HV01 – Kontrolle der Host-Zeitquelle
w32tm /query /source
```

## Reihenfolge
### Zeit am virtuellen PDC reparieren
1. Fehlerbild prüfen mit w32tm /query /source
2. VMICTimeProvider im Gast deaktivieren
3. Externe NTP-Peers am PDC-Emulator konfigurieren
4. Windows-Zeitdienst neu starten
5. Resync auslösen
6. Quelle auf DC, Host und Clients kontrollieren

## Szenario
### Kontrollfragen
Die VM DC01 auf HV01 ist PDC-Emulator. `w32tm /query /source` auf DC01 zeigt „VM IC Time Synchronization Provider“, HV01 bezieht seine Zeit per NT5DS von DC01.
- F: Warum ist diese Konstellation problematisch? | A: Zirkelbezug – Host und DC synchronisieren sich gegenseitig, keine echte Referenz, die Uhr driftet.
- F: Ab welcher Abweichung scheitert Kerberos standardmäßig? | A: Ab mehr als 5 Minuten.
- F: Welche feinere Lösung empfiehlt Microsoft statt den Integrationsdienst ganz abzuschalten? | A: Im Gast den Zeitanbieter VMICTimeProvider deaktivieren (Registry Enabled = 0).
- F: Welche Maschine bekommt die externe NTP-Quelle? | A: Der PDC-Emulator der Stammdomäne (hier DC01).
- F: Mit welchem Befehl prüfst du die aktuelle Zeitquelle? | A: w32tm /query /source

## Legende
### VMICTimeProvider
- Was: Zeitanbieter von W32Time im Gast, der die Zeit über den Hyper-V-Integrationsdienst vom Host bezieht.
- Wie: Registry-Wert Enabled unter W32Time\TimeProviders\VMICTimeProvider (1 = an, 0 = aus).
- Wann: Auf virtuellen DCs (vor allem PDC-Emulator) deaktivieren.
- Wo: Im Gastbetriebssystem der DC-VM.
- Warum: Die Domänenzeit soll aus der AD-Hierarchie kommen, nicht vom Host.
### Domänenzeithierarchie
- Was: Zeitkette extern → PDC-Emulator der Stammdomäne → DCs → Mitglieder.
- Wie: W32Time im Modus NT5DS (domhier) auf Mitgliedern, manuelle Peers auf dem PDC.
- Warum: Kerberos braucht eine einheitliche Uhrzeit (Toleranz 5 Minuten).

## Karteikarten
- F: Welche Zeittoleranz hat Kerberos standardmäßig? | A: 5 Minuten.
- F: Wie heißt der Hyper-V-Zeitanbieter im Gast? | A: VMICTimeProvider („VM IC Time Synchronization Provider“).
- F: Wo wird der VMICTimeProvider deaktiviert? | A: HKLM\SYSTEM\CurrentControlSet\Services\W32Time\TimeProviders\VMICTimeProvider, Wert Enabled = 0.
- F: Welcher DC braucht eine externe Zeitquelle? | A: Der PDC-Emulator der Stammdomäne.
- F: Befehl für externe Zeitquelle am PDC? | A: w32tm /config /manualpeerlist:"server,0x8" /syncfromflags:manual /reliable:yes /update
- F: Wie prüfst du, woher ein Rechner seine Zeit hat? | A: w32tm /query /source
- F: Was ist der Nachteil, den Integrationsdienst Zeitsynchronisierung komplett abzuschalten? | A: Die Uhr wird nach Start/Wiederherstellen aus gespeichertem Zustand nicht mehr vom Host korrigiert.
- F: Welchen Modus nutzen Domänenmitglieder für die Zeit? | A: NT5DS – Domänenhierarchie.
- F: Was muss nach dem Verschieben der PDC-Rolle passieren? | A: Externe Zeitquelle am neuen PDC einrichten, alten auf domhier zurücksetzen.

## Quiz
? DC01 (PDC-Emulator) zeigt als Zeitquelle „VM IC Time Synchronization Provider“. Was ist die empfohlene Korrektur?
* VMICTimeProvider im Gast deaktivieren und den PDC an eine externe NTP-Quelle hängen
- Den Host HV01 an DC01 synchronisieren lassen
- Die Kerberos-Toleranz auf 60 Minuten erhöhen
- Den Integrationsdienst Takt (Heartbeat) deaktivieren
! Die Domänenzeit muss aus der AD-Hierarchie kommen; oben steht der PDC-Emulator mit externer Quelle.

? Welche Zeitabweichung toleriert Kerberos standardmäßig?
* 5 Minuten
- 30 Sekunden
- 15 Minuten
- 1 Stunde
! Wird die Toleranz überschritten, schlagen Ticketanforderungen fehl.

? Welcher Befehl zeigt die aktuelle Zeitquelle eines Rechners?
* w32tm /query /source
- w32tm /resync /force
- net time /querysntp
- Get-Date -Source
! /query /source zeigt die aktive Quelle, z. B. einen DC oder den VM IC Provider.

? Warum entsteht ein Zirkelbezug, wenn der Domänen-Host seine Zeit vom virtuellen DC holt?
* Weil der DC per Integrationsdienst wiederum die Zeit vom Host übernimmt
- Weil der Host keine BIOS-Uhr hat
- Weil NT5DS nur in Arbeitsgruppen funktioniert
- Weil die VM zu wenig Arbeitsspeicher hat
! Beide stimmen sich gegenseitig ab, keiner hat eine echte Referenz.

? Welcher DC sollte mit `/reliable:yes` und manueller Peerliste konfiguriert werden?
* Der PDC-Emulator der Stammdomäne
- Jeder RODC
- Der Infrastrukturmaster jeder Domäne
- Der DC mit den meisten Benutzern
! Er ist die Spitze der Domänenzeithierarchie.

? Was bleibt erhalten, wenn man nur den VMICTimeProvider deaktiviert, den Integrationsdienst aber anlässt?
* Die Zeitkorrektur beim Start bzw. nach Wiederherstellen aus dem gespeicherten Zustand
- Die laufende Synchronisation mit dem Host jede Minute
- Die Kerberos-Toleranz von 10 Minuten
- Der Heartbeat zum Cluster
! Microsoft beschreibt diese Variante, damit die Uhr nach dem Wiederherstellen noch korrigiert wird.

? Wo deaktiviert man den Integrationsdienst Zeitsynchronisierung per GUI?
* Hyper-V-Manager → VM-Einstellungen → Integrationsdienste
- Server-Manager → Lokaler Server → Zeitzone
- Active Directory-Standorte und -Dienste → NTDS Settings
- Gruppenrichtlinienverwaltung → Default Domain Policy
! Die Integrationsdienste werden pro VM in deren Einstellungen geschaltet.

? Welchen Modus nutzt ein normales Domänenmitglied für die Zeitsynchronisation?
* NT5DS (Domänenhierarchie)
- NTP mit manueller Peerliste
- NoSync
- AllSync mit dem Host
! Mitglieder folgen der Hierarchie, nur der PDC der Stammdomäne nutzt eine manuelle Peerliste.
