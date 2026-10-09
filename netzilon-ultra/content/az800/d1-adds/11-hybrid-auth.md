---
id: az800-hybrid-auth
bereich: AZ-800
block: A7
kapitel: AD DS on-premises & Cloud
titel: Hybride Authentifizierung – PHS, PTA, Federation, Seamless SSO
stufe: Profi
quellen: [AZ-800 Study Guide, Microsoft Learn, 70-742 (AD FS)]
verweise: [az800-entra-connect, az800-kennwort-hybrid, az800-webanwendungsproxy, az801-hybrid-auth-troubleshooting]
---

## Profi

### Die Frage: Wo wird das Kennwort geprüft?
Bei synchronisierten Benutzern muss Entra ID bei einer Cloud-Anmeldung (Microsoft 365, Azure-Portal) wissen, ob das Kennwort stimmt. Drei Methoden:

| | **Kennworthash-Synchronisierung (PHS)** | **Passthrough-Authentifizierung (PTA)** | **Verbund (Federation, AD FS)** |
|---|---|---|---|
| Prüfung | **in der Cloud** gegen einen Hash des Hashes | **on-prem** am DC, über PTA-Agents | **on-prem** durch AD FS |
| On-prem-Komponenten | nur Entra Connect | Entra Connect + **PTA-Agents** (mind. 3 empfohlen) | **AD FS-Farm** + **Webanwendungsproxy** (DMZ) + Zertifikate + Load Balancer |
| Funktioniert bei on-prem-Ausfall | **ja** | nein (Fallback auf PHS möglich, wenn aktiviert) | nein |
| Kontosperrung/Anmeldezeiten on-prem sofort wirksam | nein (Sync-Verzögerung; deaktivierte Konten nach Sync) | **ja** | **ja** |
| Smartcard/Dritt-MFA on-prem | nein | nein | **ja** |
| Aufwand | **gering** | mittel | **hoch** |
| **Leaked Credential Detection** (Entra ID Protection) | **ja** | nur mit zusätzlich aktiviertem PHS | nur mit zusätzlich aktiviertem PHS |
| Empfehlung Microsoft | **Standard/Primär**, mindestens als Backup aktivieren | wenn Kennwörter die Firma nicht verlassen dürfen | nur bei Anforderungen, die sonst nicht erfüllbar sind |

**PHS im Detail**: Entra Connect liest den **NT-Hash** aus AD (über das Recht „Verzeichnisänderungen replizieren“), bildet mit Salt und **1.000 Iterationen PBKDF2 (SHA-256)** einen neuen Hash und überträgt nur diesen – das **Klartextkennwort verlässt nie** das Netzwerk, der Original-Hash auch nicht. Synchronisation **alle 2 Minuten** (unabhängig vom 30-Min.-Zyklus).

**PTA im Detail**: Der Benutzer gibt sein Kennwort bei Entra ein → Entra verschlüsselt es mit dem öffentlichen Schlüssel der Agents und stellt es in eine Warteschlange → ein **PTA-Agent** (ausgehende Verbindung Port 443, **keine eingehenden Ports** nötig) holt die Anfrage, prüft per Win32-API gegen einen DC und meldet das Ergebnis. Mehrere Agents = Lastverteilung/HA.

**Federation im Detail**: Entra ID leitet die Anmeldung an den **AD FS-Server** der Firma weiter (per Webanwendungsproxy aus dem Internet erreichbar); AD FS authentifiziert gegen AD und stellt ein **Token** (SAML/WS-Fed) aus. Vorteile: volle Kontrolle, Smartcard, eigene Anmeldeseite, Claim-Regeln. Nachteile: komplexe Hochverfügbarkeit, Zertifikatspflege, Angriffsfläche. Trend: **Migration von AD FS zu PHS/PTA** + **Staged Rollout** zum schrittweisen Umstellen.

