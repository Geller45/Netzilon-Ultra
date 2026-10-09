---
id: server-hvsz-50
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 50 – Abschlussfall: komplettes Nested-Ausbildungslab aufbauen
stufe: Profi
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-nested, az800-vswitch, az800-pruefpunkte, az800-vm-ram, server-hvsz-42, server-hvsz-47]
---

## Profi

### Ticket
**Kunde meldet (Ausbildungsleitung):** „Jeder Azubi soll auf seinem Lab-Rechner einen eigenen Hyper-V-Host in einer VM bekommen, darin zwei Server-VMs mit Internetzugang über NAT. Vor jeder Übung soll ein Prüfpunkt gesetzt und am Ende alles kontrolliert werden. Bitte als Musterlösung aufbauen.“
- **Priorität:** mittel (Ausbildungsstart in zwei Wochen)
- **Betroffene Maschine:** physischer Lab-Host **HV01** (Server 2025)

### Ausgangslage
- **HV01.example.com**: Server 2025, 32 GB RAM, 8 Kerne (Intel VT-x mit EPT), SSD; externer vSwitch **„Extern“** im Netz 192.168.10.0/24.
- Zielbild:
  - **HV-NESTED**: VM auf HV01, Server 2025, Gen 2, **8 GB statisch**, 4 vCPU, 192.168.10.150, Hyper-V-Rolle.
  - In HV-NESTED: interner Switch **„NestedNAT“**, Host-Adresse 172.16.0.1/24, NAT **„NestedNAT“** für 172.16.0.0/24.
  - Innere VMs **INNER01** (172.16.0.10) und **INNER02** (172.16.0.11), Gen 2, je 1–2 GB, Gateway 172.16.0.1, DNS z. B. 192.168.10.10.
  - **Prüfpunkt „Grundzustand“** für beide inneren VMs.

### Analyse
- **Nested Virtualization** setzt voraus: `ExposeVirtualizationExtensions` (VM aus), **statischer RAM**, Konfigurationsversion ≥ 8.0; Intel VT-x/EPT oder AMD EPYC/Ryzen (ab Server 2022/Windows 11).
- **Netzwerk** für innere VMs: entweder **MAC-Spoofing** an der vNIC von HV-NESTED (innere VMs direkt im LAN) **oder** **NAT** in HV-NESTED (innere VMs in eigenem Netz, nur eine Adresse im LAN). Gewählt: **NAT** – Azubi-Netze bleiben vom Firmennetz getrennt, keine IP-Konflikte zwischen Azubis.
- Innerhalb von HV-NESTED gibt es keinen DHCP → **statische IPs** für INNER01/02 (oder eigener DHCP in einer inneren VM).
- Pro Host ist **ein** `NetNat`-Objekt üblich; mehrere überlappende Präfixe sind nicht unterstützt.
- **Prüfpunkte**: Standard sind **Produktionsprüfpunkte** (VSS im Gast); für Übungen mit Zustand „mitten im Geschehen“ alternativ **Standardprüfpunkte**.
- HV-NESTED selbst: keine Live-Migration, dynamischer RAM nicht geeignet.

### Lösungsweg
1. **HV01**: HV-NESTED erstellen (Gen 2, 8 GB statisch, 4 vCPU, 80 GB VHDX) und Server 2025 installieren. *Begründung:* Äußerer Lab-Host.
2. **HV01**: HV-NESTED **ausschalten**, `ExposeVirtualizationExtensions $true`. *Begründung:* Nur offline aktivierbar.
3. **HV-NESTED**: Rolle **Hyper-V** installieren, Neustart. *Begründung:* Hypervisor in der VM.
4. **HV-NESTED**: internen Switch **NestedNAT**, IP 172.16.0.1/24 auf vEthernet (NestedNAT), `New-NetNat`. *Begründung:* Eigenes Netz mit Internetzugang über die LAN-Adresse von HV-NESTED.
5. **HV-NESTED**: INNER01 und INNER02 erstellen, an NestedNAT, Server 2025 installieren, statische IPs setzen. *Begründung:* Kein DHCP im NAT-Netz.
6. **HV-NESTED**: Prüfpunkt „Grundzustand“ für beide. *Begründung:* Zurücksetzen nach Übungen.
7. **Kontrolle** (siehe unten) und Übergabe der Musterlösung als Skript. *Begründung:* Wiederholbarer Aufbau für alle Azubis.

