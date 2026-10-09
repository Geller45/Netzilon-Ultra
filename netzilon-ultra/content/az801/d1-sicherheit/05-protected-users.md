---
id: az801-protected-users
bereich: AZ-801
block: A9
kapitel: Sicherheit
titel: Protected Users (Sicherheitsgruppe)
stufe: Fortgeschritten
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-credential-guard, az801-kennwortrichtlinien, az801-auth-silos, az801-dc-haertung, ap1-a6-kerberos]
---

## Profi

### Zweck
Die Gruppe **Protected Users** (*Geschützte Benutzer*) ist eine **globale Sicherheitsgruppe** mit **festen, nicht konfigurierbaren Schutzmaßnahmen** gegen **Credential-Diebstahl** (*Pass-the-Hash*, *Pass-the-Ticket*, Kerberos-Angriffe). Wer Mitglied ist, bekommt die Härtung **automatisch** – ohne GPO.

### Voraussetzungen
| Punkt | Details |
|---|---|
| **Gruppe vorhanden** | Entsteht, sobald der **PDC-Emulator** unter **Windows Server 2012 R2 oder höher** läuft und die Gruppe **repliziert** ist |
| **Client-Schutz** | **Windows 8.1 / Server 2012 R2 oder höher** |
| **DC-Schutz** | **Domänenfunktionsebene Windows Server 2012 R2 oder höher** |
| **Mitglieder** | **Benutzerkonten** (und Gruppen). **Nicht** für **Computerkonten** und **Dienstkonten/gMSA** |

### Schutz auf dem Client (Gerät, an dem sich der Benutzer anmeldet)
- **Kein CredSSP-Klartext-Caching** der Anmeldedaten.
- **Kein WDigest-Klartext-Caching**, auch wenn WDigest aktiviert ist.
- **Kein NTLM-Hash-Caching** (NTOWF).
- **Kein Caching der Kerberos-Langzeitschlüssel**.
- **Kein Cache-Anmeldeverifizierer** (*Cached Logon*): Anmeldung **nur online** gegen einen DC (**Offline-Anmeldung nicht möglich**).

### Schutz auf dem DC
| Maßnahme | Wirkung |
|---|---|
| **Kein NTLM** | Authentifizierung **nur mit Kerberos** |
| **Keine DES/RC4** | Kerberos-Vorauthentifizierung **nur mit AES** |
| **Keine Delegierung** | **Weder uneingeschränkt noch eingeschränkt** delegierbar |
| **TGT-Lebensdauer** | **4 Stunden**, **nicht erneuerbar** (danach **neue Anmeldung**) |

Die **TGT-Lebensdauer** lässt sich **nur mit Authentication Policies** ändern (Seite 08), **nicht** in der Gruppe selbst.

### Verwaltung
```powershell
# Auf DC01
Add-ADGroupMember -Identity "Protected Users" -Members admin-anna
Get-ADGroupMember -Identity "Protected Users"
```
- **ADAC/ADUC**: Gruppe **Protected Users** im Container **Users** → **Mitglieder**.
- **Empfehlung**: **Administratorkonten** (**Domänen-Admins**, **Enterprise-Admins**) aufnehmen, **erst testen**.
- **Nicht aufnehmen**: **Notfallkonten** (*Break-glass*) ohne Test, **Dienstkonten**, **Computerkonten**.

### Ereignisprotokolle (Fehlersuche)
| Ort | Protokoll |
|---|---|
| **DC** | `Microsoft-Windows-Authentication/ProtectedUserFailures-DomainController` und `...ProtectedUserSuccesses-DomainController` |
| **Client** | `Microsoft-Windows-Authentication/ProtectedUser-Client` |

Alle sind **standardmäßig deaktiviert** – in der **Ereignisanzeige** unter **Anwendungs- und Dienstprotokolle → Microsoft → Windows → Authentication** **aktivieren**.

### Typische Nebenwirkungen
| Problem | Ursache |
|---|---|
| Zugriff per **IP-Adresse** schlägt fehl | **Kerberos** braucht **Namen (SPN)**, IP → **NTLM** → **blockiert** |
| **Offline** anmelden geht nicht | **Kein** Cache-Verifizierer |
| Nach **4 Stunden** Ticket abgelaufen | **TGT nicht erneuerbar** → **neu anmelden** |
| **Delegierung** (z. B. Webserver → SQL) klappt nicht | **Delegierung** ist **gesperrt** |
| Ältere Anwendungen mit **NTLM** | **Blockiert** |

