---
id: server-trusts-uebungen
bereich: AZ-800
pruefungen: [Schule, AP2]
fach: Windows Server / Adv.
block: S2
kapitel: Active Directory
titel: AD-Vertrauensstellungen – Domänen, Strukturen, Gesamtstrukturen (Übungen 01-01 und 01-02)
stufe: Profi
quellen: [AD-Vertrauensstellungen.pdf, Übung_AD-Vertrauensstellungen1.pdf, Übung_AD-Vertrauensstellungen2.pdf]
verweise: [az800-trusts, ap1-a6-adds, az800-multidomain-gruppen, az800-dns-weiterleitung, az801-admt, ap1-a6-kerberos]
---

## Profi

### Was ist eine Vertrauensstellung?
Eine **Vertrauensstellung** (*Trust*) ist eine Beziehung zwischen zwei Domänen, über die **Benutzer der einen Domäne Ressourcen der anderen nutzen** können. Es gibt immer eine **vertrauende Domäne** (*trusting domain* – sie besitzt die Ressourcen) und eine **vertraute Domäne** (*trusted domain* – dort liegen die Benutzerkonten). Der Pfeil im Diagramm zeigt von der vertrauenden zur vertrauten Domäne; der **Zugriff** fließt **entgegen** der Pfeilrichtung.

### Implizit und explizit
| | implizit | explizit |
|---|---|---|
| Entstehung | **automatisch** beim Hinzufügen einer Domäne oder Struktur zur Gesamtstruktur | vom **Administrator** angelegt |
| Transitivität | **transitiv** | grundsätzlich **nicht transitiv** – Ausnahme **Gesamtstruktur-VS** |
| Richtung | **bidirektional** | **konfigurierbar** (ein- oder bidirektional) |
Beispiel implizit: A vertraut B und C, B und C vertrauen A – und wegen der Transitivität vertraut auch **B der Domäne C**.

### Typen von Vertrauensstellungen (Folien)
| Typ | Entstehung | transitiv | Richtung | Einsatz |
|---|---|---|---|---|
| **Unter-/Überordnung** (Parent-Child) | implizit bei neuer **untergeordneter Domäne** | ja | bidirektional | canberra.example.com ↔ example.com |
| **Strukturstamm** (Tree-Root) | implizit bei neuer **Struktur** (Tree) | ja | bidirektional | wingtiptoys.com ↔ example.com |
| **Shortcut** (verknüpft) | explizit, **innerhalb einer Gesamtstruktur** | nein | uni/bi | verkürzt Anmeldepfade |
| **Extern** | explizit, zwischen **zwei Domänen verschiedener Gesamtstrukturen** | nein | uni/bi | einzelne Domäne, NT-Altdomäne, Migration |
| **Gesamtstruktur** (Forest) | explizit, zwischen zwei **Stammdomänen** unabhängiger Gesamtstrukturen (Funktionsebene ≥ 2003) | **ja** (zwischen allen Domänen beider Forests, aber nicht zu einem dritten Forest) | uni/bi | Fusion, Partnerfirmen |
| **Bereich** (Realm) | explizit zu einem **Kerberos-V5-Bereich** (z. B. Linux/MIT) | konfigurierbar | konfigurierbar | Unix-Integration |

### Anmeldung innerhalb einer Gesamtstruktur
1. Benutzer will auf ein Objekt in einer anderen Domäne zugreifen.
2. Er authentifiziert sich an seinem **eigenen DC** (Kerberos-TGT).
3. Kann dieser kein Dienstticket für die Zieldomäne ausstellen, verweist er (**Referral**) an die **übergeordnete Domäne** – das kann sich über alle Ebenen bis zur Stammdomäne fortsetzen.
4. Der **DC der Zieldomäne** stellt das **Dienstticket** aus.
Ohne Shortcut läuft eine Anmeldung aus Domäne C auf Objekte der Domäne E z. B. über die DCs von **B, A und D**. Eine **Shortcut-VS C↔E** spart diese Umwege → kürzere Anmeldezeit, weniger WAN-Verkehr.

