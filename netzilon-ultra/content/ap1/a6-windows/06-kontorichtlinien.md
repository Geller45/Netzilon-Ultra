---
id: ap1-a6-kontorichtlinien
bereich: AP1
block: A6
kapitel: Windows Server
titel: Kennwort- & Kontosperrungsrichtlinien, FGPP
stufe: Einsteiger
quellen: [09-2-Folien-Kontorichtlinien.pdf, Server_2008_R2_-_70_640_2nd_de.pdf]
verweise: [ap1-a6-gpo-grundlagen, ap1-a6-adds, az801-kennwortrichtlinien]
---

## Profi

### Wo werden sie festgelegt?
Kennwort- und Kontosperrungsrichtlinien für **Domänenkonten** werden in der **Default Domain Policy** (bzw. einem anderen **an die Domäne verknüpften** GPO) festgelegt:
`Computerkonfiguration → Richtlinien → Windows-Einstellungen → Sicherheitseinstellungen → Kontorichtlinien → Kennwortrichtlinien / Kontosperrungsrichtlinien`
- Sie gelten **domänenweit** – es gibt **nur eine** Domänen-Kennwortrichtlinie. An **OUs** verknüpfte Kontorichtlinien wirken **nicht** auf Domänenkonten (nur auf die **lokalen** Konten der Computer in der OU).
- Umgesetzt werden sie vom **DC mit der PDC-Emulator-Rolle**.
- **Änderungen gelten nicht rückwirkend** für bestehende Kennwörter – erst bei der nächsten Kennwortänderung. Sofortige Durchsetzung: Kennwörter zurücksetzen bzw. „Benutzer muss Kennwort bei der nächsten Anmeldung ändern“ setzen.
- Für **unterschiedliche** Regeln je Benutzergruppe → **FGPP** (siehe unten).

### Kennwortrichtlinien
| Einstellung | Bedeutung | Windows-Standard (Domäne) |
|---|---|---|
| **Kennwort muss Komplexitätsvoraussetzungen entsprechen** | mind. 3 von 4 Zeichenkategorien (Groß, Klein, Ziffer, Sonderzeichen), Kontoname nicht enthalten, mind. 6 Zeichen | Aktiviert |
| **Kennwortchronik erzwingen** | Anzahl gespeicherter alter Kennwörter, die nicht wiederverwendet werden dürfen (max. **24**) | 24 |
| **Maximales Kennwortalter** | Tage, bis das Kennwort geändert werden muss (0 = läuft nie ab) | 42 |
| **Minimales Kennwortalter** | Tage, die ein Kennwort mindestens behalten werden muss – verhindert, dass Benutzer die Chronik durch schnelles Wechseln umgehen | 1 |
| **Minimale Kennwortlänge** | Mindestanzahl Zeichen (klassisch max. **14**; neuere Systeme per „Relax minimum password length limits“ bis 128) | 7 |
| **Kennwörter mit umkehrbarer Verschlüsselung speichern** | nur für Anwendungen ohne Kerberos-Unterstützung (z. B. CHAP, Digest) – **unsicher**, fast wie Klartext | Deaktiviert |

**Aktuelle Empfehlungen** (BSI, NIST SP 800-63B, Microsoft): **lange Passphrasen** (≥ 12–14 Zeichen) statt komplizierter Kurzwörter; **kein regelmäßiger Zwangswechsel** ohne Anlass (führt zu „Sommer2025!“ → „Herbst2025!“), sondern Wechsel bei Verdacht auf Kompromittierung; Abgleich mit Listen geleakter/verbotener Kennwörter (Entra Password Protection); **MFA**; für lokale Admin-Konten **Windows LAPS** (zufällige, rotierende Kennwörter je Rechner).

### Kontosperrungsrichtlinien
| Einstellung | Bedeutung | Werte |
|---|---|---|
| **Kontosperrungsschwelle** | Anzahl ungültiger Anmeldeversuche, bis das Konto gesperrt wird | 0–999; **0 = nie sperren** |
| **Kontosperrdauer** | wie lange das Konto gesperrt bleibt | 0–99.999 Min.; **0 = bleibt gesperrt, bis ein Admin entsperrt** |
| **Zurücksetzungsdauer des Kontosperrungszählers** | Zeit ohne Fehlversuch, nach der der Zähler wieder auf 0 geht | 1–99.999 Min.; **muss ≤ Sperrdauer** sein |
Zusätzlich: **Administratorkontosperrungen zulassen** (neuere Versionen). Windows 11 (ab 22H2) setzt für lokale Konten standardmäßig 10 Versuche / 10 Minuten.

