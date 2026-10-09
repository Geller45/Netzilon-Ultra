import random,os,re
random.seed(42)
OUT='/home/claude/n/content/referenz/a13-befehle'
os.makedirs(OUT,exist_ok=True)

def build(fn,pid,titel,kap,quellen,verweise,stufe,profi,einfach,merk,falle,grafik,groups,quizextra=None,ports=False):
    allc=[(g,c,d) for g,items in groups for c,d in items]
    t=f"---\nid: {pid}\nbereich: Referenz\nblock: A13\nkapitel: {kap}\ntitel: {titel}\nstufe: {stufe}\ntyp: referenz\nquellen: [{quellen}]\nverweise: [{', '.join(verweise)}]\n---\n\n"
    t+="## Profi\n\n"+profi.strip()+"\n\n"
    t+="## Einfach\n\n"+einfach.strip()+"\n\n"
    t+="## Merksatz\n"+"".join(f"- {m}\n" for m in merk)+"\n"
    t+="## Prüfungsfalle\n"+"".join(f"- {m}\n" for m in falle)+"\n"
    t+="## Grafik\n\n"+grafik.strip()+"\n\n"
    t+="## Befehle\n"
    for g,items in groups:
        t+=f"\n### {g}\n"
        for c,d in items:
            t+=f"- `{c}` – {d}\n"
    t+="\n## Karteikarten\n"
    for g,c,d in allc:
        q = f"Wofür steht/was bewirkt {c}?" if not ports else f"Welcher Port gehört zu {c}?"
        t+=f"- F: {q.replace('|','\\|')} | A: {d.replace('|','\\|')}\n"
    t+="\n## Quiz\n"
    picks=random.sample(allc,min(10,len(allc)))
    for g,c,d in picks:
        others=[x for x in allc if x[0]!=g and x[2]!=d]
        wrong=random.sample(others,3)
        q = f"Was bewirkt `{c}`?" if not ports else f"Welcher Port gehört zu {c}?"
        t+=f"\n? {q}\n* {d}\n"+"".join(f"- {w[2]}\n" for w in wrong)
    if quizextra: t+="\n"+quizextra.strip()+"\n"
    open(f'{OUT}/{fn}','w',encoding='utf8').write(t)
    return len(allc)