### Anmeldung zwischen zwei Gesamtstrukturen (9 Schritte aus den Folien)
1. Benutzer verbindet sich mit dem **KDC seiner Domäne** (vancouver.nwtraders.msft) und fordert ein Dienstticket für eine Ressource in seattle.contoso.msft an.
2. Der DC fragt den **globalen Katalog (GC)**: Die Ressource liegt in einer anderen Gesamtstruktur; der GC findet das **Vertrauensstellungsobjekt über das Namenssuffix**.
3. Der DC sendet einen Verweis auf den übergeordneten DC (Stammdomäne nwtraders.msft).
4. Anfrage an einen DC in nwtraders.msft nach einem DC für contoso.msft.
5. Mit diesem Verweis Anfrage an einen DC der Stammdomäne contoso.msft – Anforderung eines Diensttickets.
6. Die Ressource liegt nicht in dieser Domäne → Anfrage an den GC von contoso.msft.
7. Verweis an einen DC in seattle.contoso.msft.
8. Verbindung zum KDC dieses DC – Anforderung des Diensttickets.
9. Das Dienstticket wird an den Server gesendet, der die Ressource beherbergt.

### Voraussetzung: Namensauflösung
Wie beim Domänenbeitritt muss **DNS** funktionieren, denn beim Anlegen werden die zuständigen DNS-Server/DCs gesucht. Für Gesamtstruktur- und externe VS richtet man **Stubzonen** oder **bedingte Weiterleitungen** ein (AD-integriert, Replikation auf alle DNS-Server der Gesamtstruktur). Danach: **Active Directory-Domänen und -Vertrauensstellungen** → Eigenschaften der Domäne → **Vertrauensstellungen** → **Neue Vertrauensstellung**.

### Namenssuffixrouting
Bei einer Gesamtstruktur-VS vertrauen sich **alle Domänen beider Gesamtstrukturen**, und standardmäßig werden **alle Namenssuffixe** (Domänennamen, UPN-Suffixe) zur Anmeldung **geroutet**. In den Eigenschaften der VS → **Namenssuffixrouting** kann man einzelne Suffixe aktivieren/deaktivieren (z. B. ein später hinzugefügter Tree wie wingtiptoys.com muss erst aktiviert werden). **Alternative UPN-Suffixe** (z. B. example.internal) legt man in den Eigenschaften von „Active Directory-Domänen und -Vertrauensstellungen“ (Stammknoten) an.

### Ausgewählte (selektive) Authentifizierung
Standard ist **gesamtstrukturweite Authentifizierung**: Jeder Benutzer der vertrauten Gesamtstruktur gilt als „Authentifizierter Benutzer“ und kommt damit überall hin, wo z. B. „Authentifizierte Benutzer – Lesen“ gesetzt ist. Mit **ausgewählter Authentifizierung** muss am **Computerkonto** des Zielservers (Registerkarte **Sicherheit**) für die Fremdgruppe explizit **„Authentifizierung zulassen“** (*Allowed to Authenticate*) gesetzt werden. Die Registerkarte **Sicherheit** erscheint in „AD-Benutzer und -Computer“ erst, wenn **Ansicht → Erweiterte Features** aktiviert ist.

### SID-Filterung (Domänenquarantäne)
- Verhindert, dass Konten der vertrauten Seite **fremde SIDs aus dem Attribut SIDHistory** mitbringen (Schutz vor SID-Injection/Rechteausweitung).
- Auf externen und Gesamtstruktur-VS **standardmäßig aktiv**.
- Muss bei **Migrationen** (ADMT) ggf. vorübergehend gelockert werden, weil migrierte Konten in ihrer SID-History noch die SID der **alten Domäne** tragen und sonst den Zugriff auf alte Ressourcen verlieren.
- Prüfen: `Get-ADTrust margiestravel.com | Format-List *SID*` (SIDFilteringForestAware, SIDFilteringQuarantined).
- Schalten: Gesamtstruktur-VS `netdom trust <vertrauend> /domain:<vertraut> /enablesidhistory:yes|no`; externe VS `netdom trust ... /quarantine:yes|no`.

