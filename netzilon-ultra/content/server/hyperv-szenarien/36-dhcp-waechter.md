---
id: server-hvsz-36
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 36 – Fremder DHCP-Server in Test-VM: DHCP-Wächter und Router-Wächter
stufe: Einsteiger
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-dhcp, az800-vswitch, server-hvsz-35, server-hvsz-37]
---

## Profi

### Ticket
**Kunde meldet:** „Seit heute Mittag bekommen einige PCs Adressen aus 10.0.0.x und kommen nicht mehr ins Internet. Andere funktionieren normal.“
- **Priorität:** hoch (mehrere Arbeitsplätze ohne Netz)
- **Betroffene Maschine:** VM **TEST05** auf **HV01** (Verursacher)

### Ausgangslage
- **HV01.example.com**, Server 2025, vSwitch **„Extern“** im Produktions-LAN 192.168.10.0/24
- Offizieller DHCP-Server: **DC01** (192.168.10.10), Bereich 192.168.10.100–200, Gateway 192.168.10.1
- Ein Azubi hat in der VM **TEST05** eine Linux-basierte Firewall-/Router-Appliance zum Üben installiert. Deren DHCP-Server ist ab Werk aktiv (Bereich 10.0.0.0/24, Gateway 10.0.0.1) – und die VM hängt am externen Switch.

### Analyse
- Auf einem betroffenen Client: `ipconfig /all` → **DHCP-Server: 10.0.0.1** (nicht 192.168.10.10). Dieser fremde DHCP-Server antwortet schneller auf DHCPDISCOVER.
- Am Host: `Get-VMNetworkAdapter -VMName * | Select VMName, IPAddresses` → TEST05 hat 10.0.0.1.
- Die **AD-Autorisierung** von DHCP-Servern hilft hier nicht: Sie wirkt nur bei **Windows**-DHCP-Servern. Appliances, Linux-Dienste oder Router kennen sie nicht.
- Hyper-V bietet pro vNIC:
  - **DHCP-Wächter** (DHCP Guard): verwirft **DHCP-Server-Nachrichten** (z. B. DHCPOFFER, DHCPACK), die von dieser VM kommen.
  - **Router-Wächter** (Router Guard): verwirft **Router-Advertisement-** und **Redirect-Nachrichten** dieser VM (IPv6-Routerankündigungen, ICMP-Umleitungen).
- Beide Optionen werden an VMs aktiviert, die **nicht** DHCP-Server bzw. Router sein dürfen.

### Lösungsweg
1. **Sofort:** TEST05 vom Netz trennen (vNIC vom Switch lösen) oder den DHCP-Dienst stoppen. *Begründung:* Der Schaden breitet sich sonst weiter aus.
2. **DHCP-Wächter und Router-Wächter** an TEST05 (und allen Test-VMs) aktivieren. *Begründung:* Selbst wenn wieder jemand eine DHCP-Rolle installiert, erreicht das Angebot das LAN nicht.
3. TEST05 an einen **privaten/internen Switch** für Übungen verschieben. *Begründung:* Testnetze gehören nicht ins Produktions-LAN.
4. **Betroffene Clients** erneuern: `ipconfig /release` und `ipconfig /renew`. *Begründung:* Sie behalten sonst die falsche Lease bis zum Ablauf.
5. Den offiziellen DHCP-Server **nicht** mit DHCP-Wächter versehen. *Begründung:* Er muss Angebote verschicken dürfen.

### Ergebnis prüfen
- `Get-VMNetworkAdapter -VMName TEST05 | Select VMName, DhcpGuard, RouterGuard` → On/On
- Client: `ipconfig /all` → DHCP-Server 192.168.10.10, Adresse aus 192.168.10.100–200.
- DC01: DHCP-Konsole → Adressleases → Clients wieder vorhanden.

### Vorbeugung
- Standard für alle Test-/Schulungs-VMs: **DHCP Guard + Router Guard On** (Skript oder Vorlage).
- Testumgebungen auf **private** oder **interne** Switches bzw. eigene VLANs.
- Am physischen Netz zusätzlich **DHCP-Snooping** der Switches nutzen.

## Einfach
Stell dir vor, in der Schule verteilt das **Sekretariat** die Schließfachnummern (das ist der richtige DHCP-Server). Jeder neue Schüler fragt laut: „Wer gibt mir ein Schließfach?“

Plötzlich ruft ein anderer Schüler (TEST05) schneller: „Ich! Nimm Fach 10-0-0-5!“ Das Fach gibt es aber gar nicht wirklich, und der neue Schüler findet seine Sachen nie wieder. Genau das passiert mit dem **falschen DHCP-Server**: Die PCs bekommen Adressen, mit denen sie nicht ins Internet kommen.

