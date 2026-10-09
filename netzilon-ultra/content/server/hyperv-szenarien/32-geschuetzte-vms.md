---
id: server-hvsz-32
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 32 – Host-Sicherheit: VM-Zustand verschlüsseln, Key Protector und geschützte VMs einordnen
stufe: Profi
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AZ-801, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az801-bitlocker, az801-credential-guard, az801-dc-haertung, server-hvsz-31]
---

## Profi

### Ticket
**Kunde meldet:** „Unser Auditor bemängelt: Ein Hyper-V-Administrator könnte die VHDX unseres Domänencontrollers kopieren und offline auslesen. Was können wir tun, und was sind ‚Shielded VMs‘?“
- **Priorität:** mittel (Sicherheitsbefund)
- **Betroffene Maschinen:** **DC01** und **HR01** (Personaldaten) auf **HV01**

### Ausgangslage
- Host **HV01.example.com**, Server 2025, VMs DC01 (192.168.10.10) und HR01 (192.168.10.50), beide **Gen 2**.
- Kein Host Guardian Service (HGS) vorhanden; ein separates Rechenzentrum für eine „Guarded Fabric“ ist nicht geplant.
- Hyper-V-Admins sind andere Personen als die Domänen-Admins.

### Analyse
Bei einer normalen VM kann jeder mit Zugriff auf Host oder Speicher:
- die **VHDX** kopieren und offline einbinden (z. B. NTDS.dit auslesen),
- **Zustandsdateien/Prüfpunkte** mit RAM-Inhalt analysieren,
- per Konsole oder Debugger in die VM eingreifen.

Schutzstufen im Überblick:
| Stufe | Was passiert | Voraussetzung |
|---|---|---|
| **vTPM + BitLocker im Gast** | Gast-Datenträger verschlüsselt, Schlüssel im vTPM | Gen 2, Key Protector |
| **Statusdatei/Migrationsverkehr verschlüsseln** | Zustandsdateien und Live-Migration verschlüsselt | Key Protector |
| **Verschlüsselung unterstützt** (Encryption Supported) | wie oben, Admin-Zugriffe (Konsole) bleiben erlaubt | Guarded Fabric / HGS |
| **Geschützt** (Shielded) | zusätzlich **keine** VM-Konsole, kein Debugger, kein PowerShell Direct für Fabric-Admins; Start **nur** auf bestätigten (attestierten) Hosts | Guarded Fabric mit **HGS**, Gen 2, Vorlagendatenträger, Abschirmungsdatendatei (.pdk) |

**Begriffe**:
- **Key Protector** (Schlüsselschutzvorrichtung): verschlüsselt die Schlüssel des vTPM; wird von einem **Guardian** ausgestellt. Lokal = „Untrusted Guardian“ (Zertifikate auf dem Host), in der Guarded Fabric = HGS.
- **HGS** (Host Guardian Service): Serverrolle in einem **eigenen** AD-Forest (meist 3 Knoten im Cluster); bietet **Nachweis** (Attestation) und **Schlüsselschutz** (Key Protection).
- **Nachweismodi**: **TPM-vertrauenswürdig** (TPM-trusted, misst Hardware/Firmware/Codeintegrität) und **Hostschlüssel** (Host key, ab Server 2019, einfacher). Der frühere Modus „Admin-vertrauenswürdig“ (AD-basiert) ist abgekündigt.
- **Abschirmungsdaten** (Shielding Data, .pdk): enthalten u. a. Admin-Kennwort, Unattend, Volume-Signaturkatalog – vom Mandanten erstellt.

Für den Kunden ohne HGS: **vTPM mit lokalem Key Protector + BitLocker im Gast + verschlüsselter Zustand** schließt die Offline-Lücke weitgehend. Volle „Shielded VMs“ erfordern eine Guarded Fabric – das ist ein eigenes Projekt.

