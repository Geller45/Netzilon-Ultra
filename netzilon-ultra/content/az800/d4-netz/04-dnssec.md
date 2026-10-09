---
id: az800-dnssec
bereich: AZ-800
block: A7
kapitel: Netzwerkinfrastruktur
titel: DNSSEC – Zonensignatur, Schlüssel, Vertrauensanker & NRPT
stufe: Profi
quellen: [AZ-800 Study Guide, Microsoft Learn, Netzwerkinfrastruktur_mit_Windows_Server_2016_implementieren_70-741.pdf]
verweise: [az800-dns, az800-dns-weiterleitung, ap1-a5-dns, ap1-a6-gpo-grundlagen]
---

## Profi

### Ziel
**DNSSEC** (*DNS Security Extensions*) schützt **Integrität und Herkunft** von DNS-Antworten durch **digitale Signaturen**. Ein Resolver kann prüfen, dass eine Antwort vom autoritativen Server stammt und nicht manipuliert wurde (Schutz gegen **Cache Poisoning**/Spoofing). DNSSEC **verschlüsselt nicht** – Vertraulichkeit bieten DoH/DoT.

### Neue Eintragstypen
| Eintrag | Inhalt |
|---|---|
| **RRSIG** | **Signatur** eines Eintragssatzes (z. B. aller A-Einträge von `www`) |
| **DNSKEY** | **öffentliche Schlüssel** der Zone (KSK und ZSK) |
| **DS** (*Delegation Signer*) | **Hash des KSK** der Kindzone, liegt in der **Elternzone** → Vertrauenskette |
| **NSEC / NSEC3** | **authentifizierte Nichtexistenz** („diesen Namen gibt es nicht“, signiert); NSEC3 mit Hashes gegen **Zone Walking** |

### Schlüssel
| Schlüssel | Signiert | Typisch |
|---|---|---|
| **KSK** (*Key Signing Key*) | den **DNSKEY**-Satz (die Schlüssel selbst) | länger, seltener gewechselt (Rollover z. B. jährlich) |
| **ZSK** (*Zone Signing Key*) | **alle übrigen** Einträge der Zone | kürzer, häufiger gewechselt (z. B. 90 Tage) |
Algorithmus Standard: **RSA/SHA-256**, auch ECDSA möglich. **Schlüsselrollover** automatisch (Pre-Publish für ZSK, Double-Signature für KSK).

### Schlüsselmaster (*Key Master*)
- **Ein** DNS-Server pro Zone ist **Schlüsselmaster**: erzeugt und verwaltet die Schlüssel, führt Rollover durch.
- Bei **AD-integrierten** Zonen werden Signaturen per AD an alle DNS-DCs repliziert; private Schlüssel liegen im AD (ab Server 2012 unterstützt).
- Ausfall des Schlüsselmasters → Rollover stoppt → Rolle auf anderen DNS-Server übertragen.

### Vertrauenskette und Vertrauensanker
- Validierender Resolver startet bei einem **Vertrauensanker** (*Trust Anchor*) – dem bekannten öffentlichen KSK (bzw. DS) einer Zone – und prüft abwärts: Root → TLD → Zone per **DS**-Einträgen.
- Öffentlich: **Root-Vertrauensanker** der IANA; eigene interne Zone ohne Kette nach oben → **Vertrauensanker manuell** auf den DNS-Servern verteilen.
- Windows Server: Vertrauensanker liegen im **Container „Vertrauenspunkte“** (*Trust Points*); bei AD-Zonen Option **„Verteilung von Vertrauensankern für diese Zone aktivieren“** → alle DNS-DCs erhalten den Anker automatisch.
- **DS-Eintrag** der Kindzone muss in der **Elternzone** eingetragen werden (bei öffentlichen Domänen beim Registrar).

### Client-Seite: Validierung erzwingen (NRPT)
- Windows-Clients sind **nicht validierend** („security-aware stub resolver“): sie verlassen sich auf das **AD-Flag** (*Authenticated Data*) des DNS-Servers.
- **Richtlinientabelle für Namensauflösung** (*Name Resolution Policy Table*, **NRPT**) per **GPO**: Computerkonfiguration → Richtlinien → Windows-Einstellungen → **Richtlinie für Namensauflösung** → Suffix/Namespace angeben → **„DNSSEC aktivieren“** + **„DNS-Clients müssen überprüfen, dass Namen- und Adressdaten vom DNS-Server überprüft wurden“**.
- Kann der DNS-Server nicht validieren → Client verwirft die Antwort (Auflösung schlägt fehl).
- Kontrolle am Client: `Get-DnsClientNrptPolicy`, `Resolve-DnsName -DnssecOk`.

### Signieren – Wege
1. **Zone mit aktuellen Einstellungen signieren** (Standardparameter, schnell).
2. **Zonensignaturparameter anpassen** (Assistent: Schlüsselmaster, KSK/ZSK, NSEC/NSEC3, Vertrauensanker, Signatur-/Rolloverintervalle).
3. **Einstellungen einer bestehenden Zone übernehmen**.
Aufheben: **Zone entsignieren** (*Unsign*). Dynamische Updates bleiben möglich – neue Einträge werden **online signiert**.