# ================= PowerShell =================
ps=[
('Grundlagen',[
('Get-Help Get-Service -Examples','Hilfe zu einem Cmdlet mit Beispielen'),
('Update-Help','Hilfedateien aktualisieren'),
('Get-Command *service*','Befehle nach Namensmuster suchen'),
('Get-Member','Eigenschaften und Methoden eines Objekts anzeigen'),
('Get-Alias','Aliase (z. B. ls, dir, gci) anzeigen'),
('Where-Object','Objekte in der Pipeline filtern'),
('Select-Object Name, Status','Bestimmte Eigenschaften auswählen'),
('Sort-Object -Descending','Objekte sortieren'),
('ForEach-Object','Für jedes Objekt der Pipeline einen Skriptblock ausführen'),
('Format-Table -AutoSize','Ausgabe als Tabelle formatieren'),
('Export-Csv -Path a.csv -NoTypeInformation','Objekte als CSV-Datei speichern'),
('Import-Csv a.csv','CSV-Datei als Objekte einlesen'),
('$PSVersionTable','Zeigt die PowerShell-Version'),
('Get-ExecutionPolicy -List','Ausführungsrichtlinien anzeigen'),
]),
('System und Dienste',[
('Get-Service','Dienste und ihren Status anzeigen'),
('Restart-Service Spooler','Dienst neu starten'),
('Set-Service -Name Spooler -StartupType Disabled','Starttyp eines Dienstes ändern'),
('Get-Process','Laufende Prozesse anzeigen'),
('Stop-Process -Name notepad','Prozess beenden'),
('Rename-Computer -NewName SRV01 -Restart','Computer umbenennen und neu starten'),
('Restart-Computer','Computer neu starten'),
('Get-WinEvent -LogName System -MaxEvents 20','Letzte Ereignisse aus dem Systemprotokoll lesen'),
('Get-HotFix','Installierte Updates anzeigen'),
('Get-ComputerInfo','Ausführliche System- und Betriebssysteminformationen'),
('Get-Volume','Volumes mit Laufwerksbuchstaben und freiem Platz'),
('Get-Disk','Datenträger und Partitionsstil (MBR/GPT) anzeigen'),
]),
('Netzwerk',[
('Get-NetIPConfiguration','Kompakte IP-Konfiguration aller Adapter'),
('New-NetIPAddress -InterfaceAlias Ethernet -IPAddress 10.0.0.10 -PrefixLength 24 -DefaultGateway 10.0.0.1','Statische IP-Adresse mit Präfix und Gateway setzen'),
('Set-DnsClientServerAddress -InterfaceAlias Ethernet -ServerAddresses 10.0.0.2','DNS-Server eines Adapters setzen'),
('Get-NetAdapter','Netzwerkadapter mit Status und Geschwindigkeit'),
('Get-NetRoute','Routingtabelle anzeigen'),
('New-NetRoute -DestinationPrefix 10.2.0.0/24 -NextHop 10.1.0.254 -InterfaceAlias Ethernet','Statische Route dauerhaft anlegen'),
('Set-NetIPInterface -Forwarding Enabled','IP-Weiterleitung (Routing) auf einer Schnittstelle aktivieren'),
('Test-NetConnection 10.0.0.5 -Port 445','Erreichbarkeit eines TCP-Ports prüfen'),
('Resolve-DnsName www.example.com','DNS-Namen auflösen'),
('Clear-DnsClientCache','DNS-Client-Cache leeren'),
('Get-NetFirewallRule -Enabled True','Aktive Firewallregeln anzeigen'),
('New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow','Eingehende Firewallregel anlegen'),
('Set-NetFirewallProfile -Profile Domain -Enabled True','Firewallprofil ein- oder ausschalten'),
]),
('Dateien und Freigaben',[
('Get-ChildItem C:\\Daten -Recurse','Ordnerinhalt rekursiv auflisten'),
('New-Item -ItemType Directory -Path D:\\Freigaben\\HR','Ordner anlegen'),
('Copy-Item a.txt D:\\Backup','Datei kopieren'),
('Remove-Item a.txt','Datei löschen'),
('Get-Content a.txt','Textdatei einlesen'),
('Get-Acl D:\\Freigaben\\HR','NTFS-Berechtigungen (ACL) anzeigen'),
('New-SmbShare -Name HR -Path D:\\Freigaben\\HR -FullAccess "Administratoren"','SMB-Freigabe erstellen'),
('Get-SmbShare','SMB-Freigaben auflisten'),
('Grant-SmbShareAccess -Name HR -AccountName "FIRMA\\GG-HR" -AccessRight Change -Force','Freigabeberechtigung vergeben'),
]),
('Active Directory',[
('Install-WindowsFeature AD-Domain-Services -IncludeManagementTools','AD-DS-Rolle mit Verwaltungstools installieren'),
('Install-ADDSForest -DomainName firma.local','Neue Gesamtstruktur und erste Domäne erstellen'),
('Install-ADDSDomainController -DomainName firma.local','Zusätzlichen Domänencontroller heraufstufen'),
('Add-Computer -DomainName firma.local -Credential FIRMA\\Administrator','Computer in die Domäne aufnehmen'),
('New-ADOrganizationalUnit -Name Vertrieb -Path "DC=firma,DC=local"','OU anlegen'),
('New-ADUser -Name "Anna Beispiel" -SamAccountName abeispiel','Benutzerkonto anlegen'),
('Set-ADAccountPassword abeispiel -Reset','Kennwort zurücksetzen'),
('Unlock-ADAccount abeispiel','Gesperrtes Konto entsperren'),
('Disable-ADAccount abeispiel','Konto deaktivieren'),
('New-ADGroup -Name GG-HR -GroupScope Global','Globale Sicherheitsgruppe anlegen'),
('Add-ADGroupMember GG-HR -Members abeispiel','Gruppenmitglied hinzufügen'),
('Get-ADUser -Filter * -Properties LastLogonDate','Benutzer mit weiteren Eigenschaften auflisten'),
('Get-ADDomain','Domäneninformationen (Funktionsebene, FSMO) anzeigen'),
('Enable-ADOptionalFeature "Recycle Bin Feature" -Scope ForestOrConfigurationSet -Target firma.local','AD-Papierkorb aktivieren (nicht umkehrbar)'),
('Restore-ADObject','Gelöschtes AD-Objekt aus dem Papierkorb wiederherstellen'),
('Move-ADDirectoryServerOperationMasterRole -Identity DC02 -OperationMasterRole 0,1,2,3,4','FSMO-Rollen kontrolliert übertragen'),
('Test-ComputerSecureChannel -Repair','Sicheren Kanal zur Domäne prüfen und reparieren'),
('New-GPO -Name GPO-Test','Neue Gruppenrichtlinie erstellen'),
('New-GPLink -Name GPO-Test -Target "OU=Vertrieb,DC=firma,DC=local"','GPO mit einer OU verknüpfen'),
('Invoke-GPUpdate -Computer CL01 -Force','GPO-Aktualisierung remote anstoßen'),
]),
('DNS und DHCP',[
('Add-DnsServerPrimaryZone -Name firma.local -ReplicationScope Domain','AD-integrierte Forward-Lookupzone anlegen'),
('Add-DnsServerResourceRecordA -Name web01 -ZoneName firma.local -IPv4Address 10.0.0.30','A-Eintrag hinzufügen'),
('Add-DnsServerForwarder -IPAddress 8.8.8.8','DNS-Weiterleitung einrichten'),
('Add-DnsServerConditionalForwarderZone -Name fabrikam.com -MasterServers 203.0.113.53','Bedingte Weiterleitung anlegen'),
('Install-WindowsFeature DHCP -IncludeManagementTools','DHCP-Rolle installieren'),
('Add-DhcpServerInDC','DHCP-Server in AD autorisieren'),
('Add-DhcpServerv4Scope -Name LAN -StartRange 10.0.0.100 -EndRange 10.0.0.200 -SubnetMask 255.255.255.0','DHCP-Bereich anlegen'),
('Add-DhcpServerv4ExclusionRange','Ausschlussbereich definieren'),
('Add-DhcpServerv4Reservation','DHCP-Reservierung (MAC → feste IP) anlegen'),
('Set-DhcpServerv4OptionValue -Router 10.0.0.1 -DnsServer 10.0.0.2','Bereichsoptionen (Gateway, DNS) setzen'),
]),
('Rollen, Remoting, Hyper-V',[
('Get-WindowsFeature','Rollen und Features mit Installationsstatus'),
('Install-WindowsFeature Web-Server -IncludeManagementTools','IIS-Rolle installieren'),
('Uninstall-WindowsFeature','Rolle oder Feature entfernen'),
('Enable-PSRemoting -Force','PowerShell-Remoting (WinRM) aktivieren'),
('Enter-PSSession -ComputerName SRV01','Interaktive Remotesitzung öffnen'),
('Invoke-Command -ComputerName SRV01 -ScriptBlock { Get-Service }','Befehl auf einem Remotecomputer ausführen'),
('Enter-PSSession -VMName VM01 -Credential (Get-Credential)','PowerShell Direct in eine Hyper-V-VM (ohne Netzwerk)'),
('New-VM -Name VM01 -Generation 2 -MemoryStartupBytes 2GB','Neue Hyper-V-VM anlegen'),
('Start-VM VM01','VM starten'),
('Checkpoint-VM -Name VM01 -SnapshotName Vorher','Prüfpunkt einer VM erstellen'),
('New-VMSwitch -Name Extern -NetAdapterName Ethernet','Virtuellen Switch anlegen'),
('Get-VM','VMs mit Status, CPU und RAM anzeigen'),
]),
]
n=build('01-powershell.md','ref-powershell','PowerShell-Befehlsreferenz (Windows Server)','Befehlsreferenz','Eigene Zusammenstellung, Microsoft Learn PowerShell-Doku',['ap1-a6-powershell','ap2-skripte-sql','legacy-tools-skripting'],'Einsteiger',
'''PowerShell-Cmdlets folgen dem Muster **Verb-Substantiv** (`Get-Service`, `New-ADUser`). Ausgaben sind **Objekte**, die man per **Pipeline** (`|`) filtert und weitergibt. Die häufigsten Verben: **Get** (lesen), **Set** (ändern), **New** (anlegen), **Remove** (löschen), **Add** (hinzufügen), **Enable/Disable**, **Start/Stop/Restart**, **Install/Uninstall**, **Test**.

Hilfe bekommt man mit `Get-Help <Cmdlet> -Examples`, Befehle findet man mit `Get-Command *stichwort*`, und Eigenschaften eines Ergebnisses mit `| Get-Member`. Gefährliche Befehle lassen sich mit **`-WhatIf`** (nur simulieren) und **`-Confirm`** (nachfragen) testen. Module wie **ActiveDirectory**, **DnsServer**, **DhcpServer**, **Hyper-V** und **GroupPolicy** kommen mit den Verwaltungstools der jeweiligen Rolle.''',
'''PowerShell ist wie ein **Bestellzettel mit festem Aufbau**: erst das **Tun-Wort** (Get, Set, New), dann **was** (Service, User, Route). „Get-Service“ heißt „Hol mir die Dienste“. Mit dem senkrechten Strich reichst du das Ergebnis an den nächsten weiter, wie an einem Fließband: erst alle Dienste holen, dann nur die **laufenden** behalten, dann nach **Namen** sortieren. Wenn du dir bei einem Befehl unsicher bist, fragst du `Get-Help`, und mit **`-WhatIf`** übst du erst mal, ohne dass etwas kaputtgeht.''',
['Verb-Substantiv: **Get / Set / New / Remove / Add**.','**`Get-Help`, `Get-Command`, `Get-Member`** = die drei Helfer.','**`-WhatIf`** = nur simulieren, **`-Confirm`** = nachfragen.','IP setzen: **`New-NetIPAddress` + `Set-DnsClientServerAddress`**.','AD: **`Install-ADDSForest`** (erste Domäne), **`Install-ADDSDomainController`** (weiterer DC), **`Install-ADDSDomain`** (Kinddomäne).'],
['`route add` ohne `-p` ist nicht dauerhaft, **`New-NetRoute`** speichert persistent.','**`Unlock-ADAccount`** (gesperrt) ist etwas anderes als **`Enable-ADAccount`** (deaktiviert).','**`Test-NetConnection -Port`** prüft **TCP**, nicht UDP.','Der **AD-Papierkorb** lässt sich nach dem Aktivieren **nicht mehr abschalten**.','**`Set-NetIPInterface -Forwarding Enabled`** macht den Server erst zum Router.'],
'''### Fließband
Ein Förderband mit vier Stationen: `Get-Service` (alle Dienste als Kisten), `Where-Object` (Filter lässt nur „Running“ durch), `Sort-Object` (ordnet nach Name), `Format-Table` (druckt die Liste). Ein Klick auf „-WhatIf“ lässt das Fließband mit Geisterkisten laufen, ohne etwas zu ändern.''',ps)
print('ps',n)

