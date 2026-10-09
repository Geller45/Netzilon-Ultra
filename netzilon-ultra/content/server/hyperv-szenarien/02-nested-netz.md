---
id: server-hvsz-02
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 02 – Nested-Lab: innere VM hat kein Netzwerk
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-nested, az800-vswitch, server-hvsz-03, server-hvsz-04]
---

## Profi

### Ticket
**Kunde meldet:** „In unserer Schulungs-VM laufen zwei Test-VMs, aber die kommen nicht ins Netz. Ping auf das Gateway geht nicht, DHCP liefert nur 169.254-Adressen.“
- Datum/Priorität: 06.10.2026, **Priorität 3 (normal)** – Schulung am nächsten Morgen.
- Betroffene Maschinen: äußere VM **HV-NESTED** auf **HV01.example.com**, innere VMs **INNER01** und **INNER02**.

### Ausgangslage
- Host **HV01.example.com** (Server 2025), externer vSwitch **LAN** an der physischen NIC, Netz 192.168.10.0/24, Gateway 192.168.10.1, DHCP auf DC01 (192.168.10.10).
- **HV-NESTED** (Server 2025, 16 GB statisch, 4 vCPU, `ExposeVirtualizationExtensions` aktiv) hängt mit einer vNIC am vSwitch **LAN** und hat selbst die IP 192.168.10.50.
- In HV-NESTED: externer vSwitch **NestedLAN** an dessen virtueller NIC; INNER01/INNER02 hängen daran.
- HV-NESTED selbst hat Netzwerk, die inneren VMs nicht.

### Analyse
Die inneren VMs senden Frames mit **ihrer eigenen MAC-Adresse**. Diese Frames verlassen die äußere VM über deren vNIC. Der vSwitch auf HV01 lässt standardmäßig nur Frames durch, deren **Quell-MAC** der MAC der vNIC entspricht – alles andere wird verworfen (Schutz gegen MAC-Spoofing).

| Hypothese | Prüfung |
|---|---|
| MAC-Adress-Spoofing an der vNIC von HV-NESTED aus | `Get-VMNetworkAdapter -VMName HV-NESTED \| Select Name, MacAddressSpoofing` auf HV01 |
| vSwitch in HV-NESTED ist intern/privat statt extern | `Get-VMSwitch` in HV-NESTED |
| DHCP-Server nicht erreichbar/Bereich erschöpft | DHCP-Konsole auf DC01, Leases |
| VLAN-Einstellung abweichend | `Get-VMNetworkAdapterVlan` auf beiden Ebenen |

**Befund:** `MacAddressSpoofing` steht auf **Off**. Der Paketmitschnitt würde zeigen: DHCP-Discover von INNER01 kommt nie auf dem physischen Netz an.

### Lösungsweg
1. **Auf HV01** MAC-Spoofing für die vNIC von HV-NESTED einschalten – Begründung: Die äußere VM muss Frames mit fremden MACs (der inneren VMs) weiterleiten dürfen. Die Änderung ist im laufenden Betrieb möglich.
2. **In HV-NESTED** prüfen, ob **NestedLAN** ein **externer** Switch ist – Begründung: Nur ein externer Switch verbindet innere VMs mit dem Netz der äußeren NIC.
3. **In INNER01** `ipconfig /renew` – Begründung: neue DHCP-Anfrage nach der Korrektur.
4. Alternative, wenn Spoofing nicht erlaubt ist (z. B. Azure, Richtlinie): **NAT** in HV-NESTED (interner Switch + `New-NetNat`), siehe Szenario 04.

### Ergebnis prüfen
- INNER01 erhält eine Adresse aus 192.168.10.0/24 und pingt 192.168.10.1.
- Auf HV01: `Get-VMNetworkAdapter -VMName HV-NESTED` zeigt `MacAddressSpoofing : On`.
- DHCP-Konsole auf DC01 zeigt Leases für die MACs von INNER01/INNER02.

