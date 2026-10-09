---
id: server-hvsz-48
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 48 – Hyper-V-Manager remote von Windows 11 in einer Arbeitsgruppe
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-credssp-delegation, az800-powershell-remoting, az800-wac, server-hvsz-49]
---

## Profi

### Ticket
**Kunde meldet:** „Unser kleiner Standort hat keinen DC. Der Admin möchte HV03 vom Windows-11-Laptop aus mit dem Hyper-V-Manager verwalten, bekommt aber ‚Zugriff verweigert‘ bzw. ‚Fehler beim Herstellen einer Verbindung mit dem Server‘.“
- **Priorität:** niedrig
- **Betroffene Maschinen:** Host **HV03** (Arbeitsgruppe), Client **ADMIN-W11** (Arbeitsgruppe)

### Ausgangslage
- **HV03**: Windows Server 2025, **Arbeitsgruppe**, IP 192.168.20.13, lokales Konto „Administrator“.
- **ADMIN-W11**: Windows 11 Pro, Arbeitsgruppe, IP 192.168.20.50.
- Kein DNS-Server: Namensauflösung über `hosts`-Datei.

### Analyse
- Der Hyper-V-Manager nutzt **WinRM/WS-Management** für die Remoteverwaltung.
- Ohne Domäne fehlt **Kerberos** → Authentifizierung über **NTLM**. Dafür muss der Client dem Server ausdrücklich vertrauen: **TrustedHosts**.
- Der Hyper-V-Manager meldet sich in diesem Fall mit **CredSSP** an (Option „Als anderer Benutzer verbinden“). Dazu muss:
  - auf dem **Server** CredSSP als **Server**-Rolle aktiviert sein,
  - auf dem **Client** CredSSP als **Client** mit Delegierung an den Server erlaubt sein,
  - die Richtlinie „**Delegierung von neuen Anmeldeinformationen mit reiner NTLM-Serverauthentifizierung zulassen**“ den Eintrag `wsman/HV03` enthalten.
- Windows 11 braucht die **Hyper-V-Verwaltungstools** (Hyper-V-GUI-Verwaltungstools), nicht die komplette Hyper-V-Plattform.
- Netzwerkprofil **Öffentlich** blockiert `Enable-PSRemoting` → auf **Privat** stellen.

### Lösungsweg
1. **HV03**: PowerShell-Remoting aktivieren und CredSSP-Server einschalten. *Begründung:* WinRM-Listener und Firewallregeln.
2. **ADMIN-W11**: Hyper-V-Verwaltungstools installieren. *Begründung:* Hyper-V-Manager vorhanden.
3. **ADMIN-W11**: `hosts`-Eintrag `192.168.20.13 HV03`. *Begründung:* Namensauflösung ohne DNS.
4. **ADMIN-W11**: Netzwerkprofil **Privat**, WinRM-Dienst starten, **TrustedHosts** = HV03. *Begründung:* NTLM zu Arbeitsgruppenrechnern nur zu vertrauenswürdigen Hosts.
5. **ADMIN-W11**: `Enable-WSManCredSSP -Role Client -DelegateComputer HV03`. *Begründung:* Anmeldedaten dürfen an HV03 delegiert werden.
6. **ADMIN-W11**: Lokale Gruppenrichtlinie (gpedit.msc) → Computerkonfiguration → Administrative Vorlagen → System → **Delegierung von Anmeldeinformationen** → „Delegierung von neuen Anmeldeinformationen mit reiner NTLM-Serverauthentifizierung zulassen“ → Aktiviert → Liste `wsman/HV03`. *Begründung:* Ohne diese Richtlinie lehnt CredSSP NTLM-Ziele ab.
7. **Hyper-V-Manager** → Verbindung mit Server → HV03 → „**Als anderer Benutzer verbinden**“ → `HV03\Administrator`. *Begründung:* Lokales Konto des Hosts.

