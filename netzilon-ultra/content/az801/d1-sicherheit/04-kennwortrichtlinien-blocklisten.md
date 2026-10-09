---
id: az801-kennwortrichtlinien
bereich: AZ-801
block: A9
kapitel: Sicherheit
titel: Kennwortrichtlinien, FGPP und Password Block Lists (Entra Password Protection)
stufe: Fortgeschritten
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az800-kennwort-hybrid, az801-protected-users, az801-baselines, ap1-a6-kontorichtlinien]
---

## Profi

### Kennwortrichtlinien in Active Directory
| Ebene | Beschreibung |
|---|---|
| **Domänenrichtlinie** (*Default Domain Policy*) | **Eine** Richtlinie für **alle Domänenbenutzer**: **Kennwortverlauf**, **Max./Min. Alter**, **Länge**, **Komplexität**, **Kontosperrung** (**nur auf Domänenebene wirksam**, nicht per OU) |
| **Abgestufte Kennwortrichtlinie** (*Fine-Grained Password Policy*, **FGPP**) | **Zusätzliche Richtlinien** für **einzelne Benutzer/Gruppen** (**PSO** = *Password Settings Object*) |

**Standardwerte der Domänenrichtlinie**: Kennwortverlauf **24**, max. Alter **42 Tage**, min. Alter **1 Tag**, min. Länge **7**, Komplexität **aktiviert**, Kontosperrung **0** (aus).

### Abgestufte Kennwortrichtlinie (FGPP)
| Merkmal | Details |
|---|---|
| **Voraussetzung** | **Domänenfunktionsebene ≥ Windows Server 2008**; Verwaltung nur mit **Domänenadmin** |
| **Speicherort** | **Container** `CN=Password Settings Container,CN=System,DC=…`; **PSO-Objekte** |
| **Gilt für** | **Benutzer** und **globale Sicherheitsgruppen** (**nicht** für **OUs**!) – **Computerkonten** nicht; Sonderfall: **inetOrgPerson** |
| **Priorität** (*Precedence*) | **Kleinere Zahl gewinnt**; **direkt** auf den **Benutzer** zugewiesene PSOs **vor** Gruppen-PSOs |
| **Eigenschaften** | Länge, Komplexität, Verlauf, Alter, **Kontosperrung** (Schwelle/Dauer/Beobachtungsfenster), **Umkehrbare Verschlüsselung** |
| **Auflösung** | `Get-ADUserResultantPasswordPolicy -Identity <Benutzer>` zeigt die **wirksame** Richtlinie |
| **Typische Anwendung** | **Administratoren/Dienstkonten**: **strengere** Richtlinie (z. B. **15 Zeichen**, Sperre nach **3** Versuchen); **Standardbenutzer**: Domänenrichtlinie |

Werkzeuge: **Active Directory-Verwaltungscenter** (*ADAC*) → **System → Password Settings Container**, PowerShell (`New-ADFineGrainedPasswordPolicy`, `Add-ADFineGrainedPasswordPolicySubject`).

### Microsoft Entra Password Protection (on-premises)
Erweitert die **AD-Kennwortprüfung** um **Cloud-Wissen**: Verhindert **schwache/gehackte Kennwörter** direkt **beim Ändern/Setzen** im **lokalen AD**.
| Baustein | Funktion |
|---|---|
| **Globale Sperrliste** (*Global Banned Password List*) | Von Microsoft gepflegt (**häufige, geleakte** Kennwörter), automatisch |
| **Benutzerdefinierte Sperrliste** (*Custom Banned Password List*) | Eigene Begriffe (Firmenname, Produkte, Standort) – **bis 1000 Begriffe**, **4–16 Zeichen** je Begriff; **Entra ID P1/P2** erforderlich |
| **DC-Agent** (*Microsoft Entra Password Protection DC Agent*) | Läuft auf **jedem DC** der Domäne, lädt die **Richtlinie** vom **Proxy**, prüft **Kennwortänderungen** |
| **Proxy-Dienst** (*Password Protection Proxy*) | Auf einem **Mitgliedsserver** (**nicht auf dem DC**), **holt** Richtlinie aus **Entra ID** (**HTTPS 443 ausgehend**) |
| **Modus** | **Überwachen** (*Audit*, nur protokollieren) oder **Erzwingen** (*Enforced*, ablehnen) |
| **Wirkung** | Prüft **Normalisierung** (z. B. `P@ssw0rd` → `password`) und **Punktesystem** (Gesamtwertung ≥ **5** nötig); ergänzt die **AD-Komplexität** |