### Vorbeugung
- Nested-Vorlage (Skript) erstellen, das **ExposeVirtualizationExtensions**, **statischen RAM** und **MAC-Spoofing** in einem Zug setzt.
- MAC-Spoofing **nur** an VMs aktivieren, die es brauchen (Nested-Hosts, Load-Balancer) – sonst Sicherheitsrisiko.
- Dokumentieren, ob das Lab per Spoofing oder per NAT angebunden wird.

## Einfach

Stell dir ein **Mehrfamilienhaus** vor. Der Postbote (der vSwitch auf HV01) bringt Briefe nur zu Leuten, deren **Name auf dem Klingelschild** steht. Am Schild der Wohnung HV-NESTED steht nur „HV-NESTED“.

In der Wohnung HV-NESTED wohnen aber noch zwei **Untermieter** (INNER01, INNER02). Wenn die Briefe verschicken, steht ihr eigener Name als Absender drauf. Der Postbote denkt: „Den kenne ich nicht, das ist bestimmt ein Betrüger“ – und wirft die Briefe weg.

Die Lösung: Man sagt dem Postboten, dass in dieser Wohnung **auch andere Namen** erlaubt sind. Das heißt in Hyper-V **MAC-Adress-Spoofing zulassen**. Jetzt kommen die Briefe der Untermieter durch und sie bekommen auch Antwort.

Wenn das Haus so streng ist, dass es das nie erlaubt (wie in Azure), baut HV-NESTED einen eigenen **Briefkasten-Verteiler** (NAT): Alle Briefe gehen mit dem Namen „HV-NESTED“ raus und werden drinnen richtig verteilt.

## Merksatz
- Innere VMs ohne Netz → **MAC-Spoofing** an der äußeren vNIC.
- Spoofing wird auf dem **physischen Host** gesetzt, nicht in der äußeren VM.
- Kein Spoofing möglich (Azure) → **NAT** in der äußeren VM.

## Prüfungsfalle
- MAC-Spoofing wird **auf HV01** an der vNIC von HV-NESTED eingeschaltet – nicht an den inneren VMs.
- `ExposeVirtualizationExtensions` allein bringt **kein** Netzwerk für innere VMs.
- In **Azure** ist MAC-Spoofing nicht verfügbar – dort NAT.
- Ein **interner** Switch in der äußeren VM ohne NAT bringt die inneren VMs nicht ins LAN.

## Grafik
### MAC-Filter am vSwitch
1. INNER01 -> HV-NESTED: DHCP-Discover mit Quell-MAC von INNER01
2. HV-NESTED -> vSwitch-LAN: Frame über die vNIC weitergeleitet
3. vSwitch-LAN: Quell-MAC ungleich vNIC-MAC – Frame verworfen
4. Admin -> HV01: MAC-Spoofing an der vNIC von HV-NESTED einschalten
5. HV-NESTED -> vSwitch-LAN: Frame mit fremder MAC jetzt erlaubt
6. vSwitch-LAN -> DC01: DHCP-Discover kommt an
7. DC01 -> INNER01: DHCP-Offer 192.168.10.x

## Lab
**Maschinen**: Host **HV01.example.com**, VM **HV-NESTED** (Nested aktiv), innere VM **INNER01**.
Nachstellen: Zuerst den Fehler bewusst erzeugen, dann beheben.

### GUI
1. **HV01**: Hyper-V-Manager → HV-NESTED → Einstellungen → Netzwerkkarte → **Erweiterte Features** → Haken „**Spoofing von MAC-Adressen aktivieren**“ **entfernen** → OK (Fehlerzustand).
2. **HV-NESTED**: Hyper-V-Manager → Manager für virtuelle Switches → Switch **NestedLAN** als **Externes Netzwerk** an der Ethernet-Karte prüfen.
3. **INNER01**: Eingabeaufforderung → `ipconfig /renew` → nur APIPA-Adresse 169.254.x.x.
4. **HV01**: Hyper-V-Manager → HV-NESTED → Einstellungen → Netzwerkkarte → Erweiterte Features → Haken „**Spoofing von MAC-Adressen aktivieren**“ setzen → OK.
5. **INNER01**: `ipconfig /renew` → Adresse aus 192.168.10.0/24.
6. **INNER01**: `ping 192.168.10.1` → Antwort.