### Ergebnis prüfen
- ADMIN-W11: `Test-WSMan HV03` → Antwort mit ProductVersion.
- ADMIN-W11: `Get-Item WSMan:\localhost\Client\TrustedHosts` → HV03.
- Hyper-V-Manager zeigt VMs von HV03; `Get-VM -ComputerName HV03 -Credential HV03\Administrator` funktioniert.

### Vorbeugung
- Langfristig Domäne oder **Windows Admin Center** (Gateway) einsetzen.
- TrustedHosts nicht mit `*` füllen – nur konkrete Hosts.
- CredSSP nur dort aktivieren, wo nötig (Anmeldedaten werden an das Ziel übertragen).

## Einfach
Stell dir vor, du möchtest die **Fernbedienung** (Hyper-V-Manager) für den Fernseher im Nachbarhaus (HV03) benutzen. In einer Firma mit **Domäne** gibt es einen gemeinsamen Hausverwalter, der allen sagt, wer wem vertrauen darf (Kerberos). In der **Arbeitsgruppe** gibt es den nicht – jeder ist für sich.

Deshalb müssen wir das Vertrauen **von Hand** einrichten:
- Der Fernseher muss überhaupt **Fernbedienungen annehmen** (Remoting einschalten).
- Dein Laptop schreibt das Nachbarhaus auf eine **Liste der vertrauenswürdigen Häuser** (TrustedHosts).
- Dein Laptop darf deinen **Schlüssel weiterreichen** (CredSSP-Delegierung), damit du dich drüben wie ein Bewohner anmelden kannst.
- Und eine **Regel** (Gruppenrichtlinie) muss erlauben, dass dein Schlüssel auch an Häuser ohne Hausverwalter geht.

Damit der Laptop das Nachbarhaus überhaupt findet, steht seine Adresse im **Adressbuch** (hosts-Datei). Danach klappt die Fernbedienung – du meldest dich als „Administrator von HV03“ an.

## Merksatz
- Arbeitsgruppe ⇒ **NTLM** ⇒ **TrustedHosts**.
- Hyper-V-Manager remote ⇒ **CredSSP**: Server **und** Client.
- GPO: **NTLM-only-Delegierung** mit `wsman/HV03`.
- Netzwerkprofil **Privat**, Anmeldung als **HV03\Administrator**.

## Prüfungsfalle
- TrustedHosts wird auf dem **Client** gesetzt, nicht auf dem Server.
- CredSSP braucht **beide** Seiten: `-Role Server` auf HV03, `-Role Client -DelegateComputer HV03` auf dem Laptop.
- Die Richtlinie heißt „… **mit reiner NTLM-Serverauthentifizierung**“ – die normale Variante reicht in der Arbeitsgruppe nicht.
- Auf Windows 11 genügen die **Verwaltungstools**; die Hyper-V-Plattform selbst ist nicht nötig.

## Grafik
### Remoteverwaltung ohne Domäne
1. ADMIN-W11 -> HV03: Hyper-V-Manager verbindet über WinRM (5985)
2. HV03 -> ADMIN-W11: Zugriff verweigert – kein Vertrauen, kein Kerberos
3. Admin -> ADMIN-W11: TrustedHosts HV03, CredSSP Client, GPO wsman/HV03
4. Admin -> HV03: Enable-PSRemoting, CredSSP Server
5. ADMIN-W11 -> HV03: Anmeldung HV03\Administrator per CredSSP
6. HV03 -> ADMIN-W11: VM-Liste im Hyper-V-Manager

## Lab
**Nachstellen:** Zuerst ohne Vorbereitung verbinden (Fehler), dann konfigurieren. Maschinen: **HV03** (Arbeitsgruppe), **ADMIN-W11** (Arbeitsgruppe).

