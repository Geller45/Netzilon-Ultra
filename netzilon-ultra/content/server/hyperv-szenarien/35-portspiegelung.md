---
id: server-hvsz-35
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 35 – Netzwerkfehler analysieren: Port-Spiegelung für Wireshark
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-vswitch, az801-netzwerk-troubleshooting, server-hvsz-34, server-hvsz-36]
---

## Profi

### Ticket
**Kunde meldet:** „Die Webanwendung auf WEB01 bricht sporadisch Verbindungen ab. Der Entwickler möchte einen Netzwerkmitschnitt, darf aber auf WEB01 keine Software installieren.“
- **Priorität:** mittel
- **Betroffene Maschine:** **WEB01** auf **HV01**

### Ausgangslage
- **HV01.example.com**, Server 2025, vSwitch **„Extern“**
- VM **WEB01** (Server 2025, IIS, 192.168.10.80) – Produktionssystem, keine Fremdsoftware erlaubt.
- Neue Analyse-VM **ANALYSE01** (Windows 11 mit Wireshark, 192.168.10.99) am **selben vSwitch** auf **HV01**.

### Analyse
- **Port-Spiegelung** (Port Mirroring) am Hyper-V-vSwitch kopiert den Verkehr einer vNIC an eine andere vNIC.
- Einstellungen pro vNIC (`-PortMirroring`): **None** (Standard), **Source** (Quelle – wird gespiegelt), **Destination** (Ziel – empfängt die Kopie).
- Quelle und Ziel müssen am **selben virtuellen Switch auf demselben Host** hängen.
- Gespiegelt wird **ein- und ausgehender** Verkehr der Quell-vNIC.
- Vorteil: keine Installation auf WEB01, keine Konfiguration am physischen Switch.

### Lösungsweg
1. **ANALYSE01** an vSwitch „Extern“ auf HV01 anschließen. *Begründung:* Quelle und Ziel müssen am selben Switch hängen.
2. **WEB01-vNIC = Source** setzen. *Begründung:* Deren Verkehr wird kopiert; die VM merkt nichts davon.
3. **ANALYSE01-vNIC = Destination** setzen. *Begründung:* Sie erhält die Kopien.
4. In ANALYSE01 **Wireshark** auf der Netzwerkkarte starten, Filter z. B. `ip.addr == 192.168.10.80 && tcp`. *Begründung:* Nur relevante Pakete.
5. Fehler abwarten, Mitschnitt speichern (.pcapng), Analyse z. B. auf **TCP-Resets** (`tcp.flags.reset == 1`) oder Retransmissions.
6. **Spiegelung wieder abschalten** (None). *Begründung:* Datenschutz und unnötige Last vermeiden.

### Ergebnis prüfen
- `Get-VMNetworkAdapter -VMName WEB01, ANALYSE01 | Select VMName, PortMirroringMode`
- Wireshark in ANALYSE01 zeigt HTTP/HTTPS-Verkehr mit Quell- oder Zieladresse 192.168.10.80.
- Nach Abschluss: beide vNICs wieder **None**.

### Vorbeugung
- Analyse-VM als Vorlage bereithalten (ausgeschaltet, mit Wireshark).
- Mitschnitte enthalten personenbezogene Daten → Zweck, Dauer und Löschung dokumentieren (DSGVO, Betriebsrat).
- Alternativ ohne Zusatz-VM: `pktmon` direkt auf dem Host.

## Einfach
Stell dir vor, ein Briefträger (WEB01) verliert manchmal Briefe. Man möchte herausfinden, wo es schiefgeht – aber man darf ihm nicht in die Tasche schauen.

Die Lösung: Am **Postverteilzentrum** (dem virtuellen Switch) gibt es einen **Kopierer**. Jeder Brief, den der Briefträger bekommt oder abgibt, wird kopiert und an einen **Detektiv** (ANALYSE01) geschickt. Der Detektiv liest alle Kopien mit seiner **Lupe** (Wireshark) und findet heraus, welcher Brief kaputt war.

Man stellt nur zwei Schilder auf:
- Beim Briefträger: „**Quelle**“ – von mir wird kopiert.
- Beim Detektiv: „**Ziel**“ – ich bekomme die Kopien.