### Ergebnis prüfen
- HV01: `Get-VMProcessor -VMName HV-NESTED | Select ExposeVirtualizationExtensions` → True; `Get-VMMemory -VMName HV-NESTED | Select DynamicMemoryEnabled` → False.
- HV-NESTED: `Get-VM` → INNER01, INNER02 Running; `Get-NetNat` → NestedNAT, Präfix 172.16.0.0/24.
- INNER01: `ping 172.16.0.11` (INNER02), `ping 172.16.0.1` (Gateway), `Test-NetConnection learn.microsoft.com -Port 443` → TcpTestSucceeded True.
- HV-NESTED: `Get-VMSnapshot -VMName INNER01, INNER02` → „Grundzustand“.
- Test: in INNER01 eine Datei löschen → Prüfpunkt anwenden → Datei wieder da.

### Vorbeugung
- Aufbau als **PowerShell-Skript** versionieren (Infrastructure as Code).
- Ressourcen pro Azubi dokumentieren (RAM-Budget: HV-NESTED 8 GB, innere VMs zusammen ≤ 5 GB).
- Prüfpunkte nach Übungsende löschen, damit .avhdx-Ketten nicht wachsen.
- Lab-Netze immer per NAT oder privatem Switch vom Produktionsnetz trennen.

## Einfach
Das ist das **große Finale**: Wir bauen eine komplette **Übungswelt** – Puppe in der Puppe in der Puppe.

1. **Der echte Computer** (HV01) ist das große Haus.
2. Darin bauen wir ein **Spielhaus** (HV-NESTED). Damit im Spielhaus selbst wieder Zimmer gebaut werden dürfen, geben wir ihm die **Bau-Erlaubnis** (geschachtelte Virtualisierung) und **festen Platz** (statischer Arbeitsspeicher).
3. Im Spielhaus entstehen **zwei Zimmer**: INNER01 und INNER02.
4. Damit die Zimmer nach draußen telefonieren können, bekommt das Spielhaus eine kleine **Telefonzentrale** (NAT). Die Zimmer haben interne Nummern (172.16.0.x), und die Zentrale leitet Gespräche nach draußen weiter – so wie in einem Hotel.
5. Bevor die Azubis üben, machen wir von beiden Zimmern ein **Foto** (Prüfpunkt „Grundzustand“). Geht beim Üben etwas kaputt, stellt man das Foto wieder her – und alles ist wie vorher.
6. Zum Schluss **kontrollieren** wir alles: Können die Zimmer sich gegenseitig anrufen? Kommen sie ins Internet? Funktioniert das Foto?

Wenn alles klappt, schreiben wir die Bauanleitung als **Skript** auf, damit jeder Azubi sein eigenes Spielhaus in Minuten bekommt.

## Merksatz
- Nested: **VM aus → ExposeVirtualizationExtensions → statischer RAM**.
- Netz: **MAC-Spoofing** (direkt ins LAN) **oder NAT** (eigenes Netz) – im Lab: NAT.
- NAT: **interner Switch + IP am vEthernet + New-NetNat**.
- Vor Übungen **Prüfpunkt**, am Ende **kontrollieren**.

## Prüfungsfalle
- Ohne MAC-Spoofing **und** ohne NAT kommen innere VMs nicht ins Netz.
- Im NAT-Netz gibt es keinen DHCP – IPs statisch setzen oder eigenen DHCP bereitstellen.
- Gateway der inneren VMs ist die IP am **vEthernet (NestedNAT)** in HV-NESTED, nicht die des Routers im LAN.
- `New-NetNat` gehört in **HV-NESTED**, nicht auf den physischen HV01.