## Lab
**Maschinen**: **DC01** (Domäne example.com, DFL 2012 R2+), **CLIENT01** (Windows 11), Benutzer `admin-anna`.

### GUI
1. **DC01**: **Active Directory-Benutzer und -Computer** → **Users** → **Protected Users** → **Eigenschaften → Mitglieder → Hinzufügen** → `admin-anna`.
2. **DC01** und **CLIENT01**: **Ereignisanzeige** → **Anwendungs- und Dienstprotokolle → Microsoft → Windows → Authentication** → **ProtectedUserFailures-DomainController** (DC01) bzw. **ProtectedUser-Client** (CLIENT01) → **Rechtsklick → Protokoll aktivieren**.
3. **CLIENT01**: Als `admin-anna` anmelden → `klist` → **TGT-Ablaufzeit** ca. **4 Stunden**.
4. **CLIENT01**: Freigabe per **IP** aufrufen (`\\10.0.0.10\daten`) → **Zugriff verweigert** (NTLM blockiert). Per **Name** (`\\SRV01\daten`) → **funktioniert** (Kerberos).
5. **DC01**: **ProtectedUserFailures** → **Ereignis** zur NTLM-Ablehnung prüfen.

### PowerShell
```powershell
# Auf DC01
Add-ADGroupMember -Identity "Protected Users" -Members admin-anna
Get-ADGroupMember -Identity "Protected Users" | Select-Object Name, SamAccountName
Get-ADDomain | Select-Object DomainMode

# Auf DC01 – Protokolle aktivieren
wevtutil sl "Microsoft-Windows-Authentication/ProtectedUserFailures-DomainController" /e:true
wevtutil sl "Microsoft-Windows-Authentication/ProtectedUserSuccesses-DomainController" /e:true

# Auf CLIENT01 – Tickets prüfen
klist
```

## Einfach

**Protected Users** ist eine **VIP-Gruppe mit Sicherheitsweste**. Wer drin ist, bekommt **automatisch** die strengsten Schutzregeln – **ohne** dass du irgendwas einstellen musst.

Was ändert sich für die VIPs?
- Der **Computer merkt sich ihr Passwort nicht** (kein Zettel unter der Tastatur, den ein Dieb finden könnte).
- Sie dürfen **nur mit dem modernen Ausweis (Kerberos)** rein, **nicht** mit dem alten (**NTLM**).
- Ihr **Ausweis (TGT)** gilt nur **4 Stunden** – dann **neu anmelden**.
- Sie können **niemandem eine Vollmacht** geben (**keine Delegierung**).
- **Ohne Netz** (Offline) kommen sie **nicht** in den Rechner.

**Wer gehört rein?** **Admins** (die Schlüssel zum ganzen Haus). **Wer nicht?** **Computer** und **Dienstkonten** – die können mit den strengen Regeln nicht arbeiten.

**Wichtig**: **Erst testen**, denn manche **alten Programme** funktionieren dann nicht mehr.

## Merksatz
- **Protected Users** = **feste Härtung** per **Gruppenmitgliedschaft**, **keine GPO** nötig.
- **4 Stunden TGT**, **kein NTLM**, **kein RC4/DES**, **keine Delegierung**, **kein Caching**.
- **DFL 2012 R2** für den **DC-Schutz**, **Windows 8.1+** für den **Client-Schutz**.
- **Nur Benutzer** – **nie Computer/Dienstkonten**.
- **Protokolle** sind **standardmäßig aus**.

## Prüfungsfalle
- **Computerkonten und Dienstkonten** **nicht** aufnehmen – **Authentifizierung schlägt fehl**.
- **Zugriff per IP** funktioniert **nicht** (NTLM-Fallback ist blockiert).
- **TGT-Lebensdauer** **nur** über **Authentication Policy** änderbar, nicht in der Gruppe.
- Die **DC-Schutzmaßnahmen** greifen **nur** bei **DFL 2012 R2**; die **Client-Maßnahmen** **unabhängig** davon (Windows 8.1+).
- **Offline-Anmeldung** ist **nicht möglich** (kein Cache-Verifizierer).
- **Delegierung** ist gesperrt – **Webserver-Szenarien** prüfen.
- **Break-glass-Konten** **nicht ungetestet** aufnehmen.
- **Protected Users** ist **nicht** dasselbe wie **Credential Guard** (Gruppe = Kerberos-/NTLM-Regeln; Guard = **VBS-Isolation** von LSASS).