Wichtig: Beide müssen am **selben Verteilzentrum** sein. Und wenn der Detektiv fertig ist, schaltet man den Kopierer wieder aus – fremde Briefe liest man nicht länger als nötig.

## Merksatz
- **Source** = wird gespiegelt, **Destination** = empfängt.
- **Selber vSwitch, selber Host.**
- Danach wieder auf **None**.
- Mitschnitte = Daten → Datenschutz beachten.

## Prüfungsfalle
- Die Spiegelung wird an der **vNIC** eingestellt, nicht am vSwitch.
- Quelle und Ziel an **verschiedenen Hosts** funktionieren mit der Hyper-V-Port-Spiegelung nicht.
- Das Ziel bekommt die Kopie **zusätzlich** – es braucht keine IP aus dem Netz der Quelle, aber eine Netzwerkkarte am selben Switch.
- Verwechslung: Bei Source und Destination vertauscht sieht man den falschen Verkehr.

## Grafik
### Spiegeln am vSwitch
1. Client -> WEB01: HTTPS-Anfrage über vSwitch Extern
2. vSwitch -> ANALYSE01: Kopie des Pakets (WEB01 = Source)
3. WEB01 -> Client: Antwort, ebenfalls gespiegelt
4. ANALYSE01: Wireshark zeigt TCP-Reset von WEB01
5. Admin -> WEB01, ANALYSE01: PortMirroring wieder None

## Lab
**Nachstellen:** Verkehr von WEB01 mitschneiden, ohne in WEB01 etwas zu installieren. Maschinen: **HV01**, VMs **WEB01** und **ANALYSE01** (Wireshark installiert).

### GUI
1. **ANALYSE01**: Wireshark starten → Mitschnitt auf „Ethernet“ → Filter `ip.addr == 192.168.10.80` → nur eigener Verkehr sichtbar (Ausgangslage).
2. **HV01**: Hyper-V-Manager → WEB01 → Einstellungen → Netzwerkkarte → **Erweiterte Features** → **Portspiegelung** → Spiegelungsmodus „**Quelle**“ → OK.
3. **HV01**: ANALYSE01 → Einstellungen → Netzwerkkarte → Erweiterte Features → Spiegelungsmodus „**Ziel**“ → OK.
4. **Client**: Webseite `http://192.168.10.80` mehrfach aufrufen.
5. **ANALYSE01**: Wireshark zeigt jetzt den Verkehr von WEB01 → Mitschnitt speichern.
6. **HV01**: bei beiden VMs Spiegelungsmodus wieder „Keine“.

### PowerShell
```powershell
# Auf HV01 – beide am selben Switch?
Get-VMNetworkAdapter -VMName WEB01, ANALYSE01 | Select-Object VMName, SwitchName, PortMirroringMode

# Auf HV01 – Spiegelung einrichten
Set-VMNetworkAdapter -VMName WEB01 -PortMirroring Source
Set-VMNetworkAdapter -VMName ANALYSE01 -PortMirroring Destination

# Auf ANALYSE01 – Mitschnitt (Wireshark-Kommandozeile, 120 s)
& "C:\Program Files\Wireshark\tshark.exe" -i Ethernet -a duration:120 -w C:\Mitschnitt\web01.pcapng

# Auf HV01 – Spiegelung beenden
Set-VMNetworkAdapter -VMName WEB01, ANALYSE01 -PortMirroring None

# Alternative auf HV01 – Bordmittel pktmon
pktmon start --capture --file-name C:\Mitschnitt\host.etl
pktmon stop
pktmon etl2pcap C:\Mitschnitt\host.etl --out C:\Mitschnitt\host.pcapng
```

## Szenario
### Kontrollfragen
WEB01 auf HV01 verliert sporadisch Verbindungen. Auf WEB01 darf nichts installiert werden. ANALYSE01 mit Wireshark steht bereit.
- F: Welcher Spiegelungsmodus gehört an WEB01? | A: Source (Quelle).
- F: Welcher Modus gehört an ANALYSE01? | A: Destination (Ziel).
- F: Welche Bedingung muss für Quelle und Ziel gelten? | A: Beide hängen am selben virtuellen Switch auf demselben Host.
- F: Mit welchem Cmdlet wird die Spiegelung eingestellt? | A: Set-VMNetworkAdapter -VMName <VM> -PortMirroring Source/Destination/None
- F: Was ist nach der Analyse zu tun? | A: Spiegelung auf None zurücksetzen und Mitschnitt datenschutzkonform behandeln.

