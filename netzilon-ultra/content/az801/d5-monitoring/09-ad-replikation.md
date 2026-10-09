---
id: az801-ad-replikation
bereich: AZ-801
block: A10
kapitel: Monitoring und Troubleshooting
titel: AD-Replikation
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-dsrm-sysvol, az801-ad-papierkorb, az800-standorte-replikation, az801-netzwerk-troubleshooting]
---

## Profi

### Grundlagen
**AD-Replikation** **gleicht** **die AD-Datenbank** **zwischen DCs** **ab** (**Multi-Master**: **jeder DC** **nimmt** **Änderungen** **an**).

| Begriff | Erklärung |
|---|---|
| **KCC** (*Knowledge Consistency Checker*) | **Erzeugt** **Replikationstopologie** **automatisch** **(alle 15 Minuten)** |
| **Verbindungsobjekt** (*Connection Object*) | **Eingehende** **Replikationsverbindung** **zwischen DCs** |
| **USN** (*Update Sequence Number*) | **Zähler** **pro DC** **für** **Änderungen** |
| **Up-to-dateness-Vektor** | **Bis wohin** **Änderungen** **von** **welchem DC** **bekannt** |
| **Namenskontext** (*Naming Context*) | **Schema**, **Konfiguration**, **Domäne**, **DNS-Anwendungspartitionen** |
| **Standort** (*Site*) | **Gruppe** **gut** **verbundener** **Subnetze** |
| **Standortverknüpfung** (*Site Link*) | **Verbindung** **zwischen Standorten** **(Kosten, Intervall, Zeitplan)** |
| **Bridgehead-Server** | **DC**, **der** **Standort-übergreifend** **repliziert** |

### Intrasite vs. Intersite
| Merkmal | **Intrasite** | **Intersite** |
|---|---|---|
| **Auslöser** | **Benachrichtigung** **nach** **15 s** **(Änderungsbenachrichtigung)** | **Zeitplan** **(Standard 180 Minuten, Minimum 15)** |
| **Kompression** | **Nein** | **Ja** |
| **Topologie** | **Ring** **(max. 3 Hops)** | **Standortverknüpfungen** **(kostenbasiert)** |
| **Transport** | **RPC** | **RPC über IP** |
| **Kritische Änderungen** | **Sofort** **(Kontosperrung, Kennwort, RID-Master)** | **Sofort** **(dringend)** **bei** **Kennwort/Kontosperrung** |

### Wichtige Fehlerquellen
| Fehler | Ursache |
|---|---|
| **DNS** | **DC** **findet** **Partner** **nicht** **(SRV-Einträge, GUID-CNAME)** |
| **Netzwerk/Firewall** | **Ports** **blockiert** |
| **Zeitabweichung** | **> 5 Minuten** **(Kerberos)** |
| **Berechtigungen** | **Konto/Computerkonto** **fehlerhaft** |
| **Sekundärer Kanal** | **Beschädigter** **Secure Channel** |
| **Standort/Subnetz** | **Falsch** **zugewiesen** |
| **Tombstone-Lebensdauer** | **DC** **war** **länger** **offline** **(> 180 Tage)** |
| **Lingering Objects** | **„Zombie-Objekte“** **nach** **Offline-DC** |
| **USN-Rollback** | **Snapshot-Rücksetzung** |
| **Datenträger voll** | **NTDS-Volume** |

**Ports**: **DNS 53**, **Kerberos 88**, **LDAP 389**, **SMB 445**, **RPC 135 + dynamisch (49152–65535)**, **Globaler Katalog 3268**.

### Diagnose-Werkzeuge
| Werkzeug | Zweck |
|---|---|
| `repadmin /replsummary` | **Übersicht** **Fehler** **je DC** |
| `repadmin /showrepl` | **Detail** **pro DC** |
| `repadmin /syncall /AdeP` | **Alle Partner** **synchronisieren** |
| `repadmin /kcc` | **KCC** **neu** **berechnen** |
| `repadmin /queue` | **Ausstehende Änderungen** |
| `repadmin /showobjmeta` | **Metadaten** **eines Objekts** |
| `dcdiag /test:replications` | **Replikationstest** |
| `dcdiag /v` | **Vollständige** **Diagnose** |
| `Get-ADReplicationFailure` | **Fehler** **per PowerShell** |
| `Get-ADReplicationPartnerMetadata` | **Partner** **und** **Zeit** |
| `Sync-ADObject` | **Einzelnes Objekt** **sofort** **replizieren** |

```powershell
# Auf DC01
repadmin /replsummary
repadmin /showrepl * /csv | ConvertFrom-Csv | Where-Object 'Number of Failures' -gt 0
dcdiag /test:replications /test:dns /test:services

Get-ADReplicationFailure -Target DC01
Get-ADReplicationPartnerMetadata -Target * -Scope Domain | Select-Object Server, Partner, LastReplicationSuccess, LastReplicationResult

# Manuell replizieren
repadmin /syncall DC01 /AdeP
Sync-ADObject -Object "CN=Anna Meier,OU=Vertrieb,DC=exa,DC=local" -Source DC01 -Destination DC02

# Lingering Objects prüfen/entfernen
repadmin /removelingeringobjects DC02 <GUID von DC01> "DC=exa,DC=local" /advisory_mode
repadmin /removelingeringobjects DC02 <GUID von DC01> "DC=exa,DC=local"

# Standortverknüpfung anpassen
Set-ADReplicationSiteLink -Identity "DEFAULTIPSITELINK" -ReplicationFrequencyInMinutes 15 -Cost 100
New-ADReplicationSite -Name "Berlin"
New-ADReplicationSubnet -Name "10.20.0.0/24" -Site "Berlin"
```

