---
id: linux-l1-10-virtualisierung
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: L1
kapitel: Linux I – Grundlagen
titel: 1.10 Virtualisierung, Cloud und Container (Docker)
stufe: Fortgeschritten
quellen: [1.10_Linux_-_Virtualisierung_und_Container.pdf, LPI-Learning-Material-101-500-de.pdf]
verweise: [linux-101-102-6-virtualisierung, linux-l1-05-prozesse, linux-l2-19-ssh, az800-windows-container]
---

## Profi

### Einordnung
**102.6** Linux als Virtualisierungs-Gast (Gewicht 1) – im LPIC-1 nur **Konzeptwissen**. KVM/libvirt und Docker gehören zu **LPIC-3 305** und werden hier als Praxis-Vertiefung behandelt.

### VM vs. Container
| Kriterium | Virtuelle Maschine | Container |
|---|---|---|
| virtualisiert | die **komplette Hardware** | das **Betriebssystem** |
| Kernel | **eigener** Gast-Kernel je VM | **mit dem Host geteilt** |
| Größe | Gigabyte | Megabyte |
| Start | Minuten | Sekunden |
| Isolation | sehr stark | leichter (gleicher Kernel) |
| Einsatz | volle Isolation, andere Betriebssysteme | Microservices, CI/CD |
Bild: VM = Hardware → Hypervisor → [Gast-OS | Gast-OS]; Container = Hardware → Host-OS/Kernel → Container-Engine → [App | App | App]. Ein Linux-Container kann **kein Windows** ausführen, eine VM schon.

### Hypervisor
| | Typ 1 (bare metal) | Typ 2 (hosted) |
|---|---|---|
| läuft auf | direkt auf der Hardware | auf einem normalen Betriebssystem |
| Beispiele | **KVM**, Xen, VMware ESXi, Hyper-V | VirtualBox, VMware Workstation |
| Einsatz | Server, Rechenzentrum, Cloud | Desktop, Test, Entwicklung |
**KVM** ist ein **Kernel-Modul** (`kvm`, `kvm_intel`/`kvm_amd`) und macht Linux selbst zum Typ-1-Hypervisor; Voraussetzung **CPU-Virtualisierung VT-x / AMD-V** (Flags `vmx`/`svm` in `/proc/cpuinfo`). **Paravirtualisierung** (z. B. Xen-PV, virtio): der Gast weiß, dass er virtualisiert ist, und nutzt optimierte Schnittstellen.

### IaaS-Cloud
**IaaS** (Infrastructure as a Service) liefert virtuelle Infrastruktur auf Abruf: **Compute-Instanzen** (vCPU/RAM), **Block-Storage** (virtuelle Platten, an Instanzen anhängbar), **Networking** (virtuelle Netze, IP-Adressen, Firewalls/Security Groups). Instanzen werden aus **System-Images/Templates** ausgerollt – immer gleich, beliebig oft; Skalierung = weitere Instanzen aus demselben Image. (PaaS/SaaS = höhere Ebenen.)

### Klonen und eindeutige Merkmale
Wird ein System geklont oder als Template genutzt, müssen eindeutige Merkmale **neu erzeugt** werden:
- **SSH-Host-Keys** (`/etc/ssh/ssh_host_*`) – sonst sind alle Klone kryptografisch identisch: `rm /etc/ssh/ssh_host_*` + `dpkg-reconfigure openssh-server` bzw. `ssh-keygen -A`.
- **D-Bus-/systemd-machine-id** (`/etc/machine-id`, oft verlinkt `/var/lib/dbus/machine-id`): `truncate -s 0 /etc/machine-id` (wird beim nächsten Boot neu erzeugt) bzw. `systemd-machine-id-setup`.
- **Hostname**, statische IP-Adressen, MAC-Adressen, ggf. Benutzerpasswörter/Zertifikate.
- **cloud-init** erledigt das beim **ersten Start** einer Cloud-Instanz automatisch (Hostname, SSH-Keys, Benutzer, Pakete aus `user-data`).

### Guest-Integration
**Gasttreiber/Gast-Erweiterungen** integrieren Linux mit dem Virtualisierungsprodukt: **virtio** (paravirtualisierte Treiber für schnelles Netz `virtio_net` und Disk `virtio_blk` → `/dev/vda`), **qemu-guest-agent** (sauberes Herunterfahren, IP abfragen), VirtualBox Guest Additions, Hyper-V-Integrationsdienste (`hv_*`-Module), open-vm-tools. Konsole per **VNC** oder **SPICE**. Ohne virtio emuliert QEMU echte Hardware – funktioniert, aber langsamer.

