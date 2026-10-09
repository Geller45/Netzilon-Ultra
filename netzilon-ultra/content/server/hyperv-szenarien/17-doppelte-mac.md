---
id: server-hvsz-17
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 17 – Doppelte MAC-Adressen nach VM-Kopie
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-vswitch, server-hvsz-18, server-hvsz-15]
---

## Profi

### Ticket
**Kunde meldet:** „Seit wir den zweiten Hyper-V-Host haben und den App-Server dorthin kopiert haben, brechen Verbindungen zu APP01 und APP02 sporadisch ab. Der Netzwerker sagt, der Switch meldet ‚MAC flapping‘.“
- Datum/Priorität: 06.10.2026, **Priorität 2 (hoch)**.
- Betroffene Maschinen: **APP01** auf **HV01.example.com**, **APP02** auf **HV02.example.com**.

### Ausgangslage
- **HV01** 192.168.10.21 und **HV02** 192.168.10.22, beide Server 2025, im selben Layer-2-Netz.
- HV02 wurde aus einem Image von HV01 bereitgestellt; die Hyper-V-Rolle war im Image bereits installiert.
- APP02 entstand, indem der Ordner von APP01 kopiert und auf HV02 importiert wurde (**Direkt registrieren**, vorhandene ID). APP01 hat aus Lizenzgründen eine **statische MAC**.

### Analyse
Jeder Hyper-V-Host hat einen **MAC-Adresspool** (Standard 256 Adressen, Präfix **00-15-5D**, Microsoft-OUI). Die beiden folgenden Bytes werden bei der Installation der Rolle aus der IP-Adresse des Hosts abgeleitet. Hosts, die aus demselben Image stammen oder bei der Installation dieselbe IP hatten, können **denselben Pool** besitzen. **Statische** MAC-Adressen werden beim Kopieren/Importieren immer **mitgenommen**.

Zwei VMs mit gleicher MAC im selben Broadcast-Segment führen dazu, dass der physische Switch die MAC ständig zwischen zwei Ports umlernt (**MAC flapping**) – Pakete landen mal bei der einen, mal bei der anderen VM.

| Hypothese | Prüfung |
|---|---|
| APP01 und APP02 haben dieselbe (statische) MAC | `Get-VMNetworkAdapter -VMName APP01, APP02 -ComputerName HV01, HV02 \| Select VMName, MacAddress, DynamicMacAddressEnabled` |
| HV01 und HV02 haben denselben MAC-Pool | `Get-VMHost -ComputerName HV01, HV02 \| Select Name, MacAddressMinimum, MacAddressMaximum` |
| Weitere Duplikate | alle Adapter sammeln und nach MacAddress gruppieren |
| ARP-Konflikte | `arp -a` am Router, Switch-Logs |

**Befund:** Beide VMs haben dieselbe statische MAC; zusätzlich identischer Pool auf HV01 und HV02.

### Lösungsweg
1. **Eindeutigen MAC-Pool auf HV02** festlegen – Begründung: Künftige dynamische Adressen dürfen sich nicht mit HV01 überschneiden. Änderung wirkt für neu vergebene Adressen.
2. **APP02 ausschalten** und der vNIC eine **neue MAC** geben: dynamisch aus dem neuen Pool (`-DynamicMacAddress`) oder eine dokumentierte statische Adresse – Begründung: Die MAC lässt sich nur bei ausgeschalteter VM ändern.
3. **APP02 starten**, im Gast ggf. IP-Konfiguration prüfen (neue MAC kann als neue Hardware gelten; bei DHCP-Reservierungen MAC anpassen) – Begründung: Reservierungen/Lizenzen hängen an der MAC.
4. **Alle Hosts prüfen** – Begründung: Weitere Duplikate aus demselben Pool wären möglich.

### Ergebnis prüfen
- Gruppierung aller vNIC-MACs liefert keine Gruppe mit Count > 1.
- Switch meldet kein MAC flapping mehr; Verbindungen zu APP01/APP02 stabil.
- `Get-VMHost HV02` zeigt den neuen Pool.

