---
id: az800-standorte-replikation
bereich: AZ-800
block: A7
kapitel: AD DS on-premises & Cloud
titel: AD-Standorte, Subnetze & Replikation
stufe: Profi
quellen: [Identitätsmanagement_mit_Windows_Server_2016_70-742.pdf, AZ-800 Study Guide]
verweise: [ap1-a6-adds, az800-dcs-azure, az801-ad-replikation, az800-rodc]
---

## Profi

### Logisch vs. physisch
Domänen und OUs bilden die **logische** Struktur. **Standorte (Sites)** bilden die **physische** Netzwerktopologie ab: Gruppen von **gut verbundenen** IP-Subnetzen (schnelles LAN), getrennt durch **langsame/teure** WAN-Verbindungen. Ein Standort kann mehrere Domänen enthalten, eine Domäne über mehrere Standorte reichen.

### Wozu Standorte?
1. **DC-Lokalisierung**: Clients finden per DNS (standortspezifische SRV-Records `_ldap._tcp.<Standort>._sites.dc._msdcs.<Domäne>`) einen DC **im eigenen Standort** → schnelle Anmeldung, weniger WAN-Last.
2. **Replikationssteuerung**: innerhalb eines Standorts sofort, zwischen Standorten gebündelt, komprimiert und zeitgesteuert.
3. **Standortbezogene Dienste**: GPOs an Standorte verknüpfen, DFS-Namespaces/Referrals, SYSVOL, Exchange-Routing.
Die Zuordnung Client → Standort erfolgt über seine **IP-Adresse** und die **Subnetz-Objekte**. Unbekannte Subnetze landen im Protokoll `%SystemRoot%\debug\netlogon.log` („NO_CLIENT_SITE“).

### Objekte in „AD-Standorte und -Dienste“ (`dssite.msc`)
| Objekt | Zweck |
|---|---|
| **Standort** | Standardstandort **Default-First-Site-Name** (umbenennbar) |
| **Subnetz** | IP-Bereich (CIDR), einem Standort zugeordnet |
| **Standortverknüpfung** (Site Link) | verbindet Standorte; Eigenschaften **Kosten**, **Replikationsintervall** (Standard **180 Min.**, min. 15), **Zeitplan**; Standard **DEFAULTIPSITELINK** |
| **Standortverknüpfungsbrücke** | fasst Verknüpfungen zusammen (Transitivität); standardmäßig alle Verknüpfungen **transitiv** („Alle Standortverknüpfungen überbrücken“) |
| **Server** / **NTDS Settings** | DCs des Standorts, Verbindungsobjekte |
| **Bevorzugter Bridgeheadserver** | DC, der die standortübergreifende Replikation übernimmt (optional festlegen) |

### Replikation
AD verwendet **Multimasterreplikation** mit **Pull**-Prinzip: DCs holen Änderungen von Partnern. Grundlage: **USN** (Update Sequence Number, Zähler pro DC), **Hochwassermarke** und **Up-to-date-Vektor** (verhindern doppelte Übertragungen), **Versionsnummer + Zeitstempel** pro Attribut für **Konfliktauflösung** (höhere Version gewinnt, dann neuerer Zeitstempel).

**Innerhalb eines Standorts (intrasite)**
- **Änderungsbenachrichtigung**: Der geänderte DC benachrichtigt Partner nach **15 Sekunden**, jeden weiteren nach 3 Sekunden.
- **Unkomprimiert**, sofort; Topologie: **Ring** mit Querverbindungen, sodass jeder DC max. **3 Hops** entfernt ist.
- **Dringende Replikation** (sofort): Kontosperrungen, Änderungen an Kontosperrungs-/Kennwortrichtlinien, RID-Master-Änderungen, Kennwortänderungen (werden sofort an den **PDC-Emulator** gesendet).

**Zwischen Standorten (intersite)**
- Über **Bridgeheadserver**, nach **Zeitplan/Intervall** der Standortverknüpfung, **komprimiert** (ab 32 KB).
- Wahl des Pfads über die **niedrigsten Gesamtkosten**.
- Protokoll: **IP (RPC)**; SMTP ist veraltet.
- Optional **Änderungsbenachrichtigung** auch standortübergreifend aktivieren (Attribut `options` der Verknüpfung) – z. B. für Azure bei guter Verbindung.

**KCC** (Knowledge Consistency Checker) – Dienst auf jedem DC, erstellt **automatisch die Verbindungsobjekte** (Replikationstopologie) alle 15 Minuten; der **ISTG** (Intersite Topology Generator) je Standort plant die standortübergreifende Topologie. Manuelle Verbindungsobjekte sind möglich, aber selten nötig.

**SYSVOL** wird separat per **DFS-R** repliziert (eigene Topologie folgt den AD-Verbindungsobjekten).

