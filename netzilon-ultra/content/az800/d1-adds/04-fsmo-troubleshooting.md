---
id: az800-fsmo
bereich: AZ-800
block: A7
kapitel: AD DS on-premises & Cloud
titel: FSMO-Rollen verwalten, verschieben und übernehmen
stufe: Profi
quellen: [Identitätsmanagement_mit_Windows_Server_2016_70-742.pdf, AZ-800 Study Guide]
verweise: [ap1-a6-adds, az800-adds-dc, az801-ad-replikation, ap1-a6-kerberos]
---

## Profi

### Die fünf Rollen – Auswirkungen bei Ausfall
| Rolle | Ebene | Symptome, wenn der Rolleninhaber ausfällt | Dringlichkeit |
|---|---|---|---|
| **Schemamaster** | Gesamtstruktur | Schemaerweiterungen (Exchange, neue DC-Version, LAPS) scheitern | gering – nur bei Schemaänderung |
| **Domänennamenmaster** | Gesamtstruktur | keine Domänen/Anwendungspartitionen hinzufügen/entfernen | gering |
| **RID-Master** | Domäne | DCs können keine neuen **RID-Pools** holen → sobald ein DC seinen Pool (500 RIDs) aufgebraucht hat, können **keine neuen Sicherheitsprinzipale** (Benutzer, Gruppen, Computer) angelegt werden | mittel |
| **PDC-Emulator** | Domäne | **Zeitsynchronisation** gestört (→ Kerberos-Fehler), Kontosperrungen/Kennwortänderungen verzögert, GPO-Bearbeitung zielt standardmäßig auf den PDC, DFS-Namespace-Probleme | **hoch** – schnell handeln |
| **Infrastrukturmaster** | Domäne | domänenübergreifende Gruppenmitgliedschaften (Phantom-Objekte) werden nicht aktualisiert | gering (irrelevant, wenn alle DCs GC sind oder nur eine Domäne) |

### Platzierung (Best Practice)
- In kleinen Umgebungen dürfen alle Rollen auf **einem** gut gesicherten DC liegen.
- **PDC-Emulator** auf den **leistungsstärksten, zuverlässigsten** DC; der PDC-Emulator der **Stammdomäne** synchronisiert mit einer **externen NTP-Quelle**.
- **Schemamaster + Domänennamenmaster** zusammen auf einen DC der Stammdomäne (idealerweise GC).
- **RID-Master + PDC-Emulator** meist zusammen.
- **Infrastrukturmaster** nicht auf einem GC, außer **alle** DCs der Domäne sind GC.
- Rollen **vor** Wartung/Herabstufung eines DCs **verschieben** (Herabstufung verschiebt sie sonst automatisch an einen beliebigen DC).

### Rolleninhaber ermitteln
- `netdom query fsmo`
- `Get-ADDomain | Select PDCEmulator, RIDMaster, InfrastructureMaster`
- `Get-ADForest | Select SchemaMaster, DomainNamingMaster`
- GUI: **AD-Benutzer und -Computer** → Rechtsklick Domäne → **Betriebsmaster** (RID, PDC, Infrastruktur); **AD-Domänen und -Vertrauensstellungen** → Betriebsmaster (Domänennamen); **AD-Schema**-Snap-In (vorher `regsvr32 schmmgmt.dll`) → Betriebsmaster (Schema).

### Übertragen (Transfer) vs. Übernehmen (Seize)
| | **Übertragen** | **Übernehmen (Seize)** |
|---|---|---|
| Wann | alter Rolleninhaber ist **online** | alter Rolleninhaber ist **dauerhaft ausgefallen** |
| Ablauf | geordnete Übergabe, beide DCs synchronisieren sich | neuer DC reißt die Rolle an sich, **ohne** Rücksprache |
| Folge | sauber | alter DC darf **nie wieder** ans Netz (sonst doppelte Rolleninhaber, z. B. doppelte RIDs) → **Neuinstallation** + Metadatenbereinigung |
PowerShell: `Move-ADDirectoryServerOperationMasterRole -Identity DC02 -OperationMasterRole PDCEmulator,RIDMaster` – mit **`-Force`** wird übernommen (Seize), falls die Übertragung nicht möglich ist. Alternativ `ntdsutil` → `roles` → `connections` → `connect to server DC02` → `transfer pdc` bzw. `seize pdc`.

Rollenbezeichnungen für das Cmdlet: `SchemaMaster`, `DomainNamingMaster`, `RIDMaster`, `PDCEmulator`, `InfrastructureMaster` (oder 0–4).

