---
id: ap1-a6-kerberos
bereich: AP1
block: A6
kapitel: Windows Server
titel: Authentifizierung – Kerberos, NTLM, SPN & Überwachung
stufe: Profi
quellen: [Server_2008_R2_-_70_640_2nd_de.pdf, Identitätsmanagement_mit_Windows_Server_2016_70-742.pdf]
verweise: [ap1-a6-adds, ap1-a5-namensaufloesung, ap1-a6-kontorichtlinien, az800-credssp-delegation, az801-protected-users]
---

## Profi

### Authentifizierung vs. Autorisierung
- **Authentifizierung**: Wer bist du? (Nachweis der Identität – Kennwort, Zertifikat, Smartcard, Windows Hello, MFA)
- **Autorisierung**: Was darfst du? (Prüfung des Zugriffstokens gegen ACLs, Benutzerrechte)
In einer Domäne übernimmt der **DC** die Authentifizierung – bevorzugt per **Kerberos v5**, als Fallback per **NTLM**.

### Kerberos v5
**Kerberos** (RFC 4120, **Port 88** TCP/UDP) ist ein **ticketbasiertes** Protokoll mit einer vertrauenswürdigen dritten Instanz, dem **KDC** (Key Distribution Center) – in AD ist **jeder DC ein KDC**. Kennwörter werden **nie übers Netz** geschickt; der Nachweis erfolgt über verschlüsselte Zeitstempel und Tickets.

**Ablauf (vereinfacht)**:
1. **AS-REQ/AS-REP** (Authentication Service): Der Client meldet sich an und beweist seine Identität mit einem aus dem Kennwort abgeleiteten Schlüssel (verschlüsselter Zeitstempel = Pre-Authentication). Er erhält ein **TGT** (Ticket Granting Ticket), verschlüsselt mit dem Schlüssel des Kontos **krbtgt**. Gültigkeit Standard **10 Stunden**, erneuerbar bis 7 Tage.
2. **TGS-REQ/TGS-REP** (Ticket Granting Service): Will der Client auf einen Dienst zugreifen (z. B. `cifs/SRV01`), legt er das TGT vor und erhält ein **Service Ticket** (TGS), verschlüsselt mit dem Schlüssel des **Dienstkontos**.
3. **AP-REQ**: Der Client legt das Service Ticket beim **Server** vor. Der Server entschlüsselt es mit seinem eigenen Schlüssel – **ohne den DC erneut zu fragen** – und findet darin die Identität und die **Gruppen-SIDs (PAC)** des Benutzers.
Vorteile: **gegenseitige Authentifizierung** (Client prüft auch den Server), **Single Sign-On**, weniger Last auf dem DC, Delegierung möglich, stark verschlüsselt (AES).

**Voraussetzungen**:
- **Zeitsynchronisation**: maximale Abweichung Standard **5 Minuten** (Schutz vor Replay-Angriffen). Die Zeit kommt hierarchisch: Clients → DC → **PDC-Emulator der Stammdomäne** → externe NTP-Quelle. Zeitprobleme = Anmeldeprobleme!
- **DNS/Namen**: Kerberos arbeitet mit **Namen**. Zugriff per **IP-Adresse** (`\\192.168.1.100\Daten`) führt meist zu **NTLM** statt Kerberos.
- **SPN** (Service Principal Name): Jeder Dienst ist unter einem Namen registriert, z. B. `HTTP/intranet.contoso.local`, `MSSQLSvc/sql01.contoso.local:1433`, am **Konto, unter dem der Dienst läuft**. Fehlt der SPN oder existiert er **doppelt**, schlägt Kerberos fehl → Fallback auf NTLM oder Fehler. Verwaltung: `setspn -L konto`, `setspn -S HTTP/intranet.contoso.local CONTOSO\svc-web`, Duplikate: `setspn -X`.

**Delegierung**: Ein Dienst greift **im Namen des Benutzers** auf einen weiteren Dienst zu (Webserver → Datenbank, **Double Hop**). Arten: uneingeschränkt (unsicher), **eingeschränkt** (Constrained, nur auf festgelegte SPNs), **ressourcenbasiert eingeschränkt** (RBCD, der Zieldienst entscheidet). Konten in **„Konto ist vertraulich und kann nicht delegiert werden“** bzw. der Gruppe **Protected Users** sind ausgenommen.

**Tickets anzeigen/löschen**: `klist`, `klist purge`, `klist -li 0x3e7 purge` (Computerkonto). Ereignis-IDs im Sicherheitsprotokoll des DCs: **4768** (TGT angefordert), **4769** (Service Ticket), **4771** (Pre-Auth fehlgeschlagen).

