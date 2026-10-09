---
id: az800-dhcp-failover
bereich: AZ-800
block: A7
kapitel: Netzwerkinfrastruktur
titel: DHCP-Hochverfügbarkeit – Failover (Lastenausgleich & Hot Standby), MCLT, Split-Scope
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn, Netzwerkinfrastruktur_mit_Windows_Server_2016_implementieren_70-741.pdf]
verweise: [az800-dhcp, az800-ipam, ap1-a5-dhcp]
---

## Profi

### Optionen für DHCP-Hochverfügbarkeit
| Methode | Prinzip | Bewertung |
|---|---|---|
| **DHCP-Failover** (ab 2012) | zwei Server teilen **denselben Bereich** und replizieren **Leases** | **empfohlen**, einfach |
| **Split-Scope** (Legacy) | Bereich aufgeteilt (meist **80/20**) auf zwei Server, keine Lease-Synchronisation | veraltet, Adressverschwendung |
| **Failovercluster** | DHCP-Rolle im Cluster mit gemeinsamem Speicher | aufwendig, Single Storage |
DHCP-Failover gilt **nur für IPv4**. DHCPv6 → meist zustandslos (kein Lease-Status nötig) oder Split-Scope.

### DHCP-Failover – Eckdaten
- **Genau zwei** Server pro Failoverbeziehung (Partner); ein Server kann aber mehrere Beziehungen zu verschiedenen Partnern haben (bis 31).
- Pro Beziehung beliebig viele **Bereiche**; ein Bereich gehört zu **höchstens einer** Beziehung.
- Kommunikation über **TCP 647**, abgesichert mit **gemeinsamem geheimen Schlüssel** (*Shared Secret*, Nachrichtenauthentifizierung).
- **Uhrzeit** beider Server muss synchron sein (max. ±1 Minute), sonst schlägt Failover fehl.
- Bereichs**optionen und Reservierungen** werden beim Einrichten übertragen, **Änderungen danach nicht automatisch** → **Bereich replizieren** (*Replicate Scope/Relationship*) oder `Invoke-DhcpServerv4FailoverReplication`.
- Serveroptionen (auf Serverebene) werden **nicht** repliziert.

### Modi
| | **Lastenausgleich** (*Load Balance*, Standard) | **Hot Standby** |
|---|---|---|
| Aktiv | beide Server gleichzeitig | nur **aktiver** Server; Standby nur bei Ausfall |
| Verteilung | **Prozentsatz** (Standard 50/50), Zuordnung per Hash der Client-MAC | **Reserveprozentsatz** (Standard **5 %**) der Adressen für den Standby |
| Typischer Einsatz | beide Server am **selben Standort** | **Zentraler Standby** für mehrere **Außenstellen** (Hub-and-Spoke) |

### Zeitparameter und Zustände
- **MCLT** (*Maximum Client Lead Time*, Standard **1 Stunde**): maximale Zeit, um die ein Server eine Lease über das dem Partner bekannte Ende hinaus verlängern darf; im Ausfallfall vergibt der verbleibende Server neue Leases zunächst nur mit **MCLT** als Dauer. Nach **Partnerausfall** übernimmt der verbleibende Server den **gesamten** Adresspool erst **nach Ablauf der MCLT**.
- **Zustandswechselintervall** (*State Switchover Interval*, optional, z. B. 60 Min.): wechselt nach Kommunikationsverlust **automatisch** von *Kommunikation unterbrochen* nach *Partner ausgefallen*. Ohne diese Option muss ein Admin den Zustand **manuell** setzen.
- **Zustände**: *Normal* → *Kommunikation unterbrochen* (*Communication Interrupted*; beide vergeben weiter aus ihrem Anteil bzw. Standby aus Reserve) → *Partner ausgefallen* (*Partner Down*; nach MCLT ganzer Pool) → *Wiederherstellung* (*Recover*) → *Normal*.

### Split-Scope (Legacy, zum Verständnis)
Server 1: gesamter Bereich, **Ausschluss** der oberen 20 %; Server 2: gleicher Bereich, Ausschluss der unteren 80 %. Server 2 mit **Verzögerung** antworten lassen (Eigenschaften → Erweitert → Subnetzverzögerung). Keine Lease-Kenntnis zwischen den Servern.

### Troubleshooting
- Failover-Assistent schlägt fehl → Zeit abweichend, Partner nicht autorisiert, TCP 647 blockiert, Bereich existiert auf Partner schon.
- Optionen unterschiedlich → **Replikation** anstoßen.
- Nach Wiederanlauf: Partner synchronisiert Leases (Zustand *Recover*).

## Lab
**Maschinen**: **DC01** (example.com), **DHCP01** (192.168.10.20, Bereich 192.168.10.0 vorhanden), **DHCP02** (192.168.10.21, DHCP-Rolle installiert und autorisiert, **ohne** Bereich), **CL01**.

