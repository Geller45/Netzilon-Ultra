---
id: az801-admin-delegierung
bereich: AZ-801
block: A9
kapitel: Sicherheit
titel: Administrative Gruppen und AD-Delegierung
stufe: Fortgeschritten
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-dc-haertung, az801-auth-silos, az801-protected-users, ap1-a6-gruppen, ap1-a6-adds]
---

## Profi

### Privilegierte Gruppen
| Gruppe | Bereich | Bedeutung |
|---|---|---|
| **Enterprise Admins** | **Gesamtstruktur** (nur im **Stammdomänen**-Container) | **Vollzugriff** auf **alle Domänen**; im **Normalbetrieb leer** halten |
| **Schema Admins** | **Gesamtstruktur** | **Schemaänderungen**; **leer**, nur **bei Bedarf** füllen |
| **Domain Admins** | **Domäne** | **Vollzugriff** in der **Domäne**; **lokale Admins** auf **allen** Mitgliedsrechnern |
| **Administrators** (integriert) | **Domäne/DCs** | **Höchste** Rechte auf **DCs** |
| **Account Operators** | **Domäne** | Benutzer/Gruppen **verwalten**; **nicht** empfohlen (**zu breit**) |
| **Server Operators** | **DCs** | **Lokal anmelden**, **Dienste**, **Sichern/Wiederherstellen** |
| **Backup Operators** | **DCs** | **Sichern/Wiederherstellen** (kann **NTDS.dit** lesen!) |
| **Print Operators** | **DCs** | **Drucker**, **Treiber laden** (**Code auf DC**) |
| **DnsAdmins** | **DNS** | **DNS-Verwaltung** (**Missbrauch** über **Plugin-DLL** möglich) |

**Grundsatz**: **Geringste Rechte** (*Least Privilege*). **Kein Dauer-Domänen-Admin** für Alltagsaufgaben, **getrennte Adminkonten** (`admin-anna` ≠ `anna`), **Mitgliedschaften regelmäßig prüfen**.

### AdminSDHolder und SDProp
| Begriff | Erklärung |
|---|---|
| **AdminSDHolder** | **Container** `CN=AdminSDHolder,CN=System,DC=…` mit **Vorlage-ACL** für **geschützte Konten/Gruppen** |
| **SDProp** (*Security Descriptor Propagator*) | Prozess auf dem **PDC-Emulator**, der **alle 60 Minuten** die **ACL** der **Vorlage** auf **geschützte Objekte** **kopiert** |
| **adminCount = 1** | **Markiert** Konten, die **einmal** in **geschützten Gruppen** waren; **Vererbung** ist **deaktiviert** |

**Folge**: **Delegierte Rechte** an **Domänen-Admin-Benutzern** (z. B. **Kennwort zurücksetzen** durch **Helpdesk**) werden **automatisch** **überschrieben**. **Aufräumen**: **adminCount** auf **0** setzen und **Vererbung** **wieder aktivieren**, **nachdem** das Konto **aus** der Gruppe **entfernt** wurde.

```powershell
# Auf DC01 – Konten mit adminCount=1 finden
Get-ADObject -Filter 'adminCount -eq 1' -Properties adminCount, objectClass |
  Select-Object Name, objectClass
```

### Delegierung der Verwaltung
Mit der **Delegierung** (*Delegation of Control*) gibst du **einzelne Aufgaben** an **Nicht-Admins** – **ohne** Domänenadmin-Rechte.

**Assistent** (ADUC): **Rechtsklick OU → Objektverwaltung zuweisen** (*Delegate Control*).
| Schritt | Auswahl |
|---|---|
| 1 | **Gruppe** (nicht Einzelperson), z. B. `Helpdesk-Filiale` |
| 2 | **Aufgabe**: **Benutzerkonten erstellen/löschen/verwalten**, **Kennwörter zurücksetzen**, **Gruppenmitgliedschaft ändern**, **Computer der Domäne hinzufügen**, **Gruppenrichtlinien-Links verwalten** |
| 3 | **Benutzerdefinierte Aufgabe** für **feine** Rechte (**Objekttyp**, **Attribute**) |