## Legende
### Port-Spiegelung (Port Mirroring)
- Was: Kopieren des Verkehrs einer vNIC (Quelle) an eine andere vNIC (Ziel) am vSwitch.
- Wie: Set-VMNetworkAdapter -PortMirroring Source bzw. Destination.
- Wann: Fehlersuche, wenn auf der betroffenen VM nichts installiert werden darf.
- Wo: Erweiterte Features der Netzwerkkarte in den VM-Einstellungen.
- Warum: Mitschnitt ohne Eingriff in Produktionssysteme und ohne Konfiguration am physischen Switch.

## Karteikarten
- F: Welche Werte kennt -PortMirroring? | A: None, Source, Destination.
- F: Was bedeutet Source? | A: Der Verkehr dieser vNIC wird gespiegelt.
- F: Was bedeutet Destination? | A: Diese vNIC empfängt die gespiegelten Pakete.
- F: Wo stellt man die Port-Spiegelung im GUI ein? | A: VM-Einstellungen → Netzwerkkarte → Erweiterte Features → Portspiegelung.
- F: Welche Einschränkung gilt für Quelle und Ziel? | A: Selber vSwitch auf demselben Host.
- F: Welcher Wireshark-Filter zeigt TCP-Resets? | A: tcp.flags.reset == 1
- F: Welches Bordmittel schneidet ohne Wireshark auf dem Host mit? | A: pktmon (mit pktmon etl2pcap für Wireshark-Format).
- F: Warum Mitschnitte nach der Analyse löschen? | A: Sie enthalten personenbezogene Daten (Datenschutz).

## Quiz
? Welcher Modus wird an der VM eingestellt, deren Verkehr mitgeschnitten werden soll?
* Source
- Destination
- None
- Mirror
! Die Quelle liefert die Kopien.

? Wo muss die Analyse-VM angeschlossen sein?
* Am selben vSwitch auf demselben Host wie die Quelle
- An einem beliebigen Host im selben Failover-Cluster
- An einem internen Switch ohne physische Netzwerkkarte
- Am physischen Switch-Port des Routers (SPAN)
! Die Hyper-V-Spiegelung wirkt innerhalb eines vSwitch.

? Wo wird die Port-Spiegelung konfiguriert?
* An der virtuellen Netzwerkkarte der VM
- Am physischen Netzwerkadapter des Hosts
- Im DHCP-Server
- In den Hyper-V-Einstellungen des Servers
! Erweiterte Features der vNIC bzw. Set-VMNetworkAdapter.

? Welcher Befehl beendet die Spiegelung?
* Set-VMNetworkAdapter -VMName WEB01, ANALYSE01 -PortMirroring None
- Set-VMNetworkAdapter -VMName WEB01, ANALYSE01 -PortMirroring Off
- Set-VMSwitch -Name Extern -PortMirroring Disabled -Force
- Disable-NetAdapter -Name "vEthernet (Extern)" -Confirm:$false
! None ist der Standardwert; „Off“ gibt es als Wert nicht.

? Was ist ein Vorteil der Port-Spiegelung gegenüber Wireshark in WEB01?
* Auf WEB01 muss nichts installiert werden
- Sie verschlüsselt den Verkehr
- Sie beschleunigt die Webanwendung
- Sie ersetzt die Firewall
! Wichtig bei Produktionssystemen.

? Welche Richtung des Verkehrs wird von der Quelle gespiegelt?
* Ein- und ausgehender Verkehr
- Nur eingehender Verkehr
- Nur ausgehender Verkehr
- Nur Broadcasts
! Beide Richtungen landen beim Ziel.

? Welches Werkzeug bietet Windows selbst für Paketmitschnitte auf dem Host?
* pktmon
- tracert
- nslookup
- pathping
! pktmon kann ETL in pcapng umwandeln.

? Was muss beim Umgang mit Mitschnitten beachtet werden?
* Datenschutz: Zweck, Dauer und Löschung festlegen
- Sie dürfen unbegrenzt gespeichert werden
- Sie sind immer anonym
- Sie müssen öffentlich geteilt werden
! Mitschnitte können personenbezogene Daten enthalten.