### NTLM
**NTLM** (NT LAN Manager, v2) ist das ältere **Challenge-Response-Verfahren**: Der Server schickt eine Zufallszahl (Challenge), der Client antwortet mit einem aus dem Kennwort-Hash berechneten Wert, der Server lässt ihn vom DC prüfen (Pass-Through).
Wird genutzt bei: Zugriff per IP, lokalen Konten, Arbeitsgruppen, fehlendem/doppeltem SPN, alten Anwendungen, fehlender DC-Erreichbarkeit.
**Nachteile**: keine gegenseitige Authentifizierung, DC bei jedem Zugriff belastet, anfällig für **Pass-the-Hash**, **Relay-Angriffe** (siehe LLMNR-Poisoning), Offline-Knacken von NTLMv1-Antworten. → NTLM überwachen und schrittweise einschränken (GPO „Netzwerksicherheit: NTLM einschränken …“), **NTLMv1 und LM** unbedingt verbieten (LAN Manager-Authentifizierungsebene: „Nur NTLMv2-Antworten senden. LM & NTLM verweigern“). Microsoft plant, NTLM in künftigen Windows-Versionen standardmäßig zu deaktivieren.

**Negotiate**: Windows handelt automatisch aus – erst Kerberos, dann NTLM. Beispiel IIS: Anbieter „Negotiate“ + „NTLM“; funktioniert Kerberos wegen SPN/App-Pool-Identität nicht, fällt es auf NTLM zurück.

### Schutz privilegierter Konten
- **Protected Users** (Gruppe, ab 2012 R2): Mitglieder nur Kerberos mit AES, **kein NTLM**, keine Delegierung, **keine Zwischenspeicherung** der Anmeldeinformationen, TGT nur 4 Stunden. Nicht für Dienstkonten/Computerkonten verwenden.
- **Tier-Modell**: Admin-Konten nur auf Systemen ihrer Ebene verwenden (Domänen-Admins nur an DCs/PAWs, nicht an Arbeitsplätzen).
- **Authentication Policy Silos**: Anmeldung bestimmter Konten auf bestimmte Rechner beschränken.
- **Credential Guard**: schützt NTLM-Hashes und Kerberos-TGTs per Virtualisierung (VBS) vor dem Auslesen (Mimikatz).
- **krbtgt-Kennwort** regelmäßig (zweimal hintereinander) zurücksetzen – Schutz vor „Golden Tickets“.

### Anmeldeinformationen und Anmeldung
- **Zwischengespeicherte Anmeldungen**: Clients speichern die letzten Anmeldungen (Standard 10), damit Laptops ohne DC-Verbindung angemeldet werden können.
- **UPN** (`a.meier@contoso.local`) vs. **Down-Level-Name** (`CONTOSO\a.meier`) – beide möglich; UPN-Suffixe (z. B. `@firma.de`) unter „Active Directory-Domänen und -Vertrauensstellungen“ hinzufügbar.
- **Smartcard/Zertifikat**, **Windows Hello for Business** (Schlüssel/Zertifikat statt Kennwort).

### Überwachung (Auditing)
Sicherheitsrelevante Ereignisse werden im **Sicherheitsprotokoll** erfasst – nur, wenn die **Überwachungsrichtlinie** es verlangt:
`Computerkonfiguration → Richtlinien → Windows-Einstellungen → Sicherheitseinstellungen → Erweiterte Überwachungsrichtlinienkonfiguration`
| Kategorie (Auswahl) | Beispiel |
|---|---|
| Kontoanmeldung | Kerberos-Authentifizierung am DC (4768/4771) |
| Anmelden/Abmelden | erfolgreiche/fehlgeschlagene Anmeldung (**4624/4625**), Sperrung (**4740**) |
| Kontoverwaltung | Benutzer angelegt (4720), Gruppe geändert (4728/4732) |
| DS-Zugriff | Änderungen an AD-Objekten (5136) |
| Objektzugriff | Dateizugriffe (zusätzlich **SACL** am Ordner nötig: Sicherheit → Erweitert → Überwachung) |
| Richtlinienänderung, Rechteverwendung, System | … |
Zentral auswerten: **Ereignisweiterleitung** (Windows Event Collector) oder SIEM (Microsoft Sentinel).

## Lab
**Maschinen**: DC01, SRV01 (Dateiserver mit Freigabe „Daten“), CL01.