### Vorbeugung
- Pro Host einen **dokumentierten, eindeutigen MAC-Pool** vergeben (z. B. 00-15-5D-0A-15-xx für HV01, 00-15-5D-0A-16-xx für HV02).
- VMs **nicht** per Dateikopie + „Direkt registrieren“ duplizieren – für Kopien **Import mit neuer ID** verwenden und MAC kontrollieren.
- Statische MACs nur dort, wo nötig, und zentral dokumentieren.
- Hosts nicht mit installierter Hyper-V-Rolle klonen (bzw. Pool danach ändern).

## Einfach

Jede Netzwerkkarte hat eine **Hausnummer**, die MAC-Adresse. Der Briefträger (der Switch) merkt sich: „Hausnummer 42 wohnt in der Straße A.“

Jetzt gibt es plötzlich **zwei Häuser mit der Nummer 42** – eins in Straße A (APP01), eins in Straße B (APP02). Der Briefträger ist verwirrt: Mal bringt er die Post nach A, mal nach B. Briefe kommen beim Falschen an, Gespräche brechen ab.

Wie konnte das passieren?
- Man hat APP01 **abgekupfert** und das Hausnummernschild einfach mitkopiert (statische MAC).
- Und die beiden Hyper-V-Server haben denselben **Hausnummern-Block** zum Verteilen bekommen (gleicher MAC-Pool), weil HV02 eine Kopie von HV01 ist.

Die Lösung: HV02 bekommt einen **eigenen Nummernblock**, und APP02 bekommt eine **neue Hausnummer**. Damit das wieder klappt, muss APP02 kurz ausgeschaltet werden.

## Merksatz
- Gleiche MAC im selben Netz → **MAC flapping**, sporadische Abbrüche.
- Jeder Host braucht einen **eigenen MAC-Pool**.
- Statische MACs werden beim Kopieren **mitgenommen**.
- MAC ändern nur bei **ausgeschalteter** VM.

## Prüfungsfalle
- Der Standard-Pool hat **256** Adressen und beginnt mit **00-15-5D**.
- Das Ändern des Pools ändert **nicht** die MACs vorhandener VMs.
- „Direkt registrieren (vorhandene ID)“ übernimmt die Konfiguration unverändert – inklusive MAC.
- Symptome sind **sporadisch**, nicht dauerhaft – das macht die Fehlersuche schwer.

## Grafik
### Zwei Häuser, eine Hausnummer
1. APP01 -> Switch: Frame mit MAC 00-15-5D-0A-15-07 an Port 10
2. APP02 -> Switch: Frame mit derselben MAC an Port 12
3. Switch: MAC-Tabelle springt zwischen Port 10 und 12
4. Client -> Switch: Antwortpakete landen abwechselnd falsch
5. Admin -> HV02: Eigenen MAC-Pool setzen
6. Admin -> APP02: Ausschalten, neue MAC aus dem Pool
7. Switch: Eindeutige Einträge, Verbindungen stabil

## Lab
**Maschinen**: Hosts **HV01.example.com** und **HV02.example.com** (oder zwei VMs auf einem Host im selben vSwitch), VMs **APP01** und **APP02**.
Nachstellen: Zuerst den Fehler bewusst erzeugen, dann beheben.

### GUI
1. **HV01**: Hyper-V-Manager → APP01 **herunterfahren** → Einstellungen → Netzwerkkarte → Erweiterte Features → **Statisch** → MAC `00-15-5D-0A-15-07` → OK.
2. **HV01**: APP02 herunterfahren → Einstellungen → Netzwerkkarte → Erweiterte Features → **Statisch** → dieselbe MAC eintragen → OK → beide VMs starten (Fehlerzustand).
3. **CL01**: `ping -t APP01` → sporadische Zeitüberschreitungen; `arp -a` zeigt wechselnde Zuordnung.
4. **HV02**: Hyper-V-Manager → rechts **Manager für virtuelle Switches** → **MAC-Adressbereich** → Minimum `00-15-5D-0A-16-00`, Maximum `00-15-5D-0A-16-FF` → OK.
5. **HV02** (bzw. HV01): APP02 **herunterfahren** → Einstellungen → Netzwerkkarte → Erweiterte Features → **Dynamisch** → OK → Starten.
6. **HV02**: Hyper-V-Manager → APP02 → Registerkarte **Netzwerk** unten → neue MAC aus dem neuen Bereich.
7. **CL01**: `ping -t APP01` → stabil.