### GUI
1. **DHCP01** und **DHCP02**: `w32tm /query /status` → Zeit synchron zur Domäne.
2. **DHCP01**: DHCP-Konsole → Bereich 192.168.10.0 → Kontextmenü **Failover konfigurieren**.
3. Partnerserver hinzufügen: **DHCP02**.
4. Beziehungsname `DHCP01-DHCP02`, **MCLT 1:00**, Modus **Lastenausgleich** 50/50, **Zustandswechselintervall aktivieren: 60 Minuten**, **gemeinsamer geheimer Schlüssel** `Netz!lon2026` → Fertig stellen.
5. **DHCP02**: Bereich 192.168.10.0 ist erschienen (inkl. Optionen/Reservierungen).
6. **DHCP01**: Bereichsoption 015 ändern → Bereich → **Bereich replizieren** → auf DHCP02 prüfen.
7. **DHCP01**: Dienst stoppen → **CL01**: `ipconfig /renew` → Lease von DHCP02 (Adressleases dort prüfen).
8. **DHCP02**: IPv4 → Eigenschaften → **Failover** → Beziehung → Zustand „Kommunikation unterbrochen“ → nach Intervall „Partner ausgefallen“.
9. **DHCP01**: Dienst starten → Zustand kehrt über „Wiederherstellung“ zu „Normal“ zurück.
10. Variante: Beziehung löschen, neu mit **Hot Standby**, DHCP02 als Standby, Reserve 5 %.

### PowerShell
```powershell
# Auf DHCP01 und DHCP02 – Zeit prüfen
w32tm /query /status

# Auf DHCP02 – Rolle + Autorisierung (falls noch nicht)
Install-WindowsFeature DHCP -IncludeManagementTools
Add-DhcpServerInDC -DnsName DHCP02.example.com -IPAddress 192.168.10.21

# Auf DHCP01 – Failover Lastenausgleich
Add-DhcpServerv4Failover -Name "DHCP01-DHCP02" -PartnerServer DHCP02.example.com -ScopeId 192.168.10.0 `
  -LoadBalancePercent 50 -MaxClientLeadTime 01:00:00 -AutoStateTransition $true -StateSwitchInterval 01:00:00 `
  -SharedSecret "Netz!lon2026" -Force

# Alternative: Hot Standby (DHCP02 Standby, 5 % Reserve)
Add-DhcpServerv4Failover -Name "HQ-Standby" -PartnerServer DHCP02.example.com -ScopeId 192.168.30.0 `
  -ServerRole Active -ReservePercent 5 -MaxClientLeadTime 01:00:00 -SharedSecret "Netz!lon2026" -Force

# Weiteren Bereich zur Beziehung hinzufügen
Add-DhcpServerv4FailoverScope -Name "DHCP01-DHCP02" -ScopeId 192.168.20.0

# Änderungen replizieren und Status prüfen
Invoke-DhcpServerv4FailoverReplication -Name "DHCP01-DHCP02" -Force
Get-DhcpServerv4Failover | Format-List Name,Mode,State,LoadBalancePercent,MaxClientLeadTime,PartnerServer

# Partner manuell als ausgefallen markieren (ohne automatisches Intervall)
Set-DhcpServerv4Failover -Name "DHCP01-DHCP02" -PartnerDown