## Einfach

Stell dir vor, mehrere **Schulen** sind Domänen.
- Innerhalb eines **Schulverbunds** (Gesamtstruktur) kennen sich alle Schulen automatisch: Ein Schüler aus der Grundschule darf mit seinem Ausweis auch in die Bibliothek der Realschule – das sind die **automatischen (impliziten) Vertrauensstellungen**. Und weil jeder jedem vertraut, gilt: Vertraut A der B und B der C, dann vertraut auch A der C – **transitiv**.
- Zwei **verschiedene Schulverbünde** kennen sich nicht. Die Schulleiter müssen erst einen **Partnerschaftsvertrag** unterschreiben (**explizite** Vertrauensstellung). Ein **Gesamtstrukturvertrag** gilt dann für **alle Schulen** beider Verbünde.
- Ein **Shortcut** ist eine **Abkürzung** durch den Schulhof: Statt über das Sekretariat der Hauptschule und dann das der Gesamtschule zu laufen, gehen zwei Schulen direkt durch ein neues Tor.

**Wer vertraut wem?** Die Schule mit der **Turnhalle** (Ressource) vertraut der Schule mit den **Schülern** (Konten). Der Pfeil zeigt zur Schülerschule, die Schüler laufen in die Gegenrichtung zur Turnhalle.

**Telefonbuch zuerst!** Damit sich die Schulleiter überhaupt erreichen, brauchen sie die **Telefonnummer** der anderen Schule – das ist **DNS** mit **Stubzone** oder **bedingter Weiterleitung**.

**Ausgewählte Authentifizierung** heißt: Nicht jeder Schüler der Partnerschule darf rein, sondern nur die **Theater-AG**, und auch nur in die **Aula**. Am Eingang der Aula hängt eine Liste: „Theater-AG darf sich anmelden.“

**SID-Filterung** ist der **Ausweis-Kontrolleur**, der alte Stempel einer anderen Schule im Ausweis nicht akzeptiert – damit niemand mit einem gefälschten alten Stempel mehr Rechte bekommt.

## Merksatz
- **Vertrauend = Ressourcen, vertraut = Konten** – Zugriff gegen den Pfeil.
- **Implizit = transitiv + bidirektional**, explizit = meist **nicht transitiv**.
- **Gesamtstruktur-VS ist transitiv**, extern und Shortcut nicht.
- **Erst DNS (Stubzone/Weiterleitung), dann Trust.**
- Selektiv = **„Authentifizierung zulassen“ am Computerkonto**.
- SID-Filterung **an**, außer bei Migration.

## Prüfungsfalle
- Eine Gesamtstruktur-VS zwischen A und B und eine zwischen B und C ergeben **keine** Vertrauensstellung A–C (nicht über Gesamtstrukturen hinweg transitiv).
- **Shortcut** gibt es nur **innerhalb** einer Gesamtstruktur, **extern** nur **zwischen** Gesamtstrukturen.
- Fehlt die Registerkarte **Sicherheit** am Computerkonto → **Erweiterte Features** einschalten.
- **Quellenfehler korrigiert:** In Übung 01-01 heißt es „_mscds.contos.com“ – richtig ist die Zone **_msdcs.example.com**. Der netdom-Schalter heißt **/enablesidhistory**, nicht „/enabledishistory“.
- Universale Gruppen können **gesamtstrukturweit** genutzt werden; für Zugriffe über Gesamtstrukturen hinweg nutzt man Gruppen der Ressourcen-Gesamtstruktur (Domänenlokal) mit Fremdmitgliedern.