### KVM, QEMU, libvirt
**KVM** liefert die Beschleunigung, **QEMU** emuliert die virtuelle Hardware, **libvirt** die einheitliche Verwaltung (`virsh`, `virt-manager`): `virsh list --all`, `virsh start db01`, `virsh shutdown`, `virsh console`.

### Container-Grundlagen
Ein Container ist ein **isolierter Prozess** auf dem Host – kein eigenes Betriebssystem. Drei Kernel-Bausteine:
- **Namespaces** – Isolation (PID, Netzwerk, Mount, UTS/Hostname, IPC, User).
- **cgroups** – Ressourcengrenzen (CPU, RAM, I/O) – bekannt aus 1.05.
- **OverlayFS** – Image-Schichten (Layer) + beschreibbare Container-Schicht.
**Systemcontainer** (LXC/LXD: ganzes Userland mit init) vs. **Anwendungscontainer** (Docker/Podman: ein Hauptprozess).

### Docker (Praxis)
| Begriff | Bedeutung |
|---|---|
| `docker` (CLI) | Client |
| `dockerd` | Daemon, verwaltet alles |
| **Image** | unveränderliche Vorlage (Bauplan, read-only) |
| **Container** | laufende Instanz eines Images mit eigener Schreibschicht |
| **Registry** | Image-Speicher (Docker Hub) |
Ablauf: `docker run` → Client fragt Daemon → Daemon holt das Image aus der Registry (`pull`) → startet den Container.
- **Befehle**: `docker run -d --name web -p 8080:80 nginx`, `docker run -it ubuntu bash`, `docker ps -a`, `docker exec -it web bash`, `docker logs web`, `docker stop`/`rm`, `docker images`, `docker pull`.
- **Dockerfile**: `FROM` (Basis), `RUN` (beim Bauen), `COPY` (Dateien ins Image), `CMD` (Startbefehl), dazu `EXPOSE`, `ENV`, `WORKDIR`. Jede Zeile = **Layer** (gecacht). `docker build -t meinapp:1.0 .`
- **Volumes**: Container sind **flüchtig** → persistente Daten in Volumes (`docker volume create dbdata`, `-v dbdata:/var/lib/mysql`); **Port-Mapping** `-p Host:Container`; Standard-Netz = **Bridge**.
- **docker compose**: mehrere Container deklarativ in **`compose.yaml`** (Services, Ports, Volumes, Abhängigkeiten); `docker compose up -d`, `down`.
- **Best Practices**: kleine Basis-Images (alpine, -slim), ein Hauptprozess pro Container, Konfiguration über Umgebungsvariablen, **konkrete Tags statt `latest`**, `.dockerignore`. **Podman** (Red Hat): Docker-kompatibel, **daemonlos und rootless**. Orchestrierung mehrerer Container → **Kubernetes** (LPIC-3/DevOps).

## Einfach

Stell dir einen **großen Bürokomplex** vor (der echte Computer).

Eine **virtuelle Maschine** ist wie ein **komplettes Fertighaus**, das man **in die Halle stellt**: mit eigenem Fundament, eigener Heizung, eigenem Strom (eigenes Betriebssystem und eigener Kernel). Sehr gut abgetrennt – aber **schwer** und es dauert, bis es steht. Der **Hypervisor** ist der **Hallenmeister**, der den Häusern Platz, Strom und Wasser zuteilt.
- **Typ 1** ist ein Hallenmeister, der **direkt** in der leeren Halle arbeitet (KVM, ESXi, Hyper-V) – für Rechenzentren.
- **Typ 2** wohnt selbst in einem Haus und baut **daneben** kleine Häuser auf (VirtualBox) – für zu Hause zum Testen.

Ein **Container** ist eher wie ein **Büro-Abteil mit Stellwänden** im selben Gebäude: Alle teilen sich **Fundament, Heizung und Strom** (den Kernel des Host-Rechners), aber jeder hat seine eigene Ecke mit Schreibtisch und Ordnern. Darum ist ein Container **leicht** und **in Sekunden** aufgebaut.