**Bereitstellung**:
1. **Entra-Admincenter** → **Schutz → Authentifizierungsmethoden → Kennwortschutz**: **Benutzerdefinierte Liste** pflegen, **Modus** wählen, **lokales AD** aktivieren.
2. **Proxy** auf **Mitgliedsserver** installieren (`AzureADPasswordProtectionProxySetup.exe`) → `Register-AzureADPasswordProtectionProxy`.
3. **Gesamtstruktur registrieren**: `Register-AzureADPasswordProtectionForest`.
4. **DC-Agent** auf **allen DCs** installieren (**Neustart**).
5. **Mindestens einen Proxy** pro **Gesamtstruktur** (besser 2 für Ausfallsicherheit).
- **DC-Agent** braucht **SYSVOL-Replikation per DFSR** (nicht FRS).
- **Ereignisprotokoll** `Microsoft-AzureADPasswordProtection-DCAgent/Admin` (Audit-Ereignisse im Überwachen-Modus, Ablehnungen im Erzwingen-Modus).

### Abgrenzung
| Technik | Zweck |
|---|---|
| **Domänenrichtlinie** | **Grundregeln** (Länge/Komplexität) |
| **FGPP** | **Ausnahmen** für Gruppen |
| **Entra Password Protection** | **Sperrlisten** gegen **schwache/geleakte** Kennwörter |
| **Intelligente Sperrung** (*Smart Lockout*) | Schutz vor **Brute-Force** in **Entra ID** (**cloudseitig**) |
| **Protected Users** | Schutz der **Authentifizierungsverfahren** (Seite 05) |

## Lab
**Maschinen**: **DC01**, **DC02** (Domäne example.com), **SRV01** (Mitgliedsserver für Proxy), **ADMIN-PC** (Entra-Admincenter), **Entra-Tenant** mit **P1**-Lizenz.

### GUI
1. **DC01**: **Active Directory-Verwaltungscenter** (`dsac.exe`) → **example (lokal) → System → Password Settings Container** → **Neu → Kennworteinstellungen**.
2. **DC01**: Name `PSO-Admins`, **Rangfolge 10**, **Minimale Kennwortlänge 15**, **Kennwortverlauf 24**, **Komplexität erzwingen**, **Kontosperrung: 3 Versuche, 30 Min.** → **Direkt anwendbar auf**: Gruppe **Domänen-Admins** → OK.
3. **DC01**: Benutzer `admin-anna` → Eigenschaften → **Erweitert → Kennworteinstellungen (Resultant PSO)** anzeigen: **PSO-Admins** wirksam.
4. **ADMIN-PC**: **Entra-Admincenter** → **Schutz → Authentifizierungsmethoden → Kennwortschutz** → **Benutzerdefinierte Sperrlisten erzwingen: Ja** → Begriffe `Example`, `Bochum`, `Sommer` eintragen → **Kennwortschutz für Windows Server Active Directory aktivieren: Ja** → **Modus: Überwachen** → Speichern.
5. **SRV01**: `AzureADPasswordProtectionProxySetup.exe` installieren → PowerShell (siehe unten) → **Proxy** und **Gesamtstruktur** registrieren.
6. **DC01** und **DC02**: `AzureADPasswordProtectionDCAgentSetup.msi` installieren → **Neustart**.
7. **DC01**: Testbenutzer Kennwort auf `Example2026!` setzen → **Überwachen**: erlaubt, aber **Audit-Ereignis** im DC-Agent-Protokoll.
8. **ADMIN-PC**: Modus auf **Erzwingen** stellen → nach Richtlinien-Refresh (~1 h) **Kennwort setzen** schlägt fehl.

