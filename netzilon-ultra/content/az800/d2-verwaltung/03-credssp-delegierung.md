---
id: az800-credssp-delegation
bereich: AZ-800
block: A7
kapitel: Hybrid-Verwaltung
titel: Das „Second Hop“-Problem – CredSSP & Kerberos-Delegierung
stufe: Profi
quellen: [AZ-800 Study Guide, Microsoft Learn]
verweise: [az800-powershell-remoting, ap1-a6-kerberos, az800-wac, az800-jea]
---

## Profi

### Das Problem
Admin an **CL01** öffnet eine Remote-Sitzung zu **SRV01** (Hop 1) und will von dort auf **SRV02** zugreifen (Hop 2), z. B. `Copy-Item \\SRV02\Share\datei.txt` oder `Get-ADUser` gegen einen DC. Ergebnis: **„Zugriff verweigert“**.
**Grund**: Bei Kerberos-Remoting erhält SRV01 nur ein **Service Ticket** für sich selbst, **nicht** das TGT oder das Kennwort des Admins. SRV01 kann sich daher gegenüber SRV02 **nicht im Namen des Admins** ausweisen. Das ist **Absicht** (Schutz vor Missbrauch kompromittierter Server).

### Lösungsmöglichkeiten im Vergleich
| Lösung | Funktionsweise | Sicherheit | Bewertung |
|---|---|---|---|
| **CredSSP** | Client sendet die **echten Anmeldeinformationen** (Kennwort) an SRV01, das sie für SRV02 verwendet | **schwach** – Anmeldeinformationen liegen auf SRV01 im Speicher (Credential Theft, z. B. per Mimikatz) | nur, wenn nichts anderes geht; vertrauenswürdige Server |
| **Kerberos – uneingeschränkte Delegierung** | SRV01 darf das TGT des Benutzers an **jeden** Dienst weiterreichen | **sehr schwach** | vermeiden |
| **Kerberos – eingeschränkte Delegierung (KCD)** | SRV01 darf **nur an festgelegte Dienste** (SPNs) auf SRV02 delegieren; Konfiguration **auf SRV01** (Registerkarte Delegierung) durch **Domänen-Admin** | gut | klassisch, aber nur gleiche Domäne, nicht für WinRM-Weiterleitung aller Dienste geeignet |
| **Ressourcenbasierte eingeschränkte Delegierung (RBCD)** | **SRV02** (die Ressource) legt fest, **welche** Konten an sie delegieren dürfen: `PrincipalsAllowedToDelegateToAccount` | **gut** | **empfohlen für PowerShell Remoting**, domänenübergreifend, Konfiguration durch Ressourcenbesitzer |
| **JEA mit RunAs/virtuellem Konto** | Befehle laufen unter einem Dienst-/gMSA-Konto mit Netzwerkzugriff | gut | für definierte Aufgaben |
| **Explizite Anmeldeinformationen im Skriptblock** | `Invoke-Command … { Copy-Item … -Credential $using:cred }` | ok (Kennwort nur im Speicher der Sitzung) | pragmatisch, Einzelfälle |
| **PSSessionConfiguration mit RunAsCredential** | Endpunkt läuft unter festgelegtem Konto | mittel | speziell |
| **Direkt vom Client arbeiten** | kein zweiter Hop (z. B. Dateien direkt von CL01 kopieren) | am besten | Umgehung |

### CredSSP einrichten (wenn unvermeidbar)
1. **Client** (CL01): `Enable-WSManCredSSP -Role Client -DelegateComputer SRV01.contoso.local` (bzw. GPO „Delegierung von neuen Anmeldeinformationen zulassen“ mit `WSMAN/SRV01.contoso.local`).
2. **Server** (SRV01): `Enable-WSManCredSSP -Role Server`.
3. Verbindung: `Enter-PSSession SRV01 -Authentication CredSSP -Credential CONTOSO\admin`.
4. Nach Gebrauch deaktivieren: `Disable-WSManCredSSP -Role Client|Server`.
**Nachteil**: Kennwort liegt auf SRV01 → bei Kompromittierung von SRV01 sind die (Admin-)Anmeldeinformationen gestohlen. Nicht zusammen mit **Credential Guard** nutzbar (blockiert Delegierung gespeicherter Anmeldeinformationen), nicht für **Protected Users**.

### RBCD einrichten (empfohlen)
Auf einem DC, **am Zielobjekt** (SRV02 = Ressource), das **Zwischensystem** (SRV01) eintragen:
```powershell
$srv01 = Get-ADComputer SRV01
Set-ADComputer -Identity SRV02 -PrincipalsAllowedToDelegateToAccount $srv01
```
- Wirkung für **SMB** usw. sofort bzw. nach Ablauf zwischengespeicherter Tickets (bis 15 Min.; auf SRV01 `klist purge -li 0x3e7`).
- Mehrere Zwischensysteme: Array/Gruppe angeben.
- Funktioniert **domänen- und forestübergreifend** (mit Trust), Voraussetzung DCs ab Server 2012.
- Einschränkung: wirkt nicht für alle Szenarien (z. B. **WinRM-zu-WinRM** als zweiter Hop), dort JEA oder explizite Credentials.
- Konten in **Protected Users** bzw. mit „Konto ist vertraulich und kann nicht delegiert werden“ werden **nie** delegiert (gewollt für Admins!).