### Tombstone und Lingering Objects
- **`tombstoneLifetime`** **=** **180 Tage** **(Standard)**.
- **DC**, **der** **länger** **offline** **war**: **Neuinstallation**/**Metadatenbereinigung**, **nicht** **einfach** **wieder** **online**.
- **Strikte Replikationskonsistenz** (*Strict Replication Consistency*): **Blockiert** **Replikation** **mit** **veralteten** **DCs**.

### Metadatenbereinigung
**Nach Ausfall eines DCs**: **ADUC/ADSI** **oder** `ntdsutil` → `metadata cleanup`; **DNS-Einträge** **und** **Standort** **bereinigen**; **FSMO-Rollen** **ggf.** **übernehmen** (`Move-ADDirectoryServerOperationMasterRole -Force`).

## Lab
**Maschinen**: **DC01**, **DC02**.

### GUI
1. **DC01**: **Server-Manager → Tools → Active Directory-Standorte und -Dienste**.
2. **DC01**: **Sites → Default-First-Site-Name → Servers → DC01 → NTDS Settings** **öffnen**.
3. **DC01**: **Eingehende Verbindung** **prüfen** **→ Rechtsklick → Jetzt replizieren**.
4. **DC01**: **Eingabeaufforderung → `repadmin /replsummary`**.
5. **DC01**: **`dcdiag /test:replications`**.
6. **DC01**: **Standortverknüpfung DEFAULTIPSITELINK → Eigenschaften → Intervall 15** **setzen**.
7. **DC01**: **Neuen Standort „Berlin“ + Subnetz** **anlegen** **und** **DC02** **verschieben**.

## Einfach

**AD-Replikation** **ist wie eine Rundmail** **an alle Filialen**: **Wenn** **in** **Filiale A** **jemand** **entlassen** **wird**, **muss** **das** **auch** **Filiale B** **erfahren**. **In** **einem Gebäude** **(Site)** **wird** **sofort** **geflüstert**. **Zwischen** **Städten** **wird** **nach Fahrplan** **(alle 3 Stunden)** **ein Brief** **geschickt**.

**Fehler** **entstehen**, **wenn** **die** **Telefonbücher** **(DNS)** **falsch sind**, **die Uhren** **nicht** **gleich gehen** **oder** **eine Filiale** **zu lange** **geschlossen** **war**.

## Merksatz
- **Intrasite = 15 s Benachrichtigung**, **Intersite = 180 min**.
- **KCC = Landkarten-Zeichner**.
- **repadmin /replsummary** **zuerst**.
- **Fehler = DNS, Zeit, Firewall**.
- **Tombstone 180 Tage** **= Frist**.
- **Lingering Objects = Zombies**.
- **Sofort-Replikation**: **Kennwort, Sperre, RID-Master**.

## Prüfungsfalle
- **Intersite** **nutzt** **Zeitplan**, **kein** **Benachrichtigungs-Auslöser**.
- **DC** **> 180 Tage** **offline** **=** **nicht** **wieder** **online** **nehmen**.
- **DNS-Fehler** **sind** **häufigste** **Ursache**.
- **Subnetz** **nicht** **einem** **Standort** **zugewiesen** **→** **falscher DC**.
- **`repadmin /syncall`** **erzwingt**, **repariert** **aber** **keine** **Ursache**.
- **Multi-Master**, **außer** **FSMO-Rollen** **(Single-Master)**.
- **Globaler Katalog** **repliziert** **Teilmengen** **aller Domänen**.

## Grafik
### Rundmail
Filialen in einem Gebäude flüstern, Filialen in Städten senden Briefe.

### Standortverknüpfung
Zwei Standorte, Linie mit Kosten und Intervall.

### Ports
Tafel mit 53, 88, 389, 445, 135 und 3268.

## Karteikarten
- F: Was macht der KCC? | A: Erzeugt die Replikationstopologie automatisch.
- F: Wie oft repliziert Intrasite? | A: Nach 15 Sekunden per Änderungsbenachrichtigung.
- F: Wie oft repliziert Intersite standardmäßig? | A: Alle 180 Minuten (Minimum 15).
- F: Welches Tool zeigt Replikationsfehler? | A: repadmin /replsummary.
- F: Was ist ein Lingering Object? | A: Gelöschtes Objekt, das auf einem verspäteten DC noch existiert.
- F: Wie lange ist die Tombstone-Lebensdauer? | A: 180 Tage.
- F: Welches Cmdlet zeigt Replikationsfehler in PowerShell? | A: Get-ADReplicationFailure.
- F: Wie repliziert man ein einzelnes Objekt sofort? | A: Sync-ADObject.
- F: Welcher Port ist für den Globalen Katalog? | A: 3268.

## Quiz
? Wie oft repliziert Intersite standardmäßig?
* Alle 180 Minuten
- Alle 15 Sekunden
- Alle 24 Stunden
- Nie

? Welches Tool zeigt eine Übersicht aller Replikationsfehler?
* repadmin /replsummary
- gpresult
- netdom
- nltest

? Häufigste Ursache für Replikationsfehler?
* DNS-Fehler
- Falsche Bildschirmauflösung
- Zu viele Benutzer
- Kein Papierkorb

? Ein DC war 200 Tage offline. Was tun?
* Neuinstallation und Metadatenbereinigung
- Einfach online nehmen
- Snapshot zurücksetzen
- Funktionsebene anheben

? Womit repliziert man ein einzelnes AD-Objekt sofort?
* Sync-ADObject
- Get-ADObject
- Restore-ADObject
- Move-ADObject

? Was erzeugt automatisch die Replikationstopologie?
* KCC
- DFS-R
- BITS
- WSUS