### PowerShell
```powershell
# Auf DC01 – FGPP anlegen und zuweisen
New-ADFineGrainedPasswordPolicy -Name "PSO-Admins" -Precedence 10 -MinPasswordLength 15 `
  -ComplexityEnabled $true -PasswordHistoryCount 24 -MaxPasswordAge "60.00:00:00" -MinPasswordAge "1.00:00:00" `
  -LockoutThreshold 3 -LockoutDuration "00:30:00" -LockoutObservationWindow "00:30:00" -ReversibleEncryptionEnabled $false
Add-ADFineGrainedPasswordPolicySubject -Identity "PSO-Admins" -Subjects "Domain Admins"
Get-ADFineGrainedPasswordPolicy -Filter *
Get-ADUserResultantPasswordPolicy -Identity admin-anna
Get-ADDefaultDomainPasswordPolicy

# Auf SRV01 – Entra Password Protection Proxy
Import-Module AzureADPasswordProtection
Register-AzureADPasswordProtectionProxy -AccountUpn "admin@contoso.onmicrosoft.com"
Register-AzureADPasswordProtectionForest -AccountUpn "admin@contoso.onmicrosoft.com"
Get-AzureADPasswordProtectionProxy
Get-Service AzureADPasswordProtectionProxy

# Auf DC01/DC02 – DC-Agent prüfen
Get-Service AzureADPasswordProtectionDCAgent
Get-AzureADPasswordProtectionSummaryReport
Get-WinEvent -LogName "Microsoft-AzureADPasswordProtection-DCAgent/Admin" -MaxEvents 10
```

## Einfach

**Domänen-Kennwortrichtlinie** = die **Hausordnung**: Für **alle** gilt: mindestens so lang, Sonderzeichen, alle 42 Tage neu.

**Abgestufte Richtlinie (FGPP)** = eine **Sonderregel für bestimmte Gruppen**. Zum Beispiel: **Admins** brauchen **strengere Kennwörter** als der Rest. Du hängst die Sonderregel **direkt an eine Gruppe oder einen Benutzer** (**nicht** an einen Ordner/OU!). Gibt es mehrere Regeln, **gewinnt die kleinere Zahl** (Rangfolge).

**Entra Password Protection** = ein **Türsteher gegen dumme Kennwörter**. Selbst wenn ein Kennwort die **Komplexität** erfüllt (`Sommer2026!`), sagt der Türsteher: „**Falsch** – das steht auf der **Liste der bekanntesten Passwörter** und enthält **dein Firmenwort**.“ Er nutzt zwei Listen:
- **Globale Liste** = **Microsoft** pflegt sie (geleakte, häufige Passwörter).
- **Eigene Liste** = **du** schreibst deine **Firma/Ort/Produkt** rein.

**Wie funktioniert das im Haus?** Auf **jedem Domänencontroller** sitzt ein **Kleiner Prüfer** (**DC-Agent**). Er bekommt die Listen von einem **Boten** (**Proxy** auf einem normalen Server), der sie aus **Entra** holt. **Erst beobachten** (**Audit**), dann **erzwingen**.

## Merksatz
- **Domänenrichtlinie** = **alle**; **FGPP** = **Ausnahmen für Benutzer/Gruppen** (**nicht OUs**).
- **FGPP**: **Precedence kleiner = gewinnt**; **direkt** vor **Gruppe**.
- **DFL ≥ 2008** für FGPP.
- **Password Protection**: **DC-Agent** auf **allen DCs**, **Proxy** auf **Mitgliedsserver**.
- **Zwei Listen**: **global** (Microsoft) + **benutzerdefiniert** (**P1**).
- **Erst Überwachen, dann Erzwingen**.

## Prüfungsfalle
- FGPP kann **nicht** an eine **OU** gebunden werden – nur **Benutzer** und **globale Sicherheitsgruppen** (Trick: **Schattengruppe** mit OU-Mitgliedern).
- **Proxy-Dienst nie auf dem DC** installieren.
- **Custom Banned List** erfordert **Entra ID P1**, die **globale Liste** nicht.
- **DC-Agent** muss auf **allen** DCs laufen – sonst **Umgehung** über den nicht geschützten DC.
- **Erzwingen** wirkt erst nach **Richtlinien-Refresh** (bis ca. **1 Stunde**).
- **Kennwortschutz** **gilt nur** bei **Änderung/Setzen**, **nicht** rückwirkend für bestehende Kennwörter.
- **DFSR-SYSVOL** ist Voraussetzung (**FRS** nicht).
- **Domänenweite** Kontosperrung nicht mit **OU-GPO** ändern – **nur** Domänenebene.