### GUI
1. **CL01** (Domänenbenutzer): Explorer → `\\SRV01\Daten` öffnen.
2. **CL01**: `cmd` → `klist` → Tickets für `krbtgt/CONTOSO.LOCAL` (TGT) und `cifs/SRV01.contoso.local` (Service Ticket) sichtbar.
3. **CL01**: `klist purge` → `\\192.168.1.100\Daten` (per IP) → `klist` → **kein** cifs-Ticket → Zugriff lief per **NTLM**.
4. **DC01**: Gruppenrichtlinienverwaltung → GPO „Überwachung“ an **Domain Controllers** → Erweiterte Überwachungsrichtlinienkonfiguration → Kontoanmeldung → **Kerberos-Authentifizierungsdienst überwachen** (Erfolg/Fehler); Anmelden/Abmelden → **Anmelden** und **Kontosperrung** (Erfolg/Fehler).
5. **DC01**: `gpupdate /force` → **CL01**: absichtlich falsches Kennwort → **DC01**: Ereignisanzeige → Windows-Protokolle → **Sicherheit** → Filter 4771/4625/4740.
6. **DC01**: `dsa.msc` → Ansicht → Erweiterte Features → Administrator → Eigenschaften → Mitglied von → **Protected Users** hinzufügen (nur Test; vorher sicherstellen, dass ein Notfall-Admin existiert!).
7. **DC01**: Zeitquelle prüfen: `w32tm /query /source`, `w32tm /query /status`.

### PowerShell / Befehle
```powershell
# Auf CL01
klist
klist purge
Test-ComputerSecureChannel -Verbose             # Vertrauensstellung Client ↔ Domäne ok?
w32tm /query /source

# Auf DC01 – SPNs
setspn -L CONTOSO\svc-web
setspn -S HTTP/intranet.contoso.local CONTOSO\svc-web
setspn -X                                        # doppelte SPNs finden

# Auf DC01 – Ereignisse
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625,4740,4771} -MaxEvents 20 |
  Format-Table TimeCreated, Id, Message -Wrap
auditpol /get /category:*
auditpol /set /subcategory:"Anmelden" /success:enable /failure:enable

# Protected Users und Delegierung
Add-ADGroupMember "Protected Users" -Members adm.becker
Set-ADUser adm.becker -AccountNotDelegated $true
# PDC-Emulator der Stammdomäne mit externer Zeitquelle
w32tm /config /manualpeerlist:"ptbtime1.ptb.de,0x8" /syncfromflags:manual /reliable:yes /update
```

## Einfach

**Authentifizierung** = Ausweis zeigen: „Ich bin Anna.“ **Autorisierung** = Türsteher schaut nach: „Anna darf in Raum 3, aber nicht in Raum 5.“

**Kerberos** funktioniert wie ein **Freizeitpark mit Tagesarmband**:
1. Am **Eingang** (Domänencontroller) zeigst du einmal deinen Ausweis (Passwort) und bekommst ein **Tagesarmband** (TGT). Dein Passwort musst du danach nie wieder zeigen.
2. Willst du **Achterbahn** fahren (einen Server nutzen), gehst du mit dem Armband zum **Ticketschalter** und bekommst eine **Fahrkarte nur für die Achterbahn** (Service Ticket).
3. Am **Fahrgeschäft** zeigst du die Fahrkarte. Der Mitarbeiter muss nicht beim Eingang nachfragen – er erkennt die Karte selbst (sie ist mit seinem Geheimcode verschlüsselt).
Das Armband gilt ungefähr einen Arbeitstag (10 Stunden).

**Warum ist die Uhrzeit so wichtig?** Auf jedem Ticket steht ein **Zeitstempel**. Geht deine Uhr mehr als **5 Minuten** falsch, denkt der Park: „Das ist ein altes, geklautes Ticket!“ – und lässt dich nicht rein.

**SPN** ist das **Schild am Fahrgeschäft**: „Achterbahn – betrieben von Team B.“ Steht da kein Schild oder zweimal dasselbe, weiß der Ticketschalter nicht, wem er die Fahrkarte ausstellen soll.

**NTLM** ist das **alte Verfahren**: Bei **jeder** Fahrt muss der Mitarbeiter beim Eingang anrufen und fragen: „Ist Anna echt?“ Langsamer – und Betrüger können mit einem geklauten „Passwort-Abdruck“ (Hash) so tun, als wären sie Anna.

**Protected Users** ist der **VIP-Bereich mit extra Sicherheit**: Wer drin ist, darf nur das moderne Armband nutzen, und nichts von ihm wird irgendwo liegen gelassen.