### PowerShell
1. **HV01**: Duplikat erzeugen.
2. **HV01/HV02**: Duplikate finden.
3. **HV02**: Pool und MAC korrigieren.

```powershell
# Auf HV01 – Fehler erzeugen (Lab, ein Host)
Stop-VM -Name APP01, APP02
Set-VMNetworkAdapter -VMName APP01 -StaticMacAddress "00155D0A1507"
Set-VMNetworkAdapter -VMName APP02 -StaticMacAddress "00155D0A1507"
Start-VM -Name APP01, APP02

# Auf HV01 – Duplikate auf allen Hosts finden
Get-VMNetworkAdapter -VMName * -ComputerName HV01, HV02 |
  Group-Object MacAddress | Where-Object Count -gt 1 |
  ForEach-Object { $_.Group | Select-Object ComputerName, VMName, MacAddress }
Get-VMHost -ComputerName HV01, HV02 | Select-Object Name, MacAddressMinimum, MacAddressMaximum

# Auf HV02 – eindeutigen Pool setzen
Set-VMHost -MacAddressMinimum 00155D0A1600 -MacAddressMaximum 00155D0A16FF

# Auf HV02 – APP02 neue MAC geben
Stop-VM -Name APP02
Set-VMNetworkAdapter -VMName APP02 -DynamicMacAddress
Start-VM -Name APP02
Get-VMNetworkAdapter -VMName APP02 | Select-Object VMName, MacAddress, DynamicMacAddressEnabled
```

## Szenario
### Kontrollfragen
APP01 (HV01) und APP02 (HV02) haben dieselbe MAC; HV02 wurde aus einem Image von HV01 erstellt. Verbindungen brechen sporadisch ab.
- F: Warum brechen die Verbindungen nur sporadisch ab? | A: Der physische Switch lernt die MAC abwechselnd an zwei Ports (MAC flapping); Pakete landen mal bei der einen, mal bei der anderen VM.
- F: Wie findet man doppelte MACs? | A: Get-VMNetworkAdapter -VMName * -ComputerName HV01, HV02 \| Group-Object MacAddress \| Where-Object Count -gt 1
- F: Wie setzt man einen eigenen MAC-Pool? | A: Set-VMHost -MacAddressMinimum 00155D0A1600 -MacAddressMaximum 00155D0A16FF
- F: Ändert ein neuer Pool die MAC vorhandener VMs? | A: Nein, nur neu vergebene Adressen; vorhandene VMs müssen ausgeschaltet und angepasst werden.
- F: Welche Importart verhindert kopierte Identitäten? | A: Import als Kopie mit neuer eindeutiger ID – statische MACs trotzdem prüfen.

## Reihenfolge
### Doppelte MAC beseitigen
1. Duplikate über alle Hosts ermitteln
2. MAC-Pools der Hosts vergleichen
3. Eindeutigen MAC-Pool auf dem betroffenen Host setzen
4. Betroffene VM ausschalten
5. Neue dynamische oder dokumentierte statische MAC zuweisen
6. VM starten und Verbindungen prüfen

## Legende
### MAC-Adresspool
- Was: Bereich, aus dem ein Hyper-V-Host dynamische MAC-Adressen an vNICs vergibt (Standard 256 Adressen, Präfix 00-15-5D).
- Wie: Manager für virtuelle Switches → MAC-Adressbereich bzw. `Set-VMHost -MacAddressMinimum/-MacAddressMaximum`.
- Wann: beim Aufbau mehrerer Hosts, nach dem Klonen von Hosts, bei mehr als 256 vNICs.
- Wo: Host-Einstellung auf HV01/HV02.
- Warum: verhindert doppelte MAC-Adressen im selben Layer-2-Netz.