## Grafik
### Hausordnung und Sonderregel
Große Tafel „Hausordnung“ für alle; über der Admin-Tür ein zusätzliches Schild „PSO-Admins“ mit Rangfolge 10; Schild mit kleinerer Zahl überklebt das größere.

### Türsteher
Kennwort will passieren; Türsteher (DC-Agent) fragt Boten (Proxy) nach Listen aus der Wolke; „Sommer2026!“ wird mit rotem Stempel abgelehnt.

### Audit-Schalter
Schalter mit Audit (gelb, protokolliert) und Enforce (rot, lehnt ab).

## Karteikarten
- F: Was gilt die Domänenkennwortrichtlinie? | A: Für alle Benutzer der Domäne (nur auf Domänenebene).
- F: Was ist eine FGPP? | A: Abgestufte Kennwortrichtlinie (PSO) für einzelne Benutzer/globale Sicherheitsgruppen.
- F: Auf wen kann man eine FGPP anwenden? | A: Benutzer und globale Sicherheitsgruppen – nicht auf OUs.
- F: Welche Domänenfunktionsebene braucht FGPP? | A: Windows Server 2008 oder höher.
- F: Welche Richtlinie gewinnt bei mehreren PSOs? | A: Die mit der kleineren Rangfolge; direkt zugewiesene vor Gruppen.
- F: Cmdlet für die wirksame Richtlinie? | A: Get-ADUserResultantPasswordPolicy
- F: Was ist Microsoft Entra Password Protection? | A: Sperrlisten (global und benutzerdefiniert) gegen schwache Kennwörter im lokalen AD.
- F: Wo läuft der DC-Agent, wo der Proxy? | A: DC-Agent auf jedem DC, Proxy auf einem Mitgliedsserver.
- F: Welche Lizenz braucht die benutzerdefinierte Sperrliste? | A: Entra ID P1 oder höher.
- F: Modi der Password Protection? | A: Überwachen (Audit) und Erzwingen (Enforced).
- F: Cmdlets zur Registrierung? | A: Register-AzureADPasswordProtectionProxy und ...Forest
- F: Wie viele Begriffe darf die benutzerdefinierte Liste haben? | A: Bis zu 1000.

## Quiz
? Administratoren sollen eine Kennwortlänge von 15 Zeichen erhalten, alle anderen Benutzer 8. Lösung?
* FGPP für die Administratorgruppe
- GPO an die OU der Administratoren
- Zweite Default Domain Policy
- Entra Smart Lockout

? Eine FGPP soll für alle Benutzer einer OU gelten. Wie?
* Globale Sicherheitsgruppe (Schattengruppe) mit OU-Benutzern anlegen und PSO zuweisen
- PSO an die OU verknüpfen
- GPO mit höherer Priorität
- Passwordsettings-Container verschieben

? Benutzer verwenden Kennwörter wie „Firma2026!“, die die Komplexität erfüllen, aber leicht zu erraten sind. Lösung?
* Entra Password Protection mit benutzerdefinierter Sperrliste
- Kennwortverlauf auf 24 setzen
- Kontosperrung aktivieren
- Protected Users

? Wo wird der Proxy-Dienst von Entra Password Protection installiert?
* Auf einem Mitgliedsserver
- Auf jedem Domänencontroller
- Nur auf dem PDC-Emulator
- Auf dem Entra-Connect-Server zwingend

? Password Protection läuft im Überwachungsmodus. Ein schwaches Kennwort wird gesetzt. Ergebnis?
* Kennwort wird akzeptiert, Ereignis wird protokolliert
- Kennwort wird abgelehnt
- Benutzer wird gesperrt
- Konto wird deaktiviert

? Zwei PSOs (Rangfolge 5 und 20) gelten für denselben Benutzer über Gruppen. Welche gilt?
* Rangfolge 5
- Rangfolge 20
- Kombination beider
- Default Domain Policy

? Welche Domänenfunktionsebene ist für Fine-Grained Password Policies mindestens nötig?
* Windows Server 2008
- Windows 2000
- Windows Server 2016
- Windows Server 2025
! PSOs werden im Container Password Settings Container gespeichert.

? Auf welche Objekte kann ein PSO direkt angewendet werden?
* Benutzer und globale Sicherheitsgruppen
- OUs
- Computerkonten
- Standorte
! Für eine OU nutzt man eine Schattengruppe (Shadow Group).