Ein **Image** ist der **Bauplan** für so ein Abteil, ein **Container** das **fertig eingerichtete Abteil**. Aus einem Bauplan kann man hundert gleiche Abteile machen. Wenn man ein Abteil abreißt, ist alles darin weg – darum stellt man wichtige Ordner in einen **Schrank außerhalb** (Volume).

Die **Cloud** ist wie ein **Vermieter von Hallen**: Du sagst „Ich brauche 3 Häuser mit je 4 Zimmern, eine große Garage (Speicher) und eine Straße dazwischen (Netzwerk)“, und er baut es dir sofort aus seinem **Musterhaus-Katalog** (Images).

Wichtig beim **Kopieren eines Hauses**: Jedes Haus braucht **eigene Schlüssel** (SSH-Host-Keys) und eine **eigene Hausnummer** (machine-id, Hostname). Sonst passen alle Schlüssel in alle Häuser! **cloud-init** ist der **Hausmeister**, der beim ersten Einzug automatisch neue Schlüssel macht und das Namensschild aufhängt.

## Merksatz
- **VM = ganzes Haus mit eigenem Kernel, Container = Abteil mit geteiltem Kernel**.
- **Typ 1 = direkt auf Blech, Typ 2 = auf einem Betriebssystem**.
- **KVM = Kernel-Modul, QEMU = Hardware-Emulator, libvirt = Bedienung**.
- **Klonen: SSH-Host-Keys + machine-id + Hostname neu**.
- **cloud-init = erster Start in der Cloud**.
- **Namespaces isolieren, cgroups begrenzen**.
- **Image = Bauplan, Container = laufende Kopie, Volume = Schrank für Daten**.

## Prüfungsfalle
- Container haben **keinen eigenen Kernel**.
- **KVM ist Typ 1**, obwohl es in einem „normalen“ Linux läuft – es ist Teil des Kernels.
- Beim Klonen reicht ein neuer Hostname **nicht** – SSH-Host-Keys und machine-id müssen neu.
- **cloud-init** (nicht „cloud-config“ oder „firstboot“) ist das LPIC-Stichwort.
- 102.6 hat nur **Gewicht 1** und verlangt **Konzepte**, keine Docker-Befehle.
- `docker build` baut ein Image, **`docker run`** startet einen Container, `docker pull` lädt nur.
- **CMD** legt den Startbefehl fest, **RUN** läuft beim Bauen.
- Ohne Volume sind Daten beim **Löschen** des Containers verloren.

## Grafik

### docker run nginx
1. Admin -> docker: `docker run -d -p 8080:80 nginx`
2. docker -> dockerd: Auftrag an den Daemon
3. dockerd -> Registry: Image nginx:latest nicht lokal – pull
4. Registry -> dockerd: Layer werden geladen
5. dockerd -> Kernel: Namespaces und cgroups anlegen
6. dockerd -> Container: startet Prozess nginx
7. Client -> Container: Zugriff über Host-Port 8080

### Template klonen
1. Template -> VM1: Klon wird erstellt
2. VM1: hat dieselben SSH-Host-Keys und machine-id
3. cloud-init -> VM1: erster Start erkannt
4. cloud-init -> VM1: neue SSH-Host-Keys, neue machine-id
5. cloud-init -> VM1: Hostname und Benutzer aus user-data
6. VM1: eindeutig und einsatzbereit

### VM- und Container-Stapel
1. Hardware: CPU, RAM, Platten
2. Hardware -> Hypervisor: Typ 1 verteilt Ressourcen
3. Hypervisor -> Gast-OS: jede VM mit eigenem Kernel
4. Hardware -> Host-Kernel: Container-Variante
5. Host-Kernel -> Container: geteilter Kernel, isolierte Prozesse

