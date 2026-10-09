---
id: server-hvsz-21
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 21 – Live-Migration ohne Cluster scheitert (CredSSP vs. Kerberos)
stufe: Profi
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-credssp-delegation, az801-credential-guard, server-hvsz-18, server-hvsz-22]
---

## Profi

### Ticket
**Kunde meldet:** „Ich wollte APP01 vom Admin-PC aus im Hyper-V-Manager per Live-Migration nach HV02 verschieben. Fehler: Verbindung zu HV02 kann nicht hergestellt werden, keine Anmeldeinformationen im Sicherheitspaket verfügbar.“
- Datum/Priorität: 04.10.2026, **Priorität 3 (normal)**.
- Betroffene Maschinen: **HV01.example.com** (Quelle), **HV02.example.com** (Ziel), VM **APP01**, Admin-PC **ADMIN01**.
- Meldung (sinngemäß): *„Fehler beim Herstellen einer Verbindung mit dem Host 'HV02': Im Sicherheitspaket sind keine Anmeldeinformationen verfügbar (0x8009030E).“*

### Ausgangslage
- HV01/HV02: Server 2025, Domäne example.com, **kein** Failovercluster, lokaler Speicher (D:\VMs).
- Live-Migration auf beiden Hosts aktiviert, Authentifizierungsprotokoll **CredSSP**, Leistungsoption Komprimierung, Migrationsnetz 192.168.10.0/24.
- Die Migration wurde **remote von ADMIN01** gestartet.

### Analyse
Bei Live-Migration ohne Cluster (*Shared-Nothing*) muss der **Quellhost** sich im Namen des Admins beim **Zielhost** anmelden – ein **Double Hop** (ADMIN01 → HV01 → HV02).

| Protokoll | Funktionsweise | Einschränkung |
|---|---|---|
| **CredSSP** | Anmeldeinformationen werden an den Quellhost delegiert | Funktioniert nur, wenn man **lokal auf dem Quellhost angemeldet** ist (bzw. die Migration dort startet) – remote scheitert der zweite Hop. Wird durch **Credential Guard** blockiert. |
| **Kerberos** | Quellhost nutzt **eingeschränkte Delegierung** (*Constrained Delegation*) im AD | Delegierung muss für die Dienste **cifs** und **Microsoft Virtual System Migration Service** eingerichtet sein. Migration dann von jedem Rechner aus. |

Unter **Windows Server 2025** ist **Credential Guard** auf geeigneten domänengebundenen Servern (keine DCs) standardmäßig aktiv – dann ist CredSSP für Live-Migration nicht nutzbar; Microsoft empfiehlt Kerberos mit eingeschränkter Delegierung.

| Hypothese | Prüfung |
|---|---|
| CredSSP + Remote-Start = Double-Hop-Problem | `Get-VMHost HV01 \| Select VirtualMachineMigrationAuthenticationType` |
| Eingeschränkte Delegierung fehlt | AD-Computerkonto HV01 → Registerkarte **Delegierung** |
| Live-Migration auf Ziel deaktiviert / falsches Netz | `Get-VMHost HV02 \| Select VirtualMachineMigrationEnabled`, `Get-VMMigrationNetwork` |
| Unterschiedliche CPU-Generationen | Prozessorkompatibilitätsmodus |
| Switch-Name auf Ziel fehlt | `Compare-VM` bzw. Fehlermeldung |

### Lösungsweg
1. **Eingeschränkte Delegierung** im AD einrichten: Computerkonto **HV01** → Delegierung → *Computer bei Delegierungen angegebener Dienste vertrauen* → *Nur Kerberos verwenden* → Hinzufügen **HV02** → Dienste **cifs** und **Microsoft Virtual System Migration Service**. Dasselbe umgekehrt für **HV02 → HV01** – Begründung: erlaubt den zweiten Hop gezielt nur für diese Dienste.
2. **Authentifizierung auf beiden Hosts auf Kerberos** umstellen – Begründung: nutzt die Delegierung; funktioniert remote und mit Credential Guard.
3. **Kerberos-Tickets aktualisieren** (Hosts neu starten oder `klist purge -li 0x3e7` für das Computerkonto) – Begründung: Delegierungsänderungen wirken erst mit neuen Tickets.
4. **Migrationsnetz und Leistungsoption** prüfen – Begründung: dediziertes Netz entlastet Produktion.
5. **Live-Migration mit Speicher** starten (`Move-VM -IncludeStorage`) – Begründung: Shared-Nothing verschiebt VHDX und Laufzeitzustand.
6. Bei unterschiedlichen CPU-Generationen **gleichen Herstellers**: VM aus, **Prozessorkompatibilität** aktivieren – Begründung: blendet neuere CPU-Funktionen aus.

