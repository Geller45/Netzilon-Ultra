---
id: az801-auth-silos
bereich: AZ-801
block: A9
kapitel: Sicherheit
titel: Authentication Policies und Authentication Policy Silos
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-protected-users, az801-dc-haertung, ap1-a6-kerberos, az800-gmsa]
---

## Profi

### Idee
Mit **Authentication Policies** (*Authentifizierungsrichtlinien*) und **Silos** (*Authentication Policy Silos*) legst du fest, **wo sich privilegierte Konten anmelden dürfen** und **wie lange ihre TGTs gelten**. Sie sind die **technische Umsetzung des Tier-Modells** (Seite 07).

| Objekt | Bedeutung |
|---|---|
| **Authentication Policy** (`msDS-AuthNPolicy`) | **Regelwerk** für **Benutzer**, **Computer** oder **Dienstkonten**: **TGT-Lebensdauer**, **erlaubte Quellgeräte**, **Zugriffsbedingungen** |
| **Authentication Policy Silo** (`msDS-AuthNPolicySilo`) | **Container**, der **Konten** (Benutzer/Computer/Dienste) **gruppiert** und **je Kontotyp** eine **Policy** zuweist |

### Voraussetzungen
| Punkt | Details |
|---|---|
| **Domänenfunktionsebene** | **Windows Server 2012 R2** oder höher |
| **Clients** | **Windows 8.1 / Server 2012 R2** oder höher |
| **Kerberos-Erweiterungen** | **KDC** (DCs): „**KDC-Unterstützung für Ansprüche, zusammengesetzte Authentifizierung und Kerberos-Panzerung**“ = **Unterstützt** bzw. **Immer Ansprüche bereitstellen** |
| **Client-GPO** | „**Kerberos-Clientunterstützung für Ansprüche, zusammengesetzte Authentifizierung und Kerberos-Panzerung**“ = **Aktiviert** |
| **Panzerung** (*Kerberos Armoring*, **FAST**) | Für **Gerätebeschränkung** nötig |

### Einstellungsmöglichkeiten einer Policy
| Einstellung | Wirkung |
|---|---|
| **TGT-Lebensdauer** (*Ticket-Granting Ticket Lifetime*) | Für **Benutzer** **frei** (z. B. **240 Min.**), anders als bei **Protected Users** (**fest 4 h**) |
| **Benutzer darf sich anmelden von** (*User Allowed to Authenticate From*) | **Zugriffssteuerungsbedingung**: **nur von bestimmten Geräten** (z. B. **PAW/DCs**) |
| **Benutzer darf sich anmelden bei** (*User Allowed to Authenticate To*) | **Für Dienst-/Computerpolicies**: **wer** darf **sich am Computer authentifizieren** |
| **NTLM erlauben** (*Allow NTLM authentication*) | Für **Dienstkonten/Computer**: kann **NTLM** verbieten |

**Bedingungen** (SDDL/ACL): auf **Anspruchs-** und **Gerätegruppen** (*Device Groups*, **Computerkonten** in **Sicherheitsgruppen**).

### Ablauf der Umsetzung
1. **KDC** und **Client**: **GPOs** für **Claims/Armoring** **aktivieren**.
2. **Authentication Policy** **erstellen** (mit **TGT-Lebensdauer** und **Gerätebeschränkung**).
3. **Silo** **erstellen**, **Policy** **zuweisen** (**Benutzer**, **Computer**, **Dienst**).
4. **Konten** dem **Silo** **zuordnen**: **`Grant-ADAuthenticationPolicySiloAccess`** (**Zugriff**) **und** **`Set-ADAccountAuthenticationPolicySilo`** (**Konto → Silo**).
5. **Erst Überwachen** (*Audit*), dann **Erzwingen** (*Enforce*).

### Modi
| Modus | Verhalten |
|---|---|
| **Nur überwachen** (*Audit only*) | **Verstöße** werden **nur protokolliert** |
| **Erzwingen** (*Enforce*) | **Verstöße** werden **blockiert** |

**Ereignisprotokolle**: `Microsoft-Windows-Authentication/AuthenticationPolicyFailures-DomainController` (**Ablehnungen** und **Audit-Treffer**).

### PowerShell
```powershell
# Auf DC01 – Policy für Tier-0-Benutzer: TGT 240 Min., Anmeldung nur von Geräten desselben Silos (Claim), Audit-Modus
New-ADAuthenticationPolicy -Name "AP-Tier0-Users" `
  -UserTGTLifetimeMins 240 `
  -UserAllowedToAuthenticateFrom "O:SYG:SYD:(XA;OICI;CR;;;WD;(@USER.ad://ext/AuthenticationSilo == `"Tier0-Silo`"))" `
  -Description "Tier 0 Benutzer"

