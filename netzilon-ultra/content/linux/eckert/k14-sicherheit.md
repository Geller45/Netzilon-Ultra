---
id: linux-eckert-k14-sicherheit-troubleshooting
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: CompTIA Linux+ / LPIC-1 (Eckert)
kapitel: Eckert – CompTIA Linux+ and LPIC-1 (6th Edition)
titel: Kap. 14 Sicherheit, Fehlerbehebung und Performance
stufe: Fortgeschritten
quellen: [Eckert_J._W._and_triOS_College_-_CompTIA_Linux_and_LPIC-1_6th_Edition_-_2024.pdf]
verweise: [linux-102-110-1-sicherheit-admin,linux-102-110-2-absichern,linux-102-109-3-netzprobleme]
---

## Profi

### Lokale Sicherheit
Zugriff beschränken (physisch, BIOS/GRUB-Passwort, Bildschirmsperre), **Root-Nutzung minimieren** (`sudo` mit `visudo`, `su -`), starke Passwörter/Richtlinien (`pam`, `chage`), **Dateiverschlüsselung** (LUKS, `gpg`, `openssl`), sichere Administration (SSH-Schlüssel, `PermitRootLogin no`, Updates, Least Privilege). **Polkit** für grafische Rechtevergabe.

### Netzwerksicherheit
Unnötige Dienste stoppen, Verkehr verschlüsseln (TLS/SSH), Zugriff einschränken (**TCP-Wrapper** `hosts.allow/deny`, Dienstkonfiguration), sichere Dateirechte, **Standardports ändern**, Software aktuell halten, **Schwachstellenscans** (`nmap`, OpenVAS), **Firewalls** (`nftables`, `iptables`, `firewalld`, `ufw`), **SELinux** (Modi enforcing/permissive/disabled; `getenforce`, `setenforce`, `sestatus`, `chcon`, `restorecon`, `semanage`; Kontext `ls -Z`) bzw. **AppArmor** (`aa-status`, `aa-complain`, `aa-enforce`, `aa-disable`). Intrusion Detection, `fail2ban`, Audit (`auditd`).

### Wartung und Dokumentation
**Proaktive Wartung** (Überwachung, Patches, Backups testen) vs. **reaktive Wartung**. Systeminformationen und Änderungen dokumentieren, Baseline erstellen.

### Troubleshooting-Methodik
1. Problem identifizieren/Daten sammeln, 2. Theorie aufstellen, 3. Theorie testen, 4. Plan erstellen und umsetzen, 5. Funktion verifizieren, 6. dokumentieren. Quellen: Logs (`journalctl`, `/var/log`), `dmesg`, `strace`, `lsof`.

### Typische Problemklassen
- **Hardware**: Peripherie, Karten, RAM (`memtest`), Speicher (`smartctl`), Module.
- **Anwendungen**: fehlende Abhängigkeiten, Rechte-/Kontext-Beschränkungen, Ressourcenkonflikte.
- **Dateisystem**: Quota- und Dateisystemlimits, volle Inodes (`df -i`), Korruption (`fsck`), Bad Blocks.
- **Netzwerk**: Konnektivität, DNS, Firewall, Latenz (`ping`, `mtr`, `iperf`).

### Performance
Faktoren: RAM, CPU, Speicherdurchsatz, Prozesslast. Werkzeuge im **sysstat**-Paket: `sar`, `iostat`, `mpstat`, `pidstat`; außerdem `vmstat`, `top`, `free`, `uptime` (Load Average), `iotop`, `ioping`. Baseline vergleichen.

## Einfach

Sicherheit besteht aus vielen kleinen Schutzschichten, wie bei einer Burg: Mauer, Graben, Wachen.

**Auf dem Rechner selbst:** Nutze root so selten wie möglich, arbeite mit `sudo`, verschlüssele sensible Dateien und halte alles aktuell. **Im Netzwerk:** Schalte jeden Dienst ab, den du nicht brauchst (weniger Türen = weniger Einbrüche). Verschlüssele Verbindungen, nutze eine **Firewall** und scanne dein eigenes System mit `nmap`, um zu sehen, was ein Angreifer sehen würde. **SELinux** und **AppArmor** sind zusätzliche Wachleute: Selbst wenn ein Programm gehackt wird, dürfen sie ihm nur das erlauben, was im Regelbuch steht.

Als Admin überwachst du den Rechner (**proaktiv**: vor dem Problem) und beseitigst Probleme (**reaktiv**: danach). Alles Wichtige dokumentierst du.

Bei der **Fehlersuche** gehst du wie ein Detektiv vor: Daten sammeln (Logs, Meldungen), eine Vermutung aufstellen, testen, die Lösung umsetzen, prüfen, ob es klappt, und aufschreiben, was du getan hast. Typische Fehlerquellen: kaputte oder fehlende Hardware, fehlende Programmteile (Abhängigkeiten), volle Platten (oder volle Inodes!), Netzwerk-/DNS-Probleme.