### Standorte planen
- Pro physischem Standort mit DC einen AD-Standort; Standorte **ohne DC** trotzdem anlegen und ggf. mit Subnetzen versehen (Clients nutzen dann den „nächsten“ Standort per Kosten – **Automatic Site Coverage**).
- **Alle Subnetze** (inkl. VPN-, WLAN-, Azure-VNet-Bereiche) einem Standort zuordnen.
- Kosten nach Bandbreite/Preis: niedrig = bevorzugt (z. B. 100 Hauptleitung, 200 Backup).
- Intervalle nicht kleiner als die Verbindung verträgt; Zeitplan für schwache Leitungen (z. B. nachts).

### Replikation überwachen
`repadmin /replsummary` (Überblick, Fehler), `repadmin /showrepl` (Partner/letzte Replikation), `repadmin /syncall /AdeP` (alles sofort synchronisieren), `repadmin /queue`, `dcdiag /test:replications`, `Get-ADReplicationFailure`, `Get-ADReplicationPartnerMetadata`, Ereignisanzeige → **Verzeichnisdienst**. Details und Fehlerbehebung → AZ-801 „AD-Replikation“.

## Lab
**Maschinen**: DC01 (192.168.1.1, Zentrale), DC02 (192.168.20.2, Filiale) – zwei Subnetze über einen Router.

### GUI
1. **DC01**: `dssite.msc` → Sites → **Default-First-Site-Name** umbenennen in **Zentrale**.
2. Rechtsklick **Sites** → Neuer Standort → **Filiale** → Verknüpfung DEFAULTIPSITELINK.
3. **Subnets** → Neues Subnetz → `192.168.1.0/24` → Zentrale; `192.168.20.0/24` → Filiale.
4. **Inter-Site Transports → IP** → neue Standortverknüpfung **Zentrale-Filiale** (beide Standorte) → Eigenschaften: **Kosten 100**, **Replizieren alle 15 Minuten**, **Zeitplan ändern** (z. B. 8–18 Uhr alle, sonst ebenfalls).
5. Zentrale → Servers → **DC02** → Rechtsklick **Verschieben** → Filiale (falls er nicht automatisch dort gelandet ist).
6. Filiale → Servers → DC02 → **NTDS Settings** → Verbindungsobjekte ansehen; Rechtsklick → **Jetzt replizieren**.
7. Rechtsklick **NTDS Settings** (Standort) → **Alle Aufgaben → Replikationstopologie überprüfen** (KCC anstoßen).
8. **Client in 192.168.20.0/24**: `nltest /dsgetsite` → Filiale; `echo %LOGONSERVER%` → DC02.

### PowerShell / Befehle
```powershell
# Auf DC01
Get-ADReplicationSite -Filter * | Select-Object Name
Rename-ADObject (Get-ADReplicationSite "Default-First-Site-Name").DistinguishedName -NewName "Zentrale"
New-ADReplicationSite -Name "Filiale"
New-ADReplicationSubnet -Name "192.168.1.0/24" -Site "Zentrale"
New-ADReplicationSubnet -Name "192.168.20.0/24" -Site "Filiale"
New-ADReplicationSiteLink -Name "Zentrale-Filiale" -SitesIncluded Zentrale, Filiale -Cost 100 -ReplicationFrequencyInMinutes 15 -InterSiteTransportProtocol IP
Move-ADDirectoryServer -Identity DC02 -Site "Filiale"

# Replikation
repadmin /replsummary
repadmin /showrepl DC02
repadmin /syncall DC01 /AdeP
Get-ADReplicationPartnerMetadata -Target DC02 | Format-Table Partner, LastReplicationSuccess
Get-ADReplicationFailure -Target DC02

# Auf einem Client
nltest /dsgetsite
nltest /dsgetdc:contoso.local
```

## Einfach

Die **Domäne** ist die **Organisation** (wer gehört zu welcher Abteilung). **Standorte** beschreiben dagegen, **wo die Gebäude stehen** und wie gut die Straßen dazwischen sind.

Warum ist das wichtig?
1. **Anmelden beim nächsten Amt**: Ein Mitarbeiter in der Filiale soll sich beim **Amt in seiner Filiale** anmelden – nicht quer durchs Land im Hauptbüro. Woran erkennt der Computer, wo er ist? An seiner **IP-Adresse** (Subnetz → Standort).
2. **Akten abgleichen (Replikation)**:
   - **Im selben Gebäude** tauschen die Ämter Änderungen **sofort** aus – die Flure sind kurz.
   - **Zwischen Gebäuden** über eine teure, langsame Straße packt man die Änderungen in **Pakete** (komprimiert) und schickt sie **zu festen Zeiten** (z. B. alle 15 Minuten oder nachts) – über einen **Kurier** (Bridgeheadserver).

**Kosten** einer Standortverknüpfung sind wie Maut: Gibt es mehrere Wege, nimmt man den **günstigsten**.

**Dringendes** (z. B. ein gesperrtes Konto) wird immer **sofort** weitergegeben – wie eine Eilmeldung.

Den Plan, wer mit wem Akten tauscht, macht ein automatischer **Planer (KCC)** – man muss ihn fast nie selbst anfassen.

