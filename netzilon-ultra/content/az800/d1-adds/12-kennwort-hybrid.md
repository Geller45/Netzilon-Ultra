---
id: az800-kennwort-hybrid
bereich: AZ-800
block: A7
kapitel: AD DS on-premises & Cloud
titel: Kennwortrichtlinien hybrid – FGPP, Entra Password Protection, SSPR
stufe: Profi
quellen: [AZ-800 Study Guide, Microsoft Learn]
verweise: [ap1-a6-kontorichtlinien, az800-hybrid-auth, az800-entra-connect, az801-kennwortrichtlinien]
---

## Profi

### Ebenen einer hybriden Kennwortstrategie
| Ebene | Werkzeug | Wirkt auf |
|---|---|---|
| AD DS Domäne | **Default Domain Policy** (Kennwort-/Sperrrichtlinie) | alle Domänenkonten |
| AD DS gezielt | **FGPP/PSO** | Benutzer/globale Gruppen |
| Lokale Konten | lokale Richtlinie / **Windows LAPS** | lokale Admin-Konten der Rechner |
| Entra ID (Cloud-Konten) | Entra-Kennwortrichtlinie (fest: 8–256 Zeichen, Komplexität), **Smart Lockout** | Cloud-only-Benutzer, Cloud-Anmeldungen |
| Verbotene Kennwörter | **Microsoft Entra Password Protection** (global + benutzerdefinierte Liste) | Cloud **und** on-prem (mit Agents) |
| Selbstbedienung | **SSPR** + **Kennwortrückschreiben** | Kennwort-Reset ohne Helpdesk |
Bei **synchronisierten** Benutzern gilt für die Kennwortänderung die **on-prem-Richtlinie** (Kennwort wird in AD geändert). Entra ID setzt bei gesyncten Benutzern standardmäßig **„Kennwort läuft nie ab“** in der Cloud – der Ablauf wird on-prem gesteuert (optional Feature `CloudPasswordPolicyForPasswordSyncedUsersEnabled`).

### Microsoft Entra Password Protection
Verhindert **schwache und bekannte Kennwörter** (z. B. „Sommer2026!“, Firmenname + Jahr):
- **Globale Liste** gesperrter Kennwörter (von Microsoft gepflegt, basierend auf realen Angriffsdaten) – immer aktiv.
- **Benutzerdefinierte Liste** (bis 1.000 Begriffe, z. B. Firmenname, Produkte, Stadt) – Entra ID **P1/P2**.
- **Bewertung**: Kennwort wird normalisiert (Kleinschreibung, „Leetspeak“ wie @→a, 0→o, $→s), Fuzzy-Matching; jeder gesperrte Begriff = 1 Punkt, sonstige Zeichen je 1 Punkt; **mindestens 5 Punkte** nötig.
- **On-prem-Erweiterung**:
  - **DC-Agent** auf **jedem** DC (Kennwortfilter-DLL) – prüft jede Kennwortänderung/-zurücksetzung gegen die Richtlinie.
  - **Proxy-Dienst** auf mindestens einem (besser zwei) **Mitgliedsservern** mit Internetzugang – lädt die Richtlinie aus Entra ID; DCs brauchen **keinen** direkten Internetzugang.
  - Modus **Überwachen** (Audit: nur protokollieren) → später **Erzwungen**.
  - Richtlinie wird in **SYSVOL** abgelegt und repliziert.
  - Wirkt **zusätzlich** zur AD-Komplexitätsrichtlinie; betrifft nur **neue** Kennwörter.
  - Ereignisse: Anwendungs- und Dienstprotokolle → Microsoft → AzureADPasswordProtection → DCAgent → Admin.