Hyper-V hat dafür einen **Aufpasser** an der Tür jeder VM:
- Der **DHCP-Wächter** hält der VM den Mund zu, wenn sie Schließfächer verteilen will.
- Der **Router-Wächter** hält ihr den Mund zu, wenn sie behauptet: „Ich bin der Weg nach draußen!“

Den Aufpasser stellt man bei allen VMs auf, die so etwas **nicht** dürfen – aber natürlich **nicht** beim Sekretariat.

## Merksatz
- **DHCP Guard** blockiert DHCP-**Server**-Antworten **der VM**.
- **Router Guard** blockiert Router-Ankündigungen und Redirects **der VM**.
- Aktivieren an VMs, die **kein** DHCP-Server/Router sein dürfen.
- `ipconfig /all` → Zeile **DHCP-Server** verrät den Täter.

## Prüfungsfalle
- DHCP-Wächter gehört **nicht** an den legitimen DHCP-Server.
- Der Wächter wirkt auf **ausgehende** Server-Nachrichten der VM – Clients in der VM bekommen weiterhin Adressen.
- Router Guard betrifft Router Advertisements und Redirects, nicht normales Routing von Paketen.
- Die AD-Autorisierung schützt nur vor nicht autorisierten **Windows**-DHCP-Servern, nicht vor Appliances oder Linux-Diensten.

## Grafik
### Fremder DHCP-Server wird gestoppt
1. Client -> vSwitch: DHCPDISCOVER (Broadcast)
2. TEST05 -> Client: DHCPOFFER 10.0.0.5 – schneller als DC01
3. Client: falsche Adresse, kein Internet
4. Admin -> TEST05: DhcpGuard On, RouterGuard On
5. TEST05 -> vSwitch: DHCPOFFER wird verworfen
6. DC01 -> Client: DHCPOFFER 192.168.10.120 – Netz funktioniert

## Lab
**Nachstellen:** Im **isolierten Lab-Switch** (privat) einen „fremden“ DHCP-Server betreiben und mit dem Wächter stummschalten. Maschinen: **HV01**, VMs **TEST05** (Server 2025, Arbeitsgruppe, DHCP-Rolle als Störer), **CLIENT01**.

### GUI
1. **HV01**: Hyper-V-Manager → Manager für virtuelle Switches → privaten Switch **„LabPriv“** anlegen → TEST05 und CLIENT01 daran anschließen (kein Produktions-LAN!).
2. **TEST05**: statische IP 10.0.0.1/24 → Server-Manager → Rollen → **DHCP-Server** → Bereich 10.0.0.100–200 aktivieren.
3. **CLIENT01**: `ipconfig /release` und `ipconfig /renew` → bekommt 10.0.0.x vom Störer (Fehlerbild).
4. **HV01**: TEST05 → Einstellungen → Netzwerkkarte → **Erweiterte Features** → „**DHCP-Wächter aktivieren**“ und „**Router-Wächter aktivieren**“ → OK.
5. **CLIENT01**: `ipconfig /release`, `ipconfig /renew` → keine Antwort mehr, Client fällt auf APIPA 169.254.x.x zurück – das Angebot von TEST05 kommt nicht mehr durch.
6. **TEST05**: DHCP-Rolle wieder entfernen.

### PowerShell
```powershell
# Auf CLIENT01 – Täter finden
ipconfig /all | Select-String "DHCP-Server"

# Auf HV01 – welche VM hat die fremde Adresse?
Get-VMNetworkAdapter -VMName * | Select-Object VMName, SwitchName, IPAddresses

# Auf HV01 – Wächter für TEST05 und alle Test-VMs
Set-VMNetworkAdapter -VMName TEST05 -DhcpGuard On -RouterGuard On
Get-VM -Name TEST* | Get-VMNetworkAdapter | Set-VMNetworkAdapter -DhcpGuard On -RouterGuard On
Get-VMNetworkAdapter -VMName * | Format-Table VMName, DhcpGuard, RouterGuard

# Auf CLIENT01 – Lease erneuern
ipconfig /release
ipconfig /renew
```

## Szenario
### Kontrollfragen
Clients erhalten Adressen aus 10.0.0.0/24. ipconfig /all zeigt DHCP-Server 10.0.0.1. Die Adresse gehört zur VM TEST05 auf HV01.
- F: Welche Hyper-V-Funktion verhindert, dass TEST05 DHCP-Angebote verteilt? | A: DHCP-Wächter (DhcpGuard) an der vNIC von TEST05.
- F: Wogegen schützt der Router-Wächter? | A: Gegen Router-Advertisement- und Redirect-Nachrichten der VM.
- F: Darf der DHCP-Wächter auf DC01 (legitimer DHCP) aktiviert werden? | A: Nein, sonst verteilt der echte DHCP-Server keine Adressen mehr.
- F: Was müssen betroffene Clients tun? | A: ipconfig /release und ipconfig /renew.
- F: Wie verhinderst du das Problem dauerhaft? | A: Wächter als Standard für Test-VMs und Testumgebungen an private/interne Switches oder eigene VLANs.