## Grafik
### VIP-Weste
Benutzer-Figur mit Warnweste „Protected Users“; Schilder „NTLM ✗“, „Delegierung ✗“, „Cache ✗“, Uhr „4 h“.

### Ticket läuft ab
Zeitstrahl: Anmeldung, TGT (4 h) läuft ab, Erneuerung wird abgelehnt (rotes Kreuz), neue Anmeldung nötig.

### IP versus Name
Zwei Türen: „\\\\10.0.0.10“ (NTLM, verschlossen) und „\\\\SRV01“ (Kerberos, offen).

## Karteikarten
- F: Was ist die Gruppe Protected Users? | A: Globale Sicherheitsgruppe mit festen Schutzmaßnahmen gegen Credential-Diebstahl.
- F: Welche Funktionsebene braucht der DC-Schutz? | A: Domänenfunktionsebene Windows Server 2012 R2.
- F: Wie lange gilt das TGT eines Mitglieds? | A: 4 Stunden, nicht erneuerbar.
- F: Welche Authentifizierung ist für Mitglieder gesperrt? | A: NTLM (nur Kerberos erlaubt).
- F: Welche Kerberos-Verschlüsselung ist gesperrt? | A: DES und RC4 (nur AES).
- F: Können Mitglieder delegiert werden? | A: Nein, weder uneingeschränkt noch eingeschränkt.
- F: Können Mitglieder offline anmelden? | A: Nein, kein Cache-Anmeldeverifizierer.
- F: Wer soll nicht Mitglied werden? | A: Computerkonten und Dienstkonten.
- F: Wie ändert man die TGT-Lebensdauer? | A: Über eine Authentication Policy (Silo).
- F: Wo findet man die Fehler-Ereignisse auf dem DC? | A: Authentication/ProtectedUserFailures-DomainController.
- F: Cmdlet zum Hinzufügen? | A: Add-ADGroupMember -Identity "Protected Users"

## Quiz
? Administratoren sollen vor Pass-the-Hash geschützt werden, ohne GPOs zu konfigurieren. Lösung?
* Konten in die Gruppe Protected Users aufnehmen
- Domänenrichtlinie Kontosperrung
- FGPP mit 15 Zeichen
- LAPS

? Ein Mitglied von Protected Users kann eine Freigabe per IP-Adresse nicht öffnen. Ursache?
* NTLM ist blockiert, Kerberos braucht einen Namen
- DNS-Cache defekt
- Firewall blockiert SMB
- TGT abgelaufen

? Wie lange ist das TGT von Protected Users gültig?
* 4 Stunden, nicht erneuerbar
- 10 Stunden, 7 Tage erneuerbar
- 24 Stunden
- 30 Minuten

? Ein Dienstkonto wurde in Protected Users aufgenommen, der Dienst startet nicht mehr. Warum?
* Dienstkonten können mit den festen Einschränkungen nicht authentifizieren
- Gruppe ist nur für Computer
- DFL ist zu hoch
- Kennwort abgelaufen

? Welche Funktionsebene ist für den DC-seitigen Schutz nötig?
* Windows Server 2012 R2
- Windows Server 2008
- Windows Server 2003
- Windows Server 2016

? Wie ändert man die TGT-Lebensdauer für bestimmte Benutzer?
* Authentication Policy
- Protected Users Eigenschaften
- Default Domain Policy
- FGPP

? Welche Authentifizierungsprotokolle sind für Mitglieder von Protected Users gesperrt?
* NTLM, Digest und CredSSP-Delegierung mit Klartextanmeldedaten; bei Kerberos keine DES/RC4
- Nur Kerberos
- Nur zertifikatbasierte Anmeldung
- Keine Einschränkungen
! Erzwungen wird AES-Kerberos.

? Für welche Konten ist Protected Users NICHT gedacht?
* Dienst- und Computerkonten
- Domänen-Admins
- Organisations-Admins
- Privilegierte Benutzer
! Dienste würden durch die Einschränkungen ausfallen.