## Lab
**Maschine**: debian01 (VM oder Host mit Internet). Für KVM wird ein Host mit VT-x/AMD-V bzw. verschachtelter Virtualisierung benötigt.
```bash
# auf debian01 – bin ich ein Gast? Welche Virtualisierung?
systemd-detect-virt; lscpu | grep -i -E "hypervisor|virtualization"
grep -c -E "vmx|svm" /proc/cpuinfo        # > 0 = Host kann KVM
lsmod | grep -E "virtio|hv_|vbox|kvm"

# auf debian01 – eindeutige Merkmale ansehen (Klon-Vorbereitung)
cat /etc/machine-id; hostnamectl; ls /etc/ssh/ssh_host_*
# Vorbereitung eines Templates (nur auf einer Template-VM ausführen!):
# sudo rm /etc/ssh/ssh_host_* && sudo truncate -s 0 /etc/machine-id
# beim Klon: sudo ssh-keygen -A ; sudo systemd-machine-id-setup ; sudo hostnamectl set-hostname debian02

# auf debian01 – Docker (Praxis)
sudo apt install -y docker.io docker-compose-v2 2>/dev/null || sudo apt install -y docker.io
sudo usermod -aG docker $USER     # danach neu anmelden
docker run --rm hello-world
docker run -d --name web -p 8080:80 nginx:1.27; docker ps; curl -s localhost:8080 | head -3
docker exec -it web bash -c "nginx -v"; docker logs web | tail -3
docker volume create dbdata; docker volume ls
mkdir -p ~/app && cd ~/app
printf 'FROM python:3.12-slim\nCOPY app.py /app/\nCMD ["python", "/app/app.py"]\n' > Dockerfile
echo 'print("Hallo aus dem Container")' > app.py
docker build -t meinapp:1.0 . && docker run --rm meinapp:1.0
printf 'services:\n  web:\n    image: nginx:1.27\n    ports: ["8081:80"]\n' > compose.yaml
docker compose up -d && docker compose ps && docker compose down
docker stop web && docker rm web

# auf einem KVM-Host (optional) – libvirt
# sudo apt install -y qemu-system-x86 libvirt-daemon-system virtinst; virsh list --all
```

## Befehle
- `systemd-detect-virt` – erkennt, ob und unter welchem Hypervisor das System läuft
- `grep -E "vmx|svm" /proc/cpuinfo` – CPU-Virtualisierung vorhanden?
- `cat /etc/machine-id` – eindeutige Maschinen-ID
- `ssh-keygen -A` – fehlende SSH-Host-Keys erzeugen
- `systemd-machine-id-setup` – machine-id neu erzeugen
- `virsh list --all` – VMs unter libvirt auflisten
- `virsh start name` – VM starten
- `docker run -d --name web -p 8080:80 nginx` – Container im Hintergrund mit Port-Mapping
- `docker run -it ubuntu bash` – interaktiver Container mit Shell
- `docker ps -a` – alle Container anzeigen
- `docker exec -it web bash` – Shell in laufendem Container
- `docker logs web` – Ausgaben eines Containers
- `docker build -t name:tag .` – Image aus Dockerfile bauen
- `docker images` – lokale Images
- `docker volume create name` – Volume anlegen
- `docker compose up -d` – Multi-Container-App starten
- `docker compose down` – Multi-Container-App stoppen und aufräumen
- `podman run …` – Docker-kompatibel, daemonlos

## Übungen
- A: Was teilen sich Container im Gegensatz zu VMs? (Anwendung, Host-Kernel, IP-Adresse, nichts) | L: Den Host-Kernel – deshalb sind sie kleiner und starten schneller.
- A: KVM ist ein Hypervisor welchen Typs? | L: Typ 1 – im Linux-Kernel integriert.
- A: Was muss bei einem geklonten System neu erzeugt werden? | L: SSH-Host-Keys und machine-id (dazu Hostname), sonst sind alle Klone identisch.
- A: Welches Werkzeug konfiguriert Cloud-Instanzen automatisch beim ersten Start? | L: cloud-init (Hostname, SSH-Keys, Benutzer …).
- A: Womit startet man einen Container aus einem Image? (docker build, docker run, docker ps, docker pull) | L: docker run
- A: Welche Dockerfile-Anweisung legt den Startbefehl fest? (FROM, RUN, CMD, COPY) | L: CMD
- A: Wofür dienen Docker-Volumes? | L: Für persistente Daten außerhalb des flüchtigen Containers.
- A: Mit welcher Datei beschreibt man eine Multi-Container-App deklarativ? | L: compose.yaml (bzw. docker-compose.yml), Start mit docker compose up.
- A: Nenne die drei IaaS-Grundbausteine. | L: Compute-Instanzen, Block-Storage, Networking.

