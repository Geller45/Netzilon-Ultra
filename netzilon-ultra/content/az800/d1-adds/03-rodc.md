---
id: az800-rodc
bereich: AZ-800
block: A7
kapitel: AD DS on-premises & Cloud
titel: Schreibgeschützte Domänencontroller (RODC)
stufe: Fortgeschritten
quellen: [Identitätsmanagement_mit_Windows_Server_2016_70-742.pdf, AZ-800 Study Guide]
verweise: [az800-adds-dc, ap1-a6-adds, az801-rodc-sicherheit, az800-standorte-replikation]
---

## Profi

### Zweck
Ein **RODC** (Read-Only Domain Controller, seit Server 2008) ist für Standorte mit **geringer physischer Sicherheit** oder **wenig IT-Personal** gedacht (Filiale, Lager, Werk, DMZ). Er beschleunigt dort die Anmeldung, ohne das Risiko eines vollwertigen DCs.

### Eigenschaften
- **Schreibgeschützte** Kopie der AD-Datenbank und des SYSVOL – Änderungen werden an einen **beschreibbaren DC** weitergeleitet (Referral) bzw. dort durchgeführt; der RODC repliziert nur **eingehend** (unidirektional).
- **Keine Kennwörter** standardmäßig: Geheimnisse werden nur für Konten zwischengespeichert, die die **Password Replication Policy (PRP)** erlaubt. Wird der RODC gestohlen, sind nur diese Konten betroffen.
- Eigenes **krbtgt-Konto** (`krbtgt_xxxxx`) → Tickets des RODC sind von denen der RWDCs getrennt; bei Kompromittierung nur dieses Konto zurücksetzen.
- **Gefilterte Attributgruppe** (Filtered Attribute Set): vertrauliche Anwendungsattribute werden nicht auf RODCs repliziert.
- **Schreibgeschützes DNS**: eigene Zonenkopie; Clientregistrierungen werden an einen beschreibbaren DNS-Server verwiesen.
- **Administratorrollentrennung**: Ein normaler Benutzer (z. B. Filial-IT) kann **lokaler Administrator nur des RODC** werden – ohne Domänen-Admin-Rechte (Treiber, Updates, Neustarts).

### Password Replication Policy
| Liste | Bedeutung |
|---|---|
| **Zugelassene RODC-Kennwortreplikationsgruppe** (Allowed) | Kennwörter der Mitglieder **dürfen** zwischengespeichert werden – z. B. Filialbenutzer und deren Computer |
| **Abgelehnte RODC-Kennwortreplikationsgruppe** (Denied) | **niemals** (standardmäßig u. a. Domänen-Admins, Organisations-Admins, Schema-Admins, Administratoren, Sicherungs-/Server-/Konten-Operatoren, krbtgt) – **Verweigern hat Vorrang** |
Pro RODC gibt es zusätzlich eigene Listen („Zulassen“/„Verweigern“) in dessen Eigenschaften → **Kennwortreplikationsrichtlinie**. Unter **Erweitert** sieht man, **welche Konten gespeichert sind** und welche sich angemeldet haben – ideal nach einem Diebstahl. Konten lassen sich **vorab befüllen** („Kennwörter vorab auffüllen“), damit die Anmeldung auch bei WAN-Ausfall klappt.

### Voraussetzungen und Installation
- Mindestens ein **beschreibbarer DC** (Server 2008+) in der Domäne erreichbar; Gesamtstrukturfunktionsebene ≥ 2003; früher `adprep /rodcprep` (heute automatisch).
- **Zweistufige Installation** (Staging) für Delegation:
  1. Ein Domänen-Admin **erstellt das RODC-Konto vorab** in AD (`Active Directory-Benutzer und -Computer → Domain Controllers → Rechtsklick → Konto für schreibgeschützten Domänencontroller vorab erstellen`) und legt fest: Name, Standort, DNS/GC, **delegierter Administrator** (Benutzer/Gruppe), PRP.
  2. Die delegierte Person installiert am Filialserver die Rolle und stuft ihn heraus mit **„An vorhandenes Konto anfügen“** – **ohne Domänen-Admin-Rechte**.
- Alternativ direkt: Heraufstufung mit Haken **„Schreibgeschützter Domänencontroller (RODC)“**.

### Nach einem Diebstahl
1. RODC-Computerkonto in AD **löschen** → Dialog: „**Kennwörter aller Benutzerkonten zurücksetzen, die auf diesem RODC gespeichert waren**“ und Liste exportieren.
2. Betroffene Benutzer informieren, Computerkonten zurücksetzen.
3. Standort neu versorgen.