**Anwendung**: **Rechte** liegen als **ACEs** in der **ACL** der **OU** (**vererbt** auf **untergeordnete** Objekte).

**Werkzeuge**
| Werkzeug | Zweck |
|---|---|
| **ADUC**, **Delegierungs-Assistent** | **GUI** |
| `dsacls` | **ACL** von **AD-Objekten** **anzeigen/setzen** |
| `Get-Acl "AD:\OU=…"` | **ACL** per **PowerShell** **auslesen** |
| **Erweiterte Sicherheit** (ADUC → **Ansicht → Erweiterte Features**) | **ACL** **im Detail** |

**Vorgehen mit `dsacls`** (Kennwort zurücksetzen für Helpdesk):
```powershell
dsacls "OU=Filiale,DC=example,DC=com" /I:S /G "EXAMPLE\Helpdesk-Filiale:CA;Reset Password;user"
dsacls "OU=Filiale,DC=example,DC=com" /I:S /G "EXAMPLE\Helpdesk-Filiale:WP;lockoutTime;user"
dsacls "OU=Filiale,DC=example,DC=com"
```

**Delegierungs-Empfehlungen**
- **Gruppen** delegieren, **nicht** Einzelbenutzer.
- **Minimal** (**nur** benötigte **Aufgaben**), **nur auf** die **OU**.
- **Domänenadmin**, **Enterprise-Admin** nur für **Struktur-/Gesamtstruktur**-Aufgaben.
- **Delegierung dokumentieren** (Tabelle: **Gruppe**, **OU**, **Recht**).
- **Rückgängig**: **Delegierungs-Assistent** kann **nicht** zurücknehmen → **ACE** **manuell entfernen**.

### Sensible Konten schützen
| Einstellung | Wirkung |
|---|---|
| **Konto ist wichtig und kann nicht delegiert werden** (*Account is sensitive and cannot be delegated*) | **Kerberos-Delegierung** für dieses **Konto** **gesperrt** |
| **Smartcard erforderlich** | **Anmeldung** **nur mit Karte** |
| **Kerberos-AES** | **Nur AES** erlauben |
| **Protected Users** | **Feste Härtung** (Seite 05) |

```powershell
Set-ADAccountControl -Identity admin-anna -AccountNotDelegated $true
```