# ================= CMD / Netzwerktools =================
cmd=[
('Netzwerk-Diagnose',[
('ipconfig /all','Vollständige IP-Konfiguration inkl. MAC, DHCP, DNS'),
('ipconfig /release','DHCP-Lease freigeben'),
('ipconfig /renew','DHCP-Lease erneuern'),
('ipconfig /flushdns','DNS-Client-Cache leeren'),
('ipconfig /displaydns','DNS-Client-Cache anzeigen'),
('ipconfig /registerdns','DNS-Namen des Clients neu registrieren'),
('ping -t 10.0.0.1','Dauer-Ping bis Abbruch (Strg+C)'),
('ping -f -l 1472 www.example.com','Ping ohne Fragmentierung mit Paketgröße (MTU-Test)'),
('tracert www.example.com','Weg der Pakete (Hops) anzeigen'),
('pathping www.example.com','Kombination aus tracert und Ping-Statistik pro Hop'),
('nslookup www.example.com','DNS-Namen auflösen'),
('nslookup -type=SRV _ldap._tcp.dc._msdcs.firma.local','SRV-Einträge der Domänencontroller abfragen'),
('arp -a','ARP-Tabelle (IP → MAC) anzeigen'),
('netstat -ano','Verbindungen und lauschende Ports mit Prozess-ID'),
('route print','Routingtabelle anzeigen'),
('route add 10.2.0.0 mask 255.255.0.0 10.1.0.254 -p','Statische Route dauerhaft hinzufügen'),
('nbtstat -n','Lokale NetBIOS-Namen anzeigen'),
('getmac','MAC-Adressen der Adapter anzeigen'),
('hostname','Computernamen anzeigen'),
('netsh interface ip show config','IP-Konfiguration per netsh anzeigen'),
('netsh wlan show profiles','Gespeicherte WLAN-Profile anzeigen'),
('netsh advfirewall set allprofiles state off','Firewall für alle Profile ausschalten (nur Test!)'),
]),
('Konten, Freigaben, Richtlinien',[
('whoami /all','Benutzer, Gruppen und Rechte des aktuellen Kontos'),
('net user anna /domain','Domänenbenutzer anzeigen'),
('net use Z: \\\\SRV01\\Daten','Netzlaufwerk verbinden'),
('net share','Lokale Freigaben anzeigen'),
('net localgroup Administratoren','Mitglieder der lokalen Admin-Gruppe anzeigen'),
('gpupdate /force','Gruppenrichtlinien sofort neu anwenden'),
('gpresult /r','Angewendete Richtlinien (Zusammenfassung) anzeigen'),
('gpresult /h bericht.html','Ausführlicher GPO-Bericht als HTML'),
('klist','Kerberos-Tickets des Kontos anzeigen'),
('nltest /dsgetdc:firma.local','Domänencontroller der Domäne ermitteln'),
('w32tm /query /status','Status der Zeitsynchronisierung anzeigen'),
('w32tm /resync','Zeitsynchronisierung sofort auslösen'),
]),
('AD-Diagnose und Zertifikate',[
('dcdiag','Integritätstests eines Domänencontrollers'),
('repadmin /replsummary','Zusammenfassung der AD-Replikation'),
('repadmin /showrepl','Replikationspartner und letzter Erfolg'),
('netdom query fsmo','Inhaber der FSMO-Rollen anzeigen'),
('ntdsutil','Konsole für AD-Wartung (Metadaten, autoritative Wiederherstellung)'),
('dfsrmig /getmigrationstate','Stand der SYSVOL-Migration FRS → DFSR'),
('certutil -backup C:\\CABackup','Zertifizierungsstelle sichern'),
('certutil -dspublish -f root.cer RootCA','Root-Zertifikat in AD veröffentlichen'),
('certutil -crl','Neue CRL veröffentlichen'),
]),
('Datenträger, Dateien, System',[
('diskpart','Partitionierungswerkzeug (list disk, select disk, clean, convert gpt)'),
('chkdsk C: /f','Dateisystem prüfen und reparieren'),
('sfc /scannow','Systemdateien prüfen und reparieren'),
('DISM /Online /Cleanup-Image /RestoreHealth','Windows-Komponentenspeicher reparieren'),
('robocopy C:\\Daten D:\\Backup /MIR','Ordner spiegeln (Vorsicht: löscht im Ziel)'),
('xcopy /E /I','Dateien und Unterordner kopieren (älter, robocopy bevorzugen)'),
('icacls D:\\HR /grant "FIRMA\\GG-HR:(OI)(CI)M"','NTFS-Rechte setzen (Ändern, vererbt)'),
('cipher /w:D:','Freien Speicherplatz sicher überschreiben'),
('systeminfo','System-, Betriebssystem- und Hotfix-Informationen'),
('tasklist','Laufende Prozesse anzeigen'),
('taskkill /PID 1234 /F','Prozess beenden'),
('shutdown /r /t 0','Sofort neu starten'),
('mbr2gpt /validate /allowFullOS','Prüfen, ob MBR → GPT konvertiert werden kann'),
('bcdedit','Bootkonfiguration anzeigen'),
]),
]
n=build('02-cmd-netzwerktools.md','ref-cmd-tools','CMD- und Netzwerktools (Windows)','Befehlsreferenz','Eigene Zusammenstellung, Microsoft Learn',['ap1-a4-netzwerkgrundlagen','ap1-a5-dns','ap1-a5-dhcp','az801-ad-replikation'],'Einsteiger',
'''Die klassischen **Kommandozeilentools** laufen in **CMD** und **PowerShell**. Für die **Fehlersuche im Netzwerk** gilt eine feste Reihenfolge (von unten nach oben durch die Schichten): **1.** `ipconfig /all` (habe ich eine gültige IP, Gateway, DNS?), **2.** `ping 127.0.0.1` (Stack ok), **3.** `ping` eigene IP, **4.** `ping` Gateway, **5.** `ping` Ziel-IP, **6.** `ping` Zielname (**DNS**), **7.** `tracert` (wo bricht der Weg ab?), **8.** `nslookup`, `netstat -ano`, `arp -a` für Details.

Für **AD** gibt es die Trio-Diagnose: `dcdiag` (Gesundheit), `repadmin /replsummary` (Replikation) und `nltest /dsgetdc` (welcher DC antwortet). Das Werkzeug **`icacls`** setzt NTFS-Rechte, **`robocopy`** kopiert robust (`/MIR` spiegelt und **löscht** im Ziel).''',
'''Bei einem Netzwerkproblem gehst du vor wie ein **Arzt**: erst **Puls fühlen** (`ipconfig`: Habe ich überhaupt eine Adresse?), dann **an die Tür klopfen** (`ping` zum Gateway), dann **nach der Adresse fragen** (`nslookup`: Kennt das Telefonbuch den Namen?), und wenn es weit weg ist, **den Weg verfolgen** (`tracert`). So findest du den Fehler **Schicht für Schicht**. Für den Domänencontroller ist `dcdiag` der **Gesundheitscheck**.''',
['Fehlersuche **von unten nach oben**: IP → Gateway → Ziel-IP → Name.','**`ipconfig /release` + `/renew`** = neue DHCP-Adresse.','**`ping -t`** = Dauerping, **`ping -f -l`** = MTU-Test.','**`dcdiag`, `repadmin /replsummary`, `netdom query fsmo`** = AD-Trio.','**`gpupdate /force`** = sofort, **`gpresult /r`** = was gilt?'],
['`ping` blockiert = **nicht** automatisch Netzfehler (Firewall kann ICMP sperren).','`ipconfig /flushdns` leert den **Client**-Cache, nicht den DNS-Server-Cache.','`robocopy /MIR` **löscht** Dateien im Ziel, die in der Quelle fehlen.','**`net use`** ist Legacy-Stil, PowerShell hat `New-SmbMapping`.','Ein `169.254.x.x` bedeutet: **kein DHCP** erreichbar (APIPA).'],
'''### Diagnose-Leiter
Eine Leiter mit sieben Sprossen (ipconfig, Loopback, eigene IP, Gateway, Ziel-IP, Name, tracert). Ein Klick auf „Ping Gateway schlägt fehl“ färbt die Sprossen darüber grau und leuchtet die Ursache („Kabel/Switch/VLAN“) auf.''',cmd)
print('cmd',n)

