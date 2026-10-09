---
id: az801-domaenenisolierung
bereich: AZ-801
block: A9
kapitel: Sicherheit
titel: Domänenisolierung und Serverisolierung
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-firewall-lokal, az801-ipsec-verbindungssicherheit, az801-dc-haertung, ap1-a6-kerberos]
---

## Profi

### Idee
Bei der **Domänenisolierung** (*Domain Isolation*) akzeptieren **Domänenmitglieder** **eingehenden Verkehr nur von anderen authentifizierten Domänenmitgliedern**. **Fremde Geräte** (**Gast-Laptop**, **nicht verwaltete** PCs) **werden abgewiesen** – **auch wenn** sie **im selben Netz** hängen.

Umgesetzt wird das mit **Verbindungssicherheitsregeln** (**IPsec**, Seite 13) **plus** **Firewall-Regeln** (Seite 11), **verteilt per GPO**.

### Isolierungsarten
| Art | Wirkung |
|---|---|
| **Domänenisolierung** | **Alle** Domänenmitglieder **sprechen nur miteinander**; **Nicht-Mitglieder** **abgewiesen** |
| **Serverisolierung** (*Server Isolation*) | **Bestimmte Server** (**Finanz-DB**) **nur** von **erlaubten Computern/Benutzern/Gruppen**; **zusätzlich** zur **Domänenisolierung** möglich |
| **Verschlüsselung** | **Optional**: **Datenverkehr** (**ESP**) **verschlüsseln** (**Zone „Verschlüsselt“**) |

### Zonenmodell
| Zone | Beschreibung | Eingehend | Ausgehend |
|---|---|---|---|
| **Vertrauenswürdig** (*Trusted*) | **Standard-Domänenmitglieder** | **Authentifizierung erforderlich** | **Anfordern** (*Request*) |
| **Grenzzone** (*Boundary*) | **Server**, die **auch** **Nicht-Mitglieder** bedienen (**Web-Frontend**) | **Anfordern** | **Anfordern** |
| **Nicht vertrauenswürdig** (*Untrusted*) | **Fremdgeräte**, **Gäste**, **Altsysteme** | **keine IPsec-Anforderung** | – |
| **Ausnahmen** (*Exempt*) | **Infrastruktur**: **DHCP**, **DNS**, **DCs**, **Router**, **Drucker ohne IPsec** | **Keine Authentifizierung** | – |

### Authentifizierungsstufen bei Regeln
| Einstellung | Bedeutung |
|---|---|
| **Anfordern** (*Request*) | **Versucht** IPsec, **fällt bei Misserfolg** auf **Klartext** **zurück** |
| **Erfordern** (*Require*) | **Ohne IPsec** **keine Verbindung** |
| **Eingehend erfordern, ausgehend anfordern** | **Typische Isolierung**: **Server** nimmt **nur** **IPsec** an, **Clients** versuchen **es** |
| **Eingehend und ausgehend erfordern** | **Strengste** Stufe (**Server-zu-Server**) |

**Best Practice (Einführung)**
1. **Anfordern**/**Anfordern** (**Pilot**, **Logging**).
2. **Ereignisse** und **Sicherheitszuordnungen** prüfen.
3. **Eingehend erfordern**/**ausgehend anfordern** (**Produktion**).
4. **Ausnahmen** für **Infrastruktur** **prüfen**.

### Authentifizierungsmethoden
| Methode | Verwendung |
|---|---|
| **Computer (Kerberos V5)** | **Standard** in **AD** – **nur Domänenmitglieder** |
| **Benutzer (Kerberos V5)** | **Zusätzlich** **Benutzeridentität** (**Serverisolierung** nach **Benutzer/Gruppen**) |
| **Computerzertifikat** | **Nicht-Domänenmitglieder**, **Linux**, **Partner** (**PKI**, **AD CS**) |
| **NTLMv2** | **Nur Notlösung** |
| **Integritätszertifikat** | **NAP** (**Legacy**) |