### Zeitlich begrenzte Mitgliedschaft (Privileged Access Management, PAM)
**AD-Funktion** **„Privileged Access Management Feature“** (**Gesamtstruktur-Funktionsebene 2016** oder **höher**): **Mitgliedschaft** mit **Ablaufzeit** (*Time-to-Live*, **TTL**).
```powershell
# Auf DC01 – Feature einmalig aktivieren (nicht rückgängig)
Enable-ADOptionalFeature "Privileged Access Management Feature" -Scope ForestOrConfigurationSet -Target example.com

# Admin nur 60 Minuten in Domain Admins
Add-ADGroupMember -Identity "Domain Admins" -Members admin-anna -MemberTimeToLive (New-TimeSpan -Minutes 60)
Get-ADGroup "Domain Admins" -Properties member -ShowMemberTimeToLive | Select-Object -ExpandProperty member
```
- **Abgelaufene** Mitgliedschaft wird **automatisch entfernt**, **Kerberos-Tickets** verfallen **spätestens** mit **TTL**.
- **Cloud**: **Microsoft Entra Privileged Identity Management (PIM)** für **Just-in-Time** in **Entra**/**Azure** (**P2-Lizenz**).

### Lokale Administratoren
| Thema | Lösung |
|---|---|
| **Gleiche lokale Admin-Kennwörter** überall | **LAPS** (**Windows LAPS**): **zufälliges** Kennwort **je Gerät**, **im AD/Entra** gespeichert, **rotiert** |
| **Domain Admins** sind **lokale Admins** auf **Mitgliedsrechnern** | **Eingeschränkte Gruppen** (*Restricted Groups*)/**GPP** oder **Gruppenrichtlinie** **Lokale Gruppen** anpassen |

## Lab
**Maschinen**: **DC01** (example.com), **CLIENT01** (Windows 11), OU `Filiale`, Gruppe `Helpdesk-Filiale`, Benutzer `hilda` (Mitglied), `bernd` (Testbenutzer in `Filiale`).

### GUI
1. **DC01**: **Active Directory-Benutzer und -Computer** → **Ansicht → Erweiterte Features** aktivieren.
2. **DC01**: **Rechtsklick auf OU Filiale → Objektverwaltung zuweisen → Weiter → Hinzufügen** → `Helpdesk-Filiale` → **Weiter**.
3. **DC01**: **Häufige Aufgaben** → **Benutzerkennwörter zurücksetzen und Kennwortänderung bei der nächsten Anmeldung erzwingen** anhaken → **Weiter → Fertig stellen**.
4. **CLIENT01**: **RSAT** installiert → als `hilda` anmelden → **ADUC** → `bernd` → **Kennwort zurücksetzen** → **funktioniert**.
5. **CLIENT01**: als `hilda` → **Benutzer löschen** versuchen → **verweigert**.
6. **DC01**: **OU Filiale → Eigenschaften → Sicherheit → Erweitert** → **ACE** von `Helpdesk-Filiale` prüfen.
7. **DC01**: Benutzer `admin-anna` → **Eigenschaften → Konto → Konto ist wichtig und kann nicht delegiert werden**.

### PowerShell
```powershell
# Auf DC01 – Delegierung per dsacls und Prüfung
dsacls "OU=Filiale,DC=example,DC=com" /I:S /G "EXAMPLE\Helpdesk-Filiale:CA;Reset Password;user"
(Get-Acl "AD:\OU=Filiale,DC=example,DC=com").Access | Where-Object IdentityReference -like "*Helpdesk*"

# Auf DC01 – Privilegierte Gruppen prüfen
"Domain Admins","Enterprise Admins","Schema Admins","Administrators" | ForEach-Object {
  "--- $_"; Get-ADGroupMember $_ -Recursive | Select-Object Name, SamAccountName
}

# Auf DC01 – Sensibles Konto
Set-ADAccountControl -Identity admin-anna -AccountNotDelegated $true
```

## Einfach

Stell dir das AD als **großes Bürogebäude** vor.

- **Enterprise/Domain Admins** sind der **Generalschlüssel**. Den soll **fast niemand** haben – und **nie im Alltag**.
- **Delegierung** ist wie **Einzelschlüssel**: Der **Helpdesk** bekommt **nur den Schlüssel für Stockwerk „Filiale“** und darf dort **nur Passwörter zurücksetzen**. **Alles andere bleibt zu**.
- **AdminSDHolder** ist der **Hausmeister**, der **jede Stunde** bei **allen Generalschlüssel-Besitzern** die **Schlösser** **zurücksetzt** (**deine Einzelrechte** werden dort **überschrieben**). Er **merkt sich** das mit einem **Aufkleber (adminCount=1)**.
- **PAM/TTL** = **Leih-Schlüssel mit Ablaufzeit**: „Du bekommst den Generalschlüssel **60 Minuten**, dann **verschwindet** er.“
- **LAPS** = **jede Tür hat ein anderes Passwort**, das **von selbst wechselt**.

## Merksatz
- **Enterprise/Schema Admins** = **leer im Alltag**.
- **Delegieren** = **Gruppe + minimale Aufgabe + OU**.
- **AdminSDHolder/SDProp** = **alle 60 Min.**, **überschreibt** ACLs **geschützter** Konten.
- **adminCount = 1** = **einmal geschützt**, **Vererbung aus**.
- **TTL-Mitgliedschaft** = **PAM-Feature** (**Forest 2016**).
- **Sensible Konten**: **nicht delegierbar**, **Protected Users**.

## Prüfungsfalle
- **Helpdesk-Delegierung** greift **nicht** bei **Konten in Admin-Gruppen** (**AdminSDHolder** überschreibt).
- **Backup Operators** können **NTDS.dit** **sichern** → **de facto Domänen-Admin**.
- **Delegierungs-Assistent** kann **nichts zurücknehmen** (**ACE** manuell löschen).
- **PAM-Feature** ist **nicht rückgängig** zu machen und braucht **Gesamtstruktur-Funktionsebene 2016**.
- **Delegieren** **auf Gruppen**, **nicht** auf **Einzelbenutzer**.
- **SDProp** läuft **auf dem PDC-Emulator** (**60 Min.**).
- **Domain Admins** sind **automatisch lokale Admins** auf **Mitgliedsrechnern**.
- **Entra PIM** ≠ **AD-PAM** (**Cloud** vs. **lokal**), **P2** nötig.

## Grafik
### Schlüsselbund
Generalschlüssel (Domain Admins) hinter Glas; kleine farbige Schlüssel (Delegierung) hängen an Stockwerks-Türen.

### Hausmeister SDProp
Uhr springt alle 60 Minuten; Hausmeister stempelt „Vorlagen-ACL“ auf jede Admin-Tür und überklebt fremde Schilder.

### Leih-Schlüssel
Schlüssel mit Sanduhr (TTL): Sand läuft, Schlüssel löst sich in Luft auf, Gruppe zeigt Mitglied verschwindet.

## Karteikarten
- F: Was ist AdminSDHolder? | A: Container mit Vorlage-ACL für geschützte Konten und Gruppen.
- F: Wie oft läuft SDProp? | A: Alle 60 Minuten auf dem PDC-Emulator.
- F: Was bedeutet adminCount=1? | A: Konto war in einer geschützten Gruppe, Vererbung ist deaktiviert.
- F: Wo startet man die Delegierung? | A: ADUC, Rechtsklick auf OU, Objektverwaltung zuweisen.
- F: Was delegiert man am besten? | A: Gruppen, minimale Aufgaben, nur auf die OU.
- F: Können Backup Operators die AD-Datenbank sichern? | A: Ja, sie sind praktisch so mächtig wie Domänen-Admins.
- F: Welche Gruppen bleiben im Alltag leer? | A: Enterprise Admins und Schema Admins.
- F: Was ermöglicht zeitlich begrenzte Gruppenmitgliedschaft? | A: Privileged Access Management Feature mit MemberTimeToLive.
- F: Welche Funktionsebene braucht das PAM-Feature? | A: Gesamtstruktur-Funktionsebene Windows Server 2016.
- F: Wofür dient LAPS? | A: Zufällige, rotierende lokale Admin-Kennwörter je Gerät.
- F: Welches Cmdlet setzt „kann nicht delegiert werden“? | A: Set-ADAccountControl -AccountNotDelegated $true

## Quiz
? Ein Helpdesk soll Kennwörter in der OU Filiale zurücksetzen dürfen, sonst nichts. Wie?
* Delegierungs-Assistent auf die OU für die Helpdesk-Gruppe
- Helpdesk in Domain Admins
- Account Operators hinzufügen
- Enterprise Admins

? Die delegierten Rechte für einen Ex-Domänenadmin funktionieren nicht. Ursache?
* AdminSDHolder/SDProp überschreibt die ACL, adminCount ist 1
- DNS-Cache
- Kennwortverlauf
- Fehlende Lizenz

? Wie lange ist der Zyklus von SDProp?
* 60 Minuten
- 5 Minuten
- 24 Stunden
- Bei jeder Anmeldung

? Ein Admin soll die Domänen-Admin-Rechte nur für 2 Stunden erhalten. Lösung?
* Gruppenmitgliedschaft mit TTL (PAM-Feature)
- FGPP mit kurzer Laufzeit
- Kontosperrung
- Zweites Domänenkonto

? Welche Gruppe erlaubt indirekt den Zugriff auf NTDS.dit?
* Backup Operators
- Print Operators
- DnsAdmins
- Guests

? Wofür wird LAPS eingesetzt?
* Einzigartige lokale Administratorkennwörter je Computer
- Delegierte OU-Verwaltung
- Kerberos-Panzerung
- Domänenreplikation
