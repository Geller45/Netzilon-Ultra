---
id: azd-ressourcengruppen
bereich: Azure Data
pruefungen: [DP-203, Schule]
fach: Data Engineering
block: A1
kapitel: Grundlagen
titel: Azure-Grundlagen – Abonnement, Ressourcengruppen, Portal, Cloud Shell, CLI und PowerShell
stufe: Einsteiger
quellen: [Workshop_01_-_Ressourcengruppen.docx, Workshop_06_-_Erkunden_des_Azure_Storage.docx]
verweise: [azd-storage, azd-azure-sql, azd-grundlagen]
---

## Profi

### Azure-Hierarchie
**Management Groups → Subscriptions (Abonnements) → Resource Groups (Ressourcengruppen) → Resources (Ressourcen)**. Die Ressourcengruppe (RG) ist der logische Container für zusammengehörige Ressourcen (Lebenszyklus, Berechtigungen, Tags, Kostenanalyse).
Regeln:
- Eine Ressource gehört zu **genau einer** Ressourcengruppe (verschiebbar zwischen RGs/Abos).
- Ressourcengruppen können **nicht verschachtelt** werden.
- Ressource ohne Ressourcengruppe kann nicht erzeugt werden (beim Erstellen wird man dazu aufgefordert).
- Löschen der RG löscht **alle** enthaltenen Ressourcen (Bestätigung durch Eingabe des Namens).
- RGs selbst kosten **nichts**; die Ressourcen darin schon → nach Übungen RG löschen.
- Region der RG = Speicherort der Metadaten; Ressourcen können in anderen Regionen liegen.
- Zugriff über **Azure RBAC** (Rollen: Owner, Contributor, Reader) auf Ebene Verwaltungsgruppe/Abonnement/RG/Ressource (vererbt). **Tags** (Schlüssel-Wert) für Kostenstellen, **Locks** (CanNotDelete, ReadOnly) gegen Löschen, **Azure Policy** für Vorgaben.

### Werkzeuge
| Werkzeug | Beispiel |
|---|---|
| **Azure-Portal** (Browser) | Ressourcengruppen > Erstellen > Name > Überprüfen + Erstellen |
| **Azure Cloud Shell** (Bash oder PowerShell im Browser) | Icon rechts oben neben der Suche |
| **Azure CLI** (`az`, plattformübergreifend, Ausgabe JSON; „Bash“) | `az group create --name RessGroupWB --location westus`, `az group list`, `az group delete --name RessGroupWB` (Rückfrage y) |
| **Azure PowerShell** (Az-Modul) | `New-AzResourceGroup -Name RG1 -Location westeurope`, `Get-AzResourceGroup`, `Remove-AzResourceGroup -Name RG1 -Force` |
| **ARM-Templates / Bicep / Terraform** | Infrastruktur als Code |
| **Azure Storage Explorer** | grafisch für Storage |

### Storage-Workshop (Erkunden)
Speicherkonto bereitstellen: Abonnement, neue RG, eindeutiger Name (klein/Ziffern), Region, Leistung Standard, Redundanz LRS; unter „Erweitert“ **hierarchischer Namespace** (für Data Lake Gen2, später aktivierbar), unter „Datenschutz“ vorläufiges Löschen (Soft Delete) deaktivieren, da es später Probleme mit hierarchischem Namespace verursachen kann. Dann: **Blob-Container** erstellen und JSON hochladen, **Data Lake Gen2** (Verzeichnisse), **Azure Files** (Dateifreigabe), **Tabellen** (Table Storage).

## Einfach

Azure ist wie ein **riesiges Gewerbegebiet** von Microsoft, in dem du **Grundstücke und Gebäude** mieten kannst (Datenbanken, Speicher, Rechner). Damit du nicht den Überblick verlierst, ist alles geordnet wie in einer Firma:

- **Management Group** = der Konzern (oberste Ebene).
- **Abonnement (Subscription)** = dein **Vertrag/Konto**, über das bezahlt wird.
- **Ressourcengruppe** = ein **Umzugskarton oder Ordner** für alles, was zu **einem Projekt** gehört (die Datenbank, der Speicher, der Webserver).
- **Ressource** = ein einzelnes **Ding** darin (eine Datenbank, ein Speicherkonto).

Die wichtigsten Regeln sind einfach:
1. **Jedes Ding muss in einem Karton liegen** – ohne Karton keine Ressource.
2. **Jedes Ding liegt in genau einem Karton**, und Kartons kann man **nicht ineinander stecken**.
3. **Karton wegwerfen = alles darin ist weg.** (Darum fragt Azure sicherheitshalber nach dem Namen.)
4. **Der Karton selbst kostet nichts**, aber was drin ist, kostet Geld. Darum: **Am Ende der Übung den Karton wegwerfen**, sonst läuft die Rechnung weiter!

Man kann Azure **mit der Maus** (Portal im Browser) oder **mit Befehlen** bedienen:
- `az group create --name MeinKarton --location westeurope`
- `az group delete --name MeinKarton`
- oder in PowerShell: `New-AzResourceGroup` und `Remove-AzResourceGroup`.
Die **Cloud Shell** ist ein Terminal im Browser, in dem du die Befehle gleich ausprobieren kannst, ohne etwas zu installieren.

## Merksatz
- **Management Group → Abonnement → Ressourcengruppe → Ressource.**
- **Eine Ressource = genau eine Ressourcengruppe; keine Verschachtelung.**
- **RG löschen löscht alles darin; RG selbst kostenlos.**
- **az = Azure CLI (Bash), Az-Modul = PowerShell.**
- **Zuerst RG, dann Ressource.**