### GUI
1. **ADMIN-W11**: Einstellungen → System → Optionale Features → Weitere Windows-Features → **Hyper-V** → nur „**Hyper-V-Verwaltungstools**“ → OK.
2. **ADMIN-W11**: Hyper-V-Manager → Verbindung mit Server → HV03 → Fehlermeldung notieren (Fehlerbild).
3. **ADMIN-W11**: Editor als Admin → `C:\Windows\System32\drivers\etc\hosts` → `192.168.20.13 HV03`.
4. **ADMIN-W11**: Einstellungen → Netzwerk → Ethernet → Netzwerkprofil **Privat**.
5. **ADMIN-W11**: `gpedit.msc` → Computerkonfiguration → Administrative Vorlagen → System → Delegierung von Anmeldeinformationen → „**Delegierung von neuen Anmeldeinformationen mit reiner NTLM-Serverauthentifizierung zulassen**“ → Aktiviert → Anzeigen → `wsman/HV03`.
6. **HV03** und **ADMIN-W11**: PowerShell-Befehle unten ausführen.
7. **ADMIN-W11**: Hyper-V-Manager → Verbindung mit Server → HV03 → „Als anderer Benutzer verbinden“ → Benutzer festlegen → `HV03\Administrator` → OK.

### PowerShell
```powershell
# Auf HV03 – Remoting und CredSSP-Server
Enable-PSRemoting -Force
Enable-WSManCredSSP -Role Server -Force

# Auf ADMIN-W11 – Verwaltungstools
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-Tools-All -All

# Auf ADMIN-W11 – Netzwerkprofil, WinRM, TrustedHosts, CredSSP-Client
Get-NetConnectionProfile | Set-NetConnectionProfile -NetworkCategory Private
Start-Service WinRM
Set-Item WSMan:\localhost\Client\TrustedHosts -Value "HV03" -Force
Enable-WSManCredSSP -Role Client -DelegateComputer "HV03" -Force

# Auf ADMIN-W11 – Test
Test-WSMan HV03
Get-VM -ComputerName HV03 -Credential HV03\Administrator
```

## Reihenfolge
### Hyper-V-Remoteverwaltung in der Arbeitsgruppe
1. Auf dem Host PowerShell-Remoting aktivieren
2. Auf dem Host CredSSP als Server aktivieren
3. Auf dem Client Verwaltungstools installieren
4. Auf dem Client hosts-Eintrag und Netzwerkprofil Privat
5. TrustedHosts auf dem Client setzen
6. CredSSP-Client mit Delegierung aktivieren
7. Richtlinie NTLM-only-Delegierung mit wsman/HV03 setzen
8. Im Hyper-V-Manager als HV03\Administrator verbinden

## Szenario
### Kontrollfragen
HV03 und ADMIN-W11 sind in einer Arbeitsgruppe, kein DNS. Der Hyper-V-Manager meldet beim Verbinden einen Zugriffsfehler.
- F: Wo wird TrustedHosts gesetzt? | A: Auf dem Client ADMIN-W11: Set-Item WSMan:\localhost\Client\TrustedHosts -Value "HV03"
- F: Welche CredSSP-Rolle bekommt HV03? | A: Server (Enable-WSManCredSSP -Role Server).
- F: Welche Richtlinie muss auf dem Client gesetzt werden? | A: „Delegierung von neuen Anmeldeinformationen mit reiner NTLM-Serverauthentifizierung zulassen“ mit wsman/HV03.
- F: Mit welchem Konto meldet man sich an? | A: Mit dem lokalen Konto des Hosts, z. B. HV03\Administrator.
- F: Was blockiert Enable-PSRemoting häufig? | A: Ein Netzwerkprofil „Öffentlich“.