## Grafik
### Kerberos-Anmeldung über eine Gesamtstruktur-VS
1. Client -> DC-Vancouver: Dienstticket für Server in seattle.contoso.msft anfordern
2. DC-Vancouver -> GC-nwtraders: Wo liegt das Namenssuffix?
3. GC-nwtraders -> DC-Vancouver: andere Gesamtstruktur, Trust-Objekt gefunden
4. DC-Vancouver -> Client: Verweis auf Stamm-DC nwtraders.msft
5. Client -> DC-contoso: Anforderung mit Verweis über den Forest-Trust
6. DC-contoso -> GC-contoso: Ressource suchen
7. DC-contoso -> Client: Verweis auf DC in seattle
8. Client -> DC-Seattle: Dienstticket anfordern
9. Client -> Server-Seattle: Dienstticket vorlegen, Zugriff
### Shortcut spart Umwege
1. Client-C -> DC-B: Referral nötig
2. DC-B -> DC-A: Stammdomäne
3. DC-A -> DC-D: nach unten
4. DC-D -> DC-E: Ziel erreicht
5. Shortcut: Client-C -> DC-E direkt

## Lab
Heimlabor **example.com** (Stammdomäne, EXA-DC01, 192.168.1.200). Zusätzliche VMs: **CBR-DC** (canberra.example.com), **ADL-DC** (wingtiptoys.com, 192.168.1.202), **MEL-DC** (margiestravel.com, 192.168.1.203). „Don Funk“ ist das Konto mit **Organisations-Admin-Rechten** (Enterprise Admins) in example.com. Kennwörter werden nicht dokumentiert.

### GUI
**Übung 01-01 – Domänen und Gesamtstrukturen**
1. **EXA-DC01**: als Administrator anmelden → DNS-Manager → Forward-Lookupzonen: **example.com** und **_msdcs.example.com** vorhanden?
2. **CBR-DC**: als lokaler Administrator anmelden, DNS-Client auf 192.168.1.200 → Server-Manager → Rollen → **Active Directory-Domänendienste** installieren.
3. Gelbes Fähnchen → **Server zu einem Domänencontroller heraufstufen** → **Neue Domäne zu einer vorhandenen Gesamtstruktur hinzufügen** → Domänentyp **Untergeordnete Domäne** → übergeordnete Domäne example.com → neuer Name **canberra** → Anmeldeinformationen **EXAMPLE\DonFunk** → DNS + GC, DSRM-Kennwort → Installieren.
4. Nach Neustart als **canberra\Administrator** anmelden.
5. **EXA-DC01**: DNS-Manager → Zone example.com → **Delegierung canberra** vorhanden?
6. **ADL-DC**: AD DS installieren → Heraufstufen → **Neue Domäne zu einer vorhandenen Gesamtstruktur** → Domänentyp **Strukturdomäne** (Tree) → Name **wingtiptoys.com** → Anmeldeinformationen Don Funk → nach Neustart **wingtiptoys\Administrator**.
7. **MEL-DC**: AD DS installieren → Heraufstufen → **Neue Gesamtstruktur hinzufügen** → **margiestravel.com** → nach Neustart **margiestravel\Administrator**.