**Wichtig**: **Kerberos** braucht **Zugriff** auf **DCs** → **DCs** **nicht** mit **Erfordern** aussperren (**Ausnahmeregel**/**Anfordern**).

### Regeln in der Praxis
| Aufgabe | Werkzeug |
|---|---|
| **Isolationsregel** (**Domänenisolierung**) | **wf.msc → Verbindungssicherheitsregeln → Neue Regel → Isolierung** |
| **Authentifizierungsausnahme** | **Neue Regel → Authentifizierungsausnahme** (**IP-Bereich** von **DCs/DNS/DHCP**) |
| **Server-zu-Server** | **Neue Regel → Server-zu-Server** (**Endpunkt 1/2**) |
| **Verteilung** | **GPO** **an Domäne/OU**, **WMI-Filter** oder **Sicherheitsgruppenfilter** |
| **Firewall-Regel** | **„Zulassen, wenn sicher“** (**Benutzer/Computer** **einschränken**) |

### PowerShell
```powershell
# Auf DC01 (in GPO-Sitzung) oder lokal auf SRV01 – Kerberos-Authentifizierungssatz
$auth = New-NetIPsecAuthProposal -Machine -Kerberos
$set  = New-NetIPsecPhase1AuthSet -DisplayName "Kerberos-Computer" -Proposal $auth

# Isolationsregel: eingehend erfordern, ausgehend anfordern
New-NetIPsecRule -DisplayName "Domänenisolierung" `
  -InboundSecurity Require -OutboundSecurity Request `
  -Phase1AuthSet $set.Name

# Ausnahme für Infrastruktur (DC/DNS/DHCP) – Firewall-Regel ohne IPsec-Anforderung
New-NetFirewallRule -DisplayName "Infrastruktur ohne IPsec" -Direction Inbound `
  -RemoteAddress 10.0.0.10,10.0.0.11 -Action Allow

# Prüfen
Get-NetIPsecRule | Select-Object DisplayName, InboundSecurity, OutboundSecurity, Enabled
Get-NetIPsecMainModeSA
Get-NetIPsecQuickModeSA
```
**GPO-Weg**: `New-NetIPsecRule -GPOSession` **mit** `Open-NetGPO -PolicyStore example.com\GPO-Isolierung` (**Speichern** mit `Save-NetGPO`).

### Überwachung und Fehlersuche
| Werkzeug | Zweck |
|---|---|
| `wf.msc → Überwachung → Sicherheitszuordnungen → Hauptmodus/Schnellmodus` | **Aktive** **IPsec-Verbindungen** |
| **Ereignis 4650/4651** (**Sicherheitsprotokoll**) | **Hauptmodus-SA** **erstellt** |
| **Ereignis 5451/5452** | **Schnellmodus-SA** **erstellt/beendet** |
| **Ereignis 4653** | **IKE-Fehler** |
| `netsh advfirewall monitor show mmsa` / `qmsa` | **CLI-Anzeige** von **Sicherheitszuordnungen** |
| **pfirewall.log** | **Abgewiesene** Pakete |

## Lab
**Maschinen**: **DC01** (10.0.0.10), **SRV01** (Mitgliedsserver, 10.0.0.20), **CLIENT01** (Domäne), **GAST01** (**nicht** in der Domäne, 10.0.0.99).

### GUI
1. **DC01**: **GPMC** → **Neue GPO** `GPO-Domaenenisolierung` an **Domäne** (**Test-OU** bevorzugt).
2. **DC01**: **Computerkonfiguration → Windows-Einstellungen → Sicherheitseinstellungen → Windows Defender Firewall mit erweiterter Sicherheit → Verbindungssicherheitsregeln → Neue Regel**.
3. **DC01**: **Isolierung** → **Authentifizierung anfordern für eingehende und ausgehende Verbindungen** (**Pilot**) → **Computer (Kerberos V5)** → **Profile: Domäne** → Name **Domänenisolierung**.
4. **DC01**: **Neue Regel → Authentifizierungsausnahme** → **Hinzufügen → 10.0.0.10** (**DC**) → **Ausnahme für DC**.
5. **CLIENT01** und **SRV01**: `gpupdate /force`.
6. **CLIENT01**: `ping SRV01` → **Erfolg**. **SRV01**: **wf.msc → Überwachung → Sicherheitszuordnungen → Hauptmodus** → **Eintrag CLIENT01** sichtbar.
7. **DC01**: **Regel ändern** auf **Eingehend erfordern, ausgehend anfordern** → `gpupdate /force`.
8. **GAST01**: `Test-NetConnection 10.0.0.20 -Port 445` → **Fehlschlag** (**abgewiesen**).
9. **CLIENT01**: `Test-NetConnection SRV01 -Port 445` → **Erfolg**.

### PowerShell
```powershell
# Auf SRV01 – Zustand prüfen
gpupdate /force
Get-NetIPsecRule | Select-Object DisplayName, InboundSecurity, OutboundSecurity
Get-NetIPsecMainModeSA | Select-Object RemoteAddress, AuthenticationMethod

# Auf GAST01
Test-NetConnection -ComputerName 10.0.0.20 -Port 445

# Auf CLIENT01
Test-NetConnection -ComputerName SRV01 -Port 445
```

## Einfach

Ein **Club**: **Nur Mitglieder mit Ausweis** kommen rein.

- **Domänenisolierung** = **alle Firmengeräte** haben einen **Ausweis (Kerberos)** und **erkennen sich gegenseitig**. **Fremde Geräte** (Gast-Laptop) **bleiben draußen** – **auch im selben Gebäude**.
- **Serverisolierung** = **VIP-Bereich**: **Der Finanz-Server** lässt **nur bestimmte Leute** rein.
- **Grenzzone** = **Empfang**: **Dort** dürfen **auch Gäste** hin.
- **Ausnahmen** = **Notausgang und Pförtner**: **DC**, **DNS**, **DHCP** müssen **immer erreichbar** sein, **sonst** bekommt **niemand** einen **Ausweis**.

**Einführung mit Sicherheitsnetz**:
1. **Erst „Bitte Ausweis zeigen“** (**Anfordern**), **aber wer keinen hat, darf trotzdem** – **nur mitschreiben**.
2. **Dann prüfen**, ob **alles** klappt.
3. **Dann „Ohne Ausweis kein Zutritt“** (**Erfordern**).

## Merksatz
- **Domänenisolierung** = **IPsec + Kerberos**, **nur Domänenmitglieder**.
- **Eingehend erfordern**, **ausgehend anfordern** = **Standard-Isolierung**.
- **Erst Request, dann Require**.
- **DC/DNS/DHCP** = **Ausnahmen**.
- **Grenzzone** für **Server**, die **Nicht-Mitglieder** bedienen.
- **Serverisolierung** = **Zugriff nach Computer/Benutzer/Gruppe**.

## Prüfungsfalle
- **DCs** **nicht** mit **Erfordern** **abschotten** – **Kerberos** **bricht** zusammen.
- **Verbindungssicherheitsregeln** **allein** **blockieren nicht** – **ohne Erfordern** nur **„wenn möglich“**.
- **Kerberos-Authentifizierung** **funktioniert nur** für **Domänenmitglieder** – **Fremdgeräte** brauchen **Zertifikate**.
- **Serverisolierung** **braucht** **Firewall-Regel „Zulassen, wenn sicher“** **mit** **Benutzer-/Computerfilter**.
- **Verschlüsselung** ist **optional** – **Isolierung** ≠ **Verschlüsselung**.
- **Sicherheitsprotokoll** enthält **Ereignisse** (**4650/4651/5451**) **nur** bei **aktivierter Überwachung** (**Filterplattform**).
- **GPO** **erst** an **Test-OU** – **fehlerhafte Regeln** **legen** **Kommunikation lahm**.
- **Isolierung** schützt **nicht** vor **kompromittierten** **Domänenmitgliedern**.

## Grafik
### Club mit Ausweis
Türsteher (Firewall) vor Clubtür; Firmen-PCs zeigen Ausweis (Kerberos), Gast-Laptop wird abgewiesen.

### Zonen
Vier Kreise: Vertrauenswürdig (grün), Grenzzone (gelb), Nicht vertrauenswürdig (rot), Ausnahmen (blau, DC/DNS/DHCP).

### Einführungs-Schalter
Schalter Request (gelb), Require (rot); Fortschrittsbalken „Pilot → Produktion“.

## Karteikarten
- F: Was bewirkt Domänenisolierung? | A: Domänenmitglieder akzeptieren nur Verkehr von authentifizierten Domänenmitgliedern.
- F: Womit wird sie umgesetzt? | A: IPsec-Verbindungssicherheitsregeln plus Firewall-Regeln per GPO.
- F: Was ist Serverisolierung? | A: Bestimmte Server erlauben Zugriff nur für definierte Computer/Benutzer/Gruppen.
- F: Was ist die Grenzzone? | A: Server, die auch Nicht-Domänenmitglieder bedienen (Anfordern statt Erfordern).
- F: Empfohlene Einstellung für Isolierung? | A: Eingehend erfordern, ausgehend anfordern.
- F: Wie startet man den Betrieb? | A: Zuerst Anfordern (Pilot), dann Erfordern.
- F: Welche Server brauchen Ausnahmen? | A: DCs, DNS, DHCP.
- F: Welche Authentifizierung ist Standard? | A: Computer (Kerberos V5).
- F: Womit authentifizieren sich Nicht-Domänenmitglieder? | A: Mit Computerzertifikaten (PKI).
- F: Wo sieht man aktive IPsec-Verbindungen? | A: wf.msc → Überwachung → Sicherheitszuordnungen.
- F: Welches Cmdlet erstellt IPsec-Regeln? | A: New-NetIPsecRule

## Quiz
? Nur Domänenmitglieder sollen untereinander kommunizieren dürfen, Gastgeräte nicht. Lösung?
* Domänenisolierung mit IPsec-Verbindungssicherheitsregeln per GPO
- Zweites VLAN ohne Regeln
- NSG in Azure
- Kennwortrichtlinie

? Ein Webserver soll auch von Nicht-Domänen-Clients erreichbar sein. Wie konfigurieren?
* Grenzzone (Authentifizierung anfordern statt erfordern)
- Eingehend und ausgehend erfordern
- Zusätzliche Domänenisolierung
- Firewall deaktivieren

? Wie geht man bei der Einführung von Isolierungsregeln vor?
* Erst Anfordern, Ergebnisse prüfen, dann Erfordern
- Direkt überall Erfordern
- Nur auf DCs erfordern
- Ohne GPO lokal testen

? Warum dürfen DCs nicht mit Erfordern eingeschränkt werden?
* Kerberos-Anmeldung braucht DC-Erreichbarkeit
- DCs unterstützen kein IPsec
- DNS bricht nicht ab
- Firewall verbietet es

? Ein Server soll nur von der Gruppe Finanz-PCs erreichbar sein. Was wird genutzt?
* Serverisolierung mit „Zulassen, wenn sicher“ und Computerfilter
- Domänenisolierung allein
- Grenzzone
- Zulassen für alle

? Welche Authentifizierung nutzen Linux-Partner-Systeme für IPsec?
* Computerzertifikate
- Kerberos V5 Computer
- NTLMv1
- Smartcard
