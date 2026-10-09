---
id: linux-102-109-3-netzprobleme
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1]
block: LPIC-102
kapitel: LPIC-1 Prüfung 102 – Netzwerkgrundlagen
titel: 109.3 Grundlegende Netzwerkfehlerbehebung
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-102-500-de.pdf]
verweise: [linux-l2-15-netzwerke, linux-102-109-2-netzkonfig, linux-102-109-4-dns]
---

## Profi

### Lernziel (Gewicht 4)
Netzwerkprobleme systematisch von unten nach oben (Schicht für Schicht) eingrenzen.

### Vorgehen
1. **Schicht 1/2**: Link? `ip link`, `ethtool enp0s3` (Link detected), Kabel, Switch-LED, `ip -s link` (Fehlerzähler).
2. **Schicht 3**: IP/Maske/Gateway korrekt? `ip a`, `ip r`. Gateway pingen: `ping -c3 192.168.10.1`. Ziel pingen. `ip neigh` (ARP-Tabelle).
3. **Weg**: `traceroute ziel` (UDP/ICMP), `tracepath`, `mtr`. `traceroute -I` nutzt ICMP.
4. **Namensauflösung**: `ping 8.8.8.8` geht, `ping www.example.com` nicht → DNS-Problem (`/etc/resolv.conf`, `dig`).
5. **Schicht 4**: Lauscht der Dienst? `ss -tulpn` (`-t` TCP, `-u` UDP, `-l` listening, `-p` Prozess, `-n` numerisch). Von außen testen: `nc -zv host 22`, `telnet host 25`, `nmap`. Firewall (`nft list ruleset`, `iptables -L -n`, `firewall-cmd --list-all`, `ufw status`).
6. Logs: `journalctl -u NetworkManager`, `dmesg`.

### Werkzeuge im Detail
- `ping -c 4 -s 1472 -M do ziel` (MTU testen), `ping6`/`ping -6`.
- `netstat -tulpn` (Legacy), `lsof -i :80`, `nc -l 1234` (Listener), `tcpdump -i enp0s3 port 53`.
- `host`, `dig`, `nslookup`, `getent hosts name`.

### Typische Fehlerbilder
- Kein Gateway → nur lokales Netz erreichbar. Falsche Maske → Hosts „im falschen Netz“. DNS fehlt → nur IP-Zugriff. Dienst nicht gestartet/falscher Bind (nur 127.0.0.1). Firewall blockiert. Doppelte IP (ARP-Konflikt: `arping -D`).

## Einfach

Wenn das Internet nicht geht, hilft kein wildes Probieren, sondern **Schritt für Schritt von unten nach oben**, wie bei einer Kette: Ist das Kabel drin? Hat der Rechner eine Adresse? Kommt er zum Router? Kommt er ins Internet? Kann er Namen auflösen? Läuft der gewünschte Dienst?

Die Werkzeuge dafür: `ip a` fragt: „Habe ich eine Adresse?“ `ping 192.168.10.1` fragt den Router: „Bist du da?“ `ping 8.8.8.8` fragt einen Computer im Internet. Geht das, aber `ping www.example.com` nicht, dann stimmt es mit dem **Telefonbuch** (DNS) nicht, die Verbindung selbst ist in Ordnung.

`traceroute` zeigt jeden Zwischenhalt auf dem Weg, wie eine Reiseroute. Dort, wo es aufhört, ist das Problem. Mit `ss -tuln` siehst du, welche Türen (Ports) dein eigener Rechner überhaupt offen hat. Und mit `nc -zv server 22` klopfst du bei einem anderen Rechner an eine bestimmte Tür.

Ganz wichtig: Eine **Firewall** kann Verbindungen verstecken. Wenn Ping geht, aber der Dienst nicht erreichbar ist, schau zuerst dort nach.

## Merksatz
- **Von unten nach oben: Link → IP → Gateway → Ziel → DNS → Port.**
- **IP geht, Name nicht = DNS.**
- **`ss -tulpn` zeigt Dienste, `traceroute` den Weg.**
- **Ping erlaubt ≠ Dienst erreichbar (Firewall).**