Wenn der Rechner **langsam** ist, schaust du auf vier Dinge: CPU, Arbeitsspeicher, Plattengeschwindigkeit und Netzwerk. Werkzeuge wie `top`, `vmstat`, `iostat`, `sar` zeigen dir, wo es klemmt. Wer einen Normalzustand (Baseline) gemessen hat, erkennt Abweichungen sofort.

## Merksatz
- **Least Privilege, Updates, Firewall, SELinux/AppArmor.**
- **Troubleshooting: sammeln → vermuten → testen → umsetzen → prüfen → dokumentieren.**
- **Performance: CPU, RAM, I/O, Netz → top, vmstat, iostat, sar.**
- **Baseline vorher messen.**

## Prüfungsfalle
- SELinux `permissive` protokolliert nur, `enforcing` blockiert.
- `df` zeigt freien Platz, aber ein volles Dateisystem kann auch an **Inodes** liegen (`df -i`).
- `sysstat` liefert `sar`/`iostat`, nicht `top`.
- AppArmor-Profile haben Modi enforce und complain.
- Firewall und SELinux sind unabhängig voneinander.

## Grafik

### Troubleshooting-Zyklus
1. Admin: Problem erkennen, Daten sammeln
2. Admin: Ursache vermuten
3. Admin -> System: Vermutung testen
4. Admin -> System: Lösung umsetzen
5. Admin -> System: Funktion prüfen
6. Admin: Ergebnis dokumentieren

## Lab
**Maschine**: debian01 / fedora01.
```bash
getenforce; sestatus            # SELinux (Fedora)
sudo aa-status                  # AppArmor (Debian)
sudo nmap -sT localhost
df -h; df -i
vmstat 2 5
iostat -x 2 3
sar -u 2 3
journalctl -p err -b
```

## Befehle
- `getenforce` / `setenforce 0` – SELinux-Modus
- `aa-status` – AppArmor
- `nmap -sT host` – Portscan
- `df -i` – Inodes
- `vmstat 2 5` – System-Statistik
- `iostat -x` – Platten-I/O
- `sar -u` – CPU-Verlauf
- `strace -p PID` – Systemaufrufe

## Übungen
- A: Wie wechselst du SELinux temporär auf permissive? | L: `setenforce 0`
- A: Warum kann eine Platte „voll“ sein, obwohl df -h Platz zeigt? | L: Inodes aufgebraucht (`df -i`).
- A: Welches Paket enthält sar? | L: sysstat

## Karteikarten
- F: Was ist Least Privilege? | A: Nur minimal nötige Rechte vergeben.
- F: Was zeigt getenforce? | A: Aktuellen SELinux-Modus.
- F: Was ist AppArmor? | A: Pfadbasierte Mandatory-Access-Control (Debian/Ubuntu/SUSE).
- F: Was ist proaktive Wartung? | A: Vorbeugen, bevor Fehler auftreten.
- F: Was ist die erste Troubleshooting-Phase? | A: Problem identifizieren und Daten sammeln.
- F: Was zeigt iostat? | A: Auslastung und Durchsatz von Datenträgern.
- F: Was zeigt vmstat? | A: Speicher-, Prozess- und CPU-Statistik.
- F: Was ist ein Baseline? | A: Messwerte im Normalzustand zum Vergleich.
- F: Wofür steht sysstat? | A: Paket mit sar, iostat, mpstat, pidstat.
- F: Was prüft nmap? | A: Offene Ports und Dienste eines Hosts.

## Quiz
? Welcher SELinux-Modus blockiert Verstöße?
* Enforcing
- Permissive
- Disabled
- Audit

? Welcher Befehl zeigt Inode-Belegung?
* df -i
- df -h
- du -s
- lsblk -i

? Welches Paket enthält sar?
* sysstat
- procps
- iotop
- coreutils

? Was ist der erste Troubleshooting-Schritt?
* Problem identifizieren und Informationen sammeln
- Hardware austauschen
- Neu installieren
- Backup einspielen

? Was ist AppArmor?
* Mandatory Access Control mit Profilen
- Firewall
- Dateisystem
- Passwortmanager

? Welcher Befehl scannt Ports?
* nmap
- ping
- ssh
- arp

? Was misst iostat?
* Disk-I/O
- Netzwerklatenz
- Prozessanzahl
- Hostname

? Was bedeutet proaktive Wartung?
* Vorbeugend handeln
- Nach Ausfall reparieren
- Nichts tun
- Systeme löschen

## Lücken
- Mit {setenforce 0} wechselt SELinux in den Permissive-Modus.
- Das Paket {sysstat} enthält sar und iostat.
- Ein {Baseline} zeigt den Normalzustand.

## Spickzettel
- Least Privilege · sudo · SSH-Keys · Updates
- Firewall · SELinux/AppArmor · nmap
- Troubleshooting 6 Schritte
- top vmstat iostat sar · df -i