### Lösungsweg
1. **DC01 und HR01 herunterfahren** (Wartungsfenster). *Begründung:* Key Protector und vTPM werden offline gesetzt.
2. **Lokalen Key Protector** setzen, **vTPM** aktivieren. *Begründung:* Basis für BitLocker im Gast.
3. **Zustand und Migrationsverkehr verschlüsseln** (`Set-VMSecurity -EncryptStateAndVmMigrationTraffic $true`). *Begründung:* RAM-Inhalte in .vmrs-Dateien bzw. bei Live-Migration sind sonst lesbar.
4. Im Gast **BitLocker** für alle Volumes aktivieren, Wiederherstellungsschlüssel außerhalb des Hosts sichern. *Begründung:* Die kopierte VHDX ist dann ohne vTPM nutzlos.
5. **Guardian-Zertifikate** sichern (PFX, Tresor). *Begründung:* Ohne sie ist auch die Wiederherstellung auf einem anderen Host unmöglich.
6. Zukunftsoption bewerten: Guarded Fabric mit HGS, wenn Fabric-Admins grundsätzlich nicht vertraut werden darf.

### Ergebnis prüfen
- `Get-VMSecurity -VMName DC01, HR01` → TpmEnabled True, EncryptStateAndVmMigrationTraffic True, Shielded False.
- `Get-VMKeyProtector -VMName DC01` liefert einen Wert (nicht leer).
- Test: Kopie der VHDX auf einem Testrechner einbinden → Volume ist BitLocker-gesperrt.

### Vorbeugung
- Rollen trennen: Hyper-V-Admins ≠ Domänen-Admins (Tier-Modell).
- Speicher (VHDX-Pfade) per NTFS-Rechten nur für Hyper-V-Admins.
- Backups der VMs ebenfalls verschlüsseln.

## Einfach
Stell dir vor, deine VM ist ein **Tagebuch**, das in einem Regal im Hausmeisterraum (dem Host) steht. Der Hausmeister kann das Tagebuch jederzeit mitnehmen und lesen. Das findet der Prüfer nicht gut.

Was kann man tun?
- **Stufe 1:** Das Tagebuch bekommt ein **Zahlenschloss** (BitLocker). Den Code bewahrt ein kleiner **Tresor im Tagebuch** auf (vTPM). Der Tresor selbst ist mit einem Schlüssel des Hauses gesichert (Key Protector). Nimmt jemand das Tagebuch mit nach Hause, geht das Schloss nicht auf.
- **Stufe 2:** Auch die **Notizzettel**, die beim Pausieren rumliegen (Zustandsdateien), werden verschlüsselt.
- **Stufe 3 – „geschützte VM“:** Das ist wie ein Tagebuch, das nur in **geprüften Häusern** geöffnet werden darf. Ein **Wächter-Dienst** (HGS) schaut sich jedes Haus genau an und gibt den Schlüssel nur heraus, wenn das Haus „sauber“ ist. Und selbst der Hausmeister darf dann nicht mehr hineinschauen – nicht einmal durch das Fenster (Konsole).

Stufe 3 ist sehr sicher, aber viel Arbeit: Man braucht eigene Wächter-Server. Für die meisten kleinen Firmen reichen Stufe 1 und 2.

## Merksatz
- Offline-Diebstahl der VHDX ⇒ **vTPM + BitLocker im Gast**.
- **Key Protector** schützt die vTPM-Schlüssel.
- **Shielded** = verschlüsselt + **keine Konsole** + nur auf **attestierten** Hosts ⇒ braucht **HGS**.
- Nachweis: **TPM-vertrauenswürdig** oder **Hostschlüssel**.

## Prüfungsfalle
- Eine VM mit lokalem Key Protector ist **keine** geschützte VM (Shielded) – dafür braucht es HGS und eine Guarded Fabric.
- Geschützte VMs gibt es nur als **Generation 2**.
- HGS läuft in einem **eigenen** AD-Forest, nicht in der Produktivdomäne.
- „Verschlüsselung unterstützt“ erlaubt Konsolenzugriff, „Geschützt“ nicht.

## Grafik
### Guarded Fabric im Überblick
1. HV01 -> HGS: Nachweis anfordern (TPM-Messwerte oder Hostschlüssel)
2. HGS -> HV01: Host ist gesund, Zertifikat ausgestellt
3. HV01 -> HGS: Schlüssel für Key Protector der VM anfordern
4. HGS -> HV01: Schlüssel nur für attestierten Host freigegeben
5. HV01 -> HR01: geschützte VM startet, vTPM entsperrt BitLocker
6. Admin -> HR01: Konsolenzugriff verweigert

