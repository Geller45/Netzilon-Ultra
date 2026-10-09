---
id: az800-gmsa
bereich: AZ-800
block: A7
kapitel: AD DS on-premises & Cloud
titel: Dienstkonten – gMSA, sMSA und dMSA
stufe: Profi
quellen: [Identitätsmanagement_mit_Windows_Server_2016_70-742.pdf, AZ-800 Study Guide]
verweise: [ap1-a6-kerberos, ap1-a6-adds, az800-windows-container]
---

## Profi

### Das Problem mit klassischen Dienstkonten
Dienste (IIS-App-Pools, SQL Server, geplante Tasks, Backup-Software) laufen oft unter einem **normalen Benutzerkonto** („svc-sql“) mit **Kennwort, das nie abläuft** und das mehrere Admins kennen. Probleme: Kennwort wird nie geändert, steht in Dokus/Skripten, Konto hat oft zu viele Rechte, **Kerberoasting**-Angriffe (Offline-Knacken schwacher Dienstkonto-Kennwörter über ihre SPNs), SPN-Pflege manuell.

### Verwaltete Dienstkonten – die Lösung
| Typ | Seit | Nutzbar auf | Eigenschaften |
|---|---|---|---|
| **sMSA** (Standalone Managed Service Account) | 2008 R2 | **einem** Computer | automatische Kennwortänderung, vereinfachte SPN-Verwaltung |
| **gMSA** (Group Managed Service Account) | 2012 | **mehreren** Computern (Farm, Cluster, NLB) | wie sMSA, Kennwort wird vom **Key Distribution Service (KDS)** auf den DCs berechnet und von berechtigten Hosts abgerufen |
| **dMSA** (Delegated MSA) | **Server 2025** | Migration | ersetzt ein bestehendes klassisches Dienstkonto, übernimmt dessen Berechtigungen, alte Kennwortnutzung wird unterbunden; an Maschinenidentität gebunden |

**gMSA-Eigenschaften**
- Kennwort: **240 Byte** zufällig, **automatischer Wechsel** (Standard alle **30 Tage**, `ManagedPasswordIntervalInDays` – nur bei Erstellung festlegbar).
- **Niemand** kennt das Kennwort; nur die in `PrincipalsAllowedToRetrieveManagedPassword` eingetragenen **Computer(gruppen)** dürfen es abrufen.
- Kann **nicht interaktiv** angemeldet werden.
- Name endet mit **$** (`gmsa-web$`) und liegt im Container **Managed Service Accounts**.
- Unterstützt Dienste, IIS-App-Pools, geplante Aufgaben, SQL Server, **Windows-Container** (Identität von Containern gegenüber AD, per Credential Spec).

### Voraussetzungen
1. Domänenfunktionsebene/DCs ≥ **Server 2012** (Schema).
2. **KDS-Stammschlüssel** einmalig pro Gesamtstruktur erstellen: `Add-KdsRootKey -EffectiveImmediately` – wirkt erst nach **10 Stunden** (Replikationssicherheit). Im **Lab** sofort: `Add-KdsRootKey -EffectiveTime ((Get-Date).AddHours(-10))`.
3. AD-PowerShell-Modul auf dem Zielhost (`RSAT-AD-PowerShell`) für die Installation/den Test.

### Ablauf
1. KDS-Stammschlüssel (einmalig).
2. **Sicherheitsgruppe** für die berechtigten Server anlegen (z. B. `GG-Webserver`), Server aufnehmen, **Server neu starten** (neue Gruppenmitgliedschaft im Computer-Token).
3. gMSA erstellen: `New-ADServiceAccount -Name gmsa-web -DNSHostName gmsa-web.contoso.local -PrincipalsAllowedToRetrieveManagedPassword GG-Webserver`
4. Auf **jedem** Server: `Install-ADServiceAccount gmsa-web` und `Test-ADServiceAccount gmsa-web` (→ True).
5. Dienst/App-Pool konfigurieren: Anmelden als `CONTOSO\gmsa-web$`, **Kennwortfeld leer lassen**.
6. Benötigte Rechte vergeben (z. B. „Als Dienst anmelden“ – wird von services.msc automatisch gesetzt; NTFS, SQL-Logins); SPNs setzen, falls nötig (`setspn` oder `-ServicePrincipalNames`).

### Fehlersuche
- `Test-ADServiceAccount` = False → Host nicht in der berechtigten Gruppe bzw. **nicht neu gestartet**, kein KDS-Schlüssel oder erst < 10 h alt, Replikation.
- Dienst startet nicht → Recht „Als Dienst anmelden“ fehlt, `$` am Namen vergessen, Kennwort eingetragen.
- `Get-ADServiceAccount gmsa-web -Properties PrincipalsAllowedToRetrieveManagedPassword`.

## Lab
**Maschinen**: DC01, WEB01 und WEB02 (IIS, Domänenmitglieder).

