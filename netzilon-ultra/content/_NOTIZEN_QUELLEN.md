# Quellnotizen für spätere Blöcke (nicht in der App anzeigen)

## Aufgaben10.pdf (Scan, AP „Event GmbH“) → A4 / A5
- Einheiten-Hinweis: Speicher MiB = 1024·1024 Byte; Transferrate PCI in MB/s = 1000·1000 Byte/s; Ethernet/DSL in Mbit/s = 1000·1000 bit/s
- 1aa: Zwei Gründe für VLANs (Abteilungen Verwaltung, Entwicklung, Management)
- 1ab: 802.1Q-Tag: TPID 16 Bit (0x8100), TCI = PCP 3 Bit, DEI 1 Bit, VID 12 Bit → max. VLANs 2^12 = 4096, minus 0 und 4095 reserviert = 4094
- 1ac: Warum Tagging zwischen Switches (Core-Switch ↔ WS-03) zwingend: Trunk transportiert mehrere VLANs über einen Link
- 1b: Subnetze mit minimaler Adresszahl, Gateway = letzte nutzbare IP:
  - Verwaltung 192.168.10.0, 54 Hosts → /26 255.255.255.192, GW 192.168.10.62
  - Entwicklung 192.168.20.0, 28 Hosts → /27 255.255.255.224, GW 192.168.20.30
  - Management 192.168.40.0, 5 Hosts → /29 255.255.255.248, GW 192.168.40.6
- 1ca: Routingtabelle L3-Core-Switch: 172.16.31.0/30 Fa0/8, 192.168.10.0/26 Vlan10, 192.168.20.0/27 Vlan20, 192.168.40.0/29 Vlan199 → Fehler: keine Default-Route → 0.0.0.0/0 via 172.16.31.1
- 1cb: Router: 80.90.100.0/30 Fa0/1, 172.16.31.0/30 Fa0/0, 192.168.0.0/19 via 172.16.31.2, 192.168.250.0/29 Fa1/0 (DMZ, Webserver 192.168.250.1/29), 0.0.0.0/0 via 80.90.100.1 → Management geht nicht: /19 umfasst nur 192.168.0.0–192.168.31.255, nicht 192.168.40.0 → /18 oder zusätzliche Route 192.168.40.0/29 via 172.16.31.2
- Netzplan: Router/Firewall/VPN-Gateway WAN 80.90.100.2/30, LAN 172.16.31.1/30, Core-Switch Port 8 172.16.31.2/30, DMZ 192.168.250.0/29, Remote-Administration iKomP AG
- 2a: Tool-Zuordnung: MAC eigener Rechner → ipconfig /all; Hostname → ipconfig /all (hostname); Gateway-IP → ipconfig; Gateway-MAC → arp -a; www.ihk.de IPv6 → nslookup (AAAA); IPv6-Netz-ID → ipconfig; Hops → tracert; Erreichbarkeit fortlaufend → ping -t
- 2b: MTU ermitteln: ping -f -l <Größe> Ziel, Größe variieren bis keine Fragmentierungsmeldung; MTU = Nutzlast + 28 Byte (20 IP-Header + 8 ICMP), z. B. ping -f -l 1472 www.future-gmbh.de → MTU 1500
