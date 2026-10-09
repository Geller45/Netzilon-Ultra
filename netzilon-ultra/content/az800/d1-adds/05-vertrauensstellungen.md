---
id: az800-trusts
bereich: AZ-800
block: A7
kapitel: AD DS on-premises & Cloud
titel: Vertrauensstellungen (Trusts)
stufe: Profi
quellen: [Identitätsmanagement_mit_Windows_Server_2016_70-742.pdf, AZ-800 Study Guide]
verweise: [ap1-a6-adds, az800-multidomain-gruppen, ap1-a5-dns-zonen, az801-admt]
---

## Profi

### Grundbegriffe
Eine **Vertrauensstellung** erlaubt Benutzern einer Domäne, auf Ressourcen einer anderen Domäne zuzugreifen – **Authentifizierung** über Grenzen hinweg. Die **Autorisierung** (Rechte vergeben) bleibt beim Ressourcenbesitzer.
- **Vertrauende Domäne** (trusting) = **Ressourcendomäne**: „Ich vertraue den Konten der anderen.“
- **Vertraute Domäne** (trusted) = **Kontendomäne**: deren Benutzer bekommen Zugriff.
- **Vertrauensrichtung** zeigt von der vertrauenden zur vertrauten Domäne; der **Zugriff** fließt **entgegengesetzt**. Merksatz: *„Der Zugriff folgt dem Pfeil rückwärts.“*
- **Unidirektional** (eingehend/ausgehend) oder **bidirektional**.
- **Transitiv**: Vertraut A B und B C, vertraut A auch C. **Nicht transitiv**: gilt nur zwischen den zwei Partnern.

### Arten
| Typ | Zwischen | Transitiv | Richtung | Entstehung |
|---|---|---|---|---|
| **Übergeordnet-untergeordnet** (Parent-Child) | Domänen einer Struktur | ja | bidirektional | automatisch |
| **Strukturstamm** (Tree-Root) | Strukturen einer Gesamtstruktur | ja | bidirektional | automatisch |
| **Verknüpfung** (Shortcut) | zwei Domänen **derselben Gesamtstruktur** | teilweise (innerhalb) | ein-/zweiseitig | manuell – **verkürzt den Authentifizierungsweg** in tiefen Hierarchien |
| **Gesamtstruktur** (Forest) | Stammdomänen **zweier Gesamtstrukturen** | ja (**innerhalb** der beiden Forests, nicht zu Dritten) | ein-/zweiseitig | manuell; Kerberos, benötigt Funktionsebene ≥ 2003 |
| **Extern** (External) | Domäne ↔ Domäne einer **anderen** Gesamtstruktur oder NT4 | **nein** | ein-/zweiseitig | manuell; NTLM |
| **Bereich** (Realm) | AD ↔ **Kerberos-Realm** (z. B. Linux/MIT) | wählbar | ein-/zweiseitig | manuell |

### Voraussetzungen
- **DNS-Namensauflösung** zwischen den Gesamtstrukturen: **bedingte Weiterleitungen**, **Stubzonen** oder sekundäre Zonen (in beiden Richtungen!). Ohne DNS kein Trust.
- **Netzwerk**: Ports Kerberos 88, LDAP 389, SMB 445, RPC 135 + dynamisch, DNS 53 zwischen den DCs.
- **Berechtigungen**: Domänen-Admins/Organisations-Admins beider Seiten (oder Erstellung einer Seite und Kennwort für die Gegenseite – **Trust-Kennwort**).
- **Zeit** synchron (Kerberos).

### Sicherheitsmechanismen
- **SID-Filterung** (Quarantäne): Standard bei externen und Gesamtstruktur-Trusts – verwirft fremde **SID-History**-Einträge, damit sich niemand über gefälschte SIDs höhere Rechte verschafft. Bei Migrationen (ADMT mit SID-History) ggf. temporär deaktivieren (`netdom trust /quarantine:no`).
- **Selektive Authentifizierung** (statt gesamtstrukturweiter Authentifizierung): Benutzer der vertrauten Seite dürfen sich **nur an Computern** authentifizieren, an denen ihnen explizit das Recht **„Authentifizierung zulassen“** (Registerkarte Sicherheit des **Computerobjekts**) gewährt wurde. Ideal bei Partnerfirmen.
- **Namenssuffix-Routing** (Forest-Trust): legt fest, welche UPN-Suffixe/Namen über den Trust geroutet werden; Konflikte werden erkannt.
- **Überprüfen** (Validate) des Trusts in den Eigenschaften oder `netdom trust /verify`.