## Prüfungsfalle
- Ressourcengruppen kosten nichts, die Ressourcen schon.
- Ressourcengruppen lassen sich nicht schachteln.
- Löschen einer RG ist nicht rückgängig zu machen (außer Soft Delete einzelner Dienste).
- Azure CLI wird im Unterricht „Bash“ genannt, Ausgabe in JSON.
- Speicherkonto-Namen: klein, 3–24, eindeutig.
- Hierarchischer Namespace macht Blob zu Data Lake Gen2; Soft Delete kann Probleme verursachen.

## Grafik
### Azure-Hierarchie
1. Management Group: Unternehmen
2. Management Group -> Abonnement: Entwicklung
3. Abonnement -> Ressourcengruppe: rg-lab
4. Ressourcengruppe -> Ressource: Speicherkonto stlab2026
5. Ressourcengruppe -> Ressource: SQL-Datenbank AdventureWorks
### Aufräumen
1. Admin -> Ressourcengruppe: az group delete --name rg-lab
2. Ressourcengruppe: löscht Speicherkonto und Datenbank
3. Abonnement: keine weiteren Kosten

## Lab
### GUI
Maschine: Windows-Client (Browser). portal.azure.com > Ressourcengruppen > Erstellen > Name rg-lab, Region West Europe > Überprüfen + Erstellen. Anschließend > Ressourcengruppe löschen > Namen eintippen > Löschen.
### PowerShell
```
Connect-AzAccount
New-AzResourceGroup -Name rg-lab -Location westeurope
Get-AzResourceGroup | Format-Table ResourceGroupName, Location
Remove-AzResourceGroup -Name rg-lab -Force
```
### Bash (Azure CLI, Cloud Shell)
```
az group create --name RessGroupWB --location westus
az group list --output table
az group delete --name RessGroupWB --yes
```

## Befehle
- `az group create --name N --location L` – RG anlegen
- `az group list` / `az group delete --name N` – anzeigen / löschen
- `New-AzResourceGroup`, `Get-AzResourceGroup`, `Remove-AzResourceGroup` – PowerShell
- `az login` / `Connect-AzAccount` – anmelden
- `az account list` – Abonnements

## Übungen
- A: Was passiert beim Löschen einer Ressourcengruppe? | L: Alle Ressourcen darin werden ebenfalls gelöscht.
- A: Können Ressourcengruppen verschachtelt werden? | L: Nein.
- A: Warum soll man am Ende jeder Übung die RG löschen? | L: Die Ressourcen verursachen Kosten, die RG selbst nicht.
- A: Legen Sie per CLI eine RG „rg-test“ in West Europe an. | L: az group create --name rg-test --location westeurope
- A: Wie lautet das PowerShell-Pendant? | L: New-AzResourceGroup -Name rg-test -Location westeurope

## Karteikarten
- F: Was ist eine Ressourcengruppe? | A: Logischer Container für zusammengehörige Azure-Ressourcen.
- F: Hierarchie in Azure? | A: Management Group → Abonnement → Ressourcengruppe → Ressource.
- F: In wie vielen RGs kann eine Ressource sein? | A: In genau einer.
- F: Kosten einer RG? | A: Keine; nur die Ressourcen darin.
- F: Befehl zum Anlegen einer RG (CLI)? | A: az group create --name N --location L
- F: Befehl zum Löschen einer RG (CLI)? | A: az group delete --name N
- F: Was ist die Cloud Shell? | A: Browserbasiertes Terminal (Bash oder PowerShell) im Azure-Portal.
- F: Was ist Azure CLI? | A: Plattformübergreifendes Befehlszeilentool (az), JSON-Ausgabe.
- F: Wofür Tags und Locks? | A: Tags: Zuordnung/Kosten; Locks: Schutz vor Löschen/Ändern.
- F: Was gehört in ein Azure-Storage-Konto? | A: Blobs, Files, Queues, Tabellen.

## Quiz
? Wie viele Ressourcengruppen kann eine Ressource gleichzeitig angehören?
* Eine
- Zwei
- Beliebig viele
- Keine

? Was passiert, wenn eine Ressourcengruppe gelöscht wird?
* Alle enthaltenen Ressourcen werden gelöscht
- Nur die Gruppe, die Ressourcen bleiben
- Die Ressourcen werden archiviert
- Nichts

? Welcher Befehl legt eine RG per Azure CLI an?
* az group create
- New-AzGroup
- az resource new
- create-rg

? Welche Aussage zu Kosten stimmt?
* RGs sind kostenlos, Ressourcen darin nicht
- RGs kosten pro Monat
- Nur Datenbanken kosten
- Alles ist kostenlos

? Was ist die Cloud Shell?
* Terminal im Azure-Portal
- Ein Storage-Typ
- Ein Datenbanktyp
- Eine VPN-Lösung

? Wie nennt man die Ebene über den Ressourcengruppen?
* Abonnement (Subscription)
- Container
- Tenant-Schlüssel
- Pool

? Welche Ebene steht über den Abonnements?
* Management Group
- Ressourcengruppe
- Region
- Cluster

? Welches PowerShell-Cmdlet löscht eine RG?
* Remove-AzResourceGroup
- Delete-AzGroup
- Clear-AzResource
- Drop-AzRG

## Lücken
- Die Azure-Hierarchie lautet Management Group, {Abonnement}, {Ressourcengruppe}, Ressource.
- Mit {az group delete} löscht man eine Ressourcengruppe per CLI.

## Reihenfolge
### Azure-Hierarchie (oben nach unten)
1. Management Group
2. Abonnement
3. Ressourcengruppe
4. Ressource

## Spickzettel
- MG → Abo → RG → Ressource; RG nicht verschachtelbar, RG kostenlos
- RG löschen = alles löschen; nach Labs aufräumen
- az group create/list/delete; New-/Get-/Remove-AzResourceGroup
- Cloud Shell: Bash oder PowerShell