### Ergebnis prüfen
- `Move-VM` von ADMIN01 oder HV01 erfolgreich; APP01 läuft auf HV02 ohne Unterbrechung (Dauerping verliert höchstens ein Paket).
- Ereignisprotokoll *Hyper-V-VMMS-Admin* ohne Fehler.

### Vorbeugung
- Hosts von Beginn an mit **Kerberos + eingeschränkter Delegierung** konfigurieren (per Skript/AD-Vorlage).
- Für Live-Migration ein **eigenes Netzwerk** (ggf. SMB/RDMA).
- Für regelmäßige Migrationen und Hochverfügbarkeit einen **Failovercluster** erwägen.

## Einfach

Stell dir vor, du (ADMIN01) bittest deine Freundin HV01: „Bring bitte mein Paket (APP01) zu HV02.“ HV02 lässt aber nur rein, wer **deinen Ausweis** zeigt.

- Mit **CredSSP** gibst du HV01 eine **Kopie deines Ausweises** mit. Das klappt aber nur, wenn du **selbst bei HV01 im Zimmer stehst** (lokal angemeldet). Rufst du nur an (remote), darf HV01 deinen Ausweis nicht weitergeben. Und in Server 2025 gibt es einen **Wachhund** (Credential Guard), der das Kopieren von Ausweisen ganz verbietet.
- Mit **Kerberos und eingeschränkter Delegierung** schreibt das **Rathaus** (Active Directory) einen **Erlaubnisschein**: „HV01 darf für dich **nur** bei HV02 und **nur** für Pakete (Migrationsdienst) und Dateien (cifs) auftreten.“ Dann ist es egal, von wo du anrufst.

Die Lösung: Erlaubnisschein im Rathaus ausstellen (für HV01 und HV02 gegenseitig), beide auf „Kerberos“ umstellen – und das Paket kommt an, während APP01 einfach weiterläuft.

## Merksatz
- **CredSSP** = nur **lokal** am Quellhost starten; scheitert mit Credential Guard.
- **Kerberos** = **eingeschränkte Delegierung** für **cifs** + **Microsoft Virtual System Migration Service**.
- Delegierung **in beide Richtungen** einrichten.
- Shared-Nothing: `Move-VM -IncludeStorage`.

## Prüfungsfalle
- Delegierung wird am Computerkonto des **Quellhosts** eingetragen (Ziel als Dienst) – für Rückmigration auch umgekehrt.
- Nur **cifs** reicht nicht für die Live-Migration selbst – der **Migrationsdienst** muss dabei sein (cifs wird für das Verschieben des Speichers gebraucht).
- „Uneingeschränkte Delegierung“ ist **nicht** die empfohlene Lösung.
- Prozessorkompatibilität hilft nur zwischen CPUs **desselben Herstellers**.

## Grafik
### Double Hop mit Erlaubnisschein
1. ADMIN01 -> HV01: Live-Migration von APP01 nach HV02 starten
2. HV01 -> HV02: Anmeldung per CredSSP – keine Anmeldeinformationen, abgelehnt
3. Admin -> DC01: Eingeschränkte Delegierung HV01 zu HV02 für cifs und Migrationsdienst
4. Admin -> HV01: Authentifizierung auf Kerberos umstellen
5. HV01 -> DC01: Kerberos-Ticket im Auftrag des Admins für HV02
6. HV01 -> HV02: Speicher und Arbeitsspeicher übertragen
7. HV02: APP01 läuft, Quelle bereinigt

## Lab
**Maschinen**: **HV01.example.com**, **HV02.example.com**, **DC01.example.com**, Admin-PC **ADMIN01** mit RSAT, VM **APP01** (lokaler Speicher).
Nachstellen: Zuerst den Fehler bewusst erzeugen, dann beheben.

### GUI
1. **HV01** und **HV02**: Hyper-V-Manager → Hyper-V-Einstellungen → **Livemigrationen** → *Ein- und ausgehende Livemigrationen ermöglichen* → Netzwerk 192.168.10.0/24 → **Erweiterte Features** → **CredSSP** → OK.
2. **ADMIN01**: Hyper-V-Manager mit HV01 verbinden → APP01 → **Verschieben** → *Virtuellen Computer verschieben* → Ziel HV02 → *Daten des virtuellen Computers an einen einzigen Speicherort verschieben* → Fehler (Fehlerzustand).
3. **DC01**: Active Directory-Benutzer und -Computer → Computers → **HV01** → Eigenschaften → **Delegierung** → *Computer bei Delegierungen angegebener Dienste vertrauen* → *Nur Kerberos verwenden* → **Hinzufügen** → Benutzer oder Computer → HV02 → Dienste **cifs** und **Microsoft Virtual System Migration Service** markieren → OK.
4. **DC01**: Dasselbe am Computerkonto **HV02** mit Ziel **HV01**.
5. **HV01** und **HV02**: Hyper-V-Einstellungen → Livemigrationen → Erweiterte Features → **Kerberos** → OK; Hosts neu starten oder Tickets erneuern.
6. **ADMIN01**: APP01 → **Verschieben** → Ziel HV02 → Speicherort `D:\VMs\APP01` → Fertig stellen; parallel `ping -t` auf APP01.
7. **ADMIN01**: Hyper-V-Manager mit HV02 verbinden → APP01 *Wird ausgeführt*.