### Typische Troubleshooting-Szenarien
1. **„Neue Benutzer können nicht angelegt werden“** (Fehler zu RID-Pool) → RID-Master erreichbar? `dcdiag /test:ridmanager /v`, `repadmin /showrepl`.
2. **Zeitfehler, Kerberos-Anmeldung schlägt fehl** → PDC-Emulator online? Zeitquelle: `w32tm /query /source`, `w32tm /monitor`, PDC der Stammdomäne mit externem NTP konfigurieren.
3. **Schemaerweiterung scheitert** → Schemamaster online, Mitglied **Schema-Admins**, Replikation ok?
4. **Rolleninhaber verweist auf gelöschten DC** („ERROR“/„deleted object“) → Rolle per Seize übernehmen, Metadaten bereinigen.
5. Nach Seize: **RID-Pool** des neuen RID-Masters um 10.000 erhöhen lassen (automatisch bei Seize ab 2012 R2 – „RID-Pool-Invalidate“), um Duplikate zu vermeiden.
Werkzeuge: `dcdiag /test:fsmocheck`, `dcdiag /test:knowsofroleholders`, `repadmin /replsummary`.

## Lab
**Maschinen**: DC01 (hält alle Rollen), DC02 (zusätzlicher DC).

### GUI
1. **DC01**: `netdom query fsmo` → alle Rollen auf DC01.
2. **DC01**: `dsa.msc` → Rechtsklick **Domäne** → **Ändern des Domänencontrollers** → DC02 → Rechtsklick Domäne → **Betriebsmaster** → Registerkarte **PDC** → **Ändern** → bestätigen.
3. Registerkarte **RID** → Ändern.
4. `domain.msc` (AD-Domänen und -Vertrauensstellungen) → verbinden mit DC02 → Rechtsklick → **Betriebsmaster** → Ändern (Domänennamenmaster).
5. `regsvr32 schmmgmt.dll` → `mmc` → Snap-In **Active Directory-Schema** → Rechtsklick → Domänencontroller ändern → DC02 → Rechtsklick → **Betriebsmaster** → Ändern.
6. **DC02**: `netdom query fsmo` → Kontrolle.
7. **Seize-Simulation (nur Lab!)**: DC02 herunterfahren → **DC01**: Rollen per PowerShell mit `-Force` übernehmen → DC02 danach **nicht** wieder starten, sondern Metadaten bereinigen (DC02-Objekt in `dsa.msc`/`dssite.msc` löschen, „DC ist dauerhaft offline“).

### PowerShell
```powershell
# Auf DC01 – Übersicht
netdom query fsmo
Get-ADDomain | Select-Object PDCEmulator, RIDMaster, InfrastructureMaster
Get-ADForest | Select-Object SchemaMaster, DomainNamingMaster

# Übertragen (DC02 online)
Move-ADDirectoryServerOperationMasterRole -Identity DC02 -OperationMasterRole PDCEmulator, RIDMaster, InfrastructureMaster, SchemaMaster, DomainNamingMaster -Confirm:$false

# Übernehmen (Seize) – DC02 dauerhaft ausgefallen, auf DC01 ausführen
Move-ADDirectoryServerOperationMasterRole -Identity DC01 -OperationMasterRole 0,1,2,3,4 -Force -Confirm:$false

# Diagnose
dcdiag /test:fsmocheck
dcdiag /test:ridmanager /v
w32tm /query /source
w32tm /config /manualpeerlist:"ptbtime1.ptb.de" /syncfromflags:manual /reliable:yes /update   # auf dem PDC der Stammdomäne

# Metadatenbereinigung (Beispiel)
Get-ADDomainController -Identity DC02 -ErrorAction SilentlyContinue
# GUI: DC-Objekt löschen oder ntdsutil "metadata cleanup"
```

## Einfach

In jedem Einwohnermeldeamt-Verbund gibt es **fünf Sonderaufgaben**, die nur **einer** machen darf (wie Klassensprecher-Ämter):
- **Schemamaster** = der, der das **Formular-Design** ändern darf („Neues Feld: Lieblingsfarbe“).
- **Domänennamenmaster** = der, der **neue Stadtteile** gründen darf.
- **RID-Master** = der **Nummernverteiler**: Er gibt jedem Amt einen Block Ausweisnummern. Ist er weg, kann bald keiner mehr neue Ausweise ausstellen.
- **PDC-Emulator** = die **offizielle Uhr** und die **Sperr-Stelle** für Passwörter. Ist er weg, laufen die Uhren auseinander – und bei Kerberos fliegt jeder raus, dessen Uhr mehr als 5 Minuten falsch geht. **Deshalb am dringendsten!**
- **Infrastrukturmaster** = der **Karteipfleger** für Leute aus anderen Stadtteilen.

**Übertragen** = geordnete **Amtsübergabe**: Der alte Klassensprecher ist da und gibt das Amt ab.
**Übernehmen (Seize)** = der alte ist **für immer weg** (Server kaputt), also reißt jemand das Amt an sich. **Wichtig**: Der Alte darf **nie wieder** zurückkommen – sonst gibt es zwei Klassensprecher, die sich streiten (z. B. doppelte Ausweisnummern).

