---
id: legacy-ntlm-altlasten
bereich: Legacy
block: A12
kapitel: Legacy-Box
titel: NTLM, LM-Hash und veraltete Kerberos-Verschlüsselung
stufe: Profi
quellen: [Microsoft Learn NTLM-Deprecation, Kerberos-Verschlüsselungstypen, eigene Zusammenstellung]
verweise: [ap1-a6-kerberos, legacy-smb1, legacy-streichliste-2025, legacy-betrieb-absichern]
---

## Profi

### Die Familie der Windows-Anmeldeverfahren
| Verfahren | Zeit | Status |
|---|---|---|
| **LM** (*LAN Manager*) | 1987 | Extrem schwach (max. 14 Zeichen, in 2×7 geteilt, nur Großbuchstaben), **Legacy** |
| **NTLMv1** | NT 3.1 | Schwach, **entfernt seit Windows 11 24H2 / Server 2025** |
| **NTLMv2** | NT 4 SP4 | Besser, aber **weiterhin angreifbar (Relay)**; **deprecated**, wird in künftiger Version entfernt |
| **Kerberos** | Windows 2000 | **Standard in AD**, Ticket-basiert, gegenseitige Authentifizierung |

**Challenge-Response** (NTLM): Der Server sendet eine **Zufallszahl** (Challenge), der Client verschlüsselt sie mit dem **NT-Hash** seines Kennworts. Das Kennwort selbst geht nie über die Leitung, aber der **Hash reicht** zur Anmeldung (**Pass-the-Hash**).

### Wann fällt Windows auf NTLM zurück?
- Zugriff über **IP-Adresse** statt Namen (kein SPN möglich)
- Server außerhalb der Domäne, **Workgroup**, fehlende Vertrauensstellung
- Fehlende/doppelte **SPNs**
- Altanwendungen, die NTLM **hart codieren**
- Kerberos-Tickets nicht erhältlich (DC nicht erreichbar)

### Angriffe auf NTLM
| Angriff | Idee |
|---|---|
| **Pass-the-Hash** | Gestohlener NT-Hash wird direkt zur Anmeldung genutzt |
| **NTLM-Relay** | Angreifer leitet Anmeldung an einen anderen Server weiter (Gegenmittel: **SMB-/LDAP-Signierung**, **EPA**) |
| **LLMNR/NBT-NS-Poisoning** | Erbeutet NTLMv2-Antworten (mit Responder), die offline geknackt werden |
| **Offline-Brute-Force** | Schwache Kennwörter fallen schnell |
| **Downgrade** | Erzwingt LM/NTLMv1 bei falsch konfiguriertem Server |

### LmCompatibilityLevel (Sicherheitsrichtlinie „Netzwerksicherheit: LAN Manager-Authentifizierungsebene“)
| Wert | Client sendet | DC akzeptiert |
|---|---|---|
| 0 | LM + NTLM | alles |
| 1 | LM + NTLM (v2 falls ausgehandelt) | alles |
| 2 | nur NTLM | alles |
| 3 | nur NTLMv2 | alles |
| 4 | nur NTLMv2 | lehnt LM ab |
| **5** | nur NTLMv2 | **lehnt LM und NTLMv1 ab** (Empfehlung) |
Auf Server 2025 ist NTLMv1 ohnehin entfernt; die Einstellung 5 ist heute der sinnvolle Standard.

### Weitere Altlasten in der Anmeldung
- **LM-Hash speichern**: „Keine LAN Manager-Hashwerte für nächste Kennwortänderung speichern“ aktivieren.
- **Kennwort mit umkehrbarer Verschlüsselung** (*reversible encryption*): nur für Sonderfälle wie CHAP; sonst aus.
- **Kerberos-Verschlüsselungstypen**: **DES** (disabled seit Server 2008 R2, entfernt in Server 2025), **RC4-HMAC** (schwach, wird schrittweise abgeschaltet), **AES128/AES256-CTS-HMAC-SHA1** (Standard, empfohlen).
- **Uneingeschränkte Delegierung** (*unconstrained delegation*) und **KRBTGT-Kennwort seit Jahren nicht gewechselt**: klassische Angriffspunkte bei Altdomänen.
- **Basic Authentication ohne TLS** (HTTP): Kennwort im Klartext (Base64).
- **Kein NLA bei RDP** und **Kein LDAP-Signing / Channel Binding**: erlaubt Abhören/Relay.

