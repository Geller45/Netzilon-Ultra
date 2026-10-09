---
id: azd-storage
bereich: Azure Data
pruefungen: [DP-203, Schule]
fach: Data Engineering
block: A3
kapitel: Azure Storage
titel: Azure Storage – Speicherkonto, Blob-Arten, Zugriffsebenen, Lebenszyklus, Redundanz
stufe: Fortgeschritten
quellen: [05a_Data_Engineering_-_Storage_Grundlagen.pdf, 05b_Data_Engineering_-_BLOB.pdf, 05c_Data_Engineering_-_BLOB_-_Redundanzen.pdf, Workshop_06_-_Erkunden_des_Azure_Storage.docx]
verweise: [azd-grundlagen, azd-databricks, azd-sicherheit]
---

## Profi

### Azure Storage und Speicherkonto
Azure Storage ist die Cloud-Speicherlösung für alle Datentypen, weltweit per **HTTP/HTTPS (REST-API)** erreichbar, mit Client-Bibliotheken (.NET, Java, Python, JavaScript, C++, Go), verwaltet über Azure Portal, **Azure Storage Explorer**, PowerShell/CLI. Für alle Dienste ist ein **Speicherkonto** nötig; es enthält Blobs, Dateien, Queues und Tabellen und gehört zu einer **Ressourcengruppe**.
- Name: **3–24 Zeichen, nur Kleinbuchstaben und Zahlen**, **global eindeutig** in Azure.
| Dienst | Zweck | Endpunkt |
|---|---|---|
| **Blob** | Objektspeicher für Text/Binärdaten | `https://<konto>.blob.core.windows.net` |
| Statische Website | Webinhalte aus Blob | `…web.core.windows.net` |
| **Data Lake Storage Gen2** | Blob + hierarchischer Namespace | `…dfs.core.windows.net` |
| **Azure Files** | SMB/NFS-Dateifreigaben | `…file.core.windows.net` |
| **Queue** | Messaging zwischen Anwendungskomponenten | `…queue.core.windows.net` |
| **Table** | NoSQL-Schlüssel-Attribut-Speicher, schemalos | `…table.core.windows.net` |
| **Disk Storage** | virtuelle Festplatten (VM) | – |
Kontotypen: Standard **general-purpose v2** (empfohlen), **Premium** (SSD: Block Blobs, File Shares, Page Blobs).

### Blob-Speicher (Binary Large Objects)
Hierarchie: **Speicherkonto → Container → Blobs**. Einsatz: Bilder/Dokumente für Browser, verteilter Dateizugriff, Video-/Audio-Streaming, Logdateien, Backup/Disaster Recovery/Archivierung, Daten für Analysen, Aufbau eines Data Lake. Programmierbar (Azure Functions), reagiert auf Aktivität (Lifecycle).
**Blob-Arten** (nachträglich **nicht änderbar**):
| Art | Eigenschaft |
|---|---|
| **Blockblob** | Blöcke verschiedener Größe, parallel hochladbar, bis ca. 190,7 TiB; Standard für Dateien |
| **Anfügeblob (Append)** | nur Anfügen (kein Ändern/Löschen vorhandener Daten); ideal für Logs |
| **Seitenblob (Page)** | wahlfreier Lese-/Schreibzugriff, VHDs der VMs, bis 8 TiB |

### Zugriffsebenen (Access Tiers)
| Ebene | Speicherkosten | Zugriffskosten | Besonderheit |
|---|---|---|---|
| **Hot** | höchste | niedrigste | häufiger Zugriff, Standard bei neuen Konten |
| **Cool** | niedriger | höher | seltener Zugriff, mind. **30 Tage** |
| **Cold** | noch niedriger | noch höher | mind. 90 Tage (neuer) |
| **Archive** | niedrigste | höchste | offline, nur Blockblobs, Rehydration **mehrere Stunden**, mind. **180 Tage** |
Ebenen sind jederzeit änderbar (Konto-Standard oder pro Blob). **Premium** (SSD) kennt keine Ebenen und kein Lifecycle-Tiering.