## Lab
**Maschinen**: DC01 (RWDC), RODC01 (Server Core, Standort „Filiale“), Benutzer **adm-filiale** (kein Domänen-Admin), Gruppe **GG-Filiale**.

### GUI
1. **DC01**: `dssite.msc` → Standort **Filiale** + Subnetz 192.168.20.0/24 (falls nicht vorhanden).
2. **DC01**: `dsa.msc` → Rechtsklick **Domain Controllers** → **Konto für schreibgeschützten Domänencontroller vorab erstellen** → Name **RODC01** → Standort Filiale → DNS + GC → **Delegierung**: `adm-filiale` → Fertig stellen.
3. **DC01**: RODC01 → Eigenschaften → **Kennwortreplikationsrichtlinie** → Hinzufügen → **GG-Filiale** → **Zulassen**.
4. **RODC01** (als lokaler Admin; Anmeldedaten von adm-filiale bei der Heraufstufung): Rolle AD DS → Heraufstufen → „DC zu vorhandener Domäne hinzufügen“ → Anmeldung **adm-filiale** → Hinweis „vorab erstelltes Konto gefunden“ → **An vorhandenes Konto anfügen** → Installieren.
5. **Filial-Client**: Benutzer aus GG-Filiale meldet sich an.
6. **DC01**: RODC01 → Kennwortreplikationsrichtlinie → **Erweitert** → „Konten, deren Kennwörter auf diesem RODC gespeichert sind“ → Benutzer sichtbar; Domänen-Admin **nicht**.

### PowerShell
```powershell
# Auf DC01 – RODC-Konto vorab erstellen und PRP
Add-ADDSReadOnlyDomainControllerAccount -DomainControllerAccountName RODC01 -DomainName contoso.local `
  -SiteName "Filiale" -DelegatedAdministratorAccountName "CONTOSO\adm-filiale" -InstallDns
Add-ADDomainControllerPasswordReplicationPolicy -Identity RODC01 -AllowedList "GG-Filiale"
Get-ADDomainControllerPasswordReplicationPolicy -Identity RODC01 -Allowed
Get-ADDomainControllerPasswordReplicationPolicyUsage -Identity RODC01 -RevealedAccounts

# Auf RODC01 – an das vorab erstellte Konto anfügen (als adm-filiale)
Install-WindowsFeature AD-Domain-Services -IncludeManagementTools
Install-ADDSDomainController -DomainName contoso.local -UseExistingAccount -Credential (Get-Credential CONTOSO\adm-filiale) `
  -SafeModeAdministratorPassword (Read-Host -AsSecureString) -Force

# Kennwörter vorab befüllen
repadmin /rodcpwdrepl RODC01 DC01 "CN=Anna Meier,OU=Filiale,DC=contoso,DC=local"
```

## Einfach

Ein normaler DC ist wie die **Hauptfiliale einer Bank mit Tresor**: Dort liegen alle Schlüssel (Kennwörter), und man darf alles ändern.

Ein **RODC** ist wie ein **Geldautomat in einer kleinen Filiale** auf dem Land:
- Er kann Auskunft geben und Leute schnell „reinlassen“ (Anmeldung), ohne jedes Mal die Zentrale anzurufen.
- Aber er kann **nichts ändern** – Änderungen macht nur die Zentrale.
- Und im Automaten liegen **nur die Schlüssel der Leute, die in dieser Filiale arbeiten** (Password Replication Policy). Die **Chef-Schlüssel** (Domänen-Admins) sind **nie** drin.

Wird der Automat **geklaut**, ist der Schaden klein: Man sieht genau nach, **welche Schlüssel drin waren**, und tauscht nur diese aus.

**Delegierte Installation**: Der Filialleiter darf den Automaten aufbauen und warten, ist aber **kein** Bankdirektor. Die Zentrale bereitet vorher alles vor („Hier kommt ein Automat hin, und Herr X darf ihn aufstellen“), und Herr X muss vor Ort nur noch einstecken.

## Merksatz
- RODC = **nur lesen**, **nur eingehende** Replikation.
- Kennwörter nur laut **PRP** – **Verweigern gewinnt**, Admins nie.
- **Eigenes krbtgt** pro RODC.
- **Vorab erstellen** → delegierter Admin **fügt an**.
- Diebstahl: Konto löschen + **gespeicherte Kennwörter zurücksetzen**.

## Prüfungsfalle
- Ein RODC braucht einen erreichbaren **beschreibbaren** DC.
- Domänen-Admins stehen standardmäßig in der **abgelehnten** Gruppe.
- Delegierter RODC-Admin ≠ Domänen-Admin.
- Ohne vorab gespeicherte Kennwörter keine Anmeldung bei WAN-Ausfall.
- RODC-DNS nimmt keine dynamischen Updates an (Weiterleitung an beschreibbaren DNS).