# Auf DC01 – Silo anlegen und Policy zuweisen
New-ADAuthenticationPolicySilo -Name "Tier0-Silo" `
  -UserAuthenticationPolicy "AP-Tier0-Users" `
  -ComputerAuthenticationPolicy "AP-Tier0-Users" `
  -ServiceAuthenticationPolicy "AP-Tier0-Users"

# Auf DC01 – Konten zulassen und dem Silo zuordnen
Grant-ADAuthenticationPolicySiloAccess -Identity "Tier0-Silo" -Account admin-anna
Set-ADUser -Identity admin-anna -AuthenticationPolicySilo "Tier0-Silo"

# Auf DC01 – Prüfen
Get-ADAuthenticationPolicy -Filter *
Get-ADAuthenticationPolicySilo -Filter *
Get-ADUser -Identity admin-anna -Properties AuthenticationPolicySilo
```
**Hinweis**: Für **Enforce** beim Erstellen **`-Enforce`** setzen (oder später **`Set-ADAuthenticationPolicy -Enforce $true`**). **Ohne** `-Enforce` läuft die Policy im **Audit-Modus**.

### Abgrenzung
| Technik | Zweck |
|---|---|
| **Protected Users** | **Feste Härtung**, **keine Konfiguration** |
| **Authentication Policy** | **Konfigurierbar**: **TGT**, **Gerätebeschränkung** |
| **Silo** | **Gruppiert** **Konten** und **weist** Policies **zu** |
| **Logon-Rechte per GPO** | **Lokale** Einschränkung **je Gerät** (Tier-Umsetzung) |
| **Kennwortrichtlinie/FGPP** | **Kennwortregeln**, **nicht** Anmeldeort |

**Sinnvoll kombiniert**: **Protected Users** (**Basis**) + **Silo** (**Feinsteuerung** für **Tier 0**).

## Lab
**Maschinen**: **DC01** (example.com, DFL 2012 R2+), **PAW01** (Windows 11), **CLIENT01** (Windows 11), Benutzer `admin-anna`.

### GUI
1. **DC01**: **Gruppenrichtlinienverwaltung** → **Default Domain Controllers Policy** → **Computerkonfiguration → Administrative Vorlagen → System → KDC** → **KDC-Unterstützung für Ansprüche, zusammengesetzte Authentifizierung und Kerberos-Panzerung** → **Aktiviert**, **Option: Unterstützt**.
2. **DC01**: **Default Domain Policy** → **Computerkonfiguration → Administrative Vorlagen → System → Kerberos** → **Kerberos-Clientunterstützung für Ansprüche, zusammengesetzte Authentifizierung und Kerberos-Panzerung** → **Aktiviert**.
3. **DC01**: **Active Directory-Verwaltungscenter** (`dsac.exe`) → **Authentifizierung** → **Authentifizierungsrichtlinien** → **Neu → Authentifizierungsrichtlinie** → Name `AP-Tier0-Users`.
4. **DC01**: **Konten → Benutzer**: **TGT-Lebensdauer** **240** Minuten; **Bearbeiten** **Bedingungen** (**Benutzer darf sich anmelden von**: Geräte des Silos → **PAW01** vorher dem Silo zuweisen).
5. **DC01**: **Authentifizierungsrichtlinien-Silos → Neu** → Name `Tier0-Silo` → **Zulässige Konten** → `admin-anna` → **Richtlinie für Benutzer** wählen → **Modus: Nur überwachen**.
6. **DC01**: **Konto `admin-anna` → Eigenschaften → Silo** → `Tier0-Silo` zuweisen.
7. **CLIENT01**: Als `admin-anna` anmelden → **Audit-Ereignis** im **DC01-Protokoll** **AuthenticationPolicyFailures** prüfen.
8. **DC01**: **Silo → Modus: Erzwingen** → **Anmeldung an CLIENT01** wird **abgelehnt**, **an PAW01** funktioniert.

## Einfach

**Protected Users** ist die **feste Sicherheitsweste**. **Silos** sind das **Sicherheitsarmband mit Zonen** – du bestimmst **selbst**:

- **Wo** darf der **Admin** sich **anmelden**? (**nur** am **Spezialrechner PAW**, **nicht** am **normalen PC**)
- **Wie lange** gilt der **Ausweis (TGT)**? (**4 Stunden**? **8 Stunden**? – **du legst es fest**)

**So funktioniert es:**
1. Du schreibst **Regeln** in eine **Policy** („Ausweis 4 h, nur an PAW“).
2. Du steckst **Leute und Geräte** in ein **Silo** (ein **abgeschlossener Bereich**).
3. Das **Silo** **wendet die Regeln** an.
4. **Erst testen** („nur melden“), dann **scharf schalten** („blockieren“).

**Beispiel**: Der **Chef-Admin** will sich am **Empfangs-PC** anmelden – **Silo**: „**Nein!** Du darfst **nur** am **Tresorrechner (PAW)**.“