### Lebenszyklusverwaltung (Lifecycle Management)
Regeln (**JSON**) wenden täglich Aktionen auf Container/Präfixe/Blobtypen an: `tierToCool`, `tierToArchive`, `delete`, jeweils `daysAfterModificationGreaterThan` / `daysAfterCreationGreaterThan` (auch Snapshots/Versionen).
Beispiel: nach 30 Tagen Cool, nach 90 Tagen Archive, nach 2.555 Tagen (7 Jahre) löschen, Snapshots nach 90 Tagen löschen.
```
{"rules":[{"name":"ruleFoo","enabled":true,"type":"Lifecycle","definition":{
  "filters":{"blobTypes":["blockBlob"],"prefixMatch":["container1/foo"]},
  "actions":{"baseBlob":{"tierToCool":{"daysAfterModificationGreaterThan":30},
    "tierToArchive":{"daysAfterModificationGreaterThan":90},"delete":{"daysAfterModificationGreaterThan":2555}},
    "snapshot":{"delete":{"daysAfterCreationGreaterThan":90}}}}}]}
```

### Redundanz
| Option | Prinzip | Schutz vor |
|---|---|---|
| **LRS** lokal | 3 Kopien **synchron** in **einer** Zone/Rechenzentrum | Laufwerks-/Rack-Ausfall; nicht vor Zonenausfall (Feuer) |
| **ZRS** zonenredundant | 3 Kopien synchron in **3 Zonen** derselben Region | Zonenausfall; nicht vor Regionsausfall |
| **GRS** georedundant | LRS primär + **asynchrone** Kopie (LRS) in **sekundärer Region** (> 300 Meilen) | Regionsausfall |
| **GZRS** geozonenredundant | ZRS primär + asynchron LRS sekundär | Zonen- und Regionsausfall (höchste Sicherheit) |
| **RA-GRS / RA-GZRS** | wie GRS/GZRS, aber **Lesezugriff** auf die sekundäre Region jederzeit | Hochverfügbarkeit für Lesen |
Sekundäre Region ist ohne RA nicht direkt lesbar, erst nach **Failover**. Replikation zur sekundären Region ist asynchron: das **Last Sync Time**/Sync-Status zeigt, ob Daten bereits repliziert sind. SLA für Hot-Zugriff 99,9 %, Cool 99 % (Lesen). Daten verlassen die Geografie nicht.

## Einfach

**Azure Storage** ist wie ein **riesiges Lagerhaus im Internet**, das Microsoft betreibt. Du mietest darin eine Abteilung – das ist dein **Speicherkonto**. Der Name der Abteilung muss auf der ganzen Welt einmalig sein (nur Kleinbuchstaben und Zahlen, 3 bis 24 Zeichen), denn daraus entsteht deine Internetadresse.

In der Abteilung gibt es mehrere Arten von Regalen:
- **Blob** = Regal für **alles Mögliche** (Fotos, PDFs, Videos). Man packt es in **Container** (wie Ordner).
- **Files** = eine **Netzwerkfreigabe** wie bei Windows (SMB).
- **Queue** = ein **Briefkasten für Nachrichten** zwischen Programmen.
- **Table** = eine einfache **Notizzettelsammlung**, ohne feste Tabellenform.
- **Disk** = die **Festplatte** für virtuelle Computer.

**Warm, kühl, eingefroren:** Alte Daten braucht man selten. Darum gibt es Preisstufen:
- **Hot** = Schreibtisch. Teuer zu lagern, aber billig zu benutzen.
- **Cool** = Schrank im Flur. Mind. 30 Tage.
- **Archive** = Keller im Lager. Sehr billig, aber das Zurückholen dauert **Stunden**.
Mit dem **Lebenszyklus** gibst du Regeln vor: „Nach 30 Tagen in den Schrank, nach 90 Tagen in den Keller, nach 7 Jahren in den Müll.“

**Redundanz = Sicherheitskopien:**
- **LRS**: drei Kopien im **gleichen Gebäude**. Brennt es, ist alles weg.
- **ZRS**: drei Kopien in **drei Gebäuden der gleichen Stadt**.
- **GRS**: drei Kopien im Gebäude plus drei in einer **anderen Stadt/Region** (verzögert).
- **GZRS**: das Beste aus beiden. 
- **RA-**: Du darfst auch in die Kopie in der anderen Stadt **hineinlesen**.