## Karteikarten
- F: Was virtualisiert eine VM und was ein Container? | A: Die VM virtualisiert die Hardware (eigenes OS + Kernel), der Container das Betriebssystem (geteilter Host-Kernel).
- F: Was ist ein Typ-1-Hypervisor? | A: Ein Hypervisor, der direkt auf der Hardware läuft (KVM, Xen, ESXi, Hyper-V).
- F: Was ist ein Typ-2-Hypervisor? | A: Ein Hypervisor, der als Anwendung auf einem Betriebssystem läuft (VirtualBox, VMware Workstation).
- F: Welche CPU-Funktion braucht KVM? | A: Hardware-Virtualisierung Intel VT-x (vmx) bzw. AMD-V (svm).
- F: Was sind die Bausteine einer IaaS-Cloud? | A: Compute-Instanzen, Block-Storage und virtuelle Netzwerke.
- F: Welche Merkmale müssen beim Klonen neu erzeugt werden? | A: SSH-Host-Keys, machine-id (D-Bus), Hostname, ggf. IP/MAC.
- F: Was macht cloud-init? | A: Konfiguriert eine Cloud-Instanz beim ersten Start (Hostname, SSH-Keys, Benutzer, Pakete).
- F: Was ist virtio? | A: Paravirtualisierte Gasttreiber für schnelle Netz- und Plattenzugriffe in KVM/QEMU.
- F: Welche Aufgaben haben KVM, QEMU und libvirt? | A: KVM = Beschleunigung im Kernel, QEMU = Hardware-Emulation, libvirt = Verwaltung (virsh, virt-manager).
- F: Welche Kernel-Techniken nutzen Container? | A: Namespaces (Isolation), cgroups (Ressourcengrenzen), OverlayFS (Layer).
- F: Unterschied Image und Container? | A: Image = unveränderliche Vorlage; Container = laufende Instanz mit eigener Schreibschicht.
- F: Was bewirkt -p 8080:80 bei docker run? | A: Host-Port 8080 wird auf Port 80 im Container weitergeleitet.
- F: Was ist Podman? | A: Docker-kompatible Container-Engine von Red Hat, daemonlos und rootless.

## Quiz
? Was teilen sich Container im Gegensatz zu virtuellen Maschinen?
* Den Kernel des Hosts
- Die Anwendung
- Die IP-Adresse
- Nichts

? Zu welchem Typ gehört KVM?
* Typ 1 (im Kernel, bare metal)
- Typ 2 (hosted)
- Container-Engine
- Cloud-Dienst

? Welches Werkzeug ist ein Typ-2-Hypervisor?
* VirtualBox
- KVM
- Xen
- VMware ESXi

? Was muss bei einem geklonten Linux-System unbedingt neu erzeugt werden?
* SSH-Host-Keys und machine-id
- Der Kernel
- Das BIOS
- Die Partitionstabelle

? Welches Werkzeug richtet Cloud-Instanzen beim ersten Start automatisch ein?
* cloud-init
- systemd-firstboot-cloud
- dpkg-reconfigure
- virsh

? Welche Kernel-Funktion begrenzt CPU und RAM eines Containers?
* cgroups
- Namespaces
- OverlayFS
- udev

? Welcher Befehl startet einen Container aus einem Image?
* docker run
- docker build
- docker pull
- docker images

? Welche Dockerfile-Anweisung wird beim Start des Containers ausgeführt?
* CMD
- RUN
- FROM
- COPY

? Wofür nutzt man Docker-Volumes?
* Für persistente Daten außerhalb des Containers
- Um Ports freizugeben
- Um Images zu bauen
- Um Container zu beschleunigen

? Was sind virtio-Treiber?
* Paravirtualisierte Gasttreiber für schnelle Netz- und Plattenzugriffe
- Treiber für USB-Sticks
- Container-Images
- Ein Hypervisor vom Typ 2

## Spickzettel
- VM: eigenes OS + Kernel, GB, Minuten · Container: geteilter Kernel, MB, Sekunden
- Typ 1: KVM, Xen, ESXi, Hyper-V · Typ 2: VirtualBox, VMware Workstation
- KVM braucht VT-x/AMD-V (vmx/svm) · KVM + QEMU + libvirt (virsh)
- IaaS: Compute · Block-Storage · Netzwerk · Images/Templates
- Klon: SSH-Host-Keys + /etc/machine-id + Hostname neu · cloud-init
- Gasttreiber: virtio, qemu-guest-agent, Guest Additions, hv_*
- Container: Namespaces + cgroups + OverlayFS
- docker run -d -p · ps · exec -it · logs · build -t · volume · compose up/down
- Dockerfile: FROM RUN COPY CMD · Podman = rootless