## Merksatz
- **Policy** = **Regeln**, **Silo** = **Gruppe** der Konten, die die **Regeln** bekommen.
- **DFL 2012 R2**, **Claims/Armoring** per **GPO**.
- **TGT-Lebensdauer** **frei** einstellbar (**Protected Users**: **fest 4 h**).
- **Audit** → **Enforce**.
- **Zwei Schritte** je Konto: **Grant-…SiloAccess** und **Set-…-AuthenticationPolicySilo**.

## Prüfungsfalle
- **Ohne KDC-/Client-GPO** (**Claims/Armoring**) **greift** die **Gerätebeschränkung nicht**.
- **Silo-Mitgliedschaft** braucht **beides**: **Zugriff gewähren** **und** **Konto zuweisen**.
- **Policy ohne `-Enforce`** läuft **nur** im **Audit-Modus**.
- **Protected Users** erlaubt **keine** TGT-Anpassung, **Policy** **schon**.
- **Kerberos** ist **Voraussetzung** – **NTLM-Anmeldung** wird **nicht** durch die Gerätebeschränkung erfasst.
- **Fehler** im **Protokoll** `AuthenticationPolicyFailures-DomainController` suchen (**nicht** im **Sicherheitsprotokoll** allein).
- **DFL 2012 R2** **nötig**, **nicht** 2008 R2.
- **Dienstkonten**: **gMSA** **sinnvoll**, **Silo-Policy** **für Dienste** über **ServiceAuthenticationPolicy**.

## Grafik
### Zonen-Armband
Drei farbige Zonen (Tier 0/1/2) als Gebäudegrundriss; Admin-Figur mit goldenem Armband darf nur durch die Tier-0-Tür; an Tier-2-Tür rotes Kreuz.

### Policy und Silo
Karte „Policy“ (TGT 4 h, nur PAW) wird in Kiste „Silo“ geschoben; Konten-Icons hüpfen in die Kiste und tragen die Karte.

### Audit oder Erzwingen
Schalter mit Gelb (protokollieren) und Rot (blockieren); Konto meldet sich an falschem Gerät an, je nach Schalter Blitz-Icon oder Stopp-Schild.

## Karteikarten
- F: Wozu dienen Authentication Policies? | A: TGT-Lebensdauer und Anmeldeort für Konten festlegen.
- F: Was ist ein Authentication Policy Silo? | A: Container, der Konten gruppiert und ihnen Policies zuweist.
- F: Welche Domänenfunktionsebene ist nötig? | A: Windows Server 2012 R2.
- F: Welche GPOs sind nötig? | A: KDC- und Client-Unterstützung für Ansprüche, zusammengesetzte Authentifizierung und Kerberos-Panzerung.
- F: Welche zwei Schritte brauchen Konten für ein Silo? | A: Grant-ADAuthenticationPolicySiloAccess und Set-ADAccountAuthenticationPolicySilo (bzw. Set-ADUser -AuthenticationPolicySilo).
- F: Welche Modi gibt es? | A: Nur überwachen (Audit) und Erzwingen (Enforce).
- F: Cmdlet zum Erstellen eines Silos? | A: New-ADAuthenticationPolicySilo
- F: Cmdlet zum Erstellen einer Policy? | A: New-ADAuthenticationPolicy
- F: Wo liegen die Fehlerereignisse? | A: Authentication/AuthenticationPolicyFailures-DomainController.
- F: Unterschied zu Protected Users? | A: Protected Users ist fest, Policy/Silo sind konfigurierbar.
- F: Für welche Kontotypen gibt es Policy-Einstellungen? | A: Benutzer, Computer und Dienstkonten.

## Quiz
? Tier-0-Admins sollen sich nur an bestimmten Geräten anmelden dürfen. Lösung?
* Authentication Policy mit Silo
- FGPP
- Protected Users
- Zweite Domänenrichtlinie

? Die TGT-Lebensdauer für Admins soll auf 2 Stunden gesetzt werden. Wie?
* Authentication Policy (UserTGTLifetimeMins)
- Protected Users Eigenschaften
- Default Domain Policy Kerberos
- NTFS-Berechtigung

? Welche Funktionsebene erfordert das Feature?
* Windows Server 2012 R2
- Windows Server 2008 R2
- Windows Server 2003
- Windows Server 2019

? Die Policy soll zuerst testweise laufen. Was wird verwendet?
* Nur-überwachen-Modus (ohne Enforce)
- Sofort erzwingen
- Protected Users
- FGPP

? Ein Konto wurde zum Silo hinzugefügt, die Richtlinie greift nicht. Ursache?
* Konto wurde nur zugelassen, aber nicht zugewiesen (oder umgekehrt)
- Domäne ist zu klein
- LAPS fehlt
- Silo zu alt

? Worin unterscheidet sich Protected Users von einer Authentication Policy?
* Protected Users ist fest, die Policy konfigurierbar
- Protected Users gilt nur für Computer
- Policy gilt nur für Gruppen
- Kein Unterschied