## Grafik
### Das komplette Nested-Lab
1. HV01 -> HV-NESTED: Gen 2, 8 GB statisch, ExposeVirtualizationExtensions
2. HV-NESTED: Hyper-V-Rolle, interner Switch NestedNAT, 172.16.0.1
3. HV-NESTED: New-NetNat für 172.16.0.0/24
4. HV-NESTED -> INNER01, INNER02: innere VMs am Switch NestedNAT
5. INNER01 -> HV-NESTED: Gateway 172.16.0.1, NAT ins LAN
6. HV-NESTED -> Internet: Übersetzung auf 192.168.10.150
7. HV-NESTED: Prüfpunkt Grundzustand für INNER01 und INNER02

## Lab
**Nachstellen:** Zuerst den typischen Fehler (Nested vergessen, NAT fehlt) erleben, dann vollständig aufbauen. Maschinen: **HV01**, **HV-NESTED**, **INNER01**, **INNER02**.

### GUI
1. **HV01**: Hyper-V-Manager → Neu → Virtueller Computer → **HV-NESTED**, Generation 2, 8192 MB, **ohne** dynamischen Arbeitsspeicher, Switch „Extern“, VHDX 80 GB, Server-2025-ISO → installieren → IP 192.168.10.150.
2. **HV-NESTED**: Server-Manager → Rollen → **Hyper-V** → Fehlermeldung „Hyper-V kann nicht installiert werden: Der Prozessor verfügt nicht über die erforderlichen Virtualisierungsfunktionen“ (Fehlerbild).
3. **HV01**: HV-NESTED herunterfahren → Nested per PowerShell aktivieren (kein GUI-Schalter) → HV-NESTED starten.
4. **HV-NESTED**: Server-Manager → Rollen → **Hyper-V** installieren → Neustart.
5. **HV-NESTED**: Hyper-V-Manager → Manager für virtuelle Switches → **Intern** → Name „NestedNAT“ → Netzwerkverbindungen → vEthernet (NestedNAT) → IPv4 172.16.0.1/24 (ohne Gateway) → NAT per PowerShell anlegen.
6. **HV-NESTED**: Hyper-V-Manager → Neu → **INNER01** (Gen 2, 2048 MB, Switch NestedNAT, ISO) → installieren → IP 172.16.0.10/24, Gateway 172.16.0.1, DNS 192.168.10.10; ebenso **INNER02** mit 172.16.0.11.
7. **HV-NESTED**: INNER01 und INNER02 → Rechtsklick → **Prüfpunkt** → umbenennen in „Grundzustand“.
8. **INNER01**: Eingabeaufforderung → `ping 172.16.0.11`, `ping 172.16.0.1`, Browser auf eine Internetseite.
9. **INNER01**: Testdatei auf dem Desktop löschen → **HV-NESTED**: INNER01 → Prüfpunkt „Grundzustand“ → **Anwenden** → Datei wieder vorhanden.

### PowerShell
```powershell
# Auf HV01 – äußere VM anlegen
New-VM -Name HV-NESTED -Generation 2 -MemoryStartupBytes 8GB -NewVHDPath "D:\Hyper-V\HV-NESTED\HV-NESTED.vhdx" -NewVHDSizeBytes 80GB -SwitchName "Extern"
Set-VMMemory -VMName HV-NESTED -DynamicMemoryEnabled $false
Set-VMProcessor -VMName HV-NESTED -Count 4 -ExposeVirtualizationExtensions $true
Add-VMDvdDrive -VMName HV-NESTED -Path "D:\ISO\WS2025.iso"
Start-VM -Name HV-NESTED

# Auf HV-NESTED – Hyper-V und NAT
Install-WindowsFeature Hyper-V -IncludeManagementTools -Restart
New-VMSwitch -Name "NestedNAT" -SwitchType Internal
New-NetIPAddress -IPAddress 172.16.0.1 -PrefixLength 24 -InterfaceAlias "vEthernet (NestedNAT)"
New-NetNat -Name "NestedNAT" -InternalIPInterfaceAddressPrefix 172.16.0.0/24

# Auf HV-NESTED – innere VMs
foreach ($n in "INNER01","INNER02") {
    New-VM -Name $n -Generation 2 -MemoryStartupBytes 2GB -NewVHDPath "C:\VMs\$n\$n.vhdx" -NewVHDSizeBytes 40GB -SwitchName "NestedNAT"
    Add-VMDvdDrive -VMName $n -Path "C:\ISO\WS2025.iso"
}
Start-VM -Name INNER01, INNER02

# Auf INNER01 – statische IP (INNER02 analog mit .11)
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 172.16.0.10 -PrefixLength 24 -DefaultGateway 172.16.0.1
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses 192.168.10.10

# Auf HV-NESTED – Prüfpunkte
Checkpoint-VM -Name INNER01, INNER02 -SnapshotName "Grundzustand"

# Kontrolle – auf HV01
Get-VMProcessor -VMName HV-NESTED | Select-Object VMName, ExposeVirtualizationExtensions
# Kontrolle – auf HV-NESTED
Get-VM; Get-NetNat; Get-VMSnapshot -VMName INNER01, INNER02
# Kontrolle – auf INNER01
Test-NetConnection 172.16.0.11
Test-NetConnection learn.microsoft.com -Port 443

# Auf HV-NESTED – Prüfpunkt zurückspielen
Restore-VMSnapshot -VMName INNER01 -Name "Grundzustand" -Confirm:$false
```