## Merksatz
- **Standort = gut verbundene Subnetze**; Zuordnung per **IP**.
- Intrasite: **15 s**-Benachrichtigung, unkomprimiert, **max. 3 Hops**.
- Intersite: **Kosten**, **Intervall (Standard 180, min. 15 Min.)**, **Zeitplan**, komprimiert, **Bridgehead**.
- **KCC** baut Verbindungen automatisch; **ISTG** plant standortübergreifend.
- Fehlende Subnetze → **NO_CLIENT_SITE** im netlogon.log.

## Prüfungsfalle
- Standorte ≠ Domänen – eine Domäne kann mehrere Standorte umfassen und umgekehrt.
- Ein Standort ohne Subnetze wird von Clients nie gefunden.
- Kleinere Kosten = bevorzugter Pfad.
- Replikationsintervall unter 15 Minuten ist nicht möglich.
- Kennwortänderungen gehen sofort an den PDC-Emulator.

## Grafik
### Landkarte mit Standorten
Zwei Städte (Zentrale, Filiale) mit Subnetz-Wolken; ein Client in der Filiale bekommt ein Schild „Filiale“ anhand seiner IP und läuft zum nahen DC.

### Replikation innen und außen
Innerhalb der Stadt flitzen einzelne Änderungszettel sofort im Ring; zwischen den Städten sammelt ein Kurier die Zettel, komprimiert sie in einen Koffer und fährt nach Fahrplan über die Maut-Straße (Kosten 100).

### Kostenwahl
Drei Standorte mit zwei Wegen (100 + 100 vs. 300); der Pfad mit den geringeren Gesamtkosten leuchtet.

## Karteikarten
- F: Was ist ein AD-Standort? | A: Gruppe gut verbundener IP-Subnetze – bildet die physische Topologie ab.
- F: Wie wird ein Client einem Standort zugeordnet? | A: Über seine IP-Adresse und die Subnetz-Objekte.
- F: Drei Eigenschaften einer Standortverknüpfung? | A: Kosten, Replikationsintervall, Zeitplan.
- F: Standard-Replikationsintervall zwischen Standorten? | A: 180 Minuten (Minimum 15).
- F: Wie schnell repliziert AD innerhalb eines Standorts? | A: Änderungsbenachrichtigung nach 15 Sekunden, unkomprimiert.
- F: Was macht der KCC? | A: Erstellt automatisch die Replikationstopologie (Verbindungsobjekte).
- F: Was ist ein Bridgeheadserver? | A: DC, der die standortübergreifende Replikation eines Standorts abwickelt.
- F: Welche Änderungen werden dringend repliziert? | A: Kontosperrungen, Kennwort-/Sperrrichtlinienänderungen, RID-Master-Änderungen; Kennwörter sofort zum PDC.
- F: Befehl für einen Replikationsüberblick? | A: repadmin /replsummary
- F: Womit prüft ein Client seinen Standort? | A: nltest /dsgetsite

## Quiz
? Wie ermittelt ein Client seinen AD-Standort?
* Anhand seiner IP-Adresse und der zugeordneten Subnetze
- Anhand seines Computernamens
- Anhand der OU
- Anhand der MAC-Adresse

? Zwei Wege zwischen Standort A und C: direkt (Kosten 300) oder über B (100 + 100). Welcher wird bevorzugt?
* Über B (Gesamtkosten 200)
- Direkt (300)
- Beide gleichzeitig
- Keiner, Kosten sind egal

? Was ist das kleinste mögliche Replikationsintervall einer Standortverknüpfung?
* 15 Minuten
- 1 Minute
- 180 Minuten
- 5 Sekunden

? Welcher Dienst erstellt die Replikationsverbindungen automatisch?
* KCC
- DFS-R
- DHCP-Relay
- WinRM

? Clients einer neuen Filiale authentifizieren sich am Zentral-DC statt am Filial-DC. Wahrscheinlichste Ursache?
* Das Filialsubnetz ist keinem oder dem falschen Standort zugeordnet
- Der Filial-DC ist globaler Katalog
- Die Kennwortrichtlinie ist zu streng
- DNS nutzt UDP 53

? Welcher DC ist für die Replikation zwischen Standorten zuständig?
* Der Bridgehead-Server des Standorts
- Der PDC-Emulator
- Jeder Client
- Der DHCP-Server
! Der ISTG bestimmt die Bridgehead-Server.

? Mit welchem Befehl prüft man den Replikationsstatus aller DCs übersichtlich?
* repadmin /replsummary
- gpupdate /force
- ipconfig /all
- netsh dhcp show
! repadmin /showrepl zeigt Details je DC.

? Wie werden AD-Daten innerhalb eines Standorts repliziert?
* Benachrichtigungsgesteuert, schnell und unkomprimiert
- Nur nach Zeitplan, komprimiert
- Nur manuell
- Über SMTP
! Zwischen Standorten zeitplangesteuert und komprimiert.