### Nahtloses einmaliges Anmelden (Seamless SSO)
Für **PHS und PTA**: Domänenbeigetretene Geräte im Firmennetz werden **automatisch per Kerberos** bei Entra ID angemeldet – Entra Connect legt dafür ein Computerkonto **AZUREADSSOACC** in AD an (dessen Kerberos-Schlüssel regelmäßig **erneuern**, ca. alle 30 Tage). Die URL `https://autologon.microsoftazuread-sso.com` muss in der **Intranetzone** des Browsers stehen (per GPO). Für moderne Geräte ist **Primary Refresh Token (PRT)** mit Entra-/Hybrid-Join die bevorzugte SSO-Methode.

### Weitere Bausteine
- **Microsoft Entra-Kerberos**: Entra ID stellt Kerberos-Tickets aus – für **Azure Files**-Zugriff mit Entra-Identitäten und **Windows Hello for Business Cloud Kerberos Trust**.
- **Bedingter Zugriff** (Conditional Access, P1) und **MFA** wirken bei allen drei Methoden auf Entra-Seite.
- **Smart Lockout** (Entra) schützt Cloud-Anmeldungen; bei PTA auf die on-prem-Sperrschwelle abstimmen (Entra-Schwelle **niedriger** als AD-Schwelle, damit Angreifer nicht on-prem-Konten sperren).

### Auswahlentscheidung (Prüfungslogik)
1. Einfachste, robusteste Lösung + Schutz vor geleakten Kennwörtern → **PHS**.
2. Kennwort(-hashes) dürfen **nicht** in die Cloud, on-prem-Sperren/Anmeldezeiten sofort → **PTA**.
3. **Smartcard/Zertifikat**, Dritt-MFA on-prem, **Anmeldung nur über eigenes System**, komplexe Claims → **Federation**.
4. Immer: **PHS zusätzlich aktivieren** (Fallback, Leaked Credentials).

## Lab
**Maschinen**: SYNC01 (Entra Connect), SRV-PTA1/SRV-PTA2 (Mitgliedsserver), DC01, CL01 (domänenbeigetreten).

### GUI
1. **SYNC01**: Microsoft Entra Connect → **Konfigurieren** → **Benutzeranmeldung ändern** → **Passthrough-Authentifizierung** wählen, Haken **Einmaliges Anmelden aktivieren** → Anmeldedaten Domänen-Admin (für AZUREADSSOACC) → Konfigurieren.
2. Entra Connect installiert den ersten PTA-Agent auf SYNC01. **SRV-PTA1/2**: Entra-Portal → Hybridverwaltung → Microsoft Entra Connect → **Passthrough-Authentifizierung** → **Herunterladen** → Agent installieren → mit Entra-Admin registrieren.
3. **Entra-Portal**: Hybridverwaltung → Connect → Status: PTA **Aktiviert**, 3 Agents **Aktiv**; Seamless SSO **Aktiviert**.
4. **DC01**: GPO an OU Computer → Benutzerkonfiguration → Administrative Vorlagen → Windows-Komponenten → Internet Explorer → Internetsystemsteuerung → Sicherheitsseite → **Liste der Site-zu-Zonenzuweisungen**: `https://autologon.microsoftazuread-sso.com` = **1** (Intranet); zusätzlich „Aktualisierungen der Statusleiste per Skript zulassen“ aktivieren.
5. **CL01**: als Pilotbenutzer anmelden → `https://myapps.microsoft.com` → Anmeldung ohne Kennwortabfrage (nur UPN bzw. gar nichts).
6. **Rückweg zu PHS**: Connect → Benutzeranmeldung ändern → Kennworthashsynchronisierung (und Haken „Kennworthash-Synchronisierung“ auch bei PTA gesetzt lassen).