### GUI (teilweise nur per PowerShell möglich)
1. **DC01**: `dsa.msc` → OU Gruppen → globale Sicherheitsgruppe **GG-Webserver** → Mitglieder: Computer **WEB01$**, **WEB02$** → WEB01/WEB02 **neu starten**.
2. **DC01**: KDS-Schlüssel und gMSA per PowerShell (siehe unten) – es gibt dafür keinen GUI-Assistenten; das Konto erscheint danach in `dsa.msc` unter **Managed Service Accounts**.
3. **WEB01**: Server-Manager → Features → **Active Directory-Modul für Windows PowerShell** installieren → `Install-ADServiceAccount gmsa-web`.
4. **WEB01**: IIS-Manager → **Anwendungspools** → DefaultAppPool → **Erweiterte Einstellungen** → **Identität** → Benutzerdefiniertes Konto → **Festlegen** → `CONTOSO\gmsa-web$` → Kennwort **leer** → OK → App-Pool neu starten.
5. **WEB01**: `services.msc` → Beispieldienst → Anmelden → Dieses Konto `CONTOSO\gmsa-web$`, Kennwortfelder leer.
6. Aufgabenplanung: geplante Aufgabe mit gMSA per PowerShell (siehe unten).
7. WEB02: Schritte 3–4 wiederholen – beide nutzen dasselbe Konto (Webfarm).

### PowerShell
```powershell
# Auf DC01 – einmalig pro Gesamtstruktur
Add-KdsRootKey -EffectiveImmediately                              # Produktion: 10 h warten
# Lab: Add-KdsRootKey -EffectiveTime ((Get-Date).AddHours(-10))
Get-KdsRootKey

New-ADGroup GG-Webserver -GroupScope Global -Path "OU=Gruppen,OU=Schulung,DC=contoso,DC=local"
Add-ADGroupMember GG-Webserver -Members WEB01$, WEB02$
New-ADServiceAccount -Name gmsa-web -DNSHostName gmsa-web.contoso.local `
  -PrincipalsAllowedToRetrieveManagedPassword GG-Webserver -ServicePrincipalNames "HTTP/intranet.contoso.local"
Get-ADServiceAccount gmsa-web -Properties PrincipalsAllowedToRetrieveManagedPassword, ManagedPasswordIntervalInDays

# Auf WEB01 und WEB02 (nach Neustart)
Install-WindowsFeature RSAT-AD-PowerShell
Install-ADServiceAccount gmsa-web
Test-ADServiceAccount gmsa-web                                    # True

# IIS-App-Pool auf gMSA umstellen
Import-Module WebAdministration
Set-ItemProperty IIS:\AppPools\DefaultAppPool -Name processModel -Value @{userName="CONTOSO\gmsa-web$"; identityType=3}

# Dienst umstellen
sc.exe config "MeinDienst" obj= "CONTOSO\gmsa-web$" password= ""