### PowerShell
1. **HV01**: Spoofing ausschalten und Fehler zeigen.
2. **HV01**: Spoofing einschalten.
3. **HV-NESTED**: per PowerShell Direct in INNER01 die Adresse prüfen (PowerShell Direct wirkt nur eine Ebene tief, daher aus HV-NESTED heraus).

```powershell
# Auf HV01 – Fehler erzeugen
Get-VMNetworkAdapter -VMName HV-NESTED | Set-VMNetworkAdapter -MacAddressSpoofing Off

# In HV-NESTED – Switch und innere VM prüfen
Get-VMSwitch | Format-Table Name, SwitchType, NetAdapterInterfaceDescription
Invoke-Command -VMName INNER01 -Credential (Get-Credential) -ScriptBlock { ipconfig /renew; ipconfig }

# Auf HV01 – Beheben
Get-VMNetworkAdapter -VMName HV-NESTED | Set-VMNetworkAdapter -MacAddressSpoofing On
Get-VMNetworkAdapter -VMName HV-NESTED | Select-Object VMName, MacAddress, MacAddressSpoofing

# In HV-NESTED – erneut prüfen
Invoke-Command -VMName INNER01 -Credential (Get-Credential) -ScriptBlock { ipconfig /renew; Test-Connection 192.168.10.1 -Count 2 }
```

## Szenario
### Kontrollfragen
In einer Nested-Umgebung hat die äußere VM HV-NESTED Netzwerk, die inneren VMs bekommen aber nur APIPA-Adressen.
- F: Was ist die wahrscheinlichste Ursache? | A: MAC-Adress-Spoofing ist an der vNIC der äußeren VM auf dem physischen Host deaktiviert, daher verwirft der vSwitch Frames mit fremden MACs.
- F: Auf welcher Maschine wird die Einstellung geändert? | A: Auf dem physischen Host HV01, an der Netzwerkkarte der VM HV-NESTED.
- F: Wie lautet der PowerShell-Befehl? | A: Get-VMNetworkAdapter -VMName HV-NESTED \| Set-VMNetworkAdapter -MacAddressSpoofing On
- F: Welche Alternative gibt es, wenn Spoofing nicht erlaubt ist? | A: NAT in der äußeren VM: interner vSwitch, IP am vEthernet-Adapter und New-NetNat.
- F: Warum ist MAC-Spoofing nicht standardmäßig aktiv? | A: Sicherheitsfunktion: Eine VM soll keine fremden MAC-Adressen vortäuschen können.

## Reihenfolge
### Innere VMs ins Netz bringen
1. Symptom prüfen: innere VM hat nur APIPA-Adresse
2. Switch-Typ in der äußeren VM prüfen (extern)
3. MAC-Spoofing-Status an der äußeren vNIC auf dem Host prüfen
4. MAC-Spoofing auf dem Host aktivieren
5. In der inneren VM DHCP erneuern
6. Gateway anpingen

## Legende
### MAC-Adress-Spoofing
- Was: Erlaubnis für eine VM, Frames mit einer anderen Quell-MAC als der eigenen vNIC-MAC zu senden.
- Wie: VM-Einstellungen → Netzwerkkarte → Erweiterte Features oder `Set-VMNetworkAdapter -MacAddressSpoofing On`.
- Wann: bei Nested-Virtualisierung mit externem Switch, Software-Load-Balancern, bestimmten Clustern.
- Wo: auf dem physischen Host (HV01) an der vNIC der äußeren VM.
- Warum: Der vSwitch verwirft sonst Frames der inneren VMs, weil deren MAC nicht zur vNIC passt.