## Reihenfolge
### Nested-Ausbildungslab aufbauen
1. HV-NESTED als Gen-2-VM mit statischem RAM anlegen
2. VM ausschalten und ExposeVirtualizationExtensions aktivieren
3. In HV-NESTED die Rolle Hyper-V installieren
4. Internen Switch NestedNAT und IP 172.16.0.1 einrichten
5. New-NetNat für 172.16.0.0/24 anlegen
6. INNER01 und INNER02 erstellen und mit statischen IPs versehen
7. Prüfpunkt Grundzustand setzen
8. Verbindungen und Prüfpunkt-Wiederherstellung kontrollieren

## Szenario
### Kontrollfragen
Auf HV01 soll HV-NESTED (Server 2025) entstehen; darin INNER01/INNER02 im Netz 172.16.0.0/24 mit Internetzugang über NAT und Prüfpunkt „Grundzustand“.
- F: Welche drei Einstellungen braucht HV-NESTED auf HV01? | A: ExposeVirtualizationExtensions $true (VM aus), statischer RAM, Konfigurationsversion ≥ 8.0.
- F: Welche drei Schritte bilden das NAT in HV-NESTED? | A: Interner Switch NestedNAT, IP 172.16.0.1/24 auf vEthernet (NestedNAT), New-NetNat -InternalIPInterfaceAddressPrefix 172.16.0.0/24.
- F: Welches Gateway tragen INNER01/INNER02 ein? | A: 172.16.0.1.
- F: Welche Alternative zu NAT gibt es, und warum wurde sie hier nicht gewählt? | A: MAC-Spoofing an der vNIC von HV-NESTED; NAT trennt die Azubi-Netze vom Firmennetz und vermeidet IP-Konflikte.
- F: Wie setzt man INNER01 nach einer Übung zurück? | A: Restore-VMSnapshot -VMName INNER01 -Name "Grundzustand" (in HV-NESTED).
- F: Welche Einschränkung hat HV-NESTED im Betrieb? | A: Keine Live-Migration; dynamischer RAM ungeeignet.

## Legende
### Nested-Ausbildungslab
- Was: Hyper-V-Host als VM (HV-NESTED) mit eigenen inneren VMs und NAT-Netz.
- Wie: Nested auf HV01 aktivieren, Hyper-V in HV-NESTED, interner Switch + NetNat, innere VMs, Prüfpunkte.
- Wann: Ausbildung, Prüfungsvorbereitung, Tests ohne zusätzliche Hardware.
- Wo: Auf einem leistungsfähigen physischen Lab-Host.
- Warum: Jeder Azubi bekommt eine vollständige, isolierte und zurücksetzbare Hyper-V-Umgebung.
### NetNat
- Was: Windows-NAT, das ein internes Präfix auf die Adresse des Hosts übersetzt.
- Wie: New-NetNat -Name X -InternalIPInterfaceAddressPrefix 172.16.0.0/24
- Warum: Innere VMs erreichen das LAN/Internet ohne eigene LAN-Adressen.