## Merksatz
- **Konto → Container → Blob.**
- **Hot – Cool (30 T) – Archive (180 T, Stunden).**
- **LRS 1 Zone, ZRS 3 Zonen, GRS 2 Regionen, GZRS = ZRS + GRS.**
- **RA = Read Access auf Sekundär.**
- **Blob-Art kann man nicht ändern.**
- **Speicherkontoname: klein, 3–24, einmalig.**

## Prüfungsfalle
- Archive-Ebene: **offline**, erst nach Rehydration lesbar (Stunden), nur Blockblobs.
- Premium-Blobs: kein Tiering/Lifecycle-Verschieben.
- Sekundäre Region ist ohne **RA** nicht lesbar; GRS-Replikation ist **asynchron** (Datenverlust möglich: RPO).
- ZRS schützt nicht vor Regionsausfall.
- Wenn nur „Zonenausfall“ gefordert und Kosten wichtig: **ZRS** reicht (GRS teurer).
- Container, nicht Blobs, tragen den Zugriffstyp (privat/Blob/Container).
- Page Blobs für VHDs, Append Blobs für Logs.

## Grafik
### Redundanz
1. Daten schreiben: Client -> Primärregion: Schreibvorgang
2. LRS: Primärregion speichert 3 Kopien in einer Zone
3. ZRS: Primärregion speichert 3 Kopien in 3 Zonen
4. GRS: Primärregion -> Sekundärregion: asynchrone Kopie
5. RA-GRS: Client -> Sekundärregion: Lesezugriff möglich
### Lebenszyklus
1. Blob: Tag 0 Hot
2. Lebenszyklusregel: nach 30 Tagen Wechsel zu Cool
3. Lebenszyklusregel: nach 90 Tagen Wechsel zu Archive
4. Lebenszyklusregel: nach 2555 Tagen Löschen

## Lab
### GUI
Maschine: Windows-Client (Azure Portal). Speicherkonto erstellen (Ressourcengruppe rg-lab, Region West Europe, Redundanz LRS, Standard v2). Container „daten“ anlegen, Datei hochladen, Zugriffsebene auf Cool ändern, Datenverwaltung > Lebenszyklusverwaltung > Regel (nach 30 Tagen Cool). Storage Explorer verbinden.
### PowerShell
```
New-AzResourceGroup -Name rg-lab -Location westeurope
$sa = New-AzStorageAccount -ResourceGroupName rg-lab -Name stlabdata2026 -Location westeurope -SkuName Standard_LRS -Kind StorageV2
$ctx = $sa.Context
New-AzStorageContainer -Name daten -Context $ctx
Set-AzStorageBlobContent -File .\test.txt -Container daten -Blob test.txt -Context $ctx
```

## Befehle
- `New-AzStorageAccount` – Speicherkonto
- `New-AzStorageContainer` – Container
- `Set-AzStorageBlobContent` / `Get-AzStorageBlob` – Blobs hochladen/auflisten
- `az storage blob upload --account-name … --container-name … --file …` – CLI
- `az storage account update --sku Standard_GRS` – Redundanz ändern

## Übungen
- A: Welche Redundanz schützt vor Ausfall einer Zone, ist aber günstiger als GRS? | L: ZRS.
- A: Welche Blob-Art eignet sich für Logdateien? | L: Anfügeblob (Append Blob).
- A: Wie lange muss ein Blob mindestens in Cool/Archive bleiben? | L: Cool 30 Tage, Archive 180 Tage.
- A: Daten nach 90 Tagen kostengünstig archivieren, nach 7 Jahren löschen: Lösung? | L: Lifecycle-Management-Regel (tierToArchive nach 90, delete nach 2555 Tagen).
- A: Eine Anwendung muss auch bei Regionsausfall lesen können. | L: RA-GRS oder RA-GZRS.
- A: Gültiger Speicherkontoname? | L: z. B. stlabdata2026 (3–24 Zeichen, klein, Ziffern), nicht „Lab_Data“.