## Karteikarten
- F: Mit welchem Präfix beginnen Hyper-V-MAC-Adressen standardmäßig? | A: 00-15-5D (Microsoft).
- F: Wie viele Adressen hat der Standard-MAC-Pool? | A: 256.
- F: Woraus leitet Hyper-V den Standardpool ab? | A: Aus der IP-Adresse des Hosts bei der Rolleninstallation.
- F: Was ist MAC flapping? | A: Ein Switch lernt dieselbe MAC ständig an wechselnden Ports.
- F: Wie ändert man den MAC-Pool? | A: Set-VMHost -MacAddressMinimum <Start> -MacAddressMaximum <Ende>
- F: Wann darf die MAC einer VM geändert werden? | A: Nur bei ausgeschalteter VM.
- F: Wie stellt man eine vNIC auf dynamische MAC um? | A: Set-VMNetworkAdapter -VMName <VM> -DynamicMacAddress
- F: Werden statische MACs beim Import mitgenommen? | A: Ja.
- F: Welche Abhängigkeiten können an der MAC hängen? | A: DHCP-Reservierungen, Lizenzen, Netzwerkzugangskontrolle.

## Quiz
? Zwei VMs haben dieselbe MAC. Typisches Symptom?
* Sporadische Verbindungsabbrüche durch MAC flapping
- Die zweite VM verweigert grundsätzlich den Start
- Hyper-V löscht automatisch eine der beiden VMs
- Secure Boot schlägt in beiden VMs fehl
! Hyper-V verhindert doppelte MACs zwischen Hosts nicht.

? Mit welchem Präfix beginnen Hyper-V-MACs?
* 00-15-5D
- 00-50-56
- 08-00-27
- 00-0C-29
! 00-50-56 und 00-0C-29 gehören zu VMware, 08-00-27 zu VirtualBox.

? Wie setzt man einen eigenen MAC-Pool auf HV02?
* Set-VMHost -MacAddressMinimum 00155D0A1600 -MacAddressMaximum 00155D0A16FF
- Set-VMSwitch -Name LAN -MacAddressMinimum 00155D0A1600 -MacAddressMaximum 00155D0A16FF
- Set-VMNetworkAdapter -VMName * -StaticMacAddress 00155D0A1600
- Set-NetAdapter -Name vEthernet* -MacAddress 00155D0A1600
! Der Pool ist eine Host-Einstellung.

? Was passiert mit vorhandenen VMs nach Änderung des Pools?
* Nichts, ihre MACs bleiben
- Alle erhalten sofort neue MACs
- Sie werden ausgeschaltet
- Sie verlieren die IP
! Neue Adressen werden erst bei Neuvergabe gezogen.

? Wann kann die MAC einer vNIC geändert werden?
* Bei ausgeschalteter VM
- Jederzeit im Betrieb
- Nur im gespeicherten Zustand
- Nur nach Update-VMVersion
! MAC-Einstellungen erfordern eine ausgeschaltete VM.

? Woraus entsteht ein identischer Pool auf zwei Hosts typischerweise?
* Klonen eines Hosts mit Hyper-V-Rolle oder gleiche IP bei der Installation
- Unterschiedliche Zeitzonen und Uhrzeiten der beiden Hosts
- Baugleiche Prozessoren und Netzwerkkarten in beiden Hosts
- Ein gleicher Domänenname bzw. dieselbe Organisationseinheit
! Der Pool wird bei der Rolleninstallation aus der IP abgeleitet.

? Wie findet man doppelte MACs per PowerShell?
* Adapter sammeln und nach MacAddress gruppieren
- Get-VMSwitch -Duplicate
- Test-VMNetworkAdapter
- Get-NetNeighbor auf der VM genügt immer
! Group-Object MacAddress zeigt Gruppen mit Count größer 1.

? Wie groß ist der Standardpool?
* 256 Adressen
- 16 Adressen
- 4096 Adressen
- Unbegrenzt
! Bei vielen vNICs pro Host muss der Pool vergrößert werden.
