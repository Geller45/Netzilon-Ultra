---
id: linux-101-102-6-virtualisierung
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1]
block: LPIC-101
kapitel: LPIC-1 Prüfung 101 – Linux-Installation und Paketverwaltung
titel: 102.6 Linux als Gast von Virtualisierung und Cloud
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-101-500-de.pdf, 1.10_Linux_-_Virtualisierung_und_Container.pdf]
verweise: [linux-l1-10-virtualisierung, linux-101-101-1-hardware]
---

## Profi

### Lernziel (Gewicht 1)
Konzepte von Virtualisierung und Cloud verstehen und Linux als Gast betreiben.

### Virtualisierung
- **Hypervisor Typ 1** (bare metal: KVM, Xen, VMware ESXi, Hyper-V) läuft direkt auf der Hardware; **Typ 2** (hosted: VirtualBox, VMware Workstation) läuft auf einem Host-Betriebssystem. **KVM** ist Teil des Linux-Kernels (Module `kvm`, `kvm_intel`/`kvm_amd`), Verwaltung mit **libvirt** (`virsh`), QEMU als Emulator. Hardware-Unterstützung: Intel VT-x / AMD-V (`grep -E 'vmx|svm' /proc/cpuinfo`).
- **Paravirtualisierung** (virtio, Gast kennt den Hypervisor, schneller) vs. **Vollvirtualisierung**. Gasttreiber/Tools: `qemu-guest-agent`, `open-vm-tools`, `hyperv-daemons`.
- **Container** (LXC, Docker, Podman) teilen sich den Host-**Kernel**, isoliert durch **Namespaces** und **cgroups** – leichtgewichtiger als VMs, aber weniger isoliert.

### Linux als Gast – Besonderheiten
- **Maschinen-ID / UUID / SSH-Hostkeys** nach dem Klonen neu erzeugen: `/etc/machine-id` leeren, `ssh-keygen -A`, Hostname und MAC/Netz anpassen. `dbus-uuidgen` für die D-Bus-ID. Disk-Images: qcow2, VMDK, VHDX, `qemu-img`.
- **Cloud**: IaaS/PaaS/SaaS; Instanzen werden per **cloud-init** (`/etc/cloud/`) beim ersten Start konfiguriert (SSH-Keys, Hostname, Pakete). Persistenter Speicher als Blockdevice (Volumes), Netze/Sicherheitsgruppen, Images als Vorlagen. **Infrastructure as Code**: Terraform, Ansible.

## Einfach

Eine **virtuelle Maschine** (VM) ist ein **Computer im Computer**. Stell dir einen großen Mietshaus-Besitzer vor: Statt für jeden Mieter ein eigenes Haus zu bauen, teilt er ein großes Haus in Wohnungen. Jede Wohnung sieht für den Mieter wie ein eigenes Haus aus. Der Hausverwalter, der die Wohnungen vergibt, heißt **Hypervisor**.

Es gibt zwei Arten: Der Verwalter ist selbst das Fundament (Typ 1, z. B. KVM, ESXi) oder er wohnt in einer Wohnung und vermietet Untermiete (Typ 2, z. B. VirtualBox).

**Container** (Docker, Podman) sind dagegen **Zimmer in einer Wohngemeinschaft**: Alle teilen sich die Küche (den Kernel), aber jeder hat sein eigenes Zimmer und seinen Schrank. Das ist leichter und schneller als eine eigene Wohnung, aber weniger gut abgeschottet.

Wenn du eine VM **kopierst**, haben Original und Kopie plötzlich denselben Personalausweis (Maschinen-ID, SSH-Schlüssel). Den musst du ändern, sonst gibt es Verwirrung im Netz.

Die **Cloud** ist wie Wohnungen **mieten, statt zu bauen**: Du bestellst per Klick eine Linux-Maschine, und ein Zettel namens **cloud-init** richtet sie beim ersten Einschalten automatisch für dich ein – mit deinem SSH-Schlüssel und deinem Namen.

## Merksatz
- **Typ 1 = auf der Hardware, Typ 2 = auf dem Betriebssystem.**
- **VM hat eigenen Kernel, Container teilt den Host-Kernel.**
- **KVM = Kernelmodul + QEMU + libvirt.**
- **Klon → machine-id und SSH-Hostkeys neu.**
- **cloud-init konfiguriert Cloud-Instanzen beim ersten Start.**