# ================= Cisco IOS =================
ios=[
('Modi und Grundlagen',[
('enable','Wechsel in den privilegierten Modus (Router#)'),
('configure terminal','Wechsel in den globalen Konfigurationsmodus'),
('exit','Eine Ebene zurück'),
('end','Direkt zurück in den privilegierten Modus (Strg+Z)'),
('hostname SW1','Gerätenamen festlegen'),
('no ip domain-lookup','Verhindert DNS-Suche bei Tippfehlern'),
('banner motd #Nur für Berechtigte#','Warnbanner beim Anmelden'),
('show running-config','Aktive Konfiguration (RAM) anzeigen'),
('copy running-config startup-config','Konfiguration dauerhaft speichern (NVRAM)'),
('erase startup-config','Gespeicherte Konfiguration löschen (dann reload)'),
('reload','Gerät neu starten'),
('show version','IOS-Version, Uptime, Seriennummer'),
]),
('Zugang und Sicherheit',[
('enable secret Passwort','Privilegiertes Kennwort (gehasht) setzen'),
('service password-encryption','Klartext-Kennwörter in der Konfiguration verschleiern'),
('line console 0','Konsolenzugang konfigurieren'),
('line vty 0 15','Remotezugänge (Telnet/SSH) konfigurieren'),
('transport input ssh','Nur SSH auf den VTY-Leitungen erlauben'),
('login local','Anmeldung mit lokalem Benutzerkonto'),
('username admin secret Geheim#1','Lokalen Benutzer anlegen'),
('ip domain-name firma.local','Domänennamen setzen (für SSH-Schlüssel nötig)'),
('crypto key generate rsa modulus 2048','RSA-Schlüssel für SSH erzeugen'),
('ip ssh version 2','SSH Version 2 erzwingen'),
('switchport port-security','Port Security am Access-Port aktivieren'),
('switchport port-security maximum 2','Maximal 2 MAC-Adressen pro Port erlauben'),
('switchport port-security violation shutdown','Port bei Verstoß abschalten (err-disabled)'),
('switchport port-security mac-address sticky','Gelernte MAC-Adressen dauerhaft merken'),
('spanning-tree portfast','Access-Port geht sofort in den Forwarding-Zustand'),
('spanning-tree bpduguard enable','Port abschalten, wenn BPDUs ankommen'),
('ip dhcp snooping','DHCP-Snooping aktivieren (gegen Rogue-DHCP)'),
]),
('Schnittstellen und VLANs',[
('interface gigabitEthernet 0/0','Schnittstelle zur Konfiguration wählen'),
('interface range fa0/1 - 24','Mehrere Schnittstellen gleichzeitig konfigurieren'),
('ip address 192.168.10.1 255.255.255.0','IPv4-Adresse mit Maske setzen'),
('no shutdown','Schnittstelle einschalten'),
('description Uplink zu Core','Beschreibung an der Schnittstelle'),
('speed 100 / duplex full','Geschwindigkeit und Duplex fest einstellen'),
('vlan 10','VLAN 10 anlegen'),
('name Verwaltung','VLAN benennen'),
('switchport mode access','Port als Access-Port festlegen'),
('switchport access vlan 10','Access-Port dem VLAN 10 zuordnen'),
('switchport mode trunk','Port als Trunk festlegen'),
('switchport trunk allowed vlan 10,20','Erlaubte VLANs auf dem Trunk begrenzen'),
('switchport trunk native vlan 99','Natives (untagged) VLAN auf dem Trunk setzen'),
('interface g0/0.10','Subinterface für Router-on-a-Stick'),
('encapsulation dot1Q 10','802.1Q-Tag für VLAN 10 am Subinterface'),
('ip routing','Layer-3-Switch: Routing aktivieren'),
('interface vlan 10','SVI (virtuelle Schnittstelle) für VLAN 10'),
('channel-group 1 mode active','Port in einen EtherChannel (LACP) aufnehmen'),
]),
('Routing, DHCP, NAT, ACL',[
('ip route 192.168.20.0 255.255.255.0 10.0.0.2','Statische Route zum Netz 192.168.20.0/24 über 10.0.0.2'),
('ip route 0.0.0.0 0.0.0.0 10.0.0.1','Standardroute über 10.0.0.1'),
('router ospf 1','OSPF-Prozess 1 starten'),
('network 192.168.10.0 0.0.0.255 area 0','Netz mit Wildcard-Maske in OSPF Area 0 aufnehmen'),
('router rip','RIP starten (mit version 2 und no auto-summary nutzen)'),
('ip dhcp excluded-address 192.168.10.1 192.168.10.10','Adressen vom DHCP-Bereich ausnehmen'),
('ip dhcp pool LAN','DHCP-Pool anlegen'),
('default-router 192.168.10.1','Gateway im DHCP-Pool festlegen'),
('ip helper-address 10.0.0.5','DHCP-Relay: leitet Broadcasts an den DHCP-Server weiter'),
('ip nat inside source list 1 interface g0/1 overload','PAT: viele private Adressen hinter einer öffentlichen IP'),
('access-list 1 permit 192.168.10.0 0.0.0.255','Standard-ACL: Quellnetz erlauben'),
('ip access-list extended WEB','Benannte erweiterte ACL anlegen'),
('permit tcp any host 10.0.0.5 eq 443','ACL-Eintrag: HTTPS zum Server erlauben'),
('ip access-group WEB in','ACL eingehend an die Schnittstelle binden'),
]),
('Diagnose (show-Befehle)',[
('show ip interface brief','Kurzübersicht: IP, Status, Protokoll aller Schnittstellen'),
('show interfaces status','Port, Status, VLAN, Duplex, Speed am Switch'),
('show vlan brief','VLANs und zugeordnete Ports'),
('show interfaces trunk','Trunk-Ports mit erlaubten VLANs'),
('show ip route','Routingtabelle'),
('show mac address-table','MAC-Adresstabelle des Switches'),
('show cdp neighbors','Direkt angeschlossene Cisco-Nachbarn'),
('show spanning-tree','STP-Status (Root Bridge, Portrollen)'),
('show access-lists','ACLs mit Trefferzählern'),
('show ip dhcp binding','Vergebene DHCP-Adressen'),
('show port-security interface fa0/1','Port-Security-Status eines Ports'),
('show etherchannel summary','Status der EtherChannels'),
('ping 192.168.10.1','Erreichbarkeit testen (Ausrufezeichen = Erfolg)'),
('traceroute 8.8.8.8','Weg der Pakete anzeigen'),
]),
]
n=build('03-cisco-ios.md','ref-cisco-ios','Cisco-IOS-Befehlsreferenz (CCNA-Basis)','Befehlsreferenz','Eigene Zusammenstellung, Cisco-IOS-Grundlagen',['ap1-a4-vlan','ap1-a4-routing','ap1-a5-firewall','legacy-klartextprotokolle'],'Fortgeschritten',
'''Die Cisco-IOS-Kommandozeile hat **Modi**, erkennbar am Prompt: `Switch>` (**Benutzermodus**), `Switch#` (**privilegierter Modus**), `Switch(config)#` (**globale Konfiguration**), `Switch(config-if)#` (Schnittstelle), `Switch(config-line)#` (Leitung), `Switch(config-vlan)#`, `Router(config-router)#`. Mit `?` bekommt man Hilfe, mit **Tab** wird ergänzt, Befehle dürfen abgekürzt werden (`conf t`, `sh run`). Ein vorangestelltes **`no`** macht einen Befehl rückgängig.

**Wichtig**: Die **running-config** liegt im **RAM** und geht beim Neustart verloren; erst `copy running-config startup-config` (bzw. `write memory`) speichert sie im **NVRAM**. **Wildcard-Masken** (OSPF, ACL) sind **invertierte** Subnetzmasken (`255.255.255.0` → `0.0.0.255`). Für **Router-on-a-Stick** wird pro VLAN ein Subinterface mit `encapsulation dot1Q <VLAN>` angelegt; ein **Layer-3-Switch** nutzt `ip routing` und **SVIs** (`interface vlan X`).''',
'''Die IOS-Kommandozeile ist wie ein **Haus mit Stockwerken**. Unten im Erdgeschoss (`>`) darfst du nur **schauen**. Im ersten Stock (`#`) darfst du **alles anschauen**. Im Dachgeschoss (`(config)#`) darfst du **umbauen**. Für jedes Zimmer (Schnittstelle, VLAN, Leitung) gehst du in einen eigenen Raum. Alles, was du umbaust, steht erst mal **nur auf einem Notizzettel im RAM**. Wenn der Strom ausfällt, ist der Zettel weg. Erst wenn du **speicherst** (`copy run start`), wandert die Änderung in den **Tresor** (NVRAM).''',
['**`>` → `enable` → `#` → `conf t` → `(config)#`**.','**`copy run start`** nicht vergessen (RAM ≠ NVRAM).','**`no shutdown`** schaltet eine Schnittstelle ein.','**Wildcard = invertierte Subnetzmaske** (0.0.0.255 für /24).','**Router-on-a-Stick:** `interface g0/0.10` + `encapsulation dot1Q 10`.','**SSH statt Telnet:** Domain, RSA-Schlüssel, `transport input ssh`.'],
['**Ohne `ip domain-name`** lässt sich der RSA-Schlüssel nicht erzeugen.','Ein **Trunk** braucht auf **beiden** Seiten dasselbe **native VLAN**.','**`enable password`** speichert im Klartext, **`enable secret`** gehasht (hat Vorrang).','**ACL** enden mit einem **impliziten `deny any`**; ohne `permit` ist alles gesperrt.','**Standard-ACL** filtert nur nach **Quelle**, **erweiterte** nach Quelle, Ziel, Protokoll, Port.','**Portfast** nur an Endgeräte-Ports, nie zwischen Switches.'],
'''### Prompt-Treppe
Ein Haus mit drei Stockwerken (>, #, (config)#); ein Klick auf `enable` bzw. `configure terminal` lässt den Mauszeiger die Treppe hochlaufen. Die Zimmer im Dachgeschoss (config-if, config-line, config-vlan) leuchten auf.

### RAM oder NVRAM
Ein Notizzettel (running-config) und ein Tresor (startup-config); ein Stromausfall-Knopf lässt den Zettel verbrennen, wenn nicht vorher gespeichert wurde.''',ios)
print('ios',n)