# Firewall prüfen
Test-NetConnection DHCP02.example.com -Port 647
```

## Einfach

Ein einzelner DHCP-Server ist wie **eine einzige Hotelrezeption** – ist die Rezeptionistin krank, bekommt kein Gast ein Zimmer.

**DHCP-Failover** = **zwei Rezeptionen mit einem gemeinsamen Gästebuch**. Beide wissen immer, welches Zimmer schon vergeben ist (Leases werden abgeglichen).

Zwei Arbeitsweisen:
- **Lastenausgleich** = beide Rezeptionen arbeiten **gleichzeitig**, jede bedient ungefähr die **Hälfte** der Gäste.
- **Hot Standby** = eine arbeitet, die andere **sitzt bereit** und hat nur ein paar Notfallschlüssel (5 %). Fällt die erste aus, springt sie ein. Gut, wenn **eine Zentrale** viele **Filialen** absichert.

**MCLT** = eine **Sicherheitspause** (Standard 1 Stunde): Fällt der Partner aus, verteilt die übrig gebliebene Rezeption zunächst nur **kurze Mietverträge** und übernimmt das **ganze Hotel** erst nach dieser Wartezeit. So werden keine Zimmer doppelt vergeben.

Wichtig:
- **Genau zwei** Partner.
- Beide brauchen **dieselbe Uhrzeit**.
- Ändert man später etwas (z. B. DNS-Option), muss man **„Replizieren“** klicken – sonst weiß der Partner nichts davon.
- Früher hat man das Hotel mit der **80/20-Regel** aufgeteilt – heute nicht mehr nötig.

## Merksatz
- Failover = **2 Server**, **IPv4**, **TCP 647**, **Shared Secret**.
- **Lastenausgleich** 50/50 (Standard) – **Hot Standby** 5 % Reserve.
- **MCLT** Standard **1 Stunde**.
- Änderungen → **replizieren**!
- Zeit **synchron** (±1 Minute).
- Split-Scope **80/20** = Legacy.

## Prüfungsfalle
- DHCP-Failover funktioniert nicht für DHCPv6.
- Mehr als zwei Server in einer Failoverbeziehung sind nicht möglich.
- Optionsänderungen werden nicht automatisch repliziert.
- Serveroptionen werden nie repliziert – auf beiden Servern setzen.
- Ohne Zustandswechselintervall bleibt der Server in „Kommunikation unterbrochen“ bis zum manuellen Eingriff.
- Zeitdifferenz über 1 Minute verhindert Failover.

## Grafik
### Gemeinsames Gästebuch
Zwei Rezeptionen, dazwischen ein Buch, in dem sich beide Einträge spiegeln (TCP 647, Schloss = Shared Secret).

### Zwei Modi
Links beide Rezeptionen bedienen je eine Warteschlange (50/50). Rechts eine arbeitet, die andere hält fünf Notfallschlüssel; erste fällt um → zweite springt ein.

### MCLT-Sanduhr
Partner fällt aus; Sanduhr „1 Stunde“ läuft; währenddessen nur kurze Leases; Sanduhr leer → ganzer Adresspool leuchtet für den verbleibenden Server.

## Karteikarten
- F: Wie viele Server gehören zu einer DHCP-Failoverbeziehung? | A: Genau zwei.
- F: Welche Modi hat DHCP-Failover? | A: Lastenausgleich und Hot Standby.
- F: Standardverteilung bei Lastenausgleich? | A: 50/50.
- F: Standardreserve bei Hot Standby? | A: 5 %.
- F: Was ist die MCLT, Standardwert? | A: Maximum Client Lead Time, Standard 1 Stunde.
- F: Welcher Port wird für Failover verwendet? | A: TCP 647.
- F: Unterstützt DHCP-Failover IPv6? | A: Nein, nur IPv4.
- F: Wann Hot Standby statt Lastenausgleich? | A: Zentraler Reserveserver für mehrere Standorte.
- F: Was tun nach Änderung einer Bereichsoption? | A: Bereich/Beziehung replizieren (Invoke-DhcpServerv4FailoverReplication).
- F: Wozu dient das Zustandswechselintervall? | A: Automatischer Wechsel in den Zustand „Partner ausgefallen“.
- F: Verteilung beim Legacy-Split-Scope? | A: 80/20.

## Quiz
? Ein zentraler DHCP-Server soll als Reserve für drei Außenstellen-DHCP-Server dienen. Welcher Modus?
* Hot Standby
- Lastenausgleich 50/50
- Split-Scope 80/20
- Failovercluster

? Nach einer Änderung von Option 006 auf DHCP01 erhalten Clients von DHCP02 noch den alten DNS-Server. Lösung?
* Failover-Replikation für den Bereich ausführen
- DHCP02 neu autorisieren
- MCLT verlängern
- Failover in Hot Standby ändern

? Welche Voraussetzung gilt für DHCP-Failover?
* Die Uhrzeit beider Server muss synchron sein
- Beide Server müssen DCs sein
- Beide Server brauchen gemeinsamen Speicher
- Es werden mindestens drei Server benötigt

? DHCP01 ist ausgefallen. Wann nutzt DHCP02 den gesamten Adresspool?
* Nach Wechsel in „Partner ausgefallen“ und Ablauf der MCLT
- Sofort nach dem Ausfall
- Nach 8 Tagen Leasedauer
- Nie, nur seinen Anteil

? Hochverfügbarkeit für DHCPv6-Adressvergabe soll geplant werden. Was gilt?
* DHCP-Failover unterstützt DHCPv6 nicht
- DHCP-Failover mit Lastenausgleich
- DHCP-Failover mit Hot Standby
- Superscope mit IPv6

? Welcher Failover-Modus verteilt Anfragen standardmäßig 50:50 auf zwei Server?
* Lastenausgleich (Load Balance)
- Hot Standby
- Split-Scope
- Superbereich
! Das Verhältnis ist anpassbar.

? Wofür steht MCLT?
* Maximum Client Lead Time – Zeitraum, um den ein Partner Leases über die bekannte Zeit hinaus verlängern darf
- Minimum Client Lease Time
- Multicast Lease Table
- Managed Client License Type
! Nach Ablauf im Zustand „Partner ausgefallen“ übernimmt der Partner den ganzen Pool.

? Wie viele Partner kann ein DHCP-Bereich im Failover haben?
* Genau einen
- Bis zu zehn
- Beliebig viele
- Zwei bei IPv6
! Ein Server kann aber mit verschiedenen Partnern für verschiedene Bereiche Failover-Beziehungen haben.