### Klassische KCD (zum Vergleich)
`dsa.msc` → SRV01 → Registerkarte **Delegierung** → „Computer bei Delegierungen angegebener Dienste vertrauen“ → „Beliebiges Authentifizierungsprotokoll verwenden“ → Dienste hinzufügen: `cifs/SRV02.contoso.local`. Erfordert Domänen-Admin (SeEnableDelegationPrivilege), nur innerhalb der Domäne.

### Entscheidungshilfe
1. Lässt sich der Hop vermeiden? → direkt arbeiten.
2. Standard-Remoting mit Dateizugriff/AD-Abfragen → **RBCD**.
3. Delegierte Admin-Aufgaben für andere → **JEA** (virtuelles Konto/gMSA).
4. Einmalig/Test → Credentials explizit übergeben.
5. Letzter Ausweg → **CredSSP**, danach deaktivieren.

## Lab
**Maschinen**: CL01 (Admin), SRV01 (Hop 1), SRV02 (Freigabe `\\SRV02\Daten`), DC01.

### Befehle
```powershell
# 1. Problem reproduzieren (auf CL01)
Invoke-Command -ComputerName SRV01 -ScriptBlock { Get-ChildItem \\SRV02\Daten }   # Zugriff verweigert

# 2a. Lösung RBCD (auf DC01)
Set-ADComputer SRV02 -PrincipalsAllowedToDelegateToAccount (Get-ADComputer SRV01)
Get-ADComputer SRV02 -Properties PrincipalsAllowedToDelegateToAccount
# auf SRV01 Tickets verwerfen (oder 15 Minuten warten)
Invoke-Command -ComputerName SRV01 -ScriptBlock { klist purge -li 0x3e7 }
Invoke-Command -ComputerName SRV01 -ScriptBlock { Get-ChildItem \\SRV02\Daten }   # funktioniert

# 2b. Lösung explizite Anmeldeinformationen
$cred = Get-Credential CONTOSO\adm.becker
Invoke-Command -ComputerName SRV01 -ScriptBlock {
  New-PSDrive -Name D -PSProvider FileSystem -Root \\SRV02\Daten -Credential $using:cred | Out-Null
  Get-ChildItem D:\ }

# 2c. Lösung CredSSP (nur zum Vergleich!)
Enable-WSManCredSSP -Role Client -DelegateComputer "SRV01.contoso.local" -Force        # CL01
Invoke-Command -ComputerName SRV01 { Enable-WSManCredSSP -Role Server -Force }        # SRV01
Invoke-Command -ComputerName SRV01.contoso.local -Authentication CredSSP -Credential $cred -ScriptBlock { Get-ChildItem \\SRV02\Daten }
Disable-WSManCredSSP -Role Client                                                      # CL01
Invoke-Command -ComputerName SRV01 { Disable-WSManCredSSP -Role Server }
Get-WSManCredSSP

# RBCD wieder entfernen
Set-ADComputer SRV02 -PrincipalsAllowedToDelegateToAccount $null
```

## Einfach

Stell dir vor, du schickst einen **Boten** (Remote-Sitzung auf SRV01) in ein anderes Gebäude. Der Bote soll dort für dich ein Paket aus einem **dritten Gebäude** (SRV02) holen. Am dritten Gebäude sagt der Pförtner: „Wer bist du? Du bist nicht der Chef!“ – **Zugriff verweigert**. Das ist das **Second-Hop-Problem**.

Der Bote hat nämlich nur einen **Besucherausweis für das erste Gebäude** bekommen – nicht deinen echten Ausweis. Das ist Absicht: Würde jemand den Boten überfallen, soll er nicht deinen Generalschlüssel erbeuten.

**Lösungen**:
- **CredSSP** = du gibst dem Boten **deinen echten Schlüsselbund** mit. Klappt – aber wenn der Bote überfallen wird, ist dein Schlüssel weg. **Nur im Notfall!**
- **RBCD** (empfohlen) = der **Pförtner am dritten Gebäude** führt eine Liste: „Boten aus Gebäude 1 dürfen im Namen ihres Chefs Pakete abholen.“ Dein Schlüssel bleibt bei dir. Sicher und elegant.
- **Ausweis gezielt mitgeben** = du gibst dem Boten eine **Vollmacht nur für diesen einen Auftrag** (Anmeldedaten im Befehl).
- **Selbst gehen** = du holst das Paket einfach direkt – dann gibt es gar keinen zweiten Hop.