## Lab
**Maschinen**: **DC01** (example.com, DNS, Schlüsselmaster), **DC02** (DNS), **CL01** (Windows 11, Domänenmitglied).

### GUI
1. **DC01**: DNS-Manager → Zone `example.com` → Kontextmenü **DNSSEC → Zone signieren** → **Zonensignaturparameter anpassen**.
2. Schlüsselmaster: **DC01**.
3. KSK: RSA/SHA-256, 2048 Bit, Rollover 755 Tage (Standard); ZSK: RSA/SHA-256, 1024 Bit, Rollover 90 Tage.
4. Nächster Schritt → **NSEC3** belassen → **„Verteilung von Vertrauensankern für diese Zone aktivieren“** → Fertig.
5. **DC01**: Zone aktualisieren → neue Einträge **RRSIG**, **DNSKEY**, **NSEC3** sichtbar; Knoten **Vertrauenspunkte** → `example.com` mit DNSKEY.
6. **DC02**: DNS-Manager → Vertrauenspunkte → Anker nach AD-Replikation vorhanden.
7. **DC01**: Gruppenrichtlinienverwaltung → GPO „DNSSEC-Clients“ → Computerkonfiguration → Richtlinien → Windows-Einstellungen → **Richtlinie für Namensauflösung** → Suffix `example.com` → Registerkarte **DNSSEC**: „DNSSEC in dieser Regel aktivieren“ + „DNS-Clients müssen überprüfen…“ → **Erstellen** → **Übernehmen** → GPO mit OU der Clients verknüpfen.
8. **CL01**: `gpupdate /force` → `Get-DnsClientNrptPolicy` → `Resolve-DnsName dc01.example.com -DnssecOk`.

### PowerShell
```powershell
# Auf DC01 – Zone signieren (Standardparameter)
Invoke-DnsServerZoneSign -ZoneName "example.com" -SignWithDefault -PassThru -Force

# Auf DC01 – eigene Schlüssel/Einstellungen
Add-DnsServerSigningKey -ZoneName "example.com" -Type KeySigningKey -CryptoAlgorithm RsaSha256 -KeyLength 2048
Add-DnsServerSigningKey -ZoneName "example.com" -Type ZoneSigningKey -CryptoAlgorithm RsaSha256 -KeyLength 1024 -ZskRolloverPeriod 90.00:00:00
Set-DnsServerDnsSecZoneSetting -ZoneName "example.com" -DenialOfExistence NSec3 -DistributeTrustAnchor DnsKey
Invoke-DnsServerZoneSign -ZoneName "example.com" -Force
Get-DnsServerDnsSecZoneSetting -ZoneName "example.com"
Get-DnsServerSigningKey -ZoneName "example.com"

# Auf DC01/DC02 – Vertrauensanker und Einträge prüfen
Get-DnsServerTrustAnchor -Name "example.com"
Get-DnsServerResourceRecord -ZoneName "example.com" -RRType DnsKey
Resolve-DnsName -Name example.com -Type DNSKEY -Server localhost -DnssecOk

# Auf DC01 – NRPT-Regel per GPO (alternativ zur GUI)
Add-DnsClientNrptRule -Namespace ".example.com" -DnsSecEnable -DnsSecValidationRequired -GpoName "DNSSEC-Clients" -Server DC01.example.com

# Auf CL01 – Kontrolle
gpupdate /force
Get-DnsClientNrptPolicy
Resolve-DnsName dc01.example.com -DnssecOk

# Auf DC01 – Signatur entfernen / Schlüsselmaster wechseln
Invoke-DnsServerZoneUnsign -ZoneName "example.com" -Force
Reset-DnsServerZoneKeyMasterRole -ZoneName "example.com" -KeyMasterServer DC02.example.com -Force
```

## Einfach

DNS ohne DNSSEC ist wie ein **Brief ohne Unterschrift**: Jemand könnte ihn unterwegs austauschen („www.bank.de wohnt jetzt bei 6.6.6.6“) – und der PC glaubt es.

**DNSSEC** setzt unter jede Antwort ein **Siegel** (Signatur):
- **ZSK** = der **Stempel**, mit dem der DNS-Server **jede Zeile** im Telefonbuch versiegelt.
- **KSK** = ein **Chef-Stempel**, der nur bestätigt: „Dieser Zeilen-Stempel ist echt.“
- **RRSIG** = das **Siegel** unter einer Zeile.
- **DNSKEY** = das **Muster**, mit dem man die Siegel vergleicht.
- **DS** = ein **Fingerabdruck** des Chef-Stempels, den die **Eltern-Zone** aufbewahrt – so entsteht eine **Kette**: Die Eltern bürgen für das Kind.
- **NSEC3** = ein versiegeltes „**Den gibt es nicht**“ – damit kein Fälscher behaupten kann, ein Name existiere nicht.

**Vertrauensanker** = das Stempelmuster, dem du **von Anfang an** vertraust. Für eine eigene interne Zone gibt es keine Eltern, also verteilt Windows den Anker selbst an alle DNS-DCs.