## Prüfungsfalle
- `ss -l` zeigt nur lauschende Sockets; ohne `-a` keine aktiven.
- `traceroute` Sternchen `* * *` heißt nicht automatisch Fehler (ICMP gefiltert).
- Ein Dienst, der nur auf 127.0.0.1 lauscht, ist von außen nicht erreichbar.
- `netstat`/`ifconfig` sind Legacy, aber noch in Prüfungsfragen.

## Grafik

### Fehlersuche Schicht für Schicht
1. Admin -> Rechner: ip link (Link up?)
2. Admin -> Rechner: ip a (Adresse da?)
3. Rechner -> Gateway: ping (Router erreichbar?)
4. Rechner -> Internet: ping 8.8.8.8
5. Rechner -> DNS-Server: dig www.example.com
6. Rechner -> Server: nc -zv Server 443

## Lab
**Maschine**: debian01.
```bash
ip link
ip -s link show enp0s3
ping -c 3 192.168.10.1
ping -c 3 8.8.8.8
dig +short www.example.com
traceroute 8.8.8.8
ss -tulpn
nc -zv 192.168.10.20 22
```

## Befehle
- `ping -c 4 host` – Erreichbarkeit
- `traceroute host` – Weg
- `ss -tulpn` – Sockets mit Prozessen
- `nc -zv host port` – Portcheck
- `tcpdump -i eth0 port 53` – Mitschnitt
- `mtr host` – Kombi ping/traceroute
- `ethtool eth0` – Link-Status

## Übungen
- A: Ping auf die IP klappt, auf den Namen nicht. Was ist wahrscheinlich defekt? | L: Die DNS-Auflösung (resolv.conf, DNS-Server).
- A: Wie prüfst du, ob Port 443 auf 10.0.0.5 offen ist? | L: `nc -zv 10.0.0.5 443`
- A: Wie listest du alle lauschenden TCP-Ports mit Prozess? | L: `ss -tlpn`

## Karteikarten
- F: Welcher Befehl zeigt den Weg zum Ziel? | A: traceroute (tracepath, mtr).
- F: Was bedeutet ss -tulpn? | A: TCP+UDP, listening, Prozess, numerisch.
- F: Womit prüft man einen Port ohne Dienst-Client? | A: nc -zv host port
- F: Wie testet man den Link-Status einer Karte? | A: ethtool eth0 oder ip link.
- F: Ping auf IP geht, auf Namen nicht – Ursache? | A: DNS-Problem.
- F: Womit mitschneiden? | A: tcpdump
- F: Wie sieht man die ARP-Tabelle? | A: ip neigh (arp -n)
- F: Was zeigt ip -s link? | A: Statistik mit Fehlerzählern.
- F: Welches Tool kombiniert ping und traceroute? | A: mtr
- F: Welcher Befehl nennt Prozess hinter Port 80? | A: ss -tlpn 'sport = :80' oder lsof -i :80

## Quiz
? Welcher Befehl zeigt lauschende Ports mit Prozessen?
* ss -tulpn
- ip route
- ping -p
- host -l

? Welches Tool zeigt den Weg zu einem Ziel?
* traceroute
- netcat
- nslookup
- ethtool

? IP-Ping geht, Namens-Ping nicht. Wo suchen?
* DNS-Konfiguration
- Kabel
- Subnetzmaske
- MTU

? Wie testet man schnell, ob ein TCP-Port offen ist?
* nc -zv host 22
- ping -p 22 host
- ip port 22
- arp 22

? Welches Tool zeigt den Link-Status der Netzwerkkarte?
* ethtool
- iwconfig only
- netplan
- mtr

? Was bedeutet * * * bei traceroute?
* Keine Antwort (z. B. ICMP gefiltert)
- Ziel ist abgestürzt
- DNS-Fehler
- Maske falsch

? Welcher Befehl zeigt die Nachbartabelle (ARP)?
* ip neigh
- ip route
- ip rule
- ip tunnel

? Mit welchem Tool schneidet man Pakete mit?
* tcpdump
- tcpping
- traceip
- netdump -p

## Lücken
- {traceroute} zeigt die Zwischenstationen.
- Mit {ss} sieht man Sockets.
- Funktioniert Ping auf IP, aber nicht auf Namen, ist {DNS} verdächtig.

## Spickzettel
- Reihenfolge: Link → IP → Gateway → Ziel → DNS → Port → Firewall
- ip a/r/neigh, ethtool
- ping, traceroute, mtr
- ss -tulpn, nc -zv, tcpdump