### NTLM-Nutzung untersuchen (Audit)
1. **GPO** (DCs und Server): „Netzwerksicherheit: NTLM einschränken: NTLM-Authentifizierung in dieser Domäne“ → **„Überwachung für alle Konten aktivieren“**.
2. Ereignisse **8004** (DC: NTLM-Anfragen) und **4776** (Sicherheitslog: Anmeldeinformationen validiert) auswerten.
3. Konten, Server und Anwendungen ermitteln, **SPNs** korrigieren, **Zugriff per FQDN** statt IP.
4. Erst dann **blockieren**: „Ausgehenden NTLM-Datenverkehr einschränken“ → Ausnahmen pflegen.

### Schutzgruppe „Protected Users“
Konten in der Gruppe **Protected Users** (ab Server 2012 R2 Domänenfunktionsebene) dürfen **kein NTLM, kein DES/RC4, keine Delegierung**, TGT-Lebensdauer 4 Stunden. Ideal für **Administratoren**.

## Lab
**Maschinen**: **DC01** (GPO), **SRV01**, **CL01**.

### GUI
1. **DC01**: GPMC → Neues GPO „Sicherheit – NTLM“ → Bearbeiten → Computerkonfiguration → Windows-Einstellungen → Sicherheitseinstellungen → Lokale Richtlinien → **Sicherheitsoptionen**.
2. **DC01**: **„Netzwerksicherheit: LAN Manager-Authentifizierungsebene“** → „Nur NTLMv2-Antworten senden. LM & NTLM ablehnen“ (= Stufe 5).
3. **DC01**: **„Netzwerksicherheit: LAN Manager-Hashwert bei nächster Kennwortänderung nicht speichern“** → Aktiviert.
4. **DC01**: **„Netzwerksicherheit: NTLM einschränken: NTLM-Authentifizierung in dieser Domäne“** → „Überwachung für alle Konten aktivieren“.
5. GPO mit **Domänencontroller-OU** und **Server-OU** verknüpfen.
6. **DC01**: `gpupdate /force`, danach in der Ereignisanzeige unter **Anwendungs- und Dienstprotokolle → Microsoft → Windows → NTLM → Operational** die Ereignisse auswerten.
7. **DC01**: ADUC → Users → Gruppe **Protected Users** → Mitglieder → Administratorkonto hinzufügen.

### PowerShell
```powershell
# Auf CL01 – aktuelle Ebene lesen
Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa" -Name LmCompatibilityLevel

# Auf CL01/SRV01 – Stufe 5 setzen
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa" -Name LmCompatibilityLevel -Value 5

# Auf DC01 – Admin in Protected Users aufnehmen
Add-ADGroupMember -Identity "Protected Users" -Members "adm.becker"

# Auf DC01 – NTLM-Ereignisse der letzten Zeit lesen
Get-WinEvent -LogName "Microsoft-Windows-NTLM/Operational" -MaxEvents 50 |
  Select-Object TimeCreated, Id, Message
```

## Einfach

Stell dir eine **Diskothek** vor.

**NTLM** ist der **Türsteher mit einer Liste**. Er fragt dich: „Wie heißt du, und was ist das geheime Wort?“ Damit du das Wort nicht laut sagen musst, gibst du ihm eine **verschlüsselte Notiz** (Hash). Problem: **Wer diese Notiz stiehlt, kommt genauso rein** (Pass-the-Hash). Und der Türsteher kann einen **Freund des Diebs** an der Tür austauschen (Relay).

**LM** ist noch schlimmer: Der Türsteher würde schon das **halbe Passwort** ausreichen lassen.

**Kerberos** ist ein **Eintrittsarmband**: Du gehst **einmal zur Kasse** (DC) und bekommst ein Armband mit Zeitstempel (Ticket). An der Tür wird nur das Armband gezeigt, und **auch die Disko wird geprüft** (gegenseitige Authentifizierung). Falsche Türsteher fallen auf.

Warum fällt manchmal doch alles auf den Türsteher (NTLM) zurück? Wenn du **nur mit einer Hausnummer** (IP-Adresse) ankommst und nicht mit dem Namen der Disko, findet die Kasse kein Ticket. Darum **immer mit Namen (FQDN)** verbinden.

Für **Chefs und Admins** gibt es die **VIP-Gruppe „Protected Users“**: Für sie gilt **nur** das Armband, nie die alte Liste.

## Merksatz
- **Kerberos = Ticket, NTLM = Challenge-Response**.
- **LmCompatibilityLevel 5** = nur NTLMv2, LM und v1 abgelehnt.
- **NTLMv1 entfernt** ab Server 2025 / Windows 11 24H2.
- NTLM-Rückfall: **IP statt Name**, **fehlender SPN**, **Workgroup**.
- **Protected Users** = kein NTLM, kein RC4/DES, keine Delegierung.
- Erst **auditieren**, dann NTLM blockieren.