### Smart Lockout (Entra)
Sperrt Cloud-Anmeldeversuche nach **10 Fehlversuchen** (Standard; öffentliche Cloud) für **60 Sekunden**, steigend bei weiteren Versuchen; unterscheidet vertraute und unbekannte Orte. Bei **PTA/Federation**: Entra-Sperrschwelle **kleiner** als die AD-Sperrschwelle und Entra-Sperrdauer **länger** als der AD-Zurücksetzungszähler wählen – so sperren Angreifer aus dem Internet nicht die on-prem-Konten.

### SSPR und Kennwortrückschreiben
- **SSPR** (Self-Service Password Reset): Benutzer setzen ihr Kennwort nach Authentifizierung (App, SMS, E-Mail, Sicherheitsfragen) selbst zurück.
- **Kennwortrückschreiben** (Entra Connect/Cloud Sync, Entra ID P1): Der Reset wird in **AD DS** geschrieben – dabei gelten die **on-prem-Richtlinien** (Länge, Chronik, Password Protection).
- Berechtigungen des Connector-Kontos: „Kennwort zurücksetzen“, „Kennwort ändern“, Schreiben auf `lockoutTime`/`pwdLastSet` für die synchronisierten OUs.
- Windows-Anmeldebildschirm: Link „Kennwort zurücksetzen“ per Intune/Registry für Entra-/Hybrid-Geräte.

### Windows LAPS
Seit April 2023 **in Windows integriert** (Server 2019+/Windows 10/11): verwaltet das Kennwort des lokalen Administratorkontos jedes Rechners – **zufällig, eindeutig, rotierend**, gespeichert in **AD DS** (optional verschlüsselt, mit Kennwortverlauf) oder **Entra ID**. Auch für **DSRM-Konten** der DCs. Konfiguration per GPO/Intune („LAPS“-Richtlinien), Schema-Update `Update-LapsADSchema`, Rechte `Set-LapsADComputerSelfPermission`, Auslesen `Get-LapsADPassword`.

## Lab
**Maschinen**: DC01, DC02, PROXY01 (Mitgliedsserver mit Internet), CL01; Entra-Tenant mit P1.

### GUI
1. **Entra-Portal**: Schutz → **Authentifizierungsmethoden** → **Kennwortschutz** → Benutzerdefinierte Liste: `contoso`, `gelsenkirchen`, `schalke` … → **Kennwortschutz für Windows Server Active Directory aktivieren: Ja** → Modus **Überwachen** → Speichern. Smart Lockout: Schwelle 5, Dauer 120 s.
2. **PROXY01**: Proxy-Installationspaket (`AzureADPasswordProtectionProxySetup.exe`) installieren → per PowerShell registrieren (siehe unten).
3. **DC01 + DC02**: DC-Agent (`AzureADPasswordProtectionDCAgentSetup.msi`) installieren → **Neustart** jedes DCs.
4. **CL01**: Benutzer ändert Kennwort auf `Contoso2026!` → im Überwachungsmodus erlaubt, aber **DC-Ereignis** „würde abgelehnt“.
5. **Entra-Portal**: Modus **Erzwungen** → erneuter Versuch → Kennwortänderung wird abgelehnt.
6. **Entra-Portal**: Kennwortzurücksetzung → Eigenschaften: SSPR für Gruppe „SSPR-Pilot“ → Lokale Integration: **Kennwörter in lokales Verzeichnis zurückschreiben: Ja** (vorher in Entra Connect aktiviert).
7. **DC01**: GPO „LAPS“ → Computerkonfiguration → Administrative Vorlagen → System → **LAPS** → „Kennwortsicherungsverzeichnis konfigurieren: Active Directory“, „Kennworteinstellungen“ (Länge 20, 30 Tage) → an OU Computer.