## Lab
**Nachstellen:** Ohne HGS wird die lokale Schutzstufe umgesetzt und der Offline-Angriff getestet. Maschinen: **HV01**, VM **HR01** (Gen 2), Testrechner **HV02**.

### GUI
1. **HV01**: HR01 herunterfahren → VHDX nach HV02 kopieren → **HV02**: Datenträgerverwaltung → Aktion → VHD anfügen → Dateien lesbar (Fehlerzustand) → Datenträger wieder trennen, Kopie löschen.
2. **HV01**: Hyper-V-Manager → HR01 → Einstellungen → **Sicherheit** → „Trusted Platform Module aktivieren“ und „Statusdatei und Datenverkehr der VM-Migration verschlüsseln“ → OK.
3. **HR01**: starten → BitLocker für C: aktivieren, Wiederherstellungsschlüssel speichern → vollständige Verschlüsselung abwarten.
4. **HV01**: HR01 herunterfahren → VHDX erneut nach HV02 kopieren.
5. **HV02**: VHD anfügen → Volume ist **BitLocker-gesperrt** → Kopie trennen und löschen.
6. **HV01**: certlm.msc → „Shielded VM Local Certificates“ → Zertifikate als PFX sichern.

### PowerShell
```powershell
# Auf HV01 – Ausgangszustand
Get-VMSecurity -VMName HR01

# Auf HV01 – lokale Schutzstufe einrichten (VM aus)
Stop-VM -Name HR01
Set-VMKeyProtector -VMName HR01 -NewLocalKeyProtector
Enable-VMTPM -VMName HR01
Set-VMSecurity -VMName HR01 -EncryptStateAndVmMigrationTraffic $true
Start-VM -Name HR01

# Auf HR01 – BitLocker
Enable-BitLocker -MountPoint "C:" -TpmProtector -UsedSpaceOnly
Add-BitLockerKeyProtector -MountPoint "C:" -RecoveryPasswordProtector

# Auf HV01 – Kontrolle
Get-VMSecurity -VMName HR01 | Format-List TpmEnabled, EncryptStateAndVmMigrationTraffic, Shielded
Get-VMKeyProtector -VMName HR01

# Nur in einer Guarded Fabric mit HGS (Überblick, nicht im Lab):
# Set-VMSecurityPolicy -VMName HR01 -Shielded $true
```

## Szenario
### Kontrollfragen
Ein Auditor bemängelt, dass Hyper-V-Admins die VHDX von HR01 kopieren und offline lesen könnten. Es gibt keinen HGS.
- F: Welche Maßnahme schließt die Offline-Lücke ohne HGS? | A: vTPM mit lokalem Key Protector und BitLocker im Gast.
- F: Welche Einstellung schützt RAM-Inhalte in Zustandsdateien? | A: Set-VMSecurity -EncryptStateAndVmMigrationTraffic $true.
- F: Was unterscheidet eine geschützte (Shielded) VM zusätzlich? | A: Kein Konsolen-/Debuggerzugriff für Fabric-Admins und Start nur auf von HGS attestierten Hosts.
- F: Welche zwei Nachweismodi bietet HGS? | A: TPM-vertrauenswürdiger Nachweis und Hostschlüsselnachweis.
- F: Was muss gesichert werden, damit HR01 auf anderem Host wiederhergestellt werden kann? | A: Die Guardian-Zertifikate (mit privatem Schlüssel) bzw. bei HGS dessen Schlüssel.

## Legende
### Geschützte VM (Shielded VM)
- Was: Gen-2-VM, deren Zustand und Datenträger verschlüsselt sind und die nur auf vertrauenswürdigen Hosts läuft.
- Wie: Guarded Fabric mit HGS, Abschirmungsdaten (.pdk), signierter Vorlagendatenträger.
- Wann: Wenn Fabric-Administratoren oder Hoster nicht vertraut werden darf (z. B. DCs, sensible Daten).
- Wo: Auf überwachten Hyper-V-Hosts (Guarded Hosts).
- Warum: Schutz gegen Diebstahl und Manipulation durch privilegierte Host-Admins.
### Host Guardian Service
- Was: Rolle für Nachweis (Attestation) und Schlüsselschutz.
- Wie: Eigener AD-Forest, typischerweise als Cluster mit 3 Knoten.
- Warum: Gibt Schlüssel nur an gesunde, bekannte Hosts heraus.

