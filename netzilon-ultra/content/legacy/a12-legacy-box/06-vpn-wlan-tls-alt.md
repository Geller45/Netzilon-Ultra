---
id: legacy-vpn-wlan-tls
bereich: Legacy
block: A12
kapitel: Legacy-Box
titel: Veraltete VPN-, WLAN- und TLS-Verfahren
stufe: Fortgeschritten
quellen: [IEEE 802.11, RFC 8996 (TLS 1.0/1.1 abgekündigt), Microsoft RRAS-Doku, eigene Zusammenstellung]
verweise: [ap1-a5-vpn, ap2-netzwerk-design, ap2-kryptografie, legacy-klartextprotokolle]
---

## Profi

### VPN-Protokolle im Vergleich
| Protokoll | Ports/Protokoll | Verschlüsselung | Status |
|---|---|---|---|
| **PPTP** | **TCP 1723 + GRE (IP-Protokoll 47)** | MPPE (RC4), Anmeldung **MS-CHAPv2** | **Unsicher, Legacy** (MS-CHAPv2 in Minuten knackbar) |
| **L2TP (ohne IPsec)** | UDP 1701 | keine | Nur Tunnel, **unbrauchbar allein** |
| **L2TP/IPsec** | **UDP 500 (IKE), UDP 4500 (NAT-T), UDP 1701**, ESP (Protokoll 50) | IPsec (AES) | Noch akzeptabel, aber **in RRAS Server 2025 nicht weiterentwickelt** (standardmäßig deaktiviert) |
| **SSTP** | **TCP 443** | TLS | Gut, Firewall-freundlich, nur Windows |
| **IKEv2/IPsec** | **UDP 500/4500** | AES, Zertifikat/EAP | **Empfohlen**, **MOBIKE** (Netzwechsel), Standard bei **Always On VPN** |
| **OpenVPN / WireGuard** | UDP/TCP 1194 bzw. UDP 51820 | TLS bzw. ChaCha20 | Modern, Linux/Firewalls |