### PowerShell
```powershell
# Auf SYNC01 – Kennworthash-Sync-Status und Seamless SSO
Import-Module ADSync
Get-ADSyncAADPasswordSyncConfiguration -SourceConnector "contoso.local"
Import-Module "C:\Program Files\Microsoft Azure Active Directory Connect\AzureADSSO.psd1"
New-AzureADSSOAuthenticationContext                    # Anmeldung als Hybrid Identity Admin
Get-AzureADSSOStatus | ConvertFrom-Json
# Kerberos-Schlüssel von AZUREADSSOACC erneuern (regelmäßig)
Update-AzureADSSOForest -OnPremCredentials (Get-Credential CONTOSO\Administrator)

# Auf CL01 – SSO-/PRT-Status
dsregcmd /status | Select-String "AzureAdPrt|DomainJoined|AzureAdJoined"
klist | Select-String "autologon"
```
(Hinweis: Modul- und Cmdlet-Namen stammen teils noch aus der „Azure AD“-Zeit und können sich ändern.)

## Einfach

Mitarbeiter sollen sich mit **demselben Passwort** im Büro und bei Online-Diensten (Teams, Outlook) anmelden. Aber **wer prüft** das Passwort, wenn sich jemand online anmeldet? Drei Möglichkeiten:

1. **PHS – „Die Cloud hat einen Fingerabdruck“**: Die Firma schickt der Cloud nicht das Passwort, sondern einen **mehrfach verschlüsselten Fingerabdruck** davon. Die Cloud vergleicht selbst. **Einfach und robust** – funktioniert sogar, wenn das Firmengebäude keinen Strom hat. Bonus: Die Cloud warnt, wenn dein Passwort irgendwo im Internet geleakt wurde.

2. **PTA – „Die Cloud ruft kurz im Büro an“**: Die Cloud fragt über ein kleines Programm im Büro (PTA-Agent): „Stimmt das Passwort?“ Das Büro-Amt prüft und antwortet. Das Passwort bleibt im Haus. Ist aber das Büro offline, klappt die Anmeldung nicht (außer PHS ist als Reserve an).

3. **Federation (AD FS) – „Die Firma stellt eigene Ausweise aus“**: Online-Dienste schicken dich zur **Anmeldeseite der Firma**. Die Firma prüft (auch mit Chipkarte) und gibt dir einen Ausweis (Token) mit. Maximal flexibel, aber aufwendig (eigene Server, Zertifikate, Proxy im Internet).

**Seamless SSO** ist der **Komfort-Trick**: Bist du im Büro am Firmen-PC angemeldet, kommst du automatisch in die Online-Dienste – ohne nochmal Passwort einzutippen.

**Microsofts Rat**: Nimm **PHS** – und selbst wenn du PTA oder AD FS nutzt, schalte PHS **zusätzlich** als Sicherheitsnetz ein.

## Merksatz
- **PHS** = Prüfung in der Cloud, einfach, ausfallsicher, Leaked-Credential-Schutz – **Standard**.
- **PTA** = Prüfung on-prem über **Agents** (ausgehend 443, mind. 3).
- **Federation** = AD FS + WAP, Smartcard/Claims, hoher Aufwand.
- **Seamless SSO** = Kerberos über **AZUREADSSOACC**, Autologon-URL in Intranetzone.
- **PHS immer zusätzlich** aktivieren.

## Prüfungsfalle
- Bei PHS wird **nicht** der AD-Hash, sondern ein neu gehashter Hash übertragen.
- PTA braucht **keine eingehenden** Firewallports.
- PTA/Federation fallen bei on-prem-Ausfall aus (ohne PHS-Fallback).
- Smartcard-Anmeldung on-prem → Federation.
- Seamless SSO benötigt die Autologon-URL in der Intranetzone.

## Grafik
### Drei Wege der Kennwortprüfung
Benutzer tippt Kennwort in der Cloud-Anmeldeseite. PHS: Prüfung direkt in der Wolke (grüner Haken). PTA: Anfrage fällt in eine Warteschlange, ein Agent im Büro holt sie ab, fragt den DC. Federation: Benutzer wird zur Firmen-Anmeldeseite (AD FS hinter WAP) umgeleitet und kommt mit Token zurück. Knopf „Büro offline“: nur PHS bleibt grün.

### Hash des Hashes
Kennwort → NT-Hash (bleibt im AD) → Salt + 1000× PBKDF2 → neuer Hash fliegt in die Cloud.