## Prüfungsfalle
- Container haben **keinen eigenen Kernel** (VMs schon).
- VirtualBox ist Typ 2, KVM/Xen/ESXi Typ 1.
- CPU-Flags: `vmx` = Intel VT-x, `svm` = AMD-V.
- Geklonte VMs brauchen neue **machine-id** und SSH-Hostkeys.
- Namespaces isolieren, **cgroups begrenzen** Ressourcen.

## Grafik

### Hypervisor-Typen
1. Hardware: Typ 1 – Hypervisor läuft direkt auf der Hardware
2. Hypervisor -> VM1: eigener Linux-Kernel im Gast
3. Hypervisor -> VM2: eigener Kernel, eigenes Betriebssystem
4. Host-OS: Typ 2 – Hypervisor als normale Anwendung im Host
5. Container: teilen den Host-Kernel, isoliert per Namespaces

## Lab
**Maschine**: debian01 (KVM-fähig).
```bash
# auf debian01
grep -E -c 'vmx|svm' /proc/cpuinfo
lsmod | grep kvm
sudo apt install qemu-kvm libvirt-daemon-system
virsh list --all
qemu-img create -f qcow2 disk.qcow2 10G
# nach Klonen:
sudo truncate -s 0 /etc/machine-id && sudo ssh-keygen -A
```

## Befehle
- `virsh list --all` – VMs anzeigen
- `qemu-img create -f qcow2 d.qcow2 10G` – Image anlegen
- `grep -E 'vmx|svm' /proc/cpuinfo` – CPU-Virtualisierung prüfen
- `systemd-detect-virt` – Virtualisierung erkennen
- `ssh-keygen -A` – Hostkeys neu erzeugen

## Übungen
- A: Woran erkennst du Intel VT-x? | L: Flag vmx in /proc/cpuinfo.
- A: Welcher Hypervisor-Typ ist VirtualBox? | L: Typ 2.
- A: Was musst du nach dem Klonen einer VM anpassen? | L: machine-id, SSH-Hostkeys, Hostname/Netzwerk.
- A: Womit konfiguriert man Cloud-Instanzen beim ersten Start? | L: cloud-init

## Karteikarten
- F: Was ist ein Hypervisor? | A: Software, die VMs erzeugt und Hardware zuteilt.
- F: Typ-1-Hypervisor Beispiele? | A: KVM, Xen, VMware ESXi, Hyper-V.
- F: Wodurch unterscheiden sich Container und VMs? | A: Container teilen den Host-Kernel, VMs haben einen eigenen.
- F: Welche Linux-Funktionen isolieren Container? | A: Namespaces und cgroups.
- F: Was ist libvirt? | A: Verwaltungs-API/Toolkit für Hypervisoren (virsh).
- F: Was ist virtio? | A: Paravirtualisierte Treiber für schnelle Gerätezugriffe.
- F: Was macht cloud-init? | A: Initialisiert Cloud-Instanzen beim ersten Start.
- F: Was ist qcow2? | A: Image-Format von QEMU (Copy-on-Write, Snapshots).

## Quiz
? Welcher Hypervisor ist Typ 2?
* VirtualBox
- KVM
- ESXi
- Xen

? Welches CPU-Flag steht für AMD-V?
* svm
- vmx
- smx
- lm

? Was teilen sich Container?
* Den Kernel des Hosts
- Das Dateisystem des Gastes
- Die BIOS-Firmware
- Den Hypervisor

? Welche Technik begrenzt Ressourcen von Containern?
* cgroups
- ACLs
- sudo
- chroot

? Was sollte nach dem Klonen einer Linux-VM erneuert werden?
* machine-id und SSH-Hostkeys
- Der Kernel
- Die BIOS-Version
- Das Root-Passwort des Hosts

? Wofür steht cloud-init?
* Automatische Erstkonfiguration von Cloud-Instanzen
- Ein Container-Format
- Ein Bootloader
- Ein Hypervisor

? Welches Tool verwaltet KVM-VMs per Kommandozeile?
* virsh
- vmctl
- kvmadm
- docker

? Welches Dateiformat gehört zu QEMU?
* qcow2
- vhdx
- ova
- iso9660

## Spickzettel
- Typ 1: KVM/Xen/ESXi · Typ 2: VirtualBox
- vmx = Intel · svm = AMD
- Container: Namespaces + cgroups, Host-Kernel
- Klon: machine-id, ssh-keygen -A
- cloud-init · virsh · qemu-img