## Karteikarten
- F: Hierarchie im Blob-Speicher? | A: Speicherkonto → Container → Blobs.
- F: Drei Blob-Arten? | A: Block-, Anfüge- (Append), Seitenblob (Page).
- F: Wofür Seitenblobs? | A: Wahlfreier Zugriff, VHD-Dateien von VMs.
- F: Wofür Anfügeblobs? | A: Nur Anfügen – Logdateien.
- F: Welche Zugriffsebenen gibt es? | A: Hot, Cool, (Cold), Archive.
- F: Mindestspeicherdauer Cool / Archive? | A: 30 Tage / 180 Tage.
- F: Archive: Besonderheit? | A: Offline, Abruf (Rehydration) dauert Stunden, nur Blockblobs.
- F: Format der Lifecycle-Regeln? | A: JSON.
- F: Was ist LRS? | A: 3 synchrone Kopien in einer Zone (ein Rechenzentrum).
- F: Was ist ZRS? | A: 3 synchrone Kopien in 3 Zonen einer Region.
- F: Was ist GRS? | A: LRS primär + asynchrone Kopie in einer sekundären Region.
- F: Was ist GZRS? | A: ZRS primär + asynchrone Kopie in sekundärer Region.
- F: Was bedeutet RA? | A: Read Access – Lesezugriff auf die sekundäre Region.
- F: Regeln für Speicherkontonamen? | A: 3–24 Zeichen, nur Kleinbuchstaben und Zahlen, global eindeutig.
- F: Endpunkt für Data Lake Gen2? | A: https://<konto>.dfs.core.windows.net

## Quiz
? Welche Redundanz speichert Daten in drei Zonen einer Region?
* ZRS
- LRS
- GRS
- RA-GRS

? Welche Option erlaubt Lesezugriff auf die sekundäre Region ohne Failover?
* RA-GRS
- GRS
- LRS
- ZRS

? Welche Ebene hat die niedrigsten Speicher-, aber höchsten Zugriffskosten?
* Archive
- Hot
- Cool
- Premium

? Welche Blob-Art eignet sich für VHD-Dateien?
* Seitenblob
- Blockblob
- Anfügeblob
- Tabellenblob

? Was gilt für Speicherkontonamen?
* 3–24 Zeichen, Kleinbuchstaben und Zahlen, global eindeutig
- Beliebige Zeichen
- Nur pro Ressourcengruppe eindeutig
- Mind. 30 Zeichen

? Wie lange dauert die Rehydration aus Archive?
* Mehrere Stunden
- Sofort
- Wenige Millisekunden
- 1 Minute

? In welchem Format werden Lifecycle-Regeln gespeichert?
* JSON
- XML
- YAML
- CSV

? Welche Redundanz bietet die höchste Sicherheit?
* GZRS
- LRS
- ZRS
- GRS

? Welche Replikation zur Sekundärregion bei GRS?
* Asynchron
- Synchron
- Keine
- Manuell

## Lücken
- Die Hierarchie im Blob-Speicher lautet Speicherkonto, {Container}, Blob.
- {ZRS} speichert drei Kopien in drei Zonen derselben Region.
- Die Archiv-Ebene benötigt eine {Rehydration} von mehreren Stunden.

## Zuordnen
### Redundanz und Schutz
- LRS => Schutz vor Laufwerks-/Rackausfall
- ZRS => Schutz vor Zonenausfall
- GRS => Schutz vor Regionsausfall
- GZRS => Zonen- und Regionsausfall
- RA-GRS => Lesezugriff auf Sekundärregion

## Reihenfolge
### Datenalterung mit Lifecycle (Beispiel)
1. Hot (neu)
2. Cool (nach 30 Tagen)
3. Archive (nach 90 Tagen)
4. Löschen (nach 2555 Tagen)

## Freitext
- F: Vergleichen Sie LRS, ZRS und GRS hinsichtlich Ausfallschutz. | M: LRS: drei synchrone Kopien in einem Rechenzentrum, schützt nur vor Hardwarefehlern; ZRS: drei Zonen derselben Region, schützt vor Zonenausfall; GRS: zusätzlich asynchrone Kopie in einer weit entfernten Region, schützt vor Regionsausfall. | P: 6

## Spickzettel
- Konto (3–24, klein) → Container → Blob (Block/Append/Page)
- Hot, Cool (30 T), Archive (180 T, Stunden Rehydration); Lifecycle = JSON
- LRS 1 Zone, ZRS 3 Zonen, GRS 2 Regionen (async), GZRS, RA = Lesen auf Sekundär
- Dienste: Blob, Files, Queue, Table, Disk; Endpunkte *.blob/dfs/file/queue/table.core.windows.net