### PowerShell
```powershell
# Auf PROXY01 – Proxy registrieren
Import-Module AzureADPasswordProtection
Register-AzureADPasswordProtectionProxy -AccountUpn admin@firma.onmicrosoft.com
Register-AzureADPasswordProtectionForest -AccountUpn admin@firma.onmicrosoft.com
Get-AzureADPasswordProtectionProxy
Get-AzureADPasswordProtectionDCAgent

# Auf DC01 – Ereignisse des DC-Agents
Get-WinEvent -LogName "Microsoft-AzureADPasswordProtection-DCAgent/Admin" -MaxEvents 10

# Windows LAPS (DC01)
Update-LapsADSchema
Set-LapsADComputerSelfPermission -Identity "OU=Computer,OU=Schulung,DC=contoso,DC=local"
Get-LapsADPassword -Identity CL01 -AsPlainText
Reset-LapsPassword                                   # auf dem Client: sofort neues Kennwort

# FGPP-Kontrolle
Get-ADUserResultantPasswordPolicy -Identity a.meier
```

## Einfach

In einer hybriden Firma gibt es **mehrere Türsteher für Passwörter**:
- Im **Büro** (Active Directory) die bekannten Regeln: Länge, Komplexität, Sperre nach Fehlversuchen.
- In der **Cloud** (Entra ID) einen eigenen Türsteher, der **Smart Lockout** kennt: Er sperrt Angreifer aus dem Internet aus, **ohne** dass der echte Mitarbeiter im Büro gesperrt wird.

**Entra Password Protection** ist eine **schwarze Liste dummer Passwörter**: „Passwort123“, „Sommer2026!“ oder der **Firmenname** sind verboten – auch in Varianten wie „C0nt0s0!“. Microsoft pflegt eine riesige Liste aus echten Hackerangriffen, und du kannst eigene Wörter ergänzen (Firmenname, Stadt, Fußballverein 😉).
Damit das auch **im Büro** gilt, installiert man:
- auf **jedem DC** einen kleinen **Prüf-Agenten**,
- auf einem Server mit Internet einen **Boten (Proxy)**, der die aktuelle schwarze Liste aus der Cloud holt. Die DCs selbst brauchen dafür kein Internet.
Erst **beobachten** (Audit), dann **scharf schalten**.

**SSPR** = „Passwort vergessen? Mach's selbst!“ – per App oder SMS. Mit **Rückschreiben** landet das neue Passwort auch im Büro-AD.

**LAPS** = Jeder Computer bekommt für sein **lokales Admin-Konto ein eigenes, zufälliges Passwort**, das sich regelmäßig ändert und im AD sicher hinterlegt ist. Früher hatten oft alle PCs dasselbe Admin-Passwort – ein Albtraum, wenn es einer kannte.

## Merksatz
- Gesyncte Benutzer: **on-prem-Richtlinie gilt** für Kennwortänderungen.
- Password Protection on-prem: **DC-Agent auf jedem DC** + **Proxy auf Mitgliedsserver**; DCs **ohne** Internet.
- **Audit → Erzwingen**; mindestens **5 Punkte**.
- Smart Lockout: Entra-Schwelle **< AD-Schwelle**.
- **Windows LAPS** = eindeutige lokale Admin-Kennwörter, in AD/Entra gespeichert.

## Prüfungsfalle
- Proxy-Dienst **nicht** auf einem DC installieren (empfohlen: Mitgliedsserver).
- DC-Agent-Installation erfordert **Neustart** jedes DCs.
- Benutzerdefinierte gesperrte Kennwörter benötigen Entra ID P1/P2.
- Password Protection betrifft nur **neue** Kennwörter.
- Kennwortrückschreiben muss in Entra Connect **und** im SSPR-Portal aktiviert sein.

## Grafik
### Schwarze Liste
Kennwort-Eingabe „C0nt0s0-2026!“ wird normalisiert („contoso-2026!“), Treffer „contoso“ rot markiert, Punktzähler zeigt 4 < 5 → abgelehnt; „MeinKaterHuntLiebtThunfisch“ → grün.

### Architektur on-prem
Entra ID-Wolke → Proxy-Server (Internet) → SYSVOL → DC-Agents auf allen DCs; Benutzer ändert Kennwort am Client → Prüfung am DC.