### Typischer Einsatz
- **Firmenübernahme/Fusion**: Forest-Trust bidirektional, später Migration (ADMT).
- **Partnerzugriff**: unidirektionaler Forest-Trust mit selektiver Authentifizierung.
- **Ressourcen-Forest / administrativer Forest** (ESAE/„Red Forest“, heute eher PAM): eine Richtung.
- **Kerberos-Realm** für Linux-Umgebungen.

## Lab
**Maschinen**: EXA-DC01 (exa.local), CON-DC (contoso.com) – entspricht der Schulaufgabe „2 Gesamtstrukturen“.

### GUI
1. **EXA-DC01**: DNS-Manager → **Bedingte Weiterleitungen** → Neu → `contoso.com` → IP von CON-DC → „In AD speichern…“ (alle DNS-Server der Gesamtstruktur).
2. **CON-DC**: bedingte Weiterleitung `exa.local` → IP EXA-DC01 (alternativ Stubzonen, wie im Unterricht).
3. Test beidseitig: `nslookup contoso.com` bzw. `nslookup exa.local`.
4. **EXA-DC01**: Tools → **Active Directory-Domänen und -Vertrauensstellungen** → Rechtsklick exa.local → Eigenschaften → **Vertrauensstellungen** → **Neue Vertrauensstellung** → Name `contoso.com` → **Gesamtstruktur-Vertrauensstellung** → **Bidirektional** → „Diese Domäne und die angegebene Domäne“ → Anmeldung Admin contoso.com → **Gesamtstrukturweite Authentifizierung** (bzw. selektiv) → Ausgehende/eingehende Vertrauensstellung **bestätigen** → Fertig.
5. Vertrauensstellung markieren → Eigenschaften → **Überprüfen**.
6. **CON-FS**: Ordner freigeben, NTFS-Recht für **EXA\GG-HR** vergeben (Objekttyp-Suche „Speicherorte“ → exa.local).
7. **Selektive Authentifizierung testen**: Trust-Eigenschaften → Authentifizierung → **Selektiv** → auf CON-FS: `dsa.msc` → Computerobjekt CON-FS → Sicherheit → EXA\GG-HR → **Authentifizierung zulassen**.

### PowerShell / Befehle
```powershell
# Auf EXA-DC01 – DNS
Add-DnsServerConditionalForwarderZone -Name "contoso.com" -MasterServers 192.168.1.205 -ReplicationScope Forest
# Auf CON-DC
Add-DnsServerConditionalForwarderZone -Name "exa.local" -MasterServers 192.168.1.200 -ReplicationScope Forest

# Auf EXA-DC01 – Gesamtstruktur-Trust (bidirektional) per .NET
$remote = New-Object System.DirectoryServices.ActiveDirectory.DirectoryContext("Forest","contoso.com","CONTOSO\Administrator","Kennwort")
$remoteForest = [System.DirectoryServices.ActiveDirectory.Forest]::GetForest($remote)
$localForest = [System.DirectoryServices.ActiveDirectory.Forest]::GetCurrentForest()
$localForest.CreateTrustRelationship($remoteForest, "Bidirectional")

# Anzeigen und prüfen
Get-ADTrust -Filter * | Format-Table Name, Direction, TrustType, ForestTransitive, SelectiveAuthentication
netdom trust exa.local /domain:contoso.com /verify
netdom trust exa.local /domain:contoso.com /quarantine        # SID-Filterung anzeigen
nltest /domain_trusts /all_trusts
```

## Einfach

Zwei **Schulen** (Domänen) wollen zusammenarbeiten. Schule A sagt: „Wir **vertrauen** den Schülerausweisen von Schule B.“ Dann dürfen Schüler von B in Räume von A – wenn A ihnen dort Rechte gibt. Das ist eine **Vertrauensstellung**.

**Richtung**: Wenn A der B vertraut, zeigt der Pfeil von A nach B – aber **die Schüler laufen von B nach A**. Der Zugriff läuft also **gegen den Pfeil**. Soll es in beide Richtungen gehen: **bidirektional**.

**Transitiv** = „Die Freunde meiner Freunde sind auch meine Freunde.“ Innerhalb **eines Schulverbunds** (Gesamtstruktur) vertrauen sich automatisch alle. Eine **externe** Vertrauensstellung ist dagegen wie ein **Einzelabkommen** zwischen zwei Schulen – Freunde der Freunde zählen nicht.

**Ohne Telefonbuch geht nichts**: Die Schulen müssen die **Adressen** der anderen kennen (DNS: bedingte Weiterleitung oder Stubzone), sonst finden sie das andere Sekretariat gar nicht.

**Selektive Authentifizierung** = „Ihr dürft zwar zu uns kommen, aber **nur in die Bibliothek**“ – nur an ausdrücklich freigegebenen Computern.

**SID-Filterung** = ein **Fälschungsschutz**: Niemand darf mit einem gefälschten Zusatzausweis („Ich war früher mal Direktor“) mehr Rechte bekommen.