## Legende
### DHCP-Wächter (DHCP Guard)
- Was: vNIC-Option, die DHCP-Server-Nachrichten der VM verwirft.
- Wie: Set-VMNetworkAdapter -DhcpGuard On oder Erweiterte Features der Netzwerkkarte.
- Wann: An allen VMs, die kein DHCP-Server sein dürfen (Test, Schulung, Mandanten).
- Wo: Am virtuellen Switch-Port der VM.
- Warum: Verhindert falsche IP-Konfigurationen im ganzen Netz durch fremde DHCP-Server.
### Router-Wächter (Router Guard)
- Was: vNIC-Option, die Router-Advertisements und Redirects der VM verwirft.
- Warum: Verhindert, dass sich eine VM als Gateway ausgibt.

## Karteikarten
- F: Was blockiert der DHCP-Wächter? | A: DHCP-Server-Nachrichten (z. B. DHCPOFFER), die von der VM ausgehen.
- F: Was blockiert der Router-Wächter? | A: Router-Advertisement- und Redirect-Nachrichten der VM.
- F: Cmdlet zum Aktivieren beider Wächter? | A: Set-VMNetworkAdapter -VMName VM -DhcpGuard On -RouterGuard On
- F: Wo findet man die Wächter im GUI? | A: VM-Einstellungen → Netzwerkkarte → Erweiterte Features.
- F: Woran erkennt ein Client den falschen DHCP-Server? | A: ipconfig /all zeigt eine fremde Adresse in der Zeile DHCP-Server.
- F: An welcher VM darf man den DHCP-Wächter nicht aktivieren? | A: Am legitimen DHCP-Server.
- F: Warum schützt die AD-Autorisierung hier nicht? | A: Sie gilt nur für Windows-DHCP-Server; eine Linux-Appliance kennt sie nicht.
- F: Wie findest du auf dem Host die VM zur fremden IP? | A: Get-VMNetworkAdapter -VMName * \| Select-Object VMName, IPAddresses

## Quiz
? Welche Option verhindert, dass eine Test-VM DHCP-Adressen im LAN verteilt?
* DHCP-Wächter an der vNIC der Test-VM
- MAC-Spoofing an der Test-VM
- Port-Spiegelung Destination
- Router-Wächter am DHCP-Server
! DHCP Guard verwirft die Server-Nachrichten der VM.

? Was blockiert der Router-Wächter?
* Router-Advertisements und Redirects der VM
- Alle Pakete an das Gateway
- DNS-Anfragen der VM
- DHCP-Anfragen von Clients
! Die VM kann sich nicht als Router ausgeben.

? Wo aktiviert man DHCP- und Router-Wächter im GUI?
* VM-Einstellungen → Netzwerkkarte → Erweiterte Features
- Manager für virtuelle Switches → Erweiterungen
- DHCP-Konsole → Filter
- Hyper-V-Einstellungen → Server
! Es ist eine Einstellung pro vNIC.

? Welcher Befehl zeigt auf dem Client, welcher DHCP-Server geantwortet hat?
* ipconfig /all
- ipconfig /flushdns
- route print
- arp -d
! Zeile „DHCP-Server“.

? An welcher VM ist DHCP Guard falsch?
* Am legitimen DHCP-Server DC01
- An einer Test-VM
- An einer Schulungs-VM
- An einer Webserver-VM
! Dort würden keine Angebote mehr ankommen.

? Was müssen falsch konfigurierte Clients nach der Behebung tun?
* Ihre Lease mit ipconfig /release und /renew erneuern
- Neu installiert werden
- Der Domäne neu beitreten
- Eine statische IP aus 10.0.0.0/24 bekommen
! Sonst behalten sie die falsche Adresse bis zum Lease-Ablauf.

? Welche Maßnahme ist dauerhaft am sinnvollsten?
* Testumgebungen an private/interne Switches und Wächter als Standard
- DHCP im ganzen Netz abschalten
- Alle Leases auf 1 Minute setzen
- MAC-Spoofing für alle VMs aktivieren
! Trennung plus Schutz an der vNIC.

? Welcher Parameter gehört zum DHCP-Wächter?
* -DhcpGuard On
- -DhcpRelay On
- -PortMirroring Source
- -MacAddressSpoofing Off
! Gehört zu Set-VMNetworkAdapter.