**Abwägung**: Sperrung schützt gegen **Brute-Force-/Passwort-Raten**. Zu streng (Schwelle 3, Sperrdauer 0) → viel Helpdesk-Arbeit, und ein Angreifer kann durch absichtliche Fehlversuche **alle Konten sperren (Denial of Service)**. Zu lax → Raten möglich. Üblich: Schwelle 5–10, Sperrdauer/Reset 15–30 Minuten.

**Sicherheit vs. Komfort** (Anmerkung der Unterlage): Zu häufige Wechsel und zu lange Chroniken führen dazu, dass Benutzer **Kennwortlisten führen** oder Zettel an den Monitor kleben – die Sicherheit kehrt sich ins Gegenteil. Mehr Regeln = mehr Arbeit für den Admin.

### Detaillierte Kennwortrichtlinien (FGPP)
**Fine-Grained Password Policies** (ab Domänenfunktionsebene 2008) erlauben **abweichende** Kennwort- und Sperrrichtlinien für **Benutzer oder globale Sicherheitsgruppen** (nicht für OUs!).
- Objekt: **Password Settings Object (PSO)** im Container `System\Password Settings Container`.
- Verwaltung: **Active Directory-Verwaltungscenter** (`dsac.exe`) oder PowerShell.
- **Rangfolge (Precedence)**: kleinere Zahl gewinnt, wenn mehrere PSOs auf einen Benutzer wirken; ein direkt dem Benutzer zugewiesenes PSO schlägt Gruppen-PSOs; ohne PSO gilt die Domänenrichtlinie.
- Einsatz: strengere Regeln für **Admins** (z. B. 20 Zeichen), lockerere für Dienstkonten mit sehr langen Kennwörtern, etc.
- Ergebnis prüfen: `Get-ADUserResultantPasswordPolicy`.

### Konto-Optionen am Benutzerobjekt
Registerkarte **Konto**: „Benutzer muss Kennwort bei der nächsten Anmeldung ändern“, „Benutzer kann Kennwort nicht ändern“, „Kennwort läuft nie ab“, „Konto ist deaktiviert“, **Anmeldezeiten**, **Anmelden an** (bestimmte Computer), **Konto läuft ab** (Datum, z. B. Praktikanten). Gesperrtes Konto entsperren: Haken „Konto entsperren“ bzw. `Unlock-ADAccount`.

## Lab
**Maschine: DC01** (contoso.local), Test von **CL01**.

### GUI
1. **DC01**: Gruppenrichtlinienverwaltung (`gpmc.msc`) → Domäne → **Default Domain Policy** → Bearbeiten → Computerkonfiguration → Richtlinien → Windows-Einstellungen → Sicherheitseinstellungen → **Kontorichtlinien**.
2. **Kennwortrichtlinien**: Minimale Kennwortlänge **12**, Chronik **24**, Maximales Alter **0** (läuft nicht ab) oder 180, Minimales Alter **1**, Komplexität **Aktiviert**.
3. **Kontosperrungsrichtlinien**: Schwelle **5** → Windows schlägt automatisch Sperrdauer und Zurücksetzung **15/15 Minuten** vor → übernehmen.
4. **DC01**: `gpupdate /force`.
5. **CL01**: fünfmal falsches Kennwort für a.meier → Konto gesperrt.
6. **DC01**: `dsa.msc` → a.meier → Eigenschaften → Konto → **Konto entsperren**.
7. **FGPP**: **Active Directory-Verwaltungscenter** → contoso (local) → System → **Password Settings Container** → Neu → Kennworteinstellungen → Name „PSO-Admins“, Rangfolge **10**, Mindestlänge **20**, Sperrschwelle 3 → **Direkt angewendet auf**: Gruppe **Domänen-Admins** → OK.
8. Benutzer im Verwaltungscenter öffnen → **Resultierende Kennworteinstellungen anzeigen**.