# ================= Linux =================
lin=[
('Dateien und Verzeichnisse',[
('ls -la','Dateien inklusive versteckter mit Rechten und Größe'),
('cd /etc','Verzeichnis wechseln'),
('pwd','Aktuelles Verzeichnis anzeigen'),
('cp -r quelle ziel','Verzeichnis rekursiv kopieren'),
('mv alt neu','Datei verschieben oder umbenennen'),
('rm -r ordner','Ordner rekursiv löschen'),
('mkdir -p a/b/c','Verzeichnisse samt Elternordnern anlegen'),
('cat datei','Dateiinhalt ausgeben'),
('less datei','Datei seitenweise lesen'),
('tail -f /var/log/syslog','Logdatei live mitlesen'),
('grep -i fehler datei','Text in Datei suchen (ohne Groß/Kleinschreibung)'),
('find / -name "*.conf"','Dateien nach Namen suchen'),
('nano datei','Einfacher Texteditor'),
]),
('Rechte und Benutzer',[
('chmod 750 datei','Rechte setzen: Besitzer rwx, Gruppe r-x, Andere keine'),
('chmod u+x skript.sh','Ausführrecht für den Besitzer hinzufügen'),
('chown anna:it datei','Besitzer und Gruppe ändern'),
('sudo befehl','Befehl mit Administratorrechten ausführen'),
('useradd -m anna','Benutzer mit Home-Verzeichnis anlegen'),
('passwd anna','Kennwort eines Benutzers ändern'),
('usermod -aG sudo anna','Benutzer zur Gruppe sudo hinzufügen'),
('id anna','UID, GID und Gruppen eines Benutzers'),
('umask','Standardrechte für neue Dateien (Maske)'),
]),
('System, Dienste, Pakete',[
('systemctl status ssh','Status eines Dienstes anzeigen'),
('systemctl enable --now ssh','Dienst beim Start aktivieren und sofort starten'),
('systemctl restart nginx','Dienst neu starten'),
('journalctl -u ssh -n 50','Letzte 50 Logzeilen eines Dienstes'),
('apt update && apt upgrade','Paketlisten aktualisieren und Pakete aktualisieren (Debian/Ubuntu)'),
('apt install nginx','Paket installieren'),
('ps aux','Alle Prozesse anzeigen'),
('top','Prozesse und Last live anzeigen'),
('kill -9 1234','Prozess hart beenden'),
('df -h','Belegung der Dateisysteme (lesbar)'),
('du -sh /var','Größe eines Verzeichnisses'),
('free -h','Arbeitsspeicher-Auslastung'),
('uname -a','Kernel- und Systeminformationen'),
('crontab -e','Zeitgesteuerte Aufgaben bearbeiten'),
('mount /dev/sdb1 /mnt','Datenträger einhängen'),
('lsblk','Blockgeräte und Partitionen anzeigen'),
]),
('Netzwerk und Fernzugriff',[
('ip a','IP-Adressen aller Schnittstellen'),
('ip route','Routingtabelle'),
('ip link set eth0 up','Schnittstelle aktivieren'),
('ss -tulpn','Lauschende Ports mit Prozess'),
('ping -c 4 8.8.8.8','Vier Pings senden'),
('traceroute 8.8.8.8','Weg der Pakete anzeigen'),
('dig example.com','DNS-Abfrage'),
('ssh anna@10.0.0.5','Sichere Anmeldung auf einem Remotehost'),
('scp datei anna@10.0.0.5:/tmp','Datei sicher kopieren'),
('curl -I https://example.com','HTTP-Header einer Seite abrufen'),
('ufw allow 22/tcp','Firewall: SSH erlauben (Ubuntu)'),
('tar -czf backup.tar.gz /etc','Verzeichnis als komprimiertes Archiv sichern'),
]),
]
n=build('04-linux-bash.md','ref-linux','Linux-Befehlsreferenz (Bash)','Befehlsreferenz','Eigene Zusammenstellung, LPIC-1-Grundlagen',['ap2-linux-grundlagen','ap2-skripte-sql'],'Einsteiger',
'''Linux-Befehle folgen dem Muster **`befehl -optionen argumente`**. Die Rechte einer Datei stehen als **rwx** für **Besitzer (u)**, **Gruppe (g)** und **Andere (o)**: **r = 4, w = 2, x = 1**. `chmod 750` heißt also Besitzer 7 (rwx), Gruppe 5 (r-x), Andere 0. Mit **`sudo`** führt man einzelne Befehle als root aus. Dienste steuert man mit **`systemctl`** (systemd), Logs liest man mit **`journalctl`** oder in `/var/log`. Pakete verwaltet man unter **Debian/Ubuntu** mit **`apt`**, unter **RHEL/Fedora** mit **`dnf`**.

Wichtige Verzeichnisse: `/etc` (Konfiguration), `/var/log` (Logs), `/home` (Benutzer), `/root` (Home von root), `/tmp` (temporär), `/usr/bin` (Programme), `/dev` (Geräte), `/proc` (Prozesse und Kernelinfos).''',
'''Linux ist wie ein **großes Haus mit Regeln**. **Jede Datei hat drei Schilder**: Was darf der **Besitzer**, was darf die **Gruppe**, was dürfen **alle anderen**. Die Zahlen sind ein **Rechenspiel**: **lesen = 4, schreiben = 2, ausführen = 1**. Wer alles darf, hat 4+2+1 = **7**. Mit `sudo` sagst du: „Ich habe den **Generalschlüssel**, aber nur für diesen einen Befehl.“ Und mit `systemctl` schaltest du die **Maschinen im Haus** (Dienste) an und aus.''',
['**r=4, w=2, x=1** (`chmod 755` = rwxr-xr-x).','**`systemctl status / enable --now / restart`** für Dienste.','**`apt` (Debian/Ubuntu), `dnf` (RHEL)**.','**`ss -tulpn`** zeigt lauschende Ports (Nachfolger von `netstat`).','**`ip a` / `ip route`** ersetzen `ifconfig` / `route`.'],
['**`rm -rf /`** und ähnliche Befehle sind **unumkehrbar**: immer Pfad prüfen.','**`chmod 777`** ist fast nie die richtige Lösung.','**Groß-/Kleinschreibung** zählt (`Datei` ≠ `datei`).','**`>` überschreibt**, **`>>` hängt an**.','**`ifconfig`/`netstat`** gelten als veraltet (net-tools) → `ip`, `ss`.'],
'''### Rechte-Würfel
Drei Schilder (Besitzer, Gruppe, Andere) mit je drei Schaltern r, w, x. Beim Umschalten ändern sich die Ziffer (0–7) und die Zahl `chmod 750` live.''',lin)
print('linux',n)