**Übung 01-02 – Vertrauensstellungen**
8. **EXA-DC01**: DNS-Manager → Forward-Lookupzonen → Neue Zone → **Stubzone** → Haken **Zone in AD speichern** → **Alle DNS-Server in dieser Gesamtstruktur** → Name margiestravel.com → Masterserver **192.168.1.203**.
9. **MEL-DC**: Stubzone **example.com**, gesamtstrukturweit, Master **192.168.1.200**.
10. **EXA-DC01**: **Active Directory-Domänen und -Vertrauensstellungen** → example.com → Eigenschaften → Vertrauensstellungen → **Neue Vertrauensstellung** → margiestravel.com → **Gesamtstrukturvertrauensstellung** → **Bidirektional** → **Nur für diese Domäne** → **Gesamtstrukturweite Authentifizierung** → Kennwort für die Vertrauensstellung (beidseitig gleich) → Ausgehende **nicht** bestätigen → Eingehende **nicht** bestätigen.
11. **MEL-DC**: gleiche Schritte mit Domäne example.com, gleiches VS-Kennwort → diesmal **Ja, ausgehende bestätigen** und **Ja, eingehende bestätigen** → Konto EXAMPLE\Administrator angeben.
12. **MEL-DC**: VS zu example.com → Eigenschaften → **Namenssuffixrouting** → Eintrag ***.wingtiptoys.com** → **Aktivieren** → Registerkarte Allgemein → **Überprüfen**.
13. **EXA-DC01**: in ADUC universelle Sicherheitsgruppe **Research** anlegen.
14. **MEL-DC**: VS zu example.com → **Authentifizierung** → **Ausgewählte Authentifizierung** → Übernehmen → Allgemein → Überprüfen.
15. **MEL-DC**: ADUC → Computerkonto **SelectiveAuthRDP** anlegen → **Ansicht → Erweiterte Features** → Eigenschaften → **Sicherheit** → EXAMPLE\Research hinzufügen → **Authentifizierung zulassen** → Zulassen.
16. **EXA-DC01**: Active Directory-Domänen und -Vertrauensstellungen → Stammknoten → Eigenschaften → **Alternative UPN-Suffixe** → **example.internal** hinzufügen.
17. **CBR-DC**: als canberra\Administrator → DNS → AD-integrierte **Stubzone wingtiptoys.com** (Master 192.168.1.202), Replikation **Alle DNS-Server auf DCs in dieser Domäne**.
18. **CBR-DC**: canberra.example.com → Eigenschaften → Vertrauensstellungen → Neu → wingtiptoys.com → (Typ wird als **Shortcut/verknüpft** erkannt) → **Bidirektional** → **Für diese Domäne und die angegebene Domäne** → Admin von wingtiptoys angeben → eingehend und ausgehend **Ja, bestätigen**.
19. Kontrolle: wingtiptoys.com steht bei **eingehenden und ausgehenden** VS – auch auf **ADL-DC** prüfen.
20. Zusatz: **MEL-DC** weitere UPN-Suffixe anlegen; SID-Filterung mit netdom aus- und wieder einschalten und dazwischen prüfen.

### PowerShell
```powershell
# CBR-DC: untergeordnete Domaene canberra.example.com
Install-WindowsFeature AD-Domain-Services -IncludeManagementTools
Install-ADDSDomain -NewDomainName canberra -ParentDomainName example.com -DomainType ChildDomain `
  -InstallDns -Credential (Get-Credential EXAMPLE\DonFunk)

# ADL-DC: neue Struktur (Tree) in der Gesamtstruktur example.com
Install-ADDSDomain -NewDomainName wingtiptoys.com -ParentDomainName example.com -DomainType TreeDomain `
  -InstallDns -Credential (Get-Credential EXAMPLE\DonFunk)

# MEL-DC: neue Gesamtstruktur
Install-ADDSForest -DomainName margiestravel.com -InstallDns

# EXA-DC01 bzw. MEL-DC: Stubzonen (gesamtstrukturweit)
Add-DnsServerStubZone -Name margiestravel.com -MasterServers 192.168.1.203 -ReplicationScope Forest   # EXA-DC01
Add-DnsServerStubZone -Name example.com       -MasterServers 192.168.1.200 -ReplicationScope Forest   # MEL-DC

# EXA-DC01: Gesamtstruktur-VS bidirektional per .NET
$ctx    = New-Object System.DirectoryServices.ActiveDirectory.DirectoryContext('Forest','margiestravel.com',(Get-Credential).UserName,'<Kennwort>')
$remote = [System.DirectoryServices.ActiveDirectory.Forest]::GetForest($ctx)
[System.DirectoryServices.ActiveDirectory.Forest]::GetCurrentForest().CreateTrustRelationship($remote,'Bidirectional')

# MEL-DC: selektive Authentifizierung einschalten
netdom trust margiestravel.com /domain:example.com /SelectiveAUTH:yes

# EXA-DC01: alternatives UPN-Suffix
Set-ADForest -Identity example.com -UPNSuffixes @{Add='example.internal'}

# CBR-DC: Shortcut-VS zu wingtiptoys.com
Add-DnsServerStubZone -Name wingtiptoys.com -MasterServers 192.168.1.202 -ReplicationScope Domain
netdom trust canberra.example.com /domain:wingtiptoys.com /add /twoway `
  /UserD:wingtiptoys\Administrator /PasswordD:* /UserO:canberra\Administrator /PasswordO:*

