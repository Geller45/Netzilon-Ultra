---
id: schule-speicherpools
bereich: Prüfung
block: Schule
kapitel: Schule – Klausurfragen
titel: Speicherpools (Speicherplätze) – Übungsfragen zu den Schulfolien
stufe: Profi
typ: fragen
pruefungen: [Schule]
fach: Windows Server / AZ-800
quellen: [Spricherpool.pdf]
verweise: []
---

## Quiz

? Wie viele physische Datenträger sind mindestens nötig, um in einem Speicherpool eine Zwei-Wege-Spiegelung zu erstellen?
- 1
* 2
- 3
- 5
! Spiegelung braucht mindestens 2, Parität mindestens 3 und Drei-Wege-Spiegelung mindestens 5 physische Platten.
@ Speicherpools (Folie 4)

? Wie viele physische Datenträger sind mindestens für eine Drei-Wege-Spiegelung nötig?
- 2
- 3
- 4
* 5
! Drei-Wege-Spiegelung benötigt mindestens fünf physische Platten, Parität mindestens drei.
@ Speicherpools (Folie 4)

? Welche Eigenschaft müssen Datenträger haben, die einem Speicherpool hinzugefügt werden?
- Sie müssen mit NTFS formatiert sein.
* Sie müssen leer und unformatiert sein.
- Sie müssen Mitglied einer Domäne sein.
- Sie müssen dieselbe Größe haben.
! Datenträger müssen leer und unformatiert sein und können nur Mitglied in einem Speicherpool sein.
@ Speicherpools (Folie 4)

? Welche Plattenart ist für Failover-Cluster mit Speicherpools erforderlich?
- SATA
- NVMe
* SAS
- IDE
! Für Failover-Cluster werden nur SAS-Platten unterstützt.
@ Speicherpools (Folie 4)

? Welcher Pool existiert nach der Installation von Windows Server standardmäßig?
- Default
* Primordial
- Standard
- Root
! Nach der Installation existiert der Speicherpool "Primordial", aus dem neue Pools erstellt werden.
@ Speicherpools (Folie 2)

? Was bewirkt das Bereitstellungsschema "schlanke Speicherzuweisung" (Thin Provisioning)?
- Der Speicherplatz wird sofort fest zugeordnet, was die Leistung verbessert.
* Es wird nur der tatsächlich benötigte Speicherplatz verwendet; Überbelegung (Over Commitment) ist möglich.
- Der Pool wird komprimiert.
- Alle Daten werden gespiegelt.
! Schlank: nur benötigter Platz, hohe Fragmentierung möglich, bei Engpass weitere Platten hinzufügen. Fest: sofortige Zuordnung, bessere Leistung, evtl. unnötiger Platzverbrauch.
@ Speicherpools (Folie 8)

? Was ist bei einem Festplattenfehler in einem Speicherplatz zu tun?
- chkdsk oder Scandisk ausführen.
* Das Laufwerk entfernen und ein neues hinzufügen.
- Den Pool löschen und neu anlegen.
- Die Festplatte formatieren.
! Im Fehlerfall verwendet man nicht chkdsk/Scandisk, sondern ersetzt das Laufwerk (PowerShell: Repair-VirtualDisk).
@ Speicherpools (Folie 9)

? Mit welchem Cmdlet werden die Speicherpools aufgelistet?
- Get-VirtualDisk
* Get-StoragePool
- Get-PhysicalDisk
- Reset-PhysicalDisk
! Get-StoragePool listet Pools, Get-VirtualDisk die virtuellen Datenträger, Repair-VirtualDisk repariert sie, Reset-PhysicalDisk entfernt einen physischen Datenträger aus dem Pool.
@ Speicherpools (Folie 10)

? Was bedeutet die Laufwerkszuordnung "Hotspare"?
- Das Laufwerk wird automatisch vom Pool verwendet.
- Administratoren bestimmen manuell die Verwendung.
* Das Laufwerk steht nicht zur Verfügung, sondern springt im Notfall ein.
- Das Laufwerk wird nur für den Schreibcache verwendet.
! Hotspare = Ersatzplatte, die bei einem Ausfall eingesetzt wird.
@ Speicherpools (Folie 7)

? Wie groß ist standardmäßig der Zurückschreibcache (Write-Back-Cache) bei Speicherplätzen?
- 256 MB
* 1 GB
- 4 GB
- 10 GB
! Der Zurückschreibcache ist standardmäßig aktiviert und auf 1 GB begrenzt; er fängt Spitzenlast auf der SSD ab.
@ Speicherpools (Folie 3)