**Überwachung** ist die **Kamera am Eingang**: Sie schreibt auf, wer wann rein wollte und wer abgewiesen wurde.

## Merksatz
- Kerberos: **TGT → Service Ticket → Server** (Port **88**).
- Zeitabweichung max. **5 Minuten**.
- Zugriff per **IP = NTLM**, per **Name = Kerberos**.
- **SPN** fehlt/doppelt → Kerberos scheitert.
- Wichtige IDs: **4624/4625** Anmeldung, **4740** Sperrung, **4768/4771** Kerberos.

## Prüfungsfalle
- Jeder DC ist KDC – es gibt keinen separaten Kerberos-Server.
- Das Kennwort wird bei Kerberos nicht übertragen.
- Zeitquelle der Domäne ist der **PDC-Emulator der Stammdomäne**.
- Objektzugriffsüberwachung braucht Richtlinie **und** SACL am Objekt.
- Protected Users nicht für Dienstkonten verwenden.

## Grafik
### Freizeitpark-Kerberos
Client, KDC (Eingang + Ticketschalter), Server (Fahrgeschäft); Armband (TGT) und Fahrkarte (TGS) werden animiert übergeben; Uhr-Symbol prüft den Zeitstempel; Knopf „Uhr 10 Minuten falsch“ → rotes Kreuz.

### Kerberos vs. NTLM
Zwei Abläufe nebeneinander: Kerberos (Server prüft selbst) vs. NTLM (Server ruft bei jedem Zugriff den DC an); Zähler für DC-Anfragen.

### Double Hop
Benutzer → Webserver → SQL-Server; ohne Delegierung bleibt das Ticket am Webserver hängen, mit eingeschränkter Delegierung geht es weiter.

## Karteikarten
- F: Unterschied Authentifizierung und Autorisierung? | A: Authentifizierung prüft die Identität, Autorisierung die Berechtigungen.
- F: Was ist ein KDC? | A: Key Distribution Center – stellt Kerberos-Tickets aus; in AD ist jeder DC ein KDC.
- F: Was ist ein TGT? | A: Ticket Granting Ticket – Nachweis der Anmeldung, mit dem Service Tickets angefordert werden.
- F: Maximale Zeitabweichung bei Kerberos? | A: Standardmäßig 5 Minuten.
- F: Port von Kerberos? | A: 88 (TCP/UDP).
- F: Was ist ein SPN? | A: Service Principal Name – eindeutiger Name eines Dienstes, registriert am Dienstkonto.
- F: Wann wird NTLM statt Kerberos verwendet? | A: Zugriff per IP, lokale Konten, Arbeitsgruppe, fehlender SPN, kein DC erreichbar, alte Anwendungen.
- F: Zwei Schwächen von NTLM? | A: Keine gegenseitige Authentifizierung; anfällig für Pass-the-Hash und Relay.
- F: Was bewirkt die Gruppe Protected Users? | A: Kein NTLM, kein Caching, keine Delegierung, nur AES-Kerberos, kurze TGT-Lebensdauer.
- F: Befehl zum Anzeigen der Kerberos-Tickets? | A: klist
- F: Ereignis-ID für fehlgeschlagene Anmeldung / Kontosperrung? | A: 4625 / 4740.
- F: Wer ist die Zeitquelle einer AD-Gesamtstruktur? | A: Der PDC-Emulator der Gesamtstruktur-Stammdomäne.

## Quiz
? Ein Benutzer greift per \\192.168.1.100\Daten auf eine Freigabe zu. Welches Verfahren wird typischerweise verwendet?
* NTLM
- Kerberos
- RADIUS
- LDAP-Bind ohne Authentifizierung

? Was erhält ein Client im ersten Schritt der Kerberos-Anmeldung?
* Ein Ticket Granting Ticket (TGT)
- Ein Service Ticket für den Dateiserver
- Den NTLM-Hash des Servers
- Eine DHCP-Lease

? Anmeldungen scheitern plötzlich an mehreren Clients mit Kerberos-Fehlern. Was sollte zuerst geprüft werden?
* Die Zeitsynchronisation zwischen Clients und DC
- Die Bildschirmauflösung
- Die DHCP-Lease-Dauer
- Der Druckerspooler

? Wozu dient ein Service Principal Name?
* Er identifiziert einen Dienst eindeutig, damit der KDC ein Ticket für das richtige Konto ausstellt
- Er speichert das Benutzerkennwort
- Er ersetzt den DNS-Namen
- Er aktiviert NTLMv1

? Welche Ereignis-ID protokolliert eine Kontosperrung?
* 4740
- 4624
- 4768
- 6527