## Merksatz
- **Zugriff läuft gegen die Pfeilrichtung** (vertrauend → vertraut, Benutzer kommen von vertraut).
- Innerhalb eines Forests: **automatisch, transitiv, bidirektional**.
- **Forest-Trust** transitiv zwischen zwei Forests, **extern** nicht transitiv.
- Voraussetzung: **DNS in beide Richtungen**.
- Partner: **selektive Authentifizierung** + „Authentifizierung zulassen“ am Computerobjekt.

## Prüfungsfalle
- Forest-Trust-Transitivität gilt nicht zu einem dritten Forest.
- Verknüpfungs-Trust (Shortcut) nur innerhalb derselben Gesamtstruktur.
- Selektive Authentifizierung: Recht am **Computer**objekt, nicht an der Freigabe.
- SID-Filterung blockiert SID-History bei Migrationen.
- Ohne bedingte Weiterleitung/Stubzone scheitert die Trust-Erstellung.

## Grafik
### Pfeil und Zugriff
Zwei Burgen; ein Vertrauenspfeil von Burg A nach B; Ritter aus B laufen über eine Brücke nach A (Gegenrichtung). Umschalter bidirektional/transitiv mit dritter Burg.

### Trust-Typen-Landkarte
Zwei Wälder (Forests) mit Bäumen (Domänen); automatische Trusts als goldene Linien, manuelle (Shortcut, Forest, extern, Realm) in anderen Farben; Hover zeigt Eigenschaften.

### Selektive Authentifizierung
Gast aus Partner-Forest darf nur an einem Computer mit grünem „Authentifizierung zulassen“-Schild anmelden, alle anderen bleiben rot.

## Karteikarten
- F: In welche Richtung fließt der Zugriff bei einer Vertrauensstellung? | A: Entgegen der Vertrauensrichtung – Benutzer der vertrauten Domäne greifen auf die vertrauende zu.
- F: Welche Trusts entstehen automatisch? | A: Übergeordnet-untergeordnet und Strukturstamm – transitiv, bidirektional.
- F: Wozu dient ein Verknüpfungs-Trust? | A: Verkürzt den Authentifizierungspfad zwischen Domänen derselben Gesamtstruktur.
- F: Unterschied Gesamtstruktur- und externe Vertrauensstellung? | A: Forest-Trust: zwischen Stammdomänen, transitiv innerhalb beider Forests, Kerberos. Extern: zwischen einzelnen Domänen, nicht transitiv, NTLM.
- F: Was ist ein Bereichs-Trust (Realm)? | A: Vertrauensstellung zu einem Nicht-Windows-Kerberos-Realm.
- F: Wichtigste Voraussetzung für einen Forest-Trust? | A: Gegenseitige DNS-Auflösung (bedingte Weiterleitungen/Stubzonen).
- F: Was ist selektive Authentifizierung? | A: Benutzer der vertrauten Seite dürfen sich nur an Computern mit „Authentifizierung zulassen“ anmelden.
- F: Was bewirkt SID-Filterung? | A: Entfernt fremde SID-History aus Tokens – Schutz vor Rechteausweitung.
- F: Wie prüft man einen Trust? | A: Eigenschaften → Überprüfen oder netdom trust /verify.

## Quiz
? Domäne A vertraut Domäne B (unidirektional). Wer kann auf wessen Ressourcen zugreifen?
* Benutzer aus B auf Ressourcen in A
- Benutzer aus A auf Ressourcen in B
- Beide gegenseitig
- Niemand ohne zweiten Trust

? Welcher Trust-Typ ist nicht transitiv?
* Externe Vertrauensstellung
- Gesamtstruktur-Vertrauensstellung
- Übergeordnet-untergeordnet
- Strukturstamm

? Ein Partnerunternehmen soll nur auf einen einzigen Fileserver zugreifen dürfen. Was konfiguriert man?
* Selektive Authentifizierung und „Authentifizierung zulassen“ am Fileserver-Computerobjekt
- Einen Shortcut-Trust
- Gesamtstrukturweite Authentifizierung
- Eine Stubzone ohne Trust

? Die Trust-Erstellung scheitert, weil der Partnerforest nicht gefunden wird. Ursache?
* Fehlende DNS-Auflösung (bedingte Weiterleitung/Stubzone)
- Fehlende DHCP-Reservierung
- Zu viele OUs
- Deaktiviertes BitLocker

? Wozu dient ein Verknüpfungs-Trust?
* Um Authentifizierungswege zwischen Domänen derselben Gesamtstruktur zu verkürzen
- Um Linux-Realms anzubinden
- Um zwei Forests zu verbinden
- Um SID-History zu filtern