### PowerShell
```powershell
# Auf DC01 – Domänenrichtlinie anzeigen/setzen
Get-ADDefaultDomainPasswordPolicy
Set-ADDefaultDomainPasswordPolicy -Identity contoso.local -MinPasswordLength 12 -PasswordHistoryCount 24 `
  -MaxPasswordAge 0.00:00:00 -MinPasswordAge 1.00:00:00 -ComplexityEnabled $true `
  -LockoutThreshold 5 -LockoutDuration 00:15:00 -LockoutObservationWindow 00:15:00

# Gesperrte Konten finden und entsperren
Search-ADAccount -LockedOut | Select-Object SamAccountName
Unlock-ADAccount -Identity a.meier

# FGPP für Admins
New-ADFineGrainedPasswordPolicy -Name "PSO-Admins" -Precedence 10 -MinPasswordLength 20 `
  -ComplexityEnabled $true -PasswordHistoryCount 24 -MaxPasswordAge 365.00:00:00 -MinPasswordAge 1.00:00:00 `
  -LockoutThreshold 3 -LockoutDuration 00:30:00 -LockoutObservationWindow 00:30:00 -ReversibleEncryptionEnabled $false
Add-ADFineGrainedPasswordPolicySubject -Identity "PSO-Admins" -Subjects "Domänen-Admins"
Get-ADUserResultantPasswordPolicy -Identity Administrator

# Kennwortänderung bei nächster Anmeldung erzwingen
Set-ADUser a.meier -ChangePasswordAtLogon $true
```

## Einfach

**Kennwortrichtlinien** sind die **Regeln für gute Passwörter** in der ganzen Firma:
- **Mindestlänge**: Wie lang muss es mindestens sein? Lange Passwörter sind viel schwerer zu knacken – ein langer Satz wie „MeinKaterHuntFrisstGernThunfisch“ ist besser als „K@t3!“.
- **Komplexität**: Es müssen verschiedene Sorten Zeichen drin sein (groß, klein, Zahl, Sonderzeichen).
- **Chronik**: Der Computer merkt sich deine letzten Passwörter, damit du nicht immer dasselbe nimmst.
- **Maximales Alter**: Nach wie vielen Tagen musst du ein neues nehmen? (Heute rät man: nicht ohne Grund ständig wechseln – sonst schreiben alle ihre Passwörter auf Zettel.)
- **Minimales Alter**: Damit niemand fünfmal schnell hintereinander wechselt, um wieder bei seinem alten Lieblingspasswort zu landen.

**Kontosperrung** ist wie bei der **Bankkarte**: Dreimal (bzw. fünfmal) die falsche PIN – Karte gesperrt. Das verhindert, dass jemand einfach alle Passwörter durchprobiert.
- **Schwelle**: Wie viele Fehlversuche sind erlaubt?
- **Sperrdauer**: Wie lange bleibt die Tür zu? (0 = erst der Admin schließt wieder auf)
- **Zurücksetzung**: Nach welcher Zeit ohne Fehler wird der Zähler wieder auf null gestellt?

**Achtung**: Ist die Sperre zu streng, kann ein Bösewicht absichtlich falsche Passwörter eingeben und so **alle** aussperren – und der Admin hat den ganzen Tag nur noch mit Entsperren zu tun.

**FGPP** sind **Sonderregeln für bestimmte Gruppen**: Die Chefs mit dem Generalschlüssel (Admins) müssen noch längere Passwörter haben als alle anderen.

## Merksatz
- Kontorichtlinien für Domänenkonten nur **an der Domäne** (Default Domain Policy).
- Sonderregeln je Gruppe → **FGPP/PSO** (kleinere Rangfolge gewinnt).
- **Zurücksetzungsdauer ≤ Sperrdauer**.
- Sperrdauer **0** = nur Admin entsperrt; Schwelle **0** = nie sperren.
- Chronik max. **24**, Mindestlänge klassisch max. **14**.

## Prüfungsfalle
- Kennwortrichtlinie an einer OU wirkt nicht auf Domänenbenutzer.
- Neue Richtlinie gilt erst bei der nächsten Kennwortänderung.
- FGPP gilt für Benutzer/globale Gruppen, **nicht für OUs**.
- Umkehrbare Verschlüsselung = unsicher.
- Minimales Kennwortalter 0 + Chronik → Chronik lässt sich umgehen.

## Grafik
### Passwort-Stärke-Meter
Eingabefeld (nur lokal, nichts gespeichert); Balken zeigt geschätzte Knackzeit; Vergleich „K@t3!“ (Sekunden) vs. lange Passphrase (Jahrhunderte).

### Sperr-Zähler
Anmeldeversuche als Pfeile auf eine Tür; Zähler steigt, bei Schwelle fällt das Schloss zu, eine Uhr zählt die Sperrdauer herunter; Zeitstrahl zeigt die Zurücksetzungsdauer.