## Karteikarten
- F: Welche Voraussetzungen hat eine Nested-VM? | A: VM aus beim Aktivieren, ExposeVirtualizationExtensions, statischer RAM, Konfigurationsversion ≥ 8.0.
- F: Welche zwei Netzwerkvarianten gibt es für innere VMs? | A: MAC-Spoofing an der äußeren vNIC oder NAT in der äußeren VM.
- F: Welcher Switch-Typ wird für NAT in HV-NESTED angelegt? | A: Ein interner Switch.
- F: Cmdlet für das NAT-Objekt? | A: New-NetNat -Name NestedNAT -InternalIPInterfaceAddressPrefix 172.16.0.0/24
- F: Welche IP bekommt vEthernet (NestedNAT)? | A: 172.16.0.1/24 – sie ist das Gateway der inneren VMs.
- F: Warum statische IPs in den inneren VMs? | A: Im NAT-Netz gibt es standardmäßig keinen DHCP-Server.
- F: Wie erstellt man den Prüfpunkt „Grundzustand“ per PowerShell? | A: Checkpoint-VM -Name INNER01, INNER02 -SnapshotName "Grundzustand"
- F: Wie testet man den Internetzugang aus INNER01? | A: Test-NetConnection learn.microsoft.com -Port 443
- F: Wo wird New-NetNat ausgeführt? | A: In HV-NESTED, nicht auf dem physischen HV01.

## Quiz
? Welche Fehlermeldung erscheint typischerweise, wenn Nested für HV-NESTED nicht aktiviert ist?
* Hyper-V kann nicht installiert werden, da Virtualisierungsfunktionen fehlen
- Die VHDX ist beschädigt
- Die Lizenz ist abgelaufen
- DNS-Name nicht gefunden
! Der Gast sieht ohne ExposeVirtualizationExtensions kein VT-x/AMD-V.

? Wo wird New-NetNat für die inneren VMs ausgeführt?
* In HV-NESTED
- Auf dem physischen HV01
- In INNER01
- Auf dem DC
! Das NAT gehört zu dem Host, an dessen internem Switch die inneren VMs hängen.

? Welche Gateway-Adresse bekommen INNER01 und INNER02?
* 172.16.0.1
- 192.168.10.1
- 192.168.10.150
- 172.16.0.255
! Die IP am vEthernet (NestedNAT).

? Welcher Switch-Typ wird in HV-NESTED für das NAT-Netz angelegt?
* Intern
- Extern
- Privat
- SET
! Der Host braucht eine eigene IP im Netz – das geht nur bei intern (oder extern).

? Was ist die Alternative zu NAT für den Netzzugang innerer VMs?
* MAC-Adress-Spoofing an der vNIC von HV-NESTED
- DHCP-Wächter an HV-NESTED
- Port-Spiegelung Destination
- Router-Wächter an INNER01
! Dann hängen die inneren VMs direkt im LAN.

? Welche Speichereinstellung ist für HV-NESTED richtig?
* Statischer Arbeitsspeicher
- Dynamischer RAM ab 512 MB
- Smart Paging aktiviert
- NUMA-Spanning deaktiviert
! Dynamischer RAM ist für Nested ungeeignet.

? Wie setzt man INNER01 nach einer Übung zurück?
* Restore-VMSnapshot -VMName INNER01 -Name "Grundzustand"
- Remove-VMSnapshot -VMName INNER01
- Optimize-VHD -Path INNER01.vhdx
- Update-VMVersion -Name INNER01
! Remove würde den Prüfpunkt löschen statt ihn anzuwenden.

? Warum wurde im Ausbildungslab NAT statt MAC-Spoofing gewählt?
* Azubi-Netze bleiben vom Firmennetz getrennt, keine IP-Konflikte
- NAT ist schneller als jede andere Lösung
- MAC-Spoofing ist in Server 2025 entfernt
- Nur NAT unterstützt Gen-2-VMs
! Isolierte, gleichartige Lab-Umgebungen pro Azubi.