## Merksatz
- **PDC-Ausfall = sofort handeln** (Zeit, Kerberos, Sperren).
- **RID-Ausfall** = bald keine neuen Objekte.
- **Transfer** wenn online, **Seize** (`-Force`) wenn tot – danach alten DC **nie** wieder starten.
- Infrastrukturmaster **nicht auf GC**, außer alle DCs sind GC.
- `netdom query fsmo` zeigt alle fünf.

## Prüfungsfalle
- Seize bei online erreichbarem Rolleninhaber statt Transfer.
- Alten DC nach Seize wieder ans Netz genommen.
- Schemamaster im Snap-In erst nach `regsvr32 schmmgmt.dll` sichtbar.
- Zeitprobleme im Forest → PDC der **Stammdomäne** prüfen.
- Rollen einer Domäne (RID/PDC/Infrastruktur) können nicht in eine andere Domäne verschoben werden.

## Grafik
### Fünf Kronen
Fünf Kronen auf DC01; Drag & Drop einer Krone auf DC02 = Transfer (freundlicher Handschlag); DC01 explodiert, DC02 reißt die Kronen an sich = Seize (Warnschild „DC01 nie wieder starten“).

### Ausfall-Simulator
Schalter pro Rolle „offline“; Anzeige, welche Funktionen ausfallen (z. B. Uhrensymbol rot bei PDC, Benutzer-anlegen-Knopf grau bei RID nach Poolverbrauch).

## Karteikarten
- F: Welche FSMO-Rolle ist bei Ausfall am dringendsten? | A: PDC-Emulator (Zeit, Kerberos, Kontosperrungen, Kennwortänderungen).
- F: Folge eines RID-Master-Ausfalls? | A: Sobald ein DC seinen RID-Pool verbraucht hat, können keine neuen Sicherheitsprinzipale angelegt werden.
- F: Befehl zum Anzeigen aller FSMO-Rolleninhaber? | A: netdom query fsmo
- F: Unterschied Übertragen und Übernehmen? | A: Übertragen: alter Inhaber online, geordnet. Übernehmen: alter Inhaber dauerhaft ausgefallen, ohne Rücksprache.
- F: PowerShell zum Übernehmen einer Rolle? | A: Move-ADDirectoryServerOperationMasterRole … -Force
- F: Was ist nach einem Seize mit dem alten DC zu tun? | A: Nie wieder ans Netz; neu installieren und Metadaten bereinigen.
- F: Wo wird der Schemamaster in der GUI verwaltet? | A: Active Directory-Schema-Snap-In (nach regsvr32 schmmgmt.dll).
- F: Wo wird der Domänennamenmaster verwaltet? | A: Active Directory-Domänen und -Vertrauensstellungen.
- F: Warum sollte der Infrastrukturmaster nicht auf einem GC liegen? | A: Er erkennt dort veraltete domänenübergreifende Verweise nicht – außer alle DCs sind GC.

## Quiz
? Mehrere Clients melden Kerberos-Fehler wegen Zeitabweichung. Welcher Rolleninhaber ist zuerst zu prüfen?
* PDC-Emulator
- Schemamaster
- Domänennamenmaster
- Infrastrukturmaster

? Der DC mit der RID-Master-Rolle ist abgestürzt und wird nicht repariert. Was tun?
* Die Rolle auf einem anderen DC übernehmen (Seize) und den alten DC nie wieder starten
- Die Rolle übertragen, sobald er wieder hochfährt
- Nichts, RID-Master ist unwichtig
- Den Schemamaster neu installieren

? Welches Werkzeug verwaltet den Domänennamenmaster?
* Active Directory-Domänen und -Vertrauensstellungen
- Active Directory-Benutzer und -Computer
- DNS-Manager
- Gruppenrichtlinienverwaltung

? Welcher Parameter erzwingt das Übernehmen einer Rolle mit Move-ADDirectoryServerOperationMasterRole?
* -Force
- -Seize
- -WhatIf
- -Transfer

? Welche Rolle existiert nur einmal pro Gesamtstruktur?
* Domänennamenmaster
- PDC-Emulator
- RID-Master
- Infrastrukturmaster

? Welche FSMO-Rolle vergibt Pools relativer IDs an DCs?
* RID-Master
- PDC-Emulator
- Infrastrukturmaster
- Schemamaster
! Ohne RID-Master können DCs nach Aufbrauchen ihres Pools keine neuen Objekte anlegen.

? Mit welchem Befehl zeigt man alle FSMO-Rolleninhaber an?
* netdom query fsmo
- dcdiag /fsmo
- gpresult /fsmo
- ipconfig /fsmo
! Alternativ Get-ADDomain und Get-ADForest.

? Was darf ein DC nach einer erzwungenen Übernahme der RID-Master-Rolle nicht tun?
* Wieder online gehen, ohne zuvor bereinigt bzw. neu installiert zu werden
- Weiterhin DNS anbieten
- Neue Updates installieren
- Gruppenrichtlinien anwenden
! Sonst drohen doppelte RIDs; Metadaten bereinigen und den alten DC nicht zurückbringen.