# Geplante Aufgabe mit gMSA
$principal = New-ScheduledTaskPrincipal -UserId "CONTOSO\gmsa-web$" -LogonType Password
Register-ScheduledTask -TaskName "Log-Bereinigung" -Action (New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File C:\Skripte\clean.ps1") `
  -Trigger (New-ScheduledTaskTrigger -Daily -At 3am) -Principal $principal
```

## Einfach

Programme, die im Hintergrund laufen (Dienste), brauchen auch ein **Benutzerkonto** – so wie ein **Hausmeister-Roboter** einen Schlüssel braucht. Früher bekam der Roboter ein normales Konto mit einem Passwort, das **nie geändert** wurde und das **viele Admins kannten**. Wie ein Generalschlüssel, der seit Jahren unter der Fußmatte liegt – gefährlich!

**gMSA** ist ein **magischer Schlüssel**:
- Er **wechselt sich selbst** alle 30 Tage automatisch.
- **Kein Mensch** kennt ihn – nur die Server, die in einer bestimmten **Gruppe** stehen, dürfen ihn sich beim DC abholen.
- Mehrere Server (z. B. zwei Webserver einer Farm) können **denselben** Schlüssel benutzen.
- Man kann sich damit **nicht selbst anmelden** – er ist nur für Roboter.

**Einrichten**:
1. Einmal den **Schlüsselmacher** (KDS-Stammschlüssel) im Amt aufstellen – der braucht 10 Stunden zum Aufwärmen.
2. Eine **Gruppe** mit den erlaubten Servern bilden (danach Server neu starten!).
3. Das gMSA-Konto erstellen.
4. Auf jedem Server „installieren“ und testen.
5. Beim Dienst `Name$` eintragen und das **Passwortfeld leer lassen**.

**Neu in Server 2025**: **dMSA** – damit kann man ein altes, unsicheres Dienstkonto **nahtlos ersetzen**.

## Merksatz
- **gMSA = mehrere Server, automatisches 240-Byte-Kennwort, niemand kennt es**.
- Voraussetzung: **KDS-Stammschlüssel** (10 h Wartezeit).
- Name mit **$**, Kennwortfeld **leer**.
- `New-ADServiceAccount` → `Install-ADServiceAccount` → `Test-ADServiceAccount`.
- Berechtigte Server → **Gruppe** + **Neustart**.

## Prüfungsfalle
- sMSA nur für **einen** Computer – für Farmen gMSA.
- KDS-Stammschlüssel fehlt oder ist noch keine 10 Stunden alt.
- Server nach Gruppenaufnahme nicht neu gestartet → Test = False.
- `$` am Kontonamen vergessen.
- gMSA-Kennwortintervall kann nachträglich nicht geändert werden.

## Grafik
### Magischer Schlüssel
DC mit Schlüsselmacher (KDS); zwei Webserver in einer goldenen Gruppe holen sich denselben Schlüssel ab; der Schlüssel dreht sich alle 30 Tage und ändert seine Form; ein Admin versucht, ihn abzuschreiben – Anzeige „unbekannt“.

### Klassisch vs. gMSA
Links ein Post-it mit Passwort am Monitor (svc-Konto), rechts ein Tresor, der nur für Server-Symbole aufgeht.

## Karteikarten
- F: Unterschied sMSA und gMSA? | A: sMSA für einen Computer, gMSA für mehrere Computer (Farm/Cluster).
- F: Welche Voraussetzung braucht gMSA in der Gesamtstruktur? | A: Einen KDS-Stammschlüssel (Add-KdsRootKey).
- F: Wie lange dauert es, bis ein neuer KDS-Stammschlüssel nutzbar ist? | A: 10 Stunden (im Lab rückdatierbar).
- F: Wie oft ändert sich ein gMSA-Kennwort standardmäßig? | A: Alle 30 Tage.
- F: Wer darf das gMSA-Kennwort abrufen? | A: Die in PrincipalsAllowedToRetrieveManagedPassword eingetragenen Computer/Gruppen.
- F: Drei Cmdlets zur Einrichtung? | A: New-ADServiceAccount, Install-ADServiceAccount, Test-ADServiceAccount.
- F: Wie trägt man ein gMSA bei einem Dienst ein? | A: DOMÄNE\Name$ mit leerem Kennwortfeld.
- F: Wogegen schützen gMSAs besonders? | A: Gegen schwache/nie geänderte Dienstkonto-Kennwörter und Kerberoasting.
- F: Was ist ein dMSA? | A: Delegated Managed Service Account (Server 2025) – ersetzt ein klassisches Dienstkonto nahtlos.

## Quiz
? Zwei Webserver einer Farm sollen dasselbe Dienstkonto mit automatischem Kennwortwechsel nutzen. Was verwendet man?
* gMSA
- sMSA
- Ein Domänen-Admin-Konto
- Ein lokales Konto

? Test-ADServiceAccount liefert False, obwohl der Server zur berechtigten Gruppe hinzugefügt wurde. Wahrscheinlichste Ursache?
* Der Server wurde nach der Gruppenaufnahme nicht neu gestartet
- Das gMSA hat kein $
- Der KDS-Schlüssel ist zu alt
- IIS ist nicht installiert

? Was ist vor dem ersten gMSA in einer Gesamtstruktur nötig?
* Ein KDS-Stammschlüssel
- Ein neues Schema
- Eine Vertrauensstellung
- Ein RODC

? Wie wird das Kennwort bei einem Dienst mit gMSA eingetragen?
* Gar nicht – das Feld bleibt leer
- Das 240-Byte-Kennwort manuell kopieren
- Das Administrator-Kennwort
- Das DSRM-Kennwort

? Welche Neuerung bringt Windows Server 2025 bei Dienstkonten?
* Delegated Managed Service Accounts (dMSA)
- Die Abschaffung von gMSA
- Dienstkonten ohne Domäne
- Interaktive Anmeldung mit gMSA

? Wie oft wechselt das Kennwort eines gMSA standardmäßig?
* Alle 30 Tage automatisch
- Nie
- Täglich
- Nur manuell
! Das Kennwort ist 240 Byte lang und wird vom KDS berechnet.

? Welches Cmdlet installiert ein gMSA auf dem Zielserver?
* Install-ADServiceAccount
- New-ADUser
- Add-LocalGroupMember
- Set-Service -Credential
! Zuvor New-ADServiceAccount mit -PrincipalsAllowedToRetrieveManagedPassword.

? Woran erkennt man ein gMSA im Dienst-Anmeldefeld?
* Am angehängten $ (z. B. EXAMPLE\gmsa-web$) und leerem Kennwortfeld
- An einem Präfix svc_
- An der Endung .local
- An einem Kennwort aus 8 Zeichen
! Das Kennwort verwaltet das System.