## Grafik
### Zentrale und Filial-Automat
Zentrale (RWDC) mit großem Tresor; Filiale (RODC) mit kleinem Schließfach, in dem nur die Filial-Schlüssel liegen; Pfeil nur von der Zentrale zur Filiale (Replikation eingehend).

### Diebstahl-Szenario
Der RODC verschwindet (Dieb); die Zentrale zeigt die Liste der gespeicherten Konten; Knopf „Kennwörter zurücksetzen“ macht alle gestohlenen Schlüssel wertlos.

### Zwei-Stufen-Installation
Stufe 1: Domänen-Admin legt ein leeres Konto-Formular an; Stufe 2: Filial-Admin steckt den Server an und das Formular wird ausgefüllt.

## Karteikarten
- F: Wofür ist ein RODC gedacht? | A: Standorte mit geringer physischer Sicherheit/wenig IT-Personal (Filialen).
- F: In welche Richtung repliziert ein RODC? | A: Nur eingehend (unidirektional).
- F: Was ist die Password Replication Policy? | A: Legt fest, welche Kennwörter ein RODC zwischenspeichern darf (zugelassen/abgelehnt).
- F: Welche Konten stehen standardmäßig in der abgelehnten Gruppe? | A: U. a. Domänen-, Organisations-, Schema-Admins, Administratoren, Operatoren, krbtgt.
- F: Was ist die Administratorrollentrennung? | A: Ein Nicht-Domänen-Admin kann lokaler Admin eines RODC werden.
- F: Zwei Schritte der gestaffelten RODC-Installation? | A: 1. Konto vorab erstellen (Domänen-Admin). 2. Delegierter Admin fügt den Server an das Konto an.
- F: Was tun nach dem Diebstahl eines RODC? | A: Computerkonto löschen und Kennwörter aller dort gespeicherten Konten zurücksetzen.
- F: Warum hat jeder RODC ein eigenes krbtgt-Konto? | A: Kerberos-Tickets sind isoliert – Kompromittierung betrifft nicht die RWDCs.
- F: Wie erreicht man Anmeldung bei WAN-Ausfall am RODC? | A: Kennwörter der Filialkonten vorab auffüllen.

## Quiz
? Welche Konten werden auf einem RODC standardmäßig NICHT zwischengespeichert?
* Mitglieder der Domänen-Admins
- Mitglieder der zugelassenen RODC-Kennwortreplikationsgruppe
- Filialbenutzer in der Allowed-Liste
- Computerkonten der Filiale, wenn sie zugelassen sind

? Eine Filialmitarbeiterin ohne Domänen-Admin-Rechte soll einen RODC installieren. Was ist vorher nötig?
* Ein Domänen-Admin erstellt das RODC-Konto vorab und delegiert sie
- Sie muss Schema-Admin werden
- Der RODC muss in Azure installiert werden
- Nichts, jeder Benutzer darf DCs installieren

? Was ist nach dem Diebstahl eines RODC zu tun?
* RODC-Konto löschen und die gespeicherten Kennwörter zurücksetzen
- Den PDC-Emulator neu starten
- Alle DNS-Zonen löschen
- Nichts, RODCs speichern keine Daten

? In welche Richtung repliziert ein RODC?
* Nur eingehend von einem beschreibbaren DC
- Nur ausgehend zu allen DCs
- Bidirektional
- Gar nicht

? Welche Einstellung hat Vorrang, wenn ein Benutzer in der zugelassenen und der abgelehnten Liste steht?
* Die abgelehnte (Verweigern)
- Die zugelassene
- Die zuletzt eingetragene
- Die des globalen Katalogs

? Welche Funktion bietet ein RODC für lokale Administratoren?
* Administratorrollentrennung – ein Nicht-Domänen-Admin kann den RODC lokal verwalten
- Vollständiger Schreibzugriff auf das AD
- Übernahme aller FSMO-Rollen
- Verwaltung der Gesamtstruktur
! Delegierte lokale Administration ohne Domänenrechte.

? Welche Gruppe enthält standardmäßig die Konten, deren Kennwörter auf RODCs zwischengespeichert werden dürfen?
* Zulässige RODC-Kennwortreplikationsgruppe
- Domänen-Admins
- Organisations-Admins
- Protected Users
! Abgelehnte Gruppe hat Vorrang.

? Welche DNS-Zone stellt ein RODC bereit?
* Eine schreibgeschützte Kopie der AD-integrierten Zone
- Eine primäre beschreibbare Zone
- Keine DNS-Funktion möglich
- Nur Stubzonen
! Dynamische Updates werden an einen beschreibbaren DC verwiesen.