## Karteikarten
- F: Warum haben innere VMs im Nested-Lab kein Netz? | A: Der vSwitch des physischen Hosts verwirft Frames mit fremder Quell-MAC, solange MAC-Spoofing aus ist.
- F: Wo wird MAC-Spoofing aktiviert? | A: Auf dem physischen Host an der Netzwerkkarte der äußeren VM.
- F: GUI-Pfad für MAC-Spoofing? | A: VM-Einstellungen → Netzwerkkarte → Erweiterte Features → Spoofing von MAC-Adressen aktivieren.
- F: PowerShell für MAC-Spoofing? | A: Set-VMNetworkAdapter -VMName HV-NESTED -MacAddressSpoofing On
- F: Muss die VM für MAC-Spoofing ausgeschaltet sein? | A: Nein, die Einstellung lässt sich im laufenden Betrieb ändern.
- F: Welche Alternative zu MAC-Spoofing gibt es? | A: NAT in der äußeren VM (interner Switch + New-NetNat).
- F: Wo ist MAC-Spoofing nicht möglich? | A: In Azure-VMs.
- F: Welche Adresse zeigt eine innere VM ohne DHCP-Antwort? | A: Eine APIPA-Adresse 169.254.x.x.
- F: Welcher Switch-Typ wird in der äußeren VM für direkten LAN-Zugang benötigt? | A: Ein externer vSwitch an der virtuellen NIC der äußeren VM.

## Quiz
? Innere VMs in HV-NESTED erhalten nur 169.254-Adressen. Was fehlt?
* MAC-Adress-Spoofing an der vNIC von HV-NESTED auf dem Host
- ExposeVirtualizationExtensions an INNER01
- Erweiterter Sitzungsmodus auf HV01
- Ein zweiter DHCP-Bereich
! Der vSwitch auf HV01 verwirft Frames mit MACs, die nicht zur vNIC gehören.

? Auf welcher Maschine wird MAC-Spoofing für das Nested-Lab aktiviert?
* HV01 (physischer Host)
- INNER01
- DC01
- Am physischen Switch
! Die Einstellung gehört zur vNIC der äußeren VM und wird auf dem Host gesetzt.

? Welcher Befehl aktiviert MAC-Spoofing?
* Set-VMNetworkAdapter -VMName HV-NESTED -MacAddressSpoofing On
- Set-VMProcessor -VMName HV-NESTED -MacSpoofing $true
- Set-VMSwitch -Name LAN -AllowSpoofing $true
- Set-NetAdapter -Name Ethernet -Promiscuous On
! MAC-Spoofing ist eine Eigenschaft der VM-Netzwerkkarte.

? Wie bringt man innere VMs in einer Azure-VM ins Netz?
* NAT in der äußeren VM
- MAC-Spoofing im Azure-Portal
- Externer Switch an der Azure-NIC
- Privater Switch
! In Azure gibt es kein MAC-Spoofing, daher NAT.

? Muss HV-NESTED zum Aktivieren von MAC-Spoofing ausgeschaltet sein?
* Nein
- Ja, immer
- Nur bei Gen-2-VMs
- Nur bei dynamischem RAM
! Netzwerkadapter-Eigenschaften wie MAC-Spoofing lassen sich online ändern.

? Warum ist MAC-Spoofing standardmäßig deaktiviert?
* Damit VMs keine fremden MAC-Adressen vortäuschen können
- Weil es die CPU-Leistung halbiert
- Weil es nur mit IPv6 funktioniert
- Weil es Prüfpunkte verhindert
! Es ist eine Sicherheitsfunktion des vSwitch.

? Welcher Switch-Typ in HV-NESTED verbindet innere VMs direkt mit dem LAN?
* Extern
- Privat
- Intern ohne NAT
- Standardswitch ohne Uplink
! Nur ein externer Switch bindet die (virtuelle) NIC der äußeren VM an.

? Was allein reicht NICHT, damit innere VMs Netzwerk haben?
* ExposeVirtualizationExtensions aktivieren
- MAC-Spoofing aktivieren und externen Switch nutzen
- NAT mit internem Switch und New-NetNat einrichten
- MAC-Spoofing plus DHCP im LAN
! Die Virtualisierungserweiterungen ermöglichen Hyper-V in der VM, aber kein Netzwerk.