### Smart Lockout vs. AD-Sperre
Angreifer aus dem Internet prallt an der Cloud-Sperre ab (Schwelle 5), das AD-Konto (Schwelle 10) bleibt offen für den echten Benutzer im Büro.

## Karteikarten
- F: Welche Richtlinie gilt für Kennwortänderungen synchronisierter Benutzer? | A: Die on-prem-AD-Richtlinie (bzw. FGPP).
- F: Was ist Microsoft Entra Password Protection? | A: Sperrt schwache/bekannte Kennwörter (globale + benutzerdefinierte Liste) in der Cloud und on-prem.
- F: Welche Komponenten braucht Password Protection on-prem? | A: DC-Agent auf jedem DC, Proxy-Dienst auf Mitgliedsserver(n) mit Internet.
- F: Brauchen DCs für Password Protection Internetzugang? | A: Nein – der Proxy lädt die Richtlinie.
- F: Welche Mindestpunktzahl muss ein Kennwort erreichen? | A: 5 Punkte.
- F: Was ist Smart Lockout? | A: Entra-Sperrmechanismus nach Fehlversuchen, der vertraute von unbekannten Orten unterscheidet.
- F: Wie stimmt man Smart Lockout mit AD ab (PTA)? | A: Entra-Sperrschwelle niedriger als AD-Schwelle, Entra-Sperrdauer länger als AD-Zurücksetzungsdauer.
- F: Was ist Kennwortrückschreiben? | A: SSPR-Resets in Entra werden in AD DS geschrieben.
- F: Was ist Windows LAPS? | A: Integrierte Verwaltung eindeutiger, rotierender lokaler Admin-Kennwörter mit Speicherung in AD/Entra.

## Quiz
? Wo wird der Proxy-Dienst von Entra Password Protection installiert?
* Auf einem Mitgliedsserver mit Internetzugang
- Auf jedem Client
- Nur auf dem PDC-Emulator
- In Azure als VM zwingend

? Was ist nach der Installation des DC-Agents auf einem DC nötig?
* Ein Neustart des DCs
- Ein neues Schema
- Ein Forest-Trust
- Nichts

? Ein Benutzer mit Kennworthash-Synchronisierung ändert sein Kennwort im Büro. Welche Richtlinie gilt?
* Die AD-DS-Kennwortrichtlinie (inkl. FGPP und Password Protection, falls installiert)
- Nur die Entra-Kennwortrichtlinie
- Keine Richtlinie
- Die Richtlinie des globalen Katalogs

? Welche Lizenz ist für eine benutzerdefinierte Liste gesperrter Kennwörter nötig?
* Microsoft Entra ID P1 oder P2
- Keine, Free reicht
- Windows Server Datacenter
- Microsoft 365 Apps

? Wozu dient Windows LAPS?
* Eindeutige, automatisch rotierende Kennwörter für lokale Administratorkonten
- Synchronisation von Benutzern in die Cloud
- Verschlüsselung von Festplatten
- Verwaltung von Druckern

? Was verhindert Entra Password Protection on-premises?
* Die Verwendung schwacher oder gesperrter Kennwörter bei Kennwortänderungen an DCs
- Die Anmeldung von Gästen
- Die Replikation zwischen DCs
- Das Zurücksetzen von Kennwörtern
! Basis ist die globale und die benutzerdefinierte Sperrliste.

? Welche Funktion ermöglicht Benutzern, ihr Kennwort selbst zurückzusetzen und on-prem zurückzuschreiben?
* SSPR mit Kennwortrückschreiben (Password Writeback)
- FGPP
- LAPS
- gMSA
! Das Rückschreiben erfolgt über Entra Connect bzw. Cloud Sync.

? Wo werden lokale Administratorkennwörter mit Windows LAPS gespeichert?
* Im Active Directory oder in Entra ID
- Auf einem USB-Stick
- In einer Textdatei im Profil
- In der hosts-Datei
! Jeder Computer erhält ein eigenes, regelmäßig gewechseltes Kennwort.