**Wichtig**: Die Windows-PCs prüfen die Siegel **nicht selbst**, sie fragen den DNS-Server: „Hast du geprüft?“ Per **GPO (NRPT)** sagt man den PCs: „Für example.com **nur** geprüfte Antworten annehmen!“

DNSSEC macht Antworten **fälschungssicher**, aber **nicht geheim** – jeder kann sie weiterhin lesen.

## Merksatz
- **ZSK** signiert Zeilen, **KSK** signiert Schlüssel.
- **RRSIG** = Signatur, **DNSKEY** = öffentlicher Schlüssel, **DS** = Hash des KSK in der **Elternzone**.
- **NSEC3** = signierte Nichtexistenz ohne Zone Walking.
- **Schlüsselmaster** = einer pro Zone.
- Clients validieren über **NRPT per GPO**.
- DNSSEC = **Integrität**, keine **Verschlüsselung**.

## Prüfungsfalle
- DNSSEC verschlüsselt nicht.
- DS-Eintrag gehört in die Elternzone, nicht in die Kindzone.
- Windows-Clients validieren nicht selbst – NRPT erzwingt nur die Prüfung durch den Server.
- Andere DNS-Server validieren nur mit Vertrauensanker.
- Ausfall des Schlüsselmasters stoppt Rollover.
- NSEC erlaubt Zone Walking, NSEC3 nicht.

## Grafik
### Brief mit Siegel
Antwort-Brief „www = 192.168.10.80“ wird unterwegs von einem Fälscher ausgetauscht; ohne DNSSEC nimmt der Client ihn an, mit DNSSEC passt das Siegel nicht → Brief wird zerrissen.

### Zwei Stempel
ZSK-Stempel drückt Siegel unter jede Zeile; KSK-Chefstempel drückt ein Siegel nur unter die Stempelmuster (DNSKEY).

### Vertrauenskette
Treppe Root → .de → example.de; auf jeder Stufe hält die Elternzone den Fingerabdruck (DS) des Kind-Chefstempels.

### NRPT
GPO-Briefkasten verteilt Regel „example.com nur geprüft“ an Clients; Client fragt DNS-Server „geprüft?“ – nur mit Haken (AD-Flag) wird die Antwort angenommen.

## Karteikarten
- F: Was schützt DNSSEC? | A: Echtheit und Integrität von DNS-Antworten (keine Vertraulichkeit).
- F: Aufgabe des ZSK? | A: Signiert die Einträge der Zone.
- F: Aufgabe des KSK? | A: Signiert den DNSKEY-Eintragssatz.
- F: Was ist ein RRSIG? | A: Die Signatur eines Eintragssatzes.
- F: Wo liegt der DS-Eintrag? | A: In der Elternzone (Hash des KSK der Kindzone).
- F: Vorteil von NSEC3 gegenüber NSEC? | A: Verhindert Zone Walking durch gehashte Namen.
- F: Was ist der Schlüsselmaster? | A: Der DNS-Server, der Schlüssel einer Zone erzeugt und Rollovers durchführt.
- F: Wie erzwingt man DNSSEC-Validierung für Windows-Clients? | A: NRPT-Regel per GPO (Richtlinie für Namensauflösung).
- F: Cmdlet zum Signieren mit Standardwerten? | A: Invoke-DnsServerZoneSign -SignWithDefault
- F: Wie gelangt der Vertrauensanker auf alle DNS-DCs? | A: Verteilung von Vertrauensankern bei AD-integrierter Zone aktivieren.
- F: Cmdlet für NRPT-Regel in einer GPO? | A: Add-DnsClientNrptRule -DnsSecEnable -DnsSecValidationRequired -GpoName

## Quiz
? Welcher Eintrag enthält die Signatur eines DNS-Eintragssatzes?
* RRSIG
- DNSKEY
- DS
- NSEC3

? Clients sollen Namen aus example.com nur annehmen, wenn der DNS-Server sie per DNSSEC validiert hat. Lösung?
* NRPT-Regel per Gruppenrichtlinie
- Sichere dynamische Updates
- Zone mit NSEC3 signieren reicht
- Bedingte Weiterleitung

? Welcher Schlüssel signiert den DNSKEY-Eintragssatz?
* Key Signing Key (KSK)
- Zone Signing Key (ZSK)
- DS-Schlüssel
- Vertrauensanker

? Ein Angreifer liest DNS-Anfragen im Netzwerk mit. Hilft DNSSEC dagegen?
* Nein, DNSSEC signiert nur, verschlüsselt aber nicht
- Ja, DNSSEC verschlüsselt alle Antworten
- Ja, aber nur mit NSEC3
- Ja, wenn der KSK 2048 Bit hat

? Die Rollover für example.com finden nicht mehr statt; DC01 wurde außer Betrieb genommen. Lösung?
* Schlüsselmaster-Rolle auf einen anderen DNS-Server übertragen
- Zone neu erstellen
- Vertrauensanker löschen
- NRPT-Regel entfernen