### FGPP-Rangfolge
Ein Benutzer in zwei Gruppen mit zwei PSOs (Rangfolge 10 und 20); das PSO mit 10 leuchtet und gewinnt.

## Karteikarten
- F: Wo werden Domänen-Kennwortrichtlinien konfiguriert? | A: In einem an die Domäne verknüpften GPO (Default Domain Policy) unter Computerkonfiguration → Sicherheitseinstellungen → Kontorichtlinien.
- F: Maximale Länge der Kennwortchronik? | A: 24.
- F: Wozu dient das minimale Kennwortalter? | A: Verhindert, dass Benutzer die Chronik durch schnelle Wechsel umgehen.
- F: Was bedeutet Kontosperrdauer 0? | A: Konto bleibt gesperrt, bis ein Administrator es entsperrt.
- F: Was bedeutet Kontosperrungsschwelle 0? | A: Konto wird nie gesperrt.
- F: Regel für Zurücksetzungsdauer und Sperrdauer? | A: Zurücksetzungsdauer muss kleiner oder gleich der Sperrdauer sein.
- F: Welcher DC setzt Kontosperrungen durch? | A: Der PDC-Emulator.
- F: Was ist FGPP? | A: Fine-Grained Password Policy – abweichende Kennwortrichtlinien per PSO für Benutzer/globale Gruppen.
- F: Welches PSO gewinnt bei mehreren? | A: Das mit der kleinsten Rangfolge (Precedence); direkt zugewiesene vor Gruppen-PSOs.
- F: Warum ist eine zu strenge Kontosperrung problematisch? | A: Helpdesk-Aufwand und Denial of Service durch absichtliche Fehlversuche.
- F: Was ist Windows LAPS? | A: Automatisch rotierende, eindeutige Kennwörter für lokale Admin-Konten, gespeichert in AD/Entra.

## Quiz
? Wo muss eine Kennwortrichtlinie für Domänenbenutzer verknüpft werden?
* An der Domäne
- An der OU der Benutzer
- Am Standort
- Am Container Users

? Was bewirkt eine Kontosperrdauer von 0 Minuten?
* Das Konto muss manuell von einem Administrator entsperrt werden
- Das Konto wird nie gesperrt
- Das Konto ist sofort wieder frei
- Das Konto wird gelöscht

? Für welche Objekte kann ein Password Settings Object (FGPP) gelten?
* Benutzer und globale Sicherheitsgruppen
- Organisationseinheiten
- Computerkonten und Drucker
- Standorte

? Eine neue Mindestlänge von 14 Zeichen wurde eingestellt. Was passiert mit bestehenden 8-stelligen Kennwörtern?
* Sie bleiben gültig, bis sie das nächste Mal geändert werden
- Sie werden sofort ungültig
- Die Konten werden gesperrt
- Die Kennwörter werden automatisch verlängert

? Welche Einstellung verhindert das schnelle Durchwechseln zum alten Kennwort?
* Minimales Kennwortalter zusammen mit der Kennwortchronik
- Maximales Kennwortalter
- Umkehrbare Verschlüsselung
- Kontosperrungsschwelle

? Welche Einstellung legt fest, nach wie vielen Fehlversuchen ein Konto gesperrt wird?
* Kontosperrungsschwelle
- Kontosperrdauer
- Zurücksetzungsdauer des Kontosperrungszählers
- Minimales Kennwortalter
! Dauer und Zurücksetzungszeitraum ergänzen die Schwelle.

? Was bewirkt die Einstellung „Kennwort muss Komplexitätsvoraussetzungen entsprechen“?
* Kennwörter müssen Zeichen aus mindestens drei von vier Zeichenkategorien enthalten und dürfen den Kontonamen nicht enthalten.
- Kennwörter müssen mindestens 20 Zeichen lang sein.
- Kennwörter müssen täglich geändert werden.
- Kennwörter werden verschlüsselt gespeichert.
! Kategorien: Großbuchstaben, Kleinbuchstaben, Ziffern, Sonderzeichen.

? Mit welchem Werkzeug legt man eine Fine-Grained Password Policy (PSO) grafisch an?
* Active Directory-Verwaltungscenter
- Gruppenrichtlinienverwaltung
- Server-Manager → Rollen
- Registrierungs-Editor
! Alternativ per New-ADFineGrainedPasswordPolicy.