## Prüfungsfalle
- Pass-the-Hash braucht das **Kennwort nicht**, der **Hash genügt**.
- NTLMv2 ist **nicht sicher**, nur besser als v1 (Relay bleibt möglich).
- **Signierung** (SMB/LDAP) und **EPA** gegen Relay, nicht „stärkere Kennwörter“.
- Gruppe **Protected Users** ist keine Rechtegruppe, sondern eine **Schutzgruppe**.
- Ereignis **4776** gibt es für NTLM, Kerberos protokolliert **4768/4769**.

## Grafik
### Türsteher gegen Armband
Links NTLM: Challenge (Würfel), Antwort, ein Dieb greift die Notiz ab. Rechts Kerberos: Kasse (KDC), Ticket, Disko mit gegenseitigem Handschlag. Klick auf „IP statt Name“ lässt die Kerberos-Spur abbrechen und auf NTLM zurückfallen.

### LmCompatibilityLevel-Regler
Ein Schieberegler 0–5; je höher, desto mehr rote Verfahren (LM, NTLMv1) fallen weg, bis auf Stufe 5 nur noch NTLMv2 übrig bleibt.

## Karteikarten
- F: Was ist der Unterschied zwischen Kerberos und NTLM? | A: Kerberos nutzt Tickets und gegenseitige Authentifizierung, NTLM ein Challenge-Response mit dem NT-Hash.
- F: Was ist Pass-the-Hash? | A: Anmeldung mit gestohlenem NT-Hash, ohne das Kennwort zu kennen.
- F: Wann fällt Windows auf NTLM zurück? | A: Bei IP statt Name, fehlendem SPN, Workgroup, fehlender Kerberos-Möglichkeit.
- F: Welche LmCompatibilityLevel ist empfohlen? | A: 5 (nur NTLMv2, LM und NTLMv1 abgelehnt).
- F: Ab welcher Version ist NTLMv1 entfernt? | A: Windows 11 24H2 und Windows Server 2025.
- F: Was schützt vor NTLM-Relay? | A: SMB-/LDAP-Signierung und Extended Protection for Authentication.
- F: Welche Ereignis-ID protokolliert NTLM-Validierung am DC? | A: 4776.
- F: Was bewirkt die Gruppe Protected Users? | A: Kein NTLM, kein DES/RC4, keine Delegierung, TGT-Lebensdauer 4 Stunden.
- F: Welche Kerberos-Verschlüsselung ist Standard? | A: AES128/AES256-CTS-HMAC-SHA1.
- F: Welche Kerberos-Verschlüsselung wurde in Server 2025 entfernt? | A: DES.
- F: Warum ist LM-Hash schwach? | A: Max. 14 Zeichen, zwei 7er-Blöcke, nur Großbuchstaben, ohne Salt.
- F: Wie prüft man, wer noch NTLM nutzt? | A: GPO „NTLM einschränken“ mit Überwachung, Ereignisse im NTLM-Operational-Log.

## Quiz
? Welche Authentifizierung ist in AD-Domänen der Standard?
* Kerberos
- NTLMv1
- LM
- Basic

? Was ist Pass-the-Hash?
* Anmeldung mit gestohlenem Hash ohne Kennwort
- Das Knacken eines Kennworts per Wörterbuch
- Ein Ticket-Diebstahl bei Kerberos
- Ein DNS-Angriff

? Welche LmCompatibilityLevel schließt LM und NTLMv1 am DC aus?
* 5
- 0
- 2
- 3

? Warum landet ein Zugriff über \\192.168.10.20\Freigabe oft bei NTLM?
* Kerberos braucht einen Namen mit SPN, die IP liefert keinen
- IP-Adressen sind verboten
- Kerberos funktioniert nur im Internet
- NTLM ist schneller

? Welche Gruppe verhindert NTLM für Administratorkonten?
* Protected Users
- Domänen-Admins
- Kontenoperatoren
- Schema-Admins

? Welche Maßnahme schützt gegen NTLM-Relay?
* SMB- und LDAP-Signierung
- Größere Kennwortlänge allein
- Deaktivierung von DNS
- Einsatz von FAT32

? Welcher Algorithmus gilt in Kerberos als veraltet und sollte deaktiviert werden?
* RC4 (und DES)
- AES-256
- AES-128
- SHA-256
! Moderne Domänen nutzen AES-Verschlüsselungstypen.

? Wie kann man feststellen, welche Systeme noch NTLM nutzen?
* Mit NTLM-Überwachungsrichtlinien (Netzwerksicherheit: NTLM einschränken – überwachen) und Ereignisprotokollen
- Mit ipconfig
- Mit dem Geräte-Manager
- Gar nicht
! Erst überwachen, dann schrittweise einschränken.