### PowerShell
1. **HV01/HV02**: CredSSP-Konfiguration (Fehler) und Remote-Start.
2. **DC01**: Delegierung setzen.
3. **HV01/HV02/ADMIN01**: Kerberos und Migration.

```powershell
# Auf HV01 und HV02 – Fehlerkonfiguration
Enable-VMMigration
Add-VMMigrationNetwork 192.168.10.0/24
Set-VMHost -VirtualMachineMigrationAuthenticationType CredSSP -VirtualMachineMigrationPerformanceOption Compression

# Auf ADMIN01 – remote gestartet, scheitert
Move-VM -ComputerName HV01 -Name APP01 -DestinationHost HV02 -IncludeStorage -DestinationStoragePath D:\VMs\APP01

# Auf DC01 – eingeschränkte Delegierung (Kerberos only) in beide Richtungen
Set-ADComputer -Identity HV01 -Add @{ "msDS-AllowedToDelegateTo" = @(
  "cifs/HV02", "cifs/HV02.example.com",
  "Microsoft Virtual System Migration Service/HV02", "Microsoft Virtual System Migration Service/HV02.example.com") }
Set-ADComputer -Identity HV02 -Add @{ "msDS-AllowedToDelegateTo" = @(
  "cifs/HV01", "cifs/HV01.example.com",
  "Microsoft Virtual System Migration Service/HV01", "Microsoft Virtual System Migration Service/HV01.example.com") }

# Auf HV01 und HV02 – Kerberos aktivieren, Computertickets erneuern
Set-VMHost -VirtualMachineMigrationAuthenticationType Kerberos
klist purge -li 0x3e7

# Auf ADMIN01 – erneut migrieren
Move-VM -ComputerName HV01 -Name APP01 -DestinationHost HV02 -IncludeStorage -DestinationStoragePath D:\VMs\APP01
Get-VM -ComputerName HV02 -Name APP01 | Select-Object Name, State

# Optional bei unterschiedlichen CPU-Generationen (VM aus)
Set-VMProcessor -VMName APP01 -CompatibilityForMigrationEnabled $true
```

## Szenario
### Kontrollfragen
Die Live-Migration von APP01 (HV01 → HV02, ohne Cluster) wird von ADMIN01 aus gestartet und scheitert mit „keine Anmeldeinformationen im Sicherheitspaket“. Authentifizierung ist CredSSP.
- F: Warum scheitert die Migration? | A: Double Hop: Mit CredSSP muss man lokal auf dem Quellhost angemeldet sein; remote kann HV01 die Anmeldeinformationen nicht an HV02 weitergeben. Credential Guard (Standard in Server 2025) blockiert CredSSP zusätzlich.
- F: Welche Lösung erlaubt den Start von jedem Rechner aus? | A: Kerberos mit eingeschränkter Delegierung.
- F: Für welche Dienste wird delegiert? | A: cifs und Microsoft Virtual System Migration Service, jeweils für den anderen Host.
- F: Warum in beide Richtungen? | A: Damit auch die Rückmigration von HV02 nach HV01 funktioniert.
- F: Welches Cmdlet verschiebt VM und Speicher ohne Cluster? | A: Move-VM -Name APP01 -DestinationHost HV02 -IncludeStorage -DestinationStoragePath D:\VMs\APP01

## Reihenfolge
### Live-Migration ohne Cluster mit Kerberos
1. Live-Migration und Migrationsnetz auf beiden Hosts aktivieren
2. Eingeschränkte Delegierung für HV01 zu HV02 einrichten
3. Eingeschränkte Delegierung für HV02 zu HV01 einrichten
4. Authentifizierung auf beiden Hosts auf Kerberos stellen
5. Kerberos-Tickets erneuern
6. Migration mit Speicher starten
7. VM auf dem Zielhost prüfen