### Seamless SSO
Firmen-PC mit Kerberos-Ticket für AZUREADSSOACC; Browser öffnet myapps und ist sofort angemeldet.

## Karteikarten
- F: Wo wird bei PHS das Kennwort geprüft? | A: In Entra ID gegen einen synchronisierten Hash des Hashes.
- F: Wo wird bei PTA das Kennwort geprüft? | A: On-prem am DC über PTA-Agents.
- F: Welche Ports braucht ein PTA-Agent eingehend? | A: Keine – nur ausgehend (443).
- F: Wann ist Federation nötig? | A: Z. B. Smartcard-/Zertifikatsanmeldung, Dritt-MFA on-prem, komplexe Claims, eigene Anmeldeseite zwingend.
- F: Welche Methode funktioniert bei Ausfall des Rechenzentrums? | A: PHS.
- F: Welche Methode bietet Leaked Credential Detection? | A: PHS (auch zusätzlich zu PTA/Federation aktivierbar).
- F: Wie oft werden Kennworthashes synchronisiert? | A: Etwa alle 2 Minuten.
- F: Welches Konto nutzt Seamless SSO in AD? | A: Computerkonto AZUREADSSOACC.
- F: Wie viele PTA-Agents empfiehlt Microsoft? | A: Mindestens drei für Hochverfügbarkeit.
- F: Welche Komponenten braucht Federation mit AD FS? | A: AD-FS-Farm, Webanwendungsproxy in der DMZ, Zertifikate, Load Balancer.

## Quiz
? Ein Unternehmen will die einfachste Lösung, die auch bei einem Ausfall des lokalen Rechenzentrums Cloud-Anmeldungen erlaubt. Welche Methode?
* Kennworthash-Synchronisierung
- Passthrough-Authentifizierung
- Federation mit AD FS
- Seamless SSO allein

? Sicherheitsrichtlinie: Kennwörter oder Hashes dürfen das Unternehmen nicht verlassen, on-prem-Kontosperrungen sollen sofort gelten. Welche Methode?
* Passthrough-Authentifizierung
- Kennworthash-Synchronisierung
- Cloud-only-Konten
- Entra Domain Services

? Benutzer sollen sich mit Smartcards bei Microsoft 365 anmelden, die on-prem geprüft werden. Welche Methode?
* Federation (AD FS)
- PHS
- PTA
- Cloud Sync

? Welche Firewallregel benötigt ein PTA-Agent?
* Nur ausgehend HTTPS (443) ins Internet
- Eingehend 443 aus dem Internet
- Eingehend 88 aus dem Internet
- Eingehend 3389

? Was bewirkt Seamless SSO?
* Domänenbeigetretene Geräte im Firmennetz melden Benutzer automatisch per Kerberos bei Entra ID an
- Kennwörter werden im Klartext synchronisiert
- AD FS wird automatisch installiert
- Benutzer brauchen kein Kennwort mehr für Windows

? Welches Verfahren synchronisiert einen Hash des Kennworthashs in die Cloud?
* Kennworthashsynchronisierung (PHS)
- Passthrough-Authentifizierung (PTA)
- Verbund mit AD FS
- Seamless SSO
! Die Anmeldung erfolgt dann vollständig in Entra ID.

? Wie erhöht man die Verfügbarkeit von PTA?
* Mehrere PTA-Agents auf verschiedenen Servern installieren
- Den Agent auf einem DC deaktivieren
- Nur einen Agent betreiben
- PHS deaktivieren
! Empfohlen: mindestens drei Agents; PHS als Fallback möglich.

? Welche zusätzliche Sicherheitsfunktion ermöglicht PHS?
* Erkennung kompromittierter Anmeldedaten (Leaked Credentials) in Entra ID Protection
- Smartcard-Anmeldung on-prem
- Offline-Anmeldung an DCs
- Verschlüsselung von SMB
! Microsoft vergleicht Hashes mit bekannten Datenlecks.