# ================= Ports =================
P=[
('Datenübertragung und Fernzugriff',[
('FTP','TCP 21 (Steuerung), TCP 20 (Daten)'),
('SSH / SFTP / SCP','TCP 22'),
('Telnet','TCP 23 (Klartext, Legacy)'),
('TFTP','UDP 69'),
('RDP (Remotedesktop)','TCP und UDP 3389'),
('VNC','TCP 5900'),
('WinRM (PowerShell-Remoting)','TCP 5985 (HTTP), TCP 5986 (HTTPS)'),
('SMB (Dateifreigaben)','TCP 445'),
('NFS','TCP/UDP 2049'),
]),
('Web und Mail',[
('HTTP','TCP 80'),
('HTTPS','TCP 443'),
('SMTP (Server zu Server)','TCP 25'),
('SMTP Submission (Client, STARTTLS)','TCP 587'),
('SMTPS','TCP 465'),
('POP3','TCP 110'),
('POP3S','TCP 995'),
('IMAP','TCP 143'),
('IMAPS','TCP 993'),
]),
('Namen, Adressen, Zeit',[
('DNS','UDP und TCP 53'),
('DNS über TLS (DoT)','TCP 853'),
('DHCP Server / Client','UDP 67 (Server), UDP 68 (Client)'),
('NTP','UDP 123'),
('NetBIOS Name / Datagramm / Sitzung','UDP 137 / UDP 138 / TCP 139'),
('mDNS','UDP 5353'),
('LLMNR','UDP 5355'),
]),
('Verzeichnis und Anmeldung',[
('Kerberos','TCP und UDP 88'),
('Kerberos Kennwortänderung','TCP und UDP 464'),
('LDAP','TCP und UDP 389'),
('LDAPS','TCP 636'),
('Globaler Katalog (LDAP)','TCP 3268'),
('Globaler Katalog (LDAPS)','TCP 3269'),
('RPC Endpunktzuordnung','TCP 135'),
('RADIUS (Authentifizierung / Abrechnung)','UDP 1812 / UDP 1813'),
('Syslog','UDP 514'),
('SNMP (Abfrage / Traps)','UDP 161 / UDP 162'),
]),
('VPN und Datenbanken',[
('IKE (IPsec)','UDP 500'),
('IPsec NAT-T','UDP 4500'),
('L2TP','UDP 1701'),
('PPTP','TCP 1723 plus GRE (IP-Protokoll 47)'),
('SSTP','TCP 443'),
('OpenVPN','UDP 1194'),
('WireGuard','UDP 51820 (Standard, frei wählbar)'),
('Microsoft SQL Server','TCP 1433'),
('MySQL / MariaDB','TCP 3306'),
('PostgreSQL','TCP 5432'),
('SIP (VoIP)','UDP/TCP 5060'),
]),
]
n=build('05-ports-protokolle.md','ref-ports','Ports und Protokolle im Überblick','Referenz','Eigene Zusammenstellung, IANA-Portlisten',['ap1-a4-netzwerkgrundlagen','ap1-a5-firewall','legacy-klartextprotokolle','az800-adds-dc'],'Einsteiger',
'''Ein **Port** (16 Bit, 0–65535) legt fest, **welcher Dienst** auf einem Rechner angesprochen wird. Es gibt **Well-Known Ports (0–1023)**, **Registered Ports (1024–49151)** und **dynamische/private Ports (49152–65535)**. **TCP** ist verbindungsorientiert und zuverlässig (Dreiwege-Handshake SYN – SYN/ACK – ACK), **UDP** ist verbindungslos und schnell (DNS-Abfragen, DHCP, VoIP, Streaming).

Für **Firewallregeln** gilt: **so wenig Ports wie nötig** öffnen, **Klartextprotokolle** durch **TLS/SSH**-Varianten ersetzen. Windows-AD-Umgebungen brauchen gleichzeitig **53 (DNS), 88 (Kerberos), 135 (RPC), 389 (LDAP), 445 (SMB)** und die dynamischen RPC-Ports; für den **Globalen Katalog 3268/3269**.''',
'''Ein Computer ist wie ein **großes Bürogebäude mit vielen Türen**. Die **IP-Adresse** ist die **Hausnummer**, der **Port** ist die **Zimmernummer**. Wenn du eine Webseite besuchst, klopfst du an **Zimmer 443** (HTTPS). Für E-Mail klopfst du an **993**, und wenn du einen anderen Computer fernwarten willst, an **22** (SSH) oder **3389** (RDP). Damit niemand unerlaubt reinkommt, sperrt die **Firewall** alle Türen ab, die du nicht brauchst.''',
['**22 SSH, 23 Telnet, 25 SMTP, 53 DNS, 80 HTTP, 443 HTTPS**.','**67/68 DHCP, 69 TFTP, 88 Kerberos, 110 POP3, 123 NTP**.','**135 RPC, 137-139 NetBIOS, 143 IMAP, 161/162 SNMP**.','**389 LDAP, 445 SMB, 636 LDAPS, 3389 RDP**.','**993 IMAPS, 995 POP3S, 3268/3269 GC**.'],
['**SFTP** nutzt **22** (SSH), **FTPS** nutzt **990** bzw. 21 mit STARTTLS.','**DNS** nutzt **UDP** für Abfragen und **TCP** für Zonenübertragung/große Antworten.','**SSTP** nutzt **TCP 443**, nicht UDP.','**LDAP 389** ist unverschlüsselt, **LDAPS 636** verschlüsselt.','**PPTP** braucht zusätzlich **GRE (Protokoll 47)**, keinen Port.'],
'''### Bürogebäude
Ein Gebäude mit Türschildern (Portnummern); Klick auf einen Dienst (z. B. „HTTPS“) lässt die passende Tür aufleuchten. Ein Schalter „Firewall“ schließt alle nicht benötigten Türen.''',P,ports=True)
print('ports',n)