**VIP-Schutz**: Richtig wichtige Chefs (Protected Users) dürfen **nie** vertreten werden – auch nicht per RBCD. Gewollt!

## Merksatz
- Second Hop scheitert, weil Hop 1 **kein TGT/Kennwort** hat.
- **CredSSP = Kennwort liegt auf dem Zwischenserver** → unsicher.
- **RBCD** am **Ziel** konfigurieren: `PrincipalsAllowedToDelegateToAccount`.
- Klassische KCD am **Zwischensystem**, nur gleiche Domäne, Domänen-Admin nötig.
- Protected Users/„vertrauliche Konten“ werden **nie** delegiert.

## Prüfungsfalle
- RBCD wird an der **Ressource (Ziel)** eingetragen, nicht am Zwischensystem.
- CredSSP muss **auf Client und Server** aktiviert werden.
- Uneingeschränkte Delegierung ist keine gute Lösung.
- Nach RBCD-Änderung: zwischengespeicherte Tickets (bis 15 Min.) beachten.
- Credential Guard blockiert CredSSP-Delegierung gespeicherter Anmeldeinformationen.

## Grafik
### Drei Gebäude
CL01 → SRV01 → SRV02; der Bote hat nur einen Besucherausweis und wird bei SRV02 abgewiesen. Knopf „CredSSP“: der Bote trägt den echten Schlüsselbund (Warnsymbol „Diebstahlgefahr“). Knopf „RBCD“: an SRV02 hängt eine Liste mit „SRV01 darf delegieren“, der Bote wird durchgelassen, der Schlüssel bleibt beim Admin.

### Entscheidungsbaum
Frage-Knoten „Hop vermeidbar?“ → „Remoting mit Dateien/AD?“ → RBCD → „Delegierte Aufgaben?“ → JEA → „Notfall?“ → CredSSP.

## Karteikarten
- F: Was ist das Second-Hop-Problem? | A: Eine Remote-Sitzung kann sich mit den Benutzeranmeldeinformationen nicht an einem dritten System authentifizieren.
- F: Warum schlägt der zweite Hop fehl? | A: Der Zwischenserver erhält kein TGT/Kennwort des Benutzers, nur ein Service Ticket für sich selbst.
- F: Nachteil von CredSSP? | A: Anmeldeinformationen werden an den Zwischenserver übertragen und können dort gestohlen werden.
- F: Wo konfiguriert man RBCD? | A: Am Zielobjekt (Ressource) mit PrincipalsAllowedToDelegateToAccount.
- F: Unterschied KCD und RBCD? | A: KCD: am Zwischensystem, Domänen-Admin, nur gleiche Domäne. RBCD: an der Ressource, domänenübergreifend.
- F: Cmdlets zum Aktivieren von CredSSP? | A: Enable-WSManCredSSP -Role Client (Client) und -Role Server (Zwischenserver).
- F: Welche Konten werden nie delegiert? | A: Mitglieder von Protected Users und Konten mit „vertraulich, kann nicht delegiert werden“.
- F: Welche Lösung empfiehlt Microsoft für PowerShell-Remoting-Second-Hop? | A: Ressourcenbasierte eingeschränkte Kerberos-Delegierung (RBCD) bzw. JEA.

## Quiz
? Ein Admin führt Invoke-Command auf SRV01 aus, um auf \\SRV02\Daten zuzugreifen, und erhält „Zugriff verweigert“. Welche Lösung ist am sichersten?
* Ressourcenbasierte eingeschränkte Delegierung auf SRV02 für SRV01
- CredSSP dauerhaft auf allen Servern aktivieren
- Uneingeschränkte Delegierung für SRV01
- Den Admin in die Gruppe Jeder aufnehmen

? Wo wird RBCD konfiguriert?
* Am Computerkonto der Zielressource (SRV02)
- Am Computerkonto des Clients
- An der Default Domain Policy
- Am Benutzerkonto des Admins

? Welcher Nachteil gilt für CredSSP?
* Die Anmeldeinformationen des Benutzers liegen auf dem Zwischenserver
- Es funktioniert nur mit IPv6
- Es benötigt keine Konfiguration
- Es ist nur für Linux verfügbar

? Welche Befehle aktivieren CredSSP korrekt?
* Enable-WSManCredSSP -Role Client auf dem Client und -Role Server auf dem Zwischenserver
- Enable-PSRemoting auf beiden
- Set-ADComputer auf dem DC
- Enable-WSManCredSSP nur auf dem Zielserver SRV02

? Ein Domänen-Admin in der Gruppe Protected Users nutzt RBCD, aber der zweite Hop scheitert. Warum?
* Mitglieder von Protected Users können nicht delegiert werden
- RBCD unterstützt keine Admins
- Protected Users benötigen CredSSP
- Der DC ist kein globaler Katalog