## Karteikarten
- F: Was ist eine Schlüsselschutzvorrichtung (Key Protector)? | A: Schutz für die vTPM-Schlüssel einer VM, ausgestellt von einem Guardian.
- F: Was ist ein Untrusted Guardian? | A: Lokaler Guardian mit Zertifikaten auf dem Host, wenn kein HGS existiert.
- F: Wofür steht HGS? | A: Host Guardian Service – Nachweis- und Schlüsselschutzdienst der Guarded Fabric.
- F: Welche Nachweismodi bietet HGS? | A: TPM-vertrauenswürdig und Hostschlüssel (ab Server 2019).
- F: Was ist der Unterschied zwischen „Verschlüsselung unterstützt“ und „Geschützt“? | A: Geschützt verbietet zusätzlich Konsole/Debugger/PowerShell Direct für Fabric-Admins.
- F: Welche Generation braucht eine geschützte VM? | A: Generation 2.
- F: Was enthält eine Abschirmungsdatendatei (.pdk)? | A: Vom Mandanten erstellte Geheimnisse wie Admin-Kennwort, Unattend-Datei und Vertrauensangaben für Vorlagendatenträger.
- F: Cmdlet zum Verschlüsseln von Zustand und Migrationsverkehr? | A: Set-VMSecurity -VMName VM -EncryptStateAndVmMigrationTraffic $true
- F: In welchem AD läuft HGS? | A: In einem eigenen, separaten AD-Forest.

## Quiz
? Was verhindert, dass eine kopierte VHDX offline gelesen werden kann?
* BitLocker im Gast mit Schlüssel im vTPM
- Dynamischer Arbeitsspeicher mit kleinem Minimum
- Die Integrationsdienst-Option „Gastdienste“
- Eine differenzierende VHDX mit Elternteil
! Ohne das vTPM (und dessen Key Protector) bleibt das Volume gesperrt.

? Was ist eine VM mit lokalem Key Protector ohne HGS?
* Eine VM mit vTPM, aber keine Shielded VM
- Automatisch eine vollwertige geschützte VM
- Eine Gen-1-VM mit emuliertem TPM-Chip
- Eine hochverfügbare Cluster-VM mit HGS-Anbindung
! Shielded erfordert eine Guarded Fabric mit HGS.

? Welcher Dienst stellt in einer Guarded Fabric den Nachweis bereit?
* Host Guardian Service (HGS)
- Hyper-V-Replikat-Broker
- Windows Admin Center
- Netzwerkcontroller
! HGS übernimmt Attestation und Key Protection.

? Welche Einschränkung gilt für Fabric-Admins bei geschützten VMs?
* Kein Zugriff per VM-Konsole
- Sie dürfen die VM nicht starten
- Sie dürfen keine Backups erstellen
- Sie dürfen die VM nicht live migrieren
! Konsole, Debugger und PowerShell Direct sind gesperrt.

? Welcher Nachweismodus ist seit Server 2019 als einfache Alternative zu TPM hinzugekommen?
* Hostschlüsselnachweis
- Admin-vertrauenswürdiger Nachweis
- Kerberos-Nachweis
- DHCP-Nachweis
! Der Admin-vertrauenswürdige Modus ist abgekündigt.

? Welche Generation ist für geschützte VMs nötig?
* Generation 2
- Generation 1
- Beide
- Generation 3
! UEFI, Secure Boot und vTPM gibt es nur in Gen 2.

? Wo liegt HGS typischerweise?
* In einem eigenen AD-Forest
- Auf dem DC der Produktivdomäne
- In jeder geschützten VM
- Auf jedem Client
! So bleibt die Vertrauensbasis von der Produktiv-Domäne getrennt.

? Welche Einstellung verschlüsselt Zustandsdateien und Live-Migrationsdaten?
* EncryptStateAndVmMigrationTraffic
- MacAddressSpoofing
- ExposeVirtualizationExtensions
- NumaSpanningEnabled
! Teil von Set-VMSecurity.