### DirectAccess → Always On VPN
**DirectAccess** (ab Server 2008 R2) verband Domänen-Clients automatisch über **IPv6/IPsec (IP-HTTPS)** mit dem Firmennetz. Es ist **deprecated** und wird **nicht mehr weiterentwickelt**. Nachfolger: **Always On VPN** (**IKEv2** oder SSTP, Zertifikate/**Entra ID**, **Device Tunnel** + **User Tunnel**, Konfiguration per **Intune/MDM oder ProfileXML**), oder **Azure VPN/Zero-Trust-Zugriff**.

### WLAN-Sicherheit
| Verfahren | Jahr | Verschlüsselung | Status |
|---|---|---|---|
| **WEP** | 1997 | RC4, 64/128 Bit, IV nur 24 Bit | **Innerhalb von Minuten knackbar**, verboten |
| **WPA** | 2003 | **TKIP** (RC4) | **Legacy**, unsicher |
| **WPA2** | 2004 | **AES-CCMP** | Standard, aber **PSK offline knackbar**, **KRACK** (2017) |
| **WPA3** | 2018 | **AES-GCMP (256 Bit im Enterprise)**, **SAE** statt PSK | **Empfohlen**; Pflicht für Wi-Fi 6E/7 |
Modi: **Personal (PSK/SAE)** für Heim, **Enterprise (802.1X, RADIUS/NPS, EAP-TLS/PEAP)** für Firmen. **WPS-PIN** ist ebenfalls angreifbar → aus. **Offenes WLAN** mit **OWE** (Enhanced Open) verschlüsselt ohne Kennwort.

**WLAN-Standards** (Namen): 802.11b (Wi-Fi 1, 2,4 GHz, 11 Mbit/s), a (5 GHz, 54), g (2,4 GHz, 54), **n** (Wi-Fi 4, 2,4/5 GHz, 600), **ac** (Wi-Fi 5, 5 GHz, ~6,9 Gbit/s), **ax** (Wi-Fi 6/6E, 2,4/5/6 GHz), **be** (Wi-Fi 7). **b/g** und **WEP/TKIP** sind Legacy und verlangsamen zudem das ganze WLAN (Kompatibilitätsmodus).

### TLS/SSL-Versionen
| Version | Status |
|---|---|
| **SSL 2.0/3.0** | **Gebrochen** (**POODLE** 2014), verboten |
| **TLS 1.0 / 1.1** | **Abgekündigt** (RFC 8996, 2021), Browser haben sie abgeschaltet; in Server 2025 nicht mehr weiterentwickelt |
| **TLS 1.2** | **Weiter zulässig** (mit AES-GCM, ECDHE) |
| **TLS 1.3** | **Empfohlen** (schneller, nur starke Suiten, **Forward Secrecy** Pflicht); Windows Server 2022 und 2025 |
Veraltete **Cipher/Hash**: **RC4**, **DES/3DES**, **MD5**, **SHA-1** (auch bei Zertifikaten, seit ca. 2017 nicht mehr akzeptiert), **RSA-1024**, **Export-Cipher**. Empfehlung: **RSA ≥ 2048 (besser 3072) oder ECDSA P-256**, **SHA-256**.

### Windows-Umsetzung
- **SCHANNEL** (Registry unter `HKLM\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Protocols\TLS 1.0\Server` → `Enabled=0`, `DisabledByDefault=1`) oder **IIS Crypto**.
- **Cipher-Suite-Reihenfolge** per GPO: *Computerkonfiguration → Administrative Vorlagen → Netzwerk → SSL-Konfigurationseinstellungen*.
- **RRAS**: nicht benötigte Ports (PPTP, L2TP) **entfernen**, nur **SSTP/IKEv2** lassen.
- **Prüfen**: `nmap --script ssl-enum-ciphers -p 443 <Host>`, **SSL Labs**-Test.

## Lab
**Maschinen**: **RRAS01** (VPN-Server), **CL01** (Client), **AP01** (WLAN-Access-Point/Router), **WEB01** (IIS).

### GUI
1. **RRAS01**: Server-Manager → Routing und RAS → Rechtsklick Server → **Eigenschaften → Ports** → **PPTP** und **L2TP**: Ports auf **0** setzen; **SSTP/IKEv2** behalten.
2. **RRAS01**: Rechtsklick Server → **Eigenschaften → Sicherheit → Authentifizierungsmethoden** → **MS-CHAPv2** nur zusammen mit **EAP/Zertifikat**; **CHAP/PAP** deaktivieren.
3. **CL01**: **Einstellungen → Netzwerk → VPN → VPN-Verbindung hinzufügen** → Typ **IKEv2** (nicht „Automatisch“, nicht PPTP).
4. **AP01**: Weboberfläche → Wireless → Sicherheit → **WPA3-Personal (SAE)** oder **WPA2/WPA3-gemischt**; **WEP, WPA/TKIP und WPS deaktivieren**.
5. **WEB01**: **IIS Crypto** starten → Template **Best Practices** → **TLS 1.0/1.1 aus**, **TLS 1.2/1.3 an** → Neustart.
6. **CL01**: Browser oder `nmap` zum Test: Verbindung mit TLS 1.0 scheitert.

### PowerShell
```powershell
# Auf RRAS01 – VPN-Ports und Protokolle ansehen/anpassen
Get-VpnServerConfiguration
Set-VpnServerConfiguration -TunnelType IKEv2, SSTP

# Auf CL01 – VPN-Verbindung IKEv2 anlegen
Add-VpnConnection -Name "Firma" -ServerAddress vpn.firma.de -TunnelType Ikev2 `
  -AuthenticationMethod EAP -EncryptionLevel Required

# Auf WEB01 – TLS 1.0 abschalten (Server)
$path = "HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Protocols\TLS 1.0\Server"
New-Item $path -Force | Out-Null
New-ItemProperty $path -Name Enabled -Value 0 -PropertyType DWord -Force
New-ItemProperty $path -Name DisabledByDefault -Value 1 -PropertyType DWord -Force
```

## Befehle
- `Get-VpnServerConfiguration` – VPN-Server-Einstellungen (Tunneltypen, Ports)
- `Add-VpnConnection -TunnelType Ikev2` – VPN-Verbindung auf dem Client anlegen
- `netsh wlan show profiles` – Gespeicherte WLAN-Profile
- `netsh wlan show interfaces` – Aktuelle WLAN-Verbindung mit Authentifizierung/Verschlüsselung
- `nmap --script ssl-enum-ciphers -p 443 host` – Unterstützte TLS-Versionen und Cipher

## Einfach

**VPN** ist ein **geheimer Tunnel** unter der Straße zwischen zwei Häusern (Firma und Zuhause). Es gibt verschiedene Tunnelbauer:
- **PPTP** hat einen **Holzverschlag** gebaut: Man kann durchlaufen, aber **jeder kann die Bretter auseinanderbiegen**. Nicht mehr benutzen!
- **L2TP** baut nur die **Röhre**, aber **ohne Wände** – man braucht **IPsec** als Betonmantel.
- **SSTP** baut einen Tunnel **durch die Haupt-Straße (Port 443)** – da lässt jeder Türsteher durch.
- **IKEv2** ist der **Hightech-Tunnel** und **repariert sich selbst**, wenn du vom WLAN ins Mobilfunknetz wechselst.

**WLAN-Verschlüsselung** ist wie das **Schloss an der Haustür**:
- **WEP** = **Zahlenschloss aus Pappe**: In Minuten offen.
- **WPA/TKIP** = **altes Vorhängeschloss**: auch noch aufbrechbar.
- **WPA2** = **gutes Sicherheitsschloss**, aber wer den **Schlüsselzettel (Passwort)** findet, kommt rein.
- **WPA3** = **Schloss mit Einmalschlüssel** für jeden Besucher.

**TLS** ist die **Geheimsprache** für Webseiten. Alte Versionen (**SSL, TLS 1.0/1.1**) sind so, als würde man einen Geheimcode benutzen, der **schon im Internet veröffentlicht** wurde. Moderne Browser sprechen nur noch **TLS 1.2 und 1.3**.

## Merksatz
- **PPTP = TCP 1723 + GRE 47, unsicher.**
- **SSTP = TCP 443**, **IKEv2 = UDP 500/4500**.
- **WEP < WPA/TKIP < WPA2/AES < WPA3/SAE**.
- **TLS 1.0/1.1 aus**, **TLS 1.2/1.3 an**.
- **SHA-1 und MD5** in Zertifikaten = Legacy.
- **Always On VPN ersetzt DirectAccess.**

## Prüfungsfalle
- **L2TP allein verschlüsselt nicht** – nur **L2TP/IPsec**.
- **WPA2 ist nicht „unsicher“**, aber **PSK offline knackbar** bei schwachem Kennwort.
- **802.1X/Enterprise** braucht **RADIUS (NPS)**, nicht nur ein Kennwort.
- **Standard 802.11n** kann 2,4 **und** 5 GHz, **ac** nur 5 GHz.
- **TLS 1.3** verlangt **Forward Secrecy** und entfernt alte Suiten.

## Grafik
### Tunnelvergleich
Fünf Tunnel nebeneinander (PPTP Holz, L2TP Röhre, L2TP/IPsec Beton, SSTP Straßentunnel, IKEv2 Hightech). Ein Angreifer versucht sich durchzubohren; nur die letzten drei halten.

### WLAN-Schloss-Reihe
Vier Schlösser von Pappe über Vorhängeschloss und Sicherheitsschloss bis zum Einmalschlüssel; Klick startet die Knack-Animation mit Zeit („WEP: 2 Minuten“).

## Karteikarten
- F: Ports von PPTP? | A: TCP 1723 und GRE (IP-Protokoll 47).
- F: Ports von L2TP/IPsec? | A: UDP 500, 4500 und 1701 (dazu ESP, Protokoll 50).
- F: Port von SSTP? | A: TCP 443.
- F: Welches VPN wird für Always On VPN empfohlen? | A: IKEv2.
- F: Wovon löst Always On VPN ab? | A: DirectAccess.
- F: Warum ist PPTP unsicher? | A: MS-CHAPv2 und RC4 sind knackbar.
- F: Reihenfolge der WLAN-Sicherheit von schwach nach stark? | A: WEP, WPA/TKIP, WPA2/AES, WPA3.
- F: Was ersetzt WPA3 gegenüber dem PSK? | A: SAE (Simultaneous Authentication of Equals).
- F: Was braucht WPA2/WPA3 Enterprise? | A: 802.1X mit RADIUS (z. B. NPS).
- F: Welche TLS-Versionen sind heute Legacy? | A: SSL 2.0/3.0, TLS 1.0 und 1.1.
- F: Welche Hashes gelten als veraltet? | A: MD5 und SHA-1.
- F: Welche Schlüssellänge ist für RSA mindestens empfohlen? | A: 2048 Bit (besser 3072).

## Quiz
? Welche VPN-Art nutzt TCP 443?
* SSTP
- PPTP
- L2TP/IPsec
- IKEv2

? Welche Protokolle braucht PPTP?
* TCP 1723 und GRE
- UDP 500 und ESP
- TCP 443
- UDP 1194

? Was ersetzt DirectAccess?
* Always On VPN
- PPTP
- Remote Desktop Gateway
- Windows Update

? Welches WLAN-Verfahren gilt als sofort knackbar?
* WEP
- WPA2 mit langem Kennwort
- WPA3
- WPA2-Enterprise

? Was ersetzt in WPA3-Personal den Pre-Shared-Key-Austausch?
* SAE
- TKIP
- WEP
- MS-CHAPv2

? Welche TLS-Version ist heute abgekündigt?
* TLS 1.0
- TLS 1.2
- TLS 1.3
- Alle