## Legende
### Eingeschränkte Kerberos-Delegierung
- Was: AD-Einstellung, die einem Computerkonto erlaubt, im Namen eines Benutzers nur bestimmte Dienste auf bestimmten Servern zu nutzen.
- Wie: ADUC → Computerkonto → Delegierung → angegebene Dienste, nur Kerberos → cifs und Microsoft Virtual System Migration Service.
- Wann: für Live-Migration ohne Cluster, wenn sie remote gestartet wird oder Credential Guard aktiv ist.
- Wo: in Active Directory an den Computerkonten HV01 und HV02 (gegenseitig).
- Warum: löst das Double-Hop-Problem sicher, ohne Anmeldeinformationen weiterzureichen.

## Karteikarten
- F: Welche Authentifizierungsprotokolle kennt Hyper-V-Live-Migration? | A: CredSSP und Kerberos.
- F: Einschränkung von CredSSP? | A: Man muss lokal am Quellhost angemeldet sein; remote scheitert der Double Hop.
- F: Was braucht Kerberos für Live-Migration? | A: Eingeschränkte Delegierung im AD.
- F: Welche Dienste werden delegiert? | A: cifs und Microsoft Virtual System Migration Service.
- F: Warum funktioniert CredSSP unter Server 2025 oft nicht? | A: Credential Guard ist standardmäßig aktiv und blockiert CredSSP-Delegierung.
- F: Cmdlet zum Umstellen auf Kerberos? | A: Set-VMHost -VirtualMachineMigrationAuthenticationType Kerberos
- F: Cmdlet zum Aktivieren der Live-Migration? | A: Enable-VMMigration
- F: Welcher Parameter verschiebt bei Move-VM auch die Festplatten? | A: -IncludeStorage
- F: Wann hilft der Prozessorkompatibilitätsmodus? | A: Bei unterschiedlichen CPU-Generationen desselben Herstellers.

## Quiz
? Live-Migration mit CredSSP, remote von ADMIN01 gestartet, scheitert. Warum?
* Double Hop – CredSSP verlangt Anmeldung am Quellhost
- Die VM nutzt dynamischen Arbeitsspeicher mit hohem Puffer
- Kerberos ist im Netzwerk per Firewall auf Port 88 blockiert
- Der Zielhost hat keine IP-Adresse vom DHCP-Server erhalten
! Der Quellhost kann die Anmeldeinformationen nicht weitergeben.

? Welche Dienste werden bei der eingeschränkten Delegierung eingetragen?
* cifs und Microsoft Virtual System Migration Service
- http und ldap auf dem Domänencontroller beider Hosts
- host und rpcss für die Remoteverwaltung des Zielhosts
- dns und kerberos (krbtgt) für die Ticketweitergabe
! cifs für Dateizugriff, der Migrationsdienst für die Live-Migration.

? Wo wird die Delegierung für die Migration HV01 → HV02 eingetragen?
* Am Computerkonto HV01 mit HV02 als Ziel
- Am Benutzerkonto des Admins
- Am Computerkonto des DCs
- In der lokalen Richtlinie von APP01
! Der Quellhost handelt im Auftrag des Benutzers.

? Welche Delegierungsart ist empfohlen?
* Eingeschränkt, nur Kerberos
- Uneingeschränkt
- Jedes Protokoll verwenden
- Keine Delegierung, nur NTLM
! Uneingeschränkte Delegierung ist ein Sicherheitsrisiko.

? Was blockiert CredSSP unter Windows Server 2025 häufig?
* Credential Guard
- Secure Boot
- BitLocker
- SMB-Signierung
! Credential Guard schützt Anmeldeinformationen vor Weitergabe.

? Welches Cmdlet startet eine Shared-Nothing-Live-Migration?
* Move-VM -IncludeStorage
- Move-VMStorage -DestinationHost
- Export-VM -Live -Path \\HV02
- Start-VMFailover -Prepare
! Move-VMStorage verschiebt nur den Speicher auf demselben Host.

? Welche Einstellung erleichtert Migration zwischen unterschiedlichen Intel-Generationen?
* Prozessorkompatibilität (CompatibilityForMigrationEnabled)
- Virtualisierungserweiterungen (ExposeVirtualizationExtensions)
- NUMA-Spanning auf beiden Hosts (NumaSpanningEnabled)
- MAC-Adress-Spoofing an der vNIC (MacAddressSpoofing)
! Funktioniert nicht zwischen Intel und AMD.

? Warum Delegierung in beide Richtungen?
* Damit auch die Rückmigration funktioniert
- Weil AD das erzwingt
- Damit Replikat aktiviert wird
- Damit Prüfpunkte erhalten bleiben
! Jeder Host ist für seine ausgehenden Migrationen der Quellhost.
