---
id: linux-eckert-k13-netzwerkdienste-cloud
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: CompTIA Linux+ / LPIC-1 (Eckert)
kapitel: Eckert – CompTIA Linux+ and LPIC-1 (6th Edition)
titel: Kap. 13 Netzwerkdienste und Cloud-Technologien
stufe: Fortgeschritten
quellen: [Eckert_J._W._and_triOS_College_-_CompTIA_Linux_and_LPIC-1_6th_Edition_-_2024.pdf]
verweise: [linux-102-108-3-mta,linux-l1-10-virtualisierung]
---

## Profi

### Infrastrukturdienste
- **DHCP** (UDP 67/68; Lease; ISC `dhcpd`/Kea; Optionen Gateway, DNS; Reservierungen; Relay). **DNS** (UDP/TCP 53; **BIND** `named`, `unbound`; Zonen, Records A, AAAA, CNAME, MX, NS, PTR, SOA, TXT; Zonendateien; `rndc`). **NTP** (UDP 123; hierarchische **Stratum**-Ebenen; `chronyd` oder `ntpd`; `chronyc sources`).

### Anwendungsdienste
- **Web**: **Apache** (`httpd`/`apache2`, Document Root `/var/www/html`, `httpd.conf`/`sites-available`, VirtualHosts) und nginx; Port 80/443, HTTP/HTTPS, TLS-Zertifikate. 
- **Dateifreigabe**: **Samba** (SMB/CIFS; `smb.conf`, `smbpasswd`, `testparm`; Windows-Kompatibilität/AD) und **NFS** (`/etc/exports`, `exportfs -ra`, `mount -t nfs`; Linux/Unix).
- **Mail**: **Postfix** (`main.cf`, `postconf`, `mailq`), Aliase `/etc/aliases` + `newaliases`; Zustellung SMTP; Abruf IMAP/POP3 (Dovecot).
- **Datenbanken**: **PostgreSQL** (`psql`, `pg_hba.conf`, `postgresql.conf`, Port 5432), MariaDB/MySQL; **SQL**-Anweisungen (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE`).

### Container und Cloud
- **Container** (Isolation über Namespaces und cgroups) vs. VMs (eigener Kernel). **Docker**: `docker build/run/ps/images/pull/push/exec/stop/rm`, **Dockerfile**, **Image** vs. **Container**, **Registry** (Docker Hub), Volumes, Port-Mapping `-p 8080:80`. **Microservices**: jeder Dienst in eigenem Container. **Kubernetes**: Orchestrierung (Pods, Deployments, Services, Skalierung, Selbstheilung), `kubectl`.
- **Infrastructure as Code / Konfigurationsmanagement**: Ansible (agentenlos, YAML-Playbooks, SSH), Puppet, Chef, **Terraform**. **Virtualisierung**: Hypervisor Typ 1/2 (KVM, Xen, VMware, VirtualBox), `libvirt`/`virsh`.
- Cloud-Anbindung: **cloud-init**, Lieferung über IaaS/PaaS/SaaS; Skalierung, CI/CD.

## Einfach

Ein Netzwerk wird erst nützlich durch **Dienste**, die darauf laufen. Hier die wichtigsten:

- **DHCP** teilt Adressen aus („Du bekommst die 192.168.1.20“).
- **DNS** ist das Telefonbuch: Namen werden zu Adressen.
- **NTP** stellt die Uhr, damit alle Rechner dieselbe Zeit haben.
- **Apache** (oder nginx) liefert Webseiten aus. Die Dateien liegen im „Document Root“, meist `/var/www/html`.
- **Samba** lässt Windows-Rechner auf Linux-Freigaben zugreifen, **NFS** tut dasselbe für Linux/Unix.
- **Postfix** verschickt E-Mails.
- **PostgreSQL** speichert Daten in Tabellen, die du mit der Sprache **SQL** abfragst.

Dann kommt die **Cloud**. Statt Programme direkt auf einem Server zu installieren, packt man sie in **Container**. Das ist ein Paket, das ein Programm samt allem, was es braucht, enthält. Mit **Docker** baust du ein Image aus einer Bauanleitung (**Dockerfile**) und startest daraus Container. Ein Image ist die Vorlage, ein Container die laufende Kopie.

Große Anwendungen bestehen aus vielen kleinen Containern (**Microservices**). Damit niemand sie einzeln starten muss, übernimmt **Kubernetes** die Steuerung: Es startet, überwacht, ersetzt und vervielfacht Container automatisch. Werkzeuge wie **Ansible** und **Terraform** beschreiben Server und Netzwerke als Text, sodass man sie per Knopfdruck wiederherstellen kann.

## Merksatz
- **DHCP vergibt, DNS übersetzt, NTP stellt die Uhr.**
- **Samba = SMB/Windows, NFS = Unix.**
- **Image = Vorlage, Container = laufende Instanz.**
- **Kubernetes orchestriert Container.**

## Prüfungsfalle
- NTP kennt **Stratum**-Ebenen; Stratum 0 = Referenzuhr, niedrigere Zahl = näher an der Quelle.
- Container teilen den **Host-Kernel**; VMs haben eigenen Kernel.
- Nach Änderung von `/etc/exports`: `exportfs -ra`.
- Nach Änderung von `/etc/aliases`: `newaliases`.
- `docker run -p 8080:80` = Host-Port:Container-Port.

## Grafik

### Docker-Workflow
1. Entwickler -> Dockerfile: Bauanleitung schreiben
2. Entwickler -> Docker: docker build -t web .
3. Docker -> Registry: docker push web
4. Server -> Registry: docker pull web
5. Server -> Container: docker run -d -p 8080:80 web

## Lab
**Maschine**: debian01.
```bash
sudo apt install docker.io
sudo docker run -d --name web -p 8080:80 nginx
curl -I http://localhost:8080
sudo docker ps
sudo docker stop web && sudo docker rm web
chronyc sources
```

## Befehle
- `docker run -d -p 8080:80 nginx` – Container starten
- `docker ps` – laufende Container
- `docker images` – Images
- `docker exec -it name bash` – Shell im Container
- `kubectl get pods` – Pods anzeigen
- `exportfs -ra` – NFS neu laden
- `testparm` – Samba prüfen
- `chronyc tracking` – Zeitstatus

## Übungen
- A: Auf welchem Port lauscht PostgreSQL? | L: 5432
- A: Was ist der Unterschied Image/Container? | L: Image = Vorlage, Container = laufende Instanz daraus.
- A: Wo liegt der Document Root von Apache auf Debian? | L: /var/www/html

## Karteikarten
- F: Welche Ports nutzt DHCP? | A: UDP 67 (Server), 68 (Client).
- F: Welcher Port gehört zu NTP? | A: UDP 123.
- F: Was ist BIND? | A: Verbreiteter DNS-Server (named).
- F: Was ist chronyd? | A: NTP-Client/Server-Implementierung.
- F: Was ist ein Dockerfile? | A: Bauanleitung für ein Container-Image.
- F: Was ist Docker Hub? | A: Öffentliche Container-Registry.
- F: Was ist Kubernetes? | A: Orchestrierungssystem für Container.
- F: Was ist Ansible? | A: Agentenlose Automatisierung mit YAML-Playbooks.
- F: Was ist Terraform? | A: Infrastructure as Code (deklarativ).
- F: Welche Datei steuert NFS-Freigaben? | A: /etc/exports

## Quiz
? Welcher Dienst vergibt IP-Konfigurationen?
* DHCP
- DNS
- NTP
- SMTP

? Welcher Port gehört zu NTP?
* 123
- 53
- 25
- 80

? Was ist ein Container-Image?
* Vorlage zum Starten von Containern
- Laufender Container
- Ein Hypervisor
- Eine VM

? Welcher Befehl startet einen Container?
* docker run
- docker build
- docker pull
- docker tag

? Welcher Dienst teilt Dateien mit Windows?
* Samba
- NFS
- Postfix
- BIND

? Welche Datei konfiguriert NFS-Exporte?
* /etc/exports
- /etc/nfs.conf
- /etc/fstab
- /etc/samba/smb.conf

? Wozu dient Kubernetes?
* Orchestrierung von Containern
- Dateisystem
- DNS
- Backup

? Welche Aussage zu Containern stimmt?
* Sie teilen sich den Kernel des Hosts
- Sie haben immer eigenen Kernel
- Sie brauchen einen Hypervisor Typ 1
- Sie sind keine Prozesse

## Lücken
- {DNS} löst Namen in IP-Adressen auf.
- Ein {Container} ist die laufende Instanz eines Images.
- {Kubernetes} verwaltet viele Container.

## Spickzettel
- DHCP 67/68 · DNS 53 · NTP 123
- Apache /var/www/html · Samba smb.conf · NFS exports
- Postfix · PostgreSQL 5432
- docker build/run/ps · k8s · Ansible · Terraform