## Legende
### TrustedHosts
- Was: Liste von Computern, an die der WinRM-Client ohne Kerberos (NTLM) Anmeldedaten sendet.
- Wie: Set-Item WSMan:\localhost\Client\TrustedHosts -Value "Name"
- Wann: Remoteverwaltung von Arbeitsgruppenrechnern oder über Domänengrenzen ohne Vertrauen.
- Wo: Auf dem verwaltenden Client.
- Warum: Ohne Kerberos kann der Client die Identität des Servers nicht prüfen.
### CredSSP-Delegierung
- Was: Weitergabe der Anmeldeinformationen an den Zielserver.
- Wie: Enable-WSManCredSSP (Client und Server) plus Richtlinie zur Delegierung.
- Warum: Der Hyper-V-Manager nutzt sie für „Als anderer Benutzer verbinden“.

## Karteikarten
- F: Welches Protokoll nutzt der Hyper-V-Manager für die Remoteverwaltung? | A: WinRM / WS-Management.
- F: Warum ist in einer Arbeitsgruppe TrustedHosts nötig? | A: Es gibt kein Kerberos; NTLM-Verbindungen sind nur zu vertrauenswürdigen Hosts erlaubt.
- F: Befehl für TrustedHosts auf dem Client? | A: Set-Item WSMan:\localhost\Client\TrustedHosts -Value "HV03"
- F: Befehl für CredSSP auf dem Host? | A: Enable-WSManCredSSP -Role Server
- F: Befehl für CredSSP auf dem Client? | A: Enable-WSManCredSSP -Role Client -DelegateComputer "HV03"
- F: Welcher Eintrag gehört in die NTLM-only-Delegierungsrichtlinie? | A: wsman/HV03
- F: Was braucht Windows 11 für den Hyper-V-Manager? | A: Die Hyper-V-Verwaltungstools (z. B. Microsoft-Hyper-V-Tools-All).
- F: Wie testet man die WinRM-Erreichbarkeit? | A: Test-WSMan HV03

## Quiz
? Wo wird TrustedHosts für die Verwaltung von HV03 eingetragen?
* Auf dem verwaltenden Client
- Auf HV03
- Auf einem DC
- Im DNS
! Der Client entscheidet, wem er NTLM-Anmeldedaten sendet.

? Welche Richtlinie ist für CredSSP in der Arbeitsgruppe nötig?
* Delegierung von neuen Anmeldeinformationen mit reiner NTLM-Serverauthentifizierung zulassen
- Delegierung von Standardanmeldeinformationen zulassen
- Remoteunterstützung anbieten
- Kerberos-Armoring aktivieren
! Eintrag wsman/HV03.

? Welche CredSSP-Rolle muss HV03 bekommen?
* Server
- Client
- Gateway
- Delegate
! Der Laptop ist der Client.

? Was blockiert Enable-PSRemoting häufig auf frisch installierten Systemen?
* Netzwerkprofil Öffentlich
- Fehlende Gen-2-Firmware
- Dynamischer RAM
- Fehlende DHCP-Reservierung
! Auf Privat umstellen oder -SkipNetworkProfileCheck.

? Mit welchem Konto meldet man sich am Arbeitsgruppen-Host an?
* HV03\Administrator
- EXAMPLE\Administrator
- ADMIN-W11\Administrator
- NT AUTHORITY\SYSTEM
! Lokales Konto des Zielhosts.

? Welche Komponente braucht Windows 11 mindestens?
* Die Hyper-V-Verwaltungstools
- Die komplette Hyper-V-Plattform
- Windows-Sandbox
- WSL2
! Die Plattform ist für die Verwaltung nicht nötig.

? Welcher Befehl testet die WinRM-Verbindung?
* Test-WSMan HV03
- Test-NetConnection -Port 3389
- ping -wsman HV03
- Get-WinEvent -ComputerName HV03 -Test
! Antwortet der Dienst, ist WinRM erreichbar.

? Was ist eine sichere Alternative zur Konfiguration mit CredSSP?
* Domänenmitgliedschaft bzw. Windows Admin Center als Gateway
- TrustedHosts auf * setzen
- Firewall auf beiden Systemen abschalten
- Kennwortlose Anmeldung als Gast
! TrustedHosts mit * ist ein Sicherheitsrisiko.