# Pruefen und SID-Filterung (MEL-DC)
Get-ADTrust -Filter * | Format-Table Name, Direction, TrustType, ForestTransitive, SelectiveAuthentication
Get-ADTrust margiestravel.com | Format-List *SID*
netdom trust margiestravel.com /domain:example.com /enablesidhistory:yes    # SID-History zulassen (Filter gelockert)
netdom trust margiestravel.com /domain:example.com /enablesidhistory:no     # wieder filtern
netdom trust margiestravel.com /domain:example.com /verify
nltest /domain_trusts /all_trusts
```

## Befehle
- `Install-ADDSDomain -DomainType ChildDomain` – untergeordnete Domäne erstellen
- `Install-ADDSDomain -DomainType TreeDomain` – neue Struktur (Tree) in vorhandener Gesamtstruktur
- `Install-ADDSForest` – neue Gesamtstruktur
- `Add-DnsServerStubZone -ReplicationScope Forest` – AD-integrierte Stubzone
- `Get-ADTrust -Filter *` – alle Vertrauensstellungen anzeigen
- `netdom trust A /domain:B /verify` – VS überprüfen
- `netdom trust A /domain:B /SelectiveAUTH:yes` – ausgewählte Authentifizierung
- `netdom trust A /domain:B /enablesidhistory:yes` – SID-Filterung bei Gesamtstruktur-VS lockern
- `netdom trust A /domain:B /quarantine:no` – SID-Filterung bei externer VS abschalten
- `Set-ADForest -UPNSuffixes @{Add='...'}` – alternatives UPN-Suffix
- `nltest /domain_trusts /all_trusts` – Trust-Übersicht des Clients

## Übungen
- A: Welche Zonen müssen vor dem Anlegen von canberra auf EXA-DC01 existieren? | L: example.com und _msdcs.example.com (Quelle schreibt fälschlich _mscds.contos.com).
- A: Welche Option wählt man im Heraufstufungsassistenten für canberra.example.com? | L: Neue Domäne zu vorhandener Gesamtstruktur → Untergeordnete Domäne, übergeordnet example.com, Name canberra, Anmeldung mit Organisations-Admin (Don Funk).
- A: Welche VS entsteht automatisch zwischen canberra.example.com und example.com? | L: Unter-/Überordnungs-VS (Parent-Child): implizit, bidirektional, transitiv. In der DNS-Zone example.com entsteht die Delegierung canberra.
- A: Welche VS entsteht beim Tree wingtiptoys.com? | L: Strukturstamm-VS (Tree-Root) zur Stammdomäne example.com: implizit, bidirektional, transitiv.
- A: Warum werden vor der Gesamtstruktur-VS Stubzonen angelegt? | L: Beide Seiten müssen die DCs der anderen Gesamtstruktur per DNS finden; die Stubzonen enthalten SOA, NS und Glue-Records der Partnerzone.
- A: Warum werden auf EXA-DC01 ausgehende/eingehende VS nicht bestätigt, auf MEL-DC aber schon? | L: Auf EXA-DC01 wird nur die lokale Seite angelegt; MEL-DC legt seine Seite an und bestätigt dann beide Richtungen gegen example.com mit dessen Admin-Konto – erst dann ist die VS komplett und geprüft.
- A: Warum muss das Namenssuffixrouting für wingtiptoys.com aktiviert werden? | L: Der Tree wurde/wird als neues Suffix erkannt, das standardmäßig nicht oder nur nach Aktivierung geroutet wird; ohne Routing finden Anmeldungen von margiestravel nach *.wingtiptoys.com das Trust-Objekt nicht.
- A: Warum fehlt ggf. die Registerkarte Sicherheit am Computerkonto SelectiveAuthRDP? | L: In ADUC ist Ansicht → Erweiterte Features nicht aktiviert.
- A: Was bewirkt „Authentifizierung zulassen“ für EXAMPLE\Research am Computer SelectiveAuthRDP? | L: Bei ausgewählter Authentifizierung dürfen sich nur Mitglieder von Research aus example.com an genau diesem Computer der vertrauenden Gesamtstruktur authentifizieren; alle anderen Fremdbenutzer werden abgewiesen.
- A: Wozu dient das UPN-Suffix example.internal? | L: Benutzer können sich mit benutzer@example.internal anmelden (z. B. passend zur E-Mail oder Cloud-Domäne), unabhängig vom DNS-Domänennamen.
- A: Warum eine Shortcut-VS canberra ↔ wingtiptoys? | L: Sonst laufen Kerberos-Verweise über example.com (Stamm) – die Shortcut-VS verkürzt den Anmeldepfad. Sie ist explizit und nicht transitiv.
- A: Zusatz: Wie prüft man, ob die SID-Filterung aktiv ist? | L: Get-ADTrust margiestravel.com \| fl *SID* oder netdom trust ... /enablesidhistory bzw. /quarantine ohne Wert anzeigen lassen.

## Karteikarten
- F: Vertrauende vs. vertraute Domäne? | A: Vertrauend besitzt die Ressourcen, vertraut besitzt die Benutzerkonten
- F: Eigenschaften impliziter VS? | A: Automatisch, transitiv, bidirektional
- F: Welche explizite VS ist transitiv? | A: Die Gesamtstruktur-VS (zwischen allen Domänen der beiden Gesamtstrukturen)
- F: Wo gibt es Shortcut-VS? | A: Nur innerhalb einer Gesamtstruktur, zur Verkürzung der Anmeldepfade
- F: Externe VS – Merkmale? | A: Zwischen zwei Domänen verschiedener Gesamtstrukturen, nicht transitiv, uni- oder bidirektional
- F: Bereichs-VS (Realm)? | A: Explizit zu einem Kerberos-V5-Bereich, Transitivität und Richtung konfigurierbar
- F: DNS-Voraussetzung für Gesamtstruktur-VS? | A: Stubzonen oder bedingte Weiterleitungen auf beiden Seiten
- F: Was ist Namenssuffixrouting? | A: Festlegung, welche Domänen-/UPN-Suffixe über eine Gesamtstruktur-VS zur Anmeldung geroutet werden
- F: Was ist ausgewählte Authentifizierung? | A: Fremdbenutzer dürfen sich nur an Computern authentifizieren, an denen sie „Authentifizierung zulassen“ haben
- F: Was filtert die SID-Filterung? | A: SIDs aus der SIDHistory der vertrauten Seite
- F: Warum SID-Filterung bei Migration lockern? | A: Migrierte Konten brauchen ihre alte SID in der SIDHistory für Zugriffe auf alte Ressourcen
- F: Welches Konto braucht man für eine neue Domäne in einer Gesamtstruktur? | A: Mitglied der Organisations-Admins (Enterprise Admins)

## Quiz
? Welche Vertrauensstellung entsteht automatisch beim Anlegen von canberra.example.com?
* Unter-/Überordnungs-VS, bidirektional und transitiv
- Externe VS, nicht transitiv
- Shortcut-VS, einseitig
- Bereichs-VS zu Kerberos

? Welche explizite Vertrauensstellung ist transitiv?
* Gesamtstruktur-VS
- Externe VS
- Shortcut-VS
- Keine explizite VS kann transitiv sein

? Was ist vor dem Anlegen einer Gesamtstruktur-VS zwingend nötig?
* Funktionierende Namensauflösung, z. B. Stubzonen oder bedingte Weiterleitungen
- Eine gemeinsame Domänen-SID
- Ein gemeinsamer Schemamaster
- Die Deaktivierung von Kerberos

? In welcher Domäne liegen die Ressourcen?
* In der vertrauenden Domäne
- In der vertrauten Domäne
- Immer in der Stammdomäne
- Im globalen Katalog

? Wozu dient eine Shortcut-VS?
* Sie verkürzt Kerberos-Verweise zwischen zwei Domänen einer Gesamtstruktur
- Sie verbindet zwei Gesamtstrukturen transitiv
- Sie ersetzt DNS
- Sie aktiviert die SID-Filterung

? Die Registerkarte Sicherheit am Computerkonto fehlt. Was tun?
* In ADUC Ansicht → Erweiterte Features aktivieren
- Den Computer neu starten
- Die VS löschen
- Die Gruppe Research global machen

? Was bewirkt ausgewählte Authentifizierung?
* Fremdbenutzer brauchen am Zielcomputer „Authentifizierung zulassen“
- Alle Benutzer aller Domänen sind Domänen-Admins
- Kerberos wird durch NTLM ersetzt
- Nur UPN-Suffixe werden geroutet

? Warum muss die SID-Filterung nach einer ADMT-Migration ggf. gelockert werden?
* Migrierte Konten nutzen ihre alte SID aus der SIDHistory für alte Ressourcen
- Weil sonst DNS ausfällt
- Weil die Gesamtstruktur sonst gelöscht wird
- Weil SID-Filterung nur bei Shortcut-VS existiert

? Welcher Befehl erstellt einen neuen Tree in einer vorhandenen Gesamtstruktur?
* Install-ADDSDomain -DomainType TreeDomain
- Install-ADDSForest
- New-ADTrust
- Add-DnsServerStubZone

? Wie fließt der Zugriff im Verhältnis zur Pfeilrichtung der VS?
* Entgegen der Pfeilrichtung (von der vertrauten zur vertrauenden Domäne)
- In Pfeilrichtung
- Immer in beide Richtungen
- Gar nicht ohne Shortcut

## Lücken
- Die Domäne mit den Ressourcen ist die {vertrauende}, die mit den Konten die {vertraute} Domäne.
- Implizite VS sind {transitiv} und {bidirektional}.
- Bei ausgewählter Authentifizierung setzt man am Computerkonto das Recht {Authentifizierung zulassen}.

## Zuordnen
### VS-Typ und Merkmal
- Unter-/Überordnung => implizit bei neuer untergeordneter Domäne
- Strukturstamm => implizit bei neuem Tree
- Shortcut => explizit innerhalb einer Gesamtstruktur
- Extern => zwei Domänen verschiedener Gesamtstrukturen, nicht transitiv
- Gesamtstruktur => zwei Stammdomänen, transitiv
- Bereich => Kerberos-V5-Realm

## Reihenfolge
### Gesamtstruktur-VS example.com ↔ margiestravel.com
1. Stubzone margiestravel.com auf EXA-DC01 anlegen
2. Stubzone example.com auf MEL-DC anlegen
3. Auf EXA-DC01 neue Gesamtstruktur-VS bidirektional ohne Bestätigung anlegen
4. Auf MEL-DC Gegenseite anlegen und beide Richtungen bestätigen
5. VS überprüfen
6. Namenssuffixrouting und Authentifizierungsart anpassen

## Szenario
### Fusion mit Margie's Travel
Die example.com-Firma übernimmt Margie's Travel (eigene Gesamtstruktur margiestravel.com). Nur die Forschungsgruppe aus example.com soll auf einen bestimmten Server in margiestravel.com zugreifen.
- F: Welche VS wählen Sie? | A: Gesamtstruktur-VS (ggf. bidirektional), da ganze Gesamtstrukturen verbunden werden
- F: Was muss vorher eingerichtet werden? | A: DNS: Stubzonen oder bedingte Weiterleitungen in beide Richtungen
- F: Wie beschränken Sie den Zugriff auf eine Gruppe und einen Server? | A: Ausgewählte Authentifizierung und am Computerkonto des Servers „Authentifizierung zulassen“ für EXAMPLE\Research
- F: Welche Gruppenart für Research? | A: Universelle Gruppe in example.com (gesamtstrukturweit nutzbar)

## Spickzettel
- Vertrauend = Ressource, vertraut = Konto, Zugriff gegen den Pfeil
- Implizit: Parent-Child, Tree-Root → transitiv, bidirektional
- Explizit: Shortcut (innen), Extern, Forest (transitiv), Realm
- Erst DNS (Stubzone/Weiterleitung), dann Trust-Assistent
- Namenssuffixrouting, UPN-Suffixe, selektive Auth („Authentifizierung zulassen“)
- SID-Filterung standardmäßig an; Migration → lockern
- netdom trust /verify, Get-ADTrust -Filter *
